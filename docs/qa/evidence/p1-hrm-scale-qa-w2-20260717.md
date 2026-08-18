# P1-HRM-SCALE-QA-W2 — Browser acceptance (Satellite pickers capped/typeahead)

- **Date:** 2026-07-17
- **work_item_id:** `P1-HRM-SCALE-QA-W2`
- **Environment:** `http://14.225.217.232:8088` (VPS Dev8088 · portal-fe 8088→5173 · `PORTAL_DEV_URL` Dev8088)
- **Persona:** Group CEO `ceo@xe.vn` / BOD / `companyId=main` / `tenantId=xevn`
- **Deploy refs:** VPS HEAD `5d27676` (`p1-hrm-scale-fe-w2-deploy-20260717.md`); live modules `useEmployeePicker.ts` + insurance typeahead confirmed by DevOps L0
- **Method:** U65 browser-only — BOD session, real clicks, Network counts via iframe `PerformanceResourceTiming` (incl. `responseStatus`). No seed, no API-only PASS (read-only diagnostic probes noted explicitly).
- **spec_ref:** ADR-HRM-SCALE-1000-USERS §5.1–5.2 / §6 W2; `COND-SCALE-W2-PICKER` (qc-p1-hrm-scale-w1); J-HRM-02
- **U65:** zero-seed
- **NOT claimed:** Phase 1 DONE / PROD-READY

## Verdict

**PASS_TO_PM** — all 4 W2 browser exit criteria **PASS**; `COND-SCALE-W2-PICKER` closed on `:8088`.

**One NEW P1 defect found outside W2 picker scope** during cross-nav regression: soft-nav **rời route Chấm công** bị kẹt view (`D-HRM-ATT-NAV-STALL-01`, chi tiết dưới) — không chặn gate W2 picker (J-HRM-02 và employees↔contracts soft-nav vẫn PASS), nhưng PM phải dispatch `dev-fe` cùng phiên.

Recommend **QC Scale W2 gate** (picker scope) + parallel `dev-fe` dispatch cho nav-stall.

---

## Exit criteria matrix

| # | Criteria | Evidence | Verdict |
|---|----------|----------|---------|
| 1 | Insurance Add dialog: ≤1 employees GET `page=1` on open/search; keyword typeahead works; **0** multi-page `listAllEmployees` chain | Open «Thêm bảo hiểm»: **1×** `GET /api/hrm/employees?company_id=main&include_archived=false&page=1&page_size=50` (200). Type `NV0001`: **1×** same +`keyword=NV0001` (200). Dropdown lọc còn 2 kết quả (`Nguyễn Văn An - HLD-0001`, `Nguyen NhanSu0001 - NV0001`). Trunc hint «Hiển thị 50 / 1107 — gõ tên hoặc mã NV để tìm thêm». **0** page=2..N | **PASS** |
| 2 | Company members: **0** employees dump on mount; link/bulk dialog capped page + keyword UX; no page=2..N fan-out | `/hr/company` mount: **0** `/employees` GET. Tab «Tài khoản người dùng» mount: chỉ `admin/companies` + `admin/company-memberships` (200) — **0** employees. «Thêm thành viên» = form nhập tay, **0** GET. «Mời hàng loạt»: **0** employees GET cho tới khi chọn công ty (deferred); ô «Tìm nhân viên theo tên hoặc mã…» hiện diện; gõ keyword khi chưa chọn công ty → **0** GET (đúng defer). **0** fan-out | **PASS** |
| 3 | Optional smoke: Attendance leave tab employee Select capped, không 12-page fan-out | Tab «Nghỉ phép»: **1×** `GET /employees?company_id=main&include_archived=false&page=1&page_size=100` (200) + **1×** `leave-requests` (200). **0** page=2..N. (Leave fetch storm cũ không tái hiện trong smoke này) | **PASS** |
| 4 | Regression J-HRM-02: T-FANOUT ≤1 list GET mount/page; profile detail ≤1; `embedScopeKey`/`_v` stable; console P0=0; no RATE-429 | Bảng dưới | **PASS** |

---

## Network counts (authoritative: iframe `PerformanceResourceTiming` + `responseStatus`)

### 1. Insurance Add dialog (COND-SCALE-W2-PICKER)

| Action | Request | Count | HTTP |
|--------|---------|------:|------|
| Open dialog | `/employees?company_id=main&include_archived=false&page=1&page_size=50` | **1** | 200 |
| Keyword `NV0001` (debounce) | `…&keyword=NV0001&…page=1&page_size=50` | **1** | 200 |
| Multi-page `listAllEmployees` chain | `page=2..N` | **0** | — |

Screenshot: `docs/qa/evidence/p1-hrm-scale-qa-w2-insurance-typeahead-20260717.png`

### 2. Company members (`/command-center/hrm/company`)

| Action | employees GETs | Other |
|--------|---------------:|-------|
| Page mount (soft nav từ Bảo hiểm, `_v` stable) | **0** | — |
| Tab «Tài khoản người dùng» | **0** | `admin/companies` 200 · `admin/company-memberships` 200 |
| Dialog «Thêm thành viên» | **0** | manual form |
| Dialog «Mời hàng loạt» (chưa chọn công ty) + keyword | **0** | deferred until company selected |

