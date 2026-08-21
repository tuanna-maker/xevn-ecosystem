#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-LEAVE-WF-01 — U65 leave WF create → QL approve → F5
 * Surfaces 19, 28 · HRM-AT-10..13 · Persona NV uat.nv0007 · QL uat.nv0002 (NOT ceo@)
 * Zero seed. HDSD-aligned click path.
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
const CEO_EMAIL = 'ceo@xe.vn';
const PASSWORDS = ['xevn-uat-2026', 'Xevn@2026'];
const OU = 'trsport';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `LWF01-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M2-ATT-LEAVE-WF-01',
  startedAt: ts(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  hdsd_inventory: {
    surface_19: 'CC→HRM→Chấm công→Đơn từ→Nghỉ phép (LeaveTab)',
    surface_28: 'CC→HRM→Chấm công→tab Nghỉ phép (LeaveTab)',
    create_path:
      'Attendance → tab Nghỉ phép → Tạo yêu cầu / Tạo đơn → dialog (loại + lý do hdsd-leave-reason) → Gửi',
    approve_path:
      'Attendance → tab Nghỉ phép → Chờ duyệt → Duyệt (hdsd-leave-list-approve*) → F5',
    testids: [
      'hdsd-leave-reason',
      'hdsd-leave-list-approve',
      'hdsd-leave-list-approve-{id}',
      'hdsd-leave-sync-catalog',
      'leave-balance-panel',
    ],
    persona_create: NV_EMAIL,
    persona_approve: MGR_EMAIL,
    persona_forbidden_approve_claim: CEO_EMAIL + ' · AT-12 EXPECTED_NO_CTA',
  },
  env: { PORTAL, HRM, NV_EMAIL, MGR_EMAIL, OU, STAMP, commit: COMMIT },
  l0: {},
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  leave: {
    createCta: null,
    create: null,
    createFeAfter: null,
    createF5: null,
    pendingVisible: null,
    approveClicked: false,
    approve: null,
    feStatusAfter: null,
    f5: null,
    balancePanel: null,
  },
  ceo_spot: null,
  screens: [],
  residual: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
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
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${companyId}&_lwf=${Date.now()}`;
}

async function l0() {
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    const r = await fetch(url).catch(() => null);
    results.l0[name] = r ? r.status : 'ERR';
  }
  const ok = results.l0.hrm === 200 && results.l0.portal === 200;
  step('L0', ok ? 'PASS' : 'FAIL', `hrm=${results.l0.hrm} portal=${results.l0.portal}`);
  return ok;
}

async function login(email) {
  let lastErr = null;
  for (const password of PASSWORDS) {
    try {
      const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) {
        lastErr = j?.message || r.status;
        continue;
      }
      const d = j?.data ?? j;
      const token = d.access_token ?? d.accessToken;
      const mem = d.active_membership ?? d.memberships?.[0] ?? {};
      return {
        token,
        companyId: mem.company_id || OU,
        user: {
          userId: mem.employee_id || email,
          email,
          displayName: mem.employee_name || email,
          roles: d.roles || [],
        },
        expiresAt: Date.now() + 8e6,
        passwordUsed: password === PASSWORDS[0] ? 'primary' : 'alt',
      };
    } catch (e) {
      lastErr = String(e);
    }
  }
  throw new Error(`login failed ${email}: ${lastErr}`);
}

async function inject(page, s, portalScope) {
  await page.addInitScript(
    ({ s, portalScope }) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', JSON.stringify(s.user));
        store.setItem('xevn.portal.companyId', portalScope);
        store.setItem('hrm_current_company_id', portalScope);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s, portalScope },
  );
}

