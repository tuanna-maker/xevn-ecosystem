# Menu TC Pack — `HRM-PERFORMANCE` · Hiệu suất / Đánh giá (HRM Web + CC embed)

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-PERFORMANCE` |
| **surface** | `hrm-web` · **CC embed** `P-CC-HRM-09` (CTA — không full iframe) |
| **route(s)** | `/performance` · embed `/command-center/hrm/performance` · standalone `/hr/performance` |
| **HDSD** | Sidebar HRM **Hiệu suất** / **Đánh giá** · Command Center → Nhân sự → **Đánh giá** → **Mở HRM / Đánh giá** |
| **SRS / FR / UC** | **HRM-PF-01..04** · **FR-HRM-PF-01** · **FR-HRM-PERF-SM-E3-01** · **AC-MMAP-PF-01** · **AC-PERF-01..05** · **BR-HRM-PERF-E3-01..03** · **AC-FID-13** (density inventory) |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §16.1 `performance_cycles` / `performance_evaluations` · E3 SM |
| **API_CONTRACT** | `POST/GET/PATCH/DELETE /api/hrm/performance/cycles` · `POST/GET/PATCH/DELETE /api/hrm/performance/evaluations` · `HRM-PERF-201/202/200` · `HRM-PERF-001/404/409` · `HRM-PERF-LOCKED` · `HRM-PERF-DEL-BLOCK` · `HRM-PERF-KPI-KEY` / `GRADE` / `DEPT` |
| **UF / J-*** | **UF-HRM-MENU-09** · **J-HRM-MENU-SWEEP** (leaf `/performance`) · không có J-HRM-09 riêng (list-only module) |
| **Menu roster** | **MENU-09** — Wave B · `PO-ECO-TC-HRM-PERFORMANCE-01` |
| **author** | qa · PO-ECO-TC-HRM-PERFORMANCE-01 |
| **work_item_id** | `PO-ECO-TC-HRM-PERFORMANCE-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · WORLD-STANDARD depth (`PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §2). U65: mọi mutate/data **từ FE** (tạo chu kỳ → tạo phiếu → SM); **cấm seed** trong execution. **Không** claim UAT/Phase1 DONE. CC embed **AS-IS:** panel mô tả + nút mở HRM — không iframe full như Lương.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-SHELL | page | `/performance` | 4 Card stack: form chu kỳ · form đánh giá · list chu kỳ · list phiếu | loading · success · API error toast |
| SCR-CC-PANEL | page | `/command-center/hrm/performance` | `HrmWorkspacePanel` case `performance` — copy + **Mở HRM / Đánh giá** | CTA only · không iframe |
| SCR-CYCLE-FORM | card | Top card | Tạo / **Sửa chu kỳ** (inline, không dialog) | create · edit mode · pending submit |
| SCR-EVAL-FORM | card | Card 2 | Nhập phiếu đánh giá | empty cycles in select · catalogs loading |
| SCR-CYCLE-LIST | card | Card 3 | `Danh sách chu kỳ (total)` | empty · rows |
| SCR-EVAL-LIST | card | Card 4 | `Danh sách đánh giá (total)` | empty · rows |
| SCR-CYCLE-ROW | row | List chu kỳ | `data-testid=perf-cycle-row` · actions SM/Sửa/Xóa | draft/active/closed |
| SCR-EVAL-ROW | row | List phiếu | `data-testid=perf-eval-row` · SM · Xóa nháp | draft→completed |
| SCR-EMPTY-CYCLES | inline | List chu kỳ trống | `EmptyState` `perf-cycles-empty` · **Làm mới** | refetch |
| SCR-EMPTY-EVALS | inline | List phiếu trống | `perf-evals-empty` · hint SM path | refetch |
| LNK-SETTINGS-KPI | link | KPI picker empty | `hrmPathWithEmbedSearch('/settings')` | preserve embed query |
| LNK-SETTINGS-GRADE | link | Ngạch empty | same | — |
| LNK-SETTINGS-DEPT | link | Phòng ban empty | same | — |

**Đếm:** pages=2 (standalone + CC) · cards=4 · rows=2 · dialogs=**0** (inline mutate) · confirms=**0** (delete trực tiếp) · empty=2 · links=3

---

## 2. Field dictionary (đủ mọi trường)

### 2.1 Form chu kỳ (`SCR-CYCLE-FORM`)

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API column | format |
|----------|---------------|-----------|---------|-----|-----------------|------------|--------|
| F-CYC-NAME | Tên chu kỳ | SCR-CYCLE-FORM | Input | **Y** | Zod non-empty | `cycle_name` | text |
| F-CYC-START | Từ ngày | SCR-CYCLE-FORM | `type=date` | **Y** | Zod · BE `HRM-PERF-001` | `start_date` | ISO wire · **dd/MM/yyyy** display list |
| F-CYC-END | Đến ngày | SCR-CYCLE-FORM | `type=date` | **Y** | end > start (Zod+BE) | `end_date` | same |
| F-CYC-TITLE | Tiêu đề card | SCR-CYCLE-FORM | CardTitle | — | «Tạo» vs «Sửa chu kỳ» | — | — |

### 2.2 Form đánh giá (`SCR-EVAL-FORM`)

| field_id | UI label (VI) | screen_id | control | req | validation / BR | API column | format |
|----------|---------------|-----------|---------|-----|-----------------|------------|--------|
| F-EV-EMP | Mã nhân viên (UUID) | SCR-EVAL-FORM | Input | **Y** | Zod · UUID hợp lệ · scope employee | `employee_id` | UUID (**UX debt:** chưa employee picker) |
| F-EV-CYCLE | Chu kỳ | SCR-EVAL-FORM | Select | **Y** | options từ list cycles | `cycle_id` | label + status U72 |
| F-EV-SCORE | Điểm (0-100) | SCR-EVAL-FORM | number input | **Y** | Zod 0–100 · BE `@Min/@Max` | `score` | **exempt** thousand group |
| F-EV-KPI | KPI (danh mục) | SCR-EVAL-FORM | CatalogSearchPicker | N | if set ∈ `kpi_library` | `kpi_code` / `kpi_name` | label not raw |
| F-EV-GRADE | Ngạch (tuỳ chọn) | SCR-EVAL-FORM | CatalogSearchPicker | N | if set ∈ `job_grades` | `job_grade_key` | code |
| F-EV-DEPT | Phòng ban (tuỳ chọn) | SCR-EVAL-FORM | CatalogSearchPicker | N | if set ∈ `departments` | `department_key` | code |
| F-EV-SUMMARY | Nhận xét | SCR-EVAL-FORM | Textarea | **Y** | Zod non-empty | `summary` | text |

### 2.3 List chu kỳ (display + actions)

| field_id | UI label | screen_id | control | req | notes |
|----------|----------|-----------|---------|-----|-------|
| F-LST-CYC-TOTAL | Danh sách chu kỳ (n) | SCR-CYCLE-LIST | CardTitle | — | `cyclesQuery.data.total` |
| F-ROW-CYC-NAME | Tên chu kỳ | SCR-CYCLE-ROW | text | — | — |
| F-ROW-CYC-RANGE | Khoảng ngày | SCR-CYCLE-ROW | muted text | — | `formatDisplayDate` · **cấm** raw ISO-Z |
| F-ROW-CYC-STAT | Trạng thái chu kỳ | SCR-CYCLE-ROW | inline | — | `resolvePerformanceCycleStatusDisplay` U72 |
| F-BTN-CYC-EDIT | Sửa | SCR-CYCLE-ROW | Button | — | chỉ draft/active content |
| F-BTN-CYC-DEL | Xóa | SCR-CYCLE-ROW | destructive | — | chỉ `draft` |
| F-BTN-CYC-SM | → trạng thái kế | SCR-CYCLE-ROW | `perf-cycle-sm-*` | — | draft→active/closed · active→closed |

### 2.4 List phiếu đánh giá

| field_id | UI label | screen_id | control | req | notes |
|----------|----------|-----------|---------|-----|-------|
| F-LST-EV-TOTAL | Danh sách đánh giá (n) | SCR-EVAL-LIST | CardTitle | — | total from API |
| F-ROW-EV-HEAD | NV — điểm · trạng thái | SCR-EVAL-ROW | font-medium | — | `resolvePerformanceEmployeeDisplay` · score · eval status U72 |
| F-ROW-EV-SUMMARY | Nhận xét | SCR-EVAL-ROW | muted | — | full text row |
| F-ROW-EV-KPI | KPI: … | SCR-EVAL-ROW | xs muted | — | `resolveKpiLibraryLabel` |
| F-BTN-EV-DEL | Xóa nháp | SCR-EVAL-ROW | destructive | — | draft only |
| F-BTN-EV-SM | → trạng thái kế | SCR-EVAL-ROW | `perf-eval-sm-*` | — | draft→submitted→approved→completed |

### 2.5 Page chrome

| field_id | UI label | screen_id | notes |
|----------|----------|-----------|-------|
| F-PAGE-ROOT | — | SCR-SHELL | `data-testid=performance-page-e3` |

**Đếm fields:** 28 (form 11 + list/action 16 + page 1)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-NAV-LOAD | Mở **Hiệu suất** | SCR-SHELL | login Group CEO | GET cycles + GET evaluations | 200 `HRM-PERF-200` · mount testid | 5xx toast | Sidebar → Hiệu suất |
| FN-CC-PANEL | CC tab Đánh giá | SCR-CC-PANEL | CC login | (optional GET khi mở HRM sau) | Panel + nút CTA | — | CC → Nhân sự → Đánh giá |
| FN-CC-OPEN-HRM | **Mở HRM / Đánh giá** | SCR-CC-PANEL | — | — | Tab/app `/hr/performance` load SCR-SHELL | — | Click CTA |
| FN-CYC-CREATE | **Tạo chu kỳ** | SCR-CYCLE-FORM | form valid | POST `/performance/cycles` | **201** `HRM-PERF-201`; row list; toast; F5 | HRM-PERF-001 | Điền form → Tạo |
| FN-CYC-UPDATE | **Lưu chu kỳ** (edit) | SCR-CYCLE-FORM | editingCycle · editable status | PATCH `/performance/cycles/:id` | **200**; list cập nhật; F5 | HRM-PERF-LOCKED | Sửa → Lưu |
| FN-CYC-EDIT-OPEN | **Sửa** row | SCR-CYCLE-ROW | draft/active | — | form prefilled; title «Sửa» | toast if closed | Row → Sửa |
| FN-CYC-EDIT-CANCEL | **Hủy** edit | SCR-CYCLE-FORM | editing | — | reset form; title «Tạo» | — | Hủy |
| FN-CYC-SM | **→** trạng thái chu kỳ | SCR-CYCLE-ROW | legal next | PATCH body `{status}` | **200**; badge U72; F5 | HRM-PERF-CYCLE-STATE | Click SM button |
| FN-CYC-DELETE | **Xóa** chu kỳ | SCR-CYCLE-ROW | draft · no blocking evals | DELETE `…/cycles/:id` | row gone; F5 | HRM-PERF-DEL-BLOCK | Xóa |
| FN-EV-CREATE | **Tạo đánh giá** | SCR-EVAL-FORM | valid · cycle exists | POST `/performance/evaluations` | **202** `HRM-PERF-202`; row draft; F5 | 404 cycle · catalog keys | Form → Tạo |
| FN-EV-SM | **→** trạng thái phiếu | SCR-EVAL-ROW | legal next | PATCH `/performance/evaluations/:id` | **200**; headline status; F5 | illegal transition | SM buttons |
| FN-EV-DELETE | **Xóa nháp** | SCR-EVAL-ROW | draft | DELETE evaluation | row gone; F5 | non-draft | Xóa nháp |
| FN-CYC-REFETCH | **Làm mới** (empty cycles) | SCR-EMPTY-CYCLES | — | GET cycles | list refresh | — | Empty CTA |
| FN-EV-REFETCH | **Làm mới** (empty evals) | SCR-EMPTY-EVALS | — | GET evaluations | list refresh | — | Empty CTA |
| FN-CATALOG-CTA | Link **Cài đặt** catalog | SCR-EVAL-FORM | picker empty | — | navigate settings preserve embed | — | KPI/ngạch/PB empty hint |

**Đếm functions:** 15

**Mutate subset (≥1 FD bắt buộc):** FN-CYC-CREATE · FN-CYC-UPDATE · FN-CYC-SM · FN-CYC-DELETE · FN-EV-CREATE · FN-EV-SM · FN-EV-DELETE = **7**

**Ghi chú AS-IS:** FE **không** có form sửa nội dung phiếu sau create (BE PATCH content — `isPerformanceEvalContentEditable` chưa wired) → TC **OOS** §6.

---

## 4. Test case matrix (chi tiết)

### Quy ước

- **TC-ID:** `TC-PERF-<area>-<type>-<nnn>`
- **Type:** HP · FD · BD · AU · UX · **DEN** (density) · **BLK** · **OOS**
- **Persona mặc định:** Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main`
- **HDSD (U76):** HRM sidebar **Hiệu suất** hoặc CC → Nhân sự → **Đánh giá** → (nếu CTA) **Mở HRM / Đánh giá**

### 4.1 Load · embed · UF-HRM-MENU-09 · J-HRM-MENU-SWEEP

| TC-ID | Type | Covers | Precond | Steps (HDSD) | Expected | Layer | Automate | Status |
|-------|------|--------|---------|--------------|----------|-------|----------|--------|
| TC-PERF-L-HP-001 | HP | FN-NAV-LOAD · HRM-PF-02/04 | L0 stack | Login → sidebar **Hiệu suất** | GET cycles+evaluations **200**; `performance-page-e3` visible; no Sync ERROR | UI | MANUAL | PLANNED |
| TC-PERF-L-HP-002 | HP | UF-HRM-MENU-09 · FN-CC-PANEL | CC | CC → Nhân sự → **Đánh giá** | Copy chu kỳ/phiếu + nút **Mở HRM / Đánh giá** (không blank iframe) | UI | MANUAL | PLANNED |
| TC-PERF-L-HP-003 | HP | FN-CC-OPEN-HRM | CC panel | Click **Mở HRM / Đánh giá** | `/hr/performance` mount; same as 001 | UI | MANUAL | PLANNED |
| TC-PERF-L-HP-004 | HP | SCR-EMPTY-* · AC honesty | U65 chưa mutate | Mở trang lần đầu | Both lists empty states; **cấm** mock/fake rows | UI | MANUAL | PLANNED |
| TC-PERF-L-UX-005 | UX | FN-NAV-LOAD | API chậm | Mở menu | Cards render; không crash; eventual empty/rows | UI | MANUAL | PLANNED |
| TC-PERF-L-FD-006 | FD | FN-NAV-LOAD | hrm-api down | Mở Hiệu suất | Error toast; lists không fake data | UI | MANUAL | PLANNED |
| TC-PERF-L-FD-007 | FD | scope | token `main` vs body lệch | GET với company_id sai | **409** `HRM-PERF-409`; UI không điền rows | API/UI | API | PLANNED |
| TC-PERF-L-AU-008 | AU | auth | no JWT | Deep `/hr/performance` | 401/redirect login | UI | MANUAL | PLANNED |
| TC-PERF-L-HP-009 | HP | F5 | có/không data | F5 | Cùng state; không GET storm | UI | MANUAL | PLANNED |
| TC-PERF-L-UX-010 | UX | J-HRM-MENU-SWEEP | — | Leaf load only | No console P0; dates human-readable if rows | UI | MANUAL | PLANNED |

### 4.2 Chu kỳ — tạo · validate (HRM-PF-01 · AC-PERF-01)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-CYC-HP-001 | HP | FN-CYC-CREATE | Tên `Q3/2026` · từ/đến hợp lệ → **Tạo chu kỳ** | POST **201**; row **Nháp**; toast; **F5** còn | PLANNED |
| TC-PERF-CYC-HP-002 | HP | F-ROW-CYC-RANGE | Sau 001 | List hiển thị **dd/MM/yyyy – dd/MM/yyyy** | PLANNED |
| TC-PERF-CYC-FD-001 | FD | F-CYC-NAME | Bỏ tên → submit | Zod message; **no POST** | PLANNED |
| TC-PERF-CYC-FD-002 | FD | F-CYC-START | Bỏ từ ngày | Zod; no POST | PLANNED |
| TC-PERF-CYC-FD-003 | FD | F-CYC-END | Bỏ đến ngày | Zod; no POST | PLANNED |
| TC-PERF-CYC-FD-004 | FD | F-CYC-END · HRM-PERF-001 | end < start | Toast/FormMessage; POST **400** nếu bypass | PLANNED |
| TC-PERF-CYC-BD-001 | BD | F-CYC-NAME | 120+ ký tự | BE max 120 → 4xx hoặc truncate policy | PLANNED |
| TC-PERF-CYC-BD-002 | BD | F-CYC-START/END | same day | Allowed if start≤end | PLANNED |

### 4.3 Chu kỳ — sửa · hủy · closed guard

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-CYC-HP-003 | HP | FN-CYC-EDIT-OPEN · FN-CYC-UPDATE | draft row → **Sửa** → đổi tên → **Lưu** | PATCH **200**; row updated; F5 | PLANNED |
| TC-PERF-CYC-HP-004 | HP | FN-CYC-EDIT-CANCEL | Sửa → **Hủy** | Form reset; không PATCH | PLANNED |
| TC-PERF-CYC-FD-005 | FD | FN-CYC-EDIT-OPEN | closed cycle → **Sửa** | Toast «Chu kỳ đã đóng»; form không edit | PLANNED |
| TC-PERF-CYC-FD-006 | FD | FN-CYC-UPDATE | PATCH name on closed (API probe) | **400** `HRM-PERF-LOCKED` | PLANNED |

### 4.4 Chu kỳ — state machine (FR-HRM-PERF-SM-E3-01)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-CYC-HP-005 | HP | FN-CYC-SM | draft → **→ Hoạt động** | status active; U72 label; F5 | PLANNED |
| TC-PERF-CYC-HP-006 | HP | FN-CYC-SM | active → **→ Đóng** | closed; **Sửa** hidden | PLANNED |
| TC-PERF-CYC-HP-007 | HP | FN-CYC-SM | draft → **→ Đóng** (shortcut) | closed legal per `statusMachineE3` | PLANNED |
| TC-PERF-CYC-FD-007 | FD | FN-CYC-SM | closed → any | No SM buttons | PLANNED |
| TC-PERF-CYC-FD-008 | FD | illegal PATCH | skip draft→closed guard via API | **400** `HRM-PERF-CYCLE-STATE` | PLANNED |

### 4.5 Chu kỳ — xóa (AC-PERF-02)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-CYC-HP-008 | HP | FN-CYC-DELETE | draft cycle no evals → **Xóa** | DELETE **200**; row gone; F5 | PLANNED |
| TC-PERF-CYC-FD-009 | FD | FN-CYC-DELETE | active/closed cycle | Button absent | PLANNED |
| TC-PERF-CYC-FD-010 | FD | FN-CYC-DELETE | draft + eval **submitted** | DELETE **409** `HRM-PERF-DEL-BLOCK`; toast | PLANNED |

### 4.6 Phiếu đánh giá — tạo (HRM-PF-03)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-EV-HP-001 | HP | FN-EV-CREATE | Tạo chu kỳ (FE) → copy UUID NV từ **Nhân sự** → chọn chu kỳ · điểm 85 · nhận xét → **Tạo** | POST **202**; row **Nháp**; F5 | PLANNED |
| TC-PERF-EV-HP-002 | HP | F-EV-KPI | Chọn KPI catalog | POST includes kpi_code/name | PLANNED |
| TC-PERF-EV-HP-003 | HP | F-EV-GRADE · F-EV-DEPT | Chọn ngạch + PB | PATCH keys validated | PLANNED |
| TC-PERF-EV-FD-001 | FD | F-EV-EMP | Bỏ UUID | Zod; no POST | PLANNED |
| TC-PERF-EV-FD-002 | FD | F-EV-CYCLE | Không chọn chu kỳ | Zod; no POST | PLANNED |
| TC-PERF-EV-FD-003 | FD | F-EV-SUMMARY | Bỏ nhận xét | Zod; no POST | PLANNED |
| TC-PERF-EV-FD-004 | FD | F-EV-SCORE | điểm 101 hoặc -1 | Zod/BE 400 | PLANNED |
| TC-PERF-EV-BD-001 | BD | F-EV-SCORE | 0 và 100 | Accepted | PLANNED |
| TC-PERF-EV-FD-005 | FD | F-EV-EMP | UUID không tồn tại | 4xx; toast; no silent success | PLANNED |
| TC-PERF-EV-FD-006 | FD | F-EV-KPI | KPI key not in catalog | `HRM-PERF-KPI-KEY` | PLANNED |
| TC-PERF-EV-FD-007 | FD | F-EV-CYCLE | cycle_id invalid | **404** `HRM-PERF-404` | PLANNED |
| TC-PERF-EV-UX-001 | UX | FN-CATALOG-CTA | KPI list empty | Link **Mở Cài đặt** mở settings embed-safe | PLANNED |

### 4.7 Phiếu — state machine (eval SM)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-EV-HP-004 | HP | FN-EV-SM | draft → **→ Đã nộp** | submitted; F5 | PLANNED |
| TC-PERF-EV-HP-005 | HP | FN-EV-SM | submitted → **→ Đã duyệt** | approved | PLANNED |
| TC-PERF-EV-HP-006 | HP | FN-EV-SM | approved → **→ Hoàn thành** | completed; no delete | PLANNED |
| TC-PERF-EV-FD-008 | FD | FN-EV-SM | draft → approved (skip) | Button absent; API 400 if forced | PLANNED |
| TC-PERF-EV-FD-009 | FD | FN-EV-SM | completed → any | No SM buttons | PLANNED |

### 4.8 Phiếu — xóa nháp

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-EV-HP-007 | HP | FN-EV-DELETE | draft → **Xóa nháp** | DELETE ok; F5 | PLANNED |
| TC-PERF-EV-FD-010 | FD | FN-EV-DELETE | submitted+ | Button absent | PLANNED |

### 4.9 Display · U72 · AC-FID-13 (catalog only)

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-UX-HP-001 | UX | F-ROW-CYC-STAT | có rows | **Không** hiển thị `draft`/raw enum | PLANNED |
| TC-PERF-UX-HP-002 | UX | F-ROW-EV-HEAD | eval có employee_name | **Không** leak UUID when name present | PLANNED |
| TC-PERF-UX-FD-001 | UX | F-ROW-EV-HEAD | missing name | Fallback an toàn (code/id policy) — no crash | PLANNED |
| TC-PERF-DEN-BLK-001 | DEN | AC-FID-13 · BR-PERF-DENSITY | governance | Density SQL ≥5 cycles / 300 evals **≠** TC execution pass | **BLK** |
| TC-PERF-DEN-UX-001 | UX | AC-MMAP-PF-01 | empty honest | Empty OK; **≠** claim PF module DONE | PLANNED |

### 4.10 API / list traps · member scope

| TC-ID | Type | Covers | Steps | Expected | Status |
|-------|------|--------|-------|----------|--------|
| TC-PERF-API-FD-001 | FD | list query | `page_size=300` on cycles GET | **400** forbidNonWhitelisted (qc fidelity note) | PLANNED |
| TC-PERF-AU-001 | AU | member CEO | `du-lich.ceo@xe.vn` | Chỉ scope member; không rollup tập đoàn | PLANNED |

### Coverage check (bắt buộc)

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 15 | 15 | 0 |
| Functions mutate với ≥1 FD | 7 | 7 | 0 |
| Required fields với ≥1 FD/BD | 7 (CYC×3 + EV×4) | 7 | 0 |
| Dialogs open/cancel/submit | 0 (inline) | N/A — covered via form cancel/submit TC | 0 |
| UF-HRM-MENU-09 / CC CTA | 2 | 3 (L-HP-002/003) | 0 |

**Tổng TC:** 58 (56 PLANNED + 1 BLK + 1 implicit OOS in §6)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | HDSD |
|-------|----------|----------|-----|------|
| TC-PERF-L-HP-001 | HRM-PF-02 · HRM-PF-04 | §16.1 | GET cycles/evaluations | Sidebar Hiệu suất |
| TC-PERF-CYC-HP-001 | HRM-PF-01 · FR-HRM-PF-01 | §16.1 | POST cycles **201** | Form tạo chu kỳ |
| TC-PERF-CYC-HP-005 | FR-HRM-PERF-SM-E3-01 · AC-PERF-01 | E3 SM | PATCH status | Nút → Hoạt động |
| TC-PERF-CYC-FD-010 | AC-PERF-02 · BR-HRM-PERF-E3-02 | delete rules | DELETE **409** DEL-BLOCK | Xóa chu kỳ |
| TC-PERF-EV-HP-001 | HRM-PF-03 | evaluations FK | POST **202** | Tạo phiếu |
| TC-PERF-EV-HP-004 | AC-PERF-03..05 | eval SM | PATCH status | Nộp/Duyệt |
| TC-PERF-L-HP-002 | UF-HRM-MENU-09 | embed panel | — | CC Đánh giá |
| TC-PERF-UX-HP-001 | AC-FD-13 · FR-HRM-U72 | labelMaps | — | List labels |
| TC-PERF-DEN-BLK-001 | AC-FID-13 · HRM_MENU_DATA_LINKAGE | density | SQL probe | Governance |

**Prior runtime (cite only — no re-run):** `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-HRM-09 PASS · `qa-hrm-menu-full-sweep-01` MENU-09 · `D-HRM-PERF-EVAL-500-01` closed · `p1-u18-qa-c1` API 200

---

## 6. Out of scope / stub / blocked

| Item | Reason | TC tag |
|------|--------|--------|
| OKR / 360 / check-in % | AC-MMAP-PF GĐ2 | **OOS** |
| Mobile CEO performance widget | MP-11 web-only GWC | **OOS** |
| FE edit eval content post-create | BE PATCH có · FE chưa form | **OOS** · future FN-EV-UPDATE |
| Employee picker (UUID manual) | UX debt — TC vẫn cover UUID path | Note on TC-PERF-EV-HP-001 |
| CC full iframe embed | AS-IS CTA panel (`HrmWorkspacePanel`) | TC-PERF-L-HP-002 documents |
| Seed cycles/evals | U65 | **Cấm** execution |
| `page_size` on list DTO | Not in whitelist | TC-PERF-API-FD-001 |
| LV-02 ladder HOLD | If sponsor ladder on | SPEC_GAP on execution |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-hrm-performance-01.md
work_item_id: PO-ECO-TC-HRM-PERFORMANCE-01
next_owner: qa-synth
counts: screens=13 fields=28 functions=15 tcs=58
policy: U65 zero-seed execution · U76 HDSD paths · NOT UAT DONE
```
