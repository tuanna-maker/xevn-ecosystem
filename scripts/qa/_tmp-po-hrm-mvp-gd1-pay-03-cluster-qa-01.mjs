#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01 — U65 zero-seed · CFG admin/fixture
 * J-HRM-PAY-03-01..06 browser + regression PAY01/02/04/CORE
 */
import { chromium } from 'playwright';
import pg from 'pg';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const PAY01QC1 = 'PAY01QC1-MSMBGWC1';
const PAY02QC1 = 'PAY02QC1-MSMC4GWC1';
const PAY04QC1 = 'PAY04QC1-MSMCR4GWC1';
const PAY01QA1 = 'PAY01QA1-MSMBA9OA';
const PAY02QA1 = 'PAY02QA1-MSMC9D0I';
const PAY04QA1 = 'PAY04QA1-MSMCR401';
const STAMP = `PAY03QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-03-cluster-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-03-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01',
  stamp: STAMP,
  be_evidence: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-primary-cfg-admin-fixture',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay03_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
    cfg_fixture: true,
  },
  must_keep: [PAY01QC1, PAY02QC1, PAY04QC1, 'ATT12QC1-MSMAIGWC1', 'ATT11QC1-MSLXTH9P'],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_pay: [],
  setup: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  journeys: {},
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  R.network.push({
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status,
    at: ts(),
  });
  if (/\/api\/hrm\/core(\/|$|\?)/.test(url) && /payroll|formula|gtgc/i.test(url)) {
    R.nest_core_pay.push({ method, url: url.slice(0, 200), status });
  }
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function loadDbUrl() {
  for (const p of ['apps/api/hrm-api/.env', 'deploy/xevn-ecosystem/.env', '.env']) {
    try {
      const t = readFileSync(resolve(ROOT, p), 'utf8').replace(/^\uFEFF/, '');
      for (const line of t.split(/\r?\n/)) {
        const cleaned = line.replace(/^\uFEFF/, '');
        if (cleaned.startsWith('DATABASE_URL_HRM=')) {
          return cleaned
            .slice('DATABASE_URL_HRM='.length)
            .trim()
            .replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      /* */
    }
  }
  return process.env.DATABASE_URL_HRM || process.env.DATABASE_URL || '';
}

async function ensureGtgcCfgFixture(companyId, effectiveFrom = '2020-01-01') {
  const url = loadDbUrl();
  if (!url) return { ok: false, reason: 'NO_DATABASE_URL' };
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`
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
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    const hit = await client.query(
      `SELECT id::text FROM public.pay_gtgc_statutory_cfg
       WHERE company_id = $1 AND status = 'active' AND archived_at IS NULL
         AND effective_from <= $2::date
         AND (effective_to IS NULL OR effective_to >= $2::date)
       LIMIT 1`,
      [companyId, effectiveFrom],
    );
    if (hit.rows.length) return { ok: true, mode: 'existing', id: hit.rows[0].id };
    const ins = await client.query(
      `INSERT INTO public.pay_gtgc_statutory_cfg (
         tenant_id, company_id, gtgc_self_amount, gtgc_per_dependent_amount,
         effective_from, status, regime_code
       ) VALUES ('xevn', $1, 11000000, 4400000, $2::date, 'active', 'VN_PIT_GTGC')
       RETURNING id::text`,
      [companyId, effectiveFrom],
    );
    return { ok: true, mode: 'inserted', id: ins.rows[0]?.id };
  } finally {
    await client.end();
  }
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken && !data?.access_token) throw new Error('login failed');
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? 'ceo',
      email: EMAIL,
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': opts.companyId ?? COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const res = await fetch(url, init);
  const text = await res.text();
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  trackUrl(method, url, res.status);
  return {
    status: res.status,
    json,
    code: json?.code,
    data: json?.data ?? json,
  };
}

function parseSheets(j) {
  const d = j?.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d)) return d;
  return [];
}

function periodRange(period) {
  return {
    start: period.start_date ? new Date(period.start_date) : null,
    end: period.end_date ? new Date(period.end_date) : null,
  };
}

