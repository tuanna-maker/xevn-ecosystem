# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **w7** | `PO_HRM_CONTINUOUS_W7_20260807` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD / EXPAND · DOC-DELTA · **no** `apps/**` · **no** seed |
| **Honesty** | No personnel UAT / Phase1 flip · `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option B · §7 EMP row (extension catalogs + MergeToken hook) · L1–L7 |
| 2 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` | Pattern mirror (F-ATT-CAT F.1 · dual SoT · unlock ba-data) |
| 3 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` | Pattern mirror (F-REC-CAT-STG · system flags · must_keep spines) |
| 4 | `docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md` | Program charter · roll EMP after CTR/ATT/REC |
| 5 | `docs/program/PO_HRM_CONTINUOUS_W7_20260807.md` | W7 seat EMP-VERTICAL-SA |
| 6 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` §2.1 | EMP surfaces · AC-PLT-EMP-01 |
| 7 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | ICatalogRow · EMP = interface only GĐ1 (physical **not** covered) |
| 8 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-03 | Dynamic document catalog tenant CRUD |
| 9 | `DB_DESIGN_HRM_ENTERPRISE.md` §3.1 / §3.5 | Employee + checklist `document_type_key` AS-IS text |
| 10 | `API_DESIGN_HRM_ENTERPRISE.md` F-CORE-CTR-01 / ACT-01 | Consumer deepen pointers |
| 11 | `hrm-settings-master-keys.ts` | Family `employment_types` storageKey (AS-IS REF path) |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) | **CONFIRMED** EMP vertical API F.1 — F-EMP-CAT-DOC/ET/EFF · AC-PLT-EMP-02..06 · DOC-DELTA §7 · cascade unlock ba-data |

**Không đụng:** `apps/**` · profile wipe · contracts UF-02 redesign · SI dual SoT · position dual master · QSĐ absorb · seed · UAT flip.

---

## 3. Architecture stamps (summary)

| Topic | Stamp |
|-------|--------|
| Platform roll | Option **B** Catalog (`ICatalogRow`) on EMP GĐ1 **document types** + **employment types** |
| Primary catalogs | **`emp_document_type`** (`document_type_key`) · **`emp_employment_type`** (`employment_type_key`) — open keys · starter ≠ ceiling |
| Dual SoT (ET) | settings-catalogs `employment_types` group REF vs EMP tenant writer — tenant wins |
| Document SoT | HRM writer = SoT for CORE-03 checklist (group REF optional later) |
| Position lock | XBOS `job_titles`/`departments` REF — **AC-PLT-EMP-01** must_keep — **not** this seat |
| OUT GĐ1 | QSĐ `hr_decision_types` · CTR `contract_types` · MergeToken custom.emp hook (residual) |
| Consumer | Checklist / ACT-01 / YCTD employment_type ∈ effective (**BR-PLT-02**) |
| Pattern parity | Same F.1 depth as **F-PLT-TOK** / **F-ATT-CAT-LVT** / **F-REC-CAT-STG** |
| Open catalog | **FORBIDDEN** closed enum / reject Nth |
| Physical coverage | **NOT** already in platform DATA-01 → **UNLOCK** EMP-DATA-01 |
| Honesty | Personnel / PAY / ATT / REC ready **false** |

---

## 4. Quality gates (sa EMP vertical F.1)

| Check | Result |
|-------|--------|
| ICatalogRow map + physical pointer §2 | **PASS** |
| F-EMP-CAT-DOC/ET/EFF full F.1 blocks | **PASS** |
| Dual SoT employment_types clarity | **PASS** |
| Profile / contracts / SI must_keep | **PASS** |
| AC-PLT-EMP-01 preserved + AC-02..06 measurable U65 | **PASS** |
| DOC-DELTA client API/DB §7 | **PASS** |
| No apps/** · no UAT flip · no seed | **PASS** |
| scope_parity U19 | **PASS** |
| ba-data unlock (not already covered) | **PASS** — unlock EMP-DATA-01 |

---

## 5. completion_report

**Closed:** Rolled Platform Option B to EMP vertical — API_DESIGN F.1 for open **document-type** + **employment-type** catalogs (`F-EMP-CAT-DOC-*` · `F-EMP-CAT-ET-*` · `F-EMP-CAT-EFF-*`); dual SoT for `employment_types` REF vs tenant writer; CORE-03 document SoT; must_keep profile/contracts/SI + AC-PLT-EMP-01 XBOS position; AC-PLT-EMP-02..06; DOC-DELTA pointers; unlocks **ba-data** physical `emp_document_type` + `emp_employment_type` (EMP slice of R-PLT-DATA-04 — **not** previously covered).

**Open:** ba-data physical · ba-docs client DOC-DELTA · dev-be after DATA · dev-fe pickers · QA AC-PLT-EMP U65 · R-PLT-EMP-01..06 residuals (MergeToken hook · QSĐ GĐ1.5).

**Forbidden claims:** `hrm_personnel_uat_ready=true` · PAY/ATT/REC ready · Phase1 DONE · seed UF.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **ba-data** EMP physical (parallel **ba-docs** DOC-DELTA)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: ADD
priority: P2

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §2 physical
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.1 · §3.5 checklist document_type_key
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md ICatalogRow · R-PLT-DATA-04
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md (pattern peer if present) OR ATT-VERTICAL-SA §2
5. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-vertical-sa-01.md

## task
Physicalize ADD public.emp_document_type + public.emp_employment_type (columns/UQ/CHK per EMP-VERTICAL-SA-01 §2.1–2.2): open document_type_key + employment_type_key — FORBIDDEN closed enum CHECK; soft-delete archived_at; typed DOC flags (required_by_default / requires_expiry / blocks_activation / is_identity_doc) + ET flags (counts_toward_headcount / eligible_for_si / is_contingent); EXPAND note on checklist.document_type_key = catalog key; DOC-DELTA stamp DB_DESIGN; no apps/**; no seed UF (U65); no wipe employees / employee_contracts / employee_insurances / job_titles REF.

Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-data-01.md
Honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · payroll_e2e_ready=false · attendance_uat_ready=false · recruitment_uat_ready=false · no Phase1 DONE

## exit
PASS_TO_PM · unlock dev-be PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01 after CONFIRMED
must_keep: profile CORE-01 · UF-HRM-02 contracts · SI enrollment · AC-PLT-EMP-01 XBOS position · soft-delete · scope TEXT slug
```

### Alternate (parallel ba-docs)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: DOC-DELTA ADD-only

## task
Append client API_DESIGN F-EMP-CAT-DOC-01..02 · ET-01..02 · EFF-01..02 + F-CORE-CTR-01/ACT-01 footnotes; DB_DESIGN § emp_document_type + emp_employment_type — copy from EMP-VERTICAL-SA-01 §7; no wipe F-CORE-EMP-* / UF-02 / SI stubs; stamp DOC-DELTA CONFIRMED.
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-docs-01.md
Honesty: hrm_personnel_uat_ready=false · no module UAT flip
```

---

## 7. ack_status

**PASS_TO_PM**
