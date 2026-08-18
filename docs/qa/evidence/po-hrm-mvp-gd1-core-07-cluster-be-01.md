# PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-21 seat #23) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-CORE-07` |
| **Date** | 2026-08-09 |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · `CORE06QC1-MSLID363` soft≠DONE · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1..CORE01QC1` · EMPPLATQA / EMPTOKQA |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · personnel/CORE/CTR UAT **false** · **C-SLICE** · U65 · **DENY** claim checklist/free PATCH = CORE-07 DONE · **DENY** claim CORE-06 DONE · **DENY** invent PAY/CORE-09/ATT enroll DONE |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-07** Diễn biến **#1–#2** · Luồng **#1–#3** · **BR-BP-LC-02** |
| **tech_spec / api** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md` §4 F-CORE-ACT-01 · §5 GATE · §6 EFF · §7 ATT emit · §8 display-ready · §9 U19 |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md` — status spine **HOLD RETAIN** · gate table **HOLD invent** · `activated_at` **HOLD invent** |
| **api_design** | API-01 §4.1–§4.6 physical prefer `POST /employees/:id/activate` · gated PATCH alt · paper `/core` alias only |
| **sponsor_confirm** | API-01 CONFIRMED 2026-08-09 · unlock BE wire residual ONLY |
| **change_mode** | **ADD** residual wire · **RETAIN** status spine / CHK / free PATCH path ≠ DONE · **HOLD** schema invent |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **Prefer path** | `POST /api/hrm/employees/:employeeId/activate` → mint **`HRM-EMP-ACT-200`** |
| **Gated PATCH alt** | `PATCH /api/hrm/employees/:employeeId` with `status=active` + `effective_date` — **same** GATE+EFF+ATT SoT |
| **Status spine** | `pending_docs` → `active` only · illegal → **409** `HRM-EMP-ACT-ILLEGAL-TRANSITION` |
| **GATE** | Aggregate LIVE `hrm_document_checklist_item` + DOC `required_by_default` / `blocks_activation` (incl. synthetic missing when DOC required & no instance) · FAIL → **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` + `blocking_items[]` · status **unchanged** · **DENY** invent completeness table · **DENY** silent allow · O8 override OUT |
| **EFF** | Require `effective_date` `dd/MM/yyyy` · invalid/missing → **400** `HRM-EMP-ACT-400` · display `activated_at` locale · null → `—` · **HOLD invent** typed col · **DENY** epoch junk |
| **ATT-12** | On 2xx emit readable `employee.activated` (`employee_id` · `company_id` · `effective_date`) via `HrmRealtimeService` + response `events[]` · **DENY** invent ATT enroll DONE |
| **Display-ready** | `statusLabelVi` · `checklist_complete` · `blocking_items[]` · `activated_at` · `can_activate` on activate + GET-by-id (gate enrich best-effort) |
| **U19** | list = get = activate = gated PATCH via `resolveHrmListScope` (group CEO `main`→`holding`) |
| **Constants / DTO** | `emp-activate.constants.ts` · `dto/activate-employee.dto.ts` · `UpdateEmployeeDto.effective_date` |
| **Realtime** | Extend envelope + `publishEmployeeActivated` · export `HrmRealtimeService` from **CoreModule** (singleton with gateway) |
| **Nest `/core`** | **ABSENT** — physical `/employees` only · paper alias only |
| **RETAIN must_keep** | CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · EMP DOC/TOK · free PATCH ≠ FR-07 DONE · checklist CRUD ≠ FR-07 DONE |
| **OUT / DENY** | completeness/gate table invent · typed `activated_at` ADD · Nest `/core` dual · PAY/CORE-09/ATT enroll DONE · honesty flip · reopen sealed J-* · seed · claim checklist/free PATCH/CORE-06 DONE |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-core-07-cluster-be-01 --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0

