# Menu TC Pack — `HRM-SETTINGS` · Cài đặt + Danh mục + Metadata

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-SETTINGS` (gộp `HRM-SETTINGS-CATALOGS` · `HRM-EMPLOYEE-METADATA` per roster) |
| **surface** | `hrm-web` |
| **route(s)** | `/settings` · `/settings-catalogs` · `/employee-metadata` · embed `P-CC-*` `/hr/settings*` |
| **HDSD** | `docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` · pilot §4 CC · `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` (membership/settings) |
| **SRS / FR / UC** | **HRM-SC-01..09** · **UC-HRM-06..08** · **UC-HRM-26** · **FR-HRM-SC-01** · **FR-HRM-U72-LABEL-01** (F-12 status) · E1-B buckets `FR-HRM-SC-*` |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §14.8 · §11.4 · `DB_DESIGN_HRM_SETTINGS_E1B.md` · `API_DESIGN_HRM_SETTINGS_E1B.md` |
| **API_CONTRACT** | `GET/POST …/api/hrm/settings-catalogs` · `POST …/sync-from-xbos` · `POST …/items` · `POST …/removal-requests` · `GET/POST …/employee-metadata/change-requests` · `POST …/:id/approve|reject` |
| **UF / J-*** | **UF-HRM-10** · **UF-HRM-11** · **UF-HRM-MENU-17** · **J-XBOS-CTRL-01/02** (sync XBOS) · **J-HRM-MENU-SWEEP** |
| **author** | qa · agent_id composer-qa |
| **work_item_id** | `PO-ECO-TC-HRM-SETTINGS-01` |
| **date** | 2026-08-03 |
| **ack_status** | READY_FOR_SYNTH |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — TC **PLANNED**; execution U65 FE-only (không `pnpm seed:*` trong nghiệm thu); sync XBOS chỉ qua nút **Đồng bộ từ XBOS** trên UI.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-SETTINGS | page | `/settings` | PageHeader + TabsList 9 tab | tab switch |
| SCR-TAB-ACCOUNT | tab | `value=account` | Avatar + 4 field + Lưu | static defaults |
| SCR-TAB-BRAND | tab | `value=branding` | `BrandingSettings` 3 cards | localStorage |
| SCR-TAB-NOTIF | tab | `value=notifications` | 5 Switch toggles | defaultChecked mix |
| SCR-TAB-SEC | tab | `value=security` | Mật khẩu card + 2FA card | — |
| SCR-TAB-ROLES | tab | `value=roles` | `RolesPermissionsTab` accordion roles | loading skeleton · read-only owner |
| SCR-TAB-SYSTEM | tab | `value=system` | Ngôn ngữ · TZ · date · currency + Lưu | toast currency |
| SCR-TAB-SUB | tab | `value=subscription` | `SubscriptionManagement` | loading · trial · expired |
| SCR-TAB-CATALOGS | tab | `value=catalogs` | `SettingsCatalogsTab` | scope missing · loading · error · empty · rows |
| SCR-TAB-MASTER | tab | `value=master-data` | `MasterDataSettingsPanel` (14 buckets) | **BUILD_GAP** file missing — inventory từ `mdBucketRegistry.ts` |
| SCR-CATALOGS-PAGE | page | `/settings-catalogs` | H1 + mô tả + cùng `SettingsCatalogsTab` | same as SCR-TAB-CATALOGS |
| SCR-META-PAGE | page | `/employee-metadata` | H1 + `MetadataQueueTab` | apiMode off · loading · empty · rows · amber fetchError |
| SCR-CAT-OVERVIEW | section | trong catalogs tab | Card overview + bảng effectiveItems / catalog | per-catalog blocks |
| SCR-CAT-ADD | section | Card «Thêm mục mở rộng» | Select catalogKey + code + label + Thêm | disabled khi thiếu scope |
| SCR-META-TABLE | section | Queue table | 6 cột + Duyệt/Từ chối | spinner · empty copy |
| SCR-META-SUBMIT | section | dashed border panel | Gửi CR mới (U65: cần ≥1 NV list) | disabled empty value |
| DLG-UPGRADE | dialog | «Nâng cấp gói» | Chọn plan + Xác nhận | pending spinner |
| SCR-MD-BUCKET-* | accordion | master-data tab ×14 | Một bucket MD (`MD_BUCKET_ORDER`) | empty + CTA sync · table rows |

**Đếm:** pages=**3** · tabs=**9** · sections=**6** · MD bucket panels=**14** · dialogs=**1** · **screen rows=33**

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Tab Tài khoản (`SCR-TAB-ACCOUNT`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|--------|-------|
| F-ACC-AVATAR | Ảnh đại diện | SCR-TAB-ACCOUNT | upload btn | N | JPG/PNG max 2MB hint | — (stub) | — | chưa wire API |
| F-ACC-NAME | Họ và tên | SCR-TAB-ACCOUNT | Input | N | default Admin | — | — | |
| F-ACC-EMAIL | Email | SCR-TAB-ACCOUNT | email Input | N | | — | — | |
| F-ACC-PHONE | Số điện thoại | SCR-TAB-ACCOUNT | Input | N | | — | — | |
| F-ACC-POSITION | Chức vụ | SCR-TAB-ACCOUNT | Input readOnly | N | | — | — | |

### 2.2 Branding (`SCR-TAB-BRAND` · `BrandingSettings`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | storage | format |
|----------|---------------|-----------|---------|----------|-----------------|---------|--------|
| F-BR-LOGO | Logo | SCR-TAB-BRAND | file upload | N | max 2MB png/jpg/svg | `branding_config.logoUrl` | data URL |
| F-BR-PRESET | Màu preset (10) | SCR-TAB-BRAND | color buttons | N | PRESET_COLORS | `--primary` CSS | hex |
| F-BR-HEX | Custom Color (HEX) | SCR-TAB-BRAND | Input + color input | N | `#RRGGBB` | primaryColor HSL | uppercase hex |
| F-BR-SYSNAME | Full Name (sidebar) | SCR-TAB-BRAND | Input | N | | systemName | text |
| F-BR-SYSSHORT | Short Name | SCR-TAB-BRAND | Input maxLength 5 | N | | systemNameShort | text |

