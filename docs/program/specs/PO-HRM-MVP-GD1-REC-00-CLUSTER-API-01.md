# PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01 — API F.1 · Thư viện JD master (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-5 seat **#7**) |
| **lane** | governance · sa |
| **change_mode** | **UPGRADE / ADD** DOC-DELTA residual · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · unlock **dev-be** + **dev-fe** |
| **uc_ids** | `UC-BP-REC-00` *(00a/00b/00c CFG peers RETAIN — **no** redefine)* |
| **depends_on** | DATA-01 **CONFIRMED** · BA-01 O1–O7 **CONFIRMED** · SA-01 Option **A LOCKED** |
| **ref_data** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md) §4–§7 |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md) · AC-REC-JD-00-* · VAL-REC-JD-* |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md) Option A |
| **ref_yctd** | [`PO-HRM-JD-YCTD-REF-API-01.md`](./PO-HRM-JD-YCTD-REF-API-01.md) · F-YCTD-JD-* **RETAIN** |
| **ref_jd_dyn** | [`PO-HRM-JD-DYNAMIC-ARCH-02.md`](./PO-HRM-JD-DYNAMIC-ARCH-02.md) §3.4 · `validateSnapshotAndValues` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-00** Diễn biến **#1–#3** · **BR-BP-JD-01** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-JD-01** = **logical alias only** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ba-data** | **NOT REQUIRED** (unlock gate) — DATA-01 already CONFIRMED |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base path | **`/api/hrm/recruitment/job-templates*`** (Nest `@Controller('recruitment')`) |
| Paper path | `/api/hrm/rec/job-descriptions*` (**F-REC-JD-01**) = **logical alias only** — **DENY** Nest dual SoT |
| SoT table | **`public.job_description_templates` ONLY** — **DENY** second JD table · **DENY** `job_postings` as master |
| Status DTO | **ADD** display-ready **`status`** `draft` \| `active` \| `retired` + **`is_active` bridge** (DATA-01 BR-JD-BRIDGE-*) |
| Create default | **`status=draft`** ∧ **`is_active=false`** — **FORBIDDEN** auto-Hiệu lực (**P04**) |
| Publish | **ADD** Nháp→Hiệu lực transition + required-on-layout gate · mint **`HRM-REC-JD-PUB-*`** / reuse **`HRM-JD-*`** |
| Bindable | Prefer **`status='active'` ∧ `is_active=true`** · **RETAIN** `HRM-JD-YCTD-STATUS` |
| Code UQ | **RETAIN** `(company_id, code)` · **409** `HRM-JD-CODE-DUP` (**O4**) |
| Soft-retire | DELETE / retire → **`retired`** + `is_active=false` — **FORBIDDEN** hard DELETE |
| Reactivate | `retired`→`active` **HOLD** MVP (**Q-REC-JD-REACTIVE**) → **`HRM-REC-JD-REACTIVATE-HOLD`** |
| U19 | list **=** get-by-id **=** create/patch/publish/retire **=** bindable — **same** `resolveHrmListScope` |
| F-YCTD-JD / `rec_jd_*` | **RETAIN** must_keep — **cấm** reopen rewrite |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen W1–W4 |
| Unlock | **dev-be** + **dev-fe** (rule 26 split) after this CONFIRMED |

```text
  FE «Thư viện mô tả công việc» (Nháp / Hiệu lực / Ngừng)
        │  Network assert path contains /recruitment/job-templates
        ▼
  GET    /api/hrm/recruitment/job-templates              (F-JD-01 UPGRADE + status)
  POST   /api/hrm/recruitment/job-templates              (F-JD-02 UPGRADE create=draft)
  GET    /api/hrm/recruitment/job-templates/:id          (F-JD-03 RETAIN + status)
  PATCH  /api/hrm/recruitment/job-templates/:id          (F-JD-04 content)
  POST   /api/hrm/recruitment/job-templates/:id/publish  (F-JD-04 ADD publish)
  DELETE /api/hrm/recruitment/job-templates/:id          (F-JD-04 soft-retire → retired)
        │  paper /api/hrm/rec/job-descriptions* = alias only
        ▼
  public.job_description_templates
       status draft|active|retired  ↔  is_active bridge (DATA-01)
       code UQ (company_id, code) · values_json · layout_snapshot_json
                │
                │ soft FK (no CASCADE)
                ▼
  job_requisitions.job_template_id  · F-YCTD-JD-* RETAIN
       bindable=true|for=yctd → status=active only
```

