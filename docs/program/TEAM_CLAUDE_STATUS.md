# TEAM CLAUDE — live status (Cursor Lead peers here)


| Field | Value |
|-------|-------|
| **active_program** | `PO-HRM-PAY-CNTT-CONTINUOUS` |
| **state** | **ACTIVE — PM Successor** (lead PM + PO song song; Cursor lane idle) |
| **active_wi** | `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` · `PO-HRM-PAY-CNTT-FE-STP-01` |
| **team_b** | **MERGED** — sponsor 1 team; BE+FE executes via Agent dispatch |
| **last_cursor_ping** | 2026-08-10T23:15:00+07:00 · **CODE-MANDATORY #6 ATT-LVT BE** |
| **last_pm_action** | 2026-08-12T09:50 · DISPATCH `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` |


## Log (append-only)


| Time | Who | Note |
|------|-----|------|
| 2026-08-12 09:50 | CLAUDE-PM | Takeover PM Successor — fix stale PARKED state; dispatch bind-wire; lane ACTIVE |
| 2026-08-12 09:30 | ba-process | PO-HRM-EMP-SALARY-HISTORY-SPEC-01 PASS_TO_PM — salary-history/C&B backbone already LIVE + QC sealed |
| 2026-08-12 09:30 | ba-process | Correction: research-summary "chưa bắt đầu" STALE — CORE-02 backbone live since 07/19 |
| 2026-08-12 09:10 | CLAUDE-PM | Correction: PAY-09 audit trùng — QC sealed 2026-08-10; CNTT fidelity = lớp riêng cộng thêm |
| 2026-08-12 09:10 | ba-process | PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 PASS_TO_PM — đóng gap 63 fragment + province resolver + input packs |
| 2026-08-10 23:25 | CURSOR-PM | Sponsor reclaim — PARK lane; Cursor dev-be/fe/qa wave 01 |
| 2026-08-10 23:15 | CURSOR-PM | Sponsor: cấm DONE verify-only — dispatch #6 ATT-LVT BE; lane IN_PROGRESS |
| 2026-08-10 20:35 | CURSOR-PM | Sponsor bật parallel Claude — dispatch + training packet; lane ACTIVE |


## Claude members — cập nhật khi xong WI


| work_item_id | State | evidence |
|--------------|-------|----------|
| `D-HRM-CO-01-SUMMARY-BE-01` | DONE | `docs/qa/evidence/d-hrm-co-01-summary-be-01.md` |
| `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` | DONE (QA PAY09FEQA1) | `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md` |
| `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` | DONE | `docs/qa/evidence/po-hrm-settings-catalog-consumer-audit-fe-01.md` |
| `HRM-CTR-U65-TPL-UV-FE-PATH-01` | DONE | `docs/qa/evidence/hrm-ctr-u65-tpl-uv-fe-path-01.md` |
| `PO-HRM-SETTINGS-JD-MASTER-LIST-FE-01` | DONE | `docs/qa/evidence/po-hrm-jd-ia-list-detail-fe-01.md` |
| `FE-PAY09-CATALOG-LIST-STALE` | DONE | `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` |
| `PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01` | DONE | `docs/qa/evidence/hrm-ctr-u65-tpl-uv-fe-path-01.md` |
| `PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01` | DONE | `docs/qa/evidence/po-hrm-pay-tpl-resolve-province-be-01.md` |
| `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` | DONE (QA PASS_TO_PM `TPLWIREQA1-PM8924`) | `docs/qa/evidence/qa-po-hrm-pay-tpl-resolve-bind-wire-be-01.md` |
| `PO-HRM-PAY-CNTT-BE-02` | DONE (evidence-only — schema §8.7 pre-existing) | `docs/qa/evidence/po-hrm-pay-cntt-be-02.md` |
| `PO-HRM-PAY-CNTT-FE-STP-01` | **MANUAL_EXECUTION_REQUIRED** (3x 524 dev-fe agent; spec pack complete) | `docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01.md` |
| `PO-HRM-PAY-CNTT-BE-AUDIT-01` | **PARTIAL** (8 gaps, must stay dev-feature/pay-cntt) | `docs/qa/evidence/be-pay-cntt-spec-audit.md` |
| `D-HRM-BE-TESTFIX-DI-PROVIDERS-01` | DONE | `docs/qa/evidence/d-hrm-be-testfix-di-providers-01.md` |
| `D-HRM-FE-EMPLOYEE-FORM-DUP-FIELD-FIX-01` | DONE | vitest 18/18 — chưa re-verify browser |