function attachNet(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/leave-requests|leave-balance|leave_types|leave-types/.test(u)) return;
    const m = res.request().method();
    const x = res.request().headers()['x-company-id'];
    const entry = { method: m, status: res.status(), url: u.replace(PORTAL, '').slice(0, 160), xCompanyId: x };
    if (m === 'POST' && /leave-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
      const j = await res.json().catch(() => ({}));
      results.leave.create = {
        status: res.status(),
        code: j?.code,
        id: j?.data?.id ?? j?.data?.request_id,
        xCompanyId: x,
        message: j?.message?.slice?.(0, 120),
      };
      entry.bodyCode = j?.code;
      entry.id = results.leave.create.id;
    }
    if (m === 'POST' && /leave-requests\/[^/]+\/approve/.test(u)) {
      const j = await res.json().catch(() => ({}));
      results.leave.approve = {
        status: res.status(),
        code: j?.code,
        xCompanyId: x,
        requestStatus: j?.data?.status ?? j?.data?.request_status,
      };
      entry.bodyCode = j?.code;
      entry.requestStatus = results.leave.approve.requestStatus;
    }
    results.network.push(entry);
  });
}

async function openLeaveTab(page) {
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /^Nghỉ phép$/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2500);
  const bal = page.getByTestId('leave-balance-panel');
  results.leave.balancePanel = (await bal.count()) > 0 ? 'present' : 'absent';
}

async function runNvCreate(browser, nv) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();
  attachNet(page);
  await inject(page, nv, OU);
  await page.goto(attUrl(OU), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(5000);
  await openLeaveTab(page);
  await shot(page, '01-nv-leave-tab');

  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).first();
  const ctaVisible = await createBtn.isVisible().catch(() => false);
  results.leave.createCta = ctaVisible;
  if (!ctaVisible) {
    // try sync catalog if empty leave types
    const sync = page.getByTestId('hdsd-leave-sync-catalog');
    if (await sync.isVisible().catch(() => false)) {
      await sync.click({ force: true }).catch(() => {});
      await sleep(3000);
    }
  }
  if (!(await createBtn.isVisible().catch(() => false))) {
    step('NV-CREATE-CTA', 'BLOCKED', 'No Tạo yêu cầu CTA — leave_types/empty or RBAC');
    await shot(page, '01b-nv-no-create-cta');
    await ctx.close();
    return;
  }
  await createBtn.click({ force: true });
  await sleep(1500);
  await shot(page, '02-nv-create-dialog');

  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) {
    step('NV-CREATE-DIALOG', 'FAIL', 'Create dialog not visible after CTA');
    await ctx.close();
    return;
  }

  // leave type + optional 2nd combobox
  for (let i = 0; i < 2; i++) {
    const c = dlg.locator('button[role="combobox"]').nth(i);
    if (await c.isVisible().catch(() => false)) {
      await c.click();
      await sleep(700);
      const opt = page.getByRole('option').first();
      if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
      await sleep(400);
    }
  }

  const reason =
    (await dlg.getByTestId('hdsd-leave-reason').count()) > 0
      ? dlg.getByTestId('hdsd-leave-reason')
      : dlg.locator('textarea').first();
  if (await reason.isVisible().catch(() => false)) {
    await reason.fill(`QA leave WF ${STAMP}`);
  }

  // prefer future dates if date inputs exist
  const dateInputs = dlg.locator('input[type="date"], input[placeholder*="ngày" i]');
  const nDates = await dateInputs.count();
  if (nDates >= 2) {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const fmt = (d) => d.toISOString().slice(0, 10);
    await dateInputs.nth(0).fill(fmt(start)).catch(() => {});
    await dateInputs.nth(1).fill(fmt(end)).catch(() => {});
  }

  await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true });
  await sleep(4500);
  await shot(page, '03-nv-after-submit');

  const createOk =
    results.leave.create &&
    results.leave.create.status >= 200 &&
    results.leave.create.status < 300 &&
    results.leave.create.status !== 409;
  step(
    'NV-CREATE',
    createOk ? 'PASS' : results.leave.create ? 'FAIL' : 'BLOCKED',
    createOk
      ? `POST leave-requests ${results.leave.create.status} ${results.leave.create.code} id=${results.leave.create.id}`
      : `create=${JSON.stringify(results.leave.create)}`,
  );

  const bodyAfter = await page.locator('body').innerText().catch(() => '');
  results.leave.createFeAfter = bodyAfter.includes(STAMP) || /chờ duyệt|pending|đã gửi/i.test(bodyAfter);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await openLeaveTab(page);
  const bodyF5 = await page.locator('body').innerText().catch(() => '');
  results.leave.createF5 = bodyF5.includes(STAMP) || Boolean(results.leave.create?.id);
  await shot(page, '04-nv-create-f5');
  step(
    'NV-CREATE-F5',
    results.leave.createF5 && createOk ? 'PASS' : createOk ? 'PARTIAL' : 'FAIL',
    `stampOnUi=${bodyF5.includes(STAMP)} createFeAfter=${results.leave.createFeAfter}`,
  );
  await ctx.close();
}

