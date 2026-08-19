# Menu TC Pack — `XBOS-WF-DESIGNER` · Hệ thống quy trình (Workflow designer)

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-WF-DESIGNER` |
| **surface** | `xbos-cc` (web-portal Command Center) |
| **route(s)** | `/command-center?settings=workflow` · deep link `&wfInstanceId=` (read-only overlay — inbox-owned, xem §7) |
| **HDSD** | Command Center CH04 §4.2 Quy trình · `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 (CH04 §4.2) · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` UF-XBOS-08 **Bước 1** |
| **SRS / FR / UC** | `docs/brand-new-documents-20270801/SRS_VN.md` §3 WF hai cấp · UC-XBOS-13 · UC-XBOS-WF-01/02 · UC-XBOS-CC-06 · FR-UC-B03 |
| **TechSpec** | `docs/brand-new-documents-20270801/TECH_SPEC_VN.md` · `docs/xbos/TECHSPEC.md` §11 · §14.8 · FR-XBOS-WF-01 |
| **API_CONTRACT** | `docs/brand-new-documents-20270801/API_CONTRACT_VN.md` · OpenAPI `docs/api/openapi/xbos-api.yaml` `/workflow-engine/definitions*` → `XBOS-WF-201` / `XBOS-WF-200` · BR-WF-01 |
| **UF / J-*** | **UF-XBOS-08** (create/save leg) · **J-XBOS-10** (U34 list consumer sync) · **J-REC-WF-01** (Lưu QT tuyển dụng) · Inbox approve leg → **cross-ref** `XBOS-INBOX-CAT.md` |
| **author** | qa · PO-ECO-TC-XBOS-WF-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-WF-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Locks** | **U65** — mọi task inbox downstream phải có nguồn **tạo/lưu WF hoặc spawn HRM từ FE**; **cấm** `pnpm seed:*` / seed inbox làm precond PASS · **cấm** claim UAT DONE · Status TC = **PLANNED** (design pack) trừ cột *Prior evidence* |

> Chuẩn: IEEE 829 / ISO 29119 lean · Inventory từ prior browser/HDSD evidence (`p1-xbos-w7-wf-audit` · `qa-rec-hdsd-coverage-01c` · `p1-s1-fe-02-workflow-canvas`) — **không** trùng inbox approve matrix (pack **`XBOS-INBOX-CAT`**).

---

## 0. Spec read ack

| Source | Path | Sections used |
|--------|------|----------------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 · Wave B WI |
| Mental model | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` | §3 Quy trình · §7 J-XBOS-10 |
| Journey map | `docs/program/PROGRAM_JOURNEY_MAP.md` | J-XBOS-10 · J-REC-WF-01 |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | UF-XBOS-08 §3 |
| PO catalog | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` | TC-HP-01 · TC-HP-03 (chain only) |
| Inbox pack (cross-ref) | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` | SCR-WF-LIST/DETAIL §1–3 · TC-XIC-WF-* **không copy** |
| Prior browser | `docs/qa/evidence/p1-xbos-w7-wf-audit-20260606.md` · `p1-xbos-w7-wf-qa-retest-20260606.md` · `p1-browser-e2e-xbos-r5-8088-20260620.md` | create/save paths |
| Scope ADR | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` | `companyId=main` on definitions |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-WF-LIST** | page (tab) | `?settings=workflow` · view=list | Bảng quy trình + CTA **Thêm quy trình mới** | loading · empty strict · API error banner · rows |
| **SCR-WF-DETAIL** | page (tab) | **Thêm quy trình mới** / **Chỉnh sửa** | Form metadata + bảng bước + tab canvas | new (`workflowEditId=new`) · edit · saving · validation banner |
| **SCR-WF-TAB-FORM** | tab/section | SCR-WF-DETAIL default | «Cấu hình bước & luồng» + grid bước | scaffold **Bước 1** on new |
| **SCR-WF-TAB-GRAPH** | tab | **Sơ đồ luồng** | **WorkflowCanvas** — **Bắt đầu** · bước · **Hoàn thành** | no instances on new · runtime badges when instance selected |
| **CARD-WF-HRM-PRESET** | card | SCR-WF-LIST | **Mẫu QT tuyển dụng HRM (bridge)** · `data-testid=hrm-rec-wf-presets` | present/absent (deploy gap R-REC-C-BRIDGE-01) |
| **POP-WF-DEV-SEED** | button (dev) | SCR-WF-LIST when dev flag | **Seed quy trình (dev)** | must be **hidden** on :8088 prod-like |
| **SCR-WF-INST-OVERLAY** | read-only | `wfInstanceId` query on CC | Instance preview on canvas — **owned by inbox journey** | loading · fail GET |

**Đếm:** pages/tabs=4 · cards=1 · dev-only control=1 · read-only overlay=1

**L2.5 designer:** SCR-WF-LIST → **Chỉnh sửa** → SCR-WF-DETAIL → **Quay lại danh sách** → row vẫn mở đúng mã.

---

## 2. Field dictionary

### 2.1 SCR-WF-LIST — cột bảng

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API field | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------|-------|
| F-WF-LST-CODE | Mã quy trình | SCR-WF-LIST | text/mono | Y (display) | unique per tenant | `definitionKey` / `workflowCode` | sortable |
| F-WF-LST-NAME | Tên quy trình | SCR-WF-LIST | text | Y | display-ready | `name` | |
| F-WF-LST-STATUS | Trạng thái | SCR-WF-LIST | badge | N | active/draft | `status` | Hiệu lực / Nháp (label VI) |
| F-WF-LST-INST-CNT | Phiên chạy | SCR-WF-LIST | number | N | from instances API | derived count | **exempt** thousand group |
| F-WF-LST-ACT-EDIT | (action) | SCR-WF-LIST | button **Chỉnh sửa** | — | — | — | L2.5 entry |

### 2.2 SCR-WF-DETAIL — metadata

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API field | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------|-------|
| F-WF-CODE | Mã quy trình | SCR-WF-DETAIL | input/textarea | **Y** | empty → **400** `workflowCode and name required` | `definitionKey` POST body | audit W7 |
| F-WF-NAME | Tên quy trình | SCR-WF-DETAIL | input/textarea | **Y** | paired with code | `name` | |
| F-WF-STATUS | Trạng thái | SCR-WF-DETAIL | select/toggle | N | active spawns inbox on create (BE) | `status: active` | R5 spawn evidence |
| F-WF-DESC | Mô tả (nếu có) | SCR-WF-DETAIL | textarea | N | — | payload meta | optional UI |

### 2.3 SCR-WF-TAB-FORM — bảng bước («Cấu hình bước & luồng»)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API field | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------|-------|
| F-WF-STEP-LABEL | Bước N | SCR-WF-TAB-FORM | heading | — | order 1..n | step order | **Bước 1** default on new |
| F-WF-STEP-NAME | Tên bước / Tên nhiệm vụ | SCR-WF-TAB-FORM | input | **Y** | BR-WF-01 steps[] | `steps[].taskName` / label | W7 fill |
| F-WF-STEP-KEY | Mã bước (internal) | SCR-WF-TAB-FORM | text/mono | Y (BE) | stable `stepKey` | `steps[].stepKey` | graph id parity |
| F-WF-STEP-HAT | Vai trò / mũ | SCR-WF-TAB-FORM | select | Y | hat resolver | `steps[].hatKey` / role | multi-hat SRS §3 |
| F-WF-STEP-FLOW | Luồng (Đồng ý / Từ chối / BOD…) | SCR-WF-TAB-FORM | copy/chips | N | HDSD §4.2 step-flow | graph edges | HDSD coverage 01c |
| F-WF-STEP-REJECT | Cho phép từ chối | SCR-WF-TAB-FORM | switch | N | reject path inbox | `allowsReject` | neo TC-HP-13 inbox pack |
| F-WF-STEP-ADD | + Thêm bước | SCR-WF-TAB-FORM | button | — | ≥1 step before save | — | BR-WF-01 |

### 2.4 SCR-WF-TAB-GRAPH — canvas

| field_id | UI label (VI) | screen_id | control | required | API / notes |
|----------|---------------|-----------|---------|----------|-------------|
| F-WF-CNV-START | Bắt đầu | SCR-WF-TAB-GRAPH | node | Y | graph start |
| F-WF-CNV-END | Hoàn thành | SCR-WF-TAB-GRAPH | node | Y | graph end |
| F-WF-CNV-STEP | Tên bước on canvas | SCR-WF-TAB-GRAPH | node label | Y | mirrors F-WF-STEP-NAME |
| F-WF-INST-PICK | Phiên bản chạy | SCR-WF-TAB-GRAPH | dropdown | N | `GET …/instances` filter definition |
| F-WF-RUNTIME-BADGE | Trạng thái runtime trên bước | SCR-WF-TAB-GRAPH | badge | N | match `step_key` / `step-{order}` |

### 2.5 CARD-WF-HRM-PRESET

| field_id | UI label (VI) | screen_id | control | required | API | notes |
|----------|---------------|-----------|---------|----------|-----|-------|
| F-WF-PRESET-TITLE | Mẫu QT tuyển dụng HRM (bridge) | CARD-WF-HRM-PRESET | card title | — | seeds `hrm_recruitment_*` codes | TC-HP-01 · may ABSENT :8088 |
| F-WF-PRESET-APPLY | Tạo/mở mẫu | CARD-WF-HRM-PRESET | button | — | POST/PUT definitions | J-REC-WF-01 |

**Đếm fields:** 22 user-visible (+ 2 actions counted in §3)

---

## 3. Function inventory

| fn_id | UI (nút/menu) | screen_id | Precond (U65) | API | Success FE+F5 | Fail codes | HDSD |
|-------|---------------|-----------|---------------|-----|---------------|------------|------|
| **FN-WF-LIST-LOAD** | (auto) / Tải lại | SCR-WF-LIST | ceo@xe.vn · scope main | GET `…/definitions` | Rows or honest empty | 409 scope · banner | CH04 §4.2 |
| **FN-WF-NEW** | **Thêm quy trình mới** | SCR-WF-LIST | — | — | SCR-WF-DETAIL scaffold | — | CH04 §4.2 |
| **FN-WF-EDIT** | **Chỉnh sửa** | SCR-WF-LIST | row exists | GET list row cache | Detail hydrate graph+steps | — | L2.5 |
| **FN-WF-SAVE** | **Lưu quy trình** | SCR-WF-DETAIL | F-WF-CODE + F-WF-NAME + ≥1 step | POST (new) / PUT `{id}` (edit) | Toast «Đã lưu…»; F5 persist; **U34:** list count+row without F5 on back | 400 BR-WF-01 · 409 scope | J-REC-WF-01 · J-XBOS-10 |
| **FN-WF-BACK** | **Quay lại danh sách** | SCR-WF-DETAIL | — | — | SCR-WF-LIST; row reflects save | — | L2.5 |
| **FN-WF-PRESET** | Mẫu HRM bridge | CARD-WF-HRM-PRESET | card visible | POST/PUT definitions | Active def; list shows `hrm_*` code | card absent → skip/product_gap | TC-HP-01 |
| **FN-WF-ADD-STEP** | + Thêm bước | SCR-WF-TAB-FORM | edit mode | — | New step row + canvas node | save blocked if 0 steps | CH04 step config |
| **FN-WF-TAB-GRAPH** | Tab **Sơ đồ luồng** | SCR-WF-TAB-GRAPH | saved or draft with steps | — | Canvas **Bắt đầu**→steps→**Hoàn thành** | — | W7 audit |
| **FN-WF-INST-PICK** | **Phiên bản chạy** | SCR-WF-TAB-GRAPH | edit existing def | GET `…/instances` | Dropdown options; runtime badges | empty OK | p1-s1-fe-02 hint |
| **FN-WF-LIST-SYNC** | (implicit after save) | SCR-WF-LIST | after FN-WF-SAVE | GET definitions | Row appears **without F5** | stale list = FAIL U34 | J-XBOS-10 |
| **FN-WF-CHAIN-SPAWN** | *(downstream)* HRM Gửi duyệt / active def spawn | HRM/CC | FN-WF-SAVE active def | bridge start | Inbox task — **test in INBOX-CAT** | SPAWN-MISSING | UF-08 step 2 → **XBOS-INBOX-CAT** |
| **FN-WF-DEV-SEED** | Seed quy trình (dev) | POP-WF-DEV-SEED | dev flag only | seed API | N/A on UAT | must not show :8088 | TC-XIC-X-REG-001 |

**Đếm functions:** 12 (designer) + 1 chain pointer + 1 dev negative

---

## 4. Test case matrix

**Persona mặc định:** `ceo@xe.vn` / `Xevn@2026` · URL `:8088/command-center?settings=workflow` hoặc `:5173` (ghi build trong evidence).

**Quy ước TC-ID:** `TC-WFD-<area>-<type>-<nnn>` (WFD = WF Designer)

### 4.1 Happy path — create / edit / save / L2.5

| TC-ID | Type | Covers | Precond | Steps (HDSD CH04 §4.2) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|------------------------|----------|-------|------|--------|
| TC-WFD-LST-HP-001 | HP | FN-WF-LIST-LOAD | logged in | CC → Cài đặt → **Hệ thống quy trình** | GET definitions **200** `XBOS-WF-200`; table or honest empty; no 409 banner | UI | MANUAL | PLANNED |
| TC-WFD-CRT-HP-001 | HP | FN-WF-NEW+SAVE · UF-08 §1 | — | **Thêm quy trình mới** → fill **Mã** + **Tên** + **Bước 1** tên → **Lưu quy trình** | POST **201/200** `XBOS-WF-201`; toast success | UI | PW | PLANNED · *Prior:* R5/R4/W7 |
| TC-WFD-CRT-HP-002 | HP | FN-WF-SAVE · F5 | TC-WFD-CRT-HP-001 | F5 `?settings=workflow` | Row với cùng **Mã** còn; steps persisted | UI | MANUAL | PLANNED |
| TC-WFD-CRT-HP-003 | HP | FN-WF-LIST-SYNC · J-XBOS-10 | list visible before save | Save new def → **Quay lại danh sách** **without F5** | Count **n→n+1**; new code visible (U34) | UI | MANUAL | PLANNED · *Prior:* W7 retest |
| TC-WFD-EDT-HP-001 | HP | FN-WF-EDIT · L2.5 | row from HP-001 | List → **Chỉnh sửa** | Detail loads; canvas **Bắt đầu** + step + **Hoàn thành** | UI | MANUAL | PLANNED · W7 step 7 |
| TC-WFD-EDT-HP-002 | HP | FN-WF-SAVE edit | TC-WFD-EDT-HP-001 | Sửa **Tên bước** → **Lưu quy trình** → F5 | PUT **200** `XBOS-WF-201`; graph label updated | UI | PW | PLANNED · UX-XBOS-11 |
| TC-WFD-EDT-HP-003 | HP | FN-WF-BACK | after edit save | **Quay lại danh sách** | List row **Tên** khớp; re-open edit OK | UI | MANUAL | PLANNED |
| TC-WFD-GRF-HP-001 | HP | FN-WF-TAB-GRAPH | def with ≥1 step | Tab **Sơ đồ luồng** | Canvas nodes connected; dashed reject edge if configured | UI | MANUAL | PLANNED |
| TC-WFD-GRF-HP-002 | HP | FN-WF-INST-PICK | ≥1 instance exists | Chọn **Phiên bản chạy** | GET instances **200**; runtime badge on matched step | UI | MANUAL | PLANNED |
| TC-WFD-PST-HP-001 | HP | FN-WF-PRESET · TC-HP-01 | `hrm-rec-wf-presets` visible | Open bridge card → **Lưu** preset recruitment | Def codes `hrm_recruitment_*` active; F5 | UI | MANUAL | PLANNED · gap if card absent |
| TC-WFD-PST-HP-002 | HP | FN-WF-EDIT preset | TDIT / `hrm_requisition_approval` row | **Chỉnh sửa** recruitment def → observe **Lưu quy trình** | Canvas «Tuyển dụng nhân sự»; save **2xx** | UI | MANUAL | PLANNED · HDSD 01c |

### 4.2 Fail-deep / boundary / auth

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-WFD-CRT-FD-001 | FD | F-WF-CODE · F-WF-NAME | new def | Clear **Mã** or **Tên** → **Lưu** | Banner/toast **400**; no false success | UI/API | MANUAL | PLANNED · W7 400 msg |
| TC-WFD-CRT-FD-002 | FD | F-WF-STEP-NAME · BR-WF-01 | new def | Remove all steps → **Lưu** | **400** BR-WF-01; inline hint | UI/API | MANUAL | PLANNED |
| TC-WFD-CRT-FD-003 | FD | FN-WF-SAVE scope | wrong header | Force `x-company-id: holding` (probe) | **409** `SCOPE_CONTEXT_MISMATCH` | API | probe | PLANNED · ADR main |
| TC-WFD-CRT-BD-001 | BD | F-WF-CODE | new def | Mã dài 128+ / ký tự đặc biệt allowed set | Save **2xx** or deterministic **400**; F5 stable | UI | MANUAL | PLANNED |
| TC-WFD-LST-FD-001 | FD | FN-WF-LIST-LOAD | xbos-api down | Open list | Error banner; **no** mock RACI seed when mock off | UI | MANUAL | PLANNED |
| TC-WFD-LST-AU-001 | AU | FN-WF-NEW | `du-lich.ceo@xe.vn` | Open `?settings=workflow` | **403/409** or read-only; **no** POST defs for group codes | UI | MANUAL | PLANNED |
| TC-WFD-EDT-FD-001 | FD | GET by id P3 | edit row | Observe network on open | List-row hydrate OK; optional GET `{id}` **404** `XBOS-CFG-001` documented — **no** user block if UI OK | UI/API | MANUAL | PLANNED · D-W7-WF-GET-ID-01 |
| TC-WFD-UX-FD-001 | UX | D-W7-WF-FORM-AUTO-01 | automation | DOM `.value=` without React | Save **400** — normal typing **PASS** | UI | MANUAL | PLANNED |
| TC-WFD-UX-HP-001 | UX | UX-XBOS-11 | edit def | **Lưu quy trình** double-click | Single in-flight; spinner/Loader2; one PUT/POST | UI | MANUAL | PLANNED |

### 4.3 Regression / policy

| TC-ID | Type | Covers | Expected | Status |
|-------|------|--------|----------|--------|
| TC-WFD-REG-001 | REG | FN-WF-DEV-SEED | **Seed quy trình (dev)** **absent** on :8088 | PLANNED · neo TC-XIC-X-REG-001 |
| TC-WFD-REG-002 | REG | VITE mock | `VITE_ALLOW_MOCK_FALLBACK=false` → list from API only | PLANNED |
| TC-WFD-REG-003 | REG | F-WF-LST-CODE display | List **Mã** readable; not raw UUID-only row | PLANNED |

### 4.4 UF-XBOS-08 chain — inbox leg (**cross-ref only**)

> **Không** viết lại matrix approve/từ chối/drawer — dùng pack **`docs/qa/testcases/xbos/XBOS-INBOX-CAT.md`**.

| TC-ID | Type | Covers | Precond (U65) | Steps | Expected | Cross-ref pack | Status |
|-------|------|--------|---------------|-------|----------|----------------|--------|
| TC-WFD-CHAIN-HP-001 | HP | UF-08 E2E spine | TC-WFD-CRT-HP-001 **or** preset `hrm_requisition_*` active | HRM **Gửi duyệt QT** / spawn consumer → CC inbox | ≥1 pending task from **FE chain** | Execute **TC-XIC-WF-HP-002** | PLANNED |
| TC-WFD-CHAIN-HP-002 | HP | UF-08 approve | TC-WFD-CHAIN-HP-001 | Inbox **Duyệt** / complete | POST **201** `XBOS-WF-200`; F5 | Execute **TC-XIC-WF-HP-003** · *Prior:* spine w3 | PLANNED |
| TC-WFD-CHAIN-FD-001 | FD | BR-WF-04 | self-approve task | Inbox duyệt task của chính submitter | **4xx** / UI block | **TC-XIC-WF-FD-002** · TC-HP-04 | PLANNED |
| TC-WFD-CHAIN-BD-001 | BD | U65 empty inbox | No FE spawn | Open inbox before chain | **BLOCKED** honest — **cấm** seed | **TC-XIC-WF-BD-001** | PLANNED |

**TC count (this pack):** 26 designer + 4 chain pointers = **30** (chain rows = execution delegated to INBOX-CAT)

---

## 5. Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Designer functions ≥1 HP | 10 | 10 | 0 |
| Mutate functions ≥1 FD | 4 (SAVE, ADD-STEP, PRESET, LIST-LOAD fail) | 4 | 0 |
| Required fields ≥1 FD/BD | F-WF-CODE, F-WF-NAME, F-WF-STEP-NAME | TC-WFD-CRT-FD-001/002 · BD-001 | 0 |
| L2.5 list→edit→back | 1 | TC-WFD-EDT-HP-001/003 | 0 |
| J-XBOS-10 consumer sync | 1 | TC-WFD-CRT-HP-003 | 0 |
| UF-08 create leg ≥3 TC | 3 | CRT-HP-* + PST-HP-* | 0 |
| Inbox approve duplicated | 0 full copies | 4 cross-ref rows only | 0 |
| Dialogs | 0 confirms on designer | N/A | 0 |

---

## 6. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD / UF / J-* |
|-------|----------|----------|-----|-----------------|
| TC-WFD-CRT-HP-001 | UC-XBOS-13 · UC-XBOS-WF-01 | FR-XBOS-WF-01 · §14.8 | POST `…/definitions` | UF-XBOS-08 step 1 · CH04 §4.2 |
| TC-WFD-CRT-HP-003 | UC-XBOS-CC-06 | consumer sync U34 | GET definitions | **J-XBOS-10** |
| TC-WFD-PST-HP-001 | FR-UC-B03 · HP-01 | WF bridge | POST/PUT defs | J-REC-WF-01 · TC-HP-01 |
| TC-WFD-CHAIN-HP-002 | UC-XBOS-WF-04 | WF engine | POST complete | UF-XBOS-08 step 2 → **XBOS-INBOX-CAT** |
| TC-WFD-CHAIN-FD-001 | SRS §3 BR-WF-04 | — | approve self | TC-HP-04 |

**PO catalog neo:** TC-HP-01 → TC-WFD-PST-HP-001 / TC-WFD-CRT-HP-* · TC-HP-03 → **TC-XIC-WF-HP-003** (inbox pack) · TC-HP-04 → TC-WFD-CHAIN-FD-001

---

## 7. Out of scope / delegated

| Item | Owner pack / reason |
|------|---------------------|
| Inbox list/card/drawer/reject/approve matrix | **`XBOS-INBOX-CAT.md`** §4.1 |
| Catalog gov · CC autosave · extension | **`XBOS-INBOX-CAT.md`** §4.2–4.4 |
| `pnpm seed:workflow:inbox` | U65 OOS |
| WF member CEO hat complete | `PILOT_BUSINESS_FLOW_MATRIX` member lane — OOS this menu |
| Full BPMN edge exhaustive | Partial — step table + canvas smoke |

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-wf-01.md
next_owner: qa-synth
counts: screens=7 fields=22 functions=12 tcs=30 (26 designer + 4 inbox cross-ref)
residual: R-REC-C-BRIDGE-01 preset card · D-W7-WF-GET-ID-01 GET by id · execution U65 pending U78 test-log
cross_ref: docs/qa/testcases/xbos/XBOS-INBOX-CAT.md
```
