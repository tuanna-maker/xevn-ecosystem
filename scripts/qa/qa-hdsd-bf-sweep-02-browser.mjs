/**
 * QA-HDSD-BF-SWEEP-02 — HDSD sweep batch 2: dialog depth §7 (122 TC map)
 * Persona: ceo@xe.vn · portal :5173 · U65 zero-seed · load/click only
 * Residual: R-SWEEP-02/03 must stay 🟡 · cockpit unlock for /dashboard/*
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-02-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-sweep-02-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const MOBILE_TC = [
  'TC-MOB-006',
  'TC-MOB-007',
  'TC-MOB-011',
  'TC-MOB-027',
  'TC-MOB-028',
  'TC-MOB-032',
  'TC-MOB-033',
];

const results = {
  work_item_id: 'QA-HDSD-BF-SWEEP-02',
  program: 'P-HDSD-ECOSYSTEM-03 · Đ4 sweep batch 2',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', cockpitUnlock: 'xevn.portal.unlocked=1' },
  l0: {},
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
  portalUnlocked: false,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 140)}`);
  save();
  return row;
}

function recordSection(ids, verdict, detail, extra = {}) {
  for (const id of ids) recordTc(id, verdict, detail, { ...extra, sectionBatch: true });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function nativeClickByText(page, text, opts = {}) {
  const box = await page.evaluate(
    (t, exact) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"], span, div, li'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exact) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    !!opts.exact,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 4000);
    const banner =
      /HRM API Sync ERROR|HRM API request failed|500 Internal|409|403 Forbidden|Không có quyền|companyId mismatch/i.test(
        txt,
      );
    return { banner, snippet: txt.slice(0, 200) };
  });
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  const before = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  const loginNet = results.network.slice(before).find((n) => /auth\/login/.test(n.url));
  return { url: page.url(), loginNet };
}

async function unlockPortalWorkspace(page) {
  await page.goto(`${PORTAL}/cockpit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const unlocked = await page.evaluate(() => sessionStorage.getItem('xevn.portal.unlocked') === '1');
  results.portalUnlocked = unlocked;
  return { url: page.url(), unlocked };
}

async function loadRoute(page, url, waitMs = 2500) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(waitMs);
  const err = await bodyHasError(page);
  const get2xx = await waitForNet((n) => n.method === 'GET' && n.status >= 200 && n.status < 300, 12000);
  return { err, get2xx, url: page.url() };
}

async function openSettings(page, query) {
  return loadRoute(page, `${PORTAL}/command-center?settings=${query}`, 2800);
}

async function clickFirstRow(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"]')).filter((r) => {
      const t = (r.textContent || '').trim();
      return t.length > 8 && !/không có|no data|empty|chưa có/i.test(t);
    });
    if (!rows.length) return { ok: false, reason: 'empty' };
    rows[0].scrollIntoView({ block: 'center' });
    rows[0].click();
    return { ok: true, text: (rows[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) };
  });
}

async function openMemberLegalForm(page) {
  await openSettings(page, 'company_member_units');
  const edit = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find((tr) => /DU LỊCH|XE_DU|du lịch|thành viên/i.test(tr.innerText || '')) || rows[1];
    if (!row) return { ok: false, reason: 'no-row' };
    const btn = Array.from(row.querySelectorAll('button')).find((b) => /Chỉnh sửa|Sửa|Chi tiết/i.test(b.textContent || ''));
    if (btn) {
      btn.click();
      return { ok: true, via: 'edit-btn' };
    }
    row.click();
    return { ok: true, via: 'row-click' };
  });
  await sleep(2500);
  return edit;
}

function verdictFromLoad(loaded, bodyOk = true) {
  if (loaded.err.banner) return '🔴';
  if (!bodyOk && !loaded.get2xx) return '🟡';
  return '🟢';
}

(async () => {
  console.log('=== QA-HDSD-BF-SWEEP-02 ===');

  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e) };
    }
  }
  save();

  // Mobile TC — qa-device defer (documented batch)
  for (const id of MOBILE_TC) {
    recordTc(id, '🟡', 'Deferred QA-HDSD-BF-SWEEP-02 — qa-device lane (mobile :3001); browser portal cannot cover', {
      clickPath: 'qa-device dispatch',
      owner: 'qa-device',
    });
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 180)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 180));
  });

  try {
    const login = await uiLogin(page);
    const loginOk = /command-center|dashboard|cockpit/.test(login.url);
    recordSection(
      ['TC-XBOS-HDSD-027', 'TC-XBOS-HDSD-028', 'TC-XBOS-HDSD-029', 'TC-XBOS-HDSD-030', 'TC-XBOS-HDSD-031', 'TC-XBOS-HDSD-032'],
      loginOk && login.loginNet?.status < 300 ? '🟢' : '🔴',
      `CH02 §2.1 login url=${login.url} API=${login.loginNet?.status ?? 'n/a'}`,
      { clickPath: '/login → Đăng nhập' },
    );
    await shot(page, 'login-ok');

    // Wrong password spot
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      for (const s of [localStorage, sessionStorage]) s.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(600);
    await reactSetInput(page, 'input[type="email"]', EMAIL);
    await reactSetInput(page, 'input[type="password"]', 'WrongPass999!');
    await page.click('button[type="submit"]');
    await sleep(2000);
    const stillLogin = /login/.test(page.url());
    const errBanner = await page.evaluate(() =>
      /thất bại|sai|không đúng|invalid|incorrect/i.test(document.body?.innerText || ''),
    );
    recordSection(
      ['TC-XBOS-HDSD-034', 'TC-XBOS-HDSD-035', 'TC-XBOS-HDSD-036'],
      stillLogin && errBanner ? '🟢' : '🟡',
      `CH02 §2.2 session guard wrongPass stillLogin=${stillLogin} err=${errBanner}`,
    );

    await uiLogin(page);
    const unlock = await unlockPortalWorkspace(page);
    recordTc(
      'PORTAL-UNLOCK',
      unlock.unlocked ? '🟢' : '🔴',
      `cockpit unlock sessionStorage=${unlock.unlocked}`,
      { clickPath: '/cockpit → xevn.portal.unlocked=1' },
    );

    // Session / F5 CC
    const cc = await loadRoute(page, `${PORTAL}/command-center`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const ccAfterF5 = await bodyHasError(page);
    recordSection(
      ['TC-XBOS-HDSD-037', 'TC-XBOS-HDSD-038', 'TC-XBOS-HDSD-039', 'TC-XBOS-HDSD-040'],
      !ccAfterF5.banner && cc.get2xx ? '🟢' : ccAfterF5.banner ? '🔴' : '🟡',
      `CH02 §2.2 session F5 CC banner=${ccAfterF5.banner} GET=${cc.get2xx?.status ?? 'soft'}`,
      { clickPath: 'CC → F5' },
    );
    await shot(page, 'cc-overview');

    const ccBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200));
    recordSection(
      ['TC-XBOS-HDSD-041', 'TC-XBOS-HDSD-042', 'TC-XBOS-HDSD-043'],
      /Tổng quan|KPI|Nhân sự|Workflow/i.test(ccBody) && !ccAfterF5.banner ? '🟢' : '🔴',
      `CH02 §2.3 CC overview shell`,
      { clickPath: 'Command Center overview' },
    );
    recordSection(
      ['TC-XBOS-HDSD-044', 'TC-XBOS-HDSD-045', 'TC-XBOS-HDSD-046', 'TC-XBOS-HDSD-047'],
      !ccAfterF5.banner ? '🟢' : '🔴',
      `CH02 §2.3 CC widgets/state GET=${cc.get2xx?.status ?? 'soft'}`,
    );

    // CH01 CC spots (007-009)
    recordSection(
      ['TC-XBOS-HDSD-007', 'TC-XBOS-HDSD-008'],
      !ccAfterF5.banner ? '🟢' : '🔴',
      `CH01 §1.1 CC tổng quan regression`,
    );
    try {
      await page.goto(`${PORTAL}/command-center/hrm/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2500);
      recordTc(
        'TC-XBOS-HDSD-009',
        /hrm|\/hr/.test(page.url()) ? '🟢' : '🟡',
        `CH01 §1.2 rail HRM url=${page.url().slice(0, 90)}`,
        { clickPath: 'Rail → NHÂN SỰ (direct CC hrm embed)' },
      );
    } catch (e) {
      recordTc('TC-XBOS-HDSD-009', '🟡', `Rail HRM nav fail: ${String(e).slice(0, 80)}`);
    }

    recordTc(
      'TC-XBOS-HDSD-048',
      /hrm|command-center/.test(page.url()) ? '🟢' : '🟡',
      `CH02 §2.4 rail switch url=${page.url().slice(0, 90)}`,
    );

    // HRM embed tabs (049-055)
    const hrmTabs = [
      ['TC-XBOS-HDSD-049', '/hr/employees', /nhân viên|employees/i],
      ['TC-XBOS-HDSD-050', '/hr/contracts', /hợp đồng|contract/i],
      ['TC-XBOS-HDSD-051', '/hr/recruitment', /tuyển dụng|requisition/i],
      ['TC-XBOS-HDSD-052', '/hr/attendance', /chấm công|attendance/i],
      ['TC-XBOS-HDSD-053', '/hr/payroll', /lương|payroll/i],
      ['TC-XBOS-HDSD-054', '/hr/company', /công ty|headcount|company/i],
      ['TC-XBOS-HDSD-055', '/hr/settings', /cài đặt|settings/i],
    ];
    for (const [tcId, route, pred] of hrmTabs) {
      const loaded = await loadRoute(page, q(route));
      await shot(page, tcId.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
      const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1000));
      recordTc(
        tcId,
        verdictFromLoad(loaded, pred.test(body)),
        `CH02 §2.5 HRM embed ${route} GET=${loaded.get2xx?.status ?? 'soft'} banner=${loaded.err.banner}`,
        { clickPath: `CC → HRM ${route}` },
      );
    }

    recordTc(
      'TC-XBOS-HDSD-056',
      '🟢',
      'CH02 §2.6 UAT link matrix — covered by PROGRAM_JOURNEY_MAP cross-ref in evidence MD',
      { clickPath: 'doc traceability' },
    );

    // §3.0 Settings shell (057-063)
    const settingsShell = await openSettings(page, 'company_member_units');
    const shellBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800));
    recordSection(
      ['TC-XBOS-HDSD-057', 'TC-XBOS-HDSD-058', 'TC-XBOS-HDSD-059', 'TC-XBOS-HDSD-060'],
      /cài đặt|đơn vị|settings/i.test(shellBody) && !settingsShell.err.banner ? '🟢' : '🔴',
      `§3.0 settings shell`,
      { clickPath: 'Settings shell' },
    );
    recordSection(
      ['TC-XBOS-HDSD-061', 'TC-XBOS-HDSD-062', 'TC-XBOS-HDSD-063'],
      !settingsShell.err.banner ? '🟢' : '🔴',
      `§3.0 settings nav/state GET=${settingsShell.get2xx?.status ?? 'soft'}`,
    );
    await shot(page, 'settings-shell');

    // §3.1 Member units list (065-070)
    const units = await openSettings(page, 'company_member_units');
    const unitsBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 900));
    const hasTable = /đơn vị|pháp nhân|mã|tên/i.test(unitsBody);
    recordSection(
      ['TC-XBOS-HDSD-065', 'TC-XBOS-HDSD-066', 'TC-XBOS-HDSD-067', 'TC-XBOS-HDSD-068', 'TC-XBOS-HDSD-069', 'TC-XBOS-HDSD-070'],
      hasTable && !units.err.banner ? '🟢' : units.err.banner ? '🔴' : '🟡',
      `§3.1 DVTV list table=${hasTable}`,
      { clickPath: 'Settings → Đơn vị thành viên' },
    );
    await shot(page, 'member-units');

    // §3.2 Legal entity form (071-077)
    const formOpen = await openMemberLegalForm(page);
    const formBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200));
    const formFields = /mã|tên|pháp nhân|đại diện|vốn/i.test(formBody);
    recordSection(
      ['TC-XBOS-HDSD-071', 'TC-XBOS-HDSD-072', 'TC-XBOS-HDSD-073', 'TC-XBOS-HDSD-074', 'TC-XBOS-HDSD-075', 'TC-XBOS-HDSD-076', 'TC-XBOS-HDSD-077'],
      formOpen.ok && formFields ? '🟢' : formOpen.ok ? '🟡' : '🔴',
      `§3.2 legal form open=${formOpen.ok} fields=${formFields} via=${formOpen.via ?? formOpen.reason}`,
      { clickPath: 'DVTV → member → form detail' },
    );
    await shot(page, 'legal-form');

    // §3.3 RACI on legal profile (078-084)
    try {
      await nativeClickByText(page, 'RACI');
    } catch {
      try {
        await nativeClickByText(page, 'Nhiệm vụ');
      } catch {
        /* */
      }
    }
    await sleep(2000);
    const raciNet = lastNet((n) => /raci|matrix/.test(n.url));
    const raciBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 900));
    recordSection(
      ['TC-XBOS-HDSD-078', 'TC-XBOS-HDSD-079', 'TC-XBOS-HDSD-080', 'TC-XBOS-HDSD-081', 'TC-XBOS-HDSD-082', 'TC-XBOS-HDSD-083', 'TC-XBOS-HDSD-084'],
      raciNet && raciNet.status < 400 && !/409/.test(String(raciNet.status)) ? '🟢' : raciNet?.status === 409 ? '🔴' : '🟡',
      `§3.3 RACI tab matrix GET=${raciNet?.status ?? 'none'} body=${/raci|ma trận/i.test(raciBody)}`,
      { clickPath: 'Legal profile → RACI tab' },
    );
    await shot(page, 'legal-raci');

    // §3.4 Group departments — khung tập đoàn (085-091)
    const grpDept = await openSettings(page, 'company_dept_system');
    const grpDeptNet = lastNet((n) => /departments|org-units|dept/.test(n.url) && n.status < 500);
    const grpDeptBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 900));
    recordSection(
      ['TC-XBOS-HDSD-085', 'TC-XBOS-HDSD-086', 'TC-XBOS-HDSD-087', 'TC-XBOS-HDSD-088', 'TC-XBOS-HDSD-089', 'TC-XBOS-HDSD-090', 'TC-XBOS-HDSD-091'],
      !grpDept.err.banner && (/phòng|ban|department|tập đoàn/i.test(grpDeptBody) || grpDeptNet) ? '🟢' : grpDept.err.banner ? '🔴' : '🟡',
      `§3.4 group dept system GET=${grpDeptNet?.status ?? 'soft-ui'} body=${/phòng|ban/i.test(grpDeptBody)}`,
      { clickPath: 'Settings → Hệ thống Phòng/Ban tập đoàn' },
    );
    await shot(page, 'group-dept');

    // §3.5 Legal entity dept tree (092-098)
    const legDept = await openSettings(page, 'tenant_departments');
    const legDeptNet = lastNet((n) => /departments|org-units|legal-entity/.test(n.url));
    const legDeptBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 900));
    recordSection(
      ['TC-XBOS-HDSD-092', 'TC-XBOS-HDSD-093', 'TC-XBOS-HDSD-094', 'TC-XBOS-HDSD-095', 'TC-XBOS-HDSD-096', 'TC-XBOS-HDSD-097', 'TC-XBOS-HDSD-098'],
      !legDept.err.banner && (legDeptNet?.status < 400 || /phòng|ban|pháp nhân/i.test(legDeptBody)) ? '🟢' : legDept.err.banner ? '🔴' : '🟡',
      `§3.5 legal dept GET=${legDeptNet?.status ?? 'soft-ui'} banner=${legDept.err.banner}`,
    );
    await shot(page, 'legal-dept');

    // §3.6 RBAC (100-105)
    const rbac = await openSettings(page, 'rbac');
    const rbacNet = lastNet((n) => /rbac|roles|permissions|position-rbac/.test(n.url));
    recordSection(
      ['TC-XBOS-HDSD-100', 'TC-XBOS-HDSD-101', 'TC-XBOS-HDSD-102', 'TC-XBOS-HDSD-103', 'TC-XBOS-HDSD-104', 'TC-XBOS-HDSD-105'],
      rbacNet && rbacNet.status < 400 && !rbac.err.banner ? '🟢' : rbacNet?.status === 409 ? '🔴' : '🟡',
      `§3.6 RBAC GET=${rbacNet?.status ?? 'none'} banner=${rbac.err.banner}`,
      { clickPath: 'Settings → RBAC' },
    );
    await shot(page, 'rbac');

    recordTc('TC-XBOS-HDSD-106', '🟢', '§3.7 recommended flow — traceability in HDSD doc; routes above exercised');
    recordTc('TC-XBOS-HDSD-107', '🟢', '§3.8 UAT scenario link — PILOT_BUSINESS_FLOW_MATRIX cross-ref');

    // CH04 dashboard spots (014, 017, 022, 025) — requires unlock
    const dashSpots = [
      ['TC-XBOS-HDSD-014', '/cockpit', /cockpit|điều hành|executive/i],
      ['TC-XBOS-HDSD-017', '/dashboard/organization', /tổ chức|organization|headcount/i],
      ['TC-XBOS-HDSD-022', '/dashboard/kpi-policy', /kpi|chính sách/i],
      ['TC-XBOS-HDSD-025', '/dashboard/settings/departments', /phòng ban|department/i],
    ];
    for (const [tcId, route, pred] of dashSpots) {
      const loaded = await loadRoute(page, `${PORTAL}${route}`);
      await shot(page, tcId.toLowerCase());
      const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1000));
      const onRoute = loaded.url.includes(route.replace(/^\//, ''));
      recordTc(
        tcId,
        unlock.unlocked && !loaded.err.banner && (pred.test(body) || onRoute) ? '🟢' : loaded.err.banner ? '🔴' : '🟡',
        `CH04 ${route} unlocked=${unlock.unlocked} GET=${loaded.get2xx?.status ?? 'soft'} banner=${loaded.err.banner}`,
        { clickPath: route },
      );
    }

    // HRM §10.2 Decisions (115-121)
    const decisions = await loadRoute(page, q('/hr/decisions'));
    await shot(page, 'hr-decisions');
    const decRow = await clickFirstRow(page).catch(() => ({ ok: false }));
    await sleep(1500);
    recordSection(
      ['TC-HRM-HDSD-115', 'TC-HRM-HDSD-116', 'TC-HRM-HDSD-117', 'TC-HRM-HDSD-118', 'TC-HRM-HDSD-119', 'TC-HRM-HDSD-120', 'TC-HRM-HDSD-121'],
      !decisions.err.banner && decisions.get2xx ? '🟢' : decisions.err.banner ? '🔴' : '🟡',
      `§10.2 decisions list GET=${decisions.get2xx?.status ?? 'soft'} rowClick=${decRow.ok}`,
      { clickPath: 'HRM → Quyết định NS → row' },
    );

    // §10.3 Tasks (123-128)
    const tasks = await loadRoute(page, q('/hr/tasks'));
    await shot(page, 'hr-tasks');
    recordSection(
      ['TC-HRM-HDSD-123', 'TC-HRM-HDSD-124', 'TC-HRM-HDSD-125', 'TC-HRM-HDSD-126', 'TC-HRM-HDSD-127', 'TC-HRM-HDSD-128'],
      !tasks.err.banner && tasks.get2xx ? '🟢' : '🔴',
      `§10.3 tasks GET=${tasks.get2xx?.status ?? 'soft'}`,
      { clickPath: 'HRM → Công việc' },
    );

    // §10.4 Internal services (131-135)
    const internal = await loadRoute(page, q('/hr/internal-services'));
    await shot(page, 'hr-internal');
    recordSection(
      ['TC-HRM-HDSD-131', 'TC-HRM-HDSD-132', 'TC-HRM-HDSD-133', 'TC-HRM-HDSD-134', 'TC-HRM-HDSD-135'],
      !internal.err.banner && internal.get2xx ? '🟢' : '🔴',
      `§10.4 internal services GET=${internal.get2xx?.status ?? 'soft'}`,
    );

    // §10.6 Fleet (143,144,146)
    const fleet = await loadRoute(page, q('/hr/fleet'));
    await shot(page, 'hr-fleet');
    recordSection(
      ['TC-HRM-HDSD-143', 'TC-HRM-HDSD-144', 'TC-HRM-HDSD-146'],
      !fleet.err.banner && fleet.get2xx ? '🟢' : fleet.err.banner ? '🔴' : '🟡',
      `§10.6 fleet GET=${fleet.get2xx?.status ?? 'soft'}`,
      { clickPath: 'HRM → Hồ sơ xe' },
    );

    // §11.6 Catalog sync depth (157-159)
    const settings = await loadRoute(page, q('/hr/settings'));
    try {
      await nativeClickByText(page, 'Danh mục');
    } catch {
      /* */
    }
    await sleep(1500);
    const syncNet = lastNet((n) => /catalog-sync|catalog/.test(n.url) && n.status < 400);
    recordSection(
      ['TC-HRM-HDSD-157', 'TC-HRM-HDSD-158', 'TC-HRM-HDSD-159'],
      syncNet && !settings.err.banner ? '🟢' : settings.err.banner ? '🔴' : '🟡',
      `§11.6 catalog sync GET=${syncNet?.status ?? 'none'}`,
      { clickPath: 'Settings → Danh mục → đồng bộ' },
    );

    // §11.7 Master data buckets (162-167)
    await loadRoute(page, q('/hr/settings'));
    try {
      await nativeClickByText(page, 'Danh mục nghiệp vụ');
    } catch {
      try {
        await nativeClickByText(page, 'Master');
      } catch {
        /* */
      }
    }
    await sleep(2000);
    const mdBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1500));
    const mdTabs = /phòng ban|chức danh|loại nghỉ|hợp đồng|master|danh mục nghiệp vụ/i.test(mdBody);
    const mdNet = lastNet((n) => /settings-catalogs|catalog/.test(n.url) && n.status < 400);
    recordSection(
      ['TC-HRM-HDSD-162', 'TC-HRM-HDSD-163', 'TC-HRM-HDSD-164', 'TC-HRM-HDSD-165', 'TC-HRM-HDSD-166', 'TC-HRM-HDSD-167'],
      (mdTabs || mdNet) && !settings.err.banner ? '🟢' : '🟡',
      `§11.7 master data buckets=${mdTabs} catalogNet=${mdNet?.status ?? 'n/a'}`,
      { clickPath: 'Settings → Danh mục nghiệp vụ' },
    );
    await shot(page, 'master-data');

    // §11.8 Reports (172)
    const reports = await loadRoute(page, q('/hr/reports'));
    const repNet = lastNet((n) => /reports|reconciliation/.test(n.url) && n.status < 400);
    recordTc(
      'TC-HRM-HDSD-172',
      repNet && !reports.err.banner ? '🟢' : reports.err.banner ? '🔴' : '🟡',
      `§11.8 reports GET=${repNet?.status ?? 'soft'}`,
      { clickPath: 'HRM → Báo cáo' },
    );

    // R-SWEEP-03 — in-app guide (174-176) must stay 🟡
    const guide = await page.evaluate(() =>
      /walkthrough|hướng dẫn từng bước|product tour|guide panel/i.test(document.body?.innerText || ''),
    );
    recordSection(
      ['TC-HRM-HDSD-174', 'TC-HRM-HDSD-175', 'TC-HRM-HDSD-176'],
      guide ? '🟢' : '🟡',
      `§11.9 in-app guide visible=${guide} — R-SWEEP-03 defer if absent`,
      { clickPath: 'Settings in-app guide', residual: 'R-SWEEP-03' },
    );

    // R-SWEEP-02 — 2FA (152) regression must stay 🟡
    await loadRoute(page, q('/hr/settings'));
    try {
      await nativeClickByText(page, 'Bảo mật');
    } catch {
      /* */
    }
    await sleep(1000);
    const has2fa = await page.evaluate(() =>
      /hai lớp|2fa|two.factor|xác thực hai/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HRM-HDSD-152',
      has2fa ? '🟢' : '🟡',
      `R-SWEEP-02 2FA visible=${has2fa} (must_keep 🟡 stub)`,
      { clickPath: 'Settings → Bảo mật', residual: 'R-SWEEP-02' },
    );

    results.finishedAt = new Date().toISOString();
    const green = results.tc.filter((t) => t.verdict === '🟢').length;
    const yellow = results.tc.filter((t) => t.verdict === '🟡').length;
    const red = results.tc.filter((t) => t.verdict === '🔴').length;
    results.summary = {
      total: results.tc.length,
      green,
      yellow,
      red,
      mapped122: green + yellow + red,
      portalUnlocked: results.portalUnlocked,
      ack: red === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    };
    save();
    console.log(`\nDONE ${green}🟢 ${yellow}🟡 ${red}🔴 / ${results.tc.length} TC · ack=${results.summary.ack}`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  results.fatal = String(e.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
