# PCOMP-W7-MOB-PROFILE-FULL-01-QA — Device J-MOB-12 / J-MOB-17 (Profile Plane B)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-PROFILE-FULL-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64` / AVD `xevn_api34`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake; no API mutate for UF (UI Lưu only) |
| **HOLD_DEPLOY** | yes — local APK only; NOT :8088 / Phase1 / PROD |
| **prior BUILD** | `docs/qa/evidence/pcomp-w7-mob-profile-full-01-build-20260728.md` |
| **prior CODE** | `docs/qa/evidence/pcomp-w7-mob-profile-full-01-20260728.md` |
| **journeys in-scope** | **J-MOB-12** · **J-MOB-17** |

---

## Executive verdict

**PASS_TO_PM** — SHA gate PASS (`5A5F627D…` ≠ `5908260E…`); install OK; login deep-link PASS; **J-MOB-12** dynamic ESS form + Mã NV RO + edit SĐT → **Lưu thông tin liên hệ** → toast «Đã cập nhật thông tin liên hệ.» → GET phone sticks `0901831662` + F5 UI shows same; Plane B `company_id=holding` (slug) GET `HRM-EMP-200`, LE UUID query **404**; **J-MOB-17** tabs Thông tin / Công việc / Tài liệu OK. W6 L0 `:28001`/`:28002`/`:5173` kept. No Phase1/PROD claim.

| Gate | Result | Notes |
|------|--------|-------|
| APK SHA-256 = `5A5F627D…9184` | **PASS** | file + installed `base.apk` pulled |
| SHA ≠ `5908260E…` | **PASS** | supersedes directory-era binary |
| `adb install -r -g` | **PASS** | `vn.xevn.hrm.mobile` · lastUpdateTime 2026-07-28 11:15:52 |
| Login QA deep-link | **PASS** | `home_reached=true` |
| J-MOB-12 dynamic form / SĐT / Mã NV | **PASS** | `Cập nhật liên hệ` · `Số điện thoại` · `HLD-0001` RO |
| J-MOB-12 Mã NV not EditText | **PASS** | AC-ESS-02 — readonly row |
| J-MOB-12 edit SĐT → Lưu | **PASS** | a11y `Lưu thông tin liên hệ` |
| FE toast after save | **PASS** | «Thành công» / «Đã cập nhật thông tin liên hệ.» |
| Phone sticks (GET + F5 UI) | **PASS** | `0901831662` API + UI |
| Plane B GET `company_id` | **PASS** | session/query `holding` not LE UUID |
| J-MOB-17 tabs | **PASS** | Công việc + Tài liệu content |
| W6 L0 ports | **PASS** | LISTEN untouched |

**cấm observed:** no seed; no API inbox/DB fake for UF; HOLD_DEPLOY; NOT Phase1/PROD.

---

## APK SHA gate (executed)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Hash = 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184
# Bytes = 71594850

adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Success

adb -s emulator-5554 pull <pm path base.apk> → installed-base
Get-FileHash → 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184
```

Prior obsolete SHA `5908260E…8D7D` — **not used**.

---

## Device commands

```powershell
adb devices -l
# emulator-5554 device …

adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true exit 0

