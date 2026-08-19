/**
 * Unit — attLeave09Ring ATT-09 hold / settle / panel / type-block / honesty.
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_LEAVE_09_PATH_ASSERT,
  assertAtt09LeaveTypeUpdateAllowed,
  assertAtt09PrintableHonesty,
  att09HonestyBannerText,
  att09HonestyFooterLines,
  att09TypeBlockMessage,
  att09OverlapTypeBlockBannerMessage,
  findAtt09DateOverlapConflict,
  isAtt09LeaveTypeChangeBlocked,
  isAtt09OverlapApiError,
  isForbiddenAtt09SotPath,
  isPhysicalAtt09Path,
  normalizeAtt09LeaveStatus,
  parseAtt09BalanceDisplay,
  parseAtt09LeaveRequestDisplay,
  parseAtt09OverlapConflictId,
  resolveAtt09HeldDays,
  resolveAtt09StatusLabelVi,
} from './attLeave09Ring';
import { ApiClientError } from './apiError';

describe('attLeave09Ring — PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01', () => {
  it('path assert physical leave-requests + balance · Nest /core denied · DENY att_leave_hold', () => {
    expect(ATT_LEAVE_09_PATH_ASSERT.leaveRequests).toBe(
      '/api/hrm/attendance/leave-requests',
    );
    expect(ATT_LEAVE_09_PATH_ASSERT.leaveBalancePanel).toContain(
      '/attendance/leave-balance/panel',
    );
    expect(ATT_LEAVE_09_PATH_ASSERT.previewDeduction).toContain(
      'preview-deduction',
    );
    expect(ATT_LEAVE_09_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_LEAVE_09_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(isPhysicalAtt09Path(ATT_LEAVE_09_PATH_ASSERT.leaveRequests)).toBe(true);
    expect(
      isForbiddenAtt09SotPath('/api/hrm/core/leave-requests'),
    ).toBe(true);
    expect(
      isForbiddenAtt09SotPath('/api/hrm/attendance/leave-requests'),
    ).toBe(false);
  });

  it('held = pending_days alias · display-ready pending·available·used', () => {
    expect(
      resolveAtt09HeldDays({ pending_days: 2, held_units: 99 }),
    ).toBe(2);
    expect(resolveAtt09HeldDays({ held_units: 1.5 })).toBe(1.5);

    const bal = parseAtt09BalanceDisplay({
      leave_type: 'annual',
      leave_type_label: 'Phép năm',
      entitled_days: 12,
      used_days: 3,
      pending_days: 2,
      available_days: 7,
    });
    expect(bal).not.toBeNull();
    expect(bal!.pendingDays).toBe(2);
    expect(bal!.heldDays).toBe(2);
    expect(bal!.availableDays).toBe(7);
    expect(bal!.usedDays).toBe(3);
    expect(bal!.leaveTypeLabel).toBe('Phép năm');
  });

  it('statusLabelVi prefer BE · FE-derive pending=Chờ duyệt', () => {
    expect(resolveAtt09StatusLabelVi('pending', null)).toBe('Chờ duyệt');
    expect(resolveAtt09StatusLabelVi('approved', 'Đã duyệt (BE)')).toBe(
      'Đã duyệt (BE)',
    );
    const disp = parseAtt09LeaveRequestDisplay({
      id: 'lr-1',
      status: 'pending',
      status_label: 'Chờ duyệt',
      leave_type: 'annual',
      total_days: 2,
    });
    expect(disp.statusLabelVi).toBe('Chờ duyệt');
    expect(disp.requestId).toBe('lr-1');
  });

  it('TYPE-BLOCK when pending — deny leave_type change', () => {
    expect(isAtt09LeaveTypeChangeBlocked('pending')).toBe(true);
    expect(isAtt09LeaveTypeChangeBlocked('approved')).toBe(false);
    expect(
      assertAtt09LeaveTypeUpdateAllowed('pending', 'annual', 'sick'),
    ).toEqual({ allowed: false, blocked: true });
    expect(
      assertAtt09LeaveTypeUpdateAllowed('pending', 'annual', 'annual'),
    ).toEqual({ allowed: true, blocked: false });
    expect(
      assertAtt09LeaveTypeUpdateAllowed('approved', 'annual', 'sick'),
    ).toEqual({ allowed: true, blocked: false });
    expect(att09TypeBlockMessage()).toContain('TYPE-BLOCK');
  });

  it('FE-02 — overlap conflict detect + 409 parse + banner message', () => {
    expect(normalizeAtt09LeaveStatus(' PENDING ')).toBe('pending');
    const rows = [
      {
        id: 'lr-pending',
        employee_id: 'emp-1',
        start_date: '2026-12-07',
        end_date: '2026-12-08',
        status: 'pending',
        leave_type: 'hr_custom_09',
      },
    ];
    const hit = findAtt09DateOverlapConflict(
      rows,
      'emp-1',
      '2026-12-07',
      '2026-12-09',
    );
    expect(hit?.id).toBe('lr-pending');
    expect(
      findAtt09DateOverlapConflict(rows, 'emp-2', '2026-12-07', '2026-12-08'),
    ).toBeNull();

    const err = new ApiClientError({
      code: 'HRM-LEAVE-VAL-OVERLAP',
      status: 409,
      message: 'overlap',
      details: { conflicting_id: 'lr-pending' },
    });
    expect(parseAtt09OverlapConflictId(err)).toBe('lr-pending');
    expect(isAtt09OverlapApiError(err)).toBe(true);
    expect(att09OverlapTypeBlockBannerMessage({ pendingConflict: true })).toContain(
      'TYPE-BLOCK',
    );
    expect(att09OverlapTypeBlockBannerMessage({ pendingConflict: true })).toContain(
      'chờ duyệt',
    );
  });

  it('honesty seals · printable false · ≠ soft/08=09 DONE · Nest deny · PAY OUT', () => {
    expect(assertAtt09PrintableHonesty()).toBe(true);
    const lines = att09HonestyFooterLines();
    expect(lines.join(' ')).toContain('soft create alone ≠ ATT-09 DONE');
    expect(lines.join(' ')).toContain('≠ ATT-08 preview = ATT-09 DONE');
    expect(lines.join(' ')).toContain('client total_days');
    expect(lines.join(' ')).toContain('attendance_uat_ready=false');
    expect(lines.join(' ')).toContain('CFG ≠ ATT-02 DONE');
    expect(lines.join(' ')).toContain('DENY invent att_leave_hold');
    expect(lines.join(' ')).toContain('Nest /core leave-hold = 0');
    expect(lines.join(' ')).toContain('PAY OUT');
    expect(att09HonestyBannerText()).toContain('contracts_printable_ready=false');
  });
});
