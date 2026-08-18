# Evidence — PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01` |
| **lane** | governance · sa |
| **date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-20 #22) |
| **uc_ids** | `UC-BP-CORE-06` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md` |
| **depends_on** | DATA-01 CONFIRMED HOLD · BA-01 O1–O12 · SA Option A · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01 · `CORE05QC1-MSLGVT40` · `CORE05QA2-MSLGSWSF` · `R-CORE-05-HONESTY` INFO idle-ok · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |

---

## Verdict

**CONFIRMED** — RETAIN cite **F-CORE-AST-02** physical `PATCH /api/hrm/employees/:id/assets/:assetId` (status+return_date) on LIVE `employee_assets` · TERM checklist = GET assigned · closed = derived aggregate · paper `/core` alias only · unlock **prefer FE+QA journey** · Dev-BE **HOLD** invent.

| Gate | Result |
|------|--------|
| F.1 Mục đích + Nghiệp vụ + SRS Diễn biến #1–#2 (AST-02) | **PASS** §4 |
| TERM residual F.1 (GET assigned · soft context) · DENY Nest TERM invent | **PASS** §5 |
| Closed aggregate derived · DENY flag col / PAY settle invent | **PASS** §6 |
| Exception lost+notes stub · structured OUT | **PASS** §7 |
| DTO↔DB DATA-01 HOLD RETAIN · U19 list=get=mutate | **PASS** §4.5 · §8 |
| Nest `/core` DENY · soft≠DONE · CORE-07/PAY OUT | **PASS** §10 |
| must_keep CORE-05..01 · `R-CORE-05-HONESTY` idle-ok · honesty false | **PASS** §10 |
| Closable gap: soft PATCH LIVE · closed envelope optional · TERM→FE | **PASS** §11 |
| Unlock FE+QA prefer · Dev-BE HOLD invent | **PASS** §12 |
| Docs-only (no apps/** this seat) | **PASS** |

---

## AS-IS cite (read-only)

| Fact | Cite |
|------|------|
| Soft-return PATCH LIVE | `employees.controller.ts` `PATCH …/assets/:assetId` · `updateAsset` · `HRM-EMP-PROFILE-202` |
| GET assets LIVE | `listAssets` + `statusLabelVi` · BB flags · **no** `asset_checklist_closed` envelope |
| Thin `/return` | **ABSENT** · HOLD invent |
| `hrm_termination` / terminations | **ABSENT** (grep 0) |
| Nest `@Controller('core')` | **ABSENT** |
| CORE-05 soft returned F5 | `po-hrm-mvp-gd1-core-05-cluster-be-01.spec.ts` status=returned → «Đã thu hồi» |

---

## Honesty (LOCKED false)

- `recruitment_uat_ready=false`
- `jd_dynamic_done=false`
- `contracts_printable_ready=false`
- `hrm_personnel_uat_ready=false`
- **C-SLICE** · U65 · **`R-CORE-05-HONESTY` INFO idle-ok**
- **DENY** claim soft-return = CORE-06 DONE · CORE-05 = personnel · CORE-07/PAY / printable / closed-8 DONE

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 CONFIRMED: RETAIN F-CORE-AST-02 physical PATCH assets* soft-return · TERM checklist GET assigned · closed aggregate derived · exception lost+notes · must_keep CORE-05..01 · DENY Nest dual / TERM invent / PAY / soft=DONE · unlock FE+QA · Dev-BE HOLD invent. |
| **next_owner** | **pm** → **dev-fe** + **qa** |
| **next_dispatch_prompt** | Spec §13 |
| **evidence_path** | this file + API-01 spec |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
