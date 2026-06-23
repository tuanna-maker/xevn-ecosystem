# PM Resume Checkpoint — tạm dừng theo yêu cầu sponsor

**Paused at:** 2026-06-08T21:30+07:00  
**Reason:** Sponsor tắt máy — dừng sub-agent, resume khi báo lại  
**PM orchestration:** `.cursor/team/PM_ORCHESTRATION_MODE` = **STOP** (giữ nguyên)  
**Pilot:** https://14-225-217-232.nip.io  
**Mobile UAT:** `uat.nv0001@xe.vn` / `xevn-uat-2026`

---

## Cách resume (copy cho agent mới)

```text
Tiếp tục điều phối từ docs/program/PM_RESUME_CHECKPOINT.md — đọc §Đã xong / §Đang dở / §Hàng đợi kế, chạy pm:scan:backlog, dispatch lane P0 trước. Không claim Phase 1 DONE / PROD.
```

Handoff đầy đủ: conversation tổng hợp 2026-06-08 (U52–U57, mental model XeVN).

---

## § Đã xong trong phiên PM kế nhiệm (2026-06-08)

| work_item_id | Role | Verdict | Evidence |
|--------------|------|---------|----------|
| **PCOMP-W8-MOB-HOME-PORTAL-QC-02** | QC | **GO WITH CONDITIONS (reduced)** — J-MOB-11..15 full promote | `docs/qa/evidence/pcomp-w8-mob-home-portal-qc-02-20260608.md` |
| **D-W8-ESS-PROMISE-01** | Dev-Mobile | **READY_FOR_QA** — Font.loadAsync guard + ionicons preload + APK font staging; vitest 183/183 | `docs/qa/evidence/d-w8-ess-promise-01-20260608.md` |
| **PCOMP-W7-MOB-WHOS-OUT-02** | Dev-Mobile | **READY_FOR_QA** — `composeHomeSummaryParams` + membership holding slug; vitest 183/183 | `docs/qa/evidence/pcomp-w7-mob-whos-out-02-20260608.md` |

**Journey map đã sync:** J-MOB-11..15 row → QC-02; J-MOB-09 vẫn device FAIL cho đến R3-04 PASS.

---

## § Đang dở khi pause (cần kiểm tra verdict trước khi dispatch trùng)

| work_item_id | Role | Mục đích | Ghi chú |
|--------------|------|----------|---------|
| **PCOMP-W8-MOB-HOME-PORTAL-APK-01** | Dev-Mobile | Gradle `hrm-mobile-qa-device.apk` — **C-W8-DEVICE-01** | Dispatch 20:01Z — **chưa có evidence** trên disk; có thể bị cắt khi tắt máy → **re-dispatch nếu không có file APK** |
| **PCOMP-W7-QA-HUB-R3-04** | qa-device | J-MOB-09 device + J-MOB-06/07/08 + promise snackbar | Dispatch 21:15Z — **chưa có evidence** → **re-dispatch sau khi máy lên** (ưu tiên APK từ PORTAL-APK-01 hoặc bundle inject) |

**Không** coi hai lane trên là PASS/FAIL cho đến khi có `docs/qa/evidence/pcomp-w8-mob-home-portal-apk-01-*.md` và `pcomp-w7-qa-hub-r3-04-*.md`.

---

## § Conditions GWC còn mở

| ID | Owner | Trạng thái |
|----|-------|------------|
| **C-W8-DEVICE-01** | dev-mobile | OPEN — Gradle MAX_PATH; chờ PORTAL-APK-01 |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Code READY — chờ **device** proof (R3-04 hoặc wave sau) |
| **C-W7QC-DEVICE-01** | qa-device | OPEN — J-MOB-09 device; J-AVT-02 profile picker |
| **C-W8-DEVICE-02** | — | **CLOSED** (J-MOB-14 payslip CTA) |
| **C-W8-DEVICE-04** | — | **CLOSED** (POST_NOTIFICATIONS script) |

---

## § Hàng đợi kế (thứ tự PM khi resume)

1. **Kiểm tra** evidence R3-04 + PORTAL-APK-01 — nếu thiếu → re-dispatch (không trùng nếu bus đã có verdict mới).
2. **Sau R3-04 PASS:** cập nhật `PROGRAM_JOURNEY_MAP.md` J-MOB-09 → device PASS; đóng **C-W7QC-DEVICE-01** slice J-MOB-09.
3. **Sau APK ổn:** `PCOMP-W8-MOB-ESS-LEAVE-01-R3` (qa-device) — MOB-UX-07 **J-MOB-23..29**.
4. **U57 logo:** rebuild `android:apk` + `android:apk:qa-device`; QA intro splash + web favicon smoke.
5. **MOB-UX-11a** bootstrap (SA Option D) — không block whos_out/leave.
6. **QC** regate ESS/promise sau device proof (nếu snackbar còn).

---

## § Sprint ngắn (north star mobile W7–W8)

```text
QC-02 ✅ → WHOS-OUT-02 ✅ code → R3-04 device ⏸ → PORTAL-APK-01 ⏸
    → MOB-UX-07 device → U57 logo APK/QA
```

**Không claim** Phase 1 DONE / PROD.

---

## § Artifact SoT

| File | Mục đích |
|------|----------|
| `docs/program/AGENT_MESSAGE_BUS.md` | Bus — đuôi từ 2026-06-08T20:00Z |
| `docs/program/TEAM_WORKING_NOW.md` | Bảng 1 trang (PAUSED) |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-MOB-* |
| `docs/program/TEAM_USER_REQUIREMENTS.md` | U52–U57 |
| `docs/program/PM_OPEN_BACKLOG.json` | `pnpm run pm:scan:backlog` |

---

## § Lệnh smoke khi resume

```bash
pnpm run pm:scan:backlog
pnpm --filter hrm-mobile test
pnpm --filter hrm-mobile run type-check
pnpm run qc:fe-be-health:pilot
```

APK (Windows): junction `C:\xevn-ecosystem` + `GRADLE_USE_SUBST=1` — xem evidence portal QA FAIL notes.
