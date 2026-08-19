# PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01 — API F.1 · YCTD trong/ngoài ĐB (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous) |
| **lane** | governance · sa |
| **change_mode** | **ADD / UPGRADE** DOC-DELTA · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A + DTO↔column + YCTD-01..04 |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **depends_on** | DATA-01 **CONFIRMED** · BA-01 O1–O5 **CONFIRMED** · SA-01 Option **A LOCKED** |
| **ref_data** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md) **CONFIRMED** (physical SoT) |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md) **§8** Y-S1..Y-S13 · F-REC-YCTD-01..04 |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md) VAL-01..18 · AC-REC-YCTD-02* / 02b* |
| **ref_spine_api** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md) — spawn / cell UQ **RETAIN** |
| **ref_jd_api** | [`PO-HRM-JD-YCTD-REF-API-01.md`](./PO-HRM-JD-YCTD-REF-API-01.md) — F-YCTD-JD-* **RETAIN** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** Diễn biến |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-YCTD-01..04** = **logical alias only** |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base path | **`/api/hrm/recruitment/requisitions*`** (Nest `@Controller('recruitment')`) |
| Paper path | `/api/hrm/rec/recruitment-requests*` = **logical alias only** — **DENY** greenfield Nest controller |
| YCTD SoT | **`public.job_requisitions`** only (DATA-01) — paper `rec_recruitment_request` alias |
| Create/submit | Draft → **`pending_approval`** + XBOS — **cấm** create→`open` bypass (Y-S7) |
| Receivable | Normative status **`open_for_hire`** (O3) after full approve (+ BOD when out_of_plan) |
| O2 vượt ô | **409** `HRM-YCTD-CELL-QTY` — **no** silent stay `in_plan` · CFG `force_out_of_plan` **HOLD** |
| O4 legacy NULL mode | Grandfather read + warn · **block** CV/posted · classify on edit — **cấm** auto `in_plan` |
| XBOS WF | **RETAIN** one `hrm_requisition_approval` · matrix conditions = `headcount_mode` + `hire_reason` |
| Pipeline flags | **ADD** `PATCH …/requisitions/:id/pipeline-flags` on YCTD — **DENY** Campaign (REC-03 OUT) |
| Transitions | **ADD** `POST …/requisitions/:id/transitions` (± XBOS callback primary) → `open_for_hire` / reject |
| Dual SoT / Nest `/rec` | **DENY** |
| REC-01 spawn / cell / UQ | **RETAIN** must_keep (REUSE-by-NK sealed peer) |
| This seat | Docs + client DOC-DELTA pointer only — **NO** `apps/**` · **NO** seed · **NO** honesty flip |

```text
  FE «Yêu cầu tuyển» (YCTD)
        │
        ▼
  /api/hrm/recruitment/requisitions*   ← PHYSICAL SoT (Option A)
        │  paper /rec/recruitment-requests* = alias only
        ▼
  job_requisitions
        RETAIN: headcount_mode · headcount_cell_id · target_month · spawn UQ · JD soft FK
        ADD:    hire_reason · replace_employee_id · out_of_plan_reason
                · approval_matrix_key · pipeline_flags_json · status open_for_hire
        │
        ├─ in_plan  → SHORT matrix (TP+HR min) → open_for_hire
        └─ out_of_plan → LONG + BOD → block until BOD → open_for_hire
        │
        ▼
  XBOS hrm_requisition_approval (ONE business_type; conditions = mode + hire_reason)
```

---

## 2. AS-IS Nest baseline → gap

| Endpoint (AS-IS) | Code | Gap vs F.1 |
|------------------|------|------------|
| `POST /recruitment/requisitions` | LIVE · `createJobRequisition` INSERT `status='open'` | **UPGRADE** — require mode/hire/cell/out-reason; default **`draft`**; **cấm** immediate receivable |
| `POST …/requisitions/:id/submit-workflow` | LIVE XBOS bridge | **UPGRADE** — VAL submit gates · snapshot `approval_matrix_key` · pass WF conditions · set `pending_approval` |
| `GET /requisitions` · `GET /:id` | LIVE · `resolveHrmListScope` | **UPGRADE** response: mode/hire/reasons/flags/JD display; O4 warn when mode NULL |
| `PATCH`/`PUT …/requisitions/:id` | LIVE status/notes/headcount/JD | **UPGRADE** classify + draft fields; **cấm** patch to receivable bypass |
| `POST …/transitions` | **ABSENT** | **ADD** F-REC-YCTD-03 (thin) — approve/reject → `open_for_hire` / `rejected` |
| `PATCH …/pipeline-flags` | **ABSENT** | **ADD** F-REC-YCTD-04 |
| Create DTO | title/dept/type/headcount/JD only | **ADD** `headcount_mode`, `headcount_cell_id`, `hire_reason`, `replace_employee_id`, `out_of_plan_reason`, keys |
| Status DTO / CHK | no `open_for_hire` in Update DTO | **EXPAND** receivable token |
| UV attach (`POST /candidates`) | receivable = open\|approved\|open_for_hire | **UPGRADE** gate: new writes require receivable **after** classify; O4 NULL mode → **409** |
| Spawn peer | LIVE `…/spawn-requests` | **RETAIN** — manual create must honor UQ |