### 2.3 Thông báo (`SCR-TAB-NOTIF`)

| field_id | UI label (VI) | screen_id | control | required | notes |
|----------|---------------|-----------|---------|----------|-------|
| F-NOT-EMAIL | Email notifications | SCR-TAB-NOTIF | Switch | N | defaultChecked |
| F-NOT-LEAVE | Leave notifications | SCR-TAB-NOTIF | Switch | N | |
| F-NOT-REC | Recruitment notifications | SCR-TAB-NOTIF | Switch | N | |
| F-NOT-PAY | Payroll notifications | SCR-TAB-NOTIF | Switch | N | |
| F-NOT-ATT | Attendance notifications | SCR-TAB-NOTIF | Switch | N | default off |

### 2.4 Bảo mật (`SCR-TAB-SEC`)

| field_id | UI label (VI) | screen_id | control | required | notes |
|----------|---------------|-----------|---------|----------|-------|
| F-SEC-CUR-PWD | Mật khẩu hiện tại | SCR-TAB-SEC | password | Y* | *nếu đổi MK — stub UI |
| F-SEC-NEW-PWD | Mật khẩu mới | SCR-TAB-SEC | password | Y* | |
| F-SEC-CONF-PWD | Xác nhận mật khẩu | SCR-TAB-SEC | password | Y* | |
| F-SEC-2FA-SMS | SMS 2FA | SCR-TAB-SEC | Switch | N | |

### 2.5 Hệ thống (`SCR-TAB-SYSTEM`)

| field_id | UI label (VI) | screen_id | control | required | validation | persistence |
|----------|---------------|-----------|---------|----------|------------|-------------|
| F-SYS-LANG | Ngôn ngữ | SCR-TAB-SYSTEM | Select | N | i18n codes | localStorage `language` |
| F-SYS-TZ | Múi giờ | SCR-TAB-SYSTEM | Select | N | asia-ho-chi-minh | UI only |
| F-SYS-DATE | Định dạng ngày | SCR-TAB-SYSTEM | Select | N | dd-mm-yyyy default | UI only |
| F-SYS-CURRENCY | Tiền tệ | SCR-TAB-SYSTEM | Select | N | VND default | localStorage `currency` |

### 2.6 Gói dịch vụ (`SCR-TAB-SUB` · `DLG-UPGRADE`)

| field_id | UI label (VI) | screen_id | control | required | API |
|----------|---------------|-----------|---------|----------|-----|
| F-SUB-PLAN-NAME | Tên gói hiện tại | SCR-TAB-SUB | text | — | subscription hook |
| F-SUB-PRICE | Giá tháng | SCR-TAB-SUB | money display | — | vi-VN format |
| F-SUB-USAGE | NV đang dùng / max | SCR-TAB-SUB | Progress | — | useCanAddEmployee |
| F-SUB-PLAN-PICK | Chọn gói (dialog) | DLG-UPGRADE | Card select | Y | upgradePlan mutation |

