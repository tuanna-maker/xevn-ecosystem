/**
 * QA-PCOMP-W6-PREP-01 — W6 prep browser smoke after tenant-master reset
 * U65 zero-seed · HOLD_DEPLOY · employees=0 baseline · org-foundation spot
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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-pcomp-w6-prep-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-pcomp-w6-prep-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-PCOMP-W6-PREP-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, hold_deploy: true, reset_ref: 'd-dev-reset-tenant-master-01-20260730.md' },
  baseline: {},
  steps: [],
  network: [],
  screens: [],
  journeys: {},
  hardFails: [],
  verdict: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail, extra = {}) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString(), ...extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  if (!ok) results.hardFails.push({ id, detail });
  save();
  return ok;
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    status: r.status,
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data?.user ?? { userId: EMAIL, email: EMAIL, displayName: 'CEO Tập đoàn', roles: ['group_ceo'] },
    raw: data,
  };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(url)) return;
    if (res.request().method() === 'OPTIONS') return;
    let bodySnippet = '';
    try {
      bodySnippet = (await res.text()).slice(0, 200);
    } catch {
      /* */
    }
    results.network.push({
      method: res.request().method(),
      status: res.status(),
      url: url.replace(PORTAL, '').slice(0, 240),
      bodySnippet,
      at: new Date().toISOString(),
    });
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!/\/api\/(hrm|xbos)\//.test(url)) return;
    results.network.push({
      method: req.method(),
      status: 0,
      url: url.replace(PORTAL, '').slice(0, 240),
      failure: req.failure()?.errorText || 'failed',
      at: new Date().toISOString(),
    });
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path);
  return path;
}

async function pageHasErrorBanner(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return (
      /HRM API Sync ERROR|companyId mismatches token scope|ERR_CONNECTION_REFUSED/i.test(text) ||
      /409.*scope|54321/.test(text)
    );
  });
}

async function fetchBaseline(token) {
  const h = { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const emp = await fetch(`${PORTAL}/api/hrm/employees?page_size=5&company_id=main`, { headers: h });
  const empJ = await emp.json();
  const gmu = await fetch(`${PORTAL}/api/xbos/tenant-scope/group-member-units`, { headers: h });
  const gmuJ = await gmu.json();
  results.baseline = {
    employees: { status: emp.status, total: empJ?.data?.total ?? empJ?.total ?? null },
    groupMemberUnits: { status: gmu.status, count: Array.isArray(gmuJ?.data) ? gmuJ.data.length : null },
  };
  save();
}

const HRM_TABS = [
  { id: 'P-CC-03', path: '/command-center/hrm/employees', label: 'employees' },
  { id: 'P-CC-04', path: '/command-center/hrm/contracts', label: 'contracts' },
  { id: 'P-CC-05', path: '/command-center/hrm/insurance', label: 'insurance' },
  { id: 'P-CC-06', path: '/command-center/hrm/recruitment', label: 'recruitment' },
  { id: 'P-CC-07', path: '/command-center/hrm/attendance', label: 'attendance' },
  { id: 'P-CC-08', path: '/command-center/hrm/payroll', label: 'payroll' },
  { id: 'P-CC-CO', path: '/command-center/hrm/company', label: 'company' },
];

async function main() {
  const session = await loginApi();
  note('login-api', session.status >= 200 && session.status < 300, `HTTP ${session.status} token ok`);
  await fetchBaseline(session.token);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    trackNetwork(page);
    await injectSession(page, session);

    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(2500);
    const ccUrl = page.url();
    const ccBanner = await pageHasErrorBanner(page);
    await shot(page, '01-command-center');
    note('cc-load', ccUrl.includes('/command-center') && !ccBanner, `url=${ccUrl} banner=${ccBanner}`);

    for (const tab of HRM_TABS) {
      const url = `${PORTAL}${tab.path}?portal=1&tenantId=xevn&companyId=main`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
      await sleep(2000);
      const banner = await pageHasErrorBanner(page);
      await shot(page, `hrm-${tab.label}`);
      note(`hrm-tab-${tab.label}`, !banner, `${tab.id} banner=${banner} url=${page.url()}`);
    }

    // J-* org-foundation spot: group-member-units → first unit if rows exist
    await page.goto(`${PORTAL}/command-center/settings/group-member-units?portal=1&tenantId=xevn&companyId=main`, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });
    await sleep(2500);
    await shot(page, 'j-cc-org-gmu-list');
    const gmuNav = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"], table tr')).filter((r) => {
        const t = (r.textContent || '').trim();
        return t.length > 5 && !/không có|no data|stt/i.test(t.slice(0, 20));
      });
      if (!rows.length) return { ok: true, skipped: true, reason: 'empty list valid post-reset' };
      rows[0].click();
      return { ok: true, skipped: false, rowText: (rows[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) };
    });
    await sleep(2000);
    await shot(page, 'j-cc-org-gmu-after-click');
    results.journeys['J-CC-ORG-GMU'] = gmuNav;
    note(
      'j-cc-org-gmu',
      gmuNav.ok !== false,
      gmuNav.skipped ? `SKIP empty (valid U65)` : `clicked row: ${gmuNav.rowText}`,
    );

    // J-HRM-CO-01 company tab — org-foundation headcount baseline 0
    const coNet = results.network.filter((n) => n.url.includes('/employees/summary') || n.url.includes('/company'));
    results.journeys['J-HRM-CO-01'] = {
      baseline_total: results.baseline.employees?.total,
      summaryCalls: coNet.slice(-3),
      verdict: results.baseline.employees?.total === 0 ? 'EMPTY_VALID' : 'HAS_DATA',
    };
    note(
      'j-hrm-co-01-baseline',
      results.baseline.employees?.total === 0,
      `employees.total=${results.baseline.employees?.total} (post-reset expect 0)`,
    );

    // J-HRM list→detail spot — BLOCKED when no rows (document, not FAIL)
    results.journeys['J-HRM-01..07'] = {
      status: 'BLOCKED_NO_DATA',
      reason: 'employees=0 post-reset; list→detail deferred to sponsor FE mutate (U65)',
      hrm_tabs_loaded: HRM_TABS.map((t) => t.id),
    };
    note('j-hrm-l25-spot', true, 'list→detail BLOCKED (no employee rows) — tabs load PASS');

    const econn28002 = results.network.filter(
      (n) => n.failure?.includes('28002') || (n.status === 0 && n.url.includes('/api/xbos/')),
    );
    const scope409 = results.network.filter((n) => n.status === 409);
    const api5xx = results.network.filter((n) => n.status >= 500);
    note('no-econnrefused-28002', econn28002.length === 0, `failures=${econn28002.length}`);
    note('no-409-scope', scope409.length === 0, `409 count=${scope409.length}`);
    note('no-5xx-load', api5xx.length === 0, `5xx count=${api5xx.length}`);

    results.verdict = results.hardFails.length === 0 ? 'READY' : 'BLOCKED';
    results.finishedAt = new Date().toISOString();
    save();
    console.log('\n=== VERDICT:', results.verdict, 'hardFails=', results.hardFails.length, '===');
    process.exit(results.hardFails.length === 0 ? 0 : 1);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  note('fatal', false, e.message);
  results.verdict = 'BLOCKED';
  save();
  console.error(e);
  process.exit(1);
});
