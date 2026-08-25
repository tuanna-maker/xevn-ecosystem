/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — mức giảm trừ gia cảnh statutory CFG
 * UC:         FR-UC-BP-PAY-03 · AC-PAY-03-CFG
 * Purpose:    physical pay_gtgc_statutory_cfg · pick at as_of — cấm hardcode 11tr/4.4tr trong resolver
 * WorkItem:   PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01
 * must_keep:  U65 no payroll seed · payroll_e2e_ready=false
 */
import { expandPayrollAttendanceSheetCompanyIds } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { PAY_GTCG_REGIME_CODE_DEFAULT } from './pay-gtgc.constants';
import { normalizePayrollAsOfDate } from './pay-src-resolver';

export type PayGtgcStatutoryCfgRow = {
  id: string;
  company_id: string;
  gtgc_self_amount: string;
  gtgc_per_dependent_amount: string;
};

export async function ensurePayGtgcStatutoryCfgSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_gtgc_statutory_cfg (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id TEXT NOT NULL DEFAULT 'xevn',
      company_id TEXT NOT NULL,
      ou_id TEXT NULL,
      regime_code TEXT NOT NULL DEFAULT 'VN_PIT_GTGC',
      gtgc_self_amount NUMERIC(18,2) NOT NULL,
      gtgc_per_dependent_amount NUMERIC(18,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'VND',
      effective_from DATE NOT NULL,
      effective_to DATE NULL,
      status TEXT NOT NULL DEFAULT 'active',
      version INT NOT NULL DEFAULT 1,
      supersedes_id UUID NULL,
      notes TEXT NULL,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by TEXT NULL,
      updated_by TEXT NULL
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_gtgc_statutory_cfg_pick
      ON public.pay_gtgc_statutory_cfg (company_id, regime_code, effective_from DESC)
      WHERE archived_at IS NULL AND status = 'active';
  `);
  await db.query(`
    DO $$ BEGIN
      ALTER TABLE public.pay_gtgc_statutory_cfg
        DROP CONSTRAINT IF EXISTS chk_pay_gtgc_statutory_status;
      ALTER TABLE public.pay_gtgc_statutory_cfg
        ADD CONSTRAINT chk_pay_gtgc_statutory_status
        CHECK (status IN ('draft','active','retired'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.query(`
    DO $$ BEGIN
      ALTER TABLE public.pay_gtgc_statutory_cfg
        DROP CONSTRAINT IF EXISTS chk_pay_gtgc_statutory_amounts;
      ALTER TABLE public.pay_gtgc_statutory_cfg
        ADD CONSTRAINT chk_pay_gtgc_statutory_amounts
        CHECK (gtgc_self_amount >= 0 AND gtgc_per_dependent_amount >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.query(`
    DO $$ BEGIN
      ALTER TABLE public.pay_gtgc_statutory_cfg
        DROP CONSTRAINT IF EXISTS chk_pay_gtgc_statutory_dates;
      ALTER TABLE public.pay_gtgc_statutory_cfg
        ADD CONSTRAINT chk_pay_gtgc_statutory_dates
        CHECK (effective_to IS NULL OR effective_to >= effective_from);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export async function pickPayGtgcStatutoryCfgAtAsOf(
  db: HrmDbService,
  input: { companyId: string; asOf: string; regimeCode?: string },
): Promise<PayGtgcStatutoryCfgRow | null> {
  await ensurePayGtgcStatutoryCfgSchema(db);
  const asOf = normalizePayrollAsOfDate(input.asOf);
  const regime = (input.regimeCode ?? PAY_GTCG_REGIME_CODE_DEFAULT).trim();
  const companyIds = expandPayrollAttendanceSheetCompanyIds(input.companyId);
  const res = await db.query<PayGtgcStatutoryCfgRow>(
    `
      SELECT
        id::text AS id,
        company_id,
        gtgc_self_amount::text AS gtgc_self_amount,
        gtgc_per_dependent_amount::text AS gtgc_per_dependent_amount
      FROM public.pay_gtgc_statutory_cfg
      WHERE company_id = ANY($1::text[])
        AND regime_code = $2
        AND archived_at IS NULL
        AND status = 'active'
        AND effective_from <= $3::date
        AND (effective_to IS NULL OR effective_to >= $3::date)
      ORDER BY effective_from DESC, version DESC
      LIMIT 1;
    `,
    [companyIds, regime, asOf],
  );
  return res.rows[0] ?? null;
}
