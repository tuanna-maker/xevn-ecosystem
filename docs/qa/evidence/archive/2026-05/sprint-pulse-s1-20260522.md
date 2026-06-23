# Sprint pulse — S1

**At:** 2026-05-22T23:56:17.749Z
**Owner:** PM orchestration

| Step | Exit |
|------|------|
| L0 | **0** |

### L0
```

> xevn-ecosystem@1.0.0 qc:dev-stack C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
> node ./scripts/qc-dev-stack.mjs

qc:dev-stack — xevn-ecosystem (XBOS + optional portal)

✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5175

XBOS healthy — có thể chấp nhận bước QC dev cho API.

```

| L2-pilot | **0** |

### L2-pilot
```

> xevn-ecosystem@1.0.0 test:pilot:flows C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
> node ./scripts/pilot-business-flow-smoke.mjs

pilot-business-flow-smoke — http://127.0.0.1:5175

PASS  P-CC-01  portal login expiresInSec=86400
PASS  P-CC-02  group-member-units 200 with members  HTTP 200  XBOS-TENANT-200
PASS  P-CC-03  employees page_size=100 → 200  HTTP 200  HRM-EMP-200
PASS  P-CC-04a  settings-catalogs → 200  HTTP 200  HRM-SET-200
PASS  P-CC-04b  contracts-insurance → 200  HTTP 200  HRM-CON-200
PASS  P-CC-04c  kpi-engine rollup (JWT-aligned shell scope) must not 409  HTTP 200  XBOS-KPI-202
PASS  P-CC-04  contracts route aggregate
PASS  P-CC-05  insurance contracts company_id=main → 200  HTTP 200  HRM-CON-200
PASS  P-CC-06  recruitment requisitions company_id=main → 200  HTTP 200  HRM-REC-200
PASS  P-CC-07  attendance records company_id=main → 200  HTTP 200  HRM-ATT-200
PASS  P-CC-08  payroll payslips company_id=main → 200  HTTP 200  HRM-PAY-200

=== Summary: 11/11 PASS ===

```

| FE-embed-audit | **0** |

### FE-embed-audit
```

> xevn-ecosystem@1.0.0 test:hrm-embed:audit C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
> node ./scripts/hrm-embed-fe-audit.mjs

PASS P-CC-03 200 HRM-EMP-200
PASS P-CC-04a 200 HRM-SET-200
PASS P-CC-04b 200 HRM-CON-200
PASS P-CC-05 200 HRM-CON-200
PASS P-CC-06 200 HRM-REC-200
PASS P-CC-07 200 HRM-ATT-200
PASS P-CC-08 200 HRM-PAY-200
PASS FE-hrm-health 200 HRM-HEALTH-200

Wrote C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\docs\qa\evidence\hrm-embed-fe-audit-20260522.md

```

| BE-hrm-api | **0** |

### BE-hrm-api
```

> hrm-api@0.0.1 test C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\hrm-api
> jest


Test Suites: 26 passed, 26 total
Tests:       111 passed, 111 total
Snapshots:   0 total
Time:        7.627 s, estimated 14 s
Ran all test suites.

```

| BE-xbos-api | **0** |

### BE-xbos-api
```

> xbos-api@0.0.1 test C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\xbos-api
> jest


Test Suites: 11 passed, 11 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        4.997 s, estimated 5 s
Ran all test suites.

```

| FE-hrm-vitest | **0** |

### FE-hrm-vitest
```
 RUN  v2.1.9 C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/apps/web/hrm

 ✓ src/lib/hrmDialogPortal.test.ts (5 tests) 42ms
 ✓ src/hooks/useAttendanceOverview.test.ts (1 test) 17ms
 ✓ src/lib/hrmSpreadsheetScope.test.ts (2 tests) 7ms
 ✓ src/lib/hrmDataMode.test.ts (4 tests) 8ms
 ✓ src/lib/portalAuthBridge.test.ts (2 tests) 6ms
 ✓ src/hooks/useAttendanceSheets.test.ts (1 test) 11ms
 ✓ src/hooks/useRecruitmentPlans.test.ts (1 test) 7ms
 ✓ src/hooks/useEmployee.test.ts (4 tests) 11ms
 ✓ src/components/recruitment/jobPostingsPortal.test.ts (2 tests) 6ms
 ✓ src/hooks/usePayrollPayslips.test.ts (1 test) 4ms
 ✓ src/hooks/useInsuranceList.test.ts (2 tests) 5ms
 ✓ src/hooks/useLeaveRequests.test.ts (1 test) 8ms
 ✓ src/hooks/useCandidateEvaluations.test.ts (1 test) 9ms
 ✓ src/hooks/useKanbanCandidates.test.ts (1 test) 13ms
 ✓ src/hooks/useJobRequisitions.test.ts (1 test) 6ms
 ✓ src/hooks/useAttendanceRecords.test.ts (1 test) 5ms

 Test Files  16 passed (16)
      Tests  30 passed (30)
   Start at  06:56:38
   Duration  8.77s (transform 1.04s, setup 0ms, collect 5.37s, tests 164ms, environment 44.72s, prepare 11.16s)


```

| OpenAPI-M01 | **0** |

### OpenAPI-M01
```

> xevn-ecosystem@1.0.0 verify:openapi-m01 C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
> node ./scripts/verify-openapi-m01.mjs

PASS verify-openapi-m01 C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\docs\api\openapi\xbos-api.yaml

```

## Summary

- Fail steps: **0** / 7