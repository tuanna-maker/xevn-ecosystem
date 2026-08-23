import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

export function loadMigrateEnv() {
  loadEnvFile(resolve(repoRoot, 'deploy/xevn-ecosystem/.env'));
  loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));
}

export function createPgPool(Pool) {
  loadMigrateEnv();
  const url = process.env.DATABASE_URL_HRM ?? process.env.DATABASE_URL;
  if (url) {
    return new Pool({ connectionString: url });
  }
  if (
    process.env.DB_HOST &&
    process.env.DB_PORT &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  ) {
    return new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_HRM ?? 'xevn_hrm',
      ssl: false,
    });
  }
  throw new Error('Set DATABASE_URL_HRM or DB_HOST/DB_PORT/DB_USER/DB_PASSWORD');
}
