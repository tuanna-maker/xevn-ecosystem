# Menu TC Pack — `XBOS-INBOX-CAT` · Inbox WF + Catalog governance + Catalog CC

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-INBOX-WF` · `XBOS-CATALOG-GOV` · `XBOS-CATALOG-CC` (gộp Wave A) |
| **surface** | `xbos-cc` (web-portal Command Center) |
| **route(s)** | `/command-center` · `/command-center/inbox` · `/command-center?settings=workflow` · `?settings=hrm_catalog_governance` · `?settings=document|measurement|pricing` · `?settings=company_group_hr` · `/catalog-governance` → redirect CC |
| **HDSD** | Command Center CH04 Việc cần xử lý · CH07 Quy trình · Danh mục HRM · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` §UF 8/9/14/15 |
| **SRS / FR / UC** | `docs/brand-new-documents-20270801/SRS_VN.md` §3 WF · UC-XBOS-WF-04/05 · UC-XBOS-CAT-03/05 · UC-CC-P0-05/06 · FR-UC-B03 · FR-UC-H03 |
| **TechSpec** | `docs/brand-new-documents-20270801/TECH_SPEC_VN.md` §2 auth · workflow-engine · catalog-governance · business-master |
| **API_CONTRACT** | `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` §2 Workflows approve/reject · Nest runtime: `XBOS-WF-200` · `XBOS-CAT-201` · `XBOS-MASTER-201` · `HRM-SET-209` |
| **UF / J-*** | **UF-XBOS-08** · **UF-XBOS-09** · **UF-XBOS-14** · **UF-XBOS-15** · J-REC-WF-03 · J-XBOS-02 (catalog extension) |
| **author** | qa · PO-ECO-TC-XBOS-INBOX-CAT-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-INBOX-CAT-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Locks** | **U65** — mọi precond inbox/WF task = tạo từ **luồng FE** (WF Lưu · Gửi duyệt tuyển · Tạo đơn nghỉ · Extension Xác nhận); **cấm** `pnpm seed:*` / seed inbox làm precond PASS · **cấm** claim UAT DONE · Status TC = **PLANNED** (design pack) trừ cột *Prior evidence* |

> Chuẩn: IEEE 829 / ISO 29119 lean · inventory từ `CommandCenterInboxPage.tsx` · `CatalogGovernancePanel.tsx` · `CommandCenterPage.tsx` · `WorkflowTaskDetailDrawer.tsx` · `commandCenterCatalogApi.ts` · `catalogGovernanceApi.ts` · `groupHrCatalogApi.ts`

---

## 0. Spec read ack

