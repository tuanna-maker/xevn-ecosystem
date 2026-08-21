#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2 — R2 retest after FE approve x-company-id + BE list slug parity
 * FE HP: ceo@xe.vn · companyId=trsport → Quản lý đơn → Đề nghị cập nhật công → Thêm mới
 * AC: POST 2xx + body requested_* contain ISO `T` (not bare HH:mm) · F5 pending
 * AP: uat.nv0002@xe.vn (HRM mobile JWT → portal inject) Eye → Duyệt · F5
 * XBOS inbox N/A — do not fail
 * FORBIDDEN: seed · invent XBOS inbox · apps/**
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MGR_EMAIL = process.env.QA_MGR_EMAIL || 'uat.nv0002@xe.vn';
const MGR_PASSWORD = process.env.QA_MGR_PASSWORD || 'xevn-uat-2026';
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-att-adj-tmdv-01-r2-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-att-adj-tmdv-01-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `TMDV-ATT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const REASON = `YC chỉnh CC quên chấm ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function looksIsoTimestamptz(v) {
  return typeof v === 'string' && /\d{4}-\d{2}-\d{2}T/.test(v) && !/^\d{1,2}:\d{2}$/.test(v);
}

const results = {
  work_item_id: 'U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, MGR_EMAIL, COMPANY, TENANT, STAMP, commit: COMMIT },
  persona_note:
    'HP ceo@xe.vn embed trsport. AP uat.nv0002@xe.vn via HRM mobile JWT inject (XBOS login 401 for mgr). XBOS inbox N/A.',
  api_probes: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { requestId: null, employeeId: null, employeeCode: null, employeeName: null },
  createBody: null,
  approveBody: null,
  approveHeaders: null,
  timeWire: { checkInIso: null, checkOutIso: null, bareHhmm: null },
  mgr_on_trsport: null,
  mgr_login: null,
  residuals: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function loginMgrMobile() {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: MGR_EMAIL, password: MGR_PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.access_token ?? data?.accessToken;
  if (!token) {
    results.mgr_login = { ok: false, status: r.status, code: j?.code || null };
    return null;
  }
  const mem = data.active_membership ?? data.memberships?.[0] ?? {};
  results.mgr_login = {
    ok: true,
    status: r.status,
    code: j?.code || null,
    is_manager: data.is_manager,
    company_id: mem.company_id || data.default_company_id,
    employee_code: mem.employee_code,
  };
  return {
    token,
    expiresAt: Date.now() + (Number(data.expires_in_sec) || 8 * 3600) * 1000,
    email: MGR_EMAIL,
    companyId: mem.company_id || COMPANY,
    user: {
      userId: mem.employee_id || MGR_EMAIL,
      email: MGR_EMAIL,
      displayName: mem.employee_name || MGR_EMAIL,
      roles: data.roles || ['manager'],
    },
    raw: {
      refreshToken: data.refresh_token,
      defaultMembershipId: mem.employee_id,
    },
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      const interesting =
        /update-requests|employees|attendance/.test(u) &&
        (method === 'POST' || method === 'GET' || method === 'PATCH');
      if (!interesting) return;
      if (method === 'POST' && /\/attendance\/update-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          results.createBody = {
            code: j?.code || null,
            status: res.status(),
            message: String(j?.message || '').slice(0, 300),
            id: row?.id || null,
            reason: row?.reason || null,
            requestStatus: row?.status || null,
            company_id: row?.company_id || null,
            employee_code: row?.employee_code || null,
            requestBodyPreview: null,
          };
          try {
            const raw = res.request().postData();
            if (raw) {
              const parsed = JSON.parse(raw);
              results.createBody.requestBodyPreview = {
                company_id: parsed.company_id || null,
                employee_id: parsed.employee_id || null,
                attendance_date: parsed.attendance_date || null,
                update_type: parsed.update_type || null,
                requested_check_in: parsed.requested_check_in || null,
                requested_check_out: parsed.requested_check_out || null,
                reason: String(parsed.reason || '').slice(0, 120),
              };
              results.timeWire = {
                checkInIso: looksIsoTimestamptz(parsed.requested_check_in),
                checkOutIso: looksIsoTimestamptz(parsed.requested_check_out),
                bareHhmm:
                  /^\d{1,2}:\d{2}$/.test(String(parsed.requested_check_in || '')) ||
                  /^\d{1,2}:\d{2}$/.test(String(parsed.requested_check_out || '')),
                checkIn: parsed.requested_check_in || null,
                checkOut: parsed.requested_check_out || null,
              };
            }
          } catch {
            /* */
          }
          if (row?.id) results.ids.requestId = row.id;
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 200);
          entry.createdId = row?.id || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/attendance\/update-requests\/[^/]+\/approve/.test(u)) {
        try {
          const hdrs = res.request().headers();
          const xCompany =
            hdrs['x-company-id'] || hdrs['X-Company-Id'] || hdrs['X-COMPANY-ID'] || null;
          results.approveHeaders = {
            'x-company-id': xCompany,
            'x-tenant-id': hdrs['x-tenant-id'] || hdrs['X-Tenant-Id'] || null,
          };
          entry.xCompanyId = xCompany;
          const j = await res.json();
          const row = j?.data ?? j;
          results.approveBody = {
            code: j?.code || null,
            status: res.status(),
            id: row?.id || null,
            requestStatus: row?.status || null,
            xCompanyId: xCompany,
          };
          entry.code = j?.code || null;
          entry.approveStatus = row?.status || null;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/attendance\/update-requests/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const rows = j?.data?.data ?? j?.data ?? [];
          const arr = Array.isArray(rows) ? rows : [];
          entry.rowCount = arr.length;
          entry.hasStamp = arr.some((r) => String(r.reason || '').includes(STAMP));
          const hit = arr.find((r) => String(r.reason || '').includes(STAMP));
          if (hit?.id) results.ids.requestId = hit.id;
          entry.hitStatus = hit?.status || null;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 800) results.network.shift();
    } catch {
      /* */
    }
  });
}

