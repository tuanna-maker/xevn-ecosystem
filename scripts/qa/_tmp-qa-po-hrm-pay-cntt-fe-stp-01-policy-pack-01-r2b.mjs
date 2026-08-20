#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2 (harness v2b)
 * Fixes over r2: form-scoped fills (search box aria-label collided with "Tên gói"),
 * edit-mode reopen per AC (create form is always visible after restore).
 * U65 ceo@ · zero-seed · browser-only · CHUNG policy pack.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
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

const STAMP = `PAYPPQAR2-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2',
  parent: 'PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: { payroll_e2e_ready: false, formula_evaluator: 'HOLD', uf_hrm_10: false, rieng_stp_02_05_06: 'NOT_CLAIMED' },
  env: { PORTAL, HRM_FE, HRM, XBOS, TENANT, commit: COMMIT },
  modes: {},
  ac: {},
  network: [],
  consoleErrors: [],
  defects: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function save() { writeFileSync(OUT_JSON, JSON.stringify(R, null, 2)); }
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
  save();
}
function defect(id, summary, severity = 'P0') {
  R.defects.push({ id, severity, summary, at: ts() });
  console.log(`DEFECT ${severity} ${id}: ${summary}`);
  save();
}

async function reachable(url) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(5000) }); return r.status === 200 || r.status === 304; }
  catch { return false; }
}

async function loginApi() {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (r.ok && token) return { token, user: data?.user ?? { email: EMAIL, userId: EMAIL, roles: ['group_ceo'] }, companyId: COMPANY, expiresAt: Date.now() + 8_000_000 };
    } catch { /* */ }
  }
  throw new Error('login failed');
}

async function injectAuth(page, session) {
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
    }
  }, session);
}

function wireNetwork(page, bag) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') { const t = msg.text().slice(0, 400); R.consoleErrors.push(t); bag.consoleErrors.push(t); }
  });
  page.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    if (!/pay-policy-packs/i.test(url)) return;
    let body = null;
    try { body = req.postDataJSON(); } catch { /* */ }
    const entry = { method: req.method(), url: url.slice(0, 280), status: res.status(), body, at: ts() };
    R.network.push(entry);
    bag.network.push(entry);
    // Capture stored code from POST create response (BE may transform/lowercase the code).
    if (req.method() === 'POST' && !/archive/i.test(url) && res.status() >= 200 && res.status() < 300) {
      try {
        const j = await res.json();
        const d = j?.data ?? j;
        const stored = d?.code ?? d?.pack?.code;
        if (stored) bag.storedCode = String(stored);
      } catch { /* */ }
    }
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: true }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function findCtx(page, testId, timeout = 12000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const h of [page, ...page.frames()]) {
      try { const loc = h.getByTestId(testId).first(); if (await loc.isVisible({ timeout: 400 }).catch(() => false)) return { host: h, loc }; }
      catch { /* */ }
    }
    await sleep(400);
  }
  return null;
}

function setupUrl(base, mode) {
  if (mode === 'portal') {
    const u = new URL('/hr/payroll/setup', base);
    u.searchParams.set('portal', '1'); u.searchParams.set('tenantId', TENANT);
    u.searchParams.set('companyId', COMPANY); u.searchParams.set('section', 'policy-pack');
    return u.toString();
  }
  return `${base.replace(/\/$/, '')}/hr/payroll/setup?section=policy-pack&companyId=${COMPANY}&tenantId=${TENANT}`;
}

async function openHub(page, base, mode) {
  await page.goto(setupUrl(base, mode), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2500);
  const hub = await findCtx(page, 'pay-stp-hub-root', 8000);
  if (hub) {
    const nav = await findCtx(page, 'pay-stp-nav-policy-pack', 4000);
    if (nav) { await nav.loc.click({ force: true }).catch(() => {}); await sleep(1200); }
  }
  const list = await findCtx(page, 'pay-policy-pack-list', 20000);
  return { url: page.url(), hubFound: !!hub, listFound: !!list, list };
}

// form-scoped fills — avoids search box collision
function formOf(host) { return host.locator('[data-testid="pay-policy-pack-list"] form').first(); }
async function fillFormId(host, id, value) {
  const loc = formOf(host).locator(`#${id}`).first();
  if (!(await loc.isVisible({ timeout: 1500 }).catch(() => false))) return false;
  await loc.fill('');
  await loc.fill(String(value));
  return true;
}
async function isEditMode(host) {
  const heading = await formOf(host).locator('h3').first().textContent().catch(() => '');
  return /Cập nhật/i.test(heading || '');
}
async function clickSave(host) {
  const btn = host.getByTestId('pay-policy-pack-save').first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) { await btn.click({ force: true }); return true; }
  return false;
}
async function waitPackMutation(page, method, timeout = 20000) {
  return page.waitForResponse((res) => /pay-policy-packs/i.test(res.url()) && res.request().method() === method && !/archive/i.test(res.url()), { timeout }).catch(() => null);
}

