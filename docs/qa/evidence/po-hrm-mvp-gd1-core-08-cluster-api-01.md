# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-12 seat **#14**) |
| **uc_ids** | `UC-BP-CORE-08` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA Option A · peer seal **`CORE02QC1-MSL80DU6`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |
| **artifact_size** | SPEC_LEN=36195 · EVID_LEN=8249 (NFD) |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| UPGRADE F-CORE-RD-01 on `/api/hrm/employees/:id/rewards*` + `/discipline*` | **PASS** §5.1–§5.2 |
| DTO/ensureSchema ADD `payroll_link_status` + soft `payroll_period_id` (+ audit) | **PASS** §4.1 · DATA §4 cite |
| ADD enforce / cancel-enforce (or PATCH transition same SoT) | **PASS** §5.3–§5.4 · ALT-04 |
| Execution map Chờ/Đang/Đã/Hủy ↔ LIVE residual | **PASS** §4.2 · DATA §5 |
| amount>0→period · note-only `none` not PAY-visible · dual-period 409 · locked deny · emp Hoạt động | **PASS** §1 invariants · §7 |
| Display-ready VI | **PASS** §6 |
| Paper POST/GET `/api/hrm/core/reward-discipline` (+ /enforce) = alias only | **PASS** §3 · §5.5 |
| Soft resolve `payroll_periods` · OUT F-PAY-RD-APPLY-01 / pay_reward_link mandatory / payslip_line CORE · decisions ≠ RD | **PASS** §1 · §4.3–§4.4 · §5.6 |
| RETAIN CORE-02 packages/eins · AuthZ-403 · CB-403 · CORE-01 public · Nest `/core` DENY · U19 | **PASS** §5.6 · §8 · §10 |
| DENY claim CORE-02=pillar DONE · note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty · apps/** | **PASS** §10 |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#5 | **PASS** §5.1–§5.4 |
| Unlock Dev after CONFIRMED (not code this seat) | **PASS** §11 · §13 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | §4 link cols ADD both · §5 execution map · soft `payroll_periods` · DV/VAL · unlock ladder API |
| BA-01 | O1–O12 · AC-CORE-08-* · VAL-CORE-RD-* · BR-BP-RD-01 · J-HRM-CORE-08-01..04 DRAFT |
| SA-01 | Option A LOCKED · physical rewards*+discipline* · paper `/core` alias · REJECT Nest dual / PAY invent |
| SRS | FR-UC-BP-CORE-08 Diễn biến #1–#5 · BR-BP-RD-01 · HR-005 |
| Paper API | F-CORE-RD-01 UPGRADE · F-PAY-RD-APPLY-01 OUT · `/core/reward-discipline` = alias |
| AS-IS Nest (read-only) | `EmployeesController` GET/POST/PATCH/DELETE rewards* + discipline* (~L1073–1207) · `EmployeeProfileService` ensureSchema dual tables **no** payroll_link_* · hard DELETE residual · no enforce routes · Nest `/core` RD **ABSENT** · CORE-02/01 SEALED |
| Peer style | CORE-02 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical `/employees/:id/rewards*` + `/discipline*` · paper `/core/reward-discipline` alias only |
| RD SoT | LIVE dual tables RETAIN GĐ1 — UPGRADE link + enforce |
| Link | ADD `payroll_link_status` + soft `payroll_period_id` both tables/DTOs |
| Enforce | POST `…/enforce` + `…/cancel-enforce` preferred · PATCH same gates OK |
| Period | Soft → LIVE `payroll_periods` open/adjust · OUT process invent |
| PAY | Filter contract published · F-PAY-RD-APPLY-01 / payslip_line / pay_reward_link mandatory **OUT** |
| Decisions | Soft `decision_number` · ≠ `/decisions*` SoT |
| Errors | Mint `HRM-CORE-RD-*` · RETAIN `HRM-EMP-PROFILE-*` success · RETAIN CB/AuthZ-403 |
| Unlock | **dev-be** + **dev-fe** after this CONFIRMED |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel module UAT | **false** |
| C-SLICE | **true** — slice ≠ module DONE |
| Claim CORE-02 packages = CORE pillar DONE | **DENIED** |
| Claim note-CRUD = FR-UC-BP-CORE-08 DONE | **DENIED** |
| Nest `/core` dual RD | **DENIED** |
| Seed / honesty flip / apps/** this seat | **DENIED** |
| Reopen J-HRM-CORE-02-* / J-HRM-CORE-01-* rewrite | **DENIED** |
| Peer stamp CORE-02 | **`CORE02QC1-MSL80DU6`** RETAIN |
| Peer stamp CORE-01 | **`CORE01QC1-MSL6WMS7`** RETAIN |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | F.1 physical Option A **CONFIRMED** for UC-BP-CORE-08: UPGRADE F-CORE-RD-01 on LIVE `/employees/:id/rewards*` + `/discipline*` — ADD payroll_link DTO/ensureSchema + enforce/cancel · execution map · amount>0 period · note-only none · dual/locked/emp 409 · paper `/core/reward-discipline` alias · soft payroll_periods · OUT PAY invent · RETAIN CORE-02/01 · U19 · DENY DONE claims / reopen / seed / honesty / apps/**. Unlock **pm → BE-01 + FE-01**. |
| **next_owner** | **pm** → unlock **dev-be** + **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-api-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md` |

### next_dispatch_prompt — Dev-BE (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md · DATA-01 · BA-01 O1–O12 · SA Option A · peer CORE02QC1-MSL80DU6
entry_criteria: F.1 CONFIRMED; honesty false; C-SLICE; U65; cấm Nest /core dual · wipe dual for hrm_reward_discipline · pay_reward_link mandatory · payslip_line CORE write · fold /decisions · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty flip
MISSION: Implement physical Nest /api/hrm/employees/:id/rewards* + /discipline* — UPGRADE F-CORE-RD-01: ensureSchema ADD payroll_link_status + soft payroll_period_id (+ archived_at/payroll_period_ref/audit) on BOTH employee_rewards AND employee_discipline; DTO create/list/get/patch display-ready VI; prefer create status=pending + link none|pending_period; amount>0→period VAL-400; note-only→none; ADD POST …/enforce + …/cancel-enforce (or PATCH transition same gates); soft resolve payroll_periods open/adjust; mint HRM-CORE-RD-VAL-400 / ENFORCE-409 / DUAL-PERIOD-409 / LOCKED-PERIOD-409 / EMP-INACTIVE-409 / PERIOD-404; execution map DATA §5; U19 list=get=enforce; RETAIN HRM-CORE-CB-AUTHZ-403 · HRM-CORE-CB-403 · CORE-01 public · Nest /core DENY · decisions≠RD; OUT F-PAY-RD-APPLY-01 invent. Parallel FE-01.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-be-01.md · READY_FOR_QA
cấm: Nest /core dual · second RD wipe · pay_reward_link mandatory · payslip_line CORE · fold /decisions · claim CORE-02=DONE · claim note=FR-08 DONE · reopen J-CORE-02/01 · seed · honesty flip
```

### Parallel FE (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: API-01 CONFIRMED · BE-01 in parallel OK for UI bind stubs
MISSION: Bind tab KT/KL → GET/POST/PATCH /api/hrm/employees/:id/rewards* + /discipline*; title-first; amount>0 → period picker; Enforce/Cancel → POST …/enforce · …/cancel-enforce; F5 retain status_label + payroll_link_status + period label from BE; amounts vi-VN · dates dd/MM/yyyy; toast VAL/ENFORCE/DUAL/LOCKED/EMP; DENY Nest /core SoT · FE invent payslip Net · fold decisions as RD SoT · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · seed · honesty.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-fe-01.md · READY_FOR_QA
```