**Observation (data state, not W2 defect):** `GET /api/hrm/admin/companies` trả `{total: 0, data: []}` trên env này → select «Chọn công ty» rỗng → không exercise được capped GET per-company trong bulk dialog. Xác nhận bằng read-only probe với session Bearer (diagnostic, không phải acceptance). Capped picker path đã chứng minh đầy đủ ở Insurance dialog (criterion 1).

### 3. Attendance «Nghỉ phép» Select

| Action | Request | Count | HTTP |
|--------|---------|------:|------|
| Attendance mount | `attendance/overview?company_id=main&year=2026` | 1 | 200 |
| Tab Nghỉ phép | `/employees?…page=1&page_size=100` | **1** | 200 |
| Tab Nghỉ phép | `attendance/leave-requests?company_id=main` | 1 | 200 |
| Fan-out page=2..N | — | **0** | — |

### 4. J-HRM-02 regression (Employees)

| Step | Result |
|------|--------|
| Hard reload `/command-center/hrm/employees` mount | **1×** `GET /employees?company_id=main&page=1&page_size=50` (200) + 1× `/employees/summary` (allowed) — **T-FANOUT PASS**; UI total **1107** |
| Row click → profile `HLD-0996` / Phạm Đức Hùng (`/hr/employees/ff16d855-…`) | detail `GET /employees/{id}?company_id=main` **×1** (200) + work-timeline ×1; list chain **×0**; profile render đủ heading + tabs (không «Không tìm thấy») |
| Back (arrow) → list | **1×** `page=1&page_size=50` refetch (trong AC ≤1) + summary; rows 50 |
| `_v` / iframe | `_v=1784270836056` **unchanged** qua list→profile→back và soft-nav (element identity stable, `embedScopeKey`) |
| Soft nav Nhân sự ↔ Hợp đồng (2 chiều, real clicks) | render đúng cả 2 chiều; `_v` stable — W1 path **không regress** |
| Console hooks (iframe + top) | product error **0**; RATE-429 **0** (mọi `/api/hrm/` = 200). Noise phi-P0: radix `DialogContent requires DialogTitle` a11y error khi mở dialog bảo hiểm (residual dưới); vite HMR websocket dev-noise |

Screenshot: `docs/qa/evidence/p1-hrm-scale-qa-w2-profile-20260717.png`

---

## NEW DEFECT — D-HRM-ATT-NAV-STALL-01 (P1, ngoài scope picker W2)

**Triệu chứng:** Soft-nav **rời route Chấm công** không đổi view. Portal URL + iframe SPA path đổi (`/hr/employees` hoặc `/hr/contracts`) nhưng iframe vẫn render Attendance Tổng quan; **0** network mới trong 10s; không console error; chỉ F5 mới khôi phục.

| Repro (real clicks, 2 lần độc lập) | Kết quả |
|------|---------|
| Employees (fresh) → Hợp đồng → Chấm công | render đúng từng bước |
| Chấm công → **Nhân sự** | portal URL `/command-center/hrm/employees`, iframe path `/hr/employees`, **view kẹt Attendance Overview**, rows=0 |
| Chấm công → **Hợp đồng** (lần chạy trước) | kẹt tương tự (path `/hr/contracts`, body vẫn «Đi muộn, về sớm») |
| F5 `/command-center/hrm/employees` | khôi phục: 1× list GET, bảng 1107 — mount path OK |

- Chiều **vào** attendance OK; chiều **ra** attendance FAIL → nghi vấn Attendance route chặn re-render khi nhận postMessage soft-nav (history đổi nhưng router state không cập nhật) — khác class với fetch-storm `D-HRM-ATT-LEAVE-FETCH-STORM` (không thấy storm khi kẹt).
- **Chưa chứng minh do W2** (W2 chỉ đổi `useEmployees`/pickers; view kẹt là overview không gọi employees). Cần bisect với build W1.
- Không đè W1 🟢: J-HRM-02 (list→detail→back→deep-link) và employees↔contracts soft-nav PASS wave này.

Screenshots: `p1-hrm-scale-qa-w2-att-emp-stall-20260717.png`, `p1-hrm-scale-qa-w2-softnav-stale-20260717.png`

---

## Residuals (không chặn PASS W2 picker)

| ID / Item | Severity | Owner | Note |
|----|----|-------|------|
| **D-HRM-ATT-NAV-STALL-01** | **P1** | `dev-fe` | Soft-nav rời Chấm công kẹt view — dispatch cùng phiên (prompt dưới) |
| Insurance **list** mount fan-out: `contracts-insurance/insurance` page=1..**11** ×`page_size=100` trên mount `/hr/insurance` | P2 | `dev-fe` (W2/W3 backlog) | Cùng class dump như picker cũ nhưng endpoint bảo hiểm — ngoài exit criteria W2 (chỉ employees); đề nghị thêm hàng ADR W2 backlog |
| Radix `DialogContent` thiếu `DialogTitle`/`aria-describedby` (console error khi mở dialog Thêm bảo hiểm) | P3 a11y | `dev-fe` | Vi phạm baseline accessibility rule; không crash |
| `admin/companies` trả rỗng (`total 0`) scope `main` → bulk-invite company picker không dùng được | P3 data/BE | `dev-be` xác nhận intended | Chặn exercise capped GET per-company trong bulk dialog (deferred path đã PASS) |
| Attendance child-tab defer-to-dialog polish | P3 | FE backlog | Carry từ FE W2 evidence |
| T-CONC 1000 VU | NFR W3 | `devops` | Không claim wave này |

