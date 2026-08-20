#!/usr/bin/env node
/**
 * PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01 — Browser U65 gd1_eval_v1 author + Nest preview
 * Prior: FE-EVAL-01 READY_FOR_QA
 * Honesty: payroll_e2e_ready=false · cấm seed · cấm claim formula LIVE
 * Persona: ceo@xe.vn · company_id=main
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-qa-fe-eval-01',
);
mkdirSync(SCREEN, { recursive: true });

const STAMP = `PAYFEVAL-${Date.now().toString(36).slice(-8).toUpperCase()}`;
const CODE = `qa_feval_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40)}`;
const LABEL = `Công thức FE-EVAL browser ${STAMP}`;
const NOTE = `U65 FE-EVAL gd1_eval_v1 ${STAMP}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01',
  parent: 'PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01',
  prior: 'PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01 READY_FOR_QA',
  startedAt: ts(),
  stamp: STAMP,
  portal_url: PORTAL,
  journey_l25:
    'Formula author gd1_eval_v1 + Nest preview (overrides) — not full J-HRM-07 process UAT',
  u65: 'zero-seed · browser-only · FE after 2xx + F5',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, CODE, LABEL, commit: COMMIT },
  honesty: {
    payroll_e2e_ready: false,
    formula_live_claimed: false,
    seed_used: false,
    phase1_done_claimed: false,
    fe_net_engine: false,
    dnd_canvas: false,
  },
  denied: [
    'payroll_e2e_ready=true',
    'formula LIVE',
    'seed',
    'Phase1 DONE',
    'PASS from API/probe only',
    'DnD canvas',
    'FE net engine',
    'J-HRM-07 module UAT',
  ],
  hdsd_inventory: {
    required: [
      'payroll-tab-formulas',
      'pay-formula-author-panel',
      'pay-formula-honesty-badge',
      'pay-formula-eval-lines',
      'hdsd-pay-formula-code',
      'hdsd-pay-formula-label',
      'hdsd-pay-formula-note',
      'hdsd-pay-formula-expression',
      'hdsd-pay-formula-add-line',
      'hdsd-pay-formula-seed-lines',
      'hdsd-pay-formula-line-0',
      'pay-formula-preview-overrides',
      'hdsd-pay-formula-preview-var-base_salary',
      'hdsd-pay-formula-save',
      'hdsd-pay-formula-submit-publish',
      'hdsd-pay-formula-publish',
      'hdsd-pay-formula-preview',
      'pay-formula-list-table',
      'pay-formula-preview-result',
    ],
    seen: [],
    missing: [],
  },
  l0: {},
  ac: {},
  network: [],
  requestBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  process: {},
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || extra.summary || '');
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function processGate() {
  const dndStorm = results.consoleErrors.filter((t) =>
    /Unable to find drag handle|@hello-pangea\/dnd/i.test(t),
  );
  const uncaught = [
    ...results.pageErrors,
    ...results.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  results.process = {
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    dndStorm: dndStorm.length,
    uncaught: uncaught.length,
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0, dndStorm, uncaught };
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function extractExprForm(body) {
  if (!body || typeof body !== 'object') return null;
  const expr = body.expressionJson ?? body.expression_json ?? null;
  if (!expr || typeof expr !== 'object') return null;
  return {
    form: expr.form ?? null,
    dialect: expr.dialect ?? null,
    staged: expr.staged ?? null,
    lineCount: Array.isArray(expr.lines) ? expr.lines.length : 0,
    linesPreview: Array.isArray(expr.lines) ? expr.lines.slice(0, 4) : [],
  };
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/hrm\/payroll\/formulas/.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT'].includes(method)) return;
      const raw = req.postData();
      if (!raw) return;
      let body = null;
      try {
        body = JSON.parse(raw);
      } catch {
        body = { raw: String(raw).slice(0, 400) };
      }
      const exprMeta = extractExprForm(body);
      const entry = {
        method,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
        hasVariableOverrides: !!(body?.variableOverrides || body?.variable_overrides),
        variableOverrideKeys: Object.keys(body?.variableOverrides || body?.variable_overrides || {}),
        expressionMeta: exprMeta,
      };
      if (exprMeta) {
        entry.expression_json_form = exprMeta.form;
      }
      // keep payload slice for evidence (no secrets)
      if (exprMeta || entry.hasVariableOverrides) {
        entry.bodySlice = JSON.stringify({
          code: body?.code,
          label: body?.label,
          expressionJson: body?.expressionJson ?? body?.expression_json,
          requiredVarsJson: body?.requiredVarsJson ?? body?.required_vars_json,
          variableOverrides: body?.variableOverrides ?? body?.variable_overrides,
          company_id: body?.company_id,
        }).slice(0, 1200);
      }
      results.requestBodies.push(entry);
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/payroll\/formulas/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      try {
        const ct = res.headers()['content-type'] || '';
        if (/json/i.test(ct)) {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 200);
          if (j?.data?.id) entry.dataId = j.data.id;
          if (j?.data?.status) entry.dataStatus = j.data.status;
          if (j?.data?.code) entry.dataCode = j.data.code;
          if (Array.isArray(j?.data?.items)) entry.itemCount = j.data.items.length;
          if (Array.isArray(j?.data)) entry.itemCount = j.data.length;
          // preview compute body may be top-level data
          const d = j?.data ?? j;
          if (d && typeof d === 'object') {
            if (d.gross != null) entry.gross = d.gross;
            if (d.net != null) entry.net = d.net;
            if (d.deduction != null) entry.deduction = d.deduction;
            if (d.payroll_e2e_ready != null) entry.payroll_e2e_ready = d.payroll_e2e_ready;
            if (d.ready != null) entry.ready = d.ready;
            if (Array.isArray(d.lines)) entry.lineCount = d.lines.length;
          }
        }
      } catch {
        /* body already consumed / non-json */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function openFormulasTab(page) {
  await page.goto(q('/hr/payroll'), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2800);
  const tab = page.getByTestId('payroll-tab-formulas');
  const tabVisible = await tab.isVisible().catch(() => false);
  if (!tabVisible) {
    const byText = page.getByRole('button', { name: /Công thức lương/i });
    if (await byText.isVisible().catch(() => false)) {
      await byText.click();
    }
  } else {
    await tab.click();
  }
  await sleep(1500);
  const panel = page.getByTestId('pay-formula-author-panel');
  await panel.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null);
  return panel;
}

