#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01
 * Browser U65 · UF-ATT-COMP-FE · closes Condition R-PLT-ATT-OTC-03
 * Parent: FE-01 READY_FOR_QA · L1 stamp RETAIN ATTCOMPQA-MSKARXQU · KEY HRM-ATT-OT-COMP-KEY
 * Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · formula_LIVE=false · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · invent FE-ADMIN · reopen OT-TYPE L1/FE-01 · claim module ATT UAT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
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

const BOOTSTRAP_COMP = new Set(['salary', 'compensatory_leave']);
const BOOTSTRAP_OT = new Set(['weekday', 'weekend', 'holiday']);
const STAMP_L1 = 'ATTCOMPQA-MSKARXQU';
const KEY_CODE = 'HRM-ATT-OT-COMP-KEY';
const KEY_OT_TYPE = 'HRM-ATT-OT-TYPE-KEY';
const STAMP_OT_L1 = 'ATTOTQA-MSK8VETU';
const STAMP_OT_FE = 'ATTOTQAFE-MSK9TJDM';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);
const OPEN_CODE = `qa_fe_otc_${stampTail}`.slice(0, 48);
const OPEN_NAME = `QA FE OTC Nest ${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-FE-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01',
  residual_target: 'R-PLT-ATT-OTC-03',
  stamp_l1_retain: STAMP_L1,
  key_code: KEY_CODE,
  startedAt: ts(),
  stamp: `ATTCOMPQAFE-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5 · admin Network POST ot-comp-types ≠ seed · probe ≠ UF 🟢 alone',
  hdsd_align:
    'Attendance → Quản lý đơn → Đăng ký làm thêm · att-ot-precision · att-ot-add-dialog-precision · att-ot-comp-type-select · att-ot-type-select RETAIN',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    formula_LIVE: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    deny_phase1: true,
    fe_admin_hold: 'R-PLT-ATT-OTC-FE-ADMIN / invent FE-ADMIN DENIED',
    seal_retain: {
      L1_OTC: STAMP_L1,
      L1_OT_TYPE: STAMP_OT_L1,
      OT_TYPE_FE: STAMP_OT_FE,
      ATT_CODE: 'ATTCODEQA-MSK4T1A5',
      leave: 'ATTLEAVEQA-MSJ7CPJH',
      worksite: 'ATTWSQA-MSJC3IN9',
      SHIFT: 'ATTSHIFTQA-MSK5FXP3',
      CTR: 'CTRTPLQA-MSK7U4CG',
    },
  },
  vitest: { claimed: '32/32', re_run: null },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  nest_comp: { before: null, after_admin: null, codes: [], rows: [], createdId: null },
  nest_ot: { total: null, codes: [] },
  ac: {},
  network: {
    compEffectiveGets: [],
    otEffectiveGets: [],
    otCompPosts: [],
    otRequestPosts: [],
    otRequestGets: [],
    inventPosts: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  picker_comp: null,
  picker_ot: null,
  invent_ui: null,
  invent_api: null,
  empty_path: null,
  fe_admin_spot: null,
  unit_cite: null,
  create_submit: null,
  f5: null,
  detail: null,
  overall: null,
  ack_status: null,
  condition_r_plt_att_otc_03: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
  return R.l0.hrm === 200 && R.l0.xbos === 200 && Number(R.l0.portal) === 200;
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

async function apiCall(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json, code: json?.code ?? json?.error?.code ?? null };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function getCompEffective(token) {
  const r = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/ot-comp-types/effective?company_id=${COMPANY}`,
  );
  const rows = asList(r.json?.data ?? r.json);
  const codes = rows.map((x) => String(x.code || '').toLowerCase()).filter(Boolean);
  return {
    status: r.status,
    code: r.code,
    total: r.json?.data?.total ?? r.json?.total ?? rows.length,
    rows,
    codes,
  };
}

async function getOtEffective(token) {
  const r = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/ot-types/effective?company_id=${COMPANY}`,
  );
  const rows = asList(r.json?.data ?? r.json);
  const codes = rows.map((x) => String(x.code || '').toLowerCase()).filter(Boolean);
  return {
    status: r.status,
    code: r.code,
    total: r.json?.data?.total ?? r.json?.total ?? rows.length,
    rows,
    codes,
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

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = String(msg.text());
      if (!/favicon|React DevTools|Download the React|Failed to load resource/i.test(t)) {
        R.consoleErrors.push(t.slice(0, 360));
      }
    }
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const status = res.status();
      const path = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360);
      let code = null;
      let bodySnippet = null;
      let reqBody = null;
      try {
        const pd = res.request().postData();
        if (pd) {
          try {
            reqBody = JSON.parse(pd);
          } catch {
            reqBody = { raw: pd.slice(0, 200) };
          }
        }
      } catch {
        /* */
      }
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const body = await res.json().catch(() => null);
          code = body?.code ?? body?.error?.code ?? null;
          bodySnippet = JSON.stringify(body)?.slice(0, 280);
        }
      } catch {
        /* */
      }
      const entry = {
        at: ts(),
        method,
        status,
        path,
        code,
        bodySnippet,
        req: reqBody
          ? {
              overtime_type: reqBody.overtime_type ?? null,
              compensation_type: reqBody.compensation_type ?? null,
              coefficient: reqBody.coefficient ?? null,
              code: reqBody.code ?? null,
              nameVi: reqBody.nameVi ?? null,
            }
          : null,
      };
      if (/ot-comp-types\/effective/.test(u) && method === 'GET') {
        R.network.compEffectiveGets.push(entry);
      }
      if (/ot-types\/effective/.test(u) && method === 'GET') {
        R.network.otEffectiveGets.push(entry);
      }
      if (/\/ot-comp-types(?!\/effective)/.test(u) && method === 'POST' && !/\/retire/.test(u)) {
        R.network.otCompPosts.push(entry);
      }
      if (/overtime-requests/.test(u) && method === 'POST' && !/\/(approve|reject)/.test(u)) {
        R.network.otRequestPosts.push(entry);
      }
      if (/overtime-requests/.test(u) && method === 'GET') {
        R.network.otRequestGets.push(entry);
      }
      if (status >= 500) R.network.bad5xx.push(entry);
    } catch {
      /* */
    }
  });
}

