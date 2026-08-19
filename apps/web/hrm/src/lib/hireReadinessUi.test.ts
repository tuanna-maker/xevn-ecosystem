import { describe, expect, it } from 'vitest';
import {
  HIRE_READINESS_UNAVAILABLE_VI,
  HTP_NO_ACTIVE_CONTRACT,
  hireReadinessBannerLabel,
  mapHireReadinessDto,
  resolveHireReadinessUiState,
} from './hireReadinessUi';

describe('hireReadinessUi — PO-HRM-E2E-LINK-EMP-FE-01', () => {
  it('maps display-ready HireReadiness DTO', () => {
    const dto = mapHireReadinessDto({
      employee_id: 'e1',
      company_id: 'c1',
      profile_ok: true,
      active_contract: { contract_id: 'ctr1', status: 'active' },
      ready_for_payroll: true,
      blockers: [],
    });
    expect(dto?.ready_for_payroll).toBe(true);
    expect(dto?.active_contract?.contract_id).toBe('ctr1');
  });

  it('honesty unavailable on 404 — never invent ready', () => {
    const state = resolveHireReadinessUiState({ loading: false, errorStatus: 404 });
    expect(state.kind).toBe('unavailable');
    if (state.kind === 'unavailable') {
      expect(state.reason).toContain('HTP-05');
      expect(hireReadinessBannerLabel(state)).toBe(HIRE_READINESS_UNAVAILABLE_VI);
    }
  });

  it('blocked when missing active contract', () => {
    const state = resolveHireReadinessUiState({
      loading: false,
      raw: {
        employee_id: 'e1',
        company_id: 'c1',
        profile_ok: true,
        active_contract: null,
        ready_for_payroll: false,
        blockers: [HTP_NO_ACTIVE_CONTRACT],
      },
    });
    expect(state.kind).toBe('blocked');
    if (state.kind === 'blocked') {
      expect(state.blockers).toContain(HTP_NO_ACTIVE_CONTRACT);
      expect(hireReadinessBannerLabel(state)).toMatch(/HRM-HTP-NO-ACTIVE-CONTRACT/);
    }
  });

  it('ready only when BE says so with contract', () => {
    const state = resolveHireReadinessUiState({
      loading: false,
      raw: {
        employee_id: 'e1',
        company_id: 'c1',
        profile_ok: true,
        active_contract: { contract_id: 'c', status: 'active' },
        ready_for_payroll: true,
        blockers: [],
      },
    });
    expect(state.kind).toBe('ready');
  });
});
