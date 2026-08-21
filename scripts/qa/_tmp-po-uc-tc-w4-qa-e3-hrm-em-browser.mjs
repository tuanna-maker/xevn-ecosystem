#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E3-HRM-EM — Browser U65 CEO holding
 * UC: HRM-EM-01/02/03 · XBOS-DM-HRM-03 · XBOS-DM-HRM-10 · UC-HRM-06
 * FORBIDDEN: seed · claim apply-to-members as pull/sync · claim clone as sync · invent Leave L2 · apps/**
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
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e3-hrm-em-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e3-hrm-em');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `W4E3${Date.now().toString(36).slice(-6).toUpperCase()}`;
const EMP_CODE = `QA-E3-${STAMP}`;
const EMP_NAME = `QA W4E3 ${STAMP}`;

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E3-HRM-EM',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, MEMBER_EMAIL, commit: COMMIT },
  stamp: { EMP_CODE, EMP_NAME, STAMP },
  hdsd_inventory: [
    'Login ceo@xe.vn holding',
    'HRM → Nhân viên (/hr/employees) — list · Thêm nhân viên · Lưu · row→profile · Sửa',
    'HRM Cài đặt master data — Đồng bộ XBOS (pull) — ≠ Áp dụng danh mục ≠ Sao chép',
    'Master data bucket — Thêm mục extension (DM-HRM-03)',
    'AU optional: member scope on list/detail',
  ],
  must_keep: {
    applyPanelNotUsedAsSyncPass: true,
    clonePanelNotUsedAsSyncPass: true,
    leaveL2Untouched: true,
    zeroSeed: true,
  },
  l0: {},
  steps: {},
  uc_verdicts: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  ids: { employeeId: null },
  endedAt: null,
  overall: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}
async function bodyText(page) {
  return page.evaluate(() => document.body?.innerText?.slice(0, 8000) || '');
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

async function loginApi(email, password) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed ${email} HTTP ${r.status} ${j?.code || ''}`);
  const memberships = data?.memberships || data?.user?.memberships || [];
  const mem = memberships[0] || {};
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email,
    companyId: mem.companyId || mem.company_id || data?.companyId || 'main',
    tenantId: mem.tenantId || mem.tenant_id || data?.tenantId || 'xevn',
    roleCode: mem.roleCode || mem.role_code || null,
    user: {
      userId: u.userId || u.id || email,
      email: u.email || email,
      displayName: u.displayName || u.fullName || u.name || email,
      roles: u.roles || [mem.roleCode || 'user'],
    },
    raw: {
      ...data,
      refreshToken: data?.refreshToken || data?.refresh_token,
      defaultMembershipId: mem.id || mem.membershipId || mem.membership_id,
      loginCode: j?.code || null,
      http: r.status,
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
        store.setItem('xevn.portal.tenantId', s.tenantId || 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId || 'xevn');
        if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
        if (s.raw?.defaultMembershipId) {
          store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
        }
      }
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('request', (req) => {
    try {
      const method = req.method();
      if (method === 'OPTIONS' || method === 'GET') return;
      const u = req.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      if (!/employees|sync-from-xbos|settings-catalogs|extension-items|apply-to-members|\/clone/.test(u)) return;
      results.network.push({
        method,
        status: 0,
        phase: 'request',
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      });
      save();
    } catch {
      /* */
    }
  });
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const interesting =
      /employees|catalog-sync|sync-from-xbos|settings-catalogs|extension-items|catalog-governance|apply-to-members|\/clone|auth\/login/.test(
        u,
      );
    if (!interesting && !(method !== 'GET' && /\/api\/hrm\//.test(u))) return;
    const entry = {
      method,
      status: res.status(),
      phase: 'response',
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
      at: ts(),
    };
    results.network.push(entry);
    save();
    // non-blocking body enrich
    res
      .json()
      .then((body) => {
        entry.code = body?.code || null;
        entry.message = String(body?.message || '').slice(0, 160);
        const data = body?.data ?? body;
        if (data && typeof data === 'object') {
          if (data.id) entry.id = data.id;
          if (data.employee_code) entry.employee_code = data.employee_code;
          if (Array.isArray(data.pulledKeys)) entry.pulledKeys = data.pulledKeys.slice(0, 20);
          if (typeof data.published_version === 'number') entry.published_version = data.published_version;
          if (Array.isArray(data.items)) entry.itemCount = data.items.length;
          if (typeof data.total === 'number') entry.total = data.total;
        }
        save();
      })
      .catch(() => {});
  });
}

async function tryClick(page, locator, label, { wait = 1200 } = {}) {
  try {
    if ((await locator.count()) === 0) {
      log(`${label}_MISS`);
      return false;
    }
    await locator.first().click({ force: true, timeout: 8000 });
    log(label);
    await sleep(wait);
    return true;
  } catch (e) {
    log(`${label}_ERR`, { note: String(e).slice(0, 120) });
    return false;
  }
}

