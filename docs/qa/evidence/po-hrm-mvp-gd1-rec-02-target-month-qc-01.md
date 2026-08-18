# Evidence — `PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **narrow GWC Condition close** · residual **R-REC-02-TARGET-MONTH-DATE** · **not** module REC UAT |
| **priority** | P2 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **parent_gwc** | [`po-hrm-mvp-gd1-rec-02-cluster-qc-01.md`](po-hrm-mvp-gd1-rec-02-cluster-qc-01.md) — Condition P2 **R-REC-02-TARGET-MONTH-DATE** |
| **depends_on** | TARGET-MONTH-QA-01 **PASS_TO_PM** stamp **`RECTMQA-MSKVOKQ9`** · BE-01 READY_FOR_QA |
| **condition_close** | **R-REC-02-TARGET-MONTH-DATE** ✅ **CLOSED ACCEPT** |
| **Verdict** | **GO WITH CONDITIONS** — Condition **CLOSED** · honesty `recruitment_uat_ready=false` RETAIN · **C-SLICE-≠-MODULE** · **DENY** module REC UAT / Phase1 / reopen sealed REC-01/02 UF |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-02-target-month-qa-01.md`](po-hrm-mvp-gd1-rec-02-target-month-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-02-target-month-be-01.md`](po-hrm-mvp-gd1-rec-02-target-month-be-01.md) |
| **machine** | [`_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.json`](_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.json) |
| **stamp_ref** | QC **`RECTMQC-MSKWQC01`** · QA **`RECTMQA-MSKVOKQ9`** · commit `dc930c5` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — Condition CLOSED ≠ module REC UAT / Phase1 DONE |

### Honesty locks (mandatory — RETAIN · DENIED flip)

| Flag / seal | Value | QC note |
|-------------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| REC-02 cluster QC-01 GWC (YCTD Wave-2 core) | **SEAL RETAIN** | **FORBIDDEN reopen** beyond this Condition stamp |
| REC-01 GWC seals (cell · spawn UQ · CELL-LOCKED · U19) | **RETAIN** | must_keep smoke 🟢 this seat |
| **SPAWN-DUP / CELL-QTY / MODE-UNCLASSIFIED / CELL-LOCKED** | **RETAIN PASS** | L1 must_keep 409 family |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **Seed / DB fake** | **DENIED** (U65) | machine `seed_used=false` |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | |

---

## Verdict summary

**GO WITH CONDITIONS** — close only parent QC-01 Condition **R-REC-02-TARGET-MONTH-DATE** after QA stamp **`RECTMQA-MSKVOKQ9`** (overall **PASS** · rebuilt `:28001` · `normalizeTargetMonthOrThrow` live · honesty false · U65 zero-seed).

Audited: QA-01 MD · raw JSON L1+must_keep · BE-01 jest 40 PASS · parent REC-02 cluster QC-01 GWC Conditions § · pack verify PROCESS OBS consolidated below.

**R-REC-02-TARGET-MONTH-DATE = CLOSED.** Live L1: `"2026-09"` → **201** stored **`2026-09-01`**; `"2026-09-01"` → **201**; garbage `"8"` / `not-a-date` → **400 `HRM-YCTD-VAL-400`** (not **500 `HRM-SYS-001`**); omit → **201** draft `target_month=null` RETAIN FE path.

**NOT Phase 1 DONE. NOT module REC UAT.** Continuous seat: **UC-BP-REC-08** SA/BA already in flight — do not reopen REC-02 core.

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Prior DATE cast **500** `HRM-SYS-001` on `YYYY-MM` / month int | PRODUCT P2 (CLOSED) | BE normalize + VAL-400 ACCEPT |
| L1 coerce / VAL-400 / omit draft | PRODUCT | 🟢 ACCEPT |
| must_keep SPAWN-DUP / CELL-QTY / MODE / CELL-LOCKED | PRODUCT regression | 🟢 RETAIN |
| QA pack `verify:qc:evidence-pack` **1/8** miss `journey_l25` | PROCESS | **OBS** — QC consolidates **8/8** below |
| Module J-* retest this residual | N/A deferred | Parent **J-HRM-REC-YCTD-02/02b** 🟢 RETAIN; residual = L1 probe (FE omits `target_month`) |
| ENV stack | ENV OBS | L0 hrm/portal **200** per QA |

