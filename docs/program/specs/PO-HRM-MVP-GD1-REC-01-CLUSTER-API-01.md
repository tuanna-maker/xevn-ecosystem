# PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01 — API F.1 · Định biên × Auto YCTD (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous) |
| **lane** | governance · sa |
| **change_mode** | **ADD / UPGRADE** DOC-DELTA · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A + DTO↔column + spawn |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ref_data** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md) **CONFIRMED** (physical SoT) |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md) **§8–§9** Option A · HC-S1..S7 · D1–D4 |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md) **O1–O5** · AC/VAL · Diễn biến FE |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-01** · **FR-UC-BP-REC-01b** Diễn biến |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-HC-01..03/05** = **logical alias only** |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base path | **`/api/hrm/recruitment/recruitment-plans*`** (Nest `@Controller('recruitment')`) |
| Paper path | `/api/hrm/rec/headcount-plans*` = **logical alias only** — **DENY** greenfield Nest controller |
| Cell qty SoT | API DTO **`need_hire`** ↔ DB projection **`headcount_need_hire`** (DATA-01 §6) |
| Legacy dual | **FORBIDDEN** persist/accept `ns`+`dx` as SoT post-wave (VAL-REC-HC-15 · O1) |
| Spawn | **ADD** `POST …/recruitment-plans/:planId/spawn-requests` · HC-S1..S7 · errors `HRM-HC-*` |
| YCTD write | Insert/reuse `public.job_requisitions` · `headcount_mode=in_plan` · soft `headcount_cell_id` |
| XBOS WF | **RETAIN** `POST …/submit-workflow` + bridge `hrm_recruitment_plan_approval` |
| Dual SoT | **DENY** `/rec/headcount-plans` Nest + **DENY** dual `rec_headcount_*` table |
| REC-03 / campaign | **OUT** — spawn **không** bắt `job_postings` / Campaign |
| This seat | Docs + client pointer only — **NO** `apps/**` · **NO** seed · **NO** honesty flip |

```text
  FE «Kế hoạch tuyển» ≡ Định biên
        │
        ▼
  /api/hrm/recruitment/recruitment-plans*   ← PHYSICAL SoT (Option A)
        │  paper /rec/headcount-plans* = alias
        ▼
  recruitment_plans + dept/pos + months_data cells
        │  approve → lock need_hire cells
        ▼
  POST …/:planId/spawn-requests  (F-REC-HC-05 ADD)
        │
        ▼
  job_requisitions (YCTD LIVE) headcount_mode=in_plan
```

---

## 2. AS-IS Nest baseline → gap

| Endpoint (AS-IS) | Code | Gap vs F.1 |
|------------------|------|------------|
| `GET /recruitment/recruitment-plans?company_id=` | LIVE · `listRecruitmentPlans` + `resolveHrmListScope` | **UPGRADE** response cells normalize; optional `year` filter |
| `POST /recruitment/recruitment-plans` | LIVE create nested dept/pos/`months` | **UPGRADE** DTO keys + catalog keys + cell shape |
| `DELETE /recruitment/recruitment-plans/:planId` | LIVE | **RETAIN** (soft-delete prefer later — OUT invent hard policy) |
| `PATCH …/:planId/status` | LIVE | **UPGRADE** approve semantics + cell lock (F-REC-HC-03) |
| `POST …/:planId/submit-workflow` | LIVE XBOS | **RETAIN** = F-REC-HC-02 physical |
| `GET …/:planId` | **ABSENT** | **ADD** get-by-id · **same** `resolveHrmListScope` (U19) |
| `PUT …/:planId` (upsert cells) | **ABSENT** (only create) | **ADD** upsert grid (F-REC-HC-01 write) |
| `POST …/:planId/spawn-requests` | **ABSENT** | **ADD** F-REC-HC-05 |
| Requisitions CRUD | LIVE `/requisitions*` | **RETAIN** must_keep UF-HRM-12 · spawn uses same insert path |

**Envelope RETAIN:** `{ code, message, data }` · codes `HRM-REC-PLAN-*` coexist with new `HRM-HC-*` for headcount-domain errors.

