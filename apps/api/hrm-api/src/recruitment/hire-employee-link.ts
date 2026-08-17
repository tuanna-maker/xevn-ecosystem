/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng — chốt tuyển gắn hồ sơ NV (INT-01)
 * UC:         UC-HRM-INT-01
 * BR:         G-DB-01 · G-INT-01 · BR-CD-F6-05 · BR-REC-WF-05
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 · FR-HRM-INT-01
 * SRS bước:   Diễn biến #5 Thiếu hồ sơ → từ chối · #7 Lưu thành công đủ khóa · #8 có mã hồ sơ
 * TechSpec:   docs/hrm/TECHSPEC.md §17.2 INT spine · §17.3 G-DB-01 · §16.3 FR-HRM-INT-01
 * Purpose:    App-enforce soft link candidate→employees.id khi stage=hired (không hard FK G-DB-02).
 * WorkItem:   BE-HRM-G-DB-01-HIRE-LINK-01
 * Coded:      2026-07-21
 * Callers:    RecruitmentCatalogService (pool stage/PATCH) · RecruitmentWorkflowBridge terminal
 * Callees:    HrmDbService — candidates.employee_id · employees.candidate_id (soft)
 * must_keep:  G-RC-01 headcount · leave CREATE · U65 no seed · dual catalog twin không rewrite
 * SOLID:      Thuần resolve/assert — service chỉ gọi trước khi ghi hired
 * LastVerified: hire-employee-link.spec.ts (PO-SPEC-UNIT-TEST-IMPL-01)
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-SPEC-UNIT-TEST-IMPL-01
 * Date:       2026-08-03
 * Change:     LastVerified path → hire-employee-link.spec.ts (HIRE-400/409 + resolve priority); no product logic change.
 * must_keep:  soft FK hire bind · HRM-REC-HIRE-400/409 codes · dual catalog twin
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * EXPAND isHiredStage(optional hiredOutcomeKey) for open catalog hire target (VAL-REC-STG-14).
 * change_mode: ADD · must_keep default `hired` when catalog empty · soft FK
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02
 * ADD assertPersistedHireSoftLinkOrThrow — re-read Lane A soft + reverse after stamp
 * (R-REC-07-ASSERT-BYPASS). must_keep resolveHireEmployeeId priority for INT-01 stage path.
 */

import { HttpStatus } from '@nestjs/common';
import type { QueryResult, QueryResultRow } from 'pg';
import { ApiException } from '../common/api.exception';

/** Stable reject — FR-HRM-INT-01 Diễn biến #5 (thiếu mã hồ sơ). */
export const HRM_REC_HIRE_400 = 'HRM-REC-HIRE-400';

/** Stable reject — FR-HRM-INT-01 Diễn biến #4 (hồ sơ khác đơn vị). */
export const HRM_REC_HIRE_409 = 'HRM-REC-HIRE-409';

/** Compatible with HrmDbService.query (pg QueryResult) — nest build assignability. */
export type HireLinkDb = {
  query: <T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ) => Promise<QueryResult<T>>;
};

/**
 * Hire spine target — default starter key `hired`.
 * When open catalog has hiredOutcomeKey / isHiredOutcome hit, pass that key (VAL-REC-STG-14).
 */
export function isHiredStage(
  stage: string | null | undefined,
  hiredOutcomeKey?: string | null,
): boolean {
  const s = (stage ?? '').trim().toLowerCase();
  if (!s) return false;
  const outcome = hiredOutcomeKey?.trim().toLowerCase();
  if (outcome) return s === outcome;
  return s === 'hired';
}

/**
 * Resolve employee_id for hire AC (soft FK — no REFERENCES).
 * Priority: explicit body → candidates.employee_id → employees.candidate_id reverse.
 */
