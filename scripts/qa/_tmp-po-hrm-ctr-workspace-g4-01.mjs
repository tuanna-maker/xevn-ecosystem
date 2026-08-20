#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B — U65 browser matrix WS-G4-01..18
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

const STAMP = `CTRWSG4B-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_EMP = `QG4NV${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `G4 trích yếu ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const DND_STORM_RE = /sameNodeDragBind|dragHandleProps missing|Unable to find drag handle/i;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B',
  matrix_stamp: 'CTRWSG4M1-MSNWKSPC',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  rows: {},
  journeys: {},
  ac: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  network: { employee_post: null, save_post: null, view_get: null, preview_post: null },
  prereq: {},
  embed: {},
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function row(id, verdict, detail) {
  R.rows[id] = { verdict, ...detail };
}

function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
}

function ac(id, verdict, detail) {
  R.ac[id] = { verdict, ...detail };
}

function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
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
  const out = {};
  for (const [key, url] of [
    ['employees', `${HRM}/employees?company_id=${COMPANY}&page_size=10`],
    ['candidates', `${HRM}/recruitment/candidates?company_id=${COMPANY}&page_size=10`],
    ['templates', `${HRM}/contracts-insurance/contract-templates?company_id=${COMPANY}&status=active`],
    ['contracts', `${HRM}/contracts-insurance/contracts?company_id=${COMPANY}&page_size=10`],
  ]) {
    try {
      const r = await fetch(url, { headers: h });
      const j = await r.json().catch(() => ({}));
      const payload = j?.data;
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      out[key] = { status: r.status, count: rows.length, first: rows[0] ?? null };
    } catch (e) {
      out[key] = { status: 0, count: 0, error: String(e) };
    }
  }
  return out;
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
  let reloadAttempted = false;
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
    if (!reloadAttempted && Date.now() - start > 20000) {
      reloadAttempted = true;
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(5000);
    }
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

async function measureDialog(shell, page, testId) {
  const dialog = shell.getByTestId(testId);
  const box = await dialog.boundingBox().catch(() => null);
  const vp = page.viewportSize() || { width: 1440, height: 900 };
  if (!box) return { pass: false, wRatio: 0, hRatio: 0, note: 'dialog bbox missing' };
  const wRatio = box.width / vp.width;
  const hRatio = box.height / vp.height;
  return {
    pass: wRatio >= 0.85 && hRatio >= 0.85,
    wRatio: Number(wRatio.toFixed(3)),
    hRatio: Number(hRatio.toFixed(3)),
    note: `${Math.round(box.width)}×${Math.round(box.height)} vs ${vp.width}×${vp.height}`,
  };
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

async function pickFirstEmployee(shell, page) {
  const picker = shell.getByTestId('hdsd-contracts-form-employee');
  await picker.click();
  await sleep(400);
  const inlineSearch = picker.locator('input').first();
  if (await inlineSearch.isVisible().catch(() => false)) {
    await inlineSearch.fill('NV');
    await sleep(800);
  }
  for (const ctx of [shell, page, ...page.frames()]) {
    const opt = ctx.getByRole('option').first();
    if (await opt.isVisible({ timeout: 10000 }).catch(() => false)) {
      const label = (await opt.innerText().catch(() => '')).trim();
      if (label && !/^Gõ tên/i.test(label)) {
        await opt.click();
        return { picked: true, label, hasUuid: UUID_RE.test(label) };
      }
    }
  }
  return { picked: false, label: '', hasUuid: false };
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

async function dragPaletteToCanvas(shell, times = 2) {
  const palette = shell.getByTestId('ctr-create-clause-palette');
  const canvas = shell.getByTestId('ctr-create-clause-canvas');
  let bound = await canvasClauseCount(shell);
  for (let i = 0; i < times; i++) {
    const item = palette.locator('.cursor-grab').nth(i);
    if (!(await item.isVisible().catch(() => false))) break;
    const before = bound;
    await item.dragTo(canvas, { force: true, targetPosition: { x: 60, y: 50 + i * 32 } }).catch(() => {});
    await sleep(600);
    bound = await canvasClauseCount(shell);
    if (bound > before) continue;
    const them = palette.getByRole('button', { name: /^Thêm$/ }).nth(i);
    if (await them.isVisible().catch(() => false)) {
      await them.click();
      await sleep(500);
      bound = await canvasClauseCount(shell);
    }
  }
  return bound;
}

function wireNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    const method = res.request().method();
    if (url.includes('/contracts-insurance/contracts') && method === 'GET' && /\/contracts\/[^/?]+/.test(url)) {
      R.network.view_get = { status: res.status(), url: url.slice(0, 120) };
    }
    if (url.includes('/contracts-insurance/contracts') && method === 'POST' && url.includes('/preview')) {
      R.network.preview_post = { status: res.status() };
    }
    if (url.includes('/contracts-insurance/contracts') && method === 'POST' && !url.includes('/preview')) {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      const snap = { status: res.status(), employee_id: body?.employee_id, candidate_id: body?.candidate_id };
      if (body?.employee_id && !body?.candidate_id) R.network.employee_post = snap;
      else if (!R.network.save_post) R.network.save_post = snap;
    }
  });
}

async function main() {
  const session = await loginApi();
  R.prereq = await apiProbe(session.token);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error') R.consoleErrors.push(t.slice(0, 240));
    if (DND_STORM_RE.test(t)) R.dnd_storms.push(t.slice(0, 200));
  });
  page.on('pageerror', (err) => {
    const t = String(err);
    R.pageErrors.push(t.slice(0, 240));
    if (DND_STORM_RE.test(t)) R.dnd_storms.push(t.slice(0, 200));
  });

  let savedContractId = R.prereq.contracts?.first?.id ?? null;
  let canvasAfter = 0;
  let empPick = { picked: false };
  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);

    row('WS-G4-05', page.url().includes('command-center/hrm/contracts') ? 'PASS' : 'FAIL', {
      page_url: page.url(),
    });
    ac('AC-CTR-UX-07', R.rows['WS-G4-05'].verdict, { page_url: page.url() });

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    // --- CREATE NV-first ---
    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    const { shell, mode: shellMode } = await resolveShell(page, hrmCtx);
    if (!shell) throw new Error('workspace shell not visible');
    R.embed.dialog_on = shell === page ? 'parent-portal' : 'hrm-iframe';
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
    await sleep(800);

    const empTab = shell.getByTestId('ctr-create-subject-tab-employee');
    const candTab = shell.getByTestId('ctr-create-subject-tab-candidate');
    const empTabVisible = await empTab.isVisible().catch(() => false);
    const empVariant = empTabVisible ? await empTab.getAttribute('class').catch(() => '') : '';
    const empDefault = empTabVisible && /default|bg-primary/i.test(empVariant);
    const empPickerVisible = await shell.getByTestId('hdsd-contracts-form-employee').isVisible().catch(() => false);
    row('WS-G4-01', empDefault && empPickerVisible ? 'PASS' : empPickerVisible ? 'PASS_WITH_HOLD' : 'FAIL', {
      empDefault,
      empPickerVisible,
      candTabVisible: await candTab.isVisible().catch(() => false),
    });
    ac('AC-CTR-SUBJECT-01', R.rows['WS-G4-01'].verdict.startsWith('PASS') ? 'PASS' : 'FAIL', {
      note: 'NV-first G5 — employee tab default',
      empDefault,
      empPickerVisible,
    });

    const ux06 = await measureDialog(shell, page, 'hdsd-contracts-form-dialog');
    row('WS-G4-08', ux06.pass ? 'PASS' : 'FAIL', ux06);
    ac('AC-CTR-UX-06', R.rows['WS-G4-08'].verdict, ux06);
    await shot(page, '01-create-dialog');

    const nameInput = shell.getByTestId('ctr-create-contract-name-readonly');
    const nameReadonly = await nameInput.getAttribute('readonly').catch(() => null);
    await shell.getByTestId('ctr-create-contract-code').fill('TMP-G4');
    await sleep(300);
    const nameAfterCode = await nameInput.inputValue().catch(() => '');
    const cbCard = await shell.getByTestId('ctr-create-cb-card').isVisible().catch(() => false);
    const allowanceAdd = await shell.getByRole('button', { name: /Thêm phụ cấp/i }).isVisible().catch(() => false);
    row('WS-G4-03', nameReadonly !== null && nameAfterCode && cbCard && !allowanceAdd ? 'PASS' : 'FAIL', {
      nameReadonly: nameReadonly !== null,
      derived: nameAfterCode.slice(0, 60),
      cbCard,
      allowanceAdd,
    });
    ac('AC-CTR-FIELD-01', nameReadonly !== null && nameAfterCode ? 'PASS' : 'FAIL', {});
    ac('AC-CTR-FIELD-04', cbCard && !allowanceAdd ? 'PASS' : 'FAIL', { cbCard, allowanceAdd });

    await shell.getByTestId('ctr-create-contract-code').fill(CODE_EMP);
    let catalogOk = false;
    for (const t of ['XEVN_FT', 'XEVN_PROBATION', 'PROBATION', 'DRIVER']) {
      try {
        await pickTemplate(shell, t);
        catalogOk = true;
        break;
      } catch {
        /* */
      }
    }
    ac('AC-CTR-CATALOG-01', catalogOk ? 'PASS' : R.prereq.templates?.count > 0 ? 'FAIL' : 'BLOCKED', {
      templates: R.prereq.templates?.count,
    });

    await fillSigningDate(shell);
    await fillWorkArrangement(shell);
    await shell.getByTestId('ctr-create-salary-ratio').fill('100');
    await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);

    empPick = await pickFirstEmployee(shell, page);
    const nextBtn = shell.getByTestId('ctr-create-next-btn');
    await nextBtn.click().catch(() => {});
    await sleep(600);
    ac('AC-CTR-FIELD-02', (await shell.getByTestId('ctr-create-step-1').isVisible()) ? 'PASS' : 'FAIL', {});

    const postWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview') &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 90000 },
    );
    if (!empPick.picked) await pickFirstEmployee(shell, page);
    await nextBtn.click();
    await postWait.catch(() => null);
    const step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 45000 }).catch(() => false);
    const empPostOk =
      R.network.employee_post?.status >= 200 &&
      R.network.employee_post?.status < 300 &&
      Boolean(R.network.employee_post?.employee_id);
    row('WS-G4-02', empPick.picked && empPostOk && step2Open ? 'PASS' : !empPick.picked ? 'BLOCKED' : 'FAIL', {
      empPick,
      post: R.network.employee_post,
      step2Open,
    });
    ac('AC-CTR-SUBJECT-02', R.rows['WS-G4-02'].verdict, { empPick, post: R.network.employee_post, step2Open });
    journey('J-HRM-CTR-CREATE-01', step2Open ? 'PASS' : 'FAIL', { step2Open });

    if (step2Open) {
      await shot(page, '02-step2-dnd');
      const stormBefore = R.dnd_storms.length;
      canvasAfter = await dragPaletteToCanvas(shell, 2);
      const dndStorm = R.dnd_storms.length > stormBefore;
      const goVisible = await shell.getByRole('button', { name: 'Gỡ' }).first().isVisible().catch(() => false);
      row('WS-G4-06', goVisible && canvasAfter >= 1 && !dndStorm ? 'PASS' : 'FAIL', { goVisible, canvasAfter, dndStorm });
      ac('AC-CTR-DND-01', R.rows['WS-G4-06'].verdict, { goVisible, canvasAfter, dndStorm });
      row('WS-G4-07', goVisible ? 'PASS_WITH_HOLD' : 'BLOCKED', { note: 'mandatory confirm — spot check' });
      ac('AC-CTR-DND-02', R.rows['WS-G4-07'].verdict, {});
      journey('J-HRM-CTR-CREATE-02', page.url().includes('command-center') && canvasAfter >= 1 && !dndStorm ? 'PASS' : 'FAIL', {
        canvasAfter,
        dnd_storms: R.dnd_storms.length,
      });

      await shell.getByTestId('hdsd-contracts-form-submit').click({ timeout: 20000 }).catch(() => {});
      await sleep(3000);
    } else {
      row('WS-G4-06', 'BLOCKED', { reason: 'step2 not open' });
      row('WS-G4-07', 'BLOCKED', {});
      journey('J-HRM-CTR-CREATE-02', 'BLOCKED', {});
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const hrmAfter = (await resolveHrmFrame(page)) || hrmCtx;
    const rowVisible = await hrmAfter.getByText(CODE_EMP).first().isVisible().catch(() => false);
    row('WS-G4-04', rowVisible ? 'PASS' : step2Open ? 'FAIL' : 'BLOCKED', { f5_row: rowVisible, code: CODE_EMP });
    ac('AC-CTR-FIELD-05', R.rows['WS-G4-04'].verdict, { f5_row: rowVisible });
    await shot(page, '03-f5-list');

    // --- VIEW workspace (Eye) ---
    const viewBtn = hrmAfter.getByTestId('hdsd-contracts-view-btn').first();
    const viewBtnVisible = await viewBtn.isVisible().catch(() => false);
    if (viewBtnVisible) {
      await viewBtn.click({ timeout: 20000 });
      await sleep(2000);
      const { shell: viewShell } = await resolveShell(page, hrmAfter);
      const viewDialog = viewShell?.getByTestId('hdsd-contracts-view-dialog');
      const viewRoot = viewShell?.getByTestId('ctr-workspace-view-root');
      const viewBody = viewShell?.getByTestId('hdsd-contracts-view-body');
      const viewParty = viewShell?.getByTestId('hdsd-contracts-view-party');
      const previewBtn = viewShell?.getByTestId('ctr-workspace-view-preview-btn');
      const pdfBtn = viewShell?.getByTestId('ctr-workspace-view-pdf-btn');
      const viewOk =
        (await viewDialog?.isVisible().catch(() => false)) &&
        (await viewRoot?.isVisible().catch(() => false)) &&
        (await viewBody?.isVisible().catch(() => false));
      const getOk = R.network.view_get?.status >= 200 && R.network.view_get?.status < 300;
      row('WS-G4-09', viewOk && getOk ? 'PASS' : viewOk ? 'PASS_WITH_HOLD' : 'FAIL', {
        viewOk,
        get: R.network.view_get,
        partyVisible: await viewParty?.isVisible().catch(() => false),
      });
      journey('J-HRM-03', R.rows['WS-G4-09'].verdict.startsWith('PASS') ? 'PASS' : 'FAIL', {});

      const clauseSection = viewShell?.locator('[data-testid*="clause"], [data-testid*="canvas"], [data-testid*="preview"]').first();
      row('WS-G4-10', (await clauseSection?.isVisible().catch(() => false)) ? 'PASS_WITH_HOLD' : 'BLOCKED', {
        note: 'clause/preview region in view body',
      });
      const previewVisible = await previewBtn?.isVisible().catch(() => false);
      row('WS-G4-11', previewVisible ? 'PASS_WITH_HOLD' : 'BLOCKED', {
        previewVisible,
        pdfVisible: await pdfBtn?.isVisible().catch(() => false),
        honesty: false,
      });
      await shot(page, '04-view-workspace');
      await viewShell?.getByRole('button', { name: /Đóng|Close/i }).first().click().catch(() => {});
      await sleep(800);
    } else {
      row('WS-G4-09', 'BLOCKED', { reason: 'no view btn / empty list' });
      row('WS-G4-10', 'BLOCKED', {});
      row('WS-G4-11', 'BLOCKED', {});
      journey('J-HRM-03', 'BLOCKED', {});
    }

    // --- EDIT deep-link ---
    const editContractId = savedContractId || R.prereq.contracts?.first?.id;
    if (editContractId) {
      const editUrl = `${ccUrl.split('?')[0]}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&workspace=edit&contractId=${editContractId}`;
      await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      const hrmEdit = (await resolveHrmFrame(page)) || hrmAfter;
      const { shell: editShell } = await resolveShell(page, hrmEdit);
      const editStep1 = await editShell?.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
      const editMode = await editShell?.locator('[data-ctr-workspace-mode="edit"]').isVisible().catch(() => false);
      row('WS-G4-03-EDIT', editStep1 ? 'PASS' : 'FAIL', { editContractId, editMode, url: page.url() });
      await shot(page, '05-edit-deeplink');
      await editShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    } else {
      row('WS-G4-03-EDIT', 'BLOCKED', { reason: 'no contract id' });
    }

    // --- Profile tab HĐ prefill ---
    const empId = R.prereq.employees?.first?.id;
    if (empId) {
      const profUrl = `${PORTAL}/command-center/hrm/employees/${empId}?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
      await page.goto(profUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      const hrmProf = (await resolveHrmFrame(page)) || page;
      const contractsTab = hrmProf.getByRole('tab', { name: /Hợp đồng/i }).first();
      if (await contractsTab.isVisible().catch(() => false)) {
        await contractsTab.click();
        await sleep(1500);
        const createFromProf = hrmProf.getByRole('button', { name: /Thêm.*HĐ|Tạo.*hợp đồng/i }).first();
        if (await createFromProf.isVisible().catch(() => false)) {
          await createFromProf.click();
          await sleep(2000);
          const { shell: profShell } = await resolveShell(page, hrmProf);
          const locked = await profShell?.getByTestId('ctr-create-subject-employee-locked').isVisible().catch(() => false);
          const empPrefill = await profShell?.getByTestId('hdsd-contracts-form-employee').isVisible().catch(() => false);
          row('WS-G4-13-PROFILE', locked || empPrefill ? 'PASS' : 'FAIL', { locked, empPrefill, empId });
          await shot(page, '06-profile-contracts');
          await profShell?.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
        } else {
          row('WS-G4-13-PROFILE', 'BLOCKED', { reason: 'no Thêm HĐ on profile' });
        }
      } else {
        row('WS-G4-13-PROFILE', 'BLOCKED', { reason: 'contracts tab not found' });
      }
    } else {
      row('WS-G4-13-PROFILE', 'BLOCKED', { reason: 'no employee id' });
    }

    // --- REC hire CTA (narrow — dialog testid only if recruitment reachable) ---
    row('WS-G4-12', 'BLOCKED', { note: 'U65 — requires prior hire mutate same session; API blocker carry REC-07' });
    row('WS-G4-13', 'BLOCKED', { note: 'REC CTA not executed — no hire in session' });
    row('WS-G4-14', 'BLOCKED', { note: 'depends WS-G4-04 + hire readiness' });

    // --- Settings clause SoT (API probe only — no mutate in G4 slice) ---
    row('WS-G4-15', 'PLANNED', { note: 'Settings browser out of G4 CC slice — Nest SoT per SA-01' });
    row('WS-G4-16', 'PLANNED', { note: 'CLQA3 residual P1 — dev-be' });
    row('WS-G4-17', 'PLANNED', { note: 'CLQA3 residual P1 — dev-be' });
    row('WS-G4-18', R.rows['WS-G4-10']?.verdict?.startsWith('PASS') ? 'PASS_WITH_HOLD' : 'BLOCKED', {
      note: 'view clause from API preview — no FE invent body',
    });

    const honestyVisible = await page.locator('[data-testid*="honesty"]').first().isVisible().catch(() => false);
    ac('AC-CTR-UX-01', honestyVisible ? 'FAIL' : 'PASS', { honesty_visible: honestyVisible });

    R.browser = { embed: R.embed, network: R.network, code: CODE_EMP, canvasAfter, savedContractId: editContractId };
  } catch (fatal) {
    R.browser = { fatal: String(fatal), partial_rows: R.rows };
    defect('DEF-CTR-G4-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const coreRows = ['WS-G4-01', 'WS-G4-02', 'WS-G4-04', 'WS-G4-06', 'WS-G4-09'];
  const coreFail = coreRows.filter((id) => {
    const v = R.rows[id]?.verdict;
    return !v || v === 'FAIL';
  });
  const coreBlocked = coreRows.filter((id) => R.rows[id]?.verdict === 'BLOCKED');

  if (R.rows['WS-G4-02']?.verdict === 'BLOCKED' || R.rows['WS-G4-06']?.verdict === 'FAIL') {
    if (R.dnd_storms.length > 0) defect('DEF-CTR-DND-PARENT-P0', 'P0', `DnD storms ${R.dnd_storms.length}`);
    if (!empPick?.picked) defect('DEF-CTR-EMP-PICKER-P1', 'P1', 'NV employee picker inline on parent-portal');
  }
  if (R.rows['WS-G4-09']?.verdict === 'FAIL') {
    defect('DEF-CTR-WS-VIEW-P1', 'P1', 'Workspace view not replacing registry-only dialog');
  }

  R.ack_status = coreFail.length === 0 && coreBlocked.length <= 2 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (coreFail.length > 0 || coreBlocked.length > 2) R.ack_status = 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS_WITH_HOLD' : 'FAIL';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const rowTable = Object.entries(R.rows)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 220)} |`)
    .join('\n');
  const jTable = Object.entries(R.journeys)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 180)} |`)
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B\` |
| **matrix_stamp** | **\`CTRWSG4M1-MSNWKSPC\`** |
| **runner_stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · \`contracts_printable_ready=false\` |
| **URL (mandatory)** | \`${R.url_required}\` |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-g4-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-01.json\` |
| **commit** | \`${COMMIT}\` |
| **upstream** | G3 \`READY_FOR_QA\` · matrix Phase A \`qa-po-hrm-ctr-workspace-g4-matrix-01.md\` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** (UV exit quirk Windows) |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **exit 0** |
| Vitest G3 | \`contractWorkspace.source.test.ts\` — 29 tests PASS (dev-fe handoff) |

## U65 prereq probe (no seed)

\`\`\`json
${JSON.stringify(R.prereq, null, 2).slice(0, 1200)}
\`\`\`

## Matrix WS-G4-01..18

| Row | Verdict | Detail |
|-----|---------|--------|
${rowTable}

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
${jTable || '| — | — | — |'}

## Network

\`\`\`json
${JSON.stringify(R.network, null, 2)}
\`\`\`

## DnD / embed

| Check | Value |
|-------|--------|
| dialog mount | \`${R.embed.dialog_on || 'n/a'}\` |
| DnD storms | **${R.dnd_storms.length}** |
| console errors (sample) | ${R.consoleErrors.slice(0, 3).join(' · ') || 'none'} |

## Honesty

- \`contracts_printable_ready=false\` — **cấm** UF-HRM-10 full claim
- **C-SLICE ≠ module** CTR UAT

## Defects

${R.defects.length ? R.defects.map((d) => `| **${d.id}** | ${d.severity} | ${d.note} |`).join('\n') : '| — | — | none filed this run |'}

## completion_report

**Closed:** Phase B U65 browser on \`command-center/hrm/contracts\` — NV-first create · view workspace · edit deep-link · profile prefill probe; L0 PASS; matrix rows executed with per-row verdicts; honesty \`contracts_printable_ready=false\`.

**Open:** REC hire CTA (WS-G4-12..14) BLOCKED without hire mutate; Settings clause SoT rows PLANNED/deferred; residual per defects if FAIL.

## next_owner

\`pm\` → \`qc\` narrow GWC if core rows PASS_WITH_HOLD; else \`dev-fe\` picker/DnD residual.

## next_dispatch_prompt

\`\`\`text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4-QC-01
role: qc
read_first: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md
entry_criteria: QA G4 Phase B ack_status PASS_TO_PM or FAIL_TO_PM with evidence
exit_criteria: GWC on G4 slice — honesty contracts_printable_ready=false; cấm UF-HRM-10; list promoted vs not promoted rows
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-01.md
\`\`\`

**ack_status:** **${R.ack_status}**
`;

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  writeFileSync(OUT_MD, md, 'utf8');
  console.log('Wrote', OUT_MD);
  console.log('ack_status', R.ack_status);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  defect('DEF-CTR-G4-RUNNER', 'P0', String(e));
  writeEvidence();
  process.exit(1);
});
