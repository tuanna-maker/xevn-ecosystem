# 30-TASK-EXT — Task Config for XeVN HRM

> Reference: `../../30-TASK-CREATION-STANDARDS.md`

## Paths

### FE App
```
fe-app: apps/web/hrm
src/
  components/settings/payroll/   <- Settings panels (payroll)
  components/settings/hr/        <- Settings panels (HR)
  pages/payroll/                 <- Payroll pages
  pages/attendance/              <- Attendance pages
  hooks/                         <- React Query hooks (useXxx.ts)
  integrations/hrmApi.ts         <- API wrapper
  lib/settingsNavigation.ts      <- Settings sidebar config (union + Set + NavGroup)
  pages/Settings.tsx             <- Settings page render switch
```

### BE App
```
be-app: apps/api/hrm-api
src/
  payroll/{feature}/
    dto/create-{feature}.dto.ts
    dto/update-{feature}.dto.ts
    dto/query-{feature}.dto.ts
    {feature}.service.ts
    {feature}.service.spec.ts
    {feature}.controller.ts
migrations-path: migrations/hrm/{YYYYMMDD}_{gn}_{feature}.sql
```

### Docs
```
docs-path: docs/brand-new-documents-20270801/
  SRS_Gn_{FEATURE}_v1.md
  TECHSPEC_Gn_{FEATURE}_v1.md
```

## Naming
- Error codes: `HRM-{MODULE}-{NNN}` (vi du: HRM-G0-001)
- Test IDs: `hrm-{screen}-{element}` (vi du: hrm-settings-add-policy-group-btn)

## Settings Tab Registration Checklist
Moi Settings tab moi PHAI them vao 3 cho trong `settingsNavigation.ts`:
1. `SettingsTabId` union type — them '{tab-id}'
2. `ALL_SETTINGS_TAB_IDS` Set — them '{tab-id}'
3. `SETTINGS_NAV_GROUPS` — them vao dung group va them render case vao `Settings.tsx`

## Stack
- FE: React 18 + Vite + React Query v5 + Shadcn/UI + TailwindCSS
- BE: NestJS + Prisma + PostgreSQL (multi-tenant via tenant_id)
- Mobile: Expo React Native
- Auth: JWT + RBAC (roles: HR_ADMIN, HR_STAFF, EMPLOYEE, MANAGER)

## Ports (dev)
- Portal/HRM FE: :5173 (iframe embed trong XBOS portal)
- HRM API: :28001 / :3001
- XBOS API: :28002