# Metadata apply → UI propagation matrix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-METADATA-APPLY-BA-MATRIX-01` |
| **from_role** | ba-process |
| **lane** | governance |
| **program** | [`P1-METADATA-APPLY-PROPAGATION-PROGRAM.md`](../program/P1-METADATA-APPLY-PROPAGATION-PROGRAM.md) |
| **trigger** | Sponsor P0: `PUT /api/xbos/infrastructure/settings` **200** (`XBOS-INFRA-201`) nhưng form nhập liệu ĐVTV không đổi sau «Xác nhận (áp dụng)» |
| **generated** | 2026-06-20 |
| **ack_status** | **PASS_TO_PM** |

**Purpose:** Mỗi modal/màn **cấu hình metadata** phải có ≥1 **consumer screen** với thay đổi **nhìn thấy được** sau apply (U63/U65: Network **2xx** + quan sát FE + **F5**). API-only PASS = **FAIL** propagation.

**Legend — `wire_status`**

| Status | Ý nghĩa |
|--------|---------|
| **WIRED** | Consumer đọc cùng SoT (DB/API) sau apply; QA có thể assert label/field mới |
| **GAP** | Apply ghi DB **200** nhưng consumer **không** bind defs / không re-fetch / sai màn |
| **PARTIAL** | Một nhánh consumer OK (vd. preview/inbox) nhưng màn nhập chính thiếu hoặc cần reopen/F5 không documented |

**Legend — `test_layer`:** `uf` = browser apply → consumer visible (bắt buộc E2); `api` = L1 probe only (không đủ nghiệm thu); `unit` = resolver/client-only.

**Persona mặc định QA:** `ceo@xe.vn` / `Xevn@2026` · scope `main` · `:8088` hoặc local `:5175` + stack.

---

## 1. Ma trận propagation (SoT)

