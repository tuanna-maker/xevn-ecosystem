import { chromium } from 'playwright';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--ignore-certificate-errors'],
});
const page = await (await browser.newContext()).newPage();
await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
await page
  .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
  .first()
  .fill('ceo@xe.vn');
await page.locator('input[type="password"]').first().fill('Xevn@2026');
await page.getByRole('button', { name: /Đăng nhập|Login/i }).first().click();
await page.waitForURL(/command-center/, { timeout: 45000 }).catch(() => {});
await sleep(1500);
await page.goto(`${PORTAL}/command-center?settings=log_catalog_clone_bundle`, {
  waitUntil: 'domcontentloaded',
});
await sleep(2500);
const items = await page.locator('[data-testid^="clone-bundle-dest-"]').evaluateAll((els) =>
  els.map((e) => ({
    testid: e.getAttribute('data-testid'),
    text: e.innerText.replace(/\s+/g, ' ').slice(0, 220),
  })),
);
console.log(JSON.stringify(items, null, 2));
await browser.close();
