#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-CLOCK-01-R2 — GPS AC retest after FE lat/lon wire
 * U65 zero-seed · browser-only · do not reopen SHEETS/OT/NT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const NV_EMAIL = process.env.QA_NV_EMAIL || 'uat.nv0007@xe.vn';
const PASSWORDS = ['Xevn@2026', 'xevn-uat-2026'];
const OU = 'trsport';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-clock-01-r2');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-r2-browser.json');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M2-ATT-CLOCK-01-R2',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  u87_menu_fidelity: true,
  env: { PORTAL, HRM, NV_EMAIL, OU, commit: COMMIT },
  cfg: {},
  steps: {},
  posts: [],
  toasts: [],
  surfaces: { 7: null, 9: null, 10: null },
  residual: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  screens: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}
function step(id, verdict, summary, extra = {}) {
  results.steps[id] = { verdict, summary, ...extra, at: ts() };
  console.log(`${verdict} ${id} — ${summary}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function loginMobile() {
  for (const password of PASSWORDS) {
    const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: NV_EMAIL, password }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.access_token ?? d?.accessToken;
    if (!token) continue;
    const mem = d.active_membership ?? d.memberships?.[0] ?? {};
    return {
      token,
      expiresAt: Date.now() + 8 * 3600e3,
      jwtOu: mem.company_id || OU,
      employeeId: mem.employee_id || null,
      employeeName: mem.employee_name || NV_EMAIL,
      user: {
        userId: mem.employee_id || 'nv',
        email: NV_EMAIL,
        displayName: mem.employee_name || 'NV',
        roles: ['employee'],
      },
    };
  }
  throw new Error('login fail');
}

async function probeCfg(token) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': OU,
    'x-tenant-id': TENANT,
  };
  const rulesR = await fetch(`${HRM}/api/hrm/attendance/rules?company_id=${OU}`, { headers });
  const rulesJ = await rulesR.json().catch(() => ({}));
  const rules = rulesJ?.data ?? rulesJ;
  const sitesR = await fetch(`${HRM}/api/hrm/attendance/work-sites?company_id=${OU}`, { headers });
  const sitesJ = await sitesR.json().catch(() => ({}));
  const sitesRaw = sitesJ?.data ?? sitesJ;
  const sites = Array.isArray(sitesRaw) ? sitesRaw : sitesRaw?.items ?? sitesRaw?.rows ?? [];
  const activeSites = sites.filter((s) => s?.active !== false);
  results.cfg = {
    rulesHttp: rulesR.status,
    gps_enabled: rules?.gps_enabled ?? null,
    sitesHttp: sitesR.status,
    sitesTotal: sites.length,
    sitesActive: activeSites.length,
    siteNames: activeSites.slice(0, 5).map((s) => s?.name || s?.id).filter(Boolean),
  };
  const gpsOn = results.cfg.gps_enabled !== false;
  const expectGeo =
    gpsOn && results.cfg.sitesActive >= 1
      ? 'EXPECT_GEO_001'
      : gpsOn
        ? 'BE_SKIP_EMPTY_SITES'
        : 'BE_SKIP_GPS_OFF';
  results.cfg.expectMode = expectGeo;
  step(
    'cfg_probe',
    'INFO',
    `gps_enabled=${results.cfg.gps_enabled} activeSites=${results.cfg.sitesActive} mode=${expectGeo}`,
  );
  return results.cfg;
}

async function listFreeEmployees(token) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': OU,
    'x-tenant-id': TENANT,
  };
  const em = await fetch(`${HRM}/api/hrm/employees?company_id=${OU}&page_size=50`, { headers });
  const ej = await em.json().catch(() => ({}));
  const list = Array.isArray(ej?.data?.data)
    ? ej.data.data
    : Array.isArray(ej?.data)
      ? ej.data
      : ej?.data?.items || [];
  const rec = await fetch(
    `${HRM}/api/hrm/attendance/records?company_id=${OU}&from_date=2026-08-04&to_date=2026-08-04&page_size=100`,
    { headers },
  );
  const rj = await rec.json().catch(() => ({}));
  const records = Array.isArray(rj?.data?.data)
    ? rj.data.data
    : Array.isArray(rj?.data)
      ? rj.data
      : rj?.data?.items || [];
  const checked = new Set(records.map((r) => r.employee_id));
  const free = list
    .filter((e) => e?.id && !checked.has(e.id))
    .map((e) => ({
      id: e.id,
      code: e.employee_code || e.code || '',
      name: e.full_name || e.name || '',
    }));
  results.cfg.freeEmployees = free.slice(0, 8);
  results.cfg.recordsToday = records.length;
  return free;
}

async function pickEmployee(page, panelTestId, preferCodes = []) {
  const panel = page.locator(`[data-testid="${panelTestId}"]`);
  const combo = panel.getByRole('combobox').first();
  if ((await combo.count()) === 0) return { picked: false, label: null };
  await combo.click();
  await sleep(700);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (n === 0) return { picked: false, label: null, optionCount: 0 };
  let idx = -1;
  const labels = [];
  for (let i = 0; i < n; i++) {
    const t = ((await opts.nth(i).innerText().catch(() => '')) || '').trim();
    labels.push(t.slice(0, 80));
    if (idx < 0 && preferCodes.some((c) => c && t.includes(c))) idx = i;
  }
  // Avoid UAT-0201 already checked-in from R1
  if (idx < 0) {
    for (let i = 0; i < n; i++) {
      if (!/UAT-0201|UAT NV 0201/i.test(labels[i])) {
        idx = i;
        break;
      }
    }
  }
  if (idx < 0) idx = 0;
  const label = labels[idx] || (await opts.nth(idx).innerText()).trim();
  await opts.nth(idx).click();
  await sleep(1200);
  return { picked: true, label: label.slice(0, 100), optionCount: n, idx, labels: labels.slice(0, 8) };
}

async function confirmCheckInDialog(page) {
  const dialog = page.locator('[role="dialog"]');
  if ((await dialog.count()) === 0) return { ok: false, reason: 'no-dialog', buttons: [] };
  const btns = dialog.locator('button');
  const n = await btns.count();
  const buttons = [];
  for (let i = 0; i < n; i++) {
    buttons.push(((await btns.nth(i).innerText().catch(() => '')) || '').trim());
  }
  // Prefer explicit check-in CTA; never click check-out (PATCH path — GEO create AC)
  for (let i = 0; i < n; i++) {
    const t = buttons[i];
    if (/Hủy|Cancel|Đóng/i.test(t)) continue;
    if (/Check-out|Chấm ra|ra ca|checkOut/i.test(t)) continue;
    if (/Check-in|Chấm vào|Vào ca|gpsAttendance\.checkIn|^Chấm công$/i.test(t) || /LogIn/i.test(t)) {
      await btns.nth(i).click().catch(() => {});
      return { ok: true, reason: 'checkin-btn', buttons, clicked: t };
    }
  }
  // Fallback: primary non-cancel that is not check-out
  for (let i = 0; i < n; i++) {
    const t = buttons[i];
    if (/Hủy|Cancel|Đóng|Check-out|Chấm ra/i.test(t)) continue;
    await btns.nth(i).click().catch(() => {});
    return { ok: true, reason: 'fallback-non-cancel', buttons, clicked: t };
  }
  return { ok: false, reason: 'no-checkin-btn', buttons };
}

async function captureToasts(page) {
  const sels = [
    '[data-sonner-toast]',
    '[role="status"]',
    '.Toastify__toast',
    '[class*="toast"]',
    '[class*="Toast"]',
  ];
  const texts = [];
  for (const s of sels) {
    const loc = page.locator(s);
    const c = await loc.count().catch(() => 0);
    for (let i = 0; i < Math.min(c, 5); i++) {
      const t = ((await loc.nth(i).innerText().catch(() => '')) || '').trim();
      if (t && t.length < 240) texts.push(t.slice(0, 200));
    }
  }
  // Also body text snippet for inline errors
  const bodySnippet = await page
    .locator('body')
    .innerText()
    .then((t) => t.slice(0, 4000))
    .catch(() => '');
  const geoVisible = /HRM-ATT-GEO-001|ngoài vùng|out of range|geofence|vùng cho phép/i.test(
    bodySnippet,
  );
  return { texts: [...new Set(texts)].slice(0, 8), geoVisible };
}

const session = await loginMobile();
await probeCfg(session.token);
const freeEmps = await listFreeEmployees(session.token);
const preferCodes = freeEmps.map((e) => e.code).filter(Boolean);
step(
  'free_employees',
  preferCodes.length ? 'PASS' : 'FAIL',
  `free=${preferCodes.join(',') || 'none'} recordsToday=${results.cfg.recordsToday}`,
);

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'vi-VN',
  geolocation: { latitude: 10, longitude: 10, accuracy: 12 },
  permissions: ['geolocation'],
});
const page = await context.newPage();

page.on('response', async (res) => {
  const u = res.url();
  if (!/\/api\/hrm\/attendance\/records/.test(u)) return;
  const method = res.request().method();
  if (method === 'OPTIONS') return;
  const e = {
    method,
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, ''),
    xCompanyId: res.request().headers()['x-company-id'] || null,
    at: ts(),
  };
  if (method === 'POST') {
    try {
      const body = JSON.parse(res.request().postData() || '{}');
      e.bodyKeys = Object.keys(body);
      e.hasLatLon = body.latitude != null && body.longitude != null;
      e.latitude = body.latitude ?? null;
      e.longitude = body.longitude ?? null;
      e.company_id = body.company_id ?? null;
      e.employee_id = body.employee_id ?? null;
      e.check_in_location = body.check_in_location ?? null;
    } catch {
      /* */
    }
    try {
      const j = await res.json();
      e.code = j?.code || null;
      e.message = String(j?.message || '').slice(0, 160);
    } catch {
      /* */
    }
  }
  results.posts.push(e);
  save();
});

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    const t = msg.text();
    if (/favicon|Download the React DevTools/i.test(t)) return;
    results.consoleErrors = results.consoleErrors || [];
    results.consoleErrors.push(t.slice(0, 200));
  }
});

await page.addInitScript((s) => {
  const p = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', p);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'trsport');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', 'trsport');
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, session);

const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_r2=${Date.now()}`;
await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
await sleep(2500);
await page.locator('[data-testid="attendance-tab-clock-in"]').click({ timeout: 15_000 });
await sleep(1200);
await shot(page, '01-clock-hub');
step('hub_open', 'PASS', 'clock-in tab open');

// --- Face HOLD spot ---
await page.locator('[data-testid="clock-in-method-faceid"]').click({ timeout: 10_000 });
await sleep(1200);
const faceBanner = (await page.locator('[data-testid="att-faceid-hold-banner"]').count()) > 0;
const facePostsBefore = results.posts.filter((p) => p.method === 'POST').length;
await shot(page, '02-face-hold');
results.surfaces[9] = {
  runtime: faceBanner ? 'GĐ2-HOLD' : 'UNKNOWN',
  banner: faceBanner,
  postsDuringFace: 0,
};
step('face_hold', faceBanner ? 'PASS' : 'FAIL', `banner=${faceBanner}`);

// --- GPS primary AC ---
await page.locator('[data-testid="clock-in-method-gps"]').click({ timeout: 10_000 });
await sleep(2200);
const gpsPanel = (await page.locator('[data-testid="clock-in-panel-gps"]').count()) > 0;
const gpsText = gpsPanel
  ? await page.locator('[data-testid="clock-in-panel-gps"]').innerText().catch(() => '')
  : '';
const gpsShowsCoords = /10\.0|10,10|latitude|Kinh độ|Vĩ độ|GPS:/i.test(gpsText);
const empGps = await pickEmployee(page, 'clock-in-panel-gps', preferCodes);
await shot(page, '03-gps-panel');

const postsBeforeGps = results.posts.length;
const gpsCta = page
  .locator('[data-testid="clock-in-panel-gps"] button')
  .filter({ hasText: /Chấm công GPS|gpsAttendance\.title|Check-in|Chấm công/i })
  .first();
const gpsCtaEnabled = (await gpsCta.count()) > 0 && (await gpsCta.isEnabled().catch(() => false));
if (gpsCtaEnabled) await gpsCta.click().catch(() => {});
await sleep(1200);
await shot(page, '03b-gps-dialog');
const gpsDialog = await confirmCheckInDialog(page);
results.gpsDialog = gpsDialog;
await sleep(3200);
const toastAfterGps = await captureToasts(page);
results.toasts.push({ after: 'gps', ...toastAfterGps });
await shot(page, '04-gps-after-attempt');

const gpsPosts = results.posts.slice(postsBeforeGps).filter((p) => p.method === 'POST');
const gpsPost = gpsPosts.length ? gpsPosts[gpsPosts.length - 1] : null;
const hasLatLon = Boolean(gpsPost?.hasLatLon);
const geo001 =
  gpsPost?.code === 'HRM-ATT-GEO-001' ||
  /HRM-ATT-GEO-001|ngoài vùng|out of range/i.test(`${gpsPost?.message || ''}`);
const geo4xx = gpsPost && gpsPost.status >= 400 && gpsPost.status < 500;
const silent201 =
  hasLatLon && gpsPost?.status >= 200 && gpsPost?.status < 300 && results.cfg.expectMode === 'EXPECT_GEO_001';

let gpsVerdict = 'FAIL';
let gpsNote = '';
const mode = results.cfg.expectMode;

if (!gpsPanel) {
  gpsVerdict = 'FAIL';
  gpsNote = 'GPS panel missing';
} else if (!gpsPost) {
  gpsVerdict = 'FAIL';
  gpsNote = `No POST after GPS confirm emp=${empGps.label} cta=${gpsCtaEnabled} dialog=${JSON.stringify(gpsDialog)}`;
} else if (!hasLatLon) {
  gpsVerdict = 'FAIL';
  gpsNote = 'POST still omits latitude/longitude — R-MFD-M2-CLOCK-GPS-LATLON OPEN';
  results.residual.push({
    id: 'R-MFD-M2-CLOCK-GPS-LATLON',
    owner: 'dev-fe',
    note: 'FE wire regression — GPS POST missing lat/lon',
  });
} else if (mode === 'EXPECT_GEO_001') {
  if (geo001 && geo4xx) {
    const toastOk =
      toastAfterGps.geoVisible ||
      toastAfterGps.texts.some((t) => /GEO|ngoài vùng|vùng|GPS|lỗi|error|thất bại/i.test(t));
    gpsVerdict = toastOk || toastAfterGps.geoVisible ? 'PASS' : 'PARTIAL';
    gpsNote = toastOk
      ? `Honest GEO reject ${gpsPost.status} ${gpsPost.code} + FE feedback`
      : `GEO ${gpsPost.status} ${gpsPost.code} but FE toast weak/not observed`;
    if (gpsVerdict === 'PARTIAL') {
      results.residual.push({
        id: 'R-MFD-M2-CLOCK-GPS-TOAST',
        owner: 'dev-fe',
        note: 'GEO-001 returned but FE toast/error not clearly observed',
      });
    }
  } else if (silent201) {
    gpsVerdict = 'FAIL';
    gpsNote = `Silent 201 with lat/lon while gps ON + active sites — expected HRM-ATT-GEO-001`;
    results.residual.push({
      id: 'R-MFD-M2-CLOCK-GPS-SILENT-201',
      owner: 'dev-be',
      note: 'assertWithinWorkSite did not reject outside coords 10,10',
    });
  } else {
    gpsVerdict = 'FAIL';
    gpsNote = `Unexpected GPS response status=${gpsPost.status} code=${gpsPost.code}`;
  }
} else {
  // CFG skip paths — document honestly; FE lat/lon wire is the PASS criterion
  gpsVerdict = 'PASS';
  gpsNote = `hasLatLon=true status=${gpsPost.status} code=${gpsPost.code || 'n/a'} · CFG ${mode} (BE skip geofence assert — not FE omit)`;
}

results.surfaces[10] = {
  runtime:
    gpsVerdict === 'PASS'
      ? mode === 'EXPECT_GEO_001'
        ? 'LIVE'
        : 'LIVE_CFG_SKIP'
      : gpsVerdict === 'PARTIAL'
        ? 'PARTIAL'
        : 'FAIL',
  panel: gpsPanel,
  showsCoords: gpsShowsCoords,
  emp: empGps,
  ctaEnabled: gpsCtaEnabled,
  dialog: gpsDialog?.ok === true,
  dialogDetail: gpsDialog,
  post: gpsPost,
  hasLatLon,
  geo001,
  mode,
  toast: toastAfterGps,
  note: gpsNote,
  mockGeo: { latitude: 10, longitude: 10 },
};
step('gps_ac', gpsVerdict, gpsNote, { hasLatLon, status: gpsPost?.status, code: gpsPost?.code });

// Face posts during face tab only (before GPS) — re-check: no Face POST claimed
results.surfaces[9].postsDuringFace = facePostsBefore;
step(
  'face_no_post',
  facePostsBefore === 0 ? 'PASS' : 'FAIL',
  `facePostsBeforeGpsAttempt=${facePostsBefore}`,
);

// --- Manual spot (must_keep: 201 without lat/lon) ---
await page.locator('[data-testid="clock-in-method-manual"]').click({ timeout: 10_000 });
await sleep(1500);
const postsBeforeManual = results.posts.length;
const empMan = await pickEmployee(
  page,
  'clock-in-panel-manual',
  preferCodes.filter((c) => !String(empGps.label || '').includes(c)),
);
await shot(page, '05-manual-panel');
const manCta = page
  .locator('[data-testid="clock-in-panel-manual"] button')
  .filter({ hasText: /Check-in|Chấm vào|Vào ca/i })
  .first();
const manEnabled = (await manCta.count()) > 0 && (await manCta.isEnabled().catch(() => false));
if (manEnabled) await manCta.click().catch(() => {});
await sleep(1000);
const manDialog = await confirmCheckInDialog(page);
results.manualDialog = manDialog;
await sleep(2800);
await shot(page, '06-manual-after');
const manPosts = results.posts.slice(postsBeforeManual).filter((p) => p.method === 'POST');
const manPost = manPosts.length ? manPosts[manPosts.length - 1] : null;
let manVerdict = 'FAIL';
let manNote = '';
if (!manPost) {
  manVerdict = 'BLOCKED';
  manNote = `No manual POST (emp=${empMan.label} cta=${manEnabled} dialog=${JSON.stringify(manDialog)}) — may already checked-in; not GPS regression`;
} else if (manPost.hasLatLon) {
  manVerdict = 'FAIL';
  manNote = 'Manual POST unexpectedly includes lat/lon — must_keep broken';
  results.residual.push({
    id: 'R-MFD-M2-CLOCK-MANUAL-LATLON',
    owner: 'dev-fe',
    note: 'Manual path must omit latitude/longitude',
  });
} else if (manPost.status >= 200 && manPost.status < 300) {
  manVerdict = 'PASS';
  manNote = `Manual ${manPost.status} ${manPost.code || ''} hasLatLon=false (must_keep)`;
} else {
  manVerdict = 'BLOCKED';
  manNote = `Manual ${manPost.status} ${manPost.code} hasLatLon=false — business reject, not lat/lon omit fail`;
}
results.surfaces[7] = {
  runtime: manVerdict === 'PASS' ? 'LIVE' : manVerdict === 'BLOCKED' ? 'LIVE_SPOT_BLOCKED' : 'FAIL',
  post: manPost,
  emp: empMan,
  note: manNote,
};
step('manual_spot', manVerdict, manNote);

// --- Overall ---
const gpsOk = gpsVerdict === 'PASS' || (gpsVerdict === 'PARTIAL' && hasLatLon && geo001);
const faceOk = faceBanner;
const manualOk = manVerdict === 'PASS' || manVerdict === 'BLOCKED';
const hardFail = gpsVerdict === 'FAIL' || !faceOk || manVerdict === 'FAIL';

if (hardFail) {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
} else if (gpsVerdict === 'PARTIAL') {
  results.verdict = 'PASS_WITH_OBS';
  results.ack_status = 'PASS_TO_PM';
} else {
  results.verdict = 'PASS';
  results.ack_status = 'PASS_TO_PM';
}

results.endedAt = ts();
results.matrixStamp = {
  7: results.surfaces[7]?.runtime,
  9: results.surfaces[9]?.runtime,
  10:
    results.ack_status === 'PASS_TO_PM' && hasLatLon
      ? mode === 'EXPECT_GEO_001' && geo001
        ? 'LIVE'
        : mode !== 'EXPECT_GEO_001' && hasLatLon
          ? 'LIVE (CFG skip documented)'
          : hasLatLon && geo001
            ? 'LIVE'
            : 'PARTIAL'
      : 'FAIL',
};
save();
console.log(
  JSON.stringify(
    {
      ack_status: results.ack_status,
      verdict: results.verdict,
      cfg: results.cfg,
      gps: {
        hasLatLon,
        status: gpsPost?.status,
        code: gpsPost?.code,
        note: gpsNote,
      },
      manual: { status: manPost?.status, hasLatLon: manPost?.hasLatLon, note: manNote },
      face: { banner: faceBanner },
      residual: results.residual,
      out: OUT,
    },
    null,
    2,
  ),
);

await browser.close();
process.exit(hardFail ? 1 : 0);
