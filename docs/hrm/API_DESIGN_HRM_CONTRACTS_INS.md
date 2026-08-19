# API_DESIGN — HRM Contracts + Insurance (list / get / create / update + insurance)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` |
| **change_mode** | ADD |
| **ref_srs** | khách `SRS_HRM_KHACH.md` **§3.2 FR-HRM-CI-01** Diễn biến #1–#9 · **§3.3 FR-HRM-CI-02** Diễn biến #1–#9 · team **UC-HRM-25** · **FR-HRM-INT-02** · display `SRS_FIELD_DISPLAY.md` F-04/F-05/U-03 (**FE only**) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§14.2** · **§14.3** |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` · employee soft FK `DB_DESIGN_HRM_EMPLOYEES.md` |
| **OpenAPI** | `docs/api/openapi/hrm-api.yaml` → `/contracts-insurance/contracts*`, `/contracts-insurance/insurance*` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71** | Physical API slice before Dev claim on Contracts / Insurance |
| **Date** | 2026-07-27 |
| **Runtime** | `ContractsInsuranceController` · `ContractsInsuranceService` · `assertContractEndDateForCreate` · `resolveHrmListScope` |

> **must_keep:** TEXT `company_id` slug · soft `employee_id` · scope parity list ↔ get contract · BR-CD-F5-01 (salary deprecated on contract body) · G-CI-01 end_date by type · U72 labels = FE.  
> **Cấm:** filter/persist LE UUID; PASS QA bằng seed (`ensureSeedData` / `pnpm seed:*`).

Prefix: `/api/hrm/contracts-insurance`

---

## 0. Endpoint map

| § | Method / path | Success code | Primary SRS |
|---|----------------|--------------|-------------|
| 1 | `GET /contracts` | `HRM-CON-200` | UC-HRM-25 · FR-CI-01 #8 |
| 2 | `GET /contracts/{contractId}` | `HRM-CON-200` | FR-CI-01 #8/#9 · INT-02 |
| 3 | `POST /contracts` | `HRM-CON-201` | FR-CI-01 #7 |
| 4 | `PATCH /contracts/{contractId}` | `HRM-CON-200` | FR-CI-01 update / status · F-05 |
| 5 | `GET /insurance` | `HRM-CON-200` | UC-HRM-25 · FR-CI-02 #7/#8 |
| 6 | `POST /insurance` | `HRM-CON-202` | FR-CI-02 #6 |
| 7 | `GET /contracts/expiring` | `HRM-CON-200` | FR-CI-01 cảnh báo hết hạn (Yêu cầu-15) |
| 8 | `GET /insurance/expiring` | `HRM-CON-200` | FR-CI-02 cảnh báo hết hạn |

Related (not full F.1 redefinition this pack):

| Path | Note |
|------|------|
| `DELETE /contracts/{contractId}` | Same scope helpers as PATCH; `HRM-CON-200` |
| `GET /insurance-policy-participants` | Alias of list insurance → `HRM-INS-200` |
| `…/compensation-packages*` · `…/compensation-history` | F5 / BR-CD-F5-01 annex — salary SoT; separate U71 if needed |

**Insurance get-by-id / PATCH:** **not** in W1 runtime — residual if sponsor expands beyond «ghi nhận + list».

---

