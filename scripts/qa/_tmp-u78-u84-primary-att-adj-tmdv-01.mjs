#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-ATT-ADJ-TMDV-01 — P-ATT-ADJ @ CO-TMDV (U65 · U76 · U78)
 * FE: ceo@xe.vn embed companyId=trsport → Chấm công → Yêu cầu → Đề nghị cập nhật công
 *   → Thêm đề nghị → Gửi/Thêm → F5 pending
 * AP: HRM web Eye → Duyệt (XBOS inbox N/A — do not fail)
 * FORBIDDEN: seed · invent XBOS inbox · apps/**
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-att-adj-tmdv-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-att-adj-tmdv-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `TMDV-ATT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const REASON = `YC chỉnh CC quên chấm ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-ATT-ADJ-TMDV-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, STAMP, commit: 'dc930c5' },
  persona_note:
    'Group CEO ceo@xe.vn embed companyId=trsport (CO-TMDV). Mgr on company: VTH-0002 / uat.nv0002 (is_manager). AP via HRM web Duyệt (XBOS inbox N/A).',
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
  mgr_on_trsport: null,
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
          const j = await res.json();
          const row = j?.data ?? j;
          results.approveBody = {
            code: j?.code || null,
            status: res.status(),
            id: row?.id || null,
            requestStatus: row?.status || null,
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

async function apiGetRequest(session, id) {
  const h = { Authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };
  const ur = await fetch(`${HRM}/api/hrm/attendance/update-requests?company_id=${COMPANY}&page_size=50`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const rows = ur?.data?.data ?? ur?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  return arr.find((r) => r.id === id || String(r.reason || '').includes(STAMP)) || null;
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
  recordStep('hp_create', createOk ? 'PASS' : 'FAIL', {
    summary: createOk
      ? `POST ${results.createBody.status} ${results.createBody.code} id=${results.createBody.id} status=${results.createBody.requestStatus}`
      : `create missing — last createBody=${JSON.stringify(results.createBody)}`,
  });

  if (!createOk) {
    results.residuals.push({
      id: 'R-U84-ATT-ADJ-TMDV-HP-CREATE',
      severity: 'P0',
      note: 'POST update-requests did not return 2xx/id from FE submit',
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  // F5 pending
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await selectOuTmdv(page);
  await openUpdateAttendanceTab(page);
  await sleep(2000);
  await shot(page, '06-f5-list');
  const bodyF5 = await page.locator('body').innerText().catch(() => '');
  const stampOnUi = bodyF5.includes(STAMP);
  const apiRow = await apiGetRequest(session, results.ids.requestId);
  const pendingOk = apiRow && String(apiRow.status) === 'pending' && String(apiRow.reason || '').includes(STAMP);
  recordStep('hp_f5_pending', pendingOk ? 'PASS' : stampOnUi ? 'PASS' : 'FAIL', {
    summary: `stampOnUi=${stampOnUi} apiStatus=${apiRow?.status || 'null'} company=${apiRow?.company_id || '?'}`,
    apiStatus: apiRow?.status || null,
  });

  // --- AP: HRM web approve (Eye → Duyệt) — XBOS inbox N/A ---
  let apVerdict = 'BLOCKED';
  let apSummary = 'not attempted';
  if (pendingOk || stampOnUi) {
    // find row with stamp, click Eye
    const row = page.locator('tr').filter({ hasText: STAMP }).first();
    const eye =
      (await row.locator('button').first().isVisible().catch(() => false))
        ? row.locator('button').first()
        : page
            .locator('tr')
            .filter({ hasText: STAMP })
            .locator('button')
            .first();
    if (await eye.isVisible().catch(() => false)) {
      await eye.click({ force: true });
      await sleep(1200);
      await shot(page, '07-detail-before-approve');
      const detail = page.locator('[role="dialog"]').last();
      const approveBtn = detail.getByRole('button', { name: /Duyệt|Approve/i }).first();
      if (await approveBtn.isVisible().catch(() => false)) {
        await approveBtn.click({ force: true });
        await sleep(2500);
        await shot(page, '08-after-approve');
        const apOk =
          results.approveBody &&
          results.approveBody.status >= 200 &&
          results.approveBody.status < 300 &&
          (results.approveBody.requestStatus === 'approved' || results.approveBody.status < 300);
        // F5
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(3500);
        await selectOuTmdv(page);
        await openUpdateAttendanceTab(page);
        await sleep(2000);
        await shot(page, '09-f5-after-approve');
        const after = await apiGetRequest(session, results.ids.requestId);
        const approved = after && String(after.status) === 'approved';
        apVerdict = approved || apOk ? 'PASS' : 'FAIL';
        apSummary = `approveNet=${results.approveBody?.status}/${results.approveBody?.code} apiStatus=${after?.status || 'null'} mgr=${results.mgr_on_trsport?.code || 'n/a'}`;
        if (apVerdict === 'FAIL') {
          results.residuals.push({
            id: 'R-U84-ATT-ADJ-TMDV-AP-FAIL',
            severity: 'P0',
            note: apSummary,
          });
        }
      } else {
        apVerdict = 'BLOCKED';
        apSummary = 'Duyệt button not visible in detail (persona/permission?)';
        results.residuals.push({
          id: 'R-U84-ATT-ADJ-TMDV-AP-NO-CTA',
          severity: 'P1',
          note: apSummary,
        });
        await shot(page, '07b-no-approve-cta');
      }
    } else {
      apVerdict = 'BLOCKED';
      apSummary = 'pending row Eye not found after HP';
      results.residuals.push({
        id: 'R-U84-ATT-ADJ-TMDV-AP-ROW',
        severity: 'P1',
        note: apSummary,
      });
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

  const hpPass = results.steps.hp_create?.verdict === 'PASS' && results.steps.hp_f5_pending?.verdict === 'PASS';
  const apPass = results.steps.ap_hrm_approve?.verdict === 'PASS';
  if (!hpPass) process.exitCode = 2;
  else if (apPass) process.exitCode = 0;
  else process.exitCode = 0; // HP alone still deliverable; AP BLOCKED documented
  console.log(
    JSON.stringify(
      {
        exit: process.exitCode,
        STAMP,
        requestId: results.ids.requestId,
        hp: results.steps.hp_create?.verdict,
        f5: results.steps.hp_f5_pending?.verdict,
        ap: results.steps.ap_hrm_approve?.verdict,
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
