#!/usr/bin/env node
/**
 * QA-D-BE-CTR-CB-BOOT-01 — L1 API only (U65 zero-seed; no browser J-*)
 * POST compensation-packages bootstrap · GET contract-create-context si_base
 * VAL-400 · OVERLAP-409 · AuthZ-403 · mutate packages path only
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const SUB_EMAIL = process.env.QA_SUB_EMAIL || 'du-lich.ceo@xe.vn';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-d-be-ctr-cb-boot-01.json');
const STAMP = `CTRCBOOTQA-${Date.now().toString(36).toUpperCase()}`;
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-D-BE-CTR-CB-BOOT-01',
  parent: 'D-BE-CTR-CB-BOOT-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY, authz_deny: SUB_EMAIL },
  env: { HRM, XBOS, TENANT, commit: COMMIT },
  u65: 'zero-seed-l1-api-only',
  seed_used: false,
  honesty: {
    contracts_printable_ready: false,
    c_slice_ne_module: true,
    browser_j_hrm_ctr_cb_boot_01: 'NOT_PROMOTED',
    uf_hrm_10: false,
  },
  network: [],
  checks: {},
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function track(method, path, status, code) {
  R.network.push({ method, path, status, code, at: ts() });
}

async function login(email = EMAIL, password = PASSWORD) {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken ?? j?.data?.access_token;
  if (!token) throw new Error(`login failed ${email}: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  return token;
}

async function api(method, path, token, body, opts = {}) {
  const company = opts.companyId ?? COMPANY;
  const tenant = opts.tenantId ?? TENANT;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': company,
    'x-tenant-id': tenant,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(`${HRM}${path}`, init);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  const code = json?.error?.code ?? json?.code ?? json?.error?.alias ?? null;
  track(method, path.split('?')[0], r.status, code);
  return {
    status: r.status,
    code,
    alias: json?.error?.alias ?? json?.data?.alias ?? null,
    message: json?.message ?? json?.error?.message ?? null,
    json,
    snippet: text.slice(0, 800),
  };
}

function errCode(res) {
  return (
    res.code ||
    res.alias ||
    res.json?.error?.code ||
    res.json?.error?.details?.alias ||
    res.json?.error?.alias ||
    null
  );
}

function bootstrapBody(employeeId, baseAmt, siAmt, effectiveFrom, companyId = COMPANY) {
  return {
    company_id: companyId,
    employee_id: employeeId,
    effective_from: effectiveFrom,
    change_reason: 'ctr_workspace_bootstrap',
    lines: [
      { line_type: 'base', amount: baseAmt, component_code: 'base' },
      {
        line_type: 'allowance',
        amount: siAmt,
        allowance_code: 'si_base',
        component_code: 'si_base',
      },
    ],
  };
}

function passFail(ok, detail) {
  return { pass: !!ok, ...detail };
}

function isHoldingScope(companyId) {
  const c = String(companyId || '').toLowerCase();
  return c === 'holding' || c === 'main' || c === 'xevn';
}

async function findBootstrapEmployee(token) {
  const candidates = [];
  let preferred = null;
  for (let page = 1; page <= 8; page++) {
    const list = await api(
      'GET',
      `/api/hrm/employees?company_id=${COMPANY}&page=${page}&page_size=25`,
      token,
    );
    const items =
      list.json?.data?.data ||
      list.json?.data?.items ||
      list.json?.data ||
      list.json?.items ||
      [];
    if (!Array.isArray(items) || items.length === 0) break;
    for (const e of items) {
      if (!e?.id) continue;
      const pkgs = await api(
        'GET',
        `/api/hrm/contracts-insurance/compensation-packages?company_id=${COMPANY}&employee_id=${e.id}&page_size=5`,
        token,
      );
      const rows =
        pkgs.json?.data?.data ||
        pkgs.json?.data?.items ||
        pkgs.json?.data ||
        [];
      const count = Array.isArray(rows) ? rows.length : Number(pkgs.json?.data?.total ?? 0);
      const ctx = await api(
        'GET',
        `/api/hrm/contracts-insurance/employees/${e.id}/contract-create-context?company_id=${COMPANY}`,
        token,
      );
      const snap = ctx.json?.data?.compensation_snapshot || ctx.json?.compensation_snapshot || null;
      // AS-IS: empty package still returns compensation_snapshot.cb_masked=true when !pkg
      // — treat package list empty + null salaries as bootstrap-eligible (ignore cb_masked).
      const pkgEmpty = !Array.isArray(rows) || rows.length === 0 || count === 0;
      const salariesEmpty =
        !snap ||
        (snap.base_salary_vnd == null && snap.insurance_salary_vnd == null);
      const empty = pkgEmpty && salariesEmpty;
      const row = {
        id: e.id,
        code: e.employee_code || e.code,
        company_id: e.company_id,
        pkg_status: pkgs.status,
        pkg_count: Array.isArray(rows) ? rows.length : count,
        ctx_status: ctx.status,
        snap,
        empty,
      };
      candidates.push(row);
      if (
        empty &&
        pkgs.status === 200 &&
        ctx.status === 200 &&
        isHoldingScope(e.company_id) &&
        !preferred
      ) {
        preferred = row;
      }
    }
  }
  if (preferred) return { employee: preferred, scanned: candidates };
  const fallback = candidates.find((c) => c.empty && isHoldingScope(c.company_id));
  return { employee: fallback || null, scanned: candidates };
}

async function main() {
  const token = await login();
  R.checks.login = passFail(true, { email: EMAIL });

  const subToken = await login(SUB_EMAIL);
  R.checks.login_sub = passFail(true, { email: SUB_EMAIL });

  const found = await findBootstrapEmployee(token);
  R.checks.employee_scan = {
    scanned: found.scanned.length,
    empty_found: !!found.employee,
    sample: found.scanned.slice(0, 5),
    chosen: found.employee,
  };

  if (!found.employee) {
    R.checks.bootstrap_201 = passFail(false, {
      reason: 'No employee with empty C&B snapshot in first pages — cannot exercise happy path live without inventing/seed',
    });
    R.residuals.push({
      id: 'R-CTR-CB-BOOT-NO-EMPTY-EMP',
      sev: 'P1',
      note: 'Live happy-path blocked: no empty-package employee in scanned pages. VAL/OVERLAP/AUTHZ may still run on known emp if available.',
    });
  }

  const empId = found.employee?.id;
  const empCompany = found.employee?.company_id || 'holding';
  const today = new Date().toISOString().slice(0, 10);
  const BASE = 15_500_000;
  const SI = 12_300_000; // intentionally != BASE (sponsor Q-S2 / §10b independent)

  // AuthZ deny: subsidiary CEO must not mutate C&B (CORE-02 seal pattern).
  // Use body company_id=main + subsidiary tenant headers — avoid SCOPE_CONTEXT noise from holding body.
  const authzTarget =
    empId ||
    found.scanned.find((c) => isHoldingScope(c.company_id))?.id ||
    found.scanned.find((c) => c.id)?.id ||
    '22222222-2222-4222-8222-222222222222';
  const authzPost = await api(
    'POST',
    '/api/hrm/contracts-insurance/compensation-packages',
    subToken,
    bootstrapBody(authzTarget, BASE, SI, today, COMPANY),
    { companyId: COMPANY, tenantId: TENANT },
  );
  const authzPost2 = await api(
    'POST',
    '/api/hrm/contracts-insurance/compensation-packages',
    subToken,
    bootstrapBody(authzTarget, BASE, SI, today, COMPANY),
    { companyId: 'xe-du-lich', tenantId: 'xe-du-lich' },
  );
  const authzGet = await api(
    'GET',
    `/api/hrm/contracts-insurance/compensation-packages?company_id=xe-du-lich&employee_id=${authzTarget}&page_size=1`,
    subToken,
    undefined,
    { companyId: 'xe-du-lich', tenantId: 'xe-du-lich' },
  );
  const authzOk =
    (authzPost.status === 403 &&
      String(errCode(authzPost) || '').includes('HRM-CORE-CB-AUTHZ-403')) ||
    (authzGet.status === 403 &&
      String(errCode(authzGet) || '').includes('HRM-CORE-CB-AUTHZ-403')) ||
    (authzPost2.status === 403 &&
      String(errCode(authzPost2) || '').includes('HRM-CORE-CB-AUTHZ-403'));
  R.checks.authz_403 = passFail(authzOk, {
    post_main: { status: authzPost.status, code: errCode(authzPost), snippet: authzPost.snippet.slice(0, 240) },
    post_sub: { status: authzPost2.status, code: errCode(authzPost2), snippet: authzPost2.snippet.slice(0, 240) },
    get_main: { status: authzGet.status, code: errCode(authzGet), snippet: authzGet.snippet.slice(0, 240) },
  });

  if (empId) {
    // VAL-400 amount <= 0
    const val0 = await api(
      'POST',
      '/api/hrm/contracts-insurance/compensation-packages',
      token,
      bootstrapBody(empId, 0, SI, today, empCompany),
    );
    const val0b = await api(
      'POST',
      '/api/hrm/contracts-insurance/compensation-packages',
      token,
      bootstrapBody(empId, BASE, 0, today, empCompany),
    );
    const valOk =
      (val0.status === 400 && String(errCode(val0)).includes('HRM-CORE-CB-VAL-400')) ||
      (val0b.status === 400 && String(errCode(val0b)).includes('HRM-CORE-CB-VAL-400'));
    R.checks.val_400 = passFail(valOk, {
      base_zero: { status: val0.status, code: errCode(val0), message: val0.message },
      si_zero: { status: val0b.status, code: errCode(val0b), message: val0b.message },
    });

    // Happy path POST 201
    const created = await api(
      'POST',
      '/api/hrm/contracts-insurance/compensation-packages',
      token,
      bootstrapBody(empId, BASE, SI, today, empCompany),
    );
    const createdOk =
      created.status === 201 &&
      (String(errCode(created) || created.json?.code || '').includes('HRM-COMP-201') ||
        created.status === 201);
    R.checks.bootstrap_201 = passFail(createdOk, {
      status: created.status,
      code: errCode(created) || created.json?.code,
      package_id: created.json?.data?.id,
      employee_id: empId,
      company_id: empCompany,
      lines: (created.json?.data?.lines || []).map((l) => ({
        line_type: l.line_type,
        component_code: l.component_code,
        allowance_code: l.allowance_code,
        amount: l.amount,
      })),
      snippet: created.snippet.slice(0, 400),
    });

    // GET create-context — insurance from si_base, base from base
    const ctx = await api(
      'GET',
      `/api/hrm/contracts-insurance/employees/${empId}/contract-create-context?company_id=${COMPANY}`,
      token,
    );
    const snap =
      ctx.json?.data?.compensation_snapshot || ctx.json?.compensation_snapshot || {};
    const baseOk = Number(snap.base_salary_vnd) === BASE;
    const siOk = Number(snap.insurance_salary_vnd) === SI;
    const independent = SI !== BASE && siOk && baseOk;
    R.checks.create_context_snapshot = passFail(ctx.status === 200 && independent, {
      status: ctx.status,
      base_salary_vnd: snap.base_salary_vnd,
      insurance_salary_vnd: snap.insurance_salary_vnd,
      expect_base: BASE,
      expect_si: SI,
      allowances: snap.allowances,
      note: 'insurance_salary_vnd MUST come from si_base (≠ fallback base alone)',
    });

    // OVERLAP-409 duplicate period
    const overlap = await api(
      'POST',
      '/api/hrm/contracts-insurance/compensation-packages',
      token,
      bootstrapBody(empId, BASE + 1, SI + 1, today, empCompany),
    );
    const overlapCode = String(errCode(overlap) || '');
    const overlapOk =
      overlap.status === 409 &&
      (overlapCode.includes('HRM-COMP-409-OVERLAP') ||
        overlapCode.includes('HRM-CORE-CB-OVERLAP-409') ||
        String(JSON.stringify(overlap.json)).includes('OVERLAP'));
    R.checks.overlap_409 = passFail(overlapOk, {
      status: overlap.status,
      code: errCode(overlap),
      alias: overlap.json?.error?.alias || overlap.json?.error?.details?.alias,
      snippet: overlap.snippet.slice(0, 300),
    });

    // DENY contract salary SoT mutate — GET contracts list fields; ensure bootstrap network only packages
    const contracts = await api(
      'GET',
      `/api/hrm/contracts-insurance/contracts?company_id=${COMPANY}&employee_id=${empId}&page_size=5`,
      token,
    );
    const contractRows =
      contracts.json?.data?.data ||
      contracts.json?.data?.items ||
      contracts.json?.data ||
      [];
    const salaryKeysOnContract = [];
    for (const row of Array.isArray(contractRows) ? contractRows : []) {
      for (const k of Object.keys(row || {})) {
        if (/insurance_salary|bhxh|salary_vnd|base_salary|si_base/i.test(k)) {
          salaryKeysOnContract.push({ id: row.id, key: k, value: row[k] });
        }
      }
    }
    const mutatePaths = R.network
      .filter((n) => n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH')
      .map((n) => n.path);
    const onlyPackagesMutate = mutatePaths.every((p) =>
      p.includes('/contracts-insurance/compensation-packages'),
    );
    const noNestCore = !R.network.some((n) => /\/api\/hrm\/core(\/|$)/.test(n.path));
    R.checks.network_packages_only = passFail(onlyPackagesMutate && noNestCore, {
      mutate_paths: mutatePaths,
      salary_keys_on_contract_rows: salaryKeysOnContract,
      nest_core_hits: R.network.filter((n) => /\/api\/hrm\/core(\/|$)/.test(n.path)).length,
    });
  } else {
    // Still try VAL/OVERLAP against first scanned emp with packages (overlap expected; VAL may work)
    const any = found.scanned[0];
    if (any?.id) {
      const val0 = await api(
        'POST',
        '/api/hrm/contracts-insurance/compensation-packages',
        token,
        bootstrapBody(any.id, 0, SI, today),
      );
      R.checks.val_400 = passFail(
        val0.status === 400 && String(errCode(val0)).includes('HRM-CORE-CB-VAL-400'),
        { status: val0.status, code: errCode(val0), message: val0.message, emp: any.id },
      );
      const overlap = await api(
        'POST',
        '/api/hrm/contracts-insurance/compensation-packages',
        token,
        bootstrapBody(any.id, BASE, SI, today),
      );
      const oc = String(errCode(overlap) || '');
      R.checks.overlap_409 = passFail(
        overlap.status === 409 &&
          (oc.includes('OVERLAP') || oc.includes('HRM-COMP-409')),
        { status: overlap.status, code: errCode(overlap), snippet: overlap.snippet.slice(0, 300) },
      );
    }
    R.checks.create_context_snapshot = passFail(false, { reason: 'skipped — no empty employee' });
    R.checks.network_packages_only = passFail(
      R.network
        .filter((n) => ['POST', 'PUT', 'PATCH'].includes(n.method))
        .every((n) => n.path.includes('/contracts-insurance/compensation-packages')),
      {
        mutate_paths: R.network
          .filter((n) => ['POST', 'PUT', 'PATCH'].includes(n.method))
          .map((n) => n.path),
      },
    );
  }

  const required = [
    'authz_403',
    'val_400',
    'bootstrap_201',
    'create_context_snapshot',
    'overlap_409',
    'network_packages_only',
  ];
  const fails = required.filter((k) => R.checks[k] && R.checks[k].pass === false);
  const missing = required.filter((k) => !R.checks[k]);
  R.overall = fails.length === 0 && missing.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.fail_keys = fails;
  R.missing_keys = missing;
  R.endedAt = ts();
  writeFileSync(OUT, JSON.stringify(R, null, 2), 'utf8');
  console.log(JSON.stringify({ overall: R.overall, ack: R.ack_status, fails, stamp: STAMP, out: OUT }, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.fatal = String(e?.stack || e);
  R.endedAt = ts();
  writeFileSync(OUT, JSON.stringify(R, null, 2), 'utf8');
  console.error(e);
  process.exit(1);
});