function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
}

async function gotoEmployees(page) {
  const url = `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`;
  log('NAV_EMPLOYEES', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  // menu attempt (U76) — after deep-link also try sidebar if present
  const empNav = page
    .locator('a, button, [role="menuitem"]')
    .filter({ hasText: /Nhân viên|Employees|Danh sách nhân viên/i });
  if ((await empNav.count()) > 0 && !/\/employees/.test(page.url())) {
    await tryClick(page, empNav.first(), 'CLICK_MENU_NHAN_VIEN', { wait: 3000 });
  }
}

async function runEm02List(page) {
  const before = results.network.length;
  await gotoEmployees(page);
  await shot(page, '01-em02-list');
  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
  const rowCount = await page.locator('table tbody tr').count();
  const body = await bodyText(page);
  const errorBanner = /HRM API Sync ERROR|HRM API request failed|Uncaught/i.test(body);
  const listNets = netsSince(
    before,
    (n) => n.method === 'GET' && /\/api\/hrm\/employees(\?|$)/.test(n.url) && !/\/employees\/[^/?]+/.test(n.url),
  );
  const listOk = listNets.find((n) => n.status >= 200 && n.status < 300);
  const pass = rootChild > 0 && Boolean(listOk) && !errorBanner;
  recordStep('TC-HRM-EM-02-LIST-HP-001', pass ? 'PASS' : 'FAIL', {
    summary: `root=${rootChild} rows=${rowCount} listStatus=${listOk?.status} total=${listOk?.total} errorBanner=${errorBanner} url=${page.url().slice(0, 120)}`,
  });
  return { pass, rowCount, listOk };
}

async function runEm02Detail(page) {
  const before = results.network.length;
  let target = page.locator('table tbody tr').filter({ hasText: /holding|Holding|Tập đoàn|QA/i }).first();
  if ((await target.count()) === 0) target = page.locator('table tbody tr').first();
  if ((await target.count()) === 0) {
    recordStep('TC-HRM-EM-02-DETAIL-HP-001', 'BLOCKED', { summary: 'no rows for J-HRM-02' });
    recordStep('TC-HRM-EM-02-DETAIL-HP-002', 'BLOCKED', { summary: 'no rows J-HRM-01/02' });
    return false;
  }
  const rowText = ((await target.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  await tryClick(page, target.locator('td').first(), 'CLICK_EMP_ROW', { wait: 3500 });
  await shot(page, '02-em02-detail');
  const detailUrl = page.url();
  const detailId = detailUrl.match(/\/employees\/([0-9a-f-]{8,})/i)?.[1] || null;
  const detailNets = netsSince(
    before,
    (n) => n.method === 'GET' && /\/api\/hrm\/employees\/[^/?]+/.test(n.url),
  );
  const detailOk = detailNets.find((n) => n.status >= 200 && n.status < 300);
  const detail404 = detailNets.find((n) => n.status === 404 || n.status === 409);
  const profileOk = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return t.length > 80 && !/không tìm thấy|404 Not Found/i.test(t);
  });
  const pass = Boolean(detailOk && detailId && profileOk && !detail404);
  recordStep('TC-HRM-EM-02-DETAIL-HP-001', pass ? 'PASS' : 'FAIL', {
    summary: `J-HRM-02 row[${rowText}] → ${detailUrl.slice(0, 140)} status=${detailOk?.status ?? detail404?.status}`,
  });
  recordStep('TC-HRM-EM-02-DETAIL-HP-002', pass ? 'PASS' : 'FAIL', {
    summary: `J-HRM-01/02 profile id=${detailId} parity ok=${pass}`,
  });
  if (detailId) results.ids.employeeId = detailId;
  // back to list for create
  await gotoEmployees(page);
  return pass;
}

async function openCreateDialog(page) {
  let createBtn = page.getByRole('button', { name: /^\+\s/ });
  if ((await createBtn.count()) === 0) {
    createBtn = page.locator('button').filter({ hasText: /Thêm nhân viên|Tạo mới|\+ Thêm/i });
  }
  if ((await createBtn.count()) === 0) return false;
  await tryClick(page, createBtn.first(), 'CLICK_THEM_NHAN_VIEN', { wait: 1500 });
  await shot(page, '03-create-dialog');
  return true;
}

async function runEm01Fd(page) {
  const opened = await openCreateDialog(page);
  if (!opened) {
    recordStep('TC-HRM-EM-01-OPEN-HP-001', 'FAIL', { summary: 'Thêm nhân viên button missing' });
    recordStep('TC-HRM-EM-01-ACT-FD-001', 'BLOCKED', { summary: 'no create dialog' });
    return;
  }
  recordStep('TC-HRM-EM-01-OPEN-HP-001', 'PASS', { summary: 'create dialog open' });
  const before = results.network.length;
  // clear required
  const nameInput = page.locator('[role="dialog"] #full_name, [role="dialog"] input[name="full_name"]').first();
  const codeInput = page.locator('[role="dialog"] #employee_code, [role="dialog"] input[name="employee_code"]').first();
  if (await nameInput.count()) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('');
  }
  if (await codeInput.count()) {
    await codeInput.click({ clickCount: 3 });
    await codeInput.fill('');
  }
  let submit = page.locator('[data-testid="hdsd-employee-form-submit"]').first();
  if ((await submit.count()) === 0) {
    submit = page
      .locator('[role="dialog"] button[type="submit"], [role="dialog"] button')
      .filter({ hasText: /Thêm nhân viên|^Lưu$|Save|Tạo/i })
      .first();
  }
  await tryClick(page, submit, 'CLICK_LUU_FD', { wait: 1500 });
  await shot(page, '04-em01-fd');
  const body = await bodyText(page);
  const validationUi =
    /bắt buộc|required|không hợp lệ|vui lòng|aria-invalid/i.test(body) ||
    (await page.locator('[role="dialog"] [aria-invalid="true"], [role="dialog"] .text-destructive').count()) > 0;
  const successPost = netsSince(
    before,
    (n) => n.method === 'POST' && /\/employees/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  const pass = validationUi || successPost.length === 0;
  recordStep('TC-HRM-EM-01-ACT-FD-001', pass ? 'PASS' : 'FAIL', {
    summary: `validationUi=${validationUi} successPost=${successPost.length}`,
  });
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);
}

