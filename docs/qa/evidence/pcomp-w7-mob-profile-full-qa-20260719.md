# PCOMP-W7-MOB-PROFILE-FULL — QA-device retest J-MOB-12 (ESS profile)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-PROFILE-FULL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` / `dev-mobile` |
| **date** | 2026-07-19 |
| **ack_status** | **BLOCKED** (waiting `PCOMP-W7-MOB-WAVE-APK-01`) |
| **device** | `emulator-5554` (cross-checked same-day qa-device session) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` (planned; not exercised on wave binary) |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake |
| **prior Dev** | `docs/qa/evidence/pcomp-w7-mob-profile-full-20260719.md` (READY_FOR_QA · Vitest 19/19) |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.5 UC-HRM-MOB-12 full · TechSpec DynamicProfileForm |

---

## Executive verdict

**BLOCKED waiting WAVE-APK** — Cannot promote device J-MOB-12 / AC-ESS-01..03 for the **2026-07-19** DynamicProfileForm wave.

1. **No published wave APK** — `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` **missing** (Glob 0; `dist/` empty). Dev READY_FOR_QA published **source + Vitest only** — no APK path/SHA.
2. **`PCOMP-W7-MOB-WAVE-APK-01` in-flight** — bus `pm -> dev-mobile | DISPATCHED` 2026-07-19T14:07:30+07:00; evidence target `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md` **not published yet** (Glob 0).
3. **Installed binary stale** — same-day qa-device (`LEAVE-DOC` / `LEAVE-BAL`): `vn.xevn.hrm.mobile` `versionName=1.0.0` · `lastUpdateTime=2026-06-16 14:20:01` — predates July PROFILE-FULL source (`DynamicProfileForm.tsx` dated 2026-07-19).
4. **Shell ENOSPC** — this qa-device turn could not re-run `adb` (hook fail-closed `ENOSPC: no space left on device`); APK absence + stale install already proven same day — no need to claim device PASS/FAIL of form UI on stale binary.

Vitest source suite **19/19 PASS** (Dev evidence) — **not** a substitute for device L2.5 (U65).

Same APK-stale class as `PCOMP-W7-MOB-LEAVE-DOC` / `PCOMP-W7-MOB-LEAVE-BAL` FAIL same day.

---

## J-MOB-12 matrix (device — blocked)

| AC / step | Expect | Device result | Notes |
|-----------|--------|---------------|-------|
| Login → **Hồ sơ** → **Thông tin** | Reach ESS profile | **BLOCKED** | Needs wave APK install |
| `dynamic-profile-form` visible | testID + labels SĐT / Giới tính / Mã NV | **BLOCKED** | Source has `testID="dynamic-profile-form"` — not in 2026-06-16 binary |
| Mã NV not editable | AC-ESS-02 | **BLOCKED** | Source `editableBy: none` — untestable on stale APK |
| Edit phone → **Lưu** → PATCH `/employees/:id` | Network call | **BLOCKED** | Wave APK required |
| 2xx → F5 sticks | AC-ESS-01 live | **BLOCKED** | Dev residual: BE `SELF_PATCH_FIELDS=['avatar_url']` → expect **HRM-EMP-403** until `PCOMP-W7-BE-PROFILE-ESS` — document as **BE residual**, not mobile shell FAIL, **after** form is on device |
| Form missing on wave APK | — | n/a | Would be **FAIL → dev-mobile** |

---

## APK gate checks (this turn)

```text
Glob **/hrm-mobile-qa-device.apk → 0 files
Glob **/apps/mobile/hrm-mobile/dist/** → 0 files
Glob **/pcomp-w7-mob-wave-apk* → 0 files

Cross-evidence (same day, same emulator):
  docs/qa/evidence/pcomp-w7-mob-leave-doc-qa-20260719.md
  docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260719.md
  → Test-Path …/hrm-mobile-qa-device.apk = False
  → dumpsys lastUpdateTime=2026-06-16 14:20:01
```

Bus:

```text
## 2026-07-19T14:07:30+07:00 | pm -> dev-mobile | DISPATCHED PCOMP-W7-MOB-WAVE-APK-01
- ONE APK: leave-doc gate + LeaveBalanceChip; supersedes duplicate APK builds
- evidence_target: docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md
```

**Note for WAVE-APK fold-in:** PROFILE-FULL (`DynamicProfileForm` / `profile-ess-save`) must be included in the **same** wave APK as leave-doc + LeaveBalanceChip — otherwise J-MOB-12 remains BLOCKED after WAVE-APK publish.

---

## Source readiness (not device PASS)

| Check | Result |
|-------|--------|
| Dev Vitest DynamicProfileForm / ESS / catalog | 19/19 PASS (Dev evidence 2026-07-19) |
| `DynamicProfileForm.tsx` `testID=dynamic-profile-form` | Present in workspace source |
| `profile-ess-save` | Present |
| BE self phone PATCH | Dev residual → `PCOMP-W7-BE-PROFILE-ESS` / expand `SELF_PATCH_FIELDS` |

---

## Residual

| Item | Owner | Priority |
|------|-------|----------|
| Publish `hrm-mobile-qa-device.apk` + SHA-256 including PROFILE-FULL + leave-doc + LeaveBalanceChip | **dev-mobile** (`PCOMP-W7-MOB-WAVE-APK-01`) | P0 |
| Free disk (ENOSPC) so qa-device can adb install / uiautomator | **devops** / local host | P0 ops |
| After install: retest J-MOB-12 matrix above | **qa-device** | P0 |
| Live PATCH phone 202 (or document honest 403 UX) | **dev-be** | P1 (not mobile FAIL if form present + 403 UX) |

---

## Handoff

- **ack_status:** `BLOCKED` (waiting WAVE-APK)
- **completion_report:** Device J-MOB-12 not executable — wave APK unpublished; install still 2026-06-16 stale. Source READY_FOR_QA acknowledged; no UF 🟢.
- **next_owner:** `pm` → ensure `PCOMP-W7-MOB-WAVE-APK-01` folds PROFILE-FULL; then re-dispatch **qa-device**
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-profile-full-qa-20260719.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W7-MOB-WAVE-APK-01 (fold PROFILE-FULL) → then PCOMP-W7-MOB-PROFILE-FULL retest
from_role: pm
to_role: dev-mobile (if APK not yet published) OR qa-device (after APK path+SHA)
entry_criteria: BUILD_TARGET=qa-device; include DynamicProfileForm + leave-doc + LeaveBalanceChip; publish apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk + SHA-256 in docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md; free disk if ENOSPC
exit_criteria (qa-device): adb install -r wave APK; login uat.nv0001@xe.vn → Hồ sơ → Thông tin; assert dynamic-profile-form + SĐT/Giới tính/Mã NV; mã NV RO; edit phone → Lưu → PATCH /employees/:id; 2xx+F5 OR document HRM-EMP-403 as BE residual; U65 zero-seed
evidence_path: docs/qa/evidence/pcomp-w7-mob-profile-full-qa-20260719.md (update) OR *-retest-*.md
cấm: seed; Phase1/PROD claim
```
