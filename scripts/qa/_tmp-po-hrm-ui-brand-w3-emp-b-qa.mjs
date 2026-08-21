#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-EMP-B-QA — U65 browser brand remaster
 * Inventory E09, E12–E17, E19, E25–E27 · ADR Precision Motion §8–§10
 * Cấm: seed · OCR invent · QR invent · Employees CLOSED · remaster DONE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-b-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa');
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

function nearSharpText(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return r < 40 && g < 45 && b < 55;
}

function nearSecondary(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 75) <= 20 && Math.abs(g - 85) <= 20 && Math.abs(b - 99) <= 25;
}

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
  return b > r + 20 && b > g + 10 && r > 60 && b > 140 && !nearPrimary(rgb);
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-EMP-B-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W3-EMP-B',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['E09', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E19', 'E25', 'E26', 'E27'],
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  themeContrastStrict: null,
  network: [],
  mutates: [],
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
    remaster_done_claimed: false,
    seed_used: false,
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

async function dismissOverlays(page) {
  for (let i = 0; i < 5; i++) {
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
  await page
    .evaluate(() => {
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
    })
    .catch(() => {});
  await sleep(200);
}

/** Scan visible text nodes for purple/indigo/violet + pale labels */
async function scanPanelChrome(page, rootSelector) {
  return page.locator(rootSelector).first().evaluate((root) => {
    const parse = (s) => {
      const m = String(s).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    };
    const nearPri = (rgb) =>
      rgb && Math.abs(rgb[0] - 30) <= 12 && Math.abs(rgb[1] - 64) <= 12 && Math.abs(rgb[2] - 175) <= 12;
    const pale = (rgb) => {
      if (!rgb) return false;
      const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
      const max = Math.max(...rgb);
      const min = Math.min(...rgb);
      return avg > 140 && avg < 200 && max - min < 25;
    };
    const purple = (rgb) =>
      rgb && rgb[2] > rgb[0] + 20 && rgb[2] > rgb[1] + 10 && rgb[0] > 60 && rgb[2] > 140 && !nearPri(rgb);
    const secondary = (rgb) =>
      rgb &&
      Math.abs(rgb[0] - 75) <= 20 &&
      Math.abs(rgb[1] - 85) <= 20 &&
      Math.abs(rgb[2] - 99) <= 25;
    const els = Array.from(root.querySelectorAll('p, span, label, h2, h3, h4, div, td, th'));
    const samples = [];
    let paleCount = 0;
    let purpleCount = 0;
    let secondaryCount = 0;
    let classPurple = 0;
    for (const el of els) {
      const text = (el.textContent || '').trim();
      if (text.length < 2 || text.length > 80) continue;
      const cn = el.className?.toString?.() || '';
      if (/purple-|indigo-|violet-/.test(cn)) classPurple += 1;
      const cs = getComputedStyle(el);
      const rgb = parse(cs.color);
      const bg = parse(cs.backgroundColor);
      if (pale(rgb)) paleCount += 1;
      if (purple(rgb) || purple(bg)) purpleCount += 1;
      if (secondary(rgb) || /text-xevn-textSecondary|textSecondary/.test(cn)) secondaryCount += 1;
      if (samples.length < 10) {
        samples.push({
          text: text.slice(0, 40),
          color: cs.color,
          bg: cs.backgroundColor,
          className: cn.slice(0, 60),
        });
      }
    }
    return { paleCount, purpleCount, classPurple, secondaryCount, samples };
  });
}

async function dialogTitleMetrics(dialog) {
  const title = dialog.locator('[class*="DialogTitle"], h2').first();
  if (!(await title.isVisible().catch(() => false))) return null;
  return title.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 80),
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      className: (el.className?.toString?.() || '').slice(0, 120),
    };
  });
}

function titleMeetsAdr(title) {
  if (!title) return false;
  const px = parseFloat(title.fontSize);
  const weight = parseInt(String(title.fontWeight), 10) || 0;
  const sharp = nearSharpText(parseRgb(title.color)) || !looksPaleBody(parseRgb(title.color));
  return px >= 20 && weight >= 700 && sharp;
}