---

## 3. Path & alias lock (D1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/recruitment-plans` · `/api/hrm/recruitment/recruitment-plans/:planId` · `…/submit-workflow` · `…/spawn-requests` |
| **LOGICAL (paper)** | `/api/hrm/rec/headcount-plans/{year}` · `…/cells` · `…/submit` · `…/approve` · `…/spawn-requests` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional later — **not** required for unlock. |

| Paper field | Physical DTO | DB column / projection | Rule |
|-------------|--------------|------------------------|------|
| `need_to_hire` / `need_hire` | **`need_hire`** (canonical) | `months_data[].headcount_need_hire` | Accept either alias on write; normalize to `need_hire` in response; persist **only** `headcount_need_hire` |
| `current_headcount` | `headcount_current` | `months_data[].headcount_current` | Snapshot (legacy `ns`) |
| `projected` | `headcount_projected` | `months_data[].headcount_projected` | Only when `cell_status=projected` |
| `status` (cell semantic) | `cell_status` | `months_data[].cell_status` | `current` \| `need_hire` \| `projected` |
| `cell_status` lifecycle paper | `lifecycle_status` | `months_data[].lifecycle_status` | `open` \| `need_hire_approved` \| `fulfilled` \| `cancelled` |
| `plan_cell_id` | `cell_id` | `months_data[].cell_id` | Soft target of YCTD `headcount_cell_id` |
| `org_unit_id` / dept | `department_key` | `recruitment_plan_departments.department_key` | Catalog SoT; `name` denorm |
| `position_id` | `position_key` | `recruitment_plan_positions.position_key` | Catalog SoT; `name` denorm |
| `qty` (YCTD) | `headcount` | `job_requisitions.headcount` | RETAIN G-RC-01 ≥1 |
| `in_headcount` / flag | `headcount_mode` | `job_requisitions.headcount_mode` | `in_plan` \| `out_of_plan` |
| `job_description_id` | `job_template_id` | `job_requisitions.job_template_id` | Soft FK RETAIN (JD-YCTD-REF) |
| Legacy `ns` / `dx` | — | migrate only | **400** `HRM-HC-LEGACY-DUAL` if client posts both as SoT post-wave |

**FORBIDDEN:** Dual response columns `ns`+`dx` as editors · invent `need_hire` **and** `dx` persist · create Nest `/rec/headcount-plans`.

---

## 4. Status token map (D2)

| Plan AS-IS | Normative API | Paper |
|------------|---------------|-------|
| `pending` | `draft` (accept synonym until FE remaster) | draft |
| submitted / chờ duyệt | `pending_approval` | submitted |
| `approved` | `approved` | approved |
| `rejected` | `rejected` | rejected |

| Cell semantic | API `cell_status` |
|---------------|-------------------|
| Hiện tại | `current` |
| Cần tuyển | `need_hire` |
| Dự kiến | `projected` |

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** list / get / mutate / spawn = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` + `resolveHrmPersistCompanyIdText` (U19 `scope_parity`).

---

### 5.1 F-REC-HC-01 — Get / upsert lưới định biên

#### 5.1.1 GET list (RETAIN + UPGRADE)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/recruitment-plans` |
| **Mục đích** | Liệt kê lưới định biên («Kế hoạch tuyển») theo phạm vi pháp nhân; hỗ trợ HCNS rollup đọc. |
| **Nghiệp vụ xử lý** | (1) Resolve JWT + `company_id`. (2) `resolveHrmListScope` filter `recruitment_plans`. (3) Join dept/pos + normalize `months_data` → cell DTO (`need_hire`, `cell_status`, `cell_id`, …). (4) Optional query `year` filter. (5) HCNS / Group CEO `main` = rollup read (AC-REC-HC-01e · O5) — **không** write-all-depts. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01** Diễn biến **#1** · Thành công (mở lưới) · BA Diễn biến FE bước 1 · AC-REC-HC-01 / 01e. |
| **Request** | Query: `company_id` (required); `year?`. |
| **Response → DB** | `data[]` ← `recruitment_plans` + nested `departments[]` ← `recruitment_plan_departments` + `positions[]` ← `recruitment_plan_positions` + `months`/`cells[]` ← `months_data` projection (DATA-01 §6). |
| **Lỗi** | `HRM-SCOPE-409` / `HRM-REC-PLAN-409` · empty list **200** hợp lệ. |

