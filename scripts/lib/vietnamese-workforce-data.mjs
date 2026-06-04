/**
 * Realistic Vietnamese workforce labels — HR industry naming (Labor Code VN).
 * Catalog keys align with XBOS/HRM sync; display labels are Vietnamese.
 */

export const HRM_CONTRACT_TYPES = [
  { key: 'HDLD_KTH', label: 'Hợp đồng lao động không xác định thời hạn' },
  { key: 'HDLD_XDHN_12', label: 'Hợp đồng lao động xác định thời hạn 12 tháng' },
  { key: 'HDLD_XDHN_36', label: 'Hợp đồng lao động xác định thời hạn 36 tháng' },
  { key: 'HDTV_60', label: 'Hợp đồng thử việc' },
  { key: 'HDHV', label: 'Hợp đồng học việc' },
];

export const HRM_INSURANCE_PROVIDERS = ['Bảo Việt', 'PVI', 'MIC', 'Bảo Minh', 'Prudential VN'];

export const ROLE_LABELS_VI = {
  CEO: 'Tổng Giám đốc',
  COO: 'Giám đốc Điều hành',
  CFO: 'Giám đốc Tài chính',
  CHRO: 'Giám đốc Nhân sự',
  CTO: 'Giám đốc Công nghệ',
  HRBP_MANAGER: 'Trưởng phòng Nhân sự',
  HR_SPECIALIST: 'Chuyên viên Nhân sự',
  PAYROLL_SPECIALIST: 'Chuyên viên Tiền lương',
  RECRUITER: 'Chuyên viên Tuyển dụng',
  OPS_MANAGER: 'Trưởng phòng Vận hành',
  DISPATCH_SUPERVISOR: 'Giám sát Điều phối',
  FLEET_SUPERVISOR: 'Giám sát Đội xe',
  WAREHOUSE_SUP: 'Tổ trưởng Kho',
  WAREHOUSE_STAFF: 'Nhân viên Kho',
  DRIVER_LEAD: 'Đội trưởng Lái xe',
  DRIVER: 'Lái xe',
  ACCOUNTANT: 'Kế toán viên',
  FINANCE_ANALYST: 'Chuyên viên Phân tích Tài chính',
  SALES_MANAGER: 'Trưởng phòng Kinh doanh',
  SALES_EXECUTIVE: 'Nhân viên Kinh doanh',
  LEGAL_SPECIALIST: 'Chuyên viên Pháp chế',
  SAFETY_OFFICER: 'Nhân viên An toàn lao động',
  IT_ADMIN: 'Quản trị Hệ thống',
  DATA_ANALYST: 'Chuyên viên Dữ liệu',
  CUSTOMER_SUCCESS: 'Chuyên viên Chăm sóc khách hàng',
};

const FAMILY_NAMES = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
];

const MIDDLE_NAMES = ['Văn', 'Thị', 'Đức', 'Minh', 'Hữu', 'Quốc', 'Ngọc', 'Thanh', 'Kim', 'Xuân'];

const GIVEN_NAMES = [
  'An',
  'Bình',
  'Chi',
  'Dũng',
  'Giang',
  'Hà',
  'Hùng',
  'Hương',
  'Khang',
  'Lan',
  'Long',
  'Mai',
  'Nam',
  'Nga',
  'Phong',
  'Quân',
  'Sơn',
  'Tâm',
  'Thảo',
  'Tuấn',
  'Uyên',
  'Việt',
  'Yến',
  'Đạt',
  'Linh',
];

const DIACRITICS =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g;

