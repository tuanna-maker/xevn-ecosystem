/**
 * @CODE-MEMORY
 * Module:     HRM Payroll Setup Catalogs — Type Definitions
 * Purpose:    Interface Segregation Principle (I in SOLID)
 * WorkItem:   D-PO-HRM-CATALOG-TYPES-SOLID-01
 * Coded:      2026-08-13
 * solid_convention_ack: Separate type contracts per domain, no monolithic types file.
 */

export type CatalogOrigin = 'holding' | 'company' | 'branch' | 'extension';
export type CatalogStatus = 'active' | 'archived';

export interface DecisionTypeItem {
  id: string;
  code: string;
  name: string;
  origin: CatalogOrigin;
  status: CatalogStatus;
}

export interface ContractTypeItem {
  id: string;
  code: string;
  name: string;
  durationRange: string;
  status: CatalogStatus;
}

export interface EmploymentTypeItem {
  id: string;
  code: string;
  name: string;
  status: CatalogStatus;
}

export interface InsuranceTypeItem {
  id: string;
  code: string;
  name: string;
  employerRate: number;
  employeeRate: number;
  status: CatalogStatus;
}

export interface OvertimeTypeItem {
  id: string;
  code: string;
  name: string;
  multiplier: number;
  excludedGroup: string;
  status: CatalogStatus;
}

export interface JobGradeStepItem {
  stepNumber: number;
  coefficient: number;
  baseSalary: number;
}

export interface JobGradeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  steps: JobGradeStepItem[];
  status: CatalogStatus;
}

export interface AttendanceShiftItem {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  isNightShift: boolean;
  breakDurationMinutes: number;
  status: CatalogStatus;
}

export interface ContractClauseItem {
  id: string;
  code: string;
  title: string;
  category: 'GENERAL' | 'DRIVER';
  contentSnippet: string;
  status: CatalogStatus;
}

export interface PayrollComponentItem {
  id: string;
  code: string;
  name: string;
  group: 'FIXED_INCOME' | 'VOLUME_INCOME' | 'ALLOWANCE' | 'BONUS' | 'DEDUCTION';
  sign: '+' | '-';
  scope: 'GLOBAL' | 'COMPANY' | 'BRANCH';
  status: CatalogStatus;
}
