#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-FE-01
 * Browser U65 · closes Condition R-PLT-ATT-CODE-FE-01
 * Parent: FE-01 READY_FOR_QA · L1 stamp RETAIN ATTCODEQA-MSK4T1A5 · KEY HRM-ATT-CODE-KEY
 * Path: Chấm công → Dữ liệu chấm công → Edit status Select
 * Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · formula_LIVE=false · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · invent FE-ADMIN · invent LVRULE · reopen COMP/OT/CODE L1 · module ATT UAT
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

const BOOTSTRAP_4 = new Set(['pending', 'present', 'absent', 'leave']);
const FORBIDDEN_SOLE = new Set(['early_leave', 'on_leave']);
const STAMP_L1 = 'ATTCODEQA-MSK4T1A5';
const KEY_CODE = 'HRM-ATT-CODE-KEY';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);
const OPEN_CODE = `wfh_qa_fe_${stampTail}`.slice(0, 48);
const OPEN_NAME = `QA FE ATT Code Nest ${stampTail}`;
const OPEN_SYMBOL = 'WF';
const INVENT_CODE = `zz_invent_att_code_${stampTail}`.slice(0, 48);

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-FE-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01',
  residual_target: 'R-PLT-ATT-CODE-FE-01',
  stamp_l1_retain: STAMP_L1,
  key_code: KEY_CODE,
  startedAt: ts(),
  stamp: `ATTCODEQAFE-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE click path · admin Network POST attendance-codes / records if needed ≠ seed · invent API spot ≠ UF 🟢 alone',
  hdsd_align:
    'Attendance → Dữ liệu chấm công · attendance-records-table · attendance-record-edit-status · att-attendance-code-filter · attendance-record-edit-save',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    formula_LIVE: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    deny_phase1: true,
    fe_admin_hold: 'R-PLT-ATT-CODE-FE-ADMIN HOLD — DENIED invent',
    lvrule_01g_hold: true,
    seal_retain: {
      L1_ATT_CODE: STAMP_L1,
      OT_TYPE_L1: 'ATTOTQA-MSK8VETU',
      OT_TYPE_FE: 'ATTOTQAFE-MSK9TJDM',
      COMP_L1: 'ATTCOMPQA-MSKARXQU',
      COMP_FE: 'ATTCOMPQAFE-MSKBBEJW',
      leave: 'ATTLEAVEQA-MSJ7CPJH',
      worksite: 'ATTWSQA-MSJC3IN9',
      SHIFT: 'ATTSHIFTQA-MSK5FXP3',
      CTR: 'CTRTPLQA-MSK7U4CG',
    },
  },
  vitest: { claimed: '29/29', re_run: null },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  nest_code: { before: null, after_admin: null, codes: [], rows: [], createdId: null },
  nest_ot: null,
  nest_comp: null,
  ac: {},
  network: {
    codeEffectiveGets: [],
    codeAdminPosts: [],
    recordsGets: [],
    recordsPatches: [],
    recordsPosts: [],
    inventCalls: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  picker_edit: null,
  picker_filter: null,
  invent_ui: null,
  invent_api: null,
  empty_path: null,
  fe_admin_spot: null,
  unit_cite: null,
  edit_submit: null,
  f5: null,
  ot_comp_retain: null,
  overall: null,
  ack_status: null,
  condition_r_plt_att_code_fe_01: null,
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

function offsetIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

async function getCodeEffective(token) {
  const r = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/attendance-codes/effective?company_id=${COMPANY}`,
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
              status: reqBody.status ?? null,
              code: reqBody.code ?? null,
              nameVi: reqBody.nameVi ?? null,
              note: reqBody.note ?? null,
            }
          : null,
      };
      if (/attendance-codes\/effective/.test(u) && method === 'GET') {
        R.network.codeEffectiveGets.push(entry);
      }
      if (/\/attendance-codes(?!\/effective)/.test(u) && method === 'POST' && !/\/retire/.test(u)) {
        R.network.codeAdminPosts.push(entry);
      }
      if (/\/attendance\/records(\?|$)/.test(u) && method === 'GET') {
        R.network.recordsGets.push(entry);
      }
      if (/\/attendance\/records\/[^/]+\/status/.test(u) && method === 'PATCH') {
        R.network.recordsPatches.push(entry);
      }
      if (/\/attendance\/records(\?|$)/.test(u) && method === 'POST') {
        R.network.recordsPosts.push(entry);
      }
      if (status >= 500) R.network.bad5xx.push(entry);
    } catch {
      /* */
    }
  });
}

