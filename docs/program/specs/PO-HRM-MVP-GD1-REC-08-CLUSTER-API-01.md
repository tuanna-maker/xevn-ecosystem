# PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01 — API F.1 · Dashboard «bao giờ đủ người» (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous) |
| **lane** | governance · sa |
| **change_mode** | **ADD** DOC-DELTA · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A + DTO↔sealed spine + DASH-01/02 |
| **uc_ids** | `UC-BP-REC-08` |
| **depends_on** | BA-01 **CONFIRMED** (O1–O10 · AC-REC-08-01..10 · VAL-REC-DASH-01..19) · SA-01 Option **A LOCKED** (D-S1..D-S10) |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md) |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md) |
| **ref_token_family** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md) — `HRM-YCTD-*` RETAIN peer · dashboard mints **`HRM-REC-DASH-*`** |
| **ref_spine** | REC-01 DATA/API (`recruitment_plans` + `months_data` cells) · REC-02 DATA/API (`job_requisitions`) · UV spine `recruitment_candidates.requisition_id` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-08** Diễn biến **#1–#3** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-DASH-01** = **logical alias only** |
| **ref_partner** | **REQ_REC_005** · WBS-REC-06 |
| **Honesty** | `recruitment_uat_ready=false` · 16 program honesty flags **false** · **C-SLICE** · U65 |
| **ba-data** | **NOT REQUIRED** — no missing sealed-spine column (see §9) |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base path | **`/api/hrm/recruitment/dashboard*`** under Nest `@Controller('recruitment')` |
| Paper path | `/api/hrm/rec/dashboard` = **logical alias only** — **DENY** Nest greenfield dual `/rec` controller / second SoT |
| Read-model owner | **Nest** `RecruitmentDashboardService` (NEW) — on-the-fly aggregate · **GET only** (D-S1) |
| KH SoT | Sealed REC-01 cells — `Σ need_hire` per **BA O2** — **≠** `job_postings` |
| TT / funnel SoT | YCTD-linked **`recruitment_candidates`** (`requisition_id`) + effective pipeline-stage catalog — **≠** `candidate_applications`/`job_postings` as KH/TT SoT |
| Display-ready | `%` / `gap` / `ETA` / `enough_people_status` / funnel / slices — **BE only** (D-S5 · SOLID 25 §3.1) |
| Drill | **YCTD** rows only (F-REC-DASH-02) — **DENY** Campaign / REC-03 (D-S10) |
| Option B rollup table | **DENY** this wave (P2 HOLD) |
| Reports | Same Nest contract or documented **subset** — **no** second formula (O8) |
| C&B / cost | **Omit** — **FORBIDDEN** fields (O10 · D-S8) |
| U19 | summary **=** drill **=** list plans/YCTD via **`resolveHrmListScope`** (D-S9) |
| This seat | Docs + client DOC-DELTA pointer — **NO** `apps/**` · **NO** seed · **NO** honesty flip |

```text
  FE Dashboard / Reports (bind only)
        │
        ▼
  GET /api/hrm/recruitment/dashboard[+ /yctd | ?include=yctd]
        │  paper GET /api/hrm/rec/dashboard = alias only
        ▼
  RecruitmentDashboardService (NEW · read-only)
        ├─ KH  ← recruitment_plans (approved) × months_data cells (O2)
        ├─ TT  ← job_requisitions (scope) × recruitment_candidates.stage map
        └─ funnel / ETA / % / empty_guide — BE formulas (BA §2.1)
```

**Envelope RETAIN:** `{ code, message, data }` · success **`HRM-REC-DASH-200`** · domain errors **`HRM-REC-DASH-*`** · scope reuse **`HRM-SCOPE-409`** / 403 pattern of list plans.

---

## 2. AS-IS Nest baseline → gap

