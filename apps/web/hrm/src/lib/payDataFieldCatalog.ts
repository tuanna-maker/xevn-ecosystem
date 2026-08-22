/**
 * Danh mục trường dữ liệu công thức lương — nhãn tiếng Việt, không bắt user nhớ mã DB.
 * SoT mã biến: đồng bộ DV-18 + Input Pack (lowercase snake_case).
 */
export type PayDataFieldGroupId =
  | 'attendance'
  | 'compensation'
  | 'input_pack'
  | 'allowance'
  | 'deduction';

export type PayDataFieldItem = {
  id: string;
  key: string;
  label: string;
  group: PayDataFieldGroupId;
  groupLabel: string;
  /** Mô tả nguồn thân thiện — không lộ tên bảng SQL trên chip chính. */
  sourceHint: string;
  /** Từ khóa tiếng Việt để tìm (phép, công…). Không dùng buổi trừ khi attendanceUnit=shift. */
  keywords?: string[];
};

export type PayAttendanceUnit = 'hours' | 'shift';

/** Công thức lương GĐ1 chỉ bag giờ — buổi chỉ khi tenant bật đơn vị buổi (sau này từ cấu hình CC). */
export function isPayFormulaShiftUnitEnabled(unit: PayAttendanceUnit = 'hours'): boolean {
  return unit === 'shift';
}

export type PayFormulaQuickInsert = {
  id: string;
  label: string;
  insert: string;
  hint: string;
  keywords: string[];
};

/** Chỉ dùng khi isPayFormulaShiftUnitEnabled — quy đổi giờ ↔ buổi theo giờ/ca. */
export const PAY_FORMULA_QUICK_INSERTS: PayFormulaQuickInsert[] = [
  {
    id: 'qi-paid-leave-days',
    label: 'Buổi nghỉ có lương',
    insert: 'paid_leave_hours / 8',
    hint: 'Giờ nghỉ phép ÷ 8 — chỉnh 8 nếu giờ/buổi công ty khác',
    keywords: ['buổi nghỉ', 'số buổi', 'ngày nghỉ', 'nghỉ phép', 'buổi phép', 'buổi có lương'],
  },
  {
    id: 'qi-unpaid-leave-days',
    label: 'Buổi nghỉ không lương',
    insert: 'unpaid_leave_hours / 8',
    hint: 'Giờ nghỉ không lương ÷ 8',
    keywords: ['buổi nghỉ không lương', 'ngày nghỉ không lương', 'nghỉ không lương'],
  },
  {
    id: 'qi-payable-days',
    label: 'Buổi công hưởng lương',
    insert: 'payable_hours / 8',
    hint: 'Giờ công hưởng lương ÷ 8',
    keywords: ['buổi công', 'ngày công', 'số buổi công', 'công thực tế'],
  },
  {
    id: 'qi-standard-days',
    label: 'Buổi công chuẩn kỳ',
    insert: 'standard_hours / 8',
    hint: 'Giờ công chuẩn ÷ 8',
    keywords: ['buổi chuẩn', 'ngày công chuẩn', 'công chuẩn'],
  },
];

export const PAY_DATA_FIELD_POPULAR_KEYS = [
  'base_salary',
  'payable_hours',
  'standard_hours',
  'paid_leave_hours',
  'unpaid_leave_hours',
  'ot_hours_weighted',
  'kpi',
  'dependents_count',
] as const;

export const PAY_DATA_FIELD_GROUP_LABELS: Record<PayDataFieldGroupId, string> = {
  attendance: 'Chấm công & thời gian',
  compensation: 'Lương & hồ sơ nhân viên',
  input_pack: 'Số liệu kỳ lương (nhập / tích hợp)',
  allowance: 'Phụ cấp',
  deduction: 'Khấu trừ & bảo hiểm',
};

