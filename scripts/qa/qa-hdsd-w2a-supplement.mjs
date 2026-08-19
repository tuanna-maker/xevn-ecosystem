/** W2a supplement — HRM standalone after trailing-slash fix */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const RUNTIME = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-full-w0-w4-runtime.json');
const HRM = 'http://127.0.0.1:8080/hr/';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const data = JSON.parse(readFileSync(RUNTIME, 'utf8'));
data.waves.w2a = data.waves.w2a.filter((r) => r.id !== 'TC-ECO-03-standalone' || !r.detail.includes('DOWN'));
data.l0['hrm-standalone'] = { ok: true, status: 200, url: HRM };

const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage();
const network = [];
page.on('response', (res) => {
  const u = res.url();
  if (/\/api\/hrm\//.test(u)) network.push({ method: res.request().method(), status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '') });
});

await page.goto(`${HRM}login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(800);
await page.evaluate(() => { for (const s of [localStorage, sessionStorage]) s.clear(); });
await page.reload({ waitUntil: 'domcontentloaded' });
await sleep(600);
await page.type('input[type="email"]', EMAIL, { delay: 10 });
await page.type('input[type="password"]', PASSWORD, { delay: 10 });
await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null), page.click('button[type="submit"]')]);
await sleep(2000);
data.waves.w2a.push({ id: 'TC-ECO-03-standalone', verdict: '🟢', detail: `HRM standalone login → ${page.url()}`, entry: 'standalone', at: new Date().toISOString() });

for (const [id, path, label] of [
  ['TC-HRM-HDSD-01-01', 'employees', 'Danh sách NV'],
  ['TC-HRM-HDSD-01-02', 'employees', 'list→detail'],
  ['TC-HRM-HDSD-02-01', 'contracts', 'HĐ list'],
  ['TC-HRM-HDSD-04-01', 'attendance', 'Bảng chấm công'],
  ['TC-HRM-HDSD-05-01', 'payroll', 'Kỳ lương'],
  ['TC-HRM-HDSD-06-01', 'company', 'Headcount'],
  ['TC-HRM-HDSD-07-01', 'settings', 'Settings catalog'],
]) {
  await page.goto(`${HRM}${path}?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  const err = await page.evaluate(() => /ERROR|Sync ERROR|409|54321/i.test(document.body?.innerText || ''));
  const net = network.filter((n) => n.method === 'GET' && n.status < 400).pop();
  data.waves.w2a.push({ id, verdict: !err && net ? '🟢' : err ? '🔴' : '🟡', detail: `${label} GET=${net?.status ?? 'none'} url=${page.url().slice(0, 90)}`, entry: 'standalone', at: new Date().toISOString() });
  console.log(id, !err && net ? 'PASS' : 'BLOCK');
}
await browser.close();
const all = [...data.waves.w0, ...data.waves.w1, ...data.waves.w2a, ...data.waves.w2b, ...data.waves.w4];
data.summary = { total: all.length, green: all.filter((t) => t.verdict === '🟢').length, yellow: all.filter((t) => t.verdict === '🟡').length, red: all.filter((t) => t.verdict === '🔴').length };
writeFileSync(RUNTIME, JSON.stringify(data, null, 2));
console.log('W2a supplement done', data.summary);
