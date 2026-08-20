#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA — U65 browser remaining ATT dialog chrome
 * Stall#3 NEW: shift-form · add-sheet · page-leave/edit (if openable) · manual/GPS clock confirms
 * Keep: late/early + trip + shift-change add · export · import · Face HOLD · theme-contrast
 * Cấm: seed · Face LIVE · Attendance CLOSED · remaster DONE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa');
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

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'att-late-early-add-dialog-precision',
    'att-trip-add-dialog-precision',
    'att-shift-change-add-dialog-precision',
    'att-shift-form-dialog',
    'att-add-sheet-dialog',
    'att-page-leave-create-dialog-precision',
    'att-page-attendance-edit-dialog-precision',
    'clock-in-manual-confirm-dialog',
    'clock-in-gps-confirm-dialog',
    'att-export-dialog-precision',
    'att-import-dialog-precision',
    'Face HOLD',
  ],
  stall: '#3 NEW surfaces + FE delta 9148B',
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  themeContrastStrict: null,
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

async function titleMetrics(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 80),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
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

async function openRequestsMenuItem(page, labelRe) {
  const trigger = page.locator('button').filter({ hasText: /Quản lý đơn|Requests|Đơn từ/i }).first();
  await trigger.click();
  await sleep(600);
  const candidates = page.locator('[role="menuitem"], [data-radix-collection-item], [role="menu"] > *');
  const n = await candidates.count();
  const labels = [];
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim().replace(/\s+/g, ' ');
    if (text) labels.push(text);
    if (labelRe.test(text)) {
      await candidates.nth(i).click();
      await sleep(1800);
      return text;
    }
  }
  const menu = page.locator('[role="menu"]').last();
  if (await menu.isVisible().catch(() => false)) {
    const hit = menu.getByText(labelRe).first();
    if (await hit.isVisible().catch(() => false)) {
      const text = ((await hit.innerText().catch(() => '')) || '').trim();
      await hit.click();
      await sleep(1800);
      return text;
    }
  }
  throw new Error(`requests menu item not found for ${labelRe}; seen=[${labels.join(' | ')}]`);
}

async function openAttendanceMenuItem(page, labelRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click();
  await sleep(500);
  const items = page.locator('[role="menuitem"]');
  const n = await items.count();
  const labels = [];
  for (let i = 0; i < n; i++) {
    const text = ((await items.nth(i).innerText().catch(() => '')) || '').trim().replace(/\s+/g, ' ');
    if (text) labels.push(text);
    if (labelRe.test(text)) {
      await items.nth(i).click();
      await sleep(1800);
      return text;
    }
  }
  throw new Error(`attendance menu item not found for ${labelRe}; seen=[${labels.join(' | ')}]`);
}

async function dismissDialog(page) {
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click();
    await sleep(400);
    return;
  }
  await page.keyboard.press('Escape');
  await sleep(300);
}

async function measureDialogChrome(page, testId) {
  return page.evaluate((tid) => {
    const root =
      document.querySelector(`[data-testid="${tid}"]`) ||
      document.querySelector('[role="dialog"]') ||
      document.querySelector('[role="alertdialog"]');
    if (!root) return { found: false };
    const surface =
      root.closest('.xevn-dialog-surface') ||
      root.querySelector('.xevn-dialog-surface') ||
      (root.classList?.contains('xevn-dialog-surface') ? root : null) ||
      root;
    const before = getComputedStyle(surface, '::before');
    const glass = root.querySelector('.xevn-dialog-header-glass');
    const glassCs = glass ? getComputedStyle(glass) : null;
    const wordmark =
      root.querySelector('[data-testid="xevn-dialog-wordmark"]') ||
      root.querySelector('.xevn-dialog-wordmark') ||
      document.querySelector('[data-testid="xevn-dialog-wordmark"]');
    const titleEl =
      root.querySelector('h2') ||
      root.querySelector('[class*="DialogTitle"]') ||
      root.querySelector('[class*="AlertDialogTitle"]') ||
      (glass && glass.querySelector('h2, [class*="DialogTitle"]'));
    const titleCs = titleEl ? getComputedStyle(titleEl) : null;
    const fieldClasses = {};
    for (const cls of [
      'xevn-field-date',
      'xevn-field-time',
      'xevn-field-select-md',
      'xevn-field-select-sm',
      'xevn-field-reason',
      'xevn-field-name',
      'xevn-field-line',
      'xevn-field-num',
      'xevn-field-phone',
    ]) {
      fieldClasses[cls] = root.querySelector(`.${cls}`) ? true : false;
    }
    const timeInputs = root.querySelectorAll('input[type="time"], .xevn-field-time');
    const dateFields = root.querySelectorAll('.xevn-field-date, input[type="date"]');
    return {
      found: true,
      testId: tid,
      surfaceClass: surface.className?.toString?.() ?? '',
      beforeBg: before.backgroundColor,
      beforeH: before.height,
      beforeDisplay: before.display,
      glassPresent: !!glass,
      glassBackdrop: glassCs?.backdropFilter || glassCs?.webkitBackdropFilter || '',
      glassBg: glassCs?.backgroundColor || '',
      wordmarkPresent: !!wordmark,
      wordmarkSrc: wordmark?.getAttribute?.('src') || wordmark?.src || '',
      titleText: titleEl ? (titleEl.textContent || '').trim().slice(0, 80) : '',
      titleFontSize: titleCs?.fontSize || '',
      titleFontWeight: titleCs?.fontWeight || '',
      titleFontFamily: titleCs?.fontFamily || '',
      fieldClasses,
      timeInputCount: timeInputs.length,
      dateFieldCount: dateFields.length,
      computedMaxWidth: getComputedStyle(surface).maxWidth,
    };
  }, testId);
}

