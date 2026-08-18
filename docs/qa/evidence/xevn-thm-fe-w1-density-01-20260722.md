# XEVN-THM-FE-W1-DENSITY-01 — HRM density ops-first (REC + PAY)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-FE-W1-DENSITY-01` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **Program** | `P1-XEVN-THEME-REMASTER` |
| **spec_ref** | `XEVN_THEME_SCREEN_INVENTORY.md` FE-W1-HRM · HRM-REC / HRM-PAY · ADR sharp-ops §4.4 L-OPS |
| **Parent** | `XEVN-THM-QC-W1-HRM-01` GWC **C1** (density rainbow / payroll tutorial deferred) |
| **Locks** | L-OPS · L-CONTRAST (must keep pale strict 0) · must_keep OU / CO-REC tokens |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **U65** | zero-seed — chrome/density only; no API/business logic |

---

## 1. Verdict

Closed QC residual **C1** for P0 density clutter on **HRM-REC** + **HRM-PAY**: rainbow top-nav / KPI chrome → neutral `primary` + xevn text tokens; payroll marketing step/video gradient cards → ops-first title + primary CTAs + shortcut buttons. Pale gate **remains CLOSED** (`verify:xevn:theme-contrast --strict` exit **0**, hitCount **0**). **Not** claiming full inventory remaster DONE (ATT rainbow, other P1/P2 rows remain).

---

## 2. Exit criteria map

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Remaster REC rainbow tabs + PAY tutorial cards → ops-first | **PASS** | `Recruitment.tsx` · `Payroll.tsx` · `CandidatePipelineFunnel.tsx` |
| 2 | Must keep pale gate strict 0; OU / CO-REC untouched | **PASS** | contrast `--strict` exit 0; OU filter still `text-xevn-text\|Secondary\|Muted` |
| 3 | No seed / no API / no pale reopen | **PASS** | chrome-only diff |

---

## 3. Changes (files)

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Recruitment.tsx` | Top-nav: `recTabButtonClass` active=`bg-primary`; icon wrap `bg-xevn-neutral/15`; dropdown checks → primary. KPI strip + cost rows → xevn/primary (no rainbow). CODE-MEMORY. |
| `apps/web/hrm/src/pages/Payroll.tsx` | Removed `getStepCards` gradient/video; `getOpsShortcuts` + overview header CTAs (Tính lương / Chi trả). Tab icons neutral. Salary summary tile → `bg-primary/10`. CODE-MEMORY. |
| `apps/web/hrm/src/components/recruitment/CandidatePipelineFunnel.tsx` | `STAGE_TINT` → primary/xevn (6 columns kept). |
| `apps/web/hrm/src/lib/xevn-thm-fe-w1-density-01.test.ts` | Source guards (3) |

**Untouched (must_keep):** `HrmOperatingUnitFilter.tsx`, InterviewsTab / HeadcountProposalTab CO-REC badge tokens, pale class ban list.

---

## 4. Commands

```bash
pnpm run verify:xevn:theme-contrast -- --strict
# → STRICT PASS — 0 pale hits · exit 0

cd apps/web/hrm && pnpm exec vitest run src/lib/xevn-thm-fe-w1-density-01.test.ts
# → 3 passed
```

---

## 5. L-OPS AC check (sample)

| screen_id | Before | After |
|-----------|--------|-------|
| **HRM-REC** | 11× `bg-*-500` tab pills + rainbow KPI | Neutral primary active tab; KPI bar=`bg-primary`; cost icons xevn |
| **HRM-PAY** | Emerald welcome + 5 gradient «Xem video» cards | Title + CTAs calculate/payment; empty = outline shortcuts (no video) |
| **HRM-REC funnel** | Violet/amber/orange/emerald/rose columns | primary / xevn-neutral |

---

## 6. Residual (not this work_item)

| Item | Owner |
|------|--------|
| Attendance top-nav still rainbow (`Attendance.tsx`) | later FE density wave |
| Insurance / AppSidebar color pills | later wave |
| Full inventory remaster DONE | **forbidden claim** |
| Fresh Vite before UAT demo (QC C2) | devops / FE restart |

---

## completion_report

- **Closed:** C1 density polish — REC rainbow tabs/KPI + PAY tutorial gradient cards → ops-first; funnel STAGE_TINT neutralized; pale strict 0 kept; OU/CO-REC not regressed; vitest 3 PASS.
- **Residual:** ATT / other module rainbow chrome; full remaster not DONE.
- **Did not:** seed; reopen pale classes; change API/business logic; claim Phase1/PROD/full remaster.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-QA-W1-DENSITY-01
from_role: pm
to_role: qa
entry_criteria: XEVN-THM-FE-W1-DENSITY-01 READY_FOR_QA — docs/qa/evidence/xevn-thm-fe-w1-density-01-20260722.md
exit_criteria:
1) Browser (fresh HRM Vite): /recruitment — top tabs active = primary (no rainbow bg-*-500 pills); KPI/cost readable xevn
2) Browser: /payroll overview — no gradient «Xem video» step cards; title + CTA Tính lương / Chi trả (or shortcuts); salary summary not emerald gradient tile
3) pnpm run verify:xevn:theme-contrast -- --strict exit 0 (must keep pale CLOSED)
4) Spot OU filter + CO/REC badges still xevn tokens (must_keep)
cấm: seed; FAIL pale reopen; claim full remaster DONE; API mutate
evidence_path: docs/qa/evidence/xevn-thm-qa-w1-density-01-20260722.md
ack_status: PASS_TO_PM
persona: ceo@xe.vn / Xevn@2026 · URL embed or standalone HRM
```

## ack_status

**READY_FOR_QA**
