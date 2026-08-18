# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-05 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7 seat #9) |
| **depends_on** | QA-02 `PASS_WITH_OBS` stamp **`REC05QA2-MSL31GG0`** · BE-02 LIVE · FE-01 |
| **uc_ids** | `UC-BP-REC-05` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-05-cluster-qa-02.md`](po-hrm-mvp-gd1-rec-05-cluster-qa-02.md) |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-02.json` · overall **PASS_WITH_OBS** · stamp **`REC05QA2-MSL31GG0`** |
| **stamp** | QC **`REC05QC1-MSL35D49`** · QA **`REC05QA2-MSL31GG0`** · L1 re-seal **`REC05L1-MSL31HIU`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| **portal_url** | portal `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · HRM `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE / FR-05 module DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual SoT** | **DENIED** | L1 `Cannot *` · browser `nest_rec_hits=[]` |
| **Pool stage PATCH as FR-05 SoT** | **DENIED** | Lane A `data-lane=yctd-transitions` only |
| **Campaign / REC-03 invent** | **DENIED** | must_keep |
| **Reopen J-HRM-REC-CV-04-*** | **DENIED** | REC-04 seal RETAIN |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-7 stage-history GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim FR-05 / module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM reopen J-HRM-REC-CV-04-* / treat pool as FR-05? | **NO** |
| May PM open next UC seat **UC-BP-REC-06** (board #10) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-05** (Lịch sử trạng thái / Đổi trạng thái pipeline UV–YCTD) after QA stamp **`REC05QA2-MSL31GG0`**.

Audited: QA-02 MD · machine JSON L0/L1/network/journeys · screens 01–05 · Nest `/rec` DENY · honesty footer · prior CLOSED `R-REC-05-BE-BUILD-TS2345` + `R-REC-05-BE-ROUTES-NOT-LIVE`.

**U65 ACCEPT:** Ứng viên → badge `data-lane=yctd-transitions` → dialog **Đổi trạng thái pipeline (UV–YCTD)** · Select EFF only · POST `…/candidates/:id/transitions` **201** `HRM-REC-200` + `history_id` · F5 → tab **Lịch sử trạng thái** GET `…/stage-history` **200** rows≥1 · reverse allow **201** · invent **400** `HRM-REC-STAGE-UNKNOWN` · Network physical `/recruitment/` only · Nest `/rec` browser hits **0**.

**EX / L1 ACCEPT:** transitions/history LIVE (mapped `HRM-REC-404` not `Cannot *`) · Nest `/rec` `HRM-DATA-404` Cannot * · invent UNKNOWN.

**P2 OBS ACCEPT (non-blocking):** EFF `isRejectOutcome=0` → reject+note browser N/A (jest seals) · CFG `allow_reverse_stage` default true → REVERSE-FORBIDDEN browser N/A (jest seals).

**NOT Phase 1 DONE. NOT module REC UAT. NOT FR-05 module DONE. NOT `recruitment_uat_ready=true`.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-STG-05-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| L1 EFF + transitions/history LIVE + invent UNKNOWN | PRODUCT | **ACCEPT** |
| Nest `/rec` dual · 0 browser hits · L1 Cannot * | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| Pool-as-FR-05 / J-CV-04 reopen / Campaign | GOVERNANCE | **ACCEPT** · DENY |
| R-REC-05-EFF-NO-REJECT-OUTCOME | PRODUCT **P2 OBS** | **ACCEPT** defer · DENY seed CAT |
| R-REC-05-REVERSE-CFG-DENY-BROWSER | PRODUCT **P2 OBS** | **ACCEPT** defer · DENY CFG flip U65 |
| QA pack `command_table` miss (verify 1/8) | PROCESS | **OBS** — QC consolidates 8/8 |
| Journey map rows stamped 🟢 PASS | PROCESS | **CLOSED** this seat (`REC05QC1-MSL35D49`) |
| Stack ENV | ENV | L0 hrm/xbos/portal **200** (QC spot; Windows UV assert OBS — same REC-00/04) |
| Honesty / seed / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Browser U65 dialog EFF Select | J-01 · screen `02-transition-dialog` | 🟢 |
| 2 | POST transitions 201 + history_id + F5 timeline | J-02 · machine hist `ebdbcd49-…` · screen `04-stage-history` rows=8 | 🟢 |
| 3 | Invent UNKNOWN + reject path | J-03 L1 400 · Select-only · OBS no reject outcome | 🟢 (+OBS) |
| 4 | Reverse allow + multi-YCTD + Nest 0 | J-04 reverse 201 · peer unchanged · nest_rec_hits=[] | 🟢 (+OBS CFG) |
| 5 | Nest `/rec` DENY | L1 Cannot * · browser 0 | 🟢 **RETAIN** |
| 6 | DENY pool-as-FR-05 · J-CV-04 · seed · honesty | QA honesty + QC locks | 🟢 **RETAIN** |
| 7 | Closed BE LIVE residuals | TS2345 + ROUTES-NOT-LIVE CLOSED | 🟢 |
| 8 | C-SLICE ≠ module REC UAT | honesty · promote table | 🟢 |
| 9 | Evidence pack | QA verify **1/8** PROCESS OBS · QC consolidates **8/8** | 🟢 |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-02.md` | exit **1** · **1/8** miss `command_table` → **PROCESS OBS** (pattern REC-00/02/06a) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (node UV exit assert on Windows — health checks PASS · same OBS as REC-04 QC) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 (cited) | hrm/xbos/portal **200** | ENV/L0 |
| QC spot `qc:dev-stack` | hrm/xbos/portal **200** (UV assert OBS) | ENV/L0 |
| QA L1 EFF / transitions / history / nest-rec / invent | EFF 200 · LIVE mapped 404 · Nest Cannot * · UNKNOWN 400 | PRODUCT |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-02` | overall **PASS_WITH_OBS** stamp `REC05QA2-MSL31GG0` | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **1/8** miss command_table | PROCESS OBS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · tab=candidates |
| 5 | journey_l25 | ✅ **J-HRM-REC-STG-05-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-05 · EX UNKNOWN · transitions/stage-history |
| 7 | residual_section | ✅ below · P2 OBS catalog reject + CFG deny |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-STG-05-01** | **PASS** | Dialog UV–YCTD · EFF Select · GET `/recruitment/pipeline-stages/effective` |
| **J-HRM-REC-STG-05-02** | **PASS** | POST transitions 201 + `history_id` · GET stage-history 200 · F5 rows |
| **J-HRM-REC-STG-05-03** | **PASS** (+OBS) | Invent UNKNOWN 400 · reject+note browser N/A (EFF no reject) |
| **J-HRM-REC-STG-05-04** | **PASS** (+OBS) | Reverse allow 201 · multi-YCTD peer · Nest 0 · CFG deny N/A |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |
| J-HRM-REC-CV-04-* | **PASS_RETAIN** | DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-STG-05-01 | **PASS** |
| J-HRM-REC-STG-05-02 | **PASS** |
| J-HRM-REC-STG-05-03 | **PASS** (+OBS) |
| J-HRM-REC-STG-05-04 | **PASS** (+OBS) |

`PROGRAM_JOURNEY_MAP.md` J-HRM-REC-STG-05-01..04 stamped 🟢 **PASS** · cite `REC05QA2-MSL31GG0` / `REC05QC1-MSL35D49` · C-SLICE · honesty false.

### Screens (5)

`docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-05-cluster-qa-02/` — 01-candidates · 02-transition-dialog · 03-after-save · 04-stage-history · 05-reverse.

QC spot-check: dialog title **Đổi trạng thái pipeline (UV–YCTD)** · timeline **Lịch sử trạng thái** rows present for UV UATREC-ICHFBD.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** module REC UAT · Phase1 · FR-05 module DONE · `SERVICE_READINESS` · Nest `/rec` dual · pool-as-FR-05 · seed · reopen J-CV-04 / sealed W1–W6.
2. **must_keep:** REC-04 Quét kho seal · UV–YCTD Lane A transitions · EFF catalog spine · REC-06a interview seals (cite, not redefine).
3. **P2 OBS R-REC-05-EFF-NO-REJECT-OUTCOME:** catalog peer — reject+note / `HRM-REC-STAGE-REJECT-REASON` browser deferred; jest BE seals mint. **DENY seed** reject stage for U65.
4. **P2 OBS R-REC-05-REVERSE-CFG-DENY-BROWSER:** EX-03 CFG deny deferred; default allow → reverse 2xx asserted; jest seals `REVERSE-FORBIDDEN`. **DENY** flip tenant CFG solely for QA pass.
5. **PROCESS OBS:** QA pack command_table miss (QC consolidated 8/8) · journey map stamp **CLOSED** this seat.
6. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-7 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-05-EFF-NO-REJECT-OUTCOME** | P2 OBS | OPEN / idle-ok | **peer-CAT** (catalog) — not product reopen this seat |
| **R-REC-05-REVERSE-CFG-DENY-BROWSER** | P2 OBS | OPEN / idle-ok | **qa-follow** optional — jest seals deny |
| Journey map stamp J-STG-05-* | PROCESS | **CLOSED** | **qc** — stamped PASS this seat |
| Honesty / C-SLICE | — | RETAIN | **pm** — DENY flip |
| Product P0 this seat | — | **none** | — |
| Prior BE LIVE residuals | — | **CLOSED** | TS2345 · ROUTES-NOT-LIVE |

**No residual PRODUCT P0** from J-HRM-REC-STG-05-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim FR-05 module DONE / module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · pool stage as FR-05 · Campaign / REC-03 invent  
- Seed / reopen J-HRM-REC-CV-04-* / sealed W1–W6 UF without regression  
- Treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #10 **UC-BP-REC-06** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-05: J-HRM-REC-STG-05-01..04 PASS (EFF dialog · POST transitions 201+history · stage-history F5 · invent UNKNOWN · reverse allow · Nest /rec 0) · U65. Conditions: honesty false · P2 OBS catalog reject + CFG deny · PROCESS pack/journey stamp. DENY module REC UAT / FR-05 DONE / pool-as-FR-05 / J-CV-04 reopen / seed. Next continuous: **UC-BP-REC-06** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-06
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qc-01.md · stamp REC05QC1-MSL35D49 · Wave-7 UC-BP-REC-05 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-05 (#9) = **UC-BP-REC-06** (#10 QUEUED) «Gửi thư tuyển + đánh giá PV trong pipeline ứng viên»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06 · peer REC-06a interview seals RETAIN · REC-05 stage-history RETAIN

MISSION — SA Option seat (narrow):
1) Option A/B/C for offer-letter send + interview evaluation inside candidate pipeline vs AS-IS Lane A interviews / applications spine
2) F.1 API map + must_keep REC-05 transitions/history · REC-06a one-active IV · REC-04 Quét kho · DENY Nest /rec dual · DENY Campaign/REC-03 · DENY pool-as-FR-05 · DENY reopen J-STG-05 / J-CV-04 without regression
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module REC UAT · seed · C-SLICE-as-module-DONE
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-SA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-sa-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`REC05QC1-MSL35D49` · 2026-08-09 · **GO WITH CONDITIONS** · Wave-7 SEALED ≠ module GO
