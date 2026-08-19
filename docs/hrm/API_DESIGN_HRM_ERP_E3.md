# API_DESIGN — HRM ERP E3 (CONSTRAINT + PERF-SM + INS-DEPTH)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E3-DB-API-01` |
| **cohort** | E3 · `E-CONSTRAINT` / `CONSTRAINT-PERF-SM` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` **FR-HRM-PERF-SM-E3-01** Diễn biến #1–#n · **FR-HRM-INS-DEPTH-E3-01** · **FR-HRM-CONSTRAINT-E3-01** · **AC-PERF-*** · **AC-INS-*** · **AC-E3-ZOD-AUDIT-01** · **AC-E3-SM-01** · `docs/hrm/SRS.md` §16.6 · J-HRM-PERF/INS/SM-E3-01 |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_ERP_E3.md` |
| **ref_baseline** | `API_DESIGN_HRM_W2_SLICE.md` §A · `API_DESIGN_HRM_CONTRACTS_INS.md` · `API_DESIGN_HRM_ERP_E2.md` §8 participants · E1-A assert pattern |
| **ref_catalog_api** | `API_DESIGN_HRM_SETTINGS_CATALOG.md` · E1-B items picker |
| **Template** | `_vibe-team-os/templates/TECHSPEC_API_CONTRACT.md` (Mục đích · Nghiệp vụ · Bước SRS) |
| **U71 F.1** | Mỗi endpoint dưới đây đủ 3 mục + DTO↔DB + lỗi |
| **Date** | 2026-07-28 |
| **SA ACK** | **`SA-ERP-E3-ACK-01`** 2026-07-28 — path freeze + codes ACK · Dev **UNLOCK** FE‖BE · evidence `docs/qa/evidence/sa-erp-e3-ack-01-20260728.md` |
| **Cấm** | `apps/**` · apply migration · seed U65 |

> **Rule:** Performance gains **PATCH/DELETE** + evaluation **status transitions**. Insurance gains **policy master CRUD** + **insurer catalog** assert + participant **policy/employee** assert. Shared **`assertStatusTransition`** for Leave / Perf / Insurance / Recruitment.

> **OpenAPI path freeze (`SA-ERP-E3-ACK-01`):** Canonical family = **`/api/hrm/contracts-insurance/insurance-policies`** (+ `/{policyId}`). **REJECT** parallel `/api/hrm/insurance-policies`. Participants remain `/api/hrm/insurance-policy-participants` (existing). Owner Nest service = **`ContractsInsuranceService`**.

---

## 0. Shared contracts

### 0.1 Assert helpers (normative)

| Helper | Target | Error code |
|--------|--------|------------|
| `assertStatusTransition(domain, from, to)` | SM maps in DB_DESIGN §2.2 | **`HRM-SM-001`** (+ domain `HRM-PERF-SM` / `HRM-INS-SM` / leave/rec) |
| `assertCodeInEffectiveCatalog(…, 'insurers'\|aliases)` | Insurer | **`HRM-INS-INSURER-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'insurance_types')` | Loại BH | **`HRM-INS-TYPE-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'kpi_library'\|aliases)` | KPI | **`HRM-PERF-KPI-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'job_grades')` | Grade | **`HRM-PERF-GRADE-KEY`** |
| `assertCodeInEffectiveCatalog(…, 'departments')` | Dept | **`HRM-PERF-DEPT-KEY`** |
| Empty catalog + required | No HARDCODE invent | Same 400 |

### 0.2 Picker dependency (cite — not redesign)

| Method / path | Keys |
|---------------|------|
| `GET /api/hrm/settings-catalogs/{catalogKey}/items` | `insurers`, `insurance_types`, `kpi_library`, `job_grades`, `departments` |
| Alias resolve | `insurance_providers` / `bhxh_providers` → `insurers`; `kpi_metrics` → `kpi_library` (HRM soft) |

### 0.3 Error envelope

