import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const STAMP = `QA-W6-SHR-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const net = [];

const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const token = j?.data?.accessToken;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.on('response', async (res) => {
  const u = res.url();
  if (!/shareholder|legal-entit/.test(u)) return;
  const m = res.request().method();
  if (m === 'OPTIONS') return;
  let body = null;
  try {
    if (['POST', 'PUT', 'PATCH'].includes(m)) body = res.request().postData()?.slice(0, 500);
  } catch {
    /* */
  }
  let code = null;
  try {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('json')) {
      const jj = await res.json();
      code = jj?.code || jj?.error?.code || null;
    }
  } catch {
    /* */
  }
  net.push({
    m,
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, ''),
    code,
    body,
  });
});
page.on('console', (msg) => {
  const t = msg.text();
  if (/shr|share|error|fail|scope|XBOS/i.test(t)) console.log('CONSOLE', msg.type(), t.slice(0, 240));
});
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 240)));

await page.evaluateOnNewDocument(
  (s) => {
    for (const st of [localStorage, sessionStorage]) {
      st.setItem('xevn.portal.accessToken', s.token);
      st.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      st.setItem('xevn.portal.user', JSON.stringify(s.user));
    }
  },
  { token, expiresAt: Date.now() + 8 * 3600e3, user: j?.data?.user || {} },
);

await page.goto(`${PORTAL}/command-center?settings=company_member_units`, {
  waitUntil: 'networkidle2',
  timeout: 90000,
});
await sleep(2000);
await page.evaluate(() => {
  const row = [...document.querySelectorAll('table tbody tr')].find((tr) =>
    tr.innerText.includes('TẬP ĐOÀN'),
  );
  const btn = [...row.querySelectorAll('button')].find((b) =>
    /Chỉnh sửa/.test(b.textContent || ''),
  );
  btn.click();
});
await sleep(2500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) =>
    /\+ Thêm cổ đông/.test(x.textContent || ''),
  );
  b?.click();
});
await sleep(500);

const typed = await page.evaluate(() => {
  const tables = [...document.querySelectorAll('table')];
  const shr = tables.find((t) => /Họ tên|Tỷ lệ/.test(t.innerText || ''));
  const last = [...shr.querySelectorAll('tbody tr')].at(-1);
  const inputs = [...last.querySelectorAll('input')];
  return { n: inputs.length, types: inputs.map((i) => i.type) };
});
console.log('inputs', typed);

async function typeInLastRow(colIndex, value) {
  const handle = await page.evaluateHandle((idx) => {
    const tables = [...document.querySelectorAll('table')];
    const shr = tables.find((t) => /Họ tên|Tỷ lệ/.test(t.innerText || ''));
    const last = [...shr.querySelectorAll('tbody tr')].at(-1);
    return [...last.querySelectorAll('input')][idx];
  }, colIndex);
  const el = handle.asElement();
  await el.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.keyboard.type(String(value), { delay: 20 });
}

// inputs: [checkbox, name, identity, ratio(number), contributed]
await typeInLastRow(1, STAMP);
await typeInLastRow(2, '07912345678');
await typeInLastRow(3, '1.25');
await typeInLastRow(4, '2500000');
await sleep(400);

const afterFill = await page.evaluate(() => {
  const tables = [...document.querySelectorAll('table')];
  const shr = tables.find((t) => /Họ tên|Tỷ lệ/.test(t.innerText || ''));
  const last = [...shr.querySelectorAll('tbody tr')].at(-1);
  return [...last.querySelectorAll('input')].map((i) => i.value);
});
console.log('afterFill', afterFill);

await page.evaluate(() => {
  const all = [...document.querySelectorAll('button[aria-label="Lưu cổ đông"]')];
  all.at(-1)?.click();
});
await sleep(5000);

const body = await page.evaluate((stamp) => {
  const t = document.body.innerText;
  return {
    hasStamp: t.includes(stamp),
    toast: /Đã lưu cổ đông|lỗi|error|thất bại|không thể/i.test(t),
    snip: t.slice(0, 900),
  };
}, STAMP);
console.log('body', body);
console.log('net', JSON.stringify(net, null, 2));

mkdirSync('docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens', { recursive: true });
await page.screenshot({
  path: 'docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens/uf05-probe.png',
});

const api = await fetch(
  `${PORTAL}/api/xbos/org-foundation/legal-entities/20109cf3-0621-4921-baf7-f820be944731/shareholders`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
      accept: 'application/json',
    },
  },
);
const aj = await api.json();
const names = (aj?.data?.items || []).map((i) => i.holder_name);
console.log('apiHas', names.includes(STAMP), 'names', names);

writeFileSync(
  'docs/qa/evidence/_tmp-uf05-probe.json',
  JSON.stringify({ STAMP, afterFill, body, net, apiHas: names.includes(STAMP), names }, null, 2),
);
await browser.close();
process.exit(names.includes(STAMP) ? 0 : 1);
