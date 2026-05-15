/**
 * Chuẩn bị deploy/xevn-ecosystem/.env — không cần làm tay:
 * - Tạo từ .env.example nếu chưa có
 * - Gộp từ deploy/dev-server/.env cũ (nếu còn) + map cổng cũ → tên mới
 * - Ghi bộ cổng trống khi: mới tạo file | --auto-ports | XEVN_AUTO_PORTS=1 | thiếu biến cổng mới
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPortAssignmentBlock, writePortBlockToEnvFile, PORT_ROLES } from './xevn-host-ports-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LEGACY_PORT_MAP = [
  ['WEB_PORTAL_PORT', 'PORTAL_FE_PORT'],
  ['HRM_WEB_PORT', 'HRM_FE_PORT'],
  ['XBOS_CORE_PORT', 'XBOS_FE_PORT'],
  ['HRM_API_PORT', 'HRM_BE_PORT'],
  ['XBOS_API_PORT', 'XBOS_BE_PORT'],
];

const MERGE_KEY_PREFIXES = [
  'DB_',
  'DATABASE_URL',
  'SUPABASE_',
  'VITE_SUPABASE',
  'INTERNAL_API_KEY',
  'MASTER_TENANT_ID',
  'DEFAULT_COMPANY_ID',
  'DEFAULT_TENANT_ID',
  'HRM_RATE_LIMIT',
  'XEVN_',
];

function parseEnvLines(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    map.set(k, t.slice(eq + 1).trim());
  }
  return map;
}

function writeEnvPreservingOrder(originalText, map) {
  const remaining = new Map(map);
  const out = [];
  for (const line of originalText.split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!m) {
      out.push(line);
      continue;
    }
    const k = m[1];
    if (remaining.has(k)) {
      out.push(`${k}=${remaining.get(k)}`);
      remaining.delete(k);
    } else {
      out.push(line);
    }
  }
  for (const [k, v] of remaining) {
    out.push(`${k}=${v}`);
  }
  let s = out.join('\n');
  if (!s.endsWith('\n')) s += '\n';
  return s;
}

function mergeLegacyIntoMap(map, legacyText) {
  const legacy = parseEnvLines(legacyText);
  for (const [oldKey, newKey] of LEGACY_PORT_MAP) {
    if (legacy.has(oldKey) && !map.has(newKey)) {
      map.set(newKey, legacy.get(oldKey));
    }
  }
  for (const [k, v] of legacy) {
    if (LEGACY_PORT_MAP.some(([o]) => o === k)) continue;
    const allow =
      MERGE_KEY_PREFIXES.some((p) => k.startsWith(p)) || k === 'DB_PASSWORD' || k === 'SUPABASE_PROJECT_REF';
    if (!allow) continue;
    const cur = map.get(k);
    if (cur === undefined || cur === '' || cur === 'replace_me') {
      map.set(k, v);
    }
  }
}

function envHasAnyNewPortKey(text) {
  return PORT_ROLES.some(([key]) => new RegExp(`^${key}=`, 'm').test(text));
}

/**
 * @param {{ repoRoot: string; autoPorts?: boolean }} opts
 */
export async function ensureXevnDeployEnv(opts) {
  const { repoRoot, autoPorts = false } = opts;
  const deployDir = path.join(repoRoot, 'deploy', 'xevn-ecosystem');
  const envPath = path.join(deployDir, '.env');
  const examplePath = path.join(deployDir, '.env.example');
  const legacyPath = path.join(repoRoot, 'deploy', 'dev-server', '.env');

  let created = false;
  if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(examplePath)) {
      throw new Error(`Thiếu ${examplePath}`);
    }
    fs.mkdirSync(deployDir, { recursive: true });
    fs.copyFileSync(examplePath, envPath);
    created = true;
    console.log(`[bootstrap] Đã tạo ${envPath} từ .env.example`);
  }

  let raw = fs.readFileSync(envPath, 'utf8');
  let map = parseEnvLines(raw);

  if (fs.existsSync(legacyPath)) {
    const leg = fs.readFileSync(legacyPath, 'utf8');
    mergeLegacyIntoMap(map, leg);
    raw = writeEnvPreservingOrder(raw, map);
    fs.writeFileSync(envPath, raw, 'utf8');
    console.log(`[bootstrap] Đã gộp từ ${legacyPath} (DB/Supabase + cổng đổi tên khi thiếu)`);
  }

  raw = fs.readFileSync(envPath, 'utf8');
  const wantPorts =
    autoPorts ||
    process.env.XEVN_AUTO_PORTS === '1' ||
    created ||
    !envHasAnyNewPortKey(raw);

  let portsWritten = false;
  if (wantPorts) {
    const block = await buildPortAssignmentBlock();
    writePortBlockToEnvFile(envPath, block);
    portsWritten = true;
    console.log('[bootstrap] Đã ghi bộ cổng host trống vào .env');
  }

  if (created) {
    console.log(
      '[bootstrap] POC/dev: đặt DB_PASSWORD trùng user Postgres trên server dev (một credential). XEVN_POC_DEV=1 trong .env.example giúp migrate không chặn placeholder replace_me nếu bạn cố ý dùng.',
    );
  }

  return { created, portsWritten, envPath };
}

async function cliMain() {
  const repoRoot = path.resolve(__dirname, '..');
  const autoPorts = process.argv.includes('--auto-ports') || process.env.XEVN_AUTO_PORTS === '1';
  await ensureXevnDeployEnv({ repoRoot, autoPorts });
  console.log('[bootstrap] Xong.');
}

const selfPath = fileURLToPath(import.meta.url);
const invoked =
  process.argv[1] &&
  path.normalize(path.resolve(process.argv[1])) === path.normalize(selfPath);
if (invoked) {
  cliMain().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
