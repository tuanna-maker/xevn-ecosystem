import type { HrmDbService } from '../db/hrm-db.service';

let payPayslipLifecycleSchemaReady = false;
let ensurePayPayslipLifecycleSchemaPromise: Promise<void> | null = null;

/** ADD CONSTRAINT only when missing — safe under concurrent ensureSchema (list payslips + lines). */
const ADD_CHK_PAYSLIP_STATUS = `
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE c.conname = 'chk_payslip_status'
        AND t.relname = 'payroll_payslips'
        AND n.nspname = 'public'
    ) THEN
      ALTER TABLE public.payroll_payslips
        ADD CONSTRAINT chk_payslip_status CHECK (
          status IN ('draft', 'processed', 'calculated', 'published', 'paid', 'void')
        );
    END IF;
  END $$;
`;

const ADD_CHK_PAYSLIP_PAYMENT_STATUS = `
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE c.conname = 'chk_payslip_payment_status'
        AND t.relname = 'payroll_payslips'
        AND n.nspname = 'public'
    ) THEN
      ALTER TABLE public.payroll_payslips
        ADD CONSTRAINT chk_payslip_payment_status CHECK (
          payment_status IS NULL OR payment_status IN ('unpaid', 'partial', 'paid', 'budget_hold')
        );
    END IF;
  END $$;
`;

/** DATA-01 §6.1–6.3 — PAY-08 lifecycle cols + TT audit (ensureSchema ADD). */
export async function ensurePayPayslipLifecycleSchema(
  db: HrmDbService,
): Promise<void> {
  if (payPayslipLifecycleSchemaReady) return;
  if (!ensurePayPayslipLifecycleSchemaPromise) {
    ensurePayPayslipLifecycleSchemaPromise = runPayPayslipLifecycleSchema(db)
      .then(() => {
        payPayslipLifecycleSchemaReady = true;
      })
      .finally(() => {
        ensurePayPayslipLifecycleSchemaPromise = null;
      });
  }
  await ensurePayPayslipLifecycleSchemaPromise;
}

async function runPayPayslipLifecycleSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    ALTER TABLE public.payroll_periods
      ADD COLUMN IF NOT EXISTS payroll_locked BOOLEAN NOT NULL DEFAULT false;
  `);

  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS payment_status TEXT NULL,
      ADD COLUMN IF NOT EXISTS published_to_ess BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS published_by UUID NULL,
      ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
  `);

  await db.query(ADD_CHK_PAYSLIP_STATUS);
  await db.query(ADD_CHK_PAYSLIP_PAYMENT_STATUS);

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_payslip_payment_status_audit (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      payslip_id UUID NOT NULL REFERENCES public.payroll_payslips(id) ON DELETE RESTRICT,
      event_kind TEXT NOT NULL,
      from_payment_status TEXT NULL,
      to_payment_status TEXT NULL,
      actor_user_id UUID NULL,
      note TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_pay_ps_audit_kind CHECK (
        event_kind IN ('payment_status_change', 'publish')
      )
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_ps_audit_payslip
      ON public.pay_payslip_payment_status_audit (payslip_id, created_at DESC);
  `);
}

/** @internal test-only — reset module guard between unit tests. */
export function __resetPayPayslipLifecycleSchemaForTests(): void {
  payPayslipLifecycleSchemaReady = false;
  ensurePayPayslipLifecycleSchemaPromise = null;
}
