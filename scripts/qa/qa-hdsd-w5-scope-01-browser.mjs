/**
 * QA-HDSD-W5-SCOPE-01 — W5 member vs group CEO scope negative (TC-XBOS-HDSD-M01 · TC-HRM-HDSD-M01)
 * U65 zero-seed · portal :5173 · du-lich.ceo@xe.vn + ceo@xe.vn contrast
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const GROUP_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-w5-scope-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-hdsd-w5-scope-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-W5-SCOPE-01',
  program: 'P-HDSD-ECOSYSTEM-03 · W5',
  startedAt: new Date().toISOString(),
  env: { PORTAL, u65: 'zero-seed' },
  l0: {},
  tc: {},
  contrast: {},
  network: [],
  consoleErrors: [],
  ack_status: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function trackNetwork(page, tag) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      if (res.request().method() === 'OPTIONS') return;
      results.network.push({
        tag,
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(`[${tag}] ${msg.text().slice(0, 280)}`);
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path.replace(/\\/g, '/');
}

async function loginApi(email) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${PORTAL}/api/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (token) {
        return {
          status: r.status,
          token,
          user: data?.user ?? { email },
          tenantId: data?.user?.tenantId ?? data?.tenantId,
          companyId: data?.user?.companyId ?? data?.companyId,
        };
      }
    } catch {
      /* */
    }
  }
  throw new Error(`login failed for ${email}`);
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 30000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 10 });
}

async function injectPortalSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.user?.tenantId || s.tenantId || 'xevn');
      store.setItem('xevn.portal.companyId', s.user?.companyId || s.companyId || 'main');
    }
  }, session);
}

async function uiLogin(page, email) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', email);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  const idx = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2500);
  const loginNet = results.network.slice(idx).find((n) => /auth\/login/.test(n.url));
  const storage = await page.evaluate(() => ({
    token: !!localStorage.getItem('xevn.portal.accessToken'),
    tenant: localStorage.getItem('xevn.portal.tenantId'),
    company: localStorage.getItem('xevn.portal.companyId'),
    url: location.href,
  }));
  return { loginNet, storage, url: page.url() };
}

async function apiFetch(token, path, opts = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    accept: 'application/json',
    ...(opts.headers || {}),
  };
  const r = await fetch(`${PORTAL}${path}`, { ...opts, headers });
  let body = '';
  try {
    body = JSON.stringify(await r.json()).slice(0, 320);
  } catch {
    /* */
  }
  return { status: r.status, body, url: path };
}

function isNegativeScope(status) {
  return status === 403 || status === 409;
}

