# PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01 — API F.1 · UC-BP-REC-06a residual (`no_show` · R-A PATCH)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-4 seat #6) |
| **lane** | governance · sa |
| **change_mode** | **ADD** DOC-DELTA residual unlock · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · unlock **dev-be** + **dev-fe** |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | BA-01 **CONFIRMED** (O1–O10) · SA-01 Option **A LOCKED** · prior IV slice GWC RETAIN |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md) |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md) |
| **ref_evidence_ba** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md` |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06a** Diễn biến **#1–#7** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` · **F-REC-IV-SCHED-SOFT** (RETAIN) · paper `/rec/interviews*` = **alias only** |
| **ref_team_api** | `docs/hrm/API_DESIGN_HRM_RECRUITMENT.md` Endpoint H (schedule) — RETAIN + residual below |
| **ref_spine** | `public.recruitment_interviews` · unique ACTIVE · `active_interview` projection |
| **ref_partner** | **REQ_REC_004** · WBS-REC-04 |
| **Honesty** | `recruitment_uat_ready=false` · program honesty **false** · **C-SLICE** · U65 |
| **ba-data** | **NOT REQUIRED** (unlock gate) — see §9 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical mutate SoT | **`/api/hrm/recruitment/interviews*`** under Nest `@Controller('recruitment')` |
| Paper path | `/api/hrm/rec/interviews*` = **logical alias only** — **DENY** Nest greenfield dual `/rec` controller |
| SoT table | **`recruitment_interviews`** only (Lane A) — **DENY** Lane B `public.interviews` as FR-06a SoT |
| Cardinality | **`(company_id, candidate_id)`** — **DENY** UV×YCTD concurrent ACTIVE |
| Reschedule | **R-A primary** — `PATCH …/interviews/:id` updates `scheduled_at` (± `interviewer`) on **same** ACTIVE row |
| `no_show` | ∈ **TERMINAL** via **F-REC-IV-02** status DTO + CHECK UPGRADE |
| Soft-gate | **RETAIN** `HRM-REC-IV-400-STAGE-DISALLOW` ≠ `HRM-REC-IV-409-ACTIVE` |
| U19 | list candidates projection **=** get interview **=** create/status/reschedule via **`resolveHrmListScope`** |
| This seat | Docs + client DOC-DELTA pointer — **NO** `apps/**` · **NO** seed · **NO** honesty flip |
| Unlock | **dev-be** + **dev-fe** (rule 26 split) — ba-data **NOT REQUIRED** |

```text
  FE CandidatesTab / Schedule / Cancel / Complete / No-show / Reschedule
        │  Network assert path contains /recruitment/interviews
        ▼
  POST   /api/hrm/recruitment/interviews                 (F-REC-IV-01 RETAIN)
  PATCH  /api/hrm/recruitment/interviews/:id/status      (F-REC-IV-02 UPGRADE + no_show)
  PATCH  /api/hrm/recruitment/interviews/:id             (F-REC-IV-03 UNLOCK ADD R-A)
  GET    …/candidates* → active_interview                (F-REC-IV-04 RETAIN)
        │  soft-gate overlay on POST (F-REC-IV-SCHED-SOFT RETAIN)
        │  paper /api/hrm/rec/interviews* = alias only
        ▼
  public.recruitment_interviews
       ACTIVE = scheduled | confirmed
       TERMINAL = cancelled | completed | no_show (+ passed|failed legacy)
       UNIQUE (company_id, candidate_id) WHERE ACTIVE
```

