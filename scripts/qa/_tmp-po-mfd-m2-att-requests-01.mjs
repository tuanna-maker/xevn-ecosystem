#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-REQUESTS-01 — U65 browser fidelity C4 request sub-tabs
 * Surfaces #20 late/early · #21 OT spot · #22 trip · #23 update (inv) · #24 shift-change
 * Mutate prefer late/early (OT create→approve GWC CLOSED — spot only)
 * U65 zero-seed · U76 HDSD align
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const NV_EMAIL = 'uat.nv0007@xe.vn';
const PASSWORDS = ['Xevn@2026', 'xevn-uat-2026'];
const OU = 'trsport';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-requests-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-requests-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `REQ1-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** Menu HDSD inventory + API path patterns */
const TABS = [
  {
    id: 'late-early',
    surface: 20,
    menu: /Đăng ký đi muộn|đi muộn.*về sớm|Late.?Early/i,
    cta: /Thêm đơn/i,
    title: /Đăng ký đi muộn|đi muộn.*về sớm/i,
    api: /\/api\/hrm\/attendance\/late-early-requests/,
    mutate: true,
  },
  {
    id: 'overtime',
    surface: 21,
    menu: /Đăng ký làm thêm|Làm thêm|Overtime|tăng ca/i,
    cta: /Thêm đơn tăng ca/i,
    title: /Quản lý tăng ca|tăng ca/i,
    api: /\/api\/hrm\/attendance\/overtime-requests/,
    mutate: false, // GWC CLOSED — spot list only
  },
  {
    id: 'business-trip',
    surface: 22,
    menu: /Đề nghị đi công tác|công tác|Business.?Trip/i,
    cta: /Thêm đề nghị/i,
    title: /Đề nghị đi công tác|công tác/i,
    api: /\/api\/hrm\/attendance\/business-trip-requests/,
    mutate: true, // fallback if late-early fails
  },
  {
    id: 'update-attendance',
    surface: 23,
    menu: /Đề nghị cập nhật công|cập nhật công|Update/i,
    cta: /Thêm đề nghị|Thêm mới/i,
    title: /cập nhật công|Update/i,
    api: /\/api\/hrm\/attendance\/update-requests/,
    mutate: false, // inventory + list; not preferred mutate this seat
  },
  {
    id: 'change-shift',
    surface: 24,
    menu: /Đề nghị đổi ca|đổi ca|Shift.?Change/i,
    cta: /Thêm đề nghị/i,
    title: /Đề nghị đổi ca|đổi ca/i,
    api: /\/api\/hrm\/attendance\/shift-change-requests/,
    mutate: true,
  },
];

const results = {
  work_item_id: 'PO-MFD-M2-ATT-REQUESTS-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align:
    'Attendance → Quản lý đơn → [late-early|OT|trip|update|shift-change] → list + mutate late/early',
  env: { PORTAL, HRM, NV_EMAIL, OU, STAMP, commit: COMMIT },
  l0: {},
  hdsd_inventory: {},
  tabs: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  mutate: null,
  f5: null,
  stamps: {},
  residual: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function step(id, verdict, summary, extra = {}) {
  results.tabs[id] = results.tabs[id] || {};
  results.tabs[id].lastStep = { verdict, summary, ...extra, at: ts() };
  console.log(`${verdict} ${id} — ${summary}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens = results.screens || [];
  results.screens.push(path.replace(/\\/g, '/'));
}

