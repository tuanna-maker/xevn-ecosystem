/**
 * Focused probe: leave list Chờ duyệt → Duyệt (FE-visible rows, no seed)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-02-web-approve-probe.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const results = { startedAt: ts(), network: [], clicks: [], screens: [] };

async function main() {
  const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  }).then((r) => r.json());
  const data = login?.data ?? login;
  const token = data.accessToken;
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('response', async (res) => {
    const u = res.url();
    if (!/leave|workflow|approve/i.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    let code;
    try {
      const j = await res.json();
      code = j?.code;
    } catch {
      /* */
    }
    results.network.push({
      at: ts(),
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
      code,
    });
  });
  await page.addInitScript((s) => {
    const payload = JSON.stringify({
      userId: s.user?.userId || s.user?.email,
      email: s.user?.email || 'ceo@xe.vn',
      displayName: s.user?.displayName || 'CEO',
      roles: s.user?.roles || ['group_ceo'],
    });
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      if (s.refreshToken) store.setItem('xevn.portal.refreshToken', s.refreshToken);
      if (s.defaultMembershipId) store.setItem('xevn.portal.membershipId', s.defaultMembershipId);
    }
  }, data);

  const att = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(att, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép/i }).first().click();
  await sleep(3000);
  results.clicks.push({ at: ts(), action: 'TAB_LEAVE' });

  const pendingTab = page.locator('[role="tab"], button').filter({ hasText: /Chờ duyệt/i });
  if (await pendingTab.count()) {
    await pendingTab.first().click();
    await sleep(2000);
    results.clicks.push({ at: ts(), action: 'TAB_PENDING' });
  }
  mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: join(SCREEN_DIR, '11-pending-list.png') });

  const duyButtons = page.locator('button').filter({ hasText: /^Duyệt$/i });
  const count = await duyButtons.count();
  results.approveButtons = count;
  results.clicks.push({ at: ts(), action: 'COUNT_DUYET', count });

  if (count > 0) {
    const before = results.network.length;
    await duyButtons.first().click();
    await sleep(1500);
    results.clicks.push({ at: ts(), action: 'CLICK_DUYET' });
    const confirm = page.locator('button').filter({ hasText: /Xác nhận|Duyệt|Confirm|OK/i });
    if (await confirm.count()) {
      await confirm.last().click();
      await sleep(2000);
      results.clicks.push({ at: ts(), action: 'CONFIRM' });
    }
    await page.screenshot({ path: join(SCREEN_DIR, '12-after-approve.png') });
    results.approvePosts = results.network.slice(before);
  } else {
    // detail modal path
    const row = page.locator('table tbody tr').first();
    if (await row.count()) {
      await row.click();
      await sleep(1500);
      results.clicks.push({ at: ts(), action: 'ROW_CLICK' });
      await page.screenshot({ path: join(SCREEN_DIR, '11b-detail.png') });
      const duy2 = page.locator('[role="dialog"] button, button').filter({ hasText: /^Duyệt$/i });
      results.detailDuyet = await duy2.count();
      if ((await duy2.count()) > 0) {
        const before = results.network.length;
        await duy2.first().click();
        await sleep(2000);
        results.clicks.push({ at: ts(), action: 'DETAIL_DUYET' });
        await page.screenshot({ path: join(SCREEN_DIR, '12-after-approve.png') });
        results.approvePosts = results.network.slice(before);
      }
    }
  }

  const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800));
  results.bodySnippet = body;
  results.endedAt = ts();
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ approveButtons: results.approveButtons, detailDuyet: results.detailDuyet, posts: results.approvePosts, clicks: results.clicks.length }, null, 2));
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
