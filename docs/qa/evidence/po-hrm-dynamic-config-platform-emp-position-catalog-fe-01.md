# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2 |
| **supersedes** | PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01 (b5ab8c45 INVALID-HANDOFF) |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P2 |
| **program** | PO-HRM-CONTINUOUS-W8-20260807 |
| **parent** | SA FE Option **A LOCKED** · L1 **EMPPOSQA2-MSK3CDH1** RETAIN · residual **R-PLT-EMP-POS-FE-01** |
| **condition_close** | **R-PLT-EMP-POS-FE-01** (P2 · Settings job_titles EFF consumer deepen) |
| **ref_sa** | [PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md) |
| **ref_ba** | AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H · VAL-EMP-POS-CNS-01/02/03 |
| **change_mode** | **ADD** (FE consumer deepen only · Nest emp_position DENY · no seed · no L1 reopen · EMP-STATUS FE CLOSED RETAIN) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · C-SLICE-≠-MODULE · U65 zero-seed · EMP-STATUS FE CLOSED RETAIN · LVRULE HOLD · EMP-CUSTOM / ATT seals RETAIN · Nest emp_position DENY |
| **path_lock** | NFD `.git`+`apps` True · WriteAllText UTF-8 no BOM |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SA** | docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-FE-SA-01.md — Option **A LOCKED** · L-EMP-POS-FE-01..08 |
| **SA evidence** | docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-fe-sa-01.md |
| **BA** | AC-PLT-EMP-01 / 01b / 01c — Settings job_titles EFF picker when EFF>0; invent KEY toast; empty CTA when EFF=0 |
| **API_DESIGN** | assertJobTitleKeyInCatalog · invent **400 HRM-EMP-POSITION-KEY** · WH alias **HRM-WH-PICK-REQUIRED** ≡ · empty **HRM-WH-PICK-EMPTY-CATALOG** |
| **BE** | L1 stamp **EMPPOSQA2-MSK3CDH1** RETAIN · Nest emp_position ABSENT/404 DENY · Settings EFF LIVE |
| **Peer** | EMP-STATUS / ATT-CODE FE-SA Option A — KEY toast + EFF consumer deepen |

**spec says / code does:**

- *spec says:* EFF>0 → EmployeeFormDialog + EmployeeWorkTimeline position picker = Settings `job_titles` EFF; invent/out-of-EFF (STAFF OBS) → Network **400 HRM-EMP-POSITION-KEY** (+ WH alias ≡) + VI toast · no persist; EFF=0 → empty CTA CH06f · no seed · no free-text SoT; Nest emp_position DENIED.
- *code did (trước):* CatalogSearchPicker LIVE nhưng form reset bind **display label** (`employee.position`) thay vì `job_title_key`; mutations **không** surface POSITION KEY toast (chỉ STATUS/REASON); WH catch dùng generic `toErrorMessage`; empty CTA Settings link mỏng; invent/STAFF edit resolve ABSENT.
- *code does (sau ADD):* form SoT = `job_title_key` + `resolveEmpPositionEditValue` clear invent/STAFF; mutations normalize + KEY toast; WH KEY toast + empty CTA class; lib helpers + vitest.

---

## 2. completion_report

**Closed (CONDITION R-PLT-EMP-POS-FE-01):**

| Gap | Impl |
|-----|------|
| Form position value = display label | Reset + submit SoT = `employee.job_title_key` / `normalizeEmpPositionKey` |
| Invent/STAFF out-of-EFF edit | `resolveEmpPositionEditValue` when EFF>0 → clear picker (không invent free-text) |
| EMP mutate KEY toast ABSENT | `empMutateKeyToastMessage` · **HRM-EMP-POSITION-KEY** / **HRM-WH-PICK-REQUIRED** VI |
| WH invent toast generic | `empPositionKeyToastMessage` on WH save catch |
| Empty EFF CTA thin | CH06f copy + `data-hrm-empty-catalog=HRM-WH-PICK-EMPTY-CATALOG` on form + WH |
| Soft-retire hide | RETAIN via `jobTitleOptionsFromCatalog` → `toCatalogPickerOptions` active-only |
| Nest emp_position | **DENIED** — no FE Nest route / dual master |

**Paths touched:**

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/empPositionCatalog.ts` (+test) | **NEW** — KEY constants · normalize · resolve edit · toast helpers |
| `apps/web/hrm/src/hooks/useEmployeeMutations.ts` | **ADD** normalize job_title_key + POSITION KEY toast (peer STATUS) |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | **ADD** job_title_key SoT · resolve invent/STAFF · empty CTA · CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx` | **ADD** invent KEY toast · empty CTA CH06f · CODE-MEMORY APPEND |
| `apps/web/hrm/src/integrations/hrmApi.ts` | **NO CHANGE** — Settings SoT already LIVE; Nest emp_position DENY |

