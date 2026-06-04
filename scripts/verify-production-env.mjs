#!/usr/bin/env node
/**
 * Dry-run production env gate (NFR P0.7).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
require('dotenv').config({ path: path.join(root, 'deploy/xevn-ecosystem/.env') });

const FORBIDDEN = new Set(['xevn-dev-jwt-secret', 'xevn-dev-internal-key', 'change-me', 'secret']);

function validateProductionEnv(service) {
  const errors = [];
  const warnings = [];
  if (process.env.NODE_ENV !== 'production') return { ok: true, errors, warnings };
  const jwt = process.env.SERVICE_JWT_SECRET?.trim();
  if (!jwt) errors.push(`${service}: SERVICE_JWT_SECRET required`);
  else if (FORBIDDEN.has(jwt)) errors.push(`${service}: SERVICE_JWT_SECRET is dev default`);
  const key = process.env.INTERNAL_API_KEY?.trim();
  if (!key) warnings.push(`${service}: INTERNAL_API_KEY not set`);
  else if (FORBIDDEN.has(key)) errors.push(`${service}: INTERNAL_API_KEY is dev default`);
  if (!process.env.CORS_ALLOWED_ORIGINS?.trim()) errors.push(`${service}: CORS_ALLOWED_ORIGINS required`);
  return { ok: errors.length === 0, errors, warnings };
}

const prev = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';
let failed = false;
for (const service of ['hrm-api', 'xbos-api']) {
  const r = validateProductionEnv(service);
  console.log(`[${service}] ok=${r.ok}`);
  r.errors.forEach((e) => {
    console.error(`  ERROR: ${e}`);
    failed = true;
  });
  r.warnings.forEach((w) => console.warn(`  WARN: ${w}`));
}
process.env.NODE_ENV = prev;
process.exit(failed ? 1 : 0);
