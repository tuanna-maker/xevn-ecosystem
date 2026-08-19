# API_DESIGN — HRM Payroll (periods + payslips list/get)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-PAYROLL-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.6 FR-HRM-PR-05** Diễn biến #1–#8 · **§3.15 FR-HRM-PR-01** · **§3.16 FR-HRM-PR-03** · **§3.17 FR-HRM-PR-04** · **§3.35 FR-HRM-INT-03** · team **UC-HRM-24** / **UC-HRM-28** / **UC-HRM-31** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.6** · **§16.1** rows 15–17 |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` · soft emp `DB_DESIGN_HRM_EMPLOYEES.md` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/payroll/periods*` · `/payroll/payslips*` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev claim on Payroll |
| **Date** | 2026-07-27 |
| **Runtime** | `PayrollController` · `PayrollService` · `resolveHrmListScope` · `normalizePayrollListCompanyId` |

> **must_keep:** TEXT slug scope · soft `employee_id` · empty `HRM-PAY-200` trung thực · NFR money grouping = FE (vi-VN) · U65 no seed.  
> **Cấm:** filter/persist LE UUID; PASS QA bằng seed phiếu; đụng employees/CI/leave/recruitment SoT.

Prefix: `/api/hrm/payroll`

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| 1 | `GET /periods` | `HRM-PAY-200` | UC-HRM-31 · PR-01 #7/#8 |
| 2 | `POST /periods` | `HRM-PAY-201` | FR-HRM-PR-01 #7 |
| 3 | `GET /payslips` | `HRM-PAY-200` | **FR-HRM-PR-05** #4/#5 · UC-HRM-24 |
| 4 | `GET /payslips/{payslipId}` | `HRM-PAY-200` | FR-HRM-PR-05 #7 · **target** (non-blocking if list đủ) |

Related upstream (F.1 brief — unlock PR-05 data):

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| 5 | `POST /periods/{periodId}/process` | `HRM-PAY-202` | FR-HRM-PR-03 · G-PR-03 |
| 6 | `POST /periods/{periodId}/close` | `HRM-PAY-203` | FR-HRM-PR-04 |

Out of scope this pack (annex): salary-templates · advance-requests · payment-records · catalog components.

---

## E2 APPEND — salary-components + mock-clean (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E2-DB-API-01` |
| **Slice SoT** | **`docs/hrm/API_DESIGN_HRM_ERP_E2.md`** (F.1 `salary-components*` · period Zod reinforce · insurance participants wire · tax **hide**) |
| **DB sibling** | `docs/hrm/DB_DESIGN_HRM_ERP_E2.md` |
| **change_mode** | ADD pointer — periods/payslips F.1 above remain SoT |

---

## 1. Endpoint — List payroll periods

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/payroll/periods` |
| Query | `company_id` (`main` \| slug), optional `status` |
| Headers | `x-tenant-id`, `x-company-id` |
| Auth | Bearer / internal API key |
| Success | `200` · **`HRM-PAY-200`** · `{ total, data[] }` |
| Runtime | `listPayrollPeriods` · `resolveHrmListScope` |

### Mục đích

Cấp **danh sách kỳ lương** trong phạm vi JWT / đơn vị để:

1. App **UC-HRM-31** / embed picker chọn kỳ trước khi xem phiếu (PR-05 #2).
2. Sau **Tạo kỳ** / **F5** xác nhận dòng kỳ còn (PR-01 #7/#8).
3. Lọc trạng thái `draft` / `processed` / `closed` cho vận hành tính / chốt.

### Nghiệp vụ xử lý

1. Auth — thiếu → `HRM-AUTH-001`.
2. `normalizePayrollListCompanyId` + **`resolveHrmListScope`** — same family as payslips / process / close.
3. `company_id=main` → rollup five operating slugs; single slug → that slug; pilot UUID merge → slug; **never** treat LE UUID as workforce key.
4. Optional filter `status`.
5. Empty = **honest empty** (not error).
6. ORDER BY `start_date DESC`.
7. Does **not** invent payslip rows.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / sequence | API role |
|---|---------|----------------------|----------|
| 1 | **FR-HRM-PR-01** | **#7** Thành công — kỳ trên danh sách | Read-back after create |
| 2 | **FR-HRM-PR-01** | **#8** Tải lại — kỳ vẫn còn | **This endpoint** + F5 |
| 3 | **FR-HRM-PR-05** | **#2** Chọn kỳ lương | Upstream picker data |
| 4 | **UC-HRM-31** | List kỳ theo scope | **This endpoint** |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id=main` \| slug | `resolveHrmListScope` → `company_id = ANY(slugs)` |
| `status` | `payroll_periods.status` |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id` | PK | Kỳ khóa mang → process/close/payslips filter |
| `company_id` | TEXT slug | Scope display |
| `period_label` | Column | Tên kỳ |
| `start_date` / `end_date` | DATE | `dd/MM/yyyy` |
| `status` | Column | Badge nháp / đã tính / đã chốt |
| `processed_at` / `closed_at` | TIMESTAMPTZ | Audit |
| timestamps | Columns | List sort |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope mismatch | scope / 409 | 409 |
| Empty | `HRM-PAY-200` + `data=[]` | 200 |

### FE after 2xx (U65)

Bảng/picker kỳ cập nhật · empty trung thực · F5 giữ · không mock kỳ.

---

## 2. Endpoint — Create payroll period

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/payroll/periods` |
| Body | `CreatePayrollPeriodDto` |
| Success | `201` · **`HRM-PAY-201`** |
| Runtime | `createPayrollPeriod` |

