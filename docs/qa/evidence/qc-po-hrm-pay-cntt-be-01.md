# Evidence — QC-PO-HRM-PAY-CNTT-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PO-HRM-PAY-CNTT-BE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **lane** | governance — **narrow BE C-SLICE** · CNTT Thiết lập API only |
| **parent** | `PO-HRM-PAY-CNTT-BE-01` |
| **qa_ref** | [`qa-po-hrm-pay-cntt-be-01-r2.md`](qa-po-hrm-pay-cntt-be-01-r2.md) · stamp **`CNTTBER2QA-MSO8HVER`** |
| **dev_ref** | [`po-hrm-pay-cntt-be-01-r2.md`](po-hrm-pay-cntt-be-01-r2.md) · `D-PAY-CNTT-BE-COMPILE-01` |
| **spec_ref** | [`docs/program/specs/PO-HRM-PAY-CNTT-API-01.md`](../../program/specs/PO-HRM-PAY-CNTT-API-01.md) F.1 §2–§7 |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | **`CNTTBEQC1-MSO8HVERQC1`** · annotates **`CNTTBER2QA-MSO8HVER`** |
| **portal_url** | `http://127.0.0.1:5173` · hrm-api `http://127.0.0.1:28001/api/hrm` |
| **persona** | `ceo@xe.vn` · `du-lich.ceo@xe.vn` · `company_id=main` |
| **U65** | zero-seed · live API mutate on `:28001` only — no `pnpm seed:*` |
| **OS honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · `C-SLICE-≠-MODULE` |

---

## Verdict summary

**GO WITH CONDITIONS** — **ACCEPT** independent QA stamp **`CNTTBER2QA-MSO8HVER`** on **narrow BE scope only**:

1. **AC-CNTT-SETUP-02** — policy pack POST **201** `HRM-PAY-POL-201` + GET list **200**.
2. **AC-CNTT-SETUP-04** — input profile POST **201** `HRM-PAY-INP-PROF-201` + GET list **200**.
3. **F-PAY-SETUP-RESOLVE-01** — `GET /payroll/pay-setup/resolve` **200** · `recommended` present.
4. **AC-CNTT-SETUP-03** — period bind · `sheet_template_snapshot_json.setupContext` has `policyPackId`, `inputPackProfileId`, `allowedSourceKinds`.
5. **F-PAY-PERIOD-INPUT-01 EXPAND** — `sourceKind=revenue` → **422** `HRM-PAY-INP-PROFILE-422`.
6. **scope_parity U19** — member CEO GET holding policy → **404** `HRM-PAY-POL-404`.
7. **Jest regression** — **27/27** exit 0 (three CNTT suites).
8. **R1 regression closed** — `D-PAY-CNTT-BE-COMPILE-01` + `D-PAY-CNTT-BE-RUNTIME-01` vs [`qa-po-hrm-pay-cntt-be-01.md`](qa-po-hrm-pay-cntt-be-01.md) FAIL baseline.

**NOT** UF-HRM-10 payroll E2E · **NOT** Thiết lập hub browser U65 · **NOT** `payroll_e2e_ready` flip · **NOT** formula evaluator LIVE · **NOT** Phase 1 DONE.

Audited: QA R2 MD · Dev r2 MD · API_DESIGN F.1 · R1 FAIL matrix · `grep apps/web` FE gap · Classification · spot-check `qc:fe-be-health`.

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`payroll_e2e_ready`** | **DENY** flip | BE API slice only · browser NOT_PROMOTED |
| **Full UF-HRM-10** | **DENIED** | ≠ payroll module UAT |
| **Formula evaluator LIVE** | **DENIED** | HOLD per API-01 §8 |
| **Seed** | **DENIED** (U65) | API probe mutate on live stack — no seed scripts |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | narrow GWC |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim UF-HRM-10 / payroll module UAT DONE? | **NO** |
| May PM annotate **AC-CNTT-SETUP-02/03/04** + resolve + 422 + scope_parity **CLOSED** on BE API leg? | **YES** with **`CNTTBER2QA-MSO8HVER`** + **`CNTTBEQC1-MSO8HVERQC1`** |
| May PM promote Thiết lập hub browser rows? | **NO** — `R-CNTT-FE` OPEN |

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| L0 `qc:dev-stack` + `qc:fe-be-health` PASS | ENV / L0 | **ACCEPT** |
| Policy/profile CRUD 201 + list 200 | PRODUCT L1 | **ACCEPT** |
| setupContext snapshot on period bind | PRODUCT L1 | **ACCEPT** |
| `HRM-PAY-INP-PROFILE-422` on `revenue` | PRODUCT L1 | **ACCEPT** |
| scope_parity member 404 on holding pack | PRODUCT L1 U19 | **ACCEPT** |
| Jest **27/27** | PRODUCT L1 | **ACCEPT** cite |
| R1 routes 404 / compile FAIL | PRODUCT P0 | **CLOSED** on R2 |
| Browser Thiết lập STP-HUB | PRODUCT L2 | **NOT_PROMOTED** · `R-CNTT-FE` |
| L2.5 J-* cross-nav | PRODUCT L2.5 | **NOT_PROMOTED** · no FE hub wiring |
| QA pack verify **7/8** (`journey_l25` missing on QA MD) | PROCESS | **OBS** · QC SoT **8/8** below |

