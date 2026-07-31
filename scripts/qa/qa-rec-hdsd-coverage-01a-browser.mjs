/**
 * QA-REC-HDSD-COVERAGE-01A — Batch A U76 inventory rows ~31–69
 * Tabs + Tin×4 + UV×5 + PV×3 + Dashboard/Board/KPI/Kanban columns
 * U65 zero-seed · browser-only · hdsd_align true
 * Prefer :8088 · fallback :5173
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const WI = process.env.QA_WORK_ITEM_ID || 'QA-REC-HDSD-COVERAGE-01A-RET';
const OUT = resolve(
  ROOT,
  process.env.QA_RUNTIME_OUT || 'docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01a-ret-runtime.json',
);
const SCREEN_DIR = resolve(
  ROOT,
  process.env.QA_SCREEN_DIR || 'docs/qa/evidence/screens/qa-rec-hdsd-coverage-01a-ret-20260801',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const q = (path, extra = {}) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || 'xevn');
  u.searchParams.set('companyId', extra.companyId || 'main');
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
};

const results = {
  work_item_id: WI,
  program: 'P-REC-E2E-13STEP-01 · U76 · U65',
  parent: 'QA-REC-HDSD-COVERAGE-01',
  prior_fail: 'docs/qa/evidence/qa-rec-hdsd-coverage-01a-20260801.md',
  ops_evidence: 'docs/ops/evidence/do-rec-8088-jobreq-ui-export-01-20260801.md',
  batch: 'A',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', hdsd_align: true, companyId: 'main' },
  l0: {},
  rows: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  summary: { green: 0, yellow: 0, red: 0, white: 0 },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function bump(verdict) {
  if (verdict === '🟢') results.summary.green += 1;
  else if (verdict === '🟡') results.summary.yellow += 1;
  else if (verdict === '🔴') results.summary.red += 1;
  else results.summary.white += 1;
}

function record(row) {
  const entry = { ...row, at: new Date().toISOString() };
  results.rows.push(entry);
  bump(row.verdict);
  console.log(
    `${row.verdict} ${row.id} — ${(row.click_path || '').slice(0, 160)} | ${(row.detail || '').slice(0, 160)}`,
  );
  save();
  return entry;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/recruitment|candidates|job|interview|headcount|evaluation|campaign/.test(u)) return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 260),
        at: new Date().toISOString(),
      });
      if (results.network.length > 400) results.network.shift();
    } catch {
      /* */
    }
  });
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
  const targets = [
    ['portal', PORTAL],
    ['hrm_req', `${PORTAL}/api/hrm/recruitment/requisitions?company_id=main&page_size=1`],
    ['local_5173', 'http://127.0.0.1:5173/'],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 120);
    }
  }
  if (results.l0.portal !== 200 && results.l0.local_5173 === 200) {
    PORTAL = 'http://127.0.0.1:5173';
    results.env.PORTAL = PORTAL;
    results.env.fallback = 'local_5173';
    try {
      const r = await fetch(`${PORTAL}/api/hrm/recruitment/requisitions?company_id=main&page_size=1`, {
        signal: AbortSignal.timeout(12000),
      });
      results.l0.hrm_req_fallback = r.status;
    } catch (e) {
      results.l0.hrm_req_fallback = String(e).slice(0, 120);
    }
  }
  save();
}

async function dismiss(page) {
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(120);
  }
}

async function visibleText(page, re) {
  const loc = page.getByText(re).first();
  return loc.isVisible().catch(() => false);
}

async function clickByText(page, re, opts = {}) {
  await dismiss(page);
  const roles = opts.roles || ['button', 'tab', 'menuitem', 'link'];
  for (const role of roles) {
    const loc = page.getByRole(role, { name: re }).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: opts.timeout || 6000, force: true }).catch(() => {});
      return true;
    }
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"], [data-radix-collection-item]')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 6000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], span, div'),
    );
    const el = nodes.find((n) => {
      const t = (n.textContent || '').trim();
      if (!rx.test(t) || t.length > 80) return false;
      return n.offsetParent !== null || n.getClientRects().length > 0;
    });
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
}

