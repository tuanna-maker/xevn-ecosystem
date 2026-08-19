import { describe, expect, it } from 'vitest';
import {
  ATT_05_CARRY_POLICY_FIELDS_API_LIVE,
  ATT_05_PANEL_CARRY_LABEL_VI,
  deriveAtt05CarryExpireRuleLabelVi,
  deriveAtt05PanelBucketLabelVi,
  isCarryOverLeaveTypeKey,
  parseAtt05CarryPolicyFromPolicyRow,
} from '@/lib/attLeave05Ring';

describe('attLeave05Ring', () => {
  it('panel bucket carry_over label VI', () => {
    expect(deriveAtt05PanelBucketLabelVi('carry_over')).toBe(ATT_05_PANEL_CARRY_LABEL_VI);
    expect(deriveAtt05PanelBucketLabelVi('annual', 'Wire')).toBe('Wire');
    expect(isCarryOverLeaveTypeKey('carry_over')).toBe(true);
    expect(isCarryOverLeaveTypeKey('annual')).toBe(false);
  });

  it('parse carry policy fields from policy row', () => {
    expect(parseAtt05CarryPolicyFromPolicyRow({})).toBeNull();
    expect(
      parseAtt05CarryPolicyFromPolicyRow({
        carryOverExpireRule: 'end_of_q1_next_year',
        carryCapDays: 5,
      }),
    ).toEqual({
      carryOverExpireRule: 'end_of_q1_next_year',
      carryCapDays: 5,
      carryOverExpireRuleLabelVi: null,
    });
  });

  it('derive expire rule label — known code or passthrough', () => {
    expect(deriveAtt05CarryExpireRuleLabelVi('end_of_q1_next_year')).toContain('Q1');
    expect(deriveAtt05CarryExpireRuleLabelVi('custom_rule')).toBe('custom_rule');
  });

  it('carry policy API LIVE flag — RETAIN per API-01', () => {
    expect(ATT_05_CARRY_POLICY_FIELDS_API_LIVE).toBe(true);
  });
});
