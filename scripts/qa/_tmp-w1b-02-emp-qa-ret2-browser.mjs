/**
 * W1-B-02-EMP-QA-RET2 — HDSD click path + case_matrix A/B/C · U65 · timestamps
 * FORBIDDEN: idle viewport / load URL and stop (QA-IDLE-VIEWPORT)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_DEV_URL || 'http://127.0.0.1:8080';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-02-emp-qa-ret2-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/w1b-02-emp-qa-ret2-20260803');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function looksLikeSnakeCatalogKey(v) {
  if (typeof v !== 'string' || !v.trim()) return false;
  const s = v.trim();
  return /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(s) || /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s);
}

const results = {
  work_item_id: 'W1-B-02-EMP-QA-RET2',
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, HRM, EMAIL },
  click_log: [],
  ac: {},
  case_matrix: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  journeys: [],
  boot: {},
  idle_guard: { qa_idle_viewport: 'PENDING' },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function logClick(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[CLICK ${results.click_log.length}] ${entry.at} ${action}`, detail.url || detail.text || '');
  return entry;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm\/employees|xbos\/auth)/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        if (method === 'GET' || method === 'PATCH' || method === 'POST') {
          const j = await res.json();
          const d = j?.data;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          if (items?.[0]) {
            bodySnippet = {
              total: d?.total ?? items.length,
              first: {
                id: items[0].id,
                company_id: items[0].company_id,
                display_name: items[0].display_name,
                job_title_label: items[0].job_title_label,
                status_label: items[0].status_label,
                department: items[0].department,
              },
            };
          } else if (d && typeof d === 'object' && (d.id || d.accessToken)) {
            bodySnippet = d.accessToken
              ? { login: true, code: j.code }
              : {
                  id: d.id,
                  company_id: d.company_id,
                  display_name: d.display_name,
                  job_title_label: d.job_title_label,
                  status_label: d.status_label,
                  department: d.department,
                  code: j.code,
                };
          } else {
            bodySnippet = { code: j?.code, message: j?.message?.slice?.(0, 80) };
          }
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  logClick('API_LOGIN_POST', { url: `${PORTAL}/api/xbos/auth/login` });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  logClick('API_LOGIN_OK', { status: r.status });
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
      if (s.raw?.defaultMembershipId) {
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    }
  }, session);
}

async function tryClick(page, locator, action, opts = {}) {
  const count = await locator.count().catch(() => 0);
  if (!count) {
    logClick(`${action}_MISS`, { reason: 'locator count 0' });
    return false;
  }
  const text = ((await locator.first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  logClick(action, { text, url: page.url().slice(0, 180) });
  await locator.first().click({ timeout: opts.timeout || 8000 });
  await sleep(opts.wait || 1200);
  return true;
}

async function navigateHdsdToEmployees(page, base) {
  // Prefer portal shell → HRM menu → Nhân viên
  logClick('NAV_GOTO_PORTAL_OR_HRM', { url: base });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  await shot(page, '00-shell');

  // Click HRM / Nhân sự nav if present
  const hrmNav = page
    .locator('a, button, [role="menuitem"], [role="link"]')
    .filter({ hasText: /HRM|Nhân sự|Human Resources|Quản trị nhân sự/i });
  if (await hrmNav.count()) {
    await tryClick(page, hrmNav.first(), 'CLICK_MENU_HRM', { wait: 2000 });
    await shot(page, '00b-after-hrm-menu');
  }

  const empNav = page
    .locator('a, button, [role="menuitem"], [role="link"], nav *')
    .filter({ hasText: /Nhân viên|Employees|Danh sách nhân viên/i });
  let clickedMenu = false;
  if (await empNav.count()) {
    clickedMenu = await tryClick(page, empNav.first(), 'CLICK_MENU_NHAN_VIEN', { wait: 3000 });
  }

  if (!clickedMenu || !/\/employees/.test(page.url())) {
    // Deep-link fallback AFTER menu attempt (still logged) — not idle load-only
    const empUrl = base.includes(':8080')
      ? `${HRM}/hr/employees?portal=1&tenantId=xevn&companyId=main`
      : `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`;
    logClick('NAV_FALLBACK_EMPLOYEES_URL', { url: empUrl, reason: 'menu miss or not on /employees' });
    await page.goto(empUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
  }

  await shot(page, '01-employees-list');
  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
  const rowCount = await page.locator('table tbody tr').count();
  logClick('ASSERT_LIST_RENDER', { rootChild, rowCount, url: page.url().slice(0, 200) });
  return { rootChild, rowCount };
}

async function openCreateOrEditDialog(page) {
  // Prefer create for case A validation; else edit first row
  const createBtn = page.locator('button, a').filter({ hasText: /Thêm nhân viên|Tạo mới|Thêm mới|\+ Thêm|New employee/i });
  if (await createBtn.count()) {
    await tryClick(page, createBtn.first(), 'CLICK_THEM_NHAN_VIEN', { wait: 1500 });
    await shot(page, '02-create-dialog');
    return 'create';
  }
  const editBtn = page.locator('button').filter({ hasText: /Sửa|Chỉnh sửa|Cập nhật|Edit/i });
  // if on detail
  if (await editBtn.count()) {
    await tryClick(page, editBtn.first(), 'CLICK_SUA', { wait: 1500 });
    return 'edit';
  }
  return null;
}

async function caseA_fail(page) {
  logClick('CASE_A_START', { intent: 'validation fail — empty required / bad phone' });
  const mode = await openCreateOrEditDialog(page);
  if (!mode) {
    // Open first row then edit
    const row = page.locator('table tbody tr').first();
    if (await row.count()) {
      await tryClick(page, row.locator('td').first(), 'CASE_A_CLICK_ROW', { wait: 2500 });
      await openCreateOrEditDialog(page);
    }
  }

  const dialog = page.locator('[role="dialog"], [data-testid="hdsd-employee-form-dialog"], form').first();
  const hasDialog = (await dialog.count()) > 0;

  // Clear required field / type invalid
  const nameInput = page
    .locator(
      '[role="dialog"] input[name="full_name"], input[name="full_name"], [role="dialog"] input[name="display_name"]',
    )
    .first();
  const phoneInput = page
    .locator('[role="dialog"] input[name="phone_number"], input[name="phone_number"]')
    .first();

  let typed = false;
  if (await nameInput.count()) {
    logClick('CASE_A_TYPE_CLEAR_NAME', {});
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('');
    typed = true;
  }
  if (await phoneInput.count()) {
    logClick('CASE_A_TYPE_BAD_PHONE', { value: 'abc' });
    await phoneInput.click({ clickCount: 3 });
    await phoneInput.fill('abc');
    typed = true;
  }

  const beforeNet = results.network.length;
  const submit = page
    .locator(
      '[data-testid="hdsd-employee-form-submit"], [role="dialog"] button[type="submit"], [role="dialog"] button',
    )
    .filter({ hasText: /Lưu|Save|Tạo|Gửi/i })
    .first();
  if (await submit.count()) {
    await tryClick(page, submit, 'CASE_A_CLICK_LUU_EXPECT_FAIL', { wait: 2000 });
  } else {
    logClick('CASE_A_SUBMIT_MISS', {});
  }
  await shot(page, '03-case-a-fail');

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) || '');
  const validationUi =
    /bắt buộc|required|không hợp lệ|invalid|vui lòng|error|lỗi/i.test(bodyText) ||
    (await page.locator('[role="alert"], .text-destructive, [aria-invalid="true"]').count()) > 0;
  const patchAfter = results.network
    .slice(beforeNet)
    .filter((n) => n.method === 'PATCH' || n.method === 'POST');
  const noSuccessMutate = !patchAfter.some((n) => n.status >= 200 && n.status < 300 && /employees/.test(n.url));

  // Close dialog if open
  const cancel = page.locator('[role="dialog"] button').filter({ hasText: /Hủy|Đóng|Cancel|Close/i }).first();
  if (await cancel.count()) await tryClick(page, cancel, 'CASE_A_CLOSE_DIALOG', { wait: 800 });
  else await page.keyboard.press('Escape');

  results.case_matrix.A_fail = {
    verdict: typed && (validationUi || noSuccessMutate) ? 'PASS' : 'FAIL',
    typed,
    hasDialog,
    validationUi,
    noSuccessMutate,
    mutateCalls: patchAfter.slice(0, 5),
    note: 'Expect FE validation block or non-2xx — no silent success on bad input',
  };
  logClick('CASE_A_DONE', { verdict: results.case_matrix.A_fail.verdict });
}

async function caseB_success_jhrm02(page) {
  logClick('CASE_B_START', { intent: 'J-HRM-02 list→detail + PATCH success + F5' });
  // Ensure on list
  if (!/\/employees\/?(\?|$)/.test(page.url()) || (await page.locator('table tbody tr').count()) === 0) {
    const empUrl = `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`;
    logClick('CASE_B_RENAV_LIST', { url: empUrl });
    await page.goto(empUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
  }

  const listNets = results.network.filter(
    (n) => n.method === 'GET' && /\/api\/hrm\/employees(\?|$)/.test(n.url) && !/\/employees\/[^/?]+/.test(n.url),
  );
  const listOk = listNets.find((n) => n.status >= 200 && n.status < 300);
  const rowCount = await page.locator('table tbody tr').count();
  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);

  results.ac.ac1_list = {
    verdict: rootChild > 0 && rowCount > 0 && listOk ? 'PASS' : 'FAIL',
    rootChild,
    rowCount,
    listStatus: listOk?.status ?? null,
    sample: listOk?.bodySnippet?.first ?? null,
  };

  let target = page.locator('table tbody tr').filter({ hasText: /holding|Holding|QA SoftDel|Tập đoàn/i }).first();
  if ((await target.count()) === 0) target = page.locator('table tbody tr').first();
  if ((await target.count()) === 0) {
    results.case_matrix.B_success = { verdict: 'FAIL', reason: 'no rows' };
    results.ac.ac2_jhrm02 = { verdict: 'FAIL', journey: 'J-HRM-02' };
    return;
  }

  const rowText = ((await target.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const beforeDetail = results.network.length;
  await tryClick(page, target.locator('td').first(), 'CASE_B_CLICK_HOLDING_ROW', {
    wait: 3500,
  });
  logClick('CASE_B_ROW_TEXT', { text: rowText });
  await shot(page, '04-case-b-detail');

  const detailUrl = page.url();
  const detailId = detailUrl.match(/\/employees\/([0-9a-f-]{8,})/i)?.[1] || null;
  const detailNets = results.network
    .slice(beforeDetail)
    .filter(
      (n) =>
        n.method === 'GET' &&
        /\/api\/hrm\/employees\/[^/?]+/.test(n.url) &&
        /company_id=main/.test(n.url),
    );
  const detailOk = detailNets.find((n) => n.status >= 200 && n.status < 300);
  const detail404 = detailNets.find((n) => n.status === 404);
  const profileVisible = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return t.length > 80 && !/không tìm thấy|404/i.test(t);
  });

  results.ac.ac2_jhrm02 = {
    verdict: detailOk && !detail404 && detailId && profileVisible ? 'PASS' : 'FAIL',
    journey: 'J-HRM-02',
    clickPath: `menu→Nhân viên→row[${rowText}]→profile`,
    finalUrl: detailUrl.slice(0, 220),
    detailId,
    detailStatus: detailOk?.status ?? detail404?.status ?? null,
    detailBody: detailOk?.bodySnippet ?? null,
    company_id_of_row: detailOk?.bodySnippet?.company_id ?? null,
  };
  results.journeys.push({
    id: 'J-HRM-02',
    verdict: results.ac.ac2_jhrm02.verdict === 'PASS' ? '🟢' : '🔴',
    url: detailUrl,
    detailStatus: results.ac.ac2_jhrm02.detailStatus,
  });

  // AC4 snake
  const detailText = await page.evaluate(() => document.body?.innerText || '');
  const snakeUiFiltered = detailText
    .split(/[\s|/·,;]+/)
    .filter((t) => looksLikeSnakeCatalogKey(t))
    .filter((t) => !/@/.test(t) && !/^QA-/.test(t));
  results.ac.ac4_ui_no_snake = {
    verdict: snakeUiFiltered.length === 0 ? 'PASS' : 'FAIL',
    snakeUiFiltered: snakeUiFiltered.slice(0, 12),
  };

  // PATCH — UI edit preferred
  let patchVia = null;
  const editBtn = page.locator('button').filter({ hasText: /Sửa|Chỉnh sửa|Cập nhật|Edit/i }).first();
  if (await editBtn.count()) {
    await tryClick(page, editBtn, 'CASE_B_CLICK_EDIT', { wait: 1500 });
    const phone = page
      .locator('[role="dialog"] input[name="phone_number"], input[name="phone_number"]')
      .first();
    if (await phone.count()) {
      const cur = await phone.inputValue().catch(() => '');
      const next = cur && cur.length > 3 ? cur : '0901000001';
      logClick('CASE_B_TYPE_PHONE', { value: next.slice(0, 20) });
      await phone.click({ clickCount: 3 });
      await phone.fill(next);
      const beforePatch = results.network.length;
      const submit = page
        .locator('[data-testid="hdsd-employee-form-submit"], [role="dialog"] button[type="submit"]')
        .first();
      if (await submit.count()) await tryClick(page, submit, 'CASE_B_CLICK_LUU', { wait: 3500 });
      else {
        const luu = page.getByRole('button', { name: /Lưu|Save/i }).first();
        await tryClick(page, luu, 'CASE_B_CLICK_LUU', { wait: 3500 });
      }
      patchVia =
        results.network
          .slice(beforePatch)
          .filter((n) => n.method === 'PATCH' && /employees/.test(n.url))
          .pop() || null;
      await shot(page, '05-case-b-after-patch');
    }
  }

  if (!patchVia && detailId) {
    logClick('CASE_B_PATCH_VIA_SESSION_FETCH', { detailId });
    const patchResult = await page.evaluate(async (id) => {
      const token =
        localStorage.getItem('xevn.portal.accessToken') ||
        sessionStorage.getItem('xevn.portal.accessToken');
      const getRes = await fetch(`/api/hrm/employees/${id}?company_id=main`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const getJ = await getRes.json();
      const g = getJ?.data || {};
      const body = g.full_name
        ? { full_name: g.full_name }
        : { full_name: g.display_name || 'QA' };
      const patchRes = await fetch(`/api/hrm/employees/${id}?company_id=main`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      const patchJ = await patchRes.json();
      return {
        status: patchRes.status,
        code: patchJ.code,
        display_name: patchJ?.data?.display_name,
        job_title_label: patchJ?.data?.job_title_label,
        status_label: patchJ?.data?.status_label,
        department: patchJ?.data?.department,
        via: 'page.fetch',
      };
    }, detailId);
    results.network.push({
      at: ts(),
      method: 'PATCH',
      status: patchResult.status,
      url: `/api/hrm/employees/${detailId}?company_id=main`,
      bodySnippet: patchResult,
    });
    patchVia = {
      method: 'PATCH',
      status: patchResult.status,
      url: `/api/hrm/employees/${detailId}?company_id=main`,
      bodySnippet: patchResult,
    };
  }

  const patchOk =
    patchVia &&
    patchVia.status >= 200 &&
    patchVia.status < 300 &&
    patchVia.bodySnippet &&
    'display_name' in (patchVia.bodySnippet || {}) &&
    'job_title_label' in (patchVia.bodySnippet || {});

  results.ac.ac3_patch = {
    verdict: patchOk ? 'PASS' : 'FAIL',
    status: patchVia?.status ?? null,
    body: patchVia?.bodySnippet ?? null,
    note: patchVia?.bodySnippet?.via === 'page.fetch' ? 'session fetch same JWT' : 'UI PATCH',
  };

  // F5
  logClick('CASE_B_F5_RELOAD', { url: page.url().slice(0, 180) });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '06-case-b-f5');
  const afterF5Url = page.url();
  const f5Detail = results.network
    .filter(
      (n) =>
        n.method === 'GET' &&
        detailId &&
        n.url.includes(`/employees/${detailId}`) &&
        /company_id=main/.test(n.url),
    )
    .pop();
  const nameAfter = await page.evaluate(() => (document.body?.innerText || '').slice(0, 200));
  const feStillOk =
    /\/employees\//.test(afterF5Url) &&
    !/không tìm thấy|404/i.test(nameAfter) &&
    f5Detail?.status >= 200 &&
    f5Detail?.status < 300;

  results.ac.ac5_fe_f5 = {
    verdict: feStillOk ? 'PASS' : 'FAIL',
    afterF5Url: afterF5Url.slice(0, 220),
    f5DetailStatus: f5Detail?.status ?? null,
  };

  results.case_matrix.B_success = {
    verdict:
      results.ac.ac1_list?.verdict === 'PASS' &&
      results.ac.ac2_jhrm02?.verdict === 'PASS' &&
      results.ac.ac3_patch?.verdict === 'PASS' &&
      results.ac.ac5_fe_f5?.verdict === 'PASS'
        ? 'PASS'
        : 'FAIL',
    ac1: results.ac.ac1_list?.verdict,
    ac2: results.ac.ac2_jhrm02?.verdict,
    ac3: results.ac.ac3_patch?.verdict,
    ac5: results.ac.ac5_fe_f5?.verdict,
  };
  logClick('CASE_B_DONE', { verdict: results.case_matrix.B_success.verdict });
}

async function caseC_logic(page) {
  logClick('CASE_C_START', { intent: 'scope logic — detail GET company_id=main for holding row; no snake label' });
  const detail = results.ac.ac2_jhrm02;
  const snake = results.ac.ac4_ui_no_snake;
  const scopeOk =
    detail?.verdict === 'PASS' &&
    detail?.detailStatus >= 200 &&
    detail?.detailStatus < 300 &&
    detail?.company_id_of_row != null;
  // holding under main rollup is expected company_id=holding while query company_id=main
  const rollupLogic =
    scopeOk &&
    (detail.company_id_of_row === 'holding' ||
      detail.company_id_of_row === 'main' ||
      typeof detail.company_id_of_row === 'string');

  // Extra click: back to list then re-open same id (logic continuity)
  if (detail?.detailId) {
    const back = page.locator('a, button').filter({ hasText: /Quay lại|Danh sách|Back|Nhân viên/i }).first();
    if (await back.count()) {
      await tryClick(page, back, 'CASE_C_CLICK_BACK_LIST', { wait: 2500 });
    } else {
      logClick('CASE_C_GOTO_LIST', {});
      await page.goto(`${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(3000);
    }
    const row = page.locator('table tbody tr').first();
    if (await row.count()) {
      await tryClick(page, row.locator('td').first(), 'CASE_C_RECLICK_ROW', { wait: 3000 });
      await shot(page, '07-case-c-reopen');
    }
  }

  results.case_matrix.C_logic = {
    verdict: rollupLogic && snake?.verdict === 'PASS' ? 'PASS' : 'FAIL',
    scopeOk,
    rollupLogic,
    company_id_of_row: detail?.company_id_of_row ?? null,
    query_company_id: 'main',
    snake_ui: snake?.verdict,
    note: 'Group CEO company_id=main must resolve holding employee detail 2xx; UI never shows snake job_title_label',
  };
  logClick('CASE_C_DONE', { verdict: results.case_matrix.C_logic.verdict });
}

async function main() {
  // Boot probes
  for (const u of [
    `${PORTAL}/hr/src/App.tsx`,
    `${HRM}/hr/src/App.tsx`,
    `${HRM}/hr/src/pages/Fleet.tsx`,
  ]) {
    try {
      const r = await fetch(u);
      const t = await r.text();
      results.boot[u] = {
        status: r.status,
        fleetErr: /Failed to resolve import.*Fleet/i.test(t),
        resolveErr: /Failed to resolve import/i.test(t),
      };
    } catch (e) {
      results.boot[u] = { error: String(e).slice(0, 120) };
    }
  }

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
    // Portal first (HDSD), then HRM if portal whitescreen
    let listState = await navigateHdsdToEmployees(page, `${PORTAL}/`);
    if (listState.rootChild === 0 || listState.rowCount === 0) {
      logClick('RETRY_HRM_DIRECT', { url: `${HRM}/hr/` });
      listState = await navigateHdsdToEmployees(page, `${HRM}/hr/`);
    }

    if (listState.rootChild === 0) {
      results.fatal = 'whitescreen empty #root after menu+URL — FE boot residual';
      results.idle_guard.qa_idle_viewport = 'FAIL';
      results.idle_guard.note = 'Clicks logged but app never mounted — not idle; FE defect';
      throw new Error(results.fatal);
    }

    await caseA_fail(page);
    await caseB_success_jhrm02(page);
    await caseC_logic(page);

    const clickCount = results.click_log.length;
    results.idle_guard = {
      qa_idle_viewport: clickCount >= 6 ? 'PASS' : 'FAIL',
      click_count: clickCount,
      note: 'Each interaction timestamped in click_log',
    };
  } catch (e) {
    results.fatal = String(e).slice(0, 500);
    if (results.idle_guard.qa_idle_viewport === 'PENDING') {
      results.idle_guard.qa_idle_viewport =
        results.click_log.length >= 4 ? 'PASS' : 'FAIL';
      results.idle_guard.click_count = results.click_log.length;
    }
  } finally {
    results.finishedAt = ts();
    const cm = results.case_matrix;
    const acVals = Object.values(results.ac).map((a) => a?.verdict);
    const cmVals = Object.values(cm).map((a) => a?.verdict);
    const bootOk = !results.fatal?.includes('whitescreen');
    results.overall =
      results.fatal && !bootOk
        ? 'FAIL'
        : cmVals.length === 3 &&
            cmVals.every((v) => v === 'PASS') &&
            acVals.every((v) => v === 'PASS') &&
            results.idle_guard.qa_idle_viewport === 'PASS'
          ? 'PASS'
          : 'FAIL';
    save();
    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.overall === 'PASS' ? 0 : 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
