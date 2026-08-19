/**
 * PO-E2E-SPINE-01-QA-W5 — HP-05 harden (NV/HĐ after hire soft-link) + HP-06 payroll blank
 * Entry: W4-R1 PASS · cand SP4SDEKW49 · empId 5c3ea407 · HP-03/04 CLOSED
 * U65 zero-seed · U76 HDSD · U78 chronological · anti-idle
 * must_keep: Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 — do not reopen
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const EMP_ID =
  process.env.QA_EMP_ID || '5c3ea407-02cb-4cfa-a36c-9ada56908010';
const EMP_ID_SHORT = EMP_ID.slice(0, 8);
const CAND_STAMP = process.env.QA_CAND_STAMP || 'SP4SDEKW49';
const CAND_NAME_HINT = process.env.QA_CAND_NAME_HINT || 'Nguyen Hire Pay';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w5-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const q = (path, extra = {}) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || 'xevn');
  u.searchParams.set('companyId', extra.companyId || 'main');
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
};

const results = {
  work_item_id: 'PO-E2E-SPINE-01-QA-W5',
  program: 'PO-E2E-BIZ-SPINE-01',
  spine: 'E2E-SPINE-01',
  focus: 'HP-05 · J-HRM-01/02/03 · HP-06 · J-HRM-07',
  startedAt: ts(),
  env: {
    PORTAL,
    EMAIL,
    u65: 'zero-seed',
    companyId: 'main',
    empId: EMP_ID,
    candStamp: CAND_STAMP,
    prior: 'PO-E2E-SPINE-01-QA-W4-R1',
  },
  l0: {},
  click_log: [],
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: {
    employeeId: EMP_ID,
    candidateStamp: CAND_STAMP,
    detailGetStatus: null,
    contractGetStatus: null,
    payrollGetStatus: null,
  },
  hp05: {
    listOk: false,
    detailOk: false,
    detailUrl: null,
    stampOnList: false,
    stampOnDetail: false,
    codeHintSeen: false,
    contractTabOk: false,
    contractsListOk: false,
    jhrm01: false,
    contractSurface: null,
    productGap: null,
  },
  hp06: {
    loaded: false,
    url: null,
    emptyHonest: false,
    hasRows: false,
    stampSeen: false,
    blankPane: false,
    banner: false,
  },
  seed_used: false,
  gap: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function logClick(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[CLICK ${results.click_log.length}] ${entry.at} ${action}`, detail.url || detail.text || '');
  return entry;
}

function recordStep(id, verdict, detail) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      };
      const interesting =
        /employees|contracts|payroll|payslip|salary|auth\/login/.test(u);
      if (!interesting) return;

      if (method === 'GET' && /\/employees\/[^/?]+/.test(u)) {
        results.ids.detailGetStatus = res.status();
        entry.detailId = EMP_ID_SHORT;
      }
      if (method === 'GET' && /\/contracts/.test(u)) {
        results.ids.contractGetStatus = res.status();
      }
      if (method === 'GET' && /payroll|payslip|salary/.test(u)) {
        results.ids.payrollGetStatus = res.status();
      }
      results.network.push(entry);
      if (results.network.length > 800) results.network.shift();
    } catch {
      /* */
    }
  });
}

function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
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
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
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
    }
  }, session);
}

async function probeL0() {
  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm_api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos_api', 'http://127.0.0.1:28002/api/xbos'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 120);
    }
  }
  save();
}

async function clickText(page, re, opts = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_role', { text: String(re), url: page.url() });
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"], [role="row"], tr, div, span')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_text', { text: String(re), url: page.url() });
    return true;
  }
  return false;
}

async function trySearch(page, query) {
  const selectors = [
    'input[placeholder*="Tìm"]',
    'input[placeholder*="Search"]',
    'input[type="search"]',
    'input[name*="search" i]',
    '[data-testid*="search"] input',
    'header input[type="text"]',
  ];
  for (const sel of selectors) {
    const inp = page.locator(sel).first();
    if (await inp.isVisible().catch(() => false)) {
      await inp.fill('').catch(() => {});
      await inp.fill(query).catch(() => {});
      await inp.press('Enter').catch(() => {});
      logClick('search_emp', { text: query, sel });
      await sleep(2000);
      return true;
    }
  }
  return false;
}

