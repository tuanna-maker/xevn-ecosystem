# Evidence — PO-MFD-M2-ATT-AUTO-CHECKOUT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-AUTO-CHECKOUT-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 (matrix #39 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — honest STUB_UI / GĐ2 badge on Rules→**Tự động** + measurable AC; 10h duration job **not** Phase-1 |
| **sponsor_confirm** | **None invented** — no claim customer signed 10h auto-checkout scheduler for GĐ1 |
| **dev_coding** | **Not opened** (FR_NEEDED Phase-1 rejected) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **must_keep** | WEEKLY-01 GWC (#14/#15) · DEVICE-RULES ACCEPTED_AS_IS_P1 (#35/#36) · CFG-COLUMNS / SETTINGS mapping / Overview year CLOSED AS-IS or GWC · rules Chung/Công chuẩn/GPS GWC · **not** Attendance CLOSED · `uat_done: false` · U65 zero-seed |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#39** | Cài đặt→Quy tắc→**Tự động** · `activeRulesTab=auto` · Actions «—» · Expected: Auto checkout 10h (`SRS_VN`) · Spec: `SRS_VN.md` auto checkout · TechSpec **SPEC_GAP** · API **NO_API** · class **CFG** · Runtime **STUB_UI** · UC **UNMAPPED** · owner dev-be · **P1** |
| M2 backlog **P1-8** | This WI — governance #39 · not ATT CLOSED · was DISPATCHED |
| `SRS_VN.md` §4 HRM | One narrative bullet: «Chấm công với geofence GPS 200m, **tự checkout sau 10h**, chặn GPS giả mạo» — **not** a 7-mục FR / Diễn biến / AC for Rules→Tự động duration policy |
| `docs/hrm/SRS.md` | Phase-1 ATT lock = **AC-ATT-SHEET-01..06** on FR-HRM-AT-14; **no** FR for auto-checkout hours job. **Do not overwrite** this seat |
| ADR `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` D2 | `auto_checkout` boolean on `attendance_rules` (Rules→**Chung**). Explicit: «Policy hours for `auto_checkout` (SRS_VN «10h») — implement **flag persist in P0**; **duration job GĐ2**» |
| DATA_CLASS matrix | `auto_checkout` CFG · configure_path Rules→Chung checkbox · **OK** flag persist · job duration **GĐ2** (ADR D2). Rules→**tablet/proxy/auto** = **MISSING_CFG_UI** «featureInDev» |
| Enterprise API map | auto-checkout **duration job** classified **GĐ2** |
| by-uc `HRM-AT-14.md` | CAP general Save notes persist boolean; **policy duration = SPEC_GAP**; `spec_gap`: auto_checkout duration job GĐ2 |
| FE `Attendance.tsx` | Tab id `auto` ∈ `ATTENDANCE_RULES_TAB_IDS`. Render: when `activeRulesTab` ∉ {general,standard,customize,device,app} → center panel + `t('attPage.featureInDev')` (**STUB**). CODE-MEMORY: tablet/proxy/**auto** remain featureInDev — no fake LIVE CFG |
| FE Rules→**Chung** | Checkbox `#auto-checkout` bound to `rulesForm.auto_checkout` → Save → `PATCH …/attendance/rules` (boolean only — **orthogonal** to #39 tab) |
| BE `attendance-config.service` + DTO | Column/field `auto_checkout` boolean GET/PATCH. **No** Nest cron/scheduler/job that sets `check_out_at` after N hours when flag true (grep attendance module: persist only) |

## As-is vs to-be (Phase-1 / M2 #39)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| Rules→**Tự động** tab (#39) | STUB_UI `featureInDev` · NO_API | **Accepted AS-IS** with honesty AC (STUB / GĐ2 — no false LIVE 10h job) |
| Rules→**Chung** `auto_checkout` boolean | LIVE PATCH persist (M1 CFG GWC) | **Keep** — must_keep; **not** claimed as «10h job works» |
| Duration policy UI (hours = 10) | Absent on #39 | **Not required** Phase-1 |
| Background auto `check_out_at` after 10h | None | **Deferred GĐ2 candidate** — do not invent FR/Dev |
| SRS narrative 10h | Pointer only | Does **not** force Phase-1 FR_NEEDED without sponsor open |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#39** / M2 **P1-8** without opening Dev:

1. **#39** surface is already honest **STUB_UI** (`featureInDev`); matrix **NO_API** matches code (no duration/job endpoint).
2. SRS_VN «10h» is **narrative**, not FR Diễn biến; `docs/hrm/SRS.md` has no Phase-1 AC for the job — inventing FR_NEEDED + Dev = process defect (parallel CFG-COLUMNS / DEVICE-RULES).
3. ADR D2 + DATA_CLASS already split: **boolean persist** (Chung / GWC) vs **duration job GĐ2** — governance must not reopen Chung GWC or invent Attendance CLOSED.
4. Phase-1 AC = honesty on STUB tab + forbid claiming 10h auto-checkout LIVE; optional GĐ2 candidate kept inactive.

### B) FR_NEEDED Phase-1 — **REJECTED**

Would invent sponsor-grade FR + Nest scheduler / hours CFG UI without HDSD/SRS Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + ADR «duration job GĐ2». ADD-only candidate shape below is **inactive**.

### C) SPEC_GAP GĐ2-HOLD only — **REJECTED as sole primary**

Duration job remains **DEFERRED_GĐ2** under A (aligned ADR). Using **C alone** would leave #39 without Phase-1 honesty AC for the STUB surface and would not close P1-8 with measurable pass/fail for QA. Residual GĐ2-HOLD is recorded under A, not as the seat verdict.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-AUTO-01** | Rules→**Tự động** (`activeRulesTab=auto`) shows tab label + **STUB / featureInDev** (or explicit GĐ2) copy — not a fake duration form claiming LIVE | STUB/GĐ2 visible | Live-looking hours form + Save toast without API |
| **AC-ATT-AUTO-02** | #39 **must not** claim «tự checkout sau 10h» / payroll hours auto-filled as **LIVE** without Nest job 2xx evidence + F5 on records | No false LIVE claim | Banner/toast «đã tự checkout 10h» with no job |
| **AC-ATT-AUTO-03** | No Nest **auto-checkout duration / scheduler** API required to close P1-8 Phase-1 | Close without cron endpoint | QA FAIL only because no 10h job 200 |
| **AC-ATT-AUTO-04** | Rules→**Chung** checkbox `auto_checkout` may remain LIVE boolean PATCH (must_keep CFG GWC); **boolean ON ≠** duration job executed | PATCH boolean + F5 OK; no invent job | Claim «10h works» solely because checkbox true |
| **AC-ATT-AUTO-05** | must_keep: WEEKLY #14/#15 GWC · DEVICE-RULES #35–36 AS-IS · CFG-COLUMNS / SETTINGS / Overview · Chung/Standard/GPS GWC — **orthogonal** | No regression | Reopen/regress those seats while «fixing» auto tab |
| **AC-ATT-AUTO-06** | U65: no `pnpm seed:*` / DB fake `check_out_at` to pretend auto job | Browser honesty only | Seed/checkout forge for PASS |
| **AC-ATT-AUTO-07** | Do **not** invent Attendance CLOSED / `uat_done=true` / Phase1 DONE from this seat | Status stays open for ATT program | Close ATT module on STUB accept |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P1-8** / matrix #39 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-AUTO-01..07 · no Dev |
| Matrix #39 runtime | Keep **STUB_UI** · stamp honesty AS-IS + GĐ2 job | UNMAPPED UC OK Phase-1 |
| Boolean `auto_checkout` (Chung) | **Keep LIVE** persist (must_keep) | Orthogonal to #39 |
| 10h duration job + hours CFG UI | **DEFERRED_GĐ2_CANDIDATE** | ADR D2 · open only after sponsor FR |
| Optional FE polish (badge «GĐ2» wording on #39) | **Non-blocking P2** | featureInDev already honest |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-AUTO-CHKOUT-01** | Rules→Tự động (or Chung advanced): cấu hình thời lượng (mặc định 10h từ narrative SRS_VN); khi `auto_checkout=true`, job định kỳ ghi `check_out_at` cho bản ghi còn mở quá ngưỡng; audit + idempotent; scope parity company |
| **BR-ATT-AUTO-01** (draft) | Chỉ áp dụng khi flag true · không đè checkout thủ công đã có · không tạo checkout nếu chưa check-in |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR or extend HRM-AT-14 CAP — **preserve** AC-ATT-SHEET + rules GWC AC |
| Happy | HCNS bật + set giờ → NV check-in quên checkout → sau ngưỡng hệ thống ghi checkout → lưới/payroll giờ khớp |
| Fail sâu | Flag off · đã có checkout · ngoài scope company · job trùng → deterministic no-op / 4xx |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Verdict A + AC + GĐ2 candidate; no apps/** |
| pm | Intake PASS_TO_PM; stamp matrix/backlog P1-8 CLOSED; **do not** dispatch Dev for 10h job |
| qa/qc | #39: FAIL only false LIVE job claims; do not NO-GO for missing scheduler API; Chung boolean remains GWC orthogonal |
| dev-be / dev-fe | **Idle** until sponsor opens FR-ATT-AUTO-CHKOUT-01 |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-AUTO-10H-01 | Sponsor | Need GĐ1 timed auto-checkout at all, or keep narrative + boolean flag only? |
| Q-ATT-AUTO-HOURS-CFG-01 | Sponsor / sa | Fixed 10h vs configurable hours when FR opens |

No answer required to close P1-8 Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No touch WEEKLY / DEVICE-RULES / CFG-COLUMNS / SETTINGS / Overview GWC or AS-IS seats
- No absorb #35–36 device/app into this WI
- No claim Chung checkbox = 10h job LIVE

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| M2 backlog **P1-8** | **CLOSED** ACCEPTED_AS_IS_P1 · governance · not ATT CLOSED |
| Matrix #39 | keep **STUB_UI** · note **ACCEPTED_AS_IS_P1** honesty (featureInDev / GĐ2) · duration job **GĐ2 candidate** · boolean Chung orthogonal LIVE |

## completion_report

**Closed:** BA-process governance for Attendance Rules **#39 Tự động** (M2 **P1-8**). Verdict **A) ACCEPTED_AS_IS_P1**: accept honest STUB_UI `featureInDev` + NO_API; SRS_VN «10h» narrative + ADR D2 already defer duration job to GĐ2; Chung `auto_checkout` boolean LIVE persist remains must_keep and must not be equated to a running 10h job. Measurable **AC-ATT-AUTO-01..07**. Candidate **FR-ATT-AUTO-CHKOUT-01** inactive. **No Dev opened.** WEEKLY / DEVICE-RULES / CFG-COLUMNS / SETTINGS / Overview untouched. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-AUTO-10H-01 / Q-ATT-AUTO-HOURS-CFG-01; optional P2 badge polish — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-AUTO-CHECKOUT-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-auto-checkout-01-spec.md

Action:
1) Bus INTAKE: close P1-8 / matrix #39 as ACCEPTED_AS_IS_P1 per BA evidence.
2) Stamp M2 backlog P1-8 CLOSED governance; matrix #39 keep STUB_UI + honesty AS-IS (featureInDev/GĐ2); duration job = GĐ2 candidate only.
3) Do NOT dispatch dev-be/dev-fe for 10h auto-checkout scheduler / hours CFG without sponsor opening FR-ATT-AUTO-CHKOUT-01.
4) Do NOT invent Attendance CLOSED / uat_done=true. must_keep WEEKLY GWC · DEVICE-RULES AS-IS · CFG-COLUMNS/SETTINGS/Overview · rules Chung/Standard/GPS GWC (boolean auto_checkout on Chung stays LIVE persist — not job).
5) Continue other open M2 seats only (e.g. P1-10 QR-CLOCK governance) — auto-checkout seat closed; no FR_NEEDED Dev wave.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-auto-checkout-01-spec.md`

## ack_status

**PASS_TO_PM**
