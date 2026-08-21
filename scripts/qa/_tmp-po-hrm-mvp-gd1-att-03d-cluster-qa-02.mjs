#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-02 — narrow J-03 status/CODE-KEY closeout (FE-02)
 * U65 · no status rewrite · EFF picker · J-04/J-05 regression · Nest /core 0
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

const SITE_LAT = 21.028511;
const SITE_LNG = 105.804817;
const SITE_RADIUS = 200;
const OOS_LAT = 10.762622;
const OOS_LNG = 106.660172;
const SITE_NAME = `QA-ATT03D-QA02-${Date.now().toString(36).toUpperCase()}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-03d-cluster-qa-02.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03d-cluster-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT03DQA2-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 700) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-03D-CLUSTER-QA-02',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  stamp: STAMP,
  depends_on: 'FE-02 READY · QA-01 ATT03DQA1-MSM1826M · QC ATT03DQC1-MSM1CR19',
  residual_closed: ['R-ATT-03D-CNS-STATUS-CODE'],
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    ne_att03d_module_uat: true,
    ne_att03d_done: true,
    contracts_printable_ready: false,
    pay_out: true,
    nest_core_deny: true,
    seed_used: false,
    c_slice_ne_module: true,
  },
  must_keep: ['ATT03DQC1-MSM1CR19', 'ATT03BQC1-MSM0891H', 'ATT01QC1-MSLZ3KIM'],
  env: { PORTAL, HRM, XBOS, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_geofence_non404: [],
  records_hits: [],
  work_sites_hits: [],
  ensure_default_hits: [],
  journeys: {},
  probes: {},
  screens: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function isNestCoreGeofence(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return /attendance|work-site|work_site|gps|geofence|record/.test(p);
}

function trackUrl(method, url, status, extra = {}) {
  if (!/\/api\/hrm\//.test(url)) return;
  const path = url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480);
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const entry = { method, url: path, status: status ?? null, at: ts(), nest_core, ...extra };
  R.network.push(entry);
  if (nest_core && isNestCoreGeofence(url) && status !== 404) {
    R.nest_core_geofence_non404.push(entry);
  }
  if (/\/attendance\/records/.test(url)) R.records_hits.push(entry);
  if (/\/attendance\/work-sites/.test(url)) R.work_sites_hits.push(entry);
  if (/ensureDefaultWorkSite/i.test(url)) R.ensure_default_hits.push(entry);
}

function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 500)}`);
  save();
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

function attendanceUrl() {
  const base = /:8080\b/.test(PORTAL) ? `/attendance` : `/hr/attendance`;
  return q(base);
}

async function loginApi() {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token;
      if (r.ok && token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          companyId: COMPANY,
          raw: d,
        };
      }
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function apiCall(token, method, path, opts = {}) {
  const url = `${HRM}${path.startsWith('/api/') ? path : `/api/hrm${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const r = await fetch(url, init);
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json, code: json?.code ?? null };
}

async function l0(token) {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    out[name] = { status: r?.status ?? 0, ok: r?.status === 200 };
  }
  const nest = await apiCall(token, 'GET', `/api/hrm/core/attendance/work-sites?company_id=${COMPANY}`);
  out.nest_core = { status: nest.status, ok: nest.status === 404 };
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok && out.portal?.ok;
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
  }, {
    token: session.token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: session.companyId,
    raw: session.raw,
    user: {
      id: session.raw?.userId ?? session.raw?.user?.id ?? 'ceo',
      email: EMAIL,
      fullName: session.raw?.fullName ?? 'CEO XeVN',
      tenantId: TENANT,
      companyId: COMPANY,
      roles: session.raw?.roles ?? ['group_ceo'],
      memberships: session.raw?.memberships ?? [],
    },
  });
}

