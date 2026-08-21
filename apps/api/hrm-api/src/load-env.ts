import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

function moduleDir(): string {
  return __dirname;
}

/**
 * Resolve monorepo root when cwd is package dir, repo root, or compiled dist/.
 * Prevents JWT drift: missing apps/api/hrm-api/.env → fall back to code default
 * while xbos still signs with package .env (HRM-AUTH-001).
 */
export function findMonorepoRoot(): string {
  const candidates = [
    process.cwd(),
    resolve(process.cwd(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..'),
    resolve(moduleDir(), '..', '..', '..', '..'),
  ];
  for (const root of candidates) {
    const deployDir = resolve(root, 'deploy', 'xevn-ecosystem');
    if (
      existsSync(resolve(deployDir, '.env')) ||
      existsSync(resolve(deployDir, '.env.example'))
    ) {
      return root;
    }
  }
  return resolve(process.cwd(), '..', '..', '..');
}

/**
 * Nạp deploy/xevn-ecosystem/.env (Postgres chung) trước, rồi .env của hrm-api (override).
 * Đường dẫn tính từ thư mục package / dist khi nest hoặc node dist/main.
 */
function loadMonorepoEnv(): void {
  const repoRoot = findMonorepoRoot();
  const apiRootCandidates = [
    process.cwd(),
    resolve(repoRoot, 'apps', 'api', 'hrm-api'),
    resolve(moduleDir(), '..'),
    resolve(moduleDir(), '..', '..'),
  ];
  const deployDir = resolve(repoRoot, 'deploy', 'xevn-ecosystem');
  const deployExample = resolve(deployDir, '.env.example');
  const deployEnv = resolve(deployDir, '.env');
  const deployLocal = resolve(deployDir, '.env.local');

  if (existsSync(deployEnv)) {
    dotenv.config({ path: deployEnv });
  } else if (existsSync(deployExample)) {
    dotenv.config({ path: deployExample });
  }
  if (existsSync(deployLocal))
    dotenv.config({ path: deployLocal, override: true });

  for (const apiRoot of apiRootCandidates) {
    const localEnv = resolve(apiRoot, '.env');
    if (existsSync(localEnv)) {
      dotenv.config({ path: localEnv, override: true });
      break;
    }
  }
}

loadMonorepoEnv();
