#!/usr/bin/env node
/**
 * Command Center — legal entity CRUD smoke (holding + member) via portal proxy.
 * Usage: node scripts/qa/xbos-cc-legal-entity-crud-probe.mjs
 */
import { loadDeployEnv } from '../seed-env-loader.mjs';

loadDeployEnv();

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const XBOS = (process.env.XBOS_HEALTH_URL || 'http://127.0.0.1:28002/api/xbos').replace(/\/+$/, '');

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  if (!r.ok) throw new Error(`login HTTP ${r.status}`);
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function api(token, path, { method = 'GET', body, companyId = 'holding' } = {}) {
  const r = await fetch(`${PORTAL}/api/xbos${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': companyId,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { ok: r.ok, status: r.status, json };
}

async function main() {
  const token = await login();
  console.log('PASS  login');

  const holdingList = await api(token, '/org-foundation/legal-entities', { companyId: 'holding' });
  console.log(
    `${holdingList.ok ? 'PASS' : 'FAIL'}  GET holding legal-entities  HTTP ${holdingList.status}  count=${holdingList.json?.data?.items?.length ?? '?'}`,
  );

  const memberList = await api(token, '/org-foundation/legal-entities', { companyId: 'main' });
  console.log(
    `${memberList.ok ? 'PASS' : 'FAIL'}  GET main legal-entities (flat)  HTTP ${memberList.status}`,
  );

  const stamp = Date.now();
  const createBody = {
    code: `TST${String(stamp).slice(-6)}`,
    name: `Probe Legal ${stamp}`,
    entityType: 'holding',
    taxCode: '0312345678',
    charterCapital: 1000000000,
  };
  const created = await api(token, '/org-foundation/legal-entities', {
    method: 'POST',
    companyId: 'holding',
    body: createBody,
  });
  const createdId = created.json?.data?.id;
  console.log(
    `${created.ok && createdId ? 'PASS' : 'FAIL'}  POST holding legal-entity  HTTP ${created.status}  id=${createdId ?? 'none'}`,
  );

  if (createdId) {
    const updated = await api(token, `/org-foundation/legal-entities/${createdId}`, {
      method: 'PUT',
      companyId: 'holding',
      body: { ...createBody, name: `Probe Legal Updated ${stamp}` },
    });
    console.log(`${updated.ok ? 'PASS' : 'FAIL'}  PUT holding legal-entity  HTTP ${updated.status}`);
  }

  const directHolding = await fetch(`${XBOS}/org-foundation/legal-entities`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'holding',
    },
  });
  console.log(
    `${directHolding.ok ? 'PASS' : 'FAIL'}  direct XBOS holding list  HTTP ${directHolding.status}`,
  );

  const fails = [holdingList, memberList, created, directHolding].filter((x) => !x.ok).length;
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
