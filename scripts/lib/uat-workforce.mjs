import { createHash } from 'node:crypto';
import { stableUuid } from './stable-uuid.mjs';
import {
  ROLE_LABELS_VI,
  buildVietnameseFullName,
  buildWorkEmail,
  companyCodePrefix,
  nationalIdForSeq,
  placeOfIssue,
} from './vietnamese-workforce-data.mjs';

/** XeVN group workforce — realistic Vietnamese HR data (25 roles × 5 companies). */
export const UAT_SEED_TAG = 'realistic-v2';
export const UAT_EMPLOYEE_COUNT = 1000;

export const UAT_COMPANIES = ['holding', 'trsport', 'logistics', 'finance', 'services'];

export const UAT_ROLES = [
  'CEO',
  'COO',
  'CFO',
  'CHRO',
  'CTO',
  'HRBP_MANAGER',
  'HR_SPECIALIST',
  'PAYROLL_SPECIALIST',
  'RECRUITER',
  'OPS_MANAGER',
  'DISPATCH_SUPERVISOR',
  'FLEET_SUPERVISOR',
  'WAREHOUSE_SUP',
  'WAREHOUSE_STAFF',
  'DRIVER_LEAD',
  'DRIVER',
  'ACCOUNTANT',
  'FINANCE_ANALYST',
  'SALES_MANAGER',
  'SALES_EXECUTIVE',
  'LEGAL_SPECIALIST',
  'SAFETY_OFFICER',
  'IT_ADMIN',
  'DATA_ANALYST',
  'CUSTOMER_SUCCESS',
];

export const UAT_DEPARTMENTS = [
  'Ban Điều hành',
  'Nhân sự',
  'Tài chính',
  'Vận hành',
  'Kho vận',
  'Kinh doanh',
  'CNTT',
  'Pháp chế',
  'An toàn',
  'Chăm sóc khách hàng',
];

export function pad(n, width = 4) {
  return String(n).padStart(width, '0');
}

export function passwordHash(email, password) {
  return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
}

export function resolveMasterTenant() {
  return (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
}

export function attendanceCompanyUuid(tenantId, companySlug) {
  return stableUuid(`hrm-scope:${tenantId}:${companySlug}`);
}

export function employeeIdForSeq(seq) {
  return stableUuid(`uat-workforce:${UAT_SEED_TAG}:${seq}`);
}

/**
 * @param {number} i zero-based index 0..999
 * @param {string} password plaintext UAT password (hashed into custom_fields)
 */
export function buildUatEmployee(i, password) {
  const seq = i + 1;
  const companyId = UAT_COMPANIES[i % UAT_COMPANIES.length];
  const role = UAT_ROLES[i % UAT_ROLES.length];
  const dept = UAT_DEPARTMENTS[i % UAT_DEPARTMENTS.length];
  const tenantId = resolveMasterTenant();
  const fullName = buildVietnameseFullName(i);
  const email = buildWorkEmail(fullName, seq, pad);
  const prefix = companyCodePrefix(companyId);
  const hiredAt = new Date(Date.UTC(2022 + (i % 4), (i * 3) % 12, ((i * 7) % 27) + 1))
    .toISOString()
    .slice(0, 10);
  const status = i > 24 && (i + 1) % 17 === 0 ? 'inactive' : 'active';
  const pwHash = passwordHash(email, password);
  const birthYear = 1985 + (i % 20);
  const birthMonth = (i % 12) + 1;
  const birthDay = (i % 28) + 1;
  const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

  return {
    id: employeeIdForSeq(seq),
    company_id: companyId,
    employee_code: `${prefix}-${pad(seq)}`,
    email,
    full_name: fullName,
    job_title_key: role,
    status,
    hired_at: hiredAt,
    custom_fields: {
      uat_seed: UAT_SEED_TAG,
      tenant_id: tenantId,
      attendance_company_uuid: attendanceCompanyUuid(tenantId, companyId),
      mobile_password_hash: pwHash,
      is_primary_membership: i % 25 === 0 ? 'true' : 'false',
      department: dept,
      job_title_label: ROLE_LABELS_VI[role] ?? role,
      cost_center: `CC-${prefix}-${String((i % 50) + 1).padStart(2, '0')}`,
      grade: `B${(i % 5) + 1}`,
      shift_group: i % 2 === 0 ? 'Ca hành chính' : 'Ca xoay',
      phone: `09${String(30000000 + seq).slice(-8)}`,
      national_id: nationalIdForSeq(seq),
      id_issue_date: hiredAt,
      id_issue_place: placeOfIssue(),
      date_of_birth: dateOfBirth,
      gender: i % 3 === 0 ? 'Nữ' : 'Nam',
      permanent_address: `${(i % 200) + 1} Đường ${dept}, Quận ${(i % 12) + 1}, TP. Hồ Chí Minh`,
      tax_code: `8${String(1000000000 + seq).slice(-9)}`,
      bank_account: `9704${String(100000000000 + seq).slice(-12)}`,
      bank_name: i % 2 === 0 ? 'Vietcombank' : 'Techcombank',
      catalog_source: 'xbos',
      catalog_sync_at: new Date().toISOString(),
    },
  };
}

/** First active employee index for each role (0..24). */
export function roleSampleIndices() {
  return UAT_ROLES.map((_, roleIdx) => roleIdx);
}

export function isActiveUatIndex(i) {
  return !(i > 24 && (i + 1) % 17 === 0);
}

/** Spread batch samples across active workforce only (default 50). */
export function batchSampleIndices(count = 50) {
  const indices = [];
  const step = Math.max(1, Math.floor(UAT_EMPLOYEE_COUNT / count));
  for (let i = 0; i < UAT_EMPLOYEE_COUNT && indices.length < count; i += step) {
    if (isActiveUatIndex(i)) indices.push(i);
  }
  for (let i = 0; indices.length < count && i < UAT_EMPLOYEE_COUNT; i += 1) {
    if (isActiveUatIndex(i) && !indices.includes(i)) indices.push(i);
  }
  return indices;
}

export function expectedMobileRoles(jobTitleKey) {
  const key = (jobTitleKey ?? '').toUpperCase();
  const roles = ['employee'];
  if (key.includes('MANAGER') || key.includes('CHRO') || key === 'CEO' || key.includes('OPS_MANAGER')) {
    roles.push('manager');
  }
  if (key.includes('CHRO') || key === 'CEO') {
    roles.push('hr_manager');
  }
  return [...new Set(roles)];
}
