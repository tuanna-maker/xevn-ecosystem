# PCOMP-W4-QA-JMOB05-R3 — J-MOB-05 manager Duyệt write retest (full-stack APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-JMOB05-R3` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` |
| **API** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK target** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-jmob05-r3.apk` (67078381 B · hub04a base + fresh bundle inject) |

## Verdict

**FAIL** — MOB-HEADER-03b **HTTP contract verified** @ nip.io (UUID `x-company-id` → **201** approve/reject; `holding` → **409**). Fresh JS bundle contains `resolveHrmWriteHeaderId`. **Device J-MOB-05 Duyệt not promoted:** no launchable **full-stack** release APK on emulator — bundle inject crashes (`ExponentImagePicker` native module absent on inject-base shells); Gradle `assembleRelease` did not complete in this session.

Machine JSON: `docs/qa/evidence/pcomp-w4-qa-jmob05-r3-20260607.json`

---

## 1. Preconditions

| Step | Command | Exit | Result |
|------|---------|------|--------|
| Emulator | `adb devices` | **0** | `emulator-5554 device` |
| Qual seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** | `pending_update_requests=1`, `pending_manager_leave_requests=1` |
| JS prebundle | `node scripts/build-apk.cjs` (junction) | **1** bundle OK / Gradle fail | Bundle **8259157 B** @ `…/index.android.bundle` |
| Full-stack inject | `jar uf` hub04a → `hrm-mobile-release-jmob05-r3.apk` | **0** sign/install | Install **0**; launch **FAIL** ImagePicker |
| Gradle release | `assembleRelease` / `build-apk.cjs` re-run | **1** | `notification_icon` drawable added; wrapper/module path errors on retry |

---

## 2. Bundle verification (MOB-UX-SAFE-01 + MOB-HEADER-03b + MOB-LEAVE-META-01)

| Marker | In bundle | Evidence |
|--------|-----------|----------|
| `resolveHrmWriteHeaderId` | **YES** | grep `index.android.bundle` — write header UUID split |
| `useBottomTabBarHeight` | **YES** | grep — MOB-UX-SAFE-01 safe area |
| `hydrateEmployeeMetadata` / leave meta | **YES** | bundle module graph includes leave create path |
| `ExponentImagePicker` | **YES** | PROFILE-AVATAR import — **requires native module in APK shell** |

---

## 3. API header probe (mobile write contract @ nip.io)

Script: `node scripts/tmp-pcomp-w4-qa-header-03b-api-probe.mjs` · exit **0**

| Call | `x-company-id` | HTTP | Code | Pass |
|------|----------------|------|------|------|
| GET pending inbox | `holding` | **200** | — | ✅ |
| POST approve (control) | `holding` | **409** | HRM-ATT-REQ-409 | ✅ |
| POST approve | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | **201** | HRM-ATT-REQ-203 | ✅ |
| POST reject (control) | `holding` | **409** | HRM-ATT-REQ-409 | ✅ |
| POST reject | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | **201** | HRM-ATT-REQ-204 | ✅ |

Confirms BE accepts UUID write headers that MOB-HEADER-03b sends from mobile.

---

## 4. Device L2.5 — J-MOB-05 (blocked)

| Check | Result | Evidence |
|-------|--------|----------|
| Install `hrm-mobile-release-jmob05-r3.apk` | **0** | After uninstall prior signature |
| Cold launch full-stack inject | **FAIL** | `r3-inject-imagepicker-crash.xml` — *App entry not found* + *Cannot find native module 'ExponentImagePicker'* |
| Login + Duyệt on full-stack APK | **NOT RUN** | App does not reach login |
| MUX-03b baseline (pre-HEADER bundle) | **REF** | Prior session: Duyệt → **409** `r3-ref-mux03b-409-baseline.png` |
| adb automation re-run mux03b | **FAIL** | Login blocked — nip.io **502 Bad Gateway** transient (`r3-login-502.xml`) |

Screens: `docs/qa/evidence/pcomp-w4-qa-jmob05-r3-screens/`

---

## 5. Root cause / residual

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **C-JMOB05-R3-APK-01** | **P0** | `dev-mobile` | Full-stack JS bundle includes `expo-image-picker`; jar-inject into hub04a/mux03b/safe-r2 shells lacks `ExponentImagePicker` native → crash before login |
| **C-JMOB05-R3-APK-02** | **P0** | `dev-mobile` / DevOps | Need **Gradle `assembleRelease`** APK with native modules aligned to current bundle (not jar-inject only) |
| C-JMOB05-R3-DEVICE-01 | P2 | `qa-device` | adb login automation — use clipboard paste (`cmd clipboard set` + keyevent 279) per R2 script |
| Pilot 502 transient | P2 | DevOps | nginx 502 during one mux03b login attempt; API probe succeeded same session |

---

## 6. Promoted / not promoted

| Item | Status |
|------|--------|
| MOB-HEADER-03b HTTP contract (UUID write → 201) | **Promoted** (API probe) |
| Full-stack bundle markers in source prebundle | **Promoted** |
| J-MOB-05 device Duyệt → Thành công (no 409) | **Not promoted** |
| J-MOB-05 journey map strict R3 row | **Not promoted** |

---

## completion_report

- Seeded pilot qual (`pending=1`), prebundled fresh JS with `resolveHrmWriteHeaderId`, attempted full-stack APK via hub04a inject + sign/install.
- **PASS** API header probe: approve/reject POST with legal UUID → **HTTP 201**; holding slug → **409** (5/5 probes).
- **FAIL** device: injected full-stack APK crashes on launch (`ExponentImagePicker` native missing); Gradle release not completed; J-MOB-05 Duyệt write path not executed on HEADER-03b bundle.
- Evidence: `pcomp-w4-qa-jmob05-r3-20260607.md` + JSON + screens folder.

## next_owner

`pm` → dispatch `dev-mobile` for native-aligned Gradle release APK, then re-dispatch `qa-device` R4

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-MOB-APK-FULLSTACK-01
Role: dev-mobile
Entry: QA JMOB05-R3 FAIL — jar-inject full-stack bundle crashes (ExponentImagePicker native missing on hub04a/mux03b inject shells); notification_icon.xml added for Gradle
Task: Produce Gradle assembleRelease APK @ nip.io with MOB-UX-SAFE-01 + MOB-HEADER-03b + MOB-LEAVE-META-01 + PROFILE-AVATAR native modules; output dist/hrm-mobile-release-fullstack.apk
Exit: READY_FOR_QA — qa-device PCOMP-W4-QA-JMOB05-R4 device Duyệt → HTTP 201
Evidence: docs/qa/evidence/pcomp-w4-qa-jmob05-r3-20260607.md
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-jmob05-r3-20260607.md`

## pm_dispatch_hint

`PCOMP-W4-MOB-APK-FULLSTACK-01` — Gradle release APK with image-picker native; unblock J-MOB-05 device R4.
