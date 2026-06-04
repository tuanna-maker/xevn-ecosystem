# S0 pilot retest — PM auto-fix (internal)

**Date:** 2026-05-23  
**ack_status:** PASS (L2)  
**Command:** `pnpm run test:pilot:flows` → **11/11 PASS**

## Fixes applied before retest

1. Recruitment + attendance: `company_id` accepts slug `main` (DTO + DB TEXT).
2. Payroll payslips: allow `page_size` query param in DTO.
3. Restart `hrm-api` on port 28001 after deploy.
4. Extended `pilot-business-flow-smoke.mjs` for P-CC-05..08.

## User-facing

See `docs/program/USER_PILOT_STATUS.md` — all Command Center HRM tabs **Sẵn sàng**.
