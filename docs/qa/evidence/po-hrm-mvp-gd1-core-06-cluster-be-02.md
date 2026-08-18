# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-06) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE06BE2-MSLI26NR` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** |
| **preserve_default** | true |
| **uc_ids** | `UC-BP-CORE-06` |
| **depends_on** | QA-01 FAIL `CORE06QA1-MSLHUNCJ` · FE-01 READY · API-01 CONFIRMED · `CORE05QC1-MSLGVT40` · Nest `/core` DENY |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · soft≠CORE-06 DONE · U65 zero-seed |
| **env** | hrm-api LIVE `:28001` (rebuild dist + restart) · emp `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` · `company_id=main` |

---

## Mission closed

| # | Item | Result |
|---|------|--------|
| 1 | Whitelist optional `status` (+ soft `termination_context_id`) on `EmployeeProfileListQueryDto` | **PASS** |
| 2 | `listAssets` SQL filter when `status` provided · assigned-only rows | **PASS** |
| 3 | rebuild + restart dist LIVE `:28001` | **PASS** |
| 4 | jest regression | **PASS** · 15 tests (BE-02 ×4 + CORE-05 ×11) |
| 5 | DENY Nest `/core` invent · DENY PAY/CORE-07 DONE · must_keep CORE-05 · DENY invent TERM table · honesty · seed · claim CORE-06 DONE | **PASS** |

**P0 closed:** `R-CORE-06-STATUS-QUERY-400` — `GET …/assets?status=assigned` no longer `400 HRM-VAL-001`.

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | UC-BP-CORE-06 · Diễn biến checklist «đang giữ» = `status=assigned` |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md` · **R-CORE-06-TERM-CHK-01** · F-CORE-AST-02 RETAIN |
| **qa_fail** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-01.md` · stamp `CORE06QA1-MSLHUNCJ` |
| **must_keep** | CORE-05 BB/serial/`DELETE-FORBIDDEN` · Nest `/core` DENY · no `hrm_termination` invent |

---

## Code delta (FIX · ADD-only query fields)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/employees/dto/employee-profile-list.query.dto.ts` | ADD optional `status` `@IsIn(assigned\|returned\|maintenance\|lost)` · soft `termination_context_id` `@MaxLength(128)` |
| `apps/api/hrm-api/src/employees/employee-profile.service.ts` | `listAssets` dedicated SELECT + `status = $n` when query.status set · CODE-MEMORY APPEND BE-02 |
| `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-06-cluster-be-02.spec.ts` | NEW jest — whitelist · assigned filter · no-status full list · CORE-05 seals |

**DENY this seat:** Nest `@Controller('core')` AST/TERM · invent `hrm_termination` / TERM PK join · invent CORE-07/PAY DONE · honesty flip · seed · claim CORE-06 module DONE · wipe CORE-05 BB/serial/DELETE-FORBIDDEN.

**Soft `termination_context_id`:** accepted by ValidationPipe only (FE correlation) — **not** applied as SQL join / TERM table filter (HOLD invent).

---

## LIVE probe `:28001` (after rebuild)

Persona JWT `ceo@xe.vn` · `companyId=main` · emp QA fixture.

| Probe | HTTP | Note |
|-------|------|------|
| `GET /api/hrm` | **200** | L0 |
| `GET …/assets?company_id=main&status=assigned` | **200** `HRM-EMP-PROFILE-200` | **total=3** · statuses all `assigned` |
| `GET …/assets?…&status=assigned&termination_context_id=soft-ctx-probe` | **200** | soft query accepted · same assigned-only |
| `GET …/assets?company_id=main` (no status) | **200** | **total=13** · mixed assigned/returned/lost (RETAIN full list) |
| `GET /api/hrm/core/employees/…/assets` | **404** `HRM-DATA-404` | Nest `/core` DENY |

---

## Jest

```text
pnpm exec jest src/employees/po-hrm-mvp-gd1-core-06-cluster-be-02.spec.ts \
  src/employees/po-hrm-mvp-gd1-core-05-cluster-be-01.spec.ts --runInBand --forceExit
→ Test Suites: 2 passed · Tests: 15 passed
pnpm run build → exit 0 (nest build + verify-dist)
```

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · Nest /core AST/TERM dual DENY
DENY invent CORE-06/07 / PAY DONE
DENY soft Profile alone = CORE-06 DONE
DENY claim CRUD slice = CORE-06 DONE
CORE-07 remain QUEUED
R-CORE-06-STATUS-QUERY-400 CLOSED (BE) — QA retest J-01+J-03
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | FIX P0 R-CORE-06-STATUS-QUERY-400: whitelist `status` + soft `termination_context_id` on `EmployeeProfileListQueryDto`; `listAssets` SQL filters when status provided. LIVE GET `?status=assigned` → **200** assigned-only (3/3). Nest `/core` **404**. jest **15 PASS**. CORE-05 must_keep RETAIN. **DENY** invent TERM/Nest dual · PAY/CORE-07 DONE · honesty flip · seed · claim CORE-06 DONE. Residual: QA browser J-01+J-03 (closed badge after assigned GET 2xx). |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-be-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: BE-02 READY CORE06BE2-MSLI26NR · docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-be-02.md · FE-01 READY · API-01 CONFIRMED · CORE05QC1-MSLGVT40 · Nest /core DENY
entry_criteria: L0 stack up · hrm-api :28001 LIVE after BE-02 rebuild · U65 zero-seed · browser-only
change_mode: RETEST
preserve_default: true

MISSION:
1) Retest J-HRM-CORE-06-01 — Tải đang giữ: Network GET …/assets?status=assigned → 200 (not 400 VAL-001) · assigned-only rows · Nest /core SoT=0
2) Retest J-HRM-CORE-06-03 — after clear assigned path, FE closed badge data-asset-checklist-closed=1 (R-CORE-06-CLOSED-FE-STALE)
3) Spot J-02/J-04/J-05 regression (lost/return PATCH · partial · Nest deny · CORE-05 seals · soft≠DONE footer)
4) DENY seed · DENY invent CORE-06/07/PAY DONE · honesty false · C-SLICE

exit: docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-02.md · PASS_TO_PM or FAIL_TO_PM · next_dispatch_prompt QC or BE residual
```
