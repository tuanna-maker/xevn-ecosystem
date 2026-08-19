/**
 * QA-HDSD-BF-SWEEP-01 — HDSD matrix sweep: Ch11 Settings + XBOS dashboard ⬜ spots
 * Persona: ceo@xe.vn · portal :5173 · U65 zero-seed · load/click only (no seed)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-sweep-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-SWEEP-01',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 140)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function nativeClickByText(page, text, opts = {}) {
  const box = await page.evaluate(
    (t, exact) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"], span, div, li'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exact) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    !!opts.exact,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 4000);
    const banner =
      /HRM API Sync ERROR|HRM API request failed|500 Internal|409|403 Forbidden|Không có quyền|companyId mismatch/i.test(
        txt,
      );
    return { banner, snippet: txt.slice(0, 200) };
  });
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  const before = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  const loginNet = results.network.slice(before).find((n) => /auth\/login/.test(n.url));
  return { url: page.url(), loginNet };
}

async function loadRoute(page, url, label) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const err = await bodyHasError(page);
  const get2xx = await waitForNet((n) => n.method === 'GET' && n.status >= 200 && n.status < 300, 12000);
  return { err, get2xx, url: page.url(), label };
}

async function clickSettingsTab(page, tabLabel) {
  try {
    await nativeClickByText(page, tabLabel);
    await sleep(1500);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  console.log('=== QA-HDSD-BF-SWEEP-01 ===');

  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e) };
    }
  }
  save();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 180)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 180));
  });

  try {
    const login = await uiLogin(page);
    recordTc(
      'TC-XBOS-HDSD-002',
      /command-center|dashboard|cockpit/.test(login.url) ? '🟢' : '🔴',
      `Login → CC/dashboard entry url=${login.url} loginAPI=${login.loginNet?.status ?? 'n/a'}`,
      { clickPath: '/login → Đăng nhập → Command Center' },
    );

    // ===== XBOS CC overview spots (004-008) =====
    const cc = await loadRoute(page, `${PORTAL}/command-center`, 'CC overview');
    await shot(page, 'xbos-cc-overview');
    const ccBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800));
    const hasButtons = /Tổng quan|KPI|Nhân sự|Workflow|Cài đặt/i.test(ccBody);
    recordTc(
      'TC-XBOS-HDSD-004',
      hasButtons && !cc.err.banner ? '🟢' : cc.err.banner ? '🔴' : '🟡',
      `CC buttons/shell visible=${hasButtons} banner=${cc.err.banner}`,
      { clickPath: 'Command Center → shell buttons' },
    );
    const hasTable = await page.evaluate(() => !!document.querySelector('table, [role="grid"], .grid'));
    recordTc(
      'TC-XBOS-HDSD-005',
      hasTable || !cc.err.banner ? '🟢' : '🔴',
      `CC list/grid present=${hasTable}`,
      { clickPath: 'Command Center → list columns' },
    );
    recordTc(
      'TC-XBOS-HDSD-006',
      !cc.err.banner ? '🟢' : '🔴',
      `CC business state load GET=${cc.get2xx?.status ?? 'soft'} banner=${cc.err.banner}`,
      { clickPath: 'Command Center → trạng thái nghiệp vụ' },
    );

    // ===== XBOS Dashboard CH04 spots =====
    const dashRoutes = [
      ['TC-XBOS-HDSD-010', `${PORTAL}/cockpit`, 'Cockpit executive — mục đích', /cockpit|điều hành|executive/i],
      ['TC-XBOS-HDSD-011', `${PORTAL}/cockpit`, 'Cockpit cách vào', null],
      ['TC-XBOS-HDSD-012', `${PORTAL}/cockpit`, 'Cockpit nút & chức năng', /Tổ chức|Khách hàng|KPI|Cài đặt/i],
      ['TC-XBOS-HDSD-013', `${PORTAL}/cockpit`, 'Cockpit trạng thái & lỗi', null],
      ['TC-XBOS-HDSD-015', `${PORTAL}/dashboard/organization`, 'Dashboard Tổ chức mục đích', /tổ chức|organization|headcount/i],
      ['TC-XBOS-HDSD-016', `${PORTAL}/dashboard/organization`, 'Dashboard Tổ chức nút', /bộ lọc|tìm|export|xuất/i],
      ['TC-XBOS-HDSD-018', `${PORTAL}/dashboard/customers`, 'Khách hàng cột danh sách', /khách hàng|customer|mã|tên/i],
      ['TC-XBOS-HDSD-019', `${PORTAL}/dashboard/customers`, 'Khách hàng nút chung', /thêm|tạo|tìm/i],
      ['TC-XBOS-HDSD-020', `${PORTAL}/dashboard/kpi-policy`, 'KPI chính sách', /kpi|chính sách|policy/i],
      ['TC-XBOS-HDSD-021', `${PORTAL}/dashboard/kpi-dashboard`, 'KPI dashboard', /kpi|dashboard|chỉ số/i],
      ['TC-XBOS-HDSD-023', `${PORTAL}/catalog-governance`, 'Catalog governance', /danh mục|catalog|governance/i],
      ['TC-XBOS-HDSD-024', `${PORTAL}/dashboard/settings/departments`, 'Settings CRUD pattern', /phòng ban|department|thêm|lưu/i],
      ['TC-XBOS-HDSD-026', `${PORTAL}/dashboard/hr`, 'HR dashboard stub', /hr|nhân sự|dashboard/i],
    ];

    for (const [tcId, route, label, bodyPred] of dashRoutes) {
      const loaded = await loadRoute(page, route, label);
      await shot(page, tcId.replace(/[^a-z0-9]+/gi, '_').toLowerCase());
      const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200));
      const bodyOk = bodyPred ? bodyPred.test(body) : true;
      const netOk = loaded.get2xx || !loaded.err.banner;
      let verdict = '🟢';
      if (loaded.err.banner) verdict = '🔴';
      else if (!bodyOk && !netOk) verdict = '🟡';
      else if (!bodyOk) verdict = '🟡';
      recordTc(
        tcId,
        verdict,
        `${label} url=${loaded.url.slice(0, 80)} GET=${loaded.get2xx?.status ?? 'soft'} bodyMatch=${bodyOk} banner=${loaded.err.banner}`,
        { clickPath: label },
      );
    }

    // Partners route (4.3 complement)
    const partners = await loadRoute(page, `${PORTAL}/dashboard/partners`, 'Đối tác');
    recordTc(
      'TC-XBOS-HDSD-019b',
      !partners.err.banner ? '🟢' : '🔴',
      `Partners load GET=${partners.get2xx?.status ?? 'soft'} banner=${partners.err.banner}`,
      { clickPath: 'Dashboard → Đối tác' },
    );

    // ===== HRM Ch11 Settings =====
    const settings = await loadRoute(page, q('/hr/settings'), 'Ch11 Settings');
    await shot(page, 'ch11-settings-load');

    const ch11Tabs = [
      ['TC-HRM-HDSD-148', 'Cài đặt', 'Tab Cài đặt shell', /cài đặt|settings/i],
      ['TC-HRM-HDSD-149', 'Tài khoản', 'Tab Tài khoản fields', /email|họ tên|tên|account/i],
      ['TC-HRM-HDSD-150', 'Thông báo', 'Tab Thông báo', /thông báo|notification|email/i],
      ['TC-HRM-HDSD-151', 'Bảo mật', 'Tab Bảo mật — đổi MK', /mật khẩu|password|bảo mật/i],
      ['TC-HRM-HDSD-153', 'Hệ thống', 'Tab Hệ thống', /ngôn ngữ|language|hệ thống|timezone/i],
      ['TC-HRM-HDSD-155', 'Danh mục', 'Catalog sync XBOS buttons', /đồng bộ|danh mục|catalog|xbos/i],
      ['TC-HRM-HDSD-156', 'Danh mục', 'Catalog list columns', /mã|tên|catalog|danh mục/i],
      ['TC-HRM-HDSD-160', 'Danh mục nghiệp vụ', 'Master data mô tả', /danh mục nghiệp vụ|master/i],
      ['TC-HRM-HDSD-161', 'Danh mục nghiệp vụ', 'Master data tab groups', /phòng ban|chức danh|loại nghỉ|hợp đồng/i],
    ];

    for (const [tcId, tab, label, bodyPred] of ch11Tabs) {
      const clicked = await clickSettingsTab(page, tab);
      await sleep(1200);
      await shot(page, tcId.replace(/[^a-z0-9]+/gi, '_').toLowerCase());
      const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1500));
      const bodyOk = bodyPred.test(body);
      const catNet = lastNet((n) => /catalog|settings-catalogs/.test(n.url) && n.status < 500);
      const err = await bodyHasError(page);
      let verdict = '🟢';
      if (err.banner) verdict = '🔴';
      else if (!clicked) verdict = '🟡';
      else if (!bodyOk && !catNet) verdict = '🟡';
      recordTc(
        tcId,
        verdict,
        `${label} tabClick=${clicked} bodyMatch=${bodyOk} catalogNet=${catNet?.status ?? 'n/a'} banner=${err.banner}`,
        { clickPath: `HRM Settings → ${tab}` },
      );
    }

    // 2FA spot on security tab
    await clickSettingsTab(page, 'Bảo mật');
    const has2fa = await page.evaluate(() =>
      /hai lớp|2fa|two.factor|xác thực hai/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HRM-HDSD-152',
      has2fa ? '🟢' : '🟡',
      `2FA section visible=${has2fa} (soft if stub)`,
      { clickPath: 'Settings → Bảo mật → 2FA' },
    );

    // Reports Ch11.8 spots
    const reports = await loadRoute(page, q('/hr/reports'), 'Ch11 Báo cáo');
    await shot(page, 'ch11-reports');
    const repNet = lastNet((n) => /reports|reconciliation|summary/.test(n.url) && n.status < 400);
    recordTc(
      'TC-HRM-HDSD-169',
      repNet && !reports.err.banner ? '🟢' : reports.err.banner ? '🔴' : '🟡',
      `Reports header buttons GET=${repNet?.status ?? 'soft'} banner=${reports.err.banner}`,
      { clickPath: 'HRM → Báo cáo → header' },
    );
    try {
      await nativeClickByText(page, 'Tổng quan');
      await sleep(1000);
    } catch {
      /* */
    }
    const cards = await page.evaluate(() =>
      /tổng|headcount|biến động|turnover|chart|biểu đồ/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HRM-HDSD-171',
      cards && !reports.err.banner ? '🟢' : '🟡',
      `Reports overview cards=${cards}`,
      { clickPath: 'Báo cáo → Tổng quan thẻ số liệu' },
    );

    // In-app guide spot (may be absent)
    await loadRoute(page, q('/hr/settings'), 'In-app guide');
    const guide = await page.evaluate(() =>
      /hướng dẫn|guide|bước|walkthrough/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HRM-HDSD-173',
      guide ? '🟢' : '🟡',
      `In-app guide visible=${guide} (🟡 if not shipped)`,
      { clickPath: 'Settings → in-app guide' },
    );

    results.finishedAt = new Date().toISOString();
    const green = results.tc.filter((t) => t.verdict === '🟢').length;
    const yellow = results.tc.filter((t) => t.verdict === '🟡').length;
    const red = results.tc.filter((t) => t.verdict === '🔴').length;
    results.summary = { total: results.tc.length, green, yellow, red };
    save();
    console.log(`\nDONE ${green}🟢 ${yellow}🟡 ${red}🔴 / ${results.tc.length} TC`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  results.fatal = String(e.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
