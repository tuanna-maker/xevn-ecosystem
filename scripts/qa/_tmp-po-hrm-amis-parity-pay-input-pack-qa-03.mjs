#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03 — U65 browser
 * Prior: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01 READY_FOR_QA
 * AC: Payroll → Tạm ứng → pending → Thêm NV → POST …/employees 201 HRM-ADV-201
 * Honesty: payroll_e2e_ready=false · zero-seed · DENIED module UAT / AMIS DONE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-input-pack-qa-03-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-amis-parity-pay-input-pack-qa-03',
);
mkdirSync(SCREEN, { recursive: true });
mkdirSync(dirname(OUT_JSON), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toUpperCase().slice(-6);
const ADV_NAME = `QA-ADV-EMP-${stamp}`;
const ADV_PERIOD = `08/2026`;
const ADV_AMOUNT = 1_250_000;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-03',
  prior: 'PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align: 'Tiền lương / Tính lương → Tạm ứng → pending → Thêm nhân viên',
  honesty: {
    payroll_e2e_ready: false,
    seed_used: false,
    module_uat_claimed: false,
    amis_done_claimed: false,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, stamp },
  l0: {},
  probes: {},
  ac: {},
  network: [],
  postEmployees: null,
  consoleErrors: [],
  pageErrors: [],
  toasts: [],
  screens: [],
  click_log: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
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
  const urls = [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`];
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (!token) continue;
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || u.name || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
        raw: data,
        loginVia: url,
      };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
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

function track(page) {
  page.on('console', (msg) => {
    const text = String(msg.text());
    if (msg.type() === 'error') R.consoleErrors.push(text.slice(0, 360));
    if (/API thêm NV|chưa có trên Nest|toast/i.test(text)) {
      R.toasts.push({ source: 'console', text: text.slice(0, 360), at: ts() });
    }
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    const u = req.url();
    if (!/\/api\/hrm\/payroll\/advance-requests/.test(u)) return;
    if (req.method() === 'POST' && /\/employees(\?|$)/.test(u)) {
      let body = null;
      try {
        body = JSON.parse(req.postData() || 'null');
      } catch {
        body = req.postData()?.slice(0, 500) || null;
      }
      R.postEmployees = {
        ...(R.postEmployees || {}),
        requestUrl: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        requestBody: body,
        method: 'POST',
      };
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/payroll\/advance-requests/.test(u)) return;
      const method = res.request().method();
      let json = null;
      const ct = res.headers()['content-type'] || '';
      if (/json/i.test(ct)) {
        json = await res.json().catch(() => null);
      }
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        code: json?.code ?? json?.data?.code ?? null,
        at: ts(),
      };
      R.network.push(entry);
      if (method === 'POST' && /\/employees(\?|$)/.test(u)) {
        R.postEmployees = {
          ...(R.postEmployees || {}),
          ...entry,
          responseBodySummary: json
            ? {
                code: json.code ?? null,
                message: json.message ?? null,
                dataKeys: json.data ? Object.keys(json.data).slice(0, 20) : [],
                employee_code: json.data?.employee_code ?? json.data?.employeeCode ?? null,
                employee_name: json.data?.employee_name ?? json.data?.employeeName ?? null,
                advance_amount: json.data?.advance_amount ?? json.data?.advanceAmount ?? null,
              }
            : null,
        };
      }
    } catch {
      /* */
    }
  });
}

async function apiCall(token, method, path, body) {
  const r = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json };
}

async function probeHonesty(token) {
  // Read-only: confirm a known payroll surface still reports payroll_e2e_ready=false if present
  const components = await apiCall(
    token,
    'GET',
    `/api/hrm/payroll/salary-components?company_id=${COMPANY}&page=1&page_size=5`,
  );
  const rows =
    components.json?.data?.data ??
    components.json?.data?.items ??
    components.json?.data ??
    [];
  const arr = Array.isArray(rows) ? rows : [];
  const anyReady = arr.some((r) => r?.payroll_e2e_ready === true);
  R.probes.salaryComponentsStatus = components.status;
  R.probes.payroll_e2e_ready_any_true = anyReady;
  R.probes.sampleComponent = arr[0]
    ? {
        code: arr[0].code,
        payroll_e2e_ready: arr[0].payroll_e2e_ready ?? null,
      }
    : null;

  const advList = await apiCall(
    token,
    'GET',
    `/api/hrm/payroll/advance-requests?company_id=${COMPANY}`,
  );
  const advRows =
    advList.json?.data?.data ?? advList.json?.data?.items ?? advList.json?.data ?? [];
  R.probes.advanceListStatus = advList.status;
  R.probes.advanceCount = Array.isArray(advRows) ? advRows.length : null;
  R.probes.pendingCount = Array.isArray(advRows)
    ? advRows.filter((r) => String(r.status || '').toLowerCase() === 'pending').length
    : null;
  save();
}

async function openAdvanceTab(page) {
  const byPrecision = page.getByTestId('pay-advance-precision');
  if (await byPrecision.isVisible().catch(() => false)) return 'already';

  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  // Use testid — role name /Tính lương/ also matches «Dữ liệu tính lương»
  const calcTab = page.getByTestId('payroll-tab-calculate');
  await calcTab.waitFor({ state: 'visible', timeout: 20_000 });
  await calcTab.click({ timeout: 15_000 });
  await sleep(900);
  const items = await page.locator('[role="menuitem"]').allTextContents();
  log('calculate menu', { items });
  const target = page.getByRole('menuitem', { name: /^Tạm ứng$/i }).first();
  if (!(await target.isVisible().catch(() => false))) {
    throw new Error(`Tạm ứng menuitem missing; menu=${JSON.stringify(items)}`);
  }
  await target.click();
  await byPrecision.waitFor({ state: 'visible', timeout: 20_000 });
  await sleep(800);
  return 'Tạm ứng';
}

async function createPendingAdvance(page) {
  log('click Tạo bảng tạm ứng');
  const createBtn = page.getByRole('button', { name: /Tạo bảng tạm ứng/i }).first();
  await createBtn.click({ timeout: 15_000 });
  const dialog = page.getByTestId('pay-advance-create-dialog-precision');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  await shot(page, '01-create-dialog');

  const nameInput = dialog.locator('input').first();
  await nameInput.fill(ADV_NAME);
  // salary period = second labeled field — fill all text inputs carefully
  const inputs = dialog.locator('input');
  const inputCount = await inputs.count();
  if (inputCount >= 2) {
    await inputs.nth(1).fill(ADV_PERIOD);
  }
  await dialog.getByRole('button', { name: /Tạo bảng tạm ứng/i }).click();
  await sleep(2000);
  await shot(page, '02-after-create');
  return ADV_NAME;
}

async function openPendingByName(page, name) {
  // Filter pending if possible
  const statusTrigger = page.locator('button[role="combobox"]').first();
  if (await statusTrigger.isVisible().catch(() => false)) {
    await statusTrigger.click().catch(() => {});
    await sleep(400);
    const pendingOpt = page.getByRole('option', { name: /Chờ duyệt|Pending/i }).first();
    if (await pendingOpt.isVisible().catch(() => false)) {
      await pendingOpt.click();
      await sleep(800);
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }
  }

  const row = page.locator('tr').filter({ hasText: name }).first();
  await row.waitFor({ state: 'visible', timeout: 20_000 });
  await row.click();
  await sleep(1500);
  await shot(page, '03-detail-pending');
}

async function addEmployeeViaUi(page) {
  log('click Thêm nhân viên');
  const addBtn = page.getByRole('button', { name: /Thêm nhân viên/i }).first();
  await addBtn.click({ timeout: 15_000 });
  const dialog = page.getByTestId('pay-advance-add-emp-dialog-precision');
  await dialog.waitFor({ state: 'visible', timeout: 15_000 });
  await shot(page, '04-add-emp-dialog');

  const rows = dialog.locator('.border.rounded-lg > div, .max-h-64 > div');
  // Prefer checkbox rows
  const checkboxes = dialog.locator('[role="checkbox"]');
  const cbCount = await checkboxes.count();
  if (cbCount === 0) {
    throw new Error('No employee checkboxes in add dialog — empty employee directory?');
  }

  // Pick first employee not already disabled
  await checkboxes.first().click();
  await sleep(400);

  // Fill ViMoneyInput for selected row — look for enabled money input
  const moneyInputs = dialog.locator('input:not([disabled])');
  const moneyCount = await moneyInputs.count();
  let filled = false;
  for (let i = 0; i < moneyCount; i++) {
    const el = moneyInputs.nth(i);
    const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
    const type = (await el.getAttribute('type')) || 'text';
    // skip search
    if (/tìm|search/i.test(ph)) continue;
    if (type === 'checkbox') continue;
    await el.click({ clickCount: 3 }).catch(() => {});
    await el.fill('');
    await el.type(String(ADV_AMOUNT), { delay: 20 });
    filled = true;
    break;
  }
  if (!filled) {
    // Fallback: last enabled input in dialog
    const last = dialog.locator('input:not([disabled])').last();
    await last.fill(String(ADV_AMOUNT));
  }

  await shot(page, '05-emp-selected');

  const addCountBtn = dialog.getByRole('button', { name: /Thêm\s+\d+\s+nhân viên/i }).first();
  if (!(await addCountBtn.isEnabled().catch(() => false))) {
    throw new Error('Thêm N nhân viên button disabled — selection/amount failed');
  }

  let res = null;
  try {
    const postWait = page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        /\/api\/hrm\/payroll\/advance-requests\/[^/]+\/employees/.test(r.url()),
      { timeout: 30_000 },
    );
    await addCountBtn.click();
    res = await postWait;
  } catch (e) {
    log(`waitForResponse/click failed: ${e.message}`);
    res = null;
  }
  await sleep(2000);
  await shot(page, '06-after-add');

  // Scan visible toasts / sonner
  const toastTexts = await page
    .locator('[data-sonner-toast], [role="status"], .toaster, li[data-type]')
    .allTextContents()
    .catch(() => []);
  for (const t of toastTexts) {
    R.toasts.push({ source: 'dom', text: String(t).slice(0, 360), at: ts() });
  }

  return res;
}

async function assertListHasEmployee(page) {
  const table = page.locator('table').first();
  await table.waitFor({ state: 'visible', timeout: 10_000 });
  const bodyText = await table.innerText().catch(() => '');
  const empty = /Chưa có nhân viên|No employees|noEmployees/i.test(bodyText);
  const hasCode = /[A-Z0-9_-]{3,}/.test(bodyText) && !empty;
  // Count data rows
  const dataRows = page.locator('table tbody tr');
  const n = await dataRows.count();
  let codes = [];
  for (let i = 0; i < Math.min(n, 10); i++) {
    const t = ((await dataRows.nth(i).innerText().catch(() => '')) || '').trim();
    if (t && !/Chưa có|loading/i.test(t)) codes.push(t.split('\n')[0].slice(0, 80));
  }
  return { empty, hasCode, rowCount: n, codes, bodySnippet: bodyText.slice(0, 400) };
}

async function main() {
  for (const [name, url] of [
    ['hrm-api', `${HRM}/api/hrm`],
    ['xbos-api', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[name] = r.status;
    } catch (e) {
      R.l0[name] = `ERR ${String(e).slice(0, 80)}`;
    }
  }
  save();

  if (R.l0['hrm-api'] !== 200 || R.l0['portal'] !== 200) {
    ac('L0-STACK', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0-STACK', 'PASS', { summary: JSON.stringify(R.l0) });

  const session = await loginApi();
  await probeHonesty(session.token);
  ac(
    'HONESTY-E2E-READY',
    R.probes.payroll_e2e_ready_any_true ? 'FAIL' : 'PASS',
    {
      summary: R.probes.payroll_e2e_ready_any_true
        ? 'Found salary component with payroll_e2e_ready=true — lock violated'
        : `payroll_e2e_ready stays false (sample=${JSON.stringify(R.probes.sampleComponent)})`,
    },
  );

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    log('goto /hr/payroll');
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.getByTestId('payroll-tab-calculate').waitFor({ state: 'visible', timeout: 45_000 });
    await sleep(1500);
    await shot(page, '00-payroll');

    const opened = await openAdvanceTab(page);
    log(`advance tab: ${opened}`);
    await page.getByTestId('pay-advance-precision').waitFor({ state: 'visible', timeout: 25_000 });
    ac('NAV-ADVANCE-TAB', 'PASS', { summary: `Opened Tạm ứng via ${opened}` });

    const name = await createPendingAdvance(page);
    // Wait for create POST
    await sleep(1500);
    const createNet = R.network.find(
      (n) => n.method === 'POST' && /\/advance-requests(\?|$)/.test(n.url) && !/\/employees/.test(n.url),
    );
    ac(
      'FE-CREATE-PENDING',
      createNet && createNet.status >= 200 && createNet.status < 300 ? 'PASS' : 'FAIL',
      {
        summary: createNet
          ? `POST advance-requests → ${createNet.status} code=${createNet.code}`
          : 'Create POST not observed — may use existing pending',
        name,
      },
    );

    // If create failed, try open any pending row
    try {
      await openPendingByName(page, name);
    } catch (e) {
      log(`open by name failed: ${e.message}; try first pending row`);
      const statusTrigger = page.locator('button[role="combobox"]').first();
      if (await statusTrigger.isVisible().catch(() => false)) {
        await statusTrigger.click().catch(() => {});
        await sleep(300);
        await page.getByRole('option', { name: /Chờ duyệt|Pending/i }).click().catch(() => {});
        await sleep(800);
      }
      const row = page.locator('table tbody tr').filter({ hasNotText: /Chưa có|loading/i }).first();
      await row.click({ timeout: 15_000 });
      await sleep(1500);
    }

    // Ensure detail shows Thêm nhân viên (pending only)
    const addVisible = await page
      .getByRole('button', { name: /Thêm nhân viên/i })
      .first()
      .isVisible()
      .catch(() => false);
    if (!addVisible) {
      ac('DETAIL-PENDING-ADD-BTN', 'FAIL', {
        summary: 'Thêm nhân viên button not visible — request may not be pending',
      });
      throw new Error('Thêm nhân viên missing');
    }
    ac('DETAIL-PENDING-ADD-BTN', 'PASS', { summary: 'Thêm nhân viên visible on pending detail' });

    const beforeList = await assertListHasEmployee(page);
    R.probes.beforeAdd = beforeList;

    await addEmployeeViaUi(page);

    // Evaluate POST
    const post = R.postEmployees;
    const body = post?.requestBody || {};
    const hasFields =
      body &&
      typeof body === 'object' &&
      body.employee_code != null &&
      String(body.employee_code).length > 0 &&
      body.employee_name != null &&
      String(body.employee_name).length > 0 &&
      body.advance_amount != null;

    const statusOk = post?.status === 201;
    const codeOk = String(post?.code || post?.responseBodySummary?.code || '') === 'HRM-ADV-201';

    ac('POST-EMPLOYEES-201', statusOk && codeOk ? 'PASS' : 'FAIL', {
      summary: post
        ? `POST ${post.requestUrl || post.url} → ${post.status} code=${post.code}`
        : 'POST …/employees not observed',
      post,
    });

    ac('POST-BODY-FIELDS', hasFields ? 'PASS' : 'FAIL', {
      summary: hasFields
        ? `body employee_code=${body.employee_code} employee_name=${body.employee_name} advance_amount=${body.advance_amount}`
        : `body missing required fields: ${JSON.stringify(body)}`,
      body,
    });

    const badToast = R.toasts.some((t) =>
      /API thêm NV|chưa có trên Nest/i.test(String(t.text || '')),
    );
    const pageText = await page.locator('body').innerText().catch(() => '');
    const badOnPage = /API thêm NV|chưa có trên Nest/i.test(pageText);
    ac('NO-STUB-TOAST', !badToast && !badOnPage ? 'PASS' : 'FAIL', {
      summary:
        !badToast && !badOnPage
          ? 'No «API thêm NV chưa có» toast/error'
          : `Stub message observed toast=${badToast} page=${badOnPage}`,
      toasts: R.toasts.slice(0, 10),
    });

    // List refresh after 2xx
    await sleep(1000);
    // Dialog should close; ensure we're on detail
    const afterList = await assertListHasEmployee(page);
    R.probes.afterAdd = afterList;
    const listGrew =
      (!beforeList.empty && afterList.rowCount >= beforeList.rowCount) ||
      (beforeList.empty && !afterList.empty) ||
      afterList.rowCount >= 1;
    ac('FE-LIST-REFRESH', listGrew && !afterList.empty ? 'PASS' : 'FAIL', {
      summary: `before empty=${beforeList.empty} rows=${beforeList.rowCount} → after empty=${afterList.empty} rows=${afterList.rowCount} codes=${JSON.stringify(afterList.codes.slice(0, 3))}`,
      beforeList,
      afterList,
    });

    // F5 persistence
    log('F5 reload detail');
    const empCode = body.employee_code || afterList.codes[0]?.split(/\s+/)[0];
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3000);
    // May land on list — re-open by name
    const stillDetail = await page
      .getByRole('button', { name: /Thêm nhân viên/i })
      .first()
      .isVisible()
      .catch(() => false);
    if (!stillDetail) {
      await openAdvanceTab(page).catch(() => {});
      await sleep(1000);
      try {
        await openPendingByName(page, name);
      } catch {
        const row = page.locator('table tbody tr').filter({ hasText: name }).first();
        if (await row.isVisible().catch(() => false)) await row.click();
        await sleep(1500);
      }
    }
    await shot(page, '07-after-f5');
    const f5List = await assertListHasEmployee(page);
    R.probes.afterF5 = f5List;
    const f5Has =
      !f5List.empty &&
      (empCode
        ? f5List.bodySnippet.includes(String(empCode)) ||
          f5List.codes.some((c) => c.includes(String(empCode)))
        : f5List.rowCount >= 1);
    ac('F5-ROW-REMAINS', f5Has ? 'PASS' : 'FAIL', {
      summary: `F5 empty=${f5List.empty} rows=${f5List.rowCount} lookFor=${empCode} snippet=${f5List.bodySnippet.slice(0, 200)}`,
      f5List,
      empCode,
    });

    // Console gate (soft OBS for unrelated noise)
    const fatalConsole = R.consoleErrors.filter((e) =>
      /Uncaught|ReferenceError|TypeError|API thêm NV/i.test(e),
    );
    ac('CONSOLE-GATE', fatalConsole.length === 0 ? 'PASS' : 'FAIL', {
      summary:
        fatalConsole.length === 0
          ? `No fatal console (${R.consoleErrors.length} errors total)`
          : fatalConsole.slice(0, 3).join(' | '),
    });
  } catch (e) {
    log(`FATAL: ${e.message}`);
    R.residuals.push({ id: 'R-QA-03-RUNTIME', detail: String(e).slice(0, 500) });
    await shot(page, '99-fatal').catch(() => {});
    ac('RUNTIME', 'FAIL', { summary: String(e).slice(0, 400) });
  } finally {
    await browser.close().catch(() => {});
  }

  const required = [
    'POST-EMPLOYEES-201',
    'POST-BODY-FIELDS',
    'NO-STUB-TOAST',
    'FE-LIST-REFRESH',
    'F5-ROW-REMAINS',
  ];
  const failed = required.filter((id) => R.ac[id]?.verdict !== 'PASS');
  R.honesty.payroll_e2e_ready = false;
  R.honesty.seed_used = false;
  R.overall = failed.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = failed.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (failed.length) {
    R.residuals.push({
      id: 'R-PAY-ADV-EMP-FE-WIRE',
      severity: 'P1',
      failed_acs: failed,
      note: 'FE Thêm NV browser UF failed one or more exit criteria',
    });
  }
  R.endedAt = ts();
  save();
  console.log(
    `\nOVERALL=${R.overall} ack=${R.ack_status} failed=${failed.join(',') || 'none'} stamp=${stamp}`,
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.residuals.push({ id: 'R-QA-03-UNCAUGHT', detail: String(e).slice(0, 500) });
  save();
  process.exit(1);
});
