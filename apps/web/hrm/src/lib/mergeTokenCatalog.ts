/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Điều khoản HĐ · registry MergeToken
 * UC:         BR-PLT-01 · AC-PLT-CTR-05 · BR-PLT-05
 * BR:         DYNAMIC-LOCK · format-only tokenKey · soft-delete retire · display-ready labelVi
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §1.1C · §6
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-01..03
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §3
 * Purpose:    Helper mở catalog MergeToken — nhãn vi-VN + validate định dạng key (không enum đóng token_key).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01
 * Coded:      2026-08-07
 * Callers:    MergeTokenSettingsPanel · mergeTokenCatalog.test
 * Callees:    (pure) — không gọi API
 * FEActions:  nhập tokenKey → isValidMergeTokenKeyFormat → Lưu upsert
 * must_keep:  starter builtins ≠ trần · cấm closed token_key IN (N) trên FE · printable=false
 * SOLID:      Constants/helpers SRP — UI bind display-ready từ BE
 * solid_convention_ack: FE chỉ format + nhãn; không invent contracts_printable_ready
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Date:       2026-08-09
 * What:       RETAIN format-only + labelVi helpers; Wave-24 honesty cite via pltTokRing;
 *             printable false RETAIN; DENY Nest /core · mega-EAV · closed token enum.
 * Why:        UC-BP-PLT-01 · F-PLT-TOK RETAIN · R-PLT-01-DISP · must_keep CORE10/09/07
 * must_keep:  MERGE_TOKEN_PRINTABLE_HONESTY=false · open catalog format-only
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md
 */

/** Format-only — khớp BE MERGE_TOKEN_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const MERGE_TOKEN_KEY_FORMAT = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

export const MERGE_TOKEN_RINGS = [
  'public',
  'company',
  'contract',
  'cb',
  'clause',
  'custom',
] as const;
export type MergeTokenRing = (typeof MERGE_TOKEN_RINGS)[number];

export const MERGE_TOKEN_DOMAINS = [
  'CTR',
  'EMP',
  'REC',
  'ATT',
  'PAY',
  'SET',
  'CAT',
] as const;
export type MergeTokenDomain = (typeof MERGE_TOKEN_DOMAINS)[number];

export const MERGE_TOKEN_ORIGINS = [
  'builtin',
  'keyword_map',
  'extension_field',
  'import',
] as const;
export type MergeTokenOrigin = (typeof MERGE_TOKEN_ORIGINS)[number];

export const MERGE_TOKEN_STATUSES = ['draft', 'active', 'retired'] as const;
export type MergeTokenStatus = (typeof MERGE_TOKEN_STATUSES)[number];

/** Nhãn hiển thị ring — không dùng raw key một mình trên UI. */
export const MERGE_TOKEN_RING_LABELS: Record<MergeTokenRing, string> = {
  public: 'Công khai',
  company: 'Đơn vị',
  contract: 'Hợp đồng',
  cb: 'Lương / C&B (che khi thiếu quyền)',
  clause: 'Điều khoản',
  custom: 'Tuỳ chỉnh',
};

export const MERGE_TOKEN_DOMAIN_LABELS: Record<MergeTokenDomain, string> = {
  CTR: 'Hợp đồng',
  EMP: 'Nhân sự',
  REC: 'Tuyển dụng',
  ATT: 'Chấm công',
  PAY: 'Lương',
  SET: 'Cấu hình',
  CAT: 'Danh mục',
};

export const MERGE_TOKEN_ORIGIN_LABELS: Record<MergeTokenOrigin, string> = {
  builtin: 'Hệ thống (starter)',
  keyword_map: 'Ánh xạ mẫu HĐ',
  extension_field: 'Trường mở rộng Settings',
  import: 'Nhập khẩu',
};

export const MERGE_TOKEN_STATUS_LABELS: Record<MergeTokenStatus, string> = {
  draft: 'Nháp',
  active: 'Hiệu lực',
  retired: 'Đã ngừng',
};

