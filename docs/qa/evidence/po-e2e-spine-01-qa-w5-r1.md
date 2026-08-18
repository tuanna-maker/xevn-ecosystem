# Evidence — PO-E2E-SPINE-01-QA-W5-R1 (HP-05 HĐ + HP-06 CC payroll retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W5-R1` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · hrm-api `:28001` · xbos-api `:28002` · git `dc930c5` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` |
| **prior FE fix** | `docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md` READY_FOR_QA |
| **prior FAIL** | `docs/qa/evidence/po-e2e-spine-01-qa-w5.md` (Contracts/Payroll Vite 500) |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w5-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w5-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803/` (run 16:07Z) |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-r1-test-log.md` + `.json` |
| **ack_status** | **PASS_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · HP-05 · HP-06
- journeys: **J-HRM-01** · **J-HRM-02** · **J-HRM-07**
- UF: UF-HRM-01/02/06 · FR-UC-H01 · FR-UC-H04
- hdsd_align (U76): menu **Hợp đồng** · CC **Tiền lương** · emp deep-link (must_keep)
- **must_keep:** Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 · Approve UX GWC · LV-02 HOLD T_L1 — **not** reopened

## 0. L0 + Vite transform verify (QA independent of Dev probe)

| Probe | Result |
|-------|--------|
| `qc:dev-stack` hrm+xbos+portal | **200** (Node exit noise on Windows — probes OK) |
| `GET :5173/hr/src/pages/Contracts.tsx` | **200** (was 500 W5) |
| `GET :5173/hr/src/pages/Payroll.tsx` | **200** (was 500 W5) |
| `GET :8080/hr/src/pages/Contracts.tsx` | **200** |
| `GET :8080/hr/src/pages/Payroll.tsx` | **200** |
| Browser `consoleErrors` / `pageErrors` | **[]** — no Vite 500 / dynamic import crash |

## Command table

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` | **0** | pass — hrm-api + xbos-api + portal probes **200** |
| `node scripts/qa/po-e2e-spine-01-qa-w5-browser.mjs` | **0** | pass — 12 clicks · idle_guard · U78 raw JSON |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md` | **0** | pass — pack gate (C-QA-EVID-PACK-01) |

## L2.5 journey matrix (cross-nav)

| Journey | HDSD / click path | Result |
|---------|-------------------|--------|
| **J-HRM-01** | `/hr/contracts` → employee link → profile (no 404) | **pass** |
| **J-HRM-02** | `/hr/employees/5c3ea407-…` deep-link GET **200** | **pass** |
| **J-HRM-07** | CC `/command-center/hrm/payroll` mount · F5 stable | **pass** |

## 1. Browser verdict matrix

| Case | HDSD / route | Verdict | Notes |
|------|----------------|---------|-------|
| **HP-05 HĐ** | `/hr/contracts?portal=1&companyId=main` | 🟢 **PASS** | Hợp đồng chrome · **present_with_rows** · GET contracts API **200** · no whitescreen |
| **HP-05 soft-link** | `/hr/employees/5c3ea407-…` | 🟢 **PASS** (must_keep) | GET employee **200** · J-HRM-01 contracts→profile **true** |
| **HP-06 CC payroll** | `/command-center/hrm/payroll` | 🟢 **PASS** | Mount OK · **blankPane=false** · textLen **485** · F5 stable · payslips GET **200** |
| **HP-06 emp tab** | profile tab Lương | 🟢 | honest empty subcopy (secondary — not substitute for CC) |

**Overall:** `PASS_TO_PM` — prior **R-PO-SPINE01-CONTRACTS-VITE** and **R-PO-SPINE01-PAYROLL-BLANK** **CLOSED** in browser.

## 2. Click path (12 clicks · idle_guard PASS · seed=false)

1. Auth inject `ceo@xe.vn` → `:5173`
2. `/hr/employees` → search `5c3ea407` → deep-link emp `5c3ea407-02cb-4cfa-a36c-9ada56908010`
3. Tab **Hợp đồng** on profile
4. `/hr/contracts` → list surface with rows
5. **J-HRM-01:** contracts table → employee link → profile (no 404)
6. `/command-center/hrm/payroll` → CC Tiền lương content shell (not blank pane)
7. F5 payroll route
8. Emp profile → tab **Lương** (honest empty on profile path)

## 3. Network (key)

| Call | Status |
|------|--------|
| `GET /api/hrm/employees?company_id=main…` | **200** |
| `GET /api/hrm/employees/5c3ea407-02cb-4cfa-a36c-9ada56908010?company_id=main` | **200** |
| `GET /api/hrm/contracts-insurance/contracts?company_id=main…` | **200** |
| `GET /api/hrm/payroll/payslips?company_id=main` | **200** |
| Vite `Contracts.tsx` / `Payroll.tsx` (pre-run probe) | **200** |

## Residual

| ID | Owner | Status |
|----|-------|--------|
| R-PO-SPINE01-CONTRACTS-VITE | qa | **CLOSED** R1 |
| R-PO-SPINE01-PAYROLL-BLANK | qa | **CLOSED** R1 |
| Soft-link stamp `SP4SDEKW49` on emp list | ba/pm | product_gap — not regression |
| Phase1 / UAT DONE | pm | **not claimed** |
| Leave / LV-03/04 / Approve UX | — | **not reopened** |

## 5. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm → qc (spine wave gate) or pm program next WBS item
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w5-r1-test-log.md + .json
```

### completion_report

- **Closed:** HP-05 HĐ module after FE-VITE-PAY-CON-01 — `/hr/contracts` renders with API 200; no Vite 500; J-HRM-01 cross-nav PASS; emp deep-link GET 200 preserved (must_keep).
- **Closed:** HP-06 CC payroll — `/command-center/hrm/payroll` mounts with visible content (not blank pane); payslips API 200; F5 stable.
- **Verified:** Vite transforms 200 on `:5173` and `:8080` for Contracts/Payroll sources; zero seed; must_keep lanes not reopened.
- **Not claimed:** Phase1/UAT DONE; LV-02 T_L1 HOLD unchanged.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QC-W5-R1
from_role: pm
to_role: qc
lane: governance
entry: docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md PASS_TO_PM · HP-05/06 CLOSED · residuals R-CONTRACTS-VITE + R-PAYROLL-BLANK closed
mission: Audit U78 test-log + screenshots vs W5 FAIL; confirm no false PASS (CC blank / Vite 500); must_keep Leave/LV/Approve not regressed; GO/GWC for spine HP-05/06 slice only — no Phase1 DONE claim.
exit: qc evidence docs/qa/evidence/po-e2e-spine-01-qc-w5-r1.md · ack PASS_TO_PM or FAIL with residual WI
cấm: seed · claim UAT DONE · reopen leave ladder
```
