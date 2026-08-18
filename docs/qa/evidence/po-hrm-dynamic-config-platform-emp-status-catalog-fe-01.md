# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01 |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P2 |
| **program** | PO-HRM-CONTINUOUS-W8-20260807 |
| **parent** | SA FE Option **A LOCKED** · L1 **EMPSTQA-MSK20G7H** RETAIN · residual **R-PLT-EMP-ST-FE-01** |
| **condition_close** | **R-PLT-EMP-ST-FE-01** (P2 · consumer Nest EFF rebind) |
| **ref_sa** | [PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md) |
| **ref_ba** | AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01H · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-01 |
| **change_mode** | **ADD** (FE consumer bind only · no FE-ADMIN invent · no seed · no L1 reopen) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · C-SLICE-≠-MODULE · U65 zero-seed · **R-PLT-EMP-ST-FE-ADMIN** HOLD RETAIN · L1 KEY LIVE · EMP-CUSTOM / EXT / DOC-ET / ATT seals RETAIN · LVRULE 01g HOLD |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SA** | docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md — Option **A LOCKED** · L-EMP-ST-FE-01..10 · FE bind contract §5.2 |
| **SA evidence** | docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-sa-01.md |
| **BA** | AC-PLT-EMP-STATUS-01 / 01b / 01c — Nest picker when EFF>0; bootstrap closed-3 when EFF=0; reason companion when requires_reason |
| **API_DESIGN** | GET /api/hrm/employees/employment-statuses/effective · GET /api/hrm/employees/status-reasons/effective?applies_to_status_key= |
| **BE** | F-EMP-CAT-ST-EFF-01 + STR-EFF LIVE · invent **400 HRM-EMP-STATUS-KEY** / **400 HRM-EMP-STATUS-REASON-KEY** · L1 stamp **EMPSTQA-MSK20G7H** RETAIN |
| **Peer** | useAttAttendanceCodesEffective · OT-TYPE / OT-COMP Nest EFF Select |

**spec says / code does:**

- *spec says:* EFF>0 → EmployeeFormDialog status Select = Nest ST (status_key+name_vi); reason Select when requires_reason / STR EFF; submit Nest keys; invent → toast + Network **400 KEY**; Employees filter prefer Nest EFF; EFF=0 → bootstrap active|probation|inactive + CTA · no seed.
- *code did (trước):* Settings MD `employee_statuses`/`employment_statuses` + hardcode fallback 3; no reason Select; list filter hardcode 3; mutations **không forward** `status` / `status_reason_key`.
- *code does (sau ADD):* Nest EFF hooks + form/filter rebind + mutations forward + KEY toast surface.

---

## 2. completion_report

**Closed (CONDITION R-PLT-EMP-ST-FE-01):**

| Gap | Impl |
|-----|------|
| Form status Select Settings/hardcode | Bind `useEmpEmploymentStatusesEffective().nestOptions` when `effectiveCount > 0` |
| Reason Select ABSENT | Companion `useEmpStatusReasonsEffective` when `requires_reason` OR STR EFF>0 for status |
| List filter hardcode 3 | `Employees.tsx` status filter = Nest options when EFF>0 else bootstrap 3 |
| Badge/label | `StatusBadge` optional `label` + resolve from Nest catalog nameVi |
| Submit Nest keys | `useEmployeeMutations` forward `status` + `status_reason_key` (normalize hyphen→underscore) |
| Bootstrap EFF=0 | `EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK` + admin/CH06e hint · **no seed** |
| Invent KEY surface | `HRM-EMP-STATUS-KEY` / `HRM-EMP-STATUS-REASON-KEY` → toast VI via `empStatusKeyToastMessage` |

**Paths touched:**

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | **ADD** `listEffectiveEmploymentStatuses` + `listEffectiveStatusReasons` (+ types); create/update payload `status` / `status_reason_key` |
| `apps/web/hrm/src/lib/empEmploymentStatusCatalog.ts` (+test) | **NEW** — helpers + KEY constants + bootstrap |
| `apps/web/hrm/src/hooks/useEmpEmploymentStatusesEffective.ts` (+test) | **NEW** — RQ hook + bind source-scan |
| `apps/web/hrm/src/hooks/useEmpStatusReasonsEffective.ts` (+test) | **NEW** — RQ hook + applies_to filter |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | **ADD** Nest ST/STR bind + CODE-MEMORY APPEND |
| `apps/web/hrm/src/pages/Employees.tsx` | **ADD** Nest status filter + badge label |
| `apps/web/hrm/src/components/common/StatusBadge.tsx` | **ADD** optional `label` prop |
| `apps/web/hrm/src/hooks/useEmployeeMutations.ts` | **ADD** forward status/reason + KEY toast (peer ATT-CODE mutations — required for exit submit Nest keys) |

