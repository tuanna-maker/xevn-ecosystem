import type { ConfigCategory, ConfigOrigin, ConfigVariant } from './config.types';

const tenantId = 'tenant-xevn-holding';
const moduleCode = 'hrm';
const originCode = 'employee_profile';

export const CONFIG_ORIGINS: ConfigOrigin[] = [{
  tenantId,
  moduleCode,
  originCode,
  ownerLayer: 'xbos',
  inheritanceMode: 'root',
  originVersion: 1,
  status: 'published',
  blocks: [
    { blockCode: 'personal_info', labelVi: 'Thông tin cá nhân', order: 10, hidden: false },
    { blockCode: 'employment_info', labelVi: 'Thông tin công việc', order: 20, hidden: false },
    { blockCode: 'compliance_info', labelVi: 'Tuân thủ & hồ sơ pháp lý', order: 30, hidden: false },
  ],
  fields: [
    {
      fieldCode: 'full_name',
      blockCode: 'personal_info',
      labelVi: 'Họ và tên',
      dataType: 'text',
      required: true,
      readonly: false,
      hidden: false,
      order: 10,
      validationRules: { min: 2 },
    },
    {
      fieldCode: 'birth_date',
      blockCode: 'personal_info',
      labelVi: 'Ngày sinh',
      dataType: 'date',
      required: false,
      readonly: false,
      hidden: false,
      order: 20,
      validationRules: {},
    },
    {
      fieldCode: 'employee_identity_number',
      blockCode: 'compliance_info',
      labelVi: 'Số CCCD',
      dataType: 'text',
      required: true,
      readonly: false,
      hidden: false,
      order: 10,
      validationRules: { pattern: '^[0-9]{12}$' },
    },
    {
      fieldCode: 'driver_license_class',
      blockCode: 'compliance_info',
      labelVi: 'Hạng giấy phép lái xe',
      dataType: 'select',
      required: false,
      readonly: false,
      hidden: false,
      order: 20,
      optionsSource: { categoryCode: 'DRIVER_LICENSE_CLASS', scope: 'global' },
      validationRules: {},
    },
    {
      fieldCode: 'employment_group',
      blockCode: 'employment_info',
      labelVi: 'Nhóm nhân sự',
      dataType: 'select',
      required: true,
      readonly: false,
      hidden: false,
      order: 10,
      optionsSource: { categoryCode: 'EMPLOYMENT_GROUP', scope: 'legal_entity' },
      validationRules: {},
    },
  ],
}];

export const CONFIG_VARIANTS: ConfigVariant[] = [
  {
    id: 'variant-employee-profile-comp-002-v1',
    tenantId,
    moduleCode,
    originCode,
    legalEntityId: 'comp-002',
    ownerLayer: 'module',
    inheritsFromOrigin: true,
    variantVersion: 1,
    status: 'published',
    diffJson: {
      blocks: [
        { blockCode: 'compliance_info', labelVi: 'Tuân thủ tài xế & hồ sơ tuyến' },
      ],
      fields: [
        {
          fieldCode: 'driver_license_class',
          required: true,
          labelVi: 'Hạng GPLX bắt buộc',
        },
        {
          fieldCode: 'employment_group',
          labelVi: 'Nhóm nhân sự vận hành',
        },
      ],
    },
  },
  {
    id: 'variant-employee-profile-comp-003-v1',
    tenantId,
    moduleCode,
    originCode,
    legalEntityId: 'comp-003',
    ownerLayer: 'module',
    inheritsFromOrigin: true,
    variantVersion: 1,
    status: 'published',
    diffJson: {
      blocks: [
        { blockCode: 'personal_info', labelVi: 'Hồ sơ nhân sự chi nhánh' },
      ],
      fields: [
        {
          fieldCode: 'driver_license_class',
          hidden: true,
          required: false,
        },
      ],
    },
  },
];

export const CONFIG_CATEGORY_ITEMS: ConfigCategory[] = [
  {
    categoryCode: 'DRIVER_LICENSE_CLASS',
    scope: 'global',
    items: [
      { itemCode: 'B2', labelVi: 'B2 - Xe tải nhẹ' },
      { itemCode: 'C', labelVi: 'C - Xe tải' },
      { itemCode: 'FC', labelVi: 'FC - Container' },
    ],
  },
  {
    categoryCode: 'EMPLOYMENT_GROUP',
    scope: 'legal_entity',
    legalEntityId: 'comp-002',
    items: [
      { itemCode: 'driver', labelVi: 'Tài xế' },
      { itemCode: 'warehouse_operator', labelVi: 'Nhân sự kho bãi' },
    ],
  },
  {
    categoryCode: 'EMPLOYMENT_GROUP',
    scope: 'global',
    items: [
      { itemCode: 'office_staff', labelVi: 'Khối văn phòng' },
      { itemCode: 'driver', labelVi: 'Tài xế' },
    ],
  },
];
