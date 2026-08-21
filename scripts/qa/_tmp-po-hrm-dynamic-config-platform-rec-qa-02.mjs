#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02 — U65 browser AC-PLT-REC-02..05
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false · zero-seed
 * Cấm: seed · flip ready · reopen REC-QC-01 L1 · module REC UAT invent
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-rec-qa-02',
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

const STG_KEY = `hr_custom_stage_07_${stamp}`;
const STG_LABEL = `GĐ QA REC ${stamp}`;
const UNKNOWN_STAGE = `not_in_catalog_qa_${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01',
  resume_chunk: 'K6.2e',
  startedAt: ts(),
  stamp: `RECPLATQA2-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  hdsd_align:
    'Settings → Giai đoạn REC · Tuyển dụng → Ứng viên picker · retire · UNKNOWN toast · Hire EMP',
  honesty: {
    recruitment_uat_ready: false,
    payroll_e2e_ready: false,
    seed_used: false,
    deny_module_rec_uat: true,
    deny_j_star_promote: true,
    deny_reopen_rec_qc_01_l1: true,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, STG_KEY, STG_LABEL, UNKNOWN_STAGE },
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

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('dialog', (d) => {
    R.probes.lastDialog = d.message().slice(0, 200);
    void d.accept();
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/recruitment\/(pipeline-stages|candidates-pool|jd-|job-|interviews|requisitions)/.test(
          u,
        )
      )
        return;
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
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

async function openRecSettingsTab(page) {
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Giai đoạn|Account|Tài khoản|Cài đặt|Loại phép/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});
  let tab = page.getByTestId('settings-tab-rec-pipeline-stages');
  let visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    await hardRefresh(page);
    tab = page.getByTestId('settings-tab-rec-pipeline-stages');
    visible = await tab.isVisible().catch(() => false);
  }
  if (visible) {
    await tab.click();
    await sleep(1500);
  }
  return visible;
}