---

## R1 vs R2 regression audit

| Criterion | R1 ([`qa-po-hrm-pay-cntt-be-01.md`](qa-po-hrm-pay-cntt-be-01.md)) | R2 (QA handoff) | QC |
|-----------|------------------------------------------------------------------|----------------|-----|
| Policy pack CRUD live | 🔴 404 routes | 🟢 201/200 | **NO REGRESSION** |
| Input profile CRUD live | 🔴 404 | 🟢 201/200 | **NO REGRESSION** |
| pay-setup/resolve | 🔴 404 | 🟢 200 | **NO REGRESSION** |
| setupContext bind | 🔴 absent | 🟢 present | **NO REGRESSION** |
| HRM-PAY-INP-PROFILE-422 | 🔴 blocked | 🟢 422 | **NO REGRESSION** |
| scope_parity U19 | 🔴 not reached | 🟢 404 member | **NO REGRESSION** |
| Jest 27/27 | 🟢 (isolated) | 🟢 | **STABLE** |
| D-PAY-CNTT-BE-COMPILE-01 | 🔴 OPEN | CLOSED (Dev r2) | **CLOSED** |
| D-PAY-CNTT-BE-RUNTIME-01 | 🔴 OPEN | CLOSED (routes live) | **CLOSED** |

---

## Command table (verify)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-po-hrm-pay-cntt-be-01-r2.md` | exit **1** · **7/8** · gap: `journey_l25` on QA MD |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md` | exit **0** · **8/8 PASS** |
| QA L0 `qc:dev-stack` + `qc:fe-be-health` (cite QA R2) | **PASS** |
| QC spot-check `pnpm run qc:fe-be-health` | **PASS** exit 0 (2026-08-11) |
| Jest (cite QA/Dev) | **27/27** exit 0 |
| `grep -r pay-policy-packs apps/web` | **0 hits** — FE gap confirmed |
| Probe JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-be-01-r2.FINAL.json` |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` · `:28001` |
| 5 | journey_l25 | ✅ L2.5 table below |
| 6 | crud_or_matrix | ✅ API AC matrix |
| 7 | residual_section | ✅ below |
| 8 | timestamp | ✅ 2026-08-11 |

---

## Conditions (GWC)

1. **Honesty:** **DENY** `payroll_e2e_ready` · **DENY** UF-HRM-10 full · **DENY** formula evaluator LIVE · **DENY** Phase 1 · seed.
2. **CLOSED (this seat):** BE API legs **AC-CNTT-SETUP-02/03/04** · **F-PAY-SETUP-RESOLVE-01** · **HRM-PAY-INP-PROFILE-422** · **scope_parity U19** after **`CNTTBER2QA-MSO8HVER`**.
3. **CARRY (blocking for browser promote):** **`R-CNTT-FE`** — Thiết lập hub UI (`pay-policy-packs` / `pay-input-pack-profiles` FE) — **0 hits** in `apps/web`; dispatch **dev-fe** `PO-HRM-PAY-CNTT-FE-STP-01` or equivalent in flight.
4. **CARRY (non-blocking):** **`R-CNTT-MOUNT`** XLSX column verify · **`R-CNTT-SALES`** sales→input-lines bridge — **dev-be** / **ba-process** out of BE-01 slice.
5. **PROCESS (optional):** QA append L2.5 / J-* row to R2 MD for pack **8/8** — does not block slice GWC.

