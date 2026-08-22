/**
 * DDL helpers — add tenant_id column to HRM tables migrating off OU slug partition.
 * Ref: SA-HRM-TENANT-ONLY-SCOPE-01 Phase 2
 */

export const HRM_TENANT_SCOPED_TABLES = [
  'payroll_periods',
  'payroll_payslips',
  'departments',
  'hr_decisions',
  'job_requisitions',
  'recruitment_candidates',
  'recruitment_interviews',
  'rec_candidate_stage_history',
  'rec_mail_outbox',
  'rec_mail_log',
  'job_postings',
  'candidates',
  'candidate_applications',
  'recruitment_plans',
  'headcount_proposals',
  'candidate_evaluations',
  'evaluation_criteria_templates',
  'recruitment_plan_departments',
  'recruitment_plan_positions',
  'job_description_templates',
  'interviews',
  'rec_pipeline_stage',
] as const;

type QueryFn = (text: string) => Promise<unknown>;

export async function ensureHrmTenantIdColumns(query: QueryFn): Promise<void> {
  for (const table of HRM_TENANT_SCOPED_TABLES) {
    await query(
      `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS tenant_id TEXT`,
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_${table}_tenant_company ON public.${table} (tenant_id, company_id)`,
    );
  }
}
