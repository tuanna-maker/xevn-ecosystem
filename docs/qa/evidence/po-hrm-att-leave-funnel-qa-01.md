# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-QA-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` |
| from_role | qa |
| to_role | pm |
| lane | execution · U65 browser-only · zero-seed |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-FE-01` + `BE-01` READY_FOR_QA |
| date | 2026-08-06 |
| portal | `http://127.0.0.1:5173` (5175 down) |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (JWT OU `holding`) |
| stamp | `LVFN-HLYE9L` |
| ack_status | **FAIL_TO_PM** |
| honesty | **`attendance_uat_ready=false`** · **LV-02 WAIVED_P1** (not 🟢) · WAIVE_L2 intact |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed / API invent as UF PASS | **None** (U65) |
| hrm-api | Nest watch live (`start:dev`) after BE-01 |

---

## HDSD inventory (U76)

| # | Control | Observed |
|---|---------|----------|
| 1 | Chấm công → **Nghỉ phép** | 🟢 |
| 2 | **Tạo yêu cầu nghỉ** → Gửi | 🟢 POST **201** `HRM-LEAVE-201` |
| 3 | **Chờ duyệt** → **Duyệt** | 🟡/🔴 — first approve **500** (restart window); later approve **201** without markers |
| 4 | **Bảng chấm công** → `att-sheets-add` | 🟡 BLOCKED this run (CTA not found — nav harness) |
| 5 | Weekly / Bản ghi leave cell | 🔴 no `status=leave` records |
| 6 | LV-02 ladder | ⚪ **WAIVED_P1** — not exercised / not 🟢 |

---

## AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-ATT-LV-SHEET-01** | 🔴 **FAIL** | Create leave FE **201** (`f84947c1-…`, Oct 8–9 VN). Approve path unstable (**500** then API **201**). **GET `/attendance/records?from_date=2026-10-07&to_date=2026-10-10` → 0 leave rows**. Approve echo `materialized_days=[]`. Weekly body «Nghỉ phép» = **tab label false-positive**, not cell marker. |
| **AC-ATT-LV-SHEET-02** | ⬜ **SKIP** | Cancel/reverse not run — no materialized markers to clear after AC-01 FAIL. FE cancel CTA **not wired** (delete stub) — residual P2. |
| **AC-ATT-LV-SHEET-03** | 🔴 **FAIL** | Closed sheet exists U65: `ae71f0b0-…` **closed** Sept (`QA-BP-ATT-SIGN-DRAFT-SUBMIT-01`). Create leave FE **201** overlapping Sept (`fd714424-…`). Approve FE → **201** `HRM-LEAVE-203` + `materialized_days=[]` — **expected 409 `HRM-ATT-SHEET-LOCKED`**. Silent approve (no lock). |
| **J-HRM-06b** | 🟢 **PASS** (narrow) | After open/reload: GET `attendance/records` + `attendance-sheets` in 10s = **0** (≤2). OBS: sheet list CTA blocked → storm window may not have hit weekly records path; still ≤2. |
| **LV-02** | ⚪ **WAIVED_P1** | Explicitly **not** claimed 🟢 |
| Option C FE leave join | 🟡 OBS | `leaveRequestsOnWeekly` counted during leave-tab noise; weekly SoT path not proven leave-free this run |

---

## Root cause (P0 — BE)

**`R-ATT-LEAVE-FUNNEL-DATE-EXPAND`** — `expandLeaveDateRange` in `leave-attendance-funnel.service.ts`:

```ts
const start = String(startDate).slice(0, 10); // Date → "Thu Oct 08" ≠ YYYY-MM-DD
```

pg `RETURNING *` yields `Date` for `start_date`/`end_date`. `String(Date).slice(0,10)` fails `/^\d{4}-\d{2}-\d{2}$/` → **days=[]** →:

1. `materializeApprovedLeave` returns `{ materialized_days: [] }` (no UPSERT)
2. `assertNoLockedSheetOverlap` never sees days → **no 409 LOCKED**
3. AC-01 weekly empty · AC-03 silent approve

Unit tests only cover string `'2026-08-10'` — **miss Date / ISO datetime**.

**spec says / code does:** SPEC F-ATT-LEAVE-FUNNEL-01/03/LOCKED · code no-ops materialize when dates are Date objects.

