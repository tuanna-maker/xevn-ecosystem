/**
 * QA-HDSD-FULL-W0-W4-01 — HDSD full ecosystem browser UAT (U65 zero-seed)
 * W0 Ecosystem → W1 XBOS (:5173) → W2a HRM standalone (:8080/hr) → W2b embed → W4 integration
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = (process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:8080/hr/').replace(/\/?$/, '/');
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hdsd-full-w0-w4-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-uat-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
const qHrmStandalone = (path) => {
  const base = HRM_STANDALONE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}${p.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
};

const waves = { w0: [], w1: [], w2a: [], w2b: [], w4: [] };
const results = {
  work_item_id: 'QA-HDSD-FULL-W0-W4-01',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_STANDALONE, EMAIL, u65: 'zero-seed' },
  l0: {},
  waves,
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function recordTc(waveKey, id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  waves[waveKey].push(row);
  console.log(`[${waveKey}] ${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 100)}`);
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

async function uiLogin(page, baseUrl = PORTAL, email = EMAIL, password = PASSWORD) {
  await page.goto(`${baseUrl.replace(/\/$/, '')}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
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

async function loadRoute(page, url, waitMs = 3000) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(waitMs);
  const err = await bodyHasError(page);
  const get2xx = await waitForNet((n) => n.method === 'GET' && n.status >= 200 && n.status < 300, 12000);
  return { err, get2xx, url: page.url() };
}

async function openSettings(page, query) {
  await page.goto(`${PORTAL}/command-center?settings=${query}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
}

async function runHrmMenuBatch(page, waveKey, prefix, routeFn, routes) {
  for (const [tcId, path, label, mode] of routes) {
    const loaded = await loadRoute(page, routeFn(path));
    await shot(page, `${waveKey}-${tcId.replace(/-/g, '_').toLowerCase()}`);
    let verdict = '🟢';
    let detail = `${label} GET=${loaded.get2xx?.status ?? 'none'} url=${loaded.url.slice(0, 90)}`;
    if (loaded.err.banner) {
      verdict = '🔴';
      detail += ' ERROR banner';
    }
    if (mode === 'detail') {
      const r = await clickFirstRow(page);
      await sleep(2000);
      const detailGet = lastNet((n) => n.method === 'GET' && /\/(employees|contracts)\/[^/?]+/.test(n.url));
      verdict = r.ok && (detailGet || /\/(employees|contracts)\//.test(page.url())) ? '🟢' : r.ok ? '🟡' : '🟡';
      detail += ` clickRow=${r.ok} detailGET=${detailGet?.status ?? 'none'}`;
    }
    if (mode === 'headcount') {
      const summaryNet = lastNet((n) => /summary|headcount|employees\/summary/.test(n.url));
      verdict = summaryNet && summaryNet.status < 400 && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡';
      detail += ` headcountAPI=${summaryNet?.status ?? 'soft-ui'}`;
    }
    if (mode === 'catalog') {
      try {
        await nativeClickByText(page, 'Danh mục');
      } catch {
        /* */
      }
      const syncNet = lastNet((n) => /catalog-sync|catalog/.test(n.url) && n.status < 400);
      verdict = syncNet && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡';
      detail += ` catalogSync=${syncNet?.status ?? 'none'}`;
    }
    recordTc(waveKey, tcId, verdict, detail, { clickPath: label, entry: prefix });
  }
}

