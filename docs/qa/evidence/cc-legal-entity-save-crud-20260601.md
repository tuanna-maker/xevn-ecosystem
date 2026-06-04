# Command Center — Legal entity save (Lưu thay đổi) CRUD fix

**Date:** 2026-06-01  
**Route:** `/command-center?settings=company_member_units` (form: Khối Định danh & Trụ sở)

## Root cause

1. **Tập đoàn XeVN** dùng UI id `xbos-group-holding-root` — `saveCompanySettings()` **return sớm** (chỉ xem, không gọi API).
2. API `GET /org-foundation/legal-entities` với `companyId=holding` trước đây trả **danh sách member flat** thay vì holding rows → không resolve UUID để PUT.
3. Thông báo lỗi chỉ ở **đầu panel** (`publishMessage` xám) — user không thấy khi bấm **Lưu thay đổi** ở footer.

## Fix

| Layer | Change |
|-------|--------|
| BE | `listLegalEntities(xevn, holding)` → query `xbos_legal_entity` holding partition |
| FE | Holding save → resolve/create/update qua `fetchHoldingLegalEntities` + `GROUP_HOLDING_COMPANY_ID` |
| FE | Banner đỏ/xanh **cạnh nút Lưu**, trạng thái `Đang lưu…`, validate MST 10–13 số |
| Registry | `BTN-CC-P0-LEGAL-ENTITY-SAVE` |

## Verification

```bash
pnpm --filter web-portal test -- legalEntityIdResolver
node scripts/tmp-cc-legal-entity-crud-probe.mjs
```

**Result:** 7/7 vitest PASS; probe POST+PUT holding legal-entity PASS (portal :5175).

## User retest

1. Hard refresh `http://localhost:5175/command-center` → Cài đặt → Đơn vị thành viên → Sửa **Tập đoàn XeVN**.
2. Bấm **Lưu thay đổi** → banner xanh hoặc đỏ ngay trên nút; thành công thì quay danh sách.

## CRUD matrix (Command Center settings — snapshot)

| Màn | Nút lưu | API | Ghi chú |
|-----|---------|-----|---------|
| Pháp nhân (holding + member) | Lưu thay đổi | org-foundation legal-entities | **Fixed** this wave |
| Cổ đông / Tài liệu pháp lý | Lưu dòng | legal-entity-profile | Wired (P0) |
| Phòng ban | Lưu (tab) | org-units | Wired |
| Danh mục nền | Lưu danh mục nền | infrastructure settings | DB + local fallback |
| Khung phòng ban | Lưu khung | dept templates API | Wired |
| Quy trình | Lưu quy trình | workflow-engine | Wired |
| Ma trận quyền | auto debounce | position-rbac/matrix | Wired |
| Văn bản/Đo lường/Giá | catalog rows | cc-catalog API | Wired on menu change |

HRM app CRUD: see `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` Track B (employees, payroll, attendance).
