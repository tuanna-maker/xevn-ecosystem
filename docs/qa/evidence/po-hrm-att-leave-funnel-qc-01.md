# Evidence — `PO-HRM-ATT-LEAVE-FUNNEL-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-FUNNEL-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — **leave → attendance records materialize** slice only |
| **priority** | P0 DATE-EXPAND CLOSED · AC-01/03 solid · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` (QA stamp) |
| **Verdict** | **GO WITH CONDITIONS** — narrow leave→sheet funnel slice only (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` R2 `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-att-leave-funnel-qa-01-r2.md`](po-hrm-att-leave-funnel-qa-01-r2.md) |
| **be_ref** | [`po-hrm-att-leave-funnel-be-02.md`](po-hrm-att-leave-funnel-be-02.md) |
| **spec_ref** | [`PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md) §7 AC-ATT-LV-SHEET-01..03 |
| **machine** | [`_tmp-po-hrm-att-leave-funnel-qa-01-r2.json`](_tmp-po-hrm-att-leave-funnel-qa-01-r2.json) · stamp **`LVFN-HN473F`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-att-leave-funnel-qa-01-r2/` (13 PNG present) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — funnel GWC ≠ attendance module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **attendance_uat_ready** | **false** | **DENIED** — cấm claim module UAT |
| **LV-02** | **WAIVED_P1** | **Retained** — not 🟢; WAIVE_L2 **not reopened** |
| **Option C as SoT** | **cấm** | PASS uses records display-ready leave rows; OBS leave-join GET count only |
| **Ladder N invent** | **cấm** | Intact |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **product_go / production GO** | **DENIED** | Out of scope |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT for **FE create leave → L1 Duyệt → materialize `attendance_records` (`status=leave`, `yyyy-MM-dd`) → F5 + closed-sheet LOCKED 409** under U65.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **AC-ATT-LV-SHEET-01** | JSON: `materialized_days=["2026-11-18","2026-11-19"]` · leave_count=2 · dateFmt OK · F5 · stamp `LVFN-HN473F` | 🟢 **ACCEPT** (via Bản ghi / records — see CONDITION CTA) |
| **AC-ATT-LV-SHEET-03** | Approve overlap closed Sept → **409** `HRM-ATT-SHEET-LOCKED` · PNG toast «Không thể cập nhật đơn» | 🟢 **ACCEPT** |
| **J-HRM-06b** storm ≤2/10s | `stormWindow.count=0` (limit 2) | 🟢 **ACCEPT** |
| **R-ATT-LEAVE-FUNNEL-DATE-EXPAND** | BE-02 CLOSED + R2 FE path verifies non-empty days + LOCKED | 🟢 **CLOSED** |
| **AC-ATT-LV-SHEET-02** | SKIP — FE cancel/reverse CTA stub | 🟡 **CONDITION** P2 |
| Module attendance UAT | Explicit false | 🟢 denied |
| LV-02 / WAIVE_L2 | WAIVED_P1 intact | 🟢 retained |

**Cấm:** `attendance_uat_ready=true` · reopen WAIVE_L2 · Option C as SoT · invent ladder N · Phase 1 DONE.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-02 DATE-EXPAND | `po-hrm-att-leave-funnel-be-02.md` | READY_FOR_QA | **ACCEPT** — jest 67/67 · smoke `LVFN-BE02-MSHMQTH5` |
| QA-01 R1 | `po-hrm-att-leave-funnel-qa-01.md` | FAIL (empty days) | Historical — superseded by R2 |
| QA-01 R2 | `po-hrm-att-leave-funnel-qa-01-r2.md` | PASS_TO_PM | **ACCEPT** U65 browser + stamp |
| Spec §7 | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` | — | AC matrix audited |

### Machine JSON spot (stamp `LVFN-HN473F`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `LVFN-HN473F` | 🟢 |
| `l0` hrm/xbos/portal | 200 | 🟢 |
| `attendance_uat_ready` | false | 🟢 honesty |
| `LV_02` / `WAIVE_L2` | WAIVED_P1 / true | 🟢 |
| LEAVE-APPROVE | 201 `HRM-LEAVE-203` · `mat=["2026-11-18","2026-11-19"]` | 🟢 |
| RECORDS-PROBE | leave=2 · weekdayJunk=0 | 🟢 |
| AC-01 / AC-03 / J-HRM-06b | PASS / PASS / PASS | 🟢 |
| AC-02 | SKIP | 🟡 CONDITION |
| `stormWindow.count` | **0** ≤2 | 🟢 |
| lockApprove | 409 `HRM-ATT-SHEET-LOCKED` | 🟢 |
| `weekly.leaveLabelSample` | `status=leave` · dates ISO day · soft `leave_request_id` | 🟢 Option A |
| U65 seed | none | 🟢 |
| pageErrors | `[]` | 🟢 |
| console 409 on lock path | Expected AC-03 | 🟢 PRODUCT OK (not storm) |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `07-after-approve.png` | Leave tab after Duyệt path — list/KPI live; no Uncaught |
| `13-after-lock-approve.png` | Toast **Lỗi / Không thể cập nhật đơn** — matches 409 LOCKED (AC-03 FE feedback) |
| `09b-storm-weekly.png` | Present on disk · storm count 0 in JSON |
| Screens dir | **13/13** PNG listed in JSON exist on disk |

---

## Gate AC audit (SPEC §7)

| AC | Spec say | QA R2 | QC |
|----|----------|-------|-----|
| **AC-ATT-LV-SHEET-01** | Create→Duyệt→sheet/weekly leave cell · F5 · dates ≠1970 | PASS via **records** leave rows (`leave_rows_from_records`); `att-sheets-add` CTA BLOCKED | 🟢 ACCEPT + CONDITION `R-ATT-SHEET-NAV-CTA` |
| **AC-ATT-LV-SHEET-02** | Reject/cancel → markers gone | SKIP FE stub | 🟡 CONDITION P2 — **not NO-GO** |
| **AC-ATT-LV-SHEET-03** | Closed overlap → 409 LOCKED | PASS 409 + FE error toast | 🟢 |
| **J-HRM-06b** | Storm ≤2/10s | count=0 | 🟢 |
| **LV-02** | WAIVED_P1 | Not claimed 🟢 | 🟢 |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-06b** storm regress | In-scope funnel seat | 🟢 **PASS** (R2) |
| **J-HRM-06b** journey map row | Already ✅ (sheet AC 2026-07-21) | **No re-stamp required** — optional funnel note: storm reconfirmed `LVFN-HN473F` / QC-01 |
| **J-HRM-06c** sign | must_keep — **not mutated** this seat | 🟢 **RETAIN** prior ✅ (pay-att-close) |
| Module attendance UAT / UF full ATT | Out of scope | **DENIED** |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| AC-01/03 product PASS | PRODUCT | Seal GWC |
| `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` | PRODUCT | **CLOSED** |
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | PRODUCT P2 | **CONDITION** — owner **dev-fe** (defer; do not block) |
| `R-ATT-SHEET-NAV-CTA` | PRODUCT P2 / harness | **CONDITION** soft — AC-01 accepted via Bản ghi |
| `OBS-OPTION-C-LEAVE-JOIN-GETS` | OBS | Soft — not SoT |
| QA pack `verify:qc:evidence-pack` ack_status format (`\| ack_status \|` vs `ack_status:`) | **PROCESS OBS** | QC consolidates this file 8/8-capable; **not** product demote |
| Portal `:5173` | ENV baseline for QA | OK (L0 200) |
| Console 409 on AC-03 | PRODUCT expected | Not defect |

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-att-leave-funnel-qa-01-r2.md
→ FAIL 1/8 (ack_status colon format only) — PROCESS OBS
```

---

## Conditions (GWC — bounded)

1. **`R-ATT-LV-SHEET-02-FE-CANCEL-STUB` (P2)** — FE cancel/reverse after approve not wired; AC-02 remains SKIP until **dev-fe** wires CTA + QA retest. Owner: **dev-fe** (defer OK).
2. **`R-ATT-SHEET-NAV-CTA` (P2 soft)** — `att-sheets-add` not found in harness; AC-01 sealed on records display-ready path, not full «Thêm sheet → weekly grid» click. Owner: **qa** harness / optional **dev-fe** if CTA regress.
3. **Honesty** — `attendance_uat_ready=false`; LV-02 **WAIVED_P1**; J-HRM-06c not re-exercised; **NOT** Phase 1 DONE; **NOT** attendance module UAT-ready.

---

## Residual register

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` | P0 was | — | **CLOSED** |
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | P2 | dev-fe | **OPEN** CONDITION |
| `R-ATT-SHEET-NAV-CTA` | P2 | qa/dev-fe | **OPEN** soft CONDITION |
| `OBS-OPTION-C-LEAVE-JOIN-GETS` | OBS | — | Soft |
| Module UAT | — | — | stays false |
| LV-02 | — | — | WAIVED_P1 |

**No P0/P1 open → GWC allowed** (per residual policy).

---

## completion_report

QC L3 **GO WITH CONDITIONS** for **narrow leave→sheet funnel** only. Audited QA-01 R2 + BE-02 + SPEC §7: AC-ATT-LV-SHEET-01/03 🟢 with stamp `LVFN-HN473F`; J-HRM-06b storm count=0; `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` **CLOSED**. AC-02 SKIP = P2 FE cancel stub → CONDITION (not NO-GO). Journey map **J-HRM-06b** already ✅ — funnel storm reconfirmed (no map rewrite). **`attendance_uat_ready=false`**; LV-02 **WAIVED_P1** retained; Option C not SoT; WAIVE_L2 not reopened. Pack ack_status format = PROCESS OBS. No seed · no apps/** · no commit.

## next_owner

**pm** — intake GWC; optional later dispatch **dev-fe** for AC-02 cancel stub (P2 defer); do **not** claim attendance UAT-ready.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QC-01-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-ATT-LEAVE-FUNNEL-QC-01 GO WITH CONDITIONS
evidence_path: docs/qa/evidence/po-hrm-att-leave-funnel-qc-01.md

task:
1) Bus INTAKE: GWC narrow leave→sheet funnel; stamp LVFN-HN473F; R-ATT-LEAVE-FUNNEL-DATE-EXPAND CLOSED
2) Honesty: attendance_uat_ready=false · LV-02 WAIVED_P1 · WAIVE_L2 intact · no Option C SoT
3) Conditions (defer OK): R-ATT-LV-SHEET-02-FE-CANCEL-STUB (dev-fe P2) · R-ATT-SHEET-NAV-CTA soft
4) Optional later: Task dev-fe AC-02 cancel reverse CTA — NOT required to keep GWC
5) Continue program backlog — do NOT promote attendance module UAT

forbidden: claim attendance_uat_ready · reopen WAIVE_L2 · invent ladder N · Option C as SoT
```

## ack_status

PASS_TO_PM
