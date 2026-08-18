# Evidence — QA-HRM-CODE-MEMORY-SRS-STEP-01

**work_item_id:** `QA-HRM-CODE-MEMORY-SRS-STEP-01`  
**from_role:** `qa`  
**to_role:** `pm`  
**date:** 2026-07-21  
**entry:** `docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md`  
**lane:** execution · P1  
**cấm respected:** seed · Phase1 DONE · rewrite code

## Verdict

**PASS_TO_PM** — W1 spine CODE-MEMORY ↔ SRS Diễn biến ↔ TechSpec §14 `ref_srs` FR-HRM-* **14/14 PASS** (1 soft residual formatting).

| Gate | Result |
|------|--------|
| Grep `@CODE-MEMORY` on 14 spine files | **PASS** (all >0) |
| Grep `Diễn biến` / `SRS bước` | **PASS** (all >0) |
| TechSpec §14 + FR-HRM-* cite | **PASS** (14/14; see soft note) |
| must_keep AC-ATT-SHEET / G-RC-01 spot | **PASS** |
| Jest smoke (no seed) | **PASS** 4 suites / 28 tests |
| Phase1 DONE claim | **not claimed** |

## Spec SoT (read)

- SRS: `docs/client-delivery/hrm/SRS_HRM_KHACH.md` — Diễn biến per FR
- TechSpec: `docs/hrm/TECHSPEC.md` §14.1–14.8 `ref_srs`
- BE handoff: `docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md`

## Sample PASS/FAIL table (W1 spine)

Criteria per file: (A) `@CODE-MEMORY` · (B) `Diễn biến` in CODE-MEMORY · (C) TechSpec §14 + FR cite · (D) exact `ref_srs:` token

| # | File | FR | TechSpec | A | B | C | D | Verdict |
|---|------|-----|----------|---|---|---|---|---------|
| 1 | `employees/employees.controller.ts` | EM-01 | §14.1 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 2 | `employees/employees.service.ts` | EM-01 | §14.1 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 3 | `contracts-insurance/contracts-insurance.controller.ts` | CI-01 · CI-02 | §14.2 · §14.3 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 4 | `contracts-insurance/contracts-insurance.service.ts` | CI-01 · CI-02 | §14.2 · §14.3 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 5 | `attendance/attendance.controller.ts` | AT-14 · AT-10 | §14.4 · §14.5 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 6 | `attendance/attendance.service.ts` | AT-01 | §14.4 liên kết | ✓ | ✓ | ✓ | ✗ | **PASS*** |
| 7 | `attendance/attendance-catalog.service.ts` | AT-14 | §14.4 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 8 | `attendance/leave-requests.service.ts` | AT-10 | §14.5 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 9 | `payroll/payroll.controller.ts` | PR-05 | §14.6 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 10 | `payroll/payroll.service.ts` | PR-05 | §14.6 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 11 | `recruitment/recruitment.controller.ts` | RC-01 | §14.7 · G-RC-01 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 12 | `recruitment/recruitment.service.ts` | RC-01 | §14.7 · §14.9 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 13 | `settings-catalogs/settings-catalogs.controller.ts` | SC-01 | §14.8 | ✓ | ✓ | ✓ | ✓ | **PASS** |
| 14 | `settings-catalogs/settings-catalogs.service.ts` | SC-01 | §14.8 | ✓ | ✓ | ✓ | ✓ | **PASS** |

\* **Soft residual (P3 / doc-only):** `attendance.service.ts` file header cites `TechSpec: … §14.4 liên kết · FR-HRM-AT-01` **without** the literal token `ref_srs:`. FR + §14 still present; Diễn biến #7 method annotated. Optional BE follow-up: normalize to `(ref_srs: FR-HRM-AT-01)` — **not blocking** this wave.

**FAIL rows:** none hard-FAIL.

## Spot-check Diễn biến vs SRS (sample)

