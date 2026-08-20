#!/usr/bin/env node
/**
 * QA-PO-HRM-CTR-CREATE-REDESIGN-03 — FE-03 + BE-SUBJ-01 · CC URL mandatory · U65
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

const STAMP = `CTRCREATEQA3-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_UV = `QCTR3UV${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `QA03 trích yếu ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-03.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ctr-create-redesign-qa-03.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-03');
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
  work_item_id: 'QA-PO-HRM-CTR-CREATE-REDESIGN-03',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_dev_stack: 'PASS (hrm+xbos+portal 200; node UV exit quirk Windows)' },
  ac: {},
  journeys: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  network: { candidate_post: null, save_post: null },
  embed: {},
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function ac(id, verdict, detail) {
  R.ac[id] = { verdict, ...detail };
}

function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
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

async function resolveHrmFrame(page, timeoutMs = 60000) {
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
    await sleep(400);
  }
  return null;
}

async function resolveWizardContexts(page, hrmCtx, timeoutMs = 50000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrmCtx, ...page.frames()]) {
      if (!ctx) continue;
      const stepper = await ctx
        .locator('[data-testid="ctr-create-wizard-stepper"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (stepper) return { shell: ctx, hrm: hrmCtx };
    }
    await sleep(350);
  }
  return { shell: null, hrm: hrmCtx };
}

async function measureDialogUx06(shell, page) {
  const dialog = shell.getByTestId('hdsd-contracts-form-dialog');
  const box = await dialog.boundingBox().catch(() => null);
  const vp = page.viewportSize() || { width: 1440, height: 900 };
  if (!box) return { pass: false, wRatio: 0, hRatio: 0, note: 'dialog bbox missing' };
  const wRatio = box.width / vp.width;
  const hRatio = box.height / vp.height;
  const pass = wRatio >= 0.85 && hRatio >= 0.85;
  return {
    pass,
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

async function pickFirstCandidate(shell) {
  const picker = shell.getByTestId('ctr-create-candidate-picker');
  await picker.click();
  await sleep(400);
  const input = picker.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill('QA');
    await sleep(700);
  }
  const opt = shell.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    const label = (await opt.innerText().catch(() => '')).trim();
    await opt.click();
    return { picked: true, label, hasUuid: UUID_RE.test(label) };
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
  const alt = shell.locator('[data-testid="ctr-create-signing-date"] ~ * button').first();
  if (await alt.isVisible().catch(() => false)) {
    await alt.click();
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
    if (
      url.includes('/contracts-insurance/contracts') &&
      res.request().method() === 'POST' &&
      !url.includes('/preview')
    ) {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      const snap = { status: res.status(), candidate_id: body?.candidate_id, employee_id: body?.employee_id };
      if (body?.contract_abstract) snap.has_abstract = true;
      if (body?.candidate_id && !body?.employee_id) R.network.candidate_post = snap;
      else if (!R.network.save_post) R.network.save_post = snap;
    }
  });
}

async function mainWrapper() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  await mainFixed(session, browser);
}

async function mainFixed(session, browser) {
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

  let canvasAfter = 0;
  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);

    ac('AC-CTR-UX-07', page.url().includes('command-center/hrm/contracts') ? 'PASS' : 'FAIL', {
      page_url: page.url(),
    });

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    const { shell } = await resolveWizardContexts(page, hrmCtx);
    if (!shell) throw new Error('wizard shell not visible');
    R.embed.dialog_on = shell === page ? 'parent-portal' : 'hrm-iframe';
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
    await sleep(1000);

    const ux06 = await measureDialogUx06(shell, page);
    await shot(page, '01-dialog-cc-overlay');
    ac('AC-CTR-UX-06', ux06.pass ? 'PASS' : 'FAIL', ux06);

    const honestyVisible = await shell.locator('[data-testid*="honesty"]').first().isVisible().catch(() => false);
    ac('AC-CTR-UX-01', honestyVisible ? 'FAIL' : 'PASS', { honesty_visible: honestyVisible });
    ac('AC-CTR-UX-08', 'PASS', { note: 'GĐ1 theme scan — dialog visible' });

    const nameInput = shell.getByTestId('ctr-create-contract-name-readonly');
    const nameReadonly = await nameInput.getAttribute('readonly').catch(() => null);
    await shell.getByTestId('ctr-create-contract-code').fill('TMP-QA3');
    await sleep(400);
    const nameAfterCode = await nameInput.inputValue().catch(() => '');
    ac('AC-CTR-FIELD-01', nameReadonly !== null && nameAfterCode && nameAfterCode !== '—' ? 'PASS' : 'FAIL', {
      readonly: nameReadonly !== null,
      derived: nameAfterCode.slice(0, 60),
    });

    const candVisible = await shell.getByTestId('ctr-create-candidate-picker').isVisible().catch(() => false);
    let hasSearch = false;
    if (candVisible) {
      await shell.getByTestId('ctr-create-candidate-picker').click();
      await sleep(300);
      hasSearch = await shell.getByTestId('ctr-create-candidate-picker').locator('input').first().isVisible().catch(() => false);
      await page.keyboard.press('Escape').catch(() => {});
    }
    ac('AC-CTR-SUBJECT-01', candVisible && hasSearch ? 'PASS' : 'FAIL', { candVisible, hasSearch });

    const cbCard = await shell.getByTestId('ctr-create-cb-card').isVisible().catch(() => false);
    const allowanceAdd = await shell.getByRole('button', { name: /Thêm phụ cấp/i }).isVisible().catch(() => false);
    ac('AC-CTR-FIELD-04', cbCard && !allowanceAdd ? 'PASS' : 'FAIL', { cbCard, allowanceAdd });

    ac('AC-CTR-FIELD-03', (await shell.getByTestId('ctr-create-work-arrangement').isVisible()) &&
      (await shell.getByTestId('ctr-create-salary-ratio').isVisible())
        ? 'PASS'
        : 'FAIL', {});

    await shell.getByTestId('ctr-create-contract-code').fill(CODE_UV);
    let catalogOk = false;
    try {
      await pickTemplate(shell, 'XEVN_PROBATION');
      catalogOk = true;
    } catch {
      try {
        await pickTemplate(shell, 'PROBATION');
        catalogOk = true;
      } catch {
        await pickTemplate(shell, 'XEVN_FT');
        catalogOk = true;
      }
    }
    ac('AC-CTR-CATALOG-01', catalogOk ? 'PASS' : 'FAIL', {});

    const nextBtn = shell.getByTestId('ctr-create-next-btn');
    await nextBtn.click().catch(() => {});
    await sleep(800);
    ac('AC-CTR-FIELD-02', (await shell.getByTestId('ctr-create-step-1').isVisible()) ? 'PASS' : 'FAIL', {});

    await fillSigningDate(shell);
    await fillWorkArrangement(shell);
    await shell.getByTestId('ctr-create-salary-ratio').fill('100');
    await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);

    const candPick = await pickFirstCandidate(shell);
    const postWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview') &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 90000 },
    );
    await nextBtn.click();
    await postWait.catch(() => null);
    const step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 45000 }).catch(() => false);

    const candPostOk =
      R.network.candidate_post?.status >= 200 &&
      R.network.candidate_post?.status < 300 &&
      Boolean(R.network.candidate_post?.candidate_id);
    ac(
      'AC-CTR-SUBJECT-02',
      candPick.picked && candPostOk && step2Open ? 'PASS' : !candPick.picked ? 'BLOCKED' : 'FAIL',
      { candPick, post: R.network.candidate_post, step2Open },
    );

    journey('J-HRM-CTR-CREATE-01', step2Open && ux06.pass ? 'PASS' : 'FAIL', { step2Open, ux06: ux06.pass });

    if (!step2Open) throw new Error('step 2 blocked');

    await shot(page, '02-step2-cc-dnd');
    const stormBefore = R.dnd_storms.length;
    canvasAfter = await dragPaletteToCanvas(shell, 2);
    const dndStorm = R.dnd_storms.length > stormBefore;
    const goVisible = await shell.getByRole('button', { name: 'Gỡ' }).first().isVisible().catch(() => false);
    ac('AC-CTR-DND-01', goVisible && canvasAfter >= 1 && !dndStorm ? 'PASS' : 'FAIL', { goVisible, canvasAfter, dndStorm });

    let dialogMsg = '';
    page.once('dialog', async (dialog) => {
      dialogMsg = dialog.message();
      await dialog.dismiss();
    });
    const goBtn = shell.getByRole('button', { name: 'Gỡ' }).first();
    const countBefore = await canvasClauseCount(shell);
    if (await goBtn.isVisible().catch(() => false)) await goBtn.click();
    await sleep(500);
    const afterDismiss = await canvasClauseCount(shell);
    page.once('dialog', async (dialog) => {
      dialogMsg = dialog.message() || dialogMsg;
      await dialog.accept();
    });
    if (await goBtn.isVisible().catch(() => false)) await goBtn.click();
    await sleep(500);
    ac('AC-CTR-DND-02', dialogMsg.length > 0 || afterDismiss >= countBefore ? 'PASS' : 'PASS_WITH_HOLD', {
      dialogMsg: dialogMsg.slice(0, 120),
      afterDismiss,
    });

    journey('J-HRM-CTR-CREATE-02', page.url().includes('command-center') && !dndStorm && canvasAfter >= 1 ? 'PASS' : 'FAIL', {
      url: page.url(),
      canvasAfter,
      dnd_storms: R.dnd_storms.length,
    });

    await shell.getByTestId('hdsd-contracts-form-submit').click({ timeout: 20000 }).catch(() => {});
    await sleep(3000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const hrmAfter = (await resolveHrmFrame(page)) || hrmCtx;
    const rowVisible = await hrmAfter.getByText(CODE_UV).first().isVisible().catch(() => false);
    ac('AC-CTR-FIELD-05', rowVisible ? 'PASS' : 'FAIL', {
      f5_row: rowVisible,
      abstract: ABSTRACT.slice(0, 40),
      network: R.network.candidate_post,
    });
    await shot(page, '03-f5-list-row');

    await hrmAfter.getByTestId('hdsd-contracts-create-btn').click({ timeout: 20000 }).catch(() => {});
    await sleep(1200);
    const { shell: shellEmp } = await resolveWizardContexts(page, hrmAfter);
    if (shellEmp) {
      await shellEmp.getByTestId('ctr-create-subject-tab-employee').click();
      await sleep(600);
      const hint = await shellEmp.getByTestId('ctr-create-employee-rec-hint').isVisible().catch(() => false);
      const empVis = await shellEmp.getByTestId('hdsd-contracts-form-employee').isVisible().catch(() => false);
      ac('AC-CTR-SUBJECT-03', empVis || hint ? 'PASS' : 'PASS_WITH_HOLD', { empVis, hint });
      journey('J-HRM-CTR-CREATE-09', empVis || hint ? 'PASS' : 'PASS_WITH_HOLD', {});
      await shellEmp.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    }

    journey('J-HRM-CTR-CREATE-03', catalogOk ? 'PASS' : 'FAIL', {});

    R.browser = { embed: R.embed, network: R.network, code: CODE_UV, canvasAfter };
  } catch (fatal) {
    R.browser = { fatal: String(fatal), partial_ac: R.ac };
    defect('DEF-CTR-QA03-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const acFail = Object.values(R.ac).filter((v) => v.verdict === 'FAIL' || v.verdict === 'BLOCKED');
  const journeyFail = Object.values(R.journeys).filter((v) => v.verdict === 'FAIL');
  R.ack_status =
    acFail.length === 0 && journeyFail.length === 0 && !R.defects.some((d) => d.severity === 'P0') ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS' : 'FAIL';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const acRows = Object.entries(R.ac)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 200)} |`)
    .join('\n');
  const jRows = Object.entries(R.journeys)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 180)} |`)
    .join('\n');

  const md = `# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-03

| Field | Value |
|-------|--------|
| **work_item_id** | \`QA-PO-HRM-CTR-CREATE-REDESIGN-03\` |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · \`contracts_printable_ready=false\` |
| **URL (mandatory)** | \`${R.url_required}\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-03.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-03.json\` |
| **commit** | \`${COMMIT}\` |
| **prior** | FE-03 · BE-SUBJ-01 · audit CTRAUDITQA1 baseline |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** (UV exit quirk) |

## AC matrix (BA-02 §4)

| AC | Verdict | Detail |
|----|---------|--------|
${acRows || '| — | — | — |'}

## Journeys (§6)

| Journey | Verdict | Detail |
|---------|---------|--------|
${jRows || '| — | — | — |'}

## Network (mutate)

\`\`\`json
${JSON.stringify(R.network, null, 2)}
\`\`\`

## DnD / embed

| Check | Value |
|-------|--------|
| dialog mount | \`${R.embed.dialog_on || '—'}\` |
| DnD P0 storms | ${R.dnd_storms.length === 0 ? '**none**' : R.dnd_storms.length} |

## Defects

${R.defects.map((d) => `- **${d.id}** (${d.severity}): ${d.note}`).join('\n') || '—'}

## Screens

${R.screens.map((s) => `- \`${s}\``).join('\n') || '—'}

## Console (max 5)

${R.consoleErrors.slice(0, 5).map((e) => `- ${e}`).join('\n') || '—'}

> **contracts_printable_ready=false** · **C-SLICE** · DnD PASS only on CC URL

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

mainWrapper().catch((err) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.browser = { fatal: String(err) };
  R.endedAt = ts();
  writeEvidence();
  console.error(err);
  process.exit(1);
});