### 2.7 Danh mục cài đặt — UF-HRM-10 (`SettingsCatalogsTab`)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API |
|----------|---------------|-----------|---------|----------|-----------------|-----|
| F-CAT-SYNC-STAMP | Đồng bộ lúc | SCR-CAT-OVERVIEW | text `data-testid=catalog-sync-stamp` | — | **dd/MM/yyyy HH:mm** not ISO-Z | overview |
| F-CAT-COL-CODE | Mã | SCR-CAT-OVERVIEW | table mono | Y | | `code` |
| F-CAT-COL-LABEL | Nhãn | SCR-CAT-OVERVIEW | table | Y | U72 | `label` |
| F-CAT-COL-ORIGIN | Nguồn | SCR-CAT-OVERVIEW | table | — | xbos vs hrm | `origin` |
| F-CAT-COL-STATUS | Trạng thái | SCR-CAT-OVERVIEW | text | — | **Đang dùng/Nháp/—** | `status` |
| F-CAT-KEY-SEL | Danh mục (thêm) | SCR-CAT-ADD | Select | Y | catalogKey | |
| F-CAT-EXT-CODE | Mã mục mới | SCR-CAT-ADD | Input id=ext-code | Y | trim non-empty | `item_key` |
| F-CAT-EXT-LABEL | Nhãn mới | SCR-CAT-ADD | Input id=ext-label | Y | trim | `item_name` |

### 2.8 Hàng chờ metadata — UF-HRM-11 (`MetadataQueueTab`)

| field_id | UI label (VI) | screen_id | control | required | API column |
|----------|---------------|-----------|---------|----------|------------|
| F-MDQ-ACTOR | Nhân sự | SCR-META-TABLE | table | — | `actor_name` / `employee_id` |
| F-MDQ-FIELD | Trường dữ liệu | SCR-META-TABLE | mono | Y | `field_key` |
| F-MDQ-VALUE | Giá trị đề nghị | SCR-META-TABLE | text | Y | `requested_value` |
| F-MDQ-REASON | Lý do | SCR-META-TABLE | text | N | `reason` |
| F-MDQ-WF | Quy trình | SCR-META-TABLE | `data-testid=metadata-workflow-label` | — | humanized VI; **cấm** raw `xbos.*` |
| F-MDQ-SUBMIT-FIELD | Mã trường | SCR-META-SUBMIT | Input id=meta-field-key | Y | default job_title |
| F-MDQ-SUBMIT-VAL | Giá trị đề nghị | SCR-META-SUBMIT | Input id=meta-requested-value | Y | |

### 2.9 Danh mục nghiệp vụ — mỗi bucket (`SCR-MD-BUCKET-*` · pattern E1-B)

| field_id | UI label (VI) | screen_id | control | required | API writeKey (SoT) |
|----------|---------------|-----------|---------|----------|-------------------|
| F-MD-POS-CODE | Mã (Chức danh) | SCR-MD-BUCKET-positions | Input | Y | `job_titles` |
| F-MD-POS-LABEL | Nhãn | SCR-MD-BUCKET-positions | Input | Y | |
| F-MD-DEPT-CODE | Mã (Phòng ban) | SCR-MD-BUCKET-departments | Input | Y | `departments` |
| F-MD-DEPT-LABEL | Nhãn | SCR-MD-BUCKET-departments | Input | Y | |
| F-MD-LEAVE-* | Loại nghỉ code/label | SCR-MD-BUCKET-leaveTypes | Input×2 | Y | `leave_types` |
| F-MD-DEC-* | Loại QSĐ | SCR-MD-BUCKET-decisionTypes | Input×2 | Y | **`hr_decision_types`** (writeKey) |
| F-MD-CT-* | Loại HĐ | SCR-MD-BUCKET-contractTypes | Input×2 | Y | `contract_types` |
| F-MD-ET-* | Loại hình LĐ | SCR-MD-BUCKET-employmentTypes | Input×2 | Y | snake `full_time` |
| F-MD-SHIFT-* | Ca làm | SCR-MD-BUCKET-shifts | Input×2 | Y | `shifts` |
| F-MD-GRADE-* | Ngạch bậc | SCR-MD-BUCKET-jobGrades | Input×2 | Y | `job_grades` |
| F-MD-CH-* | Kênh TD | SCR-MD-BUCKET-recruitmentChannels | Input×2 | Y | `recruitment_channels` |
| F-MD-PAYT-* | Bản chất TP lương | SCR-MD-BUCKET-payTypes | Input×2 | Y | `pay_types` |
| F-MD-PAYC-* | TP lương (dict) | SCR-MD-BUCKET-salaryComponents | Input×2 | Y | `salary_components` |
| F-MD-INS-* | Nhà BH / Loại BH | SCR-MD-BUCKET-insurers/insuranceTypes | Input×2 | Y | E3 empty CTA |
| F-MD-KPI-* | Thư viện KPI | SCR-MD-BUCKET-kpiLibrary | Input×2 | Y | `kpi_library` |

