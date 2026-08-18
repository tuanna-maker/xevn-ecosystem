# Evidence — `PO-HRM-ATT-LEAVE-FUNNEL-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-FUNNEL-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate **delta** — close CONDITION **R-ATT-LV-SHEET-02 / AC-ATT-LV-SHEET-02** only |
| **priority** | P2 cancel CTA CLOSED · must_keep AC-01/03 + J-HRM-06b retained · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` (QA stamp) |
| **Verdict** | **GO WITH CONDITIONS** — CONDITION **R-ATT-LV-SHEET-02 CLOSED**; funnel GWC residual board updated |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-ATT-LEAVE-CANCEL-QA-01` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-att-leave-cancel-qa-01.md`](po-hrm-att-leave-cancel-qa-01.md) |
| **fe_ref** | [`po-hrm-att-leave-cancel-fe-01.md`](po-hrm-att-leave-cancel-fe-01.md) |
| **prior_gwc** | [`po-hrm-att-leave-funnel-qc-01.md`](po-hrm-att-leave-funnel-qc-01.md) — CONDITION AC-02 / FE cancel stub was **OPEN** |
| **machine** | [`_tmp-po-hrm-att-leave-cancel-qa-01.json`](_tmp-po-hrm-att-leave-cancel-qa-01.json) · stamp **`LVCAN-IB56MV`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-att-leave-cancel-qa-01/` (16 PNG on disk) |
| **spec_ref** | [`PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md) §7 **AC-ATT-LV-SHEET-02** |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — residual close ≠ attendance module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **attendance_uat_ready** | **false** | **DENIED** — cấm claim / promote module UAT |
| **LV-02** | **WAIVED_P1** | **Retained** — not 🟢; WAIVE_L2 **not reopened** |
| **Option C as SoT** | **cấm** | PASS uses records leave markers + FE cancel path |
| **Ladder N invent** | **cấm** | Intact |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Prior funnel QC-01** | **Superseded only on R-ATT-LV-SHEET-02** | AC-01/03 + DATE-EXPAND seals **held** |

---

## Verdict summary

**GO WITH CONDITIONS** — delta ACCEPT: close **`R-ATT-LV-SHEET-02-FE-CANCEL-STUB`** / **AC-ATT-LV-SHEET-02**.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **AC-ATT-LV-SHEET-02** | HDSD Hủy đơn + confirm → POST cancel **201** `HRM-LEAVE-205` · markers **2→0** · F5 **0** · cancelled chip · cancel CTA gone · stamp `LVCAN-IB56MV` | 🟢 **CLOSED** |
| **AC-ATT-LV-SHEET-01** (must_keep) | Create→Duyệt → `materialized_days` length=2 · leave rows=2 | 🟢 **RETAIN** |
| **AC-ATT-LV-SHEET-03** (must_keep) | Sept closed overlap → **409** `HRM-ATT-SHEET-LOCKED` | 🟢 **RETAIN** |
| **J-HRM-06b** | storm `count=0` ≤2 /10s | 🟢 **RETAIN** |
| **R-ATT-LEAVE-FUNNEL-DATE-EXPAND** | Prior QC-01 CLOSED | 🟢 **RETAIN** |
| **R-ATT-SHEET-NAV-CTA** | Soft CONDITION parent | 🟡 **OPEN** soft (unchanged) |
| Module attendance UAT | Explicit false | 🟢 denied |
| LV-02 / WAIVE_L2 | WAIVED_P1 intact | 🟢 retained |

**Cấm:** `attendance_uat_ready=true` · reopen WAIVE_L2 · Option C as SoT · invent ladder N · Phase 1 DONE · invent module UAT.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Funnel QC-01 GWC | `po-hrm-att-leave-funnel-qc-01.md` | PASS_TO_PM | CONDITION AC-02 OPEN (baseline) |
| FE-01 cancel wire | `po-hrm-att-leave-cancel-fe-01.md` | READY_FOR_QA | **ACCEPT** — HDSD testids + POST cancel client |
| QA-01 browser | `po-hrm-att-leave-cancel-qa-01.md` | PASS_TO_PM | **ACCEPT** U65 + stamp `LVCAN-IB56MV` |
| QA pack verify | `verify:qc:evidence-pack` on QA MD | **8/8 PASS** | 🟢 entry OK |

### Machine JSON spot (stamp `LVCAN-IB56MV`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `LVCAN-IB56MV` | 🟢 |
| `l0` hrm/xbos/portal | 200 | 🟢 |
| `attendance_uat_ready` | false | 🟢 honesty |
| `WAIVE_L2` / `LV_02` | true / WAIVED_P1 | 🟢 |
| LEAVE-CREATE | 201 `HRM-LEAVE-201` id=`b8b64c50-…` | 🟢 |
| LEAVE-APPROVE | 201 `HRM-LEAVE-203` · mat=`["2026-12-01","2026-12-02"]` | 🟢 |
| RECORDS-BEFORE-CANCEL | leave=**2** · leave_request_id match | 🟢 |
| LEAVE-CANCEL / network | POST `…/cancel` **201** `HRM-LEAVE-205` · `status=cancelled` · via **browser-network** | 🟢 |
| after cancel / F5 | leave count **0** / **0** | 🟢 markers cleared |
| FE after cancel | `hasCancelledChip=true` · `cancelBtnGone=true` | 🟢 |
| AC-01 / AC-02 / AC-03 / J-HRM-06b | PASS / PASS / PASS / PASS | 🟢 |
| `stormWindow.count` | **0** ≤2 | 🟢 |
| lockApprove | 409 `HRM-ATT-SHEET-LOCKED` | 🟢 must_keep |
| `closed[]` | `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | 🟢 |
| U65 seed | none | 🟢 |
| pageErrors | `[]` | 🟢 |
| console 409 on lock path | Expected AC-03 | 🟢 PRODUCT OK |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `05-cancel-dialog.png` | Dialog **Xác nhận hủy đơn nghỉ** · warning gỡ marker nếu kỳ chưa khóa · row UAT-0100 01–02/12/2026 **Đã duyệt** · **Hủy đơn** CTA — AC-02 path |
| `07-fe-after-cancel.png` | After cancel: **Đã duyệt** KPI **28→27**; list/filters live; no Uncaught |
| `08-fe-after-f5.png` | F5 persist same cancelled-state KPIs (**27** approved) · no cancel re-open storm |
| Screens dir | **16/16** PNG listed in JSON exist on disk |

### L0 QC spot (same session)

```text
pnpm run qc:dev-stack
→ hrm :28001 200 · xbos :28002 200 · portal :5173 200
(node win UV_HANDLE_CLOSING assert on process exit — ENV OBS; health signals PASS)
```

---

## Gate AC audit (SPEC §7)

| AC | Spec say | QA-01 cancel | QC |
|----|----------|--------------|-----|
| **AC-ATT-LV-SHEET-01** | Create→Duyệt→leave markers · F5 | PASS materialize 2 days | 🟢 **RETAIN** |
| **AC-ATT-LV-SHEET-02** | Cancel/reject → markers gone | PASS cancel 201 + 2→0 + F5 | 🟢 **CLOSED** (was CONDITION) |
| **AC-ATT-LV-SHEET-03** | Closed overlap → 409 LOCKED | PASS 409 | 🟢 **RETAIN** |
| **J-HRM-06b** | Storm ≤2/10s | count=0 | 🟢 **RETAIN** |
| **LV-02** | WAIVED_P1 | Not claimed 🟢 | 🟢 |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-06b** storm | In-scope must_keep | 🟢 **PASS** (reconfirm `LVCAN-IB56MV`) |
| **J-HRM-06b** journey map | Already ✅ | **No re-stamp required** |
| **J-HRM-06c** sign | must_keep — **not mutated** | 🟢 **RETAIN** prior ✅ |
| Module attendance UAT / UF full ATT | Out of scope | **DENIED** |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| AC-02 cancel browser PASS | PRODUCT | Seal CONDITION **CLOSED** |
| AC-01/03 + J-HRM-06b | PRODUCT | Retain prior GWC |
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | PRODUCT P2 was | **CLOSED** |
| `R-ATT-SHEET-NAV-CTA` | PRODUCT P2 soft | **OPEN** CONDITION soft — unchanged |
| Console 409 on AC-03 | PRODUCT expected | Not defect |
| `qc:dev-stack` node win assert after 200s | **ENV OBS** | Health PASS; ignore exit assert |
| Module UAT claim | GOVERNANCE | **DENIED** |

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-leave-cancel-qa-01.md
→ PASS 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-leave-funnel-qc-02.md
→ (this file)
```

---

## Conditions (GWC — updated residual board)

1. **~~`R-ATT-LV-SHEET-02-FE-CANCEL-STUB`~~** — **CLOSED** (QA-01 stamp `LVCAN-IB56MV` · POST **201** `HRM-LEAVE-205` · markers cleared + F5).
2. **`R-ATT-SHEET-NAV-CTA` (P2 soft)** — `att-sheets-add` harness CTA still soft CONDITION; AC-01 sealed via records. Owner: **qa** harness / optional **dev-fe**.
3. **Honesty** — `attendance_uat_ready=false`; LV-02 **WAIVED_P1**; WAIVE_L2 intact; **NOT** Phase 1 DONE; **NOT** attendance module UAT-ready; Option C **cấm**.

---

## Residual register

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` | P0 was | — | **CLOSED** (QC-01) |
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | P2 was | — | **CLOSED** (this seal) |
| `R-ATT-SHEET-NAV-CTA` | P2 soft | qa/dev-fe | **OPEN** soft CONDITION |
| `OBS-OPTION-C-LEAVE-JOIN-GETS` | OBS | — | Soft (not SoT) |
| Module UAT | — | — | stays **false** |
| LV-02 | — | — | **WAIVED_P1** |

**No P0/P1 open → GWC allowed.** Soft NAV-CTA alone does **not** reopen cancel CONDITION.

---

## completion_report

QC L3 **GO WITH CONDITIONS** delta for leave→sheet funnel: CONDITION **R-ATT-LV-SHEET-02 / AC-ATT-LV-SHEET-02 CLOSED** on U65 browser evidence (stamp `LVCAN-IB56MV`). Audited QA-01 MD + machine JSON + PNG 05/07/08 + FE-01 wire: POST cancel **201** `HRM-LEAVE-205` · leave markers **2→0** + F5 · must_keep AC-01/03 + J-HRM-06b PASS. Prior DATE-EXPAND CLOSED retained. Soft **`R-ATT-SHEET-NAV-CTA`** remains OPEN. **`attendance_uat_ready=false`**; LV-02 **WAIVED_P1**; WAIVE_L2 not reopened; no Option C; no seed; no apps/**; no module UAT invent. QA pack entry **8/8**.

## next_owner

**pm** — bus INTAKE GWC delta; do **not** promote attendance UAT; soft NAV-CTA defer OK.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-ATT-LEAVE-FUNNEL-QC-02 GO WITH CONDITIONS
evidence_path: docs/qa/evidence/po-hrm-att-leave-funnel-qc-02.md

task:
1) Bus INTAKE: GWC delta — R-ATT-LV-SHEET-02 / AC-ATT-LV-SHEET-02 CLOSED (stamp LVCAN-IB56MV)
2) Honesty: attendance_uat_ready=false · LV-02 WAIVED_P1 · WAIVE_L2 intact · no Option C SoT
3) Residual OPEN soft only: R-ATT-SHEET-NAV-CTA (defer OK)
4) Continue program backlog — do NOT promote attendance module UAT / Phase 1 DONE
5) Optional later: harness/dev-fe for att-sheets-add CTA — NOT required to keep GWC

forbidden: claim attendance_uat_ready · reopen WAIVE_L2 · invent ladder N · Option C as SoT · seed
```

## ack_status

PASS_TO_PM
