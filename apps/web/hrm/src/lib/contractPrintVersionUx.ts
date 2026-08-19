/**
 * @CODE-MEMORY
 * Screen:     /contracts — Lưu phiên bản in + PDF HĐLĐ (CORE-09c)
 * UC:         UC-BP-CORE-09c · AC-CORE-09C-01..08 · AC-CTR-PRINT-01/04/05/06/08
 * BR:         BR-CTR-CL-01/02/04 · BR-CORE-VER-F5
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09c Diễn biến #1–#5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md
 *             F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 RETAIN
 * Purpose:    Display-ready VER list/detail + issue-blocked missing lists + PDF
 *             %PDF assert helpers — DENY Nest /core dual · DENY FE invent PDF
 *             by re-merging live library · DENY PREV→INSERT VER.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    ContractPrintSpinePanel · fetchContractPrintPdf consumers
 * Callees:    formatDisplayDate · contractPackPreviewUx · contractPrintFieldOverrides
 * must_keep:  CONTRACTS_PRINTABLE_READY=false · CORE-09b PACK+PREV ephemeral
 *             · CORE-09a CL · Nest /core DENY · no 09d TPL invent DONE
 * SOLID:      Pure UX helpers tách panel / hrmApi
 * LastVerified: contractPrintVersionUx.test.ts
 */

import { formatDisplayDate } from '@/lib/formatDisplayDate';
import { packLabelVi, missingClauseLabels } from '@/lib/contractPackPreviewUx';
import {
  labelForPrintOverrideField,
  normalizePreviewMissingFields,
  type PreviewMissingFieldItem,
} from '@/lib/contractPrintFieldOverrides';
import { ApiClientError } from '@/lib/apiError';

/** Physical SoT paths (O1) — Network MUST contain these; Nest /core = FAIL. */
export const CORE_CTR_VER_PATH_ASSERT = {
  createPrintVersionsPath:
    '/api/hrm/contracts-insurance/contracts/:contractId/print-versions',
  listPrintVersionsPath:
    '/api/hrm/contracts-insurance/contracts/:contractId/print-versions',
  getPrintVersionPath:
    '/api/hrm/contracts-insurance/contracts/:contractId/print-versions/:versionId',
  pdfPath: '/api/hrm/contracts-insurance/print-versions/:versionId/pdf',
  previewMustKeepPath: '/api/hrm/contracts-insurance/contracts/:contractId/preview',
  packMustKeepPath: '/api/hrm/contracts-insurance/contracts/pack-resolve',
  nestCoreDenied: '/api/hrm/core/',
} as const;

export const CONTRACT_PRINT_VERSION_STATUSES = [
  'draft_preview',
  'issued',
  'superseded',
] as const;
export type ContractPrintVersionStatus = (typeof CONTRACT_PRINT_VERSION_STATUSES)[number];

export const CONTRACT_PRINT_VERSION_STATUS_LABELS: Record<
  ContractPrintVersionStatus,
  string
> = {
  draft_preview: 'Nháp xem trước',
  issued: 'Đã phát hành',
  superseded: 'Đã thay thế',
};

export function printVersionStatusLabel(status: string | null | undefined): string {
  const raw = String(status ?? '').trim();
  if (!raw) return '—';
  if ((CONTRACT_PRINT_VERSION_STATUSES as readonly string[]).includes(raw)) {
    return CONTRACT_PRINT_VERSION_STATUS_LABELS[raw as ContractPrintVersionStatus];
  }
  return raw;
}

export function formatPrintVersionIssuedAt(
  issuedAt: string | null | undefined,
): string {
  return formatDisplayDate(issuedAt, 'dd/MM/yyyy HH:mm');
}

export type PrintVersionListRowInput = {
  id: string;
  version_no: number;
  pack_code: string;
  status: string;
  issued_at?: string | null;
  template_code?: string | null;
};

