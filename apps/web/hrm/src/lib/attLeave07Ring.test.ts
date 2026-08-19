import { describe, expect, it } from 'vitest';
import {
  ATT_LEAVE_07_PATH_ASSERT,
  att07PanelExcludesSickBucket,
  formatSickDayBranchesSummary,
  fundSequenceTokenLabelVi,
  parseLeaveCreateDayBranches,
  resolveSickLeaveTypeFlags,
  sickDayBranchLabelVi,
} from '@/lib/attLeave07Ring';

describe('attLeave07Ring', () => {
  it('path assert — sick-leave-fund-order · DENY /core', () => {
    expect(ATT_LEAVE_07_PATH_ASSERT.sickLeaveFundOrder).toContain(
      '/attendance/sick-leave-fund-order',
    );
    expect(ATT_LEAVE_07_PATH_ASSERT.leaveTypesEffective).toContain('/leave-types/effective');
    expect(ATT_LEAVE_07_PATH_ASSERT.nestCoreDenied).toBeTruthy();
  });

  it('panel MVP excludes sick bucket', () => {
    expect(att07PanelExcludesSickBucket()).toBe(true);
  });

  it('resolveSickLeaveTypeFlags from EFF row', () => {
    const flags = resolveSickLeaveTypeFlags('sick_leave', 'Nghỉ ốm', [
      {
        leaveTypeKey: 'sick_leave',
        category: 'sick',
        insuranceRegimeFlag: true,
        companyTopupFlag: false,
      },
    ]);
    expect(flags?.insuranceRegimeFlag).toBe(true);
    expect(flags?.companyTopupFlag).toBe(false);
    expect(flags?.dv16BothFlags).toBe(false);
  });

  it('parseLeaveCreateDayBranches camel + snake', () => {
    const branches = parseLeaveCreateDayBranches({
      id: 'lr-1',
      dayBranches: [
        { calendarDate: '2026-05-01', branchCode: 'insurance', deductUnits: 1 },
        { calendar_date: '2026-05-02', branch_code: 'annual', deduct_units: 1 },
      ],
    });
    expect(branches).toHaveLength(2);
    expect(branches![0].branchCode).toBe('insurance');
  });

  it('formatSickDayBranchesSummary VI labels', () => {
    const text = formatSickDayBranchesSummary([
      { calendarDate: '01/05/2026', branchCode: 'insurance', deductUnits: 1 },
    ]);
    expect(text).toContain('Phân nhánh ngày ốm');
    expect(text).toContain(sickDayBranchLabelVi('insurance'));
    expect(fundSequenceTokenLabelVi('company')).toContain('CTY');
  });
});
