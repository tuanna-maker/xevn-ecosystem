#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-REC-A-QA — U65 browser recruitment brand AC
 * Deep-link ?tab= · titles ≥20 · no purple AI · Job/Hire dialog chrome ·
 * Reports campaign honesty S3=A · theme-contrast --strict
 * Cấm: seed · invent OCR · Face LIVE · Attendance CLOSED · remaster DONE
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
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-qa-browser-final.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-rec-a-qa');
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
  work_item_id: 'PO-HRM-UI-BRAND-W4-REC-A-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'Dashboard',
    'YCTD',
    'JD',
    'Jobs',
    'Candidates',
    'Interviews',
    'Reports',
    'Job create dialog',
    'Hire→Employee dialog',
    'theme-contrast --strict',
  ],
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
    ocr_invented: false,
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
    ['portal5175', PORTAL],
    ['portal8088', 'http://127.0.0.1:8088/'],
    ['hrm_fe', `${HRM_FE}/hr/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  // Prefer portal :5173; fallback hrm_fe :8080
  if (results.l0.portal5175 === 200) {
    BASE = PORTAL;
    PORTAL_MODE = true;
  } else if (results.l0.hrm_fe === 200) {
    BASE = HRM_FE;
    PORTAL_MODE = false;
    results.l0.portal_fallback = 'hrm_fe_8080';
  } else if (results.l0.portal8088 === 200) {
    BASE = 'http://127.0.0.1:8088';
    PORTAL_MODE = true;
  }
  results.env.BASE = BASE;
  results.env.PORTAL_MODE = PORTAL_MODE;
  save();
}

function q(path, tab) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (tab) u.searchParams.set('tab', tab);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  const urls = [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
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
      text: (el.textContent || '').trim().slice(0, 100),
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
  return fs >= 20 && w >= 600;
}

async function clearOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => null);
    await sleep(200);
  }
}

async function gotoTab(page, tab) {
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', tab), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2200);
  await clearOverlays(page);
}

async function dismissDialog(page) {
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ force: true });
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
      'xevn-field-line',
      'xevn-field-date',
      'xevn-field-select-md',
      'xevn-field-select-sm',
      'xevn-field-num',
      'xevn-field-name',
    ]) {
      fieldClasses[cls] = !!root.querySelector(`.${cls}`);
    }
    const mw = getComputedStyle(surface).maxWidth;
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
      computedMaxWidth: mw,
      near920: (() => {
        const n = parseFloat(mw || '0');
        return n >= 880 && n <= 960;
      })(),
    };
  }, testId);
}

function chromePass(m, { requireCompactFields = false, require920 = false } = {}) {
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
  if (requireCompactFields) {
    compactOk =
      m.fieldClasses?.['xevn-field-line'] ||
      m.fieldClasses?.['xevn-field-select-md'] ||
      m.fieldClasses?.['xevn-field-name'] ||
      m.fieldClasses?.['xevn-field-num'];
  }
  const widthOk = !require920 || m.near920 || parseFloat(m.computedMaxWidth || '0') >= 880;
  const pass = barOk && titleOk && logoOk && glassOk && compactOk && widthOk;
  return {
    pass,
    barOk,
    barH,
    barPrimary,
    titleOk,
    logoOk,
    glassOk,
    compactOk,
    widthOk,
    reason: pass
      ? 'ok'
      : [
          !barOk && `bar ${m.beforeH}/${m.beforeBg}`,
          !titleOk && `title ${m.titleFontSize}/${m.titleFontWeight}`,
          !logoOk && 'logo missing',
          !glassOk && 'glass missing',
          !compactOk && 'compact fields missing',
          !widthOk && `maxWidth ${m.computedMaxWidth}`,
        ]
          .filter(Boolean)
          .join('; '),
  };
}

async function scanPurpleAi(page, scopeSelector) {
  return page.evaluate((sel) => {
    const root = sel ? document.querySelector(sel) : document.body;
    if (!root) return { purpleHits: 0, samples: [], classHits: [] };
    const classHits = [];
    const classRe = /(purple|violet|indigo|fuchsia|bg-indigo|text-indigo|border-indigo|from-purple|to-purple)/i;
    root.querySelectorAll('[class]').forEach((el) => {
      const c = el.className?.toString?.() || '';
      if (classRe.test(c)) classHits.push(c.slice(0, 120));
    });
    const samples = [];
    let purpleHits = 0;
    const nodes = root.querySelectorAll(
      'h1,h2,h3,.font-display,[class*="Badge"],[class*="badge"],button,svg,.text-2xl,.text-xl',
    );
    for (const el of nodes) {
      const cs = getComputedStyle(el);
      for (const prop of ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke']) {
        const val = cs[prop];
        const m = String(val || '').match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
        if (!m) continue;
        const rgb = [Number(m[1]), Number(m[2]), Number(m[3])];
        const [r, g, b] = rgb;
        const nearP = Math.abs(r - 30) <= 12 && Math.abs(g - 64) <= 12 && Math.abs(b - 175) <= 12;
        if (nearP) continue;
        const purpleish = r >= 80 && b >= 140 && g <= r * 0.85 && b > g + 20;
        const indigoish = r >= 70 && r <= 120 && g >= 50 && g <= 100 && b >= 180;
        if (purpleish || indigoish) {
          purpleHits++;
          if (samples.length < 8) {
            samples.push({
              tag: el.tagName,
              prop,
              rgb: val,
              text: (el.textContent || '').trim().slice(0, 40),
            });
          }
        }
      }
    }
    return { purpleHits, samples, classHits: classHits.slice(0, 10) };
  }, scopeSelector || null);
}

async function measureTabTitle(page, testId, h2Re) {
  let titleLoc;
  if (testId) {
    const root = page.locator(`[data-testid="${testId}"]`).first();
    await root.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
    titleLoc = root.locator('h2').first();
    if (!(await titleLoc.isVisible().catch(() => false))) {
      titleLoc = page.locator('h2').filter({ hasText: h2Re }).first();
    }
  } else {
    titleLoc = page.locator('h2').filter({ hasText: h2Re }).first();
  }
  await titleLoc.waitFor({ state: 'visible', timeout: 12_000 }).catch(() => null);
  const m = await titleMetrics(titleLoc).catch(() => null);
  const purple = testId
    ? await scanPurpleAi(page, `[data-testid="${testId}"]`)
    : await scanPurpleAi(page, null);
  return { title: m, titleOk: titlePass(m), purple };
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
  const feOk = results.l0.hrm_fe === 200 || results.l0.portal5175 === 200 || results.l0.portal8088 === 200;
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
    if (method !== 'GET' && method !== 'HEAD') results.mutates.push(entry);
    if (results.network.length < 160) results.network.push(entry);
  });

  await injectPortalAuth(page, session);

  const tabPlan = [
    {
      id: 'dashboard',
      tab: 'dashboard',
      testId: 'rec-dashboard-tab-precision',
      h2: /Dashboard|Tuyển dụng|Tổng quan|Phễu/i,
      shot: '01-dashboard',
    },
    {
      id: 'requisitions',
      tab: 'requisitions',
      testId: 'rec-requisitions-tab-precision',
      h2: /Yêu cầu tuyển dụng/i,
      shot: '02-yctd',
    },
    {
      id: 'jd',
      tab: 'jd-library',
      testId: 'rec-jd-library-tab-precision',
      h2: /JD|Thư viện/i,
      shot: '03-jd',
    },
    {
      id: 'jobs',
      tab: 'jobs',
      testId: 'rec-jobs-tab-precision',
      h2: /Tin|tuyển dụng|Job posting/i,
      shot: '04-jobs',
    },
    {
      id: 'candidates',
      tab: 'candidates',
      testId: 'rec-candidates-tab-precision',
      h2: /Ứng viên/i,
      shot: '05-candidates',
    },
    {
      id: 'interviews',
      tab: 'interviews',
      testId: 'rec-interviews-tab-precision',
      h2: /Phỏng vấn/i,
      shot: '06-interviews',
    },
    {
      id: 'reports',
      tab: 'reports',
      testId: 'rec-reports-tab-precision',
      h2: /Báo cáo/i,
      shot: '07-reports',
    },
  ];

  const tabResults = {};
  let tabsPass = true;

  await gotoTab(page, 'dashboard');
  await shot(page, '00-recruitment-shell');

  for (const tab of tabPlan) {
    try {
      await gotoTab(page, tab.tab);
      const measured = await measureTabTitle(page, tab.testId, tab.h2);
      const classPurple = (measured.purple?.classHits || []).length > 0;
      if (!measured.titleOk) {
        tabsPass = false;
        fail(`${tab.id} title <20: ${JSON.stringify(measured.title)}`);
      }
      if (classPurple) {
        tabsPass = false;
        fail(`${tab.id} purple/indigo class: ${measured.purple.classHits.slice(0, 3).join(' | ')}`);
      }
      tabResults[tab.id] = {
        titleOk: measured.titleOk,
        title: measured.title,
        purpleClassHits: measured.purple?.classHits || [],
        purpleColorHits: measured.purple?.purpleHits || 0,
        purpleSamples: measured.purple?.samples || [],
      };
      await shot(page, tab.shot);
      step(`tab_${tab.id}`, measured.titleOk && !classPurple ? 'PASS' : 'FAIL', measured.title?.text || '');
    } catch (e) {
      tabsPass = false;
      fail(`${tab.id}: ${String(e.message || e).slice(0, 160)}`);
      tabResults[tab.id] = { error: String(e.message || e).slice(0, 200) };
      step(`tab_${tab.id}`, 'FAIL', String(e.message || e).slice(0, 120));
    }
  }

  results.checks.tabs_titles_no_purple = { pass: tabsPass, tabs: tabResults };

  // ——— AC4 Reports honesty ———
  try {
    await gotoTab(page, 'reports');
    const honesty = page.locator('[data-testid="rec-reports-campaign-honesty"]');
    await honesty.waitFor({ state: 'visible', timeout: 15_000 });
    const honestyText = ((await honesty.innerText()) || '').trim();
    const alertTitle = honesty.locator('.font-display').first();
    const alertM = await titleMetrics(alertTitle).catch(() => null);
    const hasOut = /ngoài MVP|OUT|không remaster|không claim LIVE/i.test(honestyText);
    const hasCampaign = /chiến dịch/i.test(honestyText);
    const honestyPass = hasOut && hasCampaign && titlePass(alertM);
    results.checks.reports_campaign_honesty = {
      pass: honestyPass,
      text: honestyText.slice(0, 320),
      title: alertM,
    };
    if (!honestyPass) fail(`Reports honesty S3=A FAIL`);
    await shot(page, '08-reports-honesty');
    step('reports_honesty', honestyPass ? 'PASS' : 'FAIL', honestyText.slice(0, 100));
  } catch (e) {
    results.checks.reports_campaign_honesty = { pass: false, error: String(e.message || e) };
    fail(`Reports honesty: ${String(e.message || e).slice(0, 160)}`);
    step('reports_honesty', 'FAIL', String(e.message || e).slice(0, 120));
  }

  // ——— AC2 Job create dialog ———
  try {
    await gotoTab(page, 'jobs');
    const createBtn = page.getByRole('button', { name: /Tạo tin tuyển dụng/i }).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await createBtn.click({ force: true });
    await sleep(1200);
    const dlg = page.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
    await dlg.waitFor({ state: 'visible', timeout: 12_000 });
    const chrome = await measureDialogChrome(page, 'rec-job-create-edit-dialog-precision');
    const cp = chromePass(chrome, { requireCompactFields: true, require920: true });
    results.checks.job_create_dialog = { pass: cp.pass, chrome, ...cp };
    if (!cp.pass) fail(`Job create dialog: ${cp.reason}`);
    await shot(page, '09-job-create-dialog');
    await dismissDialog(page);
    step('job_create_dialog', cp.pass ? 'PASS' : 'FAIL', cp.reason);
  } catch (e) {
    results.checks.job_create_dialog = { pass: false, error: String(e.message || e) };
    fail(`Job create: ${String(e.message || e).slice(0, 160)}`);
    step('job_create_dialog', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  // ——— AC3 Hire→Employee dialog ———
  try {
    await gotoTab(page, 'candidates');
    const candRoot = page.locator('[data-testid="rec-candidates-tab-precision"]');
    await candRoot.waitFor({ state: 'visible', timeout: 15_000 });
    await sleep(1500);

    const rowSelects = candRoot.locator('button[role="combobox"]');
    const n = await rowSelects.count();
    let opened = false;
    for (let i = 0; i < Math.min(n, 16); i++) {
      const trig = rowSelects.nth(i);
      const txt = ((await trig.innerText().catch(() => '')) || '').trim();
      if (/Đã tuyển|Hired/i.test(txt)) continue;
      if (/Nguồn|Source|Tất cả|All/i.test(txt)) continue;
      // Stage column selects are short labels
      if (txt.length > 40) continue;
      await trig.click({ force: true });
      await sleep(400);
      const hiredOpt = page.locator('[role="option"]').filter({ hasText: /Đã tuyển|Hired/i }).first();
      if (!(await hiredOpt.isVisible().catch(() => false))) {
        await page.keyboard.press('Escape');
        await sleep(200);
        continue;
      }
      await hiredOpt.click({ force: true });
      await sleep(1000);
      const hireDlg = page.locator('[data-testid="rec-hire-employee-link-dialog-precision"]');
      if (await hireDlg.isVisible().catch(() => false)) {
        opened = true;
        break;
      }
      await clearOverlays(page);
    }

    if (!opened) {
      results.checks.hire_employee_dialog = {
        pass: false,
        reason: 'could not open hire dialog',
        stageSelectCount: n,
      };
      fail('Hire→Employee dialog not opened');
      step('hire_dialog', 'FAIL', `stageSelects=${n}`);
    } else {
      const chrome = await measureDialogChrome(page, 'rec-hire-employee-link-dialog-precision');
      const cp = chromePass(chrome, { requireCompactFields: true, require920: false });
      results.checks.hire_employee_dialog = { pass: cp.pass, chrome, ...cp };
      if (!cp.pass) fail(`Hire dialog: ${cp.reason}`);
      await shot(page, '10-hire-employee-dialog');
      await dismissDialog(page);
      step('hire_dialog', cp.pass ? 'PASS' : 'FAIL', cp.reason);
    }
  } catch (e) {
    results.checks.hire_employee_dialog = { pass: false, error: String(e.message || e) };
    fail(`Hire dialog: ${String(e.message || e).slice(0, 160)}`);
    step('hire_dialog', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  const mutateCount = results.mutates.length;
  results.checks.zero_mutates = { pass: mutateCount === 0, count: mutateCount, mutates: results.mutates };
  if (mutateCount > 0) fail(`U65 mutates=${mutateCount}`);

  const required = [
    'tabs_titles_no_purple',
    'job_create_dialog',
    'hire_employee_dialog',
    'reports_campaign_honesty',
    'theme_contrast_strict',
    'zero_mutates',
  ];
  let allPass = true;
  for (const k of required) {
    if (!results.checks[k]?.pass) allPass = false;
  }

  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [
            k,
            { pass: v?.pass, reason: v?.reason || v?.error, title: v?.title?.text || v?.chrome?.titleText },
          ]),
        ),
        mutates: mutateCount,
        screens: results.screens.length,
        BASE,
        commit: COMMIT,
        tabs: Object.fromEntries(
          Object.entries(tabResults).map(([k, v]) => [
            k,
            { titleOk: v.titleOk, fs: v.title?.fontSize, text: v.title?.text, purpleClass: (v.purpleClassHits || []).length },
          ]),
        ),
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
  process.exit(3);
});
