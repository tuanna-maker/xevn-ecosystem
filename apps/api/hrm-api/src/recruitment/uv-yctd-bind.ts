/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Thêm UV gắn YCTD + So sánh theo YCTD
 * UC:         FR-UC-BP-REC-05a · FR-UC-BP-REC-06b · Diễn biến #1–#6
 * BR:         BR-BP-CV-03 · BR-BP-REC-CMP-01 · DV-UV-YCTD-* · AV-UV-YCTD-ALIAS-*
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 · REC-05a/06b
 * TechSpec:   docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md · F-REC-UV-YCTD-01..05 · F-REC-CMP-01..02
 * DB:         docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md · ONE physical requisition_id
 * API:        docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md · REQUIRED/STATUS/NOT-FOUND/MISMATCH/MAX-N/MIX
 * Purpose:    Alias DTO, receivable gate, position derive từ YCTD, compare max-N + YCTD-MIX.
 *             Soft FK only — không silent Lane B · không job_postings SoT · không dual FK.
 * WorkItem:   PO-HRM-REC-UV-YCTD-BE-01
 * Coded:      2026-08-06
 * Callers:    recruitment.service · recruitment.controller
 * Callees:    ApiException
 * must_keep:  ONE physical requisition_id · F-REC-APP-02/03 stubs · no CASCADE · U65 no seed
 * SOLID:      Pure bind/compare helpers tách khỏi CRUD spine / catalog twin
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * UPGRADE UV receivable mutate gate: O4 MODE-UNCLASSIFIED + open_for_hire normative
 * · legacy open synonym when classified · BOD-REQUIRED for out_of_plan.
 * change_mode: UPGRADE · must_keep ONE physical requisition_id · U65 no seed
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { assertYctdReceivableForMutateOrThrow } from './yctd-requisition-gates';

export const HRM_REC_UV_YCTD_REQUIRED = 'HRM-REC-UV-YCTD-REQUIRED';
export const HRM_REC_UV_YCTD_STATUS = 'HRM-REC-UV-YCTD-STATUS';
export const HRM_REC_UV_YCTD_NOT_FOUND = 'HRM-REC-UV-YCTD-NOT-FOUND';
export const HRM_REC_UV_POSITION_MISMATCH = 'HRM-REC-UV-POSITION-MISMATCH';
export const HRM_REC_UV_YCTD_ALIAS = 'HRM-REC-UV-YCTD-ALIAS';
export const HRM_REC_CMP_MAX_N = 'HRM-REC-CMP-MAX-N';
export const HRM_REC_CMP_YCTD_MIX = 'HRM-REC-CMP-YCTD-MIX';

/** Default BE authoritative max candidates in compare matrix (AC-REC-CMP-04). */
export const REC_COMPARE_MAX_N = 4;

export type UvYctdAliasInput = {
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
};

export type UvYctdReceivableRow = {
  id: string;
  company_id: string;
  title: string;
  status: string;
  headcount?: number | null;
  headcount_mode?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  position_code?: string | null;
  code?: string | null;
};

export type UvPositionDisplay = {
  recruitment_request_id: string;
  requisition_id: string;
  position_key: string;
  position_name: string;
  source: 'yctd';
};

/**
 * AS-IS receivable = open | approved | open_for_hire (list synonym O3).
 * Mutate gate (attach CV): open_for_hire | legacy open + classified; O4 NULL mode blocked.
 */
export function isUvYctdReceivable(row: {
  status?: string | null;
  headcount_mode?: string | null;
}): boolean {
  try {
    assertYctdReceivableForMutateOrThrow(row);
    return true;
  } catch {
    return false;
  }
}

/** List/picker filter — includes synonym statuses; O4 rows may still appear with warn on get. */
export function isUvYctdReceivableStatusOnly(row: {
  status?: string | null;
}): boolean {
  const s = String(row.status ?? '')
    .trim()
    .toLowerCase();
  return s === 'open' || s === 'approved' || s === 'open_for_hire';
}

export function isUvReceivableListQuery(query?: {
  receivable?: string;
  open_for_hire?: string;
}): boolean {
  const receivable = query?.receivable?.trim().toLowerCase();
  if (receivable === '1' || receivable === 'true' || receivable === 'yes')
    return true;
  const open = query?.open_for_hire?.trim().toLowerCase();
  return open === '1' || open === 'true' || open === 'yes';
}