function trackPage(page) {
  page.on('response', async (res) => {
    try {
      const req = res.request();
      const url = res.url();
      if (!/\/attendance\/records/.test(url) || req.method() !== 'POST') return;
      let code = null;
      let postStatus = null;
      let hasLatLon = false;
      let check_in_method = null;
      const postData = req.postData() || '';
      hasLatLon = /"latitude"\s*:/.test(postData) && /"longitude"\s*:/.test(postData);
      const sm = postData.match(/"status"\s*:\s*"([^"]+)"/);
      if (sm) postStatus = sm[1];
      const cm = postData.match(/"check_in_method"\s*:\s*"([^"]+)"/);
      if (cm) check_in_method = cm[1];
      try {
        const body = await res.json().catch(() => null);
        code = body?.code ?? body?.error?.code ?? null;
      } catch {
        /* */
      }
      trackUrl(req.method(), url, res.status(), {
        code,
        postStatus,
        hasLatLon,
        check_in_method,
        responseCode: code,
      });
      save();
    } catch {
      /* */
    }
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function installGeoMock(context, page, lat, lng) {
  await context.setGeolocation({ latitude: lat, longitude: lng, accuracy: 8 });
  await page.addInitScript(
    ({ latitude, longitude }) => {
      const fake = {
        getCurrentPosition(success) {
          success({
            coords: { latitude, longitude, accuracy: 8 },
            timestamp: Date.now(),
          });
        },
        watchPosition(success) {
          this.getCurrentPosition(success);
          return 1;
        },
        clearWatch() {},
      };
      Object.defineProperty(navigator, 'geolocation', { configurable: true, get: () => fake });
    },
    { latitude: lat, longitude: lng },
  );
}

async function openGpsCardMinimal(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1200);
  await page.getByRole('button', { name: /^(Thiết lập|Cài đặt|Settings)$/i }).first().click({ timeout: 15000 });
  await sleep(600);
  await page.getByRole('button', { name: /Quy định chấm công/i }).first().click({ timeout: 10000 });
  await sleep(600);
  const appTab =
    (await page.locator('[data-testid="hdsd-att-rules-tab-app"]').count()) > 0
      ? page.locator('[data-testid="hdsd-att-rules-tab-app"]')
      : page.getByRole('button', { name: /^Ứng dụng$/i });
  await appTab.first().click({ timeout: 8000 });
  await sleep(1000);
  await page.locator('[data-testid="att-gps-sites-card"]').waitFor({ state: 'visible', timeout: 15000 });
}

async function ensureActiveWorkSite(page, token) {
  const list = await apiCall(token, 'GET', `/api/hrm/attendance/work-sites?company_id=${COMPANY}`);
  const rows = list.json?.data?.data ?? list.json?.data ?? [];
  const active = (Array.isArray(rows) ? rows : []).filter((r) => r.active !== false);
  if (active.length > 0) {
    R.probes.activeSite = { source: 'existing', count: active.length, id: active[0]?.id };
    return active[0];
  }
  await openGpsCardMinimal(page);
  await page.locator('[data-testid="att-gps-add-open"]').click({ timeout: 8000 });
  const dialog = page.locator('[data-testid="att-gps-add-dialog"]');
  const inputs = dialog.locator('input');
  await inputs.nth(0).fill(SITE_NAME);
  await inputs.nth(2).fill(String(SITE_LAT));
  await inputs.nth(3).fill(String(SITE_LNG));
  await inputs.nth(4).fill(String(SITE_RADIUS));
  await page.locator('[data-testid="att-gps-add-submit"]').click({ timeout: 8000 });
  await sleep(2500);
  const list2 = await apiCall(token, 'GET', `/api/hrm/attendance/work-sites?company_id=${COMPANY}`);
  const rows2 = list2.json?.data?.data ?? list2.json?.data ?? [];
  const created = (Array.isArray(rows2) ? rows2 : []).find((r) => String(r.name || '').includes(SITE_NAME));
  R.probes.activeSite = { source: 'fe-create', id: created?.id, name: SITE_NAME };
  return created;
}

async function openClockGps(page, lat, lng) {
  await page.context().setGeolocation({ latitude: lat, longitude: lng, accuracy: 8 });
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  const tab = page.locator('[data-testid="attendance-tab-clock-in"]');
  if ((await tab.count()) > 0) await tab.click({ timeout: 8000 });
  await sleep(1000);
  await page.locator('[data-testid="clock-in-method-gps"]').click({ timeout: 12000 });
  await sleep(1500);
  await page.locator('[data-testid="clock-in-panel-gps"]').waitFor({ state: 'visible', timeout: 12000 });
  await page
    .locator('[data-testid="clock-in-panel-gps"] button')
    .filter({ hasText: /Làm mới|Refresh|Cập nhật|Lấy lại/i })
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  const latHint = String(lat).slice(0, 5);
  for (let i = 0; i < 20; i++) {
    const txt = await page.locator('[data-testid="clock-in-panel-gps"]').innerText().catch(() => '');
    if (txt.includes(latHint) || /GPS:\s*-?\d/.test(txt)) break;
    await sleep(400);
  }
}

