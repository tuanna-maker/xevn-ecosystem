import puppeteer from 'puppeteer';

const PORTAL = 'http://127.0.0.1:5173';
const XBOS = 'http://127.0.0.1:28002';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const login = await (
  await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  })
).json();
const token = login.data.accessToken;
const user = login.data.user || { userId: 'ceo@xe.vn' };
const emp = 'dbdbece0-6572-401a-b4eb-56781493a75f';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.evaluateOnNewDocument((s) => {
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
    store.setItem('xevn.portal.user', JSON.stringify(s.user));
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
  }
}, { token, user });

await page.goto(
  `${PORTAL}/hr/employees/${emp}?portal=1&tenantId=xevn&companyId=main`,
  { waitUntil: 'networkidle2', timeout: 120000 },
);
await new Promise((r) => setTimeout(r, 2000));

await page.evaluate(() => {
  const n = [...document.querySelectorAll('button, [role=tab]')].find((b) =>
    /công tác|timeline|quá trình/i.test(b.textContent || ''),
  );
  n?.click();
});
await new Promise((r) => setTimeout(r, 1500));
await page.evaluate(() => {
  const n = [...document.querySelectorAll('button')].find((b) =>
    /Thêm/.test((b.textContent || '').trim()),
  );
  n?.click();
});
await new Promise((r) => setTimeout(r, 1000));

const dlg = await page.evaluate(() => {
  const d = document.querySelector('[role=dialog]');
  if (!d) return { has: false, body: (document.body.innerText || '').slice(0, 300) };
  const btns = [...d.querySelectorAll('button')].map((b) => ({
    t: (b.textContent || '').replace(/\s+/g, ' ').trim(),
    dis: b.disabled,
  }));
  const combos = [...d.querySelectorAll('button[role=combobox]')].map((b) =>
    (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
  );
  const labels = [...d.querySelectorAll('label')].map((l) => (l.textContent || '').trim());
  const inputs = [...d.querySelectorAll('input')].map((i) => ({
    ph: i.placeholder,
    v: i.value,
    type: i.type,
  }));
  return { has: true, btns, combos, labels, inputs };
});
console.log(JSON.stringify(dlg, null, 2));

// open position picker and pick CEO
await page.evaluate(() => {
  const d = document.querySelector('[role=dialog]');
  const labels = [...d.querySelectorAll('label')];
  const lab = labels.find((l) => /Vị trí|Chức vụ/.test(l.textContent || ''));
  const wrap = lab?.closest('.space-y-2, div');
  wrap?.querySelector('button[role=combobox]')?.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.keyboard.type('CEO', { delay: 40 });
await new Promise((r) => setTimeout(r, 500));
const picked = await page.evaluate(() => {
  const opts = [...document.querySelectorAll('[cmdk-item], [role=option]')];
  const el = opts.find((o) => (o.textContent || '').includes('CEO')) || opts[0];
  if (!el) return { ok: false, count: opts.length };
  el.click();
  return { ok: true, text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) };
});
console.log('picked', picked);

// fill title
await page.evaluate(() => {
  const d = document.querySelector('[role=dialog]');
  const labels = [...d.querySelectorAll('label')];
  const lab = labels.find((l) => /Tiêu đề/.test(l.textContent || ''));
  const input = lab?.closest('div')?.querySelector('input');
  if (!input) return;
  const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
  proto.set.call(input, 'QA E1A WH dialog probe');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 400));

const after = await page.evaluate(() => {
  const d = document.querySelector('[role=dialog]');
  const btns = [...d.querySelectorAll('button')].map((b) => ({
    t: (b.textContent || '').replace(/\s+/g, ' ').trim(),
    dis: b.disabled,
  }));
  const combos = [...d.querySelectorAll('button[role=combobox]')].map((b) =>
    (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
  );
  return { btns, combos };
});
console.log('after fill', JSON.stringify(after, null, 2));

await browser.close();
