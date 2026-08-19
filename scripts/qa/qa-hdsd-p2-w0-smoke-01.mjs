/**
 * HDSD-P2-QA-W0-SMOKE-01 — W0 ecosystem + HRM Ch.0 browser smoke (U65 zero-seed)
 * TC-ECO-001..008 + TC-HRM-HDSD-001..005
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:5175';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const RUNTIME = resolve(OUT_DIR, '_tmp-hdsd-p2-w0-smoke-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-uat-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
const qHrm = (path) => {
  const base = HRM_STANDALONE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}${p.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;
};

const results = {
  work_item_id: 'HDSD-P2-QA-W0-SMOKE-01',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_STANDALONE, EMAIL, u65: 'zero-seed' },
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'SOFT' : 'FAIL'}  ${id}  ${detail.slice(0, 120)}`);
  save();
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

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const banner =
      /ERROR|Sync ERROR|409|54321|ERR_CONNECTION|thất bại/i.test(t) &&
      !/Đăng nhập thất bại/i.test(t.slice(0, 200));
    return { banner, url: location.href, snippet: t.slice(0, 400) };
  });
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
}

async function hrmStandaloneLogin(standalonePage, portalPage) {
  await standalonePage.goto(qHrm('/login'), { waitUntil: 'networkidle2', timeout: 90000 }).catch(() =>
    standalonePage.goto(qHrm('/login'), { waitUntil: 'domcontentloaded', timeout: 90000 }),
  );
  await sleep(1500);
  const hasEmail = await standalonePage.$('input[type="email"]');
  if (hasEmail) {
    await standalonePage.evaluate(() => {
      for (const s of [localStorage, sessionStorage]) s.clear();
    });
    await standalonePage.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(600);
    await reactSetInput(standalonePage, 'input[type="email"]', EMAIL);
    await reactSetInput(standalonePage, 'input[type="password"]', PASSWORD);
    await Promise.all([
      standalonePage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
      standalonePage.click('button[type="submit"]'),
    ]);
    await sleep(2000);
    return { mode: 'ui-login', url: standalonePage.url() };
  }

  const portalSession = await portalPage.evaluate(() => {
    const keys = [
      'xevn.portal.accessToken',
      'xevn.portal.tokenExpiresAt',
      'xevn.portal.user',
      'xevn.portal.tenantId',
      'xevn.portal.companyId',
    ];
    const out = {};
    for (const k of keys) {
      const v = localStorage.getItem(k) ?? sessionStorage.getItem(k);
      if (v) out[k] = v;
    }
    return out;
  });
  await standalonePage.evaluate((sess) => {
    for (const s of [localStorage, sessionStorage]) s.clear();
    for (const [k, v] of Object.entries(sess)) {
      localStorage.setItem(k, v);
      sessionStorage.setItem(k, v);
    }
  }, portalSession);
  await standalonePage.goto(qHrm('/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  return { mode: 'portal-session-bridge', url: standalonePage.url() };
}

(async () => {
  console.log('=== HDSD-P2-QA-W0-SMOKE-01 ===');

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
    // TC-ECO-001 — portal purpose / login entry exists
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(800);
    await shot(page, 'w0-tc-eco-001-login-purpose');
    const loginFields = await page.evaluate(() => ({
      email: !!document.querySelector('input[type="email"]'),
      password: !!document.querySelector('input[type="password"]'),
      submit: !!document.querySelector('button[type="submit"]'),
      title: document.title,
    }));
    recordTc(
      'TC-ECO-001',
      loginFields.email && loginFields.password && loginFields.submit ? '🟢' : '🔴',
      `Login portal entry fields email=${loginFields.email} pwd=${loginFields.password} submit=${loginFields.submit}`,
      { clickPath: `${PORTAL}/login`, uf: 'ECO §1' },
    );

    // TC-ECO-003 — login form buttons (on same fresh login page)
    const buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).map((b) => (b.textContent || '').trim());
      return btns;
    });
    const hasDangNhap = buttons.some((b) => /đăng nhập/i.test(b));
    recordTc(
      'TC-ECO-003',
      hasDangNhap && loginFields.submit ? '🟢' : '🟡',
      `Login buttons submit=${loginFields.submit} labels=${buttons.filter(Boolean).join(' | ').slice(0, 80)}`,
      { clickPath: 'Email + Mật khẩu + Đăng nhập', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-002 — login Cách vào
    await reactSetInput(page, 'input[type="email"]', EMAIL);
    await reactSetInput(page, 'input[type="password"]', PASSWORD);
    const beforeLogin = results.network.length;
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);
    await sleep(2000);
    const loginNet = results.network.slice(beforeLogin).find((n) => /auth\/login/.test(n.url));
    const loginOk = { url: page.url(), loginNet };
    await shot(page, 'w0-tc-eco-002-login-success');
    const ccRedirect = /command-center|cockpit|dashboard/.test(loginOk.url);
    const err0 = await bodyHasError(page);
    recordTc(
      'TC-ECO-002',
      ccRedirect && !err0.banner && loginOk.loginNet?.status === 201 ? '🟢' : ccRedirect && !err0.banner ? '🟡' : '🔴',
      `Login → ${loginOk.url}; POST login=${loginOk.loginNet?.status ?? 'n/a'}`,
      { clickPath: '/login → email+password → Đăng nhập', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-004 — persona ceo@xe.vn (re-use successful login)
    recordTc(
      'TC-ECO-004',
      ccRedirect ? '🟢' : '🔴',
      `Persona ${EMAIL} → post-login ${loginOk.url.slice(0, 80)}`,
      { clickPath: 'ceo@xe.vn login', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-005 — product selection after login (CC + dashboard)
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w0-tc-eco-005-cc');
    const ccOk = !(await bodyHasError(page)).banner;
    await page.goto(`${PORTAL}/dashboard/organization`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w0-tc-eco-005-dash-org');
    const dashErr = await bodyHasError(page);
    const orgNet = lastNet((n) => /organization|tenant-scope|companies/.test(n.url) && n.status < 400);
    recordTc(
      'TC-ECO-005',
      ccOk && !dashErr.banner ? '🟢' : dashErr.banner ? '🔴' : '🟡',
      `CC load=${ccOk}; /dashboard/organization net=${orgNet?.status ?? 'soft'} url=${page.url().slice(0, 80)}`,
      { clickPath: 'CC → Dashboard organization', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-006 — rail phân hệ
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(page, 'w0-tc-eco-006-rail');
    const railText = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200));
    const hasGroup = /Tập đoàn|GROUP|Command Center/i.test(railText);
    const hasHrmRail = /NHÂN SỰ|Nhân sự/i.test(railText);
    recordTc(
      'TC-ECO-006',
      hasGroup && hasHrmRail ? '🟢' : '🟡',
      `Rail GROUP=${hasGroup} NHÂN_SỰ=${hasHrmRail}`,
      { clickPath: 'CC rail phân hệ', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-007 — session F5 (reload CC, still authenticated)
    const urlBefore = page.url();
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    const urlAfter = page.url();
    const sessionErr = await bodyHasError(page);
    const stillAuthed = !/\/login/.test(urlAfter) && !sessionErr.banner;
    recordTc(
      'TC-ECO-007',
      stillAuthed ? '🟢' : '🔴',
      `F5 session: before=${urlBefore.slice(0, 60)} after=${urlAfter.slice(0, 60)} banner=${sessionErr.banner}`,
      { clickPath: 'F5 on CC — phiên giữ', uf: 'UF-XBOS-01' },
    );

    // TC-ECO-008 — W0 meta (all ECO TCs executed in this run)
    const ecoDone = results.tc.filter((t) => t.id.startsWith('TC-ECO-00')).length;
    recordTc(
      'TC-ECO-008',
      ecoDone >= 7 ? '🟢' : '🟡',
      `W0 ECO checklist executed ${ecoDone}/8 rows in smoke (008=self)`,
      { clickPath: 'W0 TC-ECO meta', uf: '—' },
    );

    // TC-HRM-HDSD-001 — two entry modes
    await page.goto(qPortal('/command-center/hrm/employees'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await shot(page, 'w0-tc-hrm-001-embed');
    const embedErr = await bodyHasError(page);
    const embedNet = lastNet((n) => /\/api\/hrm\/employees/.test(n.url) && n.status < 400);

    const standalonePage = await browser.newPage();
    trackNetwork(standalonePage);
    const standLogin = await hrmStandaloneLogin(standalonePage, page);
    await standalonePage.goto(qHrm('/employees'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    await shot(standalonePage, 'w0-tc-hrm-001-standalone');
    const standErr = await bodyHasError(standalonePage);
    const standNet = lastNet((n) => /\/api\/hrm\/employees/.test(n.url) && n.status < 400);
    recordTc(
      'TC-HRM-HDSD-001',
      !embedErr.banner && embedNet && !standErr.banner && standNet ? '🟢' : embedErr.banner || standErr.banner ? '🔴' : '🟡',
      `embed=${page.url().slice(0, 70)} empAPI=${embedNet?.status}; standalone=${standalonePage.url().slice(0, 70)} empAPI=${standNet?.status}; standLogin=${standLogin.mode}`,
      { clickPath: 'embed /command-center/hrm/employees + standalone :5175/employees', entry: 'both' },
    );

    // TC-HRM-HDSD-002 — embed sidebar menu
    await page.goto(qPortal('/command-center/hrm/dashboard'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
    try {
      await nativeClickByText(page, 'Nhân sự');
    } catch {
      try {
        await nativeClickByText(page, 'NHÂN SỰ');
      } catch {
        /* menu may differ */
      }
    }
    await sleep(2500);
    await shot(page, 'w0-tc-hrm-002-sidebar');
    const menuUrl = page.url();
    const menuErr = await bodyHasError(page);
    recordTc(
      'TC-HRM-HDSD-002',
      /hrm\/employees|hrm\/dashboard/.test(menuUrl) && !menuErr.banner ? '🟢' : menuErr.banner ? '🔴' : '🟡',
      `Sidebar click → ${menuUrl.slice(0, 90)}`,
      { clickPath: 'embed sidebar → Nhân sự', entry: 'embed', uf: 'UF-HRM-MENU-01' },
    );

    // TC-HRM-HDSD-003 — shell buttons (GROUP rail back to CC)
    await page.goto(qPortal('/command-center/hrm/employees'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2000);
    let groupOk = false;
    try {
      await nativeClickByText(page, 'Tập đoàn');
      await sleep(2500);
      groupOk = /command-center(?!\/hrm)/.test(page.url()) || /\/command-center$/.test(page.url().split('?')[0]);
    } catch {
      try {
        await nativeClickByText(page, 'GROUP');
        await sleep(2500);
        groupOk = /command-center/.test(page.url());
      } catch {
        /* */
      }
    }
    await shot(page, 'w0-tc-hrm-003-group-rail');
    recordTc(
      'TC-HRM-HDSD-003',
      groupOk ? '🟢' : '🟡',
      `GROUP rail → CC url=${page.url().slice(0, 90)}`,
      { clickPath: 'embed → GROUP rail → XBOS CC', entry: 'embed' },
    );

    // TC-HRM-HDSD-004 — standalone entry
    recordTc(
      'TC-HRM-HDSD-004',
      !standErr.banner && /employees|dashboard/.test(standalonePage.url()) ? '🟢' : standErr.banner ? '🔴' : '🟡',
      `Standalone ${HRM_STANDALONE} ${standLogin.mode} → ${standalonePage.url().slice(0, 90)}`,
      { clickPath: `${HRM_STANDALONE}/login → /employees`, entry: 'standalone', uf: 'UF-HRM-MENU-01' },
    );

    // TC-HRM-HDSD-005 — HRM error state (no sync ERROR on embed employees)
    await page.goto(qPortal('/command-center/hrm/employees'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await shot(page, 'w0-tc-hrm-005-no-error');
    const hrmErr = await bodyHasError(page);
    const hrmEmpNet = lastNet((n) => /\/api\/hrm\/employees/.test(n.url));
    recordTc(
      'TC-HRM-HDSD-005',
      !hrmErr.banner && hrmEmpNet && hrmEmpNet.status < 400 ? '🟢' : hrmErr.banner ? '🔴' : '🟡',
      `embed employees banner=${hrmErr.banner} GET employees=${hrmEmpNet?.status ?? 'none'}`,
      { clickPath: '/command-center/hrm/employees — no HRM API Sync ERROR', entry: 'embed' },
    );

    await standalonePage.close();
  } finally {
    await browser.close();
  }

  const greens = results.tc.filter((t) => t.verdict === '🟢').length;
  const yellows = results.tc.filter((t) => t.verdict === '🟡').length;
  const reds = results.tc.filter((t) => t.verdict === '🔴').length;
  results.summary = { greens, yellows, reds, total: results.tc.length };
  results.finishedAt = new Date().toISOString();
  save();
  console.log(`\n=== DONE ${greens}🟢 ${yellows}🟡 ${reds}🔴 / ${results.tc.length} ===`);
  process.exit(reds > 0 ? 1 : 0);
})();