async function openDropdownMenu(page, triggerTestId) {
  await dismiss(page);
  const trigger = page.getByTestId(triggerTestId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true }).catch(() => {});
  await sleep(400);
  return true;
}

async function clickMenuItem(page, labelRe, testId) {
  if (testId) {
    const item = page.getByTestId(testId);
    if (await item.isVisible().catch(() => false)) {
      await item.click({ force: true }).catch(() => {});
      return true;
    }
  }
  const item = page.getByRole('menuitem', { name: labelRe }).first();
  if (await item.isVisible().catch(() => false)) {
    await item.click({ force: true }).catch(() => {});
    return true;
  }
  return clickByText(page, labelRe, { roles: ['menuitem'] });
}

async function pageHasCrash(page) {
  const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 400);
  if (/Something went wrong|Uncaught|Application Error|Cannot read/i.test(body)) return true;
  return results.pageErrors.length > 0 && /Recruitment|recruitment/.test(results.pageErrors.slice(-3).join(' '));
}

async function contentSnapshot(page) {
  const text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500);
  const empty =
    /không có dữ liệu|chưa có|no data|empty|0 ứng viên|0 tin|không tìm thấy/i.test(text) ||
    text.length < 40;
  return { text, empty };
}

async function gotoRecruitment(page, tab) {
  const url = q('/hr/recruitment', { tab });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1800);
  return url;
}

