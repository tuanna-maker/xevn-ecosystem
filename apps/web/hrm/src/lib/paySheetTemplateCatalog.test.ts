import { describe, expect, it } from 'vitest';
import {
  PAYROLL_E2E_READY_HONESTY,
  buildPaySheetTemplateLinesPayload,
  formatPaySheetFormulaOverrideLabel,
  isValidPaySheetTemplateCodeFormat,
  normalizePaySheetTemplateCode,
  paySheetApplicabilityLabel,
  paySheetLineDisplayLabel,
  paySheetTemplateStatusLabel,
  resolvePaySheetTemplateDisplayFromPeriod,
} from './paySheetTemplateCatalog';

describe('paySheetTemplateCatalog (PO-HRM-AMIS-PARITY-PAY-TPL-FE-01)', () => {
  it('locks payroll_e2e_ready honesty false', () => {
    expect(PAYROLL_E2E_READY_HONESTY).toBe(false);
  });

  it('validates open-catalog code format (not closed enum)', () => {
    expect(isValidPaySheetTemplateCodeFormat('mau_cong_ty')).toBe(true);
    expect(isValidPaySheetTemplateCodeFormat('a')).toBe(true);
    expect(isValidPaySheetTemplateCodeFormat('Mau')).toBe(false);
    expect(isValidPaySheetTemplateCodeFormat('1abc')).toBe(false);
    expect(normalizePaySheetTemplateCode('  Mau CT  ')).toBe('mau_ct');
  });

  it('maps vi-VN status and applicability labels', () => {
    expect(paySheetTemplateStatusLabel('draft')).toBe('Bản nháp');
    expect(paySheetTemplateStatusLabel('active')).toBe('Đang hiệu lực');
    expect(paySheetApplicabilityLabel('company')).toBe('Toàn công ty');
    expect(paySheetApplicabilityLabel('ou')).toBe('Đơn vị / OU');
  });

  it('prefers displayLabel then component name (display-ready)', () => {
    expect(
      paySheetLineDisplayLabel({
        displayLabel: 'Lương cơ bản hiển thị',
        componentName: 'Base',
        componentCode: 'BASIC',
      }),
    ).toBe('Lương cơ bản hiển thị');
    expect(
      paySheetLineDisplayLabel({
        displayLabel: null,
        componentName: 'Phụ cấp',
        componentCode: 'PC',
      }),
    ).toBe('Phụ cấp');
  });

  it('formats OV-C override label without inventing net', () => {
    expect(
      formatPaySheetFormulaOverrideLabel({
        formulaOverrideCode: 'base_hourly',
        formulaOverrideVersion: 2,
      }),
    ).toBe('base_hourly · v2');
    expect(
      formatPaySheetFormulaOverrideLabel({
        formulaOverrideDefinitionId: null,
      }),
    ).toContain('không override');
  });

  it('builds PUT lines payload — rejects duplicate component / empty', () => {
    const badEmpty = buildPaySheetTemplateLinesPayload([
      {
        key: '1',
        componentId: '',
        displayLabel: '',
        sortOrder: 0,
        formulaOverrideDefinitionId: '',
      },
    ]);
    expect(badEmpty.ok).toBe(false);

    const badDup = buildPaySheetTemplateLinesPayload([
      {
        key: '1',
        componentId: 'c1',
        displayLabel: 'A',
        sortOrder: 0,
        formulaOverrideDefinitionId: '',
      },
      {
        key: '2',
        componentId: 'c1',
        displayLabel: 'B',
        sortOrder: 1,
        formulaOverrideDefinitionId: '',
      },
    ]);
    expect(badDup.ok).toBe(false);

    const ok = buildPaySheetTemplateLinesPayload([
      {
        key: '1',
        componentId: 'c1',
        displayLabel: 'Nhãn A',
        sortOrder: 10,
        formulaOverrideDefinitionId: 'def-1',
      },
      {
        key: '2',
        componentId: 'c2',
        displayLabel: '',
        sortOrder: 20,
        formulaOverrideDefinitionId: '',
      },
    ]);
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.lines).toEqual([
        {
          componentId: 'c1',
          displayLabel: 'Nhãn A',
          sortOrder: 10,
          formulaOverrideDefinitionId: 'def-1',
        },
        {
          componentId: 'c2',
          displayLabel: null,
          sortOrder: 20,
          formulaOverrideDefinitionId: null,
        },
      ]);
    }
  });

  it('resolvePaySheetTemplateDisplayFromPeriod prefers snapshot template_name (AC-PAY-TPL-03)', () => {
    const display = resolvePaySheetTemplateDisplayFromPeriod({
      pay_sheet_template_id: '11111111-1111-4111-8111-111111111111',
      sheet_template_snapshot_json: {
        template_id: '11111111-1111-4111-8111-111111111111',
        template_code: 'mau_ct',
        template_name: 'Mẫu công ty chuẩn',
      },
    });
    expect(display.name).toBe('Mẫu công ty chuẩn');
    expect(display.code).toBe('mau_ct');
    expect(display.id).toBe('11111111-1111-4111-8111-111111111111');
  });
});
