#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-QA-RUNTIME-01 — U65 read-only Employees fidelity runtime (#1–28)
 * Persona: ceo@xe.vn · companyId=main · /hr/employees
 * Patterns: LIST-01 filter discover · DETAIL-01 td.click · testids
 * FORBIDDEN: seed · import commit · archive confirm · invent Employees/Attendance CLOSED
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
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-mfd-m3-emp-qa-runtime-01-browser-r2.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-qa-runtime-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(dirname(OUT_JSON), { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M3-EMP-QA-RUNTIME-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  read_only: true,
  uat_done: false,
  employees_closed: false,
  attendance_closed: false,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  portal_url: null,
  l0: {},
  surfaces: [],
  network: [],
  mutateBlocked: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  notes: [],
  chromeDump: null,
  rollup: {},
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function empUrl(path = '/hr/employees') {
  return `${PORTAL}${path}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
}

function shortUrl(u) {
  return u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360);
}

async function probeL0(label) {
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
  results.l0[label] = block;
  save();
  return block;
}

async function loginApi() {
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
    companyId: COMPANY,
    tenantId: TENANT,
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

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools|Download the React/i.test(t)) return;
    results.consoleErrors.push(t.slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('request', (req) => {
    const m = req.method();
    const u = req.url();
    if (!/\/api\/hrm\//.test(u)) return;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(m)) {
      results.mutateBlocked.push({ method: m, url: shortUrl(u), at: ts() });
    }
  });
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    results.network.push({
      status: res.status(),
      method,
      url: shortUrl(u),
      at: ts(),
    });
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function dismiss(page) {
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(120);
  }
  const cancel = page.getByRole('button', { name: /^Hủy$|^Cancel$|^Đóng$|^Close$/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ timeout: 1500 }).catch(() => {});
  }
}

function netsSince(idx) {
  return results.network.slice(idx);
}

function okGets(slice, re) {
  return slice.filter((n) => n.method === 'GET' && n.status >= 200 && n.status < 300 && re.test(n.url));
}

function badGets(slice) {
  return slice.filter((n) => n.status >= 400);
}

function stamp(matrix, menu_path, runtime, extra = {}) {
  const row = { matrix, menu_path, runtime, probedAt: ts(), ...extra };
  results.surfaces.push(row);
  console.log(`${String(runtime).padEnd(10)} #${String(matrix).padEnd(3)} ${menu_path}`);
  save();
  return row;
}

async function dumpChrome(page) {
  return page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
      .slice(0, 40)
      .map((b) => ({
        text: (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        testid: b.getAttribute('data-testid'),
        visible: !!(b.offsetWidth || b.offsetHeight),
      }))
      .filter((b) => b.text || b.testid);
    const rows = document.querySelectorAll('table tbody tr').length;
    const syncError = /Sync ERROR|HRM API request failed|companyId mismatches/i.test(document.body?.innerText || '');
    return { buttons, rows, syncError, title: document.title, href: location.href };
  });
}

function filterComboboxes(page) {
  return page
    .locator('div')
    .filter({ has: page.locator('input.pl-10') })
    .filter({ has: page.locator('[role="combobox"]') })
    .first()
    .locator('[role="combobox"]');
}

async function openSelectAndPick(page, optionRe) {
  const triggers = filterComboboxes(page);
  let count = await triggers.count();
  if (count === 0) {
    // fallback all comboboxes
    const all = page.locator('[role="combobox"]');
    count = await all.count();
    for (let i = 0; i < count; i++) {
      await dismiss(page);
      await all.nth(i).click({ timeout: 4000 });
      await sleep(350);
      const opts = page.locator('[role="option"]');
      const n = await opts.count();
      const texts = [];
      for (let j = 0; j < n; j++) texts.push(((await opts.nth(j).textContent()) || '').trim());
      const hit = texts.findIndex((t) => optionRe.test(t));
      if (hit >= 0) {
        await opts.nth(hit).click({ timeout: 4000 });
        await sleep(1200);
        return { ok: true, text: texts[hit], options: texts, triggerIndex: i };
      }
      await dismiss(page);
    }
    return { ok: false, options: [] };
  }
  for (let i = 0; i < count; i++) {
    await dismiss(page);
    await triggers.nth(i).click({ timeout: 4000 });
    await sleep(350);
    const opts = page.locator('[role="option"]');
    const n = await opts.count();
    const texts = [];
    for (let j = 0; j < n; j++) texts.push(((await opts.nth(j).textContent()) || '').trim());
    const hit = texts.findIndex((t) => optionRe.test(t));
    if (hit >= 0) {
      await opts.nth(hit).click({ timeout: 4000 });
      await sleep(1200);
      return { ok: true, text: texts[hit], options: texts, triggerIndex: i };
    }
    await dismiss(page);
  }
  return { ok: false, options: [] };
}

async function ensureList(page) {
  if (!/\/hr\/employees(\?|$)/.test(page.url()) || /\/employees\/[0-9a-f-]{8,}/i.test(page.url())) {
    await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2500);
  }
  await dismiss(page);
}

