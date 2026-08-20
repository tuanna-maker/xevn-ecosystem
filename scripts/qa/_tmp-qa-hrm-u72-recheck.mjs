/**
 * Focused recheck: AC-CO-IND-02, F-01/F-02 gender+employment, U-04 leave types
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
  '../../docs/qa/evidence/_tmp-qa-hrm-u72-recheck-runtime.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const data = j?.data ?? j;
const token = data.accessToken || data.access_token;
if (!token) throw new Error('login fail');

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

const out = { finishedAt: null };

// Company
await page.goto(`${PORTAL}/hr/company?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(4000);
out.industry = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  for (const table of document.querySelectorAll('table')) {
    const headers = [...table.querySelectorAll('th')].map((th) => text(th));
    const indIdx = headers.findIndex((h) => h.includes('Ngành nghề') || /industry/i.test(h));
    if (indIdx < 0) continue;
    const rows = [...table.querySelectorAll('tbody tr')].slice(0, 8).map((tr) => {
      const cells = [...tr.querySelectorAll('td')];
      return { name: text(cells[0]).slice(0, 60), industry: text(cells[indIdx]) };
    });
    return { headers, rows, url: location.href };
  }
  return { headers: [], rows: [], body: text(document.body).slice(0, 400), url: location.href };
});

// Employee with known gender from API
const empRes = await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=20`, {
  headers: { Authorization: `Bearer ${token}` },
});
const empJson = await empRes.json();
const items = empJson?.data?.items || empJson?.items || empJson?.data || [];
const sample =
  (Array.isArray(items) && items.find((e) => e.gender && e.employment_type)) ||
  (Array.isArray(items) && items[0]) ||
  null;
out.empApi = sample
  ? {
      id: sample.id,
      gender: sample.gender,
      employment_type: sample.employment_type,
      full_name: sample.full_name,
    }
  : null;

if (sample?.id) {
  await page.goto(
    `${PORTAL}/hr/employees/${sample.id}?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: 'domcontentloaded', timeout: 90_000 },
  );
  await sleep(3000);
  // click Công việc tab if needed for employment_type
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('button, [role=tab]')];
    const t = tabs.find((b) => /Công việc|Job|Thông tin chung/i.test(b.textContent || ''));
    t?.click();
  });
  await sleep(1000);
  out.profile = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const body = text(document.body);
    const findNear = (lab) => {
      const el = [...document.querySelectorAll('div,span,p,label,dt')].find(
        (n) => text(n) === lab || text(n).startsWith(lab + ':'),
      );
      if (!el) return null;
      const box = el.closest('.space-y-1, .grid, div') || el.parentElement;
      return text(box).slice(0, 160);
    };
    return {
      genderBox: findNear('Giới tính'),
      empTypeBox: findNear('Loại hình làm việc') || findNear('Loại hình'),
      hasMale: /\bmale\b/i.test(body),
      hasFemale: /\bfemale\b/i.test(body),
      hasNam: /\bNam\b/.test(body),
      hasNu: /\bNữ\b/.test(body),
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasToan: /Toàn thời gian/.test(body),
      url: location.href,
    };
  });

  // Resume
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('button, a, [role=tab]')].find((b) =>
      /Sơ yếu|Resume|Lý lịch|Hồ sơ/i.test(b.textContent || ''),
    );
    t?.click();
  });
  await sleep(1500);
  out.resume = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return {
      hasMale: /\bmale\b/i.test(body),
      hasNam: /\bNam\b/.test(body),
      snippet: body.match(/Giới tính.{0,40}/)?.[0] || null,
    };
  });
}

// Leave
await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await sleep(3000);
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button, a, [role=tab]')].find((b) =>
    /Nghỉ phép|Leave|Yêu cầu nghỉ|Đơn nghỉ/i.test(b.textContent || ''),
  );
  btn?.click();
});
await sleep(2500);
out.leave = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  for (const table of document.querySelectorAll('table')) {
    const headers = [...table.querySelectorAll('th')].map((th) => text(th));
    const idx = headers.findIndex((h) => /loại|type|nghỉ/i.test(h));
    if (idx < 0) continue;
    const vals = [...table.querySelectorAll('tbody tr')]
      .slice(0, 12)
      .map((tr) => text(tr.querySelectorAll('td')[idx]));
    return { headers, vals, url: location.href };
  }
  const raw = [...document.querySelectorAll('td, span')]
    .map((n) => text(n))
    .filter((t) => /^(annual|LVT_\d+)$/i.test(t))
    .slice(0, 20);
  return { headers: [], vals: [], raw, url: location.href };
});

// Requisition detail company + workflow
await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await sleep(3000);
await page.evaluate(() => {
  const t = [...document.querySelectorAll('button, a, [role=tab]')].find((b) =>
    /Yêu cầu|Requisition|YCT/i.test(b.textContent || ''),
  );
  t?.click();
});
await sleep(2000);
await page.evaluate(() => {
  const row = document.querySelector('tbody tr');
  row?.querySelector('button, a, td')?.click();
  row?.click();
});
await sleep(2000);
out.reqDetail = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const mono = [...document.querySelectorAll('td, p, span, code')]
    .map((n) => text(n))
    .filter((t) => /^(holding|trsport|logistics|finance|services)$/i.test(t))
    .slice(0, 8);
  const uuids = [...document.querySelectorAll('td, p, span, code')]
    .map((n) => text(n))
    .filter((t) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t),
    )
    .slice(0, 8);
  const body = text(document.body);
  return {
    mono,
    uuids,
    hasWfBadge: /Đã gắn quy trình/.test(body),
    snip: body.match(/Đơn vị.{0,80}/)?.[0] || body.match(/Công ty.{0,80}/)?.[0],
    url: location.href,
  };
});

// Settings status
await page.goto(`${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await sleep(3500);
out.settings = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const raw = [...document.querySelectorAll('td, span')]
    .map((n) => text(n))
    .filter((t) => /^(active|draft)$/i.test(t))
    .slice(0, 15);
  const vi = [...document.querySelectorAll('td, span')]
    .map((n) => text(n))
    .filter((t) => /^(Đang dùng|Nháp)$/.test(t))
    .slice(0, 15);
  return { raw, vi, url: location.href };
});

out.finishedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
