import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** URL mẫu trong .env.example — không dùng làm connection string thật. */
const PLACEHOLDER_DB_URL_MARKERS = ['://user:password@'];

export function effectiveDatabaseUrl(raw) {
  const t = raw?.trim() ?? '';
  if (!t) return '';
  for (const m of PLACEHOLDER_DB_URL_MARKERS) {
    if (t.includes(m)) return '';
  }
  return t;
}

function materializeFromExample(dest, example) {
  if (fs.existsSync(dest) || !fs.existsSync(example)) return null;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(example, dest);
  return dest;
}

/**
 * Tạo .env từ .env.example nếu chưa có (gitignore .env — không cần copy tay).
 */
export function materializeLocalEnvFiles(target) {
  const created = [];
  const deployEnv = path.join(repoRoot, 'deploy', 'xevn-ecosystem', '.env');
  const deployEx = path.join(repoRoot, 'deploy', 'xevn-ecosystem', '.env.example');
  const apiRel = target === 'hrm' ? path.join('apps', 'api', 'hrm-api') : path.join('apps', 'api', 'xbos-api');
  const apiEnv = path.join(repoRoot, apiRel, '.env');
  const apiEx = path.join(repoRoot, apiRel, '.env.example');

  const a = materializeFromExample(deployEnv, deployEx);
  if (a) created.push(a);
  const b = materializeFromExample(apiEnv, apiEx);
  if (b) created.push(b);
  return created;
}

/**
 * Nạp biến môi trường cho migrate: deploy rồi API (hrm|xbos); .env.example trước, .env sau (ghi đè).
 */
export function loadMigrateEnv(target) {
  materializeLocalEnvFiles(target);

  const cwd = process.cwd();
  const roots = [...new Set([repoRoot, cwd].map((r) => path.resolve(r)))];
  const apiRel = target === 'hrm' ? path.join('apps', 'api', 'hrm-api') : path.join('apps', 'api', 'xbos-api');

  const candidates = [];
  for (const root of roots) {
    const deployDir = path.join(root, 'deploy', 'xevn-ecosystem');
    const apiDir = path.join(root, apiRel);
    for (const dir of [deployDir, apiDir]) {
      candidates.push(path.join(dir, '.env.example'));
      candidates.push(path.join(dir, '.env'));
    }
  }
  candidates.push(path.join(repoRoot, '.env'));
  if (cwd !== repoRoot) candidates.push(path.join(cwd, '.env'));

  const seen = new Set();
  const loaded = [];
  let first = true;
  for (const abs of candidates) {
    const key = path.normalize(abs);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!fs.existsSync(abs)) continue;
    dotenv.config({ path: abs, override: !first });
    loaded.push(abs);
    first = false;
  }

  const deployLocal = path.join(repoRoot, 'deploy', 'xevn-ecosystem', '.env.local');
  if (fs.existsSync(deployLocal)) {
    dotenv.config({ path: deployLocal, override: true });
    loaded.push(deployLocal);
  }

  const pw = process.env.XEVN_DB_PASSWORD?.trim();
  if (pw) {
    process.env.DB_PASSWORD = pw;
  }

  return { loaded, repoRoot };
}

export function explainEnvFailure(target, { loaded = [] } = {}) {
  const urlKey = target === 'hrm' ? 'DATABASE_URL_HRM' : 'DATABASE_URL_XBOS';
  const apiRel = target === 'hrm' ? path.join('apps', 'api', 'hrm-api') : path.join('apps', 'api', 'xbos-api');
  const roots = [...new Set([repoRoot, process.cwd()].map((r) => path.resolve(r)))];
  const checks = [];
  for (const root of roots) {
    const deploy = path.join(root, 'deploy', 'xevn-ecosystem', '.env');
    const deployEx = path.join(root, 'deploy', 'xevn-ecosystem', '.env.example');
    const deployLocal = path.join(root, 'deploy', 'xevn-ecosystem', '.env.local');
    const api = path.join(root, apiRel, '.env');
    const apiEx = path.join(root, apiRel, '.env.example');
    checks.push({ path: deploy, exists: fs.existsSync(deploy) });
    checks.push({ path: deployEx, exists: fs.existsSync(deployEx) });
    checks.push({ path: deployLocal, exists: fs.existsSync(deployLocal) });
    checks.push({ path: api, exists: fs.existsSync(api) });
    checks.push({ path: apiEx, exists: fs.existsSync(apiEx) });
  }
  return {
    hint: `Cần ${urlKey} hoặc đủ DB_HOST, DB_PORT, DB_USER, DB_PASSWORD. Script tự tạo .env từ .env.example nếu thiếu; có thể đặt biến máy XEVN_DB_PASSWORD (không commit) thay vì sửa file.`,
    cwd: process.cwd(),
    repoRoot,
    loaded_env_files: loaded,
    checked_files: checks,
    node_version: process.version,
  };
}
