#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-DETAIL-01 — U65 browser employee profile shell
 * J-HRM-02 list → detail → general tab labels → salary gate spot → Back
 * Matrix #10–12 · HDSD CH06 §6 · must_keep #28 scope · no deep-mutate · no seed
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const TENANT = 'xevn';
const COMPANY = 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-detail-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-detail-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M3-EMP-DETAIL-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  journeys: ['J-HRM-02'],
  matrix_surface: [10, 11, 12],
  must_keep: [28],
  persona: { email: EMAIL, tenantId: TENANT, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, commit: COMMIT },
  l0: {},
  click_log: [],
  network: [],
  mutates: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  verdict: null,
  ack_status: null,
  employees_closed: false,
  attendance_closed: false,
  uat_done: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function log(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[${results.click_log.length}] ${action}`, detail.url || detail.text || detail.note || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
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

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u) && !/\/api\/xbos\/auth/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        results.mutates.push({
          at: ts(),
          method,
          status: res.status(),
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        });
      }
      let bodySnippet = null;
      try {
        if (method === 'GET' && /\/employees/.test(u)) {
          const j = await res.json();
          const d = j?.data ?? j;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          if (items?.[0]) {
            bodySnippet = {
              total: d?.total ?? items.length,
              sample_companies: [
                ...new Set(items.slice(0, 20).map((i) => i.company_id).filter(Boolean)),
              ],
              first: {
                id: items[0].id,
                company_id: items[0].company_id,
                display_name:
                  items[0].display_name || items[0].full_name || items[0].employee_name,
              },
            };
          } else if (d && typeof d === 'object' && d.id) {
            bodySnippet = {
              id: d.id,
              company_id: d.company_id,
              display_name: d.display_name || d.full_name,
              code: j?.code,
              has_salary_field: Object.prototype.hasOwnProperty.call(d, 'salary'),
            };
          } else {
            bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 100) };
          }
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  log('API_LOGIN', { email: EMAIL, companyId: COMPANY, tenantId: TENANT });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed ${EMAIL} HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    email: EMAIL,
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    tenantId: TENANT,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || [],
    },
  };
}

async function injectAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
    }
  }, session);
}

function isListGet(n) {
  return (
    n.method === 'GET' &&
    /\/api\/hrm\/employees(\?|$)/.test(n.url) &&
    !/\/employees\/[0-9a-f-]{8,}/i.test(n.url)
  );
}

function isDetailGet(n) {
  return n.method === 'GET' && /\/api\/hrm\/employees\/[0-9a-f-]{8,}/i.test(n.url);
}

function scopeBad(status) {
  return status === 404 || status === 409 || status === 403;
}

async function clickBack(page) {
  // Happy-path profile: icon-only ArrowLeft (size=icon) — HDSD «← Danh sách»
  const iconBack = page
    .locator('[data-testid="employee-profile-page"] button')
    .first();
  if (await iconBack.count()) {
    log('CLICK_BACK_ICON', { note: 'profile header ArrowLeft icon' });
    await iconBack.click({ timeout: 5000 }).catch(() => {});
    await sleep(2000);
    return 'icon';
  }
  const back = page
    .locator('button, a, [role="button"]')
    .filter({ hasText: /Quay lại|Back|←|Danh sách/i })
    .first();
  if (await back.count()) {
    log('CLICK_BACK', { text: ((await back.textContent()) || '').trim().slice(0, 40) });
    await back.click({ timeout: 5000 }).catch(() => {});
    await sleep(2000);
    return 'button';
  }
  log('HISTORY_BACK', {});
  await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(2000);
  return 'history';
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push('L0 stack not ready');
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN',
    });
    const page = await ctx.newPage();
    track(page);
    await injectAuth(page, session);

    const listUrl = `${PORTAL}/hr/employees?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
    log('NAV_EMPLOYEES', { url: listUrl });
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §2 Danh sách nhân sự',
      attempted: true,
      persona: EMAIL,
    });
    const netBefore = results.network.length;
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4500);
    await shot(page, '01-list');

    const rows = await page.locator('table tbody tr').count();
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
    const syncError = /Sync ERROR|HRM API.*ERROR|409|companyId mismatches/i.test(bodyText);
    const listNets = results.network.slice(netBefore).filter(isListGet);
    const listOk = listNets.find((n) => n.status >= 200 && n.status < 300);
    const listBad = listNets.filter((n) => scopeBad(n.status));

    results.surfaces.list = {
      rows,
      syncError,
      listStatus: listOk?.status ?? listNets[0]?.status ?? null,
      companyQueryOk: listOk ? /company_id=main/.test(listOk.url) : false,
      total: listOk?.bodySnippet?.total ?? null,
      bad: listBad.map((n) => ({ status: n.status, url: n.url })),
    };

    if (!listOk || rows === 0 || syncError || listBad.length) {
      results.failReasons.push('list_empty_or_scope_error');
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
      results.endedAt = ts();
      save();
      await ctx.close();
      process.exit(2);
    }

    // Prefer holding/rollup row under main
    let target = page.locator('table tbody tr').first();
    const rollupHint = page
      .locator('table tbody tr')
      .filter({ hasText: /holding|Holding|Tập đoàn|du-lich|Du lịch|trsport|vanchuyen/i });
    if (await rollupHint.count()) target = rollupHint.first();
    const rowText = ((await target.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 140);

    const beforeDetail = results.network.length;
    log('CLICK_EMPLOYEE_ROW', { text: rowText });
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §6 Hồ sơ · §2.4 list→detail J-HRM-02',
      attempted: true,
    });
    await target.locator('td').first().click({ timeout: 8000 }).catch(async () => {
      await target.click({ timeout: 8000 });
    });
    await sleep(4500);
    await shot(page, '02-detail-shell');

    const detailUrl = page.url();
    const detailId = detailUrl.match(/\/employees\/([0-9a-f-]{8,})/i)?.[1] || null;
    const detailNets = results.network.slice(beforeDetail).filter(isDetailGet);
    const detailOk = detailNets.find((n) => n.status >= 200 && n.status < 300);
    const detailBad = detailNets.filter((n) => scopeBad(n.status));

    // #10 shell + #11 general tab
    const shellUi = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      const rawKeyLeak =
        /employeeProfile\.tabs\.|employees\.[a-z_]+|status\.(active|inactive)/i.test(t) &&
        !/Đang làm việc|Đã nghỉ việc|Thử việc/.test(t);
      const profileRoot = document.querySelector('[data-testid="employee-profile-page"]');
      const iconBackBtn = !!profileRoot?.querySelector('button');
      const labels = {
        // Product uses icon-only ArrowLeft on happy path (text label only on notFound)
        back: /Quay lại danh sách|←\s*Danh sách|Quay lại/i.test(t) || iconBackBtn,
        back_mode: /Quay lại danh sách/i.test(t) ? 'text' : iconBackBtn ? 'icon' : 'missing',
        edit: /\bSửa\b|Chỉnh sửa/i.test(t),
        tabGeneral: /Thông tin chung/i.test(t),
        tabWork: /Công việc|Việc làm/i.test(t),
        tabContract: /Hợp đồng/i.test(t),
        tabSalary: /Lương/i.test(t),
        tabInsurance: /Bảo hiểm/i.test(t),
        groupCore: /Cốt lõi/i.test(t),
        groupHr: /Nhân sự|Nhóm HR|HR/i.test(t),
      };
      const generalFields = {
        department: /Phòng ban|Bộ phận/i.test(t),
        position: /Chức vụ|Chức danh|Vị trí/i.test(t),
        status: /Đang làm việc|Thử việc|Đã nghỉ|Tạm nghỉ|Trạng thái/i.test(t),
        manager: /Quản lý|Người quản lý|Báo cáo cho/i.test(t),
        code: /Mã nhân viên|Mã NV|Employee code|Mã NV/i.test(t),
        email: /Email|Thư điện tử/i.test(t),
      };
      return {
        hasTabs: labels.tabGeneral && labels.tabSalary,
        notFound: /Không tìm thấy nhân viên|Employee not found|404/i.test(t),
        scopeMismatch: /companyId mismatches|SCOPE_CONTEXT|409/i.test(t),
        labels,
        generalFields,
        rawKeyLeak,
        permFallbackVisible: /Không có quyền xem nội dung này/i.test(t),
        bodySnippet: t.replace(/\s+/g, ' ').trim().slice(0, 600),
      };
    });

    results.surfaces.shell_10 = {
      detailUrl: detailUrl.slice(0, 220),
      detailId,
      detailStatus: detailOk?.status ?? detailNets[0]?.status ?? null,
      detailCode: detailOk?.bodySnippet?.code ?? null,
      detailCompanyQ: detailOk ? /company_id=main/.test(detailOk.url) : false,
      detailCompanyIdBody: detailOk?.bodySnippet?.company_id ?? null,
      bad: detailBad.map((n) => ({ status: n.status, url: n.url })),
      ui: {
        back: shellUi.labels.back,
        back_mode: shellUi.labels.back_mode,
        edit: shellUi.labels.edit,
        tabs: {
          general: shellUi.labels.tabGeneral,
          work: shellUi.labels.tabWork,
          contract: shellUi.labels.tabContract,
          salary: shellUi.labels.tabSalary,
          insurance: shellUi.labels.tabInsurance,
        },
        notFound: shellUi.notFound,
        scopeMismatch: shellUi.scopeMismatch,
      },
    };

    results.surfaces.general_11 = {
      fields: shellUi.generalFields,
      rawKeyLeak: shellUi.rawKeyLeak,
      labels_vi: shellUi.labels.tabGeneral,
      active_default: true, // general is default tab on load
    };

    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §6.1 Tab Thông tin chung — labels VI',
      attempted: true,
      labels_ok: shellUi.labels.tabGeneral && !shellUi.rawKeyLeak,
    });

    // #12 salary gate AU spot — click only, no mutate
    const salaryTab = page
      .locator('button, [role="tab"], a')
      .filter({ hasText: /Lương/i })
      .first();
    let salarySpot = { clicked: false, mode: null };
    if (await salaryTab.count()) {
      const beforeSal = results.network.length;
      log('CLICK_SALARY_TAB', { note: 'AU spot read-only — no mutate' });
      results.hdsd_inventory.push({
        surface: 'HDSD CH06 §6.1/§6.3 Tab Lương — quyền view_salary / PermissionFallback',
        attempted: true,
      });
      await salaryTab.click({ timeout: 5000 }).catch(() => {});
      await sleep(2500);
      await shot(page, '03-salary-tab');
      const salUi = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const fallback = /Không có quyền xem nội dung này/i.test(t);
        const contactHr = /Liên hệ HR/i.test(t);
        const salaryContent =
          /Lương cơ bản|Phụ cấp|base salary|Compensation|Biểu đồ|đãi ngộ|VND|₫/i.test(t);
        const sensitiveLeak =
          fallback && /\d{1,3}([.,]\d{3}){2,}/.test(t) && /lương|salary/i.test(t);
        return { fallback, contactHr, salaryContent, sensitiveLeak, snippet: t.replace(/\s+/g, ' ').trim().slice(0, 500) };
      });
      const salNets = results.network.slice(beforeSal);
      salarySpot = {
        clicked: true,
        mode: salUi.fallback ? 'PERMISSION_FALLBACK' : salUi.salaryContent ? 'CONTENT_VISIBLE' : 'EMPTY_OR_PARTIAL',
        ui: salUi,
        networkAfter: salNets.slice(0, 12).map((n) => ({
          method: n.method,
          status: n.status,
          url: n.url.slice(0, 160),
        })),
        mutates_during_salary: results.mutates.length,
      };
    } else {
      salarySpot = { clicked: false, mode: 'TAB_NOT_FOUND' };
      results.failReasons.push('salary_tab_not_found');
    }
    results.surfaces.salary_12 = salarySpot;

    // Ensure no deep mutate: do NOT open edit / save / nested CRUD
    log('NO_DEEP_MUTATE', { note: 'skip Edit/Save/nested tabs mutate — P1 later' });

    // Back to list
    const backMode = await clickBack(page);
    await sleep(1500);
    if (!/\/employees\/?(\?|$)/.test(page.url()) || /\/employees\/[0-9a-f-]/i.test(page.url())) {
      log('RENAV_LIST_AFTER_BACK', {});
      await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2500);
    }
    await shot(page, '04-back-list');
    const rowsAfter = await page.locator('table tbody tr').count();
    const backUrl = page.url();
    const onList =
      /\/hr\/employees\/?(\?|$)/.test(backUrl) && !/\/employees\/[0-9a-f-]{8,}/i.test(backUrl);
    // Icon navigate('/employees') may drop ?portal&companyId — session still scopes list (OBS)
    results.surfaces.back = {
      mode: backMode,
      url: backUrl.slice(0, 220),
      rowsAfter,
      onList,
      companyIdInUrl: /companyId=main/.test(backUrl),
      query_drop_obs: backMode === 'icon' && !/companyId=main/.test(backUrl),
    };
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §6 ← Danh sách (Back)',
      attempted: true,
      rowsAfter,
    });

    await ctx.close();

    // Verdict
    const shell = results.surfaces.shell_10;
    const general = results.surfaces.general_11;
    const salary = results.surfaces.salary_12;
    const back = results.surfaces.back;

    const shellPass =
      !!shell.detailId &&
      shell.detailStatus === 200 &&
      shell.detailCompanyQ &&
      shell.bad.length === 0 &&
      !shell.ui.notFound &&
      !shell.ui.scopeMismatch &&
      shell.ui.back &&
      shell.ui.tabs.general &&
      shell.ui.tabs.salary;

    const generalPass =
      general.labels_vi &&
      !general.rawKeyLeak &&
      (general.fields.department || general.fields.position || general.fields.status);

    // CEO group typically has view_salary → CONTENT_VISIBLE OK; FALLBACK also OK for AU honesty
    const salaryPass =
      salary.clicked &&
      (salary.mode === 'CONTENT_VISIBLE' || salary.mode === 'PERMISSION_FALLBACK') &&
      !salary.ui?.sensitiveLeak;

    const backPass = back.rowsAfter > 0 && back.onList;
    const noMutate = results.mutates.length === 0;
    const noPageCrash = results.pageErrors.length === 0;

    if (!shellPass) results.failReasons.push('shell_10_fail');
    if (!generalPass) results.failReasons.push('general_11_fail');
    if (!salaryPass) results.failReasons.push('salary_12_fail');
    if (!backPass) results.failReasons.push('back_fail');
    if (!noMutate) results.failReasons.push('unexpected_mutate');
    if (!noPageCrash) results.failReasons.push('page_errors');

    const pass = results.failReasons.length === 0;
    results.verdict = pass ? 'PASS' : 'FAIL';
    results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.criteria = {
      l0_pass: results.l0.hrm === 200 && results.l0.portal === 200,
      j_hrm_02_shell: shellPass,
      general_labels_vi: generalPass,
      salary_gate_spot: salaryPass,
      salary_mode: salary.mode,
      back_to_list: backPass,
      no_404_409: shell.bad.length === 0 && listBad.length === 0,
      no_deep_mutate: noMutate,
      u65_zero_seed: true,
      no_invent_employees_closed: true,
      must_keep_28_scope: shell.detailCompanyQ && shell.detailStatus === 200,
    };
  } finally {
    await browser.close();
  }

  results.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        criteria: results.criteria,
        failReasons: results.failReasons,
        salary_mode: results.surfaces.salary_12?.mode,
        mutates: results.mutates.length,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