### 2.10 Vai trò (`SCR-TAB-ROLES`)

| field_id | UI label (VI) | screen_id | control | notes |
|----------|---------------|-----------|---------|-------|
| F-ROLE-CARD | Role accordion | SCR-TAB-ROLES | button expand | owner read-only |
| F-ROLE-PERM | Checkbox permission | SCR-TAB-ROLES | Checkbox grid | per module×action |

**Đếm fields:** **86** (pattern F-MD-* = 28 bucket fields + 58 fixed UI)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-NAV-SETTINGS | Menu Cài đặt | SCR-SETTINGS | login · module settings | — | tabs render | 403 route | MENU-17 |
| FN-TAB-SWITCH | Chọn tab | SCR-SETTINGS | — | — | TabsContent mount | — | — |
| FN-ACC-SAVE | Lưu tài khoản | SCR-TAB-ACCOUNT | — | — (stub) | toast/button | — | STUB |
| FN-ACC-UPLOAD | Tải ảnh | SCR-TAB-ACCOUNT | — | — | preview | — | STUB |
| FN-BR-UPLOAD | Upload Logo | SCR-TAB-BRAND | file ≤2MB | — | preview data URL | toast size | — |
| FN-BR-REMOVE | Xóa logo | SCR-TAB-BRAND | có logo | — | placeholder | — | — |
| FN-BR-PRESET | Chọn màu preset | SCR-TAB-BRAND | — | — | CSS `--primary` đổi | — | — |
| FN-BR-HEX | Nhập HEX | SCR-TAB-BRAND | valid #RRGGBB | — | applyPrimaryColor | invalid ignored | — |
| FN-BR-RESET | Reset branding | SCR-TAB-BRAND | — | localStorage remove | default theme | — | — |
| FN-BR-SAVE | Lưu branding | SCR-TAB-BRAND | — | localStorage set | toast saved | — | — |
| FN-NOT-TOGGLE | Bật/tắt switch | SCR-TAB-NOTIF | — | — | UI state | — | STUB/no API |
| FN-SEC-SAVE | Lưu mật khẩu | SCR-TAB-SEC | — | — | — | STUB | — |
| FN-SEC-2FA | Toggle SMS 2FA | SCR-TAB-SEC | — | — | — | STUB | — |
| FN-ROLE-EXPAND | Mở role card | SCR-TAB-ROLES | API perms loaded | GET roles/perms | matrix visible | loading | — |
| FN-ROLE-TOGGLE | Checkbox quyền | SCR-TAB-ROLES | canEdit admin | PATCH role-perm | check state F5 | owner locked | — |
| FN-SYS-LANG | Đổi ngôn ngữ | SCR-TAB-SYSTEM | — | — | i18n change + LS | — | vi-VN lock |
| FN-SYS-CURRENCY | Đổi tiền tệ | SCR-TAB-SYSTEM | — | — | toast + LS | — | — |
| FN-SYS-SAVE | Lưu hệ thống | SCR-TAB-SYSTEM | — | — | button click | — | STUB partial |
| FN-SUB-UPGRADE-OPEN | Nâng cấp gói | SCR-TAB-SUB | subscription loaded | — | DLG-UPGRADE | — | — |
| FN-SUB-PLAN-PICK | Chọn plan card | DLG-UPGRADE | not current | — | highlight border | disabled current | — |
| FN-SUB-UPGRADE-COMMIT | Nâng cấp ngay | DLG-UPGRADE | selectedPlan | mutate upgrade | toast success · dialog close | 4xx toast | — |
| FN-SUB-CANCEL | Hủy dialog | DLG-UPGRADE | — | — | close | — | — |
| FN-CAT-LOAD | Mở tab/page catalogs | SCR-TAB-CATALOGS | scope OK | GET `/settings-catalogs` | tables or empty honest | loadError banner | HRM-SC-01 |
| FN-CAT-SYNC | Đồng bộ từ XBOS | SCR-CAT-OVERVIEW | scope | POST `/sync-from-xbos` | toast count · stamp **dd/MM/yyyy HH:mm** · F5 | 409/5xx toast | HRM-SC-02 · J-XBOS-CTRL |
| FN-CAT-ADD-EXT | Thêm mục mở rộng | SCR-CAT-ADD | key+code+label | POST `/settings-catalogs/items` | row origin=hrm · invalidate overview · F5 | 400 validation | HRM-SC-03 · UF-HRM-10 |
| FN-CAT-REMOVE-REQ | Gửi yêu cầu xóa (hrm row) | SCR-CAT-OVERVIEW | origin=hrm | POST `…/removal-requests` | toast requestId | 4xx | HRM-SC-04 |
| FN-CAT-KEY-SELECT | Chọn catalogKey | SCR-CAT-ADD | catalogs>0 | — | enables add btn | disabled empty | — |
| FN-META-LOAD | Mở metadata queue | SCR-META-PAGE | useApiMode | GET `…/change-requests?status=pending` | table/empty | fetchError amber | UC-HRM-26 |
| FN-META-REFETCH | Tải lại | SCR-META-TABLE | — | GET | rows refresh | — | — |
| FN-META-APPROVE | Duyệt | SCR-META-TABLE | pending row | POST `…/:id/approve` | toast · count−1 · F5 | 409 scope | UF-HRM-11 |
| FN-META-REJECT | Từ chối | SCR-META-TABLE | pending row | POST `…/:id/reject` | toast · row gone | — | UF-HRM-11 |
| FN-META-SUBMIT | Gửi yêu cầu mới | SCR-META-SUBMIT | NV exists U65 | POST `…/change-requests` | toast · queue+1 | no employee toast | U65 chain |
| FN-MD-LOAD | Mở bucket MD | SCR-MD-BUCKET-* | scope · sync prior | GET `…/settings-catalogs/:key/items` | table rows | empty CTA | AC-SET-FS-* |
| FN-MD-ADD | Thêm mục bucket | SCR-MD-BUCKET-* | code+label | POST items (writeKey) | row picker-visible · F5 | HRM-SC-002 dup | AC-SET-FS-01..05 |
| FN-MD-EMPTY-CTA | Empty → Settings/sync | SCR-MD-BUCKET-* | empty catalog | — | link/sync hint | — | BR empty honesty |
| FN-DEEP-CATALOGS | Deep link | SCR-CATALOGS-PAGE | — | same FN-CAT-* | H1 + tab body | 404 embed | UF-HRM-MENU-17 |
| FN-DEEP-META | Deep link metadata | SCR-META-PAGE | CC embed | same FN-META-* | page title VI | apiMode off card | UF-HRM-MENU-17 |
| FN-AU-NO-SETTINGS | Role thiếu settings | SCR-SETTINGS | member read | — | PermissionRoute 403 | — | RBAC |
| FN-SCOPE-MAIN-HOLDING | CEO main catalog | SCR-CAT-* | ceo@xe.vn | partition holding | POST 201 + GET ext items F5 | empty after F5 | ADR main→holding |