## 1. Endpoint — List contracts

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/contracts` |
| Query | `company_id` (`main` \| slug), `employee_id`, `status`, `page`, `page_size` |
| Headers | `x-tenant-id`, `x-company-id` |
| Auth | Bearer / internal API key |
| Success | `200` · **`HRM-CON-200`** · `{ total, page, page_size, data[] }` |
| Runtime | `listContracts` · `resolveContractsListScope` |

### Mục đích

Cấp **danh sách hợp đồng lao động** trong phạm vi JWT / đơn vị để:

1. Embed Command Center **UC-HRM-25** (tab Hợp đồng / P-CC-04).
2. Sau **Lưu** / **F5** xác nhận dòng HĐ vừa tạo (FR-CI-01 #8).
3. Lọc theo NV / trạng thái cho panel hồ sơ.

### Nghiệp vụ xử lý

1. Auth (`HRM-AUTH-001` nếu thiếu).
2. `resolveScopeContext` + **`resolveHrmListScope` / `resolveContractsListScope`** — **same family** as get-by-id.
3. `company_id=main` → rollup five operating slugs; single slug → that slug; pilot UUID merge → slug; **never** treat LE UUID as workforce key.
4. Filter optional `employee_id` / `status`; JOIN `employees` non-archived (`e.id IS NOT NULL`).
5. Empty page = **honest empty** (not error).
6. Enrich `employee_name` / `employee_code` / `department` from employees (LEFT JOIN).
7. Does **not** join `xbos_legal_entity` for SoT.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / sequence | API role |
|---|---------|----------------------|----------|
| 1 | **UC-HRM-25** | GET list theo scope → bảng HĐ | **This endpoint** |
| 2 | **FR-HRM-CI-01** | **#7** Thành công — dòng HĐ trên danh sách | Read-back after create |
| 3 | **FR-HRM-CI-01** | **#8** Tải lại trang — HĐ còn | **This endpoint** + F5 |
| 4 | **FR-HRM-CI-01** | #1 auth / ngoài phạm vi | 401 / empty-or-404 path |
| 5 | **FR-HRM-INT-02** | Gắn đúng `employee_id` + cùng slug | JOIN + scope |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id=main` \| slug | `resolveContractsListScope` → `ec.company_id = ANY(slugs)` |
| `employee_id` | `ec.employee_id` |
| `status` | `ec.status` |
| `page` / `page_size` | OFFSET slice after ORDER BY `created_at DESC` |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id` | PK | Row key / deep link |
| `company_id` | TEXT slug | Scope; display VI via companion map (F-08 style) |
| `employee_id` | Soft FK | Link hồ sơ |
| `employee_name` / `employee_code` | JOIN employees | Cột NV |
| `contract_type` | Column | **F-04** FE → Có thời hạn / Không thời hạn / Thử việc… |
| `start_date` / `end_date` | DATE (`end_date` null OK) | `dd/MM/yyyy`; null → «—» / open-ended |
| `status` | Column | **F-05** FE badge |
| `contract_code`, `notes`, `compensation_package_id` | Columns | Detail / F5 link |
| timestamps | Columns | Audit |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope mismatch | scope / 409 | 409 |
| Empty | `HRM-CON-200` + `data=[]` / `total=0` | 200 |

### FE after 2xx (U65)

Bảng cập nhật · empty trung thực · F5 giữ · **F-04/F-05** map VI (không raw) · không mock khi API 200.

---

## 2. Endpoint — Get contract by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/contracts/{contractId}` |
| Query | `company_id` |
| Success | **`HRM-CON-200`** |
| Runtime | `getContractById` · **same** `resolveContractsListScope` |

### Mục đích

Cấp **chi tiết một hợp đồng** trong phạm vi để màn detail / deep link / khóa mang sang BH·lương — **không** trả HĐ ngoài JWT scope.

### Nghiệp vụ xử lý

1. Auth + scope resolve — **identical family** to list.
2. Load by `ec.id` **and** company slug set + resolvable employee scope.
3. JOIN active employee; missing / out of scope → **`HRM-CON-404`**.
4. Do not broaden beyond list rollup.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-CI-01** | **#8** tải lại / mở chi tiết | **This endpoint** |
| 2 | **FR-HRM-CI-01** | **#9** khóa mang (`id` / mã HĐ / `employee_id`) | Response body |
| 3 | **FR-HRM-INT-02** | HĐ gắn đúng hồ sơ cùng slug | Soft FK + scope |
| 4 | **UC-HRM-25** | List → detail (J-HRM contracts) | L2.5 |

### Response DTO ↔ DB

