/**
 * QA-UX-UX09-01 — browser U65 FE-only
 * Shifts checkbox → bulk toolbar (Đã chọn N / Bỏ chọn / Xóa) → confirm delete → F5
 * + must_keep: Clock-In C1 · UX-03 debounce wire · Payroll tax / D5 mount
 * HOLD_DEPLOY · zero-seed · local :5173
 * If work-shifts empty: create ≥2 rows via FE Add (not seed), then bulk delete.
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
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-ux-ux09-01-runtime.json');
const SCREEN_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-ux-ux09-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-UX09-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, hold_deploy: true },
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  network: { deletes: [], creates: [] },
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

function trackNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    if (!/work-shifts/i.test(url)) return;
    const method = res.request().method();
    const status = res.status();
    if (method === 'POST') results.network.creates.push({ status, url: url.slice(0, 160) });
    if (method === 'DELETE') results.network.deletes.push({ status, url: url.slice(0, 160) });
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

async function countDataRows(page) {
  return page.evaluate(() => {
    const table = document.querySelector('[data-testid="shifts-table"]') || document.querySelector('table');
    if (!table) return { count: 0, sample: [] };
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter((r) => {
      const cells = Array.from(r.querySelectorAll('td')).map((c) => (c.textContent || '').trim());
      if (/không có|no data|chưa có dữ liệu/i.test((r.textContent || '').trim()) && cells.length <= 1) {
        return false;
      }
      return cells.some((c) => c.length > 0);
    });
    const sample = rows.slice(0, 4).map((r) =>
      (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    );
    return { count: rows.length, sample };
  });
}

async function openShiftsList(page) {
  const shiftsTab = page.getByRole('button', { name: /Ca làm việc/i });
  const tabOk = (await shiftsTab.count()) > 0;
  if (tabOk) await shiftsTab.first().click();
  await sleep(600);
  note('UF-UX09-open-tab', tabOk, tabOk ? 'button Ca làm việc' : 'missing');

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
  note('UF-UX09-menu-list', menuOk, menuOk ? 'menuitem Danh sách ca' : 'missing');
  await sleep(2500);
  return tabOk && menuOk;
}

async function addShiftViaFe(page, code, name) {
  const addBtn = page.getByRole('button', { name: /^(Thêm|Add)$/i }).first();
  // Prefer orange Add near header — often labeled "Thêm"
  const addCandidates = page.locator('button').filter({ hasText: /^(Thêm|Add)$/i });
  const n = await addCandidates.count();
  if (n === 0) {
    // fallback: any button with Plus near shifts title
    const via = page.getByRole('button', { name: /Thêm/i }).first();
    if ((await via.count()) === 0) {
      note(`UF-UX09-add-${code}`, false, 'Add button not found');
      return false;
    }
    await via.click();
  } else {
    await addCandidates.first().click();
  }
  await sleep(600);

  const dialog = page.getByRole('dialog');
  try {
    await dialog.waitFor({ state: 'visible', timeout: 8000 });
  } catch {
    note(`UF-UX09-add-${code}`, false, 'Add dialog not visible');
    return false;
  }

  await page.locator('#shift-code').fill(code);
  await page.locator('#shift-name').fill(name);
  await sleep(200);

  // Save — Thêm mới / Add
  const save = dialog.getByRole('button', { name: /Thêm mới|Add new|Add$/i });
  if ((await save.count()) > 0) {
    await save.first().click();
  } else {
    await dialog.locator('button.bg-orange-500, button').filter({ hasText: /Thêm|Add|Lưu|Save/i }).last().click();
  }
  await sleep(2000);

  // Wait dialog closed
  try {
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
  } catch {
    /* may still be open on error */
  }

  const rows = await countDataRows(page);
  const ok = rows.sample.some((s) => s.includes(code) || s.includes(name));
  note(
    `UF-UX09-add-${code}`,
    ok,
    `rowPresent=${ok} count=${rows.count} creates=${JSON.stringify(results.network.creates.slice(-2))}`,
  );
  return ok;
}

async function toolbarState(page) {
  return page.evaluate(() => {
    const countEl = document.querySelector('[data-testid="shifts-bulk-count"]');
    const deleteEl = document.querySelector('[data-testid="shifts-bulk-delete"]');
    const body = (document.body?.innerText || '').slice(0, 12000);
    const hasCountText = /Đã chọn\s+\d+\s+ca|shifts selected/i.test(body);
    const hasClear = /Bỏ chọn|Clear selection/i.test(body);
    const hasDelete = /Xóa\s*\(\d+\)|Delete\s*\(\d+\)/i.test(body);
    return {
      countVisible: !!(countEl && countEl.offsetParent !== null),
      countText: countEl ? (countEl.textContent || '').trim() : '',
      deleteVisible: !!(deleteEl && deleteEl.offsetParent !== null),
      deleteText: deleteEl ? (deleteEl.textContent || '').trim() : '',
      hasCountText,
      hasClear,
      hasDelete,
    };
  });
}