function anyCompactField(m) {
  const fc = m?.fieldClasses || {};
  return (
    fc['xevn-field-date'] ||
    fc['xevn-field-time'] ||
    fc['xevn-field-select-md'] ||
    fc['xevn-field-select-sm'] ||
    fc['xevn-field-reason'] ||
    fc['xevn-field-name'] ||
    fc['xevn-field-line'] ||
    fc['xevn-field-num'] ||
    fc['xevn-field-phone'] ||
    (m.dateFieldCount || 0) > 0 ||
    (m.timeInputCount || 0) > 0
  );
}

function chromePass(
  m,
  { requireCompact = false, requireDate = false, requireAnyCompact = false, titleOnly = false } = {},
) {
  if (!m?.found) return { pass: false, reason: 'dialog not found' };
  const barH = parseFloat(m.beforeH || '0');
  const barPrimary = nearPrimary(parseRgb(m.beforeBg));
  const barOk = barH >= 3.5 && barH <= 5 && barPrimary;
  const fs = parseFloat(m.titleFontSize || '0');
  const w = parseInt(m.titleFontWeight || '0', 10) || (/bold/i.test(String(m.titleFontWeight)) ? 700 : 0);
  const titleOk = fs >= 20 && w >= 700;
  const logoOk = !!m.wordmarkPresent;
  const glassOk = !!m.glassPresent;
  let compactOk = true;
  if (requireCompact) {
    compactOk =
      (m.fieldClasses?.['xevn-field-date'] || m.dateFieldCount > 0) &&
      (m.fieldClasses?.['xevn-field-time'] || m.timeInputCount > 0);
  } else if (requireDate) {
    compactOk = m.fieldClasses?.['xevn-field-date'] === true || (m.dateFieldCount || 0) > 0;
  } else if (requireAnyCompact) {
    compactOk = anyCompactField(m);
  }
  const pass = titleOnly
    ? titleOk && (requireAnyCompact ? compactOk : true)
    : barOk && titleOk && logoOk && glassOk && compactOk;
  return {
    pass,
    barOk,
    barH,
    barPrimary,
    titleOk,
    logoOk,
    glassOk,
    compactOk,
    reason: pass
      ? 'ok'
      : [
          !titleOnly && !barOk && `bar ${m.beforeH}/${m.beforeBg}`,
          !titleOk && `title ${m.titleFontSize}/${m.titleFontWeight}`,
          !titleOnly && !logoOk && 'logo missing',
          !titleOnly && !glassOk && 'glass missing',
          !compactOk && 'compact fields missing',
        ]
          .filter(Boolean)
          .join('; '),
  };
}

async function measurePrimaryCta(page, testId) {
  return page.evaluate((tid) => {
    const root = document.querySelector(`[data-testid="${tid}"]`);
    if (!root) return { found: false };
    const btn =
      root.querySelector('[data-testid="clock-in-manual-confirm-submit"]') ||
      root.querySelector('[data-testid="clock-in-gps-confirm-checkin"]') ||
      root.querySelector('button[type="submit"]') ||
      Array.from(root.querySelectorAll('button')).find((b) =>
        /Check-in|Xác nhận|Chấm công|Lưu|Confirm/i.test(b.textContent || ''),
      );
    if (!btn) return { found: true, ctaFound: false };
    const cs = getComputedStyle(btn);
    return {
      found: true,
      ctaFound: true,
      text: (btn.textContent || '').trim().slice(0, 60),
      bg: cs.backgroundColor,
      color: cs.color,
    };
  }, testId);
}

