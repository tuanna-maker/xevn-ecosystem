import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

/**
 * Nạp deploy/xevn-ecosystem/.env (chung DB + Supabase) trước, rồi .env của xbos-api (override).
 */
function loadMonorepoEnv(): void {
  // process.cwd() = apps/api/xbos-api when run via Turbo/nest start.
  // __dirname would be dist/src/ after compilation, making relative resolution fail.
  const apiRoot = process.cwd();
  const repoRoot = resolve(apiRoot, '..', '..', '..');
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