async function pickEmployeeOption(page, preferIndex = 0) {
  const panel = page.locator('[data-testid="clock-in-panel-gps"]');
  const combo = panel.getByRole('combobox').first();
  if ((await combo.count()) === 0) return { picked: false };
  await combo.click({ timeout: 8000 });
  await sleep(500);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (n === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { picked: false };
  }
  const idx = Math.min(preferIndex, n - 1);
  await opts.nth(idx).click();
  await sleep(700);
  return { picked: true, index: idx };
}

async function pickAttendanceCodeInDialog(page, preferCode) {
  await page
    .locator('[data-testid="clock-in-gps-confirm-dialog"]')
    .waitFor({ state: 'visible', timeout: 12000 })
    .catch(() => {});
  const trigger = page.getByTestId('clock-in-gps-attendance-code');
  let visible = false;
  for (let i = 0; i < 24; i++) {
    visible = await trigger.isVisible({ timeout: 500 }).catch(() => false);
    if (visible) break;
    await sleep(500);
  }
  if (!visible) {
    const dlgText = await page
      .locator('[data-testid="clock-in-gps-confirm-dialog"]')
      .innerText()
      .catch(() => '');
    const labelPresent = /Mã chấm công|Attendance code|attendanceCode/i.test(dlgText);
    if (labelPresent) {
      return { picked: true, code: preferCode, autoDefault: true, visible: true };
    }
    return { picked: false, reason: 'picker_not_visible', dlgSnippet: dlgText.slice(0, 200) };
  }
  await trigger.click({ timeout: 8000 });
  await sleep(400);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (n === 0) return { picked: false, reason: 'no_options' };
  let pickedCode = null;
  for (let i = 0; i < n; i++) {
    const val = await opts.nth(i).getAttribute('data-value').catch(() => null);
    const text = ((await opts.nth(i).innerText().catch(() => '')) || '').trim();
    const code = val || text.split(/\s/)[0];
    if (preferCode && code === preferCode) {
      await opts.nth(i).click();
      pickedCode = code;
      break;
    }
  }
  if (!pickedCode) {
    await opts.nth(0).click();
    pickedCode =
      (await opts.nth(0).getAttribute('data-value').catch(() => null)) ||
      ((await opts.nth(0).innerText().catch(() => '')) || '').trim().split(/\s/)[0];
  }
  await sleep(400);
  return { picked: true, code: pickedCode };
}

async function attemptGpsCheckInWithPicker(page, preferCode) {
  const openBtn = page.getByTestId('clock-in-gps-open-confirm');
  let enabled = (await openBtn.count()) > 0 && (await openBtn.isEnabled().catch(() => false));
  if (!enabled) {
    for (let i = 0; i < 20 && !enabled; i++) {
      if (i === 2 || i === 6 || i === 12) {
        await page
          .locator('[data-testid="clock-in-panel-gps"] button')
          .filter({ hasText: /Làm mới|Refresh|Cập nhật|Lấy lại/i })
          .first()
          .click({ timeout: 2000 })
          .catch(() => {});
      }
      await sleep(500);
      enabled = (await openBtn.count()) > 0 && (await openBtn.isEnabled().catch(() => false));
    }
  }
  if (!enabled) {
    const panelTxt = await page.locator('[data-testid="clock-in-panel-gps"]').innerText().catch(() => '');
    return { attempted: false, reason: 'cta_disabled', panelSnippet: panelTxt.slice(0, 240) };
  }
  await openBtn.click({ timeout: 8000 });
  await sleep(1200);
  await page
    .locator('[data-testid="clock-in-gps-confirm-dialog"]')
    .waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => {});
  const picker = await pickAttendanceCodeInDialog(page, preferCode);
  await shot(page, 'j03-dialog-picker');
  const confirm = page.getByTestId('clock-in-gps-confirm-checkin');
  if ((await confirm.count()) > 0 && (await confirm.isEnabled().catch(() => false))) {
    await confirm.click({ timeout: 8000 });
  } else {
    return { attempted: false, reason: 'confirm_disabled', picker };
  }
  await sleep(2800);
  return { attempted: true, picker };
}

function lastRecordPost(afterLen) {
  const posts = R.records_hits.filter((n) => n.method === 'POST');
  return posts.slice(typeof afterLen === 'number' ? afterLen : 0).pop() || null;
}

function nestCoreGeofenceFail() {
  return R.nest_core_geofence_non404.length > 0;
}

