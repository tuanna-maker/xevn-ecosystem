# PCOMP-W7-MOB-LEAVE-COMBO-QA — BAL-02 + DOC-02 one APK

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-COMBO-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **APK SHA-256** | `B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` |
| **≠** | `5A5F627D…` |
| **device** | `emulator-5554` |
| **account** | `uat.nv0001@xe.vn` |
| **U65 / HOLD_DEPLOY** | yes · NOT Phase1/PROD |

## Wave verdicts

| Wave | work_item | Verdict | Evidence |
|------|-----------|---------|----------|
| 1 | `PCOMP-W7-MOB-LEAVE-BAL-02-QA` | **PASS** | `pcomp-w7-mob-leave-bal-02-qa-20260728.md` |
| 2 | `PCOMP-W7-MOB-LEAVE-DOC-02-QA` | **PASS** | `pcomp-w7-mob-leave-doc-02-qa-20260728.md` |

Screens (shared): `docs/qa/evidence/screenshots/pcomp-w7-mob-leave-combo-qa-20260728/`

## One-line

Combo APK device: chip **8/12 năm 2026** · sick next **blocked** · annual → Bước 3 · detail **Xem/tải** opens.

## Residual

- Optional: manual sick multipart upload → Gửi (picker automation gap)
- AC-LEAVE-BAL-02 approve-refresh not in this combo scope

```yaml
ack_status: PASS_TO_PM
next_owner: pm
next_dispatch_prompt: |
  Both leave device waves PASS on SHA B9DCC6BC…. Update TODO [x] for
  PCOMP-W7-MOB-LEAVE-BAL-02 + LEAVE-DOC-02 if matrix allows; HOLD_DEPLOY;
  optional QC spot or residual R-DOC-UPLOAD-E2E. No Phase1/PROD.
```
