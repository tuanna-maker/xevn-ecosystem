#!/usr/bin/env node
/**
 * Bổ sung cổng VPS cố định vào deploy/xevn-ecosystem/.env — không ghi đè cổng/secret đã có.
 * Deploy gọi script này trên server sau git pull.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const deployDir = path.join(repoRoot, 'deploy', 'xevn-ecosystem');
const envPath = path.join(deployDir, '.env');
const portsPath = path.join(deployDir, 'vps-host-ports.defaults');

const PORT_KEYS = ['PORTAL_FE_PORT', 'HRM_FE_PORT', 'XBOS_FE_PORT', 'HRM_BE_PORT', 'XBOS_BE_PORT'];
const LEGACY_MAP = [
  ['WEB_PORTAL_PORT', 'PORTAL_FE_PORT'],
  ['HRM_WEB_PORT', 'HRM_FE_PORT'],
  ['XBOS_CORE_PORT', 'XBOS_FE_PORT'],
  ['HRM_API_PORT', 'HRM_BE_PORT'],
  ['XBOS_API_PORT', 'XBOS_BE_PORT'],
];

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 1) continue;
    map.set(t.slice(0, eq).trim(), t.slice(eq + 1).trim());
  }
  return map;
}

function readText(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function main() {
  const applyCanonical = process.argv.includes('--apply-canonical');
  if (!fs.existsSync(portsPath)) {
    console.log('[merge-vps-ports] skip: no vps-host-ports.defaults');
    return;
  }
  const ports = parseEnv(readText(portsPath));
  let raw = readText(envPath);
  if (!raw && fs.existsSync(path.join(deployDir, '.env.example'))) {
    raw = readText(path.join(deployDir, '.env.example'));
    fs.writeFileSync(envPath, raw, 'utf8');
    console.log('[merge-vps-ports] created .env from .env.example');
  }
  const map = parseEnv(raw);

  for (const [oldK, newK] of LEGACY_MAP) {
    if (map.has(oldK) && !map.get(newK)) {
      map.set(newK, map.get(oldK));
    }
  }

  let changed = false;
  for (const key of PORT_KEYS) {
    const cur = map.get(key);
    const canonical = ports.get(key);
    if (!canonical) continue;
    if (applyCanonical && cur !== canonical) {
      map.set(key, canonical);
      changed = true;
      console.log(`[merge-vps-ports] canonical ${key}=${canonical} (was ${cur || 'empty'})`);
    } else if (!cur || cur === '' || cur === 'replace_me') {
      map.set(key, canonical);
      changed = true;
      console.log(`[merge-vps-ports] set ${key}=${canonical}`);
    } else {
      console.log(`[merge-vps-ports] keep ${key}=${cur}`);
    }
  }

  if (!changed) return;

  const lines = raw.split(/\r?\n/);
  const out = [];
  const seen = new Set();
  for (const line of lines) {
    const m = /^([A-Z0-9_]+)=/.exec(line.trim());
    if (m && PORT_KEYS.includes(m[1])) {
      if (!seen.has(m[1])) {
        out.push(`${m[1]}=${map.get(m[1])}`);
        seen.add(m[1]);
      }
      continue;
    }
    out.push(line);
  }
  for (const key of PORT_KEYS) {
    if (!seen.has(key) && map.has(key)) {
      out.push(`${key}=${map.get(key)}`);
    }
  }
  let s = out.join('\n');
  if (!s.endsWith('\n')) s += '\n';
  fs.writeFileSync(envPath, s, 'utf8');
}

main();
