import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ATT_OT_TYPE_BOOTSTRAP_FALLBACK,
  ATT_OT_TYPE_FALLBACK_COEFF,
  ATT_OT_TYPE_KEY_FORMAT,
  ATT_OT_TYPE_UAT_HONESTY,
  attOtTypeToPickerOption,
  attOtTypesToPickerOptions,
  attOtTypesEffectiveQueryKey,
  resolveAttOtTypeCoefficient,
  resolveAttOtTypeLabel,
} from './useAttOtTypesEffective';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const tabSource = readFileSync(
  join(hooksDir, '..', 'components', 'attendance', 'OvertimeRequestTab.tsx'),
  'utf8',
);
const requestsHookSource = readFileSync(join(hooksDir, 'useOvertimeRequests.ts'), 'utf8');

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01 — OT type catalog helpers', () => {
  it('honesty flag stays false (FE không flip attendance UAT)', () => {
    expect(ATT_OT_TYPE_UAT_HONESTY).toBe(false);
  });

  it('bootstrap fallback = 3-id weekday|weekend|holiday với hệ số khởi tạo', () => {
    expect(ATT_OT_TYPE_BOOTSTRAP_FALLBACK.map((o) => o.code)).toEqual([
      'weekday',
      'weekend',
      'holiday',
    ]);
    expect(ATT_OT_TYPE_BOOTSTRAP_FALLBACK.map((o) => o.defaultCoeff)).toEqual([1.5, 2.0, 3.0]);
  });

  it('key format khớp BE (slug mở) — không phải danh sách đóng 3 mã', () => {
    expect(ATT_OT_TYPE_KEY_FORMAT.test('ot_le_tet_2026')).toBe(true);
    expect(ATT_OT_TYPE_KEY_FORMAT.test('Weekend')).toBe(false);
    expect(ATT_OT_TYPE_KEY_FORMAT.test('2weekend')).toBe(false);
  });

  it('map effective row → option (value=code, nhãn nameVi, defaultCoeff display-ready)', () => {
    expect(
      attOtTypeToPickerOption({ code: 'ot_le', nameVi: 'Tăng ca ngày lễ', defaultCoeff: 3 }),
    ).toEqual({ code: 'ot_le', name: 'Tăng ca ngày lễ', defaultCoeff: 3 });
  });

  it('map nhận defaultCoeff dạng chuỗi (numeric BE) và synonym defaultCoefficient', () => {
    expect(attOtTypeToPickerOption({ code: 'a', nameVi: 'A', defaultCoeff: '2.50' }).defaultCoeff).toBe(2.5);
    expect(
      attOtTypeToPickerOption({ code: 'b', nameVi: 'B', defaultCoefficient: 2 }).defaultCoeff,
    ).toBe(2);
  });

  it('map fallback nhãn=code khi thiếu nameVi; hệ số fallback khi thiếu/không hợp lệ', () => {
    const opt = attOtTypeToPickerOption({ code: 'ot_dem', nameVi: '', defaultCoeff: null });
    expect(opt.name).toBe('ot_dem');
    expect(opt.defaultCoeff).toBe(ATT_OT_TYPE_FALLBACK_COEFF);
    expect(
      attOtTypeToPickerOption({ code: 'x', nameVi: 'X', defaultCoeff: 'abc' }).defaultCoeff,
    ).toBe(ATT_OT_TYPE_FALLBACK_COEFF);
  });

  it('loại row thiếu code (không invent)', () => {
    const opts = attOtTypesToPickerOptions([
      { code: 'ot_le', nameVi: 'Lễ', defaultCoeff: 3 },
      { code: '', nameVi: 'Rỗng', defaultCoeff: 1 },
    ]);
    expect(opts).toHaveLength(1);
    expect(opts[0].code).toBe('ot_le');
  });

  it('resolve nhãn: khớp code → nameVi; mã đã ngừng → giữ nguyên; rỗng → —', () => {
    const options = [{ code: 'ot_le', name: 'Tăng ca ngày lễ', defaultCoeff: 3 }];
    expect(resolveAttOtTypeLabel(options, 'ot_le')).toBe('Tăng ca ngày lễ');
    expect(resolveAttOtTypeLabel(options, 'OT_LE')).toBe('Tăng ca ngày lễ');
    expect(resolveAttOtTypeLabel(options, 'weekday')).toBe('weekday');
    expect(resolveAttOtTypeLabel(options, '')).toBe('—');
    expect(resolveAttOtTypeLabel(options, null)).toBe('—');
  });

  it('resolve hệ số: EFF>0 lấy defaultCoeff Nest; ngoài catalog → fallback', () => {
    const nestOptions = [
      { code: 'ot_le', name: 'Lễ', defaultCoeff: 3 },
      { code: 'ot_cn', name: 'Chủ nhật', defaultCoeff: 2 },
    ];
    expect(resolveAttOtTypeCoefficient(nestOptions, 'ot_cn')).toBe(2);
    expect(resolveAttOtTypeCoefficient(nestOptions, 'weekday')).toBe(ATT_OT_TYPE_FALLBACK_COEFF);
  });

  it('resolve hệ số: EFF=0 dùng bootstrap 1.5 / 2.0 / 3.0', () => {
    const bootstrap = ATT_OT_TYPE_BOOTSTRAP_FALLBACK.map((o) => ({
      code: o.code,
      name: o.code,
      defaultCoeff: o.defaultCoeff,
    }));
    expect(resolveAttOtTypeCoefficient(bootstrap, 'weekday')).toBe(1.5);
    expect(resolveAttOtTypeCoefficient(bootstrap, 'weekend')).toBe(2.0);
    expect(resolveAttOtTypeCoefficient(bootstrap, 'holiday')).toBe(3.0);
  });

  it('query key gắn company scope (tránh trộn đơn vị)', () => {
    expect(attOtTypesEffectiveQueryKey('trsport')).toEqual([
      'hrm-att-ot-types-effective',
      'trsport',
    ]);
    expect(attOtTypesEffectiveQueryKey(null)).toEqual(['hrm-att-ot-types-effective', null]);
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01 — OvertimeRequestTab bind branch', () => {
  it('bind hook effective catalog thay vì SelectItem hardcode weekday|weekend|holiday', () => {
    expect(tabSource).toContain('useAttOtTypesEffective');
    expect(tabSource).not.toContain('<SelectItem value="weekday">');
    expect(tabSource).not.toContain('<SelectItem value="weekend">');
    expect(tabSource).not.toContain('<SelectItem value="holiday">');
    expect(tabSource).toContain('otTypeOptions.map(');
  });

  it('EFF>0 → nestOptions; EFF=0 → bootstrap (không seed, không invent SoT)', () => {
    expect(tabSource).toContain('const otTypeCatalogBound = effectiveCount > 0;');
    expect(tabSource).toMatch(/otTypeCatalogBound\s*\n?\s*\?\s*nestOptions\s*\n?\s*:\s*bootstrapOtTypes/);
    expect(tabSource).toContain('ATT_OT_TYPE_BOOTSTRAP_FALLBACK.map(');
  });

  it('submit gửi mã catalog + hệ số prefill từ defaultCoeff (không công thức FE)', () => {
    expect(tabSource).toContain('overtime_type: selectedOtType');
    expect(tabSource).toContain('coefficient: selectedOtCoefficient');
    expect(tabSource).toContain('resolveAttOtTypeCoefficient(');
    // Bảng hệ số hardcode cũ đã rời component (bootstrap nằm trong catalog helper).
    expect(tabSource).not.toContain('case \'weekday\': return 1.5;');
  });

  it('trạng thái loading / error / bootstrap-empty hiển thị rõ', () => {
    expect(tabSource).toContain('otTypesLoading');
    expect(tabSource).toContain("t('overtime.otTypeCatalogError')");
    expect(tabSource).toContain("t('overtime.otTypeCatalogBootstrapHint')");
  });

  it('nhãn/badge loại tăng ca resolve từ catalog (giữ mã lịch sử)', () => {
    expect(tabSource).toContain('resolveAttOtTypeLabel(otTypeOptions, type)');
  });

  it('không nuốt lỗi BE HRM-ATT-OT-TYPE-KEY khi tạo đơn', () => {
    expect(requestsHookSource).toContain("HRM_ATT_OT_TYPE_KEY_CODE = 'HRM-ATT-OT-TYPE-KEY'");
    expect(requestsHookSource).toContain("t('hk.overtime.otTypeKeyError')");
    expect(requestsHookSource).toContain('toErrorMessage(error');
  });
});
