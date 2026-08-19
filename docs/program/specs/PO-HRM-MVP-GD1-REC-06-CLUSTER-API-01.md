# PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01 — API F.1 · Thư tuyển + đánh giá PV neo UV↔YCTD (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-8 seat **#10**) |
| **lane** | governance · sa |
| **change_mode** | **ADD / UPGRADE** DOC-DELTA residual · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · unlock **dev-be** + **dev-fe** |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | DATA-01 **CONFIRMED** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · peer seal **`REC05QC1-MSL35D49`** · REC-06a / REC-04 **RETAIN** |
| **ref_data** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md) — `public.rec_mail_outbox` + `rec_mail_log` ADD · `candidate_evaluations` YCTD UPGRADE · `FR06_LEGACY_POOL` |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md) · AC-REC-06-* · VAL-REC-ME-01..24 · O1–O12 |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md) Option A · F-REC-MAIL-01 · F-REC-APP-03 |
| **ref_peer_api** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md) F-REC-APP-02 **RETAIN** sole stage writer |
| **ref_uv** | [`PO-HRM-REC-UV-YCTD-API-01.md`](./PO-HRM-REC-UV-YCTD-API-01.md) · F-REC-UV-YCTD-* · F-REC-CMP-* **RETAIN** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06** Diễn biến **#1–#2** · Thành công · special mail-fail / nhiều vòng · **BR-BP-MAIL-01** / **BR-BP-REC-MAIL-01** · **BR-BP-REC-IV-05** cite |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-REC-MAIL-01** · **F-REC-APP-03** = **logical alias**; physical prefer `/recruitment/*` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ba-data** | **ALREADY CONFIRMED** (DATA-01) — this seat **does not** re-open schema invent |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Physical base | Nest `@Controller('recruitment')` — **`/api/hrm/recruitment/*` ONLY** |
| Mail primary | **`POST /api/hrm/recruitment/candidates/:id/mail`** — **ADD F-REC-MAIL-01** |
| Mail read | **`GET /api/hrm/recruitment/candidates/:id/mail`** (+ optional `GET …/mail-outbox/:outboxId`) — **ADD** outbox+log display-ready |
| Eval primary | **`POST/GET /api/hrm/recruitment/candidate-evaluations*`** — **UPGRADE F-REC-APP-03** YCTD-bound |
| Eval templates | **`GET/POST …/evaluation-criteria-templates*`** — **UPGRADE** soft-retire (O4/O11) |
| Eval soft-delete | **`DELETE …/candidate-evaluations/:id`** → **soft** `archived_at` (**DENY** hard DELETE as SoT) |
| Eval neo (O2) | NEW FR-06 rows require `recruitment_candidate_id` **and/or** `application_id` + `company_id` |
| Pass/Fail (O5) | Chốt: `result` ∈ {`pass`,`fail`} **required** · silent `pending` ≠ DONE |
| Round gate (O6) | New/chốt eval round **only** after prior ACTIVE IV **TERMINAL** (`completed`\|`cancelled`\|`no_show`) or linked TERMINAL `interview_id` |
| Mail CC (O8) | `template_code=interview_invite` ⇒ `cc_interviewers[]` non-empty → else **400** `HRM-REC-MAIL-CC-REQUIRED` |
| Mail fail ≠ stage | Enqueue/send fail ⇒ outbox `failed` + log · **no** Lane A `status` mutate |
| Stage writer | **RETAIN F-REC-APP-02** `POST …/candidates/:id/transitions` — **sole** stage writer after Pass/Fail |
| Display-ready DTO | Mail: `status` / `queued_at` / `sent_at` / `error_message` / `log[]` · Eval: `result` / `scores` / neo ids / `evaluated_at` |
| Mint codes | **`HRM-REC-MAIL-*`** · **EXPAND `HRM-REC-EVAL-*`** (+ **`HRM-REC-EVAL-ROUND-GATE`**) |
| U19 | list candidates **=** get-by-id **=** mail enqueue/log **=** eval list/submit — same `resolveHrmListScope` |
| Paper path | `POST /api/hrm/rec/applications/{id}/mail` · `/interview-evals` = **logical alias only** — **DENY** Nest dual SoT |
| Legacy pool eval | `FR06_LEGACY_POOL` read-only / exclude 06b — **≠** FR-06 score SoT |
| REC-03 / Campaign | **OUT / DENY** |
| REC-07 hire / 06b matrix | **OUT** — template `offer` ≠ F-REC-HIRE-01 |
| Peers | **RETAIN** UV-YCTD · REC-05 transitions/history · 06a IV · REC-04 scan/posted · CAT STG/EFF · CMP stub · W1–W3 |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-* |
| Unlock | **dev-be** + **dev-fe** (rule 26 split) after this CONFIRMED |

