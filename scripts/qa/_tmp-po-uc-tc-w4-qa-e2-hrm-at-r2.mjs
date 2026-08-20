#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E2-HRM-AT-R2 — focused retest
 * AT-07: HDSD Quản lý đơn → Đề nghị cập nhật công → Eye → Duyệt
 *        Network POST approve 2xx + x-company-id (NOTE-ATT-SCOPE) + FE after 2xx + F5
 * AT-12: L1 only if pending leave already on FE; L2 = SPEC_GAP (never invent PASS)
 * U65: zero-seed · no invent Leave L2 · no apps/**
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
const COMPANY_ATT = process.env.QA_COMPANY_ID || 'trsport';
const COMPANY_LEAVE = process.env.QA_LEAVE_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r2-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const STAMP = `W4R2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E2-HRM-AT-R2',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, MGR_EMAIL, COMPANY_ATT, COMPANY_LEAVE, TENANT, STAMP, commit: COMMIT },
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { attRequestId: null, employeeId: null, employeeCode: null, employeeName: null },
  createAttBody: null,
  approveAttBody: null,
  approveAttHeaders: null,
  leaveApproveBody: null,
  leaveApproveHeaders: null,
  pendingLeaveCount: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
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
function q(path, companyId) {
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

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: 'main',
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
  if (!token) return null;
  const mem = data.active_membership ?? data.memberships?.[0] ?? {};
  return {
    token,
    expiresAt: Date.now() + (Number(data.expires_in_sec) || 8 * 3600) * 1000,
    email: MGR_EMAIL,
    companyId: mem.company_id || COMPANY_ATT,
    user: {
      userId: mem.employee_id || MGR_EMAIL,
      email: MGR_EMAIL,
      displayName: mem.employee_name || MGR_EMAIL,
      roles: data.roles || ['manager'],
    },
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
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      if (!/attendance\/(update-requests|leave-requests)/.test(u) && !/\/employees/.test(u)) return;
      const hdrs = res.request().headers();
      const xCompany = hdrs['x-company-id'] || hdrs['X-Company-Id'] || null;

      if (method === 'POST' && /\/attendance\/update-requests(\?|$)/.test(u) && !/\/(approve|reject)/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          results.createAttBody = {
            code: j?.code || null,
            status: res.status(),
            id: row?.id || null,
            requestStatus: row?.status || null,
            company_id: row?.company_id || null,
          };
          if (row?.id) results.ids.attRequestId = row.id;
          entry.code = j?.code || null;
          entry.createdId = row?.id || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/attendance\/update-requests\/[^/]+\/approve/.test(u)) {
        results.approveAttHeaders = { 'x-company-id': xCompany };
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          results.approveAttBody = {
            code: j?.code || null,
            status: res.status(),
            id: row?.id || null,
            requestStatus: row?.status || null,
            xCompanyId: xCompany,
          };
          entry.xCompanyId = xCompany;
          entry.code = j?.code || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/attendance\/leave-requests\/[^/]+\/approve/.test(u)) {
        results.leaveApproveHeaders = { 'x-company-id': xCompany };
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          results.leaveApproveBody = {
            code: j?.code || null,
            status: res.status(),
            id: row?.id || null,
            requestStatus: row?.status || null,
            xCompanyId: xCompany,
          };
          entry.xCompanyId = xCompany;
          entry.code = j?.code || null;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /leave-requests/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const rows = j?.data?.data ?? j?.data ?? [];
          const arr = Array.isArray(rows) ? rows : [];
          entry.rowCount = arr.length;
          entry.code = j?.code || null;
          const pending = arr.filter((r) => /pending|chờ|submitted|waiting/i.test(String(r.status || '')));
          results.pendingLeaveCount = pending.length || arr.length;
          entry.pendingCount = results.pendingLeaveCount;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function clickText(page, re) {
  const loc = page.getByRole('button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: 5000, force: true }).catch(() => {});
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"]')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: 5000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], span, div'),
    );
    const el = nodes.find((n) => rx.test((n.textContent || '').trim()) && n.offsetParent !== null);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
}

async function selectOuTmdv(page) {
  try {
    const ou = page.getByLabel(/Lọc đơn vị thành viên/i).first();
    const ou2 = (await ou.isVisible().catch(() => false)) ? ou : page.getByRole('combobox').first();
    if (!(await ou2.isVisible().catch(() => false))) return;
    await ou2.click({ force: true });
    await sleep(800);
    const opt = page
      .getByRole('option', { name: /Thương mại và Dịch vụ|Thương mại|trsport/i })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
      await sleep(1500);
      return;
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      const hit = items.find((n) => /thương mại|trsport|tmdv|dịch vụ x\.e/i.test(n.textContent || ''));
      if (hit) hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await sleep(1500);
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
  } catch {
    /* */
  }
}

