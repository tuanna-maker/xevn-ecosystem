#!/usr/bin/env node
/**
 * PO-UAT-ATT-01 — U65 browser UAT pack (leave→sheet funnel + sheets chrome)
 * AC-01 create→Duyệt→materialize+F5 · AC-02 cancel markers clear · AC-03 409 LOCKED
 * J-HRM-06b storm ≤2 · J-HRM-06c smoke if reachable · sheets list/open no storm/empty-FAIL
 * Persona: ceo@xe.vn · company_id=main · attendance_uat_ready=false · no seed · no Option C
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const CEO = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const OU = 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-att-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-att-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `UATAT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** Fresh Dec/Jan window — avoid prior UAT leftovers; try candidates on OVERLAP. */
const LEAVE_DATE_PAIRS = [
  ['2027-02-08', '2027-02-09'],
  ['2027-02-10', '2027-02-11'],
  ['2027-03-02', '2027-03-03'],
  ['2026-12-28', '2026-12-29'],
  ['2027-01-12', '2027-01-13'],
];
const LEAVE_START = LEAVE_DATE_PAIRS[0][0];
const LEAVE_END = LEAVE_DATE_PAIRS[0][1];
const LOCK_LEAVE_START = '2026-09-12';
const LOCK_LEAVE_END = '2026-09-12';
/** Prefer days inside known closed Sept sheet; skip OVERLAP leftovers from prior UAT. */
const LOCK_DATE_CANDIDATES = [
  '2026-09-23',
  '2026-09-24',
  '2026-09-25',
  '2026-09-26',
  '2026-09-08',
  '2026-09-09',
  '2026-09-10',
  '2026-09-11',
];

