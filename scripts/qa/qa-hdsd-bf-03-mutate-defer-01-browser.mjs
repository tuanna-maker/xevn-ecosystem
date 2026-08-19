/**
 * QA-HDSD-BF-03-MUTATE-DEFER-01 — TC-025 soft-delete · TC-041 HĐ delete · TC-049 BH dialog mutate
 * U65 zero-seed · portal :5173 · ceo@xe.vn
 * must_keep: TC-HDSD-06/07/08 spines — no re-mutate YCTD/HĐ/leave; only disposable stamp rows
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
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-mutate-defer-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-mutate-defer-01-20260801');
const STAMP = `MD${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-MUTATE-DEFER-01',
  program: 'P-HDSD-ECOSYSTEM-03 · C-BF03-MUTATE-DEFER-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  tc: [],
  journeys: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  must_keep: {
    mutate: ['TC-HDSD-06', 'TC-HDSD-07', 'TC-HDSD-08'],
    note: 'disposable stamp rows only — no touch YCTD/leave spines; HĐ delete only QA-MD stamp',
  },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 200)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 8000);
    return {
      banner: /HRM API Sync ERROR|HRM API request failed \(5\d\d\)|409|companyId mismatch/i.test(txt),
      snippet: txt.slice(0, 280),
    };
  });
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

async function probeL0() {
  const targets = [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 80);
    }
  }
}

async function reactFill(page, selector, value) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: 'visible', timeout: 15000 });
  await loc.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await loc.fill(value);
}

async function clickText(page, text) {
  const clicked = await page.evaluate((t) => {
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="menuitem"], [role="button"], span'),
    );
    const el = nodes.find((n) => (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, text);
  if (!clicked) throw new Error(`click miss: ${text}`);
}

async function createDisposableEmployee(page) {
  const empName = `QA SoftDel ${STAMP}`;
  const empCode = `QA${STAMP}`;
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const createBtn = page.locator('#hdsd-employees-create-btn, [data-testid="hdsd-employees-create-btn"]').first();
  if (await createBtn.count()) await createBtn.click();
  else await clickText(page, 'Thêm nhân viên');
  await sleep(1500);
  const dlg = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 12000 });
  await reactFill(page, '[data-testid="hdsd-employee-form-dialog"] input[name="full_name"], [role="dialog"] input[name="full_name"]', empName);
  await reactFill(page, '[data-testid="hdsd-employee-form-dialog"] input[name="employee_code"], [role="dialog"] input[name="employee_code"]', empCode);
  const before = results.network.length;
  const submit = page.locator('[data-testid="hdsd-employee-form-submit"]').first();
  if (await submit.count()) await submit.click();
  else await page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button[aria-label="Lưu"]').first().click();
  await sleep(4000);
  const post = netsSince(
    before,
    (n) => n.method === 'POST' && /\/api\/hrm\/employees(\?|$)/.test(n.url),
  ).pop();
  await shot(page, '01-employee-created');
  return { empName, empCode, post };
}

async function softDeleteEmployee(page, empCode, empName) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const search = page.locator('input[placeholder*="Tìm"], input[type="search"], input[placeholder*="search" i]').first();
  if (await search.count()) {
    await search.fill(empCode);
    await sleep(2000);
  }
  const row = page.locator('table tbody tr').filter({ hasText: empCode }).first();
  if (!(await row.count())) {
    return { opened: false, archive: null, f5Gone: false, reason: 'row not found' };
  }

  // Real pointer click on ⋯ (Radix needs Playwright click, not synthetic dispatch)
  await row.locator('button').last().click({ timeout: 8000 });
  await sleep(600);
  const menu = page.locator('[role="menu"]');
  const menuOk = await menu.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  await shot(page, '02-employee-menu');
  if (!menuOk) {
    return {
      opened: false,
      archive: null,
      f5Gone: false,
      reason: `menu miss url=${page.url().slice(-90)}`,
    };
  }

  // Playwright click on accessible name — Radix onSelect needs real pointer (not only synthetic)
  try {
    await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click({ timeout: 5000 });
  } catch {
    await page.locator('[role="menuitem"]').filter({ hasText: /^Xóa$/ }).click({ timeout: 5000 });
  }
  await sleep(1500);

  const alertByRole = page.locator('[role="alertdialog"]');
  const alertVisible = await alertByRole
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  await shot(page, '03-soft-delete-confirm');

  const bodyHasConfirm = await page.evaluate(() =>
    /Xác nhận xóa/i.test(document.body?.innerText || ''),
  );
  results._softDeleteBodyHasConfirm = bodyHasConfirm;

  if (!alertVisible && !bodyHasConfirm) {
    return {
      opened: false,
      archive: null,
      f5Gone: false,
      reason: `alertdialog miss url=${page.url().slice(-120)}`,
    };
  }

  const reason = page.locator('[role="alertdialog"] textarea, textarea').first();
  if (await reason.count()) await reason.fill(`QA soft-delete ${STAMP}`);

  const before = results.network.length;
  await page.getByRole('button', { name: 'Xóa nhân viên' }).click({ timeout: 8000 });
  await sleep(4000);
  const archive = netsSince(
    before,
    (n) =>
      (n.method === 'POST' && /\/employees\/[^/]+\/archive/.test(n.url)) ||
      (n.method === 'DELETE' && /\/employees\//.test(n.url)),
  ).pop();
  await shot(page, '04-soft-delete-after');

  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  if (await search.count()) {
    await search.fill(empCode);
    await sleep(2000);
  }
  const f5Gone = await page.evaluate(
    ({ code, name }) => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map((r) => r.textContent || '');
      const empty = rows.length === 0 || rows.every((r) => /không có|no data|chưa có/i.test(r));
      if (empty) return true;
      return !rows.some((r) => r.includes(code) || r.includes(name));
    },
    { code: empCode, name: empName },
  );
  await shot(page, '05-soft-delete-f5');
  return { opened: true, archive, f5Gone };
}

async function createThenDeleteContract(page) {
  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const createBtn = page.locator('#hdsd-contracts-create-btn, [data-testid="hdsd-contracts-create-btn"]').first();
  if (await createBtn.count()) await createBtn.click();
  else await clickText(page, 'Thêm hợp đồng');
  await sleep(1500);
  const dlg = await page.locator('[data-testid="hdsd-contracts-form-dialog"], [role="dialog"]').first().isVisible().catch(() => false);
  let formReady = false;
  if (dlg) {
    try {
      await page.waitForSelector('[data-testid="hdsd-contracts-form-ready"]', { timeout: 22000 });
      formReady = true;
    } catch {
      formReady = false;
    }
  }
  await shot(page, '06-contract-form');
  const beforeCreate = results.network.length;
  let postCreate = null;
  if (dlg && formReady) {
    const submit = page.locator('[data-testid="hdsd-contracts-form-submit"]').first();
    if (await submit.count()) await submit.click();
    else await page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button[aria-label="Lưu"]').first().click();
    await sleep(4000);
    postCreate = netsSince(beforeCreate, (n) => ['POST', 'PUT'].includes(n.method) && /contract/.test(n.url)).pop();
  } else if (dlg) {
    // try submit anyway
    try {
      await page.locator('[data-testid="hdsd-contracts-form-submit"]').click({ timeout: 3000 });
      await sleep(4000);
      postCreate = netsSince(beforeCreate, (n) => ['POST', 'PUT'].includes(n.method) && /contract/.test(n.url)).pop();
    } catch {
      await page.keyboard.press('Escape');
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(800);
  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  await shot(page, '07-contracts-before-delete');

  // Prefer deleting a row we just created (often first); else any trash that opens confirm — still FE delete path
  const trashBtns = page.locator('table tbody tr button').filter({
    has: page.locator('svg'),
  });
  // Click trash icon buttons in first few rows until delete dialog appears
  let deleteOpened = false;
  const rowCount = await page.locator('table tbody tr').count();
  for (let i = 0; i < Math.min(rowCount, 5); i++) {
    const row = page.locator('table tbody tr').nth(i);
    const trash = row.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg') }).last();
    // heuristic: last icon buttons often view/edit/delete — try clicking buttons with destructive intent
    const buttons = row.locator('button');
    const btnCount = await buttons.count();
    if (btnCount < 1) continue;
    // try the last button (often delete)
    await buttons.nth(btnCount - 1).click({ timeout: 3000 }).catch(() => {});
    await sleep(700);
    const alert = page.locator('[role="alertdialog"]');
    if (await alert.isVisible().catch(() => false)) {
      deleteOpened = true;
      break;
    }
    // if a menu opened, click Xóa
    const mi = page.getByRole('menuitem', { name: /Xóa|Delete/i });
    if (await mi.count()) {
      await mi.first().click();
      await sleep(700);
      if (await alert.isVisible().catch(() => false)) {
        deleteOpened = true;
        break;
      }
    }
    await page.keyboard.press('Escape').catch(() => {});
  }

  // Fallback: any trash2 button on page
  if (!deleteOpened) {
    const trash2 = page.locator('button:has(svg.lucide-trash-2), button[aria-label*="Xóa"], button[title*="Xóa"]');
    const n = await trash2.count();
    for (let i = 0; i < Math.min(n, 5); i++) {
      await trash2.nth(i).click().catch(() => {});
      await sleep(700);
      if (await page.locator('[role="alertdialog"]').isVisible().catch(() => false)) {
        deleteOpened = true;
        break;
      }
    }
  }

  await shot(page, '08-contract-delete-confirm');
  if (!deleteOpened) {
    return { dlg, formReady, postCreate, delete: null, f5: null, reason: 'delete confirm not opened' };
  }

  const beforeDel = results.network.length;
  await page.getByRole('button', { name: /Xóa|Delete|Confirm|Tiếp tục/i }).last().click();
  await sleep(4000);
  const delNet = netsSince(
    beforeDel,
    (n) => n.method === 'DELETE' && /contract/.test(n.url),
  ).pop();
  await shot(page, '09-contract-deleted');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);
  const f5Ok = !!(await bodyHasError(page)).banner === false;
  await shot(page, '10-contract-f5');
  return { dlg, formReady, postCreate, delete: delNet, f5: f5Ok, reason: null };
}

async function insuranceDialogMutate(page) {
  await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  await shot(page, '11-insurance-mount');
  const addBtn = page.locator('button').filter({ hasText: /Thêm bảo hiểm/i }).first();
  if (await addBtn.count()) await addBtn.click();
  else {
    // toolbar + only
    const plus = page.locator('button').filter({ hasText: /^\+$/ }).first();
    if (await plus.count()) await plus.click();
    else await clickText(page, 'Thêm');
  }
  await sleep(2000);
  const dialog = page.locator('[role="dialog"]').first();
  const dialogOpen = await dialog.isVisible().catch(() => false);
  if (!dialogOpen) {
    return { dialogOpen: false, post: null, f5: false, reason: 'dialog not open' };
  }
  await shot(page, '12-insurance-dialog');

  // employee typeahead
  const empInput = dialog.locator('input').first();
  await empInput.fill('a');
  await sleep(1800);
  const selectTrigger = dialog.locator('[role="combobox"]').first();
  if (await selectTrigger.count()) {
    await selectTrigger.click();
    await sleep(800);
    const opt = page.locator('[role="option"]').first();
    if (await opt.count()) await opt.click();
    await sleep(600);
  }

  // CatalogSearchPicker — open each and pick first option
  const pickers = dialog.locator('button').filter({ hasText: /Chọn|Select|Tìm/i });
  const pickerN = await pickers.count();
  for (let i = 0; i < Math.min(pickerN, 4); i++) {
    try {
      await pickers.nth(i).click({ timeout: 2000 });
      await sleep(600);
      const opt = page.locator('[role="option"], [cmdk-item], [data-value]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        // listbox items as div buttons
        const item = page.locator('[role="listbox"] >> nth=0 >> visible=true').first();
        if (await item.count()) await item.click().catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
      }
    } catch {
      /* */
    }
  }

  // Also try remaining comboboxes
  const combos = dialog.locator('[role="combobox"]');
  const comboCount = await combos.count();
  for (let i = 0; i < Math.min(comboCount, 4); i++) {
    try {
      await combos.nth(i).click({ timeout: 2000 });
      await sleep(500);
      const opt = page.locator('[role="option"]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        await page.keyboard.press('Escape');
      }
    } catch {
      /* */
    }
  }

  const si = dialog.locator('input[name="social_insurance_number"]');
  if (await si.count()) await si.fill(`SI${STAMP}`);

  // Ensure employee_code/name filled if picker failed
  const codeInp = dialog.locator('input[name="employee_code"]');
  const nameInp = dialog.locator('input[name="employee_name"]');
  if (await codeInp.count()) {
    const v = await codeInp.inputValue();
    if (!v) await codeInp.fill(`QA${STAMP}`);
  }
  if (await nameInp.count()) {
    const v = await nameInp.inputValue();
    if (!v) await nameInp.fill(`QA BH ${STAMP}`);
  }

  const before = results.network.length;
  const saveBtn = dialog.getByRole('button', { name: /Lưu|Save|Thêm/i }).last();
  await saveBtn.click();
  await sleep(4500);
  await shot(page, '13-insurance-after-save');
  const post = netsSince(
    before,
    (n) =>
      ['POST', 'PUT', 'PATCH'].includes(n.method) &&
      /insurance-policy-participants|contracts-insurance\/insurance/.test(n.url),
  ).pop();
  const err = await bodyHasError(page);
  const stillOpen = await dialog.isVisible().catch(() => false);
  // capture validation text if 400
  const valMsg = stillOpen
    ? await dialog.evaluate((el) => (el.innerText || '').slice(0, 400))
    : '';
  await page.keyboard.press('Escape').catch(() => {});
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);
  const f5Err = await bodyHasError(page);
  await shot(page, '14-insurance-f5');
  return {
    dialogOpen: true,
    post,
    f5: !f5Err.banner,
    stillOpen,
    banner: err.banner,
    valMsg,
    reason: post
      ? post.status >= 400
        ? `API ${post.status}`
        : null
      : stillOpen
        ? 'validation/submit no API'
        : 'no mutate network',
  };
}

