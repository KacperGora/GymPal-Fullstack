import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from '../agent.service';
import { AgentToolsService } from '../agent-tools.service';
import { LangfuseService } from '../langfuse.service';
import * as agentGraphModule from '../agent.graph';

const mockInvoke = jest.fn();

const makeToolsService = () =>
  ({
    executeTool: jest.fn().mockResolvedValue({ result: 'ok' }),
  }) as unknown as AgentToolsService;

const mockTrace = {
  update: jest.fn(),
  generation: jest.fn(),
  span: jest.fn(),
};

const makeLangfuseService = () =>
  ({
    createTrace: jest.fn().mockReturnValue(mockTrace),
  }) as unknown as LangfuseService;

describe('AgentService', () => {
  let service: AgentService;
  let langfuseService: LangfuseService;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    mockInvoke.mockReset();
    mockTrace.update.mockReset();

    jest
      .spyOn(agentGraphModule, 'buildAgentGraph')
      .mockReturnValue({ invoke: mockInvoke } as unknown as ReturnType<
        typeof agentGraphModule.buildAgentGraph
      >);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: AgentToolsService, useValue: makeToolsService() },
        { provide: LangfuseService, useValue: makeLangfuseService() },
      ],
    }).compile();

    service = module.get(AgentService);
    langfuseService = module.get(LangfuseService);
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('returns answer and toolsUsed from graph result', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [
        { role: 'system', content: 'System' },
        { role: 'user', content: 'Query' },
        { role: 'assistant', content: 'You had 3 workouts.' },
      ],
      toolsUsed: ['get_training_history'],
      iterations: 1,
    });

    const result = await service.runAgent(1, 'How many workouts?', 'en');

    expect(result.answer).toBe('You had 3 workouts.');
    expect(result.toolsUsed).toEqual(['get_training_history']);
  });

  it('passes correct initial state to graph', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [{ role: 'assistant', content: 'Answer' }],
      toolsUsed: [],
      iterations: 0,
    });

    await service.runAgent(42, 'Test query', 'pl');

    const invokeArg = mockInvoke.mock.calls[0][0];
    expect(invokeArg.userId).toBe(42);
    expect(invokeArg.language).toBe('pl');
    expect(invokeArg.messages[0].role).toBe('system');
    expect(invokeArg.messages[1]).toMatchObject({
      role: 'user',
      content: 'Test query',
    });
  });

  it('returns fallback answer when no assistant message in result', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [{ role: 'user', content: 'Query' }],
      toolsUsed: [],
      iterations: 0,
    });

    const result = await service.runAgent(1, 'Query', 'pl');

    expect(result.answer).toContain('Przepraszam');
  });

  it('throws ServiceUnavailableException when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const unconfigured = new AgentService(
      makeToolsService(),
      makeLangfuseService(),
    );
    await expect(unconfigured.runAgent(1, 'query', 'en')).rejects.toThrow(
      'AI Agent is not configured',
    );
  });

  it('creates a Langfuse trace for each agent run', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [{ role: 'assistant', content: 'Done' }],
      toolsUsed: [],
      iterations: 0,
    });

    await service.runAgent(7, 'Query', 'en');

    expect(langfuseService.createTrace).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'agent-run', userId: '7' }),
    );
  });

  it('updates trace with answer and metadata after graph run', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [{ role: 'assistant', content: 'Final answer' }],
      toolsUsed: ['search_exercises'],
      iterations: 1,
    });

    await service.runAgent(3, 'Plan me a workout', 'en');

    expect(mockTrace.update).toHaveBeenCalledWith(
      expect.objectContaining({
        output: 'Final answer',
        metadata: expect.objectContaining({ toolsUsed: ['search_exercises'] }),
      }),
    );
  });

  it('passes trace to buildAgentGraph', async () => {
    mockInvoke.mockResolvedValueOnce({
      messages: [{ role: 'assistant', content: 'ok' }],
      toolsUsed: [],
      iterations: 0,
    });

    await service.runAgent(1, 'query', 'en');

    const buildSpy = agentGraphModule.buildAgentGraph as jest.Mock;
    expect(buildSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      mockTrace,
    );
  });
});
