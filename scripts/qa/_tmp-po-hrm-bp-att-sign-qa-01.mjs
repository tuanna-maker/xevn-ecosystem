#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-SIGN-QA-01 — U65 zero-seed browser probe
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  work_item_id: 'PO-HRM-BP-ATT-SIGN-QA-01',
  u65_zero_seed: true,
  commit: COMMIT,
  startedAt: new Date().toISOString(),
  network: [],
  pageErrors: [],
  findings: {},
};

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
  const url = `${HRM}/api/hrm/attendance/attendance-sheets?company_id=${COMPANY}&page_size=20`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.items ?? j?.data ?? j?.items ?? [];
  return { status: r.status, rows: Array.isArray(rows) ? rows : [] };
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (e) => report.pageErrors.push(String(e)));
  page.on('response', (res) => {
    const u = res.url();
    if (/attendance-sheets|attendance\/attendance-sheets/.test(u)) {
      report.network.push({ url: u, status: res.status(), method: res.request().method() });
    }
  });

  try {
    const session = await loginApi();
    report.findings.loginApi = true;
    const apiSheets = await apiListSheets(session.token);
    report.findings.apiSheetsStatus = apiSheets.status;
    report.findings.apiSheetCount = apiSheets.rows.length;
    report.findings.apiSubmittedCount = apiSheets.rows.filter((r) => r.status === 'submitted').length;
    report.findings.apiSubmittedIds = apiSheets.rows
      .filter((r) => r.status === 'submitted')
      .slice(0, 3)
      .map((r) => r.id);

    await injectPortalAuth(page, session);
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2800);
    await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
    await sleep(1500);

    const sheetsList = page.locator('[data-testid="att-sheets-precision"]');
    await sheetsList.waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
    report.findings.sheetsListVisible = await sheetsList.isVisible().catch(() => false);

    const sheetGet200 = report.network.filter((n) => n.method === 'GET' && n.status === 200);
    report.findings.sheetsListGet200 = sheetGet200.length > 0;

    await page.screenshot({ path: join(SCREEN, '01-att-sheets-list.png'), fullPage: false });

    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowCount = await rows.count();
    report.findings.sheetRowCount = rowCount;

    let submittedRowIndex = -1;
    for (let i = 0; i < Math.min(rowCount, 20); i++) {
      const text = (await rows.nth(i).innerText()).toLowerCase();
      if (text.includes('chờ ký') || text.includes('submitted') || text.includes('cho ky')) {
        submittedRowIndex = i;
        break;
      }
    }
    report.findings.submittedRowIndex = submittedRowIndex;

    if (rowCount > 0 && submittedRowIndex < 0) {
      await rows.first().click({ timeout: 10_000 }).catch(() => null);
      await sleep(2000);
    } else if (submittedRowIndex >= 0) {
      await rows.nth(submittedRowIndex).click({ timeout: 10_000 }).catch(() => null);
      await sleep(2000);
    }

    await page.screenshot({ path: join(SCREEN, '02-after-sheet-click.png'), fullPage: false });

    const signPanel = page.locator('[data-testid="att-sign-panel"]');
    const signDraftHold = page.locator('[data-testid="att-sign-panel-hold-draft"]');
    report.findings.attSignPanelVisible = await signPanel.isVisible().catch(() => false);
    report.findings.attSignDraftHoldVisible = await signDraftHold.isVisible().catch(() => false);
    report.findings.weeklyViewVisible = await page
      .locator('[data-testid="att-weekly-precision"]')
      .isVisible()
      .catch(() => false);

    const sigGets = report.network.filter(
      (n) => n.method === 'GET' && /\/signatures/.test(n.url) && n.status === 200,
    );
    report.findings.signaturesGet200 = sigGets.length;

    report.verdictHint =
      !report.findings.submittedRowIndex && report.findings.submittedRowIndex !== 0
        ? 'NO_SUBMITTED_SHEET_U65'
        : !report.findings.attSignPanelVisible && !report.findings.attSignDraftHoldVisible
          ? 'NO_SIGN_PANEL_DOM'
          : 'PANEL_PARTIAL';
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
