# Evidence — PO-HRM-E2E-LINK-PAY-CFG-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-CFG-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| change_mode | ADD-only · no wipe · no_prompt_echo · NO `apps/**` |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |
| spec_source | `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` §D1–D4 (PM confirm-on-bus) |

---

## Honesty locks (unchanged — not UAT)

| Flag | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| `settings_catalog_e2e_ready` | **false** |
| `processes_catalog_bound` | **false** |
| U65 zero-seed | **true** |
| apps/** touched | **no** |
| seed | **no** |

---

## Merged deltas (D1–D4)

| SPEC § | Content | Target | Result |
|--------|---------|--------|--------|
| **D1** | Hire-to-Pay Diễn biến + AC-PAY-HIRE-01..03 + sequence | `SRS_HRM_ENTERPRISE` **FR-UC-BP-PAY-06** v**0.13** · team `UC-HRM-24` · slice `DOC-ENT-P0-HRM-PAY` E2 | MERGED |
| **D2** | Dual SoT `salary_components` vs `pay_types` · free-text lock · AC-PAY-COMP-01 | Enterprise **FR-UC-BP-PAY-02** · team §16.2 FR-HRM-SC-PAY-01 | MERGED |
| **D3** | AC-PROC-05 deep-link · AC-PROC-06 bind catalog §55–58 | team §13.1 · `HRM_MENU_DATA_LINKAGE_MATRIX` AC-PROC-05/06 + processes row | MERGED |
| **D4** | O4 picker consumer → storageKey matrix | team **§16.8** | MERGED |

### Files touched (docs only)

- `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (v0.13)
- `docs/hrm/SRS.md` (UC-HRM-24 · §13.1 · §16.2 dual SoT · §16.8)
- `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (AC-PROC-05/06)
- `docs/program/slices/DOC-ENT-P0-HRM-PAY.md` (E2 DOC-DELTA)
- `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` (§H merge stamp)

---

## Spot-check (internal)

| Check | OK |
|-------|----|
| PAY-06 still has 7 FR sections (metadata · input · flow · BR · special · sequence · Diễn biến) | yes |
| Customer Enterprise text: no work_item / sponsor chat echo | yes |
| No wipe of CORE-01a / REC-05a / prior FR bodies | yes |
| Version: 0.12 CORE retained; PAY = **0.13** | yes |

---

## completion_report

Đã merge ADD-only SPEC §D1–D4 vào Enterprise PAY-06/PAY-02 (v0.13) và team SRS (UC-HRM-24, §13.1 AC-PROC-05/06, §16.2 dual SoT, §16.8 O4 picker) + matrix. Không sửa `apps/**`, không seed, không claim payroll/settings/processes UAT-ready. Residual impl_gap Hire→payslip + processes bind + free-text TP chuyển lane SA/Dev theo P0 register.

## next_owner

**pm** → **sa** `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` (+ PROC bind)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-TECH-01
from_role: pm
to_role: sa
lane: governance
program: PO-HRM-ALL-MENU-E2E-LINK-01
change_mode: ADD-only TechSpec / API_DESIGN / DB note — NO apps/**

read_first:
1. docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md §A1 · §C P0-PAY-01..04 · §D1 (now MERGED docs)
2. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-06 · PAY-02 (AC-PAY-HIRE-* · AC-PAY-COMP-01) v0.13
3. docs/hrm/SRS.md UC-HRM-24 · §13.1 AC-PROC-05/06 · §16.2 dual SoT · §16.8 O4
4. docs/qa/evidence/po-hrm-e2e-link-pay-cfg-docs-01.md
5. _vibe-team-os/13 §3.4.11 F.1 API_DESIGN · OS 28 FE display-ready (cấm FE tự tính net)

Task:
- API_DESIGN: process/enroll/generate payslip OR explicit enroll endpoint
  - Mục đích + Nghiệp vụ xử lý + Tham chiếu bước SRS PAY-06 Diễn biến #1–#5 / AC-PAY-HIRE-*
- DB note: payroll_payslips.employee_id FK; eligibility Active+company (+ sheet chốt nếu MVP)
- Narrow: PROC bind contract GET snapshot §55–58 OR document empty+AC-PROC-05 deep-link bắt buộc (P0-PROC-01/02)
- Dual SoT: salary_components code picker vs pay_types nature — contract align AC-PAY-COMP-01
- Cấm FE tự tính net; cấm seed; honesty payroll_e2e_ready=false

exit: completion_report + next_dispatch_prompt →
  PO-HRM-E2E-LINK-PAY-HIRE-BE-01 (dev-be) + PO-HRM-E2E-LINK-PAY-HIRE-FE-01 (dev-fe)
  và/hoặc PO-HRM-E2E-LINK-PROC-BIND-01
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-hire-tech-01.md
```

## ack_status

**PASS_TO_PM**