```text
  FE «Gửi thư theo mẫu» + «Đánh giá Pass/Fail» trên UV↔YCTD
        │  Network assert path contains /recruitment/
        ▼
  GET  /api/hrm/recruitment/candidates/:id                         (Lane A — RETAIN U19)
        │
        ├─► POST /api/hrm/recruitment/candidates/:id/mail          (F-REC-MAIL-01 ADD)
        │     assert template_code CFG · invite ⇒ CC
        │     INSERT rec_mail_outbox (queued|…) + APPEND rec_mail_log
        │     DENY stage mutate · DENY Nest /rec dual
        │
        ├─► GET  /api/hrm/recruitment/candidates/:id/mail          (outbox+log display-ready)
        │
        ├─► POST /api/hrm/recruitment/candidate-evaluations        (F-REC-APP-03 UPGRADE)
        │     neo YCTD · Pass|Fail on chốt · round gate after 06a TERMINAL
        │     soft archived_at · DENY pool-only as FR-06 DONE
        │
        ├─► GET  /api/hrm/recruitment/candidate-evaluations*       (filter YCTD neo · exclude legacy from 06b)
        │
        └─► POST /api/hrm/recruitment/candidates/:id/transitions   (F-REC-APP-02 RETAIN — sole stage)
              + GET …/stage-history                                (RETAIN REC-05)

  paper /api/hrm/rec/applications/{id}/mail · /interview-evals = alias only
  Pool candidate-evaluations JOIN candidates / Kanban offer / Campaign = OUT as FR-06 SoT
```

**Envelope RETAIN:** `{ code, message, data }` · success **`HRM-REC-MAIL-200` / `HRM-REC-MAIL-201`** · **`HRM-REC-EVAL-200` / `HRM-REC-EVAL-201`** (RETAIN family) · domain errors §8.

**Invariant MAIL-LOG (O3 / VAL-REC-ME-03/22):** every enqueue/retry attempt that persists outbox ⇒ ≥1 **INSERT** `rec_mail_log` · success without log = **FAIL**.

**Invariant EVAL-YCTD (O2 / VAL-REC-ME-02):** every FR-06 chốt **2xx** ⇒ neo YCTD (`recruitment_candidate_id` and/or `application_id`) + `result` ∈ {pass,fail}.

**Invariant STAGE-APP-02 (O7 / VAL-REC-ME-08):** mail/eval endpoints **never** UPDATE `recruitment_candidates.status` · pipeline only via transitions.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite) | Gap vs F.1 residual |
|---------|----------------------|---------------------|
| `GET/POST …/candidate-evaluations*` | LIVE · JOIN Lane B `public.candidates` · `result` default `pending` · hard `DELETE` | **UPGRADE** YCTD neo · Pass\|Fail · soft-delete · exclude legacy |
| `GET/POST …/evaluation-criteria-templates*` | LIVE · `is_active` · replace hard wipe risk | **UPGRADE** soft-retire · DENY wipe-as-SoT |
| `POST …/candidates/:id/mail` | **ABSENT** | **ADD** F-REC-MAIL-01 |
| `GET …/candidates/:id/mail` | **ABSENT** | **ADD** outbox+log read |
| `rec_mail_outbox` / `rec_mail_log` | **ABSENT** ensureSchema | **ADD** per DATA-01 (Dev implement) |
| Eval columns neo / `archived_at` / `salary_recommendation` | **ABSENT** | **ADD** per DATA-01 |
| `POST …/candidates/:id/transitions` | SEALED REC-05 | **RETAIN** sole stage writer |
| `GET …/interviews*` | SEALED 06a | **RETAIN** round TERMINAL source |
| Nest `/rec/*` | Paper naming | **Alias only — DENY** controller SoT |
| Pool / Kanban `offer` | Prior deny | **≠** FR-06 DONE |
| REC-03 / hire / 06b UI | OUT / peer | **OUT** this seat |

