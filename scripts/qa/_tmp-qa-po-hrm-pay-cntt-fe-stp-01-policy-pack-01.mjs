#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * U65 ceo@ · zero-seed · browser-only · CHUNG policy pack AC matrix
 * Modes: portal embed (:5173) + standalone HRM (:8080) when reachable
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

const STAMP = `PAYPPQA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const PACK_CODE = `QA-PP-${STAMP.slice(-8)}`;
const PACK_NAME = `QA Gói chính sách ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01',
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
  work_item_id: 'QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01',
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
  l0: { qc_fe_be_health: 'exit 0' },
  pack: { code: PACK_CODE, name: PACK_NAME, id: null },
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
    const entry = {
      method,
      url: url.slice(0, 280),
      status: res.status(),
      body,
      at: ts(),
    };
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
  // standalone hrm-fe often mounted at /hr
  return `${base.replace(/\/$/, '')}/hr/payroll/setup?section=policy-pack&companyId=${COMPANY}&tenantId=${TENANT}`;
}

async function openHub(page, base, mode) {
  const url = setupUrl(base, mode);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2500);
  // Prefer nav click path if hub root visible without section
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

async function fillIfVisible(host, labelOrTestId, value, byTestId = false) {
  const loc = byTestId
    ? host.getByTestId(labelOrTestId).first()
    : host.getByLabel(labelOrTestId, { exact: false }).first();
  if (!(await loc.isVisible({ timeout: 1500 }).catch(() => false))) return false;
  await loc.fill('');
  await loc.fill(String(value));
  return true;
}

