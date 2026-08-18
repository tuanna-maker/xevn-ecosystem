# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` Option B **CONFIRMED** · Nest absent |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **date** | 2026-08-08 |
| **change_mode** | ADD / EXPAND · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · DENIED invent module ATT UAT · **`C-SLICE-≠-MODULE`** · U65 |
| **BE gate** | **HOLD** until parallel **BA-01 CONFIRMED** (DATA alone ≠ unlock BE) |

---

## 1. spec_read_ack

| Artifact | Sections used |
|----------|---------------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` | Option B LOCK · L-ATT-CODE-01..14 · F-ATT-CAT-CODE/EFF · F-ATT-CODE-CNS-* · KEY `HRM-ATT-CODE-KEY` · physical pointer §6.3 · AC draft · counting seal L-ATT-CODE-07 |
| `po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md` | AS-IS closed DTO IsIn + FE divergence · Nest table absent · unlock ba-data · BE HOLD |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01.md` | Closest structural peer — DEFINE Nest + typed flags + DROP closed CHECK + BE HOLD until BA |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` | Peer `att_leave_type` open key · UQ partial · soft-delete · ICatalogRow — **RETAIN** |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01.md` | Peer work-sites LIVE deepen — **RETAIN** · no fold |
| DB_DESIGN §4.4 · §4.4c · §4.5a | Leave / work-sites / `attendance_records.status` EXPAND target |
| AS-IS Nest (read-only cite) | **no** `att_attendance_code` · closed DTO `@IsIn(['pending','present','absent','leave'])` |

**no_prompt_echo:** Client DOC-DELTA uses Vietnamese enterprise wording only — no chat/prompt paste.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md) | **CONFIRMED** physical ADD `att_attendance_code` · dual SoT REF · DROP closed IsIn/CHECK · VAL-ATT-CODE-* · F-ATT-CAT-CODE/EFF |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **DOC-DELTA CONFIRMED** §4.4d · §4.5a EXPAND `status` · ER pointer · footer stamp |
| This evidence | Verdict · quality gates · handoff |

**Không đụng:** `apps/**` · seed · wipe leave/work-sites · rewrite aggregate · EMP/SI/CTR · mega-EAV · fold · honesty flip · invent ATT UAT.

---

## 3. Verdict stamps (summary)

| Topic | Stamp |
|-------|--------|
| Table | **ADD** `public.att_attendance_code` |
| Open key | `code` format-only · **DROP** closed status enum ceiling |
| Typed flags | `counts_as` / `day_weight` / `is_paid` / `is_present` — **GĐ2 metadata only** |
| Soft-delete | `archived_at` + `status=retired` |
| UQ | Partial `(company_id, lower(code)) WHERE archived_at IS NULL` |
| Dual SoT | Nest writer · Settings `attendance_codes` REF · tenant wins |
| Consumer | Soft text `attendance_records.status` · invent → `HRM-ATT-CODE-KEY` |
| Aggregate | **SEALED** — no rewrite this seat |
| Peer leave / work-sites | **RETAIN** · orthogonal |
| Honesty | all false · **C-SLICE-≠-MODULE** |
| BE | **HOLD** until BA CONFIRMED |

---

## 4. Explicit OUT (audit)

- Mega-EAV attendance catalog
- Fold into `att_leave_type` / `attendance_work_sites` / `work_shifts`
- Rewrite `att-timesheet-line-aggregate` / payroll LIST-TOTALS
- Seed / migrate execute / `apps/**`
- Flip `attendance_uat_ready` / `payroll_e2e_ready`
- Reopen EMP/ATT leave/worksite/SI/CTR seals
- Module ATT UAT / Phase1 DONE

---

## 5. Self-check (both files on disk)

| File | Status |
|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md` | ✅ written |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-data-01.md` | ✅ this file |
| DB_DESIGN DOC-DELTA §4.4d + §4.5a | ✅ applied same seat |

Empty either file = **INVALID-HANDOFF**.

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED physical ADD `public.att_attendance_code` (open `code`/`symbol`, partial UQ, soft-delete, ICatalogRow + typed GĐ2 flags, dual SoT REF, invent `HRM-ATT-CODE-KEY`, VAL-ATT-CODE-*); EXPAND `attendance_records.status` open key + DROP closed CHECK/DTO IsIn; DOC-DELTA §4.4d/§4.5a; FORBIDDEN mega-EAV / fold leave-worksite-shifts / rewrite aggregate / seed / flip ready / wipe seals; honesty false; **BE HOLD** until BA also CONFIRMED; closes R-PLT-DATA-04 ATT attendance-code slice; no apps/**. |
| **next_owner** | **pm** (gate BA+DATA → unlock **dev-be**) |
| **next_dispatch_prompt** | `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01. Read DATA-01 §2–§3 + SA L-ATT-CODE-* + BA AC-PLT-ATT-CODE-01*. ensureSchema ADD public.att_attendance_code (ICatalogRow + typed flags + partial UQ + format/symbol/counts_as/day_weight CHKs + effective IX); DROP/REPLACE closed attendance_records.status CHECK and DTO @IsIn ceiling; Nest F-ATT-CAT-CODE-01..04 + EFF-01 + CNS KEY HRM-ATT-CODE-KEY when EFF>0; soft-delete retire; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: rewrite att-timesheet-line-aggregate; fold into att_leave_type/work_sites/work_shifts; reopen EMP/SI/CTR seals; flip attendance_uat_ready; mega-EAV. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-data-01.md` |
