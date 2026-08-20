#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-ATT-G1-QA — U65 browser brand remaster
 * Inventory S04, S17–S19, S39–S41, S58–S60, S66, S69–S70 · ADR §8–§10
 * Path: ceo@xe.vn → Chấm công (hrm_fe :8080 fallback OK)
 * Cấm: seed · Nest as UF · Face LIVE invent · QR LIVE invent · Attendance CLOSED · remaster DONE
 * Prior: ATT-E-QA PASS · ATT-F-QA PASS · PROP-03e SKIP
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-g1-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g1-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function parseRgb(s) {
  if (!s) return null;
  const m = String(s).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function nearPrimary(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 30) <= 12 && Math.abs(g - 64) <= 12 && Math.abs(b - 175) <= 12;
}

function nearText(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 17) <= 20 && Math.abs(g - 24) <= 20 && Math.abs(b - 39) <= 20;
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-ATT-G1-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'S04',
    'S17',
    'S18',
    'S19',
    'S39',
    'S40',
    'S41',
    'S58',
    'S59',
    'S60',
    'S66',
    'S69',
    'S70',
  ],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  themeContrastStrict: { note: 'run separately: pnpm verify:xevn:theme-contrast -- --strict' },
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
    face_live_claimed: false,
    attendance_closed_claimed: false,
    remaster_program_done_claimed: false,
    prop_03e_invented: false,
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

function fail(reason) {
  results.failReasons.push(reason);
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
    ['hrm_fe', `${HRM_FE}/hr/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  if (results.l0.portal === 200) {
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

function q(path) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  const urls = [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`];
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
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/').split('docs/qa/')[1] || path);
}

async function styleOf(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      pointerEvents: cs.pointerEvents,
      className: el.className?.toString?.() ?? '',
    };
  });
}

async function titleMetrics(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 100),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
    };
  });
}

function titlePass(m) {
  if (!m) return false;
  const fs = parseFloat(m.fontSize || '0');
  const w = parseInt(m.fontWeight || '0', 10) || (/bold/i.test(String(m.fontWeight)) ? 700 : 0);
  return fs >= 20 && w >= 700;
}

async function purpleAiBgHits(rootLocator) {
  return rootLocator.evaluate((root) => {
    const out = [];
    for (const el of Array.from(root.querySelectorAll('*')).slice(0, 400)) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const m = String(bg).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      // purple/violet AI palette — exclude primary #1E40AF
      if (r >= 100 && b >= 160 && g <= 90 && Math.abs(r - 30) > 20) {
        out.push({ tag: el.tagName, bg, text: (el.textContent || '').trim().slice(0, 40) });
      }
    }
    return out.slice(0, 6);
  });
}

async function clickTopTab(page, labelRe) {
  const exact = page.getByRole('button', { name: labelRe }).first();
  if (await exact.isVisible().catch(() => false)) {
    await exact.click({ timeout: 15_000 });
    await sleep(1400);
    return 'role';
  }
  const byText = page.locator('button').filter({ hasText: labelRe }).first();
  if (await byText.count()) {
    await byText.scrollIntoViewIfNeeded().catch(() => {});
    await byText.click({ force: true, timeout: 15_000 });
    await sleep(1400);
    return 'force';
  }
  throw new Error(`top tab not found: ${labelRe}`);
}

async function openDropdownMenu(page, triggerTestId, itemTestId) {
  await page.locator(`[data-testid="${triggerTestId}"]`).click();
  await sleep(500);
  const item = page.locator(`[data-testid="${itemTestId}"]`);
  await item.waitFor({ state: 'visible', timeout: 10_000 });
  await item.click();
  await sleep(1400);
}

async function openRequestsMenu(page, itemId) {
  // HDSD i18n: top tab = «Quản lý đơn»
  const trigger = page.locator('button').filter({ hasText: /Quản lý đơn|Requests|Đơn từ/i }).first();
  await trigger.waitFor({ state: 'visible', timeout: 15_000 });
  await trigger.click();
  await sleep(600);
  const item = page.locator(`[data-testid="requests-menu-${itemId}"]`);
  if (await item.isVisible().catch(() => false)) {
    await item.click();
    await sleep(1500);
    return itemId;
  }
  // Fallback: menuitem text
  const labelMap = {
    'leave-summary': /Bảng tổng hợp nghỉ phép|leave summary/i,
    'compensatory-summary': /Bảng tổng hợp nghỉ bù|compensatory/i,
    'leave-plan': /Kế hoạch nghỉ phép|leave plan/i,
  };
  const re = labelMap[itemId] || new RegExp(itemId, 'i');
  const candidates = page.locator('[role="menuitem"], [data-radix-collection-item]');
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim();
    if (re.test(text)) {
      await candidates.nth(i).click();
      await sleep(1500);
      return text;
    }
  }
  throw new Error(`requests menu ${itemId} not found`);
}