**Scope note:** `useEmployeeMutations.ts` ngoài allowed_paths gốc nhưng **bắt buộc** — form đã collect `status` nhưng mutations trước đây **drop** field → không thể pass Nest keys / surface KEY nếu chỉ đổi dialog.

**must_keep honored:** ST/STR KEY · EMP-CUSTOM · EXT · DOC/ET · ATT seals · LVRULE HOLD · no FE-ADMIN invent · no L1 reopen · no seed · ready=false · C-SLICE · SoftDel · ET picker · CatalogSearchPicker dept/position · manager.

**Residual / OUT:**

| ID | Status |
|----|--------|
| **R-PLT-EMP-ST-FE-ADMIN** | HOLD RETAIN — Settings Nest ST/STR CRUD FE ABSENT · DENY invent this seat |
| LVRULE FE-01g | ACCEPT_AS_IS HOLD RETAIN |
| ATT-CODE FE-ADMIN | HOLD RETAIN |
| Module EMP UAT / personnel flip | DENIED · honesty false |

---

## 3. Bind matrix (EFF>0 vs EFF=0)

| Catalog | Form status Select | Reason Select | List filter | Badge | Submit | Negative |
|---------|-------------------|---------------|-------------|-------|--------|----------|
| EFF ST>0 | Nest status_key + nameVi | when requires_reason OR STR EFF>0 | Nest options | catalog label | Nest status_key (+ reason_key) | invent → **400 HRM-EMP-STATUS-KEY** / **REASON-KEY** + toast |
| EFF ST=0 | bootstrap 3 + hint CTA CH06e | hidden | bootstrap 3 | i18n/fallback | bootstrap key | soft-skip BE · no seed |
| loading | disabled | — | — | — | — | — |

---

## 4. Verify

| Command | Result |
|---------|--------|
| `npx vitest run src/hooks/useEmpEmploymentStatusesEffective.test.ts src/hooks/useEmpStatusReasonsEffective.test.ts src/lib/empEmploymentStatusCatalog.test.ts` | **29 passed** (17+7+5) |
| CODE-MEMORY APPEND | EmployeeFormDialog · Employees · StatusBadge · hooks · catalog · hrmApi EFF · mutations |
| solid_convention_ack | FE bind display-ready Nest; bootstrap only EFF=0; no Settings sole SoT when EFF>0 |
| U65 | no seed · empty EFF CTA hợp lệ |
| Honesty | personnel/e2e/printable=false · C-SLICE |

---

## 5. handoff

**ack_status:** **READY_FOR_QA**

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution
priority: P2
entry_criteria:
  - FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-fe-01.md
  - L1 EMPSTQA-MSK20G7H RETAIN · Nest ST/STR EFF LIVE
  - U65 browser-only · zero-seed
exit_criteria:
  - UF: login → Employees → Thêm/Sửa NV → status Select = Nest ST when EFF>0 (status_key+name_vi)
  - EFF=0 path: bootstrap active|probation|inactive + CTA hint · no seed
  - reason Select when Nest ST.requires_reason / STR EFF>0; submit reason_key
  - invent status when EFF>0 → Network 400 HRM-EMP-STATUS-KEY + VI toast
  - invent/missing reason when required → Network 400 HRM-EMP-STATUS-REASON-KEY + VI toast
  - list filter Employees prefer Nest EFF when EFF>0
  - F5 after 2xx → status/reason còn
  - DENY claim module EMP UAT · DENY invent FE-ADMIN · honesty false
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-fe-01.md
ack_status_target: PASS_TO_PM
hdsd_align: CH06e consumer hồ sơ NV status/reason
must_keep: ST/STR KEY · EMP-CUSTOM · ATT seals · LVRULE HOLD
```

**DENY:** invent FE-ADMIN Nest ST/STR Settings · invent LVRULE 01g · invent ATT-CODE FE-ADMIN · reopen L1/EMP-CUSTOM · flip `hrm_personnel_uat_ready` · claim module EMP UAT · seed.