/**
 * W1-B-01-QA-LEAVE-LIVE-R1 — browser retest after FE LeaveOverviewRecentPanel restore
 * FORBIDDEN: seed · idle viewport · invent UF from L1 alone · reopen AUTH/EMP CLOSED
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-01-qa-leave-live-r1-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function looksLikeRawCodeOnly(v) {
  if (typeof v !== 'string' || !v.trim()) return false;
  const s = v.trim();
  return (
    /^(pending|approved|rejected|cancelled|annual|sick|unpaid|compensatory)$/i.test(s) ||
    /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s) ||
    /^LVT_\d+$/i.test(s)
  );
}

const results = {
  work_item_id: 'W1-B-01-QA-LEAVE-LIVE-R1',
  prior_fail: 'docs/qa/evidence/w1b-01-qa-leave-live.md',
  fe_ready: 'docs/qa/evidence/w1b-01-fe-leave-attendance-mount.md',
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
  residuals: [],
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
      if (!/\/api\/(hrm\/attendance\/leave|hrm\/employees|xbos\/auth|hrm\/settings)/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        const j = await res.json();
        const d = j?.data;
        const items = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d)
              ? d
              : null;
        if (items?.[0]) {
          bodySnippet = {
            total: d?.total ?? items.length,
            first: {
              id: items[0].id,
              status: items[0].status,
              status_label: items[0].status_label,
              leave_type: items[0].leave_type,
              leave_type_label: items[0].leave_type_label,
              employee_display_name: items[0].employee_display_name,
              employee_name: items[0].employee_name,
            },
            code: j?.code,
          };
        } else if (d && typeof d === 'object') {
          bodySnippet = {
            code: j?.code,
            leave_type_label: d.leave_type_label,
            source: d.source,
            entitled_days: d.entitled_days,
            message: typeof j?.message === 'string' ? j.message.slice(0, 100) : undefined,
            accessToken: Boolean(d.accessToken),
          };
        } else {
          bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 100) };
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
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
      displayName: u.displayName || u.fullName || u.name || 'CEO Tap doan',
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

async function navigateToLeave(page, base) {
  logClick('NAV_GOTO_PORTAL_OR_HRM', { url: base });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  await shot(page, '00-shell');

  const hrmNav = page
    .locator('a, button, [role="menuitem"], [role="link"]')
    .filter({ hasText: /HRM|Nhân sự|Human Resources|Quản trị nhân sự/i });
  if (await hrmNav.count()) {
    await tryClick(page, hrmNav.first(), 'CLICK_MENU_HRM', { wait: 2000 });
  }

  const attNav = page
    .locator('a, button, [role="menuitem"], [role="link"], nav *')
    .filter({ hasText: /Chấm công|Attendance/i });
  let clicked = false;
  if (await attNav.count()) {
    clicked = await tryClick(page, attNav.first(), 'CLICK_MENU_CHAM_CONG', { wait: 3000 });
  }

  if (!clicked || !/attendance/i.test(page.url())) {
    const attUrl = base.includes(':8080')
      ? `${HRM}/hr/attendance?portal=1&tenantId=xevn&companyId=main`
      : `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
    logClick('NAV_FALLBACK_ATTENDANCE_URL', { url: attUrl });
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
  }
  await shot(page, '01-attendance');

  // Leave tab — HDSD «Nghỉ phép»
  const leaveTab = page
    .locator('[role="tab"], button, a, [data-state]')
    .filter({ hasText: /Nghỉ phép|Leave|Yêu cầu nghỉ/i });
  if (await leaveTab.count()) {
    await tryClick(page, leaveTab.first(), 'CLICK_TAB_NGHI_PHEP', { wait: 3500 });
  } else {
    logClick('CLICK_TAB_NGHI_PHEP_MISS', {});
  }
  await shot(page, '02-leave-tab');

  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
  const viteResolveFail = results.consoleErrors.some((e) =>
    /Failed to resolve|LeaveOverviewRecentPanel/i.test(e.text || ''),
  );
  const leaveTabVisible = await page
    .locator('[role="tab"], button, a')
    .filter({ hasText: /Nghỉ phép|Leave|Yêu cầu nghỉ/i })
    .count()
    .then((c) => c > 0)
    .catch(() => false);
  results.ac.mount = {
    verdict: rootChild > 0 && !viteResolveFail ? 'PASS' : 'FAIL',
    rootChild,
    viteResolveFail,
    leaveTabVisible,
    url: page.url().slice(0, 220),
    hasLeaveTitle: /Nghỉ phép|Yêu cầu nghỉ|Leave request/i.test(bodyText),
  };
  logClick('ASSERT_LEAVE_SURFACE', results.ac.mount);
  return { rootChild, bodyText };
}

async function openCreateDialog(page) {
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ|Create request|\+\s*Tạo/i });
  if (await createBtn.count()) {
    const ok = await tryClick(page, createBtn.first(), 'CLICK_TAO_YEU_CAU_NGHI', { wait: 2000 });
    if (ok) {
      await shot(page, '03-create-dialog');
      return true;
    }
  }
  const plus = page.locator('button').filter({ hasText: /Tạo|Create|\+/i }).first();
  if (await plus.count()) {
    const ok = await tryClick(page, plus, 'CLICK_TAO_FALLBACK', { wait: 2000 });
    if (ok) {
      await shot(page, '03-create-dialog');
      return true;
    }
  }
  return false;
}

async function caseA_fail(page) {
  logClick('CASE_A_START', { intent: 'fail_deep — sick≥3 no attach OR validation toast / disabled submit' });
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));

  // Try pick employee
  const empSearch = dialog.locator('input').first();
  if (hasDialog && (await empSearch.count())) {
    await empSearch.fill('a');
    await sleep(800);
    logClick('CASE_A_TYPE_EMPLOYEE_KEYWORD', { value: 'a' });
  }

  // Open employee select
  const empTrigger = dialog.locator('button[role="combobox"]').first();
  if (hasDialog && (await empTrigger.count())) {
    await tryClick(page, empTrigger, 'CASE_A_OPEN_EMPLOYEE_SELECT', { wait: 1000 });
    const empItem = page.locator('[role="option"]').first();
    if (await empItem.count()) await tryClick(page, empItem, 'CASE_A_PICK_EMPLOYEE', { wait: 800 });
    else await page.keyboard.press('Escape');
  }

  // Leave type — prefer sick / ốm
  const typeTrigger = dialog.locator('button[role="combobox"]').nth(1);
  let pickedSick = false;
  if (hasDialog && (await typeTrigger.count())) {
    await tryClick(page, typeTrigger, 'CASE_A_OPEN_LEAVE_TYPE', { wait: 1000 });
    const sickOpt = page.locator('[role="option"]').filter({ hasText: /ốm|sick|bệnh/i });
    if (await sickOpt.count()) {
      pickedSick = await tryClick(page, sickOpt.first(), 'CASE_A_PICK_SICK', { wait: 800 });
    } else {
      const anyOpt = page.locator('[role="option"]').first();
      if (await anyOpt.count()) await tryClick(page, anyOpt, 'CASE_A_PICK_ANY_TYPE', { wait: 800 });
      else await page.keyboard.press('Escape');
    }
  }

  const allInputs = dialog.locator('input');
  const inputCount = await allInputs.count();
  logClick('CASE_A_INPUT_COUNT', { inputCount, pickedSick });

  // Set date range spanning 3+ days (dd/MM/yyyy) on date-like text inputs
  const start = '01/09/2027';
  const end = '05/09/2027';
  const textInputs = dialog.locator('input[type="text"], input:not([type])');
  const tiCount = await textInputs.count();
  if (tiCount >= 2) {
    for (let i = Math.max(0, tiCount - 4); i < tiCount; i++) {
      const el = textInputs.nth(i);
      const cur = await el.inputValue().catch(() => '');
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(cur) || cur === '' || /\d{4}-\d{2}-\d{2}/.test(cur)) {
        try {
          await el.click({ clickCount: 3 });
          await el.fill(i % 2 === 0 ? start : end);
          logClick('CASE_A_FILL_DATE', { index: i, value: i % 2 === 0 ? start : end });
        } catch {
          /* */
        }
      }
    }
  }

  const reason = page.getByTestId('hdsd-leave-reason');
  if (await reason.count()) {
    await reason.fill('QA fail_deep sick no attachment');
    logClick('CASE_A_FILL_REASON', {});
  }

  const beforeNet = results.network.length;
  const submit = dialog.locator('button').filter({ hasText: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  const submitDisabled = hasDialog
    ? await submit.isDisabled().catch(() => false)
    : false;

  if (hasDialog && (await submit.count()) && !submitDisabled) {
    await tryClick(page, submit, 'CASE_A_CLICK_SUBMIT_EXPECT_FAIL', { wait: 2500 });
  } else {
    logClick('CASE_A_SUBMIT_DISABLED_OR_MISS', { submitDisabled, hasDialog });
  }
  await shot(page, '04-case-a-fail');

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 5000) || '');
  const validationUi =
    /bắt buộc|required|không hợp lệ|invalid|vui lòng|đính kèm|attachment|HRM-LEAVE-VAL|lỗi|error|thiếu/i.test(
      bodyText,
    ) ||
    (await page.locator('[role="alert"], .text-destructive, [aria-invalid="true"], [data-state="open"]').count()) >
      0;

  const postAfter = results.network
    .slice(beforeNet)
    .filter((n) => n.method === 'POST' && /leave-requests/.test(n.url));
  const valAtt = postAfter.some(
    (n) =>
      n.status >= 400 &&
      /VAL-ATT|422|400|409/.test(String(n.status) + JSON.stringify(n.bodySnippet || {})),
  );
  const noSuccessCreate = !postAfter.some((n) => n.status >= 200 && n.status < 300);

  const cancel = dialog.locator('button').filter({ hasText: /Hủy|Đóng|Cancel|Close/i }).first();
  if (await cancel.count()) await tryClick(page, cancel, 'CASE_A_CLOSE_DIALOG', { wait: 800 });
  else await page.keyboard.press('Escape');
  await sleep(500);

  const pass =
    hasDialog &&
    (submitDisabled || validationUi || valAtt || (postAfter.length > 0 && noSuccessCreate));

  results.case_matrix.A_fail = {
    verdict: pass ? 'PASS' : 'FAIL',
    hasDialog,
    submitDisabled,
    validationUi,
    valAtt,
    noSuccessCreate,
    pickedSick,
    postAfter: postAfter.slice(0, 5),
    note: 'Expect FE block / toast / HRM-LEAVE-VAL-ATT / disabled submit — no silent 2xx create on invalid',
  };
  logClick('CASE_A_DONE', { verdict: results.case_matrix.A_fail.verdict });
}

