/**
 * @CODE-MEMORY
 * Screen:     unit — attLeave04Ring helpers (ATT-04)
 * UC:         UC-BP-ATT-04 · J-HRM-ATT-04-01..06
 * Purpose:    Unit coverage for path · labels · honesty · policy parse
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · ≠ ATT-04 DONE · U65
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_04_HONESTY_FOOTER,
  ATT_LEAVE_04_PATH_ASSERT,
  R_ATT_04_ENGINE,
  R_ATT_04_FY,
  R_ATT_04_POLICY_ADM,
  att04HonestyBannerText,
  deriveAtt04AccrualModeLabelVi,
  deriveAtt04LvtStatusLabelVi,
  isForbiddenAtt04SotPath,
  isPhysicalAtt04Path,
  parseAtt04AccrualPolicyDisplay,
} from './attLeave04Ring';

describe('attLeave04Ring', () => {
  it('locks physical paths · Nest /core denied · peer panel', () => {
    expect(ATT_LEAVE_04_PATH_ASSERT.leaveTypes).toContain('/attendance/leave-types');
    expect(ATT_LEAVE_04_PATH_ASSERT.leaveAccrualPolicies).toContain('/leave-accrual-policies');
    expect(ATT_LEAVE_04_PATH_ASSERT.trackedEntitlement).toContain('/tracked-entitlement');
    expect(ATT_LEAVE_04_PATH_ASSERT.leaveBalancePanel).toContain('/leave-balance/panel');
    expect(ATT_LEAVE_04_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_LEAVE_04_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(R_ATT_04_POLICY_ADM).toBe('R-ATT-04-POLICY-ADM');
    expect(R_ATT_04_FY).toBe('R-ATT-04-FY');
    expect(R_ATT_04_ENGINE).toBe('R-ATT-04-ENGINE');
  });

  it('FE-derives status and mode labels', () => {
    expect(deriveAtt04LvtStatusLabelVi('active')).toBe('Đang dùng');
    expect(deriveAtt04AccrualModeLabelVi('year_start_grant')).toContain('năm');
    expect(deriveAtt04LvtStatusLabelVi('active', 'Tùy BE')).toBe('Tùy BE');
  });

  it('parses accrual policy display-ready', () => {
    const d = parseAtt04AccrualPolicyDisplay({
      id: 'p1',
      leaveTypeKey: 'annual',
      leaveTypeNameVi: 'Phép năm',
      version: 2,
      effectiveFrom: '2026-01-01',
      accrualMode: 'year_start_grant',
      annualDays: 12,
      unit: 'day',
      status: 'active',
    });
    expect(d.policyId).toBe('p1');
    expect(d.leaveTypeNameVi).toBe('Phép năm');
    expect(d.statusLabelVi).toBe('Đang hiệu lực');
    expect(d.annualDays).toBe(12);
  });

  it('path guards', () => {
    expect(isPhysicalAtt04Path('/api/hrm/attendance/leave-types')).toBe(true);
    expect(isForbiddenAtt04SotPath('/api/hrm/core/leave-types')).toBe(true);
    expect(isForbiddenAtt04SotPath('/api/hrm/attendance/leave-types')).toBe(false);
  });

  it('honesty banner ≠ ATT-04 DONE', () => {
    expect(att04HonestyBannerText()).toContain('≠ ATT-04 DONE');
    expect(ATT_04_HONESTY_FOOTER).toContain('attendance_uat_ready=false');
  });
});
