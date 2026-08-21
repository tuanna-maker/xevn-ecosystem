#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01 — L1 API smoke + FE HOLD spot
 * U65 zero-seed · honesty LOCKED false · C-SLICE-≠-MODULE
 * AC-PLT-SI-INS-01* · invent → HRM-INS-TYPE-KEY when EFF>0
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
const STAMP = `SIINSQA-${Date.now().toString(36).toUpperCase()}`;
const OPEN_KEY = `hr_si_cat_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const INVENT_KEY = `zz_invent_si_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.json',
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

function effKeys(data) {
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
    has_si_insurance_type_service_js: false,
    has_si_insurance_type_constants_js: false,
    controller_has_effective_route: false,
    controller_mtime: null,
    service_mtime: null,
    stale_dist: false,
  };
  if (!existsSync(distCi)) {
    out.stale_dist = true;
    return out;
  }
  out.dist_files = readdirSync(distCi);
  out.has_si_insurance_type_service_js = out.dist_files.includes('si-insurance-type.service.js');
  out.has_si_insurance_type_constants_js = out.dist_files.includes('si-insurance-type.constants.js');
  const ctrlPath = join(distCi, 'contracts-insurance.controller.js');
  if (existsSync(ctrlPath)) {
    const t = readFileSync(ctrlPath, 'utf8');
    out.controller_has_effective_route = t.includes('insurance-types/effective');
    out.controller_mtime = statSync(ctrlPath).mtime.toISOString();
  }
  const svcPath = join(distCi, 'si-insurance-type.service.js');
  if (existsSync(svcPath)) out.service_mtime = statSync(svcPath).mtime.toISOString();
  out.stale_dist = !(
    out.has_si_insurance_type_service_js &&
    out.has_si_insurance_type_constants_js &&
    out.controller_has_effective_route
  );
  return out;
}

