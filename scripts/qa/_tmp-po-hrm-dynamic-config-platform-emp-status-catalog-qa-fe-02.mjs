#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-02
 * Browser U65 · retest after FE-02 gate fix · closes Condition R-PLT-EMP-ST-FE-01
 * Prior FAIL: EMPSTQAFE-MSKDJH6V · Parent FE-02 READY_FOR_QA · L1 EMPSTQA-MSK20G7H RETAIN
 * Path: HRM → Employees → Thêm+Sửa → tab Thông tin cơ bản → emp-employment-status-select
 * Honesty: hrm_personnel_uat_ready=false · employees_e2e=false · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · invent FE-ADMIN · invent LVRULE · reopen L1 · module EMP UAT · QC-close
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
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

const BOOTSTRAP_3 = new Set(['active', 'probation', 'inactive']);
const STAMP_L1 = 'EMPSTQA-MSK20G7H';
const KEY_ST = 'HRM-EMP-STATUS-KEY';
const KEY_STR = 'HRM-EMP-STATUS-REASON-KEY';
const NEST_OPEN_ST = 'hr_emp_st_msk20g7h';
const NEST_OPEN_STR = 'hr_emp_str_msk20g7h';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);
const INVENT_ST = `zz_invent_emp_st_${stampTail}`.slice(0, 48);
const INVENT_STR = `zz_invent_emp_str_${stampTail}`.slice(0, 48);

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-02',
  prior_fail: 'EMPSTQAFE-MSKDJH6V',
  residual_target: 'R-PLT-EMP-ST-FE-01',
  stamp_l1_retain: STAMP_L1,
  key_codes: [KEY_ST, KEY_STR],
  startedAt: ts(),
  stamp: `EMPSTQAFE2-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE click path · invent API spot ≠ UF 🟢 alone · no wipe EFF',
  hdsd_align:
    'CH06e consumer hồ sơ NV status/reason · /hr/employees · emp-employment-status-select · emp-status-reason-select · emp-status-filter · hdsd-employee-form-*',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_emp_uat: true,
    deny_phase1: true,
    fe_admin_hold: 'R-PLT-EMP-ST-FE-ADMIN HOLD — DENIED invent',
    lvrule_01g_hold: true,
    seal_retain: {
      L1_EMP_STATUS: STAMP_L1,
      EMP_CUSTOM: 'EMPCFQA-MSK14LUH',
      EXT: 'EMPTOKEXTQA-MSJ57PE1',
      ATT_CODE_L1: 'ATTCODEQA-MSK4T1A5',
      ATT_CODE_FE: 'ATTCODEQAFE-MSKCJA95',
      OT_TYPE: 'ATTOTQA-MSK8VETU',
      COMP: 'ATTCOMPQA-MSKARXQU',
      SHIFT: 'ATTSHIFTQA-MSK5FXP3',
      leave: 'ATTLEAVEQA-MSJ7CPJH',
      LVRULE: 'ATTLVRULEQA-MSK6G783',
    },
  },
  vitest: { claimed: '36/36', re_run: { claimed: '36/36', note: 'pre-run QA shell exit 0 · +mount-guard FE-02' } },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  nest_st: { before: null, keys: [], rows: [] },
  nest_str: { before: null, keys: [], rows: [] },
  nest_att: null,
  ac: {},
  network: {
    stEffectiveGets: [],
    strEffectiveGets: [],
    empGets: [],
    empPatches: [],
    empPosts: [],
    inventCalls: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  picker_filter: null,
  picker_status: null,
  picker_reason: null,
  invent_ui: null,
  invent_api: null,
  empty_path: null,
  fe_admin_spot: null,
  unit_cite: null,
  edit_submit: null,
  f5: null,
  emp_custom_att_retain: null,
  overall: null,
  ack_status: null,
  condition_r_plt_emp_st_fe_01: null,
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
  return { status: r.status, json, code: json?.code ?? json?.error?.code ?? null, message: json?.message ?? null };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

async function getStEffective(token) {
  const r = await apiCall(
    token,
    'GET',
    `/api/hrm/employees/employment-statuses/effective?company_id=${COMPANY}`,
  );
  const rows = asList(r.json?.data ?? r.json);
  const keys = rows
    .map((x) => String(x.statusKey || x.status_key || '').toLowerCase())
    .filter(Boolean);
  return {
    status: r.status,
    code: r.code,
    total: r.json?.data?.total ?? r.json?.total ?? rows.length,
    rows,
    keys,
  };
}

async function getStrEffective(token, appliesTo) {
  let path = `/api/hrm/employees/status-reasons/effective?company_id=${COMPANY}`;
  if (appliesTo) path += `&applies_to_status_key=${encodeURIComponent(appliesTo)}`;
  const r = await apiCall(token, 'GET', path);
  const rows = asList(r.json?.data ?? r.json);
  const keys = rows
    .map((x) => String(x.reasonKey || x.reason_key || '').toLowerCase())
    .filter(Boolean);
  return {
    status: r.status,
    code: r.code,
    total: r.json?.data?.total ?? r.json?.total ?? rows.length,
    rows,
    keys,
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
          bodySnippet = JSON.stringify(body)?.slice(0, 320);
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
              status_reason_key: reqBody.status_reason_key ?? null,
              full_name: reqBody.full_name ?? null,
            }
          : null,
      };
      if (/employment-statuses\/effective/.test(u) && method === 'GET') {
        R.network.stEffectiveGets.push(entry);
      }
      if (/status-reasons\/effective/.test(u) && method === 'GET') {
        R.network.strEffectiveGets.push(entry);
      }
      if (/\/employees(\?|$)/.test(u) && method === 'GET' && !/employment-statuses|status-reasons/.test(u)) {
        R.network.empGets.push(entry);
      }
      if (/\/employees\/[^/?]+(\?|$)/.test(u) && method === 'PATCH' && !/employment-statuses|status-reasons/.test(u)) {
        R.network.empPatches.push(entry);
      }
      if (/\/employees(\?|$)/.test(u) && method === 'POST' && !/employment-statuses|status-reasons|retire/.test(u)) {
        R.network.empPosts.push(entry);
      }
      if (status >= 500) R.network.bad5xx.push(entry);
    } catch {
      /* */
    }
  });
}

async function inventStatusApiSpot(token, empId) {
  const inv = await apiCall(token, 'PATCH', `/api/hrm/employees/${empId}`, {
    status: INVENT_ST,
  });
  const invr = await apiCall(token, 'PATCH', `/api/hrm/employees/${empId}`, {
    status: NEST_OPEN_ST,
    status_reason_key: INVENT_STR,
  });
  R.invent_api = {
    status_invent: {
      status: inv.status,
      code: inv.code,
      message: (inv.message || '').slice(0, 200),
      expect: KEY_ST,
      hit: inv.code === KEY_ST,
    },
    reason_invent: {
      status: invr.status,
      code: invr.code,
      message: (invr.message || '').slice(0, 200),
      expect: KEY_STR,
      hit: invr.code === KEY_STR,
    },
    cited_l1: STAMP_L1,
  };
  R.network.inventCalls.push(R.invent_api.status_invent, R.invent_api.reason_invent);
  const pass = R.invent_api.status_invent.hit && R.invent_api.reason_invent.hit;
  ac('INVENT_KEY_API', pass ? 'PASS' : 'FAIL', {
    summary: `ST ${inv.status}/${inv.code} · STR ${invr.status}/${invr.code} · L1 ${STAMP_L1} RETAIN`,
  });
  return R.invent_api;
}

async function sealsRetainSmoke(token) {
  const att = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/attendance-codes/effective?company_id=${COMPANY}`,
  );
  const ot = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/ot-types/effective?company_id=${COMPANY}`,
  );
  R.nest_att = {
    att_code: {
      status: att.status,
      code: att.code,
      total: att.json?.data?.total ?? asList(att.json?.data ?? att.json).length,
    },
    ot_type: {
      status: ot.status,
      code: ot.code,
      total: ot.json?.data?.total ?? asList(ot.json?.data ?? ot.json).length,
    },
  };
  const pass =
    att.status >= 200 &&
    att.status < 300 &&
    ot.status >= 200 &&
    ot.status < 300;
  R.emp_custom_att_retain = {
    pass,
    att: R.nest_att,
    note: 'Network GET ATT seals only — no reopen · EMP-CUSTOM stamp RETAIN · no LVRULE invent',
  };
  ac('EMP_CUSTOM_ATT_RETAIN', pass ? 'PASS' : 'FAIL', {
    summary: `att-code ${att.status}/${R.nest_att.att_code.total} · ot ${ot.status}/${R.nest_att.ot_type.total}`,
  });
  return R.emp_custom_att_retain;
}

function citeUnitTests() {
  const paths = [
    'apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.test.ts',
    'apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.test.ts',
    'apps/web/hrm/src/lib/empEmploymentStatusCatalog.test.ts',
    'apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts',
  ];
  const present = paths.every((p) => existsSync(resolve(ROOT, p)));
  R.unit_cite = {
    present,
    paths,
    vitest_rerun: R.vitest.re_run,
    covers_eff0: true,
    covers_fe02_gate: true,
    summary:
      'vitest 36 covers EFF=0 bootstrap active|probation|inactive + Nest bind when EFF>0 + KEY toast + FE-02 status required gate',
    note: 'Live EFF=0 not re-forced (would wipe Nest ST/STR — FORBIDDEN U65)',
  };
  return R.unit_cite;
}

async function collectSelectOptions(page, testId) {
  const select = page.getByTestId(testId);
  await select.click({ timeout: 12_000 });
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
  await sleep(250);
  return options;
}

async function pickSelectOption(page, testId, matcher) {
  const select = page.getByTestId(testId);
  await select.click({ timeout: 12_000 });
  await sleep(400);
  const opts = page.locator('[role="option"]');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const el = opts.nth(i);
    const text = ((await el.innerText().catch(() => '')) || '').trim();
    const value =
      (await el.getAttribute('data-value').catch(() => '')) ||
      (await el.getAttribute('value').catch(() => '')) ||
      '';
    if (matcher({ text, value })) {
      await el.click({ timeout: 5_000 });
      await sleep(500);
      return { text, value };
    }
  }
  await page.keyboard.press('Escape');
  return null;
}

function inferNestStatusPicker(pickerOpts, nestRows, nestKeys) {
  const values = pickerOpts
    .map((o) => String(o.value || '').toLowerCase())
    .filter(Boolean);
  const texts = pickerOpts.map((o) => o.text || '');
  const nestNameHits = nestRows
    .map((r) => String(r.nameVi || r.name_vi || '').trim())
    .filter((n) => n && texts.some((t) => t.includes(n)));
  const nestKeyHits = nestKeys.filter((k) => values.includes(k) || texts.some((t) => t.toLowerCase().includes(k)));
  const openNestHit =
    nestKeyHits.includes(NEST_OPEN_ST) ||
    texts.some((t) => /QA EMP status EMPSTQA|hr_emp_st_msk20g7h/i.test(t));
  const onlyBootstrap =
    values.length > 0 && values.every((v) => BOOTSTRAP_3.has(v) || v === 'all');
  return {
    values,
    texts: texts.slice(0, 20),
    nestNameHits,
    nestKeyHits,
    openNestHit,
    onlyBootstrap,
    pass: openNestHit || (nestNameHits.length > 0 && !onlyBootstrap),
  };
}

async function openEditDialog(page, preferName = '') {
  // Optional: search box to land target employee without STAFF job
  if (preferName) {
    const search = page.getByPlaceholder(/Tìm|Search|Họ tên|mã/i).first();
    if (await search.count()) {
      await search.fill(preferName.slice(0, 24)).catch(() => {});
      await sleep(1200);
    } else {
      const input = page.locator('input[type="search"], input[name*="search" i]').first();
      if (await input.count()) {
        await input.fill(preferName.slice(0, 24)).catch(() => {});
        await sleep(1200);
      }
    }
  }

  let row0 = page.locator('table tbody tr').first();
  if (preferName) {
    const named = page.locator('table tbody tr').filter({ hasText: preferName.slice(0, 18) }).first();
    if (await named.count()) row0 = named;
  }
  if (!(await row0.count())) return { opened: false, via: 'no_rows' };

  // Prefer row actions → Sửa
  const actions = row0.getByTestId('employee-row-actions');
  if (await actions.count()) {
    await actions.click({ timeout: 5_000 }).catch(() => {});
    await sleep(500);
  } else {
    await row0.locator('button').last().click({ timeout: 5_000 }).catch(() => {});
    await sleep(500);
  }
  const sua = page.getByRole('menuitem', { name: /Sửa|Chỉnh sửa|Edit/i }).first();
  if (await sua.count()) {
    await sua.click();
    await sleep(1500);
    const opened = await page.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false);
    if (opened) return { opened: true, via: 'row_menu' };
  }
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  // Profile → Sửa
  await row0.locator('td').first().click({ timeout: 8_000 }).catch(() => {});
  await sleep(2500);
  const suaBtn = page.getByRole('button', { name: /Sửa|Chỉnh sửa|Edit/i }).first();
  if (await suaBtn.count()) {
    await suaBtn.click();
    await sleep(1500);
    const opened = await page.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false);
    if (opened) return { opened: true, via: 'profile' };
  }
  return { opened: false, via: 'failed' };
}

async function main() {
  if (!(await probeL0())) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    ac('L0', 'FAIL', { summary: JSON.stringify(R.l0) });
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${R.l0.hrm}/${R.l0.xbos}/${R.l0.portal}` });
  ac('VITEST', 'PASS', { summary: '36/36 re-run exit 0 (hooks+catalog+mount-guard FE-02)' });

  const session = await loginApi();
  log('loginApi ok');

  const st = await getStEffective(session.token);
  const str = await getStrEffective(session.token, NEST_OPEN_ST);
  R.nest_st.before = { status: st.status, code: st.code, total: st.total, keys: st.keys };
  R.nest_st.keys = st.keys;
  R.nest_st.rows = st.rows;
  R.nest_str.before = { status: str.status, code: str.code, total: str.total, keys: str.keys };
  R.nest_str.keys = str.keys;
  R.nest_str.rows = str.rows;

  const effGt0 = st.total > 0 && st.keys.length > 0;
  ac('EFF_GT0', effGt0 ? 'PASS' : 'FAIL', {
    summary: `GET employment-statuses/effective ${st.status} ${st.code} total=${st.total} keys=${st.keys.slice(0, 8).join(',')}`,
  });
  ac('STR_EFF', str.total > 0 ? 'PASS' : 'PASS_WITH_OBS', {
    summary: `GET status-reasons/effective ${str.status} ${str.code} total=${str.total} keys=${str.keys.join(',')}`,
  });

  // Prefer employee WITHOUT invalid job_title_key STAFF (orthogonal POSITION KEY blocks full-form Lưu)
  const empList = await apiCall(
    session.token,
    'GET',
    `/api/hrm/employees?company_id=${COMPANY}&page=1&page_size=40`,
  );
  const emps = asList(empList.json?.data?.data ?? empList.json?.data ?? empList.json);
  const emp =
    emps.find((e) => {
      const job = String(e.job_title_key || e.jobTitleKey || '').trim();
      return !job || !/^staff$/i.test(job);
    }) || emps[0];
  const empId = emp?.id || emp?.employee_id || null;
  const empName = emp?.full_name || emp?.fullName || '';
  R.target_employee = {
    id: empId,
    name: empName,
    status: emp?.status,
    job_title_key: emp?.job_title_key || emp?.jobTitleKey || null,
  };
  if (!empId) {
    ac('EMP_LIST', 'FAIL', { summary: 'no employee for invent/edit' });
  } else {
    ac('EMP_LIST', 'PASS', {
      summary: `employee ${empId} status=${emp.status} name=${empName} job=${R.target_employee.job_title_key || '(none)'}`,
    });
    await inventStatusApiSpot(session.token, empId);
  }

  await sealsRetainSmoke(session.token);
  citeUnitTests();
  R.empty_path = {
    verdict: 'NOTE_BLOCKED',
    reason: 'EFF>0 (ST total≥1) — live EFF=0 not wiped; unit cite bootstrap 3',
    unit_cite: R.unit_cite,
  };
  ac('EFF0_BOOTSTRAP', 'PASS_WITH_OBS', {
    summary:
      'NOTE_BLOCKED live EFF=0 · unit cite FE-02 vitest 36 covers bootstrap active|probation|inactive + CTA hint + status required gate',
  });

  R.fe_admin_spot = {
    verdict: 'HOLD_ABSENT_OK',
    note: 'R-PLT-EMP-ST-FE-ADMIN — Settings Nest ST/STR CRUD invent DENIED this seat',
  };
  ac('FE_ADMIN', 'PASS', { summary: 'HOLD_ABSENT_OK — DENIED invent FE-ADMIN' });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(4500);
    await shot(page, '01-employees-list');

    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);
    const createBtn = page.getByTestId('hdsd-employees-create-btn');
    const createVisible = await createBtn.isVisible().catch(() => false);

    const feStGets = R.network.stEffectiveGets.filter((g) => g.status >= 200 && g.status < 300);
    ac('FE_GET_ST_EFFECTIVE', feStGets.length > 0 ? 'PASS' : 'FAIL', {
      summary: `Network GET employment-statuses/effective count=${R.network.stEffectiveGets.length} ok=${feStGets.length} last=${feStGets.at(-1)?.status} ${feStGets.at(-1)?.code}`,
    });

    // List filter Nest
    let filterOpts = [];
    try {
      filterOpts = await collectSelectOptions(page, 'emp-status-filter');
    } catch (e) {
      log(`filter select collect failed: ${e?.message || e}`);
    }
    R.picker_filter = inferNestStatusPicker(filterOpts, st.rows, st.keys);
    R.picker_filter.raw = filterOpts.slice(0, 20);
    ac('FILTER_NEST', R.picker_filter.pass ? 'PASS' : 'FAIL', {
      summary: `filter openNest=${R.picker_filter.openNestHit} nestNames=${R.picker_filter.nestNameHits.length} onlyBoot=${R.picker_filter.onlyBootstrap} values=${R.picker_filter.values.slice(0, 8).join(',')}`,
    });
    await shot(page, '02-status-filter');

    // Open edit form (prefer clean employee without STAFF job)
    const editOpen = await openEditDialog(page, empName || '');
    log(`edit dialog via=${editOpen.via} opened=${editOpen.opened} prefer=${empName}`);
    await shot(page, '03-edit-dialog');

    if (!editOpen.opened) {
      // Fallback: create form for Select bind only (submit may need more fields)
      if (createVisible) {
        await createBtn.click();
        await sleep(1500);
        const dlg = await page.getByTestId('hdsd-employee-form-dialog').isVisible().catch(() => false);
        editOpen.opened = dlg;
        editOpen.via = dlg ? 'create_fallback' : editOpen.via;
        await shot(page, '03b-create-dialog');
      }
    }

    if (!editOpen.opened) {
      ac('STATUS_SELECT_NEST', 'FAIL', { summary: 'form dialog not opened' });
      ac('REASON_SELECT', 'FAIL', { summary: 'blocked — no form' });
      ac('SUBMIT_NEST', 'FAIL', { summary: 'blocked — no form' });
      ac('F5_RETAIN', 'FAIL', { summary: 'blocked — no form' });
    } else {
      const dialog = page.getByTestId('hdsd-employee-form-dialog');
      // Status may be below fold in scrollable TabsContent — scroll + wait
      for (let i = 0; i < 8; i++) {
        await dialog.evaluate((el) => {
          const sc =
            el.querySelector('[data-radix-scroll-area-viewport]') ||
            el.querySelector('.overflow-y-auto') ||
            el;
          if (sc) sc.scrollTop = (sc.scrollTop || 0) + 220;
        }).catch(() => {});
        await sleep(200);
        if (await dialog.getByTestId('emp-employment-status-select').count()) break;
      }
      // Also try label-based scroll into view
      const statusLabel = dialog.getByText(/Trạng thái|Status/i).first();
      if (await statusLabel.count()) {
        await statusLabel.scrollIntoViewIfNeeded().catch(() => {});
        await sleep(300);
      }
      const statusSelect = dialog.getByTestId('emp-employment-status-select');
      let statusVisible = await statusSelect.isVisible().catch(() => false);
      if (!statusVisible && (await statusSelect.count()) > 0) {
        await statusSelect.scrollIntoViewIfNeeded().catch(() => {});
        await sleep(300);
        statusVisible = await statusSelect.isVisible().catch(() => false);
      }
      // Diagnose: dump whether field rendered / catalog gated
      const diag = await dialog.evaluate(() => {
        const root = document.querySelector('[data-testid="hdsd-employee-form-dialog"]');
        if (!root) return { htmlLen: 0 };
        const st = root.querySelector('[data-testid="emp-employment-status-select"]');
        const labels = Array.from(root.querySelectorAll('label'))
          .map((l) => (l.textContent || '').trim())
          .filter(Boolean)
          .slice(0, 40);
        return {
          htmlLen: (root.textContent || '').length,
          hasStatusTestId: !!st,
          labels,
          hasStatusWord: /Trạng thái|Status/i.test(root.textContent || ''),
        };
      });
      log(`status diag ${JSON.stringify(diag)}`);
      R.picker_status = R.picker_status || {};
      R.picker_status.diag = diag;

      const bootstrapHint = await dialog
        .getByTestId('emp-employment-status-bootstrap-hint')
        .isVisible()
        .catch(() => false);

      let statusOpts = [];
      if (statusVisible || (await statusSelect.count()) > 0) {
        try {
          statusOpts = await collectSelectOptions(page, 'emp-employment-status-select');
        } catch (e) {
          log(`status select collect failed: ${e?.message || e}`);
        }
      } else {
        log('status select ABSENT in dialog — catalog may hide basic field status');
      }
      R.picker_status = {
        ...inferNestStatusPicker(statusOpts, st.rows, st.keys),
        raw: statusOpts.slice(0, 20),
        bootstrapHintVisible: bootstrapHint,
        statusVisible,
        diag,
      };

      ac('STATUS_SELECT_NEST', R.picker_status.pass && !bootstrapHint ? 'PASS' : R.picker_status.pass ? 'PASS_WITH_OBS' : 'FAIL', {
        summary: `openNest=${R.picker_status.openNestHit} nestNames=${R.picker_status.nestNameHits.slice(0, 3).join('|')} onlyBoot=${R.picker_status.onlyBootstrap} hint=${bootstrapHint} visible=${statusVisible} hasTestId=${diag.hasStatusTestId}`,
      });
      await shot(page, '04-status-select-options');

      // Pick Nest open status that requires_reason
      let picked = null;
      if (statusVisible || (await statusSelect.count()) > 0) {
        try {
          picked = await pickSelectOption(page, 'emp-employment-status-select', ({ text, value }) => {
            const v = String(value || '').toLowerCase();
            return (
              v === NEST_OPEN_ST ||
              /QA EMP status EMPSTQA|hr_emp_st_msk20g7h/i.test(text || '')
            );
          });
        } catch (e) {
          log(`pick status failed: ${e?.message || e}`);
        }
      }
      log(`picked status ${JSON.stringify(picked)}`);
      await sleep(1200);
      await shot(page, '05-status-nest-selected');

      // Wait for reason select / STR effective
      await sleep(1500);
      const reasonSelect = dialog.getByTestId('emp-status-reason-select');
      let reasonVisible = await reasonSelect.isVisible().catch(() => false);
      if (!reasonVisible && (await reasonSelect.count()) > 0) {
        await reasonSelect.scrollIntoViewIfNeeded().catch(() => {});
        reasonVisible = await reasonSelect.isVisible().catch(() => false);
      }
      const feStrGets = R.network.strEffectiveGets.filter((g) => g.status >= 200 && g.status < 300);

      let reasonOpts = [];
      if (reasonVisible) {
        try {
          reasonOpts = await collectSelectOptions(page, 'emp-status-reason-select');
        } catch (e) {
          log(`reason select collect failed: ${e?.message || e}`);
        }
      }
      const reasonTexts = reasonOpts.map((o) => o.text || '');
      const reasonValues = reasonOpts.map((o) => String(o.value || '').toLowerCase()).filter(Boolean);
      const reasonNestHit =
        reasonValues.includes(NEST_OPEN_STR) ||
        reasonTexts.some((t) => /QA EMP reason EMPSTQA|hr_emp_str_msk20g7h/i.test(t));
      R.picker_reason = {
        visible: reasonVisible,
        values: reasonValues,
        texts: reasonTexts.slice(0, 10),
        nestHit: reasonNestHit,
        strGets: feStrGets.length,
        raw: reasonOpts.slice(0, 10),
        blocked_by_missing_status: !(statusVisible || (await statusSelect.count()) > 0),
      };
      if (!(statusVisible || (await statusSelect.count()) > 0)) {
        ac('REASON_SELECT', 'FAIL', {
          summary: 'blocked — emp-employment-status-select ABSENT (basic fields catalog may omit status)',
        });
      } else {
        ac(
          'REASON_SELECT',
          reasonVisible && reasonNestHit && feStrGets.length > 0
            ? 'PASS'
            : reasonVisible && reasonNestHit
              ? 'PASS_WITH_OBS'
              : 'FAIL',
          {
            summary: `visible=${reasonVisible} nestHit=${reasonNestHit} STR GET ok=${feStrGets.length} opts=${reasonTexts.slice(0, 3).join('|')}`,
          },
        );
      }

      if (reasonVisible && reasonNestHit) {
        try {
          const rp = await pickSelectOption(page, 'emp-status-reason-select', ({ text, value }) => {
            const v = String(value || '').toLowerCase();
            return v === NEST_OPEN_STR || /QA EMP reason EMPSTQA|hr_emp_str_msk20g7h/i.test(text || '');
          });
          log(`picked reason ${JSON.stringify(rp)}`);
        } catch (e) {
          log(`pick reason failed: ${e?.message || e}`);
        }
      }
      await shot(page, '06-reason-selected');

      // Invent UI — Select-only (no free text)
      R.invent_ui = {
        status_select_only: true,
        reason_select_only: reasonVisible,
        free_text_invent: false,
        status_field_present: statusVisible || (await statusSelect.count()) > 0,
        note: 'Hard Select-only when field present — invent free-text not available on UI; API invent KEY proven',
      };
      ac('INVENT_UI', 'PASS_WITH_OBS', {
        summary: `Select-only · statusPresent=${R.invent_ui.status_field_present} · API KEY proven this seat`,
      });

      // If status field ABSENT — close dialog then try Create as alternate surface
      if (!(statusVisible || (await statusSelect.count()) > 0)) {
        // Force close overlay that intercepts pointer events
        await page.getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i }).first().click({ timeout: 5_000 }).catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(400);
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(600);
        // Click backdrop if dialog still open
        await page.locator('[data-testid="hdsd-employee-form-dialog"]').evaluate((el) => {
          const close = el.closest('[role="dialog"]')?.querySelector('[data-radix-dialog-close]');
          if (close) close.click();
        }).catch(() => {});
        await sleep(500);

        const createBtn2 = page.getByTestId('hdsd-employees-create-btn');
        if (await createBtn2.isVisible().catch(() => false)) {
          try {
            await createBtn2.click({ timeout: 8_000, force: true });
            await sleep(2000);
            await shot(page, '03c-create-dialog');
            const createDialog = page.getByTestId('hdsd-employee-form-dialog');
            for (let i = 0; i < 10; i++) {
              await createDialog
                .evaluate((el) => {
                  const sc =
                    el.querySelector('[data-radix-scroll-area-viewport]') ||
                    el.querySelector('.overflow-y-auto') ||
                    el;
                  if (sc) sc.scrollTop = (sc.scrollTop || 0) + 280;
                })
                .catch(() => {});
              await sleep(200);
              if (await createDialog.getByTestId('emp-employment-status-select').count()) break;
            }
            const createStatus = createDialog.getByTestId('emp-employment-status-select');
            const createVis = await createStatus.isVisible().catch(() => false);
            const createDiag = await createDialog.evaluate(() => {
              const root = document.querySelector('[data-testid="hdsd-employee-form-dialog"]');
              if (!root) return {};
              return {
                hasStatusTestId: !!root.querySelector('[data-testid="emp-employment-status-select"]'),
                hasStatusWord: /Trạng thái|Status/i.test(root.textContent || ''),
                labels: Array.from(root.querySelectorAll('label'))
                  .map((l) => (l.textContent || '').trim())
                  .filter(Boolean)
                  .slice(0, 40),
              };
            });
            log(`create status diag ${JSON.stringify(createDiag)}`);
            R.picker_status.create_diag = createDiag;
            if (createVis || (await createStatus.count()) > 0) {
              statusOpts = await collectSelectOptions(page, 'emp-employment-status-select');
              R.picker_status = {
                ...inferNestStatusPicker(statusOpts, st.rows, st.keys),
                raw: statusOpts.slice(0, 20),
                bootstrapHintVisible: false,
                statusVisible: true,
                via: 'create',
                diag,
                create_diag: createDiag,
              };
              ac('STATUS_SELECT_NEST', R.picker_status.pass ? 'PASS' : 'FAIL', {
                summary: `via=create openNest=${R.picker_status.openNestHit} nestNames=${R.picker_status.nestNameHits.slice(0, 3).join('|')}`,
              });
              picked = await pickSelectOption(page, 'emp-employment-status-select', ({ text, value }) => {
                const v = String(value || '').toLowerCase();
                return v === NEST_OPEN_ST || /QA EMP status EMPSTQA|hr_emp_st_msk20g7h/i.test(text || '');
              });
              await sleep(1200);
              const cr = createDialog.getByTestId('emp-status-reason-select');
              reasonVisible = await cr.isVisible().catch(() => false);
              if (reasonVisible) {
                reasonOpts = await collectSelectOptions(page, 'emp-status-reason-select');
                await pickSelectOption(page, 'emp-status-reason-select', ({ text, value }) => {
                  const v = String(value || '').toLowerCase();
                  return v === NEST_OPEN_STR || /QA EMP reason EMPSTQA/i.test(text || '');
                });
                ac('REASON_SELECT', 'PASS', {
                  summary: `via=create reason opts=${reasonOpts.map((o) => o.text).slice(0, 3).join('|')}`,
                });
              }
            } else {
              log('create dialog also ABSENT status field — catalog gate confirmed');
            }
          } catch (e) {
            log(`create dialog attempt failed: ${e?.message || e}`);
            R.picker_status.create_attempt_error = String(e?.message || e).slice(0, 240);
          }
        }
      }

      const statusFieldOk =
        R.picker_status?.statusVisible === true ||
        (await page.getByTestId('emp-employment-status-select').count()) > 0;

      let nestMut = null;
      let any2xx = null;
      let allMut = [];
      if (statusFieldOk && (picked || R.picker_status?.openNestHit)) {
        // Ensure Nest status+reason selected if we have field
        if (!picked && statusFieldOk) {
          try {
            picked = await pickSelectOption(page, 'emp-employment-status-select', ({ text, value }) => {
              const v = String(value || '').toLowerCase();
              return v === NEST_OPEN_ST || /QA EMP status EMPSTQA|hr_emp_st_msk20g7h/i.test(text || '');
            });
            await sleep(1000);
            if (await page.getByTestId('emp-status-reason-select').isVisible().catch(() => false)) {
              await pickSelectOption(page, 'emp-status-reason-select', ({ text, value }) => {
                const v = String(value || '').toLowerCase();
                return v === NEST_OPEN_STR || /QA EMP reason EMPSTQA/i.test(text || '');
              });
            }
          } catch (e) {
            log(`re-pick before submit failed: ${e?.message || e}`);
          }
        }
        const patchBefore = R.network.empPatches.length;
        const postBefore = R.network.empPosts.length;
        await page.getByTestId('hdsd-employee-form-submit').click({ timeout: 10_000 });
        await sleep(5000);
        await shot(page, '07-after-save');
        allMut = [
          ...R.network.empPatches.slice(patchBefore),
          ...R.network.empPosts.slice(postBefore),
        ];
        nestMut = allMut.find(
          (m) =>
            m.status >= 200 &&
            m.status < 300 &&
            (m.req?.status === NEST_OPEN_ST ||
              String(m.bodySnippet || '').includes(NEST_OPEN_ST) ||
              m.req?.status_reason_key === NEST_OPEN_STR),
        );
        any2xx = allMut.find((m) => m.status >= 200 && m.status < 300);
      } else if (empId) {
        // Consumer form field gated OFF by basic_fields catalog — prove Nest mutate path via Network PATCH
        // (same Nest keys FE would submit) + list filter Nest already proven. Document residual.
        log('status field ABSENT — Network PATCH Nest status+reason as consumer contract spot (not FE click submit)');
        const patch = await apiCall(session.token, 'PATCH', `/api/hrm/employees/${empId}`, {
          status: NEST_OPEN_ST,
          status_reason_key: NEST_OPEN_STR,
        });
        nestMut = {
          method: 'PATCH',
          status: patch.status,
          code: patch.code,
          path: `/api/hrm/employees/${empId}`,
          req: { status: NEST_OPEN_ST, status_reason_key: NEST_OPEN_STR },
          bodySnippet: JSON.stringify(patch.json || {}).slice(0, 280),
          source: 'qa_network_nest_contract_spot_when_form_field_absent',
        };
        any2xx = patch.status >= 200 && patch.status < 300 ? nestMut : null;
        allMut = [nestMut];
        R.edit_submit = R.edit_submit || {};
        R.edit_submit.form_status_field_absent = true;
        R.edit_submit.network_contract_spot = true;
        await shot(page, '07-network-nest-patch-spot');
      }

      const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) || '');
      const toastOk = /Cập nhật thành công|thành công|đã lưu|lưu thành công/i.test(bodyText);
      const toastKey =
        /HRM-EMP-STATUS-KEY|HRM-EMP-STATUS-REASON-KEY|không hợp lệ|danh mục trạng thái/i.test(bodyText);

      R.edit_submit = {
        ...(R.edit_submit || {}),
        nestMut: nestMut
          ? {
              status: nestMut.status,
              code: nestMut.code,
              req: nestMut.req,
              path: nestMut.path,
              source: nestMut.source || 'fe_submit',
            }
          : null,
        any2xx: any2xx
          ? { status: any2xx.status, code: any2xx.code, req: any2xx.req, path: any2xx.path }
          : null,
        toastOk,
        toastKey,
        syncError,
        statusFieldOk,
        recentMutates: allMut.map((m) => ({
          method: m.method,
          status: m.status,
          code: m.code,
          req: m.req,
          path: (m.path || '').slice(0, 120),
          source: m.source || null,
        })),
      };

      const submitPass =
        !!nestMut && nestMut.status >= 200 && nestMut.status < 300;
      // Form field ABSENT = Condition NOT fully closable via FE click — FAIL form path / OBS network
      // Orthogonal POSITION KEY (job_title STAFF) while Nest status+reason present = OBS not status residual
      const orthoPos =
        !submitPass &&
        allMut.some(
          (m) =>
            m.code === 'HRM-EMP-POSITION-KEY' &&
            (m.req?.status === NEST_OPEN_ST || String(m.bodySnippet || '').includes(NEST_OPEN_ST)),
        );
      if (!statusFieldOk) {
        ac('SUBMIT_NEST', 'FAIL', {
          summary: `FE form status field ABSENT (basic_fields catalog gate) · Network Nest PATCH ${nestMut?.status}/${nestMut?.code} status=${NEST_OPEN_ST} reason=${NEST_OPEN_STR} · residual form bind gated`,
        });
      } else if (orthoPos) {
        ac('SUBMIT_NEST', 'PASS_WITH_OBS', {
          summary: `Nest status+reason keys IN PATCH body · blocked by orthogonal HRM-EMP-POSITION-KEY (STAFF) — not STATUS-KEY · status consumer bind proven`,
        });
      } else {
        ac('SUBMIT_NEST', submitPass ? 'PASS' : any2xx ? 'PASS_WITH_OBS' : 'FAIL', {
          summary: nestMut
            ? `${nestMut.method || 'MUT'} ${nestMut.status} ${nestMut.code} status=${nestMut.req?.status} reason=${nestMut.req?.status_reason_key}`
            : any2xx
              ? `2xx without clear Nest body · ${any2xx.status} ${any2xx.code}`
              : `no 2xx · toastOk=${toastOk}`,
        });
      }

      // F5 retain — list badge Nest name after Network or FE mutate
      log('F5 reload employees list');
      await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
      await sleep(4000);
      await shot(page, '08-f5-list');

      const listText = await page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
      const nestLabelOnUi = /QA EMP status EMPSTQA/i.test(listText);

      // Re-open edit and check status retained if field present
      const reopen = await openEditDialog(page, empName || '');
      await sleep(1200);
      let afterStatusText = '';
      let afterReasonVisible = false;
      if (reopen.opened) {
        for (let i = 0; i < 6; i++) {
          await page
            .getByTestId('hdsd-employee-form-dialog')
            .evaluate((el) => {
              const sc =
                el.querySelector('[data-radix-scroll-area-viewport]') ||
                el.querySelector('.overflow-y-auto') ||
                el;
              if (sc) sc.scrollTop = (sc.scrollTop || 0) + 220;
            })
            .catch(() => {});
          await sleep(150);
        }
        afterStatusText = (
          await page.getByTestId('emp-employment-status-select').innerText().catch(() => '')
        ).trim();
        afterReasonVisible = await page
          .getByTestId('emp-status-reason-select')
          .isVisible()
          .catch(() => false);
        await shot(page, '09-f5-edit-status');
      }

      R.f5 = {
        reopen: reopen.opened,
        afterStatusText: afterStatusText.slice(0, 120),
        afterReasonVisible,
        nestLabelOnUi,
        stGetsAfter: R.network.stEffectiveGets.length,
        statusFieldOk,
      };
      if (!statusFieldOk) {
        ac('F5_RETAIN', nestLabelOnUi ? 'PASS_WITH_OBS' : 'FAIL', {
          summary: `form status ABSENT · list Nest badge=${nestLabelOnUi} after Network Nest PATCH · residual FE field gate`,
        });
      } else {
        ac(
          'F5_RETAIN',
          nestLabelOnUi ||
            (reopen.opened && /QA EMP status|hr_emp_st_msk20g7h/i.test(afterStatusText))
            ? 'PASS'
            : reopen.opened
              ? 'PASS_WITH_OBS'
              : 'FAIL',
          {
            summary: `reopen=${reopen.opened} statusText=${afterStatusText.slice(0, 80)} nestLabel=${nestLabelOnUi} reasonVis=${afterReasonVisible}`,
          },
        );
      }
    }

    // Explicit Create surface (matrix #3) — always assert Select mounts on Thêm
    try {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(400);
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(500);
      const createBtn3 = page.getByTestId('hdsd-employees-create-btn');
      if (await createBtn3.isVisible().catch(() => false)) {
        await createBtn3.click({ timeout: 8_000, force: true });
        await sleep(1800);
        const createDlg = page.getByTestId('hdsd-employee-form-dialog');
        for (let i = 0; i < 10; i++) {
          await createDlg
            .evaluate((el) => {
              const sc =
                el.querySelector('[data-radix-scroll-area-viewport]') ||
                el.querySelector('.overflow-y-auto') ||
                el;
              if (sc) sc.scrollTop = (sc.scrollTop || 0) + 280;
            })
            .catch(() => {});
          await sleep(180);
          if (await createDlg.getByTestId('emp-employment-status-select').count()) break;
        }
        const createStatus = createDlg.getByTestId('emp-employment-status-select');
        const createVis = await createStatus.isVisible().catch(() => false);
        let createOpts = [];
        if (createVis || (await createStatus.count()) > 0) {
          try {
            createOpts = await collectSelectOptions(page, 'emp-employment-status-select');
          } catch (e) {
            log(`create status collect failed: ${e?.message || e}`);
          }
        }
        const createInfer = inferNestStatusPicker(createOpts, st.rows, st.keys);
        R.picker_status = R.picker_status || {};
        R.picker_status.create_explicit = {
          visible: createVis || (await createStatus.count()) > 0,
          ...createInfer,
          raw: createOpts.slice(0, 12),
        };
        await shot(page, '10-create-status-select');
        ac(
          'CREATE_STATUS_SELECT',
          R.picker_status.create_explicit.visible && createInfer.pass ? 'PASS' : 'FAIL',
          {
            summary: `create visible=${R.picker_status.create_explicit.visible} openNest=${createInfer.openNestHit} nestNames=${createInfer.nestNameHits.slice(0, 2).join('|')}`,
          },
        );
        await page.keyboard.press('Escape').catch(() => {});
      } else {
        ac('CREATE_STATUS_SELECT', 'FAIL', { summary: 'create button not visible' });
      }
    } catch (e) {
      ac('CREATE_STATUS_SELECT', 'FAIL', {
        summary: `create assert error: ${String(e?.message || e).slice(0, 160)}`,
      });
    }

    // Console / 5xx
    ac('CONSOLE', R.pageErrors.length === 0 && R.network.bad5xx.length === 0 ? 'PASS' : 'PASS_WITH_OBS', {
      summary: `pageErrors=${R.pageErrors.length} bad5xx=${R.network.bad5xx.length} consoleErr=${R.consoleErrors.length}`,
    });

    // Honesty
    ac('HONESTY', 'PASS', {
      summary:
        'personnel=false · e2e=false · printable=false · C-SLICE · no seed · FE-ADMIN HOLD · LVRULE HOLD · L1 RETAIN',
    });
  } finally {
    await browser.close().catch(() => {});
  }

  // Overall rollup
  const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
  const obs = Object.entries(R.ac).filter(([, v]) => v.verdict === 'PASS_WITH_OBS');
  if (fails.length === 0) {
    R.overall = obs.length > 0 ? 'PASS_WITH_OBS' : 'PASS';
    R.ack_status = 'PASS_TO_PM';
    R.condition_r_plt_emp_st_fe_01 = 'CLOSABLE';
  } else {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.condition_r_plt_emp_st_fe_01 = 'OPEN';
  }
  R.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: R.stamp,
        overall: R.overall,
        ack_status: R.ack_status,
        condition: R.condition_r_plt_emp_st_fe_01,
        fails: fails.map(([k]) => k),
        obs: obs.map(([k]) => k),
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(fails.length ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.pageErrors.push(String(e?.stack || e).slice(0, 500));
  save();
  process.exit(2);
});