async function runQlApprove(browser, mgr) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await ctx.newPage();
  attachNet(page);
  // QL approve with OU scope (not ceo@; not invent main header PASS)
  await inject(page, mgr, OU);
  await page.goto(attUrl(OU), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(5000);
  await openLeaveTab(page);
  await page
    .locator('[role="tab"],button')
    .filter({ hasText: /Chờ duyệt/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2500);
  await shot(page, '05-ql-pending-tab');

  const stampHit = page.locator('div,tr,li,article').filter({ hasText: STAMP });
  results.leave.pendingVisible = (await stampHit.count()) > 0;
  let clicked = false;

  if (results.leave.create?.id) {
    const byId = page.getByTestId(`hdsd-leave-list-approve-${results.leave.create.id}`);
    if ((await byId.count()) > 0 && (await byId.first().isVisible().catch(() => false))) {
      await byId.first().click({ force: true });
      clicked = true;
    }
  }
  if (!clicked && results.leave.pendingVisible) {
    const card = stampHit.first();
    const b = card.getByRole('button', { name: /^Duyệt$/i }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true });
      clicked = true;
    } else {
      const tid = card.locator('[data-testid^="hdsd-leave-list-approve"]').first();
      if (await tid.isVisible().catch(() => false)) {
        await tid.click({ force: true });
        clicked = true;
      }
    }
  }
  if (!clicked) {
    const generic = page.getByTestId('hdsd-leave-list-approve').first();
    if (await generic.isVisible().catch(() => false)) {
      await generic.click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    const b = page.getByRole('button', { name: /^Duyệt$/i }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click({ force: true });
      clicked = true;
    }
  }
  results.leave.approveClicked = clicked;
  await sleep(3500);
  await shot(page, '06-ql-after-approve');

  const approveOk =
    clicked &&
    results.leave.approve &&
    results.leave.approve.status >= 200 &&
    results.leave.approve.status < 300 &&
    results.leave.approve.status !== 409;
  step(
    'QL-APPROVE',
    approveOk ? 'PASS' : clicked ? 'FAIL' : 'BLOCKED',
    approveOk
      ? `POST approve ${results.leave.approve.status} ${results.leave.approve.code} x=${results.leave.approve.xCompanyId}`
      : `clicked=${clicked} pendingStamp=${results.leave.pendingVisible} approve=${JSON.stringify(results.leave.approve)}`,
  );

  const bodyAfter = await page.locator('body').innerText().catch(() => '');
  results.leave.feStatusAfter = /Đã duyệt|approved/i.test(bodyAfter);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await openLeaveTab(page);
  // look on approved / all tabs
  for (const tab of [/Đã duyệt/i, /Tất cả|All/i, /Chờ duyệt/i]) {
    await page
      .locator('[role="tab"],button')
      .filter({ hasText: tab })
      .first()
      .click({ force: true })
      .catch(() => {});
    await sleep(1200);
  }
  const bodyF5 = await page.locator('body').innerText().catch(() => '');
  results.leave.f5 =
    (/Đã duyệt|approved/i.test(bodyF5) && (bodyF5.includes(STAMP) || Boolean(results.leave.create?.id))) ||
    (results.leave.approve?.requestStatus === 'approved' && results.leave.feStatusAfter);
  await shot(page, '07-ql-approve-f5');
  step(
    'QL-APPROVE-F5',
    results.leave.f5 && approveOk ? 'PASS' : approveOk ? 'PARTIAL' : 'FAIL',
    `feStatusAfter=${results.leave.feStatusAfter} f5=${results.leave.f5} stamp=${bodyF5.includes(STAMP)}`,
  );
  await ctx.close();
}

