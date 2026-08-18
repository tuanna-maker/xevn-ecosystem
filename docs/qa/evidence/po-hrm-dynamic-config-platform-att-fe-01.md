# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** Settings panel + API client · **FIX** LeaveTab picker → effective |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |
| **must_keep** | work_shifts ops UI · sheet/sign spine · soft-delete · no FE hardcode LVT_01..04 |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QA L1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md` — L1 PASS · browser HOLD |
| SA vertical | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §5 **AC-PLT-ATT-01..02** · §3 F-ATT-CAT-LVT/EFF |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md` — routes leave-types* live |
| Pattern neo | `MergeTokenSettingsPanel` · Settings open-catalog |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/attLeaveTypeCatalog.ts` | Format-only key · category labels · picker map |
| `apps/web/hrm/src/lib/attLeaveTypeCatalog.test.ts` | Open-catalog format tests (**5 PASS**) |
| `apps/web/hrm/src/hooks/useAttLeaveTypesEffective.ts` | RQ GET `/attendance/leave-types/effective` |
| `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx` | CRUD + retire Settings/ATT CFG |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab **Loại phép ATT** (`settings-tab-att-leave-types`) |
| `apps/web/hrm/src/pages/Attendance.tsx` | Sidebar **leave-rules** → same panel (not CFG stub) |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Form picker binds **effective** catalog |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-ATT-CAT-LVT/EFF client |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-LEAVE-TYPE-UNKNOWN` · LVT-404 friendly |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids for leave-type Settings |

**Cấm / not done:** seed · rewrite work_shifts/sheet/sign · claim attendance UAT · closed LVT enum on FE.

---

## 3. Routes / click path (QA — AC-PLT-ATT-01..02)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU scope `holding` / portal `main` |
| 1a | **Settings** → tab **Loại phép ATT** (`settings-tab-att-leave-types`) **hoặc** |
| 1b | **Chấm công** → Cài đặt → **Quy tắc nghỉ phép** (`att-cfg-leave-rules-precision`) |
| 2 | Card `settings-att-leave-types` — nhập `leaveTypeKey` (vd. `hr_custom_09`) · **Nhãn tiếng Việt** · nhóm |
| 3 | Bấm **Tạo loại phép** (`hdsd-att-leave-type-save`) → Network **PUT/POST** `/api/hrm/attendance/leave-types` **2xx** |
| 4 | **Tải lại (F5 list)** / F5 trang → row trong `settings-att-leave-types-table` |
| 5 | **Nghỉ phép** → Tạo đơn → picker chọn được mã mới (GET `/leave-types/effective`) |
| 6 | **Ngừng** loại phép → active list/picker ẩn; đơn cũ vẫn hiện key / `leave_type_label` |
| 7 | must_keep smoke: work-shifts UI + sheet list/sign vẫn load |

**HDSD inventory (U76):**

- `settings-tab-att-leave-types`
- `settings-att-leave-types` · `settings-att-leave-types-table`
- `hdsd-att-leave-type-key` · `hdsd-att-leave-type-name` · `hdsd-att-leave-type-category`
- `hdsd-att-leave-type-save` · `hdsd-att-leave-type-reload` · `hdsd-att-leave-type-retire-{key}`
- `att-cfg-leave-rules-precision`
- `hdsd-leave-open-att-leave-types` (empty CTA trên form nghỉ)

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/attLeaveTypeCatalog.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 5 passed
```

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** |
| U65 seed in evidence | **none** |
| Module / Phase1 UAT flip | **none** |
| Browser UF | **HOLD for QA** (this seat = wire only) |

---

## 6. completion_report

**Closed:** Wire ATT leave-type Settings panel (F-ATT-CAT-LVT upsert/list/retire) under Settings tab + Attendance leave-rules; LeaveTab create picker binds F-ATT-CAT-EFF (no FE hardcode LVT_01..04); format-only validation; soft-retire hides active list; historical display falls back to key; vitest 5 PASS; must_keep work_shifts/sheet/sign untouched; honesty false.

**Residual:** Browser AC-PLT-ATT-01..02 U65 (create→F5→form pick · retire hide); AC-PLT-ATT-03 submit unknown 4xx already L1 API — browser optional.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
priority: P2

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md (§3 click path)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §5 AC-PLT-ATT-01..02
3. docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md (L1 PASS baseline)

## task
Browser U65 (zero-seed · FE-only):
- Login ceo@xe.vn → Settings → Loại phép ATT (or Attendance → Quy tắc nghỉ phép)
- Tạo loại phép mã HR (vd. hr_custom_09_*) → Network 2xx → Tải lại/F5 → row còn
- Nghỉ phép → form picker chọn được mã mới
- Retire → picker ẩn; list đơn cũ vẫn hiện key
- must_keep: work_shifts UI + sheet/sign load; no seed
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-02.md

## exit
PASS_TO_PM · honesty attendance_uat_ready=false until AC browser PASS (still no module UAT flip)
```
