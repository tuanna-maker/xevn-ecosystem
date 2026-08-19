import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK,
  ATT_ATTENDANCE_CODE_KEY_FORMAT,
  ATT_ATTENDANCE_CODE_UAT_HONESTY,
  HRM_ATT_CODE_KEY_CODE,
  attAttendanceCodeToPickerOption,
  attAttendanceCodesToPickerOptions,
  attAttendanceCodesEffectiveQueryKey,
  resolveAttAttendanceCodeEditValue,
  resolveAttAttendanceCodeLabel,
} from './useAttAttendanceCodesEffective';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const tableSource = readFileSync(
  join(hooksDir, '..', 'components', 'attendance', 'AttendanceRecordsTable.tsx'),
  'utf8',
);
const recordsHookSource = readFileSync(join(hooksDir, 'useAttendanceRecords.ts'), 'utf8');
const hrmApiSource = readFileSync(
  join(hooksDir, '..', 'integrations', 'hrmApi.ts'),
  'utf8',
);

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01 — attendance code helpers', () => {
  it('honesty flag stays false (FE không flip attendance UAT)', () => {
    expect(ATT_ATTENDANCE_CODE_UAT_HONESTY).toBe(false);
  });

  it('bootstrap fallback = pending|present|absent|leave (EFF=0 only · no seed)', () => {
    expect(ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK.map((o) => o.code)).toEqual([
      'pending',
      'present',
      'absent',
      'leave',
    ]);
  });

  it('key format khớp BE (slug mở) — không phải danh sách đóng 4 mã', () => {
    expect(ATT_ATTENDANCE_CODE_KEY_FORMAT.test('wfh')).toBe(true);
    expect(ATT_ATTENDANCE_CODE_KEY_FORMAT.test('business_trip')).toBe(true);
    expect(ATT_ATTENDANCE_CODE_KEY_FORMAT.test('WFH')).toBe(false);
    expect(ATT_ATTENDANCE_CODE_KEY_FORMAT.test('2wfh')).toBe(false);
  });

  it('BE invent KEY code constant = HRM-ATT-CODE-KEY', () => {
    expect(HRM_ATT_CODE_KEY_CODE).toBe('HRM-ATT-CODE-KEY');
  });

  it('map effective row → option (value=code, nhãn nameVi/symbol display-ready)', () => {
    expect(
      attAttendanceCodeToPickerOption({
        code: 'wfh',
        nameVi: 'Làm việc từ xa',
        symbol: 'WFH',
      }),
    ).toEqual({ code: 'wfh', name: 'WFH — Làm việc từ xa', symbol: 'WFH' });
  });

  it('map fallback nhãn=code khi thiếu nameVi; nhận statusLabel synonym', () => {
    expect(attAttendanceCodeToPickerOption({ code: 'ct', nameVi: '' }).name).toBe('ct');
    expect(
      attAttendanceCodeToPickerOption({ code: 'leave', statusLabel: 'Nghỉ phép', symbol: 'P' }).name,
    ).toBe('P — Nghỉ phép');
  });

  it('loại row thiếu code (không invent)', () => {
    const opts = attAttendanceCodesToPickerOptions([
      { code: 'present', nameVi: 'Có mặt' },
      { code: '', nameVi: 'Rỗng' },
    ]);
    expect(opts).toHaveLength(1);
    expect(opts[0].code).toBe('present');
  });

  it('resolve nhãn: khớp code → name; mã đã ngừng → giữ nguyên; rỗng → —', () => {
    const options = [{ code: 'wfh', name: 'Làm việc từ xa' }];
    expect(resolveAttAttendanceCodeLabel(options, 'wfh')).toBe('Làm việc từ xa');
    expect(resolveAttAttendanceCodeLabel(options, 'WFH')).toBe('Làm việc từ xa');
    expect(resolveAttAttendanceCodeLabel(options, 'early_leave')).toBe('early_leave');
    expect(resolveAttAttendanceCodeLabel(options, '')).toBe('—');
    expect(resolveAttAttendanceCodeLabel(options, null)).toBe('—');
  });

  it('resolve Edit value: EFF>0 không sole early_leave|on_leave; EFF=0 soft coerce', () => {
    const nest = [
      { code: 'pending', name: 'Chờ' },
      { code: 'present', name: 'Có mặt' },
      { code: 'wfh', name: 'WFH' },
    ];
    expect(resolveAttAttendanceCodeEditValue(nest, 'wfh', true)).toBe('wfh');
    expect(resolveAttAttendanceCodeEditValue(nest, 'early_leave', true)).toBe('pending');
    expect(resolveAttAttendanceCodeEditValue(nest, 'on_leave', true)).toBe('pending');
    const bootstrap = ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK.map((o) => ({
      code: o.code,
      name: o.defaultNameVi,
    }));
    expect(resolveAttAttendanceCodeEditValue(bootstrap, 'early_leave', false)).toBe('present');
    expect(resolveAttAttendanceCodeEditValue(bootstrap, 'on_leave', false)).toBe('leave');
  });

  it('query key gắn company scope (tránh trộn đơn vị)', () => {
    expect(attAttendanceCodesEffectiveQueryKey('trsport')).toEqual([
      'hrm-att-attendance-codes-effective',
      'trsport',
    ]);
    expect(attAttendanceCodesEffectiveQueryKey(null)).toEqual([
      'hrm-att-attendance-codes-effective',
      null,
    ]);
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01 — AttendanceRecordsTable bind', () => {
  it('bind hook effective catalog thay vì API_STATUS_OPTIONS hardcode sole SoT', () => {
    expect(tableSource).toContain('useAttAttendanceCodesEffective');
    expect(tableSource).not.toContain(
      "const API_STATUS_OPTIONS: ApiAttendanceStatus[] = ['pending', 'present', 'absent', 'leave']",
    );
    expect(tableSource).toContain('statusOptions.map(');
  });

  it('EFF>0 → nestOptions; EFF=0 → bootstrap (không seed, không invent SoT)', () => {
    expect(tableSource).toContain('const attCodeCatalogBound = effectiveCount > 0;');
    expect(tableSource).toMatch(
      /attCodeCatalogBound\s*\n?\s*\?\s*nestOptions\s*\n?\s*:\s*bootstrapAttCodes/,
    );
    expect(tableSource).toContain('ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK.map(');
  });

  it('Edit Select không sole early_leave|on_leave khi EFF>0', () => {
    expect(tableSource).not.toContain('<SelectItem value="early_leave">');
    expect(tableSource).not.toContain('<SelectItem value="on_leave">');
    expect(tableSource).toContain('resolveAttAttendanceCodeEditValue(');
  });

  it('submit gửi Nest code qua updateRecord status', () => {
    expect(tableSource).toContain('status: editStatus');
  });

  it('loading / error / bootstrap hint hiển thị rõ', () => {
    expect(tableSource).toContain('attCodesLoading');
    expect(tableSource).toContain('att-attendance-code-catalog-error');
    expect(tableSource).toContain('attCodeCatalogBootstrapHint');
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01 — transport + KEY surface', () => {
  it('hrmApi listEffectiveAttendanceCodes path = /attendance/attendance-codes/effective', () => {
    expect(hrmApiSource).toContain('listEffectiveAttendanceCodes');
    expect(hrmApiSource).toContain('/api/hrm/attendance/attendance-codes/effective');
  });

  it('updateRecord không coerce closed-4 sole — pass-through Nest code + surface KEY', () => {
    expect(recordsHookSource).toContain('HRM_ATT_CODE_KEY_CODE');
    expect(recordsHookSource).toContain("HRM-ATT-CODE-KEY");
    expect(recordsHookSource).toContain('ATT_ATTENDANCE_CODE_KEY_FORMAT');
    expect(recordsHookSource).toContain('toErrorMessage(error');
  });
});
