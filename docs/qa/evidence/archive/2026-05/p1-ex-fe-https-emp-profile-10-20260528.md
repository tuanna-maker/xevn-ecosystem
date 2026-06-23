# P1-EX-FE-HTTPS-EMP-PROFILE-10 — Employee profile false error fix

| Field | Value |
|---|---|
| work_item_id | `P1-EX-FE-HTTPS-EMP-PROFILE-10` |
| from_role | `pm` |
| to_role | `dev-fe` |
| date | `2026-05-28` |
| source QA fail | `docs/qa/evidence/p1-ex-qa-https-browser-01-r4-20260528.md` |
| target ack_status | `READY_FOR_QA` |

## Problem diagnosed

- QA observed `J-HRM-02` false UI error: profile page showed **"Không thể tải thông tin nhân viên"** while `GET /api/hrm/employees/:id?company_id=main` returned 200.
- FE profile loader path (`useEmployee -> getEmployeeById`) treated non-404 scope responses as terminal and also appended an unnecessary `include_archived=true` query param.
- In embed multi-scope contexts, one scope response can fail (400/409) before a valid scope resolves, causing a false profile error state.

## Implemented fixes

1. **Hardened employee-by-id scope fallback** in `apps/web/hrm/src/integrations/hrmApi.ts`:
   - Removed `include_archived=true` from employee-by-id query string.
   - Treated `400/404/409` as non-terminal per-scope failures and continued trying next scope candidate.
2. **Regression tests added**:
   - `apps/web/hrm/src/integrations/hrmApi.getEmployeeById.test.ts`
     - retries after scope 409 then succeeds on `company_id=main`
     - returns null on full 404
     - still throws on non-scope 500 errors
   - `apps/web/hrm/src/hooks/useEmployee.test.ts`
     - embed mode path with `?portal=1&companyId=main` confirms main-scope call + successful profile mapping

## Verification evidence

### Test command

```bash
pnpm --dir "apps/web/hrm" test -- src/hooks/useEmployee.test.ts src/integrations/hrmApi.getEmployeeById.test.ts
```

### Result

- **PASS** — 2 files, 8 tests passed.

## completion_report

- Closed:
  - Diagnosed false error-state trigger in employee profile fetch path for embed scope retries.
  - Implemented fetch hardening and removed brittle query param from employee-by-id request.
  - Added regression coverage for embed mode (`portal=1`, `companyId=main`) and scope fallback behavior.
- Residual:
  - Not in FE scope for this item: `/api/hrm/catalog-sync/status` 404 (`HRM-SYNC-002`) contract alignment remains BE validation item from QA report.

## next_owner

- `qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-HTTPS-EMP-PROFILE-10-R1
from_role: pm
to_role: qa
ack_status target: PASS_TO_PM

Please retest J-HRM-02 on HTTPS pilot after FE fix:
1) Login ceo@xe.vn / Xevn@2026.
2) Open /command-center/hrm/employees (iframe portal=1, companyId=main).
3) Click an employee row (e.g., NV0001) to profile detail.
4) Verify profile renders data and no "Không thể tải thông tin nhân viên" banner.
5) Capture network evidence for GET /api/hrm/employees/:id?company_id=main and UI screenshot.

Evidence path: docs/qa/evidence/p1-ex-qa-https-emp-profile-10-r1-20260528.md
Reference FE evidence: docs/qa/evidence/p1-ex-fe-https-emp-profile-10-20260528.md
```

## evidence_path

- `docs/qa/evidence/p1-ex-fe-https-emp-profile-10-20260528.md`

## ack_status

- `READY_FOR_QA`
