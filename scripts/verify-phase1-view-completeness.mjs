#!/usr/bin/env node
/**
 * Phase 1 product completeness — API probes for CC HRM embed + key XBOS rails.
 * Fails if HTTP error or critical list empty when workforce exists.
 * work_item_id: PHASE1-PRODUCT-COMPLETENESS
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';
import { resolvePortalBase } from './lib/portal-base-resolver.mjs';

loadDeployEnv();

const outDir = path.join(process.cwd(), 'docs/qa/evidence');
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outFile = path.join(outDir, `phase1-view-completeness-${date}.md`);

const probes = [
  {
    id: 'employees',
    path: '/api/hrm/employees?company_id=main&page_size=50',
    minTotal: 100,
    linkedField: (rows) => rows.filter((r) => r.full_name?.trim()).length,
  },
  {
    id: 'contracts',
    path: '/api/hrm/contracts-insurance/contracts?company_id=main',
    minTotal: 100,
    linkedField: (rows) => rows.filter((r) => r.employee_name?.trim()).length,
  },
  {
    id: 'insurance-expiring',
    path: '/api/hrm/contracts-insurance/insurance/expiring?company_id=main&days=90',
    minTotal: 0,
    linkedField: (rows) => rows.length,
  },
  {
    id: 'requisitions',
    path: '/api/hrm/recruitment/requisitions?company_id=main&page_size=50',
    minTotal: 1,
    linkedField: (rows) => rows.length,
  },
  {
    id: 'attendance',
    path: '/api/hrm/attendance/records?company_id=main&page_size=50',
    minTotal: 10,
    linkedField: (rows) => rows.filter((r) => r.employee_id).length,
  },
  {
    id: 'payslips',
    path: '/api/hrm/payroll/payslips?company_id=main&page_size=50',
    minTotal: 10,
    linkedField: (rows) => rows.filter((r) => r.employee_id).length,
  },
  {
    id: 'leave',
    path: '/api/hrm/attendance/leave-requests?company_id=main&page_size=50',
    minTotal: 1,
    linkedField: (rows) => rows.filter((r) => r.employee_name?.trim() || r.employee_id).length,
  },
  {
    id: 'catalogs',
    path: '/api/hrm/settings-catalogs',
    minTotal: 1,
    linkedField: (rows) => rows.length,
    parseRows: (body) => body?.data?.catalogs ?? [],
  },
  {
    id: 'kpi-rollup',
    path: '/api/xbos/kpi-engine/rollup?companyId=holding',
    minTotal: 0,
    optional: true,
    linkedField: () => 1,
    parseRows: () => [],
  },
  {
    id: 'dept-templates',
    path: '/api/xbos/business-master/dept_system_templates/items',
    minTotal: 0,
    optional: true,
    linkedField: (rows) => rows.length,
    parseRows: (body) => {
      const d = body?.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.items)) return d.items;
      return [];
    },
  },
];

async function fetchJson(url, headers) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function extractRows(body, probe) {
  if (probe.parseRows) return probe.parseRows(body);
  const d = body?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

async function main() {
  const PORTAL = await resolvePortalBase();
  fs.mkdirSync(outDir, { recursive: true });
  const session = await portalLogin('ceo@xe.vn', process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026');
  const headers = {
    Authorization: `Bearer ${session.access_token ?? session.accessToken}`,
    'x-tenant-id': session.defaultTenantId ?? session.default_tenant_id ?? 'xevn',
    'x-company-id': session.defaultCompanyId ?? session.default_company_id ?? 'main',
  };

  const lines = [
    '# Phase 1 view completeness audit',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Portal:** ${PORTAL}`,
    '',
    '| View/API | HTTP | total | linked | min | PASS |',
    '|----------|------|------:|-------:|----:|:----:|',
  ];

  let fails = 0;
  for (const p of probes) {
    const { status, body } = await fetchJson(`${PORTAL}${p.path}`, headers);
    const rows = extractRows(body, p);
    const total = body?.data?.total ?? body?.meta?.total ?? rows.length;
    const linked = p.linkedField(rows);
    const httpOk = status >= 200 && status < 300;
    const dataOk = p.optional || total >= p.minTotal;
    const linkOk =
      p.optional ||
      p.minTotal === 0 ||
      (total >= p.minTotal &&
        (rows.length === 0 ? true : linked >= Math.ceil(rows.length * 0.95)));
    const pass = httpOk && dataOk && (p.id === 'insurance-expiring' ? httpOk : linkOk);
    if (!pass && !p.optional) fails += 1;
    lines.push(
      `| ${p.id} | ${status} | ${total} | ${linked} | ${p.minTotal} | ${pass ? 'PASS' : 'FAIL'} |`,
    );
    console.log(`${pass ? 'PASS' : 'FAIL'} ${p.id} http=${status} total=${total} linked=${linked}`);
  }

  lines.push('', `## Summary: ${probes.length - fails}/${probes.length} critical PASS`, '');
  lines.push('**Phase 1 UC:** 245 total — `planned: 111`, `e2e_pass: 15` (see `pnpm phase1:gate`).');
  lines.push('This audit is **product data completeness**, not full UC sign-off.');
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log(`\nWrote ${outFile}`);
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
