#!/usr/bin/env node
/**
 * Stack factory: `docker compose up` tại deploy/xevn-ecosystem + smoke HTTP.
 * Tự bootstrap `.env` (tạo / gộp cũ / cổng trống) trước khi up — không cần copy tay.
 *
 *   pnpm run deploy:xevn-ecosystem:factory
 *   pnpm run deploy:dev-server:factory   # alias cũ
 *   node ./scripts/dev-server-factory.mjs --smoke-only
 *   node ./scripts/dev-server-factory.mjs --auto-ports   # ép ghi lại cổng trống
 */
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { ensureXevnDeployEnv } from './xevn-ecosystem-bootstrap.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const deployDir = path.join(repoRoot, 'deploy', 'xevn-ecosystem');
const envPath = path.join(deployDir, '.env');

const args = new Set(process.argv.slice(2));
const smokeOnly = args.has('--smoke-only');

function run(cmd, opts = {}) {
  const r = spawnSync(cmd, {
    shell: true,
    stdio: 'inherit',
    encoding: 'utf8',
    cwd: opts.cwd ?? deployDir,
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function httpGetStatus(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: pathname,
        method: 'GET',
        timeout: 8000,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`timeout ${pathname}`));
    });
    req.end();
  });
}

function parsePort(s, fallback) {
  const n = parseInt(String(s || '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Cổng host: tên mới + tương thích biến cũ trong .env */
function resolvePorts(env) {
  return {
    portal: parsePort(env.PORTAL_FE_PORT || env.WEB_PORTAL_PORT, 28088),
    hrmApi: parsePort(env.HRM_BE_PORT || env.HRM_API_PORT, 28001),
    xbosApi: parsePort(env.XBOS_BE_PORT || env.XBOS_API_PORT, 28002),
  };
}

async function smoke(ports) {
  const { portal, hrmApi, xbosApi } = ports;
  const paths = ['/', '/command-center'];
  for (const p of paths) {
    let code;
    try {
      code = await httpGetStatus(portal, p);
    } catch (e) {
      console.error(
        `[factory] FAIL portal ${portal}${p} — ${e.message} (stack Docker có chạy không? pnpm run deploy:xevn-ecosystem:factory)`,
      );
      process.exit(1);
    }
    if (code === 404) {
      console.error(`[factory] FAIL portal ${portal}${p} → HTTP ${code} (mong đợi SPA, không 404)`);
      process.exit(1);
    }
    if (code < 200 || code >= 500) {
      console.error(`[factory] FAIL portal ${portal}${p} → HTTP ${code}`);
      process.exit(1);
    }
    console.log(`[factory] OK portal ${portal}${p} → ${code}`);
  }

  for (const [name, port, apath] of [
    ['hrm-be', hrmApi, '/api/hrm/metrics'],
    ['xbos-be', xbosApi, '/api/xbos/metrics'],
  ]) {
    try {
      const code = await httpGetStatus(port, apath);
      if (code >= 500) {
        console.error(`[factory] WARN ${name} ${apath} → ${code}`);
      } else {
        console.log(`[factory] OK ${name} ${port}${apath} → ${code}`);
      }
    } catch (e) {
      console.error(`[factory] WARN ${name} không gọi được (${e.message}) — kiểm tra DB/env và log container.`);
    }
  }
}

async function waitPortal(portal, maxAttempts = 90, delayMs = 5000) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const code = await httpGetStatus(portal, '/command-center');
      if (code !== 404) {
        console.log(`[factory] Portal sẵn sàng sau ~${i * (delayMs / 1000)}s (HTTP ${code})`);
        return;
      }
    } catch {
      /* chưa listen */
    }
    console.log(
      `[factory] Đợi portal-fe (lần ${i + 1}/${maxAttempts}, lần đầu pnpm install trong container có thể 5–15 phút)...`,
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }
  console.error('[factory] Timeout: portal-fe vẫn 404 hoặc không phản hồi. Xem: docker compose logs -f portal-fe');
  spawnSync(`docker compose --env-file "${envPath}" logs --tail 120 portal-fe`, {
    shell: true,
    stdio: 'inherit',
    cwd: deployDir,
  });
  process.exit(1);
}

async function main() {
  await ensureXevnDeployEnv({
    repoRoot,
    autoPorts: args.has('--auto-ports') || process.env.XEVN_AUTO_PORTS === '1',
  });

  loadEnv({ path: envPath });
  const ports = resolvePorts(process.env);

  if (!smokeOnly) {
    console.log('[factory] docker compose up -d …');
    run(`docker compose --env-file "${envPath}" up -d`, { cwd: deployDir });
    await waitPortal(ports.portal);
  }

  await smoke(ports);
  console.log('[factory] Xong.');
}

main().catch((e) => {
  console.error('[factory]', e);
  process.exit(1);
});