#### 5.1.2 GET by id (ADD — scope_parity)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/recruitment-plans/:planId` |
| **Mục đích** | Deep link / F5 detail đúng một plan — **cùng** scope list (U19). |
| **Nghiệp vụ xử lý** | Load by UUID → `assertResourceInHrmScope` **identical** to list filters → return same nested shape as list item. **FORBIDDEN** 404 when list would include row (rollup skew). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01** Diễn biến **#1** · AC-REC-HC-01-EX-07 · VAL-REC-HC-DATA-10. |
| **Request** | Path `planId` · query `company_id`. |
| **Response → DB** | Same projection as §5.1.1 item. |
| **Lỗi** | `HRM-REC-PLAN-404` · `HRM-REC-PLAN-409` scope mismatch. |

#### 5.1.3 POST create / PUT upsert (UPGRADE + ADD)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/recruitment-plans` (**RETAIN**) · **`PUT /api/hrm/recruitment/recruitment-plans/:planId`** (**ADD** upsert cells) |
| **Mục đích** | TP phòng lưu lưới 12 tháng với **một** số **Cần tuyển** / ô + catalog keys (không free-text SoT khi EFF>0). |
| **Nghiệp vụ xử lý** | (1) Persist company via `resolveHrmPersistCompanyIdText`. (2) Validate 12 months on submit-ready save; each cell exactly one `cell_status` (VAL-REC-HC-04/05). (3) If `cell_status=need_hire` → `need_hire` ≥ 1 (VAL-06). (4) `department_key` / `position_key` ∈ catalog when EFF>0 else `HRM-HC-KEY-UNKNOWN`. (5) Mint/stable `cell_id` per element; write `headcount_need_hire` ← `need_hire`. (6) Reject body containing dual SoT `ns`+`dx` editors (`HRM-HC-LEGACY-DUAL`). (7) If plan `approved` and mutate need_hire without override → `HRM-HC-CELL-LOCKED`. (8) OU write = TP phòng (Q-REC-HC-2); HCNS cross-OU without ủy quyền → 403/409 (EX-05). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01** Diễn biến **#2** · BA FE bước 2 · AC-REC-HC-01b · ALT-03 · EX-01..05 · BR-BP-HC-01. |
| **Request → DB** | See §6 DTO. Header → `recruitment_plans`; dept → `recruitment_plan_departments`; pos → `recruitment_plan_positions`; cells → `months_data` JSONB. |
| **Response** | Plan nested shape; codes `HRM-REC-PLAN-201` (create) / `HRM-REC-PLAN-200` (upsert). |
| **Lỗi** | `HRM-HC-VAL-400` · `HRM-HC-KEY-UNKNOWN` · `HRM-HC-CELL-LOCKED` · `HRM-HC-LEGACY-DUAL` · scope 403/409. |

**Paper alias:** `GET/PUT /api/hrm/rec/headcount-plans/{year}` · `…/cells` → map to physical list/upsert above.

---

