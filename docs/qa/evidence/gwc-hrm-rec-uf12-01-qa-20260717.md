# GWC-HRM-REC-UF12-01-QA (+ D-HRM-TOOLS-STUB-TOAST-01-QA) — browser retest :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-REC-UF12-01-QA` (+ `D-HRM-TOOLS-STUB-TOAST-01-QA`) |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` · HEAD **397ac81** (deploy evidence `d-hrm-rec-uf12-01-deploy-20260717.md`) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · BOD · `companyId=main` |
| **spec_ref** | UF-HRM-12 · UC-HRM-22 · J-HRM-05 · P-CC-06 · Tools deferred R-FID-02 |
| **U65** | zero-seed · browser-only · no `pnpm seed:*` · no API-only PASS |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict (overall)

| Lane | Verdict | Note |
|------|---------|------|
| **1) Recruitment UF-HRM-12 + J-HRM-05** | **🟢 PASS** | Mutate + F5 + no RATE-429; matrix promoted |
| **2) Tools stub-toast honesty** | **🟢 PASS (honesty only)** | Menu stays **⚪ deferred** — not product CRUD DONE |

---

## 1) Recruitment — UF-HRM-12 + J-HRM-05

### Click path

1. Session already authenticated as Group CEO (BOD) on portal `:8088`
2. Navigate `http://14.225.217.232:8088/command-center/hrm/recruitment?cb=397ac81`
3. Iframe: `/hr/recruitment?portal=1&tenantId=xevn&companyId=main`
4. Tab **Yêu cầu tuyển dụng** → assert **Thêm yêu cầu** / **Chi tiết** / **Sửa**
5. Row `QA UF12 Tuyển dụng 1781919496427` → **Sửa** → change status **Tạm dừng → Đang tuyển** → **Lưu thay đổi**
6. Observe FE after 2xx → iframe reload (F5 sim) → status still **Đang tuyển**
7. **Chi tiết** (J-HRM-05) → detail dialog from GET by id
8. Tab **Đề xuất** → **Tạo đề xuất** → fill → **Tạo đề xuất** → FE after 201 → navigate reload → row persists

### Gate results

| Gate | Result | Evidence |
|------|--------|----------|
| L0 portal recruitment load | **PASS** | Sidebar **Tuyển dụng** current; iframe Dashboard KPIs (CV=5); no Sync ERROR / 409 / `54321` |
| Actions present | **PASS** | **Thêm yêu cầu**, per-row **Chi tiết** + **Sửa** (PermissionGate no longer hides mutate) |
| List | **PASS** | 45 requisition rows; `GET …/requisitions?company_id=main&page=1&page_size=100` **200** |
| PATCH status | **PASS** | `PATCH …/requisitions/94157232-03ee-4f9f-b247-a900cff51ada?company_id=holding` **200** (~488 ms) |
| FE after PATCH 2xx | **PASS** | Toast «Đã cập nhật trạng thái / PATCH… HRM-REC-200»; first row status **Đang tuyển** |
| F5 after PATCH | **PASS** | After iframe hard reload + tab Yêu cầu: same title still **Đang tuyển** |
| J-HRM-05 Chi tiết | **PASS** | Dialog «Chi tiết yêu cầu tuyển dụng» + title/status/holding; `GET …/requisitions/{id}?company_id=holding` **200**; no 404/409 |
| Đề xuất list vs prior FAIL | **PASS** | UI shows proposals (KPI: Tổng **9** after create; was UI **0** vs API 8 in prior FAIL) |
| POST đề xuất | **PASS** | `POST /api/hrm/recruitment/headcount-proposals` **201** (~396 ms); toast «Đã tạo đề xuất ngoài định biên» |
| FE after POST 2xx | **PASS** | Row title `QA-GWC-UF12-1784260341633` visible; Chờ duyệt **1** |
| F5 after POST | **PASS** | Full portal re-nav to recruitment → Đề xuất still shows marker row |
| Eval storm / RATE-429 | **PASS** | `candidate-evaluations` count **0** during mutate session; **0** HTTP 429 observed |
| U65 no seed | **PASS** | Browser FE mutate only |

### Network summary (mutate window)

| Method | URL (short) | Status |
|--------|-------------|--------|
| GET | `/api/hrm/recruitment/requisitions?company_id=main&page=1&page_size=100` | **200** |
| PATCH | `/api/hrm/recruitment/requisitions/94157232-…?company_id=holding` | **200** |
| GET | `/api/hrm/recruitment/requisitions/94157232-…?company_id=holding` (detail) | **200** |
| GET | `/api/hrm/recruitment/headcount-proposals?company_id=main` | **200** |
| POST | `/api/hrm/recruitment/headcount-proposals` | **201** |

### Screenshot

- `docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-dexuat-20260717.png` — Đề xuất tab after create (Tổng đề xuất **9**, Chờ duyệt **1**)

### Matrix

- Promoted **UF-HRM-12** → **🟢** in `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` (note J-HRM-05 + evidence link).

### Closed vs prior FAIL (`p1-hrm-menu-recruitment-20260717.md`)

| Prior defect | Retest |
|--------------|--------|
| Eval storm / AbortError / RATE-429 | **CLOSED** — no eval fan-out, no 429 |
| PermissionGate hides **Sửa** | **CLOSED** — Sửa + status dialog work |
| Đề xuất UI 0 vs API 8 | **CLOSED** — list + KPIs populated |
| Mutate save not closed | **CLOSED** — PATCH 200 + POST 201 + F5 |

---

## 2) Tools — D-HRM-TOOLS-STUB-TOAST-01 (honesty)

### Click path

1. Navigate `http://14.225.217.232:8088/command-center/hrm/tools_equipment?cb=397ac81`
2. Iframe: `/hr/tools-equipment?portal=1&tenantId=xevn&companyId=main`
3. Assert deferred banner + empty inventory; scan buttons; Network/Performance for POST tools + employees fan-out

### Gate results

| AC | Result | Evidence |
|----|--------|----------|
| Deferred banner | **PASS** | `data-testid=tools-deferred-banner`: «Thêm/sửa/xóa CCDC và phiếu cấp phát chưa hỗ trợ — module đang chờ API HRM (Phase 2).» |
| Empty honest notice | **PASS** | «Chưa có CCDC nào» + same deferred copy (`tools-readonly-notice`) |
| No Thêm CCDC / Tạo phiếu / Edit / Delete | **PASS** | Buttons only: scope combobox, **Kho CCDC**, **Cấp phát / Thu hồi** — `forbidden=[]` |
| No fake success toast | **PASS** | No sonner/toast nodes on mount or tab switch |
| No POST tools | **PASS** | fetch intercept: `posts=[]`; no tools mutate API |
| No employee list fan-out | **PASS** | emp fan-out count **0** (fetch + PerformanceResourceTiming) |
| Menu status | **⚪ deferred** | **Not promoted** to live CRUD / UF DONE |

### Screenshot

- `docs/qa/evidence/d-hrm-tools-stub-toast-qa-20260717.png` (companion short evidence below)

### Companion evidence

See also: `docs/qa/evidence/d-hrm-tools-stub-toast-qa-20260717.md`

---

## Residuals

| ID | Sev | Note |
|----|-----|------|
| — | — | None P0/P1 for this wave. Tools remains intentionally ⚪ deferred (honesty fix only). |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc` (GWC close for UF-HRM-12 blocker) — or `pm` to dispatch QC
- **evidence_path:** `docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md`
- **cấm observed:** no seed; tools not claimed product DONE; no Phase 1 DONE claim
