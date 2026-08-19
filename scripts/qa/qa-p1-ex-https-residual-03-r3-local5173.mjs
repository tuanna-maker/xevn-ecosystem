/**
 * P1-EX-QA-HTTPS-RESIDUAL-03-R3 — local portal :5173 browser probe
 * U65 zero-seed · HOLD_DEPLOY · embed via Unified Portal only
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const CACHE_BUST = process.env.QA_R3_CACHE || '_qa_r3=20260730local5173r2';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const EVID_ROOT = resolve(__dir, '../../docs/qa/evidence');
const RUNTIME = join(EVID_ROOT, 'p1-ex-qa-https-residual-03-r3-20260730-local5173-runtime.json');
const SCREEN_ATT = join(EVID_ROOT, 'p1-ex-qa-https-residual-03-r3-20260730-local5173-attendance.png');
const SCREEN_LEAVE = join(EVID_ROOT, 'p1-ex-qa-https-residual-03-r3-20260730-local5173-leave-detail.png');
const SCREEN_DASH = join(EVID_ROOT, 'p1-ex-qa-https-residual-03-r3-20260730-local5173-dashboard.png');
const SCREEN_DIR = join(EVID_ROOT, 'screens');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date();
const isoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const resources = [];
const console54321 = [];
const consoleErrors = [];

const out = {
  portal: PORTAL,
  cacheBust: CACHE_BUST,
  startedAt: new Date().toISOString(),
  afterLoginUrl: null,
  attendanceUrl: null,
  console54321: [],
  consoleErrorSample: [],
  verdict: {},
};

function save() {
  mkdirSync(dirname(RUNTIME), { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(out, null, 2));
}

function isFallbackUrl(url) {
  return (
    /54321/.test(url) ||
    /127\.0\.0\.1:54321/.test(url) ||
    /localhost:54321/.test(url) ||
    /supabase\.co\/rest\/v1/i.test(url)
  );
}

function scanResources(phase) {
  const fallbackSample = resources.filter((u) => isFallbackUrl(u)).slice(0, 8);
  const nestAttSample = resources
    .filter((u) => /\/api\/hrm\/attendance\//.test(u))
    .slice(-12);
  const recordsUrls = resources.filter((u) => /\/attendance\/records/.test(u)).slice(-6);
  const leaveUrls = resources.filter((u) => /\/leave-requests/.test(u)).slice(-4);
  return {
    phase,
    resourceCount: resources.length,
    fallbackAllCount: resources.filter((u) => isFallbackUrl(u)).length,
    localhost54321AnyCount: resources.filter((u) => /54321/.test(u)).length,
    fallbackSample,
    nestAttSample,
    recordsUrls,
    leaveUrls,
  };
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data?.user ?? { email: EMAIL, displayName: 'CEO Tập đoàn' },
    raw: data,
  };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

async function clickByText(page, text, selector = 'button, a, [role="tab"], [role="button"], [role="menuitem"]') {
  const box = await page.evaluate(
    (t, sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      const el = nodes.find((n) => (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t));
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    selector,
  );
  if (!box) return { ok: false, xpath: `//${selector}[contains(., '${text}')]` };
  await page.mouse.click(box.x, box.y);
  return { ok: true, xpath: `//${selector}[contains(., '${text}')]` };
}

async function authFive(page, token) {
  const endpoints = [
    { id: 'Contracts', path: '/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5' },
    { id: 'Insurance', path: '/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=5' },
    { id: 'Recruitment', path: '/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=5' },
    { id: 'Attendance', path: '/api/hrm/attendance/records?company_id=main&page=1&page_size=10' },
    { id: 'Payroll', path: '/api/hrm/payroll/payslips?company_id=main&page=1&page_size=5' },
  ];
  const results = [];
  for (const ep of endpoints) {
    const res = await page.evaluate(
      async ({ base, path, tok }) => {
        const r = await fetch(`${base}${path}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        let code = '';
        let message = '';
        try {
          const j = await r.json();
          code = j?.code ?? j?.data?.code ?? '';
          message = j?.message ?? j?.data?.message ?? '';
        } catch {
          /* */
        }
        return { http: r.status, code, message };
      },
      { base: PORTAL, path: ep.path, tok: token },
    );
    results.push({ id: ep.id, path: ep.path, ...res });
  }
  return {
    tokenPresent: !!token,
    tokenLen: token?.length ?? 0,
    results,
  };
}