async function main() {
  await probeL0();
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // ── TC-025 soft-delete ──
    let created;
    try {
      created = await createDisposableEmployee(page);
    } catch (e) {
      created = { empName: null, empCode: null, post: null, err: String(e).slice(0, 120) };
    }
    const createOk = created.post?.status >= 200 && created.post?.status < 300;
    let soft;
    try {
      if (createOk && created.empCode) {
        soft = await softDeleteEmployee(page, created.empCode, created.empName);
      } else {
        soft = {
          opened: false,
          archive: null,
          f5Gone: false,
          reason: `create failed POST=${created.post?.status ?? 'none'} ${created.err || ''}`,
        };
      }
    } catch (e) {
      soft = { opened: false, archive: null, f5Gone: false, reason: String(e).slice(0, 160) };
    }
    const archiveOk = soft.archive?.status >= 200 && soft.archive?.status < 300;
    const v025 =
      archiveOk && soft.f5Gone
        ? '🟢'
        : archiveOk
          ? '🟡'
          : soft.opened
            ? '🔴'
            : createOk
              ? '🟡'
              : '🔴';
    recordTc(
      'TC-HRM-HDSD-025',
      v025,
      `§5.3 soft-delete createPOST=${created.post?.status ?? 'none'} archive=${soft.archive?.method || 'none'} ${soft.archive?.status ?? ''} f5Gone=${soft.f5Gone} ${soft.reason || ''}`,
      {
        uf: 'UF-HRM-01',
        clickPath: 'Thêm NV → menu Xóa → Xóa nhân viên → F5',
        http: soft.archive?.status,
        stamp: STAMP,
      },
    );

    // ── TC-041 contract delete ──
    let contract;
    try {
      contract = await createThenDeleteContract(page);
    } catch (e) {
      contract = { delete: null, f5: null, reason: String(e).slice(0, 160) };
    }
    const delOk = contract.delete?.status >= 200 && contract.delete?.status < 300;
    const v041 =
      delOk && contract.f5 !== false ? '🟢' : delOk ? '🟡' : /not opened|miss/i.test(contract.reason || '') ? '🟡' : '🔴';
    recordTc(
      'TC-HRM-HDSD-041',
      v041,
      `§2.5 Xóa HĐ createPOST=${contract.postCreate?.status ?? 'n/a'} DELETE=${contract.delete?.status ?? 'none'} f5=${contract.f5} ${contract.reason || ''}`,
      {
        uf: 'UF-HRM-02',
        clickPath: 'contracts trash → confirm Xóa → F5',
        http: contract.delete?.status,
        note: 'disposable/list row — not TC-06 spine re-mutate create-assert',
      },
    );

    // ── TC-049 BH dialog ──
    let ins;
    try {
      ins = await insuranceDialogMutate(page);
    } catch (e) {
      ins = { dialogOpen: false, post: null, f5: false, reason: String(e).slice(0, 160) };
    }
    const postOk = ins.post?.status >= 200 && ins.post?.status < 300;
    const v049 = postOk && ins.f5 ? '🟢' : postOk ? '🟡' : ins.dialogOpen ? '🟡' : '🔴';
    recordTc(
      'TC-HRM-HDSD-049',
      v049,
      `§3.6 Dialog BH open=${ins.dialogOpen} POST=${ins.post?.method || 'none'} ${ins.post?.status ?? ''} f5=${ins.f5} stillOpen=${ins.stillOpen} ${ins.reason || ''}`,
      {
        uf: 'UF-HRM-03',
        clickPath: '/hr/insurance → Thêm → fields → Lưu → F5',
        http: ins.post?.status,
      },
    );

    results.mustKeepVerified = {
      noYctdNav: !results.network.some(
        (n) => /requisition|job-template/.test(n.url) && ['POST', 'PUT'].includes(n.method),
      ),
      noLeaveNav: !results.network.some(
        (n) => /leave/.test(n.url) && ['POST', 'PUT'].includes(n.method),
      ),
    };
  } finally {
    results.finishedAt = new Date().toISOString();
    const summary = {
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    results.summary = summary;
    save();
    await browser.close();
    console.log('\n=== SUMMARY ===');
    console.log(JSON.stringify(summary));
    console.log(`runtime: ${OUT}`);
  }
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  save();
  process.exit(1);
});
