#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01 — DEF-CTR-G4-DOM-NESTING-P2 retest
 * U65 zero-seed · console validateDOMNesting (Badge-in-p) on view/create/edit open
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

const STAMP = `CTRWSG4DOM-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-dom-nesting-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-dom-nesting-qa-01');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01',
  defect: 'DEF-CTR-G4-DOM-NESTING-P2',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  must_keep: { contracts_printable_ready: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  scenarios: {},
  domNestingWarnings: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function isDomNestingMsg(text) {
  const t = String(text);
  return (
    t.includes('validateDOMNesting') ||
    (t.includes('cannot appear as a descendant of') && (t.includes('<p>') || t.includes('Badge')))
  );
}

function recordConsole(msg, scenario) {
  const text = msg.text().slice(0, 400);
  const type = msg.type();
  if (isDomNestingMsg(text)) {
    R.domNestingWarnings.push({ scenario, type, text });
  }
  if (type === 'error') R.consoleErrors.push({ scenario, text });
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

function warningsForScenario(scenario) {
  return R.domNestingWarnings.filter((w) => w.scenario === scenario);
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
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 200)));

  await injectPortalAuth(page, session);

  const ccBase = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
  const editContractId = contracts.first?.id || 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

  const wireScenario = (scenario) => {
    page.removeAllListeners('console');
    page.on('console', (msg) => recordConsole(msg, scenario));
  };

  try {
    // --- VIEW workspace ---
    wireScenario('view');
    await page.goto(ccBase, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    const hrm = (await resolveHrmFrame(page)) || page;
    const viewBtn = hrm.getByTestId('hdsd-contracts-view-btn').first();
    let viewVerdict = 'BLOCKED';
    let printTemplateVisible = false;
    let packBadgeVisible = false;
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click({ timeout: 20000 });
      await sleep(2500);
      const { shell: viewShell } = await resolveShell(page, hrm);
      const viewRoot = await viewShell?.getByTestId('ctr-workspace-view-root').isVisible().catch(() => false);
      printTemplateVisible = await viewShell
        ?.getByTestId('hdsd-contracts-view-print-template')
        .isVisible()
        .catch(() => false);
      packBadgeVisible = await viewShell
        ?.getByTestId('hdsd-contracts-view-print-template')
        .locator('.badge, [class*="badge"]')
        .first()
        .isVisible()
        .catch(() => false);
      const viewWarnings = warningsForScenario('view');
      viewVerdict = viewRoot && viewWarnings.length === 0 ? 'PASS' : viewRoot ? 'FAIL' : 'FAIL';
      R.scenarios.view = {
        verdict: viewVerdict,
        viewRoot,
        printTemplateVisible,
        packBadgeVisible,
        domNestingCount: viewWarnings.length,
        domNesting: viewWarnings,
        clickPath: 'Contracts list → Eye (hdsd-contracts-view-btn) → Step1 Mẫu in',
      };
      await shot(page, '01-view-workspace');
      await viewShell?.getByRole('button', { name: /Đóng|Close/i }).first().click().catch(() => {});
      await sleep(800);
    } else {
      R.scenarios.view = { verdict: 'BLOCKED', reason: 'no view btn', domNestingCount: warningsForScenario('view').length };
    }

    // --- CREATE workspace ---
    wireScenario('create');
    const createUrl = `${ccBase}&workspace=create`;
    await page.goto(createUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const hrmCreate = (await resolveHrmFrame(page)) || hrm;
    const { shell: createShell } = await resolveShell(page, hrmCreate);
    const createStep1 = await createShell?.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
    const createWarnings = warningsForScenario('create');
    const createVerdict = createStep1 && createWarnings.length === 0 ? 'PASS' : createStep1 ? 'FAIL' : 'FAIL';
    R.scenarios.create = {
      verdict: createVerdict,
      createStep1,
      domNestingCount: createWarnings.length,
      domNesting: createWarnings,
      clickPath: 'Deep-link ?workspace=create → ctr-create-step-1',
      url: page.url(),
    };
    await shot(page, '02-create-workspace');
    await createShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    await sleep(800);

    // --- EDIT workspace ---
    wireScenario('edit');
    const editUrl = `${ccBase}&workspace=edit&contractId=${editContractId}`;
    await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    const hrmEdit = (await resolveHrmFrame(page)) || page;
    const { shell: editShell } = await resolveShell(page, hrmEdit);
    const editStep1 = await editShell?.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
    const editModeAttr = await editShell?.locator('[data-ctr-workspace-mode="edit"]').count().catch(() => 0);
    const editWarnings = warningsForScenario('edit');
    const editVerdict = editStep1 && editModeAttr > 0 && editWarnings.length === 0 ? 'PASS' : editStep1 ? 'FAIL' : 'FAIL';
    R.scenarios.edit = {
      verdict: editVerdict,
      editContractId,
      editStep1,
      editModeAttr: editModeAttr > 0,
      domNestingCount: editWarnings.length,
      domNesting: editWarnings,
      clickPath: `Deep-link ?workspace=edit&contractId=${editContractId}`,
      url: page.url(),
    };
    await shot(page, '03-edit-workspace');
    await editShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
  } finally {
    await browser.close();
  }

  const allPass =
    R.scenarios.view?.verdict === 'PASS' &&
    R.scenarios.create?.verdict === 'PASS' &&
    R.scenarios.edit?.verdict === 'PASS' &&
    R.domNestingWarnings.length === 0;

  if (allPass) {
    defect('DEF-CTR-G4-DOM-NESTING-P2', 'P2', '0 validateDOMNesting Badge-in-p on view/create/edit open', 'CLOSED');
  } else {
    defect(
      'DEF-CTR-G4-DOM-NESTING-P2',
      'P2',
      `domNestingWarnings=${R.domNestingWarnings.length} · scenarios=${JSON.stringify({
        view: R.scenarios.view?.verdict,
        create: R.scenarios.create?.verdict,
        edit: R.scenarios.edit?.verdict,
      })}`,
      'OPEN',
    );
  }

  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  console.log(
    JSON.stringify(
      {
        ack_status: R.ack_status,
        overall: R.overall,
        domNestingWarnings: R.domNestingWarnings.length,
        scenarios: R.scenarios,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
