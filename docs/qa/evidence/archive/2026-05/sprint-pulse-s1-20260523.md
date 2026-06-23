# Sprint pulse — S1

**At:** 2026-05-23T14:29:15.827Z
**Owner:** PM orchestration

| Step | Exit |
|------|------|
| L0 | **0** |

### L0
```

> xevn-ecosystem@1.0.0 qc:dev-stack C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
> node ./scripts/qc-dev-stack.mjs

qc:dev-stack — xevn-ecosystem (HRM + XBOS + portal)

✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5175

HRM + XBOS healthy — có thể chấp nhận bước QC dev (chạy thêm `pnpm run qc:fe-be-health` trước UAT).

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

Wrote C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\docs\qa\evidence\hrm-embed-fe-audit-20260523.md

```

| BE-hrm-api | **0** |

### BE-hrm-api
```

> hrm-api@0.0.1 test C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\hrm-api
> jest


Test Suites: 27 passed, 27 total
Tests:       114 passed, 114 total
Snapshots:   0 total
Time:        15.706 s
Ran all test suites.

```

| BE-xbos-api | **0** |

### BE-xbos-api
```

> xbos-api@0.0.1 test C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\api\xbos-api
> jest


Test Suites: 18 passed, 18 total
Tests:       77 passed, 77 total
Snapshots:   0 total
Time:        7.555 s, estimated 8 s
Ran all test suites.

```

| FE-hrm-vitest | **0** |

### FE-hrm-vitest
```

 ✓ src/hooks/useRecruitmentPlans.test.ts (1 test) 8ms
 ✓ src/components/recruitment/jobPostingsPortal.test.ts (2 tests) 5ms
 ✓ src/lib/hrmSpreadsheetScope.test.ts (2 tests) 6ms
 ✓ src/lib/hrmDialogPortal.test.ts (5 tests) 42ms
 ✓ src/lib/hrmDataMode.test.ts (4 tests) 8ms
 ✓ src/lib/hrmLinkedDataEmpty.test.ts (6 tests) 9ms
 ✓ src/lib/portalAuthBridge.test.ts (2 tests) 6ms
 ✓ src/hooks/useAttendanceOverview.test.ts (1 test) 15ms
 ✓ src/hooks/useEmployee.test.ts (4 tests) 11ms
 ✓ src/hooks/useInsuranceList.test.ts (2 tests) 5ms
 ✓ src/hooks/usePayrollPayslips.test.ts (1 test) 5ms
 ✓ src/hooks/useAttendanceSheets.test.ts (1 test) 5ms
 ✓ src/hooks/useLeaveRequests.test.ts (1 test) 7ms
 ✓ src/hooks/useCandidateEvaluations.test.ts (1 test) 6ms
 ✓ src/hooks/useKanbanCandidates.test.ts (1 test) 11ms
 ✓ src/hooks/useJobRequisitions.test.ts (1 test) 3ms
 ✓ src/hooks/useAttendanceRecords.test.ts (1 test) 3ms

 Test Files  17 passed (17)
      Tests  36 passed (36)
   Start at  21:29:49
   Duration  6.88s (transform 839ms, setup 0ms, collect 4.23s, tests 155ms, environment 36.51s, prepare 6.93s)


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