# PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01 — Physical DB · Mail outbox+log ADD + Eval YCTD UPGRADE (Option A · O2/O3/O11)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-8 seat **#10**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** ONE mail outbox + ONE append log · **UPGRADE** LIVE eval (+ templates) YCTD-bound · **DOC-DELTA only** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O2 eval home + O3 mail + O11 soft-delete · SA Option A · BA O1–O12 |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-7 REC-05 **SEALED** stamp **`REC05QC1-MSL35D49`** · REC-06a / REC-04 **RETAIN** |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md) · **O2/O3/O5/O11** · AC-REC-06-* · VAL-REC-ME-* |
| **ref_uv_yctd** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) · ONE soft FK `requisition_id` |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.7** eval · **§2.9** mail |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06** · **BR-BP-REC-MAIL-01** / **BR-BP-MAIL-01** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| Mail SoT | **ADD** ONE outbox **`public.rec_mail_outbox`** + ONE append log **`public.rec_mail_log`** |
| Paper §2.9 names | Same physical (ABSENT AS-IS → CREATE) |
| Eval SoT | **UPGRADE** LIVE **`public.candidate_evaluations`** — **DENY** second eval table / greenfield `rec_interview_evaluation` CREATE |
| Eval templates | **UPGRADE** LIVE **`public.evaluation_criteria_templates`** — paper `rec_interview_eval_template` = **logical alias** |
| YCTD home (O2) | NEW FR-06 rows **require** `recruitment_candidate_id` **and/or** `application_id` + `company_id` · optional `interview_id` → `recruitment_interviews` |
| Legacy pool rows | `candidate_id`→Lane B only, **no** YCTD neo → **read-only / exclude 06b** (migrate rule §6) — **≠** FR-06 score SoT |
| Soft-delete (O11) | Prefer `archived_at` on outbox + eval (+ templates soft-retire) · **DENY** expand hard DELETE as SoT |
| Nest path | Physical prefer `/api/hrm/recruitment/*` — API seat · paper `/rec/*` = alias only |
| REC-03 / Campaign | **OUT / DENY** — **no** `rec_campaign*` / `job_postings` tables this seat |
| Stage writer | **RETAIN** REC-05 APP-02 — mail/eval **do not** own stage columns |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen REC-05/06a/04 J-* |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `rec_mail_outbox` | **`public.rec_mail_outbox`** | **ADD** (ABSENT AS-IS) |
| `rec_mail_log` | **`public.rec_mail_log`** | **ADD** append-only |
| `rec_interview_evaluation` | **`public.candidate_evaluations`** | **UPGRADE** YCTD home — alias only |
| `rec_interview_eval_template` | **`public.evaluation_criteria_templates`** | **UPGRADE** soft-retire — alias only |
| `application_id` (paper NOT NULL on eval) | Link SoT = Lane A `recruitment_candidate_id` (+ optional soft `application_id`) | **EXPAND** nullability vs paper — see §5 |
| `recruitment_request_id` (mail) | Soft `requisition_id` → `job_requisitions` | Context YCTD |
| `scores_json` | LIVE `scores` JSONB | **RETAIN** column name · DTO alias `scores_json` |
| `/api/hrm/rec/…/mail` · `/interview-evals` | `/api/hrm/recruitment/candidates/:id/mail` · `candidate-evaluations*` | **Alias only** — API seat |

