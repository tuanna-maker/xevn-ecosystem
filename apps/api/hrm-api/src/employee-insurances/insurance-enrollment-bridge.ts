/**
 * @CODE-MEMORY
 * Screen:     HRM → BH enrollment SoT bridge (legacy records → employee_insurances)
 * UC:         FR-UC-BP-CORE-10 · AC-SI-TL-01..05 · R-EMP-SI-DUAL-SOT
 * BR:         enrollment SoT ONE = employee_insurances (DB-01); records ≠ enrollment
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.5
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-SI-02/03
 * DB_DESIGN:  docs/program/specs/PO-HRM-E2E-LINK-EMP-DB-01.md §1–§2
 * Purpose:    Idempotent promote natural employee_insurance_records into employee_insurances
 *             so list ids are usable by POST /employee-insurances/:id/actions — no amount invent.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-BE-02
 * Coded:      2026-08-06
 * Callers:    employee-insurances.service · contracts-insurance.service
 * Callees:    HrmDbService.query
 * must_keep:  same UUID on bridge; contribution/employer=0 when unknown; no seed; no second SoT
 * SOLID:      Pure SQL helper — services own scope; bridge owns identity promote only
 * LastVerified: po-hrm-e2e-link-emp-be-02.spec.ts
 */
import type { HrmDbService } from '../db/hrm-db.service';

/** Ensure enrollment + period tables exist (ADD-only; safe to call repeatedly). */
export async function ensureEmployeeInsuranceEnrollmentSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.employee_insurances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id UUID NOT NULL,
      company_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'social',
      provider TEXT NOT NULL,
      policy_number TEXT,
      start_date DATE,
      end_date DATE,
      contribution NUMERIC NOT NULL DEFAULT 0,
      employer_contribution NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_employee_insurances_company_employee
    ON public.employee_insurances (company_id, employee_id);
  `);
  await db.query(`
    ALTER TABLE public.employee_insurances
      ADD COLUMN IF NOT EXISTS policy_id UUID NULL;
  `);
  await db.query(`
    ALTER TABLE public.employee_insurances
      ADD COLUMN IF NOT EXISTS si_number TEXT NULL;
  `);
  await db.query(`
    ALTER TABLE public.employee_insurances
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_insurance_rate_period (
      id UUID PRIMARY KEY,
      enrollment_id UUID NOT NULL,
      company_id TEXT NOT NULL,
      effective_from DATE NOT NULL,
      effective_to DATE NULL,
      employee_rate_pct NUMERIC NULL,
      employer_rate_pct NUMERIC NULL,
      employee_amount NUMERIC NULL,
      employer_amount NUMERIC NULL,
      pay_rate_cfg_id UUID NULL,
      period_status TEXT NOT NULL,
      action TEXT NULL,
      change_reason TEXT NULL,
      suspend_reason TEXT NULL,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_hrm_insurance_rate_period_enrollment_from
      ON public.hrm_insurance_rate_period (enrollment_id, effective_from);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_hrm_insurance_rate_period_company_status
      ON public.hrm_insurance_rate_period (company_id, period_status);
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_insurance_rate_period_open
      ON public.hrm_insurance_rate_period (enrollment_id)
      WHERE effective_to IS NULL AND archived_at IS NULL;
  `);
}

/**
 * Promote legacy list rows (employee_insurance_records) → enrollment SoT.
 * - Preserves record UUID as enrollment id (actions path works on natural list ids).
 * - contribution / employer_contribution = 0 (no invent commercial amounts).
 * - Skips when id already enrolled or open identity twin exists (employee+company+provider+policy).
 * - Not a QA seed: only copies identity fields already present in natural records.
 */
export async function bridgeLegacyInsuranceRecordsToEnrollments(
  db: HrmDbService,
  companyIds: string[],
): Promise<number> {
  if (!companyIds.length) return 0;
  await ensureEmployeeInsuranceEnrollmentSchema(db);
  // Ensure legacy table exists before SELECT (contracts ensureSchema may not have run).
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.employee_insurance_records (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      provider TEXT NOT NULL,
      policy_number TEXT NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    ALTER TABLE public.employee_insurance_records
      ADD COLUMN IF NOT EXISTS insurer_key TEXT NULL;
  `);
  await db.query(`
    ALTER TABLE public.employee_insurance_records
      ADD COLUMN IF NOT EXISTS policy_id UUID NULL;
  `);

  const res = await db.query<{ id: string }>(
    `
      INSERT INTO public.employee_insurances (
        id, employee_id, company_id, type, provider, policy_number,
        start_date, end_date, contribution, employer_contribution, status, policy_id, notes
      )
      SELECT
        r.id,
        r.employee_id,
        r.company_id,
        'social',
        COALESCE(NULLIF(TRIM(r.provider), ''), 'UNKNOWN'),
        NULLIF(TRIM(r.policy_number), ''),
        COALESCE((r.created_at AT TIME ZONE 'UTC')::date, CURRENT_DATE),
        r.expiry_date,
        0,
        0,
        CASE
          WHEN lower(COALESCE(NULLIF(TRIM(r.status), ''), 'active')) IN (
            'active', 'suspended', 'stopped', 'closed', 'pending', 'expired'
          )
            THEN lower(TRIM(r.status))
          ELSE 'active'
        END,
        r.policy_id,
        NULL
      FROM public.employee_insurance_records r
      WHERE r.company_id = ANY($1::text[])
        AND NOT EXISTS (
          SELECT 1 FROM public.employee_insurances e WHERE e.id = r.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.employee_insurances e2
          WHERE e2.employee_id = r.employee_id
            AND e2.company_id = r.company_id
            AND e2.archived_at IS NULL
            AND e2.provider IS NOT DISTINCT FROM COALESCE(NULLIF(TRIM(r.provider), ''), 'UNKNOWN')
            AND e2.policy_number IS NOT DISTINCT FROM NULLIF(TRIM(r.policy_number), '')
        )
      RETURNING id;
    `,
    [companyIds],
  );
  return res.rows.length;
}
