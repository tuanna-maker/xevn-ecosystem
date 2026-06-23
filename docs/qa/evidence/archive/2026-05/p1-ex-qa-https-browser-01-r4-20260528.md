# P1-EX-QA-HTTPS-BROWSER-01-R4 — Browser retest HTTPS pilot (JWT bridge + HRM embed)

| Field | Value |
|---|---|
| **work_item_id** | `P1-EX-QA-HTTPS-BROWSER-01-R4` |
| **from_role** | `pm` |
| **to_role** | `qa` |
| **date** | `2026-05-28` |
| **base_url** | `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **prior** | `docs/qa/evidence/p1-ex-qa-https-browser-01-r3-20260528.md` (**FAIL**) |
| **deploy evidence** | `docs/ops/evidence/p1-ex-do-deploy-portal-https-01-20260528.md` (**PASS**) |
| **fe evidence** | `docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md` (**READY_FOR_QA**) |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive verdict

**L2 tab load (P-CC-03..08):** iframe loads and shows **HRM API Sync CONNECTED** (no Sync ERROR).  
**However**:

1) **Requirement #2 FAIL** — iframe `/api/hrm/catalog-sync/status` returns **404** (`HRM-SYNC-002`) on all sampled HRM tabs (expected **200**).  
2) **Requirement #4 FAIL** — `J-HRM-02` (Employees list → Employee profile) **fails in UI**: profile page shows **“Không thể tải thông tin nhân viên”** even though detail API returns **200**.

`J-CC-03 409` is **out-of-scope** for this wave; on this run KPI rollup with Bearer token returned **200** (see “Out-of-scope note”).

---

## Environment / traceability

- **Browser session**: already logged in as `ceo@xe.vn` at start of run.
- **Portal route base**: `/command-center/hrm/*`
- **Screenshot**: `p1-ex-qa-https-browser-01-r4-employees.png` (local capture)

---

## Retest checklist results (requested)

### 1) HRM embed tabs `P-CC-03..08` load without Sync ERROR

All visited tabs show **HRM API Sync CONNECTED** (no “Sync ERROR”, no “Phiên đăng nhập không hợp lệ”).

### 2) iframe `/api/hrm/catalog-sync/status` = 200 (no 401)

**FAIL** — returns **404** with body snippet:

```json
{"success":false,"code":"HRM-SYNC-002","message":"Catalog 'status' not synced in HRM", ...}
```

Observed on:
- `P-CC-03 /command-center/hrm/employees`
- `P-CC-04 /command-center/hrm/contracts`
- `P-CC-05 /command-center/hrm/insurance`
- `P-CC-06 /command-center/hrm/recruitment`
- `P-CC-07 /command-center/hrm/attendance`
- `P-CC-08 /command-center/hrm/payroll`

### 3) iframe `src` includes `companyId=main`

**PASS** — sampled iframe `src` values:

```text
/hr/employees?portal=1&tenantId=xevn&companyId=main
/hr/contracts?portal=1&tenantId=xevn&companyId=main
/hr/insurance?portal=1&tenantId=xevn&companyId=main
/hr/recruitment?portal=1&tenantId=xevn&companyId=main
/hr/attendance?portal=1&tenantId=xevn&companyId=main
/hr/payroll?portal=1&tenantId=xevn&companyId=main
```

### 4) Browser `J-HRM-01..07` list→detail where rows exist

| J-ID | From | Preconditions (rows?) | Browser result | Notes |
|---|---|---:|---|---|
| **J-HRM-01** | Contracts | 0 rows | **N/A** | Contracts table shows “Không có dữ liệu” |
| **J-HRM-02** | Employees | rows exist | **FAIL** | Clicked employee row `NV0001` → profile shows **“Không thể tải thông tin nhân viên”** |
| **J-HRM-03** | Contracts | 0 rows | **N/A** | No contract rows to open detail/drawer |
| **J-HRM-04** | Insurance | 0 rows | **N/A** | Insurance table shows “Không có dữ liệu” |
| **J-HRM-05** | Recruitment | dashboard view | **PARTIAL** | Recruitment dashboard loads; no deterministic “list→detail” row executed in this run |
| **J-HRM-06** | Attendance | dashboard view | **PARTIAL** | Attendance dashboard loads; no deterministic “list→detail” row executed in this run |
| **J-HRM-07** | Payroll | guide view | **PARTIAL** | Payroll landing loads; no deterministic “list→detail” row executed in this run |

#### J-HRM-02 detail evidence (Employees)

- **Portal**: `GET /command-center/hrm/employees`
- **Iframe navigated to**: `/hr/employees/00000000-0000-4000-8000-000000000001`
- **API check (within iframe context)**:
  - `GET /api/hrm/employees/00000000-0000-4000-8000-000000000001?company_id=main` → **200** (`HRM-EMP-200`)
- **UI snippet (iframe body)**:

```text
Không thể tải thông tin nhân viên
Quay lại danh sách
```

### 5) Note `J-CC-03 409` separately (out-of-scope for JWT bridge)

**Out-of-scope note:** on this run, `GET /api/xbos/kpi-engine/rollup` with `Authorization: Bearer <portal token>` returned **200** (`XBOS-KPI-202`). No 409 observed.

---

## Root-cause signals (for PM triage)

- JWT/session bridge appears **partially effective** (tabs load, no 401/Sync ERROR), but:
  - `/api/hrm/catalog-sync/status` is **not 200** (404 `HRM-SYNC-002`), so the specific “catalog sync status” contract is still not meeting expectation.
  - Employees profile UI shows load failure despite `GET employee` returning 200, suggesting **UI-side parsing/rendering regression** or a **secondary API dependency** failing on the profile screen.

---

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-BROWSER-01-R4
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-browser-01-r4-20260528.md
entry_criteria: DevOps deploy PASS + FE JWT bridge READY
exit_criteria:
  - P-CC-03..08 load with Sync CONNECTED and no Sync ERROR
  - iframe /api/hrm/catalog-sync/status returns 200 (not 401/404)
  - iframe src includes companyId=main
  - J-HRM-01..07 list->detail PASS where data exists (no "Không thể tải" / 404)
summary: Tabs load and companyId=main PASS, but iframe catalog-sync/status returns 404 (expected 200) and J-HRM-02 employee profile UI fails ("Không thể tải thông tin nhân viên") while API detail is 200.
pm_dispatch_hint:
  - dev-be: confirm intended semantics for /api/hrm/catalog-sync/status (should it be 200 w/ empty vs 404?) and align contract
  - dev-fe: investigate employee profile screen dependency causing UI fail despite GET employee 200
residual_auto_fix: true
```