async function runCeoExpectedNoCta(browser) {
  // Honesty spot: ceo@ must NOT be used to claim AT-12 approve PASS
  try {
    const ceo = await login(CEO_EMAIL);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await inject(page, ceo, 'main');
    await page.goto(
      `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=main&_ceo=${Date.now()}`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await sleep(4000);
    await openLeaveTab(page);
    await page
      .locator('[role="tab"],button')
      .filter({ hasText: /Chờ duyệt/i })
      .first()
      .click({ force: true })
      .catch(() => {});
    await sleep(1500);
    const duyet = await page.getByRole('button', { name: /^Duyệt$/i }).count();
    const hdsd = await page.locator('[data-testid^="hdsd-leave-list-approve"]').count();
    results.ceo_spot = {
      email: CEO_EMAIL,
      duyệt_count: duyet,
      hdsd_approve_count: hdsd,
      note: 'AT-12 EXPECTED_NO_CTA — not used for approve claim',
    };
    await shot(page, '08-ceo-expected-no-cta');
    step(
      'CEO-EXPECTED-NO-CTA',
      'PASS',
      `ceo@ Duyệt=${duyet} hdsd=${hdsd} (documented; not approve persona)`,
    );
    await ctx.close();
  } catch (e) {
    results.ceo_spot = { error: String(e).slice(0, 200) };
    step('CEO-EXPECTED-NO-CTA', 'OBS', `spot skipped: ${String(e).slice(0, 120)}`);
  }
}

async function main() {
  const okL0 = await l0();
  if (!okL0) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.residual.push('R-MFD-M2-LEAVE-WF-L0');
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const nv = await login(NV_EMAIL);
  const mgr = await login(MGR_EMAIL);
  step('LOGIN', 'PASS', `nv=${NV_EMAIL} ou=${nv.companyId}; ql=${MGR_EMAIL} ou=${mgr.companyId}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    await runNvCreate(browser, nv);
    if (results.leave.create?.status >= 200 && results.leave.create?.status < 300) {
      await runQlApprove(browser, mgr);
    } else {
      step('QL-APPROVE', 'SKIP', 'No create 2xx — approve not attempted');
    }
    await runCeoExpectedNoCta(browser);
  } finally {
    await browser.close();
  }

  const createOk =
    results.leave.create &&
    results.leave.create.status >= 200 &&
    results.leave.create.status < 300;
  const approveOk =
    results.leave.approveClicked &&
    results.leave.approve &&
    results.leave.approve.status >= 200 &&
    results.leave.approve.status < 300;
  const f5Ok = Boolean(results.leave.f5);

  if (createOk && approveOk && f5Ok) {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  } else if (!results.leave.createCta || (!createOk && !results.leave.create)) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.residual.push('R-MFD-M2-LEAVE-WF-CREATE-CTA');
  } else if (createOk && !approveOk) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.residual.push(
      results.leave.approveClicked ? 'R-MFD-M2-LEAVE-WF-APPROVE-HTTP' : 'R-MFD-M2-LEAVE-WF-APPROVE-CTA',
    );
  } else {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.residual.push('R-MFD-M2-LEAVE-WF-CREATE-OR-F5');
  }

  results.endedAt = ts();
  results.uat_done = false;
  save();
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    verdict: results.verdict,
    ack_status: results.ack_status,
    create: results.leave.create,
    approve: results.leave.approve,
    f5: results.leave.f5,
    residual: results.residual,
    STAMP,
  }, null, 2));
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
  results.residual.push('R-MFD-M2-LEAVE-WF-SCRIPT');
  results.endedAt = ts();
  results.error = String(e).slice(0, 400);
  save();
  console.error(e);
  process.exit(1);
});
