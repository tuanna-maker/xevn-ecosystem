# Evidence — PO-MFD-M2-ATT-DEVICE-RULES-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-DEVICE-RULES-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 (matrix #35–36 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — honest #35 device setup UI (no Nest device registry) + #36 app policy via existing `GET/PATCH /attendance/rules` + work-sites (M1 CFG already GWC) |
| **sponsor_confirm** | **None invented** — no claim customer signed hardware sync / Face LIVE / Wi‑Fi SSID enforcement |
| **dev_coding** | **Not opened** (FR_NEEDED rejected for Phase-1) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | WEEKLY QA PASS → QC in flight · OVERVIEW / SETTINGS-EMP / rules Chung·Công chuẩn·GPS GWC · CFG-COLUMNS ACCEPTED_AS_IS_P1 · **not** Attendance CLOSED · `uat_done: false` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#35** | Rules→**Thiết bị** `activeRulesTab=device`. Actions: «Device attendance rules form». SRS/TechSpec **SPEC_GAP**. Runtime **LIVE**. UC **UNMAPPED**. Owner sa · P1. |
| Fidelity matrix **#36** | Rules→**Ứng dụng** `activeRulesTab=app`. Actions: «Mobile app policy fields». Spec pointer `SRS_VN.md` geofence. Runtime **LIVE**. UC **UNMAPPED**. Owner qa · P1. |
| M2 backlog **P1-7** | This WI — governance #35–36 · not ATT CLOSED. |
| ADR `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` | **D2** flags `gps_enabled` / `wifi_enabled` / `qr_enabled` / `faceid_enabled` = Device/App policy on `attendance_rules`. **D3** geofence SoT = `attendance_work_sites` (App GPS admin). **D4** FaceID OUT GĐ1 (persist false + UI disabled). Tablet/proxy/auto = stub sidebars — orthogonal (#37–39). |
| Enterprise API map C7 | Rules App GPS CRUD GWC; FaceID GĐ2; recommend **GĐ2-HOLD** device/face/proxy; columns already ACCEPTED_AS_IS. |
| `SRS_VN.md` | Narrative: geofence GPS **200m**, auto checkout 10h, anti-spoof — **not** a full FR Diễn biến for Rules→Thiết bị hardware tool sync. Auto-checkout owns **#39** (separate P1-8). |
| `docs/hrm/SRS.md` | Phase-1 ATT lock remains **AC-ATT-SHEET-*** on FR-HRM-AT-14; **no** overwrite this seat. No confirmed FR for device-agent download / login-code registry. |
| HDSD grep | **No** operable HDSD step «Quy tắc → Thiết bị → cài tool / mã đăng nhập» requiring Nest persist. |
| by-uc `HRM-AT-14.md` | CAP-04 = Ứng dụng & GPS (FN-RULE-APP-SAVE · FN-GPS-CRUD). Device tab login code = **Optional / Out of §5 P0 · UNMAPPED**. CFG slice GWC supersedes in-memory. Columns residual closed elsewhere. |
| FE `Attendance.tsx` `renderDeviceTabContent` | Static wizard: Tool v1/v2 table, **hardcoded** truncated `loginCode`, Download/Copy/FAQ CTAs — **no** `saveAttendanceRules` / no device registry Network. |
| FE `renderAppTabContent` | GPS/Wifi/QR toggles → `handleSaveAppPolicy` → `PATCH /attendance/rules` (`gps_enabled`/`wifi_enabled`/`qr_enabled`). Face ID forced disabled + banner (ADR D4). GPS locations → work-sites CRUD (ADR D3). App Store / Play buttons = marketing CTAs unwired. |
| BE `UpdateAttendanceRulesDto` + `attendance-config.service` | PATCH accepts gps/wifi/qr/faceid; faceid forced **false**. `isGpsGeofenceEnabled` gates record geofence. **No** Nest route for hardware tool versions / agent login codes / device registry. wifi/qr flags **persist**; runtime Wi‑Fi SSID / QR gate on TXN **not** fully enforced beyond storage (honesty boundary). |

## As-is vs to-be (Phase-1 / M2 #35–36)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #36 GPS/Wifi/QR flags | LIVE wire → `PATCH …/rules` | **Accepted** — keep M1 CFG GWC; AC honesty on F5 |
| #36 GPS work-sites | LIVE CRUD → `/attendance/work-sites` | **Accepted** — must_keep geofence GWC |
| #36 Face ID | Disabled + banner; BE forces false | **Accepted** GĐ1 OUT (ADR D4) — not LIVE Face |
| #36 App Store / Play | Visible unwired CTAs | Honest AS-IS (no false LIVE download claim) |
| #35 Tool download / login code / FAQ | Static REF-shaped UI, no API | **Accepted AS-IS** display; **no** Nest device registry required Phase-1 |
| Hardware device registry / agent sync TXN | None | **Deferred GĐ2 candidate** — do not invent FR |
| Wi‑Fi SSID / QR method hard-gate on check-in | Flags stored; limited TXN gate | Persist flags OK; deep enforcement = GĐ2 candidate |
| Auto-checkout 10h job | STUB #39 / P1-8 | **Out of this seat** — do not absorb |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#35–36** / M2 **P1-7** without opening Dev:

1. **#36** already matches ADR D2/D3 + shipped Nest rules/work-sites — Phase-1 AC = honest persist of **existing** PATCH fields + work-sites + Face GĐ1 hold (M1 CFG GWC must_keep).
2. **#35** has **NO_API** for device-agent registry; SRS/HDSD lack FR Diễn biến for tool sync — inventing Nest device API or FR_NEEDED Phase-1 = process defect (parallel to CFG-COLUMNS / SETTINGS-EMP mapping).
3. Matrix **LIVE** on #35 remains valid as **display surface** only when honesty AC forbids claiming Download/login-code as LIVE persist.
4. Enterprise map already classifies hardware device depth as **GĐ2-HOLD** — align governance, do not reopen Chung/Standard/GPS GWC.

### B) FR_NEEDED Phase-1 — **REJECTED**

Would invent sponsor-grade FR for hardware tool sync / device registry / Wi‑Fi SSID enforcement without HDSD/SRS Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + spec-before-code. ADD-only note kept below as **inactive** GĐ2 candidate only.

### C) Boundary LIVE wire / persist SPEC_GAP as sole label — **REJECTED as primary**

Would incorrectly reopen #36 (already PATCH + work-sites LIVE) as open SPEC_GAP and leave #35 without Phase-1 honesty AC. Persist gaps that remain (device registry, Face LIVE, Wi‑Fi SSID TXN gate) are recorded as **DEFERRED_GĐ2_CANDIDATE** under A — not a separate C verdict for the whole seat.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-DEVAPP-01** | Rules→**Ứng dụng** shows GPS / Wifi / QR toggles bound to Nest rules fields | Toggle UI present; Network on change = `PATCH /api/hrm/attendance/rules` 2xx for flag patch | Fake toast «đã lưu» without PATCH; claim LIVE without API |
| **AC-ATT-DEVAPP-02** | After toggle GPS/Wifi/QR → F5 → GET rules returns same boolean values | F5 retains | Values reset to FE-only defaults |
| **AC-ATT-DEVAPP-03** | GPS locations admin uses work-sites path (add/remove → Nest work-sites 2xx + F5); empty list honest empty | Work-sites CRUD OK | Writing only deprecated `gps_locations` JSON as SoT; invent seed sites for PASS |
| **AC-ATT-DEVAPP-04** | Face ID remains **GĐ1 OUT**: disabled control + banner; PATCH cannot enable Face LIVE | Face stays false | Enable Face LIVE / remove banner and claim GĐ1 Face |
| **AC-ATT-DEVAPP-05** | Rules→**Thiết bị** may show REF-shaped tool/login/FAQ UI; **must not** claim Download / mã đăng nhập / sync as **LIVE persist** without Nest device API 2xx + F5 | Static wizard OK | «Đã kết nối máy» / success without device API |
| **AC-ATT-DEVAPP-06** | No Nest **device registry / agent login-code** API required to close P1-7 Phase-1 | Close without device endpoint | QA FAIL only because no hardware API 200 |
| **AC-ATT-DEVAPP-07** | must_keep: Chung / Công chuẩn / GPS GWC · CFG-COLUMNS AS-IS · WEEKLY QC seat · SETTINGS-EMP #31 — **orthogonal** | No regression | Regress rules GWC while «fixing» device tab |
| **AC-ATT-DEVAPP-08** | U65: no `pnpm seed:*` / DB fake device rows or work-sites for PASS | Browser FE path only | Seed to green #35–36 |
| **AC-ATT-DEVAPP-09** | wifi/qr **persist** accepted; deep Wi‑Fi SSID / QR hard-gate on every TXN **not** required Phase-1 | Flags in DB OK | Invent FAIL because SSID ACL missing |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P1-7** / matrix #35–36 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-DEVAPP-01..09 · no Dev |
| Matrix #36 LIVE | **Keep LIVE** — Nest rules + work-sites | Align UC map later optional (HRM-AT-14 CAP-04) |
| Matrix #35 LIVE | **Keep LIVE** display · stamp honesty AS-IS (no device API) | UNMAPPED UC OK Phase-1 |
| Device registry / agent sync API | **DEFERRED_GĐ2_CANDIDATE** | Open only after sponsor FR |
| Face ID LIVE pipeline | **GĐ2-HOLD** (ADR D4) | Already locked |
| Wi‑Fi SSID / QR method TXN hard-gate | **DEFERRED_GĐ2_CANDIDATE** | Flags persist ≠ full enforcement |
| Auto-checkout timer (#39 / P1-8) | **Out of seat** | Do not absorb into device-rules |
| Optional FE honesty polish (#35 disable Download pretend) | **Non-blocking P2** | Not required to close P1-7 |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-DEV-REG-01** | Rules→Thiết bị: đăng ký máy/agent, phát hành mã đăng nhập có TTL, đồng bộ TXN từ thiết bị → `attendance_records` với audit |
| **FR-ATT-APP-WIFI-01** | (optional) Enforce `wifi_enabled` + SSID allow-list on check-in when flag true |
| **FR-ATT-FACE-01** | Face LIVE — already mindmap/ADR GĐ2-HOLD |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR or extend HRM-AT-14 CAP — **preserve** AC-ATT-SHEET + rules GWC AC |
| Happy | HCNS mở Thiết bị → cấp mã → agent sync → bản ghi vào lưới công |
| Fail sâu | Mã hết hạn · sai scope company · duplicate device id → 4xx deterministic |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| sa | Verdict A + AC + GĐ2 candidates; no apps/** |
| pm | Intake PASS_TO_PM; stamp matrix/backlog P1-7 CLOSED; **do not** dispatch Dev for device registry |
| qa/qc | #36: PATCH/F5 + work-sites; #35: FAIL only false LIVE persist claims; do not NO-GO for missing hardware API |
| dev-fe / dev-be | **Idle** until sponsor opens FR-ATT-DEV-REG-01 (or related) |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-DEV-HW-01 | Sponsor | Need GĐ1 hardware agent sync at all, or keep REF-shaped setup forever? |
| Q-ATT-WIFI-ENF-01 | Sponsor / sa | Persist-only wifi/qr flags enough for GĐ1 payroll honesty? |

No answer required to close P1-7 Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No touch WEEKLY / OVERVIEW / SETTINGS GWC seats
- No absorb #39 auto-checkout into this WI

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| M2 backlog **P1-7** | **CLOSED** ACCEPTED_AS_IS_P1 · governance · not ATT CLOSED |
| Matrix #35 | keep **LIVE** · note ACCEPTED_AS_IS honest REF-shaped (no device API) · registry GĐ2 candidate |
| Matrix #36 | keep **LIVE** · Nest rules PATCH + work-sites · Face GĐ1 OUT · AC-ATT-DEVAPP-01..04 |

## completion_report

**Closed:** SA governance for Attendance Rules **#35 Thiết bị** + **#36 Ứng dụng** (M2 **P1-7**). Verdict **A) ACCEPTED_AS_IS_P1**: #36 accepts existing Nest `GET/PATCH /attendance/rules` flags + work-sites CRUD (M1 CFG GWC must_keep; Face GĐ1 OUT); #35 accepts honest static device-setup UI without Nest device registry / FR_NEEDED Phase-1. Measurable **AC-ATT-DEVAPP-01..09**. Device registry / Face LIVE / Wi‑Fi SSID TXN gate = **DEFERRED_GĐ2_CANDIDATE**. **No Dev opened.** WEEKLY/OVERVIEW/SETTINGS GWC untouched. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-DEV-HW-01 / Q-ATT-WIFI-ENF-01; optional P2 FE honesty polish on #35 Download CTAs — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-DEVICE-RULES-SPEC-CLOSE-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-device-rules-01-spec.md

Action:
1) Bus INTAKE: close P1-7 / matrix #35–36 as ACCEPTED_AS_IS_P1 per SA evidence.
2) Stamp M2 backlog P1-7 CLOSED governance; matrix #35 LIVE + honesty AS-IS (no device API); #36 LIVE Nest rules+work-sites + Face GĐ1 OUT.
3) Do NOT dispatch dev-fe/dev-be for device registry / agent login-code / Face LIVE / Wi‑Fi SSID ACL without sponsor opening FR-ATT-DEV-REG-01 (or related).
4) Do NOT invent Attendance CLOSED / uat_done=true. must_keep WEEKLY QC in flight · OVERVIEW · SETTINGS-EMP · rules Chung/Standard/GPS GWC · CFG-COLUMNS AS-IS.
5) Continue other open M2 seats only (e.g. P1-8 auto-checkout after WEEKLY QC) — device/app rules seat closed; no FR_NEEDED Dev wave.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-device-rules-01-spec.md`

## ack_status

**PASS_TO_PM**
