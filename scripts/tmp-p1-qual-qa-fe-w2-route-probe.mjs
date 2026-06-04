import { resolve } from 'node:path';
import { loadDeployEnv, loadEnvFile, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));

const session = await portalLogin('ceo@xe.vn', 'Xevn@2026');
const headers = { ...authHeaders(session), accept: 'application/json' };
const eid = process.argv[2] || '293b5900-8f99-4a97-878b-26270fb01827';
const q = 'company_id=main';

for (const base of ['http://127.0.0.1:28001', 'http://127.0.0.1:5175']) {
  for (const path of [
    `/api/hrm/employees/${eid}?${q}`,
    `/api/hrm/employees/${eid}/training?${q}`,
    `/api/hrm/employees/${eid}/skills?${q}`,
    `/api/hrm/admin/companies`,
    `/api/hrm/recruitment/headcount-proposals?${q}`,
  ]) {
    const res = await fetch(`${base}${path}`, { headers });
    let code = '';
    try {
      const j = await res.json();
      code = j?.code ?? '';
    } catch {
      /* ignore */
    }
    console.log(`${res.status}\t${code}\t${base.replace('http://127.0.0.1', '')}${path}`);
  }
}
