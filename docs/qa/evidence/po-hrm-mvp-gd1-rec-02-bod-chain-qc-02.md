# Evidence — PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **narrow GWC remain seal** · **UC-BP-REC-02 / 02b** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **parent_gwc** | [`po-hrm-mvp-gd1-rec-02-cluster-qc-01.md`](po-hrm-mvp-gd1-rec-02-cluster-qc-01.md) — remain AC table |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`REC02BODQA2-MSKX3U8H`** · BE-ALT01-01 READY · prior FAIL QA-01 ALT-01 **500** |
| **condition_close** | **R-REC-02-ALT-01** ✅ **CLOSED ACCEPT** |
| **Verdict** | **GO WITH CONDITIONS** — remain rows sealed · honesty false · **C-SLICE-≠-MODULE** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md`](po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md) |
| **qa_prior** | [`po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md`](po-hrm-mvp-gd1-rec-02-bod-chain-qa-01.md) stamp `REC02BODQA-MSKWIO4O` |
| **be_ref** | [`po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md`](po-hrm-mvp-gd1-rec-02-bod-chain-be-alt01-01.md) |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.json` · overall **PASS** |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02/` (**9**) |
| **stamp** | QC **`REC02BODQC2-MSKXQC02`** · QA **`REC02BODQA2-MSKX3U8H`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no seed inbox |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |
| **co-seal** | [`po-hrm-mvp-gd1-rec-08-cluster-qc-01.md`](po-hrm-mvp-gd1-rec-08-cluster-qc-01.md) same session |

---

## Honesty locks (mandatory — RETAIN · DENIED flip)

| Flag / seal | Value | QC note |
|-------------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| REC-02 cluster QC-01 GWC (YCTD Wave-2 core) | **SEAL RETAIN** | **FORBIDDEN reopen** beyond remain stamps |
| REC-01 GWC seals | **RETAIN** | must_keep |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **Seed / DB fake / API inbox seed** | **DENIED** (U65) | |
| **Nest `/rec` dual** | **DENIED** | GET **404** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | |

---

## Verdict summary

**GO WITH CONDITIONS** — seal parent remain rows after QA-02 stamp **`REC02BODQA2-MSKX3U8H`** (overall **PASS** · reject_bind_fix=true · STALE_DIST=false · honesty false).

**R-REC-02-ALT-01 = CLOSED.** U65: Từ chối + lý do → POST transitions **201** (was **500** `HRM-SYS-001`) · `yctd-detail-rejected-reason` after 2xx · **F5** persists.

**Also sealed this seat / RETAIN QA-01:** AC-02d SHORT→open_for_hire · AC-02b-05 LONG TP/HR→CV block→BOD→open_for_hire · ALT-02 replace · CELL-PICKER.

**Deferred with owner:** ALT-03 CFG BOD on in_plan · XBOS multi-actor inbox persona (not exercised U65 ceo-only).

**NOT Phase 1 DONE. NOT module REC UAT.** Continuous next: **UC-BP-REC-06a** SA (after REC-08 co-seal).

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Prior reject **500** unused `$2` | PRODUCT P0 (CLOSED) | BE contiguous binds + QA-02 U65 ACCEPT |
| ALT-01 reject 201 + reason FE + F5 | PRODUCT | 🟢 **CLOSED** |
| AC-02d / AC-02b-05 smoke QA-02 | PRODUCT | 🟢 **SEAL** |
| ALT-02 / CELL-PICKER | PRODUCT | 🟢 **SEAL RETAIN** QA-01 |
| ALT-03 CFG BOD · multi-actor inbox | PRODUCT depth / ENV persona | **DEFER** + owner (not GWC blocker) |
| Orthogonal `nest build` TS2724 dashboard | PRODUCT P1 (shared) | Carry on REC-08 QC Condition · **does not** reopen ALT-01 (content-seal dist OK) |
| QA pack verify miss command_table / journey_l25 / crud | PROCESS | **OBS** — QC consolidates **8/8** |
| Honesty / Nest dual / seed | GOVERNANCE | **LOCKED DENY** |

---

## Audit — R-REC-02-ALT-01 CLOSED (mission B.1)

| Step | Expected | QA-02 | QC |
|------|----------|-------|-----|
| Create/submit path | pending before reject | Thêm Ngoài ĐB · Lưu · Gửi | 🟢 |
| Từ chối + lý do | POST transitions **201** | id `5a960a6e-…` · company_id=holding · stamp in reason | 🟢 ACCEPT |
| FE after 2xx | `yctd-detail-rejected-reason` visible | YES | 🟢 |
| F5 | reason persists | YES | 🟢 |
| vs QA-01 FAIL | was **500** `HRM-SYS-001` | CLOSED | 🟢 |
| Residual ID | **R-REC-02-ALT-01** | **CLOSED** | ✅ |

---

## Audit — remain rows seal (mission B.2)

| AC / residual | Prior parent QC-01 | After BOD-CHAIN | QC seal |
|---------------|--------------------|-----------------|---------|
| **AC-REC-YCTD-02d** | 🟡 browser SHORT approve shallow | QA-01 🟢 + QA-02 must_keep smoke 🟢 | ✅ **SEALED** |
| **AC-REC-YCTD-02b-05** | 🟡 FE BOD shallow | QA-01 🟢 + QA-02 LONG→BOD smoke 🟢 | ✅ **SEALED** |
| **AC-REC-YCTD-02-ALT-01** | ⬜ | QA-02 🟢 CLOSED residual | ✅ **CLOSED** |
| **AC-REC-YCTD-02-ALT-02** | ⬜ | QA-01 🟢 RETAIN | ✅ **SEALED RETAIN** |
| **R-REC-02-CELL-PICKER** | defer | QA-01 🟢 closes picker · QA-02 RETAIN | ✅ **SEALED RETAIN** |
| **AC-REC-YCTD-02-ALT-03** | ⬜ CFG BOD in_plan | not exercised | ⬜ **DEFER** · owner **ba-process** (CFG confirm) → **qa** |
| **AC-REC-YCTD-02b-ALT-01** | ⬜ BOD Từ chối | not this seat (ceo reject path sealed ALT-01) | ⬜ **DEFER** · owner **qa** (+ XBOS multi-actor if needed) |
| **XBOS multi-actor inbox persona** | — | ceo@xe.vn only U65 | ⬜ **DEFER** · owner **qa** (+ **devops**/persona pack) — not blocker |

### TRANSITIONS-NO-500

| Check | QA-02 | QC |
|-------|-------|-----|
| POST transitions session | 4 | — |
| 2xx | **4** | 🟢 |
| 5xx | **0** | 🟢 |

---

## Condition stamp — parent GWC remain

| ID | Prior | After this QC | State |
|----|-------|---------------|-------|
| **R-REC-02-ALT-01** | OPEN / FAIL 500 | U65 reject 201 + FE + F5 · stamp **`REC02BODQC2-MSKXQC02`** | ✅ **CLOSED** |
| AC-02d / 02b-05 / ALT-02 / CELL-PICKER | remain / defer | sealed this seat | ✅ **SEALED** |
| ALT-03 · multi-actor inbox | open | tracked DEFER | ⬜ owner listed |

Parent [`po-hrm-mvp-gd1-rec-02-cluster-qc-01.md`](po-hrm-mvp-gd1-rec-02-cluster-qc-01.md) remain table: ALT-01 / 02d / 02b-05 / ALT-02 / CELL-PICKER treated **CLOSED/SEALED** by this co-seal (PM may stamp parent Conditions § on intake).

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-YCTD-02** | 🟢 **PASS RETAIN** | Parent cluster + SHORT smoke |
| **J-HRM-REC-YCTD-02b** | 🟢 **PASS** deepen | BOD FE chain smoke this seat · was OBS shallow |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

---

## Shared Condition carry (orthogonal — do not reopen ALT-01)

| ID | Note |
|----|------|
| **R-REC-08-NEST-BUILD-TS2724** (P1) | Same session REC-08 QC Condition · QA content-sealed dist for ALT-01 + dashboard · **BUILD-FIX-BE-01** DISPATCHED |
| Scope token alias P3 | Carry on REC-08 seat only |

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-02-ALT-01** | P0 | ✅ **CLOSED** | — |
| **AC-02d / 02b-05 / ALT-02 / CELL-PICKER** | — | ✅ **SEALED** | — |
| **AC-REC-YCTD-02-ALT-03** CFG BOD in_plan | P2 | ⬜ DEFER | **ba-process** → **qa** |
| **AC-REC-YCTD-02b-ALT-01** BOD Từ chối | P2 | ⬜ DEFER | **qa** |
| **XBOS multi-actor inbox persona** | P2 | ⬜ DEFER | **qa** (+ persona pack) |
| Honesty / C-SLICE | — | RETAIN false | **pm** — DENY flip |

No residual PRODUCT P0/P1 open from this seat (ALT-01 CLOSED).

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-YCTD-02 | **PASS** |
| J-HRM-REC-YCTD-02b | **PASS** |

---

## Commands / pack verify

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md` | exit **1** · **3/8** miss command_table / journey_l25 / crud_or_matrix | PROCESS OBS |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.mjs` | overall **PASS** stamp `REC02BODQA2-MSKX3U8H` | PRODUCT ACCEPT |
| L0 reject_bind_fix / stale_dist | **true** / **false** | PRODUCT/ENV |
| Screens QA-02 | **9** files | PRODUCT |
| Nest `/rec` | **404** | PRODUCT DENY dual |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` / `:28001` |
| 5 | journey_l25 | ✅ J-HRM-REC-YCTD-02/02b **PASS** |
| 6 | crud_or_matrix | ✅ ALT-01 + remain AC seal table |
| 7 | residual_section | ✅ CLOSED + DEFER owners |
| 8 | timestamp | ✅ 2026-08-09 |

