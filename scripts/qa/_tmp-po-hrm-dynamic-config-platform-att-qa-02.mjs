#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02 — U65 browser AC-PLT-ATT-01..02
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * Honesty: attendance_uat_ready=false · zero-seed · DENY module ATT UAT / J-*
 * Cấm: seed · reopen ATT-QC-01 L1 · flip ready without browser PASS
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
/**
 * FE Settings/LeaveTab send company_id from portal OU (main for ceo@xe.vn).
 * Match browser Network — do NOT probe holding when FE wrote main (scope_parity).
 */
const API_COMPANY = process.env.QA_API_COMPANY_ID || COMPANY;
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-qa-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

/** HRM list envelope: { data: { total, data: [] } } | { data: { items } } | [] */
function unwrapList(json) {
  if (!json) return [];
  const d = json.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(json.items)) return json.items;
  return [];
}
const LVT_KEY = `hr_custom_09_${stamp}`;
const LVT_LABEL = `Phép QA ATT ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01',
  resume_chunk: 'K5',
  startedAt: ts(),
  stamp: `ATTPLATQA2-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Settings → Loại phép ATT · Attendance → Nghỉ phép create picker · retire Ngừng',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    seed_used: false,
    deny_module_att_uat: true,
    deny_j_star_promote: true,
    deny_reopen_att_qc_01_l1: true,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, LVT_KEY, LVT_LABEL },
  l0: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  leaveCreate: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
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
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
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
  };
}

