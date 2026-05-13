import { materializeLocalEnvFiles } from './migrate-env-loader.mjs';

const created = new Set();
for (const t of ['hrm', 'xbos']) {
  for (const p of materializeLocalEnvFiles(t)) {
    if (p) created.add(p);
  }
}
console.log(JSON.stringify({ ok: true, materialized: [...created] }, null, 2));
