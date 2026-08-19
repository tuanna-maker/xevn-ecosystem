# PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01 — Physical DB · Append-only stage history (Option A · O2/O4)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-7 seat **#9**) |
| **lane** | governance · ba-data |
| **change_mode** | **ADD** ONE history table + **UPGRADE** Lane A open-CHK · **DOC-DELTA only** · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — physical O2 history + O4 open-CHK · SA Option A · BA O1–O9 |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | BA-01 O1–O9 **CONFIRMED** · SA-01 Option **A LOCKED** · peer seal **`REC04QC1-MSL1LU4H`** · UV-YCTD / CAT STG/EFF **RETAIN** |
| **ref_sa** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md) · **O2/O3/O4** · AC-REC-05-* · VAL-REC-STG-* |
| **ref_uv_yctd** | [`PO-HRM-REC-UV-YCTD-DB-01.md`](./PO-HRM-REC-UV-YCTD-DB-01.md) · ONE soft FK `requisition_id` |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§2.6** `rec_candidate_stage_history` · §2.4a catalog · §2.5 application |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-05** · **BR-BP-CV-02** · **BR-PLT-05** cite |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |
| **ack_status** | **PASS_TO_PM CONFIRMED** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| History SoT | **ADD** ONE append-only table **`public.rec_candidate_stage_history`** |
| Paper name | §2.6 `rec_candidate_stage_history` = **same physical** (ABSENT AS-IS → CREATE) |
| Alternate logical | `candidate_stage_history` = **alias only** — **DENY** second physical CREATE |
| Primary FK | **`recruitment_candidate_id` UUID NOT NULL** → Lane A `recruitment_candidates(id)` |
| Optional FK | **`application_id` UUID NULL** — soft neo to N–N UV×YCTD application when present · **DENY** hard FK to `candidate_applications.job_posting_id` SoT |
| Paper §2.6 `application_id` NOT NULL | **Logical alias of link** — physical maps via Lane A id (+ optional app neo); **not** dual SoT |
| Stage home | **RETAIN** current stage on Lane A `recruitment_candidates.status` (DTO `stage`) — **O3** |
| Open catalog (O4) | **DROP** closed-six `chk_recruitment_candidates_status` · **REPLACE** open non-empty key CHK (no `IN (six)` ceiling) |
| Catalog SoT | **RETAIN** ONE `rec_pipeline_stage` — **DENY** second catalog table |
| Nest path | Physical prefer `/api/hrm/recruitment/*` — API seat (not this DOC) · paper `/rec/*` alias only |
| REC-03 / postings | **OUT / DENY** as FR-05 SoT |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen REC-04 J-* / W1–W6 |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `rec_candidate_stage_history` | **`public.rec_candidate_stage_history`** | **ADD** (ABSENT AS-IS) |
| `candidate_stage_history` | same table | **Alias only** — **DENY** dual CREATE |
| `application_id` (paper NOT NULL) | Link SoT = Lane A `recruitment_candidate_id` (+ optional `application_id`) | **EXPAND** nullability vs paper — see §4.2 |
| `rec_candidate_application` | Lane A row **or** future N–N app with `requisition_id` | **RETAIN** UV-YCTD · **DENY** posting-apps SoT |
| Current `stage` | `recruitment_candidates.status` | **UPGRADE** open CHK · **RETAIN** column name |
| `rec_pipeline_stage` | `public.rec_pipeline_stage` | **RETAIN must_keep** |
| `/api/hrm/rec/…/transitions` | `/api/hrm/recruitment/candidates/:id/transitions` | **Alias only** — API seat |

```text
  rec_pipeline_stage (ONE catalog — RETAIN)
        │ EFF assert (app) when EFF>0
        ▼
  recruitment_candidates  ◄── Lane A YCTD-bound link SoT (O3)
        RETAIN: id · company_id · requisition_id NOT NULL · status · …
        UPGRADE: DROP closed-six CHK → open non-empty status key (O4)
                │
                │ APPEND per successful transition (atomic with UPDATE status)
                ▼
  rec_candidate_stage_history  ◄── ONE append-only SoT (O2)
        ADD: recruitment_candidate_id NOT NULL (FK Lane A, NO CASCADE wipe)
             application_id NULL (soft neo — DENY posting-apps hard FK)
             company_id · from_stage · to_stage · note · desired_salary?
             changed_by · changed_at
        DENY: UPDATE/DELETE product path · second history table
```

