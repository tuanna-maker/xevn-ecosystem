/**
 * @CODE-MEMORY
 * Screen:     /attendance — Bảng công submitted → Ký chốt (WF XBOS)
 * UC:         UC-BP-ATT-11 · FR-UC-BP-ATT-11 · AC-ATT-11-* · J-HRM-ATT-11-01..06
 * BR:         BR-BP-TS-02 · R-SIGN-01 (FIXED_GĐ1 interim) · ATT-11-PATH/LADDER/REJECT/CLOSE/≠-LIVE-DONE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11 Diễn biến #1–#3 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md
 *             F-ATT-WF-SIGN-01/02 GET/POST …/attendance-sheets/{id}/signatures ·
 *             F-ATT-SHEET-02/03 POST …/close · …/reopen · Nest /core DENY ·
 *             DENY invent att_leave_hold · second sign ledger · CSUM/INBOX DONE · PAY OUT
 * Purpose:    Path lock + display-ready parse (header_id·status·statusLabelVi·steps[]·
 *             missing_mandatory_roles[]·can_close·policy_ready?) + FIXED_GĐ1 3 personas ·
 *             honesty ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 ·
 *             ≠ ATT UAT · CFG≠ATT-02 · printable false · Nest /core DENY.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttendanceSheetSignPanel · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT10QC1-MSLWGUYH (≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT) ·
 *             ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
 *             PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *             CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no FE invent Nest /core · no invent CSUM/INBOX/PAY
 * LastVerified: attSheet11Ring.test.ts · poHrmMvpGd1Att11ClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O1/O9) — Network MUST contain; Nest /core sign/close = FAIL. */
export const ATT_SHEET_11_PATH_ASSERT = {
  signatures: '/api/hrm/attendance/attendance-sheets/:sheetId/signatures',
  close: '/api/hrm/attendance/attendance-sheets/:sheetId/close',
  reopen: '/api/hrm/attendance/attendance-sheets/:sheetId/reopen',
  /** Peer ATT-10 must_keep — cite only · ≠ AGG=ATT-10 DONE. */
  aggregatePeer: '/api/hrm/attendance/attendance-sheets/:sheetId/aggregate',
  submitPeer: '/api/hrm/attendance/attendance-sheets/:sheetId/submit',
  nestCoreDenied: '/api/hrm/core/',
  /** DENY invent dual hold ledger (ATT-09 must_keep). */
  inventHoldTableDenied: 'att_leave_hold',
  /** DENY second sign ledger invent. */
  secondSignLedgerDenied: 'second_sign_ledger',
} as const;

/** FIXED_GĐ1 interim — ≠ full R-SIGN-01 DONE (R-ATT-11-WF residual). */
export const ATT_11_FIXED_GD1_PERSONAS = [
  'employee',
  'direct_manager',
  'hr_admin',
] as const;

export type Att11FixedGd1Persona = (typeof ATT_11_FIXED_GD1_PERSONAS)[number];

export const R_ATT_11_WF_FE = 'R-ATT-11-WF' as const;
export const R_ATT_11_DISP_FE = 'R-ATT-11-DISP' as const;
export const R_ATT_11_REJECT_FE = 'R-ATT-11-REJECT' as const;
export const R_ATT_11_CLOSE_FE = 'R-ATT-11-CLOSE' as const;
export const R_ATT_11_CSUM_OUT = 'R-ATT-11-CSUM' as const;
export const R_ATT_11_INBOX_OUT = 'R-ATT-11-INBOX' as const;

/** VI status labels — FE-derive when BE omits statusLabelVi (API-01 §8). */
export const ATT_11_STATUS_LABELS_VI: Record<string, string> = {
  draft: 'Nháp',
  open: 'Đang mở',
  submitted: 'Chờ ký',
  closed: 'Đã chốt',
};

export type Att11SignStepDisplay = {
  stepCode: string;
  personaRole: string;
  outcome: string;
  signedAt: string | null;
  signerUserId: string | null;
  comment: string | null;
};

export type Att11SignaturesDisplay = {
  headerId: string | null;
  status: string;
  statusLabelVi: string;
  steps: Att11SignStepDisplay[];
  missingMandatoryRoles: string[];
  canClose: boolean;
  policyReady: boolean | null;
  /** True when FIXED_GĐ1 all three present as approved and no reject. */
  ladderComplete: boolean;
  hasRejected: boolean;
};

export function isPhysicalAttSheet11Path(path: string): boolean {
  const p = String(path ?? '');
  return p.includes('/api/hrm/attendance/attendance-sheets');
}

export function isForbiddenAttSheet11SotPath(path: string): boolean {
  const p = String(path ?? '').toLowerCase();
  if (p.includes('/api/hrm/core/')) return true;
  if (p.includes('att_leave_hold')) return true;
  return false;
}

/** FE-derive statusLabelVi — wire label wins when non-empty. */
export function deriveAtt11StatusLabelVi(
  status: string | null | undefined,
  wireLabel?: string | null,
): string {
  const wire = String(wireLabel ?? '').trim();
  if (wire) return wire;
  const key = String(status ?? '')
    .trim()
    .toLowerCase();
  return ATT_11_STATUS_LABELS_VI[key] ?? (key || '—');
}

