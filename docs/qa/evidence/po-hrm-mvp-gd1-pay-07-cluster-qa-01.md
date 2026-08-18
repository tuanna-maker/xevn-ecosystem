# Evidence — PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY07QA1-MSMEY7K3`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-07 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-07 bundle | **PASS (54)** |
| L1 regression cite | **cite BE-01 bundle · delegate PAY06QA1-MSMECGBI PAY06 smoke · PAY01..05 in bundle** |
| Nest `/core` payroll term hits | **0** (expect 0) |

## Payslip final-pay scan

```json
{
  "list_status": 200,
  "scanned": 120,
  "sampleId": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
  "finalPayFieldProbe": {
    "isFinalPay": false,
    "terminationSettlementId": null,
    "settlementStatus": null
  },
  "l25_final_dto_keys": true
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-07-01** | PASS | GET preview employee_id=3ad58ec2… → 200 HRM-PAY-200 |
| **J-HRM-PAY-07-02** | PASS | POST process fresh period → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-07-03** | PASS_WITH_HOLD | FE settle after 2xx+F5 HOLD until PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01 · API POST termination-settle RETAIN cite |
| **J-HRM-PAY-07-04** | PASS_WITH_HOLD | Final process is_final_pay HOLD U65 (no resigned employee + posted settlement) · jest process order cite BE-01 |
| **J-HRM-PAY-07-05** | PASS | (b) settle severance → 400 HRM-VAL-001 · process leave_cashout → 403 HRM-PAY-TERM-403 · include_terminations → 400 HRM-PAY-TERM-400-USE-DEDI |
| **J-HRM-PAY-07-05-409** | PASS | L1 pay-term-guard 403/400 contract · live 409 on posted path HOLD U65 (no soft TERM employee without FE workflow) |
| **J-HRM-PAY-07-06** | PASS | L2.5 list 200 → GET 3a5333f7-237e-4157-bade-39c4b98a3fa9 200 · isFinalPay/settlementId keys on DTO |
| **J-HRM-PAY-07-07** | PASS_WITH_HOLD | Mid-month SPLIT static-once HOLD U65 (cite PAY04QC1 + jest payroll.service.spec split regression) |
| **J-HRM-PAY-07-08** | PASS | honesty payroll_e2e_ready=false · nest /core hits=0 · must_keep PAY01..06QC1 · ≠ process alone DONE |
| **J-HRM-PAY-06-05** | PASS | regression PAY06 POST process tax → 403 HRM-PAY-TAX-403 |
| **J-HRM-PAY-05-04** | PASS | regression PAY05 si_* → 403 HRM-PAY-SI-403 |
| **J-HRM-PAY-03-03** | PASS | regression PAY03 gtgc → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-01-04** | PASS | regression PAY01 ATT-412 → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-04-05** | PASS | L1 bundle split/gtgc regression (PAY03/04) |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | regression FORMULA-412 cite PAY02QC1 + jest — live HOLD U65 |

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · `PAY03QC1-MSMDDGWC1` · `PAY04QC1-MSMCR4GWC1` · `PAY05QC1-MSMDU2GWC1` · `PAY06QC1-MSMECGWC1` · cite `PAY06QA1-MSMECGBI`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-07 / FR-UC-BP-PAY-07 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**

## Stack note (QA)

- Stale `hrm-api` on `:28001` initially returned `Cannot POST …/termination-settle` (route absent on old binary).
- `nest start --watch` failed until missing `salary-component.dto` imports were added in `payroll.controller.ts` (compile blocker — dev-be regression).
- After restart: dedicated settle routes LIVE; settle manual payout blocked at DTO `HRM-VAL-001` before service `HRM-PAY-TERM-403` (process path 403 is primary per PAY-06 pattern).

## completion_report

**Closed:** L0 PASS · L1 jest **54/54** (`pay-term-guard` · `pay-termination.service` · `payroll.service.spec` · `pay-tncn-resolver`) · **J-HRM-PAY-07-01** GET preview **200** checklist read · **J-HRM-PAY-07-02** **HRM-PAY-ATT-412** · **J-HRM-PAY-07-05** process **HRM-PAY-TERM-403** + dual SoT **400** + settle **HRM-VAL-001** · **J-HRM-PAY-07-05-409** L1 guard contract · **J-HRM-PAY-07-06** L2.5 `isFinalPay`/`terminationSettlementId` keys · **J-HRM-PAY-07-08** honesty + must_keep PAY01..06 · regression **J-PAY-01-04** · **J-PAY-03-03** · **J-PAY-05-04** · **J-PAY-06-05** · **J-PAY-04-05**.

**Residual (not promoted):** **J-HRM-PAY-07-03** FE after 2xx+F5 HOLD (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01`) · **J-HRM-PAY-07-04** live `is_final_pay=true` HOLD U65 (no resigned + posted settlement without FE workflow) · **J-HRM-PAY-07-07** mid-month SPLIT HOLD · **J-HRM-PAY-07-05-409** live **HRM-PAY-TERM-409** HOLD (no soft TERM employee) · settle **VAL-001** vs **TERM-403** layering · dev-be: restore `salary-component` imports in controller (QA applied minimal import for retest) · **≠** `payroll_e2e_ready` · **≠** PAY-07 / PAY module UAT DONE.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01.md`

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-07-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01.md (AC-PAY-TERM-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-07-CLUSTER-API-01.md §5 DTO
entry_criteria: QA stamp PAY07QA1-MSMEY7K3 PASS_TO_PM · L0+L1 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE · honesty payroll_e2e_ready=false · ≠ PAY-07/PAY module UAT DONE · must_keep PAY01QC1..PAY06QC1 · acknowledge J-07-03/04/07 HOLD (FE + live final pay + mid-month) · J-07-05 settle VAL-001 vs TERM-403 note · controller import fix for dev-be · FE-01 HOLD
cấm: claim PAY-07 DONE · flip payroll_e2e_ready · seed
```

---

## Addendum — IMPORT smoke (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01-IMPORT-SMOKE`)

Post-seal **#48** / BE-02-IMPORT-01 only: **`nest build` exit 0** · pay-term jest **54/54** · `qc:fe-be-health` PASS · stamp **`PAY07QAIMP-MSMEPAY7I`** · `payroll.controller.spec` **2 fails → P2 dev-be** (not gating). Detail: `po-hrm-mvp-gd1-pay-07-cluster-qa-01-import-smoke.md`.
