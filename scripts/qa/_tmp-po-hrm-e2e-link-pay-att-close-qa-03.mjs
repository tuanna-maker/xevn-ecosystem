#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 — U65 browser retest after FE-02
 * Path A deep-link OR Path B period filter + row → AC-PAY-HIRE-04/05
 * cấm seed · payroll_e2e_ready=true only if AC-04 AND AC-05 PASS
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8088',
].filter(Boolean);

const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const TARGET_PERIOD_ID = 'dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8';
const PAY_MONTH = 1;
const PAY_YEAR = 2026;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-03-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-03');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03',
  parent: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02 READY_FOR_QA',
  supersedes: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02',
  u65: 'zero-seed · browser-only',
  hdsd_align: 'Tiền lương → Tính lương → Tháng 1/2026 draft → Thêm nhân viên → F5',
  honesty: { payroll_e2e_ready: false },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT, targetPeriodId: TARGET_PERIOD_ID },
  l0: {},
  clicks: [],
  path: { used: null, A: {}, B: {} },
  pay: {},
  network: { pay: [], enroll: [], enrollBodies: [] },
  consoleErrors: [],
  pageErrors: [],
  criteria: {},
  residuals: [],
  verdict: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function click(step, detail) {
  R.clicks.push({ step, detail, at: new Date().toISOString() });
  save();
}

async function pickPortal() {
  for (const url of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.status === 200) return url.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return PORTAL_CANDIDATES[0]?.replace(/\/$/, '') || 'http://127.0.0.1:5175';
}

