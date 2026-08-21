#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-ATT-E-QA — U65 browser brand remaster
 * Inventory S05–S08 · S13–S14 · S29–S34 · S62–S63 · ADR Precision Motion §8–§10
 * Cấm: seed · invent Face LIVE · Attendance CLOSED · remaster DONE · invent QR card · Nest as UF
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-e-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-e-qa');
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

function looksPurple(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // purple/violet AI: high R+B, low G; exclude primary #1E40AF
  return r >= 100 && b >= 140 && g <= 100 && Math.abs(r - 30) > 20 && Math.abs(b - 175) > 25;
}

function looksPurpleHex(hex) {
  if (!hex) return false;
  const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return looksPurple([r, g, b]);
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-ATT-E-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'S05',
    'S06',
    'S07',
    'S08',
    'S13',
    'S14',
    'S29',
    'S30',
    'S31',
    'S32',
    'S33',
    'S34',
    'S62',
    'S63',
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
    qr_card_invented: false,
    employee_qr_card_live: false,
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

async function purpleAiBgHits(rootLocator, testId) {
  return rootLocator.evaluate((root, tid) => {
    const out = [];
    const scope = tid ? document.querySelector(`[data-testid="${tid}"]`) || root : root;
    for (const el of Array.from(scope.querySelectorAll('*')).slice(0, 500)) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const m = String(bg).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      if (r >= 100 && b >= 160 && g <= 90 && Math.abs(r - 30) > 20) {
        out.push({ tag: el.tagName, bg });
      }
    }
    return out.slice(0, 6);
  }, testId);
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

function staticDialogTitleFloor(relPath, marker) {
  const abs = resolve(ROOT, relPath);
  const src = readFileSync(abs, 'utf8');
  const idx = src.indexOf(marker);
  if (idx < 0) return { ok: false, reason: `marker missing: ${marker}` };
  const slice = src.slice(Math.max(0, idx - 80), idx + 200);
  const ok = /text-\[20px\]/.test(slice) && /font-bold/.test(slice);
  return { ok, slice: slice.replace(/\s+/g, ' ').slice(0, 160) };
}

async function main() {
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

  // Static S14 confirm DialogTitle floor (U65: no invent QR scan to open dialog)
  const s14Static = staticDialogTitleFloor(
    'apps/web/hrm/src/components/attendance/QRCodeScanner.tsx',
    'att-qr-confirm-dialog',
  );
  results.checks.S14_dialog_static = {
    pass: s14Static.ok,
    ...s14Static,
    note: 'Live confirm Dialog needs QR scan — U65 no invent; assert text-[20px] font-bold at DialogTitle',
  };
  if (!s14Static.ok) fail(`S14 static DialogTitle: ${JSON.stringify(s14Static)}`);
  step('S14_static', s14Static.ok ? 'PASS' : 'FAIL', 'QR confirm DialogTitle class floor');

  const session = await loginApi();
  step('login', 'PASS', `HTTP ${session.http}`);

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
  await sleep(3000);

  // ——— S05–S08 overview charts ———
  const overview = page.locator('[data-testid="att-overview-charts-precision"]');
  await overview.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => null);
  const overviewVisible = await overview.isVisible().catch(() => false);

  const chartIds = [
    'att-chart-leave-month',
    'att-chart-leave-dept',
    'att-chart-leave-type',
    'att-chart-late-early-list',
  ];
  const chartMetrics = {};
  for (const id of chartIds) {
    const el = page.locator(`[data-testid="${id}"]`).first();
    const vis = await el.isVisible().catch(() => false);
    chartMetrics[id] = vis ? await titleMetrics(el) : null;
  }
  const piePurple = await page.evaluate(() => {
    const hits = [];
    const root = document.querySelector('[data-testid="att-overview-charts-precision"]');
    if (!root) return hits;
    for (const el of root.querySelectorAll('[style*="background"], path, circle, rect')) {
      const fill = el.getAttribute('fill') || '';
      const style = el.getAttribute('style') || '';
      const bg = getComputedStyle(el).backgroundColor;
      const blob = `${fill} ${style} ${bg}`;
      if (/purple|#a855f7|#c084fc|#7c3aed|#9333ea|#8b5cf6|#6366f1/i.test(blob)) {
        hits.push(blob.slice(0, 80));
      }
    }
    // legend swatches
    for (const el of root.querySelectorAll('[style*="backgroundColor"], [style*="background-color"]')) {
      const s = el.getAttribute('style') || '';
      const m = s.match(/#([0-9a-f]{6})/i);
      if (m) {
        const n = parseInt(m[1], 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        if (r >= 100 && b >= 140 && g <= 100 && Math.abs(r - 30) > 20) hits.push(`#${m[1]}`);
      }
    }
    return hits.slice(0, 8);
  });
  const purpleAiOverview = overviewVisible
    ? await purpleAiBgHits(overview, 'att-overview-charts-precision')
    : [];

  const chartsPass =
    overviewVisible &&
    chartIds.every((id) => titlePass(chartMetrics[id])) &&
    (piePurple?.length || 0) === 0 &&
    (purpleAiOverview?.length || 0) === 0;

  results.checks.S05_S08_charts = {
    pass: chartsPass,
    overviewVisible,
    chartMetrics,
    piePurple,
    purpleAiBg: purpleAiOverview,
  };
  if (!chartsPass) fail(`S05–S08 charts: ${JSON.stringify(results.checks.S05_S08_charts)}`);
  await shot(page, '01-s05-s08-overview-charts');
  step('S05_S08', chartsPass ? 'PASS' : 'FAIL', 'overview chart titles ≥20 · no purple pie');

  // ——— S13–S14 QR clock + PROP-03e SKIP ———
  await page.locator('[data-testid="attendance-tab-clock-in"]').click();
  await sleep(1500);
  const qrMethod = page.locator('[data-testid="clock-in-method-qrcode"]');
  if (await qrMethod.isVisible().catch(() => false)) {
    await qrMethod.click();
    await sleep(1200);
  }
  const qrCard = page.locator('[data-testid="att-qr-clock-precision"]');
  await qrCard.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
  const qrVisible = await qrCard.isVisible().catch(() => false);
  const qrTitle = qrVisible
    ? await titleMetrics(qrCard.locator('h3, [class*="CardTitle"], .text-\\[20px\\]').first())
    : null;
  // CardTitle may not match; try first text-[20px] inside card
  let qrTitle2 = qrTitle;
  if (!titlePass(qrTitle2) && qrVisible) {
    const t20 = qrCard.locator('.text-\\[20px\\], [class*="text-[20px]"]').first();
    if (await t20.count()) qrTitle2 = await titleMetrics(t20);
  }
  const startBtn = page.locator('[data-testid="att-qr-start-scan"]');
  const startVisible = await startBtn.isVisible().catch(() => false);
  const startStyle = startVisible ? await styleOf(startBtn) : null;
  const startPrimary = nearPrimary(parseRgb(startStyle?.backgroundColor));

  const propSkip = page.locator('[data-testid="att-prop-03e-qr-card-skip"]');
  const propSkipVisible = await propSkip.isVisible().catch(() => false);
  const employeeQrLive =
    (await page.locator('[data-testid*="employee-qr"], [data-testid*="EmployeeQR"]').count().catch(() => 0)) >
      0 ||
    (await page.getByText(/EmployeeQRCard|Phát hành thẻ QR|Issuance QR/i).count().catch(() => 0)) > 0;
  // Confirm dialog should NOT be open (no invent scan)
  const confirmOpen = await page.locator('[data-testid="att-qr-confirm-dialog"]').isVisible().catch(() => false);

  const qrPass =
    qrVisible &&
    titlePass(qrTitle2) &&
    startVisible &&
    startPrimary &&
    propSkipVisible &&
    !employeeQrLive &&
    results.checks.S14_dialog_static.pass;

  results.checks.S13_S14_qr = {
    pass: qrPass,
    qrVisible,
    qrTitle: qrTitle2,
    startPrimary,
    startBg: startStyle?.backgroundColor,
    propSkipVisible,
    employeeQrLive,
    confirmOpenLive: confirmOpen,
    s14StaticOk: results.checks.S14_dialog_static.pass,
    note: 'S14 live Dialog N/A without QR invent — static floor + S13 CardTitle ≥20',
  };
  if (!qrPass) fail(`S13–S14 QR: ${JSON.stringify(results.checks.S13_S14_qr)}`);
  await shot(page, '02-s13-qr-clock-prop03e-skip');
  step('S13_S14', qrPass ? 'PASS' : 'FAIL', 'QR clock + PROP-03e SKIP');

  // Face HOLD (must keep)
  const faceMethod = page.locator('[data-testid="clock-in-method-faceid"]');
  if (await faceMethod.isVisible().catch(() => false)) {
    await faceMethod.click();
    await sleep(900);
  }
  const faceHold = page.locator('[data-testid="att-faceid-hold-banner"]');
  const faceHoldVisible = await faceHold.isVisible().catch(() => false);
  results.checks.face_honesty = { pass: faceHoldVisible, faceHoldVisible };
  if (!faceHoldVisible) fail('Face honesty banner missing');
  await shot(page, '03-face-hold');
  step('face', faceHoldVisible ? 'PASS' : 'FAIL', 'Face HOLD');

  // ——— S29–S30 records + export + date ———
  const recordsLabel = await openAttendanceMenuItem(page, /dữ liệu chấm công|bản ghi|records/i);
  const recordsRoot = page.locator('[data-testid="att-records-precision"]');
  await recordsRoot.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  const recordsVisible = await recordsRoot.isVisible().catch(() => false);
  const recordsH2 = recordsVisible ? await titleMetrics(recordsRoot.locator('h2').first()) : null;
  const dateFilter = page.locator('[data-testid="att-records-date-filter"]');
  const dateVisible = await dateFilter.isVisible().catch(() => false);
  const exportBtn = page.locator('[data-testid="att-records-export"]');
  const exportVisible = await exportBtn.isVisible().catch(() => false);

  let exportDlgTitle = null;
  let exportDlgOk = false;
  if (exportVisible) {
    await exportBtn.click();
    await sleep(800);
    const dlg = page.locator('[data-testid="att-export-dialog-precision"]');
    exportDlgOk = await dlg.isVisible().catch(() => false);
    if (exportDlgOk) {
      exportDlgTitle = await titleMetrics(
        page.locator('[role="dialog"]').locator('h2, [class*="DialogTitle"]').first(),
      );
      await shot(page, '04-s29-export-dialog');
      await dismissDialog(page);
    }
  }
  const recordsPurple = recordsVisible ? await purpleAiBgHits(recordsRoot, 'att-records-precision') : [];
  const recordsPass =
    recordsVisible &&
    titlePass(recordsH2) &&
    dateVisible &&
    exportVisible &&
    exportDlgOk &&
    titlePass(exportDlgTitle) &&
    (recordsPurple?.length || 0) === 0;

  results.checks.S29_S30_records = {
    pass: recordsPass,
    recordsLabel,
    recordsVisible,
    recordsH2,
    dateVisible,
    exportVisible,
    exportDlgOk,
    exportDlgTitle,
    purpleAiBg: recordsPurple,
  };
  if (!recordsPass) fail(`S29–S30: ${JSON.stringify(results.checks.S29_S30_records)}`);
  await shot(page, '04-s29-s30-records');
  step('S29_S30', recordsPass ? 'PASS' : 'FAIL', 'records date+export chrome');

  // ——— S34 summary alias ———
  const summaryLabel = await openAttendanceMenuItem(page, /tổng hợp công|tổng hợp|summary/i).catch(async (e) => {
    results.residuals.push({
      id: 'OBS-S34-MENU-LABEL',
      severity: 'P2',
      owner: 'qa',
      note: String(e.message || e).slice(0, 160),
    });
    return null;
  });
  await sleep(1200);
  const summaryRoot = page.locator(
    '[data-testid="att-records-precision"], [data-testid="att-records-fallback-precision"]',
  );
  const summaryVisible = await summaryRoot.first().isVisible().catch(() => false);
  const summaryH2 = summaryVisible ? await titleMetrics(summaryRoot.first().locator('h2').first()) : null;
  const summaryPass = summaryVisible && titlePass(summaryH2);
  results.checks.S34_summary_alias = {
    pass: summaryPass,
    summaryLabel,
    summaryVisible,
    summaryH2,
    note: 'summary → same records wire honesty',
  };
  if (!summaryPass) fail(`S34 summary: ${JSON.stringify(results.checks.S34_summary_alias)}`);
  await shot(page, '05-s34-summary-alias');
  step('S34', summaryPass ? 'PASS' : 'FAIL', 'summary alias');

  // ——— S31–S33 weekly ———
  await openAttendanceMenuItem(page, /chấm công tuần|tuần|weekly/i);
  const weekly = page.locator('[data-testid="att-weekly-precision"]');
  await weekly.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  const weeklyVisible = await weekly.isVisible().catch(() => false);
  const weeklyH2 = weeklyVisible ? await titleMetrics(weekly.locator('h2').first()) : null;
  const stubPencil = page.locator('[data-testid="att-weekly-stub-pencil"]');
  const stubOk = await stubPencil.isVisible().catch(() => false);
  const reloadBtn = weeklyVisible
    ? weekly.getByRole('button', { name: /Tải lại|Reload|Làm mới/i }).first()
    : null;
  const reloadVisible = reloadBtn ? await reloadBtn.isVisible().catch(() => false) : false;
  const reloadStyle = reloadVisible ? await styleOf(reloadBtn) : null;
  const reloadPrimary = nearPrimary(parseRgb(reloadStyle?.backgroundColor));
  const weeklyPurple = weeklyVisible ? await purpleAiBgHits(weekly, 'att-weekly-precision') : [];

  // S32 cell dialog — click first clickable cell if present
  let cellDlgOpened = false;
  let cellTitle = null;
  if (weeklyVisible) {
    const cell = weekly.locator('td button, td[role="button"], button[data-testid*="cell"], td').filter({
      hasText: /\d|P|X|—|-/i,
    }).first();
    // Prefer explicit clickable attendance cells
    const clickable = weekly.locator('[class*="cursor-pointer"]').first();
    const target = (await clickable.count()) ? clickable : cell;
    if (await target.isVisible().catch(() => false)) {
      await target.click({ timeout: 5000 }).catch(() => null);
      await sleep(700);
      const cellDlg = page.locator('[data-testid="att-weekly-cell-dialog-precision"], [data-testid="att-weekly-cell-dialog"]');
      cellDlgOpened = await cellDlg.isVisible().catch(() => false);
      if (cellDlgOpened) {
        cellTitle = await titleMetrics(
          page.locator('[data-testid="att-weekly-cell-detail-title"]').first(),
        );
        await shot(page, '06-s32-weekly-cell-dialog');
        await dismissDialog(page);
      }
    }
  }
  const cellStatic = staticDialogTitleFloor(
    'apps/web/hrm/src/pages/Attendance.tsx',
    'att-weekly-cell-dialog',
  );
  if (!cellDlgOpened) {
    results.residuals.push({
      id: 'OBS-S32-CELL-EMPTY',
      severity: 'P2',
      owner: 'qa',
      note: 'Weekly cell Dialog not opened under U65 empty/no clickable cell — static text-[20px] verified',
    });
  }
  const weeklyPass =
    weeklyVisible &&
    titlePass(weeklyH2) &&
    stubOk &&
    reloadPrimary &&
    (weeklyPurple?.length || 0) === 0 &&
    (cellDlgOpened ? titlePass(cellTitle) : cellStatic.ok);

  results.checks.S31_S33_weekly = {
    pass: weeklyPass,
    weeklyVisible,
    weeklyH2,
    stubOk,
    reloadPrimary,
    reloadBg: reloadStyle?.backgroundColor,
    purpleAiBg: weeklyPurple,
    cellDlgOpened,
    cellTitle,
    cellStatic,
  };
  if (!weeklyPass) fail(`S31–S33 weekly: ${JSON.stringify(results.checks.S31_S33_weekly)}`);
  await shot(page, '06-s31-weekly');
  step('S31_S33', weeklyPass ? 'PASS' : 'FAIL', 'weekly + stubs + cell');

  // ——— S62–S63 reports ———
  const reportsTab = page.locator('button').filter({ hasText: /Báo cáo|Reports/i }).first();
  await reportsTab.click();
  await sleep(2000);
  const reports = page.locator('[data-testid="att-reports-precision"]');
  await reports.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  const reportsVisible = await reports.isVisible().catch(() => false);
  const reportsH2 = reportsVisible ? await titleMetrics(reports.locator('h2').first()) : null;
  const reportsPurple = reportsVisible ? await purpleAiBgHits(reports, 'att-reports-precision') : [];
  const reportsExport = reports
    .getByRole('button', { name: /Xuất|Export/i })
    .first();
  const reportsExportVisible = await reportsExport.isVisible().catch(() => false);
  let reportsExportDlgOk = false;
  let reportsExportTitle = null;
  if (reportsExportVisible) {
    await reportsExport.click();
    await sleep(800);
    const dlg = page.locator('[data-testid="att-export-dialog-precision"]');
    reportsExportDlgOk = await dlg.isVisible().catch(() => false);
    if (reportsExportDlgOk) {
      reportsExportTitle = await titleMetrics(
        page.locator('[role="dialog"]').locator('h2, [class*="DialogTitle"]').first(),
      );
      await shot(page, '07-s63-reports-export-dialog');
      await dismissDialog(page);
    }
  }
  const reportsPass =
    reportsVisible &&
    titlePass(reportsH2) &&
    reportsExportVisible &&
    reportsExportDlgOk &&
    titlePass(reportsExportTitle) &&
    (reportsPurple?.length || 0) === 0;

  results.checks.S62_S63_reports = {
    pass: reportsPass,
    reportsVisible,
    reportsH2,
    reportsExportVisible,
    reportsExportDlgOk,
    reportsExportTitle,
    purpleAiBg: reportsPurple,
  };
  if (!reportsPass) fail(`S62–S63 reports: ${JSON.stringify(results.checks.S62_S63_reports)}`);
  await shot(page, '07-s62-reports');
  step('S62_S63', reportsPass ? 'PASS' : 'FAIL', 'reports + export');

  results.honesty.qr_card_invented = false;
  results.honesty.employee_qr_card_live = !!employeeQrLive;
  results.honesty.face_live_claimed = false;
  results.honesty.attendance_closed_claimed = false;
  results.honesty.remaster_program_done_claimed = false;

  results.mutatesCount = results.mutates.length;
  if (results.mutates.length > 0) {
    results.residuals.push({
      id: 'OBS-MUTATES',
      severity: 'P1',
      owner: 'qa',
      note: `Unexpected mutates under U65 RO: ${JSON.stringify(results.mutates.slice(0, 5))}`,
    });
    fail(`U65 mutates=${results.mutates.length}`);
  }

  const allPass = results.failReasons.length === 0;
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
        checks: Object.fromEntries(Object.entries(results.checks).map(([k, v]) => [k, v.pass])),
        mutates: results.mutates.length,
        screens: results.screens.length,
        residuals: results.residuals.length,
        l0: results.l0,
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
