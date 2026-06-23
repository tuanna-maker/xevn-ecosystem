# PCOMP-W7-MOB-WHOS-DETAIL-01 — J-MOB-09 whos-out row → leave detail

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-WHOS-DETAIL-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `qa-device` — J-MOB-09 detail retest: tap «Ai nghỉ hôm nay (1)» Huỳnh row → «Chi tiết nghỉ» shows Từ ngày / Đã duyệt (not «Không tìm thấy đơn») |
| **device** | `emulator-5554` |
| **API** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (71,779,426 B) |
| **SHA-256** | `C2F76C2C1AE973894BF8101E44FC60B2C2195C8344E5D916E3F2C9031BD56FBA` |
| **upstream** | `PCOMP-W7-QA-HUB-R3-05-RERUN` FAIL J-MOB-09 detail empty state |

---

## Executive verdict

**READY_FOR_QA** — Root cause fixed: `LeaveRequestDetailScreen` filtered leave list by **viewer** `employee_id`, so colleague whos-out rows opened detail with «Không tìm thấy đơn». Hub now passes `employeeId` from whos-out row; detail resolves leave `6c887177-2930-47a2-8d1f-4eba305556f8` (Huỳnh Văn An). Vitest **188/188**; tsc PASS. Device smoke **PASS** after fresh qa-device APK.

---

## Root cause

| Layer | Finding |
|-------|---------|
| Navigation | `goLeaveDetail(leave_request_id)` already passed id |
| Detail load | `GET /attendance/leave-requests?company_id={uuid}&employee_id={viewer}` — seed leave belongs to `8ac84520-…` (Huỳnh), not viewer |
| API proof | nip.io: viewer-only query → NOT_FOUND; colleague `employee_id` + company UUID → **found** |

---

## Fix summary

| File | Change |
|------|--------|
| `DashboardScreen.tsx` | `goLeaveDetail(id, employeeId?)`; whos-out `onPress` passes `row.employee_id` |
| `LeaveRequestDetailScreen.tsx` | `resolveLeaveDetailEmployeeFilter` + scoped/fallback list lookup; avatar from leave owner |
| `navigation/types.ts` | `LeaveRequestDetail: { id; employeeId? }` |
| `dashboardHubCelebrate.ts` | `leave_id` alias → `leave_request_id` |
| `utils/leaveDetailLoad.ts` | Query helper + vitest |

`index.ts` boot fix (**sync** `registerRootComponent`) — **unchanged**.

---

## Verification

### Unit / type

```text
pnpm --filter hrm-mobile test   → 188/188 PASS
pnpm --filter hrm-mobile type-check → exit 0
```

### API (nip.io)

```text
home/summary whos_out.total_count = 1
leave_request_id = 6c887177-2930-47a2-8d1f-4eba305556f8
employee_id = 8ac84520-0d6b-4737-8341-2f9a929b5f81
GET leave-requests?company_id={uuid}&employee_id={colleague} → row found
GET leave-requests?company_id={uuid}&employee_id={viewer} → row NOT in list (prior bug)
```

### Device smoke (adb)

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r dist/hrm-mobile-qa-device.apk
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# scroll Home → tap Huỳnh whos-out row
```

| Check | Result |
|-------|--------|
| Section «Ai nghỉ hôm nay (1)» | **PASS** — `whos-scroll.xml` |
| Tap → «Chi tiết nghỉ» | **PASS** |
| «Không tìm thấy đơn» | **ABSENT** |
| «Từ ngày» + «Loại nghỉ» + «Đã duyệt» + Huỳnh name | **PASS** — `whos-detail.xml` |
| Screenshot | [`whos-detail.png`](pcomp-w7-mob-whos-detail-01-screens/whos-detail.png) |

---

## completion_report

- Fixed J-MOB-09 detail navigation — whos-out row passes `employee_id` + `leave_request_id` to `LeaveRequestDetail`.
- Refactored detail load: colleague filter first, scoped fallback without employee filter.
- Vitest 188/188; tsc PASS; `index.ts` APK-02 boot path preserved.
- Built qa-device APK (71,779,426 B, SHA-256 above); emulator smoke PASS — detail shows leave fields, not empty state.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-05-RERUN-DETAIL
from_role: pm
to_role: qa-device
lane: execution

entry_criteria:
- PCOMP-W7-MOB-WHOS-DETAIL-01 READY_FOR_QA
- APK dist/hrm-mobile-qa-device.apk SHA C2F76C2C…56FBA (71,779,426 B)
- Evidence: docs/qa/evidence/pcomp-w7-mob-whos-detail-01-20260609.md

action:
1. pm clear + install APK above on emulator-5554
2. node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
3. J-MOB-09: scroll «Ai nghỉ hôm nay (1)» → tap Huỳnh row → detail MUST show Từ ngày / Đã duyệt (NOT «Không tìm thấy đơn»)
4. Regression J-MOB-06/07/08 + boot (no App entry not found)

exit_criteria:
- J-MOB-09 full PASS on device
- evidence docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-{date}.md
- ack_status PASS_TO_PM or FAIL_TO_PM
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-whos-detail-01-20260609.md`

## ack_status

**READY_FOR_QA**
