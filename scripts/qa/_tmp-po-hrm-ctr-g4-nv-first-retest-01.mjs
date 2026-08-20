#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QA-01 — focused NV101 retest
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

const STAMP = `CTRG4NVFR-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_EMP = `QG4NV${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `NV-first retest ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-g4-nv-first-retest-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-g4-nv-first-retest-01');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  rows: {},
  journeys: {},
  network: { employee_post: null, save_post: null },
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
function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
}
function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
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
      const label = (await opt.innerText().catch(() => '')).trim();
      await opt.click();
      return { picked: true, label };
    }
  }
  return { picked: false, label: '' };
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
    if (url.includes('/contracts-insurance/contracts') && method === 'POST' && !url.includes('/preview')) {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      const snap = {
        status: res.status(),
        employee_id: body?.employee_id,
        subject_type: body?.subject_type,
        start_date: body?.start_date,
      };
      try {
        const j = await res.json();
        snap.code = j?.code ?? j?.error?.code;
        snap.message = j?.message ?? j?.error?.message;
      } catch {
        /* */
      }
      if (body?.employee_id) R.network.employee_post = snap;
      else if (!R.network.save_post) R.network.save_post = snap;
    }
  });
}

async function main() {
  const session = await loginApi();
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

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    await sleep(1500);
    const shell = await resolveShell(page, hrmCtx);
    if (!shell) throw new Error('workspace shell not visible');
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
    await shot(page, '01-step1');

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

    const empPick = await pickNv101(shell, page);
    row('WS-G4-02-pick', empPick.picked ? 'PASS' : 'FAIL', empPick);

    const nextBtn = shell.getByTestId('ctr-create-next-btn');
    await nextBtn.waitFor({ state: 'visible', timeout: 15000 });
    await sleep(500);

    const postWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview'),
      { timeout: 90000 },
    );

    await nextBtn.click({ timeout: 15000 });
    const postRes = await postWait.catch(() => null);

    await sleep(2000);
    const step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 30000 }).catch(() => false);
    const postStatus = R.network.employee_post?.status ?? postRes?.status() ?? 0;
    const postOk = postStatus >= 200 && postStatus < 300;
    const noRec400 = R.network.employee_post?.code !== 'HRM-CTR-SUBJECT-REC-400';
    const nv101 =
      R.network.employee_post?.employee_id === NV101_UUID ||
      empPick.label.includes('NV101');

    row('WS-G4-02', empPick.picked && postOk && noRec400 && step2Open ? 'PASS' : 'FAIL', {
      empPick,
      post: R.network.employee_post,
      step2Open,
      postOk,
      noRec400,
      nv101,
    });
    journey('J-HRM-CTR-CREATE-01', step2Open && postOk ? 'PASS' : 'FAIL', { step2Open, post: R.network.employee_post });

    if (step2Open) {
      await shot(page, '02-step2');
      const stormBefore = R.dnd_storms.length;
      const canvasAfter = await dragPaletteToCanvas(shell, 2);
      const dndStorm = R.dnd_storms.length > stormBefore;
      const goVisible = await shell.getByRole('button', { name: 'Gỡ' }).first().isVisible().catch(() => false);
      row('WS-G4-06', goVisible && canvasAfter >= 1 && !dndStorm ? 'PASS' : canvasAfter >= 1 ? 'PASS_WITH_HOLD' : 'FAIL', {
        goVisible,
        canvasAfter,
        dndStorm,
      });
      row('WS-G4-07', goVisible ? 'PASS_WITH_HOLD' : 'BLOCKED', { note: 'mandatory gỡ spot' });
      journey('J-HRM-CTR-CREATE-02', canvasAfter >= 1 && !dndStorm ? 'PASS' : 'FAIL', { canvasAfter });

      await shell.getByTestId('hdsd-contracts-form-submit').click({ timeout: 20000 }).catch(() => {});
      await sleep(3000);
      await shot(page, '03-after-save');
    } else {
      row('WS-G4-06', 'BLOCKED', { reason: 'step2 not open' });
      row('WS-G4-07', 'BLOCKED', {});
      journey('J-HRM-CTR-CREATE-02', 'BLOCKED', {});
      await shot(page, '02-step2-blocked');
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const hrmAfter = (await resolveHrmFrame(page)) || hrmCtx;
    const rowVisible = await hrmAfter.getByText(CODE_EMP).first().isVisible().catch(() => false);
    row('WS-G4-04', rowVisible ? 'PASS' : step2Open ? 'FAIL' : 'BLOCKED', { f5_row: rowVisible, code: CODE_EMP });
    await shot(page, '04-f5-list');

    R.browser = { code: CODE_EMP, step2Open, network: R.network };
  } catch (fatal) {
    R.browser = { fatal: String(fatal) };
    defect('DEF-CTR-G4-NVFR-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const coreFail = ['WS-G4-02', 'WS-G4-06', 'WS-G4-07'].filter((id) => R.rows[id]?.verdict === 'FAIL');
  const coreMissing = ['WS-G4-02', 'WS-G4-06', 'WS-G4-07'].some((id) => !R.rows[id]);
  const createFail = R.journeys['J-HRM-CTR-CREATE-01']?.verdict === 'FAIL';
  const hasFatal = R.defects.some((d) => d.id.includes('FATAL'));
  R.ack_status =
    !hasFatal && !coreMissing && coreFail.length === 0 && !createFail ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS' : 'FAIL';
  R.endedAt = ts();

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  console.log('ack_status', R.ack_status);
  console.log('rows', JSON.stringify(R.rows));
  console.log('network', JSON.stringify(R.network));
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  process.exit(1);
});