| Config surface (modal/menu) | capability_code | Consumer screen(s) | Expected visible change after apply | UC | TechSpec API | AC-ID | test_layer | wire_status |
|----------------------------|-----------------|-------------------|-------------------------------------|-----|--------------|-------|------------|-------------|
| **Hạ tầng cơ sở** → Danh mục nền → **Cấu hình khối & trường** → **Xác nhận (áp dụng)** (`?settings=company_infrastructure`; modal `customFieldDefsByEntity` / `customBlocksByEntity` / `blockTitleOverridesByEntity`) | `ACT-CC-INF-FIELDS-APPLY` *(delta)* | **Cùng menu** → **Điểm hạ tầng** → Thêm/Sửa điểm (`infrastructureView=detail`; `infraForm.customFields`; khối custom + đổi title preset) | Sau apply: toast/feedback success; modal đóng; mở **Thêm/Sửa điểm** cho pháp nhân đã chọn → input custom mới (`visible=true`) + title khối đổi; **F5** vẫn thấy field | **UC-XBOS-INF-01** · **UC-XBOS-INF-02** | `PUT /api/xbos/infrastructure/settings` → **200** `XBOS-INFRA-201`; `GET` same → defs persisted under entity key (`customFieldDefsByEntity.{entityId}`) | **AC-META-PROP-INF-01** | uf | **WIRED** *(consumer = điểm HT, không phải hồ sơ pháp nhân)* |
| **Danh mục hồ sơ nhân sự tập đoàn** → tab ĐVTV → **Cấu hình chi tiết** → **Xác nhận (áp dụng)** (`?settings=company_group_hr`; modal `groupHrCustomFieldDefsByEntity`) | `CC-GROUP-HR-CATALOG-SYNC` | **HRM embed** `/command-center/hrm/employees` → **+ Thêm nhân viên** / **Sửa** (`EmployeeFormDialog`: `getSettingsCatalogsOverview` → `effectiveItems` + `buildDynamicFields`) · **CC** preview modal (**Xem trước biểu mẫu**) | Label/field extension mới trong tab tương ứng (basic/personal/work/…); dynamic field ngoài preset hiện input; **F5** + mở lại dialog vẫn thấy; sync progress «Đang đồng bộ danh mục N/N…» | **UC-CC-P0-07** · **UC-HRM-06** · **HRM-SC-03** | `POST /api/hrm/settings-catalogs/{catalogKey}/extension-items` → **201** `HRM-SET-209` (immediate); optional inbox batch approve **201** `XBOS-CAT-201` | **AC-META-PROP-GHR-01** · **AC-FE-POST-HRM-SC-03** | uf | **PARTIAL** *(HRM form wired; cần reopen dialog/F5; catalog gov path UF-09/15)* |
| **Đơn vị thành viên** → **Chỉnh sửa pháp nhân** → mở **Cấu hình khối & trường** (infra modal `openedFromMenu=company_member_units`) → **Xác nhận (áp dụng)** | `ACT-CC-INF-FIELDS-APPLY` *(delta)* | **Kỳ vọng sponsor:** form **Hồ sơ pháp nhân** (MST, đại diện, địa chỉ, cổ đông) · **Thực tế code:** hint → **Hạ tầng cơ sở → Điểm hạ tầng** only (`infrastructureFieldsConfigUx.ts`) | Sponsor-visible: field custom mới **trên form pháp nhân** sau apply + F5 · Hiện tại: **không** có bind `customFieldDefsByEntity.legal_entity` → `companyForm`; chỉ CTA «Mở màn nhập điểm hạ tầng» | **UC-XBOS-INF-01** · **UC-XBOS-ORG-03** · **UC-CC-P0** | `PUT /api/xbos/infrastructure/settings` → **200** `XBOS-INFRA-201` (defs có thể lưu key `legal_entity` trong spec test) | **AC-META-PROP-LE-01** | uf | **GAP** |
| **Hệ thống Phòng/Ban** → **Danh mục khung** → Chi tiết khung → **Lưu khung** (`?settings=company_dept_system`; `deptSystemForm.enabledOrgGradeLevels` + `gradeTitleLayout`) | `SETTINGS-DEPT-CATALOG` · `BTN-A8-BUSINESS-MASTER-CRUD` | **RACI** tab Nhiệm vụ (`CompanyRaciPanel`: dropdown khung `dept_system_templates`) · **Tham chiếu ORG GRADE** (read-only preview) · **Chưa:** cây **Phòng/Ban** org-units (`?settings=company_dept_system` tree / `BTN-CC-P0-DEPT-SAVE`) | Sau Lưu: tab **Tham chiếu** + RACI binding list template mới / cấp ORG GRADE đổi; **Kỳ vọng nghiệp vụ:** thêm node phòng ban áp layout cấp — **chưa** render `gradeTitleLayout` khi POST org-unit | **UC-CC-P0-05** · **UC-CC-P0-03** · **UC-RACI-04** | `PUT /api/xbos/business-master/dept_system_templates/items` → **200**; consumer `GET` same domain | **AC-META-PROP-DEPT-01** · **AC-ACT-DEPT-CAT-01** | uf | **GAP** *(RACI/preview wired; org-unit tree consumer missing)* |
| **Hạ tầng cơ sở** → tab **Danh mục nền** → **FoundationCategoryWizard** (full-screen) bước **2 Phạm vi** + bước **3 Khối/trường** → **Xác nhận & áp dụng** / **Lưu nháp** (`foundationCategories[].appliesToCompanyIds` + optional `customFieldDefsByEntity`) · *legacy:* inline detail + **Lưu danh mục nền* | `ACT-CC-INF-FOUNDATION-SCOPE` · `ACT-CC-INF-FOUNDATION-WIZARD` *(delta BA-01)* | **Điểm hạ tầng** Thêm/Sửa: `resolveInfraScopedRecord` + banner «pháp nhân ngoài phạm vi» (`isOperatingEntityInFoundationScope`); list DM chỉ row persisted (không draft `—` / `0 pháp nhân`) | Wizard save: list cột phạm vi chip ≥1 entity; pháp nhân bỏ khỏi scope → cảnh báo + custom fields ẩn; thêm vào scope → fields merge; **F5** giữ `appliesToCompanyIds`; UF **AC-UF-INF-FCAT-01..03** | **UC-XBOS-INF-01** · **UC-XBOS-INF-03** · **UC-XBOS-CC-07** | `PUT /api/xbos/infrastructure/settings` `{ foundationCategories }` → **200** `XBOS-INFRA-201`; resolver `infrastructureEntityKeyResolver.ts` | **AC-META-PROP-FND-01** · **AC-UF-INF-FCAT-03** | uf | **WIRED** *(config surface → wizard BA-01; consumer unchanged)* |

---

## 2. AC chi tiết (pass/fail đo được)

### AC-META-PROP-INF-01 — Infra custom fields → điểm hạ tầng

