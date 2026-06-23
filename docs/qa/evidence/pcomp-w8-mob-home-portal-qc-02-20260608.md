# PCOMP-W8-MOB-HOME-PORTAL-QC-02 — U53 portal shell regate @ nip.io (J-MOB-14 closed)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-08 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-05 / U53 portal shell** full **J-MOB-11..15** device promotable nip.io emulator (`portal-w8` APK) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W8 portal shell regate)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-11..15** portal shell L2.5 device (full promote set incl. **J-MOB-14**) | Phase 1 DONE / `verify:product:completion` program exit |
| **J-MOB-08** birthday carousel regression on portal APK | PROD cutover / store release |
| Regate after **C-W8-DEVICE-02** closure | J-MOB-06/09 strict label device (ESS track) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` holding | Group CEO mobile persona |
| APK `portal-w8` (existing install; manual repack lineage) | Unified Gradle release APK — **C-W8-DEVICE-01** |

**Upstream QA (this regate):** [`pcomp-w8-mob-portal-jmob14-20260608.md`](pcomp-w8-mob-portal-jmob14-20260608.md)  
**Prior QA R1:** [`pcomp-w8-mob-portal-jmob11-20260608.md`](pcomp-w8-mob-portal-jmob11-20260608.md)  
**Prior QC:** [`pcomp-w8-mob-home-portal-qc-01-20260608.md`](pcomp-w8-mob-home-portal-qc-01-20260608.md)  
**Machine JSON (J-MOB-14):** [`pcomp-w8-mob-portal-jmob14-20260608.json`](pcomp-w8-mob-portal-jmob14-20260608.json)  
**Machine JSON (R1):** [`pcomp-w8-mob-portal-device-20260608.json`](pcomp-w8-mob-portal-device-20260608.json)  
**UI dumps R1:** [`pcomp-w8-mob-portal-screens/`](pcomp-w8-mob-portal-screens/) (15 XML; no PNG)  
**UI dumps J-MOB-14:** [`pcomp-w8-mob-portal-jmob14-screens/`](pcomp-w8-mob-portal-jmob14-screens/) (3 XML; PNG cited in QA **not** in repo)  
**AC delta:** [`docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md`](../../program/MOBILE_HOME_PORTAL_AC_DELTA.md) §8  

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-portal-jmob14-20260608.md
# exit 1 — 4/8 checks (2026-06-08 QC audit)
# FAIL: command_table, portal_url, crud_or_matrix, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.**

| Failed check | QC ruling |
|--------------|-----------|
| `portal_url` | **N/A W8 mobile device** — `api_base` nip.io documented; no web portal probe |
| `crud_or_matrix` | **N/A mobile L2.5 journey** — AC matrix in `MOBILE_HOME_PORTAL_AC_DELTA.md` §8 |
| `command_table` / `residual_section` | **Format carry** — preconditions table + condition closure present; script expects alternate headings |

Material pack present: J-MOB-14 journey steps, machine JSON booleans (`feed_visible`, `cta_found`, `detail_pass`), XML UI dumps substantiating **Bảng lương** + **Xem chi tiết** → **Chi tiết lương** / **Thực lĩnh**, valid handoff block — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + portal-w8 APK | ENV | **PASS** |
| Login via `qa-mobile-login-intent.mjs` + POST_NOTIFICATIONS auto-dismiss | ENV / L2.5 | **PASS** — **C-W8-DEVICE-04 CLOSED** |
| nip.io pilot API login **200** `HRM-AUTH-200` | ENV | **PASS** |
| **J-MOB-11..13, J-MOB-15, J-MOB-08** (R1 chain) | PRODUCT / L2.5 | **PASS — PROMOTED** (unchanged from QC-01; XML R1 cross-check) |
| **J-MOB-14** payslip feed + CTA → PayslipDetail | PRODUCT / L2.5 | **PASS — PROMOTED** — **C-W8-DEVICE-02 CLOSED** |
| **J-MOB-06/09** strict Smart Hub labels | Scope | **NOT promoted** this gate — ESS track |
| Promise rejection snackbar (ExpoAsset ionicons) | PRODUCT / UX | **GWC OPEN** — **D-W8-ESS-PROMISE-01** (visible in `j14-scroll-0.xml` + `j14-payslip-detail.xml`) |
| Gradle `assembleRelease` MAX_PATH Windows | ENV / build | **GWC OPEN** — **C-W8-DEVICE-01** / **PORTAL-APK-01** |
| `x-company-id: main` logcat | Scope | **PASS** — not detected |
| FATAL crash | PRODUCT | **PASS** — none |

---

## L2.5 — J-MOB audit vs `MOBILE_HOME_PORTAL_AC_DELTA.md` §8

### Promoted (device @ nip.io — portal-w8 APK)

| Journey | AC focus | R1 / R2 | QC verdict | Evidence |
|---------|----------|---------|------------|----------|
| **J-MOB-11** | AC-PORT-11-01..03 header/search/bell | R1 PASS | **PASS — PROMOTED** | `pcomp-w8-mob-portal-screens/portal-home-top.xml` |
| **J-MOB-12** | AC-PORT-12-01..02 carousel+dots | R1 PASS | **PASS — PROMOTED** | `final-home-scroll.xml` — `Sinh nhật Huỳnh Văn Hùng` |
| **J-MOB-13** | AC-PORT-13-01..02 grid 8/8 | R1 PASS | **PASS — PROMOTED** | XML 8-tile grid (Hồ sơ … Xem thêm) |
| **J-MOB-14** | AC-PORT-14-01/02 feed + CTA → detail | **R2 PASS** | **PASS — PROMOTED** | `j14-scroll-0.xml`: **Bảng lương**, **Xem chi tiết**, Kỳ lương 05/2026; tap → `j14-payslip-detail.xml`: **Chi tiết lương**, **Thực lĩnh** 82.340.000 ₫ |
| **J-MOB-15** | AC-PORT-15-01/05/07 composite+4-tab | R1 PASS | **PASS — PROMOTED** | JSON + XML 4-tab bar |
| **J-MOB-08** | Birthday carousel regression | R1 PASS | **PASS — PROMOTED** | Carousel slide; no birth year on visible copy |

**J-MOB-11..15 row recommendation:** Update `PROGRAM_JOURNEY_MAP.md` to cite **this QC file** as regate authority; status **device PASS** full portal shell slice.

### Not promoted (unchanged)

| Journey | QC verdict | Rationale |
|---------|------------|-----------|
| **J-MOB-06** | **NOT promoted** (portal gate) | ESS stat cards vs literal «Việc cần làm» — MOB-UX-06 ESS track |
| **J-MOB-09** | **NOT promoted** (portal gate) | «0 Nghỉ hôm nay» stat tile only; whos_out deferred **MOB-UX-07** / **D-W8-ESS-JMOB09-01** |

**Tap-depth P2 (accepted):** search stub, bell → inbox, grid tile navigations beyond visual — follow-up after **C-W8-DEVICE-01** unified APK.

---

## Screenshot / XML cross-check

| Artifact set | PNG in repo | XML in repo | QC ruling |
|--------------|-------------|-------------|-----------|
| `pcomp-w8-mob-portal-screens/` (R1) | **No** | **Yes** (15 files) | Substantiated — carousel, grid, tabs in XML |
| `pcomp-w8-mob-portal-jmob14-screens/` (R2) | **No** (QA cites 3 PNG) | **Yes** (3 files) | **AC-PORT-14-02 satisfied by XML** — feed, CTA bounds, PayslipDetail markers |
| **C-W8QC-SCREEN-PORTAL-01** | Partial | J-MOB-14 slice XML-only explicit | **P2 carry** — commit PNG on next qa-device wave optional |

QC spot-read `j14-scroll-0.xml`: confirms **Bảng lương** section, **Xem chi tiết** button @ bounds [87,2091][993,2144], payroll card **Thực lĩnh · processed**.  
QC spot-read `j14-payslip-detail.xml`: confirms navigation to **Chi tiết lương** with **Kỳ lương 05/2026**, **Thực lĩnh** 82.340.000 ₫ — matches JSON `detail_pass: true`.

---

## Condition delta vs QC-01

| ID | QC-01 | QC-02 | Owner |
|----|-------|-------|-------|
| **C-W8-DEVICE-01** | GWC OPEN | **GWC OPEN (carry)** | dev-mobile / devops — MAX_PATH Gradle; **PORTAL-APK-01** |
| **C-W8-DEVICE-02** | GWC OPEN | **CLOSED** | qa-device — J-MOB-14 CTA device proof |
| **C-W8-DEVICE-04** | GWC OPEN | **CLOSED** | qa-device — `dismissPostNotifications()` in login script |
| **D-W8-ESS-PROMISE-01** | GWC OPEN | **GWC OPEN (carry)** | dev-mobile — ExpoAsset ionicons snackbar on Home load |
| **C-W8QC-SCREEN-PORTAL-01** | GWC OPEN | **P2 carry** | qa-device — PNG optional; J-MOB-14 XML explicit |

**Remaining GWC (2):** **C-W8-DEVICE-01** + **D-W8-ESS-PROMISE-01** only.

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **U53 portal shell (MOB-UX-05a/b)** device **promotable** nip.io emulator |
| **PROMOTED** | **J-MOB-11, J-MOB-12, J-MOB-13, J-MOB-14, J-MOB-15, J-MOB-08** on `portal-w8` APK |
| **NOT promoted** | J-MOB-06/09 strict labels (ESS / MOB-UX-07 track) |
| **GWC carry** | **C-W8-DEVICE-01** (Gradle APK), **D-W8-ESS-PROMISE-01** (promise snackbar) |
| **NOT** Phase 1 DONE / **NOT** PROD / **NOT** W8 program full exit | |

---

## Handoff

**completion_report:** PCOMP-W8-MOB-HOME-PORTAL-QC-02 **GO WITH CONDITIONS (reduced)**. Regated after QA-02 J-MOB-14 device PASS; XML cross-check closes **C-W8-DEVICE-02** and confirms AC-PORT-14-02 CTA → PayslipDetail. Full **J-MOB-11..15** portal shell slice **device promotable** with R1+R2 chain. **C-W8-DEVICE-04 CLOSED**. Pack verify **4/8** process only. Only **C-W8-DEVICE-01** + **D-W8-ESS-PROMISE-01** remain. Recommend `PROGRAM_JOURNEY_MAP.md` J-MOB-11..15 row cite this QC file.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W8-MOB-HOME-PORTAL-APK-01
from_role: pm
to_role: dev-mobile
entry_criteria: QC GWC C-W8-DEVICE-01 — gradle MAX_PATH blocks proper release APK; only remaining build GWC on portal shell regate
exit_criteria: CI/junction build produces signed hrm-mobile-qa-device-portal-w8.apk without manual jar/zipalign repack; document LOCAL_ANDROID_BUILD.md; vitest 149/149 PASS
evidence_path: docs/qa/evidence/pcomp-w8-mob-portal-apk-01-YYYYMMDD.md
ack_status: READY_FOR_QA

Parallel after APK unified (or on current portal-w8 if APK deferred):
work_item_id: PCOMP-W8-MOB-ESS-WHOS-01
from_role: pm
to_role: qa-device
entry_criteria: QC-02 reduced GWC — J-MOB-09 device NOT promoted portal gate; MOB-UX-07 whos_out section; hub API CLOSED W7
exit_criteria: Device scroll to whos_out / «Ai nghỉ hôm nay» section on nip.io; J-MOB-09 device PASS; evidence PNG or XML
evidence_path: docs/qa/evidence/pcomp-w8-mob-jmob09-whos-YYYYMMDD.md
ack_status: PASS_TO_PM

Carry (dev-mobile if not already dispatched):
work_item_id: D-W8-ESS-PROMISE-01
owner: dev-mobile
expiry: 2026-06-14
exit_criteria: Home load on portal-w8 APK without ExpoAsset ionicons promise rejection snackbar

PM sync: PROGRAM_JOURNEY_MAP.md J-MOB-11..15 → cite pcomp-w8-mob-home-portal-qc-02-20260608.md; NOT Phase 1 DONE claim.
```

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-home-portal-qc-02-20260608.md`

**ack_status:** `PASS_TO_PM`
