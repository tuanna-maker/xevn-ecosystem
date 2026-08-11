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
 * LastVerified: be-hrm-g-db-01-hire-link-01.spec.ts
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

export function isHiredStage(stage: string | null | undefined): boolean {
  return (stage ?? '').trim().toLowerCase() === 'hired';
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
