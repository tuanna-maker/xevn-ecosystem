#!/usr/bin/env node
/** U18-C1-D-01 live probe — UC-HRM-20/26 with company_id=main */
import { loadDeployEnv, internalKey } from './seed-env-loader.mjs';
import { portalLogin, hrmApiBase } from './lib/uat-http.mjs';

loadDeployEnv();

async function probe(label, path, token) {
  const url = `${hrmApiBase()}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-internal-api-key': internalKey(),
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
      Accept: 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  const pass = res.status === 200 && (body.code === 'HRM-OPS-200' || body.code === 'HRM-META-200');
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label} HTTP ${res.status} ${body.code ?? ''} ${url}`);
  if (!pass) console.log(JSON.stringify(body, null, 2));
  return pass;
}

const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const session = await portalLogin(email, password);
const token = session.access_token;

const results = [
  await probe('UC-HRM-20', '/operations/reports/summary?tenant_id=xevn&company_id=main', token),
  await probe(
    'UC-HRM-26',
    '/employee-metadata/change-requests?company_id=main&tenant_id=xevn&status=pending',
    token,
  ),
];

process.exit(results.every(Boolean) ? 0 : 1);
