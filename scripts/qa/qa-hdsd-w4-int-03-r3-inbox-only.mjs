/** Inbox-only supplement for QA-HDSD-W4-INT-03-R3 */
import puppeteer from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const LEAVE_ID = process.env.QA_LEAVE_ID || 'c3633bbb-07a5-4916-9d8f-8388514e2eb9';
const MARKER = process.env.QA_MARKER || 'QA-INT03-R3-MS7NKP5Z';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-hdsd-w4-int-03-r3-inbox-runtime.json');
const SHOT = join(resolve(__dir, '../../docs/qa/evidence/screens/hdsd-uat-w4-int03-r3-20260730'), '05-inbox-retest.png');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lr = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lj = await lr.json();
const d = lj.data || lj;
const token = d.access_token || d.accessToken;
const session = { token, expiresAt: Date.now() + 8e6, user: d.user || { email: 'ceo@xe.vn' }, raw: d };

const net = [];
const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.on('response', (res) => {
  const u = res.url();
  if (/workflow-engine\/tasks/.test(u)) {
    net.push({
      url: u.replace(/^https?:\/\/[^/]+/, ''),
      status: res.status(),
      method: res.request().method(),
    });
  }
});
await page.evaluateOnNewDocument((s) => {
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', JSON.stringify(s.user));
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', 'main');
  }
}, session);
await page.goto(`${PORTAL}/command-center/inbox?_int03r3inbox=1`, {
  waitUntil: 'networkidle2',
  timeout: 120_000,
});
await sleep(6000);
const ui = await page.evaluate((m) => {
  const text = document.body?.innerText || '';
  return {
    text: text.slice(0, 1200),
    hasLeave: /nghỉ|leave|phép/i.test(text),
    hasMarker: text.includes(m),
    rows: document.querySelectorAll('tbody tr, [data-testid*="inbox"], [class*="Task"]').length,
    title: document.title,
  };
}, MARKER);
mkdirSync(dirname(SHOT), { recursive: true });
await page.screenshot({ path: SHOT, fullPage: false });
await browser.close();

const wf = await fetch(
  `${PORTAL}/api/xbos/workflow-engine/tasks?status=pending&pageSize=50&assigneeUserId=ceo@xe.vn`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  },
);
const wj = await wf.json();
const tasks = wj.data?.items || wj.data?.tasks || wj.data || [];
const arr = Array.isArray(tasks) ? tasks : [];
const hit = arr.find((t) => String(t.business_id || t.businessId || '') === LEAVE_ID) || null;

const result = {
  net,
  wfNet200: net.some((n) => n.status === 200),
  wfApi: wf.status,
  hit: hit ? { id: hit.id, business_id: hit.business_id || hit.businessId, instance_id: hit.instance_id } : null,
  ui,
  screenshot: SHOT,
};
writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(result.wfNet200 && wf.status === 200 && (ui.hasLeave || ui.rows > 0 || hit) ? 0 : 2);
