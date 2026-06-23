# PCOMP-W7-MOB-BATCH — W7 mobile leave-doc + profile-full

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH` |
| **date** | 2026-06-09 |
| **owner** | dev-mobile |
| **ack_status** | **READY_FOR_QA** |
| **spec** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.2, §4.5 · `MOBILE_W7_DATA_CONTRACTS.md` §3, §7 |

## Scope closed

### PCOMP-W7-MOB-LEAVE-DOC (W7-3 · J-MOB-11)

- `leaveAttachment.ts` — BR-LEAVE-DOC-01 types (`sick`, `maternity`), MIME/size validation, submit guard.
- `hrmFileUpload.ts` — `uploadLeaveAttachmentFile` + `buildLeaveAttachmentUploadUrl` (`feature=leave-attachment`, holding slug query + UUID write header).
- `LeaveAttachmentPicker.tsx` — step 2 wizard UI when medical leave selected (max 3 files).
- `CreateLeaveRequestScreen` — upload before submit; POST body includes `attachment_url` (Phase 1 single column per ADR D-W7-01).
- `LeaveRequestDetailScreen` — «Xem / tải giấy tờ» opens resolved file URL (`testID=leave-attachment-open`).

### PCOMP-W7-MOB-PROFILE-FULL (W7-6 · MOB-12 / J-MOB-12)

- `profileEssFields.ts` — `custom_fields` phone/gender/address sections; HR role gate for full PATCH.
- `ProfileScreen` — extended info tab; employees self-edit avatar only (HR form for `full_name`/`job_title_key`); Vietnamese HR contact note.
- `buildProfileInfoSections` delegates to personal ESS sections.

### PCOMP-W7-MOB-DIRECTORY (W7-5)

- **No code delta** — already delivered: `TeamDirectoryScreen`, `hrmTeamDirectory.ts` `view=directory` + page_size=100 pagination (`mob-w7-5-directory-pagesize-fix-20260609.md`, `mob-ux-08-team-20260609.md`).

## Tests

```text
pnpm test (apps/mobile/hrm-mobile) — 77 files, 429/429 PASS
pnpm run type-check — PASS
```

New specs: `leaveAttachment.test.ts`, `profileEssFields.test.ts`, `hrmFileUpload.test.ts` (+2), `profileTabs.test.ts` (+1).

## Residual (QA / dev-be)

| Item | Owner | Note |
|------|-------|------|
| BE `attachment_url` column + DTO on `POST /attendance/leave-requests` | dev-be | Mobile sends field; Nest whitelist may strip until `PCOMP-W7-BE-LEAVE-DOC` |
| PDF picker native | dev-mobile follow-up | `expo-document-picker` optional lazy require — image path works today |
| Self PATCH `phone_number` via catalog | dev-be | Policy still `avatar_url` only on self (`employee-update-policy.ts`) — profile shows read-only phone |
| Device J-MOB-11 / J-MOB-12 | qa-device | Fresh qa-device APK after PM dispatch |

## Journeys for QA

| Journey | Account | Check |
|---------|---------|-------|
| J-MOB-11 | `uat.nv0001@xe.vn` | Create sick leave → attach image → detail shows attachment link |
| J-MOB-12 | `uat.nv0001@xe.vn` | Profile → Thông tin shows phone/gender when seeded in `custom_fields` |
| J-MOB-16 | `uat.nv0002@xe.vn` | Đội nhóm list ≥1 row (regression) |

## Files touched

- `apps/mobile/hrm-mobile/src/utils/leaveAttachment.ts`
- `apps/mobile/hrm-mobile/src/utils/leaveAttachmentPicker.ts`
- `apps/mobile/hrm-mobile/src/utils/profileEssFields.ts`
- `apps/mobile/hrm-mobile/src/integrations/hrmFileUpload.ts`
- `apps/mobile/hrm-mobile/src/components/ui/LeaveAttachmentPicker.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/LeaveRequestDetailScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx`
- `apps/mobile/hrm-mobile/src/utils/profileTabs.ts`
- `apps/mobile/hrm-mobile/src/integrations/hrmEmployees.ts`