| Source | Path | Sections used |
|--------|------|----------------|
| SRS VN | `docs/brand-new-documents-20270801/SRS_VN.md` | §3 hai cấp WF · chống tự duyệt |
| API Contract VN | `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` | §2 POST approve/reject (reject ≥10 ký tự — BE contract) |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-08/09/14/15 |
| BA spine | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` | HP-03 · BR-WF-04 |
| PO catalog neo | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` | TC-HP-03/04/13 · TC-X-03 |
| Prior browser | `docs/qa/evidence/po-e2e-spine-01-qa-w3.md` · `r-spine-web-approve-ux-01-qa.md` · `p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md` | EVIDENCED paths — **không** thay thế TC pack |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-WF-LIST** | page (tab) | `?settings=workflow` · view=list | Danh sách quy trình + mẫu HRM bridge | loading API · empty strict · mock fallback (dev) |
| **SCR-WF-DETAIL** | page (tab) | Chỉnh sửa / Thêm quy trình | Form QT + bảng bước + **WorkflowCanvas** | new/edit · Lưu OK/error |
| **SCR-INBOX-HOME** | rail CC home | `/command-center` | Việc cần xử lý (workflow tasks rail) | empty · load fail · có thẻ |
| **SCR-INBOX-CC** | page | `/command-center/inbox` | Hộp thư workflow-engine đầy trang | loading · empty U65 hint · list |
| **DRW-WF-TASK** | drawer | Mở chi tiết / deep link `wfInstanceId`+`wfTaskId` | Chi tiết instance + bước | loading · fail GET detail · actionable/blocked |
| **POP-WF-REJECT** | confirm | DRW-WF-TASK → Từ chối | «Từ chối nhiệm vụ» + mô tả | cancel · confirm |
| **SCR-CAT-GOV** | page (tab) | `?settings=hrm_catalog_governance` | **CatalogGovernancePanel** two-pane | non-master blocked · inbox 0 · có task |
| **POP-CAT-APPROVE** | confirm | Phê duyệt | «Phê duyệt yêu cầu danh mục» (+ item count) | cancel · confirm |
| **POP-CAT-REJECT** | confirm | Từ chối | «Từ chối yêu cầu danh mục» destructive | cancel · confirm |
| **SCR-CC-DOC** | page (tab) | `?settings=document` | Hệ thống văn bản/Quy định — autosave | loading · empty · rows |
| **SCR-CC-MEAS** | page (tab) | `?settings=measurement` | Hệ thống đo lường/Tiền tệ | idem |
| **SCR-CC-PRICE** | page (tab) | `?settings=pricing` | Thiết lập hệ thống giá | idem |
| **SCR-GROUP-HR** | page (tab) | `?settings=company_group_hr` | Danh mục hồ sơ NS tập đoàn | scope bar · per-entity |
| **DLG-GROUP-HR-CFG** | dialog | Cấu hình chi tiết | Popup khối trường · tabs khối | preview · thêm field |
| **POP-EXT-APPLY** | confirm | Xác nhận (áp dụng) | Submit extension → HRM + spawn gov | cancel · confirm |

**Đếm:** pages/tabs=9 · dialogs/drawers=3 · confirms=4

---

## 2. Field dictionary

### 2.1 Workflow inbox card (`SCR-INBOX-CC` / `SCR-INBOX-HOME`) — cột hiển thị trên thẻ

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API field | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------|-------|
| F-INBOX-PRI | Ưu tiên | SCR-INBOX-CC | badge | — | enum low/medium/high/critical | `priority` mapped | Nhãn VI: Thấp…Khẩn cấp |
| F-INBOX-SRC | Nguồn · module | SCR-INBOX-CC | text | — | `sourceSystem` · `moduleCode` | WF row | vd. xbos-workflow · hrm |
| F-INBOX-TITLE | Tiêu đề task | SCR-INBOX-CC | text | Y | display-ready `display_title`/`subject_title` | `title` | BE-INBOX-01 stamp YCTD |
| F-INBOX-SUB | Phụ đề | SCR-INBOX-CC | text | N | | `subtitle` | |
| F-INBOX-ASSIGNEE | Người nhận | SCR-INBOX-CC | text | Y | = assignee JWT/email | `assigneeName` | filter GET tasks |
| F-INBOX-DUE | Hạn xử lý | SCR-INBOX-CC | datetime | N | **vi-VN** `dd/MM/yyyy HH:mm` | `dueAt` | null → ẩn |
| F-INBOX-BTYPE | Loại nghiệp vụ (data) | SCR-INBOX-CC | `data-business-type` | — | `hrm_leave` → nút **Duyệt** | `business_type` | testid `hdsd-cc-leave-approve` |

### 2.2 Workflow drawer (`DRW-WF-TASK`)

| field_id | UI label | screen_id | control | API |
|----------|----------|-----------|---------|-----|
| F-DRW-INST | Instance | DRW-WF-TASK | text | `instance_id` |
| F-DRW-STATUS | Trạng thái | DRW-WF-TASK | text | instance.status |
| F-DRW-STEPS | Các bước workflow | DRW-WF-TASK | list | tasks[] step_key/status |
| F-DRW-REJ-BTN | Từ chối | DRW-WF-TASK | button | POST `…/reject` |
| F-DRW-APP-BTN | Duyệt / Hoàn thành | DRW-WF-TASK | button | POST `…/complete` `XBOS-WF-200` |

