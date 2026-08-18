# QA — HRM leave_types consumer ATT (AC-SET-CONSUMER-LV-ATT-01)

| work_item | QA-HRM-LEAVE-TYPES-CONSUMER-ATT-01 |

## QA retest — ATTLVTCON1-MSNO8B9F (2026-08-10)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-LEAVE-TYPES-CONSUMER-ATT-01` |
| **stamp** | `ATTLVTCON1-MSNO8B9F` |
| **persona** | `ceo@xe.vn` · `company_id=main` · U65 zero-seed |
| **commit** | `dc930c5` |
| **ack_status** | `PASS_TO_PM` |

### L0 / automation

- `pnpm run qc:fe-be-health` → exit **0**
- `VAL-LV-ATT-FE-01` vitest → **2/2** (`po-hrm-leave-types-consumer-att-fe-01.test.ts`)
- GET leave-types/effective → **200** · total **12**

### Browser — AC-SET-CONSUMER-LV-ATT-01 (narrow)

- **Persona / URL:** `ceo@xe.vn` · `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main`
- **Click path (picker):** Chấm công → Nghỉ phép → Tạo yêu cầu nghỉ → Loại nghỉ `catalog-search-picker`
- **Network:** `GET …/attendance/leave-types/effective?company_id=main` → **200** (`HRM-ATT-LVT-200`)
- **FE (picker):** 12 `catalog-picker-option-*` codes = API EFF keys (bad=0) · screenshot `leave-tab-picker.png`
- **FE (Reminders):** `HrmApiReminders` returns null when `pendingLeaves=0` (no «Nhắc việc» pending block) — label parity **not browser-stamped**; wiring locked by **VAL-LV-ATT-FE-01** (`useAttLeaveTypesEffective` / no `leaveTypeOptionsFromCatalog`)
- **Optional U65 mutate:** submit **disabled**; probe `qa-hrm-leave-req-create-fe-slug-01` → `HRM-LEAVE-HOL-MISSING` — **out of slice** (not Reminders SoT regression)
- **F5:** n/a (no mutate 2xx)

### UF AC-SET-CONSUMER-LV-ATT-01 (narrow)

| Check | Verdict | Detail |
|-------|---------|--------|
| LeaveTab picker ⊆ EFF | 🟢 | picker=12 eff=12 bad=0 |
| VAL-LV-ATT-FE-01 | 🟢 | vitest 2/2 · Reminders effective hook |
| ATTLVTSOTQC1 retain | 🟢 | settings att-leave-types shell; no LVT mutate |
| Dashboard ↔ LeaveTab label (live row) | 🟡 carry | 0 pending; widget hidden — retest when pending exists |
| Optional mutate Duyệt | ⚪ | blocked env (HOL-MISSING) |

### must_keep

- `ATTLVTSOTQC1-MSNGQC01` — smoke retain, no LVT catalog mutate
- `settings_catalog_e2e_ready=false` — **DENY** flip
- ≠ UF-HRM-10 full PASS

### artifacts

- JSON: `docs/qa/evidence/_tmp-qa-hrm-leave-types-consumer-att-01.json`
- Screens: `docs/qa/evidence/screens/qa-hrm-leave-types-consumer-att-01/`