```text
  evaluation_criteria_templates (ONE template SoT — UPGRADE soft-retire)
        │ template_id soft FK
        ▼
  candidate_evaluations  ◄── ONE eval SoT (UPGRADE YCTD)
        ADD: recruitment_candidate_id? · application_id? · template_id?
             salary_recommendation? · evaluated_at? · archived_at
             CHK YCTD-neo OR legacy pool flag
        RETAIN: id · company_id · candidate_id (legacy) · interview_id?
                scores · result · overall_feedback · recommendation · …
        DENY: second eval table · Lane B pool as FR-06 DONE

  recruitment_candidates (Lane A — RETAIN) ◄── preferred mail/eval neo
  recruitment_interviews (06a SEALED)     ◄── optional interview_id
  job_requisitions (YCTD)                ◄── soft requisition_id on outbox

  rec_mail_outbox  ◄── ONE mail SoT (ADD)
        status queued|sending|sent|failed · archived_at soft
                │
                │ APPEND every attempt (incl. retry)
                ▼
  rec_mail_log  ◄── ONE append log (ADD)
        DENY: UPDATE wipe · second mail SoT · Campaign tables
```

**Label lock:** «Thư tuyển / nhật ký gửi» / paper §2.9 / F-REC-MAIL-01 = **same** physical outbox+log.  
**Spine lock:** Mail + eval FR-06 belong to **YCTD-bound UV link** — not pool person sole · not Campaign.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-8 O2/O3/O11) |
|--------|-------|-------------------------|
| Eval table | `CREATE TABLE … candidate_evaluations` · `candidate_id UUID NOT NULL` · `result DEFAULT 'pending'` · **no** `recruitment_candidate_id` / `application_id` / `archived_at` | Wrong spine home · silent pending · hard DELETE — **FAIL O2/O5/O11** |
| List JOIN | `LEFT JOIN public.candidates c ON c.id = e.candidate_id` (Lane B) | Pool person — **≠** FR-06 YCTD SoT |
| Delete | `DELETE FROM public.candidate_evaluations` | Hard wipe — **FAIL O11** |
| Templates | `evaluation_criteria_templates` · `is_active` · replace = DELETE all + INSERT | Soft-retire prefer; paper criteria_json alias |
| Mail outbox/log | **ABSENT** (grep) | **ADD** — **FAIL O3** without |
| Interviews | `recruitment_interviews` SEALED | **RETAIN** optional FK target |
| Lane A | `recruitment_candidates` + `requisition_id` | Preferred neo |
| Campaign | GĐ2 paper only | **OUT** — **DENY CREATE** this seat |
| Source | `recruitment-catalog.service.ts` ensureSchema | Dev after API CONFIRMED |

**FORBIDDEN invent this seat:** second mail outbox · second eval table · Nest `/rec` dual · Campaign/`job_postings` SoT · CASCADE wipe log/eval · seed mail/eval for U65 · claim pool eval = FR-06 DONE.

---

## 4. ADD — `public.rec_mail_outbox` + `public.rec_mail_log` (O3)

### 4.1 `rec_mail_outbox` columns (normative)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`id`** | uuid | **NO** | app/`gen_random_uuid()` | PK · API `outbox_id` | BA O3 · VAL-REC-ME-LOG |
| **`company_id`** | text | **NO** | — | Scope · U19 | VAL-REC-ME-SCOPE |
| **`recruitment_candidate_id`** | uuid | **YES** | NULL | Preferred FK → Lane A when candidate mail path | O1 · AC-REC-06-01 |
| **`application_id`** | uuid | **YES** | NULL | Soft neo to N–N UV×YCTD application when present | Paper §2.9 |
| **`requisition_id`** | uuid | **YES** | NULL | Soft YCTD context (paper `recruitment_request_id`) | O3 dictionary |
| **`template_code`** | text | **NO** | — | CFG: `fail_cv` \| `interview_invite` \| `offer` \| … | O4 · O8 |
| **`to_emails_json`** | jsonb | **NO** | — | `to[]` | AC mail |
| **`cc_emails_json`** | jsonb | **YES** | NULL | `cc_interviewers[]` — **required at app** when invite | BR-BP-MAIL-01 · O8 |
| **`payload_json`** | jsonb | **YES** | NULL | Bind fields | O4 |
| **`status`** | text | **NO** | `'queued'` | `queued`\|`sending`\|`sent`\|`failed` | O3 · O12 |
| **`queued_at`** | timestamptz | **NO** | `NOW()` | Enqueue time | O12 |
| **`sent_at`** | timestamptz | **YES** | NULL | Last success send | O12 |
| **`error_message`** | text | **YES** | NULL | Last fail reason | O8 · O12 |
| **`archived_at`** | timestamptz | **YES** | NULL | Soft-delete / archive (**O11**) | Soft prefer |
| **`created_at`** | timestamptz | **NO** | `NOW()` | Audit | — |
| **`updated_at`** | timestamptz | **NO** | `NOW()` | Status transitions only | — |

