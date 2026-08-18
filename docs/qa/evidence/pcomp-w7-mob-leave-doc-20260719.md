# PCOMP-W7-MOB-LEAVE-DOC — Leave medical upload (W7-3)

**Date:** 2026-07-19  
**Role:** dev-mobile  
**ack_status:** READY_FOR_QA  
**Journey:** UC-HRM-MOB-06b / AC-LEAVE-DOC-01..03 (SRS names J-MOB-11 for leave-doc; journey map J-MOB-11 is home portal — QA use leave create→detail attach path)

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/hrm/MOBILE_W7_SRS_DELTA.md` | §4.2 UC-HRM-MOB-06b — BR-LEAVE-DOC-01, AC-LEAVE-DOC-01..03 |
| `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | §3.5 leave-attachment upload · §5.2 flow · MIME/10MB/max 3 |
| `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` | §3 `attachment_url` TEXT SoT · VAL-W7-LATT-* |
| `docs/hrm/SRS_MOBILE.md` | UC-HRM-MOB-06 create leave baseline |

**spec says / code does**

| Topic | Spec | Implementation |
|-------|------|----------------|
| Required types | SRS `{sick, medical, maternity}` · DATA `{sick, medical, maternity_medical}` | `LEAVE_DOC_REQUIRED_TYPES` union + catalog `LVT_02`; form chips stay web-parity (`sick`/`maternity`) |
| Submit body | SRS `attachment_urls[]` | Wire **`attachment_url`** (Nest DTO + `forbidNonWhitelisted`) — first uploaded URL of ≤3 |
| Upload feature | TechSpec `leave-attachment` | `POST /files/upload?feature=leave-attachment` |
| Detail | Link open | `LeaveRequestDetailScreen` → `Linking.openURL` · `testID=leave-attachment-open` |

---

## Closed scope

1. **Create flow:** `CreateLeaveRequestScreen` step 2 shows `LeaveAttachmentPicker` when `leaveTypeRequiresAttachment`; step-next + submit blocked without uploaded URL (D2).
2. **Upload:** `uploadLeaveAttachmentFile` → multipart `feature=leave-attachment`; MIME jpeg/png/webp/pdf; ≤10MB.
3. **Picker UX:** Alert on invalid MIME/size; remove/add targets ≥44px; max 3 files.
4. **Detail:** Owner/manager open attachment via secondary button.
5. **@CODE-MEMORY** on leave attachment utils/picker/create/detail/upload.
6. **Tests:** `leaveAttachment.test.ts` (5) · `hrmFileUpload.test.ts` leave URL · `leaveDocUx.test.ts` (4).

---

## Verify

```text
pnpm test:hrm-mobile -- --run src/utils/__tests__/leaveAttachment.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/components/ui/__tests__/leaveDocUx.test.ts
→ 3 files / 16 tests PASS (2026-07-19)
```

Full suite: `pnpm test:hrm-mobile` → **79 files / 449 tests PASS** (2026-07-19).

---

## Residual / QA focus (U65 browser/device — no seed)

| AC | Device path |
|----|-------------|
| AC-LEAVE-DOC-01 | Login ESS → Tạo đơn nghỉ → loại **Nghỉ ốm** → đính kèm PDF/ảnh → Gửi → list→detail → **Xem / tải giấy tờ** |
| AC-LEAVE-DOC-02 | Loại **Nghỉ phép năm** → không bắt buộc file → submit OK |
| AC-LEAVE-DOC-03 | Cross-nav list → detail → open attachment |

**cấm:** seed inbox/leave; claim Phase1/PROD.

**Persona:** `uat.nv0001@xe.vn` / pilot password (device) or local ESS account.

---

## Files touched

- `apps/mobile/hrm-mobile/src/utils/leaveAttachment.ts`
- `apps/mobile/hrm-mobile/src/utils/leaveAttachmentPicker.ts`
- `apps/mobile/hrm-mobile/src/components/ui/LeaveAttachmentPicker.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/LeaveRequestDetailScreen.tsx`
- `apps/mobile/hrm-mobile/src/integrations/hrmFileUpload.ts` (@CODE-MEMORY-CHANGE)
- `apps/mobile/hrm-mobile/src/utils/__tests__/leaveAttachment.test.ts`
- `apps/mobile/hrm-mobile/src/components/ui/__tests__/leaveDocUx.test.ts`

---

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa-device** (preferred) or **qa**
- `pm_dispatch_hint`: PCOMP-W7-MOB-LEAVE-DOC device retest AC-LEAVE-DOC-01..03