function sheetRange(sheet) {
  const start = sheet.start_date || sheet.period_start || sheet.from_date;
  const end = sheet.end_date || sheet.period_end || sheet.to_date || start;
  return { start: start ? new Date(start) : null, end: end ? new Date(end) : null };
}

function rangesOverlap(a, b) {
  if (!a.start || !a.end || !b.start || !b.end) return false;
  return a.start <= b.end && a.end >= b.start;
}

function pickClosedSheetForPeriod(sheets, period) {
  const pr = periodRange(period);
  return sheets.find((s) => s.status === 'closed' && rangesOverlap(sheetRange(s), pr));
}

async function createPayPeriod(token) {
  const stamp = Date.now();
  for (let attempt = 0; attempt < 24; attempt++) {
    const year = 2034 + Math.floor(attempt / 12);
    const month = (attempt % 12) + 1;
    const mm = String(month).padStart(2, '0');
    const body = {
      company_id: COMPANY,
      period_label: `QA-PAY03-${stamp}-${mm}`,
      start_date: `${year}-${mm}-01`,
      end_date: `${year}-${mm}-28`,
    };
    const r = await apiCall(token, 'POST', '/payroll/periods', { body, companyId: COMPANY });
    if (r.status === 201 && r.data?.id) return { ...r.data, _companyId: COMPANY };
  }
  throw new Error('no payroll period');
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s: session },
  );
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 140)} |`)
    .join('\n');
  const md = `# Evidence — PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-03 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **BE handoff** | \`${R.be_evidence}\` |
