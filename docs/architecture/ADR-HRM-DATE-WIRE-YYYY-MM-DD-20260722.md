# ADR — HRM date wire format (`YYYY-MM-DD`) vs UI `dd/MM/yyyy`

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07-22 |
| **Owner** | SA |
| **work_item** | `FID-P0-SA-DATE-01` |
| **Related** | L-DATE · BR-UX-DATE-01/02 · FR-HRM-AT-14 · `CreateAttendanceSheetDto` · XBOS `established_at` |

## 1. Context

Sponsor P0 on `:8088`: attendance sheet create — calendar icon không mở picker; tay nhập `1/1/2026` vs `01/01/2026`; Lưu → invalid. Company detail «Ngày thành lập» trống / khó chọn; MST/email/phone «—».

## 2. Decision

| Layer | Contract |
|-------|----------|
| **UI display / entry** | `dd/MM/yyyy` (datetime `dd/MM/yyyy HH:mm`) — `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` |
| **HTTP / DTO / SQL DATE** | Canonical **`YYYY-MM-DD`** (ISO date, zero-padded). **Không** đổi Nest `@IsDateString()` sang chấp nhận `dd/MM/yyyy`. |
| **Company founded** | SoT DB = XBOS `public.xbos_legal_entity.established_at` (`DATE`). FE label «Ngày thành lập» / field `founded_date` = **projection alias** — map ↔ `establishedAt` / `established_at`. |

**Không** mở contract body chấp nhận locale string trên wire. FE phải pad + convert trước POST/PUT.

## 3. Options considered

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** | FE only: Calendar + `parseViDate → YYYY-MM-DD` pad; keep BE `IsDateString` | **Selected** for ATT P0 |
| **B** | BE accept `dd/MM/yyyy` + ISO | Rejected — dual formats, locale ambiguity, breaks OpenAPI/spec samples |
| **C** | Native `<input type="date">` only | Rejected as sole fix — browser locale UX; icon already fake; still need ISO wire |

## 4. must_keep (FR-HRM-AT-14 / AC-ATT-SHEET)

- Header-only `POST …/attendance-sheets` — **không** bulk `attendance_records`
- AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07
- Wire `start_date` / `end_date` = `YYYY-MM-DD`
- List display kỳ via `formatDisplayDate` → `dd/MM/yyyy`

## 5. Consequences

- **Dev-FE** (`FID-P0-FE-DATE-01`): wire real Popover+Calendar on sheet modal; shared pad parser; validate start≤end client-side before POST.
- **Dev-BE** (optional follow-up): enforce BR-ATT-SHEET-04 start≤end in service; clearer 400 message — **không** relax `IsDateString`.
- **Company P0**: FE bind + extend `listGroupMemberUnits` SELECT (`tax_code`, `established_at`, contact) **or** call legal-entity GET/PUT — full domain `FID-SA-CO-01`.

## 6. Evidence

`docs/qa/evidence/fid-p0-sa-date-01-20260722.md`
