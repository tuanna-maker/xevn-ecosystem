# Evidence — `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — L0 runtime rebuild (U65 zero-seed) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **closes** | `D-PAY-LIST-TOTALS-RUNTIME` (runtime stale build) |
| **ack_status** | **`READY_FOR_QA`** |
| **stamp** | `PAYLISTTOTDEVOPS-MSIZRBLD` |
| **machine JSON** | `_tmp_pay_list_totals_devops_smoke.json` |
| **persona smoke** | `ceo@xe.vn` · `company_id=main` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip |
| **Formula LIVE / invent** | **DENIED** | Rebuild only — no PROCESS / formula change |
| **Seed** | **DENIED** | U65 · no `pnpm seed:*` |
| **process-post / period-bind / summary-cards GWC** | **must_keep** | not reopened |
| **Module UAT / J-HRM-07** | **DENIED** | not claimed |

---

## Mission

Rebuild + restart `hrm-api` so live `dist` serves BE-01 `mapPeriod` totals (`total_gross` / `total_net` / `total_deduction` + `payslip_summary` + LATERAL join).

---

## Steps executed

| # | Action | Result |
|---|--------|--------|
| 1 | Audit `:28001` | Single listener PID **30668** · `node dist/main` · started **19:01** · serving stale dist |
| 2 | Compare src vs dist | SRC `payroll.service.ts` **20:05:11** has totals · DIST **17:16:40** `mapPeriod` stopped at `employee_count` |
| 3 | Stop stale process | `Stop-Process 30668` · port **28001 free** |
| 4 | `pnpm --filter hrm-api run build:clean` | **exit 0** · DIST mtime **20:17:34** · `mapPeriod` emits totals + `PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL` |
| 5 | Restart listener | Single PID **16152** · start **20:18:03** (≥ dist) · `GET /api/hrm` **200** · metrics **200** |
| 6 | Duplicate check | **Listener count = 1** on `:28001` |
| 7 | `pnpm run qc:dev-stack` | HRM + XBOS + portal **HTTP 200** (Windows `UV_HANDLE_CLOSING` exit noise — same as QA note; services OK) |
| 8 | `pnpm run qc:fe-be-health` | **ALL PASS** exit **0** |
| 9 | Optional smoke `GET /api/hrm/payroll/periods?company_id=main` | **200** `HRM-PAY-200` · totals present — see below |

---

## Dist verification (post-build)

`apps/api/hrm-api/dist/payroll/payroll.service.js` `mapPeriod` (excerpt):

- `total_gross` / `total_deduction` / `total_net` from row
- nested `payslip_summary.{total_gross,total_deduction,total_net}`
- list/query SQL uses `LEFT JOIN LATERAL` `pay_tot` (`PAYROLL_PERIOD_PAYSLIP_TOTALS_LATERAL`)

---

## Optional smoke (no seed · no PROCESS)

| Check | Observed | Verdict |
|-------|----------|---------|
| Login `ceo@xe.vn` | **201** `XBOS-AUTH-200` | PASS |
| List periods | **200** `HRM-PAY-200` · **33** rows | PASS |
| Processed `cf38deac-8b64-474d-9aee-b34249c0f5a1` | `total_gross=12345000` · `total_net=12345000` · `total_deduction=0` · `payslip_summary` mirrors | **PASS** (matches payslip SUM SoT) |
| Draft `4d2111d7-…` (`employee_count=0`) | totals **0** + summary zeros | PASS (smoke) |
| Keys include totals | `total_*` + `payslip_summary` present | PASS |

JSON: `_tmp_pay_list_totals_devops_smoke.json`

---

## Gate table

| Gate | Result |
|------|--------|
| Rebuild dist ≥ BE-01 source | **PASS** (20:17:34) |
| Single `:28001` listener | **PASS** (PID 16152) |
| `qc:dev-stack` services 200 | **PASS** (UV exit noise ignored) |
| `qc:fe-be-health` | **PASS** |
| Smoke list totals vs 12345000 | **PASS** (devops smoke — QA retest owns AC matrix) |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **`R-PAY-PERIOD-LIST-TOTALS`** | P3 product | **qa** retest | Runtime defect closed; QA must re-assert full AC matrix |
| Optional FE list column bind | out-of-slice | after QA PASS | not opened |
| `payroll_e2e_ready` | honesty | LOCKED false | unchanged |

---

## completion_report

### Closed

- Stale `dist` rebuilt via `build:clean`; `mapPeriod` + LATERAL on wire.
- Single Nest listener on `:28001` (no duplicates).
- L0 `qc:dev-stack` (services 200) + `qc:fe-be-health` ALL PASS.
- DevOps smoke: `cf38deac` list totals = **12345000** matching prior payslip SUM SoT.
- Honesty: no seed · no formula invent · no `payroll_e2e_ready` flip · GWC must_keep held.

### Residual / not closed

- Formal QA AC matrix retest still required (`PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01`).
- Do **not** claim module UAT / flip e2e ready.

---

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01 (retest)
from_role: pm
to_role: qa
parent: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01
program: PO-HRM-CONTINUOUS-W7-20260807
priority: P0

entry_criteria:
- DevOps READY_FOR_QA: docs/qa/evidence/po-hrm-payroll-period-list-totals-devops-01.md
- stamp PAYLISTTOTDEVOPS-MSIZRBLD · dist rebuilt 20:17 · :28001 PID single · smoke cf38deac totals=12345000
- prior FAIL stamp PAYLISTTOTQA-MSIYQJRA closed at runtime layer

Mission:
1. Re-run AC matrix from po-hrm-payroll-period-list-totals-qa-01.md against LIVE GET /payroll/periods
2. Assert processed cf38deac-8b64-474d-9aee-b34249c0f5a1 total_gross/total_net/total_deduction + payslip_summary == payslip SUM 12345000
3. Assert draft empty totals = 0
4. L0 qc:dev-stack + qc:fe-be-health; U65 zero-seed; browser-only if extending to FE
5. must_keep: process-post / period-bind / summary-cards GWC
6. Do NOT flip payroll_e2e_ready · no seed · no invent formula LIVE · no module UAT claim
7. Write evidence update or new stamp; ack_status PASS_TO_PM or FAIL_TO_PM

exit_criteria: AC-LIST-TOTALS-01 · AC-LIST-SUMMARY-01 · AC-LIST-MATCH-SUM-01 · AC-DRAFT-ZERO-01 PASS; honesty locks held
```

## ack_status

**READY_FOR_QA**

## evidence_path

`docs/qa/evidence/po-hrm-payroll-period-list-totals-devops-01.md`
