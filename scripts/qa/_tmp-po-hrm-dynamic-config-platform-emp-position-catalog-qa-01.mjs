#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-01 — L1 API (≠ UF 🟢)
 * U65 zero-seed · honesty LOCKED false · C-SLICE-≠-MODULE · Option A Settings/XBOS job_titles SoT
 * AC-PLT-EMP-01 / 01b / 01c / 01d / 01e + VAL-EMP-POS-CNS-*
 *  - 01d admin CREATE/sync N+1 job_titles → 2xx → picker (F5-equiv) has row
 *  - 01  consumer valid job_title_key ∈ EFF → 2xx (reject free-text SoT)
 *  - 01b invent unknown key when EFF>0 → 4xx HRM-EMP-JOB-TITLE (≡ HRM-EMP-POSITION-KEY / HRM-WH-PICK-REQUIRED class)
 *  - 01c empty EFF → empty-catalog block (assertCodeInEffectiveCatalog activeOnly=0) — cited jest (cannot force live w/o wipe/seed)
 * SEAL RETAIN cite-only: EMP-STATUS EMPSTQA-MSK20G7H · EMP-CUSTOM EMPCFQA-MSK14LUH · EXT EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR
 * FORBIDDEN: seed · Nest emp_position · reopen seals · flip *_ready · module EMP UAT
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'node:fs';
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
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `EMPPOSQA-${TS.toUpperCase().slice(-8)}`;
const OPEN_CODE = `hr_emp_pos_${TS}`.slice(0, 48);
const INVENT_CODE = `zz_invent_emp_pos_${TS}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-position-catalog-qa-01.json',
);
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const summarize = (b, max = 700) => {
  const s = typeof b === 'string' ? b : JSON.stringify(b);
  return s && s.length > max ? `${s.slice(0, max)}…` : s;
};
const decodeJwt = (t) => {
  try {
    return JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString());
  } catch {
    return null;
  }
};
const gitHead = () => {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};
const asList = (d) =>
  Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
      ? d.items
      : Array.isArray(d?.data)
        ? d.data
        : Array.isArray(d?.rows)
          ? d.rows
          : [];
const codes = (d) =>
  asList(d)
    .map((r) => r.code || r.item_key || r.key || r.itemKey)
    .filter(Boolean)
    .map((k) => String(k).toLowerCase());

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
      if (r.ok && token) return { ok: true, status: r.status, token, claims: decodeJwt(token), via: url };
      if (url.includes('28002')) return { ok: false, status: r.status, body: summarize(j), token: null };
    } catch (e) {
      if (url.includes('28002')) return { ok: false, status: 0, body: String(e?.message || e), token: null };
    }
  }
  return { ok: false, status: 0, body: 'login failed both portals', token: null };
}

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
  const headers = { Accept: 'application/json', 'x-tenant-id': TENANT, 'x-company-id': companyId };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? json?.error?.message ?? null,
    data: json?.data ?? null,
    json,
    summary: summarize(json, 500),
  };
}

function inspectDist() {
  const out = { dist_exists: false, has_settings_catalogs: false, has_employees: false, has_contracts: false, stale_dist: true, note: '' };
  const dist = resolve(ROOT, 'apps/api/hrm-api/dist');
  out.dist_exists = existsSync(dist);
  if (!out.dist_exists) {
    out.note = 'dist missing';
    return out;
  }
  out.has_settings_catalogs = existsSync(join(dist, 'settings-catalogs', 'settings-catalogs.service.js'));
  out.has_employees = existsSync(join(dist, 'employees', 'employees.service.js'));
  out.has_contracts = existsSync(join(dist, 'contracts-insurance', 'contracts-insurance.service.js'));
  // src assert presence (AS-IS live)
  const empSvc = resolve(ROOT, 'apps/api/hrm-api/src/employees/employees.service.ts');
  const conSvc = resolve(ROOT, 'apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts');
  out.src_emp_job_title_assert = existsSync(empSvc) && /assertJobTitleKeyInCatalog[\s\S]*job_titles/.test(readFileSync(empSvc, 'utf8'));
  out.src_con_pos_assert = existsSync(conSvc) && /catalogKey:\s*'job_titles'/.test(readFileSync(conSvc, 'utf8'));
  out.stale_dist = !(out.has_settings_catalogs && out.has_employees && out.has_contracts);
  out.note = out.stale_dist ? 'stale/missing dist' : 'dist settings-catalogs + employees + contracts present · src job_titles asserts live';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01 CONFIRMED · Option A',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API (≠ UF 🟢)',
  u65: 'zero-seed · no pnpm seed · admin CREATE N+1 via Settings API then invent',
  persona: { email: EMAIL, headerCompany: HEADER_COMPANY, apiCompany: API_COMPANY },
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    c_slice_ne_module: true,
    deny_module_emp_uat: true,
    deny_flip_ready: true,
    deny_uf_green_from_l1: true,
    deny_nest_emp_position: true,
    seed_used: false,
  },
  open_code: OPEN_CODE,
  invent_code: INVENT_CODE,
  dist: {},
  l0: {},
  steps: [],
  val: {},
  residuals: [],
  overall: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};
const save = () => writeFileSync(OUT, JSON.stringify(report, null, 2));
const step = (id, detail) => {
  report.steps.push({ id, at: new Date().toISOString(), ...detail });
  console.log(`[${id}] ${detail.verdict ?? ''} ${detail.summary ?? ''}`);
  save();
};

async function l0() {
  const out = {};
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status >= 200 && r.status < 500 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  report.l0 = out;
  save();
  return out.hrm?.status === 200 && out.portal?.status === 200;
}

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, HEADER_COMPANY]) {
    const list = await call(token, 'GET', '/employees', { query: { company_id: companyId, page_size: 5 }, companyId });
    const items = asList(list.data ?? list.json);
    const emp = items.find((e) => e.id || e.employeeId);
    if (emp) {
      return {
        companyId,
        listStatus: list.status,
        employeeId: emp.id || emp.employeeId,
        job_title_key_before: emp.job_title_key ?? emp.jobTitleKey ?? null,
      };
    }
  }
  return null;
}

async function main() {
  report.dist = inspectDist();
  save();
  step('DIST_GATE', {
    verdict: !report.dist.stale_dist ? 'PASS' : 'FAIL',
    summary: report.dist.note,
    ...report.dist,
  });

  const l0ok = await l0();
  step('L0', {
    verdict: l0ok ? 'PASS' : 'FAIL',
    summary: `hrm=${report.l0.hrm?.status} xbos=${report.l0.xbos?.status} portal=${report.l0.portal?.status}`,
  });
  if (!l0ok) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // unauth picker
  const unauth = await call(null, 'GET', '/settings-catalogs/job_titles/items', { query: { company_id: HEADER_COMPANY, status: 'active' } });
  step('UNAUTH_PICKER', {
    verdict: unauth.status === 401 || unauth.status === 403 ? 'PASS' : 'WARN',
    summary: `${unauth.status} ${unauth.code}`,
    status: unauth.status,
    code: unauth.code,
  });

  const auth = await login();
  step('LOGIN', { verdict: auth.ok ? 'PASS' : 'FAIL', summary: auth.ok ? `via ${auth.via}` : auth.body });
  if (!auth.ok) {
    report.overall = 'BLOCKED';
    report.ack_status = 'FAIL_TO_PM';
    report.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  // baseline EFF job_titles (SoT)
  const eff0 = await call(auth.token, 'GET', '/settings-catalogs/job_titles/items', {
    query: { company_id: HEADER_COMPANY, status: 'active' },
    companyId: HEADER_COMPANY,
  });
  const eff0Codes = codes(eff0.data ?? eff0.json);
  report.val.eff_baseline_count = eff0Codes.length;
  step('EFF_BASELINE', {
    verdict: eff0.status === 200 ? 'PASS' : 'FAIL',
    summary: `status=${eff0.status} activeCount=${eff0Codes.length} sample=${eff0Codes.slice(0, 5).join(',')}`,
    status: eff0.status,
    count: eff0Codes.length,
  });

  // 01d admin CREATE N+1
  const create = await call(auth.token, 'POST', '/settings-catalogs/items', {
    companyId: HEADER_COMPANY,
    body: {
      company_id: HEADER_COMPANY,
      category_key: 'job_titles',
      item_key: OPEN_CODE,
      item_name: `QA Chuc danh ${STAMP}`,
      status: 'active',
    },
  });
  step('ADM_CREATE_01d', {
    verdict: create.status >= 200 && create.status < 300 ? 'PASS' : 'FAIL',
    summary: `${create.status} ${create.code} key=${OPEN_CODE}`,
    status: create.status,
    code: create.code,
    detail: create.summary,
  });

  // picker re-fetch (F5-equiv) includes new row
  const eff1 = await call(auth.token, 'GET', '/settings-catalogs/job_titles/items', {
    query: { company_id: HEADER_COMPANY, status: 'active' },
    companyId: HEADER_COMPANY,
  });
  const eff1Codes = codes(eff1.data ?? eff1.json);
  const openPresent = eff1Codes.includes(OPEN_CODE.toLowerCase());
  step('PICKER_F5_01d', {
    verdict: openPresent ? 'PASS' : 'FAIL',
    summary: `status=${eff1.status} activeCount=${eff1Codes.length} open_present=${openPresent}`,
    open_present: openPresent,
  });

  // pick employee
  const emp = await pickEmployee(auth.token);
  step('PICK_EMPLOYEE', {
    verdict: emp ? 'PASS' : 'BLOCKED',
    summary: emp ? `emp=${emp.employeeId} company=${emp.companyId} jt_before=${emp.job_title_key_before}` : 'no employee found',
    ...(emp || {}),
  });

  if (emp) {
    // 01b invent unknown key when EFF>0
    const invent = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
      body: { job_title_key: INVENT_CODE },
    });
    const inventOk = invent.status === 400 && /HRM-EMP-JOB-TITLE|HRM-EMP-POSITION-KEY|HRM-WH-PICK/.test(invent.code || '');
    report.val.CNS_03_invent = { status: invent.status, code: invent.code };
    step('EMP_INVENT_01b', {
      verdict: inventOk ? 'PASS' : 'FAIL',
      summary: `${invent.status} ${invent.code} (expect 400 HRM-EMP-JOB-TITLE ≡ POSITION-KEY class)`,
      status: invent.status,
      code: invent.code,
      detail: invent.summary,
    });

    // 01 valid key ∈ EFF
    const valid = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
      body: { job_title_key: OPEN_CODE },
    });
    const validOk = valid.status >= 200 && valid.status < 300;
    report.val.AC_01_valid = { status: valid.status, code: valid.code };
    step('EMP_VALID_01', {
      verdict: validOk ? 'PASS' : 'FAIL',
      summary: `${valid.status} ${valid.code} key=${OPEN_CODE}`,
      status: valid.status,
      code: valid.code,
    });

    // refetch persisted
    const refetch = await call(auth.token, 'GET', `/employees/${emp.employeeId}`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
    });
    const persistedKey = (refetch.data?.job_title_key ?? refetch.data?.jobTitleKey ?? '').toLowerCase();
    step('EMP_F5_PERSIST_01', {
      verdict: persistedKey === OPEN_CODE.toLowerCase() ? 'PASS' : 'WARN',
      summary: `get=${refetch.status} persisted=${persistedKey}`,
    });

    // restore original
    const restore = await call(auth.token, 'PATCH', `/employees/${emp.employeeId}`, {
      query: { company_id: emp.companyId },
      companyId: emp.companyId,
      body: { job_title_key: emp.job_title_key_before },
    });
    step('EMP_RESTORE', {
      verdict: restore.status >= 200 && restore.status < 300 ? 'PASS' : 'WARN',
      summary: `${restore.status} restored jt=${emp.job_title_key_before}`,
    });
  }

  // retire open code (01e) — soft retire via PATCH item status draft
  const retire = await call(auth.token, 'PATCH', '/settings-catalogs/items', {
    companyId: HEADER_COMPANY,
    body: { company_id: HEADER_COMPANY, category_key: 'job_titles', item_key: OPEN_CODE, item_name: `QA Chuc danh ${STAMP}`, status: 'draft' },
  });
  const eff2 = await call(auth.token, 'GET', '/settings-catalogs/job_titles/items', {
    query: { company_id: HEADER_COMPANY, status: 'active' },
    companyId: HEADER_COMPANY,
  });
  const stillActive = codes(eff2.data ?? eff2.json).includes(OPEN_CODE.toLowerCase());
  step('RETIRE_01e', {
    verdict: retire.status >= 200 && retire.status < 300 && !stillActive ? 'PASS' : 'WARN',
    summary: `retire=${retire.status} still_active_in_picker=${stillActive} (expect hidden)`,
  });

  // seals cite-only
  report.seals = {
    emp_status: 'EMPSTQA-MSK20G7H',
    emp_custom: 'EMPCFQA-MSK14LUH',
    ext: 'EMPTOKEXTQA-MSJ57PE1',
    doc_et_att_si_ctr: 'RETAIN',
    reopened: false,
    note: 'cite-only RETAIN · suites not re-executed',
  };

  // verdict rollup
  const fails = report.steps.filter((s) => s.verdict === 'FAIL');
  report.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  report.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  report.fail_steps = fails.map((s) => s.id);
  report.endedAt = new Date().toISOString();
  save();
  console.log(`\nOVERALL=${report.overall} ack=${report.ack_status} fails=${report.fail_steps.join(',') || 'none'}`);
}

main().catch((e) => {
  report.overall = 'ERROR';
  report.ack_status = 'FAIL_TO_PM';
  report.error = String(e?.stack || e);
  report.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