function attUrl(companyId = OU) {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${companyId}&_r=${Date.now()}`;
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
  console.log(ok ? 'PASS l0' : 'FAIL l0', JSON.stringify(results.l0));
  save();
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
      if (!/\/api\/hrm\/attendance\/(late-early|overtime|business-trip|shift-change|update)-requests/.test(u))
        return;
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
      if (method === 'GET') entry.list = true;
      if (method === 'POST' && !/\/(approve|reject)/.test(u)) {
        const j = await res.json().catch(() => ({}));
        const d = j?.data ?? j;
        entry.code = j?.code;
        entry.id = d?.id;
        entry.bodyStatus = d?.status;
        if (!results.mutate) results.mutate = {};
        results.mutate.create = {
          status: res.status(),
          code: j?.code,
          id: d?.id,
          url: entry.url,
          xCompanyId: xCid,
        };
      }
      results.network.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

async function openRequestsMenu(page) {
  const mgr = page.getByRole('button', { name: /Quản lý đơn/i }).first();
  const visible = await mgr.isVisible().catch(() => false);
  results.hdsd_inventory.quanLyDon = visible;
  if (!visible) return false;
  await mgr.click({ force: true });
  await sleep(700);
  return true;
}

async function openTab(page, tab) {
  const opened = await openRequestsMenu(page);
  if (!opened) return { ok: false, reason: 'no_quan_ly_don' };
  const item = page.getByRole('menuitem', { name: tab.menu }).first();
  if (await item.isVisible().catch(() => false)) {
    await item.click({ force: true });
    await sleep(2200);
    return { ok: true, via: 'menuitem' };
  }
  // fallback: any button/link in dropdown
  const alt = page.locator('[role="menuitem"], [role="option"], button, a').filter({ hasText: tab.menu }).first();
  if (await alt.isVisible().catch(() => false)) {
    await alt.click({ force: true });
    await sleep(2200);
    return { ok: true, via: 'alt' };
  }
  return { ok: false, reason: 'menu_item_missing' };
}

function netForTab(tab, sinceMs) {
  return results.network.filter(
    (n) => tab.api.test(n.url) && (!sinceMs || new Date(n.at).getTime() >= sinceMs),
  );
}

async function probeTab(page, tab) {
  const markOpen = Date.now();
  const open = await openTab(page, tab);
  results.hdsd_inventory[tab.id] = {
    menuPresent: open.ok,
    via: open.via || null,
    reason: open.reason || null,
  };
  if (!open.ok) {
    step(tab.id, 'FAIL', `menu open failed: ${open.reason}`);
    results.stamps[tab.surface] = 'STUB';
    await shot(page, `${tab.surface}-${tab.id}-no-menu`);
    return { ok: false, reason: open.reason };
  }

  // Wait settle: spinner gone OR CTA/title visible (max 20s)
  const deadline = Date.now() + 20000;
  let ctaVisible = false;
  let titleVisible = false;
  let spinnerVisible = false;
  while (Date.now() < deadline) {
    ctaVisible = await page.getByRole('button', { name: tab.cta }).first().isVisible().catch(() => false);
    titleVisible = await page.getByText(tab.title).first().isVisible().catch(() => false);
    spinnerVisible = await page
      .locator('.animate-spin')
      .first()
      .isVisible()
      .catch(() => false);
    const dangTai = await page.getByText(/Đang tải/i).first().isVisible().catch(() => false);
    if ((ctaVisible || titleVisible) && !spinnerVisible && !dangTai) break;
    if (ctaVisible && !dangTai) break;
    await sleep(400);
  }
  spinnerVisible = await page.locator('.animate-spin').first().isVisible().catch(() => false);
  const dangTai = await page.getByText(/Đang tải/i).first().isVisible().catch(() => false);
  ctaVisible = await page.getByRole('button', { name: tab.cta }).first().isVisible().catch(() => false);

  // Idle GET window 5s
  const idleMark = Date.now();
  await sleep(5000);
  const getsAll = netForTab(tab, markOpen).filter((n) => n.method === 'GET');
  const idleGets = netForTab(tab, idleMark).filter((n) => n.method === 'GET');
  const list2xx = getsAll.filter((n) => n.status >= 200 && n.status < 300);
  const listFail = getsAll.filter((n) => n.status >= 400);
  const lastGet = getsAll[getsAll.length - 1] || null;

  const emptyHonesty =
    (await page.getByText(/Không có|không có đề nghị|không có đơn|No request|empty/i).first().isVisible().catch(() => false)) ||
    false;
  const rowCount = await page.locator('tbody tr').count().catch(() => 0);

  const storm = idleGets.length > 2 || (spinnerVisible && dangTai) || (getsAll.length > 40 && !ctaVisible);
  const listOk = list2xx.length > 0 && listFail.length === 0;

  let runtime = 'LIVE';
  if (!listOk || storm || (!ctaVisible && (spinnerVisible || dangTai))) {
    runtime = storm || (spinnerVisible && !ctaVisible) ? 'PARTIAL' : 'PARTIAL';
  }
  if (!open.ok) runtime = 'STUB';

  const tabResult = {
    surface: tab.surface,
    menuOk: open.ok,
    ctaVisible,
    titleVisible,
    spinnerVisible,
    dangTai,
    getCount: getsAll.length,
    idleGets: idleGets.length,
    list2xx: list2xx.length,
    listFail: listFail.map((n) => n.status),
    lastGetStatus: lastGet?.status ?? null,
    lastGetCode: lastGet?.code ?? null,
    rowCount,
    emptyHonesty,
    storm,
    runtime,
  };
  results.tabs[tab.id] = tabResult;
  results.stamps[tab.surface] = runtime;
  await shot(page, `${String(tab.surface).padStart(2, '0')}-${tab.id}-list`);

  const verdict =
    listOk && !storm && ctaVisible
      ? 'PASS'
      : listOk && !storm && (titleVisible || rowCount >= 0)
        ? ctaVisible
          ? 'PASS'
          : 'PARTIAL'
        : 'FAIL';
  step(
    tab.id,
    verdict,
    `cta=${ctaVisible} gets=${getsAll.length} idle=${idleGets.length} rows=${rowCount} empty=${emptyHonesty} storm=${storm} runtime=${runtime}`,
  );

  if (storm) {
    results.residual.push({
      id: `R-MFD-M2-REQ-${tab.id.toUpperCase()}-LOADING`,
      tab: tab.id,
      surface: tab.surface,
      note: `GET storm or stuck loading: gets=${getsAll.length} idle=${idleGets.length} spinner=${spinnerVisible}`,
      owner: 'dev-fe',
      likely: 'use*Requests h() in useCallback deps (same class as OT-FE-LOADING)',
    });
  }
  if (!listOk) {
    results.residual.push({
      id: `R-MFD-M2-REQ-${tab.id.toUpperCase()}-LIST`,
      tab: tab.id,
      surface: tab.surface,
      note: `list GET not healthy: 2xx=${list2xx.length} fail=${JSON.stringify(listFail)}`,
      owner: 'dev-be',
    });
  }

  return { ok: listOk && !storm, tabResult, ctaVisible };
}

async function pickDate(page, dialog) {
  const dateBtn = dialog
    .getByRole('button', { name: /Chọn ngày|Pick|Calendar|\/|\d{2}\/\d{2}/i })
    .first();
  if (!(await dateBtn.isVisible().catch(() => false))) return false;
  await dateBtn.click({ force: true });
  await sleep(500);
  const day = page
    .locator('[role="gridcell"] button:not([disabled]), button[name*="day"]:not([disabled])')
    .filter({ hasText: /^\d{1,2}$/ })
    .last();
  if (await day.isVisible().catch(() => false)) {
    await day.click({ force: true });
    await sleep(300);
    return true;
  }
  const anyDay = page
    .locator('[data-day], .rdp-day:not(.rdp-day_disabled)')
    .filter({ hasText: /^\d{1,2}$/ })
    .last();
  if (await anyDay.isVisible().catch(() => false)) {
    await anyDay.click({ force: true });
    await sleep(300);
    return true;
  }
  return false;
}

async function pickEmployee(dialog, page) {
  const empCombo = dialog.locator('button[role="combobox"]').first();
  if (!(await empCombo.isVisible().catch(() => false))) return { ok: false, reason: 'no_employee_combo' };
  await empCombo.click({ force: true });
  await sleep(700);
  const options = page.getByRole('option');
  const optCount = await options.count();
  if (optCount === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'employee_catalog_empty' };
  }
  const prefer = page.getByRole('option', { name: /0007|NV0007|VTH-0007/i }).first();
  if (await prefer.isVisible().catch(() => false)) await prefer.click({ force: true });
  else await options.first().click({ force: true });
  await sleep(400);
  return { ok: true, optCount };
}

async function mutateLateEarly(page) {
  results.mutate = { path: 'late-early', stamp: STAMP };
  const createBtn = page.getByRole('button', { name: /Thêm đơn/i }).first();
  if (!(await createBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'no_cta' };
  }
  await createBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '20-late-early-modal');

  const dialog = page.locator('[role="dialog"]').filter({ hasText: /Thêm đơn|đi muộn/i }).first();
  const dlg = (await dialog.isVisible().catch(() => false))
    ? dialog
    : page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no_dialog' };

  const emp = await pickEmployee(dlg, page);
  results.mutate.employeesInSelect = emp.optCount ?? 0;
  if (!emp.ok) return { ok: false, reason: emp.reason };

  await pickDate(page, dlg);

  const ta = dlg.locator('textarea').first();
  if (!(await ta.isVisible().catch(() => false))) return { ok: false, reason: 'no_reason' };
  await ta.fill(`QA M2 requests late-early ${STAMP}`);

  await shot(page, '20-late-early-filled');
  const submit = dlg.getByRole('button', { name: /Thêm mới|Thêm$|Lưu|Gửi|Tạo/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(4000);
  await shot(page, '20-late-early-after-submit');

  const created =
    results.mutate.create &&
    results.mutate.create.status >= 200 &&
    results.mutate.create.status < 300 &&
    /late-early/.test(results.mutate.create.url || '');
  results.mutate.createOk = !!created;
  return {
    ok: !!created,
    reason: created ? 'created' : 'create_http_fail',
    create: results.mutate.create,
  };
}

async function mutateTrip(page) {
  results.mutate = { path: 'business-trip', stamp: STAMP, fallback: true };
  // Re-open trip tab
  await openTab(page, TABS.find((t) => t.id === 'business-trip'));
  await sleep(1500);
  const createBtn = page.getByRole('button', { name: /Thêm đề nghị/i }).first();
  if (!(await createBtn.isVisible().catch(() => false))) return { ok: false, reason: 'no_cta' };
  await createBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '22-trip-modal');

  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no_dialog' };

  const emp = await pickEmployee(dlg, page);
  if (!emp.ok) return { ok: false, reason: emp.reason };

  const dest = dlg.locator('input').filter({ has: page.locator('..') }).first();
  // Fill destination by label proximity
  const destInput = dlg.getByPlaceholder(/Hồ Chí Minh|điểm đến|destination/i).first();
  if (await destInput.isVisible().catch(() => false)) {
    await destInput.fill(`HN QA ${STAMP}`);
  } else {
    // second text input after selects often destination
    const inputs = dlg.locator('input:not([type="checkbox"]):not([type="hidden"])');
    const n = await inputs.count();
    for (let i = 0; i < n; i++) {
      const el = inputs.nth(i);
      const ph = (await el.getAttribute('placeholder')) || '';
      const ty = (await el.getAttribute('type')) || 'text';
      if (ty === 'number' || ty === 'time') continue;
      if (/Hồ|điểm|destination|VD/i.test(ph) || i === 0) {
        await el.fill(`HN QA ${STAMP}`);
        break;
      }
    }
  }

  // start + end dates — click first two calendar buttons
  const dateBtns = dlg.getByRole('button', { name: /Chọn ngày|Pick|Calendar|\d{2}\/\d{2}/i });
  const dbCount = await dateBtns.count();
  for (let i = 0; i < Math.min(2, dbCount); i++) {
    await dateBtns.nth(i).click({ force: true });
    await sleep(400);
    const day = page
      .locator('[role="gridcell"] button:not([disabled])')
      .filter({ hasText: /^\d{1,2}$/ })
      .nth(Math.min(5 + i, 20));
    if (await day.isVisible().catch(() => false)) await day.click({ force: true });
    else await pickDate(page, dlg);
    await sleep(300);
  }

  const ta = dlg.locator('textarea').first();
  if (await ta.isVisible().catch(() => false)) {
    await ta.fill(`QA M2 requests trip ${STAMP}`);
  }

  await shot(page, '22-trip-filled');
  const submit = dlg.getByRole('button', { name: /Thêm mới|Thêm$|Lưu|Gửi|Tạo/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(4000);
  await shot(page, '22-trip-after-submit');

  const created =
    results.mutate.create &&
    results.mutate.create.status >= 200 &&
    results.mutate.create.status < 300 &&
    /business-trip/.test(results.mutate.create.url || '');
  results.mutate.createOk = !!created;
  return {
    ok: !!created,
    reason: created ? 'created' : 'create_http_fail',
    create: results.mutate.create,
  };
}

async function mutateShiftChange(page) {
  results.mutate = { path: 'change-shift', stamp: STAMP, fallback: true };
  await openTab(page, TABS.find((t) => t.id === 'change-shift'));
  await sleep(1500);
  const createBtn = page.getByRole('button', { name: /Thêm đề nghị/i }).first();
  if (!(await createBtn.isVisible().catch(() => false))) return { ok: false, reason: 'no_cta' };
  await createBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '24-shift-modal');

  const dlg = page.locator('[role="dialog"]').first();
  if (!(await dlg.isVisible().catch(() => false))) return { ok: false, reason: 'no_dialog' };

  const emp = await pickEmployee(dlg, page);
  if (!emp.ok) return { ok: false, reason: emp.reason };
  await pickDate(page, dlg);

  // current + requested shift comboboxes (skip employee which is first)
  const combos = dlg.locator('button[role="combobox"]');
  const cc = await combos.count();
  // typically: employee, type, current, requested — pick last two shift selects
  for (const idx of [cc - 2, cc - 1]) {
    if (idx < 1) continue;
    await combos.nth(idx).click({ force: true });
    await sleep(400);
    const opt = page.getByRole('option').first();
    if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    await sleep(300);
  }
  // if only 2 shift selects after type: try options named Ca
  if (cc >= 3) {
    await combos.nth(2).click({ force: true }).catch(() => {});
    await sleep(300);
    const morning = page.getByRole('option', { name: /Ca sáng|morning/i }).first();
    if (await morning.isVisible().catch(() => false)) await morning.click({ force: true });
    else {
      const o = page.getByRole('option').first();
      if (await o.isVisible().catch(() => false)) await o.click({ force: true });
    }
    await sleep(300);
    await combos.nth(Math.min(3, cc - 1)).click({ force: true }).catch(() => {});
    await sleep(300);
    const aft = page.getByRole('option', { name: /Ca chiều|afternoon/i }).first();
    if (await aft.isVisible().catch(() => false)) await aft.click({ force: true });
    else {
      const o = page.getByRole('option').nth(1);
      if (await o.isVisible().catch(() => false)) await o.click({ force: true });
      else {
        const o0 = page.getByRole('option').first();
        if (await o0.isVisible().catch(() => false)) await o0.click({ force: true });
      }
    }
  }

  const ta = dlg.locator('textarea').first();
  if (await ta.isVisible().catch(() => false)) await ta.fill(`QA M2 requests shift ${STAMP}`);

  await shot(page, '24-shift-filled');
  const submit = dlg.getByRole('button', { name: /Thêm mới|Thêm$|Lưu|Gửi|Tạo/i }).last();
  await submit.click({ force: true }).catch(() => {});
  await sleep(4000);
  await shot(page, '24-shift-after-submit');

  const created =
    results.mutate.create &&
    results.mutate.create.status >= 200 &&
    results.mutate.create.status < 300 &&
    /shift-change/.test(results.mutate.create.url || '');
  results.mutate.createOk = !!created;
  return {
    ok: !!created,
    reason: created ? 'created' : 'create_http_fail',
    create: results.mutate.create,
  };
}

async function f5Verify(page, pathHint) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const tab = TABS.find((t) => t.id === pathHint) || TABS[0];
  await openTab(page, tab);
  await sleep(3000);
  const stampVisible = await page.getByText(STAMP).first().isVisible().catch(() => false);
  const rowCount = await page.locator('tbody tr').count().catch(() => 0);
  await shot(page, `f5-${pathHint}`);
  results.f5 = { path: pathHint, stampVisible, rowCount, at: ts() };
  return stampVisible || rowCount > 0;
}

async function main() {
  if (!(await l0())) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginMobile(NV_EMAIL);
  results.env.passwordUsed = session.passwordUsed;
  results.env.jwtOu = session.jwtOu;
  if (!session.ok) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.residual.push({ id: 'R-MFD-M2-REQ-LOGIN', note: 'NV login failed', owner: 'devops' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session, OU);

  await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await shot(page, '00-attendance-mount');

  // Inventory menu items under Quản lý đơn
  await openRequestsMenu(page);
  const menuTexts = await page
    .locator('[role="menuitem"]')
    .evaluateAll((els) => els.map((e) => (e.textContent || '').trim()).filter(Boolean));
  results.hdsd_inventory.menuItems = menuTexts;
  await shot(page, '00-requests-menu');
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  // Probe each tab (list + storm)
  for (const tab of TABS) {
    results.network = results.network.filter(() => true); // keep all
    await probeTab(page, tab);
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
  }

  // Mutate: prefer late-early if LIVE CTA
  let mutateResult = { ok: false, reason: 'not_attempted' };
  const le = results.tabs['late-early'];
  if (le?.ctaVisible && !le?.storm) {
    await openTab(page, TABS[0]);
    await sleep(1500);
    mutateResult = await mutateLateEarly(page);
  } else if (results.tabs['business-trip']?.ctaVisible && !results.tabs['business-trip']?.storm) {
    mutateResult = await mutateTrip(page);
  } else if (results.tabs['change-shift']?.ctaVisible && !results.tabs['change-shift']?.storm) {
    mutateResult = await mutateShiftChange(page);
  } else {
    // Try late-early anyway if CTA appeared despite PARTIAL
    if (le?.ctaVisible) {
      await openTab(page, TABS[0]);
      await sleep(1500);
      mutateResult = await mutateLateEarly(page);
    } else {
      mutateResult = { ok: false, reason: 'no_live_mutate_cta' };
      results.residual.push({
        id: 'R-MFD-M2-REQ-MUTATE-CTA',
        note: 'No LIVE CTA for late-early/trip/shift-change mutate',
        owner: 'dev-fe',
      });
    }
  }

  results.mutate = { ...(results.mutate || {}), ...mutateResult, stamp: STAMP };
  step(
    'mutate',
    mutateResult.ok ? 'PASS' : 'FAIL',
    `${mutateResult.reason} create=${JSON.stringify(results.mutate?.create || null)}`,
  );

  if (mutateResult.ok) {
    const path = results.mutate.path || 'late-early';
    const f5ok = await f5Verify(page, path);
    step('f5', f5ok ? 'PASS' : 'FAIL', `stampVisible=${results.f5?.stampVisible} rows=${results.f5?.rowCount}`);
    if (!f5ok) {
      results.residual.push({
        id: 'R-MFD-M2-REQ-F5',
        note: 'Create 2xx but F5 stamp/row not observed',
        owner: 'dev-fe',
      });
    }
  }

  // OT spot honesty — do not invent FAIL on approve
  const ot = results.tabs.overtime;
  if (ot) {
    results.stamps[21] = ot.storm ? 'PARTIAL' : ot.ctaVisible && ot.list2xx > 0 ? 'LIVE' : ot.list2xx > 0 ? 'PARTIAL' : 'PARTIAL';
    results.ot_spot = {
      note: 'Prior OT create→approve GWC CLOSED — spot list/CTA only; not reopened as invent FAIL',
      prior: 'docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md',
      ...ot,
    };
  }

  // Final stamps honesty
  for (const tab of TABS) {
    const t = results.tabs[tab.id];
    if (!t) {
      results.stamps[tab.surface] = 'STUB';
      continue;
    }
    if (t.storm || (!t.ctaVisible && t.spinnerVisible)) results.stamps[tab.surface] = 'PARTIAL';
    else if (t.list2xx > 0 && t.ctaVisible) results.stamps[tab.surface] = 'LIVE';
    else if (t.list2xx > 0) results.stamps[tab.surface] = 'PARTIAL';
    else results.stamps[tab.surface] = 'PARTIAL';
  }

  const listTabsOk = ['late-early', 'overtime', 'business-trip', 'change-shift'].every((id) => {
    const t = results.tabs[id];
    return t && t.list2xx > 0 && !t.storm;
  });
  const inventoryOk = ['late-early', 'overtime', 'business-trip', 'change-shift'].every(
    (id) => results.hdsd_inventory[id]?.menuPresent,
  );
  const mutateOk = !!mutateResult.ok;
  const f5Ok = !mutateOk || results.f5?.stampVisible || (results.f5?.rowCount ?? 0) > 0;

  if (inventoryOk && listTabsOk && mutateOk && f5Ok) {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  } else if (!inventoryOk) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
  } else if (!listTabsOk || !mutateOk) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
  } else {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
  }

  // Soft: update-attendance inventory only — missing menu = residual OBS not hard fail if others pass
  if (!results.hdsd_inventory['update-attendance']?.menuPresent) {
    results.residual.push({
      id: 'R-MFD-M2-REQ-UPDATE-MENU-OBS',
      note: 'Surface #23 update-attendance menu not found in dropdown this persona',
      owner: 'qa',
      severity: 'OBS',
    });
  }

  results.endedAt = ts();
  save();
  console.log('\n=== VERDICT', results.verdict, results.ack_status, '===');
  console.log('stamps', JSON.stringify(results.stamps));
  console.log('residual', JSON.stringify(results.residual, null, 2));
  await browser.close();
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'BLOCKED';
  results.ack_status = 'BLOCKED';
  results.pageErrors.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