| Surface | Code | Gap vs F.1 |
|---------|------|------------|
| `GET …/dashboard*` | **ABSENT** (`recruitment.controller` has plans/requisitions/candidates/apps — **no** dashboard) | **ADD** F-REC-DASH-01/02 |
| Paper `/rec/dashboard` | ABSENT Nest | Alias only — **DENY** dual controller |
| FE AS-IS | `recruitmentDashboardAggregator` + `listJobPostings` / candidates join | **UPGRADE FE** bind DTO — **DENY** keep domain aggregate |
| Reports AS-IS | `buildRecruitmentReportFromApi(candidates)` | **ALIGN** same Nest semantics (O8) |
| Sources LIVE | plans cells · YCTD Wave-2 · `recruitment_candidates` · pipeline catalog EFF | **REUSE** — no new SoT table |
| `candidate_applications` | posting-centric Lane B | **FORBIDDEN** as dashboard KH/TT SoT |

---

## 3. Path & alias lock (O1 / D-S2)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `GET /api/hrm/recruitment/dashboard` · `GET /api/hrm/recruitment/dashboard/yctd` |
| **PHYSICAL (alt)** | `GET /api/hrm/recruitment/dashboard?include=yctd` — **same** DTO drill payload as `/yctd` when include present |
| **LOGICAL (paper)** | `GET /api/hrm/rec/dashboard` (+ optional paper drill) |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |

| Paper field (F-REC-DASH-01 stub) | Physical DTO (canonical) | Rule |
|----------------------------------|--------------------------|------|
| `hired` | **`filled_count`** | O3 onboard(+hired map) |
| `in_pipeline` | **`in_pipeline_count`** | Non-terminal ∧ ≠ onboard |
| `completion_pct[]` | **`completion_pct`** (+ `by_month[].completion_pct`) | Scalar org + slices |
| `headcount_plan_cells` (paper src) | `recruitment_plan_positions.months_data[]` | REC-01 sealed |
| `recruitment_requests` (paper src) | `job_requisitions` | REC-02 sealed |
| `candidate_applications` (paper src) | **`recruitment_candidates`** via `requisition_id` | Lane A spine |

**FORBIDDEN:** Nest `/rec/dashboard` dual SoT · CREATE `rec_dashboard_rollup*` · FE sum `job_postings.headcount` as KH.

---

## 4. Sealed catalogs (API normative)

### 4.1 Funnel catalog → bucket map (O4 · R3 closed)

Canonical response keys (**always present**, ≥0):

`funnel.cv` · `funnel.screening` · `funnel.interview` · `funnel.offer` · `funnel.onboard`

| Priority | Rule | Bucket |
|----------|------|--------|
| 1 | Effective catalog row `is_hired_outcome=true` **or** stage_key ∈ `{hired, onboard, onboarding}` | **`onboard`** (hired→onboard synonym **LOCKED**) |
| 2 | `is_reject_outcome=true` **or** stage_key ∈ `{rejected, withdrawn, reject}` | **terminal_reject** — **exclude** from all funnel keys **and** from `in_pipeline_count` |
| 3 | stage_key ∈ `{screening, screen, hr_screen}` | **`screening`** |
| 4 | stage_key ∈ `{interview, interviewing, technical_interview}` | **`interview`** |
| 5 | stage_key ∈ `{offer, offered}` | **`offer`** |
| 6 | stage_key ∈ `{new, applied, cv, cv_received, resume}` **or** default candidate status `new` | **`cv`** |
| 7 | Catalog EFF>0 but stage unknown / unmapped | **no** funnel bucket increment · still may count `in_pipeline` if not terminal/onboard (**VAL-06** keys stay 0 for miss) |
| 8 | Catalog EFF=0 (empty) | Use synonym table rows 1–6 only on `recruitment_candidates.status` · missing → 0 |

**Labels:** each funnel key ships display-ready `funnel_labels.{key}` VI from catalog `label` when mapped, else defaults:

