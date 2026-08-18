# Evidence — PO-HRM-REC-UV-YCTD-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QA-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` (5175 down — 5173 ok) |
| **parent** | BE-01 + FE-01 `READY_FOR_QA` |
| **journey** | `J-HRM-REC-UV-01` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-rec-uv-yctd-qa-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-rec-uv-yctd-qa-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-rec-uv-yctd-qa-01/` (00–06) |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · not module UAT · not product GO |
| **ack_status** | **FAIL_TO_PM** (R1) → see **§R2** / `po-hrm-rec-uv-yctd-qa-01-r2.md` for retest |

---

## R2 retest (2026-08-06) — PASS_TO_PM

| Field | Value |
|-------|--------|
| **parent** | `PO-HRM-REC-UV-YCTD-FE-02` READY_FOR_QA |
| **beMode** | `nest start --watch` |
| **closed** | **R-UV-YCTD-LANE-A-LIST-GAP** |
| **UF-05 / UF-05-F5 / AC-02 / J-HRM-REC-UV-01** | 🟢 (FE list cells + F5 retain) |
| **honesty** | `recruitment_uat_ready=false` |
| **full evidence** | [`po-hrm-rec-uv-yctd-qa-01-r2.md`](./po-hrm-rec-uv-yctd-qa-01-r2.md) |
| **JSON** | `_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json` |
| **ack_status R2** | **PASS_TO_PM** → next **qc** `PO-HRM-REC-UV-YCTD-QC-01` |

---

## 0. L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal 200 · hrm 200 · xbos 200 |

---

## 1. Verdict matrix

| Case | Verdict | Evidence highlight |
|------|---------|-------------------|
| L2_MOUNT | 🟢 | `/hr/recruitment?tab=candidates&companyId=main` — no Sync ERROR |
| **UF-REC-UV-01** | 🟢 | Form + YCTD SELECT · GET `requisitions?receivable=true` **200** count=**10** |
| **UF-REC-UV-02** | 🟡 N/A | Natural receivable=10 — U65 no wipe; empty CTA not forced |
| **UF-REC-UV-03** | 🟢 | Chọn YCTD → pos=`Tổng Giám đốc` · `key=CEO` · `source=yctd` · readonly · freeTextSoT=**0** |
| **UF-REC-UV-04** | 🟢 | Lưu **disabled** when YCTD sentinel — no POST without YCTD (**AC-01**) |
| **UF-REC-UV-05** | 🔴 | POST **201** `HRM-REC-202` + body `requisition_id`+`position_key=CEO` OK — **but FE list row YCTD/position cells empty** (plan Fail: «2xx but list missing YCTD link») |
| **UF-REC-UV-05-F5** | 🔴 | After F5 stamp **not** in list UI · API GET by id **200** display-ready still present (**AC-02 FAIL**) |
| **UF-REC-UV-06** | 🟢 | No free-text position SoT control · derived readonly |
| **UF-REC-UV-07** | 🟢 | `?requisition_id=` preselect + position derived (**AC-04**) |
| **UF-REC-UV-08** | 🟢 | Picker from receivable requisitions · **0** `job_postings` write |
| **J-HRM-REC-UV-01** | 🔴 | Steps 1–7 OK; step 8–10 FAIL — list/F5 missing YCTD+position on FE |
| Process gate | 🟢 | pageErrors=0 · Uncaught=0 · DnD storm=0 · mojibake=0 |

### AC rollup

| AC | Verdict | Note |
|----|---------|------|
| **AC-REC-UV-01** | 🟢 | REQUIRED FE disable + API `HRM-REC-UV-YCTD-REQUIRED` 400 |
| **AC-REC-UV-02** | 🔴 | F5 / list UI does not show YCTD+position for Lane A create |
| **AC-REC-UV-03** | 🟢 | Position derived SELECT/read-only · no free-text SoT |
| **AC-REC-UV-04** | 🟢 | Context `?requisition_id=` prefill |

### Negatives (API corroborate — U65 no invent)

| Probe | Result |
|-------|--------|
| REQUIRED omit YCTD | **400** `HRM-REC-UV-YCTD-REQUIRED` |
| STATUS non-receivable (`pending_approval`) | **400** `HRM-REC-UV-YCTD-STATUS` |
| POSITION-MISMATCH | **400** `HRM-REC-UV-POSITION-MISMATCH` |

---

## 2. UF evidence blocks

### UF-REC-UV-01 — Mở form Thêm UV
- Persona / URL / click path: `ceo@xe.vn` · `/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=candidates` · `hdsd-candidate-create-btn`
- Network: GET `…/requisitions?…&receivable=true` → **200** · count=10
- FE: form dialog + YCTD SELECT required
- Console: clean
- Verdict: 🟢
- spec_ref: SRS REC-05a Diễn biến **#1** · F-REC-UV-YCTD-01

### UF-REC-UV-02 — Empty receivable
- Verdict: 🟡 N/A — receivable non-empty under U65 (no wipe)
- Residual soft: retest empty when natural 0 receivable

### UF-REC-UV-03 / UF-REC-UV-06 — Position derived · no free-text SoT
- Action: chọn `JD-QA-QAH1BVIR — YCTD JD-ref QA YCTDJD-HKZN8G · Tổng Giám đốc`
- FE: `hdsd-candidate-form-position` readonly · `data-position-key=CEO` · `data-position-source=yctd` · free-text SoT controls=0
- Verdict: 🟢 · **AC-REC-UV-03**

### UF-REC-UV-04 — Lưu thiếu YCTD
- Action: leave sentinel → submit **disabled** · zero create POST
- API corroborate: omit YCTD → **400** `HRM-REC-UV-YCTD-REQUIRED`
- Verdict: 🟢 · **AC-REC-UV-01**

### UF-REC-UV-05 — Lưu đủ (POST) — list FE FAIL
- Action: YCTD + họ tên `UV YCTD QA UVYCTD-HLMG9D` + email → **Lưu**
- Network: POST `/api/hrm/recruitment/candidates` → **201** `HRM-REC-202`
  - body: `requisition_id=a702a898-…` · `position_key=CEO` · **no** `job_posting_id`
  - response display-ready: `position_name=Tổng Giám đốc` · `yctd_title=YCTD JD-ref QA YCTDJD-HKZN8G`
- FE sau 2xx: toast path OK · **list cells `hdsd-candidate-list-yctd` / `hdsd-candidate-list-position` empty for new row**
- Verdict: 🔴 (POST OK ≠ UF PASS when list missing YCTD link — plan §5.1)
- id: `52442fa0-5565-40ad-97be-448c4df28684`

### UF-REC-UV-05-F5 + J-HRM-REC-UV-01 — AC-02
- F5 / reload candidates: stamp **not visible** in pool-based UI list
- API GET `…/candidates/{id}?company_id=main` → **200** · same `requisition_id` + `position_key=CEO` + `position_name` + `yctd_title` (**scope_parity API OK**)
- Pool probe: **0** row for same email · Spine list: **1** hit
- Root cause: FE `CandidatesTab` lists `listCandidatesPool` then `mergeYctdDisplayOntoPoolCandidates` (enrich only) — **does not union Lane A spine-only rows** created by POST `/candidates`. BE create inserts `recruitment_candidates` only (`must_keep` no write `public.candidates`).
- Verdict: 🔴 · **AC-REC-UV-02 FAIL** · tag `lane_a_list_gap`

### UF-REC-UV-07 — Context prefill AC-04
- URL: `?tab=candidates&requisition_id=a702a898-…`
- FE: dialog auto-open · YCTD preselected · position `Tổng Giám đốc` · `source=yctd`
- Verdict: 🟢

### UF-REC-UV-08 — FORBIDDEN job_postings SoT
- receivable GETs ≥1 · dualWrite hits=0 · create body no posting keys
- Verdict: 🟢

---

## 3. Root cause (P0)

| ID | Layer | Defect |
|----|-------|--------|
| **R-UV-YCTD-LANE-A-LIST-GAP** | **dev-fe** (primary) | After FR-05a create (POST `/candidates` → spine), Candidates list UI remains pool-SoT merge → new UV with YCTD **never appears** after save/F5 → AC-02 / J-HRM-REC-UV-01 FAIL |
| R-UV-YCTD-UF05-LIST-CELLS | same | Even if toast success, list YCTD/position columns not populated for spine-only create |

**Fix intent (for PM → FE):** Union spine `listRecruitmentCandidates` rows into table (or switch list SoT to Lane A for FR-05a) so POST 201 row shows `hdsd-candidate-list-yctd` + `hdsd-candidate-list-position` and survives F5. Do **not** invent nested write · do **not** dual-write `job_postings` · do **not** claim `recruitment_uat_ready`.

BE create contract + negatives (REQUIRED/STATUS/MISMATCH) and display-ready GET are **PASS** — do not regress.

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| Module recruitment UAT / product GO | **DENIED** |
| Seed used for evidence | **DENIED** (U65) |
| Narrow slice | Form/YCTD/position/API gates mostly 🟢 · **list+F5 🔴** |

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Browser U65 execute DONE. L0 PASS. UF-01/03/04/06/07/08 🟢 · negatives REQUIRED/STATUS/MISMATCH 🟢 · process clean. **UF-05 list cells + UF-05-F5 + AC-REC-UV-02 + J-HRM-REC-UV-01 🔴** — Lane A create 201 display-ready but FE CandidatesTab pool-only merge hides spine-only UV after F5. NOT recruitment_uat_ready. No seed. |
| **next_owner** | **pm** → dispatch **dev-fe** `PO-HRM-REC-UV-YCTD-FE-02` (list union spine) then **qa** retest QA-01 |
| **next_dispatch_prompt** | See §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md` |
| **ack_status** | **FAIL_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-FE-02
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-REC-UV-YCTD-QA-01 FAIL_TO_PM
change_mode: FIX
preserve_default: true
u65: zero-seed · cấm recruitment_uat_ready · cấm job_postings SoT

