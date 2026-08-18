# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-09b C-SLICE only** · **not** module CORE / CTR / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-14) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE09BQA-MSLAWKV6`** · FE-01 READY · API-01 CONFIRMED RETAIN · peer QC **`CORE09AQC1-MSLA4LX9`** |
| **uc_ids** | `UC-BP-CORE-09b` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-09b-cluster-qa-01.md`](po-hrm-mvp-gd1-core-09b-cluster-qa-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-09b-cluster-fe-01.md`](po-hrm-mvp-gd1-core-09b-cluster-fe-01.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-09b-cluster-api-01.md`](po-hrm-mvp-gd1-core-09b-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md) AC-CORE-09B-* · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-09b-cluster-qa-01.json` · overall **PASS** · stamp **`CORE09BQA-MSLAWKV6`** · `nest_core_total=0` · `ver_insert_posts=0` |
| **stamp** | QC **`CORE09BQC1-MSLB05DZ`** · QA **`CORE09BQA-MSLAWKV6`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` · TPL activate = Settings-equivalent Hiệu lực (not seed) |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **CORE-09a ≠ printable DONE** · **09c VER/PDF ≠ invent DONE** · **09d TPL ≠ invent DONE** |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-09a clause library = printable DONE** | **DENIED** | must_keep · peer seal only |
| **09c VER / PDF invent DONE** | **DENIED** | OUT this seat · board #17 next |
| **09d TPL catalog invent DONE** | **DENIED** | OUT this seat · board #18 |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot * · browser **0** hits · `nest_core_total=0` |
| **Preview INSERT print-version** | **DENIED** | `ver_insert_posts=0` · ephemeral PREV only |
| **Reopen sealed J-HRM-CORE-09A / 08 / 02 / 01** | **DENIED** | must_keep stamps CORE09AQC1 / CORE08QC1 / CORE02QC1 / CORE01QC1 |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-14 pack+preview GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim module CORE / CTR / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM claim CORE-09a = printable DONE? | **NO** |
| May PM claim 09c VER/PDF / 09d TPL invent DONE? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed J-CORE-09A/08/02/01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-09c** (board #17) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-09b** (pack-resolve suggest · ephemeral POST preview · IT↔DRIVER pack gate · missing/can_issue · registry F5 · Nest `/core` 0 · physical `/contracts-insurance/contracts*`) after QA stamp **`CORE09BQA-MSLAWKV6`**.

Audited: QA-01 MD · raw JSON · screens 01–11 · L0/L1/network/journeys · BA/SA/DATA/API · FE-01 · DENY Nest `/core` · DENY printable flip · DENY CORE-09a=printable · DENY 09c VER/PDF · 09d TPL invent DONE · must_keep CORE-09a/08/02/01.

**U65 ACCEPT:** Hợp đồng → Thêm → pack-resolve **200** `HRM-CTR-PACK-200` suggest GENERAL · create **201** · Xem trước POST preview **201** `HRM-CTR-PREV-200` · 18 clauses GENERAL · ephemeral meta · **0** VER INSERT · IT↔DRIVER pack behavior differs · DRIVER `can_issue=false` + GPLX missing UI · registry PATCH **200** + F5 row còn · Nest `/core` **0** · honesty UI printable=false.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · **P2** empty IT/DRIVER `clause_ids` (peer 09d) · **P2** `cb_masked=false` for `ceo@` (C&B persona) · **P2** TPL-NONE env N/A · Windows UV assert after `qc:dev-stack` health **200** (ENV).

**NOT Phase 1 DONE. NOT module CORE / CTR / personnel UAT. NOT printable ready. NOT CORE-09a=printable DONE. NOT 09c VER/PDF invent DONE. NOT 09d TPL invent DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-09B-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Physical pack-resolve + ephemeral preview · no VER INSERT | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot * | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| `R-QA-CORE-09B-CLAUSE-FP-EMPTY` IT/DRIVER empty clause_ids | PRODUCT **P2 OBS** | **ACCEPT** non-blocking · peer **09d** TPL bind |
| `R-QA-CORE-09B-CB-MASK-CEO` | PRODUCT **P2 OBS** | **ACCEPT** · non-C&B probe deferred |
| `R-QA-CORE-09B-TPL-NONE-ENV` | ENV **P2 OBS** | **ACCEPT** · AC-06 path retained |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / printable / CORE-09a=printable / 09c·09d invent / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 pack-resolve 200 + suggest banner GENERAL · Nest `/core` 0 | QA J-01 · JSON `j01` · screens 01–03 | 🟢 |
| 2 | J-02 registry 201 + POST preview 201 ephemeral · 18 clauses · **no VER INSERT** | QA J-02 · JSON `verPost=false` · `ver_insert_posts=0` · screens 04–07 | 🟢 |
| 3 | J-03 IT↔DRIVER pack behavior · DRIVER block + missing GPLX · Nest 0 | QA J-03 · JSON packBehaviorDiff · screens 08–09 | 🟢 |
| 4 | J-04 can_issue=false + missing UI + registry F5 · printable=false · CORE-09a smoke | QA J-04 · JSON nestTotal=0 · screens 10–11 | 🟢 |
| 5 | Residual P0 | none · P2 OBS clause-empty / cb-mask / TPL-NONE only | 🟢 non-block |
| 6 | C-SLICE ≠ module CORE/CTR UAT · honesty false · printable false · ≠09a=printable · ≠09c/09d DONE | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · VER INSERT on preview · reopen J-CORE-09A/08/02/01 · seed | QA DENY + QC locks · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/FE/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-09a) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 pack-resolve · Nest `/core` DENY · preview ephemeral · CORE-09a clauses | pack `HRM-CTR-PACK-200` · Nest Cannot * · PREV `HRM-CTR-PREV-200` · `ver_insert_posts=0` | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE09BQA-MSLAWKV6` | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` `/command-center/hrm/contracts` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-09B-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-09B · F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · pack+preview ephemeral · Nest DENY |
| 7 | residual_section | ✅ below · P2 OBS idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-09B-01** | **PASS** | pack-resolve 200 suggest GENERAL + banner · Nest 0 |
| **J-HRM-CORE-09B-02** | **PASS** | create 201 · preview 201 ephemeral 18 clauses · **no VER INSERT** |
| **J-HRM-CORE-09B-03** | **PASS** | IT↔DRIVER pack differs · DRIVER block + GPLX missing · Nest 0 · P2 empty clause_ids |
| **J-HRM-CORE-09B-04** | **PASS** | can_issue=false + missing UI · registry F5 · Nest 0 · printable=false · CORE-09a must_keep |
| Module CORE / CTR / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · stamps `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-09B-01 | **PASS** |
| J-HRM-CORE-09B-02 | **PASS** |
| J-HRM-CORE-09B-03 | **PASS** |
| J-HRM-CORE-09B-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09b-cluster-qa-01/` — 01-contracts-list · 02-j01-pack-suggest · 03-j01-form-filled · 04-after-create · 05-list-after-create · 06-j02-before-preview · 07-j02-after-preview · 08-j03-it-preview · 09-j03-driver-preview · 10-j04-missing · 11-j04-f5-registry.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-09B-01..04 with QC stamp **`CORE09BQC1-MSLB05DZ`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false). Update continuous board Wave-14 **SEALED GWC** · next **UC-BP-CORE-09c** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · CORE-09a=printable DONE · 09c VER/PDF invent DONE · 09d TPL invent DONE · seed · reopen sealed J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` (P2):** IT/DRIVER active TPL `layout.clause_ids=[]` → preview clause arrays empty; pack gate/DRIVER missing still differs — **ACCEPT** non-blocking under C-SLICE; carry to peer **UC-BP-CORE-09d** TPL bind — **not** invent TPL DONE this WI.
3. **Condition OBS `R-QA-CORE-09B-CB-MASK-CEO` (P2):** `ceo@` → `cb_masked=false` (C&B persona) — **ACCEPT** · non-C&B role probe deferred (optional later QA).
4. **Condition OBS `R-QA-CORE-09B-TPL-NONE-ENV` (P2):** env has active TPL — `ctr-print-no-template` N/A — FE path + `HRM-CTR-TPL-NONE` retained — **ACCEPT**.
5. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
6. **RETAIN** SA Option A physical `/api/hrm/contracts-insurance/contracts*` pack-resolve + preview · F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 · ephemeral no VER · CORE-09a CL · CORE-08 RD · CORE-02 AuthZ/CB-403 · CORE-01 public · U19 J-09B.
7. **OUT** this seat: UC-BP-CORE-09c version/PDF persist · 09d template catalog · DOCX · invent printable UAT · module CORE/CTR UAT.
8. **NOT** Phase 1 DONE · **NOT** module CORE / CTR / personnel UAT · Wave-14 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | P2 OBS | OPEN / idle-ok | peer **sa/ba** on **UC-BP-CORE-09d** TPL bind — **not** invent this WI |
| **R-QA-CORE-09B-CB-MASK-CEO** | P2 OBS | OPEN / idle-ok | optional QA non-C&B later |
| **R-QA-CORE-09B-TPL-NONE-ENV** | P2 OBS | OPEN / env N/A | — AC path retained |
| Honesty / C-SLICE / printable false / ≠09a=printable / ≠09c·09d DONE / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-09B-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / claim module CORE / CTR / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT · preview INSERT VER as DONE  
- Claim CORE-09a = printable DONE · claim 09c VER/PDF invent DONE · claim 09d TPL invent DONE  
- Seed / reopen sealed J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE/CTR pillar UAT DONE because pack+preview seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #17 **UC-BP-CORE-09c** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-09b: J-HRM-CORE-09B-01..04 PASS (pack-resolve suggest · ephemeral preview no VER · IT↔DRIVER gate · missing/can_issue · registry F5 · Nest `/core` 0 · printable false · CORE-09a must_keep) · U65 · pack QC 8/8 · P2 OBS clause-empty/cb-mask/TPL-NONE idle-ok. Conditions: honesty false · printable false · C-SLICE · DENY CORE-09a=printable / 09c VER-PDF invent / 09d TPL invent / module CORE·CTR UAT / Nest dual / seed / reopen J-CORE-09A/08/02/01. Next continuous: **UC-BP-CORE-09c** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-09c
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-qc-01.md · stamp CORE09BQC1-MSLB05DZ · Wave-14 UC-BP-CORE-09b SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-09b (#16) = **UC-BP-CORE-09c** (#17 QUEUED) «Lưu phiên bản và in / PDF hợp đồng — ADD»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09c · docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md E.2/E.3 · TECHSPEC/API F-CORE-CTR-VER-01 (+ PDF print spine) · must_keep CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral physical /contracts-insurance/contracts* · must_keep CORE-09a F-CORE-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY · carry OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY → peer 09d (not invent TPL DONE here)

MISSION — SA Option seat (narrow):
1) Option A/B/C for issued print-version persist + PDF/print of HDLD — VER INSERT path vs AS-IS · snapshot freeze from CORE-09a · can_issue gate from CORE-09b · DENY dual Nest /core
2) F.1 API map + must_keep CORE-09b pack+ephemeral PREV (no reopen rewrite) · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · DENY Nest /core dual · DENY reopen sealed J-HRM-CORE-09B-01..04 / J-HRM-CORE-09A / 08/02/01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / personnel·CORE·CTR UAT · DENY claim CORE-09b = printable DONE · DENY invent 09d TPL catalog as this seat DONE
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · reopen sealed CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · invent 09d full TPL catalog DONE in this seat · claim Wave-14 pack+preview = printable UAT
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE09BQC1-MSLB05DZ` · 2026-08-09 · Wave-14 UC-BP-CORE-09b **SEALED GWC** ≠ module CORE / CTR / personnel UAT · printable false · CORE-09a ≠ printable DONE · 09c VER/PDF ≠ invent DONE · 09d TPL ≠ invent DONE
