#!/usr/bin/env node
/**
 * Chuẩn hóa DB XBOS dev: áp migration SQL trong migrations/xbos → seed org foundation → (tùy chọn) gọi health XBOS.
 *
 * Chạy từ root repo (cùng migrate-apply — nạp deploy/xevn-ecosystem/.env + apps/api/xbos-api/.env):
 *   node scripts/bootstrap-xevn-xbos.mjs
 *   node scripts/bootstrap-xevn-xbos.mjs --no-seed
 *   node scripts/bootstrap-xevn-xbos.mjs --no-health
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const noSeed = process.argv.includes('--no-seed');
const noHealth = process.argv.includes('--no-health');

function run(title, cmd, args, opts = {}) {
  console.log(`\n▶ ${title}`);
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (r.status !== 0) {
    console.error(`\n✗ Thất bại: ${title} (exit ${r.status ?? 'signal'})`);
    process.exit(r.status ?? 1);
  }
}

run('migrate xbos (tạo/cập nhật bảng; repair checksum nếu file migration đã sửa sau apply)', 'node', [
  path.join(repoRoot, 'scripts', 'migrate-apply.mjs'),
  'xbos',
  '--repair-checksums',
], { cwd: repoRoot });

if (!noSeed) {
  const xbosApiRoot = path.join(repoRoot, 'apps', 'api', 'xbos-api');
  run('seed org foundation (npm run seed:org trong xbos-api)', 'npm', ['run', 'seed:org'], {
    cwd: xbosApiRoot,
    env: { ...process.env },
  });
}

if (!noHealth) {
  const r = spawnSync('node', [path.join(repoRoot, 'scripts', 'qc-dev-stack.mjs')], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.warn(
      '\n⚠ qc:dev-stack chưa pass (thường do xbos-api chưa listen :3002). Migrate + seed đã xong — khởi động `pnpm dev` hoặc `pnpm dev:xbos-api` rồi chạy `pnpm qc:dev-stack`.',
    );
  }
}

console.log('\n✓ bootstrap-xevn-xbos hoàn tất (migrate' + (noSeed ? '' : ' + seed') + ').');
if (!noHealth) {
  console.log('  Gợi ý: `pnpm dev` (portal + xbos-api) rồi F5 Command Center.');
}
