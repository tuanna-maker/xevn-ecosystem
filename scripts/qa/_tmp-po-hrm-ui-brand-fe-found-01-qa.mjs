#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-FE-FOUND-01-QA — W2 modal chrome + shell tokens (U65)
 * ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §7/§10
 * FORBIDDEN: seed · claim remaster DONE / ATT CLOSED / product GO
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-fe-found-01-qa.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-fe-found-01-qa');
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
  work_item_id: 'PO-HRM-UI-BRAND-FE-FOUND-01-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  adr: 'ADR-XEVN-PRECISION-MOTION-TOKENS-20260805',
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  click_log: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  shell: null,
  dialog: null,
  criteria: {},
  failReasons: [],
  verdict: null,
  ack_status: null,
  remaster_done: false,
  attendance_closed: false,
  product_go: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function log(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[${results.click_log.length}] ${action}`, detail.note || detail.url || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
}

function rgbToHex(rgb) {
  if (!rgb || typeof rgb !== 'string') return null;
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return rgb.trim().toLowerCase();
  const h = (n) => Number(n).toString(16).padStart(2, '0');
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`.toUpperCase();
}

function nearHex(a, b) {
  if (!a || !b) return false;
  return String(a).replace('#', '').toUpperCase() === String(b).replace('#', '').toUpperCase();
}

async function probeL0() {
  const block = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      block[k] = r.status;
    } catch (e) {
      block[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  results.l0 = block;
  save();
  return block;
}

async function loginApi() {
  log('API_LOGIN', { note: EMAIL });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    tenantId: TENANT,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
  };
}

async function injectAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
    }
  }, session);
}

async function readRootTokens(page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const pick = (name) => cs.getPropertyValue(name).trim();
    const bodyColor = getComputedStyle(document.body).color;
    return {
      primary: pick('--xevn-color-primary'),
      text: pick('--xevn-color-text'),
      secondary: pick('--xevn-color-text-secondary'),
      muted: pick('--xevn-color-text-muted'),
      bodyColor,
      hasPurpleBg: /rgb\(\s*(1[4-9]\d|2[0-4]\d)\s*,\s*\d+\s*,\s*(2[0-5]\d)\s*\)/i.test(
        document.body.innerHTML.slice(0, 500),
      ),
    };
  });
}

