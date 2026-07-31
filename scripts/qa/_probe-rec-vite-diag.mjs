import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PORTAL = 'http://14.225.217.232:8088';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const hits = [];
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const page = await browser.newPage();
page.on('response', async (res) => {
  const u = res.url();
  if (!/\/hr\/(src|node_modules)/.test(u) && !/Recruitment|labelMaps|JobReq|employeeCompany|embedWorking|hrmDialog/.test(u))
    return;
  const status = res.status();
  if (status < 400 && !/labelMaps|Recruitment\.tsx|employeeCompany|embedWorking|hrmDialog|JobRequisitions/.test(u))
    return;
  let body = '';
  try {
    body = (await res.text()).slice(0, 400);
  } catch {
    /* */
  }
  hits.push({
    status,
    url: u.replace(PORTAL, '').slice(0, 200),
    head: body.slice(0, 180).replace(/\n/g, ' '),
  });
});
page.on('pageerror', (e) => hits.push({ pageerror: String(e).slice(0, 300) }));
page.on('console', (msg) => {
  if (msg.type() === 'error') hits.push({ console: String(msg.text()).slice(0, 300) });
});

await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions`, {
  waitUntil: 'networkidle',
  timeout: 120000,
}).catch(() => {});
await new Promise((r) => setTimeout(r, 5000));
const text = await page.locator('body').innerText().catch(() => '');
const htmlLen = (await page.content()).length;
writeFileSync(
  'docs/qa/evidence/_tmp-qa-rec-01b-vite-diag.json',
  JSON.stringify({ text: text.slice(0, 400), htmlLen, hits }, null, 2),
);
console.log(JSON.stringify({ text: text.slice(0, 200), htmlLen, hits: hits.slice(0, 40) }, null, 2));
await browser.close();