function feBindSpot() {
  const picker = resolve(ROOT, 'apps/web/hrm/src/lib/catalogSearchPicker.ts');
  const addDlg = resolve(ROOT, 'apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx');
  const policyPanel = resolve(
    ROOT,
    'apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx',
  );
  const out = {
    picker_uses_settings_md: false,
    picker_calls_nest_effective: false,
    add_dialog_exists: existsSync(addDlg),
    policy_panel_exists: existsSync(policyPanel),
    fe_hold_r_plt_si_ins_03: true,
    note: '',
  };
  if (existsSync(picker)) {
    const t = readFileSync(picker, 'utf8');
    out.picker_uses_settings_md = /insurance_types/.test(t) && /Settings/.test(t);
    out.picker_calls_nest_effective = /insurance-types\/effective/.test(t);
  }
  out.fe_hold_r_plt_si_ins_03 = !out.picker_calls_nest_effective;
  out.note = out.fe_hold_r_plt_si_ins_03
    ? 'FE still Settings MD insurance_types SoT — browser picker OBS / HOLD R-PLT-SI-INS-03'
    : 'FE bound Nest EFF — browser UF eligible';
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01',
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
      ? 'si-insurance-type.* + insurance-types/effective in dist'
      : 'STALE DIST — missing si-insurance-type and/or effective route',
  };
  if (!distOk) {
    report.residual.push({
      id: 'D-SI-INS-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      summary: 'hrm-api dist missing si-insurance-type.service.js and/or insurance-types/effective',
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
  const unauthEff = await call(null, 'GET', '/contracts-insurance/insurance-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('unauth_effective', unauthEff);
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
    report.residual.push({ id: 'D-SI-INS-LOGIN', severity: 'P0', owner: 'devops', summary: 'ceo login failed' });
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    process.exit(2);
  }
  const token = auth.token;

  // --- GET effective (empty [] OK) ---
  const eff0 = await call(token, 'GET', '/contracts-insurance/insurance-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('get_effective_baseline', eff0, { keys: effKeys(eff0.data) });
  const effList0 = asList(eff0.data);
  const effCount0 = eff0.data?.total ?? effList0.length;
  const effOk = eff0.status === 200 && (Array.isArray(eff0.data?.data) || Array.isArray(eff0.data) || eff0.data?.total === 0);
  report.ac['AC-PLT-SI-INS-01c_empty_ok'] = {
    ok: effOk,
    verdict: effOk ? 'PASS' : 'FAIL',
    note: `GET effective → ${eff0.status} count=${effCount0} (empty [] OK · no seed)`,
  };

  // --- Admin CREATE N+1 (01d L1) ---
  const createAdmin = await call(token, 'PUT', '/contracts-insurance/insurance-types', {
    body: {
      companyId: HEADER_COMPANY,
      insuranceTypeKey: OPEN_KEY,
      nameVi: `QA SI type ${STAMP}`,
      sortOrder: 90,
      isStatutory: false,
      eligibleForRateCfg: true,
      requiresPolicy: false,
      status: 'active',
    },
  });
  pushStep('admin_create_01d', createAdmin);
  const adminOk = createAdmin.status === 200 || createAdmin.status === 201;
  report.ac['AC-PLT-SI-INS-01d'] = {
    ok: adminOk,
    verdict: adminOk ? 'PASS' : 'FAIL',
    note: `PUT insurance-types key=${OPEN_KEY} → ${createAdmin.status} code=${createAdmin.code}`,
  };

  const eff1 = await call(token, 'GET', '/contracts-insurance/insurance-types/effective', {
    query: { company_id: HEADER_COMPANY },
  });
  const keys1 = effKeys(eff1.data);
  pushStep('get_effective_after_admin', eff1, { keys: keys1, hasOpenKey: keys1.includes(OPEN_KEY) });
  const effGt0 = (eff1.data?.total ?? keys1.length) > 0 && keys1.includes(OPEN_KEY);
  report.ac['AC-PLT-SI-INS-01_eff_has_admin'] = {
    ok: eff1.status === 200 && effGt0,
    verdict: eff1.status === 200 && effGt0 ? 'PASS' : 'FAIL',
    note: `EFF after admin count=${eff1.data?.total ?? keys1.length} hasOpenKey=${keys1.includes(OPEN_KEY)}`,
  };

  // --- Resolve insurer for policy invent (Settings MD insurers — OUT of Nest fold; use live catalog) ---
  let insurerKey = null;
  const polList = await call(token, 'GET', '/contracts-insurance/insurance-policies', {
    query: { company_id: HEADER_COMPANY },
  });
  pushStep('list_policies_for_insurer', polList);
  const polRows = asList(polList.data);
  if (polRows[0]?.insurer_key) insurerKey = polRows[0].insurer_key;

  if (!insurerKey) {
    // try settings-catalogs effective insurers
    const insurers = await call(token, 'GET', '/settings-catalogs/effective', {
      query: { company_id: HEADER_COMPANY, catalog_key: 'insurers' },
    });
    pushStep('settings_insurers_effective', insurers);
    const insRows = asList(insurers.data);
    insurerKey = insRows[0]?.code || insRows[0]?.key || null;
  }

  // Fallback: settings defaults items path variants
  if (!insurerKey) {
    for (const path of [
      '/settings/catalogs/insurers/effective',
      '/settings-defaults/catalogs/insurers',
    ]) {
      const r = await call(token, 'GET', path, { query: { company_id: HEADER_COMPANY } });
      pushStep(`insurer_probe_${path}`, r);
      const rows = asList(r.data);
      if (rows[0]?.code || rows[0]?.key) {
        insurerKey = rows[0].code || rows[0].key;
        break;
      }
    }
  }

  report.insurer_key_used = insurerKey;

  // --- Invent policy when EFF>0 ---
  let inventPolicy = null;
  if (insurerKey) {
    inventPolicy = await call(token, 'POST', '/contracts-insurance/insurance-policies', {
      body: {
        company_id: HEADER_COMPANY,
        policy_code: `QA-INV-${STAMP}`.slice(0, 64),
        policy_name: `Invent policy ${STAMP}`,
        insurer_key: insurerKey,
        insurance_type: INVENT_KEY,
        effective_date: '2026-08-01',
        status: 'draft',
      },
    });
  } else {
    inventPolicy = {
      status: 0,
      code: null,
      message: 'no insurer_key available — cannot reach type assert without insurer fail first',
      skipped: true,
    };
  }
  pushStep('invent_policy_01b', inventPolicy);
  const inventPolOk =
    inventPolicy.status === 400 && inventPolicy.code === 'HRM-INS-TYPE-KEY';
  report.ac['AC-PLT-SI-INS-01b_policy'] = {
    ok: inventPolOk,
    verdict: inventPolOk ? 'PASS' : inventPolicy.skipped ? 'BLOCKED' : 'FAIL',
    note: inventPolicy.skipped
      ? inventPolicy.message
      : `POST policy invent=${INVENT_KEY} → ${inventPolicy.status} code=${inventPolicy.code}`,
  };

  // --- Invent enrollment (VAL-SI-CNS-02) ---
  // DTO IsIn closed enum — free invent key may fail class-validator before KEY.
  // Prefer IsIn-allowed key NOT in EFF (e.g. accident) to hit Nest assert.
  const empList = await call(token, 'GET', '/employees', {
    query: { company_id: HEADER_COMPANY, page_size: 5 },
  });
  pushStep('list_employees', empList);
  const empRows = asList(empList.data);
  const employeeId = empRows[0]?.id || empRows[0]?.employee_id || null;
  report.employee_id_used = employeeId;

  let inventEnrollFree = null;
  let inventEnrollEnum = null;
  if (employeeId) {
    inventEnrollFree = await call(token, 'POST', '/employee-insurances', {
      body: {
        company_id: HEADER_COMPANY,
        employee_id: employeeId,
        type: INVENT_KEY,
        provider: 'QA Invent Provider',
        status: 'active',
      },
    });
    pushStep('invent_enrollment_free_text', inventEnrollFree);

    // Pick enum key not in EFF
    const enumCandidates = ['accident', 'life', 'unemployment', 'health', 'social'];
    const inventEnumType = enumCandidates.find((k) => !keys1.map((x) => x.toLowerCase()).includes(k.toLowerCase())) || 'accident';
    inventEnrollEnum = await call(token, 'POST', '/employee-insurances', {
      body: {
        company_id: HEADER_COMPANY,
        employee_id: employeeId,
        type: inventEnumType,
        provider: 'QA Invent Provider Enum',
        status: 'active',
      },
    });
    pushStep('invent_enrollment_enum_oos', inventEnrollEnum, { inventEnumType });
  } else {
    pushStep('invent_enrollment', { status: 0, skipped: true, message: 'no employee' });
  }

  const enrollKeyHit =
    (inventEnrollEnum && inventEnrollEnum.status === 400 && inventEnrollEnum.code === 'HRM-INS-TYPE-KEY') ||
    (inventEnrollFree && inventEnrollFree.status === 400 && inventEnrollFree.code === 'HRM-INS-TYPE-KEY');
  const enrollDtoBlocked =
    inventEnrollFree &&
    inventEnrollFree.status === 400 &&
    inventEnrollFree.code !== 'HRM-INS-TYPE-KEY' &&
    !enrollKeyHit;

  report.ac['AC-PLT-SI-INS-01b_enrollment'] = {
    ok: enrollKeyHit,
    verdict: enrollKeyHit ? 'PASS' : employeeId ? 'FAIL' : 'BLOCKED',
    note: enrollKeyHit
      ? `enrollment invent → 400 HRM-INS-TYPE-KEY (free=${inventEnrollFree?.code} enum=${inventEnrollEnum?.code})`
      : enrollDtoBlocked
        ? `DTO blocked free invent before KEY (free status=${inventEnrollFree?.status} code=${inventEnrollFree?.code}); enum invent status=${inventEnrollEnum?.status} code=${inventEnrollEnum?.code}`
        : `enrollment invent miss KEY · free=${inventEnrollFree?.status}/${inventEnrollFree?.code} enum=${inventEnrollEnum?.status}/${inventEnrollEnum?.code}`,
  };

  // --- Valid consumer create with EFF key (policy) — proves assert soft path for in-catalog ---
  let validPolicy = null;
  if (insurerKey && OPEN_KEY) {
    validPolicy = await call(token, 'POST', '/contracts-insurance/insurance-policies', {
      body: {
        company_id: HEADER_COMPANY,
        policy_code: `QA-OK-${STAMP}`.slice(0, 64),
        policy_name: `Valid EFF policy ${STAMP}`,
        insurer_key: insurerKey,
        insurance_type: OPEN_KEY,
        effective_date: '2026-08-01',
        status: 'draft',
      },
    });
    pushStep('valid_policy_eff_key', validPolicy);
  }
  report.ac['AC-PLT-SI-INS-01_policy_valid'] = {
    ok: validPolicy ? validPolicy.status === 200 || validPolicy.status === 201 : false,
    verdict: validPolicy
      ? validPolicy.status === 200 || validPolicy.status === 201
        ? 'PASS'
        : 'FAIL'
      : 'BLOCKED',
    note: validPolicy
      ? `POST policy type=${OPEN_KEY} → ${validPolicy.status} code=${validPolicy.code}`
      : 'skipped — no insurer',
  };

  // --- FE HOLD ---
  report.ac['AC-PLT-SI-INS-01_fe_picker'] = {
    ok: true,
    verdict: report.fe_bind_spot.fe_hold_r_plt_si_ins_03 ? 'HOLD' : 'OBS',
    note: report.fe_bind_spot.note,
  };
  if (report.fe_bind_spot.fe_hold_r_plt_si_ins_03) {
    report.residual.push({
      id: 'R-PLT-SI-INS-03',
      severity: 'P1',
      owner: 'dev-fe',
      summary: 'FE picker rebind Nest GET insurance-types/effective — reject MD-alone SoT',
      status: 'HOLD',
    });
  }

  // --- Honesty ---
  report.ac['AC-PLT-SI-INS-01H'] = {
    ok: true,
    verdict: 'PASS',
    note: 'contracts_printable_ready=false · hrm_personnel_uat_ready=false · CTR/enrollment seals RETAIN · C-SLICE · U65 · DENY module SI/CTR UAT',
  };

  // --- Overall ---
  const required = [
    report.ac.dist_gate,
    report.ac.L0,
    report.ac.unauth_effective,
    report.ac['AC-PLT-SI-INS-01c_empty_ok'],
    report.ac['AC-PLT-SI-INS-01d'],
    report.ac['AC-PLT-SI-INS-01_eff_has_admin'],
    report.ac['AC-PLT-SI-INS-01b_policy'],
    report.ac['AC-PLT-SI-INS-01b_enrollment'],
    report.ac['AC-PLT-SI-INS-01H'],
  ];
  const hardFail = required.some((a) => a.verdict === 'FAIL');
  const blocked = required.some((a) => a.verdict === 'BLOCKED');
  report.overall = hardFail ? 'FAIL' : blocked ? 'PASS_WITH_HOLD' : 'PASS';
  // FE HOLD alone does not FAIL L1 wave — parallel_note allows OBS
  report.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';

  if (hardFail && inventPolOk === false && !inventPolicy?.skipped) {
    report.residual.push({
      id: 'D-SI-INS-INVENT-POLICY',
      severity: 'P0',
      owner: 'dev-be',
      summary: `policy invent did not return 400 HRM-INS-TYPE-KEY (got ${inventPolicy?.status}/${inventPolicy?.code})`,
    });
  }
  if (hardFail && !enrollKeyHit && employeeId) {
    report.residual.push({
      id: 'D-SI-INS-INVENT-ENROLL',
      severity: 'P1',
      owner: 'dev-be',
      summary: `enrollment invent miss HRM-INS-TYPE-KEY — free=${inventEnrollFree?.status}/${inventEnrollFree?.code} enum=${inventEnrollEnum?.status}/${inventEnrollEnum?.code}; DTO IsIn may block open catalog`,
    });
  }

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: report.overall,
        ack_status: report.ack_status,
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
