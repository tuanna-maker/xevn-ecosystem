#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-SIGN-QA-07-NEG-01 — UF-07 negative: close when incomplete (U65)
 * Env prep: POST reopen on closed pilot sheet (F-ATT-SHEET-03) — documented, not seed.
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
const REOPEN_SHEET_ID =
  process.env.QA_NEG_SHEET_ID || '3934591a-50ec-452b-940f-7f29ede50272';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-07-neg-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-07-neg-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  work_item_id: 'PO-HRM-BP-ATT-SIGN-QA-07-NEG-01',
  u65_zero_seed: true,
  sheetId: REOPEN_SHEET_ID,
  commit: COMMIT,
  startedAt: new Date().toISOString(),
  envPrep: {},
  network: [],
  pageErrors: [],
  findings: {},
  ac: {},
};

function trackNetwork(page) {
  page.on('response', (res) => {
    const u = res.url();
    if (/attendance-sheets|\/signatures|\/close|\/reopen/.test(u)) {
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

async function loginApi(email = EMAIL, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        email,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || email,
          email: u.email || email,
          displayName: u.displayName || u.fullName || email,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error(`loginApi failed for ${email}`);
}

async function apiGetSheet(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j };
}

async function apiGetSignatures(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/signatures?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j };
}

async function apiReopen(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/reopen?company_id=${COMPANY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ reopen_reason: 'QA-07-NEG UF incomplete close regression' }),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j };
}

async function apiClose(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}/close?company_id=${COMPANY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j, raw: j };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      const exp = Date.now() + 8 * 3600_000;
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(exp));
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
    { s: { ...session, expiresAt: Date.now() + 8 * 3600_000 } },
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

async function navigateToSheetsList(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
}

async function pickRowIndexBySheetId(page, sheetId) {
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const rowCount = await rows.count();
  const needle = sheetId.slice(0, 8).toLowerCase();
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (text.includes(needle)) return i;
  }
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText().catch(() => '')).toLowerCase();
    if (/chờ ký|submitted/.test(text) && !/đã chốt|closed/.test(text)) return i;
  }
  return rowCount > 0 ? 0 : -1;
}

async function main() {
  const session = await loginApi();
  const beforeSheet = await apiGetSheet(session.token, REOPEN_SHEET_ID);
  report.envPrep.sheetStatusBefore = beforeSheet.body?.status;

  let sig = await apiGetSignatures(session.token, REOPEN_SHEET_ID);
  report.envPrep.canCloseBefore = sig.body?.can_close;
  report.envPrep.missingBefore = sig.body?.missing_mandatory_roles;

  if (beforeSheet.body?.status === 'closed') {
    const reopen = await apiReopen(session.token, REOPEN_SHEET_ID);
    report.envPrep.reopen = { status: reopen.status, body: reopen.body, code: reopen.raw?.code };
    report.envPrep.note =
      'POST reopen (F-ATT-SHEET-03) after QA-05 closed both pilot sheets — not seed; archives prior sign steps';
  } else if (beforeSheet.body?.status === 'submitted' && sig.body?.can_close === true) {
    report.envPrep.note = 'Sheet submitted with can_close=true — signing partial steps via FE skipped; will use incomplete state after reopen if needed';
  }

  const afterPrepSheet = await apiGetSheet(session.token, REOPEN_SHEET_ID);
  sig = await apiGetSignatures(session.token, REOPEN_SHEET_ID);
  report.findings.sheetStatus = afterPrepSheet.body?.status;
  report.findings.can_close = sig.body?.can_close;
  report.findings.missing_mandatory_roles = sig.body?.missing_mandatory_roles;

  if (report.findings.sheetStatus !== 'submitted') {
    report.findings.blocked = 'NO_SUBMITTED_SHEET_FOR_NEG';
    report.verdictHint = 'BLOCKED';
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    return;
  }

  if (report.findings.can_close === true) {
    report.findings.blocked = 'CAN_CLOSE_TRUE_UNEXPECTED';
    report.verdictHint = 'BLOCKED';
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    return;
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => report.pageErrors.push(String(e)));

  try {
    await injectPortalAuth(page, session);
    await navigateToSheetsList(page);
    await page.screenshot({ path: join(SCREEN, '01-list.png'), fullPage: false });

    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    const rowIdx = await pickRowIndexBySheetId(page, REOPEN_SHEET_ID);
    report.findings.rowIndex = rowIdx;
    if (rowIdx < 0) {
      report.findings.blocked = 'NO_UI_ROW';
      report.verdictHint = 'BLOCKED';
      return;
    }

    await rows.nth(rowIdx).click({ timeout: 12_000 });
    await sleep(2200);
    await page.screenshot({ path: join(SCREEN, '02-incomplete-panel.png'), fullPage: false });

    report.findings.attSignPanelVisible = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);

    const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
    report.findings.closeBtnVisible = await closeBtn.isVisible().catch(() => false);
    report.findings.closeBtnEnabled = await closeBtn.isEnabled().catch(() => false);
    report.findings.canCloseHintVisible = await page
      .locator('[data-testid="att-sign-can-close-hint"]')
      .isVisible()
      .catch(() => false);

    const badgeText = await page
      .locator('[data-testid="att-sign-sheet-status-badge"]')
      .innerText()
      .catch(() => '');
    report.findings.statusBadge = badgeText;

    const hintText = await page
      .locator('[data-testid="att-sign-panel"]')
      .locator('p.text-sm')
      .first()
      .innerText()
      .catch(() => '');
    report.findings.missingHintFe = hintText;

    await closeBtn.click({ timeout: 3_000, force: true }).catch((e) => {
      report.findings.forceCloseClickError = String(e);
    });
    await sleep(1500);

    const proxyClose = report.network.filter((n) => n.method === 'POST' && /\/close/.test(n.url));
    report.findings.proxyCloseAttempts = proxyClose;

    const apiNegClose = await apiClose(session.token, REOPEN_SHEET_ID);
    report.findings.directCloseWhenIncomplete = {
      httpStatus: apiNegClose.status,
      code: apiNegClose.raw?.code ?? apiNegClose.raw?.error?.code,
      message: apiNegClose.raw?.message ?? apiNegClose.raw?.error?.message,
    };

    const afterNeg = await apiGetSheet(session.token, REOPEN_SHEET_ID);
    report.findings.sheetStatusAfterNeg = afterNeg.body?.status;

    await page.screenshot({ path: join(SCREEN, '03-after-neg-attempt.png'), fullPage: false });

    const feBlocksClose = report.findings.closeBtnVisible && !report.findings.closeBtnEnabled;
    const api409 =
      report.findings.directCloseWhenIncomplete.httpStatus === 409 ||
      report.findings.directCloseWhenIncomplete.code === 'HRM-ATT-SIGN-INCOMPLETE';
    const notClosed = report.findings.sheetStatusAfterNeg === 'submitted';
    const no500 = report.findings.directCloseWhenIncomplete.httpStatus !== 500;

    report.ac['AC-ATT-SIGN-UF-07'] =
      feBlocksClose && api409 && notClosed && no500 ? 'green' : feBlocksClose && notClosed && no500 ? 'yellow' : 'red';

    if (report.ac['AC-ATT-SIGN-UF-07'] === 'green') report.verdictHint = 'PASS_TO_PM';
    else if (report.ac['AC-ATT-SIGN-UF-07'] === 'yellow') report.verdictHint = 'PASS_WITH_OBS';
    else if (report.findings.blocked) report.verdictHint = 'BLOCKED';
    else report.verdictHint = 'FAIL_TO_PM';
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
