# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-04 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-6) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`REC04QA-MSL1HN1M`** · BE-01 LIVE (rebuild+restart seal) · FE-01 |
| **uc_ids** | `UC-BP-REC-04` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-04-cluster-qa-01.md`](po-hrm-mvp-gd1-rec-04-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-04-cluster-be-01.md`](po-hrm-mvp-gd1-rec-04-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-04-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-04-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md) O1–O8 · AC-REC-CV-04-* |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md) F-REC-CV-SCAN-01..03 · physical `/recruitment/*` |
| **sa_ref** | [`PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-04-cluster-qa-01.json` · overall **PASS** · stamp **`REC04QA-MSL1HN1M`** |
| **stamp** | QC **`REC04QC1-MSL1LU4H`** · QA **`REC04QA-MSL1HN1M`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| **portal_url** | portal `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions` · HRM `:28001` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE / FR-04 module DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual SoT** | **DENIED** | QA `nest_rec_hits=[]` · L1 `/rec/candidates-pool` 404 |
| **Campaign / REC-03 invent** | **DENIED** | UI «không Campaign» · `campaign_invent.present=false` |
| **Second CV SoT / scan-event sole SoT** | **DENIED** | Option A flags-on-JSON RETAIN |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen REC-03 / sealed W1–W5 AC** | **DENIED** | must_keep UV-YCTD/W2 peers |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-6 Quét kho GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim FR-04 / module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM reopen REC-03 Campaign? | **NO** |
| May PM open next UC seat **UC-BP-REC-05** (board #9) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-04** (Quét kho CV nội bộ trước kênh ngoài) after QA stamp **`REC04QA-MSL1HN1M`**.

Audited: QA-01 MD · machine JSON L0/L1/network/journeys · BE-01 LIVE · FE-01 · BA O1–O8 · API F-REC-CV-SCAN · SA Option A.

**U65 ACCEPT:** YCTD Chi tiết → **Mở quét kho** → chức danh+skill/exp → pool GET `for=internal_scan` · 0-hits **Hoàn tất** → F5 `internal_scan_done` · skip empty block + reason → F5 skipped · `posted` gated SCAN-REQUIRED then PATCH after done · Network physical `/recruitment/` only.

**EX codes ACCEPT:** `HRM-REC-CV-SCAN-REQUIRED` · `HRM-REC-CV-SCAN-SKIP-REASON` · Nest `/rec` 404.

**must_keep RETAIN:** UV-YCTD attach contracts · Wave-2 YCTD pipeline_flags family · posted/has_cv peers (cite, not redefine).

**NOT Phase 1 DONE. NOT module REC UAT. NOT FR-04 module DONE. NOT `recruitment_uat_ready=true`.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-CV-04-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| L1 SCAN-REQUIRED + SKIP-REASON + pool `for=internal_scan` | PRODUCT | **ACCEPT** |
| Nest `/rec` dual · 0 browser hits · L1 404 | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| Campaign / REC-03 invent absent | PRODUCT / GOVERNANCE | **ACCEPT** · DENY |
| R-REC-04-STALE-DIST (QA rebuild before UF) | PROCESS | **OBS** — devops/PM process · not product P0 |
| Actor 403 FORBIDDEN persona-negative | PRODUCT **P2 OBS** | **ACCEPT** defer · ceo@ mutate PASS |
| Stack ENV | ENV | L0 hrm/xbos/portal **200** (QC spot; node UV assert Windows OBS) |
| Honesty / seed / module UAT / REC-03 | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Browser Quét kho U65 | J-01 pool GET 200 `HRM-REC-CP-200` · screens 01–03 | 🟢 |
| 2 | Complete / skip + F5 flags | J-02 `internal_scan_done` · J-03 skipped+reason | 🟢 |
| 3 | Posted gate + EX | L1 `HRM-REC-CV-SCAN-REQUIRED` · J-04 before block + after PATCH 200 | 🟢 |
| 4 | SKIP-REASON EX | L1 + J-03 empty FE block · `HRM-REC-CV-SCAN-SKIP-REASON` | 🟢 |
| 5 | Network `/recruitment/` only | machine paths · `nest_rec_hits=[]` | 🟢 |
| 6 | DENY Campaign / Nest dual / seed / honesty | QA honesty footer + QC locks | 🟢 **RETAIN** |
| 7 | must_keep UV-YCTD / W2 | 0-hits no attach OK · flags-on-JSON · peers cite | 🟢 **RETAIN** |
| 8 | C-SLICE ≠ module REC UAT | honesty · promote table | 🟢 |
| 9 | Evidence pack | QA verify **8/8** · QC consolidates below | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qa-01.md` | exit **0** · **PASS 8/8** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (node UV exit assert on Windows — health checks PASS · same OBS as REC-00 QC) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:dev-stack` / L0 (cited) | hrm/xbos/portal **200** | ENV/L0 |
| QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 nest-rec / scan / posted / skip | Nest 404 · route LIVE · SCAN-REQUIRED · SKIP-REASON | PRODUCT |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-04-cluster-qa-01` | overall **PASS** stamp `REC04QA-MSL1HN1M` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · tab=requisitions |
| 5 | journey_l25 | ✅ **J-HRM-REC-CV-04-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-CV-04 · EX SCAN-* · pool/internal-scan/pipeline-flags |
| 7 | residual_section | ✅ below · STALE-DIST OBS · 403 P2 OBS |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-CV-04-01** | **PASS** | Quét kho → pool title+skill/exp · physical `/recruitment/candidates-pool` |
| **J-HRM-REC-CV-04-02** | **PASS** | 0-hits Hoàn tất → F5 `internal_scan_done` · UV-YCTD must_keep (attach N≥1 path cite) |
| **J-HRM-REC-CV-04-03** | **PASS** | Skip empty block + reason → F5 skipped · SKIP-REASON L1 |
| **J-HRM-REC-CV-04-04** | **PASS** | posted before → gate · after done → PATCH posted · DENY Campaign |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |
| UV-YCTD / W2 peers | **PASS_RETAIN** | not re-litigated |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-CV-04-01 | **PASS** |
| J-HRM-REC-CV-04-02 | **PASS** |
| J-HRM-REC-CV-04-03 | **PASS** |
| J-HRM-REC-CV-04-04 | **PASS** |

Journey map already stamped slice PASS (`PROGRAM_JOURNEY_MAP.md` · `REC04QA-MSL1HN1M`) — QC **ACCEPT** · no honesty flip.

### Screens (8)

`docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-04-cluster-qa-01/` — 01 requisitions · 02 detail-before-scan · 03 scan-results · 04 detail-after-complete-f5 · 05 posted-after-scan-f5 · 06 posted-before-scan-blocked · 07 skip-f5 · 08 final.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** module REC UAT · Phase1 · FR-04 module DONE · `SERVICE_READINESS` · Nest `/rec` dual · Campaign/REC-03 · seed · reopen sealed W1–W5.
2. **must_keep:** UV-YCTD attach contracts · Wave-2 YCTD `pipeline_flags` posted/has_cv family · Option A flags-on-JSON (no second CV SoT).
3. **R-REC-04-STALE-DIST:** PROCESS OBS — BE READY_FOR_QA may lag live `dist`; QA/DevOps must rebuild+restart before UF (pattern REC-00/08). **Not** product reopen.
4. **P2 OBS:** actor thiếu quyền → 403 FORBIDDEN EX — defer persona-negative (ceo@ mutate PASS).
5. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-6 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-04-STALE-DIST** | PROCESS | OPEN / idle-ok | **devops** / **pm** process — seal rebuild before UF |
| Actor 403 persona-negative | P2 OBS | OPEN / idle-ok | optional **qa** later |
| Honesty / C-SLICE | — | RETAIN | **pm** — DENY flip |
| Product P0 this seat | — | **none** | — |

**No residual PRODUCT P0** from J-HRM-REC-CV-04-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim FR-04 module DONE / module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · Campaign / REC-03 invent · second CV SoT  
- Seed / reopen sealed REC-00..03 / W1–W5 UF without regression  
- Treat GWC as module GO  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #9 **UC-BP-REC-05** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-04: J-HRM-REC-CV-04-01..04 PASS (Quét kho + complete/skip F5 + posted gate + SCAN-* EX) · Network physical `/recruitment/` only · Nest `/rec` DENY · Campaign DENY · U65. Conditions: honesty false · STALE-DIST PROCESS OBS · 403 P2 OBS. DENY module REC UAT / FR-04 DONE / seed / REC-03 reopen. Next continuous: **UC-BP-REC-05** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-05
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qc-01.md · stamp REC04QC1-MSL1LU4H · Wave-6 UC-BP-REC-04 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-04 (#8) = **UC-BP-REC-05** (#9 QUEUED) «Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-05 · peer FR-UC-BP-REC-05a RETAIN

MISSION — SA Option seat (narrow):
1) Option A/B/C for candidate↔YCTD stage history / pipeline timeline vs AS-IS applications + stage catalog spine
2) F.1 API map + must_keep REC-04 Quét kho · UV-YCTD/05a · REC-02 W2 · REC-06a seals · DENY Nest /rec dual · DENY Campaign/REC-03 · DENY second pipeline SoT
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module REC UAT · seed · reopen sealed REC-04 J-HRM-REC-CV-04-01..04 without regression · reopen REC-03
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```