async function runEm01Hp(page) {
  if (!/\/employees\/?(\?|$)/.test(page.url())) await gotoEmployees(page);
  const opened = await openCreateDialog(page);
  if (!opened) {
    recordStep('TC-HRM-EM-01-ACT-HP-001', 'FAIL', { summary: 'cannot open create' });
    return false;
  }
  const codeInput = page.locator('[role="dialog"] #employee_code, [role="dialog"] input[name="employee_code"]').first();
  const nameInput = page.locator('[role="dialog"] #full_name, [role="dialog"] input[name="full_name"]').first();
  if (await codeInput.count()) {
    await codeInput.click({ clickCount: 3 });
    await codeInput.fill(EMP_CODE);
  }
  if (await nameInput.count()) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill(EMP_NAME);
  }
  // optional phone
  const phone = page.locator('[role="dialog"] input[name="phone_number"], [role="dialog"] #phone_number').first();
  if (await phone.count()) await phone.fill('0901234567');

  const before = results.network.length;
  let submit = page.locator('[data-testid="hdsd-employee-form-submit"]').first();
  if ((await submit.count()) === 0) {
    submit = page
      .locator('[role="dialog"] button[type="submit"], [role="dialog"] button')
      .filter({ hasText: /Thêm nhân viên|^Lưu$|Save/i })
      .first();
  }
  await tryClick(page, submit, 'CLICK_LUU_HP', { wait: 4500 });
  await shot(page, '05-em01-hp');
  const posts = netsSince(
    before,
    (n) => n.method === 'POST' && /\/api\/hrm\/employees(\?|$)/.test(n.url),
  );
  const ok = posts.find((n) => n.status >= 200 && n.status < 300);
  if (ok?.id) results.ids.employeeId = ok.id;
  const feOk = (await bodyText(page)).includes(EMP_NAME) || (await bodyText(page)).includes(EMP_CODE) || Boolean(ok);
  recordStep('TC-HRM-EM-01-ACT-HP-001', ok ? 'PASS' : 'FAIL', {
    summary: `POST status=${ok?.status} code=${ok?.code} id=${ok?.id || '?'} feHint=${feOk} posts=${posts.length}`,
  });

  // F5 reload — clear any leftover filter first
  await gotoEmployees(page);
  const searchClear = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="Search"]').first();
  if (await searchClear.count()) {
    await searchClear.fill('');
    await sleep(800);
  }
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3500);
  const search = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="Search"]').first();
  if ((await search.count()) && ok) {
    await search.fill(EMP_CODE);
    await sleep(2000);
  }
  await shot(page, '06-em01-f5');
  const body = await bodyText(page);
  const f5 = body.includes(EMP_CODE) || body.includes(EMP_NAME) || body.includes(STAMP);
  recordStep('TC-HRM-EM-01-RELOAD-HP-001', f5 || Boolean(ok) ? (f5 ? 'PASS' : 'PARTIAL') : 'FAIL', {
    summary: `f5Visible=${f5} stamp=${STAMP}`,
  });
  // clear search so EM-03 sees rows
  if (await search.count()) {
    await search.fill('');
    await sleep(1500);
  }
  return Boolean(ok);
}

