# PCOMP-W4-QC-SAFE-U47 — U47 safe area gate (MOB-UX-SAFE-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QC-SAFE-U47` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-SAFE-01 / U47** safe-area slice promotable on nip.io emulator |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W4 U47 safe area only)

| In scope | Out of scope |
|----------|--------------|
| **PCOMP-W4-MOB-UX-SAFE-01** status bar + tab bar inset fix (U47) | Web portal / J-HRM-* browser |
| Android status bar clearance (Dashboard greeting) | J-MOB-05 **write** path (approve POST 201) — **separate residual** |
| Android 3-button / gesture nav vs bottom tab bar | Phase 1 DONE / `verify:product:completion` program claim |
| `layoutInsets` bundle in `hrm-mobile-release-safe-r2.apk` | Full persona NV→QL E2E same session (blocked by adb tooling) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io | PROD release / arm64 physical device |

**Upstream QA:** `docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-20260607.md` + `.json` + `pcomp-w4-qa-safe-persona-r2-screens/`

**Dev handoff:** `docs/qa/evidence/pcomp-w4-mob-ux-safe-01-20260607.md` (vitest **91/91**, `READY_FOR_QA`)

**Prior gates:** `pcomp-w4-qc-mux-03-20260607.md` (DS) · `pcomp-w4-qc-mux-02-20260607.md` (UX-02 leave)

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-20260607.md
# exit 1 — 2/8 checks (2026-06-07 QC audit)
# FAIL: work_item_id (table `**work_item_id**` vs colon format), portal_url
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Mobile-only U47 slice; material pack auditable:

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` | **Format gap** — value present in markdown table; verifier expects `work_item_id:` colon near top — QA normalize next mobile wave |
| `portal_url` | **N/A** — device APK pack; `api_base` `https://14-225-217-232.nip.io` documented; no web portal probe in U47 scope |

Material pack: JSON `results[]` U47 + J-MOB rows, precondition exit codes, **2 device PNGs** on safe-r2 APK, dev vitest **91/91** — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + safe-r2 APK install (67,057,901 B) | ENV | **PASS** |
| Bundle inject workaround (Gradle MAX_PATH) | ENV / build | **INFO** — same pattern as MUX waves |
| **U47** Dashboard greeting below status bar | PRODUCT / U47 | **PASS** — QC spot-read `r2-dashboard-safe-top.png` |
| **U47** Tab bar above system nav / home indicator | PRODUCT / U47 | **PASS** — QC spot-read `r2-dashboard-safe-bottom.png` |
| `useBottomTabBarHeight` marker ×6 in bundle | PRODUCT / regression | **PASS** |
| Check-in / create-leave StickyFooter `aboveTabBar` | PRODUCT / U47 | **GWC** — code + bundle present; no dedicated device PNG (adb login gap) |
| J-MOB-05 sticky Duyệt thumb-zone | PRODUCT / UX ref | **PASS (ref)** — MUX-03b `mux03b-row-selected.png` same inset pattern; safe-r2 shares `layoutInsets` |
| **J-MOB-05 write** `HRM-ATT-REQ-409` | PRODUCT / **OUT OF U47** | **FAIL — separate track** — see § J-MOB-05 residual |
| adb `input text` / RN TextInput on API33 | ENV / tooling | **NOT product** — `HRM-VAL-001` / empty-field alerts; API login PASS |
| Push registration | PRODUCT / pilot policy | **PASS** — `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` |

**No P0/P1 product defect on U47 safe-area slice** after QC spot audit.

---

## U47 — MOB-UX-SAFE-01 acceptance audit

