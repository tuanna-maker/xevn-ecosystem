# PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01 — API_DESIGN F.1 · REC catalog (Option B roll-out)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **resume_chunk** | K6.2 (`PO_HRM_RESUME_PLAN_20260807.md` §K6) |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-REC-CAT-STG-* · **EXPAND** F-REC-APP-02 consumer validate · **DOC-DELTA** client API/DB · **NO CODE** `apps/**` · **no seed** · **no wipe** JD DnD / IV one-active / hire→EMP / YCTD spines |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** roll to REC vertical (pipeline stages open catalog) · cite F-PLT-TOK / ATT-VERTICAL / CTR CORR pattern |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1–L7 · §7 REC row |
| **ref_jd** | [`PO-HRM-JD-DYNAMIC-ARCH-01.md`](./PO-HRM-JD-DYNAMIC-ARCH-01.md) Option A FormSchema (**must_keep** adapter — **not** re-physicalize this seat) |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) F-PLT-TOK F.1 · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) pattern mirror · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `ICatalogRow` · R-PLT-DATA-04 |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.2 REC · BR-PLT-02/04/05/06 · **AC-PLT-REC-01** (JD) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-REC-05** (stage ∈ danh mục đơn vị) · **05a** · **06** · **06a** · **06b** · **07** hire · REC-03 **OUT** |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.5 `rec_candidate_application.stage` · §2.6 history · **no** `rec_pipeline_stage` physical yet |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-REC-APP-02** · **F-REC-HIRE-01** (must_keep) |
| **ref_spine** | [`PO-HRM-REC-IV-ONE-ACTIVE-SA-01`](./PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md) · [`PO-HRM-REC-UV-YCTD-API-01`](./PO-HRM-REC-UV-YCTD-API-01.md) · hire→CORE E2E PAY-HIRE / EMP link |
| **Honesty** | No REC module UAT flip · no Phase1 DONE · `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · U65 |
| **must_keep** | JD DnD / `rec_jd_*` · interview one-active · hire→EMP · YCTD↔JD · REC-03 OUT · soft-delete · scope_parity U19 |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective & locks

Roll **Platform Option B** to **REC vertical GĐ1 Catalog**: **pipeline stages** as open `ICatalogRow` — same F.1 depth as **F-PLT-TOK** (CTR) and **F-ATT-CAT-LVT-*** (ATT). **Unlock ba-data physical** — **no** `apps/**` here.

| Lock | Rule |
|------|------|
| **L-REC-CAT-01 Open stages** | `stage_key` = **open catalog** per company — starter keys (`screening`, `interview`, `offer`, `hired`, `rejected`, `withdrawn`) = **bootstrap examples only** — **not** closed enum (**BR-PLT-05** · DYNAMIC-LOCK / CORR class). **FORBIDDEN** `CHECK (stage IN (...))` ceiling on catalog **or** on consumer after catalog >0 |
| **L-REC-CAT-02 Dual SoT clarity** | **HRM tenant writer** = `rec_pipeline_stage` — **SoT** for picker + validate. **XBOS WF task-type codes** (`rec_screening` / `rec_interview` / … in Nest bridge) = **ops map** → stage_key — **≠** second catalog master (**BR-PLT-06** class). **No** XBOS `settings-catalogs` partition required GĐ1 for stages (unlike ATT `leave_types` REF). If group later publishes stages REF → same ATT pattern: merge read, **tenant row wins** on key collision |
| **L-REC-CAT-03 JD ≠ stages** | **JD field catalog + layout DnD** = FormSchema vertical #2 (**ARCH-01 Option A** · **AC-PLT-REC-01**) — **adapter already** in DATA-01 — **FORBIDDEN** wipe / migrate into MergeToken / re-open JD physical this seat |
| **L-REC-CAT-04 System outcomes** | Typed flags on catalog row: `is_hired_outcome`, `is_reject_outcome`, `is_terminal`, `allows_interview_schedule` — hire spine (**F-REC-HIRE-01**) and IV one-active remain **code-deterministic** via flags — **not** FE hardcode of 6 strings |
| **L-REC-CAT-05 Consumer SoT** | When effective stage catalog **>0**: **F-REC-APP-02** `to_stage` **must** ∈ catalog (**BR-PLT-02**) — free-text stage **4xx**; history append-only **must_keep** |
| **L-REC-CAT-06 Soft-delete** | Retire = `status=retired` + `archived_at` — history FK / past `application.stage` values intact (**BR-PLT-04**) — **FORBIDDEN** hard-delete |
| **L-REC-CAT-07 Scope** | list ↔ get-by-id ↔ mutate = `resolveHrmListScope` + `assertResourceInHrmScope` (**U19**) |
| **L-REC-CAT-08 Interview lifecycle** | Interview schedule status (one-active) **≠** pipeline stage catalog — **must_keep** [`PO-HRM-REC-IV-ONE-ACTIVE-SA-01`](./PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md) |
| **L-REC-CAT-09 YCTD flags** | YCTD `pipeline_flags_json` (posted / has_cv / …) = **requisition progress flags** — **≠** application stage catalog — **no merge** |
| **L-REC-CAT-10 Honesty** | REC-03 campaign / `job_postings` dual-write = **OUT** · mail template MergeToken GĐ2 residual |
| **Paths (Nest physical GĐ1)** | **ADD** `/api/hrm/recruitment/pipeline-stages*` (alias `/api/hrm/rec/pipeline-stages*` OK) |

**Envelope:** `{ code, message, data }`  
**Auth:** HRM JWT / membership — same recruitment peers.

---

## 1. Platform → REC binding (`ICatalogRow`)

| Logical (`ICatalogRow`) | Physical GĐ1 | `catalog_kind` | Notes |
|-------------------------|--------------|----------------|-------|
| `code` | `stage_key` | `rec_pipeline_stage` | Stable slug; UQ active per company |
| `label_vi` | `name_vi` | | display-ready (kanban / picker / badge) |
| `status` | `status` + `archived_at` | | active \| retired |
| `scope_company_id` | `company_id` TEXT | | JWT operating slug |
| `meta` | typed flags + `sort_order` + optional `wf_task_type_key` | | **not** free JSON SoT for hire/reject |
| JD field row | `rec_jd_field_def` | `rec_jd_field` | **Adapter only** — DATA-01 · **out of mutate scope** this seat |

**FORBIDDEN GĐ1:** Mega `hrm_catalog_rows` EAV for REC stages (ADR Q-PLT-03). **FORBIDDEN:** closed `CHECK IN` on starter six. **FORBIDDEN:** invent REC-03 / `job_postings` as stage SoT.

```text
  Settings REC CFG ──► rec_pipeline_stage CRUD (tenant writer = SoT)
                           │
                           ▼
              F-REC-APP-02 transition · list badge · kanban columns
                           │
              F-REC-HIRE-01 ── requires is_hired_outcome / offer gate (must_keep)
                           │
  XBOS WF task codes ──► ops map → stage_key (optional wf_task_type_key)
                           │
  rec_jd_* FormSchema ──► SEPARATE vertical (must_keep DnD) — not this table
```

---

## 2. Physical DATA pointer (ba-data unlock — **not covered yet**)

> **Unlock:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` — **ADD** `public.rec_pipeline_stage`.  
> DATA-01 platform wave only noted **JD adapter** — **stages physical = this cascade** (closes R-PLT-DATA-04 REC slice).  
> AS-IS `rec_candidate_application.stage` stays **text** storing `stage_key` — **EXPAND** DOC note: after catalog >0, values **must** resolve to active/retired catalog (history may hold retired keys).

### 2.1 `rec_pipeline_stage` (ADD physical)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | uuid | PK | |
| `company_id` | text | NO | Scope slug |
| `stage_key` | text | NO | Open catalog code — format `^[a-z][a-z0-9_]*$` |
| `name_vi` | text | NO | UI label |
| `sort_order` | int | NO | Kanban / picker order — default 100 |
| `is_terminal` | boolean | NO | Terminal lane (hide from “advance” defaults) |
| `is_hired_outcome` | boolean | NO | At most **one** active hired-outcome per company (UQ partial) — F-REC-HIRE-01 target key |
| `is_reject_outcome` | boolean | NO | Reject / fail CV class |
| `allows_interview_schedule` | boolean | NO | Default true for interview-like; gate IV schedule soft warn |
| `wf_task_type_key` | text | YES | Optional map XBOS WF (`rec_screening`…) — **ops**, not second SoT |
| `color_token` | text | YES | Optional UI chip — Precision Motion token name, not invent brand |
| `metadata_json` | jsonb | YES | Optional — **not** replace typed flags |
| `status` | text | NO | active \| retired |
| `archived_at` | timestamptz | YES | soft-delete |
| `created_at`, `updated_at` | timestamptz | NO | audit |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(company_id, lower(stage_key))` WHERE `archived_at IS NULL` |
| **UQ hired outcome** | At most one `(company_id)` WHERE `is_hired_outcome=true AND archived_at IS NULL` |
| **CHK format** | slug only — **FORBIDDEN** enum ceiling CHECK of starter six |
| **CHK flags** | `is_hired_outcome` ⇒ `is_terminal=true`; cannot be both hired + reject outcome |
| **Starter rows** | Optional ensure upsert blueprint six — **not** UF evidence (U65) |

### 2.2 Consumer columns (EXPAND note — no rename)

| Table | Column | Rule after catalog live |
|-------|--------|-------------------------|
| `rec_candidate_application` | `stage` | Stores `stage_key`; validate ∈ effective on mutate |
| `rec_candidate_stage_history` | `from_stage` / `to_stage` | Append-only; may reference retired keys |
| Pool/candidate AS-IS `stage` | if present | Align same key space — **no** dual enum |

### 2.3 Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| `rec_jd_field_def` / layout | JD-DYNAMIC-DATA / ARCH — **must_keep** |
| Interview schedule tables | REC-IV-ONE-ACTIVE |
| `rec_interview_eval_template` | REC-06 — separate catalog later P2 |
| Mail templates MergeToken | GĐ2 |

---

## 3. API_DESIGN F.1 — F-REC-CAT-STG-*

### 3.1 F-REC-CAT-STG-01 — List / get pipeline stages (open catalog)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/pipeline-stages` · `GET /api/hrm/recruitment/pipeline-stages/:stageId` |
| **Mục đích** | Trả danh mục giai đoạn pipeline (Settings · kanban · form đổi trạng thái · badge) — display-ready — sau HR thêm mã **thứ 7+** F5 list **có** row (**AC-PLT-REC-02**). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + required `company_id` query. (2) Query `rec_pipeline_stage` WHERE scope AND `archived_at IS NULL` unless `include_archived=true`. (3) Default filter `status=active` when omitted (picker). (4) Optional `q` ilike `stage_key`/`name_vi`. (5) Sort `sort_order`, `stage_key`. (6) Empty `[]` = **200** — **không** fake starter in UF (U65). (7) Get-by-id: same scope — OOS → 404/403 (**U19**). (8) Response includes typed flags + optional `wfTaskTypeKey`. (9) Optional `include_group_ref=true` reserved — GĐ1 no-op unless XBOS partition exists later (**BR-PLT-06**). |
| **Tham chiếu bước SRS / AC** | **FR-UC-BP-REC-05** «Theo danh mục pipeline đơn vị» · Diễn biến đổi trạng thái · **AC-PLT-REC-02** · **BR-PLT-02/05** · BA §2.2 · ADR §7 REC |
| **Request (query)** | `company_id` (required) · `status?` · `include_archived?` · `include_group_ref?` · `q?` |
| **Response → DB** | |

| DTO field | DB column | Notes |
|-----------|-----------|-------|
| `id` | `id` | uuid |
| `companyId` | `company_id` | |
| `stageKey` | `stage_key` | consumer FK / application.stage |
| `nameVi` | `name_vi` | |
| `sortOrder` | `sort_order` | |
| `isTerminal` | `is_terminal` | |
| `isHiredOutcome` | `is_hired_outcome` | |
| `isRejectOutcome` | `is_reject_outcome` | |
| `allowsInterviewSchedule` | `allows_interview_schedule` | |
| `wfTaskTypeKey` | `wf_task_type_key` | optional |
| `colorToken` | `color_token` | optional |
| `metadata` | `metadata_json` | optional |
| `status` | `status` | |
| `source` | derived | `rec_native` \| `group_ref` \| `rec_override` |
| `archivedAt` | `archived_at` | |
| `updatedAt` | `updated_at` | |

| **Lỗi** | Scope 403/409 · empty list **không** 404 |
| **scope_parity** | List predicate = get-by-id assert |

---

### 3.2 F-REC-CAT-STG-02 — Create / upsert / retire pipeline stage

| | |
|--|--|
| **METHOD / path** | `POST /api/hrm/recruitment/pipeline-stages` · `PUT /api/hrm/recruitment/pipeline-stages` (upsert by `(company_id, stage_key)`) · `PATCH …/:stageId` · `POST …/:stageId/retire` |
| **Mục đích** | HR CRUD giai đoạn pipeline tenant — mở catalog **không** giới hạn starter six (**BR-PLT-05**). |
| **Nghiệp vụ xử lý** | (1) Scope + mutate assert. (2) Validate `stageKey` slug — **`HRM-PLT-CAT-CODE-INVALID` = format only** — **cấm** reject «not in screening\|…\|withdrawn». (3) Validate flags; enforce hired-outcome UQ → **`HRM-PLT-CAT-CODE-CONFLICT`** or `HRM-REC-STG-HIRED-DUP`. (4) Upsert active key → refresh labels/flags/sort; bump `updated_at`. (5) UQ key conflict → **`HRM-PLT-CAT-CODE-CONFLICT`**. (6) Retire: `status=retired`, `archived_at=now()` — pickers hide; **must_keep** historical application/history rows (**BR-PLT-04**). (7) **FORBIDDEN** hard-delete. (8) Retire of sole `is_hired_outcome` while open hire paths exist → **412** `HRM-REC-STG-HIRED-REQUIRED` (keep at least one hired-outcome active **or** require reassign first). (9) After 2xx, transition UI must accept new key (**AC-PLT-REC-02**). |
| **Tham chiếu bước SRS / AC** | **AC-PLT-REC-02/03** · **BR-PLT-02/04/05** · FR-UC-BP-REC-05 |
| **Request → DB** | Same fields as §3.1 (create/upsert required: `companyId`, `stageKey`, `nameVi`; flags default false except `allowsInterviewSchedule` default true) |
| **Response → DB** | Single row display-ready |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` · `HRM-PLT-CAT-CODE-CONFLICT` · `HRM-REC-STG-HIRED-DUP` · `HRM-REC-STG-HIRED-REQUIRED` · `HRM-VAL-400` · scope |
| **scope_parity** | Mutate assert = list scope |

---

### 3.3 F-REC-CAT-EFF-01 — Effective stage catalog for consumers (read helper)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/pipeline-stages/effective` (alias — may implement inside STG-01) |
| **Mục đích** | Single read model for F-REC-APP-02 / kanban / mobile picker — active tenant rows (+ future group REF). |
| **Nghiệp vụ xử lý** | (1) Load ATT-style: active `rec_pipeline_stage`. (2) Optional merge group REF if present — tenant wins on key. (3) Used by transition assert — **replace ad-hoc closed string set** in Nest after BE lands. (4) Read-only — no persist. (5) Expose `hiredOutcomeKey` helper = the active `is_hired_outcome` row’s `stage_key` (or null if catalog empty). |
| **Tham chiếu bước SRS / AC** | **BR-PLT-02/06** · FR-UC-BP-REC-05 · F-REC-HIRE-01 |
| **Lỗi** | Scope only |
| **scope_parity** | Same as STG-01 |

---

## 4. Consumer deepen (pointer — must_keep TXN APIs)

> **Không** redesign F-REC-APP-01/03 · UV-YCTD · IV · HIRE · JD. **EXPAND** validation source only.

| Consumer F-id | Change |
|---------------|--------|
| **F-REC-APP-02** | Assert `to_stage` ∈ **F-REC-CAT-EFF-01** when catalog >0 → else **`HRM-REC-STAGE-UNKNOWN`** (**BR-PLT-02**); append history **must_keep**; invalid transition matrix may remain code for terminal edges (hired←pool silent **FORBIDDEN** — DB_DESIGN note) |
| **F-REC-APP-01 / UV-YCTD** | Initial `stage` default = first non-terminal active by `sort_order` **or** starter `screening` if catalog empty — **no** free-text SoT when catalog >0 |
| **F-REC-HIRE-01** | Target application stage = catalog `is_hired_outcome` key (default `hired` starter) — soft-link CORE employee **must_keep**; **FORBIDDEN** invent payslip |
| **F-REC-IV / 06a** | Schedule allowed when application stage has `allows_interview_schedule=true` **or** catalog empty (compat) — **one-active invariant unchanged** |
| **WF bridge** | Map `wf_task_type_key` → `stage_key` when set; fallback starter map for known codes — **ops**, not catalog duplicate |

---

## 5. Acceptance criteria (REC vertical — stages)

| ID | Domain | Đạt khi (U65 browser) | Không đạt khi |
|----|--------|----------------------|---------------|
| **AC-PLT-REC-01** | REC JD | *(existing BA)* field catalog → DnD layout → form JD động → F5 | Invent brand / wipe REC-00 — **must_keep** |
| **AC-PLT-REC-02** | REC stages | Settings/REC CFG → **Tạo giai đoạn** mã HR đặt (#7+) → **2xx** → list có row → **F5** còn → form đổi trạng thái UV **chọn được** mã mới | Reject «không thuộc 6 starter» · FE hardcode six · mất sau F5 |
| **AC-PLT-REC-03** | REC stages | Retire giai đoạn → picker ẩn → application/history **còn** hiển thị key cũ | Hard-delete · orphan history |
| **AC-PLT-REC-04** | REC stages | Khi catalog >0: transition `to_stage` **ngoài** catalog → **4xx** deterministic — không 2xx free-text | Free-text SoT khi catalog có items |
| **AC-PLT-REC-05** | REC hire | Accept offer / hire path sets stage = hired-outcome key → CORE employee link still works | Break F-REC-HIRE-01 · invent PAY |

**Journey (QA later):** `J-HRM-REC-STG-01` (open catalog) · reuse UV/IV/hire spines — **no** claim REC module UAT from this seat.

---

## 6. Error taxonomy (REC catalog class)

| Code | HTTP | When | Shared with |
|------|------|------|-------------|
| `HRM-PLT-CAT-CODE-INVALID` | 400 | slug format fail — **not** «not in starter N» | Platform |
| `HRM-PLT-CAT-CODE-CONFLICT` | 409 | Active UQ `(company_id, stage_key)` | Platform |
| `HRM-REC-STG-HIRED-DUP` | 409 | Second active `is_hired_outcome` | REC |
| `HRM-REC-STG-HIRED-REQUIRED` | 412 | Retire last hired-outcome without reassign | REC |
| `HRM-REC-STAGE-UNKNOWN` | 400 | Transition / create stage ∉ effective catalog | BR-PLT-02 |
| `HRM-REC-IV-409-ACTIVE` | 409 | One-active interview — **unchanged** | IV SA |
| Scope | 403/409 | list↔id↔mutate | U19 |

---

## 7. DOC-DELTA — client deliverables (ADD-only)

> **ba-docs** append — **không** wipe F-REC-APP-* / UV / IV / HIRE / JD stubs.

### 7.1 `API_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** §3.x | **F-REC-CAT-STG-01..02** · **F-REC-CAT-EFF-01** with full F.1 blocks (copy §3) |
| **EXPAND** | **F-REC-APP-02** footnote: validate `to_stage` against effective catalog when >0 |
| **EXPAND** | **F-REC-HIRE-01** footnote: hired stage key = `is_hired_outcome` |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |

### 7.2 `DB_DESIGN_HRM_ENTERPRISE.md`

| Action | Content |
|--------|---------|
| **ADD** | §2.x `rec_pipeline_stage` physical — **FORBIDDEN** closed key CHECK |
| **EXPAND** | §2.5 `stage` note: open catalog key · starter six ≠ ceiling |
| **meta header** | Stamp **DOC-DELTA CONFIRMED** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |

### 7.3 `SRS_HRM_ENTERPRISE.md` (optional pointer)

| Action | Content |
|--------|---------|
| **EXPAND** | FR-UC-BP-REC-05 Diễn biến — «danh mục pipeline đơn vị» = Settings open catalog (no new FR required if wording already matches) |

---

## 8. must_keep / forbidden

| Keep | Forbidden |
|------|-----------|
| JD DnD / `rec_jd_*` Option A | Wipe / re-EAV JD into MergeToken this seat |
| FR-UC-BP-REC-06a one-active interview | Parallel two active interviews |
| F-REC-HIRE-01 → CORE employee soft-link | REC invent payslip / PAY call |
| YCTD↔JD / UV-YCTD ONE physical FK | Dual FK · `job_postings` SoT · REC-03 GĐ1 |
| F-REC-APP-02 history append-only | Hard-delete stages with history |
| U65 FE CRUD evidence | Seed for UF |
| Open catalog 7+ stages | `CHECK IN (6)` · API reject 7th |
| Honesty flags false | REC UAT / Phase1 flip from docs |

---

## 9. Cascade unlock

| Gate | Status after this seat |
|------|------------------------|
| REC vertical API F.1 (stages) | **CONFIRMED** (this doc) |
| **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` | **UNLOCKED** — physical `rec_pipeline_stage` (**not** already covered by platform DATA-01) |
| **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` | **HOLD** until DATA CONFIRMED |
| **dev-fe** REC Settings stage picker + transition picker | **HOLD** until BE READY_FOR_QA |
| **QA** AC-PLT-REC-02..05 | After FE/BE — U65 browser |
| JD FormSchema / MergeToken JD view | **Separate** — already parallel; **not** blocked by this seat |
| Eval template / mail MergeToken | **Later P2/GĐ2** |

**Residual OPEN:**

| ID | Note | Owner |
|----|------|-------|
| R-PLT-REC-01 | Wire F-REC-APP-02 → F-REC-CAT-EFF-01 after table live | dev-be |
| R-PLT-REC-02 | WF bridge optional `wf_task_type_key` hydrate | dev-be |
| R-PLT-REC-03 | Client DOC-DELTA §7 | ba-docs |
| R-PLT-REC-04 | Interview eval template as Catalog GĐ1.5 | sa later |
| R-PLT-REC-05 | Group REF stages partition (if XBOS publishes) | sa / ba-data later |

---

## 10. Honesty

| Flag | Value |
|------|-------|
| REC / recruitment module UAT-ready | **false** |
| Platform / Phase1 DONE | **false** |
| `payroll_e2e_ready` | **false** |
| This seat | Docs only — API F.1 REC stages vertical |
| Option B | **CONFIRMED** |
| Seed | **forbidden** in UF evidence |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-vertical-sa-01.md` |
| **next_owner** | **pm** → **ba-data** REC physical · parallel **ba-docs** DOC-DELTA §7 |
| **completion_report** | CONFIRMED REC vertical F.1: F-REC-CAT-STG/EFF open pipeline-stage catalog (like F-PLT-TOK / F-ATT-CAT-LVT); ICatalogRow map; dual SoT = HRM writer vs WF ops map (no XBOS stages REF GĐ1); JD FormSchema must_keep separate; AC-PLT-REC-02..05; DOC-DELTA client API/DB; unlock ba-data REC-DATA-01 (not already covered); no apps/**. |
