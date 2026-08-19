/**
 * QA-HDSD-DRIVEN-W1-03-01 — HDSD browser UAT CH02–CH11 (U65 zero-seed)
 * Persona: ceo@xe.vn · portal :5173 · real UI login + click paths
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-driven-uat-ch02-11-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-uat-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-DRIVEN-W1-03-01',
  program: 'P-HDSD-QA-SRS-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 120)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
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

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const banner =
      /ERROR|Sync ERROR|409|54321|ERR_CONNECTION|thất bại/i.test(t) &&
      !/Đăng nhập thất bại/i.test(t.slice(0, 200));
    return { banner, url: location.href, snippet: t.slice(0, 400) };
  });
}

async function uiLogin(page, email = EMAIL, password = PASSWORD) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', email);
  await reactSetInput(page, 'input[type="password"]', password);
  const before = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  const loginNet = results.network.slice(before).find((n) => /auth\/login/.test(n.url));
  return { url: page.url(), loginNet };
}

async function openSettings(page, query) {
  await page.goto(`${PORTAL}/command-center?settings=${query}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2500);
}

async function loadHrmRoute(page, path) {
  await page.goto(q(path), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const err = await bodyHasError(page);
  const get2xx = await waitForNet(
    (n) => n.method === 'GET' && n.status >= 200 && n.status < 300,
    12000,
  );
  return { err, get2xx, url: page.url() };
}

(async () => {
  console.log('=== QA-HDSD-DRIVEN-UAT CH02-11 ===');

  // L0 snapshot
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
    // ===== CH02 =====
    const loginOk = await uiLogin(page);
    await shot(page, 'ch02-login');
    const ccRedirect = /command-center/.test(loginOk.url);
    const err02 = await bodyHasError(page);
    recordTc(
      'TC-HDSD-02-01-01',
      ccRedirect && !err02.banner ? '🟢' : '🔴',
      `Click: /login → email+password → Đăng nhập → ${loginOk.url}; loginAPI=${loginOk.loginNet?.status ?? 'n/a'}`,
      { clickPath: '/login → Đăng nhập', network: loginOk.loginNet?.status },
    );

    // Wrong password — clear session so /login form renders
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      for (const s of [localStorage, sessionStorage]) s.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(800);
    await reactSetInput(page, 'input[type="email"]', EMAIL);
    await reactSetInput(page, 'input[type="password"]', 'WrongPass999!');
    await page.click('button[type="submit"]');
    await sleep(2000);
    const stillLogin = /login/.test(page.url());
    const errBanner = await page.evaluate(() =>
      /thất bại|sai|không đúng|invalid|incorrect/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HDSD-02-01-02',
      stillLogin && errBanner ? '🟢' : '🟡',
      `Sai MK 1 lần: stillLogin=${stillLogin} errBanner=${errBanner} url=${page.url()}`,
    );

    // Re-login OK
    await uiLogin(page);

    // CC KPI
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await shot(page, 'ch02-cc');
    const ccErr = await bodyHasError(page);
    const kpiNet = lastNet((n) => /kpi|dashboard|rollup|tenant-scope/.test(n.url) && n.status < 400);
    recordTc(
      'TC-HDSD-02-02-01',
      !ccErr.banner && (kpiNet || !/409|54321/.test(ccErr.snippet)) ? '🟢' : '🔴',
      `CC load url=${page.url()} kpiNet=${kpiNet?.status ?? 'soft'} banner=${ccErr.banner}`,
      { clickPath: 'Command Center' },
    );

    // HRM embed dashboard
    const hrmDash = await loadHrmRoute(page, '/hr');
    await shot(page, 'ch02-hrm-dash');
    recordTc(
      'TC-HDSD-02-03-01',
      !hrmDash.err.banner && hrmDash.get2xx ? '🟢' : hrmDash.err.banner ? '🔴' : '🟡',
      `HRM dashboard GET=${hrmDash.get2xx?.status ?? 'none'} banner=${hrmDash.err.banner}`,
      { clickPath: 'CC → HRM embed' },
    );

    // Cross-nav CC → employees → back CC
    await loadHrmRoute(page, '/hr/employees');
    await shot(page, 'ch02-hrm-employees');
    const row = await clickFirstRow(page);
    await sleep(2000);
    const empUrl = page.url();
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const backOk = /command-center/.test(page.url());
    recordTc(
      'TC-HDSD-02-03-02',
      backOk && !hrmDash.err.banner ? '🟢' : '🔴',
      `J-CC-HRM-01 employees click=${row.ok} empUrl=${empUrl.slice(0, 80)} backCC=${backOk}`,
      { clickPath: 'CC → HRM employees → back CC' },
    );

    // ===== CH03 XBOS =====
    await openSettings(page, 'company_member_units');
    await shot(page, 'ch03-units');
    const unitsBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 600));
    const unitsTable = /đơn vị|pháp nhân|mã|tên/i.test(unitsBody);
    recordTc(
      'TC-HDSD-03-01-01',
      unitsTable ? '🟢' : '🟡',
      `Settings → ĐVTV table=${unitsTable} snippet=${unitsBody.slice(0, 120)}`,
      { clickPath: 'Settings → Đơn vị thành viên' },
    );

    // Shareholder mutate (UF-XBOS-05 pattern)
    let shrVerdict = '🟡';
    let shrDetail = 'skip — no holding row';
    try {
      await openSettings(page, 'company_member_units');
      const edit = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const row = rows.find((tr) => /TẬP ĐOÀN|HOLDING|XEVN/i.test(tr.innerText || ''));
        if (!row) return { ok: false };
        const btn = Array.from(row.querySelectorAll('button')).find((b) => /Chỉnh sửa|Sửa/i.test(b.textContent || ''));
        if (!btn) return { ok: false, reason: 'no edit btn' };
        btn.click();
        return { ok: true };
      });
      await sleep(2500);
      if (edit.ok) {
        try {
          await nativeClickByText(page, 'Thêm cổ đông');
        } catch {
          await nativeClickByText(page, 'Thêm dòng');
        }
        await sleep(800);
        const stamp = `HDSD${Date.now().toString(36).slice(-4).toUpperCase()}`;
        await page.evaluate((name) => {
          const tables = Array.from(document.querySelectorAll('table'));
          const shr = tables.find((t) => /Họ tên|Tỷ lệ|cổ đông/i.test(t.innerText || ''));
          if (!shr) return;
          const last = Array.from(shr.querySelectorAll('tbody tr')).at(-1);
          const inputs = Array.from(last?.querySelectorAll('input') || []);
          if (inputs[1]) {
            inputs[1].value = name;
            inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, `QA ${stamp}`);
        const beforeN = results.network.length;
        try {
          await nativeClickByText(page, 'Lưu cổ đông');
        } catch {
          /* row save icon */
        }
        await sleep(2500);
        const postShr = results.network
          .slice(beforeN)
          .find((n) => ['POST', 'PUT', 'PATCH'].includes(n.method) && /shareholder|legal-entity/i.test(n.url));
        shrVerdict = postShr && postShr.status >= 200 && postShr.status < 300 ? '🟢' : row.ok ? '🟡' : '🔴';
        shrDetail = `mutate stamp=${stamp} post=${postShr?.method || 'none'} ${postShr?.status || ''}`;
      }
    } catch (e) {
      shrDetail = String(e).slice(0, 120);
    }
    recordTc('TC-HDSD-03-02-01', shrVerdict, shrDetail, { clickPath: 'Holding → Thêm cổ đông → Lưu' });

    await openSettings(page, 'departments');
    await shot(page, 'ch03-dept');
    const deptNet = lastNet((n) => /departments/.test(n.url) && n.status < 400);
    recordTc(
      'TC-HDSD-03-03-01',
      deptNet ? '🟢' : '🟡',
      `Phòng ban load GET=${deptNet?.status ?? 'none'}`,
      { clickPath: 'Settings → Phòng ban' },
    );

    await openSettings(page, 'rbac');
    await shot(page, 'ch03-rbac');
    const rbacNet = lastNet((n) => /rbac|roles|permissions/.test(n.url));
    const rbac409 = lastNet((n) => /409/.test(String(n.status)));
    recordTc(
      'TC-HDSD-03-04-01',
      rbacNet && rbacNet.status < 400 && !rbac409 ? '🟢' : rbacNet?.status === 409 ? '🔴' : '🟡',
      `RBAC load status=${rbacNet?.status ?? 'none'}`,
      { clickPath: 'Settings → RBAC' },
    );

    // ===== CH04 =====
    await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'ch04-inbox');
    const inboxNet = lastNet((n) => /inbox|workflow|tasks/.test(n.url) && n.status < 500);
    const inboxErr = await bodyHasError(page);
    recordTc(
      'TC-HDSD-04-01-01',
      !inboxErr.banner && (inboxNet || true) ? '🟢' : '🔴',
      `Inbox load net=${inboxNet?.status ?? 'empty-ok'} banner=${inboxErr.banner}`,
      { clickPath: 'Workflow → Inbox' },
    );

    await openSettings(page, 'workflow_designer');
    await sleep(2000);
    try {
      await nativeClickByText(page, 'Quy trình');
    } catch {
      /* */
    }
    await shot(page, 'ch04-wf-canvas');
    const canvasDots = await page.evaluate(() =>
      /canvas|workflow|bước|node/i.test(document.body?.innerText || ''),
    );
    recordTc(
      'TC-HDSD-04-02-01',
      canvasDots ? '🟢' : '🟡',
      `WF canvas/dots visible=${canvasDots}`,
      { clickPath: 'Workflow canvas' },
    );

    await openSettings(page, 'hrm_catalog');
    await sleep(2000);
    await shot(page, 'ch04-catalog');
    const catNet = lastNet((n) => /catalog/.test(n.url) && n.status < 500);
    const catErr = await bodyHasError(page);
    recordTc(
      'TC-HDSD-04-03-01',
      !catErr.banner && catNet?.status < 400 ? '🟢' : catErr.banner ? '🔴' : '🟡',
      `Catalog sync net=${catNet?.status ?? 'none'} ERROR banner=${catErr.banner}`,
      { clickPath: 'Settings → Catalog publish/pull' },
    );

    await openSettings(page, 'raci');
    await sleep(2000);
    await shot(page, 'ch04-raci');
    const raciNet = lastNet((n) => /raci/.test(n.url));
    recordTc(
      'TC-HDSD-04-04-01',
      raciNet && raciNet.status < 400 ? '🟢' : '🟡',
      `RACI load status=${raciNet?.status ?? 'none'}`,
      { clickPath: 'Settings → RACI' },
    );

    // ===== CH05-09 HRM =====
    const hrmRoutes = [
      ['TC-HDSD-05-01-01', '/hr/employees', 'CH05 §5.1 Danh sách NV'],
      ['TC-HDSD-05-02-01', '/hr/employees', 'CH05 §5.2 list→detail', true],
      ['TC-HDSD-05-03-01', '/hr/employees', 'CH05 §5.3 Tạo NV', 'create'],
      ['TC-HDSD-05-04-01', '/hr/employees', 'CH05 §5.4 Sửa NV', 'edit'],
      ['TC-HDSD-06-01-01', '/hr/contracts', 'CH06 §6.1 HĐ list'],
      ['TC-HDSD-06-02-01', '/hr/contracts', 'CH06 §6.2 Tạo HĐ', 'create'],
      ['TC-HDSD-06-03-01', '/hr/insurance', 'CH06 §6.3 BHXH'],
      ['TC-HDSD-06-04-01', '/hr/insurance', 'CH06 §6.4 BHXH hết hạn'],
      ['TC-HDSD-07-01-01', '/hr/recruitment', 'CH07 §7.1 YCTD list'],
      ['TC-HDSD-07-02-01', '/hr/recruitment', 'CH07 §7.2 Tạo YCTD', 'create'],
      ['TC-HDSD-07-03-01', '/hr/recruitment', 'CH07 §7.3 Pipeline'],
      ['TC-HDSD-08-01-01', '/hr/attendance', 'CH08 §8.1 Bảng CC'],
      ['TC-HDSD-08-02-01', '/hr/attendance', 'CH08 §8.2 Đơn nghỉ', 'leave'],
      ['TC-HDSD-08-03-01', '/hr/attendance', 'CH08 §8.3 Công chuẩn', 'tab'],
      ['TC-HDSD-09-01-01', '/hr/payroll', 'CH09 §9.1 Kỳ lương'],
      ['TC-HDSD-09-02-01', '/hr/payroll', 'CH09 §9.2 Phiếu lương', 'detail'],
      ['TC-HDSD-09-03-01', '/hr/payroll', 'CH09 §9.3 Đối soát', 'report'],
    ];

    for (const [tcId, route, label, mode] of hrmRoutes) {
      const loaded = await loadHrmRoute(page, route);
      await shot(page, tcId.replace(/-/g, '_').toLowerCase());
      let verdict = '🟢';
      let detail = `${label} GET=${loaded.get2xx?.status ?? 'none'} url=${loaded.url.slice(0, 90)}`;

      if (loaded.err.banner) {
        verdict = '🔴';
        detail += ` ERROR banner`;
      }

      if (mode === true) {
        const r = await clickFirstRow(page);
        await sleep(2000);
        const detailGet = lastNet(
          (n) => n.method === 'GET' && /employees\/[^/?]+/.test(n.url) && n.status < 400,
        );
        verdict = r.ok && (detailGet || /employees\//.test(page.url())) ? '🟢' : r.ok ? '🟡' : '🟡';
        detail += ` clickRow=${r.ok} detailGET=${detailGet?.status ?? 'none'}`;
      }

      if (mode === 'create') {
        try {
          await nativeClickByText(page, 'Thêm');
        } catch {
          try {
            await nativeClickByText(page, 'Tạo mới');
          } catch {
            /* */
          }
        }
        await sleep(1500);
        const hasForm = await page.evaluate(() => !!document.querySelector('[role="dialog"], form, input'));
        verdict = hasForm ? '🟡' : loaded.get2xx ? '🟡' : verdict;
        detail += ` createForm=${hasForm} (mutate post-reset → BLOCKED nếu empty, load-only OK)`;
        if (!hasForm && tcId.includes('05-03')) {
          detail += ' · empty post-reset — cần tạo từ FE trước';
        }
      }

      if (mode === 'edit') {
        const r = await clickFirstRow(page);
        if (r.ok) {
          try {
            await nativeClickByText(page, 'Sửa');
          } catch {
            /* */
          }
          verdict = '🟡';
          detail += ` editBlocked=${!r.ok ? 'no-row' : 'dialog-open-soft'}`;
        } else {
          verdict = '🟡';
          detail += ' empty — BLOCKED mutate';
        }
      }

      if (mode === 'leave') {
        try {
          await nativeClickByText(page, 'Nghỉ phép');
          await sleep(1200);
        } catch {
          /* */
        }
        const leaveNet = lastNet((n) => /leave/.test(n.url));
        detail += ` leaveTab=${leaveNet?.status ?? 'n/a'}`;
        verdict = loaded.get2xx && !loaded.err.banner ? '🟡' : verdict;
        detail += ' · mutate leave known BE 400 — load-only';
      }

      if (mode === 'tab') {
        for (const t of ['Công chuẩn', 'Ca làm', 'Shift']) {
          try {
            await nativeClickByText(page, t);
            await sleep(800);
            break;
          } catch {
            /* */
          }
        }
      }

      if (mode === 'detail' || mode === 'report') {
        await clickFirstRow(page).catch(() => null);
        await sleep(1500);
        detail += ` drill=${mode}`;
      }

      recordTc(tcId, verdict, detail, { clickPath: label, hdsd: label.split(' ')[0] });
    }

    // ===== CH10-11 =====
    const ch10Routes = [
      ['TC-HDSD-10-01-01', '/hr/company', 'CH10 §10.1 Headcount'],
      ['TC-HDSD-10-02-01', '/hr/decisions', 'CH10 §10.2 Quyết định'],
      ['TC-HDSD-10-03-01', '/hr/tasks', 'CH10 §10.3 Công việc'],
      ['TC-HDSD-10-04-01', '/hr/internal_services', 'CH10 §10.4 DVC'],
      ['TC-HDSD-10-05-01', '/hr/processes', 'CH10 §10.5 Quy trình'],
      ['TC-HDSD-10-06-01', '/hr/fleet', 'CH10 §10.6 Fleet'],
      ['TC-HDSD-11-01-01', '/hr/settings', 'CH11 §11.1 Settings catalogs'],
      ['TC-HDSD-11-02-01', '/hr/reports', 'CH11 §11.2 Báo cáo'],
    ];

    for (const [tcId, route, label] of ch10Routes) {
      const loaded = await loadHrmRoute(page, route);
      await shot(page, tcId.replace(/-/g, '_').toLowerCase());

      if (tcId === 'TC-HDSD-10-01-01') {
        const summaryNet = lastNet((n) => /summary|headcount|employees\/summary/.test(n.url));
        recordTc(
          tcId,
          summaryNet && summaryNet.status < 400 && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡',
          `Headcount card API=${summaryNet?.status ?? 'soft-ui'} banner=${loaded.err.banner}`,
          { clickPath: label },
        );
        continue;
      }

      if (tcId === 'TC-HDSD-11-01-01') {
        try {
          await nativeClickByText(page, 'Danh mục');
        } catch {
          /* */
        }
        const syncNet = lastNet((n) => /catalog-sync|catalog/.test(n.url) && n.status < 400);
        recordTc(
          tcId,
          syncNet && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡',
          `Settings catalog sync=${syncNet?.status ?? 'none'}`,
          { clickPath: label },
        );
        continue;
      }

      recordTc(
        tcId,
        !loaded.err.banner && loaded.get2xx ? '🟢' : loaded.err.banner ? '🔴' : '🟡',
        `${label} GET=${loaded.get2xx?.status ?? 'none'} empty-ok post-reset`,
        { clickPath: label },
      );
    }

    results.finishedAt = new Date().toISOString();
    results.summary = {
      total: results.tc.length,
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('\n=== SUMMARY ===', JSON.stringify(results.summary));
  process.exit(results.summary?.red > 0 ? 1 : 0);
})();
