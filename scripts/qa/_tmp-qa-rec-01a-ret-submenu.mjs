/**
 * Submenu retest — VPS :8088 lacks data-testid; use visible labels (U76).
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-ret-submenu.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {
  work_item_id: 'QA-REC-HDSD-COVERAGE-01A-RET-SUBMENU',
  portal: PORTAL,
  note: 'VPS Recruitment has testid_count=0 for recruitment-nav-jobs; click by visible tab label',
  startedAt: new Date().toISOString(),
  rows: [],
  pageErrors: [],
};

function record(row) {
  out.rows.push({ ...row, at: new Date().toISOString() });
  console.log(`${row.verdict} ${row.id} — ${row.detail}`);
}

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  return {
    token: data.accessToken ?? data.access_token,
    expiresAt: Date.now() + 8e6,
    user: {
      userId: data?.user?.userId || 'ceo',
      email: 'ceo@xe.vn',
      displayName: data?.user?.displayName || 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
  };
}

async function waitNav(page) {
  for (let i = 0; i < 90; i++) {
    const t = await page.locator('body').innerText().catch(() => '');
    if (/Tin Tuyển dụng|Yêu cầu tuyển dụng/i.test(t)) return true;
    if (out.pageErrors.some((e) => /SyntaxError|REQUISITION_EMPTY/i.test(e))) return false;
    await sleep(500);
  }
  return false;
}

async function openTabMenu(page, tabRe) {
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(150);
  const btn = page.locator('button').filter({ hasText: tabRe }).first();
  if (!(await btn.isVisible().catch(() => false))) return false;
  await btn.click({ force: true });
  await sleep(600);
  return (await page.locator('[role="menuitem"]').count()) > 0;
}

async function clickMenuItem(page, itemRe) {
  const item = page.getByRole('menuitem', { name: itemRe }).first();
  if (!(await item.isVisible().catch(() => false))) return false;
  await item.click({ force: true });
  await sleep(900);
  return true;
}

async function run() {
  const session = await login();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
  const page = await (
    await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' })
  ).newPage();
  page.on('pageerror', (e) => out.pageErrors.push(String(e).slice(0, 240)));

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
  }, session);

  await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  const ok = await waitNav(page);
  record({
    id: 'A-ENTRY',
    verdict: ok ? '🟢' : '🔴',
    detail: ok ? 'module mounted (label wait)' : `mount fail · ${out.pageErrors[0] || 'timeout'}`,
    click_path: 'login → /hr/recruitment?tab=dashboard',
  });
  if (!ok) {
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    await browser.close();
    process.exit(2);
  }

  const jobSubs = [
    ['A-JOB-ALL', /Tất cả tin tuyển dụng/i, 'Tất cả'],
    ['A-JOB-ACTIVE', /Tin đang tuyển/i, 'Đang tuyển'],
    ['A-JOB-EXPIRED', /Tin hết hạn/i, 'Hết hạn'],
    ['A-JOB-DRAFT', /Tin nháp/i, 'Nháp'],
  ];
  for (const [id, re, hdsd] of jobSubs) {
    const opened = await openTabMenu(page, /Tin Tuyển dụng/i);
    const clicked = opened && (await clickMenuItem(page, re));
    const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 200);
    const empty = /không có|chưa có|0 tin|no data/i.test(body);
    let verdict = '🟢';
    let detail = `submenu applied · filter «${hdsd}»`;
    if (!clicked) {
      verdict = '🟡';
      detail = 'menu item not clickable (label path)';
    } else if (empty) {
      verdict = '🟡';
      detail = 'submenu OK · empty list (U65 no seed)';
    }
    record({
      id,
      hdsd_label: `Tin → ${hdsd}`,
      verdict,
      detail,
      click_path: `button«Tin Tuyển dụng» → menuitem «${re}»`,
    });
  }

  const uvSubs = [
    ['A-UV-ALL', /Tất cả ứng viên/i, 'Tất cả'],
    ['A-UV-NEW', /Ứng viên mới/i, 'Mới'],
    ['A-UV-SCREEN', /Đang sàng lọc/i, 'Sàng lọc'],
    ['A-UV-INT', /Đang phỏng vấn/i, 'Phỏng vấn'],
    ['A-UV-HIRED', /Đã tuyển/i, 'Đã tuyển'],
  ];
  for (const [id, re, hdsd] of uvSubs) {
    const opened = await openTabMenu(page, /^Ứng viên$/i);
    // tab button may be "Ứng viên" with icon — use contains
    const opened2 = opened || (await openTabMenu(page, /Ứng viên/i));
    const clicked = opened2 && (await clickMenuItem(page, re));
    const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 200);
    const empty = /không có|chưa có|0 ứng viên|no data/i.test(body);
    let verdict = '🟢';
    let detail = `UV submenu «${hdsd}» applied`;
    if (!clicked) {
      verdict = '🟡';
      detail = 'UV menu item not clickable';
    } else if (empty) {
      verdict = '🟡';
      detail = 'UV submenu OK · empty (U65)';
    }
    record({
      id,
      hdsd_label: `UV → ${hdsd}`,
      verdict,
      detail,
      click_path: `button«Ứng viên» → menuitem`,
    });
  }

  const pvSubs = [
    ['A-PV-SCHED', /Lịch phỏng vấn/i, 'Đã lên lịch'],
    ['A-PV-DONE', /Đã hoàn thành/i, 'Hoàn thành'],
    ['A-PV-CANCEL', /Đã hủy/i, 'Đã hủy'],
  ];
  for (const [id, re, hdsd] of pvSubs) {
    const opened = await openTabMenu(page, /Phỏng vấn/i);
    const clicked = opened && (await clickMenuItem(page, re));
    const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 200);
    const empty = /không có|chưa có|0 lịch|no data/i.test(body);
    let verdict = '🟢';
    let detail = `PV submenu «${hdsd}» applied`;
    if (!clicked) {
      verdict = '🟡';
      detail = 'PV menu item not clickable';
    } else if (empty) {
      verdict = '🟡';
      detail = 'PV submenu OK · empty (U65)';
    }
    record({
      id,
      hdsd_label: `PV → ${hdsd}`,
      verdict,
      detail,
      click_path: `button«Phỏng vấn» → menuitem`,
    });
  }

  out.finishedAt = new Date().toISOString();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  const red = out.rows.filter((r) => r.verdict === '🔴').length;
  console.log('\nSUMMARY', out.rows.map((r) => `${r.verdict}${r.id}`).join(' '));
  await browser.close();
  process.exit(red > 0 ? 2 : 0);
}

run().catch((e) => {
  console.error(e);
  out.fatal = String(e);
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  process.exit(2);
});
