
## 2026-08-12T19:52:00+07:00 | dev-fe -> qa | READY_FOR_QA D-PAY-STP-SEARCH-ARIA-P2-01
- work_item_id: D-PAY-STP-SEARCH-ARIA-P2-01
- from_role: dev-fe
- to_role: qa
- parent: QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01 · stamp PAYPPQC1-MSPXZL1GQC1 · DEF-PAY-STP-SEARCH-ARIA-P2
- ack_status: **READY_FOR_QA**
- change_mode: FIX narrow a11y (aria-label ô tìm kiếm) + ADD 1 case vitest
- entry_criteria: QC GWC sealed; FIX a11y only
- exit_criteria: vitest PolicyPackSetupScreen + payPolicyPackForm PASS; getByLabel('Tên gói (VI)') unique
- summary: aria-label ô tìm kiếm → «Tìm kiếm trong danh sách gói» (hết trùng substring với Label «Tên gói (VI)»); vitest 16/16 PASS; lint 0; không đụng mutate/archive/bind/honesty banner/apps/api; U65 zero-seed; payroll_e2e_ready=false + CNTTBEQC1-MSO8HVERQC1 RETAIN
- evidence_path: docs/qa/evidence/d-pay-stp-search-aria-p2-01.md
- next_owner: qa
- pm_dispatch_hint: QA-PAY-STP-SEARCH-ARIA-P2-01 — spot a11y label + regression AC-PAY-STP-01-01/02/03 từ FE, CHUNG-only
