# PCOMP-W7-MOB-PROFILE-FULL — MOB-12 full profile (W7-6)

**Date:** 2026-07-19  
**Role:** dev-mobile  
**ack_status:** READY_FOR_QA  
**Journey:** UC-HRM-MOB-12 full / AC-ESS-01..03 · device J-MOB-12 (ESS profile — not portal carousel)

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/hrm/MOBILE_W7_SRS_DELTA.md` | §4.5 UC-HRM-MOB-12 full — P1..P5, AC-ESS-01..03 |
| `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | DynamicProfileForm (W7-6) · avatar SELF_PATCH baseline §3.1 |
| `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` | §7 `custom_fields` keys (phone/gender/DOB) |
| `docs/hrm/SRS_MOBILE.md` | UC-HRM-MOB-12 baseline |

**spec says / code does**

| Topic | Spec | Implementation |
|-------|------|----------------|
| Catalog schema | `GET …/settings-catalogs/employee-fields` | Interim `GET /settings-catalogs` → parse `hrm_employee_personal_fields` + basic; fallback `DEFAULT_W7_PERSONAL_FIELD_CATALOG` |
| Dynamic form | `DynamicProfileForm` / `DynamicFormField` | `DynamicProfileForm.tsx` + `dynamicProfileForm.ts` |
| Self allowlist | `work_phone` / phone (AC-ESS-01) | Editors for `phone_number` + `work_phone` only |
| Read-only | `employee_code` (AC-ESS-02) | `editableBy: none` always |
| DOB | HR / celebrations only | `date_of_birth` filtered from mobile fields (BR-BDAY-01) |
| Self PATCH | PATCH 202 → reload | Client sends merged `custom_fields`; BE still `SELF_PATCH_FIELDS=['avatar_url']` → honest 403 UX until `PCOMP-W7-BE-PROFILE-ESS` |

---

## Closed scope

1. **Catalog-driven ESS fields** — always show phone / gender / address / email / mã NV (— when empty).
2. **Self editor** — SĐT ≥44px + Lưu (`testID=profile-ess-save` / `dynamic-profile-form`).
3. **HR block** — full_name / job_title_key unchanged for HR roles.
4. **Avatar** — existing J-AVT path preserved.
5. **@CODE-MEMORY** on form utils, catalog client, DynamicProfileForm, ProfileScreen.
6. **Tests** — 19/19 scoped PASS.

---

## Verify

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/dynamicProfileForm.test.ts \
  src/utils/__tests__/profileEssFields.test.ts \
  src/integrations/__tests__/hrmEmployeeFieldsCatalog.test.ts \
  src/components/profile/__tests__/dynamicProfileFormUx.test.ts
→ 4 files / 19 tests PASS (2026-07-19)
```

`tsc --noEmit`: pre-existing fail in `hrmTeamDirectory.test.ts` (unrelated); no errors in PROFILE-FULL paths.

---

## Residual / QA focus (U65 — no seed)

| Item | Owner | Note |
|------|-------|------|
| AC-ESS-01 live PATCH 202 | **dev-be** | Expand `SELF_PATCH_FIELDS` / allow self `custom_fields` phone keys — else device sees Vietnamese 403 hint |
| Dedicated `employee-fields` route | ba/dev-be | Mobile uses settings-catalogs interim |
| Device J-MOB-12 | **qa-device** | Fresh qa-device APK after wave APK build |

### Device path (qa-device)

1. Login `uat.nv0001@xe.vn` → tab **Hồ sơ** → **Thông tin**
2. Assert `dynamic-profile-form` + labels **Số điện thoại** / **Giới tính** / **Mã nhân viên** (even if —)
3. Assert **Mã nhân viên** not editable
4. Edit phone → **Lưu** → Network PATCH `/employees/:id` → if BE unlocked: 2xx + F5 value sticks; if 403: alert «chưa mở quyền…» (not crash)
5. Regression: avatar pick still works; tabs Công việc / Tài liệu load

**cấm:** seed `custom_fields`; claim Phase1/PROD.

---

## Files touched

- `apps/mobile/hrm-mobile/src/utils/dynamicProfileForm.ts` (new)
- `apps/mobile/hrm-mobile/src/utils/profileEssFields.ts`
- `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeFieldsCatalog.ts` (new)
- `apps/mobile/hrm-mobile/src/integrations/hrmEmployees.ts` (`patchEmployeeCustomFields`)
- `apps/mobile/hrm-mobile/src/components/profile/DynamicProfileForm.tsx` (new)
- `apps/mobile/hrm-mobile/src/components/profile/IconDetailRow.tsx` (testID)
- `apps/mobile/hrm-mobile/src/components/ui/FormField.tsx` (phone-pad + minHeight 44)
- `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx`
- tests under `utils/__tests__`, `integrations/__tests__`, `components/profile/__tests__`

---

## Handoff

- **ack_status:** READY_FOR_QA  
- **next_owner:** qa-device  
- **next_dispatch_prompt:** see completion_report