---

## DENY

- Flip `recruitment_uat_ready` / claim module REC UAT / Phase1 DONE  
- Reopen sealed REC-01 / REC-02 core L1 P0 tokens  
- Seed / API inbox fake to force multi-actor  
- Treat remain seal as module GO  
- Nest `/rec` dual  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (`UC-BP-REC-06a` Option — after REC-08) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qc-02.md` |
| **completion_report** | Narrow GWC: **R-REC-02-ALT-01 CLOSED** (reject 201 + reason FE+F5). SEAL AC-02d · AC-02b-05 · ALT-02 · CELL-PICKER. DEFER ALT-03 CFG BOD (**ba-process**) + XBOS multi-actor inbox persona (**qa**). Transitions 4/4 2xx. Honesty false · C-SLICE. Carry P1 nest-build content-seal note. Co-seal REC-08 QC-01 same session. **NOT** module REC UAT. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06a
depends_on: REC-08-CLUSTER-QC-01 GWC · REC-02-BOD-CHAIN-QC-02 GWC (ALT-01 CLOSED)
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md #6 after REC-08
MISSION: SA Option A/B/C for UC-BP-REC-06a (one active interview schedule / candidate×requisition) · F.1 map · must_keep REC seals · DENY Nest /rec dual · unlock BA AC next
cấm: honesty flip · module REC UAT · seed · reopen sealed ALT-01/REC-08 without regression
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md · PASS_TO_PM
```