function parseStep(raw: unknown): Att11SignStepDisplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const stepCode = String(row.step_code ?? row.stepCode ?? '').trim();
  const personaRole = String(row.persona_role ?? row.personaRole ?? '').trim();
  if (!stepCode && !personaRole) return null;
  const signedAtRaw = row.signed_at ?? row.signedAt;
  const signedAt =
    signedAtRaw == null || String(signedAtRaw).trim() === ''
      ? null
      : String(signedAtRaw);
  const signerRaw = row.signer_user_id ?? row.signerUserId;
  const signerUserId =
    signerRaw == null || String(signerRaw).trim() === ''
      ? null
      : String(signerRaw);
  const commentRaw = row.comment;
  const comment =
    commentRaw == null || String(commentRaw).trim() === ''
      ? null
      : String(commentRaw).trim();
  return {
    stepCode: stepCode || personaRole,
    personaRole: personaRole || stepCode,
    outcome: String(row.outcome ?? '').trim() || '—',
    signedAt,
    signerUserId,
    comment,
  };
}

/** Display-ready GET signatures envelope — FE-derive statusLabelVi · FIXED_GĐ1 ladder hint. */
export function parseAtt11SignaturesDisplay(raw: unknown): Att11SignaturesDisplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const headerRaw = row.header_id ?? row.headerId ?? row.sheet_id ?? row.sheetId;
  const headerId =
    headerRaw == null || String(headerRaw).trim() === ''
      ? null
      : String(headerRaw).trim();
  const status = String(row.status ?? '').trim() || 'submitted';
  const statusLabelVi = deriveAtt11StatusLabelVi(
    status,
    typeof row.statusLabelVi === 'string'
      ? row.statusLabelVi
      : typeof row.status_label_vi === 'string'
        ? row.status_label_vi
        : typeof row.status_label === 'string'
          ? row.status_label
          : null,
  );
  const stepsRaw = row.steps;
  const steps: Att11SignStepDisplay[] = [];
  if (Array.isArray(stepsRaw)) {
    for (const item of stepsRaw) {
      const step = parseStep(item);
      if (step) steps.push(step);
    }
  }
  const missingRaw = row.missing_mandatory_roles ?? row.missingMandatoryRoles;
  const missingMandatoryRoles = Array.isArray(missingRaw)
    ? missingRaw.map((r) => String(r).trim()).filter(Boolean)
    : [];
  const canClose = Boolean(row.can_close ?? row.canClose ?? false);
  const policyRaw = row.policy_ready ?? row.policyReady;
  const policyReady =
    policyRaw === undefined || policyRaw === null ? null : Boolean(policyRaw);
  const hasRejected = steps.some((s) => s.outcome === 'rejected');
  const approved = new Set(
    steps.filter((s) => s.outcome === 'approved').map((s) => s.personaRole),
  );
  const ladderComplete =
    !hasRejected &&
    ATT_11_FIXED_GD1_PERSONAS.every((p) => approved.has(p));
  return {
    headerId,
    status,
    statusLabelVi,
    steps,
    missingMandatoryRoles,
    canClose,
    policyReady,
    ladderComplete,
    hasRejected,
  };
}

/** FIXED_GĐ1 footer — ≠ invent full R-SIGN-01 DONE. */
export function att11FixedGd1FooterText(): string {
  return 'Thang ký GĐ1: NV · QL · HCNS (FIXED_GĐ1 interim) — ≠ full R-SIGN-01 / FR-11 DONE (R-ATT-11-WF residual).';
}

/** CSUM / INBOX OUT GĐ1 footer. */
export function att11CsumInboxFooterText(): string {
  return 'Checksum / Inbox WF: OUT GĐ1 — ABSENT OK · không invent CSUM/INBOX DONE · emit timesheet.closed = response-only (≠ invent PAY DONE).';
}

export function att11HonestyBannerText(): string {
  return [
    'ATT-11 Ký chốt bảng công (WF XBOS) — C-SLICE · U65.',
    '≠ LIVE sign/close alone = ATT-11 DONE · ≠ AGG = ATT-10 DONE (ATT10QC1-MSLWGUYH · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT) · ≠ soft/ATT-08 = ATT-09 DONE · ≠ ATT module UAT · CFG ≠ ATT-02 DONE (ATT02QC1-MSLQZUK7).',
    'must_keep ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold · ATT08QC1-MSLSL36C preview RETAIN · ATT10 AGG/submit peer RETAIN.',
    'Nest /core DENY · DENY second sign ledger · printable false RETAIN · PAY OUT · FIXED_GĐ1 ≠ full R-SIGN-01 DONE.',
    att11FixedGd1FooterText(),
    att11CsumInboxFooterText(),
  ].join(' ');
}

/** Seal stamps for QA/source lock. */
export const ATT_11_MUST_KEEP_STAMPS = {
  att10: 'ATT10QC1-MSLWGUYH',
  att09: 'ATT09QC1-MSLUTL9D',
  att08: 'ATT08QC1-MSLSL36C',
  att02: 'ATT02QC1-MSLQZUK7',
  plt01: 'PLT01QC1-MSLPUQIU',
  core10: 'CORE10QC1-MSLP0EJB',
  core09: 'CORE09QC1-MSLNBA89',
  core07: 'CORE07QC1-KZJTSHNT',
} as const;

/** Always false for this seat — printable RETAIN false (CORE09QC1). */
export function att11PrintableReady(): boolean {
  void CONTRACTS_PRINTABLE_READY;
  return false;
}

export function att11PersonaLabelVi(persona: string): string {
  switch (persona) {
    case 'employee':
      return 'Nhân viên';
    case 'direct_manager':
      return 'Quản lý trực tiếp';
    case 'hr_admin':
      return 'HCNS / C&B';
    default:
      return persona || '—';
  }
}