**Envelope RETAIN:** `{ code, message, data }` · success codes `HRM-REC-201` / `HRM-REC-200` / `HRM-REC-WF-200` coexist with domain errors **`HRM-YCTD-*`**.

---

## 3. Path & alias lock (O1 / Y-S1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/requisitions` · `…/:requisitionId` · `…/submit-workflow` · **`…/transitions`** · **`…/pipeline-flags`** |
| **LOGICAL (paper)** | `/api/hrm/rec/recruitment-requests` · `…/{id}` · `…/submit` · `…/transitions` · `…/pipeline-flags` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** required for unlock. |

| Paper field | Physical DTO (canonical) | DB column | Rule |
|-------------|--------------------------|-----------|------|
| `headcount_flag` / `in_headcount` | **`headcount_mode`** | `job_requisitions.headcount_mode` | `in_plan` \| `out_of_plan` · NULL = LEGACY_UNCLASSIFIED (O4) |
| `plan_cell_id` | **`headcount_cell_id`** | `job_requisitions.headcount_cell_id` | Soft → `months_data[].cell_id` · **no** hard FK |
| `qty` | **`headcount`** | `job_requisitions.headcount` | G-RC-01 ≥1 |
| `hire_reason` (`replacement`) | **`hire_reason`** | `job_requisitions.hire_reason` | API enum **`new` \| `replace`** (normalize paper `replacement`→`replace`) |
| `replace_employee_id` | same | `job_requisitions.replace_employee_id` | Required when `replace` |
| `out_of_plan_reason` | same | `job_requisitions.out_of_plan_reason` | Required on submit when out_of_plan |
| `job_description_id` | **`job_template_id`** (+ alias) | `job_requisitions.job_template_id` | ONE soft FK · JD-YCTD-REF RETAIN |
| `org_unit_id` / dept | `department_key` (+ snapshot `department`) | keys + text | Catalog when EFF>0 |
| `position_id` | `position_key` (+ title snapshot) | keys + `title` | Catalog when EFF>0 |
| `approval_matrix_key` | same | `job_requisitions.approval_matrix_key` | Snapshot SHORT/LONG at submit |
| `pipeline_flags_*` | `pipeline_flags` object | `job_requisitions.pipeline_flags_json` | DATA-01 §4.3 shape |
| `status` receivable | **`open_for_hire`** | `job_requisitions.status` | Synonym `open` filter-only until FE remaster |

**FORBIDDEN:** Nest `/rec/recruitment-requests` dual controller · CREATE `rec_recruitment_request` table · dual-write `headcount_proposals` as YCTD (O5).

---

## 4. Status token map (O3 / Y-S7 / Y-S9)

| Phase | Normative API `status` | Note |
|-------|------------------------|------|
| Draft / edit | `draft` | Create default after wave |
| Submitted | `pending_approval` | After submit-workflow |
| Approved (bridge may set) | `approved` | May precede receivable if BOD outstanding |
| **Receivable** | **`open_for_hire`** | After full approve (in_plan SHORT complete · out_of_plan + BOD) |
| Legacy synonym | `open` | List/UV filter synonym only — **≠** bypass for **new** writes |
| Rejected / cancelled | `rejected` \| `cancelled` | Reject requires reason |
| Closed / on_hold | `closed` \| `on_hold` | Operational RETAIN |