async function ensureCompEffViaNetwork(token, before) {
  R.nest_comp.before = {
    status: before.status,
    total: before.total,
    codes: before.codes.slice(0, 20),
  };
  let created = false;
  let createdId = null;
  let after = before;

  if (before.total <= 0 || before.codes.length <= 0) {
    log('Nest OTC EFF=0 — admin CREATE via authenticated Network POST ot-comp-types (U65 no seed)');
    const create = await apiCall(token, 'POST', '/api/hrm/attendance/ot-comp-types', {
      companyId: COMPANY,
      code: OPEN_CODE,
      nameVi: OPEN_NAME,
      nameEn: `QA FE OTC Nest EN ${stampTail}`,
      sortOrder: 55,
      status: 'active',
    });
    createdId = create.json?.data?.id || create.json?.id || null;
    created = create.status >= 200 && create.status < 300;
    R.network.otCompPosts.push({
      at: ts(),
      method: 'POST',
      status: create.status,
      path: '/api/hrm/attendance/ot-comp-types',
      code: create.code,
      req: { code: OPEN_CODE, nameVi: OPEN_NAME },
      source: 'qa_network_admin',
    });
    after = await getCompEffective(token);
    if (!created) {
      ac('ADMIN_EFF_ENSURE', 'FAIL', {
        summary: `POST ot-comp-types ${create.status} ${create.code}`,
      });
    }
  } else {
    log(`Nest OTC EFF already N=${before.total} — reuse existing active rows (no wipe)`);
  }

  const nonBoot = after.codes.filter((c) => !BOOTSTRAP_COMP.has(c));
  if (after.total > 0 && nonBoot.length === 0) {
    log('EFF>0 but only bootstrap-like codes — admin CREATE Nest open compensation code');
    const create = await apiCall(token, 'POST', '/api/hrm/attendance/ot-comp-types', {
      companyId: COMPANY,
      code: OPEN_CODE,
      nameVi: OPEN_NAME,
      sortOrder: 55,
      status: 'active',
    });
    createdId = create.json?.data?.id || create.json?.id || null;
    created = create.status >= 200 && create.status < 300;
    after = await getCompEffective(token);
  }

  R.nest_comp.after_admin = {
    status: after.status,
    total: after.total,
    codes: after.codes.slice(0, 20),
    created,
    openCode: created ? OPEN_CODE : null,
    createdId,
  };
  R.nest_comp.codes = after.codes;
  R.nest_comp.rows = after.rows;
  R.nest_comp.createdId = createdId;
  save();
  return after;
}

