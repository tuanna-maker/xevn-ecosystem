# QA-HRM-G-DB-04-CM-GREP-01 — CODE-MEMORY grep spot-check (G-DB-04)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-G-DB-04-CM-GREP-01` |
| **from_role** | pm |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P2 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **scope** | NARROW — CODE-MEMORY grep only |
| **prior BE** | `docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md` |
| **techspec** | `docs/hrm/TECHSPEC.md` **§17.6.4** must_keep |
| **cấm tuân thủ** | browser UF · seed · product code change · UF promote · Phase1/PROD claim |

---

## 1. Entry criteria

| Check | Result |
|-------|--------|
| BE CM annotate evidence PASS_TO_PM | PASS — `be-hrm-g-db-04-cm-annotate-01-20260721.md` |
| TechSpec §17.6.4 SoT known | PASS — cited in BE evidence + CM paste |
| No browser / seed / code edit | PASS — grep-only |

---

## 2. Grep matrix (apps/api/hrm-api/src/recruitment)

### 2.1 Required strings

| Pattern | HIT files | Verdict |
|---------|-----------|---------|
| `BE-HRM-G-DB-04-CM-ANNOTATE-01` | `recruitment-catalog.service.ts` (WorkItem L9 + CHANGE L32) · `recruitment.controller.ts` (CHANGE L30) · `recruitment.service.ts` (CHANGE L42) | **PASS** |
| `must_keep: G-DB-04 dual catalog` | `recruitment-catalog.service.ts` (L13) · `recruitment.controller.ts` (L35) · `recruitment.service.ts` (L47) | **PASS** |
| `POST /candidates dual-route` | `recruitment-catalog.service.ts` (CHANGE TechSpec L36) · `recruitment.controller.ts` (CHANGE What L32 + method L732) | **PASS** |

### 2.2 Surface markers (controller + catalog)

| Surface / handler | Location | Marker excerpt | Verdict |
|-------------------|----------|----------------|---------|
| **job-postings** | controller L82, L101 · catalog L249, L270 | `@CODE-MEMORY method · Lane B job-postings` / create job_postings · must_keep §17.6.4 · F1/F6 | **PASS** |
| **candidates-pool** | controller L151, L233 · catalog L325, L658 | Lane B candidates-pool / GET pool · F2 · INT-01 · must_keep §17.6.4 | **PASS** |
| **interviews-catalog** | controller L173, L190 · catalog L932, L950 | Lane B interviews-catalog · F3/F5 · must_keep §17.6.4 | **PASS** |
| **headcount-proposals** | controller L308, L326 · catalog L1034 | Lane B headcount-proposals leftover · F1 · FR-RC-01→job_requisitions only | **PASS** |
| **createCandidate** dual-route | controller L732–755 | `@CODE-MEMORY method · POST /candidates dual-route (G-DB-04 §17.6.1)` + runtime fork: `requisition_id` → spine `HRM-REC-202` / else pool `HRM-REC-CP-201` | **PASS** |

### 2.3 Lane A spine (supporting)

| File | Markers | Verdict |
|------|---------|---------|
| `recruitment.service.ts` | CHANGE BE-HRM-G-DB-04-CM-ANNOTATE-01 + §17.6.4 must_keep; method Lane A FR-RC-03 createCandidate (L435) · FR-RC-05 interviews (L503) | **PASS** |

---

## 3. Dual-route live check (comment + code path — no HTTP)

Controller `createCandidate` (@Post('candidates')):

- `+ body.requisition_id` → `recruitmentService.createCandidate` → envelope `HRM-REC-202`
- `− requisition_id` → `recruitmentCatalog.createCandidatePool` → envelope `HRM-REC-CP-201`

CM method block cites G-DB-04 §17.6.1 / must_keep §17.6.4 — **aligned** with BE annotate evidence §2 dual-route note.

---

## 4. Out of scope (explicit)

| Item | Status |
|------|--------|
| Browser UF / J-HRM-INT promote | **Not run** — cấm |
| Seed / API mutate | **Not run** |
| Product code / DDL / DTO | **Not touched** |
| Phase1 DONE / PROD-READY | **Not claimed** |
| G-DB-02 hard FK / catalog merge | Deferred (prior residual) |

---

## 5. Verdict

| Gate | Result |
|------|--------|
| Grep work_item on 3 recruitment files | **PASS** |
| must_keep G-DB-04 on catalog + controller + spine | **PASS** |
| POST /candidates dual-route on createCandidate | **PASS** |
| Surfaces job-postings · candidates-pool · interviews-catalog · headcount-proposals | **PASS** |
| Overall | **PASS** |

**Missing markers:** none.

---

## 6. completion_report

**Closed:**
- Spot-check CODE-MEMORY for `BE-HRM-G-DB-04-CM-ANNOTATE-01` across recruitment catalog service, controller, and spine service.
- Confirmed `must_keep: G-DB-04 dual catalog` (§17.6.4 paste) on all three file headers/CHANGE blocks.
- Confirmed `POST /candidates dual-route` on controller `createCandidate` (+ catalog CHANGE cite).
- Confirmed method-level markers on job-postings, candidates-pool, interviews-catalog, headcount-proposals.
- Evidence file written; no product code change; no UF promote.

**Residual:**
1. G-DB-02 hard FK / dual-catalog merge — still deferred (SA/BE program).
2. Spine hire gate parity vs pool (§17.6.3) — out of CM wave.
3. Optional later: UF/J-* browser only if PM opens separate work_item (not this wave).

**Not claimed:** Phase 1 DONE · PROD · UF-HRM-REC / J-HRM-INT 🟢.

---

## 7. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/qa-hrm-g-db-04-cm-grep-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-G-DB-04-CM-CLOSE-01
from_role: qa
to_role: pm
lane: governance
priority: P2

## Intake
QA CM grep CLOSED PASS: docs/qa/evidence/qa-hrm-g-db-04-cm-grep-01-20260721.md
Prior BE: docs/qa/evidence/be-hrm-g-db-04-cm-annotate-01-20260721.md
TechSpec §17.6.4 must_keep confirmed on recruitment-catalog.service · recruitment.controller · recruitment.service
Surfaces PASS: job-postings · candidates-pool · interviews-catalog · headcount-proposals · createCandidate dual-route

## Job
1. Bus INTAKE QA-HRM-G-DB-04-CM-GREP-01 PASS_TO_PM — close G-DB-04 CM annotate+grep chain
2. Do NOT promote UF-HRM-REC / J-HRM-INT from this evidence
3. Residual queue (defer or separate WI): G-DB-02 hard FK; spine hire parity §17.6.3
4. Next execution only if backlog P0/P1 requires — else mark dual-catalog CM wave DONE on bus

entry_criteria: QA grep evidence PASS
exit_criteria: bus closed for CM wave; no false UF 🟢
```
