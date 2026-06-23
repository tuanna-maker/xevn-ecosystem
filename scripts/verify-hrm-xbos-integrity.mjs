#!/usr/bin/env node
/**
 * XBOS ↔ HRM cardinality + scope parity integrity gate.
 * work_item_id: P1-PROD-INT-BE-01
 *
 * - GET group-member-units + legal-entities (XBOS) vs HRM employee counts per GROUP_MEMBER_SLUGS
 * - Static scope parity: list services vs get-by-id using resolveHrmListScope
 */
import pg from 'pg';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin, xbosReq, checkXbosHealth, checkHrmHealth } from './lib/uat-http.mjs';
import {
  GROUP_MEMBER_SLUGS,
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_OPERATING_UNIT_DISPLAY_NAMES,
  MASTER_TENANT_ID,
} from './lib/hrm-company-slug-map.mjs';
import { auditHrmScopeParity } from './lib/hrm-scope-parity-audit.mjs';

loadDeployEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const HRM_SRC = resolve(repoRoot, 'apps/api/hrm-api/src');

/** Re-export for scripts that import from this gate. */
export { GROUP_MEMBER_SLUGS } from './lib/hrm-company-slug-map.mjs';

const MIN_ACTIVE_PER_SLUG = Number(process.env.HRM_INTEGRITY_MIN_ACTIVE_PER_SLUG ?? 1);
const PASSWORD = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const defects = [];
const notes = [];

function recordDefect(id, severity, msg) {
  defects.push({ id, severity, msg });
}

function authHeaders(session) {
  return {
    Authorization: `Bearer ${session.access_token}`,
    'x-tenant-id': session.defaultTenantId ?? session.default_tenant_id ?? 'xevn',
    'x-company-id': session.defaultCompanyId ?? session.default_company_id ?? 'main',
    Accept: 'application/json',
  };
}

async function fetchXbosOrg(session) {
  const headers = authHeaders(session);
  const gmu = await xbosReq('/tenant-scope/group-member-units', { headers });
  const legal = await xbosReq('/org-foundation/legal-entities?companyId=holding', { headers });
  return { gmu, legal };
}

async function fetchXbosOrgFromDb() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_XBOS ?? process.env.XBOS_DB_NAME ?? 'xevn_xbos',
    ssl: false,
  });
  await client.connect();
  const members = await client.query(
    `SELECT t.tenant_id, t.name, le.id::text AS entity_id, le.code
     FROM public.xbos_tenant_registry t
     JOIN public.xbos_legal_entity le
       ON le.tenant_id = t.tenant_id AND le.company_id = t.default_company_id
     WHERE t.tenant_kind = 'member' AND t.status = 'active'
       AND le.status IS DISTINCT FROM 'deleted'
     ORDER BY t.name`,
  );
  const holding = await client.query(
    `SELECT tenant_id, company_id, code, name
     FROM public.xbos_legal_entity
     WHERE tenant_id = $1 AND company_id = 'holding' AND status IS DISTINCT FROM 'deleted'
     LIMIT 5`,
    [process.env.MASTER_TENANT_ID ?? 'xevn'],
  );
  await client.end();
  return { members: members.rows, holding: holding.rows };
}

async function hrmEmployeeCountsBySlug() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? process.env.DB_NAME_HRM ?? 'xevn_hrm',
    ssl: false,
  });
  await client.connect();
  const masterTenant = process.env.MASTER_TENANT_ID ?? 'xevn';
  const res = await client.query(
    `
    SELECT company_id,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (
             WHERE (status = 'active' OR status IS NULL) AND archived_at IS NULL
           )::int AS active
    FROM public.employees
    WHERE company_id = ANY($1::text[])
      AND (
        COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), $2) = $2
        OR custom_fields->>'tenant_id' IS NULL
      )
    GROUP BY company_id
    ORDER BY company_id
    `,
    [GROUP_MEMBER_SLUGS, masterTenant],
  );
  const distinctSlugs = await client.query(
    `SELECT DISTINCT company_id FROM public.employees ORDER BY company_id`,
  );
  await client.end();
  return {
    bySlug: Object.fromEntries(res.rows.map((r) => [r.company_id, { total: r.total, active: r.active }])),
    allSlugs: distinctSlugs.rows.map((r) => r.company_id),
  };
}

