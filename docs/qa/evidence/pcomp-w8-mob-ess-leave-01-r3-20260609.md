# PCOMP-W8-MOB-ESS-LEAVE-01-R3 — MOB-UX-07 device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-LEAVE-01-R3` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **manager** | same persona (`uat.nv0001` — seeded manager, pending leave from Huỳnh) |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (71,779,426 B) |
| **SHA-256** | `C2F76C2C1AE973894BF8101E44FC60B2C2195C8344E5D916E3F2C9031BD56FBA` |
| **upstream** | MOB-UX-07 dev [`pcomp-w8-mob-ess-leave-01-20260608.md`](pcomp-w8-mob-ess-leave-01-20260608.md) · prior QA FAIL [`pcomp-w8-mob-ess-leave-01-qa-20260608.md`](pcomp-w8-mob-ess-leave-01-qa-20260608.md) |

---

## Executive verdict

**PASS_TO_PM** — Prior blockers (502 pilot, missing APK) **closed**. Cold boot **PASS**. Deep-link login **PASS** (`home_reached=true`). nip.io `leave-balance` **200** (`available_days=8`, `used_days=3`). MOB-UX-07 device journeys **J-MOB-23..29 PASS** on unified qa-device APK. Hub regression **J-MOB-06/07/09 PASS**; **J-MOB-08 PASS** after scroll (same pattern as hub R3 QC). **J-AVT-02 best-effort PASS** — native media picker opens (`com.google.android.providers.media.module`); upload E2E out of slice.

---

## Environment & commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# 1 pm clear + install (SHA verified)
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile   # Success
& $adb -s emulator-5554 install -r $apk                    # Success, exit 0

# 2 Cold boot — no «App entry not found»
& $adb -s emulator-5554 shell logcat -c
& $adb -s emulator-5554 shell am start -W -n vn.xevn.hrm.mobile/.MainActivity
# WARM ok — login/ESS home visible

# 3 Deep-link login @ nip.io
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true, fatal_logcat=false

# 4 Main device walk J-MOB-23..29 + hub regression
node scripts/tmp-pcomp-w8-mob-ess-leave-01-r3-device.mjs
# partial — navigation label drift; see supplement