/** List/detail line after HRM-CTR-VER-201 — pack_code + version_no + status + issued_at. */
export function formatPrintVersionListLine(v: PrintVersionListRowInput): string {
  const pack = packLabelVi(v.pack_code);
  const packCode = String(v.pack_code ?? '').trim() || '—';
  const ver = Number.isFinite(v.version_no) ? `v${v.version_no}` : 'v—';
  const status = printVersionStatusLabel(v.status);
  const issued = formatPrintVersionIssuedAt(v.issued_at);
  const tpl = String(v.template_code ?? '').trim();
  const parts = [
    ver,
    `${pack} (${packCode})`,
    status,
    issued !== '—' ? `phát hành ${issued}` : null,
    tpl ? `mẫu ${tpl}` : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function isIssuedPrintVersion(status: string | null | undefined): boolean {
  return String(status ?? '').trim() === 'issued';
}

export type IssueBlockedDetails = {
  missing_fields: PreviewMissingFieldItem[];
  missing_clauses: string[];
};

/** Pull missing_* from ISSUE-BLOCKED / DRIVER / TERM ApiClientError.details. */
export function extractIssueBlockedDetails(error: unknown): IssueBlockedDetails {
  const empty: IssueBlockedDetails = { missing_fields: [], missing_clauses: [] };
  if (!(error instanceof ApiClientError) || !error.details || typeof error.details !== 'object') {
    return empty;
  }
  const d = error.details as {
    missing_fields?: unknown;
    missing_clauses?: unknown;
  };
  return {
    missing_fields: normalizePreviewMissingFields(d.missing_fields as never),
    missing_clauses: missingClauseLabels(d.missing_clauses as never),
  };
}

export function formatIssueBlockedMissingSummary(details: IssueBlockedDetails): string {
  const parts: string[] = [];
  if (details.missing_fields.length) {
    parts.push(
      `Thiếu field: ${details.missing_fields
        .map((m) =>
          m.message
            ? `${labelForPrintOverrideField(m.field)} (${m.message})`
            : labelForPrintOverrideField(m.field),
        )
        .join(', ')}`,
    );
  }
  if (details.missing_clauses.length) {
    parts.push(`Thiếu clause: ${details.missing_clauses.join(', ')}`);
  }
  return parts.join(' · ');
}

const ISSUE_GATE_CODES = new Set([
  'HRM-CTR-ISSUE-BLOCKED',
  'HRM-CTR-DRIVER-REQUIRED',
  'HRM-CTR-TERM-INVALID',
  'HRM-CTR-TPL-NONE',
  'HRM-CTR-PACK-INVALID',
  'HRM-CTR-TPL-PACK-MISMATCH',
]);

export function isIssueGateErrorCode(code: string | null | undefined): boolean {
  return ISSUE_GATE_CODES.has(String(code ?? '').trim());
}

/** PDF magic — body must start with %PDF (AC-CTR-PRINT-05). */
export function assertPdfMagic(bytes: ArrayBuffer | Uint8Array): boolean {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u8.length < 4) return false;
  return (
    u8[0] === 0x25 && // %
    u8[1] === 0x50 && // P
    u8[2] === 0x44 && // D
    u8[3] === 0x46 // F
  );
}

export async function blobStartsWithPdfMagic(blob: Blob): Promise<boolean> {
  const head = await blob.slice(0, 5).arrayBuffer();
  return assertPdfMagic(head);
}

export function contractPrintPdfFilename(opts: {
  contract_id?: string | null;
  version_id: string;
  version_no?: number | null;
}): string {
  const ver =
    opts.version_no != null && Number.isFinite(opts.version_no)
      ? `v${opts.version_no}`
      : opts.version_id.slice(0, 8);
  const cid = String(opts.contract_id ?? '').trim() || 'contract';
  return `contract-${cid}-${ver}.pdf`;
}

/** DENY FE invent PDF from live clause re-merge — only issued snapshot GET. */
export const CORE_CTR_PDF_SNAPSHOT_ONLY_ASSERT = {
  denyLiveLibraryRemerge: true,
  requireIssuedStatus: true,
  versionNotIssuedCode: 'HRM-CTR-VERSION-NOT-ISSUED',
} as const;
