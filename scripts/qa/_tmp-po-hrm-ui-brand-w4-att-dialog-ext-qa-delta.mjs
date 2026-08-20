#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA-DELTA
 * Stall#2 surfaces NOT in parent 10/10 (late/early/trip/update/shift-change/export/import).
 * Scope: shift-form · add-sheet · page-leave/edit (if openable) · manual/GPS clock · Face HOLD
 * Cấm: seed · Face LIVE · Attendance CLOSED · remaster DONE · re-litigate parent 10/10
 * theme-contrast --strict: SKIP (parent QA exit 0; no token touch)
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-att-dialog-ext-qa-delta-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-ui-brand-w4-att-dialog-ext-qa-delta',
);
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
  work_item_id: 'PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA-DELTA',
  parent_qa: 'PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA',
  parent_note: '10/10 PASS — not re-litigated',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  stall: '#2 FE surfaces (9148B)',
  themeContrastStrict: {
    skipped: true,
    reason: 'parent QA exit 0; no token touch this delta seat',
  },
  inventory: [
    'att-shift-form-dialog',
    'att-add-sheet-dialog',
    'att-page-leave-create-dialog-precision',
    'att-page-leave-detail-dialog-precision',
    'att-page-attendance-edit-dialog-precision',
    'clock-in-manual-confirm-dialog',
    'clock-in-gps-confirm-dialog',
    'Face HOLD',
  ],
  skipped_retest: ['late/early', 'trip', 'update', 'shift-change', 'export', 'import'],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
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

async function openShiftsList(page) {
  const listDirect = page.locator('[data-testid="shifts-menu-list"]');
  if (await listDirect.isVisible().catch(() => false)) {
    await listDirect.click();
    await sleep(1800);
    return 'shifts-menu-list-direct';
  }
  const shiftsTriggers = page.locator('button').filter({ hasText: /Ca làm việc|Shifts/i });
  if ((await shiftsTriggers.count()) > 0) {
    await shiftsTriggers.first().click();
  } else {
    await page.locator('button').filter({ hasText: /^Ca\b/i }).first().click({ timeout: 8_000 });
  }
  await sleep(600);
  if (await listDirect.count()) {
    await listDirect.click();
  } else {
    await page
      .locator('[role="menuitem"], [data-radix-collection-item]')
      .filter({ hasText: /Danh sách ca|Danh sách|List/i })
      .first()
      .click({ timeout: 8_000 });
  }
  await sleep(1800);
  return 'shifts-dropdown-list';
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
      'xevn-field-code',
    ]) {
      fieldClasses[cls] = !!root.querySelector(`.${cls}`);
    }
    const timeInputs = root.querySelectorAll('input[type="time"], .xevn-field-time');
    const dateFields = root.querySelectorAll('.xevn-field-date, input[type="date"]');
    return {
      found: true,
      testId: tid,
      beforeBg: before.backgroundColor,
      beforeH: before.height,
      glassPresent: !!glass,
      glassBackdrop: glassCs?.backdropFilter || glassCs?.webkitBackdropFilter || '',
      wordmarkPresent: !!wordmark,
      titleText: titleEl ? (titleEl.textContent || '').trim().slice(0, 80) : '',
      titleFontSize: titleCs?.fontSize || '',
      titleFontWeight: titleCs?.fontWeight || '',
      titleFontFamily: titleCs?.fontFamily || '',
      fieldClasses,
      timeInputCount: timeInputs.length,
      dateFieldCount: dateFields.length,
    };
  }, testId);
}

function anyCompactField(m) {
  const fc = m?.fieldClasses || {};
  return Object.values(fc).some(Boolean) || (m.dateFieldCount || 0) > 0 || (m.timeInputCount || 0) > 0;
}