**Label lock:** «Lịch sử trạng thái UV–YCTD» / paper §2.6 / F-REC-APP-02 timeline = **same** physical `rec_candidate_stage_history`.  
**Spine lock:** History rows belong to **Lane A link** — not pool person stage, not Campaign apps.

---

## 3. AS-IS baseline (Nest facts — read-only)

| Object | AS-IS | Gap (Wave-7 O2/O4) |
|--------|-------|---------------------|
| Lane A table | `CREATE TABLE … recruitment_candidates` · `requisition_id NOT NULL REFERENCES job_requisitions` | — |
| Current stage | `status TEXT NOT NULL DEFAULT 'new'` | — |
| Status CHK | **`chk_recruitment_candidates_status` IN (`new`,`screening`,`interview`,`offer`,`hired`,`rejected`)** | **Closed six ceiling** vs BR-PLT-05 / EFF N+1 — **FAIL O4** |
| History table | **ABSENT** (grep ensureSchema) | **ADD** append-only — **FAIL O2** without |
| Catalog | `rec_pipeline_stage` + open `stage_key` | **RETAIN** |
| Lane B apps | `candidate_applications` + `job_posting_id` | **OUT** FR-05 SoT |
| Pool stage | `PATCH …/candidates-pool/:id/stage` | **≠** FR-05 timeline SoT |
| Source | `recruitment.service.ts` ensureSchema · `rec-pipeline-stage.service.ts` | Dev after API CONFIRMED |

**FORBIDDEN invent this seat:** second history table · second catalog · Nest `/rec` dual · hard FK history → `candidate_applications` · CASCADE wipe history · seed history for U65 · reopen closed-six as sole SoT when EFF>0.

---

## 4. ADD — `public.rec_candidate_stage_history` (O2)

### 4.1 Columns (normative)

| Cột | Kiểu | Null | Default | Ý nghĩa | Maps |
|-----|------|------|---------|----------|------|
| **`id`** | uuid | **NO** | app/`gen_random_uuid()` | PK | BA O2 · VAL-REC-STG-07 |
| **`company_id`** | text | **NO** | — | Scope denorm (copy from Lane A at append) · U19 | VAL-REC-STG-01/13 |
| **`recruitment_candidate_id`** | uuid | **NO** | — | **Primary FK** → Lane A YCTD-bound link | O3 · AC-REC-05-02 |
| **`application_id`** | uuid | **YES** | NULL | Optional soft neo to N–N UV×YCTD application when row exists | BA O2 · ALT-05 |
| **`from_stage`** | text | **YES** | NULL | Prior `stage_key` (may be retired — BR-PLT-04) | AC-REC-05-03 · ALT-06 |
| **`to_stage`** | text | **NO** | — | New `stage_key` (may later retire) | VAL-REC-STG-03 |
| **`note`** | text | **YES** | NULL | Reject reason / comment — **required at app** when reject class | O5 · VAL-08 |
| **`desired_salary`** | numeric | **YES** | NULL | Optional snapshot (BR-BP-CV-02 depth) | AC-REC-05-08 · VAL-20 |
| **`changed_by`** | uuid | **YES** | NULL | Actor user/membership ref (soft) | AC-03 |
| **`changed_at`** | timestamptz | **NO** | `NOW()` | Event time | AC-03 · BR-BP-CV-02 |

**No** `updated_at` mutate column — append-only. **No** `archived_at` on history rows for stage rewrite (history is the audit; closing YCTD must **not** delete rows).

### 4.2 FK / referential rules

| Rule ID | Predicate | Outcome |
|---------|-----------|---------|
| **DV-REC-STG-FK-01** | `recruitment_candidate_id` **REFERENCES** `recruitment_candidates(id)` | Missing parent → **reject INSERT** |
| **DV-REC-STG-FK-02** | FK **WITHOUT** `ON DELETE CASCADE` (prefer **RESTRICT** / NO ACTION) | Delete/wipe Lane A while history exists → **FAIL** BR-BP-CV-02 · EX-15 |
| **DV-REC-STG-FK-03** | `application_id` = **soft** UUID (nullable) — **no** hard `REFERENCES candidate_applications` | Hard posting-apps FK → **FAIL O3** · REC-03 |
| **DV-REC-STG-FK-04** | When N–N application physicalized later with `requisition_id`, soft-target same id; sync stage in **same txn** as Lane A (BA ALT-05) — **not** this seat CREATE of second SoT | Dual write home → **FAIL** |
| **DV-REC-STG-FK-05** | `company_id` on history **must equal** Lane A `company_id` at append (app assert) | Cross-company append → **FAIL U19** |
| **DV-REC-STG-FK-06** | **FORBIDDEN** hard FK / CASCADE from history → `job_postings` / Campaign | REC-03 OUT |