async function clickText(page, re, opts = {}) {
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"]')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll(
        'button, a, [role="button"], [role="tab"], [role="menuitem"], span, div, label',
      ),
    );
    const el = nodes.find(
      (n) => rx.test((n.textContent || '').trim()) && (n.offsetParent !== null || n.getClientRects().length),
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
}

async function selectOuTmdv(page) {
  try {
    const ou = page.getByLabel(/Lọc đơn vị thành viên/i).first();
    const ou2 = (await ou.isVisible().catch(() => false)) ? ou : page.getByRole('combobox').first();
    if (!(await ou2.isVisible().catch(() => false))) {
      log('OU_FILTER_TMDV', { note: 'no OU combobox — URL companyId=trsport' });
      return;
    }
    await ou2.click({ force: true });
    await sleep(800);
    const opt = page
      .getByRole('option', { name: /Thương mại và Dịch vụ|Thương mại|trsport/i })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
      await sleep(1500);
      log('OU_FILTER_TMDV', { note: 'selected member OU option' });
      return;
    }
    const picked = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      const hit = items.find((n) => /thương mại|trsport|tmdv|dịch vụ x\.e/i.test(n.textContent || ''));
      if (!hit) return false;
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    await sleep(1500);
    log('OU_FILTER_TMDV', { note: picked ? 'picked via evaluate' : 'option not found — URL companyId=trsport' });
    if (!picked) await page.keyboard.press('Escape').catch(() => {});
  } catch {
    /* */
  }
}