**Envelope RETAIN:** `{ code, message, data }` · success **`HRM-REC-JD-200`** / **`HRM-REC-JD-201`** · domain errors below.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE code | Gap vs F.1 residual |
|---------|-----------|---------------------|
| `GET …/job-templates` | `listJobDescriptionTemplates` · `resolveHrmListScope` · bindable → `is_active=TRUE` | **UPGRADE** SELECT/return **`status`**; library filter `?status=`/`?active=`; bindable prefer **`status='active' AND is_active=TRUE`**; bindable item DTO `status` ∈ draft\|active\|retired (**not** `inactive`) |
| `GET …/job-templates/:id` | F-JD-03 + `sections` display-ready | **UPGRADE** response **`status`** + bridge; preview=yctd **RETAIN** STATUS gate → assert `status=active` |
| `POST …/job-templates` | INSERT `is_active = payload.is_active !== false` → **often true** | **UPGRADE** force **`draft`/`false`**; ignore client `is_active=true` / `status=active` on create (**P04**) |
| `PATCH …/job-templates/:id` | content + optional `is_active` boolean | **UPGRADE** bridge writes; **DENY** boolean-only status SoT; content edit rules by state |
| Publish Nháp→Hiệu lực | **ABSENT** dedicated | **ADD** `POST …/:id/publish` (primary) · optional PATCH synonym |
| `DELETE …/job-templates/:id` | soft `is_active=FALSE` only | **UPGRADE** set **`status=retired`** + `is_active=false` |
| ensureSchema | no `status` column | Dev-BE implements DATA-01 migrate (**not** this DOC) |
| `yctd-jd-bind.ts` | `isYctdJdBindable` = `is_active===true` | **UPGRADE** `status==='active' && is_active===true` (bridge dual-assert) |
| Nest `/rec/job-descriptions` | Paper only | **Alias only — DENY** controller SoT |
| `job_postings` | Lane B leftover | **DENY** dual-write master |

**FORBIDDEN invent this seat:** Nest `/rec` dual · second JD table · boolean-only MVP · seed · honesty flip · reopen W1–W4 · redefine F-YCTD-JD contracts.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/job-templates` · `…/:templateId` · `…/:templateId/publish` |
| **LOGICAL (paper F-REC-JD-01)** | `/api/hrm/rec/job-descriptions*` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/recruitment/job-templates` — **FAIL O1** if FE mutates Nest `/rec/job-descriptions` as SoT |

| Paper field | Physical DTO | DB column | Rule |
|-------------|--------------|-----------|------|
| `job_description_id` | `id` / `job_template_id` (YCTD alias) | `job_description_templates.id` | Soft target RETAIN |
| `status` draft\|active\|retired | **`status`** (canonical) | **`status`** (DATA-01 ADD) | Display-ready — **FAIL** boolean-only UI (**EX-12**) |
| (bridge) | **`is_active`** | **`is_active`** | Slave to `status` — always co-written |
| `code` / `title` / position | same | same | RETAIN · `HRM-REC-JD-POS` |
| `values` / layout | `values_json` / `layout_snapshot_json` | JSONB | RETAIN JD-DYNAMIC |
| YCTD `job_description_id` | `job_template_id` | `job_requisitions.job_template_id` | Alias normalize RETAIN |

---

## 4. Status & bridge dictionary (O2 — normative)

| UI (VI) | API `status` | `is_active` | Bindable YCTD mới? | Library chip |
|---------|--------------|-------------|--------------------|--------------|
| **Nháp** | `draft` | `false` | **No** | Default create |
| **Hiệu lực** | `active` | `true` | **Yes** | After publish PASS |
| **Ngừng** | `retired` | `false` | **No** (`HRM-JD-YCTD-STATUS`) | Soft-retire |

