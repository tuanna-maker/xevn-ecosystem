# QC Gate Decision — QC-XBOS-U72-FIELD-DISPLAY-01 · **R2 re-gate** (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-XBOS-U72-FIELD-DISPLAY-01` |
| **gate_revision** | **R2** (after pack repair) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | XBOS U72 field display / label — **local** `:5173` / `:5176` only |
| **prior_decision** | **NO-GO (process)** — `docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md` · **C-XBOS-U72-PACK-01** |
| **pack_repair** | `docs/qa/evidence/qa-xbos-u72-field-display-pack-01-20260727.md` · **READY_FOR_QC** |
| **qa_evidence** | `docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md` (patched Layer B · product claims unchanged) |
| **dev_entry** | `dev-fe-xbos-label-02-20260727.md` · `dev-fe-xbos-u72-f10-holding-path-01-20260727.md` |
| **spec** | `docs/xbos/SRS_FIELD_DISPLAY.md` AC-F-XBOS-01..11 · AC-F-XBOS-09/10 · BR-XBOS-COPY-01 |
| **rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` · U65 zero-seed |
| **persona** | `ceo@xe.vn` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen** | **No** — F-09/F-10 CLOSED; soft P2 = condition OK |

---

## 0. Supersession note

| Item | R1 (prior) | R2 (this gate) |
|------|------------|----------------|
| Pack `verify:qc:evidence-pack` | **FAIL** 5/8 (`command_table` + `journey_l25` + `residual_section`) | **PASS 8/8** exit **0** |
| **C-XBOS-U72-PACK-01** | OPEN → QA Layer B repair | **CLOSED** |
| Product AC-F-XBOS-01..11 / F-09+F-10 | Provisional PASS (not promoted) | **Promoted** for **local** slice only |
| Decision | **NO-GO (process)** | **GO WITH CONDITIONS** |

Prior NO-GO file **retained** (history). R2 does **not** wipe R1.

---

## 1. Scope audited

**In scope (this re-gate):**
- Evidence pack integrity after `QA-XBOS-U72-FIELD-DISPLAY-PACK-01`
- Close **C-XBOS-U72-PACK-01**
- Promote AC-F-XBOS-01..11 · F-09 + F-10 CLOSED · **J-XBOS-05** + **J-XBOS-08** for **local** `:5173`/`:5176`
- Wire `companyId=holding` allowed (display plane)
- Soft P2: EN dataType · `job_titles` paren · CC toast `(holding)` → **C-XBOS-U72-P2**
- Locks: U65 · HOLD_DEPLOY · no Phase1/PROD/:8088 · no Dev reopen PASS

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` · matrix Dev8088 promote · Dev reopen for PASS label surfaces

---

## 2. Evidence pack gate (mandatory)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS (was FAIL on R1) |
| portal_url | PASS |
| journey_l25 | PASS (was FAIL on R1) |
| crud_or_matrix | PASS |
| residual_section | PASS (was FAIL on R1) |
| timestamp | PASS |

**Pack integrity:** **8/8** — process blocker **cleared**. **C-XBOS-U72-PACK-01 CLOSED**.

---

## 3. Product / browser audit (promoted local)

Corroborated from patched QA R2 MD + runtime JSON + **14** screenshots on disk:

| AC / Signal | QC verdict | Evidence note |
|-------------|------------|---------------|
| **AC-F-XBOS-09** | **PASS** · **CLOSED** | Runtime: select/readonly `Khối Thông tin chung` · `valueAttr=general` · `displayLeak=[]` · `badOptions=[]`; PNG `f09-infra-custom-fields.png` shows VI block nav |
| **AC-F-XBOS-10** | **PASS** · **CLOSED** | PNG `f10-apply-catalog.png`: `Nguồn tập đoàn: tập đoàn · version 7 · 4 mục`; runtime `holdingHits.lines=[]` · `hasXevnHoldingPath=false` · F5 OK |
| **Wire `companyId=holding`** | **OK** (not FAIL) | Runtime `catalogBodies` include `…/config-sync/catalog/job_titles?…&companyId=holding` · `companyIdHoldingSeen=true` — **C-XBOS-U72-WIRE-OK** |
| **AC-F-XBOS-01..08, 11** | **PASS** | Runtime fids all PASS + screenshots present |
| **AC-H-01/03/04/08/12** | **PASS** | Runtime hids PASS; H-04 soft N/A OK |
| **U65 seed** | **PASS** | Runtime `seed: false`; UI note «không dùng seed» on Apply panel |

**Runtime overall:** `PASS` · `seed: false` · finished `2026-07-27T08:30:40.064Z`.

### Soft residual (condition OK — not Dev reopen)

