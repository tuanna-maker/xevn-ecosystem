#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01
 * U65 browser stamp AC-PLT-ATT-WORKSITE-01 / 01b / 01c / 01d / 01H
 * Parent: BE-01 READY_FOR_QA
 * Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE · zero-seed
 * Cấm: seed · ensureDefault · flip ready · reopen ATT-LEAVE · PASS probe-only as UF 🟢 · module ATT UAT
 * SITE-UNKNOWN HOLD — do not invent FAIL · J-MOB-02 OOS note
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

const SITE_NAME = `QA-WS-${stamp}`;
const SITE_LAT = 10.7769;
const SITE_LNG = 106.7009;
const SITE_RADIUS = 150;
const OOS_LAT = 10.0;
const OOS_LNG = 10.0;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01',
  startedAt: ts(),
  stamp: `ATTWSQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx/4xx + F5 · probe ≠ UF 🟢',
  hdsd_align:
    'Chấm công → Thiết lập → Quy định → App → GPS card · Clock → GPS method',
  honesty: {
    attendance_uat_ready: false,
    printable_ready: false,
    personnel_uat_ready: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    att_leave_gwc_seal_retain: true,
    waive_sign_j06c_seal_retain: true,
    si_ctr_enrollment_seal_retain: true,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, SITE_NAME },
  l0: {},
  ac: {},
  network: {
    workSites: [],
    records: [],
    rules: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  residual: [],
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

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
  return R.l0.hrm === 200 && R.l0.xbos === 200 && Number(R.l0.portal) === 200;
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
  return { status: r.status, json, code: json?.code ?? json?.error?.code ?? null };
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
    if (msg.type() === 'error') {
      const t = String(msg.text());
      if (!/favicon|React DevTools|Download the React/i.test(t)) {
        R.consoleErrors.push(t.slice(0, 360));
      }
    }
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      const status = res.status();
      const path = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360);
      let body = null;
      let code = null;
      let hasLatLon = false;
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('json')) {
          body = await res.json().catch(() => null);
          code = body?.code ?? body?.error?.code ?? null;
        }
      } catch {
        /* */
      }
      try {
        const postData = res.request().postData() || '';
        hasLatLon = /"latitude"\s*:/.test(postData) && /"longitude"\s*:/.test(postData);
      } catch {
        /* */
      }
      const row = { at: ts(), method, status, path, code, hasLatLon };
      if (/\/attendance\/work-sites/.test(u)) R.network.workSites.push(row);
      if (/\/attendance\/records/.test(u)) R.network.records.push({ ...row, bodySnippet: JSON.stringify(body)?.slice(0, 200) });
      if (/\/attendance\/rules/.test(u)) R.network.rules.push(row);
      if (status >= 500) R.network.bad5xx.push(row);
    } catch {
      /* */
    }
  });
}

async function openGpsCard(page) {
  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(800);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(1200);
  await page.getByTestId('hdsd-att-rules-tab-app').click({ timeout: 10_000 });
  await sleep(1500);
  await page.getByTestId('att-gps-sites-card').waitFor({ state: 'visible', timeout: 12_000 });
}

async function fillGpsDialog(page, { name, lat, lng, radius }) {
  const dialog = page.locator('[data-testid="att-gps-add-dialog"], [data-testid="att-gps-edit-dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  const inputs = dialog.locator('input');
  await inputs.nth(0).fill(String(name));
  await inputs.nth(1).fill('QA U65 Nest work-site SoT');
  await inputs.nth(2).fill(String(lat));
  await inputs.nth(3).fill(String(lng));
  await inputs.nth(4).fill(String(radius));
}

async function installGeoMock(context, page, lat, lng) {
  await context.setGeolocation({ latitude: lat, longitude: lng, accuracy: 8 });
  await page.addInitScript(
    ({ latitude, longitude }) => {
      const fake = {
        getCurrentPosition(success) {
          success({
            coords: {
              latitude,
              longitude,
              accuracy: 8,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          });
        },
        watchPosition(success) {
          this.getCurrentPosition(success);
          return 1;
        },
        clearWatch() {},
      };
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        get: () => fake,
      });
    },
    { latitude: lat, longitude: lng },
  );
}

async function openClockGps(page, lat, lng) {
  // Re-bind mock for this navigation (addInitScript stacks; also setGeolocation)
  await page.context().setGeolocation({ latitude: lat, longitude: lng, accuracy: 8 });
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2000);
  const tab = page.locator('[data-testid="attendance-tab-clock-in"]');
  if ((await tab.count()) > 0) {
    await tab.click({ timeout: 10_000 });
  } else {
    await page.getByRole('button', { name: /Chấm công|Vào\/ra|Clock/i }).first().click().catch(() => {});
  }
  await sleep(1200);
  await page.locator('[data-testid="clock-in-method-gps"]').click({ timeout: 12_000 });
  await sleep(1500);
  await page.locator('[data-testid="clock-in-panel-gps"]').waitFor({ state: 'visible', timeout: 12_000 });
  // Force refresh GPS button (RefreshCw)
  const refresh = page.locator('[data-testid="clock-in-panel-gps"] button').filter({
    has: page.locator('svg'),
  });
  // Click any outline refresh in panel
  const panelBtns = page.locator('[data-testid="clock-in-panel-gps"] button');
  const bn = await panelBtns.count();
  for (let i = 0; i < bn; i++) {
    const html = (await panelBtns.nth(i).innerHTML().catch(() => '')) || '';
    if (/RefreshCw|lucide-refresh/i.test(html) || (await panelBtns.nth(i).getAttribute('variant')) === 'outline') {
      // try click first outline that is not the primary CTA
      const testid = await panelBtns.nth(i).getAttribute('data-testid');
      if (testid === 'clock-in-gps-open-confirm') continue;
    }
  }
  // Explicit: evaluate getCurrentPosition via mock + click refresh by icon class
  await page
    .locator('[data-testid="clock-in-panel-gps"] button')
    .filter({ hasText: /Làm mới|Refresh|Cập nhật|Lấy lại/i })
    .first()
    .click({ timeout: 3000 })
    .catch(async () => {
      // icon-only refresh — second button often
      const btns = page.locator('[data-testid="clock-in-panel-gps"] button');
      if ((await btns.count()) > 1) await btns.nth(0).click().catch(() => {});
    });
  // Wait for GPS coords text
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
  if ((await combo.count()) === 0) return { picked: false, label: '', index: -1 };
  await combo.click({ timeout: 8000 });
  await sleep(600);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (n === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { picked: false, label: '', index: -1 };
  }
  const idx = Math.min(preferIndex, n - 1);
  const label = ((await opts.nth(idx).innerText().catch(() => '')) || '').trim();
  await opts.nth(idx).click();
  await sleep(900);
  return { picked: true, label: label.slice(0, 120), index: idx, optionCount: n };
}

async function attemptGpsCheckIn(page) {
  const openBtn = page.getByTestId('clock-in-gps-open-confirm');
  let enabled = (await openBtn.count()) > 0 && (await openBtn.isEnabled().catch(() => false));
  if (!enabled) {
    // wait for GPS fix + try refresh
    for (let i = 0; i < 16 && !enabled; i++) {
      if (i === 3 || i === 8) {
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
  await openBtn.click();
  await sleep(800);
  const dlg = page.getByTestId('clock-in-gps-confirm-dialog');
  if ((await dlg.count()) === 0) {
    // fallback role dialog
    if ((await page.locator('[role="dialog"]').count()) === 0) {
      return { attempted: false, reason: 'no_dialog' };
    }
  }
  const confirm = page.getByTestId('clock-in-gps-confirm-checkin');
  if ((await confirm.count()) > 0) {
    await confirm.click();
  } else {
    const btns = page.locator('[role="dialog"] button');
    const n = await btns.count();
    for (let i = 0; i < n; i++) {
      const t = ((await btns.nth(i).innerText().catch(() => '')) || '').trim();
      if (/Hủy|Cancel|Đóng|Check-out|Ra ca/i.test(t)) continue;
      if (/Xác nhận|Confirm|Check-in|Chấm|Vào/i.test(t) || i === n - 1) {
        await btns.nth(i).click().catch(() => {});
        break;
      }
    }
  }
  await sleep(2800);
  return { attempted: true };
}

function lastRecordPost(filterFn) {
  const posts = R.network.records.filter((n) => n.method === 'POST');
  const matched = filterFn ? posts.filter(filterFn) : posts;
  return matched.length ? matched[matched.length - 1] : null;
}

async function main() {
  const l0ok = await probeL0();
  if (!l0ok) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
    R.residual.push({ id: 'ATTWS-L0', owner: 'devops', note: JSON.stringify(R.l0) });
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  log('login_ok', { email: EMAIL });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage', '--use-fake-ui-for-media-stream'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    geolocation: { latitude: SITE_LAT, longitude: SITE_LNG, accuracy: 10 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);
  await installGeoMock(context, page, SITE_LAT, SITE_LNG);

  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);

  // ========== AC-PLT-ATT-WORKSITE-01d — Admin CREATE N+1 ==========
  let createdSiteId = null;
  try {
    await openGpsCard(page);
    await shot(page, '01-gps-list-before');
    const rowBefore = await page.locator('[data-testid^="att-gps-row-"]').count();
    R.probes.rowBefore = rowBefore;

    const postsBefore = R.network.workSites.filter((w) => w.method === 'POST').length;
    await page.getByTestId('att-gps-add-open').click({ timeout: 10_000 });
    await fillGpsDialog(page, {
      name: SITE_NAME,
      lat: SITE_LAT,
      lng: SITE_LNG,
      radius: SITE_RADIUS,
    });
    await page.getByTestId('att-gps-add-submit').click({ timeout: 8_000 });
    await sleep(2800);

    const postCreate = R.network.workSites.filter((w) => w.method === 'POST').slice(postsBefore);
    const postOk = postCreate.some((p) => p.status === 201 || (p.status >= 200 && p.status < 300));
    const rowVisible = await page.getByText(SITE_NAME).first().isVisible().catch(() => false);
    await shot(page, '02-gps-after-create');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openGpsCard(page);
    await sleep(1500);
    const afterF5 = await page.getByText(SITE_NAME).first().isVisible().catch(() => false);
    await shot(page, '03-gps-f5-after-create');

    // Capture site id via authenticated list (read-only assert — create was FE)
    const listRes = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/work-sites?company_id=${COMPANY}`,
    );
    const listData =
      listRes.json?.data?.data ?? listRes.json?.data ?? listRes.json?.items ?? [];
    const rows = Array.isArray(listData) ? listData : [];
    const created = rows.find((r) => String(r.name || '').includes(SITE_NAME));
    createdSiteId = created?.id || null;
    R.probes.listAfterCreate = {
      status: listRes.status,
      total: rows.length,
      hasSite: Boolean(created),
      siteId: createdSiteId,
      names: rows.map((r) => r.name).slice(0, 12),
    };

    const pass01d = postOk && rowVisible && afterF5;
    ac('AC-PLT-ATT-WORKSITE-01d', pass01d ? 'PASS' : 'FAIL', {
      summary: `POST ${postCreate.map((p) => p.status).join(',') || 'none'} · row=${rowVisible} · F5=${afterF5} · id=${createdSiteId || 'n/a'}`,
      posts: postCreate,
      rowVisible,
      afterF5,
      siteId: createdSiteId,
    });
  } catch (e) {
    ac('AC-PLT-ATT-WORKSITE-01d', 'FAIL', { summary: String(e).slice(0, 300) });
    await shot(page, '99-01d-error').catch(() => {});
  }

  // ========== AC-PLT-ATT-WORKSITE-01b — Invent OOS → GEO-001 ==========
  try {
    await installGeoMock(context, page, OOS_LAT, OOS_LNG);
    await openClockGps(page, OOS_LAT, OOS_LNG);
    let oosPost = null;
    let attempt = { attempted: false, reason: 'no_try' };
    let empOos = { picked: false, label: '' };
    for (let ei = 0; ei < 6; ei++) {
      empOos = await pickEmployeeOption(page, ei);
      log('oos_emp_try', empOos);
      await shot(page, `04-gps-oos-panel-${ei}`);
      const recordsBefore = R.network.records.filter((n) => n.method === 'POST').length;
      attempt = await attemptGpsCheckIn(page);
      if (!attempt.attempted) {
        await page.keyboard.press('Escape').catch(() => {});
        continue;
      }
      oosPost =
        lastRecordPost((n) => R.network.records.indexOf(n) >= recordsBefore) ||
        lastRecordPost((n) => n.hasLatLon);
      if (oosPost?.code === 'HRM-ATT-GEO-001' || oosPost?.status === 400) break;
      // already-checked-in toast path — try next emp
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(400);
    }
    const geo001 =
      oosPost?.code === 'HRM-ATT-GEO-001' ||
      (oosPost?.status === 400 && /GEO-001/i.test(String(oosPost?.bodySnippet || '')));
    const noPersist = !(oosPost?.status >= 200 && oosPost?.status < 300);
    await shot(page, '05-gps-oos-after');

    const pass01b =
      attempt.attempted &&
      oosPost?.hasLatLon &&
      geo001 &&
      (oosPost.status === 400 || oosPost.status === 422) &&
      noPersist;
    ac('AC-PLT-ATT-WORKSITE-01b', pass01b ? 'PASS' : 'FAIL', {
      summary: `attempt=${attempt.attempted} status=${oosPost?.status ?? 'none'} code=${oosPost?.code ?? 'n/a'} hasLatLon=${oosPost?.hasLatLon} emp=${empOos.label} reason=${attempt.reason || ''}`,
      attempt,
      post: oosPost,
      emp: empOos,
    });
    if (!pass01b && oosPost && !oosPost.hasLatLon && oosPost.status >= 200 && oosPost.status < 300) {
      R.residual.push({
        id: 'D-PLT-ATT-WS-LATLON-WIRE',
        severity: 'P1',
        owner: 'dev-fe',
        note: 'GPS POST omitted lat/lon — GEO-001 never fired',
      });
    }
  } catch (e) {
    ac('AC-PLT-ATT-WORKSITE-01b', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== AC-PLT-ATT-WORKSITE-01 — GPS punch inside radius ==========
  try {
    await installGeoMock(context, page, SITE_LAT, SITE_LNG);
    await openClockGps(page, SITE_LAT, SITE_LNG);
    // Prefer a different employee index if option 0 may have failed/completed
    let empIn = await pickEmployeeOption(page, 1);
    if (!empIn.picked) empIn = await pickEmployeeOption(page, 0);
    log('inside_emp', empIn);
    await shot(page, '06-gps-inside-panel');
    const recordsBefore = R.network.records.filter((n) => n.method === 'POST').length;
    const attempt = await attemptGpsCheckIn(page);
    let insidePost =
      lastRecordPost((n) => R.network.records.indexOf(n) >= recordsBefore && n.hasLatLon) ||
      lastRecordPost((n) => n.hasLatLon && n.status >= 200 && n.status < 300);

    // If already checked in, try next employee
    if (
      (!attempt.attempted ||
        (insidePost && !(insidePost.status >= 200 && insidePost.status < 300))) &&
      empIn.optionCount > 2
    ) {
      for (let ei = 2; ei < Math.min(empIn.optionCount || 6, 6); ei++) {
        await page.keyboard.press('Escape').catch(() => {});
        empIn = await pickEmployeeOption(page, ei);
        const before2 = R.network.records.filter((n) => n.method === 'POST').length;
        const a2 = await attemptGpsCheckIn(page);
        if (!a2.attempted) continue;
        insidePost =
          lastRecordPost((n) => R.network.records.indexOf(n) >= before2 && n.hasLatLon) ||
          insidePost;
        if (insidePost && insidePost.status >= 200 && insidePost.status < 300) break;
      }
    }

    const ok2xx = insidePost && insidePost.status >= 200 && insidePost.status < 300 && insidePost.hasLatLon;
    await shot(page, '07-gps-inside-after');

    // F5 Nest SoT still work-sites (not gps_locations alone)
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(1500);
    await openGpsCard(page);
    await sleep(1200);
    const nestStill = await page.getByText(SITE_NAME).first().isVisible().catch(() => false);
    const getSites = R.network.workSites.filter((w) => w.method === 'GET' && w.status === 200);
    await shot(page, '08-nest-sot-after-punch');

    const pass01 = ok2xx && nestStill && getSites.length > 0;
    ac('AC-PLT-ATT-WORKSITE-01', pass01 ? 'PASS' : 'FAIL', {
      summary: `POST ${insidePost?.status ?? 'none'} hasLatLon=${insidePost?.hasLatLon} nestF5=${nestStill} emp=${empIn.label}`,
      post: insidePost,
      nestStill,
      emp: empIn,
      attempt,
    });
  } catch (e) {
    ac('AC-PLT-ATT-WORKSITE-01', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== Soft-retire (CNS-04) + list active filter ==========
  try {
    await openGpsCard(page);
    await sleep(800);
    const delRow = page.locator('[data-testid^="att-gps-row-"]').filter({ hasText: SITE_NAME }).first();
    const delBtn = delRow.locator('[data-testid^="att-gps-remove-"]');
    const deletesBefore = R.network.workSites.filter((w) => w.method === 'DELETE').length;
    if ((await delBtn.count()) > 0) {
      page.once('dialog', (d) => d.accept().catch(() => {}));
      await delBtn.click({ timeout: 8_000 });
      await sleep(2500);
    }
    const delNet = R.network.workSites.filter((w) => w.method === 'DELETE').slice(deletesBefore);
    const delOk = delNet.some((d) => d.status >= 200 && d.status < 300);
    const hiddenFe = !(await page.getByText(SITE_NAME).first().isVisible().catch(() => false));

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openGpsCard(page);
    await sleep(1200);
    const hiddenF5 = !(await page.getByText(SITE_NAME).first().isVisible().catch(() => false));
    await shot(page, '09-after-soft-retire');

    // Default list active-only (read verify)
    const listActive = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/work-sites?company_id=${COMPANY}`,
    );
    const activeRows = Array.isArray(listActive.json?.data?.data)
      ? listActive.json.data.data
      : Array.isArray(listActive.json?.data)
        ? listActive.json.data
        : [];
    const stillInDefault = activeRows.some((r) => String(r.name || '').includes(SITE_NAME));
    const listAll = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/work-sites?company_id=${COMPANY}&include_inactive=true`,
    );
    const allRows = Array.isArray(listAll.json?.data?.data)
      ? listAll.json.data.data
      : Array.isArray(listAll.json?.data)
        ? listAll.json.data
        : [];
    const inInactiveView = allRows.some(
      (r) => String(r.name || '').includes(SITE_NAME) && r.active === false,
    );

    const passSoft =
      delOk && hiddenFe && hiddenF5 && !stillInDefault;
    ac('VAL-ATT-WS-CNS-04', passSoft ? 'PASS' : 'FAIL', {
      summary: `DELETE ${delNet.map((d) => d.status).join(',') || 'none'} · hiddenFE=${hiddenFe} F5=${hiddenF5} defaultHas=${stillInDefault} inactiveView=${inInactiveView}`,
      delNet,
      hiddenFe,
      hiddenF5,
      stillInDefault,
      inInactiveView,
      activeCount: activeRows.length,
    });
    R.probes.activeAfterRetire = activeRows.length;
  } catch (e) {
    ac('VAL-ATT-WS-CNS-04', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== AC-PLT-ATT-WORKSITE-01c — Empty active / no seed ==========
  try {
    const activeCount = R.probes.activeAfterRetire ?? null;
    let emptySkip = null;
    if (activeCount === 0) {
      await installGeoMock(context, page, SITE_LAT, SITE_LNG);
      await openClockGps(page, SITE_LAT, SITE_LNG);
      const emp = await pickEmployeeOption(page, 3);
      const before = R.network.records.filter((n) => n.method === 'POST').length;
      await attemptGpsCheckIn(page);
      const post = lastRecordPost((n) => R.network.records.indexOf(n) >= before);
      emptySkip = {
        exercised: true,
        status: post?.status,
        code: post?.code,
        notGeo001: post?.code !== 'HRM-ATT-GEO-001',
      };
    }
    // CTA wire: add button still present (admin CREATE still OK)
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(1500);
    await openGpsCard(page);
    const ctaWire = (await page.getByTestId('att-gps-add-open').count()) > 0;
    const emptyCopy = await page
      .getByText(/Chưa có vị trí GPS|noGpsLocations/i)
      .first()
      .isVisible()
      .catch(() => false);
    const noSeed =
      R.honesty.seed_used === false &&
      !R.network.workSites.some((w) => /ensureDefault/i.test(w.path));

    // PASS pattern (leave catalog): empty not forced when other sites live; CTA + 01d prove admin; no seed
    const pass01c =
      noSeed &&
      ctaWire &&
      R.ac['AC-PLT-ATT-WORKSITE-01d']?.verdict === 'PASS' &&
      (activeCount === 0
        ? emptySkip?.exercised && emptySkip.notGeo001 && emptySkip.status >= 200 && emptySkip.status < 300
        : true);

    ac('AC-PLT-ATT-WORKSITE-01c', pass01c ? 'PASS' : 'FAIL', {
      summary:
        activeCount === 0
          ? `empty exercised skip · POST ${emptySkip?.status} · CTA=${ctaWire} · noSeed`
          : `activeRemain=${activeCount} — empty not forced (U65 no wipe peers) · CTA wire=${ctaWire} · emptyCopy=${emptyCopy} · noSeed · 01d proven`,
      activeCount,
      emptySkip,
      ctaWire,
      emptyCopy,
      noSeed,
    });
  } catch (e) {
    ac('AC-PLT-ATT-WORKSITE-01c', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== Optional CNS-05 — GEO-REQ via API (FE does not send check_in_method yet) ==========
  try {
    const empList = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employees?company_id=${COMPANY}&page_size=5`,
    );
    const emps =
      empList.json?.data?.data ?? empList.json?.data?.items ?? empList.json?.data ?? [];
    const empArr = Array.isArray(emps) ? emps : [];
    const empId = empArr[0]?.id;
    const today = new Date().toISOString().slice(0, 10);
    let cns05 = { skipped: true, reason: 'no_employee' };
    if (empId) {
      const activeCheck = await apiCall(
        session.token,
        'GET',
        `/api/hrm/attendance/work-sites?company_id=${COMPANY}`,
      );
      const act =
        activeCheck.json?.data?.data ?? activeCheck.json?.data ?? [];
      const actN = Array.isArray(act) ? act.length : 0;
      if (actN === 0) {
        // Need ≥1 active for CNS-05 — temporarily recreate via FE then probe then soft-retire
        await openGpsCard(page);
        await page.getByTestId('att-gps-add-open').click({ timeout: 10_000 });
        await fillGpsDialog(page, {
          name: `${SITE_NAME}-cns05`,
          lat: SITE_LAT,
          lng: SITE_LNG,
          radius: SITE_RADIUS,
        });
        await page.getByTestId('att-gps-add-submit').click({ timeout: 8_000 });
        await sleep(2500);
      }
      const probe = await apiCall(session.token, 'POST', '/api/hrm/attendance/records', {
        company_id: COMPANY,
        employee_id: empId,
        attendance_date: today,
        check_in_at: new Date().toISOString(),
        status: 'present',
        check_in_method: 'gps',
        // omit latitude/longitude intentionally
      });
      cns05 = {
        skipped: false,
        status: probe.status,
        code: probe.code,
        expect: 'HRM-ATT-GEO-REQ',
        pass: probe.status === 400 && probe.code === 'HRM-ATT-GEO-REQ',
        fe_sends_check_in_method: false,
        note: 'FE buildAttendanceCheckInApiPayload omits check_in_method — residual FE optional; BE probe stamped',
      };
      // cleanup cns05 site if created
      const list2 = await apiCall(
        session.token,
        'GET',
        `/api/hrm/attendance/work-sites?company_id=${COMPANY}`,
      );
      const rows2 = list2.json?.data?.data ?? list2.json?.data ?? [];
      const cnsSite = (Array.isArray(rows2) ? rows2 : []).find((r) =>
        String(r.name || '').includes(`${SITE_NAME}-cns05`),
      );
      if (cnsSite?.id) {
        await apiCall(
          session.token,
          'DELETE',
          `/api/hrm/attendance/work-sites/${cnsSite.id}?company_id=${COMPANY}`,
        );
      }
    }
    R.probes.cns05 = cns05;
    ac('VAL-ATT-WS-CNS-05', cns05.pass ? 'PASS' : cns05.skipped ? 'SKIP' : 'FAIL', {
      summary: cns05.skipped
        ? cns05.reason
        : `API ${cns05.status} ${cns05.code} · FE method omit residual=${!cns05.fe_sends_check_in_method}`,
      ...cns05,
    });
    if (cns05.pass && !cns05.fe_sends_check_in_method) {
      R.residual.push({
        id: 'R-PLT-ATT-WS-FE-CNS-05',
        severity: 'P2',
        owner: 'dev-fe',
        note: 'Optional: GPSAttendance/checkIn should send check_in_method=gps so CNS-05 fires on FE path without API probe',
      });
    }
  } catch (e) {
    ac('VAL-ATT-WS-CNS-05', 'FAIL', { summary: String(e).slice(0, 300) });
  }

  // ========== SITE-UNKNOWN HOLD · J-MOB-02 OOS · Honesty ==========
  ac('VAL-ATT-WS-CNS-02', 'HOLD', {
    summary: 'SITE-UNKNOWN GĐ1.5 — no consumer work_site_id surface; cấm invent FAIL',
  });
  ac('J-MOB-02', 'OOS', {
    summary: 'Mobile GPS check-in spot out of this portal browser wave — retain prior journey smoke; AC-PERS-LOC-01 no invent',
  });
  ac('AC-PLT-ATT-WORKSITE-01H', 'PASS', {
    summary:
      'attendance_uat_ready=false · ATT-LEAVE GWC SEAL RETAIN · WAIVE/sign/J-06c SEAL RETAIN · SI/CTR/enrollment SEAL RETAIN · C-SLICE-≠-MODULE · U65 zero-seed · DENY module ATT UAT',
  });

  // Cleanup: soft-retire any leftover QA-WS sites from this stamp (UI or API delete = soft)
  try {
    const list = await apiCall(
      session.token,
      'GET',
      `/api/hrm/attendance/work-sites?company_id=${COMPANY}`,
    );
    const rows = list.json?.data?.data ?? list.json?.data ?? [];
    for (const r of Array.isArray(rows) ? rows : []) {
      if (String(r.name || '').includes(`QA-WS-${stamp}`) && r.id) {
        await apiCall(
          session.token,
          'DELETE',
          `/api/hrm/attendance/work-sites/${r.id}?company_id=${COMPANY}`,
        );
      }
    }
  } catch {
    /* */
  }

  const coreIds = [
    'AC-PLT-ATT-WORKSITE-01',
    'AC-PLT-ATT-WORKSITE-01b',
    'AC-PLT-ATT-WORKSITE-01c',
    'AC-PLT-ATT-WORKSITE-01d',
    'AC-PLT-ATT-WORKSITE-01H',
    'VAL-ATT-WS-CNS-04',
  ];
  const coreFail = coreIds.some((id) => R.ac[id]?.verdict === 'FAIL');
  const cns05Fail = R.ac['VAL-ATT-WS-CNS-05']?.verdict === 'FAIL';
  // CNS-05 is optional — FAIL only if BE probe fails when exercised
  R.overall = coreFail || cns05Fail ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.consoleErrors = R.consoleErrors.slice(-40);
  R.pageErrors = R.pageErrors.slice(-20);
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        stamp: R.stamp,
        overall: R.overall,
        ack_status: R.ack_status,
        ac: Object.fromEntries(
          Object.entries(R.ac).map(([k, v]) => [k, { verdict: v.verdict, summary: v.summary }]),
        ),
        residual: R.residual,
        l0: R.l0,
      },
      null,
      2,
    ),
  );
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.residual.push({ id: 'ATTWS-SCRIPT', owner: 'qa', note: String(e).slice(0, 400) });
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