### 4.3 Append-only invariants

| Rule ID | Predicate | Invalid → |
|---------|-----------|-----------|
| **DV-REC-STG-AO-01** | Product path = **INSERT only** | UPDATE history row → **FAIL O2** |
| **DV-REC-STG-AO-02** | No product DELETE of history for stage rewrite | DELETE → **FAIL** BR-BP-CV-02 |
| **DV-REC-STG-AO-03** | Each transition **2xx** ⇒ ≥1 INSERT same txn as Lane A `status` UPDATE | Stage without history → **FAIL** VAL-24 / EX-06 |
| **DV-REC-STG-AO-04** | Close / soft-archive YCTD or Lane A → history **retained** | Cascade wipe → **FAIL** EX-15 |
| **DV-REC-STG-AO-05** | Retired catalog keys **allowed** in `from_stage`/`to_stage` (display history) | Force-null on retire → **FAIL** ALT-06 / BR-PLT-04 |

ensureSchema style (Dev later — **not run this seat**):

```text
CREATE TABLE IF NOT EXISTS public.rec_candidate_stage_history (
  id UUID PRIMARY KEY,
  company_id TEXT NOT NULL,
  recruitment_candidate_id UUID NOT NULL
    REFERENCES public.recruitment_candidates (id),  -- NO ON DELETE CASCADE
  application_id UUID NULL,
  from_stage TEXT NULL,
  to_stage TEXT NOT NULL,
  note TEXT NULL,
  desired_salary NUMERIC NULL,
  changed_by UUID NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rec_candidate_stage_history_to_stage
    CHECK (length(trim(to_stage)) > 0)
);

CREATE INDEX IF NOT EXISTS ix_rec_csh_candidate_changed
  ON public.rec_candidate_stage_history (recruitment_candidate_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS ix_rec_csh_company_changed
  ON public.rec_candidate_stage_history (company_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS ix_rec_csh_application
  ON public.rec_candidate_stage_history (application_id)
  WHERE application_id IS NOT NULL;
```

**FORBIDDEN:** `CREATE TABLE candidate_stage_history` beside this · dual-write to posting-apps history invent · truncate for “cleanup” in product path.

---

## 5. UPGRADE — Lane A open status CHK (O4)

### 5.1 Problem

AS-IS `chk_recruitment_candidates_status CHECK (status IN ('new','screening','interview','offer','hired','rejected'))` rejects any 7th+ EFF `stage_key` (admin STG-02) — **violates** BR-PLT-05 / BA O4 / AC-REC-05-EX-10.

### 5.2 Normative migrate (Dev-BE later — **no run this seat**)

| Step | Action |
|------|--------|
| 1 | `ALTER TABLE public.recruitment_candidates DROP CONSTRAINT IF EXISTS chk_recruitment_candidates_status;` |
| 2 | **ADD** open non-empty key constraint (illustrative name): `chk_recruitment_candidates_status_open CHECK (status IS NOT NULL AND length(trim(status)) > 0)` |
| 3 | **FORBIDDEN** re-ADD closed `IN (six)` as sole SoT when EFF>0 |
| 4 | Value membership when EFF>0 = **app assert** ∈ `rec_pipeline_stage` effective (`HRM-REC-STAGE-UNKNOWN`) — same pattern as sealed catalog consumers |
| 5 | Existing six starter values **remain valid keys** (not wiped); they are **not** a ceiling |

### 5.3 Default / create

| Rule | Stamp |
|------|--------|
| Create UV–YCTD link | Initial `status` = catalog default / first EFF / starter `new` — **API seat** (RETAIN create peer 05a) |
| Empty EFF | Picker empty + CTA — **no** DB fake starter seed (**O4** · U65) |

### 5.4 Sync note (ALT-05)

When an N–N application row exists for same YCTD: UPDATE `application.stage` **in same transaction** as Lane A `status` + history INSERT. Physical N–N home **not invented here** — cite UV-YCTD RETAIN.

---

## 6. Lifecycle (data layer)