| Rule ID | Predicate | On violate |
|---------|-----------|------------|
| **BR-JD-BRIDGE-01** | `status=active` ⇒ `is_active=true` | Reject write · **400** `HRM-REC-JD-BRIDGE` |
| **BR-JD-BRIDGE-02** | `status∈{draft,retired}` ⇒ `is_active=false` | Same |
| **BR-JD-BRIDGE-03** | Mutate sets **both** in one transaction | Partial = **FAIL** |
| **BR-JD-BINDABLE-01** | Bindable = `status=active` ∧ `is_active=true` ∧ in scope | Exclude from picker |

**Client query synonyms (list):**

| Query | Maps to filter |
|-------|----------------|
| `status=draft\|active\|retired` | Exact `status` |
| `active=true\|1\|yes\|active` | Prefer `status='active'` (legacy synonym) |
| `active=false\|0\|draft\|inactive` | **Not** bindable set — prefer `status IN ('draft','retired')` **or** explicit `status=` (FE should prefer `status=`) |
| `bindable=true` \| `for=yctd` | **`status='active' AND is_active=TRUE`** |

**DENY:** Response that only exposes `is_active` without `status` after this wave (**boolean-only MVP REJECTED**).

---

## 5. Lifecycle transitions (O3 / P03 / HOLD)

| From → To | API | Gate | Forbidden |
|-----------|-----|------|-----------|
| (create) → `draft` | `POST …/job-templates` | Always | Auto-`active` without publish |
| `draft` → `active` | **`POST …/:id/publish`** | Required-on-layout PASS | 2xx while missing required |
| `draft` → `retired` | DELETE or PATCH retire | Soft OK | Hard DELETE |
| `active` → `retired` | DELETE / retire | Soft · YCTD FK intact | CASCADE / NULL FK |
| `active` → `draft` | **DENY** MVP | — | Unpublish silent |
| `retired` → `active` | **HOLD** | **`HRM-REC-JD-REACTIVATE-HOLD` 409** | Silent reactivate |
| Any → hard DELETE | **FORBIDDEN** | — | Physical DELETE row |

---

## 6. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** list / get / create / patch / publish / retire / bindable = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` + `resolveHrmPersistCompanyIdText` (**U19** `scope_parity`).

---

### 6.1 F-JD-01 — List thư viện JD (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/job-templates` |
| **Mục đích** | Liệt kê thư viện mô tả công việc theo phạm vi pháp nhân; hỗ trợ filter Nháp/Hiệu lực/Ngừng; chế độ picker YCTD chỉ Hiệu lực. |
| **Nghiệp vụ xử lý** | (1) JWT + `company_id` → `resolveHrmListScope`. (2) Optional `q` search code/title/position. (3) If `bindable`/`for=yctd` → filter **`status='active' AND is_active=TRUE`**; thin picker DTO (**no** full `values_json` canvas). (4) Else apply `status` / legacy `active` synonym §4. (5) Return **display-ready** `status` + `is_active` on every row. (6) Empty library → **200** `{ total:0, data:[] }` — **not** 404. (7) Group CEO `main` rollup read per membership — **no** write-all. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#1** · AC-REC-JD-00-01 · ALT-01/03 · EX-01 · VAL-REC-JD-09/12/15 · **O1/O2/O5**. |
| **Request** | Query: `company_id` (required); `q?`; `status?`; `active?` (legacy); `bindable?`; `for?`. |
| **Response → DB** | `data[]` ← `job_description_templates` (+ optional `has_dynamic_values`); bindable → `toYctdBindableListItem` **UPGRADE** `status` ∈ {draft,active,retired}. |
| **Lỗi** | Scope 409/404 · empty **200** hợp lệ. Success code **`HRM-REC-JD-200`**. |

**Paper alias:** `GET /api/hrm/rec/job-descriptions` → physical list.

