# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9) |
| **uc_ids** | `UC-BP-REC-07` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA Option A · peer `REC06QC1-MSL4CU2G` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD F-REC-HIRE-01 `POST …/applications/:id/accept-offer` | **PASS** §5.1 |
| Create+prefill from DATA-01 §4 · soft stamp · reverse `employees.candidate_id` · optional accept-audit | **PASS** §5.1(8–11) · §2 |
| Idempotent 2xx | **PASS** §1 invariant · §5.1(6) · `HRM-REC-HIRE-200` |
| APP-02 hired-outcome ONLY after success | **PASS** §5.3 · HIRE-STAGE-APP-02 |
| RETAIN HTP-05 · HIRE-400/409 · PAY-403 · STAGE-UNKNOWN | **PASS** §5.4–§5.5 · §7 |
| Mint `HRM-REC-HIRE-*` expand (OFFER-INVALID · CANCELLED · DUP · PREFILL-FAIL · 200/201) | **PASS** §7 |
| Display-ready DTO | **PASS** §6 |
| U19 list=get=accept=employee=hire-readiness | **PASS** §8 HIRE-S-SCOPE |
| Paper `/rec` = alias only | **PASS** §3 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#2 | **PASS** §5.1 |
| DENY Nest `/rec` dual · second hire SoT · hard FK · PAY · mail=hire · seed · honesty · reopen J-06 · apps/** · Dev before CONFIRMED | **PASS** §1/§11 |
| Unlock Dev-BE/FE | **PASS** §12 · §14 |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | UV→EMP M01–M14 · soft stamp Lane A+B · ADD `employees.candidate_id` · optional accept-audit · `pending_docs` · DENY hard FK |
| BA-01 | O1–O12 · AC-REC-07-* · VAL-REC-HIRE-01..24 · primary `POST …/applications/:id/accept-offer` · idempotent 2xx |
| SA-01 | Option A LOCKED · ADD create+prefill+soft-link+APP-02 · paper `/rec` alias · REJECT B/C |
| SRS | FR-UC-BP-REC-07 Diễn biến #1–#2 · BR-BP-LC-01 / BR-BP-ONB-01 · AC-HTP-05 |
| Paper API | F-REC-HIRE-01 `/rec/…/accept-offer` = alias |
| AS-IS Nest (read-only) | `hire-employee-link.ts` HIRE-400/409 LIVE · HTP-05 LIVE · APP-02 SEALED · mail SEALED ≠ hire · **ABSENT** accept-offer route · GĐ1 `application_id = recruitment_candidates.id` |
| Peer style | REC-06/05/04/00 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/recruitment/applications/:id/accept-offer` · paper `/rec/*` alias |
| Application neo GĐ1 | `:id` = Lane A `recruitment_candidates.id` with `requisition_id IS NOT NULL` |
| Hire SoT | ONE soft link · DENY second hire table / hard FK |
| Stage | APP-02 only after accept success |
| Prefill | DATA-01 §4 — no re-key primary |
| Idempotent | 2xx same emp · DUP for true conflict |
| HTP / PAY | HTP RETAIN consume · PAY-403 |
| Mail | REC-06 offer template ≠ hire |
| Peers | UV-YCTD · REC-05 · 06a · REC-04 · CAT · HTP RETAIN |
| OUT | REC-03 · Nest `/rec` dual · honesty flip |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-api-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| C-SLICE | API CONFIRMED ≠ module REC UAT ≠ Phase1 DONE |
| Nest `/rec` dual | **DENY** |
| Second hire SoT / hard FK | **DENY** |
| PAY invent / mail=hire | **DENY** |
| Pool/Kanban hired alone = FR-07 DONE | **DENY** |
| Seed / honesty flip | **DENY** |
| Reopen sealed J-06 | **DENY** without regression |
| `apps/**` this seat | **untouched** |

---

## 6. Unlock

| Next | work_item_id |
|------|----------------|
| **dev-be** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01` |
| **dev-fe** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01` |
| Then | QA J-HRM-REC-07-01..04 · QC GWC C-SLICE |

---

## completion_report

- **Closed:** API F.1 residual CONFIRMED for UC-BP-REC-07 — F-REC-HIRE-01 ADD physical `/recruitment/applications/:id/accept-offer` · create+prefill · soft stamp · reverse candidate_id · idempotent 2xx · APP-02 after success · mint HIRE-* · U19 · RETAIN HTP-05/HIRE-400/409/PAY-403 · paper alias · unlock Dev.
- **Residual:** BE-01 + FE-01 execution · QA U65 · QC GWC.
- **ack_status:** **PASS_TO_PM**
- **next_owner:** **pm** → dispatch BE-01 + FE-01
