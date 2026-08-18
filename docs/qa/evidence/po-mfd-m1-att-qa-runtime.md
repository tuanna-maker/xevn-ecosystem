# PO-MFD-M1-ATT-QA-RUNTIME — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-QA-RUNTIME` |
| **Prior** | `PO-MFD-M1-ATT-RUNTIME-SMOKE-01` (superseded for matrix stamps) |
| **Program** | U87 · U65 · U76 · Training §15 |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |
| **hdsd_align** | CC → HRM embed → **Chấm công** (`Attendance.tsx`) |

## L0 stack

| When | Check | Result |
|------|-------|--------|
| Entry | `pnpm run qc:fe-be-health` | **PASS** (HRM `:28001`, XBOS, portal proxy) |
| Exit (~2.7 min probe) | `pnpm run qc:fe-be-health` | **PASS** |
| Entry note | `pnpm run qc:dev-stack` | HRM initially down; `dev:hrm-api` / port `:28001` up before probe |

## Method (U65 · U76)

- Playwright headless Chrome — same inventory as `scripts/qa/_tmp-po-mfd-m1-att-runtime-smoke-01.mjs` (38 click surfaces: tabs, attendance/shifts/requests menus, settings sidebar, rules subtabs).
- Per surface: stub copy, spinner/table heuristics, HRM API ≥400 on `/api/hrm/`, `Maximum update depth`, page errors.
- **No seed** · CEO mutate CTAs (Tạo đơn, Thêm ca, Thêm bảng, export) **not** clicked → cluster **PARTIAL** where noted.
- **Raw JSON:** `docs/qa/evidence/_tmp-po-mfd-m1-att-runtime-smoke-01-browser.json` (probe run during this seat; `endedAt` 2026-08-04T05:30:26Z)

## Runtime rollup (38 probes)

| Stamp | Count | Notes |
|-------|------:|-------|
| **LIVE** | 26 | +2 vs prior smoke (Tùy chỉnh bảng công; stable L0) |
| **STUB_UI** | 10 | Settings sidebar placeholders + rules tablet/proxy/auto |
| **BROKEN** | 1 | Rules sub-tab **Máy chấm công** — Playwright strict mode (4 matching buttons) |
| **PARTIAL** | 1 | Rules **Chấm công trên ứng dụng** — `ReferenceError: ScanFace is not defined` |

### workShift loop

**Not reproduced.** `Ca → Danh sách ca` → **LIVE**, no `Maximum update depth`, work-shifts table renders. Monitor if FE fix still shipping.

## P0 BROKEN → Dev (ordered)

| ID | Surface | Symptom | Owner |
|----|---------|---------|-------|
| **R-MFD-ATT-SCANFACE-UNDEFINED** | Matrix #36 · Quy định → Chấm công trên ứng dụng | `ReferenceError: ScanFace is not defined` in `Attendance.tsx` — blank/partial body (`bodyLen: 1`) | **dev-fe** |
| **R-MFD-ATT-RULES-TAB-AMBIGUITY** | Matrix #35 · Quy định → Máy chấm công | Four `button` elements named «Máy chấm công» — automation/user cannot pick rules strip tab | **dev-fe** |

## Closed / downgraded vs prior smoke

| ID | Was | Now |
|----|-----|-----|
| R-MFD-ATT-SETTINGS-CATALOG-500 | BROKEN (500) | **CLOSED** — Tùy chỉnh bảng công **LIVE**, `networkBad: []` |
| R-MFD-ATT-WORKSHIFT-INFINITE-LOOP | open | **CLOSED** on this build |
| R-MFD-ATT-HRM-STABILITY-SETTINGS | env 500 storm | **Not seen** — L0 PASS exit |

## STUB_UI cluster (not BROKEN — honest placeholder)

Settings sidebar: Quy định làm thêm, nghỉ, đi muộn-về sớm, làm đơn, Người dùng, Vai trò, Hệ thống (matrix #40–46). Rules stubs: máy tính bảng, chấm hộ, NV tự động (#37–39). Owner wave: **dev-fe** + **ba-data** per `HRM-ATTENDANCE_M2_BACKLOG.md`.

## PARTIAL (CEO / NO_API — not P0 crash)

- Clock-in mutate methods (#7–10), «Thêm bảng» (#12), Ca lịch/OT branches (#17–18), báo cáo xuất (#30) — menu mounts **LIVE**; HP submit deferred to M2 / NV persona (U65).

## Matrix stamps

- Main table `runtime` column updated for all former **UNKNOWN** rows — see `HRM-ATTENDANCE_FIDELITY_MATRIX.md`.
- Detail table: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_RUNTIME_LOG.md`.

## Training §15 (spot)

1. **Surfaces:** Tổng quan LIVE; Danh sách ca LIVE (loop closed); Tùy chỉnh bảng công LIVE; Máy chấm công tab BROKEN (UX); App rules tab BROKEN (ScanFace).
2. **REF vs CFG:** `work-shifts` / `leave_types` = REF; Số công chuẩn / quy tắc Chung = CFG at Thiết lập → Quy định.
3. **Payroll P0:** STUB **Quy định nghỉ / làm thêm** still blocks OT/leave policy wiring; **ScanFace** blocks mobile policy tab.

## L2.5

Menu-fidelity seat — **J-*** leave list→detail not in scope this work_item; `uat_done false`.

---

### completion_report

Closed **PO-MFD-M1-ATT-QA-RUNTIME**: browser U65 inventory on stable L0; **32 UNKNOWN** matrix rows stamped; P0 list = ScanFace crash + rules tab ambiguity. Catalog 500 and workShift loop **not** reproduced. Residual: STUB cluster + CEO mutate PARTIAL + M2 scope/balance/CFG seats.

### next_owner

**pm** → after **PO-MFD-M1-ATT-SCOPE/BALANCE/CFG** land → **qa** M2; parallel **dev-fe** for P0 BROKEN above.

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true

entry_criteria: dev-fe CLOSED R-MFD-ATT-SCANFACE-UNDEFINED + R-MFD-ATT-RULES-TAB-AMBIGUITY; PO-MFD-M1-ATT-SCOPE/BALANCE/CFG evidence merged; L0 qc:fe-be-health PASS
exit_criteria: M2 backlog rows browser-stamped; HRM-AT-* UC seats per HRM-ATTENDANCE_M2_BACKLOG.md; J-HRM leave/attendance click paths in scope; evidence docs/qa/evidence/po-mfd-m2-att-qa-01.md; P0 BROKEN list empty or owned; ack_status PASS_TO_PM; uat_done false
read_first: docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md · HRM-ATTENDANCE_M2_BACKLOG.md · docs/qa/evidence/po-mfd-m1-att-qa-runtime.md
cấm: seed
```

### evidence_path

`docs/qa/evidence/po-mfd-m1-att-qa-runtime.md`

### ack_status

**PASS_TO_PM**
