# Evidence — PO-MFD-M2-ATT-QR-CLOCK-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-QR-CLOCK-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 (matrix #8 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — QR clock covered by existing **HRM-AT-01** / CLOCK TXN (`POST /attendance/records`) + **`qr_enabled`** CFG (DEVICE-RULES #36 already ACCEPTED); honest **PARTIAL** shell OK Phase-1 |
| **sponsor_confirm** | **None invented** — no claim customer signed QR gate protocol / signed-token QR / Attendance CLOSED |
| **dev_coding** | **Not opened** (FR_NEEDED Phase-1 rejected) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | CLOCK GWC (#6/#7/#10 LIVE · #9 Face GĐ2-HOLD) · DEVICE-RULES ACCEPTED_AS_IS (#36 `qr_enabled`) · WEEKLY GWC · Face GĐ1 OUT · **not** Attendance CLOSED · `uat_done: false` · U65 zero-seed |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#8** | CC→HRM→Chấm công→Clock-In→**QR** · `clock-in · qr`. Actions: «Quét QR». Spec: HRM-AT-01 + mindmap FaceID/GPS GĐ2 signal · TechSpec **SPEC_GAP QR depth**. API: `POST records` / SPEC_GAP. Runtime **PARTIAL** (shell · CLOCK-01). UC **UNMAPPED**. Owner ba · P1. |
| Fidelity matrix **#6/#7/#10/#9** | Hub/Manual/GPS **LIVE** via `PO-MFD-M2-ATT-CLOCK-01` (+ R2 GPS). Face **GĐ2-HOLD**. **Do not reopen CLOCK** without FAIL. |
| M2 backlog **P1-10** | This WI — governance #8 · not ATT CLOSED. SYNTH bucket had «UC create / SPEC_GAP» — **superseded** by this decision (same pattern as DEVICE-RULES / CFG-COLUMNS). |
| CLOCK QA/QC | `po-mfd-m2-att-clock-01-qa.md`: #8 PARTIAL shell; residual `R-MFD-M2-CLOCK-QR-DEPTH` → P1-10. R2 QC: Face/QR depth **not promoted**; QR mutate **out-of-scope condition** — CLOCK GWC closed without QR LIVE claim. |
| DEVICE-RULES evidence | `po-mfd-m2-att-device-rules-01-spec.md` **A) ACCEPTED_AS_IS_P1**: `qr_enabled` PATCH/F5 accepted; **AC-ATT-DEVAPP-09** deep Wi‑Fi SSID / **QR method hard-gate on every TXN not required Phase-1**; residual **DEFERRED_GĐ2_CANDIDATE**. |
| ADR CFG persist | D2 flags include `qr_enabled` on `attendance_rules`. D4 Face OUT GĐ1 (orthogonal — Face ≠ QR). |
| Enterprise API map C2 | Clock TXN = `POST /attendance/records`. UI without API called out for **FaceID** GĐ2 — **not** a separate Nest QR endpoint. No dedicated `/attendance/qr-*` route. |
| `docs/hrm/SRS.md` | **No** QR clock FR Diễn biến. Phase-1 ATT lock remains sheets/rules AC elsewhere — **no overwrite** this seat. |
| `SRS_VN.md` / HDSD grep | Geofence GPS narrative; client HDSD check-in maps generic `POST …/records` (FR-ATT-01 style) — **no** operable HDSD step «Clock-In → QR → quét mã → Lưu» as separate FR. |
| by-uc `HRM-AT-01.md` | CAP/FN = open + **POST /api/hrm/attendance/records** + F5 + validate/scope. **No** method-specific QR TC rows — method is UI alternate of same UC. |
| Mindmap gap (`doc-ent-hrm-mmap-01`) | Device GPS/FaceID leaf: **GPS IN_GĐ1**; **FaceID / hardware** GĐ2_CANDIDATE — QR portal alternate method **not** elevated to Face GĐ2-HOLD. |
| FE `Attendance.tsx` | `clock-in-panel-qrcode` → `QRCodeScanner` + `EmployeeQRCard` (enabled panel). Face has hold banner + `pointer-events-none` — **QR is not Face HOLD**. |
| FE `QRCodeScanner.tsx` | Camera scan → resolve employee by `employee_code`/`id` → confirm → `checkIn`/`checkOut` with `check_in_device: 'QR Code Scanner'` → same records hook as Manual/GPS. |
| BE `attendance.service` | **No** `qr_enabled` gate on create-record path (grep empty). Flag persist ≠ TXN hard-gate (honesty already locked in DEVICE-RULES). |

