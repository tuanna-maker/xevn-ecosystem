# PO-MFD-M2-ATT-SCANFACE-QA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCANFACE-QA-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Prior FE** | `docs/qa/evidence/po-mfd-m2-att-scanface-undefined-01.md` · READY_FOR_QA (`ScanFace` → `ScanLine`) |
| **Prior R1** | Rules-tab ambiguity CLOSED — use `getByTestId('hdsd-att-rules-tab-app')` (label «Ứng dụng di động») |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **hdsd_align** | Attendance → Thiết lập → Quy định → App tab |
| **U65** | zero-seed · browser-only · no CFG mutate |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-scanface-qa-01.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-scanface-qa-01-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-scanface-qa-01/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` (Attendance menu not CLOSED — only ScanFace #36 seat) |

## Click path (U65)

1. Login API → inject portal auth
2. Goto `/hr/attendance?portal=1&…&companyId=main` → **hard reload** (FE ScanLine load)
3. Top tab **Thiết lập**
4. Sidebar **Quy định chấm công**
5. Click `getByTestId('hdsd-att-rules-tab-app')` (label observed: **Ứng dụng di động**)
6. Assert surface — **no** mutate CFG

## Exit criteria results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Thiết lập → Quy định → `hdsd-att-rules-tab-app` | **PASS** (count=1; label «Ứng dụng di động») |
| 2 | No `ReferenceError: ScanFace is not defined` / page errors | **PASS** (`pageErrors=[]`; `consoleErrors=[]`) |
| 3 | Face ID GĐ1 hold visible; GPS/Wifi/QR cards render | **PASS** (`att-faceid-cfg-banner` visible; GPS/Wifi/QR/Face ID method rows) |
| 4 | Matrix #36 stamp | **LIVE** (not BROKEN crash; not PARTIAL-only) |
| 5 | Evidence file | **PASS** (this file) |
| 6 | ack_status | **PASS_TO_PM** |
| 7 | uat_done | **false** |

## Surface observations

| Check | Detail |
|-------|--------|
| Face ID banner | «Face ID — ngoài phạm vi GĐ1» + GĐ1 not-supported copy |
| Face ID CTA | «Chưa hỗ trợ» (disabled hold) |
| GPS | Card + «Đang bật» (not mutated) |
| Wifi | Card + «Đang bật» (not mutated) |
| QR | Card + «Bật» (not clicked) |
| Crash class | Closed — prior `ScanFace is not defined` not reproduced |

## Screenshots

- `screens/po-mfd-m2-att-scanface-qa-01/01-rules-shell.png`
- `screens/po-mfd-m2-att-scanface-qa-01/02-app-tab.png`

## Matrix / runtime stamp

| Artifact | Update |
|----------|--------|
| `HRM-ATTENDANCE_FIDELITY_MATRIX.md` row **#36** | **BROKEN → LIVE** |
| Overlay #36 | LIVE (`PO-MFD-M2-ATT-SCANFACE-QA-01`) |
| `HRM-ATTENDANCE_RUNTIME_LOG.md` `rules-Chấm-trên-app` | **LIVE** |
| Residual `R-MFD-ATT-SCANFACE-UNDEFINED` | **CLOSED** |

## Residuals (not this seat)

| id | Status | Note |
|----|--------|------|
| Attendance full CLOSED / uat_done | Forbidden | `uat_done=false` |
| STUB_UI #37–46 | Open | Out of seat |
| CFG mutate GPS/Wifi/QR | Not executed | U65 · forbidden beyond open tab |

## Handoff

- **completion_report:** Closed **PO-MFD-M2-ATT-SCANFACE-QA-01**. L0 PASS entry+exit; hard-reload browser U65 path Thiết lập → Quy định → `hdsd-att-rules-tab-app`; 0 pageErrors / no ScanFace ReferenceError; Face ID GĐ1 hold + GPS/Wifi/QR cards LIVE. Matrix #36 **LIVE**. Residual STUB cluster out of scope. **uat_done false**.
- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` (optional narrow `qc` if wave gate needs stamp audit)
- **evidence_path:** `docs/qa/evidence/po-mfd-m2-att-scanface-qa-01.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-MFD-M2-ATT-SCANFACE-QA-01-PM-INTAKE
from_role: qa
to_role: pm
lane: governance

entry_criteria:
- QA PASS_TO_PM evidence: docs/qa/evidence/po-mfd-m2-att-scanface-qa-01.md
- Matrix #36 LIVE; R-MFD-ATT-SCANFACE-UNDEFINED CLOSED
- uat_done: false · Attendance menu NOT CLOSED

actions:
1. Bus INTAKE PASS_TO_PM for PO-MFD-M2-ATT-SCANFACE-QA-01
2. Optional narrow QC: audit #36 LIVE stamp + screenshot 02-app-tab (no ScanFace crash) — only if wave gate requires
3. Continue MFD backlog (STUB_UI #37–46 / next P0) — do NOT claim Attendance CLOSED

exit_criteria:
- Bus updated; next MFD work_item DISPATCHED or idle with reason
- cấm invent uat_done / Attendance CLOSED
```
