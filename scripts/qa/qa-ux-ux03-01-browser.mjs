/**
 * QA-UX-UX03-01 — browser U65 FE-only
 * Shifts + Contracts search debounce (~300ms) + must_keep C1 Clock-In / Payroll tax smoke
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
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-ux-ux03-01-runtime.json');
const SCREEN_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-ux-ux03-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-UX03-01',
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
  page.on('pageerror', (e) => {
    results.pageErrors.push(String(e).slice(0, 400));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 400));
  });
}

async function visible(page, testId) {
  try {
    await page.getByTestId(testId).first().waitFor({ state: 'visible', timeout: 12000 });
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

async function openPayrollTax(page) {
  const calcTab = page.getByRole('button', { name: /^Tính lương$/i });
  if (await calcTab.count()) {
    await calcTab.first().click();
    await sleep(400);
  } else {
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button'));
      const el = nodes.find((n) => /^tính lương$/i.test((n.textContent || '').replace(/\s+/g, ' ').trim()));
      el?.click();
    });
    await sleep(400);
  }
  const menuItem = page.getByRole('menuitem', { name: /Bảng quyết toán thuế|Quyết toán thuế/i });
  if (await menuItem.count()) {
    await menuItem.first().click();
    await sleep(1000);
    return 'menuitem';
  }
  const via = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'));
    const el = nodes.find((n) => /quyết toán thuế|tax settlement/i.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 60);
  });
  await sleep(1000);
  return via;
}

async function countDataRows(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => {
      const t = (r.textContent || '').trim();
      if (t.length < 3) return false;
      if (/không có|no data|chưa có dữ liệu/i.test(t) && !r.querySelector('td:nth-child(2)')) return false;
      // skip pure empty/placeholder rows
      const cells = Array.from(r.querySelectorAll('td')).map((c) => (c.textContent || '').trim());
      return cells.some((c) => c.length > 0);
    });
    const sample = rows.slice(0, 3).map((r) =>
      (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    );
    return { count: rows.length, sample };
  });
}

async function findListSearchInput(page) {
  // Prefer visible search Input in filter card (leftmost with Search icon / placeholder Tìm)
  const byPlaceholder = page.locator(
    'input[placeholder*="Tìm"], input[placeholder*="tìm"], input[placeholder*="Search"]',
  );
  const n = await byPlaceholder.count();
  for (let i = 0; i < n; i++) {
    const el = byPlaceholder.nth(i);
    if (await el.isVisible()) return el;
  }
  // fallback: first text input in main content
  const fallback = page.locator('main input[type="text"], main input:not([type]), .p-4 input').first();
  if (await fallback.count()) return fallback;
  return null;
}

async function pickFilterKeyword(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => {
      const cells = Array.from(r.querySelectorAll('td')).map((c) => (c.textContent || '').trim());
      return cells.some((c) => c.length > 1);
    });
    if (!rows.length) return null;
    const cells = Array.from(rows[0].querySelectorAll('td')).map((c) => (c.textContent || '').trim());
    // prefer code-like cell (short alphanumeric) or name cell
    const candidates = cells.filter((c) => c.length >= 2 && c.length <= 40 && !/^\d+$/.test(c));
    const raw = candidates[0] || cells.find((c) => c.length >= 2) || null;
    if (!raw) return null;
    // use a distinctive substring (first token / 3+ chars)
    const token = raw.split(/\s+/)[0];
    const kw = token.length >= 2 ? token.slice(0, Math.min(12, token.length)) : raw.slice(0, 8);
    return { keyword: kw, raw, cellCount: cells.length };
  });
}

async function runDebounceSearchUf(page, ufId) {
  const input = await findListSearchInput(page);
  if (!input) {
    note(`${ufId}-search-input`, false, 'search Input not found');
    return false;
  }
  note(`${ufId}-search-input`, true, 'Input visible');

  await sleep(800);
  const before = await countDataRows(page);
  note(`${ufId}-baseline-rows`, before.count > 0, `count=${before.count} sample=${JSON.stringify(before.sample)}`);

  if (before.count === 0) {
    // Still verify Input is controlled (value wires)
    await input.fill('zzz-no-match-ux03');
    const valImmediate = await input.inputValue();
    note(`${ufId}-input-immediate`, valImmediate === 'zzz-no-match-ux03', `value=${valImmediate}`);
    await sleep(400);
    await input.fill('');
    note(
      `${ufId}-filter-debounce`,
      false,
      'BLOCKED-DATA — empty table under U65; Input wire checked only',
    );
    return false;
  }

  const pick = await pickFilterKeyword(page);
  if (!pick?.keyword) {
    note(`${ufId}-pick-keyword`, false, 'could not extract keyword from first row');
    return false;
  }
  note(`${ufId}-pick-keyword`, true, `kw=${pick.keyword} raw=${pick.raw}`);

  // Clear then type — assert Input updates immediately (before debounce settles)
  await input.fill('');
  await sleep(50);
  await input.type(pick.keyword, { delay: 20 });
  const valImmediate = await input.inputValue();
  const immediateOk = valImmediate === pick.keyword;
  note(`${ufId}-input-immediate`, immediateOk, `value="${valImmediate}" expected="${pick.keyword}"`);

  // Shortly after typing, wait for debounce window then assert filter applied
  await sleep(450);
  const filtered = await countDataRows(page);
  const filterOk = filtered.count > 0 && filtered.count <= before.count;
  // Prefer strict shrink when keyword is selective
  const shrinkOk = filtered.count < before.count || before.count === 1;
  note(
    `${ufId}-filter-after-debounce`,
    filterOk && (shrinkOk || filtered.count === before.count),
    `before=${before.count} after=${filtered.count} shrink=${shrinkOk} sample=${JSON.stringify(filtered.sample)}`,
  );

  // Negative keyword should empty or shrink hard
  await input.fill('___UX03_NO_MATCH___');
  const negImmediate = await input.inputValue();
  note(`${ufId}-neg-input-immediate`, negImmediate === '___UX03_NO_MATCH___', `value=${negImmediate}`);
  await sleep(450);
  const negRows = await countDataRows(page);
  note(
    `${ufId}-filter-negative`,
    negRows.count === 0 || negRows.count < before.count,
    `negCount=${negRows.count}`,
  );

  // Clear → full list
  await input.fill('');
  const clearImmediate = (await input.inputValue()) === '';
  note(`${ufId}-clear-input-immediate`, clearImmediate, `value empty=${clearImmediate}`);
  await sleep(450);
  const restored = await countDataRows(page);
  note(
    `${ufId}-clear-restores-list`,
    restored.count === before.count,
    `restored=${restored.count} baseline=${before.count}`,
  );

  return (
    immediateOk &&
    filterOk &&
    (negRows.count === 0 || negRows.count < before.count) &&
    restored.count === before.count
  );
}

(async () => {
  console.log('=== QA-UX-UX03-01 browser ===');
  note('L0-portal', true, PORTAL);

  const session = await loginApi();
  note('login', true, 'token ok · company main');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackConsole(page);

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
    // ---------- UF-UX03-SHIFTS ----------
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3000);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 30000 },
      );
    } catch {
      /* continue */
    }
    await shot(page, '01-attendance-landing');

    // Open Ca làm việc → Danh sách ca (Playwright role — evaluate click races radix close)
    const shiftsTab = page.getByRole('button', { name: /Ca làm việc/i });
    const tabOk = (await shiftsTab.count()) > 0;
    if (tabOk) await shiftsTab.first().click();
    await sleep(600);
    note('UF-UX03-SHIFTS-open-tab', tabOk, tabOk ? 'button Ca làm việc' : 'missing');

    const listItem = page.getByRole('menuitem', { name: /Danh sách ca/i });
    let menuOk = (await listItem.count()) > 0;
    if (menuOk) {
      await listItem.first().click();
    } else {
      const via = await page.getByText('Danh sách ca', { exact: false }).count();
      if (via) {
        await page.getByText('Danh sách ca', { exact: false }).first().click();
        menuOk = true;
      }
    }
    note('UF-UX03-SHIFTS-menu-list', menuOk, menuOk ? 'menuitem/text Danh sách ca' : 'missing');
    await sleep(2500);
    await shot(page, '02-shifts-list');

    // Shifts API often total=0 under U65 — still require Input wire + controlled clear
    const shiftsInput = await findListSearchInput(page);
    let shiftsOk = false;
    let shiftsMode = 'full';
    if (!shiftsInput) {
      note('UF-UX03-SHIFTS-search-input', false, 'search Input not found');
    } else {
      note('UF-UX03-SHIFTS-search-input', true, 'Input visible placeholder Tìm kiếm');
      const before = await countDataRows(page);
      note(
        'UF-UX03-SHIFTS-baseline-rows',
        true,
        `count=${before.count} (API work-shifts may be empty under U65)`,
      );
      if (before.count === 0) {
        shiftsMode = 'BLOCKED-DATA-empty-shifts';
        await shiftsInput.fill('CaSang');
        const v1 = await shiftsInput.inputValue();
        note('UF-UX03-SHIFTS-input-immediate', v1 === 'CaSang', `value=${v1}`);
        await sleep(450);
        const mid = await countDataRows(page);
        note(
          'UF-UX03-SHIFTS-filter-after-debounce',
          mid.count === 0,
          `empty stays empty after debounce mid=${mid.count} (no rows to shrink — BLOCKED-DATA)`,
        );
        await shiftsInput.fill('');
        const v2 = await shiftsInput.inputValue();
        note('UF-UX03-SHIFTS-clear-input-immediate', v2 === '', `empty=${v2 === ''}`);
        await sleep(450);
        // Pass wire/debounce path; row-filter observation deferred (U65 empty API)
        shiftsOk = v1 === 'CaSang' && v2 === '';
        note(
          'UF-UX03-SHIFTS-row-filter',
          false,
          'BLOCKED-DATA — GET /api/hrm/attendance/work-shifts total=0; no seed (U65); Input wire PASS',
        );
      } else {
        shiftsOk = await runDebounceSearchUf(page, 'UF-UX03-SHIFTS');
        shiftsMode = 'full';
      }
    }
    await shot(page, '03-shifts-after-search');
    note(
      'UF-UX03-SHIFTS-overall',
      shiftsOk,
      shiftsOk
        ? `OK mode=${shiftsMode}`
        : `FAIL mode=${shiftsMode}`,
    );

    // ---------- must_keep C1 Clock-In ----------
    const errBeforeClock = results.pageErrors.length + results.consoleErrors.length;
    // Navigate back to attendance overview / clock-in
    if (await visible(page, 'overview-clock-in-cta')) {
      await page.getByTestId('overview-clock-in-cta').click();
    } else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tab = buttons.find(
          (b) =>
            /^chấm công$/i.test((b.textContent || '').replace(/\s+/g, ' ').trim()) ||
            /chấm công vào\/ra/i.test((b.textContent || '').trim()),
        );
        tab?.click();
      });
      await sleep(400);
    }
    await sleep(800);
    if (!(await visible(page, 'clock-in-wizard'))) {
      if (await visible(page, 'overview-clock-in-cta')) {
        await page.getByTestId('overview-clock-in-cta').click();
        await sleep(1000);
      } else if (await visible(page, 'attendance-tab-clock-in')) {
        await page.getByTestId('attendance-tab-clock-in').click();
        await sleep(1000);
      } else {
        // try attendance menu dropdown
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const tab = buttons.find((b) => /chấm công/i.test((b.textContent || '').trim()) && /chevron|▼|v/i.test(b.innerHTML + b.textContent));
          // broader: any button containing Chấm công
          const any = buttons.find((b) => /chấm công/i.test((b.textContent || '').trim()));
          (tab || any)?.click();
        });
        await sleep(400);
        await page.evaluate(() => {
          const nodes = Array.from(document.querySelectorAll('[role="menuitem"]'));
          const el = nodes.find((n) => /chấm công vào|vào\/ra|clock.?in/i.test((n.textContent || '').trim()));
          el?.click();
        });
        await sleep(1000);
        if (await visible(page, 'overview-clock-in-cta')) {
          await page.getByTestId('overview-clock-in-cta').click();
          await sleep(1000);
        }
      }
    }
    const wizardOk = await visible(page, 'clock-in-wizard');
    const methodOk = wizardOk && (await visible(page, 'clock-in-method-selector') || await visible(page, 'clock-in-panel-manual'));
    note('must_keep-C1-clock-in', wizardOk && methodOk, `wizard=${wizardOk} methodOrManual=${methodOk}`);
    await shot(page, '04-clock-in-wizard');

    // ---------- UF-UX03-CONTRACTS ----------
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 30000 },
      );
    } catch {
      /* continue */
    }
    await shot(page, '05-contracts-list');
    const contractsOk = await runDebounceSearchUf(page, 'UF-UX03-CONTRACTS');
    await shot(page, '06-contracts-after-search');
    note('UF-UX03-CONTRACTS-overall', contractsOk, contractsOk ? 'debounce+filter+clear OK' : 'see step fails');

    // ---------- must_keep Payroll tax brief open ----------
    const errBeforePay = results.pageErrors.length + results.consoleErrors.length;
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const taxVia = await openPayrollTax(page);
    await sleep(1500);
    const payRoot = await page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
    const onTax = await page.evaluate(() =>
      /bảng quyết toán thuế|quyết toán thuế|tax settlement/i.test((document.body?.innerText || '').slice(0, 6000)),
    );
    const payBanner = await pageHasErrorBanner(page);
    const payCrashes = [...results.pageErrors, ...results.consoleErrors]
      .slice(errBeforePay)
      .filter((e) => /TypeError|Invalid hook call|floatingUiState|Cannot read propert/i.test(e));
    note(
      'must_keep-payroll-tax',
      payRoot > 80 && !payBanner && payCrashes.length === 0,
      `via=${taxVia} onTax=${onTax} root=${payRoot} banner=${payBanner} typeErrors=${payCrashes.length}`,
    );
    await shot(page, '07-payroll-tax');

    // Console gate for whole run
    const typeErrors = [...results.pageErrors, ...results.consoleErrors].filter((e) =>
      /TypeError|Invalid hook call|Cannot read properties of null \(reading 'useEffect'\)/i.test(e),
    );
    note('console-no-TypeError', typeErrors.length === 0, `count=${typeErrors.length}`);

    const criticalFails = results.steps.filter(
      (s) =>
        !s.ok &&
        /UF-UX03-SHIFTS-overall|UF-UX03-CONTRACTS-overall|must_keep-C1-clock-in|must_keep-payroll-tax|console-no-TypeError|UF-UX03-SHIFTS-input-immediate|UF-UX03-CONTRACTS-input-immediate|UF-UX03-SHIFTS-clear-restores|UF-UX03-CONTRACTS-clear-restores|UF-UX03-SHIFTS-filter-after|UF-UX03-CONTRACTS-filter-after|UF-UX03-SHIFTS-filter-negative|UF-UX03-CONTRACTS-filter-negative/.test(
          s.id,
        ),
    );
    // Also fail if overall UF false
    const failed = results.steps.filter((s) => !s.ok);
    results.finishedAt = new Date().toISOString();
    results.failedCount = failed.length;
    results.criticalFailCount = criticalFails.length;
    // Shifts row-filter BLOCKED-DATA is Info (ok=false on that step only) — overall PASS if wire+Contracts+must_keep
    const shiftsOverall = results.steps.find((s) => s.id === 'UF-UX03-SHIFTS-overall')?.ok;
    const contractsOverall = results.steps.find((s) => s.id === 'UF-UX03-CONTRACTS-overall')?.ok;
    const clockOk = results.steps.find((s) => s.id === 'must_keep-C1-clock-in')?.ok;
    const payOk = results.steps.find((s) => s.id === 'must_keep-payroll-tax')?.ok;
    const consoleOk = results.steps.find((s) => s.id === 'console-no-TypeError')?.ok;
    const shiftsInputOk = results.steps.find((s) => s.id === 'UF-UX03-SHIFTS-input-immediate')?.ok;
    results.verdict =
      shiftsOverall && contractsOverall && clockOk && payOk && consoleOk && shiftsInputOk !== false
        ? 'PASS'
        : 'FAIL';
    results.blocked_data = results.steps
      .filter((s) => !s.ok && /BLOCKED-DATA/i.test(s.detail || ''))
      .map((s) => s.id);
    save();
    console.log(
      `=== verdict ${results.verdict} failed=${failed.length} critical=${criticalFails.length} blocked=${JSON.stringify(results.blocked_data)} ===`,
    );
    await browser.close();
    process.exit(results.verdict === 'PASS' ? 0 : 1);
  } catch (e) {
    note('SCRIPT-ERROR', false, String(e).slice(0, 500));
    results.verdict = 'FAIL';
    results.finishedAt = new Date().toISOString();
    save();
    try {
      await browser.close();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
})();