| key | default_label_vi |
|-----|------------------|
| cv | Hồ sơ / CV |
| screening | Sàng lọc |
| interview | Phỏng vấn |
| offer | Offer |
| onboard | Onboard / Đã tuyển |

**FORBIDDEN:** English-only SoT UX · omit a canonical key · hardcode closed six as product ceiling (catalog open RETAIN).

### 4.2 `open_yctd` status set (O5 · R4 closed)

| Set name | Status tokens (lowercase) | Use |
|----------|---------------------------|-----|
| **`OPEN_YCTD_STATUS_SET`** | **`open_for_hire`** · **`open`** (legacy synonym) · **`approved`** (bridge post-approve / pre-flags) | `open_yctd_count` · ETA candidate pool |
| **EXCLUDED** | `draft` · `pending_approval` · `rejected` · `cancelled` · `closed` · `on_hold` | Not «open» for dashboard |
| Soft-delete | `archived_at IS NULL` (RETAIN) | Excluded if archived |

**ETA eligibility (O5):** YCTD ∈ `OPEN_YCTD_STATUS_SET` ∧ `remaining = max(headcount − filled_on_that_yctd, 0) > 0` ∧ `target_month` not null → take **earliest** `target_month` as `yyyy-MM` (DATE column → month truncate; cite TARGET-MONTH CLOSED coerce peer — do **not** reopen).

**Normative receivable** for UV write remains REC-02 `open_for_hire` — dashboard **read** may count `open`/`approved` synonyms in open set (filter-only parity with list receivable synonyms).

### 4.3 `enough_people_status` (O9 · BA §2.1)

| # | Condition | Status |
|---|-----------|--------|
| 1 | No approved ĐB / no O2 cells in period → `empty_guide` | `no_plan` |
| 2 | `planned_need > 0` ∧ `gap_count = 0` | `enough` |
| 3 | `gap_count > 0` ∧ (`open_yctd_count > 0` ∨ `in_pipeline_count > 0`) | `in_progress` |
| 4 | `gap_count > 0` ∧ `open_yctd_count = 0` ∧ `in_pipeline_count = 0` | `at_risk` |

### 4.4 Formulas (BA O1–O10 cite — Nest owns)

| Metric | Formula |
|--------|---------|
| `planned_need` | Σ `need_hire` / `headcount_need_hire` over cells: plan `status=approved` ∧ `lifecycle_status=need_hire_approved` ∧ `need_hire≥1` ∧ month ∈ period ∩ scope (**O2**) — **EXCLUDE** unlock cells / draft plans / `need_hire=0` |
| `filled_count` | Count candidates on in-scope YCTD mapped to bucket **`onboard`** (**O3**) — out_of_plan YCTD **included** |
| `in_pipeline_count` | On in-scope YCTD: not terminal_reject ∧ not onboard |
| `open_yctd_count` | Count `job_requisitions` in scope with status ∈ **OPEN_YCTD_STATUS_SET** §4.2 |
| `gap_count` | `max(planned_need − filled_count, 0)` |
| `completion_pct` | `planned_need=0` → **`null`**; else `min(100, round(100 × filled_count / planned_need))` int |
| `enough_people_eta` | Earliest open YCTD `target_month` with remaining>0 (**O5**) else `null` |
| `enough_people_eta_label` | VI: month label **or** «Chưa xác định thời điểm đủ người» when eta null + not `enough`/`no_plan` |
| `funnel.*` | §4.1 — keys always present |
| out_of_plan | **Include** TT/funnel/drill · **never** inflate KH (**O6**) |
| legacy `headcount_mode` NULL | Drill readable + `mode_warn=true` / classify hint · **no** in_plan cell credit (**O7**) |
| Cost / C&B | **Omit** (**O10**) |

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → source · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** dashboard summary **=** yctd drill **=** `listRecruitmentPlans` / `listJobRequisitions` — **cùng** `resolveHrmListScope` (+ `pushCompanyIdFilter` pattern) (**U19** · VAL-17).