Same contract map as list row (full fields) — see §1. Path `contractId` = `employee_contracts.id`.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not in scope / missing | `HRM-CON-404` | 404 |
| Auth | `HRM-AUTH-001` | 401 |
| Scope header conflict | scope / 409 | 409 |

### Scope parity (normative)

| Pair | Rule |
|------|------|
| `GET /contracts` ↔ `GET /contracts/{id}` | **Same** `resolveContractsListScope` + employee visibility |
| Update/delete | `assertResourceInHrmScope` after load by id |

**FAIL GO** if get-by-id ignores list rollup / filters by LE UUID while list uses slug.

---

## 3. Endpoint — Create contract

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/contracts-insurance/contracts` |
| Body | `CreateContractDto` |
| Success | `201` envelope · **`HRM-CON-201`** |
| Runtime | `createContract` · `assertContractEndDateForCreate` · `resolveHrmPersistCompanyIdText` |

### Mục đích

**Tạo hợp đồng lao động** gắn hồ sơ NV trong đơn vị — phục vụ FR-HRM-CI-01 Lưu (#7) và mở khóa CI-02 / cảnh báo hết hạn / đối chiếu lương (F5).

### Nghiệp vụ xử lý

1. Auth + `resolveScopeContext` on `body.company_id`.
2. Persist company = **`resolveHrmPersistCompanyIdText`** (`main` → `holding` slug — never store `main` / LE UUID).
3. **G-CI-01:** `assertContractEndDateForCreate` — open-ended → `end_date` NULL OK; fixed → require end else **`HRM-CON-002`**; if end present and `start > end` → **`HRM-CON-001`** (Diễn biến #5).
4. Resolve `employee_id` (UUID) or name in scope; no eligible → **`HRM-CON-001`** (no employee).
5. **BR-CD-F5-01:** ignore deprecated `salary` on body — SoT lương = compensation-packages.
6. INSERT `employee_contracts` status default `active`; return row (khóa mang #9).
7. Soft FK only — no DB `REFERENCES` required.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-CI-01** | #1 auth / ngoài phạm vi | 401 / reject |
| 2 | **FR-HRM-CI-01** | #2/#3 chọn hồ sơ trong đơn vị | Resolve employee |
| 3 | **FR-HRM-CI-01** | #4 thiếu loại / ngày bắt đầu | DTO validation 400 |
| 4 | **FR-HRM-CI-01** | **#5** thời hạn sai | **`HRM-CON-001`** |
| 5 | **FR-HRM-CI-01** | #6 loại HĐ không hiệu lực | **`HRM-CON-TYPE-KEY`** — E2 lock (`API_DESIGN_HRM_ERP_E2.md` §6) |
| 6 | **FR-HRM-CI-01** | **#7** Lưu thành công — dòng HĐ mới | **This endpoint** |
| 7 | **FR-HRM-CI-01** | #9 khóa mang | Response `id` + `employee_id` |
| 8 | **FR-HRM-INT-02** | Gắn đúng hồ sơ + cùng slug | Persist keys |

### Request ↔ DB

| DTO field | DB column / rule |
|-----------|------------------|
| `company_id` | TEXT slug via persist helper |
| `employee_id` / `employee_name` | Soft `employee_id` |
| `contract_type` | `contract_type` (= **`contract_types.code`**; assert E2 — FE F-04 label) |
| `start_date` | `start_date` |
| `end_date` optional | `end_date` NULL or DATE |
| `contract_code`, `notes` | Optional columns |
| `salary` | **Ignored** (deprecated) |

### Response DTO ↔ DB

Created contract row (see §1 wire map) — FE shows toast + list refresh; F5 via §1.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Fixed type missing end | `HRM-CON-002` | 400 |
| Date range | `HRM-CON-001` | 400 |
| No employee in scope | `HRM-CON-001` | 400 |
| Scope conflict | scope / 409 | 409 |

### FE after 2xx (U65)

Toast + row loại/thời hạn · Network POST **201** `HRM-CON-201` · F5 còn · **không** seed inbox/DB để có dòng.

---

## 4. Endpoint — Update contract

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/contracts-insurance/contracts/{contractId}` |
| Body | `UpdateContractDto` |
| Success | **`HRM-CON-200`** |
| Runtime | `updateContract` · `assertResourceInHrmScope` |