---

## J-* / L2.5 (U19)

| ID | Verdict | Notes |
|----|---------|-------|
| **L2.5 cross-nav** (Thiết lập hub list→detail→save→F5) | **NOT_PROMOTED** | No FE routes · U65 browser out of BE-01 scope |
| **J-HRM-07** (full payslip E2E) | **NOT_PROMOTED** | `payroll_e2e_ready=false` |
| **UF-HRM-10** (full payroll UF matrix) | **NOT_PROMOTED** | BE slice ≠ module UAT |

L2.5 retest **required** when **`R-CNTT-FE`** lands — PM must dispatch QA with explicit J-* / UF Thiết lập rows.

---

## API AC matrix (L1 — promoted)

| AC / F-id | Method / path | R2 | QC |
|-----------|---------------|-----|-----|
| AC-CNTT-SETUP-02 | POST/GET `pay-policy-packs` | 🟢 201/200 | **ACCEPT** |
| AC-CNTT-SETUP-04 | POST/GET `pay-input-pack-profiles` | 🟢 201/200 | **ACCEPT** |
| F-PAY-SETUP-RESOLVE-01 | GET `pay-setup/resolve` | 🟢 200 | **ACCEPT** |
| AC-CNTT-SETUP-03 | Period `setupContext` snapshot | 🟢 | **ACCEPT** |
| F-PAY-PERIOD-INPUT-01 | POST input-line `revenue` | 🟢 422 | **ACCEPT** |
| scope_parity U19 | Member GET holding pack | 🟢 404 | **ACCEPT** |
| Browser STP-HUB | FE mutate | ⚪ NOT_PROMOTED | **DEFER** `R-CNTT-FE` |

---

## Residual

| ID | Sev | Item | Owner | Status |
|----|-----|------|-------|--------|
| **R-CNTT-FE** | P1 | Thiết lập hub UI — `pay-policy-packs` FE wiring | **dev-fe** | **OPEN carry** |
| R-CNTT-MOUNT | P2 | XLSX column verify | ba-process | OPEN · non-blocking |
| R-CNTT-SALES | P2 | sales → input-lines bridge | dev-be | OPEN · non-blocking |
| QA pack journey_l25 | P3 | QA R2 MD missing J-* section | qa | OBS · optional append |

---

## completion_report

### Closed (QC scope)

1. Audited QA R2 vs Dev r2 vs API_DESIGN F.1 — L1 matrix aligned; no regression vs R1 FAIL.
2. Confirmed P0 compile/runtime defects closed on retest.
3. Spot-check `qc:fe-be-health` PASS on `:28001` + portal proxy.
4. FE gap verified — `apps/web` has no `pay-policy-packs` references.
5. Issued **GWC** **`CNTTBEQC1-MSO8HVERQC1`** — narrow BE slice only.

### Open (out of slice)

- **`R-CNTT-FE`** browser Thiết lập hub.
- Full payroll UF / `payroll_e2e_ready` / formula evaluator.

---

## next_owner

**pm** → dispatch **dev-fe** for **`R-CNTT-FE`**; optional QA append journey row on R2 MD.

---

## next_dispatch_prompt

```text
work_item_id: D-PAY-CNTT-FE-STP-01
from_role: qc
to_role: dev-fe
lane: execution
parent: PO-HRM-PAY-CNTT-BE-01

read_first:
- docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md
- docs/program/specs/PO-HRM-PAY-CNTT-API-01.md §2–§4
- docs/program/specs/PO-HRM-PAY-CNTT-BA-PROCESS-01.md (STP hub UF)

entry_criteria: QC CNTTBEQC1-MSO8HVERQC1 GWC — BE API CLOSED; R-CNTT-FE OPEN; grep apps/web 0 hits pay-policy-packs

exit_criteria:
- Wire Thiết lập hub: list/create policy pack + input profile (company_id=main, snake_case API bodies per pay-cntt-setup.dto.ts)
- Bind template policyPackId + inputPackProfileId; surface pay-setup/resolve helper on period form
- U65 browser: login ceo@xe.vn → menu Lương → Thiết lập → POST policy/profile 2xx + F5 list shows row
- must_keep: payroll_e2e_ready=false; formula HOLD; no seed
- evidence docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01.md
- ack_status READY_FOR_QA
```

---

## evidence_path

`docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md`