**CHK:** `status IN ('queued','sending','sent','failed')` · `length(trim(template_code)) > 0`.  
**Neo rule:** at least one of `recruitment_candidate_id` **or** `application_id` **NOT NULL** on INSERT (app assert; optional DB CHK).

### 4.2 `rec_mail_log` columns (append-only)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`id`** | uuid | **NO** | app/`gen_random_uuid()` | PK | O3 |
| **`outbox_id`** | uuid | **NO** | — | FK → outbox · **NO CASCADE wipe** | MAIL-LOG invariant |
| **`company_id`** | text | **NO** | — | Scope denorm | U19 |
| **`attempt_no`** | int | **NO** | — | 1..n per outbox | Retry APPEND |
| **`provider_ref`** | text | **YES** | NULL | Provider message id | — |
| **`result`** | text | **NO** | — | `sent`\|`failed` | O3 |
| **`error_message`** | text | **YES** | NULL | Attempt-level error | O8 |
| **`logged_at`** | timestamptz | **NO** | `NOW()` | Event time | F5 log |

**No** `updated_at` — append-only. **No** product DELETE/UPDATE of log rows.

### 4.3 FK / referential rules (mail)

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-REC-ME-MAIL-FK-01** | `outbox_id` **REFERENCES** `rec_mail_outbox(id)` **WITHOUT** `ON DELETE CASCADE` | Wipe outbox while log exists → **FAIL** BR-REC-ME-LOG |
| **DV-REC-ME-MAIL-FK-02** | `recruitment_candidate_id` soft/hard → Lane A preferred — **RESTRICT** if hard FK | Missing parent → reject INSERT |
| **DV-REC-ME-MAIL-FK-03** | `application_id` / `requisition_id` = **soft** UUID — **no** hard FK to `candidate_applications` / Campaign | Hard posting FK → **FAIL** REC-03 |
| **DV-REC-ME-MAIL-FK-04** | `company_id` on log **must equal** outbox `company_id` at append | Cross-company → **FAIL U19** |
| **DV-REC-ME-MAIL-FK-05** | **FORBIDDEN** hard FK / columns to `job_postings` / `rec_campaign*` | REC-03 OUT |

### 4.4 Append / soft-delete invariants (mail)

| Rule ID | Predicate | Invalid → |
|---------|-----------|-----------|
| **DV-REC-ME-MAIL-AO-01** | Every enqueue/retry attempt (2xx persist or failed persist) ⇒ ≥1 **INSERT** log | Success without log → **FAIL** BR-REC-ME-LOG |
| **DV-REC-ME-MAIL-AO-02** | Product path log = **INSERT only** | UPDATE/DELETE log → **FAIL O3** |
| **DV-REC-ME-MAIL-AO-03** | Mail fail ⇒ outbox `status=failed` (+ error) · **no** stage column mutate | Fake stage → **FAIL O7/O8** |
| **DV-REC-ME-MAIL-SD-01** | Archive outbox = set `archived_at` · default list excludes archived | Hard DELETE as SoT → **FAIL O11** |
| **DV-REC-ME-MAIL-CC-01** | `template_code=interview_invite` ⇒ non-empty `cc_emails_json` **before** INSERT (app) | Missing CC → **400** · no outbox sent |

ensureSchema style (Dev later — **not run this seat**):

