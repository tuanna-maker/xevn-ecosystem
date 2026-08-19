/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → CTA «Kích hoạt Hoạt động»
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07
 * BR:         BR-BP-LC-02 · AC-CORE-07-* · O1–O11
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 Luồng #1–#4 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md F-CORE-ACT-01
 * Purpose:    Helpers FE kích hoạt hồ sơ — prefer POST /employees/:id/activate (or gated PATCH);
 *             bind can_activate / blocking_items / effective_date; GATE 409 toast;
 *             checklist≠CORE-07 DONE · free PATCH≠DONE · soft≠CORE-06 DONE;
 *             Nest /core DENY · no invent PAY/CORE-09/ATT DONE · no honesty flip.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeActivatePanel · useEmployeeActivate · source tests
 * Callees:    (pure)
 * must_keep:  Physical /employees/:id/activate · CORE-06 soft≠DONE · CORE-03 CHK ≠ DONE · U65 · honesty false · C-SLICE
 * LastVerified: empCoreActRing.test.ts
 */

/** Toast / domain codes — space before slash in CODE-MEMORY comments only. */
export const HRM_EMP_ACT_CHECKLIST_INCOMPLETE_CODE = 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE';
export const HRM_EMP_ACT_400_CODE = 'HRM-EMP-ACT-400';
export const HRM_EMP_ACT_200_CODE = 'HRM-EMP-ACT-200';

/** Physical Network SoT (O1) — prefer thin activate. */
export const CORE_ACT_PATH_FRAGMENT = '/employees/';
export const CORE_ACT_SUFFIX = '/activate';
export const CORE_ACT_PAPER_CORE_PATH = '/api/hrm/core/employees';

/** Status spine HOLD RETAIN (O2). */
export const CORE_ACT_PENDING_STATUS = 'pending_docs';
export const CORE_ACT_ENABLED_STATUS = 'active';

export type CoreActBlockingItem = {
  documentTypeKey: string;
  nameVi: string;
  status: string;
};

export type CoreActEnvelope = {
  status: string;
  statusLabelVi: string;
  checklist_complete: boolean;
  can_activate: boolean;
  blocking_items: CoreActBlockingItem[];
  activated_at: string | null;
};

/** Honesty flags — FE MUST NOT flip. */
export const CORE_07_UAT_HONESTY = {
  recruitment_uat_ready: false,
  jd_dynamic_done: false,
  contracts_printable_ready: false,
  hrm_personnel_uat_ready: false,
} as const;

/**
 * Honesty footer — checklist CRUD / badge alone ≠ FR-07 DONE · free PATCH ≠ DONE ·
 * soft Profile ≠ CORE-06 DONE · Nest /core DENY · no invent PAY/ATT/CORE-09.
 */
export const CORE_07_ACT_NE_DONE_FOOTER_VI =
  'Checklist đủ / badge alone ≠ CORE-07 DONE · free PATCH status ≠ DONE · soft Profile ≠ CORE-06 DONE. Nest /core DENY · không invent PAY / CORE-09 / ATT enroll DONE.';

export function isCoreActPhysicalActivatePath(path: string): boolean {
  return path.includes('/employees/') && path.includes('/activate');
}

/** Nest dual /core activate SoT — FAIL O1. */
export function isForbiddenCoreActSotPath(path: string): boolean {
  if (!path.includes('/api/hrm/core/')) return false;
  const p = path.toLowerCase();
  return p.includes('/activate') || p.includes('/employees');
}

/** CTA visible only for pending_docs → active spine (O2). */
export function isActivateEligibleStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === CORE_ACT_PENDING_STATUS;
}

export function isActivatedStatus(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === CORE_ACT_ENABLED_STATUS;
}

/** Fallback VI when BE omits statusLabelVi (O11). Prefer BE display-ready. */
export function actStatusLabelFallback(status: string | null | undefined): string {
  const s = (status ?? '').trim().toLowerCase();
  if (s === CORE_ACT_PENDING_STATUS) return 'Chờ hoàn thiện';
  if (s === CORE_ACT_ENABLED_STATUS) return 'Hoạt động';
  if (s === 'inactive') return 'Ngừng';
  if (s === 'probation') return 'Thử việc';
  if (s === 'suspended') return 'Tạm nghỉ';
  return s || '—';
}

export function resolveActStatusLabel(
  status: string | null | undefined,
  statusLabelVi: string | null | undefined,
): string {
  const fromBe = (statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  return actStatusLabelFallback(status);
}

/**
 * Display activated_at — locale dd/MM/yyyy · null/invalid → «—» · DENY epoch junk.
 */
export function formatActivatedAtDisplay(
  activatedAt: string | null | undefined,
): string {
  const raw = (activatedAt ?? '').trim();
  if (!raw) return '—';
  // Already locale
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) return raw.slice(0, 10);
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) {
    const y = Number(iso[1]);
    if (y < 1971) return '—'; // epoch junk guard
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }
  const t = Date.parse(raw);
  if (Number.isNaN(t) || t < 86400000) return '—';
  const d = new Date(t);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (yyyy < 1971) return '—';
  return `${dd}/${mm}/${yyyy}`;
}

