# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01` |
| **resume_chunk** | **K6.2e** |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `RECPLATQA2-MSIXNFE2` |
| **U65** | zero-seed · **browser-only** FE click path |
| **Honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · DENY module REC UAT / J-* / Phase1 · **cấm reopen** REC-QC-01 L1 |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (browser AC-PLT-REC-02..05 · 13/13) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| HRM FE proxy | `:8080/hr/` via portal `/hr/*` |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-rec-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-rec-qa-02/01..13-*.png` |

**spec_ref:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 **AC-PLT-REC-02..05** · FE-01 §3 click path · L1 baseline QA-01 / QC-01 GWC SEAL (API-only — **not reopened**)

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Settings** → tab **Giai đoạn REC** (`settings-tab-rec-pipeline-stages`) | 🟢 panel `settings-rec-pipeline-stages` |
| 2 | Nhập key `hr_custom_stage_07_msixnfe2` · nhãn · **Tạo giai đoạn** (`hdsd-rec-pipeline-stage-save`) | Network **PUT** `/api/hrm/recruitment/pipeline-stages` → **200** `HRM-REC-STG-200` id=`b7b309e4-…` |
| 3 | **F5** → tab lại → row `settings-rec-pipeline-stage-row-hr_custom_stage_07_msixnfe2` | 🟢 còn sau F5 |
| 4 | **Tuyển dụng** → **Ứng viên** → stage Select (Radix combobox; `data-testid` on Root not in DOM) | GET `/pipeline-stages/effective?company_id=main` **200** · `hasNewKey=true` |
| 5 | Picker chọn `hr_custom_stage_07_msixnfe2` | PATCH pool stage → **200** `HRM-REC-CP-200` · cand `1d291765-…` |
| 6 | Catalog>0 · route-rewrite stage lạ trên FE PATCH | **400** `HRM-REC-STAGE-UNKNOWN` (AC-PLT-REC-04) |
| 7 | Chọn hired-outcome `hired_qa_msiwiylu` → Hire dialog → gắn EMP | Dialog `rec-hire-employee-link-dialog-precision` · PATCH **200** emp=`0500220b-…` (F-REC-HIRE-01) |
| 8 | Settings → **Ngừng** (`hdsd-rec-pipeline-stage-retire-{key}`) | Retire **201** · active row gone |
| 9 | Picker / effective | effective **không** còn key · picker options miss |
| 10 | History UV | cand `1d291765-…` vẫn `stage=hr_custom_stage_07_msixnfe2` · FE text có key |
| 11 | must_keep | `jd-field-defs` **200** · `interviews-catalog` **200** · `requisitions` **200** · jobs/IV UI load |

**HDSD ids exercised:** `settings-tab-rec-pipeline-stages` · `settings-rec-pipeline-stages` · `settings-rec-pipeline-stages-table` · `hdsd-rec-pipeline-stage-key|name|save|reload|retire-*` · `hdsd-rec-pipeline-stage-hired-outcome` · stage Select on Candidates · `rec-hire-employee-link-dialog-precision`

**Seed:** none. **Flip `recruitment_uat_ready`:** none.

---

## 3. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-REC-02** | Settings Tạo giai đoạn → 2xx → F5 row → UV picker chọn mã mới | PUT **200** · F5 row · picker PATCH **200** · effective has key | 🟢 |
| **AC-PLT-REC-03** | Retire → picker ẩn · UV history giữ key | Retire **201** · effective hide · cand stage intact | 🟢 |
| **AC-PLT-REC-04** | Catalog>0 · `to_stage` ∉ catalog → 4xx UNKNOWN | FE PATCH rewritten → **400** `HRM-REC-STAGE-UNKNOWN` | 🟢 |
| **AC-PLT-REC-05** | Hired-outcome → Hire dialog → EMP soft-link | Dialog + PATCH **200** emp soft-link · stage=`hired_qa_msiwiylu` | 🟢 |
| NO-HARDCODE | Không FE hardcode chỉ 6 starter | effective sample includes `hr_custom_stage_07_*` | 🟢 |
| must_keep | JD / IV / YCTD load | all **200** | 🟢 |

**Out of scope / DENIED this seat:** J-* L2.5 · module REC UAT · `recruitment_uat_ready=true` · reopen REC-QC-01 L1 · Phase1 DONE.

---

## 4. Key network stamps

```text
PUT  /api/hrm/recruitment/pipeline-stages
     → 200 HRM-REC-STG-200 key=hr_custom_stage_07_msixnfe2 id=b7b309e4-…