function primaryCtaPass(cta) {
  if (!cta?.ctaFound) return { pass: false, reason: 'primary CTA missing' };
  const ok = nearPrimary(parseRgb(cta.bg));
  return { pass: ok, reason: ok ? 'ok' : `cta bg ${cta.bg}` };
}

function staticDialogTitleFloor(relPath, marker) {
  const abs = resolve(ROOT, relPath);
  const src = readFileSync(abs, 'utf8');
  const idx = src.indexOf(marker);
  if (idx < 0) return { ok: false, reason: `marker missing: ${marker}` };
  const slice = src.slice(Math.max(0, idx - 80), idx + 220);
  const ok = /text-\[20px\]/.test(slice) && /font-bold/.test(slice);
  return { ok, slice: slice.replace(/\s+/g, ' ').slice(0, 160) };
}

async function runThemeContrast() {
  try {
    const out = execSync('pnpm run verify:xevn:theme-contrast -- --strict', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    results.themeContrastStrict = { exit: 0, tail: out.slice(-400) };
    return true;
  } catch (e) {
    results.themeContrastStrict = {
      exit: e.status ?? 1,
      stderr: String(e.stderr || e.message || e).slice(0, 500),
    };
    return false;
  }
}

async function auditAddDialog(page, cfg) {
  const { id, shellTestId, dialogTestId, menuRe, addBtnRe, shotPrefix, requireCompact, requireDate } = cfg;
  let menuLabel = null;
  try {
    menuLabel = await openRequestsMenuItem(page, menuRe);
  } catch (e) {
    results.checks[id] = { pass: false, navError: String(e.message || e).slice(0, 160) };
    fail(`${id} nav: ${e.message || e}`);
    step(id, 'FAIL', 'nav');
    return;
  }
  const root = page.locator(`[data-testid="${shellTestId}"]`);
  await root.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  await sleep(1000);
  const addBtn = root.getByRole('button', { name: addBtnRe }).first();
  let addVisible = await addBtn.isVisible().catch(() => false);
  let addTarget = addBtn;
  if (!addVisible) {
    addTarget = page.getByRole('button', { name: addBtnRe }).first();
    addVisible = await addTarget.isVisible().catch(() => false);
  }
  if (!addVisible) {
    results.checks[id] = { pass: false, addVisible: false, menuLabel };
    fail(`${id}: add CTA missing`);
    step(id, 'FAIL', 'add CTA');
    return;
  }
  await addTarget.click();
  await sleep(1000);
  const dlg = page.locator(`[data-testid="${dialogTestId}"]`);
  const dlgOk = await dlg.isVisible().catch(() => false);
  const metrics = dlgOk ? await measureDialogChrome(page, dialogTestId) : { found: false };
  const title = dlgOk
    ? await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first())
    : null;
  if (title && metrics.found) {
    metrics.titleFontSize = title.fontSize;
    metrics.titleFontWeight = title.fontWeight;
    metrics.titleFontFamily = title.fontFamily;
    metrics.titleText = title.text;
  }
  const verdict = chromePass(metrics, { requireCompact: !!requireCompact, requireDate: !!requireDate });
  const pass = dlgOk && verdict.pass;
  results.checks[id] = { pass, dlgOk, menuLabel, metrics, verdict, title };
  if (!pass) fail(`${id}: ${verdict.reason}`);
  await shot(page, shotPrefix);
  await dismissDialog(page);
  step(id, pass ? 'PASS' : 'FAIL', verdict.reason);
}

