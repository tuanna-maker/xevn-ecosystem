# Evidence — PO-HRM-ATT-03d-05b-FE-01 (RE-KICK)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-03d-05b-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-05 |
| **uat_done** | false (U65 — QA browser FE→API) |
| **prior** | Seat stalled after N×GET panel; RE-KICK wires BE panel endpoint |

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| **srs** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` v0.8 · **FR-UC-BP-ATT-03d** · **FR-UC-BP-ATT-05b** |
| **adr** | `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` · work-sites SoT (D3) |
| **be evidence** | `docs/qa/evidence/po-hrm-att-03d-05b-be-01.md` READY_FOR_QA |
| **api** | `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites` · **`GET /api/hrm/attendance/leave-balance/panel`** |
| **change_mode** | UPGRADE · preserve_default |
| **cấm** | remaster-all · Nest rewrite · seed · PROP-03e |

## completion_report

### Closed

1. **ATT-03d GPS work-sites (S74/S75)**
   - List/create/edit/delete Nest-wired (`useAttendanceRules` + `hrmApi`).
   - Edit UI: Pencil → dialog → `updateGPSLocation` → PATCH → refetch; testids `att-gps-edit-*`.
   - Create/update gửi `radius` + `radius_meters` (BE alias OK).
   - `company_id` = token / `currentCompanyId` (normalize slug).
   - Empty list hợp lệ; no default-site seed.

2. **ATT-05b leave quỹ panel (RE-KICK delta)**
   - **`fetchLeaveBalancePanel`** → `GET /attendance/leave-balance/panel`.
   - **`useLeaveBalancesByType`** — một GET (không N× single-type); 5 MVP rows; zeros OK.
   - LeaveTab: panel bảng `leave-balance-by-type`; selected detail từ panel khi loại MVP; single-type GET chỉ khi loại ngoài MVP.
   - Projected remaining khi chọn ngày (`leave-balance-projected`).
   - Parse helpers: `parseLeaveBalancePanelPayload` · `findLeaveBalanceInPanel`.

3. **Honesty / must_keep**
   - Face ID / D4 stubs / PROP-03e QR untouched.
   - No seed; empty/zeros = product-valid.
   - CODE-MEMORY VI APPEND trên hook/lib/LeaveTab.

### Residual

| Item | Owner |
|------|--------|
| Browser screenshots GPS + leave panel + Network 2xx+F5 | **qa** U65 |
| Face mobile MVP | out of web scope |
| Full ATT remaster pale-text | remaster squad (cấm wave này) |

### Files touched (RE-KICK)

- `apps/web/hrm/src/lib/leaveBalance.ts` + `.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — `fetchLeaveBalancePanel`
- `apps/web/hrm/src/hooks/useLeaveBalancesByType.ts` — panel GET
- `apps/web/hrm/src/hooks/useAttendanceRules.ts` — radius alias + CODE-MEMORY
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — panel wire

## Verification (unit)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/leaveBalance.test.ts src/hooks/useAttendanceRules.rounding.test.ts
# → 9/9 PASS (2026-08-05 RE-KICK)
```

## QA matrix (U65 — browser-only)

| UF | Persona | Click path | Expect |
|----|---------|------------|--------|
| ATT-03d GPS | `ceo@xe.vn` | Attendance → Cài đặt → Quy tắc → App → GPS | GET work-sites; empty OK |
| ATT-03d create | same | Thêm vị trí → Lưu | POST 2xx → row; **F5** còn |
| ATT-03d edit | same | Pencil → sửa radius → Lưu | PATCH 2xx → FE; **F5** |
| ATT-03d delete | same | Trash | DELETE 2xx → gone; **F5** |
| ATT-05b panel | same | Nghỉ phép → Tạo yêu cầu → chọn NV | Network **`/leave-balance/panel`** 200; 5 rows; zeros OK |
| ATT-05b project | same | Chọn khoảng ngày | `leave-balance-projected` khi days>0 |

### Screenshots (QA capture — FE unit-only this seat)

| Slot | Suggested file | Status |
|------|----------------|--------|
| GPS list + edit dialog | `docs/qa/evidence/shots/po-hrm-att-03d-gps.png` | **QA** |
| Leave quỹ panel | `docs/qa/evidence/shots/po-hrm-att-05b-leave-panel.png` | **QA** |

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-03d-05b-QA-01
from_role: qa
to_role: pm
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true

entry_criteria:
- L0 stack up (hrm-api :28001 + portal)
- FE READY_FOR_QA docs/qa/evidence/po-hrm-att-03d-05b-fe-01.md
- BE READY_FOR_QA docs/qa/evidence/po-hrm-att-03d-05b-be-01.md
- cấm seed · cấm API mutate ngoài UI

exit_criteria:
- Browser ATT-03d: GPS list/create/edit/delete → Network work-sites 2xx + FE sau 2xx + F5
- Browser ATT-05b: create leave dialog → Network GET /attendance/leave-balance/panel 200; 5 types; zeros OK; projected when dates set
- Screenshots GPS + leave panel under docs/qa/evidence/shots/ or embedded
- evidence_path: docs/qa/evidence/po-hrm-att-03d-05b-qa-01.md
- ack_status: PASS_TO_PM or FAIL with defect ids
```
