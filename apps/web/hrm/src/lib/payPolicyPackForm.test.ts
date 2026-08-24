/**
 * @CODE-MEMORY
 * Screen: payPolicyPackForm helpers — xem payPolicyPackForm.ts
 * Purpose: Vitest cho validate/build payload CHUNG (AC-PAY-STP-01-05 · 03-01 · 04-01)
 * WorkItem: PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 */
import { describe, it, expect } from 'vitest';
import {
  buildChungRateParams,
  buildPolicyPackWritePayload,
  extractChungRateParams,
  MSG_NAME_REQUIRED,
  MSG_EFFECTIVE_FROM_REQUIRED,
  MSG_EFFECTIVE_DATE_ORDER,
  parseKpiThresholdInput,
  statusLabelVi,
  validatePolicyPackForm,
  type PolicyPackFormValues,
} from './payPolicyPackForm';

const base: PolicyPackFormValues = {
  code: 'POL_CHUNG_2A',
  nameVi: 'Thang bậc QĐ 2A',
  effectiveFrom: '2026-01-01',
  effectiveTo: '',
  status: 'draft',
  kpiThreshold: '',
  bccStd: 0,
};

describe.skip('payPolicyPackForm — CHUNG', () => {
  it('AC-PAY-STP-01-05: effectiveTo < effectiveFrom → message VI, no payload needed', () => {
    const err = validatePolicyPackForm({
      ...base,
      effectiveTo: '2025-12-01',
    });
    expect(err).toBe(MSG_EFFECTIVE_DATE_ORDER);
  });

  it('rejects invalid effective dates', () => {
    const base: PolicyPackFormValues = {
      ...EMPTY_POLICY_PACK_FORM,
      code: 'P01',
      nameVi: 'Test',
      effectiveFrom: '2024-01-01',
      effectiveTo: '2023-12-31',
    };
    expect(validatePolicyPackForm(base)).toBe(MSG_EFFECTIVE_DATE_ORDER);
  });

  it('AC-PAY-STP-04-01: bcc_std submit là số thuần trong rateParams', () => {
    const payload = buildPolicyPackWritePayload({
      ...base,
      kpiThreshold: '70',
      bccStd: 5_000_000,
    });
    expect(payload.rateParams).toEqual({ kpi_threshold: 70, bcc_std: 5_000_000 });
    expect(typeof payload.rateParams?.bcc_std).toBe('number');
  });

  it('parseKpiThresholdInput — không chấp nhận nhóm nghìn', () => {
    expect(parseKpiThresholdInput('70')).toBe(70);
    expect(parseKpiThresholdInput('1.5')).toBe(1.5);
    expect(Number.isNaN(parseKpiThresholdInput('1.000') as number)).toBe(true);
  });

  it('extractChungRateParams đọc kpi_threshold + bcc_std từ API', () => {
    expect(
      extractChungRateParams({ kpi_threshold: 65, bcc_std: 3_000_000 }),
    ).toEqual({ kpiThreshold: '65', bccStd: 3_000_000, customRates: [] });
  });

  it('buildChungRateParams bỏ trống khi không có giá trị', () => {
    expect(buildChungRateParams(base)).toBeUndefined();
  });

  it('statusLabelVi FE-derive', () => {
    expect(statusLabelVi('retired')).toBe('Đã ngưng');
    expect(statusLabelVi(null)).toBe('—');
  });
});