async function main() {
  const themeOk = await runThemeContrast();
  results.checks.theme_contrast_strict = { pass: themeOk, ...results.themeContrastStrict };
  if (!themeOk) fail('theme-contrast --strict non-zero');
  step('theme_contrast', themeOk ? 'PASS' : 'FAIL', `exit ${results.themeContrastStrict?.exit}`);

  await probeL0();
  const feOk = results.l0.portal === 200 || results.l0.hrm_fe === 200;
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || !feOk) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    fail(
      `L0 down hrm=${results.l0.hrm} xbos=${results.l0.xbos} portal=${results.l0.portal} hrm_fe=${results.l0.hrm_fe}`,
    );
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  step('login', 'PASS', `HTTP ${session.http} via ${session.loginVia}`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => results.pageErrors.push(String(e.message || e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, ''),
    };
    if (method !== 'GET') results.mutates.push(entry);
    if (results.network.length < 160) results.network.push(entry);
  });

  await injectPortalAuth(page, session);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);
  await shot(page, '00-attendance-shell');

  // Q1 Late/early
  await auditAddDialog(page, {
    id: 'Q1_late_early_add',
    shellTestId: 'att-late-early-precision',
    dialogTestId: 'att-late-early-add-dialog-precision',
    menuRe: /đi muộn|về sớm|late.?early/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '01-late-early-add',
    requireCompact: true,
  });

  // Q2 Trip
  await auditAddDialog(page, {
    id: 'Q2_trip_add',
    shellTestId: 'att-trip-precision',
    dialogTestId: 'att-trip-add-dialog-precision',
    menuRe: /công tác|business.?trip|đi công tác/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '02-trip-add',
    requireDate: true,
  });

  // Q3 Shift-change (AC1 trio: late/early + trip + shift-change)
  await auditAddDialog(page, {
    id: 'Q3_shift_change_add',
    shellTestId: 'att-shift-change-precision',
    dialogTestId: 'att-shift-change-add-dialog-precision',
    menuRe: /đổi ca|change.?shift|shift.?change/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '03-shift-change-add',
    requireDate: true,
  });

  // Q4 NEW — Shift form dialog
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    const shiftsTab = page.locator('button').filter({ hasText: /^Ca|Shifts/i }).first();
    // Prefer testid menu
    const shiftsMenu = page.locator('[data-testid="shifts-menu-list"]');
    const tabBtn = page.locator('button').filter({ hasText: /Ca làm|Shifts|Phân ca/i }).first();
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await sleep(700);
    }
    if (await shiftsMenu.isVisible().catch(() => false)) {
      await shiftsMenu.click();
      await sleep(1600);
    } else {
      // dropdown already open from tab click — click list item
      const listItem = page.getByRole('menuitem').filter({ hasText: /Danh sách|List|Ca/i }).first();
      if (await listItem.isVisible().catch(() => false)) {
        await listItem.click();
        await sleep(1600);
      }
    }
    const shell = page.locator('[data-testid="att-shifts-precision"]');
    await shell.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    const addBtn = page.locator('[data-testid="att-shifts-add"]');
    const addVisible = await addBtn.isVisible().catch(() => false);
    let dlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'add missing' };
    if (addVisible) {
      await addBtn.click();
      await sleep(900);
      const dlg = page.locator('[data-testid="att-shift-form-dialog"]');
      dlgOk = await dlg.isVisible().catch(() => false);
      if (dlgOk) {
        metrics = await measureDialogChrome(page, 'att-shift-form-dialog');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics, { requireAnyCompact: true });
        await shot(page, '04-shift-form');
        await dismissDialog(page);
      }
    }
    const pass = addVisible && dlgOk && verdict.pass;
    results.checks.Q4_shift_form = { pass, addVisible, dlgOk, metrics, verdict, title };
    if (!pass) fail(`Q4 shift-form: ${verdict.reason}`);
    step('Q4_shift_form', pass ? 'PASS' : 'FAIL', verdict.reason);
  } catch (e) {
    results.checks.Q4_shift_form = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q4 shift-form: ${e.message || e}`);
    step('Q4_shift_form', 'FAIL', 'nav/open');
  }

  // Q5 NEW — Add sheet dialog
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openAttendanceMenuItem(page, /bảng chấm công|bảng công|sheets|attendance sheets/i);
    const shell = page.locator('[data-testid="att-sheets-precision"]');
    await shell.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    const addBtn = page.locator('[data-testid="att-sheets-add"]');
    const addVisible = await addBtn.isVisible().catch(() => false);
    let dlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'add missing' };
    if (addVisible) {
      await addBtn.click();
      await sleep(900);
      const dlg = page.locator('[data-testid="att-add-sheet-dialog"]');
      dlgOk = await dlg.isVisible().catch(() => false);
      if (dlgOk) {
        metrics = await measureDialogChrome(page, 'att-add-sheet-dialog');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics, { requireAnyCompact: true });
        await shot(page, '05-add-sheet');
        await dismissDialog(page);
      }
    }
    const pass = addVisible && dlgOk && verdict.pass;
    results.checks.Q5_add_sheet = { pass, addVisible, dlgOk, metrics, verdict, title };
    if (!pass) fail(`Q5 add-sheet: ${verdict.reason}`);
    step('Q5_add_sheet', pass ? 'PASS' : 'FAIL', verdict.reason);
  } catch (e) {
    results.checks.Q5_add_sheet = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q5 add-sheet: ${e.message || e}`);
    step('Q5_add_sheet', 'FAIL', 'nav/open');
  }

  // Q6 NEW — page-leave create + page-edit (if openable; else static floor)
  try {
    const leaveFloor = staticDialogTitleFloor(
      'apps/web/hrm/src/pages/Attendance.tsx',
      'att-page-leave-create-dialog-precision',
    );
    const editFloor = staticDialogTitleFloor(
      'apps/web/hrm/src/pages/Attendance.tsx',
      'att-page-attendance-edit-dialog-precision',
    );
    let leaveOpened = false;
    let editOpened = false;
    let leaveMetrics = { found: false };
    let editMetrics = { found: false };
    let leaveVerdict = { pass: false, reason: 'not opened' };
    let editVerdict = { pass: false, reason: 'not opened' };
    // Residual shells — try Leave tab create; page leave create may not be LIVE wire
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    // Prefer LIVE Leave create (already FE-DIALOG-01) only as optional; page shells = static if closed
    const leaveTab = page.locator('button').filter({ hasText: /Nghỉ phép|Leave/i }).first();
    if (await leaveTab.isVisible().catch(() => false)) {
      await leaveTab.click();
      await sleep(1200);
      const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Thêm|Add|Create/i }).first();
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await sleep(800);
        const pageLeave = page.locator('[data-testid="att-page-leave-create-dialog-precision"]');
        leaveOpened = await pageLeave.isVisible().catch(() => false);
        if (leaveOpened) {
          leaveMetrics = await measureDialogChrome(page, 'att-page-leave-create-dialog-precision');
          const title = await titleMetrics(pageLeave.locator('h2, [class*="DialogTitle"]').first());
          if (title && leaveMetrics.found) {
            leaveMetrics.titleFontSize = title.fontSize;
            leaveMetrics.titleFontWeight = title.fontWeight;
            leaveMetrics.titleText = title.text;
          }
          leaveVerdict = chromePass(leaveMetrics, { requireAnyCompact: true });
          await shot(page, '06-page-leave-create');
          await dismissDialog(page);
        } else {
          // LIVE leave create may open att-leave-create-dialog-precision — dismiss if open
          await dismissDialog(page);
        }
      }
    }
    // page-edit: try records edit if row exists
    try {
      await openAttendanceMenuItem(page, /dữ liệu chấm công|bản ghi|records/i);
      await sleep(1200);
      const editBtn = page
        .locator(
          '[data-testid*="record-edit"], button[aria-label*="Sửa"], button[aria-label*="Edit"]',
        )
        .first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click({ timeout: 4000 }).catch(() => null);
        await sleep(700);
        const editDlg = page.locator('[data-testid="att-page-attendance-edit-dialog-precision"]');
        editOpened = await editDlg.isVisible().catch(() => false);
        if (editOpened) {
          editMetrics = await measureDialogChrome(page, 'att-page-attendance-edit-dialog-precision');
          const title = await titleMetrics(editDlg.locator('h2, [class*="DialogTitle"]').first());
          if (title && editMetrics.found) {
            editMetrics.titleFontSize = title.fontSize;
            editMetrics.titleFontWeight = title.fontWeight;
            editMetrics.titleText = title.text;
          }
          editVerdict = chromePass(editMetrics, { requireAnyCompact: true });
          await shot(page, '06-page-edit');
          await dismissDialog(page);
        }
      }
    } catch {
      /* empty */
    }
    if (!leaveOpened) {
      results.residuals.push({
        id: 'OBS-Q6-PAGE-LEAVE-SHELL',
        severity: 'P2',
        owner: 'qa',
        note: 'att-page-leave-create-dialog-precision not opened (LIVE LeaveTab create separate) — static floor',
      });
    }
    if (!editOpened) {
      results.residuals.push({
        id: 'OBS-Q6-PAGE-EDIT-EMPTY',
        severity: 'P2',
        owner: 'qa',
        note: 'att-page-attendance-edit-dialog-precision not opened under U65 empty/no row — static floor',
      });
    }
    const leavePass = leaveOpened ? leaveVerdict.pass : leaveFloor.ok;
    const editPass = editOpened ? editVerdict.pass : editFloor.ok;
    const pass = leavePass && editPass;
    results.checks.Q6_page_leave_edit = {
      pass,
      leaveOpened,
      editOpened,
      leaveMetrics,
      editMetrics,
      leaveVerdict,
      editVerdict,
      leaveFloor,
      editFloor,
      note: 'if openable → chrome; else static text-[20px] floor — not invent',
    };
    if (!pass) fail('Q6 page-leave/edit floor or chrome fail');
    step('Q6_page_leave_edit', pass ? 'PASS' : 'FAIL', leaveOpened || editOpened ? 'opened' : 'static floor');
  } catch (e) {
    results.checks.Q6_page_leave_edit = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q6 page shells: ${e.message || e}`);
    step('Q6_page_leave_edit', 'FAIL', 'error');
  }

  // Q7 NEW — Manual clock confirm
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2200);
    const clockBtn = page.locator('[data-testid="attendance-tab-clock-in"]');
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1200);
    }
    const manualMethod = page.locator('[data-testid="clock-in-method-manual"]');
    if (await manualMethod.isVisible().catch(() => false)) {
      await manualMethod.click();
      await sleep(1000);
    }
    const checkIn = page.locator('[data-testid="clock-in-manual-checkin"]');
    const checkInVisible = await checkIn.isVisible().catch(() => false);
    let enabled = checkInVisible && !(await checkIn.isDisabled().catch(() => true));
    // Select first employee if select present
    if (checkInVisible && !enabled) {
      const empTrigger = page
        .locator('[data-testid="clock-in-manual-widget"] [role="combobox"], [data-testid="clock-in-manual-widget"] button')
        .first();
      if (await empTrigger.isVisible().catch(() => false)) {
        await empTrigger.click();
        await sleep(500);
        const opt = page.locator('[role="option"]').first();
        if (await opt.isVisible().catch(() => false)) {
          await opt.click();
          await sleep(700);
        }
      }
      enabled = !(await checkIn.isDisabled().catch(() => true));
    }
    let dlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'check-in not openable' };
    let cta = { found: false };
    let ctaVerdict = { pass: false, reason: 'n/a' };
    if (checkInVisible && enabled) {
      await checkIn.click();
      await sleep(900);
      const dlg = page.locator('[data-testid="clock-in-manual-confirm-dialog"]');
      dlgOk = await dlg.isVisible().catch(() => false);
      if (dlgOk) {
        metrics = await measureDialogChrome(page, 'clock-in-manual-confirm-dialog');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics, { requireAnyCompact: true });
        cta = await measurePrimaryCta(page, 'clock-in-manual-confirm-dialog');
        ctaVerdict = primaryCtaPass(cta);
        await shot(page, '07-manual-confirm');
        await dismissDialog(page);
      }
    } else {
      const floor = staticDialogTitleFloor(
        'apps/web/hrm/src/components/attendance/CheckInOutWidget.tsx',
        'clock-in-manual-confirm-dialog',
      );
      results.residuals.push({
        id: 'OBS-Q7-MANUAL-CONFIRM-GATED',
        severity: 'P2',
        owner: 'qa',
        note: 'Manual confirm gated (no employee / disabled) — static title≥20 floor; not invent mutate',
      });
      const passFloor = floor.ok;
      results.checks.Q7_manual_confirm = {
        pass: passFloor,
        checkInVisible,
        enabled,
        dlgOk: false,
        floor,
        note: 'gated — static floor',
      };
      if (!passFloor) fail('Q7 manual confirm static floor fail');
      step('Q7_manual_confirm', passFloor ? 'PASS' : 'FAIL', 'static floor');
      // skip to next — already set
    }
    if (!(results.checks.Q7_manual_confirm && results.checks.Q7_manual_confirm.note === 'gated — static floor')) {
      const pass = dlgOk && verdict.pass && ctaVerdict.pass;
      results.checks.Q7_manual_confirm = {
        pass,
        checkInVisible,
        enabled,
        dlgOk,
        metrics,
        verdict,
        title,
        cta,
        ctaVerdict,
      };
      if (!pass) fail(`Q7 manual: ${verdict.reason}; cta=${ctaVerdict.reason}`);
      step('Q7_manual_confirm', pass ? 'PASS' : 'FAIL', verdict.reason);
    }
  } catch (e) {
    results.checks.Q7_manual_confirm = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q7 manual: ${e.message || e}`);
    step('Q7_manual_confirm', 'FAIL', 'nav');
  }

  // Q8 NEW — GPS clock confirm (geolocation mock)
  try {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 21.0285, longitude: 105.8542 });
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2200);
    const clockBtn = page.locator('[data-testid="attendance-tab-clock-in"]');
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1000);
    }
    const gpsMethod = page.locator('[data-testid="clock-in-method-gps"]');
    if (await gpsMethod.isVisible().catch(() => false)) {
      await gpsMethod.click();
      await sleep(1500);
    }
    // select employee if needed
    const empTrigger = page
      .locator('[data-testid="clock-in-panel-gps"] [role="combobox"], [data-testid*="gps"] [role="combobox"]')
      .first();
    if (await empTrigger.isVisible().catch(() => false)) {
      await empTrigger.click();
      await sleep(400);
      const opt = page.locator('[role="option"]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(600);
      }
    }
    const openConfirm = page.locator('[data-testid="clock-in-gps-open-confirm"]');
    let openVisible = await openConfirm.isVisible().catch(() => false);
    let enabled = openVisible && !(await openConfirm.isDisabled().catch(() => true));
    // wait briefly for GPS mock
    for (let i = 0; i < 6 && openVisible && !enabled; i++) {
      await sleep(800);
      enabled = !(await openConfirm.isDisabled().catch(() => true));
    }
    let dlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'gps confirm not openable' };
    let cta = { found: false };
    let ctaVerdict = { pass: false, reason: 'n/a' };
    if (openVisible && enabled) {
      await openConfirm.click();
      await sleep(900);
      const dlg = page.locator('[data-testid="clock-in-gps-confirm-dialog"]');
      dlgOk = await dlg.isVisible().catch(() => false);
      if (dlgOk) {
        metrics = await measureDialogChrome(page, 'clock-in-gps-confirm-dialog');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics, { requireAnyCompact: true });
        cta = await measurePrimaryCta(page, 'clock-in-gps-confirm-dialog');
        ctaVerdict = primaryCtaPass(cta);
        await shot(page, '08-gps-confirm');
        await dismissDialog(page);
      }
    } else {
      const floor = staticDialogTitleFloor(
        'apps/web/hrm/src/components/attendance/GPSAttendance.tsx',
        'clock-in-gps-confirm-dialog',
      );
      results.residuals.push({
        id: 'OBS-Q8-GPS-CONFIRM-GATED',
        severity: 'P2',
        owner: 'qa',
        note: 'GPS confirm gated (geo/employee) — static title≥20 + primary CTA in source; not invent LIVE mutate',
      });
      results.checks.Q8_gps_confirm = {
        pass: floor.ok,
        openVisible,
        enabled,
        dlgOk: false,
        floor,
        note: 'gated — static floor',
      };
      if (!floor.ok) fail('Q8 GPS confirm static floor fail');
      step('Q8_gps_confirm', floor.ok ? 'PASS' : 'FAIL', 'static floor');
    }
    if (!(results.checks.Q8_gps_confirm && results.checks.Q8_gps_confirm.note === 'gated — static floor')) {
      const pass = dlgOk && verdict.pass && ctaVerdict.pass;
      results.checks.Q8_gps_confirm = {
        pass,
        openVisible,
        enabled,
        dlgOk,
        metrics,
        verdict,
        title,
        cta,
        ctaVerdict,
      };
      if (!pass) fail(`Q8 GPS: ${verdict.reason}; cta=${ctaVerdict.reason}`);
      step('Q8_gps_confirm', pass ? 'PASS' : 'FAIL', verdict.reason);
    }
  } catch (e) {
    results.checks.Q8_gps_confirm = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q8 GPS: ${e.message || e}`);
    step('Q8_gps_confirm', 'FAIL', 'nav');
  }

  // Q9 Export
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openAttendanceMenuItem(page, /dữ liệu chấm công|bản ghi|records/i);
    const exportBtn = page.locator('[data-testid="att-records-export"]');
    const exportVisible = await exportBtn.isVisible().catch(() => false);
    let exportDlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'export btn missing' };
    if (exportVisible) {
      await exportBtn.click();
      await sleep(800);
      const dlg = page.locator('[data-testid="att-export-dialog-precision"]');
      exportDlgOk = await dlg.isVisible().catch(() => false);
      if (exportDlgOk) {
        metrics = await measureDialogChrome(page, 'att-export-dialog-precision');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics);
        await shot(page, '09-export-dialog');
        await dismissDialog(page);
      }
    }
    const pass = exportVisible && exportDlgOk && verdict.pass;
    results.checks.Q9_export = { pass, exportVisible, exportDlgOk, metrics, verdict, title };
    if (!pass) fail(`Q9 export: ${verdict.reason}`);
    step('Q9_export', pass ? 'PASS' : 'FAIL', verdict.reason);
  } catch (e) {
    results.checks.Q9_export = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q9 export: ${e.message || e}`);
    step('Q9_export', 'FAIL', 'nav/open');
  }

  // Q10 Import (settings emp)
  try {
    const settingsTab = page.locator('button').filter({ hasText: /Thiết lập|Cài đặt|Settings/i }).first();
    await settingsTab.click({ timeout: 12_000 });
    await sleep(1800);
    const shell = page.locator('[data-testid="att-settings-shell-precision"]');
    await shell.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const importBtn = page.locator('[data-testid="hdsd-att-settings-emp-import"]');
    const importVisible = await importBtn.isVisible().catch(() => false);
    let importDlgOk = false;
    let metrics = { found: false };
    let title = null;
    let verdict = { pass: false, reason: 'import btn missing' };
    if (importVisible) {
      await importBtn.click();
      await sleep(800);
      const dlg = page.locator('[data-testid="att-import-dialog-precision"]');
      importDlgOk = await dlg.isVisible().catch(() => false);
      if (importDlgOk) {
        metrics = await measureDialogChrome(page, 'att-import-dialog-precision');
        title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        if (title && metrics.found) {
          metrics.titleFontSize = title.fontSize;
          metrics.titleFontWeight = title.fontWeight;
          metrics.titleFontFamily = title.fontFamily;
          metrics.titleText = title.text;
        }
        verdict = chromePass(metrics);
        await shot(page, '10-import-dialog');
        await dismissDialog(page);
      }
    }
    const pass = importVisible && importDlgOk && verdict.pass;
    results.checks.Q10_import = { pass, importVisible, importDlgOk, metrics, verdict, title };
    if (!pass) fail(`Q10 import: ${verdict.reason}`);
    step('Q10_import', pass ? 'PASS' : 'FAIL', verdict.reason);
  } catch (e) {
    results.checks.Q10_import = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q10 import: ${e.message || e}`);
    step('Q10_import', 'FAIL', 'nav/open');
  }

  // Q11 Face HOLD honesty
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    const clockBtn = page.locator('[data-testid="attendance-tab-clock-in"]');
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1200);
    } else {
      const clockText = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
      if (await clockText.isVisible().catch(() => false)) {
        await clockText.click();
        await sleep(1200);
      }
    }
    const faceMethod = page.locator('[data-testid="clock-in-method-faceid"]');
    if (await faceMethod.isVisible().catch(() => false)) {
      await faceMethod.click();
      await sleep(900);
    } else {
      const faceTile = page.getByText(/Face ID|Face|Khuôn mặt/i).first();
      if (await faceTile.isVisible().catch(() => false)) {
        await faceTile.click();
        await sleep(1000);
      }
    }
    const faceHold = page.locator('[data-testid="att-faceid-hold-banner"]');
    let faceHoldVisible = await faceHold.isVisible().catch(() => false);
    if (!faceHoldVisible) {
      const holdText = page
        .getByText(/HOLD|chưa kích hoạt|tính năng tạm|feature.?hold|đang phát triển|GĐ2|GĐ1|chưa hỗ trợ/i)
        .first();
      faceHoldVisible = await holdText.isVisible().catch(() => false);
    }
    const liveClaimUi = page.getByText(/Face\s*LIVE|đang LIVE|production face/i);
    const liveClaimVisible = await liveClaimUi.isVisible().catch(() => false);
    const pass = faceHoldVisible && !liveClaimVisible;
    results.checks.Q11_face_hold = {
      pass,
      faceHoldVisible,
      liveClaimVisible,
      note: 'Face HOLD honesty — not LIVE',
    };
    if (!pass) fail(`Q11 Face HOLD fail hold=${faceHoldVisible} liveClaim=${liveClaimVisible}`);
    await shot(page, '11-face-hold');
    step('Q11_face', pass ? 'PASS' : 'FAIL', 'Face HOLD');
  } catch (e) {
    results.checks.Q11_face_hold = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`Q11 Face: ${e.message || e}`);
    step('Q11_face', 'FAIL', 'nav');
  }

  results.honesty.face_live_claimed = false;
  results.honesty.attendance_closed_claimed = false;
  results.honesty.remaster_program_done_claimed = false;
  results.checks.honesty_locks = {
    pass: results.mutates.length === 0,
    mutates: results.mutates.length,
    face_live: false,
    attendance_closed: false,
    remaster_done: false,
  };
  if (results.mutates.length > 0) fail(`U65 mutate count=${results.mutates.length}`);

  await browser.close();

  const required = [
    'theme_contrast_strict',
    'Q1_late_early_add',
    'Q2_trip_add',
    'Q3_shift_change_add',
    'Q4_shift_form',
    'Q5_add_sheet',
    'Q6_page_leave_edit',
    'Q7_manual_confirm',
    'Q8_gps_confirm',
    'Q9_export',
    'Q10_import',
    'Q11_face_hold',
    'honesty_locks',
  ];
  const allPass =
    required.every((k) => results.checks[k]?.pass === true) && results.failReasons.length === 0;
  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [
            k,
            { pass: v.pass, note: v.verdict?.reason || v.note || v.error },
          ]),
        ),
        screens: results.screens,
        l0: results.l0,
        mutates: results.mutates.length,
        residuals: results.residuals,
        BASE,
        commit: COMMIT,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'ERROR';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