/** GET :id bind-target check — for=uv | bind_check=true (mirror JD preview=yctd). */
export function isUvYctdBindTargetQuery(query?: {
  for?: string;
  bind_check?: string;
  preview?: string;
}): boolean {
  const forRaw = query?.for?.trim().toLowerCase();
  if (forRaw === 'uv' || forRaw === 'yctd' || forRaw === 'candidate')
    return true;
  const bind = query?.bind_check?.trim().toLowerCase();
  if (bind === '1' || bind === 'true' || bind === 'yes') return true;
  const preview = query?.preview?.trim().toLowerCase();
  return preview === 'uv' || preview === 'yctd';
}

/**
 * AV-UV-YCTD-ALIAS-01..02 — normalize to ONE physical requisition_id.
 * Missing both → null (caller may REQUIRED).
 */
export function resolveUvYctdRequisitionId(
  input: UvYctdAliasInput,
): string | null {
  const physical = input.requisition_id?.trim() || '';
  const logical = input.recruitment_request_id?.trim() || '';
  if (physical && logical && physical !== logical) {
    throw new ApiException(
      HRM_REC_UV_YCTD_ALIAS,
      'requisition_id and recruitment_request_id must refer to the same YCTD',
      HttpStatus.BAD_REQUEST,
    );
  }
  const id = physical || logical;
  return id || null;
}

export function requireUvYctdRequisitionId(input: UvYctdAliasInput): string {
  const id = resolveUvYctdRequisitionId(input);
  if (!id) {
    throw new ApiException(
      HRM_REC_UV_YCTD_REQUIRED,
      'requisition_id (or recruitment_request_id) is required to attach a candidate to a YCTD',
      HttpStatus.BAD_REQUEST,
    );
  }
  return id;
}

export function assertUvYctdReceivableOrThrow(
  row: UvYctdReceivableRow | null | undefined,
): UvYctdReceivableRow {
  if (!row) {
    throw new ApiException(
      HRM_REC_UV_YCTD_NOT_FOUND,
      'YCTD (job requisition) not found in scope',
      HttpStatus.NOT_FOUND,
    );
  }
  // O4 + receivable mutate gate → HRM-YCTD-MODE-UNCLASSIFIED / NOT-RECEIVABLE / BOD-REQUIRED.
  assertYctdReceivableForMutateOrThrow(row);
  return row;
}

/** Derive position SoT from YCTD (+ optional JD catalog join fields). */
export function toUvPositionDisplay(
  row: UvYctdReceivableRow,
): UvPositionDisplay {
  const key =
    (row.position_key ?? '').trim() || (row.position_code ?? '').trim() || '';
  const name =
    (row.position_name ?? '').trim() || (row.title ?? '').trim() || key || '—';
  return {
    recruitment_request_id: row.id,
    requisition_id: row.id,
    position_key: key,
    position_name: name,
    source: 'yctd',
  };
}

/**
 * Client optional position_key must match YCTD SoT when provided.
 * Free-text `position` alone is never SoT — caller ignores persist.
 */
export function assertUvPositionKeyMatchesOrThrow(
  yctd: UvYctdReceivableRow,
  clientPositionKey?: string | null,
): UvPositionDisplay {
  const display = toUvPositionDisplay(yctd);
  const client = (clientPositionKey ?? '').trim();
  if (client && display.position_key && client !== display.position_key) {
    throw new ApiException(
      HRM_REC_UV_POSITION_MISMATCH,
      'position_key must match the selected YCTD position',
      HttpStatus.BAD_REQUEST,
    );
  }
  return display;
}

