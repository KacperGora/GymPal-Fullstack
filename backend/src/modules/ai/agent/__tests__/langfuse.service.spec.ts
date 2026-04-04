import { LangfuseService } from '../langfuse.service';

jest.mock('langfuse', () => ({
  Langfuse: jest.fn().mockImplementation(() => ({
    trace: jest.fn().mockReturnValue({ update: jest.fn() }),
    flushAsync: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('LangfuseService', () => {
  afterEach(() => {
    delete process.env.LANGFUSE_SECRET_KEY;
    delete process.env.LANGFUSE_PUBLIC_KEY;
    delete process.env.LANGFUSE_HOST;
  });

  it('disables client when env vars are missing', () => {
    const service = new LangfuseService();
    expect(service.client).toBeNull();
  });

  it('initializes client when both keys are set', () => {
    process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test';
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test';

    const service = new LangfuseService();
    expect(service.client).not.toBeNull();
  });

  it('createTrace returns null when client is disabled', () => {
    const service = new LangfuseService();
    const trace = service.createTrace({ name: 'test', userId: '1' });
    expect(trace).toBeNull();
  });

  it('createTrace returns trace object when client is enabled', () => {
    process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test';
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test';

    const service = new LangfuseService();
    const trace = service.createTrace({ name: 'agent-run', userId: '42' });
    expect(trace).not.toBeNull();
  });

  it('uses LANGFUSE_HOST when set', () => {
    process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test';
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test';
    process.env.LANGFUSE_HOST = 'http://localhost:3000';

    const { Langfuse } = jest.requireMock('langfuse') as {
      Langfuse: jest.Mock;
    };

    new LangfuseService();

    expect(Langfuse).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: 'http://localhost:3000' }),
    );
  });

  it('flushes client on module destroy', async () => {
    process.env.LANGFUSE_SECRET_KEY = 'sk-lf-test';
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-lf-test';

    const service = new LangfuseService();
    await service.onModuleDestroy();

    expect(service.client!.flushAsync).toHaveBeenCalled();
  });

  it('onModuleDestroy is a no-op when client is disabled', async () => {
    const service = new LangfuseService();
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
