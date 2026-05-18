/**
 * Preset danh mục trường hồ sơ nhân sự theo tenant — nhóm nghiệp vụ cho UI Command Center.
 */
import type { MockEmployeeMetadataDataType } from './mock-effective-config';
import { resolveHrmCatalogKey } from '../integrations/groupHrCatalogApi';

export type GroupHrFieldPreset = {
  id: string;
  fieldName: string;
  dataType: MockEmployeeMetadataDataType;
  selectConfig: string;
};

export type GroupHrFieldGroupPreset = {
  groupCode: string;
  groupLabel: string;
  fields: GroupHrFieldPreset[];
};

export const TOURISM_TENANT_ID = 'xe-du-lich';

/** CT Du lịch X.E Việt Nam — danh mục nhân sự tập đoàn (theo yêu cầu nghiệp vụ). */
export const XE_DU_LICH_HR_CATALOG_GROUPS: GroupHrFieldGroupPreset[] = [
  {
    groupCode: 'personal',
    groupLabel: 'Thông tin cá nhân',
    fields: [
      { id: 'emf-emp-name', fieldName: 'Tên nhân viên', dataType: 'text', selectConfig: '' },
      { id: 'emf-birth-year', fieldName: 'Năm sinh', dataType: 'number', selectConfig: '' },
      {
        id: 'emf-gender',
        fieldName: 'Giới tính',
        dataType: 'select',
        selectConfig: 'Nam, Nữ, Khác',
      },
      { id: 'emf-id-doc', fieldName: 'CCCD/CMND', dataType: 'text', selectConfig: '' },
      { id: 'emf-ethnicity', fieldName: 'Dân tộc', dataType: 'text', selectConfig: '' },
      { id: 'emf-religion', fieldName: 'Tôn giáo', dataType: 'text', selectConfig: '' },
      {
        id: 'emf-qualification',
        fieldName: 'Trình độ chuyên môn',
        dataType: 'text',
        selectConfig: '',
      },
    ],
  },
  {
    groupCode: 'contact',
    groupLabel: 'Liên hệ',
    fields: [
      { id: 'emf-phone', fieldName: 'Số điện thoại', dataType: 'phone', selectConfig: '' },
      { id: 'emf-zalo', fieldName: 'Zalo', dataType: 'text', selectConfig: '' },
      { id: 'emf-email', fieldName: 'Email', dataType: 'email', selectConfig: '' },
      { id: 'emf-emergency-name', fieldName: 'Người liên hệ', dataType: 'text', selectConfig: '' },
      {
        id: 'emf-emergency-phone',
        fieldName: 'SĐT Người liên hệ',
        dataType: 'phone',
        selectConfig: '',
      },
      {
        id: 'emf-emergency-relation',
        fieldName: 'Quan hệ với nhân viên',
        dataType: 'text',
        selectConfig: '',
      },
    ],
  },
  {
    groupCode: 'address',
    groupLabel: 'Địa chỉ',
    fields: [
      {
        id: 'emf-permanent-address',
        fieldName: 'Địa chỉ thường chú',
        dataType: 'text',
        selectConfig: '',
      },
      { id: 'emf-temp-address', fieldName: 'Tạm chú', dataType: 'text', selectConfig: '' },
    ],
  },
  {
    groupCode: 'work',
    groupLabel: 'Công việc & tổ chức',
    fields: [
      {
        id: 'emf-mgmt-unit',
        fieldName: 'Trực thuộc quản lý',
        dataType: 'text',
        selectConfig: '',
      },
      {
        id: 'emf-dept',
        fieldName: 'Bộ phận làm việc',
        dataType: 'text',
        selectConfig: '',
      },
      { id: 'emf-position', fieldName: 'Chức vụ', dataType: 'text', selectConfig: '' },
      { id: 'emf-branch', fieldName: 'Chi Nhánh', dataType: 'text', selectConfig: '' },
    ],
  },
  {
    groupCode: 'insurance',
    groupLabel: 'Bảo hiểm',
    fields: [
      { id: 'emf-bhxh', fieldName: 'Mã số BHXH', dataType: 'text', selectConfig: '' },
    ],
  },
];

function flattenGroups(groups: GroupHrFieldGroupPreset[]): GroupHrFieldPreset[] {
  return groups.flatMap((g) => g.fields);
}

const PRESETS_BY_TENANT: Record<string, GroupHrFieldGroupPreset[]> = {
  [TOURISM_TENANT_ID]: XE_DU_LICH_HR_CATALOG_GROUPS,
};

export function getGroupHrCatalogGroups(tenantId?: string | null): GroupHrFieldGroupPreset[] | null {
  if (!tenantId?.trim()) return null;
  return PRESETS_BY_TENANT[tenantId.trim()] ?? null;
}

export function getGroupHrCatalogFields(tenantId?: string | null): GroupHrFieldPreset[] | null {
  const groups = getGroupHrCatalogGroups(tenantId);
  if (!groups) return null;
  return flattenGroups(groups);
}

export type GroupHrCatalogBlockLayout = {
  id: string;
  blockCode: string;
  labelVi: string;
  visible: boolean;
  order: number;
};

export type GroupHrCatalogFieldLayout = {
  id: string;
  fieldCode: string;
  labelVi: string;
  dataType: MockEmployeeMetadataDataType;
  blockCode: string;
  visible: boolean;
  selectConfig: string;
  hrmCatalogKey?: string;
};

/** Khối + trường theo preset tenant (dùng cho popup cấu hình). */
export function buildGroupHrCatalogLayout(tenantId?: string | null): {
  blocks: GroupHrCatalogBlockLayout[];
  fieldDefs: GroupHrCatalogFieldLayout[];
} | null {
  const groups = getGroupHrCatalogGroups(tenantId);
  if (!groups?.length) return null;
  const blocks: GroupHrCatalogBlockLayout[] = groups.map((g, index) => ({
    id: `ghr-bl-preset-${g.groupCode}`,
    blockCode: g.groupCode,
    labelVi: g.groupLabel,
    visible: true,
    order: (index + 1) * 10,
  }));
  const fieldDefs: GroupHrCatalogFieldLayout[] = groups.flatMap((g) =>
    g.fields.map((f) => ({
      id: `ghr-${f.id}`,
      fieldCode: f.id,
      labelVi: f.fieldName,
      dataType: f.dataType,
      blockCode: g.groupCode,
      visible: true,
      selectConfig: f.selectConfig,
      hrmCatalogKey: resolveHrmCatalogKey(g.groupCode, f.id),
    })),
  );
  return { blocks, fieldDefs };
}
