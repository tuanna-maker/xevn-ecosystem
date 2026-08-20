#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-EMP-C-QA — U65 browser brand remaster
 * Inventory E18, E20–E24 · ADR Precision Motion §8–§10
 * Cấm: seed · OCR invent · QR invent · Employees CLOSED · remaster DONE · Nest · DialogTitle regress
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-c-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa');
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
  work_item_id: 'PO-HRM-UI-BRAND-W3-EMP-C-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W3-EMP-C',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['E18', 'E20', 'E21', 'E22', 'E23', 'E24'],
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
      const pop = document.querySelector('[data-radix-popper-content-wrapper]');
      return Boolean(dlg || menu || pop);
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
  await sleep(200);
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

/** Scan EMP-C panel content only (exclude profile tab strip / group chrome). */
async function scanEmpCPanel(page) {
  return page.evaluate(() => {
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
    const groups = document.querySelector('[data-testid="profile-tab-groups"]');
    let root = null;
    if (groups?.parentElement) {
      const kids = Array.from(groups.parentElement.children);
      const idx = kids.indexOf(groups);
      root = kids[idx + 1] || null;
    }
    if (!root) {
      root =
        document.querySelector('[data-testid="emp-job-honesty"]')?.closest('.space-y-6') ||
        document.querySelector('main') ||
        document.body;
    }
    const aiClassRe =
      /purple-|indigo-|violet-|from-blue-|from-purple-|from-indigo-|from-violet-|from-amber-|to-indigo-|to-purple-|to-violet-|bg-yellow-500|text-rose-|bg-rose-|bg-fuchsia-/;
    const els = Array.from(root.querySelectorAll('*'));
    let paleCount = 0;
    let purpleCount = 0;
    let classAi = 0;
    let yellow500 = 0;
    let warningToken = 0;
    let gradientClass = 0;
    const aiSamples = [];
    for (const el of els) {
      const cn = el.className?.toString?.() || '';
      if (aiClassRe.test(cn)) {
        classAi += 1;
        if (aiSamples.length < 8) aiSamples.push(cn.slice(0, 100));
      }
      if (/bg-yellow-500/.test(cn)) yellow500 += 1;
      if (/bg-xevn-warning|text-xevn-warning/.test(cn)) warningToken += 1;
      if (/from-|to-|via-/.test(cn) && /amber|indigo|purple|violet|fuchsia|pink|rose/.test(cn)) {
        gradientClass += 1;
      }
      const text = (el.textContent || '').trim();
      if (text.length < 2 || text.length > 80) continue;
      if (el.children.length > 3) continue;
      const cs = getComputedStyle(el);
      const rgb = parse(cs.color);
      const bg = parse(cs.backgroundImage?.includes('gradient') ? null : cs.backgroundColor);
      if (pale(rgb)) paleCount += 1;
      if (purple(rgb) || purple(bg)) purpleCount += 1;
    }
    const hasFakeMonthSeries = /Th[aá]ng\s*\d|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(
      root.textContent || '',
    )
      ? Boolean(
          root.querySelector('.recharts-line, .recharts-area') &&
            !root.querySelector('[data-testid="emp-job-trend-honesty"]'),
        )
      : false;
    return {
      paleCount,
      purpleCount,
      classAi,
      yellow500,
      warningToken,
      gradientClass,
      aiSamples,
      hasFakeMonthSeries,
      rootTag: root?.tagName,
      rootClass: (root?.className?.toString?.() || '').slice(0, 80),
    };
  });
}

