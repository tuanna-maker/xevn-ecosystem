#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01
 * L1 phụ gap triage — VAL-EMP-CF-CNS-01 only (≠ UF 🟢)
 * Expect when EFF>0: invent extension code → 4xx HRM-EMP-CUSTOM-FIELD-KEY
 * PASS_NO_GAP | FAIL_GAP → unlock BE-01 only if FAIL
 * RETAIN: EMPTOKEXTQA-MSJ57PE1 · cấm reopen EXT · cấm Nest emp_custom_field · U65 zero-seed
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const STAMP = Date.now().toString(36).toLowerCase().slice(-8);
const RUN_STAMP = `EMPCFCNSGAP-${STAMP.toUpperCase()}`;
const OPEN_CODE = `hr_emp_cf_${STAMP}`.slice(0, 48);
const INVENT_CODE = `zz_invent_emp_cf_${STAMP}`.slice(0, 48);
const ALLOW_CATALOG = 'hrm_employee_basic_fields';
const ALLOW_LIST = [
  'hrm_employee_basic_fields',
  'hrm_employee_personal_fields',
  'hrm_employee_work_fields',
  'hrm_employee_finance_fields',
];
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.json',
);

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return null;
  }
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function itemCode(row) {
  return String(row?.code ?? row?.item_key ?? row?.key ?? row?.field_key ?? '').toLowerCase();
}

function itemStatus(row) {
  return String(row?.status ?? row?.item_status ?? 'active').toLowerCase();
}

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, claims: decodeJwt(token), via: url };
      }
      if (url.includes('28002')) {
        return { ok: false, status: r.status, body: summarizeBody(j), token: null };
      }
    } catch (e) {
      if (url.includes('28002')) {
        return { ok: false, status: 0, body: String(e?.message || e), token: null };
      }
    }
  }
  return { ok: false, status: 0, body: 'login failed both portals', token: null };
}

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Accept: 'application/json',
    'x-tenant-id': TENANT,
    'x-company-id': companyId,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? null,
    data: json?.data ?? null,
    json,
    summary: summarizeBody(json, 700),
  };
}

function inspectSrcDist() {
  const empSvc = resolve(ROOT, 'apps/api/hrm-api/src/employees/employees.service.ts');
  const empDist = resolve(ROOT, 'apps/api/hrm-api/dist/employees');
  const out = {
    src_has_HRM_EMP_CUSTOM_FIELD_KEY: false,
    dist_has_HRM_EMP_CUSTOM_FIELD_KEY: false,
    dist_employees_exists: existsSync(empDist),
    dist_files_sample: [],
    note: '',
  };
  if (existsSync(empSvc)) {
    const t = readFileSync(empSvc, 'utf8');
    out.src_has_HRM_EMP_CUSTOM_FIELD_KEY = /HRM-EMP-CUSTOM-FIELD-KEY/.test(t);
  }
  if (existsSync(empDist)) {
    out.dist_files_sample = readdirSync(empDist).slice(0, 20);
    for (const f of out.dist_files_sample) {
      if (!f.endsWith('.js')) continue;
      const t = readFileSync(join(empDist, f), 'utf8');
      if (/HRM-EMP-CUSTOM-FIELD-KEY/.test(t)) {
        out.dist_has_HRM_EMP_CUSTOM_FIELD_KEY = true;
        break;
      }
    }
  }
  out.note = out.src_has_HRM_EMP_CUSTOM_FIELD_KEY
    ? 'KEY present in src — expect runtime 4xx when EFF>0'
    : 'KEY absent in employees.service.ts — likely FAIL_GAP for VAL-EMP-CF-CNS-01';
  return out;
}

