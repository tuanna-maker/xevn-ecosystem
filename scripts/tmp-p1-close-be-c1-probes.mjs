/**
 * P1-CLOSE-BE-C1 live probes — delete after QA ack.
 * Usage: node scripts/tmp-p1-close-be-c1-probes.mjs
 */
const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const TENANT = 'xevn';
const COMPANY = process.env.HRM_PROBE_COMPANY ?? 'main';

async function probe(name, method, path, body, extraHeaders = {}) {
  const res = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  const row = { name, method, path, status: res.status, code: json.code };
  console.log(JSON.stringify(row));
  return row;
}

const rows = [];
rows.push(
  await probe('HRM-MD-02 metadata list', 'GET', '/employee-metadata/change-requests?company_id=main&status=pending'),
);
rows.push(
  await probe(
    'HRM-OP-04 operations summary',
    'GET',
    `/operations/reports/summary?tenant_id=${TENANT}&company_id=${COMPANY}`,
  ),
);
rows.push(await probe('HRM-PF-02 performance cycles', 'GET', '/performance/cycles?company_id=main'));
rows.push(
  await probe('HRM-IM-04 spreadsheet template', 'GET', '/spreadsheet/templates/employee_import?format=csv'),
);
rows.push(
  await probe('HRM-SC-08 seed tenant position', 'POST', '/settings-catalogs/seed/tenant-position-catalog-all'),
);

const failed = rows.filter((r) => r.status >= 500 || r.status === 401 || r.status === 409);
process.exitCode = failed.length ? 1 : 0;
