# Evidence — PO-HRM-MVP-GD1-CORE-03-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-03 C-SLICE only** · **not** module CORE / personnel UAT · **not** CORE-07 DONE · **not** printable DONE · **not** EMP DOC L1 = CORE-03 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-18) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE03QA-MSLFGIQ4`** · FE-01 / BE-01 READY · API-01 F-CORE-CHK-01 ADD · peer QC **`CORE02BQC1-MSLEFQC1`** · **`CORE09DQC1-MSLDR8I3`** … · EMPPLAT **`EMPPLATQA-MSIZXHIM`** · EMPTOK **`EMPTOKQA-MSJ290VB`** |
| **uc_ids** | `UC-BP-CORE-03` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-03-cluster-qa-01.md`](po-hrm-mvp-gd1-core-03-cluster-qa-01.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-03-cluster-api-01.md`](po-hrm-mvp-gd1-core-03-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md) |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md) Option A |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-03-cluster-qa-01.json` · overall **PASS** · stamp **`CORE03QA-MSLFGIQ4`** · Nest `/core` SoT non-404 **0** · invent **400** UNKNOWN · seed_used **false** |
| **stamp** | QC **`CORE03QC1-MSLFJH0K`** · QA **`CORE03QA-MSLFGIQ4`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · **≠ CORE-07 / personnel / printable DONE** · **≠ EMP DOC L1 = CORE-03 DONE** · **≠ CORE-02b = EMPCF DONE** · **≠ CORE-09d printable/closed-8** |
| **portal_url** | `http://127.0.0.1:5173` · Settings DOC/ET · Profile `/hr/employees/{id}?tab=documents` · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **CORE-07 / OCR / activation checklist-done = DONE** | **DENIED** | AC-CORE-03-09-OUT · board #23 still QUEUED |
| **EMP DOC L1 = CORE-03 / personnel UAT DONE** | **DENIED** | cite `EMPPLATQA-MSIZXHIM` RETAIN ≠ promote |
| **CORE-02b = EMPCF / personnel DONE** | **DENIED** | must_keep `CORE02BQC1-MSLEFQC1` |
| **CORE-09d printable / closed-8 DONE** | **DENIED** | must_keep `CORE09DQC1-MSLDR8I3` |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual CHK/DOC SoT** | **DENIED** | L1 Cannot GET · browser SoT non-404 **0** |
| **Nest `emp_position` / `emp_custom_field`** | **DENIED** | src/dist ABSENT |
| **Reopen sealed J-HRM-CORE-02B / 09D / 09C / 09B / 09A / 08 / 02 / 01** | **DENIED** | must_keep stamps |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **Dev invent schema/API this seat** | **DENIED** | seal only |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-18 checklist GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM claim CORE-07 / personnel / printable DONE? | **NO** |
| May PM claim EMP DOC L1 = CORE-03 / personnel UAT DONE? | **NO** |
| May PM claim CORE-02b = EMPCF DONE? | **NO** |
| May PM claim CORE-09d printable / closed-8 DONE? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM open next UC seat **UC-BP-CORE-05** (board #21) as **sa Option**? | **YES** (U88/U89 continuous) |
| May PM treat `R-CORE-03-CC-EMBED-OBS` as FAIL this seat? | **NO** — **P2 optional** idle-ok (`/hr/employees?tab=documents` PASS) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-03** (dynamic document checklist: Settings DOC/ET open catalog · TOK `emp.doc.*` · invent UNKNOWN when EFF>0 · Profile Giấy tờ empty→Thêm→Nộp→Xác nhận→F5 · soft-retire + history · physical `/document-types*` + `/employment-types*` + `/document-checklist*` · Nest `/core` 0) after QA stamp **`CORE03QA-MSLFGIQ4`**.

Audited: QA-01 MD · raw JSON overall PASS · screens 01–13 · L0/L1/network/journeys J-01..05 · BA/SA/DATA/API · peer must_keep CORE-02b/09d..01 · EMPPLAT/EMPTOK seals · DENY Nest `/core` · DENY CORE-07/personnel/printable DONE · DENY EMP DOC L1=CORE-03 DONE · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** Settings DOC CREATE PUT **200** `HRM-EMP-DOC-200` + flags F5 · ET CREATE · TOK origin=`emp_catalog` · invent POST **400** `HRM-EMP-DOC-TYPE-UNKNOWN` · checklist empty OK → POST **201** missing → PATCH submit **submitted** → PATCH approve **approved** F5 · soft-retire + history approved · Nest `/core` SoT **0** · honesty personnel/printable=false.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · **P2** `R-CORE-03-CC-EMBED-OBS` command-center embed did not mount checklist — `/hr/employees?tab=documents` PASS (≠ FAIL this seat).

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT CORE-07 DONE. NOT printable DONE. NOT EMP DOC L1 = CORE-03 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-03-01..05 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Physical DOC/ET/CHK · Nest `/core` 0 · empty OK | PRODUCT | **ACCEPT** |
| Invent UNKNOWN 400 · cite EMPPLAT | PRODUCT | **ACCEPT** · RETAIN |
| Submit→approved F5 · retire+history | PRODUCT | **ACCEPT** |
| Nest `/core` dual · CORE-07 invent DONE · EMP L1=CORE-03 | PRODUCT / GOVERNANCE | **ACCEPT** · DENY |
| `R-CORE-03-CC-EMBED-OBS` CC embed mount | PRODUCT **P2 optional** | **ACCEPT** idle-ok · not blocking J-* |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / CORE-07 DONE / printable / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 Settings DOC CREATE N+ flags · F5 · Nest `/core` 0 · cite EMPPLAT | QA J-01 · JSON · PUT **200** `HRM-EMP-DOC-200` | 🟢 |
| 2 | J-02 ET CREATE · TOK `emp.doc.*` origin=`emp_catalog` · cite EMPTOK | QA J-02 · `EMPTOKQA-MSJ290VB` | 🟢 |
| 3 | J-03 invent KEY **400** UNKNOWN · F5 no row · FE toast | QA J-03 · JSON | 🟢 |
| 4 | J-04 Profile checklist empty→Thêm→Nộp→Xác nhận→F5 approved | QA J-04 · POST **201** · PATCH submit/approve | 🟢 |
| 5 | J-05 soft-retire · history · peer seals · honesty · CORE-07 OUT | QA J-05 · seals CORE-02b/09d..01 | 🟢 |
| 6 | Residual P0 | none · P2 CC-embed optional only | 🟢 non-block |
| 7 | C-SLICE ≠ module · ≠ CORE-07/personnel/printable DONE · ≠ EMP L1=CORE-03 · honesty false | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 8 | DENY Nest `/core` · reopen J-CORE-02B/09D..01 · seed · Dev invent | QA DENY + src/dist · `seed_used=false` | 🟢 **RETAIN** |
| 9 | Pack BA/SA/DATA/API/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-02b/09d) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 empty CHK · Nest `/core` DENY · invent UNKNOWN | CHK **200** total=0 · Nest Cannot GET · invent **400** | PRODUCT |
| QA runner U65 J-01..05 | overall **PASS** stamp `CORE03QA-MSLFGIQ4` | PRODUCT |
| Network physical | `/document-types*` **16** · `/employment-types*` **6** · `/document-checklist*` **15** · Nest `/core` SoT **0** | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` Settings + `/hr/employees?tab=documents` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-03-01..05** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-03-* · F-CORE-CHK-01 · DOC/ET RETAIN · Nest DENY |
| 7 | residual_section | ✅ below · P2 CC-embed optional · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-03-01** | **PASS** | Settings DOC CREATE `hr_doc_c03_mslfgiq4` · flags · F5 · Nest `/core` 0 · cite EMPPLAT |
| **J-HRM-CORE-03-02** | **PASS** | ET CREATE · TOK `emp.doc.hr_doc_c03_mslfgiq4` origin=`emp_catalog` · cite EMPTOK |
| **J-HRM-CORE-03-03** | **PASS** | invent `zz_invent_c03_mslfgiq4` → **400** `HRM-EMP-DOC-TYPE-UNKNOWN` · no persist |
| **J-HRM-CORE-03-04** | **PASS** | empty OK · POST **201** missing · submit→submitted · approve→approved F5 · Nest chk SoT 0 |
| **J-HRM-CORE-03-05** | **PASS** | soft-retire · history approved · peer seals · honesty false · CORE-07 OUT |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| CORE-07 / printable DONE | **DENIED** | OUT invent |
| EMP DOC L1 = CORE-03 DONE | **DENIED** | RETAIN cite only |
| **J-HRM-CORE-02B-*** / **09D-*** / **09C-*** / **09B-*** / **09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-03-01 | **PASS** |
| J-HRM-CORE-03-02 | **PASS** |
| J-HRM-CORE-03-03 | **PASS** |
| J-HRM-CORE-03-04 | **PASS** |
| J-HRM-CORE-03-05 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-03-cluster-qa-01/` — 01-settings-doc … 13-done.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-03-01..05 with QC stamp **`CORE03QC1-MSLFJH0K`** (QA already 🟢 PASS · C-SLICE · honesty false). Update continuous board Wave-18 **SEALED GWC** · next **UC-BP-CORE-05** SA (#21).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · CORE-07/personnel/printable DONE · EMP DOC L1=CORE-03 DONE · CORE-02b=EMPCF DONE · CORE-09d printable/closed-8 · seed · reopen sealed J-HRM-CORE-02B-* / J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-CORE-03-CC-EMBED-OBS` (P2 optional):** command-center embed path did not mount checklist — **ACCEPT** non-blocking · `/hr/employees?tab=documents` PASS · promote only via dedicated FE WI if PM chooses.
3. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
4. **RETAIN** physical `/api/hrm/employees/:id/document-checklist*` + `/document-types*` + `/employment-types*` · F-CORE-CHK-01 · DOC/ET/TOK RETAIN · must_keep CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · EMPPLAT/EMPTOK seals · U19 J-03.
5. **OUT** this seat: invent CORE-07 activation DONE · invent Nest `/core` CHK dual · claim EMP L1=CORE-03 · claim printable/personnel DONE · module CORE UAT · UC-BP-CORE-05 invent as DONE.
6. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-18 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-CORE-03-CC-EMBED-OBS** | P2 optional | OPEN / idle-ok | FE later — only if PM promotes dedicated WI · **DENY** invent this seal |
| Honesty / C-SLICE / personnel false / printable false / ≠ CORE-07 DONE / ≠ EMP L1=CORE-03 / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-03-01..05 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / **`hrm_personnel_uat_ready`** / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual CHK/DOC SoT  
- Claim CORE-07 / OCR / activation checklist-done = DONE  
- Claim EMP DOC L1 = CORE-03 / personnel UAT DONE  
- Claim CORE-02b = EMPCF DONE · CORE-09d printable/closed-8 DONE  
- Seed / reopen sealed J-HRM-CORE-02B-* / J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Dev invent schema/API/endpoints this seat · treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #21 **UC-BP-CORE-05** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-03: J-HRM-CORE-03-01..05 PASS (DOC/ET CREATE · TOK emp.doc.* · invent UNKNOWN **400** · checklist empty→submit→approved F5 · soft-retire+history · Nest `/core` 0 · physical DOC/ET/CHK · cite EMPPLAT/EMPTOK · must_keep CORE-02b/09d..01 · honesty false · C-SLICE · U65 · pack QC 8/8). Conditions: honesty false · ≠ CORE-07/personnel/printable DONE · ≠ EMP DOC L1=CORE-03 · DENY Nest dual / seed / reopen J-CORE-02B/09D..01 / module CORE·personnel UAT. P2 R-CORE-03-CC-EMBED-OBS idle-ok. Next continuous: **UC-BP-CORE-05** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-05
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qc-01.md · stamp CORE03QC1-MSLFJH0K · Wave-18 UC-BP-CORE-03 SEALED · peer CORE02BQC1-MSLEFQC1 / CORE09DQC1-MSLDR8I3 / CORE09CQC1-MSLBXMUT / CORE09BQC1-MSLB05DZ / CORE09AQC1-MSLA4LX9 / CORE08QC1-MSL9BFFE / CORE02QC1-MSL80DU6 / CORE01QC1-MSL6WMS7 / EMPPLATQA-MSIZXHIM / EMPTOKQA-MSJ290VB must_keep · R-CORE-03-CC-EMBED-OBS P2 optional RETAIN idle-ok
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-03 (#20) = **UC-BP-CORE-05** (#21 QUEUED) «Cấp phát tài sản & biên bản bàn giao» · CORE-04 OUT · CORE-06/07 remain QUEUED after 05
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05 · Diễn biến cấp phát + biên bản · BR-BP-AST-01 · danh mục tài sản/serial tenant · must_keep CORE-03 checklist DOC/ET/CHK physical · must_keep CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 C&B · CORE-01 public · Nest /core DENY · DENY invent CORE-07 activation DONE · DENY claim CORE-03 = personnel UAT / EMP DOC L1 DONE · DENY printable flip

MISSION — SA Option seat (narrow):
1) Option A/B/C for asset issuance + handover biên bản (CRUD serial/catalog · attach employee · list trên hồ sơ) vs AS-IS LIVE — gap-only; DENY Nest /core dual · DENY wipe CORE-03 checklist / CORE-02b EMP-CF spine · DENY full accounting asset module invent
2) F.1 API map + must_keep CORE-03 checklist RETAIN · CORE-02b EMP-CF · CORE-09d..01 · DENY reopen sealed J-HRM-CORE-03-01..05 / J-HRM-CORE-02B / J-HRM-CORE-09D..01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / hrm_personnel_uat_ready / personnel·CORE·CTR UAT · DENY claim CORE-03 = personnel UAT · DENY claim CORE-07 DONE · DENY claim printable/closed-8 DONE
3) Disposition: RETAIN cite LIVE asset endpoints vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note CORE-06 thu hồi depends on CORE-05 SoT (do not invent CORE-06 DONE)
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · reopen sealed CORE-03 / CORE-02b / CORE-09d / CORE-09c / CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · claim Wave-18 checklist = personnel UAT · invent CORE-07 DONE · invent R-CORE-03-CC-EMBED-OBS DONE without FE WI
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE03QC1-MSLFJH0K` · 2026-08-09 · Wave-18 UC-BP-CORE-03 **SEALED GWC** ≠ module CORE / personnel UAT · ≠ CORE-07 DONE · ≠ printable DONE · ≠ EMP DOC L1 = CORE-03 DONE · Nest `/core` DENY · `R-CORE-03-CC-EMBED-OBS` P2 optional