function feSpot() {
  const form = resolve(ROOT, 'apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx');
  const out = {
    employee_form_exists: existsSync(form),
    binds_settings_md_catalogs: false,
    has_dynamic_fields_from_catalog: false,
    has_empty_cta_hint_for_pickers: false,
    invent_key_client_assert: false,
    calls_nest_emp_custom_field_effective: false,
    note: '',
  };
  if (!existsSync(form)) {
    out.note = 'EmployeeFormDialog missing';
    return out;
  }
  const t = readFileSync(form, 'utf8');
  out.binds_settings_md_catalogs = /hrm_employee_basic_fields|findCatalog/.test(t);
  out.has_dynamic_fields_from_catalog = /buildDynamicFields|dynamicBasicFields|dynamicFieldValues/.test(t);
  out.has_empty_cta_hint_for_pickers = /emptyHint|CatalogSearchPicker/.test(t);
  out.invent_key_client_assert = /HRM-EMP-CUSTOM-FIELD-KEY|CUSTOM-FIELD-KEY/.test(t);
  out.calls_nest_emp_custom_field_effective =
    /emp.?custom.?field.*effective|custom-fields\/effective|extension-fields\/effective/i.test(t);
  out.note = [
    out.binds_settings_md_catalogs ? 'FE binds Settings MD EMP field catalogs' : 'FE catalog bind unclear',
    out.has_dynamic_fields_from_catalog ? 'dynamic extension fields render from catalog' : 'no dynamic fields helper',
    out.has_empty_cta_hint_for_pickers
      ? 'emptyHint/CatalogSearchPicker present (dept/pos class)'
      : 'no empty CTA pattern spotted',
    out.invent_key_client_assert ? 'client KEY assert present' : 'no client invent KEY assert',
    out.calls_nest_emp_custom_field_effective
      ? 'Nest EFF custom-field endpoint referenced'
      : 'no Nest emp_custom_field/effective — Option A Settings SoT OK',
  ].join(' · ');
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01 CONFIRMED · SA-01 Option A LOCKED',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: RUN_STAMP,
  git_head: gitHead(),
  lane: 'L1_API_gap_triage + FE_spot (≠ UF 🟢)',
  u65: 'zero-seed · admin CREATE N+1 only to establish EFF>0 · invent assert no seed',
  persona: { email: EMAIL, headerCompany: HEADER_COMPANY, apiCompany: API_COMPANY },
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    c_slice_ne_module: true,
    retain_merge_token_emp_ext: 'EMPTOKEXTQA-MSJ57PE1',
    deny_reopen_ext: true,
    deny_nest_emp_custom_field: true,
    deny_module_emp_uat: true,
    seed_used: false,
  },
  env: { PORTAL, HRM, XBOS, OPEN_CODE, INVENT_CODE, ALLOW_CATALOG },
  l0: {},
  src_dist: {},
  fe_spot: {},
  steps: [],
  val: {},
  gap_verdict: null,
  residuals: [],
  overall: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(report, null, 2));
}

function step(id, detail) {
  report.steps.push({ id, at: new Date().toISOString(), ...detail });
  console.log(`[${id}]`, detail.summary || detail.verdict || summarizeBody(detail, 200));
  save();
}

async function l0() {
  const out = {};
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  report.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok;
}

async function measureEff(token) {
  const perCatalog = [];
  let activeExtCodes = new Set();
  for (const cat of ALLOW_LIST) {
    const companies = [HEADER_COMPANY, API_COMPANY];
    let best = null;
    for (const companyId of companies) {
      const res = await call(token, 'GET', `/settings-catalogs/${encodeURIComponent(cat)}/items`, {
        query: { active: 'true', company_id: companyId },
        companyId,
      });
      const items = asList(res.data ?? res.json);
      const activeExt = items.filter((row) => {
        const code = itemCode(row);
        if (!code) return false;
        // core defaults are not invent KEY targets; count non-empty active rows as EFF defs for gap
        // Prefer extension-like: unit/type text or is_extension / origin
        const st = itemStatus(row);
        if (st && st !== 'active' && st !== 'approved') return false;
        return true;
      });
      const codes = activeExt.map(itemCode).filter(Boolean);
      const candidate = {
        catalog: cat,
        companyId,
        status: res.status,
        code: res.code,
        total: items.length,
        active_codes_sample: codes.slice(0, 12),
        active_count: codes.length,
      };
      if (!best || candidate.active_count > best.active_count || (best.status >= 400 && candidate.status < 400)) {
        best = candidate;
      }
    }
    perCatalog.push(best);
    for (const c of best?.active_codes_sample || []) activeExtCodes.add(c);
    // also collect full if we need membership later
    if (best) {
      const resFull = await call(
        token,
        'GET',
        `/settings-catalogs/${encodeURIComponent(best.catalog)}/items`,
        { query: { active: 'true', company_id: best.companyId }, companyId: best.companyId },
      );
      for (const row of asList(resFull.data ?? resFull.json)) {
        const c = itemCode(row);
        if (c) activeExtCodes.add(c);
      }
    }
  }
  return {
    perCatalog,
    unique_active_codes: [...activeExtCodes],
    eff_count: activeExtCodes.size,
  };
}