(async () => {
  console.log('=== QA-HDSD-W5-SCOPE-01 ===', PORTAL);

  for (const [name, url] of [
    ['hrm-api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos-api', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', `${PORTAL}/`],
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

  try {
    // ===== Member CEO — TC-XBOS-HDSD-M01 + TC-HRM-HDSD-M01 =====
    const memberSession = await loginApi(MEMBER_EMAIL);
    results.tc.memberLoginApi = {
      email: MEMBER_EMAIL,
      status: memberSession.status,
      tenantId: memberSession.tenantId,
      companyId: memberSession.companyId,
    };

    const memberHeaders = {
      Authorization: `Bearer ${memberSession.token}`,
      'x-tenant-id': memberSession.user?.tenantId || 'xe-du-lich',
      'x-company-id': 'main',
    };

    const memberNeg = {
      gmu: await apiFetch(memberSession.token, '/api/xbos/tenant-scope/group-member-units', {
        headers: memberHeaders,
      }),
      kpiHolding: await apiFetch(
        memberSession.token,
        '/api/xbos/kpi-engine/rollup?companyId=holding',
        { headers: memberHeaders },
      ),
      kpiMain: await apiFetch(memberSession.token, '/api/xbos/kpi-engine/rollup?companyId=main', {
        headers: memberHeaders,
      }),
      hrmHolding: await apiFetch(memberSession.token, '/api/hrm/employees?company_id=holding', {
        headers: memberHeaders,
      }),
      workspaceMeta: await apiFetch(
        memberSession.token,
        '/api/xbos/command-center/workspace-meta?tenantId=xe-du-lich&companyId=main',
        { headers: memberHeaders },
      ),
    };

    const memPage = await browser.newPage();
    trackNetwork(memPage, 'member');
    const memUiLogin = await uiLogin(memPage, MEMBER_EMAIL);
    await shot(memPage, 'member-after-login');

    await memPage.goto(q('/command-center'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const ccBody = await memPage.evaluate(() => ({
      scopeBanner: /Phạm vi tenant|companyId mismatches|403|409/i.test(document.body?.innerText || ''),
      snip: (document.body?.innerText || '').slice(0, 400).replace(/\s+/g, ' '),
    }));
    await shot(memPage, 'member-command-center');

    await memPage.goto(
      `${PORTAL}/command-center/hrm/employees?portal=1&tenantId=xe-du-lich&companyId=main`,
      { waitUntil: 'domcontentloaded', timeout: 90000 },
    );
    await sleep(4000);
    const hrmBody = await memPage.evaluate(() => {
      const t = document.body?.innerText || '';
      const m = t.match(/(\d+)\s*(?:nhân viên|NV|employees)/i);
      return {
        employeeHint: m ? m[0] : null,
        syncError: /HRM API Sync ERROR|Sync ERROR/i.test(t),
        scopeBanner: /Phạm vi tenant|companyId mismatches/i.test(t),
        snip: t.slice(0, 500).replace(/\s+/g, ' '),
      };
    });
    const memberEmpNet = [...results.network]
      .reverse()
      .find((n) => n.tag === 'member' && /\/api\/hrm\/employees(\?|$)/.test(n.url) && n.method === 'GET');
    await shot(memPage, 'member-hrm-employees');
    await memPage.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const f5Token = await memPage.evaluate(() => !!localStorage.getItem('xevn.portal.accessToken'));

    const xbosNegOk =
      isNegativeScope(memberNeg.gmu.status) && isNegativeScope(memberNeg.kpiHolding.status);
    const hrmNegOk = isNegativeScope(memberNeg.hrmHolding.status);
    const memberSessionOk =
      memUiLogin.storage.token && f5Token && memUiLogin.url.indexOf('/login') === -1;
    const workspaceOk = memberNeg.workspaceMeta.status >= 200 && memberNeg.workspaceMeta.status < 300;
    const hrmLoadOk = !hrmBody.syncError && !hrmBody.scopeBanner && memberSessionOk;

    results.tc['TC-XBOS-HDSD-M01'] = {
      tc_id: 'TC-XBOS-HDSD-M01',
      uf: 'UF-XBOS-11',
      persona: MEMBER_EMAIL,
      click_path: '/login → /command-center',
      network: {
        login: memUiLogin.loginNet,
        gmu: memberNeg.gmu,
        kpiHolding: memberNeg.kpiHolding,
        kpiMain: memberNeg.kpiMain,
      },
      fe: ccBody,
      verdict: xbosNegOk && memberSessionOk ? '🟢' : '🔴',
      detail: xbosNegOk
        ? `GMU ${memberNeg.gmu.status} · KPI holding ${memberNeg.kpiHolding.status} — scope negative PASS`
        : `Expected 403/409 — got GMU ${memberNeg.gmu.status} KPI ${memberNeg.kpiHolding.status}`,
    };

    save();

    results.tc['TC-HRM-HDSD-M01'] = {
      tc_id: 'TC-HRM-HDSD-M01',
      uf: 'UF-HRM-13',
      persona: MEMBER_EMAIL,
      click_path: '/login → /command-center/hrm/employees (xe-du-lich/main)',
      network: {
        workspaceMeta: memberNeg.workspaceMeta,
        hrmHolding: memberNeg.hrmHolding,
        hrmEmbedGet: memberEmpNet || null,
      },
      fe: { ...hrmBody, f5Token },
      verdict:
        hrmNegOk && hrmLoadOk && workspaceOk
          ? '🟢'
          : hrmLoadOk && workspaceOk && !hrmNegOk
            ? '🔴'
            : hrmLoadOk
              ? '🟡'
              : '🔴',
      detail: hrmNegOk
        ? `holding employees ${memberNeg.hrmHolding.status} blocked · member embed OK · F5 token=${f5Token}`
        : `holding scope leak or load fail — holding ${memberNeg.hrmHolding.status}`,
    };

    save();
    await memPage.close();

    // ===== Group CEO contrast =====
    const groupSession = await loginApi(GROUP_EMAIL);
    const groupHeaders = {
      Authorization: `Bearer ${groupSession.token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    };
    results.contrast = {
      email: GROUP_EMAIL,
      gmu: await apiFetch(groupSession.token, '/api/xbos/tenant-scope/group-member-units', {
        headers: groupHeaders,
      }),
      kpiHolding: await apiFetch(groupSession.token, '/api/xbos/kpi-engine/rollup?companyId=holding', {
        headers: groupHeaders,
      }),
      employeesMain: await apiFetch(groupSession.token, '/api/hrm/employees?company_id=main', {
        headers: groupHeaders,
      }),
    };

    const groupPage = await browser.newPage();
    trackNetwork(groupPage, 'group');
    await injectPortalSession(groupPage, groupSession);
    await groupPage.goto(q('/command-center/hrm/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const groupHrm = await groupPage.evaluate(() => {
      const t = document.body?.innerText || '';
      const m = t.match(/(\d+)\s*(?:nhân viên|NV|employees)/i);
      return { employeeHint: m ? m[0] : null, snip: t.slice(0, 300).replace(/\s+/g, ' ') };
    });
    await shot(groupPage, 'group-hrm-employees');
    await groupPage.close();

    const contrastOk =
      results.contrast.gmu.status >= 200 &&
      results.contrast.gmu.status < 300 &&
      results.contrast.kpiHolding.status >= 200 &&
      results.contrast.kpiHolding.status < 300;

    results.contrast.groupHrmFe = groupHrm;
    results.contrast.contrastValid = contrastOk;

    const hardFail =
      results.tc['TC-XBOS-HDSD-M01'].verdict === '🔴' ||
      results.tc['TC-HRM-HDSD-M01'].verdict === '🔴' ||
      !contrastOk ||
      results.consoleErrors.some((e) => /ERR_CONNECTION_REFUSED|:54321/.test(e));

    results.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    results.finishedAt = new Date().toISOString();
    save();

    console.log('TC-XBOS-HDSD-M01', results.tc['TC-XBOS-HDSD-M01'].verdict, results.tc['TC-XBOS-HDSD-M01'].detail);
    console.log('TC-HRM-HDSD-M01', results.tc['TC-HRM-HDSD-M01'].verdict, results.tc['TC-HRM-HDSD-M01'].detail);
    console.log('Contrast group GMU', results.contrast.gmu.status, 'KPI', results.contrast.kpiHolding.status);
    console.log('ACK', results.ack_status);
    process.exit(hardFail ? 1 : 0);
  } finally {
    await browser.close();
  }
})();