| # | Given | When | Then (PASS) | FAIL |
|---|-------|------|-------------|------|
| 1 | Đ logged CC · menu **Hạ tầng cơ sở** · DM nền đã gán pháp nhân X | Thêm field label `QA-META-INF-{ts}` visible → **Xác nhận (áp dụng)** | Network `PUT …/infrastructure/settings` **200** `XBOS-INFRA-201`; toast success; modal đóng | 4xx/5xx; modal im lặng |
| 2 | Tiếp bước 1 | **Thêm/Sửa điểm** pháp nhân X | Input label `QA-META-INF-{ts}` hiển thị đúng khối | Field không xuất hiện dù GET defs có |
| 3 | Tiếp bước 2 | **F5** · mở lại cùng điểm | Field + giá trị đã nhập (nếu có) còn | Mất field sau reload |

### AC-META-PROP-GHR-01 — Group HR metadata → form NV HRM

| # | Given | When | Then (PASS) | FAIL |
|---|-------|------|-------------|------|
| 1 | Tab **Danh mục hồ sơ nhân sự** · ĐVTV X · **Cấu hình chi tiết** | Thêm field `QA-META-GHR-{ts}` → **Xác nhận (áp dụng)** | `POST …/extension-items` **201** `HRM-SET-209`; nút «Đang đồng bộ…»; modal đóng | 500 sync; scope 409 |
| 2 | Tiếp bước 1 | Mở HRM **Nhân sự** → **Thêm nhân viên** (hoặc Sửa) | Label/field xuất hiện (tab/block đúng catalogKey) | Chỉ API có item; dialog static |
| 3 | Tiếp bước 2 | **F5** · mở lại dialog | Field còn | Chỉ session state CC |

### AC-META-PROP-LE-01 — Infra apply từ ĐVTV → form pháp nhân *(GAP — FAIL until FE-02)*

| # | Given | When | Then (PASS — target) | FAIL (hiện tại) |
|---|-------|------|---------------------|-----------------|
| 1 | **Đơn vị thành viên** → **Chỉnh sửa** pháp nhân X · mở **Cấu hình khối & trường** | Apply field `QA-META-LE-{ts}` **200** | Field xuất hiện trên form **Hồ sơ pháp nhân** (cùng tab) sau apply + F5 | Chỉ PUT OK; form MST/đại diện không đổi |
| 2 | Cùng session | Quan sát UX post-apply | Deep-link hoặc inline refresh form pháp nhân | Chỉ hint «Mở màn nhập điểm hạ tầng» |

**Root cause (code):** `customFieldDefsByEntity` chỉ feed `infraForm` (`company_infrastructure`), không feed `companyForm` (`CommandCenterPage.tsx` ~2345–2357 vs ~1472+). BE spec có key `legal_entity` (`infrastructure.controller.spec.ts`) — FE consumer thiếu.

### AC-META-PROP-DEPT-01 — Khung phòng ban → consumer

| # | Given | When | Then (PASS) | FAIL |
|---|-------|------|-------------|------|
| 1 | **Hệ thống Phòng/Ban** → tạo/sửa khung · bật cấp ORG GRADE mới | **Lưu khung** **200** | Tab **Tham chiếu** + list khung cập nhật | 404 domain |
| 2 | Tiếp bước 1 | Member unit → **RACI** | Dropdown khung có template mới | Template missing |
| 3 | **Phòng/Ban** org-units tree | **Thêm** node cấp mới | UI gợi ý title theo `gradeTitleLayout` *(target SRS)* | Tree không đổi layout — **GAP** |

### AC-META-PROP-FND-01 — Phạm vi danh mục nền

| # | Given | When | Then (PASS) | FAIL |
|---|-------|------|-------------|------|
| 1 | DM nền gán {A}; custom field trên DM | **FoundationCategoryWizard** bước 2–3 → **Xác nhận & áp dụng** (hoặc legacy **Lưu danh mục nền**) **200** | GET `foundationCategories` có `appliesToCompanyIds`; list không row draft `—` / `0 pháp nhân` | Scope không persist; list polluted |
| 2 | Điểm HT pháp nhân **B** ∉ scope | Mở Thêm/Sửa điểm | Banner cảnh báo; custom fields category ẩn | Fields vẫn hiện |
| 3 | Thêm **B** vào scope · Lưu wizard · mở lại điểm B | Apply scope | Custom fields hiện theo `resolveInfraScopedRecord` | Alias holding/member lệch |

