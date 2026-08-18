# QC Gate Decision — QC-HRM-U72-FIELD-DISPLAY-01 · **R2 re-gate** (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-U72-FIELD-DISPLAY-01` |
| **gate_revision** | **R2** (after pack repair) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **NO-GO (product)** |
| **slice** | HRM U72 field display / label-leak — **local** `:5173` / `:28001` / `:28002` only |
| **prior_decision** | **NO-GO (process)** — `docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md` · **C-U72-PACK-01** |
| **pack_repair** | `docs/qa/evidence/qa-hrm-u72-field-display-pack-01-20260727.md` · **READY_FOR_QC** |
| **qa_evidence** | `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` (patched Layer B · overall **FAIL** retained) |
| **spec** | `docs/hrm/SRS_FIELD_DISPLAY.md` §2–§4 · AC-FD-01..13 · AC-CO-IND-02 · AC-U72-GLOBAL |
| **rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · QA `seed: none` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen PASS maps** | **No** — PM already **DISPATCHED** `D-HRM-U72-LABEL-FE-02` for U02 only |

---

## 0. Supersession note

| Item | R1 (prior) | R2 (this gate) |
|------|------------|----------------|
| Pack `verify:qc:evidence-pack` | **FAIL** 2/8 (`journey_l25` + `crud_or_matrix`) | **PASS 8/8** exit **0** |
| **C-U72-PACK-01** | OPEN → QA Layer B | **CLOSED** |
| Product AC-FD-U02 / GLOBAL | Provisional PASS draft (R1 audit) → later spot2 **FAIL** | **FAIL retained** — **NO-GO (product)** |
| Decision | **NO-GO (process)** | **NO-GO (product)** — pack closed; product not GO |

Prior NO-GO (process) file **retained** (history). R2 does **not** wipe R1. Pack 8/8 **≠** product GO.

---

## 1. Scope audited

**In scope (this re-gate):**
- Confirm evidence pack integrity after `QA-HRM-U72-FIELD-DISPLAY-PACK-01`
- **Close C-U72-PACK-01**
- Product gate on patched QA overall **FAIL** (AC-FD-U02 / AC-U72-GLOBAL)
- Soft residual **C-U72-LEAVE-P2** OK
- Locks: U65 · HOLD_DEPLOY · no Phase1/PROD/:8088 · no Dev reopen of PASS AC maps

**Explicitly not approved:** Product GO / GWC-as-PASS · Phase 1 DONE · PROD-READY · `:8088` · Dev reopen for PASS label surfaces

---

## 2. Evidence pack gate (mandatory)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS |
| portal_url | PASS |
| journey_l25 | PASS (was FAIL on R1) |
| crud_or_matrix | PASS (was FAIL on R1) |
| residual_section | PASS |
| timestamp | PASS |

**Pack integrity:** **8/8** — process blocker **cleared**. **C-U72-PACK-01 = CLOSED**.

**Forbidden:** Treating 8/8 as product GO — product FAIL rows remain authoritative.

---

## 3. Product audit (blocking)

Patched QA MD + spot2 runtime corroborate **P0 label-leak**:

| AC / rollup | QA verdict | QC | Note |
|-------------|------------|-----|------|
| **AC-FD-U02** | **FAIL** | **FAIL** | Profile `HLD-0996` · user-visible **`LEGAL_SPECIALIST`** · `_tmp-qa-hrm-u72-spot2-runtime.json` `hasJobKey=true` |
| **AC-U72-GLOBAL** | **FAIL** | **FAIL** | Driven by U02 `job_title_key` leak |
| AC-CO-IND-02 | PASS | Keep | Industry `-`/`—` · no entity_type leak — **no Dev reopen** |
| AC-FD-01..13 (non-U02) · U01/U03..U06 | PASS / N/A | Keep | Anti-leak PASS rows — **no Dev reopen** |
| AC-FD-U04 leave calendar | PASS | Keep | VI **Ốm** · visibility `rawVisible=[]` |
| **J-HRM-CO-01** | PASS | Cite OK | L2.5 industry journey — does **not** clear GLOBAL |
| **J-HRM-01** (optional) | PASS | Cite OK | Cross-nav — does **not** clear U02 |

### Soft residual (not sole blocker)

| ID | Severity | Status |
|----|----------|--------|
| **C-U72-LEAVE-P2** / R-U72-LEAVE-FALLBACK | P2 | **OK soft** — LeaveTab `?? code` on catalog miss; align to `—` optional later; **not** reason to reopen PASS maps |
| R-U72-POSITIVE-GENDER | P3 | N/D — API null / U65 no seed |
| R-U72-AC-FD-11 | P3 | Import preview N/A |

### Classification

