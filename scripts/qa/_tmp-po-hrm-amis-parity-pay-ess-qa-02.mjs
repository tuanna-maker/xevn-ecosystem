#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-ESS-QA-02 — U65 browser ESS payslip confirm
 * Prior: PO-HRM-AMIS-PARITY-PAY-ESS-FE-01 READY_FOR_QA
 * AC1 GET me/payslips 200 own-only · list rows
 * AC2 open detail GET me/payslips/:id 200 · ess_confirmed present
 * AC3 POST confirm (hdsd-pay-ess-confirm) 2xx HRM-PAY-204-ESS · badge Đã xác nhận
 * AC4 F5 → still confirmed · CTA hidden
 * AC5 ceo@xe.vn same tab → GET 403 HRM-PAY-403-ESS · honest banner
 * Honesty: payroll_e2e_ready=false · zero-seed · DENIED AMIS / J-HRM-07 / module UAT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const ESS_EMAIL = process.env.QA_ESS_EMAIL || 'uat.nv0001@xe.vn';
const ESS_PASS = process.env.QA_ESS_PASSWORD || 'xevn-uat-2026';
const CEO_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const CEO_PASS = process.env.QA_PASSWORD || 'Xevn@2026';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-ess-qa-02-browser.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-ess-qa-02');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(dirname(OUT_JSON), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `PAYESSQA2-${Date.now().toString(36).toUpperCase().slice(-6)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-ESS-QA-02',
  prior: 'PO-HRM-AMIS-PARITY-PAY-ESS-FE-02',
  parent: 'PO-HRM-CONTINUOUS-W7-20260807',
  startedAt: ts(),
  stamp: STAMP,
  u65: 'zero-seed · browser-only · FE after 2xx + F5 · no API-only PASS',
  hdsd_align:
    'portal → HRM → Tiền lương → tab Phiếu của tôi (hdsd-pay-ess-tab) → open → confirm',
  honesty: {
    payroll_e2e_ready: false,
    seed_used: false,
    module_uat_claimed: false,
    amis_done_claimed: false,
    j_hrm_07_done_claimed: false,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, stamp: STAMP },
  personas: {
    ess: { email: ESS_EMAIL },
    ceo: { email: CEO_EMAIL },
  },
  l0: {},
  probes: {},
  ac: {},
  network: [],
  essNetwork: [],
  consoleErrors: [],
  pageErrors: [],
  click_log: [],
  screens: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return {};
  }
}

function q(path, companyId) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', companyId);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function mobileLogin() {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: ESS_EMAIL, password: ESS_PASS }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || j;
  const token = d.access_token || d.accessToken;
  if (!r.ok || !token) {
    throw new Error(`mobile login failed ${r.status} ${j.code || ''}`);
  }
  const claims = decodeJwt(token);
  const am = d.active_membership || d.memberships?.[0] || {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: am.company_id || claims.companyId || 'holding',
    employeeId:
      am.employee_id ||
      claims.employee_id ||
      d.employee?.id ||
      null,
    user: {
      userId: ESS_EMAIL,
      email: ESS_EMAIL,
      displayName: am.employee_name || d.employee?.full_name || ESS_EMAIL,
      roles: d.roles || ['employee'],
    },
    raw: d,
    claims,
    loginVia: 'hrm/auth/mobile/login',
  };
}