function reconcileCardinality(xbosMembers, hrmCounts) {
  console.log('\n=== XBOS ↔ HRM cardinality ===\n');
  console.log(`XBOS group-member-units (member tenants): ${xbosMembers.length}`);
  for (const m of xbosMembers) {
    const tid = m.tenant_id ?? m.tenantId;
    const name = m.tenant_name ?? m.name ?? m.code ?? tid;
    console.log(`  member tenant=${tid}  entity=${m.entity_id ?? m.id ?? '?'}  ${name}`);
  }

  console.log('\nHRM employees by GROUP_MEMBER_SLUG:');
  let slugFail = 0;
  for (const slug of GROUP_MEMBER_SLUGS) {
    const stats = hrmCounts.bySlug[slug] ?? { total: 0, active: 0 };
    const ok = stats.active >= MIN_ACTIVE_PER_SLUG;
    if (!ok) {
      slugFail += 1;
      recordDefect(`CARD-${slug}`, 'P0', `HRM slug ${slug} active=${stats.active} (need >=${MIN_ACTIVE_PER_SLUG})`);
    }
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${slug}  total=${stats.total}  active=${stats.active}  (min active ${MIN_ACTIVE_PER_SLUG})`,
    );
  }

  const extraSlugs = hrmCounts.allSlugs.filter((s) => !GROUP_MEMBER_SLUGS.includes(s) && s !== 'main');
  if (extraSlugs.length) {
    notes.push(`HRM extra company_id slugs (informational): ${extraSlugs.join(', ')}`);
    console.log(`\nNote: extra HRM slugs outside GROUP_MEMBER_SLUGS: ${extraSlugs.join(', ')}`);
  }

  notes.push(
    `G-INT-03 pilot mapping: XBOS member tenants (${xbosMembers.map((m) => m.tenant_id ?? m.tenantId).join(', ')}) use org-seed tenant_ids; HRM GROUP_MEMBER_SLUGS (${GROUP_MEMBER_SLUGS.join(', ')}) are synthetic UAT partitions — Plane A count may differ; Plane B bridge via company_slug_map.display_name (PCOMP-W3-BE-04).`,
  );
  console.log(
    `\nNote: XBOS org tenants ≠ HRM operating slugs (expected pilot drift — see G-INT-03 / HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md).`,
  );

  return slugFail === 0;
}

async function fetchCompanySlugMapBridge() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? process.env.DB_NAME_HRM ?? 'xevn_hrm',
    ssl: false,
  });
  await client.connect();
  const res = await client.query(
    `SELECT company_slug, company_uuid::text, display_name
     FROM public.company_slug_map
     WHERE tenant_id = $1
     ORDER BY company_slug`,
    [MASTER_TENANT_ID],
  );
  await client.end();
  return res.rows;
}

function reconcileSlugMapBridge(rows) {
  console.log('\n=== G-INT-03 company_slug_map bridge (VAL-INT-03-03) ===\n');
  const bySlug = Object.fromEntries(rows.map((r) => [r.company_slug, r]));
  let fail = 0;
  for (const slug of GROUP_MEMBER_SLUGS) {
    const row = bySlug[slug];
    const expectedUuid = HRM_COMPANY_UUID_BY_SLUG[slug];
    const expectedName = HRM_OPERATING_UNIT_DISPLAY_NAMES[slug];
    const uuidOk = row?.company_uuid === expectedUuid;
    const nameOk = row?.display_name?.trim() === expectedName;
    const ok = Boolean(row) && uuidOk && nameOk;
    if (!ok) {
      fail += 1;
      const detail = !row
        ? 'missing row'
        : !uuidOk
          ? `uuid=${row.company_uuid} expected ${expectedUuid}`
          : `display_name=${JSON.stringify(row.display_name)} expected ${JSON.stringify(expectedName)}`;
      recordDefect(`SLUGMAP-${slug}`, 'P1', `company_slug_map ${slug}: ${detail}`);
    }
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${slug}  uuid=${row?.company_uuid ?? '?'}  display_name=${row?.display_name ?? '(missing)'}`,
    );
  }
  if (rows.length !== GROUP_MEMBER_SLUGS.length) {
    notes.push(
      `company_slug_map row count=${rows.length} (expected ${GROUP_MEMBER_SLUGS.length}) — run pnpm run seed:hrm:company-slug-map`,
    );
  }
  if (fail === 0) {
    notes.push(
      `G-INT-03 bridge PASS: ${GROUP_MEMBER_SLUGS.length} operating slugs with display_name per BA-D-01 §5 (Plane B label SoT).`,
    );
  }
  return fail === 0 && rows.length === GROUP_MEMBER_SLUGS.length;
}

