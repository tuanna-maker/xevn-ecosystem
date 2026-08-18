# QA-HRM-G-AT10-02-LEAVE-OVERLAP-01 — FR-HRM-AT-10 Diễn biến #5/#6 (U65)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-G-AT10-02-LEAVE-OVERLAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P1 |
| **executed_at** | 2026-07-21 ~22:04–22:30 ICT |
| **portal** | http://14.225.217.232:8088 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope `companyId=main` |
| **U65** | **PASS** — browser FE only; no seed; no API-only PASS for UF #5; no attendance sheets; no Phase1/PROD claim |
| **covers** | SRS FR-HRM-AT-10 Diễn biến **#5** (overlap) · **#6** (balance — skip if untracked) · TechSpec G-AT10-02 |
| **entry** | DevOps BE `d-do-sync-8088-g-at10-02-01-20260721.md` · DevOps FE `d-do-sync-8088-fe-at10-02-01-20260721.md` · BE `be-hrm-g-at10-02-leave-overlap-01-20260721.md` · FE `fe-hrm-g-at10-02-toast-01-20260721.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

Browser U65 on `:8088`: **Nghỉ phép** → create for **HLD-0006**.

| AC | Result |
|----|--------|
| Non-overlap create | **PASS** — POST **201** `HRM-LEAVE-201`; counters **88→89** / pending **30→31**; F5 **89/31**; success toast VI confirmed on create path |
| Overlap pending range | **PASS** — POST **409** `HRM-LEAVE-VAL-OVERLAP`; toast VI contains **«trùng»**; totals stay **89/31** (no duplicate) |
| Balance over-request | **SKIP (by design)** — HLD-0006 annual has **no tracked balance** on `:8088`; 61-day non-overlap still **201** (BE must_keep untracked) |

---

## L0 / entry

| Check | Result |
|-------|--------|
| Portal `:8088` + HRM leave tab | **PASS** — session `ceo@xe.vn` |
| DevOps BE overlap/balance dist | cited PASS |
| DevOps FE toast sync | cited PASS |
| Seed | **none** |

---

## Click path (U65)

| # | Step | Evidence | Verdict |
|---|------|----------|---------|
| 1 | Login `ceo@xe.vn` | Portal session → HRM attendance | **PASS** |
| 2 | **Nghỉ phép** | `…/hr/attendance?tenantId=xevn&companyId=main` | **PASS** |
| 3 | Baseline | Tổng **88** · Chờ duyệt **30** | **PASS** |
| 4 | **Tạo yêu cầu nghỉ** · HLD-0006 · annual · `05/12/2026`–`06/12/2026` | Form filled · reason marker non-overlap | **PASS** |
| 5 | **Gửi yêu cầu** | POST **201** `HRM-LEAVE-201` · id `a06cdc4e-9c60-41cb-ab99-581c3da7d4e8` | **PASS** |
| 6 | FE after 2xx | Tổng **89** · Chờ duyệt **31** · dialog closed | **PASS** |
| 7 | F5 | Totals remain **89** / **31** | **PASS** |
| 8 | Create overlap `05/12/2026`–`07/12/2026` same employee | POST **409** `HRM-LEAVE-VAL-OVERLAP` · `conflicting_id=a06cdc4e-…` · `conflicting_status=pending` | **PASS** |
| 9 | Toast VI #5 | «Khoảng ngày **trùng** với đơn nghỉ đang chờ duyệt hoặc đã duyệt…» | **PASS** |
| 10 | No duplicate | Totals stay **89** / **31** · dialog remains for correction | **PASS** |
| 11 | Balance probe: same employee · `05/01/2027`–`06/03/2027` · **61** days | POST **201** (not 400) — untracked balance | **SKIP #6** |

### Success toast (create path)

Observed on balance-probe create (same `hk.leave.createSuccess` path):  
`Thành công` + `Đã tạo đơn nghỉ phép` — confirms FE success toast mapping still live (must_keep). First non-overlap toast auto-dismissed before capture; FE counters + F5 already proved create UX.

---

## Network excerpts (no secrets)

```
#1 non-overlap
POST /api/hrm/attendance/leave-requests → 201 HRM-LEAVE-201
  employee_code: HLD-0006
  start_date: 2026-12-05 · end_date: 2026-12-06 · total_days: 2
  reason: QA-HRM-G-AT10-02-LEAVE-OVERLAP-01 non-overlap U65
  data.id: a06cdc4e-9c60-41cb-ab99-581c3da7d4e8 · status: pending

