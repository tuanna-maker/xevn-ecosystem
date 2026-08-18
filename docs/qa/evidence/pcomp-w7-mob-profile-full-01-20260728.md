# PCOMP-W7-MOB-PROFILE-FULL-01 — MOB-12 full profile (W7-6)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-PROFILE-FULL-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD \| FIX |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — source + unit only (no APK this wave) |
| **journeys** | **J-MOB-12** (SRS W7-6 AC-ESS) · regression **J-MOB-17** tabs · home → Profile |
| **UC** | UC-HRM-MOB-12 full |
| **prior** | `pcomp-w7-mob-profile-full-20260719.md` · directory Plane B `pcomp-w7-mob-directory-01-20260728.md` |

---

## spec_read_ack

| Artifact | Sections / ack |
|----------|----------------|
| **srs** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` **§4.5 UC-HRM-MOB-12 full** — P1–P5, BR-ESS-01/02, AC-ESS-01/02/03 · `docs/hrm/SRS_MOBILE.md` UC-HRM-MOB-12 |
| **tech_spec** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` — DynamicProfileForm (W7-6) · avatar SELF_PATCH baseline |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` — `employees.custom_fields` phone keys · soft FK |
| **api_design** | `docs/hrm/API_DESIGN_HRM_EMPLOYEES.md` **§1** GET by-id scope ≡ list Plane B · **PATCH** `HRM-EMP-202` self `custom_fields` phone merge · bước FR-HRM-EM-01 / UC-HRM-MOB-12 |
| **data** | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` **§7** `phone_number` / `work_phone` MOB-12 self |
| **uc_ids** | UC-HRM-MOB-12 full |
| **sponsor_confirm** | W7 pack BA-SRS · directory Plane B GWC must_keep · dual-plane JWT …0001 |

**Route SoT:**

- Catalog interim: `GET /api/hrm/settings-catalogs?company_id=` (SRS names `employee-fields` — **not invent** dedicated route; BE still no `/employee-fields`)
- Self load: `GET /api/hrm/employees/:id?company_id=` Plane B slug
- Self save: `PATCH /api/hrm/employees/:id` `{ custom_fields }` → expect **202** `HRM-EMP-202` (BE `SELF_PATCH_CUSTOM_FIELD_KEYS` = phone_number/work_phone — unlocked since prior residual)

**spec says / code does (this wave):**

| Spec | Before (gap) | After |
|------|--------------|-------|
| API_DESIGN list ≡ get-by-id Plane B slug | `fetchEmployeeById` used `resolveHrmCompanyHeaderId` → LE UUID when store UUID | `resolveDirectoryQueryCompanyId` (same as directory W7-5) |
| Catalog `company_id` TEXT slug | Profile used leave-balance helper only | Explicit Plane B resolver for settings-catalogs |
| AC-ESS DynamicForm | Already in source 2026-07-19 | **must_keep** — DynamicProfileForm + testIDs |
| Nav home → Hồ sơ | `navigateToProfileRoot` | Untouched (regression) |

---

## Scope closed

1. **ESS full form** — catalog-driven DynamicProfileForm: phone self-edit, gender/address/email/mã NV display; employee_code RO (AC-ESS-02); no DOB year (BR-BDAY-01).
2. **Plane B FIX** — profile GET + catalog query use `resolveDirectoryQueryCompanyId`; membership recover when SecureStore holds LE UUID.
3. **PATCH ESS** — `patchEmployeeCustomFields` + honest 403 UX residual path kept; BE phone allowlist present.
4. **Navigation** — Tab **Hồ sơ** + Dashboard `navigateToProfileRoot`; directory remains colleague detail (J-MOB-16) — not overwrite self profile.
5. **@CODE-MEMORY** APPEND on `hrmEmployees.ts`, `ProfileScreen.tsx`, catalog/form helpers.
6. **Tests** — 51/51 PASS scoped.

**must_keep (untouched):** directory Plane B GWC · dual-plane attendance write UUID · leave-doc/bal · avatar J-AVT path.

