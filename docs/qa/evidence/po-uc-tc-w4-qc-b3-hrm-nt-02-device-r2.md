# Evidence — `PO-UC-TC-W4-QC-B3-HRM-NT-02-DEVICE-R2`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-B3-HRM-NT-02-DEVICE-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — W4-B3 HRM-NT-02 device ACT-HP R2 (qa-device fallback path) |
| **priority** | P0 |
| **api_base** | app runtime `http://14.225.217.232:3001/api/hrm` · host probe same pilot |
| **device** | `emulator-5554` · API 34 · **physical: none** |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` · SHA256 `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` |
| **persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · company **trsport** |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md`](po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md) PASS_TO_PM · prior FAIL [`po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md`](po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md) · Dev [`po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md`](po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md) |
| **spec_ref** | UC `HRM-NT-02` · TC-HRM-NT-02-ACT-HP-001 · POST …/notifications/push-tokens · `HRM-NOTIF-201` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent full UC / real FCM PASS |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Attendance CLOSED · `uat_done` remains **false** · real Expo/FCM delivery |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded **W4-B3 HRM-NT-02 device ACT-HP R2** only: fresh APK SHA **`4963D5FA…BBB1`** (≠ R1 `50C8F7…389F`, independently hashed by QC); deep-link login **uat.nv0007** → home; `POST_NOTIFICATIONS` granted after `pm clear`; logcat proves `push-token-source=qa-device-fallback` → `POST …/notifications/push-tokens` → **`HRM-NOTIF-201`** with `x-company-id` UUID (not slug `main`); U65 no seed. Prior R1 FAIL (0× POST / no Expo token) **superseded**. Real Expo/FCM token + outbound delivery remain **CONDITION / OBS** pending sponsor `google-services.json` (Option A) — **not** invented FAIL while fallback AC met per PM dispatch. **NOT** Phase 1 / UAT DONE. **NOT** Attendance CLOSED. **uat_done** stays **false** until full UC matrix / real FCM if UC requires it.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md` | PASS_TO_PM · ACT-HP PASS · fallback + `HRM-NOTIF-201` · SHA ≠ R1 · uat_done false | **ACCEPT** product narrative |
| `po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md` | FAIL · 0× push-tokens · FirebaseApp init fail | **SUPERSEDED** by R2 |
| `po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md` | READY_FOR_QA · Option B fallback + Option A scaffolding · vitest 11 | **ACCEPT** root cause + AC |
| by-uc `HRM-NT-02.md` §9 | execution **PASS (device ACT-HP)** · **uat_done false** | **ACCEPT** honesty stamp |
| Screens `…/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/` | 3 PNG on disk | **ACCEPT** (spot below) |

---

## Device / logcat honesty audit

| Check | QA claim | QC independent | QC |
|-------|----------|----------------|-----|
| APK SHA ≠ R1 | `4963D5FA…BBB1` | `Get-FileHash` → **same** `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` | **PASS** |
| Device | `emulator-5554` | cited in QA MD + screens | **PASS** (physical **none** = CONDITION) |
| Persona / scope | uat.nv0007 · trsport · UUID company | logcat `x-company-id=32a3cdcb-c534-4e47-80f9-d2f156e65094` ≠ `main` | **PASS** |
| Permission | grant **after** `pm clear` | PNG `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-home.png` system Allow dialog · pitfall documented | **PASS** |
| Token source | `qa-device-fallback` | logcat excerpt in QA MD | **PASS** (accepted AC) |
| POST push-tokens | present | logcat `POST …/notifications/push-tokens` | **PASS** |
| Response code | `HRM-NOTIF-201` | logcat `ok=true code=HRM-NOTIF-201` | **PASS** |
| U65 | no seed | no seed claims · device FE login only | **PASS** |
| Real Expo/FCM | deferred Option A | FirebaseApp fail expected without google-services · fallback used | **CONDITION / OBS** — not NO-GO |
| Home PNG | PASS seat | `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-pilot-jwt.png` — home ESS (Chấm công / Nghỉ phép / bottom nav) | **PASS** (UI corroboration; **logcat = SoT** for ACT-HP) |

**Note (OBS P3):** Home header shows display name «Phan Văn An» / holding-style company label while JWT/company UUID is trsport path — **display OBS**, not product demote when logcat UUID ≠ `main` and POST 201.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seat | QC |
|---------|-------------------|-----|
| **J-MOB-01** Login → home | Adjacent P0 for device seat | **PASS** (emulator · deep-link + home PNG) |
| **In-seat ACT-HP** login → permission → push POST 201 | **In-scope** P0 device | **PASS** — logcat `HRM-NOTIF-201` |
| Dedicated `J-MOB-NT-*` / `J-HRM-NT-02` | **Absent** from `PROGRAM_JOURNEY_MAP.md` | **CONDITION / P3 process** — do not invent map PASS |
| J-MOB-02..05 / leave L2 | Out of seat | **not re-closed** · not invented |
| Physical-device push | Out of seat | **deferred** |
| Real FCM delivery (outbound) | Phase 2 / Option A | **CONDITION** — not this seat PASS |

Mandatory for this gate: **device ACT-HP** (POST + `HRM-NOTIF-201`) **PASS** with accepted fallback. No mandatory J-* marked ⏳ while claiming full Phase1 journey closure.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | ACT-HP R2 CLOSED — fallback register chain → POST push-tokens → `HRM-NOTIF-201`; SHA freshness; R1 FAIL superseded |
| **PROCESS** | QA pack **2/8** (missing journey_l25 + crud_or_matrix labels); no dedicated J-MOB-NT row |
| **ENV** | Emulator-only (physical none); pilot API `:3001`; FirebaseApp fail expected without sponsor google-services |
| **CONDITION / OBS** | Real Expo/FCM Option A · base_url deep-link residual · uat_done **false** · full 22 TC · Attendance/Phase1 not closed · display-name OBS |

ENV / missing google-services does **not** drive product NO-GO when fallback AC met. QA pack format gap does **not** demote device product close.

---

## Residual

| Id | Status | Sev | Blocks this seat GO? |
|----|--------|-----|----------------------|
| **TC-HRM-NT-02-ACT-HP-001** (device fallback path) | **CLOSED** | — | No |
| R1 FCM silent-null / 0× POST | **SUPERSEDED** | — | No |
| **R-W4-B3-NT02-FCM-REAL-TOKEN** | OPEN CONDITION | P2 | No — Option A sponsor `google-services.json` + outbound delivery (U47 Phase 2) |
| **R-W4-B3-NT02-BASE-URL-DEEPLINK** | OPEN OBS | P2 | No — deep-link `base_url` not overriding pilot default on all paths |
| Full UC `HRM-NT-02` (22 TC) | OPEN | — | No — uat_done stays false |
| Phase1 / UAT DONE / Attendance CLOSED | — | — | No — **not claimed** |
| **C-B3-QA-PACK-FMT-NT02-01** | OPEN process | P3 | qa — add J-* / journey matrix labels on next NT-02 device MD |
| **C-B3-JMAP-NT02-01** | OPEN process | P3 | ba/pm — optional ADD `J-MOB-NT-02` if sponsor wants map coverage |

**No open product P0** for W4-B3 HRM-NT-02 **device ACT-HP R2** slice (fallback AC).

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY · NOT Attendance CLOSED** (`uat_done` **false** on HRM-NT-02).
2. **Real Expo/FCM** (`push-token-source=expo-fcm` + outbound delivery) remains **CONDITION** — requires sponsor Option A `google-services.json`; do **not** invent FAIL for accepted `qa-device-fallback` path.
3. Do **not** promote `uat_done` until full UC matrix (and real FCM if UC requires delivery proof).
4. Do **not** reopen R1 FAIL without regression (0× POST / missing `HRM-NOTIF-201` on fresh qa-device APK with fallback enabled).
5. Physical device / multi-CT ACT-HP-002 not covered — deferred.
6. QA pack 2/8 is **process P3** — not product demote.
7. Prior NT-01 mark-read GWC untouched — do not reopen.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md
→ FAIL exit 1 · 2/8 — missing journey_l25 · crud_or_matrix
```

