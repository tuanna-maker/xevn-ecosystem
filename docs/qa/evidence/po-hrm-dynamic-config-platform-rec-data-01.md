# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01` |
| **resume_chunk** | K6.2b |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed · **no** wipe JD/IV/hire/YCTD |
| **honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` | §2.1 physical · L-REC-CAT-* · F-REC-CAT-STG/EFF · AC-PLT-REC-02..05 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §2.5–2.6 AS-IS stage text · history append |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | `ICatalogRow` · R-PLT-DATA-04 · JD adapter only (stages **not** prior physical) |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | Pattern: open key · UQ partial · soft-delete · VAL matrix · DOC-DELTA |
| `po-hrm-dynamic-config-platform-rec-vertical-sa-01.md` | Unlock ba-data · honesty locks |
| AS-IS Nest (read-only knowledge) | **no** `rec_pipeline_stage` table · application.stage text consumer |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md) | **CONFIRMED** physical ADD `rec_pipeline_stage` · ICatalogRow · VAL-REC-STG-* · traceability |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §2.4a ADD · §2.5–2.6 EXPAND · header + footer stamp |

**Không đụng:** `apps/**` · seed · wipe `rec_jd_*` · IV one-active · hire→EMP · YCTD · REC UAT flip.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.rec_pipeline_stage`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(stage_key))` partial · slug CHK only |
| Hired outcome | UQ partial one active `is_hired_outcome` per company |
| FORBIDDEN | `CHECK stage_key IN (starter six)` closed ceiling |
| Soft-delete | `archived_at` + `status=retired` — history + past app.stage intact |
| Optional ops | `wf_task_type_key` — WF map ≠ second SoT |
| Consumer EXPAND | `application.stage` text = `stage_key`; validate when catalog >0 |
| Dual SoT GĐ1 | HRM writer SoT · no XBOS stages REF required |
| JD lock | FormSchema `rec_jd_*` out of seat — **must_keep** |
| Closes | **R-PLT-DATA-04** REC pipeline-stage slice |
| Honesty | **false** recruitment UAT · **false** payroll_e2e |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA §2.1 | **PASS** |
| UQ active + hired-outcome partial | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| Soft-delete + history retention | **PASS** |
| Optional `wf_task_type_key` ops-only | **PASS** |
| EXPAND application.stage / history notes | **PASS** |
| JD DnD / IV / hire / YCTD must_keep | **PASS** |
| scope_parity U19 noted | **PASS** |
| VAL-REC-STG-01..16 deterministic | **PASS** |
| No apps/** / no seed / no wipe | **PASS** |
| DOC-DELTA DB stamp | **PASS** |
| Honesty flags false | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.rec_pipeline_stage` per REC-VERTICAL-SA-01 §2.1 — open `stage_key`, partial UQ on `(company_id, lower(stage_key))`, hired-outcome UQ, slug-format CHK only (**FORBIDDEN** closed starter CHECK), soft-delete via `archived_at`/`status`, optional `wf_task_type_key` + typed outcome flags, platform `ICatalogRow` binding, VAL-REC-STG-01..16, traceability to F-REC-CAT-* / AC-PLT-REC-02..05; EXPAND DOC notes on `rec_candidate_application.stage` + stage history (retired keys kept); DOC-DELTA CONFIRMED on client DB_DESIGN §2.4a / §2.5–2.6; closes R-PLT-DATA-04 REC stage slice; must_keep JD DnD · IV one-active · hire→EMP · YCTD; no `apps/**`; no seed (U65).

**Residual:** unlock **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` (ensureSchema + F-REC-CAT-STG/EFF + wire APP-02); R-PLT-REC-02 WF hydrate; ba-docs API DOC-DELTA (R-PLT-REC-03); QA AC-PLT-REC U65 after FE/BE; group REF later (R-PLT-REC-05).

**Forbidden claims:** recruitment module UAT-ready · Phase1 DONE · payroll_e2e_ready · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **dev-be**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01
change_mode: ADD
priority: P2
resume_chunk: K6.2c

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md (§2 physical · §2.5 dual/ops · §5 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3 F-REC-CAT-STG/EFF
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.4a · §2.5–2.6
4. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-data-01.md
5. Pattern peer: apps/api/hrm-api attendance leave-type / ATT-BE ensureSchema (mirror open catalog)
6. Consumer AS-IS: recruitment application stage transition (F-REC-APP-02)

## task
ensureSchema ADD public.rec_pipeline_stage per DATA-01 §2:
- Columns / UQ active + hired-outcome / CHK slug+status+flags as spec
- FORBIDDEN CHECK stage_key IN closed starter six
- Implement F-REC-CAT-STG-01/02 + F-REC-CAT-EFF-01 (hiredOutcomeKey helper)
- Wire F-REC-APP-02: when catalog >0 assert to_stage ∈ effective → else HRM-REC-STAGE-UNKNOWN (R-PLT-REC-01)
- Optional wf_task_type_key ops map hydrate (R-PLT-REC-02) — not second catalog
- scope_parity: resolveHrmListScope + assertResourceInHrmScope on list/get/mutate
- Soft-delete retire only — no hard-delete; history/application keys intact
- Regression jest + scope-context
- must_keep: JD DnD rec_jd_* · IV one-active · hire→EMP · YCTD · no seed UF (U65)
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md
- Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false

## exit
READY_FOR_QA · ack_status when jest+ensure PASS
must_keep: JD DnD · IV one-active · hire→EMP · YCTD
```

---

## 7. Handoff packet

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **entry_criteria** | REC-VERTICAL-SA-01 CONFIRMED · unlock ba-data |
| **exit_criteria** | Physical CONFIRMED · DOC-DELTA DB · VAL matrix · unlock BE · honesty false |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-data-01.md` |
| **needed_by** | same-session PM → REC-BE-01 |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **dev-be** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01`) |
| **next_dispatch_prompt** | §6 copy-ready block |
