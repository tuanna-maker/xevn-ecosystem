import { chromium } from 'playwright';

const PORTAL = 'http://14.225.217.232:8088';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const data = j?.data ?? j;
const token = data.accessToken ?? data.access_token;
const user = {
  userId: data?.user?.userId || 'ceo',
  email: 'ceo@xe.vn',
  displayName: 'CEO',
  roles: ['group_ceo'],
};

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage', '--no-sandbox'],
});
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' })
).newPage();

await page.addInitScript((s) => {
  const p = JSON.stringify(s.user);
  for (const st of [localStorage, sessionStorage]) {
    st.setItem('xevn.portal.accessToken', s.token);
    st.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    st.setItem('xevn.portal.user', p);
    st.setItem('xevn.portal.tenantId', 'xevn');
    st.setItem('xevn.portal.companyId', 'main');
    st.setItem('hrm_portal_mode', '1');
    st.setItem('hrm_current_company_id', 'main');
  }
}, { token, expiresAt: Date.now() + 8e6, user });

page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 200)));
await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`, {
  waitUntil: 'domcontentloaded',
  timeout: 60000,
});
for (let i = 0; i < 60; i++) {
  const t = await page.locator('body').innerText().catch(() => '');
  if (/Dashboard|Yêu cầu|Tin/i.test(t) && !/Something went wrong/i.test(t)) break;
  await sleep(500);
}
const snap0 = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 250);
console.log('snap0', snap0);
await sleep(1500);

const tid = await page.getByTestId('recruitment-nav-jobs').count();
const byText = page.locator('button').filter({ hasText: /Tin Tuyển dụng/i }).first();
console.log(JSON.stringify({ testid_count: tid, text_btn: await byText.count() }));

await byText.click({ force: true });
await sleep(1000);

const dump = await page.evaluate(() => {
  const menus = Array.from(
    document.querySelectorAll('[role="menu"], [data-radix-menu-content], [data-testid="recruitment-jobs-menu"]'),
  ).map((e) => ({
    tag: e.tagName,
    test: e.getAttribute('data-testid'),
    text: (e.textContent || '').slice(0, 160),
    vis: e.getClientRects().length > 0,
  }));
  const items = Array.from(document.querySelectorAll('[role="menuitem"]')).map((e) => ({
    text: (e.textContent || '').trim().slice(0, 80),
    vis: e.getClientRects().length > 0,
    test: e.getAttribute('data-testid'),
  }));
  return { menus, items, bodyHasAll: /Tất cả tin|Tin đang tuyển|Tin nháp/i.test(document.body.innerText) };
});
console.log('after_click', JSON.stringify(dump));

const box = await byText.boundingBox();
if (box) {
  await page.mouse.click(box.x + box.width - 10, box.y + box.height / 2);
  await sleep(1000);
}
const dump2 = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[role="menuitem"]')).map((e) => ({
    text: (e.textContent || '').trim().slice(0, 80),
    vis: e.getClientRects().length > 0,
  })),
);
console.log('after_chevron', JSON.stringify(dump2));

// keyboard open
await byText.focus();
await page.keyboard.press('ArrowDown');
await sleep(800);
const dump3 = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[role="menuitem"]')).map((e) => (e.textContent || '').trim().slice(0, 80)),
);
console.log('after_arrow', JSON.stringify(dump3));

await browser.close();