async function portalLoginCeo() {
  const urls = [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`];
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: CEO_EMAIL, password: CEO_PASS }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (!token) continue;
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: 'main',
        employeeId: null,
        user: {
          userId: u.userId || u.id || CEO_EMAIL,
          email: u.email || CEO_EMAIL,
          displayName: u.displayName || u.fullName || u.name || CEO_EMAIL,
          roles: u.roles || ['group_ceo'],
        },
        raw: data,
        claims: decodeJwt(token),
        loginVia: url,
      };
    } catch {
      /* */
    }
  }
  throw new Error('CEO portal login failed');
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    const memberships = JSON.stringify([
      {
        company_id: s.companyId,
        employee_id: s.employeeId || null,
      },
    ]);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
      store.setItem('hrm.mobile.memberships', memberships);
      if (s.raw?.refresh_token || s.raw?.refreshToken) {
        store.setItem(
          'xevn.portal.refreshToken',
          s.raw.refresh_token || s.raw.refreshToken,
        );
      }
    }
  }, session);
}

function trackEss(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/payroll\/me\/payslips/i.test(u)) return;
      const method = res.request().method();
      let json = null;
      const ct = res.headers()['content-type'] || '';
      if (/json/i.test(ct)) {
        json = await res.json().catch(() => null);
      }
      const entry = {
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
        code: json?.code || json?.data?.code || null,
        message: json?.message ? String(json.message).slice(0, 240) : null,
        total: json?.data?.total ?? (Array.isArray(json?.data?.data) ? json.data.data.length : null),
        ess_confirmed:
          json?.data?.ess_confirmed ??
          json?.data?.data?.ess_confirmed ??
          null,
        employee_confirmed_at:
          json?.data?.employee_confirmed_at ??
          json?.data?.data?.employee_confirmed_at ??
          null,
        company_id_query: (() => {
          try {
            return new URL(u).searchParams.get('company_id');
          } catch {
            return null;
          }
        })(),
      };
      R.network.push(entry);
      R.essNetwork.push(entry);
    } catch {
      /* */
    }
  });
}

async function probeEssList(token, companyId) {
  const r = await fetch(
    `${HRM}/api/hrm/payroll/me/payslips?company_id=${encodeURIComponent(companyId)}`,
    { headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': TENANT } },
  );
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data || j?.data || [];
  const list = Array.isArray(rows) ? rows : [];
  return {
    http: r.status,
    code: j.code || null,
    total: j?.data?.total ?? list.length,
    rows: list.map((x) => ({
      id: x.id,
      status: x.status,
      ess_confirmed: x.ess_confirmed,
      period_label: x.period_label,
    })),
    pending: list.filter(
      (x) =>
        (x.status === 'processed' || x.status === 'paid') && x.ess_confirmed !== true,
    ),
  };
}

async function openEssTab(page) {
  const tab = page.getByTestId('hdsd-pay-ess-tab');
  await tab.waitFor({ state: 'visible', timeout: 60_000 });
  await tab.click();
  await sleep(1500);
  return 'hdsd-pay-ess-tab';
}

function lastEss(method, pathRe) {
  const hits = R.essNetwork.filter(
    (n) => n.method === method && pathRe.test(n.url),
  );
  return hits.length ? hits[hits.length - 1] : null;
}

async function runEssHappy(browser) {
  const session = await mobileLogin();
  R.probes.essLogin = {
    ok: true,
    employeeId: session.employeeId,
    companyId: session.companyId,
    jwtEmployeeId: session.claims.employee_id || null,
    jwtCompanyId: session.claims.companyId || session.claims.company_id || null,
  };
  const probeHolding = await probeEssList(session.token, 'holding');
  const probeMain = await probeEssList(session.token, 'main');
  R.probes.essListHolding = probeHolding;
  R.probes.essListMain = probeMain;
  ac(
    'PRECOND-ESS-LIST-HOLDING',
    probeHolding.http === 200 && probeHolding.total > 0 ? 'PASS' : 'FAIL',
    {
      summary: `API holding GET ${probeHolding.http} ${probeHolding.code} total=${probeHolding.total} pending=${probeHolding.pending.length}`,
    },
  );
  ac(
    'PRECOND-ESS-LIST-MAIN',
    probeMain.http === 409 ? 'PASS' : 'OBS',
    {
      summary: `API main GET ${probeMain.http} ${probeMain.code} (expect 409 scope mismatch vs holding JWT)`,
    },
  );

  const target =
    probeHolding.pending[0] ||
    probeHolding.rows.find((r) => r.status === 'processed' || r.status === 'paid') ||
    null;
  R.probes.targetPayslip = target;

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackEss(page);
  await injectPortalAuth(page, session);

  try {
    // Intentional: pass JWT company holding — FE AuthContext coerces holding→main (known risk)
    log('goto /hr/payroll as ESS (companyId=holding in URL)');
    await page.goto(q('/hr/payroll', 'holding'), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await page.getByTestId('hdsd-pay-ess-tab').waitFor({ state: 'visible', timeout: 60_000 });
    await sleep(1200);
    await shot(page, '01-ess-payroll');

    await openEssTab(page);
    await shot(page, '02-ess-tab');
    await sleep(2000);

    const listGet = lastEss('GET', /\/me\/payslips(\?|$)/);
    const panelVisible = await page
      .getByTestId('ess-payslips-panel-precision')
      .isVisible()
      .catch(() => false);
    const banner403 = await page
      .getByTestId('ess-payslips-403-hint')
      .isVisible()
      .catch(() => false);
    const countText = await page
      .getByTestId('ess-payslips-count')
      .innerText()
      .catch(() => '');
    const rowCount = await page.locator('[data-testid^="ess-payslip-row-"]').count();

    const ac1Pass =
      listGet &&
      listGet.status === 200 &&
      (listGet.total ?? 0) > 0 &&
      rowCount > 0 &&
      !banner403;
    ac('AC1-LIST-200-OWN', ac1Pass ? 'PASS' : 'FAIL', {
      summary: `GET me/payslips → ${listGet?.status ?? 'n/a'} code=${listGet?.code} company_id=${listGet?.company_id_query} total=${listGet?.total} FE rows=${rowCount} banner403=${banner403} panel=${panelVisible} count="${countText}"`,
      listGet,
      rowCount,
      banner403,
    });
    if (!ac1Pass) {
      R.residuals.push({
        id: 'D-PAY-ESS-FE-SCOPE-COERCE',
        severity: 'P1',
        owner: 'dev-fe',
        note:
          'FE coerceHrmListCompanyId(holding→main) on ESS me/payslips causes SCOPE_CONTEXT_MISMATCH 409 (JWT company=holding). API L1 SEAL needs company_id=holding. Fix: ESS hook/API client must use normalizeHrmApiListCompanyId / JWT company (preserve holding), not coerce-to-main.',
        evidence: { listGet, probeHolding, probeMain },
      });
      await shot(page, '02-ess-tab-fail');
      return { session, target, closed: false };
    }

    if (!target?.id) {
      ac('AC2-DETAIL-200', 'FAIL', {
        summary: 'No processed/paid payslip for ESS — BLOCKED env (no seed)',
      });
      R.residuals.push({
        id: 'R-PAY-ESS-NO-PENDING',
        severity: 'P2',
        note: 'List empty of confirmable slips — process via FE first; cấm seed',
      });
      return { session, target, closed: false };
    }

    log(`open detail ${target.id}`);
    await page.getByTestId(`hdsd-pay-ess-open-${target.id}`).click();
    await page
      .getByTestId('ess-payslip-detail-dialog-precision')
      .waitFor({ state: 'visible', timeout: 20_000 });
    await sleep(1200);
    await shot(page, '03-ess-detail');

    const detailGet = lastEss('GET', new RegExp(`/me/payslips/${target.id}(\\?|$)`));
    const detailBody = await page
      .getByTestId('ess-payslip-detail-body')
      .innerText()
      .catch(() => '');
    const ac2Pass =
      detailGet &&
      detailGet.status === 200 &&
      (detailGet.ess_confirmed === true ||
        detailGet.ess_confirmed === false ||
        /Xác nhận|Đã xác nhận|Chờ xác nhận|Thời điểm/i.test(detailBody));
    ac('AC2-DETAIL-200', ac2Pass ? 'PASS' : 'FAIL', {
      summary: `GET me/payslips/${target.id.slice(0, 8)}… → ${detailGet?.status ?? 'n/a'} ess_confirmed=${detailGet?.ess_confirmed} company_id=${detailGet?.company_id_query}`,
      detailGet,
      detailBody: detailBody.slice(0, 240),
    });

    const confirmBtn = page.getByTestId('hdsd-pay-ess-confirm');
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    if (!confirmVisible && target.ess_confirmed === true) {
      ac('AC3-CONFIRM-POST', 'FAIL', {
        summary: 'Target already confirmed — no pending slip (env). Need another processed unpaid confirm path without seed.',
      });
      R.residuals.push({
        id: 'R-PAY-ESS-NO-UNCONFIRMED',
        severity: 'P2',
        note: 'Only confirmed slips remain — cannot exercise POST confirm without new processed slip',
      });
      return { session, target, closed: false };
    }

    if (!confirmVisible) {
      ac('AC3-CONFIRM-POST', 'FAIL', {
        summary: 'Confirm CTA hdsd-pay-ess-confirm not visible on detail',
        detailBody: detailBody.slice(0, 240),
      });
      return { session, target, closed: false };
    }

    log('click confirm CTA');
    await confirmBtn.click();
    await page
      .getByTestId('ess-payslip-confirmed-badge')
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => {});
    await sleep(800);
    await shot(page, '04-ess-after-confirm');

    const confirmPost = lastEss('POST', /\/confirm/i);
    const badgeConfirmed = await page
      .getByTestId('ess-payslip-confirmed-badge')
      .isVisible()
      .catch(() => false);
    const badgeTextOk = await page
      .getByText('Đã xác nhận', { exact: false })
      .first()
      .isVisible()
      .catch(() => false);
    const confirmStillVisible = await confirmBtn.isVisible().catch(() => false);
    const ac3Pass =
      confirmPost &&
      confirmPost.status >= 200 &&
      confirmPost.status < 300 &&
      /HRM-PAY-204-ESS/i.test(String(confirmPost.code || '')) &&
      (badgeConfirmed || badgeTextOk) &&
      !confirmStillVisible;
    ac('AC3-CONFIRM-POST', ac3Pass ? 'PASS' : 'FAIL', {
      summary: `POST confirm → ${confirmPost?.status ?? 'n/a'} ${confirmPost?.code} badge=${badgeConfirmed||badgeTextOk} ctaHidden=${!confirmStillVisible}`,
      confirmPost,
      badgeConfirmed,
      badgeTextOk,
    });

    log('F5 reload ESS tab');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.getByTestId('hdsd-pay-ess-tab').waitFor({ state: 'visible', timeout: 60_000 });
    await openEssTab(page);
    await sleep(1500);
    await page.getByTestId(`hdsd-pay-ess-open-${target.id}`).click();
    await page
      .getByTestId('ess-payslip-detail-dialog-precision')
      .waitFor({ state: 'visible', timeout: 20_000 });
    await sleep(1200);
    await shot(page, '05-ess-f5-detail');

    const f5Detail = lastEss('GET', new RegExp(`/me/payslips/${target.id}(\\?|$)`));
    const f5Badge = await page
      .getByTestId('ess-payslip-confirmed-badge')
      .isVisible()
      .catch(() => false);
    const f5Cta = await page.getByTestId('hdsd-pay-ess-confirm').isVisible().catch(() => false);
    const ac4Pass =
      f5Detail &&
      f5Detail.status === 200 &&
      (f5Detail.ess_confirmed === true || f5Badge) &&
      !f5Cta;
    ac('AC4-F5-PERSIST', ac4Pass ? 'PASS' : 'FAIL', {
      summary: `F5 GET → ${f5Detail?.status ?? 'n/a'} ess_confirmed=${f5Detail?.ess_confirmed} badge=${f5Badge} ctaHidden=${!f5Cta}`,
      f5Detail,
    });

    return { session, target, closed: true };
  } finally {
    await context.close().catch(() => {});
  }
}

async function runCeoGate(browser) {
  const session = await portalLoginCeo();
  R.probes.ceoLogin = {
    ok: true,
    jwtEmployeeId: session.claims.employee_id || null,
    jwtCompanyId: session.claims.companyId || session.claims.company_id || null,
    loginVia: session.loginVia,
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackEss(page);
  await injectPortalAuth(page, session);

  try {
    log('goto /hr/payroll as CEO');
    await page.goto(q('/hr/payroll', 'main'), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await page.getByTestId('hdsd-pay-ess-tab').waitFor({ state: 'visible', timeout: 60_000 });
    await openEssTab(page);
    await page
      .getByTestId('ess-payslips-panel-precision')
      .waitFor({ state: 'visible', timeout: 30_000 })
      .catch(() => {});
    await page
      .getByTestId('ess-payslips-403-hint')
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(() => {});
    await sleep(1500);
    await shot(page, '06-ceo-ess-tab');

    const listGet = [...R.essNetwork]
      .reverse()
      .find((n) => n.method === 'GET' && /\/me\/payslips(\?|$)/.test(n.url));
    const banner403 = await page
      .getByTestId('ess-payslips-403-hint')
      .isVisible()
      .catch(() => false);
    const rowCount = await page.locator('[data-testid^="ess-payslip-row-"]').count();
    const panelText = await page
      .getByTestId('ess-payslips-panel-precision')
      .innerText()
      .catch(() => '');
    const honestCopy = /403|nhân viên|employee|hồ sơ|từ chối/i.test(panelText);

    const ac5Pass =
      listGet &&
      listGet.status === 403 &&
      /HRM-PAY-403-ESS/i.test(String(listGet.code || '')) &&
      (banner403 || honestCopy) &&
      rowCount === 0;
    ac('AC5-CEO-403', ac5Pass ? 'PASS' : 'FAIL', {
      summary: `CEO GET → ${listGet?.status ?? 'n/a'} ${listGet?.code} banner403=${banner403} honestCopy=${honestCopy} rows=${rowCount}`,
      listGet,
      panelSnippet: panelText.replace(/\s+/g, ' ').slice(0, 280),
    });
    if (!ac5Pass && rowCount > 0) {
      R.residuals.push({
        id: 'D-PAY-ESS-CEO-INVENT-ROWS',
        severity: 'P0',
        note: 'CEO ESS tab invented list rows despite 403/own-only — FE honesty fail',
      });
    }
  } finally {
    await context.close().catch(() => {});
  }
}

async function main() {
  for (const [name, url] of [
    ['hrm-api', `${HRM}/api/hrm`],
    ['xbos-api', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[name] = r.status;
    } catch (e) {
      R.l0[name] = `ERR ${String(e).slice(0, 80)}`;
    }
  }
  save();
  if (R.l0['hrm-api'] !== 200 || R.l0['portal'] !== 200) {
    ac('L0-STACK', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0-STACK', 'PASS', { summary: JSON.stringify(R.l0) });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    await runEssHappy(browser);
    await runCeoGate(browser);
  } catch (e) {
    R.residuals.push({
      id: 'R-PAY-ESS-QA-EXCEPTION',
      severity: 'P1',
      note: String(e).slice(0, 500),
    });
    console.error(e);
  } finally {
    await browser.close().catch(() => {});
  }

  const required = ['AC1-LIST-200-OWN', 'AC2-DETAIL-200', 'AC3-CONFIRM-POST', 'AC4-F5-PERSIST', 'AC5-CEO-403'];
  const fails = required.filter((id) => R.ac[id]?.verdict !== 'PASS');
  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.failIds = fails;
  save();
  console.log(`\nOVERALL ${R.overall} ${R.ack_status} fails=${fails.join(',') || 'none'} stamp=${STAMP}`);
  process.exit(fails.length === 0 ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.residuals.push({ id: 'R-FATAL', note: String(e).slice(0, 400) });
  save();
  process.exit(2);
});