const CORE_FIELDS: PayDataFieldItem[] = [
  {
    id: 'cv1',
    key: 'payable_hours',
    label: 'Giờ công hưởng lương',
    group: 'attendance',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.attendance,
    sourceHint: 'Từ bảng chấm công đã khóa',
    keywords: ['giờ công', 'công thực tế', 'công hưởng lương', 'công tính lương'],
  },
  {
    id: 'cv2',
    key: 'standard_hours',
    label: 'Giờ công chuẩn kỳ',
    group: 'attendance',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.attendance,
    sourceHint: 'Lịch ca / quy định công ty',
    keywords: ['công chuẩn', 'giờ chuẩn'],
  },
  {
    id: 'cv3',
    key: 'ot_hours_weighted',
    label: 'Giờ làm thêm (đã quy đổi hệ số)',
    group: 'attendance',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.attendance,
    sourceHint: 'Tăng ca đã nhân hệ số',
    keywords: ['tăng ca', 'làm thêm', 'ot', 'overtime'],
  },
  {
    id: 'cv4',
    key: 'paid_leave_hours',
    label: 'Giờ nghỉ phép có lương',
    group: 'attendance',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.attendance,
    sourceHint: 'Nghỉ phép hưởng lương (đơn vị giờ)',
    keywords: ['nghỉ phép', 'phép có lương', 'nghỉ hưởng lương', 'giờ phép'],
  },
  {
    id: 'cv5',
    key: 'unpaid_leave_hours',
    label: 'Giờ nghỉ không lương',
    group: 'attendance',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.attendance,
    sourceHint: 'Nghỉ không hưởng lương',
    keywords: ['nghỉ không lương', 'nghỉ không hưởng', 'vắng không lương'],
  },
  {
    id: 'cv6',
    key: 'base_salary',
    label: 'Lương cơ bản (hợp đồng)',
    group: 'compensation',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.compensation,
    sourceHint: 'Hồ sơ lương / gói C&B',
  },
  {
    id: 'cv7',
    key: 'dependents_count',
    label: 'Số người phụ thuộc',
    group: 'compensation',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.compensation,
    sourceHint: 'Giảm trừ gia cảnh thuế TNCN',
  },
];

