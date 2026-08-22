/**
 * @CODE-MEMORY
 * Purpose:    Mock Store / LocalStorage wrapper for Dynamic Policy Types.
 *             Provides basic CRUD operations for Policy Types until BE API is ready.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-22
 */

import { useState, useEffect } from 'react';
import { genClientId } from './payPolicyPackForm';

export type DynamicFieldMapping = {
  tableName: string; // VD: hr_employees
  fieldName: string; // VD: base_salary
  label: string; // VD: Mức lương cơ bản
};

export type PolicyTypeColumnDef = {
  id: string; // nanoid
  name: string; // Tên hiển thị của cột
  mappedField?: string; // ID của trường (VD: base_salary)
  isGradePicker?: boolean; // Flag để biết cột này có dùng để chọn Ngạch không
};

export type PolicyTypeConfig = {
  id: string; // nanoid
  code: string; // Mã loại chính sách (VD: THANG_LUONG)
  name: string; // Tên loại chính sách
  defaultColumns: PolicyTypeColumnDef[];
};

// Seed data
const SEED_POLICY_TYPES: PolicyTypeConfig[] = [
  {
    id: 'pt_salary_scale',
    code: 'salary_scale',
    name: 'Thang lương / Bảng lương',
    defaultColumns: [
      { id: genClientId(), name: 'Mã ngạch', isGradePicker: true, mappedField: 'grade_code' },
      { id: genClientId(), name: 'Chức danh công việc', mappedField: 'position_hint' },
      { id: genClientId(), name: 'Bậc I', mappedField: 'step_1' },
    ],
  },
  {
    id: 'pt_allowance',
    code: 'allowance',
    name: 'Phụ cấp',
    defaultColumns: [
      { id: genClientId(), name: 'Đối tượng áp dụng', mappedField: 'target_group' },
      { id: genClientId(), name: 'Phân mức (%)', mappedField: 'allowance_tier' },
      { id: genClientId(), name: 'Xăng xe', mappedField: 'allowance_gas' },
      { id: genClientId(), name: 'Điện thoại', mappedField: 'allowance_phone' },
    ],
  },
  {
    id: 'pt_kpi',
    code: 'kpi_bonus',
    name: 'Thưởng KPI',
    defaultColumns: [
      { id: genClientId(), name: 'Đối tượng áp dụng', mappedField: 'target_group' },
      { id: genClientId(), name: 'Tỷ lệ tối đa (%)', mappedField: 'max_pct' },
    ],
  },
];

const STORAGE_KEY = 'hrm_mock_policy_types';

function getStoredTypes(): PolicyTypeConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse policy types', e);
  }
  return SEED_POLICY_TYPES;
}

function setStoredTypes(types: PolicyTypeConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
  // Dispatch event so other hooks can update
  window.dispatchEvent(new Event('policy_types_changed'));
}

export function usePolicyTypes() {
  const [types, setTypes] = useState<PolicyTypeConfig[]>(getStoredTypes());

  useEffect(() => {
    const handleStorageChange = () => setTypes(getStoredTypes());
    window.addEventListener('policy_types_changed', handleStorageChange);
    return () => window.removeEventListener('policy_types_changed', handleStorageChange);
  }, []);

  const addType = (type: Omit<PolicyTypeConfig, 'id'>) => {
    const newType = { ...type, id: genClientId() };
    setStoredTypes([...types, newType]);
  };

  const updateType = (id: string, updates: Partial<PolicyTypeConfig>) => {
    setStoredTypes(types.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteType = (id: string) => {
    setStoredTypes(types.filter((t) => t.id !== id));
  };

  return { types, addType, updateType, deleteType };
}

// System Tables Mock Dictionary for Mappable Fields
export const MAPPABLE_SYSTEM_TABLES = [
  {
    id: 'hr_employees',
    name: 'Hồ sơ nhân sự (Nhân viên)',
    fields: [
      { id: 'base_salary', name: 'Lương cơ bản' },
      { id: 'allowance_gas', name: 'Phụ cấp xăng xe' },
      { id: 'allowance_phone', name: 'Phụ cấp điện thoại' },
      { id: 'target_group', name: 'Nhóm đối tượng' },
    ],
  },
  {
    id: 'hr_contracts',
    name: 'Hợp đồng lao động',
    fields: [
      { id: 'contract_salary', name: 'Lương thỏa thuận' },
      { id: 'allowance_tier', name: 'Phân mức phụ cấp (%)' },
    ],
  },
  {
    id: 'sys_grades',
    name: 'Hệ thống Ngạch bậc lương',
    fields: [
      { id: 'grade_code', name: 'Mã ngạch (Hệ thống)' },
      { id: 'position_hint', name: 'Chức danh (Hệ thống)' },
      { id: 'step_1', name: 'Hệ số bậc 1' },
    ],
  },
  {
    id: 'kpi_records',
    name: 'Kết quả đánh giá KPI',
    fields: [
      { id: 'max_pct', name: 'Tỷ lệ hưởng tối đa (%)' },
      { id: 'actual_score', name: 'Điểm đánh giá thực tế' },
    ],
  },
];