**Receivable gate (normative):** new CV attach / `cv_intake_allowed=true` / `posted=true` only when `status=open_for_hire` **and** `headcount_mode` classified (not NULL).

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** list = get = create = patch = submit-workflow = transitions = pipeline-flags = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` + `resolveHrmPersistCompanyIdText` (**U19** · VAL-16).

---

### 5.1 F-REC-YCTD-01 — Create / submit YCTD **in_plan**

#### 5.1.1 POST create draft (UPGRADE)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/requisitions` |
| **Mục đích** | Lập YCTD gắn ô Cần tuyển đã duyệt; cờ trong ĐB; lý do tuyển mới/thay thế; tham chiếu JD Hiệu lực — **không** mở nhận hồ sơ ngay. |
| **Nghiệp vụ xử lý** | (1) Persist `company_id` via scope. (2) Accept body with `headcount_mode='in_plan'` (required on submit; preferred on create). (3) Soft-bind `headcount_cell_id` → approved cell (`lifecycle_status=need_hire_approved`, plan `approved`) — else **409** `HRM-YCTD-CELL-*`. (4) `headcount` ≥1; if > remaining cell capacity → **409** `HRM-YCTD-CELL-QTY` (**O2** — no silent). (5) `hire_reason` `new`\|`replace`; `replace` ⇒ `replace_employee_id` in scope. (6) JD soft FK Hiệu lực when required (F-YCTD-JD-03 RETAIN). (7) INSERT `status='draft'` — **FORBIDDEN** `'open'` / `'open_for_hire'`. (8) Spawn UQ: if cell already has in_plan YCTD → **409** `HRM-YCTD-SPAWN-DUP`. (9) Default `pipeline_flags_json={}` with `cv_intake_allowed=false`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#1–#2** · **#1a–#1d** (JD) · BA FE bước **1–3** · AC-REC-YCTD-02 / 02b · EX-01..06 · ALT-02/04 · VAL-01..03,05..07,12 · Y-S2..S6,S11,S12. |
| **Request → DB** | See §6.1 · maps DATA-01 §4. |
| **Response** | `{ id, status:'draft', headcount_mode, headcount_cell_id, headcount, hire_reason, job_template_id, job_description_id?, jd_code?, jd_title?, … }` · code `HRM-REC-201`. |
| **Lỗi** | `HRM-YCTD-MODE-REQUIRED` 400 · `HRM-YCTD-CELL-*` 409 · `HRM-YCTD-CELL-QTY` 409 · `HRM-YCTD-HIRE-REASON` 400 · `HRM-YCTD-SPAWN-DUP` 409 · `HRM-JD-YCTD-*` · scope 403/409. |

**Paper alias:** `POST /api/hrm/rec/recruitment-requests`.

#### 5.1.2 POST submit-workflow (UPGRADE)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/requisitions/:requisitionId/submit-workflow` (**LIVE path RETAIN**) |
| **Mục đích** | Gửi YCTD trong ĐB chờ duyệt qua **một** XBOS WF; ma trận **SHORT** (TP+HR tối thiểu per Q-REC-HC-2). |
| **Nghiệp vụ xử lý** | (1) Scope assert get-by-id. (2) Re-run VAL-01..07 on current row (mode must be `in_plan`). (3) Set `status=pending_approval`. (4) Snapshot `approval_matrix_key` = SHORT family (tenant CFG). (5) Start XBOS `hrm_requisition_approval` with **conditions** `{ headcount_mode:'in_plan', hire_reason }` — **cấm** LONG-only path (BR-BP-HC-05 · Y-S10). (6) Tenant may add BOD to in_plan via CFG — **cấm** hardcode «luôn bỏ BOD» (ALT-03). (7) `spawnMissing=true` vẫn **2xx** (RETAIN pattern) — **cấm** fake approve. (8) **U65:** inbox chỉ từ chuỗi FE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#2–#3** · BA FE bước **4** · AC-REC-YCTD-02c · VAL-08/09 · Y-S7/S8. |
| **Request → DB** | Optional `comment` · status → `pending_approval` · `approval_matrix_key` · `workflow_instance_id`. |
| **Response** | `{ id, status, approval_matrix_key, spawn?, spawnMissing? }` · `HRM-REC-WF-200`. |
| **Lỗi** | VAL 400/409 as create · `HRM-YCTD-MATRIX-MISMATCH` if forced LONG-only · scope · 404. |

---

### 5.2 F-REC-YCTD-02 — Create / submit YCTD **out_of_plan**

