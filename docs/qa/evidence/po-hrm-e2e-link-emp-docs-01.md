# Evidence — PO-HRM-E2E-LINK-EMP-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| change_mode | ADD-only |
| date | 2026-08-06 |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| SoT merged (khách) | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (**v0.12** EMP delta; tip hiện **v0.13** sau PAY parallel) |
| SoT team DOC-DELTA | `docs/hrm/SRS.md` UC-HRM-27 **BR-DEC-05** · AC-DEC-EMP-01 · §16.4 WH picker mirror |
| source drafts | `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md` §D + §E |
| ack_status | **PASS_TO_PM** |

## Honesty locks

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| U65 zero-seed | **true** (docs only) |
| Touched `apps/**` | **false** |
| no_prompt_echo (FR khách) | **true** — không work_item / path code / chat sponsor trong thân FR |
| no wipe | **true** — chỉ ADD/EXPAND; REC-03·CORE-04 OUT giữ |

## Before → After (§D map)

| SPEC §D | Merge | Artifact |
|---------|-------|----------|
| D.1 C&B boundary AC | EXPAND CORE-01 + CORE-02 | AC-CORE-PUB-01..02 · AC-CORE-CB-MAP-01 · AC-CORE-CB-01..02; field cấm trên form công khai |
| D.2 QSĐ→WH FR | **ADD** FR-UC-BP-CORE-01a (7 mục) | AC-DEC-WH-01..04; inventory 52→**53** |
| D.3 WH picker | Trong CORE-01a + team §16.4 | AC-WH-PICK-01..03 · mirror BR-HRM-MD-01 / AC-HRM-PICKER-01 |
| D.4 CORE-09 AC | EXPAND FR-UC-BP-CORE-09 | AC-CTR-TPL-01..05 |
| D.5 CORE-10 AC | EXPAND FR-UC-BP-CORE-10 | AC-SI-TL-01..06 |
| D.6 HTP bước 5 | EXPAND FR-UC-BP-REC-07 | AC-HTP-05-01..03 + Diễn biến HĐ hiệu lực trước lương |
| D.7 BR-DEC-05 | Team DOC-DELTA | `employee_id` **required** loại gắn người; AC-DEC-EMP-01 |

## Version / changelog

- EMP merge stamped **0.12** in §6.2 (AC codes đầy đủ).
- Document tip / footer may read **0.13** (PAY DOC-DELTA parallel cùng ngày) — **must_keep** PAY rows; không đè.
- Inventory khóa header: **53** (+ CORE-01a).

## Spot-check FR 7 mục (CORE-01a)

| Mục | Có |
|-----|-----|
| Thông tin chung | ✓ |
| Dữ liệu đầu vào | ✓ |
| Luồng chính | ✓ |
| Quy tắc nghiệp vụ | ✓ |
| Trường hợp đặc biệt | ✓ |
| sequenceDiagram | ✓ |
| Diễn biến + AC | ✓ |

## Residual (không đóng bởi docs)

| Residual | Owner next |
|----------|------------|
| TechSpec F.1 + DB/API: `decision_id`→WH; SI timeline actions; HTP-05 fields | **sa** `PO-HRM-E2E-LINK-EMP-SA-01` — HOLD code đến confirm |
| FE WH Input free-text; C&B trên EmployeeForm; QSĐ không bắt NV; CORE-10 actions UI | **dev-fe/be** sau SA |
| Browser U65 D1–D7 | **qa** sau FE/BE |

## Completion contract

- `completion_report`: Merged EMP SPEC §D.1–D.6 ADD-only into Enterprise (**0.12** / tip **0.13**); ADD CORE-01a; EXPAND CORE-01/02/09/10 + REC-07; team BR-DEC-05 + AC-DEC-EMP-01 + §16.4 WH mirror; inventory **53**; honesty `hrm_personnel_uat_ready=false`; **không** `apps/**`.
- `next_owner`: **sa** (`PO-HRM-E2E-LINK-EMP-SA-01`) — PM intake rồi dispatch.
- `next_dispatch_prompt`: copy-ready bên dưới.
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-e2e-link-emp-docs-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-SA-01
from_role: pm
to_role: sa
lane: governance
program: PO-HRM-ALL-MENU-E2E-LINK-01
change_mode: ADD
ack_target: PASS_TO_PM

entry_criteria:
  - docs merge PASS: docs/qa/evidence/po-hrm-e2e-link-emp-docs-01.md
  - read_first:
      - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md — FR-UC-BP-CORE-01/01a/02/09/10 · REC-07 AC-HTP-05
      - docs/hrm/SRS.md UC-HRM-27 BR-DEC-05 · AC-DEC-EMP-01
      - docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.2/D.5/D.6 · §E queue
      - TECHSPEC_HRM_ENTERPRISE.md (CORE / decisions / insurance map nếu có)

task:
  - ADD TechSpec F.1 + DB_DESIGN/API_DESIGN (hoặc delta): decision_id → work history write-on-effective;
    insurance timeline actions Đóng/Ngừng/Tạm hoãn/đổi mức; HTP-05 fields (employee_id + active contract same company)
  - Trace Diễn biến CORE-01a / CORE-10 / REC-07 AC → API mục đích + bước SRS
  - HOLD code apps/** đến confirm; honesty hrm_personnel_uat_ready=false

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-sa-01.md
  - completion_report + next_dispatch_prompt → PO-HRM-E2E-LINK-EMP-BE-01 + FE-01 (parallel sau SA)
  - ack_status PASS_TO_PM

cấm: apps/** · seed · claim hrm_personnel_uat_ready
```
