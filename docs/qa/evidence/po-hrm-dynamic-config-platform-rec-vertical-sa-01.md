# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **resume_chunk** | K6.2 |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD / EXPAND · DOC-DELTA · **no** `apps/**` · **no** seed |
| **Honesty** | No REC module UAT / Phase1 flip · `recruitment_uat_ready=false` · `payroll_e2e_ready=false` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` | Pattern mirror (F-ATT-CAT F.1 · dual SoT · unlock ba-data) |
| 2 | `docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option B · §7 REC row (Stages + JD FormSchema) · L1–L7 |
| 3 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md` | F-PLT-TOK F.1 depth + `HRM-PLT-CAT-*` |
| 4 | `docs/program/PO_HRM_RESUME_PLAN_20260807.md` §K6 | Chunk 6.2 REC-VERTICAL-SA |
| 5 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §2.2 | Pipeline stages after JD · AC-PLT-REC-01 |
| 6 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | ICatalogRow · REC = JD adapter only (stages **not** physicalized) |
| 7 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-05/05a/06/06a/07 | «danh mục pipeline đơn vị» · hire · IV |
| 8 | `DB_DESIGN_HRM_ENTERPRISE.md` §2.5–2.6 | AS-IS `stage` text starter six · history append |
| 9 | `API_DESIGN_HRM_ENTERPRISE.md` F-REC-APP-02 / F-REC-HIRE-01 | Consumer deepen pointers |
| 10 | JD ARCH + IV ONE-ACTIVE + UV-YCTD | must_keep spines |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) | **CONFIRMED** REC vertical API F.1 — F-REC-CAT-STG-01/02 · EFF-01 · AC-PLT-REC-02..05 · DOC-DELTA §7 · cascade unlock ba-data |

**Không đụng:** `apps/**` · JD wipe · IV one-active redesign · hire→EMP redesign · REC-03 · seed · UAT flip.

---

## 3. Architecture stamps (summary)

| Topic | Stamp |
|-------|--------|
| Platform roll | Option **B** Catalog (`ICatalogRow`) on REC GĐ1 **pipeline stages** |
| Primary catalog | **`rec_pipeline_stage`** open `stage_key` — starter six ≠ ceiling |
| Dual SoT | HRM writer SoT · XBOS WF task codes = **ops map** (optional `wf_task_type_key`) — **no** XBOS stages REF required GĐ1 |
| JD lock | FormSchema `rec_jd_*` = separate vertical (**AC-PLT-REC-01**) — adapter DATA-01 — **must_keep** |
| System outcomes | Typed `is_hired_outcome` / `is_reject_outcome` / `is_terminal` — hire + IV gates without FE enum of 6 |
| Consumer | F-REC-APP-02 ∈ effective catalog (**BR-PLT-02**) |
| Pattern parity | Same F.1 depth as **F-PLT-TOK** / **F-ATT-CAT-LVT** |
| Open catalog | **FORBIDDEN** closed enum / reject 7th stage |
| Physical coverage | **NOT** already in platform DATA-01 → **UNLOCK** REC-DATA-01 |
| Honesty | REC UAT **false** |

---

## 4. Quality gates (sa REC vertical F.1)

| Check | Result |
|-------|--------|
| ICatalogRow map + physical pointer §2 | **PASS** |
| F-REC-CAT-STG/EFF full F.1 blocks | **PASS** |
| Dual SoT / WF ops clarity | **PASS** |
| JD DnD / IV / hire must_keep | **PASS** |
| AC-PLT-REC-02..05 measurable U65 | **PASS** |
| DOC-DELTA client API/DB §7 | **PASS** |
| No apps/** · no UAT flip · no seed | **PASS** |
| scope_parity U19 | **PASS** |
| ba-data unlock (not already covered) | **PASS** — unlock REC-DATA-01 |

---

## 5. completion_report

**Closed:** Rolled Platform Option B to REC vertical — API_DESIGN F.1 for open **pipeline stage catalog** (`F-REC-CAT-STG-*` + `F-REC-CAT-EFF-01`); system outcome flags for hire spine; dual SoT = tenant writer vs WF ops map; must_keep JD DnD / IV one-active / hire→EMP / YCTD; AC-PLT-REC-02..05; DOC-DELTA pointers; unlocks **ba-data** physical `rec_pipeline_stage` (REC slice of R-PLT-DATA-04 — **not** previously covered).

**Open:** ba-data physical · ba-docs client DOC-DELTA · dev-be after DATA · dev-fe pickers · QA AC-PLT-REC U65 · R-PLT-REC-01..05 residuals.

**Forbidden claims:** REC module UAT-ready · Phase1 DONE · invent REC-03 · seed UF.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **ba-data** REC physical (parallel **ba-docs** DOC-DELTA)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: ADD
priority: P2

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §2 physical
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.5–2.6 stage + history
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md ICatalogRow · R-PLT-DATA-04
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md (pattern peer)
5. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-vertical-sa-01.md

## task
Physicalize ADD public.rec_pipeline_stage (columns/UQ/CHK per REC-VERTICAL-SA-01 §2.1): open stage_key — FORBIDDEN closed enum CHECK of starter six; soft-delete archived_at; typed is_hired_outcome / is_reject_outcome / is_terminal / allows_interview_schedule; partial UQ one hired-outcome; optional wf_task_type_key; EXPAND note on application.stage = catalog key; DOC-DELTA stamp DB_DESIGN; no apps/**; no seed UF (U65); no wipe rec_jd_* / interview / hire tables.
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-data-01.md
Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false · no Phase1 DONE

## exit
PASS_TO_PM · unlock dev-be PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01 after CONFIRMED
must_keep: JD FormSchema · IV one-active · F-REC-HIRE-01 · YCTD ONE FK · soft-delete · scope TEXT slug
```

### Alternate (parallel ba-docs)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: DOC-DELTA ADD-only

## task
Append client API_DESIGN F-REC-CAT-STG-01..02 · EFF-01 + F-REC-APP-02/HIRE footnotes; DB_DESIGN § rec_pipeline_stage — copy from REC-VERTICAL-SA-01 §7; no wipe F-REC-APP-* / UV / IV / JD; stamp DOC-DELTA CONFIRMED.
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-docs-01.md
```

---

## 7. ack_status

**PASS_TO_PM**