### 5.2 F-REC-HC-02 — Submit định biên duyệt

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/recruitment-plans/:planId/submit-workflow` (**LIVE RETAIN**) |
| **Mục đích** | Gửi lưới chờ duyệt qua **XBOS** tenant matrix (`hrm_recruitment_plan_approval`). |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Validate grid complete (≥1 valid change; 12 months; need_hire rules) — else `HRM-HC-VAL-400` / `409` no-change (VAL-07). (3) Set plan status → `pending_approval` (map paper `submitted`). (4) Soft-spawn WF; `spawnMissing=true` vẫn **2xx** (AS-IS pattern — không 500). (5) Persist `submitted_by_dept_key` when known (DATA-01). (6) **U65:** inbox task chỉ từ chuỗi FE — **cấm** seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01** Diễn biến **#3** · BA FE bước 3 · AC-REC-HC-01c · ALT-04 · J-REC-WF-02/03. |
| **Request → DB** | Optional `comment` → note/audit; `status` → `pending_approval`; `workflow_instance_id` RETAIN. |
| **Response** | `{ id, status, spawn?, spawnMissing? }` · code `HRM-REC-PLAN-WF-200`. |
| **Lỗi** | `HRM-HC-VAL-400` · `409` already approved without override · scope · `HRM-REC-PLAN-404`. |

**Paper alias:** `POST …/headcount-plans/{planId}/submit`.

---

### 5.3 F-REC-HC-03 — Approve / reject + lock cells

| | |
|--|--|
| **METHOD / path** | **Primary:** XBOS WF callback → status bridge (**RETAIN**) · **Secondary:** `PATCH /api/hrm/recruitment/recruitment-plans/:planId/status` with `approved`\|`rejected` (**UPGRADE semantics**) · Optional thin `POST …/approve` · `…/reject` aliases (ADD optional — same service) |
| **Mục đích** | Duyệt khóa ô Cần tuyển; từ chối trả chỉnh sửa + lý do; sẵn sàng spawn YCTD. |
| **Nghiệp vụ xử lý** | **Approve:** (1) Plan must be `pending_approval` (VAL-08). (2) Set `status=approved`, `approved_at`/`approved_by`. (3) All cells with `cell_status=need_hire` → `lifecycle_status=need_hire_approved` (lock). (4) Snapshot `activation_mode` from tenant CFG. (5) If CFG unset **or** `on_approve` → may trigger spawn service (**O2** / HC-S6). (6) `calendar_month` without schedule → **không** auto-spawn; surface `HRM-HC-ACTIVATION-CFG` on explicit spawn. **Reject:** require `rejected_reason` (VAL-09); status `rejected`; cells unlock for edit. **Vượt grid (O4):** warn-only — **cấm** invent BOD block on FR-01 approve. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01** Diễn biến **#4** (duyệt) · **#5** (từ chối) · **#6** (sửa sau duyệt) · BA FE bước 4a/4b · AC-REC-HC-01d · ALT-01 · EX-04. |
| **Request → DB** | `status`; `rejected_reason`; `approved_at`/`approved_by`; cell `lifecycle_status` in `months_data`. |
| **Response** | `{ planId, status, approved_cell_count?, rejected_reason? }`. |
| **Lỗi** | `403` sai cấp · `409` sai trạng thái · `HRM-HC-VAL-400` thiếu lý do reject · `HRM-HC-CELL-LOCKED` post-approve mutate. |

**Paper alias:** `POST …/approve` · `…/reject`.

---

### 5.4 F-REC-HC-05 — Auto spawn YCTD từ ô Cần tuyển (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/recruitment-plans/:planId/spawn-requests`** |
| **Mục đích** | Mỗi ô Cần tuyển đã duyệt → đúng **một** YCTD (BR-BP-HC-04); idempotent; không Campaign. |
| **Nghiệp vụ xử lý** | See **§7 HC-S1..S7**. Cron/job **must** call same service method (no parallel invent). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-01b** Diễn biến **#1–#2** (ghi nhận lịch / sinh) · **#3** (HCNS xem) · **#4** (không trùng) · **#5** (drift) · **#6** (chưa duyệt) · BA FE 01b bước 2–4 · AC-REC-HC-01b-* · BR-BP-HC-04. |
| **Request** | Path `planId` · query `company_id` · body optional `{ dry_run?: boolean, cell_ids?: string[] }` (filter subset — default all eligible). |
| **Response → DB** | Insert `job_requisitions` rows; return `{ created: [...], skipped_duplicate: [...], blocked?: [...], drift_warnings?: [...] }`. |
| **Lỗi** | `HRM-HC-SPAWN-PLAN-NOT-APPROVED` 409 · `HRM-HC-ACTIVATION-CFG` · `HRM-HC-SPAWN-DUP` (or 200 + skipped) · `HRM-HC-SPAWN-QTY-DRIFT` on conflict path · `HRM-HC-VAL-400` · scope. |

**Paper alias:** `POST /api/hrm/rec/headcount-plans/{planId}/spawn-requests`.

