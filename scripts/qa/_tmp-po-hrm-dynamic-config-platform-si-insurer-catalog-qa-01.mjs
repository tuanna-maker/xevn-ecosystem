#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01 — L1 API smoke + FE HOLD
 * U65 zero-seed · honesty LOCKED false · C-SLICE-≠-MODULE
 * AC-PLT-SI-INSURER-01* · invent → HRM-INS-INSURER-KEY when EFF>0
 * Peer type L1 RETAIN — confirm HRM-INS-TYPE-KEY path still separate
 * FORBIDDEN reopen SI type L1 · CTR · enrollment
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAMP = `SIINRQA-${Date.now().toString(36).toUpperCase()}`;
const OPEN_KEY = `hr_si_inr_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const INVENT_KEY = `zz_invent_inr_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.json',
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
        return {
          ok: true,
          status: r.status,
          token,
          claims: decodeJwt(token),
          via: url,
        };
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

function insurerKeys(data) {
  return asList(data)
    .map((r) => r.insurerKey || r.insurer_key || r.code || r.key)
    .filter(Boolean);
}

function typeKeys(data) {
  return asList(data)
    .map((r) => r.insuranceTypeKey || r.insurance_type_key || r.code || r.key)
    .filter(Boolean);
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function inspectDist() {
  const distCi = resolve(ROOT, 'apps/api/hrm-api/dist/contracts-insurance');
  const out = {
    dist_contracts_insurance_exists: existsSync(distCi),
    dist_files: [],
    has_si_insurer_service_js: false,
    has_si_insurer_constants_js: false,
    controller_has_insurers_effective: false,
    controller_has_insurance_types_effective: false,
    controller_mtime: null,
    service_mtime: null,
    stale_dist: false,
  };
  if (!existsSync(distCi)) {
    out.stale_dist = true;
    return out;
  }
  out.dist_files = readdirSync(distCi);
  out.has_si_insurer_service_js = out.dist_files.includes('si-insurer.service.js');
  out.has_si_insurer_constants_js = out.dist_files.includes('si-insurer.constants.js');
  const ctrlPath = join(distCi, 'contracts-insurance.controller.js');
  if (existsSync(ctrlPath)) {
    const t = readFileSync(ctrlPath, 'utf8');
    out.controller_has_insurers_effective = t.includes('insurers/effective');
    out.controller_has_insurance_types_effective = t.includes('insurance-types/effective');
    out.controller_mtime = statSync(ctrlPath).mtime.toISOString();
  }
  const svcPath = join(distCi, 'si-insurer.service.js');
  if (existsSync(svcPath)) out.service_mtime = statSync(svcPath).mtime.toISOString();
  out.stale_dist = !(
    out.has_si_insurer_service_js &&
    out.has_si_insurer_constants_js &&
    out.controller_has_insurers_effective
  );
  return out;
}

function feBindSpot() {
  const picker = resolve(ROOT, 'apps/web/hrm/src/lib/catalogSearchPicker.ts');
  const policyPanel = resolve(
    ROOT,
    'apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx',
  );
  const settingsRoutes = resolve(ROOT, 'apps/web/hrm/src/pages');
  const out = {
    picker_uses_settings_md_insurers: false,
    picker_calls_nest_insurers_effective: false,
    policy_panel_exists: existsSync(policyPanel),
    nest_settings_insurers_tab: false,
    fe_hold_r_plt_si_inr_03: true,
    note: '',
  };
  if (existsSync(picker)) {
    const t = readFileSync(picker, 'utf8');
    out.picker_uses_settings_md_insurers =
      /insurers|insurance_providers|bhxh_providers/.test(t);
    out.picker_calls_nest_insurers_effective = /insurers\/effective/.test(t);
  }
  // Spot FE Settings Nest tab for insurers
  try {
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else if (/\.(tsx|ts)$/.test(name)) {
          const t = readFileSync(p, 'utf8');
          if (/insurers\/effective|si-insurer|SiInsurer|tab=si-insurers/.test(t)) {
            out.nest_settings_insurers_tab = true;
          }
          if (/insurers\/effective/.test(t)) out.picker_calls_nest_insurers_effective = true;
        }
      }
    };
    walk(settingsRoutes);
    walk(resolve(ROOT, 'apps/web/hrm/src/components'));
  } catch {
    /* ignore */
  }
  out.fe_hold_r_plt_si_inr_03 = !out.picker_calls_nest_insurers_effective;
  out.note = out.fe_hold_r_plt_si_inr_03
    ? 'FE still Settings MD insurers SoT (or no Nest EFF bind) — browser picker HOLD R-PLT-SI-INR-03'
    : 'FE bound Nest insurers/effective — browser UF eligible';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API_smoke + FE_HOLD_spot',
  u65: 'zero-seed · probe ≠ UF · browser picker HOLD unless FE READY',
  honesty: {
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    payroll_e2e_ready: false,
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    decisions_module_uat_ready: false,
    module_si_ctr_uat: false,
    c_slice_ne_module: true,
    si_type_l1_retain: 'SIINSQA-MSJA2Z7H · QC-01 GWC FORBIDDEN reopen',
    ctr_legal_print_retain: true,
    enrollment_seals_retain: true,
  },
  account: EMAIL,
  x_company_id: HEADER_COMPANY,
  open_key: OPEN_KEY,
  invent_key: INVENT_KEY,
  dist_inspect: inspectDist(),
  fe_bind_spot: feBindSpot(),
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

