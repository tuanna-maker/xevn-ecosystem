# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01` |
| **role** | ba-process · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89 Wave-4** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` |
| **depends_on** | SA-01 Option A CONFIRMED `PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md` |
| **ref_evidence_sa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-sa-01.md` |
| **uc_ids** | `UC-BP-REC-06a` |
| **board_seat** | #6 · xếp / hủy / đổi lịch PV — một lịch đang hiệu lực |
| **ack_status** | **PASS_TO_PM** CONFIRMED |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** · **no** customer SRS wipe |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | SA-01 Option A | **LOCKED** — ACCEPT_AS_IS_UPGRADE `recruitment_interviews`; OPEN-Q1..Q4 CLOSED |
| 2 | SRS FR-UC-BP-REC-06a | BR-IV-01..06 · AC-IV-01..07 · Diễn biến #1–#7 · soft-gate · no campaign |
| 3 | Prior BA draft IV one-active | Superseded OPEN-Q by SA; AC-07 soft-gate (not Select.Item) |
| 4 | Prior QC slice | Create/409/badge **RETAIN**; cancel/complete browser **deferred** |
| 5 | Peer BA-01 style (REC-08) | O-numbering · VAL · Diễn biến · J-* DRAFT |
| 6 | BA_TRACE / journey | §29 ADD J-HRM-REC-IV-01..07 DRAFT |
| 7 | must_keep / DENY | W1–W3 · honesty false · REC-03 OUT · U65 |

---

## 2. O1–O10 CONFIRM stamp

| ID | BA CONFIRM |
|----|------------|
| **O1** | Lane A `/recruitment/interviews*` only · Lane B OUT as SoT · paper `/rec/*` alias |
| **O2** | Cardinality `(company_id, candidate_id)` — **DENY** UV×YCTD ACTIVE |
| **O3** | R-A PATCH datetime primary |
| **O4** | `no_show` ∈ TERMINAL |
| **O5** | Soft-gate **400** ≠ **409** ACTIVE |
| **O6** | Cancel reason **optional default**; CFG required → VAL |
| **O7** | Past datetime **CFG**; unset default **BLOCK** + VAL |
| **O8** | GET list interviews **P2** — not MVP blocker |
| **O9** | REC-08 **OUT** reopen |
| **O10** | Honesty **false** · C-SLICE |

---

## 3. Deliverables closed

| Deliverable | Path / IDs |
|-------------|------------|
| AC mapped | AC-REC-IV-01..07 (+ RETAIN vs residual) |
| Residual browser | AC-REC-IV-R01..R07 · ALT · EX |
| VAL | VAL-REC-IV-01..19 |
| Diễn biến FE | Spec §3.6 steps 1–8 + Mermaid |
| J-* DRAFT | J-HRM-REC-IV-01..07 · BA_TRACE §29 |
| BR lock | BR-BP-REC-IV-01..06 + BR-REC-IV-PATH/CARD/SOFT/SCOPE/DISPLAY |

---

## 4. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
W1–W3 seals RETAIN (DENY reopen)
prior IV one-active create/409/badge GWC RETAIN (≠ module UAT)
no Nest /rec dual SoT
no Lane B as FR-06a SoT
no UV×YCTD concurrent ACTIVE invent
GET list interviews = P2 (not blocker)
```

---

## 5. Residual for next owner

| Residual | Owner |
|----------|-------|
| API F.1 F-REC-IV-02 (`no_show`) + F-REC-IV-03 (R-A PATCH) | **sa** |
| Spine column gap (only if API finds) | ba-data narrow |
| Dev BE/FE + QA J-HRM-REC-IV-* | After API CONFIRMED |
| GET list interviews | **P2** parallel |

---

## completion_report

- **Closed:** O1–O10 CONFIRMED against Option A; AC-REC-IV-01..07 mapped; residual cancel/complete/reschedule/no_show AC; VAL-REC-IV-*; Diễn biến FE; J-HRM-REC-IV-01..07 DRAFT; BA_TRACE §29; DENY dual Nest / Lane B / UV×YCTD / REC-03 / seed / honesty flip / W1–W3 reopen. Docs-only.
- **Residual:** SA API F.1 unlock; optional ba-data if column gap; Dev/QA browser residual; GET list P2.

## next_owner

**sa** (API F.1 DOC-DELTA) — ba-data only if physical column gap

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: BA-01 O1–O10 CONFIRMED docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md
ref_sa_option: docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-SA-01.md (Option A LOCKED)
ref_evidence_ba: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md

MISSION: API_DESIGN F.1 DOC-DELTA for residual unlock only.
1) F-REC-IV-02 UPGRADE — PATCH …/interviews/:id/status ADD no_show TERMINAL; map SRS Diễn biến #4–#6; error INVALID-TRANSITION; cancel reason CFG (O6).
2) F-REC-IV-03 UNLOCK ADD — PATCH …/interviews/:id scheduled_at R-A; Diễn biến #5/#7; past datetime VAL (O7); never second ACTIVE.
3) RETAIN F-REC-IV-01/04/SCHED-SOFT physical /api/hrm/recruitment/interviews* ; paper /rec/* alias only.
4) Mint/stabilize HRM-REC-IV-400-PAST-DATETIME · HRM-REC-IV-400-CANCEL-REASON; cite DTO↔recruitment_interviews columns.
5) If column gap on spine → note ba-data narrow; else ba-data NOT REQUIRED.
must_keep: Lane A SoT · 409 ACTIVE · badge projection · soft-gate ≠ 409 · W1–W3 · prior IV GWC · honesty false · U65
DENY: Nest /rec dual · Lane B as SoT · UV×YCTD ACTIVE · REC-03 · seed · flip recruitment_uat_ready · greenfield interview table · reopen REC-01/02/08

EXIT: PASS_TO_PM CONFIRMED · unlock dev-be/fe · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-api-01.md · spec docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md
```

## evidence_path

`docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md`

## ack_status

**PASS_TO_PM**
