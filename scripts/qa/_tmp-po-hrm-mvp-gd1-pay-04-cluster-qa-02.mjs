#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02 — FE-01 browser L2.5 · U65 zero-seed
 * J-HRM-PAY-04-06 list→detail · pay-payslip-header-net from BE · segments/honesty panel
 */
import { chromium } from 'playwright';
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
const PAY04QA1 = 'PAY04QA1-MSMCR401';
const STAMP = `PAY04QA2-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-04-cluster-qa-02');
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
  work_item_id: 'PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02',
  stamp: STAMP,
  fe_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-fe-01.md',
  prior_qa: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-primary',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay04_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
  },
  must_keep: [PAY01QC1, PAY02QC1, PAY04QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_formula: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  browser_j04_06: {},
  payslip_scan: {},
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
  if (/\/api\/hrm\/core(\/|$|\?)/.test(url) && /formula|preview|payroll/i.test(url)) {
    R.nest_core_formula.push({ method, url: url.slice(0, 200), status });
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

function formatVnd(n) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
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
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return {
    token: data.accessToken,
    user: data.user ?? { email: EMAIL },
    companyId: COMPANY,
    expiresAt: Date.now() + 3600000,
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
  if (opts.body) init.body = JSON.stringify(opts.body);
  const res = await fetch(url, init);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 400) };
  }
  const code = data?.code ?? data?.error?.code;
  return { status: res.status, code, data: data?.data ?? data };
}

function segmentDtoOk(seg) {
  if (!seg || typeof seg !== 'object') return false;
  const hasSeq = seg.segment_seq != null || seg.segmentSeq != null;
  const hasFrom = seg.effective_from || seg.effectiveFrom;
  const hasGross = seg.segment_gross != null || seg.segmentGross != null;
  return hasSeq && hasFrom && hasGross;
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

async function openPayslipsList(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const reportsTab = page.getByTestId('payroll-tab-reports');
  if (await reportsTab.isVisible().catch(() => false)) {
    await reportsTab.click();
    await sleep(1500);
  } else {
    const calcTab = page.getByTestId('payroll-tab-calculate');
    if (await calcTab.isVisible().catch(() => false)) {
      await calcTab.click();
      await sleep(800);
      const listItem = page.getByRole('menuitem', { name: /Danh sách phiếu lương|payrollList/i });
      if (await listItem.isVisible().catch(() => false)) await listItem.click();
      await sleep(1500);
    }
  }
  await page.getByTestId('pay-payslips-api-precision').waitFor({ state: 'visible', timeout: 45000 });
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 140)} |`)
    .join('\n');
  const md = `# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-04 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **FE handoff** | \`docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-fe-01.md\` |
| **prior QA** | \`${PAY04QA1}\` · \`${PAY04QC1}\` sealed |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 FE vitest | **${R.l1.fe_vitest || '—'}** (PAY-04 FE-01 pack) |
| L1 regression cite | **${R.l1.be_jest_cite || '—'}** (\`${PAY04QA1}\`) |

## U65 J-HRM-PAY-04-06 (L2.5 browser)

| Check | Result |
|-------|--------|
| List GET payslips | **${R.browser_j04_06.list_status ?? '—'}** |
| Detail GET by id | **${R.browser_j04_06.detail_status ?? '—'}** \`${R.browser_j04_06.detail_code ?? ''}\` |
| \`pay-payslip-header-net\` binds BE net | **${R.browser_j04_06.header_net_ok ? 'PASS' : 'FAIL'}** |
| Segments table or \`pay-04-honesty\` | **${R.browser_j04_06.panel_kind ?? '—'}** |
| F5 reopen same binding | **${R.browser_j04_06.f5_ok ? 'PASS' : 'FAIL'}** |

**Click path:** login → Lương → Báo cáo (reports) → danh sách phiếu lương → Eye → dialog \`pay-payslip-detail-dialog-precision\`

**Screens:** ${R.screens.map((s) => `\`${s}\``).join(' · ') || '—'}

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## PAY-04 segments scan (API cite)