GET  /api/hrm/attendance/leave-requests?company_id=main → 200 · total: 89

#2 overlap
POST /api/hrm/attendance/leave-requests → 409 HRM-LEAVE-VAL-OVERLAP
  start_date: 2026-12-05 · end_date: 2026-12-07 · total_days: 3
  details.conflicting_id: a06cdc4e-9c60-41cb-ab99-581c3da7d4e8
  details.conflicting_status: pending
  toast: Khoảng ngày trùng với đơn nghỉ đang chờ duyệt hoặc đã duyệt…

#3 balance probe (skip evidence)
POST /api/hrm/attendance/leave-requests → 201 HRM-LEAVE-201
  start_date: 2027-01-05 · end_date: 2027-03-06 · total_days: 61
  reason: QA-HRM-G-AT10-02 balance probe over-request U65
  // NOT 400 HRM-LEAVE-VAL-BALANCE → no tracked row/custom_fields for this employee+type+year
```

---

## AC vs exit_criteria

| Exit | Result |
|------|--------|
| Non-overlap POST 201 + list + F5 | **PASS** |
| Success toast VI on create | **PASS** (captured on create path) |
| Overlap → 409 `HRM-LEAVE-VAL-OVERLAP` + toast «trùng» | **PASS** |
| Balance → 400 + toast «số dư» **or** skip with reason | **SKIP** — untracked for HLD-0006 annual; 61d still 201 |
| Evidence path | this file |
| cấm seed / API-only UF / sheets / Phase1-PROD | **respected** |

---

## Residuals

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| G-AT10-02 #6 toast live | info | Cannot assert BALANCE toast without tracked balance data on `:8088` for this persona/employee — BE by design | optional BA/DevOps only if sponsor wants density of `employee_leave_balances` (not seed for UF) |
| Soft stale `setFormData` in LeaveTab | P3 | `onValueChange={(v) => setFormData({ ...formData, startDate: v })}` can drop sibling fields under rapid automation — not a product UF fail this wave | optional FE |
| Extra pending rows from this QA | info | Created ids `a06cdc4e-…` (2d Dec) + `26e383f0-…` (61d Jan–Mar) under HLD-0006 — real FE creates, not seed | — |

---

## completion_report

### Closed
- **QA-HRM-G-AT10-02-LEAVE-OVERLAP-01** browser U65 on `:8088`.
- Diễn biến **#5**: Network **409** `HRM-LEAVE-VAL-OVERLAP` + VI toast **«trùng»**; must_keep non-overlap **201** + list/F5.
- Diễn biến **#6**: **SKIP** with evidence — no tracked leave balance for HLD-0006 annual; over-request still **201**.
- FE toast map for OVERLAP verified live post DevOps FE sync.

### Open
- BALANCE toast FE live path not exercised (environment untracked) — not a FAIL per entry criteria.

### next_owner
`pm`

### ack_status
**PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: QC-HRM-G-AT10-02-LEAVE-OVERLAP-01
from_role: pm
to_role: qc
lane: governance
priority: P1

## Entry
QA PASS_TO_PM: docs/qa/evidence/qa-hrm-g-at10-02-leave-overlap-01-20260721.md
BE: docs/qa/evidence/be-hrm-g-at10-02-leave-overlap-01-20260721.md
FE toast: docs/qa/evidence/fe-hrm-g-at10-02-toast-01-20260721.md
DevOps sync BE+FE: d-do-sync-8088-g-at10-02-01 + d-do-sync-8088-fe-at10-02-01

## Job
1. Audit QA evidence vs FR-HRM-AT-10 #5/#6 / TechSpec G-AT10-02
2. Confirm #5 PASS (409 OVERLAP + VI trùng) and #1 must_keep 201+F5
3. Accept #6 SKIP (untracked balance) OR condition if QC requires tracked-balance persona later
4. GO / GWC / NO-GO — do NOT claim Phase1/PROD
5. Evidence: docs/qa/evidence/qc-hrm-g-at10-02-leave-overlap-01-20260721.md

entry_criteria: QA evidence complete
exit_criteria: QC verdict + residual list
cấm: seed · sheet · expand scope beyond G-AT10-02
```
