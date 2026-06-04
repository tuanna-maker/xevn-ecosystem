# Phase 1 view completeness audit

**Generated:** 2026-06-02T14:59:24.899Z
**Portal:** http://127.0.0.1:5173

| View/API | HTTP | total | linked | min | PASS |
|----------|------|------:|-------:|----:|:----:|
| employees | 200 | 1100 | 50 | 100 | PASS |
| contracts | 200 | 777 | 20 | 100 | PASS |
| insurance-expiring | 200 | 10 | 10 | 0 | PASS |
| requisitions | 200 | 24 | 24 | 1 | PASS |
| attendance | 200 | 304 | 50 | 10 | PASS |
| payslips | 200 | 78 | 78 | 10 | PASS |
| leave | 200 | 34 | 34 | 1 | PASS |
| catalogs | 200 | 76 | 76 | 1 | PASS |
| kpi-rollup | 200 | 0 | 1 | 0 | PASS |
| dept-templates | 200 | 0 | 0 | 0 | PASS |

## Summary: 10/10 critical PASS

**Phase 1 UC:** 245 total — `planned: 111`, `e2e_pass: 15` (see `pnpm phase1:gate`).
This audit is **product data completeness**, not full UC sign-off.