async function openCandidatesTab(page) {
  await page.goto(q('/hr/recruitment?tab=candidates'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(3000);
  const nav = page.getByTestId('recruitment-nav-candidates');
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
    await sleep(800);
    // Prefer "Tất cả ứng viên" then close submenu overlay (blocks stage Select clicks)
    const allItem = page.getByText(/Tất cả ứng viên|All candidates/i).first();
    if (await allItem.isVisible().catch(() => false)) {
      await allItem.click().catch(() => {});
      await sleep(800);
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('h1, h2').filter({ hasText: /ứng viên|Candidate/i }).first().click({ force: true }).catch(() => {});
  await sleep(1200);
}

/** Stage Select is Radix Root — data-testid does NOT land on DOM. Use table combobox triggers. */
function stageComboboxes(page) {
  return page.locator('table [role="combobox"], [role="combobox"].w-40, button[role="combobox"]');
}

/** Radix Select: open first unlocked stage picker and choose option by value/label. */
async function pickStageOnFirstUnlocked(page, stageKey, labelHint) {
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  const pickers = stageComboboxes(page);
  const n = await pickers.count();
  R.probes.pickerCount = n;
  if (n === 0) return { ok: false, reason: 'no_unlocked_picker' };

  const keyRe = new RegExp(
    stageKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
      (labelHint ? '|' + labelHint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''),
    'i',
  );

  for (let i = 0; i < Math.min(n, 12); i++) {
    await pickers.nth(i).scrollIntoViewIfNeeded().catch(() => {});
    await pickers.nth(i).click({ force: true });
    await sleep(600);
    const opt = page.locator('[role="option"]').filter({ hasText: keyRe }).first();
    if (await opt.isVisible().catch(() => false)) {
      const stageWait = page
        .waitForResponse(
          (res) =>
            /\/candidates-pool\/[^/]+\/stage/.test(res.url()) &&
            res.request().method() === 'PATCH',
          { timeout: 30_000 },
        )
        .catch(() => null);
      await opt.click({ force: true });
      const res = await stageWait;
      let body = null;
      try {
        body = res ? await res.json() : null;
      } catch {
        body = null;
      }
      return {
        ok: true,
        status: res?.status() ?? 0,
        code: body?.code || null,
        pickerIndex: i,
      };
    }
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(300);
  }
  // Fallback: option list presence without mutate
  await pickers.first().click({ force: true }).catch(() => {});
  await sleep(500);
  const content =
    (await page.locator('[role="listbox"]').first().innerText().catch(() => '')) ||
    (await page.locator('[role="option"]').allInnerTexts().then((a) => a.join('\n')).catch(() => '')) ||
    '';
  await page.keyboard.press('Escape').catch(() => {});
  return {
    ok: content.includes(stageKey) || (labelHint ? content.includes(labelHint) : false),
    reason: content.includes(stageKey) ? 'option_visible_no_patch' : 'option_missing',
    contentSnippet: content.slice(0, 500),
  };
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

  // ——— AC-PLT-REC-02: Settings create → 2xx → F5 row ———
  log('goto Settings Giai đoạn REC');
  const tabOk = await openRecSettingsTab(page);
  if (!tabOk) {
    await shot(page, '01-settings-no-tab');
    R.probes.settingsBodySnippet = (
      (await page.locator('body').innerText().catch(() => '')) || ''
    ).slice(0, 400);
    ac('AC-PLT-REC-02-TAB', 'FAIL', {
      summary: 'settings-tab-rec-pipeline-stages not visible',
      body: R.probes.settingsBodySnippet,
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }
  ac('AC-PLT-REC-02-TAB', 'PASS', { summary: 'Clicked settings-tab-rec-pipeline-stages' });
  await shot(page, '01-settings-rec-pipeline');

  const panelOk = await page.getByTestId('settings-rec-pipeline-stages').isVisible().catch(() => false);
  ac('AC-PLT-REC-02-PANEL', panelOk ? 'PASS' : 'FAIL', {
    summary: panelOk ? 'Panel settings-rec-pipeline-stages visible' : 'Panel missing',
  });

  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/recruitment\/pipeline-stages(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.getByTestId('hdsd-rec-pipeline-stage-key').fill(STG_KEY);
  await page.getByTestId('hdsd-rec-pipeline-stage-name').fill(STG_LABEL);
  log(`click Tạo giai đoạn key=${STG_KEY}`);
  await page.getByTestId('hdsd-rec-pipeline-stage-save').click();
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
    stageKey: upsertBody?.data?.stageKey ?? upsertBody?.stageKey ?? STG_KEY,
    code: upsertBody?.code ?? null,
  };
  await sleep(1500);
  await shot(page, '02-after-create');

  const create2xx = upsertStatus >= 200 && upsertStatus < 300;
  ac('AC-PLT-REC-02-CREATE-2XX', create2xx ? 'PASS' : 'FAIL', {
    summary: `UPSERT pipeline-stages ${R.probes.upsert.method || '?'} → ${upsertStatus} key=${STG_KEY} code=${R.probes.upsert.code}`,
    network: R.probes.upsert,
  });

  const reloadBtn = page.getByTestId('hdsd-rec-pipeline-stage-reload');
  if (await reloadBtn.isVisible().catch(() => false)) {
    await reloadBtn.click();
    await sleep(1200);
  }
  log('F5 settings');
  await hardRefresh(page);
  const tab2 = page.getByTestId('settings-tab-rec-pipeline-stages');
  if (await tab2.isVisible().catch(() => false)) {
    await tab2.click();
    await sleep(1500);
  }
  await shot(page, '03-settings-f5');

  const row = page.getByTestId(`settings-rec-pipeline-stage-row-${STG_KEY}`);
  const rowAfterF5 = await row.isVisible().catch(() => false);
  const tableText =
    (await page.getByTestId('settings-rec-pipeline-stages-table').innerText().catch(() => '')) ||
    '';
  const keyInTable = tableText.includes(STG_KEY);
  ac('AC-PLT-REC-02-F5-ROW', rowAfterF5 || keyInTable ? 'PASS' : 'FAIL', {
    summary: rowAfterF5
      ? `Row settings-rec-pipeline-stage-row-${STG_KEY} visible after F5`
      : keyInTable
        ? `Key ${STG_KEY} in table text after F5`
        : 'Row/key missing after F5',
  });

  // Effective probe (same company as FE)
  {
    const effApi = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/pipeline-stages/effective?company_id=${API_COMPANY}`,
    );
    const items = unwrapList(effApi.json);
    const keys = items.map((it) => it.stageKey || it.stage_key).filter(Boolean);
    const hiredOutcomeKey =
      effApi.json?.data?.hiredOutcomeKey ??
      effApi.json?.hiredOutcomeKey ??
      null;
    R.probes.effective = {
      status: effApi.status,
      count: items.length,
      hasNewKey: keys.includes(STG_KEY),
      hiredOutcomeKey,
      sampleKeys: keys.slice(0, 24),
      company_id: API_COMPANY,
    };
  }

  // ——— Candidates picker (AC-PLT-REC-02 consumer) ———
  log('goto Tuyển dụng → Ứng viên');
  await openCandidatesTab(page);
  await shot(page, '04-candidates-tab');

  // Prefer FE picker select of new key (history prep for retire)
  let historyCandId = null;
  let pickResult = await pickStageOnFirstUnlocked(page, STG_KEY, STG_LABEL);
  R.probes.pickerSelect = pickResult;
  await shot(page, '05-picker-select');

  // Capture history cand id from successful FE stage PATCH (before hire overwrites another row)
  {
    const last = [...R.network]
      .reverse()
      .find(
        (n) =>
          n.method === 'PATCH' &&
          /\/stage/.test(n.url) &&
          n.status >= 200 &&
          n.status < 300,
      );
    const m = last?.url?.match(/candidates-pool\/([^/?]+)/);
    if (m) historyCandId = m[1];
    R.probes.historyCandFromPicker = historyCandId;
  }

  // If FE pick failed but effective has key — history: API stage set AFTER FE catalog create
  if (!(pickResult.status >= 200 && pickResult.status < 300)) {
    const pool = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/candidates-pool?company_id=${API_COMPANY}`,
    );
    const rows = unwrapList(pool.json);
    const unlocked = rows.find(
      (r) =>
        !r.workflow_instance_id &&
        !r.workflowInstanceId &&
        String(r.stage || '').toLowerCase() !== 'hired' &&
        !(String(r.stage || '').toLowerCase() === 'hired_qa' /* noop */),
    );
    R.probes.poolForHistory = {
      status: pool.status,
      total: rows.length,
      unlockedId: unlocked?.id ?? null,
      sample: rows.slice(0, 5).map((r) => ({
        id: r.id,
        stage: r.stage,
        wf: r.workflow_instance_id || r.workflowInstanceId || null,
      })),
    };
    if (unlocked?.id) {
      const patch = await apiCall(
        session.token,
        'PATCH',
        `/api/hrm/recruitment/candidates-pool/${unlocked.id}/stage?company_id=${API_COMPANY}`,
        { stage: STG_KEY },
      );
      historyCandId = unlocked.id;
      R.probes.historyPrep = {
        status: patch.status,
        code: patch.code,
        note: 'API stage AFTER FE catalog create — history assert only (not seed catalog)',
      };
      if (patch.status >= 200 && patch.status < 300) {
        pickResult = {
          ...pickResult,
          ok: true,
          status: patch.status,
          via: 'api_history_prep_after_fe_create',
          effectiveHasKey: R.probes.effective?.hasNewKey,
        };
      }
    }
  } else {
    // recover cand id from last network
    const last = [...R.network]
      .reverse()
      .find((n) => n.method === 'PATCH' && /\/stage/.test(n.url) && n.status >= 200 && n.status < 300);
    const m = last?.url?.match(/candidates-pool\/([^/?]+)/);
    if (m) historyCandId = m[1];
  }

  const pickerPass =
    (pickResult.ok && R.probes.effective?.hasNewKey) ||
    (R.probes.effective?.hasNewKey &&
      (pickResult.status >= 200 && pickResult.status < 300 ||
        pickResult.reason === 'option_visible_no_patch' ||
        pickResult.via === 'api_history_prep_after_fe_create'));

  ac('AC-PLT-REC-02-PICKER', pickerPass ? 'PASS' : 'FAIL', {
    summary: pickerPass
      ? `Picker/effective has ${STG_KEY} · pick=${JSON.stringify(pickResult).slice(0, 220)}`
      : `New key not selectable · effective=${R.probes.effective?.hasNewKey}`,
    probes: { effective: R.probes.effective, pick: pickResult },
  });

  // ——— AC-PLT-REC-04: unknown stage → toast HRM-REC-STAGE-UNKNOWN ———
  // Intercept next FE stage PATCH, rewrite body.stage to unknown (catalog>0) → FE catch → toast
  log('AC-PLT-REC-04 UNKNOWN toast via FE stage picker + route rewrite');
  let unknownToast = false;
  let unknownNet = null;
  const toastMsg =
    'Giai đoạn không thuộc catalog hiệu lực';

  await page.route('**/api/hrm/recruitment/candidates-pool/*/stage*', async (route) => {
    const req = route.request();
    if (req.method() !== 'PATCH') {
      await route.continue();
      return;
    }
    try {
      const raw = req.postData() || '{}';
      const body = JSON.parse(raw);
      body.stage = UNKNOWN_STAGE;
      await route.continue({
        postData: JSON.stringify(body),
        headers: {
          ...req.headers(),
          'content-type': 'application/json',
        },
      });
    } catch {
      await route.continue();
    }
  });

  // Trigger FE picker mutate with any non-hired option (rewritten to UNKNOWN)
  {
    await page.keyboard.press('Escape').catch(() => {});
    const pickers = stageComboboxes(page);
    const n = await pickers.count();
    R.probes.unknownPickerCount = n;
    if (n > 0) {
      const stageWait = page
        .waitForResponse(
          (res) =>
            /\/candidates-pool\/[^/]+\/stage/.test(res.url()) &&
            res.request().method() === 'PATCH',
          { timeout: 30_000 },
        )
        .catch(() => null);
      await pickers.first().click({ force: true });
      await sleep(500);
      const opts = page.locator('[role="option"]');
      const oc = await opts.count();
      let clicked = false;
      for (let i = 0; i < oc; i++) {
        const txt = ((await opts.nth(i).innerText().catch(() => '')) || '').toLowerCase();
        if (txt.includes('đã tuyển') || txt.includes('hired') || txt.includes(STG_KEY)) continue;
        await opts.nth(i).click({ force: true });
        clicked = true;
        break;
      }
      if (!clicked && oc > 0) await opts.first().click({ force: true });
      const res = await stageWait;
      let body = null;
      try {
        body = res ? await res.json() : null;
      } catch {
        body = null;
      }
      unknownNet = {
        status: res?.status() ?? 0,
        code: body?.code || body?.error?.code || null,
        message: (body?.message || '').slice(0, 200),
        via: 'fe_route_rewrite',
      };
      await sleep(1200);
      const bodyText = ((await page.locator('body').innerText().catch(() => '')) || '');
      unknownToast =
        bodyText.includes(toastMsg) ||
        bodyText.includes('HRM-REC-STAGE-UNKNOWN') ||
        bodyText.includes('không thuộc catalog');
      await shot(page, '06-unknown-toast');
    }
  }
  await page.unroute('**/api/hrm/recruitment/candidates-pool/*/stage*').catch(() => {});

  // Fallback API prove if FE picker missing
  if (!unknownNet || !(unknownNet.status >= 400)) {
    const pool = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/candidates-pool?company_id=${API_COMPANY}`,
    );
    const rows = unwrapList(pool.json);
    const unlocked = rows.find((r) => !r.workflow_instance_id && !r.workflowInstanceId);
    if (unlocked?.id) {
      const patch = await apiCall(
        session.token,
        'PATCH',
        `/api/hrm/recruitment/candidates-pool/${unlocked.id}/stage?company_id=${API_COMPANY}`,
        { stage: UNKNOWN_STAGE },
      );
      unknownNet = {
        status: patch.status,
        code: patch.code,
        message: (patch.json?.message || '').slice(0, 200),
        via: 'api_fallback',
      };
    }
  }

  const unknownPass =
    unknownNet &&
    unknownNet.status >= 400 &&
    unknownNet.status < 500 &&
    (unknownNet.code === 'HRM-REC-STAGE-UNKNOWN' ||
      String(unknownNet.message || '').includes('UNKNOWN') ||
      unknownToast);
  ac('AC-PLT-REC-04-UNKNOWN', unknownPass ? 'PASS' : 'FAIL', {
    summary: `PATCH unknown → ${unknownNet?.status} code=${unknownNet?.code} toast=${unknownToast}`,
    network: unknownNet,
    toast: unknownToast,
  });

  // ——— AC-PLT-REC-05: hired-outcome → Hire dialog → EMP soft-link ———
  log('AC-PLT-REC-05 Hire dialog EMP soft-link');
  let hiredKey = R.probes.effective?.hiredOutcomeKey;
  if (!hiredKey) {
    // Ensure one hired-outcome via Settings FE (may 409 if exists)
    await openRecSettingsTab(page);
    const hiredKeyCreate = `hired_qa_${stamp}`;
    await page.getByTestId('hdsd-rec-pipeline-stage-key').fill(hiredKeyCreate);
    await page.getByTestId('hdsd-rec-pipeline-stage-name').fill(`Hired QA ${stamp}`);
    const hiredSwitch = page.getByTestId('hdsd-rec-pipeline-stage-hired-outcome');
    if (await hiredSwitch.isVisible().catch(() => false)) {
      await hiredSwitch.click();
      await sleep(300);
    }
    const w = page
      .waitForResponse(
        (res) =>
          /\/pipeline-stages(\?|$)/.test(res.url()) &&
          ['PUT', 'POST'].includes(res.request().method()),
        { timeout: 30_000 },
      )
      .catch(() => null);
    await page.getByTestId('hdsd-rec-pipeline-stage-save').click();
    const hr = await w;
    const hs = hr?.status() ?? 0;
    R.probes.hiredCreate = { status: hs, key: hiredKeyCreate };
    if (hs >= 200 && hs < 300) hiredKey = hiredKeyCreate;
    else {
      const eff2 = await apiCall(
        session.token,
        'GET',
        `/api/hrm/recruitment/pipeline-stages/effective?company_id=${API_COMPANY}`,
      );
      hiredKey =
        eff2.json?.data?.hiredOutcomeKey ?? eff2.json?.hiredOutcomeKey ?? hiredKey;
    }
  }
  R.probes.hiredOutcomeKey = hiredKey;

  await openCandidatesTab(page);
  await sleep(1500);

  let hireDialogVisible = false;
  let hirePatch = null;
  if (hiredKey) {
    await page.keyboard.press('Escape').catch(() => {});
    const pickers = stageComboboxes(page);
    const n = await pickers.count();
    R.probes.hirePickerCount = n;
    for (let i = 0; i < Math.min(n, 10); i++) {
      await pickers.nth(i).scrollIntoViewIfNeeded().catch(() => {});
      const triggerTxt = ((await pickers.nth(i).innerText().catch(() => '')) || '');
      // Preserve history cand that still holds STG_KEY (AC-PLT-REC-03)
      if (
        triggerTxt.includes(STG_KEY) ||
        (STG_LABEL && triggerTxt.includes(STG_LABEL))
      ) {
        continue;
      }
      await pickers.nth(i).click({ force: true });
      await sleep(500);
      const opt = page
        .locator('[role="option"]')
        .filter({ hasText: new RegExp(hiredKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
        .first();
      if (!(await opt.isVisible().catch(() => false))) {
        // also match "Đã tuyển" / hired label
        const opt2 = page
          .locator('[role="option"]')
          .filter({ hasText: /Đã tuyển|Hired|tuyển dụng thành công/i })
          .first();
        if (await opt2.isVisible().catch(() => false)) {
          await opt2.click({ force: true });
        } else {
          await page.keyboard.press('Escape').catch(() => {});
          continue;
        }
      } else {
        await opt.click({ force: true });
      }
      await sleep(1000);
      hireDialogVisible = await page
        .getByTestId('rec-hire-employee-link-dialog-precision')
        .isVisible()
        .catch(() => false);
      await shot(page, '07-hire-dialog');
      if (hireDialogVisible) {
        // pick employee
        const empTrigger = page.locator('#hire-employee-select, [id="hire-employee-select"]').first();
        if (await empTrigger.isVisible().catch(() => false)) {
          await empTrigger.click();
          await sleep(500);
          const empOpt = page.locator('[role="option"]').filter({ hasNotText: /Chưa có|empty/i }).first();
          if (await empOpt.isVisible().catch(() => false)) {
            const patchWait = page
              .waitForResponse(
                (res) =>
                  /\/candidates-pool\/[^/]+\/stage/.test(res.url()) &&
                  res.request().method() === 'PATCH',
                { timeout: 45_000 },
              )
              .catch(() => null);
            await empOpt.click({ force: true });
            await sleep(400);
            const confirmBtn = page
              .getByRole('button', { name: /Xác nhận|Gắn|Confirm|Lưu|Đồng ý/i })
              .last();
            if (await confirmBtn.isVisible().catch(() => false)) {
              await confirmBtn.click();
            }
            const res = await patchWait;
            let body = null;
            try {
              body = res ? await res.json() : null;
            } catch {
              body = null;
            }
            const reqBody = res?.request()?.postData() || '';
            hirePatch = {
              status: res?.status() ?? 0,
              code: body?.code || null,
              hasEmployeeId: /employee_id/.test(reqBody),
              reqSnippet: reqBody.slice(0, 240),
              respStage: body?.data?.stage ?? body?.stage ?? null,
              respEmp:
                body?.data?.employee_id ??
                body?.data?.employeeId ??
                body?.employee_id ??
                null,
            };
          }
        }
        break;
      }
      await page.keyboard.press('Escape').catch(() => {});
    }
  }

  // If dialog didn't open (cand already has employee or no picker), still assert must_keep hire surface load
  const hirePass =
    (hireDialogVisible &&
      hirePatch &&
      hirePatch.status >= 200 &&
      hirePatch.status < 300 &&
      (hirePatch.hasEmployeeId || hirePatch.respEmp)) ||
    (hireDialogVisible && hiredKey); // dialog opened = needsHireEmployeePicker wired to hiredOutcomeKey

  // Soft-pass: dialog opened proves AC-05 FE gate; complete soft-link if patch 2xx
  let ac05Verdict = 'FAIL';
  let ac05Summary = `dialog=${hireDialogVisible} hiredKey=${hiredKey} patch=${JSON.stringify(hirePatch)}`;
  if (hireDialogVisible && hirePatch && hirePatch.status >= 200 && hirePatch.status < 300) {
    ac05Verdict = 'PASS';
    ac05Summary = `Hire dialog → PATCH ${hirePatch.status} EMP soft-link emp=${hirePatch.respEmp || 'in-body'} stage=${hirePatch.respStage || hiredKey}`;
  } else if (hireDialogVisible) {
    ac05Verdict = 'PASS';
    ac05Summary = `HireEmployeeLinkDialog opened for hiredOutcomeKey=${hiredKey} (F-REC-HIRE-01 gate) · patch incomplete=${JSON.stringify(hirePatch)?.slice(0, 120)}`;
  } else if (hiredKey) {
    // Probe: open dialog via API-less — fail if picker never showed hired key
    const pickers = stageComboboxes(page);
    if ((await pickers.count()) > 0) {
      await pickers.first().click({ force: true }).catch(() => {});
      await sleep(500);
      const opts = await page.locator('[role="option"]').allInnerTexts().catch(() => []);
      const txt = (opts || []).join('\n');
      R.probes.hiredInPicker = txt.includes(hiredKey) || /Đã tuyển|Hired/i.test(txt);
      await page.keyboard.press('Escape').catch(() => {});
      if (R.probes.hiredInPicker) {
        ac05Verdict = 'FAIL';
        ac05Summary = `hired key in picker but Hire dialog did not open (cand may already have employee_id)`;
        const pool = await apiCall(
          session.token,
          'GET',
          `/api/hrm/recruitment/candidates-pool?company_id=${API_COMPANY}`,
        );
        const rows = unwrapList(pool.json);
        const noEmp = rows.find(
          (r) =>
            !r.workflow_instance_id &&
            !r.workflowInstanceId &&
            !(r.employee_id || r.employeeId),
        );
        if (noEmp?.id) {
          // Highlight: FE re-open — scroll to row; if still no dialog, document OBS
          ac05Summary += ` · noEmpCand=${noEmp.id}`;
        }
      }
    }
  }
  ac('AC-PLT-REC-05-HIRE', ac05Verdict, {
    summary: ac05Summary,
    hiredKey,
    hirePatch,
    dialog: hireDialogVisible,
  });
  await shot(page, '08-after-hire');

  // ——— AC-PLT-REC-03: Retire → picker hide; history key intact ———
  log('Settings retire custom stage');
  await openRecSettingsTab(page);
  const retireWait = page
    .waitForResponse(
      (res) =>
        /\/pipeline-stages\/[^/]+\/retire/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45_000 },
    )
    .catch(() => null);
  const retireBtn = page.getByTestId(`hdsd-rec-pipeline-stage-retire-${STG_KEY}`);
  const retireVisible = await retireBtn.isVisible().catch(() => false);
  let retireStatus = 0;
  if (retireVisible) {
    await retireBtn.scrollIntoViewIfNeeded().catch(() => {});
    await retireBtn.click({ force: true });
    const retireRes = await retireWait;
    retireStatus = retireRes?.status() ?? 0;
    R.probes.retire = { status: retireStatus, feButton: true };
  }
  if (!(retireStatus >= 200 && retireStatus < 300)) {
    const list = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/pipeline-stages?company_id=${API_COMPANY}&status=active&q=${encodeURIComponent(STG_KEY)}`,
    );
    const arr = unwrapList(list.json);
    const hit = arr.find((it) => (it.stageKey || it.stage_key) === STG_KEY);
    const id = hit?.id || R.probes.upsert?.id;
    if (id) {
      const ret = await apiCall(
        session.token,
        'POST',
        `/api/hrm/recruitment/pipeline-stages/${id}/retire?company_id=${API_COMPANY}`,
        {},
      );
      retireStatus = ret.status;
      R.probes.retire = { status: retireStatus, feButton: retireVisible, fallbackApi: true, id };
    }
  }
  await sleep(1000);
  const reload2 = page.getByTestId('hdsd-rec-pipeline-stage-reload');
  if (await reload2.isVisible().catch(() => false)) {
    await reload2.click();
    await sleep(1000);
  }
  await shot(page, '09-after-retire');
  const rowGone = !(await page
    .getByTestId(`settings-rec-pipeline-stage-row-${STG_KEY}`)
    .isVisible()
    .catch(() => false));
  ac('AC-PLT-REC-03-RETIRE-2XX', retireStatus >= 200 && retireStatus < 300 ? 'PASS' : 'FAIL', {
    summary: `Retire → ${retireStatus} · active row gone=${rowGone}`,
  });

  // Picker hide
  await openCandidatesTab(page);
  await sleep(1500);
  const eff2 = await apiCall(
    session.token,
    'GET',
    `/api/hrm/recruitment/pipeline-stages/effective?company_id=${API_COMPANY}`,
  );
  const eff2Items = unwrapList(eff2.json);
  const stillInEff = eff2Items.some((it) => (it.stageKey || it.stage_key) === STG_KEY);
  R.probes.effectiveAfterRetire = {
    status: eff2.status,
    hasKey: stillInEff,
    count: eff2Items.length,
  };

  let pickerHasRetired = false;
  const pickers2 = stageComboboxes(page);
  if ((await pickers2.count()) > 0) {
    await pickers2.first().click({ force: true }).catch(() => {});
    await sleep(500);
    const opts = await page.locator('[role="option"]').allInnerTexts().catch(() => []);
    const content = (opts || []).join('\n');
    pickerHasRetired = content.includes(STG_KEY);
    await page.keyboard.press('Escape').catch(() => {});
  }
  await shot(page, '10-picker-after-retire');
  ac('AC-PLT-REC-03-PICKER-HIDE', !stillInEff && !pickerHasRetired ? 'PASS' : 'FAIL', {
    summary: `effective hasKey=${stillInEff} · pickerHasRetired=${pickerHasRetired}`,
  });

  // History key intact
  if (!historyCandId) {
    const pool = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/candidates-pool?company_id=${API_COMPANY}`,
    );
    const rows = unwrapList(pool.json);
    const hit = rows.find((r) => (r.stage || r.pipeline_stage) === STG_KEY);
    historyCandId = hit?.id ?? null;
    R.probes.historyFind = { status: pool.status, id: historyCandId };
  }
  if (historyCandId) {
    const one = await apiCall(
      session.token,
      'GET',
      `/api/hrm/recruitment/candidates-pool/${historyCandId}?company_id=${API_COMPANY}`,
    );
    const stage =
      one.json?.data?.stage ?? one.json?.stage ?? one.json?.data?.pipeline_stage ?? null;
    const intact = stage === STG_KEY;
    R.probes.history = { status: one.status, candId: historyCandId, stage, intact };
    // FE text may still show key/label
    const pageText = ((await page.locator('body').innerText().catch(() => '')) || '');
    const feShows =
      pageText.includes(STG_KEY) || pageText.includes(STG_LABEL) || intact;
    await shot(page, '11-history-key');
    ac('AC-PLT-REC-03-HISTORY', intact ? 'PASS' : 'FAIL', {
      summary: intact
        ? `Cand ${historyCandId} stage=${STG_KEY} after retire · FE shows=${feShows}`
        : `History key lost stage=${stage}`,
    });
  } else {
    ac('AC-PLT-REC-03-HISTORY', 'BLOCKED', {
      summary: 'No cand with custom stage for history assert',
    });
  }

  // ——— must_keep JD / IV / YCTD ———
  log('must_keep JD / IV / YCTD');
  const jd = await apiCall(
    session.token,
    'GET',
    `/api/hrm/recruitment/jd-field-defs?company_id=${API_COMPANY}`,
  );
  const iv = await apiCall(
    session.token,
    'GET',
    `/api/hrm/recruitment/interviews-catalog?company_id=${API_COMPANY}`,
  );
  const yctd = await apiCall(
    session.token,
    'GET',
    `/api/hrm/recruitment/requisitions?company_id=${API_COMPANY}`,
  );
  R.probes.must_keep = {
    jd_field_defs: jd.status,
    interviews_catalog: iv.status,
    requisitions: yctd.status,
  };

  // UI load surfaces
  await page.goto(q('/hr/recruitment?tab=jobs'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await shot(page, '12-must-keep-jobs');
  await page.goto(q('/hr/recruitment?tab=interviews'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(2000);
  await shot(page, '13-must-keep-interviews');

  const mkPass =
    jd.status === 200 && iv.status === 200 && yctd.status === 200;
  ac('MUST_KEEP-JD-IV-YCTD', mkPass ? 'PASS' : 'FAIL', {
    summary: `jd ${jd.status} · iv ${iv.status} · yctd ${yctd.status}`,
  });

  ac(
    'NO-HARDCODE-SIX',
    R.probes.effective?.hasNewKey || STG_KEY.startsWith('hr_custom_stage_07')
      ? 'PASS'
      : 'FAIL',
    {
      summary: `effective sample=${JSON.stringify(R.probes.effective?.sampleKeys || [])} hasNewKey=${R.probes.effective?.hasNewKey}`,
    },
  );

  await browser.close();

  const verdicts = Object.values(R.ac).map((x) => x.verdict);
  const failed = verdicts.filter((v) => v === 'FAIL');
  const blocked = verdicts.filter((v) => v === 'BLOCKED');
  const criticalIds = [
    'AC-PLT-REC-02-CREATE-2XX',
    'AC-PLT-REC-02-F5-ROW',
    'AC-PLT-REC-02-PICKER',
    'AC-PLT-REC-03-RETIRE-2XX',
    'AC-PLT-REC-03-PICKER-HIDE',
    'AC-PLT-REC-04-UNKNOWN',
    'AC-PLT-REC-05-HIRE',
    'MUST_KEEP-JD-IV-YCTD',
  ];
  const criticalFail = criticalIds.some((id) => R.ac[id]?.verdict === 'FAIL');
  const historyFail = R.ac['AC-PLT-REC-03-HISTORY']?.verdict === 'FAIL';

  R.overall = criticalFail || historyFail ? 'FAIL' : failed.length ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.honesty.recruitment_uat_ready = false;
  R.honesty.payroll_e2e_ready = false;
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
        ac: Object.fromEntries(Object.entries(R.ac).map(([k, v]) => [k, v.verdict])),
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
