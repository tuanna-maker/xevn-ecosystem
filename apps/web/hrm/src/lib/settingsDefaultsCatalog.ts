/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Mặc định thuế / BH / PC theo vị trí
 * UC:         UC-SET-DEF-01..05 · AC-AMIS-SET-TAX/SI/POS
 * BR:         BR-AMIS-SET-DEF-01..08 · BR-AMIS-PAY-SRC-02 · soft-delete
 * SRS:        docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-DATA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md F-SET-TAX/SI/POS
 * API_DESIGN: F-SET-TAX-01 · F-SET-SI-01..03 · F-SET-POS-01..05
 * DB_DESIGN:  hrm_company_settings · pay_insurance_rate_cfg · hrm_position_compensation_policy(+lines)
 * Purpose:    Helper nhãn + payload builders display-ready — không FE công thức thuế/BH/lương.
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-FE-01
 * Coded:      2026-08-07
 * Callers:    SettingsDefaultsPanel · settingsDefaultsCatalog.test
 * Callees:    (pure) — không gọi API / không tính % / không invent GTGC
 * FEActions:  form → buildTaxPutBody / buildSiCreateBody / buildPosCreateBody (DTO camelCase)
 * must_keep:  payroll_e2e_ready=false · SRC-02 resolve read-only · cấm positionLabelSnapshot trên create · U65
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE–BE — chỉ format + nhãn + pass-through DTO; không formula / không silent 0%
 * LastVerified: docs/qa/evidence/po-hrm-settings-defaults-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-SETTINGS-DEFAULTS-FE-01
 * change_mode: ADD
 * What: Catalog helpers for Settings tax/SI/POS UF wire
 * Why: QC-02 CONDITION FE Settings UF deferred · L1 API GWC
 * must_keep: no invent business rules · no positionLabelSnapshot on create body
 */

/** Honesty lock — FE không được flip / claim LIVE payroll e2e. */
export const SETTINGS_DEFAULTS_PAYROLL_E2E_READY = false as const;

export const PAY_TAX_KEY_PREFIX = 'pay_tax_';
export const PAY_TAX_PERSONAL_DEDUCTION = 'pay_tax_personal_deduction_vnd';
export const PAY_TAX_DEPENDENT_DEDUCTION = 'pay_tax_dependent_deduction_vnd';
export const PAY_TAX_REGIME = 'pay_tax_regime';
export const PAY_TAX_FLAGS = 'pay_tax_flags';

export const PAY_TAX_STARTER_KEYS = [
  PAY_TAX_PERSONAL_DEDUCTION,
  PAY_TAX_DEPENDENT_DEDUCTION,
  PAY_TAX_REGIME,
  PAY_TAX_FLAGS,
] as const;

export const PAY_TAX_KEY_LABELS: Record<(typeof PAY_TAX_STARTER_KEYS)[number], string> = {
  [PAY_TAX_PERSONAL_DEDUCTION]: 'Giảm trừ bản thân (VND)',
  [PAY_TAX_DEPENDENT_DEDUCTION]: 'Giảm trừ người phụ thuộc (VND)',
  [PAY_TAX_REGIME]: 'Chế độ thuế',
  [PAY_TAX_FLAGS]: 'Cờ áp dụng giảm trừ',
};

export const PAY_TAX_REGIME_OPTIONS = [
  { code: 'progressive_vn', labelVi: 'Lũy tiến Việt Nam' },
  { code: 'other', labelVi: 'Khác' },
] as const;

export const SI_STATUSES = ['draft', 'active', 'retired'] as const;
export type SiStatus = (typeof SI_STATUSES)[number];

export const SI_STATUS_LABELS: Record<SiStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang hiệu lực',
  retired: 'Đã ngừng',
};

/** Format-only — khớp BE INSURANCE_TYPE_KEY_FORMAT; open catalog. */
export const INSURANCE_TYPE_KEY_FORMAT = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

export const POS_STATUSES = ['draft', 'active', 'retired'] as const;
export type PosStatus = (typeof POS_STATUSES)[number];

