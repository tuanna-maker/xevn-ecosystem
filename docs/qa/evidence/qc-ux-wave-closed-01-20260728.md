# QC Gate — QC-UX-WAVE-CLOSED-01 (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-UX-WAVE-CLOSED-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · HOLD_DEPLOY · U65 |
| **date** | `2026-07-28` (ICT) |
| **decision** | **NO-GO** — wave CLOSED claim rejected (P0-c product FAIL + evidence integrity) |
| **scope_claim** | Audit of three QA packs only — **not** Phase1/PROD · **not** deploy |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed confirmed in runtimes; no seed by QC |
| **Portal URL** | `http://127.0.0.1:5173` · Account `ceo@xe.vn` · `companyId=main` |

---

## Scope (bounded — L3 audit)

| In scope | Explicitly out |
|----------|----------------|
| DoD completeness of 3 QA evidence MD + runtime JSON | Full re-browser (unless gap) |
| U65 · HOLD_DEPLOY · must_keep C1/tax/D5 | apps/** edits · seed · deploy |
| R-C2-01 P3 classify GWC-vs-block | Phase1 / PROD claim |

**Prior CLOSED (context only):** D5 Zod · UX-03 · WCAG R3m · A-TOKEN · C1 (`qc-ux-c1-01-20260728.md`).

---

## Evidence chain audited

| Artifact | WI | QA ack claimed | Runtime truth | QC |
|----------|-----|----------------|---------------|-----|
| `qa-ux-ux09-01-20260728.md` | QA-UX-UX09-01 | PASS_TO_PM | `verdict: PASS` · failed=0 · seed=false · screens=11 | **Accept PASS** |
| `qa-ux-p0c-01-20260728.md` | QA-UX-P0C-01 | **PASS_TO_PM** | **`verdict: FAIL`** · hardFails=`UF-P0C-ux06-advance-cancel-reopen` · stale `QA_P0C_ADV_STALE` | **REJECT — NO-GO** |
| `qa-ux-profile-c2-01-20260728.md` | QA-UX-PROFILE-C2-01 | PASS_TO_PM | `verdict: PASS` · seed=false · screens=10 | **Accept PASS** (R-C2-01 P3 OK as condition) |

---

## Micro-checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | UX-09 bulk DoD + U65 FE Add | **PASS** |
| 2 | P0-c mount / tab / tax UX-06 / salary UX-06 / D5 / Clock-In | **PARTIAL** — tax+salary OK; **advance UX-06 FAIL** |
| 3 | Profile C2 Core+groups+pin+J-HRM-01 | **PASS** |
| 4 | must_keep Clock-In C1 (all packs) | **PASS** (no regression cited) |
| 5 | must_keep taxSettlementFloatingUi | **PASS** (P0-c + siblings) |
| 6 | must_keep D5 Zod Add | **PASS** |
| 7 | U65 zero-seed | **PASS** |
| 8 | QA evidence honesty vs runtime | **FAIL** — P0-c MD omits hardFail / claims PASS |

---

## Spot verify (QC independent — L3)

### Command / artifact table

| Check | Result | Classification |
|-------|--------|----------------|
| Open 3 QA MD + 3 runtime JSON | Done | PROCESS |
| UX-09 runtime | `verdict: PASS` · seed=false | PRODUCT |
| **P0-c runtime** | **`verdict: FAIL`** · hardFail advance cancel→reopen stale inputs `["QA_P0C_ADV_STALE","2099-99"]` | **PRODUCT** |
| Profile C2 runtime | `verdict: PASS` · seed=false | PRODUCT |
| QA P0-c MD vs runtime | MD claims PASS / omits advance FAIL | **PROCESS + PRODUCT** integrity |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-ux-ux09-01-20260728.md` | **FAIL** exit **1** (7/8 — portal_url wording) | PROCESS Info |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-ux-p0c-01-20260728.md` | **FAIL** exit **1** (5/8) | PROCESS Info |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-ux-profile-c2-01-20260728.md` | **FAIL** exit **1** (7/8) | PROCESS Info |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-ux-wave-closed-01-20260728.md` | **PASS** exit **0** (8/8) | PROCESS |
| `node scripts/qa/qa-ux-p0c-01-browser.mjs` (runtime artifact) | **FAIL** — hardFails advance UX-06 | **PRODUCT** |
| Seed / deploy | None | U65 · HOLD |

**Portal URL:** `http://127.0.0.1:5173` · CEO `ceo@xe.vn` · `companyId=main`.

### Advance FAIL detail (blocker)

From `_tmp-qa-ux-p0c-01-runtime.json`:

```text
UF-P0C-ux06-advance-cancel-reopen ok=false
detail: liveTab=AdvanceRequestsTab closed=true
reopen={"open":true,"title":"Tạo bảng tạm ứng mới","inputs":["QA_P0C_ADV_STALE","2099-99"]}
```

Script treats this id as **hardFail** (`scripts/qa/qa-ux-p0c-01-browser.mjs`). Dev handoff `d-ux-p0c-payroll-reducer-01-20260728.md` lists advance (+ approval) in reducer / UX-06 atomic reset DoD. Stale reopen = **UX-06 product defect still open**.

### Browser UF / journey matrix

| Slice | Create | Read | Mutate / UX-06 | Delete/F5 | QC |
|-------|--------|------|----------------|-----------|-----|
| UX-09 shifts | FE Add 201×2 | list/toolbar | select | DELETE+F5 | **PASS** |
| P0-c tax dialog | — | mount | cancel→reopen empty | — | **PASS** |
| P0-c salary dialog | — | D5 Zod | cancel→reopen empty | — | **PASS** |
| **P0-c advance dialog** | — | tab live | **stale after cancel** | — | **FAIL** |
| Profile C2 | — | J-HRM-01 + groups | pin F5 | — | **PASS** |
| Clock-In / tax / D5 must_keep | — | smoke | — | — | **PASS** |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Advance cancel→reopen retains `QA_P0C_ADV_STALE` | **PRODUCT** | **OPEN P0** — blocks P0-c CLOSED |
| QA MD PASS while runtime FAIL | **PROCESS** | INVALID handoff — return to QA after Dev fix |
| UX-09 / Profile C2 DoD | PRODUCT | **PASS** (not blocked by advance; wave CLOSED claim still NO-GO) |
| R-C2-01 deny-persona | PRODUCT coverage P3 | Would be GWC condition if wave green — **not** the NO-GO driver |
| QA pack verify wording | PROCESS Info | Not product NO-GO alone |
| HOLD_DEPLOY / Phase1 | OUT | Unchanged |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-HRM-01** | **PASS** | Profile C2 |
| **J-HRM-06** adjacent (shifts) | **PASS** | UX-09 |
| P0-c Payroll UX-06 advance | **FAIL** | Product — stale modal state |
| Full program J-* | Out of claim | — |

---

## Residual (dispatch)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **R-P0C-ADV-UX06** | **P0** | **OPEN — blocks GO** | **dev-fe** | AdvanceRequestsTab create dialog cancel→reopen must clear form (atomic openChange / reducer); regression vitest + re-run `qa-ux-p0c-01-browser.mjs` → runtime verdict PASS |
| **R-QA-P0C-EVIDENCE** | P1 process | OPEN | **qa** | After fix: rewrite evidence — align MD with runtime; no PASS if hardFails≠[] |
| R-C2-01 | P3 | OPEN optional | pm/ba | Deny-persona DOM — **not block**; classify GWC-ok when wave re-gates |
| R-UX09-filters | P3 | defer | — | Cosmetic |
| HOLD_DEPLOY | LOCK | — | pm | No deploy |

**P0/P1 for PM residual_auto_fix:** R-P0C-ADV-UX06 (dev-fe) → then QA-UX-P0C-01 retest → QC re-gate.

---

## R-C2-01 classification (requested)

If P0-c were green: **GO WITH CONDITIONS** (not block). Portal PermissionGate bypass + wiring/CEO non-blank already documented. **Does not drive this NO-GO.**

---

## Verdict

### **NO-GO** — Cursor UX wave CLOSED claim rejected

**Why not GO / GWC:**
1. P0-c runtime **FAIL** on UX-06 Advance dialog stale reopen (core P0-c/UX-06 DoD).
2. QA pack claims **PASS_TO_PM** while omitting hardFail — evidence integrity fail-closed.

**Still accepted as green slices (do not reopen without regression):**
- UX-09 Shifts bulk (U65 FE Add path)
- Profile C2 tab groups + J-HRM-01
- must_keep Clock-In C1 · taxSettlementFloatingUi · D5 Zod (smoke PASS in packs)

**HOLD_DEPLOY · NOT Phase 1 DONE · NOT PROD-READY.**

---

## completion_report

**Closed:** L3 QC audit of UX-09 / P0-c / Profile C2 evidence. UX-09 + Profile C2 DoD accepted; R-C2-01 classified as non-blocking P3. Wave CLOSED **rejected**.

**Open / residual:** **P0** Advance UX-06 stale reopen (`R-P0C-ADV-UX06`) → Dev-FE; then QA retest + QC re-gate. Process: QA must not PASS when runtime hardFails non-empty.

## next_owner

`pm` → dispatch `dev-fe` then `qa`

## next_dispatch_prompt

```text
work_item_id: D-UX-P0C-ADV-UX06-01
from_role: pm
to_role: dev-fe
lane: execution
residual_auto_fix: true
entry_criteria:
  - QC-UX-WAVE-CLOSED-01 NO-GO @ docs/qa/evidence/qc-ux-wave-closed-01-20260728.md
  - Runtime FAIL: docs/qa/evidence/_tmp-qa-ux-p0c-01-runtime.json
    hardFails=["UF-P0C-ux06-advance-cancel-reopen"]
    reopen inputs kept QA_P0C_ADV_STALE / 2099-99
  - Spec: UX-UI-ERP-ANALYSIS P0-c / UX-06; prior Dev d-ux-p0c-payroll-reducer-01 (advance domain)
  - U65 · HOLD_DEPLOY · must_keep: taxSettlementFloatingUi C1 · SalaryComponentsTab D5 Zod · Clock-In C1 · tax+salary UX-06 already green
change_mode: FIX
allowed_paths: apps/web/hrm Payroll advance dialog / usePayrollDomainUi advance slice only
forbidden_paths: seed · deploy · reopen UX-09 / Profile C2 DoD
exit_criteria:
  - Cancel→reopen Advance create dialog: no stale typed values
  - vitest covering advance openChange reset
  - READY_FOR_QA + evidence path
  - next: QA-UX-P0C-01-R2 re-run node scripts/qa/qa-ux-p0c-01-browser.mjs → runtime verdict PASS then QC-UX-WAVE-CLOSED-01 re-gate
cấm: seed · deploy · claim PASS while hardFails non-empty · Phase1/PROD DONE
```

## ack_status

**PASS_TO_PM**
