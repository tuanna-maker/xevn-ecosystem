/**
 * @CODE-MEMORY
 * Screen:     /contracts — pack suggest + ephemeral preview fidelity (CORE-09b)
 * UC:         UC-BP-CORE-09b · AC-CORE-09B-01..09 · AC-CTR-PRINT-01..03/06..08
 * BR:         BR-CTR-CL-02/04 · BR-CTR-CL-03 no FE legal body SoT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09b Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md
 *             F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 RETAIN
 * Purpose:    Display-ready pack VI + suggest banner + preview meta helpers —
 *             DENY invent Nest /core dual · DENY FE hardcode long legal body.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    ContractPrintSpinePanel
 * Callees:    contractLegalPrintConstants labels
 * must_keep:  CONTRACTS_PRINTABLE_READY=false · UF-HRM-02 registry · CORE-09a CL consume
 * SOLID:      Pure UX helpers tách panel / hrmApi
 * LastVerified: contractPackPreviewUx.test.ts
 */

import {
  CONTRACT_PACK_CODES,
  CONTRACT_PACK_LABELS,
  type ContractPackCode,
} from '@/lib/contractLegalPrintConstants';

/** GĐ1 MVP packs — LOGISTICS optional / not mandatory AC. */
export const CONTRACT_PACK_MVP_CODES = ['GENERAL', 'IT_OFFICE', 'DRIVER'] as const;
export type ContractPackMvpCode = (typeof CONTRACT_PACK_MVP_CODES)[number];

/** DRIVER block fields (BE validatePreview / mandatoryGate). */
export const CONTRACT_DRIVER_PREVIEW_FIELDS = [
  'license_class',
  'driver_license_class',
  'driver_license_number',
  'driver_license_issued_on',
  'driver_license_issued_place',
  'vehicle_plate',
] as const;

/** Merged_fields keys for preview layout summary (A/B · job · term) — labels only. */
export const CONTRACT_PREVIEW_SUMMARY_FIELD_LABELS: Record<string, string> = {
  company_name: 'Bên A (đơn vị)',
  employer_name: 'Bên A (đơn vị)',
  employee_full_name: 'Bên B (người lao động)',
  job_title: 'Công việc / chức danh',
  job_description_text: 'Mô tả công việc',
  work_location: 'Nơi làm việc',
  effective_from: 'Ngày hiệu lực',
  start_date: 'Ngày bắt đầu',
  end_date: 'Ngày kết thúc',
  term_type: 'Loại thời hạn',
  contract_number: 'Số HĐ',
};

export function isContractPackCode(value: string): value is ContractPackCode {
  return (CONTRACT_PACK_CODES as readonly string[]).includes(value);
}

export function packLabelVi(packCode: string | null | undefined): string {
  const code = String(packCode ?? '').trim();
  if (!code) return '—';
  if (isContractPackCode(code)) return CONTRACT_PACK_LABELS[code];
  return code;
}

/**
 * Picker order: MVP first (GENERAL / IT_OFFICE / DRIVER), then optional (LOGISTICS).
 * When BE returns allowed_packs, filter to that set (still MVP-first).
 */
export function packsForPicker(allowedPacks?: string[] | null): ContractPackCode[] {
  const allowed =
    Array.isArray(allowedPacks) && allowedPacks.length > 0
      ? new Set(allowedPacks.map((p) => String(p).trim()).filter(Boolean))
      : null;
  const ordered = [
    ...CONTRACT_PACK_MVP_CODES,
    ...CONTRACT_PACK_CODES.filter(
      (c) => !(CONTRACT_PACK_MVP_CODES as readonly string[]).includes(c),
    ),
  ];
  const unique: ContractPackCode[] = [];
  for (const code of ordered) {
    if (allowed && !allowed.has(code)) continue;
    if (!unique.includes(code)) unique.push(code);
  }
  return unique.length > 0 ? unique : [...CONTRACT_PACK_CODES];
}

export function formatPackSuggestReason(reason: string | null | undefined): string {
  const raw = String(reason ?? '').trim();
  if (!raw) return 'Gợi ý mặc định từ quy tắc gói nghề.';
  if (raw.startsWith('job_family:')) {
    return `Theo họ nghề: ${raw.slice('job_family:'.length).trim() || '—'}`;
  }
  if (raw === 'fallback_rule') return 'Theo quy tắc dự phòng (fallback).';
  if (raw === 'hard_default_GENERAL') return 'Mặc định cứng: Chung (GENERAL).';
  return raw;
}

export function shouldShowDriverPreviewBlock(opts: {
  packCode: string;
  showDriverLicenseBlock?: boolean | null;
}): boolean {
  if (opts.showDriverLicenseBlock === true) return true;
  return String(opts.packCode ?? '').trim() === 'DRIVER';
}

export function isDriverPreviewField(field: string): boolean {
  return (CONTRACT_DRIVER_PREVIEW_FIELDS as readonly string[]).includes(field);
}

/**
 * Fingerprint clause codes for IT↔DRIVER diff assert (O6) — titles/codes only, no body SoT.
 */
export function clauseCodeFingerprint(
  clauses: Array<{ code?: string | null }> | null | undefined,
): string {
  if (!Array.isArray(clauses) || clauses.length === 0) return '';
  return clauses
    .map((c) => String(c?.code ?? '').trim())
    .filter(Boolean)
    .sort()
    .join('|');
}

export type PreviewSummaryRow = { key: string; label: string; value: string };

/** Pick display-ready rows from merged_fields for text layout (AC-CORE-09B-02). */
export function previewMergedSummaryRows(
  merged: Record<string, unknown> | null | undefined,
): PreviewSummaryRow[] {
  if (!merged || typeof merged !== 'object') return [];
  const rows: PreviewSummaryRow[] = [];
  const seenLabels = new Set<string>();
  for (const [key, label] of Object.entries(CONTRACT_PREVIEW_SUMMARY_FIELD_LABELS)) {
    if (!(key in merged)) continue;
    const raw = merged[key];
    if (raw === null || raw === undefined) continue;
    const value = String(raw).trim();
    if (!value || value === '***') continue;
    if (seenLabels.has(label)) continue;
    seenLabels.add(label);
    rows.push({ key, label, value });
  }
  return rows;
}

export function missingClauseLabels(
  missing: Array<string | { code?: string; title_vi?: string }> | null | undefined,
): string[] {
  if (!Array.isArray(missing) || missing.length === 0) return [];
  const out: string[] = [];
  for (const item of missing) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    if (item && typeof item === 'object') {
      const title = String(item.title_vi ?? '').trim();
      const code = String(item.code ?? '').trim();
      const label = title && code ? `${title} (${code})` : title || code;
      if (label) out.push(label);
    }
  }
  return out;
}