```text
CREATE TABLE IF NOT EXISTS public.rec_mail_outbox (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  recruitment_candidate_id UUID NULL
    REFERENCES public.recruitment_candidates (id),  -- NO ON DELETE CASCADE
  application_id UUID NULL,
  requisition_id UUID NULL,
  template_code TEXT NOT NULL,
  to_emails_json JSONB NOT NULL,
  cc_emails_json JSONB NULL,
  payload_json JSONB NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ NULL,
  error_message TEXT NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rec_mail_outbox_status
    CHECK (status IN ('queued','sending','sent','failed')),
  CONSTRAINT chk_rec_mail_outbox_template
    CHECK (length(trim(template_code)) > 0),
  CONSTRAINT chk_rec_mail_outbox_neo
    CHECK (recruitment_candidate_id IS NOT NULL OR application_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_company_status
  ON public.rec_mail_outbox (company_id, status)
  WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_candidate
  ON public.rec_mail_outbox (recruitment_candidate_id, queued_at DESC)
  WHERE recruitment_candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_rec_mail_outbox_app_tpl
  ON public.rec_mail_outbox (application_id, template_code)
  WHERE application_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.rec_mail_log (
  id UUID PRIMARY KEY,
  outbox_id UUID NOT NULL
    REFERENCES public.rec_mail_outbox (id),  -- NO ON DELETE CASCADE
  company_id TEXT NOT NULL,
  attempt_no INT NOT NULL,
  provider_ref TEXT NULL,
  result TEXT NOT NULL,
  error_message TEXT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rec_mail_log_result CHECK (result IN ('sent','failed')),
  CONSTRAINT chk_rec_mail_log_attempt CHECK (attempt_no >= 1),
  CONSTRAINT uq_rec_mail_log_outbox_attempt UNIQUE (outbox_id, attempt_no)
);

CREATE INDEX IF NOT EXISTS ix_rec_mail_log_outbox
  ON public.rec_mail_log (outbox_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS ix_rec_mail_log_company
  ON public.rec_mail_log (company_id, logged_at DESC);
```

**FORBIDDEN:** `CREATE TABLE mail_outbox` / second log beside these · dual-write Campaign mail · truncate log for «cleanup».

---

## 5. UPGRADE — `public.candidate_evaluations` (+ templates) YCTD-bound (O2 · O5 · O11)

### 5.1 Columns ADD / RETAIN

| Cột | Action | Kiểu / Null | Ý nghĩa |
|-----|--------|-------------|---------|
| `id` · `company_id` | **RETAIN** | uuid / text NOT NULL | PK · U19 |
| `candidate_id` | **RETAIN nullable migrate** | uuid **NULLABLE** after backfill | Legacy Lane B pool person — **not** FR-06 SoT alone |
| **`recruitment_candidate_id`** | **ADD** | uuid NULL → preferred neo Lane A | O2 |
| **`application_id`** | **ADD** | uuid NULL soft neo | Paper application |
| **`template_id`** | **ADD** | uuid NULL → soft/hard → templates | O4 |
| `interview_id` | **RETAIN** | uuid NULL → soft/hard → `recruitment_interviews` | O6 round |
| `evaluator_name` · `evaluator_email` | **RETAIN** | text NULL | Interviewer display |
| `total_score` · `weighted_score` | **RETAIN** | numeric NULL | Aggregate |
| `result` | **UPGRADE semantics** | text NOT NULL | Chốt: **`pass`\|`fail`** required (**O5**); `pending` only explicit draft CFG |
| `overall_feedback` · `recommendation` | **RETAIN** | text NULL | Notes / text đề xuất |
| **`salary_recommendation`** | **ADD** | numeric NULL | SRS «đề xuất lương» |
| `scores` | **RETAIN** | jsonb NOT NULL default `[]` | = paper `scores_json` |
| **`evaluated_at`** | **ADD** | timestamptz NULL | Set on chốt pass\|fail |
| **`archived_at`** | **ADD** | timestamptz NULL | Soft-delete (**O11**) |
| `created_at` · `updated_at` | **RETAIN** | timestamptz | Audit |

