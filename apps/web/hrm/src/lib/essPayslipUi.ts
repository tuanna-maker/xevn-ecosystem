/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Phiếu của tôi (ESS)
 * UC:         FR-UC-BP-PAY-08 · F-PAY-PAYSLIP-01 ESS
 * BR:         BR-BP-SLIP-01 — NV chỉ xem/xác nhận phiếu mình
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-08
 * TechSpec:   API_DESIGN F-PAY-PAYSLIP-01 · Nest GET/POST /payroll/me/payslips*
 * Purpose:    Pure display helpers ESS — confirm gate + stamp vi-VN; không invent công thức.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-ESS-FE-01
 * Coded:      2026-08-07
 * Callers:    EssPayslipsPanel · useMyEssPayslips · vitest
 * Callees:    formatDisplayDate · normalizeHrmApiListCompanyId
 * must_keep:  own-only 403 · CEO 403 · F5 after confirm · payroll_e2e_ready=false · U65 · no FE formula
 * SOLID:      Lib thuần — tách khỏi hrmApi/panel để vitest không kéo network
 * LastVerified: essPayslipUi.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-ESS-FE-02
 * change_mode: FIX
 * What: ADD resolveEssPayslipCompanyId — JWT/OU first via normalize (no holding→main coerce)
 * Why: QA-02 D-PAY-ESS-FE-SCOPE-COERCE — coerceHrmListCompanyId → company_id=main → 409
 * must_keep: L1 SEAL · CEO main → 403 ESS · no seed · payroll_e2e_ready=false
 */

import { formatDisplayDate, VI_DATETIME_DISPLAY_PATTERN } from '@/lib/formatDisplayDate';
import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';

/** Statuses BE allows for ESS confirm (not draft). */
const CONFIRMABLE_STATUSES = new Set(['processed', 'paid']);

export function parseEssDisplayAmount(raw: string | number | null | undefined): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string') {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatEssMoney(raw: string | number | null | undefined, currency = 'VND'): string {
  const amount = parseEssDisplayAmount(raw);
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

/** Confirm CTA only when BE status is processed|paid and not already confirmed. */
export function canConfirmEssPayslip(input: {
  status?: string | null;
  ess_confirmed?: boolean | null;
}): boolean {
  if (input.ess_confirmed === true) return false;
  const status = String(input.status ?? '')
    .trim()
    .toLowerCase();
  return CONFIRMABLE_STATUSES.has(status);
}

export function formatEssConfirmStamp(iso: string | null | undefined): string {
  const raw = String(iso ?? '').trim();
  if (!raw) return '—';
  return formatDisplayDate(raw, VI_DATETIME_DISPLAY_PATTERN);
}

export type EssConfirmBadgeKind = 'confirmed' | 'pending' | 'draft' | 'other';

export function resolveEssConfirmBadgeKind(input: {
  status?: string | null;
  ess_confirmed?: boolean | null;
}): EssConfirmBadgeKind {
  if (input.ess_confirmed === true) return 'confirmed';
  const status = String(input.status ?? '')
    .trim()
    .toLowerCase();
  if (status === 'draft') return 'draft';
  if (CONFIRMABLE_STATUSES.has(status)) return 'pending';
  return 'other';
}

/**
 * Resolve company_id for ESS me/payslips*.
 * Priority: JWT claim → URL companyId → Auth currentCompanyId.
 * Uses normalizeHrmApiListCompanyId (preserves holding) — never coerceHrmListCompanyId.
 */
export function resolveEssPayslipCompanyId(input: {
  jwtCompanyId?: string | null;
  queryCompanyId?: string | null;
  authCompanyId?: string | null;
}): string | null {
  for (const raw of [input.jwtCompanyId, input.queryCompanyId, input.authCompanyId]) {
    const id = String(raw ?? '').trim();
    if (!id || id === 'all') continue;
    return normalizeHrmApiListCompanyId(id);
  }
  return null;
}

/** Show CEO own-only hint only on ESS 403 — not on 409 SCOPE_CONTEXT_MISMATCH. */
export function shouldShowEssOwnOnlyHint(errorMessage: string | null | undefined): boolean {
  const msg = String(errorMessage ?? '').toLowerCase();
  if (!msg) return false;
  if (msg.includes('scope_context_mismatch') || msg.includes('phạm vi tenant/công ty không khớp')) {
    return false;
  }
  return (
    msg.includes('hrm-pay-403-ess') ||
    msg.includes('403') ||
    msg.includes('hồ sơ nhân viên') ||
    msg.includes('employee')
  );
}
