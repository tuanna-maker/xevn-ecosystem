# Evidence — PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` → **dev-be** |
| **date** | 2026-08-09 |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **residual** | **R-REC-HC-OVERRIDE-CELLID** (P2 · QC-02 GWC Condition) |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 · no seed |

---

## Mission answers (1-line each)

| # | Decision |
|---|----------|
| **1 Identity** | **REUSE** existing `cell_id` by natural key when override omits `cell_id` — **cấm** mint+relink/soft-retire (Option A LOCKED). |
| **2 YCTD** | **KEEP** link to same `headcount_cell_id`; **không** block override vì omit; nếu SL lệch → **O3 qty_drift warn** · cấm silent overwrite YCTD. |
| **3 Errors / UI** | Extend **`HRM-HC-CELL-ID-MISMATCH`** (409) khi gửi id lệch NK; omit = silent reuse; RETAIN **`HRM-HC-CELL-LOCKED`**; FE echo `cell_id` + drift dialog peer O3 + FE-after-2xx/F5 same id. |
| **4 AC** | `AC-REC-HC-CELL-01/01b/01c` · ALT-01..03 · EX-01..04 · VAL-REC-HC-CELL-01..05 — xem spec §5–§6. |

---

## Option evaluation summary

| Option | Verdict |
|--------|---------|
| **A REUSE by natural key** | **LOCKED** — aligns DATA-01 §6.1–6.2 stable identity + BR-BP-HC-04 |
| **B mint + relink + soft-retire** | **REJECT** — invents cell-version beyond O3 |
| **C block omit only** | **REJECT as sole fix** · **ACCEPT as FE echo belt** with A |

**ACCEPT_AS_IS?** **NO** — QA-02 confirmed mint orphan risk; product FIX required on BE.

---

## Spec says / code does

| Spec | Code AS-IS | Gap |
|------|------------|-----|
| Stable identity; reuse on NK | `normalizeHeadcountCell` mints UUID when omit **before** reuse; `!cell.cell_id` dead after mint | **R-REC-HC-OVERRIDE-CELLID** CONFIRMED |

---

## must_keep verified (governance)

| Item | Status |
|------|--------|
| REC-01/01b GWC · 409 `HRM-HC-CELL-LOCKED` no wipe | **RETAIN** — AC-REC-HC-CELL-EX-01 cites; cấm reopen P0 seat |
| Spawn idempotency BR-BP-HC-04 | **RETAIN** — AC-REC-HC-CELL-01c |
| O3 qty_drift no silent YCTD overwrite | **RETAIN** — ALT-01 |
| Honesty false · C-SLICE · no seed | **RETAIN** |

---

## Read-first ack

| Artifact | Result |
|----------|--------|
| `po-hrm-mvp-gd1-rec-01-cluster-qc-02.md` | Residual P2 → ba-process AC |
| `po-hrm-mvp-gd1-rec-01-cluster-be-02.md` | Mint khi override thiếu `cell_id` ghi residual |
| `po-hrm-mvp-gd1-rec-01-cluster-qa-02.md` | Mint `30ae64e4…`→`f447d354…` CONFIRMED |
| `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` O3 | qty_drift warn + no silent YCTD |
| `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` | cell stable + UQ spawn |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED Option A: override omit `cell_id` → REUSE by NK; YCTD KEEP link + O3 drift; ADD `HRM-HC-CELL-ID-MISMATCH`; AC-REC-HC-CELL-* + VAL; DENY mint+relink · ACCEPT_AS_IS · reopen CELL-LOCKED · honesty flip · seed. Next **dev-be** FIX normalize/reuse + jest omit→same id. |
| **next_owner** | **dev-be** |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-ba-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: BA-01 PASS_TO_PM CONFIRMED Option A LOCKED
residual: R-REC-HC-OVERRIDE-CELLID
change_mode: FIX (narrow) · preserve_default: true · code_memory_mode: APPEND
entry_criteria: read BA spec + DATA-01 §6 + be-02/qa-02 mint repro; U65 no seed
READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md (Option A · AC-REC-HC-CELL-*)
2. docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-ba-01.md
3. apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.ts (normalizeHeadcountCell mint)
4. apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts (existingByNaturalKey reuse)
MISSION:
1) FIX: when natural key hits existing cell, ALWAYS reuse prev.cell_id even if payload omits cell_id (mint only on first create for that NK).
2) If payload cell_id ≠ existing NK identity → 409 HRM-HC-CELL-ID-MISMATCH; do not replace identity.
3) must_keep: 409 HRM-HC-CELL-LOCKED without allow_override + no wipe (BE-02); spawn UQ BR-BP-HC-04; O3 no silent YCTD overwrite.
4) Jest: allow_override PUT omit cell_id → same cell_id; YCTD headcount_cell_id still resolves; mismatch case; locked no-override still 409.
5) Optional note for FE follow-on: echo cell_id on PUT + qty_drift dialog (O3) — may be separate FE seat after BE READY_FOR_QA.
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md
cấm: seed · mint+relink Option B · reopen P0 wipe semantics · flip recruitment_uat_ready · claim module REC UAT · dual SoT
```
