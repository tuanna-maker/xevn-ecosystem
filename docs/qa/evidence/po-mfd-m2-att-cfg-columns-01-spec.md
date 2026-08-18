# Evidence — PO-MFD-M2-ATT-CFG-COLUMNS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CFG-COLUMNS-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 (DATA_CLASS close — not Attendance CLOSED) |
| **residual_closed** | `R-MFD-M2-ATT-CFG-COLUMNS-DATA_CLASS` (= DATA_CLASS **P0-3**) |
| **verdict** | **ACCEPTED_AS_IS_P1** — Phase-1 accepts honest **static i18n REF-shaped** sheet-column list (`getAttendanceColumnsData`); **no** Nest/XBOS column catalog API; **no** Dev |
| **sponsor_confirm** | **None invented** — no claim customer signed persistable column CFG / company override |
| **dev_coding** | **Not opened** |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | Overview year GWC · SETTINGS-EMP #31 LIVE GWC · mapping OBS ACCEPTED_AS_IS · PERIOD ACCEPTED_YEAR_ONLY_P1 · WEEKLY-01 untouched (QA DISPATCHED) · rules Chung/Công chuẩn/GPS GWC |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#33** | Rules→**Công chuẩn** `activeRulesTab=standard`. Actions: chỉnh công chuẩn / rounding; **columns = separate**. Runtime **PARTIAL** — rules **GWC**; residual text «columns OPEN». UC **HRM-AT-14**. |
| Fidelity matrix **#34** | Rules→**Tùy chỉnh** `activeRulesTab=customize`. Narrative «Toggle/custom fields · company override». SRS/TechSpec **SPEC_GAP**. Runtime **LIVE** · UC **UNMAPPED** · P2. |
| `HRM-ATTENDANCE_M2_BACKLOG.md` **P1-6** | This WI — governance DATA_CLASS · not ATT CLOSED. |
| `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` §2.3 / **P0-3** | Sheet columns = **REF+CFG** target; impl = i18n list; gap **HARDCODED** — 10 rows; Add / GripVertical non-functional; consumer Payroll import/export. |
| `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` | Columns table = **`getAttendanceColumnsData` i18n static**, **not** REF catalog pull; settings-catalogs cited as «API without UI» for future REF columns. |
| ADR `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` §6 | Sheet columns (**P0-3**) **explicitly out of** CFG persist ADR — separate backlog. |
| `docs/hrm/SRS.md` FR-HRM-AT-14 / UC-HRM-23 | Phase-1 locked AC = **AC-ATT-SHEET-01..06** (tạo bảng kỳ + Công chuẩn → list → lưới/empty · no storm · F5). **No** FR Diễn biến for Rules→Tùy chỉnh column catalog CRUD, persist, reorder, or company override. |
| HDSD (`HDSD*.md` grep) | **No** step «Chấm công → Cài đặt → Quy tắc → Tùy chỉnh cột bảng công». |
| `docs/qa/professional/by-uc/HRM-AT-14.md` | CAP-05: **FN-COL-LIST** HP = view ≥1 vi-VN label; **FN-COL-MUTATE** FD = **BLOCKED** GripVertical; `api_contract` Columns = **NO_API**; BR-AT14-CFG-04 hardcoded; `uat_done: false`. |
| FE `Attendance.tsx` | `getAttendanceColumnsData(t)` returns **fixed 10** `{id:'1'..'10', name/description: t('attendance.columns.*'), hasAdvanced}` — ids are ordinal strings, **not** stable `column_key` from catalog API. `renderCustomizeTabContent`: Reset / Preview / Add / GripVertical / Advanced **no persist handlers** (unwired CTAs). |
| FE i18n `vi.json` `attendance.columns.*` | Labels present (e.g. «Công ngày lễ», «Làm thêm giờ hưởng lương», …) — client dictionary, not XBOS/HRM settings-catalog. |
| BE `hrm-api` grep | **No** attendance sheet-column catalog endpoint / DTO / settings-catalogs key (`attendance_columns` / `holidayWork` catalog). Rules API GWC covers **Công chuẩn** fields only — not column metadata. |

## As-is vs to-be (Phase-1 / M2 #33–34 columns slice)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| Công chuẩn rules (`#33` rules slice) | Nest `GET/PATCH …/attendance/rules` GWC | **must_keep** — out of this seat |
| Column list UI (`#34`) | Static 10-row i18n table | **Accepted AS-IS** as honest REF-**shaped** display |
| Nest / XBOS column catalog API | None | **Not required** for Phase-1 close of P0-3 |
| Add / reorder / Reset / Preview / Advanced | Visible CTAs, non-functional | **Accepted AS-IS** only with honesty AC (must not claim LIVE mutate) |
| Company override CFG | Narrative only · no API | **Out of Phase-1 required scope** |
| Payroll bind to persisted column CFG | Not implemented | **Deferred GĐ2 candidate** — do not invent FR without sponsor |
| True REF pull (settings-catalogs) | Not wired | **Deferred GĐ2 candidate** |