| Signal | Class | Action |
|--------|-------|--------|
| Pack 8/8 after PACK-01 | **PROCESS** | **C-U72-PACK-01 CLOSED** |
| AC-FD-U02 / AC-U72-GLOBAL `LEGAL_SPECIALIST` | **PRODUCT P0** | **NO-GO (product)** — FE already under `D-HRM-U72-LABEL-FE-02` |
| PASS AC maps (industry, contracts, leave VI, …) | PRODUCT closed | **No Dev reopen** |
| LeaveTab fallback | PRODUCT P2 soft | **C-U72-LEAVE-P2** OK |
| Vite ECONNRESET / UV assert noise | ENV | Not product NO-GO |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope? | Status |
|-----|-----------|--------|
| **J-HRM-CO-01** | Yes | **PASS** (industry / company label) — cited in pack |
| **J-HRM-01** | Optional cite | **PASS** (contracts→profile cross-nav) |
| Label on same profile | Product | **FAIL** AC-FD-U02 — journey PASS ≠ GLOBAL PASS |

U19 satisfied for pack wording. Product gate remains **NO-GO** on label-leak.

---

## 5. Conditions / locks

| ID | Status | Statement | Owner |
|----|--------|-----------|-------|
| **C-U72-PACK-01** | **CLOSED** | Pack repair verified 8/8 | — |
| **C-U72-HOLD-01** | Stands | **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U72-LEAVE-P2** | OK soft | LeaveTab catalog-miss raw fallback = condition OK | **pm** / optional later **dev-fe** |
| **C-U72-NO-DEV** | Stands for PASS rows | **No** Dev reopen of PASS AC maps; U02 owned by existing **`D-HRM-U72-LABEL-FE-02`** | **pm** |
| **C-U72-U02-P0** | **OPEN** | Blocks product GO until FE + QA retest clears `LEGAL_SPECIALIST` | **dev-fe** → **qa** |

---

## 6. Decision

### **NO-GO (product)**

- Process: pack **8/8** · **C-U72-PACK-01 CLOSED**.
- Product: **AC-FD-U02** + **AC-U72-GLOBAL** remain **FAIL** (`LEGAL_SPECIALIST` on employee profile) → **cannot GO / cannot GWC-as-PASS**.
- PM already **DISPATCHED** `D-HRM-U72-LABEL-FE-02` — QC does **not** re-open PASS AC maps; does **not** invent a second FE wave for closed surfaces.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.
- **No seed**. **C-U72-LEAVE-P2** soft OK.

---

## 7. Handoff

### completion_report

- **Closed:** R2 re-gate after PACK-01; `verify:qc:evidence-pack` **exit 0 (8/8)**; **C-U72-PACK-01 CLOSED**; L2.5 J-HRM-CO-01 / read-only matrix accepted for process integrity; PASS AC rows confirmed keep / no Dev reopen; HOLD_DEPLOY + NOT Phase1/PROD/:8088 + LeaveTab P2 soft recorded.
- **Open / blocking product:** **AC-FD-U02** / **AC-U72-GLOBAL** (`LEGAL_SPECIALIST`) → **NO-GO (product)**; FE path **`D-HRM-U72-LABEL-FE-02`** (already DISPATCHED — do not duplicate unless stalled).
- **Residual soft:** C-U72-LEAVE-P2 OK; P3 gender/import N/D.

### next_owner

`pm` (monitor / continue **`D-HRM-U72-LABEL-FE-02`** → QA retest U02 → QC re-gate product)

### next_dispatch_prompt

```text
work_item_id: D-HRM-U72-LABEL-FE-02
from_role: pm
to_role: dev-fe (if not already in-flight) → then qa
lane: execution · U65 zero-seed · FIX U02 only
entry_criteria:
  - QC R2 NO-GO (product): docs/qa/evidence/qc-hrm-u72-field-display-01-r2-20260727.md
  - Pack C-U72-PACK-01 CLOSED (8/8) — do not re-open process pack
  - Defect: AC-FD-U02 / AC-U72-GLOBAL — profile HLD-0996 shows LEGAL_SPECIALIST (job_title_key); catalog has «Chuyên viên Pháp chế»
  - Spec: docs/hrm/SRS_FIELD_DISPLAY.md AC-FD-U02 · display-label-no-raw-key.mdc · BR-CO-LABEL-01
  - must_keep: PASS AC maps (industry, contracts VI, leave calendar Ốm, AC-FD-01..13 non-U02) — no regression reopen
exit_criteria:
  1) FE: Chức vụ / header chip show VI label or fail-closed — (never raw job_title_key)
  2) CODE-MEMORY APPEND; no seed; HOLD_DEPLOY language
  3) READY_FOR_QA → QA retest AC-FD-U02 + AC-U72-GLOBAL + spot regression AC-CO-IND-02
  4) Then QC product re-gate (expect GWC local if U02 cleared; C-U72-LEAVE-P2 OK soft)
evidence_path: docs/qa/evidence/d-hrm-u72-label-fe-02-20260727.md
cấm: seed · reopen PASS AC maps · Phase1/PROD/:8088 · treat prior pack 8/8 as product GO
```

### evidence_path

`docs/qa/evidence/qc-hrm-u72-field-display-01-r2-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`D-HRM-U72-LABEL-FE-02` (already DISPATCHED — continue/monitor) → QA retest U02 → QC product re-gate; **do not** reopen PASS label maps; **HOLD_DEPLOY**.
