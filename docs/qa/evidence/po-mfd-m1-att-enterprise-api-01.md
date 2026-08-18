# Evidence — PO-MFD-M1-ATT-ENTERPRISE-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-ENTERPRISE-API-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **program** | U87 |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` |
| **date** | 2026-08-04 |

## completion_report

**Closed:** Enterprise architecture map Attendance clusters C1–C7 — enterprise value (Payroll/Leave/OT/KPI/WF/XBOS), AS-BUILT Nest API inventory vs `Attendance.tsx` surfaces, NFR notes (scope/idempotency/audit), mindmap IN/PARTIAL/GĐ2 alignment, cross-gap register (mock CFG rules, API_CONTRACT stub, scope parity on leave approve, unwired leave-balance, schedule/OT menu stub).

**Residual (not closed — dispatch M2):** Per-surface button-level inventory (cluster seats C1–C7), browser U65 runtime column, OpenAPI F.1 backfill to `API_CONTRACT_VN`, leave L2 ladder SPEC_GAP (existing program), FaceID GĐ2 waiver text on UI.

**No code · no seed · Phase1 DONE not claimed.**

## Quiz (PO_MENU_FIDELITY_DEPTH_PROGRAM §6 + Training §15.4)

1. **Surface STUB_UI / BROKEN (code-read, pre-browser):**  
   - **C7** settings: sidebar items (employees, overtime, leave-rules, late-early, request-rules, users, roles, system) → «featureInDev»; rules subtabs tablet/proxy/auto; **`useAttendanceRules` in-memory** (CFG lost on refresh).  
   - **C3** shift submenus **schedule** / **overtime** — highlight only, same list (no roster API).  
   - **C2** FaceID clock-in panel — **GĐ2-HOLD** vs mindmap.  
   - **C5** leave **balance** — API exists, FE unwired → **PARTIAL/BROKEN** for enterprise BR.

2. **One REF + one CFG:**  
   - **REF:** `work-shifts` codes/names (`GET/POST /attendance/work-shifts`) — should align XBOS catalog publish/pull long-term.  
   - **CFG:** attendance rules (geofence radius, standard days/month, round in/out) — **should** persist via company settings API; **today** only in FE state (`useAttendanceRules`).

3. **Payroll / Leave / WF links (P0 surfaces):**  
   - Sheets/records (C2) → payroll period columns.  
   - Leave + update-requests (C4/C5) → WF spawn/terminal + payroll exclusion.  
   - OT requests (C4) → payroll coefficients (mindmap GĐ2 tension).  
   - Overview/reports (C1/C6) → KPI/management read models.

4. **UNMAPPED by-uc (examples):** Overview KPI filter; leave-balance wire; settings sidebar bulk; shift schedule/roster; compensatory-summary / leave-plan distinct semantics; FaceID.

5. **P0 fix first + owner:**  
   **BUILD+WIRE attendance-rules API + FE** (C7 CFG — payroll risk) **dev-be then dev-fe**; parallel **WIRE `GET leave-balance`** (dev-fe); **FIX leave/OT approve scope parity** (dev-be, pattern U78 update-requests).

## SA specificity self-check

| Criterion | Score note |
|-----------|------------|
| Cited AS-BUILT controller + FE hooks | Yes |
| Distinguished client stub vs docs/hrm TECHSPEC | Yes |
| Scope parity flagged with work_item U78 contrast | Yes |
| Ordered M2 backlog | See `next_dispatch_prompt` |

## next_owner

**pm** → dispatch M2 execution wave (dev-be / dev-fe / qa) from synth backlog.

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-P0-BACKLOG-01
from_role: pm
to_role: dev-be (then dev-fe, then qa)
lane: execution
program: U87

read_first:
- docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_ENTERPRISE_API_MAP.md §2 cross-gap + §5 P0 order
- docs/hrm/TECHSPEC.md §12.1 · §14.4–14.5
- apps/api/hrm-api/src/attendance/attendance.controller.ts
- apps/web/hrm/src/hooks/useAttendanceRules.ts
- U78 scope fix pattern in update-requests handlers

entry_criteria: SA map PO-MFD-M1-ATT-ENTERPRISE-API-01 PASS_TO_PM; no seed (U65)

P0 order (do not reorder without PM bus note):
1. dev-be PO-MFD-M2-ATT-SCOPE-01 — leave-requests + overtime-requests approve/reject/create: use resolveScopeContext().companyId (parity with update-requests U78); regression hrm-list-scope + leave spec
2. dev-be PO-MFD-M2-ATT-RULES-01 — Nest CRUD attendance_rules (company scoped, audit fields) per Supabase schema / TECHSPEC CFG; no invent columns — SPEC_GAP → STOP and PASS_TO_BA
3. dev-fe PO-MFD-M2-ATT-WIRE-01 — wire useAttendanceRules to new API; wire GET leave-balance on LeaveTab; hide or badge GĐ2-HOLD FaceID + settings sidebars still NOT_BUILT (honest empty)
4. dev-fe PO-MFD-M2-ATT-SHIFTS-02 — verify useWorkShifts loop fix on shifts tab; schedule/OT submenu: disable with GĐ2-HOLD tooltip until roster API
5. qa PO-MFD-M2-ATT-QA-01 — U65 browser: AC-ATT-SHEET sheet create; leave create with balance display; member manager approve without 409; shifts tab no infinite loop; L2.5 J-* attendance embed

exit_criteria: Evidence per item in docs/qa/evidence/po-mfd-m2-att-*.md; ack_status READY_FOR_QA on dev handoffs; QA PASS_TO_PM with UF blocks; no Phase1 DONE claim

cấm: seed · API-only PASS · claim SPEC_GAP as PASS
```