### 5.2 CHK / neo rules (eval)

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-REC-ME-EVAL-NEO-01** | NEW FR-06 insert/chốt: `recruitment_candidate_id IS NOT NULL OR application_id IS NOT NULL` | Pool-only insert as FR-06 DONE → **FAIL O2** |
| **DV-REC-ME-EVAL-NEO-02** | When both neo null **and** `candidate_id` set → row class **`FR06_LEGACY_POOL`** | Read-only / exclude 06b (§6) |
| **DV-REC-ME-EVAL-RES-01** | On **chốt** (non-draft): `result IN ('pass','fail')` | Silent pending DONE → **FAIL O5** |
| **DV-REC-ME-EVAL-RES-02** | Optional draft: `result='pending'` **only** if CFG draft allow — default deny as 06b-ready | — |
| **DV-REC-ME-EVAL-FK-01** | Prefer hard FK `recruitment_candidate_id` → Lane A **NO CASCADE** | Wipe parent with scores → **FAIL** |
| **DV-REC-ME-EVAL-FK-02** | `interview_id` soft/hard → `recruitment_interviews` **NO CASCADE** | Round gate at app (**O6**) |
| **DV-REC-ME-EVAL-FK-03** | `application_id` soft — **DENY** hard FK to posting-apps / Campaign | REC-03 |
| **DV-REC-ME-EVAL-SD-01** | Soft-delete = set `archived_at` · list default `archived_at IS NULL` | Hard DELETE product SoT → **FAIL O11** |
| **DV-REC-ME-EVAL-ONE-01** | ONE physical table — paper name = alias | Second `rec_interview_evaluation` CREATE → **FAIL** |

Illustrative migrate (Dev later — **not run**):

```text
ALTER TABLE public.candidate_evaluations
  ADD COLUMN IF NOT EXISTS recruitment_candidate_id UUID NULL
    REFERENCES public.recruitment_candidates (id),
  ADD COLUMN IF NOT EXISTS application_id UUID NULL,
  ADD COLUMN IF NOT EXISTS template_id UUID NULL,
  ADD COLUMN IF NOT EXISTS salary_recommendation NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Make legacy candidate_id nullable (after ensure no NOT NULL blocker for YCTD-only rows)
ALTER TABLE public.candidate_evaluations
  ALTER COLUMN candidate_id DROP NOT NULL;

ALTER TABLE public.candidate_evaluations
  DROP CONSTRAINT IF EXISTS chk_candidate_evaluations_yctd_or_legacy,
  ADD CONSTRAINT chk_candidate_evaluations_yctd_or_legacy CHECK (
    recruitment_candidate_id IS NOT NULL
    OR application_id IS NOT NULL
    OR candidate_id IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS ix_cand_eval_rc_id
  ON public.candidate_evaluations (recruitment_candidate_id, evaluated_at DESC NULLS LAST)
  WHERE archived_at IS NULL AND recruitment_candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_cand_eval_company_result
  ON public.candidate_evaluations (company_id, result)
  WHERE archived_at IS NULL;
```

### 5.3 Templates UPGRADE (`evaluation_criteria_templates`)

| Decision | Stamp |
|----------|--------|
| Physical SoT | **RETAIN** row model (`category` · `name` · `weight` · `default_required_score` · `sort_order` · `is_active`) |
| Paper `criteria_json` | **Logical aggregate** of active rows per company (DTO) — **DENY** second template table |
| Soft-retire | Prefer `is_active=false` **and/or** ADD `archived_at` · **DENY** wipe-all DELETE as sole SoT |
| Replace API | Residual API seat: soft-archive + upsert — not hard wipe (**O11**) |
| Status paper `active\|retired` | Map: active ⇔ `is_active=true` ∧ `archived_at IS NULL` · retired ⇔ soft-retire |