---

## Click path tóm tắt

1. BOD session → `/command-center/hrm/insurance` (mount đo Network)
2. «Thêm bảo hiểm» → dialog (bridge render top-doc) → đo GET → gõ `NV0001` → dropdown lọc → Esc
3. Menu «Phòng/Ban & Công ty» (soft nav, `_v` stable) → tab «Tài khoản người dùng» → «Thêm thành viên» → «Mời hàng loạt» → keyword
4. Menu «Chấm công» → tab «Nghỉ phép» (đo capped Select)
5. Hard reload `/command-center/hrm/employees` → mount đo → row → profile → back → soft nav Hợp đồng ↔ Nhân sự
6. Repro nav-stall: Employees → Hợp đồng → Chấm công → Nhân sự (kẹt) → F5 khôi phục

Portal URL: `http://14.225.217.232:8088` · smoke deploy `http://127.0.0.1:8088/` · compose portal-fe **8088→5173** · `PORTAL_DEV_URL` Dev8088.

---

## Handoff packet

- `work_item_id`: `P1-HRM-SCALE-QA-W2`
- `from_role`: `qa`
- `to_role`: `pm`
- ack_status: PASS_TO_PM
- `evidence_path`: `docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md`
- `completion_report`: W2 picker browser acceptance PASS trên `:8088` (BOD/`main`): Insurance Add dialog 1× capped GET page=1 + 1× keyword GET, 0 chain; Company members 0 employees dump mount + dialogs deferred/capped; Attendance leave Select 1× page_size=100; J-HRM-02 regression PASS (T-FANOUT 1, detail ×1 + 0 chains, `_v` stable, console P0=0, no 429). `COND-SCALE-W2-PICKER` **CLOSED**. Residual mở: **D-HRM-ATT-NAV-STALL-01 (P1)** soft-nav rời Chấm công kẹt view (F5 recover) + insurance list 11-page fan-out P2 + a11y DialogTitle P3 + admin/companies rỗng P3. U65 zero-seed. Không claim Phase 1/PROD.
- `next_owner`: `pm` → (a) `qc` Scale W2 gate; (b) `dev-fe` D-HRM-ATT-NAV-STALL-01 **cùng phiên**

### next_dispatch_prompt (copy-ready — QC gate)

```text
work_item_id: P1-HRM-SCALE-QC-W2
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: P1-HRM-SCALE-QA-W2 PASS_TO_PM; evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md; deploy docs/qa/evidence/p1-hrm-scale-fe-w2-deploy-20260717.md (HEAD 5d27676); ADR §6 W2
read_first: docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md; docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §6 W2
spec_ref: COND-SCALE-W2-PICKER; ADR §5.1–5.2; J-HRM-02
exit_criteria: QC GO/GWC cho Scale FE W2 picker scope — xác nhận Network counts (insurance ≤1+keyword, company 0 dump, leave 1×100, J-HRM-02 T-FANOUT); ghi D-HRM-ATT-NAV-STALL-01 + insurance list fan-out là conditions có owner (không blocker picker scope); evidence docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md; PASS_TO_PM
cấm: seed; Phase 1/PROD claim; reopen CLOSED W1 profile dedupe / COND-SCALE-W2-PICKER without new browser FAIL
```

### next_dispatch_prompt (copy-ready — dev-fe P1, dispatch song song cùng phiên)

```text
work_item_id: D-HRM-ATT-NAV-STALL-01
from_role: pm
to_role: dev-fe
subagent_type: dev-fe
entry_criteria: evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md §NEW DEFECT; screenshots p1-hrm-scale-qa-w2-att-emp-stall-20260717.png; U65 zero-seed
read_first: apps/web/hrm route/nav bridge (postMessage soft-nav handler), pages/Attendance*; docs/qa/evidence/p1-hrm-menu-attendance-20260717.md (storm defects cùng route)
spec_ref: FE-01 embedScopeKey soft-nav contract; J-HRM-06
symptom: soft-nav RỜI /hr/attendance (→ employees hoặc contracts): iframe location đổi nhưng view kẹt Attendance Overview; 0 network mới; F5 mới khôi phục; chiều vào attendance OK; employees↔contracts OK
exit_criteria: attendance → employees/contracts soft-nav render đúng; không remount iframe (giữ _v stable); bisect xác nhận có/không liên quan W2 useEmployees; jest/vitest regression route listener; READY_FOR_QA
evidence_path: docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md
cấm: seed; đổi iframe key theo path; regress J-HRM-02 / W2 picker counts
```
