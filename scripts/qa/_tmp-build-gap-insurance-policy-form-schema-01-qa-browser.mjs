/**
 * BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01-QA — Insurance L2 + prior BUILD_GAP mount regression (U65)
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
const WORK_ITEM = 'BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01-QA';
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-build-gap-insurance-policy-form-schema-01-qa-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/build-gap-insurance-policy-form-schema-01-qa');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const REGRESSION_ROUTES = [
  { id: 'decisions', path: '/hr/decisions' },
  { id: 'performance', path: '/hr/performance' },
  { id: 'contracts', path: '/hr/contracts' },
  { id: 'payroll', path: '/hr/payroll' },
  { id: 'company', path: '/hr/company' },
];

const results = {
  work_item_id: WORK_ITEM,
  uf_id: 'BUILD_GAP-L2-insurance',
  spec_ref: 'BA_ERP_E3 FR-HRM-INS-DEPTH-E3-01 · insurancePolicyFormSchema restore',
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, EMAIL, companyId: 'main' },
  clicks: [],
  network: [],
  moduleRequests: [],
  storm54321: [],
  consoleErrors: [],
  pageErrors: [],
  viteOverlay: false,
  screens: [],
  regression: {},
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
  page.on('response', (res) => {
    try {
      const u = res.url();
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (/54321/.test(u)) {
        results.storm54321.push({ at: ts(), status: res.status(), url: u.slice(0, 200) });
      }
      const entry = {
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      };
      if (/\/api\/hrm\/(insurance|policies)|insurance-polic/i.test(u)) {
        results.network.push(entry);
      }
      if (
        /insurancePolicyFormSchema|InsurancePolicyMasterPanel|Insurance\.tsx|\/hr\/src\//.test(u)
      ) {
        if (/insurancePolicyFormSchema|InsurancePolicyMasterPanel|Insurance\.tsx/.test(u)) {
          results.moduleRequests.push(entry);
        }
      }
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
    /Failed to resolve import.*insurancePolicyFormSchema|insurancePolicyFormSchema.*ENOENT|Internal server error/i.test(
      html,
    );
  return {
    bad,
    viteText: (viteText || '').slice(0, 200),
    htmlHit: /insurancePolicyFormSchema/i.test(html) && /Failed to resolve|ENOENT/i.test(html),
  };
}

async function mountProbe(page, id, path) {
  const url = q(path);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const vite = await readViteFail(page);
  const body = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) || '');
  const pageErrResolve = results.pageErrors.some((e) => /Failed to resolve import/i.test(e));
  const consoleResolve = results.consoleErrors.some((e) => /Failed to resolve import/i.test(e));
  const ok = !vite.bad && !pageErrResolve && !consoleResolve && body.length > 40;
  results.regression[id] = {
    url: page.url(),
    ok,
    viteBad: vite.bad,
    bodySnippet: body.slice(0, 220),
  };
  return ok;
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

  const insuranceUrl = q('/hr/insurance');
  await page.goto(insuranceUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  click('goto-insurance', { url: page.url(), target: insuranceUrl });
  await shot(page, '01-insurance-load');

  const vite1 = await readViteFail(page);
  results.viteOverlay = vite1.bad;

  const body1 = await page.evaluate(() => document.body?.innerText?.slice(0, 10000) || '');
  const hasInsuranceShell =
    /bảo hiểm|Bảo hiểm|insurance|chính sách/i.test(body1) ||
    (await page.locator('[data-testid="ins-policies-empty"], #insurance-policy-master-e3').count()) > 0;
  const hasPolicyPanel =
    /Chính sách bảo hiểm|Danh sách chính sách|Chưa có chính sách bảo hiểm|Tạo chính sách/i.test(body1) ||
    (await page.locator('#insurance-policy-master-e3, [data-testid="ins-policies-empty"]').count()) > 0;
  const hasEmptyOrList =
    (await page.locator('[data-testid="ins-policies-empty"]').count()) > 0 ||
    /Danh sách chính sách\s*\(\d+\)/i.test(body1) ||
    /Chưa có chính sách bảo hiểm/i.test(body1);
  const hasForbiddenStub = /chưa triển khai|not implemented|undeployed/i.test(body1);

  const module5xx = results.moduleRequests.filter((n) => n.status >= 500);
  const schemaOk = results.moduleRequests.some(
    (n) => /insurancePolicyFormSchema/.test(n.url) && n.status >= 200 && n.status < 400,
  );
  const schema5xx = results.moduleRequests.filter(
    (n) => /insurancePolicyFormSchema/.test(n.url) && n.status >= 400,
  );

  results.ac.initial_load = {
    vite1,
    hasInsuranceShell,
    hasPolicyPanel,
    hasEmptyOrList,
    hasForbiddenStub,
    bodySnippet: body1.slice(0, 600),
    module5xx: module5xx.map((n) => ({ status: n.status, url: n.url })),
    schemaOk,
    schema5xx: schema5xx.map((n) => n.status),
    storm54321_count: results.storm54321.length,
  };

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  click('f5-reload');
  await shot(page, '02-insurance-after-f5');

  const vite2 = await readViteFail(page);
  const body2 = await page.evaluate(() => document.body?.innerText?.slice(0, 8000) || '');
  const panelAfterF5 =
    /Chính sách bảo hiểm|Danh sách chính sách|Chưa có chính sách bảo hiểm|Tạo chính sách/i.test(body2) ||
    (await page.locator('#insurance-policy-master-e3, [data-testid="ins-policies-empty"]').count()) > 0;

  results.ac.f5 = {
    vite2,
    panelAfterF5,
    bodySnippet: body2.slice(0, 400),
    storm54321_count: results.storm54321.length,
  };

  for (const r of REGRESSION_ROUTES) {
    const beforeLen = results.pageErrors.length;
    const beforeConsole = results.consoleErrors.length;
    await mountProbe(page, r.id, r.path);
    // isolate resolve-fail attribution to this probe window
    const newResolve =
      results.pageErrors.slice(beforeLen).some((e) => /Failed to resolve import/i.test(e)) ||
      results.consoleErrors.slice(beforeConsole).some((e) => /Failed to resolve import/i.test(e));
    if (newResolve) results.regression[r.id].ok = false;
    results.regression[r.id].newResolveFail = newResolve;
  }
  await shot(page, '03-regression-last-route');

  const resolveConsole = results.consoleErrors.some((e) =>
    /insurancePolicyFormSchema|Failed to resolve/i.test(e),
  );
  const resolvePageErr = results.pageErrors.some((e) =>
    /insurancePolicyFormSchema|Failed to resolve/i.test(e),
  );
  const regressionAllOk = REGRESSION_ROUTES.every((r) => results.regression[r.id]?.ok);

  const pass =
    !results.viteOverlay &&
    !vite2.bad &&
    !resolveConsole &&
    !resolvePageErr &&
    !hasForbiddenStub &&
    module5xx.length === 0 &&
    schema5xx.length === 0 &&
    results.storm54321.length === 0 &&
    hasInsuranceShell &&
    hasPolicyPanel &&
    hasEmptyOrList &&
    panelAfterF5 &&
    regressionAllOk;

  results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.finishedAt = ts();
  results.ac.pass_gates = {
    noViteOverlay: !results.viteOverlay && !vite2.bad,
    noResolveFail: !resolveConsole && !resolvePageErr,
    panelVisible: hasPolicyPanel && hasEmptyOrList,
    f5Stable: panelAfterF5,
    no54321: results.storm54321.length === 0,
    regressionAllOk,
  };
  save();
  await browser.close();
  console.log(
    JSON.stringify(
      {
        ack_status: results.ack_status,
        ac: results.ac.pass_gates,
        schemaOk,
        regression: Object.fromEntries(
          Object.entries(results.regression).map(([k, v]) => [k, { ok: v.ok, viteBad: v.viteBad }]),
        ),
        screens: results.screens.map((s) => s.name),
      },
      null,
      2,
    ),
  );
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  results.runError = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  console.error(e);
  process.exit(2);
});
