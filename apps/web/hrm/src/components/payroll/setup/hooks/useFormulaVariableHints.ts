/**
 * @CODE-MEMORY
 * Custom Hook: useFormulaVariableHints
 * Screen:     HRM Payroll Setup - Formula Input Pack (FR-W10-04)
 * Purpose:    SRP - expose 3-group variable hint data + search filter out of UI layer.
 *             Core (7 biến lowercase ATT+C&B) / Phụ cấp (pattern) / Input Pack (13 source_kinds).
 * WorkItem:   BA-HRM-PAYROLL-FORMULA-INPUT-PACK-FE-01
 * Coded:      2026-08-15
 * Callers:    FormulaInputPackSetupScreen
 * solid_convention_ack: DIP - hook owns data/state; component only renders.
 * fe_boundary: không query DB trực tiếp, không import từ BE source
 * must_keep:  lowercase var codes (payable_hours, base_salary...không UPPERCASE)
 *             sample data đúng structure cho đến khi BE endpoint sẵn sàng
 */
import { useState, useMemo } from 'react';

export interface CoreVariableItem {
  id: string;
  variableKey: string;
  label: string;
  dataSource: string;
}

export interface InputPackSourceKindItem {
  id: string;
  sourceKind: string;
  label: string;
  description: string;
}

// Core 7 biến (ATT + C&B) - lowercase per BE contract
const CORE_VARIABLES: CoreVariableItem[] = [
  { id: 'cv1', variableKey: 'payable_hours',      label: 'Giờ công được trả lương',          dataSource: 'attendance_records' },
  { id: 'cv2', variableKey: 'standard_hours',     label: 'Giờ công chuẩn kỳ',               dataSource: 'shift_calendar' },
  { id: 'cv3', variableKey: 'ot_hours_weighted',  label: 'Giờ OT đã quy đổi hệ số',        dataSource: 'overtime_requests' },
  { id: 'cv4', variableKey: 'paid_leave_hours',   label: 'Giờ nghỉ phép có lương',          dataSource: 'leave_requests' },
  { id: 'cv5', variableKey: 'unpaid_leave_hours', label: 'Giờ nghỉ không lương',            dataSource: 'leave_requests' },
  { id: 'cv6', variableKey: 'base_salary',        label: 'Lương cơ bản (HĐ)',               dataSource: 'salary_profiles' },
  { id: 'cv7', variableKey: 'dependents_count',   label: 'Số người phụ thuộc (giảm trừ GC)', dataSource: 'employee_profiles' },
];

// Input Pack - 13 source_kinds từ pay_period_input_lines (lowercase)
const INPUT_PACK_SOURCE_KINDS: InputPackSourceKindItem[] = [
  { id: 'ip01', sourceKind: 'manual',       label: 'Nhập tay (tự do)',              description: 'HR nhập thủ công không ràng buộc' },
  { id: 'ip02', sourceKind: 'kpi',          label: 'Điểm KPI / Đơn giá cuộc HĐ',  description: 'Kết quả KPI hoặc đơn giá hợp đồng khoán' },
  { id: 'ip03', sourceKind: 'dll_cpn',      label: 'DLL CPN (Doanh lượng CPN)',    description: 'Doanh lượng CPN nhập từ hệ thống kinh doanh' },
  { id: 'ip04', sourceKind: 'cpsc',         label: 'Chi phí sửa chữa chung',       description: 'Chi phí CPSC phân bổ kỳ lương' },
  { id: 'ip05', sourceKind: 'cldv',         label: 'Điểm chất lượng dịch vụ',      description: 'Điểm CLDV đánh giá cuối kỳ' },
  { id: 'ip06', sourceKind: 'route_count',  label: 'Số lượt vận chuyển',           description: 'Số lượt chạy tuyến trong kỳ lương' },
  { id: 'ip07', sourceKind: 'revenue',      label: 'Doanh thu',                    description: 'Doanh thu thực tế phân bổ cho NV' },
  { id: 'ip08', sourceKind: 'advance',      label: 'Tạm ứng lương',               description: 'Số tiền tạm ứng trong kỳ (trừ vào net pay)' },
  { id: 'ip09', sourceKind: 'xdtn',         label: 'Phụ cấp XDTN / Đi đường',    description: 'Phụ cấp xây dựng tuyến ngoài hoặc đường bộ' },
  { id: 'ip10', sourceKind: 'vp_cost',      label: 'Chi phí văn phòng (C)',        description: 'Chi phí VP cố định phân bổ theo kỳ' },
  { id: 'ip11', sourceKind: 'vp_allowance', label: 'Trợ lương văn phòng (B)',     description: 'Khoản trợ lương B theo vị trí VP' },
  { id: 'ip12', sourceKind: 'other_income', label: 'Thu nhập khác',               description: 'Các khoản thu nhập phát sinh không phân loại' },
  { id: 'ip13', sourceKind: 'rd_transfer',  label: 'Truy thu / Truy lĩnh',        description: 'Điều chỉnh chênh lệch kỳ trước (âm = truy thu)' },
];

export function useFormulaVariableHints() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCoreVars = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return CORE_VARIABLES;
    return CORE_VARIABLES.filter(
      (v) =>
        v.variableKey.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        v.dataSource.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const filteredInputPack = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return INPUT_PACK_SOURCE_KINDS;
    return INPUT_PACK_SOURCE_KINDS.filter(
      (v) =>
        v.sourceKind.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const showAllowanceSection = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return 'phụ cấp'.includes(q) || 'allowance'.includes(q) || 'phu cap'.includes(q);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredCoreVars,
    filteredInputPack,
    showAllowanceSection,
    totalCoreVars: CORE_VARIABLES.length,
    totalInputPackKinds: INPUT_PACK_SOURCE_KINDS.length,
  };
}
