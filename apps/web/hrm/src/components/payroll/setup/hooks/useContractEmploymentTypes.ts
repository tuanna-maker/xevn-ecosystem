/**
 * @CODE-MEMORY
 * Custom Hook: useContractEmploymentTypes
 * Purpose:     Dependency Inversion (D) & Single Responsibility (S) for Contract & Employment Types state
 * WorkItem:    D-PO-HRM-HOOK-CTR-EMP-TYPES-01
 * solid_convention_ack: Encapsulate data fetching and tab selection state out of presentational UI.
 */
import { useState } from 'react';
import type { ContractTypeItem, EmploymentTypeItem } from '../types/catalogTypes';

const SAMPLE_CONTRACT_TYPES: ContractTypeItem[] = [
  { id: 'ct1', code: 'CTR_PROBATION', name: 'Hợp đồng Thử việc', durationRange: '02 tháng', status: 'active' },
  { id: 'ct2', code: 'CTR_FIXED_TERM', name: 'Hợp đồng Xác định thời hạn', durationRange: '12 - 36 tháng', status: 'active' },
  { id: 'ct3', code: 'CTR_INDEFINITE', name: 'Hợp đồng Không xác định thời hạn', durationRange: 'Vĩnh viễn', status: 'active' },
  { id: 'ct4', code: 'CTR_SEASONAL', name: 'Hợp đồng Mùa vụ / Theo vụ việc', durationRange: 'Dưới 12 tháng', status: 'active' },
  { id: 'ct5', code: 'CTR_COLLABORATOR', name: 'Hợp đồng Cộng tác viên', durationRange: 'Theo thỏa thuận', status: 'active' },
];

const SAMPLE_EMPLOYMENT_TYPES: EmploymentTypeItem[] = [
  { id: 'et1', code: 'EMP_OFFICIAL', name: 'Nhân viên chính thức', status: 'active' },
  { id: 'et2', code: 'EMP_PROBATION', name: 'Nhân viên thử việc', status: 'active' },
  { id: 'et3', code: 'EMP_SEASONAL', name: 'Lao động mùa vụ / Thử thách', status: 'active' },
];

export function useContractEmploymentTypes() {
  const [activeTab, setActiveTab] = useState<'CONTRACT' | 'EMPLOYMENT'>('CONTRACT');
  const [contractTypes] = useState<ContractTypeItem[]>(SAMPLE_CONTRACT_TYPES);
  const [employmentTypes] = useState<EmploymentTypeItem[]>(SAMPLE_EMPLOYMENT_TYPES);

  return {
    activeTab,
    setActiveTab,
    contractTypes,
    employmentTypes,
  };
}
