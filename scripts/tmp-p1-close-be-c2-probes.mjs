/**
 * P1-CLOSE-BE-C2 live probes — delete after QA ack.
 * Usage: node scripts/tmp-p1-close-be-c2-probes.mjs
 */
const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_BASE ?? 'http://127.0.0.1:28002/api/xbos';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
const TENANT = 'xevn';
const COMPANY = process.env.HRM_PROBE_COMPANY ?? 'main';

async function login() {
  const res = await fetch(`${XBOS}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-internal-api-key': INTERNAL },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`login ${res.status} ${JSON.stringify(json)}`);
  return json.data?.accessToken ?? json.data?.token;
}

async function hrmProbe(name, method, path) {
  const res = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const json = await res.json().catch(() => ({}));
  const row = { name, method, path, status: res.status, code: json.code };
  console.log(JSON.stringify(row));
  return row;
}

async function xbosProbe(name, method, path) {
  const token = await login();
  const res = await fetch(`${XBOS}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const json = await res.json().catch(() => ({}));
  const row = { name, method, path, status: res.status, code: json.code };
  console.log(JSON.stringify(row));
  return row;
}

const rows = [];
rows.push(await hrmProbe('UC-HRM-01 health', 'GET', '/'));
rows.push(await hrmProbe('HRM-EM-02 employees main', 'GET', `/employees?company_id=${COMPANY}&page_size=1`));
rows.push(await hrmProbe('HRM-SV-02 service-requests main', 'GET', `/operations/service-requests?company_id=${COMPANY}`));
rows.push(await hrmProbe('HRM-SC-01 settings overview', 'GET', '/settings-catalogs'));
rows.push(await hrmProbe('HRM-FL-01 fleet vehicles main', 'GET', `/fleet/vehicles?company_id=${COMPANY}`));
rows.push(await xbosProbe('XBOS-DM-01 config list', 'GET', '/config-sync/catalogs?target=hrm&tenantId=xevn&companyId=main'));
rows.push(await xbosProbe('UC-XBOS-CAT-01 inbox', 'GET', '/catalog-governance/inbox?tenantId=xevn&companyId=main'));

const failed = rows.filter((r) => r.status >= 500 || r.status === 401);
process.exitCode = failed.length ? 1 : 0;