**PROCESS** — product device/logcat evidence independently verified; does not demote close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md
→ PASS exit 0 · 8/8 (post-write)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md --check-assets
→ PASS exit 0 · assets OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md` | **FAIL** exit **1** · **2/8** (process · journey_l25 + crud_or_matrix) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md` | **PASS** exit **0** · **8/8** (post-write) |
| `Get-FileHash C:\xevn-apk\hrm-mobile-qa-device.apk -Algorithm SHA256` | **PASS** · `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` |
| PNG spot `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-home.png` | **PASS** · file exists · POST_NOTIFICATIONS dialog |
| PNG spot `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-pilot-jwt.png` | **PASS** · file exists · home ESS after pilot JWT |
| by-uc `HRM-NT-02.md` §9 | **PASS** · execution PASS device ACT-HP · uat_done false |
| `adb` / logcat (cited in QA) | **ACCEPT** · `qa-device-fallback` + `HRM-NOTIF-201` |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** pilot API | GET health | **PASS** | QA L0 200 `:3001` |
| **J-MOB-01** | Login → home | **PASS** | deep-link + PNG pilot-jwt |
| **ACT-HP-001 CREATE** | POST push-tokens 2xx | **PASS** | logcat `HRM-NOTIF-201` |
| Token source | fallback accepted | **PASS** | `push-token-source=qa-device-fallback` |
| Scope header | UUID ≠ main | **PASS** | `x-company-id=32a3cdcb-…` |
| APK freshness | SHA ≠ R1 | **PASS** | QC hash match |
| Permission | POST_NOTIFICATIONS | **PASS** | grant-after-clear · PNG dialog |
| Real FCM / outbound | Option A | **CONDITION** | sponsor google-services |
| Full UC 22 TC | matrix | **OPEN** | uat_done false |
| Attendance CLOSED | program | **not claimed** | — |