| Family | HTTP | FE (U72) |
|--------|------|----------|
| Illegal SM transition | **400** `HRM-SM-001` | Toast «Không chuyển được trạng thái…» — show VI labels not raw codes |
| Catalog key invalid | **400** `HRM-*-KEY` | Field error |
| Duplicate policy/eval | **409** | Toast mã trùng |
| Delete blocked | **409** `HRM-PERF-DEL-BLOCK` | Toast |
| Locked mutate | **400** `HRM-PERF-LOCKED` | — |
| Auth / scope | 401 / 404 / 409 | Existing |
| Success | 200/201 module codes | Bind + F5 |

### 0.4 Endpoint map (E3 delta)

| § | Method / path | Success | Primary AC / SRS |
|---|----------------|---------|------------------|
| 1 | `PATCH /performance/cycles/{cycleId}` | `HRM-PERF-200` | **AC-PERF-01** · FR-HRM-PERF-SM-E3-01 #3 |
| 2 | `DELETE /performance/cycles/{cycleId}` | `HRM-PERF-200` | **AC-PERF-02** · BR-HRM-PERF-E3-01 |
| 3 | `PATCH /performance/evaluations/{evaluationId}` | `HRM-PERF-200` | **AC-PERF-03/04/05** · SM §1.2 |
| 4 | `DELETE /performance/evaluations/{evaluationId}` | `HRM-PERF-200` | **AC-PERF-02** (draft only) |
| 5 | *(status via PATCH §3)* | — | Prefer single surface |
| 6 | `GET /contracts-insurance/insurance-policies` | `HRM-INS-POL-200` | **AC-INS-01** |
| 7 | `POST /contracts-insurance/insurance-policies` | `HRM-INS-POL-201` | **AC-INS-01/02/03** |
| 8 | `GET …/insurance-policies/{policyId}` | `HRM-INS-POL-200` | scope_parity · J-HRM-INS-E3-01 |
| 9 | `PATCH …/insurance-policies/{policyId}` | `HRM-INS-POL-200` | **AC-INS-01** · SM §1.3 |
| 10 | `DELETE …/insurance-policies/{policyId}` | `HRM-INS-POL-200` | soft-D draft/cancelled |
| 11 | `PATCH /contracts-insurance/insurance/{recordId}` | `HRM-CON-200` | **AC-INS-04** |
| 12 | `GET /contracts-insurance/insurance/{recordId}` | `HRM-CON-200` | scope_parity |
| 13 | `POST/PATCH /insurance-policy-participants` | `HRM-INS-P-*` | **AC-INS-04** FK |
| 14 | Leave approve/reject (cite) | existing | **AC-E3-SM-01** |
| 15 | Recruitment stage PATCH (cite) | existing | **AC-E3-SM-01** |
| 16 | `GET /settings-catalogs/{key}/items` | `HRM-SET-200` | Picker cite |

**Baseline unchanged (cite):** `POST/GET …/performance/cycles|evaluations` (W2) · `POST/GET …/insurance` create/list (CI) · participants DELETE.

**Path note (SA ACK):** Prefix **`/api/hrm/contracts-insurance/insurance-policies`** only — **no** `/api/hrm/insurance-policies` alias.

---

