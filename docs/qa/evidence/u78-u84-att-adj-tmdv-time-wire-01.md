# Evidence — U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **U65** | honored — no seed |
| **root_qa** | [`u78-u84-primary-att-adj-tmdv-01.md`](u78-u84-primary-att-adj-tmdv-01.md) |

---

## spec_read_ack

| Layer | Cite |
|-------|------|
| QA root cause | FE POST `requested_check_in/out` = `"08:00"` / `"17:30"` → Postgres TIMESTAMPTZ → 500 `HRM-SYS-001` |
| BE contract | `CreateAttendanceUpdateRequestDto.requested_check_in/out?: string` · columns `TIMESTAMPTZ` · BE jest uses ISO `2026-04-22T08:00:00.000Z` |
| UC / HIM | UC-HRM-09 · FN-REQ-UPD-CRUD · HIM §5.5 · TC-HIM-ATT-TMDV-HP-001 |
| UI locale | Form calendar **dd/MM/yyyy**; time inputs remain `type="time"` HH:mm |

---

## What changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/attendanceUpdateRequestTime.ts` | **ADD** — `composeAttendanceDateTimeIso` · `buildAttendanceUpdateRequestTimeFields` · `formatAttendanceRequestedTimeDisplay` + `@CODE-MEMORY` |
| `apps/web/hrm/src/lib/attendanceUpdateRequestTime.test.ts` | **ADD** — 9 unit tests |
| `apps/web/hrm/src/components/attendance/AttendanceUpdateRequestTab.tsx` | **FIX** — create payload uses compose helper; list/detail show HH:mm; `@CODE-MEMORY` + CHANGE APPEND |

**Wire before → after**

| Field | Before (FAIL) | After |
|-------|---------------|-------|
| `requested_check_in` | `"08:00"` | ISO e.g. local `08:00` on `2026-07-26` → `…T…Z` |
| `requested_check_out` | `"17:30"` | ISO |
| UI time inputs | HH:mm | unchanged |
| Date picker display | dd/MM/yyyy | unchanged |

---

## Verification (dev)

```text
cd apps/web/hrm
pnpm test -- src/lib/attendanceUpdateRequestTime.test.ts
→ Test Files 1 passed · Tests 9 passed · exit 0
```

Covered: compose ymd+HH:mm → ISO; Date path; pass-through ISO; reject invalid; never emit bare HH:mm; forgot_check both sides; check_in/out omit; display HH:mm.

---

## must_keep / non-goal

- **must_keep:** list/approve/reject; leave submit; REC-PLAN; vi-VN date display
- **non-goal:** seed · claim ATT-ADJ EVIDENCED · XBOS inbox bridge · leave times · UAT DONE

---

## completion_report

**Closed:** FE→BE time wire for attendance update-requests — compose `attendance_date` + HH:mm → ISO timestamptz before POST; unit tests 9/9; CODE-MEMORY APPEND; list/detail display stays HH:mm.  
**Open:** Browser U65 retest HP+AP @ `companyId=trsport` (no TC promoted here).

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/u78-u84-att-adj-tmdv-time-wire-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true

MISSION: Retest Primary P-ATT-ADJ @ CO-TMDV after FE time-wire fix.
entry: L0 stack; portal + hrm-api; FE hot-reload or restart if needed so AttendanceUpdateRequestTab + attendanceUpdateRequestTime loaded.
persona HP: ceo@xe.vn / Xevn@2026 · companyId=trsport
path: /hr/attendance → Quản lý đơn → Đề nghị cập nhật công → Thêm đề nghị → fill NV (VTH-0007) · date · Quên chấm công · giờ · lý do STAMP → Thêm mới
AC HP: POST /attendance/update-requests **2xx/201** (not 500); Network body requested_check_in/out contain ISO `T` (not bare HH:mm); F5 list shows pending.
AC AP: login/switch mgr uat.nv0002 (trsport) → Eye → Duyệt on pending row → approved (HRM web). XBOS inbox N/A — do not fail for missing inbox bridge.
exit: evidence + U78 test-log; promote TC-HIM-ATT-TMDV-HP-001 / AP-001 only if browser PASS; no seed.
read_first: docs/qa/evidence/u78-u84-att-adj-tmdv-time-wire-01.md · u78-u84-primary-att-adj-tmdv-01.md
evidence_path: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r1.md
```
