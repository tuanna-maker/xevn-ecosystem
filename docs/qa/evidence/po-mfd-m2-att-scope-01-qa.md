# Evidence — PO-MFD-M2-ATT-SCOPE-01-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SCOPE-01-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **u65_zero_seed** | true |
| **hdsd_align** | ATT-C4 · Nghỉ phép → Chờ duyệt → Duyệt |
| **spec_ref** | FR-HRM-AT-10 · TECHSPEC §14.5 · `HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` C4 |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |

## Entry / L0

| Check | Result |
|-------|--------|
| `hrm-api` `:28001` | 200 |
| Portal `:5173` | 200 (started `dev:web-only` during run) |
| `qc:dev-stack` | HRM + XBOS 200 (portal flaky mid-run — restarted) |
| Seed | **None** |

## Persona

| Role | Account | JWT OU | Portal scope under test |
|------|---------|--------|-------------------------|
| NV (create) | `uat.nv0007@xe.vn` / `xevn-uat-2026` | `trsport` | embed `companyId=trsport` |
| QL (approve) | `uat.nv0002@xe.vn` / `xevn-uat-2026` | `trsport` | storage / spreadsheet **`x-company-id=main`** + list mount **`companyId=trsport`** (OU rows visible) |

## UF ATT-C4 — Leave approve (browser, U65)

### UF-ATT-C4-LEAVE-APPROVE-M2

- **URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
- **Click path:** Nghỉ phép → (NV) Tạo yêu cầu → Gửi → QL login context → Chờ duyệt → **Duyệt**
- **Trước mutate:** Chờ duyệt có đơn mới (stamp `M2MAIN-8BWR9`)
- **Network create (NV):** POST `/api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` · `x-company-id=main`
- **Network approve (QL):** POST `/api/hrm/attendance/leave-requests/{id}/approve` → **201** `HRM-LEAVE-203` · `x-company-id=trsport` · `requestStatus=approved`
- **FE sau 2xx:** trạng thái **Đã duyệt** trên màn
- **F5:** PASS — trạng thái duyệt còn
- **Verdict:** 🟢 **PASS** (browser end-to-end; không 409 scope)

> **Ghi chú scope header:** Với embed `companyId=trsport`, FE gửi `x-company-id=trsport` khi Duyệt (parity FE AT-12). Mục tiêu M2 BE là **chấp nhận header `main`** khi portal spreadsheet ép main — kiểm tra bổ sung L1 bên dưới.

### BE scope probe — `x-company-id=main` (mutate, read-only on pending row)

| Step | Result |
|------|--------|
| QL token · POST approve pending `trsport` row · header **`x-company-id=main`** · body `{ reviewer_name: "QL TM-DV UAT" }` | **201** `HRM-LEAVE-203` · `approved` |
| Trước fix (bus): cùng pattern | 409 `SCOPE_CONTEXT_MISMATCH` / `HRM-LEAVE-409` |

**Verdict:** 🟢 **PASS** — C4 leave mutate scope parity khi header portal = `main`.

## UF ATT-C4 — OT approve

| Step | Result |
|------|--------|
| Click path | Quản lý đơn → Đăng ký làm thêm → Chờ duyệt |
| Pending rows / nút Duyệt | **0** |
| FE-origin OT create trong lượt | **Không** (form phức tạp; không seed) |

**Verdict:** 🟡 **BLOCKED** — không có đơn OT chờ duyệt từ FE để bấm Duyệt. BE unit coverage OT scope nằm ở `attendance-requests.service.spec.ts` (+3 PO-MFD-M2) per dev-be evidence.

**Residual:** `R-MFD-M2-OT-FE-APPROVE` — QA retest OT Duyệt sau khi có HP tạo OT từ FE (uat.nv0007 hoặc mgr) trên cùng persona main/trsport.

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-scope-01-qa-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-scope-01-qa-main.mjs` |
| Regression sanity | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12.mjs` → seat **PASS** (201 `HRM-LEAVE-203` @ trsport) |
| Dev-BE handoff | `docs/qa/evidence/po-mfd-m2-att-scope-01.md` |

## J-* / L2.5

Wave C4 mutate scope — **không** đổi journey map; liên quan **HRM-AT-10 / AT-12 L1** approve path (list→Duyệt→F5). Không 404/409 trên detail.

## completion_report

**Closed:** Leave approve scope parity for ATT-C4 P0 — browser FE-origin create→Duyệt→F5 **201**; live probe **main** header approve **201** (M2 controller `resolveScopeContext`).

**Open:** OT browser approve BLOCKED (no pending FE row). Other C4 types (business-trip, late-early, shift-change) out of dev-be WI — unchanged.

## next_owner

pm → **qc** (narrow ATT-C4 leave scope) · optional **qa** follow `R-MFD-M2-OT-FE-APPROVE`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SCOPE-01-QC
from_role: pm
to_role: qc
lane: execution
priority: P1
entry_criteria: docs/qa/evidence/po-mfd-m2-att-scope-01-qa.md PASS_TO_PM; dev-be docs/qa/evidence/po-mfd-m2-att-scope-01.md READY_FOR_QA closed
exit_criteria: GO or GO WITH CONDITIONS for leave scope only; OT residual R-MFD-M2-OT-FE-APPROVE documented; no regression on U78 update-request scope
read_first: docs/qa/evidence/po-mfd-m2-att-scope-01-qa.md · po-mfd-m2-att-scope-01.md
ack_status: PASS_TO_PM or NO-GO with residual list
```
