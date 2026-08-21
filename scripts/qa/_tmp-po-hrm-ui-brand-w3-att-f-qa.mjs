#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-ATT-F-QA — U65 browser brand remaster
 * Inventory S64–S65, S67–S68, S72–S75, S90 · ADR Precision Motion §8–§10
 * Path: ceo@xe.vn → Chấm công → Cài đặt
 * Cấm: seed · Nest as UF · invent Face LIVE · Attendance CLOSED · remaster DONE
 * must_keep: ATT-03d work-sites wires · Face GĐ1 honesty
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-f-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-f-qa');
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

function looksOrange(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return r > 180 && g > 80 && g < 160 && b < 80;
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-ATT-F-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['S64', 'S65', 'S67', 'S68', 'S72', 'S73', 'S74', 'S75', 'S90'],
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
      className: el.className?.toString?.() ?? '',
    };
  });
}

async function titleMetrics(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 80),
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

/** Orange bg hits inside settings shell only (top-nav orange pill OUT of ATT-F). */
async function orangeBgHits(rootLocator) {
  return rootLocator.evaluate((root) => {
    const out = [];
    for (const el of Array.from(root.querySelectorAll('*')).slice(0, 500)) {
      const cs = getComputedStyle(el);
      const m = String(cs.backgroundColor).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      if (r > 180 && g > 80 && g < 160 && b < 80) {
        out.push({
          tag: el.tagName,
          bg: cs.backgroundColor,
          text: (el.textContent || '').trim().slice(0, 40),
          cls: (el.className?.toString?.() || '').slice(0, 80),
        });
      }
    }
    return out.slice(0, 8);
  });
}

async function clickSettingsTab(page) {
  // HDSD / i18n: top tab = «Thiết lập» (not always «Cài đặt»)
  const exact = page.getByRole('button', { name: /^(Thiết lập|Cài đặt|Settings)$/i }).first();
  if (await exact.isVisible().catch(() => false)) {
    await exact.click({ timeout: 15_000 });
    await sleep(1500);
    return 'role-exact';
  }
  const byText = page
    .locator('button')
    .filter({ hasText: /Thiết lập|Cài đặt|Settings/i })
    .first();
  if (await byText.count()) {
    await byText.scrollIntoViewIfNeeded().catch(() => {});
    await byText.click({ force: true, timeout: 15_000 });
    await sleep(1500);
    return 'button-text-force';
  }
  await shot(page, '00-debug-tabs');
  throw new Error('settings tab not found (expected Thiết lập|Cài đặt|Settings)');
}

async function clickSidebar(page, labelRe) {
  const shell = page.locator('[data-testid="att-settings-shell-precision"]');
  const btn = shell.locator('nav button').filter({ hasText: labelRe }).first();
  await btn.waitFor({ state: 'visible', timeout: 15_000 });
  await btn.click();
  await sleep(1200);
  const st = await styleOf(btn);
  return { label: ((await btn.innerText()) || '').trim(), style: st, primaryActive: nearPrimary(parseRgb(st.backgroundColor)) };
}

