# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-QA-01 R2

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` |
| round | **R2** |
| from_role | qa |
| to_role | pm → **qc** |
| lane | execution · U65 browser-only · zero-seed |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-BE-02` READY_FOR_QA · closed `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` |
| date | 2026-08-06 |
| portal | `http://127.0.0.1:5173` |
| persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (JWT OU `holding`) |
| stamp | `LVFN-HN473F` |
| ack_status | **PASS_TO_PM** |
| honesty | **`attendance_uat_ready=false`** · **LV-02 WAIVED_P1** (not 🟢) · WAIVE_L2 intact · no Option C as SoT |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| BE-02 smoke (prior) | **PASS** — `materialized_days=["2026-12-29"]` · LOCKED **409** · stamp `LVFN-BE02-MSHMQTH5` |
| Seed / API invent as UF PASS | **None** (U65) |
| Forbidden | No Option C FE leave join as SoT · no ladder N · no `attendance_uat_ready` claim · no commit |

---

## HDSD inventory (U76)

| # | Control | Observed |
|---|---------|----------|
| 1 | Chấm công → **Nghỉ phép** | 🟢 |
| 2 | **Tạo yêu cầu nghỉ** → Gửi | 🟢 POST **201** `HRM-LEAVE-201` (`1b776b39-…`, Nov 18–19 VN) |
| 3 | **Chờ duyệt** → **Duyệt** | 🟢 POST **201** `HRM-LEAVE-203` · `materialized_days=["2026-11-18","2026-11-19"]` |
| 4 | **Bảng chấm công** → `att-sheets-add` | 🟡 BLOCKED CTA (same R1 harness) — AC-01 proved via **Bản ghi** leave rows |
| 5 | Bản ghi / records leave cell | 🟢 `status=leave` · dates `yyyy-MM-dd` · F5 còn |
| 6 | LV-02 ladder | ⚪ **WAIVED_P1** — not exercised / not 🟢 |

---

## AC matrix (R2)

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-ATT-LV-SHEET-01** | 🟢 **PASS** | FE create → Duyệt → GET records **200** · **2** leave rows · `attendance_date` `2026-11-18` / `2026-11-19` (≠ weekday `Thu/Sat…`, ≠1970) · `materialized_days.length=2` · F5 leave rows còn · leave cell evidence = records sample (not tab-label false-positive) |
| **AC-ATT-LV-SHEET-02** | ⬜ **SKIP** | FE cancel CTA still stub — residual `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` (P2). Per R2 dispatch: optional; not hard FAIL alone. |
| **AC-ATT-LV-SHEET-03** | 🟢 **PASS** | FE create leave overlap closed Sept (`ada14ef8-…`, 2026-09-12) → Duyệt → **409** `HRM-ATT-SHEET-LOCKED` (not 201 empty). Message: *cannot materialize leave markers for 2026-09-12*. |
| **J-HRM-06b** | 🟢 **PASS** | After reload: GET `attendance/records` + `attendance-sheets` in 10s = **0** (≤2). |
| **LV-02** | ⚪ **WAIVED_P1** | Explicitly **not** claimed 🟢 |
| Option C | 🟡 OBS | `leaveRequestsOnWeekly=2` during leave-tab noise — **OBS** `OBS-OPTION-C-LEAVE-JOIN-GETS`; weekly/records SoT = display-ready leave rows (no join required for PASS) |

---

## Closed vs R1

| Item | R1 | R2 |
|------|----|----|
| `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` | 🔴 P0 root cause | 🟢 **CLOSED** (BE-02) — approve materializes days; LOCKED fires |
| Approve echo `materialized_days` | `[]` | `["2026-11-18","2026-11-19"]` |
| GET records leave | 0 | 2 · `yyyy-MM-dd` |
| AC-03 closed Sept | 201 silent | **409** `HRM-ATT-SHEET-LOCKED` |

---

## Must-keep / honesty

| Item | Status |
|------|--------|
| J-HRM-06b storm ≤2/10s | 🟢 |
| J-HRM-06c sign | must_keep — **not retested** mutate this seat |
| WAIVE_L2 / LV-02 | **WAIVED_P1** — not reopened |
| `attendance_uat_ready` | **false** (cấm claim) |
| Option C as SoT | **cấm** — PASS uses records display-ready fields |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-att-leave-funnel-qa-01-r2.json` |
| Script | `scripts/qa/_tmp-po-hrm-att-leave-funnel-qa-01-r2.mjs` |
| Screens | `docs/qa/evidence/screens/po-hrm-att-leave-funnel-qa-01-r2/` |
| Prior FAIL | `docs/qa/evidence/po-hrm-att-leave-funnel-qa-01.md` |
| BE-02 | `docs/qa/evidence/po-hrm-att-leave-funnel-be-02.md` |
| Spec §7 | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` |

---

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | P2 | **dev-fe** (later) | Cancel/reverse CTA not wired; AC-02 SKIP |
| `OBS-OPTION-C-LEAVE-JOIN-GETS` | OBS | — | leave-requests GET count during session; not SoT for weekly |
| `R-ATT-SHEET-NAV-CTA` | P2 | qa harness | `att-sheets-add` not found — AC-01 via Bản ghi |
| Module UAT | — | — | stays **`attendance_uat_ready=false`** |

---

## completion_report

U65 browser FUNNEL-QA-01 **R2 PASS_TO_PM**. L0 + fe-be-health PASS. BE-02 DATE-EXPAND verified on FE path: create→Duyệt → `materialized_days` length>0 + records `status=leave` `yyyy-MM-dd` + F5; closed Sept overlap approve → **409 HRM-ATT-SHEET-LOCKED**. J-HRM-06b storm ≤2 PASS. LV-02 WAIVED (not 🟢). AC-02 SKIP (FE cancel stub residual). **`attendance_uat_ready=false`**. No seed. No commit.

## next_owner

**qc** — narrow GWC on FUNNEL slice (must_keep 06b / WAIVE_L2 / honesty false)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-ATT-LEAVE-FUNNEL-QA-01 R2 PASS_TO_PM
u65: browser evidence only · zero-seed · attendance_uat_ready=false
must_keep: J-HRM-06b · J-HRM-06c · WAIVE_L2 · LV-02 WAIVED_P1 · cấm Option C · cấm invent ladder N

read_first:
1. docs/qa/evidence/po-hrm-att-leave-funnel-qa-01-r2.md
2. docs/qa/evidence/po-hrm-att-leave-funnel-be-02.md
3. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §7

task:
1) Audit AC-ATT-LV-SHEET-01/03 PASS + J-HRM-06b ≤2 — evidence paths + stamps
2) Confirm R-ATT-LEAVE-FUNNEL-DATE-EXPAND CLOSED; AC-02 SKIP residual P2 only
3) GO WITH CONDITIONS or GO narrow slice — NOT module UAT-ready; LV-02 stays WAIVED
4) Evidence docs/qa/evidence/po-hrm-att-leave-funnel-qc-01.md

exit: PASS_TO_PM with GO|GWC|NO-GO
forbidden: seed · claim attendance_uat_ready · reopen WAIVE_L2
```

## ack_status

**PASS_TO_PM**
