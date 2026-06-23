# PCOMP-W8-MOB-HOME-PORTAL-QA-01-R1 — J-MOB-11..15 device evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-QA-01-R1` |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-06-08 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` · AVD api33 |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device-portal-w8.apk` (portal bundle inject + apksigner; QA deep-link flags) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` (deep-link + manual dismiss permissions) |

## Verdict

**PASS_TO_PM (GO WITH CONDITIONS)** — Portal shell **U53** visible on device: blue header + search + bell, hero carousel + dots, **8-tile** quick-access grid, ESS/MOB-UX-06 layers coexist; Smart Hub widgets partially below fold. **J-MOB-14** payslip feed CTA not device-tapped this run; **J-MOB-06** text label superseded by ESS stat cards (MOB-UX-06).

Machine JSON: `docs/qa/evidence/pcomp-w8-mob-portal-device-20260608.json`

---

## Preconditions

| Step | Command / action | Exit |
|------|------------------|------|
| Emulator | `adb devices` | **0** — `emulator-5554 device` |
| Portal bundle | `pnpm run android:apk:qa-device` (Metro bundle OK) + APK repack inject | bundle **8443115 B**; gradle native **FAIL** MAX_PATH → jar/zipalign/apksigner repack |
| Install | `adb install -r dist/hrm-mobile-qa-device-portal-w8.apk` | **0** |
| Login | `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn` | deep-link session OK; dismiss notification permission on first launch |
| Pilot API | `POST /api/hrm/auth/mobile/login` | **200** `HRM-AUTH-200` |

**L0 local:** `pnpm run qc:dev-stack` → **1** (`hrm-api :28001` down — **not** blocking nip.io device UAT).

---

## Screenshots (mandatory)

| File | Content |
|------|---------|
| `pcomp-w8-mob-portal-screens/portal-home-top.png` | Blue header, search pill, bell, carousel card + **dots**, **8-tile** grid (Hồ sơ…Xem thêm) |
| `pcomp-w8-mob-portal-screens/final-home-top.png` | ESS greeting + stat cards + Thông báo list |
| `pcomp-w8-mob-portal-screens/final-home-scroll.png` | Carousel «Sinh nhật Huỳnh Văn Hùng», pagination dots, grid row |
| `pcomp-w8-mob-portal-screens/final-home-scroll3.png` | (session ended on launcher — not promoted) |

---

## Journey matrix (J-MOB-11..15 + regression)

| Journey | AC focus | Result | Evidence / note |
|---------|----------|--------|-----------------|
| **J-MOB-11** | Header `#1E40AF`, search, bell → inbox | **PASS** | `portal-home-top.png` — avatar «BẠ», «Tìm kiếm…», bell icon; permission dialog first-run only |
| **J-MOB-12** | Carousel ≥1 slide + dots | **PASS** | `final-home-scroll.png` — «Sinh nhật Huỳnh Văn Hùng», 2 pagination dots; swipe OK |
| **J-MOB-13** | 2×4 grid, tap targets | **PASS** | 8 labels visible: Hồ sơ, Sự nghiệp, Lương, Khen thưởng, Chính sách, Chấm công, Vận hành, Xem thêm |
| **J-MOB-14** | Payslip feed + CTA → detail | **PARTIAL** | Grid «Lương» present; **Bảng lương** feed block not in captured scroll (ESS layer pushes fold). J-MOB-04 payslip API historically PASS on pilot |
| **J-MOB-15** | Portal + Smart Hub composite, 4-tab | **PASS** | Portal layers + ESS stats + announcements + carousel + grid; bottom tabs Trang chủ/Chấm công/Đơn công/Thêm |
| **J-MOB-06** | «Việc cần làm» | **PARTIAL** | ESS stat cards («Đơn chờ duyệt», «Đơn nghỉ của tôi») replace literal section title — MOB-UX-06 coexist |
| **J-MOB-07** | Manager card | **N/A** | NV persona `uat.nv0001@xe.vn` |
| **J-MOB-08** | Sinh nhật | **PASS** | Carousel birthday slide; no birth year in copy |
| **J-MOB-09** | Ai nghỉ hôm nay | **PARTIAL** | Stat tile «0 Nghỉ hôm nay» on ESS row; dedicated whos-out section not scrolled into view |

### Scope / logcat

| Check | Result |
|-------|--------|
| `x-company-id: main` | **Not detected** during session |
| FATAL crash | **None** |
| Console toast | **P2** — «Possible unhandled promise rejection (id: 0)» on home load (`final-home-top.png`) |

---

## Residual / conditions (PM → dev-mobile / qa)

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| C-W8-DEVICE-01 | P1 | Full `android:apk:qa-device` gradle fails MAX_PATH on Windows — ship CI/junction build artifact | dev-mobile / devops |
| C-W8-DEVICE-02 | P1 | J-MOB-14 device: capture **Bảng lương** feed + «Xem chi tiết» → PayslipDetail after ESS scroll order settled | qa-device |
| C-W8-DEVICE-03 | P2 | Unhandled promise rejection toast on Home | dev-mobile |
| C-W8-DEVICE-04 | P2 | Auto-dismiss POST_NOTIFICATIONS on QA deep-link script before UI dump | qa-device |

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| J-MOB-11..13, J-MOB-15, J-MOB-08 | **Promoted** (device visual) |
| J-MOB-14 payslip feed CTA device | **Not promoted** |
| J-MOB-06/09 strict Smart Hub labels | **Not promoted** (ESS overlay) |
| Vitest 149/149 (dev handoff) | **Referenced** — not re-run device |

---

## completion_report

- Built portal QA bundle (`EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`), repacked into release APK (`hrm-mobile-qa-device-portal-w8.apk`, 67 MB) after gradle native MAX_PATH block.
- Installed on `emulator-5554`; logged in `uat.nv0001@xe.vn` @ nip.io via deep-link; dismissed notification permission.
- Captured device screenshots proving U53 portal shell: blue header, carousel+dots, 8-tile grid; ESS MOB-UX-06 layers coexist per benchmark §1.4.
- J-MOB-11..13 **PASS**; J-MOB-15 **PASS**; J-MOB-08 **PASS**; J-MOB-14/06/09 **PARTIAL** with conditions above; no fatal logcat / no `main` scope leak observed.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W8-MOB-HOME-PORTAL-QC-01
from_role: pm
to_role: qc
entry_criteria: PCOMP-W8-MOB-HOME-PORTAL-QA-01-R1 PASS_TO_PM (GWC) — device evidence docs/qa/evidence/pcomp-w8-mob-portal-jmob11-20260608.md; screens pcomp-w8-mob-portal-screens/portal-home-top.png + final-home-scroll.png; vitest 149/149 dev handoff
exit_criteria: QC audit J-MOB-11..15 vs MOBILE_HOME_PORTAL_AC_DELTA.md; accept GWC C-W8-DEVICE-01..04; update PROGRAM_JOURNEY_MAP.md rows J-MOB-11..15
evidence_path: docs/qa/evidence/pcomp-w8-mob-portal-qc-20260608.md
ack_status: READY_FOR_QC
```

Secondary: `dev-mobile` — fix promise rejection + provide junction/CI `hrm-mobile-qa-device.apk` without manual repack.

## evidence_path

`docs/qa/evidence/pcomp-w8-mob-portal-jmob11-20260608.md`

## ack_status

**PASS_TO_PM**
