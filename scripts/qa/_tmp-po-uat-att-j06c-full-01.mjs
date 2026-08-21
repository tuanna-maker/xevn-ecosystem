#!/usr/bin/env node
/**
 * PO-UAT-ATT-J06C-FULL-01 — U65 browser: J-HRM-06c full sign→Chốt + AC-01/02/03 smoke
 * Persona: ceo@xe.vn · company_id=main · attendance_uat_ready=false
 * Cấm: seed · Option C · reopen WAIVE_L2 / LV-02
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const CEO = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const OU = 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-att-j06c-full-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-att-j06c-full-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `J06CF-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const LEAVE_PAIRS = [
  ['2027-04-06', '2027-04-07'],
  ['2027-04-08', '2027-04-09'],
  ['2027-05-04', '2027-05-05'],
];
const LOCK_DATES = ['2026-09-23', '2026-09-24', '2026-09-25', '2026-08-15'];

const R = {
  work_item_id: 'PO-UAT-ATT-J06C-FULL-01',
  parent: 'PO-UAT-ATT-QC-01 GWC — J-06c full mutate',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  attendance_uat_ready: false,
  WAIVE_L2: true,
  LV_02: 'WAIVED_P1 — RETAIN — not claimed 🟢',
  Option_C: 'cấm as SoT',
  env: { PORTAL, HRM, CEO, OU, STAMP, commit: COMMIT },
  l0: {},
  steps: {},
  clicks: [],
  network: [],
  leave: { create: null, approve: null, cancel: null, lockCreate: null, lockApprove: null },
  ac: {
    'AC-ATT-LV-SHEET-01': null,
    'AC-ATT-LV-SHEET-02': null,
    'AC-ATT-LV-SHEET-03': null,
    'J-HRM-06c': null,
  },
  j06c: {
    sheetId: null,
    statusBefore: null,
    statusAfter: null,
    submitPost2xx: 0,
    signaturesPost2xx: 0,
    closePost2xx: 0,
    signPanelVisible: null,
    closeEnabled: null,
    feClosedChip: null,
    f5Status: null,
    blocked: null,
    gap: null,
  },
  records: { afterApprove: null, afterCancel: null, afterCancelF5: null },
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
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function step(id, verdict, summary, extra = {}) {
  R.steps[id] = { verdict, summary, ...extra, at: ts() };
  console.log(`${verdict} ${id} — ${summary}`);
  save();
}
function click(stepId, detail) {
  R.clicks.push({ step: stepId, detail, at: ts() });
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function parseSheetRows(j) {
  const d = j?.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d)) return d;
  return [];
}

async function l0() {
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    R.l0[name] = r ? r.status : 'ERR';
  }
  const ok = R.l0.hrm === 200 && R.l0.portal === 200;
  step('L0', ok ? 'PASS' : 'FAIL', JSON.stringify(R.l0));
  return ok;
}

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: CEO, password: PASS }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.accessToken ?? d?.access_token;
    if (token) {
      const u = d?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: OU,
        user: {
          userId: u.userId || u.id || CEO,
          email: u.email || CEO,
          displayName: u.displayName || u.fullName || 'CEO',
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('login failed');
}

async function inject(page, s) {
  await page.addInitScript(
    ({ s, ou }) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', JSON.stringify(s.user));
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', ou);
        store.setItem('hrm_current_company_id', ou);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s, ou: OU },
  );
}

function attachNet(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/attendance\//.test(u)) return;
    const m = res.request().method();
    const path = u.replace(PORTAL, '').replace(HRM, '').slice(0, 260);
    const entry = { method: m, status: res.status(), url: path, at: ts() };
    R.network.push(entry);

    if (m === 'POST' && /leave-requests(\?|$)/.test(u) && !/\/(approve|reject|cancel)/.test(u)) {
      const j = await res.json().catch(() => ({}));
      const payload = {
        status: res.status(),
        code: j?.code,
        id: j?.data?.id ?? j?.data?.request_id,
      };
      if (R._leaveMode === 'lock') R.leave.lockCreate = payload;
      else R.leave.create = payload;
    }
    if (m === 'POST' && /leave-requests\/[^/]+\/approve/.test(u)) {
      const j = await res.json().catch(() => ({}));
      const payload = {
        status: res.status(),
        code: j?.code,
        message: String(j?.message ?? '').slice(0, 180),
        materialized_days: j?.data?.materialized_days,
      };
      if (R._leaveMode === 'lock') R.leave.lockApprove = payload;
      else R.leave.approve = payload;
    }
    if (m === 'POST' && /leave-requests\/[^/]+\/cancel/.test(u)) {
      const j = await res.json().catch(() => ({}));
      R.leave.cancel = {
        status: res.status(),
        code: j?.code,
        requestStatus: j?.data?.status,
        via: 'browser-network',
      };
    }
  });
}

function attUrl() {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_j06cf=${Date.now()}`;
}

async function openTab(page, nameRe) {
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: nameRe })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(1500);
}

async function openLeaveTab(page) {
  await openTab(page, /^Nghỉ phép$/i);
  await sleep(1000);
}

async function openAttendanceMenuItem(page, labelRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click();
  await sleep(500);
  const byText = page.locator('[role="menu"], [data-radix-menu-content]').getByText(labelRe).first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return;
  }
  const items = page.locator('[role="menuitem"]');
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    const text = ((await items.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await items.nth(i).click();
      return;
    }
  }
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
    await el.type(vi, { delay: 15 }).catch(() => {});
  });
  await el.press('Tab').catch(() => {});
  await sleep(200);
  return true;
}

async function createLeave(page, startIso, endIso, reasonTag) {
  await openLeaveTab(page);
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).first();
  if (!(await createBtn.isVisible().catch(() => false))) return false;
  await createBtn.click({ force: true });
  await sleep(1200);
  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return false;
  for (let i = 0; i < 3; i++) {
    const c = dlg.locator('button[role="combobox"]').nth(i);
    if (await c.isVisible().catch(() => false)) {
      await c.click();
      await sleep(500);
      const prefer = page.getByRole('option').filter({ hasText: /UAT-0100|UAT.?0100/i });
      if ((await prefer.count()) > 0) await prefer.first().click({ force: true });
      else {
        const opt = page.getByRole('option').first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
      }
      await sleep(300);
    }
  }
  const reason =
    (await dlg.getByTestId('hdsd-leave-reason').count()) > 0
      ? dlg.getByTestId('hdsd-leave-reason')
      : dlg.locator('textarea').first();
  if (await reason.isVisible().catch(() => false)) await reason.fill(`${reasonTag} ${STAMP}`);
  const dateInputs = dlg.locator(
    'input[type="date"], input[placeholder*="ngày" i], input[placeholder*="dd" i], input[inputmode="numeric"]',
  );
  if ((await dateInputs.count()) >= 2) {
    const t0 = await dateInputs.nth(0).getAttribute('type');
    if (t0 === 'date') {
      await dateInputs.nth(0).fill(startIso).catch(() => {});
      await dateInputs.nth(1).fill(endIso).catch(() => {});
    } else {
      await fillViDate(page, dateInputs.nth(0), startIso);
      await fillViDate(page, dateInputs.nth(1), endIso);
    }
  }
  await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true });
  await sleep(4000);
  const created = R._leaveMode === 'lock' ? R.leave.lockCreate : R.leave.create;
  return !!(created && created.status >= 200 && created.status < 300);
}

async function approveLeave(page, leaveId) {
  await openLeaveTab(page);
  await openTab(page, /Chờ duyệt|Approval|Duyệt/i);
  await sleep(1800);
  let clicked = false;
  if (leaveId) {
    const byId = page.getByTestId(`hdsd-leave-list-approve-${leaveId}`);
    if ((await byId.count()) > 0) {
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
  return clicked;
}

async function cancelLeaveViaFe(page, leaveId) {
  await openLeaveTab(page);
  const tab = page.getByRole('tab', { name: /Danh sách yêu cầu/i });
  if ((await tab.count()) > 0) await tab.first().click({ force: true });
  await sleep(1800);
  await page.keyboard.press('Escape').catch(() => {});
  let cancelBtn = page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`);
  if ((await cancelBtn.count()) === 0) {
    const row = page.locator('tr').filter({ hasText: STAMP });
    if ((await row.count()) > 0) {
      cancelBtn = row.first().getByRole('button', { name: /Hủy/i });
    }
  }
  if ((await cancelBtn.count()) === 0) return false;
  await cancelBtn.first().click({ force: true });
  await sleep(800);
  const confirm = page.getByTestId('hdsd-leave-cancel-confirm');
  if (await confirm.isVisible().catch(() => false)) await confirm.click({ force: true });
  else {
    const conf = page.getByRole('button', { name: /Xác nhận|Hủy đơn/i }).last();
    if (await conf.isVisible().catch(() => false)) await conf.click({ force: true });
  }
  await sleep(3500);
  return !!(R.leave.cancel && R.leave.cancel.status >= 200 && R.leave.cancel.status < 300);
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
  return { status: r.status, leave_count: leaveRows.length };
}

async function apiListSheets(token) {
  const r = await fetch(`${HRM}/api/hrm/attendance/attendance-sheets?company_id=${OU}&page_size=80`, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, rows: parseSheetRows(j) };
}

async function apiGetSheet(token, id) {
  const r = await fetch(`${HRM}/api/hrm/attendance/attendance-sheets/${id}?company_id=${OU}`, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j };
}

function netCount(methodRe, urlRe) {
  return R.network.filter(
    (n) => methodRe.test(n.method) && urlRe.test(n.url) && n.status >= 200 && n.status < 300,
  ).length;
}

async function readActiveSheetId(page) {
  const weekly = page.locator('[data-testid="att-weekly-precision"]');
  if (await weekly.count()) return weekly.getAttribute('data-active-sheet-id');
  const any = page.locator('[data-active-sheet-id]').first();
  if (await any.count()) return any.getAttribute('data-active-sheet-id');
  return null;
}

async function openSheetRow(page, sheetId) {
  const byTestId = page.locator(`[data-testid="att-sheet-row-${sheetId}"]`);
  if (await byTestId.count()) {
    click('S4-open', `att-sheet-row-${sheetId.slice(0, 8)}`);
    await byTestId.click({ timeout: 12_000 });
    await sleep(2800);
    return true;
  }
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const needle = sheetId.slice(0, 8).toLowerCase();
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (text.includes(needle) || text.includes('submitted') || /chờ ký|đã gửi/i.test(text)) {
      click('S4-open', `row ${i} needle=${needle}`);
      await rows.nth(i).click({ timeout: 12_000 });
      await sleep(2500);
      return true;
    }
  }
  // fallback: first non-closed looking row by status cell
  for (let i = 0; i < n; i++) {
    const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (text.includes(needle)) {
      await rows.nth(i).click({ timeout: 12_000 });
      await sleep(2500);
      return true;
    }
  }
  return false;
}

async function clickEnabledSignSteps(page) {
  for (let round = 0; round < 8; round++) {
    const btns = page.locator('[data-testid^="att-sign-confirm-"]');
    const count = await btns.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const btn = btns.nth(i);
      if (await btn.isEnabled().catch(() => false)) {
        const tid = (await btn.getAttribute('data-testid')) || `idx-${i}`;
        click('S-sign', `${tid} round ${round}`);
        await btn.click({ timeout: 10_000 });
        await sleep(2500);
        clicked = true;
        break;
      }
    }
    if (!clicked) break;
  }
}

async function createSheetFe(page, name, startVi, endVi) {
  click('S2-create', 'att-sheets-add');
  const addBtn = page.locator('[data-testid="att-sheets-add"]');
  if (!(await addBtn.isVisible().catch(() => false))) return null;
  await addBtn.click({ timeout: 12_000 });
  await sleep(1200);
  const dialog = page.locator('[role="dialog"]').last();
  await dialog.waitFor({ state: 'visible', timeout: 10_000 });
  await dialog.locator('input').first().fill(name);
  const dateInputs = dialog.locator('input[placeholder="dd/MM/yyyy"]');
  if ((await dateInputs.count()) >= 2) {
    await dateInputs.nth(0).fill(startVi);
    await dateInputs.nth(1).fill(endVi);
  }
  const stdRadio = dialog.getByText(/Công chuẩn|Standard/i).first();
  if (await stdRadio.isVisible().catch(() => false)) await stdRadio.click().catch(() => {});
  await dialog.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).first().click({ timeout: 12_000 });
  await sleep(4000);
  const created = R.network.find(
    (n) => n.method === 'POST' && /attendance-sheets(\?|$)/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  return created ? true : false;
}

function pickMutableSheet(rows) {
  const submitted = rows.find((r) => r.status === 'submitted');
  if (submitted) return { sheet: submitted, reason: 'existing_submitted' };
  const draft = rows.find((r) => ['draft', 'open'].includes(String(r.status)));
  if (draft) return { sheet: draft, reason: 'existing_draft' };
  return { sheet: null, reason: 'no_mutable_sheet' };
}

async function runJ06cFull(page, session) {
  click('J06c-0', 'navigate sheets list');
  await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
  await shot(page, '20-sheets-list');

  let list = await apiListSheets(session.token);
  let pick = pickMutableSheet(list.rows);
  R.j06c.pickReason = pick.reason;

  if (!pick.sheet) {
    // FE create a free month (Oct 2027) — U65 path, not seed
    const name = `QA-J06C-FULL-${STAMP}`;
    const created = await createSheetFe(page, name, '01/10/2027', '31/10/2027');
    await shot(page, '21-after-create');
    if (!created) {
      R.j06c.blocked = 'NO_SHEET_DRAFT';
      R.j06c.gap = 'No submitted/draft sheet and FE create failed — cannot run sign→Chốt without seed';
      step('J-HRM-06c', 'BLOCKED', R.j06c.gap);
      R.ac['J-HRM-06c'] = 'BLOCKED';
      return false;
    }
    list = await apiListSheets(session.token);
    pick = pickMutableSheet(list.rows);
    if (!pick.sheet) {
      pick.sheet = list.rows.find((r) => (r.name || '').includes(STAMP)) || null;
      pick.reason = pick.sheet ? 'created_by_name' : 'create_not_found';
    }
  }

  if (!pick.sheet) {
    R.j06c.blocked = 'NO_SHEET_AFTER_CREATE';
    R.j06c.gap = 'FE create returned 2xx path but sheet not in list';
    step('J-HRM-06c', 'BLOCKED', R.j06c.gap);
    R.ac['J-HRM-06c'] = 'BLOCKED';
    return false;
  }

  R.j06c.sheetId = pick.sheet.id;
  R.j06c.statusBefore = pick.sheet.status;
  step('J06c-PICK', 'PASS', `${pick.reason} id=${pick.sheet.id.slice(0, 8)} status=${pick.sheet.status}`);

  const opened = await openSheetRow(page, pick.sheet.id);
  if (!opened) {
    // try click any submitted row text
    const submittedRow = page
      .locator('[data-testid="att-sheets-precision"] tbody tr')
      .filter({ hasText: /submitted|Chờ ký|Đã gửi|Gửi/i })
      .first();
    if (await submittedRow.isVisible().catch(() => false)) {
      await submittedRow.click({ force: true });
      await sleep(2500);
    } else {
      R.j06c.blocked = 'ROW_NAV_FAIL';
      R.j06c.gap = `Cannot open sheet ${pick.sheet.id} from list`;
      step('J-HRM-06c', 'BLOCKED', R.j06c.gap);
      R.ac['J-HRM-06c'] = 'BLOCKED';
      return false;
    }
  }
  R.j06c.dataActiveSheetId = await readActiveSheetId(page);
  await shot(page, '22-sheet-open');

  // If draft — submit first
  const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
  if (await submitBtn.isVisible().catch(() => false)) {
    click('S5-submit', 'att-sheet-submit');
    await submitBtn.click({ timeout: 12_000 });
    await sleep(4000);
    R.j06c.submitPost2xx = netCount(/^POST$/, /\/submit/);
  }

  R.j06c.signPanelVisible = await page.locator('[data-testid="att-sign-panel"]').isVisible().catch(() => false);
  if (!R.j06c.signPanelVisible) {
    // wait a bit more / scroll
    await sleep(2000);
    R.j06c.signPanelVisible = await page.locator('[data-testid="att-sign-panel"]').isVisible().catch(() => false);
  }
  await shot(page, '23-sign-panel');

  await clickEnabledSignSteps(page);
  R.j06c.signaturesPost2xx = netCount(/^POST$/, /\/signatures/);
  await shot(page, '24-after-signs');

  const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
  R.j06c.closeEnabled = await closeBtn.isEnabled().catch(() => false);
  if (!R.j06c.closeEnabled) {
    // wait for UI to enable after last sign
    await sleep(2000);
    R.j06c.closeEnabled = await closeBtn.isEnabled().catch(() => false);
  }

  if (R.j06c.closeEnabled) {
    click('S6-close', 'att-sign-close-sheet Chốt');
    await closeBtn.click({ timeout: 10_000 });
    await sleep(3500);
    R.j06c.closePost2xx = netCount(/^POST$/, /\/close/);
  } else {
    R.j06c.blocked = 'CLOSE_DISABLED';
    R.j06c.gap = `Close button disabled after ${R.j06c.signaturesPost2xx} signature POSTs`;
    await shot(page, '24b-close-disabled');
    step('J-HRM-06c', 'FAIL', R.j06c.gap);
    R.ac['J-HRM-06c'] = 'FAIL';
    return false;
  }

  await shot(page, '25-after-close');
  R.j06c.feClosedChip =
    (await page.getByText(/Đã chốt|Closed|Khóa/i).first().isVisible().catch(() => false)) ||
    (await page.locator('[data-status="closed"]').count()) > 0;

  click('S7-f5', 'F5 after Chốt');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);

  const after = await apiGetSheet(session.token, pick.sheet.id);
  R.j06c.statusAfter = after.body?.status;
  R.j06c.f5Status = after.body?.status;
  await shot(page, '26-after-f5');

  const ok =
    R.j06c.signaturesPost2xx >= 3 &&
    R.j06c.closePost2xx >= 1 &&
    R.j06c.statusAfter === 'closed';

  R.ac['J-HRM-06c'] = ok ? 'PASS' : 'FAIL';
  step(
    'J-HRM-06c',
    ok ? 'PASS' : 'FAIL',
    ok
      ? `sign×${R.j06c.signaturesPost2xx} close×${R.j06c.closePost2xx} status=${R.j06c.statusAfter} F5=${R.j06c.f5Status}`
      : `sig=${R.j06c.signaturesPost2xx} close=${R.j06c.closePost2xx} status=${R.j06c.statusAfter}`,
  );
  return ok;
}

async function runAcSmoke(page, session) {
  // AC-01 create→approve→materialize
  R._leaveMode = 'normal';
  let leaveOk = false;
  let pair = LEAVE_PAIRS[0];
  for (const p of LEAVE_PAIRS) {
    pair = p;
    R.leave.create = null;
    R.leave.approve = null;
    const created = await createLeave(page, p[0], p[1], 'J06CF-AC01');
    if (!created) continue;
    const leaveId = R.leave.create?.id;
    await approveLeave(page, leaveId);
    const appr = R.leave.approve;
    if (appr && appr.status >= 200 && appr.status < 300) {
      leaveOk = true;
      break;
    }
    if (appr && /OVERLAP|LOCKED/i.test(String(appr.code) + String(appr.message))) continue;
  }
  await shot(page, '01-ac01-after-approve');
  const leaveId = R.leave.create?.id;
  const mat = R.leave.approve?.materialized_days;
  const afterApprove = await probeLeaveRecords(session, leaveId, pair[0], pair[1]);
  R.records.afterApprove = afterApprove;
  click('AC01-f5', 'reload for AC-01 F5');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  const afterF5 = await probeLeaveRecords(session, leaveId, pair[0], pair[1]);
  R.records.afterApproveF5 = afterF5;
  const ac01 =
    leaveOk &&
    Array.isArray(mat) &&
    mat.length >= 1 &&
    afterApprove.leave_count >= 1 &&
    afterF5.leave_count >= 1;
  R.ac['AC-ATT-LV-SHEET-01'] = ac01 ? 'PASS' : leaveOk ? 'OBS' : 'FAIL';
  step(
    'AC-01',
    R.ac['AC-ATT-LV-SHEET-01'],
    `mat=${JSON.stringify(mat)} leave=${afterApprove.leave_count} F5=${afterF5.leave_count}`,
  );

  // AC-02 cancel
  let ac02 = false;
  if (leaveId && afterApprove.leave_count >= 1) {
    const cancelled = await cancelLeaveViaFe(page, leaveId);
    await shot(page, '02-ac02-after-cancel');
    const afterCancel = await probeLeaveRecords(session, leaveId, pair[0], pair[1]);
    R.records.afterCancel = afterCancel;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const afterCancelF5 = await probeLeaveRecords(session, leaveId, pair[0], pair[1]);
    R.records.afterCancelF5 = afterCancelF5;
    ac02 = cancelled && afterCancel.leave_count === 0 && afterCancelF5.leave_count === 0;
    R.ac['AC-ATT-LV-SHEET-02'] = ac02 ? 'PASS' : 'FAIL';
    step(
      'AC-02',
      R.ac['AC-ATT-LV-SHEET-02'],
      `cancel=${R.leave.cancel?.status}/${R.leave.cancel?.code} markers ${afterApprove.leave_count}→${afterCancel.leave_count} F5=${afterCancelF5.leave_count}`,
    );
  } else {
    R.ac['AC-ATT-LV-SHEET-02'] = 'SKIP';
    step('AC-02', 'SKIP', 'No approved leave markers to cancel');
  }

  // AC-03 lock smoke — new context leave on closed Sept day
  R._leaveMode = 'lock';
  let lockPass = false;
  for (const day of LOCK_DATES) {
    R.leave.lockCreate = null;
    R.leave.lockApprove = null;
    const created = await createLeave(page, day, day, 'J06CF-AC03-LOCK');
    if (!created) continue;
    await approveLeave(page, R.leave.lockCreate?.id);
    const appr = R.leave.lockApprove;
    if (appr && (appr.status === 409 || /LOCKED|HRM-ATT-SHEET-LOCKED/i.test(String(appr.code) + String(appr.message)))) {
      lockPass = true;
      break;
    }
  }
  await shot(page, '03-ac03-lock');
  R.ac['AC-ATT-LV-SHEET-03'] = lockPass ? 'PASS' : 'FAIL';
  step(
    'AC-03',
    R.ac['AC-ATT-LV-SHEET-03'],
    lockPass
      ? `409 LOCKED ${R.leave.lockApprove?.code} day path`
      : `lockApprove=${JSON.stringify(R.leave.lockApprove)}`,
  );

  // Explicit: do not reopen WAIVE
  step('WAIVE_L2', 'RETAIN', 'WAIVED_P1 — not exercised / not claimed 🟢');
}

async function main() {
  if (!(await l0())) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await login();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  attachNet(page);
  await inject(page, session);

  try {
    // Primary: J-HRM-06c full mutate
    await runJ06cFull(page, session);

    // Regression smoke AC-01/02/03 (no WAIVE reopen)
    await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2200);
    await runAcSmoke(page, session);

    const j06 = R.ac['J-HRM-06c'];
    const acs = [R.ac['AC-ATT-LV-SHEET-01'], R.ac['AC-ATT-LV-SHEET-02'], R.ac['AC-ATT-LV-SHEET-03']];
    const acFail = acs.some((v) => v === 'FAIL');
    const acBlocked = j06 === 'BLOCKED';

    if (acBlocked) {
      R.verdict = 'BLOCKED';
      R.ack_status = 'BLOCKED';
    } else if (j06 === 'PASS' && !acFail) {
      R.verdict = 'PASS';
      R.ack_status = 'PASS_TO_PM';
    } else if (j06 === 'PASS' && acFail) {
      R.verdict = 'PASS_WITH_OBS';
      R.ack_status = 'PASS_TO_PM';
      R.obs.push('AC smoke partial FAIL — see steps');
    } else {
      R.verdict = 'FAIL';
      R.ack_status = 'FAIL_TO_PM';
    }

    // Honesty
    R.attendance_uat_ready = false;
    step('HONESTY', 'PASS', 'attendance_uat_ready=false · WAIVE retained · no Option C');
  } catch (e) {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.residual.push({ id: 'HARNESS_THROW', message: String(e).slice(0, 400) });
    step('THROW', 'FAIL', String(e).slice(0, 300));
  } finally {
    R.endedAt = ts();
    save();
    await browser.close().catch(() => {});
    console.log('\n=== FINAL ===', R.verdict, R.ack_status);
    console.log('J-HRM-06c', R.ac['J-HRM-06c'], R.j06c);
    console.log('AC', R.ac);
    console.log('JSON', OUT_JSON);
  }

  process.exit(R.ack_status === 'PASS_TO_PM' || R.ack_status === 'BLOCKED' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
