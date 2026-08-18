# Evidence — PO-HRM-PAY-CNTT-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-API-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance · **cấm** `apps/**` |
| **date** | 2026-08-11 |
| **change_mode** | ADD-only API/DB F.1 |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. read_first (ack)

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md` §4–§6 | `source_kind` vocab · ADD DDL · template FK · validation VAL-CNTT-* |
| 2 | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` §3 | APPEND/EXPAND unlock list |
| 3 | `docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md` §4 | L4/L5 physical intent |
| 4 | `docs/architecture/ADR-HRM-PAY-XEVN-CUSTOMER-CNTT-01.md` | Acceptance hooks AC-CNTT-SETUP-* |
| 5 | `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` | TPL EXPAND pattern — cite not reopen |
| 6 | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01` | INPUT EXPAND + profile validation hook |

---

## 1. Deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| API F.1 slice (normative) | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` | **CONFIRMED** |
| API_DESIGN APPEND pointer | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` § CNTT APPEND | **DONE** |
| DB_DESIGN APPEND physical | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` § CNTT APPEND §8.1–8.6 | **DONE** |
| This evidence | `docs/qa/evidence/po-hrm-pay-cntt-api-01.md` | **PASS_TO_PM** |

---

## 2. API_DESIGN — F.1 families closed

### 2.1 ADD (new)

| F-id | Path prefix | SRS / UC |
|------|-------------|----------|
| **F-PAY-POLICY-PACK-LIST-01** | `GET /pay-policy-packs` | UC-BP-PAY-STP-01/02 |
| **F-PAY-POLICY-PACK-UPSERT-01** | `POST/PATCH /pay-policy-packs` | UC-BP-PAY-STP-01..06 |
| **F-PAY-POLICY-PACK-ARCHIVE-01** | `POST …/archive` | soft-delete |
| **F-PAY-INPUT-PROFILE-LIST-01** | `GET /pay-input-pack-profiles` | UC-BP-PAY-STP-12 |
| **F-PAY-INPUT-PROFILE-UPSERT-01** | `POST/PATCH /pay-input-pack-profiles` | F-STP-04 |
| **F-PAY-INPUT-PROFILE-ARCHIVE-01** | `POST …/archive` | soft-delete |
| **F-PAY-SETUP-RESOLVE-01** | `GET /pay-setup/resolve` | AC-CNTT-SETUP-* |

Each row includes full F.1: **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** · DTO↔cột · lỗi — see slice SoT.

### 2.2 EXPAND (existing CONFIRMED)

| F-id | Expansion |
|------|-----------|
| **F-PAY-SHEET-TPL-LIST/UPSERT-01** | `business_line_tag`, `policy_pack_id`, `input_pack_profile_id` + filters/joins |
| **F-PAY-PERIOD-01** | `sheet_template_snapshot_json.setupContext` policy/profile version |
| **F-PAY-PERIOD-INPUT-01** | `source_kind` ∉ snapshot → **`HRM-PAY-INP-PROFILE-422`** |
| **F-PAY-PROCESS-01** | `rate_params_json` read-only GĐ1 — eval **HOLD** |

### 2.3 REWRITE

**none** — meeting-locked TPL/INPUT/FORMULA rows preserved.

---

## 3. DB_DESIGN — physical ADD summary

| Table / expand | Columns | Status |
|----------------|---------|--------|
| `pay_policy_pack` | 14 cols + UQ partial + IX | **PAPER** until ensureSchema |
| `pay_input_pack_profile` | 12 cols + UQ partial | **PAPER** |
| `pay_sheet_templates` EXPAND | `business_line_tag`, `policy_pack_id`, `input_pack_profile_id` | **PAPER** |
| `payroll_periods` snapshot | `setupContext` in `sheet_template_snapshot_json` | **EXPAND** doc |

Starter profiles documented: `INP_DPHH_DLL`, `INP_TDHK_KPI`, `INP_TG_BCC`, `INP_LXT_ROUTE`, `INP_LXT_TRUCK`, `INP_VP_PROV`.

---

## 4. Error codes (ADD)

