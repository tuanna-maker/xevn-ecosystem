# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89 Wave-4** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md` |
| **depends_on** | W1–W3 SEALED GWC · prior IV slice GWC `po-hrm-rec-iv-one-active-qc-slice-01.md` |
| **uc_ids** | `UC-BP-REC-06a` |
| **board_seat** | #6 · «Xếp / hủy / đổi lịch PV — một lịch đang hiệu lực» |
| **selected_option** | **A** — ACCEPT_AS_IS_UPGRADE · SoT `recruitment_interviews` · physical `/recruitment/interviews*` |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | `PO_HRM_MVP_GD1_CONTINUOUS.md` | Seat #6 QUEUED after REC-08; U89 continuous; REC-03 OUT |
| 2 | SRS FR-UC-BP-REC-06a | 7-mục · BR-IV-01..06 · AC-IV-01..07 · soft-gate stage · no campaign |
| 3 | UC_INVENTORY / WBS-REC-04 / REQ_REC_004 | ADD MVP · inventory row present |
| 4 | Prior SA `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` | Contracts 409 + projection; OPEN-Q1..Q4 were OPEN |
| 5 | Bus CONFIRM-ON-BUS OPEN-Q2 interim | R-A preferred (2026-08-06) |
| 6 | AS-IS Nest/FE | §2 probes |
| 7 | ADR Option template §§1–7 + F.1 | Applied in spec |
| 8 | Sealed peers W1–W3 | **DENY reopen** |

---

## 2. AS-IS probes (facts)

| Probe | Evidence |
|-------|----------|
| Spine SoT | `recruitment.service.ts` `scheduleInterview` → `public.recruitment_interviews` |
| One-active gate | ACTIVE = `scheduled`\|`confirmed`; 409 `HRM-REC-IV-409-ACTIVE` + unique `uniq_recruitment_interviews_active_candidate` |
| List projection | `active_interview` display-ready (badge + vi-VN `—` fallback) |
| Status PATCH | `PATCH …/interviews/:id/status` — no PATCH `scheduled_at` on spine |
| DTO statuses | `scheduled/confirmed/cancelled/completed/passed/failed` — **no** `no_show` |
| Soft-gate | `HRM-REC-IV-400-STAGE-DISALLOW` on schedule when stage flag false |
| Lane B catalog | `recruitment-catalog.service.ts` `createInterview` → `public.interviews` **without** one-active check |
| Slice GWC | Create 201+409 · badge F5 · toast — cancel/complete browser **deferred** |
| Honesty | `recruitment_uat_ready=false` must_keep |

---

## 3. Disposition summary

| Item | Value |
|------|-------|
| Option A | ACCEPT_AS_IS_UPGRADE spine · R-A · close OPEN-Q1..Q4 |
| Option B | Greenfield / UV×YCTD / Nest dual — **REJECTED** |
| Option C | HOLD / false module DONE — **REJECTED** |
| F.1 | IV-01/04 **RETAIN** · IV-02 **UPGRADE** (`no_show`) · IV-03 **UNLOCK ADD** (datetime) · SCHED-SOFT **RETAIN** · IV-05 list **P2** |
| Invariants | IV-S1..IV-S10 |
| Scope | U19 `resolveHrmListScope` |
| DENY | Lane B as SoT · Nest `/rec` dual · UV×YCTD ACTIVE · REC-03 · seed · honesty flip · reopen W1–W3 |

### OPEN-Q LOCK table

| ID | LOCK |
|----|------|
| Q1 | UV × `company_id` (not UV×YCTD) |
| Q2 | R-A primary |
| Q3 | `no_show` TERMINAL |
| Q4 | `recruitment_interviews` SoT |

---

## 4. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
W1–W3 seals RETAIN (DENY reopen)
prior IV one-active slice GWC RETAIN (≠ module UAT)
no Nest /rec dual SoT
no Lane B as FR-06a SoT
```

---

## 5. BA handoff notes

| Item | Note |
|------|------|
| next_owner | **ba-process** |
| work_item | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01` |
| CONFIRM | O1–O10 in SA §10 |
| AC rows | AC-REC-IV-01..07 + residual cancel/reschedule browser |
| J-* | DRAFT: Candidates → schedule → dup 409 → cancel → reschedule → F5 |

---

## 6. Spec size / path lock

| Artifact | Path (NFD) |
|----------|------------|
| Spec | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md` |
| Evidence | this file |

---

## completion_report

- **Closed:** Option A LOCKED for UC-BP-REC-06a; OPEN-Q1..Q4 CLOSED from LIVE+SRS; F.1 disposition; LIVE vs gap; DENY dual Nest / Lane B SoT / UV×YCTD / REC-03 / honesty flip / W1–W3 reopen. Docs-only — no `apps/**`.
- **Residual:** BA-01 AC pack; API F.1 `no_show` + R-A PATCH; Dev/QA residual browser cancel/reschedule; GET list P2.

## next_owner

**ba-process**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: SA-01 Option A CONFIRMED docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md
ref_srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
ref_prior_slice: docs/qa/evidence/po-hrm-rec-iv-one-active-qc-slice-01.md (RETAIN · do not reopen as module UAT)

MISSION: AC pack for UC-BP-REC-06a against Option A (ACCEPT_AS_IS_UPGRADE spine recruitment_interviews).
CONFIRM O1–O10 (path Lane A, cardinality UV×company, R-A, no_show TERMINAL, soft-gate ≠ 409, cancel reason, past datetime, GET list P2, no REC-08 reopen, honesty false).
Deliver AC-REC-IV-01..07 mapped + residual AC for cancel/complete/reschedule browser + VAL-REC-IV-* + Diễn biến FE + J-* DRAFT.
must_keep: REC-03 OUT · honesty false · C-SLICE · sealed W1–W3 · prior IV 409/badge LIVE · U65
DENY: invent UV×YCTD ACTIVE · Nest /rec dual · Lane B as SoT · seed · flip recruitment_uat_ready · reopen REC-01/02/08

EXIT: PASS_TO_PM CONFIRMED · next_owner sa|ba-data API/DB F.1 residual (F-REC-IV-02/03) · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md
```

## evidence_path

`docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md`