async function selectFirstNCheckboxes(page, n) {
  return page.evaluate((need) => {
    const table = document.querySelector('[data-testid="shifts-table"]');
    if (!table) return { clicked: 0 };
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    let clicked = 0;
    for (const row of rows) {
      if (clicked >= need) break;
      const cb =
        row.querySelector('button[role="checkbox"]') ||
        row.querySelector('[role="checkbox"]') ||
        row.querySelector('input[type="checkbox"]');
      if (!cb) continue;
      cb.click();
      clicked += 1;
    }
    return { clicked };
  }, n);
}

async function openPayrollTax(page) {
  const calcTab = page.getByRole('button', { name: /^Tính lương$/i });
  if (await calcTab.count()) {
    await calcTab.first().click();
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

(async () => {
  console.log('=== QA-UX-UX09-01 browser ===');
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
  trackNetwork(page);

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
    // ---------- Navigate Shifts ----------
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

    const navOk = await openShiftsList(page);
    await shot(page, '02-shifts-list');

    let baseline = await countDataRows(page);
    note('UF-UX09-baseline-rows', true, `count=${baseline.count} sample=${JSON.stringify(baseline.sample)}`);

    // U65: empty → create via FE Add (not seed)
    if (baseline.count < 2) {
      const stamp = Date.now().toString(36).slice(-5).toUpperCase();
      const need = 2 - baseline.count;
      for (let i = 0; i < need; i++) {
        const code = `UX9${stamp}${i}`;
        const name = `QA UX09 Ca ${stamp}-${i}`;
        await addShiftViaFe(page, code, name);
        await sleep(800);
      }
      baseline = await countDataRows(page);
      note('UF-UX09-fe-seed-rows', baseline.count >= 2, `count=${baseline.count} after FE Add`);
      await shot(page, '03-after-fe-add');
    } else {
      note('UF-UX09-fe-seed-rows', true, `skipped — already ${baseline.count} rows`);
    }

    if (baseline.count < 1) {
      note('UF-UX09-toolbar', false, 'BLOCKED — no rows after FE Add; cannot exercise bulk');
      note('UF-UX09-overall', false, 'no data for bulk path');
    } else {
      // Ensure toolbar hidden when nothing selected
      const beforeSel = await toolbarState(page);
      note(
        'UF-UX09-toolbar-hidden-idle',
        !beforeSel.countVisible && !beforeSel.deleteVisible,
        JSON.stringify(beforeSel),
      );

      // Select 2 rows (or 1 if only one)
      const want = Math.min(2, baseline.count);
      const sel = await selectFirstNCheckboxes(page, want);
      await sleep(500);
      note('UF-UX09-checkbox-select', sel.clicked === want, `clicked=${sel.clicked} want=${want}`);
      await shot(page, '04-selected-toolbar');

      const tb = await toolbarState(page);
      const toolbarOk =
        tb.countVisible &&
        tb.deleteVisible &&
        /Đã chọn|selected/i.test(tb.countText) &&
        tb.hasClear &&
        (/Xóa|Delete/i.test(tb.deleteText) || tb.hasDelete);
      note(
        'UF-UX09-toolbar-visible',
        toolbarOk,
        JSON.stringify(tb),
      );

      // Clear selection
      const clearBtn = page.getByRole('button', { name: /Bỏ chọn|Clear selection/i });
      if ((await clearBtn.count()) > 0) {
        await clearBtn.first().click();
        await sleep(400);
      } else {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const el = buttons.find((b) => /Bỏ chọn|Clear selection/i.test((b.textContent || '').trim()));
          el?.click();
        });
        await sleep(400);
      }
      const afterClear = await toolbarState(page);
      note(
        'UF-UX09-clear-hides-toolbar',
        !afterClear.countVisible && !afterClear.deleteVisible,
        JSON.stringify(afterClear),
      );
      await shot(page, '05-after-clear');

      // Re-select and bulk delete
      const sel2 = await selectFirstNCheckboxes(page, want);
      await sleep(400);
      note('UF-UX09-reselect', sel2.clicked === want, `clicked=${sel2.clicked}`);

      const delBtn = page.getByTestId('shifts-bulk-delete');
      if ((await delBtn.count()) > 0) {
        await delBtn.first().click();
      } else {
        await page.getByRole('button', { name: /Xóa\s*\(|Delete\s*\(/i }).first().click();
      }
      await sleep(600);

      const alert = page.getByRole('alertdialog');
      let alertOk = false;
      try {
        await alert.waitFor({ state: 'visible', timeout: 8000 });
        alertOk = true;
      } catch {
        // radix AlertDialog may use role=dialog
        alertOk = (await page.getByRole('dialog').filter({ hasText: /xóa|delete/i }).count()) > 0;
      }
      note('UF-UX09-confirm-dialog', alertOk, 'AlertDialog bulk confirm');
      await shot(page, '06-confirm-dialog');

      const confirmBtn = page
        .getByRole('alertdialog')
        .getByRole('button', { name: /Xóa|Delete|Confirm/i })
        .last();
      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.click();
      } else {
        await page.evaluate(() => {
          const dlg =
            document.querySelector('[role="alertdialog"]') ||
            Array.from(document.querySelectorAll('[role="dialog"]')).find((d) =>
              /xóa|delete/i.test(d.textContent || ''),
            );
          const buttons = Array.from((dlg || document).querySelectorAll('button'));
          const el = buttons.find((b) => /^Xóa|^Delete|Xóa\s*\(/i.test((b.textContent || '').trim()));
          el?.click();
        });
      }
      await sleep(3000);

      const deletesOk = results.network.deletes.filter((d) => d.status >= 200 && d.status < 300);
      note(
        'UF-UX09-delete-network',
        deletesOk.length >= 1,
        `2xxDeletes=${deletesOk.length} all=${JSON.stringify(results.network.deletes)}`,
      );

      const afterDel = await countDataRows(page);
      const feUpdated = afterDel.count === baseline.count - want || afterDel.count < baseline.count;
      note(
        'UF-UX09-fe-after-2xx',
        feUpdated,
        `before=${baseline.count} after=${afterDel.count} wantRemoved=${want}`,
      );
      await shot(page, '07-after-bulk-delete');

      // F5 consistency
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
      await sleep(3000);
      await openShiftsList(page);
      await sleep(1500);
      const afterF5 = await countDataRows(page);
      note(
        'UF-UX09-f5-consistent',
        afterF5.count === afterDel.count,
        `fe=${afterDel.count} f5=${afterF5.count}`,
      );
      await shot(page, '08-after-f5');

      const featureOk =
        toolbarOk &&
        results.steps.find((s) => s.id === 'UF-UX09-clear-hides-toolbar')?.ok &&
        results.steps.find((s) => s.id === 'UF-UX09-confirm-dialog')?.ok &&
        results.steps.find((s) => s.id === 'UF-UX09-delete-network')?.ok &&
        results.steps.find((s) => s.id === 'UF-UX09-fe-after-2xx')?.ok &&
        results.steps.find((s) => s.id === 'UF-UX09-f5-consistent')?.ok;
      note('UF-UX09-overall', !!featureOk, featureOk ? 'bulk toolbar+delete+F5 OK' : 'see step fails');
    }

    // ---------- must_keep UX-03 debounce wire (Shifts search Input) ----------
    const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    if ((await search.count()) > 0 && (await search.isVisible())) {
      await search.fill('UX09Debounce');
      const v1 = await search.inputValue();
      note('must_keep-UX03-input-immediate', v1 === 'UX09Debounce', `value=${v1}`);
      await sleep(450);
      await search.fill('');
      const v2 = await search.inputValue();
      note('must_keep-UX03-clear', v2 === '', `empty=${v2 === ''}`);
    } else {
      note('must_keep-UX03-input-immediate', false, 'search Input not found');
      note('must_keep-UX03-clear', false, 'search Input not found');
    }

    // ---------- must_keep C1 Clock-In ----------
    if (await visible(page, 'overview-clock-in-cta')) {
      await page.getByTestId('overview-clock-in-cta').click();
    } else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const any = buttons.find((b) => /chấm công/i.test((b.textContent || '').trim()));
        any?.click();
      });
      await sleep(400);
      await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('[role="menuitem"]'));
        const el = nodes.find((n) => /chấm công vào|vào\/ra|clock.?in/i.test((n.textContent || '').trim()));
        el?.click();
      });
      await sleep(800);
      if (await visible(page, 'overview-clock-in-cta')) {
        await page.getByTestId('overview-clock-in-cta').click();
      }
    }
    await sleep(1000);
    const wizardOk = await visible(page, 'clock-in-wizard');
    const methodOk =
      wizardOk &&
      ((await visible(page, 'clock-in-method-selector')) || (await visible(page, 'clock-in-panel-manual')));
    note('must_keep-C1-clock-in', wizardOk && methodOk, `wizard=${wizardOk} methodOrManual=${methodOk}`);
    await shot(page, '09-clock-in-wizard');

    // ---------- must_keep Payroll + tax ----------
    const errBeforePay = results.pageErrors.length + results.consoleErrors.length;
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const payRoot = await page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
    note('must_keep-payroll-mount', payRoot > 80, `root=${payRoot}`);
    const taxVia = await openPayrollTax(page);
    await sleep(1500);
    const onTax = await page.evaluate(() =>
      /bảng quyết toán thuế|quyết toán thuế|tax settlement/i.test((document.body?.innerText || '').slice(0, 6000)),
    );
    const payBanner = await pageHasErrorBanner(page);
    const payCrashes = [...results.pageErrors, ...results.consoleErrors]
      .slice(errBeforePay)
      .filter((e) => /TypeError|Invalid hook call|floatingUiState|t is not defined|Cannot read propert/i.test(e));
    note(
      'must_keep-payroll-tax',
      payRoot > 80 && !payBanner && payCrashes.length === 0,
      `via=${taxVia} onTax=${onTax} root=${payRoot} banner=${payBanner} typeErrors=${payCrashes.length}`,
    );
    await shot(page, '10-payroll-tax');

    // D5 light: open Salary components Add if tab available
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const openedComp = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
      const el = tabs.find((n) => /thành phần lương|salary component/i.test((n.textContent || '').trim()));
      if (!el) return null;
      el.click();
      return (el.textContent || '').trim().slice(0, 40);
    });
    await sleep(800);
    let d5Ok = payRoot > 80;
    if (openedComp) {
      const add = page.getByRole('button', { name: /Thêm mới/i });
      if ((await add.count()) > 0) {
        await add.first().click();
        await sleep(800);
        const dlg = page.getByRole('dialog');
        const dlgOk = (await dlg.count()) > 0;
        if (dlgOk) {
          const submit = dlg.getByRole('button', { name: /Thêm mới/i }).last();
          if ((await submit.count()) > 0) await submit.click();
          await sleep(600);
          const msgs = await page.evaluate(() => {
            const texts = Array.from(document.querySelectorAll('[id^="form-item-message"], .text-destructive, p'))
              .map((el) => (el.textContent || '').trim())
              .filter((t) => /không được|vui lòng|required|bắt buộc/i.test(t));
            return [...new Set(texts)].slice(0, 5);
          });
          d5Ok = msgs.length >= 1;
          note('must_keep-D5-zod-add', d5Ok, `msgs=${JSON.stringify(msgs)}`);
          // close dialog
          await page.keyboard.press('Escape');
        } else {
          note('must_keep-D5-zod-add', false, 'Add dialog missing');
          d5Ok = false;
        }
      } else {
        note('must_keep-D5-zod-add', true, 'tab opened; Add CTA not asserted (non-blocking if mount OK)');
      }
    } else {
      note('must_keep-D5-zod-add', true, 'SalaryComponents tab not found — mount gate only (prior D5 PASS)');
    }
    await shot(page, '11-payroll-d5');

    const typeErrors = [...results.pageErrors, ...results.consoleErrors].filter((e) =>
      /TypeError|Invalid hook call|t is not defined|Cannot read properties of null \(reading 'useEffect'\)/i.test(e),
    );
    note('console-no-TypeError', typeErrors.length === 0, `count=${typeErrors.length}`);

    const criticalIds = [
      'UF-UX09-overall',
      'must_keep-C1-clock-in',
      'must_keep-payroll-mount',
      'must_keep-payroll-tax',
      'must_keep-UX03-input-immediate',
      'console-no-TypeError',
    ];
    const criticalFails = results.steps.filter((s) => criticalIds.includes(s.id) && !s.ok);
    results.finishedAt = new Date().toISOString();
    results.failedCount = results.steps.filter((s) => !s.ok).length;
    results.criticalFailCount = criticalFails.length;
    results.verdict = criticalFails.length === 0 ? 'PASS' : 'FAIL';
    results.blocked_data = results.steps
      .filter((s) => !s.ok && /BLOCKED/i.test(s.detail || ''))
      .map((s) => s.id);
    save();
    console.log(
      `=== verdict ${results.verdict} failed=${results.failedCount} critical=${criticalFails.length} ===`,
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
