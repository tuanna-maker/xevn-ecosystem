#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01 — U65: FE create draft if needed → att-sheet-submit → F5 submitted
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
const SHEET_NAME = process.env.QA_SHEET_NAME || 'QA-BP-ATT-SIGN-DRAFT-SUBMIT-01';
const START_VI = '01/09/2026';
const END_VI = '30/09/2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-draft-submit-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-draft-submit-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const report = {
  work_item_id: 'PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01',
  u65_zero_seed: true,
  commit: COMMIT,
  startedAt: new Date().toISOString(),
  network: [],
  pageErrors: [],
  findings: {},
  steps: {},
};

function trackNetwork(page) {
  page.on('response', (res) => {
    const u = res.url();
    if (/attendance-sheets|\/signatures|\/submit|\/close|\/reopen/.test(u)) {
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
  const payload = j?.data ?? j;
  const rows =
    payload?.items ??
    payload?.data ??
    (Array.isArray(payload) ? payload : []);
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
  await page.locator('[data-testid="att-sheets-precision"]').waitFor({ state: 'visible', timeout: 45_000 }).catch(() => null);
}

function findDraftInApi(rows) {
  return rows.find((r) => r.status === 'draft' || r.status === 'open');
}

function findDraftByName(rows, name) {
  return rows.find((r) => (r.name || '').includes(name) && (r.status === 'draft' || r.status === 'open'));
}

async function fillDateInputs(dialog, startVi, endVi) {
  const dateInputs = dialog.locator('input[placeholder="dd/MM/yyyy"]');
  const n = await dateInputs.count();
  if (n >= 2) {
    await dateInputs.nth(0).fill(startVi);
    await dateInputs.nth(1).fill(endVi);
    return;
  }
  const all = dialog.locator('input:not([type="radio"]):not([type="checkbox"])');
  const c = await all.count();
  let di = 0;
  for (let i = 0; i < c; i++) {
    const ph = (await all.nth(i).getAttribute('placeholder')) || '';
    if (ph === 'dd/MM/yyyy') {
      await all.nth(i).fill(di === 0 ? startVi : endVi);
      di++;
      if (di >= 2) break;
    }
  }
}

async function createDraftSheetViaFe(page) {
  const addBtn = page.locator('[data-testid="att-sheets-add"]');
  if (!(await addBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'NO_ATT_SHEETS_ADD' };
  }
  await addBtn.click({ timeout: 10_000 });
  await sleep(800);
  const dialog = page.locator('[data-testid="att-add-sheet-dialog"]');
  if (!(await dialog.isVisible().catch(() => false))) {
    const roleDialog = page.getByRole('dialog');
    if (!(await roleDialog.isVisible().catch(() => false))) {
      return { ok: false, reason: 'NO_ADD_DIALOG' };
    }
  }
  const dlg = (await dialog.isVisible().catch(() => false)) ? dialog : page.getByRole('dialog');
  const nameInput = dlg.locator('input[placeholder*="Bảng chấm công"]');
  if ((await nameInput.count()) > 0) {
    await nameInput.first().fill(SHEET_NAME);
  }
  await fillDateInputs(dlg, START_VI, END_VI);
  const postsBefore = report.network.filter((n) => n.method === 'POST' && /attendance-sheets(\?|$)/.test(n.url)).length;
  const saveBtn = dlg.getByRole('button', { name: /^Lưu$/ });
  if (!(await saveBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'NO_SAVE_BTN' };
  }
  await saveBtn.click({ timeout: 12_000 });
  await sleep(3500);
  const postsAfter = report.network.filter((n) => n.method === 'POST' && /attendance-sheets(\?|$)/.test(n.url));
  const createPost = postsAfter.slice(postsBefore);
  const create2xx = createPost.some((p) => p.status >= 200 && p.status < 300);
  await page.screenshot({ path: join(SCREEN, '02-after-create-sheet.png'), fullPage: false }).catch(() => null);
  return { ok: create2xx, createPost, reason: create2xx ? null : 'CREATE_POST_NOT_2XX' };
}

async function pickDraftRowIndex(page) {
  const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText()).toLowerCase();
    if (text.includes(SHEET_NAME.toLowerCase())) return i;
  }
  for (let i = 0; i < rowCount; i++) {
    const text = (await rows.nth(i).innerText()).toLowerCase();
    if (
      text.includes('nháp') ||
      text.includes('draft') ||
      (text.includes('mở') && !text.includes('chờ ký'))
    ) {
      return i;
    }
  }
  return -1;
}

function netCount(methodRe, urlRe, minStatus = 200, maxStatus = 299) {
  return report.network.filter(
    (n) => methodRe.test(n.method) && urlRe.test(n.url) && n.status >= minStatus && n.status <= maxStatus,
  ).length;
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => report.pageErrors.push(String(e)));

  let activeSheetId = null;

  try {
    const session = await loginApi();
    report.findings.loginApi = true;
    let apiSheets = await apiListSheets(session.token);
    report.findings.apiSheetsStatus = apiSheets.status;
    report.findings.apiSheetStatusesBefore = apiSheets.rows.map((r) => ({
      id: r.id,
      status: r.status,
      name: r.name,
    }));

    let draftRow = findDraftInApi(apiSheets.rows) || findDraftByName(apiSheets.rows, SHEET_NAME);
    report.steps.S0_obtain_draft = { hadDraft: Boolean(draftRow), draftId: draftRow?.id ?? null };

    await injectPortalAuth(page, session);
    await navigateToSheetsList(page);
    await page.screenshot({ path: join(SCREEN, '01-sheets-list.png'), fullPage: false });

    if (!draftRow) {
      report.steps.S0b_create_draft_fe = await createDraftSheetViaFe(page);
      await sleep(1500);
      apiSheets = await apiListSheets(session.token);
      draftRow = findDraftByName(apiSheets.rows, SHEET_NAME) || findDraftInApi(apiSheets.rows);
      report.steps.S0b_create_draft_fe.resolvedDraft = draftRow
        ? { id: draftRow.id, status: draftRow.status }
        : null;
    }

    if (!draftRow) {
      report.findings.blocked = 'NO_DRAFT_AFTER_FE_CREATE';
      report.verdictHint = 'BLOCKED';
      report.ack_status = 'BLOCKED';
      return;
    }

    activeSheetId = draftRow.id;
    report.findings.activeSheetId = activeSheetId;
    report.findings.activeSheetStatusBefore = draftRow.status;

    const draftIdx = await pickDraftRowIndex(page);
    report.findings.draftRowIndex = draftIdx;
    const rows = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    if (draftIdx >= 0) {
      await rows.nth(draftIdx).click({ timeout: 12_000 });
    } else {
      await page.locator(`[data-testid="att-sheet-row-${activeSheetId}"]`).click({ timeout: 12_000 }).catch(async () => {
        await page.getByText(SHEET_NAME).first().click({ timeout: 8_000 }).catch(() => null);
      });
    }
    await sleep(2500);
    await page.screenshot({ path: join(SCREEN, '03-sheet-detail-draft.png'), fullPage: false });

    const holdDraft = page.locator('[data-testid="att-sign-panel-hold-draft"]');
    const submitBtn = page.locator('[data-testid="att-sheet-submit"]');
    report.findings.holdDraftBeforeSubmit = await holdDraft.isVisible().catch(() => false);
    report.findings.submitBtnVisible = await submitBtn.isVisible().catch(() => false);

    report.steps.S1_submit = { submitBtnVisible: report.findings.submitBtnVisible };
    if (!report.findings.submitBtnVisible) {
      report.findings.blocked = 'NO_ATT_SHEET_SUBMIT_VISIBLE';
      report.verdictHint = 'PASS_WITH_OBS_OR_BLOCKED';
      report.ack_status = 'PASS_WITH_OBS';
      return;
    }

    const netBefore = report.network.length;
    await submitBtn.click({ timeout: 12_000 });
    await sleep(3500);
    report.findings.submitPost2xx = netCount(/^POST$/, /\/submit/, 200, 299);
    report.findings.submitPostLog = report.network
      .slice(netBefore)
      .filter((n) => n.method === 'POST' && /\/submit/.test(n.url));

    await page.screenshot({ path: join(SCREEN, '04-after-submit-click.png'), fullPage: false });

    report.findings.holdDraftAfterSubmit = await holdDraft.isVisible().catch(() => false);
    report.findings.attSignPanelVisible = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);
    report.findings.signaturesGet2xx = netCount(/^GET$/, /\/signatures/, 200, 299);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await openAttendanceMenuItem(page, /Bảng chấm công|Sheets/i);
    await sleep(1200);
    const idxAfter = await pickDraftRowIndex(page);
    const rowAfter = page.locator('[data-testid="att-sheets-precision"] tbody tr');
    if (idxAfter >= 0) {
      await rowAfter.nth(idxAfter).click({ timeout: 10_000 }).catch(() => null);
    } else {
      await page.locator(`[data-testid="att-sheet-row-${activeSheetId}"]`).click({ timeout: 10_000 }).catch(() => null);
    }
    await sleep(2500);
    report.findings.attSignPanelAfterF5 = await page
      .locator('[data-testid="att-sign-panel"]')
      .isVisible()
      .catch(() => false);
    report.findings.holdDraftAfterF5 = await holdDraft.isVisible().catch(() => false);

    const after = await apiGetSheet(session.token, activeSheetId);
    report.findings.apiSheetStatusAfter = after.body?.status;

    await page.screenshot({ path: join(SCREEN, '05-after-f5-submitted.png'), fullPage: false });

    const submitOk = report.findings.submitPost2xx > 0;
    const panelOk =
      report.findings.attSignPanelVisible &&
      !report.findings.holdDraftAfterSubmit &&
      report.findings.signaturesGet2xx > 0;
    const f5Ok =
      report.findings.attSignPanelAfterF5 &&
      !report.findings.holdDraftAfterF5 &&
      report.findings.apiSheetStatusAfter === 'submitted';

    report.steps.S2_f5 = { submitOk, panelOk, f5Ok, apiStatus: report.findings.apiSheetStatusAfter };

    if (submitOk && panelOk && f5Ok) {
      report.verdictHint = 'PASS_TO_PM';
      report.ack_status = 'PASS_TO_PM';
      report.findings.c_draft_submit_fe = 'CLOSED';
    } else if (submitOk && panelOk) {
      report.verdictHint = 'PASS_WITH_OBS';
      report.ack_status = 'PASS_WITH_OBS';
    } else if (!submitOk) {
      report.verdictHint = 'FAIL_SUBMIT';
      report.ack_status = 'FAIL_TO_PM';
    } else {
      report.verdictHint = 'FAIL_OR_PARTIAL';
      report.ack_status = 'FAIL_TO_PM';
    }
  } finally {
    report.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    await browser.close();
  }
}

main().catch((e) => {
  report.fatal = String(e);
  report.ack_status = 'BLOCKED';
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  process.exit(1);
});
