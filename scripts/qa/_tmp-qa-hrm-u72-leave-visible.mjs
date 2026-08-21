/**
 * Leave page: distinguish visible raw leave codes vs hidden Select DOM
 */
import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const XBOS = 'http://127.0.0.1:28002';
const HRM = 'http://127.0.0.1:28001';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-u72-leave-visible-runtime.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const login = await (
  await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  })
).json();
const data = login?.data ?? login;
const token = data.accessToken || data.access_token;

// API leave list (under attendance controller prefix)
let leaveApi = null;
for (const path of [
  `${HRM}/api/hrm/attendance/leave-requests?company_id=main&page_size=10`,
  `${HRM}/api/hrm/leave-requests?company_id=main&page_size=10`,
]) {
  try {
    const r = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    leaveApi = { path, status: r.status, body: j };
    if (r.ok) break;
  } catch (e) {
    leaveApi = { path, err: String(e) };
  }
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
await page.evaluateOnNewDocument((s) => {
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', JSON.stringify(s.user));
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
  }
}, {
  token,
  expiresAt: Date.now() + 8e6,
  user: data.user || { userId: 'ceo@xe.vn', email: 'ceo@xe.vn', roles: ['group_ceo'] },
});

await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3500);

// Click Nghỉ phép via native mouse on text
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,[role=tab]')].find((b) =>
    (b.textContent || '').trim() === 'Nghỉ phép',
  );
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
await sleep(2500);

// Force tab to requests — click by exact text
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,[role=tab]')].find((b) =>
    /Danh sách yêu cầu/.test((b.textContent || '').trim()),
  );
  el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});
await sleep(3000);

const scan = async (label) =>
  page.evaluate((lab) => {
    const isVisible = (el) => {
      const st = window.getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const all = [...document.querySelectorAll('td, span, div, p, badge, li, button')];
    const rawAll = all
      .map((n) => ({ t: text(n), visible: isVisible(n), tag: n.tagName }))
      .filter((x) => /^(annual|sick|unpaid|LVT_\d+)$/i.test(x.t));
    const rawVisible = rawAll.filter((x) => x.visible);
    const tables = [...document.querySelectorAll('table')]
      .filter((t) => isVisible(t))
      .map((table) => ({
        headers: [...table.querySelectorAll('th')].map((th) => text(th)),
        rows: [...table.querySelectorAll('tbody tr')].slice(0, 6).map((tr) =>
          [...tr.querySelectorAll('td')].map((td) => text(td)).slice(0, 8),
        ),
      }));
    return {
      label: lab,
      url: location.href,
      rawAllCount: rawAll.length,
      rawVisible: rawVisible.slice(0, 20),
      tables,
      activeTab: [...document.querySelectorAll('[role=tab][data-state=active], [data-state=active]')]
        .map((t) => text(t))
        .slice(0, 8),
    };
  }, label);

const beforeOpen = await scan('list-default');

// Open leave-type filter select if present
await page.evaluate(() => {
  const triggers = [...document.querySelectorAll('button[role=combobox], button')].filter((b) =>
    /Loại|leave|Tất cả|all/i.test(b.textContent || ''),
  );
  triggers[0]?.click();
});
await sleep(800);
const afterOpen = await scan('filter-open');

// Open first row detail if list rows exist
await page.evaluate(() => {
  const row = document.querySelector('table tbody tr');
  row?.click();
});
await sleep(1500);
const detail = await scan('after-row-click');

const out = { leaveApi, beforeOpen, afterOpen, detail, at: new Date().toISOString() };
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