| | |
|--|--|
| **METHOD / path** | **Same** `POST /requisitions` + `POST …/submit-workflow` with `headcount_mode='out_of_plan'` |
| **Mục đích** | Lập YCTD phát sinh / vượt / ngoài ô; ma trận **LONG** (+ BOD); **chặn** nhận hồ sơ đến khi BOD duyệt. |
| **Nghiệp vụ xử lý** | (1) Create draft with `headcount_mode=out_of_plan` · **require** non-empty `out_of_plan_reason` on submit (draft may allow empty until submit — DATA-01). (2) `hire_reason` + replace rules same as in_plan. (3) JD bind RETAIN. (4) **No** `headcount_cell_id` required (may be null). (5) Submit → `pending_approval` + snapshot `approval_matrix_key` = LONG (+ BOD). (6) Pass XBOS conditions `{ headcount_mode:'out_of_plan', hire_reason }` — **cấm** SHORT-only (BR-BP-HC-06 · Y-S10). (7) Until BOD complete: status must **not** be receivable; `cv_intake_allowed` stays false; attempts → **409** `HRM-YCTD-BOD-REQUIRED` / `HRM-YCTD-NOT-RECEIVABLE` (Y-S9). (8) **DENY** warn-cho-qua (D-BOD OUT). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02b** Diễn biến **#1–#2** · **#1a–#1d** · BA FE out_of_plan bước **1–3** · AC-REC-YCTD-02b-01..04 · EX-01..04 · VAL-04/05/06/08/09/10 · Y-S5/S9/S10. |
| **Request → DB** | `headcount_mode`, `out_of_plan_reason`, `hire_reason`, `replace_employee_id?`, JD, headcount, … |
| **Response** | Draft/submit shapes; include `requires_bod: true` (display hint) when LONG+BOD. |
| **Lỗi** | `HRM-YCTD-OUT-REASON` 400 · `HRM-YCTD-HIRE-REASON` 400 · `HRM-YCTD-BOD-REQUIRED` 409 · `HRM-YCTD-NOT-RECEIVABLE` 409 · JD · scope. |

**Paper alias:** same paper POST with `headcount_flag=out_of_plan`.

---

### 5.3 F-REC-YCTD-03 — Transitions → receivable / reject (**ADD** + WF callback)

| | |
|--|--|
| **METHOD / path** | **Primary:** XBOS WF callback → recruitment bridge (**RETAIN**) · **Secondary ADD:** `POST /api/hrm/recruitment/requisitions/:requisitionId/transitions` |
| **Mục đích** | Duyệt / từ chối theo nhánh trong/ngoài ĐB; sau đủ duyệt → **`open_for_hire`** (nhận UV trên YCTD — không Campaign). |
| **Nghiệp vụ xử lý** | **Approve:** (1) Must be `pending_approval` (or bridge-equivalent). (2) **in_plan:** after SHORT complete (incl. CFG BOD if any) → `status=open_for_hire`; set `approved_at`/`approved_by`; may set `pipeline_flags_json.cv_intake_allowed=true`. (3) **out_of_plan:** if BOD outstanding → **stay** non-receivable (`approved` or keep pending per bridge) — **FORBIDDEN** set `open_for_hire` / posted / CV. After BOD approve → `open_for_hire` + unlock flags. (4) JD soft FK **unchanged**. **Reject:** require `rejected_reason` (VAL-17) → `rejected`; not receivable; JD kept. **Legacy O4:** refuse promote receivable while `headcount_mode IS NULL`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Diễn biến **#3–#4** · **FR-UC-BP-REC-02b** Diễn biến **#2–#5** · BA FE bước **5a/5b** (in) · **4a/4b** (out) · AC-02d · 02b-05 · ALT-01 · VAL-10/11/14/17 · Y-S9. |
| **Request → DB** | `{ action: 'approve' \| 'reject', comment?, rejected_reason? }` → `status`, `approved_at`, `approved_by`, `rejected_reason`, optional flags. |
| **Response** | `{ id, status, pipeline_flags? }` · codes `HRM-REC-200` / bridge codes. |
| **Lỗi** | `409` sai transition · `HRM-YCTD-BOD-REQUIRED` · `HRM-YCTD-MODE-UNCLASSIFIED` · `HRM-YCTD-VAL-400` thiếu lý do reject · scope. |

**Paper alias:** `POST …/recruitment-requests/{id}/transitions`.

---

### 5.4 F-REC-YCTD-04 — PATCH pipeline-flags (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`PATCH /api/hrm/recruitment/requisitions/:requisitionId/pipeline-flags`** |
| **Mục đích** | GĐ1 theo dõi «đã đăng tin / có CV / PV» trên **YCTD** — thay Campaign (REC-03 OUT). |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Merge patch into `pipeline_flags_json` (DATA-01 §4.3). (3) Setting `posted=true` / `has_cv=true` / `cv_intake_allowed=true` / `interview_started=true` requires receivable `open_for_hire` — else **409** `HRM-YCTD-NOT-RECEIVABLE`. (4) out_of_plan before BOD → always 409. (5) O4 NULL mode → **409** `HRM-YCTD-MODE-UNCLASSIFIED`. (6) Rejected/cancelled → **409**. (7) **FORBIDDEN** invent Campaign entity / `job_postings` SoT (Y-S13 · VAL-13). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-02** Thành công «sẵn sàng nhận hồ sơ» · BA FE bước **6** (in) / **5** (out) · AC-REC-YCTD-02e · 02b-04 · VAL-10/11/13/14 · Y-S9/S13. |
| **Request → DB** | `{ posted?, has_cv?, interview_started?, cv_intake_allowed? }` → `pipeline_flags_json` (+ `*_at` stamps server-side). |
| **Response** | `{ id, status, pipeline_flags }` · `HRM-REC-200`. |
| **Lỗi** | `HRM-YCTD-NOT-RECEIVABLE` · `HRM-YCTD-BOD-REQUIRED` · `HRM-YCTD-MODE-UNCLASSIFIED` · scope · 404. |

