import type { HrmDbService } from '../db/hrm-db.service';

/** DATA-01 §6.1–6.3 — pay_payroll_group + period/payslip FK (PAY-09). */
export async function ensurePayPayrollGroupSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_payroll_group (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name_vi TEXT NOT NULL,
      priority INT NOT NULL DEFAULT 0,
      match_rule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      formula_definition_id UUID NULL,
      status TEXT NOT NULL DEFAULT 'active',
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_pay_payroll_group_status CHECK (status IN ('active', 'retired'))
    );
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_payroll_group_company_code_active
      ON public.pay_payroll_group (company_id, code)
      WHERE archived_at IS NULL;
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_payroll_group_company_status
      ON public.pay_payroll_group (company_id, status);
  `);

  await db.query(`
    ALTER TABLE public.payroll_periods
      ADD COLUMN IF NOT EXISTS payroll_group_id UUID NULL;
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_payroll_periods_payroll_group_id'
      ) THEN
        ALTER TABLE public.payroll_periods
          ADD CONSTRAINT fk_payroll_periods_payroll_group_id
          FOREIGN KEY (payroll_group_id) REFERENCES public.pay_payroll_group(id) ON DELETE RESTRICT;
      END IF;
    END $$;
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_payroll_periods_payroll_group_id
      ON public.payroll_periods (payroll_group_id)
      WHERE payroll_group_id IS NOT NULL;
  `);

  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS payroll_group_id UUID NULL;
  `);

  await db.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_payroll_payslips_payroll_group_id'
      ) THEN
        ALTER TABLE public.payroll_payslips
          ADD CONSTRAINT fk_payroll_payslips_payroll_group_id
          FOREIGN KEY (payroll_group_id) REFERENCES public.pay_payroll_group(id) ON DELETE RESTRICT;
      END IF;
    END $$;
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_payroll_payslips_payroll_group_id
      ON public.payroll_payslips (payroll_group_id)
      WHERE payroll_group_id IS NOT NULL;
  `);
}
