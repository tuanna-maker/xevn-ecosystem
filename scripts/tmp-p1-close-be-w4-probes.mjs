/**
 * P1-CLOSE-BE-W4 — operations tasks/service-requests company_id=main rollup.
 * Usage: node scripts/tmp-p1-close-be-w4-probes.mjs
 */
const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const TENANT = 'xevn';
const COMPANY = 'main';

const headers = (extra = {}) => ({
  'x-internal-api-key': INTERNAL,
  'x-tenant-id': TENANT,
  'x-company-id': COMPANY,
  ...extra,
});

async function req(method, path, body) {
  const res = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      ...headers(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function probe(name, method, path, body, expectCode) {
  const { status, json } = await req(method, path, body);
  const code = json.code ?? json?.data?.code;
  const ok = status < 400 && (!expectCode || code === expectCode);
  const row = { name, method, path, status, code, ok };
  console.log(JSON.stringify(row));
  return row;
}

const rows = [];

rows.push(
  await probe(
    'HRM-OP-02 list tasks main',
    'GET',
    `/operations/tasks?company_id=${COMPANY}&page=1&page_size=10`,
    null,
    'HRM-OPS-200',
  ),
);

rows.push(
  await probe(
    'HRM-SV-02 list service-requests main',
    'GET',
    `/operations/service-requests?company_id=${COMPANY}`,
    null,
    'HRM-SVC-200',
  ),
);

rows.push(
  await probe(
    'HRM-OP-01 create task main',
    'POST',
    '/operations/tasks',
    {
      company_id: COMPANY,
      title: 'P1-CLOSE-BE-W4 probe task',
      priority: 'medium',
    },
    'HRM-OPS-201',
  ),
);

rows.push(
  await probe(
    'HRM-SV-01 create service-request main',
    'POST',
    '/operations/service-requests',
    {
      company_id: COMPANY,
      service_type: 'meal',
      employee_name: 'Probe NV',
      request_date: '2026-05-25',
    },
    'HRM-SVC-201',
  ),
);

rows.push(
  await probe(
    'HRM-OP-04 summary main',
    'GET',
    `/operations/reports/summary?tenant_id=${TENANT}&company_id=${COMPANY}`,
    null,
    'HRM-OPS-200',
  ),
);

const fails = rows.filter((r) => !r.ok).length;
console.log(`\n=== Summary: ${fails === 0 ? 'ALL PASS' : `${fails} FAIL`} / ${rows.length} probes ===`);
if (fails > 0) process.exit(1);