**Paper alias:** `PATCH …/recruitment-requests/{id}/pipeline-flags`.

---

### 5.5 List / get / patch (RETAIN + UPGRADE — shared)

#### 5.5.1 GET list / GET by id

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/requisitions` · `GET …/requisitions/:requisitionId` |
| **Mục đích** | Danh sách / deep-link chi tiết YCTD đúng scope (U19); hiển thị mode/JD/hire/flags. |
| **Nghiệp vụ xử lý** | Same `resolveHrmListScope`. Response includes Wave-2 fields + JD display-ready. O4: if `headcount_mode IS NULL` → include `classification_required: true` (warn VI on FE). Receivable filter may include synonym `open`\|`approved`\|`open_for_hire` (UV picker RETAIN). |
| **Tham chiếu bước SRS** | FR-02/02b Thành công · BA FE bước **7** / **02b-06** · AC-02f · EX-08 · VAL-14/16. |
| **Lỗi** | `HRM-REC-404` · scope 409 — **FORBIDDEN** 404 when list would include row. |

#### 5.5.2 PATCH / PUT update (classify + draft edit)

| | |
|--|--|
| **METHOD / path** | `PATCH` / `PUT /api/hrm/recruitment/requisitions/:requisitionId` |
| **Mục đích** | Sửa nháp / classify legacy / re-bind JD — **không** bypass WF receivable. |
| **Nghiệp vụ xử lý** | (1) O4: if prior mode NULL, next save **requires** `headcount_mode` (+ cell **or** out_of_plan_reason) before 2xx (VAL-14). (2) **FORBIDDEN** client set `status` to `open_for_hire`/`open` to skip BOD/WF — use transitions. (3) Re-bind JD on draft/rejected RETAIN F-YCTD-JD-04. (4) Qty/mode changes re-apply O2/UQ gates. |
| **Tham chiếu bước SRS** | FR-02/02b ALT classify · AC-02b-ALT-04 · VAL-14. |
| **Lỗi** | VAL 400/409 · `HRM-YCTD-MODE-REQUIRED` on classify miss. |

---

### 5.6 Peer RETAIN / OUT

| F-id | Path | Stamp |
|------|------|-------|
| **F-REC-HC-05** | `POST …/recruitment-plans/:id/spawn-requests` | **RETAIN** — produces in_plan YCTD; UQ must_keep |
| **F-YCTD-JD-01..05** | job-templates + requisitions display | **RETAIN** must_keep |
| **F-REC-UV-YCTD-*** | candidates attach | **UPGRADE** gate vs receivable + O4 |
| **F-REC-CAMPAIGN-*** | — | **OUT / DENY** REC-03 |
| `headcount_proposals` | catalog leftover | **HOLD** ≠ YCTD SoT (O5) |

---

## 6. Canonical DTOs (locked)

### 6.1 Create / update body (excerpt)

```ts
type CreateJobRequisitionDtoV2 = {
  company_id: string;
  title: string;
  department?: string;                 // denorm snapshot
  department_key?: string;
  position_key?: string;
  employment_type: string;
  headcount: number;                   // ↔ job_requisitions.headcount (≥1)
  headcount_mode: 'in_plan' | 'out_of_plan'; // required on submit
  headcount_cell_id?: string;          // required when in_plan
  target_month?: string;               // ISO date first-of-month
  recruitment_plan_id?: string;
  hire_reason: 'new' | 'replace';     // required on submit; accept alias 'replacement'→replace
  replace_employee_id?: string;        // required when replace
  out_of_plan_reason?: string;         // required when out_of_plan on submit
  job_template_id?: string;            // physical soft FK
  job_description_id?: string;         // alias → same column
  job_description?: string;            // optional snapshot text ≠ values_json SoT
  requirements?: string;
};
```

### 6.2 Pipeline flags

```ts
type PipelineFlagsDto = {
  posted: boolean;
  has_cv: boolean;
  interview_started: boolean;
  cv_intake_allowed: boolean;
  posted_at?: string | null;
  has_cv_at?: string | null;
  interview_started_at?: string | null;
};
// ↔ job_requisitions.pipeline_flags_json
// FORBIDDEN: open_for_hire boolean inside JSON diverging from status
```

### 6.3 Transitions

```ts
type RequisitionTransitionDto = {
  action: 'approve' | 'reject';
  comment?: string;
  rejected_reason?: string; // required when reject
};
```

### 6.4 Response display-ready (list/get)

Include: `id`, `company_id`, `status`, `headcount_mode`, `headcount_cell_id`, `headcount`, `hire_reason`, `replace_employee_id`, `out_of_plan_reason`, `approval_matrix_key`, `pipeline_flags`, `job_template_id`, `job_description_id`, `jd_code`, `jd_title`, `classification_required?`, `requires_bod?`, `workflow_instance_id`, timestamps.

---

## 7. Domain invariants Y-S1..Y-S13 (API behavior)

| ID | Rule | API behavior |
|----|------|--------------|
| **Y-S1** | Sole physical YCTD = `job_requisitions` | Implement only `/recruitment/requisitions*` |
| **Y-S2** | Submit requires mode | **400** `HRM-YCTD-MODE-REQUIRED` |
| **Y-S3** | in_plan ⇒ cell approved | **409** `HRM-YCTD-CELL-MISSING` / `CELL-NOT-APPROVED` / `CELL-PLAN-NOT-APPROVED` |
| **Y-S4** | Qty vs cell (O2) | **409** `HRM-YCTD-CELL-QTY` — no silent; CFG force OUT HOLD |
| **Y-S5** | out_of_plan reason | **400** `HRM-YCTD-OUT-REASON` |
| **Y-S6** | hire_reason + replace id | **400** `HRM-YCTD-HIRE-REASON` |
| **Y-S7** | Submit → pending_approval | create→`open` = **FAIL** |
| **Y-S8** | SHORT vs LONG matrix | Snapshot + XBOS conditions; mismatch → **409** `HRM-YCTD-MATRIX-MISMATCH` |
| **Y-S9** | BOD gate out_of_plan | **409** `HRM-YCTD-BOD-REQUIRED` / `NOT-RECEIVABLE` |
| **Y-S10** | BR-HC-05/06 | in_plan ≠ long-only; out ≠ short-only |
| **Y-S11** | Spawn UQ | **409** `HRM-YCTD-SPAWN-DUP` |
| **Y-S12** | JD Hiệu lực | `HRM-JD-YCTD-*` RETAIN |
| **Y-S13** | Flags on YCTD | No Campaign |

---

## 8. Error codes `HRM-YCTD-*` (mint locked)

| Code | HTTP | When | VAL / AC |
|------|------|------|----------|
| `HRM-YCTD-MODE-REQUIRED` | 400 | Missing/invalid `headcount_mode` on submit/classify | VAL-01 · EX-01 |
| `HRM-YCTD-CELL-MISSING` | 409 | in_plan without `headcount_cell_id` | VAL-02 · EX-02 |
| `HRM-YCTD-CELL-NOT-APPROVED` | 409 | Cell not `need_hire_approved` | VAL-02 |
| `HRM-YCTD-CELL-PLAN-NOT-APPROVED` | 409 | Plan not approved | VAL-02 |
| `HRM-YCTD-CELL-QTY` | 409 | Qty vượt ô (**O2**) | VAL-03 · EX-03 · 02b-ALT-02 |
| `HRM-YCTD-OUT-REASON` | 400 | Missing out_of_plan_reason | VAL-04 · 02b-EX-01 |
| `HRM-YCTD-HIRE-REASON` | 400 | Missing hire_reason / replace id | VAL-05/06 · EX-04 |
| `HRM-YCTD-MATRIX-MISMATCH` | 409 | Wrong SHORT/LONG vs mode | VAL-09 · EX-07 · 02b-EX-03 |
| `HRM-YCTD-BOD-REQUIRED` | 409 | Receivable/CV/posted before BOD | VAL-10 · 02b-04 · Y-S9 |
| `HRM-YCTD-NOT-RECEIVABLE` | 409 | Flags/CV while not `open_for_hire` | VAL-10/11 |
| `HRM-YCTD-MODE-UNCLASSIFIED` | 409 | O4 NULL mode blocks CV/flags | VAL-14 · 02b-ALT-04 |
| `HRM-YCTD-SPAWN-DUP` | 409 | Manual create hits spawn UQ | VAL-12 · ALT-04 |
| `HRM-YCTD-VAL-400` | 400 | Generic validation (reject reason, …) | VAL-17 |
| `HRM-JD-YCTD-*` | 4xx | JD bind RETAIN | VAL-07 · EX-05/06 |
| Scope | 403/409 | U19 mismatch | VAL-16 · EX-08 |

VI `message` required on all 4xx for FE toast.

**CELL-\* family:** clients may treat any `HRM-YCTD-CELL-*` (except QTY) as cell-gate class; QTY is distinct for O2 UX («gợi ý ngoài ĐB»).

---

## 9. Scope parity (U19)

| Operation | Resolver |
|-----------|----------|
| List requisitions | `resolveHrmListScope` |
| Get by id | **same** + assert in scope |
| Create / patch | `resolveHrmPersistCompanyIdText` + scope |
| Submit-workflow | get-by-id scope then mutate |
| Transitions | **same** as get |
| Pipeline-flags | **same** as get |
| UV attach (peer) | YCTD must be in caller scope |

**PASS:** Group CEO `main` rollup list includes member YCTD that get/transitions/flags also allow.  
**FAIL:** get 404 while list shows row · flags write outside token · submit without `toHrmListScopeContext(tenantId)`.

---

## 10. XBOS matrix conditions (one WF)

| Item | Lock |
|------|------|
| Business type | **RETAIN** `WF_BUSINESS_TYPE_HRM_REQUISITION` / code `hrm_requisition_approval` |
| Product WF count | **ONE** — not two Nest/XBOS product definitions |
| Conditions payload | `{ headcount_mode, hire_reason }` (+ tenant policy keys as configured) |
| in_plan | Matrix SHORT · Q-REC-HC-2 TP+HR minimum |
| out_of_plan | Matrix LONG + BOD (Q-REC-HEADCOUNT RETAIN) |
| Snapshot | Persist `approval_matrix_key` at submit for audit |
| Missing definition | `spawnMissing` pattern RETAIN — **cấm** fake approve |

---

## 11. Client DOC-DELTA — `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **EXPAND F-REC-YCTD-01..04** | Stamp: paper paths = **logical alias**; Nest SoT = `/api/hrm/recruitment/requisitions*` + **ADD** `transitions` + `pipeline-flags`; DTO map §3; cite this file + DATA-01 |
| **EXPAND §7.3 matrix** | F-REC-YCTD-* → physical `job_requisitions` (alias note) · O2/O4 tokens |
| **Registry** | DOC-DELTA **CONFIRMED** `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01` |
| **FORBIDDEN** | Wipe F-REC-HC-* / JD overlay · invent Nest `/rec/recruitment-requests` · claim paper table LIVE dual |