async function runMode(browser, session, mode, base) {
  const bag = { mode, base, clickPath: [], network: [], consoleErrors: [], screens: [], verdict: 'BLOCKED', createdCode: null };
  const PACK_CODE = `QAR2${mode.slice(0, 3).toUpperCase()}${STAMP.slice(-5)}`;
  const PACK_NAME = `QA R2 goi ${mode} ${STAMP.slice(-5)}`;
  bag.createdCode = PACK_CODE;
  // Resolved after create from POST response; BE lowercases code. Fallback = lowercased sent code.
  const rowTid = () => `pay-policy-pack-row-${bag.storedCode ?? PACK_CODE.toLowerCase()}`;

  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  await injectAuth(page, session);
  wireNetwork(page, bag);

  // reopen the created row (fresh list context) → returns list host
  async function reopenCreatedRow() {
    const lc = await findCtx(page, 'pay-policy-pack-list', 12000);
    const h = lc?.host;
    if (!h) return null;
    let row = h.getByTestId(rowTid()).first();
    if (!(await row.isVisible({ timeout: 4000 }).catch(() => false))) {
      row = h.getByText(PACK_NAME, { exact: false }).first(); // fallback by unique name
    }
    if (await row.isVisible({ timeout: 3000 }).catch(() => false)) { await row.click({ force: true }); await sleep(700); return h; }
    return h; // row not found — caller handles
  }

  try {
    bag.clickPath.push(`goto ${setupUrl(base, mode)}`);
    const opened = await openHub(page, base, mode);
    bag.clickPath.push(`url=${opened.url}`);
    bag.screens.push(await shot(page, `${mode}-01-hub-list`));

    if (!opened.listFound) {
      defect(`DEF-PAY-STP-LIST-MISSING-${mode.toUpperCase()}`, `pay-policy-pack-list not visible (${opened.url})`, 'P0');
      ac(`NAV-${mode}`, 'FAIL', { summary: `hub=${opened.hubFound} list=${opened.listFound}`, url: opened.url });
      bag.verdict = 'FAIL'; R.modes[mode] = bag; await context.close(); return bag;
    }
    let host = opened.list.host;
    ac(`NAV-${mode}`, 'PASS', { summary: 'pay-stp-hub + pay-policy-pack-list visible', url: opened.url, clickPath: [...bag.clickPath] });

    // ---------- AC-PAY-STP-01-01 create ----------
    bag.clickPath.push('click + Thêm gói');
    const addBtn = host.getByTestId('pay-policy-pack-add').first();
    if (await addBtn.isVisible().catch(() => false)) { await addBtn.click({ force: true }); await sleep(500); }

    const saveVisible = await host.getByTestId('pay-policy-pack-save').first().isVisible({ timeout: 2000 }).catch(() => false);
    const codeVisible = await formOf(host).locator('#code').first().isVisible({ timeout: 1500 }).catch(() => false);
    if (!saveVisible || !codeVisible) {
      defect('DEF-PAY-STP-CREATE-FORM-MISSING', `+ Thêm gói không mở form tạo; save=${saveVisible} code=${codeVisible}`, 'P0');
      ac('AC-PAY-STP-01-01', 'FAIL', { summary: `create form not rendered save=${saveVisible} code=${codeVisible}`, mode, network: 'NONE', f5: 'N/A' });
    } else {
      const okCode = await fillFormId(host, 'code', PACK_CODE);
      const okName = await fillFormId(host, 'nameVi', PACK_NAME);
      const okFrom = await fillFormId(host, 'effectiveFrom', '01/07/2026');
      const kpiC = host.getByTestId('pay-params-kpi-threshold').first();
      if (await kpiC.isVisible().catch(() => false)) await kpiC.fill('70');
      const bccC = host.getByTestId('pay-params-bcc-std').first();
      let createDisplay = '';
      if (await bccC.isVisible().catch(() => false)) { await bccC.click({ force: true }); await bccC.fill('5000000'); await sleep(300); createDisplay = await bccC.inputValue().catch(() => ''); }
      bag.screens.push(await shot(page, `${mode}-02-create-filled`));

      const postWait = waitPackMutation(page, 'POST');
      bag.clickPath.push('click Lưu gói chính sách');
      const clicked = await clickSave(host);
      const postRes = await postWait;
      await sleep(1200);
      bag.screens.push(await shot(page, `${mode}-03-after-create`));

      const postNet = bag.network.filter((n) => n.method === 'POST' && !/archive/i.test(n.url)).slice(-1)[0];
      const postOk = postRes && postRes.status() >= 200 && postRes.status() < 300;
      const cRates = postNet?.body?.rateParams ?? postNet?.body?.rate_params;
      const cBcc = cRates?.bcc_std ?? cRates?.bccStd;
      const rowNow =
        (await host.getByTestId(rowTid()).first().isVisible({ timeout: 3000 }).catch(() => false)) ||
        (await host.getByText(PACK_NAME, { exact: false }).first().isVisible({ timeout: 2000 }).catch(() => false));

      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      let lc = await findCtx(page, 'pay-policy-pack-list', 15000);
      host = lc?.host ?? host;
      const rowF5 =
        (await host.getByTestId(rowTid()).first().isVisible({ timeout: 5000 }).catch(() => false)) ||
        (await host.getByText(PACK_NAME, { exact: false }).first().isVisible({ timeout: 3000 }).catch(() => false));
      bag.screens.push(await shot(page, `${mode}-04-create-f5`));

      if (postOk && rowF5) {
        ac('AC-PAY-STP-01-01', 'PASS', {
          summary: `POST ${postRes.status()} · row ${rowTid()} · F5 retained · body code/name/from/scope=CHUNG`,
          mode, clickPath: [...bag.clickPath], network: postNet,
          feAfter2xx: rowNow ? 'row appears in list' : 'row after F5', f5: 'row retained',
          createBccBody: cBcc, createBccDisplay: createDisplay, okCode, okName, okFrom, saveClicked: clicked,
        });
      } else {
        ac('AC-PAY-STP-01-01', 'FAIL', { summary: `postOk=${!!postOk} status=${postRes?.status?.() ?? 'n/a'} rowF5=${rowF5} okName=${okName} okFrom=${okFrom}`, mode, network: postNet ?? 'NONE', f5: rowF5 ? 'retained' : 'missing' });
      }
    }

    const createdOk = R.ac['AC-PAY-STP-01-01']?.verdict === 'PASS';

    // ---------- AC-PAY-STP-03-01 KPI 150 (edit created row) ----------
    if (createdOk) {
      host = (await reopenCreatedRow()) ?? host;
      if (await isEditMode(host)) {
        const kpi = host.getByTestId('pay-params-kpi-threshold').first();
        await kpi.fill('150');
        const pre = bag.network.length;
        await clickSave(host);
        await sleep(900);
        const muts = bag.network.slice(pre).filter((n) => ['POST', 'PATCH'].includes(n.method) && !/archive/i.test(n.url));
        const msgOk = await host.getByText(/KPI threshold phải từ 0 đến 100/i).first().isVisible().catch(() => false);
        const cls = (await kpi.getAttribute('class')) || '';
        const redBorder = /border-red/i.test(cls);
        bag.screens.push(await shot(page, `${mode}-05-kpi-150`));
        if (msgOk && redBorder && muts.length === 0) ac('AC-PAY-STP-03-01', 'PASS', { summary: 'KPI=150 → viền đỏ + message VI + no request', mode, clickPath: [...bag.clickPath, 'edit row → KPI 150 → Lưu'], network: 'NONE (client blocked)', feAfter2xx: `redBorder=${redBorder}, message visible`, f5: 'N/A' });
        else ac('AC-PAY-STP-03-01', 'FAIL', { summary: `msgOk=${msgOk} redBorder=${redBorder} mutations=${muts.length}`, mode, network: muts.slice(-1) });
      } else ac('AC-PAY-STP-03-01', 'FAIL', { summary: 'edit form not open on created row', mode });
    } else ac('AC-PAY-STP-03-01', 'BLOCKED', { summary: 'no created row (AC-01-01 fail)', mode });

    // ---------- AC-PAY-STP-01-05 date order (edit created row) ----------
    if (createdOk) {
      host = (await reopenCreatedRow()) ?? host;
      if (await isEditMode(host)) {
        await fillFormId(host, 'effectiveFrom', '01/06/2026');
        await fillFormId(host, 'effectiveTo', '01/01/2026');
        const pre = bag.network.length;
        await clickSave(host);
        await sleep(900);
        const muts = bag.network.slice(pre).filter((n) => ['POST', 'PATCH'].includes(n.method) && !/archive/i.test(n.url));
        const dateMsg = await host.getByText(/Hiệu lực đến phải sau hiệu lực từ/i).first().isVisible().catch(() => false);
        bag.screens.push(await shot(page, `${mode}-06-date-order`));
        if (dateMsg && muts.length === 0) ac('AC-PAY-STP-01-05', 'PASS', { summary: 'FE chặn ngày đảo; không gửi request', mode, clickPath: [...bag.clickPath, 'edit row → from>to → Lưu'], network: 'NONE', feAfter2xx: 'message VI', f5: 'N/A' });
        else ac('AC-PAY-STP-01-05', 'FAIL', { summary: `dateMsg=${dateMsg} mutations=${muts.length}`, mode, network: muts.slice(-1) });
      } else ac('AC-PAY-STP-01-05', 'FAIL', { summary: 'edit form not open on created row', mode });
    } else ac('AC-PAY-STP-01-05', 'BLOCKED', { summary: 'no created row', mode });

    // ---------- AC-PAY-STP-04-01 + AC-PAY-STP-01-02 (edit KPI+BCC → PATCH → F5) ----------
    if (createdOk) {
      host = (await reopenCreatedRow()) ?? host;
      if (await isEditMode(host)) {
        const kpi = host.getByTestId('pay-params-kpi-threshold').first();
        const bcc = host.getByTestId('pay-params-bcc-std').first();
        await kpi.fill('85');
        await bcc.click({ force: true });
        await bcc.fill('5000000');
        await sleep(300);
        const display = await bcc.inputValue().catch(() => '');
        const displayOk = display.includes('5.000.000');
        const patchWait = waitPackMutation(page, 'PATCH');
        await clickSave(host);
        const patchRes = await patchWait;
        await sleep(1000);
        const patchNet = bag.network.filter((n) => n.method === 'PATCH').slice(-1)[0];
        const rates = patchNet?.body?.rateParams ?? patchNet?.body?.rate_params;
        const bccBody = rates?.bcc_std ?? rates?.bccStd;
        const kpiBody = rates?.kpi_threshold;
        const plainNumber = typeof bccBody === 'number' && bccBody === 5000000;
        bag.screens.push(await shot(page, `${mode}-07-bcc-patch`));
        const patchOk = patchRes && patchRes.status() >= 200 && patchRes.status() < 300;

        // AC-04-01 verdict
        if (patchOk && plainNumber && displayOk) ac('AC-PAY-STP-04-01', 'PASS', { summary: `display=${display} · PATCH ${patchRes.status()} · rateParams.bcc_std=${bccBody} (number thuần)`, mode, clickPath: [...bag.clickPath, 'edit row → BCC 5000000 → Cập nhật'], network: patchNet, feAfter2xx: `display ${display}`, f5: 'verified with 01-02' });
        else { if (bccBody == null && patchRes) defect('DEF-PAY-STP-BCC-WIRE', 'PATCH ok nhưng rateParams.bcc_std thiếu — kiểm ViMoneyInput onValueChange', 'P0'); ac('AC-PAY-STP-04-01', 'FAIL', { summary: `display=${display} displayOk=${displayOk} status=${patchRes?.status?.() ?? 'n/a'} bccBody=${bccBody} plain=${plainNumber}`, mode, network: patchNet ?? null }); }

        // F5 → reopen → verify KPI persisted (AC-01-02)
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        host = (await reopenCreatedRow()) ?? host;
        const kpiVal = await host.getByTestId('pay-params-kpi-threshold').first().inputValue().catch(() => '');
        const bccVal = await host.getByTestId('pay-params-bcc-std').first().inputValue().catch(() => '');
        bag.screens.push(await shot(page, `${mode}-08-patch-f5`));
        const kpiPersisted = kpiVal === '85';
        if (patchOk && kpiPersisted) ac('AC-PAY-STP-01-02', 'PASS', { summary: `PATCH ${patchRes.status()} · KPI F5=${kpiVal} · BCC F5=${bccVal} · kpi_threshold body=${kpiBody}`, mode, clickPath: [...bag.clickPath, 'edit row → KPI 85 + BCC → Cập nhật → F5'], network: patchNet, feAfter2xx: 'form updated', f5: `kpi=${kpiVal} bcc=${bccVal}` });
        else ac('AC-PAY-STP-01-02', 'FAIL', { summary: `patchOk=${!!patchOk} status=${patchRes?.status?.() ?? 'n/a'} kpiF5=${kpiVal}`, mode, network: patchNet, f5: `kpi=${kpiVal}` });
      } else { ac('AC-PAY-STP-04-01', 'FAIL', { summary: 'edit form not open', mode }); ac('AC-PAY-STP-01-02', 'FAIL', { summary: 'edit form not open', mode }); }
    } else { ac('AC-PAY-STP-04-01', 'BLOCKED', { summary: 'no created row', mode }); ac('AC-PAY-STP-01-02', 'BLOCKED', { summary: 'no created row', mode }); }

    // ---------- AC-PAY-STP-01-03 archive created row (regression) ----------
    if (createdOk) {
      host = (await reopenCreatedRow()) ?? host;
      const archBtn = host.getByTestId('pay-policy-pack-archive').first();
      if (await archBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const archWait = page.waitForResponse((res) => /pay-policy-packs\/.+\/archive/i.test(res.url()) && res.request().method() === 'POST', { timeout: 20000 }).catch(() => null);
        await archBtn.click({ force: true });
        const archRes = await archWait;
        await sleep(1200);
        const hiddenAfter = !(await host.getByText(PACK_NAME, { exact: false }).first().isVisible().catch(() => false));
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        const lc = await findCtx(page, 'pay-policy-pack-list', 12000);
        host = lc?.host ?? host;
        const hiddenF5 =
          !(await host.getByTestId(rowTid()).first().isVisible({ timeout: 2000 }).catch(() => false)) &&
          !(await host.getByText(PACK_NAME, { exact: false }).first().isVisible({ timeout: 2000 }).catch(() => false));
        bag.screens.push(await shot(page, `${mode}-09-archive-f5`));
        const archOk = archRes && archRes.status() >= 200 && archRes.status() < 300;
        if (archOk && hiddenF5) ac('AC-PAY-STP-01-03', 'PASS', { summary: `POST archive ${archRes.status()} · row ẩn khỏi list mặc định · F5`, mode, clickPath: [...bag.clickPath, 'edit row → Ngưng áp dụng → F5'], network: bag.network.filter((n) => /archive/i.test(n.url)).slice(-1), feAfter2xx: hiddenAfter ? 'row hidden' : 'row visible briefly', f5: 'hidden default list' });
        else ac('AC-PAY-STP-01-03', 'FAIL', { summary: `archOk=${!!archOk} status=${archRes?.status?.() ?? 'n/a'} hiddenF5=${hiddenF5}`, mode, network: bag.network.filter((n) => /archive/i.test(n.url)).slice(-1) });
      } else ac('AC-PAY-STP-01-03', 'FAIL', { summary: 'pay-policy-pack-archive not visible on created row', mode });
    } else ac('AC-PAY-STP-01-03', 'BLOCKED', { summary: 'no created row', mode });

    const acFails = Object.entries(R.ac).filter(([k, v]) => k.startsWith('AC-') && v.mode === mode && v.verdict === 'FAIL');
    bag.verdict = acFails.length ? 'FAIL' : 'PASS';
  } catch (err) {
    bag.verdict = 'FAIL';
    bag.error = String(err?.stack || err).slice(0, 800);
    defect(`DEF-PAY-STP-HARNESS-${mode.toUpperCase()}`, bag.error, 'P0');
  }

  R.modes[mode] = bag; save(); await context.close(); return bag;
}

