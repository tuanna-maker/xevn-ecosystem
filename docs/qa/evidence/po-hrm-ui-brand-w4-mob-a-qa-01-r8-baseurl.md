# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL — login-dev-base-url → 10.0.2.2:28001

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | `2026-08-05` (UTC+7 ~17:13–17:20) |
| **serial** | `emulator-5554` (API 34 · sdk_gphone64_x86_64) |
| **apk_path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **apk_sha256 (APK-06 SoT)** | `5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18` |
| **apk_sha_verified** | **PASS** — ≠ `01456E71…` (R7 APK-05) · ≠ `C415E592…` (R6) |
| **entry** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-02.md` (**READY_FOR_QA**) |
| **prior** | R7 **FAIL_TO_PM** — `po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md` |
| **ack_status** | **PASS_WITH_OBS** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **qa-login sole path** | **not used** for C-LOGIN-ADB |
| **fake 2xx** | **none** |
| **C-MOB-04 reopen claim** | **none** — optional GPS OBS only; claim stays closed (QC-R5) |

---

## Pre

| Step | Result |
|------|--------|
| Rebuild `pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem\…`, `GRADLE_USE_SUBST=1`) | **BUILD SUCCESSFUL** ~1m27s · **APK-06** |
| Host hrm-api `:28001` L0 mobile login | **201** (`uat.nv0001@xe.vn`) |
| `adb reverse tcp:28001 tcp:28001` | applied |
| `adb install -r -g` APK-06 | Success |
| `pm clear vn.xevn.hrm.mobile` | before each matrix pass |
| `pm grant` POST_NOTIFICATIONS + location | applied |

**Machine logs:**  
- `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-device.json`  
- `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-console.log`  
- Script: `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-device.mjs`  

**Screens / dumps:** `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl/`

---

## Matrix results

### A) C-LOGIN-ADB-base-url-10.0.2.2 (R7 FAIL close)

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **APK-06-sha** | **PASS** | header | `5691A982…642D18` ≠ R7/R6 |
| **L0-hrm-api-login** | **PASS** | host | `http=201` |
| **C-LOGIN-ADB-base-url-mid-band** | **PASS** | `base-uat.nv0001-dev-expanded.png` + `*-url-node.json` | `login-dev-base-url` bounds `[108,766][972,897]` · **y_c=831** (R7 was **y≈2064**) · `isAdbMidBandHit=true` · above email |
| **C-LOGIN-ADB-base-url-field-ui** | **PASS** | `base-uat.nv0001-base-url-filled.png` | UI text = `http://10.0.2.2:28001` via `fillDevBaseUrlField` |
| **C-LOGIN-ADB-base-url-10.0.2.2** | **PASS** | `base-uat.nv0001-login-logcat.txt` | All `[HRM-MOB]` hosts = `http://10.0.2.2:28001` · **no** `14.225.217.232:3001` · `pilotLeak=false` |
| **J-MOB-01-login-home** (base-url path) | **PASS** | `base-uat.nv0001-post-login.png` | home after FE adb login on local host |

**Layout proof (vs R7):**

| Probe | R7 (FAIL) | R8 (PASS) |
|-------|-----------|-----------|
| URL field Y center | ≈2064 (below fold) | **831** (mid-band, before email) |
| ScrollView | absent / non-scroll | present `scrollable=true` |
| Field text after adb fill | unchanged pilot URL | `http://10.0.2.2:28001` |
| Session `[HRM-MOB]` host | `14.225.217.232:3001` | `10.0.2.2:28001` |

**Note on `focused`:** post-fill dump shows `focused=false` because script commits with Enter + blur tap (required for React state sync). Fill path succeeded (text + host bind). R7 failure class was **text unchanged + pilot host**, not post-blur focus attribute alone.

**Logcat snippet (primary base-url login):**

```text
08-05 17:17:45.709 I ReactNativeJS: [HRM-MOB] POST http://10.0.2.2:28001/api/hrm/notifications/push-tokens …
08-05 17:17:46.898 I ReactNativeJS: [HRM-MOB] GET http://10.0.2.2:28001/api/hrm/home/summary?…
08-05 17:17:47.786 I ReactNativeJS: [HRM-MOB] GET http://10.0.2.2:28001/api/hrm/employees?…
```

Zero matches for `14.225.217.232` / `:3001` in primary login logcat.

### B) C-LOGIN-ADB + J-MOB-01 regression (separate cold start, no base-url override)

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **C-LOGIN-ADB-email-regression** | **PASS** | `reg-uat.nv0001-login-filled.png` | `uat.nv0001@xe.vn` · not placeholder |
| **C-LOGIN-ADB-close** | **PASS** | `reg-uat.nv0001-post-login.png` | FE adb path — **not** `xevn://qa-login` |
| **J-MOB-01-login-home-regression** | **PASS** | `reg-uat.nv0001-post-login.png` | home reached |
| **C-LOGIN-ADB-no-val001** | **PASS** | base + reg post-login | no HRM-VAL-001 |
| **qa-login-sole-path** | **PASS** | policy | qa-login not used |

### C) Optional C-MOB-04 GPS OBS (local host only)

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **C-MOB-04-local-host-OBS** | **OBS** | `mob04-nv0001-*.png` / `mob04-nv0001-submit-logcat.txt` | Re-login on `10.0.2.2:28001` OK · FAB → check-in UI exercised · **no POST 201** asserted (`ok201=false`) · **C-MOB-04 claim NOT reopened** |

---

## Verdict summary

| Gate | Result |
|------|--------|
| **C-LOGIN-ADB-base-url-10.0.2.2** | **PASS** |
| **C-LOGIN-ADB** | **PASS** |
| **J-MOB-01** | **PASS** |
| Optional GPS OBS | **OBS** (not a reopen) |
| **ack_status** | **PASS_WITH_OBS** |

---

## completion_report

- **Closed:** R7 layout/focus defect on device — APK-06 mounts `login-dev-base-url` above-fold (y=831 mid-band); `fillDevBaseUrlField` sets `http://10.0.2.2:28001`; session `[HRM-MOB]` traffic binds local host (no pilot `:3001` leak); C-LOGIN-ADB + J-MOB-01 regression PASS without qa-login sole.
- **OBS only:** optional GPS check-in did not yield attendance POST 201 on this pass — **do not** reopen C-MOB-04 / remaster / Face.
- **APK SoT for promote:** `5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18` (APK-06).

## next_owner

`pm` → `qc` (gate wave brand W4 mobile base-url close)

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R8-BASEURL
role: qc
entry: PASS_WITH_OBS docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl.md
verify: APK-06 SHA 5691A982… ≠ 01456E71… / C415E592…; C-LOGIN-ADB-base-url-10.0.2.2 PASS (y=831 mid-band + logcat 10.0.2.2:28001); C-LOGIN-ADB + J-MOB-01 PASS; face_live=false; remaster_program_done=false; C-MOB-04 stays closed (OBS only)
locks: U65 zero-seed · no qa-login sole · no Attendance module GO · no remaster reopen
exit: GO / GWC with residual list; evidence cite R8 screens + logcat
```

## ack_status

**PASS_WITH_OBS**

## pm_dispatch_hint

`PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R8-BASEURL` — QC audit R8 evidence; close C-LOGIN-ADB-base-url OBS from R6/R7; keep C-MOB-04 closed.
