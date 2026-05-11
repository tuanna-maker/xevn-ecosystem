import { fetchWithTimeoutAndRetry } from './http-retry-fetch';

function mockResponse(partial: Partial<Response> & { status: number; ok: boolean }): Response {
  return {
    body: { cancel: jest.fn().mockResolvedValue(undefined) },
    ...partial,
  } as unknown as Response;
}

describe('fetchWithTimeoutAndRetry', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('does not retry on 4xx', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse({ ok: false, status: 400 }));
    const r = await fetchWithTimeoutAndRetry('http://localhost/catalog', { timeoutMs: 5000 });
    expect(r.status).toBe(400);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 503 then succeeds', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockResponse({ ok: false, status: 503 }))
      .mockResolvedValueOnce(mockResponse({ ok: true, status: 200 }));
    const r = await fetchWithTimeoutAndRetry('http://localhost/catalog', { timeoutMs: 5000 });
    expect(r.ok).toBe(true);
    expect(r.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on client timeout (AbortError)', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        const onAbort = () => reject(new DOMException('The operation was aborted', 'AbortError'));
        init?.signal?.addEventListener('abort', onAbort, { once: true });
      });
    });
    const p = fetchWithTimeoutAndRetry('http://localhost/slow', { timeoutMs: 100 });
    const assertRejects = expect(p).rejects.toMatchObject({ name: 'AbortError' });
    await jest.advanceTimersByTimeAsync(150);
    await assertRejects;
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