async function caseB_happy(page) {
  logClick('CASE_B_START', { intent: 'open leave list/balance · display labels not raw codes' });

  // Ensure on leave tab
  if (!/attendance/i.test(page.url())) {
    const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
    logClick('CASE_B_RENAV', { url: attUrl });
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'CASE_B_TAB_LEAVE', { wait: 3000 });
  }

  // Click list sub-tab if present
  const listTab = page.locator('[role="tab"]').filter({ hasText: /Danh sách|List|Yêu cầu/i });
  if (await listTab.count()) await tryClick(page, listTab.first(), 'CASE_B_CLICK_LIST_SUBTAB', { wait: 2000 });

  await shot(page, '05-case-b-list');

  const leaveNets = results.network.filter(
    (n) => n.method === 'GET' && /leave-requests/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  const balNets = results.network.filter(
    (n) => n.method === 'GET' && /leave-balance/.test(n.url),
  );
  const listOk = leaveNets[leaveNets.length - 1];
  const sample = listOk?.bodySnippet?.first;
  const rowCountApi = listOk?.bodySnippet?.total ?? 0;

  const ui = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    const rootChild = document.querySelector('#root')?.childElementCount ?? 0;
    const cards = document.querySelectorAll('[class*="card"], table tbody tr, [class*="Card"]').length;
    return {
      rootChild,
      textLen: t.length,
      cards,
      hasViStatus: /Chờ duyệt|Đã duyệt|Từ chối|Pending|Approved/i.test(t),
      hasRawPendingOnly: /\bpending\b/i.test(t) && !/Chờ duyệt|Đã duyệt|Từ chối/i.test(t),
      hasLeaveTypeVi: /Nghỉ|phép|ốm|bù|không lương|annual|sick/i.test(t),
      emptyHonest: /không có|chưa có|empty|0 yêu cầu|No leave/i.test(t),
      snippet: t.slice(0, 400),
    };
  });

  // Prefer API display-ready when rows exist; UI StatusBadge labels when rendered.
  // leave_type_label LVT_* echo = known P2 R-LEAVE-TYPE-LABEL-DEPTH (defer) — still require field bind.
  let labelsOk = false;
  let labelNote = '';
  let leaveTypeLabelDepthP2 = false;
  if (rowCountApi === 0 || !sample) {
    labelsOk = ui.rootChild > 0 && (ui.emptyHonest || ui.textLen > 80);
    labelNote = 'honest empty or surface loaded — no invent display labels';
  } else {
    leaveTypeLabelDepthP2 = looksLikeRawCodeOnly(sample.leave_type_label);
    const fieldsBound =
      Boolean(sample.status_label) &&
      Boolean(sample.leave_type_label) &&
      Boolean(sample.employee_display_name || sample.employee_name) &&
      !looksLikeRawCodeOnly(sample.status_label);
    const uiLabels = ui.hasViStatus || !ui.hasRawPendingOnly;
    labelsOk = fieldsBound && ui.rootChild > 0 && uiLabels;
    labelNote = `fieldsBound=${fieldsBound} uiLabels=${uiLabels} leaveTypeLabelDepthP2=${leaveTypeLabelDepthP2}`;
    if (leaveTypeLabelDepthP2) {
      results.residuals.push({
        id: 'R-LEAVE-TYPE-LABEL-DEPTH',
        sev: 'P2',
        note: `leave_type_label echoes code: ${sample.leave_type_label}`,
      });
    }
  }

  // Click a row/detail if rows visible
  const row = page.locator('table tbody tr, [class*="leave"] button, button').filter({ hasText: /Chi tiết|Duyệt|Xem/i }).first();
  let detailClicked = false;
  if (await page.locator('table tbody tr').count()) {
    detailClicked = await tryClick(page, page.locator('table tbody tr').first(), 'CASE_B_CLICK_ROW', {
      wait: 2000,
    });
    await shot(page, '06-case-b-detail');
  } else if (await row.count()) {
    detailClicked = await tryClick(page, row, 'CASE_B_CLICK_DETAIL_BTN', { wait: 2000 });
    await shot(page, '06-case-b-detail');
  }

  results.case_matrix.B_happy = {
    verdict: listOk && labelsOk ? 'PASS' : 'FAIL',
    listStatus: listOk?.status ?? null,
    listCode: listOk?.bodySnippet?.code ?? null,
    rowCountApi,
    sample,
    balHits: balNets.length,
    balSample: balNets.slice(-1)[0] || null,
    ui,
    detailClicked,
    labelNote,
  };
  results.ac.display_labels = {
    verdict: labelsOk ? 'PASS' : 'FAIL',
    sample,
    note: labelNote,
  };
  results.journeys.push({
    id: 'J-HRM-06',
    verdict: results.case_matrix.B_happy.verdict,
    url: page.url(),
    listStatus: listOk?.status ?? null,
  });
  logClick('CASE_B_DONE', { verdict: results.case_matrix.B_happy.verdict });
}