**YCTD insert field map (physical):**

| Spawn source | YCTD column |
|--------------|-------------|
| `cell_id` | `headcount_cell_id` |
| const | `headcount_mode = 'in_plan'` |
| `need_hire` / `headcount_need_hire` | `headcount` |
| cell month + plan year | `target_month` (date first-of-month) |
| plan id | `recruitment_plan_id` (optional denorm) |
| `department_key` / `position_key` | same cols (recommended) + snapshot `department`/`title` text |
| optional JD policy | `job_template_id` |
| company | `company_id` |

**FORBIDDEN:** Insert `job_postings` · require Campaign · second YCTD for same `headcount_cell_id` in_plan · silent overwrite YCTD qty on drift.

---

### 5.5 Peer (OUT / RETAIN this cluster)

| F-id | Path | Stamp |
|------|------|-------|
| **F-REC-YCTD-01** | `POST /requisitions` | **RETAIN** — spawn **reuses** write path; manual in-plan = peer REC-02 QUEUED |
| **F-REC-YCTD-02** | same + `out_of_plan` | **OUT** this cluster (Q-REC-HEADCOUNT / REC-02b) |
| **F-REC-HC-04** | — | **N/A** (not in paper) |
| Campaign | — | **DENY** REC-03 |

---

## 6. Canonical DTOs (locked)

### 6.1 Cell (request/response)

```ts
// Canonical API cell — maps DATA-01 §6.1
type HeadcountCellDto = {
  cell_id: string;                 // ↔ months_data[].cell_id
  month: number;                   // 1..12
  cell_status: 'current' | 'need_hire' | 'projected';
  lifecycle_status: 'open' | 'need_hire_approved' | 'fulfilled' | 'cancelled';
  need_hire: number;               // ↔ headcount_need_hire  (≥1 if need_hire status)
  headcount_current: number;       // ↔ headcount_current
  headcount_projected: number | null;
  // Aliases accepted on WRITE only (normalize away):
  // need_to_hire?: number  → need_hire
  // headcount_need_hire?: number → need_hire
};
```

### 6.2 Upsert plan body (excerpt)

```ts
type UpsertRecruitmentPlanDto = {
  company_id: string;
  title: string;
  year: number;
  start_month?: number;
  end_month?: number;
  note?: string;
  submitted_by_dept_key?: string;
  departments: Array<{
    department_key: string;        // SoT when catalog EFF>0
    name?: string;                 // denorm snapshot
    positions: Array<{
      position_key: string;
      name?: string;
      months: HeadcountCellDto[];  // length 12 when submit-ready
    }>;
  }>;
};
```

### 6.3 Spawn response

```ts
type SpawnRequestsResult = {
  created: Array<{ requisition_id: string; headcount_cell_id: string; headcount: number; target_month: string }>;
  skipped_duplicate: Array<{ headcount_cell_id: string; existing_requisition_id: string }>;
  blocked?: Array<{ reason_code: string; message: string }>;
  drift_warnings?: Array<{ headcount_cell_id: string; cell_need_hire: number; yctd_headcount: number; code: 'HRM-HC-SPAWN-QTY-DRIFT' }>;
};
```

---

## 7. Spawn invariants HC-S1..S7 (normative)

| ID | Rule | API behavior |
|----|------|--------------|
| **HC-S1** | Plan `status=approved` | Else **409** `HRM-HC-SPAWN-PLAN-NOT-APPROVED` — no insert |
| **HC-S2** | Source cells: `cell_status=need_hire` AND `need_hire≥1` AND `lifecycle_status=need_hire_approved` | Never spawn from `current`/`projected` alone |
| **HC-S3** | Insert YCTD `headcount_mode=in_plan`, copy qty→`headcount`, set `target_month`, keys, `headcount_cell_id` | One row per eligible cell |
| **HC-S4** | Idempotent | Pre-check or UQ `uq_job_requisitions_spawn_cell` → `skipped_duplicate` · **no** second row (prefer **200** with skips; optional **409** `HRM-HC-SPAWN-DUP` if client forces create) |
| **HC-S5** | Qty drift after spawn | Surface `HRM-HC-SPAWN-QTY-DRIFT` · YCTD **unchanged** until explicit PATCH requisition (O3/D4) |
| **HC-S6** | Activation CFG | **BA O2 LOCK:** CFG unset ⇒ treat `on_approve`; `calendar_month` missing schedule ⇒ **block** + `HRM-HC-ACTIVATION-CFG` |
| **HC-S7** | Optional JD | Bind `job_template_id` if cell/policy configured — **no** Campaign |

