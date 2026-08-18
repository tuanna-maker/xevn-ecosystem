# QA — PO-HRM-JOB-GRADES-CONSUMER-REC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **ack_status** | **`PASS_TO_PM`** |
| **spec_ref** | `BA-HRM-JOB-GRADES-CONSUMER-REC-01` · **AC-SET-CONSUMER-JG-REC-01** |
| **persona** | `ceo@xe.vn` / `company_id=main` · portal `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **stamp** | **`JGRECQA-MSNP1AX8`** |
| **u65** | zero-seed · Settings catalog prep via prior FE sync/create (EFF=1 `gqanow4ip`) — **no** `pnpm seed:*` |
| **honesty** | `settings_catalog_e2e_ready=false` · **≠** UF-HRM-10 full · **must_keep** `RECCHQC1` |

## L0 / automation

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` | **exit 0** (portal restarted `dev:web-only` mid-session when :5173 briefly down) |
| `vitest` `po-hrm-job-grades-consumer-rec-fe-01.test.ts` | **4/4** |
| `jest` `po-hrm-job-grades-consumer-rec-be-01.spec.ts` | **3/3** |

## UF narrow — AC-SET-CONSUMER-JG-REC-01

### UF slice (≠ UF-HRM-10)

- **Click path:** Command Center embed → **Tuyển dụng** → tab **Yêu cầu tuyển** → **Tạo** → `hdsd-requisition-job-grade` (Ngạch/bậc) → **Lưu**
- **HDSD:** `hdsd-requisition-job-grade` · list `yctd-grade-label-{id}` · detail `yctd-detail-job-grade`

### Trước mutate

- `job_grades` EFF=1 (`gqanow4ip` / label «QA Ngạch JGRECQA-MSNOW4IP») từ `GET settings-catalogs?company_id=main` · `effectiveItems`

### Action + Network

- Chọn ngạch `gqanow4ip` trong picker → **Lưu**
- **POST** `/api/hrm/recruitment/requisitions` → **201**
- Body (excerpt): `job_grade_key: "gqanow4ip"` (khớp catalog code)

### FE sau 2xx

- Toast nháp YCTD · dialog đóng · row mới `YCTD JG QA JGRECQA-MSNP1AX8`
- **F5:** cột ngạch `yctd-grade-label-03b487cf-56df-4c12-8c7c-5f8a38a47cf9` hiển thị label resolved
- **Chi tiết:** `yctd-detail-job-grade` = «QA Ngạch JGRECQA-MSNOW4IP»

### Verdict

| AC | Verdict |
|----|---------|
| JOB-GRADES-EFF | 🟢 EFF>0 |
| AC-SET-CONSUMER-JG-REC-01 CREATE (POST+body) | 🟢 |
| AC-SET-CONSUMER-JG-REC-01 F5 list+detail label | 🟢 |
| AC-SET-CONSUMER-JG-REC-01 EDIT (PATCH) | 🟡 **carry** — chỉ 1 code trong catalog; PATCH leg chưa retest khi EFF≥2 |

## Regression (optional — not run this session)

- REC channels / dept consumer: không retest (time-box); sealed `RECCHQC1` untouched.

## Artifacts

- Runtime JSON: `docs/qa/evidence/_tmp-qa-po-hrm-job-grades-consumer-rec-01.json`
- Screens: `docs/qa/evidence/screens/qa-po-hrm-job-grades-consumer-rec-01/`
- Harness: `scripts/qa/_tmp-qa-po-hrm-job-grades-consumer-rec-01.mjs`

## completion_report

**Closed:** Narrow **AC-SET-CONSUMER-JG-REC-01** — YCTD create binds `job_grade_key` catalog code, POST 201, F5 list + detail label via `resolveJobGradeLabel`; L0 + vitest + jest PASS.

**Open / carry:** PATCH edit khi catalog có ≥2 `job_grades`; optional regression REC-CH / dept pickers.

## next_owner

`pm` → narrow **QC** gate (consumer matrix leg) or dispatch **ba-process** matrix NEXT (`pay_types`) per program queue.

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-JOB-GRADES-CONSUMER-REC-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-job-grades-consumer-rec-01.md
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
entry_criteria: QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01 PASS_TO_PM; must_keep RECCHQC1; settings_catalog_e2e_ready=false
exit_criteria: Audit AC-SET-CONSUMER-JG-REC-01 evidence (U65 browser POST job_grade_key + F5 label); GWC if EDIT PATCH carry; ≠ UF-HRM-10 full GO
evidence_path: docs/qa/evidence/qc-po-hrm-job-grades-consumer-rec-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