## 1. Endpoint — PATCH performance cycle

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/performance/cycles/{cycleId}` |
| Body | `UpdatePerformanceCycleDto` (`cycle_name?`, `start_date?`, `end_date?`, `status?`) |
| Success | `200` · **`HRM-PERF-200`** |
| Runtime | **ADD** `updateCycle` — today **absent** |

### Mục đích

**Cập nhật chu kỳ đánh giá** (tên, ngày, trạng thái chu kỳ) trong phạm vi đơn vị — đóng gap create-only; cho phép kích hoạt / đóng chu kỳ theo SM ERP.

### Nghiệp vụ xử lý

1. Auth; load cycle by id **in list scope** → else `HRM-PERF-404`.
2. If body has dates/name and current `status='closed'` → **`HRM-PERF-LOCKED`**.
3. If `status` present → `assertStatusTransition('performance_cycle', current, next)` → else `HRM-SM-001`.
4. Validate date order when either date patched → `HRM-PERF-001`.
5. Optional overlap check for open cycles → `HRM-PERF-002`.
6. UPDATE; return row.
7. **Cấm** auto-bulk create evaluations on `active`.

### Tham chiếu bước SRS

| # | UC / FR / AC | Diễn biến | API role |
|---|--------------|-----------|----------|
| 1 | **FR-HRM-PERF-SM-E3-01** | **#3** Sửa chu kỳ (PATCH) | **This endpoint** |
| 2 | **AC-PERF-01** | PATCH draft/open (`active`) | **This** |
| 3 | **BR-HRM-PERF-E3-01** | Cycle SM / lock | Transition |
| 4 | **AC-E3-SM-01** | closed→active | `HRM-SM-001` |

### Request ↔ DB

| DTO | Column |
|-----|--------|
| `cycle_name` | `cycle_name` |
| `start_date` / `end_date` | DATE |
| `status` | `status` (cycle enum) |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Not found / scope | `HRM-PERF-404` | 404 |
| Illegal SM | `HRM-SM-001` | 400 |
| Locked closed | `HRM-PERF-LOCKED` | 400 |
| Date order | `HRM-PERF-001` | 400 |

### FE after 2xx (U65)

List chu kỳ cập nhật · badge U72 · F5 giữ · Network body `status` = **code**.

---

## 2. Endpoint — DELETE performance cycle

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/performance/cycles/{cycleId}` |
| Success | `200` · **`HRM-PERF-200`** |
| Runtime | **ADD** — CASCADE deletes evals at DB if allowed |

### Mục đích

**Xóa chu kỳ nháp** không còn dùng — tránh rác SM; **không** xóa chu kỳ đã đóng / đang có phiếu ở giai trình.

### Nghiệp vụ xử lý

1. Auth + scope load → else `HRM-PERF-404`.
2. If `status ≠ 'draft'` → **`HRM-PERF-DEL-BLOCK`**.
3. If any eval `status ∈ {submitted,approved,completed}` → **`HRM-PERF-DEL-BLOCK`** (even if draft cycle inconsistency).
4. DELETE cycle (CASCADE evals only when remaining are draft/rejected empty set).
5. Return `{ id, deleted: true }` or envelope.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-PERF-02** · **FR-HRM-PERF-SM-E3-01** #4–#5 | **This endpoint** |
| 2 | Eval submitted+ present | `HRM-PERF-DEL-BLOCK` |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Blocked | `HRM-PERF-DEL-BLOCK` | 409 |
| Missing | `HRM-PERF-404` | 404 |

### FE after 2xx

Row biến mất · F5 không còn · **cấm** seed recreate.

---