| AC (dev + U47) | Requirement | QA (R2) | QC verdict | Evidence |
|----------------|-------------|---------|------------|----------|
| **SAFE-TOP** | Dashboard title/greeting clears status bar | PASS | **PASS** | `r2-dashboard-safe-top.png` — "Xin chào, Nguyễn Văn An" below 5:52 row |
| **SAFE-BOTTOM** | Tab icons/labels above Android nav / gesture line | PASS | **PASS** | `r2-dashboard-safe-bottom.png` — Trang chủ/Chấm công/Đơn công/Thêm above home indicator |
| **SAFE-STICKY-CI** | Check-in StickyFooter above tab bar | GWC | **GWC PASS** | Bundle `StickyFooter aboveTabBar` + dev `layoutInsets.test.ts` 5/5 |
| **SAFE-STICKY-LEAVE** | Create leave 4-step footer above tab bar | GWC | **GWC PASS** | Same bundle; device screenshot deferred adb gap |
| **SAFE-STICKY-APPROVE** | Manager Duyệt footer above tab bar | PASS (ref) | **PASS (ref)** | MUX-03b sticky y1≈2095; safe-r2 shares inset code |
| **SAFE-LOGIN** | Login brand block clears status bar | Not device-PNG in R2 | **Reaffirmed** | Dev `LoginScreen` `safeAreaTop` + prior MUX login baseline |

**U47 user complaint (status bar overlap + 3-button nav vs tab bar): CLOSED** on safe-r2 APK @ nip.io emulator.

---

## L2.5 — J-MOB cross-check (persona R2 context)

| ID | Layer | QA (R2) | QC verdict | U47 gate impact |
|----|-------|---------|------------|-----------------|
| **J-MOB-01** | API login | PASS | **PASS** | Regression pre-step |
| **J-MOB-01** | UI session | PASS | **PASS** | Dashboard hub on safe-r2 APK |
| **J-MOB-01** | adb automation | FAIL | **ENV tooling** | Not U47 blocker |
| **J-MOB-03** | API leave list | PASS | **PASS** | Out of U47 core |
| **J-MOB-03** | UI E2E create | GWC | **GWC** | adb gap; not U47 |
| **J-MOB-05** | UI sticky Duyệt | PASS (ref) | **PASS (ref)** | Thumb-zone reaffirmed |
| **J-MOB-05** | **Write approve** | **FAIL 409** | **SEPARATE RESIDUAL** | **Does not block MOB-UX-SAFE-01 GO** |

**Journey map (`PROGRAM_JOURNEY_MAP.md` J-MOB-05):** UI sticky **PASS**; write path remains open until HEADER-03b full-stack APK retest.

---

## J-MOB-05 write 409 — separate residual (HEADER-03b APK stack)

**Explicitly OUT OF MOB-UX-SAFE-01 / U47 gate scope.** Documented per PM dispatch and bus chain.

| Field | Value |
|-------|-------|
| **Residual ID** | `C-W4QC-JMOB05-WRITE-01` |
| **Symptom** | **Duyệt** / **Từ chối** POST → `HRM-ATT-REQ-409` (*company_id outside token scope*) |
| **Root cause** | `hrm-mobile-release-safe-r2.apk` bundle inject includes **MOB-UX-SAFE-01** `layoutInsets` only — **lacks** `PCOMP-W4-MOB-HEADER-03b` write resolver (`resolveHrmWriteHeaderId` → legal UUID on POST) |
| **Upstream MUX-03b QA** | `pcomp-w4-qa-mux-03b-20260607.md` — same 409 on mux03b APK before HEADER-03b merge |
| **Dev fix ready** | `pcomp-w4-mob-header-03b-20260607.md` — vitest **96/96**; `READY_FOR_QA` on **full-stack** APK |
| **Owner** | `dev-mobile` rebuild (SAFE + HEADER + meta) → `qa-device` J-MOB-05 write retest |
| **work_item_id** | `PCOMP-W4-MOB-HEADER-03b` / `PCOMP-W4-QA-HEADER-03b` |
| **Trigger** | Full-stack APK install + `seed:hrm:uat-mob-pilot-qual` → **Duyệt** expect HTTP **201** not **409** |

**QC ruling:** Do **not** downgrade U47 safe-area verdict for this write residual; PM dispatch HEADER-03b lane independently.

---

## Conditions (bounded)

