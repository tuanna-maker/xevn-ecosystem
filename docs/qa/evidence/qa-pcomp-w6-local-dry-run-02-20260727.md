# QA-PCOMP-W6-LOCAL-DRY-RUN-02 — Team dry-run W6 local (2026-07-27)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PCOMP-W6-LOCAL-DRY-RUN-02` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Host** | `http://127.0.0.1:5173` only |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · negative `du-lich.ceo@xe.vn` |
| **L0 entry** | `docs/qa/evidence/pcomp-w6-do-stack-refresh-01-20260727.md` |
| **Prior pack** | `docs/qa/evidence/qa-pcomp-w6-local-uat-01-20260725.md` |
| **Locks** | U65 zero-seed · HOLD_DEPLOY · NOT :8088 · NOT Phase1/PROD |
| **Sponsor sign-off** | **NOT replaced** — `PCOMP-W6-SP-01` still required |

---

## 0. Overall verdict

| Gate | Result |
|------|--------|
| L0 200×3 | **PASS** — hrm `:28001` / xbos `:28002` / portal `:5173` |
| HRM freeze `dist-uat-w6` | **PASS** — PID `25960` · `node --enable-source-maps dist-uat-w6/main.js` (no nest watch / rebuild) |
| `qc:dev-stack` probes | **PASS** ✓×3 (process exit UV abort noise — known Windows flake) |
| `qc:fe-be-health` | **PASS** exit **0** ALL PASS |
| P-CC-01..09 | **9/9 PASS** (portal-proxy + SPA shell `#root`) |
| J-HRM-01..07 | **7/7 PASS** (portal-proxy L2.5 + deep GET where route exists) |
| Member negative | **PASS** — KPI holding → **409** `SCOPE_CONTEXT_MISMATCH` |
| Mutate FE+F5 | **N/A** — load/nav only (U65 dry-run) |
| Browser DOM click | **PARTIAL** — API+shell feasible; sponsor owns visual UF on SP-01 |
| Phase1 / PROD / :8088 | **NOT claimed** |

**Team dry-run:** **PASS**. **Next:** PM invite sponsor **`PCOMP-W6-SP-01`**.

---

## 1. L0 reconfirm

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** |
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| `GET http://127.0.0.1:5173` | **200** |
| Process CMD on `:28001` | `node --enable-source-maps dist-uat-w6/main.js` · PID **25960** |
| `pnpm run qc:fe-be-health` | ALL PASS (direct + portal proxy employees/catalog-sync + login) |
| `pnpm run qc:dev-stack` | ✓ hrm / ✓ xbos / ✓ portal → then UV abort exit `3221226505` (noise) |

**Did not:** start nest watch · rebuild hrm-api · touch `:8088` · run any `seed:*`.

---

## 2. Method

| Layer | How | U65 |
|-------|-----|-----|
| L0 | HTTP probes + `qc:fe-be-health` + process CMD freeze check | No seed |
| L2 P-CC | `PORTAL_DEV_URL=http://127.0.0.1:5173 node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | No seed |
| L2 SPA shell | `node scripts/tmp-qa-pcomp-w6-dry-run-02-shell.mjs` — pack routes HTTP 200 + `#root` | No seed |
| L2.5 J-HRM | Same probe list→detail + deep GET contract / requisition / attendance | No seed |
| Browser click | Not claimed as UF 🟢 — sponsor SP-01 | — |
| Mutate | None | Honored |

---

## Command table

| # | Command | Result |
|---|---------|--------|
| 1 | Process audit `dist-uat-w6` | PID 25960 matching freeze CMD |
| 2 | `pnpm run qc:dev-stack` | ✓×3 then Windows UV abort (functional PASS) |
| 3 | `pnpm run qc:fe-be-health` | exit **0** ALL PASS |
| 4 | `PORTAL_DEV_URL=http://127.0.0.1:5173 node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | L2 **23/23** · L2.5 **7/7** exit **0** |
| 5 | `node scripts/tmp-qa-pcomp-w6-dry-run-02-shell.mjs` | 9/9 shell PASS · deep GET 03/05/06 PASS |

---

## 3a. P-CC checklist

| ID | Result | Evidence note |
|----|--------|---------------|
| **P-CC-01** | **PASS** | Login 201 `XBOS-AUTH-200`; `expiresInSec=86400`; JWT Δ=86400; company=`main` |
| **P-CC-02** | **PASS** | `group-member-units` 200 `XBOS-TENANT-200` members ≥1 |
| **P-CC-03** | **PASS** | `employees?company_id=main` 200 `HRM-EMP-200`; shell 200 `#root` |
| **P-CC-04** | **PASS** | settings-catalogs + contracts 200; KPI holding rollup 200 (no 409 for group CEO) |
| **P-CC-05** | **PASS** | insurance list 200 `HRM-CON-200` |
| **P-CC-06** | **PASS** | requisitions 200 `HRM-REC-200` |
| **P-CC-07** | **PASS** | attendance records 200 `HRM-ATT-200` |
| **P-CC-08** | **PASS** | payslips list 200 `HRM-PAY-200` |
| **P-CC-09** | **PASS** | catalog-governance inbox 200 `XBOS-CAT-212` (empty OK) |

