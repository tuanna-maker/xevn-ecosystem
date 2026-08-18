# Evidence — PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-21) |
| **uc_ids** | `UC-BP-CORE-07` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA Option A · R-CORE-07-GATE/ACT/EFF/ATT · `CORE06QC1-MSLID363` · soft≠CORE-06 DONE · `R-CORE-06-HONESTY` idle-ok · `CORE05QC1-MSLGVT40` · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | **HOLD** status spine · **HOLD invent** gate table · **HOLD invent** `activated_at` · **NO** `apps/**` · **no migrate** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no invent/change LIVE employees status spine (`pending_docs`/`active` · open catalog RETAIN) | **PASS** §1/§4.1 |
| CONFIRM HOLD invent completeness / gate table — prefer aggregate CORE-03 checklist + DOC flags | **PASS** §4.2 · wire-capable |
| CONFIRM HOLD invent soft ADD `activated_at` — gap ABSENT PROVEN; reopen REQUIRED only if typed over wire-body | **PASS** §4.4 · grep **0** · ensureSchema omit |
| Cite display-ready activate DTO: `statusLabelVi` · `checklist_complete` · `blocking_items[]` · `activated_at` · `can_activate` | **PASS** §5 |
| RETAIN CORE-06 soft≠DONE · CORE-05 AST/BB · CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · Nest `/core` DENY · `R-CORE-06-HONESTY` idle-ok | **PASS** §9 |
| DENY wipe / invent PAY·09·ATT DONE / checklist=DONE / free PATCH=DONE / CORE-06 DONE / printable / reopen / seed / apps/** | **PASS** §9 |
| Unlock sa API-01 RETAIN cite F-CORE-ACT-01 + GATE 409 + EFF + ATT emit · paper `/core` alias · PAY/CORE-09 OUT | **PASS** §11/§12 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1–O12 · HOLD dispositions §1.5 |
| SA-01 | Option A · status RETAIN · residuals GATE/ACT/EFF/ATT |
| AS-IS | `employees.ensureSchema` no `activated_at` · grep **0** `activated_at` / `Controller('core')` / employees activate · catalog-only status assert · LIVE checklist + DOC flags |
| Peers | CORE-06..01 stamps must_keep |

---

## 3. Physical decisions (summary)

1. **Status spine:** **HOLD RETAIN** LIVE `public.employees.status` — PENDING=`pending_docs` · ENABLED=`active` — no invent/change.
2. **Gate:** **HOLD invent** completeness table — prefer aggregate checklist + `required_by_default` / `blocks_activation`.
3. **EFF:** **HOLD invent** soft ADD `activated_at` — **ABSENT PROVEN** — wire `effective_date` until REQUIRED reopen.
4. **ACT path:** physical POST activate **or** gated PATCH · `/core` alias only · **HOLD** EMP SoT.
5. **ATT:** emit only · **OUT invent** enroll DONE.
6. **Honesty:** checklist ≠ CORE-07 DONE · free PATCH ≠ DONE · soft≠CORE-06 DONE · PAY/CORE-09 OUT.

---

## 4. LIVE proof (read-only)

| Probe | Result |
|-------|--------|
| `activated_at` in `apps/api/hrm-api` | **0** matches |
| `Controller('core')` in hrm-api src | **0** matches |
| employees `activate` / `HRM-EMP-ACT` / `can_activate` | **0** matches |
| `ensureSchema` CREATE `public.employees` | cols without `activated_at` · open `status TEXT` |
| `assertEmployeeStatusPayload` | catalog + reason only — **no** checklist gate |
| `hrm_document_checklist_item` + DOC flags | LIVE CORE-03 RETAIN |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CORE / personnel / CTR UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |
| checklist alone = CORE-07 DONE | **DENIED** |
| free PATCH = CORE-07 DONE | **DENIED** |
| CORE-06 DONE / soft=DONE | **DENIED** |
| PAY / CORE-09 / ATT / printable / closed-8 DONE | **DENIED** |
| `R-CORE-06-HONESTY` | **INFO idle-ok RETAIN** |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-07-GATE-01 IN-SCOPE (aggregate LIVE checklist+DOC flags · HOLD invent completeness table) · R-CORE-07-ACT-01 IN-SCOPE (POST /employees/:id/activate OR gated PATCH) · R-CORE-07-EFF-01 IN-SCOPE (activated_at ABSENT PROVEN · HOLD invent soft ADD · wire effective_date OK) · R-CORE-07-ATT-12 emit only · OUT invent ATT/PAY/CORE-09 DONE · CORE06QC1-MSLID363 · soft≠CORE-06 DONE · R-CORE-06-HONESTY INFO idle-ok · CORE05QC1-MSLGVT40 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB must_keep
spec_ref: F-CORE-ACT-01 physical prefer POST /employees/:id/activate OR gated PATCH · LIVE employees status spine HOLD RETAIN · LIVE hrm_document_checklist_item + emp_document_type flags HOLD RETAIN · paper activated_at HOLD invent · Nest /core DENY · checklist đủ ≠ CORE-07 DONE · free PATCH ≠ CORE-07 DONE · soft≠CORE-06 DONE RETAIN

MISSION — API F.1 lock (docs-only · wire-only prefer · no schema invent):
1) RETAIN cite F-CORE-ACT-01 physical prefer POST /api/hrm/employees/:id/activate OR gated PATCH /api/hrm/employees/:id (status=active + effective_date) · paper /core/…/activate alias only
2) Residual GATE — assert before activate/gated PATCH · 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE when required incomplete or blocks_activation open · derive from LIVE checklist+DOC flags · DENY invent completeness table · DENY silent allow
3) Residual EFF — accept effective_date dd/MM/yyyy · display activated_at · HOLD invent typed col (DATA ABSENT PROVEN) · DENY epoch junk
4) Residual ATT-12 — emit readable employee.activated (employee_id · company_id · effective_date) · DENY invent ATT enroll/quỹ/ca DONE
5) Display-ready DTO from DATA-01: statusLabelVi · checklist_complete · blocking_items[] · activated_at · can_activate
6) F.1 mỗi endpoint: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (UC-BP-CORE-07 Diễn biến #1–#2 · BR-BP-LC-02) · DTO↔DB from DATA-01 · U19 scope_parity list=get=activate
7) RETAIN CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d..01 · Nest /core DENY · R-CORE-06-HONESTY INFO idle-ok
8) DENY wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT-12 DONE · claim checklist alone = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE · claim printable/closed-8 DONE · honesty flip · reopen J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**
9) Unlock next: Dev wire residual ONLY if API CONFIRMED closable gap on LIVE SoT — else FE/QA journey draft; PAY/CORE-09 remain OUT invent DONE

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md · PASS_TO_PM · Dev HOLD until API CONFIRMED
```

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD** UC-BP-CORE-07 — status spine HOLD RETAIN · gate table HOLD invent (aggregate prefer) · `activated_at` HOLD invent (ABSENT PROVEN) · display-ready activate DTO cited · must_keep CORE-06..01 · Nest `/core` DENY · unlock sa API-01 wire-only. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-data-01.md` |
| **residual** | API F-CORE-ACT-01 + GATE/EFF/ATT · J-07 DRAFT · PAY/CORE-09/ATT OUT · soft≠CORE-06 DONE · honesty idle-ok |