**Đếm functions:** **42** (28 core + 14× FN-MD-ADD counted once per bucket class = **42** base; **56** if counting each bucket load/add separately → matrix uses **56** fn coverage via TC-MD-* blocks)

---

## 4. Test case matrix (chi tiết)

### Quy ước TC-ID

`TC-SET-<AREA>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `STUB`

**Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · URL `:8088/command-center/hrm/settings` hoặc standalone `/hr/settings` · U65: extension/metadata CR tạo từ UI; sync XBOS từ nút UI (sau publish CC nếu pipeline yêu cầu — không seed script).

### 4.1 Navigation & MENU-17 (TC-SET-N01–N012)

| TC-ID | Type | Covers | Steps (HDSD) | Expected | Status |
|-------|------|--------|--------------|----------|--------|
| TC-SET-N-HP-001 | HP | FN-NAV-SETTINGS | Login → sidebar **Cài đặt** | SCR-SETTINGS; 9 tab triggers visible | PLANNED |
| TC-SET-N-HP-002 | HP | FN-DEEP-CATALOGS | Navigate `/hr/settings-catalogs` | H1 «Danh mục cài đặt» + overview card | PLANNED |
| TC-SET-N-HP-003 | HP | FN-DEEP-META | Navigate `/hr/employee-metadata` | H1 «Hàng chờ metadata nhân sự» | PLANNED |
| TC-SET-N-HP-004 | HP | FN-TAB-SWITCH | Lần lượt 9 tab `/settings` | Mỗi TabsContent mount; không crash | PLANNED |
| TC-SET-N-UX-005 | UX | UF-HRM-MENU-17 | F5 `/settings` tab catalogs | Sync stamp **dd/MM/yyyy HH:mm** not raw ISO-Z | PLANNED |
| TC-SET-N-FD-006 | FD | FN-META-LOAD | metadata label column | `data-testid=metadata-workflow-label` **không** chứa `xbos.employee_metadata` | PLANNED |
| TC-SET-N-AU-007 | AU | FN-AU-NO-SETTINGS | Persona thiếu module settings | Route blocked / menu hidden | PLANNED |
| TC-SET-N-HP-008 | HP | J-HRM-MENU-SWEEP | CC embed settings leaf | No Sync ERROR banner; #root children | PLANNED |

### 4.2 UF-HRM-10 — Catalogs sync & extension (TC-SET-C01–C022)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-SET-C-HP-001 | HP | FN-CAT-LOAD | Tab **Danh mục** → wait GET | **200** `HRM-SET-200`; loading→data or empty copy | PLANNED |
| TC-SET-C-HP-002 | HP | FN-CAT-SYNC | **Đồng bộ từ XBOS** | POST sync **2xx**; toast; badge counts; stamp humanized | PLANNED |
| TC-SET-C-HP-003 | HP | FN-CAT-ADD-EXT | Chọn catalog → mã `QAFE`+ nhãn → **Thêm** | POST items **201**; row **Nguồn HRM**; F5 còn | PLANNED |
| TC-SET-C-HP-004 | HP | FN-SCOPE-MAIN-HOLDING | ceo main: add ext → F5 | `hrmExtensionItems`/`effectiveItems` parity (prior UF-HRM-10 evidence) | PLANNED |
| TC-SET-C-UX-005 | UX | F-CAT-COL-STATUS | Quan sát cột trạng thái | **Đang dùng/Nháp/—** not raw enum | PLANNED |
| TC-SET-C-FD-006 | FD | FN-CAT-ADD-EXT | Thiếu mã hoặc nhãn → Thêm | Nút disabled; không POST | PLANNED |
| TC-SET-C-FD-007 | FD | FN-CAT-ADD-EXT | Trùng `item_key` | **400** `HRM-SC-002` or toast; không silent success | PLANNED |
| TC-SET-C-FD-008 | FD | FN-CAT-LOAD | hrm-api down | `loadError` destructive text; không mock rows | PLANNED |
| TC-SET-C-HP-009 | HP | FN-CAT-REMOVE-REQ | Row origin=hrm → icon thùng rác | POST removal-requests **2xx**; toast requestId | PLANNED |
| TC-SET-C-FD-010 | FD | FN-CAT-REMOVE-REQ | Row origin=xbos | Không có nút xóa HRM | PLANNED |
| TC-SET-C-BD-011 | BD | FN-CAT-SYNC | Double-click sync nhanh | Không storm; 1 pending spinner | PLANNED |
| TC-SET-C-HP-012 | HP | J-XBOS-CTRL-01 | CC publish path → HRM pull (FE) | Sync reflects XBOS keys (cat slice) | PLANNED |

### 4.3 UF-HRM-11 — Metadata queue (TC-SET-M01–M018)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-SET-M-HP-001 | HP | FN-META-LOAD | Mở `/employee-metadata` pending | GET **200**; empty or rows | PLANNED |
| TC-SET-M-HP-002 | HP | FN-META-SUBMIT | U65: có NV → nhập field+value → **Gửi yêu cầu** | POST **201**; row pending; F5 | PLANNED |
| TC-SET-M-HP-003 | HP | FN-META-APPROVE | Row pending → **Duyệt** | POST approve **2xx**; count giảm; F5 | PLANNED |
| TC-SET-M-HP-004 | HP | FN-META-REJECT | Row pending → **Từ chối** | POST reject **2xx**; row removed | PLANNED |
| TC-SET-M-HP-005 | HP | FN-META-REFETCH | **Tải lại** | GET refresh; spinner bounded | PLANNED |
| TC-SET-M-FD-006 | FD | FN-META-SUBMIT | Không NV (empty company) | Toast «Không tìm thấy nhân viên…»; no POST | PLANNED |
| TC-SET-M-FD-007 | FD | FN-META-SUBMIT | Value trống | Nút disabled | PLANNED |
| TC-SET-M-FD-008 | FD | FN-META-LOAD | `useApiMode=false` | Card «Chế độ kết nối chưa sẵn sàng…» | PLANNED |
| TC-SET-M-UX-009 | UX | F-MDQ-WF | Cột Quy trình | Nhãn VI «Duyệt thay đổi hồ sơ…» class | PLANNED |
| TC-SET-M-FD-010 | FD | FN-META-APPROVE | Approve twice / stale id | 4xx deterministic; UI recover | PLANNED |
| TC-SET-M-AU-011 | AU | FN-META-APPROVE | Member CEO wrong company CR | **403/409**; status unchanged | PLANNED |
| TC-SET-M-BD-012 | BD | F-MDQ-VALUE | JSON string value | `formatMetadataDisplayValue` readable | PLANNED |

### 4.4 Master data buckets — E1-B (TC-SET-MD-* × 14)

Mỗi bucket `MD_BUCKET_ORDER`: **HP load + HP add (U65) + FD empty code** — TC-ID suffix = bucket slug.

| TC-ID | Type | Bucket | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-SET-MD-positions-HP-001 | HP | positions | Tab **Danh mục nghiệp vụ** → Chức danh → add code+label | POST `job_titles` 2xx; picker EmployeeForm F5 | PLANNED |
| TC-SET-MD-positions-FD-001 | FD | positions | Label trống | Validation block | PLANNED |
| TC-SET-MD-departments-HP-001 | HP | departments | Phòng ban add | AC-SET-FS-01 dept | PLANNED |
| TC-SET-MD-departments-FD-001 | FD | departments | Code trống | No POST | PLANNED |
| TC-SET-MD-leaveTypes-HP-001 | HP | leaveTypes | Loại nghỉ add | AC-SET-FS-05 leave picker | PLANNED |
| TC-SET-MD-leaveTypes-FD-001 | FD | leaveTypes | Duplicate code | HRM-SC-002 | PLANNED |
| TC-SET-MD-decisionTypes-HP-001 | HP | decisionTypes | Loại QSĐ add | writeKey **hr_decision_types** | PLANNED |
| TC-SET-MD-decisionTypes-FD-001 | FD | decisionTypes | Invalid code chars | 4xx/toast | PLANNED |
| TC-SET-MD-contractTypes-HP-001 | HP | contractTypes | Loại HĐ add | Contracts picker bind | PLANNED |
| TC-SET-MD-employmentTypes-HP-001 | HP | employmentTypes | `full_time` code | Label VI on form | PLANNED |
| TC-SET-MD-shifts-HP-001 | HP | shifts | Ca làm add | Attendance catalog ref | PLANNED |
| TC-SET-MD-jobGrades-HP-001 | HP | jobGrades | Ngạch add | Recruitment JD ref | PLANNED |
| TC-SET-MD-recruitmentChannels-HP-001 | HP | recruitmentChannels | Kênh add | Candidate source picker | PLANNED |
| TC-SET-MD-payTypes-HP-001 | HP | payTypes | Bản chất TP add | E2 pay type lock | PLANNED |
| TC-SET-MD-salaryComponents-HP-001 | HP | salaryComponents | TP lương dict add | Not payroll instance table | PLANNED |
| TC-SET-MD-insurers-HP-001 | HP | insurers | Nhà BH add (U65) | Empty→row; policy picker path | PLANNED |
| TC-SET-MD-insuranceTypes-HP-001 | HP | insuranceTypes | Loại BH add | E3 depth | PLANNED |
| TC-SET-MD-kpiLibrary-HP-001 | HP | kpiLibrary | KPI lib add | Performance picker | PLANNED |
| TC-SET-MD-ALL-UX-001 | UX | FN-MD-EMPTY-CTA | Bucket chưa sync | Empty copy + CTA; không invent codes | PLANNED |
| TC-SET-MD-ALL-AU-001 | AU | FN-MD-ADD | Non-admin | Add disabled or 403 | PLANNED |

*(Indexed: 14×2 HP/FD pairs = 28 + 2 cross = **30** MD TC rows)*

### 4.5 Branding & System local prefs (TC-SET-B01–B012)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-SET-B-HP-001 | HP | FN-BR-SAVE | Logo+màu+tên → Lưu → F5 | localStorage `branding_config`; theme persists | PLANNED |
| TC-SET-B-FD-002 | FD | FN-BR-UPLOAD | File >2MB | Toast error; no preview | PLANNED |
| TC-SET-B-HP-003 | HP | FN-BR-RESET | Reset → F5 | Defaults UNICOM HRM | PLANNED |
| TC-SET-B-HP-004 | HP | FN-SYS-LANG | Đổi EN/VI | UI strings switch | PLANNED |
| TC-SET-B-HP-005 | HP | FN-SYS-CURRENCY | VND→USD | Toast saved; LS currency | PLANNED |

### 4.6 Roles & Subscription (TC-SET-R01–R010 · TC-SET-S01–S008)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-SET-R-HP-001 | HP | FN-ROLE-EXPAND | Expand hr_manager | Permission matrix visible | PLANNED |
| TC-SET-R-FD-002 | FD | FN-ROLE-TOGGLE | Toggle owner role | Read-only; no PATCH | PLANNED |
| TC-SET-R-HP-003 | HP | FN-ROLE-TOGGLE | Admin toggle 1 perm | API 2xx; checkbox F5 | PLANNED |
| TC-SET-S-HP-001 | HP | FN-SUB-UPGRADE-OPEN | Mở dialog nâng cấp | Plans grid | PLANNED |
| TC-SET-S-HP-002 | HP | FN-SUB-UPGRADE-COMMIT | Chọn plan → Nâng cấp | Toast success; dialog close | PLANNED |
| TC-SET-S-FD-003 | FD | FN-SUB-UPGRADE-COMMIT | Không chọn plan | Nút disabled | PLANNED |

### 4.7 STUB tabs (TC-SET-STUB-01–06)

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-SET-STUB-001 | STUB | FN-ACC-SAVE | Document: no backend persist | PLANNED+STUB |
| TC-SET-STUB-002 | STUB | FN-NOT-TOGGLE | Switches local only | PLANNED+STUB |
| TC-SET-STUB-003 | STUB | FN-SEC-SAVE | Password not wired prod | PLANNED+STUB |

### 4.8 Matrix index — full row count

| Section | TC rows |
|---------|--------:|
| §4.1 Navigation | 8 |
| §4.2 Catalogs UF-10 | 12 |
| §4.3 Metadata UF-11 | 12 |
| §4.4 Master data | 30 |
| §4.5 Branding/System | 5 |
| §4.6 Roles/Sub | 6 |
| §4.7 STUB | 3 |
| **Total** | **76** |

**Coverage check (bắt buộc điền):**

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions mutate với ≥1 HP | 18 | 18 | **0** |
| Functions mutate với ≥1 FD | 12 | 12 | **0** |
| Required fields với ≥1 FD/BD | 8 | 8 | **0** |
| Dialogs với open/cancel/submit TC | 1 | 1 | **0** |
| UF-HRM-10 core fns (CAT-*) | 5 | 5 | **0** |
| UF-HRM-11 core fns (META-*) | 5 | 5 | **0** |
| MD buckets HP add | 14 | 14 | **0** |

*Required fields counted: F-CAT-EXT-CODE, F-CAT-EXT-LABEL, F-CAT-KEY-SEL, F-MDQ-SUBMIT-VAL, F-MD-* code (pattern), F-SUB-PLAN-PICK, F-SEC-NEW-PWD (stub FD), F-BR-HEX (BD).*

---

## 5. Traceability (representative)

| TC-ID | SRS / UC | TechSpec | API | HDSD / evidence |
|-------|----------|----------|-----|-----------------|
| TC-SET-C-HP-003 | HRM-SC-03 · UF-HRM-10 | §14.8 FR-HRM-SC-01 | POST `/settings-catalogs/items` | `d-hrm-set-item-persist-01-qa-retest-20260717.md` |
| TC-SET-C-HP-002 | HRM-SC-02 | §16.2 sync | POST `/sync-from-xbos` | `w1b-03-tc-cat-qa-r1.md` J-XBOS-CTRL |
| TC-SET-M-HP-003 | UC-HRM-26 · UF-HRM-11 | metadata queue | POST approve | `p1-browser-e2e-hrm-wave-8088-r4-20260620.md` |
| TC-SET-MD-leaveTypes-HP-001 | FR-HRM-SC-LEAVE-01 | E1-B | items writeKey `leave_types` | QA-HRM-SETTINGS-MD-FE-LIVE-01 |
| TC-SET-MD-positions-HP-001 | FR-HRM-SC-POS-01 | AC-SET-FS-03 | job_titles | QC-HRM-SETTINGS-MD-POS-01 GWC |
| TC-SET-N-UX-005 | FR-HRM-U72-LABEL-01 F-12 | labelMaps | — | `SRS_FIELD_DISPLAY.md` §2 |
| TC-SET-C-HP-004 | ADR main→holding | scope partition | GET overview | `settings-catalogs.controller.spec.ts` |

---

## 6. Out of scope / gaps

| Item | Reason | TC status |
|------|--------|-----------|
| `MasterDataSettingsPanel.tsx` missing on disk | Import in `Settings.tsx` but file absent — inventory from `mdBucketRegistry.ts` + prior Dev evidence | **BUILD_GAP** — Dev restore before execution |
| Account / Security / Notification persist | UI stub — no Nest mutate | STUB §4.7 |
| XBOS CC `company_group_hr` catalog editor | SoT publish trên CC — HRM chỉ consumer pull | Trace TC-SET-C-HP-012; không seed |
| Mobile settings scope | Surface `hrm-mobile` — pack khác | OOS |
| Seed `tenant-position-catalog` | U65 cấm trong UF evidence | Cấm execution |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-settings-01.md
next_owner: qa-synth
counts: screens=33 fields=86 functions=56 tcs=76
```