```text
ALTER TABLE public.evaluation_criteria_templates
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
-- Optional: ADD criteria_json JSONB NULL for packed template groups later — NOT required GĐ1 if row model suffices
```

---

## 6. Migrate rule — legacy pool-only eval rows

| Class | Predicate | Product rule |
|-------|-----------|--------------|
| **FR06_YCTD** | `recruitment_candidate_id IS NOT NULL` **OR** `application_id IS NOT NULL` | Writable FR-06 · include 06b later |
| **FR06_LEGACY_POOL** | neo both NULL **AND** `candidate_id IS NOT NULL` | **Read-only** for FR-06 mutate · **exclude** from UC-BP-REC-06b compare · optional admin archive |
| Backfill | If pool `candidates` later linked to Lane A — **optional** later wave sets `recruitment_candidate_id` | **No** silent claim DONE this seat |
| Forbidden | Auto-promote pool scores to YCTD without neo | **FAIL O2** |
| Seed | Invent YCTD neo via seed for U65 | **FAIL U65** |

**06b pointer:** compare matrix consumes **only** `FR06_YCTD` + `result IN (pass,fail)` + `archived_at IS NULL` — OUT implement this seat.

---

## 7. Lifecycle (data layer)

| Event | Persist | Forbidden |
|-------|---------|-----------|
| Enqueue mail | INSERT outbox (`queued`) + INSERT log attempt | Outbox without log |
| Retry send | UPDATE outbox status + **APPEND** log (`attempt_no+1`) | Overwrite prior log |
| Send fail | `status=failed` + error · log `failed` | Stage mutate / fake offer |
| Send ok | `status=sent` · `sent_at` · log `sent` | Success sans log |
| Archive outbox | `archived_at=NOW()` | Hard DELETE SoT |
| Eval draft (CFG) | INSERT/UPDATE `result=pending` · neo YCTD | Silent pending as 06b-ready |
| Eval chốt | `result` pass\|fail · `evaluated_at` · neo YCTD | Pool-only FR-06 DONE |
| Soft-delete eval | `archived_at` | Hard DELETE SoT |
| Round gate | App: prior IV TERMINAL or linked TERMINAL `interview_id` | Dual ACTIVE eval «DONE» |
| Pipeline after result | **No** stage column on eval/mail — APP-02 only | Mail/eval writes Lane A status |

---

## 8. Validation matrix — column ↔ VAL/AC (data layer)

| VAL / DV | Physical rule | Valid | Invalid → |
|----------|---------------|-------|-----------|
| **VAL-REC-ME-MAIL-ONE** | Exactly one outbox + one log table | §4 CREATE | Dual mail → **FAIL O3** |
| **VAL-REC-ME-EVAL-ONE** | UPGRADE LIVE eval only | §5 | Second eval SoT → **FAIL** |
| **VAL-REC-ME-EVAL-HOME** | YCTD neo on FR-06 write | §5.2 | Pool sole → **FAIL O2** |
| **VAL-REC-ME-PASSFAIL** | Chốt pass\|fail | §5.2 | Pending DONE → **FAIL O5** |
| **VAL-REC-ME-LOG** | ≥1 log / attempt | §4.4 | Missing log → **FAIL** |
| **VAL-REC-ME-CC** | invite ⇒ cc_emails | App before INSERT | **400** MAIL |
| **VAL-REC-ME-SOFTDEL** | archived_at prefer | §4.4 / §5.2 | Hard DELETE SoT → **FAIL O11** |
| **VAL-REC-ME-LEGACY** | Pool-only read-only / exclude 06b | §6 | Promote silent → **FAIL** |
| **VAL-REC-ME-NO-CAMPAIGN** | No Campaign tables | §1 | CREATE campaign → **FAIL** |
| **VAL-REC-ME-SCOPE** | company_id U19 | Denorm match | Mismatch → **FAIL** |
| **VAL-REC-ME-STAGE** | No stage on mail/eval | §7 | Stage write here → **FAIL O7** |
| **VAL-REC-ME-NO-SEED** | U65 FE-only | — | Seed → **FAIL** |
| **VAL-REC-ME-HONESTY** | flags false | §11 | Flip → **FAIL O10** |
| **DV-REC-ME-MAIL-*** | §4.3–4.4 | — | — |
| **DV-REC-ME-EVAL-*** | §5.2 | — | — |

