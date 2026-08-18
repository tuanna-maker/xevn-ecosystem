# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-20) |
| **uc_ids** | `UC-BP-CORE-06` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA Option A · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01 · `CORE05QC1-MSLGVT40` · `CORE05QA2-MSLGSWSF` · `R-CORE-05-HONESTY` idle-ok · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | **HOLD** soft-return spine · **HOLD invent** TERM/closed cols · **HOLD/OUT** structured bồi thường · **NO** `apps/**` · **no migrate** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no invent/change LIVE employee_assets soft-return spine (status · return_date · BB · serial · DELETE-FORBIDDEN must_keep CORE-05) | **PASS** §1/§4.1 |
| CONFIRM HOLD invent full hrm_termination / Nest TERM dual — prefer checklist-from-assigned | **PASS** §4.2 · Nest ABSENT grep 0 |
| CONFIRM HOLD invent asset_checklist_closed / PAY ack cols — prefer aggregate closed | **PASS** §4.3 |
| CONFIRM HOLD/OUT invent structured bồi thường — lost+notes stub OK | **PASS** §4.4 |
| Cite display-ready checklist DTO (rows + statusLabelVi + return_date + derived closed + optional termination_context_id) | **PASS** §5 |
| RETAIN CORE-05..01 · Nest /core DENY · R-CORE-05-HONESTY idle-ok | **PASS** §9 |
| DENY wipe / invent CORE-07/PAY / soft=DONE / personnel / printable / reopen / seed / apps/** | **PASS** §9 |
| Unlock sa API-01 RETAIN cite F-CORE-AST-02 + TERM checklist + closed aggregate · CORE-07 QUEUED | **PASS** §11/§12 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1–O12 · HOLD dispositions §1.4 |
| SA-01 | Option A · soft≠DONE · residuals TERM/CLOSED/EXCEPTION |
| AS-IS | `employee_assets` LIVE · Nest TERM/`asset_checklist_closed`/`Controller('core')` **0** |
| Peers | CORE-05..01 stamps must_keep |

---

## 3. Physical decisions (summary)

1. **Soft-return:** **HOLD RETAIN** LIVE spine — no invent/change.
2. **TERM:** **HOLD invent** `hrm_termination` — prefer checklist UI on assigned.
3. **Closed:** **HOLD invent** flag cols — prefer aggregate `asset_checklist_closed`.
4. **Exception:** lost+notes **RETAIN** · structured **OUT**.
5. **Path:** physical PATCH assets* · `/core` alias only.
6. **Honesty:** soft ≠ CORE-06 DONE · CORE-05 ≠ personnel · CORE-07 remain QUEUED.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CORE / personnel / CTR UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |
| soft-return alone = CORE-06 DONE | **DENIED** |
| CORE-05 = personnel UAT | **DENIED** |
| CORE-07/PAY / printable / closed-8 DONE | **DENIED** |
| `R-CORE-05-HONESTY` | **INFO idle-ok RETAIN** |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-06
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01 · CORE05QC1-MSLGVT40 · CORE05QA2-MSLGSWSF · R-CORE-05-HONESTY INFO idle-ok · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-AST-02 physical prefer PATCH /employees/:id/assets* · LIVE employee_assets HOLD RETAIN · paper /core alias only · Nest /core DENY · soft Profile ≠ CORE-06 DONE · CORE-07 / PAY-07 OUT invent DONE

MISSION — API F.1 lock (docs-only · wire-only prefer · no schema invent):
1) RETAIN cite F-CORE-AST-02 physical PATCH /api/hrm/employees/:id/assets/:assetId (status+return_date) · optional thin …/return same SoT · paper /core/…/return alias only
2) Residual TERM checklist surface — entry loads GET assets filter assigned · optional soft termination_context_id · DENY Nest /core TERM dual invent · DENY invent hrm_termination primary
3) Closed aggregate display-ready — expose asset_checklist_closed derived (0 mandatory assigned) · DENY invent PAY settle engine · DENY invent flag col as required
4) Exception — lost+notes stub RETAIN · structured bồi thường OUT
5) F.1 mỗi endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (UC-BP-CORE-06 Diễn biến) · DTO↔DB from DATA-01 · U19 scope_parity list=get=mutate
6) RETAIN CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest /core DENY · R-CORE-05-HONESTY INFO idle-ok
7) DENY wipe CORE-05/03/02b · invent CORE-07/PAY DONE · claim soft-return alone = CORE-06 DONE · claim CORE-05 = personnel UAT · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-05-01..05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
8) Unlock next: Dev wire residual ONLY if API CONFIRMED closable gap on LIVE SoT — else FE/QA journey draft; CORE-07 remain QUEUED

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md · PASS_TO_PM · Dev HOLD until API CONFIRMED
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | HOLD stamp CONFIRMED — soft-return RETAIN · TERM/CLOSED HOLD invent · exception stub · display-ready DTO cited · unlock sa API-01 wire-only · CORE-07 QUEUED · honesty false · C-SLICE. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-data-01.md` · `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md` |