async function clickSave(host) {
  const candidates = [
    host.getByRole('button', { name: /Lưu gói chính sách|Lưu|Cập nhật/i }).first(),
    host.locator('[data-testid="pay-policy-pack-save"] button[type="submit"]').first(),
    host.locator('form[data-testid="pay-policy-pack-save"] button[type="submit"]').first(),
  ];
  for (const c of candidates) {
    if (await c.isVisible({ timeout: 800 }).catch(() => false)) {
      await c.click({ force: true });
      return true;
    }
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
  };
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
      defect(
        `DEF-PAY-STP-LIST-MISSING-${mode.toUpperCase()}`,
        `pay-policy-pack-list not visible on ${mode} (${opened.url})`,
        'P0',
      );
      ac(`NAV-${mode}`, 'FAIL', {
        summary: `Hub/list not mounted; hub=${opened.hubFound} list=${opened.listFound}`,
        url: opened.url,
      });
      bag.verdict = 'FAIL';
      R.modes[mode] = bag;
      await context.close();
      return bag;
    }

    const host = opened.list.host;
    ac(`NAV-${mode}`, 'PASS', {
      summary: `pay-stp-hub + pay-policy-pack-list visible`,
      url: opened.url,
      clickPath: bag.clickPath,
    });

    // --- AC-PAY-STP-01-01 create ---
    bag.clickPath.push('click + Thêm gói');
    const addBtn = host.getByTestId('pay-policy-pack-add').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ force: true });
      await sleep(800);
    }
    bag.screens.push(await shot(page, `${mode}-02-after-add`));

    const codeVisible = await host.getByLabel(/Mã gói/i).first().isVisible({ timeout: 2000 }).catch(() => false);
    const saveFormVisible = await host
      .locator('[data-testid="pay-policy-pack-save"]')
      .first()
      .isVisible({ timeout: 1500 })
      .catch(() => false);

    if (!codeVisible && !saveFormVisible) {
      defect(
        'DEF-PAY-STP-CREATE-FORM-MISSING',
        '+ Thêm gói không mở form tạo (editingId=null → dashed empty state). AC-PAY-STP-01-01 blocked.',
        'P0',
      );
      ac('AC-PAY-STP-01-01', 'FAIL', {
        summary: 'Create form not rendered after + Thêm gói; no POST attempted',
        mode,
        clickPath: [...bag.clickPath],
        feAfter: 'empty dashed state',
        network: 'NONE',
        f5: 'N/A',
      });
    } else {
      await fillIfVisible(host, 'Mã gói', PACK_CODE);
      await fillIfVisible(host, 'Tên gói', PACK_NAME);
      // ViDateField — try label then ISO fill
      const fromOk =
        (await fillIfVisible(host, 'Hiệu lực từ', '01/07/2026')) ||
        (await fillIfVisible(host, 'effectiveFrom', '2026-07-01', true));
      // KPI + BCC if present
      const kpiTid = await host.getByTestId('pay-params-kpi-threshold').isVisible().catch(() => false);
      if (kpiTid) await host.getByTestId('pay-params-kpi-threshold').fill('70');
      const bccTid = await host.getByTestId('pay-params-bcc-std').isVisible().catch(() => false);
      if (bccTid) {
        await host.getByTestId('pay-params-bcc-std').fill('5000000');
      } else {
        const bccByLabel = host.getByLabel(/BCC_STD/i).first();
        if (await bccByLabel.isVisible().catch(() => false)) {
          await bccByLabel.fill('5000000');
          defect(
            'DEF-PAY-STP-BCC-TESTID-MISSING',
            'pay-params-bcc-std testid missing — filled via label only',
            'P1',
          );
        }
      }

      const postWait = waitPackMutation(page, 'POST');
      bag.clickPath.push('click Lưu');
      const clicked = await clickSave(host);
      const postRes = await postWait;
      await sleep(1200);
      bag.screens.push(await shot(page, `${mode}-03-after-create`));

      const postNet = bag.network.filter((n) => n.method === 'POST' && !/archive/i.test(n.url));
      const postOk = postRes && postRes.status() >= 200 && postRes.status() < 300;
      let rowVisible = await host.getByText(PACK_CODE).first().isVisible().catch(() => false);

      // F5
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      const list2 = await findCtx(page, 'pay-policy-pack-list', 15000);
      const host2 = list2?.host ?? host;
      const rowAfterF5 = await host2.getByText(PACK_CODE).first().isVisible().catch(() => false);
      bag.screens.push(await shot(page, `${mode}-04-create-f5`));

      if (postOk && rowAfterF5) {
        ac('AC-PAY-STP-01-01', 'PASS', {
          summary: `POST ${postRes.status()} · row ${PACK_CODE} · F5 retained`,
          mode,
          clickPath: bag.clickPath,
          network: postNet.slice(-1),
          feAfter2xx: rowVisible ? 'row in list' : 'row delayed until refresh',
          f5: 'row retained',
          fromFilled: fromOk,
          saveClicked: clicked,
        });
        try {
          const j = await postRes.json();
          R.pack.id = j?.data?.id ?? j?.id ?? R.pack.id;
        } catch {
          /* */
        }
      } else {
        ac('AC-PAY-STP-01-01', 'FAIL', {
          summary: `create fail postOk=${!!postOk} status=${postRes?.status?.() ?? 'n/a'} rowF5=${rowAfterF5} saveClicked=${clicked}`,
          mode,
          clickPath: bag.clickPath,
          network: postNet.slice(-2),
          feAfter2xx: rowVisible ? 'row' : 'no row',
          f5: rowAfterF5 ? 'retained' : 'missing',
        });
      }
    }

    // Re-open list context after possible reload
    let listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
    let h = listCtx?.host;
    if (!h) {
      bag.verdict = 'FAIL';
      R.modes[mode] = bag;
      await context.close();
      return bag;
    }

    // Pick any existing CHUNG row for edit/archive/validation if create failed
    const anyRow = h.locator('[data-testid^="pay-policy-pack-row"]').first();
    const genericRow = h.getByTestId('pay-policy-pack-row').first();
    const rowTarget = (await anyRow.isVisible().catch(() => false))
      ? anyRow
      : (await genericRow.isVisible().catch(() => false))
        ? genericRow
        : h.getByText(PACK_CODE).first();

    const hasRow = await rowTarget.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasRow) {
      // try first button in list pane
      const firstBtn = h.locator('ul button').first();
      if (await firstBtn.isVisible().catch(() => false)) {
        await firstBtn.click({ force: true });
      } else {
        defect('DEF-PAY-STP-NO-ROW', 'No CHUNG row available for edit/archive/validate ACs', 'P0');
        for (const id of [
          'AC-PAY-STP-01-02',
          'AC-PAY-STP-01-03',
          'AC-PAY-STP-01-05',
          'AC-PAY-STP-03-01',
          'AC-PAY-STP-04-01',
        ]) {
          if (!R.ac[id] || R.ac[id].verdict === undefined) {
            ac(id, 'BLOCKED', { summary: 'No list row to open detail form', mode });
          }
        }
        bag.verdict = 'FAIL';
        R.modes[mode] = bag;
        await context.close();
        return bag;
      }
    } else {
      await rowTarget.click({ force: true });
    }
    await sleep(1000);
    bag.clickPath.push('click list row → detail');
    bag.screens.push(await shot(page, `${mode}-05-detail`));

    listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
    h = listCtx?.host ?? h;

    // --- AC-PAY-STP-03-01 KPI 150 ---
    const kpi = h.getByTestId('pay-params-kpi-threshold').first();
    if (await kpi.isVisible().catch(() => false)) {
      await kpi.fill('150');
      const preNetCount = bag.network.length;
      await clickSave(h);
      await sleep(900);
      const newMutations = bag.network.slice(preNetCount).filter((n) =>
        ['POST', 'PATCH'].includes(n.method),
      );
      const msg = h.getByText(/KPI threshold phải từ 0 đến 100/i).first();
      const msgOk = await msg.isVisible().catch(() => false);
      const borderClass = (await kpi.getAttribute('class')) || '';
      const redBorder = /border-red|red-4|destructive/i.test(borderClass);
      if (msgOk && newMutations.length === 0) {
        ac('AC-PAY-STP-03-01', 'PASS', {
          summary: 'KPI=150 → VI message + no request',
          mode,
          clickPath: [...bag.clickPath, 'set KPI 150 → Lưu'],
          network: 'NONE (blocked)',
          feAfter2xx: `message visible; redBorder=${redBorder}`,
          f5: 'N/A (client validation)',
        });
      } else {
        ac('AC-PAY-STP-03-01', 'FAIL', {
          summary: `msgOk=${msgOk} redBorder=${redBorder} mutations=${newMutations.length}`,
          mode,
          network: newMutations.slice(-1),
        });
      }
      // restore valid KPI for later
      await kpi.fill('80');
    } else {
      ac('AC-PAY-STP-03-01', 'FAIL', {
        summary: 'pay-params-kpi-threshold not found on detail',
        mode,
      });
    }

    // --- AC-PAY-STP-01-05 date order ---
    const fromField = h.getByLabel(/Hiệu lực từ/i).first();
    const toField = h.getByLabel(/Hiệu lực đến/i).first();
    if (
      (await fromField.isVisible().catch(() => false)) &&
      (await toField.isVisible().catch(() => false))
    ) {
      await fromField.fill('01/06/2026');
      await toField.fill('01/01/2026');
      const pre = bag.network.length;
      await clickSave(h);
      await sleep(900);
      const muts = bag.network.slice(pre).filter((n) => ['POST', 'PATCH'].includes(n.method));
      const dateMsg = await h
        .getByText(/Hiệu lực đến phải sau hiệu lực từ/i)
        .first()
        .isVisible()
        .catch(() => false);
      if (dateMsg && muts.length === 0) {
        ac('AC-PAY-STP-01-05', 'PASS', {
          summary: 'FE blocks inverted dates; no request',
          mode,
          clickPath: [...bag.clickPath, 'from>to → Lưu'],
          network: 'NONE',
          feAfter2xx: 'validation message VI',
          f5: 'N/A',
        });
      } else {
        ac('AC-PAY-STP-01-05', 'FAIL', {
          summary: `dateMsg=${dateMsg} mutations=${muts.length}`,
          mode,
          network: muts.slice(-1),
        });
      }
      // clear to for later successful patch
      await toField.fill('');
      await fromField.fill('01/07/2026');
    } else {
      ac('AC-PAY-STP-01-05', 'FAIL', {
        summary: 'ViDateField labels not found for date order test',
        mode,
      });
    }

    // --- AC-PAY-STP-04-01 BCC display + body ---
    const bccTid = h.getByTestId('pay-params-bcc-std').first();
    const bccLabel = h.getByLabel(/BCC_STD/i).first();
    const bcc = (await bccTid.isVisible().catch(() => false)) ? bccTid : bccLabel;
    if (await bcc.isVisible().catch(() => false)) {
      if (!(await bccTid.isVisible().catch(() => false))) {
        defect(
          'DEF-PAY-STP-BCC-TESTID-MISSING',
          'pay-params-bcc-std absent — using label BCC_STD',
          'P1',
        );
      }
      await bcc.click({ force: true });
      await bcc.fill('5000000');
      await sleep(400);
      const display = await bcc.inputValue().catch(() => '');
      const displayOk = display.includes('5.000.000') || display === '5000000';
      // try patch with KPI+BCC
      if (await kpi.isVisible().catch(() => false)) await kpi.fill('75');
      const patchWait = waitPackMutation(page, 'PATCH');
      await clickSave(h);
      const patchRes = await patchWait;
      await sleep(1000);
      const patchNet = bag.network.filter((n) => n.method === 'PATCH').slice(-1)[0];
      const bodyRates = patchNet?.body?.rateParams ?? patchNet?.body?.rate_params;
      const bccBody = bodyRates?.bcc_std ?? bodyRates?.bccStd;
      const plainNumber =
        typeof bccBody === 'number'
          ? bccBody === 5000000
          : bccBody == null
            ? null
            : Number(bccBody) === 5000000 && !String(bccBody).includes('.');

      bag.screens.push(await shot(page, `${mode}-06-bcc-patch`));

      if (patchRes && patchRes.status() >= 200 && patchRes.status() < 300 && plainNumber && displayOk) {
        ac('AC-PAY-STP-04-01', 'PASS', {
          summary: `display=${display} · PATCH ${patchRes.status()} bcc_std=${bccBody}`,
          mode,
          clickPath: [...bag.clickPath, 'BCC 5000000 → Lưu'],
          network: patchNet,
          feAfter2xx: `display ${display}`,
          f5: 'pending with 01-02',
        });
      } else {
        // also catch wrong prop onChange vs onValueChange
        if (bccBody == null && patchRes) {
          defect(
            'DEF-PAY-STP-BCC-WIRE',
            'PATCH succeeded but rateParams.bcc_std missing/wrong — check ViMoneyInput onChange vs onValueChange',
            'P0',
          );
        }
        ac('AC-PAY-STP-04-01', 'FAIL', {
          summary: `display=${display} displayOk=${displayOk} status=${patchRes?.status?.() ?? 'n/a'} bccBody=${bccBody} plain=${plainNumber}`,
          mode,
          network: patchNet ?? null,
        });
      }
    } else {
      ac('AC-PAY-STP-04-01', 'FAIL', {
        summary: 'BCC input not found (testid nor label)',
        mode,
      });
    }

    // --- AC-PAY-STP-01-02 edit KPI+BCC (if not already covered) ---
    listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
    h = listCtx?.host ?? h;
    // re-click row if form closed after save
    if (!(await h.getByTestId('pay-params-kpi-threshold').isVisible().catch(() => false))) {
      const rowAgain = h.getByText(PACK_CODE).first();
      if (await rowAgain.isVisible().catch(() => false)) await rowAgain.click({ force: true });
      else {
        const fb = h.locator('ul button').first();
        if (await fb.isVisible().catch(() => false)) await fb.click({ force: true });
      }
      await sleep(800);
    }
    if (await h.getByTestId('pay-params-kpi-threshold').isVisible().catch(() => false)) {
      await h.getByTestId('pay-params-kpi-threshold').fill('85');
      const bcc2 = (await h.getByTestId('pay-params-bcc-std').isVisible().catch(() => false))
        ? h.getByTestId('pay-params-bcc-std')
        : h.getByLabel(/BCC_STD/i);
      if (await bcc2.isVisible().catch(() => false)) await bcc2.fill('6000000');
      const patchWait2 = waitPackMutation(page, 'PATCH');
      await clickSave(h);
      const patch2 = await patchWait2;
      await sleep(1000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
      h = listCtx?.host ?? h;
      // reopen
      const rowF5 = h.getByText(PACK_CODE).first();
      if (await rowF5.isVisible().catch(() => false)) await rowF5.click({ force: true });
      else {
        const fb = h.locator('ul button').first();
        if (await fb.isVisible().catch(() => false)) await fb.click({ force: true });
      }
      await sleep(800);
      const kpiVal = await h.getByTestId('pay-params-kpi-threshold').inputValue().catch(() => '');
      const patchOk = patch2 && patch2.status() >= 200 && patch2.status() < 300;
      const kpiPersisted = kpiVal === '85' || kpiVal === '85.0';
      bag.screens.push(await shot(page, `${mode}-07-patch-f5`));
      if (patchOk && kpiPersisted) {
        ac('AC-PAY-STP-01-02', 'PASS', {
          summary: `PATCH ${patch2.status()} · KPI F5=${kpiVal}`,
          mode,
          clickPath: [...bag.clickPath, 'edit KPI+BCC → Lưu → F5'],
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
      ac('AC-PAY-STP-01-02', 'FAIL', {
        summary: 'Detail form / KPI field unavailable after create path',
        mode,
      });
    }

    // --- AC-PAY-STP-01-03 Archive ---
    listCtx = await findCtx(page, 'pay-policy-pack-list', 8000);
    h = listCtx?.host ?? h;
    if (!(await h.getByTestId('pay-policy-pack-archive').isVisible().catch(() => false))) {
      const rowA = h.getByText(PACK_CODE).first();
      if (await rowA.isVisible().catch(() => false)) await rowA.click({ force: true });
      else {
        const fb = h.locator('ul button').first();
        if (await fb.isVisible().catch(() => false)) await fb.click({ force: true });
      }
      await sleep(800);
    }
    const archBtn = h.getByTestId('pay-policy-pack-archive').first();
    if (await archBtn.isVisible().catch(() => false)) {
      const codeBefore = PACK_CODE;
      const archWait = page
        .waitForResponse(
          (res) => /pay-policy-packs\/.+\/archive/i.test(res.url()) && res.request().method() === 'POST',
          { timeout: 25000 },
        )
        .catch(() => null);
      await archBtn.click({ force: true });
      const archRes = await archWait;
      await sleep(1200);
      const hiddenAfter = !(await h.getByText(codeBefore).first().isVisible().catch(() => false));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      listCtx = await findCtx(page, 'pay-policy-pack-list', 12000);
      h = listCtx?.host ?? h;
      const hiddenF5 = !(await h.getByText(codeBefore).first().isVisible().catch(() => false));
      bag.screens.push(await shot(page, `${mode}-08-archive-f5`));
      const archOk = archRes && archRes.status() >= 200 && archRes.status() < 300;
      if (archOk && hiddenF5) {
        ac('AC-PAY-STP-01-03', 'PASS', {
          summary: `POST archive ${archRes.status()} · hidden default list · F5`,
          mode,
          clickPath: [...bag.clickPath, 'Ngưng / Archive → F5'],
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
      ac('AC-PAY-STP-01-03', 'FAIL', {
        summary: 'pay-policy-pack-archive not visible',
        mode,
      });
    }

    const fails = Object.entries(R.ac).filter(
      ([k, v]) => k !== `NAV-${mode}` && v.verdict === 'FAIL',
    );
    bag.verdict = fails.length ? 'FAIL' : 'PASS';
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

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });

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

  const required = [
    'AC-PAY-STP-01-01',
    'AC-PAY-STP-01-02',
    'AC-PAY-STP-01-03',
    'AC-PAY-STP-01-05',
    'AC-PAY-STP-03-01',
    'AC-PAY-STP-04-01',
  ];
  const fail = required.some((id) => R.ac[id]?.verdict !== 'PASS');
  const navOk = R.ac['NAV-portal']?.verdict === 'PASS' || R.ac['NAV-standalone']?.verdict === 'PASS';
  R.overall = !fail && navOk ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log('OVERALL', R.overall, R.ack_status);
  console.log('AC', JSON.stringify(R.ac, null, 2));
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
