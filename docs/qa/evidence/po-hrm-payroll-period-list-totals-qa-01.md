# Evidence — `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — L1 API assert (U65 zero-seed) |
| **priority** | P2 (retest after DevOps) |
| **parent** | `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01` ← prior `…-BE-01` |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **closes** | **`D-PAY-LIST-TOTALS-RUNTIME`** · **`R-PAY-PERIOD-LIST-TOTALS`** (live list totals) |
| **ack_status** | **`PASS_TO_PM`** (retest) · prior wave `FAIL_TO_PM` retained below |
| **overall** | **PASS** (retest stamp) |
| **stamp (retest)** | `PAYLISTTOTQA-MSIZ6H4F` |
| **stamp (prior FAIL)** | `PAYLISTTOTQA-MSIYQJRA` |
| **parent devops stamp** | `PAYLISTTOTDEVOPS-MSIZRBLD` |
| **machine JSON** | `_tmp_pay_list_totals_qa01_retest.json` · prior `_tmp_pay_list_totals_qa01.json` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip — no list item had `payroll_e2e_ready=true` |
| **Formula LIVE / invent** | **DENIED** | Compared existing payslip SUM only |
| **Seed** | **DENIED** | U65 · existing periods (`cf38deac`, `d92d3bbb`, drafts) |
| **process-post GWC · period-bind GWC · summary-cards FE** | **must_keep** | **not reopened** — read-only GET list/payslips |
| **Module UAT / J-HRM-07 e2e DONE** | **DENIED** | Not claimed |

---

## Mission

Assert after process (or existing processed period): `GET /payroll/periods` item has display-ready `total_gross` / `total_net` / `total_deduction` (+ `payslip_summary`) matching payslip SUM / prior PROCESS body; draft totals = 0.

---

## Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM + XBOS + portal **200** (Node UV_HANDLE_CLOSING noise on Windows exit — services OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## Probe (U65 · no seed · no PROCESS re-run)

| Step | Call | Result |
|------|------|--------|
| 1 | Login `ceo@xe.vn` via portal → XBOS token | OK |
| 2 | `GET /api/hrm/payroll/periods?company_id=main` | **200** `HRM-PAY-200` · **32** periods (processed **6** · draft **24**) |
| 3 | Inspect processed `cf38deac-8b64-474d-9aee-b34249c0f5a1` (prior PROCESS stamp target) | Keys: id…`employee_count`…template — **no** `total_gross` / `total_net` / `total_deduction` / `payslip_summary` |
| 4 | Inspect processed `d92d3bbb-…` | Same — **fields absent** · `employee_count=53` |
| 5 | `GET /api/hrm/payroll/payslips?company_id=main&period_id=cf38deac-…` | **200** · **1** slip · SUM gross/net = **12345000** · deduction **0** (matches prior PROCESS `payslip_summary` / F5 **12.345.000 ₫**) |
| 6 | Draft `4d2111d7-…` (`employee_count=0`) | Same key set — **no** total fields to assert `0` |
| 7 | `GET /api/hrm/payroll/periods/:id` | **404** `Cannot GET` (no public get-by-id route) — list-only AC still FAIL |

### Sample list keys (live)

```text
id, company_id, period_label, start_date, end_date, status, created_by,
processed_at, closed_at, created_at, updated_at, employee_count,
formula_definition_id, pay_sheet_template_id, sheet_template_snapshot_json
```

---

## AC matrix

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| AC-LIST-TOTALS-01 | Processed list item has `total_gross` / `total_net` / `total_deduction` | Fields **absent** on `cf38deac` + `d92d3bbb` | **FAIL** |
| AC-LIST-SUMMARY-01 | `payslip_summary.{total_gross,total_net[,total_deduction]}` present & equals top-level | `payslip_summary` **absent** | **FAIL** |
| AC-LIST-MATCH-SUM-01 | List totals = SUM payslip amounts for period | Cannot compare — list totals missing; payslip SoT **12345000** proven for `cf38deac` | **FAIL** (blocked by missing fields) |
| AC-DRAFT-ZERO-01 | Draft / empty → totals **0** (or empty summary) | Draft keys also omit totals | **FAIL** |
| AC-SCOPE-MAIN-01 | `company_id=main` Group CEO list OK | **200** · periods include `main` + holding rollup | **PASS** |
| AC-HONESTY-01 | `payroll_e2e_ready=false` | No flip observed | **PASS** |
| AC-NO-SEED-01 | No `pnpm seed:*` | None used | **PASS** |
| AC-MUST-KEEP-01 | Do not reopen process-post / period-bind / summary-cards | Read-only probes only | **PASS** |

---

## Root cause (runtime)