### 2.3 Catalog governance (`SCR-CAT-GOV`)

| field_id | UI label | screen_id | control | required | API |
|----------|---------------|-----------|---------|----------|-----|
| F-CG-INBOX-CNT | Hộp thư (n) | SCR-CAT-GOV | heading | — | GET `catalog-governance/inbox` |
| F-CG-WFNAME | Tên quy trình (card) | SCR-CAT-GOV | text | Y | `workflow_name` |
| F-CG-BATCH | Mã lô | SCR-CAT-GOV | text | Y | `business_id` UUID rút gọn |
| F-CG-HAT | Vai trò mũ | SCR-CAT-GOV | badge | Y | `hat_key` → label VI |
| F-CG-TENANT | Tenant nguồn | SCR-CAT-GOV | mono | N | instance.context.memberTenantId |
| F-CG-COL-CAT | Danh mục (bảng) | SCR-CAT-GOV | th | Y | `catalog_key` → label |
| F-CG-COL-CODE | Mã (bảng) | SCR-CAT-GOV | td mono | Y | `code` |
| F-CG-COL-LABEL | Nhãn (bảng) | SCR-CAT-GOV | td | Y | `label` — **cấm raw key** |
| F-CG-NOTE | Ghi chú duyệt | SCR-CAT-GOV | textarea | N | `review_note` body |

### 2.4 Catalog CC autosave (`SCR-CC-DOC` / `SCR-CC-MEAS` / `SCR-CC-PRICE`)

| field_id | UI label | screen_id | control | required | API / partition |
|----------|---------------|-----------|---------|----------|-----------------|
| F-DOC-CODE | Mã | SCR-CC-DOC | input | Y | `code` · flat item id |
| F-DOC-TITLE | Tên văn bản | SCR-CC-DOC | input | Y | `title` |
| F-DOC-VER | Version | SCR-CC-DOC | input | Y | `version` |
| F-DOC-ACT | Hiệu lực | SCR-CC-DOC | checkbox | N | `active` |
| F-MEAS-KEY | Metric Key | SCR-CC-MEAS | input | Y | `key` |
| F-MEAS-UNIT | Đơn vị | SCR-CC-MEAS | input | N | `unit` |
| F-MEAS-CUR | Tiền tệ | SCR-CC-MEAS | input | N | `currency` default VND |
| F-MEAS-PREC | Độ chính xác | SCR-CC-MEAS | number | N | `precision` — **exempt** thousand group |
| F-PRC-CODE | Mã giá | SCR-CC-PRICE | input | Y | `priceCode` |
| F-PRC-LABEL | Diễn giải | SCR-CC-PRICE | input | Y | `label` |
| F-PRC-AMT | Đơn giá | SCR-CC-PRICE | input/money | N | `amount` · **vi-VN** money format khi nhập |

**Debounce autosave:** ~800ms sau edit → PUT `business-master/command_center_catalogs` partition + flat rows (`saveCcCatalogRows`).

### 2.5 Extension create (`SCR-GROUP-HR` → `DLG-GROUP-HR-CFG`)

| field_id | UI label | screen_id | control | required | API |
|----------|---------------|-----------|---------|----------|-----|
| F-EXT-LABEL | Nhãn field (custom) | DLG-GROUP-HR-CFG | input | Y | `label` in extension item |
| F-EXT-CODE | Mã field (generated) | DLG-GROUP-HR-CFG | read-only/mono | Y | `code` · form `company_group_hr_profile__{block}__*` |
| F-EXT-BLOCK | Khối (tab) | DLG-GROUP-HR-CFG | tab | Y | maps `hrm_employee_*_fields` catalogKey |
| F-EXT-APPLY | Xác nhận (áp dụng) | POP-EXT-APPLY | confirm | Y | POST `…/extension-items` **201** `HRM-SET-209` |