## SPEC_GAP delta — decision

### Decision (authoritative for Phase-1 / M2 DATA_CLASS P0-3)

**A) ACCEPTED_AS_IS_P1** — close `R-MFD-M2-ATT-CFG-COLUMNS-DATA_CLASS` / DATA_CLASS **P0-3** as governance accept of **static i18n column list** + honesty constraints. **Do not** open Dev. **Do not** invent FR_NEEDED Phase-1.

Rationale (evidence-based, no invent):

1. **SRS Phase-1** for HRM-AT-14 locks **AC-ATT-SHEET-*** only; no confirmed FR/Diễn biến for persistable sheet-column catalog or company override on Rules→Tùy chỉnh.
2. **HDSD** has no operable step requiring column mutate/persist.
3. **ADR CFG persist** already excluded P0-3 from the Nest rules/work-sites wave — opening Dev for column API now without ADD FR = spec-before-code defect.
4. **BE** has **NO_API** for columns; inventing Nest table/DTO without FR = process fail.
5. Matrix **#34 LIVE** already reflects display surface; residual was DATA_CLASS «HARDCODED vs REF» honesty — closable by accepting static REF-shaped list + forbid fake LIVE mutate claims (parallel to SETTINGS-EMP mapping ACCEPTED_AS_IS).
6. **B) FR_NEEDED** rejected for Phase-1: would invent scope (persist/reorder/REF pull) without sponsor confirm and without HDSD/SRS Diễn biến.
7. **C) SPEC_GAP GĐ2 only** as sole label rejected: would leave P0-3 OPEN without Phase-1 AC for the existing LIVE list; mutate/REF-pull remain **DEFERRED_GĐ2_CANDIDATE** under A.

### Phase-1 accepted AC (measurable — Rules→Tùy chỉnh / columns)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-CFG-COL-01** | Rules→**Tùy chỉnh** shows ≥1 column row with **vi-VN** label from i18n (`attendance.columns.*`) | Labels readable VI | Raw missing keys / empty pretend catalog |
| **AC-ATT-CFG-COL-02** | Column set is the **static** FE catalog (`getAttendanceColumnsData` — 10 fixed entries); **no** requirement that Network call Nest/XBOS column catalog | Static list OK | QA FAIL only because no column API 200 |
| **AC-ATT-CFG-COL-03** | UI must **not** claim column Add / reorder / Reset / Preview / Advanced as **LIVE persist** without Nest 2xx + F5 proof | Unwired OK if no false LIVE claim | Toast/success / «đã lưu» without API; invent persist PASS |
| **AC-ATT-CFG-COL-04** | Công chuẩn **rules** persist remains owned by rules GWC (`PATCH …/rules`) — **orthogonal** to column list AS-IS | Rules F5 still works | Regress rules GWC while «fixing» columns |
| **AC-ATT-CFG-COL-05** | Payroll / sheet export may continue without tenant-editable column CFG in Phase-1; must **not** invent client-only column mapping as SoT | Honest static / server sheet contract | Fake per-company column CFG in localStorage claimed LIVE |
| **AC-ATT-CFG-COL-06** | U65: no `pnpm seed:*` / DB fake to invent column catalog rows for PASS | Browser/FE static sufficient | Seed catalog to green P0-3 |

### Residual disposition

| ID | Status | Note |
|----|--------|------|
| `R-MFD-M2-ATT-CFG-COLUMNS-DATA_CLASS` / DATA_CLASS **P0-3** | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-CFG-COL-01..06 · no Dev |
| Matrix #33 «columns OPEN» | **CLOSED** residual text → ACCEPTED_AS_IS_P1 (rules GWC must_keep) | Columns UI lives on #34 |
| Matrix #34 LIVE display | **Keep LIVE** · stamp governance ACCEPTED_AS_IS static REF-shaped | UNMAPPED UC OK Phase-1 |
| Persist / reorder / Add column API | **DEFERRED_GĐ2_CANDIDATE** | Open only after sponsor FR |
| XBOS/HRM settings-catalog REF pull for columns | **DEFERRED_GĐ2_CANDIDATE** | Not Phase-1 |
| Company override CFG | **DEFERRED_GĐ2_CANDIDATE** | Narrative ≠ FR |
| Optional FE honesty polish (disable unwired CTAs) | **Non-blocking P2** | Not required to close DATA_CLASS; PM may later dispatch **dev-fe** only for honesty — **not** this seat |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens this FR. Shape only for backlog readiness.

### Candidate FR (draft ID — inactive)

**FR-ATT-CFG-COL-01 (candidate):** Rules→Tùy chỉnh quản lý catalog cột bảng công (stable `column_key`, nhãn VI, thứ tự, ẩn/hiện, `hasAdvanced`) **persist** theo company scope; optional REF sync từ settings-catalogs; Add/reorder/Reset có API 2xx + F5; cấm static-only pretend LIVE mutate.

### ADD-only Diễn biến pointer (do **not** overwrite `docs/hrm/SRS.md` in this seat)

