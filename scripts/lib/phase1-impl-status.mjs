/**
 * Phase 1 implementation status inference + overrides.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveApiHint } from './srs-api-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function loadPhase1StatusOverrides() {
  const p = path.join(root, 'docs/ecosystem/phase1-impl-status.json');
  if (!fs.existsSync(p)) return { overrides: {}, waves: {} };
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  return { overrides: raw.overrides ?? {}, waves: raw.waves ?? {} };
}

export function ownerFor(code, mod) {
  if (mod === 'M06') return 'Mobile';
  if (mod === 'M05' || /^UC-HRM|^HRM-/.test(code)) return 'HRM';
  if (mod === 'M03' || /^XBOS-DM-LOG/.test(code)) return 'Data+XBOS';
  if (mod === 'M02') return 'XBOS+HRM';
  if (mod === 'M00') return 'Portal';
  return 'XBOS';
}

export function inferImplStatus(code, mod, tsDetail) {
  const hint = resolveApiHint(code);
  if (hint?.planned) return 'planned';
  if (tsDetail.startsWith('Có — endpoint')) return 'be';
  if (/^UC-HRM-MOB/.test(code)) return 'e2e_pass';
  if (/^UC-HRM-2[567]|UC-CC-P0-09/.test(code)) return 'fe';
  if (/^XBOS-DM-LOG/.test(code)) return 'data';
  if (/^XBOS-DM-HRM|^XBOS-DM-0|^UC-XBOS-CAT/.test(code)) return 'data';
  if (/^UC-ECO-MASTER|^UC-ECO-FE-01/.test(code)) return 'be';
  if (/^UC-XBOS-WF|^UC-RACI|^UC-CC-P0-06/.test(code)) return 'fe';
  return 'planned';
}

export function resolveImplStatus(code, mod, tsDetail, overrides) {
  const o = overrides[code];
  if (o?.impl_status) return o;
  return {
    impl_status: inferImplStatus(code, mod, tsDetail),
    owner: ownerFor(code, mod),
    evidence_path: '',
  };
}