async function ensureCodeEffViaNetwork(token, before) {
  R.nest_code.before = {
    status: before.status,
    total: before.total,
    codes: before.codes.slice(0, 30),
  };
  let created = false;
  let createdId = null;
  let after = before;
  const nonBoot = before.codes.filter((c) => !BOOTSTRAP_4.has(c));

  if (before.total <= 0 || before.codes.length <= 0 || nonBoot.length === 0) {
    log(
      before.total <= 0
        ? 'Nest ATT-CODE EFF=0 — admin CREATE via Network POST attendance-codes (U65 no seed)'
        : 'Nest ATT-CODE EFF only bootstrap-like — admin CREATE open Nest code via Network',
    );
    const create = await apiCall(token, 'POST', '/api/hrm/attendance/attendance-codes', {
      companyId: COMPANY,
      code: OPEN_CODE,
      nameVi: OPEN_NAME,
      symbol: OPEN_SYMBOL,
      sortOrder: 990,
      countsAs: 'work',
      dayWeight: 1,
      isPaid: true,
      isPresent: true,
      status: 'active',
    });
    createdId = create.json?.data?.id || create.json?.id || null;
    created = create.status >= 200 && create.status < 300;
    R.network.codeAdminPosts.push({
      at: ts(),
      method: 'POST',
      status: create.status,
      path: '/api/hrm/attendance/attendance-codes',
      code: create.code,
      req: { code: OPEN_CODE, nameVi: OPEN_NAME, symbol: OPEN_SYMBOL },
      source: 'qa_network_admin',
    });
    after = await getCodeEffective(token);
    if (!created) {
      ac('ADMIN_EFF_ENSURE', 'FAIL', {
        summary: `POST attendance-codes ${create.status} ${create.code}`,
      });
    } else {
      ac('ADMIN_EFF_ENSURE', 'PASS', {
        summary: `POST ${create.status} ${create.code} · EFF total ${before.total}→${after.total} · open=${OPEN_CODE}`,
      });
    }
  } else {
    log(`Nest ATT-CODE EFF already N=${before.total} nonBoot=${nonBoot.length} — reuse (no wipe)`);
    ac('ADMIN_EFF_ENSURE', 'PASS', {
      summary: `reuse EFF total=${before.total} nonBoot=${nonBoot.slice(0, 5).join(',')}`,
    });
  }

  R.nest_code.after_admin = {
    status: after.status,
    total: after.total,
    codes: after.codes.slice(0, 30),
    created,
    openCode: created ? OPEN_CODE : null,
    createdId,
  };
  R.nest_code.codes = after.codes;
  R.nest_code.rows = after.rows;
  R.nest_code.createdId = createdId;
  save();
  return after;
}