export const POS_STATUS_LABELS: Record<PosStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang hiệu lực',
  retired: 'Đã ngừng',
};

export const POS_CALC_MODES = ['fixed', 'formula', 'rate'] as const;
export type PosCalcMode = (typeof POS_CALC_MODES)[number];

export const POS_CALC_MODE_LABELS: Record<PosCalcMode, string> = {
  fixed: 'Số cố định',
  formula: 'Công thức (BE)',
  rate: 'Tỷ lệ (BE)',
};

export type TaxDeductionValue = { amount: number; currency: string };
export type TaxRegimeValue = { code: string; note?: string };
export type TaxFlagsValue = {
  applyPersonalDeduction: boolean;
  applyDependentDeduction: boolean;
};

export type TaxFormState = {
  personalAmount: number;
  dependentAmount: number;
  regimeCode: string;
  applyPersonalDeduction: boolean;
  applyDependentDeduction: boolean;
};

export function emptyTaxForm(): TaxFormState {
  return {
    personalAmount: 0,
    dependentAmount: 0,
    regimeCode: 'progressive_vn',
    applyPersonalDeduction: true,
    applyDependentDeduction: true,
  };
}

export function taxKeyLabel(key: string): string {
  if ((PAY_TAX_STARTER_KEYS as readonly string[]).includes(key)) {
    return PAY_TAX_KEY_LABELS[key as (typeof PAY_TAX_STARTER_KEYS)[number]];
  }
  return key.trim() || '—';
}

export function siStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if ((SI_STATUSES as readonly string[]).includes(s)) {
    return SI_STATUS_LABELS[s as SiStatus];
  }
  return status?.trim() || '—';
}

export function posStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if ((POS_STATUSES as readonly string[]).includes(s)) {
    return POS_STATUS_LABELS[s as PosStatus];
  }
  return status?.trim() || '—';
}

export function posCalcModeLabel(mode: string | null | undefined): string {
  const s = String(mode ?? '')
    .trim()
    .toLowerCase();
  if ((POS_CALC_MODES as readonly string[]).includes(s)) {
    return POS_CALC_MODE_LABELS[s as PosCalcMode];
  }
  return mode?.trim() || '—';
}

export function isValidInsuranceTypeKeyFormat(key: string): boolean {
  return INSURANCE_TYPE_KEY_FORMAT.test(key.trim());
}

export function normalizeInsuranceTypeKey(raw: string): string {
  return raw.trim().replace(/\s+/g, '_');
}

