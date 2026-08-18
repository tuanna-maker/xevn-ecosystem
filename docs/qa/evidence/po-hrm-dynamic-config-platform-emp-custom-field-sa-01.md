# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — docs-only Option/F.1 · **NO** `apps/**` · **NO** seed |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | ATT-WORKSITE-CATALOG-QC-01 **GWC** · U88 · Q-PLT-05 EMP custom field after PAY-COMP · MergeToken EMP EXT **SEALED** |
| **Verdict** | **CONFIRMED** — Option **A LOCKED** (Settings extension-items = EMP custom-field open catalog SoT + BR-PLT-01 cite sealed EXT) |
| **ack_status** | `PASS_TO_PM` |
| **spec_path** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md) |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) BR-PLT-01 · Q-PLT-05 |
| **ref_ext** | EXT-SA Option B′ · EXT-QC stamp **`EMPTOKEXTQA-MSJ57PE1`** · `R-EMP-TOK-EXT` **SEALED** — **RETAIN** |
| **ref_peer** | PAY-CATALOG Option B · ATT-WORKSITE Option B · MERGE-TOKEN-EMP DOC/ET · EMP DOC-ET catalog |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 1. Entry criteria audit

| Criterion | Result |
|-----------|--------|
| Read platform BA-01 (custom field + BR-PLT-01) | ✅ §1 BR-PLT-01 · §2.1 EMP · AC-PLT-CTR-05 class · Q-PLT-05 |
| Read peer MERGE-TOKEN-EMP / EMP DOC-ET / ATT-WORKSITE / PAY Option B | ✅ EXT sealed · DOC/ET Nest retain · ATTWS QC GWC · PAY Nest SoT pattern cite |
| Read ATT-WORKSITE QC-01 (U88 chain) | ✅ GWC · honesty false · seals RETAIN · U88 next governance |
| Honesty false · C-SLICE-≠-MODULE | ✅ stamped |
| RETAIN ATT worksite · ATT-LEAVE · SI · CTR · MergeToken EMP EXT · enrollment | ✅ **no reopen** |
| No `apps/**` · no seed · no flip ready · no invent EMP UAT | ✅ |

---

## 2. AS-IS facts (repo evidence)

| Layer | Fact |
|-------|------|
| Definition producer | Nest SettingsCatalogs → `hrm_catalog_extension_items` on EMP field allow-list catalogs |
| BR-PLT-01 register | `F-EMP-TOK-03` / `registerEmpExtensionMergeToken` same-TX → `custom.emp.*` `origin=extension_field` on **`hrm_merge_tokens`** |
| EXT seal | QC GWC **`EMPTOKEXTQA-MSJ57PE1`** · AC-04/04b/04c/04-RETIRE · `R-EMP-TOK-EXT` CLOSED |
| Value store | `employee.custom_fields` JSON — **value ≠ definition** |
| Nest `emp_custom_field` | **ABSENT** — inventing = dual SoT vs sealed producer |
| DOC/ET | Nest catalogs + `emp.doc.*` / `emp.et.*` **orthogonal SEALED** |

---

## 3. Option evaluation (summary)

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** Settings extension-items = open field-def SoT + sealed F-EMP-TOK-03 + consumer invent **`HRM-EMP-CUSTOM-FIELD-KEY`** | Matches AS-IS + EXT · peer admin≠consumer | **LOCKED** |
| **B** Nest physical `emp_custom_field` / migrate off extension | Dual SoT · reopen EXT | **REJECT** |
| **C** Hybrid dual writers / mega-EAV FormSchema | ADR Q-PLT-03 · seal churn | **REJECT** |

**Weighted:** A **118** · B 42 · C 12 (see spec §3).

**Note vs PAY Option B:** PAY Nest `salary_components` already SoT (Settings orphan). EMP custom-field producer **is** Settings extension — Option **A** ≡ deepen existing SoT (peer ATT worksite deepen class), not «MD stub alone».

---

## 4. F.1 locks (copy)

- **SoT:** allow-list `hrm_catalog_extension_items` only  
- **Admin:** CREATE open N+1 (**BR-PLT-05**)  
- **Register:** F-EMP-TOK-03 → `hrm_merge_tokens` (**EXPAND cite EXT** — no wipe)  
- **Consumer:** EFF>0 invent → `HRM-EMP-CUSTOM-FIELD-KEY` · empty skip + CTA no seed  
- **OUT:** Nest field-def · mega-EAV · seed · personnel flip · reopen EXT/ATT/SI/CTR · module EMP UAT  

---

## 5. Gates

| Gate | Status |
|------|--------|
| ba-data | **HOLD** — no EXPAND |
| ba-process | **UNLOCK** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01` |
| BE/FE | **HOLD** until BA — CNS invent KEY only if GAP; **cấm** reopen EXT BE |
| Honesty | personnel / e2e / printable **false LOCKED** |

---

## 6. Handoff

### completion_report

Closed: docs-only Option **A CONFIRMED** + F.1 for EMP custom-field open catalog; BR-PLT-01 linked to sealed MergeToken EMP EXT (**EXPAND not wipe**); consumer invent KEY class named; Nest field-def / mega-EAV / reopen seals / personnel flip / module EMP UAT **DENIED**; ba-data HOLD; ba-process UNLOCK.

Residual: BA AC pack AC-PLT-EMP-CUSTOM-01*; BE CNS invent only after BA if GAP; no apps/** this seat.

### next_owner

`ba-process`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01 CONFIRMED Option A

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md (Option A LOCKED · F.1 · L-EMP-CF-* · AC draft §7)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-sa-01.md
- Read peer: MERGE-TOKEN-EMP-EXT BA/QC (AC-PLT-EMP-TOK-04* SEALED — cite retain, do not reopen)
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md BR-PLT-01/02/04/05
- Honesty false · C-SLICE-≠-MODULE
- RETAIN: MergeToken EMP EXT · ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment · DOC/ET — do not reopen

## task (governance — NO apps/**)
Confirm AC pack AC-PLT-EMP-CUSTOM-01 / 01b / 01c / 01d / 01e / 01H + VAL-EMP-CF-CNS-*:
- Admin CREATE open N+1 on allow-list EMP field catalogs (Settings extension-items)
- 01b: token custom.emp.* appears (cite EXT AC-04 retain smoke — no reopen EXT suite)
- Consumer invent → HRM-EMP-CUSTOM-FIELD-KEY when EFF>0
- Empty EFF skip + CTA · no seed
- Soft-retire field + token
- Explicit OUT: Nest emp_custom_field · mega-EAV · flip personnel · reopen EXT/ATT/SI/CTR · module EMP UAT · seed
- Unlock BE CNS only if GAP after CONFIRMED; ba-data remains HOLD

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-ba-01.md
Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md

## cấm
apps/** · seed · flip ready · invent module EMP UAT · reopen MergeToken EXT / ATT / SI / CTR · Phase1 DONE · Nest field-def physical

## exit
CONFIRMED AC pack · or HOLD-WITH-RATIONALE · PASS_TO_PM · completion_report · next_owner · next_dispatch_prompt · ack_status
```

### evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-sa-01.md`

### ack_status

`PASS_TO_PM`