| Artifact | Timestamp / content |
|----------|---------------------|
| Source `apps/api/hrm-api/src/payroll/payroll.service.ts` `mapPeriod` | **2026-08-07 20:05:11** — emits `total_*` + `payslip_summary` + LATERAL |
| Live `apps/api/hrm-api/dist/payroll/payroll.service.js` `mapPeriod` | **2026-08-07 17:16:40** — **stale** · emits only through `employee_count` (no totals) |
| Live `:28001` | Serving **stale dist** → BE-01 code **not** on wire |

**Defect class:** `runtime_stale_build` (BE source READY, live Nest not rebuilt/restarted) — **not** formula invent · **not** sealed GWC reopen.

---

## Residual (P0 for this seat)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **`D-PAY-LIST-TOTALS-RUNTIME`** | **P0** | **devops** → then **qa** retest | Rebuild + restart `hrm-api` so `dist` ≥ source BE-01; re-run this QA seat |
| **`R-PAY-PERIOD-LIST-TOTALS`** | P3 product | open until live PASS | OBS from summary-cards QC — still open on wire |
| **`payroll_e2e_ready`** | honesty | LOCKED false | unchanged |
| Optional FE list column bind | out-of-slice | after live BE PASS | not opened this wave |

---

## completion_report

### Closed

- L0 + fe-be health PASS; U65 login `ceo@xe.vn` scope main OK.
- Payslip SoT for processed `cf38deac` SUM **12345000** matches prior PROCESS / F5 (comparison baseline ready).
- Honesty / must_keep / no-seed / DENY module UAT & J-HRM-07 claims held.

### Residual / not closed

- **FAIL:** live `GET /payroll/periods` does **not** expose `total_gross` / `total_net` / `total_deduction` / `payslip_summary` (stale `dist` vs BE-01 source).
- Draft zero-totals AC blocked by same absence.
- **R-PAY-PERIOD-LIST-TOTALS** remains OPEN on runtime.

## next_owner

