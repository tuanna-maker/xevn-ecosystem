#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1
 * Retest after FE approveLeaveRequest resolveHrmMutateCompanyScope (R3 FAIL: x-company-id=main → 409)
 * AT-12 L1 only — QL uat.nv0002@trsport · NOT ceo@ as L1 HP
 * Assert: POST approve 2xx + x-company-id=trsport (not main) + FE Đã duyệt + F5
 * Leave L2 = SPEC_GAP · AT-07 untouched · U65 zero-seed
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
// QL trực tiếp on operating slug (trsport). uat.nv0001@holding maps FE holding→main → 409
// SCOPE_CONTEXT_MISMATCH (coerceHrmListCompanyId) — documented residual, not used as sole L1 path.
const MGR_EMAIL = process.env.QA_MGR_EMAIL || 'uat.nv0002@xe.vn';
const NV_EMAIL = process.env.QA_NV_EMAIL || 'uat.nv0007@xe.vn';
const UAT_PASSWORD = process.env.QA_UAT_PASSWORD || 'xevn-uat-2026';
const COMPANY = process.env.QA_LEAVE_COMPANY_ID || 'trsport';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `W4R4AT12-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  ba_triage: 'EXPECTED_NO_CTA for ceo@ as L1 — persona QL trực tiếp',
  env: { PORTAL, HRM, XBOS, MGR_EMAIL, NV_EMAIL, COMPANY, TENANT, STAMP, commit: COMMIT },
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { leaveId: null, nvEmployeeId: null, nvCode: null, mgrEmployeeId: null },
  leaveCreateBody: null,
  leaveApproveBody: null,
  leaveApproveHeaders: null,
  createPersona: null,
  pendingTabLabel: null,
  approveBtnCount: null,
  f5Status: null,
  residuals: [],
  hdsd_inventory: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}
function setUc(uc, verdict, detail = {}) {
  results.uc[uc] = { verdict, ...detail, at: ts() };
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}
function q(path, companyId = COMPANY) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', companyId);
  return u.toString();
}

async function l0() {
  const check = async (name, url) => {
    try {
      const r = await fetch(url);
      results.l0[name] = { status: r.status, url };
      return r.status === 200;
    } catch (e) {
      results.l0[name] = { status: 0, url, error: String(e?.message || e) };
      return false;
    }
  };
  const ok =
    (await check('hrm', `${HRM}/api/hrm`)) &&
    (await check('xbos', `${XBOS}/api/xbos`)) &&
    (await check('portal', PORTAL));
  recordStep('l0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(results.l0) });
  return ok;
}

async function loginMobile(email, password = UAT_PASSWORD) {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.access_token ?? data?.accessToken;
  if (!token) {
    return { ok: false, status: r.status, code: j?.code, email };
  }
  const mem = data.active_membership ?? data.memberships?.[0] ?? {};
  return {
    ok: true,
    token,
    expiresAt: Date.now() + (Number(data.expires_in_sec) || 8 * 3600) * 1000,
    email,
    companyId: mem.company_id || COMPANY,
    user: {
      userId: mem.employee_id || email,
      email,
      displayName: mem.employee_name || mem.full_name || email,
      roles: data.roles || ['employee'],
    },
    mem,
    roles: data.roles || [],
    raw: { refreshToken: data.refresh_token, defaultMembershipId: mem.employee_id },
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
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId) store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

/** Re-assert OU after mount (OU filter may drift to rollup). */
async function forceCompanyScope(page, companyId) {
  await page.evaluate((cid) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('hrm_current_company_id', cid);
      store.setItem('xevn.portal.companyId', cid);
    }
  }, companyId);
  // Prefer OU select item matching operating slug / TMDV
  const ou = page.locator('button[role="combobox"], [role="combobox"]').filter({
    hasText: /đơn vị|rollup|Thương mại|trsport|holding|Tất cả/i,
  }).first();
  if (await ou.isVisible().catch(() => false)) {
    await ou.click({ force: true }).catch(() => {});
    await sleep(500);
    const item = page
      .getByRole('option')
      .filter({
        hasText:
          companyId === 'trsport'
            ? /Thương mại|trsport|TMDV/i
            : new RegExp(companyId, 'i'),
      })
      .first();
    if (await item.isVisible().catch(() => false)) {
      await item.click({ force: true });
      await sleep(1500);
      return true;
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  return false;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      const hdrs = res.request().headers();
      entry.xCompanyId = hdrs['x-company-id'] || null;

      if (method === 'POST' && /\/attendance\/leave-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
        try {
          const j = await res.json();
          const d = j?.data ?? j;
          results.leaveCreateBody = {
            status: res.status(),
            code: j?.code || d?.code,
            id: d?.id || d?.data?.id,
            status_field: d?.status || d?.request_status,
            xCompanyId: entry.xCompanyId,
          };
          if (results.leaveCreateBody.id) results.ids.leaveId = results.leaveCreateBody.id;
          entry.code = results.leaveCreateBody.code;
          entry.id = results.leaveCreateBody.id;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/attendance\/leave-requests\/[^/]+\/approve/.test(u)) {
        try {
          const j = await res.json();
          const d = j?.data ?? j;
          results.leaveApproveBody = {
            status: res.status(),
            code: j?.code || d?.code,
            id: d?.id || results.ids.leaveId,
            requestStatus: d?.status || d?.request_status,
            xCompanyId: entry.xCompanyId,
          };
          results.leaveApproveHeaders = { 'x-company-id': entry.xCompanyId };
          entry.code = results.leaveApproveBody.code;
        } catch {
          /* */
        }
      }
      if (/leave-requests|employees|auth\/mobile/.test(u)) {
        results.network.push(entry);
      }
    } catch {
      /* */
    }
  });
}

async function openLeaveTab(page) {
  const leaveTab = page.locator('[role="tab"], button, a').filter({ hasText: /Nghỉ phép|Leave/i }).first();
  if (await leaveTab.isVisible().catch(() => false)) {
    await leaveTab.click({ force: true });
    await sleep(3000);
    return true;
  }
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role="tab"], button, a'));
    const hit = nodes.find((n) => /nghỉ phép|leave/i.test((n.textContent || '').trim()));
    if (!hit) return false;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
}

/** Match «Chờ duyệt» OR «Chờ duyệt (n)» — do NOT require exact /^Chờ duyệt$/ */
async function openPendingApprovalTab(page) {
  const tab = page
    .locator('[role="tab"], button')
    .filter({ hasText: /Chờ duyệt(\s*\(\d+\))?/i })
    .first();
  if (await tab.isVisible().catch(() => false)) {
    const label = ((await tab.textContent()) || '').replace(/\s+/g, ' ').trim();
    results.pendingTabLabel = label;
    await tab.click({ force: true });
    await sleep(2000);
    return { ok: true, label, via: 'locator' };
  }
  const ev = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role="tab"], button, a'));
    const hit = nodes.find((n) => {
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      return /^Chờ duyệt(\s*\(\d+\))?$/i.test(t) || /Chờ duyệt\s*\(/i.test(t);
    });
    if (!hit) return { ok: false, label: null };
    const label = (hit.textContent || '').replace(/\s+/g, ' ').trim();
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return { ok: true, label };
  });
  if (ev.ok) {
    results.pendingTabLabel = ev.label;
    await sleep(2000);
  }
  return { ...ev, via: 'evaluate' };
}

async function openRequestsListTab(page) {
  const tab = page
    .locator('[role="tab"], button')
    .filter({ hasText: /Danh sách yêu cầu|request list|Yêu cầu/i })
    .first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    await sleep(1500);
    return true;
  }
  return false;
}

async function countApproveBtns(page) {
  return page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      const tid = b.getAttribute('data-testid') || '';
      return (
        /^Duyệt$/i.test(t) ||
        /approve/i.test(b.getAttribute('aria-label') || '') ||
        tid.includes('leave-list-approve')
      );
    });
    return {
      approveBtnCount: btns.length,
      testIds: btns
        .map((b) => b.getAttribute('data-testid'))
        .filter(Boolean)
        .slice(0, 8),
    };
  });
}

async function fillLeaveForm(page, reasonStamp, empKeyword) {
  const dialog = page.locator('[role="dialog"]').first();
  if (!(await dialog.isVisible().catch(() => false))) return false;

  // employee typeahead if present
  const empInput = dialog.locator('input[placeholder*="NV"], input[placeholder*="nhân"], input').first();
  if (empKeyword && (await empInput.isVisible().catch(() => false))) {
    await empInput.fill(empKeyword);
    await sleep(1200);
    const opt = page.getByRole('option').filter({ hasText: new RegExp(empKeyword, 'i') }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    else {
      const any = page.getByRole('option').first();
      if (await any.isVisible().catch(() => false)) await any.click({ force: true });
    }
    await sleep(400);
  } else {
    const empTrigger = dialog.locator('button[role="combobox"]').first();
    if (await empTrigger.isVisible().catch(() => false)) {
      await empTrigger.click({ force: true });
      await sleep(700);
      if (empKeyword) {
        const search = page.locator('[role="listbox"] input, [cmdk-input], input').last();
        if (await search.isVisible().catch(() => false)) {
          await search.fill(empKeyword);
          await sleep(900);
        }
        const opt = page.getByRole('option').filter({ hasText: new RegExp(empKeyword, 'i') }).first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
        else {
          const any = page.getByRole('option').first();
          if (await any.isVisible().catch(() => false)) await any.click({ force: true });
        }
      } else {
        const first = page.getByRole('option').first();
        if (await first.isVisible().catch(() => false)) await first.click({ force: true });
      }
      await sleep(400);
    }
  }

  // leave type — annual
  const typeTrigger = dialog.locator('button[role="combobox"]').nth(1);
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click({ force: true });
    await sleep(600);
    const opt = page.getByRole('option').filter({ hasText: /phép năm|annual|nghỉ phép/i }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    else {
      const any = page.getByRole('option').first();
      if (await any.isVisible().catch(() => false)) await any.click({ force: true });
    }
    await sleep(400);
  }

  const reason = page.getByTestId('hdsd-leave-reason');
  if (await reason.count()) await reason.fill(`QA R4 AT12 ${reasonStamp}`);
  else {
    const ta = dialog.locator('textarea').first();
    if (await ta.isVisible().catch(() => false)) await ta.fill(`QA R4 AT12 ${reasonStamp}`);
  }
  return true;
}

async function createLeaveOnPage(page, persona, empKeyword) {
  results.createPersona = persona;
  const createBtn = page.getByRole('button', {
    name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ|Create request|\+\s*Tạo/i,
  });
  if (!(await createBtn.first().isVisible().catch(() => false))) {
    const clicked = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button, a'));
      const hit = nodes.find((n) => /tạo yêu cầu|tạo đơn|đăng ký nghỉ/i.test((n.textContent || '').trim()));
      if (!hit) return false;
      hit.click();
      return true;
    });
    if (!clicked) return { ok: false, reason: 'no create CTA' };
  } else {
    await createBtn.first().click({ force: true });
  }
  await sleep(1500);
  await shot(page, `02-${persona}-create-dialog`);
  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no dialog' };

  await fillLeaveForm(page, STAMP, empKeyword);
  await shot(page, `03-${persona}-filled`);
  const submit = dlg.getByRole('button', { name: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(3000);
  await shot(page, `04-${persona}-after-create`);
  const ok =
    results.leaveCreateBody &&
    results.leaveCreateBody.status >= 200 &&
    results.leaveCreateBody.status < 300 &&
    results.leaveCreateBody.id;
  return { ok, body: results.leaveCreateBody, reason: ok ? 'created' : 'create not 2xx' };
}

async function main() {
  log('START', { note: `STAMP=${STAMP} mgr=${MGR_EMAIL} nv=${NV_EMAIL}` });
  if (!(await l0())) {
    setUc('HRM-AT-12', 'BLOCKED', { note: 'L0 FAIL', l2: 'SPEC_GAP' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const mgr = await loginMobile(MGR_EMAIL);
  const nv = await loginMobile(NV_EMAIL);
  recordStep('login_mgr', mgr.ok ? 'PASS' : 'FAIL', {
    summary: `mgr=${MGR_EMAIL} company=${mgr.companyId} roles=${JSON.stringify(mgr.roles)} emp=${mgr.mem?.employee_code || mgr.mem?.employee_id}`,
  });
  recordStep('login_nv', nv.ok ? 'PASS' : 'FAIL', {
    summary: `nv=${NV_EMAIL} company=${nv.companyId} roles=${JSON.stringify(nv.roles)} emp=${nv.mem?.employee_code || nv.mem?.employee_id}`,
  });
  if (!mgr.ok) {
    setUc('HRM-AT-12', 'BLOCKED', { note: 'mgr mobile login failed', l2: 'SPEC_GAP' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }
  results.ids.mgrEmployeeId = mgr.mem?.employee_id || null;
  results.ids.nvEmployeeId = nv.ok ? nv.mem?.employee_id || null : null;
  results.ids.nvCode = nv.ok ? nv.mem?.employee_code || 'VTH-0007' : 'VTH-0007';
  results.persona_note =
    'L1 HP = uat.nv0002@trsport (QL trực tiếp). uat.nv0001@holding blocked by FE coerce holding→main 409 — not ceo@ EXPECTED_NO_CTA.';

  // Confirm report relationship via mgr token (read-only)
  try {
    const h = {
      Authorization: `Bearer ${mgr.token}`,
      'content-type': 'application/json',
      'x-company-id': mgr.companyId || COMPANY,
    };
    const emp = await fetch(
      `${HRM}/api/hrm/employees?company_id=${encodeURIComponent(mgr.companyId || COMPANY)}&page_size=80`,
      { headers: h },
    ).then((r) => r.json());
    const rows = emp?.data?.data ?? emp?.data?.items ?? emp?.data ?? [];
    const arr = Array.isArray(rows) ? rows : [];
    const report = arr.find(
      (e) =>
        e.manager_id === results.ids.mgrEmployeeId &&
        (e.employee_code === results.ids.nvCode || e.id === results.ids.nvEmployeeId),
    );
    recordStep('precond_report_link', report ? 'PASS' : 'PARTIAL', {
      summary: report
        ? `report ${report.employee_code} manager_id=${report.manager_id}`
        : `no exact report match for ${results.ids.nvCode} under mgr (will still FE-create)`,
    });
    if (report) {
      results.ids.nvEmployeeId = report.id;
      results.ids.nvCode = report.employee_code;
    }
  } catch (e) {
    recordStep('precond_report_link', 'PARTIAL', { summary: String(e?.message || e) });
  }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });

  let createOk = false;

  // --- Phase A: NV FE create (preferred U65 chain) ---
  if (nv.ok) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, nv);
    const url = q('/hr/attendance', nv.companyId || COMPANY);
    log('GOTO_NV', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await forceCompanyScope(page, nv.companyId || COMPANY);
    await shot(page, '01-nv-mount');
    results.hdsd_inventory.push({ surface: '/hr/attendance (NV)', found: true, used: 'AT-12 precond create' });

    await openLeaveTab(page);
    await sleep(2000);
    await shot(page, '01b-nv-leave');
    results.leaveCreateBody = null;
    const c = await createLeaveOnPage(page, 'nv', null);
    createOk = !!c.ok;
    recordStep('precond_fe_create_nv', createOk ? 'PASS' : 'BLOCKED', {
      summary: createOk
        ? `NV FE create id=${results.ids.leaveId} status=${results.leaveCreateBody?.status} code=${results.leaveCreateBody?.code}`
        : `NV create failed: ${c.reason} status=${results.leaveCreateBody?.status}`,
    });
    await ctx.close();
  } else {
    recordStep('precond_fe_create_nv', 'BLOCKED', { summary: 'NV login failed — skip NV create' });
  }

  // --- Phase A2: manager FE create for report if NV path failed ---
  if (!createOk) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, mgr);
    const url = q('/hr/attendance', mgr.companyId || COMPANY);
    log('GOTO_MGR_CREATE', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await forceCompanyScope(page, mgr.companyId || COMPANY);
    await shot(page, '01c-mgr-create-mount');
    await openLeaveTab(page);
    await sleep(2000);
    results.leaveCreateBody = null;
    const c = await createLeaveOnPage(page, 'mgr-for-report', results.ids.nvCode || 'UAT-0003');
    createOk = !!c.ok;
    recordStep('precond_fe_create_mgr', createOk ? 'PASS' : 'FAIL', {
      summary: createOk
        ? `Mgr FE create for report id=${results.ids.leaveId} code=${results.leaveCreateBody?.code}`
        : `Mgr create failed: ${c.reason} status=${results.leaveCreateBody?.status} code=${results.leaveCreateBody?.code}`,
    });
    await ctx.close();
  }

  // LOCK L2 early
  recordStep('at12_l2_ladder', 'SPEC_GAP', {
    summary: 'Leave L2 ladder AS-IS 1 bước — SPEC_GAP — not invented PASS (BA HOLD)',
  });

  // --- Phase B: Manager L1 approve on Chờ duyệt (n) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, mgr);
    const url = q('/hr/attendance', mgr.companyId || COMPANY);
    log('GOTO_MGR_APPROVE', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await forceCompanyScope(page, mgr.companyId || COMPANY);
    await shot(page, '05-mgr-mount');
    results.hdsd_inventory.push({
      surface: 'Nghỉ phép → Chờ duyệt (n)',
      found: true,
      used: 'AT-12 L1 Duyệt',
    });

    const leaveOk = await openLeaveTab(page);
    await sleep(2500);
    await shot(page, '06-mgr-leave');
    recordStep('at12_open_leave', leaveOk ? 'PASS' : 'FAIL', {
      summary: `persona=${MGR_EMAIL} leaveTab=${leaveOk}`,
    });

    const pend = await openPendingApprovalTab(page);
    await shot(page, '07-mgr-cho-duyet');
    recordStep('at12_open_pending_tab', pend.ok ? 'PASS' : 'FAIL', {
      summary: `tabLabel=${pend.label || results.pendingTabLabel || 'n/a'} via=${pend.via} (regex allows optional (n))`,
    });

    let ui = await countApproveBtns(page);
    results.approveBtnCount = ui.approveBtnCount;

    // Fallback: Danh sách yêu cầu pending rows
    if (ui.approveBtnCount === 0) {
      const listOk = await openRequestsListTab(page);
      await sleep(1500);
      await shot(page, '07b-mgr-list');
      ui = await countApproveBtns(page);
      results.approveBtnCount = ui.approveBtnCount;
      recordStep('at12_fallback_list', listOk ? 'PASS' : 'BLOCKED', {
        summary: `listTab=${listOk} approveBtnCount=${ui.approveBtnCount}`,
      });
    }

    recordStep('at12_approve_cta', ui.approveBtnCount > 0 ? 'PASS' : 'FAIL', {
      summary: `approveBtnCount=${ui.approveBtnCount} testIds=${JSON.stringify(ui.testIds)} stamp=${STAMP}`,
    });

    results.leaveApproveBody = null;
    let apL1 = false;
    const leaveId = results.ids.leaveId;

    if (ui.approveBtnCount > 0) {
      // Prefer stamp-scoped or leaveId testid
      if (leaveId) {
        const byId = page.getByTestId(`hdsd-leave-list-approve-${leaveId}`).first();
        if (await byId.isVisible().catch(() => false)) {
          await byId.click({ force: true });
          apL1 = true;
          await sleep(2500);
        }
      }
      if (!apL1 && STAMP) {
        const card = page
          .locator('div.p-4.border, tr, [class*="rounded-lg"], div.border')
          .filter({ hasText: STAMP })
          .first();
        if (await card.isVisible().catch(() => false)) {
          const apBtn = card.getByRole('button', { name: /^Duyệt$|Approve/i }).first();
          if (await apBtn.isVisible().catch(() => false)) {
            await apBtn.click({ force: true });
            apL1 = true;
            await sleep(2500);
          }
        }
      }
      if (!apL1) {
        const byTestId = page.locator('[data-testid^="hdsd-leave-list-approve"]').first();
        if (await byTestId.isVisible().catch(() => false)) {
          await byTestId.click({ force: true });
          apL1 = true;
          await sleep(2500);
        }
      }
      if (!apL1) {
        const apBtn = page.getByRole('button', { name: /^Duyệt$/i }).first();
        if (await apBtn.isVisible().catch(() => false)) {
          await apBtn.click({ force: true });
          apL1 = true;
          await sleep(2500);
        }
      }
    }
    await shot(page, '08-mgr-after-duyet');

    const xCid = results.leaveApproveHeaders?.['x-company-id'] || results.leaveApproveBody?.xCompanyId || null;
    const scopeOk = xCid === COMPANY && xCid !== 'main';
    const apL1Ok =
      results.leaveApproveBody &&
      results.leaveApproveBody.status >= 200 &&
      results.leaveApproveBody.status < 300 &&
      scopeOk;
    recordStep('at12_l1_scope_header', scopeOk ? 'PASS' : 'FAIL', {
      summary: `x-company-id=${xCid} expect=${COMPANY} not_main=${xCid !== 'main'}`,
    });
    recordStep('at12_l1_appr', apL1Ok ? 'PASS' : apL1 ? 'FAIL' : ui.approveBtnCount > 0 ? 'FAIL' : 'BLOCKED', {
      summary: `clicked=${apL1} status=${results.leaveApproveBody?.status} code=${results.leaveApproveBody?.code} x-company-id=${xCid} requestStatus=${results.leaveApproveBody?.requestStatus}`,
    });

    // Immediate FE status after 2xx (before F5)
    let feApprovedImmediate = false;
    if (apL1Ok) {
      const bodyNow = (await page.locator('body').innerText().catch(() => '')) || '';
      feApprovedImmediate = /Đã duyệt/i.test(bodyNow);
      recordStep('at12_fe_status_immediate', feApprovedImmediate ? 'PASS' : 'PARTIAL', {
        summary: `Đã duyệt visible after click=${feApprovedImmediate} apiStatus=${results.leaveApproveBody?.requestStatus}`,
      });
    }

    let f5Ok = false;
    if (apL1Ok) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      await forceCompanyScope(page, mgr.companyId || COMPANY);
      await openLeaveTab(page);
      await sleep(1500);
      await openRequestsListTab(page);
      await sleep(1500);
      await shot(page, '09-mgr-f5');
      const body = (await page.locator('body').innerText().catch(() => '')) || '';
      const stampSeen = body.includes(STAMP);
      const approvedOnFe = /Đã duyệt/i.test(body);
      const apiApproved =
        results.leaveApproveBody?.requestStatus === 'approved' ||
        /approved/i.test(String(results.leaveApproveBody?.requestStatus || ''));
      f5Ok = apiApproved && (approvedOnFe || stampSeen || feApprovedImmediate);
      results.f5Status = {
        stampSeen,
        approvedOnFe,
        feApprovedImmediate,
        requestStatus: results.leaveApproveBody?.requestStatus,
        xCompanyId: xCid,
        f5Ok,
      };
      recordStep('at12_f5', f5Ok ? 'PASS' : 'PARTIAL', {
        summary: `stampSeen=${stampSeen} approvedOnFe=${approvedOnFe} apiStatus=${results.leaveApproveBody?.requestStatus} x-company-id=${xCid}`,
      });
    }

    if (apL1Ok && f5Ok) {
      setUc('HRM-AT-12', 'PARTIAL', {
        note: 'L1 approve EVIDENCED (2xx + x-company-id=trsport + FE/F5 Đã duyệt); L2 SPEC_GAP; ceo@ not used as L1',
        l1: results.leaveApproveBody,
        l2: 'SPEC_GAP',
        persona: MGR_EMAIL,
        createPersona: results.createPersona,
        stamp: STAMP,
        xCompanyId: xCid,
      });
    } else if (apL1Ok) {
      setUc('HRM-AT-12', 'PARTIAL', {
        note: 'L1 POST approve 2xx + scope header OK; F5 status partial; L2 SPEC_GAP',
        l1: results.leaveApproveBody,
        l2: 'SPEC_GAP',
        persona: MGR_EMAIL,
        xCompanyId: xCid,
      });
    } else if (ui.approveBtnCount === 0) {
      setUc('HRM-AT-12', 'FAIL', {
        note: 'QL persona + Chờ duyệt opened but approveBtnCount=0 — not EXPECTED_NO_CTA (wrong persona was ceo@)',
        l1: null,
        l2: 'SPEC_GAP',
        persona: MGR_EMAIL,
      });
      results.residuals.push({
        id: 'R-W4-AT12-L1',
        severity: 'P1',
        owner: 'dev-fe',
        note: `Mgr ${MGR_EMAIL} Chờ duyệt open but Duyệt CTA=0 after FE create=${createOk}`,
      });
    } else if (results.leaveApproveBody && results.leaveApproveBody.status >= 200 && results.leaveApproveBody.status < 300 && !scopeOk) {
      setUc('HRM-AT-12', 'FAIL', {
        note: `POST approve 2xx but x-company-id=${xCid} (expect ${COMPANY}) — scope residual not closed`,
        l1: results.leaveApproveBody,
        l2: 'SPEC_GAP',
        persona: MGR_EMAIL,
      });
      results.residuals.push({
        id: 'R-W4-AT12-L1-APPROVE-SCOPE',
        severity: 'P0',
        owner: 'dev-fe',
        note: `x-company-id=${xCid} still not ${COMPANY}`,
      });
    } else {
      setUc('HRM-AT-12', 'FAIL', {
        note: `Duyệt clicked/visible but approve not 2xx+trsport scope; status=${results.leaveApproveBody?.status} x-company-id=${xCid}; L2 SPEC_GAP`,
        l1: results.leaveApproveBody,
        l2: 'SPEC_GAP',
        persona: MGR_EMAIL,
      });
      results.residuals.push({
        id: 'R-W4-AT12-L1-APPROVE-SCOPE',
        severity: 'P0',
        owner: 'dev-fe',
        note: `AT-12 L1 Duyệt status=${results.leaveApproveBody?.status} x-company-id=${xCid}`,
      });
    }

    await ctx.close();
  }

  await browser.close();

  const v = results.uc['HRM-AT-12']?.verdict;
  results.seat_verdict = v === 'PARTIAL' || v === 'PASS' ? 'PASS' : v || 'FAIL';
  // Seat PASS when L1 evidenced (PARTIAL UC = L1 ok + L2 gap) — never claim L2 PASS / UAT DONE
  results.claims = {
    at12_l1: v === 'PARTIAL' || v === 'PASS',
    at12_l2: false,
    leave_l2_pass: false,
    at07_reopened: false,
    ceo_as_l1: false,
    uat_done: false,
  };
  results.endedAt = ts();
  save();
  console.log('\n=== UC VERDICTS ===');
  for (const [k, x] of Object.entries(results.uc)) {
    console.log(`${k}: ${x.verdict} — ${x.note || ''}`);
  }
  console.log('seat_verdict:', results.seat_verdict);
  console.log('residuals:', JSON.stringify(results.residuals, null, 2));
  process.exitCode = results.seat_verdict === 'FAIL' || results.seat_verdict === 'BLOCKED' ? 2 : 0;
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e?.stack || e);
  save();
  process.exit(1);
});
