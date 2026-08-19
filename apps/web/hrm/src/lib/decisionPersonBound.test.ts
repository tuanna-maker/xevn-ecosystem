import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PERSON_BOUND_DECISION_TYPES,
  WORK_HISTORY_NEO_DECISION_TYPES,
  isDecisionEffectiveStatus,
  isPersonBoundDecisionType,
  isWorkHistoryNeoDecisionType,
  requireEmployeeIdForDecision,
  validateDecisionCreateForm,
} from './decisionPersonBound';

describe('decisionPersonBound — PO-HRM-E2E-LINK-EMP-FE-01', () => {
  it('marks appointment/transfer/promotion as person-bound', () => {
    expect(isPersonBoundDecisionType('appointment')).toBe(true);
    expect(isPersonBoundDecisionType('transfer')).toBe(true);
    expect(isPersonBoundDecisionType('promotion')).toBe(true);
    expect(DEFAULT_PERSON_BOUND_DECISION_TYPES).toContain('appointment');
  });

  it('maps live HRD_* catalog codes like BE (OBS-D1-HINT / BE-03)', () => {
    expect(isPersonBoundDecisionType('HRD_01')).toBe(true);
    expect(isPersonBoundDecisionType('hrd_02')).toBe(true);
    expect(isPersonBoundDecisionType('HRD_03')).toBe(true);
    expect(isWorkHistoryNeoDecisionType('HRD_01')).toBe(true);
    expect(isWorkHistoryNeoDecisionType('HRD_02')).toBe(true);
    expect(isWorkHistoryNeoDecisionType('HRD_03')).toBe(false);
    expect(WORK_HISTORY_NEO_DECISION_TYPES).toContain('hrd_01');
  });

  it('does not require employee for reward/discipline by default', () => {
    expect(isPersonBoundDecisionType('reward')).toBe(false);
    expect(isPersonBoundDecisionType('discipline')).toBe(false);
    expect(requireEmployeeIdForDecision({ decision_type: 'reward', employee_id: '' }).ok).toBe(
      true,
    );
  });

  it('requires employee_id for person-bound types', () => {
    const fail = requireEmployeeIdForDecision({
      decision_type: 'appointment',
      employee_id: '  ',
    });
    expect(fail.ok).toBe(false);
    if (!fail.ok) expect(fail.code).toBe('HRM-DEC-EMP-REQUIRED');

    const ok = requireEmployeeIdForDecision({
      decision_type: 'transfer',
      employee_id: 'emp-uuid-1',
    });
    expect(ok.ok).toBe(true);

    const hrd = requireEmployeeIdForDecision({
      decision_type: 'HRD_01',
      employee_id: '',
    });
    expect(hrd.ok).toBe(false);
  });

  it('detects effective status for WH surface toast', () => {
    expect(isDecisionEffectiveStatus('effective')).toBe(true);
    expect(isDecisionEffectiveStatus('draft')).toBe(false);
  });
});

describe('validateDecisionCreateForm — PO-HRM-E2E-LINK-EMP-FE-02', () => {
  const base = {
    decision_code: 'QĐ-QA-01',
    title: 'Bổ nhiệm thử',
    employee_name: 'UAT NV 0100',
    decision_type: 'appointment',
    employee_id: 'emp-uuid-1',
    positionCatalogOk: true,
  };

  it('passes when HDSD required fields + catalog position are set', () => {
    expect(validateDecisionCreateForm(base).ok).toBe(true);
  });

  it('blocks empty decision_code before POST', () => {
    const r = validateDecisionCreateForm({ ...base, decision_code: '  ' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.field).toBe('decision_code');
  });

  it('blocks missing catalog position_key (no free-text SoT)', () => {
    const r = validateDecisionCreateForm({ ...base, positionCatalogOk: false });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.field).toBe('position_key');
      expect(r.message).toMatch(/danh mục/i);
    }
  });

  it('blocks person-bound without employee_id', () => {
    const r = validateDecisionCreateForm({ ...base, employee_id: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.field).toBe('employee_id');
  });

  it('allows reward without employee_id when position ok', () => {
    const r = validateDecisionCreateForm({
      ...base,
      decision_type: 'reward',
      employee_id: '',
    });
    expect(r.ok).toBe(true);
  });
});
