# QA-UX-EMPTY-STATE-01 — EmptyState moods (UX-10) browser U65

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-UX-EMPTY-STATE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **dev_handoff** | `docs/qa/evidence/d-ux-empty-state-fe-01-20260728.md` (**READY_FOR_QA**) |
| **spec_ref** | `docs/program/UX-UI-ERP-ANALYSIS.md` §3 Loading/Empty/Error · **UX-10** · Wave B EmptyState 3 moods |
| **ack_status** | **PASS_TO_PM** |
| **locks** | U65 zero-seed · HOLD_DEPLOY · browser-only · no seed · no deploy |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Host** | `http://127.0.0.1:5173` |
| **Script** | `node scripts/qa/qa-ux-empty-state-01-browser.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-ux-empty-state-01-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/qa-ux-empty-state-01/` |

---

## Runtime truth (authoritative)

```text
=== VERDICT PASS hardFails=[] ===
```

| Field | Value |
|-------|--------|
| `verdict` | **PASS** |
| `hardFails` | **[]** |
| `finishedAt` | `2026-07-28T09:01:14.xxxZ` (runtime file) |
| Seed | **false** |
| HOLD_DEPLOY | **true** |

---

## Exit criteria

| # | AC | Result |
|---|----|--------|
| 1 | Vitest `EmptyState.test.ts` 6/6 | **PASS** (re-run `pnpm test -- src/components/hrm/EmptyState.test.ts` → 6 passed) |
| 2 | Dashboard empty zones → EmptyState + VI CTA | **PASS** — `dashboard-payroll-chart-empty` / `dashboard-dept-salary-empty` / `dashboard-newest-employees-empty` + CTA `Tính lương` / `Xem nhân sự` |
| 3 | Contracts empty + load-fail error | **PASS** — `contracts-list-empty` mood=none CTA `Xóa bộ lọc`; `contracts-list-empty-error` mood=error CTA `Thử lại` |
| 4 | must_keep smoke | **PASS** — Clock-In · Payroll tax · Profile C2 · Advance UX-06 cancel→reopen no stale |
| 5 | evidence_path | this file |
| 6 | PASS_TO_PM / FAIL | **PASS_TO_PM** |
| 7 | cấm seed/deploy/Phase1 DONE / đè C1… | **Honored** |

---

## L0 / unit (supporting)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **HTTP 200** (cleanup UV assert noise on Windows — health OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** exit 0 |
| vitest EmptyState | **6/6 PASS** |
| Seed | **None** (U65) |

---

## Browser execution (U65)

### Persona / URL

- Login inject API → portal `http://127.0.0.1:5173`
- Dashboard Index: **`/hr/?portal=1&tenantId=xevn&companyId=main`** (note: `/hr?…` blanks — Vite base `/hr/`)

### UF-ES — Dashboard empty (UX-10)

| Step | Evidence |
|------|----------|
| Natural | Payroll chart already empty (`employees_with_salary=0`) → EmptyState + **Tính lương** |
| Forced summary empty (route fulfill — FE only, not DB seed) | `dashboard-payroll-chart-empty` + `dashboard-newest-employees-empty` visible |
| Forced dept empty (aggregate>0, avg_salary=0) | `dashboard-dept-salary-empty` + CTA **Tính lương** |
| Screens | `01-dashboard-natural.png` · `02-dashboard-forced-none.png` · `03-dashboard-dept-empty.png` |

Runtime:

```text
PASS  UF-ES-dashboard-payroll-empty  mood=none cta=Tính lương
PASS  UF-ES-dashboard-newest-empty  mood=none cta=Xem nhân sự
PASS  UF-ES-dashboard-dept-salary-empty  mood=none cta=Tính lương
```

### UF-ES — Contracts empty / error

| Step | Evidence |
|------|----------|
| Filter no-match | Search `ZZZ_EMPTY_STATE_NO_MATCH_QA_20260728` → `contracts-list-empty` + **Xóa bộ lọc** |
| Load-fail | `**/api/hrm/contracts**` → 500 fulfill → `contracts-list-empty-error` mood=**error** + **Thử lại** |
| Screens | `04-contracts-filtered-empty.png` · `05-contracts-load-error.png` |

### must_keep smoke — all PASS

| UF | Detail |
|----|--------|
| `UF-ES-mustkeep-clock-in` | wizardVisible · crash=false · `06-clock-in.png` |
| `UF-ES-mustkeep-payroll-tax` | tax settlement visible · root≈3e6 · `07-payroll-tax.png` |
| `UF-ES-mustkeep-advance-ux06` | cancel→reopen `inputs=["","Tháng 7/2026"]` · no `QA_ES_ADV_STALE` · `08-advance-reopen.png` |
| `UF-ES-mustkeep-profile-c2` | profile + tab-groups + core strip · `09-profile-c2.png` |

---

## Residual / not promoted

| Item | Severity | Note |
|------|----------|------|
| Other lists still bland DataTable empty | **P2** (FE residual R1) | Outside DoD ≥2 surfaces — Wave B follow-up |
| `packages/ui` EmptyState (no mood) | **INFO** | HRM SoT is Wave B source |
| Network fulfill/abort for empty/error | — | FE path only; **not** DB seed; U65 honored |

---

## Defect lifecycle

| Defect | Status |
|--------|--------|
| None opened this wave | — |

---

## Handoff

- **completion_report:** UX-10 EmptyState SoT verified on Dashboard (3 testids) + Contracts (none/error). Vitest 6/6. must_keep C1/tax/Profile C2/Advance UX-06 PASS. Residual P2 migrate other lists deferred.
- **next_owner:** `pm` → `qc` (Wave B gate / GWC) or next Wave B WI per peer plan
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-ux-empty-state-01-20260728.md`
- **next_dispatch_prompt:** (copy-ready below)

```text
work_item_id: QC-UX-EMPTY-STATE-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA-UX-EMPTY-STATE-01 PASS_TO_PM; evidence docs/qa/evidence/qa-ux-empty-state-01-20260728.md; runtime docs/qa/evidence/_tmp-qa-ux-empty-state-01-runtime.json hardFails=[]
read_first:
  - docs/qa/evidence/qa-ux-empty-state-01-20260728.md
  - docs/qa/evidence/_tmp-qa-ux-empty-state-01-runtime.json
  - docs/program/UX-UI-ERP-ANALYSIS.md §3 · UX-10
exit_criteria:
  1) Confirm runtime verdict PASS hardFails=[] (runtime truth over MD)
  2) Spot-check screens 02/04/05 EmptyState VI CTA + mood=error Thử lại
  3) must_keep not regressed (cite QA smoke)
  4) GO or GWC with residual P2 bland-list migrate only; HOLD_DEPLOY; cấm Phase1 DONE
  5) evidence_path: docs/qa/evidence/qc-ux-empty-state-01-20260728.md
cấm: seed · deploy · claim Phase1/PROD DONE
```