# UI: bottom tab Hồ sơ → Thông tin → scroll Cập nhật liên hệ
# → EditText SĐT → Lưu thông tin liên hệ → success dialog
# → F5 home→Hồ sơ → phone sticks; tabs Công việc / Tài liệu
```

Machine JSON:

- `docs/qa/evidence/screenshots/pcomp-w7-mob-profile-full-01-qa-20260728/qa-result.json`
- `docs/qa/evidence/screenshots/pcomp-w7-mob-profile-full-01-qa-20260728/save-phone-result.json`
- `docs/qa/evidence/screenshots/pcomp-w7-mob-profile-full-01-qa-20260728/j-mob-17-result.json`

---

## Click path (FE)

1. Login deep-link `uat.nv0001@xe.vn` @ nip.io → Home (`Nguyễn Văn An`, Tập đoàn XeVN)
2. Bottom tab **Hồ sơ** → `profile-screen` · segmented **Thông tin / Công việc / Tài liệu**
3. **Thông tin:** hero + **Thông tin hồ sơ** (`Mã nhân sự` **HLD-0001**, Email `uat.nv0001@xe.vn`) + **Cập nhật liên hệ**
4. Scroll → **Số điện thoại** EditText (`0919000111` → `0901831662`) · Mã NV remains non-EditText
5. Scroll → tap **Lưu thông tin liên hệ** → dialog **Thành công** / «Đã cập nhật thông tin liên hệ.» → OK
6. Leave → Home → **Hồ sơ** again → **Số điện thoại** shows `0901831662`
7. **J-MOB-17:** tap **Công việc** (payslip/contract cards) · tap **Tài liệu** (phiếu lương / HĐLĐ)

---

## Network / Plane B

| Check | Result |
|-------|--------|
| Session `active_membership.company_id` | **`holding`** (slug / Plane B) |
| Session `company_uuid` (LE — must not be GET query identity) | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Probe `GET /api/hrm/employees/:id?company_id=holding` | **200** `HRM-EMP-200` · phone `0901831662` |
| Probe same id with `company_id=<LE UUID>` | **404** (contrast — slug is correct Plane B identity) |
| UI save | Tap `Lưu thông tin liên hệ` (release APK: no OkHttp URL logcat) |
| PATCH status | Inferred **2xx ESS success** via toast + GET stick (code path `HRM-EMP-202` per API_DESIGN / Dev wave); packet capture optional for QC |

---

## J-MOB-12 matrix

| AC / step | Expect | Device result |
|-----------|--------|---------------|
| Home → Hồ sơ → Thông tin | ESS profile | **PASS** |
| `dynamic-profile-form` / Cập nhật liên hệ | Visible | **PASS** |
| Mã NV / Mã nhân sự RO | Not EditText | **PASS** (`HLD-0001`) |
| Edit SĐT → Lưu | UI save | **PASS** |
| FE feedback | Toast success | **PASS** |
| F5 sticks | Phone persists | **PASS** (`0901831662`) |
| GET `company_id` slug | Not LE UUID | **PASS** (`holding`) |

---

## J-MOB-17 matrix

| Step | Result |
|------|--------|
| Tabs Thông tin / Công việc / Tài liệu visible | **PASS** |
| Công việc content | **PASS** (phiếu lương / HĐ cards) |
| Tài liệu content | **PASS** (phiếu lương / HĐLĐ) |

---

## Evidence artifacts

Base: `docs/qa/evidence/screenshots/pcomp-w7-mob-profile-full-01-qa-20260728/`

| Step | Artifact |
|------|----------|
| Home / profile info | `00-home*` · `01-profile-info*` · `01b-tab-info*` |
| Scrolled ESS form | `08-scrolled-info*` · `95-*` |
| After save / toast | `74-after-save*` · `97-tab-work.xml` (toast) · `99-*` |
| F5 phone | `104-now.xml` · `103-info-*` — text `0901831662` + `HLD-0001` |
| J-MOB-17 | `111-work.*` · `112-docs.*` · `j-mob-17-result.json` |
| Save result | `save-phone-result.json` |
| Aggregate | `qa-result.json` |

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| D-MOB-DIR-TOAST-01 | P2 | Require-cycle LogBox on launch (non-blocking; same class as directory wave) |
| D-MOB-PROFILE-SCROLL-01 | P3 | Long ESS catalog → Lưu below fold; need deep fling (UX polish) |
| Network HAR | P3 | No release OkHttp URL logcat — Plane B via session slug + live GET; PATCH 202 inferred from toast+GET stick |

**cấm observed:** no seed; HOLD_DEPLOY; NOT Phase1/PROD; W6 L0 not killed.

---

## completion_report

- **Closed:** Device L2.5 **J-MOB-12** (ESS dynamic form, Mã NV RO, SĐT edit → Lưu → toast → GET/F5 stick `0901831662`) + **J-MOB-17** tabs on SHA `5A5F627D…9184` @ `emulator-5554`; Plane B `company_id=holding` GET `HRM-EMP-200` (LE UUID 404 contrast).
- **Open:** P2 require-cycle toast; P3 long-form scroll to Lưu.
- **Not claimed:** Phase1 DONE, PROD-READY, :8088 deploy.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-PROFILE-FULL-01-QA → PM intake PASS
from_role: pm
to_role: qc (optional narrow) OR close TODO W7-6 / next PCOMP mobile item
entry_criteria: evidence docs/qa/evidence/pcomp-w7-mob-profile-full-01-qa-20260728.md PASS_TO_PM
exit_criteria: matrix/TODO flag J-MOB-12 device PASS; HOLD_DEPLOY kept; NOT Phase1/PROD
cấm: seed; claim PROD
```

## ack_status

**PASS_TO_PM**
