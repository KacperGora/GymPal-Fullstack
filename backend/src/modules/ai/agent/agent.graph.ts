import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import OpenAI from 'openai';
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
        const args = JSON.parse(toolCall.function.arguments) as Record<
          string,
          unknown
        >;
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
          span?.end({ output: { error: errMsg }, level: 'ERROR' });
          return {
            role: 'tool' as const,
            tool_call_id: toolCall.id,
            content: `Error: ${errMsg}`,
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

  // Routing: tool calls pending and under iteration limit → execute, otherwise → respond
  function routeAfterLLM(state: AgentState): 'execute_tools' | 'respond' {
    if (
      state.pendingToolCalls.length > 0 &&
      state.iterations < MAX_ITERATIONS
    ) {
      return 'execute_tools';
    }
    return 'respond';
  }

  return new StateGraph(AgentStateAnnotation)
    .addNode('plan', planNode)
    .addNode('execute_tools', executeToolsNode)
    .addNode('reflect', reflectNode)
    .addNode('respond', respondNode)
    .addEdge(START, 'plan')
    .addConditionalEdges('plan', routeAfterLLM)
    .addEdge('execute_tools', 'reflect')
    .addConditionalEdges('reflect', routeAfterLLM)
    .addEdge('respond', END)
    .compile();
}
