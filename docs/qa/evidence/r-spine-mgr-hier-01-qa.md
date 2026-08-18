# R-SPINE-MGR-HIER-01-QA — Option A J-MOB-05 persona retest (device)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **ack_status** | **BLOCKED** |
| **BA SoT** | [`r-spine-mgr-hier-01.md`](r-spine-mgr-hier-01.md) Option A |
| **prior** | [`po-e2e-spine-02-03-mob-qa-w1.md`](po-e2e-spine-02-03-mob-qa-w1.md) (ceo L1 empty) |
| **device** | `emulator-5554` · API 14 · `vn.xevn.hrm.mobile` 1.0.0 |
| **API** | Host `http://127.0.0.1:28001` · Emulator `http://10.0.2.2:28001` |
| **U65** | **honored** — no `pnpm seed:*`, no DB `manager_id` write, no inbox seed |
| **test_log** | [`r-spine-mgr-hier-01-qa-test-log.md`](r-spine-mgr-hier-01-qa-test-log.md) · [`.json`](r-spine-mgr-hier-01-qa-test-log.json) |
| **screens** | `docs/qa/evidence/screens/r-spine-mgr-hier-01-qa/` |

---

## Executive verdict

**🟡 BLOCKED (Option A)** — Cannot run subordinate FE-submit → `uat.nv0001` Duyệt for J-MOB-05 / SPINE-02 LV-01.

Holding company scan: **43** employees, **`manager_id` set on 0 rows**, **direct reports of HLD-0001 = 0**.  
L1 probe: `GET …/leave-requests?status=pending&manager_employee_id=<HLD-0001>&company_id=holding` → **total=0** (unfiltered pending holding **28**).

Per BA §2.3 / §5: **stop Option A → handoff Option B** (product FE path to set `manager_id`). **Cấm seed.** Did **not** use `ceo@xe.vn` as L1. **No UAT DONE claim.**

| AC (BA §7) | Result |
|------------|--------|
| AC-1 Subordinate FE submit leave | ⬜ not run — no discoverable report with `manager_id` = HLD-0001 |
| AC-2 Approver `uat.nv0001` Nghỉ phép ≥1 | ⬜ blocked upstream; API mgr filter total=0 |
| AC-3 Duyệt 2xx | ⬜ not reached |
| AC-4 F5 queue clear | ⬜ not reached |
| AC-5 U65 | 🟢 |

---

## Persona lock (honored)

| Role | Account | Notes |
|------|---------|-------|
| Approver (intended L1) | `uat.nv0001@xe.vn` / `xevn-uat-2026` | HLD-0001 · emp `3796d949-4513-45c0-88fa-33030a062b17` · company UUID `10000000-0000-4000-8000-000000000001` (**not** `main`) |
| Submitter | *(none found)* | Need NV with `employees.manager_id` = HLD-0001 id |
| **Not used** | `ceo@xe.vn` | Explicit cấm for this pair |

---

## Discovery (read-only)

### API — employees.manager_id

| Metric | Value | Evidence |
|--------|-------|----------|
| Holding employees scanned | 43 (cursor pages) | `_reports-probe.json` · `_discovery.json` |
| Rows with non-null `manager_id` | **0** | same |
| Reports of HLD-0001 | **0** | same |
| HLD-0001 own `manager_id` | `null` | same |

### API — ManagerApprovals filter

| Query | Result |
|-------|--------|
| `status=pending&manager_employee_id=<HLD-0001>&company_id=holding` | **total=0** · `_leave-probe-final.json` |
| `status=pending&company_id=holding` (no mgr filter) | **total=28** |

Confirms product filter is live; empty queue is hierarchy/persona, not missing pending leave in company.

### Device — Team directory

1. Deep-link login `uat.nv0001@xe.vn` → **Trang chủ** (`home-uat.nv0001.png`)
2. Tap `home-action-tile-team` → **Đội nhóm** populated (`10-team.png` / `.xml`, ~55KB UI tree)
3. Directory has colleagues — **does not** imply `manager_id` edges (list ≠ hierarchy)

### Device — «approve» tile vs ManagerApprovals

Tap `home-action-tile-approve` on NV home opens **Thông báo** with unread «Đơn nghỉ phép mới» (`72-approvals.png` / `_approve-finish.json`) — **inbox notifications**, not ManagerApprovals tabs `Nghỉ phép (n)`. Matches BA: inbox ≠ L1 approve list. Duyệt on ManagerApprovals not executable without report edge anyway (API total=0).

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | Trang chủ | Yes | Discovery |
| 2 | `home-action-tile-team` / Đội nhóm | Yes | Discovery |
| 3 | `home-action-tile-approve` | Yes → Thông báo | Observed (not ManagerApprovals) |
| 4 | FAB → Tạo đơn nghỉ (subordinate) | N/A | Blocked — no submitter |
| 5 | ManagerApprovals → Duyệt | Not reached | Blocked |

---

## Residuals / PM dispatch

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-SPINE-MGR-HIER-01-BE-FE** | P0 | `dev-be` → `dev-fe` | Option B: ADD `manager_id` create/update DTO+service + UC-H01 picker «Quản lý trực tiếp» → Lưu → F5; then browser set report→HLD-0001; then qa-device J-MOB-05 |
| Compile note (ops) | P1 | `dev-be` / devops | `nest start --watch` currently TS2345 `leave-requests.service.ts:750` — local wave used `pnpm --filter hrm-api start:prod` from dist |

---

## completion_report

**Closed:** Option A discovery executed on device + API under U65. Confirmed **0** direct reports / **0** `manager_id` edges in holding; mgr-filtered pending leave **0**; did not use ceo as L1; did not seed.

**Open:** Product Option B required before J-MOB-05 Duyệt can pass for this persona model.

**ack_status:** BLOCKED  
**next_owner:** `pm` → dispatch `dev-be` (then `dev-fe`) Option B  
**evidence_path:** `docs/qa/evidence/r-spine-mgr-hier-01-qa.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-BE-FE
role: dev-be
priority: P0
parallel_after_be: Task dev-fe
entry: Option A BLOCKED — docs/qa/evidence/r-spine-mgr-hier-01-qa.md · BA docs/qa/evidence/r-spine-mgr-hier-01.md §3
mission: ADD manager_id on Create/Update Employee DTO+service (same company, no cycle, ≠ self); jest; CODE-MEMORY. Then dev-fe: UC-H01 picker «Quản lý trực tiếp» on EmployeeFormDialog → Lưu → F5. Cấm change leave list SQL semantics. Cấm seed.
exit: READY_FOR_QA browser UF-HRM-03 set manager (report → HLD-0001 / uat.nv0001) → then qa-device J-MOB-05 Option A retest.
evidence: docs/qa/evidence/r-spine-mgr-hier-01-be.md · r-spine-mgr-hier-01-fe.md
spec_ref: FR-UC-H01 · FR-UC-H03 · DB_DESIGN_NEW employees.manager_id
also: fix TS2345 leave-requests.service.ts:750 so pnpm run dev:hrm-api watch compiles
```
