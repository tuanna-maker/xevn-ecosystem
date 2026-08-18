# Evidence — PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01` |
| **lane** | governance · sa |
| **date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-18 #20) |
| **uc_ids** | `UC-BP-CORE-03` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md` |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA-01 Option A · R-PLT-EMP-01 · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · `CORE02BQC1-MSLEFQC1` · `CORE09DQC1-MSLDR8I3` |

---

## Verdict

**CONFIRMED** — ADD **F-CORE-CHK-01** physical `/api/hrm/employees/:id/document-checklist*` on `public.hrm_document_checklist_item` + wire `assertDocumentTypeInEffectiveCatalog` → `HRM-EMP-DOC-TYPE-UNKNOWN` · RETAIN cite F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK-01/02 · paper `/core` alias only · unlock **Dev-BE + Dev-FE**.

| Gate | Result |
|------|--------|
| F.1 Mục đích + Nghiệp vụ + SRS Diễn biến #1–#2 | **PASS** §4 |
| DTO↔DB DATA-01 §4–§5 | **PASS** §4.5 |
| Assert wire EFF>0 / EFF=0 / history retired | **PASS** §1 · §4.3 · §6 |
| RETAIN DOC/ET/TOK · no invent rewrite | **PASS** §5 |
| Nest `/core` DENY · emp_position DENY · emp_custom_field DENY | **PASS** §10 |
| must_keep CORE-02b..01 · F-CORE-ACT-01 OUT invent DONE | **PASS** §10 |
| DENY false DONE / honesty / reopen / seed / apps/** | **PASS** §10 |
| Unlock Dev-BE + Dev-FE | **PASS** §11 · §14 |
| Docs-only (no apps/** this seat) | **PASS** |

---

## AS-IS cite (read-only)

| Fact | Cite |
|------|------|
| Checklist Nest route/table | **ABSENT** — `apps/` grep **0** `document-checklist` / `hrm_document_checklist` |
| Assert helper LIVE unwired | `emp-document-type.service.ts` `assertDocumentTypeInEffectiveCatalog` · code `HRM-EMP-DOC-TYPE-UNKNOWN` |
| DOC/ET LIVE | `employees.controller.ts` `/document-types*` · `/employment-types*` |
| TOK LIVE | F-EMP-TOK-01/02 · seal `EMPTOKQA-MSJ290VB` |
| CoreModule | DB export only — **no** `@Controller('core')` SoT |

---

## Honesty (LOCKED false)

- `recruitment_uat_ready=false`
- `jd_dynamic_done=false`
- `contracts_printable_ready=false`
- `hrm_personnel_uat_ready=false`
- **C-SLICE** · U65 · **DENY** claim EMP DOC L1 = CORE-03/personnel DONE · CORE-02b = EMPCF DONE · CORE-09d printable/closed-8

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 CONFIRMED: ADD F-CORE-CHK-01 physical checklist* + assert wire + RETAIN DOC/ET/TOK cite · DENY Nest dual / emp_position / emp_custom_field / false DONE · unlock Dev-BE+FE. |
| **next_owner** | **pm** → **dev-be** + **dev-fe** |
| **next_dispatch_prompt** | Spec §14 (BE-01 + FE-01 parallel) |
| **evidence_path** | this file + API-01 spec |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