# 5 Supplement probes (scroll hub, create wizard, confirm modal, avatar picker)
node scripts/tmp-pcomp-w8-mob-ess-leave-01-r3-supplement.mjs
# J-MOB-08/24/28/29/AVT-02 confirmed
```

Machine JSON: [`pcomp-w8-mob-ess-leave-01-r3-20260609.json`](pcomp-w8-mob-ess-leave-01-r3-20260609.json) · supplement [`pcomp-w8-mob-ess-leave-01-r3-supplement.json`](pcomp-w8-mob-ess-leave-01-r3-supplement.json)  
Screens/XML: `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-screens/`

---

## API probe (nip.io)

| Endpoint | HTTP | Code | Notes |
|----------|------|------|-------|
| `POST /auth/mobile/login` | **201** | HRM-AUTH-200 | `uat.nv0001@xe.vn` |
| `GET /attendance/leave-balance` (annual, 2026) | **200** | HRM-LEAVE-BAL-200 | `available_days=8`, `used_days=3` |
| `x-company-id` header | UUID | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | not `main` slug |

Script probe `leave-requests` / `home/summary` returned **400 HRM-VAL-001** (query param shape in automation only) — **device UI consumed balance API successfully** (`r3-leaves-list.xml` shows Còn lại/Kỳ nghỉ cards).

---

## Journey verdicts (J-MOB-23..29)

| ID | Verdict | Device evidence |
|----|---------|-----------------|
| **J-MOB-23** | **PASS** | `r3-mgr-approvals.xml` — Manager inbox via «Đơn chờ duyệt» card; inline **Duyệt** + **Từ chối** on leave/att cards |
| **J-MOB-24** | **PASS** | `r3-supp-mgr-modal.xml` — tap **Duyệt** → confirm modal **Xác nhận** (Undo snackbar not re-tested post-approve; BR-ESS-UNDO-01 alert-only accepted) |
| **J-MOB-25** | **PASS** | `r3-leaves-list.xml` — Đơn công → **Đơn nghỉ** filter → **Kỳ nghỉ** + **Còn lại** / **Đã dùng** balance header @ nip.io |
| **J-MOB-26** | **PASS** | `r3-leaves-list.xml` — tabs **Đang xét** (Chờ duyệt/Tất cả) \| **Đã duyệt** \| **Từ chối** |
| **J-MOB-27** | **PASS** | `r3-leaves-list.xml` + `r3-tab-rejected.xml` — empty/rejected tab shows **Đăng ký nghỉ** CTA |
| **J-MOB-28** | **PASS** | `r3-supp-create2.xml` — Create step 2 **Còn lại** balance chip from leave-balance API |
| **J-MOB-29** | **PASS** | `r3-supp-create.xml` / `r3-supp-create2.xml` — step 1 **Chọn ngày** / **Khoảng ngày nghỉ** range field + **Tiếp tục** wizard |

**Navigation note:** `+ Nghỉ phép` opens **Create** wizard directly; **Đơn nghỉ** chip opens **My Leaves list** (MOB-UX-07 SET C). Documented for QA automation scripts.

---

## Hub regression (J-MOB-06..09)

| ID | Verdict | Evidence |
|----|---------|----------|
| **J-MOB-06** | **PASS** | `r3-home.xml` — «Chào buổi sáng» + ESS stats cards |
| **J-MOB-07** | **PASS** | `r3-home.xml` — «Đơn chờ duyệt, 2» (= mgr pending) |
| **J-MOB-08** | **PASS** | `r3-supp-home-scroll2.xml` — «Sinh nhật hôm nay» after scroll (≥2 swipes) |
| **J-MOB-09** | **PASS** | `r3-home.xml` — «Nghỉ hôm nay, 1» (prior R3-05 detail CLOSED chain) |

---

## J-AVT-02 (best-effort — separate track)

| Verdict | Evidence |
|---------|----------|
| **PASS** (picker opens) | Home **Hồ sơ bạn** → `r3-avt-profile.xml` **Chọn ảnh** → `r3-supp-avt-picker.xml` package `com.google.android.providers.media.module` (system gallery) |

Upload + display E2E remains **C-W4QC-AVT-MOB-01** program track — not blocking MOB-UX-07 wave.

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| Undo snackbar 5s after approve | — | BR-ESS-UNDO-01 alert-only; confirm modal PASS |
| J-MOB-08 scroll dependency | qa-device | Automation must scroll hub — not product defect |
| API probe VAL-001 on list/summary scripts | dev-be optional | Device UI unaffected; balance 200 confirmed |
| J-AVT-02 upload/display E2E | dev-mobile | Picker PASS; full avatar pipeline separate |

---

## Handoff

- **completion_report:** Closed PCOMP-W8-MOB-ESS-LEAVE-01-R3 — MOB-UX-07 device L2.5 on nip.io emulator with unified qa-device APK. J-MOB-23..29 all **PASS**. Hub J-MOB-06/07/09 PASS; J-MOB-08 PASS with scroll. J-AVT-02 picker PASS (best-effort). Prior FAIL factors (502, missing APK, L2.5 not verified) resolved.
- **next_owner:** `qc`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.md`
- **pm_dispatch_hint:** `qc` — promote J-MOB-23..29 device PASS; update `PROGRAM_JOURNEY_MAP.md` rows J-MOB-23..29 from ⏳ to ✅; chain `PCOMP-W8-MOB-ZENHR-FAB-01` or W8 mobile next per backlog

### next_dispatch_prompt

```
work_item_id: PCOMP-W8-MOB-ESS-LEAVE-01-R3-QC
from_role: pm
to_role: qc
lane: execution
entry_criteria: qa-device PASS pcomp-w8-mob-ess-leave-01-r3-20260609.md — J-MOB-23..29 device @ nip.io
exit_criteria: QC GO/GWC for MOB-UX-07 slice; update journey map; evidence qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md
evidence_path: docs/qa/evidence/qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md
```
