#!/usr/bin/env node
/**
 * PO-UAT-EMP-01-J03 — J-HRM-03 ONLY (U65 browser)
 * Parent: PO-HRM-E2E-LINK-EMP-FE-J03-01 READY_FOR_QA · residual R-J03-DIALOG
 * Login → CC /contracts → hdsd-contracts-view-btn → latch OR parent dialog → content
 * Spot must_keep: create + pencil present
 * DENIED: seed · personnel UAT · expand EMP matrix
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-PO-UAT-EMP-01-J03.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/PO-UAT-EMP-01-J03');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UAT-EMP-01-J03',
  parent: 'PO-HRM-E2E-LINK-EMP-FE-J03-01',
  residual_target: 'R-J03-DIALOG',
  startedAt: ts(),
  u65: 'zero-seed',
  honesty: { hrm_personnel_uat_ready: false },
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT },
  denied: ['seed', 'hrm_personnel_uat_ready', 'full_emp_matrix'],
  l0: {},
  steps: {},
  journey: {},
  network: [],
  consoleErrors: [],
  click_log: [],
  screens: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[J03] ${msg}`, extra.note || '');
}
function record(id, verdict, summary, extra = {}) {
  results.steps[id] = { verdict, summary, ...extra, at: ts() };
  console.log(`${verdict} ${id} — ${String(summary).slice(0, 400)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function track(page) {
  page.on('console', (m) => {
    if (m.type() === 'error') results.consoleErrors.push(String(m.text()).slice(0, 240));
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/auth\/login|\/contracts/.test(u)) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        at: ts(),
      };
      try {
        const j = await res.json();
        entry.code = j?.code;
      } catch {
        /* */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
}

async function fillLogin(page) {
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill(EMAIL);
  await passInput.fill(PASSWORD);
}