| Pointer | Note |
|---------|------|
| Host FR | ADD under HRM-AT-14 / new FR-ATT-CFG-COL-01 — **not** wipe AC-ATT-SHEET-01..06 |
| Happy | HCNS mở Tùy chỉnh → sửa thứ tự/ẩn cột → Lưu → Network 2xx → F5 còn |
| Fail sâu | Duplicate `column_key` · empty label · scope company mismatch → 4xx deterministic |
| Success return | List cột + keys; sheet/payroll consumer đọc cùng catalog |
| ba-docs | Only after sponsor opens — ADD 7 mục + Diễn biến ratio |

### Candidate BR / AC (inactive until FR opened)

| BR/AC | Intent |
|-------|--------|
| BR-ATT-CFG-COL-01 | `column_key` stable unique per company (or tenant REF) |
| BR-ATT-CFG-COL-02 | Hide column → sheet grid / export omit (or documented empty) |
| AC-ATT-CFG-COL-MAP-01 | Lưu → PATCH/PUT 2xx → F5 order/visibility persist |
| AC-ATT-CFG-COL-MAP-02 | Payroll/import consumer reads same keys — no FE-only SoT |

### Handoff if sponsor opens FR later

1. **ba-docs / ba-process** — ADD FR + Diễn biến (SRS delta) — preserve AC-ATT-SHEET / rules GWC.
2. **sa** — TechSpec + DB_DESIGN + API_DESIGN (mục đích · bước SRS) — extend beyond ADR D2/D3.
3. **dev-be** then **dev-fe** — only after confirm (**dev-be first** if FR_NEEDED).
4. **qa** — U65 AC-ATT-CFG-COL-MAP-* · must_keep rules GWC + #31 + sheets.

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Close DATA_CLASS P0-3 with ACCEPTED_AS_IS_P1 + deferred candidate |
| pm | Intake PASS_TO_PM; stamp matrix/backlog; **do not** dispatch Dev for column API |
| qa/qc | #34 list OK on AC-ATT-CFG-COL-01..02; do **not** NO-GO for missing column API; FAIL only false LIVE mutate |
| ba-docs / sa / dev | **Idle** until sponsor opens FR-ATT-CFG-COL-01 |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-COL-REF-01 | Sponsor / ba-data | Need XBOS catalog publish for sheet columns vs keep FE i18n dictionary? |
| Q-ATT-COL-PAY-01 | Sponsor / ba-process | Must payroll GĐ1 require tenant-editable column set, or fixed enterprise set enough? |

No answer required to close this DATA_CLASS residual for Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No touch WEEKLY-01 QA seat
- No reopen Overview / SETTINGS-EMP / rules GWC / RECORDS / REQUESTS / REPORTS

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| DATA_CLASS **P0-3** | **CLOSED — ACCEPTED_AS_IS_P1** (this evidence) |
| M2 backlog **P1-6** | **CLOSED** governance · not ATT CLOSED |
| Matrix #33 residual | rules **GWC** · columns **ACCEPTED_AS_IS_P1** (was OPEN) |
| Matrix #34 | keep **LIVE** · note static REF-shaped ACCEPTED_AS_IS · mutate GĐ2 candidate |

## completion_report

**Closed:** Governance DATA_CLASS gap for Attendance Settings sheet columns (matrix **#33–34** / P0-3 / P1-6). Verdict **ACCEPTED_AS_IS_P1**: Phase-1 accepts honest static i18n list via `getAttendanceColumnsData` (10 rows, vi-VN labels); Nest/XBOS column catalog and persist/reorder/company-override are **not** Phase-1 required FR. Measurable **AC-ATT-CFG-COL-01..06**. Candidate **FR-ATT-CFG-COL-01** inactive (GĐ2). **No Dev opened.** WEEKLY-01 untouched. must_keep prior GWC tabs. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-COL-REF-01 / Q-ATT-COL-PAY-01; optional P2 FE honesty polish (disable unwired CTAs) — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-CFG-COLUMNS-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-cfg-columns-01-spec.md

Action:
1) Bus INTAKE: close R-MFD-M2-ATT-CFG-COLUMNS-DATA_CLASS / DATA_CLASS P0-3 as ACCEPTED_AS_IS_P1 (static getAttendanceColumnsData REF-shaped OK; no column API required Phase-1).
2) Stamp matrix #33 residual columns ACCEPTED_AS_IS_P1; #34 keep LIVE + note; M2 backlog P1-6 CLOSED governance.
3) Do NOT dispatch Dev (dev-be/dev-fe) for column catalog persist / REF pull / company override without sponsor opening FR-ATT-CFG-COL-01.
4) Do NOT invent Attendance CLOSED / uat_done=true. must_keep Overview / SETTINGS-EMP #31 / rules GWC. Do not touch WEEKLY-01 until QA verdict.
5) Continue M2 open seats only (device-rules / auto-checkout / QR / …) — columns seat closed.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-cfg-columns-01-spec.md`

## ack_status

**PASS_TO_PM**