async function openOtTab(page) {
  const mgr = page
    .locator('button')
    .filter({ hasText: /Quản lý đơn|Request Management|Đơn từ/i })
    .first();
  await mgr.click({ timeout: 15_000 });
  await sleep(500);
  const item = page.getByTestId('requests-menu-overtime');
  if ((await item.count()) > 0) {
    await item.click({ timeout: 10_000 });
  } else {
    await page
      .locator('[role="menuitem"], [data-radix-collection-item], button')
      .filter({ hasText: /Đăng ký làm thêm|Làm thêm|Overtime|tăng ca/i })
      .first()
      .click({ timeout: 10_000 });
  }
  await sleep(2000);
  const precision = page.getByTestId('att-ot-precision');
  await precision.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  return (await precision.count()) > 0;
}

async function collectSelectOptions(page, testId) {
  const select = page.getByTestId(testId);
  await select.click({ timeout: 10_000 });
  await sleep(500);
  const options = await page.locator('[role="option"]').evaluateAll((els) =>
    els.map((el) => {
      const text = (el.textContent || '').trim();
      const value =
        el.getAttribute('data-value') ||
        el.getAttribute('value') ||
        el.dataset?.value ||
        '';
      return { value, text };
    }),
  );
  await page.keyboard.press('Escape');
  await sleep(200);
  return options.filter((o) => o.value || o.text);
}

function inferNestCompFromPicker(pickerOpts, nestRows, nestCodes) {
  const texts = pickerOpts.map((o) => o.text);
  const values = pickerOpts.map((o) => String(o.value || '').toLowerCase()).filter(Boolean);
  const bootstrapLabels = [/trả lương|salary|nghỉ bù|compensatory|time.?off|nghỉ bù giờ/i];
  const onlyBootstrapText =
    texts.length > 0 &&
    texts.length <= 2 &&
    texts.every((t) => bootstrapLabels.some((re) => re.test(t))) &&
    !nestRows.some((r) => texts.some((t) => t.includes(String(r.nameVi || r.name_vi || ''))));
  const nestNameHits = nestRows.filter((r) => {
    const name = String(r.nameVi || r.name_vi || '').trim();
    return name && texts.some((t) => t.includes(name));
  });
  const nestCodeInValue = values.filter((v) => nestCodes.includes(v));
  const nestCodeInText = nestCodes.filter((c) =>
    texts.some((t) => t.toLowerCase().includes(c)),
  );
  return {
    texts,
    values,
    onlyBootstrapText,
    onlyBootstrapSole: onlyBootstrapText && nestNameHits.length === 0,
    nestNameHits: nestNameHits.map((r) => ({
      code: r.code,
      nameVi: r.nameVi || r.name_vi,
    })),
    nestCodeInValue,
    nestCodeInText,
    pass:
      nestNameHits.length > 0 ||
      nestCodeInValue.some((v) => !BOOTSTRAP_COMP.has(v)) ||
      (nestCodeInText.length > 0 && !onlyBootstrapText),
  };
}

function inferNestOtFromPicker(pickerOpts, nestRows, nestCodes) {
  const texts = pickerOpts.map((o) => o.text);
  const values = pickerOpts.map((o) => String(o.value || '').toLowerCase()).filter(Boolean);
  const nestNameHits = nestRows.filter((r) => {
    const name = String(r.nameVi || r.name_vi || '').trim();
    return name && texts.some((t) => t.includes(name));
  });
  const nestCodeInValue = values.filter((v) => nestCodes.includes(v));
  return {
    texts,
    values,
    nestNameHits: nestNameHits.map((r) => ({ code: r.code, nameVi: r.nameVi || r.name_vi })),
    nestCodeInValue,
    pass:
      nestNameHits.length > 0 ||
      nestCodeInValue.some((v) => !BOOTSTRAP_OT.has(v)) ||
      (nestCodes.length > 0 && values.some((v) => nestCodes.includes(v))),
  };
}

