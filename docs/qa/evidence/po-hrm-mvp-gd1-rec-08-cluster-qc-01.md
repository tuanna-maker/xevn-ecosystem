# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-08 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`REC08QA-MSKX5N59`** · BE-01 READY (jest **58**) · FE-01 READY (vitest **17**) |
| **uc_ids** | `UC-BP-REC-08` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-08-cluster-qa-01.md`](po-hrm-mvp-gd1-rec-08-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-08-cluster-be-01.md`](po-hrm-mvp-gd1-rec-08-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-08-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-08-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md) AC-REC-08-01..10 · O1–O10 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md) F-REC-DASH-01/02 |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-08-cluster-qa-01.json` · overall **PASS** |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-08-cluster-qa-01/` (**8**) |
| **stamp** | QC **`REC08QC-MSKXQC01`** · QA **`REC08QA-MSKX5N59`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |
| **co-seal** | [`po-hrm-mvp-gd1-rec-02-bod-chain-qc-02.md`](po-hrm-mvp-gd1-rec-02-bod-chain-qc-02.md) same session |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual / greenfield** | **DENIED** | invent GET **404** |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **FE formula / second aggregate** | **DENIED** | Nest display-ready DTO only |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave REC-08 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-REC-06a** (board #6) as **sa Option**? | **YES** (U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-08** after QA stamp **`REC08QA-MSKX5N59`**.

Audited: QA-01 MD · raw JSON L0/L1/network · screens (8) · BE-01 jest 58 · FE-01 vitest 17 (Nest bind + DENY aggregator) · BA AC-REC-08-01..10 · API F-REC-DASH · co-seal BOD-CHAIN QC-02.

**U65 ACCEPT:** filter kỳ + F5 `dash_*` · Nest KPI/funnel 5 / enough_people / empty_guide · YCTD drill → detail (**J-HRM-REC-DASH-01** / **J-HRM-05**, Campaign primary DENY) · Reports O8 same Nest · PERIOD-400 · scope 409 · no C&B · Nest `/rec` 404.

**NOT Phase 1 DONE. NOT module REC UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| AC-REC-08-01..10 + EX-01/02/04/05 browser + L1 | PRODUCT | **ACCEPT** this seat |
| Nest display-ready DTO · no FE formula (AC-09) · Reports O8 | PRODUCT | **ACCEPT** · FE-01 + QA code audit |
| J-HRM-REC-DASH-01 / J-HRM-05 drill | PRODUCT L2.5 | 🟢 **PASS** this seat |
| **`nest build` TS2724 `HrmListScopeContext`** | PRODUCT **P1** | **CONDITION OPEN** — `PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01` DISPATCHED parallel; QA **content-sealed** running dist for UF |
| Token `SCOPE_CONTEXT_MISMATCH` vs BA `HRM-SCOPE-409` | PRODUCT **P3** | **CONDITION** — pattern match ACCEPT; alias tidy deferred |
| QA pack `verify:qc:evidence-pack` 2/8 miss command_table + crud_or_matrix | PROCESS | **OBS** — QC consolidates **8/8** below |
| Journey map rows DASH-01/02 still DRAFT label | PROCESS OBS | QA/QC prove PASS this seat · PM/BA map stamp follow-up · **not** honesty flip |
| Stack ENV | ENV | L0 hrm/xbos/portal **200** · dashboard LIVE after dist restart |
| Honesty / Nest dual / seed / C&B | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission A)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | AC-REC-08-01 filter kỳ | QA browser · URL dash_mode/year · GET **200** | 🟢 |
| 2 | AC-REC-08-02 bind + F5 | KPI Nest fields · F5 retains filter · GET again | 🟢 |
| 3 | AC-REC-08-03 KH integrity | planned=45 · pct=0 · not invent 100% | 🟢 |
| 4 | AC-REC-08-04 funnel 5 | `cv..onboard` `data-funnel-key` | 🟢 |
| 5 | AC-REC-08-05 enough_people | `in_progress` · eta `2026-08` | 🟢 |
| 6 | AC-REC-08-06 / J-HRM-REC-DASH-01 / J-HRM-05 | by_yctd click → GET requisition **200** · campaignPrimary=false | 🟢 |
| 7 | AC-REC-08-07 out_of_plan | Mode «Ngoài định biên» in drill table | 🟢 |
| 8 | AC-REC-08-08 no C&B | UI+JSON omit salary/cost/MST/bank | 🟢 |
| 9 | AC-REC-08-09 no FE formula | Nest panel · aggregator disabled · report builder throws | 🟢 |
| 10 | AC-REC-08-10 Reports O8 | Module Reports + `/hr/reports` same Nest semantics | 🟢 |
| 11 | EX-01 PERIOD-400 | Invalid range · KPI `—` · L1 **400** | 🟢 |
| 12 | EX-02 scope 409 | L1 **409** · FE VI map | 🟢 |
| 13 | EX-04 empty_guide | Year 2027 · `NO_APPROVED_HEADCOUNT` card | 🟢 |
| 14 | EX-05 Nest `/rec` dual | GET **404** | 🟢 |
| 15 | Honesty / C-SLICE / no seed | QA + QC explicit | 🟢 **RETAIN false** |
| 16 | Evidence pack | QA PROCESS OBS · QC consolidates | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md` | exit **1** · **2/8** miss `command_table` + `crud_or_matrix` → **PROCESS OBS** |
| QC SoT pack this file | 🟢 **8/8** below |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:dev-stack` / L0 (cited) | hrm/xbos/portal **200** · dashboard LIVE | ENV/L0 |
| BE-01 jest (cited) | **58** PASS | PRODUCT |
| FE-01 vitest (cited) | **17** PASS | PRODUCT |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-08-cluster-qa-01.mjs` | overall **PASS** stamp `REC08QA-MSKX5N59` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **2/8** PROCESS OBS | PROCESS |
| QC spot screens + JSON | 8 screens · JSON overall PASS | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` / `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-REC-DASH-01** 🟢 · **J-HRM-05** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-08-01..10 + EX matrix above |
| 7 | residual_section | ✅ Conditions P1/P3 + honesty |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-DASH-01** | **PASS** | Dashboard → by_yctd → YCTD detail |
| **J-HRM-05** | **PASS** | Detail GET 200 from drill · must_keep |
| **J-HRM-REC-DASH-02** | **PASS** | Reports same Nest (AC-10 O8) · map row may still say DRAFT |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-DASH-01 | **PASS** |
| J-HRM-05 | **PASS** |

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual · FE formula.
2. **Condition P1 `R-REC-08-NEST-BUILD-TS2724`:** `nest build` fails import `HrmListScopeContext` (dashboard service) — **OPEN** · owner **`dev-be`** · work_item **`PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01`** DISPATCHED this session. QA UF relied on **content-sealed / restarted dist** (not clean rebuild). **Does not** reopen AC-REC-08 browser ACCEPT while LIVE dist serves dashboard*.
3. **Condition P3 `R-REC-08-SCOPE-TOKEN-ALIAS`:** runtime **409** token `SCOPE_CONTEXT_MISMATCH` vs BA/API text `HRM-SCOPE-409` — FE VI map present · **ACCEPT pattern** · alias tidy deferred (not UF blocker).
4. **RETAIN** REC-01 / REC-02 GWC seals · co-seal BOD-CHAIN QC-02 ALT-01 CLOSED.
5. **NOT** Phase 1 DONE · **NOT** module REC UAT.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-08-NEST-BUILD-TS2724** | P1 | **OPEN** (DISPATCHED) | **dev-be** `PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01` |
| **R-REC-08-SCOPE-TOKEN-ALIAS** | P3 | OPEN / idle-ok | **dev-be** or **ba-process** alias note |
| Honesty / C-SLICE | — | RETAIN | **pm** — DENY flip |
| QA pack PROCESS | OBS | consolidated | — |

**No residual PRODUCT P0** from AC-REC-08 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / claim module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT  
- Seed / invent FE formula / C&B on dashboard  
- Treat GWC as module GO  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #6 **UC-BP-REC-06a** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-08: AC-REC-08-01..10 + EX + J-HRM-REC-DASH-01/J-HRM-05 ACCEPT; Nest display-ready · Reports O8 · PERIOD-400 · scope 409 · empty_guide · no C&B · Nest `/rec` 404. Conditions: P1 nest-build TS2724 (BUILD-FIX-BE-01 DISPATCHED · QA content-sealed dist) · P3 SCOPE token alias. Honesty false. DENY module REC UAT / Phase1 / Nest dual. Co-seal BOD-CHAIN QC-02 same seat. Next continuous: **UC-BP-REC-06a** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-06a
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qc-01.md · co-seal docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qc-02.md
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-08 (#5) = **UC-BP-REC-06a** (#6 QUEUED) «Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên»

MISSION — SA Option seat (narrow):
1) Option A/B/C for interview schedule mutate (one active schedule invariant) vs AS-IS Nest recruitment
2) F.1 API map + must_keep REC-01/02/08 seals · DENY Nest /rec dual · DENY Campaign primary invent
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · module REC UAT · seed · reopen sealed REC-08 AC without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```