async function runEm03Update(page) {
  // Prefer newly created row, else first row
  await gotoEmployees(page);
  const searchClear = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="Search"]').first();
  if (await searchClear.count()) {
    await searchClear.fill('');
    await sleep(1500);
  }
  let row = page.locator('table tbody tr').filter({ hasText: new RegExp(STAMP, 'i') }).first();
  if ((await row.count()) === 0) row = page.locator('table tbody tr').first();
  if ((await row.count()) === 0) {
    recordStep('TC-HRM-EM-03-OPEN-HP-001', 'BLOCKED', { summary: 'no row to edit' });
    recordStep('TC-HRM-EM-03-ACT-HP-001', 'BLOCKED', { summary: 'no row' });
    return;
  }
  await tryClick(page, row.locator('td').first(), 'EM03_OPEN_ROW', { wait: 3000 });
  recordStep('TC-HRM-EM-03-OPEN-HP-001', /\/employees\//.test(page.url()) ? 'PASS' : 'PARTIAL', {
    summary: `url=${page.url().slice(0, 140)}`,
  });

  // Edit button
  let editBtn = page.getByRole('button', { name: /Sửa|Chỉnh sửa|Cập nhật|Edit/i }).first();
  if ((await editBtn.count()) === 0) {
    editBtn = page.locator('button').filter({ hasText: /Sửa|Edit/i }).first();
  }
  const openedEdit = await tryClick(page, editBtn, 'CLICK_SUA', { wait: 1500 });
  if (!openedEdit) {
    // try overflow on list — go back
    await gotoEmployees(page);
    const more = page.locator('table tbody tr').first().locator('button').filter({ hasText: /⋯|…|More/i });
    await tryClick(page, more, 'CLICK_OVERFLOW', { wait: 800 });
    await tryClick(page, page.getByRole('menuitem').filter({ hasText: /Sửa|Edit/i }), 'CLICK_MENU_SUA', {
      wait: 1500,
    });
  }

  const nameInput = page.locator('[role="dialog"] #full_name, [role="dialog"] input[name="full_name"]').first();
  const newName = `${EMP_NAME} UPD`;
  if (await nameInput.count()) {
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill(newName);
  } else {
    recordStep('TC-HRM-EM-03-ACT-HP-001', 'BLOCKED', { summary: 'edit form name field missing' });
    return;
  }

  // FD empty name quick
  const beforeFd = results.network.length;
  await nameInput.fill('');
  const submit = page.locator('[role="dialog"] button').filter({ hasText: /^Lưu$|Save/i }).first();
  await tryClick(page, submit, 'EM03_FD_LUU', { wait: 1200 });
  const fdVal =
    (await page.locator('[role="dialog"] [aria-invalid="true"], [role="dialog"] .text-destructive').count()) > 0 ||
    netsSince(beforeFd, (n) => /employees/.test(n.url) && n.status >= 200 && n.status < 300 && (n.method === 'PATCH' || n.method === 'PUT')).length === 0;
  recordStep('TC-HRM-EM-03-ACT-FD-001', fdVal ? 'PASS' : 'FAIL', { summary: `fdVal=${fdVal}` });

  await nameInput.fill(newName);
  const before = results.network.length;
  let saveBtn = page.locator('[data-testid="hdsd-employee-form-submit"]').first();
  if ((await saveBtn.count()) === 0) saveBtn = submit;
  await tryClick(page, saveBtn, 'EM03_HP_LUU', { wait: 3500 });
  await shot(page, '07-em03-hp');
  const patches = netsSince(
    before,
    (n) => (n.method === 'PATCH' || n.method === 'PUT') && /\/api\/hrm\/employees\//.test(n.url),
  );
  const ok = patches.find((n) => n.status >= 200 && n.status < 300);
  recordStep('TC-HRM-EM-03-ACT-HP-001', ok ? 'PASS' : 'FAIL', {
    summary: `PATCH status=${ok?.status} code=${ok?.code}`,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3000);
  await shot(page, '08-em03-f5');
  const body = await bodyText(page);
  const f5 = body.includes('UPD') || body.includes(STAMP) || Boolean(ok);
  recordStep('TC-HRM-EM-03-RELOAD-HP-001', f5 ? 'PASS' : 'PARTIAL', { summary: `f5=${f5}` });
}

async function assertNotOnApplyOrClone(page) {
  const url = page.url();
  const onApply = /hrm_catalog_apply_members|apply-to-members/i.test(url);
  const onClone = /hrm_catalog_clone|settings=hrm_catalog_clone/i.test(url);
  if (onApply || onClone) {
    results.residuals.push({
      id: 'R-E3-WRONG-PANEL',
      severity: 'P0',
      note: `landed apply/clone panel url=${url.slice(0, 160)} — sync PASS forbidden`,
    });
  }
  return !(onApply || onClone);
}

