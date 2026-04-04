import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import OpenAI from 'openai';
import { Logger } from '@nestjs/common';
import type { Langfuse } from 'langfuse';
import type { AgentToolsService } from './agent-tools.service';
import { AGENT_TOOLS } from './agent-tools.service';

const MAX_ITERATIONS = 3;
const MODEL = 'gpt-4o';

// ─── State ────────────────────────────────────────────────────────────────────

export const AgentStateAnnotation = Annotation.Root({
  userId: Annotation<number>(),
  language: Annotation<string>(),
  messages: Annotation<OpenAI.Chat.ChatCompletionMessageParam[]>({
    reducer: (curr, next) => [...curr, ...next],
    default: () => [],
  }),
  toolsUsed: Annotation<string[]>({
    reducer: (curr, next) => [...curr, ...next],
    default: () => [],
  }),
  iterations: Annotation<number>({
    reducer: (curr, next) => curr + next,
    default: () => 0,
  }),
  pendingToolCalls: Annotation<OpenAI.Chat.ChatCompletionMessageToolCall[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;

type LangfuseTrace = ReturnType<Langfuse['trace']> | null;

// ─── Graph factory ────────────────────────────────────────────────────────────

const logger = new Logger('AgentGraph');

export function buildAgentGraph(
  openai: OpenAI,
  toolsService: AgentToolsService,
  trace: LangfuseTrace = null,
) {
  // Node: Plan — first LLM call, reads user query and decides what tools to use
  async function planNode(state: AgentState): Promise<Partial<AgentState>> {
    const generation = trace?.generation({
      name: 'plan',
      model: MODEL,
      input: state.messages,
    });

    const response = (await openai.chat.completions.create({
      model: MODEL,
      messages: state.messages,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
    })) as OpenAI.Chat.ChatCompletion;

    const message = response.choices[0].message;
    const usage = response.usage;

    generation?.end({
      output: message,
      usage: {
        input: usage?.prompt_tokens,
        output: usage?.completion_tokens,
        total: usage?.total_tokens,
      },
    });

    return {
      messages: [message as OpenAI.Chat.ChatCompletionMessageParam],
      pendingToolCalls: message.tool_calls ?? [],
    };
  }

  // Node: ExecuteTools — runs all pending tool calls in parallel
  async function executeToolsNode(
    state: AgentState,
  ): Promise<Partial<AgentState>> {
    const results = await Promise.all(
      state.pendingToolCalls.map(async (toolCall) => {
        const rawArgs = toolCall.function.arguments;

        let args: Record<string, unknown>;
        try {
          args = JSON.parse(rawArgs) as Record<string, unknown>;
        } catch (parseError) {
          const errMsg =
            parseError instanceof Error ? parseError.message : 'Unknown error';
          const span = trace?.span({
            name: `tool:${toolCall.function.name}`,
            input: rawArgs,
          });
          span?.end({ output: { error: errMsg }, level: 'ERROR' });
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: `Error: Invalid tool arguments: ${errMsg}`,
          };
        }

        const span = trace?.span({
          name: `tool:${toolCall.function.name}`,
          input: args,
        });

        try {
          const result = await toolsService.executeTool(
            state.userId,
            toolCall.function.name,
            args,
          );
          span?.end({ output: result });
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          };
        } catch (error) {
          const errMsg =
            error instanceof Error ? error.message : 'Unknown error';
          logger.error(
            `Tool execution failed: ${toolCall.function.name}`,
            error instanceof Error ? error.stack : String(error),
          );
          span?.end({ output: { error: errMsg }, level: 'ERROR' });
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: 'Error: Tool execution failed.',
          };
        }
      }),
    );

    return {
      messages: results,
      toolsUsed: state.pendingToolCalls.map((tc) => tc.function.name),
      iterations: 1,
      pendingToolCalls: [],
    };
  }

  // Node: Reflect — reviews tool results, decides if more tools needed or ready to respond
  async function reflectNode(state: AgentState): Promise<Partial<AgentState>> {
    const generation = trace?.generation({
      name: `reflect-${state.iterations}`,
      model: MODEL,
      input: state.messages,
    });

    const response = (await openai.chat.completions.create({
      model: MODEL,
      messages: state.messages,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
    })) as OpenAI.Chat.ChatCompletion;

    const message = response.choices[0].message;
    const usage = response.usage;

    generation?.end({
      output: message,
      usage: {
        input: usage?.prompt_tokens,
        output: usage?.completion_tokens,
        total: usage?.total_tokens,
      },
    });

    return {
      messages: [message as OpenAI.Chat.ChatCompletionMessageParam],
      pendingToolCalls: message.tool_calls ?? [],
    };
  }

  // Node: Respond — terminal node, state already contains the final assistant message
  function respondNode(): Partial<AgentState> {
    return {};
  }

  // Node: ForceRespond — called when iteration limit reached with pending tool calls;
  // calls LLM with tool_choice: 'none' to produce a plain-text summary
  async function forceRespondNode(
    state: AgentState,
  ): Promise<Partial<AgentState>> {
    const generation = trace?.generation({
      name: 'force-respond',
      model: MODEL,
      input: state.messages,
    });

    const response = (await openai.chat.completions.create({
      model: MODEL,
      messages: state.messages,
      tool_choice: 'none',
    })) as OpenAI.Chat.ChatCompletion;

    const message = response.choices[0].message;
    const usage = response.usage;

    generation?.end({
      output: message,
      usage: {
        input: usage?.prompt_tokens,
        output: usage?.completion_tokens,
        total: usage?.total_tokens,
      },
    });

    return {
      messages: [message as OpenAI.Chat.ChatCompletionMessageParam],
      pendingToolCalls: [],
    };
  }

  // Routing: pending tool calls under limit → execute; limit reached → force text response; else → respond
  function routeAfterLLM(
    state: AgentState,
  ): 'execute_tools' | 'force_respond' | 'respond' {
    if (state.pendingToolCalls.length === 0) return 'respond';
    if (state.iterations >= MAX_ITERATIONS) return 'force_respond';
    return 'execute_tools';
  }

  return new StateGraph(AgentStateAnnotation)
    .addNode('plan', planNode)
    .addNode('execute_tools', executeToolsNode)
    .addNode('reflect', reflectNode)
    .addNode('respond', respondNode)
    .addNode('force_respond', forceRespondNode)
    .addEdge(START, 'plan')
    .addConditionalEdges('plan', routeAfterLLM)
    .addEdge('execute_tools', 'reflect')
    .addConditionalEdges('reflect', routeAfterLLM)
    .addEdge('respond', END)
    .addEdge('force_respond', END)
    .compile();
}
