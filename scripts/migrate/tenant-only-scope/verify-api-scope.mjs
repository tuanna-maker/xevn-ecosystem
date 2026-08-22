#!/usr/bin/env node
/**
 * AC-TOS-01/02 — verify employee list with tenant-only scope.
 * Usage: HRM_TENANT_ONLY_SCOPE=true node scripts/migrate/tenant-only-scope/verify-api-scope.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');

function loadEnvFile(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(resolve(root, 'deploy/xevn-ecosystem/.env'));
loadEnvFile(resolve(root, 'apps/api/hrm-api/.env'));

const XBOS = process.env.XBOS_API_URL ?? 'http://127.0.0.1:28002';
const HRM = `http://127.0.0.1:${process.env.HRM_BE_PORT ?? '28001'}`;
const PASSWORD = process.env.QA_PORTAL_PASSWORD ?? 'Xevn@2026';

async function login(email) {
  const res = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${email} HTTP ${res.status}`);
  const body = await res.json();
  const token = body?.data?.accessToken ?? body?.accessToken;
  const memberships = body?.data?.memberships ?? body?.memberships ?? [];
  if (!token) throw new Error(`login ${email} missing token`);
  return { token, memberships };
}

async function countEmployees(token, tenantId) {
  const res = await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=1`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': 'main',
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`employees ${tenantId} HTTP ${res.status}: ${text.slice(0, 200)}`);
  const body = JSON.parse(text);
  const data = body?.data ?? body;
  const total = data?.total ?? data?.meta?.total ?? data?.pagination?.total;
  if (typeof total === 'number') return total;
  if (Array.isArray(data?.data)) return data.data.length;
  if (Array.isArray(data?.items)) return data.items.length;
  return 0;
}

async function main() {
  for (const email of ['ceo@xe.vn', 'ceo2@xe.vn']) {
    try {
      const { token, memberships } = await login(email);
      const pick =
        email === 'ceo2@xe.vn'
          ? memberships.find((m) => m.tenantId === 'visun')
          : memberships.find((m) => m.isMaster) ?? memberships[0];
      const tenantId = pick?.tenantId ?? 'xevn';
      const roleCode = pick?.roleCode ?? '?';
      const total = await countEmployees(token, tenantId);
      const mods = [
        ...new Set(
          memberships.flatMap((m) => (Array.isArray(m.modules) ? m.modules : [])),
        ),
      ];
      console.log(`${email} tenant=${tenantId} role=${roleCode} employees.total=${total} modules=${mods.join(',') || '(none)'}`);
    } catch (err) {
      console.error(`${email} FAIL:`, err.message);
    }
  }
}

main();