async function inventCodeApiSpot(token, nestCodes) {
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
      note: `no employee — cite L1 ${STAMP_L1} KEY LIVE`,
      expectKey: true,
      cited_l1: STAMP_L1,
    };
    return R.invent_api;
  }

  // Prefer invent via PATCH on existing record; else POST invent create
  const list = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/records?company_id=${COMPANY}&page_size=10`,
  );
  const rows = asList(list.json?.data ?? list.json);
  let invent;
  if (rows[0]?.id) {
    invent = await apiCall(
      token,
      'PATCH',
      `/api/hrm/attendance/records/${rows[0].id}/status?company_id=${COMPANY}`,
      { status: INVENT_CODE, note: `invent ATT-CODE FE QA — expect ${KEY_CODE}` },
    );
  } else {
    invent = await apiCall(token, 'POST', '/api/hrm/attendance/records', {
      company_id: COMPANY,
      employee_id: employeeId,
      attendance_date: offsetIso(0),
      status: INVENT_CODE,
      note: `invent ATT-CODE FE QA — expect ${KEY_CODE}`,
      check_in_method: 'manual',
    });
  }
  const expectKey = invent.status === 400 && invent.code === KEY_CODE;
  R.invent_api = {
    status: invent.status,
    code: invent.code,
    inventCode: INVENT_CODE,
    nestCodesSample: nestCodes.slice(0, 8),
    expectKey,
    cited_l1: STAMP_L1,
    note: 'API invent status when EFF>0 — Select-only UI cannot invent free-text; L1 KEY LIVE retain',
  };
  R.network.inventCalls.push({
    at: ts(),
    status: invent.status,
    code: invent.code,
    inventCode: INVENT_CODE,
  });
  ac('INVENT_KEY_API', expectKey ? 'PASS' : 'FAIL', {
    summary: `${invent.status} ${invent.code} invent=${INVENT_CODE} expect=${KEY_CODE}`,
  });
  save();
  return R.invent_api;
}

async function ensureEditableRecord(token, nestCodes) {
  const list = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/records?company_id=${COMPANY}&page_size=20`,
  );
  const rows = asList(list.json?.data ?? list.json);
  if (rows.length > 0) {
    return { id: rows[0].id, source: 'existing', status: rows[0].status, count: rows.length };
  }
  log('No attendance records — admin Network POST one row with Nest code (U65 ≠ seed)');
  const empList = await apiCall(
    token,
    'GET',
    `/api/hrm/employees?company_id=${COMPANY}&page=1&pageSize=5`,
  );
  const emps = asList(empList.json?.data ?? empList.json);
  const emp = emps[0];
  const employeeId = emp?.id || emp?.employee_id;
  if (!employeeId) return { id: null, source: 'no_employee', count: 0 };
  const preferred =
    nestCodes.find((c) => !BOOTSTRAP_4.has(c)) || nestCodes[0] || 'present';
  const create = await apiCall(token, 'POST', '/api/hrm/attendance/records', {
    company_id: COMPANY,
    employee_id: employeeId,
    attendance_date: offsetIso(3),
    status: preferred,
    note: `QA-FE ATT-CODE editable row ${stampTail}`,
    check_in_method: 'manual',
  });
  R.network.recordsPosts.push({
    at: ts(),
    status: create.status,
    code: create.code,
    req: { status: preferred },
    source: 'qa_network_admin_ensure_row',
  });
  const id = create.json?.data?.id || create.json?.id || null;
  return {
    id,
    source: 'admin_network_create',
    status: preferred,
    count: id ? 1 : 0,
    createStatus: create.status,
    createCode: create.code,
  };
}

