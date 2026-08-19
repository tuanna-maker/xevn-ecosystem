# Menu TC Pack — `XBOS-CATALOG-CC` · Command Center catalog autosave (document · measurement · pricing)

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-CATALOG-CC-DOC` · `XBOS-CATALOG-CC-MEASURE` · `XBOS-CATALOG-CC-PRICE` |
| **surface** | `xbos-cc` (web-portal Command Center) |
| **route(s)** | `/command-center?settings=document` · `?settings=measurement` · `?settings=pricing` |
| **HDSD** | Command Center — Cài đặt → **Hệ thống văn bản/Quy định** · **Hệ thống đo lường/Tiền tệ** · **Thiết lập hệ thống giá** · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` row UF-14 |
| **SRS / FR / UC** | **UC-CC-P0-05** · **FR-CC-P0-05** (`docs/xbos/TECHSPEC.md` § business-master `command_center_catalogs`) |
| **TechSpec** | `docs/xbos/TECHSPEC.md` · `docs/brand-new-documents-20270801/TECH_SPEC_VN.md` (master data CC) |
| **API_CONTRACT** | `GET/PUT …/api/xbos/business-master/command_center_catalogs/items*` · `XBOS-MASTER-200` / `XBOS-MASTER-201` · OpenAPI `docs/api/openapi/xbos-api.yaml` (CcRegulationRow / CcMeasurementRow / CcPricingRow) |
| **UF / J-*** | **UF-XBOS-14** (sole UF in-scope) · **J-XBOS-02** (catalog extension) — *governance approve path:* cross-ref `XBOS-INBOX-CAT.md` §4.2–4.4, **không** lặp inbox/gov TC |
| **author** | qa · PO-ECO-TC-XBOS-CATALOG-CC-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-CATALOG-CC-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Locks** | **U65** — mọi dòng dữ liệu = **Thêm dòng** + edit trên UI; **cấm** seed business-master / probe-only PASS · **cấm** claim UAT DONE · TC status **PLANNED** (design pack) trừ *Prior evidence* |

> Chuẩn: IEEE 829 / ISO 29119 lean · inventory từ `CommandCenterPage.tsx` (settings tabs) · `commandCenterCatalogApi.ts` · debounce **800ms** · `saveAndReloadCcCatalogRows` / partition + flat sync (UF-XBOS-14).

---

## 0. Spec read ack & cross-pack boundary

| Source | Path | Sections used |
|--------|------|----------------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | full structure |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-14 |
| UF trace | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` | AC-UF-XBOS-14 |
| Governance / inbox (cross-ref only) | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` | §4.2 UF-09 · §4.4 UF-15 · §4.3 stub TC-XIC-CC-* → **superseded by TC-CCC-*** |
| Prior browser (reference) | `docs/qa/evidence/p1-qa-uf14-8088-retest-20260620.md` | document/version/F5 — **không** thay execution pack |
| Capability registry | `docs/qa/evidence/screen-action-catalog-map-20260620.md` | `BTN-A8-BUSINESS-MASTER-CRUD` |

**Boundary:** Phê duyệt danh mục HRM (UF-XBOS-09) và extension → gov inbox (UF-XBOS-15) thuộc pack **`XBOS-INBOX-CAT`** (`TC-XIC-CG-*`, `TC-XIC-EXT-*`). Pack này chỉ **master CC** tại holding: `regulations` · `measurements` · `pricing`.

---

## 1. Screen inventory (màn + trạng thái)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-CCC-SHELL** | settings workspace | `/command-center` → sidebar Cài đặt | Khung settings + menu trái + `menuNotice` banner | notice success/error · scope bar |
| **SCR-CCC-DOC** | tab | `?settings=document` | **Hệ thống văn bản/Quy định** — bảng inline autosave | loading · empty dashed · rows |
| **SCR-CCC-MEAS** | tab | `?settings=measurement` | **Hệ thống đo lường/Tiền tệ** | idem |
| **SCR-CCC-PRICE** | tab | `?settings=pricing` | **Thiết lập hệ thống giá** | loading · empty · rows |
| **ST-CCC-LOADING-*** | inline | Mỗi tab khi hydrate | Copy «Đang tải danh mục…» | loading |
| **ST-CCC-EMPTY-*** | inline | `rows.length === 0` | Empty copy + CTA **+ Thêm dòng** | empty (valid U65 start) |
| **BAN-CCC-NOTICE** | banner | autosave fail | «Không lưu danh mục …» (document/measure/pricing) | error |