entry_criteria:
- docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md FAIL (R-UV-YCTD-LANE-A-LIST-GAP)
- BE-01 create POST /candidates + display-ready GET remain PASS — do not regress

read_first:
1. docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md §3 root cause
2. apps/web/hrm/src/components/recruitment/CandidatesTab.tsx fetchCandidates (pool + merge only)
3. apps/web/hrm/src/lib/candidateUvYctdUi.ts mergeYctdDisplayOntoPoolCandidates
4. SRS FR-UC-BP-REC-05a Thành công / AC-REC-UV-02

task:
- After Lane A POST /candidates success, FE list MUST show new UV with YCTD + position derived (testids hdsd-candidate-list-yctd / hdsd-candidate-list-position)
- F5 / re-nav retains YCTD+position (AC-02)
- Prefer: union spine-only rows into list SoT for Candidates tab OR equivalent without dual-write public.candidates forbidden by BE must_keep
- Keep YCTD SELECT + derived position + context prefill from FE-01
- Vitest for merge/union; no seed helpers

exit_criteria:
- READY_FOR_QA
- evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-fe-02.md
- next: PO-HRM-REC-UV-YCTD-QA-01 retest UF-05 + F5 + J-HRM-REC-UV-01

FORBIDDEN: seed · job_postings SoT · recruitment_uat_ready · silent Lane B as FR-05a PASS
```