**Team SoT primary:** this file.

---

## 12. Traceability

| Requirement | API | DB (DATA-01) | FE / Journey |
|-------------|-----|--------------|--------------|
| FR-02 #1–#2 in_plan | F-REC-YCTD-01 | §4–§6 · §8 | **J-HRM-REC-YCTD-02** · UF-HRM-REC-YCTD-02 DRAFT |
| FR-02b #1–#2 out | F-REC-YCTD-02 | out reason · BOD | **J-HRM-REC-YCTD-02b** |
| FR-02/02b approve | F-REC-YCTD-03 | open_for_hire CHK | AC-02d · 02b-05 |
| Pipeline MVP | F-REC-YCTD-04 | pipeline_flags_json | AC-02e · Y-S13 |
| O1 physical | §3 alias | §2 | DENY Nest dual |
| O2 409 | CELL-QTY | §6 | EX-03 |
| O3 token | §4 | §4.4 | 02d |
| O4 legacy | §5.5.2 + UV gate | §7 | 02b-ALT-04 |
| O5 proposals | §5.6 HOLD | §10 | 02b-ALT-03 |
| Spawn UQ | Y-S11 | §5.2 UQ | ALT-04 |
| JD soft FK | F-YCTD-JD-* | job_template_id | J-HRM-JD-YCTD-01 must_keep |
| U19 | §9 | company_id TEXT | EX-08 |
| U65 | — | — | EX-09 · 02b-EX-07 |

