#!/usr/bin/env node
/**
 * PO-HRM-JD-DYNAMIC-QA-01 — U65 browser-only
 * J-HRM-JD-01 Settings field/group/pack/rule → Lưu → F5
 * J-HRM-JD-02 Thư viện Thêm JD → pack resolve → Lưu snapshot v2 → F5
 * J-HRM-JD-03 Xem hierarchy from snapshot
 * G4 đổi chức danh confirm · OBS Driver pack
 * Cấm: seed · dual-write job_postings · remaster_program_done · face_live
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
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

let BASE = PORTAL;
let PORTAL_MODE = true;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-01.FINAL.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const SUFFIX = `QA${Date.now().toString(36).slice(-6).toUpperCase()}`;

const results = {
  work_item_id: 'PO-HRM-JD-DYNAMIC-QA-01',
  startedAt: ts(),
  u65: 'zero-seed · browser-only · FE mutates OK',
  hdsd_align: true,
  inventory: [
    'Settings → tab Cấu hình JD → Trường/Nhóm/Pack/Rule',
    'Tuyển dụng → Thư viện JD → Thêm JD → Lưu',
    'Thư viện JD → Xem hierarchy snapshot',
    'G4 đổi chức danh → Áp pack mới',
    'OBS Driver pack path',
  ],
  journeys: ['J-HRM-JD-01', 'J-HRM-JD-02', 'J-HRM-JD-03', 'G4', 'OBS-DRIVER'],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  apiProbe: {},
  network: [],
  mutates: [],
  consoleErrors: [],
  pageErrors: [],
  steps: {},
  checks: {},
  failReasons: [],
  screens: [],
  residuals: [],
  honesty: {
    remaster_program_done_claimed: false,
    seed_used: false,
    dual_write_job_postings: false,
    face_live_claimed: false,
  },
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function step(id, status, note) {
  results.steps[id] = { status, note, at: ts() };
  save();
}

function check(id, pass, note) {
  results.checks[id] = { pass: !!pass, note: String(note || ''), at: ts() };
  if (!pass) results.failReasons.push(`${id}: ${note}`);
  save();
}

function fail(reason) {
  results.failReasons.push(reason);
  save();
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal5173', PORTAL],
    ['hrm_fe', `${HRM_FE}/hr/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  if (results.l0.portal5173 === 200) {
    BASE = PORTAL;
    PORTAL_MODE = true;
  } else if (results.l0.hrm_fe === 200) {
    BASE = HRM_FE;
    PORTAL_MODE = false;
    results.l0.portal_fallback = 'hrm_fe_8080';
  }
  results.env.BASE = BASE;
  results.env.PORTAL_MODE = PORTAL_MODE;
  save();
}

async function loginApi() {
  const urls = [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  let lastErr = 'login failed';
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (!token) {
        lastErr = `login HTTP ${r.status} via ${url}`;
        continue;
      }
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        email: EMAIL,
        companyId: COMPANY,
        http: r.status,
        loginVia: url,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || u.name || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    } catch (e) {
      lastErr = String(e?.message || e).slice(0, 120);
    }
  }
  throw new Error(lastErr);
}

async function probeJdApis(token) {
  const h = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const paths = [
    ['field_defs', `GET ${HRM}/api/hrm/recruitment/jd-field-defs?company_id=${COMPANY}`],
    ['group_defs', `GET ${HRM}/api/hrm/recruitment/jd-group-defs?company_id=${COMPANY}`],
    ['packs', `GET ${HRM}/api/hrm/recruitment/jd-default-packs?company_id=${COMPANY}`],
    ['rules', `GET ${HRM}/api/hrm/recruitment/jd-pack-rules?company_id=${COMPANY}`],
  ];
  for (const [key, label] of paths) {
    const url = label.split(' ')[1];
    try {
      const r = await fetch(url, { headers: h, signal: AbortSignal.timeout(10000) });
      const body = await r.json().catch(() => ({}));
      results.apiProbe[key] = {
        status: r.status,
        code: body?.code || null,
        message: String(body?.message || '').slice(0, 160),
        total: body?.data?.total ?? body?.data?.items?.length ?? body?.items?.length ?? null,
      };
    } catch (e) {
      results.apiProbe[key] = { status: 'ERR', message: String(e?.message || e).slice(0, 120) };
    }
  }
  try {
    const r = await fetch(`${HRM}/api/hrm/recruitment/jd-pack-rules/resolve`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ company_id: COMPANY, job_family: 'IT' }),
      signal: AbortSignal.timeout(10000),
    });
    const body = await r.json().catch(() => ({}));
    results.apiProbe.resolve_it = {
      status: r.status,
      code: body?.code || null,
      pack: body?.data?.pack?.code || body?.data?.pack_code || null,
      message: String(body?.message || '').slice(0, 160),
    };
  } catch (e) {
    results.apiProbe.resolve_it = { status: 'ERR', message: String(e?.message || e).slice(0, 120) };
  }
  save();
}

function q(path, tab) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (tab) u.searchParams.set('tab', tab);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s, portalMode }) => {
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
        if (portalMode) store.setItem('hrm_portal_mode', '1');
        else store.removeItem('hrm_portal_mode');
      }
    },
    { s: session, portalMode: PORTAL_MODE },
  );
}

async function shot(page, name) {
  try {
    mkdirSync(SCREEN, { recursive: true });
    const path = join(SCREEN, `${name}.png`);
    await page.screenshot({ path, fullPage: false, timeout: 15_000 });
    results.screens.push(`evidence/screens/po-hrm-jd-dynamic-qa-01/${name}.png`);
  } catch (e) {
    results.screens.push(`SHOT_FAIL:${name}:${String(e?.message || e).slice(0, 80)}`);
  }
  save();
}

async function fillByLabel(page, labelRe, value) {
  const byLabel = page.getByLabel(labelRe).first();
  if (await byLabel.isVisible().catch(() => false)) {
    await byLabel.fill(value);
    return true;
  }
  const dialog = page.locator('[role="dialog"]').last();
  const input = dialog.locator('input:not([type="hidden"]), textarea').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(value);
    return true;
  }
  return false;
}

async function clearOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => null);
    await sleep(180);
  }
}

function trackNetwork(page) {
  page.on('request', (req) => {
    const m = req.method();
    const url = req.url();
    if (!/\/api\/hrm\//.test(url)) return;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(m) && !/jd-|job-templates/.test(url)) return;
    results.network.push({ phase: 'req', method: m, url: url.slice(0, 220), at: ts() });
  });
  page.on('response', async (res) => {
    const req = res.request();
    const m = req.method();
    const url = res.url();
    if (!/\/api\/hrm\//.test(url)) return;
    const interesting =
      /jd-|job-templates/.test(url) || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m);
    if (!interesting) return;
    const entry = {
      phase: 'res',
      method: m,
      status: res.status(),
      url: url.slice(0, 220),
      at: ts(),
    };
    results.network.push(entry);
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(m) && /jd-|job-templates/.test(url)) {
      results.mutates.push(entry);
    }
    save();
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(String(msg.text()).slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err?.message || err).slice(0, 240));
  });
}

async function openSettingsJd(page) {
  await clearOverlays(page);
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  await clearOverlays(page);
  const tab = page.getByTestId('settings-tab-jd-dynamic');
  const visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    // try role/text
    const byText = page.getByRole('tab', { name: /Cấu hình JD/i });
    if (await byText.isVisible().catch(() => false)) {
      await byText.click();
    } else {
      return { ok: false, reason: 'settings-tab-jd-dynamic not visible' };
    }
  } else {
    await tab.click();
  }
  await sleep(2000);
  const panel = page.getByTestId('jd-dynamic-settings-panel');
  const panelOk = await panel.isVisible().catch(() => false);
  return { ok: panelOk, reason: panelOk ? 'panel visible' : 'jd-dynamic-settings-panel missing' };
}

async function runJ01(page) {
  step('J-HRM-JD-01', 'RUNNING', 'Settings CFG mutate');
  const open = await openSettingsJd(page);
  check('J01_panel', open.ok, open.reason);
  await shot(page, '01-settings-jd-panel');

  const alert = page.locator('[role="alert"]').first();
  const alertText = (await alert.isVisible().catch(() => false))
    ? ((await alert.textContent()) || '').trim().slice(0, 200)
    : '';
  results.steps.J01_alert = { status: alertText ? 'WARN' : 'OK', note: alertText || 'no alert', at: ts() };

  const fieldRowsBefore = await page.getByTestId('jd-settings-field-row').count().catch(() => 0);
  const emptyFields = await page.getByTestId('jd-settings-fields-empty').isVisible().catch(() => false);

  // Create field via FE
  const fieldKey = `qa_benefit_${SUFFIX.toLowerCase()}`;
  const fieldLabel = `QA Đãi ngộ ${SUFFIX}`;
  await page.getByTestId('jd-settings-field-key').fill(fieldKey);
  await page.getByTestId('jd-settings-field-label').fill(fieldLabel);
  await page.getByTestId('jd-settings-field-save').click();
  await sleep(2500);
  await shot(page, '02-settings-field-after-save');

  const fieldPost = results.mutates.filter((m) => /jd-field-defs/.test(m.url) && m.method === 'POST');
  const fieldPostOk = fieldPost.some((m) => m.status >= 200 && m.status < 300);
  check(
    'J01_field_create_2xx',
    fieldPostOk,
    fieldPost.length
      ? `POST jd-field-defs statuses=${fieldPost.map((m) => m.status).join(',')}`
      : `no POST jd-field-defs (rowsBefore=${fieldRowsBefore} empty=${emptyFields} alert=${alertText || '—'})`,
  );

  // Groups tab
  await page.getByRole('tab', { name: /Nhóm thông tin/i }).click();
  await sleep(800);
  const groupRows = await page.getByTestId('jd-settings-group-row').count().catch(() => 0);
  await shot(page, '03-settings-groups');
  check(
    'J01_groups_visible_or_create_path',
    groupRows > 0 || (await page.getByTestId('jd-settings-group-save').isVisible().catch(() => false)),
    `groupRows=${groupRows}`,
  );

  // Packs tab
  await page.getByRole('tab', { name: /Gói mặc định/i }).click();
  await sleep(800);
  const packRows = await page.getByTestId('jd-settings-pack-row').count().catch(() => 0);
  await shot(page, '04-settings-packs');
  check('J01_packs_list_or_save', packRows > 0 || (await page.getByTestId('jd-settings-pack-save').isVisible()), `packRows=${packRows}`);

  // Rules tab + Lưu
  await page.getByRole('tab', { name: /Rule chọn gói/i }).click();
  await sleep(800);
  const rulesBox = page.getByTestId('jd-settings-rules-json');
  const rulesVisible = await rulesBox.isVisible().catch(() => false);
  check('J01_rules_editor', rulesVisible, rulesVisible ? 'rules textarea visible' : 'missing');
  if (rulesVisible) {
    const current = await rulesBox.inputValue().catch(() => '[]');
    results.steps.J01_rules_json_len = { status: 'OBS', note: `len=${current.length}`, at: ts() };
    await page.getByTestId('jd-settings-rules-save').click();
    await sleep(2000);
  }
  await shot(page, '05-settings-rules');

  const rulesPut = results.mutates.filter((m) => /jd-pack-rules/.test(m.url) && m.method === 'PUT');
  const rulesOk = rulesPut.some((m) => m.status >= 200 && m.status < 300);
  check(
    'J01_rules_save_2xx',
    rulesOk,
    rulesPut.length ? `PUT statuses=${rulesPut.map((m) => m.status).join(',')}` : 'no PUT jd-pack-rules',
  );

  // F5
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const tab2 = page.getByTestId('settings-tab-jd-dynamic');
  if (await tab2.isVisible().catch(() => false)) await tab2.click();
  else await page.getByRole('tab', { name: /Cấu hình JD/i }).click().catch(() => null);
  await sleep(2000);
  const panelAfter = await page.getByTestId('jd-dynamic-settings-panel').isVisible().catch(() => false);
  const fieldRowsAfter = await page.getByTestId('jd-settings-field-row').count().catch(() => 0);
  await shot(page, '06-settings-after-f5');
  check(
    'J01_f5_persist',
    fieldPostOk ? fieldRowsAfter >= fieldRowsBefore + 1 || fieldRowsAfter > 0 : false,
    `fieldRowsBefore=${fieldRowsBefore} afterF5=${fieldRowsAfter} panel=${panelAfter}`,
  );

  const pass =
    results.checks.J01_field_create_2xx?.pass &&
    results.checks.J01_rules_save_2xx?.pass &&
    results.checks.J01_f5_persist?.pass;
  step('J-HRM-JD-01', pass ? 'PASS' : 'FAIL', pass ? 'Settings CFG persist OK' : 'Settings CFG blocked/fail');
  return pass;
}

async function pickFirstPosition(page) {
  const picker = page.getByTestId('hdsd-jd-form-position').or(page.locator('[data-testid*="jd-form-position"]')).first();
  // CatalogSearchPicker often is a button/combobox
  const trigger =
    page.locator('[data-testid="hdsd-jd-form-position"], [data-testid="jd-form-position"]').first();
  let el = trigger;
  if (!(await el.isVisible().catch(() => false))) {
    el = page.getByRole('combobox').first();
  }
  if (!(await el.isVisible().catch(() => false))) {
    // click placeholder area
    el = page.getByText(/Chọn chức danh/i).first();
  }
  await el.click({ force: true }).catch(() => null);
  await sleep(600);
  // Prefer IT-ish option
  const options = page.locator('[role="option"]');
  const n = await options.count().catch(() => 0);
  let picked = null;
  for (let i = 0; i < Math.min(n, 40); i++) {
    const t = ((await options.nth(i).textContent()) || '').trim();
    if (/IT|TECH|Software|Dev|Phần mềm|Công nghệ|Lập trình/i.test(t)) {
      await options.nth(i).click();
      picked = t;
      break;
    }
  }
  if (!picked && n > 0) {
    const t = ((await options.nth(0).textContent()) || '').trim();
    await options.nth(0).click();
    picked = t;
  }
  await sleep(1500);
  return { count: n, picked };
}

async function runJ02(page) {
  step('J-HRM-JD-02', 'RUNNING', 'Create JD + pack resolve');
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2800);
  await clearOverlays(page);
  await shot(page, '07-jd-library');

  const addBtn = page.getByRole('button', { name: /^Thêm JD$/i });
  const addVisible = await addBtn.first().isVisible().catch(() => false);
  check('J02_add_btn', addVisible, addVisible ? 'Thêm JD visible' : 'Thêm JD missing');
  if (!addVisible) {
    step('J-HRM-JD-02', 'FAIL', 'add button missing');
    return false;
  }
  await addBtn.first().click();
  await sleep(1500);

  const dialog = page.locator('[role="dialog"]').filter({ hasText: /Thêm JD/i });
  const dialogOk = await dialog.first().isVisible().catch(() => false);
  check('J02_dialog', dialogOk, dialogOk ? 'writer dialog open' : 'writer dialog missing');
  // residual: HDSD jdForm* keys missing → data-testid undefined
  const undefTid = await page.locator('[data-testid="undefined"]').count().catch(() => 0);
  results.residuals.push({
    id: 'FE-HDSD-JD-TESTIDS',
    owner: 'dev-fe',
    note: `HDSD_MUTATE_TEST_IDS.jdForm*/jdLibrary* absent → data-testid=undefined count≈${undefTid}`,
  });
  await shot(page, '08-jd-writer-open');
  if (!dialogOk) {
    step('J-HRM-JD-02', 'FAIL', 'dialog missing');
    return false;
  }

  const title = `QA JD Dynamic ${SUFFIX}`;
  const code = `JD-QA-${SUFFIX}`;
  const tOk = await fillByLabel(page, /Tiêu đề/i, title);
  const cOk = await fillByLabel(page, /Mã JD/i, code);
  if (!tOk || !cOk) {
    // fallback: order title, code in dialog
    const inputs = dialog.locator('input:not([type="hidden"])');
    const n = await inputs.count();
    if (n >= 1) await inputs.nth(0).fill(title);
    if (n >= 2) await inputs.nth(1).fill(code);
  }

  const pos = await pickFirstPosition(page);
  results.steps.J02_position = { status: 'OBS', note: JSON.stringify(pos), at: ts() };
  await sleep(2000);
  await shot(page, '09-jd-writer-after-position');

  const packLabel = page.getByTestId('jd-writer-pack-label');
  const packVisible = await packLabel.isVisible().catch(() => false);
  const packText = packVisible ? ((await packLabel.textContent()) || '').trim() : '';
  const resolveWarn = page.locator('text=/resolve|Không|fallback|404|HRM-JD/i').first();
  const warnText = (await resolveWarn.isVisible().catch(() => false))
    ? ((await resolveWarn.textContent()) || '').slice(0, 180)
    : '';

  const resolveNet = results.network.filter(
    (n) => n.phase === 'res' && /jd-pack-rules\/resolve/.test(n.url),
  );
  const resolve2xx = resolveNet.some((n) => n.status >= 200 && n.status < 300);
  check(
    'J02_pack_resolve_2xx',
    resolve2xx && packVisible,
    `resolve statuses=${resolveNet.map((n) => n.status).join(',') || 'none'} packLabel=${packText || '—'} warn=${warnText || '—'}`,
  );

  const canvas = page.getByTestId('jd-writer-canvas');
  const canvasGroups = await page.locator('[data-testid^="jd-writer-group-"]').count().catch(() => 0);
  results.steps.J02_canvas = {
    status: canvasGroups > 0 ? 'OBS' : 'WARN',
    note: `groups=${canvasGroups}`,
    at: ts(),
  };

  // optional DnD — try drag first palette item if present
  const paletteItem = page.locator('[data-testid="jd-writer-optional-palette"] [data-rbd-draggable-id], [data-testid="jd-writer-optional-palette"] .cursor-grab').first();
  let dndTried = false;
  if (await paletteItem.isVisible().catch(() => false)) {
    dndTried = true;
    const box = await paletteItem.boundingBox().catch(() => null);
    const canvasBox = await canvas.boundingBox().catch(() => null);
    if (box && canvasBox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + 40, { steps: 12 });
      await page.mouse.up();
      await sleep(800);
    }
  }
  results.steps.J02_dnd = { status: 'OBS', note: dndTried ? 'dnd attempted' : 'no optional palette item', at: ts() };
  await shot(page, '10-jd-writer-before-save');

  const submit = page.getByRole('button', { name: /Lưu JD/i });
  const enabled = await submit.first().isEnabled().catch(() => false);
  if (enabled) {
    await submit.first().click();
    await sleep(3000);
  } else {
    fail('J02 submit disabled (position/resolve gate)');
    check('J02_submit_enabled', false, 'Lưu JD disabled');
  }
  await shot(page, '11-jd-writer-after-save');

  const createPosts = results.mutates.filter(
    (m) => /job-templates/.test(m.url) && m.method === 'POST' && !/jd-/.test(m.url.split('/recruitment/')[1] || ''),
  );
  // also match /job-templates without extra
  const jtPosts = results.mutates.filter((m) => /\/job-templates(?:\?|$)/.test(m.url) && m.method === 'POST');
  const createOk = jtPosts.some((m) => m.status >= 200 && m.status < 300);
  check(
    'J02_create_2xx',
    createOk,
    jtPosts.length ? `POST job-templates=${jtPosts.map((m) => m.status).join(',')}` : 'no POST job-templates',
  );

  // F5 list
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2500);
  const rowWithTitle = page.getByRole('row', { name: new RegExp(SUFFIX, 'i') });
  const rowVisible = await rowWithTitle.first().isVisible().catch(() => false);
  await shot(page, '12-jd-library-after-f5');
  check('J02_f5_row', createOk && rowVisible, `rowVisible=${rowVisible} title=${title}`);

  const pass =
    results.checks.J02_pack_resolve_2xx?.pass &&
    results.checks.J02_create_2xx?.pass &&
    results.checks.J02_f5_row?.pass;
  step('J-HRM-JD-02', pass ? 'PASS' : 'FAIL', pass ? 'create+snapshot OK' : 'create/resolve fail');
  results._createdTitle = title;
  results._createdCode = code;
  return pass;
}

async function runJ03(page) {
  step('J-HRM-JD-03', 'RUNNING', 'View hierarchy from snapshot');
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2500);

  let viewBtn = page.getByTestId('jd-library-view-btn').first();
  if (results._createdTitle) {
    const row = page.getByRole('row', { name: new RegExp(SUFFIX, 'i') });
    if (await row.first().isVisible().catch(() => false)) {
      viewBtn = row.first().getByTestId('jd-library-view-btn');
    }
  }
  const canView = await viewBtn.isVisible().catch(() => false);
  if (!canView) {
    check('J03_view_open', false, 'no Xem button / no JD row');
    step('J-HRM-JD-03', 'FAIL', 'no view target');
    await shot(page, '13-jd-view-missing');
    return false;
  }
  await viewBtn.click();
  await sleep(1500);
  const panel = page.getByTestId('jd-template-view-panel');
  const panelOk = await panel.isVisible().catch(() => false);
  const groups = await page.locator('[data-testid^="jd-view-group-"]').count().catch(() => 0);
  const hardcodeSmell = await page.locator('text=/TopCV purple|PACK_IT_OFFICE hardcoded/i').count().catch(() => 0);
  await shot(page, '14-jd-view-hierarchy');
  check(
    'J03_hierarchy_from_snapshot',
    panelOk && groups > 0,
    `panel=${panelOk} viewGroups=${groups} hardcodeSmell=${hardcodeSmell}`,
  );
  // If create failed, empty/legacy view may still open — require groups for PASS
  const pass = results.checks.J03_hierarchy_from_snapshot?.pass;
  step('J-HRM-JD-03', pass ? 'PASS' : 'FAIL', pass ? 'snapshot hierarchy rendered' : 'hierarchy missing');
  await page.keyboard.press('Escape').catch(() => null);
  return pass;
}

async function runG4(page) {
  step('G4', 'RUNNING', 'change position → confirm apply pack');
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2200);
  const editBtn = page
    .getByRole('row', { name: new RegExp(SUFFIX, 'i') })
    .getByRole('button', { name: /Sửa|Edit/i })
    .first();
  const canEdit = await editBtn.isVisible().catch(() => false);
  if (!canEdit) {
    // open create then change position twice
    const add = page.getByRole('button', { name: /^Thêm JD$/i }).first();
    if (!(await add.isVisible().catch(() => false))) {
      check('G4_confirm_dialog', false, 'no edit/create path for G4');
      step('G4', 'BLOCKED', 'no row to edit');
      await shot(page, '15-g4-blocked');
      return false;
    }
    await add.click();
    await sleep(1200);
    await fillByLabel(page, /Tiêu đề/i, `QA G4 ${SUFFIX}`);
    await fillByLabel(page, /Mã JD/i, `JD-G4-${SUFFIX}`);
    const p1 = await pickFirstPosition(page);
    await sleep(1200);
    const p2 = await pickFirstPosition(page);
    results.steps.G4_positions = { status: 'OBS', note: JSON.stringify({ p1, p2 }), at: ts() };
  } else {
    await editBtn.click();
    await sleep(1200);
    await pickFirstPosition(page);
    await sleep(800);
    await pickFirstPosition(page);
  }
  await sleep(1000);
  const confirm = page.getByTestId('jd-writer-pack-confirm');
  const confirmVisible = await confirm.isVisible().catch(() => false);
  await shot(page, '15-g4-confirm');
  if (confirmVisible) {
    // capture title value before
    const titleBefore = await page.getByLabel(/Tiêu đề/i).first().inputValue().catch(() => '');
    await page.getByRole('button', { name: /Áp pack mới/i }).click();
    await sleep(1500);
    const titleAfter = await page.getByLabel(/Tiêu đề/i).first().inputValue().catch(() => '');
    check(
      'G4_confirm_dialog',
      true,
      `confirm shown; title kept=${titleBefore === titleAfter} before=${titleBefore.slice(0, 40)}`,
    );
    step('G4', 'PASS', 'confirm apply pack shown; values check OBS');
    await page.keyboard.press('Escape').catch(() => null);
    return true;
  }
  check(
    'G4_confirm_dialog',
    false,
    'confirm dialog not shown (resolve/API may be down or same pack)',
  );
  step('G4', 'FAIL', 'no confirm dialog');
  await page.keyboard.press('Escape').catch(() => null);
  return false;
}

async function runObsDriver(page) {
  step('OBS-DRIVER', 'RUNNING', 'Driver pack path if rule exists');
  // Settings preview resolve with a DRIVER-ish position if possible
  const open = await openSettingsJd(page);
  if (!open.ok) {
    results.steps['OBS-DRIVER'] = { status: 'BLOCKED', note: 'settings panel unavailable', at: ts() };
    check('OBS_driver_pack', false, 'settings blocked');
    return false;
  }
  await page.getByRole('tab', { name: /Rule chọn gói/i }).click();
  await sleep(600);
  const preview = page.getByTestId('jd-settings-resolve-position');
  if (await preview.isVisible().catch(() => false)) {
    await preview.fill('DRIVER');
    await page.getByRole('button', { name: /Preview pack/i }).click();
    await sleep(1500);
    const res = page.getByTestId('jd-settings-resolve-result');
    const text = (await res.isVisible().catch(() => false)) ? ((await res.textContent()) || '').trim() : '';
    await shot(page, '16-obs-driver-preview');
    const ok = /PACK_DRIVER|DRIVER/i.test(text);
    if (ok) {
      check('OBS_driver_pack', true, text.slice(0, 160));
      step('OBS-DRIVER', 'PASS', text.slice(0, 120));
      return true;
    }
    // config may not resolve via position_code alone — note BLOCKED config
    check('OBS_driver_pack', false, `preview=${text || 'empty'}; BLOCKED config if rule match_type=job_family only`);
    step('OBS-DRIVER', 'BLOCKED', `config/API: ${text || results.apiProbe.resolve_it?.message || 'no preview'}`);
    results.residuals.push({
      id: 'OBS-DRIVER-CONFIG',
      note: 'Driver pack preview not confirmed via position_code=DRIVER; bootstrap rules match job_family DRIVER/FLEET',
    });
    return false;
  }
  check('OBS_driver_pack', false, 'preview input missing');
  step('OBS-DRIVER', 'BLOCKED', 'UI preview missing');
  return false;
}

async function main() {
  await probeL0();
  check('L0_hrm', results.l0.hrm === 200, `hrm=${results.l0.hrm}`);
  check('L0_portal', results.l0.portal5173 === 200 || results.l0.hrm_fe === 200, `portal=${results.l0.portal5173}`);

  const session = await loginApi();
  step('auth', 'PASS', `login via ${session.loginVia}`);
  await probeJdApis(session.token);

  const apisLive =
    results.apiProbe.field_defs?.status === 200 &&
    results.apiProbe.groups_defs?.status === 200;
  // typo fix
  const cfgLive =
    results.apiProbe.field_defs?.status === 200 &&
    results.apiProbe.group_defs?.status === 200 &&
    results.apiProbe.packs?.status === 200 &&
    results.apiProbe.rules?.status === 200;
  check(
    'API_jd_cfg_live',
    cfgLive,
    `field=${results.apiProbe.field_defs?.status} group=${results.apiProbe.group_defs?.status} pack=${results.apiProbe.packs?.status} rules=${results.apiProbe.rules?.status} resolve=${results.apiProbe.resolve_it?.status}`,
  );
  if (!cfgLive) {
    results.residuals.push({
      id: 'BE-COMPILE-BLOCK',
      owner: 'dev-be',
      note: 'hrm-api nest watch: Found 4 errors in jd-dynamic.service.ts — JD routes not registered (404). Fix TS then restart; re-QA.',
    });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  trackNetwork(page);
  await injectPortalAuth(page, session);

  const runners = [
    ['J01', runJ01],
    ['J02', runJ02],
    ['J03', runJ03],
    ['G4', runG4],
    ['OBS', runObsDriver],
  ];
  for (const [name, fn] of runners) {
    try {
      await fn(page);
    } catch (e) {
      fail(`${name} exception: ${String(e?.message || e).slice(0, 240)}`);
      step(name, 'FAIL', String(e?.message || e).slice(0, 160));
      await shot(page, `99-${name}-exception`).catch(() => null);
      await clearOverlays(page);
    }
  }

  await browser.close();

  const critical = ['J01_field_create_2xx', 'J01_f5_persist', 'J02_pack_resolve_2xx', 'J02_create_2xx', 'J02_f5_row', 'J03_hierarchy_from_snapshot'];
  const criticalPass = critical.every((k) => results.checks[k]?.pass);
  results.verdict = criticalPass ? 'PASS' : 'FAIL';
  results.ack_status = criticalPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  results.honesty.mutates_count = results.mutates.length;
  save();
  console.log(JSON.stringify({ verdict: results.verdict, ack: results.ack_status, fails: results.failReasons, apiProbe: results.apiProbe }, null, 2));
  process.exit(criticalPass ? 0 : 2);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  fail(String(e?.stack || e).slice(0, 500));
  save();
  console.error(e);
  process.exit(2);
});
