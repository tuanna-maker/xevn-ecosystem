# PCOMP-W8-MOB-HOME-PORTAL-QC-01 — U53 portal shell device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-08 |
| **decision** | **GO WITH CONDITIONS** — **MOB-UX-05 / U53 portal shell** device promotable nip.io emulator (`portal-w8` APK) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W8 portal shell @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-11..13, J-MOB-15** portal shell L2.5 device | Phase 1 DONE / `verify:product:completion` program exit |
| **J-MOB-08** birthday carousel regression on portal APK | PROD cutover / store release |
| **J-MOB-14** payslip feed — **defer** until CTA device proof | Full Gradle release rebuild (MAX_PATH) — **PORTAL-APK-01** |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` holding | Group CEO mobile persona |
| APK `hrm-mobile-qa-device-portal-w8.apk` (bundle inject + apksigner repack) | Web portal embed J-HRM-* browser |
| Cross-ref **D-W8-ESS-PROMISE-01** from ESS dash QC | J-MOB-06/09 strict label regression (ESS overlay — separate ESS QC track) |

**Upstream QA:** `docs/qa/evidence/pcomp-w8-mob-portal-jmob11-20260608.md`  
**Machine JSON:** `docs/qa/evidence/pcomp-w8-mob-portal-device-20260608.json`  
**UI dumps:** `docs/qa/evidence/pcomp-w8-mob-portal-screens/` (XML committed; PNG refs cited in QA **not** in repo)  
**Dev handoff:** `docs/qa/evidence/pcomp-w8-mob-home-portal-01-20260608.md` (vitest **149/149**)  
**AC delta:** `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md` §8  
**ESS dash QC (overlap):** `docs/qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-portal-jmob11-20260608.md
# exit 1 — 1/8 checks (2026-06-08 QC audit)
# FAIL: portal_url
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.**

| Failed check | QC ruling |
|--------------|-----------|
| `portal_url` | **N/A W8 mobile device** — `api_base` nip.io documented; no web portal probe in device slice |

Material pack present: journey matrix J-MOB-11..15, machine JSON booleans, residual IDs C-W8-DEVICE-01..04, XML UI dumps, valid handoff block — **auditable**.

**Process carry:** PNG screenshots referenced in QA (`portal-home-top.png`, `final-home-scroll.png`) **absent** from repo — substantiated by committed XML (`final-home-scroll.xml`, `portal-home-scroll.xml`). Condition **C-W8QC-SCREEN-PORTAL-01** (qa-device, next retest).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + adb install portal-w8 APK | ENV | **PASS** |
| Login via `qa-mobile-login-intent.mjs` deep-link | ENV / L2.5 | **PASS** |
| nip.io pilot API login **200** `HRM-AUTH-200` | ENV | **PASS** |
| L0 local `qc:dev-stack` exit **1** (`hrm-api :28001` down) | ENV | **INFO** — not blocking nip.io device UAT |
| **J-MOB-11** blue header + search + bell | PRODUCT / L2.5 | **PASS** — XML + JSON |
| **J-MOB-12** carousel + dots + birthday slide | PRODUCT / L2.5 | **PASS** — XML `Sinh nhật Huỳnh Văn Hùng` |
| **J-MOB-13** 2×4 grid 8/8 labels | PRODUCT / L2.5 | **PASS** — XML grid labels |
| **J-MOB-15** portal + ESS composite + 4-tab bar | PRODUCT / L2.5 | **PASS** — JSON + XML tabs |
| **J-MOB-08** birthday carousel (no birth year) | PRODUCT / regression | **PASS** — carousel slide |
| **J-MOB-14** payslip feed + CTA → PayslipDetail | PRODUCT / L2.5 | **DEFERRED** — AC-PORT-14-02 not exercised; «Lương» tile only |
| **J-MOB-06/09** strict Smart Hub labels | Scope | **NOT promoted** this gate — ESS stat-card overlay; API CLOSED W7; device deferrals per ESS QC |
| Promise rejection snackbar toast | PRODUCT / UX | **GWC OPEN** — consolidated **D-W8-ESS-PROMISE-01** (see §Overlap) |
| Gradle `assembleRelease` MAX_PATH Windows | ENV / build | **GWC OPEN** — **C-W8-DEVICE-01** / **PORTAL-APK-01** in flight |
| `x-company-id: main` logcat | Scope | **PASS** — not detected |
| FATAL crash | PRODUCT | **PASS** — none |

