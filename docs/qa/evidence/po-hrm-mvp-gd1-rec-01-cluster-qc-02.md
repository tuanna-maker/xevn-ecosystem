# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-01 + UC-BP-REC-01b C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`RECQA2-MSKT56EP`** · BE-02 READY (jest **55/55**) · QA-01 P0 FAIL closed |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-01-cluster-qa-02.md`](po-hrm-mvp-gd1-rec-01-cluster-qa-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-01-cluster-be-02.md`](po-hrm-mvp-gd1-rec-01-cluster-be-02.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md) O1–O5 · AC-REC-HC-01-EX-04 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md) §5 F-REC-HC-* |
| **sa_ref** | [`PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md) Option A |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-01-cluster-qa-02.json` · `_tmp-…-qa-02-l1.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-01-cluster-qa-02/` (01–05 · 07–08 · 11–12) |
| **stamp** | `RECQA2-MSKT56EP` · plan `3f302f4d-82a1-4e41-adbf-7e1fab6a0fc4` · cell `2822b499-6b36-4055-96a2-e2eb9e751a97` |
| **U65** | zero-seed · observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Dual `rec_headcount_*` SoT / invent Nest `/rec/headcount-plans`** | **DENIED** | invent **404** PASS |
| **C-SLICE-≠-MODULE** | **RETAIN** | First continuous-GD cluster GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat REC-02 / REC-02b? | **YES** (U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for first U89 continuous cluster **UC-BP-REC-01 + UC-BP-REC-01b** after QA-02 stamp **`RECQA2-MSKT56EP`**.

Audited: QA-02 MD · QA-01 FAIL (P0 wipe) · BE-02 FIX (validate-then-write · jest 55/55) · L1 JSON · browser machine `ac.*` · screens (create/Lưu/F5 · 409 no-blank · YCTD list/detail) · BA AC + API F-REC-HC-01 (7) · SA Option A.

**P0 `R-REC-HC-PUT-LOCKED-WIPE` CLOSED:** locked PUT → **409 `HRM-HC-CELL-LOCKED`**; GET immediately after: `positions=1` · **same** `cell_id=2822b499-…` · `need_hire=7` · `lifecycle=need_hire_approved` · `gridIntact=true`; spawn after 409 → **created:1**; re-spawn → **skipped_duplicate:1**.

**must_keep PASS:** allow_override O3 **200** (cell retained when sent) · U19 list↔get + `trsport` rollup · invent deny **404** · XBOS `submit-workflow` **201** `HRM-REC-PLAN-WF-200` · no dual SoT.

**U65 / U19:** J-HRM-REC-HC-01 🟢 (single CT ALT-03 · Lưu 201 + FE-after-2xx + F5 · submit-wf · UF-409-NO-BLANK) · J-HRM-REC-HC-01b 🟢/OBS (L1 spawn+skip · FE spawn btn NOTE_BLOCKED · J-HRM-05).

**NOT Phase 1 DONE. NOT module REC UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| P0 locked PUT wipe (QA-01) | PRODUCT | **CLOSED** BE-02 + QA-02 |
| QA pack `verify:qc:evidence-pack` **1/8** miss `command_table` | PROCESS | **OBS** — QC consolidates **8/8** below |
| UF-O4 machine `NOTE_BLOCKED` (pending_approval) vs MD O4T6PIE claim | PROCESS OBS | **CONDITION** — RETAIN QA-01 O4 `O4SHJWO` as prior warn-allow PASS; no separate qa-02-o4.json |
| FE spawn btn ABSENT on already-spawned plan | OBS | idle-ok — L1 spawn proven |
| R-REC-HC-OVERRIDE-CELLID mint without `cell_id` | PRODUCT P2 | **CONDITION** → ba-process |
| R-ATT-CRUD-RD-PARITY-SPEC | PRODUCT P2 pre-existing | **OUT of slice** — attendance owner |
| Stack ENV | — | L0 ALL PASS (QA) |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | P0 CLOSED: 409 + GET intact + spawn created:1 / skip | L1 `PUT_LOCKED` · `GET_AFTER_LOCKED` · `SPAWN1_AFTER_409` · `SPAWN2` · ac `L1-P0-PUT-LOCKED-NO-WIPE` | 🟢 **CLOSED** |
| 2 | allow_override O3 200 | L1 `PUT_OVERRIDE` need 3→9 · cell retained | 🟢 |
| 3 | U65 FE-after-2xx + F5 (not API-only) | `UF-SAVE`/`UF-FE-AFTER-2XX`/`UF-F5` · screens 03/04 · submit-wf UF | 🟢 |
| 4 | UF after 409 not blank | `UF-409-NO-BLANK` gridAfter=1 · screens 07/08 | 🟢 (browser-context PUT — FE grid edit locked OBS) |
| 5 | U19 scope parity | LIST/GET + rollup trsport 200 | 🟢 |
| 6 | invent deny / no dual SoT | `/rec/headcount-plans` + underscore **404** | 🟢 |
| 7 | submit-workflow must_keep | **201** `HRM-REC-PLAN-WF-200` | 🟢 |
| 8 | Honesty / C-SLICE / no seed | QA + QC explicit | 🟢 **RETAIN false** |
| 9 | J-HRM-REC-HC-01 / 01b | journeys PASS · J-HRM-05 PASS | 🟢 / OBS spawn btn |

### Evidence pack (QC consolidate)

| Check | Status |
|-------|--------|
| work_item_id + verdict + ack | 🟢 |
| L0 / L1 tables | 🟢 |
| J-* L2.5 rollup | 🟢 |
| UF FE-after-2xx blocks | 🟢 |
| machine JSON + screens | 🟢 |
| residual + honesty | 🟢 |
| Classification ENV vs PRODUCT | 🟢 |
| command_table (QA miss) | 🟡 PROCESS OBS → **QC fills** |

#### QC command table (consolidate)

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:fe-be-health` (cited) | ALL PASS | ENV/L0 |
| BE-02 jest cluster (cited) | **55/55** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-02.md` | exit **1** (command_table only) | PROCESS OBS |
| QC audit L1 JSON stamp `RECQA2-MSKT56EP` | P0 fields match MD | PRODUCT |

---

## BA AC coverage — first continuous cluster

### Closed / ACCEPT this wave (QA-01 + QA-02 + BE)

| AC / O | Status |
|--------|--------|
| **O1** single `need_hire` (ALT-03 ns=0 dx=0) | 🟢 |
| **O2** default `on_approve` (activation_mode on approve) | 🟢 |
| **O3** allow_override write (API) · no silent wipe on lock | 🟢 API · FE qty_drift dialog **NOTE_BLOCKED** |
| **O4** vượt grid warn-allow approve | 🟢 **RETAIN** QA-01 `O4SHJWO` · this-seat machine NOTE_BLOCKED |
| **O5** / U19 rollup read | 🟢 API list/get rollup · HCNS dedicated UI shallow |
| **AC-REC-HC-01 / 01b / 01c / 01d** (create · Lưu · submit · approve+lock) | 🟢 |
| **AC-REC-HC-01-EX-04** / BR-REC-01-LOCK | 🟢 **P0 CLOSED** |
| **AC-REC-HC-01-EX-07** U19 | 🟢 |
| **AC-REC-HC-01b-01 / 01b-02 / ALT-01 / EX-01 / EX-05** (spawn · list · idempotent · not-approved 409) | 🟢 |
| **AC-REC-HC-01-ALT-03** | 🟢 |
| Invent / dual SoT deny | 🟢 |

### Remain / CONDITION (do **not** block next UC seat; do **not** claim full BA pack 100%)

| AC row | Status | Owner / note |
|--------|--------|--------------|
| **AC-REC-HC-01-ALT-01** Từ chối + lý do + F5 | ⬜ untested this cluster | ba-process/qa follow-on or REC-02 WF depth |
| **AC-REC-HC-01-ALT-02** T3+T8 two cells | ⬜ | follow-on |
| **AC-REC-HC-01-ALT-04** XBOS inbox approve end-to-end (no seed) | 🟡 submit-wf 201 only · inbox not forced | must_keep path open · U65 |
| **AC-REC-HC-01-ALT-05** migration ns/dx | ⬜ / BE migration spot | ba-data RETAIN |
| **AC-REC-HC-01-EX-01..03 · 05 · 06** VAL/KEY/cross-OU/projected | 🟡 partial BE jest · not full browser matrix | residual depth |
| **AC-REC-HC-01e** HCNS tổng hợp FE persona | 🟡 API rollup only | optional |
| **AC-REC-HC-01f** cross-nav ô→YCTD | 🟡 J-HRM-05 list→detail PASS · cell deep-link shallow | |
| **AC-REC-HC-01b-03** JD ref on YCTD | ⬜ optional if JD on cell | REC-00 / JD |
| **AC-REC-HC-01b-04** two YCTD T3+T8 | ⬜ (ties ALT-02) | |
| **AC-REC-HC-01b-ALT-02** qty_drift FE confirm | NOTE_BLOCKED | FE locked edit |
| **AC-REC-HC-01b-ALT-03 / EX-02 / EX-03** calendar_month / projected-only | ⬜ CFG modes | follow-on |
| **R-REC-HC-OVERRIDE-CELLID** | P2 OPEN | **ba-process** AC (send `cell_id` vs BE natural-key keep) |

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` promote.
2. **Residual P2 `R-REC-HC-OVERRIDE-CELLID`:** ba-process AC delta (override without `cell_id` mints new id → orphan YCTD risk) — may run **parallel** with next UC SA/BA.
3. **Residual P2 `R-ATT-CRUD-RD-PARITY-SPEC`:** attendance lane · **OUT of REC-01** · do not reopen BE-02.
4. **AC remain rows** (table above): tracked · **not** required to reopen this seat before REC-02.
5. **OBS:** FE spawn btn · O4 this-seat machine NOTE_BLOCKED (QA-01 O4 RETAIN) · QA pack command_table PROCESS.

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-HC-01** | 🟢 PASS | Lưu+F5 · submit · lock/409 no wipe UI · ALT-03 |
| **J-HRM-REC-HC-01b** | 🟢 PASS / OBS | L1 spawn+skip · FE btn OBS · **J-HRM-05** 🟢 |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (next UC cluster) + **ba-process** (OVERRIDE-CELLID residual) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md` |
| **completion_report** | GWC C-SLICE: P0 R-REC-HC-PUT-LOCKED-WIPE CLOSED; O3 override 200; U65 J-HRM-REC-HC-01/01b ACCEPT; U19 + invent deny + submit-workflow must_keep; honesty false; AC core EX-04/spawn/idempotent ACCEPT; AC remain listed; residuals OVERRIDE-CELLID + ATT parity carried. DENY module REC UAT / Phase1 / SERVICE_READINESS. Next continuous seat: REC-02 + REC-02b. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: QC-02 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-01/01b = REC-02 / REC-02b (#3–#4 QUEUED)

READ FIRST:
1. docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md
2. SRS FR for UC-BP-REC-02 (YCTD trong định biên) + UC-BP-REC-02b (ngoài định biên + BOD / Q-REC-HEADCOUNT)
3. SA/BA REC-01 Option A + API physical recruitment-plans / job_requisitions (must_keep)
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qc-02.md (GWC · honesty false · residuals)

MISSION:
1) Option A/B/C hẹp cho REC-02 + REC-02b cluster — preserve YCTD/job_requisitions + XBOS WF; DENY dual SoT / invent Nest.
2) Map D1–D4 gaps; cite must_keep from REC-01 (cell_id · spawn idempotent · submit-workflow · U19).
3) Explicit OUT: REC-03 Campaign · seed · honesty flip · module REC UAT claim.
4) Handoff ba-process AC pack for REC-02/02b; note parallel residual R-REC-HC-OVERRIDE-CELLID (P2) for ba-process AC on override+cell_id.

PARALLEL residual (same session if quota):
work_item_id: PO-HRM-MVP-GD1-REC-01-OVERRIDE-CELLID-BA-01
lane: ba-process
MISSION: AC for allow_override PUT without cell_id — FE must send cell_id vs BE keep-by-natural-key; prevent orphan YCTD headcount_cell_id. Cite R-REC-HC-OVERRIDE-CELLID. C-SLICE · no honesty flip.

exit: PASS_TO_PM · Option LOCKED · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-sa-01.md
cấm: seed · flip recruitment_uat_ready · claim module REC UAT · reopen REC-01 P0 wipe seat
```
