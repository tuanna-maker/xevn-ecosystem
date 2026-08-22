/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Gói chính sách CHUNG (STP-POLICY-PACK)
 * UC:         UC-BP-PAY-STP-01 · UC-BP-PAY-STP-03 · UC-BP-PAY-STP-04
 * BR:         BR-PAY-STP-02 · AC-PAY-STP-01-05 · AC-PAY-STP-03-01 · AC-PAY-STP-04-01
 * SRS:        docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md
 * TechSpec:   docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md §2.1
 * UI:         docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md §4.2–4.3
 * Purpose:    Pure helpers validate + build payload CHUNG policy pack — ngày hiệu lực,
 *             KPI threshold (0–100, không nhóm nghìn), BCC_STD (số thuần VND). FE không
 *             evaluate formula / không merge fragment (28-FE-BE-SEPARATION).
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-12
 * Callers:    PolicyPackSetupScreen.tsx
 * Callees:    (none — pure)
 * must_keep:  Message AC-PAY-STP-01-05 nguyên văn; KPI 0–100; bcc_std number thuần khi submit;
 *             scope CHUNG; payroll_e2e_ready=false; U65 zero-seed
 * SOLID:      SRP — chỉ form/rateParams helper, không gọi API
 * LastVerified: payPolicyPackForm.test.ts
 */

export type PolicyPackFormStatus = 'draft' | 'active' | 'retired';

export type PolicyPackFormValues = {
  code: string;
  nameVi: string;
  /** ISO yyyy-MM-dd (ViDateField store). */
  effectiveFrom: string;
  /** ISO yyyy-MM-dd optional. */
  effectiveTo: string;
  status: PolicyPackFormStatus;
  /** Score 0–100 — plain number string in UI; no thousand group. */
  kpiThreshold: string;
  /** VND plain number (from ViMoneyInput). */
  bccStd: number;
  /** Dynamic list of other rate params */
  customRates: { key: string; value: number }[];
};

export type PolicyPackWritePayload = {
  code: string;
  nameVi: string;
  scope: 'CHUNG';
  effectiveFrom: string;
  effectiveTo?: string;
  status: PolicyPackFormStatus;
  rateParams?: Record<string, number>;
};

export const POLICY_PACK_STATUS_LABEL_VI: Record<PolicyPackFormStatus, string> = {
  draft: 'Nháp',
  active: 'Đang áp dụng',
  retired: 'Đã ngưng',
};

export const MSG_EFFECTIVE_DATE_ORDER = 'Hiệu lực đến phải sau hiệu lực từ';
export const MSG_KPI_RANGE = 'KPI threshold phải từ 0 đến 100';
export const MSG_CODE_REQUIRED = 'Mã gói không được để trống.';
export const MSG_NAME_REQUIRED = 'Tên gói chính sách không được để trống.';
export const MSG_EFFECTIVE_FROM_REQUIRED = 'Hiệu lực từ là bắt buộc.';
export const MSG_SCOPE_403 =
  'Không có quyền thao tác scope này — liên hệ C&B tập đoàn';

export const EMPTY_POLICY_PACK_FORM: PolicyPackFormValues = {
  code: '',
  nameVi: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'draft',
  kpiThreshold: '',
  bccStd: 0,
  customRates: [],
};

/** Parse KPI score text — no thousand grouping; empty → null. */
export function parseKpiThresholdInput(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return null;
  // Reject vi-VN thousand groups (1.000) — score only allows ≤2 decimal places.
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) return Number.NaN;
  if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

export function validatePolicyPackForm(values: PolicyPackFormValues): string | null {
  if (!values.code.trim()) return MSG_CODE_REQUIRED;
  if (!values.nameVi.trim()) return MSG_NAME_REQUIRED;
  if (!values.effectiveFrom.trim()) return MSG_EFFECTIVE_FROM_REQUIRED;
  if (
    values.effectiveFrom &&
    values.effectiveTo &&
    values.effectiveTo < values.effectiveFrom
  ) {
    return MSG_EFFECTIVE_DATE_ORDER;
  }
  const kpi = parseKpiThresholdInput(values.kpiThreshold);
  if (kpi != null) {
    if (!Number.isFinite(kpi) || kpi < 0 || kpi > 100) {
      return MSG_KPI_RANGE;
    }
  }
  return null;
}

export function extractChungRateParams(
  rateParams: Record<string, unknown> | null | undefined,
): Pick<PolicyPackFormValues, 'kpiThreshold' | 'bccStd' | 'customRates'> {
  const src = rateParams ?? {};
  const kpiRaw = src.kpi_threshold ?? src.kpi_threshold_score;
  let kpiThreshold = '';
  if (typeof kpiRaw === 'number' && Number.isFinite(kpiRaw)) {
    kpiThreshold = String(kpiRaw);
  } else if (typeof kpiRaw === 'string' && kpiRaw.trim()) {
    kpiThreshold = kpiRaw.trim();
  }
  const bccRaw = src.bcc_std;
  let bccStd = 0;
  if (typeof bccRaw === 'number' && Number.isFinite(bccRaw)) {
    bccStd = Math.trunc(bccRaw);
  } else if (typeof bccRaw === 'string' && bccRaw.trim()) {
    const n = Number(bccRaw.replace(/[^\d-]/g, ''));
    bccStd = Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  
  const customRates: { key: string; value: number }[] = [];
  for (const [k, v] of Object.entries(src)) {
    if (k !== 'kpi_threshold' && k !== 'kpi_threshold_score' && k !== 'bcc_std') {
      const num = Number(v);
      if (Number.isFinite(num)) {
        customRates.push({ key: k, value: num });
      }
    }
  }

  return { kpiThreshold, bccStd, customRates };
}

export function buildChungRateParams(values: PolicyPackFormValues): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  const kpi = parseKpiThresholdInput(values.kpiThreshold);
  if (kpi != null && Number.isFinite(kpi)) {
    out.kpi_threshold = kpi;
  }
  if (values.bccStd > 0) {
    out.bcc_std = Math.trunc(values.bccStd);
  }
  if (values.customRates && values.customRates.length > 0) {
    values.customRates.forEach(rate => {
      if (rate.key.trim() && Number.isFinite(rate.value)) {
        out[rate.key.trim()] = rate.value;
      }
    });
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function buildPolicyPackWritePayload(values: PolicyPackFormValues): PolicyPackWritePayload {
  const payload: PolicyPackWritePayload = {
    code: values.code.trim(),
    nameVi: values.nameVi.trim(),
    scope: 'CHUNG',
    effectiveFrom: values.effectiveFrom.trim(),
    status: values.status,
  };
  if (values.effectiveTo.trim()) {
    payload.effectiveTo = values.effectiveTo.trim();
  }
  const rateParams = buildChungRateParams(values);
  if (rateParams) {
    payload.rateParams = rateParams;
  }
  return payload;
}

export function statusLabelVi(status: string | null | undefined): string {
  if (!status) return '—';
  if (status in POLICY_PACK_STATUS_LABEL_VI) {
    return POLICY_PACK_STATUS_LABEL_VI[status as PolicyPackFormStatus];
  }
  return status;
}
