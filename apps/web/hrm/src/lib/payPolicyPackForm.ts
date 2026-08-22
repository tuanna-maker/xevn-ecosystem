/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Chính sách lương (Policy Pack)
 * UC:         UC-BP-PAY-STP-01 · UC-BP-PAY-STP-03 · UC-BP-PAY-STP-04
 * Purpose:    Pure helpers validate + build payload CHUNG policy pack.
 *             2026-08-22 ADD: Mô hình Data Grid động hoàn toàn.
 *             Mỗi PolicyPack có 1 packType duy nhất. Mỗi PolicyGroup là 1 lưới dữ liệu (columns + rows).
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 * Callers:    PolicyPackSetupScreen.tsx
 * SOLID:      SRP — chỉ form/rateParams helper, không gọi API
 */

export type PolicyPackFormStatus = 'draft' | 'active' | 'retired';

// ---------------------------------------------------------------------------
// Unified Dynamic Data Grid Model
// ---------------------------------------------------------------------------

export type PolicyPackType =
  | 'salary_scale' // Thang/Bảng lương (Gợi ý cột Ngạch, Chức danh, Bậc)
  | 'allowance'    // Phụ cấp (Gợi ý các cột phụ cấp)
  | 'kpi_bonus'    // Thưởng KPI
  | 'custom_grid'; // Bảng lưới tùy chỉnh

export const POLICY_PACK_TYPE_LABELS: Record<PolicyPackType, string> = {
  salary_scale: 'Thang lương / Bảng lương',
  allowance:    'Phụ cấp',
  kpi_bonus:    'Thưởng KPI',
  custom_grid:  'Bảng tùy chỉnh',
};

export type DynamicColumn = {
  id: string; // nanoid
  name: string; // Tên hiển thị (VD: Bậc 1, Phụ cấp xăng xe)
  mappedField?: string; // Biến hệ thống nếu có map (VD: base_salary, allowance_gas)
  isGradePicker?: boolean; // Flag để render UI dạng chọn Ngạch (nếu cần)
};

export type DynamicRow = {
  id: string; // nanoid
  cells: Record<string, string | number>; // Map col.id -> giá trị nhập vào
};

export type PolicyGroup = {
  clientId: string;
  code: string; // Mã nhóm (VD: II)
  name: string; // Tên nhóm (VD: Hệ thống thang, bảng lương)
  columns: DynamicColumn[];
  rows: DynamicRow[];
};

// ---------------------------------------------------------------------------
// Form values
// ---------------------------------------------------------------------------

export type PolicyPackFormValues = {
  code: string;
  nameVi: string;
  packType: PolicyPackType;
  effectiveFrom: string;
  effectiveTo: string;
  status: PolicyPackFormStatus;
  groups: PolicyGroup[];
};

export type PolicyPackWritePayload = {
  code: string;
  nameVi: string;
  scope: 'CHUNG';
  effectiveFrom: string;
  effectiveTo?: string;
  status: PolicyPackFormStatus;
  rateParams?: Record<string, unknown>;
};

export const POLICY_PACK_STATUS_LABEL_VI: Record<PolicyPackFormStatus, string> = {
  draft: 'Nháp',
  active: 'Đang áp dụng',
  retired: 'Đã ngưng',
};

export const MSG_EFFECTIVE_DATE_ORDER = 'Hiệu lực đến phải sau hiệu lực từ';
export const MSG_CODE_REQUIRED = 'Mã chính sách không được để trống.';
export const MSG_NAME_REQUIRED = 'Tên chính sách không được để trống.';
export const MSG_EFFECTIVE_FROM_REQUIRED = 'Hiệu lực từ là bắt buộc.';
export const MSG_SCOPE_403 = 'Không có quyền thao tác scope này — liên hệ C&B tập đoàn';

// ---------------------------------------------------------------------------
// Helper Utils
// ---------------------------------------------------------------------------

export function genClientId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const EMPTY_POLICY_PACK_FORM: PolicyPackFormValues = {
  code: '',
  nameVi: '',
  packType: 'salary_scale',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'draft',
  groups: [],
};

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
  return null;
}

export function extractChungRateParams(
  rateParams: Record<string, unknown> | null | undefined,
): Pick<PolicyPackFormValues, 'packType' | 'groups'> {
  const src = rateParams ?? {};
  
  let packType: PolicyPackType = 'custom_grid';
  if (typeof src.packType === 'string' && src.packType in POLICY_PACK_TYPE_LABELS) {
    packType = src.packType as PolicyPackType;
  }

  let groups: PolicyGroup[] = [];
  if (Array.isArray(src.__groups)) {
    groups = src.__groups as PolicyGroup[];
  }

  return { packType, groups };
}

export function buildChungRateParams(values: PolicyPackFormValues): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  out.packType = values.packType;
  
  if (values.groups && values.groups.length > 0) {
    out.__groups = values.groups;
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

/** Pre-populate columns based on packType */
export function generateDefaultColumnsForType(type: PolicyPackType): DynamicColumn[] {
  switch (type) {
    case 'salary_scale':
      return [
        { id: genClientId(), name: 'Mã ngạch', isGradePicker: true, mappedField: 'grade_code' },
        { id: genClientId(), name: 'Chức danh công việc', mappedField: 'position_hint' },
        { id: genClientId(), name: 'Bậc I', mappedField: 'step_1' },
      ];
    case 'allowance':
      return [
        { id: genClientId(), name: 'Đối tượng áp dụng', mappedField: 'target_group' },
        { id: genClientId(), name: 'Phân mức (%)', mappedField: 'allowance_tier' },
        { id: genClientId(), name: 'Xăng xe', mappedField: 'allowance_gas' },
        { id: genClientId(), name: 'Điện thoại', mappedField: 'allowance_phone' },
      ];
    case 'kpi_bonus':
      return [
        { id: genClientId(), name: 'Đối tượng áp dụng', mappedField: 'target_group' },
        { id: genClientId(), name: 'Tỷ lệ tối đa (%)', mappedField: 'max_pct' },
      ];
    case 'custom_grid':
    default:
      return [
        { id: genClientId(), name: 'Đối tượng áp dụng', mappedField: 'target_group' },
        { id: genClientId(), name: 'Giá trị' },
      ];
  }
}
