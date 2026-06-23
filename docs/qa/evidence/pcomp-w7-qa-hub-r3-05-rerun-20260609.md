# PCOMP-W7-QA-HUB-R3-05-RERUN — APK-02 boot fix + hub regression

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QA-HUB-R3-05-RERUN` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL_TO_PM** |
| **pm_dispatch_hint** | `dev-mobile` — **PCOMP-W7-MOB-WHOS-DETAIL-01**: J-MOB-09 whos-out row tap opens «Chi tiết nghỉ» but shows **«Không tìm thấy đơn»** — pass `leave_id` from hub summary row to LeaveRequestDetail |
| **device** | `emulator-5554` |
| **API** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (71,778,157 B) |
| **SHA-256** | `96301F435481095523F338C5A4EABA09237A3C1ADE67F66F89665C3E710FB1CF` |
| **upstream** | `PCOMP-W8-MOB-HOME-PORTAL-APK-02` · [`pcomp-w8-mob-home-portal-apk-02-20260609.md`](pcomp-w8-mob-home-portal-apk-02-20260609.md) |

---

## Executive verdict

**FAIL_TO_PM** (boot blocker **resolved**; one hub residual) — APK-02 cold boot **PASS** (login/dev JWT form, no permanent «App entry not found»). Seed `who=1`, API hub probe **PASS**. Login deep-link + ADBKeyboard **PASS**. **J-MOB-06/07/08**, **D-W8-ESS-PROMISE-01**, **J-MOB-11..15** **PASS** on device (aggregate scroll audit). **J-MOB-09** **PARTIAL FAIL**: section «Ai nghỉ hôm nay (1)» + ESS «Nghỉ hôm nay, 1» parity **PASS**, but tap → detail shows **«Không tìm thấy đơn»** instead of leave fields.

---

## Environment & commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# 1 Reseed
node scripts/seed-hrm-uat-mob-hub-qual.mjs                    # exit 0 — whos_out_count=1

# 2–3 Clear + install
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile     # Success
& $adb -s emulator-5554 install -r $apk                       # Success — 71778157 B, SHA match

# 4 Cold boot (after pm clear)
& $adb -s emulator-5554 shell logcat -c
& $adb -s emulator-5554 shell am start -W -n vn.xevn.hrm.mobile/.MainActivity
# UI: login-email + Dev sign-in visible — NO «App entry not found» permanent screen

# 5 Deep-link login
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true, fatal_logcat=false

# 6 Hub automation + scroll audit
$env:APK_PATH = "<repo>\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
node scripts/tmp-pcomp-w7-qa-hub-r3-04-device.mjs             # exit 1 — final-scroll-only false negatives; UI dumps audited manually
```

Machine JSON: [`pcomp-w7-qa-hub-r3-05-rerun-20260609.json`](pcomp-w7-qa-hub-r3-05-rerun-20260609.json) · hub session: [`pcomp-w7-qa-hub-r3-04-20260608.json`](pcomp-w7-qa-hub-r3-04-20260608.json)  
Screens/XML: `docs/qa/evidence/pcomp-w7-qa-hub-r3-05-rerun-screens/` · hub dumps: `pcomp-w7-qa-hub-r3-04-screens/`

---

## Exit criteria matrix

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Reseed `who≥1` | **PASS** | `whos_out_count=1`, `dob_today_count=3` |
| 2 | `pm clear` + install APK-02 | **PASS** | 71,778,157 B; SHA-256 match |
| 3 | Boot — NO «App entry not found» | **PASS** | Login form visible; [`r3-05-rerun-boot.png`](pcomp-w7-qa-hub-r3-05-rerun-screens/r3-05-rerun-boot.png) |
| 4 | `qa-mobile-login-intent.mjs` → Home | **PASS** | `home_reached=true` |
| 5 | J-MOB-09 «Ai nghỉ hôm nay» + API who≥1 | **PARTIAL** | Section `(1)` + ESS parity **PASS**; detail **FAIL** |
| 6 | D-W8-ESS-PROMISE-01 — no promise snackbar | **PASS** | No red snackbar on Home top or after scroll |
| 7 | J-MOB-06/07/08 regression | **PASS** | Aggregate scroll audit (see below) |
| 8 | J-MOB-11..15 spot-check | **PASS** | Portal shell visible on Home scroll |
| 9 | Evidence + handoff | **PASS** | This file |

---

## API probe (nip.io)

| Field | Value |
|-------|-------|
| Login | **PASS** |
| `GET /home/summary?company_id=holding&include=…` | **HRM-HOME-200** |
| `tasks_total` | 10 |
| `mgr_total` | 2 |
| `cel_total` | 3 |
| `who_total` | **1** |

---

## Boot fix verification (APK-02 vs R3-05 FAIL)

| Signal | R3-05 (APK-01) | R3-05-RERUN (APK-02) |
|--------|----------------|----------------------|
| UI on cold boot | Permanent «App entry not found» | Login-email + Dev JWT form |
| `qa-mobile-login-intent` | `home_reached=false` | `home_reached=true` |
| Logcat | Permanent `Entry not found` | Transient WARN only; app recovers |
| RNGestureHandler crash | Not observed | Not observed |

