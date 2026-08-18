# SA-HRM-G-DB-04-DUAL-CATALOG-01 — Dual recruitment catalogs SoT

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-HRM-G-DB-04-DUAL-CATALOG-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD-only (docs) |
| **prior** | `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` (G-DB-04) |
| **techspec** | `docs/hrm/TECHSPEC.md` **§17.6** (+ G-DB-04 row update in §17.3) |
| **khách SoT** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` FR-HRM-RC-01 / RC-03 / RC-05 · FR-HRM-INT-01 |
| **cấm tuân thủ** | `apps/**` · seed · Phase1/PROD · hard FK G-DB-02 migration · dual-catalog merge |

---

## 1. Entry criteria

| Artifact | Result |
|----------|--------|
| W3-DB G-DB-04 | Dual `recruitment_*` vs `candidates`/`job_postings`/`interviews` flagged |
| TECHSPEC §17.1–17.3 | Spine mapped; gap row pointed to document + CM |
| Nest ensureSchema (read-only) | Lane A in `recruitment.service.ts`; Lane B in `recruitment-catalog.service.ts` |
| Controller dual-route | `POST /candidates` forks on `requisition_id` |

---

## 2. Deliverables

| # | Exit item | Path |
|---|-----------|------|
| 1 | TechSpec annex table → FR → API | `docs/hrm/TECHSPEC.md` **§17.6.1** |
| 2 | Forbidden bindings F1–F10 | **§17.6.2** |
| 3 | INT-01 dual hire surface rule | **§17.6.3** |
| 4 | CM must_keep template | **§17.6.4** |
| 5 | This evidence | this file |

**Không** sửa `apps/**`. **Không** migration G-DB-02. **Không** claim Phase1/PROD.

---

## 3. Architecture summary (facts → SoT)

### 3.1 Two lanes

| Lane | Service | Tables (core) | FR role |
|------|---------|---------------|---------|
| **A Spine** | `RecruitmentService` | `job_requisitions` · `recruitment_candidates` · `recruitment_interviews` | **Primary SoT** FR-RC-01/03/05 + INT chain §17.2 |
| **B Catalog twin** | `RecruitmentCatalogService` | `job_postings` · `candidates` · `interviews` (+ applications, plans, proposals, templates) | Leftover / menu density — **not** FR-RC primary |

### 3.2 FR binding (SoT one-liners)

| FR | SoT table | SoT HTTP | Forbidden twin |
|----|-----------|----------|----------------|
| **FR-HRM-RC-01** | `job_requisitions` | `…/requisitions` | `job_postings`, `headcount_proposals` |
| **FR-HRM-RC-03** | `recruitment_candidates` | `POST …/candidates` **with** `requisition_id` | claiming `candidates` pool as sole SoT |
| **FR-HRM-RC-05** | `recruitment_interviews` | `POST …/interviews` | claiming `interviews-catalog` as sole SoT |
| **FR-HRM-INT-01** | hire soft `employee_id` on **both** hire surfaces | pool stage + spine hired | hard `REFERENCES employees` (G-DB-02); cross-lane PK join |

### 3.3 Live dual-route (must cite in CM)

```text
POST /api/hrm/recruitment/candidates
  + body.requisition_id  → Lane A · HRM-REC-202 · recruitment_candidates
  − requisition_id       → Lane B · HRM-REC-CP-201 · candidates (pool)
```

### 3.4 INT-01 hire (post G-DB-01)

| Path | Column | Status |
|------|--------|--------|
| FE catalog / WF | `candidates.employee_id` | Enforce CLOSED (`HRM-REC-HIRE-400/409`) |
| Spine | `recruitment_candidates.employee_id` | Soft column present; gate parity = residual CM/BE |

Same `employees.id` hub for INT-02+ — **no** FK equating `candidates.id` ≡ `recruitment_candidates.id`.

---

## 4. Options evaluated

| Option | Verdict |
|--------|---------|
| A — Document dual + forbidden list; keep both DDL | **SELECT** |
| B — Force FE onto spine / drop catalog | Reject (R3) |
| C — Map FR onto catalog only | Reject (breaks spine FK + G-RC-01) |
| D — Silent dual-write | **cấm** without ADR |

---

## 5. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Dev binds RC-01 headcount to postings | F1 + §14.7 must_keep · jest G-RC-01 |
| QA promotes catalog-only UF as FR-RC PASS | Dispatch cites §17.6.1 spine SoT |
| Cross-lane JOIN by UUID coincidence | F4/F5 forbidden; no shared PK |
| Spine hire ungated after pool harden | §17.6.3 residual → optional BE CM annotate |

---

## 6. completion_report

**Closed:**
- TechSpec **§17.6** published: dual-lane diagram, table→FR→API matrix, forbidden F1–F10, INT-01 dual-surface rule, CM must_keep template.
- §17.3 **G-DB-04** marked docs CLOSED with pointer to §17.6 + this evidence.
- Ambiguity §16.1 «candidates pool» vs §17.1 spine **resolved**: §17.6 = SoT for FR primary binding.

**Residual:**
1. Optional execution: `BE-HRM-G-DB-04-CM-ANNOTATE-01` — append must_keep on catalog handlers (`candidates-pool`, `job-postings`, `interviews-catalog`) stating non-primary FR + F1–F10 (no schema change).
2. Spine hire gate parity vs pool (if spine exposes hired mutate) — ticket under INT-01 / G-DB-01 follow-up if QA finds ungated path.
3. G-DB-02 hard FK migration still deferred (unchanged).

**Not claimed:** Phase 1 DONE · PROD-READY · dual-catalog merge · UF 🟢 closure · 120 UC.

---

## 7. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-hrm-g-db-04-dual-catalog-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BE-HRM-G-DB-04-CM-ANNOTATE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
NARROW: CODE-MEMORY annotations only — cấm schema merge / hard FK / FE rewrite

## Entry
SA G-DB-04 DOCS CLOSED: docs/qa/evidence/sa-hrm-g-db-04-dual-catalog-01-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §17.6 (matrix + forbidden F1–F10 + must_keep template §17.6.4)
Khách: SRS_HRM_KHACH.md FR-HRM-RC-01/03/05 · FR-HRM-INT-01
Prior CM: recruitment.controller.ts already has RC-01 must_keep — extend catalog surfaces
cấm: apps/** logic change beyond comments · seed · G-DB-02 REFERENCES · dual-write · Phase1/PROD

## Job
1. Append @CODE-MEMORY / @CODE-MEMORY-CHANGE (VI) on:
   - recruitment-catalog.service.ts (file or ensureWave2 + hire/pool methods)
   - handlers: job-postings · candidates-pool · interviews-catalog · headcount-proposals
2. Each block must include must_keep paste from §17.6.4 + cite F1–F10 relevant to file
3. Explicit: Lane B tables ≠ FR-RC primary SoT; POST /candidates dual-route note
4. Do NOT change SQL DDL, DTO validation, or FE binds
5. Evidence: docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md
6. ack_status: PASS_TO_PM (docs/CM only) or READY_FOR_QA if QA spot-check CM grep required
7. next_dispatch_prompt: QA grep must_keep G-DB-04 on catalog paths OR continue W4-CM P1 modules

entry_criteria: §17.6 present; no Prisma rewrite
exit_criteria: CM annotations + evidence; no schema/API behavior delta
```
