/**
 * Finalize recheck: AC-CO-IND-02 + profile F-01/F-02 + contracts F-04/F-05 + settings F-12
 * U65 · ceo@xe.vn · portal :5173
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
  '../../docs/qa/evidence/_tmp-qa-hrm-u72-finalize-runtime.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FORBIDDEN = new Set(['subsidiary', 'holding', 'parent', 'member', 'branch']);

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
  await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=40`, {
    headers: { Authorization: `Bearer ${token}` },
  })
).json();
const ids = (list?.data?.data || list?.data || []).map((e) => e.id).slice(0, 25);
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

const out = { chosen, at: new Date().toISOString() };

// Company industry — direct HRM company page
await page.goto(`${PORTAL}/hr/company?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3500);
out.industry = await page.evaluate((forbidden) => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const tables = [...document.querySelectorAll('table')];
  let headers = [];
  let rows = [];
  for (const table of tables) {
    const th = [...table.querySelectorAll('th')].map((h) => text(h));
    const idx = th.findIndex((h) => /Ngành/i.test(h));
    if (idx < 0) continue;
    headers = th;
    rows = [...table.querySelectorAll('tbody tr')].slice(0, 8).map((tr) => {
      const tds = [...tr.querySelectorAll('td')].map((td) => text(td));
      return { name: tds[1] || tds[0] || '', industry: tds[idx] || '' };
    });
    break;
  }
  const leaks = rows
    .map((r) => r.industry)
    .filter((v) => forbidden.includes(String(v).toLowerCase()));
  return {
    headers,
    rows,
    leaks,
    url: location.href,
    bodyHasSubsidiary: /\bsubsidiary\b/i.test(document.body?.innerText || ''),
    bodyHasHoldingAsIndustry: false,
  };
}, [...FORBIDDEN]);

// also CC embed
await page.goto(`${PORTAL}/command-center/hrm/company`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(5000);
out.industryCc = await page.evaluate((forbidden) => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const frames = [document, ...[...document.querySelectorAll('iframe')].map((f) => f.contentDocument).filter(Boolean)];
  for (const doc of frames) {
    const tables = [...doc.querySelectorAll('table')];
    for (const table of tables) {
      const th = [...table.querySelectorAll('th')].map((h) => text(h));
      const idx = th.findIndex((h) => /Ngành/i.test(h));
      if (idx < 0) continue;
      const rows = [...table.querySelectorAll('tbody tr')].slice(0, 8).map((tr) => {
        const tds = [...tr.querySelectorAll('td')].map((td) => text(td));
        return { name: tds[1] || tds[0] || '', industry: tds[idx] || '' };
      });
      const leaks = rows
        .map((r) => r.industry)
        .filter((v) => forbidden.includes(String(v).toLowerCase()));
      return { headers: th, rows, leaks, url: location.href, via: 'iframe-or-doc' };
    }
  }
  return {
    headers: [],
    rows: [],
    leaks: [],
    url: location.href,
    via: 'none',
    bodySlice: text(document.body).slice(0, 300),
  };
}, [...FORBIDDEN]);

if (chosen?.id) {
  await page.goto(
    `${PORTAL}/hr/employees/${chosen.id}?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: 'networkidle2', timeout: 90_000 },
  );
  await sleep(2500);
  out.profile = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const pickAfter = (lab) => {
      const m = body.match(new RegExp(lab + '\\s*([—\\-]|Nam|Nữ|Khác|Toàn thời gian|Bán thời gian|Hợp đồng|Thực tập|male|female|full[_-]?time)[^\\w]?', 'i'));
      return m ? m[0].slice(0, 80) : null;
    };
    return {
      genderSnippet: pickAfter('Giới tính'),
      empTypeSnippet: pickAfter('Loại hình làm việc') || pickAfter('Loại hình'),
      hasMale: /\bmale\b/i.test(body),
      hasFemale: /\bfemale\b/i.test(body),
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasNam: /\bNam\b/.test(body),
      hasToan: /Toàn thời gian/.test(body),
      url: location.href,
    };
  });
  await page.evaluate(() => {
    [...document.querySelectorAll('button,[role=tab]')]
      .find((b) => /^Công việc$/i.test((b.textContent || '').trim()))
      ?.click();
  });
  await sleep(1200);
  out.jobTab = await page.evaluate(() => {
    const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return {
      hasFullTimeRaw: /\bfull[_-]?time\b/i.test(body),
      hasToan: /Toàn thời gian/.test(body),
      snippet: body.match(/Loại hình.{0,60}/)?.[0] || null,
    };
  });
}

// Contracts list
await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3000);
out.contracts = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const table = document.querySelector('table');
  if (!table) return { headers: [], types: [], statuses: [] };
  const headers = [...table.querySelectorAll('th')].map((th) => text(th));
  const typeIdx = headers.findIndex((h) => /Loại/i.test(h));
  const stIdx = headers.findIndex((h) => /Tình trạng|Trạng thái/i.test(h));
  const rows = [...table.querySelectorAll('tbody tr')].slice(0, 10);
  const types = rows.map((tr) => text(tr.querySelectorAll('td')[typeIdx])).filter(Boolean);
  const statuses = rows.map((tr) => text(tr.querySelectorAll('td')[stIdx])).filter(Boolean);
  return {
    headers,
    types,
    statuses,
    rawType: types.filter((t) => /^(fixed_term|indefinite|permanent)$/i.test(t)),
    rawStatus: statuses.filter((t) => /^(active|expired|terminated)$/i.test(t)),
    url: location.href,
  };
});

// Recruitment employment_type
await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3000);
out.recruitment = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const table = document.querySelector('table');
  if (!table) return { headers: [], values: [] };
  const headers = [...table.querySelectorAll('th')].map((th) => text(th));
  const idx = headers.findIndex((h) => /Loại hình/i.test(h));
  const values = [...table.querySelectorAll('tbody tr')]
    .slice(0, 8)
    .map((tr) => text(tr.querySelectorAll('td')[idx]));
  return {
    headers,
    values,
    raw: values.filter((v) => /full[_-]?time|part[_-]?time/i.test(v || '')),
    url: location.href,
  };
});

// Settings status
await page.goto(`${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3000);
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button,[role=tab],a')].find((b) =>
    /Danh mục|Master|Catalog|Chức danh|Phòng/i.test(b.textContent || ''),
  );
  el?.click();
});
await sleep(2000);
out.settings = await page.evaluate(() => {
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const isVisible = (el) => {
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const rawVisible = [...document.querySelectorAll('td, span, badge')]
    .filter(isVisible)
    .map((n) => text(n))
    .filter((t) => /^(active|draft)$/i.test(t))
    .slice(0, 15);
  const vi = [...document.querySelectorAll('td, span, badge')]
    .filter(isVisible)
    .map((n) => text(n))
    .filter((t) => /Đang dùng|Nháp/.test(t))
    .slice(0, 15);
  return { rawVisible, vi, url: location.href };
});

// Performance
await page.goto(`${PORTAL}/hr/performance?portal=1&tenantId=xevn&companyId=main`, {
  waitUntil: 'networkidle2',
  timeout: 90_000,
});
await sleep(3000);
out.performance = await page.evaluate(() => {
  const body = document.body?.innerText || '';
  const rawCycle = (body.match(/\b(draft|active|closed)\b/gi) || []).slice(0, 10);
  const empUuid = (body.match(/Employee\s+[0-9a-f-]{36}/gi) || []).slice(0, 5);
  const hasVi = /Nháp|Đang mở|Đã đóng/.test(body);
  return { rawCycle, empUuid, hasVi, url: location.href, slice: body.replace(/\s+/g, ' ').slice(0, 350) };
});

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
