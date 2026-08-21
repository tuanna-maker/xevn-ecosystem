/**
 * BUILD-GAP-HRM-COMPANY-EMP-COUNT-01-QA — Company L2 load (U65 · zero-seed)
 */
import { chromium } from 'playwright';
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
const WORK_ITEM = 'BUILD-GAP-HRM-COMPANY-EMP-COUNT-01-QA';
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-build-gap-hrm-company-emp-count-01-qa-runtime.json',
);
const SCREEN_DIR = resolve(
  ROOT,
  'docs/qa/evidence/screens/build-gap-hrm-company-emp-count-01-qa',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: WORK_ITEM,
  uf_id: 'BUILD_GAP-L2-company-emp-count',
  spec_ref: 'UC-HRM-03 · BR-INT-05 · HRM_MENU_DATA_LINKAGE_MATRIX §2.2 /company',
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, EMAIL, companyId: 'main' },
  clicks: [],
  network: [],
  moduleRequests: [],
  consoleErrors: [],
  pageErrors: [],
  viteOverlay: false,
  screens: [],
  ac: {},
  ack_status: 'PENDING',
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(action, detail = {}) {
  results.clicks.push({ at: ts(), action, ...detail });
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(String(msg.text()).slice(0, 320));
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 320)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/employees\/summary|hrmCompanyEmployeeCount|CompanyManagement|group-member-units|\/hr\/src\//.test(
          u,
        )
      )
        return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      };
      if (/\/api\/hrm\/employees\/summary|group-member-units/.test(u)) results.network.push(entry);
      if (/hrmCompanyEmployeeCount|CompanyManagement\.tsx/.test(u))
        results.moduleRequests.push(entry);
      save();
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
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
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
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId) {
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
}

async function readViteFail(page) {
  const viteText = await page.evaluate(() => {
    const el = document.querySelector('vite-error-overlay');
    return el ? el.textContent?.slice(0, 500) : '';
  });
  const html = await page.content();
  const bad =
    !!viteText ||
    /Failed to resolve import.*hrmCompanyEmployeeCount|hrmCompanyEmployeeCount.*ENOENT|Internal server error/i.test(
      html,
    );
  return { bad, viteText: viteText.slice(0, 200), htmlHit: /hrmCompanyEmployeeCount/i.test(html) };
}

/** NV cells should be digit-grouped number or em-dash, not raw broken import text */
function countDisplayLooksValid(body) {
  const hasTotalCard =
    /Tổng nhân viên|totalEmployees|tổng nhân viên/i.test(body) ||
    /Tổng công ty|totalCompanies/i.test(body);
  const hasCompanyShell = /Công ty|company|ĐVTV|operating/i.test(body);
  const hasEmDashOrNumber = /—|\d[\d.,]*/.test(body);
  return { hasTotalCard, hasCompanyShell, hasEmDashOrNumber };
}

async function main() {
  const session = await loginApi();
  click('login-api', { email: EMAIL, ok: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then((c) => c.newPage());
  track(page);
  await injectPortalAuth(page, session);

  const companyUrl = q('/hr/company');
  await page.goto(companyUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(5000);
  click('goto-company', { url: page.url(), target: companyUrl });
  await shot(page, '01-company-load');

  const vite1 = await readViteFail(page);
  results.viteOverlay = vite1.bad;

  const body1 = await page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
  const display1 = countDisplayLooksValid(body1);
  const hasForbiddenStub = /chưa triển khai|not implemented|undeployed/i.test(body1);
  const hasHrmApiBanner = /HRM API.*ERROR|Sync ERROR|request failed \(500\)/i.test(body1);

  const summaryGets = results.network.filter(
    (n) => n.method === 'GET' && /employees\/summary|group-member-units/.test(n.url),
  );
  const summary5xx = summaryGets.filter((n) => n.status >= 500);
  const module5xx = results.moduleRequests.filter((n) => n.status >= 500);

  results.ac.initial_load = {
    vite1,
    display1,
    hasForbiddenStub,
    hasHrmApiBanner,
    bodySnippet: body1.slice(0, 600),
    summaryGets,
    summary5xx: summary5xx.map((n) => n.status),
    module5xx: module5xx.map((n) => n.status),
  };

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  click('f5-reload');
  await shot(page, '02-company-after-f5');

  const vite2 = await readViteFail(page);
  const body2 = await page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
  const display2 = countDisplayLooksValid(body2);

  results.ac.f5 = {
    vite2,
    display2,
    bodySnippet: body2.slice(0, 400),
  };

  const moduleConsole = results.consoleErrors.some((e) =>
    /hrmCompanyEmployeeCount|Failed to resolve/i.test(e),
  );
  const modulePageErr = results.pageErrors.some((e) =>
    /hrmCompanyEmployeeCount|Failed to resolve/i.test(e),
  );

  const summary2xxWhenCalled =
    summaryGets.length === 0 || summaryGets.some((n) => n.status >= 200 && n.status < 300);

  const pass =
    !results.viteOverlay &&
    !vite2.bad &&
    !moduleConsole &&
    !modulePageErr &&
    !hasForbiddenStub &&
    !hasHrmApiBanner &&
    summary5xx.length === 0 &&
    module5xx.length === 0 &&
    display1.hasCompanyShell &&
    (display1.hasTotalCard || display1.hasEmDashOrNumber) &&
    summary2xxWhenCalled &&
    display2.hasCompanyShell;

  results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.finishedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ ack_status: results.ack_status, ac: results.ac }, null, 2));
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  results.runError = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  console.error(e);
  process.exit(2);
});