**devops** (rebuild+restart hrm-api) → **qa** retest `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01` → **qc** only after QA PASS

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01
from_role: pm
to_role: devops
lane: execution
priority: P0
parent: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01
entry_criteria: QA FAIL D-PAY-LIST-TOTALS-RUNTIME — evidence docs/qa/evidence/po-hrm-payroll-period-list-totals-qa-01.md · stamp PAYLISTTOTQA-MSIYQJRA · src mapPeriod has totals (20:05) · dist stale (17:16) · :28001 healthy but old build
exit_criteria: Rebuild hrm-api so dist/payroll/payroll.service.js mapPeriod emits total_gross/total_net/total_deduction + payslip_summary + LATERAL; restart single listener :28001; qc:dev-stack + qc:fe-be-health PASS; no seed; do not flip payroll_e2e_ready; must_keep process-post/period-bind/summary-cards
evidence_path: docs/qa/evidence/po-hrm-payroll-period-list-totals-devops-01.md
ack_status: READY_FOR_QA
cấm: seed · invent formula LIVE · flip payroll_e2e_ready · reopen sealed GWC
next after READY: re-dispatch QA PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01 retest (same AC matrix vs payslip SUM cf38deac=12345000)
```

## ack_status (prior wave)

**FAIL_TO_PM**

---

# RETEST — after `PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-DEVOPS-01`

| Field | Value |
|-------|--------|
| **retest_of** | `PAYLISTTOTQA-MSIYQJRA` |
| **devops_entry** | `docs/qa/evidence/po-hrm-payroll-period-list-totals-devops-01.md` · stamp `PAYLISTTOTDEVOPS-MSIZRBLD` |
| **stamp** | `PAYLISTTOTQA-MSIZ6H4F` |
| **machine JSON** | `_tmp_pay_list_totals_qa01_retest.json` |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** |
| **date** | 2026-08-07 |

### Honesty locks (retest — unchanged)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip — no list item had ready=true |
| **Formula LIVE / invent** | **DENIED** | Compared existing payslip SUM only |
| **Seed** | **DENIED** | U65 · existing `cf38deac` / draft `4d2111d7` |
| **process-post / period-bind / summary-cards GWC** | **must_keep** | **not reopened** — read-only GET |
| **Module UAT / J-HRM-07** | **DENIED** | Not claimed |

---

## Environment (L0 — retest)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM + XBOS + portal **200** (Windows UV_HANDLE_CLOSING exit noise — services OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **none** |

---

## Probe (U65 · no seed · no PROCESS)

| Step | Call | Result |
|------|------|--------|
| 1 | Login `ceo@xe.vn` | **201** `XBOS-AUTH-200` |
| 2 | `GET /api/hrm/payroll/periods?company_id=main` | **200** `HRM-PAY-200` · **33** periods (processed **7** · draft **24**) |
| 3 | Processed `cf38deac-8b64-474d-9aee-b34249c0f5a1` | `total_gross=12345000` · `total_net=12345000` · `total_deduction=0` · `payslip_summary` mirrors top-level |
| 4 | `GET …/payslips?period_id=cf38deac-…` | **1** slip · SUM gross/net **12345000** · ded **0** |
| 5 | Draft `4d2111d7-…` (`employee_count=0`) | totals **0** + `payslip_summary` zeros |
| 6 | Keys sample | includes `total_gross` / `total_deduction` / `total_net` / `payslip_summary` |

### Sample list keys (live — retest)

```text
id, company_id, period_label, start_date, end_date, status, created_by,
processed_at, closed_at, created_at, updated_at, employee_count,
total_gross, total_deduction, total_net, payslip_summary,
formula_definition_id, pay_sheet_template_id, sheet_template_snapshot_json
```

---

## AC matrix (retest)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| AC-LIST-TOTALS-01 | Processed list item has `total_gross` / `total_net` / `total_deduction` | Present on `cf38deac` = 12345000 / 12345000 / 0 | **PASS** |
| AC-LIST-SUMMARY-01 | `payslip_summary.*` present & equals top-level | Nested mirrors top-level | **PASS** |
| AC-LIST-MATCH-SUM-01 | List totals = SUM payslip amounts | List **12345000** = payslip SUM **12345000** | **PASS** |
| AC-DRAFT-ZERO-01 | Draft / empty → totals **0** | Draft `4d2111d7` all zeros + summary zeros | **PASS** |
| AC-SCOPE-MAIN-01 | `company_id=main` Group CEO list OK | **200** · 33 rows | **PASS** |
| AC-HONESTY-01 | `payroll_e2e_ready=false` | No flip observed | **PASS** |
| AC-NO-SEED-01 | No `pnpm seed:*` | None used | **PASS** |
| AC-MUST-KEEP-01 | Do not reopen process-post / period-bind / summary-cards | Read-only probes only | **PASS** |

---

## Residual (after retest)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **`D-PAY-LIST-TOTALS-RUNTIME`** | — | **CLOSED** | DevOps rebuild stamp `PAYLISTTOTDEVOPS-MSIZRBLD` + QA retest PASS |
| **`R-PAY-PERIOD-LIST-TOTALS`** | — | **CLOSED** (API list totals on wire) | Optional FE list-column bind remains **out-of-slice** / idle-ok — not opened |
| **`payroll_e2e_ready`** | honesty | LOCKED false | unchanged |
| FE list column bind (if product wants columns) | P3 OBS | after QC | **not** this seat |

---

## completion_report (retest)

### Closed

- L0 + fe-be health PASS; U65 login `ceo@xe.vn` scope main OK.
- Live `GET /payroll/periods` exposes display-ready `total_*` + `payslip_summary`.
- `cf38deac` list totals == payslip SUM **12345000**; draft empty totals **0**.
- Prior FAIL root cause (stale dist) closed by DevOps; AC matrix 8/8 PASS.
- Honesty / must_keep / no-seed / DENY module UAT & J-HRM-07 & ready flip held.

### Residual / not closed

- Optional FE list UI column bind (out-of-slice) — not claimed.
- Do **not** flip `payroll_e2e_ready` / claim J-HRM-07 module UAT.

## next_owner

**qc** (narrow seat — list totals GWC) → then **pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QC-01
from_role: pm
to_role: qc
lane: execution
priority: P2
parent: PO-HRM-PAYROLL-PERIOD-LIST-TOTALS-QA-01
program: PO-HRM-CONTINUOUS-W7-20260807

entry_criteria:
- QA retest PASS: docs/qa/evidence/po-hrm-payroll-period-list-totals-qa-01.md
- stamp PAYLISTTOTQA-MSIZ6H4F · machine _tmp_pay_list_totals_qa01_retest.json
- DevOps READY: PAYLISTTOTDEVOPS-MSIZRBLD (D-PAY-LIST-TOTALS-RUNTIME closed)
- AC-LIST-TOTALS-01 · AC-LIST-SUMMARY-01 · AC-LIST-MATCH-SUM-01 · AC-DRAFT-ZERO-01 PASS
- cf38deac list totals == payslip SUM 12345000; draft totals 0

Mission (narrow):
1. Audit QA evidence + machine JSON; spot-check LIVE GET /payroll/periods if needed
2. GWC or GO for R-PAY-PERIOD-LIST-TOTALS / list totals seat only
3. must_keep: process-post / period-bind / summary-cards GWC — do NOT reopen
4. DENY payroll_e2e_ready flip · seed · invent formula · module UAT · J-HRM-07 DONE
5. Write docs/qa/evidence/po-hrm-payroll-period-list-totals-qc-01.md

exit_criteria: QC GO or GWC with residual owner; honesty locks held
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