**Envelope RETAIN:** `{ code, message, data }` · success family **`HRM-REC-203`** (create) / **`HRM-REC-204`** (status/update) · domain errors **`HRM-REC-IV-*`**.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE code | Gap vs F.1 residual |
|---------|-----------|---------------------|
| `POST …/interviews` | `scheduleInterview` + 409 ACTIVE + soft-gate | **RETAIN** · ADD past-datetime VAL (O7) on create |
| `PATCH …/interviews/:id/status` | `UpdateInterviewStatusDto` **without** `no_show`; no cancel_reason; weak transition matrix | **UPGRADE** — ADD `no_show` · cancel_reason CFG · INVALID-TRANSITION |
| `PATCH …/interviews/:id` | **ABSENT** | **UNLOCK ADD** R-A `scheduled_at` (± interviewer) |
| CHECK status | `scheduled\|confirmed\|cancelled\|completed\|passed\|failed` | **UPGRADE** ADD `no_show` (existing `status` column — not new table) |
| `cancel_reason` column | **ABSENT** | **ADD COLUMN IF NOT EXISTS** `cancel_reason TEXT NULL` via Dev-BE `ensureSchema` (same pattern as prior IV ADD COLUMN) — **not** greenfield SoT |
| Candidate projection | `active_interview*` display-ready | **RETAIN** |
| Lane B catalog `createInterview` | No one-active | **DENY as FR-06a SoT** · FE path lock O1 |
| Nest `/rec/interviews` | Paper only | **Alias only** |
| `GET …/interviews?candidate_id=` | Absent / P2 | **P2** — **not** MVP unlock blocker (O8) |

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `POST/PATCH /api/hrm/recruitment/interviews*` |
| **LOGICAL (paper)** | `POST/PATCH /api/hrm/rec/interviews*` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |

**FORBIDDEN:** Nest `/rec/interviews` dual SoT · FE mutate via Lane B `public.interviews` / catalog create as FR-06a PASS · UV×YCTD one-active key · REC-03 campaign schedule hub · hard DELETE · greenfield second interview table.

---

## 4. Status & transition dictionary (normative)

### 4.1 Groups (RETAIN SA §7 / BA)

| Group | Values | One-active filter |
|-------|--------|-------------------|
| **ACTIVE** | `scheduled`, `confirmed` | Count ≤ 1 per `(company_id, candidate_id)` |
| **TERMINAL** | `cancelled`, `completed`, **`no_show`** | Allows create new ACTIVE |
| **TERMINAL legacy** | `passed`, `failed` | completed-family for filter (RETAIN rows) |
| **Not default MVP** | `rescheduled` | Only if R-B atomic — **not** primary path |

### 4.2 Allowed transitions (F-REC-IV-02)

| From \ To | `confirmed` | `cancelled` | `completed` | `no_show` | ACTIVE other |
|-----------|:-----------:|:-----------:|:-----------:|:---------:|:------------:|
| `scheduled` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `confirmed` | — | ✅ | ✅ | ✅ | ❌ |
| TERMINAL (`cancelled`/`completed`/`no_show`/legacy) | ❌ | ❌ | ❌ | ❌ | ❌ |

- **Illegal** → **400** `HRM-REC-IV-400-INVALID-TRANSITION` (VAL-REC-IV-09 / AC-R06).
- Setting ACTIVE status when another ACTIVE exists for same UV×company → **409** `HRM-REC-IV-409-ACTIVE` (RETAIN).
- **Never** hard DELETE (BR-IV-06).

### 4.3 R-A reschedule guard (F-REC-IV-03)

| Rule | Outcome |
|------|---------|
| Target row status ∈ ACTIVE | Allow PATCH `scheduled_at` (± interviewer) |
| Target row TERMINAL / missing | **400** `HRM-REC-IV-400-INVALID-TRANSITION` — **no** silent revive |
| After PATCH | **Same** `id` remains ACTIVE; **never** INSERT second ACTIVE |
| Unique index | RETAIN `uniq_recruitment_interviews_active_candidate` |

---

## 5. Error taxonomy (RETAIN + MINT)

| Code | HTTP | Meaning | ≠ |
|------|------|---------|---|
| `HRM-REC-IV-409-ACTIVE` | 409 | Already ACTIVE — details `active_interview_id` / status / `active_at` | Soft-gate |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | Stage flag blocks schedule | One-active |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | Illegal status / R-A on non-ACTIVE | — |
| **`HRM-REC-IV-400-PAST-DATETIME`** | 400 | **MINT** — past `scheduled_at` when CFG block (O7 default) | — |
| **`HRM-REC-IV-400-CANCEL-REASON`** | 400 | **MINT** — missing cancel reason when CFG required (O6) | — |
| `HRM-REC-405` | 404 | Candidate not found / out of scope | — |
| `HRM-REC-406` | 404 | Interview not found / out of scope | — |
| `HRM-REC-409` / scope family | 409 | Scope mismatch (`assertResourceInHrmScope`) | — |

### 5.1 Tenant CFG keys (BA O6 / O7 — not invent Decision)

| CFG key | Default when unset | Effect |
|---------|--------------------|--------|
| `interview_cancel_reason_required` | **false** (optional) | `true` → cancel without reason → **400** CANCEL-REASON |
| `allow_past_interview_schedule` | **false** (BLOCK past) | `true` → allow past datetime on create/R-A |

