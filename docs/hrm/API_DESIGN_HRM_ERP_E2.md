# API_DESIGN — HRM ERP E2 (PAY-CLEAN + Contract type assert)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E2-DB-API-01` |
| **cohort** | E2 · `E-PAY-CLEAN` / `PAY-CONTRACT-CONSTRAINT` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | `docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md` **FR-HRM-PAY-CLEAN-E2-01** Diễn biến #1–#8 · **FR-HRM-CI-TYPE-E2-01** Diễn biến #1–#6 · AC-E2-* · VAL-E2-01..06 · FR-HRM-SC-PAY-TYPE-01 · FR-HRM-SC-CT-01 · FR-CI-01 #6 · UC-HRM-24/25/28/31 |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_ERP_E2.md` |
| **ref_catalog_api** | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` · `API_DESIGN_HRM_SETTINGS_E1B.md` (picker items) |
| **ref_baseline** | `API_DESIGN_HRM_PAYROLL.md` · `API_DESIGN_HRM_CONTRACTS_INS.md` · E1-A assert pattern `API_DESIGN_HRM_MD_BIND_E1A.md` §0.1 |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71 F.1** | Mỗi endpoint dưới đây đủ 3 mục + DTO↔DB + lỗi |
| **Date** | 2026-07-28 |
| **Cấm** | `apps/**` · apply migration · seed U65 |

> **Rule:** Mutate paths accept **catalog codes** for `component_type` (`pay_types`) and `contract_type` (`contract_types`). FE removes HARDCODE / mock islands. Tax settlement without BE → **hide** (not invent endpoints in this pack).

---

## 0. Shared contracts

### 0.1 Assert helpers (normative)

| Helper | Catalog | Error code |
|--------|---------|------------|
| `assertCodeInEffectiveCatalog(…, 'pay_types' \| aliases, code)` | pay nature | **`HRM-PAY-TYPE-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'contract_types', code)` | contract type | **`HRM-CON-TYPE-KEY`** |
| Empty effective catalog | Same reject when field required — **no** free-text / HARDCODE fallback as SoT | 400 |
| Pattern reuse | E1-A `assertCodeInEffectiveCatalog` / `HRM-*-POS-KEY` | — |

### 0.2 Picker dependency (not redesigned)

| Method / path | Role |
|---------------|------|
| `GET /api/hrm/settings-catalogs/{catalogKey}/items?q=&active=` | FE CatalogSearchPicker — keys `pay_types`, `contract_types` |
| Alias resolve | `component_types` / `pay_natures` / `salary_component_types` → family `pay_nature` storage `pay_types` (E1-B) |
| Success empty | FE empty + CTA Settings/sync — mutate still rejects invent |

### 0.3 Error envelope

| Family | HTTP | FE |
|--------|------|-----|
| Invalid / missing catalog code | **400** + `HRM-PAY-TYPE-KEY` / `HRM-CON-TYPE-KEY` | Field error VI |
| Duplicate component code | **409** + `HRM-SC-002` | Toast «Mã thành phần đã tồn tại» |
| Period overlap / date | `HRM-PAY-002` / `HRM-PAY-001` | Existing |
| Auth | 401 `HRM-AUTH-001` | Login |
| Scope | 404/409 `HRM-SC-*` / `HRM-CON-*` / `HRM-PAY-*` | Banner |
| Success | 200/201 module envelopes | Bind + F5 |

### 0.4 Endpoint map (E2 delta)

| § | Method / path | Success | Primary SRS |
|---|----------------|---------|-------------|
| 1 | `GET /payroll/salary-components` | `HRM-SC-200`* | UC-HRM-28 · FR-HRM-PAY-CLEAN #2 |
| 2 | `POST /payroll/salary-components` | `HRM-SC-201`* | FR-HRM-PAY-CLEAN #3 · AC-E2-BE-01 |
| 3 | `PATCH /payroll/salary-components/{componentId}` | `HRM-SC-200`* | FR-HRM-PAY-CLEAN #3/#5 |
| 4 | `DELETE /payroll/salary-components/{componentId}` | `HRM-SC-200`* | FR-HRM-SC-PAY-01 |
| 5 | `POST /payroll/periods` | `HRM-PAY-201` | FR-HRM-PAY-CLEAN #4 · VAL-E2-03/04 |
| 6 | `POST /contracts-insurance/contracts` | `HRM-CON-201` | FR-HRM-CI-TYPE-E2 #2 · AC-E2-CI-BE-01 |
| 7 | `PATCH /contracts-insurance/contracts/{contractId}` | `HRM-CON-200` | FR-HRM-CI-TYPE-E2 #2/#5 |
| 8 | `GET /insurance-policy-participants` | `HRM-INS-P-200` | FR-HRM-PAY-CLEAN #1/#7 · AC-E2-NOMOCK |
| 9 | `GET /settings-catalogs/{catalogKey}/items` | `HRM-SET-200` | Picker dependency (cite) |

\*Runtime may use generic `ok()` codes — Dev **must** map stable codes above (or document alias in OpenAPI). Prefer introducing `HRM-SC-*` if absent today.

**Related (brief — not full redesign):** `GET/POST/PATCH/DELETE` insurance participants mutate · payment-batches live paths · period process/close (baseline payroll).

**Explicit non-endpoint:** Tax settlement CRUD — **absent**; FE **hide** (Q1).

---

## 1. Endpoint — List salary components

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/payroll/salary-components` |
| Query | `company_id` (`main` \| slug) |
| Success | `200` · envelope + `{ total, data[] }` |
| Runtime | `PayrollController` → `PayrollCatalogService.listSalaryComponents` |

### Mục đích

Cấp **danh sách thành phần lương** (TX) trong phạm vi đơn vị để màn Salary Components / gắn template — sau E2 mỗi dòng có `component_type` = mã `pay_types` để FE map nhãn VI (U72).

### Nghiệp vụ xử lý

1. Auth — thiếu → `HRM-AUTH-001`.
2. `resolveHrmListScope` — `main` → five slugs; never LE UUID as workforce key.
3. SELECT `salary_components` (+ optional category JSON).
4. Empty = honest empty (not error).
5. Does **not** invent mock components; does **not** expand scope beyond list ladder.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến / AC | API role |
|---|---------|----------------|----------|
| 1 | **UC-HRM-28** | Load cơ cấu / TP lương | **This endpoint** |
| 2 | **FR-HRM-PAY-CLEAN-E2-01** | **#2** Mở form TP — options nature từ catalog | Read-back after create |
| 3 | **FR-HRM-SC-PAY-01** | List instance TP | **This endpoint** |
| 4 | **AC-E2-F5-01** | F5 vẫn thấy code→label | List after mutate |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id` | `sc.company_id = ANY(slugs)` |

### Response DTO ↔ DB

| Wire | DB / rule | UI |
|------|-----------|-----|
| `id` | PK | Row key |
| `company_id` | TEXT slug | Scope |
| `code` / `name` | Columns | Mã / tên |
| **`component_type`** | **`pay_types.code`** | Label VI via picker map |
| `nature`, flags, formula… | Columns | Form |
| `category` | JOIN optional | Group |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope | 409 family | 409 |
| Empty | 200 + `data=[]` | 200 |

### FE after 2xx (U65)

Bảng TP cập nhật · empty trung thực · F5 giữ · **cấm** HARDCODE fill khi API 200 empty.

---

## 2. Endpoint — Create salary component

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/payroll/salary-components` |
| Body | Create salary component DTO |
| Success | `201` · **`HRM-SC-201`** (target) |
| Runtime | `createSalaryComponent` — **ADD** assert + unique |

### Mục đích

**Tạo thành phần lương** với bản chất ràng buộc danh mục Settings `pay_types` — đóng HARDCODE `componentTypes` FE và chặn invent code (BR-HRM-PAY-E2-02/03).

### Nghiệp vụ xử lý

1. Auth + `resolveHrmPersistCompanyIdText` on `body.company_id`.
2. Validate required: `code`, `name`, **`component_type`** (no default VI `'Lương'`).
3. `assertCodeInEffectiveCatalog('pay_types', component_type)` → else **`HRM-PAY-TYPE-KEY`**.
4. Unique check `(company_id, lower(code))` → else **`HRM-SC-002`**.
5. Optional `category_id` in scope / exists.
6. INSERT; return row.
7. FE Zod should block missing fields before Network (AC-E2-ZOD-01) — BE still enforces.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PAY-CLEAN-E2-01** | **#3** Chọn nature → Lưu · body = code | **This endpoint** |
| 2 | **FR-HRM-PAY-CLEAN-E2-01** | **#5** Gửi code invent | **`HRM-PAY-TYPE-KEY`** |
| 3 | **FR-HRM-PAY-CLEAN-E2-01** | **#4** Thiếu required | Zod FE + BE 400 |
| 4 | **FR-HRM-PAY-CLEAN-E2-01** | **#6** Catalog empty | Assert reject / CTA |
| 5 | **AC-E2-BE-01** · **VAL-E2-01/04** | Unknown / duplicate | 400 / 409 |
| 6 | **FR-HRM-SC-PAY-TYPE-01** | Nature từ Settings | Assert family |

### Request ↔ DB

| DTO | Column |
|-----|--------|
| `company_id` | TEXT slug |
| `code` | `code` |
| `name` | `name` |
| **`component_type`** | **`component_type`** (= pay_types.code) |
| `nature`, `value_type`, flags, formula, bounds, `category_id`, … | existing |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Missing/invalid `component_type` | **`HRM-PAY-TYPE-KEY`** | 400 |
| Missing code/name | `HRM-VAL-001` / `HRM-SC-001` | 400 |
| Duplicate code | **`HRM-SC-002`** | 409 |
| Unauth / scope | `HRM-AUTH-001` / 409 | — |

### FE after 2xx (U65)

Row xuất hiện · Network body `component_type` = **code** · F5 label VI · không seed.

---

## 3. Endpoint — Update salary component

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/payroll/salary-components/{componentId}` |
| Query | `company_id` |
| Success | `200` |
| Runtime | `updateSalaryComponent` — **ADD** assert when `component_type` / `code` patched |

### Mục đích

Cập nhật TP lương; khi đổi bản chất phải gửi **mã catalog**, không ghi đè bằng nhãn VI HARDCODE.

### Nghiệp vụ xử lý

1. Load by id; `assertResourceInHrmScope` → `HRM-SC-404` / `HRM-SC-409`.
2. If `component_type` in body: trim; empty → reject; assert `pay_types`.
3. If `code` changes: unique check → `HRM-SC-002`.
4. Allowlist update (existing fields); `updated_at = NOW()`.
5. Return row.

### Tham chiếu bước SRS

| FR / AC | Diễn biến | API role |
|---------|-----------|----------|
| FR-HRM-PAY-CLEAN-E2-01 #3/#5 | Sửa nature / invent | **This endpoint** |
| AC-E2-F5-01 | F5 sau sửa | GET list |
| VAL-E2-01 | Unknown type | 400 |

### Request ↔ DB

Same key fields as create for patched columns.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Invalid nature | **`HRM-PAY-TYPE-KEY`** | 400 |
| Duplicate code | **`HRM-SC-002`** | 409 |
| Not found / OOS | `HRM-SC-404` / `409` | — |

### FE after 2xx

List refresh · label VI · U72.

---

## 4. Endpoint — Delete salary component

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/payroll/salary-components/{componentId}` |
| Query | `company_id` |
| Success | `200` |
| Runtime | `deleteSalaryComponent` |

### Mục đích

Xóa TP lương trong phạm vi (FR-HRM-SC-PAY-01 CRUD) — không đụng Settings catalog dictionary.

### Nghiệp vụ xử lý

1. Auth + scope filter on delete.
2. DELETE returning id; missing → `HRM-SC-404`.
3. Template JOIN soft behavior = existing (orphan template rows = Dev note if FK).

### Tham chiếu bước SRS

| FR | Diễn biến | API role |
|----|-----------|----------|
| FR-HRM-SC-PAY-01 | Xóa instance TP | **This endpoint** |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found / OOS | `HRM-SC-404` | 404 |

### FE after 2xx

Row biến mất · F5 không còn · empty honest.

---

## 5. Endpoint — Create payroll period (constraint reinforce)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/payroll/periods` |
| Success | `201` · **`HRM-PAY-201`** |
| Runtime | `createPayrollPeriod` — cite baseline + Zod FE |

### Mục đích

Tạo kỳ lương nháp với required fields + anti-overlap — hỗ trợ AC-E2-ZOD-01 / VAL-E2-03/04; **không** tạo phiếu / mock số.

### Nghiệp vụ xử lý

1. Auth + scope on `body.company_id`.
2. Required: `period_label`, `start_date`, `end_date`, `company_id`.
3. `start_date <= end_date` else **`HRM-PAY-001`**.
4. Overlap same company else **`HRM-PAY-002`**.
5. INSERT `status='draft'`; zero payslip side-effect.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PAY-CLEAN-E2-01** | **#4** Tạo kỳ thiếu required | Zod + 400 |
| 2 | **FR-HRM-PR-01** | #4/#5/#7 date / overlap / success | Baseline codes |
| 3 | **AC-E2-P3-01** | Period form Zod | FE + this API |

### Request ↔ DB

| Body | Column |
|------|--------|
| `company_id` | TEXT slug |
| `period_label` | `period_label` |
| `start_date` / `end_date` | DATE |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Date order | `HRM-PAY-001` | 400 |
| Overlap / unique range | `HRM-PAY-002` | 409 |
| Missing required | `HRM-VAL-001` | 400 |

### FE after 2xx

Row kỳ · status draft · không mock lương.

---

## 6. Endpoint — Create contract (A8 type assert)

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/contracts-insurance/contracts` |
| Success | `201` · **`HRM-CON-201`** |
| Runtime | `createContract` — **ADD** `assertCodeInEffectiveCatalog(contract_types)` |

### Mục đích

Tạo HĐ với **loại HĐ = mã catalog** — đóng **R-E1A-A8-CTYPE** trên cả Profile EmployeeContracts và Contracts page (một API).

### Nghiệp vụ xử lý

1. Baseline CI create (scope, employee resolve, G-CI-01 end_date, BR-CD-F5-01 ignore salary).
2. **NEW:** require `contract_type`; `assertCodeInEffectiveCatalog('contract_types', contract_type)` → else **`HRM-CON-TYPE-KEY`** (FR-CI-01 #6).
3. Keep E1-A: when position shown → `position_key` assert (`HRM-CON-POS-KEY`) — must_keep.
4. INSERT; return row.

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-CI-TYPE-E2-01** | **#2** Chọn loại → Lưu · code | **This endpoint** |
| 2 | **FR-HRM-CI-TYPE-E2-01** | **#5** Invent code | **`HRM-CON-TYPE-KEY`** |
| 3 | **FR-HRM-CI-01** | **#6** Loại không hiệu lực | Same assert |
| 4 | **FR-HRM-CI-01** | **#7** Lưu thành công | 201 |
| 5 | **AC-E2-CI-TYPE-01** / **AC-E2-CI-BE-01** | Catalog + 400 | FE picker + this |
| 6 | **AC-E2-CI-PARITY-01** | Hai surface cùng API | Profile + page |

### Request ↔ DB

| DTO | Column |
|-----|--------|
| **`contract_type`** | **`contract_type`** (= contract_types.code) |
| dates, employee, company, E1-A position keys… | baseline + E1-A |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Invalid/missing type | **`HRM-CON-TYPE-KEY`** | 400 |
| End date rules | `HRM-CON-001` / `002` | 400 |
| Invalid position_key | `HRM-CON-POS-KEY` | 400 |

### FE after 2xx (U65)

Row loại = label VI từ catalog · Network `contract_type` = **code** · F5 · **cấm** `CONTRACT_TYPES_KEYS` khi items > 0.

---

## 7. Endpoint — Update contract (type assert)

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/contracts-insurance/contracts/{contractId}` |
| Success | `200` · **`HRM-CON-200`** |
| Runtime | `updateContract` — **ADD** type assert when patched |

### Mục đích

Sửa loại / thời hạn HĐ vẫn ràng buộc `contract_types` — parity profile ↔ page.

### Nghiệp vụ xử lý

1. Scope load + `assertResourceInHrmScope`.
2. If `contract_type` in body → assert catalog → **`HRM-CON-TYPE-KEY`**.
3. Date / status / notes / compensation_package baseline rules.
4. E1-A position keys when patched — must_keep asserts.

### Tham chiếu bước SRS

| FR / AC | Diễn biến | API role |
|---------|-----------|----------|
| FR-HRM-CI-TYPE-E2-01 #2/#5 | Sửa loại / invent | **This endpoint** |
| FR-HRM-CI-01 #8 | F5 sau sửa | GET list/get |
| AC-E2-CI-PARITY-01 | Cùng SoT | — |

### Errors

Same type/date/scope family as create + `HRM-CON-404` / `409`.

### FE after 2xx

Badge/type label VI · F5 · U72.

---

## 8. Endpoint — List insurance policy participants (mock-removal wire)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/insurance-policy-participants` |
| Query | `company_id` |
| Success | `200` · **`HRM-INS-P-200`** |
| Runtime | `CatalogExtensionsController.listInsuranceParticipants` |

### Mục đích

Cấp **danh sách người tham gia chính sách BH** thật trong phạm vi để Payroll island thay **mock** `insurancePolicyParticipantsData` (BR-HRM-PAY-E2-01 · AC-E2-NOMOCK-01 / AC-E2-P1-01).

### Nghiệp vụ xử lý

1. Auth + company scope (same Plane B helpers as catalog-extensions).
2. SELECT `hrm_insurance_policy_participants` in scope.
3. Empty = honest empty — **not** FE fake NV001… rows.
4. On 4xx/5xx FE shows banner — **cấm** fallback mock (Diễn biến #7).

### Tham chiếu bước SRS

| # | UC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PAY-CLEAN-E2-01** | **#1** Mở Payroll — không mock participants | **This endpoint** (or hide tab) |
| 2 | **FR-HRM-PAY-CLEAN-E2-01** | **#7** API fail | Banner; no mock |
| 3 | **AC-E2-NOMOCK-01** · **AC-E2-P1-01** | grep mock = 0 | FE wire |
| 4 | **J-HRM-07** / slice **J-HRM-PAY-E2-01** | Cross-nav payroll | Host journey |

### Request ↔ DB

| Input | Maps to |
|-------|---------|
| `company_id` | Scope → table `company_id` |

### Response DTO ↔ DB

Runtime row fields (`employee_code`, `employee_name`, insurance fields, status…) — FE maps VI labels (U72); full insurer catalog depth = **E3**.

> **DOC-DELTA 2026-07-28 (`BA-ERP-E3-DB-API-01`):** Participant create/PATCH **must** assert `policy_id` + `employee_id` (+ optional `insurer_key`) — F.1 reinforce `API_DESIGN_HRM_ERP_E3.md` §13 · DB `DB_DESIGN_HRM_ERP_E3.md` §6. Policy master CRUD = E3 §§6–10.

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Unauth | `HRM-AUTH-001` | 401 |
| Scope | 409 family | 409 |
| Empty | `HRM-INS-P-200` + empty | 200 |

### FE after 2xx (U65)

List live or empty · **delete** const mock array · mutate via POST/PATCH/DELETE siblings when UI exposes (same controller).

### Mutate siblings (F.1 brief)

| Method | Path | Success | Note |
|--------|------|---------|------|
| POST | `/insurance-policy-participants` | `HRM-INS-P-201` | Soft employee + company slug |
| PATCH | `/insurance-policy-participants/:id` | `HRM-INS-P-200` | Scope assert |
| DELETE | `/insurance-policy-participants/:id` | `HRM-INS-P-200` | Scope assert |

---

## 9. Endpoint — Settings catalog items (picker cite)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs/{catalogKey}/items` |
| Keys E2 | `pay_types` · `contract_types` (+ pay aliases) |
| Success | `HRM-SET-200` |
| Design SoT | `API_DESIGN_HRM_SETTINGS_E1B.md` Endpoint B — **no new URL** |

### Mục đích

Cấp **options picker** bản chất TP và loại HĐ từ effective Settings (E1-B đã PASS) cho FE CatalogSearchPicker.

### Nghiệp vụ xử lý

1. Resolve alias family (pay_nature / contract_types).
2. Merge L1+L2a effective active items.
3. Empty honest — FE CTA Settings/sync.
4. **Cấm** `companyId` query that triggers `HRM-VAL-001` (E1-B lesson — headers/scope only).

### Tham chiếu bước SRS

| FR | Diễn biến | API role |
|----|-----------|----------|
| FR-HRM-PAY-CLEAN #2/#6 | Picker nature / empty CTA | **This endpoint** |
| FR-HRM-CI-TYPE-E2 #1/#3 | Picker loại HĐ + parity | **This endpoint** |
| FR-HRM-SC-PAY-TYPE-01 / FR-HRM-SC-CT-01 | Settings SoT | Items |

### FE after 2xx

Options = code+label · persist code on Payroll/CI mutate.

---

## 10. Tax settlement — non-endpoint contract (Q1)

| Decision | Value |
|----------|--------|
| BE | **No** `tax-settlement` routes in hrm-api today |
| FE E2 | **HIDE** add/edit tax settlement that invents employees/policies; empty read-only OK |
| Cấm | Mock editor «chạy được» (AC-E2-P3-02) |
| Future | Separate U71 pack if sponsor opens tax TX tables + F.1 APIs |

---

## 11. Scope parity (mandatory)

| Operation | Resolver |
|-----------|----------|
| List/create/update/delete salary components | `resolveHrmListScope` / persist text / `assertResourceInHrmScope` |
| Periods | Baseline payroll scope |
| Contracts create/update | `resolveContractsListScope` + persist text |
| Insurance participants | Catalog-extensions company scope |
| Settings items | `resolveHrmSettingsCatalogCompanyId` |

**FAIL** if get-by-id broader than list rollup (U19).

---

## 12. Journey / UF evidence expectations

| Journey | API proof |
|---------|-----------|
| **J-HRM-PAY-E2-01** | POST salary-components `component_type`=code → 2xx → GET list → F5; invent → 400 `HRM-PAY-TYPE-KEY` |
| **J-HRM-CI-TYPE-E2-01** | POST contracts from **both** surfaces `contract_type`=code → 2xx → F5; invent → 400 `HRM-CON-TYPE-KEY` |
| **J-HRM-07** host | Payroll open — insurance list live/empty; **no** mock NV rows |
| **AC-E2-NOREG-01** | position_key invent still 400; Settings buckets intact |

---

## 13. must_keep / non-goals

| Keep | Non-goal |
|------|----------|
| Baseline payslip/period F.1 | Formula/GL full ERP |
| E1-A position asserts | A9 Candidate |
| E1-B Settings APIs | New sync URL |
| Soft catalog assert | Hard FK catalog UUID |
| Hide tax without API | Invent tax_settlements endpoints this WI |
| Insurance participants wire | E3 full policy master |
