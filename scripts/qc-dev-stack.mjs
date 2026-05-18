#!/usr/bin/env node
/**
 * QC nhanh dev stack (chạy sau khi `pnpm dev` hoặc trước khi báo DONE cho portal+XBOS).
 * Kiểm tra XBOS health; in gợi ý khi fail (DB, cổng, proxy).
 *
 * Usage (repo root):
 *   node scripts/qc-dev-stack.mjs
 *   XBOS_HEALTH_URL=http://127.0.0.1:28002/api/xbos node scripts/qc-dev-stack.mjs
 */
const XBOS = process.env.XBOS_HEALTH_URL || 'http://127.0.0.1:28002/api/xbos';
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';

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
  console.log('qc:dev-stack — xevn-ecosystem (XBOS + optional portal)\n');
  const xbosOk = await check('xbos-api', XBOS);
  await check('web-portal (optional)', PORTAL);

  if (!xbosOk) {
    console.log('\n--- Gợi ý xử lý ---');
    console.log('• ECONNREFUSED / fetch failed: API chưa chạy → `pnpm dev` hoặc `pnpm dev:xbos-api`');
    console.log('• database "…" does not exist (3D000): tạo DB `xevn_xbos` hoặc đặt DATABASE_URL_XBOS / DB_HOST+DB_PORT+DB_USER+DB_NAME_XBOS');
    console.log('• Trước đó từng lỗi database = tên user OS: đã sửa pool mặc định trong xbos-db.service.ts — pull và restart xbos-api');
    console.log('• Proxy portal: web-portal/.env có VITE_DEV_PROXY_XBOS_API trỏ đúng host:port xbos-api');
    process.exit(1);
  }

  console.log('\nXBOS healthy — có thể chấp nhận bước QC dev cho API.');
  process.exit(0);
}

main();
