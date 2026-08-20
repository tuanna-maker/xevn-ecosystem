#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-SIGN-QA-02 — U65 zero-seed browser UF
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-02-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-02');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  work_item_id: 'PO-HRM-BP-ATT-SIGN-QA-02',
  u65_zero_seed: true,
  commit: COMMIT,
  startedAt: new Date().toISOString(),
  network: [],
  pageErrors: [],
  findings: {},
  ac: {},
};

function trackNetwork(page) {
  page.on('response', (res) => {
    const u = res.url();
    if (/attendance-sheets|\/signatures|\/close/.test(u)) {
      report.network.push({
        url: u.replace(/access_token=[^&]+/, 'access_token=REDACTED'),
        status: res.status(),
        method: res.request().method(),
      });
    }
  });
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('loginApi failed');
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s: session },
  );
}

async function openAttendanceMenuItem(page, labelRe) {
  await page.locator('[data-testid="attendance-tab-menu"]').click();
  await sleep(500);
  const byText = page.locator('[role="menu"], [data-radix-menu-content]').getByText(labelRe).first();
  if (await byText.count()) {
    await byText.click({ timeout: 8_000 });
    return;
  }
  const candidates = page.locator('[role="menuitem"]');
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim();
    if (labelRe.test(text)) {
      await candidates.nth(i).click();
      return;
    }
  }
}