CFG SoT = existing tenant/company settings plane (Dev-BE read) — **DENY** invent global hard Decision outside CFG.

---

## 6. F.1 functions (each: Mục đích · Nghiệp vụ · Bước SRS)

### F-REC-IV-01 — Schedule interview (**RETAIN LIVE**)

| | |
|--|--|
| **METHOD / path** | **Physical:** `POST /api/hrm/recruitment/interviews` · paper `/api/hrm/rec/interviews` = **alias only** |
| **Mục đích** | Tạo lịch PV khi ACTIVE=0 trên spine `recruitment_interviews` — gắn UV Lane A. |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope` + load `recruitment_candidates` in-scope · (2) soft-gate `allows_interview_schedule` → else **400** STAGE-DISALLOW · (3) if ACTIVE exists → **409** ACTIVE · (4) VAL past datetime (O7) → else **400** PAST-DATETIME · (5) `INSERT` status `scheduled` · unique race → 409 · (6) **cấm** hard delete / UV×YCTD key / Lane B SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06a** Diễn biến **#1–#3** · AC-REC-IV-01/02 · AC-REC-IV-07 (soft-gate overlay) |
| **Request → DB** | See §7 DTO map · `ScheduleInterviewDto` |
| **Response** | Interview row display-ready · success **`HRM-REC-203`** |
| **Lỗi** | `HRM-REC-IV-409-ACTIVE` · `HRM-REC-IV-400-STAGE-DISALLOW` · `HRM-REC-IV-400-PAST-DATETIME` · `HRM-REC-405` · scope |
| **Status** | **RETAIN** (+ past-datetime VAL ADD on create) |

### F-REC-IV-02 — Update interview status (**UPGRADE** + `no_show`)

| | |
|--|--|
| **METHOD / path** | **Physical:** `PATCH /api/hrm/recruitment/interviews/:id/status` · paper alias same family |
| **Mục đích** | Xác nhận / hủy / hoàn tất / **không đến** trên lịch đang hiệu lực — soft status trail (BR-IV-06). |
| **Nghiệp vụ xử lý** | (1) Scope resolve + load row · (2) Validate transition matrix §4.2 · illegal → **400** INVALID-TRANSITION · (3) If `status=cancelled` and CFG `interview_cancel_reason_required=true` and reason empty → **400** CANCEL-REASON · (4) Persist `status` + optional `cancel_reason` · `updated_at` · (5) If target ACTIVE and another ACTIVE exists → **409** ACTIVE · (6) After TERMINAL (`cancelled`\|`completed`\|**`no_show`**) allow create (AC-IV-03/04) · (7) **cấm** hard DELETE. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06a** Diễn biến **#4** (confirm) · **#5** (hủy) · **#6** (hoàn tất / không đến) · AC-REC-IV-03/04 · R01–R04 · VAL-06/09 |
| **Request → DB** | `UpdateInterviewStatusDto` → `status` · `cancel_reason?` → `cancel_reason` |
| **Response** | Updated row · success **`HRM-REC-204`** · projection badge clears when TERMINAL |
| **Lỗi** | `HRM-REC-IV-400-INVALID-TRANSITION` · `HRM-REC-IV-400-CANCEL-REASON` · `HRM-REC-IV-409-ACTIVE` · `HRM-REC-406` · scope |
| **Status** | **RETAIN + UPGRADE** — ADD `no_show` ∈ DTO + TERMINAL filter + CHECK |

### F-REC-IV-03 — Reschedule R-A (**UNLOCK ADD**)

| | |
|--|--|
| **METHOD / path** | **Physical:** `PATCH /api/hrm/recruitment/interviews/:id` · paper `/api/hrm/rec/interviews/{id}` = **alias only** |
| **Mục đích** | Đổi ngày giờ (± người PV) trên **cùng** bản ghi ACTIVE — không tạo ACTIVE thứ hai (BR-IV-03). |
| **Nghiệp vụ xử lý** | (1) Scope + load by id · (2) Row must be ACTIVE (`scheduled`\|`confirmed`) else **400** INVALID-TRANSITION · (3) VAL `scheduled_at` required/parseable · past policy O7 → **400** PAST-DATETIME · (4) `UPDATE` same row `scheduled_at` (± `interviewer`) · **no** status change to TERMINAL · **no** INSERT · (5) Badge projection shows new datetime · F5 retains same `id` · (6) R-B atomic close+create **out of default**; if ever used must be single txn ≤1 ACTIVE (not this MVP path). |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06a** Diễn biến **#7** (đổi lịch) · cross-ref luồng chính bước **5** · AC-REC-IV-05 · R05/R06 · VAL-02/03/10/11 |
| **Request → DB** | `RescheduleInterviewDto` → `scheduled_at` · optional `interviewer` |
| **Response** | Same `id` ACTIVE row · **`HRM-REC-204`** (or mint `HRM-REC-205` if Dev prefers distinct — **prefer reuse 204**) |
| **Lỗi** | `HRM-REC-IV-400-INVALID-TRANSITION` · `HRM-REC-IV-400-PAST-DATETIME` · `HRM-REC-406` · scope |
| **Status** | **UNLOCK ADD** |

### F-REC-IV-04 — Candidate list `active_interview` projection (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/candidates*` (existing list/get) |
| **Mục đích** | Display-ready badge «Đã có lịch» + `dd/MM/yyyy HH:mm` cho FR-06a list (AC-IV-01/06). |
| **Nghiệp vụ xử lý** | BE subquery ACTIVE row → `active_interview_id` / `status` / `at` / badge label · FE **bind only** — **cấm** FE suy ACTIVE từ raw interview rows. |
| **Tham chiếu bước SRS** | Diễn biến **#3** / **#7** (danh sách dấu hiệu) · AC-REC-IV-01 · AC-REC-IV-06 |
| **Status** | **RETAIN LIVE** |