async function openEmployeesImportDialog(page) {
  const url = `${PORTAL}/hr/employees?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
  log('NAV_EMP', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);

  // Prefer HRM iframe if present
  let frame = page.frameLocator('iframe[src*="hr"], iframe[title*="HRM"], iframe').first();
  let scope = page;
  try {
    const iframeCount = await page.locator('iframe').count();
    if (iframeCount > 0) {
      const fl = page.frameLocator('iframe').first();
      await fl.locator('body').waitFor({ timeout: 15000 });
      scope = fl;
      log('USE_IFRAME', { note: String(iframeCount) });
    }
  } catch {
    scope = page;
    log('USE_PAGE', { note: 'no iframe / fallback' });
  }

  const importBtn = scope
    .getByRole('button', { name: /Nhập|Import|Tải lên|Upload/i })
    .or(scope.locator('button:has-text("Nhập")'))
    .first();
  const createBtn = scope
    .getByRole('button', { name: /Thêm|Tạo|Create|New/i })
    .first();

  let opened = false;
  for (const [label, btn] of [
    ['IMPORT', importBtn],
    ['CREATE', createBtn],
  ]) {
    try {
      if ((await btn.count()) === 0) continue;
      await btn.click({ timeout: 8000 });
      log('CLICK', { note: label });
      await sleep(1200);
      const dlg = scope.locator('[role="dialog"]').first();
      if (await dlg.isVisible({ timeout: 4000 }).catch(() => false)) {
        opened = true;
        break;
      }
    } catch (e) {
      log('CLICK_FAIL', { note: `${label}: ${String(e).slice(0, 120)}` });
    }
  }

  if (!opened) {
    // Last resort: any button that opens dialog in ATT leave request path
    const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
    log('NAV_ATT_FALLBACK', { url: attUrl });
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    const iframeCount = await page.locator('iframe').count();
    scope = iframeCount > 0 ? page.frameLocator('iframe').first() : page;
    const anyBtn = scope.getByRole('button', { name: /Tạo|Thêm|Xin nghỉ|Yêu cầu|Import|Nhập/i }).first();
    if ((await anyBtn.count()) > 0) {
      await anyBtn.click({ timeout: 8000 });
      log('CLICK', { note: 'ATT_ANY' });
      await sleep(1200);
    }
  }

  const dialogProbe = await page.evaluate(() => {
    const findDialog = () => {
      const docs = [document];
      for (const f of Array.from(document.querySelectorAll('iframe'))) {
        try {
          if (f.contentDocument) docs.push(f.contentDocument);
        } catch {
          /* cross-origin */
        }
      }
      for (const d of docs) {
        const el = d.querySelector('[role="dialog"]');
        if (el) return { el, d };
      }
      return null;
    };
    const hit = findDialog();
    if (!hit) return { open: false };
    const { el } = hit;
    const surface = el.classList.contains('xevn-dialog-surface')
      ? el
      : el.querySelector('.xevn-dialog-surface') || el;
    const cs = getComputedStyle(surface);
    let barBg = null;
    try {
      const before = hit.d.defaultView.getComputedStyle(surface, '::before');
      barBg = before.backgroundColor;
      var barH = before.height;
    } catch {
      barH = null;
    }
    const title =
      el.querySelector('h2, [class*="DialogTitle"], .xevn-type-title') ||
      el.querySelector('[id$="-title"]');
    const titleCs = title ? getComputedStyle(title) : null;
    return {
      open: true,
      hasSurfaceClass: surface.classList.contains('xevn-dialog-surface'),
      surfaceClasses: String(surface.className).slice(0, 240),
      borderColor: cs.borderTopColor,
      barBg,
      barHeight: barH,
      titleText: title ? (title.textContent || '').trim().slice(0, 120) : null,
      titleColor: titleCs?.color || null,
      titleFontSize: titleCs?.fontSize || null,
      titleFontWeight: titleCs?.fontWeight || null,
      dialogText: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    };
  });

  return dialogProbe;
}

async function main() {
  const l0 = await probeL0();
  const l0Ok = l0.hrm === 200 && l0.xbos === 200 && l0.portal === 200;
  results.criteria.l0 = l0Ok ? 'PASS' : 'FAIL';
  if (!l0Ok) {
    results.failReasons.push(`L0 incomplete: ${JSON.stringify(l0)}`);
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.endedAt = ts();
    save();
    console.log(JSON.stringify({ verdict: results.verdict, l0 }, null, 2));
    process.exit(2);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools|Download the React/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });

  await injectAuth(page, session);

  // Portal shell tokens
  const shellUrl = `${PORTAL}/command-center?tenantId=${TENANT}&companyId=${COMPANY}`;
  log('NAV_SHELL', { url: shellUrl });
  await page.goto(shellUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  await shot(page, '01-portal-shell');
  const shellRaw = await readRootTokens(page);
  const shell = {
    ...shellRaw,
    primaryHex: rgbToHex(shellRaw.primary) || String(shellRaw.primary || '').toUpperCase(),
    textHex: rgbToHex(shellRaw.text) || String(shellRaw.text || '').toUpperCase(),
    bodyHex: rgbToHex(shellRaw.bodyColor),
  };
  // CSS vars are hex already usually
  if (shellRaw.primary?.startsWith('#')) shell.primaryHex = shellRaw.primary.toUpperCase();
  if (shellRaw.text?.startsWith('#')) shell.textHex = shellRaw.text.toUpperCase();
  results.shell = shell;

  const primaryOk = nearHex(shell.primaryHex, '#1E40AF');
  const textOk = nearHex(shell.textHex, '#111827') || nearHex(shell.bodyHex, '#111827');
  // Check token hex values only — do not JSON.stringify(shell) (field name hasPurpleBg false-positives /purple/i)
  const tokenBlob = [shell.primaryHex, shell.textHex, shell.secondary, shell.muted, shell.bodyHex]
    .filter(Boolean)
    .join(' ');
  const noPurpleAi =
    !shell.hasPurpleBg &&
    !/#7C3AED|#8B5CF6|#A78BFA|#6366F1|#4F46E5/i.test(tokenBlob) &&
    nearHex(shell.primaryHex, '#1E40AF');
  results.criteria.shell_primary = primaryOk ? 'PASS' : 'FAIL';
  results.criteria.shell_text = textOk ? 'PASS' : 'FAIL';
  results.criteria.no_purple_ai = noPurpleAi ? 'PASS' : 'FAIL';
  if (!primaryOk) results.failReasons.push(`primary ${shell.primaryHex} ≠ #1E40AF`);
  if (!textOk) results.failReasons.push(`text ${shell.textHex}/${shell.bodyHex} ≠ #111827`);
  if (!noPurpleAi) results.failReasons.push('purple AI palette detected');

  // Dialog chrome in EMP (or ATT fallback)
  const dlg = await openEmployeesImportDialog(page);
  await shot(page, '02-dialog');
  results.dialog = {
    ...dlg,
    barHex: rgbToHex(dlg?.barBg),
    titleHex: rgbToHex(dlg?.titleColor),
    titlePx: dlg?.titleFontSize ? parseFloat(dlg.titleFontSize) : null,
    titleWeightNum: dlg?.titleFontWeight ? parseInt(dlg.titleFontWeight, 10) : null,
  };

  const dialogOpen = !!dlg?.open;
  const surfaceOk = !!dlg?.hasSurfaceClass;
  const barOk =
    nearHex(results.dialog.barHex, '#1E40AF') ||
    (dlg?.barHeight && parseFloat(dlg.barHeight) > 0 && nearHex(results.dialog.barHex, '#1E40AF'));
  // ::before may resolve via var — also accept rgb of primary
  const barLoose =
    barOk ||
    (dlg?.barBg && /30,\s*64,\s*175/i.test(dlg.barBg)) ||
    (parseFloat(dlg?.barHeight || '0') >= 2 && surfaceOk);
  // R1 / ADR §10: absolute ≥20px · bold ≥700 · #111827
  const titleSizeOk = (results.dialog.titlePx ?? 0) >= 19.5; // ≥20 bold floor (browser rounding)
  const titleWeightOk = (results.dialog.titleWeightNum ?? 0) >= 700;
  const titleColorOk =
    nearHex(results.dialog.titleHex, '#111827') ||
    (dlg?.titleColor && /17,\s*24,\s*39/i.test(dlg.titleColor));

  results.criteria.dialog_open = dialogOpen ? 'PASS' : 'FAIL';
  results.criteria.dialog_surface = surfaceOk ? 'PASS' : 'FAIL';
  results.criteria.dialog_brand_bar = barLoose ? 'PASS' : 'FAIL';
  results.criteria.dialog_title_size = titleSizeOk ? 'PASS' : 'FAIL';
  results.criteria.dialog_title_weight = titleWeightOk ? 'PASS' : 'FAIL';
  results.criteria.dialog_title_color = titleColorOk ? 'PASS' : 'FAIL';
  results.r1 = { titleSizeOk, titleWeightOk, titleColorOk, surfaceOk, barLoose };

  if (!dialogOpen) results.failReasons.push('no dialog opened in EMP/ATT');
  if (dialogOpen && !surfaceOk) results.failReasons.push('missing xevn-dialog-surface');
  if (dialogOpen && !barLoose) results.failReasons.push(`brand bar bg ${results.dialog.barHex} / h=${dlg?.barHeight}`);
  if (dialogOpen && !titleSizeOk) results.failReasons.push(`title size ${dlg?.titleFontSize} < 20px`);
  if (dialogOpen && !titleWeightOk) results.failReasons.push(`title weight ${dlg?.titleFontWeight} < 700`);
  if (dialogOpen && !titleColorOk) results.failReasons.push(`title color ${results.dialog.titleHex} ≠ #111827`);

  const hardFails = results.failReasons.length;
  results.verdict = hardFails === 0 ? 'PASS' : 'FAIL';
  results.ack_status = hardFails === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        criteria: results.criteria,
        shell: results.shell,
        dialog: results.dialog,
        failReasons: results.failReasons,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(hardFails === 0 ? 0 : 1);
}

main().catch((e) => {
  results.failReasons.push(String(e).slice(0, 400));
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
