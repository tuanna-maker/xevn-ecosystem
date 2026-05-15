import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

/**
 * Nạp deploy/xevn-ecosystem/.env (chung DB + Supabase) trước, rồi .env của xbos-api (override).
 */
function loadMonorepoEnv(): void {
  const here = __dirname;
  const apiRoot = resolve(here, '..');
  const repoRoot = resolve(apiRoot, '..', '..', '..');
  const deployDir = resolve(repoRoot, 'deploy', 'xevn-ecosystem');
  const deployExample = resolve(deployDir, '.env.example');
  const deployEnv = resolve(deployDir, '.env');
  const deployLocal = resolve(deployDir, '.env.local');
  const localEnv = resolve(apiRoot, '.env');

  if (existsSync(deployExample)) dotenv.config({ path: deployExample });
  if (existsSync(deployEnv)) dotenv.config({ path: deployEnv, override: true });
  if (existsSync(deployLocal)) dotenv.config({ path: deployLocal, override: true });
  if (existsSync(localEnv)) dotenv.config({ path: localEnv, override: true });
}

loadMonorepoEnv();
