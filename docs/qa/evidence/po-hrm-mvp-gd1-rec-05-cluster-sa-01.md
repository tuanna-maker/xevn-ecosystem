# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7) |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | QC-01 GWC Wave-6 REC-04 **SEALED** · stamp **`REC04QC1-MSL1LU4H`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **SPEC_LEN** | **24660** NFD |
| **EVID_LEN** | **4860** NFD (pre-stamp; this row may grow) |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| Option A/B/C + trade-off | **PASS** — A LOCKED · B/C REJECT |
| F.1 map physical prefer | **PASS** — F-REC-APP-02 residual + timeline · CAT/UV/CMP/IV/SCAN RETAIN |
| must_keep REC-04 / UV-YCTD / W2 / 06a | **PASS** — §6.2–6.3 |
| DENY Nest `/rec` dual · Campaign/REC-03 · second SoT | **PASS** |
| Unlock BA AC · cấm code until CONFIRMED | **PASS** — next `ba-process` |
| No honesty flip · no seed · no reopen REC-04 J-* | **PASS** |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-05 · BR-BP-CV-02 · peer 05a | Purpose / Diễn biến / catalog≠consumer |
| `DB_DESIGN` §2.4a / §2.5 / §2.6 | Catalog · application · history append-only |
| `API_DESIGN` F-REC-APP-02 · F-REC-CAT-* · UV-YCTD · IV soft-gate | Paper path + physical prefer |
| `PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01` + QC `REC04QC1-MSL1LU4H` | must_keep scan/posted · continuous unlock |
| Nest `rec-pipeline-stage.service.ts` | LIVE catalog ensureSchema |
| Nest `recruitment.service.ts` Lane A `recruitment_candidates.status` CHK six | Closed-ceiling gap |
| Nest `recruitment-catalog.service.ts` `candidate_applications` + PATCH stage | Overwrite-only · `job_posting_id` leftover ≠ YCTD SoT |
| Grep `candidate_stage_history` in `apps/api/hrm-api` | **ABSENT** history table |
| `UC_BR_MATRIX_DEPTH` UC-BP-REC-05 · BR-BP-CV-02 | Timeline not overwrite-only |

---

## 3. Decision summary

| | |
|--|--|
| **Selected** | **Option A — ACCEPT_AS_IS_UPGRADE** |
| **SoT** | ONE `rec_pipeline_stage` · YCTD-bound current stage · ONE append-only history |
| **Path** | Physical `/api/hrm/recruitment/*` · paper `/rec/*` alias only |
| **OUT** | REC-03 · Nest dual · second catalog/history · pool stage as FR-05 SoT |
| **ba-data** | **REQUIRED** (history table + optional CHK migrate) |
| **Unlock** | BA AC O1–O9 |

---

## 4. O1–O9 (BA lock targets)

1. Physical Network `/recruitment` only  
2. ADD one history table (not overwrite-only DONE)  
3. Stage home = YCTD-bound Lane A ↔ N–N (DENY posting apps)  
4. Open catalog when EFF>0 (no six ceiling SoT)  
5. Reject reason required  
6. Reverse transition CFG + always append  
7. Peers RETAIN 05a / REC-04 / 06a / CAT / CMP  
8. Honesty false · C-SLICE  
9. Kanban optional P2 vs list+timeline MVP  

---

## 5. Cấm verified

| Cấm | Status |
|-----|--------|
| honesty flip / `recruitment_uat_ready` | **HOLD false** |
| module REC UAT claim | **DENY** |
| seed | **DENY** |
| reopen REC-04 J-* | **DENY** |
| reopen REC-03 | **DENY** |
| `apps/**` code this seat | **NONE** |

---

## completion_report

- **Closed:** SA Option A CONFIRMED for UC-BP-REC-05 (pipeline stage history vs AS-IS applications+catalog); F.1 disposition; must_keep/DENY locks; BA unlocked.
- **Residual:** BA-01 AC O1–O9 → ba-data history → SA API F.1 → Dev (after contracts). No Dev this seat.
- **next_owner:** **ba-process**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-SA-01.md · stamp peer REC04QC1-MSL1LU4H
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md #9 UC-BP-REC-05
spec_ref: SRS FR-UC-BP-REC-05 · BR-BP-CV-02 · peer 05a RETAIN · SA O1–O9
MISSION: BA AC pack Option A — physical /recruitment transition+timeline; ADD append-only history (ba-data REQUIRED); stage home YCTD-bound (DENY job_posting apps); EFF picker; reject reason; RETAIN REC-04/UV-YCTD/06a/CAT; DENY Nest /rec dual · REC-03 · second SoT · honesty flip · seed · reopen REC-04 J-*; J-* DRAFT; cấm code
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-ba-01.md · PASS_TO_PM · next ba-data (history) hoặc sa API nếu BA khóa flags-only (expect ba-data)
```
