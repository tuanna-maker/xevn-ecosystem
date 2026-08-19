import { createHash } from 'node:crypto';
import {
  ensureUatMobileEmployeeRow,
  matchesUatMobilePassword,
  parseUatMobileSeqFromLoginEmail,
  resolveCanonicalUatLoginEmail,
} from './uat-mobile-auth-ensure';

/**
 * Test health — align with restored public API (D-HDSD-MOB-UAT-AUTH-01).
 * Private helpers (hash / persona) exercised via ensureUatMobileEmployeeRow.
 * WorkItem: PO-HRM-MVP-GD1-TEST-HEALTH-BE-01
 */
describe('uat-mobile-auth-ensure', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevUatPw = process.env.HRM_MOBILE_UAT_PASSWORD;
  const prevPilotPw = process.env.PILOT_MOBILE_UAT_PASSWORD;

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    if (prevUatPw === undefined) delete process.env.HRM_MOBILE_UAT_PASSWORD;
    else process.env.HRM_MOBILE_UAT_PASSWORD = prevUatPw;
    if (prevPilotPw === undefined) delete process.env.PILOT_MOBILE_UAT_PASSWORD;
    else process.env.PILOT_MOBILE_UAT_PASSWORD = prevPilotPw;
  });

  it('parseUatMobileSeqFromLoginEmail accepts documented emails seq 1..1000', () => {
    expect(parseUatMobileSeqFromLoginEmail('uat.nv0001@xe.vn')).toBe(1);
    expect(parseUatMobileSeqFromLoginEmail('uat.nv1000@xe.vn')).toBe(1000);
    expect(parseUatMobileSeqFromLoginEmail('ceo@xe.vn')).toBeNull();
    expect(parseUatMobileSeqFromLoginEmail('uat.nv1001@xe.vn')).toBeNull();
  });

  it('parseUatMobileSeqFromLoginEmail accepts legacy nguyen.van.an.#### alias', () => {
    expect(parseUatMobileSeqFromLoginEmail('nguyen.van.an.0001@xe.vn')).toBe(1);
    expect(parseUatMobileSeqFromLoginEmail('uat.nv0002@xe.vn')).toBe(2);
    expect(parseUatMobileSeqFromLoginEmail('ceo@xe.vn')).toBeNull();
  });

  it('resolveCanonicalUatLoginEmail maps legacy → uat.nv SoT', () => {
    expect(resolveCanonicalUatLoginEmail('nguyen.van.an.0042@xe.vn')).toBe('uat.nv0042@xe.vn');
    expect(resolveCanonicalUatLoginEmail('uat.nv0001@xe.vn')).toBe('uat.nv0001@xe.vn');
  });

  it('ensureUatMobileEmployeeRow inserts nv0001 / nv0002 persona lanes', async () => {
    const insertBySeq: Record<number, unknown[]> = {};
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        if (sql.includes('SELECT id::text AS id') && sql.includes('lower(email)')) {
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO public.employees')) {
          const email = String(params?.[3] ?? '');
          const seq = Number(email.match(/uat\.nv(\d{4})@/i)?.[1] ?? 0);
          insertBySeq[seq] = [...(params ?? [])];
          return { rows: [] };
        }
        return { rows: [] };
      }),
    };

    await ensureUatMobileEmployeeRow(db as never, 1, 'xevn-uat-2026');
    await ensureUatMobileEmployeeRow(db as never, 2, 'xevn-uat-2026');

    expect(insertBySeq[1]?.[2]).toBe('HLD-0001');
    expect(insertBySeq[1]?.[3]).toBe('uat.nv0001@xe.vn');
    expect(insertBySeq[1]?.[4]).toBe('Nguyễn Văn An');
    expect(insertBySeq[1]?.[5]).toBe('STAFF');

    expect(insertBySeq[2]?.[2]).toBe('TRS-0002');
    expect(insertBySeq[2]?.[3]).toBe('uat.nv0002@xe.vn');
    expect(insertBySeq[2]?.[5]).toBe('COO');

    const cf1 = JSON.parse(String(insertBySeq[1]?.[6] ?? '{}')) as {
      mobile_persona?: string;
      mobile_password_hash?: string;
    };
    expect(cf1.mobile_persona).toBe('emp');
    const expectedHash = createHash('sha256')
      .update('uat.nv0001@xe.vn:xevn-uat-2026')
      .digest('hex');
    expect(cf1.mobile_password_hash).toBe(expectedHash);

    const cf2 = JSON.parse(String(insertBySeq[2]?.[6] ?? '{}')) as { mobile_persona?: string };
    expect(cf2.mobile_persona).toBe('mgr');
  });

  it('matchesUatMobilePassword uses env/default password for UAT seq emails', () => {
    delete process.env.HRM_MOBILE_UAT_PASSWORD;
    delete process.env.PILOT_MOBILE_UAT_PASSWORD;
    expect(matchesUatMobilePassword('uat.nv0001@xe.vn', 'xevn-uat-2026')).toBe(true);
    expect(matchesUatMobilePassword('uat.nv0001@xe.vn', 'wrong')).toBe(false);
    expect(matchesUatMobilePassword('ceo@xe.vn', 'xevn-uat-2026')).toBe(false);
    expect(matchesUatMobilePassword('nguyen.van.an.0001@xe.vn', 'xevn-uat-2026')).toBe(true);
  });

  it('matchesUatMobilePassword honors HRM_MOBILE_UAT_PASSWORD override', () => {
    process.env.HRM_MOBILE_UAT_PASSWORD = 'custom-uat-pw';
    expect(matchesUatMobilePassword('uat.nv0001@xe.vn', 'custom-uat-pw')).toBe(true);
    expect(matchesUatMobilePassword('uat.nv0001@xe.vn', 'xevn-uat-2026')).toBe(false);
  });

  it('ensureUatMobileEmployeeRow updates existing row by id', async () => {
    const existingId = '22222222-2222-4222-8222-222222222222';
    const updateParams: unknown[] = [];
    const db = {
      query: jest.fn(async (sql: string, params?: unknown[]) => {
        if (sql.includes('SELECT id::text AS id')) {
          return { rows: [{ id: existingId }] };
        }
        if (sql.includes('UPDATE public.employees')) {
          updateParams.push(...(params ?? []));
          return { rows: [] };
        }
        return { rows: [] };
      }),
    };
    await ensureUatMobileEmployeeRow(db as never, 2, 'xevn-uat-2026');
    expect(updateParams[0]).toBe(existingId);
    expect(updateParams[2]).toBe('COO');
  });

  it('ensureUatMobileEmployeeRow no-ops on wrong password or out-of-range seq', async () => {
    const db = { query: jest.fn(async () => ({ rows: [] })) };
    await ensureUatMobileEmployeeRow(db as never, 1, 'wrong-pw');
    await ensureUatMobileEmployeeRow(db as never, 0, 'xevn-uat-2026');
    await ensureUatMobileEmployeeRow(db as never, 1001, 'xevn-uat-2026');
    expect(db.query).not.toHaveBeenCalled();
  });
});