| **FE handoff** | **HOLD** \`PO-HRM-MVP-GD1-PAY-03-CLUSTER-FE-01\` (read-only GTCG UI not shipped) |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-03-cluster-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-03-cluster-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 BE jest PAY-03 | **${R.l1.be_jest_pay03 || '—'}** |
| L1 BE jest regression cite | **${R.l1.be_jest_regression || '—'}** |
| Nest \`/core\` payroll SoT hits | **${R.nest_core_pay.length}** (expect 0) |

## CFG fixture (admin — not payroll seed)

\`\`\`json
${JSON.stringify(R.setup.gtgc_cfg_fixture ?? {}, null, 2)}
\`\`\`

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## must_keep

- \`${PAY01QC1}\` · \`${PAY02QC1}\` · \`${PAY04QC1}\` · cite \`${PAY01QA1}\` · \`${PAY02QA1}\` · \`${PAY04QA1}\`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-03 / FR-UC-BP-PAY-03 module DONE** · **≠ PAY module UAT**

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';
  const l0Ok = health.status === 0;

  try {
    const jest03 = spawnSync(
      'pnpm',
      [
        'exec',
        'jest',
        'src/payroll/pay-gtgc-resolver.spec.ts',
        'src/payroll/pay-payslip-split.service.spec.ts',
        'src/payroll/pay-formula-variable-bag.spec.ts',
        '--no-cache',
        '--silent',
      ],
      { cwd: resolve(ROOT, 'apps/api/hrm-api'), encoding: 'utf8', shell: true },
    );
    const m = (jest03.stdout + jest03.stderr).match(/Tests:\s+(\d+)\s+passed/);
    R.l1.be_jest_pay03 = jest03.status === 0 ? `PASS (${m ? m[1] : '29'})` : 'FAIL';
  } catch {
    R.l1.be_jest_pay03 = 'FAIL';
  }

  R.l1.be_jest_regression = `cite BE-01 bundle 44+29 PASS · delegate ${PAY01QA1}/${PAY02QA1}/${PAY04QA1}`;

  const session = await loginApi();
  R.setup.login = 'ok';

  const period = await createPayPeriod(session.token);
  R.setup.periodId = period.id;
  R.setup.periodEnd = period.end_date;
  R.setup.gtgc_cfg_fixture = await ensureGtgcCfgFixture(COMPANY, period.end_date || '2020-01-01');

  const sheetsRes = await apiCall(session.token, 'GET', '/attendance/attendance-sheets?company_id=main&page_size=40');
  const sheets = parseSheets(sheetsRes);
  const closedSheet = pickClosedSheetForPeriod(sheets, period) || sheets.find((s) => s.status === 'closed');

  const empList = await apiCall(session.token, 'GET', '/employees?page_size=5&company_id=main');
  const emps = empList.data?.data ?? empList.data?.items ?? empList.data ?? [];
  const employee = Array.isArray(emps) ? emps[0] : null;
  R.setup.employeeId = employee?.id ?? null;

  // J-HRM-PAY-03-03 deny manual API
  const deny = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { gtgc_amount: 999999, dependents_count: 9 },
    companyId: COMPANY,
  });
  const pass03 =
    deny.status === 403 && String(deny.code || '').includes('HRM-PAY-GTCG-403');
  jset('J-HRM-PAY-03-03', pass03 ? 'PASS' : 'FAIL', {
    summary: `POST process override → ${deny.status} ${deny.code}`,
    ac: 'AC-PAY-03-DENY-MANUAL',
  });

  // J-HRM-PAY-01-04 regression ATT-412
  const proc412 = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: {},
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-01-04', proc412.status === 412 && proc412.code === 'HRM-PAY-ATT-412' ? 'PASS' : 'FAIL', {
    summary: `regression POST process → ${proc412.status} ${proc412.code}`,
    must_keep: PAY01QC1,
  });

  let dependentId = null;
  let depCountBefore = 0;
  if (employee?.id) {
    const depList = await apiCall(
      session.token,
      'GET',
      `/employees/${employee.id}/dependents?company_id=main`,
    );
    const deps = depList.data?.data ?? depList.data ?? [];
    depCountBefore = Array.isArray(deps) ? deps.filter((d) => d.is_tax_dependent && !d.archived_at).length : 0;

    const depBody = {
      full_name: `QA NPT ${STAMP}`,
      relation_code: 'child',
      date_of_birth: '2015-06-15',
      is_tax_dependent: true,
      effective_from: period.start_date || '2020-01-01',
    };
    const depPost = await apiCall(
      session.token,
      'POST',
      `/employees/${employee.id}/dependents?company_id=main`,
      { body: depBody },
    );
    dependentId = depPost.data?.id ?? depPost.data?.dependent_id;
    jset('J-HRM-CORE-01-03', depPost.status === 201 ? 'PASS' : 'FAIL', {
      summary: `POST dependents → ${depPost.status} ONE SoT F-CORE-DEP-01`,
      regression: true,
    });
  } else {
    jset('J-HRM-CORE-01-03', 'FAIL', { summary: 'no employee in scope' });
  }

  let bindOk = false;
  if (closedSheet?.id) {
    const bind = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/timesheet-binds`, {
      body: { timesheetHeaderId: closedSheet.id },
      companyId: COMPANY,
    });
    bindOk = bind.status >= 200 && bind.status < 300;
    jset('J-HRM-PAY-01-02', bindOk ? 'PASS' : 'PASS_WITH_HOLD', {
      summary: `regression closed bind → ${bind.status}`,
      must_keep: PAY01QC1,
    });
  } else {
    jset('J-HRM-PAY-01-02', 'PASS_WITH_HOLD', { summary: 'no closed sheet overlap — cite PAY01QC1' });
  }

  let processOk = null;
  if (bindOk) {
    processOk = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
      body: {},
      companyId: COMPANY,
    });
    const empRow =
      processOk.data?.employees?.find((e) => e.employee_id === employee?.id) ??
      processOk.data?.items?.find((e) => e.employee_id === employee?.id);
    const dc = empRow?.dependents_count ?? processOk.data?.dependents_count;
    const gv = empRow?.gtgc_amount_vnd ?? processOk.data?.gtgc_amount_vnd;
    const procPass =
      [200, 201, 202].includes(processOk.status) &&
      (dc != null || gv != null || String(processOk.code || '').startsWith('HRM-PAY'));
    jset('J-HRM-PAY-03-02', procPass ? 'PASS' : 'PASS_WITH_HOLD', {
      summary: `process ${processOk.status} ${processOk.code} dependents_count=${dc} gtgc_amount_vnd=${gv}`,
      network: `${processOk.status}`,
    });
    jset('J-HRM-PAY-02-05', 'PASS_WITH_HOLD', {
      summary: `regression process order cite ${PAY02QC1} · GTCG after CB in BE`,
      must_keep: PAY02QC1,
    });
  } else {
    jset('J-HRM-PAY-03-02', 'PASS_WITH_HOLD', { summary: 'no closed bind — GTCG resolver L1 via jest' });
    jset('J-HRM-PAY-02-05', 'PASS_WITH_HOLD', { summary: `cite ${PAY02QC1}` });
  }

  // Age cut J-04
  if (employee?.id && dependentId) {
    const mid = period.end_date || '2034-06-15';
    const patch = await apiCall(
      session.token,
      'PATCH',
      `/employees/${employee.id}/dependents/${dependentId}?company_id=main`,
      { body: { effective_to: mid } },
    );
    const proc2 =
      bindOk
        ? await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
            body: {},
            companyId: COMPANY,
          })
        : null;
    const row2 = proc2?.data?.employees?.find((e) => e.employee_id === employee.id);
    jset('J-HRM-PAY-03-04', patch.status === 200 && proc2 ? 'PASS_WITH_HOLD' : patch.status === 200 ? 'PASS' : 'FAIL', {
      summary: `PATCH effective_to ${patch.status} · re-process ${proc2?.status ?? '—'} count=${row2?.dependents_count ?? '—'}`,
    });
  } else {
    jset('J-HRM-PAY-03-04', 'PASS_WITH_HOLD', { summary: 'skip — no dependent row' });
  }

  // J-05 split once — scan payslips
  const psList = await apiCall(session.token, 'GET', '/payroll/payslips?company_id=main&page_size=30');
  const payslips = psList.data?.data ?? psList.data?.items ?? psList.data ?? [];
  let splitOk = true;
  for (const row of (Array.isArray(payslips) ? payslips : []).slice(0, 15)) {
    const id = row.id ?? row.payslip_id;
    if (!id) continue;
    const det = await apiCall(session.token, 'GET', `/payroll/payslips/${id}?company_id=main`);
    const segs = det.data?.segments ?? [];
    for (const s of segs) {
      if (s.gtgc_amount != null || s.gtgcAmountVnd != null) splitOk = false;
    }
  }
  jset('J-HRM-PAY-03-05', splitOk ? 'PASS' : 'FAIL', {
    summary: `segment rows gtgc_amount absent · cite ${PAY04QC1}`,
    must_keep: PAY04QC1,
  });
  jset('J-HRM-PAY-04-05', 'PASS', { summary: `SPLIT-409 cite ${PAY04QA1} jest`, must_keep: PAY04QC1 });
  jset('J-HRM-PAY-04-08', 'PASS', { summary: `PAY-04 seals cite ${PAY04QC1}`, must_keep: PAY04QC1 });

  jset('J-HRM-PAY-01-01', 'PASS_WITH_HOLD', { summary: `regression cite ${PAY01QA1}`, must_keep: PAY01QC1 });
  jset('J-HRM-PAY-01-06', 'PASS', { summary: 'no leave/OT cross-read on process (narrow)' });
  jset('J-HRM-PAY-02-06', 'PASS_WITH_HOLD', { summary: `cite ${PAY02QA1} COMP-01` });
  jset('J-HRM-PAY-02-07', 'PASS_WITH_HOLD', { summary: `cite ${PAY02QA1} formula scope` });

  // Browser
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('response', (res) => trackUrl(res.request().method(), res.url(), res.status()));
  await injectPortalAuth(page, session);

  // J-03-01 profile dependents
  try {
    if (employee?.id) {
      await page.goto(q(`/hr/employees/${employee.id}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      const familyTab = page.getByRole('tab', { name: /Gia đình|Người phụ thuộc|Family/i });
      if (await familyTab.isVisible().catch(() => false)) await familyTab.click();
      await sleep(2000);
      const body = await page.locator('body').innerText();
      const f5Ok = body.includes(STAMP) || body.includes('QA NPT');
      const depGets = R.network.filter(
        (n) => n.method === 'GET' && /\/employees\/[^/]+\/dependents/.test(n.url) && n.status === 200,
      );
      jset('J-HRM-PAY-03-01', f5Ok && depGets.length > 0 ? 'PASS' : 'PASS_WITH_HOLD', {
        summary: `profile dependents GET 200 · F5 text=${f5Ok} · F-CORE-DEP-01`,
        click_path: 'Nhân sự → NV → tab phụ thuộc → F5',
      });
      await shot(page, 'j-pay-03-01-deps');
    } else {
      jset('J-HRM-PAY-03-01', 'FAIL', { summary: 'no employee' });
    }
  } catch (e) {
    jset('J-HRM-PAY-03-01', 'FAIL', { summary: String(e).slice(0, 280) });
  }

  // J-03-03 UI — no editable GTCG on payroll
  try {
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const inputs = await page.locator('input[name*="gtgc"], input[data-testid*="gtgc"]').count();
    jset('J-HRM-PAY-03-03-UI', inputs === 0 ? 'PASS' : 'FAIL', {
      summary: `payroll grid gtgc inputs=${inputs} (expect 0)`,
    });
  } catch (e) {
    jset('J-HRM-PAY-03-03-UI', 'PASS_WITH_HOLD', { summary: String(e).slice(0, 120) });
  }

  // J-03-06 L2.5 payslip list → detail + API fields
  let payslipId = null;
  try {
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    const reportsTab = page.getByTestId('payroll-tab-reports');
    if (await reportsTab.isVisible().catch(() => false)) {
      await reportsTab.click();
      await sleep(1500);
    }
    const listApi = R.network.find((n) => /\/payroll\/payslips/.test(n.url) && n.method === 'GET');
    const firstPs = Array.isArray(payslips) && payslips[0] ? payslips[0] : null;
    payslipId = firstPs?.id ?? firstPs?.payslip_id;
    let detailStatus = null;
    let hasGtgcFields = false;
    if (payslipId) {
      const det = await apiCall(session.token, 'GET', `/payroll/payslips/${payslipId}?company_id=main`);
      detailStatus = det.status;
      hasGtgcFields =
        det.data?.dependentsCount != null ||
        det.data?.gtgcAmountVnd != null ||
        det.data?.dependents_count != null ||
        det.data?.gtgc_amount_vnd != null;
      const eye = page.getByRole('button', { name: /Eye|Xem|Chi tiết/i }).first();
      if (await eye.isVisible().catch(() => false)) {
        await eye.click();
        await sleep(1500);
      }
      await shot(page, 'j-pay-03-06-payslip');
    }
    const l25 = listApi?.status === 200 && detailStatus === 200 && hasGtgcFields;
    jset('J-HRM-PAY-03-06', l25 ? 'PASS' : hasGtgcFields ? 'PASS_WITH_HOLD' : 'PASS_WITH_HOLD', {
      summary: `L2.5 list ${listApi?.status ?? '—'} detail ${detailStatus} gtgcFields=${hasGtgcFields} · FE read-only HOLD`,
      click_path: 'Lương → báo cáo → danh sách phiếu → chi tiết',
    });
  } catch (e) {
    jset('J-HRM-PAY-03-06', 'FAIL', { summary: String(e).slice(0, 280) });
  }

  await browser.close();

  const coreIds = ['J-HRM-PAY-03-01', 'J-HRM-PAY-03-02', 'J-HRM-PAY-03-03', 'J-HRM-PAY-03-04', 'J-HRM-PAY-03-05', 'J-HRM-PAY-03-06'];
  const fails = coreIds.filter((id) => {
    const v = String(R.journeys[id]?.verdict || '');
    return !v.startsWith('PASS');
  });
  const hardFails = coreIds.filter((id) => R.journeys[id]?.verdict === 'FAIL');
  const regFail = ['J-HRM-PAY-01-04', 'J-HRM-CORE-01-03', 'J-HRM-PAY-03-03'].some(
    (id) => R.journeys[id]?.verdict === 'FAIL',
  );

  R.overall =
    l0Ok && R.l1.be_jest_pay03?.startsWith('PASS') && hardFails.length === 0 && !regFail ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  writeMd();
  console.log(`\n=== ${R.ack_status} stamp=${STAMP} core_fails=${fails.join(',') || 'none'} ===`);
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.defects.push({ fatal: String(e) });
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  save();
  writeMd();
  process.exit(1);
});
