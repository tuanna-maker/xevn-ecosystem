# BE evidence — R-REC-HC-OVERRIDE-CELLID (stable cell identity reuse)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · dev-be |
| **change_mode** | FIX (narrow) · preserve_default · code_memory APPEND |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **closes** | residual **R-REC-HC-OVERRIDE-CELLID** (P2 carried by QC-02 GWC) |

## spec_read_ack

- **srs/ba:** `docs/program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md` — Option A **LOCKED** (REUSE by natural key, not mint) · §1.5 · §2 BR · §3 errors · §5 AC · §7 spec-says/code-does
- **data:** `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` §6.1 stable identity · §6.2 natural key · §7.2 UQ spawn
- **api:** `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` §5 F-REC-HC-01 · §8 `HRM-HC-*` · HC-S4/S5
- **code (AS-IS):** `recruitment-plan-headcount.ts` `normalizeHeadcountCell` minted `randomUUID()` before the natural-key reuse branch → `!cell.cell_id` dead → override omitting `cell_id` minted a new identity → YCTD `headcount_cell_id` orphaned.

## What changed (allowed_paths)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.ts` | ADD `HRM_HC_CELL_ID_MISMATCH`. `normalizeHeadcountCell` / `normalizeMonthsData` accept `opts.mintWhenMissing`; when `false`, a missing `cell_id` returns `''` (mint deferred) instead of minting. GET/read path keeps default mint. `@CODE-MEMORY-CHANGE` appended. |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | `buildPlanDepartmentWritePlan` normalizes with `mintWhenMissing:false`, then per cell: (a) natural-key hit → lock guard (RETAIN 409 LOCKED) → foreign `cell_id` → **409 `HRM-HC-CELL-ID-MISMATCH`** → else **reuse** `prev.cell_id`; (b) no hit + empty id → **mint once**. `@CODE-MEMORY-CHANGE` appended. |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.spec.ts` | NEW regression (6 cases). |

**Design:** reuse resolved inside `buildPlanDepartmentWritePlan` **before** the replace transaction, so every reject (LOCKED, MISMATCH, VAL) still happens with the grid untouched (must_keep BE-02 no-wipe).

## BR / AC coverage (Option A)

| BR / AC | Behavior |
|---------|----------|
| BR-REC-HC-CELL-STABLE · AC-REC-HC-CELL-01/01b/01c | Override omit `cell_id` + NK hit → reuse `C0`; YCTD `headcount_cell_id` stays `C0`; re-spawn `skipped_duplicate` |
| BR-REC-HC-CELL-MINT-ONCE · AC-REC-HC-CELL-ALT-03 | New NK → mint fresh valid surrogate |
| BR-REC-HC-CELL-ID-MISMATCH · AC-REC-HC-CELL-EX-02 | Foreign `cell_id` same NK → 409 `HRM-HC-CELL-ID-MISMATCH`, identity unchanged, no transaction |
| BR-REC-01-LOCK (RETAIN) · AC-REC-HC-CELL-EX-01 | Locked + no override → 409 `HRM-HC-CELL-LOCKED`, grid + identity intact |
| BR-O3-QTY-DRIFT (RETAIN) · AC-REC-HC-CELL-ALT-01 | Spawn drift warn; YCTD headcount NOT overwritten |
| BR-BP-HC-04 (RETAIN) | Exactly one YCTD per `headcount_cell_id` |

## Jest evidence

```
# New + sealed regressions (BE-02 + headcount pure)
npx jest src/recruitment/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.spec.ts \
         src/recruitment/po-hrm-mvp-gd1-rec-01-cluster-be-02.spec.ts \
         src/recruitment/recruitment-plan-headcount.spec.ts --runInBand
=> Test Suites: 3 passed, 3 total · Tests: 16 passed, 16 total

# Full recruitment module (excluding cross-lane attendance parity spec — see Residual)
npx jest src/recruitment --runInBand --testPathIgnorePatterns "p1-phase1-be-crud-rd-parity"
=> Test Suites: 20 passed, 20 total · Tests: 169 passed, 169 total
```

New spec cases (6): reuse-on-omit + YCTD link/O3 · draft reuse without override · explicit echo match · 409 MISMATCH · 409 LOCKED no-wipe · MINT-ONCE new NK.

## must_keep verified

- 409 `HRM-HC-CELL-LOCKED` + validate-then-write no-wipe (BE-02) — spec case EX-01 asserts `withTransaction` not called, grid intact.
- Spawn idempotency BR-BP-HC-04 — one YCTD per `cell_id` after reuse.
- O3 no silent YCTD overwrite — seeded YCTD headcount stays `2` after override to `7` (drift warn only).
- U19 scope parity — `upsertRecruitmentPlan` still uses `resolveHrmListScope` + `assertResourceInHrmScope`; `collectExistingCellMap` unchanged. No scope logic touched.

## Residual

| Item | Owner | Note |
|------|-------|------|
| `p1-phase1-be-crud-rd-parity.spec.ts` — 2 FAIL (`AttendanceService … attendanceConfig.ensureWorkSitesSchema` undefined) | **Attendance lane (not this WI)** | Pre-existing / in-flight: `attendance.service.ts` modified + `attendance-config.service.ts` untracked by another lane. Unrelated to REC-HC; my edits touch only recruitment cell identity. |

## Honesty

`recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed (jest only, no DB seed) · no mint+relink · no P0 wipe reopen · no honesty flip.

## Completion contract

- **ack_status:** READY_FOR_QA
- **next_owner:** qa
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md`
