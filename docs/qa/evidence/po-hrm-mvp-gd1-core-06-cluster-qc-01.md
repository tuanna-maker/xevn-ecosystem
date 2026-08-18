# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-06 C-SLICE only** · **not** module CORE / personnel UAT · **not** CORE-06 DONE · **not** invent CORE-07/PAY DONE · **not** printable DONE |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-20) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`CORE06QA2-MSLI95K8`** · prior FAIL **`CORE06QA1-MSLHUNCJ`** CLOSED · BE-02 **`CORE06BE2-MSLI26NR`** · FE-01 READY · API-01 CONFIRMED · peer QC **`CORE05QC1-MSLGVT40`** · **`CORE03QC1-MSLFJH0K`** · **`CORE02BQC1-MSLEFQC1`** · **`CORE09DQC1-MSLDR8I3`** … · Nest `/core` DENY |
| **uc_ids** | `UC-BP-CORE-06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-06-cluster-qa-02.md`](po-hrm-mvp-gd1-core-06-cluster-qa-02.md) · raw `_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-02.json` |
| **api_ref** | [`po-hrm-mvp-gd1-core-06-cluster-api-01.md`](po-hrm-mvp-gd1-core-06-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-BA-01.md) |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-SA-01.md) Option A |
| **be_fe_ref** | BE-02 [`po-hrm-mvp-gd1-core-06-cluster-be-02.md`](po-hrm-mvp-gd1-core-06-cluster-be-02.md) · FE-01 [`po-hrm-mvp-gd1-core-06-cluster-fe-01.md`](po-hrm-mvp-gd1-core-06-cluster-fe-01.md) |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-06-cluster-qa-02.json` · overall **PASS** · stamp **`CORE06QA2-MSLI95K8`** · Nest `/core` SoT non-404 **0** · nest_hits **2** (both **404**) · physical assets hits **38** · `seed_used=false` · defects **[]** |
| **stamp** | QC **`CORE06QC1-MSLID363`** · QA **`CORE06QA2-MSLI95K8`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` · FE Thêm cấp phát for fixture only |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · soft≠CORE-06 DONE · **≠ invent CORE-07/PAY DONE** · **≠ printable/closed-8 DONE** · **≠ personnel UAT** |
| **portal_url** | `http://127.0.0.1:8080` · Profile `/hr/employees/{id}?tab=assets` · hrm-api `:28001` · `companyId=main` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **Claim soft Profile / checklist CRUD = CORE-06 DONE** | **DENIED** | soft≠DONE · C-SLICE · mission DENY |
| **Invent CORE-07 / PAY DONE** | **DENIED** | board #23 QUEUED · PAY OUT invent |
| **Claim CORE-06 module DONE / FR DONE** | **DENIED** | C-SLICE seal ≠ module GO |
| **Printable / closed-8 DONE** | **DENIED** | must_keep CORE-09d..01 |
| **CORE-05 = personnel UAT / FR DONE** | **DENIED** | must_keep `CORE05QC1-MSLGVT40` |
| **CORE-03 = personnel UAT / EMP DOC L1 DONE** | **DENIED** | must_keep `CORE03QC1-MSLFJH0K` |
| **CORE-02b = EMPCF DONE** | **DENIED** | must_keep `CORE02BQC1-MSLEFQC1` |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual AST/TERM SoT** | **DENIED** | probe **404** · SoT non-404 **0** · QC spot `/api/hrm/core/…/assets` **404** |
| **Reopen sealed J-HRM-CORE-05 / 03 / 02B / 09D / 09C / 09B / 09A / 08 / 02 / 01** | **DENIED** | must_keep stamps |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **Dev invent schema/API this seat** | **DENIED** | seal only |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-20 return checklist GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM claim CORE-06 DONE / soft=DONE / personnel / printable DONE? | **NO** |
| May PM invent CORE-07 / PAY DONE from this seat? | **NO** |
| May PM claim CORE-05 = personnel · CORE-03 = personnel · CORE-02b = EMPCF · 09d printable/closed-8? | **NO** |
| May PM claim module CORE / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM open next UC seat **UC-BP-CORE-07** (board #23) as **sa Option**? | **YES** (U88/U89 continuous) |
| May PM treat `R-CORE-06-HONESTY` as FAIL this seat? | **NO** — **INFO** idle-ok · honesty locks RETAIN |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-06** (termination-return checklist on Profile tab Tài sản: GET `?status=assigned` **200** · soft-return / lost+notes · closed FE-derive · partial ALLOW · Nest `/core` **0** · soft≠DONE footer · physical `/employees/:id/assets*` · must_keep CORE-05 BB/serial/DELETE-FORBIDDEN) after QA stamp **`CORE06QA2-MSLI95K8`**.

Audited: QA-02 MD · raw JSON overall PASS · screens 01–09 · L0/L1/network/journeys J-01..05 · BA/SA/DATA/API · BE-02 status whitelist LIVE · FE-01 READY · peer must_keep CORE-05/03/02b/09d..01 · prior FAIL STATUS-QUERY-400 + CLOSED-FE-STALE **CLOSED** · DENY Nest `/core` · DENY claim CORE-06 DONE · DENY invent CORE-07/PAY · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** Tải đang giữ → GET assigned **200** `HRM-EMP-PROFILE-200` · Ghi mất PATCH **200** `lost`+notes F5 · soft≠DONE footer · partial return PATCH **200** closed=`0` · clear assigned → `data-asset-checklist-closed=1` · DELETE **409** DELETE-FORBIDDEN · serial **409** · Nest `/core` AST/TERM SoT **0** · honesty personnel/printable=false · C-SLICE · CORE-07 QUEUED.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · INFO **`R-CORE-06-HONESTY`** only open residual · J-03 `feClearedAll=false` loops=1 (API assist leftover assigned) — closed badge still derived after GET assigned **200** · process OBS only.

**NOT Phase 1 DONE. NOT module CORE / personnel UAT. NOT CORE-06 DONE. NOT invent CORE-07/PAY DONE. NOT printable DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-06-01..05 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| P0 STATUS-QUERY-400 CLOSED · GET assigned **200** | PRODUCT | **ACCEPT** · CLOSED |
| P0/P1 CLOSED-FE-STALE · `data-asset-checklist-closed=1` | PRODUCT | **ACCEPT** · CLOSED |
| soft≠DONE footer · lost+notes · partial · Nest `/core` 0 | PRODUCT | **ACCEPT** |
| Physical `/employees/:id/assets*` · Nest `/core` 0 | PRODUCT | **ACCEPT** · DENY Nest dual |
| Invent CORE-06/07/PAY DONE · honesty flip | PRODUCT / GOVERNANCE | **ACCEPT** · DENY |
| `R-CORE-06-HONESTY` | GOVERNANCE **INFO** | **ACCEPT** idle-ok · not FAIL |
| J-03 API-assist clear loop | PROCESS OBS | **ACCEPT** non-block |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 GET `?status=assigned` **200** · rows assigned · soft≠DONE · Nest `/core` 0 | QA J-01 · JSON statusProbe **200** `HRM-EMP-PROFILE-200` · nest_sot=0 | 🟢 |
| 2 | J-02 lost+notes PATCH **200** F5 · footer soft≠DONE | QA J-02 · footerText soft≠CORE-06 DONE · `data-honesty-soft-ne-done` | 🟢 |
| 3 | J-03 closed badge after assigned=0 · `data-asset-checklist-closed=1` | QA J-03 · attrs closed=`1` count=0 · loadGET **200** | 🟢 |
| 4 | J-04 partial return · closed=`0` · remaining ≥1 | QA J-04 · PATCH returned+return_date **200** | 🟢 |
| 5 | J-05 Nest deny · CORE-05 seals · honesty · CORE-07 QUEUED | QA J-05 · nestSot=0 · del/serial **409** · honestyFalse · CORE07=QUEUED | 🟢 |
| 6 | Residual P0 | none · STATUS-QUERY + CLOSED-FE-STALE CLOSED · INFO honesty only | 🟢 non-block |
| 7 | soft≠DONE · C-SLICE ≠ module · ≠ invent CORE-07/PAY · honesty false | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 8 | DENY Nest `/core` · reopen J-CORE-05/03/02B/09D..01 · seed · Dev invent | QA DENY + nest Sot **0** · QC curl core **404** · `seed_used=false` | 🟢 **RETAIN** |
| 9 | Pack BA/SA/DATA/API/QA/BE-02/FE-01 | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-02.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-05/03/02b/09d) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos **200** · portal `:8080` **302** (ok) |
| QC Nest `/core` spot | `/api/hrm/core/…/assets` **404** · physical route exists (**401** unauth) · Nest SoT non-404 **0** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos **200** · portal **302** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical assets | nest404 · sot_non404=**0** · physical assets hits **38** | PRODUCT |
| QA runner U65 J-01..05 | overall **PASS** stamp `CORE06QA2-MSLI95K8` | PRODUCT |
| Network physical | GET assigned **200** · PATCH return/lost **200** · DELETE **409** · serial **409** · Nest `/core` SoT **0** | PRODUCT |
| QC curl Nest `/core` | core assets/term **404** · hrm root **200** | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:8080` Profile `/hr/employees/{id}?tab=assets` · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-06-01..05** 🟢 |
| 6 | crud_or_matrix | ✅ AC-CORE-06-* · F-CORE-AST-02 · TERM-CHK · CLOSED FE-derive · Nest DENY · soft≠DONE |
| 7 | residual_section | ✅ below · INFO honesty · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-06-01** | **PASS** | GET `?status=assigned` **200** · assigned-only · soft≠DONE · Nest `/core` 0 · P0 STATUS-QUERY CLOSED |
| **J-HRM-CORE-06-02** | **PASS** | lost+notes PATCH **200** F5 · footer soft≠CORE-06 DONE |
| **J-HRM-CORE-06-03** | **PASS** | assigned=0 · `data-asset-checklist-closed=1` · closed badge · P0 CLOSED-FE-STALE CLOSED |
| **J-HRM-CORE-06-04** | **PASS** | partial return · closed=`0` · remaining ≥1 |
| **J-HRM-CORE-06-05** | **PASS** | Nest deny · DELETE/serial **409** · CORE-05 seals RETAIN · honesty false · CORE-07 QUEUED |
| Module CORE / personnel UAT J-* promote | **DENIED** | C-SLICE |
| Claim CORE-06 DONE · invent CORE-07/PAY DONE · printable DONE | **DENIED** | OUT invent |
| **J-HRM-CORE-05-*** / **03-*** / **02B-*** / **09D-*** / **09C-*** / **09B-*** / **09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-06-01 | **PASS** |
| J-HRM-CORE-06-02 | **PASS** |
| J-HRM-CORE-06-03 | **PASS** |
| J-HRM-CORE-06-04 | **PASS** |
| J-HRM-CORE-06-05 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-06-cluster-qa-02/` — 01-assets-tab … 09-done (cited in QA-02 JSON).

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-06-01..05 with QC stamp **`CORE06QC1-MSLID363`** (QA already 🟢 PASS · C-SLICE · honesty false · soft≠DONE · **≠** claim CORE-06 DONE). Update continuous board Wave-20 **SEALED GWC** · next **UC-BP-CORE-07** SA (#23).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · **`hrm_personnel_uat_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim CORE-06 DONE · soft Profile alone = CORE-06 DONE · invent CORE-07/PAY DONE · printable/closed-8 · CORE-05=personnel · CORE-03=personnel · CORE-02b=EMPCF · seed · reopen sealed J-HRM-CORE-05-* / J-HRM-CORE-03-* / J-HRM-CORE-02B-* / J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition INFO `R-CORE-06-HONESTY`:** C-SLICE · soft≠CORE-06 DONE · CORE-05≠personnel · CORE-07/PAY QUEUED — **ACCEPT** non-blocking · locks RETAIN.
3. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
4. **Condition OBS J-03 clear assist:** `feClearedAll=false` loops=1 — closed derive still PASS — **ACCEPT** non-block.
5. **RETAIN** physical `/api/hrm/employees/:id/assets*` · F-CORE-AST-02 soft-return/lost · TERM-CHK from assigned · CLOSED FE-derive · must_keep CORE-05 BB/serial/DELETE-FORBIDDEN · CORE-03 checklist DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · CORE-09c VER/PDF ≠ printable · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · EMPPLAT/EMPTOK seals · U19 J-05.
6. **OUT** this seat: invent CORE-07 activation DONE · invent PAY-07 ack DONE · invent Nest `/core` AST/TERM dual · claim soft-return alone = CORE-06 DONE · claim CORE-05 = personnel UAT · claim printable DONE · module CORE UAT.
7. **NOT** Phase 1 DONE · **NOT** module CORE / personnel UAT · Wave-20 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-CORE-06-HONESTY** | INFO | OPEN / idle-ok | **qc/pm** — DENY flip · C-SLICE locks |
| **R-CORE-06-STATUS-QUERY-400** | — | **CLOSED** | BE-02 / QA-02 |
| **R-CORE-06-CLOSED-FE-STALE** | — | **CLOSED** | FE-01 / QA-02 |
| Honesty / C-SLICE / soft≠DONE / ≠ invent CORE-07/PAY / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-06-01..05 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / **`hrm_personnel_uat_ready`** / claim module CORE / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual AST/TERM SoT  
- Claim CORE-06 DONE (soft Profile / checklist CRUD alone ≠ FR DONE / module GO)  
- Invent CORE-07 / PAY DONE  
- Claim CORE-05 = personnel UAT · CORE-03 = personnel · CORE-02b = EMPCF DONE · CORE-09d printable/closed-8 DONE  
- Seed / reopen sealed J-HRM-CORE-05-* / J-HRM-CORE-03-* / J-HRM-CORE-02B-* / J-HRM-CORE-09D-* / J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Dev invent schema/API/endpoints this seat · treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #23 **UC-BP-CORE-07** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-06: J-HRM-CORE-06-01..05 PASS (GET assigned **200** · lost+notes · closed FE-derive · partial · soft≠DONE footer · Nest `/core` 0 · physical assets* · CORE-05 seals RETAIN · P0 STATUS-QUERY + CLOSED-FE-STALE CLOSED · honesty false · C-SLICE · U65 · pack QC 8/8). Conditions: honesty false · soft≠CORE-06 DONE · ≠ invent CORE-07/PAY · DENY Nest dual / seed / reopen J-CORE-05/03/02B/09D..01 / module CORE·personnel UAT. INFO R-CORE-06-HONESTY idle-ok. Next continuous: **UC-BP-CORE-07** SA Option (U88). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-07
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qc-01.md · stamp CORE06QC1-MSLID363 · Wave-20 UC-BP-CORE-06 SEALED · QA CORE06QA2-MSLI95K8 · BE CORE06BE2-MSLI26NR · peer CORE05QC1-MSLGVT40 / CORE03QC1-MSLFJH0K / CORE02BQC1-MSLEFQC1 / CORE09DQC1-MSLDR8I3 / CORE09CQC1-MSLBXMUT / CORE09BQC1-MSLB05DZ / CORE09AQC1-MSLA4LX9 / CORE08QC1-MSL9BFFE / CORE02QC1-MSL80DU6 / CORE01QC1-MSL6WMS7 / EMPPLATQA-MSIZXHIM / EMPTOKQA-MSJ290VB must_keep · R-CORE-06-HONESTY INFO RETAIN idle-ok · soft≠CORE-06 DONE RETAIN
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-06 (#22) = **UC-BP-CORE-07** (#23 QUEUED) «Kích hoạt hồ sơ Hoạt động khi checklist đủ» · CORE-09/10 remain QUEUED · PAY OUT invent DONE
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 · Diễn biến checklist đủ → chuyển PENDING→ENABLED · BR-BP-LC-02 · phụ thuộc CORE-03 checklist giấy tờ · must_keep CORE-06 soft≠DONE + TERM-CHK/CLOSED FE-derive · must_keep CORE-05 assets physical + BB · Nest /core DENY · DENY invent PAY DONE · DENY claim CORE-06 = personnel UAT / FR DONE · DENY printable flip · DENY claim soft Profile alone = CORE-06 DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for employee activation when required document checklist complete (PENDING→ENABLED / Hoạt động) vs AS-IS LIVE — gap-only; DENY Nest /core dual · DENY wipe CORE-06 return checklist / CORE-05 assets / CORE-03 DOC-CHK · DENY invent PAY/CORE-09 DONE
2) F.1 API map + must_keep CORE-06 RETAIN (physical assets soft-return · assigned query · closed FE-derive · soft≠DONE) · CORE-05/03/02b/09d..01 · DENY reopen sealed J-HRM-CORE-06-01..05 / J-HRM-CORE-05 / J-HRM-CORE-03 / J-HRM-CORE-02B / J-HRM-CORE-09D..01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / hrm_personnel_uat_ready / personnel·CORE·CTR UAT · DENY claim CORE-06 DONE · DENY claim printable/closed-8 DONE
3) Disposition: RETAIN cite LIVE activate path vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note checklist đủ ≠ claim CORE-07 module DONE · CORE-06 soft≠DONE RETAIN
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · reopen sealed CORE-06 / CORE-05 / CORE-03 / CORE-02b / CORE-09d / CORE-09c / CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · claim Wave-20 return = CORE-06 DONE / soft=DONE / personnel UAT · invent PAY DONE · invent CORE-09 DONE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE06QC1-MSLID363` · 2026-08-09 · Wave-20 UC-BP-CORE-06 **SEALED GWC** ≠ module CORE / personnel UAT · ≠ CORE-06 DONE · soft≠DONE · ≠ invent CORE-07/PAY DONE · ≠ printable DONE · Nest `/core` DENY · `R-CORE-06-HONESTY` INFO