async function openGroupedTab(page, groupId, tabId) {
  const pinned = page.locator(`[data-testid="profile-pinned-tab-${tabId}"]`);
  if (await pinned.isVisible().catch(() => false)) {
    await pinned.click();
    await sleep(1100);
    return true;
  }
  const direct = page.locator(`[data-testid="profile-tab-${tabId}"]`);
  if (await direct.isVisible().catch(() => false)) {
    await direct.click();
    await sleep(1100);
    return true;
  }
  const groupBtn = page.locator(`[data-testid="profile-group-${groupId}"]`);
  if (!(await groupBtn.isVisible().catch(() => false))) return false;
  await groupBtn.click();
  await sleep(500);
  const item = page.locator(`[data-testid="profile-group-tab-${tabId}"]`);
  if (await item.isVisible().catch(() => false)) {
    await item.click();
    await sleep(1200);
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(300);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
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
    fail(`L0 down hrm=${results.l0.hrm} portal=${results.l0.portal}`);
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

  // ——— SoftDel still opens (cancel only) ———
  await dismissOverlays(page);
  const rowAction = page.locator('table tbody tr').first().locator('button').last();
  let softdel = { pass: false };
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
      softdel = {
        pass: alertOk && titleOk,
        alertOk,
        title,
        titleOk,
        note: 'Hủy only — SoftDel wire kept from EMP-B; no archive POST',
      };
      await shot(page, '01-softdel-alertdialog');
      const cancel = alert.getByRole('button', { name: /Hủy|Cancel/i }).first();
      if (await cancel.isVisible().catch(() => false)) await cancel.click();
      else await page.keyboard.press('Escape');
      await sleep(400);
    } else {
      softdel = { pass: false, note: 'Xóa menuitem missing' };
      await page.keyboard.press('Escape');
    }
  } else {
    softdel = { pass: false, note: 'row action missing' };
  }
  results.checks.SoftDel_keep = softdel;
  if (!softdel.pass) fail(`SoftDel: ${JSON.stringify(softdel)}`);
  step('softdel', softdel.pass ? 'PASS' : 'FAIL', 'AlertDialog cancel');
  await dismissOverlays(page);

  // ——— List → detail navigate ———
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

  // ——— E18 Việc làm ———
  const workTab = page.locator('[data-testid="profile-tab-work"]');
  let e18 = { pass: false };
  if (await workTab.isVisible().catch(() => false)) {
    await workTab.click();
    await sleep(1600);
  }
  const honesty = page.locator('[data-testid="emp-job-honesty"]');
  const trendHonesty = page.locator('[data-testid="emp-job-trend-honesty"]');
  const honestyOk = await honesty.isVisible().catch(() => false);
  const trendOk = await trendHonesty.isVisible().catch(() => false);
  // Empty list: FE renders honesty + EmbedApiEmptyState only — trend card mounts when jobs.length>0
  const emptyJobs = await page.getByText(/Chưa có công việc/i).first().isVisible().catch(() => false);
  const chrome18 = await scanEmpCPanel(page);
  const mathRandomInDom = await page.evaluate(() => {
    const trend = document.querySelector('[data-testid="emp-job-trend-honesty"]');
    if (!trend) return 'n/a-empty-or-unmounted';
    const text = (trend.textContent || '').toLowerCase();
    return /math\.random|fake series|random\(/.test(text) ? 'mentioned' : 'clean';
  });
  const trendAccept = trendOk
    ? mathRandomInDom === 'clean' && !chrome18.hasFakeMonthSeries
    : emptyJobs; // empty → trend honesty N/A (no fake month invent)
  e18 = {
    pass:
      honestyOk &&
      trendAccept &&
      chrome18.classAi === 0 &&
      chrome18.purpleCount === 0 &&
      chrome18.paleCount === 0 &&
      chrome18.gradientClass === 0 &&
      !chrome18.hasFakeMonthSeries &&
      mathRandomInDom !== 'mentioned',
    honestyOk,
    trendOk,
    emptyJobs,
    trendAccept,
    chrome: chrome18,
    mathRandomInDom,
    note: emptyJobs
      ? 'empty job list — emp-job-honesty PASS; emp-job-trend-honesty N/A until jobs>0'
      : trendOk
        ? 'trend honesty stub visible — no fake month series'
        : 'jobs present but trend honesty missing',
  };
  await shot(page, '02-e18-viec-lam');
  results.checks.E18_jobs = e18;
  if (!e18.pass) fail(`E18: ${JSON.stringify(e18)}`);
  step('e18', e18.pass ? 'PASS' : 'FAIL', e18.note || 'job honesty');

  // ——— E20 Tài sản ———
  let e20 = { pass: false, opened: false };
  e20.opened = await openGroupedTab(page, 'hr', 'assets');
  if (e20.opened) {
    await sleep(800);
    const chrome = await scanEmpCPanel(page);
    e20 = {
      pass: chrome.classAi === 0 && chrome.purpleCount === 0 && chrome.paleCount === 0 && chrome.gradientClass === 0,
      opened: true,
      chrome,
    };
    await shot(page, '03-e20-tai-san');
  } else {
    fail('E20 assets tab not opened');
  }
  results.checks.E20_assets = e20;
  if (!e20.pass) fail(`E20: ${JSON.stringify(e20)}`);
  step('e20', e20.pass ? 'PASS' : 'FAIL', 'assets ops-dense');

  // ——— E21 KPI ———
  let e21 = { pass: false, opened: false };
  e21.opened = await openGroupedTab(page, 'career', 'kpi');
  if (e21.opened) {
    await sleep(800);
    const chrome = await scanEmpCPanel(page);
    e21 = {
      pass: chrome.classAi === 0 && chrome.purpleCount === 0 && chrome.paleCount === 0 && chrome.gradientClass === 0,
      opened: true,
      chrome,
    };
    await shot(page, '04-e21-kpi');
  } else {
    fail('E21 kpi tab not opened');
  }
  results.checks.E21_kpi = e21;
  if (!e21.pass) fail(`E21: ${JSON.stringify(e21)}`);
  step('e21', e21.pass ? 'PASS' : 'FAIL', 'kpi ops-dense');

  // ——— E22 CV / Degrees / Certificates / Skills ———
  const e22tabs = [
    { id: 'cv', group: 'career', shot: '05-e22-cv' },
    { id: 'degrees', group: 'career', shot: '06-e22-degrees' },
    { id: 'certificates', group: 'career', shot: '07-e22-certificates' },
    { id: 'skills', group: 'career', shot: '08-e22-skills' },
  ];
  const e22parts = {};
  let e22pass = true;
  for (const t of e22tabs) {
    const opened = await openGroupedTab(page, t.group, t.id);
    let part = { pass: false, opened };
    if (opened) {
      await sleep(700);
      const chrome = await scanEmpCPanel(page);
      const softOk =
        t.id !== 'skills' ||
        (chrome.yellow500 === 0 && (chrome.warningToken > 0 || chrome.classAi === 0));
      // skills: must not invent yellow-500; warning token preferred when soft chip present
      part = {
        pass: chrome.classAi === 0 && chrome.purpleCount === 0 && chrome.paleCount === 0 && softOk,
        opened: true,
        chrome,
        softOk,
        note:
          t.id === 'skills'
            ? `yellow500=${chrome.yellow500} warningToken=${chrome.warningToken}`
            : 'sharp secondary',
      };
      await shot(page, t.shot);
    } else {
      e22pass = false;
      fail(`E22 ${t.id} tab not opened`);
    }
    e22parts[t.id] = part;
    if (!part.pass) e22pass = false;
  }
  results.checks.E22_cv_cluster = { pass: e22pass, parts: e22parts };
  if (!e22pass) fail(`E22: ${JSON.stringify(e22parts)}`);
  step('e22', e22pass ? 'PASS' : 'FAIL', 'CV/degrees/CC/skills');

  // ——— E23 Khen thưởng ———
  let e23 = { pass: false, opened: false };
  e23.opened = await openGroupedTab(page, 'hr', 'rewards');
  if (e23.opened) {
    await sleep(800);
    const chrome = await scanEmpCPanel(page);
    e23 = {
      pass: chrome.classAi === 0 && chrome.purpleCount === 0 && chrome.paleCount === 0 && chrome.gradientClass === 0,
      opened: true,
      chrome,
    };
    await shot(page, '09-e23-rewards');
  } else {
    fail('E23 rewards tab not opened');
  }
  results.checks.E23_rewards = e23;
  if (!e23.pass) fail(`E23: ${JSON.stringify(e23)}`);
  step('e23', e23.pass ? 'PASS' : 'FAIL', 'rewards DNA');

  // ——— E24 Gia đình ———
  let e24 = { pass: false, opened: false };
  e24.opened = await openGroupedTab(page, 'personal', 'family');
  if (e24.opened) {
    await sleep(800);
    const chrome = await scanEmpCPanel(page);
    e24 = {
      pass: chrome.classAi === 0 && chrome.purpleCount === 0 && chrome.paleCount === 0,
      opened: true,
      chrome,
    };
    await shot(page, '10-e24-family');
  } else {
    fail('E24 family tab not opened');
  }
  results.checks.E24_family = e24;
  if (!e24.pass) fail(`E24: ${JSON.stringify(e24)}`);
  step('e24', e24.pass ? 'PASS' : 'FAIL', 'family sharp');

  results.checks.OCR_OUT = { pass: true, note: 'CORE-04 OUT — no OCR dialog opened' };
  results.checks.QR_SKIP = { pass: true, note: 'PROP-03e SKIP — no QR invent' };

  await browser.close();

  const critical = [
    'SoftDel_keep',
    'navigate_detail',
    'E18_jobs',
    'E20_assets',
    'E21_kpi',
    'E22_cv_cluster',
    'E23_rewards',
    'E24_family',
  ];
  const criticalFail = critical.filter((k) => !results.checks[k]?.pass);
  if (results.themeContrastStrict?.exit !== 0) criticalFail.push('themeContrastStrict');
  const archiveMutates = results.mutates.filter((m) => /archive|restore|soft.?delete|employees/i.test(m.url));
  if (results.mutates.length > 0) {
    // Any mutate under U65 cancel-only is fail
    criticalFail.push('unexpected_mutate');
    fail(`unexpected mutates: ${JSON.stringify(results.mutates)}`);
  }

  results.verdict = criticalFail.length === 0 ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.criticalFail = criticalFail;
  results.endedAt = ts();
  results.residuals.push({
    id: 'R-job-trend-api',
    note: 'trend honesty stub until Nest history API — defer BE; do not invent series',
  });
  results.residuals.push({
    id: 'R-remaster-DONE',
    note: 'forbidden claim — Employees not CLOSED · remaster program not DONE',
  });
  results.residuals.push({
    id: 'OBS-profile-shell-tab-icons',
    note: 'EmployeeProfile.tsx tab/group icon colors (rose/amber/cyan) outside EMP-C allowed_paths — not scanned as EMP-C panel content',
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
          Object.entries(results.checks).map(([k, v]) => [k, { pass: v?.pass, note: v?.note, opened: v?.opened }]),
        ),
        themeContrastStrict: results.themeContrastStrict,
        detailGets: results.detailGets,
        mutates: results.mutates,
        screens: results.screens,
        l0: results.l0,
        pageErrors: results.pageErrors.slice(0, 10),
        consoleErrors: results.consoleErrors.slice(0, 10),
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
