# Evidence — PO-HRM-REC-UV-YCTD-QA-01 · R2 retest

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QA-01` |
| **round** | **R2** (retest after FE-02 Lane A list union) |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **beMode** | **`nest start --watch`** (live `dev:hrm-api` / turbo filter) — preferred; dist/main also present |
| **parent** | `PO-HRM-REC-UV-YCTD-FE-02` `READY_FOR_QA` |
| **prior FAIL** | R1 `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md` · `R-UV-YCTD-LANE-A-LIST-GAP` |
| **journey** | `J-HRM-REC-UV-01` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-rec-uv-yctd-qa-01-r2.mjs` (FE list-cell gate tightened vs R1) |
| **screens** | `docs/qa/evidence/screens/po-hrm-rec-uv-yctd-qa-01-r2/` (00–06) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · not module UAT · not product GO |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal 200 · hrm 200 · xbos 200 |
| BE runtime | watch (`nest start --watch`) — note in env |

---

## 1. Verdict matrix (R2)

| Case | R1 | R2 | Evidence highlight |
|------|----|----|-------------------|
| L2_MOUNT | 🟢 | 🟢 | `/hr/recruitment?tab=candidates&companyId=main` |
| **UF-REC-UV-01** | 🟢 | 🟢 | Form + YCTD SELECT · receivable **200** count=**10** |
| **UF-REC-UV-02** | 🟡 N/A | 🟡 N/A | Natural receivable=10 — U65 no wipe |
| **UF-REC-UV-03** | 🟢 | 🟢 | pos=`Tổng Giám đốc` · `key=CEO` · `source=yctd` · freeTextSoT=0 |
| **UF-REC-UV-04** | 🟢 | 🟢 | Lưu **disabled** without YCTD · zero POST |
| **UF-REC-UV-05** | 🔴 | 🟢 | POST **201** `HRM-REC-202` + list cells **filled** |
| **UF-REC-UV-05-F5** | 🔴 | 🟢 | F5 retains YCTD+position on FE (**AC-02**) |
| **UF-REC-UV-06** | 🟢 | 🟢 | Derived readonly · no free-text SoT |
| **UF-REC-UV-07** | 🟢 | 🟢 | `?requisition_id=` preselect + position |
| **UF-REC-UV-08** | 🟢 | 🟢 | 0 `job_postings` write |
| **J-HRM-REC-UV-01** | 🔴 | 🟢 | Steps 8–10 list/F5 PASS |
| Process gate | 🟢 | 🟢 | pageErrors=0 · Uncaught=0 · DnD=0 · mojibake=0 · consoleErrors=0 |

### AC rollup

| AC | R1 | R2 |
|----|----|----|
| **AC-REC-UV-01** | 🟢 | 🟢 |
| **AC-REC-UV-02** | 🔴 | 🟢 |
| **AC-REC-UV-03** | 🟢 | 🟢 |
| **AC-REC-UV-04** | 🟢 | 🟢 |

### Negatives (API corroborate)

| Probe | Result |
|-------|--------|
| REQUIRED | **400** `HRM-REC-UV-YCTD-REQUIRED` |
| STATUS | **400** `HRM-REC-UV-YCTD-STATUS` |
| POSITION-MISMATCH | **400** `HRM-REC-UV-POSITION-MISMATCH` |

---

## 2. Closed defect

| ID | Status | Note |
|----|--------|------|
| **R-UV-YCTD-LANE-A-LIST-GAP** | **CLOSED** | After FE-02 `unionSpineOnlyCandidatesIntoList`, Lane A POST spine-only UV appears in Candidates list with `hdsd-candidate-list-yctd` + `hdsd-candidate-list-position`; F5 retains both |

---

## 3. UF evidence blocks (R2 focus)