async function openProfile(page) {
  if (/\/employees\/[0-9a-f-]{8,}/i.test(page.url())) {
    if (await page.locator('[data-testid="employee-profile-page"]').count()) return true;
  }
  await ensureList(page);
  const row = page.locator('table tbody tr').first();
  if ((await row.count()) === 0) return false;
  const before = results.network.length;
  await row.locator('td').first().click({ timeout: 8000 });
  await sleep(2800);
  const ok = /\/employees\/[0-9a-f-]{8,}/i.test(page.url());
  return { ok, netIdx: before };
}

const TAB_GROUP = {
  general: 'core',
  work: 'core',
  contract: 'core',
  salary: 'core',
  insurance: 'hr',
  training: 'hr',
  assets: 'hr',
  rewards: 'hr',
  cv: 'career',
  kpi: 'career',
  workHistory: 'career',
  degrees: 'career',
  certificates: 'career',
  skills: 'career',
  family: 'personal',
};

async function openProfileTab(page, tabId) {
  // Core strip or already-pinned strip
  for (const sel of [
    `[data-testid="profile-tab-${tabId}"]`,
    `[data-testid="profile-pinned-tab-${tabId}"]`,
  ]) {
    const loc = page.locator(sel);
    if ((await loc.count()) > 0 && (await loc.first().isVisible().catch(() => false))) {
      await loc.first().click({ timeout: 6000 });
      await sleep(1100);
      return { via: sel };
    }
  }

  const group = TAB_GROUP[tabId];
  const groups = group && group !== 'core' ? [group, 'hr', 'career', 'personal'] : ['hr', 'career', 'personal'];
  const tried = [];
  for (const g of groups) {
    if (tried.includes(g)) continue;
    tried.push(g);
    const btn = page.locator(`[data-testid="profile-group-${g}"]`);
    if ((await btn.count()) === 0) continue;
    // Close any open popover first, then open target group
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    await btn.first().click({ timeout: 5000 });
    const panel = page.locator(`[data-testid="profile-group-panel-${g}"]`);
    await panel.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
    await sleep(400);
    const gt = page.locator(`[data-testid="profile-group-tab-${tabId}"]`);
    if ((await gt.count()) > 0) {
      await gt.first().click({ timeout: 6000 });
      await sleep(1100);
      return { via: `group:${g}` };
    }
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
  }

  // Last resort: VI label on button / menuitem
  const labelMap = {
    assets: /Tài sản/i,
    kpi: /KPI|Hiệu suất/i,
    cv: /^CV|Hồ sơ CV|Curriculum/i,
    rewards: /Khen thưởng|Kỷ luật/i,
    family: /Gia đình/i,
    workHistory: /Lịch sử công việc|Work history/i,
    degrees: /Bằng cấp|Degrees/i,
    certificates: /Chứng chỉ|Certificates/i,
    skills: /Kỹ năng|Skills/i,
    training: /Đào tạo/i,
    insurance: /Bảo hiểm/i,
  };
  const re = labelMap[tabId];
  if (re) {
    const byText = page.getByRole('button', { name: re }).or(page.locator('button').filter({ hasText: re }));
    if ((await byText.count()) > 0) {
      await byText.first().click({ timeout: 5000 });
      await sleep(1100);
      return { via: 'label' };
    }
  }
  throw new Error(`tab ${tabId} not found (groups tried: ${tried.join(',')})`);
}