---

## Verification

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/dynamicProfileForm.test.ts \
  src/utils/__tests__/profileEssFields.test.ts \
  src/integrations/__tests__/hrmEmployeeFieldsCatalog.test.ts \
  src/components/profile/__tests__/dynamicProfileFormUx.test.ts \
  src/integrations/__tests__/hrmEmployees.test.ts \
  src/features/profile/__tests__/profileScreenPlaneB.test.ts \
  src/integrations/__tests__/companyWireScope.test.ts
→ 7 files / 51 tests PASS
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployees.ts` | FIX Plane B GET query; CODE-MEMORY |
| `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx` | FIX catalog Plane B; CODE-MEMORY APPEND |
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeFieldsCatalog.ts` | CODE-MEMORY APPEND |
| `apps/mobile/hrm-mobile/src/utils/dynamicProfileForm.ts` | CODE-MEMORY work_item bump |
| `apps/mobile/hrm-mobile/src/components/profile/DynamicProfileForm.tsx` | CODE-MEMORY APPEND |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmEmployees.test.ts` | Plane B UUID→holding case |
| `apps/mobile/hrm-mobile/src/features/profile/__tests__/profileScreenPlaneB.test.ts` | NEW wire assert |

---

## QA device matrix (U65 zero-seed)

| # | Persona | Path | Expect |
|---|---------|------|--------|
| 1 | `uat.nv0001@xe.vn` / `xevn-uat-2026` | Home → **Hồ sơ** (or tab) → **Thông tin** | `dynamic-profile-form` + labels SĐT / Giới tính / Mã NV |
| 2 | same | Network GET employee | `company_id=` **slug** (`holding`/…) not LE UUID |
| 3 | same | Mã nhân viên | Not editable (AC-ESS-02) |
| 4 | same | Edit SĐT → **Lưu** | PATCH `/employees/:id` → **202** `HRM-EMP-202` → reload value; F5 sticks (AC-ESS-01) |
| 5 | same | Tabs **Công việc** / **Tài liệu** | J-MOB-17 regression — no crash |
| 6 | same | Avatar pick | J-AVT path still works |
| 7 | Directory | Tap colleague | Still J-MOB-16 detail (not self ESS) |

**APK:** HOLD_DEPLOY — last qa-device SHA `5908260E…` (directory build) may **not** include this Plane B profile FIX. Rebuild before device gate if Hermes/source lag.

**cấm:** seed `custom_fields`; Phase1/PROD claim.

---

## Residual

- Device L2.5 on binary with this FIX — **required** before TODO `[x]`.
- Dedicated `GET …/employee-fields` — still interim settings-catalogs (spec interim; not invent).
- AC-ESS-03 web parity field-set — soft check vs web ESS if available on device session.
- No Phase1 / PROD claim.

---

## Handoff

- **completion_report:** W7-6 MOB-12 ESS form + Plane B profile GET/catalog FIX; vitest 51/51; READY_FOR_QA.
- **next_owner:** `qa-device`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-profile-full-01-20260728.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W7-MOB-PROFILE-FULL-01-QA
from_role: pm
to_role: qa-device
entry_criteria: L0 stack or pilot nip.io; U65 zero-seed; APK includes 2026-07-28 Profile Plane B (rebuild if SHA still 5908260E directory-only); read docs/qa/evidence/pcomp-w7-mob-profile-full-01-20260728.md
exit_criteria: J-MOB-12 — login uat.nv0001@xe.vn → Hồ sơ → Thông tin; dynamic-profile-form + SĐT/Giới tính/Mã NV; mã NV RO; edit phone → Lưu → PATCH 202 + F5 sticks; Network company_id=slug not LE UUID; J-MOB-17 tabs regression; evidence update PASS_TO_PM
journeys: J-MOB-12 · J-MOB-17
cấm: seed; Phase1/PROD; PASS only vitest
evidence_path: docs/qa/evidence/pcomp-w7-mob-profile-full-01-qa-20260728.md
```