**F-YCTD-JD-01 RETAIN:** bindable list contract unchanged except status predicate upgrade — **cấm** reopen soft-FK / empty-[] semantics.

---

### 6.2 F-JD-02 — Create JD Nháp (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/job-templates` |
| **Mục đích** | Tạo bản mô tả công việc mới ở trạng thái **Nháp** theo bố cục hiệu lực (title-first + catalog position). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmPersistCompanyIdText`. (2) Require `code` + `title`; `position_code` ∈ job_titles EFF else **`HRM-REC-JD-POS`**. (3) Code UQ case-insensitive `(company_id, code)` → **409 `HRM-JD-CODE-DUP`**. (4) Materialize/validate layout snapshot + values via JdDynamic when present (**save-as-draft** may allow incomplete required — **publish** enforces O3). (5) **INSERT** `status='draft'`, `is_active=false` — **ignore** body `is_active=true` / `status=active`. (6) Persist bridge flat columns + `values_json` / `layout_snapshot_json`. (7) **FORBIDDEN** dual-write `job_postings`. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#2** (Lưu Nháp) · AC-REC-JD-00-02 · **P04** · VAL-REC-JD-02/06/08 · **O2/O4**. |
| **Request → DB** | Body → columns §7; force draft bridge. |
| **Response** | Row DTO with `status:'draft'`, `is_active:false` · code **`HRM-REC-JD-201`**. |
| **Lỗi** | `HRM-REC-JD-400` · `HRM-REC-JD-POS` · `HRM-JD-CODE-DUP` 409 · `HRM-JD-LAYOUT-EMPTY` / `HRM-JD-VAL-*` when snapshot posted invalid · scope. |

**Paper alias:** `POST /api/hrm/rec/job-descriptions`.

---

### 6.3 F-JD-03 — Get by id (**RETAIN + UPGRADE status**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/job-templates/:templateId` |
| **Mục đích** | Deep link / F5 form chi tiết — display-ready `sections` (OS 28) + trạng thái Nháp/Hiệu lực/Ngừng; preview YCTD mỏng khi `preview=yctd`. |
| **Nghiệp vụ xử lý** | (1) Load by UUID + **same** `pushCompanyIdFilter` as list (**U19**). (2) Missing/out-of-scope → **`HRM-REC-JD-404`** / **`HRM-REC-JD-409`**. (3) Build `sections` from `layout_snapshot_json` × `values_json` (JdDynamic). (4) Return **`status`** + **`is_active`**. (5) If `preview=yctd` → thin preview + **`assertYctdJdBindableOrThrow`** (STATUS if not Hiệu lực) — **F-YCTD-JD-02 RETAIN**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#1/#2** · AC-REC-JD-00-ALT-04 · EX-01 · VAL-REC-JD-15 · YCTD Diễn biến 1c/1d. |
| **Request** | Path `templateId` · query `company_id` · `preview?`. |
| **Response → DB** | Full row + `sections` + aliases `values`/`layout_snapshot`. |
| **Lỗi** | `HRM-REC-JD-404` · `HRM-REC-JD-409` · preview non-active → **`HRM-JD-YCTD-STATUS`**. |

**Paper alias:** `GET /api/hrm/rec/job-descriptions/{id}`.

---

### 6.4 F-JD-04 — Patch / Publish / Retire (**UPGRADE + ADD**)

#### 6.4.1 PATCH content

| | |
|--|--|
| **METHOD / path** | `PATCH /api/hrm/recruitment/job-templates/:templateId` |
| **Mục đích** | Cập nhật nội dung / values / layout khi còn chỉnh sửa được; giữ bridge status↔is_active. |
| **Nghiệp vụ xử lý** | (1) Scope assert identical list. (2) Code change → UQ check → **409 `HRM-JD-CODE-DUP`**. (3) `position_code` catalog assert. (4) Validate snapshot/values when posted. (5) **Content edit:** `draft` = full; `active` = content OK **without** auto unpublish (status stays `active` unless retire/publish endpoints); `retired` = **DENY** content mutate → **`HRM-REC-JD-RETIRED-LOCKED` 409** (or allow notes-only — default **DENY** body fields except explicit reopen HOLD). (6) Body `is_active` / `status` **alone** **cannot** publish — must use publish endpoint (**O3**). (7) Bridge CHK on every write. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#2** · AC-REC-JD-00-02 · P05 · VAL-REC-JD-08. |
| **Response** | Updated row · **`HRM-REC-JD-200`**. |
| **Lỗi** | `HRM-JD-CODE-DUP` · `HRM-REC-JD-POS` · `HRM-REC-JD-404/409` · `HRM-REC-JD-BRIDGE` · `HRM-REC-JD-RETIRED-LOCKED`. |