---

## L2.5 — J-MOB audit vs `MOBILE_HOME_PORTAL_AC_DELTA.md` §8

### Promoted (device @ nip.io — portal-w8 APK)

| Journey | AC focus | QA R1 | JSON | QC verdict | Evidence |
|---------|----------|-------|------|------------|----------|
| **J-MOB-11** | AC-PORT-11-01..03 header/search/bell | PASS | pass | **PASS — PROMOTED** | XML dumps; permission dialog first-run only (C-W8-DEVICE-04) |
| **J-MOB-12** | AC-PORT-12-01..02 carousel+dots | PASS | pass | **PASS — PROMOTED** | `final-home-scroll.xml` birthday slide |
| **J-MOB-13** | AC-PORT-13-01..02 grid 8/8 | PASS | pass | **PASS — PROMOTED** | XML: Hồ sơ, Sự nghiệp, Lương, Khen thưởng, Chính sách, Chấm công, Vận hành, Xem thêm |
| **J-MOB-15** | AC-PORT-15-01/05/07 composite+4-tab | PASS | pass | **PASS — PROMOTED** | Portal layers + ESS stats + announcements coexist; 4-tab unchanged |
| **J-MOB-08** | Birthday carousel regression | PASS | pass | **PASS — PROMOTED** | Carousel slide; BR-BDAY-01 satisfied on visible copy |

### Deferred / not promoted

| Journey | QA R1 | QC verdict | Rationale |
|---------|-------|------------|-----------|
| **J-MOB-14** | PARTIAL | **DEFERRED (device)** | AC-PORT-14-02 «Xem chi tiết» → PayslipDetail **not** device-tapped; feed block not in captured scroll frame on **portal-w8** APK. J-MOB-04 API historically PASS — does not close device CTA AC. |
| **J-MOB-06** | PARTIAL | **NOT promoted** (portal gate) | ESS stat cards («Đơn chờ duyệt») vs literal «Việc cần làm» — MOB-UX-06 coexist; **device PASS** already on ESS dash QC track for scroll regression. |
| **J-MOB-09** | PARTIAL | **NOT promoted** (portal gate) | «0 Nghỉ hôm nay» stat tile only; whos_out section deferred — aligned with **D-W8-ESS-JMOB09-01** / hub R3. |

**Tap-depth not exercised (accepted P2 this gate):** search stub, bell → inbox navigation, grid tile navigations beyond visual — follow-up qa-device wave after PORTAL-APK-01 unified build.

---

## Overlap — ESS dash QC (`D-W8-ESS-PROMISE-01`)

| Defect | Portal QA ID | ESS dash QC ID | QC consolidation |
|--------|--------------|----------------|------------------|
| «Possible unhandled promise rejection» snackbar on Home load | C-W8-DEVICE-03 | **D-W8-ESS-PROMISE-01** | **SINGLE GWC** — root cause `ExpoAsset.downloadAsync` / ionicons font path in Hermes 7z patch APK; owner **dev-mobile**, expiry **2026-06-14** per [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](pcomp-w8-mob-ess-dash-qc-01-20260608.md). **Do not** open duplicate condition. |

**J-MOB-14 cross-APK note:** ESS dash QC (`ess-w8` APK) reported payslip feed visible in XML. Portal R1 (`portal-w8` APK) did not capture/tap feed CTA. QC rules **portal-w8 authoritative** for this gate — J-MOB-14 device promotion **blocked** until **C-W8-DEVICE-02** closes.

---

## Defect / condition adjudication