| Event | Persist | Forbidden |
|-------|---------|-----------|
| Transition happy | UPDATE Lane A `status` + INSERT history | Overwrite-only status |
| Reject class | Same + `note` non-empty (app) | Empty note commit |
| Reverse (CFG allow) | Same append (from/to swapped semantics) | Silent skip history |
| Catalog retire key | History rows keep old keys | CASCADE null/wipe history |
| YCTD close | Soft FK on Lane A retained; history readable | CASCADE delete history |
| Hard DELETE history | **FORBIDDEN** product | Soft policy N/A for audit rows |

---

## 7. Validation matrix — column ↔ VAL/AC (data layer)

| VAL / DV | Physical rule | Valid | Invalid → |
|----------|---------------|-------|-----------|
| **VAL-REC-STG-01** | `company_id` in scope | Denorm match Lane A | Out → 404/409 (API) |
| **VAL-REC-STG-02** | FK → Lane A only | `recruitment_candidate_id` NOT NULL | Posting-apps sole → **FAIL O3** |
| **VAL-REC-STG-03** | `to_stage` when EFF>0 | ∈ EFF (app) | UNKNOWN 400 |
| **VAL-REC-STG-05** | Open persist | Open CHK on Lane A | Closed-six reject 7th → **FAIL O4** |
| **VAL-REC-STG-06** | Append ≥1 / 2xx | INSERT history | Overwrite-only → **FAIL O2** |
| **VAL-REC-STG-07** | Columns + FK | §4.1 present | Missing FK → **FAIL** |
| **VAL-REC-STG-08** | Reject `note` | App required | Empty → REJECT-REASON (API) |
| **VAL-REC-STG-11** | One history / one catalog | Sole tables | Dual → **FAIL** |
| **VAL-REC-STG-12** | REC-03 OUT | No posting FK SoT | Campaign history → **FAIL** |
| **VAL-REC-STG-13** | U19 | Same scope list=get=transition=timeline | Mismatch → **FAIL** |
| **VAL-REC-STG-17** | Close YCTD | History retained | Cascade wipe → **FAIL** |
| **VAL-REC-STG-24** | Atomic txn | Stage+history | Stage alone → **FAIL** |
| **DV-REC-STG-FK-*** | §4.2 | Soft neo app_id | Hard posting FK → **FAIL** |
| **DV-REC-STG-AO-*** | §4.3 | Append-only | UPDATE/DELETE → **FAIL** |
| **VAL-REC-STG-14** | U65 | FE-only | Seed = **FAIL** |
| **VAL-REC-STG-15** | Honesty | flags false | Flip = **FAIL O8** |

### Error codes (mint / seal in API-01 — pointer)

| Code | HTTP | When |
|------|------|------|
| `HRM-REC-STAGE-UNKNOWN` | 400 | Invent / OOS `to_stage` when EFF>0 (**RETAIN**) |
| `HRM-REC-STAGE-REJECT-REASON` | 400 | Reject thiếu lý do (**mint API**) |
| `HRM-REC-STAGE-REVERSE-FORBIDDEN` | 400 | Reverse CFG deny (**mint API**) |
| `HRM-REC-STAGE-HISTORY-FAIL` | 500/409 | Persist history fail → rollback stage (**mint optional**) |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | IV soft-gate (**RETAIN** · ≠ UNKNOWN) |
| Scope | 404/409 | U19 |

---

## 8. Traceability — requirement → DB → API → FE → Test

| Requirement | DB (this DOC) | API (next) | FE / Journey | Test evidence |
|-------------|---------------|------------|--------------|---------------|
| **FR-UC-BP-REC-05** #1–#2 | History table + open CHK | F-REC-APP-02 + GET stage-history | Transition + Timeline F5 | **J-HRM-REC-STG-05-01..04** DRAFT |
| **BR-BP-CV-02** | Append-only · retain on close | Atomic write | Timeline không mất | AC-REC-05-03 · EX-15 |
| **O2** BA | ADD `rec_candidate_stage_history` | Timeline DTO | — | VAL-06/07/24 |
| **O3** BA | FK `recruitment_candidate_id` | POST `…/candidates/:id/transitions` | candidate_id SoT | AC-02 · EX-08/09 |
| **O4** BA | Drop closed-six CHK | EFF assert | Picker N+1 | EX-10 |
| **O5/O6** | `note` column · append on reverse | REJECT/REVERSE mint | Form | AC-04 · ALT-02 · EX-02/03 |
| **BR-PLT-05** | Open keys | UNKNOWN on invent | — | VAL-05 |
| Catalog peer | RETAIN `rec_pipeline_stage` | EFF-01 | Picker | O7 |
| REC-04 peer | No schema touch scan flags | — | — | **DENY reopen** J-CV-04 |
| Paper §2.6 | Physical CREATE + DOC-DELTA nullability | Alias `/rec` | — | DENY dual Nest |
| **scope_parity U19** | `company_id` denorm + Lane A FK | list=get=transition=timeline | Deep link | EX-04 · STG-S-SCOPE |

