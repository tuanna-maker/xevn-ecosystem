import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  formatLeaveBalanceChipText,
  isLeaveBalanceNotConfiguredError,
  LEAVE_BALANCE_MISSING_HR_MSG,
  leaveBalanceWarnBannerText,
  resolveLeaveBalanceWarnLevel,
} from '../../../integrations/hrmLeaveBalance';

const SAMPLE = {
  remaining_days: 8,
  available_days: 8,
  entitled_days: 12,
  year: 2026,
  balance_year: 2026,
};

describe('LeaveBalanceChip / UC-HRM-MOB-06c helpers', () => {
  it('AC-LEAVE-BAL-01: chip text uses remaining / entitled + year (SRS §4.3)', () => {
    expect(formatLeaveBalanceChipText(SAMPLE)).toBe(
      'Còn lại: 8 / 12 ngày phép năm 2026',
    );
  });

  it('B1: 404 / HRM-LEAVE-BAL-404 → not configured + HR copy', () => {
    expect(isLeaveBalanceNotConfiguredError('HRM-LEAVE-BAL-404', 404)).toBe(true);
    expect(isLeaveBalanceNotConfiguredError('HRM-ATT-BAL-404', 404)).toBe(true);
    expect(isLeaveBalanceNotConfiguredError('HRM-LEAVE-BAL-200', 200)).toBe(false);
    expect(LEAVE_BALANCE_MISSING_HR_MSG).toBe('Chưa có số dư — liên hệ HR');
  });

  it('B2/B3 · BR-LEAVE-BAL-02: exceed vs depleted warn levels (warn, không chặn)', () => {
    expect(resolveLeaveBalanceWarnLevel(8, 3)).toBe('none');
    expect(resolveLeaveBalanceWarnLevel(8, 10)).toBe('exceed');
    expect(resolveLeaveBalanceWarnLevel(0, 1)).toBe('depleted');
    expect(resolveLeaveBalanceWarnLevel(-1, 1)).toBe('depleted');
    expect(leaveBalanceWarnBannerText('exceed')).toMatch(/vượt số dư/);
    expect(leaveBalanceWarnBannerText('depleted')).toMatch(/đã hết/);
    expect(leaveBalanceWarnBannerText('none')).toBeNull();
  });

  it('TechSpec LeaveBalanceChip wired on CreateLeaveRequestScreen steps 0–1', () => {
    const screen = readFileSync(
      path.resolve(__dirname, '../../../features/attendance/CreateLeaveRequestScreen.tsx'),
      'utf8',
    );
    expect(screen).toContain('LeaveBalanceChip');
    expect(screen).toContain('fetchLeaveBalance');
    expect(screen).toContain('resolveLeaveBalanceWarnLevel');
    expect(screen).toContain('UC-HRM-MOB-06c');
    // J-MOB-28 / AC-LEAVE-BAL-01: chip must render on wizard step 0 (case 0) before date picker
    const step0Idx = screen.indexOf('case 0:');
    const step1Idx = screen.indexOf('case 1:');
    expect(step0Idx).toBeGreaterThan(-1);
    expect(step1Idx).toBeGreaterThan(step0Idx);
    const step0Block = screen.slice(step0Idx, step1Idx);
    expect(step0Block).toContain('<LeaveBalanceChip');
    expect(step0Block).toContain('HrmDateRangeField');
    expect(step0Block.indexOf('<LeaveBalanceChip')).toBeLessThan(
      step0Block.indexOf('HrmDateRangeField'),
    );
  });

  it('LeaveBalanceChip default testID leave-balance-chip + minHeight ≥44px', () => {
    const chip = readFileSync(path.resolve(__dirname, '../LeaveBalanceChip.tsx'), 'utf8');
    expect(chip).toMatch(/minHeight:\s*44/);
    expect(chip).toContain("testID = 'leave-balance-chip'");
    expect(chip).toContain('LEAVE_BALANCE_MISSING_HR_MSG');
    expect(chip).toContain('formatLeaveBalanceChipText');
  });
});
