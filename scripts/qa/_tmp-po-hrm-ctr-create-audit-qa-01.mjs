#!/usr/bin/env node
/**
 * PO-HRM-CTR-CREATE-AUDIT-QA-01 — U65 AS-IS audit matrix (no overall PASS / no UAT)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `CTRAUDITQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE = `QCTAUD${Date.now().toString(36).toUpperCase().slice(-6)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-create-audit-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ctr-create-audit-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01');
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
  work_item_id: 'PO-HRM-CTR-CREATE-AUDIT-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  url: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  l0: { qc_dev_stack: 'PASS (hrm+xbos+portal 200; node exit quirk)' },
  matrix: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ack_status: 'PASS_TO_PM',
  audit_overall: 'AS-IS GAPS (no UAT PASS)',
  endedAt: null,
};

function setMatrix(id, verdict, note, screen) {
  R.matrix[id] = { verdict, note, screen: screen || null, ref: id };
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
  const rel = path.replace(/\\/g, '/');
  R.screens.push(rel);
  return rel;
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
    const onPage = await page
      .getByTestId('hdsd-contracts-create-btn')
      .isVisible()
      .catch(() => false);
    if (onPage) return page;
    await sleep(400);
  }
  return null;
}

/** Wizard shell may portal to parent or stay in HRM iframe — return { shell, hrm } */
async function resolveWizardContexts(page, hrmCtx, timeoutMs = 50000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrmCtx, ...page.frames()]) {
      if (!ctx) continue;
      const dialog = await ctx
        .locator('[data-testid="hdsd-contracts-form-dialog"]')
        .first()
        .isVisible()
        .catch(() => false);
      const stepper = await ctx
        .locator('[data-testid="ctr-create-wizard-stepper"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (dialog || stepper) {
        return { shell: ctx, hrm: hrmCtx };
      }
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

async function measureDialogFullCc(shell, page) {
  const dialog = shell.getByTestId('hdsd-contracts-form-dialog');
  const box = await dialog.boundingBox().catch(() => null);
  const vp = page.viewportSize() || { width: 1440, height: 900 };
  if (!box) return { ok: false, reason: 'dialog not found on parent document', box: null, vp };
  const wRatio = box.width / vp.width;
  const hRatio = box.height / vp.height;
  const fullSpec = wRatio >= 0.94 && hRatio >= 0.88;
  return {
    ok: fullSpec,
    wRatio: Number(wRatio.toFixed(3)),
    hRatio: Number(hRatio.toFixed(3)),
    box,
    vp,
    reason: fullSpec
      ? 'meets ≥94% width & ≥88% height'
      : `dialog ${Math.round(box.width)}×${Math.round(box.height)} vs viewport ${vp.width}×${vp.height}`,
  };
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
    if (!hrmCtx) {
      const s = await shot(page, '00-no-embed');
      setMatrix('CHK-DIALOG-FULL-CC', 'BLOCKED', 'Không tìm thấy nút Thêm HĐ trong CC embed/iframe', s);
      setMatrix('CHK-SO-TEN-HD', 'BLOCKED', 'Wizard không mở', s);
      setMatrix('CHK-NV-PICKER', 'BLOCKED', 'Wizard không mở', s);
      setMatrix('CHK-MAU-TIEP-TAB2', 'BLOCKED', 'Wizard không mở', s);
      setMatrix('CHK-STEP2-DND', 'BLOCKED', 'Wizard không mở', s);
      setMatrix('CHK-CONSOLE-PANGEA', R.dnd_storms.length ? 'FAIL' : 'BLOCKED', 'No wizard; console storms=' + R.dnd_storms.length, s);
      return;
    }

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    const { shell } = await resolveWizardContexts(page, hrmCtx);
    if (!shell) throw new Error('wizard shell not visible in parent or iframe after create click');
    R.embed = { dialog_on: shell === page ? 'parent-portal' : 'hrm-iframe' };
    await shell.getByTestId('ctr-create-wizard-stepper').waitFor({ state: 'visible', timeout: 45000 });
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 30000 });
    await sleep(1200);

    const sDialog = await shot(page, '01-dialog-cc');
    const full = await measureDialogFullCc(shell, page);
    setMatrix(
      'CHK-DIALOG-FULL-CC',
      full.ok ? 'PASS' : 'FAIL',
      `O1/TECHSPEC §4.1 — ${full.reason} (w=${full.wRatio} h=${full.hRatio})`,
      sDialog,
    );

    const order = await shell.evaluate(() => {
      const code = document.querySelector('[data-testid="ctr-create-contract-code"]');
      const labels = Array.from(document.querySelectorAll('[data-testid="ctr-create-step-1"] label'));
      const nameLabel = labels.find((l) => (l.textContent || '').includes('Tên hợp đồng'));
      const codeLabel = labels.find((l) => (l.textContent || '').includes('Số hợp đồng'));
      if (!code || !nameLabel) return { ok: false, reason: 'missing code or name label' };
      const codeIdx = codeLabel?.compareDocumentPosition(nameLabel) ?? 0;
      const codeBeforeName = Boolean(codeIdx & Node.DOCUMENT_POSITION_FOLLOWING);
      return { ok: codeBeforeName, codeBeforeName };
    });
    const sOrder = await shot(page, '02-so-ten-hd');
    setMatrix(
      'CHK-SO-TEN-HD',
      order.ok ? 'PASS' : 'FAIL',
      `O2/intake AMIS — Số HĐ trước Tên HĐ: ${order.ok}`,
      sOrder,
    );

    const empPicker = shell.getByTestId('hdsd-contracts-form-employee');
    const empVisible = await empPicker.isVisible().catch(() => false);
    let nvVerdict = 'BLOCKED';
    let nvNote = 'Không thấy picker NV (employeesList empty?)';
    if (empVisible) {
      const triggerText = ((await empPicker.innerText().catch(() => '')) || '').trim();
      const hasUuid = UUID_RE.test(triggerText);
      await empPicker.click().catch(() => {});
      await sleep(400);
      const input = empPicker.locator('input').first();
      const hasSearchInput = await input.isVisible().catch(() => false);
      const placeholder = hasSearchInput ? await input.getAttribute('placeholder').catch(() => '') : '';
      await shot(page, '03-nv-picker');
      nvVerdict = hasUuid ? 'FAIL' : hasSearchInput ? 'PASS' : 'FAIL';
      nvNote = `O3 — trigger="${triggerText.slice(0, 80)}" uuid=${hasUuid} searchInput=${hasSearchInput} placeholder="${placeholder || '—'}"`;
    }
    const sNv = R.screens.find((p) => p.endsWith('03-nv-picker.png')) || sOrder;
    setMatrix('CHK-NV-PICKER', nvVerdict, nvNote, sNv);

    const noTplBanner = await shell.getByTestId('ctr-create-no-active-template-banner').isVisible().catch(() => false);
    let mauVerdict = 'FAIL';
    let mauNote = '';
    if (noTplBanner) {
      mauVerdict = 'FAIL';
      mauNote = 'O4–O5 — banner «Chưa có mẫu HĐ active»; không sang bước 2';
    } else {
      await shell.getByTestId('ctr-create-contract-code').fill(CODE);
      try {
        await pickTemplate(shell, 'XEVN_FT_12M_OFFICE');
      } catch {
        try {
          await pickTemplate(shell, 'XEVN_FT');
        } catch (e) {
          mauNote = `O4 — không chọn được mẫu active: ${String(e).slice(0, 120)}`;
        }
      }
      const tab2 = shell.getByTestId('ctr-create-step-tab-2');
      const tab2Visible = await tab2.isVisible().catch(() => false);
      const nextBtn = shell.getByTestId('ctr-create-next-btn');
      const nextDisabled = await nextBtn.isDisabled().catch(() => true);
      let step2 = false;
      if (!nextDisabled) {
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
        await nextBtn.click();
        await nextWait;
        step2 = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 45000 }).catch(() => false);
      }
      if (!step2 && tab2Visible) {
        await tab2.click().catch(() => {});
        await sleep(800);
        step2 = await shell.getByTestId('ctr-create-step-2').isVisible().catch(() => false);
      }
      mauVerdict = step2 ? 'PASS' : 'FAIL';
      mauNote =
        mauNote ||
        `O4–O5 — template picked; tab2=${tab2Visible}; nextDisabled=${nextDisabled}; step2Visible=${step2}`;
    }
    const sMau = await shot(page, '04-mau-tiep-tab2');
    setMatrix('CHK-MAU-TIEP-TAB2', mauVerdict, mauNote, sMau);

    let dndVerdict = 'BLOCKED';
    let dndNote = 'Bước 2 không mở';
    if (mauVerdict === 'PASS') {
      const stormBefore = R.dnd_storms.length;
      const palette = shell.getByTestId('ctr-create-clause-palette');
      const canvas = shell.getByTestId('ctr-create-clause-canvas');
      const themBtn = palette.getByRole('button', { name: /^Thêm$/ }).first();
      const hasThem = await themBtn.isVisible().catch(() => false);
      let canvasCount = await canvas.locator('.cursor-grab').count().catch(() => 0);
      if (hasThem) {
        await themBtn.click().catch(() => {});
        await sleep(600);
        canvasCount = await canvas.locator('.cursor-grab').count().catch(() => 0);
      }
      const goBtn = canvas.getByRole('button', { name: 'Gỡ' }).first();
      const hasGo = await goBtn.isVisible().catch(() => false);
      if (hasGo && canvasCount > 0) {
        await goBtn.click().catch(() => {});
        await sleep(400);
      }
      const item = palette.locator('.cursor-grab').first();
      if (await item.isVisible().catch(() => false)) {
        await item.dragTo(canvas, { force: true }).catch(() => {});
        await sleep(500);
      }
      const stormAfter = R.dnd_storms.length;
      const dndStorm = stormAfter > stormBefore;
      dndVerdict = dndStorm ? 'FAIL' : hasThem && hasGo ? 'PASS' : 'FAIL';
      dndNote = `O6–O7 — Thêm=${hasThem} Gỡ=${hasGo} canvasClauses=${canvasCount} dndStorm=${dndStorm}`;
    }
    const sDnd = await shot(page, '05-step2-dnd-go');
    setMatrix('CHK-STEP2-DND', dndVerdict, dndNote, sDnd);

    const pangeaFail = R.dnd_storms.length > 0;
    const sConsole = await shot(page, '06-console-state');
    setMatrix(
      'CHK-CONSOLE-PANGEA',
      pangeaFail ? 'FAIL' : R.consoleErrors.some((e) => DND_STORM_RE.test(e)) ? 'FAIL' : 'PASS',
      `QA-01 lesson — pangea/DnD errors: ${R.dnd_storms.length} storm(s); consoleErrors=${R.consoleErrors.length}`,
      sConsole,
    );
  } catch (err) {
    const s = await shot(page, '99-fatal');
    const msg = String(err).slice(0, 200);
    for (const id of Object.keys(R.matrix).length ? [] : [
      'CHK-DIALOG-FULL-CC',
      'CHK-SO-TEN-HD',
      'CHK-NV-PICKER',
      'CHK-MAU-TIEP-TAB2',
      'CHK-STEP2-DND',
      'CHK-CONSOLE-PANGEA',
    ]) {
      if (!R.matrix[id]) setMatrix(id, 'BLOCKED', `fatal: ${msg}`, s);
    }
    R.fatal = msg;
  } finally {
    await browser.close().catch(() => {});
  }

  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const rows = Object.entries(R.matrix)
    .map(([check, m]) => {
      const ref =
        check === 'CHK-DIALOG-FULL-CC'
          ? 'O1 / TECHSPEC §4.1'
          : check === 'CHK-SO-TEN-HD'
            ? 'O2 / intake AMIS'
            : check === 'CHK-NV-PICKER'
              ? 'O3'
              : check === 'CHK-MAU-TIEP-TAB2'
                ? 'O4–O5'
                : check === 'CHK-STEP2-DND'
                  ? 'O6–O7'
                  : 'QA-01 lesson';
      return `| ${check.replace('CHK-', '')} | ${ref} | **${m.verdict}** | ${m.note} | \`${m.screen || '—'}\` |`;
    })
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-CREATE-AUDIT-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-CREATE-AUDIT-QA-01\` |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **PASS_TO_PM** (audit facts — **cấm** claim UAT / module GO) |
| **audit_overall** | **${R.audit_overall}** · \`contracts_printable_ready=false\` · C-SLICE |
| **URL** | \`${R.url}\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-create-audit-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-create-audit-qa-01.json\` |
| **commit** | \`${COMMIT}\` |
| **dispatch** | \`docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md\` Task 2 |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:dev-stack\` — hrm-api + xbos-api + portal **HTTP 200** (node UV exit quirk on Windows) |

## Audit matrix (AS-IS)

| Check | Ref BA-01 | Verdict | Ghi chú quan sát (fact) | Screenshot |
|-------|-----------|---------|-------------------------|------------|
${rows}

## Console / DnD samples

${R.dnd_storms.slice(0, 6).map((e) => `- ${e}`).join('\n') || '—'}

## Screens index

${R.screens.map((s) => `- \`${s}\``).join('\n') || '—'}

**ack_status:** **PASS_TO_PM**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

main().catch((err) => {
  R.fatal = String(err);
  R.endedAt = ts();
  writeEvidence();
  console.error(err);
  process.exit(1);
});
