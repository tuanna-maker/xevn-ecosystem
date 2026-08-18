# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-16 seat **#18**) |
| **uc_ids** | `UC-BP-CORE-09d` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · peer seal **`CORE09CQC1-MSLBXMUT`** · must_keep **`CORE09BQC1-MSLB05DZ`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **change_mode** | DOC-DELTA F.1 RETAIN cite · **HOLD invent** · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=39589 · EVID_LEN=5950 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| RETAIN cite LIVE GET/POST/PATCH …/contract-templates* + GET …/:id + POST …/activate + PUT …/:id/clauses — F.1 Mục đích · Nghiệp vụ · bước SRS FR-09d Diễn biến # · DTO↔DB DATA-01 · HRM-CTR-TPL-* (CODE-INVALID format-only · KEY · NONE · PACK-MISMATCH · 404) · CL-404 | **PASS** §5.1–§5.3 · §4 · §6 |
| RETAIN cite F-CORE-CTR-CFG-01 company-settings | **PASS** §5.4 |
| LOCK: open catalog · Settings 9+ · matrix=xevn=matrix_family only · junction clause_ids bind SoT · U19 list=get=create=put-clauses · CORR starter≠ceiling | **PASS** §1 · §4.4 · §7 |
| DENY Nest `/core` dual TPL · invent endpoints/schema · reinstate closed-8 · claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE | **PASS** §1 · §3 · §8 |
| RETAIN must_keep CORE-09c/09b/09a/08/02/01 seals · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY via PUT clauses (no seed) | **PASS** §5.3 · §5.6–§5.8 · §8 |
| Honesty: `contracts_printable_ready=false` · C-SLICE · no apps/** · no seed | **PASS** header · §8 · §10 |
| Unlock Dev-FE Settings/picker + clause bind fidelity ONLY · Dev-BE HOLD unless wire gap proven · not Dev invent | **PASS** §11 · §12 |
| ba-data already CONFIRMED HOLD (no re-invent) | **PASS** header · §2 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN `hrm_contract_templates` + `hrm_contract_template_clauses` · open catalog · no mega-EAV · schema ADD NOT unlock · CORR-01/DYNAMIC-LOCK · VAL-CORE-TPL-DATA-* |
| BA-01 | O1–O12 · AC-CORE-09D-* · VAL-CORE-TPL-* · BR-CTR-TPL-DYN-01..04 · AC-CTR-XEVN-01..11 · J-HRM-CORE-09D-01..04 DRAFT · J-HRM-CTR-04/07 |
| SA-01 | Option A LOCKED · LIVE contract-templates* + PUT clauses · paper `/core` alias · REJECT Nest dual / closed-8 / printable invent |
| SRS | FR-UC-BP-CORE-09d Diễn biến #1–#11 · CORR-01 · DYNAMIC-LOCK · AC-CTR-XEVN / AC-PLT-CTR-TPL |
| Paper API | F-CORE-CTR-TPL-01/02 · CFG-01 RETAIN · VER/PDF/PACK/PREV/CL must_keep |
| AS-IS Nest (read-only) | `ContractsInsuranceController` list/create/get/patch/activate/put-clauses (~L418–547) · CFG (~L433–458) · `ContractLegalPrintService.listTemplates` (matrix_family filter L967–970) · `createTemplate` · `updateTemplate` · `activateTemplate` · `replaceTemplateClauses` · `displayTemplate` · DTO Upsert/Update/PutTemplateClauses · constants `HRM_CTR_TPL_*` · Nest `/core` TPL **ABSENT** · stale DTO JSDoc «code IN 8» **DENY reinstate** (service = matrix_family only) |
| Peer style | CORE-09C CLUSTER-API-01 F.1 RETAIN · this seat = **RETAIN/HOLD** (not UPGRADE invent) |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/contracts-insurance/contract-templates*` (+ activate · PUT clauses · CFG) · paper `/core/…` alias only |
| TPL SoT | LIVE `hrm_contract_templates` ONE open catalog · DENY Nest `/core` dual |
| Open / CORR | Starter 8 examples · CREATE 9+ · CODE-INVALID format-only · matrix=`matrix_family` only |
| OBS | PUT clauses → junction SoT · dispose `R-QA-CORE-09B-CLAUSE-FP-EMPTY` · no seed |
| Errors | RETAIN TPL-201/200 · CODE-INVALID · KEY · NONE · PACK-MISMATCH · 404 · CL-404 · CFG-200 |
| Peers | CORE-09c VER/PDF ≠ printable · PREV ephemeral · CL · 08/02/01 must_keep |
| Unlock | **dev-fe** Settings/picker/OBS bind residual ONLY · Dev-BE invent **HOLD** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| personnel / CORE / CTR module UAT | **false** |
| C-SLICE ≠ module UAT | **LOCKED** |
| Claim CORE-09c VER/PDF = printable | **DENIED** |
| Invent printable DONE | **DENIED** |
| Claim closed-8 TPL DONE | **DENIED** |
| Nest `/core` TPL SoT | **DENIED** |
| Reinstate closed-8 / reject 9th | **DENIED** |
| Seed / apps/** | **DENIED** this seat |
| Reopen J-HRM-CORE-09C/09B/09A/08/02/01 | **DENIED** without regression |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** UC-BP-CORE-09d — F-CORE-CTR-TPL-01/02 (+ PUT clauses · activate) + CFG-01 on physical `/contracts-insurance/*`; open catalog CORR; OBS junction disposition; must_keep CORE-09c..01; unlock Dev-FE Settings/picker/bind residual ONLY; Dev-BE HOLD. |
| **next_owner** | **pm** → **dev-fe** |
| **next_dispatch_prompt** | See spec §12 |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-api-01.md` |

---

*End evidence · Wave-16 CORE-09d API-01 · sa · 2026-08-09*
