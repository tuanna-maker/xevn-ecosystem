# PO-MFD-M2-ATT-SCANFACE-UNDEFINED-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCANFACE-UNDEFINED-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **ack_status** | **READY_FOR_QA** |
| **uat_done** | `false` |
| **change_mode** | `FIX` |
| **Prior** | `PO-MFD-M1-ATT-QA-RUNTIME` · R-MFD-ATT-SCANFACE-UNDEFINED |
| **Matrix** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` row **#36** |
| **Locks** | U65 zero-seed · CFG wire preserve · Face ID GĐ1 hold |

## Before (QA runtime)

| Item | Detail |
|------|--------|
| Surface | Thiết lập → Quy định → **Chấm công trên ứng dụng** (rules App tab) |
| Error | `ReferenceError: ScanFace is not defined` (×3 in pageErrors) |
| Symptom | Blank/partial body (`bodyLen: 1`) — PARTIAL / P0 crash |
| Evidence | `docs/qa/evidence/po-mfd-m1-att-qa-runtime.md` · `_tmp-po-mfd-m1-att-runtime-smoke-01-browser.json` |
| Root class | Named lucide icon `ScanFace` referenced at Face ID method card; runtime Identifier unbound / export unstable for that surface |

## Fix (dev-fe)

| Change | Detail |
|--------|--------|
| File | `apps/web/hrm/src/pages/Attendance.tsx` only |
| Icon swap | `ScanFace` → **`ScanLine`** (lucide-react `0.462.0` — confirmed export) |
| Import | Removed `ScanFace`; added `ScanLine` |
| Render | `const MethodIcon = method.icon` + `<MethodIcon />` (capitalized binding) |
| CFG wire | **Unchanged** — gps/wifi/qr toggles, Nest `/attendance/rules` save, Face ID still `enabled: false` + GĐ1 banner |
| CODE-MEMORY | APPEND `PO-MFD-M2-ATT-SCANFACE-UNDEFINED-01` |

### Icon swap rationale

- `ScanFace` triggered QA `ReferenceError` on rules App tab despite appearing in the lucide CJS/ESM barrel for `0.462.0`.
- `ScanLine` is a long-stable lucide export (same family as Scan/ScanEye), conveys “scan / face capture” for the Face ID hold card, and avoids the unbound identifier.
- Business CFG (GPS/Wifi/QR flags + work-sites) untouched — Face ID remains GĐ1 hold UI only.

## After (dev verify)

| Check | Result |
|-------|--------|
| Grep `ScanFace` in Attendance.tsx | **0** runtime refs (only CODE-MEMORY text) |
| Grep `ScanLine` | Import + `icon: ScanLine` on faceid method |
| `typeof require('lucide-react').ScanLine` | object (export present) |
| Seed / API mutate | **None** (U65) |

Browser U65 retest = **QA** (`PO-MFD-M2-ATT-SCANFACE-QA-01`).

## Exit criteria map

1. Rules tab «Chấm công trên ứng dụng» renders without ReferenceError → **code ready** (QA confirm)
2. No console Uncaught on that surface → **QA confirm**
3. Evidence md before/after + icon rationale → **this file**
4. Bus READY_FOR_QA → append
5. Handoff packet → below

## Handoff

- **completion_report:** Closed P0 ScanFace ReferenceError on Attendance rules App tab by swapping Face ID icon to `ScanLine` + safe `MethodIcon` bind. CFG/GPS/Wifi/QR/FaceID-hold behavior preserved. Residual: browser U65 confirm; rules tab ambiguity is separate work item.
- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-scanface-undefined-01.md`
- **next_dispatch_prompt:** see bus / packet below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-SCANFACE-QA-01
from_role: pm
to_role: qa
lane: execution

entry_criteria:
- Dev-FE PO-MFD-M2-ATT-SCANFACE-UNDEFINED-01 READY_FOR_QA
- evidence: docs/qa/evidence/po-mfd-m2-att-scanface-undefined-01.md
- L0: pnpm run qc:fe-be-health (or stack already up)
- U65 zero-seed · browser-only

scope:
- Account: ceo@xe.vn / Xevn@2026 · company_id=main
- URL: /hr/attendance (portal embed OK) → Thiết lập → Quy định → tab App / «Chấm công trên ứng dụng»
  Prefer data-testid hdsd-att-rules-tab-app if present (post tab-ambiguity fix)
- Assert: surface renders (GPS/Wifi/QR/Face ID cards); Face ID shows GĐ1 hold / «Chưa hỗ trợ»
- Assert: NO page error ReferenceError ScanFace; NO Uncaught on that surface
- Do NOT mutate CFG / do NOT seed

exit_criteria:
- Matrix #36 stamp update LIVE or PARTIAL-honest (not BROKEN crash)
- Evidence md + PASS_TO_PM
- uat_done: false
```