---

## Must-keep / honesty

| Item | Status |
|------|--------|
| J-HRM-06b storm ≤2/10s | 🟢 this run (0) |
| J-HRM-06c sign | must_keep — **not retested** mutate |
| WAIVE_L2 / LV-02 | **WAIVED_P1** — not reopened |
| AC-ATT-SHEET empty honesty | not violated by QA |
| `attendance_uat_ready` | **false** (cấm claim) |
| Option C | FE evidence claims no leave join — retest after BE fix |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-att-leave-funnel-qa-01.json` |
| Script | `scripts/qa/_tmp-po-hrm-att-leave-funnel-qa-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-hrm-att-leave-funnel-qa-01/` |
| Spec | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` §7 |
| FE evidence | `docs/qa/evidence/po-hrm-att-leave-funnel-fe-01.md` |
| BE evidence | `docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md` |

---

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-ATT-LEAVE-FUNNEL-DATE-EXPAND** | **P0** | **dev-be** | Coerce Date/ISO → `yyyy-MM-dd` in `expandLeaveDateRange`; jest Date + ISO datetime; retest materialize + LOCKED |
| R-ATT-LV-SHEET-01 | P0 | qa retest | After BE fix — weekly cell + F5 + records 2xx ≠1970 |
| R-ATT-LV-SHEET-03 | P0 | qa retest | Closed Sept sheet + approve → 409 LOCKED |
| R-ATT-LV-SHEET-02 | P1 | qa after 01 | Cancel reverse; FE cancel CTA optional (BE POST `/cancel`) |
| R-ATT-SHEET-NAV-CTA | P2 | qa harness | `att-sheets-add` not found this run |
| Module UAT | — | — | stays **false** |

---

## completion_report

U65 browser FUNNEL-QA-01 **FAIL_TO_PM**. L0 PASS. Leave create FE 201 OK. Approve/materialize **does not write leave markers** (`materialized_days=[]`); closed-sheet overlap approve returns **201** instead of **409 HRM-ATT-SHEET-LOCKED**. Root cause **R-ATT-LEAVE-FUNNEL-DATE-EXPAND** (pg `Date` → empty day range). J-HRM-06b storm ≤2 PASS (narrow). LV-02 WAIVED (not 🟢). **`attendance_uat_ready=false`**. AC-02 SKIP. No seed. No commit.

## next_owner

**pm** → **dev-be** `PO-HRM-ATT-LEAVE-FUNNEL-BE-02` (fix expandLeaveDateRange) → qa retest `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` R2

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-BE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-ATT-LEAVE-FUNNEL-QA-01 FAIL_TO_PM · R-ATT-LEAVE-FUNNEL-DATE-EXPAND
change_mode: FIX · preserve_default · code_memory_required: true · APPEND
u65: zero-seed · attendance_uat_ready=false
must_keep: J-HRM-06b · J-HRM-06c · WAIVE_L2 · cấm Option C · cấm AGG invent

read_first:
1. docs/qa/evidence/po-hrm-att-leave-funnel-qa-01.md (root cause)
2. apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts expandLeaveDateRange
3. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4–§5 LOCKED

entry_criteria:
- QA proved approve 201 + materialized_days=[] + records leave=0
- Closed Sept sheet approve 201 instead of 409 HRM-ATT-SHEET-LOCKED

task:
1) FIX expandLeaveDateRange to accept Date | ISO datetime | yyyy-MM-dd (use toISOString/UTC date parts — not String(Date).slice)
2) Jest: Date object input + '2026-10-07T17:00:00.000Z' → non-empty days; LOCKED path still fires with Date leave row
3) Manual/API smoke: approve open-period leave → materialized_days length>0 + GET records status=leave; approve overlap closed sheet → 409 HRM-ATT-SHEET-LOCKED
4) Evidence docs/qa/evidence/po-hrm-att-leave-funnel-be-02.md · READY_FOR_QA

exit: READY_FOR_QA → qa PO-HRM-ATT-LEAVE-FUNNEL-QA-01 R2 (AC-01..03 + 06b)
forbidden: seed · claim attendance_uat_ready · invent ladder N · FE Option C
```

## ack_status

**FAIL_TO_PM**
