# PCOMP-W7-MOB-DIRECTORY-01-QA — Device J-MOB-16 / J-MOB-30 (Plane B FIX APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DIRECTORY-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64` / AVD `xevn_api34`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake; no API mutate for UF |
| **HOLD_DEPLOY** | yes — local APK only; NOT :8088 / Phase1 / PROD |
| **prior BLOCKED** | same path — emulator missing (superseded by unblock) |
| **unblock** | `docs/qa/evidence/pcomp-w7-mob-directory-01-qa-unblock-20260728.md` |
| **prior BUILD** | `docs/qa/evidence/pcomp-w7-mob-directory-01-build-20260728.md` |
| **journeys in-scope** | **J-MOB-16** · **J-MOB-30** |

---

## Executive verdict

**PASS_TO_PM** — Emulator unblocked; APK SHA gate PASS; installed package SHA match; login deep-link PASS; **J-MOB-16** search ≥2 + R2 empty PASS; **J-MOB-30** row→detail→back PASS. Plane B: session `company_id=holding` (slug, not LE UUID); directory probe `GET …/employees?view=directory&company_id=holding&page_size=30` → **200** `HRM-EMP-DIR-200`; device list **Tất cả (215)** without scope ERROR. W6 L0 ports kept. No Phase1/PROD claim.

| Gate | Result | Notes |
|------|--------|-------|
| `adb devices` `emulator-5554 device` | **PASS** | AVD `xevn_api34` Android 14 |
| APK SHA-256 = `5908260E…8D7D` | **PASS** | file + pulled installed `base.apk` |
| SHA ≠ `D1E095F3…` | **PASS** | supersedes 2026-07-19 search APK |
| `adb install -r -g` | **PASS** | Success; `vn.xevn.hrm.mobile` |
| Login FE / QA deep-link | **PASS** | `home_reached=true` |
| J-MOB-16 search ≥2 (`Nguyen`) | **PASS** | chip **215 → 18**; Nguyen rows |
| J-MOB-16 R2 empty | **PASS** | `team-directory-empty` + «Không tìm thấy nhân viên» + **(0)** |
| J-MOB-30 row→detail→back | **PASS** | HLD-0091 → detail Email/Liên hệ/Công việc → back list |
| Network Plane B `company_id` | **PASS** | session slug `holding`; probe `page_size=30` `HRM-EMP-DIR-200` (release APK no URL logcat) |
| W6 `:28001`/`:28002`/`:5173` | **PASS** | LISTEN untouched |

**cấm observed:** no seed; no API inbox/DB fake; no :8088; no Phase1/PROD claim.

---

## APK SHA gate (executed)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Hash = 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D
# Bytes = 71594412

adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Success

adb -s emulator-5554 pull "$(adb shell pm path vn.xevn.hrm.mobile | cut -d: -f2)" installed-base.apk
Get-FileHash -Algorithm SHA256 installed-base.apk
# Hash = 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D
```

Prior obsolete SHA `D1E095F3…E201` — **not used**.

---

## Device commands

```powershell
adb devices -l
# emulator-5554 device product:sdk_gphone64_x86_64 …

adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true pass=true exit 0

