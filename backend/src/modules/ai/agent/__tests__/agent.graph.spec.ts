import OpenAI from 'openai';
import { buildAgentGraph } from '../agent.graph';
import type { AgentToolsService } from '../agent-tools.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAssistantMessage(
  content: string | null,
  toolCalls?: OpenAI.Chat.ChatCompletionMessageToolCall[],
): OpenAI.Chat.ChatCompletionMessage {
  return {
    role: 'assistant',
    content,
    tool_calls: toolCalls,
    refusal: null,
  };
}

function makeToolCall(
  id: string,
  name: string,
  args: string,
): OpenAI.Chat.ChatCompletionMessageToolCall {
  return {
    id,
    type: 'function',
    function: { name, arguments: args },
  };
}

function makeOpenAiResponse(
  message: OpenAI.Chat.ChatCompletionMessage,
): OpenAI.Chat.ChatCompletion {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: 0,
    model: 'gpt-4o',
    choices: [{ index: 0, message, finish_reason: 'stop', logprobs: null }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  };
}

const makeToolsService = (result: unknown = { ok: true }) =>
  ({
    executeTool: jest.fn().mockResolvedValue(result),
  }) as unknown as AgentToolsService;

const makeOpenAi = (responses: OpenAI.Chat.ChatCompletion[]) => {
  let call = 0;
  return {
    chat: {
      completions: {
        create: jest.fn().mockImplementation(() => {
          const resp = responses[call] ?? responses[responses.length - 1];
          call++;
          return Promise.resolve(resp);
        }),
      },
    },
  } as unknown as OpenAI;
};