| Code | Trigger |
|------|---------|
| `HRM-PAY-POL-409-CODE` | Duplicate policy pack code |
| `HRM-PAY-POL-400-DATE` | Invalid effective range |
| `HRM-PAY-INP-PROF-409-CODE` | Duplicate input profile code |
| `HRM-PAY-SETUP-404-PACK` | FK pack/profile out of scope |
| **`HRM-PAY-INP-PROFILE-422`** | `source_kind` not in profile snapshot |

---

## 5. Architecture gates (honesty)

| Claim | Allowed |
|-------|---------|
| F.1 policy/profile APPEND CONFIRMED | **Yes** |
| dev-be ensureSchema unlocked | **Yes** (next wave) |
| Formula evaluator LIVE | **No** |
| `payroll_e2e_ready=true` | **No** |
| XLSX column verify | **No** — `map_confidence=INV` until pack mount |

---

## 6. completion_report

### Closed

1. **APPEND** 7 new F.1 families `F-PAY-POLICY-PACK-*` + `F-PAY-INPUT-PROFILE-*` + `F-PAY-SETUP-RESOLVE-01` with full Mục đích · Nghiệp vụ · Bước SRS · DTO↔cột.
2. **EXPAND** 4 existing CONFIRMED families (TPL, PERIOD, PERIOD-INPUT, PROCESS note) including **`HRM-PAY-INP-PROFILE-422`**.
3. **APPEND** `DB_DESIGN_HRM_PAYROLL.md` §8 — `pay_policy_pack`, `pay_input_pack_profile`, template FK expand, snapshot contract, linkage, probes.
4. **APPEND** `API_DESIGN_HRM_PAYROLL.md` CNTT pointer section.
5. No `apps/**` edits · `payroll_e2e_ready=false` retained.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-CNTT-BE | ensureSchema + CRUD Nest endpoints | dev-be (`PO-HRM-PAY-CNTT-BE-01`) |
| R-CNTT-FE | Thiết lập lương hub bind policy/profile | dev-fe (post BE) |
| R-CNTT-MOUNT | XLSX cell verify + `fragment_id` bind | ba-process after pack mount |
| R-CNTT-SALES | `hrm_sales_data` → input-lines bridge | dev-be (BR-DATA-SALES-01) |
| R-CNTT-FORMULA | `expression_json` inner schema + evaluator | serial gate post DATA formula |
| R-CNTT-SRS | UC Thiết lập lương customer HTML delta | ba-docs W1 |

---

## 7. next_owner

**pm** — synth with `PO-HRM-PAY-CNTT-GAP-SYNTH-01`; dispatch **dev-be** ensureSchema wave; parallel **ba-process** POLICY-DECOMPOSE when pack mounted.

---

## 8. next_dispatch_prompt

```text
work_item_id: PO-HRM-PAY-CNTT-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01

read_first:
- docs/program/specs/PO-HRM-PAY-CNTT-API-01.md (full F.1)
- docs/hrm/DB_DESIGN_HRM_PAYROLL.md § CNTT APPEND §8.1–8.6
- docs/qa/evidence/po-hrm-pay-cntt-api-01.md
- PO-HRM-AMIS-PARITY-PAY-TPL-API-01 (TPL EXPAND — already LIVE partial)

entry_criteria: PO-HRM-PAY-CNTT-API-01 PASS_TO_PM; F.1 CONFIRMED

exit_criteria:
- ensureSchema: pay_policy_pack + pay_input_pack_profile + pay_sheet_templates FK columns
- Nest CRUD /pay-policy-packs* + /pay-input-pack-profiles* + GET /pay-setup/resolve
- EXPAND pay-sheet-templates DTO + period snapshot setupContext + input-lines HRM-PAY-INP-PROFILE-422
- jest: scope_parity list/get + profile validation 422
- evidence docs/qa/evidence/po-hrm-pay-cntt-be-01.md
- ack_status READY_FOR_QA
- payroll_e2e_ready=false; must_keep TPL/INPUT/FORMULA CONFIRMED rows
```

---

## evidence_path

`docs/qa/evidence/po-hrm-pay-cntt-api-01.md`
