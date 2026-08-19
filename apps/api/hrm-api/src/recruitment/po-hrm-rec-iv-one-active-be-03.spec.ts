/**
 * PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03 — pool ↔ spine email bridge.
 * Residual REC-IV-SPINE-POOL-EMAIL-LINK-P0 from QA-02.
 */
import {
  ensureSpineRecruitmentCandidateFromPool,
  findSpineRecruitmentCandidateIdByEmail,
  materializeMissingSpineCandidatesFromPool,
  resolveOpenRequisitionIdForCompany,
} from './pool-spine-bridge';

const POOL_ID = 'a1111111-1111-4111-8111-111111111111';
const SPINE_ID = 'b2222222-2222-4222-8222-222222222222';
const REQ_ID = 'c3333333-3333-4333-8333-333333333333';

function createDbMock(handlers: Array<(sql: string, params?: unknown[]) => unknown>) {
  let callIndex = 0;
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      const handler = handlers[callIndex];
      callIndex += 1;
      if (!handler) {
        throw new Error(`Unexpected query #${callIndex}: ${sql.slice(0, 120)}`);
      }
      return handler(sql, params);
    }),
    callCount: () => callIndex,
  };
}

describe('PO-HRM-REC-IV-ONE-ACTIVE-BE-03 pool-spine-bridge', () => {
  it('findSpineRecruitmentCandidateIdByEmail returns id when spine row exists', async () => {
    const db = createDbMock([
      () => ({ rows: [{ id: SPINE_ID }] }),
    ]);
    const id = await findSpineRecruitmentCandidateIdByEmail(
      db as never,
      'tuanna@unicomhub.com',
      ['holding', 'main'],
    );
    expect(id).toBe(SPINE_ID);
  });

  it('ensureSpineFromPool returns existing spine id without INSERT when email matches', async () => {
    const db = createDbMock([
      () => ({ rows: [{ id: SPINE_ID }] }),
    ]);
    const result = await ensureSpineRecruitmentCandidateFromPool(
      db as never,
      {
        id: POOL_ID,
        company_id: 'holding',
        full_name: 'Tuấn',
        email: 'tuanna@unicomhub.com',
        source: 'import',
      },
      ['holding', 'main'],
    );
    expect(result).toEqual({ id: SPINE_ID, created: false });
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  it('ensureSpineFromPool creates spine row with pool email when missing', async () => {
    const db = createDbMock([
      () => ({ rows: [] }),
      () => ({ rows: [{ id: REQ_ID }] }),
      () => ({ rows: [] }),
    ]);
    const result = await ensureSpineRecruitmentCandidateFromPool(
      db as never,
      {
        id: POOL_ID,
        company_id: 'holding',
        full_name: 'Tuấn',
        email: 'Tuanna@UnicomHub.com',
        source: 'referral',
      },
      ['holding', 'main'],
    );
    expect(result?.created).toBe(true);
    expect(result?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    const insertCall = (db.query as jest.Mock).mock.calls[2];
    expect(insertCall[0]).toContain('INSERT INTO public.recruitment_candidates');
    expect(insertCall[1]).toEqual(
      expect.arrayContaining(['holding', REQ_ID, 'Tuấn', 'tuanna@unicomhub.com', 'referral', POOL_ID]),
    );
  });

  it('ensureSpineFromPool returns null when no open requisition in scope', async () => {
    const db = createDbMock([
      () => ({ rows: [] }),
      () => ({ rows: [] }),
    ]);
    const result = await ensureSpineRecruitmentCandidateFromPool(
      db as never,
      {
        id: POOL_ID,
        company_id: 'holding',
        full_name: 'Tuấn',
        email: 'tuanna@unicomhub.com',
      },
      ['holding'],
    );
    expect(result).toBeNull();
    expect(db.query).toHaveBeenCalledTimes(2);
  });

  it('materializeMissingSpineCandidatesFromPool creates rows for pool emails without spine', async () => {
    const db = createDbMock([
      () => ({
        rows: [
          {
            id: POOL_ID,
            company_id: 'holding',
            full_name: 'Tuấn',
            email: 'tuanna@unicomhub.com',
            source: 'pool',
          },
        ],
      }),
      () => ({ rows: [] }),
      () => ({ rows: [{ id: REQ_ID }] }),
      () => ({ rows: [] }),
    ]);
    const created = await materializeMissingSpineCandidatesFromPool(db as never, ['holding', 'main']);
    expect(created).toBe(1);
  });

  it('resolveOpenRequisitionIdForCompany prefers pool company then scope siblings', async () => {
    const db = createDbMock([
      () => ({ rows: [] }),
      () => ({ rows: [{ id: REQ_ID }] }),
    ]);
    const id = await resolveOpenRequisitionIdForCompany(db as never, 'holding', ['holding', 'main']);
    expect(id).toBe(REQ_ID);
    expect(db.query).toHaveBeenCalledTimes(2);
  });
});
