# BE-HRM-G-DB-04-CM-ANNOTATE-01 — CODE-MEMORY dual-catalog must_keep

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-G-DB-04-CM-ANNOTATE-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD (comment-only) |
| **prior** | `docs/qa/evidence/sa-hrm-g-db-04-dual-catalog-01-20260721.md` |
| **techspec** | `docs/hrm/TECHSPEC.md` **§17.6** (matrix · F1–F10 · must_keep §17.6.4) |
| **cấm tuân thủ** | logic · DDL · DTO · FE · seed · G-DB-02 hard FK · Phase1/PROD |

---

## 1. Entry / RE-DISPATCH check

| Check | Result |
|-------|--------|
| SA §17.6 DOCS CLOSED | PASS — evidence `sa-hrm-g-db-04-dual-catalog-01-20260721.md` |
| Prior CM annotate incomplete? | Annotations **already present** on catalog + controller + spine after interrupt; **evidence file missing** → finish evidence only (no redo of comments) |
| Schema / API behavior delta | **None** — comment-only |

---

## 2. Files annotated (must_keep §17.6.4 paste)

Paste SoT (§17.6.4):

```text
must_keep: G-DB-04 dual catalog — FR-RC-01→job_requisitions only;
  FR-RC-03→recruitment_candidates (POST /candidates + requisition_id);
  FR-RC-05→recruitment_interviews;
  cấm bind FR-RC vào job_postings/candidates/interviews catalog twin làm SoT primary;
  INT-01 hire: candidates.employee_id (pool) + soft recruitment_candidates.employee_id — no hard FK G-DB-02;
  không giả FK cross-lane A↔B
```

| File | File-level CHANGE | Handler / method markers |
|------|-------------------|--------------------------|
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE … BE-HRM-G-DB-04-CM-ANNOTATE-01` + full §17.6.4 | Lane B: `job_postings` list/create · `candidates` pool list/create · `interviews` catalog list/create · `headcount_proposals` |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | `@CODE-MEMORY-CHANGE … BE-HRM-G-DB-04-CM-ANNOTATE-01` + dual-route note | `job-postings` · `candidates-pool` · `interviews-catalog` · `headcount-proposals` · **`POST /candidates` dual-route** · Lane A GET candidates / POST interviews |
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | `@CODE-MEMORY-CHANGE … BE-HRM-G-DB-04-CM-ANNOTATE-01` + §17.6.4 | Lane A spine: create/list candidates · interviews (FR-RC-03/05 SoT) |

### Dual-route note (live — CM cites)

```text
POST /api/hrm/recruitment/candidates
  + body.requisition_id  → Lane A · HRM-REC-202 · recruitment_candidates (FR-RC-03 SoT)
  − requisition_id       → Lane B · HRM-REC-CP-201 · candidates (pool; không FR-RC-03 primary)
```

Controller method marker: `createCandidate` — `@CODE-MEMORY method · POST /candidates dual-route (G-DB-04 §17.6.1)`.

### Forbidden F# cited on surfaces

| Surface | F# called out in CM |
|---------|---------------------|
| job-postings / headcount-proposals | F1 / F6 |
| candidates-pool | F2 · INT-01 pool hire §17.6.3 · F8 soft |
| interviews-catalog | F3 / F5 |
| spine candidates / interviews | F2/F3 correct SoT · no cross-lane FK |
| dual-route POST | F7/F4 — no one-table implication |

---

## 3. Verification (comment-only gate)

| Gate | Result |
|------|--------|
| Grep `BE-HRM-G-DB-04-CM-ANNOTATE-01` on recruitment module | HIT — catalog.service · controller · recruitment.service |
| Grep `must_keep: G-DB-04 dual catalog` | HIT — file headers + CHANGE blocks match §17.6.4 |
| Grep `POST /candidates dual-route` | HIT — controller `createCandidate` |
| Logic / DDL / DTO / FE changed | **No** (narrow CM only) |
| Seed / G-DB-02 REFERENCES | **Not touched** |
| Phase1 / PROD claim | **Not claimed** |

---

## 4. completion_report

**Closed:**
- CODE-MEMORY / CODE-MEMORY-CHANGE on Lane B catalog service + catalog HTTP handlers (job-postings, candidates-pool, interviews-catalog, headcount-proposals).
- Spine recruitment service + controller Lane A markers with §17.6.4 must_keep.
- Explicit `POST /candidates` dual-route documentation in CM (Lane A vs B envelopes).
- This evidence file (prior interrupt left annotations without evidence — completed on RE-DISPATCH).

**Residual:**
1. Optional QA spot-check: grep `G-DB-04` / `must_keep §17.6.4` on catalog paths (no browser required for CM-only).
2. Spine hire gate parity vs pool (SA residual §17.6.3) — **out of this CM wave**.
3. G-DB-02 hard FK / dual-catalog merge — still deferred.

**Not claimed:** Phase 1 DONE · PROD-READY · schema merge · UF 🟢 · logic change.

---

## 5. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-DB-04-CM-GREP-01
from_role: pm
to_role: qa
lane: execution
priority: P2
NARROW: CODE-MEMORY grep spot-check only — cấm browser UF claim · cấm seed · cấm Phase1/PROD

## Entry
BE CM CLOSED: docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §17.6.4 must_keep + F1–F10
Files: recruitment-catalog.service.ts · recruitment.controller.ts · recruitment.service.ts

## Job
1. Grep apps/api/hrm-api/src/recruitment for:
   - BE-HRM-G-DB-04-CM-ANNOTATE-01
   - "must_keep: G-DB-04 dual catalog"
   - "POST /candidates dual-route"
2. Confirm markers on job-postings · candidates-pool · interviews-catalog · headcount-proposals · createCandidate dual-route
3. Evidence: docs/qa/evidence/qa-hrm-g-db-04-cm-grep-01-20260721.md
4. PASS_TO_PM — CM spot PASS or FAIL list missing markers
5. Do NOT promote UF-HRM-REC / J-HRM-INT from this wave

entry_criteria: BE evidence PASS_TO_PM present
exit_criteria: grep matrix PASS + evidence; no product code change
```
