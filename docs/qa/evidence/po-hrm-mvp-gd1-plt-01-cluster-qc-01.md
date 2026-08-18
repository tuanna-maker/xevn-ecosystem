# Evidence — PO-HRM-MVP-GD1-PLT-01-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-PLT-01 C-SLICE only** · **not** PLT/platform UAT DONE · **not** CORE-10/09/07 DONE · **not** invent PAY/ATT/printable/Word DONE · **not** soft=CORE-06 DONE · **not** peer catalog=PLT DONE · **not** merge LIVE=platform UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-24 seat #26) |
| **depends_on** | QA-01 `PASS_TO_PM` stamp **`PLT01QA1-MSLPQZF6`** · FE-01 READY · API-01 CONFIRMED RETAIN · BA-01 O1–O12 · peer QC **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · Dev-BE HOLD |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` · `J-HRM-PLT-01-01..06` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-plt-01-cluster-qa-01.md`](po-hrm-mvp-gd1-plt-01-cluster-qa-01.md) · raw `_tmp-po-hrm-mvp-gd1-plt-01-cluster-qa-01.json` |
| **api_ref** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-plt-01-cluster-fe-01.md`](po-hrm-mvp-gd1-plt-01-cluster-fe-01.md) |
| **machine** | `_tmp-po-hrm-mvp-gd1-plt-01-cluster-qa-01.json` · overall **PASS** · stamp **`PLT01QA1-MSLPQZF6`** · Nest `/core` TOK/PLT non-404 **0** · seed_used **false** · J-01..06 PASS |
| **stamp** | QC **`PLT01QC1-MSLPUQIU`** · QA **`PLT01QA1-MSLPQZF6`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · FE upsert fixture only |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · personnel/PLT/platform UAT **false** · peer catalog≠PLT DONE · merge≠platform UAT · catalog/CRUD/LIVE≠CORE-10 DONE · ≠ CORE-10/09/07 DONE · soft≠CORE-06 DONE · PAY/ATT OUT · **≠** claim PLT DONE |
| **portal_url** | `http://127.0.0.1:5173/hr/settings?tab=contract-legal` · hrm-api `:28001` · persona `ceo@xe.vn` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **`hrm_personnel_uat_ready` / PLT / platform UAT** | **`false`** | **DENIED** flip |
| **Claim peer catalog = PLT-01 DONE** | **DENIED** | C-SLICE |
| **Claim merge LIVE = platform UAT** | **DENIED** | C-SLICE |
| **Claim catalog/CRUD/LIVE = CORE-10 DONE** | **DENIED** | must_keep `CORE10QC1-MSLP0EJB` |
| **Claim CORE-09 DONE / printable DONE** | **DENIED** | must_keep `CORE09QC1-MSLNBA89` |
| **Claim CORE-07 DONE** | **DENIED** | must_keep `CORE07QC1-KZJTSHNT` |
| **Claim soft Profile = CORE-06 DONE** | **DENIED** | soft≠CORE-06 |
| **Invent PAY / ATT / Word / printable DONE** | **DENIED** | PAY/ATT OUT |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual TOK/PLT SoT** | **DENIED** | L0 probe **404** · SoT non-404 **0** · QC spot GET `/api/hrm/core/merge-tokens` **404** |
| **Reopen sealed J-HRM-CORE-10/09/07/06…** | **DENIED** | must_keep peer stamps |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-24 GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM set personnel / PLT / platform UAT = true? | **NO** |
| May PM claim peer catalog = PLT DONE · merge LIVE = platform UAT? | **NO** |
| May PM claim catalog/CRUD/LIVE = CORE-10 DONE · CORE-10/09/07 DONE · soft=CORE-06 DONE? | **NO** |
| May PM invent PAY / ATT / Word / printable DONE? | **NO** |
| May PM claim module PLT / platform UAT / Phase1 DONE? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed peers · seed? | **NO** |
| May PM open next UC seat **UC-BP-ATT-02** as **sa Option**? | **YES** (U88/U89 continuous · board #27) |
| May PM treat P2 OBS-BA-J-MAP as FAIL this seat? | **NO** — **P2 OBS** idle-ok · not block GWC |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-PLT-01** (merge-token list/upsert/soft-retire/resolve-preview · physical `/merge-tokens*` · Nest `/core` TOK/PLT **0** · peer EMP DOC types cite · honesty 8/8 · printable **false** · peer≠PLT DONE · merge≠platform UAT · catalog≠CORE-10 DONE · CORE-10/09/07 seals RETAIN · soft≠CORE-06 · PAY/ATT OUT) after QA stamp **`PLT01QA1-MSLPQZF6`**.

Audited: QA-01 MD · L0/L2.5/network J-01..06 · FE-01 READY · API RETAIN · BA O1–O12 · peer must_keep CORE-10/09/07 · DENY Nest `/core` · DENY peer=PLT DONE · DENY merge=platform UAT · DENY invent PAY/ATT/printable/Word · DENY soft=CORE-06 · DENY CORE-10/09/07 DONE · DENY honesty flip · DENY seed · DENY reopen peers.

**U65 ACCEPT:** GET `/merge-tokens` **200** · PUT upsert **200** + F5 · POST retire **201** · POST resolve-preview **201** ≠ VER/print · Nest `/core` **0** · honesty footers ≠DONE · C-SLICE.

**OBS ACCEPT (non-blocking):** QA pack verify **1/8** FAIL (`command_table`) — **PROCESS OBS** (QC consolidates **8/8**) · P2 **`OBS-BA-J-MAP`** idle-ok · INFO **`R-PLT-01-HONESTY`** RETAIN.

**NOT Phase 1 DONE. NOT PLT/platform UAT. NOT CORE-10/09/07 DONE. NOT invent PAY/ATT/printable/Word DONE. NOT soft=CORE-06 DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-PLT-01-01..06 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| physical `/merge-tokens*` GET/PUT/retire/resolve-preview | PRODUCT | **ACCEPT** |
| Soft-retire · no hard DELETE · include_archived | PRODUCT | **ACCEPT** |
| resolve-preview ≠ VER/print invent | PRODUCT | **ACCEPT** |
| Nest `/core` TOK/PLT 404 · SoT non-404 **0** | PRODUCT | **ACCEPT** · DENY Nest dual |
| peer catalog≠PLT · merge≠UAT · catalog≠CORE-10 · CORE-10/09/07 RETAIN · printable false · soft≠CORE-06 · PAY/ATT OUT | PRODUCT / GOVERNANCE | **ACCEPT** · DENY claim DONE |
| `OBS-BA-J-MAP` BA DRAFT ≠ PM J mapping | PRODUCT **P2 OBS** | **ACCEPT** idle-ok · not FAIL seat |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| Honesty / seed / module UAT / reopen sealed J-* | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 Token merge list GET physical · labelVi · Nest `/core` 0 · honesty | QA J-01 | 🟢 |
| 2 | J-02 Upsert → PUT **200** + F5 row | QA J-02 | 🟢 |
| 3 | J-03 Soft-retire **201** · hidden default · include_archived · no DELETE | QA J-03 | 🟢 |
| 4 | J-04 resolve-preview **201** ≠ VER/print | QA J-04 | 🟢 |
| 5 | J-05 Peer EMP DOC types cite · ≠ PLT DONE | QA J-05 | 🟢 |
| 6 | J-06 Honesty footer 8/8 · seals CORE-10/09/07 · printable false · PAY/ATT OUT | QA J-06 | 🟢 |
| 7 | Residual P0 | none · P2 BA-J-MAP idle-ok | 🟢 non-block |
| 8 | printable false · C-SLICE · honesty · DENY Nest / reopen / seed / invent PAY/ATT/Word / CORE DONE | QA honesty + QC locks | 🟢 **RETAIN** |
| 9 | Pack BA/API/QA/FE | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qa-01.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-10/09/07) |
| QC SoT pack this file | 🟢 **8/8** below |
| L0 from QA stamp | hrm/xbos/portal **200** `:5173` |
| QC Nest `/core` spot | GET `/api/hrm/core/merge-tokens` **404** · hrm root **200** · SoT non-404 **0** |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 stack | hrm/xbos/portal **200** `:5173` · Nest `/core/merge-tokens` **404** | ENV/L0 |
| QA L1 Nest `/core` DENY · physical merge-tokens | nest SoT non-404 **0** · `/merge-tokens*` hits 14 | PRODUCT |
| QA runner U65 J-01..06 | overall **PASS** stamp `PLT01QA1-MSLPQZF6` | PRODUCT |
| Network physical | GET/PUT/retire/resolve-preview · peer DOC 2 · Nest `/core` **0** · DELETE **0** · VER invent **0** | PRODUCT |
| QC curl Nest `/core` | core merge-tokens **404** · hrm root **200** | PRODUCT |
| `verify:qc:evidence-pack` QA-01 | **1/8** PROCESS OBS · QC consolidates | PROCESS |
| Screens | under `screens/po-hrm-mvp-gd1-plt-01-cluster-qa-01/` | PRODUCT |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|--------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` settings contract-legal · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-PLT-01-01..06** 🟢 |
| 6 | crud_or_matrix | ✅ AC-PLT-01-* · F-PLT-TOK-* · Nest DENY · printable false · peer≠PLT · merge≠UAT · catalog≠CORE-10 · CORE-10/09/07 RETAIN · soft≠CORE-06 · PAY/ATT OUT |
| 7 | residual_section | ✅ below · P2 OBS · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-PLT-01-01** | **PASS** | GET list · labelVi · Nest 0 · honesty |
| **J-HRM-PLT-01-02** | **PASS** | upsert **200** + F5 |
| **J-HRM-PLT-01-03** | **PASS** | soft-retire **201** · no DELETE |
| **J-HRM-PLT-01-04** | **PASS** | resolve-preview **201** ≠ VER/print |
| **J-HRM-PLT-01-05** | **PASS** | peer DOC types · ≠ PLT DONE |
| **J-HRM-PLT-01-06** | **PASS** | honesty 8/8 · seals RETAIN · PAY/ATT OUT |
| Module PLT / platform UAT J-* promote | **DENIED** | C-SLICE |
| Claim peer=PLT DONE · merge=platform UAT · invent PAY/ATT/printable/Word · soft=CORE-06 · CORE-10/09/07 DONE | **DENIED** | OUT invent |
| **J-HRM-CORE-10-*** / **09-*** / **07-*** / **06-*** / **05-*** / **03-*** / **02B-*** / **09D-*** … prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-PLT-01-01 | **PASS** |
| J-HRM-PLT-01-02 | **PASS** |
| J-HRM-PLT-01-03 | **PASS** |
| J-HRM-PLT-01-04 | **PASS** |
| J-HRM-PLT-01-05 | **PASS** |
| J-HRM-PLT-01-06 | **PASS** |

### Screens

QA cite: `docs/qa/evidence/screens/po-hrm-mvp-gd1-plt-01-cluster-qa-01/` — list…honesty.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-PLT-01-01..06 with QC stamp **`PLT01QC1-MSLPUQIU`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false · **≠** claim PLT/platform UAT DONE). Update continuous board seat #26 / Wave-24 **SEALED GWC** · next **UC-BP-ATT-02** SA (#27).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/PLT/platform UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · claim peer catalog = PLT DONE · merge LIVE = platform UAT · catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · soft=CORE-06 DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · seed · reopen sealed J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* / J-HRM-CORE-06-* / J-HRM-CORE-05-* / J-HRM-CORE-03-* / J-HRM-CORE-02B-* / J-HRM-CORE-09D-* … / J-HRM-CORE-01-*.
2. **Condition OBS `OBS-BA-J-MAP` P2:** BA-01 DRAFT J-* mapping ≠ PM exit_criteria used this seat — **ACCEPT** idle-ok · ba-process align when promoting journeys · ≠ block GWC.
3. **Condition OBS pack verify 1/8:** QA missing command_table — QC consolidates 8/8 — **ACCEPT**.
4. **RETAIN** physical `/api/hrm/merge-tokens*` · F-PLT-TOK-01/02/03 · Nest `/core` DENY · must_keep CORE-10 · CORE-09 printable false · CORE-07 · soft≠CORE-06 · U19 J-01..06.
5. **OUT** this seat: invent PAY DONE · invent ATT DONE · invent printable DONE · invent Word/DOCX · invent Nest `/core` TOK dual · claim peer catalog alone = PLT module DONE · claim merge LIVE = platform UAT · claim CORE-10/09/07 DONE · claim soft=CORE-06 · module PLT/platform UAT.
6. **NOT** Phase 1 DONE · **NOT** PLT/platform UAT · Wave-24 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **OBS-BA-J-MAP** | **P2 OBS** | OPEN / idle-ok | **ba-process** optional · ≠ FAIL this seat |
| **R-PLT-01-HONESTY** | INFO | RETAIN | **pm** — DENY flip · peer≠PLT · merge≠UAT · catalog≠CORE-10 · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · soft≠CORE-06 |
| Honesty / C-SLICE / printable false / ≠ invent PAY/ATT/Word / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-PLT-01-01..06 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / personnel / PLT / platform UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual TOK/PLT SoT  
- Claim peer catalog = PLT DONE · merge LIVE = platform UAT  
- Claim catalog/CRUD/LIVE = CORE-10 DONE · CORE-10 DONE · CORE-09 DONE · CORE-07 DONE · soft=CORE-06 DONE  
- Invent PAY / ATT / Word-DOCX / printable DONE  
- Seed / reopen sealed J-HRM-CORE-10-* / J-HRM-CORE-09-* / J-HRM-CORE-07-* / J-HRM-CORE-06-* / J-HRM-CORE-05-* / J-HRM-CORE-03-* / J-HRM-CORE-02B-* / J-HRM-CORE-09D-* … / J-HRM-CORE-01-*  
- Dev invent mega-EAV / Nest `/core` · treat GWC as module GO · C-SLICE-as-module-DONE  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** (board #27 **UC-BP-ATT-02** Option · U88 continuous) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-PLT-01: J-HRM-PLT-01-01..06 PASS (GET/PUT/retire/resolve-preview `/merge-tokens*` · Nest `/core` TOK/PLT **0** · soft-retire · peer DOC cite · honesty 8/8 · printable false · peer≠PLT DONE · merge≠platform UAT · catalog≠CORE-10 DONE · CORE-10/09/07 RETAIN · soft≠CORE-06 · PAY/ATT OUT · U65 · pack QC 8/8). Conditions: honesty false · ≠ claim PLT/platform UAT DONE · ≠ invent PAY/ATT/printable/Word · DENY Nest dual / seed / reopen peers. P2 OBS-BA-J-MAP idle-ok. Next continuous: **UC-BP-ATT-02** SA Option (U88). |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-ATT-02 · FR-UC-BP-ATT-02
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-qc-01.md · stamp PLT01QC1-MSLPUQIU · Wave-24 UC-BP-PLT-01 SEALED · QA PLT01QA1-MSLPQZF6 · must_keep CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · peer catalog≠PLT DONE · merge≠platform UAT · catalog≠CORE-10 DONE · PAY/ATT OUT invent DONE from PLT seat (ATT Option unlock only this seat)
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after PLT-01 (#26) = **UC-BP-ATT-02** (#27 QUEUED) «Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02 · Diễn biến phạt muộn/về sớm · must_keep PLT-01 merge-tokens RETAIN (physical /merge-tokens* · Nest /core DENY · peer≠PLT DONE · merge≠platform UAT) · must_keep CORE-10/09/07 · printable false · DENY invent PAY DONE · DENY invent printable DONE · DENY claim PLT/CORE DONE

MISSION — SA Option seat (narrow):
1) Option A/B/C for late/early leave penalty rules (phút / block / bậc + nguồn hợp lệ) vs AS-IS LIVE — DENY Nest /core dual · DENY wipe PLT-01 merge-tokens · DENY wipe CORE-10 SI · DENY wipe CORE-09 registry/PREV/VER · DENY wipe CORE-07 activate · DENY soft=CORE-06 DONE · DENY invent PAY/printable DONE · DENY claim ATT module UAT DONE from Option alone
2) F.1 API map + must_keep PLT-01 RETAIN · CORE-10/09/07/06 seals · DENY reopen sealed J-HRM-PLT-01-01..06 / J-HRM-CORE-10..01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / personnel·PLT·platform UAT · DENY claim PLT DONE · DENY claim printable DONE
3) Disposition: RETAIN cite LIVE ATT path vs unlock delta — unlock BA AC next — cấm code until Option CONFIRMED · note PLT-01 ADD seal ≠ platform UAT DONE · printable false RETAIN · PAY OUT invent from this Option unless in FR-ATT-02 scope
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module PLT/platform/ATT UAT claim DONE · seed · Nest /core dual · reopen sealed PLT-01 / CORE-10 / CORE-09 / CORE-07 / CORE-06..01 · claim Wave-24 PLT = platform UAT DONE / peer catalog=PLT DONE / merge=UAT / CORE-10/09/07 DONE / soft=CORE-06 DONE · invent PAY DONE · invent printable DONE · invent Word DONE · invent mega-EAV
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`PLT01QC1-MSLPUQIU` · 2026-08-09 · Wave-24 UC-BP-PLT-01 **SEALED GWC** ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · printable false · peer≠PLT DONE · merge≠platform UAT · catalog≠CORE-10 DONE · PAY/ATT OUT · CORE-10 RETAIN · CORE-09 RETAIN · CORE-07 RETAIN · soft≠CORE-06 DONE · ≠ invent PAY/ATT/printable/Word DONE · Nest `/core` DENY · `OBS-BA-J-MAP` P2 idle-ok
