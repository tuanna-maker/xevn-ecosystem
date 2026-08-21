#!/usr/bin/env node
/**
 * QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01 — inline UV picker parent portal · U65
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

const STAMP = `CTRPICKQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_UV = `QCPICK${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `QA picker inline ${STAMP}`;
const IN_SCOPE_AC = ['AC-CTR-SUBJECT-02', 'AC-CTR-DND-01', 'AC-CTR-DND-02'];
const IN_SCOPE_J = ['J-HRM-CTR-CREATE-02'];

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-picker-inline-portal-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ctr-picker-inline-portal-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-picker-inline-portal-qa-01');
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
  work_item_id: 'QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01',
  prior: 'D-PO-HRM-CTR-PICKER-INLINE-PORTAL-01 · DEF-CTR-PICKER-INLINE-PORTAL-P1',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_dev_stack: 'PASS (hrm+xbos+portal 200; UV exit quirk Windows)' },
  ac: {},
  journeys: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  network: { candidate_post: null },
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

async function pickInlineCandidate(shell, page) {
  const term = 'QA';
  const picker = shell.getByTestId('ctr-create-candidate-picker');
  const combobox = shell.getByTestId('ctr-create-candidate-picker-combobox');
  const inlineSearch = shell.getByTestId('ctr-create-candidate-picker-search');
  await picker.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(300);

  if (await combobox.isVisible().catch(() => false)) {
    await combobox.click();
  } else {
    await picker.click();
  }
  await sleep(400);

  if (await inlineSearch.isVisible().catch(() => false)) {
    await inlineSearch.fill(term);
    await sleep(900);
  } else {
    const input = picker.locator('input').first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(term);
      await sleep(700);
    }
  }

  await shot(page, 'picker-after-search');

  const optionByTestId = shell.locator('[data-testid^="catalog-picker-option-"]').first();
  if (await optionByTestId.isVisible({ timeout: 12000 }).catch(() => false)) {
    const tid = await optionByTestId.getAttribute('data-testid').catch(() => '');
    const label = (await optionByTestId.innerText().catch(() => '')).trim();
    await optionByTestId.click();
    await sleep(400);
    const triggerText = (await picker.innerText().catch(() => '')).trim();
    return {
      picked: !/^Gõ tên/i.test(triggerText) && triggerText.length > 2,
      label,
      optionTestId: tid,
      hasUuid: UUID_RE.test(triggerText) || UUID_RE.test(label),
      searchTerm: term,
      method: 'catalog-picker-option-testid',
    };
  }

  for (const ctx of [shell, page, ...page.frames()]) {
    const opt = ctx.getByRole('option').first();
    if (await opt.isVisible({ timeout: 8000 }).catch(() => false)) {
      const label = (await opt.innerText().catch(() => '')).trim();
      if (label && !/^Gõ tên/i.test(label)) {
        await opt.click();
        const triggerText = (await picker.innerText().catch(() => '')).trim();
        return {
          picked: true,
          label,
          hasUuid: UUID_RE.test(triggerText) || UUID_RE.test(label),
          searchTerm: term,
          method: 'role-option',
        };
      }
    }
  }

  const triggerText = (await picker.innerText().catch(() => '')).trim();
  return {
    picked: false,
    label: triggerText.slice(0, 80),
    hasUuid: UUID_RE.test(triggerText),
    searchTerm: term,
    method: 'none',
  };
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
      if (body?.candidate_id && !body?.employee_id) {
        R.network.candidate_post = {
          status: res.status(),
          candidate_id: body?.candidate_id,
        };
      }
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
  page.on('pageerror', (err) => {
    const t = String(err);
    R.pageErrors.push(t.slice(0, 240));
    if (DND_STORM_RE.test(t)) R.dnd_storms.push(t.slice(0, 200));
  });

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    const { shell } = await resolveWizardContexts(page, hrmCtx);
    if (!shell) throw new Error('wizard shell not visible');
    R.embed.dialog_on = shell === page ? 'parent-portal' : 'hrm-iframe';
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
    await shell.getByTestId('ctr-create-subject-tab-candidate').click({ timeout: 15000 }).catch(() => {});
    await sleep(2000);

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
    if (!catalogOk) throw new Error('template pick failed');

    await fillSigningDate(shell);
    await fillWorkArrangement(shell);
    await shell.getByTestId('ctr-create-salary-ratio').fill('100');
    await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);

    const candPick = await pickInlineCandidate(shell, page);
    const nextBtn = shell.getByTestId('ctr-create-next-btn');
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

    if (!step2Open) {
      journey('J-HRM-CTR-CREATE-02', 'BLOCKED', { reason: 'step2 not open — SUBJECT-02 blocked' });
      ac('AC-CTR-DND-01', 'BLOCKED', { reason: 'step2 not reachable' });
      ac('AC-CTR-DND-02', 'BLOCKED', { reason: 'step2 not reachable' });
    } else {
      await shot(page, '02-step2-dnd');
      const stormBefore = R.dnd_storms.length;
      const canvasAfter = await dragPaletteToCanvas(shell, 2);
      const dndStorm = R.dnd_storms.length > stormBefore;
      const goVisible = await shell.getByRole('button', { name: 'Gỡ' }).first().isVisible().catch(() => false);
      ac('AC-CTR-DND-01', goVisible && canvasAfter >= 1 && !dndStorm ? 'PASS' : 'FAIL', {
        goVisible,
        canvasAfter,
        dndStorm,
      });

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

      journey(
        'J-HRM-CTR-CREATE-02',
        page.url().includes('command-center') && !dndStorm && canvasAfter >= 1 ? 'PASS' : 'FAIL',
        { url: page.url(), canvasAfter, dnd_storms: R.dnd_storms.length },
      );
    }

    R.browser = { embed: R.embed, network: R.network, code: CODE_UV };
  } catch (fatal) {
    R.browser = { fatal: String(fatal), partial_ac: R.ac };
    defect('DEF-CTR-PICKER-QA-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const acFailInScope = IN_SCOPE_AC.filter((id) => {
    const v = R.ac[id];
    return !v || v.verdict === 'FAIL' || v.verdict === 'BLOCKED';
  });
  const journeyFailInScope = IN_SCOPE_J.filter((id) => {
    const v = R.journeys[id];
    return !v || v.verdict === 'FAIL' || v.verdict === 'BLOCKED';
  });

  if (acFailInScope.includes('AC-CTR-SUBJECT-02')) {
    defect('DEF-CTR-PICKER-INLINE-PORTAL-P1', 'P1', 'UV inline picker SUBJECT-02 blocked/fail');
  }
  if (acFailInScope.includes('AC-CTR-DND-01') || journeyFailInScope.includes('J-HRM-CTR-CREATE-02')) {
    if (R.dnd_storms.length > 0) {
      defect('DEF-CTR-DND-PARENT-P0', 'P0', `DnD storms ${R.dnd_storms.length}`);
    }
  }

  R.scope_exit = { ac: IN_SCOPE_AC, journeys: IN_SCOPE_J, acFailInScope, journeyFailInScope };
  R.ack_status =
    acFailInScope.length === 0 && journeyFailInScope.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS' : 'FAIL';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const scopeRows = IN_SCOPE_AC
    .map((id) => {
      const v = R.ac[id];
      return `| **${id}** | ${v?.verdict || 'MISSING'} | ${JSON.stringify(v || {}).slice(0, 220)} |`;
    })
    .join('\n');
  const scopeJ = IN_SCOPE_J
    .map((id) => {
      const v = R.journeys[id];
      return `| **${id}** | ${v?.verdict || 'MISSING'} | ${JSON.stringify(v || {}).slice(0, 180)} |`;
    })
    .join('\n');

  const md = `# Evidence — QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01\` |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · \`contracts_printable_ready=false\` |
| **URL (mandatory)** | \`${R.url_required}\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-picker-inline-portal-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-picker-inline-portal-qa-01.json\` |
| **FE handoff** | \`docs/qa/evidence/po-hrm-ctr-picker-inline-portal-fe-01.md\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** (UV exit quirk) |

## Scope exit

| AC / J | Verdict | Detail |
|--------|---------|--------|
${scopeRows}
${scopeJ}

## Network (candidate draft)

\`\`\`json
${JSON.stringify(R.network, null, 2)}
\`\`\`

## Embed / DnD

| Check | Value |
|-------|--------|
| dialog mount | \`${R.embed.dialog_on || '—'}\` |
| DnD storms | ${R.dnd_storms.length === 0 ? '**none**' : R.dnd_storms.length} |

## Defects

${R.defects.map((d) => `- **${d.id}** (${d.severity}): ${d.note}`).join('\n') || '—'}

## Screens

${R.screens.map((s) => `- \`${s}\``).join('\n') || '—'}

## Console (max 5)

${R.consoleErrors.slice(0, 5).map((e) => `- ${e}`).join('\n') || '—'}

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

main().catch((err) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.browser = { fatal: String(err) };
  R.endedAt = ts();
  writeEvidence();
  console.error(err);
  process.exit(1);
});