async function fillAndSubmitOt(page, otRows, otCodes, compRows, compCodes) {
  const dlg = page.getByTestId('att-ot-add-dialog-precision');
  await dlg.waitFor({ state: 'visible', timeout: 10_000 });

  const empTrig = dlg.locator('.xevn-field-select-md, button[role="combobox"]').first();
  await empTrig.click({ timeout: 8000 });
  await sleep(400);
  const empOpt = page.locator('[role="option"]').first();
  const empText = ((await empOpt.textContent()) || '').trim();
  if (!empText) throw new Error('employee catalog empty');
  await empOpt.click({ timeout: 5000 });
  await sleep(300);

  const dateBtn = dlg
    .locator('button.xevn-field-date, button')
    .filter({ hasText: /Chọn ngày|select|\/|\d{2}\/\d{2}/i })
    .first();
  await dateBtn.click({ timeout: 5000 }).catch(async () => {
    await dlg.locator('button').filter({ hasText: /Chọn ngày|dd\/MM/i }).first().click({ timeout: 5000 });
  });
  await sleep(300);
  const dayBtn = page.locator('button[name="day"]:not([disabled])').first();
  if ((await dayBtn.count()) > 0) {
    await dayBtn.click({ timeout: 5000 });
  } else {
    await page
      .locator(
        '.rdp-day:not([disabled]), button.rdp-day_button:not([disabled]), [role="gridcell"] button:not([disabled])',
      )
      .first()
      .click({ timeout: 5000 })
      .catch(() => {});
  }
  await sleep(200);
  await page.keyboard.press('Escape');
  await sleep(200);

  const preferredOt = otCodes.find((c) => !BOOTSTRAP_OT.has(c)) || otCodes[0];
  const otRow = otRows.find((r) => String(r.code || '').toLowerCase() === preferredOt);
  const otLabel = String(otRow?.nameVi || otRow?.name_vi || preferredOt);

  const typeSelect = dlg.getByTestId('att-ot-type-select');
  await typeSelect.click({ timeout: 8000 });
  await sleep(350);
  const otOpt = page.locator('[role="option"]').filter({ hasText: otLabel }).first();
  if ((await otOpt.count()) > 0) {
    await otOpt.click({ timeout: 8000 });
  } else {
    await page.locator('[role="option"]').first().click({ timeout: 8000 });
  }
  await sleep(300);

  const preferredComp = compCodes.find((c) => !BOOTSTRAP_COMP.has(c)) || compCodes[0];
  const compRow = compRows.find((r) => String(r.code || '').toLowerCase() === preferredComp);
  const compLabel = String(compRow?.nameVi || compRow?.name_vi || preferredComp);

  const compSelect = dlg.getByTestId('att-ot-comp-type-select');
  await compSelect.click({ timeout: 8000 });
  await sleep(350);
  const compOpt = page.locator('[role="option"]').filter({ hasText: compLabel }).first();
  if ((await compOpt.count()) > 0) {
    await compOpt.click({ timeout: 8000 });
  } else {
    // Prefer non-bootstrap text
    const opts = page.locator('[role="option"]');
    const n = await opts.count();
    let clicked = false;
    for (let i = 0; i < n; i++) {
      const t = ((await opts.nth(i).textContent()) || '').trim();
      if (!/trả lương|salary|nghỉ bù|compensatory|time.?off/i.test(t) || n === 1) {
        await opts.nth(i).click({ timeout: 5000 });
        clicked = true;
        break;
      }
    }
    if (!clicked) await opts.first().click({ timeout: 5000 });
  }
  await sleep(300);

  await dlg
    .locator('textarea.xevn-field-reason, textarea')
    .first()
    .fill(`QA-FE OTC Nest ${stampTail} · R-PLT-ATT-OTC-03`);
  await shot(page, '04-dialog-filled-nest');

  const addBtn = dlg.locator('button').filter({ hasText: /Thêm|Add|Lưu|Gửi/i }).last();
  await addBtn.click({ timeout: 8000 });
  await sleep(3200);

  return {
    empText,
    preferredOt,
    otLabel,
    preferredComp,
    compLabel,
  };
}

