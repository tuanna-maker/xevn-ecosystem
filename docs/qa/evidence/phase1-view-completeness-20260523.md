# Phase 1 view completeness audit

**Generated:** 2026-05-23T17:15:13.590Z
**Portal:** http://127.0.0.1:5175

| View/API | HTTP | total | linked | min | PASS |
|----------|------|------:|-------:|----:|:----:|
| employees | 200 | 1100 | 50 | 100 | PASS |
| contracts | 200 | 1044 | 1044 | 100 | PASS |
| insurance-expiring | 200 | 86 | 86 | 0 | PASS |
| requisitions | 200 | 20 | 20 | 1 | PASS |
| attendance | 200 | 2664 | 50 | 10 | PASS |
| payslips | 200 | 1760 | 1760 | 10 | PASS |
| leave | 200 | 4 | 4 | 1 | PASS |
| catalogs | 200 | 14 | 14 | 1 | PASS |
| kpi-rollup | 200 | 0 | 1 | 0 | PASS |
| dept-templates | 200 | 0 | 0 | 0 | PASS |

## Summary: 10/10 critical PASS

**Phase 1 UC:** 245 total — `planned: 111`, `e2e_pass: 15` (see `pnpm phase1:gate`).
This audit is **product data completeness**, not full UC sign-off.