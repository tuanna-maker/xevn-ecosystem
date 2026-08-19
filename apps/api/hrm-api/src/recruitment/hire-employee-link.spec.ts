/**
 * PO-SPEC-UNIT-TEST-IMPL-01 — G-DB-01 hire-employee-link unit (HIRE-400 / HIRE-409).
 * Plan: docs/qa/PO_SPEC_UNIT_TEST_PLAN.md §2 P0-1
 */
import { ApiException } from '../common/api.exception';
import {
  HRM_REC_HIRE_400,
  HRM_REC_HIRE_409,
  assertEmployeeInCandidateCompany,
  assertHireEmployeeLinkOrThrow,
  assertPersistedHireSoftLinkOrThrow,
  isHiredStage,
  resolveHireEmployeeId,
  type HireLinkDb,
} from './hire-employee-link';

function mockDb(
  impl: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>,
): HireLinkDb {
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) => impl(sql, params)),
  };
}

describe('hire-employee-link G-DB-01 (PO-SPEC-UNIT-TEST-IMPL-01)', () => {
  describe('isHiredStage', () => {
    it('recognizes hired case-insensitively', () => {
      expect(isHiredStage('hired')).toBe(true);
      expect(isHiredStage('Hired')).toBe(true);
      expect(isHiredStage(' HIRED ')).toBe(true);
      expect(isHiredStage('interview')).toBe(false);
      expect(isHiredStage(null)).toBe(false);
      expect(isHiredStage(undefined)).toBe(false);
    });
  });

  describe('resolveHireEmployeeId', () => {
    it('prefers explicitEmployeeId over existing and reverse link', async () => {
      const db = mockDb(async () => ({
        rows: [{ id: 'rev-should-not-win' }],
      }));
      const id = await resolveHireEmployeeId(db, 'cand-1', {
        explicitEmployeeId: '  emp-explicit  ',
        existingEmployeeId: 'emp-existing',
      });
      expect(id).toBe('emp-explicit');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('falls back to existingEmployeeId when explicit empty', async () => {
      const db = mockDb(async () => ({
        rows: [{ id: 'rev-should-not-win' }],
      }));
      const id = await resolveHireEmployeeId(db, 'cand-1', {
        explicitEmployeeId: '   ',
        existingEmployeeId: 'emp-existing',
      });
      expect(id).toBe('emp-existing');
      expect(db.query).not.toHaveBeenCalled();
    });

    it('falls back to employees.candidate_id reverse SELECT', async () => {
      const db = mockDb(async (sql, params) => {
        expect(sql).toMatch(/employees/);
        expect(sql).toMatch(/candidate_id/);
        expect(params?.[0]).toBe('cand-1');
        return { rows: [{ id: 'emp-reverse' }] };
      });
      const id = await resolveHireEmployeeId(db, 'cand-1', {
        explicitEmployeeId: null,
        existingEmployeeId: null,
      });
      expect(id).toBe('emp-reverse');
    });

    it('returns null when no link (cold DB / empty)', async () => {
      const empty = mockDb(async () => ({ rows: [] }));
      await expect(
        resolveHireEmployeeId(empty, 'cand-1', {}),
      ).resolves.toBeNull();

      const cold = mockDb(async () => {
        throw new Error('column candidate_id does not exist');
      });
      await expect(resolveHireEmployeeId(cold, 'cand-1', {})).resolves.toBeNull();
    });
  });

  describe('assertEmployeeInCandidateCompany', () => {
    it('missing employee → HRM-REC-HIRE-400', async () => {
      const db = mockDb(async () => ({ rows: [] }));
      await expect(
        assertEmployeeInCandidateCompany(db, 'emp-missing', 'holding'),
      ).rejects.toMatchObject<ApiException>({ code: HRM_REC_HIRE_400 });
    });

    it('cross-company employee → HRM-REC-HIRE-409', async () => {
      const db = mockDb(async () => ({
        rows: [{ id: 'emp-1', company_id: 'visun' }],
      }));
      await expect(
        assertEmployeeInCandidateCompany(db, 'emp-1', 'holding'),
      ).rejects.toMatchObject<ApiException>({ code: HRM_REC_HIRE_409 });
    });

    it('same company → returns employee uuid', async () => {
      const db = mockDb(async () => ({
        rows: [{ id: 'emp-1', company_id: 'holding' }],
      }));
      await expect(
        assertEmployeeInCandidateCompany(db, 'emp-1', 'holding'),
      ).resolves.toBe('emp-1');
    });
  });

  describe('assertHireEmployeeLinkOrThrow', () => {
    it('unresolved link → HRM-REC-HIRE-400', async () => {
      const db = mockDb(async () => ({ rows: [] }));
      await expect(
        assertHireEmployeeLinkOrThrow(db, 'cand-1', 'holding', {}),
      ).rejects.toMatchObject<ApiException>({ code: HRM_REC_HIRE_400 });
    });

    it('resolved + same company → returns id', async () => {
      const db = mockDb(async (sql) => {
        if (sql.includes('FROM public.employees') && sql.includes('WHERE id =')) {
          return { rows: [{ id: 'emp-ok', company_id: 'holding' }] };
        }
        return { rows: [] };
      });
      await expect(
        assertHireEmployeeLinkOrThrow(db, 'cand-1', 'holding', {
          explicitEmployeeId: 'emp-ok',
        }),
      ).resolves.toBe('emp-ok');
    });
  });

  describe('assertPersistedHireSoftLinkOrThrow (REC-07 BE-02)', () => {
    it('soft+reverse match expected → returns id', async () => {
      const db = mockDb(async (sql) => {
        if (sql.includes('recruitment_candidates') && sql.includes('employee_id')) {
          return { rows: [{ employee_id: 'emp-ok' }] };
        }
        if (sql.includes('candidate_id = $1::uuid')) {
          return { rows: [{ id: 'emp-ok' }] };
        }
        if (sql.includes('WHERE id =')) {
          return { rows: [{ id: 'emp-ok', company_id: 'holding' }] };
        }
        return { rows: [] };
      });
      await expect(
        assertPersistedHireSoftLinkOrThrow(db, 'cand-1', 'holding', 'emp-ok'),
      ).resolves.toBe('emp-ok');
    });

    it('missing soft stamp → HRM-REC-HIRE-400 (no in-memory bypass)', async () => {
      const db = mockDb(async (sql) => {
        if (sql.includes('recruitment_candidates')) {
          return { rows: [{ employee_id: null }] };
        }
        if (sql.includes('candidate_id')) {
          return { rows: [{ id: 'emp-ok' }] };
        }
        return { rows: [] };
      });
      await expect(
        assertPersistedHireSoftLinkOrThrow(db, 'cand-1', 'holding', 'emp-ok'),
      ).rejects.toMatchObject<ApiException>({ code: HRM_REC_HIRE_400 });
    });
  });
});
