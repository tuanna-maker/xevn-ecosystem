# Evidence — `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **narrow GWC Condition close** · residual **R-REC-HC-OVERRIDE-CELLID** · **not** module REC UAT |
| **priority** | P2 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **parent_gwc** | [`po-hrm-mvp-gd1-rec-01-cluster-qc-02.md`](po-hrm-mvp-gd1-rec-01-cluster-qc-02.md) — Condition P2 **R-REC-HC-OVERRIDE-CELLID** |
| **depends_on** | QA-01 **PASS_TO_PM** stamp **`HCELLQA-MSKU39UX`** · BE-01 READY · BA-01 Option A LOCKED |
| **condition_close** | **R-REC-HC-OVERRIDE-CELLID** ✅ **CLOSED ACCEPT** |
| **Verdict** | **GO WITH CONDITIONS** — residual **CLOSED** · honesty `recruitment_uat_ready=false` RETAIN · **C-SLICE-≠-MODULE** · **DENY** module REC UAT / Phase1 / reopen P0 wipe |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.md`](po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md`](po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md`](../program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md) |
| **machine** | [`_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.json`](_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01/` (`01`–`04` present · QC spot `04-after-reload.png`) |
| **stamp_ref** | `HCELLQA-MSKU39UX` · plan `7fe953c8-…` · C0 `0402ba25-…` · YCTD `90ba99ea-…` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Condition CLOSED ≠ module REC UAT / Phase1 DONE |

### Honesty locks (mandatory — RETAIN · DENIED flip)

| Flag / seal | Value | QC note |
|-------------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| REC-01 QC-02 GWC (P0 wipe CLOSED · O3 · U19 · invent deny · submit-wf) | **SEAL RETAIN** | **FORBIDDEN reopen** |
| **EX-01 / `HRM-HC-CELL-LOCKED` no-wipe** | **RETAIN PASS** | sealed P0 — this seat regression 🟢 |
| **BR-BP-HC-04** spawn idempotency | **RETAIN PASS** | re-spawn `skipped_duplicate:1` on C0 |
| **BR-O3-QTY-DRIFT** no silent YCTD overwrite | **RETAIN PASS** | headcount **5→5** after need 8 + drift warn |
| **U19** scope parity | **RETAIN** | BE cite no scope touch; parent QC-02 U19 🟢 |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **Seed / DB identity flip** | **DENIED** (U65) | machine `seed_used=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | |

---

## Verdict summary

**GO WITH CONDITIONS** — CLOSE only QC-02 Condition **R-REC-HC-OVERRIDE-CELLID** after QA stamp **`HCELLQA-MSKU39UX`** (overall **PASS** · rebuilt `:28001` dist noted · honesty false · U65 zero-seed).

Audited: QA-01 MD · BE-01 · BA-01 Option A LOCKED · parent QC-02 GWC · machine L1 JSON · screens `01`–`04` · live L0 **hrm/xbos/portal 200** · dist markers `HRM-HC-CELL-ID-MISMATCH` + `mintWhenMissing` in `dist/recruitment/*`.

**R-REC-HC-OVERRIDE-CELLID = CLOSED.** Option A live: override **omit** `cell_id` → **200** reuse same C0; foreign `cell_id` → **409 `HRM-HC-CELL-ID-MISMATCH`**; EX-01 LOCKED no-wipe RETAIN; spawn skip + O3 drift without silent YCTD overwrite.

**NOT Phase 1 DONE. NOT module REC UAT.** Dev unlock REC-02/02b still gated on **API-01** (continuous queue).

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Override omit mint → orphan YCTD (QC-02 Condition) | PRODUCT P2 | **CLOSED** BE-01 + QA-01 + this QC |
| QA pack `verify:qc:evidence-pack` **1/8** miss `journey_l25` | PROCESS | **OBS** — QC consolidates **8/8** below |
| U65 screen `04` reload mid-spinner on plans list | OBS | Shell present · `blankish=false` · API grid intact cited — **ACCEPT** (not white crash); toast may be absent (page-context PUT) per QA OBS |
| `p1-phase1-be-crud-rd-parity` attendance FAIL | PRODUCT P2 | **OUT of slice** — attendance lane carry only |
| FE echo belt **AC-REC-HC-CELL-01b** | OUT | optional FE — not this seat mandatory |
| Stack ENV | — | L0 **200/200/200** QC spot |

---

## Residual disposition (mission)

| Residual | Prior | QC-01 |
|----------|-------|-------|
| **R-REC-HC-OVERRIDE-CELLID** | P2 OPEN (QC-02 Condition) | ✅ **CLOSED ACCEPT** |
| **R-ATT-CRUD-RD-PARITY-SPEC** | P2 OUT | **CARRY** — owner **attendance lane** · do **not** reopen REC-HC |
| FE AC-01b echo belt | OUT | **NOTE** — not blocking Condition close |

---

## AC audit (BA §5 vs QA stamp)

| AC-ID | QA / machine | QC |
|-------|--------------|-----|
| **AC-REC-HC-CELL-01** | PUT omit+override need 5→8 → **200** · afterCell=C0 · reused=true | 🟢 **ACCEPT** |
| **AC-REC-HC-CELL-01c** | re-spawn created=0 skipped=1 · `HRM-HC-SPAWN-QTY-DRIFT` · yctdHc **5→5** | 🟢 **ACCEPT** (O3 + BR-BP-HC-04) |
| **AC-REC-HC-CELL-EX-02** | foreign UUID → **409 `HRM-HC-CELL-ID-MISMATCH`** · identity C0 · need=8 | 🟢 **ACCEPT** |
| **AC-REC-HC-CELL-EX-01** *(must_keep P0)* | **409 `HRM-HC-CELL-LOCKED`** · positions=1 · same C0 · spawn created=1 | 🟢 **RETAIN — not reopened** |
| **AC-REC-HC-CELL-ALT-03** | new-month NK: m8 reuse `d4a58465…` · m9 mint `ad83a93c…` (CHRO_ALT KEY-UNKNOWN = false negative / EFF catalog) | 🟢 **ACCEPT** |
| **U65 MISMATCH UI** | browser Định biên after 409 · blankish=false · gridHints=3 · VI message present | 🟢 **ACCEPT** (+ OBS spinner capture) |
| **AC-REC-HC-CELL-01b** FE echo | OUT this seat | ⬜ **NOTE** — not required to close residual |

**spec_ref:** BA-01 §1.5 Option A · §2 BR-REC-HC-CELL-* · §5 AC · DATA-01 §6.1–6.2 · parent QC-02 must_keep.

---

## must_keep verification

| must_keep | Evidence | QC |
|-----------|----------|-----|
| EX-01 LOCKED no-wipe (sealed P0) | L1 `EX01_LOCKED` 409 + GET intact + spawn eligible | 🟢 |
| BR-BP-HC-04 spawn idempotency | `CELL01c_RESPAWN` skipped_duplicate on C0 · existing YCTD `90ba99ea-…` | 🟢 |
| O3 no silent YCTD overwrite | drift warn · yctdHcBefore=5 · yctdHcAfter=5 | 🟢 |
| U19 parity | BE-01: scope helpers untouched · parent QC-02 U19 🟢 | 🟢 RETAIN |
| No honesty / module UAT / P0 reopen | Explicit DENY in QA+QC | 🟢 |

---

## J-* L2.5 (U19 — narrow deepen)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-HC-01** | 🟢 PASS (deepen) | Parent QC-02 🟢 RETAIN + this seat: omit reuse · LOCKED · MISMATCH UI non-blank |
| **J-HRM-REC-HC-01b** | 🟢 PASS (deepen) | Parent 🟢/OBS RETAIN + this seat: skip duplicate + O3 drift no overwrite |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

---

## Evidence pack (QC consolidate)

QA `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.md` → exit **1** (**1/8** miss `journey_l25`) = **PROCESS OBS**.

| Check | Status |
|-------|--------|
| work_item_id + verdict + ack | 🟢 |
| L0 / L1 tables | 🟢 |
| J-* L2.5 rollup (this QC) | 🟢 |
| UF / U65 FE-after-409 | 🟢 |
| machine JSON + screens | 🟢 |
| residual + honesty | 🟢 |
| Classification ENV vs PRODUCT | 🟢 |
| command_table | 🟢 (below) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 / `qc:fe-be-health` (cited) | ALL PASS | ENV/L0 |
| QC spot `qc:dev-stack` + HTTP | hrm **200** · xbos **200** · portal **200** | ENV |
| Dist markers `HRM-HC-CELL-ID-MISMATCH` + `mintWhenMissing` | present under `apps/api/hrm-api/dist/recruitment/` | PRODUCT |
| BE-01 jest (cited) | cellid **6** + sealed cluster · recruitment **169** (parity ignored) | PRODUCT |
| `verify:qc:evidence-pack` (QA path) | exit **1** journey_l25 only | PROCESS OBS |
| QC audit stamp `HCELLQA-MSKU39UX` | AC fields match MD + JSON | PRODUCT |

---

## Conditions (GWC after this seat)

1. **Honesty:** keep `recruitment_uat_ready=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` promote.
2. **R-REC-HC-OVERRIDE-CELLID:** ✅ **CLOSED** — do **not** re-dispatch unless regression.
3. **R-ATT-CRUD-RD-PARITY-SPEC:** P2 **CARRY** · attendance lane only.
4. **AC-01b FE echo belt:** OUT / optional · not blocking.
5. **REC-01 QC-02 seals** (P0 wipe · invent deny · submit-wf · U19): **RETAIN**.
6. **Continuous W2:** REC-02/02b **Dev unlock pending API-01** CONFIRMED — do not claim Dev READY without physical API F.1.

**Cấm:** honesty flip · module REC UAT claim · reopen P0 wipe · seed · treat Condition CLOSED as module GO · invent attendance fix in this WI.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-qc-01.md` |
| **completion_report** | Narrow GWC: **R-REC-HC-OVERRIDE-CELLID CLOSED**. AC-01/01c/EX-02/EX-01/ALT-03 + U65 MISMATCH UI ACCEPT on live rebuilt dist stamp `HCELLQA-MSKU39UX`. must_keep EX-01/BR-BP-HC-04/O3/U19 RETAIN. Honesty false · C-SLICE. Attendance parity P2 CARRY out-of-slice. Pack journey_l25 PROCESS OBS consolidated. **NOT** module REC UAT / Phase1. Next: continuous queue — REC-02 API-01 → then Dev unlock. |
| **next_dispatch_prompt** | (copy-ready below) |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md · BA-01 O1–O5 · SA-01 Option A
context: QC-01 CLOSED residual R-REC-HC-OVERRIDE-CELLID (docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-qc-01.md) — do NOT reopen; REC-01 GWC RETAIN; honesty false
MISSION: TechSpec/API F.1 DOC-DELTA on PHYSICAL Option A paths. Lock DTO↔column for /api/hrm/recruitment/requisitions* (F-REC-YCTD-01..04): create/submit in_plan + out_of_plan; transitions → open_for_hire; PATCH pipeline-flags; error tokens HRM-YCTD-*; O2 409 CELL-QTY; O4 unclassified CV block; XBOS matrix; scope_parity U19. Cite DATA-01 physical SoT. Paper /rec/* = alias only.
READ FIRST:
  1. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md
  2. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-SA-01.md §8 Y-S1..Y-S13
  3. docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md
  4. docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-data-01.md
  5. docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-qc-01.md (CLOSED residual — must_keep cell identity)
DELIVER:
  - docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-api-01.md
must_keep: Option A · REC-01 spawn/cell identity · OVERRIDE-CELLID CLOSED · JD soft FK · honesty false · U65 · DENY dual rec_* / Nest /rec dual / seed / module REC UAT
EXIT: PASS_TO_PM CONFIRMED · next_owner pm → unlock dev-be/fe after API CONFIRMED
```