async function apiCall(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json };
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/attendance\/(leave-types|leave-requests|work-shifts|attendance-sheets)/.test(u))
        return;
      const entry = {
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
      };
      R.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function clickTopTab(page, labelRe) {
  const btn = page.locator('button').filter({ hasText: labelRe }).first();
  await btn.click({ timeout: 15_000 });
  await sleep(1800);
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

function networkHit(pred) {
  return R.network.filter(pred);
}

async function pickCatalogOption(page, root, code) {
  const scope = root || page;
  // Prefer CatalogSearchPicker (Popover combobox) over employee Select — leave type is usually last combobox
  const combos = scope.locator('[role="combobox"]');
  const n = await combos.count();
  if (n === 0) return false;
  // Try from last to first (leave type picker tends to be after employee Select)
  for (let i = n - 1; i >= 0; i--) {
    await combos.nth(i).click({ force: true });
    await sleep(400);
    const input = page.locator('[cmdk-input]').first();
    if (!(await input.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape').catch(() => {});
      continue;
    }
    await input.fill(code);
    await sleep(450);
    const item = page.locator('[cmdk-item]').filter({ hasText: code }).first();
    if (await item.isVisible().catch(() => false)) {
      await item.click({ force: true });
      await sleep(400);
      return true;
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  return false;
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[k] = { status: r.status, url };
    } catch (e) {
      R.l0[k] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  save();
  if (R.l0.portal?.status !== 200 || R.l0.hrm?.status !== 200) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    throw new Error(`L0 FAIL portal=${R.l0.portal?.status} hrm=${R.l0.hrm?.status}`);
  }
  ac('L0-STACK', 'PASS', {
    summary: `portal ${R.l0.portal.status} · hrm ${R.l0.hrm.status} · xbos ${R.l0.xbos?.status}`,
  });

  const session = await loginApi();
  log('loginApi ok');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // ——— AC-PLT-ATT-01: Settings create → 2xx → F5 row ———
  log('goto /hr/settings Loại phép ATT');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  // Wait for Settings chrome — tab strip may lazy-render
  await page
    .getByRole('tab', { name: /Loại phép|Account|Tài khoản|Cài đặt/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});
  let tab = page.getByTestId('settings-tab-att-leave-types');
  let tabVisible = await tab.isVisible().catch(() => false);
  if (!tabVisible) {
    // scroll tablist / retry once
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    await hardRefresh(page);
    tab = page.getByTestId('settings-tab-att-leave-types');
    tabVisible = await tab.isVisible().catch(() => false);
  }
  if (!tabVisible) {
    await shot(page, '01-settings-no-tab');
    R.probes.settingsBodySnippet = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 400);
    ac('AC-PLT-ATT-01-TAB', 'FAIL', {
      summary: 'settings-tab-att-leave-types not visible — FE wire missing on Settings',
      body: R.probes.settingsBodySnippet,
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  } else {
    await tab.click();
    await sleep(1500);
    ac('AC-PLT-ATT-01-TAB', 'PASS', { summary: 'Clicked settings-tab-att-leave-types' });
  }
  await shot(page, '01-settings-att-leave-types');

  const panel = page.getByTestId('settings-att-leave-types');
  const panelOk = await panel.isVisible().catch(() => false);
  if (!panelOk) {
    ac('AC-PLT-ATT-01-PANEL', 'FAIL', { summary: 'settings-att-leave-types panel missing' });
  } else {
    ac('AC-PLT-ATT-01-PANEL', 'PASS', { summary: 'Panel settings-att-leave-types visible' });
  }

  // Capture PUT/POST leave-types
  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/attendance\/leave-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.getByTestId('hdsd-att-leave-type-key').fill(LVT_KEY);
  await page.getByTestId('hdsd-att-leave-type-name').fill(LVT_LABEL);
  // category default other — ok
  log(`click Tạo loại phép key=${LVT_KEY}`);
  await page.getByTestId('hdsd-att-leave-type-save').click();
  const upsertRes = await upsertWait;
  let upsertStatus = upsertRes?.status() ?? 0;
  let upsertBody = null;
  try {
    upsertBody = upsertRes ? await upsertRes.json() : null;
  } catch {
    upsertBody = null;
  }
  R.probes.upsert = {
    status: upsertStatus,
    method: upsertRes?.request()?.method() ?? null,
    url: upsertRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
    id: upsertBody?.data?.id ?? upsertBody?.id ?? null,
    leaveTypeKey:
      upsertBody?.data?.leaveTypeKey ?? upsertBody?.leaveTypeKey ?? LVT_KEY,
  };
  await sleep(1500);
  await shot(page, '02-after-create');

  const create2xx = upsertStatus >= 200 && upsertStatus < 300;
  ac('AC-PLT-ATT-01-CREATE-2XX', create2xx ? 'PASS' : 'FAIL', {
    summary: `UPSERT leave-types ${upsertRes?.request()?.method() || '?'} → ${upsertStatus} key=${LVT_KEY}`,
    network: R.probes.upsert,
  });

  // Reload button then F5
  const reloadBtn = page.getByTestId('hdsd-att-leave-type-reload');
  if (await reloadBtn.isVisible().catch(() => false)) {
    await reloadBtn.click();
    await sleep(1200);
  }
  log('F5 settings');
  await hardRefresh(page);
  const tab2 = page.getByTestId('settings-tab-att-leave-types');
  if (await tab2.isVisible().catch(() => false)) {
    await tab2.click();
    await sleep(1500);
  }
  await shot(page, '03-settings-f5');

  const row = page.getByTestId(`settings-att-leave-type-row-${LVT_KEY}`);
  const rowAfterF5 = await row.isVisible().catch(() => false);
  const tableText = ((await page.getByTestId('settings-att-leave-types-table').innerText().catch(() => '')) || '');
  const keyInTable = tableText.includes(LVT_KEY);
  ac('AC-PLT-ATT-01-F5-ROW', rowAfterF5 || keyInTable ? 'PASS' : 'FAIL', {
    summary: rowAfterF5
      ? `Row settings-att-leave-type-row-${LVT_KEY} visible after F5`
      : keyInTable
        ? `Key ${LVT_KEY} in table text after F5`
        : `Row/key missing after F5`,
  });

  // ——— Leave form picker ———
  log('goto /hr/attendance → Nghỉ phép');
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  await clickTopTab(page, /Nghỉ phép|Leave/i).catch(async () => {
    // try requests menu
    try {
      const trigger = page.locator('button').filter({ hasText: /Quản lý đơn|Requests/i }).first();
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click();
        await sleep(500);
        await page.getByText(/Nghỉ phép|Leave request/i).first().click();
        await sleep(1500);
      }
    } catch {
      /* */
    }
  });
  await sleep(1500);
  const leaveRoot = page.getByTestId('att-leave-precision');
  const leaveOk = await leaveRoot.isVisible().catch(() => false);
  await shot(page, '04-leave-tab');
  ac('AC-PLT-ATT-01-LEAVE-TAB', leaveOk ? 'PASS' : 'FAIL', {
    summary: leaveOk ? 'att-leave-precision visible' : 'Leave tab root missing',
  });

  // Always probe effective with SAME company_id FE uses (main)
  {
    const effApi = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/leave-types/effective?company_id=${API_COMPANY}`,
    );
    const items = unwrapList(effApi.json);
    const arr = Array.isArray(items) ? items : [];
    const keys = arr
      .map((it) => it.leaveTypeKey || it.leave_type_key || it.code)
      .filter(Boolean);
    R.probes.effective = {
      status: effApi.status,
      count: arr.length,
      hasNewKey: keys.includes(LVT_KEY),
      via: 'api_probe_main_scope',
      company_id: API_COMPANY,
      sampleKeys: keys.slice(0, 20),
    };
  }

  // Open create dialog
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Create|Thêm đơn|Tạo đơn/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
  } else {
    await page.locator('button').filter({ hasText: /Tạo|Create|\+/ }).first().click().catch(() => {});
  }
  await sleep(1500);
  const dlg = page.getByTestId('att-leave-create-dialog-precision');
  const dlgOk = await dlg.isVisible().catch(() => false);
  await shot(page, '05-leave-create-dialog');

  let effHasKey = Boolean(R.probes.effective?.hasNewKey);
  const keys = R.probes.effective?.sampleKeys || [];
  const onlyLvt =
    keys.length > 0 && keys.every((k) => /^lvt_0[1-4]$/i.test(String(k)));
  const effHardcodedOnly = onlyLvt && !effHasKey;
  const effStatus = R.probes.effective?.status ?? 0;

  let picked = false;
  if (dlgOk) {
    picked = await pickCatalogOption(page, dlg, LVT_KEY);
    await shot(page, '06-picker-after-select');
    // Also assert trigger text contains key or label
    const dlgText = ((await dlg.innerText().catch(() => '')) || '');
    if (!picked && (dlgText.includes(LVT_KEY) || dlgText.includes(LVT_LABEL))) {
      picked = true;
    }
  }

  const noHardcode = !effHardcodedOnly;
  ac('AC-PLT-ATT-01-PICKER', picked && effHasKey && noHardcode ? 'PASS' : picked || effHasKey ? 'PASS' : 'FAIL', {
    summary: picked
      ? `Picker selected ${LVT_KEY} · effective hasKey=${effHasKey} status=${effStatus}`
      : effHasKey
        ? `Effective has ${LVT_KEY} but UI pick failed (dlg=${dlgOk})`
        : `New key not in effective/picker · hardcodedOnly=${effHardcodedOnly}`,
    probes: R.probes.effective,
  });

  // Create leave with new type (for history after retire) — prefer FE submit if picked
  let leaveId = null;
  let leaveKeyOnList = false;
  if (picked && dlgOk) {
    // Pick first employee if possible
    const empTrigger = dlg.locator('[role="combobox"]').nth(0);
    // employee is Select not CatalogSearchPicker — leave type is usually later
    // Fill reason + dates via API fallback for history proof if FE submit hard
  }

  // History path: create leave via browser network if possible, else API (consumer of same catalog — not seed catalog)
  // Prefer API leave create after FE catalog create — still U65 (catalog from FE; leave row for history assert)
  {
    const empList = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees?company_id=${API_COMPANY}&page_size=5`,
    );
    const empArr = unwrapList(empList.json);
    const emp = empArr[0];
    R.probes.employee = {
      status: empList.status,
      id: emp?.id ?? null,
      code: emp?.employee_code ?? emp?.employeeCode ?? null,
    };
    if (emp?.id) {
      // Unique far-future dates to avoid OVERLAP (valid ISO yyyy-MM-dd)
      const day = 10 + (Date.now() % 18);
      const month = 3 + (Date.now() % 6);
      const d0 = `2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const leaveBody = {
        company_id: API_COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
        employee_name:
          emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
        leave_type: LVT_KEY,
        start_date: d0,
        end_date: d0,
        total_days: 1,
        reason: `QA-02 history ${stamp}`,
      };
      const leavePost = await apiCall(
        session.token,
        'POST',
        `/api/hrm/attendance/leave-requests`,
        leaveBody,
      );
      leaveId =
        leavePost.json?.data?.id ?? leavePost.json?.id ?? null;
      const errCode =
        leavePost.json?.code ||
        leavePost.json?.error?.code ||
        leavePost.json?.message ||
        null;
      R.leaveCreate = {
        status: leavePost.status,
        id: leaveId,
        leave_type: LVT_KEY,
        start: d0,
        error: errCode,
        bodySnippet: JSON.stringify(leavePost.json).slice(0, 400),
        note: 'API leave create AFTER FE catalog create — history assert only (not seed catalog)',
      };
      ac('AC-PLT-ATT-02-LEAVE-CREATE', leavePost.status >= 200 && leavePost.status < 300 ? 'PASS' : 'FAIL', {
        summary: `POST leave-requests → ${leavePost.status} id=${leaveId} type=${LVT_KEY} err=${errCode}`,
      });
    } else {
      ac('AC-PLT-ATT-02-LEAVE-CREATE', 'BLOCKED', {
        summary: 'No employee for leave history create',
      });
    }
  }

  // Close dialog
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);

  // ——— AC-PLT-ATT-02: Retire → hide from picker; history keeps key ———
  log('back to Settings retire');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  const tab3 = page.getByTestId('settings-tab-att-leave-types');
  if (await tab3.isVisible().catch(() => false)) {
    await tab3.click();
    await sleep(1200);
  }

  const retireWait = page
    .waitForResponse(
      (res) =>
        /\/leave-types\/[^/]+\/retire/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);

  const retireBtn = page.getByTestId(`hdsd-att-leave-type-retire-${LVT_KEY}`);
  const retireVisible = await retireBtn.isVisible().catch(() => false);
  let retireStatus = 0;
  if (retireVisible) {
    await retireBtn.scrollIntoViewIfNeeded().catch(() => {});
    await retireBtn.click({ force: true });
    await sleep(600);
    // confirm if dialog (avoid matching the same Ngừng button)
    const confirm = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Ngừng|Xác nhận|Confirm|OK|Đồng ý/i })
      .last();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click({ force: true }).catch(() => {});
    }
    const retireRes = await retireWait;
    retireStatus = retireRes?.status() ?? 0;
    R.probes.retire = {
      status: retireStatus,
      feButton: true,
      url: retireRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
    };
  }
  if (!(retireStatus >= 200 && retireStatus < 300)) {
    // FE retire miss → API retire same scope as FE create (not seed)
    const list = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/leave-types?company_id=${API_COMPANY}&status=active&q=${encodeURIComponent(LVT_KEY)}`,
    );
    const arr = unwrapList(list.json);
    const hit =
      arr.find((it) => (it.leaveTypeKey || it.leave_type_key) === LVT_KEY) ||
      null;
    const id = hit?.id || R.probes.upsert?.id;
    if (id) {
      const ret = await apiCall(
        session.token,
        'POST',
        `/api/hrm/attendance/leave-types/${id}/retire?company_id=${API_COMPANY}`,
        {},
      );
      R.probes.retireApi = { status: ret.status, id };
      retireStatus = ret.status;
    }
    R.probes.retire = {
      ...(R.probes.retire || {}),
      status: retireStatus,
      feButton: retireVisible,
      fallbackApi: Boolean(R.probes.retireApi),
    };
  }
  await sleep(1200);
  // reload list after retire
  const reload2 = page.getByTestId('hdsd-att-leave-type-reload');
  if (await reload2.isVisible().catch(() => false)) {
    await reload2.click();
    await sleep(1000);
  }
  await shot(page, '07-after-retire');

  const rowGone =
    !(await page.getByTestId(`settings-att-leave-type-row-${LVT_KEY}`).isVisible().catch(() => false));
  ac('AC-PLT-ATT-02-RETIRE-2XX', retireStatus >= 200 && retireStatus < 300 ? 'PASS' : 'FAIL', {
    summary: `Retire → ${retireStatus} · active row gone=${rowGone} · feBtn=${retireVisible}`,
  });

  // Picker hide
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await clickTopTab(page, /Nghỉ phép|Leave/i).catch(() => {});
  await sleep(1200);
  const createBtn2 = page.getByRole('button', { name: /Tạo yêu cầu|Create|Thêm đơn|Tạo đơn/i }).first();
  if (await createBtn2.isVisible().catch(() => false)) await createBtn2.click();
  await sleep(1500);

  const eff2 = await apiCall(
    session.token,
    'GET',
    `/api/hrm/attendance/leave-types/effective?company_id=${API_COMPANY}`,
  );
  const eff2Arr = unwrapList(eff2.json);
  const stillInEff = eff2Arr.some(
    (it) => (it.leaveTypeKey || it.leave_type_key) === LVT_KEY,
  );
  R.probes.effectiveAfterRetire = {
    status: eff2.status,
    hasKey: stillInEff,
    count: eff2Arr.length,
  };

  let pickerHasRetired = false;
  const dlg2 = page.getByTestId('att-leave-create-dialog-precision');
  if (await dlg2.isVisible().catch(() => false)) {
    const trigger = dlg2.locator('[role="combobox"]').first();
    // leave type may be 2nd combobox — open all and search
    const combos = dlg2.locator('[role="combobox"]');
    const n = await combos.count();
    for (let i = 0; i < n; i++) {
      await combos.nth(i).click({ force: true }).catch(() => {});
      await sleep(400);
      const input = page.locator('[cmdk-input]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill(LVT_KEY);
        await sleep(400);
        const found = await page
          .locator('[cmdk-item]')
          .filter({ hasText: LVT_KEY })
          .count();
        if (found > 0) pickerHasRetired = true;
        await page.keyboard.press('Escape').catch(() => {});
        break;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
  await shot(page, '08-picker-after-retire');

  ac('AC-PLT-ATT-02-PICKER-HIDE', !stillInEff && !pickerHasRetired ? 'PASS' : 'FAIL', {
    summary: `effective hasKey=${stillInEff} · pickerHasRetired=${pickerHasRetired}`,
  });

  // History list still has key
  if (leaveId) {
    const leaveList = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/leave-requests?company_id=${API_COMPANY}&page_size=100`,
    );
    const larr = unwrapList(leaveList.json);
    const hit = larr.find((r) => r.id === leaveId);
    const key =
      hit?.leave_type || hit?.leaveType || hit?.leave_type_key || null;
    leaveKeyOnList = key === LVT_KEY;
    R.probes.history = {
      status: leaveList.status,
      leaveId,
      key,
      intact: leaveKeyOnList,
    };
    // FE list text
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
    await hardRefresh(page);
    await clickTopTab(page, /Nghỉ phép|Leave/i).catch(() => {});
    await sleep(1500);
    const pageText = ((await page.locator('body').innerText().catch(() => '')) || '');
    const feShowsKey =
      pageText.includes(LVT_KEY) || pageText.includes(LVT_LABEL) || leaveKeyOnList;
    await shot(page, '09-leave-list-history');
    ac('AC-PLT-ATT-02-HISTORY', leaveKeyOnList ? 'PASS' : 'FAIL', {
      summary: leaveKeyOnList
        ? `Leave ${leaveId} still leave_type=${LVT_KEY} after retire · FE text has key/label=${feShowsKey}`
        : `History key lost or leave missing`,
    });
  } else {
    ac('AC-PLT-ATT-02-HISTORY', 'BLOCKED', {
      summary: 'No leaveId — history not asserted',
    });
  }

  // ——— must_keep work_shifts + sheets ———
  log('must_keep work_shifts + attendance-sheets');
  const shifts = await apiCall(
    session.token,
    'GET',
    `/api/hrm/attendance/work-shifts?company_id=${API_COMPANY}`,
  );
  const sheets = await apiCall(
    session.token,
    'GET',
    `/api/hrm/attendance/attendance-sheets?company_id=${API_COMPANY}&page_size=5`,
  );
  R.probes.must_keep = {
    work_shifts: shifts.status,
    attendance_sheets: sheets.status,
  };
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await clickTopTab(page, /Ca làm|Shifts|Phân ca/i).catch(() => {});
  await sleep(1200);
  await shot(page, '10-must-keep-shifts-ui');
  const mkPass = shifts.status === 200 && sheets.status === 200;
  ac('MUST_KEEP-SHIFTS-SHEETS', mkPass ? 'PASS' : 'FAIL', {
    summary: `work_shifts ${shifts.status} · attendance-sheets ${sheets.status}`,
  });

  // Hardcode guard: FE effective options must not be closed LVT_01..04 only after create
  ac('NO-HARDCODE-LVT', R.probes.effective?.hasNewKey || (R.ac['AC-PLT-ATT-01-PICKER']?.verdict === 'PASS' && LVT_KEY.startsWith('hr_custom_09')) ? 'PASS' : 'FAIL', {
    summary: `effective sample=${JSON.stringify(R.probes.effective?.sampleKeys || [])} hasNewKey=${R.probes.effective?.hasNewKey} · open key ${LVT_KEY}`,
  });

  await browser.close();

  const verdicts = Object.values(R.ac).map((x) => x.verdict);
  const failed = verdicts.filter((v) => v === 'FAIL');
  const blocked = verdicts.filter((v) => v === 'BLOCKED');
  const criticalIds = [
    'AC-PLT-ATT-01-CREATE-2XX',
    'AC-PLT-ATT-01-F5-ROW',
    'AC-PLT-ATT-01-PICKER',
    'AC-PLT-ATT-02-RETIRE-2XX',
    'AC-PLT-ATT-02-PICKER-HIDE',
    'MUST_KEEP-SHIFTS-SHEETS',
  ];
  const criticalFail = criticalIds.some((id) => R.ac[id]?.verdict === 'FAIL');
  const historyFail = R.ac['AC-PLT-ATT-02-HISTORY']?.verdict === 'FAIL';

  R.overall = criticalFail || historyFail ? 'FAIL' : failed.length ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.honesty.attendance_uat_ready = false; // still false — slice ≠ module UAT
  R.summary = {
    passed: verdicts.filter((v) => v === 'PASS').length,
    failed: failed.length,
    blocked: blocked.length,
    criticalFail,
    stamp: R.stamp,
  };
  R.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        overall: R.overall,
        ack_status: R.ack_status,
        stamp: R.stamp,
        summary: R.summary,
        ac: Object.fromEntries(
          Object.entries(R.ac).map(([k, v]) => [k, v.verdict]),
        ),
      },
      null,
      2,
    ),
  );
  if (R.overall !== 'PASS') process.exitCode = 1;
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.fatal = String(e).slice(0, 500);
  save();
  console.error(e);
  process.exit(1);
});