No ERROR-banner class API fail / 409 storm on load for group CEO.

---

## 3b. J-HRM-01..07 (L2.5)

| J-ID | Result | Path analogue |
|------|--------|---------------|
| **J-HRM-01** | **PASS** | Contracts row → `GET /employees/:id?company_id=main` **200** |
| **J-HRM-02** | **PASS** | Employees list → `GET /employees/:id?company_id=main` **200** |
| **J-HRM-03** | **PASS** | Contract list → `GET /contracts-insurance/contracts/:id?company_id=main` **200** `HRM-CON-200` |
| **J-HRM-04** | **PASS** | Insurance `employee_id` → employee GET **200** |
| **J-HRM-05** | **PASS** | Requisitions + candidates list **200**; deep `GET requisitions/:id` **200** |
| **J-HRM-06** | **PASS** | Attendance list → linked employee **200**; deep `GET records/:id` **200** `HRM-ATT-200` |
| **J-HRM-07** | **PASS** | Payslip list → linked `employee_id` GET **200** (no `GET /payslips/:id` — see R2) |

Probe: `L2 checks: 23/23 PASS` · `L2.5 journeys: 7/7 PASS`.

---

## 3c. Negative scope

| Step | Result |
|------|--------|
| Login `du-lich.ceo@xe.vn` | OK |
| KPI rollup `companyId=holding` | **409** `SCOPE_CONTEXT_MISMATCH` — **PASS** |

---

## 4. Residuals (not blockers for SP-01 invite)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R1** | P1 ops | devops | Keep HRM on `dist-uat-w6` during sponsor window — do **not** start `dev:hrm-api` / nest watch / rebuild |
| **R2** | P2 note | ba/dev-be | No `GET /api/hrm/payroll/payslips/:id` (historical J-HRM-07 = employee link) |
| **R3** | Process | pm/sponsor | Browser DOM click = sponsor **PCOMP-W6-SP-01** (team dry-run = API+shell) |
| **R4** | P3 ops | devops | `qc:dev-stack` Windows UV abort after ✓ print — trust probe lines + `qc:fe-be-health` |

**No P0 product FAIL** in P-CC / J-HRM scope.

---

## 5. Explicit non-claims

- Not Phase 1 DONE / not PROD-READY / not UAT-PASS for sponsor  
- Not tested on `:8088` / `portal.xe.vn`  
- No seed  
- Does **not** close `PCOMP-W6-SP-01`

---

## 6. Handoff

```text
completion_report: |
  QA-PCOMP-W6-LOCAL-DRY-RUN-02 PASS on localhost :5173.
  L0 green; HRM still dist-uat-w6 PID 25960; qc:fe-be-health exit 0.
  P-CC-01..09 PASS; J-HRM-01..07 PASS (L2.5 + deep GET samples).
  Member negative 409 PASS. No seed. HOLD_DEPLOY. NOT Phase1/PROD/UAT-PASS.
  Next = PM invite sponsor PCOMP-W6-SP-01.
next_owner: pm / sponsor
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-pcomp-w6-local-dry-run-02-20260727.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W6-SP-01
from_role: pm
to_role: sponsor (invite)
entry_criteria:
  - L0 green: http://127.0.0.1:5173 · qc:fe-be-health exit 0
  - HRM freeze: node dist-uat-w6/main.js on :28001 (do not nest watch / rebuild)
  - Team dry-run PASS: docs/qa/evidence/qa-pcomp-w6-local-dry-run-02-20260727.md
  - Stack refresh SoT: docs/qa/evidence/pcomp-w6-do-stack-refresh-01-20260727.md
  - Prep pack (if needed): docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md
exit_criteria:
  - Sponsor FE click checklist P-CC-01..09 + J-HRM-01..07 on :5173
  - Account: ceo@xe.vn / Xevn@2026
  - Marks verdict on bus PCOMP-W6-SP-01 (UAT-PASS / UAT-FAIL / BLOCKED)
cấm: seed · deploy :8088 · portal.xe.vn · wipe dist-uat-w6 · Phase1/PROD claim
locks: U65 · HOLD_DEPLOY · local :5173 only
```
