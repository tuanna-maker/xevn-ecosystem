#!/usr/bin/env node
/**
 * FE+API audit — Command Center HRM embed (portal proxy + hrm routes).
 * Output: docs/qa/evidence/hrm-embed-fe-audit-YYYYMMDD.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';
import { resolvePortalBase } from './lib/portal-base-resolver.mjs';

loadDeployEnv();

const HRM = process.env.HRM_BE_URL || 'http://127.0.0.1:28001';
const outDir = path.join(process.cwd(), 'docs/qa/evidence');
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outFile = path.join(outDir, `hrm-embed-fe-audit-${date}.md`);

const probes = [
  { id: 'P-CC-03', path: '/api/hrm/employees?company_id=main&page_size=100' },
  { id: 'P-CC-04a', path: '/api/hrm/settings-catalogs' },
  { id: 'P-CC-04b', path: '/api/hrm/contracts-insurance/contracts?company_id=main' },
  { id: 'P-CC-04c', path: '/api/hrm/decisions?company_id=main' },
  { id: 'P-CC-05', path: '/api/hrm/contracts-insurance/contracts?company_id=main' },
  { id: 'P-CC-06', path: '/api/hrm/recruitment/requisitions?company_id=main&page_size=100' },
  { id: 'P-CC-07', path: '/api/hrm/attendance/records?company_id=main&page_size=100' },
  { id: 'P-CC-08', path: '/api/hrm/payroll/payslips?company_id=main&page_size=100' },
  { id: 'FE-hrm-health', path: '/api/hrm/' },
];

async function get(url, headers) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, code: body?.code, message: body?.message };
}

async function main() {
  const PORTAL = await resolvePortalBase();
  const lines = [
    `# HRM embed FE+API audit`,
    ``,
    `**Generated:** ${new Date().toISOString()}`,
    `**Portal:** ${PORTAL}`,
    `**HRM direct:** ${HRM}`,
    ``,
  ];

  let session;
  try {
    session = await portalLogin('ceo@xe.vn', process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026');
  } catch (e) {
    lines.push(`## Login FAIL`, `\`\`\``, String(e), `\`\`\``);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, lines.join('\n'));
    console.error('Login failed — see', outFile);
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${session.access_token ?? session.accessToken}`,
    'x-tenant-id': session.defaultTenantId ?? session.default_tenant_id ?? 'xevn',
    'x-company-id': session.defaultCompanyId ?? session.default_company_id ?? 'main',
  };

  lines.push(`## Portal proxy probes`, ``, `| ID | HTTP | code | message |`, `|----|------|------|---------|`);

  let fail = 0;
  for (const p of probes) {
    const r = await get(`${PORTAL}${p.path}`, headers);
    const ok = r.status >= 200 && r.status < 300;
    if (!ok) fail++;
    lines.push(`| ${p.id} | ${r.status} | ${r.code ?? '-'} | ${(r.message ?? '').slice(0, 80)} |`);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${p.id} ${r.status} ${r.code ?? ''}`);
  }

  lines.push(``, `## HRM direct (no portal)`, ``);
  try {
    const h = await get(`${HRM}/api/hrm/`, {});
    lines.push(`- GET /api/hrm/ → **${h.status}**`);
  } catch (e) {
    lines.push(`- HRM **DOWN**: ${e.message}`);
    fail++;
  }

  lines.push(``, `## Summary`, ``, `- Fail count: **${fail}**`, `- Pass: **${probes.length - fail}** / ${probes.length}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log(`\nWrote ${outFile}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
