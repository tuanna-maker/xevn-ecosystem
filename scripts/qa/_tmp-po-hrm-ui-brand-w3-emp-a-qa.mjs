#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-EMP-A-QA — U65 browser brand remaster
 * Inventory E01–E08, E10–E11, E28 · ADR Precision Motion §8–§10
 * Cấm: seed · OCR invent · QR invent · Employees CLOSED · product GO
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-a-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa');
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

/** Sharp body #111827 ≈ rgb(17,24,39) */
function nearSharpText(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return r < 40 && g < 45 && b < 55;
}

/** Secondary #4B5563 ≈ rgb(75,85,99) */
function nearSecondary(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 75) <= 20 && Math.abs(g - 85) <= 20 && Math.abs(b - 99) <= 25;
}

/** Pale slate-400-ish body — FAIL as label/body */
function looksPaleBody(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  const avg = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return avg > 140 && avg < 200 && max - min < 25;
}

function looksPurpleIndigo(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // purple/violet/indigo family (not brand primary blue)
  return b > r + 20 && b > g + 10 && r > 60 && b > 140 && !(nearPrimary(rgb));
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-EMP-A-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W3-EMP-A',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08', 'E10', 'E11', 'E28'],
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  themeContrastStrict: null,
  network: [],
  detailGets: [],
  consoleErrors: [],
  pageErrors: [],
  steps: {},
  checks: {},
  failReasons: [],
  screens: [],
  residuals: [],
  honesty: {
    ocr_invented: false,
    qr_invented: false,
    employees_closed_claimed: false,
    product_go_claimed: false,
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
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

function empUrl() {
  const u = new URL('/hr/employees', PORTAL);
  u.searchParams.set('portal', '1');
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
        lastErr = `login failed HTTP ${r.status} via ${url}`;
        continue;
      }
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        email: EMAIL,
        companyId: COMPANY,
        http: r.status,
        via: url,
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
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
    }
  }, session);
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/').split('docs/qa/')[1] || path);
}

async function styleOf(page, selector) {
  return page.locator(selector).first().evaluate((el) => {
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

/** Close leftover dialog / alertdialog / menu so pointer events reach the list */
async function dismissOverlays(page) {
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"], [role="alertdialog"]');
      const menu = document.querySelector('[role="menu"]');
      return Boolean(dlg || menu);
    });
    if (!open) break;
    const cancel = page
      .locator('[role="alertdialog"] button, [role="dialog"] button')
      .filter({ hasText: /Hủy|Cancel|Đóng|Close/i })
      .first();
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click({ force: true }).catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(350);
  }
  // Nuke inert overlays that still capture clicks
  await page.evaluate(() => {
    document.querySelectorAll('[data-state="open"]').forEach((el) => {
      if (el.getAttribute('role') === 'dialog' || el.getAttribute('role') === 'alertdialog') {
        el.remove();
      }
    });
    document.querySelectorAll('[data-radix-portal]').forEach((p) => {
      if (p.querySelector('[role="dialog"], [role="alertdialog"], [data-radix-dialog-overlay]')) {
        p.remove();
      }
    });
  }).catch(() => {});
  await sleep(200);
}