async function inventorySeen(page) {
  const seen = [];
  for (const id of results.hdsd_inventory.required) {
    // hidden expression marker still counts as present in DOM
    const loc = page.getByTestId(id);
    const count = await loc.count().catch(() => 0);
    if (count > 0) seen.push(id);
  }
  const amounts = await page.getByTestId('pay-formula-preview-amounts').count().catch(() => 0);
  if (amounts > 0) seen.push('pay-formula-preview-amounts');
  const line1 = await page.getByTestId('hdsd-pay-formula-line-1').count().catch(() => 0);
  if (line1 > 0) seen.push('hdsd-pay-formula-line-1');
  results.hdsd_inventory.seen = [...new Set(seen)];
  results.hdsd_inventory.missing = results.hdsd_inventory.required.filter(
    (id) => !results.hdsd_inventory.seen.includes(id),
  );
}

async function toastText(page) {
  const loc = page.locator('[data-sonner-toast], [role="status"], li[data-state="open"]').first();
  const t = ((await loc.innerText().catch(() => '')) || '').trim();
  if (t) return t;
  const alt = page.locator('[data-radix-collection-item], .destructive, [class*="toast"]').last();
  return ((await alt.innerText().catch(() => '')) || '').trim();
}

async function selectOption(page, triggerTestId, optionName) {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click();
  await sleep(250);
  const opt = page.getByRole('option', { name: optionName });
  await opt.waitFor({ state: 'visible', timeout: 8000 });
  await opt.click();
  await sleep(200);
}