async function main() {
  const session = await loginApi();
  console.log('login ok', STAMP);
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const portalUp = await reachable(PORTAL);
  const hrmFeUp = await reachable(HRM_FE);
  if (portalUp) { console.log('MODE portal', PORTAL); await runMode(browser, session, 'portal', PORTAL); } else ac('NAV-portal', 'BLOCKED', { summary: `${PORTAL} down` });
  if (hrmFeUp) { console.log('MODE standalone', HRM_FE); await runMode(browser, session, 'standalone', HRM_FE); } else ac('NAV-standalone', 'BLOCKED', { summary: `${HRM_FE} down` });
  await browser.close();

  const required = ['AC-PAY-STP-01-01', 'AC-PAY-STP-01-02', 'AC-PAY-STP-01-03', 'AC-PAY-STP-01-05', 'AC-PAY-STP-03-01', 'AC-PAY-STP-04-01'];
  const modeVerdicts = Object.values(R.modes).map((m) => m.verdict);
  const anyModeFail = modeVerdicts.includes('FAIL');
  const anyModePass = modeVerdicts.includes('PASS');
  const navOk = R.ac['NAV-portal']?.verdict === 'PASS' || R.ac['NAV-standalone']?.verdict === 'PASS';
  // per-mode required PASS check
  const perModeReqPass = Object.values(R.modes).every((m) => m.verdict === 'PASS');
  R.requiredAcSummary = required.map((id) => ({ id, verdict: R.ac[id]?.verdict ?? 'MISSING' }));
  R.overall = !anyModeFail && anyModePass && navOk && perModeReqPass ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log('OVERALL', R.overall, R.ack_status);
  console.log('MODE VERDICTS', JSON.stringify(modeVerdicts));
  console.log('CONSOLE ERRORS', R.consoleErrors.length);
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM'; R.overall = 'FAIL'; R.endedAt = ts(); R.harnessError = String(e?.stack || e).slice(0, 1000);
  save(); process.exit(1);
});
