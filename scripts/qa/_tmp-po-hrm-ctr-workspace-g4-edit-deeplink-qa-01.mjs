#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01 — narrow WS-G4-03-EDIT + create/view regression
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `CTRWSG4ED-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-edit-deeplink-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-edit-deeplink-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  rows: {},
  regression: {},
  network: { edit_get: null, view_get: null },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function row(id, verdict, detail) {
  R.rows[id] = { verdict, ...detail };
}

function defect(id, severity, note, status = 'OPEN') {
  R.defects.push({ id, severity, note, status });
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return { token: data.accessToken, user: data.user ?? { email: EMAIL }, companyId: COMPANY };
}

async function apiProbe(token) {
  const h = { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const r = await fetch(`${HRM}/contracts-insurance/contracts?company_id=${COMPANY}&page_size=10`, { headers: h });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return { status: r.status, count: rows.length, first: rows[0] ?? null };
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
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
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
    }
  }, { ...session, expiresAt });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmFrame(page, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f
        .locator('[data-testid="hdsd-contracts-create-btn"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (has) return f;
    }
    if (await page.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false)) return page;
    await sleep(500);
  }
  return null;
}

async function resolveShell(page, hrmCtx, timeoutMs = 50000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrmCtx, ...page.frames()]) {
      if (!ctx) continue;
      const step1 = await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false);
      const viewRoot = await ctx.locator('[data-testid="ctr-workspace-view-root"]').first().isVisible().catch(() => false);
      if (step1 || viewRoot) return { shell: ctx, mode: viewRoot ? 'view' : 'mutate' };
    }
    await sleep(350);
  }
  return { shell: null, mode: null };
}

function wireNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    const method = res.request().method();
    if (url.includes('/contracts-insurance/contracts') && method === 'GET' && /\/contracts\/[^/?]+/.test(url)) {
      const snap = { status: res.status(), url: url.slice(0, 160) };
      if (R.network.edit_get == null && page.url().includes('workspace=edit')) {
        R.network.edit_get = snap;
      } else if (!R.network.view_get) {
        R.network.view_get = snap;
      }
    }
  });
}

async function main() {
  const session = await loginApi();
  const contracts = await apiProbe(session.token);
  R.prereq = { contracts };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 200)));

  await injectPortalAuth(page, session);

  const ccBase = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
  const editContractId =
    contracts.first?.id || 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

  try {
    // --- Baseline: contracts list loads ---
    await page.goto(ccBase, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    const hrm = (await resolveHrmFrame(page)) || page;
    const createBtn = hrm.getByTestId('hdsd-contracts-create-btn');
    const listOk = await createBtn.isVisible().catch(() => false);
    row('WS-G4-05', listOk ? 'PASS' : 'FAIL', { url: page.url() });

    // --- Regression: create deep-link ---
    const createUrl = `${ccBase}&workspace=create`;
    await page.goto(createUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const hrmCreate = (await resolveHrmFrame(page)) || hrm;
    const { shell: createShell } = await resolveShell(page, hrmCreate);
    const createStep1 = await createShell?.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
    const createMode = await createShell?.locator('[data-ctr-workspace-mode="create"]').count().catch(() => 0);
    R.regression.create = {
      verdict: createStep1 ? 'PASS' : 'FAIL',
      createStep1,
      createModeAttr: createMode > 0,
      url: page.url(),
    };
    await shot(page, '01-create-deeplink');
    await createShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    await sleep(800);

    // --- Regression: view deep-link (Eye) ---
    await page.goto(ccBase, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const hrmView = (await resolveHrmFrame(page)) || page;
    const viewBtn = hrmView.getByTestId('hdsd-contracts-view-btn').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click({ timeout: 20000 });
      await sleep(2000);
      const { shell: viewShell } = await resolveShell(page, hrmView);
      const viewOk =
        (await viewShell?.getByTestId('ctr-workspace-view-root').isVisible().catch(() => false)) &&
        (await viewShell?.getByTestId('hdsd-contracts-view-body').isVisible().catch(() => false));
      R.regression.view = {
        verdict: viewOk ? 'PASS' : 'FAIL',
        viewOk,
        get: R.network.view_get,
      };
      await shot(page, '02-view-workspace');
      await viewShell?.getByRole('button', { name: /Đóng|Close/i }).first().click().catch(() => {});
      await sleep(800);
    } else {
      R.regression.view = { verdict: 'BLOCKED', reason: 'no view btn' };
    }

    // --- WS-G4-03-EDIT: parent URL edit deep-link ---
    const editUrl = `${ccBase}&workspace=edit&contractId=${editContractId}`;
    await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    const hrmEdit = (await resolveHrmFrame(page)) || page;
    const { shell: editShell, mode } = await resolveShell(page, hrmEdit);
    const editStep1 = await editShell?.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
    const editModeAttr = await editShell?.locator('[data-ctr-workspace-mode="edit"]').first().isVisible().catch(() => false);
    const editModeCount = await editShell?.locator('[data-ctr-workspace-mode="edit"]').count().catch(() => 0);
    const dialogParent = await editShell
      ?.locator('[data-testid="hdsd-contracts-create-dialog"]')
      .first()
      .isVisible()
      .catch(() => false);
    const getOk = R.network.edit_get?.status >= 200 && R.network.edit_get?.status < 300;

    const editPass = editStep1 && (editModeAttr || editModeCount > 0);
    row('WS-G4-03-EDIT', editPass ? 'PASS' : 'FAIL', {
      editContractId,
      editStep1,
      editModeAttr,
      editModeCount,
      dialogParent,
      shellMode: mode,
      get: R.network.edit_get,
      getOk,
      url: page.url(),
    });
    await shot(page, '03-edit-deeplink');

    if (!editPass) {
      defect(
        'DEF-CTR-G4-EDIT-DEEPLINK-P1',
        'P1',
        `?workspace=edit&contractId= — Step1=${editStep1} modeAttr=${editModeAttr}`,
        'OPEN',
      );
    } else {
      defect(
        'DEF-CTR-G4-EDIT-DEEPLINK-P1',
        'P1',
        'CC embed edit deep-link mounts workspace Step1 in edit mode',
        'CLOSED',
      );
    }

    await editShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
  } finally {
    await browser.close();
  }

  const regPass =
    R.regression.create?.verdict === 'PASS' && R.regression.view?.verdict === 'PASS';
  const editPass = R.rows['WS-G4-03-EDIT']?.verdict === 'PASS';
  R.overall = editPass && regPass ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  console.log(JSON.stringify({ ack_status: R.ack_status, overall: R.overall, rows: R.rows, regression: R.regression }, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