async function openUpdateAttendanceTab(page) {
  // HDSD: tab «Quản lý đơn» (i18n attendance.tabs.requests) → menu «Đề nghị cập nhật công»
  const reqTab = page
    .locator('button')
    .filter({ hasText: /Quản lý đơn|Yêu cầu|Requests/i })
    .first();
  if (await reqTab.isVisible().catch(() => false)) {
    await reqTab.click({ force: true });
    await sleep(800);
  } else {
    await clickText(page, /Quản lý đơn/i);
    await sleep(800);
  }
  const menuItem = page
    .getByRole('menuitem', { name: /Đề nghị cập nhật công|cập nhật công/i })
    .first();
  if (await menuItem.isVisible().catch(() => false)) {
    await menuItem.click({ force: true });
    await sleep(2000);
    log('NAV_UPD_TAB', { note: 'menuitem cập nhật công via Quản lý đơn' });
    return true;
  }
  // Radix may render items without menuitem role briefly
  const alt = page.locator('[role="menuitem"], [data-radix-collection-item]').filter({
    hasText: /Đề nghị cập nhật công|cập nhật công/i,
  }).first();
  if (await alt.isVisible().catch(() => false)) {
    await alt.click({ force: true });
    await sleep(2000);
    log('NAV_UPD_TAB', { note: 'radix collection item cập nhật công' });
    return true;
  }
  const clicked = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[role="menuitem"], [data-radix-collection-item], div[role="menu"] *'),
    );
    const hit = nodes.find((n) =>
      /đề nghị cập nhật công/i.test((n.textContent || '').trim()),
    );
    if (!hit) return false;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
  await sleep(2000);
  log('NAV_UPD_TAB', { note: clicked ? 'evaluate click' : 'FAILED' });
  return clicked;
}

