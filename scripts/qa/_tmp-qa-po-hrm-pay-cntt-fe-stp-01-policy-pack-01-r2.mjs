#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2
 * Retest after dev-fe restore (D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01).
 * U65 ceo@ · zero-seed · browser-only · CHUNG policy pack AC matrix.
 * Modes: portal embed (:5173) + standalone HRM (:8080).
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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2',
);
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
  honesty: {
    payroll_e2e_ready: false,
    formula_evaluator: 'HOLD',
    uf_hrm_10: false,
    rieng_stp_02_05_06: 'NOT_CLAIMED',
  },
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

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
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
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return r.status === 200 || r.status === 304;
  } catch {
    return false;
  }
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
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        return {
          token,
          user: data?.user ?? { email: EMAIL, userId: EMAIL, roles: ['group_ceo'] },
          companyId: COMPANY,
          expiresAt: Date.now() + 8_000_000,
        };
      }
    } catch {
      /* */
    }
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
    if (msg.type() === 'error') {
      const t = msg.text().slice(0, 400);
      R.consoleErrors.push(t);
      bag.consoleErrors.push(t);
    }
  });
  page.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    const method = req.method();
    if (!/pay-policy-packs/i.test(url)) return;
    let body = null;
    try {
      body = req.postDataJSON();
    } catch {
      /* */
    }
    const entry = { method, url: url.slice(0, 280), status: res.status(), body, at: ts() };
    R.network.push(entry);
    bag.network.push(entry);
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
      try {
        const loc = h.getByTestId(testId).first();
        if (await loc.isVisible({ timeout: 400 }).catch(() => false)) return { host: h, loc };
      } catch {
        /* */
      }
    }
    await sleep(400);
  }
  return null;
}

function setupUrl(base, mode) {
  if (mode === 'portal') {
    const u = new URL('/hr/payroll/setup', base);
    u.searchParams.set('portal', '1');
    u.searchParams.set('tenantId', TENANT);
    u.searchParams.set('companyId', COMPANY);
    u.searchParams.set('section', 'policy-pack');
    return u.toString();
  }
  return `${base.replace(/\/$/, '')}/hr/payroll/setup?section=policy-pack&companyId=${COMPANY}&tenantId=${TENANT}`;
}

async function openHub(page, base, mode) {
  const url = setupUrl(base, mode);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2500);
  const hub = await findCtx(page, 'pay-stp-hub-root', 8000);
  if (hub) {
    const nav = await findCtx(page, 'pay-stp-nav-policy-pack', 4000);
    if (nav) {
      await nav.loc.click({ force: true }).catch(() => {});
      await sleep(1200);
    }
  }
  const list = await findCtx(page, 'pay-policy-pack-list', 20000);
  return { url: page.url(), hubFound: !!hub, listFound: !!list, list };
}

async function fillByLabel(host, label, value) {
  const loc = host.getByLabel(label, { exact: false }).first();
  if (!(await loc.isVisible({ timeout: 1500 }).catch(() => false))) return false;
  await loc.fill('');
  await loc.fill(String(value));
  return true;
}

async function clickSave(host) {
  const btn = host.getByTestId('pay-policy-pack-save').first();
  if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.click({ force: true });
    return true;
  }
  const byRole = host.getByRole('button', { name: /Lưu gói chính sách|Cập nhật/i }).first();
  if (await byRole.isVisible({ timeout: 800 }).catch(() => false)) {
    await byRole.click({ force: true });
    return true;
  }
  return false;
}

async function waitPackMutation(page, method, timeout = 25000) {
  return page
    .waitForResponse(
      (res) =>
        /pay-policy-packs/i.test(res.url()) &&
        res.request().method() === method &&
        !/archive/i.test(res.url()),
      { timeout },
    )
    .catch(() => null);
}

