import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

/**
 * Nạp deploy/xevn-ecosystem/.env (Postgres chung) trước, rồi .env của hrm-api (override).
 * Đường dẫn tính từ thư mục chứa file đã biên dịch (dist/) hoặc src/ khi chạy ts-node.
 */
function loadMonorepoEnv(): void {
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