const baseState = () => ({
  userId: 1,
  language: 'en',
  messages: [
    { role: 'system' as const, content: 'System prompt' },
    { role: 'user' as const, content: 'User query' },
  ],
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildAgentGraph', () => {
  describe('routing — no tool calls', () => {
    it('goes directly to respond when plan returns no tool calls', async () => {
      const textResponse = makeOpenAiResponse(
        makeAssistantMessage('Here is your answer.'),
      );
      const openai = makeOpenAi([textResponse]);
      const toolsService = makeToolsService();

      const graph = buildAgentGraph(openai, toolsService);
      const result = await graph.invoke(baseState());

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(toolsService.executeTool).not.toHaveBeenCalled();

      const lastMsg = [...result.messages]
        .reverse()
        .find((m) => m.role === 'assistant');
      expect(lastMsg?.content).toBe('Here is your answer.');
    });
  });

  describe('routing — tool calls within iteration limit', () => {
    it('executes tools and reflects before responding', async () => {
      const toolCallResponse = makeOpenAiResponse(
        makeAssistantMessage(null, [
          makeToolCall('tc1', 'get_training_history', '{"limit":5}'),
        ]),
      );
      const finalResponse = makeOpenAiResponse(
        makeAssistantMessage('You had 2 workouts.'),
      );
      const openai = makeOpenAi([toolCallResponse, finalResponse]);
      const toolsService = makeToolsService({
        sessions: [],
        total: 0,
        fetched: 0,
      });

      const graph = buildAgentGraph(openai, toolsService);
      const result = await graph.invoke(baseState());

      expect(toolsService.executeTool).toHaveBeenCalledWith(
        1,
        'get_training_history',
        { limit: 5 },
      );
      // plan + reflect = 2 LLM calls
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(result.toolsUsed).toContain('get_training_history');

      const lastMsg = [...result.messages]
        .reverse()
        .find((m) => m.role === 'assistant');
      expect(lastMsg?.content).toBe('You had 2 workouts.');
    });
  });

  describe('routing — max iterations reached', () => {
    it('calls LLM with tool_choice: none after max iterations to produce final text', async () => {
      // Every LLM call returns a tool call (model keeps wanting more tools)
      const alwaysToolCall = makeOpenAiResponse(
        makeAssistantMessage(null, [
          makeToolCall('tc1', 'get_training_history', '{"limit":5}'),
        ]),
      );
      const forcedTextResponse = makeOpenAiResponse(
        makeAssistantMessage('Here is what I found so far.'),
      );

      // MAX_ITERATIONS = 3, so: plan(tool) + execute + reflect(tool) + execute + reflect(tool) + execute + reflect → force_respond
      // Actually: plan(tool) → execute → reflect(tool) → execute → reflect(tool) → execute → reflect → force_respond
      // Wait, let me think again. iterations starts at 0.
      // After first execute_tools: iterations = 1. reflect returns tool call. iterations < 3 → execute again
      // After second execute_tools: iterations = 2. reflect returns tool call. iterations < 3 → execute again
      // After third execute_tools: iterations = 3. reflect returns tool call. iterations >= 3 → force_respond
      // So: 1 plan + 3 reflects + 1 force_respond = 5 LLM calls, 3 tool executions
      const openai = makeOpenAi([
        alwaysToolCall, // plan
        alwaysToolCall, // reflect 1
        alwaysToolCall, // reflect 2
        alwaysToolCall, // reflect 3 → hits limit → force_respond
        forcedTextResponse, // force_respond
      ]);
      const toolsService = makeToolsService();

      const graph = buildAgentGraph(openai, toolsService);
      const result = await graph.invoke(baseState());

      // force_respond call must have tool_choice: 'none'
      const calls = (openai.chat.completions.create as jest.Mock).mock.calls;
      const forceRespondCall = calls[calls.length - 1][0];
      expect(forceRespondCall.tool_choice).toBe('none');

      const lastMsg = [...result.messages]
        .reverse()
        .find((m) => m.role === 'assistant');
      expect(lastMsg?.content).toBe('Here is what I found so far.');
    });
  });

  describe('executeToolsNode — malformed JSON arguments', () => {
    it('returns tool error message instead of throwing when JSON is invalid', async () => {
      const badJsonToolCall = makeOpenAiResponse(
        makeAssistantMessage(null, [
          makeToolCall('tc1', 'get_training_history', 'NOT_VALID_JSON{{{'),
        ]),
      );
      const finalResponse = makeOpenAiResponse(
        makeAssistantMessage('Could not parse arguments.'),
      );
      const openai = makeOpenAi([badJsonToolCall, finalResponse]);
      const toolsService = makeToolsService();

      const graph = buildAgentGraph(openai, toolsService);
      // Should NOT throw
      const result = await graph.invoke(baseState());

      expect(toolsService.executeTool).not.toHaveBeenCalled();

      const toolMessages = result.messages.filter((m) => m.role === 'tool');
      expect(toolMessages).toHaveLength(1);
      expect((toolMessages[0] as { content: string }).content).toMatch(
        /Invalid tool arguments/,
      );
    });
  });

  describe('executeToolsNode — tool execution error', () => {
    it('returns generic error message without leaking internal error details', async () => {
      const toolCallResponse = makeOpenAiResponse(
        makeAssistantMessage(null, [
          makeToolCall('tc1', 'get_training_history', '{"limit":5}'),
        ]),
      );
      const finalResponse = makeOpenAiResponse(
        makeAssistantMessage('Something went wrong.'),
      );
      const openai = makeOpenAi([toolCallResponse, finalResponse]);
      const toolsService = makeToolsService();
      (toolsService.executeTool as jest.Mock).mockRejectedValueOnce(
        new Error('PrismaClientKnownRequestError: constraint violation'),
      );

      const graph = buildAgentGraph(openai, toolsService);
      const result = await graph.invoke(baseState());

      const toolMessages = result.messages.filter((m) => m.role === 'tool');
      expect(toolMessages).toHaveLength(1);
      const content = (toolMessages[0] as { content: string }).content;
      // Generic message — no Prisma details
      expect(content).toBe('Error: Tool execution failed.');
      expect(content).not.toMatch(/Prisma/);
    });
  });
});
