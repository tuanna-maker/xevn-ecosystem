# PO-HRM-UI-BRAND-W4-MOB-A-APK-02 — qa-device APK (FE login chrome rebuild)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-APK-02` |
| **from_role** | `qa-device` (build seat) |
| **to_role** | `qa-device` → `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4` |
| **date** | `2026-08-05` |
| **ack_status** | **READY_FOR_QA** |
| **entry_evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-login-01.md` (READY_FOR_QA) |
| **prior_apk** | `po-hrm-ui-brand-w4-mob-a-apk-01.md` — SHA256 `EB65FD6F…` |
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

Rebuild **qa-device** APK after **FE-LOGIN-01** (`login-screen-root`, `settings-logout`, `xevn://qa-logout`) so R4 can run **pm clear → cold start → FE adb login** without session/FAB restore blocking branded login chrome.

**Cấm:** Face LIVE · seed · remaster DONE · reusing stale APK hash without rebuild.

---

## Progress log

| Time (UTC+7) | Event |
|--------------|--------|
| 15:52 | Evidence file created · `BUILD_IN_PROGRESS` |
| 15:52 | Starting `pnpm run android:apk:qa-device` from `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| 15:58 | Metro bundle + Hermes · Gradle `assembleRelease` |
| 16:02 | **BUILD SUCCESSFUL** in 4m 4s · exit **0** · artifact verified (size + SHA256) |

---

## Git lineage (pre-build)

| Field | Value |
|-------|--------|
| **commit** | `dc930c5323e240bd77dc6371da834821c312c858` |
| **branch** | `main` |
| **FE login delta** | Uncommitted/local WIP per FE-LOGIN-01 evidence (login testIDs + qa-logout deeplink) |

---

## Build command (repro)

```powershell
Set-Location C:\xevn-ecosystem\apps\mobile\hrm-mobile
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
| **apk_path (absolute)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **size_bytes** | `71615020` (68.30 MB) |
| **sha256** | `8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765` |
| **build_exit** | `0` |
| **build_duration** | ~6m 20s total seat · Gradle `BUILD SUCCESSFUL in 4m 4s` |
| **log_summary** | Replaces APK-01 hash `EB65FD6F…` — includes FE-LOGIN-01 chrome (`login-screen-root`, qa-logout deeplink) |

---

## completion_report

- Rebuilt qa-device APK after FE-LOGIN-01 handoff; **71615020** bytes, SHA256 **8CE49FF2…**, git **dc930c53** at build time.
- **READY_FOR_QA** → `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4`: install + `pm clear` + FE adb login + MOB-04 GPS POST proof.
- **face_live=false** · **remaster_program_done=false** · no seed · no fake APK.

---

## next_owner

`qa-device` — `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4`
