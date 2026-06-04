# Pilot business flow matrix — zero-defect gate

**Owner:** QA (execute) · QC (audit) · PM (dispatch)  
**Account mặc định:** `ceo@xe.vn` / `Xevn@2026`  
**Base URL:** `http://localhost:5175` (portal proxy → HRM `28001`, XBOS `28002`)  
**BA trace (UC, branches, QA script):** [`PILOT_BUSINESS_FLOW_BA_TRACE.md`](PILOT_BUSINESS_FLOW_BA_TRACE.md) · `work_item_id: PILOT-ZERO-DEFECT-01`

## Cách chạy (agent — user không chạy)

```bash
# L0
pnpm run qc:dev-stack

# L1 — API toàn hệ thống (37+ phases)
pnpm run test:system:uat

# L2 — từng route bảng dưới (QA browser hoặc scripted smoke khi có script)
# Evidence: docs/qa/evidence/pilot-business-flow-YYYYMMDD.md
```

## Matrix — Portal Command Center

| ID | Route | Nghiệp vụ | UC-ID | SRS ref | PASS criteria | L2 status |
|----|-------|-----------|-------|---------|---------------|-----------|
| P-CC-01 | `/login` → `/command-center` | Đăng nhập tập đoàn | UC-ECO-SCOPE-02, UC-XBOS-AUTH-02 | `docs/ecosystem/SRS.md` §9–10 | Redirect OK; JWT `expiresInSec=86400` | PASS (L1/L0) |
| P-CC-02 | `/command-center` (settings) | Đơn vị thành viên | UC-CC-03, UC-ECO-MASTER-01 | `docs/ecosystem/SRS.md` §8.1 | `group-member-units` 200; ≥1 row; không 403 | PASS (L1/L0) |
| P-CC-03 | `/command-center/hrm/employees` | Danh sách nhân sự | **UC-HRM-21** | `docs/hrm/SRS.md` §13 UC-HRM-21 | Sync CONNECTED; `employees?page_size=100` 200; row hoặc **empty+200**; không 409/54321 load | **PASS** |
| P-CC-04 | `/command-center/hrm/contracts` | Hợp đồng | **UC-HRM-25** (HĐ) | `docs/hrm/SRS.md` §13 UC-HRM-25 | Không 54321; `settings-catalogs` 200; `contracts-insurance` 200; không 409 rollup scope | **PASS** |
| P-CC-05 | `/command-center/hrm/insurance` | Bảo hiểm | **UC-HRM-25** (BHXH) | `docs/hrm/SRS.md` §13 UC-HRM-25 | Nest/proxy **200** hoặc empty+200; không 409 load; không 54321 bắt buộc; xem BA trace § P-CC-05 | **PASS** (S0 QA 2026-05-23) |
| P-CC-06 | `/command-center/hrm/recruitment` | Tuyển dụng | **UC-HRM-22** | `docs/hrm/SRS.md` §13 UC-HRM-22 | `recruitment/requisitions` 200; row hoặc empty+200; không 409/54321 load | **PASS** (S0 L2 2026-05-23) |
| P-CC-07 | `/command-center/hrm/attendance` | Chấm công | **UC-HRM-23** | `docs/hrm/SRS.md` §13 UC-HRM-23 | `attendance/records` 200; row hoặc empty+200; không 409; không ngày 1970 | **PASS** (S0 L2 2026-05-23) |
| P-CC-08 | `/command-center/hrm/payroll` | Tiền lương | **UC-HRM-24** | `docs/hrm/SRS.md` §13 UC-HRM-24 | `payroll/payslips` 200; row hoặc empty+200; không 409/54321 load | **PASS** (S0 L2 2026-05-23) |
| P-CC-09 | `/command-center?settings=hrm_catalog_governance` (alias `/catalog-governance`) | Hộp thư duyệt DM HRM | **UC-XBOS-CAT-03**, **UC-XBOS-CAT-05** (`BTN-A2`) | `docs/ecosystem/SRS.md` §XBOS governance | `GET catalog-governance/inbox` **200** `XBOS-CAT-212`; row hoặc **empty+200**; không **409** load; approve `POST …/tasks/:id/approve` → `XBOS-CAT-201` khi có pending task (write scope strict — ADR C2) | **PASS** (S2 QA-02 2026-05-24) |