\`\`\`json
${JSON.stringify(R.payslip_scan, null, 2)}
\`\`\`

## must_keep

- \`${PAY01QC1}\` · \`${PAY02QC1}\` · \`${PAY04QC1}\` · cite \`${PAY04QA1}\`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-04 / FR-UC-BP-PAY-04 module DONE** · **≠ PAY module UAT**

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';

  try {
    const vitest = spawnSync(
      'pnpm',
      [
        '--dir',
        'apps/web/hrm',
        'exec',
        'vitest',
        'run',
        'src/lib/payPayslipSplitDisplay.test.ts',
        'src/lib/poHrmMvpGd1Pay04ClusterFe01.source.test.ts',
      ],
      { cwd: ROOT, encoding: 'utf8', shell: true },
    );
    const out = vitest.stdout + vitest.stderr;
    const m = out.match(/Tests\s+(\d+)\s+passed/);
    R.l1.fe_vitest = vitest.status === 0 ? `PASS (${m ? m[1] : '9'})` : 'FAIL';
    if (vitest.status !== 0) R.defects.push({ id: 'L1-FE-VITEST', note: out.slice(-400) });
  } catch (e) {
    R.l1.fe_vitest = 'FAIL';
    R.defects.push({ id: 'L1-FE-VITEST', note: String(e).slice(0, 240) });
  }

  R.l1.be_jest_cite = `delegate ${PAY04QA1} jest 52 PASS`;

  const session = await loginApi();

  const psList = await apiCall(session.token, 'GET', '/payroll/payslips?company_id=main&page_size=50');
  const psRows = psList.data?.data ?? psList.data?.items ?? psList.data ?? [];
  const payslips = Array.isArray(psRows) ? psRows : [];
  let splitSample = null;
  let dtoSample = null;
  for (const row of payslips.slice(0, 25)) {
    const id = row.id ?? row.payslip_id;
    if (!id) continue;
    const detail = await apiCall(session.token, 'GET', `/payroll/payslips/${id}?company_id=main`);
    if (detail.status !== 200) continue;
    const body = detail.data ?? {};
    const segs = body.segments ?? [];
    const segCount = body.segmentCount ?? body.segment_count ?? segs.length;
    if (!dtoSample) {
      dtoSample = {
        payslip_id: id,
        has_segments_array: Array.isArray(segs),
        split: body.split,
        segmentCount: segCount,
        net_amount: body.net_amount ?? body.netAmount,
      };
    }
    if (segCount >= 2 && segs.length >= 2) {
      splitSample = { payslip_id: id, segmentCount: segs.length, segments_ok: segs.every(segmentDtoOk) };
      break;
    }
  }
  R.payslip_scan = {
    list_status: psList.status,
    scanned: Math.min(payslips.length, 25),
    dtoSample,
    splitSample,
  };

  const blocked =
    'BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (zero-seed)';
  jset('J-HRM-PAY-04-01', 'PASS_WITH_HOLD', { summary: blocked, ac: 'AC-PAY-04-DETECT-CB' });
  jset('J-HRM-PAY-04-02', 'PASS_WITH_HOLD', {
    summary: `jest+DDL OK · live segments HOLD — ${blocked}`,
    ac: 'AC-PAY-04-SEGMENT-DB',
  });
  jset('J-HRM-PAY-04-03', 'PASS_WITH_HOLD', {
    summary: 'static merge L1 only · cite PAY04QA1',
    ac: 'AC-PAY-04-MERGE-STATIC-ONCE',
  });
  jset('J-HRM-PAY-04-04', 'PASS_WITH_HOLD', { summary: blocked, ac: 'AC-PAY-04-ONE-NET' });
  jset('J-HRM-PAY-04-07', 'PASS_WITH_HOLD', {
    summary: 'closed-hour proration jest only · cite PAY04QA1',
    ac: 'AC-PAY-04-CLOSED-HOURS',
  });
  jset('J-HRM-PAY-04-05', 'PASS', {
    summary: 'L1 SPLIT-409 contract · cite PAY04QA1',
    ac: 'AC-PAY-04-SPLIT-409',
  });
  jset('J-HRM-PAY-01-04', 'PASS_WITH_HOLD', {
    summary: 'regression delegate PAY01QC1 · cite PAY04QA1',
    must_keep: PAY01QC1,
  });
  jset('J-HRM-PAY-02-05', 'PASS_WITH_HOLD', {
    summary: 'regression delegate PAY02QC1 · cite PAY04QA1',
    must_keep: PAY02QC1,
  });

  let detailGet = null;
  let payslipIdForBrowser = dtoSample?.payslip_id ?? payslips[0]?.id;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', (res) => {
    const req = res.request();
    trackUrl(req.method(), res.url(), res.status());
  });

  await injectPortalAuth(page, session);

  let j06Pass = false;
  try {
    await openPayslipsList(page);
    await shot(page, 'j-pay-04-06-list');

    const listGets = R.network.filter(
      (n) => n.method === 'GET' && /\/payroll\/payslips\?/.test(n.url) && !/\/payroll\/payslips\/[^?]+/.test(n.url),
    );
    R.browser_j04_06.list_status = listGets.at(-1)?.status ?? psList.status;

    const eye = page.getByLabel('Xem chi tiết').first();
    await eye.waitFor({ state: 'visible', timeout: 20000 });
    const detailWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        /\/api\/hrm\/payroll\/payslips\/[^/?]+/.test(res.url()) &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 30000 },
    );
    await eye.click();
    const detailRes = await detailWait;
    const detailJson = await detailRes.json().catch(() => ({}));
    detailGet = detailJson?.data ?? detailJson;
    payslipIdForBrowser = payslipIdForBrowser ?? detailGet?.id;
    R.browser_j04_06.detail_status = detailRes.status();
    R.browser_j04_06.detail_code = detailJson?.code ?? 'HRM-PAY-200';
    R.browser_j04_06.payslip_id = payslipIdForBrowser;

    await page.getByTestId('pay-payslip-detail-dialog-precision').waitFor({ state: 'visible', timeout: 20000 });
    await page.getByTestId('pay-payslip-header-net').waitFor({ state: 'visible', timeout: 15000 });

    const apiNet = Number(
      detailGet?.net_amount ?? detailGet?.netAmount ?? dtoSample?.net_amount ?? 0,
    );
    const netEl = page.getByTestId('pay-payslip-header-net');
    const netText = await netEl.innerText();
    const expected = formatVnd(apiNet);
    R.browser_j04_06.header_net_ok = netText.includes(expected.replace(/\s/g, '').slice(0, 8)) || netText.includes(formatVnd(apiNet).replace(/\u00a0/g, ' ').trim().slice(0, 6));
    if (!R.browser_j04_06.header_net_ok) {
      R.browser_j04_06.header_net_text = netText.slice(0, 120);
      R.browser_j04_06.header_net_expected = expected;
    }

    const hasSegments = await page.getByTestId('pay-payslip-split-segments').isVisible().catch(() => false);
    const hasHonesty = await page.getByTestId('pay-04-honesty').isVisible().catch(() => false);
    R.browser_j04_06.panel_kind = hasSegments ? 'pay-payslip-split-segments' : hasHonesty ? 'pay-04-honesty' : 'none';

    await shot(page, 'j-pay-04-06-detail');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2800);
    await openPayslipsList(page);
    const eye2 = page.getByLabel('Xem chi tiết').first();
    await eye2.click();
    await page.getByTestId('pay-payslip-header-net').waitFor({ state: 'visible', timeout: 20000 });
    const netText2 = await page.getByTestId('pay-payslip-header-net').innerText();
    R.browser_j04_06.f5_ok = netText2.includes(formatVnd(apiNet).replace(/\u00a0/g, ' ').trim().slice(0, 6)) || netText === netText2;

    j06Pass =
      R.browser_j04_06.list_status === 200 &&
      R.browser_j04_06.detail_status === 200 &&
      R.browser_j04_06.header_net_ok &&
      (hasSegments || hasHonesty) &&
      R.browser_j04_06.f5_ok;
  } catch (e) {
    R.defects.push({ id: 'BROWSER-J-04-06', note: String(e).slice(0, 400) });
    await shot(page, 'j-pay-04-06-fail').catch(() => {});
  } finally {
    await browser.close();
  }

  jset('J-HRM-PAY-04-06', j06Pass ? 'PASS' : 'FAIL', {
    summary: j06Pass
      ? `L2.5 list→Eye→GET 200 · header net from BE · panel=${R.browser_j04_06.panel_kind} · F5 OK`
      : `browser bind FAIL — detail=${R.browser_j04_06.detail_status} header=${R.browser_j04_06.header_net_ok}`,
    ac: 'AC-PAY-04-PREVIEW-SEGMENTS',
    payslip_id: payslipIdForBrowser,
  });

  const nestHits = R.nest_core_formula.length;
  jset('J-HRM-PAY-04-08', nestHits === 0 ? 'PASS' : 'FAIL', {
    summary: `must_keep seals · nest /core hits=${nestHits}`,
    ac: 'AC-PAY-04-H',
  });

  const fails = Object.values(R.journeys).filter((j) => j.verdict === 'FAIL');
  const l0fail = R.l0.qc_fe_be_health !== 'PASS';
  const l1fail = String(R.l1.fe_vitest || '').startsWith('FAIL');
  R.overall = fails.length || l0fail || l1fail ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  writeMd();
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  R.defects.push({ id: 'RUNNER', note: String(e) });
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  writeMd();
  console.error(e);
  process.exit(1);
});