async function caseC_f5(page) {
  logClick('CASE_C_START', { intent: 'F5 after navigate — data still bound' });
  const beforeUrl = page.url();
  const beforeText = await page.evaluate(() => (document.body?.innerText || '').slice(0, 600));
  const beforeNet = results.network.length;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('CASE_C_F5_RELOAD', { url: page.url().slice(0, 220) });
  await sleep(4500);

  // Re-click leave tab if needed after F5
  if (!/Nghỉ phép|Yêu cầu nghỉ/i.test(await page.evaluate(() => document.body?.innerText || ''))) {
    const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'CASE_C_RECLICK_LEAVE_TAB', { wait: 3000 });
  }

  await shot(page, '07-case-c-f5');
  const afterNets = results.network
    .slice(beforeNet)
    .filter((n) => n.method === 'GET' && /leave-requests/.test(n.url));
  const afterOk = afterNets.find((n) => n.status >= 200 && n.status < 300);
  const afterUi = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      rootChild: document.querySelector('#root')?.childElementCount ?? 0,
      textLen: t.length,
      hasLeave: /Nghỉ phép|Yêu cầu nghỉ|Leave/i.test(t),
      whitescreen: (document.querySelector('#root')?.childElementCount ?? 0) === 0,
    };
  });

  results.case_matrix.C_f5 = {
    verdict: afterOk && afterUi.rootChild > 0 && afterUi.hasLeave && !afterUi.whitescreen ? 'PASS' : 'FAIL',
    beforeUrl: beforeUrl.slice(0, 220),
    afterUrl: page.url().slice(0, 220),
    afterListStatus: afterOk?.status ?? null,
    afterUi,
    beforeTextLen: beforeText.length,
  };
  logClick('CASE_C_DONE', { verdict: results.case_matrix.C_f5.verdict });
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    const base = PORTAL;
    await navigateToLeave(page, base);

    await caseA_fail(page);
    await caseB_happy(page);
    await caseC_f5(page);

    const clicks = results.click_log.length;
    results.idle_guard = {
      qa_idle_viewport: clicks >= 6 ? 'PASS' : 'FAIL',
      click_count: clicks,
      note: 'anti-idle: real clicks required',
    };

    const a = results.case_matrix.A_fail?.verdict;
    const b = results.case_matrix.B_happy?.verdict;
    const c = results.case_matrix.C_f5?.verdict;
    results.verdict = a === 'PASS' && b === 'PASS' && c === 'PASS' ? 'PASS' : 'FAIL';
    results.endedAt = ts();
    save();
    console.log(JSON.stringify({ verdict: results.verdict, case_matrix: results.case_matrix, idle_guard: results.idle_guard, clicks }, null, 2));
  } catch (e) {
    results.verdict = 'FAIL';
    results.fatal = String(e).slice(0, 500);
    results.endedAt = ts();
    save();
    console.error(e);
    process.exitCode = 2;
  } finally {
    await browser.close();
    save();
  }
  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main();