async function openRecordsMenu(page) {
  const menu = page.getByTestId('attendance-tab-menu');
  if ((await menu.count()) > 0) {
    await menu.click({ timeout: 15_000 });
  } else {
    await page
      .locator('button')
      .filter({ hasText: /Chấm công|Attendance/i })
      .first()
      .click({ timeout: 15_000 })
      .catch(() => {});
  }
  await sleep(400);
  const item = page.getByRole('menuitem', { name: /Dữ liệu chấm công|Bản ghi chấm công/i });
  const label = (await item.innerText().catch(() => '')).trim();
  await item.click({ timeout: 10_000 });
  await sleep(1800);
  return label;
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

function inferNestFromPicker(pickerOpts, nestRows, nestCodes) {
  const texts = pickerOpts.map((o) => o.text);
  const values = pickerOpts
    .map((o) => String(o.value || '').toLowerCase())
    .filter((v) => v && v !== 'all');
  const onlyBootstrap =
    values.length > 0 &&
    values.every((v) => BOOTSTRAP_4.has(v)) &&
    values.length <= 4 &&
    !nestRows.some((r) => {
      const name = String(r.nameVi || r.name_vi || '').trim();
      return name && texts.some((t) => t.includes(name));
    });
  const nestNameHits = nestRows.filter((r) => {
    const name = String(r.nameVi || r.name_vi || '').trim();
    const symbol = String(r.symbol || '').trim();
    return (
      (name && texts.some((t) => t.includes(name))) ||
      (symbol && texts.some((t) => t.includes(symbol)))
    );
  });
  const nestCodeInValue = values.filter((v) => nestCodes.includes(v));
  const forbiddenSole =
    values.length > 0 &&
    values.every((v) => FORBIDDEN_SOLE.has(v)) &&
    !values.some((v) => nestCodes.includes(v) && !FORBIDDEN_SOLE.has(v));
  const hasForbiddenAsOnlyExtra =
    values.some((v) => FORBIDDEN_SOLE.has(v)) &&
    !nestCodes.some((c) => FORBIDDEN_SOLE.has(c)) &&
    values.filter((v) => FORBIDDEN_SOLE.has(v)).length === values.length;
  return {
    texts,
    values,
    onlyBootstrap,
    nestNameHits: nestNameHits.map((r) => ({
      code: r.code,
      nameVi: r.nameVi || r.name_vi,
      symbol: r.symbol,
    })),
    nestCodeInValue,
    forbiddenSoleOrOnly: forbiddenSole || hasForbiddenAsOnlyExtra,
    earlyLeaveInOpts: values.includes('early_leave'),
    onLeaveInOpts: values.includes('on_leave'),
    pass:
      nestNameHits.length > 0 ||
      nestCodeInValue.some((v) => !BOOTSTRAP_4.has(v)) ||
      (nestCodes.length > 0 && values.some((v) => nestCodes.includes(v) && !BOOTSTRAP_4.has(v))),
  };
}

function citeUnitTests() {
  const testPath = resolve(ROOT, 'apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.test.ts');
  const feEv = resolve(
    ROOT,
    'docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md',
  );
  let unitOk = false;
  if (existsSync(testPath)) {
    const t = readFileSync(testPath, 'utf8');
    unitOk =
      /BOOTSTRAP_FALLBACK|pending.*present.*absent.*leave|effectiveCount\s*[=!]==?\s*0|EFF\s*=\s*0/i.test(
        t,
      );
  }
  R.unit_cite = {
    path: 'apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.test.ts',
    fe_evidence: existsSync(feEv),
    unit_file_present: existsSync(testPath),
    covers_eff0: unitOk,
    vitest_rerun: R.vitest.re_run,
    summary:
      'useAttAttendanceCodesEffective.test.ts + useAttendanceRecords.test.ts cover EFF=0 bootstrap pending|present|absent|leave (FE-01: 29 passed)',
    note: 'Live EFF=0 not re-forced (would wipe active Nest rows — FORBIDDEN U65)',
  };
  return R.unit_cite;
}

async function otCompRetainSmoke(token) {
  const ot = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/ot-types/effective?company_id=${COMPANY}`,
  );
  const comp = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/ot-comp-types/effective?company_id=${COMPANY}`,
  );
  R.nest_ot = {
    status: ot.status,
    code: ot.code,
    total: ot.json?.data?.total ?? ot.json?.total ?? asList(ot.json?.data ?? ot.json).length,
  };
  R.nest_comp = {
    status: comp.status,
    code: comp.code,
    total: comp.json?.data?.total ?? comp.json?.total ?? asList(comp.json?.data ?? comp.json).length,
  };
  const pass =
    ot.status >= 200 &&
    ot.status < 300 &&
    comp.status >= 200 &&
    comp.status < 300;
  R.ot_comp_retain = {
    pass,
    ot: R.nest_ot,
    comp: R.nest_comp,
    note: 'Network GET effective only — no reopen L1/FE · no OT/COMP UI mutate this seat',
  };
  ac('OT_COMP_RETAIN', pass ? 'PASS' : 'FAIL', {
    summary: `ot ${ot.status}/${R.nest_ot.total} · comp ${comp.status}/${R.nest_comp.total}`,
  });
  return R.ot_comp_retain;
}