| ID | Severity | QC note |
|----|----------|---------|
| **R-U72-F09-DATATYPE-EN** | P2 | dataType options / meta still EN (`Text`/`Number`/`Date` / `text`·`date` in field list) — out of F-09; screenshot corroborates — **C-XBOS-U72-P2** |
| **R-U72-APPLY-JOB-TITLES-PAREN** | P2 | Dropdown `Chức danh (job_titles)` visible on Apply panel — out of AC-F-XBOS-10 — **C-XBOS-U72-P2** |
| **R-U72-CC-TOAST-HOLDING** | P2 | Optional CC toast `(holding)` outside Apply `allowed_paths` — not observed on Apply surface — **C-XBOS-U72-P2** |

### Classification

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Pack Layer B repair → 8/8 | **PROCESS** | **CLOSED** — C-XBOS-U72-PACK-01 |
| AC-F-XBOS-01..11 · F-09/F-10 CLOSED | **PRODUCT** | **PASS** local — promote under GWC · **no Dev reopen** |
| Wire `companyId=holding` | PRODUCT OK | Allowed — display plane |
| Soft P2 EN / job_titles paren / toast | PRODUCT P2 soft | **C-XBOS-U72-P2** condition OK |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 · seed:none | Governance | Honored |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope? | QC status R2 |
|-----|-----------|--------------|
| **J-XBOS-05** | Yes (infra custom fields / F-09) | **PASS** (promoted local) |
| **J-XBOS-08** | Yes (catalog apply / F-10) | **PASS** (promoted local) |
| **J-CC-01** | Optional (login → CC) | **PASS** (session path — cited) |
| Other XBOS/CC/mobile J-* | No | Out of slice — **not** claimed |

---

## 5. Conditions / locks

| ID | Status | Statement | Owner |
|----|--------|-----------|-------|
| **C-XBOS-U72-PACK-01** | **CLOSED** | Pack 8/8 after PACK-01 Layer B | — |
| **C-XBOS-U72-HOLD-01** | **OPEN (condition)** | **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-XBOS-U72-P2** | **OPEN (condition OK)** | EN dataType · job_titles paren · CC toast soft — **no** Dev reopen for PASS AC | **pm** / optional later **dev-fe** |
| **C-XBOS-U72-NO-DEV** | **OPEN (condition OK)** | **No** Dev reopen for QA PASS AC rows | **pm** |
| **C-XBOS-U72-WIRE-OK** | **CLOSED (accepted)** | Network `companyId=holding` **allowed** — not a product FAIL | — |

---

## 6. Decision

### **GO WITH CONDITIONS**

**GO for:** XBOS U72 field-display slice — AC-F-XBOS-01..11 · F-09 + F-10 **CLOSED** · **J-XBOS-05** + **J-XBOS-08** on **local** `:5173`/`:5176` only.

**Conditions (must remain stated):**
1. **HOLD_DEPLOY** — no `:8088` / PROD promote from this gate.
2. **NOT Phase 1 DONE** · **NOT PROD-READY**.
3. **C-XBOS-U72-P2** — EN dataType · `job_titles` paren · optional CC toast = **P2 soft condition OK** — **no Dev reopen** for PASS F-09/F-10.
4. Wire `companyId=holding` remains **allowed**.
5. Scope bounded to XBOS U72 label/display slice — not full XBOS/CC matrix / Phase1.

**Closed this re-gate:** **C-XBOS-U72-PACK-01**.

**U65:** zero-seed honored. **No seed** in QC.

---

## 7. Handoff

### completion_report

- **Closed:** Re-gate after PACK-01; `verify:qc:evidence-pack` **8/8**; **C-XBOS-U72-PACK-01 CLOSED**; AC-F-XBOS-01..11 · F-09/F-10 · J-XBOS-05/08 **promoted local** under **GO WITH CONDITIONS**; wire holding OK; U65 no-seed; screenshots/runtime spot-checked.
- **Residual (non-blocking):** **C-XBOS-U72-P2** (EN dataType · job_titles paren · CC toast soft); HOLD_DEPLOY / NOT Phase1/PROD/:8088.
- **Not done:** Phase1 · PROD · `:8088` · Dev reopen (none required).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-XBOS-U72-FIELD-DISPLAY-GWC-INTAKE-01
from_role: qc
to_role: pm
lane: governance · intake GWC
entry_criteria:
  - QC R2 GO WITH CONDITIONS: docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md
  - C-XBOS-U72-PACK-01 CLOSED; pack 8/8; AC-F-XBOS-01..11 + J-XBOS-05/08 local promoted
  - F-09/F-10 CLOSED; wire companyId=holding OK; C-XBOS-U72-P2 soft OK
  - HOLD_DEPLOY stands · NOT Phase1/PROD/:8088 · U65 zero-seed
exit_criteria:
  1) Bus INTAKE R2 GWC; update TEAM_WORKING_NOW / evidence index as needed
  2) Do NOT dispatch Dev for PASS F-09/F-10 or soft P2 unless sponsor prioritizes later
  3) Keep HOLD_DEPLOY · no Phase1/PROD/:8088 claim from this slice
evidence_path: docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md
cấm: seed · Dev reopen PASS · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Intake **GWC** — close pack condition done · keep **C-XBOS-U72-P2** + **HOLD_DEPLOY** · **no** Dev reopen
