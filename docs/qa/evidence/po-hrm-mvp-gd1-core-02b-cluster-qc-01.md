# Evidence — PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-02b C-SLICE only** · **not** module CORE / personnel UAT · **not** EMPCF DONE · **not** CORE-09d printable/closed-8 DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-17) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`CORE02BQA-MSLEDIAQ`** · API-01 **CONFIRMED RETAIN** · peer QC **`CORE09DQC1-MSLDR8I3`** · EMPCF **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** |
| **uc_ids** | `UC-BP-CORE-02b` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-02b-cluster-qa-01.md`](po-hrm-mvp-gd1-core-02b-cluster-qa-01.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-02b-cluster-api-01.md`](po-hrm-mvp-gd1-core-02b-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md) |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-02b-cluster-qa-01.json` · overall **PASS** · stamp **`CORE02BQA-MSLEDIAQ`** · Nest `/core` **0** · invent **422** KEY · soft-retire `draft` |
| **stamp** | QC **`CORE02BQC1-MSLEFQC1`** · QA **`CORE02BQA-MSLEDIAQ`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · **≠ EMPCF = CORE-02b/personnel DONE** · **≠ CORE-09d printable/closed-8 DONE** |
| **portal_url** | `http://127.0.0.1:5173` · Settings Group HR · Employees · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **EMPCF L1 / FE = CORE-02b / personnel UAT DONE** | **DENIED** | cite RETAIN ≠ module promote |
| **CORE-09d printable / closed-8 DONE** | **DENIED** | must_keep peer `CORE09DQC1-MSLDR8I3` |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual EMP-CF SoT** | **DENIED** | L1 Cannot GET · browser **0** non-404 SoT |
| **Nest `emp_custom_field` / mega-EAV** | **DENIED** | src/dist ABSENT |
| **`profile_groups_json` primary** | **HOLD invent / OUT** | ensureSchema ABSENT |
| **Reopen sealed J-HRM-CORE-09D / 09C / 09B / 09A / 08 / 02 / 01** | **DENIED** | must_keep stamps |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **Dev invent schema/API this seat** | **DENIED** | Dev-BE HOLD · FE CTA P2 HOLD only |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-17 EMP-CF RETAIN GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM claim EMPCF L1/FE = CORE-02b / personnel UAT DONE? | **NO** |
| May PM claim CORE-09d printable / closed-8 DONE? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM invent Nest `/core` dual · Nest `emp_custom_field` · `profile_groups_json` primary · reopen sealed J-CORE-09D..01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-03** (board #20) as **sa Option**? | **YES** (U88/U89 continuous) |
| May PM promote FE residual `R-PLT-EMP-CF-FE-01` without separate WI? | **NO** — remains **P2 HOLD** unless dedicated FE WI |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-02b** (EMP-CF RETAIN: four Settings catalogs = groups · extension-items N+1 · TOK `origin=extension_field` · invent KEY when EFF>0 · soft-retire `draft` · physical `/settings-catalogs*` + `/employees*` · Nest `/core` 0) after QA stamp **`CORE02BQA-MSLEDIAQ`**.

Audited: QA-01 MD · raw JSON · screens 01–04 · L0/L1/network/journeys · BA/SA/DATA/API · peer must_keep `CORE09DQC1-MSLDR8I3` (+ 09c/09b/09a/08/02/01) · EMPCF/EXT seals · DENY Nest `/core` · DENY Nest `emp_custom_field` · DENY `profile_groups_json` primary · DENY EMPCF=personnel DONE · DENY 09d printable/closed-8 · DENY honesty flip · DENY seed · DENY Dev invent.

**U65 ACCEPT:** Settings Group HR → CREATE N+1 POST **201** `HRM-SET-209` (no KEY on admin CREATE) · F5 active · TOK `custom.emp.qa_c02b_mslediaq` origin=`extension_field` · Employee form four-catalog bind · invent PATCH **422** `HRM-EMP-CUSTOM-FIELD-KEY` no persist · soft-retire DELETE **200** → `status=draft` + picker hide · Nest `/core` **0** · honesty personnel/printable=false.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · **P2 HOLD** `R-PLT-EMP-CF-FE-01` empty EFF CTA (≠ mount FAIL · soft omit PASS) · Windows UV assert after `qc:dev-stack` health **200** (ENV).

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT EMPCF DONE. NOT CORE-09d printable/closed-8 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-02B-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| Four catalogs = groups · CREATE 201 · F5 · Nest `/core` 0 | PRODUCT | **ACCEPT** |
| TOK origin=`extension_field` · cite EXT | PRODUCT | **ACCEPT** · RETAIN |
| Invent KEY 422 · cite EMPCF · F5 no persist | PRODUCT | **ACCEPT** · RETAIN |
| Soft-retire draft · no hard wipe | PRODUCT | **ACCEPT** |
| Nest `/core` dual · Nest `emp_custom_field` · `profile_groups_json` primary | PRODUCT / GOVERNANCE | **ACCEPT** · DENY |
| `R-PLT-EMP-CF-FE-01` empty CTA | PRODUCT **P2 HOLD** | **ACCEPT** idle-ok · not blocking J-* |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / EMPCF=DONE / 09d printable / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 Settings CREATE N+1 · four catalogs · F5 · Nest `/core` 0 | QA J-01 · JSON · screen 01 · POST **201** `HRM-SET-209` · settings_hits=15 | 🟢 |
| 2 | J-02 TOK `custom.emp.*` origin=`extension_field` · FE form bind | QA J-02 · cite `EMPTOKEXTQA-MSJ57PE1` · screen 02 | 🟢 |
| 3 | J-03 invent KEY **422** · no persist · cite EMPCF | QA J-03 · JSON · screen 03 · `EMPCFQA-MSK14LUH` | 🟢 |
| 4 | J-04 soft-retire draft · CTA P2 HOLD · peer seals · honesty | QA J-04 · JSON · screen 04 · peer `CORE09DQC1-MSLDR8I3` | 🟢 |
| 5 | Residual P0 | none · P2 FE CTA HOLD only | 🟢 non-block |
| 6 | C-SLICE ≠ module · ≠ EMPCF DONE · ≠ 09d printable/closed-8 · honesty false | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` · Nest `emp_custom_field` · `profile_groups_json` primary · reopen J-CORE-09D..01 · seed · Dev invent | QA DENY + src/dist · `seed_used=false` | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-09d/09c/09b) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 four catalogs · Nest `/core` DENY · invent KEY · soft draft | catalogs **200** · Nest Cannot GET · invent **422** · retire **draft** | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE02BQA-MSLEDIAQ` | PRODUCT |
| Network physical | `/settings-catalogs*` **15** · `/employees*` **7** · Nest `/core` SoT **0** | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` Settings/Employees · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-02B-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-02B-* · F-EMP-CF-01..03 · TOK/CNS · Nest DENY |
| 7 | residual_section | ✅ below · P2 FE CTA HOLD · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-02B-01** | **PASS** | Settings CREATE `qa_c02b_mslediaq` POST **201** `HRM-SET-209` · F5 active · four catalogs · Nest `/core` 0 |
| **J-HRM-CORE-02B-02** | **PASS** | TOK `custom.emp.qa_c02b_mslediaq` origin=`extension_field` · cite `EMPTOKEXTQA-MSJ57PE1` · FE form bind |
| **J-HRM-CORE-02B-03** | **PASS** | invent `zz_invent_c02b_mslediaq` → **422** `HRM-EMP-CUSTOM-FIELD-KEY` · persisted=false · cite `EMPCFQA-MSK14LUH` |
| **J-HRM-CORE-02B-04** | **PASS** | soft-retire `draft` + hide · CTA **P2 HOLD** · peer CORE-09d..01 must_keep · honesty false · Nest `/core` 0 |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| EMPCF = CORE-02b / personnel DONE | **DENIED** | RETAIN cite only |
| CORE-09d printable / closed-8 DONE | **DENIED** | must_keep `CORE09DQC1-MSLDR8I3` |
| **J-HRM-CORE-09D-*** / **09C-*** / **09B-*** / **09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-02B-01 | **PASS** |
| J-HRM-CORE-02B-02 | **PASS** |
| J-HRM-CORE-02B-03 | **PASS** |
| J-HRM-CORE-02B-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-02b-cluster-qa-01/` — 01-group-hr · 02-employees · 03-after-invent-attempt · 04-done.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-02B-01..04 with QC stamp **`CORE02BQC1-MSLEFQC1`** (QA already 🟢 PASS · C-SLICE · honesty false). Update continuous board Wave-17 **SEALED GWC** · next **UC-BP-CORE-03** SA (#20).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · Nest `emp_custom_field` · `profile_groups_json` primary · EMPCF=personnel DONE · CORE-09d printable/closed-8 DONE · seed · reopen sealed J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition HOLD `R-PLT-EMP-CF-FE-01` (P2):** empty EFF CTA banner — **ACCEPT** non-blocking · soft omit PASS · ≠ mount FAIL · **DENY** Dev invent this seat · promote only via dedicated FE WI.
3. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
4. **RETAIN** SA Option A physical `/api/hrm/settings-catalogs*` + `/employees*` · F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 · four catalogs = groups · soft `status=draft` · must_keep CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 AuthZ/CB-403 · CORE-01 public · EMPCF/EXT seals · U19 J-02B.
5. **OUT** this seat: invent Nest `emp_custom_field` · invent Nest `/core` EMP-CF · invent `profile_groups_json` primary · claim EMPCF DONE · claim 09d printable/closed-8 · module CORE/personnel UAT · UC-BP-CORE-03 invent as DONE.
6. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-17 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-PLT-EMP-CF-FE-01** | P2 HOLD | OPEN / idle-ok | FE later — only if PM promotes dedicated WI · **DENY** invent this seal |
| Honesty / C-SLICE / personnel false / printable false / ≠ EMPCF DONE / ≠ 09d printable/closed-8 / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-02B-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / **`hrm_personnel_uat_ready`** / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual EMP-CF SoT · Nest `emp_custom_field` / mega-EAV · `profile_groups_json` primary  
- Claim EMPCF L1/FE = CORE-02b / personnel UAT DONE  
- Claim CORE-09d printable / closed-8 DONE  
- Seed / reopen sealed J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Dev invent schema/API/endpoints this seat · treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #20 **UC-BP-CORE-03** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-02b: J-HRM-CORE-02B-01..04 PASS (CREATE extension **201** · TOK `extension_field` · invent KEY **422** · soft-retire `draft` · Nest `/core` 0 · physical `/settings-catalogs*`+`/employees*` · cite EMPCF/EXT · must_keep CORE-09d..01 · CTA P2 HOLD · honesty false · C-SLICE · U65 · pack QC 8/8). Conditions: honesty false · ≠ EMPCF DONE · ≠ 09d printable/closed-8 · DENY Nest dual / emp_custom_field / profile_groups_json primary / seed / reopen J-CORE-09D..01 / module CORE·personnel UAT. Next continuous: **UC-BP-CORE-03** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-03
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qc-01.md · stamp CORE02BQC1-MSLEFQC1 · Wave-17 UC-BP-CORE-02b SEALED · peer CORE09DQC1-MSLDR8I3 / CORE09CQC1-MSLBXMUT / CORE09BQC1-MSLB05DZ / CORE09AQC1-MSLA4LX9 / CORE08QC1-MSL9BFFE / CORE02QC1-MSL80DU6 / CORE01QC1-MSL6WMS7 / EMPCFQA-MSK14LUH / EMPTOKEXTQA-MSJ57PE1 must_keep · R-PLT-EMP-CF-FE-01 P2 HOLD RETAIN
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-02b (#19) = **UC-BP-CORE-03** (#20 QUEUED) «Checklist giấy tờ động (bắt buộc / tùy chọn)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03 · Diễn biến checklist động · AC document-type / employment-type open catalog · merge-token đăng ký khi Lưu loại giấy tờ (AC-PLT-EMP-TOK-*) · DB emp document types / checklist instances · must_keep CORE-02b EMP-CF four catalogs+KEY+soft-draft · must_keep CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 C&B · CORE-01 public · Nest /core DENY · DENY invent Nest emp_custom_field / mega-EAV / profile_groups_json primary as CORE-02b reopen

MISSION — SA Option seat (narrow):
1) Option A/B/C for dynamic document checklist (required/optional · open document-type catalog · employment-type open · position/dept from group catalog · TOK register on save) vs AS-IS LIVE — gap-only; DENY Nest /core dual · DENY wipe CORE-02b EMP-CF spine
2) F.1 API map + must_keep CORE-02b EMP-CF RETAIN · CORE-09d open TPL+clause · CORE-09c VER/PDF · CORE-09b pack+ephemeral PREV · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · DENY reopen sealed J-HRM-CORE-02B-01..04 / J-HRM-CORE-09D/09C/09B/09A/08/02/01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / hrm_personnel_uat_ready / personnel·CORE·CTR UAT · DENY claim CORE-02b = personnel UAT / EMPCF DONE · DENY claim CORE-09d printable/closed-8 DONE
3) Disposition: RETAIN cite LIVE document-type / checklist endpoints vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · Nest emp_custom_field · reopen sealed CORE-02b / CORE-09d / CORE-09c / CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · claim Wave-17 EMP-CF = personnel UAT · invent R-PLT-EMP-CF-FE-01 DONE without FE WI
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE02BQC1-MSLEFQC1` · 2026-08-09 · Wave-17 UC-BP-CORE-02b **SEALED GWC** ≠ module CORE / personnel UAT · ≠ EMPCF DONE · ≠ CORE-09d printable/closed-8 DONE · Nest `/core` DENY · Nest `emp_custom_field` DENY · `profile_groups_json` HOLD · `R-PLT-EMP-CF-FE-01` P2 HOLD
