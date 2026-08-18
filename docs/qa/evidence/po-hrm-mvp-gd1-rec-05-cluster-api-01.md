# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-7) |
| **uc_ids** | `UC-BP-REC-05` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O9 · SA Option A · peer `REC04QC1-MSL1LU4H` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| UPGRADE F-REC-APP-02 `POST …/candidates/:id/transitions` | **PASS** §5.1 |
| Atomic UPDATE Lane A `status` + APPEND `rec_candidate_stage_history` | **PASS** §1 · §5.1 · VAL-24 |
| ADD `GET …/candidates/:id/stage-history` | **PASS** §5.2 |
| Display-ready DTO from/to/note/changed_* | **PASS** §6 |
| Assert `to_stage` ∈ EFF when EFF>0 (`HRM-REC-STAGE-UNKNOWN` RETAIN) | **PASS** §4.3 · §5.1 · §7 |
| Mint `HRM-REC-STAGE-REJECT-REASON` · `REVERSE-FORBIDDEN` | **PASS** §4 · §7 |
| Optional EMPTY-CATALOG / HISTORY-FAIL | **PASS** §7 |
| U19 list=get=transition=timeline | **PASS** §8 STG-S-SCOPE |
| Paper `/rec` = alias only | **PASS** §3 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#2 | **PASS** §5.1–§5.2 |
| DENY Nest `/rec` dual · second history · REC-03 · seed · honesty · reopen REC-04 · apps/** | **PASS** §1/§11 |
| Unlock Dev-BE/FE | **PASS** §12 · §14 |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | ADD `rec_candidate_stage_history` · open-CHK · FK Lane A · soft `application_id` |
| BA-01 | O1–O9 · AC-REC-05-* · VAL-REC-STG-01..24 · primary POST transitions + GET stage-history |
| SA-01 | Option A LOCKED · F-REC-APP-02 residual · DENY dual SoT |
| SRS | FR-UC-BP-REC-05 Diễn biến #0a–#2 · BR-BP-CV-02 · BR-PLT-05 |
| Paper API | F-REC-APP-02 `/rec/applications/{id}/transitions` = alias |
| AS-IS Nest (read-only) | ABSENT `POST …/candidates/:id/transitions` · ABSENT stage-history · pool/posting PATCH stage ≠ FR-05 SoT · EFF assert on pool/apps · YCTD `requisitions/:id/transitions` ≠ UV timeline · closed-six CHK on Lane A |
| Peer style | REC-04/00/02/06A/08 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/recruitment/candidates/:id/*` · paper `/rec/*` alias |
| Stage home | Lane A `candidate_id` + `status` ↔ DTO `stage` |
| History | ONE table DATA-01 · append-only · atomic with UPDATE |
| Reject | `is_reject_outcome` / reject-key set ⇒ `note` required |
| Reverse CFG | `recruitment.allow_reverse_stage` default **true** |
| Non-SoT | Pool stage · posting-apps stage · REC-03 |
| Kanban | O9 P2 OUT — not unlock-gate |
| Peers | UV-YCTD · REC-04 · 06a · CAT RETAIN |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-api-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed / apps/** this seat | **NONE** |
| Nest `/rec` dual SoT | **DENIED** |
| Second history / catalog | **DENIED** |
| REC-03 / posting-apps / pool as FR-05 SoT | **DENIED** |
| Overwrite-only stage as DONE | **DENIED** |
| Reopen REC-04 J-CV-04 / W1–W6 rewrite | **DENIED** |
| Claim 05a create = FR-05 DONE | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** API F.1 residual CONFIRMED for UC-BP-REC-05 — physical POST transitions (atomic stage+history) + GET stage-history, display-ready DTO, EFF assert, mint REJECT-REASON / REVERSE-FORBIDDEN, U19, paper alias; DATA-01 reused; DENY Nest dual / second history / REC-03 / seed / honesty / apps/**.
- **Residual:** **dev-be** + **dev-fe** residual transition+timeline · then QA U65 J-HRM-REC-STG-05-01..04 · QC GWC C-SLICE.
- **next_owner:** **pm**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-api-01.md · DATA-01 · BA O1–O9 · SA Option A

MISSION: Implement Option A residual on Nest /api/hrm/recruitment/* ONLY —
(1) ensureSchema ADD public.rec_candidate_stage_history per DATA-01 §4; DROP closed-six Lane A CHK → open non-empty per DATA-01 §5;
(2) ADD POST …/candidates/:id/transitions — EFF>0 assert to_stage ∈ EFF else HRM-REC-STAGE-UNKNOWN; reject class ⇒ note else HRM-REC-STAGE-REJECT-REASON; reverse vs CFG recruitment.allow_reverse_stage (default true) else HRM-REC-STAGE-REVERSE-FORBIDDEN; SAME TXN UPDATE recruitment_candidates.status + INSERT history; optional sync N–N application.stage; HISTORY-FAIL rollback;
(3) ADD GET …/candidates/:id/stage-history — display-ready from/to/note/changed_*/desired_salary; same resolveHrmListScope as get;
(4) Preferred EMPTY-CATALOG when EFF=0 mutate; U19 jest list=get=transition=timeline; N+1 EFF key persist; regression UV-YCTD/CAT/IV DISALLOW/REC-04 flags.
Cite: API-01 §4–§8 · DATA-01 · BA AC-REC-05-* · FR-UC-BP-REC-05 · BR-BP-CV-02.
cấm: Nest /rec dual · second history/catalog · REC-03 · posting-apps/pool as FR-05 SoT · seed · honesty flip · reopen REC-04 · overwrite-only DONE
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-be-01.md · READY_FOR_QA · bus
```

### Parallel FE (after or with BE contract)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: API-01 CONFIRMED · BE contract for POST transitions + GET stage-history

MISSION: FE UV–YCTD detail — picker GET /recruitment/pipeline-stages/effective; Lưu → POST /recruitment/candidates/:id/transitions; Timeline → GET …/stage-history; reject note UX; toast VI on REJECT-REASON/UNKNOWN/REVERSE-FORBIDDEN; F5 stage+timeline; Network path /recruitment/ only; Kanban OUT MVP.
cấm: Nest /rec SoT · Campaign · pool-stage sole FR-05 · seed · honesty flip · reopen REC-04 J-*
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md · READY_FOR_QA · bus
```
