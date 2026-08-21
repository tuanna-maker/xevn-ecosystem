import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const bus = resolve(root, 'docs/program/AGENT_MESSAGE_BUS.md');
const kb = 'C:/Users/ADMIN/.cursor/knowledge-base/qa.md';

const block = `
## 2026-08-07T11:07+07 | qa -> pm | PASS_TO_PM PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02
- work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02
- parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02 READY_FOR_QA
- prior: QA-01 FAIL (VAL-001 + CFG 404) CLOSED by BE-02
- ack_status: PASS_TO_PM
- evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md
- stamp: XEVN_CUSTOM_XEVN9-IF9062 · HD-F9V16
- summary: AC-CTR-XEVN-11 U65 PASS — create #9 EXPAND 201+F5 · picker · createBound+preview #9 · CFG F5 PASS; OBS P1 FE-EDIT-RESTORE; honesty false
- next_owner: qc
- next_dispatch: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QC-02 certify slice
- residual: R-CTR-XEVN-TPL-FE-EDIT-RESTORE P1 dev-fe
- honesty: contracts_printable_ready=false · no seed
- must_keep: UF-HRM-02 · print-spine · Q-CTR CLOSED · U65
`;

appendFileSync(bus, block, 'utf8');

const kbEntry = `## 2026-08-07 | xevn PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02 PASS_TO_PM
- **Context:** Retest AC-CTR-XEVN-11 after BE-02; prior QA-01 VAL-001+CFG 404; U65 ceo@xe.vn; honesty false
- **Action:** L0+fe-be-health PASS; Playwright create #9 GENERAL+matrix null → 201 F5; picker+createBound+preview bodyHasTpl; CFG F5 PASS
- **Outcome:** **PASS_TO_PM** · AC-11 PASS · BE residuals CLOSED · OBS P1 FE-EDIT-RESTORE · DENIED printable UAT
- **Evidence:** docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-02.md · _tmp FINAL · screens qa-02
- **Reuse-tag:** ctr-xevn-tpl-ac11-u65, be02-expand-cfg-closed, edit-restore-obs, honesty-no-printable-uat

`;

const prev = readFileSync(kb, 'utf8');
writeFileSync(kb, kbEntry + prev, 'utf8');
console.log('bus+kb ok');
