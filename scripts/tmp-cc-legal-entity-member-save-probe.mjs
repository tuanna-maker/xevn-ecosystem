#!/usr/bin/env node
/**
 * Command Center — member unit legal-entity PUT (group CEO) — mirrors FE saveCompanySettings headers.
 * Usage: PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-cc-legal-entity-member-save-probe.mjs
 */
const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  if (!r.ok) throw new Error(`login HTTP ${r.status}`);
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function api(token, path, { method = 'GET', tenantId = 'xevn', companyId = 'main', body } = {}) {
  const r = await fetch(`${PORTAL}/api/xbos${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { ok: r.ok, status: r.status, json };
}

async function main() {
  console.log(`CC member legal-entity save probe — ${PORTAL}\n`);
  const token = await login();
  console.log('PASS  login');

  const gmu = await api(token, '/tenant-scope/group-member-units');
  const members = gmu.json?.data?.members ?? [];
  console.log(
    `${gmu.ok ? 'PASS' : 'FAIL'}  GET group-member-units  HTTP ${gmu.status}  members=${members.length}`,
  );
  if (!gmu.ok || !members.length) {
    console.error('Abort — cannot load member units');
    process.exit(1);
  }

  let failCount = 0;
  for (const m of members) {
    const tid = m.tenant_id;
    const id = m.id;
    const payload = {
      code: m.code,
      name: m.name,
      entityType: m.entity_type === 'holding' ? 'holding' : 'subsidiary',
      taxCode: '0123456789',
      charterCapital: 1_000_000_000,
      payload: { companyForm: { shortName: m.code, nameVi: m.name } },
    };
    const put = await api(token, `/org-foundation/legal-entities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      tenantId: tid,
      companyId: 'main',
      body: payload,
    });
    const verdict = put.ok && put.status >= 200 && put.status < 300 ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failCount += 1;
    console.log(
      `${verdict}  PUT ${m.code} (${tid})  HTTP ${put.status}  ${put.json?.code ?? put.json?.raw ?? ''}`,
    );
    if (put.status === 502) {
      console.log('      hint: HTTP 502 = xbos-be down or proxy — check docker xbos-be on VPS');
    }
    if (put.status === 409) {
      console.log('      hint: scope mismatch — mutation scope not deployed on xbos-be');
    }
  }

  const reload = await api(token, '/tenant-scope/group-member-units');
  console.log(
    `${reload.ok ? 'PASS' : 'FAIL'}  POST-save reload group-member-units  HTTP ${reload.status}`,
  );
  if (!reload.ok) failCount += 1;

  console.log(`\n=== ${members.length - failCount}/${members.length} member PUT PASS ===`);
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
