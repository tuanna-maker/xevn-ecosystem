#!/usr/bin/env node
/**
 * PO-HRM-ATT-LEAVE-FUNNEL-QA-01 R2 — U65 browser (parent BE-02 DATE-EXPAND fix)
 * AC-ATT-LV-SHEET-01..03 + J-HRM-06b storm ≤2 GET records+sheets/10s
 * Persona: ceo@xe.vn · company_id=main · WAIVE_L2 · LV-02 WAIVED_P1 · attendance_uat_ready=false
 * Zero seed. No Option C leave-requests on weekly.
 * R2 gates: materialized_days.length>0 · attendance_date yyyy-MM-dd · AC-03 409 LOCKED
 * AC-02 optional if FE cancel CTA stub — residual only (not hard FAIL alone).
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-att-leave-funnel-qa-01-r2.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-att-leave-funnel-qa-01-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `LVFN-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** Nov 2026 open period — avoid Dec 29 / Oct leftover from BE-02 smoke & R1. */
const SHEET_START = '2026-11-01';
const SHEET_END = '2026-11-30';
const LEAVE_START = '2026-11-18';
const LEAVE_END = '2026-11-19';
/** Overlap closed Sept sheet — avoid 2026-09-25 used by BE-02 smoke. */
const LOCK_LEAVE_START = '2026-09-12';
const LOCK_LEAVE_END = '2026-09-12';