### Mục đích

**Cập nhật** loại / thời hạn / trạng thái / ghi chú / liên kết gói lương F5 của HĐ đã tồn tại trong phạm vi — phục vụ chỉnh sửa panel lịch sử (F-05) mà không tạo bản ghi mới.

### Nghiệp vụ xử lý

1. Auth + scope on header/company.
2. Load existing `company_id`; **`assertResourceInHrmScope`** → 404 / **`HRM-CON-409`**.
3. If both dates provided and `start > end` → **`HRM-CON-001`**.
4. COALESCE patch fields; `notes` / `compensation_package_id` only when provided.
5. Ignore deprecated `salary`.
6. `updated_at = NOW()`; return row.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-CI-01** | #8 tải lại sau sửa — HĐ còn đúng giá trị | Read-back list/get |
| 2 | **FR-HRM-CI-01** | #5 thời hạn sai trên sửa | `HRM-CON-001` |
| 3 | **FR-HRM-CI-01** | Kết quả — trạng thái Đang hiệu lực / Hết hạn / Chấm dứt | `status` + **F-05** FE |
| 4 | **BR-CD-F5-01** | Gắn `compensation_package_id` không ép salary body | Soft link |

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `contract_type`, `start_date`, `end_date`, `status` | COALESCE columns |
| `notes` | CASE when provided |
| `compensation_package_id` | Soft UUID / null clear when provided |
| `salary` | Ignored |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found / out of scope | `HRM-CON-404` | 404 |
| Scope mismatch | `HRM-CON-409` | 409 |
| Date range | `HRM-CON-001` | 400 |
| Auth | `HRM-AUTH-001` | 401 |

### FE after 2xx

Panel cập nhật · badge F-05 VI · F5 giữ · không regression UF contracts 🟢.

---

## 5. Endpoint — List insurance

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/insurance` |
| Query | Same list query family as contracts (`company_id`, `employee_id`, `status`, page) |
| Success | **`HRM-CON-200`** |
| Runtime | `listInsurance` · same scope helpers |

### Mục đích

Cấp **danh sách bản ghi bảo hiểm** trong phạm vi để tab BHXH / UC-HRM-25, empty trung thực trước khi ghi nhận, và F5 sau Lưu (FR-CI-02 #7/#8).

### Nghiệp vụ xử lý

1. Auth + **same** `resolveContractsListScope` as contracts list (parity across CI module).
2. JOIN non-archived employees; filter optional employee/status.
3. Map wire enrich: `social_insurance_number` ← `policy_number`; optional health heuristic from `provider`.
4. Empty = honest empty (Diễn biến #7).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **UC-HRM-25** | Tab BHXH list | **This endpoint** |
| 2 | **FR-HRM-CI-02** | **#6** sau Lưu — dòng BH trên danh sách | Read-back |
| 3 | **FR-HRM-CI-02** | **#7** danh sách rỗng trước đó | Empty 200 |
| 4 | **FR-HRM-CI-02** | **#8** Tải lại — BH còn | **This endpoint** + F5 |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id`, `company_id`, `employee_id` | Columns | Keys |
| `provider` | Column | U-03 / display |
| `policy_number` | Column | Số sổ |
| `social_insurance_number` | Derived ← policy | Form BHXH |
| `expiry_date` | DATE | `dd/MM/yyyy` |
| `status` | Column | **U-03** FE (`active`→Đang hiệu lực…) |
| `employee_name` / `employee_code` | JOIN | Cột NV |
| `effective_date` | Derived from `created_at` (W1) | Optional paint |

### Errors

Same auth/scope family as §1; empty → 200.

### FE after 2xx