#### 6.4.2 Publish Nháp → Hiệu lực (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/job-templates/:templateId/publish`** (**primary**) |
| **Optional synonym** | `PATCH …/:templateId` with `{ "action":"publish" }` or `{ "status":"active" }` **only if** same service method — FE preferred primary path = **POST …/publish** |
| **Mục đích** | Chuyển bản **Nháp** sang **Hiệu lực** khi đủ trường bắt buộc trên bố cục hiệu lực (00a required ∩ 00b layout). |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Row must be **`status=draft`** — else **`HRM-REC-JD-PUB-STATE` 409**. (3) Require non-empty effective `layout_snapshot_json.groups` — else **`HRM-REC-JD-PUB-LAYOUT-EMPTY` 400** (may wrap/`alias` `HRM-JD-LAYOUT-EMPTY`). (4) Run required-on-layout check = intersection of layout `is_required` fields ∩ `values_json` (reuse `validateSnapshotAndValues` required loop) — missing → **`HRM-REC-JD-PUB-REQUIRED` 400** with `missing_keys[]` (+ optional VI labels) — toast FE. (5) On PASS: set **`status='active'`**, **`is_active=true`** same transaction. (6) **Do not** 2xx if still draft. (7) Retired → active = **HOLD** → **`HRM-REC-JD-REACTIVATE-HOLD`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#2** (Phát hành) · AC-REC-JD-00-03 · **P01/P02** · BR-REC-JD-PUB · VAL-REC-JD-05/08 · **O3**. |
| **Request → DB** | Empty body or `{ comment? }` · UPDATE status+is_active. |
| **Response** | Row `status:'active'`, `is_active:true` · **`HRM-REC-JD-200`** (or **`HRM-REC-JD-PUB-200`** synonym OK). |
| **Lỗi** | See §8 publish mint · scope · 404. |

#### 6.4.3 Soft-retire Hiệu lực/Nháp → Ngừng

| | |
|--|--|
| **METHOD / path** | `DELETE /api/hrm/recruitment/job-templates/:templateId` (**RETAIN path · UPGRADE semantics**) · optional `POST …/:id/retire` alias |
| **Mục đích** | Ngừng dùng JD trong picker mới; giữ lịch sử YCTD soft FK. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) Set **`status='retired'`**, **`is_active=false`**. (3) **No** CASCADE on `job_requisitions`. (4) Bindable list excludes row; history YCTD still resolves title/code. (5) Hard DELETE **FORBIDDEN**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-00** Diễn biến **#3** / BR-BP-JD-01 · AC-REC-JD-00-05 · **P03** · VAL-REC-JD-11 · **O5**. |
| **Response** | `{ id, status:'retired', is_active:false }` · **`HRM-REC-JD-200`**. |
| **Lỗi** | `HRM-REC-JD-404` · scope. |

**Paper alias:** `PATCH/POST/DELETE /api/hrm/rec/job-descriptions/{id}` → physical F-JD-04.

---

### 6.5 F-YCTD-JD-* — Bind / preview (**RETAIN + dual-assert**)

| ID | Path (RETAIN) | Change this wave |
|----|---------------|------------------|
| F-YCTD-JD-01 | `GET …/job-templates?bindable=true\|for=yctd` | Filter prefer **`status='active'`** |
| F-YCTD-JD-02 | `GET …/job-templates/:id?preview=yctd` | Gate on `status=active` ∧ bridge |
| F-YCTD-JD-03..05 | YCTD create/patch bind soft FK | **RETAIN** codes `HRM-JD-YCTD-*` · **cấm** rewrite seat |

