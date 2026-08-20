import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';

/** Cấu hình danh mục trường nhân sự — chuẩn import Excel XeVN (áp dụng toàn tập đoàn). */
export type GroupEmployeeCatalogDef = {
  catalogKey: string;
  name: string;
  domain: string;
  items: CatalogExtensionItemDto[];
};

export const GROUP_HRM_TENANT_SCOPES: Array<{
  tenantId: string;
  companyId: string;
}> = [
  { tenantId: 'xevn', companyId: 'holding' },
  { tenantId: 'xe-tmdv', companyId: 'main' },
  { tenantId: 'visun', companyId: 'main' },
  { tenantId: 'xe-du-lich', companyId: 'main' },
  { tenantId: 'xe-vietnam', companyId: 'main' },
];

export const GROUP_EMPLOYEE_IMPORT_CATALOGS: GroupEmployeeCatalogDef[] = [
  {
    catalogKey: 'hrm_employee_basic_fields',
    name: 'Định danh & tổ chức',
    domain: 'hrm_employee',
    items: [
      { code: 'employee_id', label: 'ID', unit: 'text', status: 'active' },
      {
        code: 'full_name',
        label: 'Tên nhân viên',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'management_unit',
        label: 'Trực thuộc quản lý',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'department',
        label: 'Bộ phận làm việc',
        unit: 'text',
        status: 'active',
      },
      { code: 'position', label: 'Chức vụ', unit: 'text', status: 'active' },
      { code: 'branch', label: 'Chi nhánh', unit: 'text', status: 'active' },
      {
        code: 'employment_status',
        label: 'Trạng thái lao động',
        unit: 'select:active|probation|inactive',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_employee_personal_fields',
    name: 'Nhân thân',
    domain: 'hrm_employee',
    items: [
      {
        code: 'birth_year',
        label: 'Năm sinh',
        unit: 'number',
        status: 'active',
      },
      {
        code: 'gender',
        label: 'Giới tính',
        unit: 'select:Nam|Nữ|Khác',
        status: 'active',
      },
      {
        code: 'national_id',
        label: 'CCCD/CMND',
        unit: 'text',
        status: 'active',
      },
      { code: 'ethnicity', label: 'Dân tộc', unit: 'text', status: 'active' },
      { code: 'religion', label: 'Tôn giáo', unit: 'text', status: 'active' },
      {
        code: 'professional_qualification',
        label: 'Trình độ chuyên môn',
        unit: 'text',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_employee_contact_fields',
    name: 'Liên lạc',
    domain: 'hrm_employee',
    items: [
      {
        code: 'phone_number',
        label: 'Số điện thoại',
        unit: 'phone',
        status: 'active',
      },
      { code: 'zalo', label: 'Zalo', unit: 'text', status: 'active' },
      { code: 'email', label: 'Email', unit: 'email', status: 'active' },
    ],
  },
  {
    catalogKey: 'hrm_employee_emergency_fields',
    name: 'Liên hệ khẩn cấp',
    domain: 'hrm_employee',
    items: [
      {
        code: 'emergency_contact_name',
        label: 'Người liên hệ',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'emergency_contact_phone',
        label: 'SĐT người liên hệ',
        unit: 'phone',
        status: 'active',
      },
      {
        code: 'emergency_contact_relation',
        label: 'Quan hệ với nhân viên',
        unit: 'text',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_employee_address_fields',
    name: 'Địa chỉ',
    domain: 'hrm_employee',
    items: [
      {
        code: 'permanent_address',
        label: 'Địa chỉ thường chú',
        unit: 'text',
        status: 'active',
      },
      {
        code: 'temporary_address',
        label: 'Tạm chú',
        unit: 'text',
        status: 'active',
      },
    ],
  },
  {
    catalogKey: 'hrm_employee_insurance_fields',
    name: 'Bảo hiểm',
    domain: 'hrm_employee',
    items: [
      {
        code: 'social_insurance_code',
        label: 'Mã số BHXH',
        unit: 'text',
        status: 'active',
      },
    ],
  },
];