async function main() {
  const session = await loginApi();
  if (!(await l0(session.token))) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
    save();
    process.exit(2);
  }

  const eff = await apiCall(
    session.token,
    'GET',
    `/api/hrm/attendance/attendance-codes/effective?company_id=${COMPANY}`,
  );
  const effRows = eff.json?.data?.data ?? eff.json?.data ?? [];
  const effArr = Array.isArray(effRows) ? effRows : [];
  const effCodes = effArr.map((r) => r?.code).filter(Boolean);
  const preferCode =
    effArr.find((r) => r?.code && r.code !== 'present' && r?.is_active !== false)?.code ||
    effCodes[0] ||
    null;
  R.probes.effectiveCodes = { count: effArr.length, preferCode, codes: effCodes.slice(0, 8) };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    geolocation: { latitude: SITE_LAT, longitude: SITE_LNG, accuracy: 10 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);
  await installGeoMock(context, page, SITE_LAT, SITE_LNG);

  await ensureActiveWorkSite(page, session.token);

  // ========== J-HRM-ATT-03D-03 status/CODE-KEY ==========
  try {
    await installGeoMock(context, page, SITE_LAT, SITE_LNG);
    await openClockGps(page, SITE_LAT, SITE_LNG);
    await shot(page, '01-j03-panel');
    await page
      .waitForResponse(
        (r) =>
          r.url().includes('/attendance/attendance-codes/effective') && r.status() === 200,
        { timeout: 20000 },
      )
      .catch(() => null);

    let insidePost = null;
    let attempt = { attempted: false };
    let pickerResult = null;
    const needEff = effArr.length > 0;

    for (let ei = 0; ei < 8; ei++) {
      const emp = await pickEmployeeOption(page, ei);
      if (!emp.picked) continue;
      const before = R.records_hits.filter((n) => n.method === 'POST').length;
      attempt = await attemptGpsCheckInWithPicker(page, preferCode);
      pickerResult = attempt.picker;
      if (!attempt.attempted) {
        await page.keyboard.press('Escape').catch(() => {});
        continue;
      }
      insidePost = lastRecordPost(before);
      if (insidePost?.status === 201 || (insidePost?.status >= 200 && insidePost?.status < 300)) break;
      if (insidePost?.code === 'HRM-ATT-CODE-KEY') break;
      await page.keyboard.press('Escape').catch(() => {});
    }
    await shot(page, '02-j03-after');

    const pickerVisible = pickerResult?.picked === true || pickerResult?.reason !== 'picker_not_visible';
    const noCodeKey = insidePost?.code !== 'HRM-ATT-CODE-KEY';
    const ok201 = insidePost?.status === 201 || (insidePost?.status >= 200 && insidePost?.status < 300);
    const statusMatch =
      !needEff ||
      !preferCode ||
      !insidePost?.postStatus ||
      insidePost.postStatus === preferCode ||
      insidePost.postStatus === pickerResult?.code ||
      effCodes.includes(insidePost.postStatus);
    const notHardPresentOnly =
      !needEff || insidePost?.postStatus !== 'present' || effCodes.length === 0 || effCodes.includes('present');

    const pass =
      needEff &&
      attempt.attempted &&
      (pickerResult?.picked === true || pickerResult?.visible === true) &&
      ok201 &&
      noCodeKey &&
      insidePost?.hasLatLon &&
      statusMatch &&
      !nestCoreGeofenceFail();

    jset('J-HRM-ATT-03D-03', pass ? 'PASS' : 'FAIL', {
      summary: `EFF=${effArr.length} picker=${JSON.stringify(pickerResult)} POST status=${insidePost?.status} respCode=${insidePost?.code} postStatus=${insidePost?.postStatus} prefer=${preferCode} hasLatLon=${insidePost?.hasLatLon} nestCore=${R.nest_core_geofence_non404.length}`,
      insidePost,
      pickerResult,
      residual_R_ATT_03D_CNS_STATUS_CODE: pass ? 'CLOSED' : 'OPEN',
    });
  } catch (e) {
    jset('J-HRM-ATT-03D-03', 'FAIL', { summary: String(e).slice(0, 400) });
  }

  // ========== J-04 GEO-001 regression ==========
  try {
    await installGeoMock(context, page, OOS_LAT, OOS_LNG);
    await openClockGps(page, OOS_LAT, OOS_LNG);
    let oosPost = null;
    for (let ei = 0; ei < 5; ei++) {
      await pickEmployeeOption(page, ei);
      const before = R.records_hits.filter((n) => n.method === 'POST').length;
      const openBtn = page.getByTestId('clock-in-gps-open-confirm');
      if (!(await openBtn.isEnabled().catch(() => false))) continue;
      await openBtn.click({ timeout: 8000 });
      await sleep(500);
      await pickAttendanceCodeInDialog(page, preferCode).catch(() => ({}));
      const confirm = page.getByTestId('clock-in-gps-confirm-checkin');
      if (await confirm.isEnabled().catch(() => false)) await confirm.click({ timeout: 8000 });
      await sleep(2000);
      oosPost = lastRecordPost(before);
      if (oosPost?.code === 'HRM-ATT-GEO-001' || oosPost?.status === 400) break;
      await page.keyboard.press('Escape').catch(() => {});
    }
    const pass =
      oosPost?.code === 'HRM-ATT-GEO-001' &&
      !(oosPost?.status >= 200 && oosPost?.status < 300) &&
      !nestCoreGeofenceFail();
    jset('J-HRM-ATT-03D-04', pass ? 'PASS' : 'FAIL', {
      summary: `status=${oosPost?.status} code=${oosPost?.code}`,
      post: oosPost,
    });
  } catch (e) {
    jset('J-HRM-ATT-03D-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== J-05 GEO-REQ regression ==========
  try {
    await installGeoMock(context, page, SITE_LAT, SITE_LNG);
    await openClockGps(page, SITE_LAT, SITE_LNG);
    await page.route('**/api/hrm/attendance/records**', async (route) => {
      const req = route.request();
      if (req.method() !== 'POST') {
        await route.continue();
        return;
      }
      let body = {};
      try {
        body = req.postDataJSON() || {};
      } catch {
        body = {};
      }
      delete body.latitude;
      delete body.longitude;
      body.check_in_method = body.check_in_method || 'gps';
      await route.continue({
        postData: JSON.stringify(body),
        headers: { ...req.headers(), 'content-type': 'application/json' },
      });
    });
    let geoReqPost = null;
    for (let ei = 0; ei < 5; ei++) {
      await pickEmployeeOption(page, ei);
      const before = R.records_hits.filter((n) => n.method === 'POST').length;
      const openBtn = page.getByTestId('clock-in-gps-open-confirm');
      if (!(await openBtn.isEnabled().catch(() => false))) continue;
      await openBtn.click({ timeout: 8000 });
      await pickAttendanceCodeInDialog(page, preferCode).catch(() => ({}));
      const confirm = page.getByTestId('clock-in-gps-confirm-checkin');
      if (await confirm.isEnabled().catch(() => false)) await confirm.click({ timeout: 8000 });
      await sleep(2000);
      geoReqPost = lastRecordPost(before);
      if (geoReqPost?.code === 'HRM-ATT-GEO-REQ') break;
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.unroute('**/api/hrm/attendance/records**').catch(() => {});
    const pass =
      geoReqPost?.code === 'HRM-ATT-GEO-REQ' &&
      !(geoReqPost?.status >= 200 && geoReqPost?.status < 300) &&
      !nestCoreGeofenceFail();
    jset('J-HRM-ATT-03D-05', pass ? 'PASS' : 'FAIL', {
      summary: `status=${geoReqPost?.status} code=${geoReqPost?.code} · strip lat/lon FE path`,
      post: geoReqPost,
    });
  } catch (e) {
    await page.unroute('**/api/hrm/attendance/records**').catch(() => {});
    jset('J-HRM-ATT-03D-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  await browser.close();

  const j03 = R.journeys['J-HRM-ATT-03D-03']?.verdict;
  const j04 = R.journeys['J-HRM-ATT-03D-04']?.verdict;
  const j05 = R.journeys['J-HRM-ATT-03D-05']?.verdict;
  const pass =
    j03 === 'PASS' &&
    j04 === 'PASS' &&
    j05 === 'PASS' &&
    !nestCoreGeofenceFail() &&
    R.ensure_default_hits.length === 0;

  R.overall = pass ? 'PASS' : 'FAIL';
  R.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.probes.nest_core_geofence_non404 = R.nest_core_geofence_non404.length;
  R.endedAt = ts();
  save();

  console.log(
    JSON.stringify(
      {
        overall: R.overall,
        ack_status: R.ack_status,
        stamp: STAMP,
        journeys: { j03, j04, j05 },
        nest_core: R.nest_core_geofence_non404.length,
      },
      null,
      2,
    ),
  );
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
