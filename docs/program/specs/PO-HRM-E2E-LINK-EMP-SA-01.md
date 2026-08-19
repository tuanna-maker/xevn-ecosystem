# PO-HRM-E2E-LINK-EMP-SA-01 — TechSpec F.1 + DB/API intents · EMP E2E linkage

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-SA-01` |
| **program** | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| **lane** | governance · sa |
| **change_mode** | ADD · **NO CODE** `apps/**` |
| **Date** | 2026-08-06 |
| **Status** | **DRAFT TechSpec depth** — **ba-data DB-01 CONFIRMED** (`po-hrm-e2e-link-emp-db-01.md`) · Dev unlock BE/FE parallel; honesty UAT flags still false |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.12+** · **FR-UC-BP-CORE-01a** · **CORE-10** · **REC-07** AC-HTP-05 · CORE-01/02 ring · AC-WH-PICK |
| **ref_team** | [`docs/hrm/SRS.md`](../../hrm/SRS.md) UC-HRM-27 **BR-DEC-05** · **AC-DEC-EMP-01** · §16.4 WH picker |
| **ref_ba** | [`PO-HRM-E2E-LINK-EMP-SPEC-01.md`](./PO-HRM-E2E-LINK-EMP-SPEC-01.md) §D.2/D.5/D.6 · §E · docs evidence `po-hrm-e2e-link-emp-docs-01.md` |
| **Client pointers** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) · [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6/§3.9 · [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-CORE-EMP-03 · F-CORE-SI-01 — **DOC-DELTA cite only · no wipe** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Context & objective

**Business intent (sponsor / SPEC-01):** Journey J-HRM-01..04 🟢 ≠ Hire-to-Pay bước 5 + QSĐ→lịch sử + BH timeline đóng. Docs merge **DONE** (CORE-01a · AC-SI-TL · AC-HTP-05 · BR-DEC-05). Wave này khóa **hợp đồng kỹ thuật** trước code.

**Architecture truth (locked from AS-IS + enterprise paper):**

| Lock | Rule |
|------|------|
| Decision SoT | Physical AS-IS `public.hr_decisions` · logical enterprise may alias `hrm_decision` — **ONE** row per quyết định |
| Work history SoT | Physical AS-IS `public.employee_work_timeline` · logical `hrm_employment_history` — **alias map**, không dual table write |
| WH ← QSĐ | Khi QSĐ loại gắn người → **hiệu lực**: append/update WH với **`decision_id` UUID** (không chỉ `decision_ref` text) + `position_key` / `department_key` catalog |
| WH picker | Create/update WH thủ công: `position_key` (+ `department_key` khi bắt buộc) từ catalog — **cấm** free-text SoT |
| SI timeline | Enrollment + rate periods append-only; actions **close \| stop \| suspend \| change_rate** (+ resume) — **không** silent overwrite |
| HTP-05 | Sau hire: `employee_id` + cùng `company_id` + tồn tại HĐ `active` (hoặc status SoT tương đương) trước payroll bước 6 |
| Scope | List / get / mutate cùng `resolveHrmListScope` (U19) |
| FORBIDDEN | Seed để PASS · claim personnel UAT · wipe F-CORE-EMP-03 / F-CORE-SI-01 stubs · OCR CORE-04 · C&B fields trên public employee serializer |
| Dev gate | **ba-data DB confirm** (cột `decision_id` + SI action columns + alias) trước `apps/**` |

---

## 1. Options (short) → recommendation

| Option | Scope | Risk | Verdict |
|--------|-------|------|---------|
| **A — Overlay F.1 trên AS-IS tables** | ADD `decision_id` / SI action columns trên `employee_work_timeline` + insurance tables; deepen F-CORE-EMP-03 / F-CORE-SI-01 / ADD F-CORE-DEC-* · F-CORE-HTP-05 | Thấp — preserve Nest paths | **RECOMMENDED** |
| **B — New logical tables only, dual-write AS-IS** | Invent parallel `hrm_employment_history` runtime | Cao — dual SoT | **REJECT** GĐ1 |
| **C — Defer WH write to batch job** | Async WH after decision | Spine AC-DEC-WH-02 F5 fails UX | **REJECT** GĐ1 |

**Recommended: Option A.** Soft FK `decision_id` → `hr_decisions.id`; WH physical remains `employee_work_timeline`.

---

## 2. Capability map — F-CORE-EMP-LINK family

**Prefix physical (AS-IS Nest prefer):** `/api/hrm/decisions` · `/api/hrm/employees/.../work-timeline` (profile) · `/api/hrm/contracts` · insurance routes hiện hữu  
**Prefix logical (enterprise API_DESIGN):** `/api/hrm/core/...`  
**Envelope:** `{ code, message, data }`  
**Scope:** JWT + `company_id` + assert resource in scope.

| Cap | F-id | METHOD / path (physical prefer) | Logical alias | SRS / AC |
|-----|------|----------------------------------|---------------|----------|
| Create/patch QSĐ gắn người (bắt `employee_id`) | **F-CORE-DEC-01** | `POST/PATCH /decisions` | `POST/PATCH /core/decisions` | CORE-01a #1–3 · AC-DEC-WH-01 · AC-DEC-EMP-01 · BR-DEC-05 |
| Transition / set hiệu lực → write WH | **F-CORE-DEC-02** | `PATCH /decisions/:id` (status→effective) *hoặc* `POST …/decisions/:id/activate` | same | CORE-01a #4 · AC-DEC-WH-02..04 |
| List/get WH (display-ready + decision ref) | **F-CORE-WH-01** | `GET …/employees/:id/work-timeline` | `GET …/employment-history` | CORE-01a #5 · AC-DEC-WH-02/04 |
| Manual WH create/update (picker keys) | **F-CORE-WH-02** | `POST/PATCH …/work-timeline` | `POST …/employment-history` | AC-WH-PICK-01..03 · deepen F-CORE-EMP-03 |
| SI timeline list | **F-CORE-SI-02** | `GET …/insurance` (+ periods) | F-CORE-SI-01 GET | CORE-10 #1 · AC-SI-TL-05 |
| SI action Đóng/Ngừng/Tạm hoãn/Đổi mức | **F-CORE-SI-03** | `POST …/insurance/actions` *(deepen F-CORE-SI-01)* | same | CORE-10 #2–3 · AC-SI-TL-01..04 |
| HTP-05 readiness (employee + active contract) | **F-CORE-HTP-05** | `GET …/employees/:id/hire-readiness` *hoặc* embed on hire/profile GET | read-model | REC-07 AC-HTP-05-01..03 |

**Reuse — không invent SoT mới:**

- Decision CRUD vẫn Nest `DecisionsService` / `hr_decisions`.  
- Contract active check = `employee_contracts.status='active'` (+ date window) cùng `company_id`.  
- Catalog pickers = Settings `job_titles` / dept catalogs (BR-HRM-MD-01).  
- F-CORE-EMP-01/02 ring split **must_keep** (D1 C&B — FE/BE riêng; không mở C&B trên public trong wave này ngoài residual).

---

## 3. API_DESIGN F.1

### 3.1 F-CORE-DEC-01 — Create / patch quyết định gắn người

| | |
|--|--|
| **Mục đích** | Lưu QSĐ loại gắn người chỉ khi đã chọn `employee_id` trong scope; `position_key` catalog SoT; tên NV = denorm hiển thị. |
| **Nghiệp vụ xử lý** | (1) Resolve scope. (2) Nếu `decision_type` ∈ nhóm gắn người (appointment/transfer + tenant config) → **require** `employee_id` UUID tồn tại trong scope — thiếu → `HRM-DEC-EMP-REQUIRED` 400. (3) Assert `position_key` ∈ `job_titles` (giữ AS-IS). (4) `employee_name` denorm từ hồ sơ nếu có id — **không** cho SoT chỉ tên chữ. (5) Draft/saved chưa hiệu lực → **không** ghi WH. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-01a** Diễn biến **#1–#3** · BR-BP-DEC-EMP-01 · team **BR-DEC-05** · **AC-DEC-EMP-01** · **AC-DEC-WH-01**. |
| **Request → DB** | `hr_decisions`: `employee_id` (NOT NULL khi gắn người), `employee_name`, `decision_type`, `position_key`, `department`/`department_key?`, `effective_date`, `status`. |
| **Response** | Decision DTO display-ready (`employee_id`, `employee_name`, `position_key`, `position_label?`). |
| **Lỗi** | `HRM-DEC-EMP-REQUIRED` · `HRM-DEC-POS-KEY` · `HRM-SCOPE-409` · `404` employee ngoài scope |

---

### 3.2 F-CORE-DEC-02 — Hiệu lực QSĐ → ghi lịch sử công tác

| | |
|--|--|
| **Mục đích** | Khi QSĐ gắn người chuyển / đã **hiệu lực**, tạo hoặc cập nhật dòng WH gắn `decision_id` + mã chức danh — F5 hồ sơ vẫn thấy. |
| **Nghiệp vụ xử lý** | (1) Chỉ khi `status` ∈ hiệu lực SoT (vd. `effective` / `active` — ba-data chốt enum). (2) Idempotent: nếu đã có WH row `decision_id = :id` → update keys/dates; else **append**. (3) Set `source_module='decision'`, `to_position_key`/`position_key` ← decision.position_key, `department_key` ← decision, `effective_from`/`event_date` ← effective_date. (4) **Cấm** hard-delete WH khi hủy QSĐ — mark superseded / status per BR (AC-DEC-WH-04). (5) Same TXN với PATCH status khi có thể. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-01a** Diễn biến **#4–#5** · Thành công · **AC-DEC-WH-02..04** · **AC-DEC-WH-03**. |
| **Request → DB** | Read `hr_decisions` → write `employee_work_timeline` (+ columns §4): `decision_id`, `position_key`, `department_key`, `event_date`/`effective_from`, `event_type` map appointment\|transfer, `source_module`. |
| **Response** | `{ decision_id, work_history_id, employee_id }` |
| **Lỗi** | `HRM-DEC-EMP-REQUIRED` nếu thiếu id lúc activate · `HRM-DEC-NOT-EFFECTIVE` nếu gọi sớm · scope 409 |

**Idempotency contract (locked):**

```text
ON decision → effective (person-bound):
  UPSERT employee_work_timeline
    WHERE decision_id = decision.id
    SET position_key, department_key, event_date, …
  ELSE INSERT … decision_id = decision.id
FORBIDDEN: free-text position as SoT on auto row
```

---

### 3.3 F-CORE-WH-01 — List / get work history

| | |
|--|--|
| **Mục đích** | Hồ sơ tab lịch sử: dòng display-ready gồm mã chức danh + tham chiếu QSĐ khi có. |
| **Nghiệp vụ xử lý** | (1) Scope parity list↔employee. (2) Return `position_key` + label; `decision_id` + optional `decision_code`. (3) Không lộ C&B. |
| **Tham chiếu bước SRS** | CORE-01a **#5** · AC-DEC-WH-02/04. |
| **Response → DB** | `employee_work_timeline.*` (+ join soft `hr_decisions` for code/title). |
| **Lỗi** | `404` / `HRM-SCOPE-409` |

---

### 3.4 F-CORE-WH-02 — Manual WH create/update (picker keys) — deepen F-CORE-EMP-03

| | |
|--|--|
| **Mục đích** | Mọi tạo/sửa WH thủ công bắt buộc catalog keys — đóng AC-WH-PICK / D2. |
| **Nghiệp vụ xử lý** | (1) Require `position_key` ∈ job_titles. (2) Require `department_key` khi BR bắt buộc. (3) Reject body với chỉ `position`/`department` free-text SoT → `HRM-WH-PICK-REQUIRED`. (4) Empty catalog → 400 + message cấu hình (không cho thoát chữ tay). (5) Optional `decision_id` nếu user neo tay — validate FK + scope. |
| **Tham chiếu bước SRS** | CORE-01a **#6** · **AC-WH-PICK-01..03** · team BR-HRM-MD-01 / AC-HRM-PICKER-01. |
| **Request → DB** | `position_key`, `department_key?`, `event_date`, `event_type`, `decision_id?`, `source_module='manual'`. Denorm `position`/`department` labels OK read-only. |
| **Lỗi** | `HRM-WH-PICK-REQUIRED` · `HRM-WH-PICK-EMPTY-CATALOG` · catalog assert codes · scope 409 |

---

### 3.5 F-CORE-SI-02 / F-CORE-SI-03 — Timeline + actions (deepen F-CORE-SI-01)

| | |
|--|--|
| **Mục đích** | Action vòng đời BH: **Đóng / Ngừng / Tạm hoãn / Đổi mức** (+ resume) ghi **dòng mới**; kỳ lương đọc mức hiệu lực theo ngày. |
| **Nghiệp vụ xử lý** | (1) AuthZ C&B (hoặc HCNS theo BR). (2) `POST …/actions` body: `action` ∈ `close`\|`stop`\|`suspend`\|`change_rate`\|`resume`; `effective_from` date; `suspend_reason` khi suspend (config). (3) Update enrollment `status` map: active↔suspended↔stopped/closed. (4) **Append** `insurance_rate_period` / physical rate row — set prior `effective_to` = day-before; **cấm** UPDATE đè amount/rate im lặng. (5) `change_rate` copies new pct/amount; suspend keeps history (`period_status=suspended`). |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-10** Diễn biến **#1–#5** · **AC-SI-TL-01..06** (AC-SI-TL-06 = residual PAY read — trace only). |
| **Request → DB** | Logical: `hrm_insurance_enrollment.status` + `hrm_insurance_rate_period` append. Physical AS-IS alias (ba-data confirm): map lên `employee_insurance_records` / `employee_insurances` / `hrm_insurance_policy_participants` + period table nếu thiếu → **ADD period table** intent. |
| **Response** | Enrollment + `periods[]` timeline (cũ + mới). |
| **Lỗi** | `HRM-SI-ACTION-400` thiếu ngày/căn cứ · `HRM-CORE-CB-403` · `409` overlap · `HRM-SCOPE-409` |

**Action → status map (intent — ba-data chốt enum 1:1):**

| action | enrollment.status | period_status (new row) |
|--------|-------------------|-------------------------|
| `close` | `closed` | `closed` |
| `stop` | `stopped` | `stopped` |
| `suspend` | `suspended` | `suspended` |
| `change_rate` | giữ `active` (trừ khi đang suspend) | `applying` |
| `resume` | `active` | `applying` |

> **Close residual Q-SI-SUSPEND:** Wave này **locks** action set = SRS AC-SI-TL-01..04. TechSpec §11 `R-BP-SI-SUSPEND` → **SUPERSEDED by EMP-SA-01** for GĐ1 action vocabulary (PAY read AC-SI-TL-06 vẫn residual PAY).  
> **DB-01 CONFIRMED (2026-08-06):** enrollment SoT = `employee_insurances`; period table **ADD** `hrm_insurance_rate_period` — see `PO-HRM-E2E-LINK-EMP-DB-01.md`.

---

### 3.6 F-CORE-HTP-05 — Hire-to-Pay bước 5 readiness

| | |
|--|--|
| **Mục đích** | Sau nhận việc: xác nhận hồ sơ + **HĐ hiệu lực cùng pháp nhân**; thiếu HĐ → payroll bước 6 **chặn / báo rõ** (không seed). |
| **Nghiệp vụ xử lý** | (1) Input `employee_id` (+ `company_id` scope). (2) Load employee in scope. (3) Query contracts: tồn tại row `status='active'` (hoặc SoT tương đương) với **cùng** `company_id` và date window chứa ngày kiểm tra. (4) Optional: BH participant flag nếu BR bắt buộc trước lương (config — default **không** block GĐ1 trừ BR on). (5) Return readiness DTO cho FE checklist / gate bước 6. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-07** Diễn biến **#3–#5** · **AC-HTP-05-01..03**. |
| **Request → DB** | Read `employees` / AS-IS employee · `employee_contracts` (`id`, `status`, `start_date`, `end_date`, `company_id`). |
| **Response** | |
| | `HireReadiness = { employee_id, company_id, profile_ok: boolean, active_contract: { contract_id, status } \| null, ready_for_payroll: boolean, blockers: string[] }` |
| **Lỗi** | `404` · `HRM-SCOPE-409` — **không** 500 khi thiếu HĐ (ready_for_payroll=false + blockers) |

**AC map:**

| AC | API behavior |
|----|----------------|
| AC-HTP-05-01 | `profile_ok && active_contract != null` |
| AC-HTP-05-02 | GET idempotent after F5; out-of-scope → 404/409 |
| AC-HTP-05-03 | `ready_for_payroll=false` + blocker code `HRM-HTP-NO-ACTIVE-CONTRACT` khi thiếu HĐ — PAY bước 6 đọc cùng gate |

---

## 4. DB_DESIGN intents (ba-data confirm)

### 4.1 Alias map (ONE physical — no dual SoT)

| Logical (enterprise) | Physical AS-IS (Nest) | Notes |
|----------------------|-----------------------|-------|
| `hrm_decision` | `hr_decisions` | Keep |
| `hrm_employment_history` | `employee_work_timeline` | Alias — **ADD** columns below |
| `hrm_insurance_enrollment` | `employee_insurances` | **CONFIRMED EMP-DB-01** — ONE enrollment SoT |
| `hrm_insurance_rate_period` | **ADD** `hrm_insurance_rate_period` | Required for AC-SI-TL-04/05 |
| `employee_contracts` | `employee_contracts` | HTP-05 |

### 4.2 `employee_work_timeline` / logical `hrm_employment_history` — ADD columns

| Cột | Kiểu | Null | Ý nghĩa |
|-----|------|------|---------|
| `decision_id` | uuid | YES | Soft FK → `hr_decisions.id`; **NOT NULL** trên row `source_module='decision'` |
| `source_module` | text | YES | `decision` \| `manual` |
| `position_key` | text | YES→**require** on write | AS-IS đã có — enforce NOT NULL on mutate API |
| `department_key` | text | YES | AS-IS đã có |
| `event_date` | date | NO | AS-IS — map effective_from |
| `archived_at` | timestamptz | YES | Soft supersede khi hủy QSĐ (prefer over hard DELETE) |

| **IX** | `(decision_id)` UNIQUE WHERE decision_id IS NOT NULL · `(employee_id, event_date)` |
| **Rule** | Auto row from F-CORE-DEC-02 must set `decision_id` + `position_key`; free-text `position` denorm only |
| **ref_srs** | FR-UC-BP-CORE-01a · AC-DEC-WH-02..03 · AC-WH-PICK |

> Enterprise §3.9 `decision_ref` text **giữ** cho số QĐ hiển thị; **không** thay `decision_id` UUID soft FK.

### 4.3 `hr_decisions` — constraint intent

| Change | Intent |
|--------|--------|
| `employee_id` | **Required** when `decision_type` ∈ person-bound set (app-level + CHECK optional) — BR-DEC-05 |
| Person-bound set | Config/catalog; defaults: `appointment`, `transfer` (+ aliases tenant) |
| status enum | Include explicit **effective** (or document AS-IS value that means hiệu lực) for F-CORE-DEC-02 trigger |

### 4.4 Insurance timeline — ADD / deepen

| Intent | Detail |
|--------|--------|
| Enrollment SoT | ba-data chọn **một** physical enrollment table; map status `active\|suspended\|stopped\|closed` |
| Period table | Nếu thiếu: ADD `hrm_insurance_rate_period`-shaped table FK enrollment; append-only |
| Action audit | `change_reason` / `suspend_reason` / `action` on period row |
| PAY | Soft `pay_rate_cfg_id` optional; AC-SI-TL-06 = PAY consumer residual |

### 4.5 HTP-05 — no new table (prefer)

Read-model over `employees` + `employee_contracts`. Optional cache column **FORBIDDEN** GĐ1 unless ba-data proves need.

---

## 5. Error taxonomy (ADD)

| Code | HTTP | When |
|------|------|------|
| `HRM-DEC-EMP-REQUIRED` | 400 | Person-bound QSĐ thiếu `employee_id` |
| `HRM-DEC-NOT-EFFECTIVE` | 409 | Activate/WH write khi chưa hiệu lực |
| `HRM-WH-PICK-REQUIRED` | 400 | WH thiếu `position_key` / free-text SoT |
| `HRM-WH-PICK-EMPTY-CATALOG` | 400 | Catalog trống — chặn chữ tay |
| `HRM-SI-ACTION-400` | 400 | SI action thiếu ngày / căn cứ tạm hoãn |
| `HRM-HTP-NO-ACTIVE-CONTRACT` | *(in blockers)* | Readiness false — không dùng để 500 |

---

## 6. Trace matrix — Diễn biến → F-id

| SRS | Bước / AC | F-id |
|-----|-----------|------|
| CORE-01a | #1–3 · AC-DEC-WH-01 · AC-DEC-EMP-01 | F-CORE-DEC-01 |
| CORE-01a | #4–5 · AC-DEC-WH-02..04 | F-CORE-DEC-02 · F-CORE-WH-01 |
| CORE-01a | #6 · AC-WH-PICK-01..03 | F-CORE-WH-02 |
| CORE-10 | #1–5 · AC-SI-TL-01..05 | F-CORE-SI-02/03 |
| CORE-10 | AC-SI-TL-06 | PAY residual (cite F-PAY-CB-READ) |
| REC-07 | #3–5 · AC-HTP-05-01..03 | F-CORE-HTP-05 |
| CORE-01/02 | ring (D1) | F-CORE-EMP-01/02 **must_keep** — FE hide residual |

---

## 7. Client DOC-DELTA (no wipe)

| File | ADD only |
|------|----------|
| `TECHSPEC_HRM_ENTERPRISE.md` | Header work_item cite · matrix row CORE-01a / CORE-10 / REC-07 HTP · residual R-BP-EMP-E2E-* |
| `API_DESIGN_HRM_ENTERPRISE.md` | Header cite · pointer F-CORE-DEC/WH/SI/HTP → program SA-01 (full F.1 lives here until ba-data+optional API merge) |
| `DB_DESIGN_HRM_ENTERPRISE.md` | Header cite · §3.9 note `decision_id` soft FK intent |

**Cấm** rewrite F-CORE-EMP-03 / F-CORE-SI-01 bodies in-place trong seat này — deepen bằng overlay SA-01.

---

## 8. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| J-HRM-01..04 cross-nav | `apps/**` until DB confirm |
| Soft-delete / no hard-delete WH history | Dual-write logical+physical WH |
| Catalog `position_key` on decisions (AS-IS) | Free-text WH SoT |
| F-CORE-EMP-01/02 ring split paper | Claim `hrm_personnel_uat_ready` |
| U65 zero-seed | Seed QSĐ/HĐ/BH for QA PASS |
| CORE-09 template wizard | In-scope P0 this wave — **FE-TPL-01 later** (SPEC §E) |

---

## 9. Cascade / Dev HOLD

```text
PO-HRM-E2E-LINK-EMP-DOCS-01 ✅
  → PO-HRM-E2E-LINK-EMP-SA-01 ✅ (this)
  → PO-HRM-E2E-LINK-EMP-DB-01 (ba-data) — confirm §4 physical columns + enrollment SoT ONE table
  → [optional] API client merge if ba-data needs enum stamp in API_DESIGN
  → PO-HRM-E2E-LINK-EMP-BE-01 + FE-01 parallel
  → FE-TPL-01 (CORE-09) · QA-01
```

**Dev HOLD lifts** only when: ba-data **CONFIRMED** §4 + PM stamp; honesty flags remain **false** until QA D1/D2/D5/D6/D7.

---

## 10. Completion contract

- `completion_report`: ADD TechSpec F.1 F-CORE-DEC-01/02 · WH-01/02 · SI-02/03 · HTP-05; DB intents `decision_id`→WH + SI period/actions + HTP read-model; alias AS-IS locked Option A; client DOC-DELTA pointers; **no** `apps/**`; honesty false.
- `next_owner`: **ba-data** (`PO-HRM-E2E-LINK-EMP-DB-01`) → then PM unlock **dev-be** + **dev-fe**.
- `next_dispatch_prompt`: copy-ready in evidence.
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-e2e-link-emp-sa-01.md`