**J-* linkage (U19):** timeline GET by `candidate_id` must use **same** `resolveHrmListScope` as list/get/transition — **scope_parity** on `recruitment_candidate_id` / `company_id`.

---

## 9. Client DOC-DELTA pointer (`DB_DESIGN_HRM_ENTERPRISE.md` §2.6)

| Change | Detail |
|--------|--------|
| **CONFIRM ADD physical** | `public.rec_candidate_stage_history` (was paper-only / ABSENT Nest) |
| **EXPAND** | Primary link FK = **`recruitment_candidate_id` NOT NULL** (Lane A) — paper `application_id` NOT NULL = **logical alias of YCTD-bound link** |
| **EXPAND** | Physical `application_id` **NULLABLE** soft neo when N–N app exists |
| **EXPAND** | Columns `company_id` · `desired_salary` (optional) beyond minimal paper list |
| **EXPAND** | Lane A `recruitment_candidates.status` — **FORBIDDEN** closed `CHECK IN (six)` when EFF open-catalog active; open non-empty key |
| **KEEP** | Append-only · retired keys in history · soft-delete catalog only · ONE `rec_pipeline_stage` |
| **FORBIDDEN** | Dual history · dual catalog · Nest `/rec` dual · REC-03 posting SoT · seed · honesty flip · CASCADE wipe |

*(Client file edit = optional follow-up by ba-docs/sa; **this program SoT** = this DATA-01 file.)*

---

## 10. Honesty & must_keep / DENY

| Item | Rule |
|------|------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| C-SLICE | DATA CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| must_keep W1–W3 | HC / YCTD / dashboard |
| must_keep W4 | IV one-active + soft-gate DISALLOW |
| must_keep W5 | JD `job-templates` |
| must_keep W6 | REC-04 scan/posted · stamp **`REC04QC1-MSL1LU4H`** · J-CV-04-* |
| must_keep | `rec_pipeline_stage` · Lane A `requisition_id` · UV-YCTD · CMP · U19 · soft-delete policy on masters |
| **DENY** | Dual history/catalog · Nest `/rec` dual · REC-03 · posting-apps history SoT · pool stage as FR-05 SoT · closed-six sole · seed · honesty flip · reopen REC-04 J-* / W1–W6 without regression · `apps/**` this seat · claim 05a create = FR-05 DONE |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **next_owner** | **sa** — API F.1 UPGRADE **F-REC-APP-02** + GET stage-history + mint `HRM-REC-STAGE-*` residual |
| **Does not unlock** | Dev `apps/**` until API CONFIRMED · honesty flips · REC-03 · Nest dual |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-data-01.md` |

### Assumptions

- BA O2/O3/O4 CONFIRMED; SA Option A LOCKED; UV-YCTD + CAT LIVE.
- Paper `/rec/*` remains alias — no Nest dual.
- N–N application physicalization (if still partial) does **not** block history CREATE on Lane A FK.

### Open / non-blocking

| ID | Note |
|----|------|
| Q-REC-STG-APP-SYNC | Exact N–N application table name when soft `application_id` bound — API/UV peer |
| Q-REC-STG-CFG-KEY | `allow_reverse_stage` settings key — API/CFG seat |
| Partial DB trigger deny UPDATE | Optional harden — app policy sufficient GĐ1 |

---

## completion_report

- **Closed:** DOC-DELTA physical CONFIRMED — **ADD** ONE `public.rec_candidate_stage_history` (append-only) with primary FK `recruitment_candidate_id` + optional soft `application_id`; **UPGRADE** Lane A DROP closed-six CHK → open non-empty status; RETAIN ONE catalog `rec_pipeline_stage` · UV-YCTD · REC-04; DENY dual history/catalog · Nest `/rec` · REC-03 · seed · honesty flip · apps/**.
- **Residual:** **sa** API F.1 — F-REC-APP-02 UPGRADE + GET `…/stage-history` + mint REJECT-REASON / REVERSE-FORBIDDEN + display-ready DTO; then Dev after contracts; QA U65 J-HRM-REC-STG-05-*.
- **O2/O4 stamp:** History ADD + open-CHK migrate **CONFIRMED** — overwrite-only / closed-six sole **REJECTED**.
