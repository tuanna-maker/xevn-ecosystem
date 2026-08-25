# PO-HRM-CTR-CREATE-CATALOG-PARITY-01 — Catalog partition & dual-source parity (tạo HĐ)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-CATALOG-PARITY-01` |
| **parent** | PM audit tạo HĐ 400 (`HRM-CON-TYPE-KEY`, `HRM-CON-POS-KEY`) · tenant `xevn` · `HRM_TENANT_ONLY_SCOPE=true` |
| **lane** | dev-be · dev-fe · ba-process |
| **change_mode** | **FIX** — đồng bộ assert catalog BE với picker FE; không dual-SoT mới |
| **status** | **IMPLEMENTED** (local dev 2026-08-24) |
| **Date** | 2026-08-24 |
| **honesty** | `contracts_printable_ready=false` · payroll_e2e_ready=false |
| **must_keep** | BR-CD-F5-01 (lương off body HĐ) · CORE-02 C&B SoT `compensation_packages` · `resolveHrmSettingsCatalogCompanyId` parity với Settings GET |
| **cấm** | Gộp `employees.salary` public DTO làm SoT lương · seed làm evidence UAT |

---

## 1. Vấn đề

### 1.1 `HRM-CON-TYPE-KEY` — loại HĐ có trên picker, POST 400

| Layer | Partition catalog | Ghi chú |
|-------|-------------------|---------|
| **FE picker** | `holding` | `GET /settings-catalogs` qua `resolveHrmSettingsCatalogCompanyId` (Group CEO `main`→`holding`) |
| **BE assert (trước fix)** | `main` | `assertConContractType` dùng `companyId` từ `resolveHrmPersistCompanyIdText` (tenant-only → `main`) |

**Triệu chứng:** Picker hiển thị `HDLD_XDHN_12` nhưng `POST /contracts-insurance/contracts` → `400 HRM-CON-TYPE-KEY`.

**Fix:** Mọi assert catalog trong `ContractsInsuranceService` dùng `resolveCatalogCompanyId()` = `resolveHrmSettingsCatalogCompanyId(authorization, tenantId, companyId)` — cùng partition với Settings overview/items.

### 1.2 `HRM-CON-POS-KEY` / `HRM-CON-DEPT-KEY` — phòng ban HRM ≠ catalog

| Nguồn | API / bảng | Ví dụ |
|-------|------------|-------|
| **HRM org chart** | `GET /departments` → `public.departments` | `PHONG_QLPT` (tab Công ty → Phòng ban) |
| **Settings catalog** | `GET /settings-catalogs` → `departments` | Mã sync XBOS (có thể thiếu mã chỉ tạo trên HRM) |

**FE picker (central):** `departmentPickerOptions` = `loadCompanyDepartments()` = **HRM ∪ catalog** (`mergeDepartmentCatalogRows` — HRM thắng khi trùng mã).

**BE assert (trước fix):** Chỉ `assertCodeInEffectiveCatalog(departments)` → từ chối `PHONG_QLPT`.

**Fix:** `assertConDepartmentKey()` — catalog trước, fallback `public.departments` trong scope (`pushDepartmentTableScopeFilters`). Mã lỗi riêng: `HRM-CON-DEPT-KEY` (không dùng `HRM-CON-POS-KEY` cho phòng ban).

### 1.3 Lương NV = 0 nhưng form HĐ thấy 5.700.000

**Không phải bug partition** — thiết kế tách vòng C&B (xem §2).

---

## 2. SoT lương — không đọc từ hồ sơ công khai

| Màn hình | Nguồn | Field |
|----------|-------|-------|
| Hồ sơ NV (public GET) | `mapPublicEmployee` + `filterPublicCustomFields` | **Không** trả lương (AC-CORE-PUB-02) |
| Tab **Đãi ngộ** / compensation API | `employee_compensation_packages` + `lines` | `base`, `si_base`, allowances |
| Form tạo HĐ — card C&B | `GET …/contract-create-context` → `compensation_snapshot` **hoặc** bootstrap 2 ô | `base_salary_vnd`, `insurance_salary_vnd` |
| Tab **Lương** (EmployeeSalary) | Payroll payslips | Phiếu lương đã chạy — **không** phải lương cơ bản |

**Quy tắc:**

- `BR-CD-F5-01` — cấm `salary` trên body `employee_contracts`.
- Bootstrap trong wizard (BR-CTR-CB-BOOT-01) → `POST compensation-packages` — reuse SoT CORE-02, không invent cột mới.
- HR thấy số trên form HĐ nhưng hồ sơ NV = 0 → kiểm tra tab **Hợp đồng → Đãi ngộ** hoặc trạng thái `bootstrap` chưa lưu gói.

**Tham chiếu:** `PO-HRM-CTR-CB-INIT-FLOW-SPEC-01` · `BA-CTR-INSURANCE-SALARY-SOURCE-01` · `SA-CTR-INSURANCE-SALARY-SOURCE-01`.

---

## 3. Thay đổi code (traceability)

### 3.1 BE — `contracts-insurance.service.ts`

| Method | Thay đổi |
|--------|----------|
| `resolveCatalogCompanyId()` | Wrapper `resolveHrmSettingsCatalogCompanyId` |
| `assertConContractType` / `assertConPositionKey` / … | `companyId` → catalog partition |
| `assertConDepartmentKey()` | Catalog ∪ `public.departments` |
| `lookupHrmDepartmentKeyInScope()` | SQL scope parity `DepartmentsService` |

**Export mới:** `HRM_CON_DEPT_KEY = 'HRM-CON-DEPT-KEY'`.

### 3.2 FE

| File | Thay đổi |
|------|----------|
| `contractCreateWizardState.ts` | `contract_type` chỉ gửi mã catalog; chặn khi catalog trống |
| `ContractCreateWizardDialog.tsx` | `console` dev + log POST lỗi |
| `apiError.ts` | Friendly `HRM-CON-TYPE-KEY`, `HRM-CON-DEPT-KEY`, `HRM-CTR-*` |
| `useSettingsCatalogsOverview.ts` | `departmentPickerOptions` central (đã có — tham chiếu) |

### 3.3 QA script

`scripts/qa/verify-contract-create.mjs` — smoke POST `HDLD_XDHN_12` + partition notes.

### 3.4 Tests

`be-erp-e2-01.spec.ts` — `main` persist → `holding` catalog assert; `PHONG_QLPT` department HRM fallback.

---

## 4. AC regression (manual)

| ID | Steps | Expected |
|----|-------|----------|
| AC-CTR-CAT-PAR-01 | Group CEO `xevn`/`main` · tạo HĐ · chọn `HDLD_XDHN_12` từ picker | POST **201** |
| AC-CTR-DEPT-PAR-01 | Chọn phòng ban chỉ có trên tab **Phòng ban** HRM (vd. `PHONG_QLPT`) | POST **201** · `department_key` persisted |
| AC-CTR-CB-DISPLAY-01 | NV chưa có gói C&B | Card **bootstrap** 2 ô; hồ sơ public **không** hiện lương |
| AC-CTR-CB-DISPLAY-02 | Sau Lưu HĐ bootstrap | Tab **Đãi ngộ** hiện cùng `base_salary_vnd` |

---

## 5. OPEN (không scope fix này)

- Auto-sync `public.departments` → catalog `departments` (XBOS apply) — cần work item riêng.
- Hiển thị placeholder hồ sơ NV thay vì `0` khi chưa có gói C&B — UX follow-up.

---

## 6. Evidence

`docs/qa/evidence/po-hrm-ctr-create-catalog-parity-01.md`
