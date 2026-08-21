/**
 * Recheck2: gender/employment on known employee + leave list tab raw codes
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
  '../../docs/qa/evidence/_tmp-qa-hrm-u72-recheck2-runtime.json',
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

const empRes = await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=20`, {
  headers: { Authorization: `Bearer ${token}` },
});
const empJson = await empRes.json();
const items = empJson?.data?.data || empJson?.data?.items || [];
const withGender = items.find((e) => e.gender) || items[0];
const withEmpType = items.find((e) => e.employment_type) || withGender;

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

const out = {
  empApiSample: items.slice(0, 5).map((e) => ({
    id: e.id,
    gender: e.gender,
    employment_type: e.employment_type,
    full_name: e.full_name,
  })),
  chosen: withGender
    ? { id: withGender.id, gender: withGender.gender, employment_type: withGender.employment_type }
    : null,
};

if (withGender?.id) {
  await page.goto(
    `${PORTAL}/hr/employees/${withGender.id}?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: 'domcontentloaded', timeout: 90_000 },
  );
  await sleep(3500);
  // Personal info tab
  await page.evaluate(() => {
    [...document.querySelectorAll('button,[role=tab]')]
      .find((b) => /Thông tin chung|Personal|Chung/i.test(b.textContent || ''))
      ?.click();
  });
  await sleep(800);
  out.profileGeneral = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const pick = (lab) => {
      const all = [...document.querySelectorAll('div,span,p,label')];
      const el = all.find((n) => (n.textContent || '').trim() === lab);
      if (!el) return null;
      const parent = el.parentElement;
      return (parent?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    };
    return {
      genderBox: pick('Giới tính'),
      hasMale: /\bmale\b/i.test(body),
      hasNam: body.includes('Nam'),
      hasNu: body.includes('Nữ'),
      snippet: body.match(/Giới tính.{0,30}/)?.[0],
      url: location.href,
    };
  });
  await page.evaluate(() => {
    [...document.querySelectorAll('button,[role=tab]')]
      .find((b) => /Công việc|Job/i.test(b.textContent || ''))
      ?.click();
  });
  await sleep(1000);
  out.profileJob = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const pick = (lab) => {
      const all = [...document.querySelectorAll('div,span,p,label')];
      const el = all.find((n) => (n.textContent || '').trim() === lab);
      if (!el) return null;
      return (el.parentElement?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    };
    return {
      empTypeBox: pick('Loại hình làm việc') || pick('Loại hình'),
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasToan: body.includes('Toàn thời gian'),
      snippet: body.match(/Loại hình.{0,40}/)?.[0],
    };
  });
}

// Leave requests list
await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'domcontentloaded',
  timeout: 90_000,
});
await sleep(3500);
await page.evaluate(() => {
  [...document.querySelectorAll('button,a,[role=tab]')]
    .find((b) => /Nghỉ phép|Leave/i.test((b.textContent || '').trim()) && (b.textContent || '').trim().length < 40)
    ?.click();
});
await sleep(2000);
// click Danh sách yêu cầu
await page.evaluate(() => {
  [...document.querySelectorAll('button,[role=tab]')]
    .find((b) => /Danh sách|Requests|Yêu cầu/i.test(b.textContent || ''))
    ?.click();
});
await sleep(2500);
out.leave = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const rawCells = [...document.querySelectorAll('td, span, badge')]
    .map((n) => text(n))
    .filter((t) => /^(annual|sick|unpaid|LVT_\d+)$/i.test(t))
    .slice(0, 20);
  const tables = [...document.querySelectorAll('table')].map((table) => {
    const headers = [...table.querySelectorAll('th')].map((th) => text(th));
    const rows = [...table.querySelectorAll('tbody tr')].slice(0, 8).map((tr) =>
      [...tr.querySelectorAll('td')].map((td) => text(td)).slice(0, 8),
    );
    return { headers, rows };
  });
  return { rawCells, tables, url: location.href, bodyHasAnnual: /\bannual\b/i.test(document.body.innerText) };
});

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
