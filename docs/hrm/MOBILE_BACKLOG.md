# HRM Mobile Backlog (NV + Lead)

Nguồn sự thật cho ticket `MOB-*` / `MOB-BE-*`. Cập nhật `status` khi merge + evidence trên bus.

| ID | Epic | UC | Priority | Owner | Size | Depends | Status |
|----|------|-----|----------|-------|------|---------|--------|
| MOB-BE-01 | EPIC-P05-NV | UC-HRM-MOB-07 | P0.5 | Dev-BE | S | — | DONE |
| MOB-101 | EPIC-P05-NV | UC-HRM-MOB-07 | P0.5 | Dev-Mobile | M | MOB-BE-01 | DONE |
| MOB-BE-04 | EPIC-AUTH | UC-HRM-MOB-01 | P0.5 | Dev-BE | M | — | DONE |
| MOB-BE-03 | EPIC-AUTH | UC-HRM-MOB-01 | P0.5 | Dev-BE + SA | L | — | DONE |
| MOB-103 | EPIC-AUTH | UC-HRM-MOB-01 | P0.5 | Dev-Mobile | L | MOB-BE-03 | DONE |
| MOB-104 | EPIC-P05-NV | UC-HRM-MOB-05 | P0.5 | Dev-Mobile | S | — | DONE |
| MOB-105 | EPIC-P05-NV | — | P0.5 | Dev-Mobile | S | — | DONE |
| MOB-102 | EPIC-P05-LEAD | UC-HRM-MOB-10 | P1 | Dev-Mobile | M | MOB-BE-04 | DONE |
| MOB-201 | EPIC-NOTIF | UC-HRM-MOB-13 | P1 | Dev-Mobile | M | — | DONE |
| MOB-BE-05 | EPIC-P1-HR | UC-HRM-MOB-11 | P1 | Dev-BE | S | — | DONE |
| MOB-202 | EPIC-P1-HR | UC-HRM-MOB-11 | P1 | Dev-Mobile | M | MOB-BE-05 | DONE |
| MOB-205 | EPIC-NOTIF | PLAN_MOBILE_REALTIME | P1 | Dev-Mobile + BE | L | — | DONE |
| MOB-203 | EPIC-P1-HR | UC-HRM-MOB-12 | P1 | Dev-Mobile | M | — | DONE |
| MOB-204 | EPIC-P1-HR | UC-HRM-MOB-14 | P1 | Dev-Mobile | M | — | DONE |
| MOB-303 | EPIC-P1-HR | UC-HRM-MOB-09 | P1 | Dev-Mobile | M | — | DONE |
| MOB-BE-02 | EPIC-P1-LEAD | BRD manager | P1 | Dev-BE + BA | L | — | DONE |
| MOB-301 | EPIC-P1-LEAD | BRD manager | P1 | Dev-BE + Mobile | L | MOB-BE-02 | DONE |
| MOB-302 | EPIC-P05-LEAD | UC-HRM-MOB-10 | P1 | Dev-Mobile | S | MOB-102, MOB-301 | DONE |
| MOB-401 | EPIC-P2 | SRS Offline | P2 | Dev-Mobile | L | — | DONE |
| MOB-BE-06 | EPIC-P2 | BRD GPS | P2 | Dev-BE | L | — | DONE |
| MOB-402 | EPIC-P2 | BRD GPS | P2 | Dev-Mobile | L | MOB-BE-06 | DONE |
| MOB-403 | EPIC-P2 | — | P2 | Dev-Mobile | M | MOB-103 | DONE |
| MOB-404 | EPIC-P2 | — | P2 | QA | L | — | DONE |
| MOB-QA-01 | Governance | — | — | QA | M | — | DONE |
| MOB-QA-02 | Governance | — | — | QA | S | — | DONE |
| MOB-QC-01 | Governance | — | — | QC | M | P0.5+P1 | DONE |

## API / file map (tóm tắt)

- **MOB-BE-01:** `list-leave-requests.query.dto.ts`, `leave-requests.service.ts`
- **MOB-BE-03/04:** `src/auth/mobile-auth.*`, `common/jwt-sign.ts`, `docs/hrm/TECHSPEC_MOBILE.md` §Auth
- **MOB-BE-05:** `list-payroll-payslips.query.dto.ts`, `payroll.service.ts`
- **MOB-BE-02:** `employees.service.ts` (`manager_id`), list queries `manager_employee_id`
- **MOB-BE-06:** `attendance_work_sites`, geofence trong `createRecord`
- **Mobile screens:** `LeaveRequestsListScreen`, `LeaveRequestDetailScreen`, `UpdateRequestDetailScreen`, `PayslipListScreen`, `PayslipDetailScreen`
- **MOB-401:** `integrations/offlineQueue.ts`
- **MOB-404:** `docs/qa/MOBILE_E2E_SMOKE.md`, `scripts/mobile-hrm-smoke.mjs`

## Sprint order

1. MOB-BE-03/04, MOB-BE-01, MOB-101, MOB-103, MOB-104, MOB-105  
2. MOB-102, MOB-201, MOB-BE-05, MOB-202  
3. MOB-205, MOB-203, MOB-204, MOB-303  
4. MOB-BE-02, MOB-301, MOB-302  
5. MOB-401, MOB-BE-06, MOB-402, MOB-403, MOB-404  

## Definition of Done

1. Branch `feature/MOB-xxx-*` merged  
2. Bus handoff: `evidence_path`, `ack_status`  
3. Happy + alternate + exception (SRS)  
4. Release build không dùng internal key-only  
5. Dòng `status` = DONE trong bảng trên  
