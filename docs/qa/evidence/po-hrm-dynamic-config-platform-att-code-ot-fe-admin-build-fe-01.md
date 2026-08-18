# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01 — FE evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01` |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-09 |
| **Parent** | FE-ADMIN-PACK-SYNTH-SA-01 · U88 · sponsor «cho members làm tiếp» = UNLOCK `R-PLT-ATT-FE-ADMIN-01` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `hrm_attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · **`C-SLICE-≠-MODULE`** · U65 zero-seed |

---

## 1. spec_read_ack

| Layer | Path / cite |
|-------|-------------|
| **srs / Option** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` §5.2 sponsor-gated unlock — Nest att_* admin CRUD FE only |
| **pack taxonomy** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-PACK-SYNTH-SA-01.md` §1.2 **ABSENT twin** · DENY dual-write / LVRULE invent |
| **pattern neo** | `AttLeaveTypeSettingsPanel` · DEC Settings panel · GPS `att-gps-sites-card` / Ca `useWorkShifts` (LIVE twins) |
| **api_design (RETAIN)** | Nest `GET/PUT/POST …/attendance/attendance-codes*` · `…/ot-types*` · `…/ot-comp-types*` · retire — L1 stamps **ATTCODEQA-MSK4T1A5** · **ATTOTQA-MSK8VETU** · **ATTCOMPQA-MSKARXQU** |
| **change_mode** | **ADD** — no new Nest routes · no SoT flip · no dual writer outside sealed catalog paths |
| **must_keep** | Consumer EFF CLOSED (ATTCODEQAFE / ATTOTQAFE / ATTCOMPQAFE) · LVRULE HOLD · honesty false · no seed |

---

## 2. Files changed

| Path | Role |
|------|------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | ADD admin list/upsert/retire clients for attendance-codes · ot-types · ot-comp-types (Nest KEY only) |
| `apps/web/hrm/src/lib/attAttendanceCodeAdminCatalog.ts` (+`.test.ts`) | Format / countsAs / dayWeight helpers |
| `apps/web/hrm/src/lib/attOtTypeAdminCatalog.ts` (+`.test.ts`) | Format / defaultCoeff helpers |
| `apps/web/hrm/src/lib/attOtCompTypeAdminCatalog.ts` (+`.test.ts`) | Format helpers |
| `apps/web/hrm/src/components/settings/AttAttendanceCodeSettingsPanel.tsx` | Admin CRUD panel mã chấm công |
| `apps/web/hrm/src/components/settings/AttOtTypeSettingsPanel.tsx` | Admin CRUD panel loại OT |
| `apps/web/hrm/src/components/settings/AttOtCompTypeSettingsPanel.tsx` | Admin CRUD panel loại chi trả OT |
| `apps/web/hrm/src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts` | Source-gate mount + CRUD wires + Settings/Attendance wiring |
| `apps/web/hrm/src/pages/Settings.tsx` | Tabs `att-attendance-codes` · `att-ot-types` · `att-ot-comp-types` |
| `apps/web/hrm/src/pages/Attendance.tsx` | CFG sidebar `attendance-codes` · `ot-types` · `ot-comp-types` → panels |

**Not touched:** LVRULE engine · Nest routes · consumer EFF hooks/forms (CLOSED RETAIN) · seed scripts.

---

## 3. vitest output

```text
pnpm exec vitest run \
  src/lib/attAttendanceCodeAdminCatalog.test.ts \
  src/lib/attOtTypeAdminCatalog.test.ts \
  src/lib/attOtCompTypeAdminCatalog.test.ts \
  src/components/settings/AttCodeOtFeAdminSettingsPanels.test.ts \
  --reporter=dot

 Test Files  4 passed (4)
      Tests  18 passed (18)
```

Coverage per catalog: format/validate helpers + panel mount testids + list/upsert/retire Nest client wires + Settings/Attendance mount.

---

## 4. U65 browser retest plan (QA)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Entry:** L0 stack · Nest KEY L1 RETAIN · **zero-seed**

### Path A — Settings

1. Login → **Cài đặt** → tab **Mã chấm công ATT** (`?tab=att-attendance-codes`)
2. **Create:** mã `wfh_half` · nhãn · ký hiệu · Lưu → Network **PUT/POST** `/api/hrm/attendance/attendance-codes` **2xx** → row xuất hiện
3. **Edit:** click row → đổi nhãn → Cập nhật → 2xx → FE cập nhật
4. **Retire:** Ngừng → confirm → row biến mất khỏi list active → F5 vẫn retired
5. Repeat tabs **Loại OT ATT** (`att-ot-types`) và **Chi trả OT ATT** (`att-ot-comp-types`) với Nest paths `/ot-types` · `/ot-comp-types`

### Path B — Attendance CFG sidebar

1. **Chấm công** → Cài đặt → sidebar **Mã chấm công** / **Loại tăng ca** / **Loại chi trả OT**
2. Same create → edit → retire → **F5** persist per panel (`att-cfg-*-precision`)

### AC post-mutation FE

- Sau 2xx: toast success · table row update · **F5** còn data (create) / ẩn (retire)
- Consumer pickers (AttendanceRecordsTable / OvertimeRequestTab) invalidate effective after admin mutate (optional spot)
- **DENY:** seed · claim module ATT UAT · flip honesty · invent LVRULE · dual-write Settings MD

---

## 5. completion_report

**Closed:** Sponsor-unlocked ATT FE-ADMIN ABSENT twin — three Nest admin CRUD panels (attendance-code · ot-type · ot-comp-type) mounted on Settings + Attendance CFG; hrmApi admin clients on sealed KEY paths only; vitest **18 PASS**; honesty false · C-SLICE · no new Nest routes · no dual-write · LVRULE untouched · consumer FE CLOSED RETAIN.

**Open / residual:** U65 browser QA (create/edit/retire + F5) per catalog; residual pack may CLOSE after QA/QC — not claimed here.

**next_owner:** **qa**

**ack_status:** **READY_FOR_QA**

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01
from_role: pm
to_role: qa
lane: execution · U65 browser-only · zero-seed
entry_criteria: L0 stack · FE READY_FOR_QA · Nest KEY L1 ATTCODEQA-MSK4T1A5 · ATTOTQA-MSK8VETU · ATTCOMPQA-MSKARXQU RETAIN
scope: login → Settings (or Attendance CFG) → each catalog (mã chấm công / loại OT / loại chi trả OT) create → edit → soft-retire → F5 persist; Network 2xx on sealed Nest paths only
persona: ceo@xe.vn / Xevn@2026
hdsd_align: Settings tabs att-attendance-codes · att-ot-types · att-ot-comp-types · ATT CFG sidebar attendance-codes · ot-types · ot-comp-types
exit_criteria: browser FE sau 2xx + F5 per catalog; honesty false; C-SLICE; no seed; DENY LVRULE / dual-write
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01.md
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md §4
```
