# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD / EXPAND · DOC-DELTA · **no** `apps/**` · **no** seed |
| **Honesty** | No ATT UAT / Phase1 flip · `payroll_e2e_ready=false` |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option B · §7 ATT · L1–L7 |
| 2 | `docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md` | Platform decision baseline |
| 3 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md` | F-PLT-TOK F.1 pattern (CTR) |
| 4 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md` | `ICatalogRow` · R-PLT-DATA-04 |
| 5 | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` | §2.3 ATT · BR-PLT-02/04/05/06 |
| 6 | `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` | D1 work_shifts ops · D3 work-sites |
| 7 | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 | `att_leave_type` physical |
| 8 | AS-IS Nest | `/attendance/work-sites` live · `leave-requests` validates settings-catalog `leave_types` · **no** `att_leave_type` table yet |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) | **CONFIRMED** ATT vertical API F.1 — F-ATT-CAT-LVT-01/02 · WS-01/02 EXPAND · EFF-01 · AC-PLT-ATT-01..04 · DOC-DELTA §7 · cascade unlock ba-data |

**Không đụng:** `apps/**` · ATT sheet/sign TXN redesign · work_shifts catalog duplicate · employee attendance_code GĐ2 · seed · UAT flip.

---

## 3. Architecture stamps (summary)

| Topic | Stamp |
|-------|--------|
| Platform roll | Option **B** Catalog (`ICatalogRow`) on ATT GĐ1 |
| Primary catalog | **`att_leave_type`** open `leave_type_key` — starter LVT_* / blueprint keys ≠ ceiling |
| Dual SoT | Group REF `settings-catalogs.leave_types` + ATT writer **`att_leave_type`** — effective union (**BR-PLT-06**) |
| Ops lock | **`work_shifts`** operational SoT — **not** platform catalog duplicate (ADR D1) |
| Work sites | **EXPAND** existing `/attendance/work-sites` — geofence SoT unchanged (ADR D3) |
| Consumer | Leave submit ∈ effective catalog (**BR-PLT-02**) — pointer F-ATT-LEAVE-02/03 |
| Pattern parity | Same F.1 depth as **F-PLT-TOK** (Mục đích · Nghiệp vụ · SRS · DTO↔DB · errors) |
| Open catalog | **FORBIDDEN** closed enum / reject 9th leave type |
| Honesty | ATT UAT **false** |

---

## 4. Quality gates (sa ATT vertical F.1)

| Check | Result |
|-------|--------|
| ICatalogRow map + physical pointer §2 | **PASS** |
| F-ATT-CAT-* full F.1 blocks | **PASS** |
| Dual SoT leave_types REF vs att_leave_type | **PASS** |
| work_shifts ops must_keep | **PASS** |
| work-sites EXPAND not redesign | **PASS** |
| AC-PLT-ATT-01..04 measurable U65 | **PASS** |
| DOC-DELTA client API/DB §7 | **PASS** |
| No apps/** · no UAT flip | **PASS** |
| scope_parity U19 | **PASS** |
| Sheet/sign/PAY deny-list preserved | **PASS** |

---

## 5. completion_report

**Closed:** Rolled Platform Option B to ATT vertical — API_DESIGN F.1 for open **leave type catalog** (`F-ATT-CAT-LVT-*`) + **work site catalog contract** (`F-ATT-CAT-WS-*` EXPAND on live paths) + effective read model (`F-ATT-CAT-EFF-01`); new AC-PLT-ATT-01..04; DOC-DELTA pointers for enterprise API/DB; unlocks **ba-data** physical `att_leave_type` (closes R-PLT-DATA-04 ATT slice).

**Open:** ba-data physical · ba-docs client DOC-DELTA append · dev-be after DATA · dev-fe pickers · QA AC-PLT-ATT U65 · R-PLT-ATT-01..05 residuals · MergeToken sheet export GĐ1.5.

**Forbidden claims:** ATT module UAT-ready · Phase1 DONE · invent employee attendance_code GĐ1.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **ba-data** ATT physical (parallel **ba-docs** DOC-DELTA)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
change_mode: ADD
priority: P2

## read_first
1. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §2 physical
2. docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §4.4 att_leave_type
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md ICatalogRow · R-PLT-DATA-04
4. docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md D1/D3
5. docs/qa/evidence/po-hrm-dynamic-config-platform-att-vertical-sa-01.md

## task
Physicalize ADD public.att_leave_type (columns/UQ/CHK per ATT-VERTICAL-SA-01 §2.1): open leave_type_key — FORBIDDEN closed enum CHECK; soft-delete archived_at; optional metadata_json for sick/attach bridge; EXPAND attendance_work_sites platform note only if column gap; DOC-DELTA stamp DB_DESIGN §4.4 CONFIRMED; no apps/**; no seed UF evidence (U65).
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-data-01.md
Honesty: ATT UAT=false · payroll_e2e_ready=false

## exit
PASS_TO_PM · unlock dev-be PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01 after CONFIRMED
must_keep: work_shifts ops SoT · sheet/sign spine · settings-catalogs leave_types group REF · soft-delete · scope TEXT slug
```

### Alternate (parallel ba-docs)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
read_first: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §7 DOC-DELTA
task: ADD-only append F-ATT-CAT-* to API_DESIGN_HRM_ENTERPRISE §3 + DB §4.4 stamp; no_prompt_echo; no wipe ATT TXN F.*
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-docs-01.md
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §5 |
| **next_owner** | **pm** → **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01` |
| **next_dispatch_prompt** | §6 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-vertical-sa-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **pm_dispatch_hint** | ATT vertical F.1 CONFIRMED — chain ba-data → ATT-BE-01 → QA AC-PLT-ATT-01 U65 |
