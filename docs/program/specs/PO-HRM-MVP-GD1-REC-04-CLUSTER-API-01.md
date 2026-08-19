# PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01 — API F.1 · Quét kho CV nội bộ (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-6 seat **#8**) |
| **lane** | governance · sa |
| **change_mode** | **UPGRADE / ADD** DOC-DELTA residual · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · unlock **dev-be** + **dev-fe** |
| **uc_ids** | `UC-BP-REC-04` |
| **depends_on** | BA-01 O1–O8 **CONFIRMED** · SA-01 Option **A LOCKED** · peer W2 F-REC-YCTD-04 LIVE · UV-YCTD RETAIN |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md) · AC-REC-CV-04-* · VAL-REC-CV-* · O1–O8 |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md) Option A · F-REC-CV-SCAN-01..03 disposition |
| **ref_yctd_api** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md) **F-REC-YCTD-04** · PipelineFlagsDto |
| **ref_uv** | [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) · F-REC-UV-YCTD-* · F-REC-CMP-* **RETAIN** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-04** Diễn biến **#1–#2** · Thành công · special 0-hits/skip · **BR-BP-CV-01** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-REC-APP-* = **logical alias**; ADD family **F-REC-CV-SCAN-*** physical prefer |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ba-data** | **NOT REQUIRED** — O2 = ADD JSON keys on existing `job_requisitions.pipeline_flags_json` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base | Nest `@Controller('recruitment')` — **`/api/hrm/recruitment/*` ONLY** |
| Kho search | **`GET /api/hrm/recruitment/candidates-pool`** (+ YCTD context) — Lane B `public.candidates` |
| Complete / skip | **Preferred:** **`POST …/requisitions/:id/internal-scan`** · **Synonym:** **`PATCH …/pipeline-flags`** with `internal_scan_*` |
| Scan audit SoT | Keys on **`job_requisitions.pipeline_flags_json`** — **DENY** event table as sole SoT |
| Display-ready DTO | YCTD list/get return **`internal_scan_done\|skipped\|at\|skip_reason`** + **RETAIN** `posted` / `has_cv` / `interview_started` / `cv_intake_allowed` (+ `*_at`) |
| External gate | **DENY** `posted=true` until `done=true` **∨** (`skipped=true` ∧ reason non-empty ∧ quyền) |
| Error mint | **`HRM-REC-CV-SCAN-*`** (REQUIRED · SKIP-REASON · FORBIDDEN · YCTD · optional ALREADY) |
| U19 | list pool **=** get pool **=** scan **=** YCTD get **=** flags/internal-scan **=** attach — same `resolveHrmListScope` |
| Paper path | `/api/hrm/rec/*` = **logical alias only** — **DENY** Nest dual SoT |
| Attach | **RETAIN** F-REC-UV-YCTD-03/04 · F-REC-CMP-* — **cấm** redefine 05a |
| REC-03 / postings | **OUT / DENY** as kênh ngoài SoT (GĐ1 = `posted` readiness only) |
| ba-data | **NOT REQUIRED** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen REC-00 / W1–W5 without regression |
| Unlock | **dev-be** + **dev-fe** (rule 26 split) after this CONFIRMED |

```text
  FE «Quét kho nội bộ» trên YCTD open_for_hire
        │  Network assert path contains /recruitment/
        ▼
  GET  /api/hrm/recruitment/candidates-pool?company_id&requisition_id&position_code&skill|experience…   (F-REC-CV-SCAN-01)
  GET  /api/hrm/recruitment/candidates-pool/:id                                                         (RETAIN U19)
        │  attach khớp (RETAIN — not FR-04 invent)
        ▼
  POST /api/hrm/recruitment/candidates (+ requisition_id)  OR  candidate-applications                   (F-REC-UV-YCTD-*)
        │  hoàn tất / skip
        ▼
  POST /api/hrm/recruitment/requisitions/:id/internal-scan                                              (F-REC-CV-SCAN-02/03 preferred)
  PATCH …/requisitions/:id/pipeline-flags   (synonym + UPGRADE posted gate)                             (F-REC-YCTD-04 UPGRADE)
        │  stamp internal_scan_* on pipeline_flags_json
        │  DENY posted=true until done|skip valid
        ▼
  public.job_requisitions.pipeline_flags_json  ·  public.candidates (kho)
        │  paper /api/hrm/rec/* = alias only
        ▼
  REC-03 Campaign / job_postings = OUT GĐ1
```