**Đếm fields:** 28 (hiển thị user-facing)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | Precond (U65) | API | Success FE+F5 | Fail codes |
|-------|---------------|-----------|---------------|-----|-------------|------------|
| **FN-WF-PRESET** | Mẫu QT tuyển dụng HRM | SCR-WF-LIST | ceo@xe.vn | PUT/POST workflow-engine definitions | Def active; F5 list có mã | load fail → banner |
| **FN-WF-SAVE** | Lưu (chi tiết QT) | SCR-WF-DETAIL | Form hợp lệ | POST/PUT definitions | Toast «Đã lưu…»; F5 graph còn | 4xx banner |
| **FN-WF-SPAWN** | Gửi duyệt YCTD / spawn (HRM) | HRM embed | WF def FE-created | bridge spawn | Task xuất hiện inbox | SPAWN-MISSING honest |
| **FN-INBOX-RELOAD** | Tải lại | SCR-INBOX-CC | logged in | GET `workflow-engine/tasks` | List refresh | loadFailed banner |
| **FN-INBOX-OPEN** | Mở chi tiết | SCR-INBOX-CC | task pending | GET instance detail | DRW mở | 404 instance |
| **FN-INBOX-QUICK-APP** | Duyệt / Xử lý nhanh | SCR-INBOX-CC | task từ FE spawn | POST `…/complete` | Notice xanh; card biến mất; F5 | 4xx notice đỏ |
| **FN-INBOX-DRW-APP** | Duyệt / Hoàn thành | DRW-WF-TASK | actionable task id | POST complete | Drawer đóng; count↓ | blocked synthetic id |
| **FN-INBOX-REJECT** | Từ chối | DRW-WF-TASK | POP confirm | POST `…/reject` | Task rejected; F5 | 4xx |
| **FN-CG-REFRESH** | Làm mới | SCR-CAT-GOV | master tenant | GET inbox | Count đúng | error message |
| **FN-CG-SELECT** | Chọn card inbox | SCR-CAT-GOV | ≥1 task | GET instance detail | Bảng 3 cột fill | empty selection |
| **FN-CG-APPROVE** | Phê duyệt | SCR-CAT-GOV | task selected | POST `…/approve` **201** `XBOS-CAT-201` | Toast; count↓; F5 | 409 scope |
| **FN-CG-REJECT** | Từ chối | SCR-CAT-GOV | task selected | POST `…/reject` | Row removed / status | 4xx |
| **FN-CC-DOC-SAVE** | Autosave văn bản | SCR-CC-DOC | holding scope | PUT master items | F5 version/code còn | 409 scope |
| **FN-CC-MEAS-SAVE** | Autosave đo lường | SCR-CC-MEAS | idem | PUT | F5 | idem |
| **FN-CC-PRICE-SAVE** | Autosave giá | SCR-CC-PRICE | idem | PUT | F5 | idem |
| **FN-CC-ADD-ROW** | + Thêm dòng | SCR-CC-* | tab active | debounce→PUT | Row mới persist F5 | |
| **FN-EXT-ADD** | Thêm field custom | DLG-GROUP-HR-CFG | member entity selected | — | Field trong list dialog | |
| **FN-EXT-APPLY** | Xác nhận (áp dụng) | POP-EXT-APPLY | ≥1 field delta | POST extension-items | 201 + workflowInstanceId; gov inbox +1 | HRM down 502 |

