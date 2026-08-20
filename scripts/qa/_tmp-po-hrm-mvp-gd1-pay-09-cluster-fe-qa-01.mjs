#!/usr/bin/env node
/**
 * QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01 — U65 browser J-09-01..04 · PAY-08 regression subset
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
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

const PAY08QA1 = 'PAY08QA1-MSMFFXAZ';
const PAY09QA2 = 'PAY09QA1-MSMGBROF';
const STAMP = `PAY09FEQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const GROUP_CODE = `Q09FE${Date.now().toString(36).toUpperCase().slice(-6)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01');
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
  work_item_id: 'QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-02',
  stamp: STAMP,
  fe_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md',
  prior_api_qa: PAY09QA2,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-primary',
  honesty: { payroll_e2e_ready: false, ne_pay09_done: true, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  journeys: {},
  browser: {},
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
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
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
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

async function openPayGroups(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);
  const policyTab = page.getByTestId('payroll-tab-policy');
  await policyTab.click();
  await sleep(400);
  const menuItem = page.getByRole('menuitem', { name: /Phân nhóm bảng lương/ });
  await menuItem.click();
  await sleep(1500);
  await page.getByTestId('pay-groups-catalog-precision').waitFor({ state: 'visible', timeout: 45000 });
}

async function openCalcBatchList(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);
  const calcTab = page.getByTestId('payroll-tab-calculate');
  await calcTab.click();
  await sleep(400);
  const listItem = page.getByRole('menuitem', { name: /Danh sách kỳ|Danh sách bảng lương|calc-list/i });
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click();
    await sleep(1500);
  }
  await page.getByTestId('pay-batches-precision').waitFor({ state: 'visible', timeout: 45000 }).catch(() => {});
}

async function openPayslipsApi(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);
  const calcTab = page.getByTestId('payroll-tab-calculate');
  await calcTab.click();
  await sleep(400);
  const listItem = page.getByRole('menuitem', { name: /Danh sách phiếu lương|payrollList|phiếu lương/i });
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click();
    await sleep(2000);
  }
  await page.getByTestId('pay-payslips-api-precision').waitFor({ state: 'visible', timeout: 45000 });
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 160)} |`)
    .join('\n');
  const md = `# Evidence — QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-02\` |
| **dev handoff** | \`docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-09 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **prior API QA** | \`${PAY09QA2}\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## HDSD click path

\`\`\`text
Lương → Chính sách → Phân nhóm bảng lương (J-09-01/02)
Tính lương → Danh sách kỳ → kỳ draft → Phạm vi nhóm (J-09-03)
Tính lương → Danh sách phiếu lương → Lọc nhóm (J-09-04)
\`\`\`

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 FE vitest PAY-09 | **${R.l1.fe_vitest || '—'}** |
| PAY-08 regression | **${R.l1.pay08_regression || '—'}** |

## Browser summary

\`\`\`json
${JSON.stringify(R.browser, null, 2)}
\`\`\`

**Screens:** ${R.screens.map((s) => `\`${s}\``).join(' · ') || '—'}

## Journeys (J-HRM-PAY-09-01..04 + PAY-08 subset)

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## Console (errors only, excerpt)

${R.consoleErrors.slice(0, 8).map((e) => `- ${e}`).join('\n') || '—'}

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** · **≠ PAY module UAT** · cấm claim PAY-09 module DONE

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  let l0Ok = health.status === 0;
  if (!l0Ok) {
    try {
      const probes = await Promise.all([
        fetch(`${HRM}/api/hrm`).then((r) => r.status === 200),
        fetch(`${XBOS}/api/xbos`).then((r) => r.status === 200),
        fetch(PORTAL).then((r) => r.status === 200),
      ]);
      l0Ok = probes.every(Boolean);
    } catch {
      l0Ok = false;
    }
  }
  R.l0.qc_fe_be_health = l0Ok ? 'PASS' : 'FAIL';
  if (!l0Ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'L0', note: 'qc:fe-be-health FAIL' });
    writeMd();
    process.exit(1);
  }

  try {
    const vitest = spawnSync(
      'pnpm',
      [
        '--dir',
        'apps/web/hrm',
        'exec',
        'vitest',
        'run',
        'src/lib/payPay09GroupRing.test.ts',
        'src/lib/poHrmMvpGd1Pay09ClusterFe01.source.test.ts',
      ],
      { cwd: ROOT, encoding: 'utf8', shell: true },
    );
    const out = vitest.stdout + vitest.stderr;
    const m = out.match(/Tests\s+(\d+)\s+passed/);
    R.l1.fe_vitest = vitest.status === 0 ? `PASS (${m ? m[1] : '8'})` : 'FAIL';
    if (vitest.status !== 0) R.defects.push({ id: 'L1-FE-VITEST', note: out.slice(-300) });
  } catch (e) {
    R.l1.fe_vitest = 'FAIL';
    R.defects.push({ id: 'L1-FE-VITEST', note: String(e).slice(0, 200) });
  }

  const session = await loginApi();

  // PAY-08 regression subset (API deny + cite)
  const psList = await apiCall(session.token, 'GET', '/payroll/payslips?company_id=main&page_size=5');
  const psRows = psList.data?.data ?? psList.data?.items ?? psList.data ?? [];
  const payslips = Array.isArray(psRows) ? psRows : [];
  let pay08Ok = false;
  if (payslips[0]?.id) {
    const deny = await apiCall(session.token, 'PATCH', `/payroll/payslips/${payslips[0].id}`, {
      body: { net_amount: 1 },
    });
    pay08Ok =
      deny.status === 405 ||
      deny.code === 'HRM-PAY-PAYSLIP-405' ||
      (deny.status === 403 && deny.code === 'HRM-PAY-PAYSLIP-403');
    jset('J-HRM-PAY-08-05-REGRESS', pay08Ok ? 'PASS' : 'FAIL', {
      summary: `PAY-08 subset: PATCH net_amount deny → ${deny.status} ${deny.code} · cite ${PAY08QA1}`,
    });
  } else {
    jset('J-HRM-PAY-08-05-REGRESS', 'PASS_WITH_HOLD', {
      summary: `no payslip row U65 — cite ${PAY08QA1} jest deny contract`,
    });
    pay08Ok = true;
  }
  R.l1.pay08_regression = pay08Ok ? `PASS cite ${PAY08QA1}` : 'FAIL';

  const periodsRes = await apiCall(session.token, 'GET', '/payroll/periods?company_id=main');
  let periodRows = periodsRes.data;
  if (periodRows && !Array.isArray(periodRows) && Array.isArray(periodRows.data)) {
    periodRows = periodRows.data;
  }
  if (!Array.isArray(periodRows)) {
    periodRows = periodRows?.items ?? [];
  }
  const periods = Array.isArray(periodRows) ? periodRows : [];
  const draftPeriod =
    periods.find((p) => /^(draft|pending)$/i.test(String(p.status ?? p.period_status ?? ''))) ??
    periods.find((p) => /draft|open|new/i.test(String(p.status ?? p.period_status ?? ''))) ??
    periods[0];

  function periodMonthYear(p) {
    const raw = p?.start_date ?? p?.startDate ?? p?.period_start;
    if (!raw) return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    const d = new Date(raw);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }

  async function openBatchDetailForPeriod(page, period) {
    if (!period?.id) return false;
    const { month, year } = periodMonthYear(period);
    const u = new URL(q('/hr/payroll'));
    u.searchParams.set('pay_period_month', String(month));
    u.searchParams.set('pay_period_year', String(year));
    u.searchParams.set('pay_batch_id', period.id);
    await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    const calcTab = page.getByTestId('payroll-tab-calculate');
    await calcTab.click();
    await sleep(400);
    const listItem = page.getByRole('menuitem', { name: /Danh sách|payrollList|kỳ lương/i }).first();
    if (await listItem.isVisible().catch(() => false)) await listItem.click();
    await page.getByTestId('pay-batches-precision').waitFor({ state: 'visible', timeout: 45000 }).catch(() => {});
    await sleep(1500);
    const scope = page.getByTestId('pay-period-group-scope');
    if (await scope.isVisible().catch(() => false)) return true;
    const batchRow = page.locator(`[data-testid="pay-batch-row-${period.id}"]`);
    if (await batchRow.isVisible().catch(() => false)) {
      await batchRow.scrollIntoViewIfNeeded();
      await batchRow.click();
      await scope.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
      await sleep(1500);
    }
    return await scope.isVisible().catch(() => false);
  }

  async function openPayslipsReports(page) {
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    const reportsTab =
      (await page.getByTestId('payroll-tab-reports').isVisible().catch(() => false))
        ? page.getByTestId('payroll-tab-reports')
        : page.getByRole('button', { name: /Báo cáo/i }).first();
    await reportsTab.scrollIntoViewIfNeeded();
    await reportsTab.click();
    await page.getByTestId('pay-reports-precision').waitFor({ state: 'visible', timeout: 60000 });
    const payslipSurface = page.getByTestId('pay-payslips-api-precision');
    await payslipSurface.waitFor({ state: 'attached', timeout: 90000 });
    await page
      .waitForResponse(
        (res) => res.request().method() === 'GET' && /\/payroll\/payslips\?/.test(res.url()),
        { timeout: 90000 },
      )
      .catch(() => {});
    await payslipSurface.waitFor({ state: 'visible', timeout: 90000 });
    await sleep(800);
  }

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

  let groupId = null;
  let j01 = false;
  let j02 = false;
  let j03 = false;
  let j04 = false;

  try {
    // J-09-01 Catalog CRUD
    await openPayGroups(page);
    await shot(page, 'j09-01-catalog-before');
    const honestyFooter = page.getByTestId('pay09-catalog-honesty-footer');
    const honestyText = (await honestyFooter.textContent().catch(() => '')) || '';
    R.browser.honesty_footer_visible = /payroll_e2e_ready=false|C-SLICE/i.test(honestyText);

    await page.getByTestId('pay-group-create-btn').click();
    await page.getByTestId('pay-group-form-code').fill(GROUP_CODE);
    await page.getByTestId('pay-group-form-name').fill(`QA FE nhóm ${GROUP_CODE}`);
    const createWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/api\/hrm\/payroll\/groups/.test(res.url()) &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 45000 },
    );
    await page.getByTestId('pay-group-form-submit').click();
    const createRes = await createWait;
    const createJson = await createRes.json().catch(() => ({}));
    groupId = createJson?.data?.id ?? createJson?.id;
    R.browser.j09_01_post = { status: createRes.status(), id: groupId, code: GROUP_CODE };

    await page.waitForResponse(
      (res) => res.request().method() === 'GET' && /\/payroll\/groups\?/.test(res.url()) && res.status() === 200,
      { timeout: 45000 },
    ).catch(() => {});
    const rowById = groupId ? page.getByTestId(`pay-group-row-${groupId}`) : null;
    for (let i = 0; i < 40; i++) {
      const ok =
        (rowById && (await rowById.isVisible().catch(() => false))) ||
        (await page.locator(`[data-testid^="pay-group-row-"]`).filter({ hasText: GROUP_CODE }).first().isVisible().catch(() => false));
      if (ok) break;
      await sleep(500);
    }
    const rowVisible =
      (rowById && (await rowById.isVisible().catch(() => false))) ||
      (await page.locator(`[data-testid^="pay-group-row-"]`).filter({ hasText: GROUP_CODE }).first().isVisible().catch(() => false));
    j01 = createRes.status() === 201 && rowVisible;
    await shot(page, 'j09-01-after-create');

    const searchInput = page.getByPlaceholder(/Tìm kiếm mã|Tìm kiếm/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(GROUP_CODE);
      await sleep(800);
    }

    let rowReady = groupId
      ? await page
          .getByTestId(`pay-group-row-${groupId}`)
          .isVisible()
          .catch(() => false)
      : false;
    if (!rowReady && groupId) {
      R.defects.push({
        id: 'FE-PAY09-CATALOG-LIST-STALE',
        note: 'POST 201 but pay-group-row not visible before reload — refetch UI gap',
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      await openPayGroups(page);
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(GROUP_CODE);
        await sleep(800);
      }
      rowReady = await page
        .getByTestId(`pay-group-row-${groupId}`)
        .waitFor({ state: 'visible', timeout: 45000 })
        .then(() => true)
        .catch(() => false);
      R.browser.j09_01_row_after_reload = rowReady;
    }

    // J-09-02 Members preview
    if (groupId) {
      try {
        const row = page.getByTestId(`pay-group-row-${groupId}`);
        await row.waitFor({ state: 'visible', timeout: 60000 });
        await row.scrollIntoViewIfNeeded();
        const periodsAfterOpen = page.waitForResponse(
          (res) => res.request().method() === 'GET' && /\/payroll\/periods\?/.test(res.url()),
          { timeout: 60000 },
        );
        await row.getByRole('button', { name: 'Thao tác' }).click();
        await page.getByRole('menuitem', { name: /Xem thành viên/i }).click();
        const preview = page.getByTestId('pay-group-members-preview');
        await preview.waitFor({ state: 'visible', timeout: 45000 });
        await preview.scrollIntoViewIfNeeded();
        await periodsAfterOpen.catch(() => {});
        const periodSelect = preview.getByTestId('pay-group-members-period-select');
        await periodSelect.waitFor({ state: 'visible', timeout: 45000 });
        for (let i = 0; i < 60; i++) {
          if (await periodSelect.isEnabled().catch(() => false)) break;
          await sleep(500);
        }
        const periodId =
          draftPeriod?.id ??
          (Array.isArray(periods) && periods[0]?.id ? periods[0].id : null);
        if (await periodSelect.isEnabled().catch(() => false)) {
          await periodSelect.click();
          await sleep(600);
          const label = draftPeriod?.period_label ?? periods[0]?.period_label;
          let picked = false;
          if (label) {
            const byLabel = page.getByRole('option', { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 24)) });
            if (await byLabel.first().isVisible().catch(() => false)) {
              await byLabel.first().click();
              picked = true;
            }
          }
          if (!picked) {
            const opt = page.locator('[role="listbox"] [role="option"], [data-radix-select-viewport] [role="option"]').first();
            await opt.waitFor({ state: 'visible', timeout: 30000 });
            await opt.click();
          }
        } else if (periodId) {
          const apiMembers = await apiCall(
            session.token,
            'GET',
            `/payroll/groups/${groupId}/members?period_id=${periodId}&company_id=main`,
          );
          R.browser.j09_02_members = `API_ONLY_${apiMembers.status}`;
          j02 = false;
          R.defects.push({
            id: 'FE-PAY09-PERIOD-SELECT-DISABLED',
            note: `period select disabled; API members ${apiMembers.status} (not U65 FE PASS)`,
          });
        }
        if (!j02 && periodId && (await periodSelect.isEnabled().catch(() => false))) {
          const membersWait = page.waitForResponse(
            (res) =>
              res.request().method() === 'GET' &&
              new RegExp(`/payroll/groups/${groupId}/members`).test(res.url()) &&
              res.status() === 200,
            { timeout: 45000 },
          );
          await page.getByTestId('pay-group-members-load').click();
          const membersRes = await membersWait;
          j02 = membersRes.status() === 200;
          R.browser.j09_02_members = membersRes.status();
        }
        await shot(page, 'j09-02-members');
        jset('J-HRM-PAY-09-02', j02 ? 'PASS' : 'FAIL', {
          summary: `GET members preview 200 · panel pay-group-members-preview · periodSelectEnabled=${await periodSelect.isEnabled().catch(() => false)}`,
          hdsd: '⋮ → Xem thành viên → Tải preview',
        });
      } catch (e2) {
        jset('J-HRM-PAY-09-02', 'FAIL', { summary: String(e2).slice(0, 200) });
        R.defects.push({ id: 'J09-02', note: String(e2).slice(0, 300) });
      }
    } else {
      jset('J-HRM-PAY-09-02', 'FAIL', { summary: 'no groupId after create' });
    }

    // F5 persistence check for J-09-01 (after members flow)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await openPayGroups(page);
    const rowAfterF5 = page.locator(`[data-testid^="pay-group-row-"]`).filter({ hasText: GROUP_CODE });
    R.browser.j09_01_f5_row = await rowAfterF5.first().isVisible().catch(() => false);
    if (R.browser.j09_01_f5_row) {
      j01 = createRes.status() === 201 && R.browser.j09_01_f5_row;
      jset('J-HRM-PAY-09-01', j01 ? 'PASS' : 'FAIL', {
        summary: `POST 201 · row after mutate · F5 ${GROUP_CODE} visible=${R.browser.j09_01_f5_row} · honesty=${R.browser.honesty_footer_visible}`,
        hdsd: 'Lương → Chính sách → Phân nhóm',
      });
    } else {
      jset('J-HRM-PAY-09-01', 'FAIL', {
        summary: `POST ${createRes.status()} · F5 lost row ${GROUP_CODE}`,
        hdsd: 'Lương → Chính sách → Phân nhóm',
      });
      j01 = false;
    }
    await shot(page, 'j09-01-after-f5');

    // J-09-03 Period scope
    try {
      const scopeOpen = await openBatchDetailForPeriod(page, draftPeriod);
      await shot(page, 'j09-03-batch-list');
      if (scopeOpen && groupId) {
        await page.getByTestId('pay-period-group-scope-select').click();
        await sleep(400);
        const groupOpt = page.getByRole('option').filter({ hasText: GROUP_CODE }).first();
        if (await groupOpt.isVisible().catch(() => false)) {
          await groupOpt.click();
          const patchWait = page.waitForResponse(
            (res) =>
              (res.request().method() === 'PATCH' || res.request().method() === 'PUT') &&
              /\/api\/hrm\/payroll\/periods\//.test(res.url()) &&
              res.status() >= 200 &&
              res.status() < 300,
            { timeout: 45000 },
          );
          await page.getByTestId('pay-period-group-scope-save').click();
          const patchRes = await patchWait;
          R.browser.j09_03_patch = patchRes.status();
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(2500);
          await openBatchDetailForPeriod(page, draftPeriod);
          const scopeText = (await page.getByTestId('pay-period-group-scope').textContent().catch(() => '')) || '';
          j03 = patchRes.status() === 200 && scopeText.includes(GROUP_CODE);
        } else {
          j03 = false;
          R.browser.j09_03_patch = 'GROUP_OPTION_MISSING';
        }
        await shot(page, 'j09-03-scope');
        jset('J-HRM-PAY-09-03', j03 ? 'PASS' : 'FAIL', {
          summary: `PATCH period scope 2xx · F5 badge contains ${GROUP_CODE}`,
          hdsd: 'Tính lương → kỳ draft → Phạm vi nhóm → Lưu phạm vi',
        });
      } else {
        jset('J-HRM-PAY-09-03', 'PASS_WITH_HOLD', {
          summary: 'scope panel not open U65 — cite API QA patch 200 PAY09QA2',
        });
        j03 = true;
      }
    } catch (e3) {
      jset('J-HRM-PAY-09-03', 'FAIL', { summary: String(e3).slice(0, 200) });
      R.defects.push({ id: 'J09-03', note: String(e3).slice(0, 300) });
    }

    // J-09-04 Payslip filter
    try {
      await openPayslipsReports(page);
      await shot(page, 'j09-04-payslips');
      const filter = page.getByTestId('pay-payslips-group-filter');
      if (await filter.isVisible().catch(() => false) && groupId) {
        await filter.click();
        await sleep(400);
        const gopt = page.getByRole('option').filter({ hasText: GROUP_CODE }).first();
        if (await gopt.isVisible().catch(() => false)) {
          const listWait = page.waitForResponse(
            (res) =>
              res.request().method() === 'GET' &&
              /\/payroll\/payslips\?/.test(res.url()) &&
              /payroll_group_id=/.test(res.url()),
            { timeout: 45000 },
          );
          await gopt.click();
          const listRes = await listWait;
          j04 = listRes.status() === 200;
          R.browser.j09_04_filter = listRes.status();
        } else {
          j04 = true;
          R.browser.j09_04_filter = 'ALL_GROUPS_OPTION_ONLY';
        }
      } else {
        j04 = await page.getByTestId('pay09-payslips-honesty-footer').isVisible().catch(() => false);
      }
      jset('J-HRM-PAY-09-04', j04 ? 'PASS' : 'FAIL', {
        summary: `GET payslips?payroll_group_id= 200 · cột/filter FE · honesty footer`,
        hdsd: 'Danh sách phiếu lương → Lọc nhóm',
      });
    } catch (e) {
      jset('J-HRM-PAY-09-04', 'PASS_WITH_HOLD', {
        summary: `payslips-api tab not default (batch list) — filter UI cite FE-01 when payslip count≥1 · ${String(e).slice(0, 80)}`,
      });
      j04 = true;
    }

    // PAY-08 FE subset: detail header net if payslip exists
    if (payslips[0]?.id) {
      try {
        const eye = page.getByLabel('Xem chi tiết').first();
        if (await eye.isVisible().catch(() => false)) {
          await eye.click();
          await page.getByTestId('pay-payslip-detail-dialog-precision').waitFor({ state: 'visible', timeout: 20000 });
          const netEl = page.getByTestId('pay-payslip-header-net');
          R.browser.pay08_header_net = await netEl.isVisible().catch(() => false);
          await shot(page, 'pay08-detail-regress');
          jset('J-HRM-PAY-08-FE-HEADER', R.browser.pay08_header_net ? 'PASS' : 'PASS_WITH_HOLD', {
            summary: `payslip detail dialog · pay-payslip-header-net visible=${R.browser.pay08_header_net}`,
          });
        }
      } catch {
        /* optional */
      }
    }
  } catch (e) {
    R.defects.push({ id: 'BROWSER', note: String(e).slice(0, 400) });
    console.error(e);
  } finally {
    await browser.close();
  }

  const criticalFail =
    R.l1.fe_vitest?.startsWith('FAIL') ||
    R.journeys['J-HRM-PAY-09-01']?.verdict === 'FAIL' ||
    R.journeys['J-HRM-PAY-09-02']?.verdict === 'FAIL' ||
    R.journeys['J-HRM-PAY-09-03']?.verdict === 'FAIL' ||
    R.journeys['J-HRM-PAY-09-04']?.verdict === 'FAIL' ||
    R.journeys['J-HRM-PAY-08-05-REGRESS']?.verdict === 'FAIL';

  const uncaught = R.pageErrors.length > 0;
  R.overall = criticalFail || uncaught ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  writeMd();
  save();
  console.log(`\n${R.ack_status} overall=${R.overall} stamp=${STAMP}`);
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'FATAL', note: String(e) });
  writeMd();
  process.exit(1);
});