### F-REC-IV-SCHED-SOFT — Soft-gate stage (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | Overlay on **F-REC-IV-01** POST |
| **Mục đích** | Chặn xếp lịch khi giai đoạn `allows_interview_schedule=false` — **không** thay one-active. |
| **Nghiệp vụ xử lý** | EFF catalog flag · **400** `HRM-REC-IV-400-STAGE-DISALLOW` · toast/copy **≠** 409 ACTIVE (O5). |
| **Tham chiếu bước SRS** | FR-UC-BP-REC-06a soft-gate rule · AC-REC-IV-07 · DOC-DELTA REC-STAGE-CATALOG |
| **Status** | **RETAIN** |

### F-REC-IV-05 — List interviews by candidate (**P2 HOLD**)

| | |
|--|--|
| **METHOD / path** | `GET …/interviews?candidate_id=` (optional) |
| **Status** | **P2** — MVP AC-06 via projection / 409 details — **not** unlock blocker (O8) |

### F-REC-CAMPAIGN-* — **OUT / DENY**

REC-03 campaign schedule hub — **FORBIDDEN** this seat.

---

## 7. DTO ↔ `recruitment_interviews` columns

### 7.1 Table columns (physical SoT)

| Column | Type | Null | API use |
|--------|------|------|---------|
| `id` | UUID PK | NO | Path `:id` · response · projection |
| `company_id` | TEXT | NO | Plane B slug · unique ACTIVE key |
| `candidate_id` | UUID FK → `recruitment_candidates` | NO | Create + cardinality |
| `scheduled_at` | TIMESTAMPTZ | NO | Create · **R-A PATCH** · badge |
| `interviewer` | TEXT | NO | Create · optional R-A PATCH |
| `status` | TEXT | NO | Create default `scheduled` · status PATCH · CHECK includes **`no_show`** |
| **`cancel_reason`** | TEXT | **YES** | **ADD** — status cancel when provided / CFG required |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | Audit |

**CHECK status (UPGRADE):** `scheduled` \| `confirmed` \| `cancelled` \| `completed` \| **`no_show`** \| `passed` \| `failed`.

**Index RETAIN:** `uniq_recruitment_interviews_active_candidate` ON `(company_id, candidate_id)` WHERE `status IN ('scheduled','confirmed')`.

### 7.2 Request DTOs

| DTO | Fields | Maps to |
|-----|--------|---------|
| `ScheduleInterviewDto` (RETAIN) | `company_id`, `candidate_id`, `scheduled_at`, `interviewer` | insert columns |
| `UpdateInterviewStatusDto` (UPGRADE) | `status` ∈ ACTIVE∪TERMINAL∪legacy **incl. `no_show`** · `cancel_reason?` string max ≤500 | `status` · `cancel_reason` |
| `RescheduleInterviewDto` (**ADD**) | `scheduled_at` required ISO8601 · `interviewer?` | `scheduled_at` · `interviewer` |