**Scope / empty (mọi P-CC-03..08):** Happy = dữ liệu + 200; Alternate = **empty + 200** (BR-MOCK-01); Exception = **409** `SCOPE_CONTEXT_MISMATCH` khi mismatch; **FAIL** nếu empty che 4xx/5xx hoặc 54321 bắt buộc — chi tiết nhánh trong BA trace.

## Matrix — Cross-navigation (L2.5 — bắt buộc QA)

**SoT chi tiết:** `docs/program/PROGRAM_JOURNEY_MAP.md`  
**Account:** `ceo@xe.vn` / `Xevn@2026` · **FAIL tức thì:** 404 detail API, «Không tìm thấy nhân viên», console 404 với `company_id=main`

| J-ID | From (P-CC) | Journey | PASS criteria | L2.5 status |
|------|-------------|---------|---------------|-------------|
| **J-HRM-01** | P-CC-04 | Hợp đồng → click tên NV → hồ sơ | `GET /employees/:id?company_id=main` **200**; UI không empty error | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-02 | P-CC-03 | Nhân sự list → hồ sơ | Detail load 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-03 | P-CC-04 | Hợp đồng → chi tiết HĐ | Contract detail/drawer 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-04 | P-CC-05 | Bảo hiểm → NV linked | Employee link 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-05 | P-CC-06 | Tuyển dụng → requisition/candidate | Detail 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-06 | P-CC-07 | Chấm công → bản ghi | Detail 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |
| J-HRM-07 | P-CC-08 | Lương → phiếu lương | Payslip detail 200 | **PASS** · [R4](docs/qa/evidence/p1-ex-qa-01-r4-20260526.md) |

**L2 PASS without L2.5 PASS = QA FAIL** — QC **NO-GO** cho UAT-READY claim trên slice đó.

## Matrix — API (L1, automated)

Gộp trong `pnpm run test:system:uat` — xem `docs/qa/SYSTEM_INTEGRATION_UAT_SCENARIO.md` (P0–P6, AC-SYS-01..08).

## Matrix — Mobile (L1 phần P3–P5)

| ID | Flow | UC-ID | PASS |
|----|------|-------|------|
| M-01 | Login `uat.nv0001@xe.vn` | UC-HRM-MOB-01 | JWT + company scope |
| M-02 | Check-in UUID scope | UC-HRM-MOB-04 | Không 409 SCOPE_CONTEXT_MISMATCH |
| M-03 | Leave list/create | UC-HRM-MOB-06,07 | 201/200 + DB |

## FAIL → báo cáo bắt buộc

QA/QC ghi vào evidence + bus:

- `work_item_id`, route ID (P-CC-xx), HTTP code, console excerpt (không secret).
- `ack_status: FAIL` → PM → dev-fe / dev-be / devops.
- QC **NO-GO** nếu bất kỳ route **bắt buộc** FAIL.

## Lịch sử gate

| Date | P-CC-03 | P-CC-04 | P-CC-05..08 | QC verdict |
|------|---------|---------|-------------|------------|
| 2026-05-22 | PASS | PASS (post contracts fix) | Deferred — BA trace published | GO WITH CONDITIONS — insurance + 06..08 deferred |
| 2026-05-23 | PASS | PASS | **PASS** (L2 11/11 post BE fix + API restart) | **GO WITH CONDITIONS** — `qc-scrum-s0-hrm-embed-20260523.md` (C-S0-P3 work_history → S3) |
| 2026-05-23 | PASS | PASS | 05 PASS · **06/07 FAIL** · 08 PASS | **NO-GO** (pre-BE fix) — superseded by 11/11 retest |
| 2026-05-23 AM | PASS | PASS | **READY_FOR_QA** | **NO-GO** 8-route (superseded) |
| 2026-05-24 | PASS | PASS | 05..08 PASS · **P-CC-09 PASS** (cat-gov inbox C6/C10) | **GO WITH CONDITIONS** — approve E2E pending task seed (QC C10 closed QA-side) |

## Mở rộng

- ~~BA-Process: map thêm route → UC-ID trong SRS.~~ Done — `PILOT_BUSINESS_FLOW_BA_TRACE.md` (2026-05-22).
- QA: thêm `scripts/pilot-business-flow-smoke.mjs` (optional) gọi proxy + headless checks.
