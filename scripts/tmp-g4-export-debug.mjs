import { loadDeployEnv, internalKey } from './seed-env-loader.mjs';
import { portalLogin, xbosApiBase } from './lib/uat-http.mjs';
import { parseLogisticCatalogDefs } from './lib/parse-logistic-catalog-md.mjs';
loadDeployEnv();
const s = await portalLogin('ceo@xe.vn', 'Xevn@2026');
const h = { Authorization: 'Bearer ' + s.access_token, 'x-internal-api-key': internalKey() };
const key = parseLogisticCatalogDefs().filter((d) => d.kind === 'catalog')[10]?.key;
for (const co of ['trsport', 'holding', 'logistics']) {
  const u = `/config-sync/catalog/${key}?target=xbos&tenantId=xevn&companyId=${co}`;
  const r = await fetch(xbosApiBase() + u, { headers: h });
  const j = await r.json();
  console.log(co, key, r.status, j.code, j.message?.slice?.(0, 80));
}
