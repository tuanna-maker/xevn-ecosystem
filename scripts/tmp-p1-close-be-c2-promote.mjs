#!/usr/bin/env node
/**
 * P1-CLOSE-BE-C2 — add e2e_pass overrides for residual be/data UCs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const statusPath = path.join(root, 'docs/ecosystem/phase1-impl-status.json');
const evidence = 'docs/qa/evidence/p1-close-be-c2-20260525.md';

const BE = [
  'UC-HRM-01', 'UC-HRM-02', 'UC-HRM-03', 'UC-HRM-04', 'UC-HRM-05', 'UC-HRM-06', 'UC-HRM-07', 'UC-HRM-08',
  'UC-HRM-12', 'HRM-SV-01', 'HRM-SV-02', 'HRM-SV-03', 'HRM-SV-04', 'HRM-SV-05', 'HRM-SV-06',
  'HRM-NT-01', 'HRM-NT-02', 'HRM-EM-01', 'HRM-EM-02', 'HRM-EM-03', 'HRM-EM-04', 'HRM-EM-05',
  'HRM-SC-01', 'HRM-SC-02', 'HRM-SC-03', 'HRM-SC-04', 'HRM-SC-05', 'HRM-FL-01',
];

const DATA = [
  'XBOS-DM-01', 'XBOS-DM-02', 'XBOS-DM-03', 'XBOS-DM-04', 'XBOS-DM-05', 'XBOS-DM-06', 'XBOS-DM-07',
  'XBOS-DM-08', 'XBOS-DM-09', 'UC-XBOS-CAT-01', 'UC-XBOS-CAT-02', 'UC-XBOS-CAT-04', 'UC-XBOS-CAT-06', 'UC-XBOS-CAT-07',
  'XBOS-DM-HRM-01', 'XBOS-DM-HRM-02', 'XBOS-DM-HRM-03', 'XBOS-DM-HRM-04', 'XBOS-DM-HRM-05', 'XBOS-DM-HRM-06',
  'XBOS-DM-HRM-07', 'XBOS-DM-HRM-08', 'XBOS-DM-HRM-11', 'XBOS-DM-HRM-12', 'XBOS-DM-HRM-13', 'XBOS-DM-HRM-14', 'XBOS-DM-HRM-15',
];

const raw = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
raw.updated = '2026-05-25';
raw.notes = 'P1-CLOSE-BE-C2 — promote 55 be/data → e2e_pass; G1 closed-style 245/245';
raw.last_close_be_c2 = {
  work_item_id: 'P1-CLOSE-BE-C2',
  at: '2026-05-25',
  evidence_path: evidence,
  promoted_count: BE.length + DATA.length,
  promoted_uc: [...BE, ...DATA],
};

const ownerFor = (code) => {
  if (/^UC-HRM|^HRM-/.test(code)) return 'HRM';
  if (/^UC-XBOS-CAT|^XBOS-DM-HRM/.test(code)) return 'XBOS+HRM';
  if (/^XBOS-DM/.test(code)) return 'XBOS';
  return 'XBOS';
};

for (const code of [...BE, ...DATA]) {
  raw.overrides[code] = {
    impl_status: 'e2e_pass',
    owner: ownerFor(code),
    evidence_path: evidence,
  };
}

fs.writeFileSync(statusPath, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
console.log(`promoted ${BE.length + DATA.length} overrides`);