**QA UF wizard (BA-01):** **AC-UF-INF-FCAT-01** (create full flow) · **AC-UF-INF-FCAT-02** (cancel/validation) · **AC-UF-INF-FCAT-03** (edit scope propagation) — `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` §7.

---

## 3. Business rules (propagation)

| BR-ID | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-META-PROP-01** | Apply modal trả **2xx** | Consumer phải re-read SoT (refetch GET hoặc invalidate query) trước render form | PASS UF; FAIL nếu chỉ React local state |
| **BR-META-PROP-02** | Config surface ≠ consumer route | UI phải CTA deep-link tới consumer **hoặc** bind inline | FAIL nếu im lặng (sponsor P0 class) |
| **BR-META-PROP-03** | `openedFromMenu=company_member_units` + infra defs | Không claim «form ĐVTV đã cập nhật» khi consumer là `company_infrastructure` | GAP row LE-01 |
| **BR-META-PROP-04** | Group HR sync `HRM-SET-209` | HRM `EmployeeFormDialog` đọc `effectiveItems` active | PARTIAL nếu thiếu reopen |
| **BR-META-PROP-05** | `foundationCategories.appliesToCompanyIds` đổi | `isOperatingEntityInFoundationScope` + merge keys alias (`main`/holding) | WIRED tại điểm HT |

---

## 4. GAP summary (dispatch W2/W3)

| Row | GAP class | Owner wave | work_item hint |
|-----|-----------|------------|----------------|
| Legal entity member form | Config saves `customFieldDefsByEntity` · consumer form static | dev-fe | `P1-METADATA-CONSUMER-PARITY-FE-02` — bind legal profile OR split modal copy |
| Dept templates → org-units | `gradeTitleLayout` saved · tree POST không đọc template | dev-fe + BA delta UC-CC-P0-03 | Same program W3 |
| Group HR | HRM wired · strict UF cần dialog reopen + optional cat-gov approve | qa | `P1-METADATA-APPLY-QA-8088` |
| Infra apply UX | `applyInfrastructureFieldsConfig` đã có busy/toast/close/reload — verify trên `:8088` | qa | `P1-METADATA-APPLY-UX-FE-01` retest |

**Không regression 🟢:** UF-XBOS-03 legal PUT; UF-XBOS-04/05 shareholders; infra point CRUD khi consumer đúng màn.

---

## 5. Traceability

| Artifact | Link |
|----------|------|
| Program exit E1 | This file |
| Code — infra resolver | `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` |
| Code — infra apply | `CommandCenterPage.tsx` `applyInfrastructureFieldsConfig` |
| Code — member hint | `apps/web/web-portal/src/integrations/infrastructureFieldsConfigUx.ts` |
| Code — HRM consumer | `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` |
| Code — group HR sync | `apps/web/web-portal/src/integrations/groupHrCatalogApi.ts` |
| Action catalog | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` §6–§7 |
| FE post-mutation delta | `docs/program/governance/p1-fe-post-mutation-ac-ba-delta-20260620.md` |
| Foundation category wizard UX | `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` (`P1-INFRA-FCAT-WIZARD-BA-01`) |

---

## 6. Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Published propagation matrix **5** mandatory rows + **3** GAP / **1** PARTIAL flagged; AC **AC-META-PROP-*-01** (5) with pass/fail tables; BR-META-PROP-01..05; root cause sponsor P0 documented (infra defs ≠ legal entity form). |
| **residual** | Delta capability codes `ACT-CC-INF-FIELDS-APPLY`, `ACT-CC-INF-FOUNDATION-SCOPE` chưa trong `capabilityActionRegistry.ts`; SRS UC-XBOS-INF-01 thiếu AC FE propagation (chỉ AC-U18-INF-01 API). |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-METADATA-APPLY-UX-FE-01 — entry: docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md + sponsor P0 GAP row AC-META-PROP-LE-01. Dispatch dev-fe: (1) Infra apply feedback parity on :8088 (Loader2, toast, close, consumer nav hint already in code — verify + fix gaps). (2) Do NOT bind legal entity until product decision: either wire customFieldDefs to companyForm OR rename modal scope + SRS. exit_criteria: AC-META-PROP-INF-01 browser PASS; LE-01 documented UX path (CTA or inline). evidence: docs/qa/evidence/p1-metadata-apply-fe-20260620.md ack READY_FOR_QA.` |
| **evidence_path** | `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md` |
| **ack_status** | **PASS_TO_PM** |