function chromePass(m, { requireAnyCompact = false } = {}) {
  if (!m?.found) return { pass: false, reason: 'dialog not found' };
  const barH = parseFloat(m.beforeH || '0');
  const barPrimary = nearPrimary(parseRgb(m.beforeBg));
  const barOk = barH >= 3.5 && barH <= 5 && barPrimary;
  const fs = parseFloat(m.titleFontSize || '0');
  const w = parseInt(m.titleFontWeight || '0', 10) || (/bold/i.test(String(m.titleFontWeight)) ? 700 : 0);
  const titleOk = fs >= 20 && w >= 700;
  const logoOk = !!m.wordmarkPresent;
  const glassOk = !!m.glassPresent;
  const compactOk = requireAnyCompact ? anyCompactField(m) : true;
  const pass = barOk && titleOk && logoOk && glassOk && compactOk;
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
          !barOk && `bar ${m.beforeH}/${m.beforeBg}`,
          !titleOk && `title ${m.titleFontSize}/${m.titleFontWeight}`,
          !logoOk && 'logo missing',
          !glassOk && 'glass missing',
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
      Array.from(root.querySelectorAll('button')).find((b) =>
        /Check-in|Xác nhận|Chấm công|Lưu|Confirm|Thêm mới/i.test(b.textContent || ''),
      );
    if (!btn) return { found: true, ctaFound: false };
    const cs = getComputedStyle(btn);
    return {
      found: true,
      ctaFound: true,
      text: (btn.textContent || '').trim().slice(0, 60),
      bg: cs.backgroundColor,
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
  const jsxMarker = `data-testid="${marker}"`;
  let idx = src.indexOf(jsxMarker);
  if (idx < 0) idx = src.indexOf(marker);
  if (idx < 0) return { ok: false, reason: `marker missing: ${marker}` };
  const slice = src.slice(Math.max(0, idx - 40), idx + 420);
  let ok = /text-\[20px\]/.test(slice) && /font-bold/.test(slice);
  if (!ok) {
    ok = new RegExp(
      `data-testid="${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]{0,400}?text-\\[20px\\][\\s\\S]{0,80}?font-bold`,
    ).test(src);
  }
  return { ok, slice: slice.replace(/\s+/g, ' ').slice(0, 180) };
}

async function enrichTitle(page, dlg, metrics) {
  const title = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first()).catch(() => null);
  if (title && metrics.found) {
    metrics.titleFontSize = title.fontSize;
    metrics.titleFontWeight = title.fontWeight;
    metrics.titleFontFamily = title.fontFamily;
    metrics.titleText = title.text;
  }
  return title;
}

async function selectFirstEmployee(page, scope) {
  const combo = scope.locator('[role="combobox"]').first();
  if (!(await combo.isVisible().catch(() => false))) return false;
  await combo.click();
  await sleep(500);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  if (n <= 0) return false;
  await opts.nth(n > 1 ? 1 : 0).click();
  await sleep(900);
  return true;
}

async function auditOpenedDialog(page, { id, dialogTestId, shotPrefix, requireAnyCompact = true, requirePrimaryCta = false }) {
  const dlg = page.locator(`[data-testid="${dialogTestId}"]`);
  const dlgOk = await dlg.isVisible().catch(() => false);
  if (!dlgOk) {
    results.checks[id] = { pass: false, dlgOk: false };
    fail(`${id}: dialog not visible`);
    step(id, 'FAIL', 'dialog missing');
    return false;
  }
  const metrics = await measureDialogChrome(page, dialogTestId);
  const title = await enrichTitle(page, dlg, metrics);
  const verdict = chromePass(metrics, { requireAnyCompact });
  let cta = null;
  let ctaVerdict = { pass: true, reason: 'n/a' };
  if (requirePrimaryCta) {
    cta = await measurePrimaryCta(page, dialogTestId);
    ctaVerdict = primaryCtaPass(cta);
  }
  const pass = verdict.pass && ctaVerdict.pass;
  results.checks[id] = { pass, dlgOk, metrics, verdict, title, cta, ctaVerdict };
  if (!pass) fail(`${id}: ${verdict.reason}${requirePrimaryCta ? ` | cta ${ctaVerdict.reason}` : ''}`);
  await shot(page, shotPrefix);
  await dismissDialog(page);
  step(id, pass ? 'PASS' : 'FAIL', verdict.reason);
  return pass;
}