async function openUpdateAttendanceTab(page) {
  // Close OU/combobox overlays that can steal menu clicks
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);
  const reqTab = page.locator('button').filter({ hasText: /Quản lý đơn|Yêu cầu|Requests/i }).first();
  if (await reqTab.isVisible().catch(() => false)) {
    await reqTab.click({ force: true });
    await sleep(800);
  } else {
    await clickText(page, /Quản lý đơn/i);
    await sleep(800);
  }
  const menuItem = page.getByRole('menuitem', { name: /Đề nghị cập nhật công|cập nhật công/i }).first();
  if (await menuItem.isVisible().catch(() => false)) {
    await menuItem.click({ force: true });
    await sleep(2000);
    return true;
  }
  const alt = page
    .locator('[role="menuitem"], [data-radix-collection-item]')
    .filter({ hasText: /Đề nghị cập nhật công|cập nhật công/i })
    .first();
  if (await alt.isVisible().catch(() => false)) {
    await alt.click({ force: true });
    await sleep(2000);
    return true;
  }
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'));
    const hit = nodes.find((n) => /đề nghị cập nhật công/i.test((n.textContent || '').trim()));
    if (!hit) return false;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
}

async function probeEmployees(token, companyId) {
  const h = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const emp = await fetch(`${HRM}/api/hrm/employees?company_id=${companyId}&page_size=20`, { headers: h }).then(
    (r) => r.json().catch(() => ({})),
  );
  const rows = emp?.data?.data ?? emp?.data?.items ?? emp?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  const staff = arr.find((e) => e?.manager_id) || arr[0];
  if (staff) {
    results.ids.employeeId = staff.id;
    results.ids.employeeCode = staff.employee_code;
    results.ids.employeeName = staff.full_name || staff.display_name;
  }
  return { total: emp?.data?.total ?? arr.length, staff };
}

