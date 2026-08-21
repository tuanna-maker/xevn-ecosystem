#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-FE-DIALOG-01-QA — U65 browser dialog chrome AC
 * Leave create + OT add · Face HOLD / S3=A honesty · theme-contrast --strict
 * Cấm: seed · Face LIVE · Attendance CLOSED · remaster DONE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-dialog-01-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-fe-dialog-01-qa');
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
  work_item_id: 'PO-HRM-UI-BRAND-FE-DIALOG-01-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['att-leave-create-dialog-precision', 'att-ot-add-dialog-precision', 'Face HOLD', 'S3=A'],
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
    s3_a_honesty: true,
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

async function clickTopTab(page, labelRe) {
  const btn = page.locator('button').filter({ hasText: labelRe }).first();
  await btn.click({ timeout: 12_000 });
  await sleep(1800);
}

async function openRequestsMenuItem(page, labelRe) {
  const trigger = page.locator('button').filter({ hasText: /Quản lý đơn|Requests/i }).first();
  await trigger.click();
  await sleep(500);
  const candidates = page.locator('[role="menuitem"], [data-radix-collection-item]');
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await candidates.nth(i).click();
      await sleep(1800);
      return text;
    }
  }
  throw new Error(`requests menu item not found for ${labelRe}`);
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

/** Measure precision dialog chrome: 4px primary bar, logo, glass, title, compact fields */
async function measureDialogChrome(page, testId) {
  return page.evaluate((tid) => {
    const root =
      document.querySelector(`[data-testid="${tid}"]`) ||
      document.querySelector('[role="dialog"]');
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
      maxWidthClass: /sm:max-w-\[920px\]|max-w-\[920px\]/.test(surface.className?.toString?.() || '') ||
        /920px/.test(getComputedStyle(surface).maxWidth || ''),
      computedMaxWidth: getComputedStyle(surface).maxWidth,
    };
  }, testId);
}