Tab BH cập nhật · U-03 VI · F5 · U65 no seed.

---

## 6. Endpoint — Create insurance record

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/contracts-insurance/insurance` |
| Body | `CreateInsuranceRecordDto` |
| Success | **`HRM-CON-202`** |
| Runtime | `createInsuranceRecord` · `resolveHrmPersistCompanyIdText` |

### Mục đích

**Ghi nhận bảo hiểm nhân viên** gắn hồ sơ trong đơn vị — FR-HRM-CI-02 Lưu (#6); mở khóa cảnh báo hết hạn.

### Nghiệp vụ xử lý

1. Auth + scope on `body.company_id`.
2. Persist slug via **`resolveHrmPersistCompanyIdText`**.
3. Require `employee_id`, `provider`, `policy_number`, `expiry_date` (W1 DTO).
4. INSERT status `active`; soft FK employee (app — employee should exist in scope for product honesty; list JOIN hides orphans).
5. Return row (khóa mang #9).
6. Duplicate policy / catalog type reject = residual when product locks Diễn biến #5/#3.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-CI-02** | #1 auth / ngoài phạm vi | 401 / reject |
| 2 | **FR-HRM-CI-02** | #2 chọn hồ sơ | `employee_id` |
| 3 | **FR-HRM-CI-02** | #3 thiếu loại / ngày | DTO 400 |
| 4 | **FR-HRM-CI-02** | #4 thời hạn sai | Residual tighten vs required expiry |
| 5 | **FR-HRM-CI-02** | #5 trùng sổ (nếu cấm) | Residual |
| 6 | **FR-HRM-CI-02** | **#6** Lưu thành công — dòng BH mới | **This endpoint** |
| 7 | **FR-HRM-CI-02** | #9 khóa mang | Response `id` + `employee_id` |

### Request ↔ DB

| DTO | DB |
|-----|-----|
| `company_id` | TEXT slug |
| `employee_id` | Soft UUID |
| `provider` | `provider` |
| `policy_number` | `policy_number` |
| `expiry_date` | `expiry_date` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Validation | class-validator | 400 |
| Scope | scope / 409 | 409 |

### FE after 2xx

Toast + row BH · POST **202/201 envelope** `HRM-CON-202` · F5 còn · không seed.

---

## 7. Endpoint — List expiring contracts

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/contracts/expiring` |
| Query | `company_id`, `days` (default 30) |
| Success | **`HRM-CON-200`** · `{ total, days, data[] }` |
| Runtime | `listExpiringContracts` |

### Mục đích

Cấp **HĐ sắp hết hạn** trong cửa sổ `days` để cảnh báo vận hành (Yêu cầu-15 / FR-CI-01 hậu điều kiện) trên dashboard / alert — không thay list đầy đủ §1.

### Nghiệp vụ xử lý

1. Same scope family as list contracts.
2. Filter `end_date <= CURRENT_DATE + days` (rows with NULL end_date naturally excluded by predicate).
3. ORDER BY `end_date ASC`.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / rule | API role |
|---|---------|------------------|----------|
| 1 | **FR-HRM-CI-01** | Quy tắc cảnh báo hết hạn sau khi có ngày kết thúc | **This endpoint** |
| 2 | **UC-HRM-25** | Alert / ExpiringContracts | Consumer UI · **F-04** labels |

### Errors

Auth/scope same as §1; empty window → 200 `data=[]`.

---