**FORBIDDEN invent this seat:** Nest `/rec` dual · second mail/eval SoT · Campaign/`job_postings` SoT · claim pool eval DONE · claim Kanban offer = FR-06 · seed · honesty flip · reopen REC-05/06a/04 J-* rewrite · redefine APP-02 / IV one-active · claim hire = template `offer` · apps/**.

---

## 3. Path & alias lock (O1 · Q-REC-ME-EVAL-PATH)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | `/api/hrm/recruitment/candidates/:id/mail` · `/candidates/:id/mail` GET · `/candidate-evaluations*` · `/evaluation-criteria-templates*` · `/candidates/:id/transitions` · `/interviews*` |
| **LOGICAL (paper)** | `POST /api/hrm/rec/applications/{id}/mail` · `POST /api/hrm/rec/applications/{id}/interview-evals` |
| Rule | Client/docs **may** keep paper names; Dev **implements physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/recruitment/` — **FAIL O1** if FE mutates Nest `/rec/*` as SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| `rec_mail_outbox` / F-REC-MAIL-01 | `POST/GET …/candidates/:id/mail` | `rec_mail_outbox` + `rec_mail_log` |
| `rec_interview_evaluation` / F-REC-APP-03 | `candidate-evaluations*` | `candidate_evaluations` (UPGRADE) |
| `rec_interview_eval_template` | `evaluation-criteria-templates*` | `evaluation_criteria_templates` |
| application mail / interview-evals | **alias** of Lane A candidate id / eval SoT | — |
| stage after result | **F-REC-APP-02** transitions | `recruitment_candidates.status` + history |

**Q-REC-ME-MAIL-ALT LOCKED:** `POST …/applications/:id/mail` **optional synonym** only if same YCTD SoT + same VAL/log service — **primary FE** = Lane A `candidates/:id/mail` (BA O1).

**Q-REC-ME-EVAL-PATH LOCKED:** Physical primary = **`candidate-evaluations*`** UPGRADE · paper `interview-evals` = **alias only** — **DENY** second Nest controller SoT.

---

## 4. CFG dictionary (O4 / O5 / O8)

| Key | Type | Default GĐ1 | Rule |
|-----|------|-------------|------|
| **Mail `template_code` catalog** | tenant CFG codes | `fail_cv` \| `interview_invite` \| `offer` \| … | Inactive / unknown ⇒ **400** `HRM-REC-MAIL-TEMPLATE-INACTIVE` · **no** hardcode body |
| **`recruitment.eval.allow_draft`** | boolean | **`false`** | `true` ⇒ may persist `result=pending` draft · **never** 06b-ready · default chốt requires pass\|fail |
| Mail provider / async worker | ops | queued→sending→sent\|failed | Status transitions only on outbox · log APPEND |

**interview_invite CC rule (BR-BP-MAIL-01):** before INSERT outbox, `cc_interviewers` (→ `cc_emails_json`) **must** be non-empty array of valid emails · else **400** `HRM-REC-MAIL-CC-REQUIRED` · **no** outbox `sent` · **no** stage change.

---

## 5. F.1 API functions (PHYSICAL)

> Mỗi function: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · Request/Response → DB · Lỗi.

**Prefix:** `/api/hrm/recruitment`  
**Scope:** list/get candidates · mail · eval · transitions = **cùng** `resolveHrmListScope` + `assertResourceInHrmScope` (**U19** · VAL-REC-ME-13 · ME-S-SCOPE).

---

### 5.1 F-REC-MAIL-01 — Gửi thư tuyển theo mẫu + log (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/candidates/:candidateId/mail`** |
| **Mục đích** | Enqueue thư tuyển theo mẫu tenant trên **liên kết UV↔YCTD** (Lane A), ghi outbox + nhật ký gửi — phục vụ FR-UC-BP-REC-06 Diễn biến **#1** · BR-BP-MAIL-01 (CC khi mời PV). |
| **Nghiệp vụ xử lý** | (1) JWT + `company_id` → `resolveHrmListScope`; load Lane A by `:candidateId` in-scope (`requisition_id` NOT NULL preferred) — else **404/409** scope. (2) Body `template_code` required · resolve CFG catalog → inactive/unknown ⇒ **400** `HRM-REC-MAIL-TEMPLATE-INACTIVE`. (3) Body `to[]` required non-empty valid emails. (4) If `template_code=interview_invite` and `cc_interviewers[]` empty/invalid ⇒ **400** `HRM-REC-MAIL-CC-REQUIRED` — **no** INSERT outbox as `sent`. (5) Neo: set `recruitment_candidate_id=:candidateId` · optional soft `application_id` / `requisition_id` from Lane A / body — at least one neo (DATA CHK). (6) **Same logical unit:** `INSERT rec_mail_outbox` (`status=queued` default, or `sending` if sync path) + **`INSERT rec_mail_log`** `attempt_no=1` result `sent`\|`failed` when attempt completes · enqueue-only may log after first provider call. (7) Provider/sync fail ⇒ outbox `status=failed` + `error_message` + log `failed` · **DENY** UPDATE `recruitment_candidates.status` / transitions side-effect. (8) Retry: UPDATE outbox status + **APPEND** log `attempt_no+1` — **DENY** wipe prior log. (9) Soft-archive outbox = `archived_at` — **DENY** hard DELETE as SoT. (10) **cấm** Nest `/rec` dual · second mail SoT · Campaign · seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06** Diễn biến **#1** · special gửi thất bại · **BR-BP-MAIL-01** / **BR-BP-REC-MAIL-01** · AC-REC-06-01/02 · ALT-02/03 · EX-01/02/07/08 · VAL-REC-ME-01/03/05/08/09/10/12/13/22 · **O1/O3/O4/O7/O8/O12**. |
| **Request** | Path `:candidateId` (UUID Lane A). Body: `{ template_code: string, to: string[], cc_interviewers?: string[], payload?: object, application_id?: string }`. |
| **Request → DB** | `template_code` → outbox.`template_code`; `to` → `to_emails_json`; `cc_interviewers` → `cc_emails_json`; `payload` → `payload_json`; neo → `recruitment_candidate_id` (+ optional `application_id`/`requisition_id`); `company_id` denorm from Lane A / scope. |
| **Response** | Display-ready: `{ outbox_id, recruitment_candidate_id, application_id, requisition_id, template_code, status, queued_at, sent_at, error_message, to, cc_interviewers, log: [{ attempt_no, result, error_message, logged_at, provider_ref }] }` · **`HRM-REC-MAIL-201`**. |
| **Lỗi** | `HRM-REC-MAIL-CC-REQUIRED` · `HRM-REC-MAIL-TEMPLATE-INACTIVE` · `HRM-REC-MAIL-NEO-REQUIRED` · `HRM-REC-MAIL-VAL-400` · scope 404/409 · optional `HRM-REC-MAIL-PROVIDER-FAIL` (persist failed + still **no** stage). |

**Paper alias:** `POST /api/hrm/rec/applications/{id}/mail` — maps to Lane A / YCTD link (paper application_id = logical alias).

**DENY as FR-06 mail SoT:** silent send without log · mail endpoint that writes stage · Nest `/rec` controller dual · Campaign mail tables.

---

### 5.2 F-REC-MAIL-01-R — Đọc outbox + log theo UV (**ADD**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/recruitment/candidates/:candidateId/mail`** |
| **Mục đích** | Trả display-ready danh sách outbox (+ log attempts) cho hồ sơ UV–YCTD — FE **không** tự aggregate SoT (O12). |
| **Nghiệp vụ xử lý** | (1) Scope assert on Lane A candidate (same as get-by-id). (2) `SELECT` outbox WHERE `recruitment_candidate_id=:id` AND `archived_at IS NULL` ORDER BY `queued_at DESC` (+ optional `limit`). (3) For each (or detail expand): APPEND log rows ORDER BY `attempt_no`. (4) Empty **200** `[]` hợp lệ. (5) Optional thin: `GET /mail-outbox/:outboxId` same scope + company match. |
| **Tham chiếu bước SRS** | FR-06 #1 · AC-REC-06-01/08 · ALT-02 · VAL-REC-ME-12/13 · **O12**. |
| **Request** | Path `:candidateId`. Query: `company_id`; optional `limit`, `status`. |
| **Response → DB** | `data[]` ← `rec_mail_outbox` + nested `log[]` ← `rec_mail_log` · **`HRM-REC-MAIL-200`**. |
| **Lỗi** | Scope 404/409 · empty **200**. |

**Optional detail:** `GET /api/hrm/recruitment/mail-outbox/:outboxId` — same DTO single · scope company match outbox.

---

### 5.3 F-REC-APP-03 — Đánh giá PV Pass/Fail neo YCTD (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/candidate-evaluations`** |
| **Mục đích** | Chốt đánh giá phỏng vấn **Pass/Fail** (+ điểm / nhận xét / đề xuất lương) gắn **liên kết UV↔YCTD** — FR-UC-BP-REC-06 Diễn biến **#2** · chuẩn bị điểm cho FR-06b (OUT UI). |
| **Nghiệp vụ xử lý** | (1) Scope persist `company_id` via `resolveHrmPersistCompanyIdText`. (2) Neo **required** for FR-06: `recruitment_candidate_id` and/or `application_id` — else **400** `HRM-REC-EVAL-NEO-REQUIRED`. Assert Lane A / application in-scope (U19). (3) **DENY** treating body with **only** Lane B `candidate_id` (pool) as FR-06 chốt DONE → same NEO-REQUIRED (or `HRM-REC-EVAL-LEGACY-READONLY` on mutate of legacy rows). (4) Optional `interview_id` → load `recruitment_interviews`: if provided must be in-scope and **TERMINAL**; if creating new round while any ACTIVE interview exists for same Lane A without TERMINAL prior ⇒ **400** `HRM-REC-EVAL-ROUND-GATE`. (5) Chốt path (`commit=true` default when not draft): `result` ∈ {`pass`,`fail`} required → else **400** `HRM-REC-EVAL-PASSFAIL-REQUIRED`. (6) Draft path only if CFG `recruitment.eval.allow_draft=true` → may set `pending` · **not** 06b-ready. (7) `INSERT`/`UPSERT` into `candidate_evaluations` with neo columns · `scores` JSONB · optional `salary_recommendation` · `evaluated_at=now()` on chốt · `template_id?`. (8) **DENY** UPDATE Lane A `status` from this endpoint — FE must call APP-02 separately. (9) Soft-delete prefer `archived_at` on DELETE path. (10) **cấm** second eval table · Nest `/rec` dual · Campaign · seed. |
| **Tham chiếu bước SRS** | **FR-UC-BP-REC-06** Diễn biến **#2** · Thành công · special nhiều vòng · **BR-BP-REC-IV-05** cite · AC-REC-06-03/05/06 · ALT-01/04 · EX-03/04/06 · VAL-REC-ME-02/04/06/07/11/12/13/20 · **O2/O5/O6/O7/O11/O12**. |
| **Request** | Body: `{ company_id, recruitment_candidate_id?: string, application_id?: string, candidate_id?: string /* legacy only */, interview_id?: string, template_id?: string, result?: 'pass'\|'fail'\|'pending', scores?: array\|object, overall_feedback?: string, recommendation?: string, salary_recommendation?: number, evaluator_name?: string, evaluator_email?: string, total_score?: number, weighted_score?: number, commit?: boolean }`. |
| **Request → DB** | Neo → `recruitment_candidate_id` / `application_id`; `result` → `result`; `scores` → `scores` (DTO alias `scores_json`); `salary_recommendation` → col; `interview_id` → FK soft/hard; actor display → evaluator_* . |
| **Response** | Display-ready: `{ id, company_id, recruitment_candidate_id, application_id, interview_id, template_id, result, scores, scores_json, salary_recommendation, overall_feedback, recommendation, evaluated_at, evaluator_name, evaluator_email, total_score, weighted_score, archived_at }` · **`HRM-REC-EVAL-201`**. |
| **Lỗi** | `HRM-REC-EVAL-PASSFAIL-REQUIRED` · `HRM-REC-EVAL-NEO-REQUIRED` · `HRM-REC-EVAL-ROUND-GATE` · `HRM-REC-EVAL-LEGACY-READONLY` · `HRM-REC-EVAL-404` · scope 404/409. |

**Paper alias:** `POST /api/hrm/rec/applications/{id}/interview-evals` — same SoT.

---

### 5.4 F-REC-APP-03-L — List / filter evaluations (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/recruitment/candidate-evaluations`** |
| **Mục đích** | Liệt kê đánh giá theo scope + neo YCTD — display-ready; hỗ trợ FR-06 F5 + prep 06b (filter). |
| **Nghiệp vụ xử lý** | (1) `resolveHrmListScope`. (2) Query filters: `recruitment_candidate_id` **preferred** · `application_id` · optional legacy `candidate_id`. (3) Default `archived_at IS NULL`. (4) Default FR-06 product list: prefer rows with YCTD neo; optional `include_legacy=true` for admin read-only. (5) **JOIN prefer** Lane A / application display names — **DENY** sole JOIN pool `candidates` as FR-06 SoT (may keep legacy display when include_legacy). (6) 06b consumer rule (OUT UI): only `FR06_YCTD` + `result IN (pass,fail)`. |
| **Tham chiếu bước SRS** | FR-06 #2 · AC-REC-06-05/08 · VAL-REC-ME-02/12/13 · **O2/O12**. |
| **Response** | `{ total, data: EvaluationDto[] }` · **`HRM-REC-EVAL-200`**. |
| **Lỗi** | Scope 404/409 · empty **200**. |