/** ISO yyyy-MM-dd (ViDateField store) → API wire dd/MM/yyyy (R-CORE-07-EFF-01). */
export function isoDateToViDdMmYyyy(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((iso ?? '').trim());
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function isValidViDdMmYyyy(value: string | null | undefined): boolean {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((value ?? '').trim());
  if (!m) return false;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1971) return false;
  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
}

/** Client gate before POST — missing/invalid effective_date. */
export function validateActivateEffectiveDateIso(iso: string | null | undefined): string | null {
  const vi = isoDateToViDdMmYyyy(iso);
  if (!vi || !isValidViDdMmYyyy(vi)) {
    return 'Thiếu hoặc sai ngày hiệu lực (dd/MM/yyyy). Chọn ngày rồi kích hoạt.';
  }
  return null;
}

/** Prefer POST body — F-CORE-ACT-01. */
export function buildActivatePostBody(effectiveDateIso: string): {
  effective_date: string;
} {
  const vi = isoDateToViDdMmYyyy(effectiveDateIso);
  if (!vi) {
    throw new Error('effective_date required');
  }
  return { effective_date: vi };
}

/**
 * Gated PATCH alt (same SoT) — status=active + effective_date.
 * CTA Network SHOULD prefer POST …/activate; this is acceptable alternate helper.
 * Free PATCH without date/gate ≠ CORE-07 DONE (O5).
 */
export function buildGatedActivatePatchBody(effectiveDateIso: string): {
  status: 'active';
  effective_date: string;
} {
  const vi = isoDateToViDdMmYyyy(effectiveDateIso);
  if (!vi) {
    throw new Error('effective_date required');
  }
  return { status: 'active', effective_date: vi };
}

type ChkLike = {
  status?: string | null;
  required?: boolean | null;
  requiredByDefault?: boolean | null;
  blocksActivation?: boolean | null;
  documentTypeKey?: string | null;
  nameVi?: string | null;
  archivedAt?: string | null;
};

function isArchivedChk(item: ChkLike): boolean {
  return Boolean((item.archivedAt ?? '').toString().trim());
}

/** Gate-relevant = required instance OR DOC required_by_default OR blocks_activation. */
export function isGateRelevantChkItem(item: ChkLike): boolean {
  if (isArchivedChk(item)) return false;
  if (item.required === true) return true;
  if (item.requiredByDefault === true) return true;
  if (item.blocksActivation === true) return true;
  return false;
}

export function isChkApproved(status: string | null | undefined): boolean {
  return (status ?? '').trim().toLowerCase() === 'approved';
}

/**
 * FE-derive when BE omits can_activate / blocking_items (DATA HOLD · wire-capable).
 * BE GATE remains authoritative on POST/PATCH — FE derive is CTA UX only (≠ claim DONE).
 */
export function deriveBlockingItemsFromChecklist(
  items: readonly ChkLike[],
): CoreActBlockingItem[] {
  const out: CoreActBlockingItem[] = [];
  for (const item of items) {
    if (!isGateRelevantChkItem(item)) continue;
    if (isChkApproved(item.status)) continue;
    out.push({
      documentTypeKey: (item.documentTypeKey ?? '').trim() || '—',
      nameVi: (item.nameVi ?? '').trim() || (item.documentTypeKey ?? '').trim() || '—',
      status: (item.status ?? 'missing').trim() || 'missing',
    });
  }
  return out;
}

export function deriveCanActivateFromChecklist(items: readonly ChkLike[]): boolean {
  return deriveBlockingItemsFromChecklist(items).length === 0;
}

export function pickActivateEnvelope(input: {
  status?: string | null;
  statusLabelVi?: string | null;
  status_label?: string | null;
  status_label_vi?: string | null;
  checklist_complete?: boolean | null;
  checklistComplete?: boolean | null;
  can_activate?: boolean | null;
  canActivate?: boolean | null;
  blocking_items?: CoreActBlockingItem[] | null;
  blockingItems?: CoreActBlockingItem[] | null;
  activated_at?: string | null;
  activatedAt?: string | null;
  /** FE-derive fallback when BE omits gate fields. */
  checklistItems?: readonly ChkLike[];
}): CoreActEnvelope {
  const status = (input.status ?? '').trim() || CORE_ACT_PENDING_STATUS;
  const statusLabelVi = resolveActStatusLabel(
    status,
    input.statusLabelVi ?? input.status_label_vi ?? input.status_label,
  );

  const beBlocking =
    input.blocking_items ?? input.blockingItems ?? null;
  const derivedBlocking =
    beBlocking ??
    (input.checklistItems
      ? deriveBlockingItemsFromChecklist(input.checklistItems)
      : []);

  const beComplete =
    input.checklist_complete ?? input.checklistComplete ?? null;
  const checklist_complete =
    typeof beComplete === 'boolean'
      ? beComplete
      : derivedBlocking.length === 0;

  const beCan = input.can_activate ?? input.canActivate ?? null;
  const can_activate =
    typeof beCan === 'boolean' ? beCan : checklist_complete;

  const activated_at = input.activated_at ?? input.activatedAt ?? null;

  return {
    status,
    statusLabelVi,
    checklist_complete,
    can_activate,
    blocking_items: derivedBlocking,
    activated_at,
  };
}