function chromePass(m, { requireCompact = false } = {}) {
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
  }
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
          !compactOk && 'compact date/time missing',
        ]
          .filter(Boolean)
          .join('; '),
  };
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
    if (results.network.length < 120) results.network.push(entry);
  });

  await injectPortalAuth(page, session);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);
  await shot(page, '00-attendance-shell');

  // ——— AC1 Leave create ———
  await clickTopTab(page, /Nghỉ phép|Leave/i);
  const leaveRoot = page.locator('[data-testid="att-leave-precision"]');
  await leaveRoot.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  await sleep(1200);
  await shot(page, '01-leave-list');

  const createBtn = leaveRoot
    .getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Create|Xin nghỉ/i })
    .first();
  const createVisible = await createBtn.isVisible().catch(() => false);
  if (!createVisible) {
    results.checks.leave_create_dialog = { pass: false, createVisible: false };
    fail('Leave create button not visible');
    step('leave_create', 'FAIL', 'create CTA missing');
  } else {
    await createBtn.click();
    await sleep(1000);
    const dlg = page.locator('[data-testid="att-leave-create-dialog-precision"]');
    const dlgOk = await dlg.isVisible().catch(() => false);
    const metrics = dlgOk ? await measureDialogChrome(page, 'att-leave-create-dialog-precision') : { found: false };
    const title = dlgOk
      ? await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first())
      : null;
    // Prefer titleMetrics for weight/size; merge into chrome
    if (title && metrics.found) {
      metrics.titleFontSize = title.fontSize;
      metrics.titleFontWeight = title.fontWeight;
      metrics.titleFontFamily = title.fontFamily;
      metrics.titleText = title.text;
    }
    const verdict = chromePass(metrics, { requireCompact: false });
    // Leave must have date fields
    const leaveFieldsOk =
      metrics.fieldClasses?.['xevn-field-date'] === true || (metrics.dateFieldCount || 0) > 0;
    const pass = dlgOk && verdict.pass && leaveFieldsOk;
    results.checks.leave_create_dialog = {
      pass,
      dlgOk,
      metrics,
      verdict,
      leaveFieldsOk,
      title,
    };
    if (!pass) fail(`Leave create AC fail: ${verdict.reason}; fields=${leaveFieldsOk}`);
    await shot(page, '02-leave-create-dialog');
    await dismissDialog(page);
    step('leave_create', pass ? 'PASS' : 'FAIL', verdict.reason);
  }

  // ——— AC2 OT add ———
  let otMenu = null;
  try {
    otMenu = await openRequestsMenuItem(page, /Làm thêm|Overtime|OT/i);
  } catch (e) {
    // try top tab
    try {
      await clickTopTab(page, /Làm thêm|Overtime/i);
      otMenu = 'top-tab';
    } catch (e2) {
      fail(`OT nav fail: ${String(e.message || e).slice(0, 80)}`);
    }
  }
  const otRoot = page.locator('[data-testid="att-ot-precision"], [data-testid*="ot"]').first();
  // Prefer known testid from ATT-D
  const otPrecision = page.locator('[data-testid="att-ot-precision"]');
  let otShell = (await otPrecision.isVisible().catch(() => false)) ? otPrecision : otRoot;
  if (!(await otShell.isVisible().catch(() => false))) {
    // page may already show OT after menu
    otShell = page.locator('main, [role="main"], body').first();
  }
  await sleep(1000);
  await shot(page, '03-ot-list');

  const addBtn = page
    .locator('[data-testid="att-ot-precision"]')
    .getByRole('button', { name: /Thêm|Add|Tạo|Đăng ký/i })
    .first();
  let addVisible = await addBtn.isVisible().catch(() => false);
  let addTarget = addBtn;
  if (!addVisible) {
    addTarget = page.getByRole('button', { name: /Thêm yêu cầu|Thêm đơn|Add request|Thêm/i }).first();
    addVisible = await addTarget.isVisible().catch(() => false);
  }
  if (!addVisible) {
    results.checks.ot_add_dialog = { pass: false, addVisible: false, otMenu };
    fail('OT add button not visible');
    step('ot_add', 'FAIL', 'add CTA missing');
  } else {
    await addTarget.click();
    await sleep(1000);
    const dlg = page.locator('[data-testid="att-ot-add-dialog-precision"]');
    const dlgOk = await dlg.isVisible().catch(() => false);
    const metrics = dlgOk ? await measureDialogChrome(page, 'att-ot-add-dialog-precision') : { found: false };
    const title = dlgOk
      ? await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first())
      : null;
    if (title && metrics.found) {
      metrics.titleFontSize = title.fontSize;
      metrics.titleFontWeight = title.fontWeight;
      metrics.titleFontFamily = title.fontFamily;
      metrics.titleText = title.text;
    }
    const verdict = chromePass(metrics, { requireCompact: true });
    const pass = dlgOk && verdict.pass;
    results.checks.ot_add_dialog = {
      pass,
      dlgOk,
      otMenu,
      metrics,
      verdict,
      title,
    };
    if (!pass) fail(`OT add AC fail: ${verdict.reason}`);
    await shot(page, '04-ot-add-dialog');
    await dismissDialog(page);
    step('ot_add', pass ? 'PASS' : 'FAIL', verdict.reason);
  }

  // ——— AC3 Face HOLD / S3=A honesty ———
  try {
    const clockBtn = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
    if (await clockBtn.isVisible().catch(() => false)) {
      await clockBtn.click();
      await sleep(1200);
    }
  } catch {
    /* */
  }
  const faceTile = page.getByText(/Face ID|Face/i).first();
  if (await faceTile.isVisible().catch(() => false)) {
    await faceTile.click();
    await sleep(1000);
  }
  const faceHold = page.locator('[data-testid="att-faceid-hold-banner"]');
  let faceHoldVisible = await faceHold.isVisible().catch(() => false);
  if (!faceHoldVisible) {
    const holdText = page.getByText(/HOLD|chưa kích hoạt|tính năng tạm|feature.?hold|đang phát triển/i).first();
    faceHoldVisible = await holdText.isVisible().catch(() => false);
  }
  const liveClaimUi = page.getByText(/Face\s*LIVE|đang LIVE|production face/i);
  const liveClaimVisible = await liveClaimUi.isVisible().catch(() => false);
  const s3Honesty =
    !liveClaimVisible &&
    results.honesty.s3_a_honesty === true &&
    results.honesty.face_live_claimed === false;
  results.checks.face_s3_honesty = {
    pass: faceHoldVisible && s3Honesty && !liveClaimVisible,
    faceHoldVisible,
    liveClaimVisible,
    s3_a: 'A',
    note: 'S3=A = HOLD path honesty; no Face LIVE invent',
  };
  if (!results.checks.face_s3_honesty.pass) {
    fail(`Face/S3 honesty fail hold=${faceHoldVisible} liveClaim=${liveClaimVisible}`);
  }
  await shot(page, '05-face-hold-honesty');
  step('face_s3', results.checks.face_s3_honesty.pass ? 'PASS' : 'FAIL', 'Face HOLD · S3=A');

  // Honesty locks
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
    'leave_create_dialog',
    'ot_add_dialog',
    'face_s3_honesty',
    'honesty_locks',
  ];
  const allPass = required.every((k) => results.checks[k]?.pass === true) && results.failReasons.length === 0;
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
          Object.entries(results.checks).map(([k, v]) => [k, { pass: v.pass, note: v.verdict?.reason || v.note }]),
        ),
        screens: results.screens,
        l0: results.l0,
        mutates: results.mutates.length,
        BASE,
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
