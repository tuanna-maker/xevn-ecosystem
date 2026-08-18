# PCOMP-W7-MOB-LEAVE-BAL-02-QA — device J-MOB-25/28 · AC-LEAVE-BAL-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-BAL-02-QA` |
| **parent** | `PCOMP-W7-MOB-LEAVE-COMBO-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS** (wave) · combo **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64` / prefer `xevn_api34`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| **SHA-256** | `B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` |
| **≠ prior** | `5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184` (**PASS**) |
| **install** | `lastUpdateTime=2026-07-28 12:08:14` |
| **U65** | zero-seed — no `pnpm seed:*`; probe = L1 aux only |
| **HOLD_DEPLOY** | yes · **NOT** Phase1 DONE / PROD-READY |
| **build evidence** | `docs/qa/evidence/pcomp-w7-mob-leave-combo-build-20260728.md` |
| **screens** | `docs/qa/evidence/screenshots/pcomp-w7-mob-leave-combo-qa-20260728/` |

---

## Executive verdict

**PASS** — Combo APK carries `LeaveBalanceChip` on wizard step 0. Device shows SRS copy **`Còn lại: 8 / 12 ngày phép năm 2026`** matching L1 leave-balance; My Leaves header 8/3; touch target ≥44px (`bounds` h=159).

Closes prior **2026-07-19 FAIL** (stale APK missing chip markers).

---

## Matrix

| ID | Expect | Result | Evidence |
|----|--------|--------|----------|
| **J-MOB-25** | My Leaves balances | **PASS** | `01-my-leaves.png` — Kỳ nghỉ **2026** · Còn lại **8** · Đã dùng **3** |
| **J-MOB-28** | Wizard `leave-balance-chip` | **PASS** | `03-wizard-step0.png` + XML `leave-balance-chip` / `leave-balance-chip-value` |
| **AC-LEAVE-BAL-01** | Chip ≠ «—» when API 200 | **PASS** | Text **`Còn lại: 8 / 12 ngày phép năm 2026`** |
| Touch ≥44px | chip height | **PASS** | bounds h=**159** |

---

## L1 aux (not UF alone)

```text
POST /api/hrm/auth/mobile/login uat.nv0001@xe.vn → 201 HRM-AUTH-200
company_id=holding · employee_id=3796d949-4513-45c0-88fa-33030a062b17
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=…&leave_type=annual&year=2026
→ 200 HRM-LEAVE-BAL-200
  remaining_days=8 · entitled_days=12 · used_days=3 · year=2026
```

Plane B: `company_id=holding` (slug), not legal UUID on leave-balance query — matches build must_keep `resolveDirectoryQueryCompanyId`.

---

## Click path (U65 FE)

1. `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026` → `home_reached=true`
2. Home → **Nghỉ phép** → My Leaves (`01-my-leaves.png`)
3. FAB → **Tạo đơn nghỉ**
4. Wizard **Bước 1 · Chọn ngày** — assert chip (`03-wizard-step0.png`)

### adb

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31

adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
$env:HRM_API_BASE="https://14-225-217-232.nip.io"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
```

XML session: `%TEMP%\hrm-leave-combo-20260728\03-wizard-step0.xml`

---

## Residual

| Item | Status |
|------|--------|
| AC-LEAVE-BAL-02 (remaining drops after approve 3d) | **not in this wave scope** — optional follow-up |
| Sick-type chip shows 0/0 on step 1 | Expected for non-annual type fetch — annual step-0 chip is SoT for AC-LEAVE-BAL-01 |

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-LEAVE-BAL-02-QA
from_role: qa-device
to_role: pm
ack_status: PASS
evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-bal-02-qa-20260728.md
completion_report: |
  BAL-02 device PASS on combo SHA B9DCC6BC…. J-MOB-25 header 8/3;
  J-MOB-28 / AC-LEAVE-BAL-01 chip «Còn lại: 8 / 12 ngày phép năm 2026»;
  testID leave-balance-chip (+ -value); h≥44px. U65 · HOLD_DEPLOY.
next_owner: pm (with DOC-02 wave)
```
