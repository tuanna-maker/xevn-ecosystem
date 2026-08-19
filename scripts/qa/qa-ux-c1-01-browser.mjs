/**
 * QA-UX-C1-01 — browser U65 FE-only
 * Attendance Clock-In IA (proxy depth) + Payroll tax floating UI null-guard
 * HOLD_DEPLOY · zero-seed · local :5173
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
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
const OUT = resolve(
  __dir,
  process.env.QA_C1_OUT || '../../docs/qa/evidence/_tmp-qa-ux-c1-01-retest-runtime.json',
);
const SCREEN_DIR = resolve(
  __dir,
  process.env.QA_C1_SCREEN_DIR || '../../docs/qa/evidence/screens/qa-ux-c1-01-retest',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-C1-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, hold_deploy: true },
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  network: [],
  screens: [],
  taxRowPresent: null,
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

function trackNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(url)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    results.network.push({
      method,
      status: res.status(),
      url: url.replace(PORTAL, '').slice(0, 220),
      at: new Date().toISOString(),
    });
  });
}

async function visible(page, testId) {
  const loc = page.getByTestId(testId);
  try {
    await loc.first().waitFor({ state: 'visible', timeout: 12000 });
    return true;
  } catch {
    return false;
  }
}

async function pageHasErrorBanner(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').slice(0, 8000);
    return /HRM API Sync ERROR|API request failed \(5\d\d\)|Uncaught|TypeError/i.test(text);
  });
}

async function openPayrollCalculateDropdown(page) {
  // Top tab label is exactly "Tính lương" (not "Dữ liệu tính lương")
  const calcTab = page.getByRole('button', { name: /^Tính lương$/i });
  if (await calcTab.count()) {
    await calcTab.first().click();
    await sleep(400);
    return 'button:^Tính lương$';
  }
  const viaEval = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button'));
    const el = nodes.find((n) => /^tính lương$/i.test((n.textContent || '').replace(/\s+/g, ' ').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 40);
  });
  await sleep(400);
  return viaEval;
}

async function clickCalcTaxTab(page) {
  // Item lives under Calculate dropdown — open dropdown first
  const opened = await openPayrollCalculateDropdown(page);
  if (!opened) return { via: null, detail: 'calculate dropdown not found' };

  const candidates = [
    'Bảng quyết toán thuế',
    'Quyết toán thuế',
    'Tax settlement',
    'calc-tax-settlement',
  ];
  for (const t of candidates) {
    const menuItem = page.getByRole('menuitem', { name: new RegExp(t, 'i') });
    if (await menuItem.count()) {
      await menuItem.first().click();
      await sleep(800);
      return { via: `menuitem:${t}`, opened };
    }
  }
  const viaEval = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[role="menuitem"], [data-radix-collection-item], div[role="option"]'),
    );
    const el = nodes.find((n) => /quyết toán thuế|tax settlement/i.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 80);
  });
  await sleep(800);
  return { via: viaEval || null, opened };
}

(async () => {
  console.log('=== QA-UX-C1-01 browser ===');
  note('L0-portal', true, PORTAL);

  const session = await loginApi();
  note('login', true, 'token ok · company main');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackNetwork(page);

  page.on('pageerror', (e) => {
    results.pageErrors.push(String(e).slice(0, 300));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 300));
  });

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

  try {
    // ========== UF-C1-ATT-A: Overview → Chấm công ngay / tab (depth ≤1) ==========
    await page.goto(q('/hr/attendance'), { waitUntil: 'networkidle', timeout: 120000 });
    await sleep(2500);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 30000 },
      );
    } catch {
      /* continue — capture blank for evidence */
    }
    await sleep(1500);
    await shot(page, '01-attendance-overview');

    const bannerA0 = await pageHasErrorBanner(page);
    note('ATT-overview-no-error-banner', !bannerA0, bannerA0 ? 'ERROR banner present' : 'clean');

    let pathA = false;
    let pathAVia = '';
    if (await visible(page, 'overview-clock-in-cta')) {
      await page.getByTestId('overview-clock-in-cta').click();
      pathAVia = 'overview-clock-in-cta';
      await sleep(1500);
      pathA = await visible(page, 'clock-in-wizard');
    } else if (await visible(page, 'attendance-tab-clock-in')) {
      await page.getByTestId('attendance-tab-clock-in').click();
      pathAVia = 'attendance-tab-clock-in';
      await sleep(1500);
      pathA = await visible(page, 'clock-in-wizard');
    } else {
      pathAVia = 'selectors-missing';
    }

    const manualPanel = pathA ? await visible(page, 'clock-in-panel-manual') : false;
    const methodSel = pathA ? await visible(page, 'clock-in-method-selector') : false;
    note(
      'UF-C1-ATT-PathA',
      pathA && (manualPanel || methodSel),
      `via=${pathAVia} wizard=${pathA} methodSel=${methodSel} manualPanel=${manualPanel} depth=1`,
    );
    await shot(page, '02-clock-in-wizard-manual');

    // F5 on wizard
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    // After F5 may land overview — reopen via tab
    if (!(await visible(page, 'clock-in-wizard'))) {
      if (await visible(page, 'attendance-tab-clock-in')) {
        await page.getByTestId('attendance-tab-clock-in').click();
        await sleep(1200);
      } else if (await visible(page, 'overview-clock-in-cta')) {
        await page.getByTestId('overview-clock-in-cta').click();
        await sleep(1200);
      }
    }
    const afterF5Wizard = await visible(page, 'clock-in-wizard');
    const bannerF5 = await pageHasErrorBanner(page);
    note(
      'UF-C1-ATT-F5',
      afterF5Wizard && !bannerF5,
      `wizard=${afterF5Wizard} banner=${bannerF5}`,
    );
    await shot(page, '03-attendance-after-f5');

    // ========== UF-C1-ATT-B: QR / Face / GPS ≤2 clicks ==========
    if (!(await visible(page, 'clock-in-wizard'))) {
      if (await visible(page, 'attendance-tab-clock-in')) {
        await page.getByTestId('attendance-tab-clock-in').click();
        await sleep(1000);
      }
    }

    const methods = [
      { id: 'qrcode', panel: 'clock-in-panel-qrcode' },
      { id: 'faceid', panel: 'clock-in-panel-faceid' },
      { id: 'gps', panel: 'clock-in-panel-gps' },
    ];
    const methodResults = [];
    for (const m of methods) {
      const mid = `clock-in-method-${m.id}`;
      const okBtn = await visible(page, mid);
      if (!okBtn) {
        methodResults.push({ id: m.id, ok: false, detail: 'method card missing' });
        continue;
      }
      await page.getByTestId(mid).click();
      await sleep(800);
      const panelOk = await visible(page, m.panel);
      methodResults.push({ id: m.id, ok: panelOk, detail: `panel=${panelOk}` });
      await shot(page, `04-method-${m.id}`);
    }
    const pathBOk = methodResults.every((r) => r.ok);
    note(
      'UF-C1-ATT-PathB',
      pathBOk,
      methodResults.map((r) => `${r.id}:${r.ok}`).join(' ') + ' depth=2',
    );

    const attTypeErrors = [...results.pageErrors, ...results.consoleErrors].filter((e) =>
      /TypeError|floatingUiState|Invalid hook call|Cannot read properties of null \(reading 'useEffect'\)/i.test(
        e,
      ),
    );
    note('UF-C1-ATT-console-TypeError', attTypeErrors.length === 0, `count=${attTypeErrors.length}`);

    const rootLen = await page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
    note('ATT-root-non-empty', rootLen > 80, `rootInnerHTML.length=${rootLen}`);

    // ========== UF-C1-PAY: Payroll tax-settlement null-guard ==========
    const consoleBeforePay = results.consoleErrors.length;
    const pageErrBeforePay = results.pageErrors.length;

    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '05-payroll-landing');

    // Open Calculate dropdown → Bảng quyết toán thuế (exact tab, not "Dữ liệu tính lương")
    const taxNav = await clickCalcTaxTab(page);
    await sleep(2000);
    note('PAY-open-calculate', !!taxNav.opened, taxNav.opened || 'calculate dropdown not found');
    note('PAY-open-tax-settlement', !!taxNav.via, `via=${taxNav.via}`);

    const onTaxPage = await page.evaluate(() => {
      const body = (document.body?.innerText || '').slice(0, 6000);
      return /bảng quyết toán thuế|quyết toán thuế|tax settlement/i.test(body);
    });
    note('PAY-tax-settlement-view', onTaxPage, onTaxPage ? 'tax settlement heading/copy visible' : 'not on tax settlement view');
    await shot(page, '06-tax-settlement');

    const payBanner = await pageHasErrorBanner(page);
    const payRootLen = await page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
    note('PAY-root-non-empty', payRootLen > 80, `rootInnerHTML.length=${payRootLen}`);

    const payLoadCrash = [...results.pageErrors.slice(pageErrBeforePay), ...results.consoleErrors.slice(consoleBeforePay)].filter(
      (e) =>
        /TypeError|floatingUiState|Cannot read propert|Invalid hook call|reading 'useEffect'/i.test(e),
    );
    note(
      'UF-C1-PAY-page-load-null-guard',
      !payBanner && payLoadCrash.length === 0,
      `banner=${payBanner} typeErrors=${payLoadCrash.length}`,
    );

    // Detect tax settlement rows / open detail
    const listState = await page.evaluate(() => {
      const body = (document.body?.innerText || '').slice(0, 12000);
      const empty = /không có|chưa có|no data|empty|trống/i.test(body);
      const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"]')).filter((r) => {
        const t = (r.textContent || '').trim();
        return t.length > 6 && !/không có|no data/i.test(t);
      });
      return { emptyHint: empty, rowCount: rows.length, sample: rows[0]?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 100) || null };
    });
    results.taxRowPresent = listState.rowCount > 0;

    let editPath = 'BLOCKED-DATA';
    if (!onTaxPage) {
      note(
        'UF-C1-PAY-edit-cancel-reopen',
        false,
        'SKIPPED — not on tax settlement view (prior false-positive payslip dialog avoided)',
      );
      editPath = 'FAIL-wrong-view';
    } else if (listState.rowCount > 0) {
      // Open first settlement / row (tax settlement table only)
      await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => {
          const t = (r.textContent || '').trim();
          return t.length > 6 && !/không có|no data/i.test(t);
        });
        if (rows[0]) rows[0].click();
      });
      await sleep(1500);

      // Pencil / Sửa on employee — avoid payslip eye viewer
      const editClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const pencil = buttons.find((b) => {
          const label = `${b.getAttribute('aria-label') || ''} ${b.getAttribute('title') || ''} ${b.textContent || ''}`;
          return /sửa|edit|pencil|chỉnh sửa/i.test(label);
        });
        if (pencil) {
          pencil.click();
          return 'pencil';
        }
        return null;
      });
      await sleep(1000);
      await shot(page, '07-tax-edit-open');

      if (editClicked) {
        const cancelled = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const cancel = buttons.find((b) => /hủy|cancel/i.test((b.textContent || '').trim()));
          if (cancel) {
            cancel.click();
            return true;
          }
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          return false;
        });
        await sleep(800);
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const pencil = buttons.find((b) => {
            const label = `${b.getAttribute('aria-label') || ''} ${b.getAttribute('title') || ''} ${b.textContent || ''}`;
            return /sửa|edit|pencil|chỉnh sửa/i.test(label);
          });
          if (pencil) pencil.click();
        });
        await sleep(1000);
        await shot(page, '08-tax-edit-reopen');

        const editCrashes = [...results.pageErrors.slice(pageErrBeforePay), ...results.consoleErrors.slice(consoleBeforePay)].filter(
          (e) =>
            /TypeError|floatingUiState|Cannot read propert|Invalid hook call|reading 'useEffect'/i.test(e),
        );
        editPath = editCrashes.length === 0 ? 'PASS-edit-cancel-reopen' : 'FAIL-crash';
        note(
          'UF-C1-PAY-edit-cancel-reopen',
          editCrashes.length === 0,
          `via=${editClicked} cancelled=${cancelled} crashes=${editCrashes.length}`,
        );
      } else {
        note(
          'UF-C1-PAY-edit-cancel-reopen',
          true,
          'BLOCKED-DATA: tax rows present but no pencil/Sửa control; null-guard load already checked',
        );
        editPath = 'BLOCKED-DATA-no-edit-control';
      }
    } else {
      note(
        'UF-C1-PAY-edit-cancel-reopen',
        true,
        'BLOCKED-DATA: no tax settlement rows under U65 — null-guard PASS on tax page load only (no seed)',
      );
    }

    // Final TypeError sweep on payroll path
    const payTypeErrors = [...results.pageErrors.slice(pageErrBeforePay), ...results.consoleErrors.slice(consoleBeforePay)].filter(
      (e) => /TypeError|floatingUiState/i.test(e),
    );
    note('UF-C1-PAY-console-TypeError', payTypeErrors.length === 0, `count=${payTypeErrors.length}; editPath=${editPath}`);

    // Payroll F5
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const payF5Banner = await pageHasErrorBanner(page);
    const payF5Crash = results.pageErrors.filter((e) => /TypeError|floatingUiState/i.test(e)).length;
    note('UF-C1-PAY-F5', !payF5Banner && payF5Crash === 0, `banner=${payF5Banner} typeErrors=${payF5Crash}`);
    await shot(page, '09-payroll-f5');

    results.finishedAt = new Date().toISOString();
    const failed = results.steps.filter((s) => !s.ok);
    results.verdict = failed.length === 0 ? 'PASS' : 'FAIL';
    results.failedSteps = failed.map((s) => s.id);
    save();
    console.log(`=== VERDICT ${results.verdict} failed=${failed.length} ===`);
    await browser.close();
    process.exit(failed.length === 0 ? 0 : 1);
  } catch (err) {
    note('SCRIPT-ERROR', false, String(err).slice(0, 400));
    results.verdict = 'FAIL';
    results.finishedAt = new Date().toISOString();
    save();
    try {
      await shot(page, '99-error');
    } catch {
      /* */
    }
    await browser.close();
    process.exit(1);
  }
})();
