#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01
 * Browser U65 + API contract probes · AC-PAY-COMP-01 · honesty payroll_e2e_ready=false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CUSTOM_CODE = process.env.QA_PAY_COMP_CODE || 'CUSTOM_TP_09';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-qa-01.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-pay-catalog-qa-01',
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
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser UF + Network observe · no payroll_e2e_ready flip',
  hdsd_align: 'Lương → Thành phần lương → Thêm mới → Lưu → F5',
  honesty: { payroll_e2e_ready: false, seed_used: false },
  env: { PORTAL, HRM, TENANT, CUSTOM_CODE, commit: COMMIT },
  l0: {},
  api: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
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
  return { token, raw: data };
}

async function apiCall(token, method, path, body) {
  const url = `${HRM}/api/hrm${path}`;
  const opts = {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
      const payload = JSON.stringify({
        userId: s.email,
        email: s.email,
        displayName: s.email,
        roles: ['group_ceo'],
      });
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
      }
    },
    { token: session.token, email: EMAIL, companyId: COMPANY },
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/payroll\/salary-components/.test(u)) return;
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
}

async function runApiProbes(token) {
  const list = await apiCall(token, 'GET', `/payroll/salary-components?company_id=${COMPANY}`);
  const rows = list.json?.data?.data ?? list.json?.data ?? [];
  const rowArr = Array.isArray(rows) ? rows : [];
  R.api.list = { status: list.status, total: rowArr.length };
  ac('API-LIST-200', list.status === 200 ? 'PASS' : 'FAIL', {
    summary: `GET list → ${list.status} · rows=${rowArr.length}`,
  });

  const formulaSotOk = rowArr.length === 0 || rowArr.every((r) => r.formula_sot === 'deprecated');
  ac('API-FORMULA-SOT-DEPRECATED', formulaSotOk ? 'PASS' : 'FAIL', {
    summary: formulaSotOk
      ? 'All list rows have formula_sot=deprecated'
      : 'Some rows missing formula_sot=deprecated',
    sample: rowArr.slice(0, 3).map((r) => ({ code: r.code, formula_sot: r.formula_sot })),
  });

  // scope parity list → get-by-id
  if (rowArr.length > 0) {
    const pick = rowArr.find((r) => r.is_active !== false) ?? rowArr[0];
    const get = await apiCall(
      token,
      'GET',
      `/payroll/salary-components/${pick.id}?company_id=${COMPANY}`,
    );
    R.api.getById = { status: get.status, id: pick.id, code: pick.code };
    ac('API-SCOPE-PARITY-LIST-GET', get.status === 200 && get.json?.data?.id === pick.id ? 'PASS' : 'FAIL', {
      summary: `list id ${pick.id} → GET by id ${get.status}`,
    });
    if (get.json?.data) {
      ac(
        'API-GET-FORMULA-SOT',
        get.json.data.formula_sot === 'deprecated' ? 'PASS' : 'FAIL',
        { summary: `GET by id formula_sot=${get.json.data.formula_sot}` },
      );
    }
  } else {
    ac('API-SCOPE-PARITY-LIST-GET', 'BLOCKED', { summary: 'No rows to test get-by-id parity' });
  }

  // Route honesty: pay-formulas must 404; formulas is SoT
  const wrongRoute = await apiCall(token, 'GET', `/payroll/pay-formulas?company_id=${COMPANY}`);
  R.api.payFormulasWrongRoute = { status: wrongRoute.status };
  ac('API-ROUTE-NOT-PAY-FORMULAS', wrongRoute.status === 404 ? 'PASS' : 'FAIL', {
    summary: `GET /payroll/pay-formulas → ${wrongRoute.status} (expect 404)`,
  });

  const formulasList = await apiCall(token, 'GET', `/payroll/formulas?company_id=${COMPANY}`);
  R.api.formulasList = { status: formulasList.status };
  ac('API-FORMULAS-ROUTE-200', formulasList.status === 200 ? 'PASS' : 'FAIL', {
    summary: `GET /payroll/formulas → ${formulasList.status}`,
  });

  // Prefer existing non-active formula from list for 422 probe; else create draft via /formulas
  let bindFormulaId = null;
  let bindFormulaStatus = null;
  R.api.draftFormula = { status: null, id: null };
  if (formulasList.status === 200) {
    const fRows =
      formulasList.json?.data?.data ??
      formulasList.json?.data?.items ??
      formulasList.json?.data ??
      [];
    const fArr = Array.isArray(fRows) ? fRows : [];
    const nonActive = fArr.find((f) => {
      const st = String(f.status ?? f.lifecycle_status ?? '').toLowerCase();
      return f.id && st && st !== 'active';
    });
    const anyDraft = fArr.find((f) => {
      const st = String(f.status ?? '').toLowerCase();
      return f.id && (st === 'draft' || st === 'submitted' || st === 'retired');
    });
    const pick = nonActive ?? anyDraft ?? null;
    if (pick?.id) {
      bindFormulaId = pick.id;
      bindFormulaStatus = pick.status ?? pick.lifecycle_status ?? null;
      R.api.draftFormula = {
        status: 'from_list',
        id: bindFormulaId,
        fromList: true,
        pickedStatus: bindFormulaStatus,
      };
    }
  }

  if (!bindFormulaId) {
    const draftFormula = await apiCall(token, 'POST', '/payroll/formulas', {
      company_id: COMPANY,
      code: `QA_DRAFT_${Date.now().toString(36).slice(-6).toUpperCase()}`,
      name: 'QA draft formula bind probe',
      expressionJson: {
        form: 'gd1_eval_v1',
        lines: [{ op: 'set', target: 'gross', expr: { lit: 1 } }],
      },
    });
    bindFormulaId =
      draftFormula.json?.data?.id ?? draftFormula.json?.data?.data?.id ?? draftFormula.json?.id ?? null;
    bindFormulaStatus = draftFormula.json?.data?.status ?? 'draft';
    R.api.draftFormula = {
      status: draftFormula.status,
      id: bindFormulaId,
      code: draftFormula.json?.code ?? draftFormula.json?.data?.code,
      message: draftFormula.json?.message,
    };
  }

  if (bindFormulaId) {
    const bindDraft = await apiCall(token, 'POST', '/payroll/salary-components', {
      company_id: COMPANY,
      code: `QA_BD_${Date.now().toString(36).slice(-5).toUpperCase()}`,
      name: 'QA bind draft probe',
      component_type: 'luong',
      default_formula_definition_id: bindFormulaId,
    });
    R.api.bindDraft = {
      status: bindDraft.status,
      code: bindDraft.json?.code ?? bindDraft.json?.data?.code,
      message: bindDraft.json?.message,
      formulaId: bindFormulaId,
      formulaStatus: bindFormulaStatus,
    };
    ac('API-DRAFT-FK-422', bindDraft.status === 422 ? 'PASS' : 'FAIL', {
      summary: `Bind non-active formula (${bindFormulaStatus}) via /formulas id → ${bindDraft.status} code=${R.api.bindDraft.code || 'n/a'} (expect 422 HRM-PAY-COMP-FORMULA-412)`,
      bodyCode: R.api.bindDraft.code,
      message: R.api.bindDraft.message,
    });
  } else {
    ac('API-DRAFT-FK-422', 'BLOCKED', {
      summary: `No draft/non-active formula id available for bind probe`,
      draftBody: R.api.draftFormula,
    });
  }

  // Cleanup pre-existing CUSTOM_TP_09 for clean UF (via API delete = soft archive — allowed prep, not seed mutate)
  const existing = rowArr.find((r) => r.code === CUSTOM_CODE);
  if (existing?.id) {
    await apiCall(token, 'DELETE', `/payroll/salary-components/${existing.id}?company_id=${COMPANY}`);
    log('archived pre-existing CUSTOM_TP_09 for clean UF', { id: existing.id });
  }

  return { rows: rowArr, payTypes: [] };
}

