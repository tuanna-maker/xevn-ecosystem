# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R7-BASEURL — login-dev-base-url → 10.0.2.2:28001

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R7-BASEURL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | `2026-08-05` (UTC+7 ~16:58–17:08) |
| **serial** | `emulator-5554` (API 34 · sdk_gphone64_x86_64) |
| **apk_path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **apk_sha256 (APK-05 SoT)** | `01456E71D09A10493372E0E132D12CF3B6DC7CD924674694BEC68B20FA340C3A` |
| **apk_sha_verified** | **PASS** — ≠ `C415E592…` / `E51C977C` / `8CE49FF2` / `EB65FD6F` |
| **entry** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md` (**READY_FOR_QA**) |
| **prior** | R6 **PASS_WITH_OBS** — `po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md` |
| **ack_status** | **FAIL_TO_PM** |

## Honesty locks (mandatory)

| Flag | Value |
|------|--------|
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **seed** | **none** |
| **qa-login sole path** | **not used** for C-LOGIN-ADB |
| **fake 2xx** | **none** |
| **C-MOB-04 reopen claim** | **none** (optional OBS skipped — base host assert FAIL) |

---

## Pre

| Step | Result |
|------|--------|
| Rebuild `pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem\…`, `GRADLE_USE_SUBST=1`) | **BUILD SUCCESSFUL** ~1m20s · APK-05 |
| Host hrm-api `:28001` L0 mobile login | **201** (`uat.nv0001@xe.vn`) |
| `adb reverse tcp:28001 tcp:28001` | applied |
| `adb install -r -g` APK-05 | Success |
| `pm clear vn.xevn.hrm.mobile` | before each matrix pass |
| `pm grant` POST_NOTIFICATIONS + location | applied |

**Machine logs:**  
- `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl-device.json`  
- `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl-retry.json`  
- `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl-console.log`  

**Screens / dumps:** `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl/`

---

## Matrix results

### A) C-LOGIN-ADB (regression — must stay PASS)

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **APK-05-sha** | **PASS** | header | `01456E71…0C3A` |
| **L0-hrm-api-login** | **PASS** | host | `http=201` |
| **C-LOGIN-ADB-email-not-placeholder** | **PASS** | `login-filled-uat.nv0001.png` | `uat.nv0001@xe.vn` |
| **C-LOGIN-ADB-no-val001** | **PASS** | `post-login-uat.nv0001.png` | no HRM-VAL-001 |
| **J-MOB-01-login-home** | **PASS** | `post-login-uat.nv0001.png` | home after FE adb login |
| **C-LOGIN-ADB-close** | **PASS** | policy | FE adb path — **not** `xevn://qa-login` |
| **qa-login-sole-path** | **PASS** | policy | qa-login not used |

### B) C-LOGIN-ADB-base-url-10.0.2.2 (R6 OBS close target)

| ID | Verdict | Evidence | Detail |
|----|---------|----------|--------|
| **C-LOGIN-ADB-base-url-10.0.2.2** | **FAIL** | `login-logcat-uat.nv0001.txt` + focus probes | All `[HRM-MOB]` hosts = `http://14.225.217.232:3001` — **not** `10.0.2.2:28001` |
| **adb focus login-dev-base-url** | **FAIL** | `focus-proof-url-node.txt` / `focus2-after-tap.xml` | After tap at reported bounds center `(540,2064)`: `focused="false"`; text stays `http://14.225.217.232:3001` |
| **adb fill / DEL / clipboard** | **FAIL** | `probe-5-after-del.xml` … `probe-7-svc-clip.xml` | 50× DEL + `input text` + clipboard — field text **unchanged** |
| **scroll mid-screen** | **FAIL** | `focus2-scroll-*.xml` | URL `y_c` stuck at **2064** across 8 swipes (not in scrollable mid-band) |

**Logcat snippet (primary FE adb login after attempted base-url fill):**

```text
08-05 17:02:14.530 I ReactNativeJS: [HRM-MOB] POST http://14.225.217.232:3001/api/hrm/notifications/push-tokens …
08-05 17:02:15.202 I ReactNativeJS: [HRM-MOB] GET http://14.225.217.232:3001/api/hrm/home/summary?…
```