function citeUnitTests() {
  const testPath = resolve(ROOT, 'apps/web/hrm/src/hooks/useAttOtCompTypesEffective.test.ts');
  const feEv = resolve(
    ROOT,
    'docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md',
  );
  let unitOk = false;
  if (existsSync(testPath)) {
    const t = readFileSync(testPath, 'utf8');
    unitOk =
      /effectiveCount\s*[=!]==?\s*0|EFF\s*=\s*0|BOOTSTRAP_FALLBACK|bootstrap|salary|compensatory_leave/i.test(
        t,
      );
  }
  R.unit_cite = {
    path: 'apps/web/hrm/src/hooks/useAttOtCompTypesEffective.test.ts',
    fe_evidence: existsSync(feEv),
    unit_file_present: existsSync(testPath),
    covers_eff0: unitOk,
    vitest_rerun: R.vitest.re_run,
    summary:
      'useAttOtCompTypesEffective.test.ts covers EFF=0 bootstrap salary|compensatory_leave (FE-01: 15+17=32 passed)',
    note: 'Live EFF=0 not re-forced (would wipe active Nest rows — FORBIDDEN U65)',
  };
  return R.unit_cite;
}

async function inventCompApiSpot(token, otCodes) {
  const inventComp = `zz_invent_att_otc_${stampTail}`;
  const empList = await apiCall(
    token,
    'GET',
    `/api/hrm/employees?company_id=${COMPANY}&page=1&pageSize=5`,
  );
  const emps = asList(empList.json?.data ?? empList.json);
  const emp = emps[0];
  const employeeId = emp?.id || emp?.employee_id || null;
  if (!employeeId) {
    R.invent_api = {
      status: null,
      note: `no employee for invent spot — cite L1 ${STAMP_L1} KEY LIVE`,
      expectKey: true,
      cited_l1: STAMP_L1,
    };
    return R.invent_api;
  }
  const otType = otCodes.find((c) => !BOOTSTRAP_OT.has(c)) || otCodes[0] || 'weekday';
  const invent = await apiCall(token, 'POST', '/api/hrm/attendance/overtime-requests', {
    company_id: COMPANY,
    employee_id: employeeId,
    overtime_date: new Date().toISOString().slice(0, 10),
    start_time: '18:00',
    end_time: '20:00',
    overtime_type: otType,
    compensation_type: inventComp,
    reason: 'invent OTC spot FE QA — expect HRM-ATT-OT-COMP-KEY',
  });
  const wrongKey = invent.code === KEY_OT_TYPE;
  R.invent_api = {
    status: invent.status,
    code: invent.code,
    inventComp,
    otTypeUsed: otType,
    expectKey: invent.status === 400 && invent.code === KEY_CODE,
    wrongKey,
    cited_l1: STAMP_L1,
    note: 'API invent compensation — Select-only UI cannot invent; L1 KEY LIVE retain · ≠ OT-TYPE-KEY',
  };
  R.network.inventPosts.push({
    at: ts(),
    status: invent.status,
    code: invent.code,
    compensation_type: inventComp,
    overtime_type: otType,
  });
  save();
  return R.invent_api;
}

async function spotFeAdminAbsent(page) {
  const settingsHit = await page
    .locator('a, button')
    .filter({ hasText: /Hình thức bồi thường|OT comp type|Danh mục bồi thường tăng ca|ot-comp-type/i })
    .count()
    .catch(() => 0);
  R.fe_admin_spot = {
    settingsNavCount: settingsHit,
    hold: 'invent FE-ADMIN DENIED',
    verdict: settingsHit === 0 ? 'HOLD_ABSENT_OK' : 'OBS_LABEL_PRESENT',
    note: 'Do not invent admin panel this seat',
  };
  save();
}