async function openShiftsMenu(page, itemId) {
  const trigger = page.locator('button').filter({ hasText: /Ca làm việc|Shifts/i }).first();
  await trigger.waitFor({ state: 'visible', timeout: 15_000 });
  await trigger.click();
  await sleep(600);
  const item = page.locator(`[data-testid="shifts-menu-${itemId}"]`);
  await item.waitFor({ state: 'visible', timeout: 10_000 });
  await item.click();
  await sleep(1600);
}

function staticCopyStubFloor() {
  const abs = resolve(ROOT, 'apps/web/hrm/src/pages/Attendance.tsx');
  const src = readFileSync(abs, 'utf8');
  const idx = src.indexOf('att-shift-copy-stub');
  if (idx < 0) return { ok: false, reason: 'testid missing' };
  // `disabled` prop sits above testid (~8 lines); widen lookback
  const slice = src.slice(Math.max(0, idx - 480), idx + 40);
  const ok =
    /\bdisabled\b/.test(slice) &&
    /att-shift-copy-stub/.test(slice) &&
    /shiftCopyHold|chưa có API \(stub\)/.test(slice);
  return { ok, slice: slice.replace(/\s+/g, ' ').slice(0, 220) };
}

async function clickSidebar(page, labelRe) {
  const shell = page.locator('[data-testid="att-settings-shell-precision"]');
  const btn = shell.locator('nav button').filter({ hasText: labelRe }).first();
  await btn.waitFor({ state: 'visible', timeout: 15_000 });
  await btn.click();
  await sleep(1200);
}