**Envelope RETAIN:** `{ code, message, data }` · success **`HRM-REC-200`** / **`HRM-REC-201`** (or existing `HRM-REC-CP-200` on pool list) · domain errors §8.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite) | Gap vs F.1 residual |
|---------|----------------------|---------------------|
| `GET …/candidates-pool` | `listCandidatesTable` · `resolveHrmListScope` · filter `company_id` + optional `stage` only · table `public.candidates` (`position`, `notes`, …) | **UPGRADE** YCTD context + title+skill/exp criteria (O3/O4); empty **200** hợp lệ |
| `GET …/candidates-pool/:id` | scope_parity with list | **RETAIN** U19 |
| `POST …/candidates` (+ `requisition_id`) | UV-YCTD create attach | **RETAIN** must_keep O6 |
| `PATCH …/requisitions/:id/pipeline-flags` | DTO: `posted`/`has_cv`/`interview_started`/`cv_intake_allowed` · receivable/O4 gates · **no** `internal_scan_*` · **no** posted↔scan gate | **UPGRADE** accept scan keys · **gate** `posted` · display-ready merge |
| `POST …/requisitions/:id/internal-scan` | **ABSENT** | **ADD** preferred complete/skip wrapper (writes **same** JSON keys only) |
| `PipelineFlags` type | 4 booleans + `*_at` | **UPGRADE ADD** `internal_scan_*` keys — **no wipe** |
| YCTD get/list DTO | `pipeline_flags` without scan | **UPGRADE** expose scan keys display-ready |
| Nest `/rec/*` | Paper naming | **Alias only — DENY** controller SoT |
| Scan event table | Absent | **DENY** as sole SoT (HOLD append-only future) |
| REC-03 / `job_postings` | Leftover Lane B | **DENY** reopen as FR-04 SoT |

**FORBIDDEN invent this seat:** Nest `/rec` dual · second CV person table · scan-event sole SoT · REC-03 Campaign · seed · honesty flip · reopen REC-00 / W1–W5 rewrite · redefine UV-YCTD/CMP · mega-EAV skill SoT · ba-data columns for O2.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/candidates-pool*` · `/candidates*` · `candidate-applications*` · `applications` · `compare` · `/requisitions/:id/pipeline-flags` · **`/requisitions/:id/internal-scan`** |
| **LOGICAL (paper)** | `/api/hrm/rec/candidates*` · `/rec/recruitment-requests/{id}/internal-scan*` · `/rec/…/pipeline-flags` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/recruitment/` — **FAIL O1** if FE mutates Nest `/rec/*` as SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| `rec_candidate` | pool row / `candidates-pool` | `public.candidates` |
| scan audit | `pipeline_flags.internal_scan_*` | `job_requisitions.pipeline_flags_json` |
| attach | UV-YCTD / applications | `recruitment_candidates` + N–N (**RETAIN**) |
| kênh ngoài GĐ1 | `pipeline_flags.posted` | same JSON — **not** `job_postings` |

---

## 4. Scan flag dictionary (O2 — normative · ba-data NOT REQUIRED)

| Key | Type | Rule |
|-----|------|------|
| `internal_scan_done` | boolean | `true` after complete scan (**incl. 0 hits**) |
| `internal_scan_skipped` | boolean | `true` on valid skip (O7) — **mutually exclusive prefer:** skip ⇒ `done=false` ∧ `skipped=true` (không cả hai `true`) |
| `internal_scan_at` | ISO timestamptz string \| null | Server stamp on complete/skip |
| `internal_scan_skip_reason` | string \| null | **Required** when `skipped=true`; **null** on done-path |
| `posted` · `has_cv` · `interview_started` · `cv_intake_allowed` (+ `*_at`) | **RETAIN** | **FORBIDDEN** wipe when ADD scan keys |