---

### 5.5 F-REC-APP-03-D — Soft-delete evaluation (**UPGRADE**)

| | |
|--|--|
| **METHOD / path** | **`DELETE /api/hrm/recruitment/candidate-evaluations/:evaluationId`** |
| **Mục đích** | Archive đánh giá (O11) — **không** hard wipe SoT. |
| **Nghiệp vụ xử lý** | (1) Scope assert. (2) `UPDATE … SET archived_at=NOW()` WHERE id + company · return `{ id, archived_at }`. (3) Legacy hard `DELETE` path **FORBIDDEN** as product SoT — remove/replace in Dev residual. (4) Mutate `FR06_LEGACY_POOL` beyond archive ⇒ **400** `HRM-REC-EVAL-LEGACY-READONLY` (optional allow archive-only). |
| **Tham chiếu bước SRS** | O11 · VAL-REC-ME-11 · DATA-01 §5.2. |
| **Response** | `{ id, archived_at }` · **`HRM-REC-EVAL-200`**. |
| **Lỗi** | `HRM-REC-EVAL-404` · scope · LEGACY-READONLY. |

---

### 5.6 F-REC-APP-03-T — Evaluation criteria templates (**UPGRADE** · cite)

| | |
|--|--|
| **METHOD / path** | `GET /api/hrm/recruitment/evaluation-criteria-templates` · residual soft replace (prefer soft-retire + upsert — **DENY** wipe-all DELETE as sole SoT) |
| **Mục đích** | Picker tiêu chí đánh giá tenant (O4) — paper `criteria_json` = logical aggregate of active rows. |
| **Nghiệp vụ** | List `is_active=true` ∧ `archived_at IS NULL` · company scope U19. |
| **Tham chiếu bước SRS** | FR-06 #2 · AC-REC-06-07 · VAL-REC-ME-05 · **O4**. |
| **Codes** | **`HRM-REC-EVAL-200`** RETAIN. |