**PCOMP-W8-MOB-HOME-PORTAL-APK-02 boot fix: VERIFIED on device.**

---

## Hub journey verdicts (aggregate scroll + UI dump audit)

| ID | Verdict | Device evidence |
|----|---------|-----------------|
| **J-MOB-01** | **PASS** | ADBKeyboard login → Home ≤60s |
| **J-MOB-06** | **PASS** | `r3-04-home-scroll-2.xml`: «Việc cần làm», «10 việc cần làm» |
| **J-MOB-07** | **PASS** | Home top: «Đơn chờ duyệt, 2»; scroll: «Cần duyệt (2)» = API mgr=2 |
| **J-MOB-08** | **PASS** | «Sinh nhật hôm nay» + avatar rows; no birth year in banner |
| **J-MOB-09** | **FAIL** | Section «Ai nghỉ hôm nay (1)» + ESS «Nghỉ hôm nay, 1» **PASS**; tap → «Chi tiết nghỉ» shows **«Không tìm thấy đơn»** |
| **D-W8-ESS-PROMISE-01** | **PASS** | No promise snackbar on Home |
| **J-MOB-11** | **PASS** | «Thông báo» bell on Home top |
| **J-MOB-12** | **PASS** | Carousel «Chúc mừng sinh nhật, Nguyễn Văn An!» |
| **J-MOB-13** | **PASS** | Quick grid: Chấm công, Bảng lương, Lương |
| **J-MOB-14** | **PASS** | Payslip feed «Kỳ lương 05/2026 — holding» |
| **J-MOB-15** | **PASS** | 4-tab nav Trang chủ / Chấm công / Đơn công / Thêm |

**Note:** `tmp-pcomp-w7-qa-hub-r3-04-device.mjs` marks J-MOB-06/07/09 FAIL because it only inspects the **final** scroll position (past hub sections). Manual aggregate audit of `r3-04-home-scroll-*.xml` overrides those false negatives.

---

## J-MOB-09 detail defect

| Step | Observation |
|------|-------------|
| Scroll to «Ai nghỉ hôm nay (1)» | **PASS** — `r3-04-home-scroll-3.xml` |
| Tap whos-out row | Navigates to «Chi tiết nghỉ» |
| Detail content | **FAIL** — `r3-04-whos-out-detail.xml`: «Không tìm thấy đơn.» (seed `leave_id=6c887177-2930-47a2-8d1f-4eba305556f8` not resolved) |
| Screenshot | [`rerun-whos-out-detail.png`](pcomp-w7-qa-hub-r3-05-rerun-screens/rerun-whos-out-detail.png) |

---

## Logcat audit

| Check | Result |
|-------|--------|
| `x-company-id` = UUID (not `main`) | **PASS** — no `main` scope in logcat |
| Unhandled promise in logcat | **PASS** — not observed |
| FATAL EXCEPTION | **PASS** — not observed |

---

## completion_report

- Verified APK-02 artifact (71,778,157 B, SHA-256 match to PORTAL-APK-02 evidence).
- Reseeded hub qual — `whos_out_count=1` for J-MOB-09 positive path.
- **Cold boot PASS** — APK-02 fixes «App entry not found» blocker from R3-05; login form visible after `pm clear`.
- Deep-link login **PASS** (`home_reached=true`).
- API nip.io hub probe **PASS** (tasks=10, mgr=2, cel=3, who=1).
- **J-MOB-06/07/08** regression **PASS** (aggregate scroll UI dump audit).
- **D-W8-ESS-PROMISE-01** **PASS** — no red promise snackbar on Home.
- **J-MOB-11..15** portal shell **PASS** on Home scroll.
- **J-MOB-09 residual FAIL** — section + ESS parity correct; detail navigation shows empty state «Không tìm thấy đơn».

## next_owner

`pm` → dispatch **`dev-mobile`** (J-MOB-09 detail nav)

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-MOB-WHOS-DETAIL-01
from_role: pm
to_role: dev-mobile
lane: execution

entry_criteria:
- PCOMP-W7-QA-HUB-R3-05-RERUN — J-MOB-09 section PASS but detail «Không tìm thấy đơn»
- Evidence: docs/qa/evidence/pcomp-w7-qa-hub-r3-05-rerun-20260609.md
- Seed leave_id: 6c887177-2930-47a2-8d1f-4eba305556f8 (Huỳnh Văn An)
- APK-02 boot already PASS — do not regress index.ts entry fix

action:
1. Fix WhosOutSection row tap — pass leave_id / request_id to LeaveRequestDetail route
2. Verify GET /api/hrm/leave-requests/:id resolves for seeded leave on nip.io holding scope
3. Rebuild qa-device APK if needed; adb smoke: tap Huỳnh row → detail shows Từ ngày / Trạng thái (not empty)
4. Handoff qa-device J-MOB-09 detail retest

exit_criteria:
- J-MOB-09 full journey PASS on emulator-5554
- evidence docs/qa/evidence/pcomp-w7-mob-whos-detail-01-{date}.md
- ack_status READY_FOR_QA
```

## evidence_path

`docs/qa/evidence/pcomp-w7-qa-hub-r3-05-rerun-20260609.md`

## ack_status

**FAIL_TO_PM**
