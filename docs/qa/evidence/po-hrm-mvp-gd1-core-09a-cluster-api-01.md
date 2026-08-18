# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-13 seat **#15**) |
| **uc_ids** | `UC-BP-CORE-09a` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · peer seal **`CORE08QC1-MSL9BFFE`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **change_mode** | DOC-DELTA F.1 RETAIN cite · **HOLD invent** · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=26756 · EVID_LEN=5482 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| RETAIN cite F-CORE-CTR-CL-01..04 on LIVE `/api/hrm/contracts-insurance/contract-clauses*` | **PASS** §5.1–§5.5 |
| DENY Nest `/core` dual clause SoT · paper `/core` alias only | **PASS** §1 · §3 |
| Draft in-place vs issued CONFLICT→activate bump · snapshot freeze · `{{field}}` · soft retire | **PASS** §4.2–§4.4 · §5.3–§5.7 |
| Display-ready labels (FE residual OK) | **PASS** §4.1 · §11 unlock FE |
| RETAIN publish/pull — not new body SoT · OUT invent PREV/VER/PDF/TPL | **PASS** §5.6 · §1 |
| RETAIN CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · snapshot freeze | **PASS** §8 |
| DENY Settings/XBOS body SoT · mega-EAV · CORE-08=pillar DONE · note=FR-08 DONE · printable · reopen J-* · seed · honesty · apps/** | **PASS** §8 · §10 |
| Unlock Dev-FE Settings UX residual ONLY — not Dev invent schema/API | **PASS** §11 · §12 |
| ba-data already CONFIRMED HOLD (no re-invent) | **PASS** header · §2 |
| F.1 Mục đích · Nghiệp vụ · bước SRS | **PASS** §5.1–§5.7 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | HOLD RETAIN `hrm_contract_clauses` · `clauses_snapshot_json` freeze · no mega-EAV · prior-body NOT unlock |
| BA-01 | O1–O12 · AC-CORE-09A-* · VAL-CORE-CL-* · BR-CTR-CL-01..04 · J-HRM-CORE-09A-01..04 DRAFT |
| SA-01 | Option A LOCKED · physical `/contracts-insurance/contract-clauses*` · paper `/core` alias · REJECT Nest dual / printable invent |
| SRS | FR-UC-BP-CORE-09a Diễn biến #1–#5 · BR-CTR-CL-01..04 · AC-CTR-CL / AC-PLT-CTR-CL |
| Paper API | F-CORE-CTR-CL-01..04 RETAIN · F-CORE-CTR-PUB/PULL RETAIN · PREV/VER/PDF/TPL OUT |
| AS-IS Nest (read-only) | `ContractsInsuranceController` GET/POST/PATCH + activate/retire (~L549–649) · `ContractLegalPrintService` draft in-place · issued soft-block · `clauseHasIssuedSnapshot` · `ContractLibraryPublishService` `/contract-library/*` · Nest `/core` clause **ABSENT** · `displayClause` raw (FE map labels) |
| Peer style | CORE-08 CLUSTER-API-01 F.1 · this seat = **RETAIN/HOLD** (not UPGRADE invent) |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/contracts-insurance/contract-clauses*` · paper `/core/…/clauses` alias only |
| Body SoT | LIVE `hrm_contract_clauses.body_vi` ONE · Settings UX ≠ SoT |
| Lifecycle | Draft in-place · issued CONFLICT→activate bump · snapshot freeze |
| Placeholders | `{{field}}` / `{{token}}` only |
| Retire | Soft `retired` (+ optional `archived_at`) |
| Publish/pull | RETAIN lineage · ≠ second body |
| Peers | PREV/VER/PDF/TPL OUT invent as DONE |
| Seals | CORE-08/02/01 must_keep · Nest `/core` DENY |
| Unlock | **dev-fe** Settings residual ONLY · Dev-BE invent **HOLD** |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| personnel / CORE / CTR module UAT | **false** |
| C-SLICE | **true** (slice ≠ module GO) |
| Claim CORE-08 = CORE pillar DONE | **DENY** |
| Claim note-CRUD = FR-08 DONE | **DENY** |
| Reopen J-HRM-CORE-08/02/01 | **DENY** without regression |
| Seed in evidence | **DENY** |
| `apps/**` this seat | **DENY** (docs only) |
| Nest `/core` clause SoT | **DENY** |
| Mega-EAV / Settings body SoT | **DENY / HOLD** |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** UC-BP-CORE-09a: F-CORE-CTR-CL-01..04 cited on LIVE `/contracts-insurance/contract-clauses*` · draft in-place vs issued CONFLICT→activate · snapshot freeze · `{{field}}` · soft retire · PUB/PULL RETAIN ≠ body SoT · OUT PREV/VER/PDF/TPL · must_keep CORE-08/02/01 · Nest `/core` DENY · DENY Settings body / mega-EAV / pillar-DONE / note=FR-08 / printable / reopen / seed / honesty / apps/**. Unlock **Dev-FE Settings UX residual ONLY**. |
| **next_owner** | **pm** → **dev-fe** |
| **next_dispatch_prompt** | See spec §12 (FE-01 copy-ready) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **residual** | FE Settings fidelity · J-09A DRAFT until QA · prior-body history HOLD · 09b/09c/09d peer |
