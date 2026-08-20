updated_at: 2026-07-27T12:05:00+07:00
work_item_id: D-HRM-CO-EMP-COUNT-DO-RESTART-01
reason: refresh freeze dist with GET /employees/summary data.by_company (Plane B 5 slugs) for live :28001; prior W6 leave create still from same source tree
prior_freeze: D-HRM-LEAVE-REQ-CREATE-BE-01 @ 2026-07-27T09:39:03+07:00 (leave create catalog partition + G-AT10-01 TEXT + inbox slug-to-UUID)
source: nest build -> dist -> dist-uat-w6 (HOLD_DEPLOY :8088 untouched)
note: FE interim Nx slug path may remain until QA promotes single summary; live API now includes by_company
