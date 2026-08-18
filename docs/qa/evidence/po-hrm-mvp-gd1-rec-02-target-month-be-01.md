# Evidence — PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **residual** | `R-REC-02-TARGET-MONTH-DATE` (P2 OBS from QA stamp **REC02QA-MSKV6ETH**) |
| **change_mode** | **FIX** (narrow) · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **QA residual** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md` § L1 note + R-REC-02-TARGET-MONTH-DATE — `target_month: "8"` / `2026-08` → **500** `HRM-SYS-001` PG date cast |
| **api** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` §6 DTO `target_month` ISO first-of-month · error family `HRM-YCTD-*` · `HRM-YCTD-VAL-400` |
| **data** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md` · REC-01 DATA-01 — `target_month date NULL` = first day of plan month |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b (latent contract; FE omits field) |

---

## Defect → fix

| Before | After |
|--------|--------|
| Create INSERT `$12::date` with raw `payload.target_month?.trim()` | `normalizeTargetMonthOrThrow` before INSERT |
| `"2026-09"` / `"8"` → PG cast → **500** `HRM-SYS-001` | `"2026-09"` → store **`2026-09-01`**; `"8"` → **400** `HRM-YCTD-VAL-400` |
| Spawn already `firstOfMonthIso` | RETAIN (aligned comment) |
| Update DTO lacked `target_month` | ADD optional field + UPDATE CASE flag (same normalizer) |

**Token:** reuse existing **`HRM-YCTD-VAL-400`** (API-01 VAL family) — no new family.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/yctd-requisition-gates.ts` | ADD `normalizeTargetMonthOrThrow` |
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | create + update wire |
| `apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts` | CODE-MEMORY + comment |
| `apps/api/hrm-api/src/recruitment/dto/update-job-requisition.dto.ts` | ADD `target_month` |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | spawn align comment RETAIN |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts` | helper + create cases |
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.spec.ts` | `firstOfMonthIso` spawn align |

**DENY respected:** no column type change · no seed · no honesty flip · no CELL-QTY/BOD/MODE/UQ/U19 rewrite.

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns=po-hrm-mvp-gd1-rec-02-cluster-be-01 \
  --testPathPatterns=recruitment-plan-headcount.spec \
  --testPathPatterns=po-hrm-mvp-gd1-rec-01-cluster-be-01 \
  --testPathPatterns=po-hrm-mvp-gd1-rec-01-cluster-be-02 \
  --testPathPatterns=po-hrm-mvp-gd1-rec-hc-override-cellid --no-coverage
```

| Suite | Result |
|-------|--------|
| REC-02 cluster be-01 (+ target_month cases) | **PASS** |
| recruitment-plan-headcount (firstOfMonthIso) | **PASS** |
| REC-01 be-01 / be-02 / override-cellid | **PASS** |
| **Total in-scope** | **5 suites · 40 tests PASS** |

Broader `src/recruitment/` also ran: **190 PASS**; **2 FAIL** in `p1-phase1-be-crud-rd-parity.spec.ts` (`AttendanceService.attendanceConfig` undefined) — **pre-existing / out of residual scope** (not target_month).

### Cases covered

| Case | Expected | Verdict |
|------|----------|---------|
| `YYYY-MM` | INSERT `YYYY-MM-01` | 🟢 |
| `YYYY-MM-01` | INSERT same | 🟢 |
| garbage (`8`, `2026-13`, `not-a-date`) | **400** `HRM-YCTD-VAL-400` · no INSERT | 🟢 |
| null / omit / `''` | INSERT `null` | 🟢 |
| spawn `firstOfMonthIso` | `YYYY-MM-01` | 🟢 |

---

## must_keep (untouched)

- 409 `HRM-HC-CELL-LOCKED` no-wipe  
- cell identity REUSE-by-NK  
- spawn UQ BR-BP-HC-04  
- REC-02 tokens CELL-QTY / BOD / MODE-UNCLASSIFIED  
- U19 list↔get scope parity  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-be-01.md` |
| **completion_report** | Narrow FIX: normalize `target_month` at service boundary (`YYYY-MM`→`YYYY-MM-01`; invalid→400 `HRM-YCTD-VAL-400` not 500 SYS). Create + update wired; spawn RETAIN `firstOfMonthIso`. Jest in-scope 40 PASS. Honesty false · C-SLICE · no seed / no column change. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01 READY_FOR_QA
residual: R-REC-02-TARGET-MONTH-DATE (close OBS from REC02QA-MSKV6ETH)
entry_criteria: L0 hrm-api rebuild+restart; U65 zero-seed; evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-be-01.md
MISSION — narrow L1 retest (probe OK for this residual; FE still omits field):
1) POST /recruitment/requisitions with target_month="2026-09" → 2xx · stored/returned first-day 2026-09-01 (not 500)
2) target_month="2026-09-01" → 2xx
3) target_month="8" (or garbage) → 400 HRM-YCTD-VAL-400 (not 500 HRM-SYS-001)
4) omit target_month → 2xx draft (RETAIN FE path)
5) must_keep smoke: SPAWN-DUP 409 · CELL-QTY 409 · MODE-UNCLASSIFIED — no regression
DENY: seed · honesty flip · claim module REC UAT
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qa-01.md
```