**Gate invariant (O5 / BR-BP-CV-01):**

```text
posted = true  ⇒  (internal_scan_done = true)
                  ∨  (internal_scan_skipped = true ∧ skip_reason non-empty ∧ actor allowed)
```

**Transitions:**

| Action | Flags outcome |
|--------|---------------|
| Complete (N≥0 hits) | `done=true` · `skipped=false` · `skip_reason=null` · `at=now` |
| Skip valid | `skipped=true` · `done=false` · `skip_reason` set · `at=now` |
| Attempt `posted` without above | **400** `HRM-REC-CV-SCAN-REQUIRED` · `posted` unchanged |
| Re-scan after done | MVP **allow** re-stamp (new `at`) — **does not** delete attaches (**Q-REC-CV-RESCAN**) |

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** pool list/get · internal-scan · pipeline-flags · YCTD get · attach = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` / persist company rules (**U19** `scope_parity` · VAL-REC-CV-16).

---

### 5.1 F-REC-CV-SCAN-01 — Quét / list kho theo tiêu chí gắn YCTD (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/candidates-pool` |
| **Mục đích** | Cung cấp danh sách UV trong **kho nội bộ** (Lane B) theo phạm vi pháp nhân và tiêu chí chức danh + kỹ năng/kinh nghiệm gắn ngữ cảnh YCTD — bước Quét kho trước kênh ngoài. |
| **Nghiệp vụ xử lý** | (1) JWT + `company_id` → `resolveHrmListScope` (RETAIN). (2) Optional **`requisition_id`** (YCTD context): load YCTD in-scope; if present and not receivable `open_for_hire` (synonym `open` classified RETAIN W2) → **400** `HRM-REC-CV-SCAN-YCTD` when caller intends scan start (**preferred:** enforce when `for=internal_scan` **or** `requisition_id` present on Quét UI). (3) **Title criteria (O4):** require `position_code` **or** `position` / `q_position` family (prefer align YCTD `position_key` / job_titles family) — **FAIL** exact-title-only as sole business criteria without skill/exp dimension. (4) **Skill/exp (O4):** require ≥1 of `skill` / `q_skill` / `experience` / `experience_min_years` / documented `q` bound to skill\|exp semantics — map onto **LIVE** person fields (`position`, `notes`, …) per **Q-REC-CV-SKILL-FIELD** — **DENY** invent mega-EAV / second CV SoT / ba-data table. (5) Optional `stage` RETAIN. (6) Return `{ total, data[] }` display-ready pool rows — **200** empty hợp lệ (0 hits). (7) **Lane A list alone ≠ kho** — FE Quét kho **must** call this (or thin wrapper below), not only `/candidates?requisition_id=`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-04** Diễn biến **#1** · Luồng chính 1–2 · AC-REC-CV-04-01/02 · ALT-01 · EX-04/05/09 · VAL-REC-CV-01..04/12/16/17 · **O1/O3/O4**. |
| **Request** | Query: `company_id` (required); `requisition_id?`; `for=internal_scan?`; `position_code?` \| `position?` \| `q_position?`; `skill?` \| `q_skill?` \| `experience?` \| `experience_min_years?`; `stage?`. |
| **Response → DB** | `data[]` ← `public.candidates` in scope · filtered. Success **`HRM-REC-CP-200`** (RETAIN) or **`HRM-REC-200`**. |
| **Lỗi** | Scope 409/404 · `HRM-REC-CV-SCAN-YCTD` · empty **200** (not 404). |

**Optional thin wrapper (same SoT):** `GET …/requisitions/:requisitionId/internal-scan/candidates` — **may** default title from YCTD then delegate to pool list; **not** a second person SoT.

**Paper alias:** `GET /api/hrm/rec/candidates*` · `…/internal-scan/candidates`.

**Get-by-id RETAIN:** `GET …/candidates-pool/:candidateId` — same scope (AC-REC-CV-04-ALT-05).