### 7.3 Response / projection (display-ready)

| Field | Source |
|-------|--------|
| Interview row | `id, company_id, candidate_id, scheduled_at, interviewer, status, cancel_reason?, created_at, updated_at` |
| `active_interview_*` on candidates | ACTIVE subquery — badge label VI «Đã có lịch» · at ISO (FE formats `dd/MM/yyyy HH:mm`) |

---

## 8. U19 scope parity (mandatory)

| Operation | Resolver |
|-----------|----------|
| List candidates + projection | `resolveHrmListScope` |
| POST schedule | same + candidate in-scope |
| PATCH status / R-A | `assertResourceInHrmScope` on interview `company_id` |
| Persona | Group CEO rollup · Member CEO own LE · HRBP narrow — **same** as candidate list |

**Invariant IV-S-SCOPE:** list projection = get = create = status = reschedule.

---

## 9. ba-data disposition

| Question | Answer |
|----------|--------|
| Missing spine **SoT table**? | **No** — `recruitment_interviews` LIVE |
| Missing columns for R-A / status? | `scheduled_at` · `status` · `interviewer` **present** |
| `no_show` | **CHECK UPGRADE** on existing `status` — Dev-BE `ensureSchema` (prior pattern) |
| `cancel_reason` | **ADD COLUMN IF NOT EXISTS** TEXT NULL — Dev-BE `ensureSchema` · **not** greenfield table / FK redesign |
| Separate ba-data seat before Dev? | **NOT REQUIRED** |
| Optional P2 | Sync stale `DB_DESIGN_HRM_RECRUITMENT.md` §3 CHECK + `cancel_reason` — **non-blocking** |

**DENY ba-data invent:** second interview SoT table · Nest `/rec` physical · UV×YCTD unique rewrite.

---

## 10. must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | Lane A SoT · 409 `HRM-REC-IV-409-ACTIVE` · unique ACTIVE · `active_interview` badge · soft-gate ≠ 409 · soft cancel · `resolveHrmListScope` · prior IV create/409/badge GWC · W1–W3 seals · honesty false · U65 |
| **DENY** | Nest `/rec` dual · Lane B as SoT · UV×YCTD ACTIVE · REC-03 · seed · flip `recruitment_uat_ready` · greenfield interview table · reopen REC-01/02/08 · FE invent ACTIVE · hard DELETE · claim module REC UAT |

---

## 11. Dev unlock checklist (contract)

### BE

1. DTO ADD `no_show` + optional `cancel_reason` on status PATCH.
2. ensureSchema: CHECK ADD `no_show` · `ADD COLUMN IF NOT EXISTS cancel_reason`.
3. Transition matrix + INVALID-TRANSITION.
4. CFG gates PAST-DATETIME / CANCEL-REASON.
5. ADD `PATCH :id` R-A — never second ACTIVE.
6. jest regression one-active + no_show TERMINAL + R-A + past/cancel CFG + soft-gate ≠ 409.
7. Optional Lane B ALIGN deny-as-SoT (soft) — **not** dual write SoT.

### FE

1. Cancel / complete / **no_show** / reschedule UX → Network **only** `/recruitment/interviews*`.
2. Toast 409 ACTIVE ≠ STAGE-DISALLOW ≠ PAST ≠ CANCEL-REASON.
3. R-A: PATCH datetime — **no** POST create; badge F5 same id.
4. Bind `active_interview` only.
5. U65 browser — **no seed**.

---

## 12. Client API_DESIGN DOC-DELTA pointer

| Action | Path |
|--------|------|
| **ADD/EXPAND** F-REC-IV-01..04 physical + MINT errors | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| **RETAIN** F-REC-IV-SCHED-SOFT | same |
| Registry DOC-DELTA | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01` |
| Team SoT primary | **this file** |

---

## 13. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
prior IV GWC ≠ module UAT
U65 zero-seed
no apps/** this seat
W1–W3 sealed must_keep
```

---

