# PCOMP-W8-MOB-ESS-DASH-QC-01 — MOB-UX-06 ESS dashboard device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-DASH-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-08 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-06 ESS dashboard** + portal/hub regression **promotable** nip.io emulator; **J-MOB-19..22 device CLOSED** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W8 ESS dash @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-19..22** ESS layer device L2.5 @ `https://14-225-217-232.nip.io` | Phase 1 DONE / `verify:product:completion` program exit |
| **J-MOB-11..15** portal shell regression on same APK scroll | PROD cutover / store release |
| **J-MOB-06/07/08** Smart Hub regression (scroll capture) | Full Gradle release rebuild (MAX_PATH) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` holding | Group CEO mobile persona |
| APK `hrm-mobile-qa-device-ess-w8.apk` (Hermes 7z patch from portal-w8 base) | Web portal embed J-HRM-* browser |
| Audit **D-W8-ESS-PROMISE-01** (unhandled rejection snackbar) | J-MOB-09 device scroll (deferred whos_out R3) |

**Upstream QA:** `docs/qa/evidence/pcomp-w8-mob-ess-dash-01-qa-20260608.md`  
**Machine JSON:** `docs/qa/evidence/pcomp-w8-mob-ess-dash-device-20260608.json`  
**UI dumps:** `docs/qa/evidence/pcomp-w8-mob-ess-dash-screens/` (XML; PNG refs not in repo)  
**Hub API chain (J-MOB-06/08/09 API):** `docs/qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-ess-dash-01-qa-20260608.md
# exit 1 — 3/8 checks (2026-06-08 QC audit)
# FAIL: work_item_id (colon line), command_table (exit codes), portal_url
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Failures are **format / slice-appropriate** for mobile device pack:

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` | **Format** — table has `work_item_id` but verifier expects top-level `work_item_id:` colon line |
| `command_table` | **Format** — commands listed; missing normalized exit-code table (`exit 0` / PASS column) |
| `portal_url` | **N/A W8 mobile** — `api_base` nip.io documented; no web portal probe in device slice |

Material pack present: journey matrix J-MOB-19..22, regression table, JSON `checks.*` booleans, residual IDs, valid handoff YAML — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + adb install Hermes APK | ENV | **PASS** |
| Login `home_reached: true` via `qa-mobile-login-intent.mjs` | ENV / L2.5 | **PASS** — script exit 1 from stale `fatal_logcat`; UI functional per QA + XML |
| nip.io API `holding` slug reachable | ENV | **PASS** — same pilot as W7 hub |
| **J-MOB-19..22** ESS compose visible (JSON 9/9 + XML partial) | PRODUCT / L2.5 | **PASS** |
| **J-MOB-11..15** portal shell regression | PRODUCT / L2.5 | **PASS** — grid 8/8, carousel, payslip, 4-tab nav |
| **J-MOB-06/07/08** hub cards on scroll | PRODUCT / L2.5 | **PASS** — JSON `jmob06_tasks`, `jmob07_manager`, `jmob08_birthday` true |
| **J-MOB-09** «Ai nghỉ hôm nay» in scroll frame | Scope / evidence | **DEFERRED** — `jmob09_whos_out: false`; API **CLOSED** W7 |
| Red snackbar «Possible unhandled promise rejection» | PRODUCT / UX | **GWC OPEN** — **D-W8-ESS-PROMISE-01** |
| ExpoAsset `ionicons` font download fail (Hermes patch path) | PRODUCT / build | **Root cause** of D-W8-ESS-PROMISE-01 — not push registration |
| Gradle `assembleRelease` MAX_PATH on Windows | ENV / build | **INFO** — Hermes 7z workaround documented **D-W8-APK-GRADLE-01** P2 |
| PNG screenshots cited in QA (`ess-final-top.png` etc.) | Process | **PARTIAL** — only 2 XML UI dumps committed; JSON + XML substantiate claims |

**Product NO-GO avoided:** ESS layer and portal regression functionally visible; promise banner is P1 UX GWC, not journey blocker for promotion with condition.

---

## L2.5 — J-MOB audit (device @ nip.io emulator)

### J-MOB-19..22 (primary — MOB-UX-06)

| Journey | Requirement | QA R2 | JSON check | QC verdict | Evidence |
|---------|-------------|-------|------------|------------|----------|
| **J-MOB-19** | Header avatar + role + chat + bell | PASS | 4/4 true | **PASS** | JSON; top frame not in committed XML (scroll offset) |
| **J-MOB-20** | Greeting + date pill + stats row | PASS | 3/3 true | **PASS** | JSON |
| **J-MOB-21** | Four stat cards (213/0/2/2) | PASS | true | **PASS** | XML: `Đơn chờ duyệt, 2`, `Đơn nghỉ của tôi, 2` |
| **J-MOB-22** | Announcements + Xem tất cả | PASS | true | **PASS** | XML: `Thông báo`, announcement rows `07/06/2026` |

**ESS summary:** **4/4 PASS** device L2.5 @ nip.io emulator — **promotable with GWC** on promise banner.

### Portal regression — J-MOB-11..15

| Journey | QA R2 | JSON | QC verdict | Evidence |
|---------|-------|------|------------|----------|
| **J-MOB-11** header+bell | PASS | true | **PASS** | JSON |
| **J-MOB-12** carousel | PASS | true | **PASS** | XML: `Sinh nhật Huỳnh Văn Hùng` |
| **J-MOB-13** grid 8 icons | PASS 8/8 | true | **PASS** | XML: Hồ sơ, Sự nghiệp, Lương, Khen thưởng, Chính sách, Chấm công, Vận hành, Xem thêm |
| **J-MOB-14** payslip feed | PASS | true | **PASS** | XML: `Bảng lương`, `Kỳ lương 05/2026 — holding` |
| **J-MOB-15** 4-tab composite | PASS | true | **PASS** | XML: Trang chủ / Chấm công / Đơn công / Thêm |

### Smart Hub regression — J-MOB-06..09

| Journey | QA R2 | JSON | QC verdict | Notes |
|---------|-------|------|------------|-------|
| **J-MOB-06** Việc cần làm badge | PASS | true | **PASS** | Scroll regression |
| **J-MOB-07** Cần duyệt (2) | PASS | true | **PASS** | Scroll regression |
| **J-MOB-08** Sinh nhật carousel | PASS | true | **PASS** | XML carousel slide |
| **J-MOB-09** Ai nghỉ hôm nay | **GWC** | false | **DEFERRED (device)** | API **CLOSED** per `pcomp-w7-qc-hub-04b-r3-20260607.md`; device scroll capture → **whos_out/hub R3** |

**Journey map sync (PM):** Update `PROGRAM_JOURNEY_MAP.md`:
- **J-MOB-19..22** → ✅ device PASS citing this QC file
- **J-MOB-11..15** → ✅ device PASS MOB-UX-05/06 composite
- **J-MOB-09** → retain API ✅; device scroll **⏳ deferred** whos_out R3

---

## Defect / condition adjudication

| ID | Severity | Class | Owner | Expiry | QC ruling |
|----|----------|-------|-------|--------|-----------|
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | dev-mobile | **2026-06-14** | **GWC ACCEPTED** — snackbar visible in XML; `ExpoAsset.downloadAsync` ionicons font path broken in Hermes 7z patch; does not block ESS journey visibility |
| **D-W8-ESS-JMOB09-01** | P2 evidence | Scope | qa-device | whos_out R3 | **DEFERRED** — not product NO-GO; API layer closed W7 |
| **D-W8-APK-GRADLE-01** | P2 process | ENV/build | dev-mobile | **2026-06-21** | **Carry** — document Hermes workaround in `LOCAL_ANDROID_BUILD.md` |
| **C-W8QC-PACK-01** | Process | Format | qa-device | next mobile wave | Add colon `work_item_id:` + exit-code command table |
| **C-W8QC-SCREEN-01** | Process | Evidence | qa-device | next retest | Commit PNG screenshots referenced in QA or cite XML-only explicitly |

---

## Interactions not exercised (accepted P2)

| Interaction | QA note | QC |
|-------------|---------|-----|
| chatStub tap | false | **P2** — stub navigation deferred |
| dateChange | false | **P2** — date pill interaction deferred |
| statCardNav | false | **P2** — stat card deep link deferred |

Functional visibility AC for MOB-UX-06 compose **met**; navigation depth is follow-up wave.

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **J-MOB-19..22** ESS dashboard **device promotable** nip.io emulator |
| | **J-MOB-11..15** + **J-MOB-06/07/08** regression **promotable** same APK |
| | **J-MOB-09** device **NOT promoted** — deferred whos_out/hub R3; API remains CLOSED |
| | **NOT Phase 1 DONE** / **NOT PROD** / **NOT** W8 program full exit |

---

## Handoff

**completion_report:** PCOMP-W8-MOB-ESS-DASH-QC-01 **GO WITH CONDITIONS (reduced)**. Audited QA R2 pack + JSON 16/17 checks PASS (`jmob09` deferred). XML cross-check confirms J-MOB-21/22, J-MOB-12..15, hub carousel, and **D-W8-ESS-PROMISE-01** snackbar. Pack verify **3/8** process GWC only. **J-MOB-19..22 device CLOSED** for nip.io emulator promotion with promise-fix condition.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake QC PASS → (1) dispatch `dev-mobile` `D-W8-ESS-PROMISE-01` — fix `ExpoAsset.downloadAsync` / ionicons font bundling in Hermes 7z patch APK (DashboardScreen mount); owner dev-mobile, expiry 2026-06-14; evidence vitest + device no snackbar; (2) sync `PROGRAM_JOURNEY_MAP.md` J-MOB-19..22 → ✅ device + J-MOB-11..15 device; J-MOB-09 device ⏳ whos_out R3; (3) when whos_out fix lands, dispatch `qa-device` scroll capture J-MOB-09; (4) **NOT** Phase 1 DONE claim.

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md`

**ack_status:** `PASS_TO_PM`
