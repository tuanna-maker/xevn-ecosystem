# Evidence — PO-HRM-ATT-03d-05b-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-03d-05b-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **uat_done** | **false** |
| **attendance_closed** | **false** (must_keep — not invent CLOSED) |
| **u65_zero_seed** | true — browser FE→API only; no `pnpm seed:*` |
| **hdsd_align** | CC → HRM → Chấm công → Thiết lập → Quy định chấm công → App (GPS) · Nghỉ phép → Tạo yêu cầu nghỉ |
| **must_keep** | Face not required · PROP-03e OUT · U76 HDSD path |
| **commit** | `dc930c5` (runtime) |
| **fe_ref** | `docs/qa/evidence/po-hrm-att-03d-05b-fe-01.md` |
| **be_ref** | `docs/qa/evidence/po-hrm-att-03d-05b-be-01.md` |

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `qc:fe-be-health` (entry) | FAIL initially (stack down) → started hrm-api + xbos (`tsc` dist) + portal `:5173` + HRM vite |
| `qc:fe-be-health` (pre-browser + exit) | **ALL PASS** — hrm/xbos/portal/login/employees/catalog + proxy |
| Seed | **none** |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`

## Browser matrix (U65)

### UF ATT-03d — GPS work-sites

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | Open GPS card (App rules) · list GET 2xx | Click: Thiết lập → Quy định chấm công → `hdsd-att-rules-tab-app` → `att-gps-sites-card` · `GET …/work-sites?company_id=main` **200** | 🟢 |
| 2 | Thêm → Network POST 2xx · FE row | Site `QA-GPS-fivf0o` · `POST …/work-sites` **201** · row visible | 🟢 |
| 3 | Sửa radius → PATCH 2xx · FE | Pencil → radius **200** · `PATCH …/work-sites/{id}` **200** · FE radius 200m | 🟢 |
| 4 | F5 còn data | Reload → App GPS → site + radius 200 still present | 🟢 |
| 5 | Soft Xóa → DELETE 2xx · F5 gone | Trash · `DELETE …/work-sites/{id}` **200** · gone after F5 | 🟢 |

**Click path:** Thiết lập → Quy định chấm công → App → GPS card → Thêm / Pencil / Trash  
**Site id (cleaned):** `860f4116-86a2-4471-a3e8-df71815508fe`

### UF ATT-05b — Leave quỹ panel

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | Tạo đơn → panel quỹ by type | Nghỉ phép → Tạo yêu cầu nghỉ → chọn NV · `leave-balance-panel` + `leave-balance-by-type` | 🟢 |
| 2 | Empty zeros OK | 5 MVP rows (`annual`…`advance`) all **0** Còn lại / Hold — honest zeros | 🟢 |
| 3 | No spinner storm | `GET …/leave-balance/panel` **1× 200** · `leaveBalanceSingle=[]` · storm=false | 🟢 |

**Employee:** Nguyễn Văn QA M3 987275 (`0f6e1369-4170-42e3-ad6b-3d04b3ec2edd`)  
**Network:**
```
GET /api/hrm/attendance/leave-balance/panel?company_id=main&employee_id=0f6e1369-4170-42e3-ad6b-3d04b3ec2edd&year=2026 → 200
```

**OBS (not FAIL):** `leave-balance-projected` not exercised (dates not filled — optional AC).

## Screenshots

| Slot | Path |
|------|------|
| GPS list / CRUD | `docs/qa/evidence/shots/po-hrm-att-03d-gps.png` |
| GPS sequence | `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/01-gps-list.png` … `05-gps-f5-after-edit.png` |
| Leave quỹ panel | `docs/qa/evidence/shots/po-hrm-att-05b-leave-panel.png` |
| Leave dialog | `docs/qa/evidence/screens/po-hrm-att-03d-05b-qa-01/06-leave-panel.png` |

## Machine JSON / repro

- `docs/qa/evidence/_tmp-po-hrm-att-03d-05b-qa-01-browser.json`
- Repro: `node scripts/qa/_tmp-po-hrm-att-03d-05b-qa-01.mjs`

## Console

- `pageErrors=[]` · no HRM 5xx on work-sites / leave-balance

## Residual

| ID | Owner | Note |
|----|-------|------|
| — | — | none blocking |
| OBS-LEAVE-PROJECTED | qa later | optional projected remaining when dates set — not required for this UF PASS |
| OBS-XBOS-DIST | devops | `nest start --watch` + Unicode path can wipe `dist` before emit — start via `tsc -p tsconfig.build.json` then `node dist/main.js` if ECONNREFUSED `:28002` |

## completion_report

**Closed:** U65 browser ATT-03d GPS list/create/edit/F5/delete (work-sites 2xx) + ATT-05b leave create dialog quỹ panel by type (panel GET 200, 5 MVP zeros, no N×GET storm). L0 entry+exit PASS. `uat_done=false`. Attendance **not** CLOSED. Face / PROP-03e untouched.

**Open:** Attendance module UAT not done; projected leave remaining optional; no matrix CLOSED invent.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-03d-05b-QA-01
from_role: pm
to_role: qc (optional narrow) or continue ATT backlog
lane: execution
priority: P0

INTAKE: QA PASS_TO_PM — ATT-03d GPS CRUD+F5 + ATT-05b leave panel zeros / panel GET 200 / no storm.
evidence_path: docs/qa/evidence/po-hrm-att-03d-05b-qa-01.md
uat_done: false · Attendance not CLOSED
must_keep: Face OUT · PROP-03e OUT · U65
Action: Close wave on bus; do NOT invent Attendance CLOSED; dispatch next ATT/PCOMP residual from backlog.
```
