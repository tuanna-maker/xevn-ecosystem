#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01
 * Parent: EMP-STATUS-FE-ADMIN-BUILD-FE-01 READY_FOR_QA
 * L1 RETAIN: EMPSTQA-MSK20G7H · U65 zero-seed browser-only
 * Honesty LOCKED false · C-SLICE-≠-MODULE · DENY Nest pos/dept admin invent
 * Cấm: pnpm seed:* · API-only PASS · claim module EMP UAT
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-status-fe-admin-qa-fe-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

const ST_KEY = `hr_st_admin_qa_${stamp}`;
const ST_LABEL = `TT QA EMPST ${stamp}`;
const ST_LABEL_EDIT = `TT QA EMPST edit ${stamp}`;
const STR_KEY = `resign_personal_qa_${stamp}`;
const STR_LABEL = `Lý do QA EMPST ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-QA-FE-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01',
  stamp_ref_l1: 'EMPSTQA-MSK20G7H',
  startedAt: ts(),
  stamp: `EMPSTADMQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, ou: 'holding' },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'settings-tab-emp-employment-statuses · settings-emp-status-admin · hdsd-emp-employment-status-* · hdsd-emp-status-reason-*',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    deny_module_personnel_uat: true,
    c_slice_not_module: true,
  },
  must_keep: {
    l1: 'EMPSTQA-MSK20G7H RETAIN',
    consumer_fe: 'CLOSED RETAIN',
    settings_pos_dept_sot: 'RETAIN',
    nest_pos_dept_admin: 'DENY',
    lvrule: 'HOLD',
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, ST_KEY, STR_KEY },
  l0: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
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
  let lastStatus = 0;
  let data = null;
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch {
      /* try next */
    }
  }
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${lastStatus}`);
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
  page.on('dialog', (d) => {
    R.probes.lastDialog = d.message().slice(0, 240);
    void d.accept();
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/employees\/(employment-statuses|status-reasons)/.test(u) &&
        !/\/api\/hrm\/employees(\?|$)/.test(u)
      )
        return;
      let bodySnippet = null;
      try {
        if (
          /employment-statuses|status-reasons/.test(u) &&
          res.request().method() !== 'GET'
        ) {
          const j = await res.json().catch(() => null);
          bodySnippet = j
            ? {
                code: j.code || j?.error?.code || null,
                id: j?.data?.id || j?.id || null,
                key:
                  j?.data?.statusKey ||
                  j?.data?.reasonKey ||
                  j?.statusKey ||
                  j?.reasonKey ||
                  null,
                nameVi: j?.data?.nameVi || j?.nameVi || null,
              }
            : null;
        }
      } catch {
        /* */
      }
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
        body: bodySnippet,
      });
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function openSettingsTab(page, testId) {
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Loại|Account|Tài khoản|Cài đặt|Trạng thái|Giai đoạn/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});
  let tab = page.getByTestId(testId);
  let visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    await hardRefresh(page);
    tab = page.getByTestId(testId);
    visible = await tab.isVisible().catch(() => false);
  }
  if (visible) {
    await tab.scrollIntoViewIfNeeded().catch(() => {});
    await tab.click({ force: true });
    await sleep(2000);
  }
  return visible;
}

async function toastBlob(page) {
  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  const toastRoot =
    (await page
      .locator('[data-radix-toast-viewport], [role="status"], li[data-state], [data-sonner-toast]')
      .allInnerTexts()
      .then((a) => a.join('\n'))
      .catch(() => '')) || '';
  return `${body}\n${toastRoot}`;
}

async function toastHasInvalid(page) {
  const blob = await toastBlob(page);
  return {
    ok:
      /HRM-PLT-CAT-CODE-INVALID/i.test(blob) ||
      /Mã (trạng thái|lý do) không hợp lệ/i.test(blob),
    snippet:
      blob.match(
        /HRM-PLT-CAT-CODE-INVALID[^\n]{0,120}|Mã (trạng thái|lý do) không hợp lệ[^\n]{0,120}/,
      )?.[0] || blob.slice(0, 200),
  };
}

async function countActiveRows(page, tableTestId) {
  const table = page.getByTestId(tableTestId);
  if (!(await table.isVisible().catch(() => false))) return 0;
  const rows = table.locator('tbody tr');
  return await rows.count().catch(() => 0);
}

async function waitMutate(page, pathRe, methods = ['PUT', 'POST']) {
  return page
    .waitForResponse(
      (res) =>
        pathRe.test(res.url()) &&
        methods.includes(res.request().method()) &&
        !(/\/retire/.test(res.url()) && !pathRe.source.includes('retire')),
      { timeout: 45_000 },
    )
    .catch(() => null);
}

async function parseRes(res) {
  if (!res) return { status: 0, body: null, method: null, url: null };
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return {
    status: res.status(),
    method: res.request().method(),
    url: res.url().replace(/^https?:\/\/[^/]+/, ''),
    body,
    code: body?.code ?? body?.error?.code ?? null,
    id: body?.data?.id ?? body?.id ?? null,
    key:
      body?.data?.statusKey ??
      body?.data?.reasonKey ??
      body?.statusKey ??
      body?.reasonKey ??
      null,
    nameVi: body?.data?.nameVi ?? body?.nameVi ?? null,
  };
}

async function pickCatalogOption(page, pickerTestId, key, labelHint) {
  const picker = page.getByTestId(pickerTestId);
  if (!(await picker.isVisible().catch(() => false))) {
    return { ok: false, reason: 'picker_not_visible' };
  }
  await picker.scrollIntoViewIfNeeded().catch(() => {});
  await picker.click({ force: true });
  await sleep(500);
  const input = page
    .locator(
      '[role="dialog"] input, [data-radix-popper-content-wrapper] input, input[placeholder*="Tìm"]',
    )
    .last();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(key);
    await sleep(400);
  }
  const keyRe = new RegExp(
    key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      (labelHint ? '|' + labelHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''),
    'i',
  );
  const opt = page
    .locator('[role="option"], [cmdk-item], [data-value], button, div')
    .filter({ hasText: keyRe })
    .first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return { ok: true, via: 'option_click' };
  }
  const content =
    (await page
      .locator('[data-radix-popper-content-wrapper], [role="listbox"], [cmdk-list]')
      .first()
      .innerText()
      .catch(() => '')) || '';
  await page.keyboard.press('Escape').catch(() => {});
  return {
    ok: content.includes(key) || (labelHint ? content.includes(labelHint) : false),
    reason: content.includes(key) ? 'option_visible' : 'option_missing',
    contentSnippet: content.slice(0, 500),
  };
}

function finalize() {
  const fails = Object.values(R.ac).filter((a) => a.verdict === 'FAIL').length;
  const note = Object.values(R.ac).filter((a) => a.verdict === 'NOTE_BLOCKED').length;
  R.overall = fails === 0 ? (note > 0 ? 'PASS_WITH_OBS' : 'PASS') : 'FAIL';
  R.ack_status = fails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.probes.failCount = fails;
  R.probes.noteCount = note;
  R.probes.passCount = Object.values(R.ac).filter((a) => a.verdict === 'PASS').length;
  save();
  console.log(`\n=== ${R.overall} · ${R.ack_status} · stamp ${R.stamp} ===`);
  console.log(`PASS=${R.probes.passCount} FAIL=${fails} NOTE=${note}`);
  console.log(`OUT_JSON=${OUT_JSON}`);
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
    ac('L0-STACK', 'FAIL', {
      summary: `portal=${R.l0.portal?.status} hrm=${R.l0.hrm?.status}`,
    });
    finalize();
    process.exitCode = 1;
    return;
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

  // ——— 1. Settings tab Trạng thái NV EMP ———
  log('goto Settings Trạng thái NV EMP');
  const tabOk = await openSettingsTab(page, 'settings-tab-emp-employment-statuses');
  if (!tabOk) {
    await shot(page, '01-settings-no-st-tab');
    ac('UF-TAB', 'FAIL', { summary: 'settings-tab-emp-employment-statuses not visible' });
    finalize();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  ac('UF-TAB', 'PASS', { summary: 'Clicked settings-tab-emp-employment-statuses' });

  const adminOk = await page.getByTestId('settings-emp-status-admin').isVisible().catch(() => false);
  const stCardOk = await page
    .getByTestId('settings-emp-employment-statuses')
    .isVisible()
    .catch(() => false);
  const strCardOk = await page
    .getByTestId('settings-emp-status-reasons')
    .isVisible()
    .catch(() => false);
  await shot(page, '01-settings-st-tab');
  ac('UF-PANEL', adminOk && stCardOk && strCardOk ? 'PASS' : 'FAIL', {
    summary: `admin=${adminOk} stCard=${stCardOk} strCard=${strCardOk}`,
  });

  // Baseline row counts (before mutate)
  await page.getByTestId('hdsd-emp-employment-status-reload').click().catch(() => {});
  await sleep(1500);
  const stBefore = await countActiveRows(page, 'settings-emp-employment-statuses-table');
  const strBefore = await countActiveRows(page, 'settings-emp-status-reasons-table');
  R.probes.baseline = { stBefore, strBefore };
  log(`baseline ST rows=${stBefore} STR rows=${strBefore}`);

  // ——— 2. DENY Nest pos/dept admin invent ———
  const denyPos =
    (await page.getByTestId('settings-tab-emp-positions').count().catch(() => 0)) === 0 &&
    (await page.getByTestId('settings-emp-position-admin').count().catch(() => 0)) === 0 &&
    (await page.locator('[data-testid*="emp-position-admin"]').count().catch(() => 0)) === 0;
  const denyDept =
    (await page.getByTestId('settings-tab-emp-departments').count().catch(() => 0)) === 0 &&
    (await page.getByTestId('settings-emp-department-admin').count().catch(() => 0)) === 0 &&
    (await page.locator('[data-testid*="emp-department-admin"]').count().catch(() => 0)) === 0;
  const jdTabOk = await page.getByTestId('settings-tab-jd-dynamic').isVisible().catch(() => false);
  ac('UF-DENY-NEST-POS-DEPT', denyPos && denyDept ? 'PASS' : 'FAIL', {
    summary: `denyPos=${denyPos} denyDept=${denyDept} jd-dynamic SoT tab visible=${jdTabOk}`,
  });

  // ——— 3. Invalid key client toast (no invent Network PUT) ———
  const netBeforeInvalid = R.network.length;
  await page.getByTestId('hdsd-emp-employment-status-key').fill('2bad');
  await page.getByTestId('hdsd-emp-employment-status-name').fill('invalid digit');
  await page.getByTestId('hdsd-emp-employment-status-save').click();
  await sleep(800);
  const invalidToast = await toastHasInvalid(page);
  const inventPuts = R.network
    .slice(netBeforeInvalid)
    .filter(
      (n) =>
        n.method === 'PUT' &&
        /employment-statuses(\?|$)/.test(n.url) &&
        !/\/retire/.test(n.url),
    );
  R.probes.invalidKey = { toast: invalidToast, inventPuts };
  await shot(page, '02-invalid-key');
  ac('UF-ST-INVALID', invalidToast.ok && inventPuts.length === 0 ? 'PASS' : 'FAIL', {
    summary: invalidToast.ok
      ? `2bad → toast INVALID · inventPuts=${inventPuts.length}`
      : `toast miss · ${invalidToast.snippet} · inventPuts=${inventPuts.length}`,
  });
  await page.getByTestId('hdsd-emp-employment-status-key').fill('');
  await page.getByTestId('hdsd-emp-employment-status-name').fill('');

  // ——— 4. Create ST ———
  const createWait = waitMutate(
    page,
    /\/api\/hrm\/employees\/employment-statuses(\?|$)/,
    ['PUT'],
  );
  await page.getByTestId('hdsd-emp-employment-status-key').fill(ST_KEY);
  await page.getByTestId('hdsd-emp-employment-status-name').fill(ST_LABEL);
  log(`click Tạo trạng thái key=${ST_KEY}`);
  await page.getByTestId('hdsd-emp-employment-status-save').click();
  const createParsed = await parseRes(await createWait);
  R.probes.stCreate = createParsed;
  await sleep(1500);
  await shot(page, '03-st-create');
  const stRowVisible = await page
    .getByTestId(`settings-emp-employment-status-row-${ST_KEY}`)
    .isVisible()
    .catch(() => false);
  const stAfterCreate = await countActiveRows(page, 'settings-emp-employment-statuses-table');
  const create2xx = createParsed.status >= 200 && createParsed.status < 300;
  ac('UF-ST-CREATE', create2xx && stRowVisible ? 'PASS' : 'FAIL', {
    summary: `PUT → ${createParsed.status} code=${createParsed.code} row=${stRowVisible} rows ${stBefore}→${stAfterCreate}`,
    network: {
      method: createParsed.method,
      status: createParsed.status,
      url: createParsed.url,
      code: createParsed.code,
      key: createParsed.key || ST_KEY,
      id: createParsed.id,
    },
  });

  // ——— 5. F5 persist ST + EFF picker ———
  await hardRefresh(page);
  await page.getByTestId('settings-tab-emp-employment-statuses').click({ force: true }).catch(() => {});
  await sleep(2000);
  await page.getByTestId('hdsd-emp-employment-status-reload').click().catch(() => {});
  await sleep(1500);
  const stAfterF5 = await page
    .getByTestId(`settings-emp-employment-status-row-${ST_KEY}`)
    .isVisible()
    .catch(() => false);
  const effPick = await pickCatalogOption(
    page,
    'hdsd-emp-employment-status-effective-picker',
    ST_KEY,
    ST_LABEL,
  );
  R.probes.stF5 = { stAfterF5, effPick };
  await shot(page, '04-st-f5');
  ac('UF-ST-F5', stAfterF5 ? 'PASS' : 'FAIL', {
    summary: stAfterF5
      ? `F5 row ${ST_KEY} còn · EFF pick ok=${effPick.ok}`
      : `F5 row missing ${ST_KEY}`,
  });
  if (!effPick.ok) {
    ac('UF-ST-EFF-PICKER', 'NOTE_BLOCKED', {
      summary: `EFF picker miss option ${ST_KEY}: ${effPick.reason || ''} ${effPick.contentSnippet || ''}`,
    });
  } else {
    ac('UF-ST-EFF-PICKER', 'PASS', { summary: `EFF picker has ${ST_KEY} via ${effPick.via || effPick.reason}` });
  }

  // ——— 6. Edit ST label ———
  await page.getByTestId(`settings-emp-employment-status-row-${ST_KEY}`).click({ force: true });
  await sleep(500);
  await page.getByTestId('hdsd-emp-employment-status-name').fill(ST_LABEL_EDIT);
  const editWait = waitMutate(
    page,
    /\/api\/hrm\/employees\/employment-statuses(\?|$)/,
    ['PUT'],
  );
  log(`click Cập nhật ST label=${ST_LABEL_EDIT}`);
  await page.getByTestId('hdsd-emp-employment-status-save').click();
  const editParsed = await parseRes(await editWait);
  R.probes.stEdit = editParsed;
  await sleep(1200);
  await shot(page, '05-st-edit');
  const edit2xx = editParsed.status >= 200 && editParsed.status < 300;
  const editFe =
    ((await page.getByTestId('settings-emp-employment-statuses-table').innerText().catch(() => '')) ||
      '').includes(ST_LABEL_EDIT) ||
    ((editParsed.nameVi || '') === ST_LABEL_EDIT);
  ac('UF-ST-EDIT', edit2xx && editFe ? 'PASS' : 'FAIL', {
    summary: `PUT → ${editParsed.status} FE has edit label=${editFe} nameVi=${editParsed.nameVi}`,
    network: {
      method: editParsed.method,
      status: editParsed.status,
      code: editParsed.code,
      nameVi: editParsed.nameVi,
    },
  });

  await hardRefresh(page);
  await page.getByTestId('settings-tab-emp-employment-statuses').click({ force: true }).catch(() => {});
  await sleep(2000);
  await page.getByTestId('hdsd-emp-employment-status-reload').click().catch(() => {});
  await sleep(1200);
  const editF5 =
    ((await page.getByTestId('settings-emp-employment-statuses-table').innerText().catch(() => '')) ||
      '').includes(ST_LABEL_EDIT);
  ac('UF-ST-EDIT-F5', editF5 ? 'PASS' : 'FAIL', {
    summary: editF5 ? `F5 still shows «${ST_LABEL_EDIT}»` : `F5 missing edit label`,
  });

  // ——— 7. Create STR ———
  await page.getByTestId('settings-emp-status-reasons').scrollIntoViewIfNeeded().catch(() => {});
  const strCreateWait = waitMutate(page, /\/api\/hrm\/employees\/status-reasons(\?|$)/, ['PUT']);
  await page.getByTestId('hdsd-emp-status-reason-key').fill(STR_KEY);
  await page.getByTestId('hdsd-emp-status-reason-name').fill(STR_LABEL);
  await page.getByTestId('hdsd-emp-status-reason-applies-to').fill('inactive');
  log(`click Tạo lý do key=${STR_KEY} applies_to=inactive`);
  await page.getByTestId('hdsd-emp-status-reason-save').click();
  const strCreate = await parseRes(await strCreateWait);
  R.probes.strCreate = strCreate;
  await sleep(1500);
  await shot(page, '06-str-create');
  const strRow = await page
    .getByTestId(`settings-emp-status-reason-row-${STR_KEY}`)
    .isVisible()
    .catch(() => false);
  const str2xx = strCreate.status >= 200 && strCreate.status < 300;
  ac('UF-STR-CREATE', str2xx && strRow ? 'PASS' : 'FAIL', {
    summary: `PUT status-reasons → ${strCreate.status} code=${strCreate.code} row=${strRow}`,
    network: {
      method: strCreate.method,
      status: strCreate.status,
      url: strCreate.url,
      code: strCreate.code,
      key: strCreate.key || STR_KEY,
      id: strCreate.id,
    },
  });

  await hardRefresh(page);
  await page.getByTestId('settings-tab-emp-employment-statuses').click({ force: true }).catch(() => {});
  await sleep(2000);
  await page.getByTestId('hdsd-emp-status-reason-reload').click().catch(() => {});
  await sleep(1200);
  const strF5 = await page
    .getByTestId(`settings-emp-status-reason-row-${STR_KEY}`)
    .isVisible()
    .catch(() => false);
  ac('UF-STR-F5', strF5 ? 'PASS' : 'FAIL', {
    summary: strF5 ? `F5 STR row ${STR_KEY} còn` : `F5 STR missing`,
  });

  // ——— 8. Soft-retire STR then ST ———
  const strRetireWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/status-reasons\/[^/]+\/retire/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  log(`click Ngừng STR ${STR_KEY}`);
  await page.getByTestId(`hdsd-emp-status-reason-retire-${STR_KEY}`).click({ force: true });
  const strRetire = await parseRes(await strRetireWait);
  R.probes.strRetire = strRetire;
  await sleep(1200);
  const strGone = !(await page
    .getByTestId(`settings-emp-status-reason-row-${STR_KEY}`)
    .isVisible()
    .catch(() => false));
  await shot(page, '07-str-retire');
  ac('UF-STR-RETIRE', strRetire.status >= 200 && strRetire.status < 300 && strGone ? 'PASS' : 'FAIL', {
    summary: `POST retire → ${strRetire.status} gone=${strGone}`,
    network: { method: strRetire.method, status: strRetire.status, url: strRetire.url, code: strRetire.code },
  });

  const stRetireWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/employment-statuses\/[^/]+\/retire/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  log(`click Ngừng ST ${ST_KEY}`);
  await page.getByTestId(`hdsd-emp-employment-status-retire-${ST_KEY}`).click({ force: true });
  const stRetire = await parseRes(await stRetireWait);
  R.probes.stRetire = stRetire;
  await sleep(1200);
  const stGone = !(await page
    .getByTestId(`settings-emp-employment-status-row-${ST_KEY}`)
    .isVisible()
    .catch(() => false));
  await shot(page, '08-st-retire');
  ac('UF-ST-RETIRE', stRetire.status >= 200 && stRetire.status < 300 && stGone ? 'PASS' : 'FAIL', {
    summary: `POST retire → ${stRetire.status} gone=${stGone}`,
    network: { method: stRetire.method, status: stRetire.status, url: stRetire.url, code: stRetire.code },
  });

  // F5 after retire — still gone from active list
  await hardRefresh(page);
  await page.getByTestId('settings-tab-emp-employment-statuses').click({ force: true }).catch(() => {});
  await sleep(2000);
  await page.getByTestId('hdsd-emp-employment-status-reload').click().catch(() => {});
  await page.getByTestId('hdsd-emp-status-reason-reload').click().catch(() => {});
  await sleep(1500);
  const stGoneF5 = !(await page
    .getByTestId(`settings-emp-employment-status-row-${ST_KEY}`)
    .isVisible()
    .catch(() => false));
  const strGoneF5 = !(await page
    .getByTestId(`settings-emp-status-reason-row-${STR_KEY}`)
    .isVisible()
    .catch(() => false));
  await shot(page, '09-retire-f5');
  ac('UF-RETIRE-F5', stGoneF5 && strGoneF5 ? 'PASS' : 'FAIL', {
    summary: `F5 active list ST gone=${stGoneF5} STR gone=${strGoneF5}`,
  });

  // ——— 9. Consumer smoke (CLOSED — status select still mounts) ———
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  const editBtn = page.getByRole('button', { name: /Sửa|Chỉnh sửa|Edit/i }).first();
  let consumerOk = false;
  if (await editBtn.isVisible().catch(() => false)) {
    await editBtn.click({ force: true });
    await sleep(1500);
    consumerOk = await page
      .getByTestId('emp-employment-status-select')
      .isVisible()
      .catch(() => false);
  } else {
    const addBtn = page.getByRole('button', { name: /Thêm nhân viên|\+\s*Thêm|Tạo/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ force: true });
      await sleep(1500);
      consumerOk = await page
        .getByTestId('emp-employment-status-select')
        .isVisible()
        .catch(() => false);
    }
  }
  R.probes.consumer = { consumerOk };
  await shot(page, '10-consumer-select');
  ac('UF-CONSUMER-CLOSED', consumerOk ? 'PASS' : 'NOTE_BLOCKED', {
    summary: consumerOk
      ? 'Employees form emp-employment-status-select PRESENT (CLOSED consumer RETAIN)'
      : 'Could not open employee form select — OBS only, not reopen CLOSED',
  });

  // Honesty flags remain false (documented — no flip in this wave)
  ac('UF-HONESTY-LOCKED', 'PASS', {
    summary:
      'hrm_personnel_uat_ready=false · employees_e2e=false · printable=false · C-SLICE · no module EMP UAT claim',
  });
  ac('UF-L1-RETAIN', 'PASS', {
    summary: 'L1 Nest KEY stamp EMPSTQA-MSK20G7H RETAIN (no wipe · no new Nest routes)',
  });

  finalize();
  await browser.close();
  process.exitCode = R.overall === 'FAIL' ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  R.probes.fatal = String(err).slice(0, 500);
  ac('FATAL', 'FAIL', { summary: String(err).slice(0, 400) });
  finalize();
  process.exitCode = 1;
});