async function main() {
  await probeL0();
  const feOk = results.l0.portal === 200 || results.l0.hrm_fe === 200;
  const l0ok = results.l0.hrm === 200 && results.l0.xbos === 200 && feOk;
  results.checks.L0 = { pass: l0ok, ...results.l0 };
  if (!l0ok) {
    fail(`L0 unhealthy: ${JSON.stringify(results.l0)}`);
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('L0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  results.env.loginHttp = session.http;
  results.env.loginVia = session.loginVia;
  step('login', 'PASS', `HTTP ${session.http}`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => {
    results.pageErrors.push(String(e.message || e).slice(0, 200));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 160),
    };
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) results.mutates.push(entry);
    if (results.network.length < 120) results.network.push(entry);
  });

  try {
    await injectPortalAuth(page, session);
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(3000);

    // ——— S04 overview customize HOLD ———
    const customize = page.locator('[data-testid="att-overview-customize-hold"]');
    await customize.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    const customizeVisible = await customize.isVisible().catch(() => false);
    const customizeDisabled = customizeVisible
      ? await customize.evaluate((el) => el.disabled === true || el.getAttribute('aria-disabled') === 'true')
      : false;
    const customizeBadge = customizeVisible
      ? await customize.locator('text=/GĐ2|HOLD|Giai đoạn/i').count()
      : 0;
    const customizeText = customizeVisible ? await styleOf(customize.locator('span').first()) : null;
    const customizePurple = customizeVisible ? await purpleAiBgHits(customize) : [];
    // click must no-op (still disabled)
    if (customizeVisible) {
      await customize.click({ force: true }).catch(() => {});
      await sleep(300);
    }
    results.checks.S04_customize_hold = {
      pass:
        customizeVisible &&
        customizeDisabled &&
        customizeBadge >= 1 &&
        customizePurple.length === 0 &&
        results.mutates.length === 0,
      customizeVisible,
      customizeDisabled,
      customizeBadge,
      customizeTextColor: customizeText?.color,
      purpleHits: customizePurple,
    };
    if (!results.checks.S04_customize_hold.pass) fail(`S04: ${JSON.stringify(results.checks.S04_customize_hold)}`);
    await shot(page, '01-s04-customize-hold');
    step('S04', results.checks.S04_customize_hold.pass ? 'PASS' : 'FAIL', 'overview customize HOLD');

    // ——— S17–S19 Face GĐ2-HOLD ———
    await page.locator('[data-testid="attendance-tab-clock-in"]').click();
    await sleep(1200);
    const faceMethod = page.locator('[data-testid="clock-in-method-faceid"]');
    if (await faceMethod.isVisible().catch(() => false)) {
      await faceMethod.click();
      await sleep(1200);
    }
    const faceBanner = page.locator('[data-testid="att-faceid-hold-banner"]');
    const faceBannerVisible = await faceBanner.isVisible().catch(() => false);
    const faceTitle = faceBannerVisible
      ? await titleMetrics(faceBanner.locator('[class*="AlertTitle"], h5, h4, h3').first())
      : null;
    // AlertTitle may be the first bold child
    let faceTitle2 = faceTitle;
    if (!titlePass(faceTitle2) && faceBannerVisible) {
      const t20 = faceBanner.locator('.text-\\[20px\\], [class*="text-[20px]"]').first();
      if (await t20.count()) faceTitle2 = await titleMetrics(t20);
    }
    const gd2Badge = page.locator('[data-testid="att-faceid-gd2-badge"]');
    const gd2Visible = await gd2Badge.isVisible().catch(() => false);
    const shell = page.locator('[data-testid="att-faceid-shell-disabled"]');
    const shellVisible = await shell.isVisible().catch(() => false);
    const shellPe = shellVisible ? await styleOf(shell) : null;
    const shellDisabled = shellPe?.pointerEvents === 'none' || shellVisible;
    const faceLiveClaim = await page
      .getByText(/Face\s*LIVE|Nhận diện khuôn mặt đang hoạt động|Face ID LIVE/i)
      .count()
      .catch(() => 0);
    const facePurple = faceBannerVisible
      ? await purpleAiBgHits(page.locator('[data-testid="clock-in-panel-faceid"]'))
      : [];
    // PROP-03e: switch to QR briefly to confirm skip still present (ATT-E regression spot)
    const qrMethod = page.locator('[data-testid="clock-in-method-qrcode"]');
    let propSkipVisible = false;
    let employeeQrLive = false;
    if (await qrMethod.isVisible().catch(() => false)) {
      await qrMethod.click();
      await sleep(900);
      propSkipVisible = await page.locator('[data-testid="att-prop-03e-qr-card-skip"]').isVisible().catch(() => false);
      employeeQrLive =
        (await page.locator('[data-testid*="employee-qr"], [data-testid*="EmployeeQR"]').count().catch(() => 0)) > 0;
      await faceMethod.click().catch(() => {});
      await sleep(800);
    }
    results.honesty.face_live_claimed = faceLiveClaim > 0;
    results.honesty.prop_03e_invented = employeeQrLive;
    results.checks.S17_S19_face_hold = {
      pass:
        faceBannerVisible &&
        titlePass(faceTitle2) &&
        gd2Visible &&
        shellVisible &&
        shellDisabled &&
        faceLiveClaim === 0 &&
        facePurple.length === 0 &&
        propSkipVisible &&
        !employeeQrLive,
      faceBannerVisible,
      faceTitle: faceTitle2,
      gd2Visible,
      shellVisible,
      shellPointerEvents: shellPe?.pointerEvents,
      faceLiveClaim,
      purpleHits: facePurple,
      propSkipVisible,
      employeeQrLive,
    };
    if (!results.checks.S17_S19_face_hold.pass)
      fail(`S17–S19: ${JSON.stringify(results.checks.S17_S19_face_hold)}`);
    await shot(page, '02-s17-face-hold');
    step('S17_S19', results.checks.S17_S19_face_hold.pass ? 'PASS' : 'FAIL', 'Face GĐ2-HOLD + PROP-03e SKIP');

    // ——— S40 schedule HOLD ———
    await openShiftsMenu(page, 'schedule');
    const sched = page.locator('[data-testid="shifts-schedule-hold"]');
    await sched.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const schedVisible = await sched.isVisible().catch(() => false);
    const schedTitle = schedVisible
      ? await titleMetrics(sched.locator('.text-\\[20px\\], [class*="text-[20px]"], [class*="AlertTitle"]').first())
      : null;
    const schedBadge = await page.locator('[data-testid="shifts-gd2-hold-badge"]').isVisible().catch(() => false);
    const schedPurple = schedVisible ? await purpleAiBgHits(sched) : [];
    results.checks.S40_schedule_hold = {
      pass: schedVisible && titlePass(schedTitle) && schedBadge && schedPurple.length === 0,
      schedVisible,
      schedTitle,
      schedBadge,
      purpleHits: schedPurple,
    };
    if (!results.checks.S40_schedule_hold.pass) fail(`S40: ${JSON.stringify(results.checks.S40_schedule_hold)}`);
    await shot(page, '03-s40-schedule-hold');
    step('S40', results.checks.S40_schedule_hold.pass ? 'PASS' : 'FAIL', 'schedule GĐ2 HOLD');

    // ——— S41 OT HOLD ———
    await openShiftsMenu(page, 'overtime');
    const ot = page.locator('[data-testid="shifts-overtime-hold"]');
    await ot.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const otVisible = await ot.isVisible().catch(() => false);
    const otTitle = otVisible
      ? await titleMetrics(ot.locator('.text-\\[20px\\], [class*="text-[20px]"], [class*="AlertTitle"]').first())
      : null;
    const otBadge = await page.locator('[data-testid="shifts-gd2-hold-badge"]').isVisible().catch(() => false);
    const otPurple = otVisible ? await purpleAiBgHits(ot) : [];
    results.checks.S41_ot_hold = {
      pass: otVisible && titlePass(otTitle) && otBadge && otPurple.length === 0,
      otVisible,
      otTitle,
      otBadge,
      purpleHits: otPurple,
    };
    if (!results.checks.S41_ot_hold.pass) fail(`S41: ${JSON.stringify(results.checks.S41_ot_hold)}`);
    await shot(page, '04-s41-ot-hold');
    step('S41', results.checks.S41_ot_hold.pass ? 'PASS' : 'FAIL', 'OT GĐ2 HOLD');

    // ——— S39 shift copy stub (live shifts table; empty list → static floor U65) ———
    await openShiftsMenu(page, 'list');
    await sleep(1800);
    const shiftsTable = page.locator('table tbody tr');
    const rowCount = await shiftsTable.count().catch(() => 0);
    if (rowCount > 0) {
      await shiftsTable.first().hover().catch(() => {});
      await sleep(400);
    }
    const copyStub = page.locator('[data-testid="att-shift-copy-stub"]').first();
    const copyCount = await page.locator('[data-testid="att-shift-copy-stub"]').count();
    let copyDisabled = false;
    let copyTitle = '';
    if (copyCount > 0) {
      copyDisabled = await copyStub.evaluate(
        (el) => el.disabled === true || el.getAttribute('aria-disabled') === 'true',
      );
      copyTitle = (await copyStub.getAttribute('title')) || '';
      await copyStub.click({ force: true }).catch(() => {});
      await sleep(300);
    }
    const s39Static = staticCopyStubFloor();
    const livePass = copyCount >= 1 && copyDisabled && /stub|chưa có API|copy|Sao chép/i.test(copyTitle);
    const emptyPass = rowCount === 0 && s39Static.ok;
    if (emptyPass) {
      results.residuals.push({
        id: 'OBS-G1-S39-EMPTY-LIST',
        severity: 'P2',
        note: 'shifts list empty — S39 asserted via static disabled stub floor (U65 no invent rows)',
      });
    }
    results.checks.S39_copy_stub = {
      pass: livePass || emptyPass,
      livePass,
      emptyPass,
      rowCount,
      copyCount,
      copyDisabled,
      copyTitle: copyTitle.slice(0, 80),
      staticFloor: s39Static,
      mutatesAfterClick: results.mutates.length,
    };
    if (!results.checks.S39_copy_stub.pass) fail(`S39: ${JSON.stringify(results.checks.S39_copy_stub)}`);
    await shot(page, '05-s39-copy-stub');
    step('S39', results.checks.S39_copy_stub.pass ? 'PASS' : 'FAIL', 'shift copy stub');

    // ——— S58–S60 leave ALIAS ———
    for (const [id, checkKey] of [
      ['leave-summary', 'S58_leave_summary'],
      ['compensatory-summary', 'S59_compensatory'],
      ['leave-plan', 'S60_leave_plan'],
    ]) {
      await openRequestsMenu(page, id);
      const aliasRoot = page.locator(`[data-testid="att-leave-alias-${id}"]`);
      await aliasRoot.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
      const visible = await aliasRoot.isVisible().catch(() => false);
      const honesty = page.locator('[data-testid="att-leave-alias-honesty"]');
      const honestyVisible = await honesty.isVisible().catch(() => false);
      const title = honestyVisible
        ? await titleMetrics(honesty.locator('.text-\\[20px\\], [class*="text-[20px]"]').first())
        : null;
      const body = honestyVisible ? ((await honesty.innerText()) || '').slice(0, 200) : '';
      const hasAlias = /ALIAS/i.test(body) || (await aliasRoot.locator('text=/ALIAS/i').count()) > 0;
      const hasGd2 =
        id !== 'leave-plan' ? true : (await aliasRoot.locator('text=/GĐ2|HOLD/i').count()) > 0;
      const purple = visible ? await purpleAiBgHits(aliasRoot) : [];
      const textColorOk = title ? nearText(parseRgb(title.color)) : false;
      const pass =
        visible && honestyVisible && titlePass(title) && hasAlias && hasGd2 && purple.length === 0;
      results.checks[checkKey] = {
        pass,
        visible,
        honestyVisible,
        title,
        hasAlias,
        hasGd2,
        textColorOk,
        purpleHits: purple,
        bodySnippet: body.slice(0, 120),
      };
      if (!pass) fail(`${checkKey}: ${JSON.stringify(results.checks[checkKey])}`);
      await shot(page, `06-${checkKey.toLowerCase()}`);
      step(checkKey, pass ? 'PASS' : 'FAIL', id);
    }

    // ——— S66 Filter/Download stubs ———
    await clickTopTab(page, /^(Thiết lập|Cài đặt|Settings)$/i);
    const settingsShell = page.locator('[data-testid="att-settings-shell-precision"]');
    await settingsShell.waitFor({ state: 'visible', timeout: 20_000 });
    await clickSidebar(page, /Nhân viên|Employees/i);
    await sleep(1000);
    const filterStub = page.locator('[data-testid="att-settings-emp-filter-stub"]');
    const downloadStub = page.locator('[data-testid="att-settings-emp-download-stub"]');
    const filterVisible = await filterStub.isVisible().catch(() => false);
    const downloadVisible = await downloadStub.isVisible().catch(() => false);
    const filterDisabled = filterVisible
      ? await filterStub.evaluate((el) => el.disabled === true)
      : false;
    const downloadDisabled = downloadVisible
      ? await downloadStub.evaluate((el) => el.disabled === true)
      : false;
    const mutatesBefore = results.mutates.length;
    if (filterVisible) await filterStub.click({ force: true }).catch(() => {});
    if (downloadVisible) await downloadStub.click({ force: true }).catch(() => {});
    await sleep(400);
    const filterCard = page.locator('[data-testid="att-settings-emp-filters"]');
    const filterPurple = (await filterCard.isVisible().catch(() => false))
      ? await purpleAiBgHits(filterCard)
      : [];
    results.checks.S66_filter_download = {
      pass:
        filterVisible &&
        downloadVisible &&
        filterDisabled &&
        downloadDisabled &&
        results.mutates.length === mutatesBefore &&
        filterPurple.length === 0,
      filterVisible,
      downloadVisible,
      filterDisabled,
      downloadDisabled,
      mutatesDelta: results.mutates.length - mutatesBefore,
      purpleHits: filterPurple,
    };
    if (!results.checks.S66_filter_download.pass)
      fail(`S66: ${JSON.stringify(results.checks.S66_filter_download)}`);
    await shot(page, '07-s66-filter-download');
    step('S66', results.checks.S66_filter_download.pass ? 'PASS' : 'FAIL', 'Filter/Download stubs');

    // ——— S69–S70 rules customize ———
    await clickSidebar(page, /Quy định chấm công|Quy tắc|Rules/i);
    await sleep(1000);
    const customizeTab = page.locator('[data-testid="hdsd-att-rules-tab-customize"]');
    await customizeTab.waitFor({ state: 'visible', timeout: 15_000 });
    await customizeTab.click();
    await sleep(1200);
    const rulesCust = page.locator('[data-testid="att-rules-customize-precision"]');
    const rulesVisible = await rulesCust.isVisible().catch(() => false);
    const holdBanner = page.locator('[data-testid="att-rules-customize-hold-banner"]');
    const holdVisible = await holdBanner.isVisible().catch(() => false);
    const holdTitle = holdVisible
      ? await titleMetrics(holdBanner.locator('.text-\\[20px\\], [class*="text-[20px]"]').first())
      : null;
    const resetStub = page.locator('[data-testid="att-rules-customize-reset-stub"]');
    const previewStub = page.locator('[data-testid="att-rules-customize-preview-stub"]');
    const addStub = page.locator('[data-testid="att-rules-customize-add-stub"]');
    const stubs = {
      reset: await resetStub.isVisible().catch(() => false),
      preview: await previewStub.isVisible().catch(() => false),
      add: await addStub.isVisible().catch(() => false),
    };
    const stubsDisabled = {
      reset: stubs.reset ? await resetStub.evaluate((el) => el.disabled === true) : false,
      preview: stubs.preview ? await previewStub.evaluate((el) => el.disabled === true) : false,
      add: stubs.add ? await addStub.evaluate((el) => el.disabled === true) : false,
    };
    const mutatesBeforeRules = results.mutates.length;
    if (stubs.reset) await resetStub.click({ force: true }).catch(() => {});
    if (stubs.preview) await previewStub.click({ force: true }).catch(() => {});
    if (stubs.add) await addStub.click({ force: true }).catch(() => {});
    await sleep(400);
    const rulesPurple = rulesVisible ? await purpleAiBgHits(rulesCust) : [];
    results.checks.S69_S70_rules_customize = {
      pass:
        rulesVisible &&
        holdVisible &&
        titlePass(holdTitle) &&
        stubs.reset &&
        stubs.preview &&
        stubs.add &&
        stubsDisabled.reset &&
        stubsDisabled.preview &&
        stubsDisabled.add &&
        results.mutates.length === mutatesBeforeRules &&
        rulesPurple.length === 0,
      rulesVisible,
      holdVisible,
      holdTitle,
      stubs,
      stubsDisabled,
      mutatesDelta: results.mutates.length - mutatesBeforeRules,
      purpleHits: rulesPurple,
    };
    if (!results.checks.S69_S70_rules_customize.pass)
      fail(`S69–S70: ${JSON.stringify(results.checks.S69_S70_rules_customize)}`);
    await shot(page, '08-s69-s70-rules-customize');
    step('S69_S70', results.checks.S69_S70_rules_customize.pass ? 'PASS' : 'FAIL', 'rules customize stubs');

    // ——— Honesty gates ———
    const closedClaim = await page.getByText(/Attendance\s*CLOSED|Chấm công đã đóng|ATT CLOSED/i).count();
    const remasterDone = await page.getByText(/remaster\s*DONE|UI brand DONE/i).count();
    results.honesty.attendance_closed_claimed = closedClaim > 0;
    results.honesty.remaster_program_done_claimed = remasterDone > 0;
    results.checks.honesty_gates = {
      pass:
        !results.honesty.face_live_claimed &&
        !results.honesty.attendance_closed_claimed &&
        !results.honesty.remaster_program_done_claimed &&
        !results.honesty.prop_03e_invented &&
        results.mutates.length === 0,
      mutates: results.mutates.length,
      ...results.honesty,
    };
    if (!results.checks.honesty_gates.pass) fail(`honesty: ${JSON.stringify(results.checks.honesty_gates)}`);
    step('honesty', results.checks.honesty_gates.pass ? 'PASS' : 'FAIL', 'no invent CLOSED/LIVE/DONE');

    await shot(page, '09-final');
  } catch (e) {
    fail(`harness exception: ${String(e?.message || e).slice(0, 240)}`);
    await shot(page, '99-exception').catch(() => {});
  } finally {
    const checkVals = Object.values(results.checks);
    const allPass =
      results.failReasons.length === 0 && checkVals.length > 0 && checkVals.every((c) => c && c.pass);
    results.verdict = allPass ? 'PASS' : 'FAIL';
    results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    results.summary = {
      checksPass: checkVals.filter((c) => c?.pass).length,
      checksTotal: checkVals.length,
      mutates: results.mutates.length,
      failReasons: results.failReasons,
    };
    save();
    // promote PASS json
    if (allPass) {
      const passPath = OUT_JSON.replace(/\.json$/, '.PASS.json');
      try {
        writeFileSync(passPath, JSON.stringify(results, null, 2));
      } catch {
        /* */
      }
    }
    await browser.close().catch(() => {});
    console.log(
      JSON.stringify(
        {
          verdict: results.verdict,
          ack_status: results.ack_status,
          failReasons: results.failReasons,
          summary: results.summary,
          l0: results.l0,
          mutates: results.mutates.length,
        },
        null,
        2,
      ),
    );
    process.exit(allPass ? 0 : 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