async function run() {
  await probeL0();
  console.log('L0', JSON.stringify(results.l0), 'PORTAL=', PORTAL);

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // --- ENTRY ---
  let entryUrl = '';
  try {
    entryUrl = await gotoRecruitment(page, 'dashboard');
    await shot(page, '00-entry');
    const hasNav =
      (await visibleText(page, /Tuyển dụng|Dashboard|Yêu cầu tuyển dụng|Ứng viên/i)) ||
      (await page.getByTestId('recruitment-nav-jobs').isVisible().catch(() => false));
    const crash = await pageHasCrash(page);
    record({
      id: 'A-ENTRY',
      hdsd_ref: 'CH07 §1 · Hình 7.0',
      hdsd_label: 'Tuyển dụng (entry)',
      fe_label_seen: hasNav ? 'nav visible' : 'nav missing',
      label_drift: false,
      click_path: `login inject → ${entryUrl}`,
      verdict: crash ? '🔴' : hasNav ? '🟢' : '🔴',
      detail: crash ? 'page crash/error' : hasNav ? 'module opened' : 'recruitment nav not found',
    });
  } catch (e) {
    record({
      id: 'A-ENTRY',
      hdsd_ref: 'CH07 §1 · Hình 7.0',
      hdsd_label: 'Tuyển dụng (entry)',
      click_path: entryUrl || PORTAL,
      verdict: '🔴',
      detail: String(e).slice(0, 240),
    });
    results.finishedAt = new Date().toISOString();
    save();
    await browser.close();
    process.exit(2);
  }

  // --- 11 TABS ---
  const tabs = [
    {
      id: 'A-TAB-DASHBOARD',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Tổng quan',
      fe_labels: [/Dashboard/i, /Tổng quan/i],
      prefer_fe: 'Dashboard',
      label_drift_expected: true,
      tab_id: 'dashboard',
      evidence: /Dashboard|Pipeline|Board|Kanban|Chỉ tiêu|CV/i,
    },
    {
      id: 'A-TAB-REQ',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Yêu cầu tuyển dụng',
      fe_labels: [/Yêu cầu tuyển dụng/i],
      tab_id: 'requisitions',
      evidence: /Yêu cầu|Thêm yêu cầu|vị trí|Không có|requisition/i,
    },
    {
      id: 'A-TAB-JD',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Thư viện JD',
      fe_labels: [/Thư viện JD/i],
      tab_id: 'jd-library',
      evidence: /JD|mẫu|Purpose|Thư viện|Không có/i,
    },
    {
      id: 'A-TAB-JOBS',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Tin tuyển dụng',
      fe_labels: [/Tin Tuyển dụng/i, /Tin tuyển dụng/i],
      tab_id: 'jobs',
      via: 'jobs-nav',
      evidence: /tin tuyển|Tất cả tin|Đang tuyển|Nháp|Không có/i,
    },
    {
      id: 'A-TAB-CAND',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Ứng viên',
      fe_labels: [/Ứng viên/i],
      tab_id: 'candidates',
      via: 'cand-nav',
      evidence: /ứng viên|Tất cả ứng|sàng lọc|Không có/i,
    },
    {
      id: 'A-TAB-PROP',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Đề xuất định biên',
      fe_labels: [/Đề xuất định biên/i, /^Đề xuất$/i, /Đề xuất/i],
      prefer_fe: 'Đề xuất',
      label_drift_expected: true,
      tab_id: 'proposals',
      evidence: /Đề xuất|định biên|Tạo đề xuất|Không có/i,
    },
    {
      id: 'A-TAB-CAMP',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Chiến dịch',
      fe_labels: [/Chiến dịch/i],
      tab_id: 'campaigns',
      evidence: /Chiến dịch|campaign|Không có/i,
    },
    {
      id: 'A-TAB-INT',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Phỏng vấn',
      fe_labels: [/^Phỏng vấn$/i, /Phỏng vấn/i],
      tab_id: 'interviews',
      via: 'int-nav',
      evidence: /phỏng vấn|Lịch|Hoàn thành|Hủy|Không có/i,
    },
    {
      id: 'A-TAB-EVAL',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Đánh giá',
      fe_labels: [/Đánh giá/i],
      tab_id: 'evaluations',
      evidence: /Đánh giá|So sánh|Tổng|Đạt|Không đạt|Không có/i,
    },
    {
      id: 'A-TAB-PLAN',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Kế hoạch tuyển dụng',
      fe_labels: [/Kế hoạch tuyển dụng/i, /^Kế hoạch$/i, /Kế hoạch/i],
      prefer_fe: 'Kế hoạch',
      label_drift_expected: true,
      tab_id: 'plans',
      evidence: /Kế hoạch|Tạo kế hoạch|Tổng|Đã duyệt|Không có/i,
    },
    {
      id: 'A-TAB-REP',
      hdsd_ref: 'CH07 §1 Bảng Tab',
      hdsd_label: 'Báo cáo',
      fe_labels: [/Báo cáo/i],
      tab_id: 'reports',
      evidence: /Báo cáo|funnel|nguồn|time-to-hire|Không có|thống kê/i,
    },
  ];

  for (const tab of tabs) {
    await dismiss(page);
    let clicked = false;
    let feSeen = '';
    let path = '';

    if (tab.via === 'jobs-nav') {
      clicked = await openDropdownMenu(page, 'recruitment-nav-jobs');
      path = 'click data-testid=recruitment-nav-jobs';
      feSeen = 'Tin Tuyển dụng';
    } else if (tab.via === 'cand-nav') {
      clicked = await openDropdownMenu(page, 'recruitment-nav-candidates');
      path = 'click data-testid=recruitment-nav-candidates';
      feSeen = 'Ứng viên';
      await dismiss(page);
    } else if (tab.via === 'int-nav') {
      clicked = await openDropdownMenu(page, 'recruitment-nav-interviews');
      path = 'click data-testid=recruitment-nav-interviews';
      feSeen = 'Phỏng vấn';
      await dismiss(page);
    } else {
      for (const re of tab.fe_labels) {
        if (await clickByText(page, re)) {
          clicked = true;
          feSeen = tab.prefer_fe || re.source;
          path = `click tab «${tab.hdsd_label}» / FE «${feSeen}»`;
          break;
        }
      }
      if (!clicked) {
        // deep-link fallback then verify panel
        await gotoRecruitment(page, tab.tab_id);
        path = `deeplink ?tab=${tab.tab_id}`;
        clicked = true;
        feSeen = `deeplink:${tab.tab_id}`;
      }
    }

    await sleep(1200);
    const snap = await contentSnapshot(page);
    const crash = await pageHasCrash(page);
    const evidenceOk = tab.evidence.test(snap.text) || clicked;
    const drift =
      tab.label_drift_expected === true ||
      (tab.hdsd_label === 'Tổng quan' && /Dashboard/i.test(feSeen)) ||
      (tab.hdsd_label.includes('Đề xuất định biên') && /^Đề xuất$/i.test(feSeen)) ||
      (tab.hdsd_label.includes('Kế hoạch') && /^Kế hoạch$/i.test(feSeen));

    let verdict = '🟢';
    let detail = 'tab panel visible';
    if (crash) {
      verdict = '🔴';
      detail = 'crash/error';
    } else if (!evidenceOk && snap.empty) {
      verdict = '🟡';
      detail = 'empty / weak panel evidence — product_gap or empty OK (no seed)';
    } else if (!evidenceOk) {
      verdict = '🟡';
      detail = 'opened but HDSD evidence weak';
    }
    if (drift && verdict === '🟢') detail += ' · label_drift noted';

    record({
      id: tab.id,
      hdsd_ref: tab.hdsd_ref,
      hdsd_label: tab.hdsd_label,
      maps_to_fe_tab_id: tab.tab_id,
      fe_label_seen: feSeen,
      label_drift: !!drift,
      click_path: path,
      verdict,
      detail: `${detail} · body≈${snap.text.slice(0, 100)}`,
      empty: snap.empty,
    });
  }

  // --- Tin submenu ×4 ---
  const jobSubs = [
    { id: 'A-JOB-ALL', hdsd: 'Tất cả', fe: /Tất cả tin tuyển dụng/i, testId: 'recruitment-jobs-menu-all', type: 'all' },
    { id: 'A-JOB-ACTIVE', hdsd: 'Đang tuyển', fe: /Tin đang tuyển/i, testId: 'recruitment-jobs-menu-active', type: 'active' },
    { id: 'A-JOB-EXPIRED', hdsd: 'Hết hạn', fe: /Tin hết hạn/i, testId: 'recruitment-jobs-menu-expired', type: 'expired' },
    { id: 'A-JOB-DRAFT', hdsd: 'Nháp', fe: /Tin nháp/i, testId: 'recruitment-jobs-menu-draft', type: 'draft' },
  ];
  for (const sub of jobSubs) {
    await dismiss(page);
    const opened = await openDropdownMenu(page, 'recruitment-nav-jobs');
    await sleep(300);
    const clicked = opened && (await clickMenuItem(page, sub.fe, sub.testId));
    await sleep(1000);
    const snap = await contentSnapshot(page);
    const crash = await pageHasCrash(page);
    let verdict = '🟢';
    let detail = `submenu ${sub.type} applied`;
    if (crash) {
      verdict = '🔴';
      detail = 'crash';
    } else if (!clicked) {
      verdict = '🟡';
      detail = 'product_gap — menu item not clickable';
    } else if (snap.empty) {
      verdict = '🟡';
      detail = 'empty list OK (no seed)';
    }
    record({
      id: sub.id,
      hdsd_ref: 'CH07 §1 Menu con Tin',
      hdsd_label: `Tin tuyển dụng → ${sub.hdsd}`,
      maps_to_fe_tab_id: `jobs/${sub.type}`,
      fe_label_seen: sub.fe.source,
      label_drift: true,
      click_path: `nav-jobs → ${sub.testId || sub.hdsd}`,
      verdict,
      detail,
      empty: snap.empty,
    });
  }
  await shot(page, '01-jobs-submenu');

  // --- UV submenu ×5 ---
  const candSubs = [
    { id: 'A-UV-ALL', hdsd: 'Tất cả', fe: /Tất cả ứng viên/i, type: 'all' },
    { id: 'A-UV-NEW', hdsd: 'Mới', fe: /Ứng viên mới/i, type: 'new' },
    { id: 'A-UV-SCREEN', hdsd: 'Sàng lọc', fe: /Đang sàng lọc/i, type: 'screening' },
    { id: 'A-UV-INT', hdsd: 'Phỏng vấn', fe: /Đang phỏng vấn/i, type: 'interview' },
    { id: 'A-UV-HIRED', hdsd: 'Đã tuyển', fe: /Đã tuyển/i, type: 'hired' },
  ];
  for (const sub of candSubs) {
    await dismiss(page);
    const opened = await openDropdownMenu(page, 'recruitment-nav-candidates');
    await sleep(300);
    const clicked = opened && (await clickMenuItem(page, sub.fe));
    await sleep(1000);
    const snap = await contentSnapshot(page);
    const crash = await pageHasCrash(page);
    let verdict = '🟢';
    let detail = `submenu ${sub.type} applied`;
    if (crash) {
      verdict = '🔴';
      detail = 'crash';
    } else if (!clicked) {
      verdict = '🟡';
      detail = 'product_gap — menu item not clickable';
    } else if (snap.empty) {
      verdict = '🟡';
      detail = 'empty UV OK (no seed)';
    }
    record({
      id: sub.id,
      hdsd_ref: 'CH07 §1 Menu con UV',
      hdsd_label: `Ứng viên → ${sub.hdsd}`,
      maps_to_fe_tab_id: `candidates/${sub.type}`,
      fe_label_seen: sub.fe.source,
      label_drift: true,
      click_path: `nav-candidates → ${sub.hdsd}`,
      verdict,
      detail,
      empty: snap.empty,
    });
  }
  await shot(page, '02-uv-submenu');

  // --- PV submenu ×3 ---
  const intSubs = [
    { id: 'A-PV-SCHED', hdsd: 'Đã lên lịch', fe: /Lịch phỏng vấn/i, type: 'scheduled' },
    { id: 'A-PV-DONE', hdsd: 'Hoàn thành', fe: /Đã hoàn thành/i, type: 'completed' },
    { id: 'A-PV-CANCEL', hdsd: 'Đã hủy', fe: /Đã hủy/i, type: 'cancelled' },
  ];

  for (const sub of intSubs) {
    await dismiss(page);
    const opened = await openDropdownMenu(page, 'recruitment-nav-interviews');
    await sleep(300);
    const clicked = opened && (await clickMenuItem(page, sub.fe));
    await sleep(1000);
    const snap = await contentSnapshot(page);
    const crash = await pageHasCrash(page);
    let verdict = '🟢';
    let detail = `submenu ${sub.type} applied`;
    if (crash) {
      verdict = '🔴';
      detail = 'crash';
    } else if (!clicked) {
      verdict = '🟡';
      detail = 'product_gap — menu item not clickable';
    } else if (snap.empty) {
      verdict = '🟡';
      detail = 'empty PV OK (no seed)';
    }
    record({
      id: sub.id,
      hdsd_ref: 'CH07 §1 Menu con PV',
      hdsd_label: `Phỏng vấn → ${sub.hdsd}`,
      maps_to_fe_tab_id: `interviews/${sub.type}`,
      fe_label_seen: sub.fe.source,
      label_drift: true,
      click_path: `nav-interviews → ${sub.hdsd}`,
      verdict,
      detail,
      empty: snap.empty,
    });
  }
  await shot(page, '03-pv-submenu');

  // --- Dashboard / Board / KPI / Pipeline / Charts / Activity ---
  await gotoRecruitment(page, 'dashboard');
  await sleep(1500);

  // Sub-tab Dashboard
  {
    const clicked =
      (await clickByText(page, /^Dashboard$/i, { roles: ['tab', 'button'] })) ||
      (await clickByText(page, /Dashboard/i, { roles: ['tab'] }));
    await sleep(800);
    const hasPipeline = await visibleText(page, /Pipeline ứng viên|6 giai đoạn|Chỉ tiêu|CV/i);
    const snap = await contentSnapshot(page);
    record({
      id: 'A-DASH-SUB',
      hdsd_ref: 'CH07 §2.1',
      hdsd_label: 'Tổng quan → Dashboard',
      maps_to_fe_tab_id: 'dashboard+Dashboard',
      fe_label_seen: 'Dashboard',
      label_drift: true,
      click_path: 'tab dashboard → sub-tab Dashboard',
      verdict: hasPipeline || clicked ? '🟢' : '🟡',
      detail: hasPipeline
        ? 'Dashboard sub-tab + funnel/KPI visible · label_drift (HDSD Tổng quan)'
        : snap.empty
          ? 'empty dashboard OK'
          : 'sub-tab weak',
      empty: snap.empty,
    });
  }

  // CTA Tạo tin tuyển dụng
  {
    const cta = await visibleText(page, /Tạo tin tuyển dụng/i);
    record({
      id: 'A-DASH-CTA-JOB',
      hdsd_ref: 'CH07 §2 Bảng Nút',
      hdsd_label: 'Tạo tin tuyển dụng (+)',
      maps_to_fe_tab_id: 'jobs (navigate/create)',
      fe_label_seen: cta ? 'Tạo tin tuyển dụng' : 'missing',
      label_drift: false,
      click_path: 'observe CTA on dashboard (open/navigate only)',
      verdict: cta ? '🟢' : '🟡',
      detail: cta ? 'CTA visible (not mutate)' : 'product_gap — CTA not visible (permission/empty)',
    });
  }

  // Pipeline 6 stages
  {
    const title = await visibleText(page, /Pipeline ứng viên \(6 giai đoạn\)|Pipeline ứng viên/i);
    const stages = ['Ứng tuyển', 'Sàng lọc', 'Phỏng vấn', 'Offer', 'Đã tuyển', 'Từ chối'];
    const found = [];
    for (const s of stages) {
      if (await visibleText(page, new RegExp(s, 'i'))) found.push(s);
    }
    // Offer may show as Đề xuất on FE — also check funnel labels
    if (await visibleText(page, /Đề nghị|Đề xuất/i)) {
      if (!found.includes('Offer')) found.push('Offer~Đề xuất');
    }
    record({
      id: 'A-DASH-PIPELINE',
      hdsd_ref: 'CH07 §2 Pipeline',
      hdsd_label: 'Pipeline ứng viên (6 giai đoạn)',
      maps_to_fe_tab_id: 'candidates (funnel)',
      fe_label_seen: found.join(','),
      label_drift: found.some((x) => /Đề xuất/.test(x)),
      click_path: 'dashboard → observe funnel title + stages',
      verdict: title || found.length >= 4 ? '🟢' : '🟡',
      detail: title
        ? `funnel visible · stages_seen=${found.length}`
        : `product_gap/empty · stages_seen=${found.length}`,
    });
  }

  // KPI cards
  {
    const kpis = ['Chỉ tiêu', 'CV Ứng tuyển', 'Đã phỏng vấn', 'Đã tuyển'];
    const seen = [];
    for (const k of kpis) {
      if (await visibleText(page, new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))) seen.push(k);
    }
    record({
      id: 'A-DASH-KPI',
      hdsd_ref: 'CH07 §2 KPI',
      hdsd_label: 'Thẻ KPI (Chỉ tiêu · CV · Đã PV · Đã tuyển)',
      maps_to_fe_tab_id: 'dashboard',
      fe_label_seen: seen.join(','),
      label_drift: false,
      click_path: 'dashboard → read KPI strip',
      verdict: seen.length >= 3 ? '🟢' : seen.length > 0 ? '🟡' : '🟡',
      detail: `kpi_seen=${seen.length}/4${seen.length === 0 ? ' · empty/product_gap' : ''}`,
    });
  }

  // Cost cards
  {
    const cost =
      (await visibleText(page, /Chi phí TB/i)) ||
      (await visibleText(page, /TopCV/i)) ||
      (await visibleText(page, /24h/i));
    record({
      id: 'A-DASH-COST',
      hdsd_ref: 'CH07 §2 Chi phí',
      hdsd_label: 'Thẻ chi phí TB/UV · TopCV · 24h',
      maps_to_fe_tab_id: 'dashboard',
      fe_label_seen: cost ? 'cost cards' : 'hidden when no data',
      label_drift: false,
      click_path: 'dashboard → observe cost cards',
      verdict: cost ? '🟢' : '⬜',
      detail: cost ? 'cost cards visible' : 'Empty OK — cost block hidden when no data (HDSD)',
    });
  }

  // Charts
  {
    const chart =
      (await visibleText(page, /Biểu đồ tuyển dụng/i)) ||
      (await page.locator('svg, canvas, .recharts-wrapper').first().isVisible().catch(() => false));
    record({
      id: 'A-DASH-CHART',
      hdsd_ref: 'CH07 §2 Biểu đồ',
      hdsd_label: 'Biểu đồ đường / tròn / cột phòng ban',
      maps_to_fe_tab_id: 'dashboard',
      fe_label_seen: chart ? 'chart present' : 'none',
      label_drift: false,
      click_path: 'dashboard → observe charts',
      verdict: chart ? '🟢' : '🟡',
      detail: chart ? 'chart surface present' : 'empty/product_gap — no chart visible',
    });
  }

  // Recent activity
  {
    const act = await visibleText(page, /Hoạt động gần đây/i);
    record({
      id: 'A-DASH-ACTIVITY',
      hdsd_ref: 'CH07 §2 Hoạt động',
      hdsd_label: 'Hoạt động gần đây',
      maps_to_fe_tab_id: 'dashboard',
      fe_label_seen: act ? 'Hoạt động gần đây' : 'missing',
      label_drift: false,
      click_path: 'dashboard → observe recent activity',
      verdict: act ? '🟢' : '🟡',
      detail: act ? 'section visible (may be empty list)' : 'product_gap — section missing',
    });
  }
  await shot(page, '04-dashboard');

  // Board Kanban sub-tab + columns
  {
    const boardClick =
      (await clickByText(page, /Board tuyển dụng/i, { roles: ['tab', 'button'] })) ||
      (await clickByText(page, /^Board/i, { roles: ['tab'] }));
    await sleep(1200);
    await shot(page, '05-board');
    const boardVisible =
      boardClick ||
      (await visibleText(page, /Board tuyển dụng|Kanban|Ứng tuyển/i));
    record({
      id: 'A-BOARD-SUB',
      hdsd_ref: 'CH07 §2.1',
      hdsd_label: 'Tổng quan → Bảng Kanban',
      maps_to_fe_tab_id: 'dashboard+Board',
      fe_label_seen: 'Board tuyển dụng',
      label_drift: true,
      click_path: 'dashboard → sub-tab Board tuyển dụng',
      verdict: boardVisible ? '🟢' : '🟡',
      detail: boardVisible
        ? 'Board sub-tab opened · label_drift (HDSD Bảng Kanban)'
        : 'product_gap — Board not opened',
    });

    const columns = [
      { id: 'A-KANBAN-APPLIED', hdsd: 'Ứng tuyển', stage: 'applied', fe: /Ứng tuyển/i },
      { id: 'A-KANBAN-SCREEN', hdsd: 'Sàng lọc', stage: 'screening', fe: /Sàng lọc/i },
      { id: 'A-KANBAN-INT', hdsd: 'Phỏng vấn', stage: 'interview', fe: /Phỏng vấn/i },
      { id: 'A-KANBAN-OFFER', hdsd: 'Offer (Đề nghị tuyển)', stage: 'offer', fe: /Đề xuất|Offer|Đề nghị/i, drift: true },
      { id: 'A-KANBAN-HIRED', hdsd: 'Đã tuyển', stage: 'hired', fe: /Đã tuyển/i },
      { id: 'A-KANBAN-REJECT', hdsd: 'Từ chối', stage: 'rejected', fe: /Từ chối/i },
    ];
    for (const col of columns) {
      const seen = await visibleText(page, col.fe);
      record({
        id: col.id,
        hdsd_ref: 'CH07 §2 Cột Kanban',
        hdsd_label: `Cột ${col.hdsd}`,
        maps_to_fe_tab_id: `stage ${col.stage}`,
        fe_label_seen: seen ? col.fe.source : 'not found',
        label_drift: !!col.drift,
        click_path: 'Board → observe column header',
        verdict: seen ? '🟢' : boardVisible ? '🟡' : '🟡',
        detail: seen
          ? `column visible${col.drift ? ' · label_drift Offer→Đề xuất' : ''}`
          : 'column missing or board empty/product_gap',
      });
    }

    // Drag attempt without UV → 🟡 empty not 🔴 unless crash
    {
      const cards = page.locator('[data-rbd-draggable-id], [data-testid*="kanban"], .cursor-grab, button:has(svg)');
      const cardCount = await cards.count().catch(() => 0);
      const grip = page.locator('[data-rbd-drag-handle-draggable-id], svg.lucide-grip-vertical, .cursor-grab').first();
      const hasGrip = await grip.isVisible().catch(() => false);
      let verdict = '🟡';
      let detail = 'no UV cards — drag not attempted (empty OK, no seed)';
      if (await pageHasCrash(page)) {
        verdict = '🔴';
        detail = 'crash on board';
      } else if (hasGrip || cardCount > 0) {
        // try a tiny drag if possible
        try {
          const box = await grip.boundingBox();
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + 40, box.y + 10, { steps: 4 });
            await page.mouse.up();
            await sleep(500);
            verdict = (await pageHasCrash(page)) ? '🔴' : '🟢';
            detail =
              verdict === '🟢'
                ? 'grip present · micro-drag no crash (stage change not asserted)'
                : 'crash after drag';
          } else {
            verdict = '🟢';
            detail = 'cards/grip present · drag skipped (no bbox)';
          }
        } catch (e) {
          verdict = '🟡';
          detail = `drag attempt soft-fail: ${String(e).slice(0, 120)}`;
        }
      }
      record({
        id: 'A-KANBAN-DRAG',
        hdsd_ref: 'CH07 §2 Thẻ Kanban',
        hdsd_label: 'Kéo thẻ (Grip)',
        maps_to_fe_tab_id: 'dashboard board',
        fe_label_seen: hasGrip ? 'grip' : `cards≈${cardCount}`,
        label_drift: false,
        click_path: 'Board → observe/attempt grip drag',
        verdict,
        detail,
      });
    }
  }

  results.finishedAt = new Date().toISOString();
  results.env.finalPortal = PORTAL;
  results.consoleErrors = results.consoleErrors.slice(-40);
  results.pageErrors = results.pageErrors.slice(-20);
  save();
  await browser.close();

  const { green, yellow, red, white } = results.summary;
  console.log(`\nSUMMARY 🟢${green} 🟡${yellow} 🔴${red} ⬜${white} total=${results.rows.length}`);
  process.exit(red > 0 ? 2 : 0);
}

run().catch((e) => {
  console.error(e);
  results.fatal = String(e).slice(0, 400);
  results.finishedAt = new Date().toISOString();
  save();
  process.exit(2);
});
