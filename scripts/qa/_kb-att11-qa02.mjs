import { readFileSync, writeFileSync } from 'node:fs';

const p = 'C:/Users/ADMIN/.cursor/knowledge-base/qa.md';
const entry = `## 2026-08-09 | xevn PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02 PASS_TO_PM
- **Context:** FE-02 READY after Vite P0 fix; U65 ceo@ 5173 Chấm công→Bảng công; honesty false C-SLICE; printable false; ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · PAY OUT · DENY att_leave_hold · Nest /core DENY · ≠ FIXED_GĐ1=full R-SIGN-01 · must_keep ATT10/09/08/02/PLT/CORE
- **Action:** L0 PASS; hrmApi.ts 200 (blank CLOSED); Playwright J-01..06 — GET signatures 200 · 3× POST sign 201 · close 201 + F5 closed · reopen 201 · reject/incomplete 409 HRM-ATT-SIGN-INCOMPLETE · Nest /core 0; zero-seed
- **Outcome:** **PASS_TO_PM** · stamp ATT11QA2-MSLXOKS3 · J-01..06 PASS · next qc QC-01 GWC C-SLICE
- **Evidence:** docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-02.md
- **Reuse-tag:** att-11-sign-u65, vite-comment-fix-retest, physical-attendance-sheets-sign-close-reopen, nest-core-att-deny, c-slice-no-att-uat, incomplete-409-no-bypass

`;
const cur = readFileSync(p, 'utf8');
if (!cur.includes('ATT-11-CLUSTER-QA-02 PASS_TO_PM')) {
  writeFileSync(p, entry + cur);
}
console.log('kb ok');