### Mục đích

**Tạo kỳ lương** (nháp) trong đơn vị được cấp để mở khóa tính lương (PR-03) và sau đó xem phiếu (PR-05) — **không** tạo phiếu / bịa số tiền lúc tạo.

### Nghiệp vụ xử lý

1. Auth + scope on `body.company_id`.
2. Validate `start_date <= end_date` → else **`HRM-PAY-001`**.
3. Overlap `daterange` same `company_id` → **`HRM-PAY-002`** (409).
4. INSERT `status='draft'`; persist TEXT slug.
5. Return period envelope; **zero** payslip side-effect.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PR-01** | **#3** Thiếu tên/ngày | 400 validation |
| 2 | **FR-HRM-PR-01** | **#4** Ngày sai thứ tự | `HRM-PAY-001` |
| 3 | **FR-HRM-PR-01** | **#5** Chồng kỳ | `HRM-PAY-002` |
| 4 | **FR-HRM-PR-01** | **#6** Ngoài phạm vi | 401/409 |
| 5 | **FR-HRM-PR-01** | **#7** Lưu thành công | **This endpoint** → `HRM-PAY-201` |
| 6 | **FR-HRM-PR-01** | **#8** F5 | GET periods |

### Request ↔ DB

| Body | Column |
|------|--------|
| `company_id` | TEXT slug |
| `period_label` | `period_label` |
| `start_date` / `end_date` | DATE |
| `created_by?` | `created_by` |

### Response DTO ↔ DB

Same shape as list period row (`mapPeriod`).

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Date order | `HRM-PAY-001` | 400 |
| Overlap | `HRM-PAY-002` | 409 |

### FE after 2xx (U65)

Row kỳ xuất hiện · F5 còn · status `draft` · không hiện số lương giả.

---

## 3. Endpoint — List payslips (FR-PR-05 primary)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/payroll/payslips` |
| Query | `company_id` (required), optional `period_id`, `employee_id`, `page`, `page_size` |
| DTO | `ListPayrollPayslipsQueryDto` |
| Success | `200` · **`HRM-PAY-200`** · `{ total, page?, page_size?, data[] }` |
| Runtime | `listPayslips` · workforce / company scope filters |

### Mục đích

Cấp **danh sách phiếu lương** đúng người / đúng kỳ trong phạm vi để:

1. Embed **UC-HRM-24** / App lương — màn Phiếu lương (FR-PR-05).
2. Sau process (PR-03) xác nhận phiếu sẵn xem.
3. Empty trung thực khi kỳ chưa có phiếu (Quy tắc-9: không bịa số).

### Nghiệp vụ xử lý

