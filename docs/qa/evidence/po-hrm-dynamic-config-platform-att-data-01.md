# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` | §2 physical · §1 ICatalogRow · L-ATT-CAT-* locks · AC-PLT-ATT-01..04 |
| `DB_DESIGN_HRM_ENTERPRISE.md` | §4.4 prior logical · §4.4b consumers |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | `ICatalogRow` · R-PLT-DATA-04 |
| `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` | D1 work_shifts ops · D3 work-sites |
| `PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md` | funnel `leave_type_key` must_keep |
| AS-IS Nest (read-only) | **no** `att_leave_type` table · `attendance_work_sites` LIVE in `attendance-config.service.ts` · `leave-requests` validates settings-catalog `leave_types` |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) | **CONFIRMED** physical ADD `att_leave_type` · dual SoT · ICatalogRow map · VAL-ATT-LVT-* · traceability |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §4.4 upgrade + §4.4c work-sites note + footer stamp |

**Không đụng:** `apps/**` · seed · wipe sheet/sign · work_shifts ops · ATT UAT flip.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Physical ADD | **`public.att_leave_type`** — ABSENT AS-IS |
| Open catalog | UQ `(company_id, lower(leave_type_key))` partial · slug CHK only |
| FORBIDDEN | `CHECK leave_type_key IN (...)` closed starter enum |
| Soft-delete | `archived_at` + `status=retired` — history intact |
| metadata_json | Optional sick/attach bridge — typed flags remain SoT |
| Dual SoT | settings-catalogs `leave_types` REF **≠** `att_leave_type` writer |
| Work sites | §4.4c platform note — table LIVE — no DDL gap GĐ1 |
| Closes | **R-PLT-DATA-04** ATT slice |
| Honesty | **false** ATT UAT |

---

## 4. Quality gates (ba-data)

| Check | Result |
|-------|--------|
| Physical columns match SA §2.1 | **PASS** |
| UQ active partial + lower(key) | **PASS** |
| FORBIDDEN closed enum CHECK documented | **PASS** |
| metadata_json optional bridge | **PASS** |
| Dual SoT + effective union | **PASS** |
| work_shifts ops must_keep | **PASS** |
| sheet/sign spine untouched | **PASS** |
| scope_parity U19 noted | **PASS** |
| VAL-ATT-LVT-01..10 deterministic | **PASS** |
| No apps/** / no seed | **PASS** |
| DOC-DELTA DB stamp | **PASS** |

---

## 5. completion_report

**Closed:** Physicalized ADD `public.att_leave_type` per ATT vertical SA §2.1 — open `leave_type_key`, partial UQ on `(company_id, lower(leave_type_key))`, slug-format CHK only (FORBIDDEN closed enum), soft-delete via `archived_at`/`status`, optional `metadata_json` for sick/attach bridge, audit columns, platform `ICatalogRow` binding, dual SoT with settings-catalogs `leave_types` group REF, VAL-ATT-LVT-01..10, traceability to F-ATT-CAT-* / AC-PLT-ATT-01..04; EXPAND §4.4c `attendance_work_sites` platform note (LIVE table, no new DDL GĐ1); DOC-DELTA CONFIRMED on client DB_DESIGN; closes R-PLT-DATA-04 ATT slice; no `apps/**`; no seed (U65).

**Residual:** dev-be ensureSchema + F-ATT-CAT-* (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01`); R-PLT-ATT-01 wire leave-requests to effective catalog; ba-docs client API DOC-DELTA; accrual policy GĐ1.5; QA AC-PLT-ATT U65 after FE/BE.

**Forbidden claims:** ATT module UAT-ready · Phase1 DONE · seed as UF evidence.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **dev-be**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01
change_mode: ADD
priority: P2

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md (§2 physical · §2.5 dual SoT · §5 VAL-*)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §3 F-ATT-CAT-*
3. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4 · §4.4c
4. apps/api/hrm-api/src/attendance/attendance-config.service.ts (work-sites pattern)
5. apps/api/hrm-api/src/attendance/leave-requests.service.ts (consumer validate today)
6. docs/qa/evidence/po-hrm-dynamic-config-platform-att-data-01.md

## task
ensureSchema ADD public.att_leave_type per DATA-01 §2:
- Columns/UQ partial/CHK slug+category+status as spec
- FORBIDDEN CHECK leave_type_key IN closed starter set
- Implement F-ATT-CAT-LVT-01/02 + F-ATT-CAT-EFF-01 (effective union: ATT wins on key collision)
- EXPAND work-sites OpenAPI/response ICatalogRow map only if needed — preserve AS-IS CRUD
- Wire leave-requests assert to effective catalog (R-PLT-ATT-01) — BR-PLT-02
- scope_parity: resolveHrmListScope + assertResourceInHrmScope on list/get/mutate
- Regression jest attendance-config + leave-requests + scope-context
- must_keep: work_shifts ops · sheet/sign spine · no seed UF (U65)
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md

## exit
READY_FOR_QA · ack_status when jest+ensure PASS
must_keep: work_shifts ops SoT · sheet/sign spine · settings-catalogs leave_types REF · soft-delete · scope TEXT slug
forbidden: seed for UF · closed enum reject 9th key · hard-delete leave history · redesign sheet/sign
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` |
| **next_dispatch_prompt** | §6 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-data-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | DATA CONFIRMED — dispatch ATT-BE-01 ensureSchema + F-ATT-CAT-*; QA AC-PLT-ATT-01 U65 after BE READY |