`isYctdJdBindable(row)` **UPGRADE:**

```text
return row.status === 'active' && row.is_active === true;
```

During migrate dual-assert period: if `status` null (pre-backfill) fall back `is_active===true` **only** until DATA-01 backfill NOT NULL — Dev must complete migrate before U65 claim.

---

## 7. DTO ↔ column map (display-ready)

| API field | DB | Notes |
|-----------|-----|-------|
| `id` | `id` | UUID |
| `company_id` | `company_id` | Persist/list scope |
| `code` | `code` | UQ with company |
| `title` | `title` | Title-first |
| `position_code` / `position_name` | same | Catalog SoT |
| `job_description` / `requirements` / `notes` | same | Flat bridge |
| **`status`** | **`status`** | **ADD** display-ready |
| **`is_active`** | **`is_active`** | Bridge slave |
| `values` / `values_json` | `values_json` | Dynamic |
| `layout_snapshot` / `layout_snapshot_json` | `layout_snapshot_json` | Q6 |
| `layout_version` | `layout_version` | int |
| `sections` | computed | GET by id only — FE **must not** join |
| `has_dynamic_values` | computed | List hint |
| `created_at` / `updated_at` | same | — |

**Publish error detail (normative):**

```json
{
  "code": "HRM-REC-JD-PUB-REQUIRED",
  "message": "Required fields missing for publish",
  "data": { "missing_keys": ["title", "responsibilities"], "status": "draft" }
}
```

---

## 8. Error taxonomy (mint / RETAIN)

| Code | HTTP | When | Maps |
|------|------|------|------|
| **`HRM-REC-JD-200` / `201`** | 2xx | List/get/patch/publish/retire / create | Envelope RETAIN |
| **`HRM-REC-JD-400`** | 400 | Generic validation | Create/patch |
| **`HRM-REC-JD-404`** | 404 | Not in scope / missing | U19 |
| **`HRM-REC-JD-409`** | 409 | Scope mismatch | U19 |
| **`HRM-REC-JD-POS`** | 400 | Invent position_code | RETAIN |
| **`HRM-JD-CODE-DUP`** | **409** | UQ `(company_id,code)` | **O4** · P05 |
| **`HRM-JD-YCTD-STATUS`** | 400 | Bind/preview non-Hiệu lực | **O5 RETAIN** |
| **`HRM-JD-YCTD-REQUIRED` / `NOT-FOUND` / `ALIAS` / `REBIND-LOCKED`** | 4xx | YCTD-REF | **RETAIN** |
| **`HRM-JD-LAYOUT-EMPTY`** | 400 | Snapshot groups empty (save path) | RETAIN JdDynamic |
| **`HRM-JD-VAL-REQUIRED`** | 400 | Required empty on **validated save** | RETAIN |
| **`HRM-REC-JD-PUB-REQUIRED`** | **400** | Publish missing required-on-layout | **O3 MINT** · P01 |
| **`HRM-REC-JD-PUB-LAYOUT-EMPTY`** | **400** | Publish without effective layout | **O3 MINT** · P02 |
| **`HRM-REC-JD-PUB-STATE`** | **409** | Publish when not `draft` | **O3 MINT** |
| **`HRM-REC-JD-BRIDGE`** | **400** | status↔is_active drift attempt | VAL-08 |
| **`HRM-REC-JD-RETIRED-LOCKED`** | **409** | Mutate content on retired | P03 |
| **`HRM-REC-JD-REACTIVATE-HOLD`** | **409** | retired→active MVP HOLD | Q-REC-JD-REACTIVE |

**Toast mapping (FE):** PUB-* → VI «Thiếu trường bắt buộc…»; CODE-DUP → «Mã JD trùng»; YCTD-STATUS → «Chỉ chọn JD Hiệu lực».

---

## 9. ba-data gate

