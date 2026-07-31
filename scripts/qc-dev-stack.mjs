#!/usr/bin/env node
/**
 * QC nhanh dev stack (chạy sau khi `pnpm dev` hoặc trước khi báo DONE cho portal+XBOS).
 * Kiểm tra XBOS health; in gợi ý khi fail (DB, cổng, proxy).
 *
 * Usage (repo root):
 *   node scripts/qc-dev-stack.mjs
 *   node scripts/qc-dev-stack.mjs --hrm-density-hint
 *   node scripts/qc-dev-stack.mjs --verify-density
 *   HRM_DENSITY_HINT=1 node scripts/qc-dev-stack.mjs
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const XBOS = process.env.XBOS_HEALTH_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_HEALTH_URL || 'http://127.0.0.1:28001/api/hrm';
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';

async function check(name, url) {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8_000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(to);
    const ok = r.ok;
    console.log(`${ok ? '✓' : '✗'} ${name}: HTTP ${r.status} ← ${url}`);
    if (!ok) {
      const t = await r.text().catch(() => '');
      if (t.length > 0 && t.length < 400) console.log(`    body: ${t}`);
    }
    return ok;
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    console.log(`✗ ${name}: ${m} ← ${url}`);
    return false;
  }
}

async function main() {
  console.log('qc:dev-stack — xevn-ecosystem (HRM + XBOS + portal)\n');
  const hrmOk = await check('hrm-api', HRM);
  const xbosOk = await check('xbos-api', XBOS);
  await check('web-portal (optional)', PORTAL);

  if (!hrmOk || !xbosOk) {
    console.log('\n--- Gợi ý xử lý ---');
    console.log('• Local L0 startup order: docs/ops/LOCAL_DEV_STACK_L0.md');
    if (!hrmOk) {
      console.log('• hrm-api :28001 down → portal `/api/hrm/*` trả 500 — chạy `pnpm run dev:hrm-api`');
    }
    if (!xbosOk) {
      console.log('• xbos-api :28002 down → login 502 qua VPS DEV khi xbos-be đang restart — `pnpm run dev:xbos-api`');
    }
    console.log('• ECONNREFUSED / fetch failed: API chưa chạy → `pnpm dev:xbos-api` + `pnpm dev:hrm-api` (pnpm dev không gồm hrm-api)');
    console.log('• database "…" does not exist (3D000): tạo DB `xevn_xbos` hoặc đặt DATABASE_URL_XBOS / DB_HOST+DB_PORT+DB_USER+DB_NAME_XBOS');
    console.log('• Trước đó từng lỗi database = tên user OS: đã sửa pool mặc định trong xbos-db.service.ts — pull và restart xbos-api');
    console.log('• Proxy portal: web-portal/.env có VITE_DEV_PROXY_XBOS_API trỏ đúng host:port xbos-api');
    process.exit(1);
  }

  console.log('\nHRM + XBOS healthy — có thể chấp nhận bước QC dev (chạy thêm `pnpm run qc:fe-be-health` trước UAT).');

  const densityHint = process.env.HRM_DENSITY_HINT === '1' || process.argv.includes('--hrm-density-hint');
  if (densityHint) {
    console.log('\n--- HRM fidelity (G-FID-07) ---');
    console.log('• Shell PASS ≠ menu data full — run: pnpm run verify:hrm:menu-density');
    console.log('• Seed order: docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md');
  }

  if (process.argv.includes('--verify-density')) {
    console.log('\n▶ verify:hrm:menu-density (post qc:dev-stack)');
    const r = spawnSync('node', [resolve(repoRoot, 'scripts/verify-hrm-menu-data-density.mjs')], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    process.exit(r.status ?? 0);
  }

  process.exit(0);
}

main();