### Error codes (mint / seal in API-01 — pointer)

| Code | HTTP | When |
|------|------|------|
| `HRM-REC-MAIL-*` | 400 | Missing CC / template / enqueue VAL (**mint API**) |
| `HRM-VAL-400` | 400 | Paper alias interviewer email |
| `HRM-REC-EVAL-*` | 400/404 | Missing Pass/Fail · wrong home · not found (**EXPAND**) |
| `HRM-REC-EVAL-ROUND-GATE` | 400 | Eval while ACTIVE / not TERMINAL (**mint optional**) |
| `HRM-REC-EVAL-404` | 404 | **RETAIN** family |
| `HRM-REC-STAGE-*` | 400 | Stage invent (**RETAIN** REC-05) — ≠ mail |
| Scope | 404/409 | U19 |

---

## 9. Traceability — requirement → DB → API → FE → Test

| Requirement | DB (this DOC) | API (next) | FE / Journey | Test evidence |
|-------------|---------------|------------|--------------|---------------|
| **FR-UC-BP-REC-06** #1 mail | ADD outbox+log | **F-REC-MAIL-01** ADD | Gửi thư → F5 log | **J-HRM-REC-06-01** DRAFT |
| **FR-UC-BP-REC-06** #2 eval | UPGRADE YCTD eval | **F-REC-APP-03** UPGRADE | Pass/Fail chốt | **J-HRM-REC-06-02** DRAFT |
| **BR-BP-MAIL-01** | cc_emails + log APPEND | VAL CC · MAIL-* | Invite form | AC-REC-06 · EX CC |
| **O2** BA | neo columns + legacy class | Filter YCTD | — | VAL-EVAL-HOME |
| **O3** BA | ADD §4 | POST mail + GET log | — | VAL-LOG |
| **O5** BA | result pass\|fail | Chốt DTO | Form | VAL-PASSFAIL |
| **O6** BA | interview_id optional | Round gate | — | ROUND-GATE |
| **O7** BA | No stage cols | APP-02 sole | Transition optional | J-06-03 |
| **O11** BA | archived_at | Soft DELETE | — | SOFTDEL |
| **O12** BA | status/sent_at/result columns | Display-ready DTO | Bind | — |
| Paper §2.7/§2.9 | Alias map §2 | Alias `/rec` | — | DENY dual Nest |
| REC-05 peer | Untouched history | RETAIN APP-02 | — | **DENY reopen** J-STG-05 |
| REC-06a peer | interview FK target | RETAIN IV | — | **DENY reopen** J-IV |
| REC-04 peer | No scan schema | — | — | **DENY reopen** J-CV-04 |
| **scope_parity U19** | company_id on outbox/log/eval | list=get=mail=eval | Deep link | J-06-04 DRAFT |

**J-* linkage (U19):** mail GET / eval GET by `recruitment_candidate_id` / `application_id` must use **same** `resolveHrmListScope` as list — flag **scope_parity** if list returns id but detail 404 under group CEO `main`.

---

## 10. Client DOC-DELTA pointer (`DB_DESIGN_HRM_ENTERPRISE.md` §2.7 / §2.9)

