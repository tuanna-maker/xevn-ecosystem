# Evidence — PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01` |
| **lane** | governance · sa |
| **date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-21 #23) |
| **uc_ids** | `UC-BP-CORE-07` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md` |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · R-CORE-07-GATE-01 · R-CORE-07-ACT-01 · R-CORE-07-EFF-01 · R-CORE-07-ATT-12 emit only · OUT invent ATT/PAY/CORE-09 DONE · `CORE06QC1-MSLID363` · soft≠CORE-06 DONE · `R-CORE-06-HONESTY` INFO idle-ok · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |

---

## Verdict

**CONFIRMED** — RETAIN cite **F-CORE-ACT-01** physical prefer `POST /api/hrm/employees/:id/activate` **OR** gated `PATCH /api/hrm/employees/:id` (`status=active` + `effective_date`) · GATE 409 from LIVE checklist+DOC flags · EFF wire-body · ATT emit-only · paper `/core` alias only · closable gap **YES** → unlock **Dev-BE + Dev-FE wire residual ONLY** · HOLD invent completeness table / typed `activated_at`.

| Gate | Result |
|------|--------|
| F.1 Mục đích + Nghiệp vụ + SRS Diễn biến #1–#2 (F-CORE-ACT-01) | **PASS** §4 |
| GATE residual · 409 `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · DENY invent table / silent allow | **PASS** §5 |
| EFF residual · `effective_date` dd/MM/yyyy · HOLD invent typed col · DENY epoch | **PASS** §6 |
| ATT-12 emit `employee.activated` · DENY invent ATT enroll DONE | **PASS** §7 |
| Display-ready DTO DATA-01 · U19 list=get=activate | **PASS** §8–§9 |
| Nest `/core` DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE | **PASS** §10 |
| must_keep CORE-06..01 · `R-CORE-06-HONESTY` idle-ok · honesty false | **PASS** §10 |
| Closable gap YES · unlock Dev wire residual · HOLD schema invent | **PASS** §11–§12 |
| Docs-only (no apps/** this seat) | **PASS** |

---

## AS-IS cite (read-only)

| Fact | Cite |
|------|------|
| Status PATCH LIVE | `employees.controller.ts` `@Patch(':employeeId')` · `updateEmployee` · `HRM-EMP-PROFILE-200/202` |
| Status assert | `assertEmployeeStatusPayload` = employment-status catalog only · **no** checklist gate |
| Dedicated activate | **ABSENT** — employees grep `activate` / `HRM-EMP-ACT` / `can_activate` **0** |
| `activated_at` | apps/api/hrm-api grep **0** · ensureSchema omit |
| Checklist + DOC flags | LIVE F-CORE-CHK-01 · `blocks_activation` / `required_by_default` |
| Nest `@Controller('core')` | **ABSENT** |
| Completeness table | **ABSENT** · HOLD invent |

---

## Honesty (LOCKED false)

- `recruitment_uat_ready=false`
- `jd_dynamic_done=false`
- `contracts_printable_ready=false`
- `hrm_personnel_uat_ready=false`
- **C-SLICE** · U65 · **`R-CORE-06-HONESTY` INFO idle-ok**
- **DENY** claim checklist / free PATCH = CORE-07 DONE · CORE-06 DONE · PAY/CORE-09/ATT / printable / closed-8 DONE

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 CONFIRMED: RETAIN F-CORE-ACT-01 physical POST activate OR gated PATCH · GATE 409 from LIVE checklist+flags · EFF wire · ATT emit · display-ready DTO · must_keep CORE-06..01 · DENY Nest dual / schema invent / PAY·09·ATT DONE / checklist=DONE / free PATCH=DONE · unlock Dev-BE+FE wire residual. |
| **next_owner** | **pm** → **dev-be** + **dev-fe** |
| **next_dispatch_prompt** | Spec §13 |
| **evidence_path** | this file + API-01 spec |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