const results = {
  work_item_id: 'PO-HRM-ATT-LEAVE-FUNNEL-QA-01',
  round: 'R2',
  parent: 'PO-HRM-ATT-LEAVE-FUNNEL-BE-02',
  startedAt: ts(),
  u65: 'zero-seed',
  attendance_uat_ready: false,
  WAIVE_L2: true,
  LV_02: 'WAIVED_P1',
  must_keep: {
    'J-HRM-06b': 'storm ≤2 GET records+sheets /10s',
    'J-HRM-06c': 'sign must_keep (not retested mutate)',
    Option_C: 'cấm GET leave-requests on weekly',
  },
  env: { PORTAL, HRM, CEO, OU, STAMP, commit: COMMIT },
  l0: {},
  steps: {},
  network: [],
  stormWindow: null,
  leave: { create: null, approve: null, cancel: null, lockCreate: null, lockApprove: null },
  sheet: { create: null, id: null, open: null },
  weekly: {
    leaveVisible: null,
    leaveVisibleF5: null,
    recordsStatus: null,
    epoch1970: false,
    leaveRequestsOnWeekly: 0,
    leaveLabelSample: null,
    recordsProbe: null,
    dateFormatOk: null,
    badDateSamples: [],
  },
  ac: {
    'AC-ATT-LV-SHEET-01': null,
    'AC-ATT-LV-SHEET-02': null,
    'AC-ATT-LV-SHEET-03': null,
    'J-HRM-06b': null,
    'LV-02': 'WAIVED_P1 — not claimed 🟢',
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residual: [],
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
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_lvfn=${Date.now()}${extra}`;
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
    const path = u.replace(PORTAL, '').replace(HRM, '').slice(0, 200);
    const entry = {
      method: m,
      status: res.status(),
      url: path,
      at: ts(),
      mode,
    };
    results.network.push(entry);

    if (m === 'POST' && /attendance-sheets(\?|$)/.test(u) && !/signatures|close|submit/.test(u)) {
      const j = await res.json().catch(() => ({}));
      results.sheet.create = {
        status: res.status(),
        code: j?.code,
        id: j?.data?.id ?? j?.data?.sheet_id,
      };
      results.sheet.id = results.sheet.create.id;
    }
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
        message: String(j?.message ?? '').slice(0, 160),
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
        requestStatus: j?.data?.status,
      };
    }
    if (m === 'GET' && /\/attendance\/records/.test(u)) {
      entry.records = true;
      const j = await res.json().catch(() => null);
      if (j && (mode === 'weekly' || mode === 'all')) {
        const rows = j?.data?.data ?? j?.data ?? [];
        const arr = Array.isArray(rows) ? rows : [];
        results.weekly.recordsStatus = res.status();
        const leaveRows = arr.filter((r) => String(r.status) === 'leave');
        results.weekly.leaveLabelSample = leaveRows.slice(0, 5).map((r) => ({
          date: r.attendance_date ?? r.date ?? r.work_date,
          status: r.status,
          status_label: r.status_label,
          leave_type_label: r.leave_type_label,
          leave_request_id: r.leave_request_id,
        }));
        const dates = arr.map((r) => String(r.attendance_date ?? r.date ?? r.work_date ?? ''));
        if (dates.some((d) => /1970-01-01|01\/01\/1970/.test(d))) results.weekly.epoch1970 = true;
        const bad = dates.filter((d) => d && !/^\d{4}-\d{2}-\d{2}/.test(d) && !/^\d{2}\/\d{2}\/\d{4}/.test(d));
        // Flag English weekday Date strings like "Thu Oct 08" / "Sat Dec 26"
        const weekdayJunk = dates.filter((d) => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(d));
        results.weekly.badDateSamples = [...new Set([...bad, ...weekdayJunk])].slice(0, 5);
        results.weekly.dateFormatOk =
          leaveRows.length === 0 ||
          leaveRows.every((r) => {
            const d = String(r.attendance_date ?? r.date ?? r.work_date ?? '');
            return /^\d{4}-\d{2}-\d{2}/.test(d) && !/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(d);
          });
      }
    }
    if (m === 'GET' && /leave-requests/.test(u) && mode === 'weekly') {
      results.weekly.leaveRequestsOnWeekly += 1;
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
  await sleep(2000);
}

async function openLeaveTab(page) {
  await openTab(page, /^Nghỉ phép$/i);
  await sleep(1500);
}

async function fillViDate(page, locator, isoYmd) {
  // ViDatePicker often uses text input dd/MM/yyyy
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

async function createDraftSheet(page) {
  await openTab(page, /Bảng chấm công|Chấm công|Sheets/i);
  // submenu sheets if nested
  const sheetsBtn = page.getByTestId('att-sheets-add');
  // may need click menu "Bảng chấm công"
  const menuSheets = page.locator('button,a,[role="menuitem"],[role="tab"]').filter({
    hasText: /Bảng chấm công/i,
  });
  if ((await menuSheets.count()) > 0) {
    await menuSheets.first().click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  if (!(await sheetsBtn.isVisible().catch(() => false))) {
    // try attendance dropdown
    await page
      .locator('button')
      .filter({ hasText: /Chấm công|Attendance/i })
      .first()
      .click({ force: true })
      .catch(() => {});
    await sleep(800);
    await page.locator('text=Bảng chấm công').first().click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  await shot(page, '01-sheets-list');
  if (!(await sheetsBtn.isVisible().catch(() => false))) {
    step('SHEET-CREATE-CTA', 'BLOCKED', 'att-sheets-add not visible');
    return false;
  }
  await sheetsBtn.click({ force: true });
  await sleep(1200);
  const dlg = page.getByTestId('att-add-sheet-dialog');
  if (!(await dlg.isVisible().catch(() => false))) {
    step('SHEET-DIALOG', 'FAIL', 'add sheet dialog not open');
    return false;
  }
  const nameInput = dlg.locator('input').filter({ hasNot: page.locator('[type=checkbox]') }).first();
  // prefer labeled name field — fill last text-like
  const inputs = dlg.locator('input:not([type=checkbox]):not([type=hidden])');
  const n = await inputs.count();
  // name often mid; set via placeholder
  const nameField = dlg.getByPlaceholder(/Bảng chấm công|từ ngày/i);
  if ((await nameField.count()) > 0) {
    await nameField.first().fill(`QA-LVFN-${STAMP} 01/10/2026–15/10/2026`);
  } else if (n > 0) {
    await inputs.nth(Math.min(2, n - 1)).fill(`QA-LVFN-${STAMP}`);
  }
  // dates — ViDatePicker
  const dateBoxes = dlg.locator('input').filter({ hasText: '' });
  // try all visible text inputs for dates
  const allInp = dlg.locator('input:visible');
  const c = await allInp.count();
  let filledDates = 0;
  for (let i = 0; i < c; i++) {
    const ph = ((await allInp.nth(i).getAttribute('placeholder')) || '').toLowerCase();
    const val = await allInp.nth(i).inputValue().catch(() => '');
    if (/ngày|dd\/mm|date/i.test(ph) || /^\d{2}\/\d{2}\/\d{4}$/.test(val) || val === '') {
      // heuristic: fill first empty-looking as start, second as end
    }
  }
  // More reliable: look for calendar triggers near labels
  const startLab = dlg.locator('text=/Từ ngày|Start|Bắt đầu/i').first();
  const endLab = dlg.locator('text=/Đến ngày|End|Kết thúc/i').first();
  // ViDatePickerField usually renders an input nearby
  const dateInputs = dlg.locator('input[placeholder*="dd"], input[placeholder*="ngày" i], input[inputmode="numeric"]');
  if ((await dateInputs.count()) >= 2) {
    await fillViDate(page, dateInputs.nth(0), SHEET_START);
    await fillViDate(page, dateInputs.nth(1), SHEET_END);
    filledDates = 2;
  } else {
    // fallback: any two text inputs after name
    for (let i = 0; i < Math.min(c, 6); i++) {
      const el = allInp.nth(i);
      const v = await el.inputValue().catch(() => '');
      if (v.includes('QA-LVFN')) continue;
      if (filledDates === 0) {
        await fillViDate(page, el, SHEET_START);
        filledDates++;
      } else if (filledDates === 1) {
        await fillViDate(page, el, SHEET_END);
        filledDates++;
        break;
      }
    }
  }
  await shot(page, '02-sheet-dialog');
  await dlg.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).last().click({ force: true });
  await sleep(4000);
  const ok = results.sheet.create && results.sheet.create.status >= 200 && results.sheet.create.status < 300;
  step(
    'SHEET-CREATE',
    ok ? 'PASS' : 'FAIL',
    ok
      ? `POST sheets ${results.sheet.create.status} id=${results.sheet.create.id}`
      : `create=${JSON.stringify(results.sheet.create)} filledDates=${filledDates}`,
  );
  await shot(page, '03-after-sheet-create');
  return ok;
}

async function createLeave(page, startIso, endIso, reasonTag, destKey) {
  await openLeaveTab(page);
  await shot(page, destKey === 'lock' ? '10-leave-tab-lock' : '04-leave-tab');
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
  // employee + leave type comboboxes — prefer UAT-0100 when listed (stable open Nov dates)
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
  // dates
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
  await shot(page, destKey === 'lock' ? '11-leave-lock-dialog' : '05-leave-dialog');
  await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true });
  await sleep(4500);
  const created = destKey === 'lock' ? results.leave.lockCreate : results.leave.create;
  const ok = created && created.status >= 200 && created.status < 300;
  step(
    destKey === 'lock' ? 'LOCK-LEAVE-CREATE' : 'LEAVE-CREATE',
    ok ? 'PASS' : 'FAIL',
    ok ? `POST ${created.status} ${created.code} id=${created.id}` : JSON.stringify(created),
  );
  await shot(page, destKey === 'lock' ? '12-after-lock-create' : '06-after-leave-create');
  return ok;
}

async function approveLeave(page, leaveId, destKey) {
  await openLeaveTab(page);
  await openTab(page, /Chờ duyệt/i);
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
  await sleep(4000);
  await shot(page, destKey === 'lock' ? '13-after-lock-approve' : '07-after-approve');
  const appr = destKey === 'lock' ? results.leave.lockApprove : results.leave.approve;
  return { clicked, appr };
}

async function openSheetWeekly(page) {
  // go sheets list then click row
  const menuSheets = page.locator('button,a,[role="menuitem"],[role="tab"]').filter({
    hasText: /Bảng chấm công/i,
  });
  if ((await menuSheets.count()) > 0) {
    await menuSheets.first().click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  const sheetId = results.sheet.id;
  if (sheetId) {
    const row = page.getByTestId(`att-sheet-row-${sheetId}`);
    if ((await row.count()) > 0) {
      await row.first().click({ force: true });
      await sleep(2500);
      results.sheet.open = true;
    }
  }
  // ensure weekly tab
  await openTab(page, /Theo tuần|Tuần|Weekly/i);
  await sleep(2000);
  // also try menu weekly
  const weeklyMenu = page.locator('button,a,[role="menuitem"],[role="tab"]').filter({
    hasText: /Theo tuần|Tổng hợp tuần|Weekly/i,
  });
  if ((await weeklyMenu.count()) > 0) {
    await weeklyMenu.first().click({ force: true }).catch(() => {});
    await sleep(2000);
  }
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
  results.stormWindow = {
    windowMs: 10000,
    getHits: in10,
    count: in10.length,
    limit: 2,
  };
  const pass = in10.length <= 2;
  step(
    'J-HRM-06b',
    pass ? 'PASS' : 'FAIL',
    `GET records+sheets in 10s = ${in10.length} (limit ≤2)`,
  );
  results.ac['J-HRM-06b'] = pass ? 'PASS' : 'FAIL';
  return pass;
}

async function cancelViaBrowserSession(page, session, leaveId) {
  // FE cancel CTA not wired (delete stub) — F-ATT-LEAVE-FUNNEL-02 reverse via POST cancel in browser session (not seed).
  const res = await page.evaluate(
    async ({ hrm, token, leaveId, ou }) => {
      const r = await fetch(`${hrm}/api/hrm/attendance/leave-requests/${leaveId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-company-id': ou,
        },
        body: JSON.stringify({
          reviewer_name: 'ceo@xe.vn',
          rejected_reason: 'QA funnel reverse AC-02',
        }),
      });
      const j = await r.json().catch(() => ({}));
      return { status: r.status, code: j?.code, statusBody: j?.data?.status, message: j?.message };
    },
    { hrm: HRM, token: session.token, leaveId, ou: OU },
  );
  results.leave.cancel = res;
  return res;
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
    // —— AC-01 path ——
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    attachNet(page, 'all');
    await inject(page, session);
    await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(5000);

    const sheetOk = await createDraftSheet(page);
    const leaveOk = await createLeave(page, LEAVE_START, LEAVE_END, 'QA funnel R2 leave', 'main');
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
          : `clicked=${clicked} appr=${JSON.stringify(appr)} expect materialized_days.length>0`,
      );
    } else {
      step('LEAVE-APPROVE', 'SKIP', 'no create');
    }

    // Corroborate GET records (same session token) — not UF alone; FE path already mutated
    const recordsProbe = await page.evaluate(
      async ({ hrm, token, ou, from, to, leaveId }) => {
        const q = new URLSearchParams({
          company_id: ou,
          from_date: from,
          to_date: to,
          page_size: '200',
        });
        const r = await fetch(`${hrm}/api/hrm/attendance/records?${q}`, {
          headers: { Authorization: `Bearer ${token}`, 'x-company-id': ou },
        });
        const j = await r.json().catch(() => ({}));
        const rows = j?.data?.data ?? j?.data ?? [];
        const arr = Array.isArray(rows) ? rows : [];
        const leaveRows = arr.filter(
          (x) =>
            String(x.status) === 'leave' &&
            (!leaveId || x.leave_request_id === leaveId),
        );
        return {
          status: r.status,
          leave_count: leaveRows.length,
          sample: leaveRows.slice(0, 5).map((x) => ({
            date: x.attendance_date ?? x.date ?? x.work_date,
            status: x.status,
            status_label: x.status_label,
            leave_type_label: x.leave_type_label,
            leave_request_id: x.leave_request_id,
          })),
        };
      },
      {
        hrm: HRM,
        token: session.token,
        ou: OU,
        from: LEAVE_START,
        to: LEAVE_END,
        leaveId: results.leave.create?.id,
      },
    );
    results.weekly.recordsProbe = recordsProbe;
    results.weekly.recordsStatus = recordsProbe.status;
    if (recordsProbe.sample?.length) {
      results.weekly.leaveLabelSample = recordsProbe.sample;
    }
    const probeDates = (recordsProbe.sample || []).map((r) => String(r.date ?? ''));
    const weekdayJunk = probeDates.filter((d) => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(d));
    const epochHit = probeDates.some((d) => /1970-01-01|01\/01\/1970/.test(d));
    if (epochHit) results.weekly.epoch1970 = true;
    results.weekly.badDateSamples = weekdayJunk.slice(0, 5);
    results.weekly.dateFormatOk =
      recordsProbe.leave_count > 0 &&
      probeDates.every((d) => /^\d{4}-\d{2}-\d{2}/.test(d)) &&
      weekdayJunk.length === 0;
    step(
      'RECORDS-PROBE',
      recordsProbe.status === 200 && recordsProbe.leave_count > 0 && results.weekly.dateFormatOk
        ? 'PASS'
        : 'FAIL',
      `GET records ${recordsProbe.status} leave=${recordsProbe.leave_count} dates=${JSON.stringify(probeDates)} weekdayJunk=${weekdayJunk.length}`,
    );

    // Weekly / Bản ghi observation — require leave cell evidence (sample), not tab label alone
    results.weekly.leaveRequestsOnWeekly = 0;
    attachNet(page, 'weekly');
    await openSheetWeekly(page);
    await openTab(page, /Bản ghi|Records/i);
    await sleep(3000);
    await shot(page, '08-weekly-after-approve');

    const leaveCell =
      (results.weekly.leaveLabelSample && results.weekly.leaveLabelSample.length > 0) ||
      (recordsProbe.leave_count > 0 && results.weekly.dateFormatOk);
    // Reject false-positive: body has "Nghỉ phép" only as tab chrome
    const body = await page.locator('body').innerText().catch(() => '');
    const leaveCellDom =
      (await page.locator('[data-leave-request-id]').count().catch(() => 0)) > 0 ||
      (await page.locator('text=/Phép năm|status.?leave|Nghỉ phép/i').count().catch(() => 0)) > 1;
    results.weekly.leaveVisible = Boolean(leaveCell || leaveCellDom);
    results.weekly.leaveVisibleNote = leaveCell
      ? 'leave_rows_from_records'
      : leaveCellDom
        ? 'dom_leave_marker'
        : /Nghỉ phép/i.test(body)
          ? 'TAB_LABEL_ONLY_REJECT'
          : 'none';

    // F5
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(4000);
    await openSheetWeekly(page);
    await openTab(page, /Bản ghi|Records/i);
    await sleep(2500);
    const probeF5 = await page.evaluate(
      async ({ hrm, token, ou, from, to, leaveId }) => {
        const q = new URLSearchParams({
          company_id: ou,
          from_date: from,
          to_date: to,
          page_size: '200',
        });
        const r = await fetch(`${hrm}/api/hrm/attendance/records?${q}`, {
          headers: { Authorization: `Bearer ${token}`, 'x-company-id': ou },
        });
        const j = await r.json().catch(() => ({}));
        const rows = j?.data?.data ?? j?.data ?? [];
        const arr = Array.isArray(rows) ? rows : [];
        return arr.filter(
          (x) => String(x.status) === 'leave' && (!leaveId || x.leave_request_id === leaveId),
        ).length;
      },
      {
        hrm: HRM,
        token: session.token,
        ou: OU,
        from: LEAVE_START,
        to: LEAVE_END,
        leaveId: results.leave.create?.id,
      },
    );
    results.weekly.leaveVisibleF5 = probeF5 > 0;
    await shot(page, '09-weekly-f5');

    const records2xx = recordsProbe.status >= 200 && recordsProbe.status < 300;
    const noLeaveJoin = results.weekly.leaveRequestsOnWeekly === 0;
    // Sheet create best-effort — AC-01 PASS if funnel + Bản ghi leave cell proven (dispatch R2)
    const ac01 =
      leaveOk &&
      approveOk &&
      matDays.length > 0 &&
      recordsProbe.leave_count > 0 &&
      results.weekly.dateFormatOk &&
      results.weekly.leaveVisible &&
      results.weekly.leaveVisibleF5 &&
      records2xx &&
      !results.weekly.epoch1970 &&
      results.weekly.leaveVisibleNote !== 'TAB_LABEL_ONLY_REJECT';
    results.ac['AC-ATT-LV-SHEET-01'] = ac01 ? 'PASS' : 'FAIL';
    step(
      'AC-ATT-LV-SHEET-01',
      ac01 ? 'PASS' : 'FAIL',
      `sheet=${sheetOk} leave=${leaveOk} approve=${approveOk} matDays=${matDays.length} leaveRows=${recordsProbe.leave_count} dateFmt=${results.weekly.dateFormatOk} weekly=${results.weekly.leaveVisibleNote} f5=${results.weekly.leaveVisibleF5} records=${results.weekly.recordsStatus} epoch1970=${results.weekly.epoch1970} leaveJoinGets=${results.weekly.leaveRequestsOnWeekly}`,
    );

    // Storm regress on weekly
    await measureStorm(page);
    await shot(page, '09b-storm-weekly');

    // —— AC-02 cancel reverse (optional if FE cancel CTA stub) ——
    let ac02 = false;
    if (approveOk && results.leave.create?.id) {
      // Probe FE cancel CTA first
      await openLeaveTab(page);
      await openTab(page, /Đã duyệt|Approved|Tất cả/i);
      await sleep(1500);
      const cancelCta =
        (await page.getByTestId(`hdsd-leave-list-cancel-${results.leave.create.id}`).count()) > 0 ||
        (await page.getByRole('button', { name: /Hủy|Cancel/i }).count()) > 0;
      if (!cancelCta) {
        results.ac['AC-ATT-LV-SHEET-02'] = 'SKIP';
        results.residual.push('R-ATT-LV-SHEET-02-FE-CANCEL-STUB');
        step(
          'AC-ATT-LV-SHEET-02',
          'SKIP',
          'FE cancel CTA not wired (delete stub) — residual P2; not hard FAIL alone per R2 dispatch',
        );
      } else {
        const cancelRes = await cancelViaBrowserSession(page, session, results.leave.create.id);
        const cancelOk = cancelRes.status >= 200 && cancelRes.status < 300;
        step(
          'LEAVE-CANCEL',
          cancelOk ? 'PASS' : 'FAIL',
          `POST cancel ${cancelRes.status} ${cancelRes.code}`,
        );
        const probe = await page.evaluate(
          async ({ hrm, token, ou, from, to, leaveId }) => {
            const q = new URLSearchParams({
              company_id: ou,
              from_date: from,
              to_date: to,
            });
            const r = await fetch(`${hrm}/api/hrm/attendance/records?${q}`, {
              headers: { Authorization: `Bearer ${token}`, 'x-company-id': ou },
            });
            const j = await r.json().catch(() => ({}));
            const rows = j?.data?.data ?? j?.data ?? [];
            const arr = Array.isArray(rows) ? rows : [];
            const ours = arr.filter((x) => x.leave_request_id === leaveId && x.status === 'leave');
            return { status: r.status, ours };
          },
          {
            hrm: HRM,
            token: session.token,
            ou: OU,
            from: LEAVE_START,
            to: LEAVE_END,
            leaveId: results.leave.create.id,
          },
        );
        results.weekly.afterCancelProbe = probe;
        ac02 = cancelOk && probe.ours.length === 0;
        results.ac['AC-ATT-LV-SHEET-02'] = ac02 ? 'PASS' : 'FAIL';
        step('AC-ATT-LV-SHEET-02', ac02 ? 'PASS' : 'FAIL', `cancelOk=${cancelOk} oursLeft=${probe.ours.length}`);
        await shot(page, '14-after-cancel');
      }
    } else {
      results.ac['AC-ATT-LV-SHEET-02'] = 'SKIP';
      step('AC-ATT-LV-SHEET-02', 'SKIP', 'approve not PASS — cancel not run');
    }

    await ctx.close();

    // —— AC-03 locked sheet ——
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page2 = await ctx2.newPage();
    attachNet(page2, 'lock');
    await inject(page2, session);
    await page2.goto(attUrl('&lock=1'), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(4500);

    // Document closed sheet available (Sept)
    results.ac03_closed_sheet = {
      id: 'ae71f0b0-a3cb-43ab-9f5f-f42004add657',
      name: 'QA-BP-ATT-SIGN-DRAFT-SUBMIT-01',
      status: 'closed',
      range: '2026-09-01..2026-09-30 (approx)',
      note: 'U65 existing closed sheet — no seed',
    };

    const lockCreateOk = await createLeave(
      page2,
      LOCK_LEAVE_START,
      LOCK_LEAVE_END,
      'QA funnel LOCK',
      'lock',
    );
    let ac03 = false;
    if (lockCreateOk) {
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
        `clicked=${clicked} approve=${JSON.stringify(appr)} expect 409 HRM-ATT-SHEET-LOCKED`,
      );
    } else {
      results.ac['AC-ATT-LV-SHEET-03'] = 'SKIP';
      step('AC-ATT-LV-SHEET-03', 'SKIP', 'could not create leave overlapping closed sheet');
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
  // AC-02 SKIP (FE cancel stub) is allowed — not hard FAIL alone (R2 dispatch)
  const hardFail = [a1, a3, storm].includes('FAIL') || a2 === 'FAIL';
  const blocked = a1 === 'SKIP' || a3 === 'SKIP';

  if (
    !hardFail &&
    a1 === 'PASS' &&
    (a2 === 'PASS' || a2 === 'SKIP') &&
    a3 === 'PASS' &&
    storm === 'PASS'
  ) {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  } else if (hardFail) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    if (a1 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-01');
    if (a2 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-02');
    if (a3 === 'FAIL') results.residual.push('R-ATT-LV-SHEET-03');
    if (storm === 'FAIL') results.residual.push('R-J-HRM-06b-STORM');
  } else {
    results.verdict = blocked ? 'BLOCKED' : 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
  }

  // Dedupe residual
  results.residual = [...new Set(results.residual)];
  results.endedAt = ts();
  results.attendance_uat_ready = false;
  results.LV_02_claim = 'WAIVED_P1 — not 🟢';
  if ((results.weekly.leaveRequestsOnWeekly || 0) > 0) {
    results.residual.push('OBS-OPTION-C-LEAVE-JOIN-GETS');
  }
  results.residual = [...new Set(results.residual)];
  save();
  console.log('\n=== SUMMARY R2 ===');
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        ac: results.ac,
        leave: results.leave,
        sheet: results.sheet,
        weekly: results.weekly,
        storm: results.stormWindow,
        residual: results.residual,
        STAMP,
      },
      null,
      2,
    ),
  );
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
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