## 8. Endpoint — List expiring insurance

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/insurance/expiring` |
| Query | `company_id`, `days` (default 30) |
| Success | **`HRM-CON-200`** |
| Runtime | `listExpiringInsurance` |

### Mục đích

Cấp **bản ghi BH sắp hết hạn** để cảnh báo (FR-CI-02 điều kiện hậu) — song song contracts expiring.

### Nghiệp vụ xử lý

1. Same scope family as insurance list.
2. `expiry_date <= CURRENT_DATE + days`; ORDER BY `expiry_date ASC`.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / rule | API role |
|---|---------|------------------|----------|
| 1 | **FR-HRM-CI-02** | Cảnh báo hết hạn sau ghi nhận | **This endpoint** |
| 2 | **UC-HRM-25** | Insurance expiring UI | Consumer · **U-03** |

### Errors

Auth/scope same as §5; empty → 200.

---

## 9. Cross-cutting

### 9.1 Scope parity matrix

| Endpoints | Shared helper |
|-----------|---------------|
| List contracts · get contract · expiring contracts | `resolveContractsListScope` / `resolveHrmListScope` |
| List insurance · expiring insurance | **Same** scope family |
| Create contract/insurance | `resolveHrmPersistCompanyIdText` (slug) |
| Patch/delete contract | `assertResourceInHrmScope` |

### 9.2 U72 FE maps (not BE)

| Field | Spec | FE must |
|-------|------|---------|
| `contract_type` | SRS_FIELD_DISPLAY **F-04** | VI badge — không raw `fixed_term` |
| contract `status` | **F-05** | Đang hiệu lực / Hết hạn / Đã chấm dứt |
| insurance `status` / type | **U-03** | BHXH / Đang hiệu lực… |

### 9.3 must_keep / residual

| must_keep | Residual (not closed by this ADD) |
|-----------|-----------------------------------|
| Employees TEXT slug + soft FK align | Catalog assert contract_type Diễn biến #6 |
| G-CI-01 / BR-CD-F5-01 | Insurance PATCH/GET-by-id; duplicate policy → **E3 design** `API_DESIGN_HRM_ERP_E3.md` §§6–12 (policy master + PATCH/GET record + insurer assert). Impl residual until Dev. |
| U65 zero-seed evidence | `ensureSeedData` bootstrap ≠ UF PASS |
| Compensation F5 annex | Full compensation F.1 if U71 opens |

---

## 10. Acceptance (API plane)

| Check | PASS |
|-------|------|
| Each §1–§8 has Mục đích · Nghiệp vụ · Bước SRS | This file |
| OpenAPI paths exist for contracts CRUD + insurance list/create/expiring | `hrm-api.yaml` |
| List↔get contracts same scope family | Code review / jest |
| Create contract open-ended NULL end_date | G-CI-01 tests |
| FE after create: list + F5 | Browser U65 — not seed |

---

## 11. EXPAND — Contract create wizard (PO-HRM-CTR-CREATE-REDESIGN · SA-01 §7)

| Fn ID | Method / path | Mục đích (VI) | Nghiệp vụ xử lý | Tham chiếu bước SRS |
|-------|---------------|---------------|----------------|---------------------|
| **F-CORE-CTR-CREATE-CTX-01** | `GET …/employees/{employeeId}/contract-create-context?company_id=` | Card C&B + Bên A/B cho Bước 1 wizard | Scope parity create; active compensation package + allowance lines display-ready; mask C&B khi AuthZ 403 | FR-UC-BP-CORE-09d #1–#3 · SA-01 O10 |
| **F-CORE-CTR-OVERLAY-01** | `PUT …/contracts/{contractId}/print-overlay` | Lưu `clause_ids[]` trên HĐ draft | Validate clause active + pack; JSONB `print_overlay_clause_ids`; **không** sửa template junction | FR-09b DnD · CTR-CREATE-CLAUSE-01 |
| **F-CORE-CTR-PREV-01** **EXPAND** | `POST …/contracts/{contractId}/preview` body `clause_ids?` | Preview theo thứ tự overlay/ephemeral | Ưu tiên body `clause_ids` → persisted overlay → template junction | FR-09b preview |
| **F-CORE-CTR-REG-01** **EXPAND** | `GET` list/get contracts | SELECT `template_code`, `signed_at`, `contract_name`, `work_arrangement`, `salary_ratio_percent`, GPLX cols | Display-ready F5 edit restore | UF-HRM-02 · O12 |
| **F-CORE-CTR-REG-02** **EXPAND** | `POST/PATCH` contracts | `signed_at`, `work_arrangement`, `contract_name`, `salary_ratio_percent` | G-CI-01 + AMIS intake | FR-CI-01 / 09d |

Errors (additive): **`HRM-CTR-OVERLAY-400`** · reuse **`HRM-CTR-TPL-PACK-MISMATCH`** · scope 409 family.

**Runtime (2026-08-10):** `ContractsInsuranceService.getContractCreateContext` · `ContractLegalPrintService.putContractPrintOverlay` · `previewContract` clause_ids branch.

**must_keep:** F-CORE-CTR-PACK/PREV RETAIN · UF-HRM-02 registry CRUD · `contracts_printable_ready=false`.

---

## 12. EXPAND — Subject + GĐ1 fields (PO-HRM-CTR-CREATE-REDESIGN-SA-02)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-SA-02` |
| **status** | **LOCK** — full F.1 in [`docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md`](../../program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md) §4 |
| **G-CTR-SUBJ-01** | **EXPAND-REGISTRY-01** — nullable `employee_id` + `candidate_id` on `employee_contracts` |

