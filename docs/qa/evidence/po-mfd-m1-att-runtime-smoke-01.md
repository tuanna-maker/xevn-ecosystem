# PO-MFD-M1-ATT-RUNTIME-SMOKE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-RUNTIME-SMOKE-01` |
| **Program** | U87 · U65 · U76 |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` — menu Attendance **not CLOSED** |
| **Account** | `ceo@xe.vn` / `Xevn@2026` |
| **HDSD path** | Portal `:5173` → `/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |

## L0 stack

| Check | Result | When |
|-------|--------|------|
| `pnpm run qc:fe-be-health` | **PASS** | Start of seat |
| `pnpm run qc:fe-be-health` | **FAIL** (HRM ECONNREFUSED) | After ~38 surface clicks (~2.6 min) |

## Method (U76)

- Playwright headless Chrome: click every top tab + attendance/shifts/requests dropdown item + settings sidebar + rules subtabs.
- Per surface: console errors, `featureInDev` stub copy, spinner/table heuristics, HRM API ≥500.
- **No seed** · primary mutate CTAs mostly **not** clicked (ceo@ holding — defer HP to UC seats / NV persona).

**Script:** `scripts/qa/_tmp-po-mfd-m1-att-runtime-smoke-01.mjs`  
**Raw:** `docs/qa/evidence/_tmp-po-mfd-m1-att-runtime-smoke-01-browser.json`

## Runtime rollup

| Runtime | Surfaces | Notes |
|---------|----------|--------|
| **LIVE** | 24 | Overview, clock-in hub, 4 attendance submenus, 3 shift menus (list OK), 9 request types, leave tab, reports, settings shell, employees, rules shell, rules Chung + Số công chuẩn |
| **STUB_UI** | 7 | Settings sidebar placeholders (OT/leave/late/request/users/roles/system) + rules tablet/proxy/auto (stub copy confirmed) |
| **BROKEN** | 6 | Customize rules tab **settings-catalogs 500**; device/app tabs **500** + device tab **duplicate button** click failure; late stubs tagged BROKEN only due to API down — **corrected to STUB_UI** in runtime log |
| **PARTIAL** | 3 | Shifts schedule/OT (NO_API branch); clock-in/sheets mutate not probed on ceo@ |

### Known P0 workShift loop

**Not reproduced.** `Ca → Danh sách ca` → **LIVE**, no `Maximum update depth`, work-shifts table visible. Aligns with FE fix `PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01`.

## Click paths (sample)

```text
Login (API token inject) → /hr/attendance?portal=1&companyId=main
→ [Tổng quan] KPI cards
→ [Chấm công] primary → clock-in table
→ [Chấm công ▼] → Bảng chấm công | Dữ liệu | Tuần | Tổng hợp
→ [Ca làm việc ▼] → Danh sách ca | Lịch phân ca | Ca làm thêm
→ [Quản lý đơn ▼] → 9 submenu items (LeaveTab / *RequestTab)
→ [Nghỉ phép] · [Báo cáo]
→ [Thiết lập] → sidebar 9 items → Quy định chấm công → rules subtabs
```

## Network highlights (product, HRM up)

| Surface | Method | Path | Status |
|---------|--------|------|--------|
| rules-Tùy-chỉnh | GET | `/api/hrm/settings-catalogs` | **500** |
| rules-device (partial) | GET | `/api/hrm/employees?company_id=main…` | **500** (also seen when HRM dying) |
| rules-device | GET | `/api/hrm/attendance/work-shifts?company_id=main` | **500** (late probe) |

No **409** scope errors on this persona/path during live portion.

## Screenshots

- `docs/qa/evidence/screens/po-mfd-m1-att-runtime-smoke-01/rules-T_y_ch_nh_b_.png` (customize / 500)
- `rules-M_y_ch_m_c_n.png`, `rules-Ch_m_c_ng_tr.png`, stub tabs (env noise)

## Quiz §15.4

1. **≥5 surfaces + runtime:** (a) Tổng quan LIVE (b) Bảng chấm công LIVE (c) Danh sách ca LIVE — loop closed (d) Quy định làm thêm STUB_UI (e) Tùy chỉnh bảng công BROKEN (settings-catalogs 500).
2. **REF vs CFG:** REF = `leave_types` / mã ca (`work-shifts` list); CFG = Số công chuẩn / geofence — cấu hình tại **Thiết lập → Quy định** (+ XBOS catalog publish → HRM pull cho REF).
3. **UNMAPPED examples:** Overview charts (#2–4), QR clock-in (#8), sheets «Thêm bảng» UC gap (#11–12), schedule roster (#17).
4. **Payroll/Leave link P0:** STUB **Quy định nghỉ / làm thêm** → sai hệ số OT & mapping nghỉ; **LeaveTab** LIVE → feeds leave balance / payroll accrual when TXN exists.
5. **First P0 fix:** `R-MFD-ATT-SETTINGS-CATALOG-500` → **dev-be**; then STUB cluster → **dev-fe** + BA CFG rows.

## Residual / not promoted

- Menu **not CLOSED** — 7 STUB_UI + 1 confirmed API BROKEN + PARTIAL schedule/OT branches.
- Re-run rules/device/app on **fresh L0** after HRM restart to separate env crash vs product 500.
- CEO primary CTAs (Tạo đơn, Thêm ca, Thêm bảng) → **PO-MFD-M1-ATT-C* / UC seats** with NV/QL persona (U65).

## Artifacts updated

- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_RUNTIME_LOG.md` (this seat SoT)
- `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` § Browser runtime overlay

---

### completion_report

Closed U87 M1 **browser menu inventory smoke** for Attendance (38 surfaces, runtime stamps, P0 ordering). workShift infinite loop **not** seen; **settings-catalogs 500** and **7 settings STUB_UI** remain. HRM API **down after probe** — late BROKEN counts include env noise.

### next_owner

**pm** → dispatch **PO-MFD-M1-ATT-SYNTH**; **dev-be** for catalog 500; **dev-fe** for STUB cluster + rules tab ambiguity.

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-SYNTH
from_role: pm
to_role: ba-process (synth seat) + dev-be P0 parallel
lane: execution + governance synth

Mission: Merge `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_RUNTIME_LOG.md` into fidelity matrix; dedupe P0 with `HRM-ATTENDANCE_M2_BACKLOG.md`; ordered fix wave.

P0 dev-be first:
work_item_id: R-MFD-ATT-SETTINGS-CATALOG-500
entry: L0 PASS, GET /api/hrm/settings-catalogs?company_id=main from Attendance → Thiết lập → Quy định → Tùy chỉnh
exit: HTTP 200, customize tab LIVE on re-smoke PO-MFD-M1-ATT-RUNTIME-SMOKE-01 row rules-Tùy-chỉnh
evidence: docs/qa/evidence/po-mfd-m1-att-runtime-smoke-01.md

Synth exit: updated matrix runtime column + single M2 backlog ordered list; ack PASS_TO_PM; uat_done false.
```

### evidence_path

`docs/qa/evidence/po-mfd-m1-att-runtime-smoke-01.md`

### ack_status

**PASS_TO_PM**
