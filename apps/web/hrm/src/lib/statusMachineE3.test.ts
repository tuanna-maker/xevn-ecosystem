import { describe, expect, it } from 'vitest';
import {
  canDeletePerformanceCycle,
  canDeletePerformanceEval,
  isInsurancePolicyTransitionAllowed,
  isPerformanceCycleTransitionAllowed,
  isPerformanceEvalTransitionAllowed,
  nextInsurancePolicyStatuses,
  nextPerformanceCycleStatuses,
  nextPerformanceEvalStatuses,
} from './statusMachineE3';

describe('statusMachineE3 — cycle (orthogonal to eval)', () => {
  it('draft → active|closed; active → closed; closed terminal', () => {
    expect(nextPerformanceCycleStatuses('draft')).toEqual(['active', 'closed']);
    expect(nextPerformanceCycleStatuses('active')).toEqual(['closed']);
    expect(nextPerformanceCycleStatuses('closed')).toEqual([]);
    expect(nextPerformanceCycleStatuses('open')).toEqual(['closed']); // open ≡ active
  });

  it('rejects illegal cycle jumps', () => {
    expect(isPerformanceCycleTransitionAllowed('closed', 'active')).toBe(false);
    expect(isPerformanceCycleTransitionAllowed('active', 'draft')).toBe(false);
    expect(isPerformanceCycleTransitionAllowed('draft', 'active')).toBe(true);
  });

  it('delete only draft', () => {
    expect(canDeletePerformanceCycle('draft')).toBe(true);
    expect(canDeletePerformanceCycle('active')).toBe(false);
  });
});

describe('statusMachineE3 — eval 4-state (no jump / no withdraw)', () => {
  it('linear next only', () => {
    expect(nextPerformanceEvalStatuses('draft')).toEqual(['submitted']);
    expect(nextPerformanceEvalStatuses('submitted')).toEqual(['approved']);
    expect(nextPerformanceEvalStatuses('approved')).toEqual(['completed']);
    expect(nextPerformanceEvalStatuses('completed')).toEqual([]);
  });

  it('rejects draft→approved and submitted→draft', () => {
    expect(isPerformanceEvalTransitionAllowed('draft', 'approved')).toBe(false);
    expect(isPerformanceEvalTransitionAllowed('submitted', 'draft')).toBe(false);
    expect(isPerformanceEvalTransitionAllowed('draft', 'submitted')).toBe(true);
  });

  it('delete only draft', () => {
    expect(canDeletePerformanceEval('draft')).toBe(true);
    expect(canDeletePerformanceEval('submitted')).toBe(false);
  });
});

describe('statusMachineE3 — insurance policy', () => {
  it('draft → active|cancelled; active → expired|cancelled', () => {
    expect(nextInsurancePolicyStatuses('draft')).toEqual(['active', 'cancelled']);
    expect(nextInsurancePolicyStatuses('active')).toEqual(['expired', 'cancelled']);
    expect(nextInsurancePolicyStatuses('expired')).toEqual([]);
  });

  it('rejects expired→draft', () => {
    expect(isInsurancePolicyTransitionAllowed('expired', 'draft')).toBe(false);
    expect(isInsurancePolicyTransitionAllowed('draft', 'active')).toBe(true);
  });
});