## 3. Endpoint — PATCH performance evaluation

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/performance/evaluations/{evaluationId}` |
| Body | `score?`, `summary?`, `reviewer?`, `status?`, `kpi_code?`, `job_grade_key?`, `department_key?`, `kpi_name?` |
| Success | `200` · **`HRM-PERF-200`** |
| Runtime | **ADD** (create/list only today) |

### Mục đích

**Sửa phiếu đánh giá** và/hoặc **chuyển trạng thái SM** (draft→submitted→approved→completed) đồng thời gắn mã KPI / bậc / phòng ban từ catalog — đủ sức mạnh ERP PM-class.

### Nghiệp vụ xử lý

1. Auth; load eval in scope → else `HRM-PERF-404`.
2. Content fields (`score`/`summary`/`reviewer`/`kpi_*`) only when `status='draft'`; else **`HRM-PERF-LOCKED`**.
3. If `status` present → `assertStatusTransition('performance_evaluation', …)` per SRS §1.2 (4-state only); set audit stamps.
4. If `kpi_code` present → assert `kpi_library` → else `HRM-PERF-KPI-KEY`.
5. If `job_grade_key` / `department_key` present → assert catalogs (**AC-PERF-04/05**).
6. Score bounds 0..100.
7. UPDATE; return row.
8. Cycle should be `active` (`open`) to allow submit/approve — if cycle `closed`/`draft` block submit → **`HRM-PERF-CYCLE-STATE`** 400 (recommended).

### Tham chiếu bước SRS

| # | AC / FR | Diễn biến | API role |
|---|---------|-----------|----------|
| 1 | **FR-HRM-PERF-SM-E3-01** · **AC-PERF-03** | SM draft→…→completed | **This** |
| 2 | **AC-PERF-03** | skip jump | `HRM-SM-001` |
| 3 | **AC-PERF-04/05** | KPI + grade/dept | Assert |
| 4 | **BR-HRM-E3-U72-01** | Label VI | FE map |

### Request ↔ DB

| DTO | Column |
|-----|--------|
| `status` | `status` (eval SM) |
| `kpi_code` / `job_grade_key` / `department_key` | Soft keys |
| `kpi_name` | Snapshot |
| `score` / `summary` / `reviewer` | Existing |

### Errors

| Condition | Code | HTTP |
|-----------|------|------|
| Illegal SM | `HRM-SM-001` | 400 |
| Locked | `HRM-PERF-LOCKED` | 400 |
| Bad KPI/grade/dept | `HRM-PERF-*-KEY` | 400 |
| Not found | `HRM-PERF-404` | 404 |

### FE after 2xx

Badge SM VI · Network `status` code · F5 · Zod chặn thiếu required trước Network (AC-E3-ZOD).

---

## 4. Endpoint — DELETE performance evaluation

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/performance/evaluations/{evaluationId}` |
| Success | `200` · **`HRM-PERF-200`** |

### Mục đích

**Xóa phiếu nháp** — DoD DELETE eval; **cấm** xóa `submitted`+.

### Nghiệp vụ xử lý

1. Scope load → else 404.
2. Allow DELETE iff `status='draft'` → else **`HRM-PERF-DEL-BLOCK`**.
3. DELETE row; return ack.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-PERF-02** | **This** |

### FE after 2xx

List eval refresh · F5.

---

## 5. Endpoint — Transition note (non-duplication)

Prefer **§3 PATCH** with `{ "status": "submitted" }` as single mutate surface.  
Optional dedicated `POST …/evaluations/{id}/transition` **only if** SA wants CQRS split — must call same helper; **cấm** two divergent SM implementations.

---

