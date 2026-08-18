# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-14 seat **#16**) |
| **uc_ids** | `UC-BP-CORE-09b` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · peer seal **`CORE09AQC1-MSLA4LX9`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **change_mode** | DOC-DELTA F.1 RETAIN cite · **HOLD invent** · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=28177 · EVID_LEN=5523 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| RETAIN cite F-CORE-CTR-PACK-01 on LIVE `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` · DENY Nest `/core` dual pack SoT | **PASS** §5.1 · §3 |
| RETAIN cite F-CORE-CTR-PREV-01 on LIVE `POST …/contracts/:id/preview` · ephemeral sections/clauses/merged_fields/missing_*/can_issue/cb_masked · DENY INSERT issued VER as 09b | **PASS** §5.2 · §4.2 · §4.4 |
| Cite pack MVP GENERAL/IT_OFFICE/DRIVER · TPL-NONE · PACK-INVALID · TPL-PACK-MISMATCH · DRIVER-REQUIRED · display-ready VI · U19 pack-resolve=get=preview | **PASS** §1 · §4.1 · §6 · §7 |
| RETAIN CORE-09a CL body+snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · registry CRUD must_keep | **PASS** §5.4 · §8 |
| DENY invent 09c VER/PDF · 09d TPL as CORE-09b DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/** | **PASS** §5.5 · §8 · §10 |
| Unlock Dev-FE preview fidelity residual ONLY — not Dev invent schema/API/VER | **PASS** §11 · §12 |
| ba-data already CONFIRMED HOLD (no re-invent) | **PASS** header · §2 |
| F.1 Mục đích · Nghiệp vụ · bước SRS | **PASS** §5.1–§5.5 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN `hrm_contract_pack_rules` + templates + clauses + contracts · ephemeral preview · no VER as 09b · schema ADD NOT unlock |
| BA-01 | O1–O12 · AC-CORE-09B-* · VAL-CORE-PREV-* · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 · J-HRM-CORE-09B-01..04 DRAFT |
| SA-01 | Option A LOCKED · physical pack-resolve + preview · paper `/core` alias · REJECT Nest dual / 09c·09d invent / printable invent |
| SRS | FR-UC-BP-CORE-09b Diễn biến #1–#5 · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 |
| Paper API | F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 RETAIN · CL-01..04 must_keep · VER/PDF/TPL OUT |
| AS-IS Nest (read-only) | `ContractsInsuranceController` pack-resolve (~L680–695) · preview (~L1178–1194) · `ContractLegalPrintService.resolvePackForEmployee` · `previewContract` · `validatePreview` · `mandatoryGate` · `PreviewResult` · constants PACK/TPL/DRIVER · Nest `/core` pack/preview **ABSENT** · print-versions/PDF = peer 09c |
| Peer style | CORE-09A CLUSTER-API-01 F.1 RETAIN · this seat = **RETAIN/HOLD** (not UPGRADE invent) |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/contracts-insurance/contracts*` pack-resolve+preview · paper `/core/…` alias only |
| Pack SoT | LIVE `hrm_contract_pack_rules` ONE · DENY Nest `/core` dual |
| Preview | Ephemeral DTO only · DENY issued VER INSERT as 09b |
| Pack MVP | GENERAL · IT_OFFICE · DRIVER · LOGISTICS optional |
| Errors | RETAIN TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH / DRIVER-REQUIRED |
| Consume | CORE-09a clause library · DENY FE hardcode |
| Peers | VER/PDF/TPL OUT invent as DONE |
| Seals | CORE-09a/08/02/01 must_keep · Nest `/core` DENY |
| Unlock | **dev-fe** preview residual ONLY · Dev-BE invent **HOLD** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| personnel / CORE / CTR module UAT | **false** |
| C-SLICE ≠ module UAT | **LOCKED** |
| Claim CORE-09a = printable DONE | **DENY** |
| Claim CORE-08 = pillar DONE | **DENY** |
| Invent 09c VER/PDF · 09d TPL as 09b DONE | **DENY** |
| Nest `/core` pack/preview SoT | **DENY** |
| Reopen J-HRM-CORE-09A/08/02/01 | **DENY** without regression |
| Seed / honesty flip / `apps/**` | **DENY** this seat |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | sa API-01 **CONFIRMED RETAIN** F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 on LIVE `/contracts-insurance/contracts*` · ephemeral preview · Nest `/core` DENY · unlock Dev-FE residual only · no invent VER/schema · honesty false · C-SLICE. |
| **next_owner** | **pm** → **dev-fe** |
| **next_dispatch_prompt** | See spec §12 copy-ready `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-api-01.md` |
| **residual** | FE preview fidelity · J-09B DRAFT · schema HOLD · 09c/09d peer |