| FR | CODE-MEMORY claims | SRS Diễn biến (khách) | Match |
|----|--------------------|----------------------|-------|
| EM-01 | #1 auth · #5 trùng mã · #7 Lưu · #8 F5 | §3.1 rows 1,5,7,8 | **PASS** |
| AT-14 | #3/#4 list+empty · #8 Lưu · #11 F5 · không bịa records | §3.4 rows 3,4,8,11 · BR-ATT-SHEET-06 | **PASS** |
| RC-01 | #1 auth · #3/#4 thiếu SL / ≤0 · #6 Lưu · #7 F5 | §3.7 rows 1,3,4,6,7 | **PASS** |

## must_keep spot-check (no rewrite)

### AC-ATT-SHEET-01..06

- `createAttendanceSheet` in `attendance-catalog.service.ts`: **INSERT `attendance_sheets` only**; **no** `INSERT INTO public.attendance_records` in that method.
- Comment + CODE-MEMORY: *«chỉ header bảng, không bịa điểm danh»* · `must_keep: AC-ATT-SHEET empty honesty`.
- Verdict: **PASS** (behavior intact; comments-only wave consistent with BE claim).

### G-RC-01

- `recruitment.service.ts`: `headcount` on `job_requisitions`, `CHECK (headcount >= 1)`, create rejects `< 1`.
- CODE-MEMORY: `must_keep: G-RC-01 headcount ≥1 · do not write job_postings.headcount`.
- Verdict: **PASS**.

## Commands run (agent)

```text
rg -c '@CODE-MEMORY' | Diễn biến | ref_srs: | FR-HRM-* | §14
  → per 14 spine files (matrix above)

pnpm --filter hrm-api exec jest \
  --testPathPatterns=payroll.controller.spec \
  --testPathPatterns=contracts-insurance.controller.spec \
  --testPathPatterns=be-hrm-g-rc-01 \
  --testPathPatterns=d-hrm-set-item-persist-01
→ Test Suites: 4 passed | Tests: 28 passed
```

**U65:** no `pnpm seed:*`; no browser mutate; no Phase1 DONE.

## Residual / not in scope

| Item | Owner hint | Priority |
|------|------------|----------|
| Normalize `attendance.service.ts` TechSpec line → `(ref_srs: FR-HRM-AT-01)` | `dev-be` (doc-only) | P3 optional |
| W2+ FR outside spine (AT-02/03 approve, PR periods mutate, candidates) | PM / BE CODE-MEMORY wave 2 | deferred (BE residual) |
| Browser U65 retest G-RC-01 / ATT sheet | separate QA work_item if needed | out of this grep wave |

## Matrix note

No UF Dev8088 column change — this wave is **doc-in-code traceability**, not UF promote. Matrix / journey 🟢 rows untouched.

---

### completion_report

**Closed:** QA grep + Diễn biến spot-check + must_keep + jest smoke for `BE-HRM-CODE-MEMORY-SRS-STEP-01` W1 spine — **14/14 PASS**, soft P3 on `attendance.service` `ref_srs:` token.  
**Open:** optional BE normalize AT-01 header; W2+ CODE-MEMORY FR outside spine (deferred).

### next_owner

`pm` (optional: `qc` audit evidence-only if program wants gate stamp; else close wave / dispatch W2 CODE-MEMORY or product residual)

### next_dispatch_prompt

```
work_item_id: QC-HRM-CODE-MEMORY-SRS-STEP-01
from_role: pm
to_role: qc
lane: governance
priority: P2

entry_criteria: QA-HRM-CODE-MEMORY-SRS-STEP-01 PASS_TO_PM; evidence docs/qa/evidence/qa-hrm-code-memory-srs-step-01-20260721.md
exit_criteria:
  1) Audit sample table 14/14 PASS; confirm no logic rewrite / no Phase1 DONE claim
  2) Soft residual attendance.service ref_srs: token = GWC condition P3 optional OR waive
  3) GO / GWC with evidence path; PASS_TO_PM
cấm: seed · rewrite apps/** · claim Phase1 DONE
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qa-hrm-code-memory-srs-step-01-20260721.md`