# UI path (uiautomator): bottom tab Đội nhóm → search → empty → detail → KEYCODE_BACK
```

Machine JSON: `docs/qa/evidence/screenshots/pcomp-w7-mob-directory-01-qa-20260728/qa-result.json`

---

## Click path (FE)

1. Login deep-link `uat.nv0001@xe.vn` @ nip.io → Home (`Nguyễn Văn An`, Tập đoàn XeVN)
2. Tap bottom tab **Đội nhóm** → `team-directory-screen` · baseline chip **Tất cả (215)** · Ban Điều hành · HLD-0091…
3. **J-MOB-16:** search `Nguyen` (≥2) → **Tất cả (18)** · rows `Nguyen NhanSu00x1` / `NV00x1`
4. Search `ZzzNoMatch999` → `team-directory-empty` + «Không tìm thấy nhân viên» + **Tất cả (0)**
5. **J-MOB-30:** clear search → tap row 0 (HLD-0091 Bùi Quốc An) → `team-colleague-detail` / `employee-detail` · Email `uat.nv0091@xe.vn` · Phòng ban / Công việc
6. Hardware back → `team-directory-screen` + rows restored

---

## Network / Plane B

| Check | Result |
|-------|--------|
| Mobile login session `active_membership.company_id` | **`holding`** (slug) |
| Session `company_uuid` (LE — must not be directory query) | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Probe `GET /api/hrm/employees?view=directory&status=active&page_size=30&company_id=holding` + Bearer | **200** `HRM-EMP-DIR-200` |
| Device directory UI | **215** rows; no ERROR / scope banner |
| App code SoT | `resolveDirectoryQueryCompanyId` → Plane B slug/`main`; `DIRECTORY_PAGE_SIZE = 30` |

Release qa-device APK does not emit OkHttp URL lines to logcat; wire assert = session slug + live probe + device list success (not LE UUID as query identity).

---

## Evidence artifacts

| Step | Screenshot / XML |
|------|------------------|
| Home | `00-home.png` / `.xml` |
| Directory baseline | `01-directory.png` / `.xml` |
| Search Nguyen | `02-search-nguyen.png` / `.xml` |
| R2 empty | `03-r2-empty.png` / `.xml` |
| Clear list | `04-clear-list.png` / `.xml` |
| Detail | `05-detail.png` / `.xml` |
| Back | `06-back.png` / `.xml` |
| Result JSON | `qa-result.json` |

Base: `docs/qa/evidence/screenshots/pcomp-w7-mob-directory-01-qa-20260728/`

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| D-MOB-DIR-TOAST-01 | P2 | Require-cycle toast on launch (same as prior waves); dismissed / non-blocking |
| Network HAR | P3 | No release URL logcat — Plane B via session+probe; optional mitm if QC requires packet capture |

**cấm observed:** no seed; HOLD_DEPLOY; NOT Phase1/PROD; W6 L0 ports not killed.

---

## Prior BLOCKED (superseded)

Earlier same-day BLOCKED (no adb / no emulator) closed by devops unblock `PCOMP-W7-MOB-DIRECTORY-01-QA-UNBLOCK` — this re-run is the authoritative verdict.

---

## completion_report

- **Closed:** Device L2.5 **J-MOB-16** (search 215→18 + R2 empty) + **J-MOB-30** (row→detail→back) on SHA `5908260E…8D7D` @ `emulator-5554`; Plane B `company_id=holding` + `page_size=30` probe `HRM-EMP-DIR-200`.
- **Open:** P2 require-cycle toast only (non-blocking).
- **Not claimed:** Phase1 DONE, PROD-READY, :8088 deploy.

## next_owner

`pm`

## pm_dispatch_hint

`PCOMP-W7-MOB-DIRECTORY-01` — INTAKE PASS_TO_PM; optional QC spot on J-MOB-16/30 if wave gate needs L3; else close residual toast as P2 backlog. No rebuild.

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-DIRECTORY-01
Operate as pm.
INTAKE: qa-device PASS_TO_PM on PCOMP-W7-MOB-DIRECTORY-01-QA (re-run after emulator unblock).
evidence: docs/qa/evidence/pcomp-w7-mob-directory-01-qa-20260728.md
SHA 5908260E…8D7D · emulator-5554 · J-MOB-16 + J-MOB-30 PASS · Plane B holding page_size=30.
U65 · HOLD_DEPLOY · NOT Phase1/PROD.
Optional: Task qc spot-check screenshots if needed for wave close; else mark directory FIX QA closed and continue next PCOMP backlog item.
```

---

## Handoff YAML

```yaml
work_item_id: PCOMP-W7-MOB-DIRECTORY-01-QA
from_role: qa-device
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-01-qa-20260728.md
apk_sha256: 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D
device: emulator-5554
journeys: J-MOB-16 PASS · J-MOB-30 PASS
network_plane_b: company_id=holding page_size=30 HRM-EMP-DIR-200
pm_dispatch_hint: close directory QA wave; optional qc spot; no rebuild
```