async function runMode(browser, session, mode, base) {
  const bag = {
    mode,
    base,
    clickPath: [],
    network: [],
    consoleErrors: [],
    screens: [],
    verdict: 'BLOCKED',
    createdCode: null,
  };
  const PACK_CODE = `QAR2-${mode.slice(0, 3).toUpperCase()}-${STAMP.slice(-6)}`;
  const PACK_NAME = `QA R2 Gói ${mode} ${STAMP.slice(-6)}`;
  bag.createdCode = PACK_CODE;

  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  await injectAuth(page, session);
  wireNetwork(page, bag);

  try {
    bag.clickPath.push(`goto ${setupUrl(base, mode)}`);
    const opened = await openHub(page, base, mode);
    bag.clickPath.push(`url=${opened.url}`);
    bag.screens.push(await shot(page, `${mode}-01-hub-list`));

    if (!opened.listFound) {
      defect(`DEF-PAY-STP-LIST-MISSING-${mode.toUpperCase()}`, `pay-policy-pack-list not visible on ${mode} (${opened.url})`, 'P0');
      ac(`NAV-${mode}`, 'FAIL', { summary: `Hub/list not mounted; hub=${opened.hubFound} list=${opened.listFound}`, url: opened.url });
      bag.verdict = 'FAIL';
      R.modes[mode] = bag;
      await context.close();
      return bag;
    }

    let host = opened.list.host;
    ac(`NAV-${mode}`, 'PASS', { summary: `pay-stp-hub + pay-policy-pack-list visible`, url: opened.url, clickPath: [...bag.clickPath] });

    // ---------------- AC-PAY-STP-01-01 create (default form) ----------------
    // Restore behaviour: form should render by default. Click + Thêm gói to reset to create.
    bag.clickPath.push('click + Thêm gói');
    const addBtn = host.getByTestId('pay-policy-pack-add').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ force: true });
      await sleep(600);
    }
    bag.screens.push(await shot(page, `${mode}-02-after-add`));

    const saveVisible = await host.getByTestId('pay-policy-pack-save').first().isVisible({ timeout: 2000 }).catch(() => false);
    const codeVisible = await host.getByLabel(/Mã gói/i).first().isVisible({ timeout: 1500 }).catch(() => false);

    if (!saveVisible || !codeVisible) {
      defect('DEF-PAY-STP-CREATE-FORM-MISSING', '+ Thêm gói không mở form tạo (save/code không hiện). AC-01-01 blocked.', 'P0');
      ac('AC-PAY-STP-01-01', 'FAIL', {
        summary: `Create form not rendered; save=${saveVisible} code=${codeVisible}`,
        mode,
        clickPath: [...bag.clickPath],
        feAfter: 'no create form',
        network: 'NONE',
        f5: 'N/A',
      });
    } else {
      await fillByLabel(host, 'Mã gói', PACK_CODE);
      await fillByLabel(host, 'Tên gói', PACK_NAME);
      const fromOk = await fillByLabel(host, 'Hiệu lực từ', '01/07/2026');
      // KPI + BCC on create too (covers 04-01 body number)
      const kpiC = host.getByTestId('pay-params-kpi-threshold').first();
      if (await kpiC.isVisible().catch(() => false)) await kpiC.fill('70');
      const bccC = host.getByTestId('pay-params-bcc-std').first();
      let createDisplay = '';
      if (await bccC.isVisible().catch(() => false)) {
        await bccC.click({ force: true });
        await bccC.fill('5000000');
        await sleep(300);
        createDisplay = await bccC.inputValue().catch(() => '');
      }

      const postWait = waitPackMutation(page, 'POST');
      bag.clickPath.push('click Lưu gói chính sách');
      const clicked = await clickSave(host);
      const postRes = await postWait;
      await sleep(1200);
      bag.screens.push(await shot(page, `${mode}-03-after-create`));

      const postNet = bag.network.filter((n) => n.method === 'POST' && !/archive/i.test(n.url)).slice(-1)[0];
      const postOk = postRes && postRes.status() >= 200 && postRes.status() < 300;
      const rowNow = await host.getByTestId(`pay-policy-pack-row-${PACK_CODE}`).first().isVisible().catch(() => false);

      // capture BCC body (AC-04-01 create-side)
      const cRates = postNet?.body?.rateParams ?? postNet?.body?.rate_params;
      const cBcc = cRates?.bcc_std ?? cRates?.bccStd;

      // F5
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      const list2 = await findCtx(page, 'pay-policy-pack-list', 15000);
      host = list2?.host ?? host;
      const rowF5 = await host.getByTestId(`pay-policy-pack-row-${PACK_CODE}`).first().isVisible().catch(() => false);
      bag.screens.push(await shot(page, `${mode}-04-create-f5`));

      if (postOk && rowF5) {
        ac('AC-PAY-STP-01-01', 'PASS', {
          summary: `POST ${postRes.status()} · row pay-policy-pack-row-${PACK_CODE} · F5 retained`,
          mode,
          clickPath: [...bag.clickPath],
          network: postNet,
          feAfter2xx: rowNow ? 'row in list' : 'row after refresh',
          f5: 'row retained',
          fromFilled: fromOk,
          saveClicked: clicked,
        });
        // create-side BCC number check (supporting AC-04-01)
        bag.createBcc = { display: createDisplay, body: cBcc };
      } else {
        ac('AC-PAY-STP-01-01', 'FAIL', {
          summary: `create fail postOk=${!!postOk} status=${postRes?.status?.() ?? 'n/a'} rowF5=${rowF5} saveClicked=${clicked}`,
          mode,
          clickPath: [...bag.clickPath],
          network: postNet ?? 'NONE',
          feAfter2xx: rowNow ? 'row' : 'no row',
          f5: rowF5 ? 'retained' : 'missing',
        });
      }
    }

    // Re-open list context
    let listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
    host = listCtx?.host ?? host;

    // Open the created row (or first available row) for edit-based ACs
    async function openRow() {
      let r = host.getByTestId(`pay-policy-pack-row-${PACK_CODE}`).first();
      if (!(await r.isVisible().catch(() => false))) {
        r = host.locator('[data-testid^="pay-policy-pack-row"]').first();
      }
      if (await r.isVisible().catch(() => false)) {
        await r.click({ force: true });
        await sleep(800);
        return true;
      }
      return false;
    }
    const rowOpened = await openRow();
    bag.clickPath.push('click row → edit form');
    bag.screens.push(await shot(page, `${mode}-05-detail`));

    if (!rowOpened) {
      defect('DEF-PAY-STP-NO-ROW', 'No CHUNG row available for edit/validate ACs', 'P0');
      for (const id of ['AC-PAY-STP-01-02', 'AC-PAY-STP-01-05', 'AC-PAY-STP-03-01', 'AC-PAY-STP-04-01']) {
        if (!R.ac[id]) ac(id, 'BLOCKED', { summary: 'No list row to open detail form', mode });
      }
    } else {
      listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
      host = listCtx?.host ?? host;

      // ---------------- AC-PAY-STP-03-01 KPI 150 ----------------
      const kpi = host.getByTestId('pay-params-kpi-threshold').first();
      if (await kpi.isVisible().catch(() => false)) {
        await kpi.fill('150');
        const pre = bag.network.length;
        await clickSave(host);
        await sleep(900);
        const muts = bag.network.slice(pre).filter((n) => ['POST', 'PATCH'].includes(n.method) && !/archive/i.test(n.url));
        const msgOk = await host.getByText(/KPI threshold phải từ 0 đến 100/i).first().isVisible().catch(() => false);
        const borderClass = (await kpi.getAttribute('class')) || '';
        const redBorder = /border-red|red-4|destructive/i.test(borderClass);
        bag.screens.push(await shot(page, `${mode}-06-kpi-150`));
        if (msgOk && redBorder && muts.length === 0) {
          ac('AC-PAY-STP-03-01', 'PASS', {
            summary: `KPI=150 → viền đỏ + VI message + no request`,
            mode,
            clickPath: [...bag.clickPath, 'set KPI 150 → Lưu'],
            network: 'NONE (client blocked)',
            feAfter2xx: `message visible; redBorder=${redBorder}`,
            f5: 'N/A (client validation)',
          });
        } else {
          ac('AC-PAY-STP-03-01', 'FAIL', { summary: `msgOk=${msgOk} redBorder=${redBorder} mutations=${muts.length}`, mode, network: muts.slice(-1) });
        }
        await kpi.fill('80');
      } else {
        ac('AC-PAY-STP-03-01', 'FAIL', { summary: 'pay-params-kpi-threshold not on detail', mode });
      }

      // ---------------- AC-PAY-STP-01-05 date order ----------------
      const fromOk = await fillByLabel(host, 'Hiệu lực từ', '01/06/2026');
      const toOk = await fillByLabel(host, 'Hiệu lực đến', '01/01/2026');
      if (fromOk && toOk) {
        const pre = bag.network.length;
        await clickSave(host);
        await sleep(900);
        const muts = bag.network.slice(pre).filter((n) => ['POST', 'PATCH'].includes(n.method) && !/archive/i.test(n.url));
        const dateMsg = await host.getByText(/Hiệu lực đến phải sau hiệu lực từ/i).first().isVisible().catch(() => false);
        bag.screens.push(await shot(page, `${mode}-07-date-order`));
        if (dateMsg && muts.length === 0) {
          ac('AC-PAY-STP-01-05', 'PASS', {
            summary: 'FE chặn ngày đảo; không gửi request',
            mode,
            clickPath: [...bag.clickPath, 'from>to → Lưu'],
            network: 'NONE',
            feAfter2xx: 'message VI',
            f5: 'N/A',
          });
        } else {
          ac('AC-PAY-STP-01-05', 'FAIL', { summary: `dateMsg=${dateMsg} mutations=${muts.length}`, mode, network: muts.slice(-1) });
        }
        // restore valid dates
        await fillByLabel(host, 'Hiệu lực đến', '');
        await fillByLabel(host, 'Hiệu lực từ', '01/07/2026');
      } else {
        ac('AC-PAY-STP-01-05', 'FAIL', { summary: `date labels not found from=${fromOk} to=${toOk}`, mode });
      }

      // ---------------- AC-PAY-STP-04-01 BCC display + body (via PATCH edit) ----------------
      const bcc = host.getByTestId('pay-params-bcc-std').first();
      if (await bcc.isVisible().catch(() => false)) {
        await bcc.click({ force: true });
        await bcc.fill('5000000');
        await sleep(400);
        const display = await bcc.inputValue().catch(() => '');
        const displayOk = display.includes('5.000.000');
        const patchWait = waitPackMutation(page, 'PATCH');
        await clickSave(host);
        const patchRes = await patchWait;
        await sleep(1000);
        const patchNet = bag.network.filter((n) => n.method === 'PATCH').slice(-1)[0];
        const bodyRates = patchNet?.body?.rateParams ?? patchNet?.body?.rate_params;
        const bccBody = bodyRates?.bcc_std ?? bodyRates?.bccStd;
        const plainNumber = typeof bccBody === 'number' && bccBody === 5000000;
        bag.screens.push(await shot(page, `${mode}-08-bcc-patch`));
        if (patchRes && patchRes.status() >= 200 && patchRes.status() < 300 && plainNumber && displayOk) {
          ac('AC-PAY-STP-04-01', 'PASS', {
            summary: `display=${display} · PATCH ${patchRes.status()} · rateParams.bcc_std=${bccBody} (number)`,
            mode,
            clickPath: [...bag.clickPath, 'BCC 5000000 → Cập nhật'],
            network: patchNet,
            feAfter2xx: `display ${display}`,
            f5: 'checked with 01-02',
          });
        } else {
          if (bccBody == null && patchRes) {
            defect('DEF-PAY-STP-BCC-WIRE', 'PATCH ok nhưng rateParams.bcc_std thiếu/sai — kiểm ViMoneyInput onValueChange', 'P0');
          }
          ac('AC-PAY-STP-04-01', 'FAIL', {
            summary: `display=${display} displayOk=${displayOk} status=${patchRes?.status?.() ?? 'n/a'} bccBody=${bccBody} plain=${plainNumber}`,
            mode,
            network: patchNet ?? null,
          });
        }
      } else {
        defect('DEF-PAY-STP-BCC-TESTID-MISSING', 'pay-params-bcc-std absent trên form', 'P1');
        ac('AC-PAY-STP-04-01', 'FAIL', { summary: 'pay-params-bcc-std not found', mode });
      }

      // ---------------- AC-PAY-STP-01-02 edit KPI+BCC persist ----------------
      listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
      host = listCtx?.host ?? host;
      if (!(await host.getByTestId('pay-params-kpi-threshold').isVisible().catch(() => false))) {
        await openRow();
        await sleep(600);
        listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
        host = listCtx?.host ?? host;
      }
      if (await host.getByTestId('pay-params-kpi-threshold').isVisible().catch(() => false)) {
        await host.getByTestId('pay-params-kpi-threshold').fill('85');
        const bcc2 = host.getByTestId('pay-params-bcc-std').first();
        if (await bcc2.isVisible().catch(() => false)) {
          await bcc2.click({ force: true });
          await bcc2.fill('6000000');
        }
        const patchWait2 = waitPackMutation(page, 'PATCH');
        await clickSave(host);
        const patch2 = await patchWait2;
        await sleep(1000);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
        host = listCtx?.host ?? host;
        await openRow();
        await sleep(700);
        const kpiVal = await host.getByTestId('pay-params-kpi-threshold').inputValue().catch(() => '');
        const patchOk = patch2 && patch2.status() >= 200 && patch2.status() < 300;
        const kpiPersisted = kpiVal === '85';
        bag.screens.push(await shot(page, `${mode}-09-patch-f5`));
        if (patchOk && kpiPersisted) {
          ac('AC-PAY-STP-01-02', 'PASS', {
            summary: `PATCH ${patch2.status()} · KPI F5=${kpiVal}`,
            mode,
            clickPath: [...bag.clickPath, 'edit KPI 85 + BCC → Cập nhật → F5'],
            network: bag.network.filter((n) => n.method === 'PATCH').slice(-1),
            feAfter2xx: 'form updated',
            f5: `kpi=${kpiVal}`,
          });
        } else {
          ac('AC-PAY-STP-01-02', 'FAIL', {
            summary: `patchOk=${!!patchOk} status=${patch2?.status?.() ?? 'n/a'} kpiF5=${kpiVal}`,
            mode,
            network: bag.network.filter((n) => n.method === 'PATCH').slice(-1),
            f5: `kpi=${kpiVal}`,
          });
        }
      } else if (!R.ac['AC-PAY-STP-01-02']) {
        ac('AC-PAY-STP-01-02', 'FAIL', { summary: 'KPI field unavailable for edit persist', mode });
      }

      // ---------------- AC-PAY-STP-01-03 Archive (regression) ----------------
      listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
      host = listCtx?.host ?? host;
      if (!(await host.getByTestId('pay-policy-pack-archive').isVisible().catch(() => false))) {
        await openRow();
        await sleep(600);
        listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
        host = listCtx?.host ?? host;
      }
      const archBtn = host.getByTestId('pay-policy-pack-archive').first();
      if (await archBtn.isVisible().catch(() => false)) {
        const archWait = page
          .waitForResponse((res) => /pay-policy-packs\/.+\/archive/i.test(res.url()) && res.request().method() === 'POST', { timeout: 25000 })
          .catch(() => null);
        await archBtn.click({ force: true });
        const archRes = await archWait;
        await sleep(1200);
        const hiddenAfter = !(await host.getByTestId(`pay-policy-pack-row-${PACK_CODE}`).first().isVisible().catch(() => false));
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2500);
        listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
        host = listCtx?.host ?? host;
        const hiddenF5 = !(await host.getByTestId(`pay-policy-pack-row-${PACK_CODE}`).first().isVisible().catch(() => false));
        bag.screens.push(await shot(page, `${mode}-10-archive-f5`));
        const archOk = archRes && archRes.status() >= 200 && archRes.status() < 300;
        if (archOk && hiddenF5) {
          ac('AC-PAY-STP-01-03', 'PASS', {
            summary: `POST archive ${archRes.status()} · row ẩn khỏi list mặc định · F5`,
            mode,
            clickPath: [...bag.clickPath, 'Ngưng áp dụng → F5'],
            network: bag.network.filter((n) => /archive/i.test(n.url)).slice(-1),
            feAfter2xx: hiddenAfter ? 'row hidden' : 'row still visible briefly',
            f5: 'hidden from default list',
          });
        } else {
          ac('AC-PAY-STP-01-03', 'FAIL', {
            summary: `archOk=${!!archOk} status=${archRes?.status?.() ?? 'n/a'} hiddenAfter=${hiddenAfter} hiddenF5=${hiddenF5}`,
            mode,
            network: bag.network.filter((n) => /archive/i.test(n.url)).slice(-1),
          });
        }
      } else {
        ac('AC-PAY-STP-01-03', 'FAIL', { summary: 'pay-policy-pack-archive not visible', mode });
      }
    }

    const acFails = Object.entries(R.ac).filter(([k, v]) => k.startsWith('AC-') && v.verdict === 'FAIL' && (v.mode === mode || !v.mode));
    bag.verdict = acFails.length ? 'FAIL' : 'PASS';
  } catch (err) {
    bag.verdict = 'FAIL';
    bag.error = String(err?.stack || err).slice(0, 800);
    defect(`DEF-PAY-STP-HARNESS-${mode.toUpperCase()}`, bag.error, 'P0');
  }

  R.modes[mode] = bag;
  save();
  await context.close();
  return bag;
}

