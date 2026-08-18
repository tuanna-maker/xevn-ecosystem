# Evidence — PO-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **residual_closed** | `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` |
| **verdict** | **ACCEPTED_AS_IS_P1** — dedicated NV↔attendance-code map + leave-days wire on Settings→Nhân viên is **not** a Phase-1 required FR for matrix **#31 LIVE** |
| **sponsor_confirm** | **None invented** — no claim customer signed attendance_code≠employee_code forever |
| **dev_coding** | **Not opened** |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **prior_product** | SETTINGS-EMP R2 GWC **CLOSED** — #31 LIVE (Refresh+Import) · `po-mfd-m2-att-settings-emp-01-r2-qa.md` · `po-mfd-m2-att-settings-emp-01-r2-qc.md` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix #31 | Actions: tìm; lọc; refresh; import. Business narrative: «Gán mã chấm công / mapping NV ↔ attendance». **SRS** = SPEC_GAP · **TechSpec** = SPEC_GAP. Runtime **LIVE** (list+Refresh+Import) · UC map **UNMAPPED (mapping OBS)**. |
| HDSD client pack | `HDSD_XEVN_CH06_HRM_NHAN_SU` (Nhân sự). **No** dedicated HDSD chapter step «Chấm công → Thiết lập → Nhân viên → gán mã chấm công / map field import». QA R1 already noted same gap. |
| `docs/hrm/SRS.md` §16.3 orphans | **FR-HRM-IM-01** (via TECHSPEC) = spreadsheet **import preview** (Employees host · J-HRM-IM-01). **FR-HRM-IM-02** = Excel ↔ catalog field match (orphan #8). **Neither** FR defines Attendance Settings panel columns «Mã chấm công» / «Số ngày phép» as editable attendance mapping. |
| `docs/hrm/TECHSPEC.md` | FR-HRM-IM-01 → `POST …/spreadsheet/import/preview` `SHEET-200` preview-only. No attendance_code entity / PATCH mapping API. |
| `PROGRAM_JOURNEY_MAP.md` **J-HRM-IM-01** | Import Excel preview on **Employees** host — not Settings→Nhân viên field-map AC. |
| Leave balance SoT | `MOBILE_W7_*` / `GET …/leave-balance` — ESS / leave wizard scope — **not** Settings→Nhân viên panel AC. |
| FE `Attendance.tsx` settings employees | Columns: `employee_code` · full_name · department · **leaveDays = static `—`** · **attendanceCode = `emp.employee_code` alias**. List = `useEmployees` / `GET /api/hrm/employees`. |
| Runtime honesty R2 | `attendance_code_column`: UI shows `employee_code` (no dedicated mapping API). `leave_days_column`: static em-dash. |
| API/DB spot | No `attendance_code` field on employees API path observed for this panel (alias only). |

## As-is vs to-be (Phase-1 / M2 #31)

| Aspect | As-is (post SETTINGS-EMP-01-R2) | Phase-1 to-be (this delta) |
|--------|--------------------------------|----------------------------|
| List source | `GET /api/hrm/employees` REF master | **Accepted** |
| Refresh / Import CTA | Wired LIVE (refetch + EmployeeImportDialog) | **Accepted** — closed by R2 GWC; out of this OBS |
| Column «Mã nhân viên» | `employee_code` | **Accepted** |
| Column «Mã chấm công» | Same value as `employee_code` (label alias) | **Accepted AS-IS** until sponsor opens dedicated FR |
| Column «Số ngày phép» | Static `—` | **Accepted AS-IS** — not leave-balance wire on this panel |
| Dedicated attendance_code persist / edit | Not implemented · no FR | **Out of Phase-1 required scope** |
| Import field map for attendance-only codes | Reuses HRM-IM-01 employee import dialog | **Accepted** as employee-master import entry — **not** attendance mapping FR |
| True NV↔device/badge mapping | Unspecified in SRS/HDSD | **GĐ2 candidate only** if sponsor later opens FR |

## SPEC_GAP delta — decision

### Decision (authoritative for Phase-1 / M2 #31)

**Accepted as-is column honesty.** Closing residual `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` as **ACCEPTED_AS_IS_P1** — governance close, **not** Dev open.

Rationale (evidence-based, no invent):

1. Matrix #31 **LIVE** AC (list + Refresh Network + Import dialog) is already **GWC CLOSED**; mapping was **OBS non-blocking** by QA/QC.
2. Matrix narrative «Gán mã chấm công» is fidelity **intent language**, not a confirmed SRS FR with Diễn biến / AC.
3. HDSD has **no** step requiring distinct attendance code or leave-days bind on this panel.
4. Existing **FR-HRM-IM-01** covers employee spreadsheet **preview** (host Employees / dialog reuse) — **not** Settings panel mapping columns.
5. **FR-HRM-IM-02** (Excel↔catalog) is a separate orphan — must **not** be overloaded to invent attendance Settings mapping Dev work.
6. Opening Dev to invent `attendance_code` persist or leave-balance fan-in on this panel **without** ADD FR = process defect (spec-before-code).

### Phase-1 accepted AC (measurable — Settings→Nhân viên #31)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-SET-EMP-01** | Panel loads employee master list via `GET …/employees` 2xx; idle storm = 0 | Network + rows honest | ERROR banner / invent rows / storm |
| **AC-ATT-SET-EMP-02** | «Lấy lại dữ liệu» → refetch employees 2xx | Wired Network proof | Unwired CTA |
| **AC-ATT-SET-EMP-03** | «Nhập khẩu» → EmployeeImportDialog (HRM-IM-01 entry) visible | Dialog + file input | Unwired / invent commit PASS without exercise |
| **AC-ATT-SET-EMP-04** | Column «Mã chấm công» may equal `employee_code` (alias); UI must **not** claim a separate persisted attendance mapping LIVE | Alias OK · no fake edit persist | UI implies distinct editable attendance_code LIVE without API |
| **AC-ATT-SET-EMP-05** | Column «Số ngày phép» may show `—` when leave-balance is not wired on this panel; must **not** invent numeric leave from client | `—` or future API-bound value | Fake local leave numbers |
| **AC-ATT-SET-EMP-06** | Import preview/commit mutate remains owned by **FR-HRM-IM-01 / IM-02** journeys — not required to close #31 LIVE mapping OBS | Dialog wire sufficient for #31 LIVE | Force invent Settings-only field-map Dev without FR |

### Residual disposition

| ID | Status | Note |
|----|--------|------|
| `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP` | **CLOSED — ACCEPTED_AS_IS_P1** | Not FR_NEEDED for Phase-1 #31 LIVE; AC-ATT-SET-EMP-01..06 |
| `R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED` | **CLOSED** prior R2 | Out of this seat |
| Dedicated attendance_code ≠ employee_code | **DEFERRED_GĐ2_CANDIDATE** | Open only after sponsor FR confirm — § Deferred |
| Leave days on Settings→Nhân viên | **DEFERRED_GĐ2_CANDIDATE** | Prefer leave module / leave-balance SoT — not invent here |
| FR-HRM-IM-02 Excel↔catalog orphan | **Unchanged** | Separate backlog — do **not** fold into this OBS as Dev |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens this FR. Shape only for backlog readiness.

### Candidate FR (draft ID — inactive)

**FR-ATT-SET-EMP-MAP-01 (candidate):** Thiết lập → Nhân viên hỗ trợ mã chấm công **tách** khỏi mã nhân viên (persist + edit + list bind) **và/hoặc** hiển thị số ngày phép từ SoT leave-balance; import field map (nếu có) khớp cột Excel ↔ `attendance_code` / leave — cấm alias giả làm LIVE.

### Candidate BR (inactive until FR opened)

| BR | Condition | Action | Outcome |
|----|-----------|--------|---------|
| BR-ATT-SET-EMP-01 | `attendance_code` omitted / null | Display `—` or fallback policy **explicit in FR** (not silent `employee_code` claim) | Honest empty |
| BR-ATT-SET-EMP-02 | `attendance_code` set unique per company scope | Persist; list/detail show distinct code | Mapping LIVE |
| BR-ATT-SET-EMP-03 | Duplicate attendance_code in company | 4xx deterministic business code | FE error; no silent overwrite |
| BR-ATT-SET-EMP-04 | Leave days column in scope | Read from leave-balance SoT for selected year | Numeric or `—` if no balance row |
| BR-ATT-SET-EMP-05 | Import includes attendance_code column | Preview/commit validates per FR-HRM-IM-* + this FR | Row errors in preview details |
| BR-ATT-SET-EMP-06 | FE shows editable mapping without Nest field | Forbidden | Honesty / disable — fail-closed |

### Candidate AC (inactive)

| ID | Criterion |
|----|-----------|
| AC-ATT-SET-EMP-MAP-01 | Edit mã chấm công → PATCH/POST 2xx → F5 value persists ≠ employee_code when distinct |
| AC-ATT-SET-EMP-MAP-02 | Leave days column matches leave-balance API (or documented empty) |
| AC-ATT-SET-EMP-MAP-03 | Import preview maps Excel attendance column per contract; no client-only invent |

### Handoff if sponsor opens FR later

1. **ba-docs / ba-process** — ADD FR body + Diễn biến (SRS delta) — **not** wipe IM-01/IM-02.
2. **sa** — TechSpec + DB_DESIGN column + API_DESIGN (mục đích · bước SRS).
3. **dev-be / dev-fe** — only after confirm.
4. **qa** — U65 browser AC-ATT-SET-EMP-MAP-* · must_keep #31 Refresh/Import LIVE.

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Close OBS with ACCEPTED_AS_IS_P1 + deferred candidate shape |
| pm | Intake PASS_TO_PM; **do not** dispatch Dev for mapping |
| qa/qc | Keep #31 LIVE on AC-ATT-SET-EMP-01..03; do **not** NO-GO on alias/`—` columns |
| ba-docs | Optional later — only if sponsor opens FR-ATT-SET-EMP-MAP-01 |
| sa / dev | **Idle** on this residual |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-EMP-CODE-01 | Sponsor / ba-docs | Does logistics need badge/device code ≠ `employee_code`? |
| Q-ATT-EMP-LEAVE-01 | Sponsor / ba-process | Should Settings→Nhân viên show leave balance, or keep leave module only? |

No answer required to close this OBS for Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / uat_done
- No overload FR-HRM-IM-01/02 as Settings mapping FR
- No reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK

## completion_report

**Closed:** Governance clarification for OBS `R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP`. Verdict **ACCEPTED_AS_IS_P1**: Settings→Nhân viên (#31) Phase-1 AC = employee master list + Refresh + Import dialog; «Mã chấm công» may alias `employee_code`; «Số ngày phép» may be `—`. Dedicated mapping / leave-days wire = **DEFERRED_GĐ2_CANDIDATE** only after sponsor FR — **not** FR_NEEDED Dev now. Evidence cites SRS/TECHSPEC IM-01/IM-02, HDSD gap, FE/runtime honesty, R2 GWC. **No Dev opened.**

**Open:** Optional sponsor Q-ATT-EMP-CODE-01 / Q-ATT-EMP-LEAVE-01 (non-blocking). Candidate FR-ATT-SET-EMP-MAP-01 inactive.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-SETTINGS-EMP-MAPPING-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-emp-mapping-spec-01.md

Action:
1) Bus INTAKE: close R-MFD-M2-ATT-SETTINGS-EMP-MAPPING-SPEC_GAP as ACCEPTED_AS_IS_P1 (alias employee_code + leave — OK for #31 LIVE).
2) Do NOT dispatch Dev for attendance_code persist / leave-days wire / import field-map on Settings→Nhân viên without sponsor opening FR-ATT-SET-EMP-MAP-01.
3) Keep SETTINGS-EMP #31 LIVE GWC closed (Refresh+Import); uat_done false; NOT Attendance CLOSED.
4) Optional later: ba-docs ADD FR only if sponsor answers Q-ATT-EMP-CODE-01 / Q-ATT-EMP-LEAVE-01 yes.
5) Continue M2 fidelity backlog for remaining open seats only.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-settings-emp-mapping-spec-01.md`

## ack_status

**PASS_TO_PM**