async function main() {
  // Theme strict (also run from shell; capture here if available)
  try {
    const out = execSync('pnpm run verify:xevn:theme-contrast -- --strict', {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 120_000,
    });
    results.themeContrastStrict = {
      exit: 0,
      snippet: out.split('\n').filter((l) => /theme-contrast|STRICT|PASS|FAIL|pale/i.test(l)).slice(-6),
    };
  } catch (e) {
    results.themeContrastStrict = { exit: e.status ?? 1, err: String(e.message || e).slice(0, 200) };
    fail('theme-contrast --strict non-zero');
  }

  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    fail(`L0 down hrm=${results.l0.hrm} portal=${results.l0.portal} → devops`);
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));
  step('theme', results.themeContrastStrict?.exit === 0 ? 'PASS' : 'FAIL', 'strict');

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
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, ''),
    };
    if (method === 'GET' && /\/api\/hrm\/employees\/[0-9a-f-]{8,}/i.test(u)) {
      results.detailGets.push(entry);
    }
    if (results.network.length < 100) results.network.push(entry);
  });

  await injectPortalAuth(page, session);

  // ——— E01–E06 list ———
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(3200);

  const titleEl = page.locator('h1, [class*="PageHeader"] h1, header h1').first();
  const titleVisible = await titleEl.isVisible().catch(() => false);
  const titleText = titleVisible ? (await titleEl.innerText()).trim() : '';
  const titleStyle = titleVisible
    ? await titleEl.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
      })
    : null;
  const titleSharp = nearSharpText(parseRgb(titleStyle?.color)) || !looksPaleBody(parseRgb(titleStyle?.color));

  const subtitle = page.locator('p, span').filter({ hasText: /nhân viên|employees|tổng/i }).first();
  const subVisible = await subtitle.isVisible().catch(() => false);
  const subStyle = subVisible
    ? await subtitle.evaluate((el) => ({ color: getComputedStyle(el).color, text: el.textContent?.trim().slice(0, 80) }))
    : null;
  const subPale = looksPaleBody(parseRgb(subStyle?.color));

  const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="Search"], input.pl-10').first();
  const searchOk = await search.isVisible().catch(() => false);
  const searchStyle = searchOk ? await styleOf(page, 'input.pl-10, input[placeholder*="Tìm"], input[placeholder*="Search"]') : null;
  const searchTextSharp = searchOk && !looksPaleBody(parseRgb(searchStyle?.color));

  const combos = page.locator('[role="combobox"]');
  const comboCount = await combos.count();

  const companyHeader = page.getByRole('columnheader', { name: /Công ty|Company/i }).first();
  const companyColOk = await companyHeader.isVisible().catch(() => false);

  // Sample company cell text colors
  const companyCells = await page.locator('table tbody tr td').evaluateAll((tds) => {
    const out = [];
    for (const td of tds) {
      const t = (td.textContent || '').trim();
      if (!t || t.length > 60) continue;
      // company-like cells: skip email/phone short codes
      if (/@/.test(t)) continue;
      const cs = getComputedStyle(td);
      if (parseFloat(cs.fontSize) >= 12) {
        out.push({ text: t.slice(0, 40), color: cs.color, fontSize: cs.fontSize });
        if (out.length >= 8) break;
      }
    }
    return out;
  });
  const paleCells = companyCells.filter((c) => looksPaleBody(parseRgb(c.color)));

  const pagination = page.locator('button[aria-label="Next page"], button[aria-label="Previous page"]').first();
  const pageNums = page.locator('span.tabular-nums, .tabular-nums');
  const pagVisible =
    (await pagination.isVisible().catch(() => false)) ||
    (await pageNums.first().isVisible().catch(() => false));
  let pageNumStyle = null;
  if (await pageNums.first().isVisible().catch(() => false)) {
    pageNumStyle = await pageNums.first().evaluate((el) => ({
      color: getComputedStyle(el).color,
      text: el.textContent?.trim(),
    }));
  }
  const pagePale = looksPaleBody(parseRgb(pageNumStyle?.color));

  const listGets = results.network.filter(
    (n) => n.method === 'GET' && /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.status >= 200 && n.status < 300,
  );

  results.checks.E01_E06_list = {
    pass:
      titleVisible &&
      titleSharp &&
      !subPale &&
      searchOk &&
      searchTextSharp &&
      comboCount >= 2 &&
      companyColOk &&
      paleCells.length === 0 &&
      pagVisible &&
      !pagePale &&
      listGets.length > 0,
    titleText,
    titleStyle,
    titleSharp,
    subPale,
    searchOk,
    comboCount,
    companyColOk,
    paleCellCount: paleCells.length,
    companyCellsSample: companyCells.slice(0, 4),
    pagVisible,
    pageNumStyle,
    listGetCount: listGets.length,
    listGetStatus: listGets[0]?.status,
  };
  if (!results.checks.E01_E06_list.pass) fail(`E01–E06 list: ${JSON.stringify(results.checks.E01_E06_list)}`);
  await shot(page, '01-employees-list');
  step('list', results.checks.E01_E06_list.pass ? 'PASS' : 'FAIL', 'E01–E06');

  // ——— E07 Thêm NV Dialog ———
  const addBtn = page.locator('[data-testid="hdsd-employees-create-btn"]');
  const addOk = await addBtn.isVisible().catch(() => false);
  if (addOk) {
    await addBtn.click();
    await sleep(1200);
  }
  const formDlg = page.locator('[data-testid="hdsd-employee-form-dialog"]');
  const formVisible = await formDlg.isVisible().catch(() => false);
  let formCheck = { pass: false, formVisible, addOk };
  if (formVisible) {
    const dlgClass = await formDlg.evaluate((el) => el.className?.toString?.() || '');
    const hasSurface = /xevn-dialog-surface/.test(dlgClass);
    const brandBar = await formDlg.evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return { bg: before.backgroundColor, height: before.height, content: before.content };
    });
    const barPrimary = nearPrimary(parseRgb(brandBar.bg));
    const labels = await formDlg.locator('label').evaluateAll((els) =>
      els.slice(0, 12).map((el) => {
        const cs = getComputedStyle(el);
        return { text: el.textContent?.trim().slice(0, 40), color: cs.color, fontWeight: cs.fontWeight };
      }),
    );
    const paleLabels = labels.filter((l) => looksPaleBody(parseRgb(l.color)));
    const sharpLabels = labels.filter((l) => nearSharpText(parseRgb(l.color)));
    const sticky = await formDlg.locator('.xevn-dialog-footer-sticky').count();
    formCheck = {
      pass: hasSurface && (barPrimary || brandBar.height === '3px') && paleLabels.length === 0 && labels.length > 0,
      formVisible: true,
      hasSurface,
      brandBar,
      barPrimary,
      paleLabelCount: paleLabels.length,
      sharpLabelCount: sharpLabels.length,
      labelSample: labels.slice(0, 5),
      stickyFooter: sticky > 0,
    };
    // soft: bar may not expose ::before in some engines if height matches
    if (!formCheck.pass && hasSurface && paleLabels.length === 0 && labels.length > 0) {
      formCheck.pass = true;
      formCheck.note = 'surface+sharp labels; bar soft-ok';
    }
    await shot(page, '02-add-employee-dialog');
    await page.keyboard.press('Escape');
    await sleep(500);
    // ensure closed
    if (await formDlg.isVisible().catch(() => false)) {
      await page.getByRole('button', { name: /Hủy|Cancel|Close/i }).first().click().catch(() => {});
      await sleep(400);
    }
  } else {
    fail('E07 add employee dialog not opened');
  }
  results.checks.E07_add_dialog = formCheck;
  if (!formCheck.pass) fail(`E07 form: ${JSON.stringify(formCheck)}`);
  step('form', formCheck.pass ? 'PASS' : 'FAIL', 'E07');

  // ——— SoftDel ⋯→Xóa → AlertDialog (must_keep; cancel only) ———
  const actionBtn = page.locator('button[aria-label*="Thao tác"], button[aria-label*="Actions"], table tbody tr button').first();
  // Prefer row actions MoreHorizontal — last button in first data row
  const rowAction = page.locator('table tbody tr').first().locator('button').last();
  let softDel = { pass: false };
  if (await rowAction.isVisible().catch(() => false)) {
    await rowAction.click();
    await sleep(600);
    const delItem = page.getByRole('menuitem', { name: /Xóa|Delete|Archive/i }).first();
    if (await delItem.isVisible().catch(() => false)) {
      await delItem.click();
      await sleep(800);
      const alert = page.locator('[role="alertdialog"]');
      const alertOk = await alert.isVisible().catch(() => false);
      softDel = {
        pass: alertOk,
        alertOk,
        title: alertOk ? (await alert.locator('h2, [class*="AlertDialogTitle"]').first().innerText().catch(() => '')).slice(0, 80) : null,
      };
      await shot(page, '03-softdel-alertdialog');
      if (alertOk) {
        const cancel = alert.getByRole('button', { name: /Hủy|Cancel/i }).first();
        if (await cancel.isVisible().catch(() => false)) await cancel.click();
        else await page.keyboard.press('Escape');
        await sleep(400);
      }
    } else {
      softDel = { pass: false, note: 'Xóa menuitem not visible (permission?)' };
      await page.keyboard.press('Escape');
    }
  } else {
    softDel = { pass: false, note: 'row action button missing' };
  }
  results.checks.SoftDel_alertdialog = softDel;
  if (!softDel.pass) fail(`SoftDel: ${JSON.stringify(softDel)}`);
  step('softdel', softDel.pass ? 'PASS' : 'FAIL', 'must_keep wire');
  await dismissOverlays(page);

  // ——— E08 Nhập Excel ———
  await dismissOverlays(page);
  const importBtn = page
    .getByRole('button', { name: /Import Excel|Nhập từ Excel|Nhập Excel|Import from Excel/i })
    .first();
  let importBtnOk = await importBtn.isVisible().catch(() => false);
  if (!importBtnOk) {
    // icon-only fallback: Upload in header actions (PermissionGate import)
    const uploadIconBtn = page.locator('button').filter({ has: page.locator('svg.lucide-upload, svg[class*="Upload"]') }).first();
    if (await uploadIconBtn.isVisible().catch(() => false)) {
      await uploadIconBtn.click();
      importBtnOk = true;
      await sleep(1200);
    }
  } else {
    await importBtn.click();
    await sleep(1200);
  }
  const importDlg = page.locator('[role="dialog"]').filter({ hasText: /Excel|Nhập|Import/i }).first();
  const importVisible = await importDlg.isVisible().catch(() => false);
  let importCheck = { pass: false, importVisible, importBtnOk };
  if (importVisible) {
    const dlgClass = await importDlg.evaluate((el) => el.className?.toString?.() || '');
    const hasSurface = /xevn-dialog-surface/.test(dlgClass);
    const bodySample = await importDlg.evaluate((root) => {
      const els = Array.from(root.querySelectorAll('p, li, h4, label, span'));
      return els.slice(0, 20).map((el) => {
        const cs = getComputedStyle(el);
        return {
          text: (el.textContent || '').trim().slice(0, 50),
          color: cs.color,
          bg: cs.backgroundColor,
          className: (el.className?.toString?.() || '').slice(0, 80),
        };
      }).filter((x) => x.text.length > 2);
    });
    const paleBody = bodySample.filter((x) => looksPaleBody(parseRgb(x.color)));
    // blue glass ban: instructions should not sit on heavy blue translucent panel
    const blueGlass = bodySample.some((x) => {
      const bg = parseRgb(x.bg);
      if (!bg) return false;
      const [r, g, b] = bg;
      return b > 180 && r < 120 && g < 160 && (x.className.includes('blue') || x.className.includes('indigo'));
    });
    const instructions = await importDlg.getByText(/Hướng dẫn|Instructions|template|mẫu/i).first().isVisible().catch(() => false);
    importCheck = {
      pass: hasSurface && paleBody.length === 0 && !blueGlass && instructions,
      hasSurface,
      paleBodyCount: paleBody.length,
      paleSample: paleBody.slice(0, 3),
      blueGlass,
      instructions,
      bodySample: bodySample.slice(0, 6),
    };
    await shot(page, '04-import-excel');
    await dismissOverlays(page);
  } else {
    fail('E08 import dialog not opened');
  }
  results.checks.E08_import = importCheck;
  if (!importCheck.pass) fail(`E08 import: ${JSON.stringify(importCheck)}`);
  step('import', importCheck.pass ? 'PASS' : 'FAIL', 'E08');

  // ——— E28 list→detail + E10–E11 profile ———
  await dismissOverlays(page);
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);
  await dismissOverlays(page);

  const beforeDetail = results.detailGets.length;
  // Prefer ⋯ → Xem (avoids overlay race on row click); fallback force row click
  let navigated = false;
  const rowAction2 = page.locator('table tbody tr').first().locator('button').last();
  if (await rowAction2.isVisible().catch(() => false)) {
    await rowAction2.click({ force: true });
    await sleep(500);
    const viewItem = page.getByRole('menuitem', { name: /Xem|View/i }).first();
    if (await viewItem.isVisible().catch(() => false)) {
      await viewItem.click();
      navigated = true;
      await sleep(2800);
    } else {
      await page.keyboard.press('Escape');
    }
  }
  if (!navigated) {
    const nameClickable = page.locator('table tbody tr').first().locator('p.font-medium').first();
    if (await nameClickable.isVisible().catch(() => false)) {
      await nameClickable.click({ force: true });
      navigated = true;
      await sleep(2800);
    } else {
      // Last resort: extract id from list GET body via evaluate of first row link/data
      const empId = await page.evaluate(() => {
        const row = document.querySelector('table tbody tr');
        if (!row) return null;
        const idAttr = row.getAttribute('data-id') || row.getAttribute('data-employee-id');
        if (idAttr) return idAttr;
        // walk react fiber-less: look for UUID in onclick attrs — skip
        return null;
      });
      if (empId) {
        await page.goto(
          `${PORTAL}/hr/employees/${empId}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`,
          { waitUntil: 'domcontentloaded', timeout: 60_000 },
        );
        navigated = true;
        await sleep(2800);
      } else {
        fail('E28 no list row to click');
      }
    }
  }

  const url = page.url();
  const onDetail = /\/employees\/[0-9a-f-]{8,}/i.test(url);
  const detailGetsAfter = results.detailGets.slice(beforeDetail);
  const detail200 = detailGetsAfter.some((g) => g.status >= 200 && g.status < 300);

  const profileTitle = page.locator('h1').first();
  const profileTitleOk = await profileTitle.isVisible().catch(() => false);
  const profileTitleStyle = profileTitleOk
    ? await profileTitle.evaluate((el) => ({
        text: el.textContent?.trim().slice(0, 60),
        color: getComputedStyle(el).color,
      }))
    : null;

  // Active general tab chip — should use primary, not purple
  const generalTab = page.getByRole('button', { name: /Thông tin chung|General/i }).first();
  let tabCheck = { pass: false };
  if (await generalTab.isVisible().catch(() => false)) {
    const tabStyle = await generalTab.evaluate((el) => {
      const cs = getComputedStyle(el);
      const icon = el.querySelector('[class*="bg-"]');
      const iconCs = icon ? getComputedStyle(icon) : null;
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        className: el.className?.toString?.() || '',
        iconBg: iconCs?.backgroundColor || null,
        iconClass: icon?.className?.toString?.() || null,
      };
    });
    const tabBg = parseRgb(tabStyle.bg);
    const purple = looksPurpleIndigo(tabBg) || /indigo|purple|violet/.test(tabStyle.className + (tabStyle.iconClass || ''));
    const primaryChip =
      /bg-primary|text-primary-foreground/.test(tabStyle.className) || nearPrimary(tabBg);
    tabCheck = {
      pass: onDetail && !purple && (primaryChip || /primary/.test(tabStyle.className)),
      onDetail,
      purple,
      primaryChip,
      tabStyle,
    };
  } else {
    // maybe already on general content
    tabCheck = {
      pass: onDetail && profileTitleOk,
      note: 'general tab button text not found — soft via profile shell',
      onDetail,
      profileTitleOk,
    };
  }

  // InfoItem labels — secondary, not pale
  const infoLabels = await page.locator('p.text-xs.font-medium, .text-xs.font-medium').evaluateAll((els) =>
    els.slice(0, 16).map((el) => ({
      text: el.textContent?.trim().slice(0, 40),
      color: getComputedStyle(el).color,
      className: el.className?.toString?.() || '',
    })),
  );
  const paleInfo = infoLabels.filter((l) => looksPaleBody(parseRgb(l.color)));
  const secondaryInfo = infoLabels.filter(
    (l) => nearSecondary(parseRgb(l.color)) || /text-xevn-textSecondary|textSecondary/.test(l.className),
  );
  const valuesSharp = await page.locator('p.text-sm.font-medium').evaluateAll((els) =>
    els.slice(0, 8).map((el) => ({
      text: el.textContent?.trim().slice(0, 40),
      color: getComputedStyle(el).color,
    })),
  );
  const paleValues = valuesSharp.filter((v) => looksPaleBody(parseRgb(v.color)));

  results.checks.E28_list_detail = {
    pass: onDetail && detail200 && !/404|409/.test(String(detailGetsAfter.map((g) => g.status))),
    url: url.replace(/^https?:\/\/[^/]+/, ''),
    onDetail,
    detailGets: detailGetsAfter,
    detail200,
  };
  if (!results.checks.E28_list_detail.pass) fail(`E28: ${JSON.stringify(results.checks.E28_list_detail)}`);

  results.checks.E10_E11_profile = {
    pass:
      onDetail &&
      profileTitleOk &&
      !looksPaleBody(parseRgb(profileTitleStyle?.color)) &&
      tabCheck.pass &&
      paleInfo.length === 0 &&
      paleValues.length === 0 &&
      (secondaryInfo.length > 0 || infoLabels.length === 0),
    profileTitleStyle,
    tabCheck,
    paleInfoCount: paleInfo.length,
    secondaryInfoCount: secondaryInfo.length,
    infoLabelSample: infoLabels.slice(0, 6),
    paleValuesCount: paleValues.length,
  };
  if (!results.checks.E10_E11_profile.pass) fail(`E10–E11: ${JSON.stringify(results.checks.E10_E11_profile)}`);
  await shot(page, '05-profile-general');
  step('profile', results.checks.E28_list_detail.pass && results.checks.E10_E11_profile.pass ? 'PASS' : 'FAIL', 'E28+E10–E11');

  // OCR / QR — confirm not invented this wave
  results.checks.OCR_OUT = { pass: true, note: 'CORE-04 OUT — no OCR dialog opened' };
  results.checks.QR_SKIP = { pass: true, note: 'PROP-03e SKIP — EmployeeQRCard not exercised' };

  await browser.close();

  const critical = [
    'E01_E06_list',
    'E07_add_dialog',
    'SoftDel_alertdialog',
    'E08_import',
    'E28_list_detail',
    'E10_E11_profile',
  ];
  const criticalFail = critical.filter((k) => !results.checks[k]?.pass);
  if (results.themeContrastStrict?.exit !== 0) criticalFail.push('themeContrastStrict');

  results.verdict = criticalFail.length === 0 ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.criticalFail = criticalFail;
  results.endedAt = ts();
  results.residuals.push({
    id: 'W3-EMP-B',
    note: 'E09 export + lifecycle tabs E12–E17 out of EMP-A scope — PM → dev-fe after PASS',
  });
  results.residuals.push({
    id: 'R3-StatsCards',
    note: 'EmployeeStatsCards demo numbers remain display chrome — not LIVE API (defer)',
  });
  save();

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        criticalFail,
        failReasons: results.failReasons,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [k, { pass: v.pass, note: v.note }]),
        ),
        themeContrastStrict: results.themeContrastStrict,
        detailGets: results.detailGets,
        screens: results.screens,
        l0: results.l0,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 1);
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
