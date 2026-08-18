# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-06a C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-4) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`REC06AQA2-MSKZ58NH`** · BE-02 READY (R-REC-IV-PROJ-ID L1) · FE-01 READY |
| **uc_ids** | `UC-BP-REC-06a` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md`](po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-06a-cluster-be-02.md`](po-hrm-mvp-gd1-rec-06a-cluster-be-02.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md) AC-REC-IV-03..06 · O1–O10 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md) F-REC-IV-02/03/04 · R-A PATCH · status PATCH |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-02.json` · overall **PASS_TO_PM** |
| **stamp** | QC **`REC06AQC2-MSKZAM58`** · QA **`REC06AQA2-MSKZ58NH`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |
| **portal_url** | portal `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates` · HRM `:28001` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual / Lane B SoT** | **DENIED** | QA 0 Nest `/rec` hits · Lane A only |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen W1–W3 sealed AC** | **DENIED** | RETAIN GWC |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave REC-06a GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-REC-00** (board #7) as **sa Option**? | **YES** (U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-06a** residual Manage/cancel/no_show/R-A after QA stamp **`REC06AQA2-MSKZ58NH`**.

Audited: QA-02 MD · machine JSON L0/network · BE-02 projection CLOSED · FE-01 Manage dialog · BA AC-REC-IV-03..06 · API F-REC-IV-02/03/04.

**U65 ACCEPT:** J-06 manage with `active_interview_id` · J-05 R-A PATCH same id (0 POST) · J-03 cancel→round2 · J-04 no_show→round2 · FE sau 2xx + F5 · Lane A `/recruitment/interviews*` only.

**Seal:** **`R-REC-IV-PROJ-ID` CLOSED** (BE-02 L1 LIVE + QA-02 browser Manage).

**RETAIN:** prior create/409/badge/soft-gate (J-01/02/07) from QA-01 GWC — not reopened.

**NOT Phase 1 DONE. NOT module REC UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-IV-03..06 browser + AC-REC-IV-03..06 | PRODUCT L2.5 | **ACCEPT** this seat |
| R-REC-IV-PROJ-ID nested+flat id · Manage enable | PRODUCT | **CLOSED** · seal |
| J-01/02/07 create/409/soft-gate | PRODUCT | **PASS_RETAIN** prior GWC |
| Lane A path · Nest `/rec` 0 hits | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| ERR-PAST mint `HRM-VAL-001` vs `HRM-REC-IV-400-PAST-DATETIME` when ACTIVE | PRODUCT **P3 OBS** | **ACCEPT** non-blocking · optional BE tidy |
| QA pack `verify:qc:evidence-pack` 1/8 miss `portal_url` | PROCESS | **OBS** — QC consolidates **8/8** below (portal URL explicit) |
| Stack ENV | ENV | L0 hrm/xbos/portal **200** (QC spot `qc:dev-stack`) |
| Honesty / seed / Lane B / W1–W3 | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-HRM-REC-IV-06 manage with projection id | QA UF · `manage-interview-id-missing` ABSENT | 🟢 |
| 2 | J-HRM-REC-IV-05 R-A PATCH same id | PATCH interviews/:id **200** `HRM-REC-204` · 0 POST · F5 | 🟢 |
| 3 | J-HRM-REC-IV-03 cancel → round 2 | status PATCH **200** · POST **201** new id · F5 badge | 🟢 |
| 4 | J-HRM-REC-IV-04 no_show → round 2 | status PATCH **200** TERMINAL · POST **201** · F5 | 🟢 |
| 5 | AC-REC-IV-03..06 | QA matrix 🟢 | 🟢 |
| 6 | O1 Lane A · Nest `/rec` DENY | only `/recruitment/interviews*` · 0 dual | 🟢 |
| 7 | R-REC-IV-PROJ-ID CLOSED | BE-02 LIVE + QA entry nested=flat UUID | 🟢 **CLOSED** |
| 8 | J-01/02/07 RETAIN | PASS_RETAIN · must_keep | 🟢 |
| 9 | Honesty / C-SLICE / no seed | QA + QC explicit | 🟢 **RETAIN false** |
| 10 | Evidence pack | QA PROCESS OBS · QC consolidates | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md` | exit **1** · **1/8** miss `portal_url` → **PROCESS OBS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:dev-stack` / L0 (cited) | hrm/xbos/portal **200** | ENV/L0 |
| QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| BE-02 jest (cited) | **5** suites · **47** PASS | PRODUCT |
| FE-01 vitest (cited) | **4** files · **27** PASS | PRODUCT |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-02` | overall **PASS_TO_PM** stamp `REC06AQA2-MSKZ58NH` | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **1/8** PROCESS OBS (`portal_url`) | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-REC-IV-03..06** 🟢 · **01/02/07** RETAIN |
| 6 | crud_or_matrix | ✅ AC-REC-IV-03..06 + Journey matrix |
| 7 | residual_section | ✅ below · PROJ-ID CLOSED · PAST OBS P3 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-IV-01** | **PASS_RETAIN** | create/badge prior GWC |
| **J-HRM-REC-IV-02** | **PASS_RETAIN** | 409 ACTIVE FE gate |
| **J-HRM-REC-IV-03** | **PASS** | cancel PATCH + round2 POST + F5 |
| **J-HRM-REC-IV-04** | **PASS** | no_show PATCH + round2 POST + F5 |
| **J-HRM-REC-IV-05** | **PASS** | R-A PATCH same id · no POST · F5 |
| **J-HRM-REC-IV-06** | **PASS** | manage with projection id |
| **J-HRM-REC-IV-07** | **PASS_RETAIN** | soft-gate ≠ 409 |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-IV-03 | **PASS** |
| J-HRM-REC-IV-04 | **PASS** |
| J-HRM-REC-IV-05 | **PASS** |
| J-HRM-REC-IV-06 | **PASS** |

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual · Lane B SoT · seed · reopen W1–W3.
2. **`R-REC-IV-PROJ-ID`:** **CLOSED** this seat (BE-02 + QA-02) — no reopen as P0.
3. **Condition P3 OBS `ERR-PAST`:** PAST mint may surface `HRM-VAL-001` vs `HRM-REC-IV-400-PAST-DATETIME` when ACTIVE present — **ACCEPT** non-blocking · optional BE tidy · **not** reopen J-03..06.
4. **RETAIN** prior IV create/409/badge/soft-gate GWC (J-01/02/07) · FE-01 Manage · API/BA Option A.
5. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-4 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-IV-PROJ-ID** | P0 was | **CLOSED** | — seal |
| **ERR-PAST OBS** | P3 | OPEN / idle-ok | optional **dev-be** mint tidy |
| Honesty / C-SLICE | — | RETAIN | **pm** — DENY flip |
| QA pack PROCESS | OBS | consolidated | — |