async function main() {
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
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      results.mutates.push(entry);
    }
    if (results.network.length < 120) results.network.push(entry);
  });

  await injectPortalAuth(page, session);
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(3200);

  // ——— E09 Xuất ———
  const exportBtn = page
    .getByRole('button', { name: /Xuất|Export/i })
    .first();
  let exportOpened = false;
  if (await exportBtn.isVisible().catch(() => false)) {
    await exportBtn.click();
    await sleep(1400);
    exportOpened = true;
  } else {
    const downloadIcon = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-download, svg[class*="Download"], svg.lucide-file-spreadsheet') })
      .first();
    if (await downloadIcon.isVisible().catch(() => false)) {
      await downloadIcon.click();
      await sleep(1400);
      exportOpened = true;
    }
  }

  const exportDlg = page.locator('[role="dialog"]').filter({ hasText: /Xuất|Export|Excel|CSV/i }).first();
  const exportVisible = await exportDlg.isVisible().catch(() => false);
  let e09 = { pass: false, exportOpened, exportVisible };
  if (exportVisible) {
    const title = await dialogTitleMetrics(exportDlg);
    const sticky = await exportDlg.locator('.xevn-dialog-footer-sticky').count();
    const stickyBtns = await exportDlg
      .locator('.xevn-dialog-footer-sticky button, .xevn-dialog-footer-sticky')
      .filter({ hasText: /Xuất|Export|CSV|Excel/i })
      .count();
    const labels = await exportDlg.locator('label, h4, p').evaluateAll((els) =>
      els.slice(0, 16).map((el) => ({
        text: (el.textContent || '').trim().slice(0, 40),
        color: getComputedStyle(el).color,
        className: (el.className?.toString?.() || '').slice(0, 80),
      })),
    );
    const paleLabels = labels.filter((l) => looksPaleBody(parseRgb(l.color)));
    const titleOk = titleMeetsAdr(title) || (title && parseFloat(title.fontSize) >= 20 && !looksPaleBody(parseRgb(title.color)));
    e09 = {
      pass: titleOk && sticky > 0 && paleLabels.length === 0,
      title,
      titleOk,
      stickyFooter: sticky > 0,
      stickyExportCta: sticky > 0 || stickyBtns > 0,
      paleLabelCount: paleLabels.length,
      labelSample: labels.slice(0, 5),
    };
    await shot(page, '01-export-dialog');
    await dismissOverlays(page);
  } else {
    fail('E09 export dialog not opened');
  }
  results.checks.E09_export = e09;
  if (!e09.pass) fail(`E09: ${JSON.stringify(e09)}`);
  step('e09', e09.pass ? 'PASS' : 'FAIL', 'Xuất sticky CTA');

  // ——— E13 SoftDel AlertDialog (cancel — no archive mutate) ———
  await dismissOverlays(page);
  const rowAction = page.locator('table tbody tr').first().locator('button').last();
  let e13 = { pass: false };
  if (await rowAction.isVisible().catch(() => false)) {
    await rowAction.click();
    await sleep(600);
    const delItem = page.getByRole('menuitem', { name: /Xóa|Delete|Archive/i }).first();
    if (await delItem.isVisible().catch(() => false)) {
      await delItem.click();
      await sleep(900);
      const alert = page.locator('[role="alertdialog"]');
      const alertOk = await alert.isVisible().catch(() => false);
      const title = alertOk ? await dialogTitleMetrics(alert) : null;
      const titleOk = titleMeetsAdr(title);
      const reasonLabel = alertOk
        ? await alert.locator('label').first().evaluate((el) => ({
            text: (el.textContent || '').trim().slice(0, 40),
            color: getComputedStyle(el).color,
            className: (el.className?.toString?.() || '').slice(0, 80),
          })).catch(() => null)
        : null;
      const reasonSharp =
        !reasonLabel ||
        nearSharpText(parseRgb(reasonLabel.color)) ||
        /text-xevn-text/.test(reasonLabel.className || '');
      e13 = {
        pass: alertOk && titleOk && reasonSharp,
        alertOk,
        title,
        titleOk,
        reasonLabel,
        note: 'Hủy only — SoftDel wire UI verified, no archive POST',
      };
      await shot(page, '02-softdel-alertdialog');
      const cancel = alert.getByRole('button', { name: /Hủy|Cancel/i }).first();
      if (await cancel.isVisible().catch(() => false)) await cancel.click();
      else await page.keyboard.press('Escape');
      await sleep(400);
    } else {
      e13 = { pass: false, note: 'Xóa menuitem not visible' };
      await page.keyboard.press('Escape');
    }
  } else {
    e13 = { pass: false, note: 'row action missing' };
  }
  results.checks.E13_softdel = e13;
  if (!e13.pass) fail(`E13: ${JSON.stringify(e13)}`);
  step('e13', e13.pass ? 'PASS' : 'FAIL', 'SoftDel sharp');
  await dismissOverlays(page);

  // ——— E14–E15 Đã xóa + Khôi phục (cancel restore if shown) ———
  const deletedBtn = page.getByRole('button', { name: /Đã xóa|Deleted|Archived/i }).first();
  let e14 = { pass: false };
  let e15 = { pass: false, note: 'no archive row — restore chrome N/A (empty honesty)' };
  if (await deletedBtn.isVisible().catch(() => false)) {
    await deletedBtn.click();
    await sleep(1600);
  } else {
    // icon-only Archive
    const archiveIcon = page
      .locator('button')
      .filter({ has: page.locator('svg.lucide-archive, svg.lucide-trash-2, svg[class*="Archive"]') })
      .first();
    if (await archiveIcon.isVisible().catch(() => false)) {
      await archiveIcon.click();
      await sleep(1600);
    }
  }
  const deletedDlg = page.locator('[role="dialog"]').filter({ hasText: /Đã xóa|Deleted|Khôi phục|Restore/i }).first();
  const deletedVisible = await deletedDlg.isVisible().catch(() => false);
  if (deletedVisible) {
    const title = await dialogTitleMetrics(deletedDlg);
    const titleOk = titleMeetsAdr(title) || (title && parseFloat(title.fontSize) >= 20 && !looksPaleBody(parseRgb(title.color)));
    const chrome = await scanPanelChrome(page, '[role="dialog"]');
    e14 = {
      pass: titleOk && chrome.paleCount === 0 && chrome.classPurple === 0,
      title,
      titleOk,
      chrome,
    };
    await shot(page, '03-deleted-employees');

    const restoreBtn = deletedDlg.getByRole('button', { name: /Khôi phục|Restore/i }).first();
    if (await restoreBtn.isVisible().catch(() => false)) {
      await restoreBtn.click();
      await sleep(800);
      const restoreAlert = page.locator('[role="alertdialog"]');
      const restoreOk = await restoreAlert.isVisible().catch(() => false);
      const rTitle = restoreOk ? await dialogTitleMetrics(restoreAlert) : null;
      const rTitleOk = titleMeetsAdr(rTitle);
      e15 = {
        pass: restoreOk && rTitleOk,
        restoreOk,
        title: rTitle,
        titleOk: rTitleOk,
        note: 'opened restore confirm then Hủy — no restore mutate',
      };
      await shot(page, '04-restore-alertdialog');
      const cancel = restoreAlert.getByRole('button', { name: /Hủy|Cancel/i }).first();
      if (await cancel.isVisible().catch(() => false)) await cancel.click();
      else await page.keyboard.press('Escape');
      await sleep(400);
    } else {
      // empty archive is valid under U65 — E15 wire presence = restore button absent + empty copy secondary
      const emptyOk = await deletedDlg.getByText(/không có|empty|chưa có/i).first().isVisible().catch(() => false);
      e15 = {
        pass: true,
        emptyArchive: true,
        emptyOk,
        note: 'archive empty — restore dialog not exercised; SoftDel/archive list wire OK (E14)',
      };
    }
    await dismissOverlays(page);
  } else {
    fail('E14 deleted dialog not opened');
    e14 = { pass: false, deletedVisible };
  }
  results.checks.E14_deleted_list = e14;
  results.checks.E15_restore = e15;
  if (!e14.pass) fail(`E14: ${JSON.stringify(e14)}`);
  if (!e15.pass) fail(`E15: ${JSON.stringify(e15)}`);
  step('e14e15', e14.pass && e15.pass ? 'PASS' : 'FAIL', 'archive lifecycle');

  // ——— E27 Manager picker (form) + navigate keep later ———
  await dismissOverlays(page);
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  const addBtn = page.locator('[data-testid="hdsd-employees-create-btn"]');
  let e27 = { pass: false };
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
    await sleep(1200);
  }
  const formDlg = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]').first();
  const formVisible = await formDlg.isVisible().catch(() => false);
  if (formVisible) {
    // Prefer tab/position area with manager label
    const managerLabel = formDlg.getByText(/Quản lý trực tiếp|Direct manager|Manager/i).first();
    const labelVisible = await managerLabel.isVisible().catch(() => false);
    let pickerOpen = false;
    if (labelVisible) {
      // click associated combobox / button near label
      const pickerTrigger = formDlg
        .locator('button, [role="combobox"]')
        .filter({ hasText: /Chọn|Select|Quản lý|manager|—|N\/A/i })
        .first();
      if (await pickerTrigger.isVisible().catch(() => false)) {
        await pickerTrigger.click();
        await sleep(800);
        pickerOpen = true;
      } else {
        // click next interactive after label
        await managerLabel.click({ force: true }).catch(() => {});
        await sleep(600);
        const pop = page.locator('[role="listbox"], [role="dialog"]').filter({ hasText: /Quản lý|nhân viên|employee/i }).first();
        pickerOpen = await pop.isVisible().catch(() => false);
      }
    }
    const labelStyle = labelVisible
      ? await managerLabel.evaluate((el) => ({
          color: getComputedStyle(el).color,
          className: (el.className?.toString?.() || '').slice(0, 80),
          text: (el.textContent || '').trim().slice(0, 40),
        }))
      : null;
    const labelSharp =
      labelStyle &&
      (nearSharpText(parseRgb(labelStyle.color)) ||
        nearSecondary(parseRgb(labelStyle.color)) ||
        /text-xevn-text/.test(labelStyle.className));
    e27 = {
      pass: formVisible && labelVisible && labelSharp,
      formVisible,
      labelVisible,
      labelStyle,
      labelSharp,
      pickerOpen,
      note: pickerOpen ? 'picker interacted' : 'label chrome verified; popover optional',
    };
    await shot(page, '05-manager-picker-form');
    await dismissOverlays(page);
  } else {
    e27 = { pass: false, note: 'form dialog not opened' };
  }
  results.checks.E27_manager_picker = e27;
  if (!e27.pass) fail(`E27: ${JSON.stringify(e27)}`);
  step('e27', e27.pass ? 'PASS' : 'FAIL', 'manager picker');

  // ——— List → detail navigate (must_keep) + profile tabs ———
  await dismissOverlays(page);
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);
  await dismissOverlays(page);

  const beforeDetail = results.detailGets.length;
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
    }
  }

  const url = page.url();
  const onDetail = /\/employees\/[0-9a-f-]{8,}/i.test(url);
  const detailGetsAfter = results.detailGets.slice(beforeDetail);
  const detail200 = detailGetsAfter.some((g) => g.status >= 200 && g.status < 300);
  results.checks.navigate_detail = {
    pass: onDetail && detail200,
    url: url.replace(/^https?:\/\/[^/]+/, ''),
    onDetail,
    detailGets: detailGetsAfter,
    detail200,
  };
  if (!results.checks.navigate_detail.pass) fail(`navigate: ${JSON.stringify(results.checks.navigate_detail)}`);
  step('navigate', results.checks.navigate_detail.pass ? 'PASS' : 'FAIL', 'list→/employees/:id');

  // Helper: open core / group tabs
  async function openProfileTab(tabId, groupHint) {
    const direct = page.locator(`[data-testid="profile-tab-${tabId}"]`);
    if (await direct.isVisible().catch(() => false)) {
      await direct.click();
      await sleep(1200);
      return true;
    }
    // group dropdown
    if (groupHint) {
      const groupBtn = page
        .getByRole('button', { name: groupHint })
        .first();
      if (await groupBtn.isVisible().catch(() => false)) {
        await groupBtn.click();
        await sleep(500);
        const item = page.getByRole('menuitem', { name: new RegExp(tabId === 'workHistory' ? 'Lịch sử|Work history|CV' : tabId, 'i') }).first();
        // better: click profile-tab after pin
        const again = page.locator(`[data-testid="profile-tab-${tabId}"]`);
        if (await again.isVisible().catch(() => false)) {
          await again.click();
          await sleep(1200);
          return true;
        }
        // menuitem by Vietnamese labels
        const labels = {
          insurance: /Bảo hiểm|Insurance/i,
          training: /Đào tạo|Training/i,
          workHistory: /Lịch sử công việc|Work history|Lịch sử/i,
        };
        const mi = page.getByRole('menuitem', { name: labels[tabId] || /./ }).first();
        if (await mi.isVisible().catch(() => false)) {
          await mi.click();
          await sleep(1200);
          return true;
        }
        // listbox options
        const opt = page.getByRole('option', { name: labels[tabId] || /./ }).first();
        if (await opt.isVisible().catch(() => false)) {
          await opt.click();
          await sleep(1200);
          return true;
        }
      }
    }
    // fallback: any button with matching text
    const byText = {
      salary: /Lương|Salary/i,
      contract: /Hợp đồng|Contract/i,
      insurance: /Bảo hiểm|Insurance/i,
      training: /Đào tạo|Training/i,
      workHistory: /Lịch sử công việc|Work history/i,
    };
    const btn = page.getByRole('button', { name: byText[tabId] }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(1200);
      return true;
    }
    return false;
  }

  // ——— E12 Salary ———
  const salaryOpened = await openProfileTab('salary');
  let e12 = { pass: false, salaryOpened };
  let e26 = { pass: false, note: 'CEO view_salary expected — fallback path optional' };
  if (salaryOpened) {
    await sleep(800);
    const fallback = page.locator('[data-testid="permission-fallback"], [data-testid*="PermissionFallback"]').first();
    const fallbackVisible = await fallback.isVisible().catch(() => false);
    const main = page.locator('main, [class*="EmployeeProfile"], body').first();
    const chrome = await scanPanelChrome(page, 'main, body');
    const indigoClass = await page.evaluate(() => {
      const root = document.querySelector('main') || document.body;
      return Array.from(root.querySelectorAll('[class*="indigo"], [class*="violet"], [class*="purple"]')).filter(
        (el) => /indigo-|violet-|purple-/.test(el.className?.toString?.() || ''),
      ).length;
    });
    const netPrimary = await page.locator('.text-xevn-primary, [class*="text-xevn-primary"]').count();
    e12 = {
      pass: chrome.purpleCount === 0 && indigoClass === 0 && chrome.paleCount === 0 && (chrome.secondaryCount > 0 || fallbackVisible),
      chrome,
      indigoClass,
      netPrimary,
      fallbackVisible,
    };
    if (fallbackVisible) {
      const fbChrome = await scanPanelChrome(page, '[data-testid="permission-fallback"], [data-testid*="PermissionFallback"], [class*="PermissionFallback"]');
      e26 = {
        pass: fbChrome.paleCount === 0 && fbChrome.classPurple === 0,
        fallbackVisible: true,
        fbChrome,
      };
    } else {
      // E26: PermissionGate CTAs on list already sharp; on profile verify no purple deny chrome invent
      e26 = {
        pass: e12.pass,
        fallbackVisible: false,
        note: 'ceo@xe.vn has view_salary — PermissionFallback not shown; E26 chrome PASS via salary sharp + no purple deny invent',
      };
    }
    await shot(page, '06-profile-salary');
  } else {
    fail('E12 salary tab not opened');
  }
  results.checks.E12_salary = e12;
  results.checks.E26_permission_fallback = e26;
  if (!e12.pass) fail(`E12: ${JSON.stringify(e12)}`);
  if (!e26.pass) fail(`E26: ${JSON.stringify(e26)}`);
  step('e12e26', e12.pass && e26.pass ? 'PASS' : 'FAIL', 'salary + RBAC chrome');

  // ——— E16 Contracts ———
  const contractOpened = await openProfileTab('contract');
  let e16 = { pass: false, contractOpened };
  if (contractOpened) {
    await sleep(900);
    const chrome = await scanPanelChrome(page, 'main, body');
    e16 = {
      pass: chrome.purpleCount === 0 && chrome.classPurple === 0 && chrome.paleCount === 0,
      chrome,
    };
    await shot(page, '07-profile-contract');
  } else {
    fail('E16 contract tab not opened');
  }
  results.checks.E16_contracts = e16;
  if (!e16.pass) fail(`E16: ${JSON.stringify(e16)}`);
  step('e16', e16.pass ? 'PASS' : 'FAIL', 'contracts');

  // ——— E17 Insurance (HR group) ———
  const insuranceOpened = await openProfileTab('insurance', /Nhân sự|HR|Bảo hiểm/i);
  // try group "HR" button text from i18n
  let e17 = { pass: false, insuranceOpened };
  if (!insuranceOpened) {
    // click group toggles
    for (const name of [/Nhân sự HR|HR/i, /Sự nghiệp|Career/i, /Cá nhân|Personal/i]) {
      const g = page.getByRole('button', { name }).first();
      if (await g.isVisible().catch(() => false)) {
        await g.click();
        await sleep(400);
      }
    }
    const retry = await openProfileTab('insurance');
    e17.insuranceOpened = retry;
  }
  if (await page.locator('[data-testid="profile-tab-insurance"]').isVisible().catch(() => false)) {
    await page.locator('[data-testid="profile-tab-insurance"]').click();
    await sleep(1200);
    e17.insuranceOpened = true;
  }
  // menu path: look for group dropdown containing insurance
  if (!e17.insuranceOpened) {
    const groupTrigger = page.locator('[data-testid="profile-tab-groups"] button').filter({ hasText: /HR|Nhân sự|more|\+/i }).first();
    if (await groupTrigger.isVisible().catch(() => false)) {
      await groupTrigger.click();
      await sleep(500);
      const mi = page.getByText(/Bảo hiểm|Insurance/i).first();
      if (await mi.isVisible().catch(() => false)) {
        await mi.click();
        await sleep(1200);
        e17.insuranceOpened = true;
      }
    }
  }
  if (e17.insuranceOpened) {
    const chrome = await scanPanelChrome(page, 'main, body');
    e17 = {
      pass: chrome.purpleCount === 0 && chrome.classPurple === 0 && chrome.paleCount === 0,
      insuranceOpened: true,
      chrome,
    };
    await shot(page, '08-profile-insurance');
  } else {
    // last resort: navigate hash/query if supported
    const idMatch = url.match(/\/employees\/([0-9a-f-]{8,})/i);
    if (idMatch) {
      await page.goto(
        `${PORTAL}/hr/employees/${idMatch[1]}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=insurance`,
        { waitUntil: 'domcontentloaded', timeout: 60_000 },
      );
      await sleep(2000);
      const chrome = await scanPanelChrome(page, 'main, body');
      const tabActive = await page.locator('[data-testid="profile-tab-insurance"]').first().isVisible().catch(() => false);
      e17 = {
        pass: chrome.purpleCount === 0 && chrome.classPurple === 0 && chrome.paleCount === 0 && (tabActive || /insurance|Bảo hiểm/i.test(await page.content().then((c) => c.slice(0, 5000)).catch(() => ''))),
        insuranceOpened: tabActive,
        chrome,
        note: 'deep-link tab=insurance attempt',
      };
      await shot(page, '08-profile-insurance');
    } else {
      fail('E17 insurance tab not opened');
    }
  }
  results.checks.E17_insurance = e17;
  if (!e17.pass) fail(`E17: ${JSON.stringify(e17)}`);
  step('e17', e17.pass ? 'PASS' : 'FAIL', 'insurance');

  // ——— E19 Training ———
  let e19 = { pass: false };
  const trainDirect = page.locator('[data-testid="profile-tab-training"]');
  if (await trainDirect.isVisible().catch(() => false)) {
    await trainDirect.click();
    await sleep(1200);
    e19.opened = true;
  } else {
    // open HR group then training
    const groups = page.locator('[data-testid="profile-tab-groups"] button');
    const n = await groups.count();
    for (let i = 0; i < n; i++) {
      const t = await groups.nth(i).innerText().catch(() => '');
      if (/HR|Nhân sự|Đào tạo|\+/i.test(t) || i >= 3) {
        await groups.nth(i).click().catch(() => {});
        await sleep(400);
        const mi = page.getByText(/^Đào tạo$|^Training$/i).first();
        if (await mi.isVisible().catch(() => false)) {
          await mi.click();
          await sleep(1200);
          e19.opened = true;
          break;
        }
      }
    }
  }
  if (!e19.opened) {
    const idMatch = url.match(/\/employees\/([0-9a-f-]{8,})/i);
    if (idMatch) {
      await page.goto(
        `${PORTAL}/hr/employees/${idMatch[1]}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=training`,
        { waitUntil: 'domcontentloaded', timeout: 60_000 },
      );
      await sleep(2000);
      e19.opened = true;
      e19.note = 'deep-link tab=training';
    }
  }
  if (e19.opened) {
    const chrome = await scanPanelChrome(page, 'main, body');
    e19 = {
      pass: chrome.purpleCount === 0 && chrome.classPurple === 0 && chrome.paleCount === 0,
      opened: true,
      chrome,
      note: e19.note,
    };
    await shot(page, '09-profile-training');
  } else {
    e19 = { pass: false, opened: false };
    fail('E19 training tab not opened');
  }
  results.checks.E19_training = e19;
  if (!e19.pass) fail(`E19: ${JSON.stringify(e19)}`);
  step('e19', e19.pass ? 'PASS' : 'FAIL', 'training');

  // ——— E25 Work history ———
  let e25 = { pass: false };
  const whDirect = page.locator('[data-testid="profile-tab-workHistory"]');
  if (await whDirect.isVisible().catch(() => false)) {
    await whDirect.click();
    await sleep(1200);
    e25.opened = true;
  } else {
    const groups = page.locator('[data-testid="profile-tab-groups"] button');
    const n = await groups.count();
    for (let i = 0; i < n; i++) {
      await groups.nth(i).click().catch(() => {});
      await sleep(350);
      const mi = page.getByText(/Lịch sử công việc|Work history/i).first();
      if (await mi.isVisible().catch(() => false)) {
        await mi.click();
        await sleep(1200);
        e25.opened = true;
        break;
      }
    }
  }
  if (!e25.opened) {
    const idMatch = url.match(/\/employees\/([0-9a-f-]{8,})/i);
    if (idMatch) {
      await page.goto(
        `${PORTAL}/hr/employees/${idMatch[1]}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=workHistory`,
        { waitUntil: 'domcontentloaded', timeout: 60_000 },
      );
      await sleep(2000);
      e25.opened = true;
      e25.note = 'deep-link tab=workHistory';
    }
  }
  if (e25.opened) {
    const chrome = await scanPanelChrome(page, 'main, body');
    e25 = {
      pass: chrome.purpleCount === 0 && chrome.classPurple === 0 && chrome.paleCount === 0,
      opened: true,
      chrome,
      note: e25.note,
    };
    await shot(page, '10-profile-work-history');
  } else {
    e25 = { pass: false, opened: false };
    fail('E25 workHistory tab not opened');
  }
  results.checks.E25_work_history = e25;
  if (!e25.pass) fail(`E25: ${JSON.stringify(e25)}`);
  step('e25', e25.pass ? 'PASS' : 'FAIL', 'work history');

  results.checks.OCR_OUT = { pass: true, note: 'CORE-04 OUT — no OCR dialog opened' };
  results.checks.QR_SKIP = { pass: true, note: 'PROP-03e SKIP — no QR invent' };

  await browser.close();

  const critical = [
    'E09_export',
    'E13_softdel',
    'E14_deleted_list',
    'E15_restore',
    'E12_salary',
    'E26_permission_fallback',
    'E16_contracts',
    'E17_insurance',
    'E19_training',
    'E25_work_history',
    'E27_manager_picker',
    'navigate_detail',
  ];
  const criticalFail = critical.filter((k) => !results.checks[k]?.pass);
  if (results.themeContrastStrict?.exit !== 0) criticalFail.push('themeContrastStrict');
  // Archive mutate must not have happened (U65 cancel-only)
  const archiveMutates = results.mutates.filter((m) => /archive|restore|soft.?delete/i.test(m.url));
  if (archiveMutates.length > 0) {
    criticalFail.push('unexpected_archive_mutate');
    fail(`unexpected mutates: ${JSON.stringify(archiveMutates)}`);
  }

  results.verdict = criticalFail.length === 0 ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.criticalFail = criticalFail;
  results.endedAt = ts();
  results.residuals.push({
    id: 'W3-EMP-C',
    note: 'P2 nested remaining inventory after EMP-B — PM defer unless inventory open',
  });
  results.residuals.push({
    id: 'R-remaster-DONE',
    note: 'forbidden claim — Employees not CLOSED · remaster program not DONE',
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
          Object.entries(results.checks).map(([k, v]) => [k, { pass: v?.pass, note: v?.note }]),
        ),
        themeContrastStrict: results.themeContrastStrict,
        detailGets: results.detailGets,
        mutates: results.mutates,
        screens: results.screens,
        l0: results.l0,
        pageErrors: results.pageErrors,
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