## 14. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-api-01.md` |
| **next_owner** | **dev-be** + **dev-fe** (parallel unlock · rule 26) |
| **ba-data** | **NOT REQUIRED** |
| **completion_report** | CONFIRMED F.1 residual Option A: F-REC-IV-02 UPGRADE `no_show`+cancel CFG; F-REC-IV-03 UNLOCK R-A PATCH `scheduled_at`; RETAIN IV-01/04/SCHED-SOFT physical `/recruitment/interviews*`; mint PAST-DATETIME · CANCEL-REASON; DTO↔spine (+ ensureSchema `cancel_reason`); U19; ba-data NOT REQUIRED; DENY dual Nest / Lane B SoT / UV×YCTD / REC-03 / seed / honesty / greenfield. |

---

## next_dispatch_prompt (BOTH lanes — copy-ready)

### A — dev-be

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: API-01 CONFIRMED · BA-01 O1–O10 CONFIRMED · SA-01 Option A LOCKED
change_mode: UPGRADE · preserve_default · code_memory_required APPEND
solid_convention_ack: display-ready projection · scope_parity resolveHrmListScope · no FE ACTIVE invent

MISSION: Implement residual FR-UC-BP-REC-06a on LIVE spine recruitment_interviews —
1) UPGRADE PATCH /api/hrm/recruitment/interviews/:id/status — ADD no_show ∈ TERMINAL; transition matrix → HRM-REC-IV-400-INVALID-TRANSITION; cancel_reason optional + CFG interview_cancel_reason_required → HRM-REC-IV-400-CANCEL-REASON; soft status only (no hard DELETE)
2) ADD PATCH /api/hrm/recruitment/interviews/:id — R-A scheduled_at (± interviewer) on ACTIVE only; never INSERT second ACTIVE; past datetime CFG allow_past_interview_schedule default BLOCK → HRM-REC-IV-400-PAST-DATETIME (also on POST create)
3) ensureSchema: CHECK status ADD no_show; ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL; RETAIN uniq ACTIVE index
4) RETAIN POST create + 409 HRM-REC-IV-409-ACTIVE + soft-gate STAGE-DISALLOW ≠ 409; RETAIN active_interview projection
5) Physical path only @Controller('recruitment') — DENY Nest /rec dual; Lane B public.interviews ≠ FR-06a SoT
6) jest: one-active · no_show unlocks create · R-A same id · INVALID-TRANSITION on TERMINAL · PAST/CANCEL CFG · soft-gate ≠ 409 · U19 list=get=mutate
DENY: seed · honesty flip · REC-03 · UV×YCTD ACTIVE · greenfield interview table · reopen REC-01/02/08

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md AC/VAL/Diễn biến
3. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md Option A
4. apps/api/hrm-api/src/recruitment/recruitment.service.ts · recruitment.controller.ts · dto/update-interview-status.dto.ts · dto/schedule-interview.dto.ts · common/hrm-list-scope.ts

must_keep: Lane A SoT · 409 ACTIVE · badge projection · soft-gate · W1–W3 · prior IV GWC · U65
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-01.md
spec_read_ack required (srs + ba + api + db_design cite)
```

### B — dev-fe

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: API-01 CONFIRMED · coordinate with BE-01 contracts
change_mode: UPGRADE · preserve_default · code_memory_required APPEND
solid_convention_ack: FE display-only bind active_interview · DENY invent ACTIVE

MISSION: Browser residual UF for FR-UC-BP-REC-06a on Lane A path only —
1) Cancel / Confirm / Complete / Không đến (no_show) → PATCH …/interviews/:id/status; Network path contains /recruitment/interviews
2) Đổi lịch R-A → PATCH …/interviews/:id scheduled_at; badge datetime updates; F5 same ACTIVE id; DENY POST create as reschedule
3) Distinct toasts: 409 ACTIVE ≠ 400 STAGE-DISALLOW ≠ PAST-DATETIME ≠ CANCEL-REASON ≠ INVALID-TRANSITION
4) Bind BE active_interview projection only; RETAIN prior create/409/badge GWC — no regression FAIL
5) After TERMINAL → allow schedule round 2 (AC-04); U65 FE-only — no seed
DENY: Lane B catalog schedule as SoT · Nest /rec client dual · REC-03 hub · honesty flip · reopen W1–W3

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md
2. docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md Diễn biến FE §3.6 · AC-REC-IV-* · J-HRM-REC-IV-*
3. apps/web HRM CandidatesTab / ScheduleInterviewDialog (AS-IS)

must_keep: prior IV create/409/badge UX · soft-gate copy distinct · U65
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md
spec_read_ack required
```