**Không có** dialog confirm trên mutate catalog CC — autosave debounce only.

**Đếm:** pages/tabs=3 · shell=1 · inline states=2 classes · confirms=0

---

## 2. Field dictionary (đủ mọi trường user thấy)

### 2.1 Settings chrome (navigation)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | notes |
|----------|---------------|-----------|---------|----------|-----------------|-------|
| F-NAV-DOC | Hệ thống văn bản/Quy định | SCR-CCC-SHELL | sidebar item | — | `settings=document` | Icon FileText |
| F-NAV-MEAS | Hệ thống đo lường/Tiền tệ | SCR-CCC-SHELL | sidebar item | — | `settings=measurement` | Icon Coins |
| F-NAV-PRICE | Thiết lập hệ thống giá | SCR-CCC-SHELL | sidebar item | — | `settings=pricing` | Icon Tag |
| F-SEC-SUB-DOC | Danh mục từ XBOS — chỉnh sửa inline, lưu tự động | SCR-CCC-DOC | subtitle | — | AC autosave | SettingSectionHeader |
| F-SEC-SUB-MEAS | Biểu mẫu và bảng nhập liệu — lưu tự động | SCR-CCC-MEAS | subtitle | — | idem | |
| F-SEC-SUB-PRICE | *(section header pricing)* | SCR-CCC-PRICE | subtitle | — | idem | |

### 2.2 Document / regulations (`regulations` partition)

| field_id | UI label | screen_id | control | required | validation / BR | API / DB | format |
|----------|----------|-----------|---------|----------|-----------------|----------|--------|
| F-DOC-COL-CODE | Mã (header) | SCR-CCC-DOC | th | — | display | — | mono input |
| F-DOC-CODE | Mã | SCR-CCC-DOC | input | Y | unique trong bảng FE; BE key `code` | `code` · flat `itemId≈code` | mono |
| F-DOC-COL-TITLE | Tên văn bản | SCR-CCC-DOC | th | — | | | |
| F-DOC-TITLE | Tên văn bản | SCR-CCC-DOC | input | Y | empty title vẫn autosave (observe) | `title` | text VI |
| F-DOC-COL-VER | Version | SCR-CCC-DOC | th | — | | | |
| F-DOC-VER | Version | SCR-CCC-DOC | input | Y | F5 persist (prior evidence) | `version` | text |
| F-DOC-COL-ACT | Hiệu lực | SCR-CCC-DOC | th | — | | | |
| F-DOC-ACT | Hiệu lực | SCR-CCC-DOC | checkbox | N | default **true** on new row | `active` | boolean |

### 2.3 Measurement (`measurements` partition)

| field_id | UI label | screen_id | control | required | API | format |
|----------|----------|-----------|---------|----------|-----|--------|
| F-MEAS-COL-KEY | Metric Key | SCR-CCC-MEAS | th | — | | |
| F-MEAS-KEY | Metric Key | SCR-CCC-MEAS | input | Y | `key` | mono; default `METRIC-{timestamp}` |
| F-MEAS-COL-UNIT | Đơn vị | SCR-CCC-MEAS | th | — | | |
| F-MEAS-UNIT | Đơn vị | SCR-CCC-MEAS | input | N | `unit` | text |
| F-MEAS-COL-CUR | Tiền tệ | SCR-CCC-MEAS | th | — | | |
| F-MEAS-CUR | Tiền tệ | SCR-CCC-MEAS | input | N | `currency` | default **VND** on new row |
| F-MEAS-COL-PREC | Độ chính xác | SCR-CCC-MEAS | th | — | | |
| F-MEAS-PREC | Độ chính xác | SCR-CCC-MEAS | number | N | `precision` | **exempt** thousand group (0–100 style) |

### 2.4 Pricing (`pricing` partition)

