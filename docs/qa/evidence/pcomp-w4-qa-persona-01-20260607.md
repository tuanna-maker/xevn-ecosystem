# PCOMP-W4-QA-PERSONA-01 — U47 persona matrix device QA (nip.io emulator)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-PERSONA-01` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** (matrix **PARTIAL** — gaps below) |
| **device** | `emulator-5554` · 1080×2400 · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-mux03b.apk` (67,053,805 B · MUX-03b build) |
| **MOB-UX-SAFE-01** | **Not merged** — no `pcomp-w4-mob-ux-safe-01-20260607.md`; interim MUX-03b APK used per dispatch |
| **api_base** | `https://14-225-217-232.nip.io` (bundled) |

## Verdict

**PASS_TO_PM** with **documented gaps** — Employee login, safe-area visuals, manager filter chips, and in-app notifications **PASS** on MUX-03b APK. **FAIL/PARTIAL:** leave **create** blocked by missing employee metadata; sticky-footer **Duyệt** + **HRM-LEAVE-203** not completed on device (pending seed = att-update only; automation did not surface footer); full NV→QL same-session E2E not closed.

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Device | `adb devices -l` | **0** — `emulator-5554` |
| PM clear + install | `adb shell pm clear vn.xevn.hrm.mobile` · `adb install -r dist/hrm-mobile-release-mux03b.apk` | **0** |
| Pilot probe | `HRM_API_BASE_URL=https://14-225-217-232.nip.io HRM_MOBILE_EMAIL=uat.nv0001@xe.vn node scripts/tmp-p1-resid-c03-probe.mjs` | **0** |

Probe (`docs/qa/evidence/pcomp-w4-qa-persona-01-probe-nipio.json`): leave **2**, payslips **2**, pending manager update-requests **1**.

---

## 2. Persona matrix (adb strict)

### A) Employee `uat.nv0001@xe.vn` — J-MOB-03 create leave → pending list

| Check | Result | Evidence |
|-------|--------|----------|
| Login | **PASS** | `persona-a-post-login.png` |
| Dashboard → Tạo đơn nghỉ phép wizard | **PARTIAL** — 4-step wizard reached | `persona-a-leave-wizard-*.png` |
| Submit → pending in list | **FAIL** | `persona-a-leave-submit-alert.xml` — alert **«Thiếu mã/tên nhân viên.»** (CreateLeaveRequestScreen blocks POST when `employee_code` / `employee_name` empty) |
| List regression (row tap) | **NOT RUN** this wave — automation tab tap landed on Chấm công after submit error | `persona-a-leave-list-pending.png` |

**Root cause (device):** `fetchEmployeeById` hydration did not populate code/name before step-4 submit for `uat.nv0001@xe.vn` on pilot.

### B) Manager `uat.nv0001@xe.vn` — J-MOB-05 More → Phê duyệt

| Check | Result | Evidence |
|-------|--------|----------|
| More → Phê duyệt | **PASS** | `persona-b-more-menu.png` |
| Filter chips Tất cả / Chỉnh sửa CC / Nghỉ phép | **PASS** — counts **1 / 1 / 0** | `persona-b-approvals-chips.png` |
| Row tap → sticky footer **Duyệt** | **FAIL** (automation + manual retest) — footer buttons not in UI dump after tap | `persona-b-approvals-sticky-footer.png` |
| Approve → **HRM-LEAVE-203** Vietnamese | **NOT EXERCISED** — queue has **att-update** only (`Huỳnh Văn An · Chỉnh sửa chấm công`); **Nghỉ phép (0)** | same |
| Approve → **HRM-ATT-REQ-203** | **NOT COMPLETED** — sticky footer not confirmed | — |

**Note:** MUX-03b UX requires row **selection** before `StickyFooter` renders **Duyệt/Từ chối** (`ManagerApprovalsScreen.tsx`). Device/uiautomator did not confirm footer in this run — PM dispatch **qa-device** follow-up or **dev-mobile** a11y label on footer buttons.

### C) Same-session E2E NV submit → manager approve

| Step | Result | Evidence |
|------|--------|----------|
| Logout → `uat.nv0005@xe.vn` login | **PASS** | `persona-c-sub-post-login.png` |
| Subordinate create leave | **PARTIAL** — wizard ran; script flagged list OK but tab navigation unreliable | `persona-c-sub-leave-wizard-*.png` |
| Logout → manager `uat.nv0001@xe.vn` | **PASS** | `persona-c-mgr-post-login.png` |
| Manager approve new leave | **FAIL** — same sticky-footer gap; no leave pending in chip filter | `persona-c-mgr-approvals-*.png` |

### D) Safe area — Home top + bottom tab bar

