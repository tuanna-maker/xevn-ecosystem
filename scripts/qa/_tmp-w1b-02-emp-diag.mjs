import { chromium } from 'playwright';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:8080';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

for (const u of [
  `${PORTAL}/hr/src/App.tsx`,
  `${HRM}/src/App.tsx`,
  `${HRM}/hr/src/App.tsx`,
]) {
  try {
    const r = await fetch(u);
    console.log('ASSET', r.status, u, (await r.text()).slice(0, 100).replace(/\s+/g, ' '));
  } catch (e) {
    console.log('ASSET ERR', u, String(e).slice(0, 80));
  }
}

const login = await (
  await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  })
).json();
const token = login.data.accessToken;

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const nets = [];
page.on('response', (res) => {
  const u = res.url();
  if (res.status() >= 400 || u.includes('/api/hrm/employees')) {
    nets.push({
      status: res.status(),
      method: res.request().method(),
      url: u.slice(0, 220),
    });
  }
});
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 250)));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CON', m.text().slice(0, 220));
});

await page.addInitScript((s) => {
  const payload = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', 'main');
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, {
  token,
  expiresAt: Date.now() + 8 * 3600e3,
  user: {
    userId: 'ceo@xe.vn',
    email: 'ceo@xe.vn',
    displayName: 'CEO',
    roles: ['group_ceo'],
  },
});

for (const url of [
  `${HRM}/hr/employees?portal=1&tenantId=xevn&companyId=main`,
  `${PORTAL}/command-center/hrm?portal=1`,
]) {
  console.log('TRY', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) =>
    console.log('goto', e.message),
  );
  await page.waitForTimeout(4500);
  const text = await page.evaluate(() => ({
    url: location.href,
    text: (document.body?.innerText || '').slice(0, 500),
    rootKids: document.getElementById('root')?.childElementCount ?? -1,
  }));
  console.log(JSON.stringify(text, null, 2));
}

console.log('NETS', JSON.stringify(nets.slice(0, 50), null, 2));
await browser.close();
