import { chromium } from 'playwright';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const failed = [];
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage();
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/hr\/src\//.test(u)) return;
  if (res.status() >= 400) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 600);
    } catch {
      /* */
    }
    failed.push({ status: res.status(), url: u.replace(PORTAL, ''), body });
  }
});
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('console:', String(msg.text()).slice(0, 300));
});
await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions`, {
  waitUntil: 'domcontentloaded',
  timeout: 90000,
});
await new Promise((r) => setTimeout(r, 8000));
const text = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
console.log('body:', text);
console.log('failed modules:', JSON.stringify(failed, null, 2));
await browser.close();
