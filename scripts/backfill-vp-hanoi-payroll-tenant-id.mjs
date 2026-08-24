#!/usr/bin/env node
/** Backfill tenant_id on VP Hà Nội payroll period — fixes empty list with HRM_TENANT_ONLY_SCOPE=true */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import {
  VP_HANOI_TENANT_ID,
  VP_HANOI_COMPANY_ID,
  VP_HANOI_PERIOD_START,
  VP_HANOI_PERIOD_END,
} from './lib/vp-hanoi-seed-constants.mjs';

loadDeployEnv();
const client = await createHrmClient();
await client.connect();
try {
  const res = await client.query(
    `UPDATE public.payroll_periods
     SET tenant_id = $1, updated_at = NOW()
     WHERE company_id = $2
       AND start_date = $3::date
       AND end_date = $4::date
       AND (tenant_id IS NULL OR TRIM(tenant_id) = '')
     RETURNING id, period_label, tenant_id`,
    [VP_HANOI_TENANT_ID, VP_HANOI_COMPANY_ID, VP_HANOI_PERIOD_START, VP_HANOI_PERIOD_END],
  );
  console.log(`Backfilled ${res.rowCount ?? 0} payroll period(s):`);
  console.log(JSON.stringify(res.rows, null, 2));
} finally {
  await client.end();
}
