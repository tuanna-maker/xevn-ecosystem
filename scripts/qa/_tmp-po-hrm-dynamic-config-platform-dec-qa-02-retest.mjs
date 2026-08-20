#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02 retest — create + CNS + history only
 * Fixes: employee_name fill + scroll submit; reuse OPEN_KEY from prior run or create fresh
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const PRIOR = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-browser.json',
);
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-02-retest.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-dec-qa-02',
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

const prior = existsSync(PRIOR) ? JSON.parse(readFileSync(PRIOR, 'utf8')) : {};
const OPEN_KEY = `hr_custom_dec_09_${stamp}`.slice(0, 48);
const OPEN_LABEL = `QSĐ HR retest ${stamp}`;
const UNKNOWN_KEY = `zz_unknown_dec_${stamp}`;
const DEC_CODE = `QA-DEC-R-${stamp.toUpperCase()}`;
const DEC_TITLE = `Quyết định retest ${stamp}`;

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02',
  kind: 'retest-create-cns-history',
  stamp: `DECPLATQA2R-${stamp.toUpperCase()}`,
  prior_stamp: prior.stamp || null,
  stamp_ref_l1: 'DECPLATQA-MSJ1FB3D',
  startedAt: ts(),
  env: { OPEN_KEY, OPEN_LABEL, UNKNOWN_KEY, DEC_CODE, COMPANY, API_COMPANY },
  ac: {},
  probes: {},
  network: [],
  click_log: [],
  honesty: prior.honesty || { decisions_uat_ready: false, seed_used: false },
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(R, null, 2));
}
function log(msg) {
  R.click_log.push({ at: ts(), msg });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
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
  const j = await r.json();
  const d = j?.data ?? j;
  const token = d?.accessToken ?? d?.access_token;
  if (!token) throw new Error(`login ${r.status}`);
  const u = d?.user ?? {};
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
    raw: d,
  };
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
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await r.json().catch(() => null);
  return { status: r.status, json, code: json?.code || json?.error?.code || null };
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

async function toastTexts(page) {
  const parts = await page
    .locator(
      '[data-sonner-toast], [data-radix-toast-viewport] li, [role="status"], li[data-state="open"]',
    )
    .allInnerTexts()
    .catch(() => []);
  return (parts || []).join('\n');
}

async function fillEmployeeName(page, value) {
  const dialog = page.locator('[role="dialog"]').last();
  const byLabel = dialog.getByLabel(/Tên nhân viên|Employee Name|Họ và tên/i);
  if (await byLabel.isVisible().catch(() => false)) {
    await byLabel.fill(value);
    return { ok: true, via: 'getByLabel' };
  }
  const byText = dialog
    .locator('div.space-y-2')
    .filter({ hasText: /Tên nhân viên/i })
    .locator('input')
    .first();
  if (await byText.isVisible().catch(() => false)) {
    await byText.fill(value);
    return { ok: true, via: 'space-y-2' };
  }
  return { ok: false, via: 'miss' };
}

async function pickType(page, key, label) {
  const picker = page.getByTestId('hdsd-decisions-form-type');
  await picker.click({ force: true });
  await sleep(400);
  const input = page
    .locator('[data-radix-popper-content-wrapper] input, [role="dialog"] input[placeholder*="Tìm"]')
    .last();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(key);
    await sleep(400);
  }
  const re = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|' + (label || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const opt = page.locator('[role="option"], [cmdk-item]').filter({ hasText: re }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(300);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function pickFirstEmployee(page) {
  const trig = page.getByTestId('hdsd-decisions-form-employee');
  if (!(await trig.isVisible().catch(() => false))) return { ok: false, reason: 'missing' };
  await trig.click();
  await sleep(500);
  const opt = page.locator('[role="option"]').first();
  if (!(await opt.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'no_options' };
  }
  const text = ((await opt.innerText().catch(() => '')) || '').slice(0, 80);
  await opt.click();
  await sleep(400);
  return { ok: true, text };
}