function reportScopeParity(audit) {
  console.log('\n=== HRM scope parity (list vs get-by-id) ===\n');
  console.log(
    `Scanned ${audit.summary.filesScanned} service files — list w/ rollup: ${audit.summary.listWithScope}, get-by-id scoped: ${audit.summary.getByIdScoped}, gaps: ${audit.summary.getByIdGap}`,
  );
  for (const f of audit.findings) {
    console.log(`  FAIL  ${f.file}::${f.method}  [${f.severity}] ${f.detail}`);
    recordDefect(`SCOPE-${f.file.replace(/\//g, '-')}-${f.method}`, f.severity, `${f.file}::${f.method}`);
  }
  if (audit.pass) {
    console.log('  PASS  no get-by-id scope gaps in services with list rollup');
  }
  return audit.pass;
}

async function main() {
  console.log('verify-hrm-xbos-integrity  P1-PROD-INT-BE-01\n');

  let xbosMembers = [];
  let xbosSource = 'api';

  try {
    await checkXbosHealth();
    await checkHrmHealth();
    const session = await portalLogin('ceo@xe.vn', PASSWORD);
    const { gmu, legal } = await fetchXbosOrg(session);
    if (gmu.status !== 200) {
      throw new Error(`group-member-units HTTP ${gmu.status}`);
    }
    const payload = gmu.body?.data ?? gmu.body ?? {};
    xbosMembers = payload.members ?? payload.items ?? [];
    const leItems = legal.body?.data?.items ?? legal.body?.data ?? [];
    const leCount = Array.isArray(leItems) ? leItems.length : 0;
    console.log(`XBOS API OK — group-member-units=${xbosMembers.length}  legal-entities(holding)=${leCount}`);
    if (leCount === 0) {
      recordDefect('XBOS-LE-EMPTY', 'P1', 'legal-entities list empty for holding scope');
    }
  } catch (apiErr) {
    xbosSource = 'db-fallback';
    console.warn(`XBOS API unavailable (${apiErr.message}) — falling back to XBOS DB`);
    try {
      const dbOrg = await fetchXbosOrgFromDb();
      xbosMembers = dbOrg.members;
      if (!dbOrg.holding.length) {
        recordDefect('XBOS-HOLDING-MISSING', 'P0', 'no holding legal entity in xbos_legal_entity');
      }
    } catch (dbErr) {
      recordDefect('XBOS-UNREACHABLE', 'P0', `API and DB fallback failed: ${dbErr.message}`);
    }
  }

  let hrmCounts;
  try {
    hrmCounts = await hrmEmployeeCountsBySlug();
  } catch (dbErr) {
    recordDefect('HRM-DB', 'P0', `HRM employee count query failed: ${dbErr.message}`);
    hrmCounts = { bySlug: {}, allSlugs: [] };
  }

  const cardPass = reconcileCardinality(xbosMembers, hrmCounts);

  let slugMapPass = true;
  try {
    const slugMapRows = await fetchCompanySlugMapBridge();
    slugMapPass = reconcileSlugMapBridge(slugMapRows);
  } catch (dbErr) {
    recordDefect('SLUGMAP-DB', 'P1', `company_slug_map query failed: ${dbErr.message}`);
    slugMapPass = false;
  }

  const audit = auditHrmScopeParity(HRM_SRC);
  const scopePass = reportScopeParity(audit);

  const p0 = defects.filter((d) => d.severity === 'P0');
  const p1 = defects.filter((d) => d.severity === 'P1');
  console.log('\n=== Summary ===');
  console.log(
    `xbos_source=${xbosSource}  cardinality=${cardPass ? 'PASS' : 'FAIL'}  slug_map_bridge=${slugMapPass ? 'PASS' : 'FAIL'}  scope_parity=${scopePass ? 'PASS' : 'FAIL'}`,
  );
  console.log(`defects: P0=${p0.length}  P1=${p1.length}`);

  const exitCode = p0.length > 0 || !cardPass ? 1 : 0;
  console.log(exitCode === 0 ? '\n=== INTEGRITY PASS ===' : '\n=== INTEGRITY FAIL ===');
  process.exit(exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
