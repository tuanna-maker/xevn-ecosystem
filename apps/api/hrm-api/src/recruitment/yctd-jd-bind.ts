/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → YCTD ↔ Thư viện JD (picker / preview / soft FK)
 * UC:         FR-UC-BP-REC-02 / 02b · Diễn biến 1a–1d
 * BR:         BR-BP-JD-01 · BR-YCTD-JD-REF-01 · BR-YCTD-JD-REF-02
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.10 · REC-02/02b
 * TechSpec:   docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md · F-YCTD-JD-01..05
 * DB:         docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md · ONE physical job_template_id
 * API:        docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md · alias · STATUS/REQUIRED/NOT-FOUND
 * Purpose:    Chuẩn hóa alias DTO, status-gate bindable, preview thin, display-ready YCTD.
 *             Soft FK only — không CASCADE · không dual-write job_postings.
 * WorkItem:   PO-HRM-JD-YCTD-REF-BE-01
 * Coded:      2026-08-06
 * Callers:    recruitment.service · recruitment-catalog.service · recruitment.controller
 * Callees:    ApiException
 * must_keep:  ONE physical soft FK · F-REC-YCTD plan stubs untouched · no CASCADE
 * SOLID:      Pure bind helpers tách khỏi CRUD spine / catalog twin
 * LastVerified: po-hrm-jd-yctd-ref-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01
 * UPGRADE isYctdJdBindable dual-assert: status==='active' && is_active===true;
 * fallback is_active===true only when status null (pre-backfill). List item status ∈ draft|active|retired.
 * change_mode: UPGRADE · must_keep HRM-JD-YCTD-STATUS · soft FK · no CASCADE · U65
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

export const HRM_JD_YCTD_STATUS = 'HRM-JD-YCTD-STATUS';
export const HRM_JD_YCTD_REQUIRED = 'HRM-JD-YCTD-REQUIRED';
export const HRM_JD_YCTD_NOT_FOUND = 'HRM-JD-YCTD-NOT-FOUND';
export const HRM_JD_YCTD_ALIAS = 'HRM-JD-YCTD-ALIAS';
export const HRM_JD_YCTD_REBIND_LOCKED = 'HRM-JD-YCTD-REBIND-LOCKED';

export type JdTemplateStatus = 'draft' | 'active' | 'retired';

export type YctdJdAliasInput = {
  job_template_id?: string | null;
  job_description_id?: string | null;
};

export type YctdJdTemplateBindRow = {
  id: string;
  code: string;
  title: string;
  job_description: string | null;
  requirements: string | null;
  is_active: boolean;
  /** Display-ready O2 — optional until DATA-01 backfill completes. */
  status?: string | null;
  position_code?: string | null;
  position_name?: string | null;
};

export type YctdJdPreview = {
  job_template_id: string;
  job_description_id: string;
  code: string;
  title: string;
  short_description: string;
  requirements_preview?: string;
  status: 'active';
};

/**
 * Normalize DB/API status with pre-backfill fallback (DATA-01 dual-assert period).
 */
export function normalizeJdTemplateStatus(row: {
  status?: string | null;
  is_active?: boolean | null;
}): JdTemplateStatus {
  const s = String(row.status ?? '')
    .trim()
    .toLowerCase();
  if (s === 'draft' || s === 'active' || s === 'retired') return s;
  return row.is_active === true ? 'active' : 'draft';
}

export function bridgeIsActiveForStatus(status: JdTemplateStatus): boolean {
  return status === 'active';
}

/** Diễn biến 1a — bindable = Hiệu lực (status=active ∧ is_active); null status → legacy is_active. */
export function isYctdJdBindable(row: {
  status?: string | null;
  is_active?: boolean | null;
}): boolean {
  const raw = row.status;
  if (raw != null && String(raw).trim() !== '') {
    return (
      normalizeJdTemplateStatus(row) === 'active' && row.is_active === true
    );
  }
  // Migrate dual-assert: pre-backfill rows without status column value.
  return row.is_active === true;
}

export function isYctdBindableListQuery(query?: {
  bindable?: string;
  for?: string;
  active?: string;
}): boolean {
  const bindable = query?.bindable?.trim().toLowerCase();
  if (bindable === '1' || bindable === 'true' || bindable === 'yes')
    return true;
  const forRaw = query?.for?.trim().toLowerCase();
  return forRaw === 'yctd';
}

