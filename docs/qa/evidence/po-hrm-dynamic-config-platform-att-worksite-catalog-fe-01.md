# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01` |
| **parent** | QA-01 PASS `ATTWSQA-MSJC3IN9` · BE CNS-05 GEO-REQ OK · residual **R-PLT-ATT-WS-FE-CNS-05** |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** — GPS punch POST `check_in_method=gps` (+ lat/lon retained) |
| **honesty** | `attendance_uat_ready=false` · printable/personnel **false** · **`C-SLICE-≠-MODULE`** · U65 · DENY module ATT UAT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QA residual | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-01.md` §6 **R-PLT-ATT-WS-FE-CNS-05** |
| BE CNS-05 | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-be-01.md` — `check_in_method=gps` omit coords → **`HRM-ATT-GEO-REQ`** |
| BA | VAL-ATT-WS-CNS-05 · BR-PLT-ATT-WS-08 (manual/omit method soft-skip RETAIN) |
| DTO | `CreateAttendanceRecordDto.check_in_method?: 'gps' \| 'manual' \| 'qr' \| 'wifi' \| 'face'` |

---

## 2. Deliverable (apps — narrow punch/GPS only)

| Path | Role |
|------|------|
| `apps/web/hrm/src/hooks/useAttendanceRecords.ts` | `AttendanceCheckInMethod` · `CheckInData.check_in_method` · `buildAttendanceCheckInApiPayload` forward · `checkIn` wire · CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` | `checkIn({ …, check_in_method: 'gps' })` + lat/lon · CODE-MEMORY APPEND |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `createAttendanceRecord` payload type + `check_in_method` · CODE-MEMORY APPEND |
| `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` | CNS-05 payload + GPSAttendance source stamp · **12 PASS** |

**Cấm / not done:** seed · `ensureDefaultWorkSite` · flip `attendance_uat_ready` · invent SITE-UNKNOWN · reopen ATT-LEAVE / WAIVE/sign · reopen SI/CTR · Settings worksites rewrite · claim module ATT UAT.

**RETAIN:** Manual / QR / Face omit `check_in_method` (BE soft-skip) · soft empty CTA `att-gps-add-open` · Nest worksites admin path · GEO-001 invent OOS path with lat/lon.

---

## 3. Contract wire (CNS-05)

| Case | FE body | BE expect |
|------|---------|-----------|
| GPS confirm with coords | `check_in_method=gps` + `latitude`/`longitude` | GEO assert → **201** or **400** `HRM-ATT-GEO-001` (OOS) |
| GPS method omit coords (CNS-05) | `check_in_method=gps` without lat/lon | **400** `HRM-ATT-GEO-REQ` when gps_enabled ∧ active sites > 0 |
| Manual / omit method | no `check_in_method` | soft-skip RETAIN (BR-WS-08) — not GEO PASS |

---

## 4. QA spot click path (U65 · zero-seed)

| Step | Action | Assert |
|------|--------|--------|
| 0 | Login `ceo@xe.vn` · `companyId=main` | — |
| 1 | **Chấm công** → Clock-In → method **GPS** | `clock-in-method-gps` · `clock-in-panel-gps` |
| 2 | Confirm check-in with GPS coords | Network **POST** `/api/hrm/attendance/records` body has **`check_in_method":"gps"`** + lat/lon |
| 3 | (optional CNS-05) If coords stripped / invent omit | **400** `HRM-ATT-GEO-REQ` (not silent 201) |
| 4 | Soft empty / CTA | Settings GPS card CTA `att-gps-add-open` still wired · no seed |
| 5 | Honesty | ready=false · seals RETAIN · C-SLICE |

**HDSD:** `clock-in-method-gps` · `clock-in-panel-gps` · `clock-in-gps-open-confirm` · `clock-in-gps-confirm-dialog` · `clock-in-gps-confirm-checkin` · `att-gps-add-open`

---

## 5. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/hooks/useAttendanceRecords.test.ts --reporter=dot
# Test Files  1 passed · Tests  12 passed
```

| Check | Result |
|-------|--------|
| Payload GPS + method + lat/lon | PASS |
| Manual omit method + omit coords | PASS |
| CNS-05 method=gps without coords still forwards method | PASS |
| GPSAttendance source `check_in_method: 'gps'` | PASS |
| ensureDefault / seed | none |
| `attendance_uat_ready` flip | **DENIED** |

---

## 6. Honesty / seals

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** |
| SI type/insurer · CTR · enrollment | **SEAL RETAIN** |
| SITE-UNKNOWN invent | **DENIED** (HOLD) |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed R-PLT-ATT-WS-FE-CNS-05: GPSAttendance POST now sends `check_in_method=gps` with lat/lon via `buildAttendanceCheckInApiPayload` → `createAttendanceRecord`. Manual/QR/Face omit method RETAIN. Soft empty CTA / no ensureDefault untouched. Vitest 12 PASS. Honesty false · seals retain · no SITE-UNKNOWN invent · no ATT UAT claim. |
| **next_owner** | **qa** (spot CNS-05 browser) |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-fe-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01 READY_FOR_QA
residual: R-PLT-ATT-WS-FE-CNS-05 (FE wire)

## entry_criteria
- Read FE: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-fe-01.md
- Prior QA-01 PASS stamp ATTWSQA-MSJC3IN9 · BE CNS-05 GEO-REQ OK
- L0 stack up · U65 zero-seed · browser-only
- Honesty: attendance_uat_ready=false · C-SLICE-≠-MODULE
- RETAIN: ATT-LEAVE · WAIVE/sign/J-06c · SI · CTR · soft empty CTA

## task
Spot CNS-05 FE wire only:
1) Clock-In GPS → confirm → Network POST /attendance/records body includes check_in_method=gps + lat/lon
2) Optional: omit coords with method=gps → 400 HRM-ATT-GEO-REQ (not silent 201)
3) Confirm soft empty CTA att-gps-add-open retained · no seed
4) Honesty false · seals RETAIN · DENY SITE-UNKNOWN invent · DENY module ATT UAT

## cấm
seed · flip attendance_uat_ready · reopen ATT-LEAVE · invent SITE-UNKNOWN · claim module ATT UAT

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-qa-02.md

## exit
PASS_TO_PM or FAIL_TO_PM · next_dispatch_prompt · completion_report · ack_status
```
