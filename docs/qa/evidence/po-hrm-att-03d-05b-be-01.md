# Evidence — PO-HRM-ATT-03d-05b-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-03d-05b-BE-01` |
| **role** | dev-be |
| **date** | 2026-08-05 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD / UPGRADE · preserve_default |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` v0.8 · **FR-UC-BP-ATT-03d** · **FR-UC-BP-ATT-05b**
- **tech_spec / ADR:** `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` D3 (work-sites SoT, `company_id` TEXT, scope parity)
- **db_design / api:** `attendance_work_sites` + `employee_leave_balances` · Nest `/attendance/work-sites*` · `/attendance/leave-balance*`
- **classification:** `MASTER_DATA_CONFIG_CLASSIFICATION.md` — GPS = CFG work-sites; quỹ phép = CFG/TXN derived balance API

## Closed scope

### UC-BP-ATT-03d — GPS work-sites

| Endpoint | Behavior |
|----------|----------|
| `GET /attendance/work-sites?company_id=` | List scoped via `resolveHrmListScope` + `expandHrmTextCompanyIds` (slug TEXT parity records) |
| `POST /attendance/work-sites` | Persist `company_id` TEXT via `resolveHrmPersistCompanyIdText`; FE `radius` alias → `radius_meters` |
| `PATCH /attendance/work-sites/:siteId` | Load-by-id + `assertResourceInHrmScope` (list↔mutate parity); `radius` alias |
| `DELETE /attendance/work-sites/:siteId` | Same scope guard |

FE-ready DTO fields: `id`, `company_id`, `name`, `address`, `latitude`, `longitude`, `radius` + `radius_meters`, `active`, `created_at`.

**must_keep verified in CODE-MEMORY:** work_shifts wins vs XBOS REF; Face GĐ2; no `ensureDefaultWorkSite` seed; geofence SoT = work-sites.

### UC-BP-ATT-05b — Leave balance panel

| Endpoint | Behavior |
|----------|----------|
| `GET /attendance/leave-balance` | Single type (existing) — empty → `source: default` + 0 days (hợp lệ) |
| **`GET /attendance/leave-balance/panel`** | **ADD** — 5 MVP types in one response: `annual`, `seniority`, `compensatory`, `carry_over`, `advance` |

Panel payload: `{ company_id, employee_id, balance_year, year, as_of, items[] }` — mỗi item display-ready (`leave_type_label`, entitled/used/pending/remaining/available, `source`). Missing rows → zeros, **không** 404 / không spinner storm N×GET.

**Cấm FY hardcode:** `year` query optional; default = calendar year `Asia/Ho_Chi_Minh` only (ATT-04 FY CRUD tenant riêng — không invent tháng bắt đầu).

## Tests

```text
pnpm --filter hrm-api exec jest --runInBand \
  src/attendance/leave-balance.service.spec.ts \
  src/attendance/attendance-config.service.spec.ts \
  src/attendance/attendance.controller.spec.ts
→ Test Suites: 3 passed · Tests: 35 passed
```

Coverage added: panel 5 types + empty default; panel self-or-HR 403; createWorkSite `radius` + TEXT slug; updateWorkSite out-of-scope reject; controller `HRM-LEAVE-BAL-PANEL-200`.

## U65

No seed scripts; no DB fake for UAT evidence. Empty work-sites list and empty leave balances are valid product states.

## Residual (FE / QA)

- Dev-FE: wire panel `GET …/leave-balance/panel` on LeaveTab (optional; single-type hook vẫn dùng được).
- QA: browser UF ATT-03d GPS CRUD + ATT-05b panel; **cấm seed**; FE sau 2xx + F5.
- PROP-03e / Face web / PAY unsigned sheet — **out of scope** (must_keep).

## next_owner

`qa` (sau hoặc song song Dev-FE wire panel nếu cần UI multi-type).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-03d-05b-QA-01
role: qa
entry: L0 stack; BE READY_FOR_QA docs/qa/evidence/po-hrm-att-03d-05b-be-01.md; U65 zero-seed
UF: ATT-03d — Cài đặt→Quy tắc→Địa điểm GPS → list/Thêm/Sửa/Xóa (company slug) · ATT-05b — Nghỉ phép panel quỹ (single + panel nếu FE wired)
exit: browser evidence FE sau 2xx + F5; matrix Dev8088; PASS_TO_PM
cấm: pnpm seed:* · PASS chỉ curl
```
