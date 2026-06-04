#!/usr/bin/env node
/**
 * FE↔BE API health gate — run before claiming UAT-ready or after user reports UI 500.
 * Detects: HRM down (ECONNREFUSED → portal 500), real 5xx, stack misconfig.
 *
 * Usage: pnpm run qc:fe-be-health
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HRM = process.env.HRM_HEALTH_URL || 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_HEALTH_URL || 'http://127.0.0.1:28002/api/xbos';
const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
].filter(Boolean);

/** Unified Portal (web-portal) — 5173 sau đổi cổng; 5175 nếu dev cũ chưa restart. */
let PORTAL = PORTAL_CANDIDATES[0];

async function resolvePortalBase() {
  if (process.env.PORTAL_DEV_URL) return process.env.PORTAL_DEV_URL.replace(/\/+$/, '');
  for (const base of ['http://127.0.0.1:5173', 'http://127.0.0.1:5175']) {
    try {
      const r = await fetch(`${base}/api/xbos/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        const j = await r.json();
        if (j?.data?.accessToken ?? j?.accessToken) return base;
      }
    } catch {
      /* try next */
    }
  }
  return PORTAL_CANDIDATES[0]?.replace(/\/+$/, '') || 'http://127.0.0.1:5173';
}

async function probe(name, url, opts = {}) {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12_000);
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(to);
    const text = await r.text().catch(() => '');
    const ok = r.ok;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  HTTP ${r.status}  ${url}`);
    if (!ok && text.length > 0 && text.length < 600) {
      console.log(`       body: ${text.replace(/\s+/g, ' ').slice(0, 400)}`);
    }
    return { ok, status: r.status, text };
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    console.log(`FAIL  ${name}  ${m}  ${url}`);
    return { ok: false, status: 0, text: m };
  }
}

async function loginPortal(portalBase) {
  const r = await fetch(`${portalBase}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken ?? null;
}

async function main() {
  console.log('qc-fe-be-api-health — stack + HRM routes (console 500 class)\n');

  PORTAL = await resolvePortalBase();
  console.log(`INFO  portal-base  ${PORTAL}\n`);

  let fails = 0;
  const bump = (r) => {
    if (!r.ok) fails += 1;
  };

  bump(await probe('hrm-api-health', HRM.endsWith('/') ? HRM : `${HRM}/`));
  bump(await probe('xbos-api-health', XBOS));
  bump(await probe('web-portal', PORTAL));

  const token = await loginPortal(PORTAL);
  if (!token) {
    console.log('FAIL  portal-login  no token');
    fails += 1;
  } else {
    console.log('PASS  portal-login  token ok');
    const auth = { Authorization: `Bearer ${token}` };
    const h = { ...auth, 'x-tenant-id': 'xevn', 'x-company-id': 'main' };

    bump(
      await probe('hrm-employees-direct', `${HRM}/employees?page_size=5&company_id=main`, {
        headers: h,
      }),
    );
    const cat = await probe('hrm-catalog-sync-direct', `${HRM}/catalog-sync`, { headers: h });
    if (cat.status === 404) {
      console.log('WARN  hrm-catalog-sync-direct  HTTP 404 (empty index ok — run sync-from-xbos if UI needs catalogs)');
    } else {
      bump(cat);
    }
    bump(
      await probe('portal-proxy-hrm-employees', `${PORTAL}/api/hrm/employees?page_size=5&company_id=main`, {
        headers: auth,
      }),
    );
    const catP = await probe('portal-proxy-hrm-catalog', `${PORTAL}/api/hrm/catalog-sync`, {
      headers: auth,
    });
    if (catP.status === 404) {
      console.log('WARN  portal-proxy-hrm-catalog  HTTP 404 (sync catalogs if UI shows sync error)');
    } else {
      bump(catP);
    }
  }

  console.log(`\n=== Summary: ${fails === 0 ? 'ALL PASS' : `${fails} FAIL`} ===`);
  if (fails > 0) {
    console.log('\nHints:');
    console.log('• ECONNREFUSED on :28001 → pnpm run dev:hrm-api (or apps/api/hrm-api start:dev)');
    console.log('• Portal 500 + HRM down → proxy upstream missing — not FE bug');
    console.log('• 500 with HRM up → read hrm-api terminal stack trace; fix + jest');
  }

  if (process.argv.includes('--with-pilot')) {
    console.log('\n▶ test:pilot:flows');
    const r = spawnSync('pnpm', ['run', 'test:pilot:flows'], { cwd: repoRoot, stdio: 'inherit', shell: true });
    if ((r.status ?? 1) !== 0) fails += 1;
  }

  process.exit(fails > 0 ? 1 : 0);
}

main();
