# 29-UIUX-EXT — UIUX Extension for XeVN HRM

> **Doc truoc:** `../../29-UIUX-STANDARDS.md` (core rules)
> **Ap dung cho:** XeVN HRM — Settings, Payroll, Attendance, Employee, Recruitment

---

## HRM.A — PAYROLL SETTINGS SCREENS

### HRM.A.1 — Settings Tab Registry (settingsNavigation.ts)

Moi Settings tab PHAI dang ky du 3 cho:
1. `SettingsTabId` union type
2. `ALL_SETTINGS_TAB_IDS` Set
3. `SETTINGS_NAV_GROUPS` array

### HRM.A.2 — Grid Cards (dung cho Nhom Chinh sach, Nhom chuc danh...)

- 3 cot desktop, 2 cot tablet, 1 cot mobile
- System card: badge indigo "He thong", no Edit/Delete, tooltip
- User card: [Edit] + [Xoa] hien khi hover
- Confirm xoa phai ghi ro: "Xoa nhom [Ten]? X chinh sach se chuyen ve 'Chua phan nhom'."

### HRM.A.3 — Tier/Bac thang Grid (dung cho Bang thue, Goi chinh sach)

- Editable Grid: cot so tien/ty le co the edit truc tiep
- Nut "+ Them dong" cuoi bang
- Icon Xoa (trash) tai moi dong
- Validate: so tien/ty le phai hop le, khong de trong

### HRM.A.4 — Payroll Settings Tabs

| Tab ID | Ten hien thi | Component | Layout |
|--------|-------------|-----------|--------|
| `pay-policy-groups` | Nhom Chinh sach | PolicyGroupSettingsPanel | Grid cards |
| `pay-components` | Thanh phan luong | PayComponentSettingsPanel | Table |
| `pay-grade-policy` | Goi chinh sach (Ngach bac) | PayGradePolicyPanel | Table phan cap |
| `pay-tax-tables` | Bang thue TNCN | PayTaxTableSettingsPanel | Tier grid |
| `pay-payslip-tpl` | Mau phieu luong | PayPaySlipTemplatePanel | Template editor |

---

## HRM.B — EMPLOYEE SCREENS

- Danh sach: Avatar + Ma NV + Ho ten + Phong ban + Chuc danh + Trang thai + Actions
- Click dong: mo Employee Detail Drawer (khong navigate page moi)
- Tab Detail: Thong tin / Hop dong / Cham cong / Luong / Lich su — lazy load
- Edit inline trong Detail Drawer

---

## HRM.C — ATTENDANCE SCREENS

- Calendar view la default
- Color coding: du gio (xanh), thieu gio (do), nghi phep (vang)
- Thay doi trang thai da duyet: bat buoc Confirm dialog

---

## HRM.D — PROJECT CONFIG (cho 30-TASK-CREATION-STANDARDS.md)

```
# 30-TASK-EXT — XeVN HRM

## Paths

### FE App
fe-app: apps/web/hrm
integrations-file: src/integrations/hrmApi.ts
navigation-config: src/lib/settingsNavigation.ts
router-config: (embedded — khong co standalone router)

### BE App
be-app: apps/api/hrm-api
migrations-path: migrations/hrm

### Docs
docs-path: docs/brand-new-documents-20270801/

## Naming
Error code prefix: HRM-{MODULE}-{NNN}
Test ID prefix: hrm-{screen}-{element}

## Stack
FE: React + Vite + React Query + Shadcn/UI
BE: NestJS + Prisma + PostgreSQL
Mobile: Expo React Native
```