/** Read amount from company-settings value_json display-ready. */
export function readTaxAmount(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  const amount = (value as { amount?: unknown }).amount;
  const n = typeof amount === 'number' ? amount : Number(amount);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function readTaxRegimeCode(value: unknown): string {
  if (!value || typeof value !== 'object') return 'progressive_vn';
  const code = String((value as { code?: unknown }).code ?? '').trim();
  return code || 'progressive_vn';
}

export function readTaxFlags(value: unknown): TaxFlagsValue {
  if (!value || typeof value !== 'object') {
    return { applyPersonalDeduction: true, applyDependentDeduction: true };
  }
  const o = value as Record<string, unknown>;
  return {
    applyPersonalDeduction: o.applyPersonalDeduction !== false,
    applyDependentDeduction: o.applyDependentDeduction !== false,
  };
}

export function taxFormFromSettingsItems(
  items: Array<{ settingKey: string; value: unknown }>,
): TaxFormState {
  const byKey = new Map(items.map((i) => [i.settingKey, i.value]));
  const flags = readTaxFlags(byKey.get(PAY_TAX_FLAGS));
  return {
    personalAmount: readTaxAmount(byKey.get(PAY_TAX_PERSONAL_DEDUCTION)),
    dependentAmount: readTaxAmount(byKey.get(PAY_TAX_DEPENDENT_DEDUCTION)),
    regimeCode: readTaxRegimeCode(byKey.get(PAY_TAX_REGIME)),
    applyPersonalDeduction: flags.applyPersonalDeduction,
    applyDependentDeduction: flags.applyDependentDeduction,
  };
}

/** PUT body camelCase — F-SET-TAX-01 (companyId/settingKey/value). */
export function buildTaxPutBody(
  companyId: string,
  settingKey: string,
  value: unknown,
): { companyId: string; settingKey: string; value: unknown } {
  return {
    companyId: companyId.trim(),
    settingKey: settingKey.trim(),
    value,
  };
}

export function buildTaxDeductionValue(amount: number): TaxDeductionValue {
  return { amount: Number.isFinite(amount) && amount >= 0 ? amount : 0, currency: 'VND' };
}

export function buildTaxRegimeValue(code: string, note?: string): TaxRegimeValue {
  const out: TaxRegimeValue = { code: code.trim() || 'progressive_vn' };
  if (note?.trim()) out.note = note.trim();
  return out;
}

export function buildTaxFlagsValue(form: TaxFormState): TaxFlagsValue {
  return {
    applyPersonalDeduction: form.applyPersonalDeduction,
    applyDependentDeduction: form.applyDependentDeduction,
  };
}

export type SiCreateDraft = {
  insuranceTypeKey: string;
  employeeRatePct: number;
  employerRatePct: number;
  ceilingAmount?: number | null;
  currency?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status?: SiStatus;
  notes?: string | null;
};

/** POST body — F-SET-SI-02. Dates must be YYYY-MM-DD (BE-02). */
export function buildSiCreateBody(
  companyId: string,
  draft: SiCreateDraft,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    companyId: companyId.trim(),
    insuranceTypeKey: normalizeInsuranceTypeKey(draft.insuranceTypeKey),
    employeeRatePct: draft.employeeRatePct,
    employerRatePct: draft.employerRatePct,
    effectiveFrom: draft.effectiveFrom.trim(),
    status: draft.status ?? 'active',
    currency: draft.currency?.trim() || 'VND',
  };
  if (draft.ceilingAmount != null && Number.isFinite(draft.ceilingAmount)) {
    body.ceilingAmount = draft.ceilingAmount;
  }
  if (draft.effectiveTo?.trim()) body.effectiveTo = draft.effectiveTo.trim();
  if (draft.notes?.trim()) body.notes = draft.notes.trim();
  return body;
}

export type PosLineDraft = {
  componentCode: string;
  amount: number;
  calcMode?: PosCalcMode;
  currency?: string;
  sortOrder?: number;
};

export type PosCreateDraft = {
  positionKey: string;
  nameVi?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status?: PosStatus;
  lines: PosLineDraft[];
};

/**
 * POST body — F-SET-POS-02.
 * must_keep: KHÔNG gửi positionLabelSnapshot (DTO whitelist → HRM-VAL-001).
 */
export function buildPosCreateBody(
  companyId: string,
  draft: PosCreateDraft,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    companyId: companyId.trim(),
    positionKey: draft.positionKey.trim(),
    effectiveFrom: draft.effectiveFrom.trim(),
    status: draft.status ?? 'active',
    lines: draft.lines
      .filter((l) => l.componentCode.trim())
      .map((l, idx) => ({
        componentCode: l.componentCode.trim(),
        amount: Number.isFinite(l.amount) && l.amount >= 0 ? l.amount : 0,
        calcMode: l.calcMode ?? 'fixed',
        currency: l.currency?.trim() || 'VND',
        sortOrder: l.sortOrder ?? idx,
      })),
  };
  if (draft.nameVi?.trim()) body.nameVi = draft.nameVi.trim();
  if (draft.effectiveTo?.trim()) body.effectiveTo = draft.effectiveTo.trim();
  return body;
}

/** Resolve draft honesty — warnings may include NO_POLICY; never invent emp package. */
export function formatPosResolveWarnings(warnings: string[] | null | undefined): string {
  const list = (warnings ?? []).map((w) => String(w).trim()).filter(Boolean);
  if (list.length === 0) return 'Có chính sách khớp (draft read-only).';
  if (list.includes('NO_POLICY')) {
    return 'Chưa có chính sách hiệu lực (NO_POLICY) — chỉ xem trước, không ghi C&B NV.';
  }
  return list.join('; ');
}