**ADD columns:** `candidate_id`, `requisition_id`, `subject_type`, `contract_abstract` · **ALTER** `employee_id` nullable when candidate path.

**POST/PATCH EXPAND:** `subject_type`, `candidate_id`, `signing_date`→`signed_at`, `work_form`→`work_arrangement`, `salary_ratio_percent`, `contract_abstract` (+ aliases `abstract`).

**Errors ADD:** `HRM-CTR-SIGN-REQ-400` · `HRM-CTR-SUBJECT-400` · `HRM-CTR-CANDIDATE-404` · `HRM-CTR-SUBJECT-REC-400` · `HRM-CTR-WORK-FORM-400` · `HRM-CTR-SALARY-RATIO-400`.

**must_keep:** UF-HRM-02 employee registry · G-CI-01 · FR-HRM-CI-01 create · list↔get scope parity · `contracts_printable_ready=false`.

---

## 13. EXPAND — ContractWorkspace view shell (PO-HRM-CTR-WORKSPACE-SA-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-SA-01` |
| **status** | **LOCK** — full spec in [`docs/program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md`](../program/specs/PO-HRM-CTR-WORKSPACE-SA-01.md) §4 |
| **ref_ba** | `PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03` §2 · §6 |

### 13.1 EXPAND `GET /contracts/{contractId}` — clause layout for view

| Item | Value |
|------|--------|
| **Mục đích** | Bind ContractWorkspace mode `view` / edit step 2 — registry + **clause canvas** một response |
| **Nghiệp vụ** | Resolve `clause_ids` (overlay → template default) · JOIN library → `clause_layout[]` read-only · `can_issue` predicate |
| **Bước SRS** | FR-UC-BP-CORE-09a W1 (Eye 2 bước) · W5 (order only, body Settings) |

**Response ADD:** `clause_ids`, `clause_layout[]`, `can_issue`, optional `preview_summary`.

**Cấm on POST/PATCH registry:** `body_vi`, inline clause text — use `PUT …/print-overlay` for `clause_ids[]` only.

### 13.2 AMEND POST default subject (NV-first)

When `subject_type` omitted: default **`employee`** path (AMEND SA-02 §4.3 step 2). UV path when `candidate_id` only · `employee_id` null.

**G-CTR-SUBJ-01:** RESOLVED — EXPAND-REGISTRY-01 (`BE-SUBJ-01`). Default tab = **dev-fe** G-CTR-SUBJ-04.

---

## 14. ADD — Bootstrap C&B từ ContractWorkspace (SA-CTR-INSURANCE-SALARY-SOURCE-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-CTR-INSURANCE-SALARY-SOURCE-01` |
| **status** | **LOCK** — full Option/F.1 in [`docs/program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md`](../program/specs/SA-CTR-INSURANCE-SALARY-SOURCE-01.md) |
| **ref_ba** | `BA-CTR-INSURANCE-SALARY-SOURCE-01` §2–§6 · BR-CTR-CB-BOOT-* · AC-CTR-CB-BOOT-* |
| **ref_core02** | F-CORE-EMP-02 RETAIN (`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01` §5.1) |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

