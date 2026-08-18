# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-02 + UC-BP-REC-02b C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`REC02QA-MSKV6ETH`** · BE-01 READY (jest **108**) · FE-01 READY (vitest **72**) |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-02-cluster-qa-01.md`](po-hrm-mvp-gd1-rec-02-cluster-qa-01.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-02-cluster-be-01.md`](po-hrm-mvp-gd1-rec-02-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-02-cluster-fe-01.md`](po-hrm-mvp-gd1-rec-02-cluster-fe-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md) O1–O5 · AC-REC-YCTD-02* / 02b* · VAL-01..18 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md) F-REC-YCTD-01..04 |
| **data_ref** | [`PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-DATA-01.md) |
| **prior_gwc** | [`po-hrm-mvp-gd1-rec-01-cluster-qc-02.md`](po-hrm-mvp-gd1-rec-01-cluster-qc-02.md) · CELLID-QC-01 CLOSED RETAIN |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-02-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-cluster-qa-01/` (01–10) |
| **stamp** | `REC02QA-MSKV6ETH` |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual / greenfield** | **DENIED** | invent GET **404** `HRM-DATA-404` |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-2 YCTD GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-REC-08** (board #5)? | **YES** (U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-02 + UC-BP-REC-02b** after QA stamp **`REC02QA-MSKV6ETH`**.

Audited: QA-01 MD · raw JSON L1+journeys · screens 01–10 (FE toast/list/F5/O4/O5) · BE-01 jest 108 · FE-01 vitest 72 · BA AC/VAL · API F-REC-YCTD · prior REC-01 GWC must_keep.

**L1 tokens ACCEPT:** create → **`draft` ≠ open** · **400** `HRM-YCTD-OUT-REASON` · **409** `HRM-YCTD-CELL-QTY` · submit **`pending_approval`** + matrix **`hrm_requisition_short`** / **`hrm_requisition_long_bod`** · transitions → **`open_for_hire`** · flags **409** `HRM-YCTD-BOD-REQUIRED` / **200** OK · **409** `HRM-YCTD-MODE-UNCLASSIFIED` · SPAWN-DUP **409** · Nest `/rec` **404** · U19 list↔get.

**U65 ACCEPT:** J-HRM-REC-YCTD-02 / 02b genuine FE-after-2xx + F5 (screens + `feAfterSave`/`f5HasTitle`/`f5Out`/`f5Reason`) — **not** API-only. O4 classify banner LIVE. O5 proposals redirect-only **`dualPersistPosts=0`**.

**must_keep PASS:** UF-HRM-12 · JD soft FK · REC-01 Định biên + SPAWN-DUP · XBOS submit-workflow.

**NOT Phase 1 DONE. NOT module REC UAT.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Core YCTD Wave-2 L1 + U65 create/submit/F5 | PRODUCT | **ACCEPT** this seat |
| `R-REC-02-TARGET-MONTH-DATE` (YYYY-MM / month int → 500 DATE cast; FE omits) | PRODUCT P2 | ✅ **CLOSED** — QC `RECTMQC-MSKWQC01` · [`target-month-qc-01.md`](po-hrm-mvp-gd1-rec-02-target-month-qc-01.md) |
| `R-REC-02-CELL-PICKER` (in_plan cell text vs picker) | OBS / defer | FE follow-up · **not** GWC blocker |
| Browser approve CTA / BOD FE chain shallow (L1 transitions proved) | PRODUCT depth | **AC remain** · do not reopen core seal |
| JSON `journeys.02b.createOut/submitOut` reuse in_plan hit timestamps | PROCESS OBS | Screens 05/07 + L1 OUT prove path; note for QA runner hygiene |
| Stack ENV | — | L0 PASS (rebuild STALE_DIST=NO) |
| Honesty / Nest dual / seed | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | draft ≠ open on create | L1 CREATE_OUT / CREATE_IN RETEST `status=draft` · screen 02 toast «Đã lưu nháp» | 🟢 |
| 2 | OUT-REASON 400 | L1 `HRM-YCTD-OUT-REASON` | 🟢 |
| 3 | CELL-QTY 409 | L1 `HRM-YCTD-CELL-QTY` headcount=999 | 🟢 |
| 4 | submit SHORT/LONG | L1 `hrm_requisition_short` · `hrm_requisition_long_bod` · `HRM-REC-WF-200` | 🟢 |
| 5 | transitions → open_for_hire | L1 TRANSITION after=`open_for_hire` + BOD path | 🟢 |
| 6 | flags BOD gate + OK | L1 BOD-REQUIRED 409 · FLAGS_OK 200 · no Campaign | 🟢 |
| 7 | O4 MODE-UNCLASSIFIED | L1 409 · banner screens 02/05 · unclassified chips screen 08 | 🟢 |
| 8 | O5 dualPersist=0 | JSON `dualPost:[]` · screen 09 deprecate CTA | 🟢 |
| 9 | SPAWN-DUP + Nest /rec 404 | L1 409 SPAWN-DUP · GET `/rec/...` 404 | 🟢 |
| 10 | U19 scope_parity | L1 list/get 200 inList | 🟢 |
| 11 | U65 J-HRM-REC-YCTD-02 FE+F5 | journeys `feAfterSave`/`f5HasTitle` · screens 02–04 · stamp title | 🟢 |
| 12 | U65 J-HRM-REC-YCTD-02b FE+F5 | `longHint`/`flagsBlockedUi`/`f5Out`/`f5Reason` · screens 05–07 | 🟢 |
| 13 | must_keep UF-12 / JD / REC-01 | MUSTKEEP ac · screen 10 · SPAWN-DUP | 🟢 |
| 14 | Honesty / C-SLICE / no seed | QA + QC explicit | 🟢 **RETAIN false** |
| 15 | Evidence pack | `verify:qc:evidence-pack` on QA MD | 🟢 **8/8 PASS** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md` | 🟢 exit **0** · **8/8** |
| work_item + L0/L1 + J-* + residual + honesty | 🟢 (QA pack) |
| QC command_table | 🟢 below |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:dev-stack` / L0 (cited) | hrm/xbos/portal **200** · STALE_DIST=NO | ENV/L0 |
| BE-01 jest cluster (cited) | **108** PASS | PRODUCT |
| FE-01 vitest (cited) | **72** PASS | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **8/8 PASS** | PROCESS |
| QC spot screens 02/05/08/09 | FE toast · OUT draft · O4 · O5 redirect | PRODUCT |

---

## BA AC coverage — REC-02 / 02b

### Closed / ACCEPT this wave (QA + L1 + screens)

| AC / O / VAL | Status |
|--------------|--------|
| **O1–O5** (physical SoT · O2 reject · O3 receivable · O4 classify · O5 no dual) | 🟢 |
| **AC-REC-YCTD-02 / 02b / 02c** create in_plan · Lưu draft · Gửi → pending (no receivable chip) | 🟢 U65 |
| **AC-REC-YCTD-02b-01..04** out form + reason · Lưu · Gửi LONG · flags/CV block pre-BOD | 🟢 U65 + L1 |
| **AC-REC-YCTD-02e** (pipeline flags on receivable — L1) | 🟢 API |
| **AC-REC-YCTD-02-ALT-04** SPAWN-DUP | 🟢 L1 |
| **AC-REC-YCTD-02-ALT-05** JD soft FK RETAIN | 🟢 |
| **AC-REC-YCTD-02b-ALT-03** O5 redirect | 🟢 |
| **AC-REC-YCTD-02b-ALT-04** O4 legacy | 🟢 |
| **AC-REC-YCTD-02-EX-03** CELL-QTY | 🟢 L1 |
| **AC-REC-YCTD-02b-EX-01** OUT-REASON | 🟢 L1 |
| **AC-REC-YCTD-02-EX-08 / VAL-16** U19 | 🟢 L1 |
| **AC-REC-YCTD-02b-EX-08** Nest `/rec` dual deny | 🟢 |
| **VAL-01..05,08..15,18** (core gates evidenced) | 🟢 / partial depth |
| must_keep **UF-HRM-12** · **J-HRM-JD-YCTD-01** · REC-01 spawn/cell | 🟢 |

### Remain open (do **not** block next UC seat; do **not** claim full BA pack 100%)

| AC row | Status | Owner / note |
|--------|--------|--------------|
| **AC-REC-YCTD-02d** | 🟡 | L1 transitions→`open_for_hire` · **browser** full SHORT approve/inbox chain not forced (U65 no seed) |
| **AC-REC-YCTD-02b-05** | 🟡 | L1 BOD+transition · **FE** BOD Duyệt→receivable + F5 shallow (approve CTA OBS) |
| **AC-REC-YCTD-02f / 02b-06** | 🟡 | list→detail cross-nav depth partial |
| **AC-REC-YCTD-02-ALT-01** | ⬜ | Từ chối + lý do + F5 |
| **AC-REC-YCTD-02-ALT-02** | ⬜ | `hire_reason=replace` path |
| **AC-REC-YCTD-02-ALT-03** | ⬜ | CFG BOD on in_plan |
| **AC-REC-YCTD-02b-ALT-01** | ⬜ | BOD Từ chối + F5 |
| **AC-REC-YCTD-02b-ALT-02** | 🟡 | O2→user switch out — L1 O2 only |
| **AC-REC-YCTD-02-EX-01/02/04/05/06/07** · **02b-EX-02..07** | 🟡/⬜ | VAL depth beyond OUT-REASON / CELL-QTY / BOD |
| **VAL-06/07/17** | ⬜ | replace id · JD required · reject reason FE |
| **R-REC-02-CELL-PICKER** | defer | FE deepen cell picker |
| **R-REC-02-TARGET-MONTH-DATE** | ✅ **CLOSED** | QC stamp **`RECTMQC-MSKWQC01`** · evidence [`po-hrm-mvp-gd1-rec-02-target-month-qc-01.md`](po-hrm-mvp-gd1-rec-02-target-month-qc-01.md) · QA `RECTMQA-MSKVOKQ9` |

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual.
2. **Condition P2 `R-REC-02-TARGET-MONTH-DATE`:** ✅ **CLOSED** (2026-08-09) — L1 `"2026-09"`→`2026-09-01` **201** · garbage **400 `HRM-YCTD-VAL-400`** (not 500 SYS) · omit draft RETAIN · must_keep SPAWN-DUP/CELL-QTY/MODE/CELL-LOCKED PASS. QC stamp **`RECTMQC-MSKWQC01`** · [`po-hrm-mvp-gd1-rec-02-target-month-qc-01.md`](po-hrm-mvp-gd1-rec-02-target-month-qc-01.md).
3. **AC remain rows** (table above): tracked · **not** required to reopen this seat before **UC-BP-REC-08**.
4. **OBS:** `R-REC-02-CELL-PICKER` · browser BOD/approve CTA shallow · JSON 02b network-hit reuse PROCESS.
5. **RETAIN** REC-01 GWC seals (cell identity · spawn UQ · submit-workflow · U19 · CELLID CLOSED).

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-YCTD-02** | 🟢 PASS | Lưu 201 → Gửi 201 → F5 · draft≠receivable · stamp title |
| **J-HRM-REC-YCTD-02b** | 🟢 PASS / OBS | OUT + LONG hint + flags block + F5 · FE BOD approve deferred to L1 |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (next UC board #5) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE REC-02/02b: L1 draft/OUT-REASON/CELL-QTY/SHORT·LONG/open_for_hire/flags/O4/SPAWN-DUP/Nest404/U19 ACCEPT; U65 J-HRM-REC-YCTD-02/02b FE+F5 + O4 banner + O5 dualPersist=0 ACCEPT; must_keep UF-12/JD/REC-01 RETAIN; Condition P2 TARGET-MONTH-DATE → dev-be parallel; BA AC remain listed (02d/02b-05 FE BOD chain + ALTs); honesty false. DENY module REC UAT / Phase1 / Nest dual. Next continuous seat: **UC-BP-REC-08** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-08
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-02/02b (#3–#4) = **UC-BP-REC-08** (#5 QUEUED) «Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người»)»

READ FIRST:
1. docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md
2. SRS FR for UC-BP-REC-08 (recruitment dashboard / fill-rate «bao giờ đủ người»)
3. SA/BA/API/DATA REC-02 Option A + physical job_requisitions / open_for_hire / pipeline_flags (must_keep)
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qc-01.md (GWC · honesty false · Condition TARGET-MONTH P2 · AC remain)

MISSION:
1) Option A/B/C hẹp cho REC-08 — read-model / dashboard on physical YCTD+Định biên; DENY dual SoT / invent Nest /rec.
2) Map D1–D4 gaps vs REC-01/02 seals (cell · spawn · open_for_hire · flags · U19).
3) Explicit OUT: REC-03 Campaign · seed · honesty flip · module REC UAT claim · reopen REC-02 P0 tokens.
4) Handoff ba-process AC pack for REC-08 after Option LOCKED.

PARALLEL residual (same session if quota; do not block SA):
work_item_id: PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01 (or in-flight parallel fix)
lane: dev-be
MISSION: Close R-REC-02-TARGET-MONTH-DATE — coerce target_month to DATE first-of-month or 400 VAL (deny 500). Cite QC-01 Condition. C-SLICE · no honesty flip.

exit: PASS_TO_PM · Option LOCKED · evidence docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md (or docs/qa/evidence/…-sa-01.md per house style)
cấm: seed · flip recruitment_uat_ready · claim module REC UAT · Nest /rec dual · reopen REC-02 L1 seals
```
