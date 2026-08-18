# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-09d C-SLICE only** · **not** module CORE / CTR / personnel UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-16) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`CORE09DQA2-MSLDM40Y`** · FE-02 READY · peer QC **`CORE09CQC1-MSLBXMUT`** |
| **uc_ids** | `UC-BP-CORE-09d` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-core-09d-cluster-qa-02.md`](po-hrm-mvp-gd1-core-09d-cluster-qa-02.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-core-09d-cluster-fe-02.md`](po-hrm-mvp-gd1-core-09d-cluster-fe-02.md) |
| **api_ref** | [`po-hrm-mvp-gd1-core-09d-cluster-api-01.md`](po-hrm-mvp-gd1-core-09d-cluster-api-01.md) · [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md) |
| **data_ref** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md) |
| **sa_ref** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-02.json` · overall **PASS** · stamp **`CORE09DQA2-MSLDM40Y`** · Nest `/core` **0** · `bodyOmitOk=true` · PUT clauses **200** ×2 |
| **stamp** | QC **`CORE09DQC1-MSLDR8I3`** · QA **`CORE09DQA2-MSLDM40Y`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` · `seed_used=false` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **≠ closed-8 TPL DONE** · **≠ CORE-09c printable DONE** |
| **portal_url** | `http://127.0.0.1:5173` · Settings `?tab=contract-legal` · Contracts · hrm-api `:28001` · `companyId=main` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** | **DENIED** flip |
| **Personnel / CORE / CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **closed-8 TPL catalog DONE** | **DENIED** | open catalog >8 · starter 8 = examples only |
| **CORE-09c VER/PDF = printable DONE** | **DENIED** | must_keep peer `CORE09CQC1-MSLBXMUT` |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/core` dual SoT** | **DENIED** | L1 Cannot GET · browser **0** hits |
| **Reopen sealed J-HRM-CORE-09C / 09B / 09A / 08 / 02 / 01** | **DENIED** | must_keep stamps CORE09CQC1 / CORE09BQC1 / CORE09AQC1 / CORE08QC1 / CORE02QC1 / CORE01QC1 |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed · `seed_used=false` |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-16 open TPL + clause bind GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM set `contracts_printable_ready=true`? | **NO** |
| May PM claim module CORE / CTR / personnel UAT / Phase1 DONE from this seat? | **NO** |
| May PM claim closed-8 TPL DONE? | **NO** |
| May PM claim CORE-09c VER/PDF = printable DONE? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM invent Nest `/core` dual · reopen sealed J-CORE-09C/09B/09A/08/02/01? | **NO** |
| May PM open next UC seat **UC-BP-CORE-02b** (board #19) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-CORE-09d** (open TPL catalog Settings 9+ · picker PREV ephemeral · IT/DRIVER clause bind via PATCH omit `company_id` + PUT `…/clauses` · matrix=xevn · Nest `/core` 0 · physical `/contracts-insurance/*`) after QA stamp **`CORE09DQA2-MSLDM40Y`**.

Audited: QA-02 MD · raw JSON · screens 01–14 · L0/L1/network/journeys · BA/SA/DATA/API · FE-02 · peer must_keep `CORE09CQC1-MSLBXMUT` · DENY Nest `/core` · DENY printable flip · DENY closed-8 DONE · DENY CORE-09c=printable DONE.

**U65 ACCEPT:** Settings → Tạo `TPL_CORE09D-LDM40Y` POST **201** + PUT clauses **200** · F5 · activate **201** · Hợp đồng picker #9+ PREV **201** ephemeral (no VER INSERT) · edit `XEVN_FT_12M_OFFICE`/`DRIVER` → PATCH **200** body **`company_id` absent** (`bodyOmitOk=true`) → PUT `…/clauses` **200** ×2 · F5 `clauses[]=1` distinct (`55674fcc…` ≠ `3cbc360e…`) · CODE-INVALID format toast · matrix=xevn **200** family **8** · Nest `/core` **0** · honesty printable=false.

**OBS ACCEPT (non-blocking):** QA pack `command_table` **1/8 PROCESS OBS** (QC consolidates **8/8**) · **P2** `R-QA-CORE-09D-DND-STORM` (~1020 drag-handle storms — UF bind PASS via palette/dnd=1) · **P2** activate-btn historical flaky (this run activate **201** OK) · Windows UV assert after `qc:dev-stack` health **200** (ENV).

**CLOSED this seat:** `R-FE-CORE-09D-PATCH-COMPANY-ID` (P0) · `R-QA-CORE-09B-CLAUSE-FP-EMPTY` (OBS carry from 09b).

**NOT Phase 1 DONE. NOT module CORE / CTR / personnel UAT. NOT printable ready. NOT closed-8 TPL DONE. NOT CORE-09c printable DONE.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-CORE-09D-01..04 browser U65 | PRODUCT L2.5 | **ACCEPT** this seat |
| PATCH body omit `company_id` + PUT …/clauses 200 | PRODUCT | **ACCEPT** · P0 CLOSED |
| Open catalog >8 · matrix=xevn family 8 · PREV ephemeral | PRODUCT | **ACCEPT** |
| Nest `/core` dual · 0 browser hits · L1 Cannot GET | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | PRODUCT | **CLOSED** — F5 distinct IT vs DRIVER |
| `R-QA-CORE-09D-DND-STORM` | PRODUCT **P2 OBS** | **ACCEPT** idle-ok · not blocking J-* |
| `R-QA-CORE-09D-ACTIVATE-BTN` | PRODUCT **P2 OBS** | **ACCEPT** · this run activate 201 OK |
| QA pack command_table missing | PROCESS OBS | **ACCEPT** · QC consolidates 8/8 |
| `qc:dev-stack` health 200 then Windows UV assert | ENV | **OBS** — health checks PASS |
| Honesty / seed / printable / closed-8 / CORE-09c=printable / module UAT | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | J-01 Settings create #9+ POST 201 + PUT clauses + F5 + activate | QA J-01 · JSON · screens 01–04 · id `7d35722e-…` | 🟢 |
| 2 | J-02 Contracts picker #9+ PREV 201 ephemeral · no VER · Nest 0 | QA J-02 · JSON · screens 11–13 · `verPost=false` | 🟢 |
| 3 | J-03 PATCH omit `company_id` + PUT clauses ×2 · F5 distinct IDs | QA J-03 · `bodyOmitOk=true` · `hasCid:false` · screens 07–10 | 🟢 |
| 4 | J-04 bad-format toast · matrix=xevn · open catalog · honesty seals | QA J-04 · screens 05–06 · 14 · printable=false · closed8=false | 🟢 |
| 5 | Residual P0 | none open · P2 DnD storm only | 🟢 non-block |
| 6 | C-SLICE ≠ module · honesty false · printable false · ≠closed-8 · ≠09c=printable | QA honesty + QC locks · JSON flags | 🟢 **RETAIN** |
| 7 | DENY Nest `/core` dual · reopen J-CORE-09C/09B/09A/08/02/01 · seed | QA DENY + QC locks · `seed_used=false` · nest=[] | 🟢 **RETAIN** |
| 8 | Pack BA/SA/DATA/API/FE/QA | specs + evidence present · QC consolidates **8/8** | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-02.md` | exit **1** · **1/8** FAIL `command_table` — **PROCESS OBS** (known class · peer CORE-09c/09b/09a) |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV assert after PASS — ENV OBS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA L0 + QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 contract-templates · Nest `/core` DENY · matrix=xevn · open catalog >8 | TPL **200** active **38** · Nest Cannot GET · matrix family **8** | PRODUCT |
| QA runner U65 J-01..04 | overall **PASS** stamp `CORE09DQA2-MSLDM40Y` | PRODUCT |
| PATCH body audit (JSON) | `bodyOmitOk=true` · `hasCid:false` · PUT clauses **200** ×2 | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **1/8** command_table PROCESS OBS · QC consolidates | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ `:5173` Settings/Contracts · `:28001` |
| 5 | journey_l25 | ✅ **J-HRM-CORE-09D-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC open TPL · F-CORE-CTR-TPL-01/02 · PUT clauses · Nest DENY · matrix=xevn |
| 7 | residual_section | ✅ below · P2 DnD idle-ok · no P0 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-CORE-09D-01** | **PASS** | Settings create `TPL_CORE09D-LDM40Y` POST **201** + PUT clauses **200** · F5 · activate **201** · Nest 0 |
| **J-HRM-CORE-09D-02** | **PASS** | picker #9+ · PREV **201** ephemeral · `verPost=false` · Nest 0 |
| **J-HRM-CORE-09D-03** | **PASS** | PATCH IT+DRIVER **200** body omit `company_id` · PUT …/clauses **200** ×2 · F5 distinct clause IDs · Nest 0 · no VAL-001 |
| **J-HRM-CORE-09D-04** | **PASS** | CODE-INVALID format toast · matrix=xevn **200** · open catalog · printable=false · closed-8 ≠ DONE · Nest 0 |
| Module CORE / CTR / personnel UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-CORE-09C-*** / **09B-*** / **09A-*** / **08-*** / **02-*** / **01-*** prior seals | **PASS_RETAIN** | not re-litigated · DENY reopen · stamps `CORE09CQC1-MSLBXMUT` / `CORE09BQC1-MSLB05DZ` / `CORE09AQC1-MSLA4LX9` / `CORE08QC1-MSL9BFFE` / `CORE02QC1-MSL80DU6` / `CORE01QC1-MSL6WMS7` |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-CORE-09D-01 | **PASS** |
| J-HRM-CORE-09D-02 | **PASS** |
| J-HRM-CORE-09D-03 | **PASS** |
| J-HRM-CORE-09D-04 | **PASS** |

### Screens

`docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-02/` — 01 settings · 02–04 J01 · 05–06 J04 · 07–10 J03 · 11–13 J02 · 14 seals.

**PM action:** stamp `PROGRAM_JOURNEY_MAP.md` J-HRM-CORE-09D-01..04 with QC stamp **`CORE09DQC1-MSLDR8I3`** (QA already 🟢 PASS · C-SLICE · honesty false · printable false). Update continuous board Wave-16 **SEALED GWC** · next **UC-BP-CORE-02b** SA.

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **DENY** Phase1 · `SERVICE_READINESS` · Nest `/core` dual · closed-8 TPL DONE · CORE-09c=printable DONE · seed · reopen sealed J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*.
2. **Condition OBS `R-QA-CORE-09D-DND-STORM` (P2):** `@hello-pangea/dnd` drag-handle storms count≈1020 — **ACCEPT** non-blocking · J-03 bind PASS (palette + PUT 200) · optional FE later.
3. **Condition OBS `R-QA-CORE-09D-ACTIVATE-BTN` (P2):** historical activate flaky — this run activate **201** OK — **ACCEPT** idle-ok.
4. **Condition OBS pack command_table:** QA verify 1/8 PROCESS — QC consolidates 8/8 — **ACCEPT**.
5. **RETAIN** SA Option A physical `/api/hrm/contracts-insurance/*` open TPL · F-CORE-CTR-TPL-01/02 (+ PUT …/clauses · activate) · must_keep CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 RD · CORE-02 AuthZ/CB-403 · CORE-01 public · U19 J-09D · CORR-01 / DYNAMIC-LOCK.
6. **OUT** this seat: invent printable UAT · closed-8 DONE · Nest `/core` dual · module CORE/CTR UAT · UC-BP-CORE-02b invent as DONE.
7. **NOT** Phase 1 DONE · **NOT** module CORE / CTR / personnel UAT · Wave-16 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-FE-CORE-09D-PATCH-COMPANY-ID** | P0 | **CLOSED** | — FE-02 + QA-02 |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | P1/OBS | **CLOSED** | — J-03 F5 distinct |
| **R-QA-CORE-09D-DND-STORM** | P2 OBS | OPEN / idle-ok | FE later — not blocking |
| **R-QA-CORE-09D-ACTIVATE-BTN** | P2 OBS | OPEN / idle-ok | FE later — this run OK |
| Honesty / C-SLICE / printable false / ≠closed-8 / ≠09c=printable / module UAT | — | RETAIN | **pm** — DENY flip |
| Journey map + continuous board QC stamp | PROCESS | open | **pm** same session |

**No residual PRODUCT P0** from J-HRM-CORE-09D-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / **`contracts_printable_ready`** / claim module CORE / CTR / personnel UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/core` dual SoT  
- Claim closed-8 TPL DONE · claim CORE-09c VER/PDF = printable DONE  
- Seed / reopen sealed J-HRM-CORE-09C-* / J-HRM-CORE-09B-* / J-HRM-CORE-09A-* / J-HRM-CORE-08-* / J-HRM-CORE-02-* / J-HRM-CORE-01-*  
- Treat GWC as module GO · C-SLICE-as-module-DONE · claim CORE/CTR pillar UAT DONE because open TPL seat sealed  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #19 **UC-BP-CORE-02b** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-CORE-09d: J-HRM-CORE-09D-01..04 PASS (open TPL create+F5 · picker PREV ephemeral · PATCH omit company_id + PUT clauses IT/DRIVER distinct · matrix=xevn · Nest `/core` 0 · printable false · closed-8 ≠ DONE · CORE-09c ≠ printable · P0 PATCH CLOSED · OBS clause-FP CLOSED) · U65 · pack QC 8/8 · P2 DnD storm idle-ok. Conditions: honesty false · printable false · C-SLICE · DENY closed-8 / CORE-09c=printable / module CORE·CTR UAT / Nest dual / seed / reopen J-CORE-09C/09B/09A/08/02/01. Next continuous: **UC-BP-CORE-02b** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-02b
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md · stamp CORE09DQC1-MSLDR8I3 · Wave-16 UC-BP-CORE-09d SEALED · peer CORE09CQC1-MSLBXMUT / CORE09BQC1-MSLB05DZ / CORE09AQC1-MSLA4LX9 / CORE08QC1-MSL9BFFE / CORE02QC1-MSL80DU6 / CORE01QC1-MSL6WMS7 must_keep
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after CORE-09d (#18) = **UC-BP-CORE-02b** (#19 QUEUED) «Cấu hình nhóm field hồ sơ (metadata)»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02b · FR-UC-BP-PLT-01 · AC-PLT-EMP-CUSTOM-01* · F-EMP-CF-01..03 · F-EMP-CF-CNS-01/02 · F-EMP-TOK-03 · DB profile_groups_json / hrm_catalog_extension_items · must_keep CORE-09d F-CORE-CTR-TPL-01/02 (+PUT clauses) · must_keep CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 C&B AuthZ · CORE-01 public · Nest /core DENY · DENY invent Nest emp_custom_field / mega-EAV · cite prior EMP-CUSTOM-FIELD DOCS/CNS seals (EMPCFQA-MSK14LUH) as RETAIN baseline — gap-only Option

MISSION — SA Option seat (narrow):
1) Option A/B/C for profile field-group / metadata config (Settings extension allow-list · consumer custom_fields KEY · merge-token custom.emp.*) vs AS-IS LIVE — DENY Nest emp_custom_field dual · DENY mega-EAV
2) F.1 API map + must_keep CORE-09d open TPL+clause bind · CORE-09c VER/PDF · CORE-09b pack+ephemeral PREV · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · DENY reopen sealed J-HRM-CORE-09D-01..04 / J-HRM-CORE-09C/09B/09A/08/02/01 without regression · DENY flip recruitment_uat_ready / contracts_printable_ready / hrm_personnel_uat_ready / personnel·CORE·CTR UAT · DENY claim CORE-09d = printable / closed-8 DONE / CORE-09c=printable DONE
3) Disposition: RETAIN cite LIVE F-EMP-CF-* / CNS invent KEY vs unlock delta for profile_groups_json UX — unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · contracts_printable_ready · hrm_personnel_uat_ready · module CORE/CTR/personnel UAT · seed · Nest /core dual · Nest emp_custom_field · reopen sealed CORE-09d / CORE-09c / CORE-09b / CORE-09a / CORE-08 / CORE-02 / CORE-01 · claim Wave-16 TPL = printable UAT · claim closed-8 TPL DONE
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```

---

## stamp

`CORE09DQC1-MSLDR8I3` · 2026-08-09 · Wave-16 UC-BP-CORE-09d **SEALED GWC** ≠ module CORE / CTR / personnel UAT · printable false · closed-8 ≠ DONE · CORE-09c ≠ printable DONE