**must_keep honored:** POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_position DENY · SoftDel · ET/ST pickers · U65 · personnel=false · C-SLICE · L1 EMPPOSQA2-MSK3CDH1 RETAIN.

**Residual / OUT:**

| ID | Status |
|----|--------|
| Nest `emp_position` / FE-ADMIN Nest position | **DENIED RETAIN** |
| EMP-STATUS FE CLOSED | **CLOSED RETAIN** — STAFF OBS owned here as POSITION KEY |
| FE-ADMIN EMP-ST / LVRULE 01g | **HOLD RETAIN** — DENY invent |
| EmployeeWorkHistory free-text | **OUT primary** this Task |
| Module EMP UAT / personnel flip | **DENIED** · honesty false |

**EV_LEN:** (printed after write)

---

## 3. Bind matrix (EFF>0 vs EFF=0)

| Catalog | Form position picker | WH position_key | Submit | Negative |
|---------|----------------------|-----------------|--------|----------|
| Settings job_titles EFF>0 | CatalogSearchPicker ∈ EFF (active; soft-retire hide) | same | `job_title_key` / `position_key` code | invent/STAFF → **400 HRM-EMP-POSITION-KEY** (+ WH-PICK-REQUIRED ≡) + VI toast · no persist |
| EFF=0 | empty + CTA CH06f / HRM-WH-PICK-EMPTY-CATALOG | same | no invent free-text SoT | **no seed** |
| Edit invent/STAFF | resolve → clear; user re-picks ∈ EFF | picker retains only ∈ EFF for new save | omit empty job_title_key on update | opaque 400 closed by toast |

---

## 4. Verify

| Command | Result |
|---------|--------|
| `npx vitest run src/lib/empPositionCatalog.test.ts` (cwd apps/web/hrm) | **7 passed** |
| CODE-MEMORY APPEND | EmployeeFormDialog · EmployeeWorkTimeline · useEmployeeMutations · empPositionCatalog |
| solid_convention_ack | FE bind Settings EFF display-ready; Nest emp_position DENY; bootstrap/empty only EFF=0 |
| U65 | no seed · empty EFF CTA hợp lệ |
| Honesty | personnel/e2e/printable=false · C-SLICE |
| DENY Nest emp_position | source-scan no `/employees/emp-positions` |

---

## 5. DENY checklist

| DENY | Status |
|------|--------|
| Nest `emp_position` table/routes/admin FE | **PASS** |
| invent LVRULE FE 01g | **PASS** — untouched |
| invent EMP-ST FE-ADMIN / reopen EMP-STATUS FE CLOSED | **PASS** — untouched |
| reopen EMP-POSITION L1 invent KEY seat | **PASS** — L1 RETAIN |
| flip `*_ready` / module EMP UAT / Face | **PASS** — honesty false |
| seed | **PASS** — U65 |
| rewrite EmployeeWorkHistory as mandatory | **PASS** — OUT |

---

## 6. handoff

**ack_status:** **READY_FOR_QA**

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution
priority: P2
entry_criteria:
  - FE-01-R2 READY_FOR_QA — docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-fe-01.md
  - SA Option A LOCKED · L1 EMPPOSQA2-MSK3CDH1 RETAIN · Settings job_titles EFF LIVE
  - U65 browser-only · zero-seed
exit_criteria:
  - AC-PLT-EMP-01: EmployeeFormDialog + EmployeeWorkTimeline picker ∈ EFF → Lưu → 2xx → FE + F5
  - AC-PLT-EMP-01b: invent / STAFF-out-of-EFF → Network 400 HRM-EMP-POSITION-KEY (or WH-PICK-REQUIRED ≡) + VI toast · no persist · F5
  - AC-PLT-EMP-01c: EFF=0 (or empty catalog path) → empty CTA CH06f · no seed · no free-text SoT
  - Orthogonal STAFF OBS closable without reopening EMP-STATUS FE CLOSED
  - must_keep: POSITION KEY · EMP-STATUS FE CLOSED · EMP-CUSTOM · ATT · LVRULE HOLD · Nest emp_position DENY
  - honesty false · C-SLICE · no module EMP UAT claim
cấm: seed · Nest emp_position invent · reopen EMP-STATUS FE CLOSED · invent LVRULE / EMP-ST FE-ADMIN · flip ready · Face
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-fe-01.md
ack_status_target: PASS_TO_PM
```

---

## 7. Hand-off fields

| Field | Value |
|-------|--------|
| **completion_report** | FE Option A deepen: Settings job_titles EFF picker SoT on form+WH; invent KEY toast; STAFF edit resolve; empty CTA; vitest 7 PASS; Nest DENY; seals RETAIN; honesty false · EV_LEN printed |
| **next_owner** | qa |
| **next_dispatch_prompt** | §6 above (QA-FE-01 U65) |
| **evidence_path** | this file |
| **ack_status** | **READY_FOR_QA** |