# Evidence — QA-PO-HRM-PAY-CNTT-BE-01-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-BE-01-R2` |
| **parent** | `PO-HRM-PAY-CNTT-BE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-11 |
| **persona** | `ceo@xe.vn` / `du-lich.ceo@xe.vn` · `company_id=main` |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## Environment

| Item | Value |
|------|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` |
| portal proxy | `http://127.0.0.1:5173` |
| xbos-api | `http://127.0.0.1:28002` |
| probe stamp | `CNTTBER2QA-MSO8HVER` |
| machine JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-be-01-r2.FINAL.json` |
| probe script | `scripts/qa/_tmp-qa-po-hrm-pay-cntt-be-01-r2.mjs` |

---

## L0 — Stack health

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| qc:dev-stack | `pnpm run qc:dev-stack` | **PASS** | hrm + xbos + portal HTTP 200; Node exit flake `UV_HANDLE_CLOSING` after summary (checks green) |
| qc:fe-be-health | `pnpm run qc:fe-be-health` | **PASS** exit 0 | employees + catalog-sync direct + proxy 200 |

---

## L1 — Jest regression

```bash
cd apps/api/hrm-api
pnpm exec jest pay-cntt-setup.service.spec.ts pay-period-input-pack.service.spec.ts pay-sheet-template.service.spec.ts --no-coverage
```

| Suite | Result |
|-------|--------|
| `pay-cntt-setup.service.spec.ts` | **PASS** |
| `pay-period-input-pack.service.spec.ts` | **PASS** |
| `pay-sheet-template.service.spec.ts` | **PASS** |

**Exit 0 · 27/27 tests** (QA re-run 2026-08-11)

---

## L1 — Live API probe (PASS)

DTO contract notes (aligned to dev smoke + `pay-cntt-setup.dto.ts`):

| Body field | Convention |
|------------|------------|
| `company_id` | snake_case required on CNTT setup CRUD |
| `effectiveFrom` | camelCase required on policy pack create |
| `policyPackId` / `inputPackProfileId` | camelCase on template bind |
| Input-line create | camelCase: `employeeId`, `componentCode`, `sourceKind` |
| Employee pick | `GET /employees?company_id=main&page_size=1` (not `/payroll/employees`) |

### AC-CNTT-SETUP-02 — Policy pack CRUD

| Step | Method / path | Status | Code |
|------|---------------|--------|------|
| POST | `POST /payroll/pay-policy-packs` | **201** | `HRM-PAY-POL-201` |
| GET list | `GET /payroll/pay-policy-packs?company_id=main` | **200** | pack in list |

**Verdict:** 🟢 PASS

### AC-CNTT-SETUP-04 — Input profile CRUD

| Step | Method / path | Status | Code |
|------|---------------|--------|------|
| POST | `POST /payroll/pay-input-pack-profiles` | **201** | `HRM-PAY-INP-PROF-201` |
| GET list | `GET /payroll/pay-input-pack-profiles?company_id=main` | **200** | profile in list |

**Verdict:** 🟢 PASS

### F-PAY-SETUP-RESOLVE-01

| Step | Method / path | Status |
|------|---------------|--------|
| Resolve | `GET /payroll/pay-setup/resolve?company_id=main&business_line_tag=DPHH` | **200** `HRM-PAY-SETUP-200` · `recommended` present |

**Verdict:** 🟢 PASS

### AC-CNTT-SETUP-03 — Period `setupContext` snapshot

| Step | Result |
|------|--------|
| POST template with `policyPackId` + `inputPackProfileId` | **201** `HRM-PAY-TPL-201` |
| POST period `paySheetTemplateId` (2026-07, overlap-safe month) | **201** `HRM-PAY-201` |
| `sheet_template_snapshot_json.setupContext` | `policyPackId`, `inputPackProfileId`, `allowedSourceKinds: [manual, kpi]` |

**Verdict:** 🟢 PASS

### HRM-PAY-INP-PROFILE-422 — `sourceKind=revenue`

| Step | Result |
|------|--------|
| Employee | `GET /employees` → `235428a3-f74b-413a-a27d-51ad9963cd75` |
| POST input-line | **422** `HRM-PAY-INP-PROFILE-422` — *Cho phép: manual, kpi* |

**Verdict:** 🟢 PASS (expected reject)

### scope_parity U19 — member GET holding policy → 404

| Step | Result |
|------|--------|
| Group CEO list `main` | **200** · pack visible |
| Member `du-lich.ceo@xe.vn` GET by id | **404** `HRM-PAY-POL-404` |

**Verdict:** 🟢 PASS

---

## L2 / Browser — NOT_PROMOTED

| UF / Screen | Status | Reason |
|-------------|--------|--------|
| STP-HUB Thiết lập CNTT | **NOT_PROMOTED** | `grep apps/web`: 0 hits `pay-policy-packs` / `PayPolicyPack` / `payroll/setup` |
| AC-CNTT-SETUP-02/04 FE mutate | **NOT_PROMOTED** | `R-CNTT-FE` — hub UI out of scope BE-01 |

Per exit criteria: BE slice **PASS** with FE gap documented; ≠ UF-HRM-10 payroll E2E.

---

## Summary matrix

| Criterion | Verdict |
|-----------|---------|
| L0 qc:dev-stack + fe-be-health | 🟢 PASS |
| L1 Jest 27/27 | 🟢 PASS |
| L1 policy pack CRUD live | 🟢 PASS |
| L1 input profile CRUD live | 🟢 PASS |
| L1 pay-setup/resolve | 🟢 PASS |
| L1 setupContext on period bind | 🟢 PASS |
| L1 HRM-PAY-INP-PROFILE-422 | 🟢 PASS |
| L1 scope_parity U19 | 🟢 PASS |
| Browser U65 Thiết lập | ⚪ NOT_PROMOTED |
| payroll_e2e_ready=false | ✅ kept |
| Formula evaluator HOLD | ✅ kept |

**Overall:** 🟢 **PASS_TO_PM**

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-CNTT-FE | Thiết lập hub UI (`pay-policy-packs` FE) | dev-fe |
| R-CNTT-MOUNT | XLSX column verify | ba-process |
| R-CNTT-SALES | sales → input-lines bridge | dev-be |

---

## completion_report

### Closed

1. Retest after `D-PAY-CNTT-BE-COMPILE-01` — CNTT routes live on `:28001`.
2. L0 stack + FE↔BE health PASS.
3. Jest **27/27** PASS (cross-check dev evidence).
4. L1 live API: policy/profile CRUD, resolve, setupContext bind, profile 422, scope_parity — all PASS.
5. Browser Thiết lập documented **NOT_PROMOTED** (no FE wiring).
6. Prior FAIL defects **D-PAY-CNTT-BE-COMPILE-01** / **D-PAY-CNTT-BE-RUNTIME-01** closed on retest.

### Open (out of BE-01 scope)

- FE Thiết lập hub (`R-CNTT-FE`).
- Full payroll UF browser E2E (`payroll_e2e_ready=false`).

---

## next_owner

**pm** → optional **qc** narrow gate on BE slice; dispatch **dev-fe** for `R-CNTT-FE`

---

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-PAY-CNTT-BE-01
from_role: qa
to_role: qc
lane: execution
parent: PO-HRM-PAY-CNTT-BE-01

read_first:
- docs/qa/evidence/qa-po-hrm-pay-cntt-be-01-r2.md
- docs/qa/evidence/po-hrm-pay-cntt-be-01-r2.md

entry_criteria: QA-PO-HRM-PAY-CNTT-BE-01-R2 PASS_TO_PM; L0–L1 PASS; browser NOT_PROMOTED documented

exit_criteria:
- Audit L1 matrix vs dev evidence — no regression vs R1 FAIL
- GWC or GO narrow BE slice only; payroll_e2e_ready=false; formula HOLD
- must_keep: U65 zero-seed; ≠ UF-HRM-10
- evidence docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md
- ack_status PASS_TO_PM or GWC with R-CNTT-FE carry
```

---

## evidence_path

`docs/qa/evidence/qa-po-hrm-pay-cntt-be-01-r2.md`
