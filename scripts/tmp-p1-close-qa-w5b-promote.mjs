#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const statusPath = path.join(root, 'docs/ecosystem/phase1-impl-status.json');
const evidence = 'docs/qa/evidence/p1-close-qa-w5b-20260525.md#qa-promote-w5b';

const PROMOTE = [
  'UC-CC-P0-09',
  'UC-RACI-01',
  'UC-RACI-02',
  'UC-RACI-03',
  'UC-RACI-04',
  'UC-RACI-05',
  'UC-RACI-06',
];

const raw = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
raw.updated = '2026-05-25';
raw.notes = 'P1-CLOSE-QA-W5B — RACI+CC-P0-09 promoted; G1 245/245; G2 103/104 (UC-ECO-MASTER-01 waived)';
raw.last_close_qa_w5b = {
  work_item_id: 'P1-CLOSE-QA-W5B',
  at: '2026-05-25',
  evidence_path: 'docs/qa/evidence/p1-close-qa-w5b-20260525.md',
  qa_promoted_uc: PROMOTE,
  qa_residual: ['RACI member legal-entity UUID matrix → 409; main slice OK'],
  g1_met: true,
  g2_met: false,
  jest: {
    hrm_api: '183/183',
    xbos_api: '162/162',
    web_portal: '96/96',
    hrm_embed: '122/122',
  },
  l2_w3_matrix: '9/9',
  w5b_raci_probes: '9/9',
};

for (const code of PROMOTE) {
  raw.overrides[code] = {
    impl_status: 'e2e_pass',
    owner: 'Portal',
    evidence_path: evidence,
  };
}

fs.writeFileSync(statusPath, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
console.log(`promoted ${PROMOTE.length} UC overrides`);
