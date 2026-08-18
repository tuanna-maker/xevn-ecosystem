# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — docs-only Option/F.1 · **NO** `apps/**` · **NO** seed |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | EMP-CUSTOM-FIELD-QC-01 **GWC** · U88 · BA-01 GĐ1 row Employment status / reason codes |
| **Verdict** | **CONFIRMED** — Option **B LOCKED** (Nest `emp_employment_status` + companion `emp_status_reason` = open catalog SoT · Settings REF merge-read) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 status/reason · BR-PLT-02/04/05/06 |
| **ref_qc_prior** | [`emp-custom-field-qc-01`](po-hrm-dynamic-config-platform-emp-custom-field-qc-01.md) GWC · `EMPCFQA-MSK14LUH` · EXT `EMPTOKEXTQA-MSJ57PE1` **RETAIN** |
| **ref_peer** | EMP-CUSTOM Option A (cite ≠ copy) · EMP DOC/ET Nest B · ATT leave/worksite B · SI type/insurer B |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 1. Entry criteria audit

| Criterion | Result |
|-----------|--------|
| Read platform BA-01 (employment status / reason) | ✅ §2.1 row GĐ1 if hardcode · BR-PLT-02/04/05/06 · §2.6 closed enum clarification |
| Read peer EMP-CUSTOM Option A · EMP DOC/ET · ATT/SI Option B | ✅ A = Settings extension LIVE; DOC/ET·ATT·SI = Nest SoT |
| Read EMP-CUSTOM-FIELD-QC-01 GWC | ✅ CNS L1 SEAL · honesty false · EXT RETAIN · U88 next governance |
| Honesty false · C-SLICE-≠-MODULE | ✅ stamped |
| RETAIN EMP-CUSTOM CNS L1 · MergeToken EXT · ATT/SI/CTR/enrollment · DOC/ET | ✅ **no reopen** |
| No `apps/**` · no seed · no flip ready · no invent EMP UAT | ✅ |

---

## 2. AS-IS facts (repo evidence)

| Layer | Fact |
|-------|------|
| FE picker | `EmployeeFormDialog` → catalogs `employee_statuses` / `employment_statuses`; **empty → hardcode** `active\|probation\|inactive` |
| BE display | `employee-display.ts` hardcode VI map `active\|inactive\|probation\|resigned\|terminated` |
| Mobile | `profileTabs` hardcode `active\|inactive\|terminated\|on_leave\|probation` |
| DB bootstrap | `chk_employees_status CHECK (status IN ('active','inactive'))` — closed ceiling vs richer FE/mobile keys |
| Nest domain | **No** `emp_employment_status` / `emp_status_reason` service/table (contrast DOC/ET LIVE) |
| Settings | Portal label key `employee_statuses`; import hint `select:active\|probation\|inactive` — **not** sealed Nest SoT |
| Orthogonal LIVE | EMP DOC/ET Nest · EMP-CUSTOM extension + CNS KEY · MergeToken EXT — **must_keep** |

---

## 3. Option evaluation (summary)

| Option | Verdict |
|--------|---------|
| **A** Settings MD sole SoT | **REJECT** — peer MD-alone rejected (PAY/ATT/SI); no typed-flag depth; hardcode/CHECK still residual |
| **B** Nest ST + reason companion · Settings REF | **LOCK / CONFIRMED** — peer EMP DOC/ET / ATT / SI; admin open ≠ consumer invent KEY |
| **C** Hybrid / mega-EAV / fold into ET·custom / flip UAT / reopen seals | **REJECT** |

**Weighted:** A 66 · **B 110** · C 18 (see spec §3).

**Why not EMP-CUSTOM Option A here:** custom-field producer already LIVE on Settings extension-items + sealed F-EMP-TOK-03; status has **no** Nest SoT and Settings bind falls back to hardcode — DEFINE Nest Option B.

---

## 4. F.1 / unlock

| Item | State |
|------|-------|
| F-EMP-CAT-ST-01..04 / EFF-01 | DEFINED (docs) |
| F-EMP-CAT-STR-* companion reason | DEFINED (docs) |
| F-EMP-ST-CNS-01/02 KEY | DEFINED — BE after BA+DATA |
| Errors | `HRM-EMP-STATUS-KEY` · `HRM-EMP-STATUS-REASON-KEY` |
| ba-process | **UNLOCK** `…-EMP-STATUS-CATALOG-BA-01` |
| ba-data | **UNLOCK** `…-EMP-STATUS-CATALOG-DATA-01` |
| BE / FE | **HOLD** until BA+DATA |
| Closed CHECK drop | ba-data EXPAND note |

---

## 5. Honesty / OUT

| Flag / OUT | Value |
|------------|-------|
| `hrm_personnel_uat_ready` | **false** · **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** · **DENIED** flip |
| `contracts_printable_ready` | **false** · **DENIED** flip |
| EMP-CUSTOM CNS L1 · EXT seal | **SEAL RETAIN** · **cấm reopen** |
| ATT / SI / CTR / DOC/ET / enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** · **`C-SLICE-≠-MODULE`** |
| Seed | **DENIED** (U65) |
| Mega-EAV / fold into ET·custom | **DENIED** |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **B CONFIRMED LOCKED** for EMP employment status/reason open catalog: Nest SoT + Settings REF; admin CREATE N+1 ≠ consumer invent KEY; hardcode/CHECK = residual after DATA; EMP-CUSTOM/EXT/ATT/SI/CTR retained; ba-process + ba-data unlocked; BE HOLD; honesty false · C-SLICE≠MODULE; no `apps/**`. |
| **next_owner** | `ba-process` |
| **next_dispatch_prompt** | See §7 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: EMP-STATUS-CATALOG-SA-01 Option B CONFIRMED

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md (Option B LOCKED · F.1 · L-EMP-ST-* · AC draft)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md
- Peer AC patterns: EMP DOC/ET · ATT-LEAVE · SI-INS · EMP-CUSTOM (admin open ≠ consumer invent KEY; empty skip+CTA; honesty H)
- RETAIN: EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR/enrollment — do not reopen
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed

## task (governance — NO apps/**)
Confirm AC pack AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-ST-CNS-* / VAL-EMP-STR-CNS-*:
- Nest F-EMP-CAT-ST/EFF = status SoT; companion F-EMP-CAT-STR = reason SoT
- Admin CREATE open N+1 (status + reason)
- Consumer invent → HRM-EMP-STATUS-KEY / HRM-EMP-STATUS-REASON-KEY when EFF>0
- Empty EFF = skip + CTA · no seed · no FE hardcode-as-SoT when Nest EFF>0
- Soft-retire + history OK; Settings partitions = REF only (not sole SoT)
- Explicit OUT: personnel/e2e/printable flip · reopen EMP-CUSTOM/EXT/ATT/SI/CTR · mega-EAV · fold into employment_type/custom · module EMP UAT · Phase1
- Unlock ba-data physical after AC CONFIRMED (or parallel if PM allows) — cite SA ba-data UNLOCK
- BE HOLD until BA+DATA

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-ba-01.md
Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md

## cấm
apps/** · seed · flip ready · invent module EMP UAT · reopen EMP-CUSTOM/EXT/ATT/SI · Phase1 DONE

## exit
CONFIRMED AC pack · PASS_TO_PM · completion_report · next_owner ba-data (or pm if sequencing) · next_dispatch_prompt · ack_status
```
