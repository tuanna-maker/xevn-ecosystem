# CD-FB-07-FE-LEAVE-PICKER-QA — Leave create employee typeahead

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-FE-LEAVE-PICKER-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | QC GWC `C-CD-FB-07-01` · Dev `cd-fb-07-fe-leave-picker-20260719.md` |
| **executed_at** | `2026-07-19` |
| **environment** | Local L0 `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · role `group_ceo` |
| **U65** | **PASS** — zero-seed; no API fake state; no DB mutate |
| **J-*** | **J-HRM-06** (attendance leave surface) |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done / prod** | **NOT claimed** |

---

## Executive summary

Browser U65 confirms **C-CD-FB-07-01** leave create employee typeahead: open **Tạo yêu cầu nghỉ** → keyword `HLD-0006` → `GET /api/hrm/employees?...keyword=HLD-0006` **200** → Select shows **Huỳnh Văn An — HLD-0006** (beyond first capped page 50/1107). Soft-nav Att↔Rec spot **PASS** (SPA, `navigation` entries remain 1).

**Create mutate** after select: `POST /api/hrm/attendance/leave-requests` → **400** `HRM-VAL-001` (`company_id must be a UUID` when FE sends scope slug `main`). Treated as **residual outside picker condition** (exit: create FE after 2xx **if reachable**). **Not** reopen closed TEXT/`::uuid` workflow P0.

**Recommend QC close `C-CD-FB-07-01`.**

---

## L0

| Check | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** |
| web-portal `:5173` | HTTP **200** |

---

## Click path (U65 browser)

| # | Step | Evidence | Verdict |
|---|------|----------|---------|
| 1 | Login session `ceo@xe.vn` → Command Center | `:5173/command-center` BOD | PASS |
| 2 | Direct / portal HRM → Attendance → **Nghỉ phép** | URL `…/hr/attendance?portal=1&companyId=main` · tab active | PASS |
| 3 | **Tạo yêu cầu nghỉ** | Dialog; keyword Input placeholder `Tìm theo tên hoặc mã NV (VD: HLD-0006)...` | PASS |
| 4 | Empty keyword | Cap hint **Hiển thị 50/1107** on employee picker | PASS |
| 5 | Type `HLD-0006` (browser_type) | Input value `HLD-0006`; Network `GET …/api/hrm/employees?company_id=main&keyword=HLD-0006&…page=1&page_size=50` | PASS |
| 6 | Keyword API status | Same URL via portal token + shell probe → **200** `HRM-EMP-200` · `total=1` · `employee_code=HLD-0006` | PASS |
| 7 | Open employee Select | Option: `Huỳnh Văn An … — HLD-0006 · Kinh doanh` | PASS |
| 8 | Select employee | Combobox shows selected HLD-0006 | PASS |
| 9 | Fill dates 2026-07-28..29 + reason → **Gửi yêu cầu** | `POST /api/hrm/attendance/leave-requests` → **400** `HRM-VAL-001` (company_id UUID + required fields) | **N/A create** (not reachable 2xx under `main` slug) |
| 10 | Soft-nav must_keep | Portal HRM: Chấm công → Tuyển dụng → Chấm công; URL SPA change; `performance.getEntriesByType('navigation').length === 1` | PASS |

### Network excerpts (no secrets)

```
GET /api/hrm/employees?company_id=main&keyword=HLD-0006&include_archived=false&page=1&page_size=50 → 200
POST /api/hrm/attendance/leave-requests → 400
  code: HRM-VAL-001
  message: company_id must be a UUID; employee_code must be a string; …
```

Probe (same keyword, bearer from login): status **200**, row `HLD-0006` / company_id `holding`.

---

## AC vs C-CD-FB-07-01

| Expectation | Result |
|-------------|--------|
| Typeahead replaces Select-only first page | **PASS** — keyword Input + capped hint 50/1107 |
| Discover HLD-0006 beyond first page | **PASS** — option after keyword |
| GET employees keyword 200 | **PASS** |
| Soft-nav / F4 path not broken | **PASS** spot |
| Full FE create→list 2xx+F5 | **Not reached** — create 400 UUID scope (residual) |

---

## Residuals (not FAIL of this work_item)

| ID | Severity | Note | Owner hint |
|----|----------|------|------------|
| `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` | P2 | Leave create with Group CEO `companyId=main` slug fails validation (`company_id must be a UUID`). Picker path itself unblocked. | `dev-be` / `dev-fe` (map slug→UUID on create) |
| UX overflow | P3 | SelectItem label for HLD-0006 includes long UF03/QA suffixes → horizontal overflow bar | optional FE truncate |

**Cấm respected:** no seed · no Phase1/PROD claim · TEXT/`::uuid` workflow P0 **not reopened**.

---

## completion_report

### Closed
- Browser proof for **C-CD-FB-07-01**: leave create employee typeahead finds **HLD-0006** beyond first page; keyword GET **200**; soft-nav spot **PASS**.

### Open
- Leave create POST **400** under `main` slug (residual above) — out of picker GWC condition; create 2xx **if reachable** = not reachable this persona/scope.

### next_owner
`qc` (narrow close `C-CD-FB-07-01`) then `pm`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-FE-LEAVE-PICKER-QC
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA PASS_TO_PM docs/qa/evidence/cd-fb-07-fe-leave-picker-qa-20260719.md — C-CD-FB-07-01 typeahead HLD-0006 + keyword 200 + soft-nav PASS
exit_criteria: Audit evidence; close C-CD-FB-07-01 or NO-GO with reason; do not reopen TEXT/uuid P0; note residual R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID (create 400 under main slug) as separate condition if needed; evidence docs/qa/evidence/cd-fb-07-fe-leave-picker-qc-YYYYMMDD.md
cấm: seed · Phase1/PROD · reopen TEXT/uuid without new FAIL
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/cd-fb-07-fe-leave-picker-qa-20260719.md`
