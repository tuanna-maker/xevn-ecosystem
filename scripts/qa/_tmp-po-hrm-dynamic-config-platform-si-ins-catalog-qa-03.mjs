#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-03
 * Narrow spot: empty start_date/end_date "" → 400 HRM-VAL-001 (not 500 HRM-SYS-001)
 * Retain: open key ∈ EFF + valid dates → 201; invent → HRM-INS-TYPE-KEY
 * U65 zero-seed · honesty LOCKED · C-SLICE-≠-MODULE · do NOT reopen L1/QC-02
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAMP = `SIINSQA3-${Date.now().toString(36).toUpperCase()}`;
const INVENT_KEY = `zz_invent_si_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const OPEN_KEY_PRIOR = process.env.QA_SI_OPEN_KEY || 'hr_si_cat_msjb0dy7';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.json',
);

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function login(email, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, via: url };
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

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY, tenantId = 'xevn' } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Accept: 'application/json',
    'x-tenant-id': tenantId,
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
    code: json?.code ?? null,
    message: json?.message ?? null,
    errors: json?.errors ?? json?.message ?? null,
    dataSummary: summarizeBody(json?.data ?? json, 800),
    data: json?.data ?? null,
    json,
  };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function effKeys(data) {
  return asList(data)
    .map((r) => r.insuranceTypeKey || r.insurance_type_key || r.code || r.key)
    .filter(Boolean);
}

function isVal001(res) {
  const code = res.code;
  const msg = String(res.message || '');
  const body = summarizeBody(res.json);
  if (code === 'HRM-VAL-001') return true;
  // Nest ValidationPipe may surface as 400 with message array / HRM-VAL-001 in body
  if (res.status === 400 && /HRM-VAL-001|must be a valid ISO 8601 date|IsDateString|start_date|end_date/i.test(body + msg)) {
    return true;
  }
  return false;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-03',
  stamp: STAMP,
  git_head: gitHead(),
  prior: {
    be_03: 'READY_FOR_QA',
    qc_02_condition: 'OBS-PLT-SI-INS-EMPTY-DATE',
    retain_l1: 'SIINSQA-MSJA2Z7H',
    retain_qc02: 'SIINSQA2R2-MSJB0DY7 FE enrollment SEAL',
  },
  lane: 'narrow_API_spot · empty-date 4xx + retain open/invent',
  u65: 'zero-seed · API spot OK for EMPTY-DATE Condition · L1 probe ≠ UF',
  honesty: {
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    seed_used: false,
    deny_module_si_ctr_uat: true,
    deny_reopen_l1_qc01_qc02: true,
    c_slice_ne_module: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    OPEN_KEY_PRIOR,
    INVENT_KEY,
  },
  probes: [],
  ac: {},
  residual: [],
  overall: 'PENDING',
  ack_status: 'PENDING',
  startedAt: new Date().toISOString(),
};

function pushProbe(name, res) {
  report.probes.push({
    name,
    status: res.status,
    code: res.code,
    message: res.message,
    path: res.path,
    method: res.method,
    dataSummary: res.dataSummary,
  });
}

function setAc(id, verdict, summary, extra = {}) {
  report.ac[id] = { verdict, summary, at: new Date().toISOString(), ...extra };
}

async function main() {
  // L0
  const l0 = {};
  for (const [k, u] of [
    ['hrm', `${HRM}`],
    ['xbos', `${XBOS}`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(u, { method: 'GET' });
      l0[k] = { status: r.status, url: u };
    } catch (e) {
      l0[k] = { status: 0, url: u, err: String(e?.message || e) };
    }
  }
  report.l0 = l0;
  const l0ok = l0.hrm?.status === 200 && l0.xbos?.status === 200;
  setAc('L0-STACK', l0ok ? 'PASS' : 'FAIL', `hrm ${l0.hrm?.status} · xbos ${l0.xbos?.status} · portal ${l0.portal?.status}`);

  const auth = await login(EMAIL);
  pushProbe('login', { status: auth.status, code: null, message: auth.ok ? 'ok' : auth.body, path: auth.via, method: 'POST', dataSummary: '' });
  if (!auth.ok || !auth.token) {
    setAc('LOGIN', 'FAIL', 'ceo login failed');
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residual.push({ id: 'D-SI-INS-QA03-LOGIN', severity: 'P0', owner: 'devops', summary: 'login failed' });
    finish();
    return;
  }
  setAc('LOGIN', 'PASS', `via ${auth.via}`);
  const token = auth.token;

  // employees
  const empRes = await call(token, 'GET', '/employees', { query: { page_size: 5, company_id: HEADER_COMPANY } });
  pushProbe('employees_list', empRes);
  const emps = asList(empRes.data);
  const employeeId = emps[0]?.id || emps[0]?.employee_id;
  if (!employeeId) {
    setAc('EMPLOYEE_PICK', 'FAIL', 'no employee in list (U65 — no seed)');
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residual.push({
      id: 'D-SI-INS-QA03-NO-EMP',
      severity: 'P1',
      owner: 'devops',
      summary: 'employees list empty — cannot POST enrollment',
    });
    finish();
    return;
  }
  setAc('EMPLOYEE_PICK', 'PASS', `employee_id=${employeeId}`);

  // effective catalog
  const effRes = await call(token, 'GET', '/contracts-insurance/insurance-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushProbe('insurance_types_effective', effRes);
  const keys = effKeys(effRes.data);
  let openKey = keys.includes(OPEN_KEY_PRIOR) ? OPEN_KEY_PRIOR : keys[0];
  if (!openKey) {
    setAc('EFF_OPEN_KEY', 'FAIL', 'EFF empty — cannot retain open-key smoke');
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residual.push({
      id: 'D-SI-INS-QA03-EFF-EMPTY',
      severity: 'P1',
      owner: 'pm',
      summary: 'effective catalog empty — U65 no seed; prior open key missing',
    });
    finish();
    return;
  }
  setAc(
    'EFF_OPEN_KEY',
    'PASS',
    `EFF count=${keys.length} · openKey=${openKey} · prior=${OPEN_KEY_PRIOR}·inEff=${keys.includes(OPEN_KEY_PRIOR)}`,
  );

  const baseBody = {
    employee_id: employeeId,
    company_id: HEADER_COMPANY,
    type: openKey,
    provider: `QA03-provider-${STAMP}`,
    policy_number: `QA03-POL-${STAMP}`,
    status: 'active',
  };

  // --- PRIMARY: empty dates ---
  const emptyBoth = await call(token, 'POST', '/employee-insurances', {
    body: { ...baseBody, start_date: '', end_date: '' },
  });
  pushProbe('empty_both_dates', emptyBoth);
  const emptyBothOk =
    emptyBoth.status === 400 &&
    emptyBoth.status !== 500 &&
    emptyBoth.code !== 'HRM-SYS-001' &&
    isVal001(emptyBoth);
  setAc('OBS-PLT-SI-INS-EMPTY-DATE-BOTH', emptyBothOk ? 'PASS' : 'FAIL', summarizeEmpty(emptyBoth), {
    status: emptyBoth.status,
    code: emptyBoth.code,
    message: emptyBoth.message,
  });

  const emptyStart = await call(token, 'POST', '/employee-insurances', {
    body: { ...baseBody, start_date: '', end_date: '2026-12-31' },
  });
  pushProbe('empty_start_date', emptyStart);
  const emptyStartOk =
    emptyStart.status === 400 &&
    emptyStart.code !== 'HRM-SYS-001' &&
    isVal001(emptyStart);
  setAc('OBS-PLT-SI-INS-EMPTY-DATE-START', emptyStartOk ? 'PASS' : 'FAIL', summarizeEmpty(emptyStart), {
    status: emptyStart.status,
    code: emptyStart.code,
    message: emptyStart.message,
  });

  const emptyEnd = await call(token, 'POST', '/employee-insurances', {
    body: { ...baseBody, start_date: '2026-08-01', end_date: '' },
  });
  pushProbe('empty_end_date', emptyEnd);
  const emptyEndOk =
    emptyEnd.status === 400 &&
    emptyEnd.code !== 'HRM-SYS-001' &&
    isVal001(emptyEnd);
  setAc('OBS-PLT-SI-INS-EMPTY-DATE-END', emptyEndOk ? 'PASS' : 'FAIL', summarizeEmpty(emptyEnd), {
    status: emptyEnd.status,
    code: emptyEnd.code,
    message: emptyEnd.message,
  });

  // --- RETAIN invent ---
  const invent = await call(token, 'POST', '/employee-insurances', {
    body: {
      ...baseBody,
      type: INVENT_KEY,
      start_date: '2026-08-01',
      end_date: '2026-12-31',
      policy_number: `QA03-INV-${STAMP}`,
    },
  });
  pushProbe('invent_type', invent);
  const inventOk = invent.status === 400 && invent.code === 'HRM-INS-TYPE-KEY';
  setAc(
    'AC-PLT-SI-INS-01b-ENROLLMENT-RETAIN',
    inventOk ? 'PASS' : 'FAIL',
    `invent ${INVENT_KEY} → status=${invent.status} code=${invent.code}`,
    { status: invent.status, code: invent.code, message: invent.message },
  );

  // --- RETAIN open + valid ---
  const happy = await call(token, 'POST', '/employee-insurances', {
    body: {
      ...baseBody,
      type: openKey,
      start_date: '2026-08-01',
      end_date: '2026-12-31',
      policy_number: `QA03-OK-${STAMP}`,
    },
  });
  pushProbe('open_valid_dates', happy);
  const happyOk =
    happy.status === 201 &&
    (happy.code === 'HRM-EINS-201' || String(happy.message || '').toLowerCase().includes('created'));
  setAc(
    'AC-PLT-SI-INS-01-ENROLLMENT-RETAIN',
    happyOk ? 'PASS' : 'FAIL',
    `open ${openKey} → status=${happy.status} code=${happy.code}`,
    { status: happy.status, code: happy.code, message: happy.message, type: openKey },
  );

  const emptyPass = emptyBothOk && emptyStartOk && emptyEndOk;
  const retainPass = inventOk && happyOk;
  const allPass = l0ok && emptyPass && retainPass;

  report.obs_closed = emptyPass
    ? {
        id: 'OBS-PLT-SI-INS-EMPTY-DATE',
        status: 'CLOSED',
        note: 'blank "" dates → 400 HRM-VAL-001 (or ValidationPipe date) · not 500 HRM-SYS-001',
      }
    : {
        id: 'OBS-PLT-SI-INS-EMPTY-DATE',
        status: 'OPEN',
        note: 'empty-date still not 400 VAL',
      };

  if (allPass) {
    report.overall = 'PASS';
    report.ack_status = 'PASS_TO_PM';
  } else {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    if (!emptyPass) {
      report.residual.push({
        id: 'OBS-PLT-SI-INS-EMPTY-DATE',
        severity: 'P2',
        owner: 'dev-be',
        summary: `empty dates not closed: both=${emptyBoth.status}/${emptyBoth.code} start=${emptyStart.status}/${emptyStart.code} end=${emptyEnd.status}/${emptyEnd.code}`,
      });
    }
    if (!retainPass) {
      report.residual.push({
        id: 'D-SI-INS-QA03-RETAIN',
        severity: 'P1',
        owner: 'dev-be',
        summary: `retain smoke fail invent=${invent.status}/${invent.code} happy=${happy.status}/${happy.code}`,
      });
    }
  }

  report.finishedAt = new Date().toISOString();
  finish();
}

function summarizeEmpty(res) {
  return `status=${res.status} code=${res.code} msg=${String(res.message || '').slice(0, 160)} · expect 400 HRM-VAL-001 not 500 SYS`;
}

function finish() {
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ stamp: report.stamp, overall: report.overall, ack: report.ack_status, out: OUT, ac: report.ac }, null, 2));
  process.exit(report.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  report.overall = 'FAIL';
  report.ack_status = 'FAIL_TO_PM';
  report.residual.push({ id: 'D-SI-INS-QA03-CRASH', severity: 'P0', owner: 'qa', summary: String(e?.stack || e) });
  finish();
});
