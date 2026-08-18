# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API evaluator honesty** (not browser UF) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC5 L1 honesty |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-eval-01.mjs` |
| **stamp** | `PAYFEQ1-MSIHM5A1` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Preview compute returns `payroll_e2e_ready=false` + warnings `STAGED_EVAL_SUBSET` / `NOT_CUSTOMER_UAT` |
| **Formula LIVE** | **DENIED** | Opaque GĐ1 still **412-PREVIEW-STUB**; staged `gd1_eval_v1` ≠ customer LIVE |
| **Browser UF** | **DENIED** | L1 only — no FE preview UX invent |
| **Seed** | **DENIED** | U65 zero-seed · API product path only · reused live closed ATT sheet |
| **Module UAT / J-HRM-07** | **DENIED** | Process lines success blocked by C&B bag (`FORMULA-412-VARS`) |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| Pre-test dist | **Stale** — `pay-formula-evaluator.js` missing · `evaluateBoundFormula` absent in `pay-formula.service.js` |
| QA recovery | `pnpm --filter hrm-api run build` → kill `:28001` → `pnpm --filter hrm-api run start:prod` |
| Post-rebuild | evaluator dist **present** · formulas probe **200** `HRM-PAY-FORMULA-200` |
| Auth | Portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` (distinct JWT `sub`) |

---

## AC matrix (L1 evaluator honesty)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** Opaque GĐ1 preview | `412` `HRM-PAY-FORMULA-412-PREVIEW-STUB` | Opaque publish → preview **412** stub · `payroll_e2e_ready=false` · msg admits need `gd1_eval_v1` | **PASS** |
| **2** `gd1_eval_v1` + overrides | 2xx compute · ready **false** | **201** `HRM-PAY-FORMULA-200` · gross **8_000_000** · net **7_200_000** · lines **2** · `payroll_e2e_ready=false` · warnings include `STAGED_EVAL_SUBSET`, `PREVIEW_DRY_RUN`, `NOT_CUSTOMER_UAT` | **PASS** |
| **3** PROCESS no published formula | `HRM-PAY-FORMULA-412` · no silent 0₫ | Retire all active → process Sep-2026 period aligned to closed ATT sheet → **412** `HRM-PAY-FORMULA-412` · msg *refuse silent zero process* · **not** 2xx | **PASS** |
| **4a** Incomplete hours bag | ATT-412 / PREVIEW-STUB / VARS | Preview `payable_hours` missing → **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` (ATT line absent) | **PASS** |
| **4b** ATT open process | `HRM-PAY-ATT-412` | Draft period 2031-09 (no closed sheet) → **412** `HRM-PAY-ATT-412` | **PASS** |
| **5** Payslip lines only on success | Fail paths no processed lines; success only when evaluate ok | ATT-open period payslips **0** · FORMULA-412 fail no 2xx · restore+process → **412** `HRM-PAY-FORMULA-412-VARS` (C&B bag incomplete) — honest block, **no** silent processed zeros | **PASS** |

### Spec cite

- API_DESIGN `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 PREVIEW · §5 PROCESS bind · §7 error taxonomy  
- BE-EVAL evidence matrix PREVIEW/PROCESS honesty  
- QA-02 CRUD dual-control baseline retained (not re-run full AC1–7)

---

## Key runtime excerpts

### AC1 — opaque preview
```text
POST /payroll/formulas/{opaqueId}/preview + overrides
→ 412 HRM-PAY-FORMULA-412-PREVIEW-STUB
  "GĐ1 opaque expression not LIVE-evaluable (need gd1_eval_v1)"
  details.payroll_e2e_ready=false
```

### AC2 — staged compute
```text
POST /payroll/formulas/{evalId}/preview { variableOverrides: { base_salary: 8000000 } }
→ 201 HRM-PAY-FORMULA-200
  gross=8000000 net=7200000 lines=2
  payroll_e2e_ready=false
  warnings: STAGED_EVAL_SUBSET, PAYROLL_E2E_READY_FALSE, PREVIEW_DRY_RUN, NOT_CUSTOMER_UAT, …
```

### AC3 — no formula → FORMULA-412
```text
(after soft-retire all active)
POST /payroll/periods/{sep2026Draft}/process
→ 412 HRM-PAY-FORMULA-412
  "No active published formula bound for period/company — refuse silent zero process"
```

### AC4 — ATT / hours honesty
```text
PROCESS open month → 412 HRM-PAY-ATT-412
PREVIEW hours-incomplete → 412 HRM-PAY-FORMULA-412-PREVIEW-STUB
```

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-STALE-DIST | BE-EVAL READY while live dist lacked evaluator until QA rebuild/restart | **dev-be / devops** — post-READY dist refresh SOP (repeat of QA-02 lesson) |
| R-PAY-F-ATT-LINE | `att_timesheet_line` → hours var bag LIVE | ATT / ba-data → **dev-be** |
| R-PAY-F-CB-BAG | PROCESS success with real C&B `base_salary` (no overrides) → payslip_lines UF | **dev-be** + **qa** browser later |
| R-PAY-FE-OPAQUE→EVAL | FE emit `gd1_eval_v1` (optional) | **dev-fe** |
| — | Browser UF / `payroll_e2e_ready` flip / formula LIVE | **DENIED** |

### Explicit non-claims

- Did **not** claim formula LIVE / customer-ready preview UAT.  
- Did **not** flip `payroll_e2e_ready`.  
- Did **not** invent browser UF without FE preview UX change.  
- Did **not** seed ATT/payslip state — reused existing closed sheet for FORMULA-412 reachability after ATT precheck.  
- Did **not** promote process payslip_lines success path (blocked honest `FORMULA-412-VARS` on C&B).

---

## completion_report

### Closed

1. Dist rebuild + restart so staged evaluator routes live.  
2. L1 AC1–AC5 PASS — opaque stub · gd1_eval_v1 preview compute · FORMULA-412 · ATT-412 · hours PREVIEW-STUB · no silent 0₫.  
3. Honesty: `payroll_e2e_ready=false` retained on compute path.  
4. Evidence JSON + this MD.

### Residual

Stale-dist OBS · ATT line · C&B process success lines · FE gd1_eval emit · module UAT DENIED.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC L1 evaluator honesty slice · **cấm** flip `payroll_e2e_ready` / claim formula LIVE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-EVAL-01 PASS_TO_PM (L1 evaluator honesty)
priority: P0

## Mission
QC gate L1 evaluator honesty after BE-EVAL + QA-EVAL:
1. Audit evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md + FINAL JSON stamp PAYFEQ1-MSIHM5A1
2. Confirm AC1 opaque → 412-PREVIEW-STUB; AC2 gd1_eval_v1 overrides → 2xx compute ready=false; AC3 FORMULA-412 no silent 0₫; AC4 ATT-412 + hours PREVIEW-STUB; AC5 fail-path no processed lines
3. Retain residuals R-PAY-F-ATT-LINE / R-PAY-F-CB-BAG / stale-dist OBS
4. GO WITH CONDITIONS or NO-GO — cấm flip payroll_e2e_ready / claim formula LIVE / module UAT

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-eval-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5 · §7

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md
honesty: payroll_e2e_ready=false
```