---

## 13. Dev unlock notes (execution — not this seat)

| Lane | After this CONFIRMED |
|------|----------------------|
| **dev-be** | ensureSchema ADD (DATA-01 §4.2/§4.4) · create draft+gates · submit conditions · transitions · pipeline-flags · O2/O4 · UQ regression · UV receivable tighten · jest Y-S* + scope_parity |
| **dev-fe** | Form forks in/out · hire_reason · out reason · classify banner · block CV UI · wire transitions/flags · post-2xx + F5 · proposals CTA HOLD (no dual write) |
| **qa** | Browser U65 J-HRM-REC-YCTD-02/02b — **no seed** |
| **qc** | GWC C-SLICE · honesty footer false |

**Rollback:** feature-flag mode-gates off only for emergency; prefer forward-fix. **No** drop of `job_requisitions` / XBOS bridge / REC-01 columns.

---

## 14. Explicitly **FORBIDDEN** this seat

| Item | Reason |
|------|--------|
| Implement `apps/**` | Governance DOC-DELTA only |
| Nest `/api/hrm/rec/recruitment-requests` | Dual path vs Option A / O1 |
| Dual `rec_recruitment_request` physical | DATA-01 DENY |
| Soften O2 to silent in_plan | BA O2 |
| Auto-backfill NULL → in_plan | O4 |
| warn-cho-qua open tin trước BOD | D-BOD OUT |
| REC-03 Campaign as SoT «mở tin» | Y-S13 |
| Dual-write `headcount_proposals` | O5 |
| Seed YCTD / inbox | U65 |
| Flip `recruitment_uat_ready` | Honesty / C-SLICE |
| Contradict REC-01 cell_id / spawn UQ / JD / UF-HRM-12🟢 / J-REC-WF-* | must_keep |

