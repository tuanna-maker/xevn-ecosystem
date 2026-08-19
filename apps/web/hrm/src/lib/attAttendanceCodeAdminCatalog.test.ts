import { describe, expect, it } from 'vitest';
import {
  attAttendanceCodeCountsAsLabel,
  formatAttAttendanceCodeDisplay,
  isValidAttAttendanceCodeKeyFormat,
  normalizeAttAttendanceCodeKey,
  parseAttAttendanceCodeDayWeight,
  parseAttAttendanceCodeLegacyAliases,
} from './attAttendanceCodeAdminCatalog';

describe('attAttendanceCodeAdminCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01)', () => {
  it('accepts open-catalog keys; rejects format-invalid', () => {
    expect(isValidAttAttendanceCodeKeyFormat('wfh_half')).toBe(true);
    expect(isValidAttAttendanceCodeKeyFormat('present')).toBe(true);
    expect(isValidAttAttendanceCodeKeyFormat('9bad')).toBe(false);
    expect(isValidAttAttendanceCodeKeyFormat('BAD KEY')).toBe(false);
  });

  it('normalizes to lowercase slug', () => {
    expect(normalizeAttAttendanceCodeKey('  WFH_Half  ')).toBe('wfh_half');
  });

  it('formats display-ready with symbol', () => {
    expect(formatAttAttendanceCodeDisplay('wfh_half', 'Làm nhà nửa ngày', 'W½')).toBe(
      'W½ — Làm nhà nửa ngày (wfh_half)',
    );
  });

  it('parses dayWeight (0,1] and legacy aliases', () => {
    expect(parseAttAttendanceCodeDayWeight('0.5')).toBe(0.5);
    expect(parseAttAttendanceCodeDayWeight('0')).toBeNull();
    expect(parseAttAttendanceCodeDayWeight('1.5')).toBeNull();
    expect(parseAttAttendanceCodeLegacyAliases('on_leave, Early_Leave')).toEqual([
      'on_leave',
      'early_leave',
    ]);
  });

  it('labels countsAs without inventing closed code SoT', () => {
    expect(attAttendanceCodeCountsAsLabel('paid_leave')).toBe('Nghỉ có lương');
    expect(attAttendanceCodeCountsAsLabel('unknown_x')).toBe('unknown_x');
  });
});