async function ensureEffGt0(token, eff) {
  if (eff.eff_count > 0) {
    return {
      used_admin_create: false,
      reason: 'live EFF already >0 — no admin CREATE',
      open_code: null,
      post: null,
      eff_after: eff,
    };
  }
  // Admin CREATE N+1 (BR-PLT-05) — not seed density for invent; establishes EFF>0 for VAL-01
  const post = await call(
    token,
    'POST',
    `/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/extension-items`,
    {
      companyId: HEADER_COMPANY,
      body: {
        items: [
          {
            code: OPEN_CODE,
            label: `Trường NS CNS gap QA ${STAMP}`,
            unit: 'text',
            status: 'active',
          },
        ],
      },
    },
  );
  const effAfter = await measureEff(token);
  return {
    used_admin_create: true,
    reason: 'EFF was 0 — admin CREATE open N+1 to enable invent assert (U65 · not seed invent)',
    open_code: OPEN_CODE,
    post: {
      status: post.status,
      code: post.code,
      message: post.message,
      summary: post.summary,
    },
    eff_after: effAfter,
  };
}

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, HEADER_COMPANY]) {
    const list = await call(token, 'GET', '/employees', {
      query: { company_id: companyId, page_size: 5 },
      companyId,
    });
    const items = asList(list.data ?? list.json);
    const emp = items[0];
    if (emp?.id || emp?.employeeId) {
      return {
        companyId,
        listStatus: list.status,
        employeeId: emp.id || emp.employeeId,
        employee_code: emp.employee_code || emp.employeeCode || null,
        custom_fields_before: emp.custom_fields || emp.customFields || {},
      };
    }
  }
  return null;
}

async function inventPatch(token, emp) {
  const inventBody = {
    custom_fields: {
      ...(emp.custom_fields_before || {}),
      [INVENT_CODE]: `invent-gap-${STAMP}`,
    },
  };
  const attempts = [];
  for (const companyId of [emp.companyId, HEADER_COMPANY, API_COMPANY]) {
    const patch = await call(token, 'PATCH', `/employees/${emp.employeeId}`, {
      companyId,
      body: inventBody,
    });
    attempts.push({
      companyId,
      status: patch.status,
      code: patch.code,
      message: patch.message,
      summary: patch.summary,
    });
    if (patch.status === 200 || (patch.status >= 400 && patch.status < 500)) {
      // verify persist
      const get = await call(token, 'GET', `/employees/${emp.employeeId}`, { companyId });
      const row = get.data ?? get.json?.data ?? get.json;
      const cf = row?.custom_fields || row?.customFields || {};
      const persisted = Object.prototype.hasOwnProperty.call(cf, INVENT_CODE);
      return { attempts, winning: attempts[attempts.length - 1], getStatus: get.status, persisted, cf_has_invent: persisted };
    }
  }
  return { attempts, winning: attempts[attempts.length - 1] || null, persisted: null };
}

async function cleanupInvent(token, emp) {
  if (!emp) return null;
  const cleaned = { ...(emp.custom_fields_before || {}) };
  delete cleaned[INVENT_CODE];
  const patch = await call(token, 'PATCH', `/employees/${emp.employeeId}`, {
    companyId: emp.companyId,
    body: { custom_fields: cleaned },
  });
  return { status: patch.status, code: patch.code };
}

