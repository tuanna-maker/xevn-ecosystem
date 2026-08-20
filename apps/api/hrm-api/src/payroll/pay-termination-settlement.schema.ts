import type { HrmDbService } from '../db/hrm-db.service';

/** DATA-01 §6.1 — pay_termination_settlement (greenfield ensure). */
export async function ensurePayTerminationSettlementSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_termination_settlement (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      termination_id UUID NOT NULL,
      employee_id UUID NOT NULL,
      payroll_period_id UUID NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
      final_payslip_id UUID NULL,
      timesheet_header_id UUID NULL,
      si_cutoff_done BOOLEAN NOT NULL DEFAULT false,
      leave_cashout_done BOOLEAN NOT NULL DEFAULT false,
      asset_checklist_ack BOOLEAN NOT NULL DEFAULT false,
      reward_discipline_included BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'draft',
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_pay_term_settle_status CHECK (
        status IN ('draft', 'ready', 'posted', 'cancelled')
      )
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_term_settle_co_emp_st
      ON public.pay_termination_settlement (company_id, employee_id, status);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_term_settle_period_emp
      ON public.pay_termination_settlement (payroll_period_id, employee_id);
  `);
}

/** DATA-01 §6.2 — final payslip flags on payroll_payslips. */
export async function ensurePayrollPayslipsFinalPayColumns(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS is_final_pay BOOLEAN NOT NULL DEFAULT false;
  `);
  await db.query(`
    ALTER TABLE public.payroll_payslips
      ADD COLUMN IF NOT EXISTS termination_settlement_id UUID NULL;
  `);
}