## As-is vs to-be (Phase-1 / M2 #8)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| Clock hub + Manual + GPS | LIVE CLOCK GWC | **must_keep** — do not reopen |
| Face method | GĐ2-HOLD banner | **must_keep** — orthogonal |
| QR method panel | PARTIAL shell (CLOCK-01 inventoried) | **Accepted AS-IS PARTIAL** — alternate UI of HRM-AT-01 |
| QR → POST records | Code path exists (device string QR) | Same TXN contract as Manual; **no** new API required Phase-1 |
| `qr_enabled` CFG | PATCH rules LIVE (#36) | **Covered** by DEVICE-RULES ACCEPTED — do not reopen |
| QR hard-gate when flag false / signed QR protocol | Not enforced BE | **DEFERRED_GĐ2_CANDIDATE** (align AC-ATT-DEVAPP-09) |
| Dedicated FR-QR Diễn biến Phase-1 | Missing in SRS/HDSD | **Not invented** — FR_NEEDED rejected |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#8** / M2 **P1-10** without opening Dev and without Phase-1 UC delta overwrite:

1. **QR is not a separate GĐ1 FR** — it is an **alternate clock-in method** under **HRM-AT-01** using the same `POST /attendance/records` already GWC for Manual/GPS.
2. **Policy flag** `qr_enabled` is already **ACCEPTED_AS_IS** under DEVICE-RULES #36; deep TXN hard-gate already deferred GĐ2 (AC-ATT-DEVAPP-09) — do not reopen that seat.
3. Matrix **PARTIAL** remains the honest runtime stamp until optional QA browser proves camera→POST→F5 (non-blocking for this governance close; CLOCK already excluded QR mutate from GWC).
4. Inventing **FR_NEEDED** Diễn biến or Nest QR protocol API without SRS/HDSD/sponsor = process defect (parallel CFG-COLUMNS / SETTINGS-EMP / DEVICE-RULES).
5. **Not** Face: Face is GĐ2-HOLD disabled; QR panel is operable shell — close as AS-IS PARTIAL, **not** C) GĐ2-HOLD.

### B) FR_NEEDED Phase-1 UC delta — **REJECTED**

Would invent sponsor-grade FR for QR scan protocol / employee QR lifecycle without HDSD/SRS Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + ADD-only discipline on `docs/hrm/SRS.md` (do not overwrite). Inactive GĐ2 candidate kept below only.

### C) SPEC_GAP / GĐ2-HOLD as primary — **REJECTED**

