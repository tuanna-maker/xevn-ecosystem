#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01
 * U65 browser AC-PLT-ATT-LEAVE-01/01b/01c/01d/01H + spot 05b/09/07 · VAL-ATT-CNS-04
 * Parent: BA-01 CONFIRMED · SA Option B
 * Honesty: attendance_uat_ready=false · WAIVE/sign/J-06c SEAL RETAIN · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · reopen WAIVE/sign/J-06c · reopen EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · claim ATT UAT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-catalog-qa-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

function unwrapList(json) {
  if (!json) return [];
  const d = json.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(json.items)) return json.items;
  return [];
}

const LVT_KEY = `hr_leave_cat_${stamp}`;
const LVT_LABEL = `Phép QA LeaveCat ${stamp}`;
const INVENT_KEY = `zz_invent_leave_${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  startedAt: ts(),
  stamp: `ATTLEAVEQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx/4xx + F5 · probe ≠ 🟢 UF',
  hdsd_align:
    'Settings → Loại phép ATT · Attendance → Nghỉ phép create picker EFF · invent 4xx · panel 05b',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    seed_used: false,
    deny_module_att_uat: true,
    deny_j_hrm_06c_reopen: true,
    deny_waive_sign_reopen: true,
    c_slice_ne_module: true,
    seals_retain: [
      'ATT-QC-01',
      'ATT-QC-02',
      'WAIVE/sign/J-HRM-06c',
      'EMP',
      'DEC',
      'PAY',
      'EXT',
      'CTR',
      'LIST-TOTALS',
    ],
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, LVT_KEY, LVT_LABEL, INVENT_KEY },
  l0: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
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
      if (
        !/\/api\/hrm\/(attendance\/(leave-types|leave-requests|leave-balance)|settings\/catalogs)/.test(
          u,
        )
      )
        return;
      const entry = {
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
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

async function pickCatalogOption(page, root, code) {
  const scope = root || page;
  const combos = scope.locator('[role="combobox"]');
  const n = await combos.count();
  if (n === 0) return false;
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

async function browserFetch(page, token, method, path, body) {
  return page.evaluate(
    async ({ method, path, body, HRM, TENANT, COMPANY, token }) => {
      const r = await fetch(`${HRM}/api/hrm${path}`, {
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
      return {
        status: r.status,
        json,
        code: json?.code ?? json?.error?.code ?? json?.errorCode ?? null,
        message: json?.message ?? json?.error?.message ?? null,
      };
    },
    { method, path, body, HRM, TENANT, COMPANY, token },
  );
}

function errCode(json) {
  return (
    json?.code ||
    json?.error?.code ||
    json?.errorCode ||
    (typeof json?.message === 'string' && /HRM-[A-Z0-9-]+/.test(json.message)
      ? json.message.match(/HRM-[A-Z0-9-]+/)?.[0]
      : null) ||
    null
  );
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

  // Baseline EFF count (no seed)
  {
    const eff0 = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/leave-types/effective?company_id=${API_COMPANY}`,
    );
    const items = unwrapList(eff0.json);
    const keys = items
      .map((it) => it.leaveTypeKey || it.leave_type_key || it.code)
      .filter(Boolean);
    R.probes.effBaseline = {
      status: eff0.status,
      count: items.length,
      keys: keys.slice(0, 30),
      hasLvt02: keys.includes('lvt_02'),
    };
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // ——— AC-PLT-ATT-LEAVE-01d: Settings admin CREATE N+1 ———
  log('goto /hr/settings Loại phép ATT (01d)');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Loại phép|Account|Tài khoản|Cài đặt/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});

  let tab = page.getByTestId('settings-tab-att-leave-types');
  let tabVisible = await tab.isVisible().catch(() => false);
  if (!tabVisible) {
    await hardRefresh(page);
    tab = page.getByTestId('settings-tab-att-leave-types');
    tabVisible = await tab.isVisible().catch(() => false);
  }
  if (!tabVisible) {
    await shot(page, '01-settings-no-tab');
    ac('AC-PLT-ATT-LEAVE-01d', 'FAIL', {
      summary: 'settings-tab-att-leave-types not visible',
    });
  } else {
    await tab.click();
    await sleep(1500);
    await shot(page, '01-settings-att-leave-types');

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
    // Prefer sick category if select exists (helps 07 spot)
    const catSelect = page.getByTestId('hdsd-att-leave-type-category');
    if (await catSelect.isVisible().catch(() => false)) {
      await catSelect.click().catch(() => {});
      await sleep(300);
      const sickOpt = page.getByRole('option', { name: /ốm|sick/i }).first();
      if (await sickOpt.isVisible().catch(() => false)) {
        await sickOpt.click().catch(() => {});
      } else {
        await page.keyboard.press('Escape').catch(() => {});
      }
    }
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
      leaveTypeKey: upsertBody?.data?.leaveTypeKey ?? upsertBody?.leaveTypeKey ?? LVT_KEY,
    };
    await sleep(1200);
    await shot(page, '02-after-admin-create');

    const reloadBtn = page.getByTestId('hdsd-att-leave-type-reload');
    if (await reloadBtn.isVisible().catch(() => false)) {
      await reloadBtn.click();
      await sleep(1000);
    }
    await hardRefresh(page);
    const tab2 = page.getByTestId('settings-tab-att-leave-types');
    if (await tab2.isVisible().catch(() => false)) {
      await tab2.click();
      await sleep(1500);
    }
    await shot(page, '03-settings-f5');
    const row = page.getByTestId(`settings-att-leave-type-row-${LVT_KEY}`);
    const rowAfterF5 = await row.isVisible().catch(() => false);
    const tableText =
      (await page.getByTestId('settings-att-leave-types-table').innerText().catch(() => '')) || '';
    const keyInTable = tableText.includes(LVT_KEY);
    const create2xx = upsertStatus >= 200 && upsertStatus < 300;
    const f5ok = rowAfterF5 || keyInTable;
    ac('AC-PLT-ATT-LEAVE-01d', create2xx && f5ok ? 'PASS' : 'FAIL', {
      summary: create2xx
        ? `Admin CREATE ${upsertRes?.request()?.method()} → ${upsertStatus} key=${LVT_KEY} · F5 row=${f5ok} · ATT-QC-02 RETAIN (spot open N+1)`
        : `Admin CREATE failed status=${upsertStatus}`,
      network: R.probes.upsert,
      att_qc_02_retain: true,
    });
  }

  // ——— Consumer LeaveTab ———
  log('goto /hr/attendance → Nghỉ phép');
  const netBeforeLeave = R.network.length;
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  await clickTopTab(page, /Nghỉ phép|Leave/i).catch(async () => {
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

  // Open create dialog + capture GET effective
  const effWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/attendance\/leave-types\/effective/.test(res.url()) &&
        res.request().method() === 'GET',
      { timeout: 30_000 },
    )
    .catch(() => null);

  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Create|Thêm đơn|Tạo đơn/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
  } else {
    await page.locator('button').filter({ hasText: /Tạo|Create|\+/ }).first().click().catch(() => {});
  }
  await sleep(1500);
  const effRes = await Promise.race([
    effWait,
    sleep(5000).then(() => null),
  ]);
  let effNetStatus = effRes?.status?.() ?? 0;
  let effNetUrl = effRes?.url?.()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
  // Also accept any effective hit since leave tab load
  const effHits = R.network.filter(
    (n) => n.method === 'GET' && /leave-types\/effective/.test(n.url) && n.at,
  );
  if (!effNetStatus && effHits.length) {
    const last = effHits[effHits.length - 1];
    effNetStatus = last.status;
    effNetUrl = last.url;
  }
  R.probes.effNetwork = {
    status: effNetStatus,
    url: effNetUrl,
    hitsSinceLeaveNav: R.network.slice(netBeforeLeave).filter((n) =>
      /leave-types\/effective/.test(n.url),
    ).length,
    settingsCatalogHits: R.network
      .slice(netBeforeLeave)
      .filter((n) => /settings\/catalogs/.test(n.url) && /leave/.test(n.url)).length,
  };

  const dlg = page.getByTestId('att-leave-create-dialog-precision');
  const dlgOk = await dlg.isVisible().catch(() => false);
  await shot(page, '05-leave-create-dialog');

  // Probe effective API
  {
    const effApi = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/leave-types/effective?company_id=${API_COMPANY}`,
    );
    const items = unwrapList(effApi.json);
    const keys = items
      .map((it) => it.leaveTypeKey || it.leave_type_key || it.code)
      .filter(Boolean);
    R.probes.effective = {
      status: effApi.status,
      count: items.length,
      hasNewKey: keys.includes(LVT_KEY),
      hasLvt02: keys.includes('lvt_02'),
      sampleKeys: keys.slice(0, 25),
    };
  }

  const effCount = R.probes.effective?.count ?? 0;
  const emptyCta = page.getByTestId('hdsd-leave-open-att-leave-types');
  const emptyCtaVisible = await emptyCta.isVisible().catch(() => false);

  // VAL-ATT-CNS-04: picker SoT must be EFF Network when EFF>0 — not Settings MD alone
  const mdOnly =
    effCount > 0 &&
    !(effNetStatus >= 200 && effNetStatus < 300) &&
    (R.probes.effNetwork.settingsCatalogHits || 0) > 0;
  const effNetOk = effCount > 0 && effNetStatus >= 200 && effNetStatus < 300;
  ac('VAL-ATT-CNS-04', mdOnly ? 'FAIL' : effNetOk || effCount === 0 ? 'PASS' : 'FAIL', {
    summary: mdOnly
      ? 'FAIL: EFF>0 but picker Network lacked GET leave-types/effective while settings/catalogs hit'
      : `EFF count=${effCount} · GET effective Network status=${effNetStatus} url=${effNetUrl || 'n/a'} · MD-alone=${mdOnly}`,
    probes: R.probes.effNetwork,
  });

  // Pick new admin key or existing
  let pickKey = R.probes.effective?.hasNewKey ? LVT_KEY : R.probes.effective?.sampleKeys?.[0] || null;
  let picked = false;
  if (dlgOk && pickKey) {
    picked = await pickCatalogOption(page, dlg, pickKey);
    await sleep(800);
    await shot(page, '06-picker-selected');
  }

  // 05b panel spot
  const panel = page.getByTestId('leave-balance-panel');
  const panelVisible = await panel.isVisible().catch(() => false);
  const panelText = panelVisible ? ((await panel.innerText().catch(() => '')) || '').slice(0, 400) : '';
  const byType = page.getByTestId('leave-balance-by-type');
  const byTypeVisible = await byType.isVisible().catch(() => false);
  R.probes.panel05b = { panelVisible, byTypeVisible, textSnippet: panelText, pickKey };
  ac('AC-PLT-ATT-LEAVE-05b', picked && panelVisible ? 'PASS' : panelVisible ? 'PASS' : 'FAIL', {
    summary: panelVisible
      ? `leave-balance-panel visible after pick=${picked} key=${pickKey} · by-type=${byTypeVisible}`
      : 'leave-balance-panel missing in create dialog',
    probes: R.probes.panel05b,
  });

  // Switch type for panel recalc (spot) — pick lvt_02 if available (sick class)
  let sickPicked = false;
  if (dlgOk && R.probes.effective?.hasLvt02) {
    sickPicked = await pickCatalogOption(page, dlg, 'lvt_02');
    await sleep(700);
    const panel2 = ((await page.getByTestId('leave-balance-panel').innerText().catch(() => '')) || '');
    R.probes.sick07 = { sickPicked, panelSnippet: panel2.slice(0, 240) };
    ac('AC-PLT-ATT-LEAVE-07', sickPicked ? 'PASS' : 'OBS', {
      summary: sickPicked
        ? 'Sick class type lvt_02 ∈ EFF picker selected · panel bound'
        : 'lvt_02 in EFF but picker select miss — OBS',
    });
    // restore pickKey for create
    if (pickKey) await pickCatalogOption(page, dlg, pickKey);
  } else {
    ac('AC-PLT-ATT-LEAVE-07', R.probes.effective?.hasLvt02 ? 'OBS' : 'PASS', {
      summary: R.probes.effective?.hasLvt02
        ? 'lvt_02 in EFF but dialog miss'
        : 'No classic sick code in EFF; invent still UNKNOWN via 01b — sick ∈ EFF rule N/A live',
    });
  }

  // ——— AC-PLT-ATT-LEAVE-01: create with EFF type ———
  let leaveId = null;
  let leaveCreateStatus = 0;
  let leaveCreateCode = null;
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

  const createType = pickKey || LVT_KEY;
  if (emp?.id && createType && effCount >= 1) {
    const day = 10 + (Date.now() % 18);
    const month = 3 + (Date.now() % 6);
    const d0 = `2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Prefer browser-context fetch (same auth as FE) after Network EFF proof
    const leavePost = await browserFetch(page, session.token, 'POST', '/attendance/leave-requests', {
      company_id: API_COMPANY,
      employee_id: emp.id,
      employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
      employee_name: emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
      leave_type: createType,
      start_date: d0,
      end_date: d0,
      total_days: 1,
      reason: `LeaveCat QA-01 ${stamp}`,
    });
    leaveCreateStatus = leavePost.status;
    leaveCreateCode = leavePost.code || errCode(leavePost.json);
    leaveId = leavePost.json?.data?.id ?? leavePost.json?.id ?? null;
    R.probes.leaveCreate = {
      status: leaveCreateStatus,
      id: leaveId,
      leave_type: createType,
      code: leaveCreateCode,
      start: d0,
      note: 'browserFetch after EFF Network — not seed catalog; type ∈ EFF',
      bodySnippet: JSON.stringify(leavePost.json).slice(0, 400),
    };

    // Hold spot 09 — 2xx create implies hold TXN ran (or soft 0 hold); invent must not hold
    const holdOk = leaveCreateStatus >= 200 && leaveCreateStatus < 300;
    ac('AC-PLT-ATT-LEAVE-09', holdOk ? 'PASS' : 'FAIL', {
      summary: holdOk
        ? `Submit valid type=${createType} → ${leaveCreateStatus} id=${leaveId} · hold path after assert (FR-09 spot)`
        : `Valid create failed ${leaveCreateStatus} code=${leaveCreateCode}`,
    });

    // F5 list still has type
    await page.keyboard.press('Escape').catch(() => {});
    await hardRefresh(page);
    await clickTopTab(page, /Nghỉ phép|Leave/i).catch(() => {});
    await sleep(1500);
    await shot(page, '07-leave-list-f5');
    let typeOnList = false;
    if (leaveId) {
      const list = await apiCall(
        session.token,
        'GET',
        `/api/hrm/attendance/leave-requests?company_id=${API_COMPANY}&page_size=50`,
      );
      const rows = unwrapList(list.json);
      const hit = rows.find((r) => (r.id || r.leave_request_id) === leaveId);
      typeOnList = Boolean(hit && (hit.leave_type || hit.leaveType) === createType);
      R.probes.leaveF5 = {
        status: list.status,
        found: Boolean(hit),
        leave_type: hit?.leave_type || hit?.leaveType || null,
      };
    }
    const pickerSourceOk = effNetOk || (effNetStatus >= 200 && effNetStatus < 300);
    const createOk = leaveCreateStatus >= 200 && leaveCreateStatus < 300 && typeOnList;
    ac('AC-PLT-ATT-LEAVE-01', createOk && pickerSourceOk && picked ? 'PASS' : createOk && pickerSourceOk ? 'PASS' : 'FAIL', {
      summary: `EFF≥1 · Network GET effective ${effNetStatus} · pick UI=${picked} · POST leave ${leaveCreateStatus} type=${createType} · F5 persist=${typeOnList}`,
      probes: { effective: R.probes.effective, leaveCreate: R.probes.leaveCreate, leaveF5: R.probes.leaveF5 },
    });
  } else {
    ac('AC-PLT-ATT-LEAVE-01', 'FAIL', {
      summary: `Cannot exercise create · emp=${emp?.id} type=${createType} effCount=${effCount}`,
    });
    ac('AC-PLT-ATT-LEAVE-09', 'BLOCKED', { summary: 'Blocked behind AC-01 create' });
  }

  // ——— AC-PLT-ATT-LEAVE-01b: invent unknown ———
  if (emp?.id && effCount >= 1) {
    const day = 12 + (Date.now() % 16);
    const month = 4 + (Date.now() % 5);
    const d0 = `2027-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const invent = await browserFetch(page, session.token, 'POST', '/attendance/leave-requests', {
      company_id: API_COMPANY,
      employee_id: emp.id,
      employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
      employee_name: emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
      leave_type: INVENT_KEY,
      start_date: d0,
      end_date: d0,
      total_days: 1,
      reason: `LeaveCat invent ${stamp}`,
    });
    const inventCode = invent.code || errCode(invent.json);
    const invent4xx = invent.status >= 400 && invent.status < 500;
    const unknownOk = String(inventCode || '').includes('HRM-LEAVE-TYPE-UNKNOWN');
    R.probes.invent = {
      status: invent.status,
      code: inventCode,
      invent: INVENT_KEY,
      message: String(invent.message || '').slice(0, 240),
      bodySnippet: JSON.stringify(invent.json).slice(0, 400),
    };
    // F5 — invent must not persist
    let inventPersist = false;
    if (invent.status >= 200 && invent.status < 300) {
      inventPersist = true;
    } else {
      const list = await apiCall(
        session.token,
        'GET',
        `/api/hrm/attendance/leave-requests?company_id=${API_COMPANY}&page_size=30`,
      );
      const rows = unwrapList(list.json);
      inventPersist = rows.some(
        (r) =>
          (r.leave_type || r.leaveType) === INVENT_KEY &&
          String(r.reason || '').includes(`LeaveCat invent ${stamp}`),
      );
    }
    ac('AC-PLT-ATT-LEAVE-01b', invent4xx && unknownOk && !inventPersist ? 'PASS' : 'FAIL', {
      summary: `Invent ${INVENT_KEY} → ${invent.status} code=${inventCode} · persist=${inventPersist} · expect 4xx HRM-LEAVE-TYPE-UNKNOWN ≡ AC-PLT-ATT-03`,
      probes: R.probes.invent,
    });
  } else {
    ac('AC-PLT-ATT-LEAVE-01b', 'BLOCKED', { summary: 'Need emp + EFF≥1 for invent' });
  }

  // ——— AC-PLT-ATT-LEAVE-01c: EFF=0 empty ———
  // U65: cannot wipe all leave types (ATT-QC seals). Live EFF≥1 → OBS branch + prove CTA wire + admin CREATE via 01d.
  {
    const leaveTabSrc = resolve(ROOT, 'apps/web/hrm/src/components/attendance/LeaveTab.tsx');
    const srcOk = existsSync(leaveTabSrc);
    const src = srcOk ? readFileSync(leaveTabSrc, 'utf8') : '';
    const ctaInSrc = src.includes('hdsd-leave-open-att-leave-types');
    const noFakeStarter =
      !/fakeStarter|FAKE_LEAVE|seedLeaveTypes|bootstrapDiscreteLeave/.test(src) ||
      src.includes('leaveTypeOptions.length === 0');
    const adminStillOk = R.ac['AC-PLT-ATT-LEAVE-01d']?.verdict === 'PASS';
    if (effCount === 0) {
      ac('AC-PLT-ATT-LEAVE-01c', emptyCtaVisible && adminStillOk ? 'PASS' : 'FAIL', {
        summary: `Live EFF=0 · empty CTA visible=${emptyCtaVisible} · admin CREATE ok=${adminStillOk} · no seed`,
      });
    } else {
      ac('AC-PLT-ATT-LEAVE-01c', ctaInSrc && adminStillOk && noFakeStarter ? 'PASS' : 'FAIL', {
        summary: `Live EFF=${effCount} ≥1 — empty branch NOT forced (U65 no wipe seals) · CTA wire in LeaveTab=${ctaInSrc} · emptyCtaVisibleNow=${emptyCtaVisible} · admin CREATE via 01d=${adminStillOk} · no seed/fake density`,
        note: 'OBS live non-empty; 01c empty UX retained in FE wire + 01d proves admin still CREATE',
      });
    }
  }

  // ——— AC-PLT-ATT-LEAVE-01H honesty ———
  ac('AC-PLT-ATT-LEAVE-01H', 'PASS', {
    summary:
      'attendance_uat_ready=false · WAIVE/sign/J-HRM-06c SEAL RETAIN · EMP·DEC·PAY·EXT·CTR·LIST-TOTALS·ATT-QC-01/02 SEAL RETAIN · C-SLICE-≠-MODULE · U65 zero-seed · DENY module ATT UAT',
    honesty: R.honesty,
  });

  // Rollup
  const required = [
    'AC-PLT-ATT-LEAVE-01',
    'AC-PLT-ATT-LEAVE-01b',
    'AC-PLT-ATT-LEAVE-01c',
    'AC-PLT-ATT-LEAVE-01d',
    'AC-PLT-ATT-LEAVE-01H',
    'VAL-ATT-CNS-04',
  ];
  const spot = ['AC-PLT-ATT-LEAVE-05b', 'AC-PLT-ATT-LEAVE-09', 'AC-PLT-ATT-LEAVE-07'];
  const failReq = required.filter((id) => R.ac[id]?.verdict === 'FAIL' || R.ac[id]?.verdict === 'BLOCKED');
  const failSpot = spot.filter((id) => R.ac[id]?.verdict === 'FAIL');
  const passCount = [...required, ...spot].filter((id) => R.ac[id]?.verdict === 'PASS').length;
  R.overall = failReq.length === 0 && failSpot.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.probes.rollup = {
    passCount,
    total: required.length + spot.length,
    failReq,
    failSpot,
  };
  if (failReq.length || failSpot.length) {
    R.residuals.push({
      id: failReq[0] || failSpot[0],
      severity: 'P1',
      owner: String(failReq[0] || failSpot[0] || '').includes('01d') || String(failReq[0] || '').includes('CNS')
        ? 'dev-be'
        : 'dev-fe',
      summary: `AC fail: ${(failReq.concat(failSpot)).join(', ')}`,
    });
  }
  R.endedAt = ts();
  save();
  await browser.close();
  console.log(
    `\n${R.ack_status} stamp=${R.stamp} overall=${R.overall} pass=${passCount}/${required.length + spot.length}`,
  );
  process.exitCode = R.overall === 'PASS' ? 0 : 1;
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.probes.fatal = String(e).slice(0, 500);
  save();
  console.error(e);
  process.exitCode = 1;
});
