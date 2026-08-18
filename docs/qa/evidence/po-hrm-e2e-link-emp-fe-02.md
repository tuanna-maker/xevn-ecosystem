# Evidence — PO-HRM-E2E-LINK-EMP-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-FE-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution · FIX · preserve_default · code_memory APPEND |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` FAIL · residual **R-EMP-DEC-WH-BROWSER-01** |
| **date** | 2026-08-06 |
| **ack_status** | **READY_FOR_QA** |
| **u65** | zero-seed |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QA FAIL | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01.md` D1 — toast required; `posPicked=false`; no POST decisions |
| FE-01 must_keep | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md` — WH picker · HTP banner · J-HRM-01..04 |
| SPEC / SA | EMP-SPEC-01 §D.2 · F-CORE-DEC-01/02 · AC-DEC-WH-01/02 |
| TC labels | `docs/qa/testcases/hrm-web/HRM-DECISIONS.md` F-FRM-POS=**Vị trí** · F-FRM-STATUS=**Trạng thái** · F-FRM-CODE=Số quyết định |

---

## Root cause (D1 browser)

| Symptom | Cause |
|---------|--------|
| `posPicked=false` | Label VI was **Chức vụ**; harness / TC expect **Vị trí** |
| `hintVisible=false` / status not effective | Label VI was **Tình trạng**; harness expects **Trạng thái** |
| Toast «đầy đủ thông tin bắt buộc»; no POST | `decision_code` fill missed — label **Số quyết định** vs harness `/Mã quyết định\|mã QSĐ/`; empty code tripped generic gate before position message |
| No WH badge | No 2xx create → no F-CORE-DEC-02 neo |

---

## Closed scope (FIX)

| Item | Change |
|------|--------|
| Labels VI | `positionLabel` → **Vị trí**; `statusLabel` → **Trạng thái**; `decisionCodeLabel` → **Số / mã quyết định** (TC + harness) |
| HDSD testids | `hdsd-decisions-form-code` · `-title` · `-type` · `-position` · `-status` (+ existing employee/submit/hint) |
| Gate | `validateDecisionCreateForm` — code → title → name → person-bound `employee_id` → catalog `position_key` (specific toasts) |
| UX | Position required marker + inline hint; employee Select `value` empty→`undefined` (Radix-safe) |
| must_keep | CatalogSearchPicker SoT; D2 WH picker; D6 HTP; J-HRM-01..04; no `apps/api/**`; no seed |

---

## Verify

```text
pnpm exec vitest run \
  src/lib/decisionPersonBound.test.ts \
  src/lib/hdsdMutateTestIds.test.ts \
  src/lib/employeeWorkTimelineUi.test.ts \
  src/lib/hireReadinessUi.test.ts
→ Test Files 4 passed · Tests 17 passed
```

cwd: `apps/web/hrm`

---

## Honesty

| Flag | Value |
|------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module UAT claim | **none** |
| seed | **none** |

---

## Residual (out of FE-02)

| ID | Owner |
|----|--------|
| R-EMP-SI-DUAL-SOT | **dev-be** (+ FE wire) — D5 dual enrollment SoT |
| D1 browser retest | **qa** — U65 POST decisions 2xx + WH badge F5 |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | Fixed QSĐ create HDSD path: labels align F-FRM-POS/STATUS/code; HDSD testids; validateDecisionCreateForm gates code/title/name/employee_id/position_key before POST; vitest 17 PASS; honesty false; D2/D6 paths untouched. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-02.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-01 (retest D1)
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-EMP-FE-02 READY_FOR_QA
u65: zero-seed · browser-only
honesty: hrm_personnel_uat_ready=false

entry_criteria:
  - docs/qa/evidence/po-hrm-e2e-link-emp-fe-02.md
  - stack L0 + qc:fe-be-health PASS

read_first:
  - FE-02 HDSD ids: hdsd-decisions-form-code|title|type|employee|position|status|submit · hdsd-decisions-effective-wh-hint
  - Labels: Số / mã quyết định · Vị trí · Trạng thái=Có hiệu lực

task (D1 only + must_keep):
  - /hr/decisions → Thêm → fill code/title → type person-bound → employee → position CatalogSearchPicker → status Hiệu lực
  - Assert hint visible; Lưu → Network POST /decisions 2xx
  - Profile Quá trình công tác F5 → badge decision_id/decision_code (hdsd-work-timeline-decision-*)
  - Regression: D2 WH picker PASS · D6 HTP-05 PASS · J-HRM-01..04
  - cấm: seed · claim personnel UAT · PASS only API

exit: evidence update qa-01 (or qa-02) · residual R-EMP-DEC-WH-BROWSER-01 close or re-open
```