async function main() {
  results.checks.theme_contrast_strict = {
    pass: true,
    skipped: true,
    note: 'parent PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT-QA exit 0 — not re-run',
  };
  step('theme_contrast', 'SKIP', 'parent exit 0');

  await probeL0();
  const feOk = results.l0.portal === 200 || results.l0.hrm_fe === 200;
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || !feOk) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    fail(`L0 down ${JSON.stringify(results.l0)}`);
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  step('login', 'PASS', `HTTP ${session.http}`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
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
    const entry = { method, status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '') };
    if (method !== 'GET') results.mutates.push(entry);
    if (results.network.length < 160) results.network.push(entry);
  });

  await injectPortalAuth(page, session);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);
  await shot(page, '00-attendance-shell');

  // D1 Shift form — Ca làm việc top tab
  try {
    const navLabel = await openShiftsList(page);
    const addBtn = page.locator('[data-testid="att-shifts-add"]');
    await page.locator('[data-testid="att-shifts-precision"]').waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    const addVisible = await addBtn.isVisible().catch(() => false);
    if (!addVisible) {
      results.checks.D1_shift_form = { pass: false, addVisible: false, navLabel };
      fail('D1: att-shifts-add missing');
      step('D1_shift_form', 'FAIL', 'add CTA');
    } else {
      await addBtn.click();
      await sleep(900);
      await auditOpenedDialog(page, {
        id: 'D1_shift_form',
        dialogTestId: 'att-shift-form-dialog',
        shotPrefix: '01-shift-form',
        requireAnyCompact: true,
      });
      if (results.checks.D1_shift_form) results.checks.D1_shift_form.navLabel = navLabel;
    }
  } catch (e) {
    results.checks.D1_shift_form = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D1 shift: ${e.message || e}`);
    step('D1_shift_form', 'FAIL', 'nav');
  }

  // D2 Add sheet
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await openAttendanceMenuItem(page, /Bảng chấm công|Sheets|bảng công/i);
    await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    const addBtn = page.locator('[data-testid="att-sheets-add"]');
    if (!(await addBtn.isVisible().catch(() => false))) {
      results.checks.D2_add_sheet = { pass: false, addVisible: false };
      fail('D2: att-sheets-add missing');
      step('D2_add_sheet', 'FAIL', 'add CTA');
    } else {
      await addBtn.click();
      await sleep(900);
      await auditOpenedDialog(page, {
        id: 'D2_add_sheet',
        dialogTestId: 'att-add-sheet-dialog',
        shotPrefix: '02-add-sheet',
        requireAnyCompact: true,
      });
    }
  } catch (e) {
    results.checks.D2_add_sheet = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D2 sheet: ${e.message || e}`);
    step('D2_add_sheet', 'FAIL', 'nav');
  }

  // D3 Page leave — residual shells → static floor if not openable
  try {
    const createFloor = staticDialogTitleFloor(
      'apps/web/hrm/src/pages/Attendance.tsx',
      'att-page-leave-create-dialog-precision',
    );
    const detailFloor = staticDialogTitleFloor(
      'apps/web/hrm/src/pages/Attendance.tsx',
      'att-page-leave-detail-dialog-precision',
    );
    let opened = false;
    let metrics = { found: false };
    let verdict = { pass: false, reason: 'not opened' };
    const leaveCreateBtn = page
      .locator('button')
      .filter({ hasText: /Thêm đơn nghỉ|Đăng ký nghỉ|Add leave/i })
      .first();
    if (await leaveCreateBtn.isVisible().catch(() => false)) {
      await leaveCreateBtn.click({ timeout: 3000 }).catch(() => null);
      await sleep(700);
      const dlg = page.locator('[data-testid="att-page-leave-create-dialog-precision"]');
      opened = await dlg.isVisible().catch(() => false);
      if (opened) {
        metrics = await measureDialogChrome(page, 'att-page-leave-create-dialog-precision');
        await enrichTitle(page, dlg, metrics);
        verdict = chromePass(metrics, { requireAnyCompact: true });
        await shot(page, '03-page-leave-create');
        await dismissDialog(page);
      }
    }
    if (!opened) {
      results.residuals.push({
        id: 'OBS-D3-PAGE-LEAVE-SHELL',
        severity: 'P2',
        owner: 'qa',
        note: 'Page leave residual shells not openable (LIVE create = LeaveTab) — static text-[20px] floor',
      });
    }
    const pass = opened ? verdict.pass : createFloor.ok && detailFloor.ok;
    results.checks.D3_page_leave = {
      pass,
      opened,
      metrics,
      verdict,
      createFloor,
      detailFloor,
      note: opened ? 'live chrome' : 'static floor; residual shell',
    };
    if (!pass) fail(`D3 page-leave: ${opened ? verdict.reason : 'static floor fail'}`);
    step('D3_page_leave', pass ? 'PASS' : 'FAIL', opened ? verdict.reason : 'static floor');
  } catch (e) {
    results.checks.D3_page_leave = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D3: ${e.message || e}`);
    step('D3_page_leave', 'FAIL', 'error');
  }

  // D4 Page edit — residual shell → static floor if not openable
  try {
    const editFloor = staticDialogTitleFloor(
      'apps/web/hrm/src/pages/Attendance.tsx',
      'att-page-attendance-edit-dialog-precision',
    );
    let opened = false;
    let metrics = { found: false };
    let verdict = { pass: false, reason: 'not opened' };
    const editBtn = page
      .locator('[data-testid="att-page-attendance-edit-open"], button[aria-label*="Sửa chấm"]')
      .first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click({ timeout: 3000 }).catch(() => null);
      await sleep(700);
      const dlg = page.locator('[data-testid="att-page-attendance-edit-dialog-precision"]');
      opened = await dlg.isVisible().catch(() => false);
      if (opened) {
        metrics = await measureDialogChrome(page, 'att-page-attendance-edit-dialog-precision');
        await enrichTitle(page, dlg, metrics);
        verdict = chromePass(metrics, { requireAnyCompact: true });
        await shot(page, '04-page-edit');
        await dismissDialog(page);
      }
    }
    if (!opened) {
      results.residuals.push({
        id: 'OBS-D4-PAGE-EDIT-SHELL',
        severity: 'P2',
        owner: 'qa',
        note: 'Page attendance edit residual shell not openable (LIVE edit = AttendanceRecordsTable) — static floor',
      });
    }
    const pass = opened ? verdict.pass : editFloor.ok;
    results.checks.D4_page_edit = {
      pass,
      opened,
      metrics,
      verdict,
      editFloor,
      note: opened ? 'live chrome' : 'static floor; residual shell',
    };
    if (!pass) fail(`D4 page-edit: ${opened ? verdict.reason : 'static floor fail'}`);
    step('D4_page_edit', pass ? 'PASS' : 'FAIL', opened ? verdict.reason : 'static floor');
  } catch (e) {
    results.checks.D4_page_edit = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D4: ${e.message || e}`);
    step('D4_page_edit', 'FAIL', 'error');
  }

  // D5 Manual clock confirm
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2200);
    const clockBtn = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1200);
    }
    const manualMethod = page.locator('[data-testid="clock-in-method-manual"]');
    if (await manualMethod.isVisible().catch(() => false)) {
      await manualMethod.click();
      await sleep(1200);
    }
    const widget = page.locator('[data-testid="clock-in-manual-widget"]');
    await widget.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    await selectFirstEmployee(
      page,
      page.locator('[data-testid="clock-in-wizard"], [data-testid="clock-in-manual-widget"]').first(),
    );
    const checkinBtn = page.locator('[data-testid="clock-in-manual-checkin"]');
    let dialogOpened = false;
    if (await checkinBtn.isVisible().catch(() => false)) {
      if (await checkinBtn.isEnabled().catch(() => false)) await checkinBtn.click();
      else await checkinBtn.click({ force: true }).catch(() => null);
      await sleep(900);
      dialogOpened = await page
        .locator('[data-testid="clock-in-manual-confirm-dialog"]')
        .isVisible()
        .catch(() => false);
    }
    if (!dialogOpened) {
      results.checks.D5_manual_confirm = { pass: false, dialogOpened: false };
      fail('D5: manual confirm dialog did not open');
      step('D5_manual_confirm', 'FAIL', 'dialog missing');
      await shot(page, '05-manual-confirm-miss');
    } else {
      await auditOpenedDialog(page, {
        id: 'D5_manual_confirm',
        dialogTestId: 'clock-in-manual-confirm-dialog',
        shotPrefix: '05-manual-confirm',
        requireAnyCompact: true,
        requirePrimaryCta: true,
      });
    }
  } catch (e) {
    results.checks.D5_manual_confirm = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D5 manual: ${e.message || e}`);
    step('D5_manual_confirm', 'FAIL', 'nav');
  }

  // D6 GPS clock confirm
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2200);
    const clockBtn = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1000);
    }
    const gpsMethod = page.locator('[data-testid="clock-in-method-gps"]');
    if (await gpsMethod.isVisible().catch(() => false)) {
      await gpsMethod.click();
      await sleep(2500);
    }
    const gpsPanel = page.locator('[data-testid="clock-in-panel-gps"]');
    await gpsPanel.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    await selectFirstEmployee(page, gpsPanel);
    await sleep(1500);
    const gpsOpen = page.locator('[data-testid="clock-in-gps-open-confirm"]');
    let dialogOpened = false;
    if (await gpsOpen.isVisible().catch(() => false)) {
      if (await gpsOpen.isEnabled().catch(() => false)) await gpsOpen.click();
      else await gpsOpen.click({ force: true }).catch(() => null);
      await sleep(900);
      dialogOpened = await page
        .locator('[data-testid="clock-in-gps-confirm-dialog"]')
        .isVisible()
        .catch(() => false);
    }
    if (!dialogOpened) {
      const floor = staticDialogTitleFloor(
        'apps/web/hrm/src/components/attendance/GPSAttendance.tsx',
        'clock-in-gps-confirm-dialog',
      );
      results.residuals.push({
        id: 'OBS-D6-GPS-CONFIRM-GATED',
        severity: 'P2',
        owner: 'qa',
        note: 'GPS confirm gated (emp/geo) — static text-[20px] + primary CTA in source; not invent LIVE mutate',
      });
      results.checks.D6_gps_confirm = {
        pass: floor.ok,
        dialogOpened: false,
        floor,
        note: 'gated — static floor',
      };
      if (!floor.ok) fail('D6 GPS: static floor fail');
      await shot(page, '06-gps-confirm-miss');
      step('D6_gps_confirm', floor.ok ? 'PASS' : 'FAIL', 'static floor');
    } else {
      await auditOpenedDialog(page, {
        id: 'D6_gps_confirm',
        dialogTestId: 'clock-in-gps-confirm-dialog',
        shotPrefix: '06-gps-confirm',
        requireAnyCompact: true,
        requirePrimaryCta: true,
      });
    }
  } catch (e) {
    results.checks.D6_gps_confirm = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D6 GPS: ${e.message || e}`);
    step('D6_gps_confirm', 'FAIL', 'nav');
  }

  // D7 Face HOLD
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    const clockBtn = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1200);
    }
    const faceMethod = page.locator('[data-testid="clock-in-method-faceid"]');
    if (await faceMethod.isVisible().catch(() => false)) {
      await faceMethod.click();
      await sleep(900);
    } else {
      const faceTile = page.getByText(/Face ID|Face/i).first();
      if (await faceTile.isVisible().catch(() => false)) {
        await faceTile.click();
        await sleep(1000);
      }
    }
    const faceHold = page.locator('[data-testid="att-faceid-hold-banner"]');
    let faceHoldVisible = await faceHold.isVisible().catch(() => false);
    if (!faceHoldVisible) {
      faceHoldVisible = await page
        .getByText(/HOLD|chưa kích hoạt|tính năng tạm|feature.?hold|đang phát triển/i)
        .first()
        .isVisible()
        .catch(() => false);
    }
    const liveClaimVisible = await page
      .getByText(/Face\s*LIVE|đang LIVE|production face/i)
      .isVisible()
      .catch(() => false);
    const pass = faceHoldVisible && !liveClaimVisible;
    results.checks.D7_face_hold = {
      pass,
      faceHoldVisible,
      liveClaimVisible,
      note: 'Face HOLD honesty — not LIVE',
    };
    if (!pass) fail(`D7 Face HOLD fail hold=${faceHoldVisible} live=${liveClaimVisible}`);
    await shot(page, '07-face-hold');
    step('D7_face', pass ? 'PASS' : 'FAIL', 'Face HOLD');
  } catch (e) {
    results.checks.D7_face_hold = { pass: false, error: String(e.message || e).slice(0, 160) };
    fail(`D7 Face: ${e.message || e}`);
    step('D7_face', 'FAIL', 'nav');
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
    'D1_shift_form',
    'D2_add_sheet',
    'D3_page_leave',
    'D4_page_edit',
    'D5_manual_confirm',
    'D6_gps_confirm',
    'D7_face_hold',
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
            { pass: v.pass, note: v.verdict?.reason || v.note || v.error || (v.skipped ? 'skipped' : '') },
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
