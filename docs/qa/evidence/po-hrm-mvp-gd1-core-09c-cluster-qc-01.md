# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-09c C-SLICE only** · **not** module CORE / CTR / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-15) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE09CQA-MSLBR3YX`** · FE-01 READY · API-01 CONFIRMED RETAIN · peer QC **`CORE09BQC1-MSLB05DZ`** |
| **uc_ids** | `UC-BP-CORE-09c` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-09c-cluster-qa-01.md`](po-hrm-mvp-gd1-core-09c-cluster-qa-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-09c-cluster-fe-01.md`](po-hrm-mvp-gd1-core-09c-cluster-fe-01.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-09c-cluster-api-01.md`](po-hrm-mvp-gd1-core-09c-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md) AC-CORE-09C-01..08 · AC-CTR-PRINT-01/04/05/06/08 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-09c-cluster-qa-01.json` · overall **PASS** · stamp **`CORE09CQA-MSLBR3YX`** · Nest `/core` **0** · PREV ephemeral **0** VER · PDF **`%PDF-1.3`** 15094B |
| **stamp** | QC **`CORE09CQC1-MSLBXMUT`** · QA **`CORE09CQA-MSLBR3YX`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` · contract `HD-CORE09C-LBR3YX` created via FE |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **≠ CORE-09b=printable DONE** · **≠ 09d TPL invent DONE** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-09b pack+preview = printable DONE** | **DENIED** | must_keep peer `CORE09BQC1-MSLB05DZ` |
| **09d TPL catalog invent DONE** | **DENIED** | OUT this seat · board #18 next |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot * · browser **0** hits |
| **Preview INSERT print-version** | **DENIED** | PREV ephemeral · Δ201=**0** during preview |
| **Reopen sealed J-HRM-CORE-09B / 09A / 08 / 02 / 01** | **DENIED** | must_keep stamps CORE09BQC1 / CORE09AQC1 / CORE08QC1 / CORE02QC1 / CORE01QC1 |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-15 VER+PDF GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim module CORE / CTR / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim CORE-09b = printable DONE? | **NO** |
| May PM claim 09d TPL invent DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed J-CORE-09B/09A/08/02/01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-09d** (board #18) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-09c** (issued print-version persist · PDF from snapshot · DRIVER soft-block · PREV ephemeral · amend supersede · Nest `/core` 0 · physical `/contracts-insurance/*`) after QA stamp **`CORE09CQA-MSLBR3YX`**.

Audited: QA-01 MD · raw JSON · screens 01–14 · downloaded PDF magic · L0/L1/network/journeys · BA/SA/DATA/API · FE-01 · peer must_keep `CORE09BQC1-MSLB05DZ` · DENY Nest `/core` · DENY printable flip · DENY CORE-09b=printable · DENY 09d TPL invent DONE.

**U65 ACCEPT:** Hợp đồng → Thêm → create `HD-CORE09C-LBR3YX` · preview `can_issue=true` → **Lưu phiên bản in** POST **201** `HRM-CTR-VER-201` · F5 list/detail v1 GENERAL Đã phát hành · **PDF** GET physical **200** `application/pdf` · file **`%PDF-1.3`** 15094B · DRIVER missing soft-disable + missing UI · pvCount 1→1 · PREV Δ201=0 · amend v2 issued / v1 superseded · Nest `/core` **0** · honesty UI printable=false.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · **P2** browser PDF body race (L1 %PDF OK) · **P2** ISSUE soft-disable vs server `ISSUE-BLOCKED` click · **P2 carry** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d · Windows UV assert after `qc:dev-stack` health **200** (ENV).

**NOT Phase 1 DONE. NOT module CORE / CTR / personnel UAT. NOT printable ready. NOT CORE-09b=printable DONE. NOT 09d TPL invent DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-09C-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Physical POST/GET print-versions · PDF snapshot `%PDF` | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot * | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| PREV ephemeral 0 VER INSERT | PRODUCT | **ACCEPT** · must_keep CORE-09b |
| `R-QA-CORE-09C-PDF-BROWSER-BODY` | PRODUCT **P2 OBS** | **ACCEPT** · L1 `%PDF-1.3` 15094B seals magic |
| `R-QA-CORE-09C-ISSUE-SOFT-DISABLE` | PRODUCT **P2 OBS** | **ACCEPT** · soft UX + 0 INSERT · server gate retained |
| `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | PRODUCT **P2 carry** | **ACCEPT** idle-ok · peer **09d** |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / printable / CORE-09b=printable / 09d invent / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 preview can_issue → POST print-versions **201** VER-201 + F5 GET **200** | QA J-01 · JSON · screens 04–07 · toast VER-201 | 🟢 |
| 2 | J-02 PDF physical **200** · `%PDF` snapshot · Nest `/core` 0 | QA J-02 · `09-j02-downloaded.pdf` magic `%PDF-1.3` 15094B · L1 | 🟢 |
| 3 | J-03 DRIVER missing soft-block · pvCount 1→1 · Nest 0 | QA J-03 · screens 11–12 · noFake=true | 🟢 |
| 4 | J-04 PREV ephemeral 0 VER · amend supersede · printable=false · seals | QA J-04 · nestTotal=0 · honestyUI · screens 13–14 | 🟢 |
| 5 | Residual P0 | none · P2 OBS pdf-body / soft-disable / clause-empty carry only | 🟢 non-block |
| 6 | C-SLICE ≠ module CORE/CTR UAT · honesty false · printable false · ≠09b=printable · ≠09d DONE | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · VER INSERT on preview · reopen J-CORE-09B/09A/08/02/01 · seed | QA DENY + QC locks · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/FE/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-09b/09a) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 print-versions · Nest `/core` DENY · PDF `%PDF` · PREV ephemeral | VER `HRM-CTR-VER-200/201` · Nest Cannot * · `%PDF-1.3` · Δ201=0 | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE09CQA-MSLBR3YX` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |
| Spot PDF file magic | `%PDF-1.3` · 15094 bytes | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` `/command-center/hrm/contracts` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-09C-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-09C · F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · AC-CTR-PRINT-01/04/05/06/08 · Nest DENY |
| 7 | residual_section | ✅ below · P2 OBS idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-09C-01** | **PASS** | preview can_issue → POST VER **201** `HRM-CTR-VER-201` · F5 GET **200** list/detail v1 GENERAL · Nest 0 · preview alone 0 VER |
| **J-HRM-CORE-09C-02** | **PASS** | GET pdf physical **200** `application/pdf` · downloaded `%PDF-1.3` 15094B · Nest 0 · ≠ live-library remerge |
| **J-HRM-CORE-09C-03** | **PASS** | DRIVER missing UI + soft-disable Lưu · pvCount 1→1 · Nest 0 · OBS soft vs server ISSUE-BLOCKED click |
| **J-HRM-CORE-09C-04** | **PASS** | PREV Δ201=0 · amend v2 supersede v1 · Nest 0 · printable=false · CORE-09a/09b must_keep · ≠09d DONE |
| Module CORE / CTR / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-09B-*** / **09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · stamps `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-09C-01 | **PASS** |
| J-HRM-CORE-09C-02 | **PASS** |
| J-HRM-CORE-09C-03 | **PASS** |
| J-HRM-CORE-09C-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09c-cluster-qa-01/` — 01-contracts-list · 02-form-filled · 03-after-create · 04..07 J01 · 08..10 J02 (+ `09-j02-downloaded.pdf`) · 11..12 J03 · 13..14 J04.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-09C-01..04 with QC stamp **`CORE09CQC1-MSLBXMUT`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false). Update continuous board Wave-15 **SEALED GWC** · next **UC-BP-CORE-09d** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · CORE-09b=printable DONE · 09d TPL invent DONE · seed · reopen sealed J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-QA-CORE-09C-PDF-BROWSER-BODY` (P2):** Playwright response body race → magic via L1 + downloaded file `%PDF-1.3` — **ACCEPT** non-blocking · Network physical 200 retained.
3. **Condition OBS `R-QA-CORE-09C-ISSUE-SOFT-DISABLE` (P2):** FE disables «Lưu phiên bản in» when `can_issue=false` — server `HRM-CTR-ISSUE-BLOCKED` not exercised via UI click; missing lists + **0** INSERT asserted — **ACCEPT** · stronger UX gate · server path retained in API.
4. **Condition OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` (P2 carry):** IT/DRIVER empty `clause_ids` — **ACCEPT** idle-ok this seat · carry to peer **UC-BP-CORE-09d** TPL bind — **not** invent TPL DONE this WI.
5. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
6. **RETAIN** SA Option A physical `/api/hrm/contracts-insurance/*` VER+PDF · F-CORE-CTR-VER-01/02 · F-CORE-CTR-PDF-01 · must_keep CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · CORE-09a CL · CORE-08 RD · CORE-02 AuthZ/CB-403 · CORE-01 public · U19 J-09C.
7. **OUT** this seat: UC-BP-CORE-09d open TPL catalog invent DONE · DOCX · invent printable UAT · module CORE/CTR UAT.
8. **NOT** Phase 1 DONE · **NOT** module CORE / CTR / personnel UAT · Wave-15 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-QA-CORE-09C-PDF-BROWSER-BODY** | P2 OBS | OPEN / idle-ok | — L1 `%PDF` seals · optional QA harness later |
| **R-QA-CORE-09C-ISSUE-SOFT-DISABLE** | P2 OBS | OPEN / idle-ok | FE/API idle-ok · server ISSUE-BLOCKED retained |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | P2 OBS | OPEN / idle-ok | peer **sa/ba** on **UC-BP-CORE-09d** TPL bind — **not** invent this WI |
| Honesty / C-SLICE / printable false / ≠09b=printable / ≠09d DONE / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-09C-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / claim module CORE / CTR / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · preview INSERT VER as DONE  
- Claim CORE-09b = printable DONE · claim 09d TPL invent DONE  
- Seed / reopen sealed J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE/CTR pillar UAT DONE because VER+PDF seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #18 **UC-BP-CORE-09d** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-09c: J-HRM-CORE-09C-01..04 PASS (VER persist 201+F5 · PDF `%PDF` snapshot · DRIVER soft-block 0 fake INSERT · PREV ephemeral · amend supersede · Nest `/core` 0 · printable false · CORE-09b/09a must_keep) · U65 · pack QC 8/8 · P2 OBS pdf-body/soft-disable/clause-empty carry idle-ok. Conditions: honesty false · printable false · C-SLICE · DENY CORE-09b=printable / 09d TPL invent / module CORE·CTR UAT / Nest dual / seed / reopen J-CORE-09B/09A/08/02/01. Next continuous: **UC-BP-CORE-09d** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-09d
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qc-01.md · stamp CORE09CQC1-MSLBXMUT · Wave-15 UC-BP-CORE-09c SEALED · peer CORE09BQC1-MSLB05DZ must_keep
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-09c (#17) = **UC-BP-CORE-09d** (#18 QUEUED) «Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8…)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d · AC-CTR-XEVN-01..11 · AC-PLT-CTR-01..06 · CORR-01 open catalog · DYNAMIC-LOCK · F-CORE-CTR-TPL-* · J-HRM-CTR-04 / J-HRM-CTR-07 DRAFT · must_keep CORE-09c F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 physical /contracts-insurance/* · must_keep CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · must_keep CORE-09a F-CORE-CTR-CL-01..04 · Nest /core DENY · carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY (IT/DRIVER empty clause_ids) into TPL bind scope

MISSION — SA Option seat (narrow):
1) Option A/B/C for open contract-template catalog (starter XEVN_* examples · Settings 9+ · matrix type×pack · GPLX/term defaults) vs AS-IS LIVE — DENY closed enum / «reject 9th» · DENY dual Nest /core
2) F.1 API map + must_keep CORE-09c VER/PDF · CORE-09b pack+ephemeral PREV · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · DENY reopen sealed J-HRM-CORE-09C-01..04 / J-HRM-CORE-09B / 09A / 08/02/01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / personnel·CORE·CTR UAT · DENY claim CORE-09c VER/PDF = printable module UAT · DENY invent printable DONE
3) Address carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY in Option disposition (TPL layout.clause_ids bind) — unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · reopen sealed CORE-09c / CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · claim Wave-15 VER+PDF = printable UAT · claim closed-8 TPL DONE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE09CQC1-MSLBXMUT` · 2026-08-09 · Wave-15 UC-BP-CORE-09c **SEALED GWC** ≠ module CORE / CTR / personnel UAT · printable false · CORE-09b ≠ printable DONE · 09d TPL ≠ invent DONE