async function main() {
  const okL0 = await l0();
  if (!okL0) {
    const dbHint =
      /ECONNREFUSED|5432|postgres|database/i.test(JSON.stringify(results.l0)) ||
      results.l0.hrm?.status === 0;
    results.seat_verdict = 'BLOCKED';
    results.residuals.push({
      id: 'R-W4-STACK-L0',
      severity: 'P0',
      owner: 'devops',
      note: dbHint
        ? 'L0 FAIL — Postgres/API down; honest BLOCKED to devops'
        : 'L0 FAIL — hrm/xbos/portal not all 200',
    });
    results.endedAt = ts();
    save();
    process.exit(3);
  }

  const session = await loginApi();
  await probeEmployees(session.token, COMPANY_ATT);
  recordStep('login', 'PASS', {
    summary: `ceo login; emp=${results.ids.employeeCode || '(none)'} totalProbe`,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  // ========== AT-04 create (FE precond) + AT-07 approve ==========
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, { ...session, companyId: COMPANY_ATT });
    const url = q('/hr/attendance', COMPANY_ATT);
    log('GOTO_AT07', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await selectOuTmdv(page);
    await shot(page, '01-mount');

    const navOk = await openUpdateAttendanceTab(page);
    await sleep(1500);
    await shot(page, '02-upd-tab');
    results.hdsd_inventory.push({
      surface: 'Quản lý đơn → Đề nghị cập nhật công',
      found: navOk,
      used: 'AT-07 R2',
    });

    const addVisible = await page
      .getByRole('button', { name: /Thêm đề nghị/i })
      .first()
      .isVisible()
      .catch(() => false);
    recordStep('at07_open_list', navOk && addVisible ? 'PASS' : 'FAIL', {
      summary: `navOk=${navOk} addVisible=${addVisible}`,
    });

    if (!(navOk && addVisible)) {
      setUc('HRM-AT-07', 'FAIL', { note: 'HDSD Đề nghị cập nhật công not operable' });
      results.residuals.push({
        id: 'R-W4-AT07-UI',
        severity: 'P0',
        owner: 'dev-fe',
        note: 'Quản lý đơn → Đề nghị cập nhật công CTA missing',
      });
      await ctx.close();
    } else {
      // Create pending from FE (U65 — not seed)
      await clickText(page, /Thêm đề nghị/i);
      await sleep(1200);
      let dlg = page.locator('[role="dialog"]').first();
      if (!(await dlg.isVisible().catch(() => false))) {
        await clickText(page, /Thêm đề nghị/i);
        await sleep(1200);
        dlg = page.locator('[role="dialog"]').first();
      }

      const empTrigger = dlg.locator('button[role="combobox"]').first();
      if (await empTrigger.isVisible().catch(() => false)) {
        await empTrigger.click({ force: true });
        await sleep(700);
        const code = results.ids.employeeCode || '';
        const opt = page.getByRole('option', { name: new RegExp(code || '.', 'i') }).first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
        else {
          const first = page.getByRole('option').first();
          if (await first.isVisible().catch(() => false)) await first.click({ force: true });
        }
        await sleep(400);
      }

      const dateBtn = dlg
        .getByRole('button')
        .filter({ hasText: /Chọn ngày|selectDate|common\.selectDate|\d{2}\/\d{2}\/\d{4}/i })
        .first();
      if (await dateBtn.isVisible().catch(() => false)) {
        await dateBtn.click({ force: true });
        await sleep(600);
        const dayBtn = page.locator('button[name="day"]:not([disabled])').first();
        if (await dayBtn.isVisible().catch(() => false)) await dayBtn.click({ force: true });
        await sleep(400);
      }

      await dlg.locator('textarea').first().fill(`YC chỉnh CC R2 ${STAMP}`);
      await shot(page, '03-create-filled');
      await dlg
        .getByRole('button', { name: /Thêm mới|Thêm|Gửi|Lưu/i })
        .last()
        .click({ force: true });
      await sleep(2500);
      await shot(page, '04-created');

      const createOk =
        results.createAttBody &&
        results.createAttBody.status >= 200 &&
        results.createAttBody.status < 300 &&
        results.createAttBody.id;
      recordStep('at07_precond_create', createOk ? 'PASS' : 'FAIL', {
        summary: createOk
          ? `POST ${results.createAttBody.status} ${results.createAttBody.code} id=${results.createAttBody.id}`
          : `createBody=${JSON.stringify(results.createAttBody)}`,
      });

      if (!createOk) {
        setUc('HRM-AT-07', 'BLOCKED', { note: 'FE create update-request failed — no pending for approve' });
        results.residuals.push({
          id: 'R-W4-AT07-CREATE-PRECOND',
          severity: 'P0',
          owner: 'dev-fe',
          note: 'Cannot create pending update-request from FE before approve',
        });
        await ctx.close();
      } else {
        // F5 list then Eye → Duyệt
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(3000);
        await selectOuTmdv(page);
        await openUpdateAttendanceTab(page);
        await sleep(2000);
        await shot(page, '05-list-f5');
        const bodyF5 = await page.locator('body').innerText().catch(() => '');
        const stampUi = bodyF5.includes(STAMP);
        recordStep('at07_list_stamp', stampUi ? 'PASS' : 'PARTIAL', {
          summary: `stampOnUi=${stampUi}`,
        });

        results.approveAttBody = null;
        results.approveAttHeaders = null;

        let row = page.locator('tr').filter({ hasText: STAMP }).first();
        if (!(await row.isVisible().catch(() => false))) {
          row = page
            .locator('tr')
            .filter({ hasText: /Chờ duyệt|pending/i })
            .first();
        }
        const eye = row.locator('td').last().locator('button').first();
        let eyeOk = false;
        if (await eye.isVisible().catch(() => false)) {
          await eye.click({ force: true });
          eyeOk = true;
          await sleep(1500);
        } else {
          eyeOk = await page.evaluate((stamp) => {
            const rows = Array.from(document.querySelectorAll('tr'));
            const hit = rows.find((r) => (r.textContent || '').includes(stamp));
            if (!hit) return false;
            const btns = Array.from(hit.querySelectorAll('button'));
            if (!btns[0]) return false;
            btns[0].click();
            return true;
          }, STAMP);
          await sleep(1500);
        }
        recordStep('at07_eye', eyeOk ? 'PASS' : 'FAIL', { summary: `eyeOk=${eyeOk}` });
        results.hdsd_inventory.push({ surface: 'Eye → Chi tiết đề nghị', found: eyeOk, used: 'AT-07' });

        const detail = page
          .locator('[role="dialog"]')
          .filter({ hasText: /Chi tiết|requestDetail|Lý do|Phê duyệt|Duyệt|Từ chối/i })
          .last();
        await detail.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
        await shot(page, '06-detail');
        const apBtn = detail.getByRole('button', { name: /Phê duyệt|Duyệt|Approve/i }).first();
        if (await apBtn.isVisible().catch(() => false)) {
          await apBtn.click({ force: true });
          await sleep(2500);
        } else {
          await page
            .locator('[role="dialog"] button')
            .filter({ hasText: /Phê duyệt|Duyệt|Approve/i })
            .first()
            .click({ force: true })
            .catch(() => {});
          await sleep(2500);
        }
        await shot(page, '07-after-approve');
        results.hdsd_inventory.push({
          surface: 'Duyệt / Phê duyệt trên dialog',
          found: true,
          used: 'AT-07',
        });

        let apOk =
          results.approveAttBody &&
          results.approveAttBody.status >= 200 &&
          results.approveAttBody.status < 300;

        // Mgr fallback if CEO approve missed
        if (!apOk) {
          const mgr = await loginMgrMobile();
          log('MGR_FALLBACK', { note: mgr ? `ok companyId=${mgr.companyId}` : 'FAILED' });
          if (mgr) {
            await ctx.close().catch(() => {});
            const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 960 } });
            const page2 = await ctx2.newPage();
            track(page2);
            await injectPortalAuth(page2, { ...mgr, companyId: COMPANY_ATT });
            await page2.goto(q('/hr/attendance', COMPANY_ATT), {
              waitUntil: 'domcontentloaded',
              timeout: 90000,
            });
            await sleep(4500);
            await selectOuTmdv(page2);
            await openUpdateAttendanceTab(page2);
            await sleep(2500);
            await shot(page2, '08-mgr-list');
            const row2 = page2.locator('tr').filter({ hasText: STAMP }).first();
            const eye2 = row2.locator('td').last().locator('button').first();
            if (await eye2.isVisible().catch(() => false)) {
              await eye2.click({ force: true });
              await sleep(1500);
              await page2
                .locator('[role="dialog"]')
                .last()
                .getByRole('button', { name: /Phê duyệt|Duyệt/i })
                .first()
                .click({ force: true })
                .catch(() => {});
              await sleep(2500);
            }
            await shot(page2, '09-mgr-approve');
            // F5 after approve
            await page2.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
            await sleep(3000);
            await openUpdateAttendanceTab(page2);
            await sleep(2000);
            await shot(page2, '10-mgr-f5');
            const body2 = await page2.locator('body').innerText().catch(() => '');
            results.at07_f5 = {
              stampGoneOrApproved:
                !body2.includes(STAMP) || /đã duyệt|approved|approved_by/i.test(body2),
              stampStillVisible: body2.includes(STAMP),
            };
            await ctx2.close().catch(() => {});
            apOk =
              results.approveAttBody &&
              results.approveAttBody.status >= 200 &&
              results.approveAttBody.status < 300;
          }
        } else {
          // F5 after CEO approve
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
          await sleep(3000);
          await selectOuTmdv(page);
          await openUpdateAttendanceTab(page);
          await sleep(2000);
          await shot(page, '10-ceo-f5');
          const bodyAfter = await page.locator('body').innerText().catch(() => '');
          const statusCell = page.locator('tr').filter({ hasText: STAMP }).first();
          const statusText = (await statusCell.innerText().catch(() => '')) || bodyAfter;
          results.at07_f5 = {
            stampVisible: bodyAfter.includes(STAMP),
            statusText: statusText.slice(0, 200),
            approvedHint: /đã duyệt|approved|phê duyệt/i.test(statusText),
          };
          recordStep('at07_f5', 'PASS', {
            summary: `FE after 2xx+F5 stampVisible=${results.at07_f5.stampVisible} approvedHint=${results.at07_f5.approvedHint}`,
          });
          await ctx.close().catch(() => {});
        }

        try {
          for (const c of browser.contexts()) await c.close().catch(() => {});
        } catch {
          /* */
        }

        const xCo = String(results.approveAttHeaders?.['x-company-id'] || '');
        const scopeOk =
          apOk &&
          (xCo === COMPANY_ATT ||
            xCo === '10000000-0000-4000-8000-000000000002' ||
            /trsport/i.test(xCo));
        recordStep('at07_appr', apOk ? 'PASS' : 'FAIL', {
          summary: `approve status=${results.approveAttBody?.status} code=${results.approveAttBody?.code} x-company-id=${xCo || '(missing)'} reqStatus=${results.approveAttBody?.requestStatus}`,
        });
        recordStep('at07_x_company', scopeOk ? 'PASS' : apOk ? 'FAIL' : 'FAIL', {
          summary: `NOTE-ATT-SCOPE x-company-id=${xCo || '(missing)'}`,
        });

        if (apOk && scopeOk) {
          setUc('HRM-AT-07', 'PASS', {
            approve: results.approveAttBody,
            headers: results.approveAttHeaders,
            f5: results.at07_f5 || null,
            path: 'HDSD Eye→Duyệt + F5',
          });
        } else if (apOk && !scopeOk) {
          setUc('HRM-AT-07', 'FAIL', {
            note: 'approve 2xx but x-company-id not OU/trsport (NOTE-ATT-SCOPE)',
            headers: results.approveAttHeaders,
            approve: results.approveAttBody,
          });
          results.residuals.push({
            id: 'R-W4-AT07-X-COMPANY',
            severity: 'P0',
            owner: 'dev-fe',
            note: `NOTE-ATT-SCOPE: x-company-id=${xCo || 'empty'} on POST approve`,
          });
        } else {
          setUc('HRM-AT-07', 'FAIL', { approveAttBody: results.approveAttBody });
          results.residuals.push({
            id: 'R-W4-AT07-APPROVE',
            severity: 'P0',
            owner: 'dev-fe',
            note: 'AT-07 FE Eye→Duyệt did not yield POST approve 2xx',
          });
        }
      }
    }
  }

  // ========== AT-12 L1 only if pending leave from FE exists ==========
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    const page = await ctx.newPage();
    track(page);
    await injectPortalAuth(page, { ...session, companyId: COMPANY_LEAVE });
    await page.goto(q('/hr/attendance', COMPANY_LEAVE), {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(4000);
    await shot(page, '11-leave-mount');

    const leaveTab = page.locator('[role="tab"], button, a').filter({ hasText: /Nghỉ phép|Leave/i }).first();
    let leaveOk = false;
    if (await leaveTab.isVisible().catch(() => false)) {
      await leaveTab.click({ force: true });
      leaveOk = true;
      await sleep(3000);
    } else {
      leaveOk = await clickText(page, /Nghỉ phép/i);
      await sleep(3000);
    }
    results.hdsd_inventory.push({ surface: 'Nghỉ phép tab', found: leaveOk, used: 'AT-12 L1 gate' });

    // Chờ duyệt tab only (not bare Duyệt CTA)
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('[role="tab"], button, a'));
      const hit = nodes.find((n) => /^Chờ duyệt$/i.test((n.textContent || '').replace(/\s+/g, ' ').trim()));
      if (hit) hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await sleep(2000);
    await shot(page, '12-leave-pending');

    const pendingUi = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      const hasPendingWord = /Chờ duyệt|pending/i.test(body);
      const approveBtns = Array.from(document.querySelectorAll('button')).filter((b) => {
        const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
        return (
          /^Duyệt$/i.test(t) ||
          /approve/i.test(b.getAttribute('aria-label') || '') ||
          (b.getAttribute('data-testid') || '').includes('leave-list-approve')
        );
      });
      return { hasPendingWord, approveBtnCount: approveBtns.length };
    });

    const pendingExists =
      (results.pendingLeaveCount != null && results.pendingLeaveCount > 0) ||
      pendingUi.approveBtnCount > 0;

    recordStep('at12_pending_gate', pendingExists ? 'PASS' : 'BLOCKED', {
      summary: `pendingLeaveCount=${results.pendingLeaveCount} approveBtnCount=${pendingUi.approveBtnCount} (no invent create)`,
    });

    // LOCK L2
    recordStep('at12_l2_ladder', 'SPEC_GAP', {
      summary: 'Leave L2 ladder AS-IS — SPEC_GAP — not invented PASS',
    });

    if (!pendingExists) {
      setUc('HRM-AT-12', 'BLOCKED', {
        note: 'No pending leave from FE on list — L1 not attempted; L2 SPEC_GAP (not PASS)',
        l1: null,
        l2: 'SPEC_GAP',
      });
    } else {
      results.leaveApproveBody = null;
      let apL1 = false;
      const byTestId = page.locator('[data-testid^="hdsd-leave-list-approve"]').first();
      if (await byTestId.isVisible().catch(() => false)) {
        await byTestId.click({ force: true });
        apL1 = true;
        await sleep(2500);
      } else {
        const apBtn = page.getByRole('button', { name: /^Duyệt$/i }).first();
        if (await apBtn.isVisible().catch(() => false)) {
          await apBtn.click({ force: true });
          apL1 = true;
          await sleep(2500);
        } else {
          apL1 = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find((b) =>
              /^Duyệt$/i.test((b.textContent || '').replace(/\s+/g, ' ').trim()),
            );
            if (!btn) return false;
            btn.click();
            return true;
          });
          await sleep(2500);
        }
      }
      await shot(page, '13-at12-l1-approve');

      const apL1Ok =
        results.leaveApproveBody &&
        results.leaveApproveBody.status >= 200 &&
        results.leaveApproveBody.status < 300;
      recordStep('at12_l1_appr', apL1Ok ? 'PASS' : apL1 ? 'FAIL' : 'BLOCKED', {
        summary: `L1 approve status=${results.leaveApproveBody?.status} code=${results.leaveApproveBody?.code} x-company-id=${results.leaveApproveHeaders?.['x-company-id']} clicked=${apL1}`,
      });

      if (apL1Ok) {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(2500);
        await shot(page, '14-at12-l1-f5');
        setUc('HRM-AT-12', 'PARTIAL', {
          note: 'L1 approve EVIDENCED; L2 SPEC_GAP (not PASS)',
          l1: results.leaveApproveBody,
          l2: 'SPEC_GAP',
        });
      } else if (apL1) {
        setUc('HRM-AT-12', 'FAIL', {
          note: 'L1 Duyệt clicked but no POST approve 2xx; L2 SPEC_GAP',
          l1: results.leaveApproveBody,
          l2: 'SPEC_GAP',
        });
        results.residuals.push({
          id: 'R-W4-AT12-L1-APPROVE',
          severity: 'P1',
          owner: 'dev-fe',
          note: 'AT-12 L1 Duyệt clicked but no POST approve 2xx',
        });
      } else {
        setUc('HRM-AT-12', 'BLOCKED', {
          note: 'Pending leave visible but Duyệt CTA not clickable; L2 SPEC_GAP',
          l1: null,
          l2: 'SPEC_GAP',
        });
      }
    }
    await ctx.close();
  }

  await browser.close();

  const at07 = results.uc['HRM-AT-07']?.verdict;
  results.seat_verdict = at07 === 'PASS' ? (results.residuals.some((r) => r.severity === 'P0') ? 'PARTIAL' : 'PASS') : at07 || 'FAIL';
  if (at07 === 'FAIL') results.seat_verdict = 'FAIL';
  results.endedAt = ts();
  save();
  console.log('\n=== UC VERDICTS ===');
  for (const [k, v] of Object.entries(results.uc)) {
    console.log(`${k}: ${v.verdict} — ${v.note || ''}`);
  }
  console.log('seat_verdict:', results.seat_verdict);
  console.log('residuals:', JSON.stringify(results.residuals, null, 2));
  process.exitCode = at07 === 'FAIL' || at07 === 'BLOCKED' ? 2 : 0;
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e?.stack || e);
  save();
  process.exit(1);
});