const results = {
  work_item_id: 'PO-UAT-ATT-01',
  parent: 'PO-UAT-MODULES-PARALLEL-01',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  attendance_uat_ready: false,
  WAIVE_L2: true,
  LV_02: 'WAIVED_P1 — not claimed 🟢',
  Option_C: 'cấm as SoT',
  env: { PORTAL, HRM, CEO, OU, STAMP, commit: COMMIT },
  l0: {},
  steps: {},
  network: [],
  leave: { create: null, approve: null, cancel: null, lockCreate: null, lockApprove: null },
  weekly: {
    beforeCancelLeaveCount: null,
    afterApproveF5LeaveCount: null,
    afterCancelLeaveCount: null,
    afterCancelF5LeaveCount: null,
    leaveLabelSample: null,
    feStatusAfterCancel: null,
    feStatusAfterF5: null,
  },
  sheets: {
    listVisible: null,
    addCtaVisible: null,
    rowCount: null,
    openOk: null,
    openStormCount: null,
    emptyFailClass: null,
    navCtaObs: null,
  },
  j06c: { reachable: null, panelVisible: null, closeBtnVisible: null, verdict: null, note: null },
  stormWindow: null,
  sheetsStormWindow: null,
  ac: {
    'AC-ATT-LV-SHEET-01': null,
    'AC-ATT-LV-SHEET-02': null,
    'AC-ATT-LV-SHEET-03': null,
    'J-HRM-06b': null,
    'J-HRM-06c': null,
    'SHEETS-CHROME': null,
  },
  hdsd: {
    cancelBtn: 'hdsd-leave-list-cancel-{id}',
    confirmBtn: 'hdsd-leave-cancel-confirm',
    dialog: 'att-leave-cancel-dialog-precision',
    observed: {},
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residual: [],
  obs: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function step(id, verdict, summary, extra = {}) {
  results.steps[id] = { verdict, summary, ...extra, at: ts() };
  console.log(`${verdict} ${id} — ${summary}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}
function attUrl(extra = '') {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_uatatt=${Date.now()}${extra}`;
}

async function l0() {
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    results.l0[name] = r ? r.status : 'ERR';
  }
  const ok = results.l0.hrm === 200 && results.l0.portal === 200;
  step('L0', ok ? 'PASS' : 'FAIL', JSON.stringify(results.l0));
  return ok;
}

async function login() {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: CEO, password: PASS }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`login ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  const d = j?.data ?? j;
  const token = d.access_token ?? d.accessToken;
  const mem = d.active_membership ?? d.memberships?.[0] ?? {};
  return {
    token,
    companyId: mem.company_id || OU,
    user: {
      userId: mem.employee_id || CEO,
      email: CEO,
      displayName: mem.employee_name || 'CEO',
      roles: d.roles || [],
    },
    expiresAt: Date.now() + 8e6,
  };
}

async function inject(page, s) {
  await page.addInitScript(
    ({ s, ou }) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', JSON.stringify(s.user));
        store.setItem('xevn.portal.companyId', ou);
        store.setItem('hrm_current_company_id', ou);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s, ou: OU },
  );
}

function attachNet(page, mode = 'all') {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/attendance\//.test(u)) return;
    const m = res.request().method();
    const path = u.replace(PORTAL, '').replace(HRM, '').slice(0, 220);
    const entry = { method: m, status: res.status(), url: path, at: ts(), mode };
    results.network.push(entry);

    if (m === 'POST' && /leave-requests(\?|$)/.test(u) && !/\/(approve|reject|cancel)/.test(u)) {
      const j = await res.json().catch(() => ({}));
      const payload = {
        status: res.status(),
        code: j?.code,
        id: j?.data?.id ?? j?.data?.request_id,
        start: j?.data?.start_date ?? j?.data?.from_date,
        end: j?.data?.end_date ?? j?.data?.to_date,
      };
      if (mode === 'lock') results.leave.lockCreate = payload;
      else results.leave.create = payload;
    }
    if (m === 'POST' && /leave-requests\/[^/]+\/approve/.test(u)) {
      const j = await res.json().catch(() => ({}));
      const payload = {
        status: res.status(),
        code: j?.code,
        message: String(j?.message ?? '').slice(0, 180),
        requestStatus: j?.data?.status,
        materialized_days: j?.data?.materialized_days,
      };
      if (mode === 'lock') results.leave.lockApprove = payload;
      else results.leave.approve = payload;
    }
    if (m === 'POST' && /leave-requests\/[^/]+\/cancel/.test(u)) {
      const j = await res.json().catch(() => ({}));
      results.leave.cancel = {
        status: res.status(),
        code: j?.code,
        message: String(j?.message ?? '').slice(0, 180),
        requestStatus: j?.data?.status,
        via: 'browser-network',
      };
    }
  });
}

async function openTab(page, nameRe) {
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: nameRe })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(1800);
}

async function openLeaveTab(page) {
  await openTab(page, /^Nghỉ phép$/i);
  await sleep(1200);
}

async function fillViDate(page, locator, isoYmd) {
  const [y, m, d] = isoYmd.split('-');
  const vi = `${d}/${m}/${y}`;
  const el = locator.first();
  if (!(await el.isVisible().catch(() => false))) return false;
  await el.click({ force: true });
  await el.fill('').catch(() => {});
  await el.fill(vi).catch(async () => {
    await el.press('Control+A').catch(() => {});
    await el.type(vi, { delay: 20 }).catch(() => {});
  });
  await el.press('Tab').catch(() => {});
  await sleep(300);
  return true;
}

async function createLeave(page, startIso, endIso, reasonTag, destKey) {
  await openLeaveTab(page);
  await shot(page, destKey === 'lock' ? '10-leave-tab-lock' : '01-leave-tab');
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).first();
  if (!(await createBtn.isVisible().catch(() => false))) {
    const sync = page.getByTestId('hdsd-leave-sync-catalog');
    if (await sync.isVisible().catch(() => false)) {
      await sync.click({ force: true }).catch(() => {});
      await sleep(2500);
    }
  }
  if (!(await createBtn.isVisible().catch(() => false))) {
    step(destKey === 'lock' ? 'LOCK-CREATE-CTA' : 'LEAVE-CREATE-CTA', 'BLOCKED', 'No create CTA');
    return false;
  }
  await createBtn.click({ force: true });
  await sleep(1500);
  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) {
    step(destKey === 'lock' ? 'LOCK-DIALOG' : 'LEAVE-DIALOG', 'FAIL', 'dialog missing');
    return false;
  }
  for (let i = 0; i < 3; i++) {
    const c = dlg.locator('button[role="combobox"]').nth(i);
    if (await c.isVisible().catch(() => false)) {
      await c.click();
      await sleep(600);
      const prefer = page.getByRole('option').filter({ hasText: /UAT-0100|UAT.?0100/i });
      if ((await prefer.count()) > 0) {
        await prefer.first().click({ force: true });
      } else {
        const opt = page.getByRole('option').first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
      }
      await sleep(400);
    }
  }
  const reason =
    (await dlg.getByTestId('hdsd-leave-reason').count()) > 0
      ? dlg.getByTestId('hdsd-leave-reason')
      : dlg.locator('textarea').first();
  if (await reason.isVisible().catch(() => false)) {
    await reason.fill(`${reasonTag} ${STAMP}`);
  }
  const dateInputs = dlg.locator(
    'input[type="date"], input[placeholder*="ngày" i], input[placeholder*="dd" i], input[inputmode="numeric"]',
  );
  const nDates = await dateInputs.count();
  if (nDates >= 2) {
    const t0 = await dateInputs.nth(0).getAttribute('type');
    if (t0 === 'date') {
      await dateInputs.nth(0).fill(startIso).catch(() => {});
      await dateInputs.nth(1).fill(endIso).catch(() => {});
    } else {
      await fillViDate(page, dateInputs.nth(0), startIso);
      await fillViDate(page, dateInputs.nth(1), endIso);
    }
  }
  await shot(page, destKey === 'lock' ? '11-leave-lock-dialog' : '02-leave-dialog');
  await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true });
  await sleep(4500);
  const created = destKey === 'lock' ? results.leave.lockCreate : results.leave.create;
  const ok = created && created.status >= 200 && created.status < 300;
  step(
    destKey === 'lock' ? 'LOCK-LEAVE-CREATE' : 'LEAVE-CREATE',
    ok ? 'PASS' : 'FAIL',
    ok ? `POST ${created.status} ${created.code} id=${created.id}` : JSON.stringify(created),
  );
  await shot(page, destKey === 'lock' ? '12-after-lock-create' : '03-after-leave-create');
  return ok;
}

async function approveLeave(page, leaveId, destKey) {
  await openLeaveTab(page);
  await openTab(page, /Chờ duyệt|Approval|Duyệt/i);
  await sleep(2000);
  let clicked = false;
  if (leaveId) {
    const byId = page.getByTestId(`hdsd-leave-list-approve-${leaveId}`);
    if ((await byId.count()) > 0 && (await byId.first().isVisible().catch(() => false))) {
      await byId.first().click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    const stampHit = page.locator('div,tr,li,article').filter({ hasText: STAMP });
    if ((await stampHit.count()) > 0) {
      const b = stampHit.first().getByRole('button', { name: /^Duyệt$/i }).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click({ force: true });
        clicked = true;
      }
    }
  }
  if (!clicked) {
    const b = page.getByRole('button', { name: /^Duyệt$/i }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true });
      clicked = true;
    }
  }
  await sleep(4500);
  await shot(page, destKey === 'lock' ? '13-after-lock-approve' : '04-after-approve');
  const appr = destKey === 'lock' ? results.leave.lockApprove : results.leave.approve;
  return { clicked, appr };
}

async function probeLeaveRecords(session, leaveId, from, to) {
  const q = new URLSearchParams({
    company_id: OU,
    from_date: from,
    to_date: to,
    page_size: '200',
  });
  const r = await fetch(`${HRM}/api/hrm/attendance/records?${q}`, {
    headers: { Authorization: `Bearer ${session.token}`, 'x-company-id': OU },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data ?? j?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  const leaveRows = arr.filter(
    (x) => String(x.status) === 'leave' && (!leaveId || x.leave_request_id === leaveId),
  );
  return {
    status: r.status,
    leave_count: leaveRows.length,
    sample: leaveRows.slice(0, 5).map((x) => ({
      date: x.attendance_date ?? x.date ?? x.work_date,
      status: x.status,
      leave_request_id: x.leave_request_id,
    })),
  };
}

async function openRequestListTab(page) {
  const tab = page.getByRole('tab', { name: /Danh sách yêu cầu/i });
  if ((await tab.count()) > 0) {
    await tab.first().click({ force: true });
  } else {
    await page
      .locator('[role="tab"]')
      .filter({ hasText: /^Danh sách yêu cầu$/i })
      .first()
      .click({ force: true })
      .catch(() => {});
  }
  await sleep(2000);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
}

async function cancelLeaveViaFe(page, leaveId) {
  await openLeaveTab(page);
  await openRequestListTab(page);
  await shot(page, '05a-request-list-tab');

  // Skip status filter — "Tất cả" already shows approved; avoid opening OU rollup.
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  await shot(page, '05b-request-list-filtered');

  const cancelTestId = `hdsd-leave-list-cancel-${leaveId}`;
  results.hdsd.observed.cancelTestId = cancelTestId;
  let cancelBtn = page.getByTestId(cancelTestId);
  let visible = (await cancelBtn.count()) > 0;
  results.hdsd.observed.cancelCount = await cancelBtn.count();

  if (!visible) {
    const row = page.locator('tr').filter({ hasText: STAMP });
    results.hdsd.observed.stampRows = await row.count();
    if ((await row.count()) > 0) {
      await row.first().scrollIntoViewIfNeeded().catch(() => {});
      cancelBtn = row.first().getByRole('button', { name: /Hủy đơn/i });
      visible = (await cancelBtn.count()) > 0;
      if (visible) results.hdsd.observed.cancelVia = 'stamp-row-button';
    }
  }

  if (!visible) {
    const viewBtn = page
      .locator('tr')
      .filter({ hasText: STAMP })
      .getByRole('button', { name: /^Xem$/i })
      .first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click({ force: true });
      await sleep(1200);
      cancelBtn = page.getByTestId(cancelTestId);
      visible = (await cancelBtn.count()) > 0;
      if (visible) results.hdsd.observed.cancelVia = 'detail-dialog';
    }
  }

  if (!visible) {
    results.hdsd.observed.cancelBtnVisible = false;
    step('LEAVE-CANCEL-CONFIRM', 'FAIL', 'Hủy đơn CTA not found');
    return false;
  }

  await cancelBtn.last().scrollIntoViewIfNeeded().catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  await cancelBtn.last().click({ timeout: 5000 }).catch(async () => {
    await cancelBtn.last().click({ force: true });
  });
  results.hdsd.observed.cancelVia = results.hdsd.observed.cancelVia || 'hdsd-testid';
  results.hdsd.observed.cancelBtnVisible = true;

  const confirm = page.getByTestId('hdsd-leave-cancel-confirm');
  const dialog = page.getByTestId('att-leave-cancel-dialog-precision');
  let dialogVisible = false;
  let confirmVisible = false;
  try {
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    dialogVisible = true;
  } catch {
    /* */
  }
  try {
    await confirm.waitFor({ state: 'visible', timeout: 3000 });
    confirmVisible = true;
  } catch {
    const alt = page.locator('[role="alertdialog"] button').filter({ hasText: /Hủy đơn/i });
    confirmVisible = (await alt.count()) > 0 && (await alt.last().isVisible().catch(() => false));
    if (confirmVisible) results.hdsd.observed.confirmVia = 'alertdialog-button';
  }
  results.hdsd.observed.dialogVisible = dialogVisible;
  results.hdsd.observed.confirmVisible = confirmVisible;
  results.hdsd.observed.alertdialogCount = await page.locator('[role="alertdialog"]').count();
  await shot(page, '05-cancel-dialog');

  if (!confirmVisible) {
    await page.evaluate((tid) => {
      const el = document.querySelector(`[data-testid="${tid}"]`);
      if (el instanceof HTMLElement) el.click();
    }, cancelTestId);
    await sleep(1000);
    confirmVisible =
      ((await confirm.count()) > 0 && (await confirm.first().isVisible().catch(() => false))) ||
      (await page.locator('[role="alertdialog"]').count()) > 0;
    results.hdsd.observed.confirmVisible = confirmVisible;
    results.hdsd.observed.domClickRetry = true;
    await shot(page, '05c-cancel-dialog-retry');
  }

  if (!confirmVisible) {
    step(
      'LEAVE-CANCEL-CONFIRM',
      'FAIL',
      `dialog=${dialogVisible} confirm missing; alertdialog=${results.hdsd.observed.alertdialogCount}`,
    );
    return false;
  }

  results.leave.cancel = null;
  if (results.hdsd.observed.confirmVia === 'alertdialog-button') {
    await page
      .locator('[role="alertdialog"] button')
      .filter({ hasText: /Hủy đơn/i })
      .last()
      .click({ force: true });
  } else {
    await confirm.last().click({ force: true });
  }
  await sleep(5000);
  await shot(page, '06-after-cancel-click');

  const cancel = results.leave.cancel;
  const ok = cancel && cancel.status >= 200 && cancel.status < 300;
  step(
    'LEAVE-CANCEL',
    ok ? 'PASS' : 'FAIL',
    ok
      ? `POST cancel ${cancel.status} ${cancel.code} status=${cancel.requestStatus}`
      : `cancel=${JSON.stringify(cancel)} expect 2xx HRM-LEAVE-205`,
  );
  return ok;
}

async function readFeLeaveStatus(page, leaveId) {
  await openLeaveTab(page);
  await openRequestListTab(page);
  await sleep(800);
  const filterTrig = page
    .locator('button')
    .filter({ hasText: /Tất cả|Đã duyệt|Đã hủy|Chờ duyệt|Đã từ chối/i })
    .first();
  if (await filterTrig.isVisible().catch(() => false)) {
    await filterTrig.click({ force: true }).catch(() => {});
    await sleep(300);
    const cancelOpt = page.getByRole('option', { name: /^Đã hủy$/i });
    if ((await cancelOpt.count()) > 0) {
      await cancelOpt.first().click({ force: true }).catch(() => {});
      await sleep(800);
    } else {
      const allOpt = page.getByRole('option', { name: /^Tất cả$/i });
      if ((await allOpt.count()) > 0) await allOpt.first().click({ force: true }).catch(() => {});
      await sleep(600);
    }
  }
  const body = await page.locator('body').innerText().catch(() => '');
  const hasCancelledChip =
    /Đã hủy|Cancelled|cancelled/i.test(body) &&
    ((await page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`).count()) === 0 ||
      !(await page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`).first().isVisible().catch(() => false)));
  // Prefer row text near stamp
  const stampRow = page.locator('tr,div').filter({ hasText: STAMP });
  let rowText = '';
  if ((await stampRow.count()) > 0) {
    rowText = (await stampRow.first().innerText().catch(() => '')).slice(0, 240);
  }
  return {
    hasCancelledChip,
    rowText,
    cancelBtnGone:
      (await page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`).count()) === 0 ||
      !(await page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`).first().isVisible().catch(() => false)),
  };
}

async function measureStorm(page) {
  const t0 = Date.now();
  const hits = [];
  const handler = (res) => {
    const u = res.url();
    const m = res.request().method();
    if (m !== 'GET') return;
    if (!/attendance\/(records|attendance-sheets)/.test(u)) return;
    hits.push({ t: Date.now() - t0, url: u.replace(PORTAL, '').slice(0, 120), status: res.status() });
  };
  page.on('response', handler);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(10000);
  page.off('response', handler);
  const in10 = hits.filter((h) => h.t <= 10000);
  results.stormWindow = { windowMs: 10000, getHits: in10, count: in10.length, limit: 2 };
  const pass = in10.length <= 2;
  step('J-HRM-06b', pass ? 'PASS' : 'FAIL', `GET records+sheets in 10s = ${in10.length} (limit ≤2)`);
  results.ac['J-HRM-06b'] = pass ? 'PASS' : 'FAIL';
  return pass;
}

async function openAttendanceMenuItem(page, labelRe) {
  const menu = page.getByTestId('attendance-tab-menu');
  if (await menu.isVisible().catch(() => false)) {
    await menu.click();
    await sleep(500);
  } else {
    // Fallback: top tab "Chấm công" then submenu if present
    await openTab(page, /^Chấm công$/i);
    await sleep(800);
  }
  const byText = page.locator('[role="menu"], [data-radix-menu-content], [role="listbox"]').getByText(labelRe).first();
  if ((await byText.count()) > 0) {
    await byText.click({ timeout: 8_000 }).catch(() => {});
    await sleep(1200);
    return;
  }
  const items = page.locator('[role="menuitem"]');
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    const text = ((await items.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await items.nth(i).click();
      await sleep(1200);
      return;
    }
  }
}

async function openSheetsTab(page) {
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page
    .locator('[data-testid="att-sheets-precision"]')
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => null);
}

async function probeSheetsChrome(page) {
  await openSheetsTab(page);
  await shot(page, '20-sheets-list');

  const precision = page.getByTestId('att-sheets-precision');
  const listVisible =
    (await precision.isVisible().catch(() => false)) ||
    (await page.locator('table').filter({ hasText: /Kỳ|Tháng|Sheet|Bảng/i }).first().isVisible().catch(() => false));
  const addCta = page.getByTestId('att-sheets-add');
  const addCtaVisible = await addCta.isVisible().catch(() => false);
  results.sheets.listVisible = listVisible;
  results.sheets.addCtaVisible = addCtaVisible;
  if (!addCtaVisible) {
    results.sheets.navCtaObs = 'R-ATT-SHEET-NAV-CTA — att-sheets-add not visible';
    results.obs.push('R-ATT-SHEET-NAV-CTA');
  }

  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr, table tbody tr').filter({
    hasText: /2026|Công chuẩn|draft|submitted|closed|Đã chốt|Chờ/i,
  });
  const rowCount = await rows.count().catch(() => 0);
  results.sheets.rowCount = rowCount;

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const emptyFailClass =
    /Không có dữ liệu|Failed to load|HRM API|Sync ERROR|Uncaught|54321/i.test(bodyText) &&
    rowCount === 0 &&
    /auto.?reload|Tải lại/i.test(bodyText);
  // Sponsor empty FAIL class: empty + auto-reload storm — detect via repeated GETs after open
  results.sheets.emptyFailClass = emptyFailClass;

  // Storm on sheets tab: measure GET sheets after click-open first row if present
  const t0 = Date.now();
  const hits = [];
  const handler = (res) => {
    const u = res.url();
    if (res.request().method() !== 'GET') return;
    if (!/attendance-sheets|attendance\/records/.test(u)) return;
    hits.push({ t: Date.now() - t0, url: u.replace(PORTAL, '').slice(0, 140), status: res.status() });
  };
  page.on('response', handler);

  let openOk = false;
  if (rowCount > 0) {
    const openBtn = rows.first().getByRole('button', { name: /Mở|Open|Xem|Chi tiết/i }).first();
    if (await openBtn.isVisible().catch(() => false)) {
      await openBtn.click({ force: true });
      openOk = true;
    } else {
      await rows.first().click({ force: true }).catch(() => {});
      openOk = true;
    }
    await sleep(3500);
    await shot(page, '21-sheets-open');
  } else {
    // Stay on list — still measure idle storm 8s
    await sleep(8000);
  }
  page.off('response', handler);
  const inWin = hits.filter((h) => h.t <= 8000);
  results.sheetsStormWindow = { windowMs: 8000, count: inWin.length, getHits: inWin.slice(0, 12), limit: 4 };
  results.sheets.openOk = openOk;
  results.sheets.openStormCount = inWin.length;

  const stormOk = inWin.length <= 4;
  const noEmptyFail =
    !emptyFailClass &&
    !(rowCount === 0 && inWin.length > 4) &&
    !results.pageErrors.some((e) => /Uncaught|ReferenceError/i.test(e));
  const chromePass = listVisible && stormOk && noEmptyFail;
  results.ac['SHEETS-CHROME'] = chromePass ? 'PASS' : 'FAIL';
  step(
    'SHEETS-CHROME',
    chromePass ? 'PASS' : 'FAIL',
    `list=${listVisible} addCta=${addCtaVisible} rows=${rowCount} open=${openOk} storm=${inWin.length} emptyFail=${emptyFailClass}`,
  );
  return chromePass;
}

async function smokeJHrm06c(page) {
  await openSheetsTab(page);
  await sleep(1500);
  // Prefer submitted / awaiting sign — do not create/seed under U65
  const submitted = page
    .locator('[data-testid="att-sheets-precision"] tbody tr, table tbody tr')
    .filter({ hasText: /submitted|Chờ ký|Chờ chốt|Đã gửi/i });
  const anyRow = page.locator('[data-testid="att-sheets-precision"] tbody tr, table tbody tr').filter({
    hasText: /2026|Công chuẩn|closed|Đã chốt|draft/i,
  });
  let target = submitted;
  if ((await submitted.count()) === 0) target = anyRow;
  if ((await target.count()) === 0) {
    results.j06c = {
      reachable: false,
      panelVisible: false,
      closeBtnVisible: false,
      verdict: 'SKIP',
      note: 'No sheet row reachable without seed — J-HRM-06c smoke SKIP (prior map PASS retained)',
    };
    results.ac['J-HRM-06c'] = 'SKIP';
    step('J-HRM-06c', 'SKIP', results.j06c.note);
    return 'SKIP';
  }
  const openBtn = target.first().getByRole('button', { name: /Mở|Open|Xem|Chi tiết|Ký/i }).first();
  if (await openBtn.isVisible().catch(() => false)) {
    await openBtn.click({ force: true });
  } else {
    await target.first().click({ force: true });
  }
  await sleep(3500);
  await shot(page, '22-j06c-open');
  const signPanel =
    (await page.getByTestId('att-sign-panel').isVisible().catch(() => false)) ||
    (await page.getByText(/Ký xác nhận|Chữ ký|NV ký|QL ký|HCNS/i).first().isVisible().catch(() => false));
  const closeBtn = page.getByTestId('att-sign-close-sheet');
  const closeVisible = await closeBtn.isVisible().catch(() => false);
  const khoaPath =
    (await page.getByRole('button', { name: /Chốt|Khóa bảng|Xác nhận/i }).first().isVisible().catch(() => false)) ||
    closeVisible;
  results.j06c = {
    reachable: true,
    panelVisible: signPanel,
    closeBtnVisible: closeVisible || khoaPath,
    verdict: signPanel || khoaPath ? 'PASS' : 'OBS',
    note: signPanel || khoaPath
      ? 'Sheet open → sign/Chốt controls visible (smoke, no mutate)'
      : 'Sheet opened but sign/Chốt panel not visible — OBS soft',
  };
  results.ac['J-HRM-06c'] = results.j06c.verdict === 'PASS' ? 'PASS' : results.j06c.verdict === 'OBS' ? 'OBS' : 'SKIP';
  if (results.j06c.verdict === 'OBS') results.obs.push('OBS-J-HRM-06c-PANEL');
  step('J-HRM-06c', results.ac['J-HRM-06c'], results.j06c.note);
  return results.ac['J-HRM-06c'];
}

async function main() {
  const okL0 = await l0();
  if (!okL0) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await login();
  step('LOGIN', 'PASS', `ceo@ ou=${session.companyId}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    attachNet(page, 'all');
    await inject(page, session);
    await page.goto(attUrl('&hard=1'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(5000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(4000);

    // —— AC-01 materialize FIRST (clean leave tab; before sheets nav) ——
    await openLeaveTab(page);
    await sleep(1200);

    let leaveOk = false;
    let leavePair = [LEAVE_START, LEAVE_END];
    for (const [s, e] of LEAVE_DATE_PAIRS) {
      results.leave.create = null;
      results.leave.approve = null;
      // Recover from prior OVERLAP dialog
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(400);
      await page.locator('[role="dialog"] button').filter({ hasText: /Đóng|Hủy|Close/i }).first().click({ force: true }).catch(() => {});
      await sleep(400);
      await openLeaveTab(page);
      const ok = await createLeave(page, s, e, `QA UAT-ATT AC-01 ${s}`, 'main');
      if (ok) {
        leaveOk = true;
        leavePair = [s, e];
        results.leaveDateUsed = { start: s, end: e };
        break;
      }
      const code = results.leave.create?.code || '';
      if (/OVERLAP/i.test(String(code))) {
        step('LEAVE-DATE-SKIP', 'OBS', `overlap ${s}..${e} — try next`);
        continue;
      }
      break;
    }
    let approveOk = false;
    let matDays = [];
    if (leaveOk) {
      const { clicked, appr } = await approveLeave(page, results.leave.create?.id, 'main');
      matDays = Array.isArray(appr?.materialized_days) ? appr.materialized_days : [];
      approveOk =
        clicked &&
        appr &&
        appr.status >= 200 &&
        appr.status < 300 &&
        appr.status !== 409 &&
        matDays.length > 0;
      step(
        'LEAVE-APPROVE',
        approveOk ? 'PASS' : 'FAIL',
        approveOk
          ? `POST approve ${appr.status} ${appr.code} mat=${JSON.stringify(matDays)}`
          : `clicked=${clicked} appr=${JSON.stringify(appr)}`,
      );
    } else {
      step('LEAVE-APPROVE', 'SKIP', 'no create');
    }

    const leaveId = results.leave.create?.id;
    const beforeProbe = await probeLeaveRecords(session, leaveId, leavePair[0], leavePair[1]);
    results.weekly.beforeCancelLeaveCount = beforeProbe.leave_count;
    results.weekly.leaveLabelSample = beforeProbe.sample;
    const datesOk =
      beforeProbe.leave_count > 0 &&
      (beforeProbe.sample || []).every((r) => /^\d{4}-\d{2}-\d{2}/.test(String(r.date ?? '')));
    step(
      'RECORDS-BEFORE-CANCEL',
      beforeProbe.status === 200 && beforeProbe.leave_count > 0 && datesOk ? 'PASS' : 'FAIL',
      `GET ${beforeProbe.status} leave=${beforeProbe.leave_count} sample=${JSON.stringify(beforeProbe.sample)}`,
    );

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    const f5Probe = await probeLeaveRecords(session, leaveId, leavePair[0], leavePair[1]);
    results.weekly.afterApproveF5LeaveCount = f5Probe.leave_count;
    await shot(page, '04b-ac01-after-f5');
    const f5Ok = f5Probe.leave_count > 0 && f5Probe.leave_count === beforeProbe.leave_count;

    const ac01 = leaveOk && approveOk && matDays.length > 0 && beforeProbe.leave_count > 0 && datesOk && f5Ok;
    results.ac['AC-ATT-LV-SHEET-01'] = ac01 ? 'PASS' : 'FAIL';
    step(
      'AC-ATT-LV-SHEET-01',
      ac01 ? 'PASS' : 'FAIL',
      `materialize leave=${leaveOk} approve=${approveOk} mat=${matDays.length} rows=${beforeProbe.leave_count} f5=${f5Probe.leave_count} dates=${leavePair.join('..')}`,
    );

    // —— AC-02 FE cancel ——
    let ac02 = false;
    if (approveOk && leaveId) {
      const cancelOk = await cancelLeaveViaFe(page, leaveId);
      const afterProbe = await probeLeaveRecords(session, leaveId, leavePair[0], leavePair[1]);
      results.weekly.afterCancelLeaveCount = afterProbe.leave_count;

      const feAfter = await readFeLeaveStatus(page, leaveId);
      results.weekly.feStatusAfterCancel = feAfter;
      await shot(page, '07-fe-after-cancel');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(4000);
      const afterF5 = await probeLeaveRecords(session, leaveId, leavePair[0], leavePair[1]);
      results.weekly.afterCancelF5LeaveCount = afterF5.leave_count;
      const feF5 = await readFeLeaveStatus(page, leaveId);
      results.weekly.feStatusAfterF5 = feF5;
      await shot(page, '08-fe-after-f5');

      const cancelNet = results.leave.cancel;
      const cancel2xx = cancelNet && cancelNet.status >= 200 && cancelNet.status < 300;
      const codeOk = !cancelNet?.code || /HRM-LEAVE-205|LEAVE-205|205/i.test(String(cancelNet.code));
      const markersCleared = afterProbe.leave_count === 0 && afterF5.leave_count === 0;
      const statusCancelled =
        /cancelled|đã hủy/i.test(String(cancelNet?.requestStatus ?? '')) ||
        /Đã hủy|cancelled/i.test(feAfter.rowText || '') ||
        /Đã hủy|cancelled/i.test(feF5.rowText || '') ||
        feAfter.cancelBtnGone;

      ac02 = Boolean(cancelOk && cancel2xx && codeOk && markersCleared && statusCancelled);
      results.ac['AC-ATT-LV-SHEET-02'] = ac02 ? 'PASS' : 'FAIL';
      step(
        'AC-ATT-LV-SHEET-02',
        ac02 ? 'PASS' : 'FAIL',
        `cancelOk=${cancelOk} net=${JSON.stringify(cancelNet)} before=${beforeProbe.leave_count} after=${afterProbe.leave_count} f5=${afterF5.leave_count} fe=${JSON.stringify(feAfter)}`,
      );
      if (!cancelOk) results.residual.push('R-ATT-LV-SHEET-02-FE-CANCEL');
      if (cancelOk && !markersCleared) results.residual.push('R-ATT-LV-SHEET-02-MARKERS-REMAIN');
    } else {
      results.ac['AC-ATT-LV-SHEET-02'] = 'SKIP';
      step('AC-ATT-LV-SHEET-02', 'SKIP', 'approve not PASS — cancel not run');
      results.residual.push('R-ATT-LV-SHEET-02-BLOCKED-BY-AC01');
    }

    await measureStorm(page);
    await shot(page, '09-storm');

    // —— Sheets chrome + J-HRM-06c AFTER leave funnel ——
    await page.goto(attUrl('&sheets=1'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(3500);
    await probeSheetsChrome(page);
    await smokeJHrm06c(page);
    await shot(page, '23-sheets-done');
    await ctx.close();

    // —— AC-03 LOCKED quick ——
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page2 = await ctx2.newPage();
    attachNet(page2, 'lock');
    await inject(page2, session);
    await page2.goto(attUrl('&lock=1'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(4500);

    const lockCreateOk = await (async () => {
      for (const d of LOCK_DATE_CANDIDATES) {
        results.leave.lockCreate = null;
        results.leave.lockApprove = null;
        await page2.keyboard.press('Escape').catch(() => {});
        await sleep(400);
        const ok = await createLeave(page2, d, d, `QA UAT-ATT LOCK AC-03 ${d}`, 'lock');
        if (ok) {
          results.lockDateUsed = d;
          return true;
        }
        const code = results.leave.lockCreate?.code || '';
        await page2.keyboard.press('Escape').catch(() => {});
        await sleep(400);
        if (/OVERLAP/i.test(String(code))) {
          step('LOCK-DATE-SKIP', 'OBS', `overlap on ${d} — try next`);
          continue;
        }
        return false;
      }
      return false;
    })();
    let ac03 = false;
    if (lockCreateOk) {
      const lockDay = results.lockDateUsed || LOCK_LEAVE_START;
      const { clicked, appr } = await approveLeave(page2, results.leave.lockCreate?.id, 'lock');
      const locked =
        appr &&
        appr.status === 409 &&
        /HRM-ATT-SHEET-LOCKED|LOCKED/i.test(`${appr.code} ${appr.message}`);
      ac03 = clicked && locked;
      results.ac['AC-ATT-LV-SHEET-03'] = ac03 ? 'PASS' : 'FAIL';
      step(
        'AC-ATT-LV-SHEET-03',
        ac03 ? 'PASS' : 'FAIL',
        `day=${lockDay} clicked=${clicked} approve=${JSON.stringify(appr)} expect 409 HRM-ATT-SHEET-LOCKED`,
      );
    } else {
      results.ac['AC-ATT-LV-SHEET-03'] = 'SKIP';
      step('AC-ATT-LV-SHEET-03', 'SKIP', 'could not create leave overlapping closed Sept (all candidates OVERLAP or blocked)');
    }
    await shot(page2, '15-ac03-done');
    await ctx2.close();
  } finally {
    await browser.close();
  }

  const a1 = results.ac['AC-ATT-LV-SHEET-01'];
  const a2 = results.ac['AC-ATT-LV-SHEET-02'];
  const a3 = results.ac['AC-ATT-LV-SHEET-03'];
  const storm = results.ac['J-HRM-06b'];
  const chrome = results.ac['SHEETS-CHROME'];
  const j06c = results.ac['J-HRM-06c'];
  const hardFail = [a1, a2, a3, storm, chrome].includes('FAIL');
  const softOnly =
    !hardFail &&
    a1 === 'PASS' &&
    a2 === 'PASS' &&
    a3 === 'PASS' &&
    storm === 'PASS' &&
    chrome === 'PASS' &&
    (j06c === 'SKIP' || j06c === 'OBS' || j06c === 'PASS') &&
    results.obs.length > 0;

  if (!hardFail && a1 === 'PASS' && a2 === 'PASS' && a3 === 'PASS' && storm === 'PASS' && chrome === 'PASS') {
    results.verdict = softOnly || j06c === 'OBS' || results.obs.includes('R-ATT-SHEET-NAV-CTA') ? 'PASS_WITH_OBS' : 'PASS';
    results.ack_status =
      results.verdict === 'PASS_WITH_OBS' ? 'PASS_WITH_OBS' : 'PASS_TO_PM';
    // Normalize PASS_WITH_OBS still routes to PM for QC
    if (results.ack_status === 'PASS_WITH_OBS') results.ack_status = 'PASS_WITH_OBS';
  } else {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    if (a1 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-01');
    if (a2 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-02');
    if (a3 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-03');
    if (storm === 'FAIL') results.residual.push('R-J-HRM-06b-STORM');
    if (chrome === 'FAIL') results.residual.push('R-ATT-SHEETS-CHROME');
  }

  results.residual = [...new Set(results.residual)];
  results.obs = [...new Set(results.obs)];
  results.endedAt = ts();
  results.attendance_uat_ready = false;
  save();
  console.log('\n=== SUMMARY PO-UAT-ATT-01 ===');
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        ac: results.ac,
        leave: results.leave,
        weekly: results.weekly,
        sheets: results.sheets,
        j06c: results.j06c,
        storm: results.stormWindow,
        residual: results.residual,
        obs: results.obs,
        STAMP,
        attendance_uat_ready: false,
      },
      null,
      2,
    ),
  );
  process.exit(results.ack_status === 'FAIL_TO_PM' || results.ack_status === 'BLOCKED' ? 1 : 0);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.error = String(e).slice(0, 500);
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
