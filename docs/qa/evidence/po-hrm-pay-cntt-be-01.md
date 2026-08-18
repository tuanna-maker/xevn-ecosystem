# Evidence — PO-HRM-PAY-CNTT-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BE-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-11 |
| **change_mode** | ADD |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · U65 zero-seed |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Path / section | Notes |
|----------|----------------|-------|
| **srs** | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` · UC-BP-PAY-STP-01..12 · AC-CNTT-SETUP-01..04 | Sponsor SRS confirm 2026-08-11 |
| **tech_spec** | `docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md` §4 | L4/L5/L6 layers |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.1–8.6 | `pay_policy_pack` · `pay_input_pack_profile` · template FK expand |
| **api_design** | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` F.1 families | F-PAY-POLICY-PACK-* · F-PAY-INPUT-PROFILE-* · F-PAY-SETUP-RESOLVE-01 · TPL/PERIOD/INPUT EXPAND |

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| `ensureSchema` — `pay_policy_pack` + `pay_input_pack_profile` + template FK cols | **DONE** |
| CRUD `/api/hrm/payroll/pay-policy-packs*` | **DONE** |
| CRUD `/api/hrm/payroll/pay-input-pack-profiles*` | **DONE** |
| `GET /api/hrm/payroll/pay-setup/resolve` (read-only) | **DONE** |
| EXPAND `pay-sheet-templates` DTO (tag + FK + display labels) | **DONE** |
| Period bind `sheet_template_snapshot_json.setupContext` | **DONE** |
| Input-lines `HRM-PAY-INP-PROFILE-422` on `source_kind` mismatch | **DONE** |
| Jest scope_parity + profile 422 regression | **DONE** |

---

## Code paths

| Area | File |
|------|------|
| Schema + CRUD + resolve | `apps/api/hrm-api/src/payroll/pay-cntt-setup.service.ts` |
| Helpers (setupContext / 422) | `apps/api/hrm-api/src/payroll/pay-cntt-setup.helpers.ts` |
| Constants / error codes | `apps/api/hrm-api/src/payroll/pay-cntt-setup.constants.ts` |
| DTOs | `apps/api/hrm-api/src/payroll/dto/pay-cntt-setup.dto.ts` |
| TPL EXPAND + bind setupContext | `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` |
| INPUT EXPAND 422 | `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` |
| HTTP surface | `apps/api/hrm-api/src/payroll/payroll.controller.ts` |
| Module wiring | `apps/api/hrm-api/src/app.module.ts` |

---

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest pay-cntt-setup.service.spec.ts pay-period-input-pack.service.spec.ts pay-sheet-template.service.spec.ts --no-coverage
```

| Suite | Result |
|-------|--------|
| `pay-cntt-setup.service.spec.ts` | **PASS** (ensureSchema · scope_parity · duplicate code · helpers 422) |
| `pay-period-input-pack.service.spec.ts` | **PASS** (includes `HRM-PAY-INP-PROFILE-422`) |
| `pay-sheet-template.service.spec.ts` | **PASS** (regression scope_parity list↔get) |

**Exit code:** 0 · **27 tests** passed (2026-08-11)

---

## QA entry (browser — U65)

| UF / AC | Persona | Path |
|---------|---------|------|
| AC-CNTT-SETUP-02 | `ceo@xe.vn` | Thiết lập → POST policy pack → list GET 200 |
| AC-CNTT-SETUP-04 | `ceo@xe.vn` | POST input profile → bind template → period input-lines reject bad `source_kind` |
| AC-CNTT-SETUP-03 | `ceo@xe.vn` | Bind template → period snapshot has `setupContext` |
| J-HRM-PAY-* | group CEO `main` | list policy holding ↔ member get 404 scope parity |

**Cấm seed** — tạo policy/profile từ FE mutate path only.

---

## must_keep

- Existing PAY enroll / bind / process paths unchanged
- Formula evaluator HOLD — no amount eval from `rate_params_json`
- TPL / INPUT-PACK / FORMULA CONFIRMED F.1 rows not reopened
- `payroll_e2e_ready=false`

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-CNTT-FE | Thiết lập hub bind policy/profile UI | dev-fe |
| R-CNTT-MOUNT | XLSX column verify + fragment bind | ba-process |
| R-CNTT-SALES | `hrm_sales_data` → input-lines bridge | dev-be (BR-DATA-SALES-01) |

---

## completion_report

### Closed

1. Physical `ensureSchema` for L4/L5 tables + nullable template FKs per DB_DESIGN §8.
2. Full Nest CRUD for policy packs and input profiles with scope_parity U19.
3. Read-only `GET /pay-setup/resolve` helper.
4. TPL list/upsert EXPAND + period bind embeds `setupContext` from pack/profile versions.
5. Input-lines reject disallowed `source_kind` with **`HRM-PAY-INP-PROFILE-422`**.
6. Jest regression green; formula eval untouched.

### Open

- FE Thiết lập hub · sales bridge · XLSX mount (out of BE-01 scope).

---

## next_owner

**qa**

---

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-PAY-CNTT-BE-01
from_role: dev-be
to_role: qa
lane: execution
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01

read_first:
- docs/qa/evidence/po-hrm-pay-cntt-be-01.md
- docs/program/specs/PO-HRM-PAY-CNTT-API-01.md
- docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md (payroll slice)

entry_criteria: PO-HRM-PAY-CNTT-BE-01 READY_FOR_QA; hrm-api up :28001

exit_criteria:
- L0 qc:fe-be-health PASS
- Browser U65: POST policy pack + input profile from FE → GET list 200
- Bind template with FKs → create period → snapshot.setupContext present
- POST input-line source_kind=revenue when profile allows only manual,kpi → HRM-PAY-INP-PROFILE-422 + message_vi lists allowed kinds
- Group CEO main list holding policy; member CEO get-by-id out-of-scope → 404
- evidence docs/qa/evidence/qa-po-hrm-pay-cntt-be-01.md
- ack_status PASS_TO_PM
- cấm seed; payroll_e2e_ready=false
```

---

## evidence_path

`docs/qa/evidence/po-hrm-pay-cntt-be-01.md`
