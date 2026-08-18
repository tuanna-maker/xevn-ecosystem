# Evidence — PO-ECO-TC-HRM-RECRUITMENT-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-HRM-RECRUITMENT-01` |
| **from_role** | qa |
| **to_role** | qa-synth (PM) |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **evidence_path** | `docs/qa/evidence/po-eco-tc-hrm-recruitment-01.md` |
| **pack_path** | `docs/qa/testcases/hrm-web/HRM-RECRUITMENT.md` |

## Scope

World-standard **catalog** TC depth cho menu **HRM Tuyển dụng** (toàn tab + popup + field + function). **Không** chạy UAT browser wave; **không** seed; **không** claim UAT/Phase1 DONE.

| Trace | Ref |
|-------|-----|
| UF | **UF-HRM-12** · UF-HRM-MENU-06 |
| Journey | **J-HRM-05** · J-REC-WF-02..06 (cross-ref trong pack) |
| Menu | **MENU-06** |
| Program | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` · U83 |

## Method (read_first)

| # | Source | Use |
|---|--------|-----|
| 1 | `apps/web/hrm/src/pages/Recruitment.tsx` | Tab shell, dashboard kanban, plans, evaluations |
| 2 | `apps/web/hrm/src/components/recruitment/*` | Per-tab UI, dialogs, columns |
| 3 | `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | U76 HDSD testid inventory (requisition, JD) |
| 4 | `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | API_CONTRACT surface |
| 5 | `docs/hrm/SRS.md` UC-HRM-22/30 · UC-HRM-INT-01 · §14 |
| 6 | Prior runtime | `po-e2e-spine-01-qa-w4-r1.md` (candidate 201) · `p1-phase1-qa-crud-rd-retest-20260606.md` (J-HRM-05 GET parity) · `qa-rec-13-s2-submit-inbox-ret-01-20260801.md` (WF submit) |

## Depth gate (DoD)

| Gate | Result |
|------|--------|
| Screen inventory | ☑ 38 `screen_id` (§1 pack) |
| Field dictionary | ☑ 94 `field_id` (§2 pack) |
| Function inventory | ☑ 62 `fn_id` (§3 pack) |
| TC matrix HP/FD/BD/AU | ☑ 118 TC · coverage check **0 GAP** (§4 pack) |
| Trace SRS/TechSpec/API/HDSD | ☑ §5 pack |
| U65 precond wording | ☑ «data từ FE» · cấm seed trong execution steps |
| U76 HDSD paths | ☑ Mọi TC UI có click path + testid khi có |

## Coverage check summary (mirror pack §4)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 62 | 62 | 0 |
| Mutate fn ≥1 FD | 28 | 28 | 0 |
| Required fields ≥1 FD/BD | 24 | 24 | 0 |
| Dialogs open/cancel/submit | 18 | 18 | 0 |

## Residual / notes for synth

| Item | Note |
|------|------|
| CampaignsTab / staffing mock rows in `Recruitment.tsx` | Một phần demo mock — TC ghi **STUB-DATA**; execution cần phân biệt API vs mock |
| Dashboard «Tạo tin tuyển dụng» CTA | Toast-only legacy dialog trong page shell — **FN-JOB-LEGACY-01** OOS primary; JobPostingsTab là SoT Tin |
| LV-02 / T_L1 ladder | TC hire/WF có tag **HOLD T_L1** khi SRS ladder thiếu bước |
| Member CEO scope | AU TC dùng `du-lich.ceo@xe.vn` — rollup tập đoàn **403/409** |

## completion_report

- **Closed:** Full menu TC pack `HRM-RECRUITMENT.md` với inventory + 118 TC PLANNED; trace UF-HRM-12 · J-HRM-05 · MENU-06; HDSD testids requisition/JD/hcp wired.
- **Open:** Không có execution verdict; synth dedupe TC-ID vs spine catalog (`PO_SPEC_TEST_CASE_CATALOG.md` TC-HP-06); Wave B menus chưa pack.

## next_owner

`qa-synth` (dedupe + rollup `PO_SPEC_TEST_REPORT.md` § Ecosystem depth) → PM dispatch execution QA khi synth PASS.

## next_dispatch_prompt

```
work_item_id: PO-ECO-TC-SYNTH-WAVE-A-01
from_role: pm
to_role: qa
Mission: SYNTH Wave A menu packs — dedupe TC-ID vs PO_SPEC_TEST_CASE_CATALOG + spine; merge FK cross-menu (Employees hire link, Inbox J-REC-WF); update docs/qa/reports/PO_SPEC_TEST_REPORT.md § Ecosystem depth và docs/qa/testcases/README.md index.
read_first: docs/qa/testcases/hrm-web/HRM-RECRUITMENT.md · docs/qa/evidence/po-eco-tc-hrm-recruitment-01.md · docs/qa/PO_SPEC_TEST_CASE_CATALOG.md
exit_criteria: No duplicate TC-ID; roster status READY_FOR_SYNTH→SYNTHED; coverage rollup table; ack_status PASS_TO_PM
cấm: apps/** edits · seed · UAT DONE claim
```
