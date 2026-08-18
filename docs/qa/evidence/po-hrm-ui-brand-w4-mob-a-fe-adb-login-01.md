# PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01 — adb production login fill (C-LOGIN-ADB)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01` |
| **from_role** | `dev-fe` / `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **Prior QA** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r4.md` — J-MOB-01-login PARTIAL (placeholder) |
| **Prior QC** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r4.md` — **C-LOGIN-ADB** OPEN/OBS |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Expected | Claim |
|------|----------|--------|
| **face_live** | false | **false** |
| **remaster_program_done** | false | **false** |
| **seed** | none | **none** |
| **qa-login deep link** | assist OBS only | **assist only** — not sole PASS for J-MOB-01-login |

---

## Root cause (R4 evidence)

UI dump `login-filled.xml` after adb typing:

- **login-email** still showed placeholder `name@company.com`
- **Dev JWT panel was expanded** (`Ẩn đăng nhập dev` + **URL máy chủ** EditText had `focused="true"`)
- `adb shell input text` with shell-escaped `@` did not reliably update RN state; keystrokes landed on the **dev base URL** field instead of production **login-email**

Production path (email + password + `login-submit`) was correct; **focus/layout** blocked qa-device automation.

---

## Delivery (code + QA helper)

| Change | Path | Purpose |
|--------|------|---------|
| Dev panel **collapsed on cold start** | `LoginScreen.tsx` | `showDev` default `false` (not `__DEV__`) — only 2 EditTexts visible for MOB-01 |
| **autoFocus** production email | `LoginScreen.tsx` | `autoFocus={!showDev}` on `login-email` |
| adb testIDs | `LoginScreen.tsx` | `login-dev-toggle`, `login-dev-panel`, `login-dev-base-url`; `accessibilityLabel` on email/password |
| Shared adb helper | `scripts/adb-login-fields.mjs` | Collapse dev panel · find **EditText** by `login-email`/`login-password` · clipboard paste for `@` · `%40` fallback |
| R4 matrix hook | `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.mjs` | Uses helper + placeholder assert after fill |
| Unit contract | `src/features/auth/__tests__/loginScreenAdb.test.ts` | Collapsed dev default + testID guard |

**must_keep (unchanged):** `login-screen-root`, `branded-login-card`, Face honesty HOLD, brand W4 testIDs (`login-xevn-logo`, `home-top-bar-brand-accent`, …).

---

## QA steps — FE adb login (API34 emulator)

**Package:** `vn.xevn.hrm.mobile`  
**Persona:** `uat.nv0001@xe.vn` / `xevn-uat-2026`  
**Pilot API (qa-device bundle):** `http://14.225.217.232:3001`

### 0) Rebuild qa-device APK (required after this wave)

```powershell
pnpm run android:apk:qa-device
# Log SHA256 before install — supersede 8CE49FF2…
adb -s emulator-5554 install -r -g apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
```

### 1) Fresh login chrome

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 shell am start -n vn.xevn.hrm.mobile/.MainActivity
adb -s emulator-5554 shell uiautomator dump /sdcard/login.xml
adb -s emulator-5554 pull /sdcard/login.xml .
```

**PASS when XML contains:** `login-screen-root`, `branded-login-card`, `login-email`, `login-password`, `login-submit`.  
**Dev panel:** toggle text **Đăng nhập dev (JWT …)** — **not** `Ẩn đăng nhập dev`; **no** `login-dev-base-url` in hierarchy.

### 2) Production adb fill (preferred — closes C-LOGIN-ADB)

**Option A — matrix script (recommended):**

```powershell
node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.mjs
```

**Option B — manual (helper logic):**

1. Tap center of `login-email` EditText (resource-id `login-email`)
2. Email: `adb shell cmd clipboard set-text uat.nv0001@xe.vn` then `adb shell input keyevent 279` (paste)
3. Tap `login-password`; `adb shell input text xevn-uat-2026`
4. Tap `login-submit` (content-desc `Đăng nhập`)
5. Re-dump — **login-email text must not be** `name@company.com`
6. Home: `home-top-bar-brand-accent` or copy Trang chủ / Xin chào

**FAIL** if email placeholder remains or home reached **only** via `xevn://qa-login` without step 2–4 success.

### 3) qa-login (OBS assist — not sole PASS)

Only after documenting FE adb attempt in evidence:

```powershell
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -n vn.xevn.hrm.mobile/.MainActivity -d "xevn://qa-login?..."
```

Verdict **OBS** — do not mark J-MOB-01-login **PASS** on qa-login alone.

### 4) Session clear alternatives (unchanged from FE-LOGIN-01)

- `pm clear` (§1) · `xevn://qa-logout` · Settings → **Đăng xuất** (`settings-logout`)

---

## Verification (dev)

| Check | Command | Result |
|-------|---------|--------|
| adb helper self-test | `node apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs --self-test` | **PASS** (2026-08-05) |
| Login adb contract | `pnpm exec vitest run src/features/auth/__tests__/loginScreenAdb.test.ts` | **PASS** (6 tests) |
| qaLogin flags | `src/config/__tests__/qaLogin.test.ts` | **PASS** |

**Not run in this handoff:** full emulator matrix (→ **qa-device** on new APK hash).

---

## completion_report

- **Closed in dev:** R4 root cause (expanded dev URL stole adb focus); collapsed dev default; adb helper + R4 script integration; QA runbook for production login fill.
- **Open for QA:** Rebuild/install qa-device APK; **J-MOB-01-login PASS** via FE adb only; close **C-LOGIN-ADB** on QC R5; **MOB-04** remains separate (C-MOB-04).

---

## next_dispatch_prompt

```text
PM → qa-device | PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5 (or R4-retest adb seat)
entry: READY_FOR_QA po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md · U65 · emulator-5554
build: pnpm run android:apk:qa-device → install → log NEW SHA256 in evidence header
session: adb shell pm clear vn.xevn.hrm.mobile BEFORE login matrix
exit: (1) Cold XML — dev panel collapsed (no login-dev-base-url);
      (2) adb/clipboard fill uat.nv0001@xe.vn + password → login-submit → home WITHOUT qa-login as sole PASS;
      (3) login-filled.xml — login-email text ≠ name@company.com;
      (4) Close QC C-LOGIN-ADB or FAIL with dumps
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r5.md (or r4-adb-retest.md)
ack_status: PASS_TO_PM | FAIL_TO_PM
pm_dispatch_hint: C-LOGIN-ADB closure requires FE path PASS; qa-login OBS only if adb still fails
```

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
