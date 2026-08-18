# PO-HRM-UI-BRAND-W4-MOB-A-APK-03 — qa-device APK (FE adb-login collapsed dev)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-APK-03` |
| **from_role** | `qa-device` (build seat) |
| **to_role** | `qa-device` → `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN` |
| **date** | `2026-08-05` |
| **ack_status** | **READY_FOR_QA** |
| **entry_evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md` (READY_FOR_QA) |
| **prior_apk** | `po-hrm-ui-brand-w4-mob-a-apk-02.md` — SHA256 `8CE49FF2…` |
| **program** | `PO-HRM-UI-BRAND-REMASTER-01` · slice **W4-MOB-A** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **fake APK** | **cấm** — artifact from `android:apk:qa-device` only |

---

## Mission

Rebuild **qa-device** APK after **FE-ADB-LOGIN-01** (dev panel collapsed default, `adb-login-fields.mjs` clipboard paste) so **R5-LOGIN** can close **C-LOGIN-ADB** via production email/password adb fill — **not** qa-login deeplink alone.

**Cấm:** Face LIVE · seed · remaster DONE · reusing APK-02 hash without rebuild.

---

## Progress log

| Time (UTC+7) | Event |
|--------------|--------|
| 16:14 | Evidence file created · `BUILD_IN_PROGRESS` |
| 16:14 | Starting `pnpm run android:apk:qa-device` from workspace `apps/mobile/hrm-mobile` |
| 16:17 | **BUILD SUCCESSFUL** in 2m · exit **0** · Gradle assembleRelease |
| 16:17 | Artifact verified — **71615217** bytes · SHA256 **E51C977C…** (supersedes APK-02 **8CE49FF2…**) |

---

## Git lineage (pre-build)

| Field | Value |
|-------|--------|
| **commit** | `dc930c5323e240bd77dc6371da834821c312c858` |
| **branch** | `main` |
| **FE delta** | FE-ADB-LOGIN-01 — collapsed dev default + adb helper |

---

## Build command (repro)

```powershell
Set-Location C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\mobile\hrm-mobile
$env:GRADLE_USE_SUBST = "1"
$env:BUILD_TARGET = "qa-device"
if (Test-Path C:\rn74) { $env:GRADLE_PATH_RN_DIR = "C:\rn74" }
pnpm run android:apk:qa-device
```

**Script:** `apps/mobile/hrm-mobile/scripts/build-apk.cjs --qa-device`

---

## Artifact

| Field | Value |
|-------|--------|
| **apk_path (workspace)** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **size_bytes** | `71615217` (68.30 MB) |
| **sha256** | `E51C977C8672C9D4ECACC6E25727B2AE1FEA2D682E8525BD7141DEDC4F2C09C5` |
| **build_exit** | `0` |
| **build_duration** | ~3m 5s seat · Gradle **BUILD SUCCESSFUL in 2m** |
| **log_summary** | Replaces APK-02 — includes FE-ADB-LOGIN-01 (dev collapsed default, adb clipboard helper) |

---

## completion_report

- Rebuilt qa-device APK after FE-ADB-LOGIN-01; **71615217** bytes, SHA256 **E51C977C…**, git **dc930c53** at build time.
- **READY_FOR_QA** → `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN`: install + cold start + production adb fill + J-MOB-01 (no qa-login sole path).
- **face_live=false** · **remaster_program_done=false** · no seed · no fake APK.

---

## next_owner

`qa-device` — `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN`