---

### 5.1 F-REC-DASH-01 — Summary KH vs TT + funnel + enough-people (**ADD**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/dashboard` |
| **Mục đích** | Trả bảng điều khiển tuyển **display-ready**: KH định biên Cần tuyển đã duyệt vs TT pipeline/onboard gắn YCTD; phễu; % hoàn thành; trạng thái/ETA «bao giờ đủ người» theo kỳ × đơn vị trong quyền — **không** nhập tay; **không** lộ C&B. |
| **Nghiệp vụ xử lý** | **(1) Period VAL:** require `year` **xor** (`from`+`to`) month-granular — invalid/missing → **400** `HRM-REC-DASH-PERIOD-400` (**VAL-01**). **(2) Scope:** `resolveHrmListScope(authorization, company_id)`; hint mismatch → **409** `HRM-SCOPE-409` (**VAL-02** · U19). Optional `department_key` / `position_key` filter in-scope only. **(3) KH:** load approved plans in period/year ∩ scope; flatten `months_data` cells; sum O2 only → `planned_need`. **(4) YCTD set:** `job_requisitions` in scope (optional dept/pos); exclude archived. **(5) Apps/TT:** `recruitment_candidates` where `requisition_id` ∈ YCTD set; map stage→bucket §4.1 → `filled_count` / `in_pipeline_count` / `funnel`. **(6) Derived:** `gap_count`, `completion_pct`, `open_yctd_count`, `enough_people_status`, `enough_people_eta` (+ label) §4.3–4.4. **(7) empty_guide:** when no O2 cells / no approved plan in period → `empty_guide` object + zeros + `completion_pct=null` + status `no_plan` — **cấm** bịa KH (**VAL-16** · D-S7). **(8) Slices:** shape `by_month[]`, `by_org_unit[]` display-ready (same formulas). **(9) include=yctd:** if present, attach `by_yctd[]` per §5.2 (same scope). **(10) Omit:** offer_salary, c_and_b_*, bank, MST, cost_* (**VAL-11**). **(11) GET only** — POST/PUT/PATCH → **405** `HRM-REC-DASH-METHOD-405` (**VAL-14**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-08** Diễn biến **#1** (lọc kỳ/đơn vị) · **#2** (tải chỉ số KH/TT/funnel/status/ETA) · BA FE §3.4 bước **1–4** · AC-REC-08-01..05 · 08–10 · ALT-01..03/05/06 · EX-01..04/06/08/12 · VAL-01..09,11,12,14..19 · SA D-S1..D-S9 · O1–O10. |
| **Request → source** | Query → read-only join §6 — **no writes**. |
| **Response** | See §7 · code `HRM-REC-DASH-200`. |
| **Lỗi** | `HRM-REC-DASH-PERIOD-400` · `HRM-SCOPE-409` / 403 · `HRM-REC-DASH-METHOD-405` · auth 401. |

**Paper alias:** `GET /api/hrm/rec/dashboard`.

---

### 5.2 F-REC-DASH-02 — Drill YCTD / pipeline rows (**ADD**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/dashboard/yctd` **or** `GET …/dashboard?include=yctd` |
| **Mục đích** | Khoan danh sách **YCTD** (không Campaign): từng yêu cầu tuyển trong scope với KH ô (nếu có), headcount, filled, pipeline, mode, status, `target_month` — phục vụ click → detail YCTD. |
| **Nghiệp vụ xử lý** | **(1)** Same period + scope VAL as DASH-01. **(2)** List in-scope `job_requisitions` (not limited to OPEN set — include pending/closed for transparency **or** default all non-archived in period filter by `target_month` overlap; **MVP SEAL:** all non-archived in scope with `target_month` in period **OR** status ∈ OPEN set **OR** has ≥1 candidate in period — prefer **all non-archived in scope** intersecting period via `target_month` year-month ∈ range **OR** `target_month` null but status open). **Normative MVP row set:** every non-archived YCTD in scope whose `target_month` month ∈ filter period **OR** (target_month null ∧ status ∈ OPEN_YCTD_STATUS_SET) — ensures out_of_plan visible (**O6**). **(3)** Per row compute `filled_count`, `in_pipeline_count`, `remaining`, flags `headcount_mode`, `mode_warn` when mode NULL (**O7**). **(4)** **DENY** campaign_id / job_posting as primary drill entity (**VAL-13**). **(5)** Same C&B omit. **(6)** Pagination optional: `page`/`page_size` (default page_size 50, max 200). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-08** Diễn biến **#3** · BA FE §3.4 bước **5–6** · AC-REC-08-06/07 · ALT-04 · EX-05/07 · VAL-09/10/13/17 · D-S10 · O6/O7. |
| **Request → source** | Query → `job_requisitions` + candidates aggregate + soft cell label from plans when `headcount_cell_id` resolves. |
| **Response** | `{ items: by_yctd[], total, page?, page_size? }` or embedded `by_yctd` on DASH-01 · `HRM-REC-DASH-200`. |
| **Lỗi** | Same period/scope tokens as DASH-01. |

**Paper alias:** paper drill under `/rec/dashboard` (logical only).

---

## 6. DTO ↔ source columns (NO new SoT table)

### 6.1 Query params

| Param | Required | Maps / rule |
|-------|----------|-------------|
| `year` | xor with from/to | `recruitment_plans.year` filter; cells `month` 1–12 |
| `from` | with `to` | `yyyy-MM` inclusive start |
| `to` | with `from` | `yyyy-MM` inclusive end; `from≤to` |
| `company_id` | optional hint | Must match `resolveHrmListScope` |
| `department_key` | no | Filter positions/YCTD `department_key` |
| `position_key` | no | Filter `position_key` |
| `include` | no | `yctd` → attach drill |
| `page` / `page_size` | drill only | Pagination |

### 6.2 Response fields → physical sources

| DTO field | Type | Source |
|-----------|------|--------|
| `planned_need` | int | Σ `recruitment_plan_positions.months_data[].need_hire` **or** `headcount_need_hire` (alias) where O2 |
| `filled_count` | int | COUNT `recruitment_candidates` → bucket onboard |
| `in_pipeline_count` | int | COUNT candidates non-reject non-onboard |
| `open_yctd_count` | int | COUNT `job_requisitions` status ∈ OPEN_YCTD_STATUS_SET |
| `gap_count` | int | derived BE |
| `completion_pct` | int \| null | derived BE |
| `enough_people_status` | enum | derived BE |
| `enough_people_eta` | `yyyy-MM` \| null | MIN `job_requisitions.target_month` (DATE→month) among ETA-eligible |
| `enough_people_eta_label` | string | BE VI label |
| `funnel.cv..onboard` | int | candidates × §4.1 |
| `funnel_labels` | object | catalog labels / defaults |
| `by_month[]` | array | slice by cell.month / target_month |
| `by_org_unit[]` | array | slice by company_id / department_key + display labels |
| `by_yctd[]` / drill `items[]` | array | see §6.3 |
| `empty_guide` | object \| null | `{ title, body, cta_hint }` when `no_plan` — else null |
| `period` | object | echo `{ year? , from?, to? }` |
| `scope` | object | display-safe scope summary (no secrets) |

### 6.3 `by_yctd[]` row

| DTO | Source column / derive |
|-----|------------------------|
| `requisition_id` | `job_requisitions.id` |
| `title` | `job_requisitions.title` |
| `status` | `job_requisitions.status` |
| `headcount_mode` | `job_requisitions.headcount_mode` (null → legacy) |
| `mode_warn` | bool BE when mode NULL (O7) |
| `headcount` | `job_requisitions.headcount` |
| `filled_count` | COUNT apps onboard on this id |
| `in_pipeline_count` | COUNT pipeline on this id |
| `remaining` | `max(headcount − filled_count, 0)` |
| `target_month` | `job_requisitions.target_month` → `yyyy-MM` or null |
| `headcount_cell_id` | `job_requisitions.headcount_cell_id` |
| `department_key` / `position_key` | YCTD keys |
| `company_id` | `job_requisitions.company_id` |

### 6.4 FORBIDDEN response fields

`offer_salary` · `salary_*` · `c_and_b_*` · `compensation_*` · `bank_*` · `mst` · `tax_code` · `cost_*` · `campaign_*` as primary · invent VND series.

### 6.5 Spine tables (read)

| Table | Role |
|-------|------|
| `recruitment_plans` | `status`, `year`, `company_id` |
| `recruitment_plan_departments` / `recruitment_plan_positions` | hierarchy + `months_data` JSONB cells |
| `job_requisitions` | YCTD Wave-2 columns RETAIN |
| `recruitment_candidates` | `requisition_id`, `status` (stage), `company_id` |
| `rec_pipeline_stage` (+ effective resolve) | catalog→bucket flags |

---

## 7. Response shape (display-ready — normative)

```json
{
  "period": { "year": 2026, "from": null, "to": null },
  "planned_need": 12,
  "filled_count": 4,
  "in_pipeline_count": 7,
  "open_yctd_count": 5,
  "gap_count": 8,
  "completion_pct": 33,
  "enough_people_status": "in_progress",
  "enough_people_eta": "2026-09",
  "enough_people_eta_label": "Dự kiến đủ người: 09/2026",
  "funnel": { "cv": 3, "screening": 2, "interview": 1, "offer": 1, "onboard": 4 },
  "funnel_labels": {
    "cv": "Hồ sơ / CV",
    "screening": "Sàng lọc",
    "interview": "Phỏng vấn",
    "offer": "Offer",
    "onboard": "Onboard / Đã tuyển"
  },
  "by_month": [],
  "by_org_unit": [],
  "by_yctd": [],
  "empty_guide": null
}
```

**empty_guide example** (`no_plan`):

```json
{
  "empty_guide": {
    "code": "NO_APPROVED_HEADCOUNT",
    "title": "Chưa có định biên đã duyệt trong kỳ",
    "body": "Tạo và duyệt định biên (Cần tuyển) trước khi theo dõi «bao giờ đủ người».",
    "cta_hint": "Mở Định biên nhân sự"
  },
  "planned_need": 0,
  "filled_count": 0,
  "completion_pct": null,
  "enough_people_status": "no_plan",
  "enough_people_eta": null,
  "enough_people_eta_label": "Chưa xác định thời điểm đủ người"
}
```

---

## 8. Error codes `HRM-REC-DASH-*` (mint locked · VAL family)

| Code | HTTP | When | VAL |
|------|------|------|-----|
| `HRM-REC-DASH-200` | 200 | Success envelope code | — |
| `HRM-REC-DASH-PERIOD-400` | 400 | Missing/invalid year or from/to | VAL-01 · EX-01 |
| `HRM-SCOPE-409` | 409 | `company_id` hint ≠ token scope (RETAIN family) | VAL-02 · EX-02 |
| `HRM-REC-DASH-METHOD-405` | 405 | Non-GET on dashboard routes | VAL-14 |
| `HRM-REC-DASH-VAL-400` | 400 | Generic query validation (page_size, include token) | VAL-01 class |

**Business FAIL (QA/impl — usually 200 body wrong, not alternate HTTP):** VAL-03..11,15..19 — assert formulas / omit C&B / path / Reports align / honesty / U65.

**Peer RETAIN (not reinvent):** `HRM-YCTD-*` on YCTD mutate · `HRM-HC-*` on plans — dashboard **read-only** does not mint YCTD mutate errors.

---

## 9. ba-data necessity — **NOT REQUIRED**

| Spine need | Sealed? | Note |
|------------|---------|------|
| Cell `need_hire` / `lifecycle_status` / `cell_id` | **YES** REC-01 DATA/API LIVE | KH O2 |
| Plan `approved` + `year` | **YES** | Period |
| YCTD `headcount_mode` / `status` / `headcount` / `target_month` / `headcount_cell_id` | **YES** REC-02 LIVE | TT/drill/ETA |
| `recruitment_candidates.requisition_id` + `status` | **YES** Lane A | Funnel |
| Pipeline catalog `is_hired_outcome` / `is_reject_outcome` | **YES** platform REC catalog | Bucket map |
| New rollup / dashboard table | **NO — DENY** | Option A |

**Missing column on sealed spine?** **None** for MVP formulas.  
**Clarification (not ba-data gap):** paper `candidate_applications` **must not** be used as TT SoT — use `recruitment_candidates`. Posting Lane B remains orthogonal.

→ **ba-data seat: NOT REQUIRED** (HOLD/skip).

---

## 10. U19 scope parity summary (= drill)

| Operation | Resolver |
|-----------|----------|
| `GET /dashboard` | `resolveHrmListScope` |
| `GET /dashboard/yctd` / `?include=yctd` | **same** |
| Underlying plan cell read | same companyIds as `GET /recruitment-plans` |
| Underlying YCTD read | same as `GET /requisitions` |
| Candidate aggregate | filter `company_id` ∈ scope **and** `requisition_id` ∈ scoped YCTD set |

| Persona | Behavior |
|---------|----------|
| Group CEO (`main`) | Rollup member units **in** token scope |
| Member CEO | Own legal entity only — 403/409 or empty outside |
| HRBP | Narrow membership — **no** silent group rollup |

**Invariant:** summary numbers **reconcile** with sum of in-scope drill rows for TT/open counts (KH may span cells without 1:1 YCTD yet — gap OK).

---

## 11. Reports alignment (O8)

| Surface | Contract |
|---------|----------|
| Dashboard tab | Full DTO §7 |
| Reports recruitment | **Same** GET **or** subset `{ planned_need, filled_count, in_pipeline_count, completion_pct, funnel, enough_people_* }` — **identical semantics** |
| **DENY** | `buildRecruitmentReportFromApi` invent %/KH from candidates-only / job_postings |

---

## 12. must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | REC-01 cell/`need_hire`/spawn UQ · REC-02 mode/`open_for_hire`/flags/CELL-QTY/BOD · TARGET-MONTH CLOSED coerce peer · `resolveHrmListScope` · soft-delete · J-HRM-05 YCTD detail · UF-HRM-12 · honesty false |
| **DENY** | Nest `/rec` dual SoT · FE domain aggregate · Option B materialize · REC-03 Campaign drill · seed · reopen REC-01/02 seals · invent VND/C&B · flip `recruitment_uat_ready` / product_go · claim module REC UAT |
| **OUT** | UC-BP-REC-03 |
| **C-SLICE** | Slice GWC ≠ module GO |

---

## 13. Client API_DESIGN DOC-DELTA pointer

| Action | Path |
|--------|------|
| **EXPAND** F-REC-DASH-01 physical prefer + full F.1 | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| **ADD** F-REC-DASH-02 drill | same |
| Registry DOC-DELTA | `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01` |
| Team SoT primary | **this file** |

---

## 14. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
no apps/** this seat
Option B materialize DENY
```

---

## 15. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-api-01.md` |
| **next_owner** | **dev-be** (unlock) · **dev-fe** parallel after/with BE contracts · rule 26 split |
| **ba-data** | **NOT REQUIRED** |
| **completion_report** | CONFIRMED F.1 physical Option A: `GET /recruitment/dashboard` + `/yctd`/`?include=yctd`; paper `/rec/dashboard` alias only; DTO↔plans cells + YCTD + `recruitment_candidates`; funnel map + OPEN_YCTD_STATUS_SET + `HRM-REC-DASH-*`; empty_guide; C&B omit; U19 parity; BA O1–O10 formulas BE-owned; DENY dual Nest/FE aggregate/Option B/REC-03/seed/honesty. |

---

## next_dispatch_prompt (BOTH lanes — copy-ready)

### A — dev-be

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: API-01 CONFIRMED · BA-01 CONFIRMED · SA-01 Option A
change_mode: ADD · preserve_default · code_memory_required APPEND
solid_convention_ack: display-ready Nest owns formulas · no FE aggregate · scope_parity resolveHrmListScope

MISSION: Implement Option A Nest recruitment dashboard read-model —
1) ADD GET /api/hrm/recruitment/dashboard (+ GET …/dashboard/yctd and/or ?include=yctd) on @Controller('recruitment') — DENY Nest /rec dual controller
2) RecruitmentDashboardService on-the-fly: KH from approved months_data cells (O2); TT/funnel from recruitment_candidates by requisition_id + catalog→bucket map (API-01 §4.1); open_yctd via OPEN_YCTD_STATUS_SET (API-01 §4.2)
3) Display-ready: planned_need, filled_count, in_pipeline_count, gap_count, completion_pct (null if planned_need=0), enough_people_status/eta/label, funnel 5 keys always, by_month/by_org_unit, empty_guide, by_yctd drill
4) Errors: HRM-REC-DASH-PERIOD-400 · HRM-SCOPE-409 · HRM-REC-DASH-METHOD-405 · success HRM-REC-DASH-200
5) Omit C&B/salary/cost fields; GET only; no Option B rollup table
6) jest: formula O2/O3/O5/O6/O7/O9 · funnel keys · empty_guide · scope_parity summary=drill=list plans/YCTD · C&B absent
DENY: seed · honesty flip · REC-03 · job_postings as KH · materialize rollup · reopen REC-01/02 seals

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md §2.1 · VAL-01..19
3. docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md D-S1..D-S10
4. apps/api/hrm-api/src/recruitment/recruitment.controller.ts · recruitment.service.ts · recruitment-catalog.service.ts · rec-pipeline-stage.service.ts · common/hrm-list-scope.ts

must_keep: REC-01 cell/spawn · REC-02 open_for_hire/flags/CELL-QTY/BOD · TARGET-MONTH CLOSED · resolveHrmListScope · soft-delete
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-be-01.md
spec_read_ack required (srs + ba + api)
```

### B — dev-fe

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: API-01 CONFIRMED · coordinate with BE-01 DTO
change_mode: UPGRADE · preserve_default · code_memory_required APPEND
solid_convention_ack: FE display-only bind · DENY domain aggregate

MISSION: Replace FE dashboard/report domain aggregation with Nest DTO bind —
1) Tuyển dụng → Dashboard: filter kỳ/đơn vị → GET /api/hrm/recruitment/dashboard* only; bind KH/TT/funnel/status/ETA/empty_guide; F5 retain filter
2) REMOVE/disable recruitmentDashboardAggregator + listJobPostings (and multi-list joins) as KH/% SoT
3) Drill: GET yctd / include=yctd → table by_yctd; click row → existing YCTD detail (J-HRM-05) — DENY Campaign
4) Reports tab recruitment: same Nest contract or documented subset — DENY buildRecruitmentReportFromApi second formula
5) Hide/omit cost charts & any C&B/salary (O10)
6) Surface 400 PERIOD / 409 scope toasts VI; no stale numbers on error
DENY: Nest /rec client dual SoT · seed · honesty flip · invent VND · FE compute completion_pct/gap/ETA

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md
2. docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md Diễn biến §3.4 · AC-REC-08-*
3. apps/web HRM recruitment Dashboard / Reports (AS-IS aggregator)

must_keep: chrome layout · J-HRM-05 detail path · sealed REC-01/02 UF
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
spec_read_ack required
```