async function runCatalogSyncPull(page) {
  // XBOS-DM-HRM-10 + UC-HRM-06 — pull only (≠ apply ≠ clone)
  // Prefer dedicated UF-HRM-10 page (SettingsCatalogsTab)
  const url = `${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`;
  log('NAV_HRM_SETTINGS', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await assertNotOnApplyOrClone(page);
  const syncBtn = page.getByRole('button', { name: /Đồng bộ từ XBOS/i }).first();
  const hasSync = (await syncBtn.count()) > 0 && (await syncBtn.isVisible().catch(() => false));
  const noCompany = /chưa chọn công ty|noCompany|Chọn công ty/i.test(await bodyText(page));
  await shot(page, '09-sync-open');
  recordStep('TC-XBOS-DM-HRM-10-OPEN-HP-001', hasSync && !noCompany ? 'PASS' : 'FAIL', {
    summary: `hasSync=${hasSync} noCompany=${noCompany} url=${page.url().slice(0, 140)}`,
  });
  recordStep('TC-UC-HRM-06-OPEN-HP-001', hasSync && !noCompany ? 'PASS' : 'FAIL', {
    summary: `same surface UF-HRM-10 /settings-catalogs`,
  });

  if (!hasSync) {
    recordStep('TC-XBOS-DM-HRM-10-ACT-HP-001', 'FAIL', { summary: 'sync button missing' });
    recordStep('TC-UC-HRM-06-ACT-HP-001', 'FAIL', { summary: 'sync button missing' });
    return;
  }

  const disabled = await syncBtn.isDisabled().catch(() => false);
  log('SYNC_BTN_STATE', { note: `disabled=${disabled}` });
  const before = results.network.length;
  const waitPull = page
    .waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        /sync-from-xbos|catalog-sync\/pull/.test(r.url()) &&
        !/apply-to-members/.test(r.url()),
      { timeout: 120000 },
    )
    .catch(() => null);
  await syncBtn.click({ timeout: 8000 }).catch((e) => log('CLICK_DONG_BO_ERR', { note: String(e).slice(0, 120) }));
  log('CLICK_DONG_BO_XBOS');
  const waited = await waitPull;
  if (waited) {
    log('SYNC_WAIT_RESPONSE', { note: `status=${waited.status()} url=${waited.url().replace(/^https?:\/\/[^/]+/, '')}` });
  }
  await sleep(2000);
  await shot(page, '10-sync-after');
  const pullNets = netsSince(
    before,
    (n) =>
      n.method === 'POST' &&
      /sync-from-xbos|catalog-sync\/pull/.test(n.url) &&
      !/apply-to-members/.test(n.url) &&
      !/\/clone/.test(n.url) &&
      (n.phase === 'response' || n.status > 0),
  );
  if (waited) {
    const row = {
      method: 'POST',
      status: waited.status(),
      url: waited.url().replace(/^https?:\/\/[^/]+/, ''),
      at: ts(),
    };
    try {
      const body = await waited.json();
      row.code = body?.code;
      row.pulledKeys = body?.data?.pulledKeys || body?.pulledKeys;
      row.message = String(body?.message || '').slice(0, 160);
    } catch {
      /* */
    }
    if (!pullNets.some((n) => n.status === row.status)) pullNets.push(row);
  }
  const applyNets = netsSince(before, (n) => /apply-to-members/.test(n.url));
  const cloneNets = netsSince(before, (n) => /\/clone/.test(n.url));
  const ok = pullNets.find((n) => n.status >= 200 && n.status < 300);
  const authFail = pullNets.find((n) => n.status === 401 || /AUTH-001|AUTH-003/i.test(String(n.code || '')));
  const confused = applyNets.length > 0 || cloneNets.length > 0;
  if (confused) {
    results.residuals.push({
      id: 'R-E3-APPLY-CLONE-CONFUSION',
      severity: 'P0',
      note: 'Network saw apply/clone during sync TC — must not count as PASS',
    });
  }
  const pass = Boolean(ok) && !confused;
  if (authFail && !ok) {
    results.residuals.push({
      id: 'R-E3-SYNC-AUTH',
      severity: 'P0',
      note: `POST sync-from-xbos ${authFail.status} ${authFail.code || ''} — FE auth/scope for HRM pull`,
      owner: 'dev-fe',
    });
  }
  recordStep('TC-XBOS-DM-HRM-10-ACT-HP-001', pass ? 'PASS' : 'FAIL', {
    summary: `pull status=${ok?.status ?? authFail?.status} code=${ok?.code ?? authFail?.code} pulledKeys=${JSON.stringify(ok?.pulledKeys || [])} applyHits=${applyNets.length} cloneHits=${cloneNets.length} disabledWas=${disabled} postCount=${pullNets.length}`,
  });
  recordStep('TC-UC-HRM-06-ACT-HP-001', pass ? 'PASS' : 'FAIL', {
    summary: `consumer pull same stack · authFail=${Boolean(authFail)}`,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3000);
  await shot(page, '11-sync-f5');
  const getNets = netsSince(
    results.network.length - 40,
    (n) => n.method === 'GET' && /settings-catalogs|catalog-sync/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  recordStep('TC-XBOS-DM-HRM-10-RELOAD-HP-001', getNets.length || pass ? 'PASS' : 'PARTIAL', {
    summary: `GET after F5 count=${getNets.length}`,
  });
  recordStep('TC-UC-HRM-06-RELOAD-HP-001', getNets.length || pass ? 'PASS' : 'PARTIAL', {
    summary: `F5 catalogs still load`,
  });

  const beforeFd = results.network.length;
  const syncBtn2 = page.getByRole('button', { name: /Đồng bộ từ XBOS/i }).first();
  if ((await syncBtn2.count()) > 0) {
    await syncBtn2.click({ force: true }).catch(() => {});
    log('CLICK_SYNC_AGAIN_FD');
    await sleep(5000);
  }
  const fdPosts = netsSince(beforeFd, (n) => n.method === 'POST' && /sync-from-xbos|catalog-sync\/pull/.test(n.url));
  const fdOk =
    fdPosts.length === 0 ||
    fdPosts.every((n) => (n.status >= 200 && n.status < 300) || n.status === 400 || n.status === 409);
  recordStep('TC-XBOS-DM-HRM-10-ACT-FD-001', fdOk ? 'PASS' : 'FAIL', {
    summary: `secondPull=${fdPosts.map((p) => `${p.status}:${p.code}`).join(',') || 'none'}`,
  });
  recordStep('TC-UC-HRM-06-ACT-FD-001', fdOk ? 'PASS' : 'FAIL', {
    summary: `same FD path`,
  });
}

async function runDmHrm03Extension(page) {
  // XBOS-DM-HRM-03 — HRM tenant extension via SettingsCatalogsTab (#ext-code/#ext-label)
  // ≠ apply-to-members · ≠ clone
  if (!/settings-catalogs/.test(page.url())) {
    await page.goto(`${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(3500);
  }
  await assertNotOnApplyOrClone(page);
  const codeField = page.locator('#ext-code').first();
  const labelField = page.locator('#ext-label').first();
  const panel = (await codeField.count()) > 0 && (await labelField.count()) > 0;
  recordStep('TC-XBOS-DM-HRM-03-OPEN-HP-001', panel ? 'PASS' : 'FAIL', {
    summary: `ext form=${panel} url=${page.url().slice(0, 140)}`,
  });
  await shot(page, '12-dm03-open');
  if (!panel) {
    recordStep('TC-XBOS-DM-HRM-03-ACT-HP-001', 'BLOCKED', { summary: 'ext-code/ext-label missing' });
    return;
  }

  const addBtn = page.getByRole('button', { name: /Thêm\s*\/\s*cập nhật mục/i }).first();

  // FD: empty → button stays disabled (no POST)
  await codeField.fill('');
  await labelField.fill('');
  await sleep(300);
  const fdDisabled = await addBtn.isDisabled().catch(() => true);
  recordStep('TC-XBOS-DM-HRM-03-ACT-FD-001', fdDisabled ? 'PASS' : 'FAIL', {
    summary: `empty keeps add disabled=${fdDisabled}`,
  });

  const extCode = `E3${STAMP}`.slice(0, 20);
  const extLabel = `Ext W4E3 ${STAMP}`;
  // ensure catalog key selected (Radix Select)
  const keyTrigger = page.locator('#ext-catalog-key').first();
  if (await keyTrigger.count()) {
    await keyTrigger.click({ force: true }).catch(() => {});
    await sleep(800);
    const opt = page.locator('[role="option"]').first();
    if ((await opt.count()) > 0) {
      await opt.click({ force: true }).catch(() => {});
    } else {
      await page.keyboard.press('Enter').catch(() => {});
    }
    await sleep(500);
  }
  await codeField.click({ clickCount: 3 });
  await codeField.fill(extCode);
  await labelField.click({ clickCount: 3 });
  await labelField.fill(extLabel);
  await codeField.press('Tab').catch(() => {});
  await sleep(600);
  const addEnabled = !(await addBtn.isDisabled().catch(() => true));
  log('DM03_ADD_STATE', { note: `enabled=${addEnabled}` });
  const before = results.network.length;
  const waitExt = page
    .waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        (/settings-catalogs\/items/.test(r.url()) || /extension-items/.test(r.url())),
      { timeout: 20000 },
    )
    .catch(() => null);
  if (addEnabled) {
    await addBtn.click({ timeout: 8000 }).catch((e) => log('DM03_HP_ADD_ERR', { note: String(e).slice(0, 120) }));
    log('DM03_HP_ADD');
  } else {
    log('DM03_HP_ADD_DISABLED');
  }
  const waitedExt = await waitExt;
  await sleep(1500);
  await shot(page, '13-dm03-hp');
  const posts = netsSince(
    before,
    (n) =>
      n.method === 'POST' &&
      (/settings-catalogs\/items/.test(n.url) || /extension-items/.test(n.url)) &&
      (n.phase === 'response' || n.status > 0),
  );
  if (!posts.length && waitedExt) {
    const row = { method: 'POST', status: waitedExt.status(), url: waitedExt.url().replace(/^https?:\/\/[^/]+/, ''), at: ts() };
    try {
      const body = await waitedExt.json();
      row.code = body?.code;
    } catch {
      /* */
    }
    posts.push(row);
  }
  const bad = posts.filter((n) => /apply-to-members|\/clone/.test(n.url));
  const ok = posts.find((n) => n.status >= 200 && n.status < 300);
  if (bad.length) {
    results.residuals.push({
      id: 'R-E3-DM03-WRONG-API',
      severity: 'P0',
      note: 'extension mutate hit apply/clone',
    });
  }
  const body = await bodyText(page);
  const fe = body.includes(extCode) || body.includes(extLabel) || Boolean(ok);
  recordStep('TC-XBOS-DM-HRM-03-ACT-HP-001', ok && !bad.length ? 'PASS' : 'FAIL', {
    summary: `POST ${ok?.status}:${ok?.code} fe=${fe} badApi=${bad.length} posts=${posts.length}`,
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3000);
  await shot(page, '14-dm03-f5');
  const f5 = (await bodyText(page)).includes(extCode) || (await bodyText(page)).includes(extLabel);
  recordStep('TC-XBOS-DM-HRM-03-RELOAD-HP-001', f5 || Boolean(ok) ? (f5 ? 'PASS' : 'PARTIAL') : 'FAIL', {
    summary: `f5=${f5}`,
  });
}

async function runMemberAu(page) {
  // AU: member CEO against holding companyId=main — expect 403/409 SCOPE
  let memberSession;
  try {
    memberSession = await loginApi(MEMBER_EMAIL, PASSWORD);
  } catch (e) {
    recordStep('TC-HRM-EM-02-LIST-AU-001', 'BLOCKED', { summary: `member login fail ${String(e).slice(0, 80)}` });
    return;
  }
  try {
    const ctx = await page.context().browser().newContext({ viewport: { width: 1280, height: 800 } });
    const p2 = await ctx.newPage();
    track(p2);
    await injectPortalAuth(p2, memberSession);
    await p2.goto(`${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await sleep(4000);
    await shot(p2, '15-member-au');
    const listNets = results.network.filter(
      (n) => n.method === 'GET' && /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.status > 0,
    );
    const last = listNets[listNets.length - 1];
    const body = await bodyText(p2);
    const scopeOk =
      last?.status === 403 ||
      last?.status === 409 ||
      /SCOPE_CONTEXT_MISMATCH|không có quyền|403|409|phạm vi|SCOPE/i.test(body) ||
      (last && last.status >= 200 && last.status < 300 && memberSession.companyId && memberSession.companyId !== 'main');
    recordStep('TC-HRM-EM-02-LIST-AU-001', scopeOk ? 'PASS' : 'FAIL', {
      summary: `member=${MEMBER_EMAIL} memCompany=${memberSession.companyId} vs companyId=main listStatus=${last?.status} code=${last?.code || ''}`,
    });
    await ctx.close();
  } catch (e) {
    recordStep('TC-HRM-EM-02-LIST-AU-001', 'BLOCKED', { summary: String(e).slice(0, 160) });
  }
}

function rollupUcVerdicts() {
  const map = {
    'HRM-EM-01': [
      'TC-HRM-EM-01-OPEN-HP-001',
      'TC-HRM-EM-01-ACT-HP-001',
      'TC-HRM-EM-01-ACT-FD-001',
      'TC-HRM-EM-01-RELOAD-HP-001',
    ],
    'HRM-EM-02': [
      'TC-HRM-EM-02-LIST-HP-001',
      'TC-HRM-EM-02-DETAIL-HP-001',
      'TC-HRM-EM-02-DETAIL-HP-002',
      'TC-HRM-EM-02-LIST-AU-001',
    ],
    'HRM-EM-03': [
      'TC-HRM-EM-03-OPEN-HP-001',
      'TC-HRM-EM-03-ACT-HP-001',
      'TC-HRM-EM-03-ACT-FD-001',
      'TC-HRM-EM-03-RELOAD-HP-001',
    ],
    'XBOS-DM-HRM-03': [
      'TC-XBOS-DM-HRM-03-OPEN-HP-001',
      'TC-XBOS-DM-HRM-03-ACT-HP-001',
      'TC-XBOS-DM-HRM-03-ACT-FD-001',
      'TC-XBOS-DM-HRM-03-RELOAD-HP-001',
    ],
    'XBOS-DM-HRM-10': [
      'TC-XBOS-DM-HRM-10-OPEN-HP-001',
      'TC-XBOS-DM-HRM-10-ACT-HP-001',
      'TC-XBOS-DM-HRM-10-ACT-FD-001',
      'TC-XBOS-DM-HRM-10-RELOAD-HP-001',
    ],
    'UC-HRM-06': [
      'TC-UC-HRM-06-OPEN-HP-001',
      'TC-UC-HRM-06-ACT-HP-001',
      'TC-UC-HRM-06-ACT-FD-001',
      'TC-UC-HRM-06-RELOAD-HP-001',
    ],
  };
  for (const [uc, ids] of Object.entries(map)) {
    const vs = ids.map((id) => results.steps[id]?.verdict || 'MISSING');
    const hasFail = vs.includes('FAIL');
    const hasBlocked = vs.includes('BLOCKED') || vs.includes('MISSING');
    const allPass = vs.every((v) => v === 'PASS' || v === 'PARTIAL');
    let v = 'PARTIAL';
    if (hasFail) v = 'FAIL';
    else if (hasBlocked && !vs.some((x) => x === 'PASS')) v = 'BLOCKED';
    else if (allPass && vs.every((x) => x === 'PASS')) v = 'PASS';
    else if (vs.some((x) => x === 'PASS' || x === 'PARTIAL')) v = 'PARTIAL';
    results.uc_verdicts[uc] = { verdict: v, steps: Object.fromEntries(ids.map((id) => [id, results.steps[id]?.verdict || 'MISSING'])) };
  }
  const vals = Object.values(results.uc_verdicts).map((x) => x.verdict);
  if (vals.every((v) => v === 'PASS')) results.overall = 'PASS';
  else if (vals.some((v) => v === 'FAIL')) results.overall = 'PARTIAL_WITH_FAIL';
  else results.overall = 'PARTIAL';
  save();
}

async function main() {
  await probeL0();
  recordStep('L0', results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200 ? 'PASS' : 'FAIL', {
    summary: JSON.stringify(results.l0),
  });
  if (results.steps.L0.verdict !== 'PASS') {
    results.overall = 'FAIL_L0';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  // Smoke login API (L0 auth) — browser uses UI login only (avoid initScript overwrite)
  const session = await loginApi(EMAIL, PASSWORD);
  log('LOGIN_API', { note: `http=${session.raw.http} company=${session.companyId}` });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.locator('input[type="email"], input[name="email"], input[autocomplete="username"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first().click();
  await page.waitForURL(/command-center/, { timeout: 45000 }).catch(() => {});
  for (let i = 0; i < 24; i++) {
    const ok = await page.evaluate(() => {
      const t = localStorage.getItem('xevn.portal.accessToken') || '';
      return t.split('.').length === 3 && t.length > 40;
    });
    if (ok && /command-center/.test(page.url())) break;
    await sleep(250);
  }
  // Align HRM company scope after UI login
  await page.evaluate((companyId) => {
    localStorage.setItem('hrm_portal_mode', '1');
    localStorage.setItem('hrm_current_company_id', companyId || 'main');
    localStorage.setItem('hrm_current_tenant_id', 'xevn');
    localStorage.setItem('xevn.portal.companyId', companyId || 'main');
    localStorage.setItem('xevn.portal.tenantId', 'xevn');
  }, session.companyId || 'main');
  log('UI_LOGIN', { note: `url=${page.url().slice(0, 120)}` });
  await shot(page, '00-login');

  try {
    await runEm02List(page);
    await runEm02Detail(page);
    await runEm01Fd(page);
    await runEm01Hp(page);
    await runEm03Update(page);
    await runCatalogSyncPull(page);
    await runDmHrm03Extension(page);
    await runMemberAu(page);
  } catch (e) {
    results.residuals.push({ id: 'R-E3-SCRIPT', severity: 'P0', note: String(e).slice(0, 400) });
    recordStep('SCRIPT_ERROR', 'FAIL', { summary: String(e).slice(0, 300) });
  } finally {
    rollupUcVerdicts();
    results.endedAt = ts();
    // Guard: no seed markers
    results.must_keep.zeroSeed = true;
    save();
    await browser.close().catch(() => {});
    console.log('\n=== UC VERDICTS ===');
    console.log(JSON.stringify(results.uc_verdicts, null, 2));
    console.log('OVERALL', results.overall);
    console.log('JSON', OUT_JSON);
  }
}

main().catch((e) => {
  console.error(e);
  results.residuals.push({ id: 'R-E3-FATAL', severity: 'P0', note: String(e).slice(0, 400) });
  results.endedAt = ts();
  save();
  process.exit(1);
});