---

### 5.7 F-REC-APP-02 — Đổi stage sau kết quả (**RETAIN** · sole writer)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/recruitment/candidates/:id/transitions`** (+ `GET …/stage-history`) |
| **Mục đích** | Ghi giai đoạn pipeline **sau** Pass/Fail (FR-06 Thành công / #4) — **không** redefine REC-05. |
| **Nghiệp vụ** | **RETAIN** sealed F.1 REC-05-CLUSTER-API-01 — EFF assert · reject note · reverse CFG · atomic history. Mail/eval **must not** call this implicitly. |
| **Tham chiếu bước SRS** | FR-06 Thành công · AC-REC-06-04 · ALT-04 · EX-07 · VAL-REC-ME-08 · **O7/O9**. |

---

### 5.8 Peers must_keep (cite — **không** redefine)

| F-id | Note |
|------|------|
| F-REC-IV-01..04 / SCHED-SOFT | 06a TERMINAL source for round gate · **DENY reopen J-IV** |
| F-REC-UV-YCTD-* / CMP | Attach prerequisite · **≠** FR-06 DONE |
| F-REC-CV-SCAN-* | REC-04 sealed · **DENY reopen J-CV-04** |
| F-REC-CAT-STG/EFF-* | Picker for optional post-eval transition |
| F-REC-HIRE-01 | **OUT** — ≠ mail template `offer` |
| F-REC-CMP compare depth | **OUT** 06b UI this seat |

---

## 6. Display-ready DTO dictionary (O12)

### 6.1 Mail enqueue / outbox item

```text
MailOutboxDto = {
  outbox_id: string;
  recruitment_candidate_id: string | null;
  application_id: string | null;
  requisition_id: string | null;
  company_id: string;
  template_code: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  queued_at: string;            // ISO
  sent_at: string | null;
  error_message: string | null;
  to: string[];                 // from to_emails_json
  cc_interviewers: string[];    // from cc_emails_json
  payload?: object | null;
  log: MailLogItemDto[];
};

MailLogItemDto = {
  attempt_no: number;
  result: 'sent' | 'failed';
  error_message: string | null;
  provider_ref: string | null;
  logged_at: string;            // ISO
};
```

### 6.2 Evaluation item

```text
EvaluationDto = {
  id: string;
  company_id: string;
  recruitment_candidate_id: string | null;
  application_id: string | null;
  interview_id: string | null;
  template_id: string | null;
  result: 'pass' | 'fail' | 'pending';
  scores: unknown;              // JSONB
  scores_json: unknown;         // alias of scores for paper bind
  salary_recommendation: number | null;
  overall_feedback: string | null;
  recommendation: string | null;
  evaluated_at: string | null;
  evaluator_name: string | null;
  evaluator_email: string | null;
  total_score: number | null;
  weighted_score: number | null;
  archived_at: string | null;
  row_class?: 'FR06_YCTD' | 'FR06_LEGACY_POOL';
};
```

| Rule | |
|------|--|
| FE invent mail/eval aggregate SoT | **FAIL** VAL-REC-ME-12 |
| List candidates after mail | May expose summary fields if BE adds — **prefer** GET mail for detail |
| After eval F5 | `result` + neo ids must persist |

---

## 7. Error taxonomy (mint · BA/QA assert)

| Code | HTTP | When | UX intent (VI) |
|------|------|------|----------------|
| **`HRM-REC-MAIL-CC-REQUIRED`** *(mint)* | 400 | `interview_invite` thiếu CC / email trống | Bắt buộc CC người phỏng vấn |
| **`HRM-REC-MAIL-TEMPLATE-INACTIVE`** *(mint)* | 400 | template_code inactive / unknown | Mẫu thư không hiệu lực |
| **`HRM-REC-MAIL-NEO-REQUIRED`** *(mint)* | 400 | Outbox thiếu YCTD neo | Hồ sơ chưa gắn YCTD |
| **`HRM-REC-MAIL-VAL-400`** *(mint)* | 400 | to[] invalid / body VAL generic | Kiểm tra địa chỉ / dữ liệu thư |
| **`HRM-REC-MAIL-404`** *(mint · optional)* | 404 | outbox not found in scope | Không tìm thấy thư |
| **`HRM-REC-MAIL-PROVIDER-FAIL`** *(mint · optional)* | 502/400 | Provider fail **after** persist failed | Gửi thất bại — giữ nháp/failed · **không** đổi giai đoạn |
| **`HRM-REC-MAIL-201` / `200`** *(mint envelope)* | 2xx | Success enqueue / list | — |
| **`HRM-REC-EVAL-PASSFAIL-REQUIRED`** *(mint)* | 400 | Chốt thiếu pass\|fail | Chọn Đạt hoặc Không đạt |
| **`HRM-REC-EVAL-NEO-REQUIRED`** *(mint)* | 400 | Thiếu YCTD neo / pool-only chốt | Đánh giá phải gắn UV–YCTD |
| **`HRM-REC-EVAL-ROUND-GATE`** *(mint)* | 400 | Eval khi còn ACTIVE / chưa TERMINAL | Kết thúc lịch phỏng vấn trước khi đánh giá vòng mới |
| **`HRM-REC-EVAL-LEGACY-READONLY`** *(mint)* | 400 | Mutate FR06_LEGACY_POOL as FR-06 | Bản ghi cũ chỉ đọc |
| **`HRM-REC-EVAL-404`** | 404 | **RETAIN** | Không tìm thấy đánh giá |
| **`HRM-REC-EVAL-200` / `201`** | 2xx | **RETAIN** family | — |
| `HRM-VAL-400` | 400 | Paper alias interviewer email — may map to MAIL-CC | — |
| `HRM-REC-STAGE-*` | 400 | Stage invent / reject / reverse (**RETAIN** REC-05) | ≠ mail/eval |
| `HRM-REC-IV-409-ACTIVE` / `IV-400-STAGE-DISALLOW` | 409/400 | IV gates (**RETAIN** 06a) | ≠ ROUND-GATE (eval) |
| Scope | 409/404 | Ngoài phạm vi pháp nhân | — |

**Mapping note:** ROUND-GATE (eval) **≠** IV-409-ACTIVE (create schedule) — different surfaces; both RETAIN peer semantics.

---

## 8. Scope parity (U19)

| Surface | Resolver |
|---------|----------|
| `GET /candidates` / `GET /candidates/:id` | `resolveHrmListScope` + company filter |
| `POST/GET …/candidates/:id/mail` | Same + `assertResourceInHrmScope` on Lane A |
| `GET …/mail-outbox/:id` | Same company as outbox |
| `GET/POST/DELETE …/candidate-evaluations*` | Same scope on neo Lane A / application |
| `POST …/candidates/:id/transitions` | REC-05 RETAIN |
| Templates list | Company catalog scope |

**Invariant ME-S-SCOPE:** list candidates **=** get-by-id **=** mail enqueue/log **=** eval list/submit.  
**FAIL** silent cross-tenant mail/eval.

**Persona:** Group CEO rollup in-scope only; Member CEO / HRBP membership narrow — same resolver.

**Journey flag (U19):** J-HRM-REC-06-01..04 DRAFT — list returns id but mail/eval 404 under `main` = **scope_parity** residual.

---

## 9. ba-data — **ALREADY CONFIRMED** (pointer)

| Topic | Decision |
|-------|----------|
| Mail tables | DATA-01 **ADD** `public.rec_mail_outbox` + `public.rec_mail_log` |
| Eval UPGRADE | DATA-01 neo columns + `archived_at` + `salary_recommendation` + `evaluated_at` |
| Legacy class | `FR06_LEGACY_POOL` read-only / exclude 06b |
| Soft-delete | `archived_at` prefer |
| This API seat | **Does not** invent alternate physical name / dual table |
| Dev-BE | Implement ensureSchema + migrate per DATA-01 **with** this F.1 |

---

## 10. Client API_DESIGN DOC-DELTA (pointer)

Append to `API_DESIGN_HRM_ENTERPRISE.md` (client) when ba-docs wave runs — **this file is SoT for Dev unlock**:

| F-id | Physical | SRS bước |
|------|----------|----------|
| **F-REC-MAIL-01** ADD | `POST …/candidates/:id/mail` · `GET …/mail` | FR-06 Diễn biến **#1** |
| **F-REC-APP-03** UPGRADE | `POST/GET/DELETE …/candidate-evaluations*` | FR-06 Diễn biến **#2** |
| **F-REC-APP-02** RETAIN | `POST …/transitions` | FR-06 Thành công / #4 |

Paper `/rec/…/mail` · `/interview-evals` remains **alias**.

---

## 11. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | GWC REC-06 ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate · stamp **`REC06AQC2-*`** · J-IV-* |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · **`REC04QC1-MSL1LU4H`** · J-CV-04-* |
| must_keep W7 | REC-05 transitions/history · **`REC05QC1-MSL35D49`** · J-STG-05-* |
| must_keep | UV-YCTD · CAT STG/EFF · CMP stub · U19 · LIVE eval route family as **upgrade base** · APP-02 sole stage |
| **DENY** | Nest `/rec` dual · second mail/eval SoT · REC-03 Campaign · pool eval as FR-06 DONE · Kanban `offer` alone = DONE · seed · honesty flip · invent beyond BA/SRS · apps/** this seat · reopen sealed J-* / W1–W7 without regression · claim hire/06b UI = FR-06 DONE · mail writes stage · hard DELETE expand |

---

## 12. Dev unlock packet

### 12.1 Dev-BE (`PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01`)

1. ensureSchema **ADD** `rec_mail_outbox` + `rec_mail_log` per DATA-01 §4.
2. **UPGRADE** `candidate_evaluations` columns/CHK/indexes + templates `archived_at` per DATA-01 §5.
3. **ADD** `POST/GET …/candidates/:id/mail` (+ optional `GET mail-outbox/:id`) — CC VAL · template CFG · MAIL-LOG append · **no** stage mutate.
4. **UPGRADE** `POST/GET/DELETE candidate-evaluations*` — YCTD neo · Pass\|Fail · ROUND-GATE · soft `archived_at` · legacy read-only.
5. Mint codes §7 · RETAIN `HRM-REC-EVAL-200/201/404`.
6. CFG read `recruitment.eval.allow_draft` default **false**.
7. U19 jest: list=get=mail=eval; CC required; mail fail no stage; Pass/Fail; round gate; neo required; soft-delete; regression APP-02 / IV / REC-04 / UV-YCTD.
8. **DENY** Nest `/rec` controller · second SoT · seed · honesty · reopen sealed J-* rewrite.

### 12.2 Dev-FE (`PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01`)

1. UV detail theo YCTD → **Gửi thư** → **POST …/candidates/:id/mail** physical `/recruitment/` · F5 outbox+log.
2. `interview_invite` form: CC interviewer required · toast VI on `HRM-REC-MAIL-CC-REQUIRED`.
3. **Đánh giá** → Pass\|Fail chốt → **POST candidate-evaluations** · neo YCTD · toast PASSFAIL / ROUND-GATE / NEO.
4. After result → optional **POST transitions** (APP-02) + Timeline — **separate** Network call.
5. **no** Nest `/rec` SoT · **no** Campaign · **no** claim pool eval / Kanban offer = FR-06 DONE · **no** seed.

---

## 13. Validation plan (QA after Dev)

| Gate | PASS when |
|------|-----------|
| L0/L1 | Stack + mail/eval 2xx/4xx mint codes |
| L2.5 | **J-HRM-REC-06-01..04** browser U65 — no seed |
| Network | Path `/recruitment/` · mail ≠ transitions · ≥1 log after enqueue · Pass/Fail persist F5 |
| Honesty | Flags remain false · C-SLICE · **DENY** reopen J-STG-05 / J-IV / J-CV-04 rewrite |

---

## 14. Exit / handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-api-01.md` |
| **Unlocks** | Execution residual mail outbox+log + YCTD eval Pass/Fail + soft-delete |
| **Does not unlock** | Honesty flips · REC-03 · Nest `/rec` dual · module REC UAT · reopen sealed J-* · REC-07 · 06b matrix UI |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md · DATA-01 · BA-01 O1–O12
entry_criteria: F.1 CONFIRMED; honesty false; C-SLICE; U65; cấm Nest /rec dual · second SoT · Campaign · pool eval DONE · seed · honesty flip · reopen sealed J-*
MISSION: Implement physical Nest /api/hrm/recruitment/* residual — ADD POST/GET candidates/:id/mail (+ mail-outbox) on rec_mail_outbox+log; UPGRADE candidate-evaluations* YCTD neo + Pass/Fail + ROUND-GATE + soft archived_at; mint HRM-REC-MAIL-* / HRM-REC-EVAL-*; RETAIN APP-02 sole stage; U19; jest + ensureSchema per DATA-01. Parallel FE-01 bind mail+eval UI.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-be-01.md · READY_FOR_QA
cấm: Nest /rec dual · second SoT · pool eval DONE · Campaign · seed · honesty flip · reopen sealed J-* · claim hire/06b = FR-06 DONE
```

Parallel FE:

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
lane: execution · dev-fe
… bind Gửi thư + Đánh giá Pass/Fail on physical /recruitment/ only · F5 · toast mint codes · optional transitions after eval · DENY /rec dual · pool/Kanban DONE claim
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md · READY_FOR_QA
```

---

## completion_report

- **Closed:** F.1 physical Option A CONFIRMED — **ADD F-REC-MAIL-01** `POST/GET …/candidates/:id/mail` (+ outbox/log) · **UPGRADE F-REC-APP-03** `candidate-evaluations*` YCTD-bound · Pass/Fail · ROUND-GATE · soft-delete · display-ready DTO · VAL interview_invite CC · mail fail ≠ stage · mint `HRM-REC-MAIL-*` · `HRM-REC-EVAL-*` · U19 ME-S-SCOPE · **RETAIN APP-02** sole stage writer · paper `/rec` alias · ba-data already CONFIRMED · DENY Nest dual / second SoT / pool DONE / Campaign / seed / honesty / reopen sealed J-*.
- **Residual:** Dev-BE/FE implement · QA U65 J-HRM-REC-06-* · QC GWC C-SLICE.
- **O1/Q-EVAL-PATH:** Physical `/recruitment/candidates/:id/mail` + `candidate-evaluations*` only.