const INPUT_PACK_FIELDS: PayDataFieldItem[] = [
  { id: 'ip01', key: 'manual', label: 'Nhập tay (tự do)', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'HR nhập thủ công' },
  { id: 'ip02', key: 'kpi', label: 'Điểm / hệ số KPI', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Nhập kỳ lương hoặc tích hợp' },
  { id: 'ip05', key: 'cldv', label: 'Điểm chất lượng dịch vụ (CLDV)', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Đánh giá cuối kỳ' },
  { id: 'ip06', key: 'route_count', label: 'Số lượt / chuyến', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Vận tải / tuyến' },
  { id: 'ip07', key: 'revenue', label: 'Doanh thu', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Phân bổ doanh thu NV' },
  { id: 'ip03', key: 'dll_cpn', label: 'Doanh lượng CPN', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Kinh doanh CPN' },
  { id: 'ip04', key: 'cpsc', label: 'Chi phí sửa chữa chung (CPSC)', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Phân bổ kỳ lương' },
  { id: 'ip08', key: 'advance', label: 'Tạm ứng lương', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Trừ vào net pay' },
  { id: 'ip09', key: 'xdtn', label: 'Phụ cấp đi đường / XDTN', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Phân bổ kỳ' },
  { id: 'ip10', key: 'vp_cost', label: 'Chi phí văn phòng (C)', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Phân bổ VP' },
  { id: 'ip11', key: 'vp_allowance', label: 'Trợ lương văn phòng (B)', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Theo vị trí VP' },
  { id: 'ip12', key: 'other_income', label: 'Thu nhập khác', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Phát sinh ngoài danh mục' },
  { id: 'ip13', key: 'rd_transfer', label: 'Truy thu / truy lĩnh', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Điều chỉnh kỳ trước' },
  { id: 'ip14', key: 'vehicle_rate', label: 'Hệ số / đơn giá xe', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Lái xe tải' },
  { id: 'ip15', key: 'route_price', label: 'Đơn giá chuyến / tuyến', group: 'input_pack', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.input_pack, sourceHint: 'Lái xe tuyến' },
];

const ALLOWANCE_FIELDS: PayDataFieldItem[] = [
  { id: 'al1', key: 'allowance_meal', label: 'Phụ cấp ăn ca / ăn trưa', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Gói C&B nhân viên' },
  { id: 'al2', key: 'allowance_phone', label: 'Phụ cấp điện thoại', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Gói C&B nhân viên' },
  { id: 'al3', key: 'allowance_p2', label: 'Phụ cấp P2 / thu nhập bổ sung', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Gói C&B nhân viên' },
  { id: 'al4', key: 'allowance_shift3', label: 'Phụ cấp ca 3 / điều kiện', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Ca đêm / điều kiện' },
  { id: 'al5', key: 'allowance_heavy', label: 'Phụ cấp điều kiện nặng nhọc', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Lái xe / vận hành' },
  { id: 'al6', key: 'allowance_bonus', label: 'Phụ cấp / thưởng an toàn', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Theo chính sách' },
  { id: 'al7', key: 'allowance_kpi', label: 'Phụ cấp KPI', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Gói C&B' },
  { id: 'al8', key: 'allowance_shift', label: 'Phụ cấp ca / trực', group: 'allowance', groupLabel: PAY_DATA_FIELD_GROUP_LABELS.allowance, sourceHint: 'Ca / trực' },
];

const DEDUCTION_FIELDS: PayDataFieldItem[] = [
  {
    id: 'dd1',
    key: 'insurance_employee',
    label: 'BHXH/BHYT/BHTN (phần NLĐ)',
    group: 'deduction',
    groupLabel: PAY_DATA_FIELD_GROUP_LABELS.deduction,
    sourceHint: 'Khấu trừ bảo hiểm',
  },
];

export const PAY_DATA_FIELD_CATALOG: PayDataFieldItem[] = [
  ...CORE_FIELDS,
  ...INPUT_PACK_FIELDS,
  ...ALLOWANCE_FIELDS,
  ...DEDUCTION_FIELDS,
];

export function searchPayDataFields(query: string, limit = 999): PayDataFieldItem[] {
  const q = query.trim().toLowerCase();
  const popular = PAY_DATA_FIELD_POPULAR_KEYS.map((key) =>
    PAY_DATA_FIELD_CATALOG.find((f) => f.key === key),
  ).filter((f): f is PayDataFieldItem => Boolean(f));

  if (!q) {
    return popular.slice(0, limit);
  }

  // Chưa đủ ký tự — giữ gợi ý hay dùng, tránh picker nhảy layout khi gõ từng chữ.
  if (q.length < 2) {
    return popular.slice(0, limit);
  }

  const scored = PAY_DATA_FIELD_CATALOG.map((f) => {
    let score = 0;
    const label = f.label.toLowerCase();
    const key = f.key.toLowerCase();
    if (label === q) score += 100;
    else if (label.startsWith(q)) score += 80;
    else if (label.includes(q)) score += 60;
    if (key.includes(q)) score += 40;
    if (f.sourceHint.toLowerCase().includes(q)) score += 20;
    for (const kw of f.keywords ?? []) {
      const k = kw.toLowerCase();
      if (k === q) score += 90;
      else if (k.includes(q) || q.includes(k)) score += 50;
    }
    for (const part of q.split(/\s+/).filter((p) => p.length > 1)) {
      if (label.includes(part)) score += 25;
      if (key.includes(part)) score += 15;
      for (const kw of f.keywords ?? []) {
        if (kw.toLowerCase().includes(part)) score += 35;
      }
    }
    return { f, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ f }) => f);
}

export function searchPayFormulaQuickInserts(
  query: string,
  attendanceUnit: PayAttendanceUnit = 'hours',
  limit = 4,
): PayFormulaQuickInsert[] {
  if (!isPayFormulaShiftUnitEnabled(attendanceUnit)) return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PAY_FORMULA_QUICK_INSERTS.filter((item) => {
    if (item.label.toLowerCase().includes(q)) return true;
    return item.keywords.some((kw) => {
      const k = kw.toLowerCase();
      return k.includes(q) || q.includes(k) || q.split(/\s+/).some((part) => part.length > 1 && k.includes(part));
    });
  }).slice(0, limit);
}

/** Gợi ý quy đổi buổi — chỉ khi tenant dùng đơn vị buổi trong công thức chung. */
export function suggestPayFormulaQuickInserts(
  query: string,
  attendanceUnit: PayAttendanceUnit = 'hours',
): PayFormulaQuickInsert[] {
  if (!isPayFormulaShiftUnitEnabled(attendanceUnit)) return [];
  const q = query.trim().toLowerCase();
  if (!q) return PAY_FORMULA_QUICK_INSERTS.slice(0, 2);
  const direct = searchPayFormulaQuickInserts(q, attendanceUnit);
  if (direct.length > 0) return direct;
  if (/buổi|ngày/.test(q)) return PAY_FORMULA_QUICK_INSERTS.slice(0, 3);
  return [];
}

export function groupPayDataFields(items: PayDataFieldItem[]): Map<PayDataFieldGroupId, PayDataFieldItem[]> {
  const map = new Map<PayDataFieldGroupId, PayDataFieldItem[]>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return map;
}

/** Cho FormulaInput autocomplete — code = key, name = label tiếng Việt. */
export function payDataFieldsForFormulaInput(): { code: string; name: string }[] {
  return PAY_DATA_FIELD_CATALOG.map((f) => ({ code: f.key, name: f.label }));
}

export function payDataFieldLabel(key: string): string {
  const k = key.trim().toLowerCase();
  const hit = PAY_DATA_FIELD_CATALOG.find((f) => f.key === k);
  if (hit) return hit.label;
  if (/^allowance_/.test(k)) {
    return `Phụ cấp (${k.replace(/^allowance_/, '').replace(/_/g, ' ')})`;
  }
  return k;
}
