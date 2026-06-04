#!/usr/bin/env node
/**
 * P1-EX-DO-SEED-CONTRACTS-HTTPS-09 — seed contracts + insurance for main-scope employees on HTTPS pilot.
 */
import { createHash } from 'node:crypto';

const PORTAL = (process.env.PORTAL_DEV_URL || 'https://14-225-217-232.nip.io').replace(/\/+$/, '');
const TAG = process.env.HRM_FIDELITY_SEED_TAG ?? 'p1-ex-do-seed-contracts-https-09';
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const COHORT_MAX = Number(process.env.HRM_CONTRACT_COHORT_MAX ?? 217); // ~85% of 255

/** MaxLength(40) on CreateContractDto — use short labels for API POST. */
const CONTRACT_TYPES = ['HDLD_KTH', 'HDLD_XDHN_12', 'HDLD_XDHN_36'];
const PROVIDERS = ['Bảo Việt', 'PVI', 'MIC', 'Bảo Minh'];

function hashByte(seed) {
  return createHash('sha256').update(seed).digest()[0];
}

function inCohort(key) {
  return hashByte(`${TAG}:contract:${key}`) < COHORT_MAX;
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code };
}

function listPayload(body) {
  const inner = body?.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const rows = inner.data ?? inner.items ?? [];
    const total = inner.total ?? rows.length;
    return { rows, total };
  }
  if (Array.isArray(inner)) return { rows: inner, total: inner.length };
  return { rows: [], total: 0 };
}

async function portalLogin() {
  const { status, body } = await fetchJson(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = body?.data ?? body;
  const token = data?.access_token ?? data?.accessToken;
  return { ok: (status === 200 || status === 201) && Boolean(token), token, data };
}

function sessionHeaders(token, data) {
  const tenant = data?.defaultTenantId ?? data?.default_tenant_id ?? 'xevn';
  const company = data?.defaultCompanyId ?? data?.default_company_id ?? 'main';
  return {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
  };
}

async function main() {
  const login = await portalLogin();
  if (!login.ok) {
    console.error('Login failed');
    process.exit(1);
  }

  const headers = sessionHeaders(login.token, login.data);

  const empRes = await fetchJson(
    `${PORTAL}/api/hrm/employees?company_id=main&page_size=100`,
    { headers },
  );
  const { rows: employees, total: empTotal } = listPayload(empRes.body);
  if (empRes.status !== 200 || employees.length === 0) {
    console.error('No employees in main scope', empRes.status, empRes.code, empTotal);
    process.exit(1);
  }

  let contractsCreated = 0;
  let insuranceCreated = 0;
  let skipped = 0;
  const errors = [];

  for (const emp of employees) {
    const code = emp.employee_code ?? emp.employeeCode ?? emp.id;
    if (!inCohort(String(code))) {
      skipped += 1;
      continue;
    }

    const companyId = emp.company_id ?? emp.companyId;
    const employeeId = emp.id ?? emp.employee_id;
    if (!companyId || !employeeId) {
      errors.push({ employeeId, reason: 'missing company_id or id' });
      continue;
    }

    const seqNum = Number(String(code).replace(/\D/g, '')) || hashByte(String(code));
    const contractType = CONTRACT_TYPES[seqNum % CONTRACT_TYPES.length];
    const provider = PROVIDERS[seqNum % PROVIDERS.length];

    const contractBody = {
      company_id: 'main',
      employee_id: employeeId,
      contract_type: contractType,
      start_date: '2024-01-01',
      end_date: '2026-12-31',
    };

    const cRes = await fetchJson(`${PORTAL}/api/hrm/contracts-insurance/contracts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contractBody),
    });
    if (cRes.status === 201 || cRes.code === 'HRM-CON-201') {
      contractsCreated += 1;
    } else {
      errors.push({ employeeId, op: 'contract', status: cRes.status, code: cRes.code });
    }

    const insBody = {
      company_id: 'main',
      employee_id: employeeId,
      provider,
      policy_number: `BH-${TAG}-${String(code).replace(/\W/g, '').slice(0, 24)}`,
      expiry_date: '2027-06-30',
    };

    const iRes = await fetchJson(`${PORTAL}/api/hrm/contracts-insurance/insurance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(insBody),
    });
    if (iRes.status === 201 || iRes.code === 'HRM-CON-202') {
      insuranceCreated += 1;
    } else {
      errors.push({ employeeId, op: 'insurance', status: iRes.status, code: iRes.code });
    }
  }

  const contractsList = await fetchJson(
    `${PORTAL}/api/hrm/contracts-insurance/contracts?company_id=main&page_size=100`,
    { headers },
  );
  const insuranceList = await fetchJson(
    `${PORTAL}/api/hrm/contracts-insurance/insurance?company_id=main&page_size=100`,
    { headers },
  );

  const { total: contractTotal, rows: contractRows } = listPayload(contractsList.body);
  const { total: insuranceTotal, rows: insuranceRows } = listPayload(insuranceList.body);

  const first = contractRows[0];
  let employeeProbe = null;
  if (first?.employee_id) {
    const probe = await fetchJson(
      `${PORTAL}/api/hrm/employees/${first.employee_id}?company_id=main`,
      { headers },
    );
    employeeProbe = {
      status: probe.status,
      code: probe.code,
      employee_id: first.employee_id,
    };
  }

  const result = {
    seed_tag: TAG,
    portal: PORTAL,
    employees_fetched: employees.length,
    employees_emp_total: empTotal,
    contracts_posted: contractsCreated,
    insurance_posted: insuranceCreated,
    skipped_cohort: skipped,
    errors_sample: errors.slice(0, 5),
    errors_count: errors.length,
    contracts_list_total: contractTotal,
    insurance_list_total: insuranceTotal,
    employee_probe: employeeProbe,
    sample_contract_row: first
      ? { id: first.id, employee_id: first.employee_id, company_id: first.company_id }
      : null,
  };

  console.log(JSON.stringify(result, null, 2));

  const pass =
    contractTotal > 0 &&
    insuranceTotal > 0 &&
    employeeProbe?.status === 200 &&
    employeeProbe?.code === 'HRM-EMP-200';

  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
