/**
 * QA-UX-EMPTY-STATE-01 — browser U65 FE-only
 * UX-10 EmptyState moods: Dashboard empty zones + Contracts empty/error
 * must_keep: Clock-In C1 · Payroll taxSettlement · Profile C2 · Advance UX-06
 * HOLD_DEPLOY · zero-seed · local :5173
 * Network fulfill/abort = FE empty/error path only (not DB seed)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-ux-empty-state-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-ux-empty-state-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-EMPTY-STATE-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, hold_deploy: true },
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
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
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path);
  return path;
}

function trackConsole(page) {
  page.on('pageerror', (e) => results.pageErrors.push(String(e).slice(0, 400)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 400));
  });
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function rootLen(page) {
  return page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
}

async function emptyProbe(page, testId) {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) return { present: false };
    const cta = document.querySelector(`[data-testid="${id}-cta"]`);
    return {
      present: true,
      mood: el.getAttribute('data-mood') || '',
      title: (el.querySelector('p.text-sm.font-semibold')?.textContent || '').trim().slice(0, 80),
      ctaText: (cta?.textContent || '').trim().slice(0, 60),
      ctaPresent: !!cta,
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    };
  }, testId);
}

function assertSourceWiring() {
  const dash = readFileSync(resolve(ROOT, 'apps/web/hrm/src/pages/Dashboard.tsx'), 'utf8');
  const contracts = readFileSync(resolve(ROOT, 'apps/web/hrm/src/pages/Contracts.tsx'), 'utf8');
  const sot = readFileSync(resolve(ROOT, 'apps/web/hrm/src/components/hrm/EmptyState.tsx'), 'utf8');
  const ok =
    /dashboard-payroll-chart-empty/.test(dash) &&
    /dashboard-dept-salary-empty/.test(dash) &&
    /dashboard-newest-employees-empty/.test(dash) &&
    /contracts-list-empty/.test(contracts) &&
    /contracts-list-empty-error/.test(contracts) &&
    /data-testid=\{testId\}/.test(sot) &&
    /data-mood=\{mood\}/.test(sot);
  note(
    'UF-ES-source-wiring',
    ok,
    JSON.stringify({
      payroll: /dashboard-payroll-chart-empty/.test(dash),
      dept: /dashboard-dept-salary-empty/.test(dash),
      newest: /dashboard-newest-employees-empty/.test(dash),
      contractsEmpty: /contracts-list-empty/.test(contracts),
      contractsError: /contracts-list-empty-error/.test(contracts),
      sotMood: /data-mood=\{mood\}/.test(sot),
    }),
  );
  return ok;
}

async function clickTabButton(page, nameRe) {
  const btn = page.getByRole('button', { name: nameRe });
  if (await btn.count()) {
    await btn.first().click();
    await sleep(700);
    return true;
  }
  return page.evaluate((reSrc) => {
    const re = new RegExp(reSrc, 'i');
    const nodes = Array.from(document.querySelectorAll('button'));
    const el = nodes.find((n) => re.test((n.textContent || '').replace(/\s+/g, ' ').trim()));
    if (!el) return false;
    el.click();
    return true;
  }, nameRe.source);
}

async function openCalcMenuItem(page, itemRe) {
  await clickTabButton(page, /^Tính lương$/i);
  await sleep(400);
  const menuItem = page.getByRole('menuitem', { name: itemRe });
  if (await menuItem.count()) {
    await menuItem.first().click();
    await sleep(1200);
    return 'menuitem';
  }
  const via = await page.evaluate((reSrc) => {
    const re = new RegExp(reSrc, 'i');
    const nodes = Array.from(
      document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'),
    );
    const el = nodes.find((n) => re.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 60);
  }, itemRe.source);
  await sleep(1200);
  return via;
}

function emptySummaryBase() {
  return {
    total: 0,
    active_count: 0,
    archived_count: 0,
    new_hires: { last_30_days: 0, recent: [] },
    by_department: [],
    by_company: [],
    salary_ranges: [],
    payroll: { total: 0, employees_with_salary: 0 },
  };
}

async function installSummaryFulfill(page, body) {
  await page.unroute('**/api/hrm/employees/summary**').catch(() => {});
  await page.route('**/api/hrm/employees/summary**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: body }),
    });
  });
}

async function clearSummaryRoute(page) {
  await page.unroute('**/api/hrm/employees/summary**').catch(() => {});
}