**No residual PRODUCT P0** from J-03..06 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / claim module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · Lane B as SoT  
- Seed / reopen W1–W3 sealed UF  
- Treat GWC as module GO  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #7 **UC-BP-REC-00** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qc-02.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-06a residual: J-03..06 PASS (cancel/no_show/R-A/manage-id) · R-REC-IV-PROJ-ID CLOSED · J-01/02/07 RETAIN · Lane A only · Nest `/rec` DENY · U65. Conditions: honesty false · PAST OBS P3 idle-ok. DENY module REC UAT / Phase1 / seed / W1–W3 reopen. Next continuous: **UC-BP-REC-00** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-00
depends_on: QC-02 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qc-02.md · stamp REC06AQC2-MSKZAM58 · Wave-4 UC-BP-REC-06a SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-06a (#6) = **UC-BP-REC-00** (#7 QUEUED) «Thư viện mô tả công việc (JD master) — MVP»

MISSION — SA Option seat (narrow):
1) Option A/B/C for JD master library vs AS-IS Nest recruitment job-templates / job_descriptions spine
2) F.1 API map + must_keep REC-01/02/08/06a seals · DENY Nest /rec dual · DENY invent second JD SoT
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · module REC UAT · seed · reopen sealed REC-06a J-03..06 without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```