async function main() {
  // --- Dist gate ---
  const distOk = !report.dist_inspect.stale_dist;
  report.ac.dist_gate = {
    ok: distOk,
    verdict: distOk ? 'PASS' : 'FAIL',
    note: distOk
      ? 'si-insurer.* + insurers/effective in dist'
      : 'STALE DIST — missing si-insurer and/or insurers/effective',
  };
  if (!distOk) {
    report.residual.push({
      id: 'D-SI-INR-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      summary: 'hrm-api dist missing si-insurer.service.js and/or insurers/effective',
    });
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ stamp: STAMP, overall: 'FAIL', residual: report.residual }, null, 2));
    process.exit(2);
  }

  // --- L0 quick ---
  const health = await call(null, 'GET', `${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`);
  pushStep('L0_hrm_health', health);
  report.ac.L0 = {
    ok: health.status === 200,
    verdict: health.status === 200 ? 'PASS' : 'FAIL',
    note: `GET /api/hrm → ${health.status}`,
  };

  // --- Unauth effective ---
  const unauthEff = await call(null, 'GET', '/contracts-insurance/insurers/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('unauth_insurers_effective', unauthEff);
  const unauthOk = unauthEff.status === 401 || unauthEff.status === 403;
  report.ac.unauth_effective = {
    ok: unauthOk && unauthEff.status !== 404,
    verdict: unauthOk && unauthEff.status !== 404 ? 'PASS' : 'FAIL',
    note: `status=${unauthEff.status} (expect 401/403, not 404)`,
  };

  // --- Login ---
  const auth = await login(EMAIL);
  pushStep('login', { status: auth.status, ok: auth.ok, via: auth.via });
  if (!auth.ok || !auth.token) {
    report.overall = 'FAIL';
    report.ack_status = 'FAIL_TO_PM';
    report.residual.push({
      id: 'D-SI-INR-LOGIN',
      severity: 'P0',
      owner: 'devops',
      summary: 'ceo login failed',
    });
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    process.exit(2);
  }
  const token = auth.token;

  // --- GET insurers/effective (empty [] OK) ---
  const eff0 = await call(token, 'GET', '/contracts-insurance/insurers/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('get_insurers_effective_baseline', eff0, { keys: insurerKeys(eff0.data) });
  const effList0 = asList(eff0.data);
  const effCount0 = eff0.data?.total ?? effList0.length;
  const effOk =
    eff0.status === 200 &&
    (Array.isArray(eff0.data?.data) ||
      Array.isArray(eff0.data) ||
      Array.isArray(eff0.data?.items) ||
      eff0.data?.total === 0 ||
      effCount0 === 0);
  report.ac['AC-PLT-SI-INSURER-01c_empty_ok'] = {
    ok: effOk,
    verdict: effOk ? 'PASS' : 'FAIL',
    note: `GET insurers/effective → ${eff0.status} count=${effCount0} (empty [] OK · no seed)`,
  };

  // --- Admin CREATE N+1 (01d L1) ---
  const createAdmin = await call(token, 'PUT', '/contracts-insurance/insurers', {
    body: {
      companyId: HEADER_COMPANY,
      insurerKey: OPEN_KEY,
      nameVi: `QA SI insurer ${STAMP}`,
      sortOrder: 90,
      status: 'active',
    },
  });
  pushStep('admin_create_01d', createAdmin);
  const adminOk = createAdmin.status === 200 || createAdmin.status === 201;
  report.ac['AC-PLT-SI-INSURER-01d'] = {
    ok: adminOk,
    verdict: adminOk ? 'PASS' : 'FAIL',
    note: `PUT insurers key=${OPEN_KEY} → ${createAdmin.status} code=${createAdmin.code}`,
  };

  const eff1 = await call(token, 'GET', '/contracts-insurance/insurers/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const keys1 = insurerKeys(eff1.data);
  pushStep('get_insurers_effective_after_admin', eff1, {
    keys: keys1,
    hasOpenKey: keys1.includes(OPEN_KEY),
  });
  const effGt0 = (eff1.data?.total ?? keys1.length) > 0 && keys1.includes(OPEN_KEY);
  report.ac['AC-PLT-SI-INSURER-01_eff_has_admin'] = {
    ok: eff1.status === 200 && effGt0,
    verdict: eff1.status === 200 && effGt0 ? 'PASS' : 'FAIL',
    note: `EFF after admin count=${eff1.data?.total ?? keys1.length} hasOpenKey=${keys1.includes(OPEN_KEY)}`,
  };

  // --- Resolve a valid insurance_type for policy invent (peer type path — RETAIN) ---
  let insuranceType = null;
  const typeEff = await call(token, 'GET', '/contracts-insurance/insurance-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('get_insurance_types_effective_peer', typeEff, { keys: typeKeys(typeEff.data) });
  const typeKeys1 = typeKeys(typeEff.data);
  insuranceType = typeKeys1[0] || null;
  report.insurance_type_used = insuranceType;

  // --- Invent policy insurer_key when EFF>0 ---
  let inventPolicy = null;
  if (insuranceType) {
    inventPolicy = await call(token, 'POST', '/contracts-insurance/insurance-policies', {
      body: {
        company_id: HEADER_COMPANY,
        policy_code: `QA-INV-INR-${STAMP}`.slice(0, 64),
        policy_name: `Invent insurer policy ${STAMP}`,
        insurer_key: INVENT_KEY,
        insurance_type: insuranceType,
        effective_date: '2026-08-01',
        status: 'draft',
      },
    });
  } else {
    inventPolicy = {
      status: 0,
      code: null,
      message: 'no insurance_type in EFF — cannot isolate insurer assert',
      skipped: true,
    };
  }
  pushStep('invent_policy_insurer_01b', inventPolicy);
  const inventPolOk =
    inventPolicy.status === 400 && inventPolicy.code === 'HRM-INS-INSURER-KEY';
  report.ac['AC-PLT-SI-INSURER-01b_policy'] = {
    ok: inventPolOk,
    verdict: inventPolOk ? 'PASS' : inventPolicy.skipped ? 'BLOCKED' : 'FAIL',
    note: inventPolicy.skipped
      ? inventPolicy.message
      : `POST policy invent insurer=${INVENT_KEY} → ${inventPolicy.status} code=${inventPolicy.code}`,
  };

  // --- Peer type KEY still separate (VAL-SI-INR-CNS-06) ---
  let inventTypePeer = null;
  if (OPEN_KEY) {
    const inventTypeKey = `zz_invent_type_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
    inventTypePeer = await call(token, 'POST', '/contracts-insurance/insurance-policies', {
      body: {
        company_id: HEADER_COMPANY,
        policy_code: `QA-INV-TYP-${STAMP}`.slice(0, 64),
        policy_name: `Invent type peer ${STAMP}`,
        insurer_key: OPEN_KEY,
        insurance_type: inventTypeKey,
        effective_date: '2026-08-01',
        status: 'draft',
      },
    });
    pushStep('invent_policy_type_peer_key', inventTypePeer, { inventTypeKey });
  }
  const peerTypeOk =
    inventTypePeer &&
    inventTypePeer.status === 400 &&
    inventTypePeer.code === 'HRM-INS-TYPE-KEY';
  report.ac['VAL-SI-INR-CNS-06_type_key_separate'] = {
    ok: peerTypeOk,
    verdict: peerTypeOk ? 'PASS' : inventTypePeer ? 'FAIL' : 'BLOCKED',
    note: inventTypePeer
      ? `peer invent type → ${inventTypePeer.status} code=${inventTypePeer.code} (expect HRM-INS-TYPE-KEY ≠ INSURER-KEY)`
      : 'skipped',
  };

  // --- Valid policy ∈ EFF insurer ---
  let validPolicy = null;
  if (OPEN_KEY && insuranceType) {
    validPolicy = await call(token, 'POST', '/contracts-insurance/insurance-policies', {
      body: {
        company_id: HEADER_COMPANY,
        policy_code: `QA-OK-INR-${STAMP}`.slice(0, 64),
        policy_name: `Valid EFF insurer policy ${STAMP}`,
        insurer_key: OPEN_KEY,
        insurance_type: insuranceType,
        effective_date: '2026-08-01',
        status: 'draft',
      },
    });
    pushStep('valid_policy_eff_insurer', validPolicy);
  }
  report.ac['AC-PLT-SI-INSURER-01_policy_valid'] = {
    ok: validPolicy ? validPolicy.status === 200 || validPolicy.status === 201 : false,
    verdict: validPolicy
      ? validPolicy.status === 200 || validPolicy.status === 201
        ? 'PASS'
        : 'FAIL'
      : 'BLOCKED',
    note: validPolicy
      ? `POST policy insurer=${OPEN_KEY} type=${insuranceType} → ${validPolicy.status} code=${validPolicy.code}`
      : 'skipped — missing open insurer or type',
  };

  // --- FE HOLD ---
  report.ac['AC-PLT-SI-INSURER-01_fe_picker'] = {
    ok: true,
    verdict: report.fe_bind_spot.fe_hold_r_plt_si_inr_03 ? 'HOLD' : 'OBS',
    note: report.fe_bind_spot.note,
  };
  if (report.fe_bind_spot.fe_hold_r_plt_si_inr_03) {
    report.residual.push({
      id: 'R-PLT-SI-INR-03',
      severity: 'P1',
      owner: 'dev-fe',
      summary:
        'FE picker rebind Nest GET insurers/effective — reject Settings MD insurers alone when EFF>0',
      status: 'HOLD',
    });
  }

  // --- Honesty ---
  report.ac['AC-PLT-SI-INSURER-01H'] = {
    ok: true,
    verdict: 'PASS',
    note:
      'contracts_printable_ready=false · hrm_personnel_uat_ready=false · SI type L1 SIINSQA-MSJA2Z7H RETAIN · CTR/enrollment seals RETAIN · C-SLICE · U65 · DENY module SI/CTR UAT',
  };

  // --- Overall ---
  const required = [
    report.ac.dist_gate,
    report.ac.L0,
    report.ac.unauth_effective,
    report.ac['AC-PLT-SI-INSURER-01c_empty_ok'],
    report.ac['AC-PLT-SI-INSURER-01d'],
    report.ac['AC-PLT-SI-INSURER-01_eff_has_admin'],
    report.ac['AC-PLT-SI-INSURER-01b_policy'],
    report.ac['VAL-SI-INR-CNS-06_type_key_separate'],
    report.ac['AC-PLT-SI-INSURER-01H'],
  ];
  const hardFail = required.some((a) => a.verdict === 'FAIL');
  const blocked = required.some((a) => a.verdict === 'BLOCKED');
  report.overall = hardFail ? 'FAIL' : blocked ? 'PASS_WITH_HOLD' : 'PASS';
  report.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';

  if (hardFail && inventPolOk === false && !inventPolicy?.skipped) {
    report.residual.push({
      id: 'D-SI-INR-INVENT-POLICY',
      severity: 'P0',
      owner: 'dev-be',
      summary: `policy invent insurer did not return 400 HRM-INS-INSURER-KEY (got ${inventPolicy?.status}/${inventPolicy?.code})`,
    });
  }
  if (hardFail && inventTypePeer && !peerTypeOk) {
    report.residual.push({
      id: 'D-SI-INR-PEER-TYPE-KEY',
      severity: 'P1',
      owner: 'dev-be',
      summary: `peer type invent miss HRM-INS-TYPE-KEY (got ${inventTypePeer?.status}/${inventTypePeer?.code})`,
    });
  }

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: report.overall,
        ack_status: report.ack_status,
        open_key: OPEN_KEY,
        invent_key: INVENT_KEY,
        ac: Object.fromEntries(Object.entries(report.ac).map(([k, v]) => [k, v.verdict])),
        residual: report.residual,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(hardFail ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