No `10.0.2.2:28001` in `[HRM-MOB]` lines for this session.

**UI after adb fill attempt (`base-url-filled.xml`):**

```text
resource-id="login-dev-base-url" text="http://14.225.217.232:3001" focused="false" bounds="[87,1999][993,2129]"
```

**Focus probe (double-tap URL bounds; email stays focused):**

```text
login-dev-base-url … focused="false" text="http://14.225.217.232:3001"
login-email … focused="true" text="name@company.com" bounds="[108,1142][972,1273]"
```

**Note:** `cmd clipboard set-text` → `No shell command implementation` on this emulator API 34 image — clipboard path unavailable; DEL/`input text` also cannot mutate URL field because it never receives focus.

### C) Optional GPS / host OBS

| ID | Verdict | Detail |
|----|---------|--------|
| **C-MOB-04-local-host-OBS** | **SKIP** | Gate B FAIL — no claim reopen; not exercised on `10.0.2.2:28001` |

---

## Root-cause class (qa-device observation)

FE-BASEURL-ADB-01 source (`LoginCredentialField` + `resolveBaseUrl`) is present in APK-05 bundle (`resolveBaseUrl` in `index.android.bundle`). Device matrix still **cannot** drive native text into `login-dev-base-url`:

1. Field sits at bottom (`y≈1999–2129`) and **does not scroll** into a reliable mid-screen hit target.  
2. `adb shell input tap` on uiautomator bounds **does not set `focused=true`** on that EditText.  
3. Subsequent keyevents/`input text` land on **`login-email`** (or nowhere on URL).  
4. Session therefore keeps default pilot base `http://14.225.217.232:3001`.

R6 OBS **not closed**. Defect class expands beyond “controlled FormField” → **adb focus / layout hit-target** for `login-dev-base-url` (dev-mobile).

---

## Case matrix (rollup)

| Gate | Verdict |
|------|---------|
| APK-05 ≠ R6 SHA | **PASS** |
| A) C-LOGIN-ADB + J-MOB-01 | **PASS** |
| B) base URL `10.0.2.2:28001` bind + logcat host | **FAIL** |
| C) local-host GPS OBS | **SKIP** |
| face / remaster / seed / qa-login sole | **PASS** (locks held) |

**Overall ack:** **FAIL_TO_PM** — C-LOGIN-ADB still green; R6 base-url OBS remains open with stronger focus-target proof on APK-05.

---

## completion_report

- **Closed:** APK-05 rebuild+install+SHA gate; C-LOGIN-ADB / J-MOB-01 regression PASS on FE adb path (no qa-login).  
- **Open / FAIL:** `C-LOGIN-ADB-base-url-10.0.2.2` — adb cannot focus or mutate `login-dev-base-url`; `[HRM-MOB]` traffic stays on pilot `:3001`.  
- **Not claimed:** remaster GO · face_live · C-MOB-04 reopen · product GO.

## next_owner

`dev-mobile`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02
role: dev-mobile
entry: FAIL_TO_PM docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md · APK-05 01456E71… · R7
defect: login-dev-base-url EditText reports bounds but adb tap leaves focused=false; field pinned y≈2064 (not scrollable); DEL/input text cannot change text=http://14.225.217.232:3001; session APIs stay pilot :3001
fix options (evaluate):
  1) Ensure URL field is in ScrollView and scrolls into mid-band when Đăng nhập dev expands
  2) Guarantee focusable hit target (no overlay / pointerEvents) — adb tap → focused=true
  3) Optional: deep-link or Settings API base override for qa-device (not qa-login sole for C-LOGIN-ADB)
exit: READY_FOR_QA R8 — adb fill → UI text http://10.0.2.2:28001 · logcat [HRM-MOB] host 10.0.2.2:28001 · C-LOGIN-ADB still PASS
locks: U65 zero-seed · face_live=false · remaster_program_done=false · no fake 2xx
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-02.md
```

## ack_status

**FAIL_TO_PM**
