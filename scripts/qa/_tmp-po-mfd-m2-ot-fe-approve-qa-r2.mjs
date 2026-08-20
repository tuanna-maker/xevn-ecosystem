#!/usr/bin/env node
/**
 * PO-MFD-M2-OT-FE-APPROVE-QA-R2 — U65 FE OT create → Eye → Duyệt → F5
 * Prior R1 BLOCKED (fetch storm). FE loading fix READY.
 * Persona: NV uat.nv0007 · QL uat.nv0002 · companyId=trsport
 * AC: settle ≤2 idle GETs /5s; CTA visible; create 2xx; approve 2xx + F5
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const NV_EMAIL = 'uat.nv0007@xe.vn';
const MGR_EMAIL = 'uat.nv0002@xe.vn';
const PASSWORDS = ['Xevn@2026', 'xevn-uat-2026'];
const OU = 'trsport';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-ot-fe-approve-qa-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `OTR2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M2-OT-FE-APPROVE-QA-R2',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align:
    'Attendance → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca → Eye → Duyệt → F5',
  prior: {
    r1: 'docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md',
    fe_fix: 'docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md',
  },
  env: { PORTAL, HRM, NV_EMAIL, MGR_EMAIL, OU, STAMP, commit: COMMIT },
  l0: {},
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  ot: {
    createCta: null,
    idleGetsAfterSettle: null,
    employeesInSelect: null,
    create: null,
    approve: null,
    pendingRows: null,
    eyeClicked: false,
    approveClicked: false,
    feStatusAfter: null,
    f5: null,
  },
  screens: [],
  residual: null,
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

function attUrl(companyId = OU) {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${companyId}&_r2=${Date.now()}`;
}

async function l0() {
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    results.l0[name] = { status: r?.status ?? 0, url };
  }
  const ok = results.l0.hrm?.status === 200 && results.l0.portal?.status === 200;
  step('l0', ok ? 'PASS' : 'FAIL', JSON.stringify(results.l0));
  return ok;
}

async function loginMobile(email) {
  for (const password of PASSWORDS) {
    const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.access_token ?? data?.accessToken;
    if (!token) continue;
    const mem = data.active_membership ?? data.memberships?.[0] ?? {};
    return {
      ok: true,
      token,
      passwordUsed: password === PASSWORDS[0] ? 'Xevn@2026' : 'xevn-uat-2026',
      expiresAt: Date.now() + 8 * 3600 * 1000,
      email,
      jwtOu: mem.company_id || OU,
      employeeId: mem.employee_id || null,
      employeeName: mem.employee_name || email,
      user: {
        userId: mem.employee_id || email,
        email,
        displayName: mem.employee_name || email,
        roles: data.roles || ['employee'],
      },
    };
  }
  return { ok: false, email };
}

async function injectPortalAuth(page, session, portalScope = OU) {
  await page.addInitScript(
    (s) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.portalScope);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.portalScope);
        store.setItem('hrm_current_tenant_id', 'xevn');
      }
    },
    { ...session, portalScope },
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err?.message || err).slice(0, 240));
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/attendance\/overtime-requests/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const xCid = res.request().headers()['x-company-id'] || null;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        xCompanyId: xCid,
        at: ts(),
      };
      if (method === 'POST' && /overtime-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
        const j = await res.json().catch(() => ({}));
        const d = j?.data ?? j;
        results.ot.create = {
          status: res.status(),
          code: j?.code,
          id: d?.id,
          xCompanyId: xCid,
          requestStatus: d?.status,
        };
        entry.code = j?.code;
        entry.id = d?.id;
      }
      if (method === 'POST' && /overtime-requests\/[^/]+\/approve/.test(u)) {
        const j = await res.json().catch(() => ({}));
        const d = j?.data ?? j;
        results.ot.approve = {
          status: res.status(),
          code: j?.code,
          id: d?.id,
          xCompanyId: xCid,
          requestStatus: d?.status || d?.request_status,
        };
        entry.code = j?.code;
        entry.requestStatus = d?.status || d?.request_status;
      }
      if (method === 'GET') entry.list = true;
      results.network.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

async function openOtSurface(page) {
  const mgr = page.getByRole('button', { name: /Quản lý đơn/i }).first();
  if (await mgr.isVisible().catch(() => false)) {
    await mgr.click({ force: true });
    await sleep(900);
    const ot = page
      .getByRole('menuitem', { name: /Làm thêm|Đăng ký làm thêm|Overtime|tăng ca/i })
      .first();
    if (await ot.isVisible().catch(() => false)) {
      await ot.click({ force: true });
      await sleep(2500);
      return 'dropdown';
    }
  }
  const tab = page
    .locator('[role="tab"], button')
    .filter({ hasText: /Làm thêm|tăng ca|Overtime/i })
    .first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    await sleep(2500);
    return 'tab';
  }
  return null;
}

async function waitOtReady(page) {
  const loading = page.getByText(/Đang tải/i);
  const createBtn = page.getByRole('button', { name: /Thêm đơn tăng ca/i });
  const title = page.getByText(/Quản lý tăng ca|tăng ca/i).first();
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const cta = await createBtn.first().isVisible().catch(() => false);
    const stillLoad = await loading.first().isVisible().catch(() => false);
    const hasTitle = await title.isVisible().catch(() => false);
    if (cta && !stillLoad) return { ready: true, stillLoad: false, hasTitle };
    if (cta) return { ready: true, stillLoad, hasTitle };
    if (hasTitle && !stillLoad) return { ready: false, stillLoad, hasTitle };
    await sleep(400);
  }
  const stillLoad = await loading.first().isVisible().catch(() => false);
  const cta = await createBtn.first().isVisible().catch(() => false);
  return {
    ready: cta,
    stillLoad,
    hasTitle: await title.isVisible().catch(() => false),
    timedOut: true,
  };
}

/** Count GET overtime-requests in a quiet 5s window after settle. */
async function measureIdleGets() {
  const mark = Date.now();
  await sleep(5000);
  const idle = results.network.filter(
    (n) => n.method === 'GET' && n.list && new Date(n.at).getTime() >= mark,
  );
  results.ot.idleGetsAfterSettle = idle.length;
  const totalGets = results.network.filter((n) => n.method === 'GET' && n.list).length;
  results.ot.totalGetsBeforeIdleWindow = totalGets - idle.length;
  return idle.length;
}