## 6. Endpoint — List insurance policies

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/insurance-policies` |
| Query | `company_id`, `status?`, `q?` |
| Success | `200` · **`HRM-INS-POL-200`** · `{ total, data[] }` |

### Mục đích

**Liệt kê chính sách bảo hiểm** (master) theo đơn vị để màn Insurance quản lý depth ngang Contracts — không chỉ ghi nhận NV.

### Nghiệp vụ xử lý

1. Auth + `resolveHrmListScope`.
2. SELECT `hrm_insurance_policies` in scope; optional status/q filter.
3. Empty = honest empty.
4. Map `insurer_key` → FE label via catalog (U72); do not persist invent labels as SoT.

### Tham chiếu bước SRS

| # | AC / FR | Role |
|---|---------|------|
| 1 | **AC-E3-INS-CRUD** list | **This** |
| 2 | **FR-HRM-CI-02** depth | Master ahead of employee record |
| 3 | **AC-E3-F5** | F5 list stable |

### Response ↔ DB

| Wire | DB |
|------|-----|
| `id`, `company_id`, `policy_code`, `policy_name` | Columns |
| `insurer_key`, `insurer_label` | Soft + snapshot |
| `status`, dates, `notes` | Columns |

### Errors

Unauth / scope family — empty 200 OK.

---

## 7. Endpoint — Create insurance policy

### Identity

| Item | Value |
|------|--------|
| Method / path | `POST /api/hrm/contracts-insurance/insurance-policies` |
| Body | `policy_code`, `policy_name`, **`insurer_key`**, **`insurance_type`**, dates, `notes?`, `company_id`, `status?` default draft |
| Success | `201` · **`HRM-INS-POL-201`** |

### Mục đích

**Tạo chính sách BH** gắn nhà bảo hiểm từ Settings catalog — đóng free-text-only provider SoT ở tầng master.

### Nghiệp vụ xử lý

1. Persist slug via `resolveHrmPersistCompanyIdText`.
2. Required: `policy_code`, `policy_name`, `insurer_key`, `insurance_type`, `effective_date`.
3. `assertCodeInEffectiveCatalog('insurers', insurer_key)` → else **`HRM-INS-INSURER-KEY`**.
4. `assertCodeInEffectiveCatalog('insurance_types', insurance_type)` → else **`HRM-INS-TYPE-KEY`**.
5. Unique `(company_id, lower(policy_code))` → **`HRM-INS-POL-002`**.
6. Date check → **`HRM-INS-POL-001`**.
7. Optional snapshot `insurer_label` from catalog label.
8. INSERT `status='draft'` unless explicitly activated via SM helper.
9. Return row.

### Tham chiếu bước SRS

| # | AC / FR | Diễn biến | Role |
|---|---------|-----------|------|
| 1 | **FR-HRM-INS-DEPTH-E3-01** · **AC-INS-01** | Lưu chính sách | **This** |
| 2 | **AC-INS-02** | Chọn insurer code | Assert |
| 3 | **AC-INS-03** | Chọn insurance_type | Assert |
| 4 | Invent codes | Fail | KEY codes |
| 5 | **AC-E3-ZOD-AUDIT-01** | Thiếu required | 400 + FE Zod |

### Request ↔ DB

| DTO | Column |
|-----|--------|
| `insurer_key` | `insurer_key` |
| `insurance_type` | `insurance_type` |
| `policy_code` / `policy_name` | Columns |
| `effective_date` / `expiry_date` | DATE |
| `status` | SM |

### FE after 2xx

Row xuất hiện · Network `insurer_key` = **code** · F5 label VI.

---

## 8. Endpoint — Get insurance policy by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/insurance-policies/{policyId}` |
| Success | `200` · **`HRM-INS-POL-200`** |

### Mục đích

**Chi tiết chính sách** cho deep link / edit form — **cùng scope** với list (U19).

### Nghiệp vụ xử lý

1. `resolveHrmListScope` + filter id → else 404 (not 200 empty).
2. Return full row.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-E3-INS-CRUD** detail | **This** |
| 2 | J-* insurance deep link (matrix) | Consumer |

### scope_parity

List id under `main` **must** get-by-id 200 for same token.

---

## 9. Endpoint — PATCH insurance policy

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/contracts-insurance/insurance-policies/{policyId}` |
| Body | fields + optional `status` |
| Success | `200` · **`HRM-INS-POL-200`** |

### Mục đích

**Cập nhật / chuyển trạng thái** chính sách (draft→active→expired|cancelled) với validator SM dùng chung.

### Nghiệp vụ xử lý

1. Scope load → 404.
2. If `insurer_key` patched → catalog assert.
3. If `status` → `assertStatusTransition('insurance_policy', …)`.
4. Unique code if code changed.
5. UPDATE; return.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-E3-INS-SM** | Transition |
| 2 | **AC-E3-INS-CRUD** | Field update |

### Errors

`HRM-SM-001` · `HRM-INS-INSURER-KEY` · `HRM-INS-POL-002` · 404.

---

## 10. Endpoint — DELETE insurance policy

### Identity

| Item | Value |
|------|--------|
| Method / path | `DELETE /api/hrm/contracts-insurance/insurance-policies/{policyId}` |
| Success | `200` · **`HRM-INS-POL-200`** |

### Mục đích

**Xóa chính sách nháp / đã hủy** — không xóa `active` còn participant.

### Nghiệp vụ xử lý

1. Allow DELETE iff `status ∈ {draft, cancelled}`.
2. If any participant references `policy_id` → **`HRM-INS-POL-DEL-BLOCK`** 409 **or** require cancel-first policy.
3. Else DELETE.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-E3-INS-CRUD** delete | **This** |

---

## 11. Endpoint — PATCH employee insurance record

### Identity

| Item | Value |
|------|--------|
| Method / path | `PATCH /api/hrm/contracts-insurance/insurance/{recordId}` |
| Body | `insurer_key?`, `provider?`, `policy_number?`, `expiry_date?`, `status?`, `policy_id?` |
| Success | `200` · **`HRM-CON-200`** |
| Runtime | **ADD** — W1 residual «no PATCH» |

### Mục đích

**Cập nhật ghi nhận BH NV** ngang Contracts PATCH — bind insurer catalog + optional link policy master.

### Nghiệp vụ xử lý

1. Scope load record → 404/409 family.
2. Assert `insurer_key` when present; prefer require on create path (POST reinforce).
3. If `policy_id` → policy in scope.
4. Status via SM domain=`insurance_record`.
5. UPDATE.

### Tham chiếu bước SRS

| # | FR / AC | Role |
|---|---------|------|
| 1 | **FR-HRM-CI-02** mutate depth | **This** |
| 2 | **AC-E3-INS-INSURER** | Assert |

### FE after 2xx

List/expiring refresh · F5 · U-03 badges.

---

## 12. Endpoint — GET employee insurance by id

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/contracts-insurance/insurance/{recordId}` |
| Success | `200` · **`HRM-CON-200`** |

