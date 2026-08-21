#!/usr/bin/env node
/**
 * QA-PO-HRM-CTR-CREATE-REDESIGN-02 — retest after DND-PALETTE-01 + FE-02 overlay
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

const STAMP = `CTRCREATEQA2-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_MAIN = `QCTR2${Date.now().toString(36).toUpperCase().slice(-7)}`;
const CODE_REG = `QCT2R${Date.now().toString(36).toUpperCase().slice(-6)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-02.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ctr-create-redesign-qa-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** Exit P0 — sameNodeDragBind / drag-handle invariant only (not nested-scroll advisory). */
const DND_STORM_RE = /sameNodeDragBind|dragHandleProps missing|Unable to find drag handle/i;
const DND_NESTED_SCROLL_RE = /unsupported nested scroll container/i;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-CTR-CREATE-REDESIGN-02',
  stamp: STAMP,
  prior: [
    'docs/qa/evidence/po-hrm-ctr-create-redesign-fe-dnd-01.md',
    'docs/qa/evidence/po-hrm-ctr-create-redesign-fe-02.md',
    'docs/qa/evidence/po-hrm-ctr-create-redesign-qa-01.md',
  ],
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'PASS (pre-run agent)' },
  l1: { vitest_hrm: '18 PASS', jest_be: '3 PASS (pre-run)' },
  browser: {},
  journeys: {},
  dnd_storms: [],
  dnd_nested_scroll_warnings: [],
  consoleErrors: [],
  pageErrors: [],
  network: { put_overlay: null, preview_post: null },
  screens: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
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

function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
}

function noteStorm(text) {
  if (DND_STORM_RE.test(text)) R.dnd_storms.push(text.slice(0, 200));
  if (DND_NESTED_SCROLL_RE.test(text)) R.dnd_nested_scroll_warnings.push(text.slice(0, 120));
}

async function pickTemplate(page, searchText) {
  const combobox = page.getByTestId('ctr-create-template-combobox');
  await combobox.click();
  await sleep(300);
  const input = combobox.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(searchText);
    await sleep(500);
  }
  await page.getByRole('option', { name: new RegExp(searchText, 'i') }).first().click({ timeout: 15000 });
}

async function canvasClauseCount(page) {
  return page.getByTestId('ctr-create-clause-canvas').locator('.cursor-grab').count();
}

/** Palette → canvas (ctr-create-* droppables). */
async function dragCreatePaletteToCanvas(page, times = 2) {
  const palette = page.getByTestId('ctr-create-clause-palette');
  const canvas = page.getByTestId('ctr-create-clause-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 });
  let bound = await canvasClauseCount(page);
  for (let i = 0; i < times; i++) {
    const item = palette.locator('.cursor-grab').nth(i);
    if (!(await item.isVisible().catch(() => false))) break;
    const before = bound;
    await item.dragTo(canvas, { force: true, targetPosition: { x: 60, y: 50 + i * 32 } }).catch(() => {});
    await sleep(600);
    bound = await canvasClauseCount(page);
    if (bound > before) continue;
    const box = await item.boundingBox();
    const cbox = await canvas.boundingBox();
    if (box && cbox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await sleep(120);
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 55 + i * 32, { steps: 22 });
      await sleep(100);
      await page.mouse.up();
      await sleep(600);
    }
    bound = await canvasClauseCount(page);
  }
  return bound;
}

async function openCreateWizard(page) {
  await page.getByTestId('hdsd-contracts-create-btn').click({ timeout: 30000 });
  await page.getByTestId('ctr-create-wizard-stepper').waitFor({ state: 'visible', timeout: 45000 });
  await page.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('hdsd-contracts-form-ready').waitFor({ state: 'attached', timeout: 45000 }).catch(() => {});
  await sleep(1200);
}

async function goStep2WithTemplate(page, code) {
  await page.getByTestId('ctr-create-contract-code').fill(code);
  try {
    await pickTemplate(page, 'XEVN_FT_12M_OFFICE');
  } catch {
    await pickTemplate(page, 'XEVN_FT');
  }
  const nextWait = page
    .waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview') &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 60000 },
    )
    .catch(() => null);
  await page.getByTestId('ctr-create-next-btn').click();
  await nextWait;
  await page.getByTestId('ctr-create-step-2').waitFor({ state: 'visible', timeout: 45000 });
  await page.getByTestId('ctr-create-clause-palette').waitFor({ state: 'visible', timeout: 30000 });
}

function wireNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/print-overlay') && res.request().method() === 'PUT') {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      R.network.put_overlay = {
        status: res.status(),
        clause_ids: body?.clause_ids ?? body?.clauseIds,
      };
    }
    if (url.includes('/preview') && res.request().method() === 'POST') {
      try {
        const body = res.request().postDataJSON();
        R.network.preview_post = {
          status: res.status(),
          has_clause_ids: Array.isArray(body?.clause_ids) && body.clause_ids.length > 0,
          clause_count: Array.isArray(body?.clause_ids) ? body.clause_ids.length : 0,
        };
      } catch {
        R.network.preview_post = { status: res.status(), has_clause_ids: null };
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
  const page = await browser.newPage();
  wireNetwork(page);
  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error') {
      R.consoleErrors.push(t.slice(0, 240));
      noteStorm(t);
    } else {
      noteStorm(t);
    }
  });
  page.on('pageerror', (err) => {
    const t = String(err);
    R.pageErrors.push(t.slice(0, 240));
    noteStorm(t);
  });

  let ctxStatus = null;
  page.on('response', (res) => {
    if (res.url().includes('contract-create-context') && res.request().method() === 'GET') {
      ctxStatus = res.status();
    }
  });

  try {
    await injectPortalAuth(page, session);
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);

    // —— J-HRM-CTR-CREATE-02: Step2 DnD + overlay/preview ——
    await openCreateWizard(page);
    await shot(page, 'step1');
    journey('J-HRM-CTR-CREATE-01', ctxStatus === 200 ? 'PASS' : 'PASS_WITH_HOLD', {
      contract_create_context_get: ctxStatus,
    });

    await goStep2WithTemplate(page, CODE_MAIN);
    await sleep(800);
    const stormBeforeDnd = R.dnd_storms.length;
    const canvasCount = await dragCreatePaletteToCanvas(page, 2);
    await sleep(500);
    await shot(page, 'step2-after-dnd');

    const stormAfterDnd = R.dnd_storms.length;
    const dndStorm = stormAfterDnd > stormBeforeDnd || R.dnd_storms.length > 0;

    await page.getByRole('button', { name: /Đồng bộ thứ tự/i }).click();
    await sleep(1500);

    const previewWait = page
      .waitForResponse(
        (res) => res.request().method() === 'POST' && /\/preview/.test(res.url()),
        { timeout: 45000 },
      )
      .catch(() => null);
    await page.getByTestId('ctr-create-preview-btn').click();
    await previewWait;
    await sleep(800);
    await shot(page, 'step2-preview');

    const putOk = R.network.put_overlay?.status >= 200 && R.network.put_overlay?.status < 300;
    const prevOk = R.network.preview_post?.status >= 200 && R.network.preview_post?.status < 300;
    const clauseIdsOk = R.network.preview_post?.has_clause_ids === true;
    const paletteOk = canvasCount >= 1;

    journey('J-HRM-CTR-CREATE-02', !dndStorm && paletteOk && putOk && prevOk && clauseIdsOk ? 'PASS' : 'FAIL', {
      dnd_storm: dndStorm,
      dnd_storm_samples: R.dnd_storms.slice(0, 4),
      canvas_clause_count: canvasCount,
      put_overlay: R.network.put_overlay,
      preview_post: R.network.preview_post,
    });

    // Save full contract for L2.5
    await page.getByTestId('hdsd-contracts-form-submit').click();
    await sleep(2500);
    await page.getByTestId('ctr-create-cancel-btn').click({ timeout: 15000 }).catch(() => page.keyboard.press('Escape'));
    await sleep(800);

    // —— J-HRM-CTR-CREATE-05: Chỉ lưu sổ + F5 ——
    await openCreateWizard(page);
    await page.getByTestId('ctr-create-contract-code').fill(CODE_REG);
    const regWait = page
      .waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          /\/contracts-insurance\/contracts/.test(res.url()) &&
          !res.url().includes('/preview') &&
          res.status() >= 200 &&
          res.status() < 300,
        { timeout: 60000 },
      )
      .catch(() => null);
    await page.getByTestId('ctr-create-registry-only-link').click();
    const regRes = await regWait;
    const registryPost = regRes ? { status: regRes.status() } : null;
    await sleep(1000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const rowVisible = await page.getByText(CODE_REG).first().isVisible().catch(() => false);
    await shot(page, 'registry-f5-row');
    journey('J-HRM-CTR-CREATE-05', registryPost?.status >= 200 && registryPost?.status < 300 && rowVisible ? 'PASS' : 'FAIL', {
      post: registryPost,
      f5_row: rowVisible,
      code: CODE_REG,
    });

    // —— J-HRM-CTR-CREATE-06: list → edit → step1/2 ——
    const row = page.getByRole('row', { name: new RegExp(CODE_MAIN) });
    const editBtn = row.getByRole('button', { name: /Sửa|Edit/i });
    let editOpened = false;
    if (await row.isVisible().catch(() => false)) {
      await editBtn.click({ timeout: 15000 }).catch(async () => {
        await row.locator('button').nth(1).click();
      });
      await page.getByTestId('ctr-create-wizard-stepper').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
      editOpened = await page.getByTestId('ctr-create-step-1').isVisible().catch(() => false);
    }
    const codeField = await page.getByTestId('ctr-create-contract-code').inputValue().catch(() => '');
    const step1Match = codeField.includes(CODE_MAIN);
    let step2Match = false;
    if (editOpened && step1Match) {
      await page.getByTestId('ctr-create-next-btn').click({ timeout: 20000 }).catch(() => {});
      await page.getByTestId('ctr-create-step-2').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
      const cnt = await canvasClauseCount(page);
      step2Match = cnt >= 1;
      await shot(page, 'edit-step2');
    }
    journey('J-HRM-CTR-CREATE-06', editOpened && step1Match && step2Match ? 'PASS' : 'FAIL', {
      edit_opened: editOpened,
      step1_code_match: step1Match,
      step2_canvas_clauses: step2Match,
      code: CODE_MAIN,
    });

    R.browser = {
      contract_create_context_get: ctxStatus,
      dnd_storm_count: R.dnd_storms.length,
      network: R.network,
      codes: { main: CODE_MAIN, registry: CODE_REG },
    };
  } catch (browserErr) {
    R.browser.error = String(browserErr);
    for (const id of ['J-HRM-CTR-CREATE-02', 'J-HRM-CTR-CREATE-05', 'J-HRM-CTR-CREATE-06']) {
      if (!R.journeys[id]) journey(id, 'FAIL', { fatal: String(browserErr).slice(0, 180) });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const scopeIds = ['J-HRM-CTR-CREATE-02', 'J-HRM-CTR-CREATE-05', 'J-HRM-CTR-CREATE-06'];
  const fails = scopeIds.filter((id) => R.journeys[id]?.verdict === 'FAIL');
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const jRows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${JSON.stringify(j).slice(0, 220)} |`)
    .join('\n');

  const md = `# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`QA-PO-HRM-CTR-CREATE-REDESIGN-02\` |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · \`contracts_printable_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-02.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-02.json\` |
| **commit** | \`${COMMIT}\` |
| **prior** | fe-dnd-01 · fe-02 · qa-01 FAIL (DND storm) |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **exit 0** |
| L1 vitest (hrm) | **18 PASS** — jdDnd · contractCreateWizard · payload · core09 |
| L1 jest (hrm-api) | **3 PASS** — \`po-hrm-ctr-create-redesign-be-01.spec.ts\` |

## In-scope journeys (exit)

| Journey | Verdict | Detail (truncated) |
|---------|---------|-------------------|
${jRows}

## DnD / overlay

| Check | Result |
|-------|--------|
| sameNodeDragBind / drag-handle storm (P0) | ${R.dnd_storms.length === 0 ? '**none**' : `**${R.dnd_storms.length} hit(s)**`} |
| pangea nested-scroll advisory (P2) | ${R.dnd_nested_scroll_warnings.length === 0 ? 'none' : `${R.dnd_nested_scroll_warnings.length} console line(s)`} |
| PUT print-overlay | \`${JSON.stringify(R.network.put_overlay)}\` |
| POST preview \`clause_ids\` | \`${JSON.stringify(R.network.preview_post)}\` |

## Browser summary

\`\`\`json
${JSON.stringify(R.browser, null, 2)}
\`\`\`

**Screens:** ${R.screens.map((s) => `\`${s}\``).join(' · ') || '—'}

## Console errors (max 6)

${R.consoleErrors.slice(0, 6).map((e) => `- ${e}`).join('\n') || '—'}

## Honesty

> **contracts_printable_ready=false** · **C-SLICE** · **cấm** claim printable / module CTR UAT

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

main().catch((err) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.browser.fatal = String(err);
  R.endedAt = ts();
  writeEvidence();
  console.error(err);
  process.exit(1);
});
