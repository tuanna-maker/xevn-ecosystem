# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01` |
| **w7** | `PO_HRM_CONTINUOUS_W7_20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `payroll_e2e_ready=false` · `attendance_uat_ready=false` · `recruitment_uat_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md` | §2.1–2.2 physical · §1 ICatalogRow · L-EMP-CAT-* · AC-PLT-EMP-02..06 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §3.1 employee · §3.5 checklist `document_type_key` (pre-EXPAND) |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | `ICatalogRow` · R-PLT-DATA-04 EMP was interface-only GĐ1 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` / ATT-VERTICAL-SA §2 | Pattern peer (open key · partial UQ · soft-delete · dual SoT) |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-vertical-sa-01.md` | Prior SA unlock |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md) | **CONFIRMED** physical ADD `emp_document_type` + `emp_employment_type` · dual SoT ET · VAL-EMP-DOC/ET-* · traceability |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §3.0a–b · §3.1 ET note · §3.5 open `document_type_key` · §1.1 ER · footer stamp |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | R-PLT-DATA-04 note — EMP DOC+ET slice CLOSED |

**Không đụng:** `apps/**` · seed · wipe employees / `employee_contracts` / `employee_insurances` / job_titles REF · honesty flip.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.emp_document_type`** + **`public.emp_employment_type`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(key))` partial · slug CHK only |
| FORBIDDEN | Closed enum CHECK on DOC/ET starter sets |
| Soft-delete | `archived_at` + `status=retired` — checklist/YCTD history intact |
| Typed DOC flags | `required_by_default` · `requires_expiry` · `blocks_activation` · `is_identity_doc` |
| Typed ET flags | `counts_toward_headcount` · `eligible_for_si` · `is_contingent` |
| Dual SoT (ET) | settings-catalogs `employment_types` REF **≠** EMP writer — EMP wins |
| Document SoT | Tenant writer = CORE-03 checklist SoT |
| Position lock | XBOS REF — **AC-PLT-EMP-01** must_keep |
| Closes | **R-PLT-DATA-04** EMP slice |
| Honesty | All listed ready flags **false** |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA §2.1–2.2 | **PASS** |
| UQ active partial + lower(key) both tables | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| Typed DOC/ET flags (not free JSON SoT) | **PASS** |
| Dual SoT ET + effective union | **PASS** |
| checklist.document_type_key EXPAND note | **PASS** |
| Profile / contracts / SI / AC-PLT-EMP-01 must_keep | **PASS** |
| scope_parity U19 noted | **PASS** |
| VAL-EMP-DOC/ET deterministic | **PASS** |
| No apps/** / no seed / no wipe | **PASS** |
| DOC-DELTA DB stamp | **PASS** |
| Honesty flags stamped false | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.emp_document_type` + `public.emp_employment_type` per EMP vertical SA §2.1–2.2 — open keys, partial UQ on `(company_id, lower(key))`, slug-format CHK only (FORBIDDEN closed enum), soft-delete via `archived_at`/`status`, typed DOC flags (`required_by_default` / `requires_expiry` / `blocks_activation` / `is_identity_doc`) + ET flags (`counts_toward_headcount` / `eligible_for_si` / `is_contingent`), optional `allowed_mime_json`/`metadata_json`, platform `ICatalogRow` binding, dual SoT employment_types REF vs tenant writer, VAL-EMP-DOC/ET matrices, traceability to F-EMP-CAT-* / AC-PLT-EMP-02..06; EXPAND checklist `document_type_key` + employee employment_type notes; DOC-DELTA CONFIRMED on client DB_DESIGN §3.0a–b / §3.5 / ER; closes R-PLT-DATA-04 EMP slice; unlocks **EMP-BE-01**; no `apps/**`; no seed (U65).

**Residual:** dev-be ensureSchema + F-EMP-CAT-* (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01`); R-PLT-EMP-01..02 consumer wire; ba-docs API DOC-DELTA (R-PLT-EMP-03); MergeToken custom.emp / QSĐ GĐ1.5; QA AC-PLT-EMP U65 after FE/BE.

**Forbidden claims:** `hrm_personnel_uat_ready=true` · `employees_e2e_linkage_ready=true` · PAY/ATT/REC ready · Phase1 DONE · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **dev-be** (EMP-BE-01 unlocked; SA F.1 already CONFIRMED — no extra SA gate required before BE)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01
prior: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01 CONFIRMED
change_mode: ADD
priority: P2

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DATA-01.md (§2–§3 physical · §3.4 dual SoT · §6 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3 F-EMP-CAT-DOC/ET/EFF
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §3.0a–b · §3.5
4. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-data-01.md
5. Peer pattern: ATT leave-type ensureSchema if present (att_leave_type)

## task
ensureSchema ADD public.emp_document_type + public.emp_employment_type per EMP-DATA-01:
- open document_type_key / employment_type_key — FORBIDDEN closed enum CHECK
- partial UQ (company_id, lower(key)) WHERE archived_at IS NULL
- soft-delete archived_at + status retired
- typed DOC/ET boolean flags as columns (not JSON SoT)
- Nest F-EMP-CAT-DOC-* · F-EMP-CAT-ET-* · F-EMP-CAT-EFF-* per SA §3
- scope_parity U19 list=get=mutate
- optional ensure upsert starter keys — NOT UF evidence (U65)
- must_keep: CORE-01 · UF-HRM-02 contracts · SI · AC-PLT-EMP-01 position REF · no wipe employees/contracts/SI
- cấm: seed UF · hard-delete · invent emp_position · flip honesty ready flags

Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md
Honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · payroll_e2e_ready=false · attendance_uat_ready=false · recruitment_uat_ready=false

## exit
READY_FOR_QA (unit/scope_parity) · ack handoff with completion_report · next_dispatch_prompt for QA AC-PLT-EMP-02..05 smoke (API) then FE
```

**Parallel (optional PM):** ba-docs R-PLT-EMP-03 — append F-EMP-CAT-* to client `API_DESIGN_HRM_ENTERPRISE.md` (ADD-only, no wipe F-CORE-EMP-*).

---

## 7. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §5 |
| **next_owner** | **dev-be** via pm (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01`) |
| **next_dispatch_prompt** | See §6 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-data-01.md` |
| **ack_status** | **PASS_TO_PM** |
