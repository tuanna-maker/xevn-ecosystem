# Evidence — PO-MFD-M2-ATT-REQUESTS-01 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REQUESTS-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **hdsd_align** | Attendance → Quản lý đơn → late-early / OT / trip / update / shift-change |
| **spec_ref** | ATT-C4 · matrix #20–24 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **ack_status** | **FAIL** |
| **uat_done** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **stamp** | `REQ1-EA7F8J` |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Hard reload FE | yes |
| Seed / API invent rows | **None** (U65) |

## Persona / URL

| Role | Account | Password used | JWT OU | URL |
|------|---------|---------------|--------|-----|
| NV | `uat.nv0007@xe.vn` | `xevn-uat-2026` | `trsport` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |

## HDSD inventory (U76) — Quản lý đơn sub-tabs

| # | Surface | HDSD label (menu) | Present |
|---|---------|-------------------|---------|
| — | Shell | **Quản lý đơn** | 🟢 |
| 19 | Leave (OOS reopen) | Đơn xin nghỉ | 🟢 present (LEAVE-WF GWC CLOSED — not retested mutate) |
| **20** | Late/early | Đăng ký đi muộn, về sớm | 🟢 |
| **21** | OT | Đăng ký làm thêm | 🟢 |
| **22** | Trip | Đề nghị đi công tác | 🟢 |
| **23** | Update attendance | Đề nghị cập nhật công | 🟢 |
| **24** | Shift-change | Đề nghị đổi ca | 🟢 |
| — | Leave summary | Bảng tổng hợp nghỉ phép | 🟢 (inventory only) |
| — | Comp summary | Bảng tổng hợp nghỉ bù | 🟢 (inventory only) |
| — | Leave plan | Kế hoạch nghỉ phép | 🟢 (GĐ2 inventory only) |

Menu dump: see browser JSON `hdsd_inventory.menuItems`.

## LIVE tab probes (list GET + storm)

| Surface | Tab | GET 2xx | Idle GET/5s | CTA | Rows / empty | Storm | Runtime stamp |
|--------:|-----|--------:|------------:|-----|--------------|-------|---------------|
| 20 | late-early | 169×200 | **85** | ❌ (spinner) | 0 / no empty copy (stuck load) | **YES** | **PARTIAL** |
| 21 | OT | 1×200 | **0** | 🟢 Thêm đơn tăng ca | 4 rows | no | **LIVE** (spot; prior OT GWC CLOSED) |
| 22 | business-trip | 437×200 | **94** | ❌ | 0 | **YES** | **PARTIAL** |
| 23 | update-attendance | 1×200 | **0** | 🟢 Thêm đề nghị | 12 rows | no | **LIVE** |
| 24 | shift-change | 379×200 | **55** | ❌ | 0 | **YES** | **PARTIAL** |

### OT spot (do not reopen GWC)

- Prior create→approve **GWC CLOSED**: `docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md`
- This seat: list settle + CTA only — **not** invent FAIL on approve path
- Verdict spot: 🟢 LIVE idle

### Mutate U65 (AC #3)

| Attempt | Result |
|---------|--------|
| Prefer late-early create | **NOT REACHED** — CTA never mounts (storm) |
| Trip / shift-change fallback | **NOT REACHED** — same storm class |
| FE after 2xx + F5 | **N/A** |

**AC mutate FAIL** → residual `R-MFD-M2-REQ-MUTATE-CTA`.

## Root cause (code class — same as OT-FE-LOADING)

| Hook | Bug | Mirror fix |
|------|-----|------------|
| `useLateEarlyRequests.ts` | `h()` in `useCallback` deps → fetch identity churn → GET storm | `useOvertimeRequests` FIX `PO-MFD-M2-OT-FE-LOADING-01` |
| `useBusinessTripRequests.ts` | same | same pattern |
| `useShiftChangeRequests.ts` | same | same pattern |

API itself returns **200** on every GET (list healthy) — FE never settles → CTA/`isLoading` stuck.

## Forbidden honesty

