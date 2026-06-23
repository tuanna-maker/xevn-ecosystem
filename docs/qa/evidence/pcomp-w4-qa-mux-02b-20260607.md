# PCOMP-W4-QA-MUX-02b — Home hub Personio device retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-MUX-02b` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `PCOMP-W4-MOB-UX-02b` READY_FOR_QA — Personio Home hub widgets |
| **device** | `emulator-5554` · AVD `sdk_gphone64_x86_64` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` (65,445,120 B · **2026-06-07** UX-02b rebuild) |
| **API base** | `https://14-225-217-232.nip.io` (bundled) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**PASS_TO_PM** — Personio Home hub verified on device @ nip.io pilot: greeting **Xin chào, Nguyễn Văn An** + company **holding**; action cards **Chấm công hôm nay** (subtitle Check-in 16:10) and **Tạo đơn nghỉ phép**; **Hôm nay** card (check-in + **5 đơn chờ duyệt**); **Sắp tới (nghỉ phép)** with 2 upcoming rows (Vi labels). CTAs navigate to CheckIn and 4-step create; upcoming row tap opens **Chi tiết nghỉ** (LeaveHeroCard + metric grid). No `x-company-id: main` in logcat.

Machine JSON: `docs/qa/evidence/pcomp-w4-qa-mux-02b-20260607.json`

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Emulator | `adb devices` | **0** — `emulator-5554 device` |
| Pilot probe | `HRM_API_BASE_URL=https://14-225-217-232.nip.io` `HRM_MOBILE_EMAIL=uat.nv0001@xe.vn` `HRM_MOBILE_PILOT_PASSWORD=xevn-uat-2026` `node scripts/tmp-p1-resid-c03-probe.mjs` | **1** — leave=**2** payslip=2 pending=0 (Home scope OK; pending not required for MUX-02b) |
| APK bundle | `node scripts/build-apk.cjs` (prebundle) | **0** — UX-02b JS embedded |
| APK gradle | `GRADLE_USE_SUBST=1 GRADLE_SKIP_BUNDLE_TASK=1 node scripts/gradle.cjs assembleRelease -PreactNativeArchitectures=x86_64` | **0** — x86_64 (arm64 blocked by Windows path-length) |
| Install | `adb shell pm clear vn.xevn.hrm.mobile` + `adb install -r dist/hrm-mobile-release.apk` | **0** |
| Vitest regression | `cd apps/mobile/hrm-mobile && pnpm test` | **0** — **83/83** PASS |

---

## 2. Device L2.5 — MUX-02b Home acceptance

| Check | Requirement | Result | Evidence |
|-------|-------------|--------|----------|
| **J-MOB-01** | Login `uat.nv0001@xe.vn` | **PASS** | `mux02b-post-login.xml` |
| **MUX02B-GREETING** | Xin chào + employee name + company | **PASS** | `mux02b-home.xml` — **Xin chào, Nguyễn Văn An** · **holding** |
| **MUX02B-CHECKIN-CTA** | Chấm công hôm nay card | **PASS** | Subtitle **Check-in 16:10** |
| **MUX02B-LEAVE-CTA** | Tạo đơn nghỉ phép card | **PASS** | Subtitle **Gửi yêu cầu nghỉ phép mới** |
| **MUX02B-TODAY** | Hôm nay status card | **PASS** | **Check-in 16:10** + badge **Có mặt**; **5 đơn chờ duyệt** |
| **MUX02B-UPCOMING-SEC** | Sắp tới (nghỉ phép) | **PASS** | 2 rows: `15/07/2026 – 16/07/2026 · Nghỉ ốm`, `08/08/2026 – 11/08/2026 · Nghỉ phép năm` |
| **MUX02B-CHECKIN-NAV** | Tap check-in CTA → CheckIn | **PASS** | `mux02b-checkin-nav.xml` — Ghi nhận check-in screen |
| **MUX02B-LEAVE-NAV** | Tap leave CTA → create flow | **PASS** | `mux02b-create-nav.xml` — Tạo đơn nghỉ / Bước 1 |
| **MUX02B-UPCOMING-TAP** | Upcoming row → detail | **PASS** | Manual retest `mux02b-leave-detail-retest.xml` — **Chi tiết nghỉ**, hero **Nguyễn Văn An**, grid **Loại nghỉ / Từ ngày / Đến ngày** |

Automation: `node scripts/tmp-pcomp-w4-qa-mux-02b-device.mjs` exit **0** (9/9 checks)

Screens/XML: `docs/qa/evidence/pcomp-w4-qa-mux-02b-screens/`

### Scope / header audit

| Check | Result |
|-------|--------|
| `x-company-id: main` in logcat | **Not detected** (`hasMain: false`) |
| UUID in logcat | `ea430f27-74f3-4f03-99ee-1e44cb407bd9` |
| HTTP 409 / SCOPE_CONTEXT_MISMATCH | **None** during Home flows |
| Raw `LVT_*` on Home | **None** — Vi leave labels only |

---

## 3. Residual / conditions

| Item | Severity | Notes |
|------|----------|-------|
| Pilot `pending=0` (manager probe) | P2 | Unchanged; Home shows employee pending count **5** from own leave/update APIs — not J-MOB-05 scope |
| Leave balance widget | P2 | Phase 2 per dev handoff — not in MUX-02b |
| Manager pending on Home | P2 | MOB-UX-03b — employee home shows own pending only |
| APK arm64 build | Info | Windows path-length blocks multi-ABI cmake; x86_64 emulator sufficient |
| Automation upcoming tap | Info | First automation pass matched list **Đã duyệt**; manual row tap @ (540,1606) confirmed **Chi tiết nghỉ** — promotable |

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| Personio Home greeting + company | **Promoted** |
| Check-in + leave action cards + navigation | **Promoted** |
| Hôm nay status card | **Promoted** |
| Sắp tới upcoming list + tap→detail | **Promoted** |
| Leave balance on Home | **Not promoted** (Phase 2) |

---

## completion_report

- Rebuilt release APK with UX-02b Home hub JS bundle (65.4 MB, 2026-06-07) and installed on `emulator-5554`.
- Ran `tmp-pcomp-w4-qa-mux-02b-device.mjs` — **9/9** checks PASS on `uat.nv0001@xe.vn` @ nip.io pilot.
- Verified Personio Home: greeting, both CTAs, today card, upcoming section; check-in CTA → CheckIn; leave CTA → create wizard; upcoming **Nghỉ ốm** row → **Chi tiết nghỉ** with hero + metric grid.
- Vitest **83/83** regression PASS; no `main` scope leak in logcat.
- Residual: leave balance widget Phase 2; pilot manager pending=0 unchanged.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-QC-MUX-03 (or PM TODO sync)
from_role: pm
to_role: qc
entry_criteria: PCOMP-W4-QA-MUX-02b PASS_TO_PM — Personio Home hub device PASS; evidence docs/qa/evidence/pcomp-w4-qa-mux-02b-20260607.md + pcomp-w4-qa-mux-02b-20260607.json; screens docs/qa/evidence/pcomp-w4-qa-mux-02b-screens/
exit_criteria: QC audit MUX Wave Home vs MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION §3.2; update PHASE1_PRODUCT_COMPLETION_TODO PCOMP-W4-QA-MUX-02b [x]; note leave-balance Phase 2 residual
evidence_path: docs/qa/evidence/pcomp-w4-qc-mux-02b-20260607.md
ack_status: READY_FOR_QC
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-mux-02b-20260607.md`

## ack_status

**PASS_TO_PM**
