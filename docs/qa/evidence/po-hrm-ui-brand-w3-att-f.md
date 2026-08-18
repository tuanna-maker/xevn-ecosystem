# PO-HRM-UI-BRAND-W3-ATT-F — Settings emp · rules · GPS sites · shell remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-F` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **RE-DISPATCH** | stall evidence MISS — **CLOSED** this seat (remaster + verify + evidence write) |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-F · S64–S65, S67–S68, S72–S75, S90 |
| **Prior** | ATT-D-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md` |
| **Coordinate** | Settings files only — no ATT-E charts/QR fight |
| **change_mode** | `UPGRADE` · preserve_default · work-sites CRUD wires kept |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense modal (Dialog title ≥20 bold; CTA primary `#1E40AF`) |
| **Inventory** | S64 settings emp · S65 import modal · S67 rules Chung · S68 Công chuẩn · S72 Thiết bị · S73 Ứng dụng · S74 GPS panel · S75 GPS add/edit modal · S90 AttendanceEntry shell |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice F |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | ATT-03d work-sites CRUD (lat/lng/radius) · rules PATCH Nest · Face GĐ1 honesty banner · EmployeeImport preview/commit · no Nest/seed · no Face LIVE · no Attendance CLOSED · no ATT-E charts |

---

## Paths touched

| Path | Role |
|------|------|
| `apps/web/hrm/src/pages/Attendance.tsx` | S64, S67–S68, S72–S75 + settings sidebar chrome · CODE-MEMORY ATT-F |
| `apps/web/hrm/src/pages/AttendanceEntry.tsx` | S90 shell loading chrome |
| `apps/web/hrm/src/components/employee/EmployeeImportDialog.tsx` | S65 DialogTitle ≥20 (nested from settings) |

**Not touched:** Nest · seed · LeaveTab / OT / charts (ATT-E) · Face LIVE invent · Attendance CLOSED claim · top-tab rainbow (outside settings slice).

---

## Surfaces remastered (9 inventory)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S64 | `Attendance.tsx` settings emp | Title ≥20; refresh CTA `bg-xevn-primary`; table sharp secondary; name link primary (ban blue); `data-testid=att-settings-emp-precision` |
| S65 | `EmployeeImportDialog.tsx` | DialogTitle `text-[20px] font-bold`; icon primary; preview/commit wire kept |
| S67 | rules Chung | Labels secondary; work-day chips primary; Lưu primary; `att-rules-general-precision` |
| S68 | rules Công chuẩn | Radio `accent-xevn-primary`; labels sharp; Lưu primary; `att-rules-standard-precision` |
| S72 | rules Thiết bị | Step badges/FAQ/login card orange→primary; sharp table; `att-rules-device-precision` |
| S73 | rules Ứng dụng | App icon/methods orange→primary; Face GĐ1 honesty kept; `att-rules-app-precision` |
| S74 | GPS work-sites panel | Add CTA xevn-primary; MapPin/edit primary; list wires kept |
| S75 | GPS add/edit Dialog | DialogTitle ≥20; Lưu xevn-primary; lat/lng/radius fields unchanged |
| S90 | `AttendanceEntry.tsx` | Loader orange→primary; label textSecondary |

**Shared settings chrome:** sidebar active `bg-xevn-primary`; rules header + sub-tab underline primary (`att-settings-shell-precision` / `att-settings-rules-precision`).

**OUT / SKIP this seat:**
- W3-ATT-E charts / QR clock
- W3-ATT-G1 customize stub content depth (shared chrome only)
- W3-ATT-G2 CFG redirect / users/roles/system honesty
- Top-nav pill orange for attendance tab (non-settings)
- Face LIVE / Attendance CLOSED / remaster DONE

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| Settings emp refresh → `useEmployees.refetch` | kept |
| Settings import → `EmployeeImportDialog` + spreadsheetScope | kept |
| Rules Chung/Standard Lưu → `saveAttendanceRules` PATCH | kept |
| App toggles GPS/Wifi/QR → `handleSaveAppPolicy` | kept |
| GPS add/edit/remove → `addGPSLocation` / `updateGPSLocation` / `removeGPSLocation` | kept |
| Face ID GĐ1 banner + disabled toggle | kept |
| Nest / seed | untouched |

---

## Verify (mandatory — pasted)

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. Login `ceo@xe.vn` → HRM → Chấm công → Cài đặt → Nhân viên — primary refresh CTA + sharp table
2. Quy tắc → Chung / Công chuẩn — Lưu primary; work-day chips primary
3. Quy tắc → Thiết bị / Ứng dụng — no orange step chrome; Face honesty banner
4. Ứng dụng → Địa điểm GPS → Thêm — Dialog title ≥20; lat/lng/radius fields present
5. Cold load `/hr/attendance` — entry loader primary (S90)

---

## Residuals

| ID | Note | Owner |
|----|------|-------|
| OBS-empty-gps | Empty GPS list without seed = valid empty (U65) | QA |
| ATT-G1/G2 | Customize + CFG stubs / honesty depth | PM → G1/G2 |
| Top-nav orange pill | Attendance tab color outside ATT-F settings | ATT-E / later shell |

**Forbidden claims:** Attendance CLOSED · remaster DONE · Face LIVE

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w3-att-f.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-F-QA
from_role: pm
to_role: qa
priority: P1

entry: FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-f.md · ATT-D-QA PASS
U65 browser-only; zero-seed
persona: ceo@xe.vn / Xevn@2026
URL: portal → HRM embed → Chấm công → Cài đặt

inventory: S64–S65, S67–S68, S72–S75, S90
AC:
- theme-contrast --strict exit 0
- settings emp + rules Chung/Công chuẩn/Thiết bị/Ứng dụng: no residual orange chrome; CTA primary #1E40AF; titles ≥20 where applicable
- GPS work-sites panel + add/edit Dialog title ≥20; lat/lng/radius fields present; CRUD wires not broken (optional mutate — no seed)
- Face GĐ1 honesty banner still visible; AttendanceEntry loader primary
- Attendance not CLOSED; Face not LIVE
cấm: seed · Nest probe as UF · remaster DONE claim · invent Face LIVE
evidence: docs/qa/evidence/po-hrm-ui-brand-w3-att-f-qa.md
WRITE evidence BEFORE finish
ack_status: PASS_TO_PM
```