Natural key still `(plan_id, department_key, position_key, month)` — surrogate `cell_id` is spawn UQ target.

---

## 8. Error codes `HRM-HC-*` (mint locked)

| Code | HTTP | When | AC / VAL |
|------|------|------|----------|
| `HRM-HC-VAL-400` | 400 | Cell/month/status/qty validation | VAL-01..06 · EX-01/02 |
| `HRM-HC-KEY-UNKNOWN` | 400 | `department_key` / `position_key` ∉ catalog EFF | VAL-02/03 · EX-03 |
| `HRM-HC-LEGACY-DUAL` | 400 | Client posts `ns`+`dx` as SoT editors post-wave | VAL-15 · ALT-03 |
| `HRM-HC-CELL-LOCKED` | 403/409 | Mutate need_hire after approve w/o override | VAL-10 · EX-04 · Diễn biến #6 |
| `HRM-HC-SPAWN-PLAN-NOT-APPROVED` | 409 | HC-S1 | EX-01b-05 · Diễn biến #6 |
| `HRM-HC-SPAWN-DUP` | 409 | Forced duplicate insert (else skip 200) | VAL-12 · ALT-01b |
| `HRM-HC-SPAWN-QTY-DRIFT` | 409/422 | HC-S5 / O3 warn path | ALT-02 · D4 |
| `HRM-HC-ACTIVATION-CFG` | 409/412 | calendar_month missing schedule | O2 · EX-02 · SRS special |
| `HRM-SCOPE-409` / `HRM-REC-PLAN-409` | 409 | Scope mismatch | U19 · EX-07 |
| `HRM-REC-PLAN-404` | 404 | Plan missing **or** out-of-scope (prefer same as list) | U19 |

VI `message` required on all 4xx for FE toast.

---

## 9. Scope parity (U19)

| Operation | Resolver |
|-----------|----------|
| List plans | `resolveHrmListScope` |
| Get plan by id | **same** + `assertResourceInHrmScope` |
| Upsert / submit / status / spawn | Persist company + assert existing in scope |
| List requisitions after spawn | Existing requisition list scope (**must_keep**) |

**PASS:** Group CEO `main` rollup list includes member plans that get-by-id also returns.  
**FAIL:** get 404 while list shows row · spawn writes company outside token.

---