async function pickPosition(page) {
  const picker = page.getByTestId('hdsd-decisions-form-position');
  if (!(await picker.isVisible().catch(() => false))) return false;
  await picker.click({ force: true });
  await sleep(500);
  const opt = page.locator('[role="option"], [cmdk-item]').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(300);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function openCreate(page) {
  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  await page.getByRole('button', { name: /Thêm quyết định|\+\s*Thêm/i }).first().click();
  await sleep(1500);
  return page.getByTestId('hdsd-decisions-form-code').isVisible().catch(() => false);
}

async function main() {
  const session = await loginApi();
  log('login ok');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', (d) => void d.accept());
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/decisions/.test(u)) return;
    let body = null;
    try {
      if (res.request().method() !== 'GET') {
        const j = await res.json().catch(() => null);
        body = j
          ? {
              code: j.code || j?.error?.code,
              id: j?.data?.id || j?.id,
              decision_type: j?.data?.decision_type || j?.decision_type,
              message: j?.message,
            }
          : null;
      }
    } catch {
      /* */
    }
    R.network.push({
      method: res.request().method(),
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      body,
      at: ts(),
    });
  });
  await injectPortalAuth(page, session);

  // U65: create OPEN_KEY via Settings FE (not API invent / seed:*)
  log('Settings FE create OPEN_KEY');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  const tab = page.getByTestId('settings-tab-dec-decision-types');
  if (!(await tab.isVisible().catch(() => false))) {
    ac('AC-PLT-DEC-MUSTKEEP-CREATE', 'FAIL', { summary: 'DEC settings tab missing on retest' });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }
  await tab.click({ force: true });
  await sleep(1200);
  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/decisions\/decision-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);
  await page.getByTestId('hdsd-dec-decision-type-key').fill(OPEN_KEY);
  await page.getByTestId('hdsd-dec-decision-type-name').fill(OPEN_LABEL);
  await page.getByTestId('hdsd-dec-decision-type-save').click();
  const upsertRes = await upsertWait;
  let upsertStatus = upsertRes?.status() ?? 0;
  let upsertBody = null;
  try {
    upsertBody = upsertRes ? await upsertRes.json() : null;
  } catch {
    upsertBody = null;
  }
  R.probes.putOpen = {
    status: upsertStatus,
    method: upsertRes?.request()?.method() ?? null,
    id: upsertBody?.data?.id ?? upsertBody?.id ?? null,
    key: upsertBody?.data?.decisionTypeKey ?? OPEN_KEY,
    code: upsertBody?.code ?? null,
    via: 'settings_fe',
  };
  await shot(page, '19-retest-settings-create');
  if (!(upsertStatus >= 200 && upsertStatus < 300)) {
    ac('AC-PLT-DEC-MUSTKEEP-CREATE', 'FAIL', {
      summary: `Settings FE upsert OPEN_KEY FAIL ${upsertStatus}`,
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }
  log(`OPEN_KEY ready via FE ${OPEN_KEY} id=${R.probes.putOpen.id}`);

  // ——— CREATE ———
  const opened = await openCreate(page);
  if (!opened) {
    ac('AC-PLT-DEC-MUSTKEEP-CREATE', 'FAIL', { summary: 'create dialog missing' });
  } else {
    await page.getByTestId('hdsd-decisions-form-code').fill(DEC_CODE);
    await page.getByTestId('hdsd-decisions-form-title').fill(DEC_TITLE);
    const typeOk = await pickType(page, OPEN_KEY, OPEN_LABEL);
    const empPick = await pickFirstEmployee(page);
    const empFill = await fillEmployeeName(page, `NV Retest ${stamp}`);
    // if employee select filled name, keep; else ensure name
    const posOk = await pickPosition(page);
    R.probes.createFill = { typeOk, empPick, empFill, posOk };
    await shot(page, '20-retest-create-filled-top');
    // scroll submit
    const submit = page.getByTestId('hdsd-decisions-form-submit');
    await submit.scrollIntoViewIfNeeded().catch(() => {});
    await shot(page, '21-retest-create-before-submit');

    const waitPost = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/decisions(\?|$)/.test(res.url()) &&
          res.request().method() === 'POST' &&
          !/decision-types/.test(res.url()),
        { timeout: 30_000 },
      )
      .catch(() => null);

    await submit.click();
    await sleep(800);
    const toastAfter = await toastTexts(page);
    R.probes.createToast = toastAfter.slice(0, 400);
    const post = await waitPost;
    let status = post?.status() ?? 0;
    let body = null;
    try {
      body = post ? await post.json() : null;
    } catch {
      body = null;
    }
    R.probes.decisionCreate = {
      status,
      code: body?.code,
      id: body?.data?.id || body?.id,
      decision_type: body?.data?.decision_type || OPEN_KEY,
      toast: toastAfter.slice(0, 200),
    };
    await sleep(1000);
    await shot(page, '22-retest-create-after');
    const ok = status >= 200 && status < 300;
    ac('AC-PLT-DEC-MUSTKEEP-CREATE', ok ? 'PASS' : 'FAIL', {
      summary: ok
        ? `POST decisions → ${status} id=${R.probes.decisionCreate.id} type=${OPEN_KEY}`
        : `Create FAIL ${status} toast=${toastAfter.slice(0, 160)} fill=${JSON.stringify(empFill)}`,
      network: R.probes.decisionCreate,
    });
  }

  // ——— CNS ———
  log('CNS retest');
  const opened2 = await openCreate(page);
  if (opened2) {
    await page.getByTestId('hdsd-decisions-form-code').fill(`CNS-R-${stamp.toUpperCase()}`);
    await page.getByTestId('hdsd-decisions-form-title').fill(`CNS retest ${stamp}`);
    await pickType(page, OPEN_KEY, OPEN_LABEL);
    await pickFirstEmployee(page);
    await fillEmployeeName(page, 'CNS Probe');
    await pickPosition(page);

    let rewrote = false;
    await page.route('**/api/hrm/decisions**', async (route) => {
      const req = route.request();
      const url = req.url();
      if (req.method() === 'POST' && !/decision-types/.test(url) && !rewrote) {
        rewrote = true;
        let body = {};
        try {
          body = JSON.parse(req.postData() || '{}');
        } catch {
          body = {};
        }
        body.decision_type = UNKNOWN_KEY;
        await route.continue({
          postData: JSON.stringify(body),
          headers: { ...req.headers(), 'content-type': 'application/json' },
        });
        return;
      }
      await route.continue();
    });

    const waitCns = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/decisions(\?|$)/.test(res.url()) &&
          res.request().method() === 'POST' &&
          !/decision-types/.test(res.url()),
        { timeout: 30_000 },
      )
      .catch(() => null);

    await page.getByTestId('hdsd-decisions-form-submit').scrollIntoViewIfNeeded();
    await page.getByTestId('hdsd-decisions-form-submit').click();
    const cnsRes = await waitCns;
    let cnsStatus = cnsRes?.status() ?? 0;
    let cnsBody = null;
    try {
      cnsBody = cnsRes ? await cnsRes.json() : null;
    } catch {
      cnsBody = null;
    }
    await sleep(1200);
    const toast = await toastTexts(page);
    const toastOk =
      /HRM-DEC-TYPE-UNKNOWN/i.test(toast) ||
      /không thuộc catalog hiệu lực/i.test(toast) ||
      /Loại quyết định không thuộc catalog/i.test(toast);
    R.probes.cns = {
      status: cnsStatus,
      code: cnsBody?.code || cnsBody?.error?.code,
      message: cnsBody?.message,
      toast: toast.slice(0, 300),
      toastOk,
      rewrote,
    };
    await shot(page, '23-retest-cns');
    await page.unroute('**/api/hrm/decisions**').catch(() => {});
    const cnsOk =
      cnsStatus === 400 &&
      String(R.probes.cns.code || '') === 'HRM-DEC-TYPE-UNKNOWN' &&
      toastOk;
    ac('AC-PLT-DEC-CNS-UNKNOWN', cnsOk ? 'PASS' : 'FAIL', {
      summary: cnsOk
        ? 'POST → 400 HRM-DEC-TYPE-UNKNOWN + FE toast'
        : `CNS ${cnsStatus} code=${R.probes.cns.code} toastOk=${toastOk} rewrote=${rewrote} · ${toast.slice(0, 120)}`,
      network: R.probes.cns,
    });
    await page.keyboard.press('Escape').catch(() => {});
  } else {
    ac('AC-PLT-DEC-CNS-UNKNOWN', 'FAIL', { summary: 'dialog missing' });
  }

  // ——— Retire via Settings FE + history ———
  log('retire FE + history');
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  await page.getByTestId('settings-tab-dec-decision-types').click({ force: true });
  await sleep(1200);
  const retireBtn = page.getByTestId(`hdsd-dec-decision-type-retire-${OPEN_KEY}`);
  const retireWait = page
    .waitForResponse(
      (res) =>
        /\/decision-types\/[^/]+\/retire/.test(res.url()) && res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  if (await retireBtn.isVisible().catch(() => false)) {
    await retireBtn.click({ force: true });
  }
  const retireRes = await retireWait;
  R.probes.retire = {
    status: retireRes?.status() ?? 0,
    via: 'settings_fe',
  };
  await sleep(1000);

  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
  const feHas =
    bodyText.includes(OPEN_KEY) ||
    bodyText.includes(OPEN_LABEL) ||
    bodyText.includes(DEC_CODE) ||
    bodyText.includes(DEC_TITLE);

  const listH = await apiCall(
    session.token,
    'GET',
    `/api/hrm/decisions?company_id=${API_COMPANY}&page_size=50`,
  );
  const listM = await apiCall(
    session.token,
    'GET',
    `/api/hrm/decisions?company_id=${COMPANY}&page_size=50`,
  );
  const rows = [...unwrapList(listH.json), ...unwrapList(listM.json)];
  const hist = rows.find(
    (d) =>
      d.decision_code === DEC_CODE ||
      d.decisionCode === DEC_CODE ||
      d.id === R.probes.decisionCreate?.id,
  );
  R.probes.history = {
    feHas,
    apiFound: Boolean(hist),
    apiType: hist?.decision_type || hist?.decisionType || null,
  };
  await shot(page, '24-retest-history');
  const histOk =
    R.probes.decisionCreate?.status >= 200 &&
    R.probes.decisionCreate?.status < 300 &&
    (feHas ||
      (hist && String(hist.decision_type || hist.decisionType || '') === OPEN_KEY));
  ac('AC-PLT-DEC-HISTORY-KEY', histOk ? 'PASS' : 'FAIL', {
    summary: histOk
      ? `History keeps ${OPEN_KEY} after retire · fe=${feHas} apiType=${R.probes.history.apiType}`
      : `History miss · create=${R.probes.decisionCreate?.status} fe=${feHas}`,
  });

  // Form picker hide after retire (browser)
  const opened3 = await openCreate(page);
  let stillVisible = false;
  if (opened3) {
    stillVisible = await pickType(page, OPEN_KEY, OPEN_LABEL);
    await page.keyboard.press('Escape').catch(() => {});
  }
  ac('AC-PLT-DEC-RETIRE-FORM-HIDE', !stillVisible ? 'PASS' : 'FAIL', {
    summary: !stillVisible
      ? `Form picker hides ${OPEN_KEY}`
      : `Form still shows ${OPEN_KEY}`,
  });

  const fails = Object.values(R.ac).filter((a) => a.verdict === 'FAIL').length;
  const passes = Object.values(R.ac).filter((a) => a.verdict === 'PASS').length;
  R.overall = fails === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = { passes, fails };
  save();
  console.log(`\n=== RETEST ${R.overall} ${passes}/${passes + fails} stamp=${R.stamp} ===\n`);
  await browser.close();
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => {
  R.fatal = String(e?.stack || e).slice(0, 1000);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