async function tryCreateOt(page) {
  const ready = await waitOtReady(page);
  results.ot.loadState = ready;
  await shot(page, '01-ot-settled');

  const idleGets = await measureIdleGets();
  step(
    'ot_idle_gets',
    idleGets <= 2 ? 'PASS' : 'FAIL',
    `idleGets=${idleGets} (AC ≤2/5s) totalGetsBeforeWindow=${results.ot.totalGetsBeforeIdleWindow}`,
  );

  const buttons = await page.locator('button').evaluateAll((els) =>
    els
      .map((e) => (e.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 40),
  );
  results.ot.buttonInventory = buttons;
  const createBtn = page.getByRole('button', { name: /Thêm đơn tăng ca/i }).first();
  const ctaVisible = await createBtn.isVisible().catch(() => false);
  results.ot.createCta = ctaVisible;
  step('ot_create_cta', ctaVisible ? 'PASS' : 'FAIL', `cta=${ctaVisible} stillLoad=${ready.stillLoad}`);

  if (!ctaVisible) {
    await shot(page, '01-ot-no-create-cta');
    if (ready.stillLoad) return { ok: false, reason: 'ot_stuck_loading' };
    return { ok: false, reason: 'no_create_cta' };
  }
  if (idleGets > 2) {
    await shot(page, '01-ot-still-storm');
    return { ok: false, reason: 'idle_get_storm', idleGets };
  }

  await createBtn.click({ force: true });
  await sleep(1500);
  await shot(page, '02-ot-create-modal');

  const dlg = page.locator('[role="dialog"]').filter({ hasText: /tăng ca|làm thêm|overtime/i }).first();
  const dlgOk = await dlg.isVisible().catch(() => false);
  const dialog = dlgOk ? dlg : page.locator('[role="dialog"]').first();
  if (!(await dialog.isVisible().catch(() => false))) {
    return { ok: false, reason: 'no_dialog' };
  }

  const empCombo = dialog.locator('button[role="combobox"]').first();
  if (!(await empCombo.isVisible().catch(() => false))) {
    await shot(page, '03-ot-no-employee-combo');
    return { ok: false, reason: 'no_employee_combo' };
  }
  await empCombo.click({ force: true });
  await sleep(800);
  const options = page.getByRole('option');
  const optCount = await options.count();
  results.ot.employeesInSelect = optCount;
  if (optCount === 0) {
    await shot(page, '03-ot-employee-catalog-empty');
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'employee_catalog_empty' };
  }
  const prefer = page.getByRole('option', { name: /0007|NV0007/i }).first();
  if (await prefer.isVisible().catch(() => false)) {
    await prefer.click({ force: true });
  } else {
    // Avoid broad UAT match (may pick NV 0201); take first catalog option
    await options.first().click({ force: true });
  }
  await sleep(500);

  const dateBtn = dialog
    .getByRole('button', { name: /Chọn ngày|Pick|Calendar|\/|\d{2}\/\d{2}/i })
    .first();
  if (await dateBtn.isVisible().catch(() => false)) {
    await dateBtn.click({ force: true });
    await sleep(600);
    const day = page
      .locator('[role="gridcell"] button:not([disabled]), button[name*="day"]:not([disabled])')
      .filter({ hasText: /^\d{1,2}$/ })
      .last();
    if (await day.isVisible().catch(() => false)) {
      await day.click({ force: true });
    } else {
      const anyDay = page
        .locator('[data-day], .rdp-day:not(.rdp-day_disabled), button')
        .filter({ hasText: /^\d{1,2}$/ })
        .last();
      if (await anyDay.isVisible().catch(() => false)) await anyDay.click({ force: true });
    }
    await sleep(400);
  }

  const ta = dialog.locator('textarea').first();
  if (await ta.isVisible().catch(() => false)) {
    await ta.fill(`QA OT FE approve R2 ${STAMP}`);
  } else {
    await shot(page, '03-ot-no-reason');
    return { ok: false, reason: 'no_reason_field' };
  }

  await shot(page, '04-ot-form-filled');
  const submit = dialog.getByRole('button', { name: /Thêm mới|Thêm$|Lưu|Gửi|Tạo/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(4000);
  await shot(page, '05-ot-after-submit');

  const created = results.ot.create && results.ot.create.status >= 200 && results.ot.create.status < 300;
  return { ok: !!created, reason: created ? 'created' : 'create_http_fail', create: results.ot.create };
}

async function approveOtAsMgr(page) {
  // Do NOT open status combobox — leftover listbox overlays block Eye click (R2 root cause).
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  let row = page.locator('tbody tr').filter({ hasText: STAMP }).first();
  let rowVisible = await row.isVisible().catch(() => false);
  if (!rowVisible) {
    row = page.locator('tbody tr').filter({ hasText: /status\.pending|Chờ duyệt|\bpending\b/i }).first();
    rowVisible = await row.isVisible().catch(() => false);
  }
  results.ot.pendingRows = await page.locator('tbody tr').count();
  await shot(page, '06-ot-mgr-list');

  if (!rowVisible && results.ot.pendingRows === 0) {
    return { ok: false, reason: 'no_pending_rows' };
  }

  const targetRow = rowVisible
    ? row
    : page.locator('tbody tr').filter({ hasText: /status\.pending|Chờ duyệt|\bpending\b/i }).first();

  // Actions cell last td: Eye then Trash — click first icon button only
  const eyeBtn = targetRow.locator('td').last().locator('button').first();
  if (!(await eyeBtn.isVisible().catch(() => false))) {
    await shot(page, '07-ot-no-eye');
    return { ok: false, reason: 'no_eye_button' };
  }
  await eyeBtn.scrollIntoViewIfNeeded().catch(() => {});
  await eyeBtn.click({ timeout: 5000 });
  results.ot.eyeClicked = true;

  const detail = page.locator('[role="dialog"]').filter({ hasText: /Chi tiết đơn tăng ca/i }).first();
  try {
    await detail.waitFor({ state: 'visible', timeout: 10000 });
  } catch {
    // Retry once via DOM click
    await eyeBtn.evaluate((el) => el.click());
    try {
      await detail.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
      await shot(page, '07-ot-detail-modal');
      return { ok: false, reason: 'detail_modal_not_opened' };
    }
  }
  await sleep(500);
  await shot(page, '07-ot-detail-modal');

  const approveBtn = detail.getByRole('button', { name: /^Duyệt$/i }).first();
  if (!(await approveBtn.isVisible().catch(() => false))) {
    const footerBtns = await detail.locator('button').evaluateAll((els) =>
      els.map((e) => (e.textContent || '').trim()).filter(Boolean),
    );
    results.ot.detailFooterButtons = footerBtns;
    await shot(page, '08-ot-no-approve-btn');
    return { ok: false, reason: 'no_approve_in_detail', footerBtns };
  }
  await approveBtn.click({ timeout: 5000 });
  results.ot.approveClicked = true;
  await sleep(3500);
  await shot(page, '08-ot-after-approve');

  const ap = results.ot.approve;
  const ok = ap && ap.status >= 200 && ap.status < 300 && !/409|SCOPE/i.test(String(ap.code || ''));
  const body = (await page.locator('body').innerText().catch(() => '')) || '';
  results.ot.feStatusAfter = /Đã duyệt|approved|status\.approved/i.test(body);
  return { ok: !!ok, reason: ok ? 'approved' : 'approve_http_fail', approve: ap };
}

async function main() {
  if (!(await l0())) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    process.exit(1);
  }

  const nv = await loginMobile(NV_EMAIL);
  const mgr = await loginMobile(MGR_EMAIL);
  if (!nv.ok || !mgr.ok) {
    step('login', 'FAIL', `nv=${nv.ok} mgr=${mgr.ok}`);
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    process.exit(1);
  }
  step(
    'login',
    'PASS',
    `nv jwtOu=${nv.jwtOu} pwd=${nv.passwordUsed} mgr jwtOu=${mgr.jwtOu} pwd=${mgr.passwordUsed} portal companyId=${OU}`,
  );

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  // --- NV create OT ---
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      bypassCSP: true,
    });
    await ctx.route('**/*', (route) => route.continue());
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, nv, OU);
    await page.goto(attUrl(OU), { waitUntil: 'domcontentloaded', timeout: 120000 });
    // Hard reload to pick FE fix (no stale HMR chunk)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(5000);
    await shot(page, '00-nv-attendance');
    const surface = await openOtSurface(page);
    step('ot_surface_nv', surface ? 'PASS' : 'BLOCKED', `surface=${surface}`);
    if (!surface) {
      results.residual = 'R-MFD-M2-OT-FE-APPROVE — OT menu/surface not found';
      results.verdict = 'BLOCKED';
      results.ack_status = 'BLOCKED';
      await shot(page, '00-nv-no-ot-surface');
      await ctx.close();
      await browser.close();
      results.endedAt = ts();
      save();
      process.exit(2);
    }
    const created = await tryCreateOt(page);
    const createBlocked =
      created.reason === 'employee_catalog_empty' ||
      created.reason === 'no_create_cta' ||
      created.reason === 'ot_stuck_loading' ||
      created.reason === 'idle_get_storm';
    step(
      'ot_fe_create',
      created.ok ? 'PASS' : createBlocked ? 'BLOCKED' : 'FAIL',
      `reason=${created.reason} status=${results.ot.create?.status} code=${results.ot.create?.code} xCid=${results.ot.create?.xCompanyId} idleGets=${results.ot.idleGetsAfterSettle}`,
    );
    if (!created.ok) {
      results.residual =
        created.reason === 'ot_stuck_loading' || created.reason === 'idle_get_storm'
          ? `R-MFD-M2-OT-FE-LOADING — still storm/loading after FE fix (idleGets=${results.ot.idleGetsAfterSettle})`
          : `R-MFD-M2-OT-FE-APPROVE — create blocked: ${created.reason}`;
      results.verdict = createBlocked ? 'BLOCKED' : 'FAIL';
      results.ack_status = results.verdict;
      await ctx.close();
      await browser.close();
      results.endedAt = ts();
      save();
      process.exit(results.verdict === 'BLOCKED' ? 2 : 1);
    }
    const body = (await page.locator('body').innerText().catch(() => '')) || '';
    const feSee = body.includes(STAMP) || /Chờ duyệt|pending/i.test(body);
    step('ot_fe_after_create', feSee ? 'PASS' : 'PARTIAL', `stampVisible=${body.includes(STAMP)}`);
    await ctx.close();
  }

  // --- QL approve ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, mgr, OU);
    await page.goto(attUrl(OU), { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(5000);
    const surface = await openOtSurface(page);
    step('ot_surface_mgr', surface ? 'PASS' : 'FAIL', `surface=${surface}`);
    if (!surface) {
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL';
      results.residual = 'R-MFD-M2-OT-FE-APPROVE — mgr OT surface missing after create';
      await ctx.close();
      await browser.close();
      results.endedAt = ts();
      save();
      process.exit(1);
    }
    await waitOtReady(page);
    const ap = await approveOtAsMgr(page);
    step(
      'ot_fe_approve',
      ap.ok ? 'PASS' : 'FAIL',
      `reason=${ap.reason} status=${results.ot.approve?.status} code=${results.ot.approve?.code} xCid=${results.ot.approve?.xCompanyId} feStatus=${results.ot.feStatusAfter}`,
    );

    if (ap.ok) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(4000);
      await openOtSurface(page);
      await waitOtReady(page);
      await sleep(1500);
      // Search box filters employee_name/code only — do NOT fill STAMP (hides reason match).
      // Prefer status=approved filter to surface approved row after F5.
      const statusCombo = page.locator('button[role="combobox"]').first();
      if (await statusCombo.isVisible().catch(() => false)) {
        await statusCombo.click({ timeout: 3000 }).catch(() => {});
        await sleep(400);
        const apprOpt = page.getByRole('option', { name: /Đã duyệt|approved|status\.approved/i }).first();
        if (await apprOpt.isVisible().catch(() => false)) {
          await apprOpt.click({ timeout: 3000 }).catch(() => {});
          await sleep(800);
        } else {
          await page.keyboard.press('Escape').catch(() => {});
        }
      }
      const body = (await page.locator('body').innerText().catch(() => '')) || '';
      const stampOk = body.includes(STAMP);
      let rowText =
        (await page.locator('tbody tr').filter({ hasText: STAMP }).first().innerText().catch(() => '')) ||
        '';
      if (!rowText && stampOk === false) {
        // Fallback: any approved row from this R2 session (QA OT FE approve R2)
        rowText =
          (await page
            .locator('tbody tr')
            .filter({ hasText: /QA OT FE approve R2/i })
            .filter({ hasText: /status\.approved|Đã duyệt/i })
            .first()
            .innerText()
            .catch(() => '')) || '';
      }
      const rowApproved = /Đã duyệt|status\.approved/i.test(rowText || body);
      const rowHasStamp = (rowText || body).includes(STAMP) || /QA OT FE approve R2/i.test(rowText);
      results.ot.f5 = {
        stampOk: stampOk || rowHasStamp,
        approvedOk: rowApproved,
        pass: (stampOk || rowHasStamp) && rowApproved,
        rowText: (rowText || '').slice(0, 220),
      };
      step(
        'ot_f5',
        results.ot.f5.pass ? 'PASS' : 'FAIL',
        `stampOk=${results.ot.f5.stampOk} approvedOk=${results.ot.f5.approvedOk} row=${(results.ot.f5.rowText || '').slice(0, 80)}`,
      );
      await shot(page, '09-ot-f5');
    }
    await ctx.close();
  }

  await browser.close();

  const settlePass =
    results.steps.ot_idle_gets?.verdict === 'PASS' && results.steps.ot_create_cta?.verdict === 'PASS';
  const createPass = results.steps.ot_fe_create?.verdict === 'PASS';
  const approvePass = results.steps.ot_fe_approve?.verdict === 'PASS';
  const f5Pass = results.steps.ot_f5?.verdict === 'PASS';

  if (settlePass && createPass && approvePass && f5Pass) {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
    results.residual = null;
  } else if (createPass && approvePass && !f5Pass) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.residual = 'R-MFD-M2-OT-FE-APPROVE — approve 2xx but F5 status not confirmed';
  } else {
    results.verdict = results.ack_status || 'FAIL';
    results.ack_status = results.ack_status === 'BLOCKED' ? 'BLOCKED' : 'FAIL';
  }

  results.endedAt = ts();
  save();
  console.log('VERDICT', results.verdict, 'ACK', results.ack_status);
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : results.ack_status === 'BLOCKED' ? 2 : 1);
}

main().catch((e) => {
  console.error(e);
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
  results.endedAt = ts();
  results.pageErrors.push(String(e?.stack || e).slice(0, 500));
  save();
  process.exit(1);
});
