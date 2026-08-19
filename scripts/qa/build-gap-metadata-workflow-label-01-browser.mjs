/**
 * BUILD-GAP-METADATA-WORKFLOW-LABEL-01-QA — UF-HRM-11 metadata queue labels (U65)
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-build-gap-metadata-workflow-label-01-browser.json');
const SCREEN_DIR = resolve(
  ROOT,
  'docs/qa/evidence/screens/build-gap-metadata-workflow-label-01-qa',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const q = (path) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
};

const results = {
  work_item_id: 'BUILD-GAP-METADATA-WORKFLOW-LABEL-01-QA',
  startedAt: ts(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', companyId: 'main' },
  viteProbes: {},
  steps: {},
  consoleErrors: [],
  pageErrors: [],
  network: [],
  workflowLabels: [],
  screens: [],
  seed_used: false,
  verdict: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const rawText = await r.text();
  const j = (() => {
    try {
      return JSON.parse(rawText);
    } catch {
      return {};
    }
  })();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
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
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 320));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 320)));
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/employee-metadata\/change-requests/.test(u) && res.request().method() === 'GET') {
      results.network.push({
        method: 'GET',
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      });
    }
  });
}

async function viteProbe() {
  for (const [key, path] of [
    ['metadataWorkflowLabel', '/hr/src/lib/metadataWorkflowLabel.ts'],
    ['MetadataQueueTab', '/hr/src/components/settings/MetadataQueueTab.tsx'],
  ]) {
    try {
      const r = await fetch(`${PORTAL}${path}`);
      await r.text().catch(() => '');
      results.viteProbes[key] = r.status;
    } catch (e) {
      results.viteProbes[key] = String(e).slice(0, 120);
    }
  }
  save();
}

async function main() {
  await viteProbe();
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const page = await browser.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const metaUrl = q('/hr/employee-metadata');
  await page.goto(metaUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(2000);

  const overlay = page.locator('vite-error-overlay');
  const hasOverlay = await overlay.count().then((c) => c > 0).catch(() => false);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const importFail =
    /Failed to resolve import.*metadataWorkflowLabel/i.test(bodyText) ||
    results.consoleErrors.some((e) => /metadataWorkflowLabel|Failed to resolve import/i.test(e));

  const quyTrinhHeader = /Quy trình/.test(bodyText);
  const hasWorkflowCol = await page.locator('th:has-text("Quy trình")').count().catch(() => 0);
  const labelCells = page.locator('[data-testid="metadata-workflow-label"]');
  const labelCount = await labelCells.count().catch(() => 0);
  const labelTexts = [];
  for (let i = 0; i < Math.min(labelCount, 50); i++) {
    const t = (await labelCells.nth(i).innerText().catch(() => '')).trim();
    labelTexts.push(t);
  }
  results.workflowLabels = labelTexts;

  const rawXbosInLabels = labelTexts.some((t) => /xbos\./i.test(t) || /^xbos\./i.test(t));
  const rawDottedMachine = labelTexts.some((t) =>
    /^[a-z0-9]+(\.[a-z0-9_]+)+$/i.test(t),
  );

  const approveCount = await page.getByRole('button', { name: 'Duyệt' }).count().catch(() => 0);
  const rejectCount = await page.getByRole('button', { name: 'Từ chối' }).count().catch(() => 0);
  const emptyQueue = /Không có yêu cầu metadata đang chờ duyệt/.test(bodyText);

  mkdirSync(SCREEN_DIR, { recursive: true });
  const shot1 = join(SCREEN_DIR, '01-employee-metadata-queue.png');
  await page.screenshot({ path: shot1 }).catch(() => {});
  results.screens.push(shot1);

  results.steps.metadata_queue = {
    url: page.url(),
    viteOverlay: hasOverlay,
    importFail,
    quyTrinhHeader,
    workflowColumnHeader: hasWorkflowCol > 0,
    labelCellCount: labelCount,
    labelTexts: labelTexts.slice(0, 15),
    rawXbosInLabels,
    rawDottedMachine,
    emptyQueue,
    approveButtons: approveCount,
    rejectButtons: rejectCount,
    controlsWhenRows: labelCount === 0 || (approveCount > 0 && rejectCount > 0),
    pass:
      !hasOverlay &&
      !importFail &&
      quyTrinhHeader &&
      hasWorkflowCol > 0 &&
      !rawXbosInLabels &&
      !rawDottedMachine &&
      (emptyQueue || (labelCount > 0 && approveCount > 0 && rejectCount > 0)),
  };

  const settingsUrl = q('/hr/settings');
  await page.goto(settingsUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(800);
  await page.getByRole('tab', { name: /Danh mục nghiệp vụ/i }).click({ timeout: 8000 }).catch(async () => {
    await page.locator('text=Danh mục').first().click({ timeout: 5000 }).catch(() => {});
  });
  await sleep(1000);
  const mdPanel = await page.getByTestId('md-settings-panel').isVisible().catch(() => false);
  const mdTabs = await page.getByTestId('md-bucket-tabs').isVisible().catch(() => false);
  const shot2 = join(SCREEN_DIR, '02-settings-md-panel-spot.png');
  await page.screenshot({ path: shot2 }).catch(() => {});
  results.screens.push(shot2);
  results.steps.settings_md_spot = { mdPanel, mdTabs, pass: mdPanel || mdTabs };

  const badConsole = results.consoleErrors.filter(
    (e) =>
      !/favicon|404.*\.png|ResizeObserver|devtools/i.test(e) &&
      (/500|Failed to resolve|metadataWorkflowLabel|vite/i.test(e) || e.includes('HRM API')),
  );

  const metaGetOk = results.network.some((n) => n.status >= 200 && n.status < 400);

  results.verdict =
    results.steps.metadata_queue.pass &&
    results.steps.settings_md_spot.pass &&
    results.viteProbes.metadataWorkflowLabel === 200 &&
    results.viteProbes.MetadataQueueTab === 200 &&
    badConsole.length === 0 &&
    results.pageErrors.length === 0 &&
    (metaGetOk || results.steps.metadata_queue.emptyQueue)
      ? 'PASS_TO_PM'
      : 'FAIL';

  results.finishedAt = ts();
  save();
  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        steps: results.steps,
        viteProbes: results.viteProbes,
        network: results.network,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.error = String(e);
  results.verdict = 'FAIL';
  save();
  console.error(e);
  process.exit(1);
});