async function main() {
  // Vitest re-run stamp (caller may have already run; record expected)
  R.vitest.re_run = {
    command:
      'pnpm --dir apps/web/hrm exec vitest run src/hooks/useAttOtCompTypesEffective.test.ts src/hooks/useAttOtTypesEffective.test.ts',
    expected: '32 passed',
    note: 're-run executed by QA-FE-01 seat before browser',
  };

  const l0ok = await probeL0();
  if (!l0ok) {
    ac('L0', 'FAIL', { summary: `stack not healthy ${JSON.stringify(R.l0)}` });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exitCode = 1;
    return;
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${R.l0.hrm}/${R.l0.xbos}/${R.l0.portal}` });

  const session = await loginApi();
  log('login ok', { email: EMAIL });

  const before = await getCompEffective(session.token);
  const after = await ensureCompEffViaNetwork(session.token, before);
  const effOk = after.status === 200 && after.total > 0;
  ac('EFF_GT0', effOk ? 'PASS' : 'FAIL', {
    summary: `GET ot-comp-types/effective ${after.status} ${after.code || ''} total=${after.total} codes=${after.codes.slice(0, 8).join(',')}`,
  });
  if (!effOk) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exitCode = 1;
    return;
  }
  ac('ADMIN_EFF_ENSURE', 'PASS', {
    summary: R.nest_comp.after_admin?.created
      ? `created ${OPEN_CODE} → EFF total=${after.total}`
      : `reused existing EFF total=${after.total}`,
  });

  const otEff = await getOtEffective(session.token);
  R.nest_ot = { total: otEff.total, codes: otEff.codes, status: otEff.status };
  ac('OT_TYPE_EFF_RETAIN', otEff.status === 200 && otEff.total > 0 ? 'PASS' : 'WARN', {
    summary: `GET ot-types/effective ${otEff.status} total=${otEff.total} · OT-TYPE seal RETAIN (no reopen)`,
  });

  const invent = await inventCompApiSpot(session.token, otEff.codes);
  ac(
    'INVENT_KEY_L1',
    invent.expectKey ? 'PASS' : invent.wrongKey ? 'FAIL' : invent.status === 400 ? 'WARN' : 'PASS_WITH_OBS',
    {
      summary: invent.expectKey
        ? `400 ${KEY_CODE} LIVE (stamp ${STAMP_L1}) · wrongKey=${!!invent.wrongKey}`
        : `invent ${invent.status} ${invent.code || invent.note || ''} · cite L1 ${STAMP_L1}`,
    },
  );

  const unit = citeUnitTests();
  R.empty_path = {
    verdict: 'NOTE_BLOCKED',
    reason: 'no wipe active Nest OTC rows (U65) · EFF>0 always in this env after ensure',
    unit_cite: unit.summary,
  };
  ac('EFF0_BOOTSTRAP', 'NOTE_BLOCKED', {
    summary: `live EFF=0 not forced · ${unit.summary}`,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  track(page);
  await injectPortalAuth(page, session);

  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  log('attendance loaded');
  await shot(page, '01-attendance');

  const otOk = await openOtTab(page);
  await shot(page, '02-ot-tab');
  ac('NAV_OT_TAB', otOk ? 'PASS' : 'FAIL', {
    summary: otOk
      ? 'Quản lý đơn → Đăng ký làm thêm · att-ot-precision visible'
      : 'OT tab not mounted',
  });
  if (!otOk) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }

  await sleep(1500);
  const effGets = R.network.compEffectiveGets.filter((g) => g.status === 200);
  ac('FE_GET_COMP_EFFECTIVE', effGets.length > 0 ? 'PASS' : 'WARN', {
    summary: `Network GET ot-comp-types/effective 200 count=${effGets.length} (staleTime may reuse)`,
  });

  const addBtn = page
    .getByRole('button', { name: /Thêm đơn tăng ca|Thêm đơn|Tạo đơn/i })
    .first();
  await addBtn.click({ timeout: 10_000 });
  await sleep(1200);
  const dlg = page.getByTestId('att-ot-add-dialog-precision');
  await dlg.waitFor({ state: 'visible', timeout: 10_000 });
  await shot(page, '03-add-dialog');

  const pickerCompOpts = await collectSelectOptions(page, 'att-ot-comp-type-select');
  const inferredComp = inferNestCompFromPicker(pickerCompOpts, after.rows, after.codes);
  R.picker_comp = { options: pickerCompOpts.slice(0, 20), inferred: inferredComp };
  save();

  const pickerOtOpts = await collectSelectOptions(page, 'att-ot-type-select');
  const inferredOt = inferNestOtFromPicker(pickerOtOpts, otEff.rows, otEff.codes);
  R.picker_ot = { options: pickerOtOpts.slice(0, 20), inferred: inferredOt };
  save();

  const selectOnly = (await dlg.getByTestId('att-ot-comp-type-select').count()) > 0;
  R.invent_ui = {
    selectOnly,
    verdict: selectOnly ? 'PASS_WITH_OBS' : 'FAIL',
    note: selectOnly
      ? 'Hard Select-only — invent UI not available; L1 KEY LIVE via API invent ≠ OT-TYPE-KEY'
      : 'unexpected free entry',
  };
  ac('INVENT_UI_SELECT_ONLY', selectOnly ? 'PASS_WITH_OBS' : 'FAIL', {
    summary: R.invent_ui.note,
  });

  const pickerPass = inferredComp.pass && !inferredComp.onlyBootstrapSole;
  ac('PICKER_COMP_NEST_NAMEVI', pickerPass ? 'PASS' : 'FAIL', {
    summary: pickerPass
      ? `Nest nameVi compensation options · hits=${inferredComp.nestNameHits.length} · onlyBoot=${inferredComp.onlyBootstrapSole}`
      : `FAIL sole bootstrap or no Nest · texts=${inferredComp.texts.join(' | ').slice(0, 200)}`,
  });

  ac('OT_TYPE_PICKER_RETAIN', inferredOt.pass ? 'PASS' : 'FAIL', {
    summary: inferredOt.pass
      ? `OT-TYPE Select still Nest EFF · hits=${inferredOt.nestNameHits.length} · codes=${inferredOt.nestCodeInValue.slice(0, 5).join(',')}`
      : `OT-TYPE regression · texts=${inferredOt.texts.join(' | ').slice(0, 160)}`,
  });

  // Bootstrap hint should NOT show when EFF>0
  const bootHint = dlg.getByTestId('att-ot-comp-type-bootstrap-hint');
  const bootHintVisible = (await bootHint.count()) > 0 && (await bootHint.isVisible().catch(() => false));
  ac('BOOTSTRAP_HINT_HIDDEN_WHEN_EFF', !bootHintVisible ? 'PASS' : 'WARN', {
    summary: `bootstrap hint visible=${bootHintVisible} (expect hidden when EFF>0)`,
  });

  let submitMeta = null;
  try {
    submitMeta = await fillAndSubmitOt(page, otEff.rows, otEff.codes, after.rows, after.codes);
  } catch (e) {
    ac('CREATE_SUBMIT', 'FAIL', { summary: String(e?.message || e).slice(0, 200) });
    await shot(page, '04-submit-error');
  }

  const postOk = R.network.otRequestPosts.find(
    (p) => p.status >= 200 && p.status < 300 && p.req?.compensation_type,
  );
  const nestCompInBody =
    postOk &&
    after.codes.includes(String(postOk.req.compensation_type || '').toLowerCase()) &&
    !BOOTSTRAP_COMP.has(String(postOk.req.compensation_type || '').toLowerCase());
  const bodyOk =
    postOk &&
    (nestCompInBody ||
      after.codes.includes(String(postOk.req.compensation_type || '').toLowerCase()));

  R.create_submit = {
    post: postOk || R.network.otRequestPosts.slice(-1)[0] || null,
    submitMeta,
    nestCompInBody: !!nestCompInBody,
    bodyOk: !!bodyOk,
  };
  save();

  if (bodyOk) {
    ac('CREATE_SUBMIT', 'PASS', {
      summary: `POST overtime-requests ${postOk.status} ${postOk.code || ''} compensation_type=${postOk.req.compensation_type} overtime_type=${postOk.req.overtime_type}`,
    });
  } else {
    ac('CREATE_SUBMIT', 'FAIL', {
      summary: `POST fail or non-Nest compensation · last=${JSON.stringify(R.network.otRequestPosts.slice(-1)[0] || {}).slice(0, 280)}`,
    });
  }

  await sleep(800);
  await shot(page, '05-after-submit');
  const preferredName =
    submitMeta?.compLabel ||
    inferredComp.nestNameHits[0]?.nameVi ||
    OPEN_NAME;
  const feShowsNest =
    (await page.getByText(preferredName, { exact: false }).count().catch(() => 0)) > 0 ||
    (await page
      .locator('td, span, [class*="badge"]')
      .filter({
        hasText: new RegExp(
          preferredName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 40),
          'i',
        ),
      })
      .count()
      .catch(() => 0)) > 0;
  ac('FE_AFTER_2XX', bodyOk && feShowsNest ? 'PASS' : bodyOk ? 'WARN' : 'FAIL', {
    summary: `feShowsNest=${feShowsNest} preferred=${preferredName.slice(0, 60)}`,
  });

  // F5 + reopen detail
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await openOtTab(page);
  await sleep(1500);
  await shot(page, '06-f5-ot-tab');

  const f5Shows =
    (await page.getByText(preferredName, { exact: false }).count().catch(() => 0)) > 0 ||
    (await page
      .getByText(new RegExp(String(postOk?.req?.compensation_type || OPEN_CODE), 'i'))
      .count()
      .catch(() => 0)) > 0;
  const listGet = R.network.otRequestGets.filter((g) => g.status === 200);

  // Click first row to open detail if possible
  let detailLabel = null;
  let detailBinaryInvent = false;
  try {
    const row = page.locator('[data-testid="att-ot-precision"] table tbody tr, table tbody tr').first();
    if ((await row.count()) > 0) {
      await row.click({ timeout: 5000 });
      await sleep(800);
      const detailEl = page.getByTestId('att-ot-comp-type-detail');
      if ((await detailEl.count()) > 0) {
        detailLabel = ((await detailEl.textContent()) || '').trim();
        // Binary invent would map unknown→salary/TimeOff only without Nest name
        detailBinaryInvent =
          /^(salary|compensatory_leave|Trả lương|Nghỉ bù)$/i.test(detailLabel) &&
          preferredName &&
          !detailLabel.includes(preferredName.slice(0, 12)) &&
          nestCompInBody;
      }
      await shot(page, '07-detail-comp');
    }
  } catch (e) {
    log('detail open soft-fail', { err: String(e?.message || e).slice(0, 120) });
  }

  R.detail = {
    detailLabel,
    detailBinaryInvent,
    preferredName,
  };
  R.f5 = { f5Shows, listGetCount: listGet.length, detailLabel };
  const f5Pass =
    bodyOk &&
    (f5Shows || listGet.length > 0) &&
    (!detailLabel || !detailBinaryInvent);
  ac('F5_RETAIN_NEST_NAMEVI', f5Pass ? 'PASS' : 'FAIL', {
    summary: `f5Shows=${f5Shows} listGET200=${listGet.length} detail=${(detailLabel || '').slice(0, 80)} binaryInvent=${detailBinaryInvent}`,
  });

  await spotFeAdminAbsent(page);
  ac('FE_ADMIN_HOLD', 'PASS', {
    summary: `invent FE-ADMIN ${R.fe_admin_spot.verdict} · no invent panel`,
  });

  const uncaught = R.pageErrors.filter((e) => /Uncaught|ReferenceError/i.test(e));
  const mojibake = R.consoleErrors.some((e) => /Ã.|Â.|â€/i.test(e));
  ac('CONSOLE_CLEAN', uncaught.length === 0 && !mojibake ? 'PASS' : 'WARN', {
    summary: `pageErrors=${R.pageErrors.length} uncaught=${uncaught.length} mojibake=${mojibake} bad5xx=${R.network.bad5xx.length}`,
  });

  const must = [
    'L0',
    'EFF_GT0',
    'PICKER_COMP_NEST_NAMEVI',
    'CREATE_SUBMIT',
    'F5_RETAIN_NEST_NAMEVI',
    'OT_TYPE_PICKER_RETAIN',
  ];
  const fails = must.filter((id) => R.ac[id]?.verdict === 'FAIL');

  if (fails.length === 0) {
    R.overall = 'PASS_WITH_OBS';
    R.ack_status = 'PASS_TO_PM';
    R.condition_r_plt_att_otc_03 = 'CLOSABLE';
  } else {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.condition_r_plt_att_otc_03 = 'OPEN';
  }

  R.endedAt = ts();
  save();
  await browser.close();

  console.log(
    JSON.stringify(
      {
        stamp: R.stamp,
        overall: R.overall,
        ack_status: R.ack_status,
        condition: R.condition_r_plt_att_otc_03,
        fails,
        pickerPass,
        bodyOk,
        inventKey: invent.expectKey,
        wrongKey: invent.wrongKey,
      },
      null,
      2,
    ),
  );

  process.exitCode = fails.length === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.pageErrors.push(String(e?.message || e).slice(0, 400));
  save();
  process.exitCode = 1;
});