## 10. Client DOC-DELTA — `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **EXPAND F-REC-HC-01..03/05** | Stamp: paper paths = **logical alias**; Nest SoT = `/api/hrm/recruitment/recruitment-plans*` + **ADD** `spawn-requests`; DTO `need_hire` ↔ `headcount_need_hire`; cite this file + DATA-01 |
| **EXPAND §7.3 matrix** | F-REC-HC-* primary tables → physical `recruitment_plans` / cell projection / `job_requisitions` (alias note) |
| **Registry** | DOC-DELTA **CONFIRMED** `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| **FORBIDDEN** | Wipe F-REC-YCTD-* · invent Nest `/rec/headcount-plans` · claim paper tables LIVE |

**Team SoT primary:** this file. Paper F-REC-HC remains vocabulary for SRS names.

---

## 11. Traceability

| Requirement | API | DB (DATA-01) | FE | Journey |
|-------------|-----|--------------|----|---------|
| FR-01 #1–#2 | F-REC-HC-01 | §4–§6 | single Cần tuyển | J-HRM-REC-HC-01 |
| FR-01 #3 | F-REC-HC-02 | WF cols | submit | J-REC-WF-02/03 |
| FR-01 #4–#6 | F-REC-HC-03 | approve + lock | lock cells | AC-01d |
| FR-01b #1–#6 | F-REC-HC-05 | §7 YCTD + UQ | list YCTD | J-HRM-REC-HC-01b |
| O1 ns/dx | DTO forbid dual | §6.3 | one column | ALT-03/05 |
| O2 activation | HC-S6 | §8 CFG | VI message | ALT-04 / EX-02 |
| O3 drift | HC-S5 | §6.4 | warn | ALT-02 |
| U19 | §9 | DATA-10 | deep link | EX-07 |
| UF-HRM-12🟢 | YCTD RETAIN | — | must_keep | regression |

---

## 12. Dev unlock notes (execution — not this seat)

| Lane | After this CONFIRMED |
|------|----------------------|
| **dev-be** | ensureSchema ADD cols (DATA-01) · normalize months · GET by id · PUT upsert · cell lock on approve · spawn service + UQ · jest HC-S* + scope_parity |
| **dev-fe** | Single `need_hire` column · label Định biên synonym · wire PUT/spawn · post-2xx + F5 · remove ns/dx editors |
| **qa** | Browser U65 J-HRM-REC-HC-01/01b — **no seed** |
| **qc** | GWC C-SLICE · honesty footer false |

**Rollback:** feature-flag spawn off; retain prior plan CRUD/WF.

---

## 13. Explicitly **FORBIDDEN** this seat

| Item | Reason |
|------|--------|
| Implement `apps/**` | Governance DOC-DELTA only |
| Nest `/api/hrm/rec/headcount-plans` | Dual path vs Option A |
| Dual `rec_headcount_*` physical | DATA-01 DENY |
| Seed plans/inbox/YCTD | U65 |
| Flip `recruitment_uat_ready` | Honesty / C-SLICE |
| REC-03 / Campaign on spawn | OUT |
| Mutate `headcount_proposals` as FR-01 | HOLD REC-02b |
| Silent YCTD qty overwrite | D4 / O3 |

---

## 14. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Program honesty (16) | **false** |
| C-SLICE ≠ module REC UAT | **true** |
| Seed in UF | **forbidden** |
| This seat | Docs + client DOC-DELTA pointer only |

---

## 15. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-api-01.md` |
| **next_owner** | **pm** → unlock **dev-be** (`PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01`) + **dev-fe** (`…-FE-01`) same session |
| **completion_report** | CONFIRMED F.1 physical Option A: lock `/recruitment/recruitment-plans*` + ADD `spawn-requests`; DTO `need_hire`↔`headcount_need_hire`; HC-S1..S7; `HRM-HC-*`; U19 scope_parity; cite DATA-01; DENY dual paper Nest path / dual table / REC-03 / seed / honesty flip. |

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-01 · UC-BP-REC-01b
depends_on: DATA-01 CONFIRMED · API-01 CONFIRMED

MISSION: Implement Option A physical — ensureSchema ADD (DATA-01 cols) · normalize months_data
(cell_id, headcount_need_hire, cell_status, lifecycle_status; O1 dx→need_hire / ns→current) ·
GET by id + PUT upsert plans · approve cell lock · ADD POST …/recruitment-plans/:planId/spawn-requests
(HC-S1..S7 · HRM-HC-* · partial UQ) · scope_parity tests list=get=spawn · DENY ns/dx dual SoT writers.

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md
3. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md AC/VAL
4. apps/api/hrm-api/src/recruitment/recruitment.controller.ts · recruitment-catalog.service.ts

must_keep: XBOS submit-workflow · job_requisitions YCTD/JD · UF-HRM-12 · soft-delete policy · REC-03 OUT
forbidden: invent /rec/headcount-plans · dual rec_headcount_* table · seed · flip recruitment_uat_ready
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md
spec_read_ack required (srs + data + api)

PARALLEL (same session after BE handoff or if FE gap clear):
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
lane: execution · dev-fe
MISSION: Single Cần tuyển column (remove ns/dx editors) · label Định biên synonym · wire PUT upsert +
spawn feedback · post-2xx + F5 AC · catalog key pickers · DENY free-text SoT when EFF>0.
exit: READY_FOR_QA · evidence …-fe-01.md · U65
```
