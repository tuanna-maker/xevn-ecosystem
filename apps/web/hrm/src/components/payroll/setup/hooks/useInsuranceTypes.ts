/**
 * @CODE-MEMORY
 * Custom Hook: useInsuranceTypes
 * Purpose:     Dependency Inversion (D) & Single Responsibility (S) for Insurance Types state
 * WorkItem:    D-PO-HRM-HOOK-INSURANCE-TYPES-01
 * solid_convention_ack: Encapsulate statutory insurance rates computation and state out of UI.
 */
import { useState, useMemo } from 'react';
import type { InsuranceTypeItem } from '../types/catalogTypes';

const SAMPLE_INSURANCE_TYPES: InsuranceTypeItem[] = [
  { id: 'ins1', code: 'INS_BHXH', name: 'Bảo hiểm xã hội', employerRate: 17.0, employeeRate: 8.0, status: 'active' },
  { id: 'ins2', code: 'INS_BHYT', name: 'Bảo hiểm y tế', employerRate: 3.0, employeeRate: 1.5, status: 'active' },
  { id: 'ins3', code: 'INS_BHTN', name: 'Bảo hiểm thất nghiệp', employerRate: 1.0, employeeRate: 1.0, status: 'active' },
  { id: 'ins4', code: 'INS_KPCD', name: 'Kinh phí công đoàn', employerRate: 2.0, employeeRate: 0.0, status: 'active' },
  { id: 'ins5', code: 'INS_BHTNLN', name: 'Bảo hiểm TNLĐ - BNN', employerRate: 0.5, employeeRate: 0.0, status: 'active' },
];

export function useInsuranceTypes() {
  const [items] = useState<InsuranceTypeItem[]>(SAMPLE_INSURANCE_TYPES);

  const totals = useMemo(() => {
    const totalEmployer = items.reduce((sum, item) => sum + item.employerRate, 0);
    const totalEmployee = items.reduce((sum, item) => sum + item.employeeRate, 0);
    return {
      totalEmployer,
      totalEmployee,
      grandTotal: totalEmployer + totalEmployee,
    };
  }, [items]);

  return {
    items,
    totals,
  };
}