export const MERGE_TOKEN_RESOLVE_SOURCE_LABELS: Record<string, string> = {
  issued: 'Bản phát hành (đóng băng)',
  registry: 'Registry MergeToken',
  keyword_map: 'Ánh xạ mẫu (keyword_map)',
  builtin: 'Builtin starter',
  override: 'Ghi đè preview',
  missing: 'Thiếu',
};

/** Diễn giải tiếng Việt và ví dụ mẫu cho người dùng nghiệp vụ HCNS / Hợp đồng. */
export const MERGE_TOKEN_DESCRIPTIONS: Record<
  string,
  { label: string; description: string; sample: string }
> = {
  employee_name: {
    label: 'Họ và tên người lao động',
    description: 'Họ tên đầy đủ của NLĐ theo Căn cước công dân hoặc Hồ sơ nhân sự',
    sample: 'Lê Văn Vũ',
  },
  identity_number: {
    label: 'Số CCCD / Hộ chiếu',
    description: 'Số Căn cước công dân hoặc Hộ chiếu cá nhân của người lao động',
    sample: '34078002397',
  },
  permanent_address: {
    label: 'Địa chỉ thường trú',
    description: 'Địa chỉ đăng ký thường trú ghi trên CCCD của người lao động',
    sample: 'Đông Hoàng, Đông Hưng, Thái Bình',
  },
  base_salary: {
    label: 'Mức lương chính / Tiền công',
    description: 'Mức lương cứng giao kết chính thức trên Hợp đồng lao động',
    sample: '5.007.600 VNĐ/tháng',
  },
  effective_date: {
    label: 'Ngày bắt đầu hiệu lực HĐ',
    description: 'Ngày hợp đồng chính thức có hiệu lực thi hành',
    sample: '14/06/2026',
  },
  expiration_date: {
    label: 'Ngày hết hạn hợp đồng',
    description: 'Ngày hợp đồng hết hiệu lực (áp dụng cho HĐ xác định thời hạn)',
    sample: '14/06/2027',
  },
  contract_type: {
    label: 'Loại hợp đồng lao động',
    description: 'Loại HĐ (HĐ Thử việc, HĐ 12T, HĐ 24T, Không xác định thời hạn)',
    sample: 'Hợp đồng lao động 12 tháng',
  },
  position_name: {
    label: 'Chức danh chuyên môn',
    description: 'Chức danh/vị trí công việc người lao động đảm nhận theo JD',
    sample: 'Nhân viên Lái xe',
  },
  department_name: {
    label: 'Phòng ban / Đơn vị công tác',
    description: 'Phòng ban hoặc chi nhánh văn phòng trực thuộc của NLĐ',
    sample: 'Văn phòng Nam Định',
  },
  company_name: {
    label: 'Tên Công ty / Pháp nhân NSDLĐ',
    description: 'Tên đầy đủ của đơn vị/pháp nhân đại diện Người sử dụng lao động',
    sample: 'CÔNG TY TNHH X.E VIỆT NAM',
  },
  employer_representative: {
    label: 'Người đại diện NSDLĐ',
    description: 'Họ và tên người đại diện theo pháp luật ký hợp đồng',
    sample: 'Nguyễn Trọng Khánh',
  },
  employer_position: {
    label: 'Chức vụ người đại diện',
    description: 'Chức vụ của đại diện NSDLĐ (Giám đốc / Tổng giám đốc)',
    sample: 'Giám Đốc',
  },
  driver_license_no: {
    label: 'Số Giấy phép lái xe (GPLX)',
    description: 'Số GPLX cấp cho người lao động (áp dụng riêng cho Khối Lái xe)',
    sample: '250188009076',
  },
  driver_license_class: {
    label: 'Hạng bằng lái xe',
    description: 'Hạng bằng lái xe (B2, C, D, E, FC...)',
    sample: 'Hạng B2',
  },
  driver_license_expiry: {
    label: 'Ngày hết hạn bằng lái xe',
    description: 'Ngày hết giá trị sử dụng của Giấy phép lái xe',
    sample: '31/08/2028',
  },
  working_hours_per_day: {
    label: 'Thời gian làm việc/ngày',
    description: 'Số giờ làm việc quy định trong một ngày làm việc',
    sample: '8h/ngày',
  },
  working_days_per_week: {
    label: 'Thời gian làm việc/tuần',
    description: 'Số ngày làm việc quy định trong một tuần',
    sample: '6 ngày/tuần',
  },
  deposit_amount: {
    label: 'Mức tiền ký quỹ xe',
    description: 'Khoản tiền ký quỹ bảo đảm tài sản xe (Khối Lái xe)',
    sample: '3.000.000 VNĐ',
  },
};

