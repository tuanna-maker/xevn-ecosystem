import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const bus = resolve(root, 'docs/program/AGENT_MESSAGE_BUS.md');
const kb = 'C:/Users/ADMIN/.cursor/knowledge-base/qa.md';

const block = `
## 2026-08-07T10:56+07 | qa -> pm | PASS_TO_PM PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02
- work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02
- parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
- ack_status: PASS_TO_PM
- evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md
- stamp: PLTQA2-IEWURI
- summary: Browser AC-PLT-CTR-05 PASS (Settings upsert PUT 200 → FE labelVi + F5); resolve source=registry; DYNAMIC-LOCK open key; soft-delete hide; supersedes QA-01 L1 SKIP for this AC; contracts_printable_ready=false
- next_owner: qc
- next_dispatch: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QC-01 certify slice
- honesty: printable false · no seed · no Phase1 DONE
- must_keep: UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK
`;

appendFileSync(bus, block, 'utf8');

const kbEntry = `## 2026-08-07 | xevn PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02 PASS_TO_PM browser AC-PLT-CTR-05
- **Context:** FE-01 READY; prior QA-01 L1-only SKIP AC-05; U65 ceo@xe.vn; honesty false
- **Action:** L0+fe-be-health PASS; Playwright Settings MergeToken upsert → PUT 200 → FE+F5 labelVi; resolve registry; DYNAMIC-LOCK; soft retire
- **Outcome:** **PASS_TO_PM** · AC-PLT-CTR-05 UF PASS · supersedes QA-01 L1 SKIP for AC-05 · DENIED printable UAT
- **Evidence:** docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md · _tmp FINAL · screens qa-02
- **Reuse-tag:** merge-token-browser-uf, ac-plt-ctr-05-f5-label, supersede-l1-skip, honesty-no-printable-uat

`;

writeFileSync(kb, kbEntry + readFileSync(kb, 'utf8'), 'utf8');
console.log('bus+kb ok');
