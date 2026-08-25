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

type QueryFn = (text: string, params?: unknown[]) => Promise<unknown>;

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

/**
 * Backfill null tenant_id on main-partition recruitment rows created before tenant-only scope.
 * Derives tenant from linked YCTD when present; otherwise uses master tenant (xevn).
 */
export async function backfillRecruitmentMainPartitionTenantId(
  query: QueryFn,
  masterTenantId: string,
): Promise<void> {
  await query(
    `UPDATE public.recruitment_candidates c
     SET tenant_id = COALESCE(NULLIF(TRIM(r.tenant_id), ''), $1)
     FROM public.job_requisitions r
     WHERE c.requisition_id = r.id
       AND c.company_id = 'main'
       AND (c.tenant_id IS NULL OR TRIM(c.tenant_id) = '')`,
    [masterTenantId],
  );
  await query(
    `UPDATE public.candidates c
     SET tenant_id = $1
     WHERE c.company_id = 'main'
       AND (c.tenant_id IS NULL OR TRIM(c.tenant_id) = '')`,
    [masterTenantId],
  );
  await query(
    `UPDATE public.recruitment_interviews i
     SET tenant_id = COALESCE(NULLIF(TRIM(c.tenant_id), ''), $1)
     FROM public.recruitment_candidates c
     WHERE i.candidate_id = c.id
       AND i.company_id = 'main'
       AND (i.tenant_id IS NULL OR TRIM(i.tenant_id) = '')`,
    [masterTenantId],
  );
  await query(
    `UPDATE public.recruitment_plans
     SET tenant_id = $1
     WHERE company_id = 'main'
       AND (tenant_id IS NULL OR TRIM(tenant_id) = '')`,
    [masterTenantId],
  );
  await query(
    `UPDATE public.headcount_proposals
     SET tenant_id = $1
     WHERE company_id = 'main'
       AND (tenant_id IS NULL OR TRIM(tenant_id) = '')`,
    [masterTenantId],
  );
}
