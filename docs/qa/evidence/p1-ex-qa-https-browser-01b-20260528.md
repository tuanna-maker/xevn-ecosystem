# QA Evidence — P1-EX-QA-HTTPS-BROWSER-01B-R2

- work_item_id: `P1-EX-QA-HTTPS-BROWSER-01B-R2`
- from_role: `pm`
- to_role: `qa`
- environment: `https://14-225-217-232.nip.io`
- account: `ceo@xe.vn`
- executed_at: `2026-05-28`

## Entry/Exit

- entry_criteria: `R1 failed due interrupted cycle; no evidence file generated`
- target_exit: `Full browser journeys J-HRM-01,03,04,05,06,07 with URL path + API status snippet + blocked reason`

## Login Result

- Opened `https://14-225-217-232.nip.io/login`.
- Session resolved to authenticated portal state (`/command-center`) after login submission flow.
- Command Center HRM routes loaded, but HRM data APIs returned unauthorized.

## Journey Results (L2.5)

| J-ID | URL path | List API snippet | Detail check | Blocked reason | Verdict |
|---|---|---|---|---|---|
| J-HRM-01 | `/command-center/hrm/contracts` | `GET /api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized contracts/insurance access)` | Not executable (no list row due 401) | List API 401, cannot run list->employee detail | FAIL |
| J-HRM-03 | `/command-center/hrm/contracts` | `GET /api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized contracts/insurance access)` | Not executable (no list row due 401) | List API 401, cannot run list->contract detail | FAIL |
| J-HRM-04 | `/command-center/hrm/insurance` | `GET /api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized contracts/insurance access)` | Not executable (no list row due 401) | List API 401, cannot run insurance->employee detail | FAIL |
| J-HRM-05 | `/command-center/hrm/recruitment` | `GET /api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized recruitment access)` | Not executable (no list row due 401) | List API 401, cannot run recruitment list->detail | FAIL |
| J-HRM-06 | `/command-center/hrm/attendance` | `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized attendance access)` | Not executable (no list row due 401) | List API 401, cannot run attendance list->detail | FAIL |
| J-HRM-07 | `/command-center/hrm/payroll` | `GET /api/hrm/payroll/payslips?company_id=main&page=1&page_size=20 -> 401 HRM-AUTH-001 (Unauthorized payroll access)` | Not executable (no list row due 401) | List API 401, cannot run payroll list->detail | FAIL |

## Final Verdict Table

| Gate | Result | Note |
|---|---|---|
| L2 route access | PARTIAL | Command Center routes load, but HRM business data not authorized |
| L2.5 journeys (requested 6) | FAIL (0/6) | All requested J-* blocked by `HRM-AUTH-001` on list APIs |
| Overall | FAIL_TO_PM | Cannot validate list->detail under current auth propagation state |

## Completion Contract

- completion_report: Closed this retest cycle and generated required evidence artifact. Residual blocker remains: `HRM-AUTH-001` on all requested HRM list APIs under Command Center journey context, preventing executable L2.5 list->detail validation.
- next_owner: `dev-be` (with `dev-fe` auth propagation check if needed)
- next_dispatch_prompt: `work_item_id: P1-EX-BE-HTTPS-BROWSER-AUTH-01 | Reproduce QA evidence docs/qa/evidence/p1-ex-qa-https-browser-01b-20260528.md on https://14-225-217-232.nip.io with ceo@xe.vn. Fix HRM auth propagation so Command Center journeys J-HRM-01/03/04/05/06/07 list APIs stop returning HRM-AUTH-001 and allow executable list->detail. Provide regression evidence for each endpoint with company_id=main and handoff READY_FOR_QA.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-browser-01b-20260528.md`
- ack_status: `FAIL_TO_PM`