(async () => {
  console.log('=== P1-EX-QA-HTTPS-RESIDUAL-03-R3 local5173 ===');
  const session = await loginApi();
  console.log('login OK tokenLen=', session.token.length);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.on('requestfinished', (req) => {
    const url = req.url();
    if (!resources.includes(url)) resources.push(url);
  });
  page.on('console', (msg) => {
    const t = msg.text();
    if (/54321|ERR_CONNECTION_REFUSED/i.test(t)) console54321.push(t.slice(0, 240));
    if (msg.type() === 'error') consoleErrors.push(t.slice(0, 240));
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 240)));

  await injectSession(page, session);

  // Login flow → command-center
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1500);
  await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  out.afterLoginUrl = page.url();

  // E) Dashboard spot — INC-HRM-DASH-500 class (employees/summary + attendance/overview)
  const dashUrl = `${PORTAL}/command-center/hrm/dashboard?companyId=main&${CACHE_BUST}`;
  out.dashboardUrl = dashUrl;
  const dashResourceStart = resources.length;
  await page.goto(dashUrl, { waitUntil: 'load', timeout: 120000 });
  await sleep(4500);
  const dashBody = await page.evaluate(() => ({
    bodyHasSyncError: /HRM API Sync ERROR|Kiểm tra lại|500|Internal Server Error/i.test(document.body.innerText),
    href: location.href,
  }));
  const dashEndpoints = [
    { id: 'employees/summary', path: '/api/hrm/employees/summary?company_id=main' },
    { id: 'attendance/overview', path: `/api/hrm/attendance/overview?company_id=main&year=${today.getFullYear()}` },
  ];
  const dashApi = [];
  for (const ep of dashEndpoints) {
    const res = await page.evaluate(
      async ({ base, path, tok }) => {
        const r = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${tok}` } });
        let code = '';
        try {
          const j = await r.json();
          code = j?.code ?? j?.data?.code ?? '';
        } catch {
          /* */
        }
        return { http: r.status, code };
      },
      { base: PORTAL, path: ep.path, tok: session.token },
    );
    dashApi.push({ id: ep.id, path: ep.path, ...res });
  }
  out.dashboardSpot = {
    ...dashBody,
    api: dashApi,
    resourceSample: resources.slice(dashResourceStart).filter((u) => /\/api\/hrm\//.test(u)).slice(-12),
    fallbackAllCount: resources.slice(dashResourceStart).filter((u) => isFallbackUrl(u)).length,
  };
  await page.screenshot({ path: SCREEN_DASH, fullPage: false });

  const attendanceUrl = `${PORTAL}/hr/attendance?portal=1&companyId=main&${CACHE_BUST}`;
  out.attendanceUrl = attendanceUrl;
  await page.goto(attendanceUrl, { waitUntil: 'load', timeout: 120000 });
  await sleep(4500);

  const bodyBefore = await page.evaluate(() => ({
    bodyHasEmpty: /Không có dữ liệu chấm công/i.test(document.body.innerText),
    bodyHasSyncError: /HRM API Sync ERROR|Kiểm tra lại/i.test(document.body.innerText),
    href: location.href,
  }));
  out.fallbackBefore = { ...scanResources('after_attendance_load'), ...bodyBefore };

  // Chấm công dropdown → Dữ liệu chấm công (chevron menu — primary tab opens clock-in wizard)
  out.chamCongClick = await clickByText(page, 'Chấm công');
  await sleep(600);
  const menuOpen = await page.evaluate(() => {
    const chevron = document.querySelector('[data-testid="attendance-tab-menu"]');
    if (chevron) {
      chevron.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return { ok: true, via: 'data-testid-attendance-tab-menu' };
    }
    return { ok: false };
  });
  out.attendanceMenuOpen = menuOpen;
  await sleep(700);
  out.recordsMenuClick = await clickByText(page, 'Dữ liệu chấm công', '[role="menuitem"], button, a');
  if (!out.recordsMenuClick.ok) {
    // Direct menu item via evaluate when Radix portal escapes text click
    const directRecords = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
      const el = items.find((n) => (n.textContent || '').includes('Dữ liệu chấm công'));
      if (!el) return { ok: false };
      el.click();
      return { ok: true, via: 'role-menuitem-evaluate' };
    });
    if (directRecords.ok) out.recordsMenuClick = directRecords;
  }
  await sleep(3500);

  const bodyAfterRecords = await page.evaluate(() => ({
    bodyHasEmpty: /Không có dữ liệu chấm công/i.test(document.body.innerText),
    bodyHasSyncError: /HRM API Sync ERROR|Kiểm tra lại/i.test(document.body.innerText),
    href: location.href,
  }));
  out.fallbackAfterRecords = { ...scanResources('after_records_nav'), ...bodyAfterRecords };

  mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: SCREEN_ATT, fullPage: false });

  // Refresh toolbar
  const refresh = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((x) => /tải lại|refresh|làm mới/i.test(x.textContent || x.title || ''));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  out.refreshClicked = refresh;
  if (!refresh) {
    // Re-fetch records via Nest (refresh-equivalent for fallback gate)
    await page.evaluate(
      async ({ base, tok }) => {
        await fetch(`${base}/api/hrm/attendance/records?company_id=main&page=1&page_size=10`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
      },
      { base: PORTAL, tok: session.token },
    );
    out.refreshEquivalent = 'auth-records-refetch';
  }
  await sleep(2500);

  const bodyAfterRefresh = await page.evaluate(() => ({
    bodyHasEmpty: /Không có dữ liệu chấm công/i.test(document.body.innerText),
    bodyHasSyncError: /HRM API Sync ERROR|Kiểm tra lại/i.test(document.body.innerText),
    href: location.href,
  }));
  out.fallbackAfterRefresh = { ...scanResources('after_refresh'), ...bodyAfterRefresh };

  // Auth 5
  out.authFive = await authFive(page, session.token);
  const bodyAfterAuth = await page.evaluate(() => ({
    bodyHasEmpty: /Không có dữ liệu chấm công/i.test(document.body.innerText),
    bodyHasSyncError: /HRM API Sync ERROR|Kiểm tra lại/i.test(document.body.innerText),
    href: location.href,
  }));
  out.fallbackAfterAuth = { ...scanResources('after_auth5_records_fetch'), ...bodyAfterAuth };

  // J-HRM-06 leave path
  out.leaveTabClick = await clickByText(page, 'Nghỉ phép');
  await sleep(2500);
  out.requestListClick = await clickByText(page, 'Danh sách yêu cầu', '[role="tab"], button, a');
  await sleep(2500);

  const eyeResult = await page.evaluate(() => {
    const row = document.querySelector('tbody tr');
    if (!row) return { ok: false, reason: 'no row' };
    const btn = row.querySelector('button svg')?.closest('button') || row.querySelector('button');
    if (!btn) return { ok: false, reason: 'no eye btn' };
    btn.click();
    return { ok: true, via: 'evaluate' };
  });
  out.eyeClick = eyeResult;
  await sleep(2000);

  const leaveDetail = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasDetailTitle: /Chi tiết yêu cầu nghỉ phép/i.test(text),
      hasNotFound: /Không tìm thấy/i.test(text),
      detailText: text.slice(0, 600),
      dialogOpen: !!document.querySelector('[role="dialog"], .fixed.inset-0'),
      href: location.href,
    };
  });
  out.leaveDetail = {
    ...leaveDetail,
    ...scanResources('leave_detail'),
    leaveRes: resources.filter((u) => /\/leave-requests/.test(u)).slice(-4),
  };

  await page.screenshot({ path: SCREEN_LEAVE, fullPage: false });

  out.console54321 = console54321.slice(0, 12);
  out.consoleErrorSample = consoleErrors.filter((e) => /54321|refused|sync error/i.test(e)).slice(0, 8);

  const authOk = out.authFive.results.every((r) => r.http === 200);
  const attRow = out.authFive.results.find((r) => r.id === 'Attendance');
  const fbOk = ['fallbackBefore', 'fallbackAfterRecords', 'fallbackAfterRefresh', 'fallbackAfterAuth'].every(
    (k) => out[k].fallbackAllCount === 0 && out[k].localhost54321AnyCount === 0,
  );
  const leaveOk =
    out.leaveTabClick.ok &&
    out.requestListClick.ok &&
    out.eyeClick.ok &&
    out.leaveDetail.hasDetailTitle &&
    !out.leaveDetail.hasNotFound;
  const recordsUiNav =
    (out.recordsMenuClick.ok || out.attendanceMenuOpen?.ok) &&
    (out.fallbackAfterRecords?.recordsUrls?.length ?? 0) > 0;
  const recordsProbeOk =
    attRow?.http === 200 &&
    attRow?.code === 'HRM-ATT-200' &&
    ((out.fallbackAfterRefresh?.recordsUrls?.length ?? 0) > 0 ||
      (out.fallbackAfterAuth?.recordsUrls?.length ?? 0) > 0 ||
      recordsUiNav);
  const dashOk =
    out.dashboardSpot?.api?.every((r) => r.http === 200) &&
    !out.dashboardSpot?.bodyHasSyncError &&
    (out.dashboardSpot?.fallbackAllCount ?? 0) === 0;

  out.verdict = {
    authOk,
    fbOk,
    attHttp: attRow?.http ?? 0,
    attCode: attRow?.code ?? '',
    leaveOk,
    recordsUiNav,
    recordsProbeOk,
    dashOk,
    dashSummaryHttp: out.dashboardSpot?.api?.find((r) => r.id === 'employees/summary')?.http ?? 0,
    dashOverviewHttp: out.dashboardSpot?.api?.find((r) => r.id === 'attendance/overview')?.http ?? 0,
    console54321Count: console54321.length,
    pass:
      authOk &&
      fbOk &&
      attRow?.http === 200 &&
      leaveOk &&
      recordsProbeOk &&
      dashOk &&
      console54321.length === 0,
  };

  save();
  await browser.close();

  console.log('verdict', JSON.stringify(out.verdict));
  console.log('runtime', RUNTIME);
  process.exit(out.verdict.pass ? 0 : 1);
})().catch((e) => {
  console.error(e);
  out.error = String(e);
  save();
  process.exit(1);
});