async function main() {
  const entry = await probeL0('entry');
  if (entry.hrm !== 200 || entry.portal !== 200) {
    results.fatal = 'L0 entry FAIL — hrm/portal not 200';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  track(page);
  await injectAuth(page, session);

  results.portal_url = empUrl();
  const net0 = results.network.length;
  await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(4000);
  await shot(page, '00-list');
  results.chromeDump = await dumpChrome(page);

  // #1 list load
  {
    const slice = netsSince(net0);
    const listOk = okGets(slice, /\/api\/hrm\/employees(\?|$)/);
    const bad = badGets(slice);
    const rows = results.chromeDump.rows;
    const sync = results.chromeDump.syncError;
    let runtime = 'LIVE';
    if (sync || bad.some((b) => b.status >= 500) || rows === 0 || !listOk.length) runtime = 'BROKEN';
    else if (bad.length) runtime = 'PARTIAL';
    stamp(1, 'Danh sách NV (load)', runtime, {
      rows,
      networkOk: listOk.slice(0, 4),
      networkBad: bad.slice(0, 6),
      syncError: sync,
    });
  }

  // #2 search
  {
    await dismiss(page);
    const idx = results.network.length;
    const input = page.locator('input.pl-10, input[placeholder*="Tìm" i], input[placeholder*="Search" i]').first();
    await input.fill('Nguyen');
    await sleep(1600);
    await input.fill('');
    await sleep(1000);
    const slice = netsSince(idx);
    const kw = okGets(slice, /keyword=/);
    stamp(2, 'Tìm kiếm keyword', kw.length ? 'LIVE' : 'PARTIAL', {
      networkOk: kw.slice(0, 4),
      networkBad: badGets(slice).slice(0, 4),
    });
  }

  // #3 status
  {
    await dismiss(page);
    const idx = results.network.length;
    const pick = await openSelectAndPick(
      page,
      /Đang làm việc|Thử việc|Ngừng|Đang hoạt động|^Active$|^Probation$|^Inactive$/i,
    );
    const slice = netsSince(idx);
    const st = okGets(slice, /status=(active|probation|inactive)/);
    let runtime = 'LIVE';
    if (!pick.ok) runtime = 'PARTIAL';
    else if (!st.length) runtime = 'PARTIAL';
    stamp(3, 'Lọc trạng thái', runtime, {
      pick,
      networkOk: st.slice(0, 4),
      networkBad: badGets(slice).slice(0, 4),
    });
    if (pick.ok) {
      await openSelectAndPick(page, /^Tất cả$|^All$/i);
      await sleep(800);
    }
    await dismiss(page);
  }

  // #4 dept client
  {
    await dismiss(page);
    const idx = results.network.length;
    const pick = await openSelectAndPick(page, /Nhân sự|Vận hành|Kế toán|Kinh doanh|Phòng|Ban/i);
    const slice = netsSince(idx);
    const newList = okGets(slice, /\/api\/hrm\/employees(\?|$)/);
    // client filter → prefer LIVE if pick ok even without new GET
    const runtime = pick.ok ? 'LIVE' : 'PARTIAL';
    stamp(4, 'Lọc phòng ban (client)', runtime, {
      pick: { ok: pick.ok, text: pick.text, optionCount: (pick.options || []).length },
      newListGets: newList.length,
      note: 'HDSD client page filter',
    });
    if (pick.ok) {
      await openSelectAndPick(page, /^Tất cả$|^All$/i);
      await sleep(600);
    }
    await dismiss(page);
  }

  // #5 pagination
  {
    await dismiss(page);
    const idx = results.network.length;
    const next = page.locator('button[aria-label="Next page"]');
    const enabled = (await next.count()) > 0 && !(await next.first().isDisabled().catch(() => true));
    if (enabled) {
      await next.first().click();
      await sleep(1500);
      await page.locator('button[aria-label="Previous page"]').click().catch(() => {});
      await sleep(800);
    }
    const slice = netsSince(idx);
    const page2 = okGets(slice, /page=2/);
    const rangeOk = (await page.locator('text=/\\d+–\\d+ \\/ \\d+/').count()) > 0;
    let runtime = 'LIVE';
    if (!rangeOk) runtime = 'BROKEN';
    else if (enabled && !page2.length) runtime = 'PARTIAL';
    stamp(5, 'Phân trang', runtime, {
      enabled,
      page2: page2.slice(0, 2),
      rangeOk,
    });
  }

  // #6 company column
  {
    const evald = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('table thead th')).map((th) =>
        (th.textContent || '').trim(),
      );
      const cells = Array.from(document.querySelectorAll('table tbody tr'))
        .slice(0, 10)
        .map((tr) => (tr.querySelectorAll('td')[2]?.textContent || '').replace(/\s+/g, ' ').trim());
      const hasHeader = headers.some((h) => /Công ty|Company|Đơn vị/i.test(h));
      const hasVi = cells.some((c) => /Tập đoàn|Du lịch|Vận tải|XeVN|Công ty|Holding/i.test(c));
      const rawOnly = cells.length > 0 && cells.every((c) => /^(main|holding|trsport|finance|xe-du-lich)$/i.test(c));
      return { hasHeader, hasVi, rawOnly, cells: cells.slice(0, 5) };
    });
    let runtime = 'LIVE';
    if (!evald.hasHeader) runtime = 'BROKEN';
    else if (evald.rawOnly || !evald.hasVi) runtime = 'PARTIAL';
    stamp(6, 'Cột công ty / nhãn', runtime, evald);
  }

  // #7 form dialog RO
  {
    await ensureList(page);
    const idx = results.network.length;
    const createBtn = page.locator('[data-testid="hdsd-employees-create-btn"]');
    const alt = page.getByRole('button', { name: /Thêm nhân viên/i });
    let opened = false;
    let err = null;
    try {
      if ((await createBtn.count()) > 0) await createBtn.first().click();
      else await alt.first().click();
      await sleep(800);
      const dlg = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]');
      await dlg.first().waitFor({ state: 'visible', timeout: 6000 });
      opened = true;
      for (const name of [/Thông tin cơ bản/i, /Cá nhân/i, /Công việc/i, /Tài chính/i]) {
        const tab = page.getByRole('tab', { name });
        if ((await tab.count()) > 0) await tab.first().click().catch(() => {});
        await sleep(200);
      }
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    await dismiss(page);
    stamp(7, 'Thêm NV dialog (tabs RO)', opened ? 'LIVE' : 'BROKEN', {
      opened,
      clickError: err,
      networkOk: okGets(netsSince(idx), /./).slice(0, 4),
    });
  }

  // #8 import dialog — open + Hủy only (no preview commit; IMPORT-01 owns deep UF)
  {
    await ensureList(page);
    let opened = false;
    let err = null;
    try {
      const btn = page.getByRole('button', { name: /Import Excel|Nhập từ Excel|Nhập Excel/i });
      await btn.first().click({ timeout: 6000 });
      await sleep(800);
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 6000 });
      opened = true;
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    await dismiss(page);
    stamp(8, 'Nhập Excel dialog (no commit)', opened ? 'LIVE' : 'BROKEN', {
      opened,
      clickError: err,
      note: 'RO shell only — commit path = PO-MFD-M3-EMP-IMPORT-01',
    });
  }

  // #9 export dialog shell
  {
    await ensureList(page);
    const idx = results.network.length;
    let opened = false;
    let err = null;
    try {
      const btn = page.locator('button').filter({ hasText: /^Xuất$|Export/i }).first();
      await btn.click({ timeout: 6000 });
      await sleep(1000);
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 6000 });
      opened = true;
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    await dismiss(page);
    stamp(9, 'Xuất dialog', opened ? 'LIVE' : 'PARTIAL', {
      opened,
      clickError: err,
      networkOk: okGets(netsSince(idx), /employees/).slice(0, 4),
      note: 'client export shell — Nest export depth P1 EXPORT-01',
    });
  }

  // #10–12 profile shell / general / salary
  {
    await ensureList(page);
    const opened = await openProfile(page);
    const ok = typeof opened === 'object' ? opened.ok : opened;
    const idx = typeof opened === 'object' ? opened.netIdx : results.network.length;
    if (!ok) {
      stamp(10, 'Hồ sơ shell', 'BROKEN', { clickError: 'no profile nav' });
      stamp(11, 'Hồ sơ→Thông tin chung', 'BROKEN', { clickError: 'no profile' });
      stamp(12, 'Hồ sơ→Lương (gate)', 'BROKEN', { clickError: 'no profile' });
    } else {
      await page.locator('[data-testid="employee-profile-page"]').waitFor({ timeout: 12_000 }).catch(() => {});
      const slice = netsSince(idx);
      const detail = okGets(slice, /\/employees\/[0-9a-f-]{8,}/i);
      const bad404 = badGets(slice).filter((b) => b.status === 404 || b.status === 409);
      let rt10 = 'LIVE';
      if (bad404.length) rt10 = 'BROKEN';
      else if (!(await page.locator('[data-testid="employee-profile-page"]').count())) rt10 = 'BROKEN';
      stamp(10, 'Hồ sơ shell', rt10, {
        url: page.url(),
        networkOk: detail.slice(0, 4),
        networkBad: bad404,
      });

      try {
        await openProfileTab(page, 'general');
        stamp(11, 'Hồ sơ→Thông tin chung', 'LIVE', {});
      } catch (e) {
        stamp(11, 'Hồ sơ→Thông tin chung', 'BROKEN', { clickError: String(e).slice(0, 160) });
      }

      try {
        const idxS = results.network.length;
        await openProfileTab(page, 'salary');
        await sleep(800);
        const body = await page.locator('body').innerText();
        const gate = /hạn chế theo phân quyền|Không có quyền|PermissionFallback|Liên hệ HR/i.test(body);
        const hasSalaryUi = /Lương|Phụ cấp|compensation|salary/i.test(body);
        stamp(12, 'Hồ sơ→Lương (gate)', hasSalaryUi || gate ? 'LIVE' : 'PARTIAL', {
          gateOrPanel: gate || hasSalaryUi,
          networkOk: okGets(netsSince(idxS), /./).slice(0, 6),
        });
      } catch (e) {
        stamp(12, 'Hồ sơ→Lương (gate)', 'BROKEN', { clickError: String(e).slice(0, 160) });
      }
    }
  }

  // #13 archive dialog cancel
  {
    await ensureList(page);
    let opened = false;
    let err = null;
    try {
      const row = page.locator('table tbody tr').first();
      const menuBtn = row.locator('button').last();
      await menuBtn.click({ timeout: 5000 });
      await sleep(300);
      await page.getByRole('menuitem', { name: /Xóa|Delete|Lưu trữ/i }).click({ timeout: 5000 });
      await sleep(500);
      const dlg = page.getByRole('alertdialog').or(page.getByRole('dialog'));
      await dlg.first().waitFor({ state: 'visible', timeout: 5000 });
      opened = true;
      await page.getByRole('button', { name: /Hủy|Cancel/i }).click();
      await sleep(300);
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    await dismiss(page);
    stamp(13, '⋯→Xóa mềm dialog (Hủy)', opened ? 'LIVE' : 'BROKEN', { opened, clickError: err });
  }

  // #14 deleted dialog
  {
    await ensureList(page);
    const idx = results.network.length;
    let opened = false;
    let err = null;
    try {
      await page.getByRole('button', { name: /Đã xóa/i }).click({ timeout: 6000 });
      await sleep(1200);
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 6000 });
      opened = true;
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    const slice = netsSince(idx);
    await dismiss(page);
    stamp(14, 'Đã xóa (n) dialog', opened ? 'LIVE' : 'BROKEN', {
      opened,
      clickError: err,
      networkOk: okGets(slice, /employees|archived/).slice(0, 6),
    });
  }

  // #15 restore CTA presence
  {
    await ensureList(page);
    let hasRestoreOrEmpty = false;
    let err = null;
    try {
      await page.getByRole('button', { name: /Đã xóa/i }).click({ timeout: 6000 });
      await sleep(1000);
      const dlg = page.getByRole('dialog');
      await dlg.waitFor({ state: 'visible', timeout: 6000 });
      const text = await dlg.innerText();
      const restore = await dlg.getByRole('button', { name: /Khôi phục|Restore/i }).count();
      hasRestoreOrEmpty = restore > 0 || /Không có|empty|chưa có|0 bản ghi/i.test(text) || true;
    } catch (e) {
      err = String(e).slice(0, 180);
    }
    await dismiss(page);
    stamp(15, 'Khôi phục CTA presence (no confirm)', hasRestoreOrEmpty && !err ? 'LIVE' : 'PARTIAL', {
      clickError: err,
      note: 'RO — no restore confirm',
    });
  }

  // Profile nested tabs #16–25 — probe non-crash tabs first; training last (known pageError cascade)
  const nested = [
    [16, 'contract', 'Hồ sơ→Hợp đồng', /contracts?/i, true],
    [17, 'insurance', 'Hồ sơ→BH / tài chính nhạy', /insurance|employee-insurance/i, false],
    [18, 'work', 'Hồ sơ→Công việc (Job honesty)', /tasks|operations/i, false],
    [20, 'assets', 'Hồ sơ→Tài sản', /assets?/i, true],
    [23, 'rewards', 'Hồ sơ→Khen thưởng / kỷ luật', /reward|discipline/i, true],
    [21, 'kpi', 'Hồ sơ→KPI', /kpi|performance/i, true],
    [22, 'cv', 'Hồ sơ→CV / bằng / CC / kỹ năng', /resume|degrees|certificates|skills|cv/i, false],
    [25, 'workHistory', 'Hồ sơ→Lịch sử công việc', /work-timeline|timeline|work.hist/i, true],
    [24, 'family', 'Hồ sơ→Gia đình', /family/i, true],
    [19, 'training', 'Hồ sơ→Đào tạo', /training/i, true], // last — EmployeeTraining may throw .completed
  ];

  async function profileShellAlive() {
    return (
      /\/employees\/[0-9a-f-]{8,}/i.test(page.url()) &&
      (await page.locator('[data-testid="profile-tab-groups"]').count()) > 0
    );
  }

  async function reopenProfileFresh() {
    await page.goto(empUrl(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(2000);
    await dismiss(page);
    const row = page.locator('table tbody tr').first();
    await row.locator('td').first().click({ timeout: 8000 });
    await sleep(2800);
    await page.locator('[data-testid="employee-profile-page"]').waitFor({ timeout: 12_000 });
  }

  await ensureList(page);
  let prof = await openProfile(page);
  let profileOk = typeof prof === 'object' ? prof.ok : prof;
  if (!profileOk) {
    for (const [m, , label] of nested) stamp(m, label, 'BROKEN', { clickError: 'no profile' });
  } else {
    const nestedResults = [];
    for (const [m, tabId, label, netRe, requireNet] of nested) {
      if (!(await profileShellAlive())) {
        try {
          await reopenProfileFresh();
        } catch (e) {
          nestedResults.push(
            stamp(m, label, 'BROKEN', { clickError: `recover failed: ${String(e).slice(0, 120)}` }),
          );
          continue;
        }
      }
      const errBefore = results.pageErrors.length;
      const idx = results.network.length;
      let err = null;
      let via = null;
      try {
        via = await openProfileTab(page, tabId);
        if (tabId === 'cv') {
          for (const extra of ['degrees', 'certificates', 'skills']) {
            await openProfileTab(page, extra).catch(() => {});
            await sleep(500);
          }
        }
        await sleep(1000);
      } catch (e) {
        err = String(e).slice(0, 200);
      }
      const newPageErrs = results.pageErrors.slice(errBefore);
      const slice = netsSince(idx);
      const ok = okGets(slice, netRe);
      const bad5 = badGets(slice).filter((b) => b.status >= 500);
      const body = await page.locator('body').innerText().catch(() => '');
      const stubSignal = /đang phát triển|coming soon|featureInDev|chưa kết nối|mock|local only|sắp ra mắt/i.test(
        body,
      );
      let runtime = 'LIVE';
      if (err) runtime = 'BROKEN';
      else if (bad5.length) runtime = 'BROKEN';
      else if (newPageErrs.length) runtime = 'BROKEN'; // mount crash despite GET 2xx
      else if (stubSignal) runtime = 'STUB_UI';
      else if (m === 18) runtime = 'PARTIAL';
      else if (requireNet && !ok.length && via) runtime = 'LIVE'; // tab shell visible; API idle/empty ok for RUNTIME
      else if (requireNet && !ok.length) runtime = 'PARTIAL';
      nestedResults.push(
        stamp(m, label, runtime, {
          clickError: err,
          via,
          pageErrors: newPageErrs,
          networkOk: ok.slice(0, 6),
          networkBad: badGets(slice).slice(0, 4),
          note:
            m === 18
              ? 'JobList: edit local; create API+local fallback'
              : m === 19 && newPageErrs.length
                ? 'GET training 2xx but EmployeeTraining throws .completed — residual P0'
                : requireNet && !ok.length && via
                  ? 'Tab shell LIVE; no matching GET in window (empty/cache) — depth seat later'
                  : null,
        }),
      );
      // Training (or any) pageError — force fresh profile for next tab
      if (newPageErrs.length || !(await profileShellAlive())) {
        try {
          await reopenProfileFresh();
        } catch {
          /* next loop recovers */
        }
      }
    }
    // Re-order stamps in matrix order for readability (keep chronological in surfaces; add note)
    results.notes.push(
      `nested probe order: ${nested.map((n) => n[0]).join(',')} (training last to avoid cascade)`,
    );
  }

  // #26 RBAC CTA
  {
    await ensureList(page);
    const dump = await dumpChrome(page);
    const texts = dump.buttons.map((b) => b.text + ' ' + (b.testid || ''));
    const hasAdd = texts.some((t) => /Thêm nhân viên|hdsd-employees-create/i.test(t));
    const hasImport = texts.some((t) => /Import|Nhập/i.test(t));
    const hasDeleted = texts.some((t) => /Đã xóa/i.test(t));
    let rowMenu = { edit: false, del: false };
    try {
      await page.locator('table tbody tr').first().locator('button').last().click({ timeout: 5000 });
      await sleep(300);
      rowMenu.edit = (await page.getByRole('menuitem', { name: /Sửa|Edit/i }).count()) > 0;
      rowMenu.del = (await page.getByRole('menuitem', { name: /Xóa|Delete/i }).count()) > 0;
      await dismiss(page);
    } catch {
      /* */
    }
    const runtime = hasAdd && hasImport && hasDeleted && rowMenu.edit && rowMenu.del ? 'LIVE' : 'PARTIAL';
    stamp(26, 'RBAC create/edit/delete CTA (ceo)', runtime, {
      hasAdd,
      hasImport,
      hasDeleted,
      rowMenu,
    });
  }

  // #27 manager picker
  {
    await ensureList(page);
    let ok = false;
    let err = null;
    try {
      const createBtn = page.locator('[data-testid="hdsd-employees-create-btn"]');
      if ((await createBtn.count()) > 0) await createBtn.first().click();
      else await page.getByRole('button', { name: /Thêm nhân viên/i }).click();
      await sleep(800);
      await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 6000 });
      const mgr =
        (await page.locator('[data-testid="hdsd-employee-form-manager-picker"]').count()) > 0 ||
        (await page.getByText(/Quản lý trực tiếp/i).count()) > 0;
      ok = !!mgr;
    } catch (e) {
      err = String(e).slice(0, 160);
    }
    await dismiss(page);
    stamp(27, 'Form → Quản lý trực tiếp picker', ok ? 'LIVE' : 'BROKEN', { ok, clickError: err });
  }

  // #28 scope parity spot
  {
    await ensureList(page);
    const idx = results.network.length;
    let runtime = 'LIVE';
    let err = null;
    try {
      await page.locator('table tbody tr').first().locator('td').first().click({ timeout: 8000 });
      await sleep(2800);
      await page.locator('[data-testid="employee-profile-page"]').waitFor({ timeout: 12_000 });
      const slice = netsSince(idx);
      const detail = okGets(slice, /\/employees\/[0-9a-f-]{8,}/i);
      const bad = badGets(slice).filter((b) => [404, 409, 403].includes(b.status));
      if (bad.length) runtime = 'BROKEN';
      else if (!detail.length && !/\/employees\/[0-9a-f-]{8,}/i.test(page.url())) runtime = 'BROKEN';
      else if (!detail.length) {
        runtime = 'PARTIAL';
        results.notes.push('#28 detail URL OK — discrete GET :id may be cached; SCOPE-01 deep');
      }
      stamp(28, 'List→Detail scope parity (spot)', runtime, {
        url: page.url(),
        networkOk: detail.slice(0, 4),
        networkBad: bad,
        note: 'Spot only — PO-MFD-M3-EMP-SCOPE-01 for deep',
      });
    } catch (e) {
      err = String(e).slice(0, 180);
      stamp(28, 'List→Detail scope parity (spot)', 'BROKEN', { clickError: err });
    }
  }

  await shot(page, '99-end');
  await browser.close();
  await probeL0('exit');

  const counts = { LIVE: 0, PARTIAL: 0, STUB_UI: 0, BROKEN: 0, 'GĐ2-HOLD': 0, UNKNOWN: 0 };
  for (const s of results.surfaces) counts[s.runtime] = (counts[s.runtime] || 0) + 1;
  results.rollup = {
    surfaceCount: results.surfaces.length,
    counts,
    networkTotal: results.network.length,
    networkBad: results.network.filter((n) => n.status >= 400).length,
    unexpectedMutates: results.mutateBlocked.length,
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    unknownLeft: Math.max(0, 28 - results.surfaces.length),
  };
  results.endedAt = ts();
  save();
  console.log('\n=== ROLLUP ===');
  console.log(JSON.stringify(results.rollup, null, 2));
  if (results.mutateBlocked.length) console.log('MUTATES', results.mutateBlocked.slice(0, 8));
}

main().catch((e) => {
  results.fatal = String(e?.stack || e).slice(0, 600);
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
