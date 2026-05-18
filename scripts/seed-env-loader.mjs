import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, '..');

export function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

export function loadDeployEnv() {
  loadEnvFile(resolve(repoRoot, 'deploy/xevn-ecosystem/.env'));
  loadEnvFile(resolve(repoRoot, 'apps/api/xbos-api/.env'));
}

export function xbosBase() {
  return `http://127.0.0.1:${process.env.XBOS_BE_PORT ?? '28002'}`;
}

export function hrmBase() {
  return `http://127.0.0.1:${process.env.HRM_BE_PORT ?? '28001'}`;
}

export function internalKey() {
  return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
}

export function xbosHeaders(extra = {}) {
  return {
    'x-internal-api-key': internalKey(),
    'x-tenant-id': process.env.MASTER_TENANT_ID ?? 'xevn',
    'x-company-id': process.env.MASTER_TENANT_ID ?? 'xevn',
    'x-user-id': process.env.SEED_USER_ID ?? 'admin@xevn.vn',
    ...extra,
  };
}