- **GĐ2-HOLD** reserved for Face (#9) and hardware registry depth — QR is not Face.
- Calling the whole seat **SPEC_GAP** alone would reopen CLOCK residual and contradict DEVICE-RULES close on `qr_enabled`. Depth gaps stay **DEFERRED_GĐ2_CANDIDATE** under A.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-QR-01** | Clock-In hub exposes QR method control (`clock-in-method-qrcode` / equivalent) without claiming Face LIVE | Method visible; Face remains HOLD | Hide QR and claim «no QR» while menu shows QR; or promote Face |
| **AC-ATT-QR-02** | Opening QR panel shows scanner + employee QR card shell (`clock-in-panel-qrcode`) — **PARTIAL OK** | Panel renders; no ERROR banner storm | Blank crash / Uncaught on open |
| **AC-ATT-QR-03** | Any successful QR confirm check-in uses **same** Nest path as Manual: `POST /api/hrm/attendance/records` → 2xx + FE toast + F5 record visible (when exercised) | Network POST records; no fake-only toast | Invent dedicated QR API requirement; claim LIVE without POST |
| **AC-ATT-QR-04** | Phase-1 **does not require** BE reject when `qr_enabled=false` on every TXN | Align DEVICE-RULES AC-09 | FAIL seat only because hard-gate missing |
| **AC-ATT-QR-05** | `qr_enabled` persist remains under #36 Rules→Ứng dụng (PATCH/F5) — orthogonal must_keep | Toggle still PATCH rules | Reopen DEVICE-RULES / invent second SoT flag |
| **AC-ATT-QR-06** | CLOCK GWC surfaces #6/#7/#10/#9 **not** reopened by this WI | No invent CLOCK FAIL | Re-run CLOCK as invent FAIL for QR shell |
| **AC-ATT-QR-07** | Matrix #8 stamp = **PARTIAL** ACCEPTED_AS_IS (or optional QA later → LIVE only with browser proof) — **not** Attendance CLOSED | Honest PARTIAL/LIVE-with-evidence | Stamp Attendance CLOSED / `uat_done=true` |
| **AC-ATT-QR-08** | U65: no seed / no API-only green for QR mutate claim | Browser FE if mutate claimed | `pnpm seed:*` or DB fake QR employee to pass |
| **AC-ATT-QR-09** | No new Phase-1 FR file overwrite of `docs/hrm/SRS.md` for QR | Close without SRS wipe | Overwrite SRS or invent sponsor confirm |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P1-10** / matrix #8 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-QR-01..09 · no Dev |
| Matrix #8 runtime | Keep **PARTIAL** (shell · CLOCK-01) | Optional QA browser seat later — not required to close P1-10 |
| UC map | Treat as **HRM-AT-01 alternate method** (UNMAPPED → mapped-by-AT-01) | Optional by-uc TC add = P2 QA design |
| `qr_enabled` CFG | **CLOSED** with DEVICE-RULES | must_keep |
| QR TXN hard-gate / signed QR / logistics gate protocol | **DEFERRED_GĐ2_CANDIDATE** | Align DEVAPP-09 |
| Face LIVE | **GĐ2-HOLD** | Orthogonal — do not absorb |
| CLOCK GWC | **must_keep CLOSED** | Do not reopen |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-QR-GATE-01** | Enforce `qr_enabled` on QR-method check-in; deterministic 4xx when disabled |
| **FR-ATT-QR-TOKEN-01** | Signed / rotating employee QR payload + anti-replay (logistics gate) beyond plain `employee_code` |
| **FR-ATT-QR-MOBILE-01** | Mobile ESS parity for QR clock (if portal-only AS-IS insufficient) |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR or extend HRM-AT-01 CAP method — **preserve** CLOCK GWC AC + DEVICE-RULES AC |
| Happy | NV/bảo vệ mở Clock-In→QR → quét → xác nhận → bản ghi POST 2xx → F5 còn |
| Fail sâu | QR không khớp NV · `qr_enabled=false` · sai scope company → 4xx deterministic |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Verdict A + AC + GĐ2 candidates; no apps/** |
| pm | Intake PASS_TO_PM; stamp matrix/backlog P1-10 CLOSED; **do not** dispatch Dev for QR protocol |
| qa/qc | FAIL only false LIVE claims / crash; do not NO-GO for missing QR hard-gate; do not reopen CLOCK invent FAIL |
| dev-fe / dev-be | **Idle** until sponsor opens FR-ATT-QR-* |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-QR-LIVE-01 | pm / qa | Optional browser seat to promote #8 PARTIAL→LIVE (camera→POST→F5) without new FR? |
| Q-ATT-QR-ENF-01 | Sponsor / sa | Persist-only `qr_enabled` enough for GĐ1, or need FR-ATT-QR-GATE-01? |

No answer required to close P1-10 Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No reopen CLOCK GWC / DEVICE-RULES / WEEKLY / Face HOLD as invent FAIL
- No absorb Face into QR seat

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| M2 backlog **P1-10** | **CLOSED** ACCEPTED_AS_IS_P1 · governance · not ATT CLOSED |
| Matrix #8 | keep **PARTIAL** · note **ACCEPTED_AS_IS_P1** (HRM-AT-01 alternate + `qr_enabled`) · deep gate GĐ2 candidate |
| CLOCK #6/#7/#9/#10 | **must_keep** prior GWC/HOLD — untouched |
| DEVICE-RULES #36 `qr_enabled` | **must_keep** ACCEPTED — untouched |

## completion_report

**Closed:** BA-process governance for Attendance Clock-In **#8 QR** (M2 **P1-10** / residual `R-MFD-M2-CLOCK-QR-DEPTH`). Verdict **A) ACCEPTED_AS_IS_P1**: QR is an alternate method of **HRM-AT-01** using existing `POST /attendance/records` (CLOCK GWC must_keep) plus **`qr_enabled`** CFG already ACCEPTED under DEVICE-RULES #36; honest matrix **PARTIAL** shell OK Phase-1. Measurable **AC-ATT-QR-01..09**. Deep QR hard-gate / signed token = **DEFERRED_GĐ2_CANDIDATE**. **B FR_NEEDED** and **C GĐ2-HOLD-as-primary** rejected. **No Dev opened.** CLOCK / DEVICE-RULES / WEEKLY / Face untouched. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-QR-LIVE-01 / Q-ATT-QR-ENF-01; optional P2 QA browser promote PARTIAL→LIVE — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-QR-CLOCK-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-qr-clock-01-spec.md

Action:
1) Bus INTAKE: close P1-10 / matrix #8 / R-MFD-M2-CLOCK-QR-DEPTH as ACCEPTED_AS_IS_P1 (QR = HRM-AT-01 alternate method + qr_enabled CFG; no Phase-1 FR_NEEDED).
2) Stamp M2 backlog P1-10 CLOSED governance; matrix #8 keep PARTIAL + note ACCEPTED_AS_IS_P1; map UC to HRM-AT-01 alternate (optional).
3) Do NOT dispatch dev-fe/dev-be for QR hard-gate / signed QR / Nest QR API without sponsor opening FR-ATT-QR-GATE-01 (or related).
4) Do NOT reopen CLOCK GWC (#6/#7/#10) or DEVICE-RULES (#36) or Face GĐ2-HOLD (#9). Do NOT invent Attendance CLOSED / uat_done=true.
5) Continue other open M2 seats only (e.g. P1-8 AUTO-CHECKOUT if still open) — QR clock governance seat closed.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-qr-clock-01-spec.md`

## ack_status

**PASS_TO_PM**
