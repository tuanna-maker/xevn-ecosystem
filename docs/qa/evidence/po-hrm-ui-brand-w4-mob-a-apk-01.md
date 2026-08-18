# PO-HRM-UI-BRAND-W4-MOB-A-APK-01 — qa-device APK (W4 chrome unblock)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-APK-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | `2026-08-05` |
| **ack_status** | **READY_FOR_QA** |
| **source_evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md` · QA block `po-hrm-ui-brand-w4-mob-a-qa-01.md` |
| **program** | `PO-HRM-UI-BRAND-REMASTER-01` · slice **W4-MOB-A** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **attendance_closed** | **false** |
| **product_go** | **false** |

---

## Mission

Unblock `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2` — ship **qa-device** APK containing W4 Precision Motion chrome (commit at or after dev seat `8b0a2426`).

**Cấm:** Face LIVE claim · seed · remaster DONE · Nest Face invent.

---

## Progress log

| Time (UTC+7) | Event |
|--------------|--------|
| 14:49 | `BUILD_IN_PROGRESS` — prior seat started Gradle; no artifact recorded |
| 14:53 | dev-mobile resume — append log, re-run `android:apk:qa-device` from ASCII path |
| 14:54 | Metro bundle OK (2074 modules, ~26s) · Hermes compile · Gradle `assembleRelease` |
| 15:10 | **BUILD SUCCESSFUL** in 14m 25s · exit **0** · artifact verified (size + SHA256) |

---

## Git lineage

| Field | Value |
|-------|--------|
| **commit** | `dc930c5323e240bd77dc6371da834821c312c858` |
| **branch** | `main` |
| **W4 source ref** | dev evidence cited `8b0a2426`; APK bundles **HEAD** at build time |

---

## Build command (repro)

```powershell
# Recommended: ASCII junction (build-apk.cjs auto-detects C:\xevn-ecosystem)
Set-Location C:\xevn-ecosystem\apps\mobile\hrm-mobile
$env:GRADLE_USE_SUBST = "1"
$env:BUILD_TARGET = "qa-device"
if (Test-Path C:\rn74) { $env:GRADLE_PATH_RN_DIR = "C:\rn74" }
pnpm run android:apk:qa-device
```

**Script:** `apps/mobile/hrm-mobile/scripts/build-apk.cjs --qa-device`  
**Bundle flags (default qa-device):** `QA_DEV_LOGIN=1` · `QA_DEEP_LINK=1` · `PUSH_REG=1` · `QA_PUSH_FALLBACK=1` (unless env overrides).

---

## Artifact

| Field | Value |
|-------|--------|
| **apk_path (workspace)** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **apk_path (absolute)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **size_bytes** | `71614240` (68.30 MB) |
| **sha256** | `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` |
| **build_exit** | `0` |
| **build_duration** | ~14m 25s (Gradle `assembleRelease`; total seat ~17m incl. Metro/Hermes) |
| **log_summary** | `BUILD SUCCESSFUL in 14m 25s` · 1087 tasks (135 executed) · `google-services.json` absent (FCM native off; QA push fallback env OK) · Hermes warnings only |

---

## Install steps (qa-device)

1. `adb devices` — ensure ≥1 device/emulator.
2. `adb install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"`
3. Optional QA login: `node scripts/qa-mobile-login-intent.mjs` (`xevn://qa-login`) when `QA_DEEP_LINK=1`.
4. Persona (device UF): `uat.nv0001@xe.vn` / `xevn-uat-2026` — **U65:** login via app UI, no seed.
5. Retest per `po-hrm-ui-brand-w4-mob-a-qa-01.md` §5–§7 → evidence `po-hrm-ui-brand-w4-mob-a-qa-01-r2.md`.

---

## completion_report

- Closed stuck `BUILD_IN_PROGRESS` from 14:49; rebuilt qa-device APK from `C:\xevn-ecosystem\apps\mobile\hrm-mobile` with `GRADLE_USE_SUBST=1`.
- Delivered signed release artifact at `dist/hrm-mobile-qa-device.apk` — **71614240** bytes, SHA256 above, git **dc930c53** on `main`.
- W4 chrome bundle includes qa-device flags (dev login, deep link, push registration + fallback); no Face LIVE or remaster-DONE claims.
- **Open:** device UF retest on physical/emulator (`PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2`).

---

## next_owner

`qa-device` — `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2`

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2
from_role: qa-device
entry_criteria: APK installed from dev-mobile handoff; adb device ready; U65 browser-equivalent = app UI login only
apk_path: C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
sha256: EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066
git: dc930c5323e240bd77dc6371da834821c312c858
install: adb install -r "<apk_path>" then optional xevn://qa-login via scripts/qa-mobile-login-intent.mjs
persona: uat.nv0001@xe.vn / xevn-uat-2026
spec_ref: po-hrm-ui-brand-w4-mob-a-qa-01.md §5–§7 · W4 Precision Motion chrome UF
exit_criteria: evidence po-hrm-ui-brand-w4-mob-a-qa-01-r2.md with J-MOB rows; face_live=false; remaster_program_done=false
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2.md
cấm: seed · fake APK · claim face_live or remaster DONE
```