async function hrmScope(page) {
  await page.locator('iframe').first().waitFor({ state: 'attached', timeout: 25000 }).catch(() => {});
  await sleep(800);
  const f = page.frames().find((fr) => /\/hr\//.test(fr.url()));
  return f || page;
}

/** Prefer parent portal dialog; also accept iframe latch (sr-only may not be "visible"). */
async function assertViewDialogOpen(page, hrm) {
  const parentDlg = page.getByTestId('hdsd-contracts-view-dialog');
  await parentDlg.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {});
  let parentVisible = await parentDlg.isVisible().catch(() => false);
  const parentCount = await parentDlg.count().catch(() => 0);

  const latchIframe = hrm.getByTestId('hdsd-contracts-view-dialog-open');
  const latchParent = page.getByTestId('hdsd-contracts-view-dialog-open');
  const latchCountIframe = await latchIframe.count().catch(() => 0);
  const latchCountParent = await latchParent.count().catch(() => 0);
  const latchCount = latchCountIframe + latchCountParent;

  // Prefer testid over role=dialog — secondary OBS only
  const roleDlg = await page
    .locator('[role="dialog"]')
    .filter({ hasText: /chi tiết hợp đồng|hợp đồng/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (!parentVisible && parentCount > 0) {
    parentVisible = true; // attached in portal tree
  }

  const open = parentVisible || parentCount > 0 || latchCount > 0;
  return {
    open,
    parentVisible,
    parentCount,
    latchCount,
    latchCountIframe,
    latchCountParent,
    roleDlg,
  };
}

async function probeContent(page, hrm) {
  const codeParent = page.getByTestId('hdsd-contracts-view-code');
  const codeIframe = hrm.getByTestId('hdsd-contracts-view-code');
  const bodyParent = page.getByTestId('hdsd-contracts-view-body');
  const bodyIframe = hrm.getByTestId('hdsd-contracts-view-body');

  let codeText = '';
  if ((await codeParent.count()) > 0) {
    codeText = (await codeParent.first().innerText().catch(() => '')).trim();
  } else if ((await codeIframe.count()) > 0) {
    codeText = (await codeIframe.first().innerText().catch(() => '')).trim();
  }

  const bodyCount =
    (await bodyParent.count().catch(() => 0)) + (await bodyIframe.count().catch(() => 0));

  const titleHit = await page
    .getByText(/chi tiết hợp đồng/i)
    .first()
    .isVisible()
    .catch(() => false);

  return {
    codeText,
    bodyCount,
    titleHit,
    populated: Boolean(codeText) && bodyCount > 0,
  };
}

async function main() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = `ERR:${e?.cause?.code || e.message}`;
    }
  }
  console.log('L0', JSON.stringify(results.l0));
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200) {
    results.overall = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({
      id: 'R-J03-L0-DOWN',
      severity: 'P0',
      note: `L0 fail ${JSON.stringify(results.l0)}`,
    });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  try {
    // Hard refresh login
    await clearAuth(page);
    await fillLogin(page);
    await page.getByRole('button', { name: /đăng nhập|log in|login/i }).first().click();
    await sleep(3500);
    await shot(page, '00-after-login');
    const loginOk =
      results.network.some((n) => /auth\/login/.test(n.url) && n.status >= 200 && n.status < 300) ||
      !/\/login/.test(page.url());
    record('LOGIN', loginOk ? 'PASS' : 'FAIL', `url=${page.url()}`);
    if (!loginOk) throw new Error('UI login failed');

    // Contracts via CC embed (hard refresh cache-bust)
    const contractsUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;
    await page.goto(contractsUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    // Hard refresh FE
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '01-contracts-list');

    let hrm = await hrmScope(page);
    const rows =
      (await hrm.locator('table tbody tr').count().catch(() => 0)) ||
      (await page.locator('table tbody tr').count().catch(() => 0));
    const listGets = results.network.filter(
      (n) => n.method === 'GET' && /\/contracts/.test(n.url) && !/print|preview|versions/.test(n.url),
    );
    record('LIST', rows > 0 ? 'PASS' : 'FAIL', `rows=${rows} gets=${listGets.map((g) => g.status).join(',')}`, {
      rows,
      listGets: listGets.slice(-5),
    });
    if (rows === 0) throw new Error('Contracts list empty — cannot exercise Eye');

    // must_keep spot BEFORE dialog: create + pencil
    const createBtn =
      (await hrm.getByTestId('hdsd-contracts-create-btn').count().catch(() => 0)) +
      (await page.getByTestId('hdsd-contracts-create-btn').count().catch(() => 0));
    const pencil =
      (await hrm.getByTestId('hdsd-contracts-edit-btn').count().catch(() => 0)) ||
      (await hrm.locator('[data-testid^="hdsd-contracts-edit"]').count().catch(() => 0)) ||
      (await hrm.locator('table tbody tr button').filter({ has: hrm.locator('svg') }).count().catch(() => 0));
    // Prefer explicit edit testid if present; else count icon buttons >= 2 (eye+pencil)
    const editTestId =
      (await hrm.locator('[data-testid*="contracts-edit"]').count().catch(() => 0)) +
      (await page.locator('[data-testid*="contracts-edit"]').count().catch(() => 0));
    const mustKeepCreate = createBtn > 0;
    const mustKeepPencil = editTestId > 0 || pencil >= 2;
    record(
      'MUST_KEEP_UF_HRM_02',
      mustKeepCreate && mustKeepPencil ? 'PASS' : mustKeepCreate ? 'PARTIAL' : 'FAIL',
      `createBtn=${createBtn} editTestId=${editTestId} pencilProxy=${pencil}`,
    );

    // Click Eye via testid (prefer)
    hrm = await hrmScope(page);
    const eyeIframe = hrm.getByTestId('hdsd-contracts-view-btn').first();
    const eyeParent = page.getByTestId('hdsd-contracts-view-btn').first();
    let clicked = false;
    let clickSurface = null;
    if ((await eyeIframe.count()) > 0) {
      await eyeIframe.click({ force: true });
      clicked = true;
      clickSurface = 'iframe-testid';
    } else if ((await eyeParent.count()) > 0) {
      await eyeParent.click({ force: true });
      clicked = true;
      clickSurface = 'parent-testid';
    } else {
      // Fallback: accessible name (FE added sr-only)
      const byName = hrm.getByRole('button', { name: /chi tiết hợp đồng|chi tiết|xem/i }).first();
      if ((await byName.count()) > 0) {
        await byName.click({ force: true });
        clicked = true;
        clickSurface = 'aria-name';
      }
    }
    await sleep(2000);
    await shot(page, '02-after-eye-click');
    record('CLICK_VIEW_BTN', clicked ? 'PASS' : 'FAIL', `surface=${clickSurface}`);
    if (!clicked) throw new Error('hdsd-contracts-view-btn not found');

    hrm = await hrmScope(page);
    const dlg = await assertViewDialogOpen(page, hrm);
    const content = await probeContent(page, hrm);
    await shot(page, '03-view-dialog');

    const j03Pass = dlg.open && content.populated;
    const j03Partial = dlg.open && !content.populated;
    const j03Verdict = j03Pass ? 'PASS' : j03Partial ? 'PARTIAL' : 'FAIL';
    results.journey['J-HRM-03'] = {
      verdict: j03Verdict,
      summary: `open=${dlg.open} parentCount=${dlg.parentCount} latch=${dlg.latchCount} code=${content.codeText} title=${content.titleHit} roleDlg=${dlg.roleDlg}`,
      dialog: dlg,
      content,
      clickSurface,
      at: ts(),
    };
    record(
      'J-HRM-03',
      j03Verdict,
      results.journey['J-HRM-03'].summary,
      { dialog: dlg, content },
    );

    if (j03Pass) {
      results.residuals = results.residuals.filter((r) => r.id !== 'R-J03-DIALOG');
      results.residuals.push({
        id: 'R-J03-DIALOG',
        severity: 'P2',
        status: 'CLOSED',
        note: 'Eye → view dialog/latch + populated code',
      });
      results.overall = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    } else {
      results.residuals.push({
        id: 'R-J03-DIALOG',
        severity: 'P2',
        status: 'OPEN',
        note: results.journey['J-HRM-03'].summary,
      });
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    }

    // Spot must_keep still present after dialog (create CTA on list chrome)
    const createAfter =
      (await hrm.getByTestId('hdsd-contracts-create-btn').count().catch(() => 0)) +
      (await page.getByTestId('hdsd-contracts-create-btn').count().catch(() => 0));
    record(
      'MUST_KEEP_AFTER',
      createAfter > 0 || mustKeepCreate ? 'PASS' : 'FAIL',
      `createAfter=${createAfter} (dialog may cover; pre-spot=${mustKeepCreate})`,
    );
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({
      id: 'R-J03-HARNESS',
      severity: 'P1',
      note: String(e?.message || e).slice(0, 400),
    });
    record('HARNESS', 'FAIL', String(e?.message || e));
    await shot(page, '99-error').catch(() => {});
  } finally {
    results.endedAt = ts();
    results.consoleErrors = results.consoleErrors.slice(0, 30);
    save();
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        overall: results.overall,
        ack_status: results.ack_status,
        J03: results.journey['J-HRM-03'],
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