| Question | Answer |
|----------|--------|
| Need new ba-data seat? | **NOT REQUIRED** |
| Why | DATA-01 already CONFIRMED ADD `status` + CHK + bridge + backfill |
| Dev-BE | Implements DATA-01 ensureSchema/migrate **inside** BE-01 (same wave) — not a separate governance DATA seat |

---

## 10. U19 scope_parity checklist

| Surface | Resolver |
|---------|----------|
| List F-JD-01 | `resolveHrmListScope` + `pushCompanyIdFilter` |
| Get F-JD-03 | **Identical** company filter + `assertResourceInHrmScope` |
| Create F-JD-02 | `resolveHrmPersistCompanyIdText` |
| Patch / publish / retire | Same assert as get |
| Bindable list | Same scope as library list |
| YCTD bind | Soft FK resolve in requisition scope RETAIN |

**FAIL:** get-by-id 404 while list includes row · mutate other company · bindable leak cross-tenant.

---

## 11. Traceability — requirement → API → FE → Test

| Requirement | API (this DOC) | FE / Journey | Test |
|-------------|----------------|--------------|------|
| FR-00 #1 | F-JD-01 | Thư viện chips | J-HRM-REC-JD-00-01 · AC-01 |
| FR-00 #2 Lưu | F-JD-02/04 PATCH | Form Nháp | AC-02 · P04 |
| FR-00 #2 Phát hành | F-JD-04 publish | Nút Phát hành | AC-03 · P01/P02 |
| FR-00 #3 / BR-01 | F-YCTD-JD RETAIN | YCTD picker | AC-04/05 · **J-HRM-JD-YCTD-01** |
| O1 path | Physical job-templates | Network | EX-02 |
| O2 status | DTO `status` | Chips VI | EX-12 boolean-only FAIL |
| O3 publish | PUB-* mint | Toast | P01/P02 |
| O4 code | 409 CODE-DUP | Toast | P05 |
| O5 YCTD | STATUS gate | Picker | EX-05 |
| U19 | §10 | Persona | EX-01 · ALT-02 |

---

## 12. Honesty & DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | API CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W4 | REC-01/02/08/06a seals |
| must_keep | Soft FK · F-YCTD-JD · DV-YCTD-JD · `rec_jd_*` · code UQ · U19 · soft-retire |
| **DENY** | Nest `/rec` dual SoT · second JD table · `job_postings` SoT · seed · honesty flip · reopen W1–W4 · `apps/**` this seat · **boolean-only MVP** |

---

## 13. NFR pointer

Existing HRM Nest under `@xevn/platform-core` — **no** new service bootstrap. RLS unchanged. Observability baseline RETAIN (`docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md`).

---

## 14. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** then/with **dev-fe** (parallel OK after BE contract start) |
| **Does not unlock** | Honesty flips · REC-03 · Nest dual · module UAT claim |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-api-01.md` |

### Assumptions

- DATA-01 status column + bridge CONFIRMED before Dev migrate.
- JdDynamic `validateSnapshotAndValues` required loop is the SoT for O3 field set.
- Create-as-draft allows incomplete required; publish is the hard gate.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-JD-REACTIVE | retired→active DENY MVP via `HRM-REC-JD-REACTIVATE-HOLD` |
| PATCH synonym publish | Optional; primary = `POST …/publish` |
| Client DOC-DELTA | Optional pointer F-REC-JD-01 alias — not blocking Dev |

---

## completion_report

- **Closed:** DOC-DELTA API F.1 CONFIRMED on physical `/api/hrm/recruitment/job-templates*` — F-JD-01..04 with display-ready `status`+`is_active` bridge; ADD publish + PUB-* mint; bindable prefer `status=active`; code UQ 409; U19; paper F-REC-JD-01 alias only; DENY Nest dual · second SoT · postings · seed · honesty · boolean-only · apps/**.
- **Residual:** Dev-BE migrate+status/publish/bindable · Dev-FE library chips + Phát hành + Network path · QA U65 AC-REC-JD-00-*.
- **O2/O3 stamp:** 3-state DTO + publish gate **LOCKED** — boolean-only **REJECTED**.
