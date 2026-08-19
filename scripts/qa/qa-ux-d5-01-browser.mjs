/**
 * QA-UX-D5-01 — browser U65 FE-only
 * Payroll mount (prior t undefined) + tax C1 + Add salary component dialog
 * + UX-03 must_keep light: Clock-In + Contracts search
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
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-ux-d5-01-runtime.json');
const SCREEN_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-ux-d5-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-D5-01',
  also_covers: 'QA-UX-UX03-01 retest must_keep Payroll',
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
    results.pageErrors.push(String(e).slice(0, 500));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 500));
  });
}

function hasTUndefined(errs) {
  return errs.some((e) => /ReferenceError:\s*t is not defined|t is not defined/i.test(e));
}

async function rootLen(page) {
  return page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
}

async function openPayrollTax(page) {
  const calcTab = page.getByRole('button', { name: /^Tính lương$/i });
  if (await calcTab.count()) {
    await calcTab.first().click();
    await sleep(500);
  } else {
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button'));
      const el = nodes.find((n) => /^tính lương$/i.test((n.textContent || '').replace(/\s+/g, ' ').trim()));
      el?.click();
    });
    await sleep(500);
  }
  const menuItem = page.getByRole('menuitem', { name: /Bảng quyết toán thuế|Quyết toán thuế/i });
  if (await menuItem.count()) {
    await menuItem.first().click();
    await sleep(1200);
    return 'menuitem';
  }
  const via = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'));
    const el = nodes.find((n) => /quyết toán thuế|tax settlement/i.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 60);
  });
  await sleep(1200);
  return via;
}

async function countDataRows(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => {
      const cells = Array.from(r.querySelectorAll('td')).map((c) => (c.textContent || '').trim());
      return cells.some((c) => c.length > 0);
    });
    return { count: rows.length };
  });
}

(async () => {
  console.log('=== QA-UX-D5-01 browser ===');
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
    // ---------- 1) Payroll mount ----------
    const errBeforePayroll = results.pageErrors.length;
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 30000 },
      );
    } catch {
      /* continue */
    }
    const payrollRoot = await rootLen(page);
    const tErr = hasTUndefined(results.pageErrors.slice(errBeforePayroll));
    note(
      'UF-D5-payroll-mount',
      payrollRoot > 80 && !tErr,
      `rootLen=${payrollRoot} tUndefined=${tErr} pageErrors=${JSON.stringify(results.pageErrors.slice(errBeforePayroll).slice(0, 3))}`,
    );
    await shot(page, '01-payroll-mount');

    // ---------- 2) Tax settlement C1 ----------
    const errBeforeTax = results.pageErrors.length;
    const taxVia = await openPayrollTax(page);
    const taxRoot = await rootLen(page);
    const taxBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 2500));
    const taxVisible =
      /quyết toán thuế|bảng quyết toán|kỳ quyết toán|tax settlement|không có dữ liệu|chưa có/i.test(
        taxBody,
      );
    const taxCrash =
      hasTUndefined(results.pageErrors.slice(errBeforeTax)) ||
      results.pageErrors.slice(errBeforeTax).some((e) => /Invalid hook call|TypeError/i.test(e));
    note(
      'UF-D5-tax-settlement',
      taxRoot > 80 && !taxCrash && (Boolean(taxVia) || taxVisible),
      `via=${taxVia} rootLen=${taxRoot} taxVisible=${taxVisible} crash=${taxCrash}`,
    );
    await shot(page, '02-tax-settlement');

    // ---------- 3) Thành phần lương → Thêm → empty submit ----------
    // Navigate back to components tab
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    const componentsTab = page.getByRole('button', { name: /Thành phần lương|Thành phần/i });
    let compOk = (await componentsTab.count()) > 0;
    if (compOk) {
      // Prefer exact "Thành phần lương" if present
      const exact = page.getByRole('button', { name: /^Thành phần lương$/i });
      if (await exact.count()) await exact.first().click();
      else await componentsTab.first().click();
    } else {
      compOk = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('button'));
        const el = nodes.find((n) => /thành phần lương/i.test((n.textContent || '').trim()));
        if (!el) return false;
        el.click();
        return true;
      });
    }
    await sleep(1500);
    note('UF-D5-components-tab', compOk, compOk ? 'opened Thành phần lương' : 'tab missing');
    await shot(page, '03-components-tab');

    // Click Thêm mới / Thêm thành phần (SalaryComponentsTab: t('salaryComponents.addNew'))
    let addOpened = false;
    const addBtn = page.getByRole('button', { name: /Thêm mới|Thêm thành phần|^Thêm$/i });
    if (await addBtn.count()) {
      // Prefer primary "Thêm mới" over empty-state / other Thêm*
      const preferred = page.getByRole('button', { name: /^Thêm mới$/i });
      if (await preferred.count()) await preferred.first().click();
      else await addBtn.first().click();
      await sleep(800);
      addOpened = true;
    } else {
      addOpened = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const el =
          buttons.find((b) => /^thêm mới$/i.test((b.textContent || '').replace(/\s+/g, ' ').trim())) ||
          buttons.find((b) => /thêm thành phần|^thêm$/i.test((b.textContent || '').trim()));
        if (!el) return false;
        el.click();
        return true;
      });
      await sleep(800);
    }

    // Detect dialog
    const dialogInfo = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return { open: false };
      const title = (dlg.querySelector('h2, [class*="DialogTitle"]')?.textContent || '').trim();
      const text = (dlg.innerText || '').slice(0, 800);
      const hasFormMessage = !!dlg.querySelector('[id$="-form-item-message"], .text-destructive, [class*="FormMessage"]');
      return { open: true, title: title.slice(0, 80), textPreview: text, hasFormMessage };
    });
    note(
      'UF-D5-add-dialog-open',
      addOpened && dialogInfo.open,
      `opened=${addOpened} dialog=${JSON.stringify(dialogInfo)}`,
    );
    await shot(page, '04-add-dialog');

    // Empty submit — primary CTA is "Thêm mới" (SalaryComponentsTab) or Lưu (legacy Zod dialog)
    if (dialogInfo.open) {
      const submitBtn = page
        .locator('[role="dialog"] button')
        .filter({ hasText: /^(Thêm mới|Lưu|Lưu & thêm|Save)/i });
      if (await submitBtn.count()) {
        await submitBtn.first().click();
      } else {
        await page.evaluate(() => {
          const dlg = document.querySelector('[role="dialog"]');
          const btns = Array.from(dlg?.querySelectorAll('button') || []);
          const save = btns.find((b) => {
            const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
            return /^(Thêm mới|Lưu|Lưu & thêm|Save)$/i.test(t) || /^Thêm mới$/i.test(t);
          });
          save?.click();
        });
      }
      await sleep(900);

      const errors = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        if (!dlg) return { stillOpen: false, messages: [] };
        const msgs = Array.from(
          dlg.querySelectorAll(
            'p.text-destructive, p.text-xs.text-destructive, [id$="-form-item-message"], [class*="FormMessage"]',
          ),
        )
          .map((el) => (el.textContent || '').trim())
          .filter((t) => t.length > 1 && t !== '*');
        const uniq = [...new Set(msgs)];
        // also scrape any red text nodes under fields
        const redish = Array.from(dlg.querySelectorAll('*'))
          .filter((el) => {
            const cls = el.className?.toString?.() || '';
            return /destructive|text-red/i.test(cls) && el.children.length === 0;
          })
          .map((el) => (el.textContent || '').trim())
          .filter((t) => t.length > 2 && t !== '*');
        return {
          stillOpen: true,
          messages: [...new Set([...uniq, ...redish])],
          bodySnippet: (dlg.innerText || '').slice(0, 1600),
        };
      });

      const bodyHasVi =
        /không được để trống|vui lòng chọn|bắt buộc|phải có ít nhất|không hợp lệ/i.test(
          errors.bodySnippet || '',
        );
      const hasViMsgs =
        errors.messages.length >= 1 &&
        errors.messages.some((m) =>
          /mã|tên|loại|đơn vị|không được|vui lòng|bắt buộc|ít nhất/i.test(m),
        );

      note(
        'UF-D5-empty-submit-fieldErrors',
        errors.stillOpen && (hasViMsgs || bodyHasVi),
        `msgs=${JSON.stringify(errors.messages)} bodyHasVi=${bodyHasVi}`,
      );
      await shot(page, '05-empty-submit-errors');

      // Detect whether Zod FormMessage (rhf) or manual p.text-destructive
      const stackHint = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        if (!dlg) return 'no-dialog';
        const formMsg = dlg.querySelectorAll('[id$="-form-item-message"]').length;
        const manual = dlg.querySelectorAll('p.text-xs.text-destructive, p.text-destructive').length;
        const title = (dlg.querySelector('h2')?.textContent || '').trim();
        return `title=${title} formItemMessage=${formMsg} manualDestructiveP=${manual}`;
      });
      note('UF-D5-dialog-stack-hint', true, stackHint);

      // Live wire PASS when RHF FormMessage ids present (D-UX-D5-ZOD-LIVE-WIRE-01)
      const zodWired = /formItemMessage=[1-9]/.test(stackHint);
      note(
        'UF-D5-zod-rhf-live-wiring',
        zodWired,
        zodWired
          ? 'RHF FormMessage present on live SalaryComponentsTab Add dialog'
          : 'Live Add dialog lacks [id$=-form-item-message] — still manual validate or dialog wrong path',
      );

      // Valid path light — fill via Playwright fill (React controlled)
      const codeInput = page.locator('[role="dialog"] input').first();
      const nameInput = page.locator('[role="dialog"] input').nth(1);
      if (await codeInput.count()) {
        await codeInput.fill('QA_D5_COMP');
      }
      if (await nameInput.count()) {
        await nameInput.fill('Thanh phan QA D5');
      }
      const typeTrigger = page
        .locator('[role="dialog"] button[role="combobox"], [role="dialog"] [data-radix-select-trigger]')
        .first();
      if (await typeTrigger.count()) {
        try {
          await typeTrigger.click({ timeout: 2000 });
          await sleep(300);
          const opt = page.getByRole('option').first();
          if (await opt.count()) await opt.click();
        } catch {
          /* optional */
        }
      }
      await sleep(300);
      if (await submitBtn.count()) {
        await submitBtn.first().click();
        await sleep(1000);
      }
      const afterValid = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]');
        const msgs = Array.from(
          dlg?.querySelectorAll('p.text-destructive, [id$="-form-item-message"]') || [],
        )
          .map((el) => (el.textContent || '').trim())
          .filter((t) => t.length > 1 && t !== '*');
        return { dialogOpen: !!dlg, msgs };
      });
      note(
        'UF-D5-valid-submit-attempt',
        true,
        `dialogOpen=${afterValid.dialogOpen} residualMsgs=${JSON.stringify(afterValid.msgs)} (API/mock; no seed)`,
      );
      await shot(page, '06-valid-attempt');

      await page.keyboard.press('Escape');
      await sleep(400);
    } else {
      note('UF-D5-empty-submit-fieldErrors', false, 'dialog did not open — cannot assert fieldErrors');
      note('UF-D5-zod-rhf-live-wiring', false, 'dialog missing');
    }

    // ---------- 4a) Clock-In must_keep ----------
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

    let clockOk = false;
    if (await page.getByTestId('overview-clock-in-cta').count()) {
      await page.getByTestId('overview-clock-in-cta').click();
      await sleep(1000);
    } else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cta = buttons.find((b) => /chấm công|clock.?in|vào ca/i.test((b.textContent || '').trim()));
        cta?.click();
      });
      await sleep(1000);
    }
    clockOk =
      (await page.getByTestId('clock-in-wizard').count()) > 0 ||
      (await page.locator('text=/chọn phương thức|manual|GPS|QR/i').count()) > 0 ||
      (await page.evaluate(() => /chọn phương thức|clock-in|chấm công vào/i.test(document.body?.innerText || '')));
    const clockCrash = hasTUndefined(results.pageErrors.slice(errBeforeClock));
    note(
      'UF-UX03-clock-in-mustkeep',
      clockOk && !clockCrash,
      `wizardVisible=${clockOk} tErr=${clockCrash}`,
    );
    await shot(page, '07-clock-in');

    // ---------- 4b) Contracts search smoke ----------
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3000);
    try {
      await page.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 20000 },
      );
    } catch {
      /* continue */
    }
    const search = page.locator(
      'input[placeholder*="Tìm"], input[placeholder*="tìm"], input[placeholder*="Search"]',
    ).first();
    let contractsOk = false;
    if (await search.count()) {
      const before = await countDataRows(page);
      await search.fill('___UX03_NO_MATCH___');
      await sleep(450);
      const after = await countDataRows(page);
      await search.fill('');
      await sleep(450);
      const restored = await countDataRows(page);
      contractsOk =
        before.count > 0
          ? after.count === 0 || after.count < before.count
          : true; // empty baseline — Input wire only
      note(
        'UF-UX03-contracts-search-smoke',
        contractsOk || before.count === 0,
        `before=${before.count} afterNeg=${after.count} restored=${restored.count}`,
      );
    } else {
      note('UF-UX03-contracts-search-smoke', false, 'search input missing');
    }
    await shot(page, '08-contracts');

    // ---------- Console gate ----------
    const tAnywhere = hasTUndefined([...results.pageErrors, ...results.consoleErrors]);
    note('console-no-t-undefined', !tAnywhere, `tUndefined=${tAnywhere} pageErrors=${results.pageErrors.length}`);

    results.finishedAt = new Date().toISOString();
    const hardFails = results.steps.filter(
      (s) =>
        !s.ok &&
        [
          'UF-D5-payroll-mount',
          'UF-D5-tax-settlement',
          'UF-D5-add-dialog-open',
          'UF-D5-empty-submit-fieldErrors',
          'UF-D5-zod-rhf-live-wiring',
          'UF-UX03-clock-in-mustkeep',
          'console-no-t-undefined',
        ].includes(s.id),
    );
    results.verdict = hardFails.length === 0 ? 'PASS' : 'FAIL';
    results.hardFails = hardFails.map((s) => s.id);
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