---

## Audit — L1 target_month (mission §1)

| Case | Expected | QA+raw | QC |
|------|----------|--------|-----|
| `target_month="2026-09"` | **201** · stored **2026-09-01** · not 500 | id `8ebdb8d7-…` · `HRM-REC-201` · `target_month=2026-09-01` | 🟢 ACCEPT |
| `target_month="2026-09-01"` | **201** · same day | id `0cac6f5b-…` | 🟢 ACCEPT |
| garbage `"8"` | **400** `HRM-YCTD-VAL-400` · not SYS-500 | msg «phải là YYYY-MM hoặc YYYY-MM-01» | 🟢 ACCEPT |
| garbage `not-a-date` | **400** `HRM-YCTD-VAL-400` | no INSERT | 🟢 ACCEPT |
| omit field | **201** draft · `target_month=null` RETAIN | id `4dc4bb5c-…` | 🟢 ACCEPT |

---

## Audit — must_keep (mission §2)

| Token | Expected | QA+raw | QC |
|-------|----------|--------|-----|
| **SPAWN-DUP** | **409** `HRM-YCTD-SPAWN-DUP` | cell `0402ba25-…` | 🟢 RETAIN |
| **CELL-QTY** | **409** `HRM-YCTD-CELL-QTY` | headcount=999 · qty before spawn UQ | 🟢 RETAIN |
| **MODE-UNCLASSIFIED** | **409** `HRM-YCTD-MODE-UNCLASSIFIED` | id `4ab3d804-…` | 🟢 RETAIN |
| **HRM-HC-CELL-LOCKED** no-wipe | **409** + grid intact | `sameCell=true` · `gridIntact=true` · need 8→8 | 🟢 RETAIN |

---

## Condition stamp (mission §3) — parent GWC

| ID | Parent QC-01 prior | After this QC | State |
|----|--------------------|---------------|-------|
| **R-REC-02-TARGET-MONTH-DATE** | Condition P2 OPEN → dev-be parallel | L1+must_keep ACCEPT · stamp **`RECTMQC-MSKWQC01`** | ✅ **CLOSED** |

Parent file [`po-hrm-mvp-gd1-rec-02-cluster-qc-01.md`](po-hrm-mvp-gd1-rec-02-cluster-qc-01.md) Conditions § updated same session.

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-YCTD-02** | 🟢 **PASS RETAIN** | Parent cluster QA/QC — not reopened |
| **J-HRM-REC-YCTD-02b** | 🟢 **PASS RETAIN** | Parent cluster — BOD FE shallow remain AC row |
| This residual journey | **N/A** (L1 probe) | FE create omits `target_month` — browser UF not required to close DATE OBS |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

---

## Residual

| ID | State | Owner |
|----|-------|-------|
| **R-REC-02-TARGET-MONTH-DATE** | ✅ **CLOSED** | — |
| **R-REC-02-CELL-PICKER** | defer OPEN | **dev-fe** follow-up (not GWC blocker) |
| AC remain (parent table) | tracked OPEN | see § Remaining REC-02 AC |
| Honesty / C-SLICE | RETAIN | **pm** — DENY flip |

**No residual** PRODUCT P0/P1 from this Condition seat.

---

## Remaining REC-02 open AC rows (parent GWC — not reopened)

| AC / residual | Status | Suggested owner |
|---------------|--------|-----------------|
| **AC-REC-YCTD-02d** | 🟡 browser SHORT approve/inbox chain (U65) | **qa** (when sponsor FE BOD chain wave) / **dev-fe** if CTA missing |
| **AC-REC-YCTD-02b-05** | 🟡 FE BOD Duyệt→receivable + F5 shallow | **dev-fe** + **qa** |
| **AC-REC-YCTD-02-ALT-01** / **02b-ALT-01** | ⬜ Từ chối + lý do + F5 | **qa** after FE reject path |
| **AC-REC-YCTD-02-ALT-02** | ⬜ `hire_reason=replace` | **dev-fe** + **qa** |
| **AC-REC-YCTD-02-ALT-03** | ⬜ CFG BOD on in_plan | **ba-process** confirm CFG · then **qa** |
| **R-REC-02-CELL-PICKER** | defer | **dev-fe** |
| **AC-REC-YCTD-02f / 02b-06** · EX/VAL depth | 🟡/⬜ | backlog · **not** block REC-08 |

