# PCOMP-W7-MOB-LEAVE-DOC-02 — block step-next without valid attachment

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-DOC-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `pm` → BUILD → `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — APK rebuild required before device AC |
| **must_keep** | toast / directory / profile GWC — untouched |
| **NOT** | Phase1 / PROD claim |

---

## Context (FAIL reopen)

`docs/qa/evidence/pcomp-w7-mob-leave-doc-qa-20260719.md` — AC-LEAVE-DOC-01 FAIL on stale APK (2026-06-16): sick picker visible but **Tiếp tục without upload advanced to Bước 3**. Vitest was source-only and did not gate product `goNext`.

---

## Product gate fix

| Change | Detail |
|--------|--------|
| `leaveAttachment.ts` | `isValidLeaveAttachmentUploadedUrl` — only `/api/hrm/files/…` or https containing that path; reject `file:` / `content:` / `blob:` |
| | `leaveCreateStep1NextBlocked` — product helper for step === 1 (Bước 2) Tiếp tục |
| | `leaveAttachmentSubmitBlocked` / resolve URL helpers use valid-URL filter |
| `CreateLeaveRequestScreen.tsx` | `nextDisabled` + `goNext` call `leaveCreateStep1NextBlocked` (not weak non-empty string) |
| Tests | Blocked next (empty / local pick / file:// fake URL) + happy path mock `/api/hrm/files/...` |

### Spec

- SRS: `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.2 UC-HRM-MOB-06b · BR-LEAVE-DOC-01 · AC-LEAVE-DOC-01..03
- Data: `MOBILE_W7_DATA_CONTRACTS.md` §3 · VAL-W7-LATT-02
- ≤10 MB / MIME: `validateLeaveAttachment` unchanged (`LEAVE_ATTACHMENT_MAX_BYTES`)

---

## Vitest (source)

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/leaveAttachment.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/components/ui/__tests__/leaveDocUx.test.ts
→ 3 files / 22 tests PASS (2026-07-28)
```

| Case | Expected |
|------|----------|
| sick / maternity, no upload | `leaveCreateStep1NextBlocked` message; `nextDisabled`; no advance |
| sick + `uploadedUrl: file://…` | still blocked |
| sick + mock `/api/hrm/files/holding/…` | advance OK |
| annual, no attach | advance OK (AC-LEAVE-DOC-02) |
| file > 10 MB | `validateLeaveAttachment` contains `10 MB` |

---

## Expected device (after BUILD)

| AC | Requirement |
|----|-------------|
| **AC-LEAVE-DOC-01** | Nghỉ ốm → Bước 2 → Tiếp tục **without** attach → stay Bước 2; `leave-create-next` disabled; Alert «Đơn nghỉ y tế cần đính kèm…»; then attach PDF/ảnh → Gửi → list→detail → Xem/tải |
| **AC-LEAVE-DOC-02** | Annual → Tiếp tục/Gửi OK without attachment |
| **AC-LEAVE-DOC-03** | List → detail → `leave-attachment-open` |

**cấm:** seed; claim on June/stale APK; Phase1/PROD.

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **PCOMP-W7-MOB-LEAVE-DOC-02-BUILD** | P0 | dev-mobile | `BUILD_TARGET=qa-device` → publish APK + SHA; bundle markers `leaveAttachmentSubmitBlocked` + `leaveCreateStep1NextBlocked` |
| **AC-LEAVE-DOC device** | P0 | qa-device | Retest AC-LEAVE-DOC-01..03 on **new** APK only |

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-LEAVE-DOC-02
from_role: dev-mobile
to_role: pm
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-doc-02-20260728.md
completion_report: |
  Hardened BR-LEAVE-DOC step-1 gate: leaveCreateStep1NextBlocked + valid /api/hrm/files URL
  (reject local file://). CreateLeaveRequestScreen goNext/nextDisabled wired.
  Vitest leave-doc 22/22 PASS. HOLD_DEPLOY — no APK this wave; must_keep toast/dir/profile.
next_owner: pm -> BUILD then qa-device
next_dispatch_prompt: |
  Operate as dev-mobile BUILD then qa-device.
  work_item_id: PCOMP-W7-MOB-LEAVE-DOC-02-BUILD → PCOMP-W7-MOB-LEAVE-DOC-02 device.
  1) BUILD_TARGET=qa-device → apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk + SHA-256
     Confirm Hermes markers: leaveCreateStep1NextBlocked / leaveAttachmentSubmitBlocked / leave-create-next
  2) Install on emulator-5554 (uninstall stale first). U65: uat.nv0001@xe.vn / xevn-uat-2026 @ nip.io
  3) AC-LEAVE-DOC-01: sick → Bước 2 → Tiếp tục WITHOUT attach → MUST stay Bước 2 (disabled + Alert);
     then attach PDF/ảnh → Gửi → list→detail → Xem/tải
  4) AC-LEAVE-DOC-02: annual OK without attach
  5) AC-LEAVE-DOC-03: leave-attachment-open
  Evidence: docs/qa/evidence/pcomp-w7-mob-leave-doc-02-qa-YYYYMMDD.md
  No seed. HOLD_DEPLOY until BUILD. No Phase1/PROD.
```