---

## 15. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Program honesty (16) | **false** |
| C-SLICE ≠ module REC UAT | **true** |
| Seed in UF | **forbidden** |
| This seat | Docs + client DOC-DELTA pointer only |

---

## 16. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-api-01.md` |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** (split lanes · rule 26) |
| **completion_report** | CONFIRMED F.1 physical Option A: lock `/recruitment/requisitions*` + ADD transitions + pipeline-flags; DTO↔DATA-01 columns; HRM-YCTD-* (CELL-QTY · BOD-REQUIRED · NOT-RECEIVABLE · MODE-UNCLASSIFIED); O2/O4; one XBOS WF conditions; U19 list=get=mutate=flags=transitions; paper `/rec/…` alias only; DENY dual SoT/path/REC-03/seed/honesty flip. |

---

## next_dispatch_prompt (BOTH lanes — copy-ready)

### A — dev-be

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: DATA-01 CONFIRMED · API-01 CONFIRMED
change_mode: UPGRADE · preserve_default · code_memory_required APPEND

MISSION: Implement Option A physical YCTD on job_requisitions —
1) ensureSchema ADD hire_reason · replace_employee_id · out_of_plan_reason · approval_matrix_key · pipeline_flags_json · expand status CHK open_for_hire (cite DATA-01)
2) UPGRADE POST /requisitions → status=draft + VAL mode/cell/qty/hire/out/JD; O2 409 HRM-YCTD-CELL-QTY; spawn UQ 409; cấm create→open
3) UPGRADE submit-workflow → pending_approval + snapshot approval_matrix_key + XBOS conditions {headcount_mode, hire_reason} SHORT|LONG
4) ADD POST …/requisitions/:id/transitions (approve→open_for_hire with BOD gate; reject+reason)
5) ADD PATCH …/requisitions/:id/pipeline-flags (receivable gate; O4 MODE-UNCLASSIFIED)
6) UPGRADE UV attach / list receivable vs open_for_hire + O4 block
7) jest: Y-S2..S13 spot · O2 · O4 · scope_parity list=get=mutate=submit=transitions=flags · spawn regression RETAIN
DENY: Nest /rec dual · rec_* table · force_out_of_plan invent · warn-cho-qua · REC-03 · seed · honesty flip

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md
3. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md VAL/AC
4. apps/api/hrm-api/src/recruitment/recruitment.controller.ts · recruitment.service.ts · recruitment-workflow.bridge.ts

must_keep: REC-01 cell/spawn UQ · JD soft FK · hrm_requisition_approval · UF-HRM-12 · J-REC-WF-* · soft-delete
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md
spec_read_ack required (srs + data + api)
```

### B — dev-fe

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: API-01 CONFIRMED · coordinate with BE-01 contracts (DTO fields)
change_mode: UPGRADE · preserve_default · code_memory_required APPEND

MISSION: FE YCTD form forks Option A —
1) in_plan: bind headcount_cell_id from approved cell · hire_reason new|replace · JD picker Hiệu lực · Lưu draft → Gửi duyệt
2) out_of_plan: out_of_plan_reason required · LONG UI · block CV/posted until open_for_hire
3) O2: surface 409 CELL-QTY VI (gợi ý chuyển ngoài ĐB) — no silent
4) O4: banner classify on legacy NULL mode · block CV actions · require mode on save
5) Wire transitions feedback + PATCH pipeline-flags only when receivable
6) List/detail F5 retain mode/reasons/JD/flags · deep link scope
7) proposals tab: CTA deprecate/redirect only — DENY dual persist (O5)
DENY: invent Campaign · Nest /rec client dual SoT · seed · honesty flip · warn-cho-qua

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md
2. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md Diễn biến FE §3.4 · §4.4
3. apps/web HRM JobRequisitions / recruitment tabs (AS-IS)

must_keep: UF-HRM-12🟢 · J-HRM-JD-YCTD-01 · JD soft bind UX · REC-03 OUT
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md · U65 browser path
```