GET  …/pipeline-stages?company_id=main&status=active → 200 (F5 row)
GET  …/pipeline-stages/effective?company_id=main → 200 total≥1 hasNewKey hiredOutcomeKey=hired_qa_msiwiylu
PATCH …/candidates-pool/:id/stage {stage:hr_custom_stage_07_msixnfe2} → 200 HRM-REC-CP-200
PATCH …/candidates-pool/:id/stage {stage:not_in_catalog_*} → 400 HRM-REC-STAGE-UNKNOWN
PATCH …/candidates-pool/:id/stage {stage:hired_qa_msiwiylu, employee_id} → 200 EMP soft-link
POST …/pipeline-stages/:id/retire?company_id=main → 201
GET  …/pipeline-stages/effective (after retire) → key absent
GET  …/candidates-pool/1d291765-… → stage=hr_custom_stage_07_msixnfe2 intact
GET  jd-field-defs · interviews-catalog · requisitions → 200 must_keep
```

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** — browser AC slice PASS ≠ module UAT |
| `payroll_e2e_ready` | **false** |
| Module REC UAT / J-* / Phase1 DONE | **DENIED** |
| Seed | **none** |
| REC-QC-01 L1 GWC | **SEAL retained** — not reopened |

---

## 6. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No browser blocker this stamp | — |

**OBS (process):**
1. Radix `Select` Root `data-testid="hdsd-rec-candidate-stage-picker"` **không** xuất hiện trên DOM — QA dùng `table [role="combobox"]` (FE-01 HDSD id still documented; locator note for QC).
2. AC-PLT-REC-04: Network **400** `HRM-REC-STAGE-UNKNOWN` proven via FE-initiated PATCH + body rewrite; destructive toast text not always captured in headless body scrape (`toast=false`) — code/HTTP PASS đủ AC; toast map đã unit-tested FE-01.
3. Candidates-pool probe: `page_size` → **400** `HRM-VAL-001` — list dùng `?company_id=main` only.

---

## 7. completion_report

**Closed:** K6.2e browser U65 AC-PLT-REC-02..05 PASS after FE-01. Settings Giai đoạn REC create open key `hr_custom_stage_07_msixnfe2` → PUT 200 → F5 row → Ứng viên picker selects new key from effective → UNKNOWN 400 on out-of-catalog stage → Hire dialog + EMP soft-link on `hired_qa_msiwiylu` → retire 201 hides from picker → historical cand `1d291765-…` keeps stage key · must_keep JD/IV/YCTD 200. Stamp `RECPLATQA2-MSIXNFE2`. **13/13** AC PASS. Zero-seed.

**Residual:** `recruitment_uat_ready=false` until program promotes module REC / J-* separately · DENY module UAT claim from this seat · OBS toast scrape + Select testid DOM.

**Forbidden claims:** REC module UAT-ready · Phase1 DONE · flip `recruitment_uat_ready=true` · reopen L1 QC-01.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02
priority: P2
resume_chunk: K6.2e

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-02.md
2. docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json
3. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md
4. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md (L1 GWC SEAL — do not reopen API-only)

## task
Narrow QC gate on browser AC-PLT-REC-02..05 after QA-02 stamp RECPLATQA2-MSIXNFE2.
- Audit click path Settings Giai đoạn REC → PUT 2xx → F5 → Ứng viên picker → UNKNOWN 400 → Hire EMP → retire hide → history key
- must_keep JD/IV/YCTD cited
- Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE · DENY module REC UAT / J-* / Phase1
- Cấm: reopen REC-QC-01 L1 · invent ready=true · seed

## exit
GO | GO WITH CONDITIONS | NO-GO · PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-02.md
```
