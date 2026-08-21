import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

const busBlock = `
## 2026-08-04T09:42:00+07:00 | qa -> pm | PO-UC-TC-W4-QA-E1-P1-INB-CV PASS_TO_PM
- work_item_id: PO-UC-TC-W4-QA-E1-P1-INB-CV
- from_role: qa
- to_role: pm
- ack_status: **PASS_TO_PM**
- evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md
- summary: P1 PARTIAL — UC-CC-P0-06 LIST/DET/APPR PASS (hrm_leave complete 201 XBOS-WF-200); UC-XBOS-CC-06 OPEN/SAVE/F5 PASS (PUT 200 XBOS-WF-201 x-company-id=main). L2/self BLOCKED honest. U65 no seed. DEPT not reopened. uat_done false.
- residuals: R-W4E1-CV-L2-SELF (P1) · R-W4E1-INB-X-COMPANY (P2 complete header) · R-W4E1-CV-GRAPH-TAB (P2)
- pm_dispatch_hint: PO-UC-TC-W4-QA-E1-P1-L2-SELF (qa) and/or PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01 (dev-fe)
- next_owner: pm
- uat_done: false
`;

const qaKb = `## 2026-08-04 | xevn PO-UC-TC-W4-QA-E1-P1-INB-CV PASS_TO_PM

- **Context:** P1 inbox approve + canvas save after E1 PARTIAL; U65; HDSD
- **Action:** L0; settings=workflow Chỉnh sửa Lưu PUT 200 XBOS-WF-201 x-company-id=main+F5; inbox hrm_leave DET+complete 201 XBOS-WF-200; L2/self BLOCKED honest; no seed
- **Outcome:** **PASS_TO_PM** — seat PARTIAL; APPR+SAVE closed; residuals L2/self + complete header; uat_done false
- **Evidence:** docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md
- **Reuse-tag:** po-uc-tc-w4-qa-e1-p1-inb-cv, workflow-settings-deeplink, inbox-leave-fe-spawn-approve

`;

const shared = `## 2026-08-04 | xevn W4-E1-P1 — workflow menu false-match Action Cards
- Lesson: Regex menu click Quy trinh can land on Action Cards; force deeplink ?settings=workflow and assert He thong quy trinh / Them quy trinh moi before Chinh sua -> Luu quy trinh. FE-origin inbox approve = hrm_leave/xbos-workflow cards (not seed); complete may omit x-company-id while definitions PUT sends main.
- Evidence: docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md
- Reuse-tag: workflow-settings-deeplink, inbox-complete-x-company-gap

`;

function prepend(path, block) {
  const cur = readFileSync(path, 'utf8');
  if (cur.includes('PO-UC-TC-W4-QA-E1-P1-INB-CV PASS_TO_PM') && path.includes('AGENT_MESSAGE_BUS')) {
    console.log('bus already has entry');
    return;
  }
  writeFileSync(path, block + cur);
  console.log('updated', path);
}

prepend(resolve(root, 'docs/program/AGENT_MESSAGE_BUS.md'), busBlock);
prepend('C:/Users/ADMIN/.cursor/knowledge-base/qa.md', qaKb);
prepend('C:/Users/ADMIN/.cursor/knowledge-base/shared-lessons.md', shared);

// also team bus pointer if exists
try {
  prepend(resolve(root, '.cursor/team/AGENT_MESSAGE_BUS.md'), busBlock);
} catch {
  /* optional */
}
