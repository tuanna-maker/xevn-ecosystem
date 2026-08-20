#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-SIGN-QA-03 — U65: draft → att-sheet-submit → sign ladder → close
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-03-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-03');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  work_item_id: 'PO-HRM-BP-ATT-SIGN-QA-03',
  u65_zero_seed: true,
  commit: COMMIT,
  startedAt: new Date().toISOString(),
  network: [],
  pageErrors: [],
  findings: {},
  ac: {},
  signSteps: [],
};

function trackNetwork(page) {
  page.on('response', (res) => {
    const u = res.url();
    if (/attendance-sheets|\/signatures|\/submit|\/close/.test(u)) {
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
        expiresAt: Date.now() + 8 * 3600_000,
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

async function apiGetSheet(token, id) {
  const url = `${HRM}/api/hrm/attendance/attendance-sheets/${id}?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j?.data ?? j };
}

async function navigateToSheetsList(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
  await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
  await sleep(1500);
  const sheetsList = page.locator('[data-testid="att-sheets-precision"]');
  await sheetsList.waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
  return sheetsList;
}

async function pickDraftRowIndex(page) {
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const rowCount = await rows.count();
  for (let i = 0; i < Math.min(rowCount, 25); i++) {
    const text = (await rows.nth(i).innerText()).toLowerCase();
    if (
      text.includes('nháp') ||
      text.includes('draft') ||
      text.includes('mở') ||
      (text.includes('open') && !text.includes('chờ ký') && !text.includes('submitted'))
    ) {
      return i;
    }
  }
  return rowCount > 0 ? 0 : -1;
}

function netCount(methodRe, urlRe, minStatus = 200, maxStatus = 299) {
  return report.network.filter(
    (n) => methodRe.test(n.method) && urlRe.test(n.url) && n.status >= minStatus && n.status <= maxStatus,
  ).length;
}

async function clickEnabledSignSteps(page, maxRounds = 5) {
  for (let round = 0; round < maxRounds; round++) {
    const confirmBtns = page.locator('[data-testid^="att-sign-confirm-"]');
    const count = await confirmBtns.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const btn = confirmBtns.nth(i);
      const testId = (await btn.getAttribute('data-testid')) || `idx-${i}`;
      if (await btn.isEnabled().catch(() => false)) {
        await btn.click({ timeout: 10_000 }).catch((e) => {
          report.signSteps.push({ testId, error: String(e) });
        });
        await sleep(2500);
        report.signSteps.push({ testId, round, clicked: true });
        clicked = true;
        break;
      }
    }
    if (!clicked) break;
  }
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
    report.findings.apiSheetStatuses = apiSheets.rows.slice(0, 15).map((r) => ({
      id: r.id,
      status: r.status,
      name: r.name,
      line_count: r.line_count,
    }));

    await injectPortalAuth(page, session);
    await navigateToSheetsList(page);
    await page.screenshot({ path: join(SCREEN, '01-list.png'), fullPage: false });

    const draftIdx = await pickDraftRowIndex(page);
    report.findings.draftRowIndex = draftIdx;
    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    if (draftIdx < 0) {
      report.findings.blocked = 'NO_SHEET_ROWS';
      report.verdictHint = 'BLOCKED_NO_DRAFT';
      return;
    }

    await rows.nth(draftIdx).click({ timeout: 12_000 });
    await sleep(2200);
    await page.screenshot({ path: join(SCREEN, '02-detail-draft.png'), fullPage: false });

    const holdDraft = page.locator('[data-testid="att-sign-panel-hold-draft"]');
    const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
    report.findings.holdDraftBeforeSubmit = await holdDraft.isVisible().catch(() => false);
    report.findings.submitBtnVisible = await submitBtn.isVisible().catch(() => false);

    if (!report.findings.submitBtnVisible) {
      report.findings.blocked = 'NO_ATT_SHEET_SUBMIT';
      report.verdictHint = 'FAIL_NO_SUBMIT_BTN';
      return;
    }

    const netBeforeSubmit = report.network.length;
    await submitBtn.click({ timeout: 12_000 });
    await sleep(3500);
    report.findings.submitPost2xx = netCount(/^POST$/, /\/submit/, 200, 299);
    report.findings.submitPostAny = report.network
      .slice(netBeforeSubmit)
      .filter((n) => n.method === 'POST' && /\/submit/.test(n.url));

    await page.screenshot({ path: join(SCREEN, '03-after-submit.png'), fullPage: false });

    report.findings.holdDraftAfterSubmit = await holdDraft.isVisible().catch(() => false);
    report.findings.attSignPanelVisible = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);
    report.findings.signaturesGet2xx = netCount(/^GET$/, /\/signatures/, 200, 299);

    const listText = await page.locator('[data-testid="att-sheets-precision"]').innerText().catch(() => '');
    report.findings.listHasChoKy = /chờ ký|submitted/i.test(listText);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
    await sleep(1200);
    await rows.nth(Math.min(draftIdx, (await rows.count()) - 1)).click({ timeout: 10_000 }).catch(() => null);
    await sleep(2500);
    report.findings.attSignPanelAfterF5 = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);
    report.findings.holdDraftAfterF5 = await holdDraft.isVisible().catch(() => false);
    await page.screenshot({ path: join(SCREEN, '04-after-f5-submitted.png'), fullPage: false });

    const sheetId =
      apiSheets.rows[draftIdx]?.id ||
      report.findings.apiSheetStatuses?.[draftIdx]?.id ||
      apiSheets.rows[0]?.id;
    if (sheetId) {
      const after = await apiGetSheet(session.token, sheetId);
      report.findings.apiSheetStatusAfter = after.body?.status;
      report.findings.apiLineCount = after.body?.line_count;
    }

    if (report.findings.attSignPanelVisible || report.findings.attSignPanelAfterF5) {
      await clickEnabledSignSteps(page);
      report.findings.signaturesPost2xx = netCount(/^POST$/, /\/signatures/, 200, 299);

      const closeBtn = page.locator('[data-testid="att-sign-close-sheet"]');
      report.findings.closeEnabled = await closeBtn.isEnabled().catch(() => false);
      report.findings.canCloseHint = await page
        .locator('[data-testid="att-sign-can-close-hint"]')
        .isVisible()
        .catch(() => false);

      if (report.findings.closeEnabled) {
        await closeBtn.click({ timeout: 10_000 }).catch((e) => {
          report.findings.closeClickError = String(e);
        });
        await sleep(2500);
        report.findings.closePost2xx = netCount(/^POST$/, /\/close/, 200, 299);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        report.findings.closedBadge = await page
          .locator('[data-testid="att-sign-sheet-status-badge"]')
          .innerText()
          .catch(() => '');
        await page.screenshot({ path: join(SCREEN, '05-after-close-f5.png'), fullPage: false });
      } else {
        report.findings.uf07_closeWhenIncomplete = 'close_disabled_as_expected';
      }
    }

    const submitOk = report.findings.submitPost2xx > 0;
    const panelOk =
      report.findings.attSignPanelVisible &&
      !report.findings.holdDraftAfterSubmit &&
      report.findings.signaturesGet2xx > 0;
    const f5Ok =
      report.findings.attSignPanelAfterF5 &&
      !report.findings.holdDraftAfterF5 &&
      (report.findings.apiSheetStatusAfter === 'submitted' || report.findings.listHasChoKy);

    report.ac['AC-ATT-SIGN-UF-01'] = panelOk && submitOk ? 'green' : submitOk ? 'yellow' : 'red';
    report.ac['AC-ATT-SIGN-UF-02'] =
      report.findings.signaturesPost2xx >= 1 ? 'green' : panelOk ? 'yellow_blocked_persona' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-03'] =
      report.findings.signaturesPost2xx >= 2 ? 'green' : report.findings.signaturesPost2xx >= 1 ? 'yellow' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-04'] =
      report.findings.canCloseHint || report.findings.signaturesPost2xx >= 3 ? 'green' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-05'] = report.findings.closePost2xx > 0 ? 'green' : 'blocked';
    report.ac['AC-ATT-SIGN-UF-06'] =
      report.findings.closePost2xx > 0 && /chốt|closed/i.test(report.findings.closedBadge || '')
        ? 'green'
        : 'blocked';
    report.ac['AC-ATT-SIGN-UF-07'] = panelOk && !report.findings.closeEnabled ? 'green_negative' : 'not_run';

    report.j_hrm_06c =
      submitOk && panelOk && f5Ok
        ? report.findings.closePost2xx > 0
          ? 'green'
          : 'partial_sign_ladder'
        : submitOk
          ? 'partial_submit_only'
          : 'red';

    if (!submitOk) report.verdictHint = 'FAIL_SUBMIT';
    else if (submitOk && panelOk && f5Ok && report.findings.closePost2xx > 0)
      report.verdictHint = 'PASS_TO_PM';
    else if (submitOk && panelOk && f5Ok) report.verdictHint = 'PASS_WITH_OBS_SIGN_LADDER';
    else report.verdictHint = 'FAIL_OR_PARTIAL';
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
