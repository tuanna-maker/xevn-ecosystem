# PO-HRM-REC-PLAN-CONSOLE-QA-01 — Plan console retest (C-CONSOLE-CRASH)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-REC-PLAN-CONSOLE-QA-01` |
| **role** | qa |
| **date** | 2026-08-06 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · browser mutates=0 |
| **L0** | `pnpm run qc:fe-be-health` → **ALL PASS** (portal `:5173`, hrm-api `:28001`) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **gap_class** | `C-CONSOLE-CRASH` (OS `36` §3) — **not** BA E2E linkage |
| **cấm claim** | `recruitment_uat_ready` · UV position SELECT / compare invent |

## Spec / scope

- Surface only: `/command-center/hrm/recruitment?tab=plans` → list → plan detail
- Assert: `pageErrors=0` · zero Uncaught · zero unique-key on plan path
- Out of scope: định biên / position SELECT / CandidateComparison (BA `PO-HRM-REC-E2E-LINKAGE-SPEC-01`)
- FE handoff: `docs/qa/evidence/po-hrm-rec-plan-console-fe-01.md` (`READY_FOR_QA`)

## Before (console class counts)

### A — Sponsor mixed session (`sponsor-console-20260806-recruitment.log`)

| Class | Count | Note |
|-------|------:|------|
| `Uncaught ReferenceError: getDialogPortalContainer is not defined` | **11** | Recruitment dialogs shell (closed by HEADER-JD-DND FE; still baseline for wave) |
| `Uncaught ReferenceError: LayoutDashboard is not defined` | **3** | CommandCenter parent HMR |
| `@hello-pangea/dnd` drag-handle | hundreds | JD designer — **out of plan path** |

### B — FE live probe before unique-key FIX (`po-hrm-rec-plan-console-fe-01.md`)

| Metric | Before FIX |
|--------|----------:|
| `pageErrors` (Uncaught) | **0** |
| `consoleErrors` | **1** |
| `consoleWarnings` | **0** |
| `getDialogPortalContainer` | **0** |
| `LayoutDashboard` | **0** |
| `dragHandle` | **0** |
| `uniqueKey` | **1** |
| `ReferenceError` / `TypeError` | **0** |

Text: `Warning: Each child in a list should have a unique "key" prop. Check the render method of Recruitment.`

## After (QA independent browser — this seat)

Harness: `scripts/qa/_tmp-po-hrm-rec-plan-console-qa-01.mjs`  
Artifact: `docs/qa/evidence/_tmp-po-hrm-rec-plan-console-qa-01.json`

### Click path

1. `goto /login`
2. login `ceo@xe.vn` submit
3. `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=plans&companyId=main&tenantId=xevn`
4. click tab **Kế hoạch**
5. open plan row **TMDV-PLAN-DH7VCT** (`KH Tuyển Lái xe Vận hành TMDV` · Đã duyệt)

`openedDetail: true` · detail dept table visible (listSnippet non-empty) · mutates=0

### Console class counts (plan path only)

| Metric | After QA |
|--------|--------:|
| `pageErrors` | **0** |
| `consoleErrors` | **0** |
| `consoleWarnings` | **0** |
| `getDialogPortalContainer` | **0** |
| `LayoutDashboard` | **0** |
| `dragHandle` | **0** |
| `uniqueKey` | **0** |
| `validateDOMNesting` | **0** |
| `ReferenceError` | **0** |
| `TypeError` | **0** |
| `Uncaught` (class + pageerror) | **0** |

## Verdict

| Check | Result |
|-------|--------|
| L0 FE↔BE health | 🟢 PASS |
| Plan list + detail open (TMDV-PLAN-*) | 🟢 PASS |
| `pageErrors=0` / zero Uncaught | 🟢 PASS |
| zero unique-key on plan path | 🟢 PASS |
| UV position SELECT / compare | ⬜ **not asserted** (BA cascade) |
| `recruitment_uat_ready` | ❌ **not claimed** (`C-SLICE-≠-MODULE`) |

**Overall: PASS** for seat `C-CONSOLE-CRASH` on recruitment **plan** path.

## Residual

| Item | Owner |
|------|-------|
| BA E2E linkage — UV position SELECT / compare empty | `PO-HRM-REC-E2E-LINKAGE-SPEC-01` (ba-process / sa) — parallel |
| Module UAT-ready recruitment | ❌ open — slice console ≠ module GO |

## Honesty (OS 36)

- Layer PASS: browser plan-path console clean after FE FIX
- **Không** nói: recruitment module UAT-ready / Phase DONE / JD remaster

## next_owner

**pm** (intake → optional narrow QC on console seat, or continue BA linkage cascade)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-PLAN-CONSOLE-QC-01 (optional) OR continue PO-HRM-REC-E2E-LINKAGE-SPEC-01
role: pm intake
context: QA PASS_TO_PM on C-CONSOLE-CRASH plan path only
evidence: docs/qa/evidence/po-hrm-rec-plan-console-qa-01.md
facts: pageErrors=0 uniqueKey=0 opened TMDV-PLAN-DH7VCT; U65; NOT recruitment_uat_ready
cấm: promote slice to module UAT; invent UV SELECT AC without BA
```

## completion_report

- Closed: QA retest plan console after FE unique-key FIX — Uncaught=0, uniqueKey=0, detail TMDV-PLAN-DH7VCT open.
- Residual: BA linkage UX; no module UAT claim.
- Evidence JSON + this md written before handoff.