1. Auth — Diễn biến #1.
2. Scope via `resolveHrmListScope` (+ `pushWorkforceEmployeeScopeFilter` when tenant partition) — Diễn biến #6 cấm xem hộ.
3. JOIN `payroll_periods` for `period_label`.
4. Filter optional `period_id` / `employee_id`.
5. Empty page = **200 + data[]** — Diễn biến #5 (không 5xx giả).
6. Money fields numeric; FE formats thousand grouping (NFR-HRM-05 / vi-VN).
7. Does **not** require `GET :id` when row fields đủ list/detail panel.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / sequence | API role |
|---|---------|----------------------|----------|
| 1 | **FR-HRM-PR-05** | **#1** Auth / ngoài phạm vi | 401 / empty-or-404 path |
| 2 | **FR-HRM-PR-05** | **#2** Chọn kỳ | Query `period_id` (+ GET periods) |
| 3 | **FR-HRM-PR-05** | **#3** Kỳ không xem được | Empty hoặc reject period invalid |
| 4 | **FR-HRM-PR-05** | **#4** Tải phiếu | **This endpoint** |
| 5 | **FR-HRM-PR-05** | **#5** Empty hợp lệ | `data=[]` |
| 6 | **FR-HRM-PR-05** | **#6** Vượt phạm vi | Scope filter / 409 |
| 7 | **FR-HRM-PR-05** | **#8** Thành công cuối | List paint |
| 8 | **FR-HRM-INT-03** | Phiếu gắn `employee_id` + kỳ cùng đơn vị | Soft emp + hard period JOIN |
| 9 | **UC-HRM-24** | Embed lương GET payslips | **This endpoint** |
| 10 | **FR-HRM-PR-03** | **#8** Xem phiếu sau tính | Read-back after process |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id` | Scope → `p.company_id` / workforce emp filter |
| `period_id` | `p.period_id` |
| `employee_id` | `p.employee_id` |
| page / page_size | OFFSET slice |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id` | PK | Row key / deep link |
| `company_id` | TEXT slug | Scope |
| `period_id` / `period_label` | FK + JOIN | Kỳ |
| `employee_id` / `employee_code` / `employee_name` | Soft + snapshot | Cột NV |
| `gross_amount` / `deduction_amount` / `net_amount` | NUMERIC | Nhóm nghìn FE |
| `currency` | Default VND | Label |
| `status` | Payslip status | Badge |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope mismatch | `HRM-PAY-409` / scope | 409 |
| Empty | `HRM-PAY-200` + `data=[]` | 200 |

### FE after 2xx (U65)

Bảng phiếu cập nhật · empty «chưa có phiếu» · F5 giữ · **không** mock số · money format vi-VN.

---

## 4. Endpoint — Get payslip by id (target / non-blocking)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/payroll/payslips/{payslipId}` |
| Query | `company_id` |
| Success | **`HRM-PAY-200`** |
| Runtime status | **Absent today** (TechSpec §14.6: non-blocking if list+row đủ) — **target contract** for deep link / Diễn biến #7 |

### Mục đích

Cấp **chi tiết một phiếu** trong phạm vi để màn detail / deep link từ hồ sơ (INT-03) — **không** trả phiếu ngoài JWT scope.

### Nghiệp vụ xử lý

1. Auth + **same** `resolveHrmListScope` family as list (scope parity).
2. Load by `p.id` **and** company slug set (+ workforce emp visibility).
3. JOIN period for label; missing / out of scope → **`HRM-PAY-404`**.
4. Do not broaden beyond list rollup.
5. Until implemented: FE may use list row as detail — **must not** invent amounts client-side.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PR-05** | **#7** Xem chi tiết một phiếu | **This endpoint** (target) |
| 2 | **FR-HRM-PR-05** | **#6** Vượt phạm vi | 404/409 |
| 3 | **FR-HRM-INT-03** | Mở phiếu từ hồ sơ + kỳ | Get by id + `employee_id` match |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `payslipId` | `payroll_payslips.id` |
| `company_id` | Scope ladder (not LE UUID) |

### Response DTO ↔ DB

Same wire as list item (+ optional future line components annex).

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found / OOS | `HRM-PAY-404` | 404 |
| Scope mismatch | `HRM-PAY-409` | 409 |

### FE after 2xx

Detail số liệu kỳ · nhóm nghìn · «—» khi null · F5 còn.

---

## 5. Endpoint — Process period (upstream PR-03)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/payroll/periods/{periodId}/process` |
| Success | **`HRM-PAY-202`** |
| Runtime | `processPayrollPeriod` |

### Mục đích

Chuyển kỳ **draft → processed** và (theo SRS) **ghi/cập nhật phiếu** kỳ để PR-05 xem được — unlock chốt kỳ (PR-04).

### Nghiệp vụ xử lý