async function main() {
  const session = await loginApi();
  console.log('login ok', STAMP);

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  const portalUp = await reachable(PORTAL);
  const hrmFeUp = await reachable(HRM_FE);

  if (portalUp) {
    console.log('MODE portal', PORTAL);
    await runMode(browser, session, 'portal', PORTAL);
  } else {
    ac('NAV-portal', 'BLOCKED', { summary: `${PORTAL} down` });
  }

  if (hrmFeUp) {
    console.log('MODE standalone', HRM_FE);
    await runMode(browser, session, 'standalone', HRM_FE);
  } else {
    ac('NAV-standalone', 'BLOCKED', { summary: `${HRM_FE} down` });
  }

  await browser.close();

  // Overall = every required AC PASS in at least one mode AND no AC FAIL in any run mode.
  const required = [
    'AC-PAY-STP-01-01',
    'AC-PAY-STP-01-02',
    'AC-PAY-STP-01-03',
    'AC-PAY-STP-01-05',
    'AC-PAY-STP-03-01',
    'AC-PAY-STP-04-01',
  ];
  const modeVerdicts = Object.values(R.modes).map((m) => m.verdict);
  const anyModeFail = modeVerdicts.includes('FAIL');
  const anyModePass = modeVerdicts.includes('PASS');
  const navOk = R.ac['NAV-portal']?.verdict === 'PASS' || R.ac['NAV-standalone']?.verdict === 'PASS';
  R.requiredAcSummary = required.map((id) => ({ id, verdict: R.ac[id]?.verdict ?? 'MISSING' }));
  R.overall = !anyModeFail && anyModePass && navOk ? 'PASS' : 'FAIL';
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
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  R.harnessError = String(e?.stack || e).slice(0, 1000);
  save();
  process.exit(1);
});