| Check | Result | Evidence |
|-------|--------|----------|
| Status bar vs greeting | **PASS** (visual) — «Trang chủ» / «Xin chào, Nguyễn Văn An» below status icons (5:28–5:35 captures) | `persona-d-home-top.png` |
| Tab bar vs Android 3-button/gesture nav | **PASS** (visual) — tab icons above system nav pill (`navigationBarBackground` y≈2337) | `persona-d-home-bottom-tabs.png` |

**Gap:** Formal **MOB-UX-SAFE-01** artifact absent; MUX-03b APK includes `tabBarStyle` safe insets in source (`RootNavigator.tsx`) — visual PASS, governance handoff pending.

### E) Notifications — push OFF, in-app poll

| Check | Result | Evidence |
|-------|--------|----------|
| More → Thông báo | **PASS** | `persona-e-notifications.png` |
| In-app poll / Làm mới | **PASS** — mailbox 12 unread; manual refresh | same |
| Expo push on pilot APK | **OFF** (expected) — no `ExpoPushToken` in logcat; `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` | JSON `logcat.pushOff: true` |
| Realtime socket | **CONDITION** — «Realtime: lỗi kết nối» on pilot (poll-only acceptable per U47) | same |

---

## 3. Header / scope

| Signal | Result |
|--------|--------|
| `x-company-id: main` in logcat | **not detected** (`hasMain: false`) |
| Login persona UUID panel | Present on home (holding scope) |

---

## 4. Gaps (PM dispatch)

| ID | Severity | Gap | Suggested owner |
|----|----------|-----|-----------------|
| G-PERSONA-A1 | **P0** | Leave create fails «Thiếu mã/tên nhân viên» — employee metadata not loaded on CreateLeaveRequestScreen | `dev-mobile` |
| G-PERSONA-B1 | **P0** | MUX-03b sticky footer **Duyệt** not verified on device after row select | `qa-device` retest or `dev-mobile` a11y |
| G-PERSONA-B2 | **P1** | Pilot pending queue = att-update only — seed leave pending for **HRM-LEAVE-203** | `devops` `seed:hrm:uat-mob-pilot-qual` + leave row |
| G-PERSONA-C1 | **P1** | NV→QL same-session E2E not closed on app | blocked by G-PERSONA-A1 + B1 |
| G-MOB-UX-SAFE | **P2** | MOB-UX-SAFE-01 formal READY_FOR_QA / merged APK not delivered | `dev-mobile` |

---

## 5. Promoted / not promoted

| Item | Status |
|------|--------|
| MUX-03b filter chips on Phê duyệt | **Promoted** |
| Safe area visual (D) on MUX-03b | **Promoted** (visual; MOB-UX-SAFE governance open) |
| In-app Thông báo poll, push OFF | **Promoted** |
| J-MOB-03 create leave on device | **Not promoted** |
| J-MOB-05 sticky Duyệt + HRM-LEAVE-203 | **Not promoted** |
| J-MOB-03 row tap regression | **Not promoted** (deferred this run) |
| E2E NV→QL on device | **Not promoted** |

---

## completion_report

- Installed **MUX-03b** release APK on `emulator-5554`; nip.io probe **exit 0** (`pending=1`).
- Ran persona automation `scripts/tmp-pcomp-w4-qa-persona-01-device.mjs` + manual approve retest.
- **PASS:** login, filter chips, safe-area screenshots, in-app notifications, push OFF.
- **FAIL:** leave create (metadata), sticky-footer approve completion, HRM-LEAVE-203, full E2E C.
- Evidence: this file + JSON + 32 screenshots under `pcomp-w4-qa-persona-01-screens/`.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-MOB-LEAVE-META-01
from_role: pm
to_role: dev-mobile
entry_criteria: PCOMP-W4-QA-PERSONA-01 G-PERSONA-A1 — CreateLeaveRequestScreen submit fails «Thiếu mã/tên nhân viên» for uat.nv0001@xe.vn on nip.io MUX-03b APK
exit_criteria: employee_code/name hydrated before step 4; jest regression; READY_FOR_QA with evidence path
evidence_path: docs/qa/evidence/pcomp-w4-mob-leave-meta-01-20260607.md
ack_status: READY_FOR_QA

work_item_id: PCOMP-W4-QA-PERSONA-01-R2
from_role: pm
to_role: qa-device
entry_criteria: After leave-meta fix + devops seed leave pending>=1; MUX-03b or MOB-UX-SAFE APK; adb sticky footer Duyệt + HRM-LEAVE-203 + E2E uat.nv0005→uat.nv0001
exit_criteria: docs/qa/evidence/pcomp-w4-qa-persona-01-r2-20260607.md PASS on A/B/C/D/E
evidence_path: docs/qa/evidence/pcomp-w4-qa-persona-01-r2-20260607.md
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-persona-01-20260607.md` · `docs/qa/evidence/pcomp-w4-qa-persona-01-20260607.json` · `docs/qa/evidence/pcomp-w4-qa-persona-01-screens/`
