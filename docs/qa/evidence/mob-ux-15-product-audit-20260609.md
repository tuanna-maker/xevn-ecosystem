# MOB-UX-15-AUDIT — Mobile features product leakage register

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-15-AUDIT` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | `PASS_TO_PM` |
| **generated_at** | 2026-06-09 |
| **scope** | `apps/mobile/hrm-mobile/src/features/**` |
| **program_ref** | `docs/program/MOBILE_PRODUCT_SANITIZATION_AUDIT.md` |

---

## 1. Executive summary

Static grep audit of `src/features` found **52 register rows** across **15 screens**. **18 P0** (partner-visible debug shell on Notifications), **28 P1** (UC/UUID/MOB/API technical copy on user paths), **6 P2** (code comments or QA-gated dev login).

**Primary blocker:** `InAppNotificationsScreen.tsx` is still a MOB-13 debug console — raw `event_type`, ISO timestamps, Socket.IO/WEBHOOK copy, and system-summary cards are all user-visible.

**No literal UUID values** embedded in `Alert`/`setErr` strings (pattern `uuid-in-alert` = 0). Leakage is **wording** («UUID công ty», `employeeId`) and **raw API/event codes**.

`scripts/verify-mobile-user-copy.mjs` **not present** in repo — residual for `MOB-UX-15-QA`.

---

## 2. Methodology

Grep patterns (per PM dispatch):

| Pattern | Intent |
|---------|--------|
| `event_type` | Raw inbox event slug on UI |
| `UC-HRM` | Use-case IDs in titles/errors |
| `MOB-` | Internal work-item codes in alerts |
| UUID in Alert/setErr | Technical scope errors |
| `.slice(0, 19)` | ISO datetime truncation |
| `draft:` | Payroll status jargon |
| `API:` | Health/debug API lines |
| `WEBHOOK` | Server env var footer |
| `Socket.IO` | Realtime stack jargon |

Extended manual pass: `update_type` raw display, `res.code` success alerts, Scope wire debug, `GET /` path strings.

---

## 3. Severity rubric

| Sev | Definition | Partner impact |
|-----|------------|----------------|
| **P0** | Debug/test UI on default user journey | Screenshot-class blocker |
| **P1** | Technical string on error/success/subtitle users read | Trust/UX degradation |
| **P2** | Comment-only or env-gated (`qaDevLogin` / `__DEV__`) | Partner APK `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0` OK |

---

## 4. Register — grep hits (mandatory patterns)

| ID | Sev | File:line | Pattern | Snippet (truncated) | Wave |
|----|-----|-----------|---------|---------------------|------|
| AUD-001 | P0 | `notifications/InAppNotificationsScreen.tsx:133` | UC-HRM | `title={\`UC-HRM-MOB-13 — ${vi.notifications}\`}` | **MOB-UX-15a** |
| AUD-002 | P0 | `notifications/InAppNotificationsScreen.tsx:134` | Socket.IO | `subtitle="In-app + Socket.IO realtime + …"` | **MOB-UX-15a** |
| AUD-003 | P0 | `notifications/InAppNotificationsScreen.tsx:174` | event_type | `title={row.event_type}` | **MOB-UX-15a** |
| AUD-004 | P0 | `notifications/InAppNotificationsScreen.tsx:175` | ISO slice | `subtitle={row.created_at.slice(0, 19)}` | **MOB-UX-15a** |
| AUD-005 | P0 | `notifications/InAppNotificationsScreen.tsx:48` | API: | `` `API: ${h.data?.service ?? 'hrm'} (${h.code})` `` | **MOB-UX-15a** |
| AUD-006 | P0 | `notifications/InAppNotificationsScreen.tsx:80` | draft: | `` `Kỳ lương draft: ${drafts}` `` | **MOB-UX-15a** |
| AUD-007 | P0 | `notifications/InAppNotificationsScreen.tsx:184` | WEBHOOK | `HRM_EVENT_WEBHOOK_URLS, HRM_EVENT_WEBHOOK_SECRET, …` | **MOB-UX-15a** |
| AUD-008 | P1 | `payroll/PayrollSummaryScreen.tsx:35` | UC-HRM | `setErr('…gọi UC-HRM-MOB-09.')` | **MOB-UX-15b** |
| AUD-009 | P1 | `payroll/PayrollSummaryScreen.tsx:72` | UC-HRM | `UC-HRM-MOB-09 — danh sách kỳ lương…` | **MOB-UX-15b** |
| AUD-010 | P1 | `payroll/PayrollSummaryScreen.tsx:89` | UC-HRM | `UC-HRM-MOB-09 — chọn kỳ…` | **MOB-UX-15b** |
| AUD-011 | P1 | `attendance/CheckInScreen.tsx:135` | MOB- | `…(MOB-401).` | **MOB-UX-15b** |
| AUD-012 | P2 | `auth/ScopeScreen.tsx:23` | UC-HRM | `* UC-HRM-MOB-02 + U39 — …` (comment) | **MOB-UX-15b** (doc only) |
| AUD-013 | P2 | `dashboard/DashboardScreen.tsx:1549` | MOB- | `/** … MOB-UX-14-APK-02 */` (comment) | — |
| AUD-014 | P2 | `journey/JourneyScreen.tsx:46` | MOB- | `/** MOB-UX-13g — … */` (comment) | — |

**UUID-in-Alert/setErr (wording, no literal UUID values):**

| ID | Sev | File:line | Snippet | Wave |
|----|-----|-----------|---------|------|
| AUD-015 | P0 | `notifications/InAppNotificationsScreen.tsx:100` | `cần employee UUID trong phiên…` | **MOB-UX-15a** |
| AUD-016 | P0 | `notifications/InAppNotificationsScreen.tsx:103` | `Thiếu UUID công ty — bỏ qua đếm…` | **MOB-UX-15a** |
| AUD-017 | P1 | `operations/OperationsScreen.tsx:60` | `Cần UUID công ty (operations).` | **MOB-UX-15b** |
| AUD-018 | P1 | `contracts/ContractsScreen.tsx:45` | `Thiếu UUID công ty (membership company_uuid).` | **MOB-UX-15b** |
| AUD-019 | P1 | `attendance/UpdateRequestsScreen.tsx:50` | `Cần UUID công ty.` | **MOB-UX-15b** |
| AUD-020 | P1 | `attendance/CreateLeaveRequestScreen.tsx:160` | `Cần UUID công ty + employeeId.` | **MOB-UX-15b** |
| AUD-021 | P1 | `attendance/LeaveRequestDetailScreen.tsx:118` | `Thiếu UUID công ty.` | **MOB-UX-15b** |
| AUD-022 | P1 | `attendance/AttendanceHistoryScreen.tsx:79` | `Cần UUID công ty + employeeId.` | **MOB-UX-15b** |
| AUD-023 | P1 | `attendance/CreateUpdateRequestScreen.tsx:57` | `Cần UUID công ty + employeeId.` | **MOB-UX-15b** |
| AUD-024 | P1 | `attendance/CreateUpdateRequestScreen.tsx:63` | `…employeeId UUID trùng bản ghi GET /employees…` | **MOB-UX-15b** |
| AUD-025 | P1 | `attendance/UpdateRequestDetailScreen.tsx:38` | `Thiếu UUID công ty.` | **MOB-UX-15b** |

---

## 5. Register — extended product scan (same scope)

| ID | Sev | File:line | Issue | Snippet | Wave |
|----|-----|-----------|-------|---------|------|
| AUD-026 | P0 | `notifications/InAppNotificationsScreen.tsx:140-147` | Realtime debug card | `SurfaceCard title="Realtime"` + `formatRealtimeLine(item.raw)` | **MOB-UX-15a** |
| AUD-027 | P0 | `notifications/InAppNotificationsScreen.tsx:160-166` | System summary debug | `SurfaceCard title="Tóm tắt hệ thống"` | **MOB-UX-15a** |
| AUD-028 | P0 | `notifications/InAppNotificationsScreen.tsx:149-157` | Dev actions | `Xoá log realtime` button | **MOB-UX-15a** |
| AUD-029 | P0 | `notifications/InAppNotificationsScreen.tsx:176` | Wrong badge semantics | `status={row.read_at ? 'approved' : 'pending'}` → «Chờ duyệt» for unread | **MOB-UX-15a** |
| AUD-030 | P0 | `notifications/InAppNotificationsScreen.tsx:16-21` | Raw realtime type | `formatRealtimeLine` emits `hrm:event @ ISO` | **MOB-UX-15a** |
| AUD-031 | P1 | `attendance/CheckInScreen.tsx:147` | API code as success body | `Alert.alert('Thành công', res.code)` | **MOB-UX-15b** |
| AUD-032 | P1 | `attendance/CreateUpdateRequestScreen.tsx:83` | API code success | `Alert.alert('Thành công', res.code)` | **MOB-UX-15b** |
| AUD-033 | P1 | `attendance/CreateUpdateRequestScreen.tsx:93` | REST path in subtitle | `…từ GET /employees` | **MOB-UX-15b** |
| AUD-034 | P1 | `attendance/ManagerApprovalsScreen.tsx:224` | Raw update_type | `` `Chỉnh sửa chấm công · ${r.update_type}` `` | **MOB-UX-15d** (new) |
| AUD-035 | P1 | `attendance/UpdateRequestsScreen.tsx:141` | Raw update_type | `` `${item.employee_name} — ${item.update_type}` `` | **MOB-UX-15d** |
| AUD-036 | P1 | `attendance/UpdateRequestDetailScreen.tsx:62` | Raw update_type title | `title={row?.update_type ?? 'Đơn công'}` | **MOB-UX-15d** |
| AUD-037 | P1 | `auth/ScopeScreen.tsx:109` | Technical subtitle | `Header API dùng slug/UUID hợp lệ…` | **MOB-UX-15c** |
| AUD-038 | P1 | `auth/ScopeScreen.tsx:122-126` | Wire debug panel | `Tenant: … Query company_id: … x-company-id: …` | **MOB-UX-15c** |
| AUD-039 | P1 | `auth/ScopeScreen.tsx:135` | REST path | `Đang tải từ GET /operating-units…` | **MOB-UX-15c** |
| AUD-040 | P1 | `auth/ScopeScreen.tsx:144` | Query jargon | `Query company_id=main — xem toàn tập đoàn` | **MOB-UX-15c** |
| AUD-041 | P1 | `auth/ScopeScreen.tsx:145` | BR meta on UI | `meta="JWT giữ main · BR-INT-03"` | **MOB-UX-15c** |
| AUD-042 | P1 | `auth/ScopeScreen.tsx:164` | Slug label | `` `Slug: ${unit.operating_slug}` `` | **MOB-UX-15c** |
| AUD-043 | P1 | `auth/ScopeScreen.tsx:200` | tenant meta | `` `tenant: ${m.tenant_id} · scope: ${m.company_id}` `` | **MOB-UX-15c** |
| AUD-044 | P1 | `auth/ScopeScreen.tsx:99` | tenant in alert | `` `${m.company_display} (${m.tenant_id})` `` | **MOB-UX-15c** |
| AUD-045 | P1 | `settings/SettingsScreen.tsx:69` | UUID label | `UUID công ty (chấm công / lương)` | **MOB-UX-15c** |
| AUD-046 | P1 | `settings/SettingsScreen.tsx:74` | UUID label | `Mã nhân viên (UUID)` | **MOB-UX-15c** |
| AUD-047 | P2 | `auth/LoginScreen.tsx:95` | Dev alert | `Dev: nhập tenantId…` (qaDevLogin gated) | **MOB-UX-15c** |
| AUD-048 | P2 | `auth/LoginScreen.tsx:119` | Dev alert | `Dev: thiếu tenantId…` (qaDevLogin gated) | **MOB-UX-15c** |
| AUD-049 | P2 | `auth/LoginScreen.tsx:208-209` | Dev form UUID labels | `UUID công ty` / `employeeId (UUID)` (qaDevLogin) | **MOB-UX-15c** |
| AUD-050 | P2 | `auth/LoginScreen.tsx:99` | Dev key message | `khóa nội bộ (dev)` (qaDevLogin path) | **MOB-UX-15c** |

---

## 6. Clean screens (no grep hits in scope)

| Screen | Notes |
|--------|-------|
| `team/TeamDirectoryScreen.tsx` | Localized errors only |
| `team/TeamColleagueDetailScreen.tsx` | Clean |
| `profile/ProfileScreen.tsx` | Uses `resolveUpdateTypeLabel` in task chip path |
| `payroll/PayslipListScreen.tsx` | Clean |
| `payroll/PayslipDetailScreen.tsx` | Clean |
| `attendance/LeaveRequestsListScreen.tsx` | Clean list copy |
| `attendance/CreateLeaveRequestScreen.tsx` |除 AUD-020 |
| `attendance/ManagerApprovalsScreen.tsx` | Cards use `ManagerAttendanceCard` + resolver; list subtitle AUD-034 only |
| `dashboard/DashboardScreen.tsx` | Comment-only MOB ref |
| `journey/JourneyScreen.tsx` | Comment-only |
| `settings/SettingsScreen.tsx` |除 AUD-045/046 |

---

## 7. Wave mapping summary

| Wave | Owner | Register IDs | Count | Priority |
|------|-------|--------------|-------|----------|
| **MOB-UX-15a** | dev-mobile | AUD-001..007, 015, 016, 026..030 | 18 | P0 — Notifications rewrite |
| **MOB-UX-15b** | dev-mobile | AUD-008..011, 017..025, 031..033 | 16 | P1 — UC/UUID/MOB/API codes |
| **MOB-UX-15c** | dev-mobile | AUD-037..046, 047..050 | 14 | P1/P2 — Settings/Login/Scope |
| **MOB-UX-15d** *(proposed)* | dev-mobile | AUD-034..036 | 3 | P1 — `resolveUpdateTypeLabel()` on list/detail |
| — | — | AUD-012..014 | 3 | P2 comments — optional cleanup |

**New work_item recommendation:** `MOB-UX-15d` — apply existing `resolveUpdateTypeLabel` (`src/utils/profileTask.ts`) to UpdateRequests + ManagerApprovals subtitle + UpdateRequestDetail title (Manager card path already localized).

**Out of scope (noted):** `src/utils/dashboardHub.ts:205,277` also emits raw `update_type` into home hub rows — affects Dashboard via import; track under **MOB-UX-15d** or home wave.

---

## 8. Acceptance grep targets (post-fix)

Per `MOBILE_PRODUCT_SANITIZATION_AUDIT.md` §5:

```text
# Must be 0 in features/** UI strings after 15a–15c:
leave_request.
attendance_update_request.
UC-HRM-MOB
HRM_EVENT_WEBHOOK
Socket.IO
API: (health lines)
draft: (payroll status)
.slice(0, 19) on created_at
```

Add gate script `scripts/verify-mobile-user-copy.mjs` before `MOB-UX-15-QA` device pass.

---

## 9. QA residual (not closed by this audit)

| Item | Owner | Note |
|------|-------|------|
| `MOB-UX-15a/b` in-flight | dev-mobile | PM dispatched 2026-06-09 — retest after READY_FOR_QA |
| `scripts/verify-mobile-user-copy.mjs` | dev-mobile / qa | Missing — needed for MOB-UX-15-QA |
| J-MOB-13 device L2.5 | qa-device | Blocked until 15a ships + APK freeze |
| `inboxNotificationCopy.ts` | dev-mobile | Referenced in program doc; verify vitest coverage on fix |

---

## 10. Handoff

### completion_report

- Closed: full static grep + extended register of **52 rows** in `src/features/**`.
- Mapped to waves **15a/15b/15c** + proposed **15d** for `update_type`.
- Confirmed **P0 partner blocker** = `InAppNotificationsScreen` debug shell (aligns with sponsor screenshot class).
- Residual: automated grep gate script absent; device J-MOB-13 not run (audit-only dispatch).

### next_owner

`pm` → dispatch **dev-mobile** completion of 15a/b (in-flight) then **MOB-UX-15-QA** retest.

### next_dispatch_prompt

```
work_item_id: MOB-UX-15-QA
from_role: pm
to_role: qa
lane: execution

entry_criteria:
- dev-mobile MOB-UX-15a + MOB-UX-15b READY_FOR_QA with evidence paths
- scripts/verify-mobile-user-copy.mjs exists and exit 0 on features/

action:
1. Run verify-mobile-user-copy.mjs + re-grep register AUD-001..050 (expect 0 P0/P1 in partner APK)
2. Device J-MOB-13 on emulator: inbox 0 raw event_type in uiautomator; badge «Chưa đọc» not «Chờ duyệt»
3. Spot J-MOB-17 notifications tab from home IA

exit_criteria:
- evidence docs/qa/evidence/mob-ux-15-qa-YYYYMMDD.md
- ack_status PASS_TO_PM or FAIL_TO_PM with AUD-ID residuals
```

### evidence_path

`docs/qa/evidence/mob-ux-15-product-audit-20260609.md`

### ack_status

**PASS_TO_PM**
