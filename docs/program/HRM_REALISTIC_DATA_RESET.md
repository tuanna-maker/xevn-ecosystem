# HRM Realistic Data Reset — Program overlay

**work_item_id:** `HRM-REALISTIC-DATA-RESET`  
**Sprint:** S1 (overlay, không thay thế S2–S5)  
**Cadence:** Agile Scrum daily + PMP gate evidence

## Mục tiêu

| Yêu cầu | Cách đáp ứng |
|---------|----------------|
| Tên nhân sự thật | `buildVietnameseFullName` — họ tên Việt Nam, email `ho.ten.<seq>@xe.vn` |
| Hành chính thật | CMND/CCCD, địa chỉ, MST, TK ngân hàng, phòng ban, chức danh tiếng Việt trong `custom_fields` |
| Danh mục chuyên ngành | XBOS bootstrap → `seed:hrm:group-employee-catalog` (gốc XBOS, HRM đồng bộ) |
| HRM mở rộng + duyệt | Extension qua `settings-catalogs` + workflow duyệt (S1 FE-02 / UC catalog) — không seed trực tiếp bypass |
| Hợp đồng / vệ tinh | Loại HĐ theo Bộ luật Lao động VN; ngày hiệu lực theo `hired_at` |

## Lệnh (DevOps — user không cần chạy)

```bash
# Cần: Postgres + hrm-api :28001 (catalog) + deploy/.env
pnpm run seed:hrm:reset-realistic

# Chỉ DB (đã có catalog):
pnpm run seed:hrm:reset-realistic -- --skip-bootstrap --skip-catalog
```

## Gate

1. `pnpm run verify:hrm:menu-density` — 7/7  
2. `pnpm run verify:hrm:realistic-quality` — không còn `UAT Nguyen`, không `fidelity` trong `contract_type`

## Điều phối team (PMP + Scrum)

| Role | Việc | Trạng thái |
|------|------|------------|
| PM | Overlay trên S1; không claim Phase 1 DONE | Active |
| DevOps | Chạy reset + ghi evidence | Dispatch |
| Dev-BE | Catalog sync contract keys ↔ XBOS | S1 backlog |
| QA | UI contracts/Nhân sự + quality gate | Sau reset |
| QC | G-FID-09 realistic data sign-off | Planned |

**Sprint S1 mở:** BE-04/05, FE-02 READY_FOR_QA → QA batch; **S2** vẫn locked đến `P1-S1-PM-02`.