function q(portal, path) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi(portal) {
  for (const url of [`${portal}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        email: EMAIL,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('loginApi failed');
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

async function apiEligibility(token, periodId) {
  const r = await fetch(`${HRM}/api/hrm/payroll/periods/${periodId}/eligibility?company_id=${COMPANY}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const j = await r.json().catch(() => ({}));
  const d = j?.data ?? j;
  return {
    status: r.status,
    eligible_count: d?.eligible_count ?? 0,
    ineligible_count: d?.ineligible_count ?? 0,
    code: j?.code,
  };
}

function trackNetwork(page) {
  page.on('request', (req) => {
    const url = req.url();
    if (/\/api\/hrm\/payroll\/periods\/[^/]+\/enroll/.test(url) && req.method() === 'POST') {
      let body = null;
      let parseErr = null;
      try {
        body = JSON.parse(req.postData() || '{}');
      } catch (e) {
        parseErr = String(e?.message || e).slice(0, 80);
      }
      const keys = body && typeof body === 'object' ? Object.keys(body).sort() : [];
      R.network.enrollBodies.push({
        url: url.slice(0, 220),
        keys,
        hasCompanyId: keys.includes('company_id'),
        mode: body?.mode ?? null,
        employee_ids_len: Array.isArray(body?.employee_ids) ? body.employee_ids.length : null,
        bodySnippet: body ? JSON.stringify(body).slice(0, 240) : null,
        parseErr,
      });
      save();
    }
  });
  page.on('response', async (res) => {
    const u = res.url();
    const status = res.status();
    const method = res.request().method();
    if (/\/api\/hrm\/payroll\//.test(u)) {
      const entry = { method, status, url: u.slice(0, 220) };
      try {
        if (method !== 'GET' && status >= 400) {
          const j = await res.json().catch(() => ({}));
          entry.code = j?.code;
          entry.message = String(j?.message || '').slice(0, 160);
        }
      } catch {
        /* */
      }
      R.network.pay.push(entry);
      if (method === 'POST' && /\/enroll/.test(u)) {
        R.network.enroll.push(entry);
      }
      save();
    }
  });
}

async function shot(page, name) {
  await page.screenshot({ path: join(SCREEN, name), fullPage: false });
}

async function waitPayrollSurface(page) {
  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  const list = page.locator('[data-testid="pay-batch-list-table"]');
  for (let i = 0; i < 20; i++) {
    if (
      (await filter.isVisible().catch(() => false)) ||
      (await addBtn.isVisible().catch(() => false)) ||
      (await list.isVisible().catch(() => false))
    ) {
      return true;
    }
    // try click Tiền lương / Tính lương menu if still on shell
    const payMenu = page.getByRole('link', { name: /Tiền lương|Lương/i }).first();
    if (await payMenu.isVisible().catch(() => false)) {
      await payMenu.click().catch(() => {});
      await sleep(800);
    }
    const calcTab = page.getByRole('tab', { name: /Tính lương/i }).or(page.getByText(/Tính lương/i)).first();
    if (await calcTab.isVisible().catch(() => false)) {
      await calcTab.click().catch(() => {});
      await sleep(800);
    }
    await sleep(500);
  }
  return (
    (await filter.isVisible().catch(() => false)) ||
    (await addBtn.isVisible().catch(() => false)) ||
    (await list.isVisible().catch(() => false))
  );
}

function readUrlState(page) {
  return page.evaluate(() => {
    const u = new URL(window.location.href);
    return {
      href: u.href.slice(0, 260),
      pay_period_month: u.searchParams.get('pay_period_month'),
      pay_period_year: u.searchParams.get('pay_period_year'),
      pay_batch_id: u.searchParams.get('pay_batch_id'),
    };
  });
}

async function assertDetailReady(page) {
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  const visible = await addBtn.isVisible().catch(() => false);
  const filterText = await page.locator('[data-testid="pay-batch-period-filter"]').innerText().catch(() => '');
  const url = await readUrlState(page);
  return {
    addEmpVisible: visible,
    filterText: filterText.slice(0, 80),
    monthOk: /1\s*\/\s*2026|Tháng\s*1/i.test(filterText) || url.pay_period_month === '1',
    url,
  };
}

async function tryPathA(page, portal) {
  click('PathA', `deep-link month=1 year=2026 batch=${TARGET_PERIOD_ID}`);
  const url = q(
    portal,
    `/hr/payroll?pay_period_month=${PAY_MONTH}&pay_period_year=${PAY_YEAR}&pay_batch_id=${TARGET_PERIOD_ID}`,
  );
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  await waitPayrollSurface(page);
  await sleep(2000);
  await shot(page, '01-path-a-landing.png');
  const state = await assertDetailReady(page);
  R.path.A = { url: url.slice(0, 260), ...state };
  save();
  return state.addEmpVisible === true;
}

async function tryPathB(page, portal) {
  click('PathB', 'filter option-1-2026 → row click');
  await page.goto(q(portal, '/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  await waitPayrollSurface(page);
  await shot(page, '02-path-b-list-default.png');

  const filter = page.locator('[data-testid="pay-batch-period-filter"]');
  if (!(await filter.isVisible().catch(() => false))) {
    R.path.B = { error: 'pay-batch-period-filter missing' };
    return false;
  }
  await filter.click({ timeout: 10_000 });
  await sleep(600);
  const opt = page.locator('[data-testid="pay-batch-period-option-1-2026"]');
  if (!(await opt.isVisible().catch(() => false))) {
    // option may be in portal root (iframe portalScope)
    const optAny = page.locator('[data-testid="pay-batch-period-option-1-2026"]').first();
    await optAny.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
  }
  if (await opt.first().isVisible().catch(() => false)) {
    await opt.first().click({ timeout: 8_000 });
  } else {
    R.path.B = { error: 'pay-batch-period-option-1-2026 not visible' };
    await shot(page, '02b-path-b-filter-open-fail.png');
    return false;
  }
  await sleep(2000);
  await shot(page, '03-path-b-after-filter.png');

  const row = page.locator(`[data-testid="pay-batch-row-${TARGET_PERIOD_ID}"]`);
  if (!(await row.isVisible().catch(() => false))) {
    R.path.B = {
      error: 'row not visible after filter',
      filterText: await filter.innerText().catch(() => ''),
      url: await readUrlState(page),
    };
    await shot(page, '03b-path-b-row-missing.png');
    return false;
  }
  await row.click({ timeout: 10_000 });
  await sleep(2500);
  await shot(page, '04-path-b-detail.png');
  const state = await assertDetailReady(page);
  R.path.B = { ...state, rowClicked: true };
  save();
  return state.addEmpVisible === true;
}

async function tryEnrollAndF5(page) {
  click('AC04', 'Thêm nhân viên → select eligible → enroll POST');
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  await addBtn.click({ timeout: 12_000 });
  await sleep(1500);
  const dialog = page.locator('[data-testid="pay-batch-add-emp-dialog-precision"]');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  await sleep(2000);
  await shot(page, '05-add-emp-dialog.png');

  const checkboxes = dialog.locator('[role="checkbox"]:not([disabled])');
  const count = await checkboxes.count();
  R.pay.enabledCheckboxCount = count;
  let selectedIdText = null;
  if (count === 0) {
    await shot(page, '05b-no-enabled-checkbox.png');
    await page.keyboard.press('Escape');
    return { enrolled: false, reason: 'no_enabled_checkbox', enrollPosts: [], enrollBody: null, f5Persist: false };
  }
  await checkboxes.first().click();
  selectedIdText = await dialog.locator('div').filter({ has: checkboxes.first() }).first().innerText().catch(() => null);
  R.pay.selectedRowSnippet = String(selectedIdText || '').slice(0, 120);

  const enrollBefore = R.network.enroll.length;
  const bodyBefore = R.network.enrollBodies.length;
  const confirm = dialog.getByRole('button', { name: /Thêm \d+ nhân viên/i });
  await confirm.click({ timeout: 10_000 });
  await sleep(4000);
  await shot(page, '06-after-enroll-click.png');

  const enrollPosts = R.network.enroll.slice(enrollBefore);
  const enrollBody = R.network.enrollBodies.slice(bodyBefore)[0] ?? null;
  const enrollOk = enrollPosts.some((p) => p.status >= 200 && p.status < 300);
  const bodyOk =
    enrollBody &&
    enrollBody.hasCompanyId === false &&
    enrollBody.mode === 'explicit' &&
    Array.isArray(enrollBody.keys) &&
    enrollBody.keys.every((k) => k === 'mode' || k === 'employee_ids');

  R.pay.enrollPosts = enrollPosts;
  R.pay.enrollBody = enrollBody;
  R.pay.bodyWhitelistOk = bodyOk === true;

  // FE after 2xx
  const emptyAfter = await page
    .getByText(/Chưa có nhân viên nào trong bảng lương/i)
    .isVisible()
    .catch(() => false);
  const empCountText = await page.locator('text=Số nhân viên').locator('..').innerText().catch(() => '');
  R.pay.feAfter2xx = {
    emptyRowGone: enrollOk ? emptyAfter === false : null,
    empCountSnippet: empCountText.slice(0, 80),
  };
  await shot(page, '07-fe-after-enroll.png');

  click('AC05', 'F5 persistence');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  // restore detail if reload dropped to list
  if (!(await page.locator('[data-testid="pay-batch-add-emp-btn"]').isVisible().catch(() => false))) {
    const deep = await tryPathA(page, R.env.PORTAL);
    if (!deep) await tryPathB(page, R.env.PORTAL);
    await sleep(2000);
  }
  const emptyF5 = await page
    .getByText(/Chưa có nhân viên nào trong bảng lương/i)
    .isVisible()
    .catch(() => false);
  const rowCount = await page.locator('table tbody tr').count().catch(() => 0);
  await shot(page, '08-after-f5.png');

  const f5Persist = enrollOk && emptyF5 === false && rowCount >= 1;
  return {
    enrolled: enrollOk,
    bodyOk: bodyOk === true,
    enrollPosts,
    enrollBody,
    f5Persist,
    emptyF5,
    rowCount,
  };
}

function buildMarkdown() {
  const c = R.criteria;
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03` |',
    '| from_role | qa |',
    '| to_role | pm |',
    `| ack_status | **\`${R.ack_status}\`** |`,
    `| verdict | **${R.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona / URL | \`${EMAIL}\` / \`Xevn@2026\` · ${R.env.PORTAL}/hr · \`company_id=main\` |`,
    '| u65 | zero-seed · browser-only · cấm seed / `payroll_e2e_ready=true` trừ AC-04∧AC-05 |',
    `| honesty | \`payroll_e2e_ready=${R.honesty.payroll_e2e_ready}\` |`,
    '| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02` READY_FOR_QA |',
    `| env | portal=${R.env.PORTAL} · hrm=${HRM} · xbos=${XBOS} · commit=${COMMIT} |`,
    '| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-close-qa-03-browser.json` |',
    '| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-close-qa-03/` |',
    '',
    '## L0 stack',
    '',
    '| Service | Status |',
    '|---------|--------|',
    `| hrm-api | ${R.l0.hrm} |`,
    `| xbos-api | ${R.l0.xbos} |`,
    `| portal | ${R.l0.portal} |`,
    '',
    '## Executive summary',
    '',
    R.executive || '',
    '',
    '## UF / Journey',
    '',
    '| ID | Click path | Result |',
    '|----|------------|--------|',
    `| **Path A / B** | Deep-link or filter+row → Jan draft detail | ${c.pathNav ?? '—'} |`,
    `| **UF-HRM-06** | Tiền lương → Tháng 1/2026 → Thêm NV | ${c.uf ?? '—'} |`,
    `| **AC-PAY-HIRE-04** | Enroll POST 2xx (body mode+employee_ids) | ${c.ac04 ?? '—'} |`,
    `| **AC-PAY-HIRE-05** | F5 emp persists | ${c.ac05 ?? '—'} |`,
    '',
    '## Acceptance criteria',
    '',
    '| AC / Check | Verdict | Notes |',
    '|------------|---------|-------|',
    `| L0 stack | ${c.l0 ?? '—'} | |`,
    `| Path A deep-link OR Path B filter+row → \`pay-batch-add-emp-btn\` | ${c.pathNav ?? '—'} | used=${R.path.used} |`,
    `| API eligibility \`eligible_count≥1\` (precondition) | ${c.eligible ?? '—'} | ${R.pay.eligibilityApi?.eligible_count ?? '—'} |`,
    `| **AC-PAY-HIRE-04** enroll 2xx + body whitelist | ${c.ac04 ?? '—'} | |`,
    `| **AC-PAY-HIRE-05** F5 persistence | ${c.ac05 ?? '—'} | |`,
    `| \`payroll_e2e_ready\` | **${R.honesty.payroll_e2e_ready}** | true only if AC-04∧AC-05 |`,
    '',
    '## FE click path',
    '',
    ...R.clicks.map((x, i) => `${i + 1}. **${x.step}** — ${x.detail}`),
    '',
    '## Path A / B detail',
    '',
    '```json',
    JSON.stringify(R.path, null, 2),
    '```',
    '',
    '## Payroll / enroll phase',
    '',
    '```json',
    JSON.stringify(R.pay, null, 2),
    '```',
    '',
    '## Network — enroll',
    '',
    '```json',
    JSON.stringify({ enroll: R.network.enroll, enrollBodies: R.network.enrollBodies }, null, 2),
    '```',
    '',
    '## Residuals',
    '',
    ...(R.residuals.length
      ? [
          '| ID | Sev | Owner | Note |',
          '|----|-----|-------|------|',
          ...R.residuals.map((r) => `| **${r.id}** | ${r.sev} | ${r.owner} | ${r.note} |`),
        ]
      : ['- none']),
    '',
    '## Promoted / not promoted',
    '',
    '| Item | Status |',
    '|------|--------|',
    `| FE-02 Path A/B nav (R-PAY-PERIOD-ROW-NAV) | ${c.pathNav === 'PASS' ? '**Promoted** 🟢' : '**Not promoted**'} |`,
    `| AC-PAY-HIRE-04 browser enroll | ${c.ac04 === 'PASS' ? '**Promoted** 🟢' : '**Not promoted**'} |`,
    `| AC-PAY-HIRE-05 F5 | ${c.ac05 === 'PASS' ? '**Promoted** 🟢' : '**Not promoted**'} |`,
    `| \`payroll_e2e_ready\` | **${R.honesty.payroll_e2e_ready}** |`,
    `| Module UAT claim | **DENIED** (slice only) |`,
    '',
    '## completion_report',
    '',
    R.completion_report || '',
    '',
    '## next_owner',
    '',
    R.next_owner || '',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    R.next_dispatch_prompt || '',
    '```',
    '',
    `## ack_status\n\n**\`${R.ack_status}\`**`,
  ];
  writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
}

async function main() {
  R.env.PORTAL = await pickPortal();
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', R.env.PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.message || e).slice(0, 80);
    }
  }
  R.criteria.l0 = R.l0.hrm === 200 && R.l0.xbos === 200 && R.l0.portal === 200 ? 'PASS' : 'FAIL';
  save();
  if (R.criteria.l0 !== 'PASS') {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    R.executive = 'L0 FAIL — stack not ready.';
    buildMarkdown();
    return;
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
  });

  try {
    const session = await loginApi(R.env.PORTAL);
    await injectPortalAuth(page, session);

    const elig = await apiEligibility(session.token, TARGET_PERIOD_ID);
    R.pay.eligibilityApi = elig;
    R.criteria.eligible = elig.status === 200 && elig.eligible_count >= 1 ? 'PASS' : 'FAIL';
    save();

    let detailOk = await tryPathA(page, R.env.PORTAL);
    if (detailOk) {
      R.path.used = 'A';
    } else {
      detailOk = await tryPathB(page, R.env.PORTAL);
      R.path.used = detailOk ? 'B' : 'NONE';
    }
    R.criteria.pathNav = detailOk ? 'PASS' : 'FAIL';
    R.pay.detailOpen = detailOk;
    save();

    if (!detailOk) {
      R.criteria.ac04 = 'FAIL';
      R.criteria.ac05 = 'NOT RUN';
      R.criteria.uf = 'FAIL';
      R.residuals.push({
        id: 'R-PAY-PERIOD-ROW-NAV',
        sev: 'P1',
        owner: 'dev-fe',
        note: 'FE-02 retest: Path A/B still cannot open Jan draft with pay-batch-add-emp-btn',
      });
    } else if (R.criteria.eligible !== 'PASS') {
      R.criteria.ac04 = 'FAIL';
      R.criteria.ac05 = 'NOT RUN';
      R.criteria.uf = 'PARTIAL';
      R.residuals.push({
        id: 'R-PAY-ATT-ELIGIBILITY',
        sev: 'P0',
        owner: 'dev-be',
        note: `eligible_count=${elig.eligible_count} status=${elig.status}`,
      });
    } else {
      const enroll = await tryEnrollAndF5(page);
      R.pay.enroll = enroll;
      R.criteria.ac04 = enroll.enrolled && enroll.bodyOk ? 'PASS' : enroll.enrolled ? 'PARTIAL' : 'FAIL';
      R.criteria.ac05 = enroll.f5Persist ? 'PASS' : enroll.enrolled ? 'FAIL' : 'NOT RUN';
      R.criteria.uf =
        R.criteria.ac04 === 'PASS' && R.criteria.ac05 === 'PASS'
          ? 'PASS'
          : R.criteria.ac04 === 'PASS'
            ? 'PARTIAL'
            : 'FAIL';
      if (!enroll.enrolled) {
        R.residuals.push({
          id: 'R-PAY-ENROLL-FE',
          sev: 'P1',
          owner: 'dev-fe',
          note: enroll.reason || `enrollPosts=${JSON.stringify(enroll.enrollPosts)}`,
        });
      } else if (!enroll.bodyOk) {
        R.residuals.push({
          id: 'R-PAY-ENROLL-BODY',
          sev: 'P1',
          owner: 'dev-fe',
          note: `body keys=${JSON.stringify(enroll.enrollBody?.keys)} hasCompanyId=${enroll.enrollBody?.hasCompanyId}`,
        });
      }
      if (enroll.enrolled && !enroll.f5Persist) {
        R.residuals.push({
          id: 'R-PAY-ENROLL-F5',
          sev: 'P1',
          owner: 'dev-fe',
          note: `emptyF5=${enroll.emptyF5} rowCount=${enroll.rowCount}`,
        });
      }
    }

    const allPass =
      R.criteria.l0 === 'PASS' &&
      R.criteria.pathNav === 'PASS' &&
      R.criteria.eligible === 'PASS' &&
      R.criteria.ac04 === 'PASS' &&
      R.criteria.ac05 === 'PASS';

    if (allPass) {
      R.verdict = 'PASS';
      R.ack_status = 'PASS_TO_PM';
      R.honesty.payroll_e2e_ready = true;
      R.next_owner = 'qc';
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 PASS_TO_PM
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
entry: Path ${R.path.used} + AC-PAY-HIRE-04/05 PASS · eligible_count=${R.pay.eligibilityApi?.eligible_count} · U65 zero-seed
exit: GO/GWC — slice only; cấm claim module UAT; verify honesty payroll_e2e_ready=true with AC-04∧AC-05 evidence
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qc-01.md`;
    } else {
      R.verdict = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
      R.honesty.payroll_e2e_ready = false;
      const owner =
        R.criteria.pathNav !== 'PASS'
          ? 'dev-fe'
          : R.criteria.eligible !== 'PASS'
            ? 'dev-be'
            : R.criteria.ac04 !== 'PASS'
              ? 'dev-fe'
              : 'dev-fe';
      R.next_owner = owner;
      R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-03
from_role: pm
to_role: ${owner}
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 FAIL_TO_PM
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
residuals: ${R.residuals.map((r) => r.id).join(', ') || 'see evidence'}
task: fix Path A/B and/or enroll+F5 so AC-PAY-HIRE-04/05 PASS on period ${TARGET_PERIOD_ID}
cấm: seed · payroll_e2e_ready=true without AC-04∧AC-05
exit: READY_FOR_QA → retest QA-03`;
    }

    R.executive = [
      `U65 browser QA-03 after FE-02 (R-PAY-PERIOD-ROW-NAV). Portal ${R.env.PORTAL}.`,
      `Path used=${R.path.used}; pathNav=${R.criteria.pathNav}; eligible=${R.pay.eligibilityApi?.eligible_count}; AC-04=${R.criteria.ac04}; AC-05=${R.criteria.ac05}.`,
      `Honesty payroll_e2e_ready=${R.honesty.payroll_e2e_ready}. Module UAT DENIED.`,
    ].join(' ');

    R.completion_report = [
      `- **Closed:** L0 ${R.criteria.l0}; Path ${R.path.used} nav ${R.criteria.pathNav}; eligibility API ${R.criteria.eligible} (count=${R.pay.eligibilityApi?.eligible_count}).`,
      `- **AC-PAY-HIRE-04:** ${R.criteria.ac04}; **AC-PAY-HIRE-05:** ${R.criteria.ac05}.`,
      `- **Not closed / residual:** ${R.residuals.map((r) => r.id).join(', ') || 'none'}.`,
      `- **Honesty:** payroll_e2e_ready=${R.honesty.payroll_e2e_ready} (true only if AC-04∧AC-05).`,
      `- **Denied:** module UAT / production GO.`,
    ].join('\n');
  } catch (phaseErr) {
    R.phaseError = String(phaseErr?.message || phaseErr).slice(0, 400);
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.honesty.payroll_e2e_ready = false;
    R.next_owner = 'dev-fe';
    R.next_dispatch_prompt = `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-03
from_role: pm
to_role: dev-fe
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03 FAIL_TO_PM
phaseError: ${R.phaseError}
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
exit: READY_FOR_QA retest QA-03`;
    R.completion_report = `- **FAIL:** phaseError=${R.phaseError}`;
    R.executive = `Harness threw: ${R.phaseError}`;
  } finally {
    R.endedAt = new Date().toISOString();
    save();
    buildMarkdown();
    await browser.close();
  }
}

main().catch((e) => {
  R.fatal = String(e);
  R.verdict = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.honesty.payroll_e2e_ready = false;
  save();
  buildMarkdown();
  process.exit(1);
});
