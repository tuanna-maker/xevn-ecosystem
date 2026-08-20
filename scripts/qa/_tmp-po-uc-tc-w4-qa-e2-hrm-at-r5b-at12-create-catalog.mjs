#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG
 * Browser U65 after FE OU-scoped catalogs + Leave empty-state sync CTA
 * Persona: uat.nv0002@xe.vn (manager, trsport) — NOT ceo@
 * Assert: sync-from-xbos 2xx + x-company-id=trsport → leave_types picker ≥1
 * CẤM: seed · invent Leave L2 PASS · reopen AT-12 L1 approve · ceo@ Duyệt
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog',
);
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `W4R5bAT12-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  must_keep: {
    at12_l1_approve: 'CLOSED — not reopened',
    leave_l2: 'SPEC_GAP — not invented PASS',
    ceo_duyet: 'EXPECTED_NO_CTA — not wired',
  },
  env: { PORTAL, HRM, XBOS, MGR_EMAIL, NV_EMAIL, COMPANY, TENANT, STAMP, commit: COMMIT },
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  syncBody: null,
  syncHeaders: null,
  catalogGets: [],
  leaveCreateBody: null,
  ids: { leaveId: null, mgrEmployeeId: null, nvEmployeeId: null },
  preSync: { leaveTypeOptionCount: null, syncCtaVisible: null, emptyHint: null },
  postSync: { leaveTypeOptionCount: null, syncCtaVisible: null },
  residuals: [],
  hdsd_inventory: [],
  seat_verdict: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
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
      if (s.raw?.defaultMembershipId) {
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    }
  }, session);
}

async function forceCompanyScope(page, companyId) {
  await page.evaluate((cid) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('hrm_current_company_id', cid);
      store.setItem('xevn.portal.companyId', cid);
    }
  }, companyId);
  const ou = page
    .locator('button[role="combobox"], [role="combobox"]')
    .filter({ hasText: /đơn vị|rollup|Thương mại|trsport|holding|Tất cả/i })
    .first();
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
      const hdrs = res.request().headers();
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        xCompanyId: hdrs['x-company-id'] || null,
        at: ts(),
      };

      if (method === 'POST' && /settings-catalogs\/sync-from-xbos/.test(u)) {
        try {
          const j = await res.json();
          const d = j?.data ?? j;
          results.syncBody = {
            status: res.status(),
            code: j?.code || d?.code,
            pulledKeys: d?.pulledKeys || d?.pulled_keys || [],
            xCompanyId: entry.xCompanyId,
          };
          results.syncHeaders = { 'x-company-id': entry.xCompanyId };
          entry.code = results.syncBody.code;
          entry.pulledKeysCount = Array.isArray(results.syncBody.pulledKeys)
            ? results.syncBody.pulledKeys.length
            : null;
        } catch {
          results.syncBody = { status: res.status(), xCompanyId: entry.xCompanyId, parseError: true };
        }
        results.network.push(entry);
      }

      if (method === 'GET' && /settings-catalogs/.test(u) && !/sync-from-xbos/.test(u)) {
        results.catalogGets.push(entry);
        results.network.push(entry);
      }

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
        results.network.push(entry);
      }
    } catch {
      /* */
    }
  });
}

async function openLeaveTab(page) {
  const leaveTab = page
    .locator('[role="tab"], button, a')
    .filter({ hasText: /Nghỉ phép|Leave/i })
    .first();
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

async function openCreateDialog(page) {
  const createBtn = page.getByRole('button', {
    name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ|Create request|\+\s*Tạo/i,
  });
  if (!(await createBtn.first().isVisible().catch(() => false))) {
    const clicked = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button, a'));
      const hit = nodes.find((n) =>
        /tạo yêu cầu|tạo đơn|đăng ký nghỉ/i.test((n.textContent || '').trim()),
      );
      if (!hit) return false;
      hit.click();
      return true;
    });
    if (!clicked) return { ok: false, reason: 'no create CTA' };
  } else {
    await createBtn.first().click({ force: true });
  }
  await sleep(2000);
  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no dialog' };
  return { ok: true, dlg };
}

async function probeLeaveTypePicker(page) {
  const dlg = page.locator('[role="dialog"]').first();
  const syncCta = page.getByTestId('hdsd-leave-sync-catalog');
  const syncVisible = await syncCta.isVisible().catch(() => false);

  // Open leave-type combobox (usually 2nd in create dialog after employee)
  const typeTrigger = dlg.locator('button[role="combobox"]').nth(1);
  let optionCount = 0;
  let optionTexts = [];
  let emptyHint = null;
  let opened = false;
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click({ force: true });
    await sleep(800);
    opened = true;
    const opts = page.getByRole('option');
    const texts = await opts.allTextContents().catch(() => []);
    optionTexts = texts
      .map((t) => t.replace(/\s+/g, ' ').trim())
      .filter((t) => t && !/^chọn|select|không có|empty/i.test(t));
    optionCount = optionTexts.length;
    emptyHint = await page
      .locator('text=/Chưa có mục|không có.*danh mục|Mở Cài đặt/i')
      .first()
      .textContent()
      .catch(() => null);
    // Keep popover open if we need sync CTA inside emptyHint; else close for count
    if (optionCount > 0 && !emptyHint) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(300);
    }
  }

  // Sync CTA may live in emptyHint inside the open popover
  const syncVisibleAfter = (await syncCta.isVisible().catch(() => false)) || syncVisible;

  // R5 honesty: emptyHint + CTA => authoritative empty (ignore global option leak)
  const authoritativeEmpty = Boolean(emptyHint) && syncVisibleAfter;
  if (authoritativeEmpty) optionCount = 0;

  return {
    leaveTypeOptionCount: optionCount,
    optionTexts: optionTexts.slice(0, 8),
    syncCtaVisible: syncVisibleAfter,
    emptyHint: emptyHint ? String(emptyHint).slice(0, 160) : null,
    authoritativeEmpty,
    opened,
  };
}

async function clickSyncCta(page) {
  const syncCta = page.getByTestId('hdsd-leave-sync-catalog');
  if (!(await syncCta.isVisible().catch(() => false))) {
    // Ensure leave type picker open so emptyHint CTA shows
    const dlg = page.locator('[role="dialog"]').first();
    const typeTrigger = dlg.locator('button[role="combobox"]').nth(1);
    if (await typeTrigger.isVisible().catch(() => false)) {
      await typeTrigger.click({ force: true });
      await sleep(800);
    }
  }
  if (!(await syncCta.isVisible().catch(() => false))) {
    return { ok: false, reason: 'sync CTA not visible' };
  }
  results.syncBody = null;
  await syncCta.click({ force: true });
  await sleep(5000);
  return { ok: true };
}

async function fillAndSubmitLeave(page, empKeyword) {
  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no dialog' };

  const empTrigger = dlg.locator('button[role="combobox"]').first();
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

  const typeTrigger = dlg.locator('button[role="combobox"]').nth(1);
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click({ force: true });
    await sleep(600);
    const opt = page
      .getByRole('option')
      .filter({ hasText: /phép năm|annual|nghỉ phép|leave/i })
      .first();
    if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    else {
      const any = page.getByRole('option').first();
      if (await any.isVisible().catch(() => false)) await any.click({ force: true });
    }
    await sleep(400);
  }

  // dates if empty
  const dateInputs = dlg.locator('input[placeholder*="dd"], input[type="text"]');
  // Prefer ViDateField via labels — fill reason at least
  const reason = page.getByTestId('hdsd-leave-reason');
  if (await reason.count()) await reason.fill(`QA R5b CREATE-CATALOG ${STAMP}`);
  else {
    const ta = dlg.locator('textarea').first();
    if (await ta.isVisible().catch(() => false)) {
      await ta.fill(`QA R5b CREATE-CATALOG ${STAMP}`);
    }
  }

  // Try set dates via evaluate if fields empty
  await page
    .evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return;
      const inputs = Array.from(dlg.querySelectorAll('input'));
      const today = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const d = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
      for (const inp of inputs) {
        const ph = (inp.getAttribute('placeholder') || '').toLowerCase();
        const aria = (inp.getAttribute('aria-label') || '').toLowerCase();
        if (/dd\/mm|ngày|date|from|to|từ|đến/.test(ph + aria) || inp.value === '') {
          // only touch likely date fields
          if (/dd\/mm|ngày|date/.test(ph + aria)) {
            inp.focus();
            inp.value = d;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    })
    .catch(() => {});

  void dateInputs;
  results.leaveCreateBody = null;
  const submit = dlg.getByRole('button', { name: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(3500);
  const ok =
    results.leaveCreateBody &&
    results.leaveCreateBody.status >= 200 &&
    results.leaveCreateBody.status < 300 &&
    results.leaveCreateBody.id;
  return { ok, body: results.leaveCreateBody, reason: ok ? 'created' : 'create not 2xx' };
}

async function main() {
  log('START', { note: `STAMP=${STAMP} mgr=${MGR_EMAIL}` });
  results.hdsd_inventory = [
    { surface: '/hr/attendance?portal=1&companyId=trsport', used: true },
    { surface: 'Tab Nghỉ phép', used: true },
    { surface: '+ Tạo yêu cầu nghỉ', used: true },
    { surface: 'hdsd-leave-sync-catalog (Đồng bộ từ XBOS)', used: true },
    { surface: 'Leave type CatalogSearchPicker', used: true },
    { surface: 'AT-12 L1 Duyệt', used: false, note: 'CLOSED — not reopened' },
    { surface: 'Leave L2 ladder', used: false, note: 'SPEC_GAP' },
  ];

  if (!(await l0())) {
    setUc('HRM-AT-12-CREATE-CATALOG', 'BLOCKED', { note: 'L0 FAIL' });
    results.seat_verdict = 'BLOCKED';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const mgr = await loginMobile(MGR_EMAIL);
  const nv = await loginMobile(NV_EMAIL);
  recordStep('login_mgr', mgr.ok ? 'PASS' : 'FAIL', {
    summary: `mgr=${MGR_EMAIL} company=${mgr.companyId} roles=${JSON.stringify(mgr.roles)}`,
  });
  recordStep('login_nv', nv.ok ? 'PASS' : 'FAIL', {
    summary: `nv=${NV_EMAIL} company=${nv.companyId}`,
  });
  if (!mgr.ok) {
    setUc('HRM-AT-12-CREATE-CATALOG', 'BLOCKED', { note: 'mgr mobile login failed' });
    results.seat_verdict = 'BLOCKED';
    results.endedAt = ts();
    save();
    process.exit(2);
  }
  results.ids.mgrEmployeeId = mgr.mem?.employee_id || null;
  results.ids.nvEmployeeId = nv.ok ? nv.mem?.employee_id || null : null;

  if (mgr.companyId && mgr.companyId !== COMPANY) {
    recordStep('login_mgr_company', 'WARN', {
      summary: `expected ${COMPANY} got ${mgr.companyId}`,
    });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, {
    ...mgr,
    companyId: COMPANY,
  });

  const url = q('/hr/attendance');
  log('GOTO attendance', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);
  await forceCompanyScope(page, COMPANY);
  await sleep(1500);
  await shot(page, '01-attendance');

  const leaveOk = await openLeaveTab(page);
  recordStep('open_leave_tab', leaveOk ? 'PASS' : 'FAIL', {
    summary: leaveOk ? 'Nghỉ phép opened' : 'tab not found',
  });
  await shot(page, '02-leave-tab');
  if (!leaveOk) {
    results.residuals.push({
      id: 'R-W4-AT12-L1-CREATE-CATALOG-UI',
      sev: 'P0',
      owner: 'dev-fe',
      note: 'Leave tab not found',
    });
    results.seat_verdict = 'FAIL';
    setUc('HRM-AT-12-CREATE-CATALOG', 'FAIL', { note: 'leave tab missing' });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  const created = await openCreateDialog(page);
  recordStep('open_create_dialog', created.ok ? 'PASS' : 'FAIL', {
    summary: created.ok ? 'create dialog open' : created.reason,
  });
  await shot(page, '03-create-dialog');
  if (!created.ok) {
    results.residuals.push({
      id: 'R-W4-AT12-L1-CREATE-CATALOG-UI',
      sev: 'P0',
      owner: 'dev-fe',
      note: created.reason,
    });
    results.seat_verdict = 'FAIL';
    setUc('HRM-AT-12-CREATE-CATALOG', 'FAIL', { note: created.reason });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  // Wait for catalogs GET to settle
  await sleep(2000);
  const pre = await probeLeaveTypePicker(page);
  results.preSync = pre;
  recordStep('pre_sync_picker', pre.leaveTypeOptionCount > 0 || pre.syncCtaVisible ? 'PASS' : 'FAIL', {
    summary: `options=${pre.leaveTypeOptionCount} syncCta=${pre.syncCtaVisible} emptyHint=${pre.emptyHint || 'n/a'}`,
  });
  await shot(page, '04-pre-sync-picker');

  // Catalog GET scope assert (any prior GET)
  const catalogScopeBad = results.catalogGets.filter(
    (g) => g.xCompanyId && g.xCompanyId !== COMPANY && g.xCompanyId !== 'holding',
  );
  const catalogMainOnly = results.catalogGets.filter((g) => g.xCompanyId === 'main');
  recordStep('catalog_get_scope', catalogMainOnly.length === 0 ? 'PASS' : 'FAIL', {
    summary: `gets=${results.catalogGets.length} x-company-id=main count=${catalogMainOnly.length} sample=${JSON.stringify(results.catalogGets.slice(0, 3))}`,
  });

  let syncedThisRun = false;
  if (pre.leaveTypeOptionCount >= 1 && !pre.syncCtaVisible) {
    recordStep('sync_cta_or_options', 'PASS', {
      summary: 'picker already has ≥1 option after prior sync — CTA not required',
    });
  } else if (pre.syncCtaVisible) {
    const click = await clickSyncCta(page);
    recordStep('click_sync_cta', click.ok ? 'PASS' : 'FAIL', {
      summary: click.ok ? 'clicked hdsd-leave-sync-catalog' : click.reason,
    });
    await shot(page, '05-after-sync-click');
    syncedThisRun = click.ok;

    const syncOk =
      results.syncBody &&
      results.syncBody.status >= 200 &&
      results.syncBody.status < 300;
    const syncScopeOk = results.syncBody?.xCompanyId === COMPANY;
    const pulled = Array.isArray(results.syncBody?.pulledKeys) ? results.syncBody.pulledKeys : [];
    const pulledOk = pulled.length > 0;
    const hasLeaveTypes = pulled.includes('leave_types');
    results.syncBody = { ...results.syncBody, pulledKeysCount: pulled.length, hasLeaveTypes };
    recordStep('sync_post', syncOk && syncScopeOk && pulledOk ? 'PASS' : 'FAIL', {
      summary: `status=${results.syncBody?.status} code=${results.syncBody?.code} x-company-id=${results.syncBody?.xCompanyId} pulledKeys=${pulled.length} leave_types=${hasLeaveTypes}`,
    });

    if (!syncOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-SYNC',
        sev: 'P0',
        owner: 'dev-fe',
        note: `sync-from-xbos not 2xx: ${JSON.stringify(results.syncBody)}`,
      });
    } else if (!syncScopeOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-SCOPE',
        sev: 'P0',
        owner: 'dev-fe',
        note: `sync x-company-id=${results.syncBody?.xCompanyId} expected ${COMPANY}`,
      });
    } else if (!pulledOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-BE-PULL',
        sev: 'P1',
        owner: 'dev-be',
        note: 'sync 201 + x-company-id=trsport but pulledKeys=[] — BE pull gap (cấm seed)',
      });
    }


    // Re-probe after invalidate
    await sleep(2500);
    // Re-open create if dialog closed
    if (!(await page.locator('[role="dialog"]').first().isVisible().catch(() => false))) {
      await openCreateDialog(page);
      await sleep(1500);
    }
    const post = await probeLeaveTypePicker(page);
    results.postSync = post;
    recordStep('post_sync_picker', post.leaveTypeOptionCount >= 1 ? 'PASS' : 'FAIL', {
      summary: `options=${post.leaveTypeOptionCount} syncCta=${post.syncCtaVisible} emptyHint=${post.emptyHint || 'n/a'} authEmpty=${post.authoritativeEmpty} texts=${JSON.stringify(post.optionTexts || [])}`,
    });
    await shot(page, '06-post-sync-picker');

    if (syncOk && syncScopeOk && post.leaveTypeOptionCount < 1) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-BE-PULL',
        sev: 'P1',
        owner: 'dev-be',
        note: 'sync 2xx + x-company-id=trsport but leave_types picker still empty — BE pull/publish gap (cấm seed)',
      });
    }
  } else {
    recordStep('sync_cta_or_options', 'FAIL', {
      summary: 'empty picker and sync CTA not visible',
    });
    results.residuals.push({
      id: 'R-W4-AT12-L1-CREATE-CATALOG-UI',
      sev: 'P0',
      owner: 'dev-fe',
      note: 'empty leave_types without hdsd-leave-sync-catalog CTA',
    });
  }

  // Optional U65 create for report (do not claim Leave L2)
  const optionCount =
    results.postSync.leaveTypeOptionCount ?? results.preSync.leaveTypeOptionCount ?? 0;
  if (optionCount >= 1) {
    // Ensure dialog open
    if (!(await page.locator('[role="dialog"]').first().isVisible().catch(() => false))) {
      await openCreateDialog(page);
      await sleep(1000);
    } else {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(400);
      await openCreateDialog(page);
      await sleep(1000);
    }
    const empKw = nv.ok
      ? nv.mem?.employee_code || nv.mem?.employee_name || 'NV'
      : 'NV';
    const c = await fillAndSubmitLeave(page, empKw);
    await shot(page, '07-optional-create');
    recordStep('optional_create', c.ok ? 'PASS' : 'PARTIAL', {
      summary: c.ok
        ? `POST leave-requests ${results.leaveCreateBody?.status} ${results.leaveCreateBody?.code} id=${results.leaveCreateBody?.id} x-company-id=${results.leaveCreateBody?.xCompanyId}`
        : `create not 2xx: ${c.reason} status=${results.leaveCreateBody?.status} code=${results.leaveCreateBody?.code}`,
    });
  } else {
    recordStep('optional_create', 'SKIP', {
      summary: 'picker empty — skip create (not Leave L2 claim)',
    });
  }

  // Verdict
  const syncStep = results.steps.sync_post;
  const postStep = results.steps.post_sync_picker;
  const preHasOptions = (results.preSync.leaveTypeOptionCount || 0) >= 1;
  const postHasOptions = (results.postSync.leaveTypeOptionCount || 0) >= 1;
  const syncPass =
    !syncedThisRun ||
    (syncStep?.verdict === 'PASS' && (postStep?.verdict === 'PASS' || postHasOptions));
  const scopePass = results.steps.catalog_get_scope?.verdict !== 'FAIL';
  const bePullFail = results.residuals.some((r) => r.id === 'R-W4-AT12-L1-CREATE-CATALOG-BE-PULL');
  const uiFail = results.residuals.some((r) =>
    /CREATE-CATALOG-(UI|SYNC|SCOPE)/.test(r.id),
  );

  let seat;
  if (uiFail || !scopePass) seat = 'FAIL';
  else if (bePullFail) seat = 'FAIL';
  else if (preHasOptions || postHasOptions) seat = syncPass ? 'PASS' : 'FAIL';
  else seat = 'FAIL';

  results.seat_verdict = seat;
  setUc('HRM-AT-12-CREATE-CATALOG', seat, {
    note: seat === 'PASS'
      ? 'OU sync scope + leave_types picker ≥1; Leave L2 SPEC_GAP; AT-12 L1 approve untouched'
      : 'see residuals',
    l2: 'SPEC_GAP',
    at12_l1_approve: 'CLOSED',
  });

  results.endedAt = ts();
  save();
  await browser.close();
  console.log('\n=== SEAT', seat, '===');
  console.log('residuals', JSON.stringify(results.residuals, null, 2));
  console.log('sync', JSON.stringify(results.syncBody));
  console.log('pre', JSON.stringify(results.preSync), 'post', JSON.stringify(results.postSync));
  process.exit(seat === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.pageErrors.push(String(e).slice(0, 400));
  results.seat_verdict = 'ERROR';
  results.endedAt = ts();
  save();
  process.exit(3);
});