- **Not** reopen LEAVE-WF / OT approve / SHEETS as invent FAIL
- **Not** claim Face LIVE / Attendance CLOSED
- **uat_done** remains **false**
- No seed

## Matrix stamp (runtime)

| # | Was (code/synth) | Now (browser REQUESTS-01) |
|---|------------------|---------------------------|
| 20 | LIVE (synth) | **PARTIAL** — GET storm / no CTA |
| 21 | LIVE | **LIVE** — spot confirm idle+CTA |
| 22 | LIVE (synth) | **PARTIAL** — GET storm / no CTA |
| 23 | LIVE | **LIVE** — list+CTA |
| 24 | LIVE (synth) | **PARTIAL** — GET storm / no CTA |

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-requests-01-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-requests-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-requests-01/` |
| OT prior GWC | `docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md` |
| OT loading fix pattern | `docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md` |

## Screens (key)

| File | Shows |
|------|--------|
| `00-requests-menu.png` | HDSD submenu inventory |
| `20-late-early-list.png` | spinner / no CTA |
| `21-overtime-list.png` | LIVE list + CTA |
| `22-business-trip-list.png` | stuck / no CTA |
| `23-update-attendance-list.png` | LIVE list + CTA |
| `24-change-shift-list.png` | stuck / no CTA |

## Residuals (P0 for this seat)

| ID | Owner | Note |
|----|-------|------|
| **R-MFD-M2-REQ-LATE-EARLY-LOADING** | **dev-fe** | #20 GET storm; remove `h` from deps (OT pattern) |
| **R-MFD-M2-REQ-BUSINESS-TRIP-LOADING** | **dev-fe** | #22 same |
| **R-MFD-M2-REQ-CHANGE-SHIFT-LOADING** | **dev-fe** | #24 same |
| **R-MFD-M2-REQ-MUTATE-CTA** | **dev-fe** | Blocked by loading; retest create→2xx→F5 after fix |

## completion_report

**Closed:** U65 browser HDSD inventory for all request sub-tabs (#20–24 present); OT spot LIVE (idle GET 0, CTA); update-attendance LIVE; stamped matrix #20/#22/#24 **PARTIAL** (storm); #21/#23 **LIVE**. L0 entry+exit PASS. No seed. Did not reopen LEAVE/OT approve GWC.

**Open / FAIL:** Late-early + trip + shift-change stuck loading (same `h()` deps class as OT-FE-LOADING). Mutate AC not reachable. Residuals → **dev-fe**. `uat_done=false`. Attendance **not** CLOSED.

## next_owner

**dev-fe**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true
change_mode: FIX
preserve_default: true
entry_criteria: QA FAIL docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md — #20/#22/#24 GET storm; CTA never mounts; same class as PO-MFD-M2-OT-FE-LOADING-01
read_first:
  - docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md
  - docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md
  - apps/web/hrm/src/hooks/useOvertimeRequests.ts (FIXED pattern)
  - apps/web/hrm/src/hooks/useLateEarlyRequests.ts
  - apps/web/hrm/src/hooks/useBusinessTripRequests.ts
  - apps/web/hrm/src/hooks/useShiftChangeRequests.ts
allowed_paths:
  - apps/web/hrm/src/hooks/useLateEarlyRequests.ts
  - apps/web/hrm/src/hooks/useBusinessTripRequests.ts
  - apps/web/hrm/src/hooks/useShiftChangeRequests.ts
  - docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
forbidden_paths:
  - apps/api/**
  - seed scripts
must_keep:
  - create/approve/reject contracts for late-early, trip, shift-change
  - OT hook already fixed — do not regress
  - U65 no seed
exit_criteria:
  - Remove unstable `h()` helper from useCallback deps (use t('hk.*') inline like OT)
  - READY_FOR_QA with evidence path
  - Suggest QA retest: idle GET ≤2/5s + CTA + late-early create 2xx + F5
evidence_path: docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md
ack_status: READY_FOR_QA
solid_convention_ack: true
code_memory_required: true
code_memory_mode: APPEND
```

## ack_status

**FAIL**