export async function resolveHireEmployeeId(
  db: HireLinkDb,
  candidateId: string,
  opts: {
    existingEmployeeId?: string | null;
    explicitEmployeeId?: string | null;
  },
): Promise<string | null> {
  const explicit = opts.explicitEmployeeId?.trim() || null;
  if (explicit) return explicit;
  const existing = opts.existingEmployeeId?.trim() || null;
  if (existing) return existing;
  try {
    const linked = await db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.employees
       WHERE candidate_id = $1::uuid AND archived_at IS NULL
       LIMIT 1`,
      [candidateId],
    );
    return linked.rows[0]?.id?.trim() || null;
  } catch {
    // employees.candidate_id may be absent on cold DB — fail-closed (unmet).
    return null;
  }
}

/**
 * Assert employee exists in the same company partition as the candidate.
 * Returns the validated employee_id.
 */
export async function assertEmployeeInCandidateCompany(
  db: HireLinkDb,
  employeeId: string,
  candidateCompanyId: string,
): Promise<string> {
  const emp = await db.query<{ id: string; company_id: string }>(
    `SELECT id::text AS id, company_id::text AS company_id
     FROM public.employees
     WHERE id = $1::uuid AND archived_at IS NULL
     LIMIT 1`,
    [employeeId],
  );
  const row = emp.rows[0];
  if (!row?.id) {
    // Thiếu hồ sơ hợp lệ — cùng mã #5 (không bịa link).
    throw new ApiException(
      HRM_REC_HIRE_400,
      'Hire requires a linked employee profile (employee_id)',
      HttpStatus.BAD_REQUEST,
    );
  }
  const candCo = candidateCompanyId.trim().toLowerCase();
  const empCo = (row.company_id ?? '').trim().toLowerCase();
  if (candCo && empCo && candCo !== empCo) {
    // Diễn biến #4 — khác đơn vị.
    throw new ApiException(
      HRM_REC_HIRE_409,
      'Employee and candidate must belong to the same company',
      HttpStatus.CONFLICT,
    );
  }
  return row.id;
}

/**
 * FR-HRM-INT-01 #5/#7 — chốt hired bắt buộc có khóa hồ sơ; ghi employee_id trước khi stage=hired.
 */
export async function assertHireEmployeeLinkOrThrow(
  db: HireLinkDb,
  candidateId: string,
  candidateCompanyId: string,
  opts: {
    existingEmployeeId?: string | null;
    explicitEmployeeId?: string | null;
  },
): Promise<string> {
  const resolved = await resolveHireEmployeeId(db, candidateId, opts);
  if (!resolved) {
    throw new ApiException(
      HRM_REC_HIRE_400,
      'Hire requires a linked employee profile (employee_id)',
      HttpStatus.BAD_REQUEST,
    );
  }
  return assertEmployeeInCandidateCompany(db, resolved, candidateCompanyId);
}

/**
 * Post-stamp seal (REC-07) — re-read Lane A soft `recruitment_candidates.employee_id`
 * + reverse `employees.candidate_id`. Does NOT trust in-memory `existingEmployeeId`.
 * Soft and reverse must both equal `expectedEmployeeId` (same company).
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02
 * Harden R-REC-07-ASSERT-BYPASS — DB soft+reverse after stamp.
 */
export async function assertPersistedHireSoftLinkOrThrow(
  db: HireLinkDb,
  candidateId: string,
  candidateCompanyId: string,
  expectedEmployeeId: string,
): Promise<string> {
  const expected = expectedEmployeeId.trim();
  if (!expected) {
    throw new ApiException(
      HRM_REC_HIRE_400,
      'Hire requires a linked employee profile (employee_id)',
      HttpStatus.BAD_REQUEST,
    );
  }

  let softId: string | null = null;
  try {
    const soft = await db.query<{ employee_id: string | null }>(
      `SELECT employee_id::text AS employee_id
       FROM public.recruitment_candidates
       WHERE id = $1::uuid
       LIMIT 1`,
      [candidateId],
    );
    softId = soft.rows[0]?.employee_id?.trim() || null;
  } catch {
    softId = null;
  }

  let reverseId: string | null = null;
  try {
    const rev = await db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.employees
       WHERE candidate_id = $1::uuid AND archived_at IS NULL
       LIMIT 1`,
      [candidateId],
    );
    reverseId = rev.rows[0]?.id?.trim() || null;
  } catch {
    reverseId = null;
  }

  if (!softId || softId !== expected) {
    throw new ApiException(
      HRM_REC_HIRE_400,
      'Hire soft stamp missing on recruitment_candidates.employee_id',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (!reverseId || reverseId !== expected) {
    throw new ApiException(
      HRM_REC_HIRE_400,
      'Hire reverse stamp missing on employees.candidate_id',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (softId !== reverseId) {
    throw new ApiException(
      HRM_REC_HIRE_409,
      'Conflict: soft and reverse hire links disagree',
      HttpStatus.CONFLICT,
    );
  }
  return assertEmployeeInCandidateCompany(db, expected, candidateCompanyId);
}
