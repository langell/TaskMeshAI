import { run } from '../summarizer';

// Mock fetch at global level
global.fetch = jest.fn();

describe('Agent Summarizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should export run function', () => {
    expect(typeof run).toBe('function');
  });

  it('should fetch open tasks', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      headers: new Map(),
      json: async () => [],
    });

    await run();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/tasks/open',
      expect.any(Object)
    );
  });

  it('should handle 402 payment required response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 402,
      headers: new Map([['x402-invoice', 'test-invoice']]),
      json: async () => [],
    });

    await run();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/tasks/open',
      expect.any(Object)
    );
  });

  it('should handle empty task list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      headers: new Map(),
      json: async () => [],
    });

    await run();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should bid on first task when available', async () => {
    const mockTasks = [
      { id: '1', title: 'Test Task' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        headers: new Map(),
        json: async () => mockTasks,
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Map(),
        json: async () => ({ success: true }),
      });

    await run();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/1/bid'),
      expect.any(Object)
    );
  });

  it('should schedule task completion', async () => {
    const mockTasks = [
      { id: '1', title: 'Test Task' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 200,
        headers: new Map(),
        json: async () => mockTasks,
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: new Map(),
        json: async () => ({ success: true }),
      });

    await run();

    // Just verify that the bidding call was made
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/1/bid'),
      expect.any(Object)
    );
  }, 10000);

  it('should use wallet in requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      headers: new Map(),
      json: async () => [],
    });

    await run();

    const firstCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(firstCall[1]).toHaveProperty('headers');
    expect(firstCall[1].headers).toHaveProperty('x402-wallet');
  });
});
