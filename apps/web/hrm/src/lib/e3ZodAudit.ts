/**
 * @CODE-MEMORY
 * Screen:     HRM mutate-form Zod coverage audit (E3)
 * UC:         FR-HRM-CONSTRAINT-E3-01 · AC-E3-ZOD-AUDIT-01
 * BR:         BR-HRM-ZOD-E3-01 — ≥90% mutate surfaces có Zod required tối thiểu
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md §3.4
 * Purpose:    Registry audit thuần — đếm surface có Zod schema / RHF resolver (honest paths).
 * WorkItem:   D-FE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    vitest e3ZodAudit.test.ts · evidence
 * must_keep:  E2 payroll island PASS; không claim browser PASS; không đếm Login/auth vào ERP bar
 * SOLID:      Pure data + score helper
 * LastVerified: docs/qa/evidence/d-fe-erp-e3-01-20260728.md
 */

export type E3ZodAuditSurface = {
  id: string;
  domain: 'performance' | 'insurance' | 'payroll' | 'contracts' | 'leave' | 'recruitment' | 'employee';
  /** Path under apps/web/hrm/src */
  schemaOrFormPath: string;
  hasZodRequired: boolean;
  notes?: string;
};

/**
 * ERP mutate audit set (AC-E3-ZOD-AUDIT-01) — E3 in-scope + adjacent locked islands.
 * `hasZodRequired` must match live wire (schema factory or zodResolver on user path).
 */
export const E3_ZOD_AUDIT_SURFACES: readonly E3ZodAuditSurface[] = [
  {
    id: 'perf-cycle',
    domain: 'performance',
    schemaOrFormPath: 'lib/performanceFormSchema.ts#createPerformanceCycleFormSchema',
    hasZodRequired: true,
  },
  {
    id: 'perf-eval',
    domain: 'performance',
    schemaOrFormPath: 'lib/performanceFormSchema.ts#createPerformanceEvalFormSchema',
    hasZodRequired: true,
  },
  {
    id: 'ins-policy',
    domain: 'insurance',
    schemaOrFormPath: 'lib/insurancePolicyFormSchema.ts#createInsurancePolicyFormSchema',
    hasZodRequired: true,
  },
  {
    id: 'ins-participant',
    domain: 'insurance',
    schemaOrFormPath: 'components/insurance/AddInsuranceDialog.tsx',
    hasZodRequired: true,
  },
  {
    id: 'payroll-salary-component',
    domain: 'payroll',
    schemaOrFormPath: 'components/payroll/salaryComponentFormSchema.ts',
    hasZodRequired: true,
    notes: 'E2 locked',
  },
  {
    id: 'payroll-period',
    domain: 'payroll',
    schemaOrFormPath: 'components/payroll/payrollPeriodFormSchema.ts',
    hasZodRequired: true,
    notes: 'E2 locked',
  },
  {
    id: 'employee-form',
    domain: 'employee',
    schemaOrFormPath: 'components/employee/EmployeeFormDialog.tsx',
    hasZodRequired: true,
  },
  {
    id: 'job-postings',
    domain: 'recruitment',
    schemaOrFormPath: 'components/recruitment/JobPostingsTab.tsx',
    hasZodRequired: true,
  },
  {
    id: 'headcount-proposal',
    domain: 'recruitment',
    schemaOrFormPath: 'components/recruitment/HeadcountProposalTab.tsx',
    hasZodRequired: true,
  },
  {
    id: 'candidate-form',
    domain: 'recruitment',
    schemaOrFormPath: 'components/recruitment/CandidateFormDialog.tsx',
    hasZodRequired: true,
  },
  {
    id: 'leave-create',
    domain: 'leave',
    schemaOrFormPath: 'components/leave (LeaveTab manual validate — residual)',
    hasZodRequired: false,
    notes: 'Follow-on Zod Leave; SM FE/BE still AC-E3-SM',
  },
] as const;

export function scoreE3ZodAudit(surfaces: readonly E3ZodAuditSurface[] = E3_ZOD_AUDIT_SURFACES): {
  total: number;
  withZod: number;
  ratio: number;
  percent: number;
  meets90: boolean;
} {
  const total = surfaces.length;
  const withZod = surfaces.filter((s) => s.hasZodRequired).length;
  const ratio = total === 0 ? 0 : withZod / total;
  return {
    total,
    withZod,
    ratio,
    percent: Math.round(ratio * 1000) / 10,
    meets90: ratio >= 0.9,
  };
}
