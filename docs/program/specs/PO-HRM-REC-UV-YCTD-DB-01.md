# PO-HRM-REC-UV-YCTD-DB-01 — DB_DESIGN delta · UV↔YCTD soft FK + position_key SoT

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-DB-01` |
| **lane** | governance · ba-data |
| **change_mode** | ADD · **NO CODE** `apps/**` · **no migrate** |
| **Date** | 2026-08-06 |
| **Status** | **CONFIRMED DB delta (logical)** — cascade **API_DESIGN** còn mở; **cấm Dev** đến khi API-01 confirm |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **v0.11** · **FR-UC-BP-REC-05a** · **FR-UC-BP-REC-06b** |
| **ref_techspec** | [`PO-HRM-REC-UV-YCTD-TECH-01.md`](./PO-HRM-REC-UV-YCTD-TECH-01.md) **§7** intents · **§2–§3** F.1 |
| **ref_soft_fk_pattern** | [`PO-HRM-JD-YCTD-REF-DB-01.md`](./PO-HRM-JD-YCTD-REF-DB-01.md) — **reuse** ONE physical soft FK / alias · **không** dual-write |
| **Client pointer** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.4–§2.5 + DOC-DELTA (cite — **no wipe** stubs) |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · U65 zero-seed · FORBIDDEN `job_postings` / **REC-03** as UV/compare SoT |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Objective

Confirm **một** soft FK vật lý gắn **application (UV×YCTD) → YCTD**, và khóa **position SoT** derived từ YCTD:

| Plane | Table.column | Role |
|-------|--------------|------|
| **Physical (AS-IS Nest SoT name)** | `requisition_id` | **ONE** soft FK column name — must_keep |
| **Logical (enterprise DB_DESIGN)** | `rec_candidate_application.recruitment_request_id` | **Alias only** — cùng id; **cấm** invent cột physical song song |
| **YCTD target** | `job_requisitions.id` ↔ logical `rec_recruitment_request.id` | Same UUID |

Consumer MVP = **YCTD** (REC-05a / 06b). **Không** mở Campaign / `job_postings` làm SoT gắn UV hoặc so sánh.

---

## 1. Physical soft FK (locked) — application → YCTD

### 1.1 Column contract

| Attribute | Value |
|-----------|--------|
| Soft FK column name (physical) | **`requisition_id`** |
| Logical alias | **`recruitment_request_id`** |
| Type | UUID (TEXT/UUID-as-text OK if Nest DTO string — **same id space**) |
| Nullability (MVP create) | **NOT NULL** on application link (BR-BP-CV-03 · TechSpec §2.3) |
| FK style | **Soft** resolve → `job_requisitions` / `rec_recruitment_request` (app-layer + optional DB REFERENCES) |
| ON DELETE | **NONE** — **FORBIDDEN** `ON DELETE CASCADE` that drops applications when YCTD retires/closes |
| Scope | Same `resolveHrmListScope` + `company_id` as YCTD list/get and UV list/get (U19 `scope_parity`) |
| UQ (logical) | `(candidate_id, recruitment_request_id)` active — already in DB_DESIGN §2.5 |

### 1.2 Logical ↔ physical alias (enterprise)

| Logical | Physical | Rule |
|---------|----------|------|
| `rec_candidate_application.recruitment_request_id` | **`requisition_id`** (same value) | API/DTO may expose either name; serializers map 1:1 |
| `rec_recruitment_request.id` | `job_requisitions.id` | YCTD identity |
| `rec_candidate.id` | `recruitment_candidates.id` **or** pool `candidates.id` (API-01 write-path) | Person SoT; link lives on application |

**AS-IS honesty (read-only mapping — no migrate this wave):**

| AS-IS surface | How `requisition_id` appears today | Role for this confirm |
|---------------|------------------------------------|------------------------|
| Lane A `recruitment_candidates.requisition_id` | NOT NULL → `job_requisitions(id)` | **Valid physical soft FK name** for FR-RC-03 spine create-with-YCTD |
| Lane B `candidate_applications.job_posting_id` | UQ `(candidate_id, job_posting_id)` | **FORBIDDEN** as UV↔YCTD / compare SoT (REC-03 OUT) |
| Enterprise N–N target | Logical §2.5 `rec_candidate_application` | When physical N–N lands: column = **`requisition_id`** only (alias `recruitment_request_id`) — **not** dual columns |

**FORBIDDEN invent:**

| Invent | Why reject |
|--------|------------|
| Second physical column `recruitment_request_id` next to `requisition_id` | Dual SoT / dual write (JD-YCTD lesson · TechSpec §13) |
| Soft FK SoT via `job_posting_id` / `job_postings` | REC-03 OUT · AC-REC-CMP-01 · TechSpec §0 |
| Hard CASCADE YCTD → applications | History / compare / eval must remain readable after YCTD close |
| `campaign_id` required on UV create GĐ1 | §2.8 GĐ2 only |

### 1.3 Soft FK pattern reuse (JD-YCTD)

Same rules as [`PO-HRM-JD-YCTD-REF-DB-01`](./PO-HRM-JD-YCTD-REF-DB-01.md) §1:

```text
ONE physical column name
  + logical alias in DB_DESIGN / DTO
  + soft resolve (no CASCADE wipe history)
  + FORBIDDEN dual physical FK
```

| Wave | Physical column | Logical alias | Parent |
|------|-----------------|---------------|--------|
| JD↔YCTD | `job_template_id` | `job_description_id` | YCTD → JD |
| **UV↔YCTD (this)** | **`requisition_id`** | **`recruitment_request_id`** | Application → YCTD |

---

## 2. Position SoT — derived from YCTD (lock)

### 2.1 Source of truth

| Field | SoT | Notes |
|-------|-----|-------|
| `position_key` | **YCTD** (`rec_recruitment_request.position_key` / AS-IS YCTD catalog key on requisition when present) | Catalog soft key (XBOS/HRM job_titles family) |
| `position_name` | Display-ready from YCTD + catalog join | Never free-text write SoT |
| Free-text `candidates.position` / Lane B `position` | **DEPRECATED as SoT** | May remain nullable legacy column; **cấm** write as position SoT on FR-05a |

### 2.2 Optional denorm (list performance — not second SoT)

| Location | Allowed | Rule |
|----------|---------|------|
| `rec_candidate_application.position_key` (optional ADD later) | Denorm **copy** from YCTD at link time | Read cache only; on mismatch prefer YCTD join; **reject** client free-text overwrite |
| Person `rec_candidate` | **No** position SoT column required | Position lives on application×YCTD |

### 2.3 Write / reject rules

| Rule ID | Condition | Expected |
|---------|-----------|----------|
| **DV-UV-YCTD-01** | Create/link UV thiếu `requisition_id` / `recruitment_request_id` | 400 `HRM-REC-UV-YCTD-REQUIRED` |
| **DV-UV-YCTD-02** | Client gửi `position_key` ≠ YCTD.`position_key` | 400 `HRM-REC-UV-POSITION-MISMATCH` |
| **DV-UV-YCTD-03** | Client gửi free-text `position` as sole SoT (no YCTD / ignore catalog) | **Reject or ignore** — **không** persist as SoT (AC-REC-UV-03) |
| **DV-UV-YCTD-04** | Read list/detail after save + F5 | Expose `position_key`/`position_name` **derived from YCTD** (join or denorm sync) |

**Contract (locked — TechSpec §2.2):**

```text
UvPositionDisplay = {
  recruitment_request_id: string,  // = physical requisition_id
  position_key: string,            // SoT from YCTD
  position_name: string,           // display-ready
  source: 'yctd'                   // never 'free_text'
}
```

---

## 3. Receivable YCTD (data view — for picker / STATUS)

| Plane | Receivable (MVP GĐ1) | Not receivable |
|-------|----------------------|----------------|
| Enterprise lifecycle | `approved` / `open` / `open_for_hire` (API-01 enum lock) | draft, submitted, rejected, filled, cancelled |
| AS-IS `job_requisitions.status` | `open` | `closed`, `on_hold` |

Empty receivable set → **200 `[]`** (not schema error). Bind when not receivable → `HRM-REC-UV-YCTD-STATUS`.

---

## 4. Lifecycle — UV × YCTD application

| Entity | Legal | Invalid |
|--------|-------|---------|
| Application create | Set `requisition_id` to receivable YCTD same scope; stage initial on link | Missing YCTD; posting-id SoT; free-text position SoT |
| Application add (N–N) | Second YCTD different id; UQ per pair | Duplicate UQ → 409; hire-locked rebind (GĐ1 policy) |
| YCTD close / soft-archive | Applications **keep** soft FK; compare/history readable | CASCADE delete applications |
| Eval | Neo **`application_id`** (UV×YCTD) | Scores from `job_postings` / campaign |
| Soft-delete | `archived_at` on candidate/application | Hard-delete while evals/history exist |

**Compare SoT (locked — TechSpec §3):**

```text
Compare filter SoT     = YCTD (requisition_id / recruitment_request_id)
Score SoT              = interview eval on application_id
FORBIDDEN filter SoT   = job_postings / campaign
Empty 0 YCTD / 0 UV    = 200 [] (not fake rows)
```

---

## 5. FORBIDDEN (DB / SoT)

| Forbidden | Why |
|-----------|-----|
| Dual physical `requisition_id` + `recruitment_request_id` columns | Alias only (DV-UV-YCTD-15) |
| `job_postings` / `candidate_applications.job_posting_id` as UV create / compare SoT | REC-03 OUT · AC-REC-CMP-01 |
| Free-text `candidates.position` as position SoT | AC-REC-UV-03 · BR position from YCTD |
| `ON DELETE CASCADE` YCTD → applications / evals | History BR |
| Campaign / `rec_job_post*` required GĐ1 for UV | §2.8 GĐ2 |
| Seed invent UV↔YCTD links for UAT evidence | U65 |
| Claim `recruitment_uat_ready` / `jd_dynamic_done` | Honesty lock |

---

## 6. Validation matrix (DB-oriented)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **DV-UV-YCTD-10** | INSERT application thiếu YCTD FK | BR-BP-CV-03 · NOT NULL | 400 `HRM-REC-UV-YCTD-REQUIRED` |
| **DV-UV-YCTD-11** | YCTD id ngoài scope / không tồn tại | soft FK resolve | 404 `HRM-REC-UV-YCTD-NOT-FOUND` |
| **DV-UV-YCTD-12** | YCTD không receivable | status gate | 400 `HRM-REC-UV-YCTD-STATUS` |
| **DV-UV-YCTD-13** | `position_key` client ≠ YCTD | mismatch | 400 `HRM-REC-UV-POSITION-MISMATCH` |
| **DV-UV-YCTD-14** | Persist free-text `position` as SoT | deprecate | Review FAIL / API reject |
| **DV-UV-YCTD-15** | Invent dual physical FK columns | alias-only | Schema review FAIL |
| **DV-UV-YCTD-16** | Link / filter UV via `job_posting_id` | SoT boundary | **FORBIDDEN** |
| **DV-UV-YCTD-17** | Duplicate `(candidate_id, YCTD)` | UQ §2.5 | 409 |
| **DV-UV-YCTD-18** | Close YCTD CASCADE wipe applications | soft FK | Review FAIL |
| **DV-UV-YCTD-19** | list application/UV id → get-by-id | `scope_parity` | same resolver; no list-hit / detail-404 under `main` |
| **DV-UV-YCTD-20** | Compare scores without `application_id` neo | eval SoT | FAIL AC-REC-CMP-05 |
| **DV-02** (reuse) | Application không có `recruitment_request_id` | NOT NULL | Reject — alias of DV-UV-YCTD-10 |

---

## 7. Data interaction (CRUD / transition — UV↔YCTD slice)

| Entity / col | C | R | U | D/Archive | Notes |
|--------------|---|---|---|-----------|-------|
| `requisition_id` on application | Required on create/link | Join YCTD display | Rebind policy API-01 (default: lock if hired) | Soft with application; never CASCADE from YCTD | Soft FK |
| Optional denorm `position_key` on application | Copy from YCTD | List/compare | Resync from YCTD only | Soft | ≠ free-text SoT |
| `rec_candidate` PII | Create with link | List/detail | PATCH PII | Soft archive | No position SoT |
| Eval on `application_id` | After interview | Compare CMP-01 | Update scores | Soft | Compare SoT |
| `job_postings` / Lane B apps | — | — | — | — | **OUT** UV SoT |

---

## 8. Traceability

| BRD/SRS | API (next wave) | DB | FE | Test |
|---------|-----------------|----|----|------|
| FR-UC-BP-REC-05a **#1–#2** | F-REC-UV-YCTD-01 | YCTD receivable filter | Picker / empty CTA | AC empty |
| REC-05a **#3–#4** | F-REC-UV-YCTD-02 | YCTD `position_key` | Position derived | AC-REC-UV-03 |
| REC-05a **#5–#6** | F-REC-UV-YCTD-03 | soft FK NOT NULL + UQ | Lưu | AC-REC-UV-01/04 |
| REC-05a **Thành công** / F5 | F-REC-UV-YCTD-05 | join applications→YCTD | List + F5 | AC-REC-UV-02 |
| REC-06b **#1–#4** | F-REC-CMP-01 | applications by `requisition_id` | So sánh | AC-REC-CMP-01..03 |
| REC-06b **#5–#6** / Thành công | F-REC-CMP-02 | eval on `application_id` | Matrix ≤ N | AC-REC-CMP-04/05 |
| REC-03 / campaign | **OUT** | §2.8 GĐ2 only | OUT | FORBIDDEN postings |
| Journey | — | — | — | `J-HRM-REC-UV-01` · `J-HRM-REC-CMP-01` (U65 browser) |

**scope_parity:** list YCTD / applications / candidates and get-by-id must use **same** scope resolver; soft FK resolve must not 404 an id that list returned under group CEO `main`.

---

## 9. Client DB_DESIGN pointer (no wipe)

| Artifact | Action |
|----------|--------|
| `DB_DESIGN_HRM_ENTERPRISE.md` §2.5 | DOC-DELTA: `recruitment_request_id` = **logical alias** of physical **`requisition_id`**; soft FK; keep existing column row |
| §2.4 | DOC-DELTA: **deprecate** free-text person-level position as SoT; position = YCTD derived |
| §2.8 Campaign / job_post | Remain **GĐ2 optional** — not UV/compare SoT |
| §6 Validation | ADD DV-UV-YCTD-10..20 pointers (DV-26..31 client ids) |
| §8 Forbidden | ADD dual physical UV FK + job_postings UV SoT + free-text position SoT + CASCADE |
| §9 Trace | Point REC-05a/06b + journeys |

---

## 10. Cascade & Dev HOLD

```text
SRS v0.11 FR-05a/06b (DONE)
  → TechSpec PO-HRM-REC-UV-YCTD-TECH-01 (DONE)
  → DB_DESIGN this file (DONE ba-data) CONFIRM
  → API_DESIGN PO-HRM-REC-UV-YCTD-API-01 (sa) CONFIRM  ← next
  → QA plan → Dev-BE/FE (HOLD until DB+API)
```

| Gate | Rule |
|------|------|
| **Cấm Dev `apps/**`** | Until **this DB-01 + API-01** both confirmed on bus |
| **Cấm migrate** this wave | Logical confirm only |
| **must_keep** | ONE physical `requisition_id` soft FK · N–N UQ · eval on `application_id` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` |

---

## 11. Risks

| Risk | Mitigation |
|------|------------|
| Dual physical alias columns | DV-UV-YCTD-15; SA API maps alias only |
| Lane B `job_posting_id` treated as UV SoT | §5 FORBIDDEN + AC-REC-CMP-01 |
| Free-text `candidates.position` survives as SoT | §2 deprecate + DV-UV-YCTD-03/14 |
| AS-IS Lane A 1:1 vs enterprise N–N | Soft FK **name** locked; N–N home = application; API-01 chốt write path — **no** invent second FK name |
| CASCADE migrate habit | Explicit FORBIDDEN §5 |
| Claim module UAT after narrow GWC | Honesty flags false |

---

## Completion

| Field | Value |
|-------|--------|
| completion_report | DB delta CONFIRMED: ONE physical soft FK `requisition_id` ↔ logical `recruitment_request_id` (alias); position_key SoT from YCTD; free-text `candidates.position` deprecated as SoT; FORBIDDEN dual FK / job_postings / REC-03 / CASCADE. Client DOC-DELTA. No apps/** · no migrate. Honesty false. |
| next_owner | **sa** |
| next_dispatch | `PO-HRM-REC-UV-YCTD-API-01` |
| evidence_path | `docs/qa/evidence/po-hrm-rec-uv-yctd-db-01.md` |
| ack_status | **PASS_TO_PM** |