| Change | Detail |
|--------|--------|
| **CONFIRM ADD physical** | `public.rec_mail_outbox` + `public.rec_mail_log` (§2.9 ABSENT Nest) |
| **CONFIRM UPGRADE physical** | `public.candidate_evaluations` = paper `rec_interview_evaluation` alias · YCTD neo columns |
| **CONFIRM UPGRADE** | `public.evaluation_criteria_templates` = paper `rec_interview_eval_template` alias |
| **EXPAND** | Outbox preferred `recruitment_candidate_id` + soft `application_id`/`requisition_id` |
| **EXPAND** | Eval `application_id` paper NOT NULL = **logical** YCTD link via Lane A id (+ optional app) |
| **EXPAND** | Soft-delete `archived_at` on outbox + eval · templates soft-retire |
| **EXPAND** | Legacy pool-only migrate class §6 |
| **KEEP** | Append-only mail log · status enum · CC rule at API · ONE SoT each |
| **FORBIDDEN** | Dual mail/eval · Nest `/rec` dual · §2.8 Campaign CREATE GĐ1 · seed · honesty flip |

*(Client file edit = optional ba-docs/sa follow-up; **program SoT** = this DATA-01 file.)*

---

## 11. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | DATA CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate · stamp **`REC06AQC2-*`** |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · **`REC04QC1-MSL1LU4H`** |
| must_keep W7 | REC-05 transitions/history · **`REC05QC1-MSL35D49`** · J-STG-05-* |
| must_keep | UV-YCTD · Lane A · CAT STG/EFF · CMP stub · U19 · LIVE eval route family as **upgrade base** |
| **DENY** | Dual mail/eval SoT · Nest `/rec` dual · Campaign tables · pool eval as FR-06 DONE · pool-as-FR-05 · Kanban `offer` alone = FR-06 DONE · hard DELETE as SoT · seed · honesty flip · reopen sealed J-* / W1–W7 without regression · `apps/**` this seat · claim hire/06b = FR-06 DONE |

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **next_owner** | **sa** — API F.1 **F-REC-MAIL-01** ADD + **F-REC-APP-03** UPGRADE · paper `/rec` alias · mint `HRM-REC-MAIL-*` / `HRM-REC-EVAL-*` |
| **Does not unlock** | Dev `apps/**` until API CONFIRMED · honesty flips · REC-03 · Nest dual · 06b/hire |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-data-01.md` |

### Assumptions

- BA O1–O12 CONFIRMED; SA Option A LOCKED; REC-05/06a/04 seals intact; UV-YCTD LIVE.
- Paper `/rec/*` remains alias — no Nest dual.
- N–N application physicalization does **not** block mail/eval CREATE on Lane A preferred FK.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-ME-APP-TABLE | Exact N–N application physical name when soft `application_id` bound — UV peer |
| Q-REC-ME-TPL-PACK | Whether ADD packed `criteria_json` on templates vs row aggregate DTO — API O4 |
| Q-REC-ME-DRAFT-CFG | Settings key allow `pending` draft — API/CFG |
| Partial DB trigger deny UPDATE on log | Optional harden — app policy sufficient GĐ1 |

---

## completion_report

- **Closed:** DOC-DELTA physical CONFIRMED — **ADD** ONE `public.rec_mail_outbox` + ONE append-only `public.rec_mail_log`; **UPGRADE** `candidate_evaluations` (+ `evaluation_criteria_templates`) YCTD-bound neo + soft-delete `archived_at`; legacy pool-only = read-only / exclude 06b; DENY second mail/eval SoT · Nest `/rec` dual · Campaign · seed · honesty flip · apps/**.
- **Residual:** **sa** API F.1 — F-REC-MAIL-01 ADD + F-REC-APP-03 UPGRADE + display-ready DTO + mint MAIL/EVAL codes; APP-02 sole stage writer RETAIN; then Dev after contracts; QA U65 J-HRM-REC-06-*.
- **O2/O3/O11 stamp:** Mail ADD + Eval YCTD UPGRADE + soft-delete prefer **CONFIRMED** — pool-as-FR-06 / dual SoT / hard-delete SoT **REJECTED**.
