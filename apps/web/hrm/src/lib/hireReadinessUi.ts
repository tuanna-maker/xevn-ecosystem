/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile — HTP-05 hire readiness banner
 * UC:         FR-UC-BP-REC-07 · AC-HTP-05-01..03
 * BR:         ready_for_payroll chỉ khi BE trả DTO; 404 → honesty (không giả PASS)
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.6
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-HTP-05
 * Purpose:    Map HireReadiness display-ready; honest unavailable when BE chưa expose.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    HireReadinessBanner · hireReadinessUi.test.ts
 * Callees:    none
 * FEActions:  Profile load → GET hire-readiness → banner ready/blocked/unavailable
 * BEChain:    GET /api/hrm/employees/:id/hire-readiness
 * Impact:     FE tự set ready=true khi thiếu HĐ → payroll bước 6 sai
 * must_keep:  Honesty unavailable; blocker codes from BE; U65 no seed; no claim UAT
 * SOLID:      Pure mapper / state machine
 * LastVerified: apps/web/hrm/src/lib/hireReadinessUi.test.ts
 */

export type HireReadinessDto = {
  employee_id: string;
  company_id: string;
  profile_ok: boolean;
  active_contract: { contract_id: string; status: string } | null;
  ready_for_payroll: boolean;
  blockers: string[];
};

export type HireReadinessUiState =
  | { kind: 'loading' }
  | { kind: 'unavailable'; reason: string }
  | { kind: 'ready'; dto: HireReadinessDto }
  | { kind: 'blocked'; dto: HireReadinessDto; blockers: string[] };

export const HTP_NO_ACTIVE_CONTRACT = 'HRM-HTP-NO-ACTIVE-CONTRACT';

export const HIRE_READINESS_UNAVAILABLE_VI =
  'API sẵn sàng bước 5 (HTP-05) chưa khả dụng — không giả sẵn sàng payroll. Chờ BE F-CORE-HTP-05.';

export function mapHireReadinessDto(raw: unknown): HireReadinessDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const employee_id = String(r.employee_id ?? '').trim();
  const company_id = String(r.company_id ?? '').trim();
  if (!employee_id || !company_id) return null;

  let active_contract: HireReadinessDto['active_contract'] = null;
  const ac = r.active_contract;
  if (ac && typeof ac === 'object') {
    const c = ac as Record<string, unknown>;
    const contract_id = String(c.contract_id ?? c.id ?? '').trim();
    const status = String(c.status ?? '').trim();
    if (contract_id) {
      active_contract = { contract_id, status: status || 'active' };
    }
  }

  const blockers = Array.isArray(r.blockers)
    ? r.blockers.map((b) => String(b)).filter(Boolean)
    : [];

  return {
    employee_id,
    company_id,
    profile_ok: Boolean(r.profile_ok),
    active_contract,
    ready_for_payroll: Boolean(r.ready_for_payroll),
    blockers,
  };
}

export function resolveHireReadinessUiState(input: {
  loading: boolean;
  errorStatus?: number | null;
  errorCode?: string | null;
  raw?: unknown;
}): HireReadinessUiState {
  if (input.loading) return { kind: 'loading' };

  if (input.errorStatus === 404 || input.errorCode === 'HRM-DATA-404') {
    return { kind: 'unavailable', reason: HIRE_READINESS_UNAVAILABLE_VI };
  }

  if (input.errorStatus != null && input.errorStatus >= 400) {
    return {
      kind: 'unavailable',
      reason:
        input.errorStatus === 409
          ? 'Ngoài phạm vi đơn vị — không đọc sẵn sàng bước 5.'
          : HIRE_READINESS_UNAVAILABLE_VI,
    };
  }

  const dto = mapHireReadinessDto(input.raw);
  if (!dto) {
    return { kind: 'unavailable', reason: HIRE_READINESS_UNAVAILABLE_VI };
  }

  if (dto.ready_for_payroll && dto.profile_ok && dto.active_contract) {
    return { kind: 'ready', dto };
  }

  const blockers =
    dto.blockers.length > 0
      ? dto.blockers
      : !dto.active_contract
        ? [HTP_NO_ACTIVE_CONTRACT]
        : ['HRM-HTP-NOT-READY'];

  return { kind: 'blocked', dto, blockers };
}

export function hireReadinessBannerLabel(state: HireReadinessUiState): string {
  switch (state.kind) {
    case 'loading':
      return 'Đang kiểm tra sẵn sàng bước 5…';
    case 'unavailable':
      return state.reason;
    case 'ready':
      return 'Sẵn sàng bước 5 (có HĐ hiệu lực cùng pháp nhân) — payroll bước 6 có thể đọc gate.';
    case 'blocked':
      return `Chưa sẵn sàng payroll bước 6 — ${state.blockers.join(', ')}`;
    default:
      return HIRE_READINESS_UNAVAILABLE_VI;
  }
}