---

### 5.2 F-REC-CV-SCAN-02 — Ghi nhận đã quét (kể cả 0 hits) (**ADD preferred**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/requisitions/:requisitionId/internal-scan`** |
| **Mục đích** | Đóng bước Quét kho trên YCTD: stamp «đã quét» (kể cả **0** kết quả) để mở readiness kênh ngoài (`posted`) theo BR-BP-CV-01 — **không** bắt buộc gắn UV. |
| **Nghiệp vụ xử lý** | (1) Scope assert on YCTD (`assertResourceInHrmScope` + list resolver). (2) Status receivable `open_for_hire` (W2 synonym rules RETAIN) — else **400** `HRM-REC-CV-SCAN-YCTD`. (3) Body `action=complete` (default). (4) Merge into `pipeline_flags_json`: `internal_scan_done=true` · `internal_scan_skipped=false` · `internal_scan_skip_reason=null` · `internal_scan_at=now()` — **RETAIN** existing posted/has_cv/… keys (no wipe). (5) Optional `criteria_snapshot` / `hit_count` for audit UX — **not** a second SoT table. (6) Attach UV **must** use F-REC-UV-YCTD-* **before or after** stamp — this endpoint **does not** redefine create 05a. (7) Re-complete after done: MVP allow re-stamp `at` (**Q-REC-CV-RESCAN**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-04** Diễn biến **#2** · special **0 hits** · Thành công · AC-REC-CV-04-03/04 · VAL-05/10/20/21 · **O2/O5/O6**. |
| **Request → DB** | `{ action: 'complete', hit_count?: number, criteria_snapshot?: object }` → `job_requisitions.pipeline_flags_json` keys only. |
| **Response** | `{ id, status, pipeline_flags }` display-ready (scan keys + RETAIN family) · **`HRM-REC-200`**. |
| **Lỗi** | `HRM-REC-CV-SCAN-YCTD` · scope 404/409 · optional `HRM-REC-CV-SCAN-ALREADY` if future policy blocks re-scan. |

**Synonym (same write):** `PATCH …/pipeline-flags` with `{ internal_scan_done: true }` — server normalizes exclusive flags + `at` (§5.4).

**Paper alias:** `POST /api/hrm/rec/recruitment-requests/{id}/internal-scan`.

---

### 5.3 F-REC-CV-SCAN-03 — Skip quét có lý do + quyền (**ADD preferred**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/requisitions/:requisitionId/internal-scan`** (`action=skip`) |
| **Mục đích** | Cho phép HR/TP bỏ qua quét kho khi có **lý do** và **quyền**, vẫn tạo vết audit đủ để gate `posted` (BR-BP-CV-01). |
| **Nghiệp vụ xử lý** | (1) Scope + receivable same as SCAN-02. (2) Actor ∈ **HR tuyển dụng** \| **Trưởng bộ phận** **và** quyền mutate YCTD in scope — else **403** `HRM-REC-CV-SCAN-FORBIDDEN`. (3) `skip_reason` trim non-empty — else **400** `HRM-REC-CV-SCAN-SKIP-REASON`. (4) Merge: `internal_scan_skipped=true` · `internal_scan_done=false` · `internal_scan_skip_reason` · `internal_scan_at=now()`. (5) Toast/message path ≠ «đã quét 0 hits». |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-04** Diễn biến **#2** · special **Skip không lý do** · AC-REC-CV-04-05 · EX-02/03 · VAL-06/07/08 · **O7**. |
| **Request → DB** | `{ action: 'skip', skip_reason: string }` → same JSON keys. |
| **Response** | `{ id, status, pipeline_flags }` · **`HRM-REC-200`**. |
| **Lỗi** | `HRM-REC-CV-SCAN-SKIP-REASON` **400** · `HRM-REC-CV-SCAN-FORBIDDEN` **403** · `HRM-REC-CV-SCAN-YCTD` · scope. |

**Synonym:** `PATCH …/pipeline-flags` `{ internal_scan_skipped: true, internal_scan_skip_reason }` — same validation.

**Paper alias:** same `/rec/…/internal-scan`.

---

### 5.4 F-REC-YCTD-04 — PATCH pipeline-flags (**UPGRADE** · gate posted)

| | |
|--|--|
| **METHOD / path** | `PATCH /api/hrm/recruitment/requisitions/:requisitionId/pipeline-flags` |
| **Mục đích** | Cập nhật cờ pipeline trên YCTD (GĐ1 thay Campaign); Wave-6 **mở rộng** nhận `internal_scan_*` và **chặn** đặt `posted=true` khi chưa quét\|skip hợp lệ. |
| **Nghiệp vụ xử lý** | (1) **RETAIN** W2: scope · receivable for progressive flags · O4 MODE-UNCLASSIFIED · BOD · rejected/cancelled → 409 family `HRM-YCTD-*`. (2) **ADD** accept optional `internal_scan_done` / `internal_scan_skipped` / `internal_scan_skip_reason` — normalize exclusive + stamp `internal_scan_at` (delegate same rules as SCAN-02/03). (3) **NEW gate:** if patch sets `posted=true` (or truthy) **and** scan invariant false → **400** `HRM-REC-CV-SCAN-REQUIRED` · **do not** write `posted`. (4) Setting other flags still requires receivable (RETAIN). (5) **FORBIDDEN** Campaign / `job_postings` SoT · wipe scan or legacy keys. (6) Response always **display-ready** full `pipeline_flags` incl. scan keys (VAL-21). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-04** Thành công «sẵn sàng nhận hồ sơ ngoài» · **BR-BP-CV-01** · AC-REC-CV-04-06 · EX-01/14 · VAL-09/10/15 · peer FR-02 Thành công (RETAIN). |
| **Request → DB** | `{ posted?, has_cv?, interview_started?, cv_intake_allowed?, internal_scan_done?, internal_scan_skipped?, internal_scan_skip_reason? }` → `pipeline_flags_json`. |
| **Response** | `{ id, status, pipeline_flags }` · **`HRM-REC-200`**. |
| **Lỗi** | `HRM-REC-CV-SCAN-REQUIRED` · `HRM-REC-CV-SCAN-SKIP-REASON` · `HRM-REC-CV-SCAN-FORBIDDEN` · `HRM-YCTD-*` RETAIN · scope. |

**Paper alias:** `PATCH …/recruitment-requests/{id}/pipeline-flags`.

---

### 5.5 Peer RETAIN / OUT (must_keep)

| F-id | Path | Stamp |
|------|------|-------|
| **F-REC-UV-YCTD-03/04** | `POST /candidates` · applications | **RETAIN** — attach khớp; FR-04 **cites** only |
| **F-REC-UV-YCTD-01/02/05** | receivable picker · list | **RETAIN** |
| **F-REC-CMP-01/02** | `GET applications` · `GET compare` | **RETAIN** |
| **F-REC-YCTD-01..03** | requisitions CRUD/submit/transitions | **RETAIN** W2 |
| **F-JD-*** / F-YCTD-JD-* | job-templates | **RETAIN** REC-00 — **DENY reopen** without regression |
| **F-REC-CAMPAIGN-*** | — | **OUT / DENY** REC-03 |
| **F-REC-APP-*** paper | `/rec/candidates*` | **Alias only** |

---

## 6. Canonical DTOs (locked)

### 6.1 Pipeline flags (UPGRADE)

```ts
type PipelineFlagsDto = {
  // RETAIN (W2 — must_keep)
  posted: boolean;
  has_cv: boolean;
  interview_started: boolean;
  cv_intake_allowed: boolean;
  posted_at?: string | null;
  has_cv_at?: string | null;
  interview_started_at?: string | null;
  // ADD residual (O2 — JSON keys only; ba-data NOT REQUIRED)
  internal_scan_done: boolean;
  internal_scan_skipped: boolean;
  internal_scan_at: string | null;
  internal_scan_skip_reason: string | null;
};
// ↔ job_requisitions.pipeline_flags_json
// FORBIDDEN: open_for_hire boolean inside JSON diverging from status
// FORBIDDEN: wipe RETAIN keys when merging scan keys
```

**Defaults when key absent (parse):** all scan booleans `false`; `internal_scan_at` / `skip_reason` `null`.

### 6.2 Internal-scan body

```ts
type InternalScanDto = {
  action: 'complete' | 'skip';
  skip_reason?: string;           // required when action=skip
  hit_count?: number;             // optional UX audit
  criteria_snapshot?: {
    position_code?: string;
    skill?: string;
    experience?: string;
  };
};
```

### 6.3 Pool scan query (UPGRADE)

```ts
type CandidatesPoolScanQuery = {
  company_id: string;
  requisition_id?: string;        // YCTD context
  for?: 'internal_scan';
  position_code?: string;
  position?: string;
  q_position?: string;
  skill?: string;
  q_skill?: string;
  experience?: string;
  experience_min_years?: number;
  stage?: string;                 // RETAIN
};
```

### 6.4 YCTD get/list — display-ready

| Field | Source | Rule |
|-------|--------|------|
| `pipeline_flags` | `pipeline_flags_json` | Always include scan keys after parse (defaults false/null) |
| `status` | column | RETAIN receivable semantics |
| FE invent flags | — | **FAIL** VAL-21 — BE is SoT |

---

## 7. Error taxonomy (mint · BA/QA assert)

| Code | HTTP | When | UX intent (VI) |
|------|------|------|----------------|
| **`HRM-REC-CV-SCAN-REQUIRED`** | 400 | `posted=true` without done\|skip valid | Chưa quét / chưa skip — không đặt posted |
| **`HRM-REC-CV-SCAN-SKIP-REASON`** | 400 | Skip thiếu lý do | Nhập lý do bỏ qua |
| **`HRM-REC-CV-SCAN-FORBIDDEN`** | 403 | Skip không HR/TP hoặc thiếu quyền YCTD | Không đủ quyền bỏ qua |
| **`HRM-REC-CV-SCAN-YCTD`** | 400 | YCTD không receivable / không `open_for_hire` khi quét | YCTD chưa mở nhận hồ sơ |
| **`HRM-REC-CV-SCAN-ALREADY`** | 409/400 | Optional future re-scan block | (MVP default: **not** thrown) |
| `HRM-REC-UV-YCTD-*` | 4xx | Attach (**RETAIN**) | ≠ scan gate |
| `HRM-YCTD-*` | 4xx | Mode/BOD/flags W2 (**RETAIN**) | — |
| `HRM-REC-CMP-*` | 4xx | Compare (**RETAIN**) | — |
| Scope | 409/404 | Ngoài phạm vi | — |

---

## 8. Scope parity (U19)

| Surface | Resolver |
|---------|----------|
| `GET candidates-pool` / `GET candidates-pool/:id` | `resolveHrmListScope` + `pushCompanyIdFilter` |
| `POST …/internal-scan` | Same + `assertResourceInHrmScope` on YCTD |
| `PATCH …/pipeline-flags` | Same as W2 flags |
| `GET/PATCH requisitions` | Same as W2 |
| Attach `POST /candidates` | UV-YCTD RETAIN |

**Invariant CV-S-SCOPE:** list pool **=** get-by-id pool **=** scan **=** YCTD get **=** flags/internal-scan **=** attach.  
**FAIL** silent cross-tenant kho / YCTD.

---

## 9. ba-data — **NOT REQUIRED**

| Topic | Decision |
|-------|----------|
| O2 persist | ADD keys on existing **`pipeline_flags_json`** |
| New columns | **DENY** for this unlock |
| New scan event table | **HOLD** future append-only — **DENY** sole SoT |
| Skill/exp storage | Map LIVE fields / query (**Q-REC-CV-SKILL-FIELD**) — **DENY** mega-EAV SoT |

---

## 10. Client API_DESIGN DOC-DELTA (pointer)

Append to `API_DESIGN_HRM_ENTERPRISE.md` (client) when ba-docs wave runs — **this file is SoT for Dev unlock**:

| F-id | Physical | SRS bước |
|------|----------|----------|
| F-REC-CV-SCAN-01 | `GET …/candidates-pool` | FR-04 Diễn biến **#1** |
| F-REC-CV-SCAN-02 | `POST …/internal-scan` complete | FR-04 Diễn biến **#2** · 0-hits |
| F-REC-CV-SCAN-03 | `POST …/internal-scan` skip | FR-04 Diễn biến **#2** · skip |
| F-REC-YCTD-04 UPGRADE | `PATCH …/pipeline-flags` | FR-04 Thành công · BR-BP-CV-01 |

Paper F-REC-APP-* paths remain **alias**.

---

## 11. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | GWC REC-04 ≠ module REC UAT ≠ Phase1 DONE |
| must_keep | UV-YCTD ONE soft FK · CMP · open_for_hire · W2 flags family (extend) · W1 cell/spawn · W3 dashboard · W4 IV · W5 JD `REC00QC1-MSL0JMUT` · U19 · soft-delete |
| **DENY** | Nest `/rec` dual · second CV table · scan event sole SoT · REC-03 · seed · honesty flip · invent beyond BA/SRS · apps/** this seat · reopen REC-00 without regression · claim UV create / pool-list-alone = FR-04 DONE |

---

## 12. Dev unlock packet

### 12.1 Dev-BE (`PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01`)

1. Extend `PipelineFlags` / `parse` / `merge` / DTO with `internal_scan_*` defaults — **no wipe**.
2. **ADD** `POST …/requisitions/:id/internal-scan` (complete|skip) writing JSON keys only.
3. **UPGRADE** `PATCH …/pipeline-flags` — accept scan keys + **gate** `posted` → `HRM-REC-CV-SCAN-*`.
4. **UPGRADE** `GET candidates-pool` scan criteria + optional `requisition_id` / `for=internal_scan` receivable check.
5. YCTD list/get return display-ready scan flags.
6. U19 jest: list=get=scan=flags=attach; posted blocked; 0-hits done; skip reason/forbidden; regression W2 flags/UV-YCTD/JD.
7. **DENY** Nest `/rec` controller · second table · seed · honesty.

### 12.2 Dev-FE (`PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01`)

1. YCTD `open_for_hire` → bước Quét kho → criteria title+skill/exp → Network **physical** pool.
2. Attach via UV-YCTD RETAIN · Hoàn tất / Skip+reason → internal-scan or flags.
3. Block/disable posted until done|skip; toast VI on SCAN-REQUIRED.
4. F5 persists flags; **no** Campaign / REC-03; **no** Nest `/rec` SoT.

---

## 13. Validation plan (QA after Dev)

| Gate | PASS when |
|------|-----------|
| L0/L1 | Stack + scan endpoints 2xx/4xx codes |
| L2.5 | **J-HRM-REC-CV-04-01..04** browser U65 — no seed |
| Network | Path `/recruitment/` · mint codes on EX paths |
| Honesty | Flags remain false · C-SLICE |

---

## 14. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-api-01.md` |
| **Unlocks** | Execution residual Quét kho + posted gate |
| **Does not unlock** | Honesty flips · REC-03 · Nest `/rec` dual · module REC UAT · reopen REC-00 rewrite · ba-data |

---

## completion_report

- **Closed:** F.1 physical Option A CONFIRMED — F-REC-CV-SCAN-01..03 + F-REC-YCTD-04 UPGRADE; DTO `internal_scan_*` on `pipeline_flags_json`; mint `HRM-REC-CV-SCAN-*`; U19; paper `/rec` alias; ba-data NOT REQUIRED; DENY dual Nest/CV SoT/REC-03/scan-event-sole/seed/honesty/reopen REC-00.
- **Residual:** Dev-BE/FE implement · QA U65 J-HRM-REC-CV-04-* · QC GWC C-SLICE.
- **O2:** JSON keys only — **ba-data NOT REQUIRED**.