async function apiListSheets(token) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets?company_id=${COMPANY}&page_size=50`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.items ?? j?.data ?? j?.items ?? [];
  return { status: r.status, rows: Array.isArray(rows) ? rows : [] };
}

async function tryFeSubmitFunnel(page) {
  /** U65: only UI buttons — no API fake */
  const submitLike = page.getByRole('button', { name: /gửi|chờ ký|submit|tổng hợp/i });
  const count = await submitLike.count();
  report.findings.submitButtonCount = count;
  if (count === 0) {
    report.findings.feSubmitAttempt = 'NO_SUBMIT_CONTROL_IN_DOM';
    return false;
  }
  await submitLike.first().click({ timeout: 5_000 }).catch((e) => {
    report.findings.feSubmitAttempt = `CLICK_FAIL:${e.message}`;
  });
  await sleep(2500);
  report.findings.feSubmitAttempt = report.findings.feSubmitAttempt || 'CLICKED_FIRST_SUBMIT_LIKE';
  return true;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => report.pageErrors.push(String(e)));

  try {
    const session = await loginApi();
    report.findings.loginApi = true;
    const apiSheets = await apiListSheets(session.token);
    report.findings.apiSheetsStatus = apiSheets.status;
    report.findings.apiSheetCount = apiSheets.rows.length;
    report.findings.apiSubmittedCount = apiSheets.rows.filter((r) => r.status === 'submitted').length;
    report.findings.apiDraftCount = apiSheets.rows.filter((r) =>
      ['draft', 'open'].includes(String(r.status)),
    ).length;
    report.findings.apiSheetStatuses = apiSheets.rows.slice(0, 10).map((r) => ({
      id: r.id,
      status: r.status,
      name: r.name,
    }));

    await injectPortalAuth(page, session);
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2800);
    await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
    await sleep(1500);

    const sheetsList = page.locator('[data-testid="att-sheets-precision"]');
    await sheetsList.waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
    report.findings.sheetsListVisible = await sheetsList.isVisible().catch(() => false);

    await page.screenshot({ path: join(SCREEN, '01-att-sheets-list.png'), fullPage: false });

    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowCount = await rows.count();
    report.findings.sheetRowCount = rowCount;

    let submittedRowIndex = -1;
    for (let i = 0; i < Math.min(rowCount, 25); i++) {
      const text = (await rows.nth(i).innerText()).toLowerCase();
      if (text.includes('chờ ký') || text.includes('submitted')) {
        submittedRowIndex = i;
        break;
      }
    }
    report.findings.submittedRowIndex = submittedRowIndex;

    const clickIndex = submittedRowIndex >= 0 ? submittedRowIndex : rowCount > 0 ? 0 : -1;
    if (clickIndex >= 0) {
      await rows.nth(clickIndex).click({ timeout: 10_000 }).catch(() => null);
      await sleep(2200);
    }

    await page.screenshot({ path: join(SCREEN, '02-after-sheet-click.png'), fullPage: false });

    if (report.findings.apiSubmittedCount === 0 && submittedRowIndex < 0) {
      await tryFeSubmitFunnel(page);
      await page.screenshot({ path: join(SCREEN, '03-after-submit-attempt.png'), fullPage: false });
    }

    const signPanel = page.locator('[data-testid="att-sign-panel"]');
    const signDraftHold = page.locator('[data-testid="att-sign-panel-hold-draft"]');
    const stepsList = page.locator('[data-testid="att-sign-steps-list"]');
    const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');

    report.findings.attSignPanelVisible = await signPanel.isVisible().catch(() => false);
    report.findings.attSignDraftHoldVisible = await signDraftHold.isVisible().catch(() => false);
    report.findings.attSignStepsVisible = await stepsList.isVisible().catch(() => false);
    report.findings.weeklyViewVisible = await page
      .locator('[data-testid="att-weekly-precision"]')
      .isVisible()
      .catch(() => false);

    const sigGets = report.network.filter(
      (n) => n.method === 'GET' && /\/signatures/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    report.findings.signaturesGet2xx = sigGets.length;

    if (report.findings.attSignPanelVisible) {
      const confirmBtns = page.locator('[data-testid^="att-sign-confirm-"]');
      const confirmCount = await confirmBtns.count();
      report.findings.confirmButtonCount = confirmCount;
      for (let i = 0; i < Math.min(confirmCount, 3); i++) {
        const btn = confirmBtns.nth(i);
        if (await btn.isEnabled().catch(() => false)) {
          await btn.click({ timeout: 8_000 }).catch((e) => {
            report.findings.signClickError = String(e);
          });
          await sleep(2000);
          break;
        }
      }
      report.findings.signaturesPost2xx = report.network.filter(
        (n) => n.method === 'POST' && /\/signatures/.test(n.url) && n.status >= 200 && n.status < 300,
      ).length;

      const closeEnabled = await closeBtn.isEnabled().catch(() => false);
      report.findings.closeButtonEnabled = closeEnabled;
      if (closeEnabled) {
        await closeBtn.click({ timeout: 8_000 }).catch((e) => {
          report.findings.closeClickError = String(e);
        });
        await sleep(2000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2000);
      }
      report.findings.closePost2xx = report.network.filter(
        (n) => n.method === 'POST' && /\/close/.test(n.url) && n.status >= 200 && n.status < 300,
      ).length;
      await page.screenshot({ path: join(SCREEN, '04-after-sign-mutate.png'), fullPage: false });
    }

    // AC map hints
    const listOk = report.findings.sheetsListVisible && report.network.some(
      (n) => n.method === 'GET' && /attendance-sheets/.test(n.url) && n.status === 200,
    );
    report.ac['AC-ATT-SIGN-UF-01'] = listOk && report.findings.attSignPanelVisible ? 'green' : listOk ? 'yellow' : 'red';
    report.ac['AC-ATT-SIGN-UF-02'] = report.findings.signaturesPost2xx > 0 ? 'green' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-03'] = 'blocked';
    report.ac['AC-ATT-SIGN-UF-04'] = 'blocked';
    report.ac['AC-ATT-SIGN-UF-05'] = report.findings.closePost2xx > 0 ? 'green' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-06'] = 'blocked';
    report.ac['AC-ATT-SIGN-UF-07'] = report.findings.attSignPanelVisible ? 'not_run' : 'blocked';

    report.j_hrm_06c = report.findings.attSignPanelVisible && report.findings.signaturesGet2xx > 0
      ? 'partial'
      : 'blocked_no_submitted';

    report.verdictHint =
      report.findings.apiSubmittedCount === 0 && !report.findings.attSignPanelVisible
        ? 'PASS_WITH_OBS_NO_SUBMITTED_U65'
        : report.findings.attSignPanelVisible && report.findings.signaturesPost2xx > 0
          ? 'PARTIAL_SIGN'
          : 'PARTIAL';
  } finally {
    report.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    await browser.close();
  }
}

main().catch((e) => {
  report.fatal = String(e);
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  process.exit(1);
});
