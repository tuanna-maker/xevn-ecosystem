# MOB-UX-15 — Product Sanitization (no dev/test UI on user paths)

**work_item_id:** `MOB-UX-15-PROGRAM`  
**trigger:** Sponsor 2026-06-09 — Thông báo hiện `leave_request.created`, ISO timestamp, badge «Chờ duyệt» sai; yêu cầu soi toàn sản phẩm  
**verdict:** **P0 partner blocker** — nhiều màn còn nội dung QA/dev

---

## 1. Root cause — Notifications (screenshot class)

`InAppNotificationsScreen.tsx` là **màn debug MOB-13** chưa refactor:

| Anti-pattern | Ví dụ | Fix |
|--------------|-------|-----|
| UC title on UI | `UC-HRM-MOB-13 — Thông báo` | Title «Thông báo» only |
| Dev subtitle | Socket.IO / Expo push | Bỏ |
| Raw event_type | `leave_request.approved` | `resolveInboxNotificationVi()` |
| ISO timestamp | `2026-06-08T19:39:29` | `formatHrmDateTime` + relative «2 giờ trước» |
| Wrong badge | unread → «Chờ duyệt» | «Chưa đọc» / «Đã đọc» |
| Debug cards | Realtime log, Tóm tắt hệ thống, env footer | **Xóa** khỏi release path |
| UUID errors | «cần employee UUID» | User-facing Vietnamese |

---

## 2. Full mobile audit — dev leakage register

| Screen | Leakage | Wave |
|--------|---------|------|
| **InAppNotificationsScreen** | Full debug shell | **15a** P0 |
| **PayrollSummaryScreen** | `UC-HRM-MOB-09` in UI | **15b** |
| **ScopeScreen** | `x-company-id` wire debug | **15b** (hide __DEV__ only) |
| **SettingsScreen** | «UUID công ty» labels | **15c** → «Công ty» / «Mã nhân viên» |
| **LoginScreen** | UUID fields (UAT ok) | **15c** hide behind advanced toggle |
| **Error alerts** | «Cần UUID công ty» ×8 screens | **15b** centralized `userFacingScopeError()` |
| **CheckInScreen** | `MOB-401` in alert | **15b** |
| **Inbox event map** | Missing `attendance_update_request.*` | **15a** |

**Clean (post SET G):** TeamColleagueDetail, Leave list, Approvals — localized.

---

## 3. Target UX — Notifications (Apple HIG)

- Grouped inset list `#F2F2F7`
- Row: icon gradient + **Vietnamese title** + **subtitle** (tên NV / ngày nghỉ từ payload) + time «08/06/2026 · 19:39»
- Badge: **Chưa đọc** (blue dot) / no badge when read
- Tap → deep link (leave detail / approvals / payslip)
- Empty: Lottie + «Chưa có thông báo»
- **Zero** technical strings visible

---

## 4. WBS

| ID | Owner | Scope |
|----|-------|-------|
| **MOB-UX-15a** | dev-mobile | Rewrite InAppNotificationsScreen + `inboxNotificationCopy.ts` |
| **MOB-UX-15b** | dev-mobile | Strip UC-* / UUID / MOB-* from user-visible strings (features/) |
| **MOB-UX-15c** | dev-mobile | Settings/Login prod labels; Scope debug __DEV__ only |
| **MOB-UX-15-QA** | qa | Grep gate `scripts/verify-mobile-user-copy.mjs` + device J-MOB-13 |
| **MOB-UX-15-QC** | qc | Partner sanitization GO |

---

## 5. Acceptance

- Grep: no `leave_request.` / `attendance_update_request.` / `UC-HRM-MOB` / `HRM_EVENT_WEBHOOK` in `features/**` UI strings
- Notifications: 0 raw event_type in uiautomator
- Vitest inbox copy 100% event types in seed

**NOT partner-ready until MOB-UX-15-QC GO.**
