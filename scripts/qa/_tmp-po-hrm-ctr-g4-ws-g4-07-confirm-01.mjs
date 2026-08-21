#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01 — mandatory Gỡ confirm full path
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
const NV101_UUID = '33333333-3333-4333-8333-333333333333';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const EXPECT_MSG = 'Điều khoản này là bắt buộc theo mẫu';
const STAMP = `CTRG4G07-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_EMP = `QG07${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `WS-G4-07 confirm ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-g4-ws-g4-07-confirm-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-g4-ws-g4-07-confirm-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const DND_STORM_RE = /sameNodeDragBind|dragHandleProps missing|Unable to find drag handle/i;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  rows: {},
  ac: {},
  journeys: {},
  confirm: {
    mandatoryClauseId: null,
    settingsPrep: null,
    dialogOnCancel: null,
    dialogOnAccept: null,
    countBefore: null,
    countAfterCancel: null,
    countAfterAccept: null,
    silentRemoveOnMandatory: false,
  },
  dnd_storms: [],
  consoleErrors: [],
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function row(id, verdict, detail) {
  R.rows[id] = { verdict, ...detail };
}
function ac(id, verdict, detail) {
  R.ac[id] = { verdict, ...detail };
}
function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
}
function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
}

async function resolveSettingsDialog(page, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, ...page.frames()]) {
      const dlg = ctx.getByTestId('settings-contract-clauses-dialog');
      if (await dlg.isVisible().catch(() => false)) return dlg;
    }
    await sleep(300);
  }
  return null;
}

async function loginApi() {
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
      if (r.ok && token)
        return { token, user: d?.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

function parseClauseList(j) {
  const raw = j?.data?.data ?? j?.data?.items ?? j?.items ?? j?.data ?? [];
  return Array.isArray(raw) ? raw : [];
}

async function fetchMandatoryClauseIds(token) {
  const url = `${HRM}/contracts-insurance/contract-clauses?company_id=${COMPANY}&status=active`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  return parseClauseList(j).filter((c) => c.mandatory).map((c) => c.id);
}

/** U65: flip mandatory via Settings FE when catalog has no mandatory row (not seed). */
async function ensureMandatoryClauseViaSettings(page, token) {
  const mandatoryBefore = await fetchMandatoryClauseIds(token);
  if (mandatoryBefore.length > 0) return { ok: true, prep: 'already_mandatory', ids: mandatoryBefore };

  const settingsUrl = `${PORTAL}/command-center/hrm/settings?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=contract-clauses&_=${Date.now()}`;
  await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);

  let hrmCtx = null;
  for (let i = 0; i < 60; i++) {
    for (const f of page.frames()) {
      if (await f.getByTestId('settings-contract-clauses').isVisible().catch(() => false)) {
        hrmCtx = f;
        break;
      }
    }
    if (hrmCtx) break;
    if (await page.getByTestId('settings-contract-clauses').isVisible().catch(() => false)) {
      hrmCtx = page;
      break;
    }
    await sleep(500);
  }
  if (!hrmCtx) return { ok: false, prep: 'settings_frame_missing' };

  const row = hrmCtx.locator('[data-testid^="ctr-clause-row-"]').first();
  if (!(await row.isVisible({ timeout: 15000 }).catch(() => false))) {
    return { ok: false, prep: 'no_clause_row' };
  }
  await row.getByRole('button', { name: 'Sửa' }).click();
  await sleep(1200);

  const dialog = await resolveSettingsDialog(page);
  if (!dialog) return { ok: false, prep: 'clause_dialog_missing' };

  const cb = dialog.getByTestId('ctr-clause-mandatory');
  if (!(await cb.isVisible({ timeout: 10000 }).catch(() => false))) {
    return { ok: false, prep: 'mandatory_checkbox_missing' };
  }
  const checked = await cb.getAttribute('data-state');
  if (checked !== 'checked') await cb.click();
  await sleep(300);

  const patchWait = page.waitForResponse(
    (res) =>
      res.request().method() === 'PATCH' &&
      /\/contract-clauses\//.test(res.url()) &&
      res.status() >= 200 &&
      res.status() < 300,
    { timeout: 30000 },
  );
  await dialog.getByTestId('ctr-clause-save').click();
  const patchRes = await patchWait.catch(() => null);
  await sleep(1500);
  await shot(page, '00-settings-mandatory-prep');

  const ids = await fetchMandatoryClauseIds(token);
  return {
    ok: ids.length > 0 && patchRes?.status() >= 200,
    prep: 'settings_mandatory_flip',
    patchStatus: patchRes?.status() ?? null,
    ids,
  };
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

async function resolveHrmFrame(page, timeoutMs = 120000) {
  const start = Date.now();
  let reloadAttempted = false;
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      if (await f.locator('[data-testid="hdsd-contracts-create-btn"]').first().isVisible().catch(() => false))
        return f;
    }
    if (await page.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false)) return page;
    if (!reloadAttempted && Date.now() - start > 25000) {
      reloadAttempted = true;
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(5000);
    }
    await sleep(500);
  }
  return null;
}

async function resolveShell(page, hrmCtx) {
  for (const ctx of [page, hrmCtx, ...page.frames()]) {
    if (!ctx) continue;
    if (await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false))
      return ctx;
  }
  return null;
}

async function pickTemplate(shell, searchText) {
  const combobox = shell.getByTestId('ctr-create-template-combobox');
  await combobox.click();
  await sleep(300);
  const input = combobox.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(searchText);
    await sleep(500);
  }
  await shell.getByRole('option', { name: new RegExp(searchText, 'i') }).first().click({ timeout: 20000 });
}

async function pickNv101(shell, page) {
  const picker = shell.getByTestId('hdsd-contracts-form-employee');
  await picker.click();
  await sleep(400);
  const inlineSearch = picker.locator('input').first();
  if (await inlineSearch.isVisible().catch(() => false)) {
    await inlineSearch.fill('NV101');
    await sleep(800);
  }
  for (const ctx of [shell, page, ...page.frames()]) {
    const opt = ctx.getByRole('option', { name: /NV101|Le Van C/i }).first();
    if (await opt.isVisible({ timeout: 10000 }).catch(() => false)) {
      await opt.click();
      return true;
    }
  }
  return false;
}

async function fillSigningDate(shell) {
  const btn = shell.getByTestId('ctr-create-signing-date');
  await btn.click();
  await sleep(300);
  const day = shell.getByRole('gridcell', { name: /^15$/ }).first();
  if (await day.isVisible().catch(() => false)) {
    await day.click();
    return true;
  }
  return false;
}

async function fillWorkArrangement(shell) {
  await shell.getByTestId('ctr-create-work-arrangement').click();
  await sleep(200);
  await shell.getByRole('option').first().click({ timeout: 10000 });
}

async function canvasClauseCount(shell) {
  return shell.getByTestId('ctr-create-clause-canvas').locator('.cursor-grab').count();
}

async function findMandatoryRemoveBtn(shell, mandatoryIds) {
  for (const id of mandatoryIds) {
    const btn = shell.getByTestId(`ctr-clause-remove-${id}`);
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      return { id, btn };
    }
  }
  // fallback: palette row with (bắt buộc) — add to canvas then test
  const palette = shell.getByTestId('ctr-create-clause-palette');
  const mandatoryRow = palette.getByText('bắt buộc', { exact: false }).first();
  if (await mandatoryRow.isVisible().catch(() => false)) {
    const row = mandatoryRow.locator('xpath=..').locator('xpath=..');
    const addBtn = row.getByRole('button', { name: /^Thêm$/ });
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await sleep(600);
    }
  }
  for (const id of mandatoryIds) {
    const btn = shell.getByTestId(`ctr-clause-remove-${id}`);
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      return { id, btn };
    }
  }
  return { id: null, btn: null };
}

async function main() {
  const session = await loginApi();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error') R.consoleErrors.push(t.slice(0, 240));
    if (DND_STORM_RE.test(t)) R.dnd_storms.push(t.slice(0, 200));
  });

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);

    R.confirm.settingsPrep = await ensureMandatoryClauseViaSettings(page, session.token);
    let mandatoryIds = R.confirm.settingsPrep.ids ?? await fetchMandatoryClauseIds(session.token);
    R.confirm.mandatoryIdsFromApi = mandatoryIds.length;

    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    await sleep(1500);
    const shell = await resolveShell(page, hrmCtx);
    if (!shell) throw new Error('workspace shell not visible');

    await shell.getByTestId('ctr-create-contract-code').fill(CODE_EMP);
    let catalogOk = false;
    for (const t of ['XEVN_FT', 'DRIVER', 'XEVN']) {
      try {
        await pickTemplate(shell, t);
        catalogOk = true;
        break;
      } catch {
        /* */
      }
    }
    if (!catalogOk) throw new Error('template pick failed');

    await fillSigningDate(shell);
    await fillWorkArrangement(shell);
    await shell.getByTestId('ctr-create-salary-ratio').fill('100');
    await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);
    await pickNv101(shell, page);

    const nextBtn = shell.getByTestId('ctr-create-next-btn');
    await nextBtn.click({ timeout: 15000 });
    await sleep(3000);

    const step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 45000 }).catch(() => false);
    if (!step2Open) throw new Error('step 2 not open');

    await shell.getByTestId('ctr-create-clause-dnd-ready').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    await sleep(1500);
    await shot(page, '01-step2-canvas');

    const { id: mandatoryId, btn: removeBtn } = await findMandatoryRemoveBtn(shell, mandatoryIds);
    R.confirm.mandatoryClauseId = mandatoryId;

    if (!removeBtn) {
      row('WS-G4-07', 'FAIL', { reason: 'no mandatory clause Gỡ on canvas', mandatoryIds: mandatoryIds.length });
      ac('AC-CTR-DND-02', 'FAIL', { reason: 'mandatory remove btn missing' });
      defect('DEF-CTR-G4-07-NO-MANDATORY', 'P1', 'no mandatory clause on canvas for confirm test');
    } else {
      const countBefore = await canvasClauseCount(shell);
      R.confirm.countBefore = countBefore;

      // Cancel path (Hủy / dismiss)
      let cancelDialog = null;
      page.once('dialog', async (dialog) => {
        cancelDialog = {
          type: dialog.type(),
          message: dialog.message(),
          dismissed: true,
        };
        await dialog.dismiss();
      });
      await removeBtn.click();
      await sleep(600);
      const countAfterCancel = await canvasClauseCount(shell);
      R.confirm.dialogOnCancel = cancelDialog;
      R.confirm.countAfterCancel = countAfterCancel;

      await shot(page, '02-after-cancel-dismiss');

      // Accept path (Đồng ý / OK)
      let acceptDialog = null;
      page.once('dialog', async (dialog) => {
        acceptDialog = {
          type: dialog.type(),
          message: dialog.message(),
          accepted: true,
        };
        await dialog.accept();
      });
      await removeBtn.click();
      await sleep(600);
      const countAfterAccept = await canvasClauseCount(shell);
      R.confirm.dialogOnAccept = acceptDialog;
      R.confirm.countAfterAccept = countAfterAccept;

      await shot(page, '03-after-accept-remove');

      const msgOk =
        (cancelDialog?.message?.includes(EXPECT_MSG) || acceptDialog?.message?.includes(EXPECT_MSG)) ?? false;
      const cancelKeeps = countAfterCancel === countBefore;
      const acceptRemoves = countAfterAccept < countAfterCancel;
      const dialogShown = Boolean(cancelDialog || acceptDialog);
      R.confirm.silentRemoveOnMandatory = !dialogShown && countAfterAccept < countBefore;

      const pass =
        dialogShown &&
        msgOk &&
        cancelKeeps &&
        acceptRemoves &&
        !R.confirm.silentRemoveOnMandatory;

      row('WS-G4-07', pass ? 'PASS' : 'FAIL', {
        mandatoryId,
        msgOk,
        cancelKeeps,
        acceptRemoves,
        dialogShown,
        cancelMsg: cancelDialog?.message?.slice(0, 120),
        acceptMsg: acceptDialog?.message?.slice(0, 120),
      });
      ac('AC-CTR-DND-02', pass ? 'PASS' : 'FAIL', {
        mandatoryId,
        cancelKeeps,
        acceptRemoves,
        dialogShown,
      });
      ac('AC-WS-06', pass ? 'PASS' : 'FAIL', { note: 'DnD + Gỡ mandatory confirm' });

      if (!dialogShown) defect('DEF-CTR-G4-07-SILENT-GO', 'P1', 'Gỡ mandatory without confirm');
      if (dialogShown && !msgOk) defect('DEF-CTR-G4-07-MSG', 'P2', 'confirm message missing VI text');
      if (!cancelKeeps) defect('DEF-CTR-G4-07-CANCEL', 'P1', 'dismiss did not keep clause');
      if (!acceptRemoves) defect('DEF-CTR-G4-07-ACCEPT', 'P1', 'accept did not remove clause');
    }

    journey(
      'J-HRM-CTR-CREATE-02',
      R.rows['WS-G4-07']?.verdict === 'PASS' ? 'PASS' : R.rows['WS-G4-07']?.verdict === 'FAIL' ? 'FAIL' : 'BLOCKED',
      { ws_g4_07: R.rows['WS-G4-07']?.verdict },
    );
  } catch (fatal) {
    R.fatal = String(fatal);
    row('WS-G4-07', 'FAIL', { fatal: String(fatal).slice(0, 200) });
    ac('AC-CTR-DND-02', 'FAIL', { fatal: String(fatal).slice(0, 120) });
    defect('DEF-CTR-G4-07-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const fail = R.rows['WS-G4-07']?.verdict === 'FAIL' || R.defects.some((d) => d.severity === 'P0');
  R.ack_status = fail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  R.overall = R.rows['WS-G4-07']?.verdict === 'PASS' ? 'PASS' : 'FAIL';
  R.endedAt = ts();

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  console.log('ack_status', R.ack_status);
  console.log('WS-G4-07', JSON.stringify(R.rows['WS-G4-07']));
  console.log('confirm', JSON.stringify(R.confirm));
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  process.exit(1);
});