### Mục đích

Deep link / edit — **scope_parity** với list insurance.

### Nghiệp vụ xử lý

Same scope family as `GET …/insurance` list.

---

## 13. Endpoint — Insurance policy participants (E3 reinforce)

### Identity

| Item | Value |
|------|--------|
| Methods | Existing `POST/PATCH/DELETE /api/hrm/insurance-policy-participants` (+ GET) |
| Success | `HRM-INS-P-*` (stable codes — document OpenAPI) |

### Mục đích

**Ghi danh NV vào chính sách** với ràng buộc `policy_id` + `employee_id` — đóng orphan participant sau E2 mock-clean.

### Nghiệp vụ xử lý (delta vs E2)

1. On create/update: resolve `policy_id` in scope → else **`HRM-INS-POL-404`**.
2. Prefer policy `status='active'` for enroll → else **`HRM-INS-POL-STATUS`**.
3. Soft assert `employee_id` in scope → **`HRM-INS-EMP-404`**.
4. Optional copy `insurer_key` from policy.
5. Unique `(policy_id, employee_id)` → **`HRM-INS-P-DUP`**.
6. Existing field validation retained.

> **DOC-DELTA 2026-08-01 (`D-HDSD-BF-03-BH-400-01` / TC-049):** Khi body **không** gửi `policy_id`, BE soft-resolve **đúng 1** chính sách `status=active` trong scope (ưu tiên khớp `insurer_key` nếu có). **0** → `HRM-INS-POL-404` 400 (cấm orphan `policy_id` NULL). **>1** → `HRM-INS-POL-AMBIG` 400 — FE phải gửi `policy_id` (picker). Explicit `policy_id` path không đổi.

### Tham chiếu bước SRS

| # | AC | Role |
|---|-----|------|
| 1 | **AC-E3-INS-PART** | **This reinforce** |
| 2 | E2 AC-E2-NOMOCK | Live API must_keep |

### FE after 2xx

Payroll/Insurance participant grid · no mock · F5.

---

## 14. Endpoint — Leave decide (shared SM cite)

### Identity

| Item | Value |
|------|--------|
| Methods | Existing approve/reject leave |
| Delta | Route status change through `assertStatusTransition('leave', from, to)` |

### Mục đích

**Thống nhất validator SM** — `approved`/`rejected` chỉ từ `pending`; cấm đảo ngược im lặng.

### Nghiệp vụ xử lý

1. Load pending; if not pending → `HRM-LEAVE-404` **or** `HRM-SM-001`.
2. Transition map DB_DESIGN §2.2.
3. Keep existing fanout / codes (`HRM-LEAVE-*`).

