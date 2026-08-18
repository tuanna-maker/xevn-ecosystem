# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — docs-only AC pack · **NO** `apps/**` · **NO** seed |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` Option **B CONFIRMED** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` **DISPATCHED** — BE **HOLD** until BA+DATA |
| **Verdict** | **CONFIRMED** — AC pack **AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01H** + **VAL-EMP-ST-CNS-*** + reason companion **VAL-EMP-STR-CNS-*** |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md`](po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 1. Entry criteria audit

| Criterion | Result |
|-----------|--------|
| Read SA Option B LOCKED · L-EMP-ST-* · F.1 · AC draft | ✅ Nest `emp_employment_status` + `emp_status_reason` · Settings REF · KEY codes · BE HOLD |
| Read SA evidence | ✅ AS-IS hardcode FE/BE/mobile + closed CHECK · no Nest table |
| Peer AC patterns EMP-CUSTOM · DOC/ET · ATT/SI Option B | ✅ admin open ≠ consumer invent · empty skip+CTA · honesty H · MD sole REJECT |
| Honesty false · C-SLICE-≠-MODULE | ✅ stamped |
| RETAIN EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR/enrollment | ✅ **no reopen** |
| No `apps/**` · no seed · no flip ready · no invent EMP UAT | ✅ |

---

## 2. AC pack CONFIRMED (summary)

| ID | PASS when | FAIL when |
|----|-----------|-----------|
| **AC-PLT-EMP-STATUS-01** | EFF≥1 · employee form picker = Nest GET `…/employment-statuses/effective` · Lưu 2xx + F5 · `status_label` | MD-alone / hardcode sole SoT · invent 2xx |
| **AC-PLT-EMP-STATUS-01b** | Invent `status` → **`HRM-EMP-STATUS-KEY`**; invent reason (when required/EFF>0) → **`HRM-EMP-STATUS-REASON-KEY`** | 2xx invent · format-only bypass |
| **AC-PLT-EMP-STATUS-01c** | EFF=0 soft empty + CTA · invent skip · no seed · bootstrap map only EFF=0 | Seed density · hardcode-as-SoT claim |
| **AC-PLT-EMP-STATUS-01d** | Admin CREATE status (+ reason) N+1 → 2xx/201 → F5 → picker sees key | Invent ban on admin · CHECK IN ceiling |
| **AC-PLT-EMP-STATUS-01H** | Honesty false · seals RETAIN · DENY fold/MD-sole/mega-EAV/module UAT | Flip ready · reopen seals |
| **VAL-EMP-ST-CNS-01..08** | KEY · FE rebind GAP · empty skip · scope · retire · **CHECK DROP residual** · display · KEY taxonomy | See spec §6.3 |
| **VAL-EMP-STR-CNS-01..04** | Reason invent KEY · skip when not required · admin CREATE · retire | See spec §6.4 |

**Numbering:** Peer SI/ATT convention (01=consumer · 01d=admin) — SA draft 01=admin intent preserved via **01d**.

**SoT lock:** Nest status + reason = writer SoT · Settings partitions = REF only · **≠** EMP-CUSTOM Option A.

---

## 3. Explicit OUT / DENY (stamped)

| OUT | Rule |
|-----|------|
| Settings MD sole SoT | **DENIED** |
| Mega-EAV / dual writers | **DENIED** |
| Fold into `emp_employment_type` / custom-field / DOC | **DENIED** |
| Flip personnel / e2e / printable | **DENIED** |
| Reopen EMP-CUSTOM CNS L1 / MergeToken EXT | **DENIED** |
| Reopen DOC/ET · ATT · SI · CTR · enrollment | **DENIED** |
| Module EMP UAT / Phase1 DONE | **DENIED** · **`C-SLICE-≠-MODULE`** |
| Seed for UF | **DENIED** (U65) |
| Full SM transition rewrite as this seat | **DENIED** (codes open; graph residual OK) |
| BE before BA+DATA | **HOLD** |

---

## 4. Unlock gates

| Gate | State |
|------|-------|
| ba-process (this) | **CONFIRMED** |
| ba-data | **UNLOCK** · parallel DATA-01 already **DISPATCHED** — ADD 2 tables + **DROP** closed CHECK residual |
| BE / FE / Mobile | **HOLD** until BA **+** DATA both CONFIRMED |
| QA / QC | After BE/FE — narrow seal · honesty false |

---

## 5. Journey pointers (U19)

| ID | Status | Notes |
|----|--------|-------|
| `J-HRM-EMP-ST-CAT-01..05` | **Proposed** (DRAFT until Nest LIVE) | Admin N+1 · invent KEY · empty EFF · reason invent · soft-retire — see spec §6.6 |
| Personnel load hosts | **RETAIN** | **cấm** claim UAT from load-only |
| BA_TRACE | Pointer appended | Optional promote after Nest LIVE + QA stamp |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | `pm` |
| **next_dispatch_prompt** | See §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 7. completion_report

**Closed:** AC pack **CONFIRMED** for EMP employment **status/reason** Option **B** — Nest `emp_employment_status` + companion `emp_status_reason` = SoT; Settings REF only; **AC-PLT-EMP-STATUS-01/01b/01c/01d/01H** + **VAL-EMP-ST-CNS-*** + **VAL-EMP-STR-CNS-***; admin CREATE open N+1 ≠ consumer invent **`HRM-EMP-STATUS-KEY` / `HRM-EMP-STATUS-REASON-KEY`**; empty EFF soft+CTA · no seed; soft-retire + history OK; closed CHECK = **DATA residual DROP**; EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR **RETAIN**; Explicit OUT MD-sole · mega-EAV · fold ET/custom · personnel flip · module EMP UAT · Phase1; ba-data parallel **OK**; BE **HOLD** until BA+DATA; honesty false · **C-SLICE-≠-MODULE**; no `apps/**`.

**Residual:** Await **DATA-01 CONFIRMED** (physical + CHECK DROP) → PM unlock **dev-be** F-EMP-CAT-ST/STR + CNS · then FE/Mobile rebind · QA U65 · QC narrow. Proposed J-HRM-EMP-ST-CAT-* DRAFT until Nest LIVE.

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01
from_role: pm
to_role: ba-data (if still OPEN) OR pm seal if already CONFIRMED
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-STATUS-CATALOG-BA-01 CONFIRMED · SA Option B

## entry_criteria
- BA CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-ba-01.md
- SA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md
- Peer DATA: EMP DOC/ET · SI type/insurer DEFINE class

## task (if DATA still OPEN)
CONFIRM physical ADD public.emp_employment_status + public.emp_status_reason (ICatalogRow · soft-delete · UQ active · typed flags · dual SoT Settings employee_statuses REF · tenant wins)
EXPAND DROP chk_employees_status CHECK IN ('active','inactive') ceiling — keep employees.status text · slug format CHK OK
FORBIDDEN: mega-EAV · fold into emp_employment_type/custom · seed · flip personnel · reopen EMP-CUSTOM/EXT
Evidence + DOC-DELTA DB pointer
BE HOLD until this CONFIRMED (+ BA already CONFIRMED)

## if DATA already CONFIRMED
Dispatch:
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
to_role: dev-be
Implement F-EMP-CAT-ST/STR + EFF · F-EMP-ST-CNS-01/02 KEY · status_label display-ready · jest VAL-EMP-ST-CNS-* / VAL-EMP-STR-CNS-*
must_keep: EMP-CUSTOM CNS · EXT · DOC/ET · ATT/SI/CTR
cấm: apps outside allowed_paths · seed · flip ready · reopen seals
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-be-01.md

## exit
DATA CONFIRMED or BE READY_FOR_QA · PASS_TO_PM · completion_report · next_owner · next_dispatch_prompt
```
