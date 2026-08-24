#!/usr/bin/env node
import { loadDeployEnv } from '../seed-env-loader.mjs';
import { createHrmClient } from '../lib/uat-db.mjs';

// Inline copy of parse logic from pay-src-resolver.ts
function parsePeriodSnapshotColumns(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return [];
  const raw = Array.isArray(snapshot.columns) ? snapshot.columns : [];
  return raw
    .map((col, idx) => {
      const component_code = String(col?.component_code ?? '').trim();
      if (!component_code) return null;
      return {
        component_code,
        sort_order: Number(col.sort_order ?? idx),
        formula_definition_id: col.formula_definition_id ?? null,
        override_applied: Boolean(col.override_applied ?? col.formula_definition_id),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sort_order - b.sort_order);
}

loadDeployEnv();
const client = createHrmClient();
await client.connect();
const r = await client.query(
  `SELECT sheet_template_snapshot_json FROM payroll_periods WHERE id='a4e896b6-6b22-4c0f-80e3-0acda5ee2810'`,
);
const cols = parsePeriodSnapshotColumns(r.rows[0].sheet_template_snapshot_json);
const ltc = cols.find((c) => c.component_code === 'LUONG_THEO_CONG');
console.log('parsed LUONG_THEO_CONG:', ltc);
console.log('SRC-05 would run:', Boolean(ltc?.formula_definition_id && ltc?.override_applied !== true));
await client.end();