**Đếm functions:** 18

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-XIC-<area>-<type>-<nnn>` (XIC = XBOS Inbox Cat)
- **Type:** HP · FD · BD · AU · UX · REG
- **Precond U65:** luôn ghi rõ nguồn FE (không seed)

### 4.1 UF-XBOS-08 — Workflow inbox (Duyệt / Từ chối / complete)

| TC-ID | Type | Covers | Persona | Precond (U65) | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------------|--------------|----------|-------|------|--------|
| TC-XIC-WF-HP-001 | HP | FN-WF-PRESET+SAVE | ceo@xe.vn | Chưa có mã `hrm_recruitment_*` | CC → Cài đặt → Hệ thống quy trình → chọn mẫu bridge → **Lưu** → F5 | Def **2xx**; list «đã có»; không seed inbox | UI | PW | PLANNED |
| TC-XIC-WF-HP-002 | HP | FN-WF-SPAWN+INBOX | ceo@xe.vn | TC-XIC-WF-HP-001 + HP-02 FE Gửi duyệt YCTD | HRM Tuyển dụng Gửi duyệt → CC **Hộp thư** | ≥1 thẻ tuyển; stamp title readable | UI | PW | PLANNED · *Prior:* `po-e2e-spine-01-qa-w3` |
| TC-XIC-WF-HP-003 | HP | FN-INBOX-QUICK-APP · UF-08 | ceo@xe.vn | Task pending từ TC-XIC-WF-HP-002 (hoặc leave FE) | `/command-center/inbox` → **Duyệt**/**Xử lý nhanh** → F5 | POST **201** `XBOS-WF-200`; card gone; count↓ | UI | PW | PLANNED · *Prior:* `r-spine-web-approve-ux-01-qa` |
| TC-XIC-WF-HP-004 | HP | FN-INBOX-DRW-APP · leave label | ceo@xe.vn | `hrm_leave` task từ mobile/web leave submit | CC home hoặc inbox → **Mở chi tiết** → **Duyệt** | Label **Duyệt** (not Hoàn thành); 201; F5 | UI | PW | PLANNED · EVIDENCED |
| TC-XIC-WF-HP-005 | HP | FN-INBOX-OPEN · J deep link | ceo@xe.vn | Task exists | **Mở chi tiết** → drawer steps load | GET detail **200**; không dùng instance id làm complete | UI | MANUAL | PLANNED |
| TC-XIC-WF-FD-001 | FD | FN-INBOX-REJECT | ceo@xe.vn | Task pending (FE origin) | Drawer → **Từ chối** → confirm → F5 | POST reject **2xx**; task không còn pending approve | UI | MANUAL | PLANNED |
| TC-XIC-WF-FD-002 | FD | BR-WF-04 self-approve | submitter=approver | User vừa submit task | Inbox → Duyệt task của chính mình | **4xx** / UI chặn; không APPROVED | UI/API | MANUAL | PLANNED · neo TC-HP-04 |
| TC-XIC-WF-BD-001 | BD | empty inbox | ceo@xe.vn | **Không** seed; chưa spawn | Mở `/command-center/inbox` | Verdict **BLOCKED** hoặc empty honest + hint U65; **không** 🟢 UF | UI | MANUAL | PLANNED |
| TC-XIC-WF-AU-001 | AU | inbox scope | du-lich.ceo@xe.vn | Member CEO | Mở inbox rollup tập đoàn | **403/409** hoặc list rỗng đúng scope; không duyệt CT khác | UI | MANUAL | PLANNED |
| TC-XIC-WF-UX-001 | UX | F-INBOX-* columns | ceo@xe.vn | ≥1 card | Quan sát thẻ | Priority VI; title/subtitle; assignee; due format vi-VN | UI | MANUAL | PLANNED |
| TC-XIC-WF-REG-001 | REG | SCR-INBOX-HOME rail | ceo@xe.vn | Same tasks as inbox page | CC home rail vs `/inbox` | Cùng API predicate; action label parity leave | UI | MANUAL | PLANNED |

### 4.2 UF-XBOS-09 — Catalog governance approve

| TC-ID | Type | Covers | Persona | Precond (U65) | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------------|-------|----------|-------|------|--------|
| TC-XIC-CG-HP-001 | HP | FN-CG-APPROVE · UF-09 | ceo@xe.vn | ≥1 gov task từ **FN-EXT-APPLY** (UF-15) hoặc extension lịch sử FE | `?settings=hrm_catalog_governance` → chọn lô → **Phê duyệt** → confirm → F5 | **201** `XBOS-CAT-201`; Hộp thư (n→n-1); bảng **Chức danh/Nhãn** readable | UI | PW | PLANNED · *Prior:* R7-FINAL |
| TC-XIC-CG-HP-002 | HP | POP-CAT-APPROVE copy | ceo@xe.vn | Task ≥1 item in batch | Phê duyệt | Dialog mô tả count; confirmLabel «Phê duyệt» | UI | MANUAL | PLANNED |
| TC-XIC-CG-HP-003 | HP | FN-CG-REFRESH | ceo@xe.vn | After approve | **Làm mới** | GET inbox sync; count khớp | UI | MANUAL | PLANNED |
| TC-XIC-CG-FD-001 | FD | FN-CG-REJECT | ceo@xe.vn | Task pending FE-origin | **Từ chối** → confirm | POST reject **2xx**; toast «Đã từ chối»; F5 | UI | MANUAL | PLANNED |
| TC-XIC-CG-FD-002 | FD | approve 409 scope | ceo@xe.vn | Wrong company JWT (regression) | Approve | **409**; banner; inbox unchanged | API/UI | MANUAL | PLANNED · defect class R7 |
| TC-XIC-CG-BD-001 | BD | empty gov inbox | ceo@xe.vn | No extension submitted | Open gov panel | «Không có tác vụ» — **BLOCKED** UF-09; no seed | UI | MANUAL | PLANNED |
| TC-XIC-CG-AU-001 | AU | master context | member-only user | Not master | Open panel | Message «Chuyển tenant sang Tập đoàn…» | UI | MANUAL | PLANNED |
| TC-XIC-CG-UX-001 | UX | F-CG-COL-* | ceo@xe.vn | Detail open | Inspect table | **Không** raw `job_titles`/`catalog_key` on UI — label VI | UI | MANUAL | PLANNED |

### 4.3 UF-XBOS-14 — Catalog CC autosave

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XIC-CC-HP-001 | HP | FN-CC-DOC-SAVE · UF-14 | ceo@xe.vn | holding scope | `?settings=document` → sửa **Version** → chờ debounce → F5 | PUT **200** `XBOS-MASTER-201`; GET list có `code` | UI | PW | PLANNED · *Prior:* `p1-qa-uf14-8088-retest` |
| TC-XIC-CC-HP-002 | HP | FN-CC-ADD-ROW doc | ceo@xe.vn | Tab document | **+ Thêm dòng** → nhập Mã/Tên → F5 | Row persist partition+flat | UI | MANUAL | PLANNED |
| TC-XIC-CC-HP-003 | HP | FN-CC-MEAS-SAVE | ceo@xe.vn | Tab measurement | Edit **Metric Key** → F5 | Persist | UI | MANUAL | PLANNED |
| TC-XIC-CC-HP-004 | HP | FN-CC-PRICE-SAVE | ceo@xe.vn | Tab pricing | Edit **Đơn giá** (vi-VN) → F5 | Plain number API; display grouped | UI | MANUAL | PLANNED |
| TC-XIC-CC-FD-001 | FD | scope 409 | ceo@xe.vn | Regression | GET items wrong `companyId` | **409** banner; no silent empty | API | probe | PLANNED |
| TC-XIC-CC-BD-001 | BD | empty → add | ceo@xe.vn | No rows | Empty state → Thêm dòng | Empty copy; first save 200 | UI | MANUAL | PLANNED |

### 4.4 UF-XBOS-15 — Extension create → gov inbox

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-XIC-EXT-HP-001 | HP | FN-EXT-* · UF-15 | ceo@xe.vn | Member unit visible | `?settings=company_group_hr` → chọn CT thành viên → **Cấu hình chi tiết** → khối Công việc → **Thêm field custom** → **Xác nhận (áp dụng)** | POST extension **201** `HRM-SET-209`; `workflowInstanceId` present | UI | PW | PLANNED · R7-FINAL |
| TC-XIC-EXT-HP-002 | HP | chain UF-15→09 | ceo@xe.vn | TC-XIC-EXT-HP-001 | Gov inbox → approve batch | UF-09 PASS; HRM catalog stats refresh | UI | PW | PLANNED |
| TC-XIC-EXT-HP-003 | HP | F5 field persist | ceo@xe.vn | After approve | F5 → mở lại dialog khối | Custom **label** còn trong list | UI | MANUAL | PLANNED |
| TC-XIC-EXT-FD-001 | FD | HRM API down | ceo@xe.vn | hrm-api stopped | Apply extension | FE error VI; no fake success | UI | MANUAL | PLANNED |
| TC-XIC-EXT-BD-001 | BD | batch detail rows | ceo@xe.vn | Custom field only | Gov detail table | **Observe:** custom stamp có thể không liệt kê trong batch (P2 R-UF15-BATCH-ROW); F5 dialog là SoT |

### 4.5 Cross / regression

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-XIC-X-REG-001 | REG | Dev seed button hidden prod | `shouldShowWorkflowDevSeedControls()` false on :8088 | No **Seed quy trình (dev)** | PLANNED |
| TC-XIC-X-REG-002 | REG | Capability codes | Approve uses `BTN-A1-INBOX-QUICK` / `BTN-A2-CATALOG-GOV-APPROVE` | Network path matches registry | PLANNED |

**TC count:** 32

---

## 5. Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 18 | 18 | 0 |
| Mutate functions ≥1 FD | 12 | 12 | 0 |
| Required fields ≥1 FD/BD | 15 | via CC/WF/CG cases | 0 |
| Dialogs open/cancel/submit | 4 confirms + 1 drawer | TC-XIC-WF-FD-001 · CG-HP-002 · EXT-HP-001 | 0 |
| UF-XBOS-08/09/14/15 each ≥2 TC | 4 each | 11/8/6/5 | 0 |

---

## 6. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD / UF |
|-------|----------|----------|-----|-----------|
| TC-XIC-WF-HP-003 | UC-XBOS-WF-04 · FR-UC-B03 | WF engine | POST `…/complete` | UF-XBOS-08 · J-REC-WF-03 |
| TC-XIC-WF-FD-002 | SRS §3 BR-WF-04 | WF | approve self | TC-HP-04 catalog |
| TC-XIC-CG-HP-001 | UC-XBOS-CAT-05 | catalog-gov | POST approve | UF-XBOS-09 |
| TC-XIC-CC-HP-001 | UC-CC-P0-05 | business-master | PUT command_center_catalogs | UF-XBOS-14 |
| TC-XIC-EXT-HP-001 | UC-XBOS-CAT-03/01 | settings-catalogs | POST extension-items | UF-XBOS-15 |
| TC-XIC-EXT-HP-002 | UC-XBOS-CAT-05 | bridge | approve | UF-09←15 chain |

**PO catalog neo:** TC-HP-03 · TC-HP-04 · TC-HP-13 · TC-X-03 → mapped to TC-XIC-WF-* / TC-XIC-CG-* / TC-XIC-CC-*

---

## 7. Out of scope / stub

| Item | Reason | TC |
|------|--------|-----|
| `pnpm seed:workflow:inbox` | U65 cấm làm precond | OOS — chỉ negative mention |
| Seed quy trình (dev) button | Dev-only; prod must hide | TC-XIC-X-REG-001 |
| API-only PASS cho UF-08/09 | U63/U76 | Không đủ — cần browser matrix |
| WF canvas full BPMN edit exhaustive | Pack focus UF 08–15 | Partial — TC-XIC-WF-HP-001 only |

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-inbox-cat-01.md
next_owner: qa-synth (PO-ECO-TC-SYNTH wave)
counts: screens=12 fields=28 functions=18 tcs=32
u65_note: Mọi TC inbox/gov precond ghi «task từ FE create/spawn/extension» — NEVER seed inbox
uat_done: false — design pack only
```

---

*PO-ECO-TC-XBOS-INBOX-CAT-01 · READY_FOR_SYNTH · 2026-08-03*