**Note:** REC-08 SA Option LOCKED → **ba-process** `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` already hinted in-flight — **do not** divert to reopen REC-02 ALT unless sponsor prioritizes.

---

## Commands / pack verify

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qa-01.md` | exit **1** · 1/8 miss `journey_l25` | PROCESS OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qc-01.md` | exit **0** expected after this file | QC SoT pack |
| QA runner `node scripts/qa/_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.mjs` | overall **PASS** stamp `RECTMQA-MSKVOKQ9` | PRODUCT ACCEPT |
| BE jest in-scope (BE-01 cite) | **40 PASS** / 5 suites | PRODUCT ACCEPT |
| Portal | `http://127.0.0.1:5173` **200** | ENV OBS OK |
| HRM | `http://127.0.0.1:28001` **200** · `dist_has_normalize=true` | ENV OBS OK |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ pnpm/node + PASS/exit |
| 4 | portal_url | ✅ `:5173` / `:28001` |
| 5 | journey_l25 | ✅ J-HRM-REC-YCTD-02/02b **PASS RETAIN** · residual N/A L1 |
| 6 | crud_or_matrix | ✅ L1 create cases + must_keep matrix |
| 7 | residual_section | ✅ CLOSED + AC remain |
| 8 | timestamp | ✅ 2026-08-09 |

---

## DENY (mission §4)

- Flip `recruitment_uat_ready` / claim module REC UAT / Phase1 DONE  
- Reopen sealed REC-01 UF / REC-02 cluster L1 P0 tokens beyond must_keep smoke  
- Seed / API inbox fake to force 02d/02b-05 browser  
- Treat Condition CLOSED as module GO  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qc-01.md` |
| **completion_report** | Narrow GWC: **R-REC-02-TARGET-MONTH-DATE CLOSED** against REC-02 QC-01. L1 YYYY-MM→2026-09-01 201 · YYYY-MM-01 201 · garbage 400 HRM-YCTD-VAL-400 ≠ SYS-500 · omit draft RETAIN. must_keep SPAWN-DUP/CELL-QTY/MODE-UNCLASSIFIED/CELL-LOCKED 409 PASS. Stamp `RECTMQC-MSKWQC01` · QA `RECTMQA-MSKVOKQ9`. Pack journey_l25 PROCESS OBS consolidated. Honesty false · C-SLICE. **NOT** module REC UAT. REC-08 SA/BA in flight; REC-02 AC remain 02d/02b-05/ALT/CELL-PICKER tracked. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: REC-08 SA-01 Option A LOCKED · PASS_TO_PM · TARGET-MONTH Condition CLOSED (RECTMQC-MSKWQC01)
entry_criteria: docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md · parent REC-02 QC-01 GWC · TARGET-MONTH QC-01 CLOSED
MISSION:
1) AC pack FR-UC-BP-REC-08 against Option A (dashboard «bao giờ đủ người» BE on-the-fly read-model)
2) CONFIRM O1–O10 · AC-REC-08-01..10 · VAL · ALT/EX as needed
3) DENY: dual SoT · Nest /rec greenfield · FE join job_postings for KH · seed · honesty flip · module REC UAT · reopen REC-01/02 seals · TARGET-MONTH CLOSED
exit: PASS_TO_PM · paper CONFIRMED · evidence docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md (+ docs/qa/evidence/…-ba-01.md if required)
NOTE: If BA-01 already DISPATCHED this session — do not duplicate; continue REC-08 pipeline (ba-data / API) per SA handoff.
OPTIONAL backlog (do NOT block REC-08): REC-02 AC-02d / 02b-05 FE BOD chain · ALT reject/replace · R-REC-02-CELL-PICKER → track on continuous board only.
```
