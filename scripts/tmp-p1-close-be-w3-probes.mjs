/**
 * P1-CLOSE-BE-W3 live probes — delete after QA ack.
 * Usage: node scripts/tmp-p1-close-be-w3-probes.mjs
 */
const XBOS = process.env.XBOS_BASE ?? 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_BASE ?? 'http://127.0.0.1:28001/api/hrm';
const INTERNAL = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';

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

async function xbosProbe(name, method, path, body) {
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

async function hrmProbe(name, method, path) {
  const res = await fetch(`${HRM}${path}`, {
    method,
    headers: {
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': 'xevn',
      'x-company-id': 'holding',
    },
  });
  const json = await res.json().catch(() => ({}));
  const row = { name, method, path, status: res.status, code: json.code };
  console.log(JSON.stringify(row));
  return row;
}

async function resolvePilotSegmentId() {
  if (process.env.UC_XBOS_10_SEGMENT_ID) return process.env.UC_XBOS_10_SEGMENT_ID;
  const token = await login();
  const res = await fetch(`${XBOS}/org-foundation/org-units/tree`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  });
  const json = await res.json();
  const walk = (nodes) => {
    for (const n of nodes ?? []) {
      if (n?.code === 'pilot-segment-tourism' && (n?.org_type === 'segment' || n?.orgType === 'segment')) {
        return n.id;
      }
      const child = walk(n?.children ?? n?.childUnits ?? n?.tree);
      if (child) return child;
    }
    return null;
  };
  const roots = json.data?.items ?? json.data?.tree ?? json.data ?? [];
  for (const entry of Array.isArray(roots) ? roots : []) {
    const id = walk(entry?.tree ?? entry?.children ?? [entry]);
    if (id) return id;
  }
  return null;
}

const rows = [];
rows.push(
  await xbosProbe('XBOS-DM-HRM-09 publish', 'POST', '/catalog-governance/publish?catalogKey=job_titles', {
    tenantId: 'xevn',
    companyId: 'main',
    name: 'Job Titles W3',
    domain: 'human_resources',
    assignedTo: ['hrm'],
    items: [{ code: 'W3-PROBE', label: 'W3 Probe', status: 'active' }],
  }),
);
rows.push(await hrmProbe('XBOS-DM-HRM-10 sync', 'POST', '/settings-catalogs/sync-from-xbos'));

const segmentId = await resolvePilotSegmentId();
if (segmentId) {
  const token = await login();
  const res = await fetch(`${XBOS}/org-foundation/business-lines/promote`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'x-internal-api-key': INTERNAL,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      segmentId,
      code: `BL-W3-${Date.now().toString(36).slice(-4)}`,
      name: 'W3 Promote Probe',
      taxCode: '0123456789',
    }),
  });
  const json = await res.json().catch(() => ({}));
  const promoteRow = {
    name: 'UC-XBOS-10 promote',
    method: 'POST',
    path: '/org-foundation/business-lines/promote',
    status: res.status,
    code: json.code,
  };
  console.log(JSON.stringify(promoteRow));
  rows.push(promoteRow);
} else {
  console.log(JSON.stringify({ name: 'UC-XBOS-10 promote', status: 0, code: 'SKIP', note: 'no pilot-segment-tourism — run seed-org-foundation' }));
  process.exitCode = 1;
}

const failed = rows.filter((r) => {
  if (r.status >= 500 || r.code === 'XBOS-SYS-001') return true;
  if (r.name === 'UC-XBOS-10 promote') return r.status !== 200 && r.status !== 201;
  if (r.name === 'XBOS-DM-HRM-10 sync') return r.status !== 200 && r.status !== 201;
  if (r.name === 'XBOS-DM-HRM-09 publish') {
    return r.status !== 200 && r.status !== 201 && !(r.status === 403 && r.code === 'XBOS-CFG-002');
  }
  return false;
});
process.exitCode = process.exitCode || (failed.length ? 1 : 0);
