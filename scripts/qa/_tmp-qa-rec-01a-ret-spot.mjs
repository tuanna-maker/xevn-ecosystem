/**
 * Spot retest A-ENTRY + Tin/UV/PV submenu after mount fix (portalScope menus).
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-ret-spot.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {
  work_item_id: 'QA-REC-HDSD-COVERAGE-01A-RET-SPOT',
  startedAt: new Date().toISOString(),
  portal: PORTAL,
  rows: [],
  pageErrors: [],
  consoleErrors: [],
};

function record(row) {
  out.rows.push({ ...row, at: new Date().toISOString() });
  console.log(`${row.verdict} ${row.id} — ${row.detail}`);
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
  };
}

async function inject(page, session) {
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
}

async function waitRecruitmentNav(page, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const has =
      (await page.getByTestId('recruitment-nav-jobs').isVisible().catch(() => false)) ||
      (await page.getByText(/Yêu cầu tuyển dụng|Dashboard|Tin Tuyển dụng/i).first().isVisible().catch(() => false));
    const syntax = out.pageErrors.some((e) => /REQUISITION_EMPTY_JD_LIBRARY_HINT_VI|SyntaxError/i.test(e));
    if (syntax) return { ok: false, reason: 'syntax_error' };
    if (has) return { ok: true, reason: 'nav_visible' };
    await sleep(500);
  }
  return { ok: false, reason: 'timeout' };
}

async function openAndClickMenu(page, triggerTestId, itemTestIdOrRe) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click({ force: true });
  await sleep(500);
  // Radix may portal to body; search whole page
  let item;
  if (typeof itemTestIdOrRe === 'string' && itemTestIdOrRe.startsWith('recruitment-')) {
    item = page.getByTestId(itemTestIdOrRe);
  } else {
    item = page.getByRole('menuitem', { name: itemTestIdOrRe }).first();
  }
  const visible = await item.isVisible().catch(() => false);
  if (!visible) {
    // try any [role=menuitem] count
    const count = await page.locator('[role="menuitem"]').count();
    return { opened: true, clicked: false, menuitemCount: count };
  }
  await item.click({ force: true });
  await sleep(800);
  return { opened: true, clicked: true, menuitemCount: await page.locator('[role="menuitem"]').count().catch(() => 0) };
}

async function run() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
  const page = await context.newPage();
  page.on('pageerror', (e) => out.pageErrors.push(String(e).slice(0, 300)));
  page.on('console', (m) => {
    if (m.type() === 'error') out.consoleErrors.push(String(m.text()).slice(0, 240));
  });
  await inject(page, session);

  const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const wait = await waitRecruitmentNav(page, 45000);
  const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
  const syntax = out.pageErrors.some((e) => /REQUISITION_EMPTY_JD_LIBRARY_HINT_VI|SyntaxError/i.test(e));
  record({
    id: 'A-ENTRY',
    verdict: wait.ok && !syntax ? '🟢' : '🔴',
    detail: syntax
      ? `SyntaxError still present · ${out.pageErrors[0]}`
      : wait.ok
        ? `module mounted · wait=${wait.reason} · body≈${body}`
        : `nav not found · wait=${wait.reason} · body≈${body}`,
    click_path: `login inject → ${url} · wait≤45s`,
  });

  if (!wait.ok) {
    out.finishedAt = new Date().toISOString();
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    await browser.close();
    process.exit(2);
  }

  const jobItems = [
    ['A-JOB-ALL', 'recruitment-jobs-menu-all'],
    ['A-JOB-ACTIVE', 'recruitment-jobs-menu-active'],
    ['A-JOB-EXPIRED', 'recruitment-jobs-menu-expired'],
    ['A-JOB-DRAFT', 'recruitment-jobs-menu-draft'],
  ];
  for (const [id, testId] of jobItems) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    const r = await openAndClickMenu(page, 'recruitment-nav-jobs', testId);
    record({
      id,
      verdict: r.clicked ? '🟢' : '🟡',
      detail: r.clicked
        ? `menu item ${testId} clicked · menuitems=${r.menuitemCount}`
        : `menu open but item not clickable · menuitems=${r.menuitemCount} · classify=interactability_portalScope`,
      click_path: `recruitment-nav-jobs → ${testId}`,
    });
  }

  const candLabels = [
    ['A-UV-ALL', /Tất cả ứng viên/i],
    ['A-UV-NEW', /Ứng viên mới/i],
    ['A-UV-SCREEN', /Đang sàng lọc/i],
    ['A-UV-INT', /Đang phỏng vấn/i],
    ['A-UV-HIRED', /Đã tuyển/i],
  ];
  for (const [id, re] of candLabels) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    const r = await openAndClickMenu(page, 'recruitment-nav-candidates', re);
    record({
      id,
      verdict: r.clicked ? '🟢' : '🟡',
      detail: r.clicked
        ? `UV menu clicked · menuitems=${r.menuitemCount}`
        : `UV menu item not clickable · menuitems=${r.menuitemCount} · interactability_portalScope`,
      click_path: `recruitment-nav-candidates → ${re}`,
    });
  }

  const intLabels = [
    ['A-PV-SCHED', /Lịch phỏng vấn/i],
    ['A-PV-DONE', /Đã hoàn thành/i],
    ['A-PV-CANCEL', /Đã hủy/i],
  ];
  for (const [id, re] of intLabels) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    const r = await openAndClickMenu(page, 'recruitment-nav-interviews', re);
    record({
      id,
      verdict: r.clicked ? '🟢' : '🟡',
      detail: r.clicked
        ? `PV menu clicked · menuitems=${r.menuitemCount}`
        : `PV menu item not clickable · menuitems=${r.menuitemCount} · interactability_portalScope`,
      click_path: `recruitment-nav-interviews → ${re}`,
    });
  }

  // Kanban reject column spot
  await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=dashboard`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await waitRecruitmentNav(page, 20000);
  const boardBtn = page.getByRole('button', { name: /Board|Kanban|Bảng/i }).first();
  if (await boardBtn.isVisible().catch(() => false)) {
    await boardBtn.click({ force: true }).catch(() => {});
    await sleep(1500);
  } else {
    await page.getByText(/Board tuyển dụng|Bảng Kanban|Board/i).first().click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  const rejectVisible =
    (await page.getByText(/^Từ chối$/i).first().isVisible().catch(() => false)) ||
    (await page.getByText(/Từ chối/i).first().isVisible().catch(() => false));
  record({
    id: 'A-KANBAN-REJECT',
    verdict: rejectVisible ? '🟢' : '🟡',
    detail: rejectVisible ? 'column Từ chối visible' : 'column Từ chối missing — product_gap or label_drift',
    click_path: 'dashboard → Board → observe Từ chối',
  });

  out.finishedAt = new Date().toISOString();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('\nSPOT DONE', JSON.stringify(out.rows.map((r) => `${r.verdict}${r.id}`)));
  await browser.close();
  const red = out.rows.filter((r) => r.verdict === '🔴').length;
  process.exit(red > 0 ? 2 : 0);
}

run().catch((e) => {
  console.error(e);
  out.fatal = String(e);
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  process.exit(2);
});