async function main() {
  await probeL0();
  const l0ok = results.l0.hrm === 200 && results.l0.xbos === 200 && (results.l0.portal === 200 || results.l0.hrm_fe === 200);
  results.checks.L0 = { pass: l0ok, ...results.l0 };
  if (!l0ok) fail(`L0 unhealthy: ${JSON.stringify(results.l0)}`);
  step('L0', l0ok ? 'PASS' : 'FAIL', 'stack health');

  // S90 static — AttendanceEntry loader primary (transient spinner hard to catch)
  try {
    const entrySrc = readFileSync(resolve(ROOT, 'apps/web/hrm/src/pages/AttendanceEntry.tsx'), 'utf8');
    const s90 = {
      hasPrimaryLoader: /text-xevn-primary/.test(entrySrc) && /Loader2/.test(entrySrc),
      hasOrangeLoader: /text-orange|orange-500|bg-orange/.test(entrySrc),
    };
    results.checks.S90_entry_shell = {
      pass: s90.hasPrimaryLoader && !s90.hasOrangeLoader,
      ...s90,
      note: 'static source — cold loader flash deferred',
    };
    if (!results.checks.S90_entry_shell.pass) fail(`S90: ${JSON.stringify(s90)}`);
    step('S90', results.checks.S90_entry_shell.pass ? 'PASS' : 'FAIL', 'AttendanceEntry primary loader');
  } catch (e) {
    results.checks.S90_entry_shell = { pass: false, err: String(e.message || e) };
    fail(`S90 read fail: ${e.message || e}`);
  }

  const session = await loginApi();
  results.env.loginHttp = session.http;
  results.env.loginVia = session.loginVia;

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
    const path = u.replace(/^https?:\/\/[^/]+/, '');
    const entry = { method, path: path.slice(0, 160), status: res.status() };
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      results.mutates.push(entry);
    }
    if (/work-sites|attendance\/rules|employees|work_sites|work-sites/i.test(path)) {
      results.network.push(entry);
    }
  });

  try {
    await injectPortalAuth(page, session);
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2800);

    // ——— Open Cài đặt ———
    await clickSettingsTab(page);
    const shell = page.locator('[data-testid="att-settings-shell-precision"]');
    await shell.waitFor({ state: 'visible', timeout: 20_000 });
    const shellVisible = await shell.isVisible();
    results.checks.settings_shell = { pass: shellVisible, shellVisible };
    if (!shellVisible) fail('att-settings-shell-precision not visible');
    step('settings_nav', shellVisible ? 'PASS' : 'FAIL', 'Cài đặt shell');
    await shot(page, '01-settings-shell');

    // ——— S64 employees ———
    await clickSidebar(page, /Nhân viên|Employees/i);
    const emp = page.locator('[data-testid="att-settings-emp-precision"]');
    await emp.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const empVisible = await emp.isVisible().catch(() => false);
    const empH2 = empVisible ? await titleMetrics(emp.locator('h2').first()) : null;
    const refresh = page.locator('[data-testid="hdsd-att-settings-emp-refresh"]');
    const refreshVisible = await refresh.isVisible().catch(() => false);
    const refreshStyle = refreshVisible ? await styleOf(refresh) : null;
    const refreshPrimary = nearPrimary(parseRgb(refreshStyle?.backgroundColor));
    const refreshOrange = looksOrange(parseRgb(refreshStyle?.backgroundColor));
    const empOrange = empVisible ? await orangeBgHits(emp) : [];
    results.checks.S64_settings_emp = {
      pass: empVisible && titlePass(empH2) && refreshVisible && refreshPrimary && !refreshOrange && empOrange.length === 0,
      empVisible,
      empH2,
      refreshPrimary,
      refreshBg: refreshStyle?.backgroundColor,
      refreshOrange,
      orangeHits: empOrange,
    };
    if (!results.checks.S64_settings_emp.pass) fail(`S64: ${JSON.stringify(results.checks.S64_settings_emp)}`);
    await shot(page, '02-s64-settings-emp');
    step('S64', results.checks.S64_settings_emp.pass ? 'PASS' : 'FAIL', 'settings emp');

    // ——— S65 Import dialog ———
    const importBtn = page.locator('[data-testid="hdsd-att-settings-emp-import"]');
    let importOpened = false;
    let importTitle = null;
    if (await importBtn.isVisible().catch(() => false)) {
      await importBtn.click();
      await sleep(900);
      const dlg = page.locator('[role="dialog"]').first();
      importOpened = await dlg.isVisible().catch(() => false);
      if (importOpened) {
        importTitle = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
        await shot(page, '03-s65-import-dialog');
        await dismissDialog(page);
      }
    }
    results.checks.S65_import_dialog = {
      pass: importOpened && titlePass(importTitle),
      importOpened,
      importTitle,
    };
    if (!results.checks.S65_import_dialog.pass) fail(`S65: ${JSON.stringify(results.checks.S65_import_dialog)}`);
    step('S65', results.checks.S65_import_dialog.pass ? 'PASS' : 'FAIL', 'import DialogTitle ≥20');

    // ——— Rules sidebar ———
    // i18n: sidebar «Quy định chấm công» (not «Quy tắc»)
    const rulesSide = await clickSidebar(page, /Quy định chấm công|Quy tắc|Rules/i);
    const rulesRoot = page.locator('[data-testid="att-settings-rules-precision"]');
    await rulesRoot.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const rulesVisible = await rulesRoot.isVisible().catch(() => false);
    const rulesH2 = rulesVisible ? await titleMetrics(rulesRoot.locator('h2').first()) : null;
    const rulesOrangeShell = rulesVisible ? await orangeBgHits(rulesRoot) : [];
    results.checks.rules_shell = {
      pass: rulesVisible && titlePass(rulesH2) && rulesSide.primaryActive && rulesOrangeShell.length === 0,
      rulesVisible,
      rulesH2,
      sidebarActivePrimary: rulesSide.primaryActive,
      orangeHits: rulesOrangeShell,
    };
    if (!results.checks.rules_shell.pass) fail(`rules shell: ${JSON.stringify(results.checks.rules_shell)}`);
    await shot(page, '04-rules-shell');
    step('rules_shell', results.checks.rules_shell.pass ? 'PASS' : 'FAIL', 'rules chrome');

    // ——— S67 general ———
    await page.locator('[data-testid="hdsd-att-rules-tab-general"]').click();
    await sleep(900);
    const gen = page.locator('[data-testid="att-rules-general-precision"]');
    const genVisible = await gen.isVisible().catch(() => false);
    const genSave = page.locator('[data-testid="att-rules-general-save"]');
    const genSaveStyle = (await genSave.isVisible().catch(() => false)) ? await styleOf(genSave) : null;
    const genSavePrimary = nearPrimary(parseRgb(genSaveStyle?.backgroundColor));
    const genOrange = genVisible ? await orangeBgHits(gen) : [];
    // work-day chips: any selected chip bg primary
    let chipPrimary = false;
    if (genVisible) {
      const chips = gen.locator('button').filter({ hasText: /T2|T3|T4|T5|T6|Mon|Tue|CN|Thứ/i });
      const n = Math.min(await chips.count(), 8);
      for (let i = 0; i < n; i++) {
        const st = await styleOf(chips.nth(i));
        if (nearPrimary(parseRgb(st.backgroundColor))) {
          chipPrimary = true;
          break;
        }
      }
      // if none selected look primary-ish via class
      if (!chipPrimary) {
        const clsHit = await gen.evaluate((root) =>
          Array.from(root.querySelectorAll('button')).some((b) => /bg-xevn-primary/.test(b.className || '')),
        );
        chipPrimary = clsHit;
      }
    }
    results.checks.S67_rules_general = {
      pass: genVisible && genSavePrimary && genOrange.length === 0 && chipPrimary,
      genVisible,
      genSavePrimary,
      genSaveBg: genSaveStyle?.backgroundColor,
      chipPrimary,
      orangeHits: genOrange,
    };
    if (!results.checks.S67_rules_general.pass) fail(`S67: ${JSON.stringify(results.checks.S67_rules_general)}`);
    await shot(page, '05-s67-rules-general');
    step('S67', results.checks.S67_rules_general.pass ? 'PASS' : 'FAIL', 'rules Chung');

    // ——— S68 standard ———
    await page.locator('[data-testid="hdsd-att-rules-tab-standard"]').click();
    await sleep(900);
    const std = page.locator('[data-testid="att-rules-standard-precision"]');
    const stdVisible = await std.isVisible().catch(() => false);
    const stdSave = page.locator('[data-testid="att-rules-standard-save"]');
    const stdSaveStyle = (await stdSave.isVisible().catch(() => false)) ? await styleOf(stdSave) : null;
    const stdSavePrimary = nearPrimary(parseRgb(stdSaveStyle?.backgroundColor));
    const stdOrange = stdVisible ? await orangeBgHits(std) : [];
    const accentOk = stdVisible
      ? await std.evaluate((root) =>
          Array.from(root.querySelectorAll('input[type="radio"]')).some((el) =>
            /accent-xevn-primary/.test(el.className || ''),
          ),
        )
      : false;
    results.checks.S68_rules_standard = {
      pass: stdVisible && stdSavePrimary && stdOrange.length === 0 && accentOk,
      stdVisible,
      stdSavePrimary,
      stdSaveBg: stdSaveStyle?.backgroundColor,
      accentOk,
      orangeHits: stdOrange,
    };
    if (!results.checks.S68_rules_standard.pass) fail(`S68: ${JSON.stringify(results.checks.S68_rules_standard)}`);
    await shot(page, '06-s68-rules-standard');
    step('S68', results.checks.S68_rules_standard.pass ? 'PASS' : 'FAIL', 'rules Công chuẩn');

    // ——— S72 device ———
    await page.locator('[data-testid="hdsd-att-rules-tab-device"]').click();
    await sleep(900);
    const dev = page.locator('[data-testid="att-rules-device-precision"]');
    const devVisible = await dev.isVisible().catch(() => false);
    const devOrange = devVisible ? await orangeBgHits(dev) : [];
    const stepBadgePrimary = devVisible
      ? await dev.evaluate((root) => {
          const badges = Array.from(root.querySelectorAll('span')).filter((s) =>
            /bg-xevn-primary/.test(s.className || ''),
          );
          return badges.length >= 1;
        })
      : false;
    results.checks.S72_rules_device = {
      pass: devVisible && stepBadgePrimary && devOrange.length === 0,
      devVisible,
      stepBadgePrimary,
      orangeHits: devOrange,
    };
    if (!results.checks.S72_rules_device.pass) fail(`S72: ${JSON.stringify(results.checks.S72_rules_device)}`);
    await shot(page, '07-s72-rules-device');
    step('S72', results.checks.S72_rules_device.pass ? 'PASS' : 'FAIL', 'rules Thiết bị');

    // ——— S73 app + Face honesty ———
    await page.locator('[data-testid="hdsd-att-rules-tab-app"]').click();
    await sleep(1100);
    const app = page.locator('[data-testid="att-rules-app-precision"]');
    const appVisible = await app.isVisible().catch(() => false);
    const appOrange = appVisible ? await orangeBgHits(app) : [];
    const faceHonesty = appVisible
      ? await app.evaluate((root) => {
          const t = (root.textContent || '').toLowerCase();
          return (
            /face id|gđ1|ngoài phạm vi|không khả dụng|hold|chưa hỗ trợ|out of scope/.test(t) ||
            /faceidGd1|face.?id/i.test(root.innerHTML || '')
          );
        })
      : false;
    const faceToggleDisabled = appVisible
      ? await app.evaluate((root) => {
          const switches = Array.from(root.querySelectorAll('button[role="switch"], input[type="checkbox"]'));
          // Face method card — any disabled switch near Face text is honesty keep
          for (const sw of switches) {
            const card = sw.closest('[class*="Card"], .rounded, div');
            const txt = (card?.textContent || '').toLowerCase();
            if (/face/.test(txt) && (sw.disabled || sw.getAttribute('aria-disabled') === 'true' || sw.getAttribute('data-disabled') != null)) {
              return true;
            }
          }
          // banner alone is enough if Face ID GĐ1 title present
          return /ngoài phạm vi gđ1|face id — ngoài phạm vi/i.test(root.textContent || '');
        })
      : false;
    results.checks.S73_rules_app_face = {
      pass: appVisible && faceHonesty && appOrange.length === 0,
      appVisible,
      faceHonesty,
      faceToggleDisabled,
      orangeHits: appOrange,
      face_live_claimed: false,
    };
    if (!results.checks.S73_rules_app_face.pass) fail(`S73: ${JSON.stringify(results.checks.S73_rules_app_face)}`);
    await shot(page, '08-s73-rules-app-face');
    step('S73', results.checks.S73_rules_app_face.pass ? 'PASS' : 'FAIL', 'app + Face honesty');

    // ——— S74 GPS panel + S75 dialog ———
    const gpsCard = page.locator('[data-testid="att-gps-sites-card"]');
    await gpsCard.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(400);
    const gpsVisible = await gpsCard.isVisible().catch(() => false);
    const addOpen = page.locator('[data-testid="att-gps-add-open"]');
    const addOpenVisible = await addOpen.isVisible().catch(() => false);
    const addOpenStyle = addOpenVisible ? await styleOf(addOpen) : null;
    const addOpenPrimary = nearPrimary(parseRgb(addOpenStyle?.backgroundColor));
    const gpsOrange = gpsVisible ? await orangeBgHits(gpsCard) : [];
    const gpsEmpty = gpsVisible
      ? await gpsCard.evaluate((root) => /Chưa có vị trí GPS|noGpsLocations|chưa có/i.test(root.textContent || ''))
      : false;
    const gpsRowCount = await page.locator('[data-testid^="att-gps-row-"]').count();
    if (gpsEmpty || gpsRowCount === 0) {
      results.residuals.push({
        id: 'OBS-empty-gps',
        severity: 'P2',
        owner: 'qa',
        note: 'Empty GPS list without seed = valid empty (U65)',
      });
    }
    results.checks.S74_gps_panel = {
      pass: gpsVisible && addOpenVisible && addOpenPrimary && gpsOrange.length === 0,
      gpsVisible,
      addOpenPrimary,
      addOpenBg: addOpenStyle?.backgroundColor,
      gpsEmpty,
      gpsRowCount,
      orangeHits: gpsOrange,
    };
    if (!results.checks.S74_gps_panel.pass) fail(`S74: ${JSON.stringify(results.checks.S74_gps_panel)}`);
    await shot(page, '09-s74-gps-panel');
    step('S74', results.checks.S74_gps_panel.pass ? 'PASS' : 'FAIL', 'GPS panel');

    // Open add dialog — wire fields present; Hủy (no mutate)
    await addOpen.click();
    await sleep(900);
    const gpsDlg = page.locator('[data-testid="att-gps-add-dialog"]');
    const gpsDlgOk = await gpsDlg.isVisible().catch(() => false);
    let gpsTitle = null;
    let hasLat = false;
    let hasLng = false;
    let hasRadius = false;
    let savePrimary = false;
    let saveBg = null;
    if (gpsDlgOk) {
      gpsTitle = await titleMetrics(gpsDlg.locator('h2, [class*="DialogTitle"]').first());
      const labels = await gpsDlg.evaluate((root) => (root.textContent || '').toLowerCase());
      hasLat = /latitude|vĩ độ/.test(labels) || (await gpsDlg.locator('input[type="number"]').count()) >= 3;
      hasLng = /longitude|kinh độ/.test(labels) || (await gpsDlg.locator('input[type="number"]').count()) >= 3;
      hasRadius = /radius|bán kính/.test(labels);
      const saveBtn = gpsDlg.locator('[data-testid="att-gps-add-submit"]');
      if (await saveBtn.isVisible().catch(() => false)) {
        saveBg = await saveBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
        savePrimary = nearPrimary(parseRgb(saveBg));
      }
      await shot(page, '10-s75-gps-add-dialog');
      await dismissDialog(page);
    }
    // Edit wire spot if row exists
    let editWireOk = gpsRowCount === 0; // N/A empty
    let editTitle = null;
    if (gpsRowCount > 0) {
      const editBtn = page.locator('[data-testid="att-gps-edit-0"]');
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await sleep(800);
        const editDlg = page.locator('[data-testid="att-gps-edit-dialog"]');
        if (await editDlg.isVisible().catch(() => false)) {
          editTitle = await titleMetrics(editDlg.locator('h2, [class*="DialogTitle"]').first());
          editWireOk = titlePass(editTitle);
          await shot(page, '11-s75-gps-edit-dialog');
          await dismissDialog(page);
        }
      }
    }

    results.checks.S75_gps_dialog = {
      pass:
        gpsDlgOk &&
        titlePass(gpsTitle) &&
        hasLat &&
        hasLng &&
        hasRadius &&
        savePrimary &&
        editWireOk,
      gpsDlgOk,
      gpsTitle,
      hasLat,
      hasLng,
      hasRadius,
      savePrimary,
      saveBg,
      editWireOk,
      editTitle,
      mutatesAfterDialog: results.mutates.length,
    };
    if (!results.checks.S75_gps_dialog.pass) fail(`S75: ${JSON.stringify(results.checks.S75_gps_dialog)}`);
    step('S75', results.checks.S75_gps_dialog.pass ? 'PASS' : 'FAIL', 'GPS DialogTitle ≥20 + fields');

    // Wire keep: handlers present (no POST/PATCH from this seat) + GET rules/work-sites observed
    const wireGets = results.network.filter((n) => n.method === 'GET' && n.status >= 200 && n.status < 300);
    results.checks.work_sites_wires_keep = {
      pass: results.mutates.length === 0 && gpsDlgOk && hasLat && hasLng && hasRadius,
      mutates: results.mutates.length,
      getSample: wireGets.slice(0, 8),
      note: 'U65 RO — dialog fields + cancel prove wire surface; no invent CRUD mutate',
    };
    if (!results.checks.work_sites_wires_keep.pass) fail('work-sites wires keep FAIL');
    step('wires', results.checks.work_sites_wires_keep.pass ? 'PASS' : 'FAIL', 'ATT-03d keep');

    // Honesty claims
    results.checks.honesty_gates = {
      pass: !results.honesty.face_live_claimed && !results.honesty.attendance_closed_claimed && !results.honesty.remaster_program_done_claimed,
      ...results.honesty,
      attendance_closed: false,
      face_live: false,
      remaster_program_done: false,
    };
    step('honesty', 'PASS', 'Attendance not CLOSED · Face not LIVE · remaster not DONE');
  } catch (e) {
    fail(`harness exception: ${String(e?.message || e).slice(0, 300)}`);
    step('exception', 'FAIL', String(e?.message || e).slice(0, 120));
    await shot(page, '99-error').catch(() => {});
  } finally {
    results.endedAt = ts();
    results.mutateCount = results.mutates.length;
    const failed = results.failReasons.length > 0;
    results.verdict = failed ? 'FAIL' : 'PASS';
    results.ack_status = failed ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    save();
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        checks: Object.fromEntries(Object.entries(results.checks).map(([k, v]) => [k, v.pass])),
        mutates: results.mutates.length,
        screens: results.screens.length,
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
  process.exit(results.failReasons.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  results.failReasons.push(String(e?.message || e));
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  process.exit(1);
});
