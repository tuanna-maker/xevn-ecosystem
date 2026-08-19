/**
 * @CODE-MEMORY
 * Screen:     Vòng mật C&B (HĐ–BH / Đãi ngộ / BH)
 * UC:         UC-BP-CORE-02 · FR-UC-BP-CORE-02
 * BR:         BR-BP-SEC-02 · BR-CORE-CB-PATH · BR-CORE-CB-BANK-MST · AC-CORE-CB-01/02
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02 Diễn biến #1–#4 · AC-CORE-CB-01/02
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md F-CORE-EMP-02 · F-CORE-SI-*
 * Purpose:    Helpers FE vòng mật — path SoT packages/SI; mask NH/MST view; tách PATCH meta vs
 *             change_rate; cấm Nest /core dual · same-form public+salary · FE invent payslip SoT.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeCompensationPanel · useEmployeeCompensation · useEmployeeInsurance · source tests
 * Callees:    (pure)
 * must_keep:  Physical packages* + employee-insurances* · CORE-01 public ≠ C&B DONE · U65 · honesty false
 * LastVerified: empCoreCbRing.test.ts
 */

/** Toast codes — space before slash in comments only (CODE-MEMORY safe). */
export const HRM_CORE_CB_AUTHZ_403_CODE = 'HRM-CORE-CB-AUTHZ-403';
export const HRM_CORE_CB_VAL_400_CODE = 'HRM-CORE-CB-VAL-400';
export const HRM_COMP_409_OVERLAP_CODE = 'HRM-COMP-409-OVERLAP';
export const HRM_CORE_CB_OVERLAP_409_CODE = 'HRM-CORE-CB-OVERLAP-409';
/** RETAIN public deny — ≠ AuthZ C&B open. */
export const HRM_CORE_CB_403_PUBLIC_CODE = 'HRM-CORE-CB-403';

/** Physical Network SoT (O1) — QA assert path contains these. */
export const CORE_CB_PACKAGES_PATH = '/api/hrm/contracts-insurance/compensation-packages';
export const CORE_CB_HISTORY_PATH = '/api/hrm/contracts-insurance/compensation-history';
export const CORE_CB_SI_PATH = '/api/hrm/employee-insurances';

/** Paper alias — DENY as Nest SoT (docs only). */
export const CORE_CB_PAPER_CORE_COMPENSATION = '/api/hrm/core/employees';

export function isCoreCbPackagesPhysicalPath(path: string): boolean {
  return (
    path.includes('/contracts-insurance/compensation-packages') ||
    path.includes('/contracts-insurance/compensation-history')
  );
}

export function isCoreCbSiPhysicalPath(path: string): boolean {
  return path.includes('/employee-insurances');
}

export function isForbiddenCoreCompensationSotPath(path: string): boolean {
  return (
    path.includes('/api/hrm/core/') &&
    (path.includes('/compensation') || path.includes('/employee-insurances'))
  );
}

/** Mask bank account for view-only — keep last 4 digits. */
export function maskBankAccountView(raw: string | null | undefined): string {
  const s = (raw ?? '').trim();
  if (!s) return '—';
  if (s.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, s.length - 4))}${s.slice(-4)}`;
}

/** Mask MST / tax_id view-only — keep last 3. */
export function maskTaxIdView(raw: string | null | undefined): string {
  const s = (raw ?? '').trim();
  if (!s) return '—';
  if (s.length <= 3) return '•••';
  return `${'•'.repeat(Math.min(6, s.length - 3))}${s.slice(-3)}`;
}

export type SiEnrollmentAmounts = {
  contribution?: number | null;
  employer_contribution?: number | null;
};

/**
 * Split SI edit: amount delta → actions change_rate; meta PATCH must omit contrib keys
 * (BE fail-closed prefer 400 if PATCH contrib delta).
 */
export function splitSiEnrollmentUpdate(input: {
  previous: SiEnrollmentAmounts;
  next: SiEnrollmentAmounts & Record<string, unknown>;
}): {
  metaOnly: Record<string, unknown>;
  rateChange: { contribution: number; employer_contribution: number } | null;
} {
  const prevEmp = Number(input.previous.contribution ?? 0);
  const prevEr = Number(input.previous.employer_contribution ?? 0);
  const nextEmp = Number(input.next.contribution ?? prevEmp);
  const nextEr = Number(input.next.employer_contribution ?? prevEr);
  const rateChanged =
    Number.isFinite(nextEmp) &&
    Number.isFinite(nextEr) &&
    (nextEmp !== prevEmp || nextEr !== prevEr);

  const metaOnly: Record<string, unknown> = { ...input.next };
  delete metaOnly.contribution;
  delete metaOnly.employer_contribution;

  return {
    metaOnly,
    rateChange: rateChanged
      ? { contribution: nextEmp, employer_contribution: nextEr }
      : null,
  };
}
