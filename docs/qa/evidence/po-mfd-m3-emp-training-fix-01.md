# Evidence — PO-MFD-M3-EMP-TRAINING-FIX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-TRAINING-FIX-01` |
| **role** | dev-fe |
| **date** | 2026-08-04 |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **ack_status** | **READY_FOR_QA** |
| **Employees CLOSED** | **false** (not inventing) |
| **Attendance CLOSED** | **false** |
| **spec_ref** | HDSD CH06 §6.2 Đào tạo · UC-HRM-21 · matrix #19 SCR-TAB-TRAINING · residual `R-MFD-M3-EMP-TRAINING-STATS` |
| **qa_parent** | `docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md` |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| HDSD | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` §6.2 — tab Đào tạo: Thêm→Lưu→F5; lazy tab không được trắng màn hình |
| Matrix | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` #19 C6 …→Hồ sơ→Đào tạo · BROKEN `stats.completed` TypeError |
| QA runtime | GET `…/training` **200** rồi pageError reading `'completed'` |
| Sibling FE pattern | `EmployeeAssets` / `EmployeeKPI` / `EmployeeRewardsDiscipline` — destructure `getStats` rồi `const stats = getStats()` |

## Root cause

| Layer | Finding |
|-------|---------|
| Hook | `useEmployeeTraining` returned **`getStats`** (function), **not** `stats` |
| UI | `EmployeeTraining` destructured `{ stats }` → always `undefined` after load |
| Crash | `{stats.completed}` → `TypeError: Cannot read properties of undefined (reading 'completed')` even when Nest GET training returned **200** |
| Nest | No API change required — list body need not include `stats`; FE computes client-side |

## Fix (allowed_paths)

| File | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useEmployeeTraining.ts` | `EMPTY_TRAINING_STATS` + `computeTrainingStats` (always defined); `getStats()` + convenience `stats`; CODE-MEMORY |
| `apps/web/hrm/src/components/employee/EmployeeTraining.tsx` | Use `getStats?.() ?? EMPTY_TRAINING_STATS` (parity siblings); CODE-MEMORY APPEND |
| `apps/web/hrm/src/hooks/useEmployeeTraining.stats.test.ts` | Unit: null/empty → zeros; rollup completed/hours/cost |

## must_keep (untouched)

LIST #1–6 · CREATE #7 · DETAIL #10–12 · IMPORT #8 · SCOPE #28 · other profile tabs · Nest training contract

## Verify

```text
cd apps/web/hrm
pnpm test -- src/hooks/useEmployeeTraining.stats.test.ts
→ Test Files 1 passed · Tests 2 passed
```

## Explicit non-claims

- No browser LIVE stamp on #19 in this wave (QA retest)
- No seed · no invent Employees/Attendance CLOSED
- No Nest DTO change

## completion_report

**Closed:** P0 crash on Employee profile → Đào tạo when Nest returns training list without `stats`. FE now always has numeric summary defaults.

**Residual:** QA must retest matrix #19 LIVE (browser: list→profile→Đào tạo; GET training 200; no pageError; summary cards + empty/list OK).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-TRAINING-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
ack_status target: PASS_TO_PM

## Retest (LIVE #19)
Parent FAIL: docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md · residual R-MFD-M3-EMP-TRAINING-STATS
FE fix evidence: docs/qa/evidence/po-mfd-m3-emp-training-fix-01.md

entry_criteria:
- L0 qc:fe-be-health PASS
- Portal http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main
- Account ceo@xe.vn / Xevn@2026
- FE fix landed (getStats / EMPTY_TRAINING_STATS)

exit_criteria:
1. Click path: Employees list → open profile → nhóm HR → Đào tạo
2. Network GET …/training → 200
3. No pageError / console TypeError on stats.completed
4. Summary cards render (0 or counts); empty list OR rows OK — no white crash
5. Stamp matrix #19 LIVE (or PARTIAL only if CRUD depth out of RO scope — crash must be gone)
6. must_keep #1–6 #7 #10–12 #8 #28 still LIVE; no seed
7. evidence_path: docs/qa/evidence/po-mfd-m3-emp-training-qa-01.md
8. ack_status PASS_TO_PM · Employees CLOSED=false unless all 28 LIVE per program rules
```