Regression DI / peers:
employees.controller.spec + hrm-realtime.service.spec + core-03 + d-dash-01 + p1-hrm-perf + p1-phase1-be-emp-create-parity
→ 7 suites · 46 tests passed (includes CORE-07 11)
```

**Jest coverage (unit):** GATE 409 incomplete · EFF 400 · illegal transition · activate happy + emit · U19 main→holding · gated PATCH · DOC-required-without-instance blocks · GET display-ready · Nest `/core` constant lock · ApiException details `blocking_items`.

---

## 4. must_keep / residual

| Class | Status |
|-------|--------|
| CORE-06 soft≠DONE `CORE06QC1-MSLID363` · `R-CORE-06-HONESTY` INFO idle-ok | **RETAIN** · ≠ CORE-06 DONE |
| CORE-05 AST/BB/serial/DELETE-FORBIDDEN `CORE05QC1-MSLGVT40` | **RETAIN** |
| CORE-03 DOC/ET/CHK `CORE03QC1-MSLFJH0K` | **RETAIN** · ≠ claim CHK = CORE-07 DONE |
| CORE-02b EMP-CF · CORE-09d..01 · EMP DOC/TOK | **RETAIN** |
| Nest `/core` ACT SoT | **ABSENT** (DENY invent) |
| `activated_at` typed col / completeness table | **HOLD invent** |
| PAY / CORE-09 / ATT enroll | **OUT invent DONE** |
| Browser U65 J-HRM-CORE-07-01..05 | **QA next** (after FE peer) |
| Honesty / C-SLICE | **false** — no flip |

---

## 5. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | BE-01 **READY_FOR_QA**: wired F-CORE-ACT-01 prefer `POST /employees/:id/activate` + gated PATCH same SoT · GATE 409 `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` from LIVE CHK+DOC · EFF `dd/MM/yyyy` / display `activated_at` (HOLD typed) · emit `employee.activated` · display-ready DTO · U19 · CODE-MEMORY APPEND · jest 11 PASS · tsc 0 · peers RETAIN · Nest `/core` DENY · **≠** claim CORE-07/checklist/PATCH/CORE-06 DONE · C-SLICE honesty false. |
| **next_owner** | **qa** (after FE peer `PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01` READY) · or **pm** if FE still open |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-be-01.md` |
| **residual** | FE CTA bind · QA J-HRM-CORE-07-01..05 · typed `activated_at` HOLD · gate table HOLD · PAY/CORE-09/ATT OUT · personnel/printable false |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: BE-01 READY_FOR_QA · FE-01 READY · API-01 CONFIRMED · U65 zero-seed · CORE06QC1 soft≠DONE · CORE03QC1 CHK · Nest /core 0
entry_criteria: browser-only; L0 stack; FE CTA «Kích hoạt Hoạt động» live
exit_criteria: J-HRM-CORE-07-01..05 · 409 incomplete · Network physical /employees/:id/activate (or gated PATCH) · Nest /core 0 · FE after 2xx + F5 · no seed · seals · honesty false · ≠ claim checklist/PATCH = CORE-07 DONE
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-qa-01.md
```

---

## 6. Files touched

- `apps/api/hrm-api/src/employees/emp-activate.constants.ts` (ADD)
- `apps/api/hrm-api/src/employees/dto/activate-employee.dto.ts` (ADD)
- `apps/api/hrm-api/src/employees/dto/update-employee.dto.ts` (ADD `effective_date`)
- `apps/api/hrm-api/src/employees/emp-document-checklist.service.ts` (`evaluateActivationGate`)
- `apps/api/hrm-api/src/employees/employees.service.ts` (activate + gated PATCH + display)
- `apps/api/hrm-api/src/employees/employees.controller.ts` (`POST :id/activate`)
- `apps/api/hrm-api/src/employees/employees.module.ts` (CODE-MEMORY)
- `apps/api/hrm-api/src/employees/employees.controller.spec.ts` (mock activate)
- `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-07-cluster-be-01.spec.ts` (ADD)
- `apps/api/hrm-api/src/realtime/hrm-realtime.service.ts` (`employee.activated`)
- `apps/api/hrm-api/src/core/core.module.ts` (export realtime singleton)
- `apps/api/hrm-api/src/app.module.ts` (dedupe realtime provider)
- `apps/api/hrm-api/src/notifications/push-outbound.service.ts` (narrow activate envelope)