async function authorEvalLines(page) {
  // Line 0 should already be BASE / var / base_salary from emptyForm
  const line0 = page.getByTestId('hdsd-pay-formula-line-0');
  await line0.waitFor({ state: 'visible', timeout: 15000 });
  const code0 = page.getByTestId('hdsd-pay-formula-line-code-0');
  const var0 = page.getByTestId('hdsd-pay-formula-line-var-0');
  // Normalize line 0
  await code0.fill('BASE');
  if (await var0.isVisible().catch(() => false)) {
    await var0.fill('base_salary');
  }

  // Add deduction expr line
  await page.getByTestId('hdsd-pay-formula-add-line').click();
  await sleep(400);
  await page.getByTestId('hdsd-pay-formula-line-code-1').fill('DED_TAX');
  await selectOption(page, 'hdsd-pay-formula-line-sign-1', /Khấu trừ/i);
  await selectOption(page, 'hdsd-pay-formula-line-source-1', /Biểu thức/i);
  await selectOption(page, 'hdsd-pay-formula-line-op-1', /Nhân/i);
  await page.getByTestId('hdsd-pay-formula-line-left-1').fill('base_salary');
  await page.getByTestId('hdsd-pay-formula-line-right-1').fill('0.1');

  const exprMarker = await page.getByTestId('hdsd-pay-formula-expression').getAttribute('value');
  return {
    line0Visible: await line0.isVisible().catch(() => false),
    line1Visible: await page.getByTestId('hdsd-pay-formula-line-1').isVisible().catch(() => false),
    expressionMarker: exprMarker,
  };
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      results.l0[k] = { ok: false, error: String(e).slice(0, 120) };
    }
  }
  try {
    const r = await fetch(`${HRM}/api/hrm/payroll/formulas?company_id=${COMPANY}`);
    results.l0.formulas_probe = {
      status: r.status,
      ok: r.status === 401 || r.status === 200,
      note: r.status === 404 ? 'STALE_DIST' : 'route_present',
    };
  } catch (e) {
    results.l0.formulas_probe = { ok: false, error: String(e).slice(0, 120) };
  }
  save();

  if (!results.l0.portal?.ok || !results.l0.hrm?.ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'L0', owner: 'devops', note: 'stack down' });
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }
  if (!results.l0.formulas_probe?.ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({
      id: 'R-PAY-F-STALE-DIST',
      owner: 'dev-be',
      note: `formulas probe HTTP ${results.l0.formulas_probe?.status}`,
    });
    results.endedAt = ts();
    save();
    console.error('formulas route missing', results.l0.formulas_probe);
    process.exit(2);
  }

  const session = await loginApi();
  log('login_api_ok');

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // --- AC1: Tab + honesty ---
    const panel = await openFormulasTab(page);
    const panelVisible = await panel.isVisible().catch(() => false);
    const badge = page.getByTestId('pay-formula-honesty-badge');
    const badgeText = ((await badge.innerText().catch(() => '')) || '').trim();
    const honestyOk = /payroll_e2e_ready\s*=\s*false/i.test(badgeText);
    const evalLines = await page.getByTestId('pay-formula-eval-lines').isVisible().catch(() => false);
    await shot(page, '01-formulas-tab');
    log('open_formulas_tab', { panelVisible, badgeText: badgeText.slice(0, 120), evalLines });

    recordAc('AC1_TAB_EVAL_UI', panelVisible && honestyOk && evalLines ? 'PASS' : 'FAIL', {
      summary:
        panelVisible && honestyOk && evalLines
          ? 'Payroll → Công thức lương → author panel + eval lines + honesty=false'
          : `FAIL panel=${panelVisible} honestyOk=${honestyOk} evalLines=${evalLines}`,
      url: page.url(),
      honestyBadge: badgeText.slice(0, 180),
      honestyOk,
      evalLines,
      click_path:
        'login → /hr/payroll → payroll-tab-formulas → pay-formula-author-panel → pay-formula-eval-lines',
    });
    if (!(panelVisible && honestyOk && evalLines)) {
      results.residuals.push({ id: 'AC1', owner: 'dev-fe', note: 'eval UI / honesty missing' });
      throw new Error('panel/eval/honesty missing');
    }

    // --- Fill header + author lines ---
    await page.getByTestId('hdsd-pay-formula-code').fill(CODE);
    await page.getByTestId('hdsd-pay-formula-label').fill(LABEL);
    const note = page.getByTestId('hdsd-pay-formula-note');
    if (await note.isVisible().catch(() => false)) await note.fill(NOTE);

    const authored = await authorEvalLines(page);
    await shot(page, '02-lines-authored');
    log('lines_authored', authored);

    recordAc('AC2_AUTHOR_LINES', authored.line0Visible && authored.line1Visible ? 'PASS' : 'FAIL', {
      summary:
        authored.line0Visible && authored.line1Visible
          ? 'Author lines: BASE var base_salary + DED_TAX expr mul base_salary*0.1'
          : `FAIL line0=${authored.line0Visible} line1=${authored.line1Visible}`,
      authored,
    });
    if (!(authored.line0Visible && authored.line1Visible)) {
      results.residuals.push({ id: 'AC2', owner: 'dev-fe', note: 'line author UI incomplete' });
    }

    // Ensure preview override for base_salary
    const ovBase = page.getByTestId('hdsd-pay-formula-preview-var-base_salary');
    if (await ovBase.isVisible().catch(() => false)) {
      await ovBase.fill('8000000');
    }
    const ovHours = page.getByTestId('hdsd-pay-formula-preview-var-payable_hours');
    if (await ovHours.isVisible().catch(() => false)) {
      await ovHours.fill('176');
    }

    // --- AC3: Save draft → expressionJson.form=gd1_eval_v1 ---
    const saveBtn = page.getByTestId('hdsd-pay-formula-save');
    const postWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/formulas\/?(\?|$)/.test(res.url()) &&
        res.request().method() === 'POST' &&
        !/submit-publish|publish|preview|withdraw|retire|versions/.test(res.url()),
      { timeout: 45000 },
    );
    await saveBtn.click();
    const postRes = await postWait.catch(() => null);
    await sleep(1800);
    await shot(page, '03-after-save');

    const postStatus = postRes?.status?.() ?? null;
    const postOk = postStatus != null && postStatus >= 200 && postStatus < 300;
    let postBody = null;
    try {
      postBody = postRes ? await postRes.json() : null;
    } catch {
      /* */
    }
    const postCode =
      postBody?.code ||
      results.network.find((n) => n.method === 'POST' && n.status === postStatus)?.code;

    const saveReq = [...results.requestBodies]
      .reverse()
      .find(
        (r) =>
          r.method === 'POST' &&
          /\/payroll\/formulas\/?(\?|$)/.test(r.url) &&
          !/submit-publish|publish|preview|withdraw|retire|versions/.test(r.url),
      );
    const formOk = saveReq?.expression_json_form === 'gd1_eval_v1';
    const lineCountOk = (saveReq?.expressionMeta?.lineCount ?? 0) >= 1;

    const rowSel = page.getByTestId(`pay-formula-row-${CODE}-v1`);
    let rowVisibleAfterSave = await rowSel.isVisible().catch(() => false);
    if (!rowVisibleAfterSave) {
      const tableText =
        (await page.getByTestId('pay-formula-list-table').innerText().catch(() => '')) || '';
      rowVisibleAfterSave = tableText.includes(CODE) || tableText.includes(LABEL);
    }
    const rowTextAfterSave = rowVisibleAfterSave
      ? (
          (await rowSel.innerText().catch(() => '')) ||
          (await page.getByTestId('pay-formula-list-table').innerText().catch(() => '')) ||
          ''
        ).trim()
      : '';

    recordAc(
      'AC3_SAVE_GD1_EVAL_V1',
      postOk && formOk && lineCountOk && rowVisibleAfterSave ? 'PASS' : 'FAIL',
      {
        summary:
          postOk && formOk && rowVisibleAfterSave
            ? `POST ${postStatus} expressionJson.form=gd1_eval_v1 lines=${saveReq?.expressionMeta?.lineCount} → FE row`
            : `FAIL postOk=${postOk} formOk=${formOk} lines=${saveReq?.expressionMeta?.lineCount} feRow=${rowVisibleAfterSave}`,
        postStatus,
        postCode: postCode || null,
        expression_json_form: saveReq?.expression_json_form || null,
        expressionMeta: saveReq?.expressionMeta || null,
        requestBodySlice: saveReq?.bodySlice || null,
        feAfter2xx: {
          visible: rowVisibleAfterSave,
          hasLabel: rowTextAfterSave.includes(LABEL),
          hasCode: rowTextAfterSave.includes(CODE),
          text: rowTextAfterSave.slice(0, 240),
        },
      },
    );
    if (!(postOk && formOk && rowVisibleAfterSave)) {
      results.residuals.push({
        id: 'AC3',
        owner: !postOk ? 'dev-be' : 'dev-fe',
        note: `save gd1_eval_v1 incomplete HTTP ${postStatus} form=${saveReq?.expression_json_form}`,
      });
    }

    // --- AC4: F5 → hydrate lines ---
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2800);
    const tab2 = page.getByTestId('payroll-tab-formulas');
    if (await tab2.isVisible().catch(() => false)) {
      await tab2.click();
      await sleep(1500);
    }
    await page
      .getByTestId('pay-formula-author-panel')
      .waitFor({ state: 'visible', timeout: 30000 })
      .catch(() => null);
    await sleep(1200);
    await shot(page, '04-after-f5');

    const rowAfterF5 = page.getByTestId(`pay-formula-row-${CODE}-v1`);
    let rowVisibleF5 = await rowAfterF5.isVisible().catch(() => false);
    let rowTextF5 = '';
    if (rowVisibleF5) {
      rowTextF5 = ((await rowAfterF5.innerText().catch(() => '')) || '').trim();
    } else {
      const tableText =
        (await page.getByTestId('pay-formula-list-table').innerText().catch(() => '')) || '';
      rowVisibleF5 = tableText.includes(CODE) || tableText.includes(LABEL);
      rowTextF5 = tableText;
    }

    if (await rowAfterF5.isVisible().catch(() => false)) {
      await rowAfterF5.click();
      await sleep(1000);
    } else {
      const search = page.getByTestId('hdsd-pay-formula-search');
      if (await search.isVisible().catch(() => false)) {
        await search.fill(CODE);
        await sleep(600);
      }
      const anyRow = page.locator(`[data-testid^="pay-formula-row-${CODE}"]`).first();
      if (await anyRow.isVisible().catch(() => false)) {
        await anyRow.click();
        await sleep(1000);
      }
    }
    await shot(page, '05-row-selected-hydrate');

    const hydrateLine0 = await page.getByTestId('hdsd-pay-formula-line-0').isVisible().catch(() => false);
    const hydrateCode0 = ((await page.getByTestId('hdsd-pay-formula-line-code-0').inputValue().catch(() => '')) || '').trim();
    const hydrateVar0 = ((await page.getByTestId('hdsd-pay-formula-line-var-0').inputValue().catch(() => '')) || '').trim();
    const hydrateLine1 = await page.getByTestId('hdsd-pay-formula-line-1').isVisible().catch(() => false);
    const hydrateCode1 = ((await page.getByTestId('hdsd-pay-formula-line-code-1').inputValue().catch(() => '')) || '').trim();
    const exprMarkerVal = await page.getByTestId('hdsd-pay-formula-expression').getAttribute('value');

    const hydrateOk =
      rowVisibleF5 &&
      hydrateLine0 &&
      /BASE/i.test(hydrateCode0) &&
      hydrateVar0 === 'base_salary' &&
      exprMarkerVal === 'gd1_eval_v1';

    recordAc('AC4_F5_HYDRATE', hydrateOk ? 'PASS' : 'FAIL', {
      summary: hydrateOk
        ? `F5 → row còn · hydrate BASE/base_salary · marker gd1_eval_v1 · line1=${hydrateLine1}`
        : `FAIL f5=${rowVisibleF5} line0=${hydrateLine0} code0=${hydrateCode0} var0=${hydrateVar0} marker=${exprMarkerVal}`,
      feAfterF5: {
        visible: rowVisibleF5,
        hasLabel: rowTextF5.includes(LABEL),
        hasCode: rowTextF5.includes(CODE),
        text: rowTextF5.slice(0, 280),
      },
      hydrate: {
        line0: hydrateLine0,
        code0: hydrateCode0,
        var0: hydrateVar0,
        line1: hydrateLine1,
        code1: hydrateCode1,
        expressionMarker: exprMarkerVal,
      },
    });
    if (!hydrateOk) {
      results.residuals.push({ id: 'AC4', owner: 'dev-fe', note: 'F5 hydrate incomplete' });
    }

    // Re-ensure overrides after hydrate
    if (await ovBase.isVisible().catch(() => false)) {
      await page.getByTestId('hdsd-pay-formula-preview-var-base_salary').fill('8000000');
    }
    if (await page.getByTestId('hdsd-pay-formula-preview-var-payable_hours').isVisible().catch(() => false)) {
      await page.getByTestId('hdsd-pay-formula-preview-var-payable_hours').fill('176');
    }

    // --- AC5: Preview Nest with overrides ---
    const previewBtn = page.getByTestId('hdsd-pay-formula-preview');
    const previewWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/formulas\/.+\/preview/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45000 },
    );
    await previewBtn.click();
    const previewRes = await previewWait.catch(() => null);
    await sleep(1800);
    await shot(page, '06-preview');

    const previewStatus = previewRes?.status?.() ?? null;
    let previewBody = null;
    try {
      previewBody = previewRes ? await previewRes.json() : null;
    } catch {
      /* */
    }
    const previewReq = [...results.requestBodies]
      .reverse()
      .find((r) => /\/preview/.test(r.url) && r.method === 'POST');
    const overridesSent =
      previewReq?.hasVariableOverrides === true &&
      (previewReq.variableOverrideKeys || []).includes('base_salary');

    const previewNet = results.network.find(
      (n) => /preview/.test(n.url) && n.method === 'POST' && n.status === previewStatus,
    );
    const data = previewBody?.data ?? previewBody ?? {};
    const readyFlag =
      data?.payroll_e2e_ready === true ||
      data?.ready === true ||
      previewNet?.payroll_e2e_ready === true;

    const previewBox = page.getByTestId('pay-formula-preview-result');
    const previewVisible = await previewBox.isVisible().catch(() => false);
    const previewText = previewVisible
      ? ((await previewBox.innerText().catch(() => '')) || '').trim()
      : '';
    const amountsBox = page.getByTestId('pay-formula-preview-amounts');
    const amountsVisible = await amountsBox.isVisible().catch(() => false);
    const amountsText = amountsVisible
      ? ((await amountsBox.innerText().catch(() => '')) || '').trim()
      : '';

    const computeOk =
      previewStatus != null &&
      previewStatus >= 200 &&
      previewStatus < 300 &&
      previewVisible &&
      (/OK-COMPUTE/i.test(previewText) || amountsVisible) &&
      readyFlag !== true &&
      /payroll_e2e_ready=false|ready=false|không phải LIVE|staged/i.test(
        `${previewText}\n${amountsText}`,
      );

    const honest412 =
      previewStatus === 412 &&
      previewVisible &&
      (/412-PREVIEW-STUB|412-VARS|412-NOT-EVALUABLE|HRM-PAY-FORMULA-412/i.test(previewText) ||
        /HRM-PAY-FORMULA-412-PREVIEW-STUB|HRM-PAY-FORMULA-412-VARS|HRM-PAY-FORMULA-412-NOT-EVALUABLE/.test(
          String(previewBody?.code || previewNet?.code || ''),
        ));

    const previewPass = (computeOk || honest412) && overridesSent;

    recordAc('AC5_PREVIEW_NEST', previewPass ? 'PASS' : 'FAIL', {
      summary: previewPass
        ? computeOk
          ? `Preview HTTP ${previewStatus} OK-COMPUTE staged (ready≠true) with variableOverrides`
          : `Preview HTTP 412 honest (${previewBody?.code || previewNet?.code || '412'}) with overrides`
        : `FAIL status=${previewStatus} computeOk=${computeOk} honest412=${honest412} overridesSent=${overridesSent}`,
      previewStatus,
      previewCode: previewBody?.code || previewNet?.code || null,
      overridesSent,
      overrideKeys: previewReq?.variableOverrideKeys || [],
      requestBodySlice: previewReq?.bodySlice || null,
      gross: data?.gross ?? previewNet?.gross ?? null,
      net: data?.net ?? previewNet?.net ?? null,
      deduction: data?.deduction ?? previewNet?.deduction ?? null,
      payroll_e2e_ready: data?.payroll_e2e_ready ?? previewNet?.payroll_e2e_ready ?? null,
      readyFlag,
      previewText: previewText.slice(0, 420),
      amountsText: amountsText.slice(0, 280),
      path: computeOk ? 'OK-COMPUTE' : honest412 ? 'HONEST-412' : 'FAIL',
    });
    if (!previewPass) {
      results.residuals.push({
        id: 'AC5',
        owner: previewStatus == null ? 'dev-fe' : previewStatus >= 500 ? 'dev-be' : 'dev-fe',
        note: `preview path not honest HTTP ${previewStatus}`,
      });
    }

    // --- AC6: Dual-control self-publish 403 ---
    const submitBtn = page.getByTestId('hdsd-pay-formula-submit-publish');
    const submitWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/formulas\/.+\/submit-publish/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45000 },
    );
    await submitBtn.click();
    const submitRes = await submitWait.catch(() => null);
    await sleep(1500);
    await shot(page, '07-after-submit');

    const submitStatus = submitRes?.status?.() ?? null;
    const submitOk = submitStatus != null && submitStatus >= 200 && submitStatus < 300;

    const publishBtn = page.getByTestId('hdsd-pay-formula-publish');
    const publishWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/formulas\/.+\/publish/.test(res.url()) &&
        !/submit-publish|withdraw/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45000 },
    );
    await publishBtn.click();
    const publishRes = await publishWait.catch(() => null);
    await sleep(1800);
    await shot(page, '08-self-publish-403');

    const publishStatus = publishRes?.status?.() ?? null;
    let publishBody = null;
    try {
      publishBody = publishRes ? await publishRes.json() : null;
    } catch {
      /* */
    }
    const dualCode =
      publishBody?.code === 'HRM-PAY-FORMULA-403-DUAL' ||
      results.network.some(
        (n) =>
          /\/publish/.test(n.url) &&
          !/submit-publish/.test(n.url) &&
          (n.code === 'HRM-PAY-FORMULA-403-DUAL' || n.status === 403),
      );
    const toastDual = await toastText(page);
    const dualToast =
      /403-DUAL|dual-control|Bị chặn dual-control|người soạn khác người phát hành/i.test(
        toastDual,
      ) ||
      /403-DUAL|dual-control|Bị chặn dual-control/i.test(
        ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 8000),
      );
    const notSilentSuccess =
      publishStatus === 403 || (publishStatus != null && publishStatus >= 400);
    const dualPass = submitOk && notSilentSuccess && dualCode && (dualToast || publishStatus === 403);

    recordAc('AC6_DUAL_CONTROL_403', dualPass ? 'PASS' : 'FAIL', {
      summary: dualPass
        ? `submit ${submitStatus} → self-publish HTTP ${publishStatus} 403-DUAL retained`
        : `FAIL submit=${submitStatus} publish=${publishStatus} dualCode=${dualCode}`,
      submitStatus,
      publishStatus,
      publishCode: publishBody?.code || null,
      toastSnippet: toastDual.slice(0, 200),
      dualToast,
    });
    if (!dualPass) {
      results.residuals.push({
        id: 'AC6',
        owner:
          publishStatus != null && publishStatus >= 200 && publishStatus < 300
            ? 'dev-be'
            : 'dev-fe',
        note: `dual-control broken HTTP ${publishStatus}`,
      });
    }

    // --- AC7: HDSD + no DnD + honesty lock ---
    await inventorySeen(page);
    const dndSurface = await page
      .locator('[data-rbd-droppable-id], [data-rbd-draggable-id]')
      .count()
      .catch(() => 0);
    const honestyStill =
      honestyOk ||
      /payroll_e2e_ready\s*=\s*false/i.test(
        ((await badge.innerText().catch(() => '')) || '').trim(),
      );
    const ac7Pass =
      dndSurface === 0 && honestyStill && results.hdsd_inventory.missing.length === 0;

    recordAc('AC7_HDSD_NO_DND_HONESTY', ac7Pass ? 'PASS' : 'FAIL', {
      summary: ac7Pass
        ? 'HDSD inventory complete · no DnD · payroll_e2e_ready=false'
        : `FAIL dnd=${dndSurface} honesty=${honestyStill} missing=${results.hdsd_inventory.missing.join(',')}`,
      dndSurface,
      honestyBadge: badgeText.slice(0, 180),
      hdsd_seen: results.hdsd_inventory.seen,
      hdsd_missing: results.hdsd_inventory.missing,
    });
    if (!ac7Pass) {
      results.residuals.push({
        id: 'AC7',
        owner: 'dev-fe',
        note: `hdsd/dnd/honesty gap missing=${results.hdsd_inventory.missing.join(',')}`,
      });
    }

    const gate = processGate();
    if (gate.fail) {
      results.residuals.push({
        id: 'PROCESS_CONSOLE',
        owner: 'dev-fe',
        note: `dndStorm=${gate.dndStorm.length} uncaught=${gate.uncaught.length}`,
      });
    }

    const acIds = Object.keys(results.ac);
    const allPass =
      acIds.length > 0 && acIds.every((k) => results.ac[k].verdict === 'PASS') && !gate.fail;

    results.overall = allPass ? 'PASS' : 'FAIL';
    results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    save();

    console.log('\n=== SUMMARY ===');
    console.log(
      JSON.stringify(
        {
          overall: results.overall,
          stamp: STAMP,
          ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
          residuals: results.residuals,
          previewPath: results.ac.AC5_PREVIEW_NEST?.path,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    results.overall = results.overall || 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'HARNESS', owner: 'qa', note: String(e).slice(0, 300) });
    results.endedAt = ts();
    save();
    console.error('HARNESS ERROR', e);
  } finally {
    await browser.close().catch(() => {});
  }

  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