1. Auth + load period in scope (`HRM-PAY-404` / `409`).
2. Guard status = `draft` else **`HRM-PAY-003`**.
3. Set `status='processed'`, `processed_at=NOW()`.
4. **Contract (SRS / G-PR-03):** emit or upsert `payroll_payslips` for in-scope employees from attendance/comp sources; idempotent re-run policy documented by Dev evidence.
5. Residual: if runtime only flips status without slips → **G-PR-03 OPEN** — not U71 invent formula.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PR-03** | **#2–#4** Chọn kỳ / đã chốt / ngoài phạm vi | Guards |
| 2 | **FR-HRM-PR-03** | **#5–#7** Thiếu nguồn / chạy tính / lỗi dòng | Process body |
| 3 | **FR-HRM-PR-03** | **#6** Ghi phiếu | upsert `payroll_payslips` |
| 4 | **FR-HRM-PR-03** | **#8** Xem phiếu sau tính | → GET payslips |
| 5 | **FR-HRM-PR-03** | **#9** Thành công | `HRM-PAY-202` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not draft | `HRM-PAY-003` | 409 |
| Not found / OOS | `HRM-PAY-404` / `409` | 404/409 |

### FE after 2xx

Toast/tóm tắt · list kỳ `processed` · GET payslips có data hoặc honest empty nếu không có NV in-scope.

---

## 6. Endpoint — Close period (upstream PR-04)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/payroll/periods/{periodId}/close` |
| Success | **`HRM-PAY-203`** |
| Runtime | `closePayrollPeriod` |

### Mục đích

**Chốt kỳ** đã tính — khóa tính lại / sửa phiếu thường; vẫn cho xem phiếu theo quyền (PR-05).

### Nghiệp vụ xử lý

1. Auth + period in scope.
2. Guard status = `processed` else **`HRM-PAY-004`**.
3. Set `status='closed'`, `closed_at=NOW()`.
4. Payslips remain readable via GET payslips.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PR-04** | Chốt kỳ đã xử lý | **This endpoint** |
| 2 | **FR-HRM-PR-04** | Sau chốt vẫn xem phiếu | GET payslips vẫn 200 |
| 3 | **FR-HRM-PR-03** | #3 Kỳ đã chốt → từ chối tính lại | Process returns `HRM-PAY-003` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not processed | `HRM-PAY-004` | 409 |
| Not found / OOS | `HRM-PAY-404` / `409` | 404/409 |

### FE after 2xx

Badge «đã chốt» · F5 giữ · nút tính lại disabled.

---

## 7. Scope parity (mandatory)

| Operation | Resolver |
|-----------|----------|
| List periods | `resolveHrmListScope` |
| Create period | Persist slug via body + scope assert |
| Process / close | `queryPeriodInScope` + `assertResourceInHrmScope` |
| List payslips | Same ladder + workforce emp filter |
| Get payslip (target) | **Must** reuse list scope family |

**FAIL** if get-by-id broader than list rollup.

---

## 8. Error taxonomy (shared)

| Code | Meaning |
|------|---------|
| `HRM-AUTH-001` | Unauthorized |
| `HRM-PAY-200` | List OK (incl. empty) |
| `HRM-PAY-201` | Period created |
| `HRM-PAY-202` | Period processed |
| `HRM-PAY-203` | Period closed |
| `HRM-PAY-001` | Date range invalid |
| `HRM-PAY-002` | Period overlap |
| `HRM-PAY-003` | Process guard (not draft) |
| `HRM-PAY-004` | Close guard (not processed) |
| `HRM-PAY-404` | Period/payslip not found in scope |
| `HRM-PAY-409` | Scope mismatch |

---

## 9. must_keep / non-goals

| Keep | Non-goal this pack |
|------|---------------------|
| PR-05 empty trung thực | Advance requests / salary templates F.1 |
| Soft emp + hard period | Hard FK to employees |
| Employees/CI/Leave/Recruitment pairs | Wipe those designs |
| G-PR-03 documented | Invent payroll formula in SA docs |

---

## CNTT APPEND — policy pack + input profile (2026-08-11)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-01` |
| **Parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **Slice SoT** | **`docs/program/specs/PO-HRM-PAY-CNTT-API-01.md`** (normative F.1 for L4–L6) |
| **DB sibling** | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` CNTT APPEND |
| **prior CONFIRMED** | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` · `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` — **cite only** |
| **change_mode** | ADD F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SETUP-RESOLVE-01 · EXPAND TPL/PERIOD/INPUT/PROCESS |
| **Honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** |

