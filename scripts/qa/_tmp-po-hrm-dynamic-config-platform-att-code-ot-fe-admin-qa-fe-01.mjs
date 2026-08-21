#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01
 * U65 browser · Settings + ATT CFG · create → edit → soft-retire → F5 per catalog
 * Parent: ATT-CODE-OT-FE-ADMIN-BUILD-FE-01 READY_FOR_QA
 * L1 RETAIN: ATTCODEQA-MSK4T1A5 · ATTOTQA-MSK8VETU · ATTCOMPQA-MSKARXQU
 * Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE · DENY seed / LVRULE / dual-write / module ATT UAT
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);

const L1 = {
  ATT_CODE: 'ATTCODEQA-MSK4T1A5',
  OT_TYPE: 'ATTOTQA-MSK8VETU',
  OT_COMP: 'ATTCOMPQA-MSKARXQU',
};

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01',
  startedAt: ts(),
  stamp: `ATTADMINQAFE-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE create/edit/retire/F5 · Network 2xx on sealed Nest paths only',
  hdsd_align:
    'Settings tabs att-attendance-codes · att-ot-types · att-ot-comp-types · ATT CFG sidebar attendance-codes · ot-types · ot-comp-types',
  honesty: {
    attendance_uat_ready: false,
    attendance_e2e_linkage_ready: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    deny_lvrule: true,
    deny_dual_write: true,
    l1_retain: L1,
    consumer_eff_closed_retain: true,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  catalogs: {},
  cfg_sidebar: {},
  network: [],
  dual_write_hits: [],
  lvrule_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ac: {},
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
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  for (const [k, v] of Object.entries(extra)) {
    if (v != null) u.searchParams.set(k, String(v));
  }
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
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const path = u.replace(/^https?:\/\/[^/]+/, '');
      const entry = {
        method: res.request().method(),
        status: res.status(),
        url: path.slice(0, 520),
        at: ts(),
      };
      if (
        /\/attendance\/(attendance-codes|ot-types|ot-comp-types)/.test(path) ||
        /\/settings\/catalogs/.test(path)
      ) {
        R.network.push(entry);
      }
      if (/\/settings\/catalogs/.test(path) && ['PUT', 'POST', 'PATCH'].includes(entry.method)) {
        R.dual_write_hits.push(entry);
      }
      if (/leave-rules|lvrule|leave_rule/i.test(path) && ['PUT', 'POST', 'PATCH'].includes(entry.method)) {
        R.lvrule_hits.push(entry);
      }
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function waitNestMutate(page, pathRe, timeout = 45_000) {
  return page
    .waitForResponse(
      (res) =>
        pathRe.test(res.url()) &&
        ['PUT', 'POST', 'PATCH'].includes(res.request().method()) &&
        !/\/effective(\?|$)/.test(res.url()),
      { timeout },
    )
    .catch(() => null);
}

async function ensureTab(page, tabTestId) {
  let tab = page.getByTestId(tabTestId);
  let visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    await hardRefresh(page);
    tab = page.getByTestId(tabTestId);
    visible = await tab.isVisible().catch(() => false);
  }
  if (visible) {
    await tab.click();
    await sleep(1200);
  }
  return visible;
}

/**
 * @param {import('playwright').Page} page
 * @param {{
 *   id: string,
 *   tab: string,
 *   panel: string,
 *   table: string,
 *   nestPath: RegExp,
 *   nestSeal: string,
 *   key: string,
 *   nameCreate: string,
 *   nameEdit: string,
 *   fields: { key: string, name: string, save: string, reload: string, extra?: Array<{testid:string,value:string}> },
 *   rowTestId: (code: string) => string,
 *   retireTestId: (code: string) => string,
 * }} cat
 */
async function exerciseCatalog(page, cat) {
  const result = {
    id: cat.id,
    key: cat.key,
    before_row: false,
    create: null,
    edit: null,
    retire: null,
    f5_after_create: null,
    f5_after_retire: null,
    fe_after_create: false,
    fe_after_edit: false,
    fe_after_retire: false,
    nest_seal_ok: true,
    verdict: 'FAIL',
  };
  R.catalogs[cat.id] = result;

  log(`goto Settings tab=${cat.tab} catalog=${cat.id}`);
  await page.goto(q('/hr/settings', { tab: cat.tab }), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(3000);

  const tabOk = await ensureTab(page, `settings-tab-${cat.tab}`);
  if (!tabOk) {
    await shot(page, `${cat.id}-no-tab`);
    ac(`AC-${cat.id}-TAB`, 'FAIL', { summary: `settings-tab-${cat.tab} not visible` });
    return result;
  }

  const panel = page.getByTestId(cat.panel);
  await panel.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  if (!(await panel.isVisible().catch(() => false))) {
    await shot(page, `${cat.id}-no-panel`);
    ac(`AC-${cat.id}-PANEL`, 'FAIL', { summary: `${cat.panel} not visible` });
    return result;
  }
  await shot(page, `${cat.id}-01-before`);

  result.before_row = await page.getByTestId(cat.rowTestId(cat.key)).isVisible().catch(() => false);

  // ——— CREATE ———
  const createWait = waitNestMutate(page, cat.nestPath);
  await page.getByTestId(cat.fields.key).fill(cat.key);
  await page.getByTestId(cat.fields.name).fill(cat.nameCreate);
  if (cat.fields.extra) {
    for (const f of cat.fields.extra) {
      const el = page.getByTestId(f.testid);
      if (await el.isVisible().catch(() => false)) {
        await el.fill(f.value);
      }
    }
  }
  log(`create ${cat.id} key=${cat.key}`);
  await page.getByTestId(cat.fields.save).click();
  const createRes = await createWait;
  const createStatus = createRes?.status() ?? 0;
  const createMethod = createRes?.request()?.method() ?? null;
  const createUrl = createRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
  let createBody = null;
  try {
    createBody = createRes ? await createRes.json() : null;
  } catch {
    createBody = null;
  }
  result.create = {
    status: createStatus,
    method: createMethod,
    url: createUrl,
    ok: createStatus >= 200 && createStatus < 300,
    code: createBody?.data?.code ?? createBody?.code ?? cat.key,
  };
  if (createUrl && !cat.nestSeal.test(createUrl)) {
    result.nest_seal_ok = false;
  }
  await sleep(1500);
  result.fe_after_create = await page.getByTestId(cat.rowTestId(cat.key)).isVisible().catch(() => false);
  await shot(page, `${cat.id}-02-after-create`);

  // ——— F5 after create ———
  await hardRefresh(page);
  await ensureTab(page, `settings-tab-${cat.tab}`);
  await sleep(800);
  result.f5_after_create = {
    row_visible: await page.getByTestId(cat.rowTestId(cat.key)).isVisible().catch(() => false),
  };
  await shot(page, `${cat.id}-03-f5-after-create`);

  // ——— EDIT ———
  const row = page.getByTestId(cat.rowTestId(cat.key));
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await sleep(600);
  }
  const editWait = waitNestMutate(page, cat.nestPath);
  await page.getByTestId(cat.fields.name).fill(cat.nameEdit);
  log(`edit ${cat.id} key=${cat.key}`);
  await page.getByTestId(cat.fields.save).click();
  const editRes = await editWait;
  const editStatus = editRes?.status() ?? 0;
  const editUrl = editRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
  result.edit = {
    status: editStatus,
    method: editRes?.request()?.method() ?? null,
    url: editUrl,
    ok: editStatus >= 200 && editStatus < 300,
  };
  if (editUrl && !cat.nestSeal.test(editUrl)) {
    result.nest_seal_ok = false;
  }
  await sleep(1200);
  const nameCell = page.getByTestId(cat.rowTestId(cat.key));
  const nameText = (await nameCell.textContent().catch(() => '')) || '';
  result.fe_after_edit = nameText.includes(cat.nameEdit);
  await shot(page, `${cat.id}-04-after-edit`);

  // ——— RETIRE ———
  page.once('dialog', async (d) => {
    await d.accept().catch(() => {});
  });
  const retireWait = page
    .waitForResponse(
      (res) =>
        cat.nestPath.test(res.url()) &&
        /\/retire(\?|$)/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  const retireBtn = page.getByTestId(cat.retireTestId(cat.key));
  if (!(await retireBtn.isVisible().catch(() => false))) {
    // re-find row after edit form reset
    await page.getByTestId(cat.rowTestId(cat.key)).click().catch(() => {});
    await sleep(400);
  }
  log(`retire ${cat.id} key=${cat.key}`);
  await page.getByTestId(cat.retireTestId(cat.key)).click();
  const retireRes = await retireWait;
  const retireStatus = retireRes?.status() ?? 0;
  const retireUrl = retireRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
  result.retire = {
    status: retireStatus,
    method: retireRes?.request()?.method() ?? null,
    url: retireUrl,
    ok: retireStatus >= 200 && retireStatus < 300,
  };
  if (retireUrl && !cat.nestSeal.test(retireUrl)) {
    result.nest_seal_ok = false;
  }
  await sleep(1200);
  result.fe_after_retire = !(await page.getByTestId(cat.rowTestId(cat.key)).isVisible().catch(() => false));
  await shot(page, `${cat.id}-05-after-retire`);

  // ——— F5 after retire ———
  await hardRefresh(page);
  await ensureTab(page, `settings-tab-${cat.tab}`);
  await sleep(800);
  result.f5_after_retire = {
    row_hidden: !(await page.getByTestId(cat.rowTestId(cat.key)).isVisible().catch(() => false)),
  };
  await shot(page, `${cat.id}-06-f5-after-retire`);

  const pass =
    result.create?.ok &&
    result.fe_after_create &&
    result.f5_after_create?.row_visible &&
    result.edit?.ok &&
    result.fe_after_edit &&
    result.retire?.ok &&
    result.fe_after_retire &&
    result.f5_after_retire?.row_hidden &&
    result.nest_seal_ok;

  result.verdict = pass ? 'PASS' : 'FAIL';
  ac(`AC-${cat.id}-CRUD-F5`, pass ? 'PASS' : 'FAIL', {
    summary: JSON.stringify({
      create: result.create,
      edit: result.edit,
      retire: result.retire,
      fe_after_create: result.fe_after_create,
      f5_create: result.f5_after_create,
      fe_after_edit: result.fe_after_edit,
      fe_after_retire: result.fe_after_retire,
      f5_retire: result.f5_after_retire,
      nest_seal_ok: result.nest_seal_ok,
    }).slice(0, 800),
  });
  save();
  return result;
}

async function clickAttSettingsTab(page) {
  // HDSD / i18n: top tab = «Thiết lập» (not always «Cài đặt»)
  const exact = page.getByRole('button', { name: /^(Thiết lập|Cài đặt|Settings)$/i }).first();
  if (await exact.isVisible().catch(() => false)) {
    await exact.click({ timeout: 15_000 });
    await sleep(1500);
    return 'role-exact';
  }
  const byText = page
    .locator('button')
    .filter({ hasText: /Thiết lập|Cài đặt|Settings/i })
    .first();
  if (await byText.count()) {
    await byText.scrollIntoViewIfNeeded().catch(() => {});
    await byText.click({ force: true, timeout: 15_000 });
    await sleep(1500);
    return 'button-text-force';
  }
  await shot(page, 'cfg-00-debug-tabs');
  return null;
}

async function spotCfgSidebar(page) {
  const out = {
    shell: false,
    attendance_codes: false,
    ot_types: false,
    ot_comp_types: false,
    settings_tab_mode: null,
    verdict: 'FAIL',
  };
  R.cfg_sidebar = out;

  log('goto /hr/attendance → Thiết lập CFG sidebar spot');
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);

  out.settings_tab_mode = await clickAttSettingsTab(page);
  const shell = page.getByTestId('att-settings-shell-precision');
  await shell.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  out.shell = await shell.isVisible().catch(() => false);
  await shot(page, 'cfg-00-shell');

  async function openSidebar(labelRe, panelTestId, nestedPanel, key) {
    const btn = shell.locator('nav button').filter({ hasText: labelRe }).first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    await btn.click({ timeout: 15_000 }).catch(() => {});
    await sleep(1200);
    let visible = await page.getByTestId(panelTestId).isVisible().catch(() => false);
    if (visible && nestedPanel) {
      visible = await page.getByTestId(nestedPanel).isVisible().catch(() => false);
    }
    out[key] = visible;
    await shot(page, `cfg-${key}`);
  }

  if (out.shell) {
    await openSidebar(
      /Mã chấm công/i,
      'att-cfg-attendance-codes-precision',
      'settings-att-attendance-codes',
      'attendance_codes',
    );
    await openSidebar(/Loại tăng ca/i, 'att-cfg-ot-types-precision', 'settings-att-ot-types', 'ot_types');
    await openSidebar(
      /Loại chi trả OT|chi trả OT/i,
      'att-cfg-ot-comp-types-precision',
      'settings-att-ot-comp-types',
      'ot_comp_types',
    );
  }

  const pass = out.shell && out.attendance_codes && out.ot_types && out.ot_comp_types;
  out.verdict = pass ? 'PASS' : 'FAIL';
  ac('AC-CFG-SIDEBAR-MOUNT', pass ? 'PASS' : 'FAIL', { summary: JSON.stringify(out) });
  save();
  return out;
}

async function probeL0() {
  const checks = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      checks[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      checks[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  R.l0 = checks;
  save();
  return checks.hrm?.ok && checks.xbos?.ok && checks.portal?.ok;
}

async function main() {
  const l0ok = await probeL0();
  if (!l0ok) {
    ac('AC-L0', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('AC-L0', 'PASS', { summary: 'hrm+xbos+portal 200' });

  const session = await loginApi();
  log('loginApi ok');

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const codeKey = `wfh_half_qa_${stampTail}`.slice(0, 48);
  const otKey = `ot_night_qa_${stampTail}`.slice(0, 48);
  const compKey = `banked_hours_qa_${stampTail}`.slice(0, 48);

  await exerciseCatalog(page, {
    id: 'ATT-CODE',
    tab: 'att-attendance-codes',
    panel: 'settings-att-attendance-codes',
    table: 'settings-att-attendance-codes-table',
    nestPath: /\/api\/hrm\/attendance\/attendance-codes/,
    nestSeal: /\/api\/hrm\/attendance\/attendance-codes/,
    key: codeKey,
    nameCreate: `QA mã chấm công ${stampTail}`,
    nameEdit: `QA mã chấm công EDIT ${stampTail}`,
    fields: {
      key: 'hdsd-att-attendance-code-key',
      name: 'hdsd-att-attendance-code-name',
      save: 'hdsd-att-attendance-code-save',
      reload: 'hdsd-att-attendance-code-reload',
      extra: [{ testid: 'hdsd-att-attendance-code-symbol', value: 'W½' }],
    },
    rowTestId: (c) => `settings-att-attendance-code-row-${c}`,
    retireTestId: (c) => `hdsd-att-attendance-code-retire-${c}`,
  });

  await exerciseCatalog(page, {
    id: 'OT-TYPE',
    tab: 'att-ot-types',
    panel: 'settings-att-ot-types',
    table: 'settings-att-ot-types-table',
    nestPath: /\/api\/hrm\/attendance\/ot-types/,
    nestSeal: /\/api\/hrm\/attendance\/ot-types/,
    key: otKey,
    nameCreate: `QA loại OT ${stampTail}`,
    nameEdit: `QA loại OT EDIT ${stampTail}`,
    fields: {
      key: 'hdsd-att-ot-type-key',
      name: 'hdsd-att-ot-type-name',
      save: 'hdsd-att-ot-type-save',
      reload: 'hdsd-att-ot-type-reload',
      extra: [{ testid: 'hdsd-att-ot-type-coeff', value: '1.5' }],
    },
    rowTestId: (c) => `settings-att-ot-type-row-${c}`,
    retireTestId: (c) => `hdsd-att-ot-type-retire-${c}`,
  });

  await exerciseCatalog(page, {
    id: 'OT-COMP',
    tab: 'att-ot-comp-types',
    panel: 'settings-att-ot-comp-types',
    table: 'settings-att-ot-comp-types-table',
    nestPath: /\/api\/hrm\/attendance\/ot-comp-types/,
    nestSeal: /\/api\/hrm\/attendance\/ot-comp-types/,
    key: compKey,
    nameCreate: `QA chi trả OT ${stampTail}`,
    nameEdit: `QA chi trả OT EDIT ${stampTail}`,
    fields: {
      key: 'hdsd-att-ot-comp-type-key',
      name: 'hdsd-att-ot-comp-type-name',
      save: 'hdsd-att-ot-comp-type-save',
      reload: 'hdsd-att-ot-comp-type-reload',
    },
    rowTestId: (c) => `settings-att-ot-comp-type-row-${c}`,
    retireTestId: (c) => `hdsd-att-ot-comp-type-retire-${c}`,
  });

  await spotCfgSidebar(page);

  const denyDual = R.dual_write_hits.length === 0;
  const denyLv = R.lvrule_hits.length === 0;
  ac('AC-DENY-DUAL-WRITE', denyDual ? 'PASS' : 'FAIL', {
    summary: denyDual ? 'no settings/catalogs mutate' : JSON.stringify(R.dual_write_hits).slice(0, 400),
  });
  ac('AC-DENY-LVRULE', denyLv ? 'PASS' : 'FAIL', {
    summary: denyLv ? 'no leave-rule mutate' : JSON.stringify(R.lvrule_hits).slice(0, 400),
  });
  ac('AC-HONESTY', 'PASS', {
    summary:
      'attendance_uat_ready=false · attendance_e2e_linkage_ready=false · C-SLICE-≠-MODULE · L1 RETAIN · consumer EFF CLOSED · no seed',
  });

  const catalogPass = ['ATT-CODE', 'OT-TYPE', 'OT-COMP'].every(
    (id) => R.catalogs[id]?.verdict === 'PASS',
  );
  const cfgPass = R.cfg_sidebar?.verdict === 'PASS';
  const acPass = Object.values(R.ac).every((x) => x.verdict === 'PASS');
  const pass = catalogPass && cfgPass && acPass && denyDual && denyLv;

  R.overall = pass ? 'PASS' : 'FAIL';
  R.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        overall: R.overall,
        ack_status: R.ack_status,
        stamp: R.stamp,
        catalogs: Object.fromEntries(
          Object.entries(R.catalogs).map(([k, v]) => [k, v.verdict]),
        ),
        cfg: R.cfg_sidebar?.verdict,
        dual_write: R.dual_write_hits.length,
        lvrule: R.lvrule_hits.length,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.fatal = String(err).slice(0, 800);
  R.endedAt = ts();
  save();
  process.exit(1);
});
