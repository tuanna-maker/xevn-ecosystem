import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

function moduleDir(): string {
  return __dirname;
}

/** Resolve monorepo root when cwd is package dir, repo root, or compiled dist/. */
export function findMonorepoRoot(): string {
  const candidates = [
    process.cwd(),
    resolve(process.cwd(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..', '..'),
  ];
  for (const root of candidates) {
    const deployDir = resolve(root, 'deploy', 'xevn-ecosystem');
    if (existsSync(resolve(deployDir, '.env')) || existsSync(resolve(deployDir, '.env.example'))) {
      return root;
    }
  }
  return resolve(process.cwd(), '..', '..', '..');
}

/**
 * Nạp deploy/xevn-ecosystem/.env (chung DB + Supabase) trước, rồi .env của xbos-api (override).
 */
function loadMonorepoEnv(): void {
  const apiRoot = process.cwd();
  const repoRoot = findMonorepoRoot();
  const deployDir = resolve(repoRoot, 'deploy', 'xevn-ecosystem');
  const deployExample = resolve(deployDir, '.env.example');
  const deployEnv = resolve(deployDir, '.env');
  const deployLocal = resolve(deployDir, '.env.local');
  const localEnv = resolve(apiRoot, '.env');

  if (existsSync(deployEnv)) {
    dotenv.config({ path: deployEnv });
  } else if (existsSync(deployExample)) {
    dotenv.config({ path: deployExample });
  }
  if (existsSync(deployLocal)) dotenv.config({ path: deployLocal, override: true });
  if (existsSync(localEnv)) dotenv.config({ path: localEnv, override: true });
}

loadMonorepoEnv();