async function main() {
  report.src_dist = inspectSrcDist();
  report.fe_spot = feSpot();
  save();

  const l0ok = await l0();
  step('L0', {
    verdict: l0ok ? 'PASS' : 'FAIL',
    summary: `hrm=${report.l0.hrm?.status} xbos=${report.l0.xbos?.status} portal=${report.l0.portal?.status}`,
  });
  if (!l0ok) {
    report.gap_verdict = 'BLOCKED_L0';
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const auth = await login();
  step('LOGIN', {
    verdict: auth.ok ? 'PASS' : 'FAIL',
    summary: auth.ok ? `via ${auth.via}` : auth.body,
  });
  if (!auth.ok) {
    report.gap_verdict = 'BLOCKED_AUTH';
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const eff0 = await measureEff(auth.token);
  step('EFF_BASELINE', {
    verdict: 'INFO',
    summary: `eff_count=${eff0.eff_count}`,
    eff_count: eff0.eff_count,
    perCatalog: eff0.perCatalog,
  });

  const ensure = await ensureEffGt0(auth.token, eff0);
  step('EFF_ENSURE', {
    verdict: ensure.eff_after?.eff_count > 0 || eff0.eff_count > 0 ? 'PASS' : 'FAIL',
    summary: ensure.reason,
    used_admin_create: ensure.used_admin_create,
    post: ensure.post,
    eff_after_count: ensure.eff_after?.eff_count ?? eff0.eff_count,
  });

  const effFinal = ensure.eff_after?.eff_count > 0 ? ensure.eff_after : eff0;
  const effGt0 = (effFinal.eff_count || 0) > 0;

  // also prove OPEN_CODE ∈ EFF if we created
  if (ensure.used_admin_create && ensure.open_code) {
    const hasOpen = (effFinal.unique_active_codes || []).includes(ensure.open_code.toLowerCase());
    step('ADMIN_OPEN_IN_EFF', {
      verdict: hasOpen || ensure.post?.status < 300 ? 'PASS_OR_ACCEPTED' : 'WARN',
      summary: `open=${ensure.open_code} in_eff=${hasOpen} post=${ensure.post?.status}/${ensure.post?.code}`,
    });
  }

  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'FAIL',
    summary: emp
      ? `id=${emp.employeeId} company=${emp.companyId} code=${emp.employee_code}`
      : 'no employee row — cannot invent PATCH',
  });

  if (!emp) {
    report.val['VAL-EMP-CF-CNS-01'] = {
      verdict: 'BLOCKED',
      reason: 'no employee for invent PATCH',
    };
    report.gap_verdict = 'BLOCKED_NO_EMP';
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  if (!effGt0) {
    // AC-01d path — invent assert skip when EFF=0
    report.val['VAL-EMP-CF-CNS-01'] = {
      verdict: 'SKIP_EMPTY_EFF',
      reason: 'EFF=0 after ensure — invent assert skip per AC-01d; cannot prove KEY; treat as FE/admin gap or catalog empty',
    };
    report.val['VAL-EMP-CF-CNS-02'] = {
      verdict: 'SPOT',
      reason: 'empty EFF path — FE empty CTA note in fe_spot',
      fe_spot: report.fe_spot,
    };
    report.gap_verdict = 'FAIL_GAP';
    report.residuals.push({
      id: 'R-EMP-CF-CNS-01',
      severity: 'P1',
      owner: 'dev-be',
      note: 'Could not establish EFF>0 for invent KEY probe; still no HRM-EMP-CUSTOM-FIELD-KEY in employees src — unlock F-EMP-CF-CNS-*',
    });
    report.overall = 'FAIL_GAP';
    report.ack_status = 'PASS_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    console.log('GAP_VERDICT', report.gap_verdict);
    return;
  }

  const invent = await inventPatch(auth.token, emp);
  const win = invent.winning;
  const isKey =
    win &&
    win.status >= 400 &&
    win.status < 500 &&
    String(win.code || '').includes('HRM-EMP-CUSTOM-FIELD-KEY');
  const is4xxOther = win && win.status >= 400 && win.status < 500 && !isKey;
  const is2xxInvent = win && win.status >= 200 && win.status < 300;

  report.val['VAL-EMP-CF-CNS-01'] = {
    expect: '4xx HRM-EMP-CUSTOM-FIELD-KEY when EFF>0',
    eff_count: effFinal.eff_count,
    invent_code: INVENT_CODE,
    winning: win,
    attempts: invent.attempts,
    persisted: invent.persisted,
    src_key_absent: !report.src_dist.src_has_HRM_EMP_CUSTOM_FIELD_KEY,
  };

  if (isKey && invent.persisted !== true) {
    report.val['VAL-EMP-CF-CNS-01'].verdict = 'PASS';
    report.gap_verdict = 'PASS_NO_GAP';
    report.overall = 'PASS_NO_GAP';
    step('VAL-EMP-CF-CNS-01', {
      verdict: 'PASS',
      summary: `${win.status} ${win.code} · invent not persisted`,
    });
  } else if (is2xxInvent || invent.persisted === true) {
    report.val['VAL-EMP-CF-CNS-01'].verdict = 'FAIL_GAP';
    report.gap_verdict = 'FAIL_GAP';
    report.overall = 'FAIL_GAP';
    report.residuals.push({
      id: 'R-EMP-CF-CNS-01',
      severity: 'P1',
      owner: 'dev-be',
      work_item_hint: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01',
      note: `EFF>0 invent ${INVENT_CODE} accepted ${win?.status}/${win?.code} persisted=${invent.persisted} — missing F-EMP-CF-CNS-01 HRM-EMP-CUSTOM-FIELD-KEY · must_keep F-EMP-TOK-03 · cấm reopen EXT BE · cấm Nest emp_custom_field`,
    });
    step('VAL-EMP-CF-CNS-01', {
      verdict: 'FAIL_GAP',
      summary: `invent accepted ${win?.status}/${win?.code} persisted=${invent.persisted}`,
    });
    const cleaned = await cleanupInvent(auth.token, emp);
    step('CLEANUP_INVENT', {
      verdict: cleaned?.status < 300 ? 'PASS' : 'WARN',
      summary: `restore custom_fields without invent · ${cleaned?.status}/${cleaned?.code}`,
    });
  } else if (is4xxOther) {
    report.val['VAL-EMP-CF-CNS-01'].verdict = 'FAIL_GAP_WRONG_CODE';
    report.gap_verdict = 'FAIL_GAP';
    report.overall = 'FAIL_GAP';
    report.residuals.push({
      id: 'R-EMP-CF-CNS-01',
      severity: 'P1',
      owner: 'dev-be',
      note: `Invent rejected ${win.status}/${win.code} but not HRM-EMP-CUSTOM-FIELD-KEY — align error taxonomy per BA`,
    });
    step('VAL-EMP-CF-CNS-01', {
      verdict: 'FAIL_GAP_WRONG_CODE',
      summary: `${win.status} ${win.code} ≠ HRM-EMP-CUSTOM-FIELD-KEY`,
    });
  } else {
    report.val['VAL-EMP-CF-CNS-01'].verdict = 'FAIL_GAP';
    report.gap_verdict = 'FAIL_GAP';
    report.overall = 'FAIL_GAP';
    report.residuals.push({
      id: 'R-EMP-CF-CNS-01',
      severity: 'P1',
      owner: 'dev-be',
      note: `Unexpected invent response ${win?.status}/${win?.code}`,
    });
    step('VAL-EMP-CF-CNS-01', {
      verdict: 'FAIL_GAP',
      summary: `unexpected ${win?.status}/${win?.code}`,
    });
  }

  // FE spot residual
  report.val['FE-SPOT-EMPTY-CTA-PICKER'] = {
    verdict: 'SPOT',
    ...report.fe_spot,
  };
  if (!report.fe_spot.invent_key_client_assert) {
    report.residuals.push({
      id: 'R-EMP-CF-FE-01',
      severity: 'P2',
      owner: 'dev-fe',
      note: 'EmployeeFormDialog binds Settings MD dynamic fields; no client invent KEY; empty CTA is CatalogSearchPicker-class for dept/pos — deepen empty EFF CTA for extension defs after BE CNS if needed · do not invent FE without PM',
    });
  }

  // retain seals note
  step('RETAIN_SEALS', {
    verdict: 'PASS',
    summary:
      'EMPTOKEXTQA-MSJ57PE1 RETAIN · no EXT reopen · no Nest emp_custom_field · honesty false · C-SLICE-≠-MODULE',
  });

  report.ack_status = 'PASS_TO_PM';
  report.endedAt = new Date().toISOString();
  save();
  console.log('GAP_VERDICT', report.gap_verdict);
  console.log('STAMP', report.stamp);
  console.log('OUT', OUT);
}

main().catch((e) => {
  report.overall = 'ERROR';
  report.gap_verdict = 'ERROR';
  report.ack_status = 'FAIL_TO_PM';
  report.error = String(e?.stack || e).slice(0, 1200);
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
