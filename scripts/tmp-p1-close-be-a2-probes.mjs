/**
 * P1-CLOSE-BE-A2 live probes — delete after QA ack.
 * Usage: node scripts/tmp-p1-close-be-a2-probes.mjs
 */
const XBOS = process.env.XBOS_BASE ?? 'http://127.0.0.1:28002/api/xbos';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-internal-dev-key';

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

async function probe(name, method, path, body) {
  const token = await login();
  const res = await fetch(`${XBOS}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'x-internal-api-key': INTERNAL,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  const row = { name, method, path, status: res.status, code: json.code };
  console.log(JSON.stringify(row));
  return row;
}

const rows = [];
rows.push(await probe('ORG-01 tree', 'GET', '/org-foundation/org-units/tree'));
async function probeOrg03() {
  const token = await login();
  const listRes = await fetch(`${XBOS}/org-foundation/legal-entities`, {
    headers: { authorization: `Bearer ${token}`, 'x-internal-api-key': INTERNAL },
  });
  const listJson = await listRes.json();
  const entityId = listJson.data?.items?.[0]?.id;
  if (!entityId) {
    console.log(JSON.stringify({ name: 'ORG-03 legal entity', status: listRes.status, code: listJson.code, note: 'no entity to update' }));
    return { name: 'ORG-03 legal entity', status: listRes.status, code: listJson.code };
  }
  return probe('ORG-03 legal entity', 'PUT', `/org-foundation/legal-entities/${entityId}`, {
    code: 'PROBE',
    name: 'Probe Entity',
  });
}
rows.push(await probeOrg03());
rows.push(await probe('SYNC-01 bootstrap', 'POST', '/config-sync/bootstrap-xevn'));
rows.push(await probe('UC-XBOS-08 departments', 'GET', '/business-master/departments/items'));
rows.push(await probe('UC-XBOS-10 business-lines', 'POST', '/org-foundation/business-lines/promote', {
  segmentId: '00000000-0000-4000-8000-000000000099',
  code: 'BL-PROBE',
  name: 'Probe BL',
}));

const failed = rows.filter((r) => r.status >= 500 || (r.name === 'ORG-01 tree' && r.status === 400));
process.exitCode = failed.length ? 1 : 0;
