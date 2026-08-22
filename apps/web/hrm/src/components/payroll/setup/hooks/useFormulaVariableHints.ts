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
import {
  PAY_DATA_FIELD_CATALOG,
  type PayDataFieldGroupId,
} from '@/lib/payDataFieldCatalog';

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

const CORE_GROUP_IDS: PayDataFieldGroupId[] = ['attendance', 'compensation'];

const CORE_VARIABLES: CoreVariableItem[] = PAY_DATA_FIELD_CATALOG.filter((f) =>
  CORE_GROUP_IDS.includes(f.group),
).map((f) => ({
  id: f.id,
  variableKey: f.key,
  label: f.label,
  dataSource: f.sourceHint,
}));

const INPUT_PACK_SOURCE_KINDS: InputPackSourceKindItem[] = PAY_DATA_FIELD_CATALOG.filter(
  (f) => f.group === 'input_pack',
).map((f) => ({
  id: f.id,
  sourceKind: f.key,
  label: f.label,
  description: f.sourceHint,
}));

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
