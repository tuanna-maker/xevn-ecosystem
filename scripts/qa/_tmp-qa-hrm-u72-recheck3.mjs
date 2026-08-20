/**
 * Recheck3: employee with gender + leave requests list tab
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
  '../../docs/qa/evidence/_tmp-qa-hrm-u72-recheck3-runtime.json',
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

const list = await (
  await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=30`, {
    headers: { Authorization: `Bearer ${token}` },
  })
).json();
const ids = (list?.data?.data || []).map((e) => e.id).slice(0, 15);
let chosen = null;
for (const id of ids) {
  const det = await (
    await fetch(`${HRM}/api/hrm/employees/${id}?company_id=main`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();
  const e = det?.data ?? det;
  if (e?.gender || e?.employment_type) {
    chosen = {
      id: e.id,
      gender: e.gender,
      employment_type: e.employment_type,
      full_name: e.full_name,
    };
    if (e.gender && e.employment_type) break;
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

const out = { chosen };

if (chosen?.id) {
  await page.goto(
    `${PORTAL}/hr/employees/${chosen.id}?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: 'networkidle2', timeout: 90_000 },
  );
  await sleep(2500);
  out.profile = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const pick = (lab) => {
      const el = [...document.querySelectorAll('div,span,p,label')].find(
        (n) => (n.textContent || '').trim() === lab,
      );
      return el ? (el.parentElement?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) : null;
    };
    return {
      genderBox: pick('Giới tính'),
      empTypeBox: pick('Loại hình làm việc'),
      hasMale: /\bmale\b/i.test(body),
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasNam: /\bNam\b/.test(body),
      hasToan: /Toàn thời gian/.test(body),
      url: location.href,
    };
  });
  // job tab
  await page.evaluate(() => {
    [...document.querySelectorAll('button,[role=tab]')]
      .find((b) => /^Công việc$/i.test((b.textContent || '').trim()))
      ?.click();
  });
  await sleep(1000);
  out.jobTab = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const pick = (lab) => {
      const el = [...document.querySelectorAll('div,span,p,label')].find(
        (n) => (n.textContent || '').trim() === lab,
      );
      return el ? (el.parentElement?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) : null;
    };
    return {
      empTypeBox: pick('Loại hình làm việc') || pick('Loại hình'),
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasToan: /Toàn thời gian/.test(body),
      snippet: body.match(/Loại hình.{0,50}/)?.[0],
    };
  });
}

// Leave — go directly to list via query if app supports, else click tabs carefully
await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3000);
// Outer Attendance tabs: first find Nghỉ phép
const leaveNav = await page.evaluate(() => {
  const clicks = [];
  const all = [...document.querySelectorAll('button,[role=tab],a')];
  const outer = all.find((b) => /Nghỉ phép/.test(b.textContent || '') && (b.textContent || '').length < 30);
  if (outer) {
    outer.click();
    clicks.push('Nghỉ phép');
  }
  return clicks;
});
await sleep(2500);
const listNav = await page.evaluate(() => {
  const all = [...document.querySelectorAll('button,[role=tab],a')];
  const inner = all.find((b) =>
    /Danh sách yêu cầu|Request list|Danh sách/.test((b.textContent || '').trim()),
  );
  if (inner) {
    inner.click();
    return (inner.textContent || '').trim();
  }
  // try TabsTrigger value requests
  const byVal = document.querySelector('[value="requests"], [data-state][value="requests"]');
  if (byVal) {
    byVal.click();
    return 'value=requests';
  }
  return null;
});
await sleep(3000);
out.leaveNav = { leaveNav, listNav };
out.leave = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const rawCells = [...document.querySelectorAll('td,span')]
    .map((n) => text(n))
    .filter((t) => /^(annual|sick|unpaid|LVT_\d+)$/i.test(t))
    .slice(0, 25);
  const viLeave = [...document.querySelectorAll('td,span')]
    .map((n) => text(n))
    .filter((t) => /Nghỉ phép|Nghỉ ốm|Nghỉ không lương|phép năm/i.test(t))
    .slice(0, 15);
  const tables = [...document.querySelectorAll('table')].map((table) => ({
    headers: [...table.querySelectorAll('th')].map((th) => text(th)),
    sampleRows: [...table.querySelectorAll('tbody tr')].slice(0, 5).map((tr) =>
      [...tr.querySelectorAll('td')].map((td) => text(td)).slice(0, 7),
    ),
  }));
  return {
    rawCells,
    viLeave,
    tables,
    url: location.href,
    bodySlice: text(document.body).slice(0, 500),
  };
});

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
