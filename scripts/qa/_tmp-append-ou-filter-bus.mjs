import { appendFileSync } from 'node:fs';

const busBlock = `

## 2026-07-27T03:25Z | qa -> pm | PASS_TO_PM | QA-HRM-OU-FILTER-01
work_item_id: QA-HRM-OU-FILTER-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-ou-filter-01-20260727.md
summary: Browser U65 :5173 ceo@xe.vn — OU filter selectable; GET operating-units 200 (5 DVTV); Visun → employees company_id=logistics + banner; rollup → main; detail keeps same employee. Sponsor: YES select + YES company filter.
residual: none P0/P1; optional P3 copy that rollup label is not a dead control
next_owner: pm
next_dispatch_prompt: Intake PASS — no Dev FAIL; optional sponsor brief; HOLD_DEPLOY; NOT :8088
`;

appendFileSync('docs/program/AGENT_MESSAGE_BUS.md', busBlock, 'utf8');

const kbBlock = `

## 2026-07-27 | xevn QA-HRM-OU-FILTER-01 PASS_TO_PM

- **Context:** Sponsor screenshot «Tất cả đơn vị (rollup)» — ask if cannot select / filter-by-company exists.
- **Action:** Puppeteer \`:5173/hr/employees?portal=1\` · \`ceo@xe.vn\` · open OU Select · Visun → Network \`company_id=logistics\` · rollup \`main\` · detail keep id; U65 no seed.
- **Outcome:** **PASS_TO_PM** · AC1–6 PASS · YES selectable · YES business company filter (Group CEO embed).
- **Evidence:** \`docs/qa/evidence/qa-hrm-ou-filter-01-20260727.md\`
- **Reuse-tag:** \`hrm-ou-filter-selectable\`, \`company-id-logistics-scope\`, \`detail-filter-keeps-employee\`
`;

appendFileSync('C:/Users/ADMIN/.cursor/knowledge-base/qa.md', kbBlock, 'utf8');
console.log('appended bus+kb');
