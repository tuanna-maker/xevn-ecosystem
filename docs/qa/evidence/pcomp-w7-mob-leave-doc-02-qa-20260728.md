# PCOMP-W7-MOB-LEAVE-DOC-02-QA — device AC-LEAVE-DOC-01..03

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-DOC-02-QA` |
| **parent** | `PCOMP-W7-MOB-LEAVE-COMBO-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS** (wave) · combo **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **APK SHA-256** | `B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` (≠ `5A5F627D…`) |
| **U65** | zero-seed |
| **HOLD_DEPLOY** | yes · **NOT** Phase1/PROD |
| **build evidence** | `docs/qa/evidence/pcomp-w7-mob-leave-combo-build-20260728.md` |
| **screens** | `docs/qa/evidence/screenshots/pcomp-w7-mob-leave-combo-qa-20260728/` |

---

## Executive verdict

**PASS** — On combo APK, sick leave **cannot** leave Bước 2 without attachment (`leave-create-next` **enabled=false**, content-desc «Tiếp tục — cần đính kèm giấy tờ y tế»). Annual advances to Bước 3 without attach. Detail shows `leave-attachment-open` / «Xem / tải giấy tờ»; tap opens external Chrome (hierarchy left app).

Closes prior **2026-07-19 FAIL** where stale APK advanced sick → Bước 3 without attach.

**Note:** Full sick multipart upload → Gửi on this session **not automated** (system file picker). Gate AC (MUST stay Bước 2) + DOC-02/03 covered; residual optional manual attach E2E.

---

## AC matrix

| AC | Requirement | Result | Evidence |
|----|-------------|--------|----------|
| **AC-LEAVE-DOC-01** (gate) | Sick → Bước 2 → Tiếp tục **without** attach → stay Bước 2 | **PASS** | `05-sick-selected.png` / `06-after-next-no-attach.png` · XML: still **Bước 2 · Loại nghỉ**; `leave-create-next` **enabled="false"**; picker `leave-attachment-picker` + «Bắt buộc…» |
| **AC-LEAVE-DOC-01** (full attach→Gửi) | Attach valid `/api/hrm/files/…` → Gửi | **NOT EXECUTED** | File picker not automatable this session — residual P2 manual |
| **AC-LEAVE-DOC-02** | Annual OK without attach | **PASS** | `07-annual-selected.png` → `08-annual-after-next.png` **Bước 3 · Xác nhận** · loại **Nghỉ phép năm** |
| **AC-LEAVE-DOC-03** | Detail `leave-attachment-open` | **PASS** | `10-detail.png` «Xem / tải giấy tờ» · `11-after-open.png` Chrome welcome (external open) |

---

## XML proofs (session `%TEMP%\hrm-leave-combo-20260728`)

### Sick block (`06-after-next-no-attach.xml`)

- ids: `leave-attachment-picker`, `leave-attachment-add`, `leave-create-next`
- `leave-create-next`: `enabled="false"` · `content-desc="Tiếp tục — cần đính kèm giấy tờ y tế"`
- texts include **Bước 2 · Loại nghỉ**, **Nghỉ ốm**, **+ Đính kèm ảnh/PDF**

### Annual (`08-annual-after-next.xml`)

- texts: **Bước 3 · Xác nhận** · **Nghỉ phép năm**
- `leave-create-next` **enabled="true"**

### Detail (`10-detail.xml`)

- `resource-id="leave-attachment-open"`
- text **Xem / tải giấy tờ** on existing Nghỉ ốm row (U65 — existing list row, no seed)

---

## Click path

Same login as BAL-02. From wizard after BAL chip assert:

1. Tiếp tục → Bước 2 → select **Nghỉ ốm** → assert picker + disabled Tiếp tục → tap Tiếp tục → **still Bước 2**
2. Select **Nghỉ phép năm** → Tiếp tục → **Bước 3**
3. Back to list → open **Nghỉ ốm** detail → **Xem / tải giấy tờ** → external open

Helper (session): `scripts/tmp-pcomp-w7-leave-combo-device-20260728.mjs`

---

## Residual

| ID | Sev | Notes |
|----|-----|-------|
| **R-DOC-UPLOAD-E2E** | P2 | Manual or instrumented attach PDF → Gửi → new detail open — not required to PASS gate AC this wave |
| Chrome first-run | info | Emulator Chrome welcome after open — proves external intent fired |

**cấm:** seed; Phase1/PROD claim.

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-LEAVE-DOC-02-QA
from_role: qa-device
to_role: pm
ack_status: PASS
evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-doc-02-qa-20260728.md
completion_report: |
  DOC-02 device PASS on combo SHA B9DCC6BC…. AC-LEAVE-DOC-01 gate PASS
  (sick Tiếp tục disabled / stay Bước 2); DOC-02 annual → Bước 3 without
  attach; DOC-03 leave-attachment-open → external Chrome. Full sick upload+Gửi
  not automated (picker). U65 · HOLD_DEPLOY.
next_owner: pm
```