| ID | Condition | Owner | Trigger to close |
|----|-----------|-------|------------------|
| **C-W4QC-SAFE-STICKY-01** | Check-in + create-leave StickyFooter device PNG not captured on safe-r2 | qa-device | adb IME (ADBKeyboard) or manual tap → screenshot footer above tab bar |
| **C-W4QC-SAFE-PACK-01** | QA R2 pack verifier 2/8 — colon `work_item_id:` + `PORTAL_DEV_URL: n/a (mobile nip.io)` | qa-device | Next mobile QA wave |
| **C-W4QC-SAFE-ADB-01** | adb login automation gap API33 RN TextInput | qa-device / devops | ADBKeyboard IME or Appium for persona matrix R3 |
| **C-W4QC-JMOB05-WRITE-01** | J-MOB-05 approve/reject write **409** — safe-r2 lacks HEADER-03b | dev-mobile → qa-device | Full-stack APK + `pcomp-w4-qa-header-03b-20260607.md` PASS write **201** |
| **C-W4QC-SAFE-ARM64-01** | arm64 release on physical device | dev-mobile / devops | Sponsor W6 physical UAT |

**Closed by this gate:**

- **MOB-UX-SAFE-01** U47 status bar + tab bar overlap — **promotable** nip.io emulator (safe-r2 APK).
- Prior `pcomp-w4-qa-persona-01-20260607.md` note "MOB-UX-SAFE-01 not merged" — **superseded** by safe-r2 bundle inject + this QC gate.

**NOT closed:** J-MOB-05 write, full persona E2E, Phase 1 DONE, PROD.

---

## Independent spot-check (QC)

| Check | Result |
|-------|--------|
| QC read `r2-dashboard-safe-top.png` | Greeting below status bar — **concurs QA PASS** |
| QC read `r2-dashboard-safe-bottom.png` | Tab bar above home indicator — **concurs QA PASS** |
| QC read MUX-03b `mux03b-row-selected.png` (sticky ref) | Duyệt/Từ chối thumb-zone — **concurs ref PASS** |
| Dev vitest `layoutInsets.test.ts` cited **5/5** | **Concurs** regression baseline |

No full `qc:dev-stack` re-run — mobile-only slice; nip.io API probes documented in QA JSON.

---

## Promoted / not promoted

| Item | Status |
|------|--------|
| **MOB-UX-SAFE-01** status bar clearance | **Promoted** |
| **MOB-UX-SAFE-01** tab bar vs Android nav | **Promoted** |
| **MOB-UX-SAFE-01** `layoutInsets` + `useBottomTabBarHeight` bundle | **Promoted** |
| U47 StickyFooter check-in / create-leave device PNG | **GWC — not promoted to strict** |
| **J-MOB-05 write** approve 201 | **Not promoted** — HEADER-03b track |
| Full persona NV→QL same session | **Not promoted** — adb tooling |

---

## Handoff

```
completion_report: MOB-UX-SAFE-01 U47 safe area GO WITH CONDITIONS (reduced) — status bar + tab bar clearance PASS on safe-r2 device PNGs; sticky footer flows GWC (bundle); J-MOB-05 write 409 documented as separate C-W4QC-JMOB05-WRITE-01 (HEADER-03b full APK stack); evidence pack 2/8 process note; NOT Phase 1 DONE / NOT PROD.
next_owner: pm
next_dispatch_prompt: work_item_id: PCOMP-W4-MOB-HEADER-03b. Role: dev-mobile. Entry: MOB-HEADER-03b code merged per pcomp-w4-mob-header-03b-20260607.md; rebuild full-stack APK (SAFE+HEADER+meta bundle inject). Exit: READY_FOR_QA; evidence docs/qa/evidence/pcomp-w4-mob-header-03b-fullstack-20260607.md. Then qa-device PCOMP-W4-QA-HEADER-03b: seed pending, J-MOB-05 Duyệt HTTP 201 not 409, evidence pcomp-w4-qa-header-03b-20260607.md PASS_TO_PM. U47 MOB-UX-SAFE-01 closed per pcomp-w4-qc-safe-u47-20260607.md — do not re-open safe area unless regression screenshot.
evidence_path: docs/qa/evidence/pcomp-w4-qc-safe-u47-20260607.md
ack_status: PASS_TO_PM
```
