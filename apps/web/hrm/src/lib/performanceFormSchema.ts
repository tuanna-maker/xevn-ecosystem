/**
 * @CODE-MEMORY
 * Screen:     /performance — chu kỳ & đánh giá (Zod)
 * UC:         FR-HRM-PERF-SM-E3-01 · AC-E3-ZOD-P-01 · AC-PERF-01..05
 * BR:         BR-HRM-ZOD-E3-01 · BR-HRM-PERF-E3-01/02/03
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md §3.4
 * TechSpec:   docs/hrm/API_DESIGN_HRM_ERP_E3.md §1–4
 * Purpose:    Schema Zod thuần cycle/eval — required name/dates/employee/cycle; KPI/grade/dept code khi catalog >0.
 * WorkItem:   D-FE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    Performance.tsx · vitest
 * Callees:    zod
 * must_keep:  Pure factory — không import useTranslation; message inject
 * SOLID:      Pure schema factory
 * LastVerified: docs/qa/evidence/d-fe-erp-e3-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: BUILD-GAP-PERF-FORM-SCHEMA-01
 * change_mode: FIX
 * What: Khôi phục module từ git 43c479a — file thiếu trên disk gây Vite build fail
 * Why: Performance.tsx import @/lib/performanceFormSchema — residual BUILD-GAP-MD-PANEL-01
 * must_keep: Pure factory; không đổi rule Zod/E3; MD panel · Contracts/Payroll · Leave untouched
 */

import { z } from 'zod';

export type PerformanceCycleFormMessages = {
  nameRequired: string;
  startRequired: string;
  endRequired: string;
  dateOrder: string;
};

export type PerformanceEvalFormMessages = {
  employeeRequired: string;
  cycleRequired: string;
  scoreRange: string;
  summaryRequired: string;
  kpiNotInCatalog: string;
  gradeNotInCatalog: string;
  deptNotInCatalog: string;
};

export function createPerformanceCycleFormSchema(messages: PerformanceCycleFormMessages) {
  return z
    .object({
      cycle_name: z.string().trim().min(1, messages.nameRequired),
      start_date: z.string().trim().min(1, messages.startRequired),
      end_date: z.string().trim().min(1, messages.endRequired),
    })
    .superRefine((val, ctx) => {
      if (val.start_date && val.end_date && val.end_date < val.start_date) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.dateOrder, path: ['end_date'] });
      }
    });
}

export type PerformanceCycleFormValues = z.infer<ReturnType<typeof createPerformanceCycleFormSchema>>;

/**
 * Eval create/edit Zod.
 * When catalog getters return length > 0, codes must ∈ catalog (cấm invent).
 */
export function createPerformanceEvalFormSchema(
  messages: PerformanceEvalFormMessages,
  getAllowedKpiCodes: () => readonly string[] = () => [],
  getAllowedGradeCodes: () => readonly string[] = () => [],
  getAllowedDeptCodes: () => readonly string[] = () => [],
) {
  return z
    .object({
      employee_id: z.string().trim().min(1, messages.employeeRequired),
      cycle_id: z.string().trim().min(1, messages.cycleRequired),
      score: z.coerce.number().min(0, messages.scoreRange).max(100, messages.scoreRange),
      summary: z.string().trim().min(1, messages.summaryRequired),
      kpi_code: z.string().trim().optional().or(z.literal('')),
      job_grade_key: z.string().trim().optional().or(z.literal('')),
      department_key: z.string().trim().optional().or(z.literal('')),
    })
    .superRefine((val, ctx) => {
      const kpis = getAllowedKpiCodes();
      const kpi = val.kpi_code?.trim() ?? '';
      if (kpis.length > 0 && kpi && !kpis.includes(kpi)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.kpiNotInCatalog, path: ['kpi_code'] });
      }
      if (kpis.length > 0 && !kpi) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.kpiNotInCatalog, path: ['kpi_code'] });
      }
      const grades = getAllowedGradeCodes();
      const grade = val.job_grade_key?.trim() ?? '';
      if (grades.length > 0 && grade && !grades.includes(grade)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.gradeNotInCatalog, path: ['job_grade_key'] });
      }
      const depts = getAllowedDeptCodes();
      const dept = val.department_key?.trim() ?? '';
      if (depts.length > 0 && dept && !depts.includes(dept)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.deptNotInCatalog, path: ['department_key'] });
      }
    });
}

export type PerformanceEvalFormValues = z.infer<ReturnType<typeof createPerformanceEvalFormSchema>>;