export function resolveMergeTokenDescription(tokenKey: string): {
  label: string;
  description: string;
  sample: string;
} {
  const key = normalizeMergeTokenKey(tokenKey);
  if (MERGE_TOKEN_DESCRIPTIONS[key]) {
    return MERGE_TOKEN_DESCRIPTIONS[key];
  }
  const formattedKey = key ? `{{${key}}}` : '—';
  return {
    label: formattedKey,
    description: `Biến dữ liệu trộn hệ thống (${formattedKey})`,
    sample: '—',
  };
}

/** Honesty — FE không flip UAT printable. */
export const MERGE_TOKEN_PRINTABLE_HONESTY = false;

export function normalizeMergeTokenKey(raw: string): string {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\{\{\s*/, '')
    .replace(/\s*\}\}$/, '');
}

/** Chỉ kiểm tra định dạng slug — cấm dùng để chặn «không nằm trong starter N». */
export function isValidMergeTokenKeyFormat(raw: string): boolean {
  const key = normalizeMergeTokenKey(raw);
  return Boolean(key) && MERGE_TOKEN_KEY_FORMAT.test(key);
}

/** Hiển thị cú pháp GĐ1 `{{token_key}}` kèm nhãn — không chỉ raw key. */
export function formatMergeTokenDisplay(tokenKey: string, labelVi?: string | null): string {
  const key = normalizeMergeTokenKey(tokenKey);
  const display = key ? `{{${key}}}` : '—';
  const label = String(labelVi ?? '').trim();
  if (!label) return display;
  return `${label} (${display})`;
}

export function mergeTokenRingLabel(ring: string | null | undefined): string {
  const r = String(ring ?? '').trim().toLowerCase() as MergeTokenRing;
  if ((MERGE_TOKEN_RINGS as readonly string[]).includes(r)) {
    return MERGE_TOKEN_RING_LABELS[r];
  }
  return ring?.trim() ? String(ring) : '—';
}

export function mergeTokenDomainLabel(domain: string | null | undefined): string {
  const d = String(domain ?? '').trim().toUpperCase() as MergeTokenDomain;
  if ((MERGE_TOKEN_DOMAINS as readonly string[]).includes(d)) {
    return MERGE_TOKEN_DOMAIN_LABELS[d];
  }
  return domain?.trim() ? String(domain) : '—';
}

export function mergeTokenOriginLabel(origin: string | null | undefined): string {
  const o = String(origin ?? '').trim().toLowerCase() as MergeTokenOrigin;
  if ((MERGE_TOKEN_ORIGINS as readonly string[]).includes(o)) {
    return MERGE_TOKEN_ORIGIN_LABELS[o];
  }
  return origin?.trim() ? String(origin) : '—';
}

export function mergeTokenStatusLabel(status: string | null | undefined): string {
  const s = String(status ?? '').trim().toLowerCase() as MergeTokenStatus;
  if ((MERGE_TOKEN_STATUSES as readonly string[]).includes(s)) {
    return MERGE_TOKEN_STATUS_LABELS[s];
  }
  return status?.trim() ? String(status) : '—';
}

export function mergeTokenResolveSourceLabel(source: string | null | undefined): string {
  const key = String(source ?? '').trim().toLowerCase();
  return MERGE_TOKEN_RESOLVE_SOURCE_LABELS[key] ?? (source?.trim() ? String(source) : '—');
}