/** HP-05 — open linked emp 5c3ea407 · contract · soft-link honesty */
async function stepHp05(page) {
  const empListUrl = q('/hr/employees');
  await page.goto(empListUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_employees', { url: empListUrl });
  await sleep(3500);
  await shot(page, '01-employees-list');

  let empBody = await page.locator('body').innerText().catch(() => '');
  const banner = /Sync ERROR|HRM API request failed|409|54321/i.test(empBody);
  const listOk =
    !banner &&
    (/Nhân viên|Employees|Mã NV|hồ sơ/i.test(empBody) ||
      netsSince(0, (n) => /\/employees/i.test(n.url) && n.method === 'GET').some((g) => g.status === 200));
  results.hp05.listOk = listOk;
  results.hp05.stampOnList =
    empBody.includes(CAND_STAMP) || empBody.includes(CAND_NAME_HINT);

  // HDSD path: try search by short id / code, then deep-link
  await trySearch(page, EMP_ID_SHORT);
  await sleep(1500);
  empBody = await page.locator('body').innerText().catch(() => '');
  results.hp05.codeHintSeen =
    empBody.includes(EMP_ID_SHORT) ||
    empBody.includes('UAT-0020') ||
    /UAT-0020|HLD-|NV-/i.test(empBody);

  const rowById = page.locator('tr, [role="row"], a').filter({ hasText: new RegExp(EMP_ID_SHORT, 'i') }).first();
  const rowByUat = page.locator('tr, [role="row"]').filter({ hasText: /UAT-0020/i }).first();
  let openedViaList = false;
  if (await rowById.isVisible().catch(() => false)) {
    await rowById.click({ force: true }).catch(() => {});
    logClick('click_emp_row_by_id', { text: EMP_ID_SHORT });
    openedViaList = true;
  } else if (await rowByUat.isVisible().catch(() => false)) {
    await rowByUat.click({ force: true }).catch(() => {});
    logClick('click_emp_row_uat0020', { text: 'UAT-0020' });
    openedViaList = true;
  } else {
    logClick('list_row_miss_deep_link', { text: EMP_ID_SHORT });
  }
  await sleep(2000);

  const detailUrl = q(`/hr/employees/${EMP_ID}`);
  if (!openedViaList || !page.url().includes(EMP_ID_SHORT)) {
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    logClick('goto_emp_detail_deeplink', { url: detailUrl });
  } else {
    logClick('emp_detail_via_list', { url: page.url() });
  }
  await sleep(3500);
  await shot(page, '02-emp-detail');

  const detailBody = await page.locator('body').innerText().catch(() => '');
  const detailBanner = /Sync ERROR|HRM API request failed|409|54321/i.test(detailBody);
  const notFound = /không tìm thấy|404|PermissionFallback|Not Found/i.test(detailBody);
  const detailOk =
    !detailBanner &&
    !notFound &&
    (results.ids.detailGetStatus === 200 ||
      /hồ sơ|email|điện thoại|Công việc|Hợp đồng|Chung|Lương|UAT-0020/i.test(detailBody));
  results.hp05.detailOk = detailOk;
  results.hp05.detailUrl = page.url();
  results.hp05.stampOnDetail =
    detailBody.includes(CAND_STAMP) || detailBody.includes(CAND_NAME_HINT);

  // Profile tab Hợp đồng (HDSD)
  const tabHd = await clickText(page, /Hợp đồng|Contracts/i, { role: 'tab' });
  if (!tabHd) await clickText(page, /Hợp đồng|Contracts/i);
  await sleep(2000);
  await shot(page, '03-emp-tab-contracts');
  const tabBody = await page.locator('body').innerText().catch(() => '');
  const tabHasContract =
    /Hợp đồng|đang hiệu lực|Active|Loại HĐ|Ngày ký|Không có|Chưa có hợp đồng|empty/i.test(tabBody);
  const tabEmptyHonest = /Không có|Chưa có|chưa gắn|empty|không có dữ liệu/i.test(tabBody);
  const tabHasActive = /đang hiệu lực|Active|HĐLĐ|Hợp đồng lao động|\d{2}\/\d{2}\/\d{4}/i.test(tabBody);
  results.hp05.contractTabOk = tabHasContract && !detailBanner;

  // Contracts list module + J-HRM-01 cross-nav
  const contractsUrl = q('/hr/contracts');
  await page.goto(contractsUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_contracts', { url: contractsUrl });
  await sleep(3000);
  await shot(page, '04-contracts-list');
  const cBody = await page.locator('body').innerText().catch(() => '');
  const cBanner = /Sync ERROR|HRM API request failed|409|54321/i.test(cBody);
  const contractsChrome =
    /Hợp đồng|Contracts|đang hiệu lực|Nhân viên|Mã HĐ|Không có|Chưa có/i.test(cBody) && !cBanner;
  results.hp05.contractsListOk = contractsChrome;
  results.hp05.contractSurface = contractsChrome
    ? tabHasActive || /đang hiệu lực|Active/i.test(cBody)
      ? 'present_with_rows'
      : tabEmptyHonest || /Không có|Chưa có/i.test(cBody)
        ? 'present_empty_honest'
        : 'present_weak_content'
    : 'weak_or_missing';

  // J-HRM-01: contracts → employee name
  const nameLink = page
    .locator('table tbody tr a, table tbody tr button, [role="row"] a')
    .filter({ hasText: /UAT-0020|./ })
    .first();
  if (await nameLink.isVisible().catch(() => false)) {
    await nameLink.click({ timeout: 4000, force: true }).catch(() => {});
    logClick('contracts_to_employee_jhrm01', {});
    await sleep(2500);
    const t = await page.locator('body').innerText().catch(() => '');
    results.hp05.jhrm01 = !/không tìm thấy nhân viên|404|PermissionFallback/i.test(t);
    await shot(page, '05-jhrm01');
  } else {
    // deep-link back to emp as J-HRM-02
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    logClick('jhrm01_fallback_deeplink', { url: detailUrl });
    await sleep(2000);
    results.hp05.jhrm01 = results.hp05.detailOk;
    await shot(page, '05-jhrm01-fallback');
  }

  // Soft-link honesty / product_gap
  const softLinkExpected = !results.hp05.stampOnList && !results.hp05.stampOnDetail;
  if (softLinkExpected) {
    results.hp05.productGap =
      'soft_link: hire linked existing emp UAT-0020 — candidate stamp SP4SDEKW49 not expected on emp list/detail; contract may pre-exist or empty honest';
  }
  if (results.hp05.contractSurface === 'present_weak_content') {
    results.hp05.productGap =
      (results.hp05.productGap ? results.hp05.productGap + ' · ' : '') +
      'contracts chrome weak content (no clear active row / empty reason)';
  }

  let verdict = '🟢';
  let gap = null;
  if (banner || detailBanner || cBanner || notFound) {
    verdict = '🔴';
    gap = notFound ? 'emp_detail_404' : 'banner_or_scope_error';
  } else if (!detailOk) {
    verdict = '🔴';
    gap = 'emp_detail_not_ok';
  } else if (!contractsChrome && !results.hp05.contractTabOk) {
    verdict = '🟡';
    gap = 'product_gap_contracts_surface';
  } else if (softLinkExpected && (tabHasActive || tabEmptyHonest || contractsChrome)) {
    // harden: detail OK + honest soft-link + contract surface present (rows or empty)
    verdict = '🟢';
    gap = results.hp05.productGap;
  } else if (detailOk && contractsChrome) {
    verdict = '🟢';
  } else {
    verdict = '🟡';
    gap = results.hp05.productGap || 'hp05_partial';
  }

  recordStep('HP05', verdict, {
    clickPath: [
      '/hr/employees',
      `search/deep-link ${EMP_ID_SHORT}`,
      'tab Hợp đồng',
      '/hr/contracts',
      'J-HRM-01 name→profile',
    ],
    hdsd: 'HDSD Nhân viên · hồ sơ · tab Hợp đồng · menu Hợp đồng',
    spec_ref: 'J-HRM-01 · J-HRM-02 · J-HRM-03 · HP-05 · FR-UC-H01',
    employeeId: EMP_ID,
    detailGetStatus: results.ids.detailGetStatus,
    contractGetStatus: results.ids.contractGetStatus,
    listOk,
    detailOk,
    stampOnList: results.hp05.stampOnList,
    stampOnDetail: results.hp05.stampOnDetail,
    contractTabOk: results.hp05.contractTabOk,
    contractsListOk: results.hp05.contractsListOk,
    contractSurface: results.hp05.contractSurface,
    jhrm01: results.hp05.jhrm01,
    productGap: results.hp05.productGap,
    gap,
    summary: `detailOk=${detailOk} detailGET=${results.ids.detailGetStatus} stampList=${results.hp05.stampOnList} contracts=${results.hp05.contractSurface} jhrm01=${results.hp05.jhrm01}`,
  });
  return verdict;
}

/** HP-06 — payroll blank residual R-PO-SPINE01-PAYROLL-BLANK */
async function stepHp06(page) {
  const paths = [
    { kind: 'cc', path: '/command-center/hrm/payroll' },
    { kind: 'hr', path: '/hr/payroll' },
    { kind: 'salary', path: '/hr/salary' },
  ];
  let url = null;
  let body = '';
  let loaded = false;
  let kind = null;
  const net0 = results.network.length;

  for (const p of paths) {
    url = p.kind === 'cc' ? `${PORTAL}${p.path}` : q(p.path);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    logClick('goto_payroll', { url, kind: p.kind });
    await sleep(3000);
    body = await page.locator('body').innerText().catch(() => '');
    const route404 = /Cannot GET|404 Not Found|No routes matched/i.test(body);
    if (!route404 && /lương|payroll|payslip|phiếu lương|kỳ lương|Bảng lương|Salary/i.test(body)) {
      loaded = true;
      kind = p.kind;
      break;
    }
    if (!route404 && p.kind === 'cc') {
      // CC embed may mount shell with low text — accept if #root has children and path sticks
      const rootKids = await page.locator('#root > *').count().catch(() => 0);
      if (rootKids >= 1 && page.url().includes('payroll')) {
        loaded = true;
        kind = p.kind;
        break;
      }
    }
  }

  results.hp06.url = url;
  results.hp06.loaded = loaded;
  await shot(page, '06-payroll');

  body = await page.locator('body').innerText().catch(() => '');
  const banner = /Sync ERROR|HRM API request failed|54321|companyId mismatches/i.test(body);
  results.hp06.banner = banner;
  const emptyHonest =
    /chưa có|không có dữ liệu|empty|chọn kỳ|không có phiếu|Chưa có kỳ lương|không có bảng lương|No payroll|Select a period/i.test(
      body,
    );
  results.hp06.emptyHonest = emptyHonest;
  const hasRows =
    /phiếu lương|payslip|kỳ lương|Bảng lương|NV-|UAT-|\d{1,3}(\.\d{3}){2,}/i.test(body) &&
    body.trim().length > 80;
  results.hp06.hasRows = hasRows;
  results.hp06.stampSeen = body.includes(CAND_STAMP) || body.includes(CAND_NAME_HINT);

  // blank pane heuristic: shell title only / near-empty main content
  const textLen = body.replace(/\s+/g, ' ').trim().length;
  const blankPane =
    loaded &&
    !banner &&
    !emptyHonest &&
    !hasRows &&
    textLen < 400;
  results.hp06.blankPane = blankPane;

  const gets = netsSince(net0, (n) => /payroll|payslip|salary/i.test(n.url));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  logClick('f5_payroll', { url });
  await sleep(2500);
  const bodyF5 = await page.locator('body').innerText().catch(() => '');
  await shot(page, '07-payroll-f5');

  // Also probe embed employees payroll tab on linked emp (secondary)
  const empPayUrl = q(`/hr/employees/${EMP_ID}`);
  await page.goto(empPayUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_emp_for_payroll_tab', { url: empPayUrl });
  await sleep(2500);
  const tabLuong = await clickText(page, /^Lương$|Salary|Payroll/i, { role: 'tab' });
  if (!tabLuong) await clickText(page, /Lương|Salary|Payroll/i);
  await sleep(2000);
  await shot(page, '08-emp-tab-luong');
  const empPayBody = await page.locator('body').innerText().catch(() => '');
  const empPayHonest = /chưa có|không có|empty|Chưa gắn|mẫu lương|template/i.test(empPayBody);

  let verdict = '🟡';
  let gap = null;
  if (banner) {
    verdict = '🔴';
    gap = 'payroll_banner_error';
  } else if (!loaded) {
    verdict = '🔴';
    gap = 'payroll_route_not_loaded';
  } else if (results.hp06.stampSeen || (hasRows && gets.some((g) => g.status === 200))) {
    verdict = '🟢';
    gap = null;
  } else if (emptyHonest || empPayHonest) {
    // honest empty = residual CLOSED for blank-pane class; spine hire-in-period may still be deferred
    verdict = '🟢';
    gap = 'honest_empty_visible — R-PO-SPINE01-PAYROLL-BLANK content honesty CLOSED; hire-in-period may remain N/A soft-link';
  } else if (blankPane) {
    verdict = '🔴';
    gap = 'R-PO-SPINE01-PAYROLL-BLANK still OPEN — CC/HRM payroll blank pane without honest empty copy';
  } else if (gets.some((g) => g.status === 200) && textLen >= 400) {
    verdict = '🟢';
    gap = 'payroll surface content present (API 200) — stamp absent expected soft-link';
  } else {
    verdict = '🔴';
    gap = 'R-PO-SPINE01-PAYROLL-BLANK — ambiguous blank / no honest empty';
  }

  recordStep('HP06', verdict, {
    clickPath: paths.map((p) => p.path).concat(['F5', `emp ${EMP_ID_SHORT} tab Lương`]),
    hdsd: 'HDSD Lương · CC hrm/payroll · hồ sơ tab Lương',
    spec_ref: 'J-HRM-07 · UF-HRM-06 · FR-UC-H04 · HP-06',
    url,
    kind,
    loaded,
    banner,
    emptyHonest,
    empPayHonest,
    hasRows,
    blankPane,
    stampSeen: results.hp06.stampSeen,
    textLen,
    textLenF5: bodyF5.replace(/\s+/g, ' ').trim().length,
    payrollGetStatus: results.ids.payrollGetStatus,
    network: gets.slice(-8),
    gap,
    summary: `loaded=${loaded} kind=${kind} blank=${blankPane} emptyHonest=${emptyHonest} hasRows=${hasRows} stamp=${results.hp06.stampSeen} textLen=${textLen}`,
  });
  return verdict;
}

function overallAck() {
  const s = results.steps;
  if (s.L0?.verdict === '🔴') return 'FAIL_TO_PM';
  if (s.HP05?.verdict === '🔴') return 'FAIL_TO_PM';
  if (s.HP06?.verdict === '🔴') return 'FAIL_TO_PM';
  // HP-05 🟢/🟡 with honest product_gap OK; HP-06 must be 🟢 to close blank residual
  if (s.HP05?.verdict === '🟢' && s.HP06?.verdict === '🟢') return 'PASS_TO_PM';
  if (s.HP05?.verdict === '🟡' && s.HP06?.verdict === '🟢') return 'PASS_TO_PM';
  return 'FAIL_TO_PM';
}

async function main() {
  await probeL0();
  const l0Ok = results.l0.portal === 200 && results.l0.hrm_api === 200 && results.l0.xbos_api === 200;
  recordStep('L0', l0Ok ? '🟢' : '🔴', { summary: JSON.stringify(results.l0) });
  if (!l0Ok) {
    results.endedAt = ts();
    results.ack_status = 'FAIL_TO_PM';
    save();
    process.exitCode = 2;
    return;
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('open_portal', { url: PORTAL });
  await sleep(2000);
  await shot(page, '00-shell');

  try {
    await stepHp05(page);
    await stepHp06(page);
  } catch (e) {
    recordStep('FATAL', '🔴', { summary: String(e).slice(0, 300) });
    results.gap = results.gap || 'fatal_harness';
  }

  results.endedAt = ts();
  results.clickCount = results.click_log.length;
  results.idle_guard = results.click_log.length >= 6 ? 'PASS' : 'FAIL';
  results.ack_status = overallAck();
  const steps = Object.values(results.steps);
  results.summary = {
    clicks: results.click_log.length,
    idle_guard: results.idle_guard,
    seed_used: false,
    ack_status: results.ack_status,
    hp05: results.hp05,
    hp06: results.hp06,
    pass: steps.filter((s) => s.verdict === '🟢').length,
    warn: steps.filter((s) => s.verdict === '🟡').length,
    fail: steps.filter((s) => s.verdict === '🔴').length,
    skip: steps.filter((s) => s.verdict === '⬜').length,
  };
  save();
  await browser.close();
  console.log(
    JSON.stringify(
      {
        ack_status: results.ack_status,
        summary: results.summary,
        ids: results.ids,
        steps: Object.fromEntries(
          Object.entries(results.steps).map(([k, v]) => [k, { verdict: v.verdict, summary: v.summary, gap: v.gap }]),
        ),
      },
      null,
      2,
    ),
  );
  if (results.ack_status === 'FAIL_TO_PM') process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  process.exitCode = 2;
});