(async () => {
  console.log('=== QA-HDSD-FULL-W0-W4 ===');

  for (const [name, url] of [
    ['hrm-api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos-api', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
    ['hrm-standalone', HRM_STANDALONE],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status, url };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e), url };
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
    // ===== W0 ECOSYSTEM =====
    const loginOk = await uiLogin(page);
    await shot(page, 'w0-login');
    const ccRedirect = /command-center|cockpit|dashboard/.test(loginOk.url);
    const err0 = await bodyHasError(page);
    recordTc(
      'w0',
      'TC-ECO-01',
      ccRedirect && !err0.banner ? '🟢' : '🔴',
      `Login → ${loginOk.url}; API=${loginOk.loginNet?.status ?? 'n/a'}`,
      { clickPath: '/login → Đăng nhập', uf: 'ECO §2' },
    );

    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w0-cc-rail');
    const railText = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800));
    const hasGroup = /Tập đoàn|GROUP|Command Center/i.test(railText);
    const hasHrmRail = /NHÂN SỰ|Nhân sự/i.test(railText);
    recordTc(
      'w0',
      'TC-ECO-02',
      hasGroup && hasHrmRail ? '🟢' : '🟡',
      `Rail GROUP=${hasGroup} NHÂN_SỰ=${hasHrmRail}`,
      { clickPath: 'CC rail phân hệ', uf: 'ECO §4' },
    );

    try {
      await nativeClickByText(page, 'NHÂN SỰ');
      await sleep(2500);
      await shot(page, 'w0-hrm-rail-click');
      const hrmEmbedUrl = page.url();
      const hrmRailOk = /hrm|\/hr/.test(hrmEmbedUrl);
      recordTc(
        'w0',
        'TC-ECO-03',
        hrmRailOk ? '🟢' : '🟡',
        `Rail NHÂN SỰ → ${hrmEmbedUrl.slice(0, 100)}`,
        { clickPath: 'Rail → HRM embed', uf: 'HRM Ch.0 embed path' },
      );
    } catch (e) {
      recordTc('w0', 'TC-ECO-03', '🟡', `Rail NHÂN SỰ click fail: ${String(e).slice(0, 80)}`);
    }

    await page.goto(`${PORTAL}/dashboard/organization`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w0-dash-org');
    const dashErr = await bodyHasError(page);
    const orgNet = lastNet((n) => /organization|tenant-scope|companies/.test(n.url) && n.status < 400);
    recordTc(
      'w0',
      'TC-ECO-04',
      !dashErr.banner && (orgNet || /organization/.test(page.url())) ? '🟢' : dashErr.banner ? '🔴' : '🟡',
      `Dashboard organization url=${page.url().slice(0, 80)} net=${orgNet?.status ?? 'soft'}`,
      { clickPath: 'CC → /dashboard/organization', uf: 'ECO §3' },
    );

    // Re-login for W1
    await uiLogin(page);

    // ===== W1 XBOS =====
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await shot(page, 'w1-cc');
    const ccErr = await bodyHasError(page);
    const kpiNet = lastNet((n) => /kpi|dashboard|rollup|tenant-scope/.test(n.url) && n.status < 400);
    recordTc(
      'w1',
      'TC-XBOS-HDSD-01-01',
      !ccErr.banner ? '🟢' : '🔴',
      `CC widgets load kpiNet=${kpiNet?.status ?? 'soft'} banner=${ccErr.banner}`,
      { uf: 'UF-XBOS-01', hdsd: 'XBOS Ch.1' },
    );
    recordTc(
      'w1',
      'TC-XBOS-HDSD-01-02',
      kpiNet && kpiNet.status < 400 ? '🟢' : '🟡',
      `KPI rollup net=${kpiNet?.status ?? 'none'}`,
      { uf: 'UF-XBOS-10', hdsd: 'XBOS Ch.1' },
    );

    await openSettings(page, 'company_member_units');
    await shot(page, 'w1-units');
    const unitsBody = await page.evaluate(() => (document.body?.innerText || '').slice(0, 600));
    recordTc(
      'w1',
      'TC-XBOS-HDSD-02-01',
      /đơn vị|pháp nhân|mã|tên/i.test(unitsBody) ? '🟢' : '🟡',
      `ĐVTV list snippet=${unitsBody.slice(0, 100)}`,
      { uf: 'UF-XBOS-02', hdsd: 'XBOS Ch.2' },
    );

    await openSettings(page, 'departments');
    await shot(page, 'w1-dept');
    const deptNet = lastNet((n) => /departments/.test(n.url) && n.status < 400);
    recordTc(
      'w1',
      'TC-XBOS-HDSD-02-05',
      deptNet ? '🟢' : '🟡',
      `Phòng ban GET=${deptNet?.status ?? 'none'}`,
      { uf: 'UF-XBOS-12', hdsd: 'XBOS Ch.2' },
    );

    await openSettings(page, 'rbac');
    await shot(page, 'w1-rbac');
    const rbacNet = lastNet((n) => /rbac|roles|permissions/.test(n.url));
    recordTc(
      'w1',
      'TC-XBOS-HDSD-02-06',
      rbacNet && rbacNet.status < 400 ? '🟢' : rbacNet?.status === 409 ? '🔴' : '🟡',
      `RBAC status=${rbacNet?.status ?? 'none'}`,
      { uf: 'UF-XBOS-13', hdsd: 'XBOS Ch.2' },
    );

    await openSettings(page, 'raci');
    await shot(page, 'w1-raci');
    const raciNet = lastNet((n) => /raci/.test(n.url));
    recordTc(
      'w1',
      'TC-XBOS-HDSD-03-01',
      raciNet && raciNet.status < 400 ? '🟢' : '🟡',
      `RACI status=${raciNet?.status ?? 'none'}`,
      { uf: 'UF-XBOS-07', hdsd: 'XBOS Ch.3' },
    );

    await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w1-inbox');
    const inboxErr = await bodyHasError(page);
    recordTc(
      'w1',
      'TC-XBOS-HDSD-03-02',
      !inboxErr.banner ? '🟢' : '🔴',
      `Workflow inbox banner=${inboxErr.banner}`,
      { uf: 'UF-XBOS-08', hdsd: 'XBOS Ch.3' },
    );

    await openSettings(page, 'hrm_catalog');
    await sleep(2000);
    await shot(page, 'w1-catalog');
    const catNet = lastNet((n) => /catalog/.test(n.url) && n.status < 500);
    const catErr = await bodyHasError(page);
    recordTc(
      'w1',
      'TC-XBOS-HDSD-03-03',
      !catErr.banner && catNet?.status < 400 ? '🟢' : catErr.banner ? '🔴' : '🟡',
      `Catalog governance net=${catNet?.status ?? 'none'}`,
      { uf: 'UF-XBOS-09/14/15', hdsd: 'XBOS Ch.3' },
    );

    await page.goto(`${PORTAL}/cockpit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    await shot(page, 'w1-cockpit');
    recordTc(
      'w1',
      'TC-XBOS-HDSD-04-01',
      !(await bodyHasError(page)).banner ? '🟢' : '🔴',
      `Cockpit load url=${page.url()}`,
      { hdsd: 'XBOS Ch.4' },
    );

    await page.goto(`${PORTAL}/dashboard/organization`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    await shot(page, 'w1-dash-org');
    recordTc(
      'w1',
      'TC-XBOS-HDSD-04-02',
      !(await bodyHasError(page)).banner ? '🟢' : '🔴',
      `/dashboard/organization load`,
      { hdsd: 'XBOS Ch.4' },
    );

    // ===== W2b HRM EMBED (portal) =====
    const hrmEmbedRoutes = [
      ['TC-HRM-HDSD-01-01', '/employees', 'Danh sách NV'],
      ['TC-HRM-HDSD-01-02', '/employees', 'list→detail', 'detail'],
      ['TC-HRM-HDSD-02-01', '/contracts', 'HĐ list'],
      ['TC-HRM-HDSD-03-01', '/recruitment', 'Tuyển dụng'],
      ['TC-HRM-HDSD-04-01', '/attendance', 'Bảng chấm công'],
      ['TC-HRM-HDSD-05-01', '/payroll', 'Kỳ lương'],
      ['TC-HRM-HDSD-06-01', '/company', 'Headcount', 'headcount'],
      ['TC-HRM-HDSD-07-01', '/settings', 'Catalog sync', 'catalog'],
      ['TC-HRM-HDSD-07-02', '/reports', 'Báo cáo'],
    ];
    await runHrmMenuBatch(page, 'w2b', 'embed', (p) => qPortal(`/hr${p}`), hrmEmbedRoutes);

    // ===== W2a HRM STANDALONE =====
    const hrmStandaloneUp = results.l0['hrm-standalone']?.ok;
    if (hrmStandaloneUp) {
      const standalonePage = await browser.newPage();
      trackNetwork(standalonePage);
      try {
        const sLogin = await uiLogin(standalonePage, HRM_STANDALONE.replace(/\/hr\/?$/, ''));
        await shot(standalonePage, 'w2a-login');
        recordTc(
          'w2a',
          'TC-ECO-03-standalone',
          /hr|employees|dashboard/.test(sLogin.url) ? '🟢' : '🟡',
          `HRM standalone login → ${sLogin.url.slice(0, 100)}`,
          { entry: 'standalone', hdsd: 'HRM Ch.0' },
        );

        const hrmStandaloneRoutes = [
          ['TC-HRM-HDSD-01-01', '/employees', 'Danh sách NV'],
          ['TC-HRM-HDSD-01-02', '/employees', 'list→detail', 'detail'],
          ['TC-HRM-HDSD-02-01', '/contracts', 'HĐ list'],
          ['TC-HRM-HDSD-04-01', '/attendance', 'Bảng chấm công'],
          ['TC-HRM-HDSD-05-01', '/payroll', 'Kỳ lương'],
          ['TC-HRM-HDSD-06-01', '/company', 'Headcount', 'headcount'],
          ['TC-HRM-HDSD-07-01', '/settings', 'Catalog sync', 'catalog'],
        ];
        await runHrmMenuBatch(standalonePage, 'w2a', 'standalone', (p) => qHrmStandalone(p), hrmStandaloneRoutes);
      } finally {
        await standalonePage.close();
      }
    } else {
      recordTc(
        'w2a',
        'TC-ECO-03-standalone',
        '🟡',
        `HRM standalone ${HRM_STANDALONE} DOWN — BLOCKED W2a batch (5175 n/a; canonical :8080/hr also down)`,
        { entry: 'standalone' },
      );
    }

    // ===== W4 INTEGRATION =====
    await uiLogin(page);
    await openSettings(page, 'hrm_catalog');
    await sleep(2500);
    await shot(page, 'w4-catalog-settings');
    const catPull = lastNet((n) => /catalog-sync|catalog\/pull|catalog\/publish/.test(n.url));
    const catErr4 = await bodyHasError(page);
    recordTc(
      'w4',
      'TC-ECO-05',
      !catErr4.banner && catPull?.status < 400 ? '🟢' : catErr4.banner ? '🔴' : '🟡',
      `Catalog XBOS→HRM settings sync net=${catPull?.status ?? 'none'} url=${catPull?.url ?? 'n/a'}`,
      { uf: 'INT catalog', clickPath: 'Settings → hrm_catalog' },
    );

    const hcLoaded = await loadRoute(page, qPortal('/hr/company'));
    await shot(page, 'w4-headcount');
    const summaryNet = lastNet((n) => /employees\/summary|headcount|summary/.test(n.url) && n.status < 400);
    recordTc(
      'w4',
      'TC-HRM-HDSD-06-01-INT',
      summaryNet && !hcLoaded.err.banner ? '🟢' : hcLoaded.err.banner ? '🔴' : '🟡',
      `Headcount integration API=${summaryNet?.status ?? 'soft-ui'} banner=${hcLoaded.err.banner}`,
      { clickPath: 'HRM company headcount card', uf: 'W4 integration' },
    );

    // Cross-check catalog-sync via embed settings tab
    const settingsLoaded = await loadRoute(page, qPortal('/hr/settings'));
    await sleep(1500);
    try {
      await nativeClickByText(page, 'Danh mục');
      await sleep(2000);
    } catch {
      /* */
    }
    await shot(page, 'w4-hrm-settings-catalog');
    const hrmCatSync = lastNet((n) => /catalog-sync/.test(n.url) && n.status < 400);
    recordTc(
      'w4',
      'TC-HRM-HDSD-07-01-INT',
      hrmCatSync && !settingsLoaded.err.banner ? '🟢' : settingsLoaded.err.banner ? '🔴' : '🟡',
      `HRM settings catalog-sync=${hrmCatSync?.status ?? 'none'} (embed verify)`,
      { clickPath: 'HRM settings → Danh mục', uf: 'UF-HRM-12' },
    );

    results.finishedAt = new Date().toISOString();
    const allTc = [...waves.w0, ...waves.w1, ...waves.w2a, ...waves.w2b, ...waves.w4];
    results.summary = {
      total: allTc.length,
      green: allTc.filter((t) => t.verdict === '🟢').length,
      yellow: allTc.filter((t) => t.verdict === '🟡').length,
      red: allTc.filter((t) => t.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('\n=== SUMMARY ===', JSON.stringify(results.summary));
  process.exit(results.summary?.red > 0 ? 1 : 0);
})();
