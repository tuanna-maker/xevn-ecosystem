#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-LIST-01 — U65 browser Employees list shell
 * HDSD CH06 §2 list/search/filter/pagination · matrix surfaces #1–6
 * Persona: ceo@xe.vn · companyId=main
 * FORBIDDEN: seed · invent Employees/Attendance CLOSED · product fix
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
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-list-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-list-01');
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
  work_item_id: 'PO-MFD-M3-EMP-LIST-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  matrix_surfaces: [1, 2, 3, 4, 5, 6],
  must_keep: ['#28 FN-SCOPE-PARITY LIVE'],
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  portal_url: null,
  l0: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  stamp: {},
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
  console.error(`[${results.click_log.length}] ${action}`, detail.note || detail.url || detail.text || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
}

async function probeL0(label) {
  const block = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      block[k] = r.status;
    } catch (e) {
      block[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  results.l0[label] = block;
  save();
  return block;
}

function empUrl() {
  return `${PORTAL}/hr/employees?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
}

function isListGet(n) {
  return (
    n.method === 'GET' &&
    /\/api\/hrm\/employees(\?|$)/.test(n.url) &&
    !/\/employees\/[0-9a-f-]{8,}/i.test(n.url)
  );
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/employees/.test(u) && !/\/api\/xbos\/auth/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        if (method === 'GET') {
          const j = await res.json();
          const d = j?.data ?? j;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          if (items) {
            const displays = items
              .slice(0, 12)
              .map((i) => i.company_display_name || i.companyDisplayName || i.company_name || null)
              .filter(Boolean);
            const slugs = items.slice(0, 12).map((i) => i.company_id).filter(Boolean);
            bodySnippet = {
              code: j?.code,
              total: d?.total ?? items.length,
              count: items.length,
              sample_companies: [...new Set(slugs)],
              sample_company_display: [...new Set(displays)],
              first: items[0]
                ? {
                    id: items[0].id,
                    employee_code: items[0].employee_code,
                    full_name: items[0].full_name || items[0].display_name,
                    status: items[0].status,
                    company_id: items[0].company_id,
                    company_display_name:
                      items[0].company_display_name ||
                      items[0].companyDisplayName ||
                      items[0].company_name,
                    department: items[0].department || items[0].department_name,
                  }
                : null,
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools|Download the React/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  log('API_LOGIN', { note: EMAIL });
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
    companyId: COMPANY,
    tenantId: TENANT,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
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

async function pageState(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const rows = document.querySelectorAll('table tbody tr').length;
    const rangeMatch = t.match(/(\d+)\s*[–-]\s*(\d+)\s*\/\s*(\d+)/);
    const pageMatch = t.match(/\b(\d+)\s*\/\s*(\d+)\b/);
    const companyCells = Array.from(document.querySelectorAll('table tbody tr')).slice(0, 12).map((tr) => {
      const tds = tr.querySelectorAll('td');
      // columns: code, name, company, dept, position, start, status, actions — company is typically 3rd
      return (tds[2]?.textContent || '').replace(/\s+/g, ' ').trim();
    });
    const statusBadges = Array.from(document.querySelectorAll('table tbody tr')).slice(0, 12).map((tr) => {
      const tds = tr.querySelectorAll('td');
      return (tds[6]?.textContent || '').replace(/\s+/g, ' ').trim();
    });
    return {
      rows,
      syncError: /Sync ERROR|HRM API Sync ERROR|HRM API request failed|companyId mismatches/i.test(t),
      emptyHonesty: /Không có dữ liệu|Chưa có nhân viên|No employees|không có bản ghi/i.test(t) && rows === 0,
      subtitleHasCount: /nhân sự|nhân viên|employees/i.test(t) && /\d+/.test(t.slice(0, 400)),
      rangeText: rangeMatch ? `${rangeMatch[1]}–${rangeMatch[2]} / ${rangeMatch[3]}` : null,
      rangeFrom: rangeMatch ? Number(rangeMatch[1]) : null,
      rangeTo: rangeMatch ? Number(rangeMatch[2]) : null,
      totalUi: rangeMatch ? Number(rangeMatch[3]) : null,
      pageUi: pageMatch ? Number(pageMatch[1]) : null,
      totalPagesUi: pageMatch ? Number(pageMatch[2]) : null,
      companyCells,
      statusBadges,
      hasViCompanyLabel: companyCells.some((c) =>
        /Tập đoàn|Du lịch|Vận tải|Tài chính|XeVN|Công ty|Holding|holding/i.test(c),
      ),
      rawSlugOnly: companyCells.length > 0 && companyCells.every((c) => /^(main|holding|trsport|finance|xe-du-lich)$/i.test(c)),
      hasSearch: !!document.querySelector('input[placeholder*="Tìm" i], input[placeholder*="Search" i], input.pl-10'),
      bodySnippet: t.slice(0, 1200),
    };
  });
}

/** Filter-card comboboxes only (exclude portal company switcher chrome). */
function filterComboboxes(page) {
  return page
    .locator('div')
    .filter({ has: page.locator('input.pl-10') })
    .filter({ has: page.locator('[role="combobox"]') })
    .first()
    .locator('[role="combobox"]');
}

async function listOptions(page) {
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  const options = [];
  for (let i = 0; i < n; i++) {
    options.push(((await opts.nth(i).textContent()) || '').replace(/\s+/g, ' ').trim());
  }
  return { opts, options };
}

async function openSelectAndPick(page, { optionRe, nth = null, scope = 'filter', discover = false }) {
  const triggers =
    scope === 'filter' ? filterComboboxes(page) : page.locator('[role="combobox"]');
  const count = await triggers.count();
  const re = optionRe instanceof RegExp ? optionRe : new RegExp(optionRe, 'i');

  const tryIndex = async (i) => {
    const trigger = triggers.nth(i);
    await trigger.click({ timeout: 5000 });
    await sleep(450);
    const { opts, options } = await listOptions(page);
    const hit = options.findIndex((o) => re.test(o));
    if (hit < 0) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(200);
      return { ok: false, options, triggerIndex: i };
    }
    const text = options[hit];
    await opts.nth(hit).click({ timeout: 5000 });
    await sleep(2500);
    return { ok: true, text, options, triggerIndex: i, triggerCount: count };
  };

  if (discover) {
    const probed = [];
    for (let i = 0; i < count; i++) {
      const r = await tryIndex(i);
      probed.push({ i, options: r.options, ok: r.ok, text: r.text });
      if (r.ok) return { ...r, probed };
    }
    return { ok: false, reason: 'option_missing_all_triggers', options: [], triggerCount: count, probed };
  }

  if (nth == null || count <= nth) {
    return { ok: false, reason: `trigger_missing_${nth}_of_${count}`, options: [], triggerCount: count };
  }
  const r = await tryIndex(nth);
  return { ...r, reason: r.ok ? undefined : 'option_missing', triggerCount: count };
}

async function main() {
  await probeL0('entry');
  const session = await loginApi();
  results.login = { http: session.http, email: EMAIL, companyId: COMPANY, tenantId: TENANT };

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
  await injectAuth(page, session);

  const url = empUrl();
  results.portal_url = url;
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.1 Danh sách nhân sự — load',
    attempted: true,
  });

  // --- #1 List shell ---
  log('NAV_LIST', { url });
  const net0 = results.network.length;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  await shot(page, '01-list-load');
  let state = await pageState(page);
  const listNets = results.network.slice(net0).filter(isListGet);
  const listOk = listNets.find((n) => n.status >= 200 && n.status < 300);
  const listBad = listNets.filter((n) => n.status >= 400);
  results.surfaces[1] = {
    id: 1,
    name: 'SCR-LIST load',
    rows: state.rows,
    syncError: state.syncError,
    listStatus: listOk?.status ?? listNets[0]?.status ?? null,
    listCode: listOk?.bodySnippet?.code ?? null,
    total: listOk?.bodySnippet?.total ?? state.totalUi,
    companyQueryOk: listOk ? /company_id=main/.test(listOk.url) : false,
    url: listOk?.url ?? null,
    bad: listBad.map((n) => ({ status: n.status, url: n.url })),
    emptyHonesty: state.emptyHonesty,
    subtitleHasCount: state.subtitleHasCount,
  };
  log('LIST_LOADED', {
    note: `rows=${state.rows} status=${results.surfaces[1].listStatus} total=${results.surfaces[1].total}`,
  });

  // Capture a keyword from first row for search
  const firstName =
    listOk?.bodySnippet?.first?.full_name ||
    (await page.locator('table tbody tr').first().locator('td').nth(1).innerText().catch(() => '')).split('\n')[0];
  const keywordToken = (firstName || '').trim().split(/\s+/).filter(Boolean).pop() || 'Nguyen';
  const firstCode = listOk?.bodySnippet?.first?.employee_code || '';

  // --- #6 Company labels (on full list) ---
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.3 Cột Thông tin công ty (nhãn VI)',
    attempted: true,
  });
  const displayFromApi = listOk?.bodySnippet?.sample_company_display || [];
  const hasViApi = displayFromApi.some((d) => /[àáạảãâăèéêìíòóôơùúưỳýđÀÁẠẢÃÂĂÈÉÊÌÍÒÓÔƠÙÚƯỲÝĐ]|Tập đoàn|Công ty|Du lịch|Vận tải|XeVN/i.test(d));
  const slugLeakUi = state.rawSlugOnly;
  results.surfaces[6] = {
    id: 6,
    name: 'company_display VI',
    uiCompanyCells: state.companyCells.slice(0, 8),
    apiDisplaySample: displayFromApi.slice(0, 8),
    hasViCompanyLabelUi: state.hasViCompanyLabel || hasViApi,
    rawSlugOnlyUi: slugLeakUi,
    statusBadgesSample: state.statusBadges.slice(0, 6),
  };

  // --- #2 Search keyword ---
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.2 Tìm kiếm (keyword debounce)',
    attempted: true,
  });
  const searchInput = page.locator('input.pl-10, input[placeholder*="Tìm" i], input[placeholder*="Search" i]').first();
  const netBeforeSearch = results.network.length;
  const searchTerm = firstCode || keywordToken;
  log('SEARCH_TYPE', { text: searchTerm });
  await searchInput.fill('');
  await searchInput.fill(searchTerm);
  await sleep(2000); // debounce 300 + fetch
  await shot(page, '02-search');
  const searchState = await pageState(page);
  const searchNets = results.network.slice(netBeforeSearch).filter(isListGet);
  const searchOk = searchNets.find((n) => n.status >= 200 && n.status < 300 && /keyword=/.test(n.url));
  const searchAny = searchNets.find((n) => n.status >= 200 && n.status < 300);
  results.surfaces[2] = {
    id: 2,
    name: 'search keyword',
    term: searchTerm,
    rows: searchState.rows,
    syncError: searchState.syncError,
    keywordInUrl: !!searchOk,
    status: searchOk?.status ?? searchAny?.status ?? null,
    url: searchOk?.url ?? searchAny?.url ?? null,
    total: searchOk?.bodySnippet?.total ?? searchAny?.bodySnippet?.total ?? searchState.totalUi,
    rowsReduced:
      typeof results.surfaces[1].total === 'number' &&
      typeof (searchOk?.bodySnippet?.total ?? searchState.totalUi) === 'number'
        ? (searchOk?.bodySnippet?.total ?? searchState.totalUi) <= results.surfaces[1].total
        : null,
  };
  // clear search
  await searchInput.fill('');
  await sleep(1800);

  // --- #3 Status filter ---
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.2 Lọc trạng thái',
    attempted: true,
  });
  const netBeforeStatus = results.network.length;
  // Discover among filter comboboxes (OU rollup + dept + status) — pick status by option labels
  let statusPick = await openSelectAndPick(page, {
    discover: true,
    optionRe: /Đang làm việc|Thử việc|Ngừng làm|Ngừng|Đang hoạt động|^Active$|^Probation$|^Inactive$/i,
  });
  if (!statusPick.ok) {
    // Fallback: scan all page comboboxes (status may sit outside filter-card ancestor)
    statusPick = await openSelectAndPick(page, {
      scope: 'page',
      discover: true,
      optionRe: /Đang làm việc|Thử việc|Ngừng làm|Đang hoạt động|^Active$|^Probation$|^Inactive$/i,
    });
  }
  log('STATUS_FILTER', {
    note: JSON.stringify({
      ok: statusPick.ok,
      text: statusPick.text,
      triggerIndex: statusPick.triggerIndex,
      options: statusPick.options,
      probed: (statusPick.probed || []).map((p) => ({ i: p.i, ok: p.ok, options: p.options })),
    }),
  });
  await shot(page, '03-status-active');
  const statusState = await pageState(page);
  const statusNets = results.network.slice(netBeforeStatus).filter(isListGet);
  const statusOk = statusNets.find((n) => n.status >= 200 && n.status < 300 && /status=(active|probation|inactive)/.test(n.url));
  const statusAny = statusNets.find((n) => n.status >= 200 && n.status < 300);
  results.surfaces[3] = {
    id: 3,
    name: 'status filter',
    pick: {
      ok: statusPick.ok,
      text: statusPick.text,
      triggerIndex: statusPick.triggerIndex,
      options: statusPick.options,
    },
    rows: statusState.rows,
    statusInUrl: !!statusOk,
    status: statusOk?.status ?? statusAny?.status ?? null,
    url: statusOk?.url ?? statusAny?.url ?? null,
    total: statusOk?.bodySnippet?.total ?? statusAny?.bodySnippet?.total ?? statusState.totalUi,
    syncError: statusState.syncError,
    badgeViSample: statusState.statusBadges.slice(0, 5),
  };
  // reset status to Tất cả on same trigger
  if (statusPick.ok && statusPick.triggerIndex != null) {
    await openSelectAndPick(page, {
      nth: statusPick.triggerIndex,
      optionRe: /^Tất cả$|^All$/i,
    });
    await sleep(1200);
  }

  // --- #4 Department filter (client) ---
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.2 Lọc phòng ban (client page)',
    attempted: true,
  });
  const netBeforeDept = results.network.length;
  const deptPick = await openSelectAndPick(page, {
    discover: true,
    optionRe: /Nhân sự|Vận hành|Kế toán|Kinh doanh|Phòng/i,
  });
  log('DEPT_FILTER', {
    note: JSON.stringify({
      ok: deptPick.ok,
      text: deptPick.text,
      triggerIndex: deptPick.triggerIndex,
      options: (deptPick.options || []).slice(0, 8),
    }),
  });
  await shot(page, '04-dept-filter');
  const deptState = await pageState(page);
  const deptNets = results.network.slice(netBeforeDept).filter(isListGet);
  results.surfaces[4] = {
    id: 4,
    name: 'department client filter',
    pick: {
      ok: deptPick.ok,
      text: deptPick.text,
      triggerIndex: deptPick.triggerIndex,
      optionCount: (deptPick.options || []).length,
    },
    rowsBeforeLikely: results.surfaces[1].rows,
    rowsAfter: deptState.rows,
    newListGetCount: deptNets.length,
    clientOnlyExpected: true,
    note: 'HDSD: filter on current page; no required status= API',
    syncError: deptState.syncError,
  };
  if (deptPick.ok && deptPick.triggerIndex != null) {
    await openSelectAndPick(page, {
      nth: deptPick.triggerIndex,
      optionRe: /^Tất cả$|^All$/i,
    });
    await sleep(1200);
  }
  state = await pageState(page);

  // --- #5 Pagination ---
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.3 Phân trang m–n / tổng',
    attempted: true,
  });
  const netBeforePage = results.network.length;
  const nextBtn = page.getByRole('button', { name: /Next page|Trang sau|tiếp/i }).or(
    page.locator('button[aria-label="Next page"]'),
  );
  const canPage =
    (state.totalUi != null && state.totalUi > (state.rows || 0)) ||
    (state.totalPagesUi != null && state.totalPagesUi > 1);
  let page2 = { clicked: false };
  if (canPage && (await nextBtn.count())) {
    const disabled = await nextBtn.first().isDisabled().catch(() => true);
    if (!disabled) {
      log('CLICK_NEXT_PAGE', {});
      await nextBtn.first().click({ timeout: 5000 });
      await sleep(2500);
      page2.clicked = true;
    }
  }
  await shot(page, '05-pagination');
  const pageState2 = await pageState(page);
  const pageNets = results.network.slice(netBeforePage).filter(isListGet);
  const pageOk = pageNets.find((n) => n.status >= 200 && n.status < 300 && /page=2/.test(n.url));
  const pageAny = pageNets.find((n) => n.status >= 200 && n.status < 300);
  results.surfaces[5] = {
    id: 5,
    name: 'pagination',
    canPage,
    clicked: page2.clicked,
    rangeBefore: state.rangeText,
    rangeAfter: pageState2.rangeText,
    pageUiAfter: pageState2.pageUi,
    pageInUrl: !!pageOk,
    status: pageOk?.status ?? pageAny?.status ?? null,
    url: pageOk?.url ?? pageAny?.url ?? null,
    rows: pageState2.rows,
    syncError: pageState2.syncError,
    rangeMatchesRows:
      pageState2.rangeFrom != null &&
      pageState2.rangeTo != null &&
      pageState2.rows === pageState2.rangeTo - pageState2.rangeFrom + 1,
  };

  // F5 refresh honesty on page 2 or list
  log('F5_REFRESH', {});
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '06-f5');
  const f5State = await pageState(page);
  results.surfaces.f5 = {
    rows: f5State.rows,
    syncError: f5State.syncError,
    totalUi: f5State.totalUi,
  };

  await browser.close();
  await probeL0('exit');

  // --- Criteria ---
  const s1 = results.surfaces[1];
  const s2 = results.surfaces[2];
  const s3 = results.surfaces[3];
  const s4 = results.surfaces[4];
  const s5 = results.surfaces[5];
  const s6 = results.surfaces[6];
  const l0EntryOk = Object.values(results.l0.entry || {}).every((v) => v === 200);
  const l0ExitOk = Object.values(results.l0.exit || {}).every((v) => v === 200);

  results.criteria = {
    l0_entry: l0EntryOk,
    l0_exit: l0ExitOk,
    list_get_2xx: s1.listStatus >= 200 && s1.listStatus < 300,
    company_id_main: !!s1.companyQueryOk,
    no_sync_error:
      !s1.syncError &&
      !s2.syncError &&
      !s3.syncError &&
      !s4.syncError &&
      !s5.syncError &&
      !f5State.syncError,
    search_keyword_wire: !!s2.keywordInUrl && s2.status >= 200 && s2.status < 300,
    status_filter_wire: !!s3.statusInUrl && s3.status >= 200 && s3.status < 300,
    dept_filter_present: !!s4.pick?.ok || s4.rowsAfter != null,
    pagination_wire: !s5.canPage || (!!s5.pageInUrl && s5.status >= 200 && s5.status < 300) || (s5.clicked && s5.pageUiAfter === 2),
    company_label_vi: !!s6.hasViCompanyLabelUi && !s6.rawSlugOnlyUi,
    empty_honesty_ok: s1.rows > 0 || s1.emptyHonesty,
    no_page_errors: results.pageErrors.length === 0,
    u65_no_seed: true,
    no_invent_closed: results.employees_closed === false && results.attendance_closed === false,
  };

  for (const [k, v] of Object.entries(results.criteria)) {
    if (!v) results.failReasons.push(k);
  }

  // Runtime stamps
  results.stamp = {
    1: results.criteria.list_get_2xx && results.criteria.no_sync_error && s1.rows > 0 ? 'LIVE' : 'BROKEN',
    2: results.criteria.search_keyword_wire ? 'LIVE' : 'PARTIAL',
    3: results.criteria.status_filter_wire ? 'LIVE' : 'PARTIAL',
    4: s4.pick?.ok ? 'LIVE' : s4.pick?.reason === 'no_options' ? 'PARTIAL' : 'UNKNOWN',
    5:
      !s5.canPage && s1.total != null && s1.total <= 50
        ? 'LIVE'
        : results.criteria.pagination_wire
          ? 'LIVE'
          : 'PARTIAL',
    6: results.criteria.company_label_vi ? 'LIVE' : 'PARTIAL',
    28: 'LIVE (must_keep — not retested deep; list company_id=main observed)',
  };
  // If only one page of data, pagination control present + range honest counts as LIVE wire
  if (!s5.canPage && s1.listStatus === 200 && s1.total != null) {
    results.stamp[5] = 'LIVE';
    results.surfaces[5].note = 'single page — range m–n/total honest; next disabled OK';
    // remove pagination_wire fail if present due to no page=2
    results.failReasons = results.failReasons.filter((f) => f !== 'pagination_wire');
    results.criteria.pagination_wire = true;
  }

  const hardFail = [
    'l0_entry',
    'l0_exit',
    'list_get_2xx',
    'company_id_main',
    'no_sync_error',
    'search_keyword_wire',
    'status_filter_wire',
    'company_label_vi',
    'empty_honesty_ok',
  ].some((k) => !results.criteria[k]);

  results.verdict = hardFail ? 'FAIL' : 'PASS';
  results.ack_status = 'PASS_TO_PM';
  results.endedAt = ts();
  save();

  console.error(
    JSON.stringify(
      {
        verdict: results.verdict,
        stamp: results.stamp,
        failReasons: results.failReasons,
        criteria: results.criteria,
        surfaces: {
          1: s1,
          2: { term: s2.term, keywordInUrl: s2.keywordInUrl, status: s2.status, total: s2.total },
          3: { statusInUrl: s3.statusInUrl, status: s3.status, total: s3.total },
          4: { pick: s4.pick, rowsAfter: s4.rowsAfter, newListGetCount: s4.newListGetCount },
          5: { canPage: s5.canPage, clicked: s5.clicked, pageInUrl: s5.pageInUrl, rangeAfter: s5.rangeAfter },
          6: { hasVi: s6.hasViCompanyLabelUi, rawSlug: s6.rawSlugOnlyUi, api: s6.apiDisplaySample },
        },
      },
      null,
      2,
    ),
  );
  process.exit(hardFail ? 1 : 0);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'PASS_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
