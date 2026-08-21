import { readFileSync, writeFileSync } from 'node:fs';

const qaEntry = `## 2026-08-04 | xevn PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01 PASS_TO_PM

- **Context:** Browser dest-reload only after BE LOG09-SCOPE READY_FOR_QA (stale dist first FAIL)
- **Action:** L0; CEO deep-link log_catalog_clone_bundle; setup overwrite CFG-205; click Tải lại khóa đích; 14× GET logistics 200 CFG-201; 0 SCOPE 409; FE dest keys 12 log_dm_*; U65 no seed
- **Outcome:** **PASS_TO_PM** — residual R-LOG09-R2-DEST-GET-SCOPE CLOSED; uat_done false; Leave L2 untouched
- **Evidence:** docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md
- **Reuse-tag:** po-uc-tc-w3-qa-log09-dest-reload, xbos-cfg-201-logistics-main-jwt, stale-dist-ready-for-qa

`;

const lesson = `## 2026-08-04 | xevn LOG-09 dest reload — stale dist masks BE FIX
- Lesson: BE READY_FOR_QA with source FIX is insufficient if :28002 serves old dist/main.js. QA dest-reload will still 409 SCOPE until tsc -p tsconfig.build.json + restart. Probe GET catalog?companyId=logistics with CEO JWT before browser.
- Evidence: docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md
- Reuse-tag: stale-xbos-dist-scope-409, log09-dest-reload-cfg-201

`;

const qaPath = 'C:/Users/ADMIN/.cursor/knowledge-base/qa.md';
const sharedPath = 'C:/Users/ADMIN/.cursor/knowledge-base/shared-lessons.md';
writeFileSync(qaPath, qaEntry + readFileSync(qaPath, 'utf8'));
writeFileSync(sharedPath, lesson + readFileSync(sharedPath, 'utf8'));
console.log('kb appended');
