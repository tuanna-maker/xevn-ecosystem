# PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-18 seat #20) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-CORE-03` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA-01 O1–O12 · SA Option A · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · peer `CORE02BQC1-MSLEFQC1` / `CORE09DQC1-MSLDR8I3` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · personnel/CORE/CTR UAT **false** · **C-SLICE** · U65 · **DENY** claim EMP DOC L1=CORE-03/personnel DONE · **DENY** claim CORE-02b=EMPCF DONE · **DENY** claim CORE-09d printable/closed-8 DONE |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-03** Diễn biến **#1–#2** · **BR-BP-DOC-01** · **BR-PLT-01/02/04/05** |
| **tech_spec / api** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md` §4 F-CORE-CHK-01 ADD · §5 DOC/ET/TOK RETAIN |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md` §4–§5 `hrm_document_checklist_item` |
| **api_design** | API-01 §4.1–§4.6 physical `/employees/:id/document-checklist*` · paper `/core/…` alias only |
| **sponsor_confirm** | API-01 CONFIRMED 2026-08-09 · unlock BE+FE |
| **change_mode** | **ADD** F-CORE-CHK-01 · **RETAIN** F-EMP-CAT-DOC/ET/EFF · F-EMP-TOK-01/02 · **wire** assert |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **Service** | `apps/api/hrm-api/src/employees/emp-document-checklist.service.ts` |
| **Constants** | `emp-document-checklist.constants.ts` — mint `HRM-CORE-CHK-200/201/202/VAL-400/CONFLICT-409/404` · RETAIN `HRM-EMP-DOC-TYPE-UNKNOWN` |
| **DTO** | `dto/emp-document-checklist.dto.ts` — open `documentTypeKey` · status `missing\|submitted\|approved` |
| **ensureSchema** | ADD `public.hrm_document_checklist_item` — soft links · open TEXT key · status CHK · `archived_at` · partial UQ `(employee_id, lower(document_type_key)) WHERE archived_at IS NULL` · indexes · **DENY** hard FK · closed key CHECK · Nest `/core` table |
| **Routes** | `GET/POST /employees/:id/document-checklist` · `GET/PATCH …/:itemId` · `POST …/:itemId/archive` under `@Controller('employees')` |
| **Assert wire** | `EmpDocumentTypeService.assertDocumentTypeInEffectiveCatalog` on create + key-change PATCH · EFF>0 invent → `HRM-EMP-DOC-TYPE-UNKNOWN` · EFF=0 soft-allow · history retired key GET OK |
| **Required default** | `required := body.required ?? catalog.requiredByDefault ?? false` |
| **Display-ready** | `nameVi` · flags (`requiredByDefault`/`blocksActivation`/`requiresExpiry`) · `tokenKey=emp.doc.<key>` · sort by catalog then key |
| **U19** | list = get = patch = archive via `resolveHrmListScope` + parent emp scope (group CEO `main`→`holding`) |
| **Soft delete** | `archived_at` only · **DENY** hard DELETE sole path |
| **Module** | `EmployeesModule` providers/exports `EmpDocumentChecklistService` |
| **RETAIN** | DOC/ET/TOK services untouched except assert **call sites** · seals `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |
| **must_keep** | CORE-02b EMP-CF · CORE-09d TPL+clause ≠ printable/closed-8 · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY · F-CORE-ACT-01 OUT invent DONE |
| **OUT / DENY** | Nest `@Controller('core')` · Nest `emp_position` · Nest `emp_custom_field` · wipe EMP-CF · closed DOC enum · claim L1=CORE-03/personnel · claim CORE-02b=EMPCF DONE · claim CORE-09d printable/closed-8 · reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · honesty flip |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-core-03-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0

DI regression (controller harness):
employees.controller.spec + d-dash-01 + p1-hrm-perf-be-01 + p1-phase1-be-emp-create-parity
→ 5 suites · 33 tests passed (includes CORE-03 11)
```

**Jest coverage (unit):** ensureSchema + DENY closed/FK/Nest dual · create required←catalog · invent KEY UNKNOWN · EFF=0 soft-allow · U19 list=get=patch · approve + key-change re-assert · VAL-400 · CONFLICT-409 · soft archive · history retired GET · DENY emp_custom_field/emp_position invent.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| DOC/ET `/document-types*` · `/employment-types*` · TOK | **RETAIN** · seals EMPPLATQA / EMPTOK |
| CORE-02b EMP-CF `CORE02BQC1-MSLEFQC1` · FE `R-PLT-EMP-CF-FE-01` P2 HOLD | **RETAIN** · ≠ EMPCF/personnel DONE |
| CORE-09d TPL+clause `CORE09DQC1-MSLDR8I3` | **RETAIN** · ≠ printable / closed-8 DONE |
| CORE-09c/09b/09a/08/02/01 | **RETAIN** · DENY reopen rewrite |
| Nest `/core` DOC/checklist SoT | **ABSENT** (DENY invent) |
| F-CORE-ACT-01 / OCR | **OUT invent DONE** |
| Browser U65 J-HRM-CORE-03-01..05 | **QA next** |
| Honesty / C-SLICE | **false** — no flip |

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-be-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
depends_on: BE-01 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-be-01.md · FE-01 if READY
entry_criteria: L0 stack; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: Retest F-CORE-CHK-01 physical /api/hrm/employees/:id/document-checklist* — list empty OK; POST create required←catalog; EFF>0 invent → HRM-EMP-DOC-TYPE-UNKNOWN no row F5; submit→submitted; approve→approved; soft archive; DOC/ET Settings RETAIN /document-types* · /employment-types*; Nest /core checklist 0; Nest emp_position 0; Nest emp_custom_field 0; RETAIN CORE-02b EMP-CF · CORE-09d ≠ printable/closed-8; DENY claim EMP DOC L1=CORE-03/personnel DONE · claim CORE-02b=EMPCF DONE · claim CORE-09d printable/closed-8 · reopen J-CORE-02B/09D/09C/09B/09A/08/02/01 · seed.
J-*: J-HRM-CORE-03-01..05 (DRAFT promote)
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qa-01.md · PASS_TO_PM or FAIL
cấm: seed · API-only PASS · Nest /core SoT · honesty flip
```

---

## completion_report

- **Closed:** F-CORE-CHK-01 Nest physical ADD — ensureSchema `hrm_document_checklist_item` (DATA §4); GET/POST/PATCH/archive under `/employees/:id/document-checklist*`; wire `assertDocumentTypeInEffectiveCatalog` EFF>0→`HRM-EMP-DOC-TYPE-UNKNOWN` · EFF=0 soft-allow · history retired OK; `required`←`required_by_default`; display-ready enrich; mint `HRM-CORE-CHK-*`; U19; jest **11 PASS**; tsc **exit 0**; DI harness green; DOC/ET/TOK RETAIN; must_keep CORE-02b/09d..01; DENY Nest `/core` · emp_position · emp_custom_field · closed enum · DONE claims · seed · honesty.
- **Residual:** QA U65 J-HRM-CORE-03-01..05 · FE-01 bind · QC GWC C-SLICE · F-CORE-ACT-01 OUT.