const DIACRITIC_MAP = {
  à: 'a',
  á: 'a',
  ạ: 'a',
  ả: 'a',
  ã: 'a',
  â: 'a',
  ầ: 'a',
  ấ: 'a',
  ậ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ă: 'a',
  ằ: 'a',
  ắ: 'a',
  ặ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  è: 'e',
  é: 'e',
  ẹ: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ê: 'e',
  ề: 'e',
  ế: 'e',
  ệ: 'e',
  ể: 'e',
  ễ: 'e',
  ì: 'i',
  í: 'i',
  ị: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ò: 'o',
  ó: 'o',
  ọ: 'o',
  ỏ: 'o',
  õ: 'o',
  ô: 'o',
  ồ: 'o',
  ố: 'o',
  ộ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ơ: 'o',
  ờ: 'o',
  ớ: 'o',
  ợ: 'o',
  ở: 'o',
  ỡ: 'o',
  ù: 'u',
  ú: 'u',
  ụ: 'u',
  ủ: 'u',
  ũ: 'u',
  ư: 'u',
  ừ: 'u',
  ứ: 'u',
  ự: 'u',
  ử: 'u',
  ữ: 'u',
  ỳ: 'y',
  ý: 'y',
  ỵ: 'y',
  ỷ: 'y',
  ỹ: 'y',
  đ: 'd',
};

export function removeDiacritics(text) {
  return String(text)
    .replace(DIACRITICS, (ch) => DIACRITIC_MAP[ch.toLowerCase()] ?? ch)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Deterministic Vietnamese full name for index 0..n-1 */
export function buildVietnameseFullName(i) {
  const family = FAMILY_NAMES[i % FAMILY_NAMES.length];
  const middle = MIDDLE_NAMES[Math.floor(i / FAMILY_NAMES.length) % MIDDLE_NAMES.length];
  const given = GIVEN_NAMES[Math.floor(i / (FAMILY_NAMES.length * MIDDLE_NAMES.length)) % GIVEN_NAMES.length];
  return `${family} ${middle} ${given}`;
}

export function buildWorkEmail(fullName, seq, padFn) {
  const slug = removeDiacritics(fullName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return `${slug}.${padFn(seq)}@xe.vn`;
}

export function companyCodePrefix(companySlug) {
  const map = {
    holding: 'HLD',
    trsport: 'VTH',
    logistics: 'LOG',
    finance: 'TCN',
    services: 'DVU',
  };
  return map[companySlug] ?? 'XVN';
}

export function pickContractType(i) {
  const types = HRM_CONTRACT_TYPES;
  const idx = i % types.length;
  return types[idx];
}

function parseHireDate(hiredAt) {
  if (!hiredAt) return new Date('2023-01-01T00:00:00Z');
  if (hiredAt instanceof Date) {
    return Number.isNaN(hiredAt.getTime()) ? new Date('2023-01-01T00:00:00Z') : hiredAt;
  }
  const s = String(hiredAt).trim().slice(0, 10);
  const hire = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : new Date(hiredAt);
  return Number.isNaN(hire.getTime()) ? new Date('2023-01-01T00:00:00Z') : hire;
}

export function contractDatesForType(contractTypeKey, hiredAt) {
  const hire = parseHireDate(hiredAt);
  const start = new Date(hire);
  if (contractTypeKey === 'HDTV_60') {
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 60);
    return { start: fmt(start), end: fmt(end) };
  }
  if (contractTypeKey === 'HDHV') {
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 6);
    return { start: fmt(start), end: fmt(end) };
  }
  if (contractTypeKey === 'HDLD_XDHN_12') {
    const end = new Date(start);
    end.setUTCFullYear(end.getUTCFullYear() + 1);
    end.setUTCDate(end.getUTCDate() - 1);
    return { start: fmt(start), end: fmt(end) };
  }
  if (contractTypeKey === 'HDLD_XDHN_36') {
    const end = new Date(start);
    end.setUTCFullYear(end.getUTCFullYear() + 3);
    end.setUTCDate(end.getUTCDate() - 1);
    return { start: fmt(start), end: fmt(end) };
  }
  const end = new Date('2030-12-31T00:00:00Z');
  return { start: fmt(start), end: fmt(end) };
}

function fmt(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '2023-01-01';
  return d.toISOString().slice(0, 10);
}

export function pickInsuranceProvider(i) {
  return HRM_INSURANCE_PROVIDERS[i % HRM_INSURANCE_PROVIDERS.length];
}

export function nationalIdForSeq(seq) {
  const base = String(790000000000 + seq).slice(0, 12);
  return base;
}

export function placeOfIssue() {
  return 'Cục Cảnh sát QLHC về TTXH';
}
