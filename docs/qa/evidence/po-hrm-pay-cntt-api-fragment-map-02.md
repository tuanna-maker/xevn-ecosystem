# Evidence — PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02` |
| **parent** | `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-11 |
| **change_mode** | ADD — EXPAND API F.1 only |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · `xevn_today=MISSING` all 63 fragments |
| **must_keep** | API-01 CNTT CRUD CONFIRMED · TPL-API-01 LINES-01 · AMIS parity locks |
| **ack_status** | **PASS_TO_PM** |

---

## 1. read_first ack

| # | Artifact | Verdict |
|---|----------|---------|
| 1 | `ADR-HRM-PAY-FRAGMENT-BIND-01.md` | D8–D13 CONFIRMED — resolver + dual-template Option A |
| 2 | `PO-HRM-PAY-CNTT-SA-01.md` §9 | Fragment bind architecture — not reopened L1–L6 |
| 3 | `DB_DESIGN_HRM_PAYROLL.md` §8.7 | Physical `fragment_id` + `fragment_bind_mode` |
| 4 | `PO-HRM-PAY-CNTT-API-01.md` §0–§11 | Baseline CONFIRMED — EXPAND only |
| 5 | `po-hrm-pay-cntt-sa-fragment-map-02.md` | Parent SA PASS intake |

---

## 2. Deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| API F.1 EXPAND §12 (normative) | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` §12 | **DONE** |
| API_DESIGN pointer APPEND | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` CNTT fragment APPEND | **DONE** |
| DB snapshot dual-template §8.8 | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.8 | **DONE** |
| This evidence | `docs/qa/evidence/po-hrm-pay-cntt-api-fragment-map-02.md` | **PASS_TO_PM** |

**No `apps/**` changes.**

---

## 3. F.1 EXPAND summary

| F-id | ADD | Error codes |
|------|-----|-------------|
| **F-PAY-SHEET-TPL-LINES-01** | `fragmentId`, `fragmentBindMode` on GET/PUT lines; publish validation | FRG-404 · FRG-409 |
| **F-PAY-POLICY-PACK-UPSERT-01** | `policyDocRefs[].fragmentIds[]` ⊆ catalog | FRG-404 · FRG-409 |
| **F-PAY-SETUP-RESOLVE-01** | `resolvedFragments[]` + period date query; preview warnings | FRG-412 (soft in warnings) |
| **F-PAY-PERIOD-01** | `secondaryTemplateIds[]` · snapshot `secondaryTemplates[]` · `mergeRule` | FRG-412 hard on bind · TPL-412 |

---

## 4. Error taxonomy (SRS trace)

| Code | HTTP | SRS step ref |
|------|------|--------------|
| `HRM-PAY-FRG-404` | 404 | **UC-BP-PAY-STP-08** · **UC-BP-PAY-STP-02** |
| `HRM-PAY-FRG-412` | 412 | **UC-BP-PAY-STP-03** · **BR-PAY-STP-02** |
| `HRM-PAY-FRG-409` | 409 | **UC-BP-PAY-STP-02** · **UC-BP-PAY-STP-01** CHUNG/RIÊNG |

---

## 5. Dual-template snapshot (GAP-CNTT-08 Option A)

| Field | Starter value | GAP |
|-------|---------------|-----|
| `secondaryTemplates[]` | ĐPHH DT · TĐHK KPI secondary | GAP-CNTT-08 · GAP-CNTT-10 |
| `mergeRule` | `DPHH_BHXH_NET_ONCE` · `TDHK_STATUTORY_ONCE` | VAL-FRG-03 |
| `siBaseSource` | `MAX(time_sheet_si_base, dt_sheet_si_base)` | formula HOLD |

LX GAP-CNTT-09: detail-only — **no** secondary bind documented.

---

## 6. Validation spot-check (design-time)

| Check | Expected |
|-------|----------|
| VAL-FRG-01 | PUT line `FRG-INVALID` → FRG-404 |
| VAL-FRG-02 | Resolve T06/2026 LX lượt → `FRG-LXT-QD439-LUOT` in `resolvedFragments[]` |
| VAL-FRG-03 | Period bind ĐPHH dual → snapshot contains `mergeRule: DPHH_BHXH_NET_ONCE` |
| VAL-FRG-04 | GAP-FRG line `INPUT_PACK` → `fragmentId` null |
| VAL-FRG-05 | No `resolvedAmount` / no `payroll_e2e_ready=true` claim |

---

## completion_report

**Closed**

1. APPEND API_DESIGN delta for `F-PAY-SHEET-TPL-LINES-01` (`fragment_id` + `fragment_bind_mode`).
2. EXPAND `F-PAY-POLICY-PACK-UPSERT-01` with `fragment_ids[]` catalog validation.
3. EXPAND `F-PAY-SETUP-RESOLVE-01` with `resolvedFragments[]` preview resolver.
4. EXPAND `F-PAY-PERIOD-01` with dual-template `secondaryTemplates[]` + `mergeRule` (Option A).
5. Error codes `HRM-PAY-FRG-404/412/409` with SRS step refs.
6. Normative pointers in `API_DESIGN_HRM_PAYROLL.md` + DB §8.8 snapshot fields.

**Residual**

| ID | Owner |
|----|-------|
| `PO-HRM-PAY-CNTT-BE-02` | dev-be — ensureSchema §8.7 + validation impl |
| Catalog read model export | dev-be / governance seed |
| `PO-HRM-PAY-CNTT-INPUT-DATA-01` | ba-data — input_pack keys for GAP-FRG |
| GAP-CNTT-11 formula evaluator | dev-be — HOLD |

## next_owner

`pm` → dispatch `dev-be` `PO-HRM-PAY-CNTT-BE-02` (physical §8.7 + API fragment validation).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-BE-02
role: dev-be
parent: PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02
read_first:
- docs/program/specs/PO-HRM-PAY-CNTT-API-01.md §12
- docs/hrm/DB_DESIGN_HRM_PAYROLL.md §8.7–§8.8
- docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md
- docs/qa/evidence/po-hrm-pay-cntt-api-fragment-map-02.md
entry_criteria: API-FRAGMENT-MAP-02 PASS_TO_PM; API-01 CONFIRMED
exit_criteria:
- ensureSchema: pay_sheet_template_lines.fragment_id + fragment_bind_mode
- PUT lines validates FRG-404/409; policy pack fragmentIds validation
- GET pay-setup/resolve returns resolvedFragments[] (trace only, no amounts)
- Period bind supports secondaryTemplates[] + mergeRule in snapshot jsonb
- jest payroll fragment validation specs
- ack_status READY_FOR_QA
must_keep: payroll_e2e_ready=false · formula eval HOLD · U65 zero-seed
change_mode: ADD
allowed_paths: apps/api/hrm-api/** payroll module only
```
