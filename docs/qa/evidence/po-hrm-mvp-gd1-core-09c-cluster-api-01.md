# Evidence — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-15 seat **#17**) |
| **uc_ids** | `UC-BP-CORE-09c` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · peer seal **`CORE09BQC1-MSLB05DZ`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **change_mode** | DOC-DELTA F.1 RETAIN cite · **HOLD invent** · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=35616 · EVID_LEN=5830 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| RETAIN cite F-CORE-CTR-VER-01 on LIVE `POST …/contracts/:id/print-versions` · F.1 Mục đích · Nghiệp vụ · bước SRS FR-09c #1/#5 · DTO↔DB DATA-01 · errors ISSUE/DRIVER/TERM/TPL | **PASS** §5.1 · §4.1–§4.2 |
| RETAIN cite F-CORE-CTR-VER-02 on LIVE `GET …/print-versions*` · F.1 · FR-09c #3/#4 · HRM-CTR-VER-200 / PV-404 | **PASS** §5.2 · §4.3 |
| RETAIN cite F-CORE-CTR-PDF-01 on LIVE `GET …/print-versions/:versionId/pdf` · F.1 · FR-09c #2 · snapshot-only · VERSION-NOT-ISSUED / RENDER-FAIL | **PASS** §5.3 · §4.4 |
| LOCK: server re-preview + can_issue · snapshot freeze · amend supersede · PDF-from-snapshot · U19 list=get=create=pdf | **PASS** §1 · §4.2 · §7 |
| DENY Nest `/core` dual VER/PDF · invent endpoints/schema · PREV→INSERT VER · invent 09d TPL as DONE | **PASS** §1 · §3 · §5.6 · §8 |
| RETAIN must_keep CORE-09b/09a/08/02/01 seals · carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d | **PASS** §5.4–§5.6 · §8 |
| Honesty: `contracts_printable_ready=false` · C-SLICE · DENY claim CORE-09b=printable · no apps/** · no seed | **PASS** header · §8 · §10 |
| Unlock Dev-FE save VER + PDF U65 fidelity ONLY · Dev-BE HOLD unless wire gap proven · not Dev invent | **PASS** §11 · §12 |
| ba-data already CONFIRMED HOLD (no re-invent) | **PASS** header · §2 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN `hrm_contract_print_versions` + denorm · snapshot freeze · no mega-EAV · schema ADD NOT unlock · VAL-CORE-VER-* |
| BA-01 | O1–O12 · AC-CORE-09C-* · VAL-CORE-VER-* · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08 · J-HRM-CORE-09C-01..04 DRAFT |
| SA-01 | Option A LOCKED · LIVE POST/GET print-versions* + GET pdf · paper `/core` alias · REJECT Nest dual / PREV→INSERT / 09d invent / printable invent |
| SRS | FR-UC-BP-CORE-09c Diễn biến #1–#5 · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08 |
| Paper API | F-CORE-CTR-VER-01/02 · PDF-01 RETAIN · PACK/PREV/CL must_keep · TPL OUT invent |
| AS-IS Nest (read-only) | `ContractsInsuranceController` create/list/get print-versions (~L1196–1247) · renderPrintVersionPdf (~L697–728) · `ContractLegalPrintService.createPrintVersion` (re-preview + can_issue + supersede + INSERT) · `listPrintVersions` · `getPrintVersionById` · `renderPrintVersionPdf` (snapshot pdfkit) · `CreatePrintVersionDto` · constants VER/ISSUE/PDF · Nest `/core` VER/PDF **ABSENT** |
| Peer style | CORE-09B CLUSTER-API-01 F.1 RETAIN · this seat = **RETAIN/HOLD** (not UPGRADE invent) |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/contracts-insurance/*` print-versions* + pdf · paper `/core/…` alias only |
| VER SoT | LIVE `hrm_contract_print_versions` ONE · DENY Nest `/core` dual |
| Issue | Server re-preview + can_issue · freeze snapshots · supersede amend · denorm pack/template |
| PDF | Snapshot-only pdfkit · issued status required |
| PREV | Ephemeral must_keep · DENY PREV→INSERT rewrite |
| Errors | RETAIN VER-201/200 · ISSUE-BLOCKED · DRIVER · TERM · TPL-NONE · VERSION-NOT-ISSUED · PV-404 · RENDER-FAIL |
| Peers | 09d TPL OUT invent DONE · carry OBS |
| Seals | CORE-09b/09a/08/02/01 must_keep · Nest `/core` DENY |
| Unlock | **dev-fe** save/PDF residual ONLY · Dev-BE invent **HOLD** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| personnel / CORE / CTR module UAT | **false** |
| C-SLICE ≠ module UAT | **LOCKED** |
| Claim CORE-09b = printable DONE | **DENIED** |
| Invent 09d TPL DONE here | **DENIED** |
| Nest `/core` VER/PDF SoT | **DENIED** |
| Rewrite PREV→INSERT VER | **DENIED** |
| Seed / apps/** / honesty flip | **DENIED** |
| Carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | → **09d** only |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** for UC-BP-CORE-09c: cite **F-CORE-CTR-VER-01/02** + **F-CORE-CTR-PDF-01** on LIVE physical `/contracts-insurance/*` print-versions* + pdf · server re-preview + can_issue · snapshot freeze · amend supersede · PDF-from-snapshot · U19 · must_keep PACK+PREV ephemeral · CL · CORE-08/02/01 · Nest `/core` DENY · OUT 09d TPL invent · DENY CORE-09b=printable · printable false · unlock **Dev-FE** save/PDF fidelity ONLY · **Dev-BE HOLD**. |
| **next_owner** | **pm** → **dev-fe** |
| **next_dispatch_prompt** | see spec §12 |
| **ack_status** | **PASS_TO_PM** |

---

*End evidence · CORE-09c API-01 · 2026-08-09*