| ID | Severity | Class | Owner | Expiry | QC ruling |
|----|----------|-------|-------|--------|-----------|
| **C-W8-DEVICE-01** | P1 process | ENV/build | dev-mobile / devops | **2026-06-21** | **GWC ACCEPTED** — MAX_PATH gradle FAIL; manual repack workaround; **PORTAL-APK-01** (`PCOMP-W8-MOB-HOME-PORTAL-APK-01`) in flight for CI/junction artifact |
| **C-W8-DEVICE-02** | P1 evidence | PRODUCT L2.5 | qa-device | **2026-06-14** | **GWC OPEN** — J-MOB-14 device: scroll to **Bảng lương** feed + tap «Xem chi tiết» → PayslipDetail; blocks J-MOB-14 promotion |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | dev-mobile | **2026-06-14** | **GWC ACCEPTED (carry)** — consolidated from C-W8-DEVICE-03; same snackbar on portal-w8 APK |
| **C-W8-DEVICE-04** | P2 process | QA automation | qa-device | **2026-06-14** | **GWC ACCEPTED** — auto-dismiss POST_NOTIFICATIONS in deep-link script before UI dump |
| **C-W8QC-SCREEN-PORTAL-01** | P2 process | Evidence | qa-device | next retest | Commit PNG screenshots cited in QA or document XML-only explicitly |

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | **U53 portal shell (MOB-UX-05a/b)** device **promotable** nip.io emulator |
| **PROMOTED** | **J-MOB-11, J-MOB-12, J-MOB-13, J-MOB-15, J-MOB-08** on `portal-w8` APK |
| **DEFERRED** | **J-MOB-14** device until **C-W8-DEVICE-02** payslip CTA proof |
| **NOT promoted** | J-MOB-06/09 strict labels on portal gate (ESS track owns scroll regression) |
| **NOT** Phase 1 DONE / **NOT** PROD / **NOT** W8 program full exit |

---

## Handoff

**completion_report:** PCOMP-W8-MOB-HOME-PORTAL-QC-01 **GO WITH CONDITIONS**. Audited QA R1 pack + JSON 5/9 journey PASS for promote set; XML cross-check confirms portal header, carousel, 8-tile grid, 4-tab composite. Pack verify **1/8** process only (portal_url N/A mobile). **J-MOB-11/12/13/15/08 device CLOSED** for U53 portal shell with conditions C-W8-DEVICE-01/02/04 + **D-W8-ESS-PROMISE-01** carry. **J-MOB-14 NOT promoted** until payslip CTA device tap.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W8-MOB-HOME-PORTAL-APK-01
from_role: pm
to_role: dev-mobile
entry_criteria: QC GWC C-W8-DEVICE-01 — gradle MAX_PATH blocks proper release APK; PORTAL-APK-01 in flight per bus
exit_criteria: CI/junction build produces signed `hrm-mobile-qa-device-portal-w8.apk` without manual jar/zipalign repack; document in LOCAL_ANDROID_BUILD.md; vitest 149/149 PASS
evidence_path: docs/qa/evidence/pcomp-w8-mob-portal-apk-01-YYYYMMDD.md
ack_status: READY_FOR_QA

Parallel when APK unified:
work_item_id: PCOMP-W8-MOB-HOME-PORTAL-QA-02
from_role: pm
to_role: qa-device
entry_criteria: C-W8-DEVICE-02 OPEN — J-MOB-14 payslip feed «Xem chi tiết» not device-tapped on portal-w8 APK
exit_criteria: Scroll capture Bảng lương feed + CTA tap → PayslipDetail; PNG or XML evidence; close C-W8-DEVICE-02; auto-dismiss permission (C-W8-DEVICE-04)
evidence_path: docs/qa/evidence/pcomp-w8-mob-portal-jmob14-YYYYMMDD.md
ack_status: PASS_TO_PM

Carry (no duplicate dispatch if dev-mobile already on D-W8-ESS-PROMISE-01):
work_item_id: D-W8-ESS-PROMISE-01
owner: dev-mobile
expiry: 2026-06-14
evidence: device home load without promise rejection snackbar

PM sync: PROGRAM_JOURNEY_MAP.md J-MOB-11..15 row → cite this QC file; NOT Phase 1 DONE claim.
```

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-home-portal-qc-01-20260608.md`

**ack_status:** `PASS_TO_PM`