### UF-REC-UV-05 — Lưu đủ → list cells (CLOSED)
- Persona / URL / click: `ceo@xe.vn` · candidates tab · Thêm UV → chọn YCTD → họ tên `UV YCTD QA R2 UVYCTD-R2-HM59YG` → Lưu
- Network: POST `/api/hrm/recruitment/candidates` → **201** `HRM-REC-202`
  - body: `requisition_id=a702a898-…` · `position_key=CEO` · **no** `job_posting_id`
  - response: `position_name=Tổng Giám đốc` · `yctd_title=YCTD JD-ref QA YCTDJD-HKZN8G`
  - id: `1b45ae68-cbe9-48a8-b838-3f0d3959d744`
- **FE sau 2xx:** row visible · `hdsd-candidate-list-yctd` = `YCTD JD-ref QA YCTDJD-HKZN8G` · `hdsd-candidate-list-position` = `Tổng Giám đốc`
- Verdict: 🟢
- spec_ref: FR-UC-BP-REC-05a Thành công · F-REC-UV-YCTD-05

### UF-REC-UV-05-F5 + J-HRM-REC-UV-01 steps 8–10 — AC-02
- F5 / reload candidates: stamp visible · same YCTD + position cells · `data-requisition-id=a702a898-…`
- API GET by id → **200** display-ready (scope_parity OK) — **corroborate only**; AC-02 gated on **FE cells**
- Verdict: 🟢 · **AC-REC-UV-02 PASS**

### Regression UF-01 / 03 / 04 / 06 / 07
- All 🟢 — form gates unchanged (YCTD SELECT, derived position, REQUIRED disable, context prefill)

### Process gate
- pageErrors=0 · Uncaught=0 · DnD storm=0 · mojibake=0 · consoleErrors=0 → 🟢

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| Module recruitment UAT / product GO | **DENIED** |
| Seed used for evidence | **DENIED** (U65) |
| Narrow slice | UV↔YCTD create + list union R2 🟢 — **not** full recruitment UAT |

### Soft residual (not blocking this slice)

| ID | Item | Owner |
|----|------|-------|
| R-UV-YCTD-SPINE-POOL-MUTATE | Spine-only rows: stage/edit/delete/pipeline disabled (FE-02 intentional — no dual-write pool) | product backlog |
| R-UV-YCTD-UF02-EMPTY | Empty receivable path N/A under natural data | soft — retest when 0 receivable |

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | R2 browser U65 DONE. L0 + fe-be-health PASS · BE watch. **R-UV-YCTD-LANE-A-LIST-GAP CLOSED**: UF-05 list cells + UF-05-F5 FE retain + AC-02 + J-HRM-REC-UV-01 steps 8–10 🟢. Regression UF-01/03/04/06/07 🟢. Negatives REQUIRED/STATUS/MISMATCH 🟢. Process clean. `recruitment_uat_ready=false`. No seed. No commit. |
| **next_owner** | **qc** (narrow slice gate) |
| **next_dispatch_prompt** | See §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01-r2.md` (+ pointer on qa-01.md §R2) |
| **ack_status** | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-REC-UV-YCTD-QA-01 R2 PASS_TO_PM
u65: zero-seed · honesty recruitment_uat_ready=false

entry_criteria:
- docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01-r2.md PASS_TO_PM
- FE-02 READY evidence docs/qa/evidence/po-hrm-rec-uv-yctd-fe-02.md
- Prior R1 FAIL closed: R-UV-YCTD-LANE-A-LIST-GAP

task:
- Audit R2 evidence: UF-05 list cells + F5 FE retain + J-HRM-REC-UV-01 steps 8–10 + process gate
- Confirm AC-REC-UV-01..04 PASS on browser FE (not API-only)
- GWC or GO for narrow UV↔YCTD create+list slice ONLY
- DENY recruitment_uat_ready / module UAT / product GO
- Note residual: spine-only mutate disabled (intentional); UF-02 empty N/A soft

exit_criteria:
- GO | GWC | NO-GO with residual list
- evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-qc-01.md
- honesty: recruitment_uat_ready=false
```