| field_id | UI label | screen_id | control | required | API | format |
|----------|----------|-----------|---------|----------|-----|--------|
| F-PRC-COL-CODE | Mã giá | SCR-CCC-PRICE | th | — | | |
| F-PRC-CODE | Mã giá | SCR-CCC-PRICE | input | Y | `priceCode` | mono; default `PRC-{timestamp}` |
| F-PRC-COL-LABEL | Diễn giải | SCR-CCC-PRICE | th | — | | |
| F-PRC-LABEL | Diễn giải | SCR-CCC-PRICE | input | Y | `label` | text VI |
| F-PRC-COL-AMT | Đơn giá | SCR-CCC-PRICE | th | — | | |
| F-PRC-AMT | Đơn giá | SCR-CCC-PRICE | input/number | N | `amount` plain number API | **vi-VN** thousand group while typing if wired; submit plain |

### 2.5 Shared actions (per tab)

| field_id | UI label | screen_id | control | API |
|----------|----------|-----------|---------|-----|
| F-BTN-ADD-ROW | + Thêm dòng | SCR-CCC-* | button | triggers local row → debounce PUT |
| F-NOTICE-SAVE | Không lưu danh mục … | BAN-CCC-NOTICE | banner | PUT/GET fail |

**Đếm fields:** 28 (user-visible controls + headers + nav + notices)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | Precond (U65) | API METHOD path | Success FE+F5 | Fail |
|-------|---------------|-----------|---------------|-----------------|---------------|------|
| **FN-CCC-NAV** | Sidebar catalog menu | SCR-CCC-SHELL | `ceo@xe.vn` group holding | — | URL `?settings=` đúng; tab title đúng | — |
| **FN-CCC-LOAD-DOC** | Mở tab document | SCR-CCC-DOC | holding scope | GET `…/command_center_catalogs/items?companyId=holding` | **200** `XBOS-MASTER-200`; bảng/empty | 409 banner |
| **FN-CCC-LOAD-MEAS** | Mở tab measurement | SCR-CCC-MEAS | idem | GET idem | rows partition `measurements` | 409 |
| **FN-CCC-LOAD-PRICE** | Mở tab pricing | SCR-CCC-PRICE | idem | GET idem | rows partition `pricing` | 409 |
| **FN-CCC-ADD-DOC** | + Thêm dòng | SCR-CCC-DOC | tab active | (local) `createCcRegulationRow()` | Row `QĐ-{ts}`; debounce→PUT | notice |
| **FN-CCC-ADD-MEAS** | + Thêm dòng | SCR-CCC-MEAS | idem | `createCcMeasurementRow()` | `METRIC-{ts}` | idem |
| **FN-CCC-ADD-PRICE** | + Thêm dòng | SCR-CCC-PRICE | idem | `createCcPricingRow()` | `PRC-{ts}` amount 0 | idem |
| **FN-CCC-SAVE-DOC** | Inline edit (any column) | SCR-CCC-DOC | hydrated ref true | PUT partition `regulations` + flat per-row | Reload merge; **F5** values còn | 409/5xx → BAN-CCC-NOTICE |
| **FN-CCC-SAVE-MEAS** | Inline edit | SCR-CCC-MEAS | idem | PUT `measurements` | F5 | idem |
| **FN-CCC-SAVE-PRICE** | Inline edit | SCR-CCC-PRICE | idem | PUT `pricing` | F5; amount numeric | idem |
| **FN-CCC-DEBOUNCE** | *(implicit)* | SCR-CCC-* | edit cell | PUT after **~800ms** idle | 1 PUT burst per pause; no double spam on blur | rapid type → single PUT after pause |
| **FN-CCC-TAB-SWITCH** | Đổi tab catalog | SCR-CCC-SHELL | had edits saving | GET other partition | Tab B load; tab A data persisted (F5 tab A) | stale if save fail |
| **FN-CCC-EMPTY-START** | Empty → Thêm dòng | ST-CCC-EMPTY-* | no rows | PUT first row | First **201/200**; empty copy gone | — |