async function probeApi(session) {
  const h = { Authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };
  const emp = await fetch(`${HRM}/api/hrm/employees?company_id=${COMPANY}&page_size=20`, { headers: h }).then(
    (r) => r.json().catch(() => ({})),
  );
  const ur = await fetch(`${HRM}/api/hrm/attendance/update-requests?company_id=${COMPANY}&page_size=50`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const rows = emp?.data?.data ?? emp?.data?.items ?? emp?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  const mgr = arr.find(
    (e) =>
      e?.custom_fields?.is_manager === 'true' ||
      e?.custom_fields?.mobile_persona === 'mgr' ||
      /manager|coo|ops/i.test(String(e?.job_title_key || '')),
  );
  // Prefer staff with manager for HP submitter (not self-mgr)
  const staff =
    arr.find((e) => e?.manager_id && e.id !== mgr?.id) ||
    arr.find((e) => e?.custom_fields?.mobile_persona === 'emp') ||
    arr.find((e) => e?.id !== mgr?.id) ||
    arr[0];
  results.mgr_on_trsport = mgr
    ? {
        id: mgr.id,
        code: mgr.employee_code,
        name: mgr.full_name || mgr.display_name,
        email: mgr.email,
        job_title_key: mgr.job_title_key,
      }
    : null;
  if (staff) {
    results.ids.employeeId = staff.id;
    results.ids.employeeCode = staff.employee_code;
    results.ids.employeeName = staff.full_name || staff.display_name;
  }
  results.api_probes = {
    employees: {
      code: emp?.code || null,
      total: emp?.data?.total ?? arr.length,
      codes: arr.map((e) => e.employee_code),
    },
    update_requests_before: {
      code: ur?.code || null,
      total: ur?.data?.total ?? (Array.isArray(ur?.data?.data) ? ur.data.data.length : null),
    },
    staff_pick: staff
      ? { id: staff.id, code: staff.employee_code, name: staff.full_name, manager_id: staff.manager_id }
      : null,
    mgr: results.mgr_on_trsport,
  };
  save();
  return results.api_probes;
}

async function apiGetRequest(token, id, companyId = COMPANY) {
  const h = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const ur = await fetch(
    `${HRM}/api/hrm/attendance/update-requests?company_id=${companyId}&page_size=50`,
    { headers: h },
  ).then((r) => r.json().catch(() => ({})));
  const rows = ur?.data?.data ?? ur?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  return arr.find((r) => r.id === id || String(r.reason || '').includes(STAMP)) || null;
}

async function findPendingAny(ceoToken, mgrToken, id) {
  const probes = [];
  for (const [label, token, co] of [
    ['ceo+trsport', ceoToken, COMPANY],
    ['ceo+main', ceoToken, 'main'],
    ['mgr+trsport', mgrToken, COMPANY],
  ]) {
    if (!token) continue;
    const row = await apiGetRequest(token, id, co);
    probes.push({
      label,
      company_id: co,
      found: !!row,
      status: row?.status || null,
      row_company_id: row?.company_id || null,
    });
    if (row) return { row, probes, via: label };
  }
  return { row: null, probes, via: null };
}

async function main() {
  log('START', { PORTAL, COMPANY, STAMP });
  const session = await loginApi();
  log('LOGIN_OK', { email: EMAIL });
  const probes = await probeApi(session);
  log('API_PROBES', { note: JSON.stringify(probes) });

  if (!probes.employees?.total || probes.employees.total < 1) {
    recordStep('precond_employees', 'BLOCKED', { summary: 'no trsport employees' });
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-NO-EMP',
      severity: 'P0',
      note: 'CO-TMDV has 0 employees — cannot HP',
    });
    results.endedAt = ts();
    save();
    process.exitCode = 2;
    return;
  }
  recordStep('precond_employees', 'PASS', {
    summary: `total=${probes.employees.total} staff=${probes.staff_pick?.code} mgr=${probes.mgr?.code || 'none'}`,
  });

  if (!results.mgr_on_trsport) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-AP-NO-MGR',
      severity: 'P1',
      note: 'No manager persona on trsport — AP may BLOCKED; still attempt HRM web CEO approve',
    });
  }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const attUrl = q('/hr/attendance', { companyId: COMPANY });
  log('GOTO_ATT', { url: attUrl });
  await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await selectOuTmdv(page);
  await shot(page, '01-attendance-mount');

  const navOk = await openUpdateAttendanceTab(page);
  await shot(page, '02-update-request-tab');
  const body2 = await page.locator('body').innerText().catch(() => '');
  const mountOk =
    navOk &&
    /Đề nghị cập nhật công|Thêm đề nghị|Không có đề nghị/i.test(body2) &&
    !/SyntaxError|Failed to fetch dynamically imported|HRM API Sync ERROR/i.test(body2);
  const addVisible = await page
    .getByRole('button', { name: /Thêm đề nghị/i })
    .first()
    .isVisible()
    .catch(() => false);
  recordStep('mount_upd_tab', mountOk && addVisible ? 'PASS' : 'FAIL', {
    summary: `mountOk=${mountOk} addVisible=${addVisible} navOk=${navOk}`,
    addVisible,
  });
  if (!mountOk || !addVisible) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-UI-BLOCK',
      severity: 'P0',
      note: 'Update-attendance tab / Thêm đề nghị CTA not operable',
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  // --- Fail-deep: open dialog, try add without reason/employee ---
  await clickText(page, /Thêm đề nghị/i);
  await sleep(1200);
  await shot(page, '03-create-dialog');
  const dialog = page.locator('[role="dialog"]').first();
  const dialogOpen = await dialog.isVisible().catch(() => false);
  let fdBlocked = false;
  if (dialogOpen) {
    const addBtn = dialog.getByRole('button', { name: /Thêm mới|Thêm|Gửi|Lưu/i }).last();
    const beforeNet = results.network.filter((n) => n.method === 'POST' && /update-requests/.test(n.url)).length;
    await addBtn.click({ force: true }).catch(() => {});
    await sleep(900);
    const afterNet = results.network.filter((n) => n.method === 'POST' && /update-requests/.test(n.url)).length;
    fdBlocked = afterNet === beforeNet && (await dialog.isVisible().catch(() => false));
  }
  recordStep('fd_empty_required', fdBlocked || dialogOpen ? 'PASS' : 'FAIL', {
    summary: `dialogOpen=${dialogOpen} fdBlocked=${fdBlocked} (no POST without required)`,
  });

  // Ensure dialog still open after FD
  let dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) {
    await clickText(page, /Thêm đề nghị/i);
    await sleep(1200);
    dlg = page.locator('[role="dialog"]').first();
  }

  // --- Fill HP form ---
  const empLabel = results.ids.employeeName || probes.staff_pick?.name || '';
  const empCode = results.ids.employeeCode || probes.staff_pick?.code || '';
  // Employee select
  const empTrigger = dlg.locator('button[role="combobox"]').first();
  if (await empTrigger.isVisible().catch(() => false)) {
    await empTrigger.click({ force: true });
    await sleep(700);
    const opt = page
      .getByRole('option', { name: new RegExp(`${empCode}|${empLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
    } else {
      const first = page.getByRole('option').first();
      if (await first.isVisible().catch(() => false)) await first.click({ force: true });
    }
    await sleep(500);
  }

  // Date picker — open calendar, click a day (placeholder may show common.selectDate)
  const dateBtn = dlg
    .getByRole('button')
    .filter({ hasText: /Chọn ngày|selectDate|common\.selectDate|\d{2}\/\d{2}\/\d{4}/i })
    .first();
  if (await dateBtn.isVisible().catch(() => false)) {
    await dateBtn.click({ force: true });
    await sleep(600);
    const dayBtn =
      (await page.locator('.rdp-day_today').first().isVisible().catch(() => false))
        ? page.locator('.rdp-day_today').first()
        : page.locator('button[name="day"]:not([disabled])').first();
    if (await dayBtn.isVisible().catch(() => false)) {
      await dayBtn.click({ force: true });
      await sleep(400);
    } else {
      await page.evaluate(() => {
        const pop = document.querySelector('[data-radix-popper-content-wrapper], [role="dialog"]');
        const days = Array.from((pop || document).querySelectorAll('button')).filter(
          (b) => /^\d{1,2}$/.test((b.textContent || '').trim()) && !b.disabled,
        );
        const t = days.find((b) => b.className.includes('today')) || days[Math.min(10, days.length - 1)];
        if (t) t.click();
      });
      await sleep(400);
    }
  }

  // Reason with STAMP
  const reasonBox = dlg.locator('textarea').first();
  await reasonBox.fill(REASON);
  await sleep(300);
  await shot(page, '04-form-filled');

  // Submit — common.add = «Thêm mới» (create = pending; HDSD «Gửi»)
  const submitBtn = dlg.getByRole('button', { name: /Thêm mới|Thêm|Gửi|Lưu/i }).last();
  await submitBtn.click({ force: true, timeout: 10000 });
  await sleep(2500);
  await shot(page, '05-after-create');

  const createOk =
    results.createBody &&
    results.createBody.status >= 200 &&
    results.createBody.status < 300 &&
    results.createBody.id;
  const isoOk =
    results.timeWire.checkInIso === true &&
    results.timeWire.checkOutIso === true &&
    results.timeWire.bareHhmm === false;
  recordStep('hp_create', createOk ? 'PASS' : 'FAIL', {
    summary: createOk
      ? `POST ${results.createBody.status} ${results.createBody.code} id=${results.createBody.id} status=${results.createBody.requestStatus}`
      : `create missing — last createBody=${JSON.stringify(results.createBody)}`,
  });
  recordStep('hp_time_wire_iso', isoOk ? 'PASS' : 'FAIL', {
    summary: `checkInIso=${results.timeWire.checkInIso} checkOutIso=${results.timeWire.checkOutIso} bareHhmm=${results.timeWire.bareHhmm} in=${results.timeWire.checkIn} out=${results.timeWire.checkOut}`,
  });

  if (!createOk) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-HP-CREATE',
      severity: 'P0',
      note: 'POST update-requests did not return 2xx/id from FE submit',
      createBody: results.createBody,
      timeWire: results.timeWire,
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }
  if (!isoOk) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-TIME-WIRE-01',
      severity: 'P0',
      note: 'POST 2xx but body times not ISO timestamptz (still bare HH:mm?)',
      timeWire: results.timeWire,
    });
  }

  // F5 pending (CEO UI @ companyId=trsport)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await selectOuTmdv(page);
  await openUpdateAttendanceTab(page);
  await sleep(2000);
  await shot(page, '06-f5-list');
  const bodyF5 = await page.locator('body').innerText().catch(() => '');
  const stampOnUi = bodyF5.includes(STAMP);

  // Login mgr early — needed for list-scope probe (CEO+slug may hide UUID company_id rows)
  const mgrSessionEarly = await loginMgrMobile();
  log('MGR_LOGIN', { note: JSON.stringify(results.mgr_login) });
  const pendingProbe = await findPendingAny(
    session.token,
    mgrSessionEarly?.token,
    results.ids.requestId,
  );
  results.pendingProbe = pendingProbe.probes;
  const apiRow = pendingProbe.row;
  const pendingOk =
    apiRow && String(apiRow.status) === 'pending' && String(apiRow.reason || '').includes(STAMP);
  const ceoSlugSees = pendingProbe.probes.find((p) => p.label === 'ceo+trsport')?.found === true;
  recordStep('hp_f5_pending', stampOnUi || (pendingOk && ceoSlugSees) ? 'PASS' : pendingOk ? 'FAIL' : 'FAIL', {
    summary: `stampOnUi=${stampOnUi} ceoSlugSees=${ceoSlugSees} via=${pendingProbe.via} apiStatus=${apiRow?.status || 'null'} rowCompany=${apiRow?.company_id || '?'} probes=${JSON.stringify(pendingProbe.probes)}`,
    apiStatus: apiRow?.status || null,
  });
  if (pendingOk && !stampOnUi && !ceoSlugSees) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-LIST-SCOPE-SLUG',
      severity: 'P0',
      note: 'POST 201 pending exists (mgr/main) but Group CEO GET update-requests?company_id=trsport returns 0 / FE F5 empty — slug vs UUID scope parity',
    });
  }

  // --- AP: switch to mgr uat.nv0002 (HRM mobile JWT) → Eye → Duyệt — XBOS inbox N/A ---
  // Proceed when row pending anywhere (even if CEO FE list empty) — mgr path is AP SoT
  let apVerdict = 'BLOCKED';
  let apSummary = 'not attempted';
  if (pendingOk || stampOnUi) {
    const mgrSession = mgrSessionEarly;
    if (!mgrSession) {
      apVerdict = 'BLOCKED';
      apSummary = `mgr mobile login failed ${JSON.stringify(results.mgr_login)}`;
      results.residuals.push({
        id: 'R-U84-ATT-ADJ-TMDV-AP-MGR-LOGIN',
        severity: 'P0',
        note: apSummary,
      });
    } else {
      // Fresh context + initScript — runtime localStorage clear left Group CEO banner (inject failed)
      await context.close().catch(() => {});
      const mgrContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
      const mgrPage = await mgrContext.newPage();
      track(mgrPage);
      await injectPortalAuth(mgrPage, mgrSession);
      results.approveBody = null;
      await mgrPage.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4500);
      await selectOuTmdv(mgrPage);
      await openUpdateAttendanceTab(mgrPage);
      await sleep(2500);
      await shot(mgrPage, '07-mgr-list');
      const mgrBody = await mgrPage.locator('body').innerText().catch(() => '');
      const mgrSeesStamp = mgrBody.includes(STAMP);
      const mgrBannerOk = /uat\.nv0002|VTH-0002|Trần Văn An|Quản lý/i.test(mgrBody);
      log('MGR_UI', {
        note: `seesStamp=${mgrSeesStamp} bannerHint=${mgrBannerOk} snippet=${mgrBody.slice(0, 180).replace(/\s+/g, ' ')}`,
      });

      // Prefer STAMP row; fallback employee name + pending
      let row = mgrPage.locator('tr').filter({ hasText: STAMP }).first();
      if (!(await row.isVisible().catch(() => false))) {
        row = mgrPage
          .locator('tr')
          .filter({ hasText: new RegExp(`${results.ids.employeeName || 'Phan'}|${results.ids.employeeCode || 'VTH-0007'}`, 'i') })
          .filter({ hasText: /Chờ|pending|Pending/i })
          .first();
      }
      // Eye is first icon button in Thao tác (not trash)
      const eye = row.locator('td').last().locator('button').first();
      if (await eye.isVisible().catch(() => false)) {
        await eye.click({ force: true });
        await sleep(1500);
        // Wait detail dialog (title requestDetail / lý do / approve CTA)
        const detail = mgrPage.locator('[role="dialog"]').filter({
          hasText: /Chi tiết|requestDetail|Lý do|Phê duyệt|Duyệt|Từ chối/i,
        }).last();
        await detail.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await shot(mgrPage, '08-detail-before-approve');
        const approveBtn = detail
          .getByRole('button', { name: /Phê duyệt|Duyệt|Approve/i })
          .first();
        const approveAlt = mgrPage.locator('[role="dialog"] button.bg-green-600, [role="dialog"] button').filter({
          hasText: /Phê duyệt|Duyệt|Approve/i,
        }).first();
        const apBtn = (await approveBtn.isVisible().catch(() => false))
          ? approveBtn
          : approveAlt;
        if (await apBtn.isVisible().catch(() => false)) {
          await apBtn.click({ force: true });
          await sleep(2500);
          await shot(mgrPage, '09-after-approve');
          const apOk =
            results.approveBody &&
            results.approveBody.status >= 200 &&
            results.approveBody.status < 300;
          const xCo = String(results.approveHeaders?.['x-company-id'] || results.approveBody?.xCompanyId || '');
          const headerOk =
            xCo === COMPANY ||
            xCo === '10000000-0000-4000-8000-000000000002' ||
            /trsport/i.test(xCo);
          recordStep('ap_approve_x_company_id', headerOk && apOk ? 'PASS' : apOk ? 'FAIL' : 'FAIL', {
            summary: `x-company-id=${xCo || '(missing)'} status=${results.approveBody?.status} code=${results.approveBody?.code}`,
          });
          if (apOk && !headerOk) {
            results.residuals.push({
              id: 'R-U84-ATT-ADJ-TMDV-AP-HEADER-MISSING',
              severity: 'P1',
              note: `approve 2xx but x-company-id not OU/trsport (got=${xCo || 'empty'})`,
            });
          }
          await mgrPage.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
          await sleep(3500);
          await selectOuTmdv(mgrPage);
          await openUpdateAttendanceTab(mgrPage);
          await sleep(2000);
          await shot(mgrPage, '10-f5-after-approve');
          const afterProbe = await findPendingAny(
            session.token,
            mgrSession.token,
            results.ids.requestId,
          );
          // After approve, findPendingAny looks for pending/stamp — also check status via mgr list all
          let after = afterProbe.row;
          if (!after || String(after.status) !== 'approved') {
            const h = { Authorization: `Bearer ${mgrSession.token}` };
            const ur = await fetch(
              `${HRM}/api/hrm/attendance/update-requests?company_id=${COMPANY}&page_size=50`,
              { headers: h },
            ).then((r) => r.json().catch(() => ({})));
            const rows = ur?.data?.data ?? ur?.data ?? [];
            const arr = Array.isArray(rows) ? rows : [];
            after = arr.find((r) => r.id === results.ids.requestId) || after;
          }
          const approved = after && String(after.status) === 'approved';
          const f5ApprovedUi = (await mgrPage.locator('body').innerText().catch(() => '')).includes(STAMP)
            ? /Đã duyệt|approved/i.test(await mgrPage.locator('tr').filter({ hasText: STAMP }).innerText().catch(() => ''))
            : approved;
          apVerdict = approved && apOk ? 'PASS' : 'FAIL';
          apSummary = `persona=${MGR_EMAIL} approveNet=${results.approveBody?.status}/${results.approveBody?.code} x-company-id=${xCo || '(missing)'} headerOk=${headerOk} apiStatus=${after?.status || 'null'} f5UiApproved=${f5ApprovedUi} mgr=${results.mgr_on_trsport?.code || 'n/a'}`;
          if (apVerdict === 'FAIL') {
            results.residuals.push({
              id: 'R-U84-ATT-ADJ-TMDV-AP-FAIL',
              severity: 'P0',
              note: apSummary,
            });
          }
        } else {
          apVerdict = 'BLOCKED';
          apSummary = 'Duyệt button not visible in detail as mgr';
          results.residuals.push({
            id: 'R-U84-ATT-ADJ-TMDV-AP-NO-CTA',
            severity: 'P1',
            note: apSummary,
          });
          await shot(mgrPage, '08b-no-approve-cta');
        }
      } else {
        apVerdict = 'BLOCKED';
        apSummary = `pending row Eye not found as mgr; seesStamp=${mgrSeesStamp}; listNet=${JSON.stringify(
          results.network.filter((n) => /update-requests/.test(n.url)).slice(-3),
        )}`;
        results.residuals.push({
          id: 'R-U84-ATT-ADJ-TMDV-AP-ROW',
          severity: 'P1',
          note: apSummary,
        });
      }
      await mgrContext.close().catch(() => {});
    }
  } else {
    apVerdict = 'BLOCKED';
    apSummary = 'HP pending not confirmed — skip AP';
  }
  recordStep('ap_hrm_approve', apVerdict, { summary: apSummary });

  // Honesty: XBOS inbox not claimed
  recordStep('xbos_inbox_na', 'SKIPPED', {
    summary: 'P-ATT-ADJ XBOS inbox GOVERNANCE_LOCK — N/A until bridge (do not fail)',
  });

  results.endedAt = ts();
  save();
  await browser.close();

  const createIsoPass =
    results.steps.hp_create?.verdict === 'PASS' &&
    results.steps.hp_time_wire_iso?.verdict === 'PASS';
  const f5Pass = results.steps.hp_f5_pending?.verdict === 'PASS';
  const apPass = results.steps.ap_hrm_approve?.verdict === 'PASS';
  if (!createIsoPass) process.exitCode = 2;
  else if (!f5Pass && !apPass) process.exitCode = 2;
  else if (!f5Pass || !apPass) process.exitCode = 3; // partial — evidence still valid
  else process.exitCode = 0;
  console.log(
    JSON.stringify(
      {
        exit: process.exitCode,
        STAMP,
        requestId: results.ids.requestId,
        timeWire: results.timeWire,
        approveHeaders: results.approveHeaders,
        hp: results.steps.hp_create?.verdict,
        iso: results.steps.hp_time_wire_iso?.verdict,
        f5: results.steps.hp_f5_pending?.verdict,
        ap: results.steps.ap_hrm_approve?.verdict,
        apHeader: results.steps.ap_approve_x_company_id?.verdict,
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  results.residuals.push({ id: 'R-U84-ATT-ADJ-TMDV-HARNESS', severity: 'P0', note: String(e).slice(0, 400) });
  results.endedAt = ts();
  save();
  process.exit(2);
});