---

## Forbidden compliance (QC)

- No seed · no `apps/**` edit
- Did not invent Phase 1 / UAT DONE / Attendance CLOSED
- Did not invent real Expo/FCM PASS
- Did not invent FAIL solely because FirebaseApp / google-services absent when fallback AC met
- Did not NO-GO on QA pack 2/8 alone
- Opened QA R2 + R1 FAIL + Dev FCM + by-uc §9 + APK hash + PNG spot before verdict

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QC-B3-HRM-NT-02-DEVICE-R2
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md
next_owner: pm
verdict: GO WITH CONDITIONS
slice: W4-B3 HRM-NT-02 device ACT-HP R2 (qa-device-fallback) only
residual_closed: TC-HRM-NT-02-ACT-HP-001 device fallback path · R1 FAIL superseded
residual_open: R-W4-B3-NT02-FCM-REAL-TOKEN · R-W4-B3-NT02-BASE-URL-DEEPLINK · full UC
uat_done: false
phase1_done: false
attendance_closed: false
```

### completion_report

- **Closed (QC):** L3 **GO WITH CONDITIONS** for W4-B3 HRM-NT-02 device ACT-HP R2 — APK SHA `4963D5FA…BBB1` independently verified ≠ R1; logcat `qa-device-fallback` → POST push-tokens → `HRM-NOTIF-201`; PNG permission + home corroborate; U65 respected; R1 FAIL superseded; uat_done false.
- **Open (program):** real Expo/FCM Option A (sponsor `google-services.json`); deep-link base_url OBS; full 22 TC; QA pack format P3; optional journey-map ADD; **NOT** Phase1 / Attendance CLOSED.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-PM-B3-HRM-NT-02-DEVICE-R2-INTAKE-01
from_role: pm
to_role: pm
lane: governance
priority: P1
entry_criteria: QC PASS_TO_PM docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md — GWC W4-B3 HRM-NT-02 device ACT-HP R2; fallback + HRM-NOTIF-201 CLOSED; SHA 4963D5FA…BBB1; uat_done false; R-W4-B3-NT02-FCM-REAL-TOKEN CONDITION (Option A sponsor google-services.json)
exit_criteria: Bus INTAKE closed; TEAM_WORKING_NOW clears QC slot; do NOT promote uat_done / Phase1 DONE / Attendance CLOSED; do NOT reopen ACT-HP R2 unless regression 0× POST on fresh qa-device APK; schedule Option A real-FCM only when sponsor provides google-services.json (devops/dev-mobile); continue W4 backlog; optional P3: qa add journey_l25/J-MOB-01 on next NT-02 MD · ba ADD J-MOB-NT-02 if sponsor wants map coverage
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-02-device-r2.md
ack_status: PASS_TO_PM
```