### 14.1 F-CORE-EMP-02 — CONSUME bootstrap (no new path)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/contracts-insurance/compensation-packages`** |
| **Mục đích** | Từ ContractWorkspace / wizard tạo HĐ: khi NV chưa có gói C&B, HCNS đủ AuthZ nhập **Lương cơ bản** + **Lương đóng BH** và hệ thống **tạo gói v1** trên SoT packages — **không** lưu lương BH làm SoT trên `employee_contracts`. |
| **Nghiệp vụ xử lý** | (1) AuthZ mutate → else **403** `HRM-CORE-CB-AUTHZ-403`. (2) `effective_from` theo map SA §4 (HĐ effective → signed_at → today). (3) Lines canonical: `{line_type:base, component_code:base}` + `{line_type:allowance, allowance_code:si_base, component_code:si_base}`; amounts **> 0** khi `change_reason=ctr_workspace_bootstrap`. (4) Overlap → **409** `HRM-COMP-409-OVERLAP` / `HRM-CORE-CB-OVERLAP-409`. (5) Missing/invalid date/amount → **400** `HRM-CORE-CB-VAL-400`. (6) Optional `contract_id` / `link_to_contract` chỉ khi HĐ đã có id. (7) **DENY** Nest `/core` dual · **DENY** cột lương BH SoT trên contracts. |
| **Tham chiếu bước SRS** | BA-CTR Diễn biến §6 #3–#4 · BR-CTR-CB-BOOT-01..04 · AC-CTR-CB-BOOT-01/02/03 · FR-UC-BP-CORE-02 #1–#4 · BR-BP-SEC-02 |
| **Request → DB** | `employee_compensation_packages` + `employee_compensation_lines` (+ history) — RETAIN CORE-02 |
| **Response** | **201** `HRM-COMP-201` |
| **Lỗi** | `HRM-CORE-CB-AUTHZ-403` · `HRM-CORE-CB-VAL-400` · `HRM-COMP-409-OVERLAP` / `HRM-CORE-CB-OVERLAP-409` · `HRM-COMP-001`/`003` · `HRM-SC-COMP-KEY` · scope 404/409 |

### 14.2 F-CORE-CTR-CREATE-CTX-01 — REFRESH sau bootstrap

| | |
|--|--|
| **METHOD / path** | **`GET …/employees/{employeeId}/contract-create-context?company_id=`** |
| **Mục đích** | Sau POST packages 2xx: FE refresh snapshot → card C&B về **read-only** với `base_salary_vnd` + `insurance_salary_vnd`. |
| **Nghiệp vụ** | Active package → snapshot; `insurance_salary_vnd` ← `si_base` \| `insurance_base` \| fallback base; AuthZ fail → `cb_masked`. |
| **Bước SRS** | BA §6 #2 · #4 · AC-CTR-CB-RO-01 · AC-CTR-CB-BOOT-02 |

### 14.3 DENY / residual

| DENY | Residual (doc / peer WI) |
|------|--------------------------|
| ADD cột `insurance_salary` SoT trên `employee_contracts` | `salary_ratio_percent` form vs snapshot hardcode **100** — **không** gộp lane này |
| Endpoint orchestrator mới GĐ1 | Q-S1..Q-S5 sponsor — defaults trong SA §7 |
| Bootstrap UV (`employee_id` null) | Soft-link `contract_id` sau create HĐ |
| Bắt bootstrap trên registry-only (default Q-S4) | Catalog membership `si_base` khi Nest active >0 |

**must_keep:** F-CORE-EMP-02 packages ONE SoT · O10 no «+ Thêm» · G4 seals · `contracts_printable_ready=false`.