/**
 * AV-YCTD-JD-ALIAS-01..02 — normalize to ONE physical id.
 * Missing both → null (caller may REQUIRED).
 */
export function resolveYctdJdTemplateId(
  input: YctdJdAliasInput,
): string | null {
  const physical = input.job_template_id?.trim() || '';
  const logical = input.job_description_id?.trim() || '';
  if (physical && logical && physical !== logical) {
    throw new ApiException(
      HRM_JD_YCTD_ALIAS,
      'job_template_id and job_description_id must refer to the same JD',
      HttpStatus.BAD_REQUEST,
    );
  }
  const id = physical || logical;
  return id || null;
}

export function requireYctdJdTemplateId(input: YctdJdAliasInput): string {
  const id = resolveYctdJdTemplateId(input);
  if (!id) {
    throw new ApiException(
      HRM_JD_YCTD_REQUIRED,
      'job_template_id (or job_description_id) is required to bind a standard JD',
      HttpStatus.BAD_REQUEST,
    );
  }
  return id;
}

export function assertYctdJdBindableOrThrow(
  row: YctdJdTemplateBindRow | null | undefined,
): YctdJdTemplateBindRow {
  if (!row) {
    throw new ApiException(
      HRM_JD_YCTD_NOT_FOUND,
      'JD template not found in scope',
      HttpStatus.NOT_FOUND,
    );
  }
  if (!isYctdJdBindable(row)) {
    throw new ApiException(
      HRM_JD_YCTD_STATUS,
      'Only active (Hiệu lực) JD templates can be bound to a requisition',
      HttpStatus.BAD_REQUEST,
    );
  }
  return row;
}

/** GĐ1: re-bind on draft/rejected/open/on_hold; lock approved+ / closed / cancelled / pending. */
export function assertYctdJdRebindAllowed(
  status: string | null | undefined,
): void {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  const allowed = new Set(['draft', 'rejected', 'open', 'on_hold']);
  if (!allowed.has(s)) {
    throw new ApiException(
      HRM_JD_YCTD_REBIND_LOCKED,
      'JD re-bind is locked for this requisition status',
      HttpStatus.CONFLICT,
    );
  }
}

export function toYctdJdPreview(row: YctdJdTemplateBindRow): YctdJdPreview {
  const active = assertYctdJdBindableOrThrow(row);
  const short = (active.job_description ?? '').trim() || '';
  return {
    job_template_id: active.id,
    job_description_id: active.id,
    code: active.code ?? '',
    title: active.title ?? '',
    short_description: short,
    requirements_preview: (active.requirements ?? '').trim() || undefined,
    status: 'active',
  };
}

/** Thin picker row — no values_json / layout canvas. status ∈ draft|active|retired (not inactive). */
export function toYctdBindableListItem(row: Record<string, unknown>) {
  const status = normalizeJdTemplateStatus({
    status: row.status as string | null | undefined,
    is_active: row.is_active as boolean | null | undefined,
  });
  const isActive = bridgeIsActiveForStatus(status);
  return {
    id: String(row.id),
    code: String(row.code ?? ''),
    title: String(row.title ?? ''),
    position_code: (row.position_code as string | null) ?? null,
    position_name: (row.position_name as string | null) ?? null,
    is_active: isActive,
    status,
    short_description: String(row.job_description ?? '').trim() || undefined,
  };
}

export function toRequisitionJdDisplayReady<T extends Record<string, unknown>>(
  row: T,
  jd?: { code?: string | null; title?: string | null } | null,
) {
  const templateId =
    (typeof row.job_template_id === 'string' && row.job_template_id.trim()) ||
    (typeof row.job_description_id === 'string' &&
      row.job_description_id.trim()) ||
    null;
  const jdCode =
    (typeof row.jd_code === 'string' && row.jd_code) || jd?.code || null;
  const jdTitle =
    (typeof row.jd_title === 'string' && row.jd_title) || jd?.title || null;
  return {
    ...row,
    job_template_id: templateId,
    job_description_id: templateId,
    jd_code: jdCode,
    jd_title: jdTitle,
  };
}
