#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-CLOCK-01 — U65 browser clock hub fidelity (surfaces 6–8, 10)
 * Persona: NV uat.nv0007 · companyId=trsport (prefer NV for clock; note GEO)
 * Forbidden: seed · claim Face LIVE · invent UAT DONE · duplicate SHEETS/OT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-clock-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-clock-01');
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
  work_item_id: 'PO-MFD-M2-ATT-CLOCK-01',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  hdsd_inventory: [],
  env: { PORTAL, HRM, NV_EMAIL, OU, commit: COMMIT },
  l0: {},
  steps: {},
  networkRecords: [],
  consoleErrors: [],
  pageErrors: [],
  surfaces: {
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
  },
  residual: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  screens: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
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

function attUrl() {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_clock=${Date.now()}`;
}

async function l0() {
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    results.l0[name] = { status: r?.status ?? 0, url };
  }
  const ok = results.l0.hrm?.status === 200 && results.l0.portal?.status === 200;
  step('l0', ok ? 'PASS' : 'FAIL', JSON.stringify(results.l0));
  return ok;
}

async function loginMobile(email) {
  for (const password of PASSWORDS) {
    const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.access_token ?? data?.accessToken;
    if (!token) continue;
    const mem = data.active_membership ?? data.memberships?.[0] ?? {};
    return {
      ok: true,
      token,
      passwordUsed: password === PASSWORDS[0] ? 'Xevn@2026' : 'xevn-uat-2026',
      expiresAt: Date.now() + 8 * 3600 * 1000,
      email,
      jwtOu: mem.company_id || OU,
      employeeId: mem.employee_id || null,
      employeeName: mem.employee_name || email,
      user: {
        userId: mem.employee_id || email,
        email,
        displayName: mem.employee_name || email,
        roles: data.roles || ['employee'],
      },
    };
  }
  return { ok: false, email };
}

async function injectPortalAuth(page, session, portalScope = OU) {
  await page.addInitScript(
    (s) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.portalScope);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.portalScope);
        store.setItem('hrm_current_tenant_id', 'xevn');
      }
    },
    { ...session, portalScope },
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err?.message || err).slice(0, 240));
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/attendance\/records/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        xCompanyId: res.request().headers()['x-company-id'] || null,
        at: ts(),
      };
      if (method === 'POST') {
        try {
          const body = res.request().postDataJSON?.() || JSON.parse(res.request().postData() || '{}');
          entry.bodyKeys = Object.keys(body || {});
          entry.hasLatLon = body?.latitude != null && body?.longitude != null;
          entry.latitude = body?.latitude ?? null;
          entry.longitude = body?.longitude ?? null;
          entry.employee_id = body?.employee_id ?? null;
        } catch {
          entry.bodyParse = false;
        }
        try {
          const j = await res.json();
          entry.code = j?.code || j?.error?.code || null;
          entry.message = String(j?.message || j?.error?.message || '').slice(0, 160);
        } catch {
          /* */
        }
      }
      results.networkRecords.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

async function pickFirstEmployee(page) {
  const trigger = page.locator('[data-testid="clock-in-panel-manual"] button[role="combobox"]').first();
  if ((await trigger.count()) === 0) {
    // fallback: any SelectTrigger in manual panel
    const alt = page.locator('[data-testid="clock-in-panel-manual"]').getByRole('combobox').first();
    if ((await alt.count()) === 0) return { picked: false, label: '' };
    await alt.click({ timeout: 8000 });
  } else {
    await trigger.click({ timeout: 8000 });
  }
  await sleep(600);
  const opt = page.locator('[role="option"]').first();
  if ((await opt.count()) === 0) return { picked: false, label: '' };
  const label = ((await opt.innerText().catch(() => '')) || '').trim();
  await opt.click();
  await sleep(800);
  return { picked: true, label: label.slice(0, 120) };
}

async function pickEmployeeInPanel(page, panelTestId) {
  const panel = page.locator(`[data-testid="${panelTestId}"]`);
  const combo = panel.getByRole('combobox').first();
  if ((await combo.count()) === 0) return { picked: false, label: '' };
  await combo.click({ timeout: 8000 });
  await sleep(600);
  const opt = page.locator('[role="option"]').first();
  if ((await opt.count()) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { picked: false, label: '' };
  }
  const label = ((await opt.innerText().catch(() => '')) || '').trim();
  await opt.click();
  await sleep(800);
  return { picked: true, label: label.slice(0, 120) };
}

async function main() {
  const okL0 = await l0();
  if (!okL0) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.residual.push({ id: 'R-MFD-M2-CLOCK-L0', owner: 'devops', note: 'L0 stack down' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginMobile(NV_EMAIL);
  step(
    'login',
    session.ok ? 'PASS' : 'FAIL',
    session.ok ? `jwtOu=${session.jwtOu} emp=${session.employeeId}` : 'mobile login failed',
    { passwordUsed: session.passwordUsed || null },
  );
  if (!session.ok) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.residual.push({ id: 'R-MFD-M2-CLOCK-AUTH', owner: 'devops', note: 'NV mobile login failed' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-geolocation', '--use-fake-ui-for-media-stream'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    geolocation: { latitude: 10.0, longitude: 10.0, accuracy: 12 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session, OU);

  // --- Open clock hub (HDSD: Chấm công → Vào/ra) ---
  await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  const tab = page.locator('[data-testid="attendance-tab-clock-in"]');
  if ((await tab.count()) > 0) {
    await tab.click({ timeout: 10_000 });
  } else {
    await page.getByRole('button', { name: /Chấm công/i }).first().click().catch(() => {});
  }
  await sleep(1500);
  let wizard = (await page.locator('[data-testid="clock-in-wizard"]').count()) > 0;
  if (!wizard) {
    await page.locator('[data-testid="attendance-tab-clock-in"]').click().catch(() => {});
    await sleep(1200);
    wizard = (await page.locator('[data-testid="clock-in-wizard"]').count()) > 0;
  }
  await shot(page, '01-clock-hub');

  const methodIds = ['manual', 'qrcode', 'faceid', 'gps'];
  const methodsPresent = {};
  for (const id of methodIds) {
    methodsPresent[id] = (await page.locator(`[data-testid="clock-in-method-${id}"]`).count()) > 0;
  }
  results.hdsd_inventory = [
    {
      surface: 6,
      menu_path: 'CC→HRM→Chấm công→Chấm công vào/ra (Clock-In hub)',
      testid: 'clock-in-wizard + clock-in-method-selector',
      present: wizard && methodsPresent.manual,
    },
    {
      surface: 7,
      menu_path: 'Clock-In→Thủ công',
      testid: 'clock-in-method-manual / clock-in-panel-manual',
      present: methodsPresent.manual,
    },
    {
      surface: 8,
      menu_path: 'Clock-In→QR',
      testid: 'clock-in-method-qrcode / clock-in-panel-qrcode',
      present: methodsPresent.qrcode,
    },
    {
      surface: 9,
      menu_path: 'Clock-In→Face ID',
      testid: 'clock-in-method-faceid / att-faceid-hold-banner',
      present: methodsPresent.faceid,
      note: 'GĐ2-HOLD — do not claim LIVE',
    },
    {
      surface: 10,
      menu_path: 'Clock-In→GPS',
      testid: 'clock-in-method-gps / clock-in-panel-gps',
      present: methodsPresent.gps,
    },
  ];
  step(
    'open_hub',
    wizard ? 'PASS' : 'FAIL',
    `wizard=${wizard} methods=${JSON.stringify(methodsPresent)}`,
  );
  results.surfaces[6] = {
    runtime: wizard ? 'LIVE' : 'BROKEN',
    note: 'Clock hub shell + method selector',
  };

  // --- Surface 7: Manual check-in ---
  await page.locator('[data-testid="clock-in-method-manual"]').click({ timeout: 10_000 });
  await sleep(1000);
  const manualPanel = (await page.locator('[data-testid="clock-in-panel-manual"]').count()) > 0;
  const empManual = await pickEmployeeInPanel(page, 'clock-in-panel-manual');
  await shot(page, '02-manual-panel');

  const checkInBtn = page
    .locator('[data-testid="clock-in-panel-manual"]')
    .getByRole('button', { name: /^Check-in$/i })
    .first();
  const checkInEnabled =
    (await checkInBtn.count()) > 0 && (await checkInBtn.isEnabled().catch(() => false));

  let manualPost = null;
  let feAfterManual = { checkInTimeVisible: false, toast: '', f5: null };
  const postsBeforeManual = results.networkRecords.filter((n) => n.method === 'POST').length;

  if (checkInEnabled && empManual.picked) {
    await checkInBtn.click();
    await sleep(800);
    const confirm = page.getByRole('button', { name: /Xác nhận|Confirm|checkinout\.confirmCheckin/i }).last();
    // Dialog confirm — match Vietnamese / common
    const dialogConfirm = page.locator('[role="dialog"]').getByRole('button').filter({
      hasNotText: /Hủy|Cancel|Đóng/i,
    });
    if ((await page.locator('[role="dialog"]').count()) > 0) {
      const btns = page.locator('[role="dialog"] button');
      const n = await btns.count();
      for (let i = 0; i < n; i++) {
        const t = ((await btns.nth(i).innerText().catch(() => '')) || '').trim();
        if (/Hủy|Cancel|Đóng/i.test(t)) continue;
        if (/Xác nhận|Confirm|Check-in|Vào/i.test(t) || i === n - 1) {
          await btns.nth(i).click().catch(() => {});
          break;
        }
      }
    } else if ((await confirm.count()) > 0) {
      await confirm.click().catch(() => {});
    }
    await sleep(2500);
    const posts = results.networkRecords.filter((n) => n.method === 'POST');
    manualPost = posts[posts.length - 1] || null;
    const toastBits = await page.locator('[data-sonner-toast], [role="status"], li.toast').allInnerTexts().catch(() => []);
    feAfterManual.toast = toastBits.join(' | ').slice(0, 240);
    const panelText = await page.locator('[data-testid="clock-in-panel-manual"]').innerText().catch(() => '');
    feAfterManual.checkInTimeVisible = /\d{1,2}:\d{2}/.test(panelText) && !/--:--/.test(panelText.split('\n').find((l) => /Check-in/i.test(l)) || '');

    if (manualPost && manualPost.status >= 200 && manualPost.status < 300) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2000);
      await page.locator('[data-testid="attendance-tab-clock-in"]').click().catch(() => {});
      await sleep(1000);
      await page.locator('[data-testid="clock-in-method-manual"]').click().catch(() => {});
      await sleep(800);
      const emp2 = await pickEmployeeInPanel(page, 'clock-in-panel-manual');
      await sleep(1200);
      const afterText = await page.locator('[data-testid="clock-in-panel-manual"]').innerText().catch(() => '');
      feAfterManual.f5 = {
        empRepicked: emp2.picked,
        textSnippet: afterText.slice(0, 400),
        stillHasCheckInTime: /\d{2}:\d{2}/.test(afterText),
      };
      await shot(page, '03-manual-after-f5');
    }
  } else {
    await shot(page, '02b-manual-cta-not-live');
  }

  const manualOk =
    manualPanel &&
    empManual.picked &&
    checkInEnabled &&
    manualPost &&
    manualPost.status >= 200 &&
    manualPost.status < 300;
  const manualPartial = manualPanel && (!empManual.picked || !checkInEnabled || !manualOk);
  results.surfaces[7] = {
    runtime: manualOk ? 'LIVE' : manualPanel ? 'PARTIAL' : 'BROKEN',
    employeePicked: empManual,
    checkInEnabled,
    post: manualPost,
    feAfter: feAfterManual,
    postsDelta: results.networkRecords.filter((n) => n.method === 'POST').length - postsBeforeManual,
  };
  step(
    'manual_checkin',
    manualOk ? 'PASS' : manualPartial ? 'PARTIAL' : 'FAIL',
    manualOk
      ? `POST ${manualPost.status} code=${manualPost.code || 'n/a'} F5=${JSON.stringify(feAfterManual.f5?.stillHasCheckInTime)}`
      : `panel=${manualPanel} emp=${empManual.picked} cta=${checkInEnabled} post=${manualPost?.status ?? 'none'}`,
  );

  // --- Surface 9: Face GĐ2-HOLD (document only — not LIVE) ---
  await page.locator('[data-testid="clock-in-method-faceid"]').click({ timeout: 10_000 });
  await sleep(1200);
  const faceBanner = (await page.locator('[data-testid="att-faceid-hold-banner"]').count()) > 0;
  const facePanel = (await page.locator('[data-testid="clock-in-panel-faceid"]').count()) > 0;
  const postsBeforeFace = results.networkRecords.filter((n) => n.method === 'POST').length;
  await shot(page, '04-face-hold');
  const facePosts =
    results.networkRecords.filter((n) => n.method === 'POST').length - postsBeforeFace;
  results.surfaces[9] = {
    runtime: 'GĐ2-HOLD',
    holdBanner: faceBanner,
    panel: facePanel,
    checkInPostCount: facePosts,
    note: 'Face = HOLD per backlog — not LIVE',
  };
  step(
    'face_hold',
    faceBanner && facePosts === 0 ? 'PASS' : 'FAIL',
    `banner=${faceBanner} posts=${facePosts}`,
  );

  // --- Surface 8: QR panel ---
  await page.locator('[data-testid="clock-in-method-qrcode"]').click({ timeout: 10_000 });
  await sleep(1500);
  const qrPanel = (await page.locator('[data-testid="clock-in-panel-qrcode"]').count()) > 0;
  const qrText = qrPanel
    ? await page.locator('[data-testid="clock-in-panel-qrcode"]').innerText().catch(() => '')
    : '';
  const qrHasScannerUi = /QR|Quét|camera|Mã QR/i.test(qrText);
  await shot(page, '05-qr-panel');
  // No fake QR payload — document panel LIVE shell vs mutate STUB/PARTIAL
  results.surfaces[8] = {
    runtime: qrPanel && qrHasScannerUi ? 'PARTIAL' : qrPanel ? 'PARTIAL' : 'BROKEN',
    panel: qrPanel,
    hasScannerCopy: qrHasScannerUi,
    note: 'QR shell present; camera scan mutate not exercised (no seed QR) — PARTIAL / UNMAPPED depth',
    mutateAttempted: false,
  };
  step('qr_panel', qrPanel ? 'PASS' : 'FAIL', `panel=${qrPanel} copy=${qrHasScannerUi}`);

  // --- Surface 10: GPS — mock far coords; expect GEO-001 if lat/lon sent, else document gap ---
  await page.locator('[data-testid="clock-in-method-gps"]').click({ timeout: 10_000 });
  await sleep(2000);
  const gpsPanel = (await page.locator('[data-testid="clock-in-panel-gps"]').count()) > 0;
  const gpsText = gpsPanel
    ? await page.locator('[data-testid="clock-in-panel-gps"]').innerText().catch(() => '')
    : '';
  const gpsShowsCoords = /10\.0|GPS:|latitude|Kinh độ|Vĩ độ/i.test(gpsText);
  const empGps = await pickEmployeeInPanel(page, 'clock-in-panel-gps');
  await shot(page, '06-gps-panel');

  const gpsCheckIn = page
    .locator('[data-testid="clock-in-panel-gps"]')
    .getByRole('button', { name: /Check-in|Chấm công|gpsAttendance\.checkIn/i })
    .first();
  // Often primary CTA may say Check-in after GPS ready
  let gpsCtaEnabled =
    (await gpsCheckIn.count()) > 0 && (await gpsCheckIn.isEnabled().catch(() => false));
  if (!gpsCtaEnabled) {
    const anyCta = page.locator('[data-testid="clock-in-panel-gps"] button').filter({
      hasText: /Check-in|Chấm vào|Vào ca/i,
    });
    gpsCtaEnabled = (await anyCta.count()) > 0 && (await anyCta.first().isEnabled().catch(() => false));
    if (gpsCtaEnabled) await anyCta.first().click().catch(() => {});
  } else {
    await gpsCheckIn.click().catch(() => {});
  }
  await sleep(1000);

  let gpsPost = null;
  let gpsDialogConfirmed = false;
  if ((await page.locator('[role="dialog"]').count()) > 0) {
    const btns = page.locator('[role="dialog"] button');
    const n = await btns.count();
    for (let i = 0; i < n; i++) {
      const t = ((await btns.nth(i).innerText().catch(() => '')) || '').trim();
      if (/Hủy|Cancel|Đóng|Check-out/i.test(t)) continue;
      if (/Xác nhận|Confirm|Check-in|Chấm/i.test(t) || i === n - 1) {
        await btns.nth(i).click().catch(() => {});
        gpsDialogConfirmed = true;
        break;
      }
    }
    await sleep(2500);
  }

  const gpsPosts = results.networkRecords.filter((n) => n.method === 'POST');
  // Prefer last POST after gps attempt
  gpsPost = gpsPosts.length ? gpsPosts[gpsPosts.length - 1] : null;
  // If manual already posted and gps didn't, detect by comparing hasLatLon / timing
  const gpsPostCandidate = [...gpsPosts].reverse().find((p) => p.hasLatLon === true) || null;

  const geoCode =
    gpsPostCandidate?.code === 'HRM-ATT-GEO-001' ||
    gpsPost?.code === 'HRM-ATT-GEO-001' ||
    /HRM-ATT-GEO-001|out of range|ngoài vùng/i.test(
      `${gpsPostCandidate?.message || ''} ${gpsPost?.message || ''}`,
    );
  const geoHttp =
    gpsPostCandidate?.status === 422 ||
    gpsPostCandidate?.status === 400 ||
    gpsPost?.status === 422 ||
    gpsPost?.status === 400;

  let gpsRuntime = 'PARTIAL';
  let gpsNote = '';
  if (!gpsPanel) {
    gpsRuntime = 'BROKEN';
    gpsNote = 'GPS panel missing';
  } else if (gpsPostCandidate?.hasLatLon && (geoCode || (geoHttp && geoCode))) {
    gpsRuntime = 'LIVE';
    gpsNote = `Geofence honest reject ${gpsPostCandidate.status} ${gpsPostCandidate.code}`;
  } else if (gpsPostCandidate?.hasLatLon && gpsPostCandidate.status >= 200 && gpsPostCandidate.status < 300) {
    gpsRuntime = 'LIVE';
    gpsNote = 'GPS check-in 2xx with lat/lon (inside or geofence off)';
  } else if (gpsPost && !gpsPost.hasLatLon && gpsPost.status >= 200 && gpsPost.status < 300) {
    gpsRuntime = 'PARTIAL';
    gpsNote =
      'GPS UI LIVE but POST /attendance/records omits latitude/longitude — geofence HRM-ATT-GEO-001 never fired (silent GEO bypass)';
    results.residual.push({
      id: 'R-MFD-M2-CLOCK-GPS-LATLON',
      owner: 'dev-fe',
      note: 'GPSAttendance/checkIn must pass latitude+longitude on createAttendanceRecord so BE assertWithinWorkSite can return HRM-ATT-GEO-001',
    });
  } else if (!empGps.picked || !gpsDialogConfirmed) {
    gpsRuntime = 'PARTIAL';
    gpsNote = `GPS panel shown; mutate incomplete emp=${empGps.picked} dialog=${gpsDialogConfirmed} cta=${gpsCtaEnabled}`;
  } else {
    gpsRuntime = 'PARTIAL';
    gpsNote = `GPS attempt post=${gpsPost?.status ?? 'none'} code=${gpsPost?.code ?? 'n/a'}`;
  }

  results.surfaces[10] = {
    runtime: gpsRuntime,
    panel: gpsPanel,
    showsCoords: gpsShowsCoords,
    employeePicked: empGps,
    ctaEnabled: gpsCtaEnabled,
    dialogConfirmed: gpsDialogConfirmed,
    post: gpsPost,
    postWithLatLon: gpsPostCandidate,
    geo001: geoCode,
    note: gpsNote,
    mockGeo: { latitude: 10.0, longitude: 10.0 },
  };
  await shot(page, '07-gps-after-attempt');
  step(
    'gps_checkin',
    gpsRuntime === 'LIVE' && (geoCode || (gpsPostCandidate?.status >= 200 && gpsPostCandidate?.status < 300))
      ? 'PASS'
      : gpsRuntime === 'PARTIAL'
        ? 'PARTIAL'
        : 'FAIL',
    gpsNote,
  );

  // --- Classify overall ---
  const hubOk = results.surfaces[6]?.runtime === 'LIVE';
  const faceOk = results.surfaces[9]?.runtime === 'GĐ2-HOLD' && faceBanner;
  const gpsLatLonGap = results.residual.some((r) => r.id === 'R-MFD-M2-CLOCK-GPS-LATLON');
  const manualFailHard = results.surfaces[7]?.runtime === 'BROKEN';

  if (!hubOk || manualFailHard) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    if (!hubOk) {
      results.residual.push({ id: 'R-MFD-M2-CLOCK-HUB', owner: 'dev-fe', note: 'Clock hub wizard missing' });
    }
  } else if (gpsLatLonGap || results.surfaces[7]?.runtime === 'PARTIAL') {
    // Fidelity gap on GEO path is FAIL per AC #4 (expect honest 422/GEO-001 or success — no silent fail)
    results.verdict = gpsLatLonGap ? 'FAIL' : 'PASS_WITH_OBS';
    results.ack_status = gpsLatLonGap ? 'FAIL' : 'PASS_TO_PM';
    if (results.surfaces[7]?.runtime === 'PARTIAL' && !manualOk) {
      results.residual.push({
        id: 'R-MFD-M2-CLOCK-MANUAL-CTA',
        owner: 'dev-fe',
        note: `Manual panel PARTIAL: emp=${empManual.picked} cta=${checkInEnabled} post=${manualPost?.status ?? 'none'}`,
      });
      results.ack_status = 'FAIL';
      results.verdict = 'FAIL';
    }
  } else {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  }

  // If manual LIVE and hub LIVE and face HOLD and only GPS lat/lon gap → FAIL (AC4)
  if (manualOk && hubOk && faceOk && gpsLatLonGap) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
  }

  // QR depth is OBS not hard fail when shell present
  if (results.surfaces[8]?.runtime === 'PARTIAL') {
    results.residual.push({
      id: 'R-MFD-M2-CLOCK-QR-DEPTH',
      owner: 'ba-process',
      note: 'QR clock mutate depth UNMAPPED/SPEC_GAP — shell PARTIAL; P1-10 backlog',
      severity: 'P1',
    });
  }

  results.endedAt = ts();
  results.consoleErrors = results.consoleErrors.slice(-30);
  results.pageErrors = results.pageErrors.slice(-20);
  save();
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    ack_status: results.ack_status,
    verdict: results.verdict,
    surfaces: results.surfaces,
    residual: results.residual,
    networkPosts: results.networkRecords.filter((n) => n.method === 'POST'),
  }, null, 2));

  await browser.close();
  process.exit(results.ack_status === 'PASS_TO_PM' || results.ack_status === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.verdict = 'BLOCKED';
  results.ack_status = 'BLOCKED';
  results.residual.push({ id: 'R-MFD-M2-CLOCK-SCRIPT', owner: 'qa', note: String(e?.message || e).slice(0, 200) });
  results.endedAt = ts();
  save();
  process.exit(2);
});
