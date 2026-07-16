import { beforeEach, describe, expect, it, vi } from 'vitest';

const { xbosGetData } = vi.hoisted(() => ({
  xbosGetData: vi.fn(),
}));

vi.mock('./xbosHttp', () => ({
  xbosGetData,
  xbosFetch: vi.fn(),
}));

vi.mock('./authSession', () => ({
  getStoredUser: () => ({ userId: 'ceo@xe.vn', displayName: 'CEO' }),
}));

import { listWorkflowTasks } from './workflowEngineApi';
import { __resetRequestCoalescerForTests } from './requestCoalescer';

/** Hold the flight open so two concurrent consumers overlap the same in-flight promise. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('listWorkflowTasks mount coalescing (P1-CC-MOUNT-DUP-CALLS-FE)', () => {
  beforeEach(() => {
    __resetRequestCoalescerForTests();
    xbosGetData.mockReset();
  });

  it('two concurrent consumers with identical scope share ONE network call', async () => {
    const d = deferred<{ items: unknown[] }>();
    xbosGetData.mockReturnValue(d.promise);

    // Simulates CommandCenter/ExecutiveDashboard mount: two effects fire the same query.
    const p1 = listWorkflowTasks('xevn', 'pending');
    const p2 = listWorkflowTasks('xevn', 'pending');

    expect(xbosGetData).toHaveBeenCalledTimes(1);

    d.resolve({ items: [{ id: 't1' }] });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual([{ id: 't1' }]);
    expect(r2).toEqual([{ id: 't1' }]);
  });

  it('distinct assignee scopes are NOT merged (legitimate multi-consumer)', async () => {
    xbosGetData.mockResolvedValue({ items: [] });

    await Promise.all([
      listWorkflowTasks('xevn', 'pending'), // alerts feed (no assignee)
      listWorkflowTasks('xevn', 'pending', 'ceo@xe.vn'), // assignee inbox
    ]);

    expect(xbosGetData).toHaveBeenCalledTimes(2);
  });

  it('re-fetches on a fresh mount cycle after the flight settled (reload-after-approve safe)', async () => {
    xbosGetData.mockResolvedValue({ items: [] });

    await listWorkflowTasks('xevn', 'pending');
    await listWorkflowTasks('xevn', 'pending');

    expect(xbosGetData).toHaveBeenCalledTimes(2);
  });
});