export function parseCandidateIdList(raw: unknown): string[] {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) {
    return raw
      .flatMap((v) => String(v).split(','))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function assertCompareMaxNOrThrow(
  ids: string[],
  maxN = REC_COMPARE_MAX_N,
): void {
  if (ids.length > maxN) {
    throw new ApiException(
      HRM_REC_CMP_MAX_N,
      `Compare allows at most ${maxN} candidates`,
      HttpStatus.BAD_REQUEST,
      { max_n: maxN, received: ids.length },
    );
  }
}

export function assertCompareSameYctdOrThrow(
  requisitionId: string,
  rows: Array<{ id: string; requisition_id: string | null | undefined }>,
  requestedIds: string[],
): void {
  const byId = new Map(rows.map((r) => [r.id, r]));
  for (const id of requestedIds) {
    const row = byId.get(id);
    if (!row || String(row.requisition_id ?? '') !== requisitionId) {
      throw new ApiException(
        HRM_REC_CMP_YCTD_MIX,
        'All compared candidates must belong to the same YCTD',
        HttpStatus.BAD_REQUEST,
        { requisition_id: requisitionId, candidate_id: id },
      );
    }
  }
}

/**
 * Score SoT shapes (F-REC-APP-03 / FE eval dialog):
 * - FE write: `{ criterion_name, actual_score, weight? }`
 * - legacy / alternate: `{ criterion|name, score|value }`
 */
export function extractCompareCriterionName(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  for (const key of ['criterion_name', 'criterion', 'name'] as const) {
    const v = s[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return null;
}

export function extractCompareScoreValue(raw: unknown): number | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  for (const key of ['actual_score', 'score', 'value'] as const) {
    if (s[key] == null || s[key] === '') continue;
    const n = Number(s[key]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Display-ready score rows for F-REC-CMP-01 (FE expects criterion_name + actual_score). */
export function normalizeCompareScoreItems(scores: unknown): Array<{
  criterion_name: string;
  category: string;
  actual_score: number | null;
  required_score: number;
  weight: number;
}> {
  if (!Array.isArray(scores)) return [];
  return scores
    .map((item) => {
      const criterion_name = extractCompareCriterionName(item);
      if (!criterion_name) return null;
      const row =
        item && typeof item === 'object'
          ? (item as Record<string, unknown>)
          : {};
      return {
        criterion_name,
        category: row.category != null ? String(row.category) : '',
        actual_score: extractCompareScoreValue(item),
        required_score:
          row.required_score != null &&
          Number.isFinite(Number(row.required_score))
            ? Number(row.required_score)
            : 0,
        weight:
          row.weight != null && Number.isFinite(Number(row.weight))
            ? Number(row.weight)
            : 0,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}

/**
 * SQL predicate: eval neo = Lane A UV id (recruitment_candidate_id / application_id)
 * with legacy fallback on pool candidate_id.
 */
export const COMPARE_EVAL_LANE_A_ID_SQL =
  'COALESCE(e.recruitment_candidate_id, e.application_id, e.candidate_id)';

export function toReceivableListItem(row: Record<string, unknown>) {
  const id = String(row.id);
  const positionKey =
    String(row.position_key ?? row.position_code ?? '').trim() || '';
  const positionName =
    String(row.position_name ?? '').trim() ||
    String(row.title ?? '').trim() ||
    positionKey ||
    '—';
  const candidateCountRaw = row.candidate_count;
  const candidateCount =
    candidateCountRaw != null && Number.isFinite(Number(candidateCountRaw))
      ? Number(candidateCountRaw)
      : undefined;
  return {
    id,
    company_id: row.company_id != null ? String(row.company_id) : undefined,
    code: row.code != null ? String(row.code) : undefined,
    jd_code: row.jd_code != null ? String(row.jd_code) : undefined,
    jd_title: row.jd_title != null ? String(row.jd_title) : undefined,
    title: String(row.title ?? ''),
    department: row.department != null ? String(row.department) : undefined,
    position_key: positionKey,
    position_name: positionName,
    status: String(row.status ?? ''),
    headcount: row.headcount != null ? Number(row.headcount) : undefined,
    candidate_count: candidateCount,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
    recruitment_request_id: id,
    requisition_id: id,
  };
}

export function toCandidateUvDisplayReady<T extends Record<string, unknown>>(
  row: T,
  position?: UvPositionDisplay | null,
) {
  const reqId =
    (typeof row.requisition_id === 'string' && row.requisition_id.trim()) ||
    (typeof row.recruitment_request_id === 'string' &&
      row.recruitment_request_id.trim()) ||
    null;
  const pos =
    position ??
    (reqId
      ? {
          recruitment_request_id: reqId,
          requisition_id: reqId,
          position_key: String(row.position_key ?? ''),
          position_name: String(row.position_name ?? ''),
          source: 'yctd' as const,
        }
      : null);
  return {
    ...row,
    requisition_id: reqId,
    recruitment_request_id: reqId,
    position_key: pos?.position_key ?? null,
    position_name: pos?.position_name ?? null,
    position_source: pos?.source ?? null,
    applications: reqId
      ? [
          {
            application_id: row.id,
            requisition_id: reqId,
            recruitment_request_id: reqId,
            yctd_title: row.yctd_title ?? null,
            position_key: pos?.position_key ?? null,
            position_name: pos?.position_name ?? null,
            stage: row.status ?? row.stage ?? null,
          },
        ]
      : [],
  };
}