**must_keep (TechSpec):** không `publishVersionChange` SoT trên domain này · empty list GET hợp lệ · merge flat + partition (`commandCenterCatalogApi`).

**Đếm functions:** 13

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-CCC-<area>-<type>-<nnn>` (CCC = Catalog Command Center)
- **Type:** HP · FD · BD · AU · UX · REG · XREF
- **Precond U65:** ghi «dòng tạo bằng **+ Thêm dòng** trên UI» hoặc «sửa dòng đã có sau login» — **không** seed API/DB
- **Synth map:** `TC-XIC-CC-*` trong `XBOS-INBOX-CAT.md` §4.3 → **TC-CCC-*** tương ứng (dedupe at synth)

### 4.1 Navigation & load (all tabs)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|--------------|----------|-------|------|--------|
| TC-CCC-NAV-HP-001 | HP | FN-CCC-NAV · F-NAV-DOC | ceo@xe.vn | Logged in CC | Cài đặt → **Hệ thống văn bản/Quy định** | URL `?settings=document`; header + subtitle autosave | UI | MANUAL | PLANNED |
| TC-CCC-NAV-HP-002 | HP | F-NAV-MEAS/PRICE | ceo@xe.vn | idem | Lần lượt mở measurement · pricing | Đúng title section; GET **200** each tab | UI | MANUAL | PLANNED |
| TC-CCC-LOAD-UX-001 | UX | ST-CCC-LOADING-* | ceo@xe.vn | Slow network (DevTools) | Mở tab document | «Đang tải danh mục…» rồi bảng/empty; không crash | UI | MANUAL | PLANNED |
| TC-CCC-LOAD-FD-001 | FD | FN-CCC-LOAD-DOC | ceo@xe.vn | Regression scope | GET items wrong `companyId` vs JWT | **409**; banner scope; **không** 🟢 UF-14 | API/UI | probe+MANUAL | PLANNED · *Prior:* R3/R5 409 class |
| TC-CCC-LOAD-FD-002 | FD | FN-CCC-LOAD-DOC | ceo@xe.vn | xbos-api down | Mở tab document | Notice lỗi / empty honest; **không** mock seed rows | UI | MANUAL | PLANNED |

### 4.2 Document (`regulations`)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-CCC-DOC-HP-001 | HP | FN-CCC-SAVE-DOC · F-DOC-VER | ceo@xe.vn | ≥1 row (FE add or existing) | Sửa **Version** → chờ ≥800ms → F5 | PUT **200** `XBOS-MASTER-201`; F5 version còn | UI | PW | PLANNED · *Prior:* `p1-qa-uf14-8088-retest` |
| TC-CCC-DOC-HP-002 | HP | FN-CCC-ADD-DOC | ceo@xe.vn | Tab document | **+ Thêm dòng** → nhập **Tên văn bản** → debounce → F5 | Row persist; GET flat/partition merge có `code` | UI | MANUAL | PLANNED · maps TC-XIC-CC-HP-002 |
| TC-CCC-DOC-HP-003 | HP | F-DOC-ACT | ceo@xe.vn | Row active | Bỏ tick **Hiệu lực** → debounce → F5 | `active:false` on GET | UI | MANUAL | PLANNED |
| TC-CCC-DOC-HP-004 | HP | F-DOC-CODE | ceo@xe.vn | New row | Sửa **Mã** unique → save → F5 | PUT per-row flat sync; list key đổi | UI | MANUAL | PLANNED |
| TC-CCC-DOC-BD-001 | BD | FN-CCC-EMPTY-START | ceo@xe.vn | **Không** seed; bảng trống | Empty copy → **+ Thêm dòng** → nhập tối thiểu Mã+Tên | Empty copy biến mất; first PUT **2xx** | UI | MANUAL | PLANNED · maps TC-XIC-CC-BD-001 |
| TC-CCC-DOC-FD-001 | FD | FN-CCC-SAVE-DOC | ceo@xe.vn | Simulate PUT fail | Sửa cell → BE 500 | BAN-CCC-NOTICE document; giá trị local or rollback per impl | UI | MANUAL | PLANNED |
| TC-CCC-DOC-UX-001 | UX | F-DOC-TITLE | ceo@xe.vn | Row exists | Sửa title nhanh liên tục | Debounce gom 1 PUT; không GET storm | UI | MANUAL | PLANNED |
| TC-CCC-DOC-REG-001 | REG | PUT→GET parity | ceo@xe.vn | After HP-001 | DevTools: PUT then GET list | GET `found=true` for mutated `code`/version — *scope_parity* list↔item | API | probe | PLANNED · D-UF-WEB-XBOS-14-01 class CLOSED on 8088 |

### 4.3 Measurement (`measurements`)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-CCC-MEAS-HP-001 | HP | FN-CCC-SAVE-MEAS · F-MEAS-KEY | ceo@xe.vn | Row FE-added | Sửa **Metric Key** → F5 | Persist partition | UI | MANUAL | PLANNED · maps TC-XIC-CC-HP-003 |
| TC-CCC-MEAS-HP-002 | HP | F-MEAS-UNIT/CUR | ceo@xe.vn | Row exists | Nhập Đơn vị `kg` · Tiền tệ `VND` → F5 | Fields on GET | UI | MANUAL | PLANNED |
| TC-CCC-MEAS-HP-003 | HP | F-MEAS-PREC | ceo@xe.vn | Row exists | Độ chính xác `4` → F5 | Number **4** API; **không** thousand separator | UI | MANUAL | PLANNED |
| TC-CCC-MEAS-BD-001 | BD | FN-CCC-ADD-MEAS | ceo@xe.vn | Empty tab | Thêm dòng → giữ default `METRIC-*` · `precision=2` | Defaults visible; save OK | UI | MANUAL | PLANNED |
| TC-CCC-MEAS-FD-001 | FD | FN-CCC-SAVE-MEAS | ceo@xe.vn | BE error | Edit → fail | Notice «Không lưu danh mục đo lường…» | UI | MANUAL | PLANNED |

### 4.4 Pricing (`pricing`)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-CCC-PRC-HP-001 | HP | FN-CCC-SAVE-PRICE · F-PRC-AMT | ceo@xe.vn | Row FE-added | Nhập **Đơn giá** (vd. 1500000) vi-VN → debounce → F5 | API `amount` plain number; display grouped if wired | UI | MANUAL | PLANNED · maps TC-XIC-CC-HP-004 |
| TC-CCC-PRC-HP-002 | HP | F-PRC-LABEL | ceo@xe.vn | Row exists | Diễn giải tiếng Việt có dấu → F5 | Label persist | UI | MANUAL | PLANNED |
| TC-CCC-PRC-HP-003 | HP | F-PRC-CODE | ceo@xe.vn | New row | Sửa **Mã giá** → F5 | `priceCode` key stable on GET | UI | MANUAL | PLANNED |
| TC-CCC-PRC-BD-001 | BD | FN-CCC-ADD-PRICE | ceo@xe.vn | Empty | Thêm dòng; amount `0` | Row visible; PUT OK | UI | MANUAL | PLANNED |
| TC-CCC-PRC-FD-001 | FD | FN-CCC-SAVE-PRICE | ceo@xe.vn | Invalid amount (if BE validates) | Nhập non-numeric nếu UI cho phép | FE clamp or BE 4xx + notice | UI/API | MANUAL | PLANNED · SPEC_GAP if silent |

### 4.5 Cross-tab · auth · governance cross-ref

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-CCC-X-TAB-001 | HP | FN-CCC-TAB-SWITCH | ceo@xe.vn | Edited document row saved | Switch measurement → back document | Document row unchanged; no cross-partition bleed | UI | MANUAL | PLANNED |
| TC-CCC-X-DEB-001 | BD | FN-CCC-DEBOUNCE | ceo@xe.vn | Row exists | Type 5 chars <800ms apart then stop | Exactly 1 PUT after pause (Network) | UI | MANUAL | PLANNED |
| TC-CCC-AU-001 | AU | holding scope | du-lich.ceo@xe.vn | Member CEO | Mở `?settings=document` | **403/409** or empty đúng scope; **không** mutate holding catalog | UI | MANUAL | PLANNED |
| TC-CCC-XREF-001 | XREF | UF-15→09 chain | ceo@xe.vn | Extension FE (UF-15) | *Không retest gov ở đây* — execute **`TC-XIC-EXT-HP-002`** in `XBOS-INBOX-CAT.md` | Gov approve; **không** yêu cầu CC catalog tab for PASS UF-09 | UI | — | PLANNED · pointer only |
| TC-CCC-REG-001 | REG | `BTN-A8-BUSINESS-MASTER-CRUD` | ceo@xe.vn | Any save HP | Network filter business-master | PUT/GET paths match capability registry | UI | MANUAL | PLANNED |
| TC-CCC-REG-002 | REG | unit jest | ci | — | `commandCenterCatalogApi.test.ts` | merge flat+partition; saveAndReload | UNIT | jest | PLANNED |

**TC count:** 28

---

## 5. Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 13 | 13 | 0 |
| Mutate functions ≥1 FD | 8 | 8 | 0 |
| Required fields ≥1 HP/FD | F-DOC-CODE/TITLE/VER · F-MEAS-KEY · F-PRC-CODE/LABEL | covered in §4.2–4.4 | 0 |
| Empty state ≥1 BD per tab | 3 | DOC/MEAS/PRC BD rows | 0 |
| UF-XBOS-14 ≥6 TC | ≥6 | 22 direct + XREF | 0 |
| Governance inbox | cross-ref only | TC-CCC-XREF-001 | 0 |

---

## 6. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD / UF |
|-------|----------|----------|-----|-----------|
| TC-CCC-DOC-HP-001 | UC-CC-P0-05 | FR-CC-P0-05 · business-master | PUT/GET command_center_catalogs | UF-XBOS-14 |
| TC-CCC-DOC-REG-001 | UC-CC-P0-05 | persist merge | PUT then GET items | AC-UF-XBOS-14 |
| TC-CCC-PRC-HP-001 | UC-CC-P0-05 | pricing partition | PUT pricing | UF-XBOS-14 · vi-VN money |
| TC-CCC-AU-001 | scope ladder ADR | holding vs member | GET items | PILOT scope matrix |
| TC-CCC-XREF-001 | UC-XBOS-CAT-05 | catalog-gov | *(inbox pack)* | UF-09 ← UF-15 |

**PO catalog neo:** UF-XBOS-14 row `USER_FLOW_OPERABILITY_MATRIX.md` · capability `BTN-A8-BUSINESS-MASTER-CRUD`

**Inbox pack supersession (synth):**

| Legacy (XBOS-INBOX-CAT) | This pack |
|-------------------------|-----------|
| TC-XIC-CC-HP-001 | TC-CCC-DOC-HP-001 |
| TC-XIC-CC-HP-002 | TC-CCC-DOC-HP-002 |
| TC-XIC-CC-HP-003 | TC-CCC-MEAS-HP-001 |
| TC-XIC-CC-HP-004 | TC-CCC-PRC-HP-001 |
| TC-XIC-CC-FD-001 | TC-CCC-LOAD-FD-001 |
| TC-XIC-CC-BD-001 | TC-CCC-DOC-BD-001 |

---

## 7. Out of scope / stub

| Item | Reason | TC |
|------|--------|-----|
| Catalog governance approve/reject | Pack `XBOS-INBOX-CAT` | XREF only |
| WF inbox spawn | UF-08 pack | OOS |
| `pnpm seed:*` business-master | U65 | OOS — negative mention |
| HRM catalog publish/pull | UF-HRM / XBOS config sync | OOS this menu |
| Full BPMN / publishVersionChange | Not SoT UF-14 | OOS |

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-catalog-cc-01.md
next_owner: qa-synth
counts: screens=6 fields=28 functions=13 tcs=28
u65_note: Data chỉ từ + Thêm dòng / edit FE — NEVER seed command_center_catalogs
uat_done: false — design pack only
cross_ref: docs/qa/testcases/xbos/XBOS-INBOX-CAT.md (gov path TC-XIC-CG-* / TC-XIC-EXT-*)
```

---

*PO-ECO-TC-XBOS-CATALOG-CC-01 · READY_FOR_SYNTH · 2026-08-03*
