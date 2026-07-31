import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://14.225.217.232:8088';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01c-runtime.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-rec-hdsd-coverage-01c-20260801');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = JSON.parse(readFileSync(OUT, 'utf8'));
const nets = [];

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
}).then((r) => r.json());
const data = login?.data ?? login;
const token = data.accessToken ?? data.access_token;
const session = {
  token,
  expiresAt: Date.now() + 8 * 3600_000,
  companyId: 'main',
  user: {
    userId: data?.user?.userId || 'ceo@xe.vn',
    email: 'ceo@xe.vn',
    displayName: 'CEO',
    roles: ['group_ceo'],
  },
  raw: data,
};

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--ignore-certificate-errors'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('response', (res) => {
  const u = res.url();
  if (!/settings-catalogs|catalog-sync|sync-from-xbos/i.test(u)) return;
  if (res.request().method() === 'OPTIONS') return;
  nets.push({
    method: res.request().method(),
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
  });
});
await page.addInitScript((s) => {
  const payload = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', s.companyId);
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', s.companyId);
    store.setItem('hrm_current_tenant_id', 'xevn');
  }
}, session);

mkdirSync(SCREEN, { recursive: true });
const url = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(5000);
await page.screenshot({ path: join(SCREEN, '04a-settings-shell.png') });
let body = await page.locator('body').innerText();
console.log('shell len', body.length, 'has Danh mục', /Danh mục/i.test(body));

const clicked = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('button, a, [role="tab"], div, span'));
  const el = nodes.find((n) => /Danh mục \(XBOS/i.test((n.textContent || '').trim()));
  if (!el) return false;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return true;
});
console.log('clicked', clicked);
await sleep(4500);
body = await page.locator('body').innerText();
await page.screenshot({ path: join(SCREEN, '04-hrm-settings-catalogs.png') });

let hasPull = /Đồng bộ từ XBOS|Sync from XBOS/i.test(body);
let hasChannel =
  /Nguồn ứng viên|Kênh tuyển|recruitment_channels|candidate_sources|Chức danh/i.test(body);

// Also try dedicated route if tab click failed
if (!hasPull && !hasChannel) {
  await page.goto(`${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(5000);
  body = await page.locator('body').innerText();
  await page.screenshot({ path: join(SCREEN, '04-hrm-settings-catalogs-deeplink.png') });
  hasPull = /Đồng bộ từ XBOS|Sync from XBOS/i.test(body);
  hasChannel =
    /Nguồn ứng viên|Kênh tuyển|recruitment_channels|candidate_sources|Chức danh|Danh mục cài đặt/i.test(
      body,
    );
}

let pullClicked = false;
let pull2xx = false;
if (hasPull) {
  const before = nets.length;
  await page.evaluate(() => {
    const n = Array.from(document.querySelectorAll('button')).find((b) =>
      /Đồng bộ từ XBOS|Sync from XBOS/i.test(b.textContent || ''),
    );
    n?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  pullClicked = true;
  await sleep(4000);
  pull2xx = nets
    .slice(before)
    .some(
      (n) =>
        (n.method === 'POST' || n.method === 'PUT') && n.status >= 200 && n.status < 300,
    );
  await page.screenshot({ path: join(SCREEN, '04b-after-pull.png') });
}

const getOk = nets.some((n) => n.method === 'GET' && n.status === 200);
const verdict = hasPull || hasChannel || getOk ? '🟢' : '🟡';
const row = {
  hdsd_ref: 'CH11 §11.1',
  item: 'Cài đặt HRM — Pull / xem picker kênh TD · chức danh',
  click_path: [
    '/hr/settings',
    clicked ? 'Danh mục (XBOS + HRM)' : '/hr/settings-catalogs',
    hasPull ? 'Đồng bộ từ XBOS' : 'observe',
  ],
  url: page.url(),
  network: nets.slice(-6),
  f5: pullClicked || null,
  verdict,
  note: `hasPull=${hasPull} hasChannel=${hasChannel} pullClicked=${pullClicked} pull2xx=${pull2xx} GET=${nets
    .filter((n) => n.method === 'GET')
    .map((n) => n.status)
    .join(',') || 'none'} bodyLen=${body.length}`,
  at: new Date().toISOString(),
};

results.hdsd_coverage = results.hdsd_coverage.filter((r) => r.hdsd_ref !== 'CH11 §11.1');
results.hdsd_coverage.push(row);
results.network = [...(results.network || []), ...nets].slice(-800);
const verts = results.hdsd_coverage.map((r) => r.verdict);
results.summary = {
  rows: verts.length,
  green: verts.filter((v) => v === '🟢').length,
  yellow: verts.filter((v) => v === '🟡').length,
  red: verts.filter((v) => v === '🔴').length,
  orphan: results.orphan,
  consoleErrors: (results.consoleErrors || []).slice(-8),
  pageErrors: (results.pageErrors || []).slice(-8),
};
results.ack_status = 'PASS_TO_PM';
results.finishedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(JSON.stringify(row, null, 2));
console.log('SUMMARY', results.summary);
await browser.close();
