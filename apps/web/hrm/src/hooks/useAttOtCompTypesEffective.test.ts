import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK,
  ATT_OT_COMP_TYPE_KEY_FORMAT,
  ATT_OT_COMP_TYPE_UAT_HONESTY,
  attOtCompTypeToPickerOption,
  attOtCompTypesToPickerOptions,
  attOtCompTypesEffectiveQueryKey,
  resolveAttOtCompTypeLabel,
} from './useAttOtCompTypesEffective';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const tabSource = readFileSync(
  join(hooksDir, '..', 'components', 'attendance', 'OvertimeRequestTab.tsx'),
  'utf8',
);
const requestsHookSource = readFileSync(join(hooksDir, 'useOvertimeRequests.ts'), 'utf8');

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01 — OT compensation catalog helpers', () => {
  it('honesty flag stays false (FE không flip attendance/payroll UAT)', () => {
    expect(ATT_OT_COMP_TYPE_UAT_HONESTY).toBe(false);
  });

  it('bootstrap fallback = salary|compensatory_leave (starter ≠ ceiling)', () => {
    expect(ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK.map((o) => o.code)).toEqual([
      'salary',
      'compensatory_leave',
    ]);
  });

  it('key format khớp BE (slug mở) — không phải danh sách đóng 2 mã', () => {
    expect(ATT_OT_COMP_TYPE_KEY_FORMAT.test('banked_hours')).toBe(true);
    expect(ATT_OT_COMP_TYPE_KEY_FORMAT.test('Salary')).toBe(false);
    expect(ATT_OT_COMP_TYPE_KEY_FORMAT.test('2salary')).toBe(false);
  });

  it('map effective row → option (value=code, nhãn nameVi)', () => {
    expect(
      attOtCompTypeToPickerOption({ code: 'banked_hours', nameVi: 'Ngân giờ' }),
    ).toEqual({ code: 'banked_hours', name: 'Ngân giờ' });
  });

  it('map fallback nhãn=code khi thiếu nameVi', () => {
    expect(attOtCompTypeToPickerOption({ code: 'salary', nameVi: '' }).name).toBe('salary');
  });

  it('loại row thiếu code (không invent)', () => {
    const opts = attOtCompTypesToPickerOptions([
      { code: 'salary', nameVi: 'Trả lương' },
      { code: '', nameVi: 'Rỗng' },
    ]);
    expect(opts).toHaveLength(1);
    expect(opts[0].code).toBe('salary');
  });

  it('resolve nhãn: khớp code → nameVi; mã đã ngừng → giữ nguyên; rỗng → —; cấm binary invent', () => {
    const options = [{ code: 'banked_hours', name: 'Ngân giờ' }];
    expect(resolveAttOtCompTypeLabel(options, 'banked_hours')).toBe('Ngân giờ');
    expect(resolveAttOtCompTypeLabel(options, 'BANKED_HOURS')).toBe('Ngân giờ');
    expect(resolveAttOtCompTypeLabel(options, 'salary')).toBe('salary');
    expect(resolveAttOtCompTypeLabel(options, '')).toBe('—');
    expect(resolveAttOtCompTypeLabel(options, null)).toBe('—');
  });

  it('query key gắn company scope (tránh trộn đơn vị)', () => {
    expect(attOtCompTypesEffectiveQueryKey('trsport')).toEqual([
      'hrm-att-ot-comp-types-effective',
      'trsport',
    ]);
    expect(attOtCompTypesEffectiveQueryKey(null)).toEqual(['hrm-att-ot-comp-types-effective', null]);
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01 — OvertimeRequestTab bind branch', () => {
  it('bind hook effective catalog thay vì SelectItem hardcode salary|compensatory_leave', () => {
    expect(tabSource).toContain('useAttOtCompTypesEffective');
    expect(tabSource).not.toContain('<SelectItem value="salary">');
    expect(tabSource).not.toContain('<SelectItem value="compensatory_leave">');
    expect(tabSource).toContain('otCompTypeOptions.map(');
  });

  it('EFF>0 → nestCompOptions; EFF=0 → bootstrap (không seed, không invent SoT)', () => {
    expect(tabSource).toContain('const otCompTypeCatalogBound = otCompEffectiveCount > 0;');
    expect(tabSource).toMatch(
      /otCompTypeCatalogBound\s*\n?\s*\?\s*nestCompOptions\s*\n?\s*:\s*bootstrapOtCompTypes/,
    );
    expect(tabSource).toContain('ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK.map(');
  });

  it('submit gửi Nest compensation code (không invent binary)', () => {
    expect(tabSource).toContain('compensation_type: selectedOtCompType');
  });

  it('detail nhãn resolve từ catalog (không binary salary ? Salary : TimeOff)', () => {
    expect(tabSource).toContain('resolveAttOtCompTypeLabel(otCompTypeOptions,');
    expect(tabSource).not.toContain(
      "selectedRequest.compensation_type === 'salary' ? t('overtime.compensationSalary') : t('overtime.compensationTimeOff')",
    );
  });

  it('trạng thái loading / error / bootstrap-empty hiển thị rõ', () => {
    expect(tabSource).toContain('otCompTypesLoading');
    expect(tabSource).toContain("t('overtime.otCompTypeCatalogError')");
    expect(tabSource).toContain("t('overtime.otCompTypeCatalogBootstrapHint')");
  });

  it('không nuốt lỗi BE HRM-ATT-OT-COMP-KEY khi tạo đơn', () => {
    expect(requestsHookSource).toContain("HRM_ATT_OT_COMP_KEY_CODE = 'HRM-ATT-OT-COMP-KEY'");
    expect(requestsHookSource).toContain("t('hk.overtime.otCompTypeKeyError')");
  });

  it('RETAIN OT-TYPE Nest picker (không regress)', () => {
    expect(tabSource).toContain('useAttOtTypesEffective');
    expect(tabSource).toContain('otTypeOptions.map(');
    expect(tabSource).toContain('overtime_type: selectedOtType');
  });
});