(async () => {
  assertSourceWiring();

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackConsole(page);

  try {
    await injectPortalAuth(page, session);
    await sleep(800);

    // ---------- 1) Dashboard natural + forced empty (UX-10) ----------
    // HRM Vite base `/hr/` — `/hr?…` 404/blank; dashboard Index = `/hr/?…`
    const dashUrl = q('/hr/');
    await page.goto(dashUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 25000 },
      );
    } catch {
      /* continue */
    }
    const natural = {
      payroll: await emptyProbe(page, 'dashboard-payroll-chart-empty'),
      dept: await emptyProbe(page, 'dashboard-dept-salary-empty'),
      newest: await emptyProbe(page, 'dashboard-newest-employees-empty'),
      root: await rootLen(page),
      url: page.url(),
    };
    note(
      'UF-ES-dashboard-natural',
      natural.root > 80,
      `url=${natural.url} root=${natural.root} payroll=${JSON.stringify(natural.payroll)} dept=${JSON.stringify(natural.dept)} newest=${JSON.stringify(natural.newest)}`,
    );
    await shot(page, '01-dashboard-natural');

    // Force empty payroll + newest (FE network only — not DB seed)
    await installSummaryFulfill(page, emptySummaryBase());
    await page.goto(dashUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    const forcedNone = {
      payroll: await emptyProbe(page, 'dashboard-payroll-chart-empty'),
      newest: await emptyProbe(page, 'dashboard-newest-employees-empty'),
      url: page.url(),
      root: await rootLen(page),
    };
    const payrollOk =
      forcedNone.payroll.present &&
      forcedNone.payroll.visible &&
      forcedNone.payroll.mood === 'none' &&
      forcedNone.payroll.ctaPresent &&
      /lương|tính lương|payroll|không hiển thị/i.test(
        `${forcedNone.payroll.ctaText || ''} ${forcedNone.payroll.title || ''}`,
      );
    const newestOk =
      forcedNone.newest.present &&
      forcedNone.newest.visible &&
      forcedNone.newest.mood === 'none' &&
      forcedNone.newest.ctaPresent &&
      /nhân sự|nhân viên|employees|chưa có/i.test(
        `${forcedNone.newest.ctaText || ''} ${forcedNone.newest.title || ''}`,
      );
    note(
      'UF-ES-dashboard-payroll-empty',
      payrollOk,
      `root=${forcedNone.root} url=${forcedNone.url} ${JSON.stringify(forcedNone.payroll)}`,
    );
    note(
      'UF-ES-dashboard-newest-empty',
      newestOk,
      JSON.stringify(forcedNone.newest),
    );
    await shot(page, '02-dashboard-forced-none');

    // Force dept-salary empty: aggregate present but no dept avg_salary > 0
    await installSummaryFulfill(page, {
      ...emptySummaryBase(),
      total: 3,
      active_count: 3,
      payroll: { total: 90_000_000, employees_with_salary: 3 },
      by_department: [
        { department: 'Phòng A', count: 3, avg_salary: 0 },
      ],
      new_hires: { last_30_days: 0, recent: [] },
    });
    await page.goto(dashUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    const deptProbe = await emptyProbe(page, 'dashboard-dept-salary-empty');
    const deptOk =
      deptProbe.present &&
      deptProbe.visible &&
      deptProbe.mood === 'none' &&
      deptProbe.ctaPresent &&
      /lương|tính lương|payroll/i.test(deptProbe.ctaText || '');
    note('UF-ES-dashboard-dept-salary-empty', deptOk, JSON.stringify(deptProbe));
    await shot(page, '03-dashboard-dept-empty');
    await clearSummaryRoute(page);

    // ---------- 2) Contracts filtered empty ----------
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3000);
    const contractsRoot = await rootLen(page);
    note('UF-ES-contracts-mount', contractsRoot > 80, `root=${contractsRoot}`);

    const search = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    let searchFilled = false;
    if (await search.count()) {
      await search.fill('ZZZ_EMPTY_STATE_NO_MATCH_QA_20260728');
      searchFilled = true;
    } else {
      searchFilled = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const el = inputs.find((i) =>
          /tìm|search|hợp đồng|mã|nhân viên/i.test(
            `${i.placeholder || ''} ${i.getAttribute('aria-label') || ''} ${i.name || ''}`,
          ),
        );
        if (!el) return false;
        el.focus();
        el.value = 'ZZZ_EMPTY_STATE_NO_MATCH_QA_20260728';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      });
    }
    await sleep(1200);
    const emptyList = await emptyProbe(page, 'contracts-list-empty');
    const emptyListOk =
      searchFilled &&
      emptyList.present &&
      emptyList.visible &&
      emptyList.mood === 'none' &&
      emptyList.ctaPresent &&
      /xóa bộ lọc|thêm hợp đồng|clear/i.test(emptyList.ctaText || '');
    note(
      'UF-ES-contracts-list-empty',
      emptyListOk,
      `searchFilled=${searchFilled} ${JSON.stringify(emptyList)}`,
    );
    await shot(page, '04-contracts-filtered-empty');

    // ---------- 3) Contracts load-fail error mood ----------
    await page.unroute('**/api/hrm/contracts**').catch(() => {});
    await page.route('**/api/hrm/contracts**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'QA forced contracts list fail' }),
      });
    });
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    const errProbe = await emptyProbe(page, 'contracts-list-empty-error');
    const errOk =
      errProbe.present &&
      errProbe.visible &&
      errProbe.mood === 'error' &&
      errProbe.ctaPresent &&
      /thử lại|retry/i.test(errProbe.ctaText || '');
    note('UF-ES-contracts-list-error', errOk, JSON.stringify(errProbe));
    await shot(page, '05-contracts-load-error');
    await page.unroute('**/api/hrm/contracts**').catch(() => {});

    // ---------- 4) must_keep — Clock-In C1 ----------
    const errBeforeClock = results.pageErrors.length;
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 20000 },
      );
    } catch {
      /* continue */
    }
    if (await page.getByTestId('overview-clock-in-cta').count()) {
      await page.getByTestId('overview-clock-in-cta').click();
      await sleep(1000);
    } else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cta = buttons.find((b) =>
          /chấm công|clock.?in|vào ca/i.test((b.textContent || '').trim()),
        );
        cta?.click();
      });
      await sleep(1000);
    }
    const clockOk =
      (await page.getByTestId('clock-in-wizard').count()) > 0 ||
      (await page.evaluate(() =>
        /chọn phương thức|clock-in|chấm công vào|manual|GPS|QR/i.test(document.body?.innerText || ''),
      ));
    const clockCrash = results.pageErrors
      .slice(errBeforeClock)
      .some((e) => /Invalid hook call|t is not defined|floatingUiState/i.test(e));
    note(
      'UF-ES-mustkeep-clock-in',
      clockOk && !clockCrash,
      `wizardVisible=${clockOk} crash=${clockCrash}`,
    );
    await shot(page, '06-clock-in');

    // ---------- 5) must_keep — Payroll taxSettlement ----------
    const errBeforePay = results.pageErrors.length;
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    const payRoot = await rootLen(page);
    await openCalcMenuItem(page, /quyết toán thuế|tax settlement/i);
    await sleep(1200);
    const taxBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 2500));
    const taxVisible =
      /quyết toán thuế|bảng quyết toán|kỳ quyết toán|tax settlement|không có dữ liệu|chưa có/i.test(
        taxBody,
      );
    const payCrash = results.pageErrors
      .slice(errBeforePay)
      .some((e) => /Invalid hook call|t is not defined|floatingUiState/i.test(e));
    note(
      'UF-ES-mustkeep-payroll-tax',
      payRoot > 80 && taxVisible && !payCrash,
      `root=${payRoot} taxVisible=${taxVisible} crash=${payCrash}`,
    );
    await shot(page, '07-payroll-tax');

    // ---------- 6) must_keep — Advance UX-06 cancel→reopen ----------
    await openCalcMenuItem(page, /Tạm ứng|Advance/i);
    await sleep(1200);
    let advanceReachable = false;
    const addAdvanceBtn = page.getByRole('button', {
      name: /Tạo bảng tạm ứng|Tạo tạm ứng|Thêm bảng tạm ứng|Thêm mới|^Thêm$/i,
    });
    if (await addAdvanceBtn.count()) {
      await addAdvanceBtn.first().click();
      await sleep(700);
      advanceReachable = (await page.locator('[role="dialog"]').count()) > 0;
    }
    if (!advanceReachable) {
      const viaEval = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const el = buttons.find((b) =>
          /tạo bảng tạm ứng|tạo tạm ứng|thêm bảng tạm|thêm mới/i.test(
            (b.textContent || '').replace(/\s+/g, ' '),
          ),
        );
        if (!el) return false;
        el.click();
        return true;
      });
      await sleep(700);
      advanceReachable = viaEval && (await page.locator('[role="dialog"]').count()) > 0;
    }
    if (advanceReachable) {
      const writableInputs = page.locator('[role="dialog"] input:not([readonly])');
      const wCount = await writableInputs.count();
      if (wCount > 0) await writableInputs.first().fill('QA_ES_ADV_STALE');
      if (wCount > 1) await writableInputs.nth(1).fill('2099-99');
      await sleep(200);
      const cancelAdv = page
        .locator('[role="dialog"] button')
        .filter({ hasText: /Hủy|Cancel|Đóng/i });
      if (await cancelAdv.count()) await cancelAdv.first().click();
      else await page.keyboard.press('Escape');
      await sleep(500);
      const advClosed = (await page.locator('[role="dialog"]').count()) === 0;
      if (await addAdvanceBtn.count()) await addAdvanceBtn.first().click();
      else {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const el = buttons.find((b) =>
            /tạo bảng tạm ứng|tạo tạm ứng|thêm bảng tạm|thêm mới/i.test(
              (b.textContent || '').replace(/\s+/g, ' '),
            ),
          );
          el?.click();
        });
      }
      await sleep(700);
      const advReopen = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        if (!dlg) return { open: false };
        const inputs = Array.from(dlg.querySelectorAll('input:not([readonly])')).map(
          (i) => i.value || '',
        );
        return { open: true, inputs: inputs.slice(0, 4) };
      });
      const advEmpty =
        advClosed &&
        advReopen.open &&
        !(advReopen.inputs || []).some((v) => /QA_ES_ADV_STALE|2099-99/i.test(v));
      note(
        'UF-ES-mustkeep-advance-ux06',
        advEmpty,
        `closed=${advClosed} reopen=${JSON.stringify(advReopen)}`,
      );
      await shot(page, '08-advance-reopen');
      await page.keyboard.press('Escape');
    } else {
      note('UF-ES-mustkeep-advance-ux06', false, 'Advance create dialog not reachable');
    }

    // ---------- 7) must_keep — Profile C2 ----------
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3000);
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      for (const row of rows) {
        const t = (row.textContent || '').trim();
        if (!t || /không có|no data|chưa có/i.test(t)) continue;
        const link = row.querySelector('a[href*="/employees/"], button, td');
        (link || row).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return;
      }
    });
    await sleep(2500);
    let profileUrl = page.url();
    if (!/\/employees\/[0-9a-f-]{8,}/i.test(profileUrl)) {
      const r = await fetch(`${PORTAL}/api/hrm/employees?page_size=5&company_id=main`, {
        headers: { Authorization: `Bearer ${session.token}`, Accept: 'application/json' },
      });
      const j = await r.json();
      const rows = j?.data?.data || j?.data?.items || (Array.isArray(j?.data) ? j.data : []) || [];
      const id = rows[0]?.id;
      if (id) {
        await page.goto(q(`/hr/employees/${id}`), { waitUntil: 'domcontentloaded', timeout: 120000 });
        await sleep(2500);
        profileUrl = page.url();
      }
    }
    const profileOk = await page.getByTestId('employee-profile-page').count();
    const groupsOk = await page.getByTestId('profile-tab-groups').count();
    const coreOk =
      (await page.getByTestId('profile-tab-general').count()) > 0 &&
      (await page.getByTestId('profile-tab-salary').count()) > 0;
    note(
      'UF-ES-mustkeep-profile-c2',
      profileOk > 0 && groupsOk > 0 && coreOk,
      `profile=${profileOk} groups=${groupsOk} core=${coreOk} url=${profileUrl.slice(0, 120)}`,
    );
    await shot(page, '09-profile-c2');

    const hardIds = [
      'UF-ES-source-wiring',
      'UF-ES-dashboard-payroll-empty',
      'UF-ES-dashboard-newest-empty',
      'UF-ES-dashboard-dept-salary-empty',
      'UF-ES-contracts-list-empty',
      'UF-ES-contracts-list-error',
      'UF-ES-mustkeep-clock-in',
      'UF-ES-mustkeep-payroll-tax',
      'UF-ES-mustkeep-advance-ux06',
      'UF-ES-mustkeep-profile-c2',
    ];
    const hardFails = results.steps.filter((s) => hardIds.includes(s.id) && !s.ok);
    results.verdict = hardFails.length === 0 ? 'PASS' : 'FAIL';
    results.hardFails = hardFails.map((s) => s.id);
    results.finishedAt = new Date().toISOString();
    save();
    console.log(`=== VERDICT ${results.verdict} hardFails=${JSON.stringify(results.hardFails)} ===`);
  } catch (e) {
    note('fatal', false, String(e).slice(0, 400));
    results.verdict = 'FAIL';
    results.finishedAt = new Date().toISOString();
    save();
  } finally {
    await browser.close();
  }
})();