### Endpoint map (ADD)

| F-id | Method / path | SRS hook |
|------|---------------|----------|
| **F-PAY-POLICY-PACK-LIST-01** | `GET /api/hrm/payroll/pay-policy-packs` · `GET …/:id` | UC-BP-PAY-STP-01/02 |
| **F-PAY-POLICY-PACK-UPSERT-01** | `POST /api/hrm/payroll/pay-policy-packs` · `PATCH …/:id` | UC-BP-PAY-STP-01..06 |
| **F-PAY-POLICY-PACK-ARCHIVE-01** | `POST …/pay-policy-packs/:id/archive` | soft-delete |
| **F-PAY-INPUT-PROFILE-LIST-01** | `GET /api/hrm/payroll/pay-input-pack-profiles` · `GET …/:id` | UC-BP-PAY-STP-12 |
| **F-PAY-INPUT-PROFILE-UPSERT-01** | `POST /api/hrm/payroll/pay-input-pack-profiles` · `PATCH …/:id` | UC-BP-PAY-STP-12 · F-STP-04 |
| **F-PAY-INPUT-PROFILE-ARCHIVE-01** | `POST …/pay-input-pack-profiles/:id/archive` | soft-delete |
| **F-PAY-SETUP-RESOLVE-01** | `GET /api/hrm/payroll/pay-setup/resolve` | AC-CNTT-SETUP-* |

### EXPAND (append rows to existing F.1 — full text in slice SoT)

| F-id | Expansion |
|------|-----------|
| **F-PAY-SHEET-TPL-LIST/UPSERT-01** | `business_line_tag` · `policy_pack_id` · `input_pack_profile_id` |
| **F-PAY-PERIOD-01** | `sheet_template_snapshot_json.setupContext` policy/profile version |
| **F-PAY-PERIOD-INPUT-01** | `source_kind` ∉ profile → **`HRM-PAY-INP-PROFILE-422`** |
| **F-PAY-PROCESS-01** | policy `rate_params_json` read-only context GĐ1 — **no** eval |

**Evidence:** `docs/qa/evidence/po-hrm-pay-cntt-api-01.md`

---

## CNTT APPEND — fragment bind API EXPAND (2026-08-11)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02` |
| **Parent** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` · `ADR-HRM-PAY-FRAGMENT-BIND-01` |
| **Slice SoT** | **`docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` §12** (normative F.1 EXPAND) |
| **DB sibling** | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.7–§8.8 |
| **prior CONFIRMED** | API-01 §0–§11 · TPL-API-01 `F-PAY-SHEET-TPL-LINES-01` — **cite only** |
| **change_mode** | EXPAND fragment fields · **no** REWRITE |
| **Honesty** | `payroll_e2e_ready=false` · resolver trace only · eval **HOLD** |

### EXPAND map (append to existing F.1)

| F-id | Expansion | Key ADD |
|------|-----------|---------|
| **F-PAY-SHEET-TPL-LINES-01** | line DTO + publish validation | `fragmentId`, `fragmentBindMode` → `pay_sheet_template_lines` |
| **F-PAY-POLICY-PACK-UPSERT-01** | `policyDocRefs[].fragmentIds[]` validation | ⊆ catalog → else **`HRM-PAY-FRG-404`** / **`HRM-PAY-FRG-409`** |
| **F-PAY-SETUP-RESOLVE-01** | period preview resolver | `resolvedFragments[]` · query `pay_period_start`/`pay_period_end` |
| **F-PAY-PERIOD-01** | dual-template bind Option A | `secondaryTemplateIds[]` · snapshot `secondaryTemplates[]` · `mergeRule` |

### Error codes ADD

| Code | SRS hook |
|------|----------|
| **`HRM-PAY-FRG-404`** | UC-BP-PAY-STP-08 · STP-02 |
| **`HRM-PAY-FRG-412`** | UC-BP-PAY-STP-03 · BR-PAY-STP-02 |
| **`HRM-PAY-FRG-409`** | UC-BP-PAY-STP-02 · STP-01 CHUNG/RIÊNG |

**Evidence:** `docs/qa/evidence/po-hrm-pay-cntt-api-fragment-map-02.md`
