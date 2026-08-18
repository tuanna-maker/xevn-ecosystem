# Evidence — PO-HRM-BP-ATT-DEEP-CODE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-DEEP-CODE-01` |
| **role** | explore |
| **date** | 2026-08-04 |
| **ack_status** | `PASS_TO_PM` |

## Artifact

**SoT inventory:** [`docs/qa/professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md`](../professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md)

## Method (read-only)

- Read `HRM_BP_MEETING_UC_GAP_PROGRAM.md` §3 + `HRM-ATTENDANCE_FIDELITY_MATRIX.md` (46 rows)
- Walk `apps/web/hrm/src/pages/Attendance.tsx` (~4.3k LOC) + `components/attendance/**`
- Grep: `activeTab`, `activeSidebarItem`, `activeRulesTab`, `activeShiftType`, `activeAttendanceType`, `featureInDev`, Dialog/AlertDialog/Drawer
- **No** product `apps/**` logic changes

## Counts (pointer)

| Metric | Value |
|--------|------:|
| Total surfaces | 90 |
| Matrix baseline | 46 |
| MISSING candidates | 18 |
| STUB / featureInDev / GĐ2 / no-op | 22 |
| EXTRA DEAD Dialogs | 4 |

## next_owner

`qa` — `PO-HRM-BP-ATT-DEEP-QA-01` (copy-ready prompt in inventory §6)
