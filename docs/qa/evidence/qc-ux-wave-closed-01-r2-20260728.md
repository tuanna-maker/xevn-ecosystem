# QC Gate — QC-UX-WAVE-CLOSED-01-R2 (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-UX-WAVE-CLOSED-01-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · HOLD_DEPLOY · U65 |
| **date** | `2026-07-28` (ICT) |
| **decision** | **GO WITH CONDITIONS** — Cursor UX wave CLOSED claim accepted (UX-09 · P0-c · Profile C2) |
| **supersedes** | `docs/qa/evidence/qc-ux-wave-closed-01-20260728.md` (**NO-GO** · R-P0C-ADV-UX06) |
| **scope_claim** | Bounded L3 re-gate of three-slice UX wave — **not** Phase1/PROD · **not** deploy |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed confirmed in R2 runtime (`seed: false`); no seed by QC |
| **Portal URL** | `http://127.0.0.1:5173` · Account `ceo@xe.vn` · `companyId=main` |

---

## Scope (bounded — L3 re-gate)

| In scope | Explicitly out |
|----------|----------------|
| Runtime-first audit of P0-c R2 after ADVANCE-LIVE-WIRE | Full re-browser of UX-09 / Profile C2 |
| Close prior NO-GO **R-P0C-ADV-UX06** / **DEF-P0C-ADV-01** | Phase1 / PROD / `:8088` claim |
| Re-affirm UX-09 + Profile C2 prior acceptance | Seed · deploy · apps/** edits |
| must_keep Clock-In / taxSettlementFloatingUi / D5 Zod | Expand to full HRM J-* program |

**Prior CLOSED (context):** D5 Zod · UX-03 · WCAG R3m · A-TOKEN · C1 (`qc-ux-c1-01-20260728.md`).

---

## Runtime truth (mandatory — opened first)

**Artifact:** `docs/qa/evidence/_tmp-qa-ux-p0c-01-runtime.json`  
**(copy):** `docs/qa/evidence/_tmp-qa-ux-p0c-01-r2-runtime.json`

```text
verdict: PASS
hardFails: []
seed: false
hold_deploy: true
finishedAt: 2026-07-28T08:11:10.536Z
```

| Step | ok | QC |
|------|----|-----|
| L0-portal / login | true | PASS |
| UF-P0C-payroll-mount | true | PASS |
| UF-P0C-tab-switch | true | PASS |
| UF-P0C-tax-c1-mustkeep | true | PASS |
| UF-P0C-ux06-tax-cancel-reopen | true | PASS |
| **UF-P0C-ux06-advance-cancel-reopen** | **true** | **PASS — prior hardFail CLOSED** |
| UF-P0C-d5-zod-rhf | true | PASS |
| UF-P0C-ux06-salary-cancel-reopen | true | PASS |
| UF-P0C-clock-in-mustkeep | true | PASS |
| console-no-t-floating-crash | true | PASS |

Advance R2 detail (authoritative):

```text
UF-P0C-ux06-advance-cancel-reopen ok=true
liveTab=AdvanceRequestsTab closed=true
reopen={"open":true,"title":"Tạo bảng tạm ứng mới","inputs":["","Tháng 7/2026"]}
bodyHint=true
```

**No** `QA_P0C_ADV_STALE` / `2099-99`. MD ↔ runtime aligned (integrity PASS).

---

## Evidence chain audited

| Artifact | WI | Claim | Runtime / QC |
|----------|-----|-------|--------------|
| `qc-ux-wave-closed-01-20260728.md` | QC-UX-WAVE-CLOSED-01 | **NO-GO** (advance hardFail) | Superseded by this R2 |
| `d-ux-p0c-advance-live-wire-01-20260728.md` | D-UX-P0C-ADVANCE-LIVE-WIRE-01 | READY_FOR_QA | Atomic reset on live `AdvanceRequestsTab` |
| `qa-ux-p0c-01-r2-20260728.md` | QA-UX-P0C-01-R2 | PASS_TO_PM | Runtime **PASS** · hardFails=[] — **ACCEPT** |
| `qa-ux-ux09-01-20260728.md` | QA-UX-UX09-01 | PASS_TO_PM | Runtime PASS (prior QC) — **still ACCEPT** |
| `qa-ux-profile-c2-01-20260728.md` | QA-UX-PROFILE-C2-01 | PASS_TO_PM | Runtime PASS (prior QC) — **still ACCEPT** · R-C2-01 P3 condition |

---

## Micro-checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Runtime first · hardFails=[] | **PASS** |
| 2 | DEF-P0C-ADV-01 / Advance UX-06 CLOSED | **PASS** — cancel→reopen empty |
| 3 | UX-09 bulk DoD (prior) | **PASS** — acceptance retained |
| 4 | Profile C2 + J-HRM-01 (prior) | **PASS** — acceptance retained |
| 5 | must_keep Clock-In C1 | **PASS** (R2 smoke) |
| 6 | must_keep taxSettlementFloatingUi | **PASS** (R2 smoke) |
| 7 | must_keep D5 Zod Add | **PASS** (R2 · formItemMessage=3) |
| 8 | U65 zero-seed · MD↔runtime honesty | **PASS** |
| 9 | Orphan Payroll Advance Dialog | **Info P2** — not GO/GWC block |
| 10 | R-C2-01 deny-persona | **P3 condition** — non-blocking |

---

## Spot verify (QC independent — L3)

### Command / artifact table

| Check | Result | Classification |
|-------|--------|----------------|
| Open runtime JSON first | `verdict: PASS` · `hardFails: []` | PRODUCT |
| Open QA R2 + Dev wire + prior NO-GO | Done | PROCESS |
| Advance step vs prior FAIL | Prior inputs stale → R2 empty name + default period | PRODUCT **CLOSED** |
| QA MD vs runtime honesty | Both PASS · no omitted hardFail | PROCESS **PASS** |
| UX-09 runtime (retained) | `verdict: PASS` · seed=false | PRODUCT |
| Profile C2 runtime (retained) | `verdict: PASS` · seed=false | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-ux-p0c-01-r2-20260728.md` | **FAIL** exit **1** (2/8 — missing J-* / CRUD matrix headings) | PROCESS Info |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-ux-wave-closed-01-r2-20260728.md` | **PASS** exit **0** (8/8) | PROCESS |
| Seed / deploy | None | U65 · HOLD |

**Portal URL:** `http://127.0.0.1:5173` · CEO `ceo@xe.vn` · `companyId=main`.

### Browser UF / journey matrix

| Slice | Create | Read | Mutate / UX-06 | Delete/F5 | QC |
|-------|--------|------|----------------|-----------|-----|
| UX-09 shifts | FE Add 201×2 | list/toolbar | select | DELETE+F5 | **PASS** (prior) |
| P0-c tax dialog | — | mount | cancel→reopen empty | — | **PASS** |
| P0-c salary dialog | — | D5 Zod | cancel→reopen empty | — | **PASS** |
| **P0-c advance dialog** | — | tab live | **cancel→reopen empty** | — | **PASS** (was FAIL) |
| Profile C2 | — | J-HRM-01 + groups | pin F5 | — | **PASS** (prior) |
| Clock-In / tax / D5 must_keep | — | smoke | — | — | **PASS** |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Advance cancel→reopen stale (`QA_P0C_ADV_STALE`) | PRODUCT | **CLOSED** — R2 runtime PASS |
| QA MD PASS while runtime FAIL | PROCESS | **CLOSED** — R2 MD matches runtime |
| UX-09 / Profile C2 DoD | PRODUCT | **PASS** retained |
| Orphan `Payroll.tsx` Advance Dialog (no live set true) | PRODUCT Info P2 | **OPEN condition** — live path = `AdvanceRequestsTab` only; **not** block |
| R-C2-01 deny-persona DOM | PRODUCT coverage P3 | **OPEN condition** — GWC-ok |
| QA R2 evidence-pack 2/8 (no J-* heading) | PROCESS Info | **OPEN condition** — product runtime authoritative; QC consolidated pack 8/8; not product NO-GO |
| HOLD_DEPLOY / Phase1 | OUT | Unchanged — NOT claimed |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-HRM-01** | **PASS** | Profile C2 (prior + retained) |
| **J-HRM-06** adjacent (shifts) | **PASS** | UX-09 (prior + retained) |
| P0-c Payroll UX-06 advance | **PASS** | R2 closed prior FAIL |
| Full program J-* | Out of claim | — |

**J-* tested PASS (wave):** J-HRM-01 · J-HRM-06 (adjacent UX-09).  
**Deferred:** full program J-* outside this wave claim.

---

## Residual (conditions — do not block wave CLOSED)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **R-P0C-ADV-UX06** / **DEF-P0C-ADV-01** | P0 | **CLOSED** | — | Advance live UX-06 cancel→reopen empty |
| **R-QA-P0C-EVIDENCE** | P1 process | **CLOSED** | — | R2 MD aligned with runtime |
| **R-P0C-ORPHAN-ADV-DIALOG** | P2 Info | OPEN | pm (defer OK) | Orphan Payroll Advance Dialog — not live CTA; cleanup optional |
| **R-C2-01** | P3 | OPEN | pm/ba | Deny-persona — **non-blocking** |
| **R-QA-P0C-PACK-L25** | P3 process | OPEN | qa (defer OK) | Amend R2 MD with J-HRM-* / matrix headings for pack 8/8 — not product reopen |
| R-UX09-filters | P3 | defer | — | Cosmetic |
| HOLD_DEPLOY | LOCK | — | pm | No deploy |

---

## Verdict

### **GO WITH CONDITIONS** — Cursor UX wave CLOSED claim accepted

**Why GWC (not clean GO):**
1. **R-C2-01** P3 deny-persona coverage remains OPEN (explicitly non-blocking).
2. **R-P0C-ORPHAN-ADV-DIALOG** P2 Info — dead dialog in `Payroll.tsx` (not live path).
3. **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD-READY**.

**Why not NO-GO:**
1. Runtime `verdict: PASS` · `hardFails: []` (mandatory gate satisfied).
2. Prior P0 Advance UX-06 **CLOSED** with MD↔runtime integrity.
3. UX-09 + Profile C2 prior acceptance retained; must_keep smoke green.

**Promoted CLOSED for this wave:**
- UX-09 Shifts bulk (U65 FE Add)
- P0-c Payroll mount / tabs / tax UX-06 / salary UX-06 / **Advance UX-06** / D5 Zod
- Profile C2 tab groups + J-HRM-01
- must_keep Clock-In C1 · taxSettlementFloatingUi · D5 Zod

**HOLD_DEPLOY · NOT Phase 1 DONE · NOT PROD-READY · cấm deploy.**

---

## completion_report

**Closed:** L3 re-gate after `D-UX-P0C-ADVANCE-LIVE-WIRE-01` + `QA-UX-P0C-01-R2`. Runtime-first PASS / hardFails=[]. **DEF-P0C-ADV-01** / **R-P0C-ADV-UX06** CLOSED. Prior NO-GO superseded. UX-09 + Profile C2 acceptance retained. must_keep Clock-In / tax / D5 no regression in R2. Wave CLOSED claim **accepted** as **GO WITH CONDITIONS**.

**Open / residual (conditions only):** R-C2-01 P3 · orphan Advance Dialog P2 Info · HOLD_DEPLOY. No P0/P1 product residual for residual_auto_fix Dev.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-UX-WAVE-CLOSED-INTAKE-01
from_role: qc
to_role: pm
lane: governance
residual_auto_fix: true
entry_criteria:
  - QC-UX-WAVE-CLOSED-01-R2 GO WITH CONDITIONS @ docs/qa/evidence/qc-ux-wave-closed-01-r2-20260728.md
  - Runtime truth PASS hardFails=[] @ docs/qa/evidence/_tmp-qa-ux-p0c-01-runtime.json
  - Prior NO-GO R-P0C-ADV-UX06 CLOSED; DEF-P0C-ADV-01 CLOSED
conditions_open:
  - R-C2-01 P3 deny-persona (non-blocking)
  - R-P0C-ORPHAN-ADV-DIALOG P2 Info (optional cleanup — not live CTA)
locks: HOLD_DEPLOY · U65 · cấm Phase1/PROD DONE · cấm deploy
actions:
  1. Bus INTAKE + update TEAM_WORKING_NOW / PEER synthesis if wave CLOSED claimed to sponsor
  2. Do NOT reopen Dev on Advance UX-06 unless new FAIL
  3. Optional later: defer orphan dialog cleanup work_item (P2) — not blocking
  4. Continue next program residual from backlog scan (not this wave P0)
exit_criteria: sponsor-facing status honest GWC + conditions listed · no deploy · no Phase1 DONE claim
```

## ack_status

**PASS_TO_PM**
