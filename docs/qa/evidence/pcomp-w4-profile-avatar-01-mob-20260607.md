# PCOMP-W4-PROFILE-AVATAR-01-MOB — Mobile avatar self-service (U50)

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-MOB`  
**Date:** 2026-06-07  
**Owner:** Dev-Mobile  
**ack_status:** `READY_FOR_QA`  
**Entry:** `docs/program/MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` §3.3

---

## Scope closed

| Deliverable | Path | AC |
|-------------|------|-----|
| Avatar URL resolver + initials | `utils/resolveHrmAvatarUrl.ts` | Relative `/api/hrm/files/…` → absolute for `Image` |
| Multipart upload (write header UUID) | `integrations/hrmFileUpload.ts` | `POST /files/upload?feature=employee-avatar&company_id={uuid}` |
| PATCH avatar_url | `integrations/hrmEmployees.ts` `patchEmployeeAvatarUrl` | Uses `hrmRequest` PATCH → `resolveHrmWriteHeaderId` |
| Profile upload UI 96pt | `components/ui/AvatarUploadField.tsx` + `ProfileScreen.tsx` | AC-AVT-MOB-01: picker → upload → PATCH |
| Shared avatar display | `components/ui/HrmAvatar.tsx` | Initials fallback when URL null |
| EmployeeRow + fetch | `integrations/hrmEmployees.ts` | `avatar_url?: string \| null` on list/get-by-id |
| Home greeting 40pt | `features/dashboard/DashboardScreen.tsx` | AC-AVT-MOB-02 |
| Leave hero image | `components/ui/LeaveHeroCard.tsx` + `LeaveRequestDetailScreen.tsx` | AC-AVT-MOB-03 |
| Vitest | `utils/__tests__/resolveHrmAvatarUrl.test.ts` (11 cases) | exit 0 |

**Dependency added:** `expo-image-picker@~15.0.7` (Expo 51).

---

## Upload flow (mobile)

```text
1. ProfileScreen → AvatarUploadField (expo-image-picker, 96pt, camera badge)
2. POST /api/hrm/files/upload?feature=employee-avatar&company_id={getAttendanceCompanyId()}
   Headers: x-company-id = resolveHrmWriteHeaderId(companyUuid, companyId)
3. PATCH /api/hrm/employees/{selfId} { avatar_url: relativeUrl }
4. resolveHrmAvatarUrl(baseUrl, url) for Image display + cache-bust after upload
```

**Validation (client):** JPEG/PNG/WebP only; max 5 MB (matches web).

---

## AC mapping

| AC-ID | Implementation |
|-------|----------------|
| AC-AVT-MOB-01 | `ProfileScreen` + `AvatarUploadField` 96pt; gallery pick; upload + PATCH; remove → PATCH null |
| AC-AVT-MOB-02 | `DashboardScreen` greeting row: `HrmAvatar` 40pt + `fetchEmployeeById` on load |
| AC-AVT-MOB-03 | `LeaveHeroCard` accepts `avatarUrl`; `Image` via `HrmAvatar` 48pt when URL present |

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm install  → expo-image-picker added
pnpm test     → 22 files, 124 tests PASS, exit 0
pnpm build    → tsc --noEmit PASS, exit 0
```

---

## QA device matrix

| Journey | Persona | Steps |
|---------|---------|-------|
| J-AVT-02 | `uat.nv0001@xe.vn` | Login → Hồ sơ → tap avatar → chọn ảnh → lưu → Home greeting shows photo → mở đơn nghỉ → hero shows photo |
| J-AVT-03 | peer NV same scope | NV A upload → NV B list/detail sees same URL within scope (after BE column live) |

**Precondition:** BE `avatar_url` column + PATCH policy (`PROFILE-AVATAR-01-BE`) deployed; HRM API `:28001` up.

**Residual (not mobile):**

- Manager viewing subordinate leave: hero uses logged-in employee avatar until leave API exposes `employee_id` + avatar on row.
- MOB-UX-04b celebrations blocked until BE URLs populated (per audit §6).

---

## Handoff

- **next_owner:** QA (+ QA-Device for J-AVT-02 on device/emulator)
- **pm_dispatch_hint:** `PCOMP-W4-PROFILE-AVATAR-01-QA` — L0 stack + J-AVT-02/03 after BE merge