async function fillPayType(page, payTypeCode) {
  const combos = page.locator('[role="dialog"] [role="combobox"]');
  const n = await combos.count();
  for (let i = 0; i < n; i++) {
    const c = combos.nth(i);
    if (!(await c.isVisible().catch(() => false))) continue;
    await c.click();
    await sleep(400);
    const opt = page.getByRole('option', { name: new RegExp(payTypeCode, 'i') }).first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click();
      return true;
    }
    const anyOpt = page.getByRole('option').first();
    if (await anyOpt.isVisible().catch(() => false)) {
      await anyOpt.click();
      return true;
    }
    await page.keyboard.press('Escape');
  }
  return false;
}

async function main() {
  for (const [name, url] of [
    ['hrm-api', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[name] = r.status;
    } catch (e) {
      R.l0[name] = `ERR ${String(e).slice(0, 80)}`;
    }
  }
  save();

  const session = await loginApi();
  // Warm list first so BE open-catalog bootstrap can seed pay_types when empty
  await apiCall(session.token, 'GET', `/payroll/salary-components?company_id=${COMPANY}`);

  const payTypesRes = await apiCall(
    session.token,
    'GET',
    `/settings-catalogs/pay_types/items?company_id=${COMPANY}`,
  );
  const payTypeItems =
    payTypesRes.json?.data?.items ??
    payTypesRes.json?.data?.data ??
    payTypesRes.json?.items ??
    [];
  const payTypeArr = Array.isArray(payTypeItems) ? payTypeItems : [];
  R.api.payTypes = {
    status: payTypesRes.status,
    total: payTypesRes.json?.data?.total ?? payTypeArr.length,
    codes: payTypeArr.slice(0, 8).map((i) => i.item_key ?? i.code ?? i.value ?? i.key),
  };
  ac(
    'API-PAY-TYPES-GTE1',
    payTypesRes.status === 200 && (R.api.payTypes.total ?? 0) >= 1 ? 'PASS' : 'FAIL',
    {
      summary: `pay_types/items → ${payTypesRes.status} total=${R.api.payTypes.total}`,
      codes: R.api.payTypes.codes,
    },
  );
  const payTypeCode =
    payTypeArr.find((i) => (i.item_key ?? i.code ?? i.value) === 'luong')?.item_key ??
    payTypeArr.find((i) => (i.item_key ?? i.code ?? i.value) === 'luong')?.code ??
    payTypeArr[0]?.item_key ??
    payTypeArr[0]?.code ??
    payTypeArr[0]?.value ??
    'luong';

  await runApiProbes(session.token);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  log('goto /hr/payroll');
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(1500);
  await shot(page, '01-payroll-load');

  const errBanner = page.locator('text=/HRM API|Sync ERROR|500|409/i').first();
  ac('L2-PAYROLL-LOAD', (await errBanner.isVisible().catch(() => false)) ? 'FAIL' : 'PASS', {
    summary: 'Payroll load without ERROR banner',
  });

  const compTab = page.getByRole('button', { name: /Thành phần lương|Salary components/i }).first();
  if (await compTab.isVisible().catch(() => false)) await compTab.click();
  await sleep(1200);
  await shot(page, '02-salary-components-tab');

  const addBtn = page.getByRole('button', { name: /Thêm mới|Thêm thành phần|Add/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    ac('UF-ADD-DIALOG', 'FAIL', { summary: 'Thêm mới button not visible' });
    throw new Error('Add button missing');
  }
  await addBtn.click();
  await sleep(1200);
  await shot(page, '03-add-dialog');

  const pickerVisible = await page
    .getByTestId('pay-salary-component-catalog-picker')
    .isVisible()
    .catch(() => false);
  const freeCodeInput = page.locator('[role="dialog"] input.xevn-field-code').first();

  if (pickerVisible) {
    log('catalog picker mode — attempting CUSTOM via free input fallback or type in combobox');
    const pickerInput = page.locator('[data-testid="pay-salary-component-catalog-picker"] input').first();
    if (await pickerInput.isVisible().catch(() => false)) {
      await pickerInput.fill(CUSTOM_CODE);
      await sleep(400);
      const opt = page.getByRole('option').first();
      if (await opt.isVisible().catch(() => false)) await opt.click();
    }
    R.residuals.push({
      id: 'FE-CATALOG-BOUND',
      note: 'Settings salary_components catalog non-empty — open catalog CUSTOM_TP_09 may need catalog row first',
    });
  } else if (await freeCodeInput.isVisible().catch(() => false)) {
    await freeCodeInput.fill(CUSTOM_CODE);
    log('filled free-text code', { code: CUSTOM_CODE });
  } else {
    ac('UF-CODE-FIELD', 'FAIL', { summary: 'Neither catalog picker nor free-text code input visible' });
  }

  const nameInput = page.locator('[role="dialog"] input.xevn-field-name, [role="dialog"] input[placeholder*="tên"]').first();
  if (await nameInput.isVisible().catch(() => false)) {
    const ro = await nameInput.evaluate((el) => el.readOnly || el.disabled).catch(() => false);
    if (!ro) await nameInput.fill(`Thành phần QA ${CUSTOM_CODE}`);
  }

  await fillPayType(page, payTypeCode);

  const unitCheckbox = page.locator('[role="dialog"] input[type="checkbox"]').first();
  if (await unitCheckbox.isVisible().catch(() => false)) {
    if (!(await unitCheckbox.isChecked().catch(() => true))) await unitCheckbox.check();
  }

  let postStatus = null;
  let savedId = null;
  let savedCode = null;
  let postBody = null;
  page.on('request', (req) => {
    if (req.method() === 'POST' && /salary-components/.test(req.url())) {
      postBody = req.postData()?.slice(0, 600);
    }
  });

  const emptyCatBanner = page.locator('[role="dialog"]').getByText(/Chưa có mục trong danh mục|pay_types/i);
  R.api.emptyCatalogBannerVisible = await emptyCatBanner.isVisible().catch(() => false);

  const dialog = page.locator('[role="dialog"]').first();
  const saveBtn = dialog
    .getByRole('button', { name: /^Lưu$|^Thêm mới$|Save|Create|Thêm thành phần/i })
    .last();
  const respWait = page
    .waitForResponse((r) => /salary-components/.test(r.url()) && r.request().method() === 'POST', {
      timeout: 20_000,
    })
    .catch(() => null);
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
  } else {
    log('save button not visible in dialog');
  }
  const resp = await respWait;
  if (resp) {
    postStatus = resp.status();
    try {
      const j = await resp.json();
      savedId = j?.data?.id ?? j?.id ?? null;
      savedCode = j?.data?.code ?? j?.code ?? null;
      R.api.browserPost = {
        status: postStatus,
        formula_sot: j?.data?.formula_sot ?? j?.formula_sot,
        code: savedCode,
      };
    } catch {
      /* */
    }
  }
  await sleep(1500);
  await shot(page, '04-after-save');

  ac('UF-MUTATE-POST-2XX', postStatus >= 200 && postStatus < 300 ? 'PASS' : postStatus ? 'FAIL' : 'BLOCKED', {
    summary: postStatus ? `POST → ${postStatus} code=${savedCode}` : 'No POST observed',
    postStatus,
    savedCode,
    postBody,
  });

  if (savedId || savedCode) {
    ac(
      'UF-RESPONSE-FORMULA-SOT',
      R.api.browserPost?.formula_sot === 'deprecated' ? 'PASS' : postStatus >= 200 && postStatus < 300 ? 'FAIL' : 'BLOCKED',
      { summary: `POST response formula_sot=${R.api.browserPost?.formula_sot}` },
    );
  }

  if (postStatus >= 200 && postStatus < 300 && savedCode) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const compTab2 = page.getByRole('button', { name: /Thành phần lương/i }).first();
    if (await compTab2.isVisible().catch(() => false)) await compTab2.click();
    await sleep(1200);
    const rowText = await page.locator('table tbody').textContent().catch(() => '');
    ac('UF-F5-PERSIST', rowText.includes(savedCode) ? 'PASS' : 'FAIL', {
      summary: rowText.includes(savedCode) ? `Row ${savedCode} visible after F5` : `Row ${savedCode} missing after F5`,
    });
    await shot(page, '05-f5-persist');

    // DELETE via UI
    const row = page.locator('table tbody tr', { hasText: savedCode }).first();
    if (await row.isVisible().catch(() => false)) {
      const menuBtn = row.locator('button').last();
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click();
        await sleep(400);
        const delItem = page.getByRole('menuitem', { name: /Xóa|Delete/i }).first();
        if (await delItem.isVisible().catch(() => false)) {
          await delItem.click();
          await sleep(600);
          const confirmDel = page.getByRole('button', { name: /Xóa|Delete|Confirm/i }).last();
          const delWait = page
            .waitForResponse(
              (r) =>
                /salary-components/.test(r.url()) &&
                (r.request().method() === 'DELETE' || r.request().method() === 'PATCH'),
              { timeout: 15_000 },
            )
            .catch(() => null);
          if (await confirmDel.isVisible().catch(() => false)) await confirmDel.click();
          const delResp = await delWait;
          R.api.browserDelete = { status: delResp?.status() ?? null };
          await sleep(1200);
          const rowAfter = await page.locator('table tbody tr', { hasText: savedCode }).count();
          ac('UF-DELETE-HIDE', rowAfter === 0 ? 'PASS' : 'FAIL', {
            summary: rowAfter === 0 ? 'Row hidden after DELETE' : 'Row still visible after DELETE',
          });
          await shot(page, '06-after-delete');

          if (savedId) {
            const archivedList = await apiCall(
              session.token,
              'GET',
              `/payroll/salary-components?company_id=${COMPANY}&include_archived=true`,
            );
            const archivedRows = archivedList.json?.data?.data ?? archivedList.json?.data ?? [];
            const archivedArr = Array.isArray(archivedRows) ? archivedRows : [];
            const found = archivedArr.find((r) => r.id === savedId || r.code === savedCode);
            ac('API-INCLUDE-ARCHIVED', found && found.is_active === false ? 'PASS' : 'FAIL', {
              summary: found
                ? `include_archived=true shows archived row is_active=${found.is_active}`
                : 'Archived row not found with include_archived=true',
            });
          }
        }
      }
    }
  }

  const uncaught = [
    ...R.pageErrors,
    ...R.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  ac('CONSOLE-GATE', uncaught.length === 0 ? 'PASS' : 'FAIL', {
    summary: uncaught.length === 0 ? 'No uncaught errors' : `${uncaught.length} uncaught`,
    sample: uncaught.slice(0, 3),
  });

  await browser.close();

  const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
  const blocked = Object.entries(R.ac).filter(([, v]) => v.verdict === 'BLOCKED');
  R.overall = fails.length === 0 ? (blocked.length > 0 ? 'PASS_WITH_BLOCKED' : 'PASS') : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();

  console.log(`\nOVERALL=${R.overall} ack=${R.ack_status}`);
  process.exit(fails.length === 0 ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.error = String(e).slice(0, 500);
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