### Tham chiếu bước SRS

FR-HRM-AT-12/13 · **AC-E3-SM-LEAVE**.

---

## 15. Endpoint — Recruitment stage PATCH (shared SM cite)

### Identity

| Item | Value |
|------|--------|
| Methods | Existing candidate/application stage PATCH |
| Delta | Illegal jumps + workflow lock already present — wrap/document via shared helper |

### Mục đích

Cùng family **constraint depth** E3 — không redesign pipeline.

### Tham chiếu bước SRS

AC-CD-F6-* · FR-HRM-INT-01 hire · **AC-E3-SM-REC**.

---

## 16. Endpoint — Settings catalog items (picker cite)

### Identity

| Item | Value |
|------|--------|
| Method / path | `GET /api/hrm/settings-catalogs/{catalogKey}/items` |
| Keys | `insurers`, `insurance_types`, `kpi_library`, `job_grades`, `departments` |

### Mục đích

Cấp options picker cho form Perf/Insurance — **không** invent sync URL mới (E1-B lesson).

### Tham chiếu bước SRS

AC-E3-INS-INSURER · AC-E3-PERF-KPI · E1-B picker contract.

---

## 17. POST reinforce — Create evaluation / create insurance (delta notes)

| Endpoint | E3 ADD on existing |
|----------|---------------------|
| `POST /performance/evaluations` | Default `status='draft'`; optional kpi/grade/dept assert; unique open eval |
| `POST /contracts-insurance/insurance` | Require `insurer_key` assert; optional `policy_id`; `provider` snapshot |

Full F.1 bodies remain in W2 / CI baselines — E3 **APPEND** these asserts.

---

## 18. Zod / FE constraint coverage (contract for Dev-FE)

| Form surface | Required (min) | FK/catalog | Unique UX |
|--------------|----------------|------------|-----------|
| Performance cycle | name, dates | — | Overlap toast |
| Performance eval | employee, cycle, score, summary, reviewer | kpi/grade/dept when shown | Dup toast |
| Insurance policy | code, name, insurer_key, effective_date | insurers | code dup |
| Insurance record | employee, insurer_key, policy_number, expiry | insurers, policy | — |
| Participant | policy_id, employee | policy+emp | dup enroll |
| Leave / Rec | existing + SM | — | — |

**AC-E3-ZOD:** FE blocks missing required **before** Network; BE still enforces (defense in depth). Audit target ≥90% mutate forms — QA grep evidence.

---

## 19. Acceptance (API plane E3)

| Check | PASS |
|-------|------|
| §§1–13 have Mục đích · Nghiệp vụ · Bước SRS | This file |
| Eval SM path + cycle PATCH/DELETE designed | §§1–4 |
| Policy CRUD + insurer assert | §§6–10 |
| Participant FK assert | §13 |
| Shared SM Leave/Rec cite | §§14–15 |
| scope_parity get-by-id | §§8,12 |
| No tax invent | must_keep E2 |
| OpenAPI delta | SA/Dev after ack |

---

## 20. Residuals

| ID | Owner |
|----|-------|
| OpenAPI path freeze (`insurance-policies` prefix) | **CLOSED** — `SA-ERP-E3-ACK-01` (canonical CI prefix) |
| Formal E3 SRS Diễn biến numbered | **CLOSED** — `BA_ERP_E3_SRS_01` |
| Implement + jest SM matrix | dev-be |
| FE Zod + SM buttons U72 | dev-fe |
| Browser E2E cycle + policy create | qa |

---

## 21. DOC-DELTA pointers

| File | Pointer |
|------|---------|
| `API_DESIGN_HRM_W2_SLICE.md` | E3 ADD PATCH/DELETE cycles/evals + eval SM → this file |
| `API_DESIGN_HRM_CONTRACTS_INS.md` | E3 policy CRUD + insurance PATCH/GET-by-id + insurer assert |
| `API_DESIGN_HRM_ERP_E2.md` | Participants §8 → E3 FK depth |
|
