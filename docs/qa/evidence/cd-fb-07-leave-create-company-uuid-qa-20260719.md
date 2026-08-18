# CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QA — Leave create UUID company_id

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | Dev READY `cd-fb-07-leave-create-company-uuid-20260719.md` · residual `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` · QC close target `C-CD-FB-07-06` |
| **executed_at** | `2026-07-19` |
| **environment** | Local L0 `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` · portal scope `companyId=main` · role `group_ceo` |
| **U65** | **PASS** — zero-seed mutate; no API fake; no DB write outside FE |
| **J-*** | **J-HRM-06** (attendance → leave create / list) |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done / prod** | **NOT claimed** |

---

## Executive summary

Browser U65 under Group CEO `companyId=main`: create leave for **HLD-0006** → `POST /api/hrm/attendance/leave-requests` **201** with body/response `company_id` = UUID `10000000-0000-4000-8000-000000000001` (**not** slug `main`). FE counters 85→86 / pending 27→28; list row first; F5 persist **PASS**. Typeahead HLD-0006 still works (**C-01 must_keep**). Soft-nav Att↔Rec SPA spot **PASS** (`navigation.length===1`, iframe path `/hr/recruitment`).

**Recommend QC close `C-CD-FB-07-06`.**

---

## L0

| Check | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |

---

## Click path (U65 browser · J-HRM-06)

| # | Step | Evidence | Verdict |
|---|------|----------|---------|
| 1 | Session `ceo@xe.vn` → HRM Attendance embed / direct | URL `…/hr/attendance?portal=1&tenantId=xevn&companyId=main` · JWT chip `companyId=main` | PASS |
| 2 | Tab **Nghỉ phép** | Heading Quản lý nghỉ phép · baseline Tổng **85** / Chờ duyệt **27** | PASS |
| 3 | **Tạo yêu cầu nghỉ** | Dialog; keyword placeholder `Tìm theo tên hoặc mã NV (VD: HLD-0006)...` | PASS |
| 4 | Type keyword `HLD-0006` → open Select | Option **Huỳnh Văn An … — HLD-0006 · Kinh doanh** (beyond first page) | PASS (C-01 must_keep) |
| 5 | Select employee · leave type annual · dates `2026-08-10`..`2026-08-11` · reason QA marker | Form filled | PASS |
| 6 | **Gửi yêu cầu** | `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` | PASS |
| 7 | Request body `company_id` | `"10000000-0000-4000-8000-000000000001"` — UUID, **not** `main` | PASS |
| 8 | Response data | `id=258bb0ff-…` · `employee_code=HLD-0006` · `status=pending` · same UUID `company_id` | PASS |
| 9 | FE after 2xx | Dialog closed · Tổng **86** · Chờ duyệt **28** · list first row HLD-0006 Aug 10–11 + QA reason | PASS |
| 10 | F5 / hard navigate reload | Totals remain **86** / **28** · Danh sách first row still HLD-0006 Aug dates | PASS |
| 11 | Soft-nav must_keep | Portal `…/hrm/attendance` → `…/hrm/recruitment` → `…/hrm/attendance`; `performance.getEntriesByType('navigation').length === 1`; iframe `location.pathname=/hr/recruitment` on Rec stop | PASS |

### Network excerpts (no secrets)

```
POST /api/hrm/attendance/leave-requests → 201
  body.company_id: "10000000-0000-4000-8000-000000000001"
  body.employee_code: "HLD-0006"
  body.start_date: "2026-08-10"
  body.end_date: "2026-08-11"
  response.code: HRM-LEAVE-201
  response.data.company_id: "10000000-0000-4000-8000-000000000001"
  response.data.id: "258bb0ff-3351-468f-ab88-a7a38fbb2bb9"
```

---

## AC vs exit criteria

| Expectation | Result |
|-------------|--------|
| POST leave-requests **2xx** with UUID `company_id` (not `main`) | **PASS** — 201 + holding UUID |
| FE list update after 2xx | **PASS** — 85→86, pending 27→28, row visible |
| F5 persist | **PASS** |
| Typeahead still finds HLD-0006 (C-01) | **PASS** |
| Soft-nav Att↔Rec spot | **PASS** |
| No seed / no Phase1-PROD / no TEXT::uuid reopen / no picker regress | **PASS** |

---

## Residuals

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| — | — | None for this residual. Member-slug companies outside FE map (e.g. `xe-du-lich`) remain out-of-scope per Dev handoff. | — |
| UX overflow | P3 | SelectItem label for HLD-0006 still has long UF03/QA suffixes (known from picker QA) | optional FE |

**Cấm respected:** no seed · no Phase1/PROD claim · TEXT/`::uuid` workflow P0 **not reopened** · picker not regressed.

---

## completion_report

### Closed
- Browser proof: leave create under `main` scope sends UUID `company_id` → **201**; FE + F5; J-HRM-06 create/list path; typeahead + soft-nav must_keep.

### Open
- None blocking this residual. Recommend QC close **C-CD-FB-07-06**.

### next_owner
`qc`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QC
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qa-20260719.md — POST leave-requests 201 with UUID company_id (not main); FE list+F5; typeahead HLD-0006 + soft-nav Att↔Rec PASS; J-HRM-06
exit_criteria: Audit evidence; close C-CD-FB-07-06 or NO-GO with reason; do not reopen TEXT/uuid workflow P0; do not reopen C-CD-FB-07-01 picker; evidence docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qc-YYYYMMDD.md
cấm: seed · Phase1/PROD · reopen TEXT/uuid without new FAIL · regress picker
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qa-20260719.md`
