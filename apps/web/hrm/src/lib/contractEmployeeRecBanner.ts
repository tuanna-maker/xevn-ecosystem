/**
 * @CODE-MEMORY
 * Screen:     /contracts — ContractWorkspace Step1 employee picker
 * UC:         FR-UC-BP-CORE-09 · BR-CTR-CREATE-08
 * SRS:        docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md §4
 * TechSpec:   docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md §4.1
 * Purpose:    Non-blocking REC trace banner when NV has no candidate_id (legacy hire path).
 * WorkItem:   PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01
 * Coded:      2026-08-11
 * must_keep:  Banner only — không chặn Tiếp/Lưu; không gate POST create
 * SOLID:      SRP — pure predicate tách khỏi grid JSX
 * LastVerified: contractEmployeeRecBanner.test.ts
 */

export type ContractEmployeePickerRow = {
  id: string;
  candidate_id?: string | null;
};

export const CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID = 'ctr-create-employee-rec-hint' as const;

export const CTR_CREATE_EMPLOYEE_REC_BANNER_LINK_LABEL = 'Mở tuyển dụng' as const;

export function shouldShowEmployeeRecruitmentBanner(params: {
  isEdit: boolean;
  subjectType: 'employee' | 'candidate';
  employeeId: string | null | undefined;
  selectedEmployee: ContractEmployeePickerRow | null | undefined;
}): boolean {
  if (params.isEdit) return false;
  if (params.subjectType !== 'employee') return false;
  if (!params.employeeId?.trim()) return false;
  if (!params.selectedEmployee) return false;
  const candidateId = params.selectedEmployee.candidate_id;
  return candidateId == null || String(candidateId).trim() === '';
}