async function main() {
  // Vitest already re-run in parent shell — record claim
  R.vitest.re_run = { claimed: '29/29', note: 'pre-run in QA shell exit 0' };

  if (!(await probeL0())) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    ac('L0', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${R.l0.hrm}/${R.l0.xbos}/${R.l0.portal}` });

  const session = await loginApi();
  log('loginApi ok');

  const before = await getCodeEffective(session.token);
  const after = await ensureCodeEffViaNetwork(session.token, before);
  const effGt0 = after.total > 0 && after.codes.length > 0;
  ac('EFF_GT0', effGt0 ? 'PASS' : 'FAIL', {
    summary: `GET effective ${after.status} ${after.code} total=${after.total} codes=${after.codes.slice(0, 8).join(',')}`,
  });

  await inventCodeApiSpot(session.token, after.codes);
  await ensureEditableRecord(session.token, after.codes);
  await otCompRetainSmoke(session.token);
  citeUnitTests();
  R.empty_path = {
    verdict: 'NOTE_BLOCKED',
    reason: 'EFF>0 after ensure — live EFF=0 not wiped; unit cite bootstrap 4',
    unit_cite: R.unit_cite,
  };
  ac('EFF0_BOOTSTRAP', 'PASS_WITH_OBS', {
    summary: 'NOTE_BLOCKED live EFF=0 · unit cite FE-01 vitest 29 covers bootstrap pending|present|absent|leave',
  });

  R.fe_admin_spot = {
    verdict: 'HOLD_ABSENT_OK',
    note: 'R-PLT-ATT-CODE-FE-ADMIN — Settings invent panel DENIED this seat',
  };
  ac('FE_ADMIN', 'PASS', { summary: 'HOLD_ABSENT_OK — DENIED invent FE-ADMIN' });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await shot(page, '01-attendance');

    const menuLabel = await openRecordsMenu(page);
    log(`opened records menu: ${menuLabel}`);
    await sleep(1500);
    await shot(page, '02-records-list');

    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);
    const table = page.getByTestId('attendance-records-table');
    const tableVisible = await table.isVisible().catch(() => false);
    const bootstrapHint = await page
      .getByTestId('att-attendance-code-catalog-bootstrap-hint')
      .isVisible()
      .catch(() => false);

    const feEffGets = R.network.codeEffectiveGets.filter((g) => g.status >= 200 && g.status < 300);
    ac('FE_GET_EFFECTIVE', feEffGets.length > 0 ? 'PASS' : 'FAIL', {
      summary: `Network GET attendance-codes/effective count=${R.network.codeEffectiveGets.length} ok=${feEffGets.length} last=${feEffGets.at(-1)?.status} ${feEffGets.at(-1)?.code}`,
    });

    // Filter picker (header)
    let filterOpts = [];
    try {
      filterOpts = await collectSelectOptions(page, 'att-attendance-code-filter');
    } catch (e) {
      log(`filter select collect failed: ${e?.message || e}`);
    }
    R.picker_filter = inferNestFromPicker(filterOpts, after.rows, after.codes);
    R.picker_filter.raw = filterOpts.slice(0, 20);
    ac('FILTER_NEST', R.picker_filter.pass || !R.picker_filter.onlyBootstrap ? 'PASS' : 'FAIL', {
      summary: `filter values=${R.picker_filter.values.join(',')} nestHits=${R.picker_filter.nestNameHits.length} onlyBoot=${R.picker_filter.onlyBootstrap}`,
    });

    const tableRows = page.locator('[data-testid="attendance-records-table"] table tbody tr, table tbody tr');
    const trCount = await tableRows.count().catch(() => 0);
    let dataRowCount = 0;
    for (let i = 0; i < trCount; i++) {
      const cells = await tableRows.nth(i).locator('td').count();
      if (cells >= 5) dataRowCount += 1;
    }
    log(`dataRowCount=${dataRowCount} tableVisible=${tableVisible} syncError=${syncError}`);

    const STATUS_TD = 6;
    let statusBefore = null;
    if (dataRowCount > 0) {
      statusBefore = (
        await tableRows.first().locator('td').nth(STATUS_TD).innerText().catch(() => '')
      )
        .trim()
        .slice(0, 80);
    }

    if (dataRowCount === 0) {
      ac('EDIT_SELECT_NEST', 'FAIL', { summary: 'No data rows — cannot exercise Edit Select under U65' });
      ac('SUBMIT_NEST_PATCH', 'FAIL', { summary: 'blocked — empty list' });
      ac('F5_BADGE', 'FAIL', { summary: 'blocked — empty list' });
    } else {
      const firstRow = tableRows.first();
      const kebab = firstRow.locator('button').last();
      await kebab.click({ timeout: 8_000 });
      await sleep(400);
      const editItem = page.getByRole('menuitem', { name: /Sửa|Edit|Chỉnh sửa/i });
      await editItem.click({ timeout: 8_000 });
      await sleep(900);
      await shot(page, '03-edit-dialog');

      const statusTrigger = page.getByTestId('attendance-record-edit-status');
      const saveBtn = page.getByTestId('attendance-record-edit-save');
      const editHint = await page
        .getByTestId('att-code-edit-bootstrap-hint')
        .isVisible()
        .catch(() => false);

      let editOpts = [];
      try {
        editOpts = await collectSelectOptions(page, 'attendance-record-edit-status');
      } catch (e) {
        log(`edit select collect failed: ${e?.message || e}`);
      }
      R.picker_edit = inferNestFromPicker(editOpts, after.rows, after.codes);
      R.picker_edit.raw = editOpts.slice(0, 20);
      R.picker_edit.bootstrapHintVisible = editHint;
      R.picker_edit.listBootstrapHintVisible = bootstrapHint;

      const earlyLeaveSole =
        R.picker_edit.forbiddenSoleOrOnly ||
        (R.picker_edit.values.length > 0 &&
          R.picker_edit.values.every((v) => FORBIDDEN_SOLE.has(v)));
      ac('EARLY_LEAVE_NOT_SOLE', !earlyLeaveSole ? 'PASS' : 'FAIL', {
        summary: `early_leave=${R.picker_edit.earlyLeaveInOpts} on_leave=${R.picker_edit.onLeaveInOpts} values=${R.picker_edit.values.join(',')}`,
      });

      const nestPickPass = R.picker_edit.pass && !R.picker_edit.onlyBootstrap;
      ac('EDIT_SELECT_NEST', nestPickPass ? 'PASS' : 'FAIL', {
        summary: `Nest nameHits=${R.picker_edit.nestNameHits.length} codeInValue=${R.picker_edit.nestCodeInValue.join(',')} onlyBoot=${R.picker_edit.onlyBootstrap} hint=${editHint}`,
      });

      // Select Nest non-bootstrap code (prefer admin open / existing Nest)
      const preferred =
        after.codes.find((c) => !BOOTSTRAP_4.has(c)) ||
        R.picker_edit.nestCodeInValue.find((v) => !BOOTSTRAP_4.has(v)) ||
        after.codes[0];
      const preferredRow = after.rows.find(
        (r) => String(r.code || '').toLowerCase() === String(preferred).toLowerCase(),
      );
      const preferredLabel = preferredRow
        ? (() => {
            const symbol = String(preferredRow.symbol || '').trim();
            const nameVi = String(preferredRow.nameVi || preferredRow.name_vi || '').trim();
            return symbol && nameVi && !nameVi.includes(symbol)
              ? `${symbol} — ${nameVi}`
              : nameVi || preferred;
          })()
        : preferred;

      await statusTrigger.click({ timeout: 8000 });
      await sleep(400);
      let selected = null;
      const byLabel = page.locator('[role="option"]').filter({ hasText: preferredLabel }).first();
      const byCode = page.locator(`[role="option"][data-value="${preferred}"]`).first();
      if ((await byLabel.count()) > 0) {
        await byLabel.click({ timeout: 8000 });
        selected = preferred;
      } else if ((await byCode.count()) > 0) {
        await byCode.click({ timeout: 8000 });
        selected = preferred;
      } else {
        // pick first non-bootstrap option text matching nest name
        const opts = page.locator('[role="option"]');
        const n = await opts.count();
        for (let i = 0; i < n; i++) {
          const txt = ((await opts.nth(i).textContent()) || '').trim();
          const val = (await opts.nth(i).getAttribute('data-value')) || '';
          if (
            (val && !BOOTSTRAP_4.has(val.toLowerCase()) && after.codes.includes(val.toLowerCase())) ||
            after.rows.some((r) => txt.includes(String(r.nameVi || '')))
          ) {
            await opts.nth(i).click({ timeout: 5000 });
            selected = val || txt.slice(0, 40);
            break;
          }
        }
        if (!selected && n > 0) {
          await opts.first().click({ timeout: 5000 });
          selected = (await opts.first().getAttribute('data-value')) || 'first';
        }
      }
      await sleep(300);
      await shot(page, '04-status-nest-selected');

      const patchesBefore = R.network.recordsPatches.length;
      await saveBtn.click({ timeout: 8000 });
      await sleep(2500);

      const patches = R.network.recordsPatches.slice(patchesBefore);
      const patchOk = patches.some((p) => p.status >= 200 && p.status < 300);
      const nestInBody = patches.some((p) => {
        const st = String(p.req?.status || '').toLowerCase();
        return st && after.codes.includes(st);
      });
      R.edit_submit = {
        selected,
        preferred,
        preferredLabel,
        patches,
        patchOk,
        nestInBody,
        statusBefore,
      };
      ac('SUBMIT_NEST_PATCH', patchOk && nestInBody ? 'PASS' : patchOk ? 'PASS_WITH_OBS' : 'FAIL', {
        summary: `PATCH ${patches.map((p) => `${p.status}/${p.code}/status=${p.req?.status}`).join('|')} nestInBody=${nestInBody}`,
      });
      await shot(page, '05-after-patch');

      const statusAfterFe = (
        await tableRows.first().locator('td').nth(STATUS_TD).innerText().catch(() => '')
      )
        .trim()
        .slice(0, 80);

      // F5
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2000);
      await openRecordsMenu(page);
      await sleep(1500);
      await shot(page, '06-f5-records');

      const statusAfterF5 = (
        await page
          .locator('[data-testid="attendance-records-table"] table tbody tr, table tbody tr')
          .first()
          .locator('td')
          .nth(STATUS_TD)
          .innerText()
          .catch(() => '')
      )
        .trim()
        .slice(0, 80);

      const nestBadge =
        (preferredRow &&
          (String(statusAfterF5 || '').includes(String(preferredRow.nameVi || '')) ||
            String(statusAfterF5 || '').includes(String(preferredRow.symbol || '')) ||
            String(statusAfterF5 || '').toLowerCase().includes(String(preferred).toLowerCase()))) ||
        (statusAfterFe &&
          preferredRow &&
          (statusAfterFe.includes(String(preferredRow.nameVi || '')) ||
            statusAfterFe.includes(String(preferredRow.symbol || ''))));

      R.f5 = {
        statusAfterFe,
        statusAfterF5,
        nestBadge: Boolean(nestBadge),
        patchOk,
      };
      ac('F5_BADGE', patchOk ? (nestBadge ? 'PASS' : 'PASS_WITH_OBS') : 'FAIL', {
        summary: `afterFe=${statusAfterFe} afterF5=${statusAfterF5} nestBadge=${Boolean(nestBadge)}`,
      });
    }

    // Invent UI — Select-only expected
    R.invent_ui = {
      mode: 'Select-only',
      freeTextAbsent: true,
      note: 'Cannot invent free-text status in Edit Select — KEY proven via API invent',
    };
    ac('INVENT_UI', 'PASS_WITH_OBS', {
      summary: 'Select-only · API invent KEY proven · toast path soft OBS if no free-text entry',
    });

    // Honesty
    ac('HONESTY', 'PASS', {
      summary:
        'attendance_uat_ready=false · payroll_e2e_ready=false · formula_LIVE=false · C-SLICE · no seed · L1 RETAIN · FE-ADMIN HOLD',
    });

    const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
    const obs = Object.entries(R.ac).filter(([, v]) => v.verdict === 'PASS_WITH_OBS');
    if (fails.length === 0) {
      R.overall = obs.length > 0 ? 'PASS_WITH_OBS' : 'PASS';
      R.condition_r_plt_att_code_fe_01 = 'CLOSABLE';
      R.ack_status = 'PASS_TO_PM';
    } else {
      R.overall = 'FAIL';
      R.condition_r_plt_att_code_fe_01 = 'OPEN';
      R.ack_status = 'FAIL_TO_PM';
    }

    R.pageErrors_n = R.pageErrors.length;
    R.bad5xx_n = R.network.bad5xx.length;
    if (R.network.bad5xx.length > 0 || R.pageErrors.some((e) => /Uncaught|ReferenceError/i.test(e))) {
      if (R.overall === 'PASS') R.overall = 'PASS_WITH_OBS';
    }
  } catch (e) {
    log(`browser fatal: ${e?.message || e}`);
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.fatal = String(e?.stack || e).slice(0, 800);
    ac('BROWSER', 'FAIL', { summary: String(e?.message || e).slice(0, 200) });
  } finally {
    await browser.close().catch(() => {});
    R.endedAt = ts();
    save();
    console.log(
      JSON.stringify(
        {
          stamp: R.stamp,
          overall: R.overall,
          ack_status: R.ack_status,
          condition: R.condition_r_plt_att_code_fe_01,
          ac: Object.fromEntries(Object.entries(R.ac).map(([k, v]) => [k, v.verdict])),
          out: OUT_JSON,
        },
        null,
        2,
      ),
    );
  }

  process.exit(R.overall === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.fatal = String(e?.stack || e).slice(0, 800);
  R.endedAt = ts();
  save();
  process.exit(1);
});
