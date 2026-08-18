# QA-MOB-REMOVE-NIPIO-01 — Retest after D-MOB-REMOVE-NIPIO-01

**Date:** 2026-07-28  
**Role:** qa  
**Prior:** `docs/qa/evidence/d-mob-remove-nipio-01-20260728.md` (READY_FOR_QA)  
**Locks:** U65 zero-seed · HOLD_DEPLOY · no perimeter PASS · no APK promote · no Phase1/PROD  
**ack_status:** **PASS_TO_PM**

## Verdict matrix

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | `rg -n "nip\.io\|14-225-217-232" apps/mobile` → zero | **PASS** (rg exit 1, no lines; android assets also clean) |
| 2 | Host SoT = local and/or `http://14.225.217.232:3001` — no nip.io defaults | **PASS** (see §Host SoT) |
| 3 | Static/config + unit enough; no device APK promote | **PASS** (vitest 7 files / **59/59**) |
| 4 | Evidence this file | **PASS** |
| 5 | No seed / no Phase1·PROD claim | **PASS** |

## Grep gate (QA re-run)

```text
rg -n "nip\.io|14-225-217-232" apps/mobile
→ (no matches) EXIT:1

rg -n "nip\.io|14-225-217-232" apps/mobile/hrm-mobile/android
→ (no matches) EXIT:1
```

Note: work-item id strings like `d-mob-remove-nipio-01` in CODE-MEMORY `LastVerified` paths are **not** hostname leftovers (`nip\.io` pattern does not match).

## §Host SoT

| Surface | Value | Status |
|---------|-------|--------|
| `.env.example` (active) | `http://127.0.0.1:28001` | local SoT |
| `.env.example` (comment) | `http://14.225.217.232:3001` | VPS/dev documented |
| `src/config/pilotApiBase.ts` | `RELEASE_PILOT_HRM_API_BASE_URL = 'http://14.225.217.232:3001'` | release/non-__DEV__ fallback |
| `eas.json` preview + production | `http://14.225.217.232:3001` | EAS embed |
| `scripts/build-apk.cjs` default | `http://14.225.217.232:3001` | local APK embed default |
| `hrmApiClient.getDefaultBaseUrl` `__DEV__` | `http://localhost:3001` | local Metro/dev |
| Unit fixtures | `http://127.0.0.1:28001` | no nip.io / no `:8088` API origin |

**Cấm adhered:** no `*.nip.io` default; portal `:8088` not used as HRM API origin (comments only).

## Unit tests (QA re-run)

```text
pnpm exec vitest run \
  src/integrations/__tests__/hrmApiClient.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/integrations/__tests__/hrmEmployees.test.ts \
  src/integrations/__tests__/hrmEmployeeDirectory.test.ts \
  src/integrations/__tests__/hrmTeamDirectory.test.ts \
  src/utils/__tests__/leaveAttachment.test.ts \
  src/utils/__tests__/resolveHrmAvatarUrl.test.ts
```

**Result:** 7 files / **59/59 passed** (duration ~1s).

Assert: `getDefaultBaseUrl()` without env outside `__DEV__` → `RELEASE_PILOT_HRM_API_BASE_URL` (`http://14.225.217.232:3001`).

## Residual (non-blocking for this WI)

| ID | Severity | Note |
|----|----------|------|
| HOLD_DEPLOY | info | No `android:apk:qa-device` this wave; field binary needs rebuild before device UAT against new defaults. |
| ASSET-PAD | info | Prior Hermes scrub length-pad `///` — next `build-apk` / EAS regenerates clean string (source already clean). |
| CLEARTEXT | P3 | Release manifest cleartext vs HTTP VPS — follow-up only if QA uses non-debug binary on device. |

## Not claimed

- Device APK promote / J-MOB device UAT
- Phase 1 DONE / PROD-READY
- Perimeter nip.io PASS
- Program QC GO

## Handoff

- **completion_report:** Mobile `apps/mobile` clean of `nip.io` / dashed IP host; SoT = local `127.0.0.1:28001` + VPS `14.225.217.232:3001`; vitest 59/59; HOLD_DEPLOY residual only.
- **next_owner:** pm → qc (`QC-MOB-REMOVE-NIPIO-01`) for lane GWC parity with FE/OPS
- **ack_status:** PASS_TO_PM

## next_dispatch_prompt

```text
work_item_id: QC-MOB-REMOVE-NIPIO-01
from_role: pm
to_role: qc
lane: governance

## Context
QA-MOB-REMOVE-NIPIO-01 PASS_TO_PM. FE+OPS already QC GWC on remove-nipio. Sponsor: no nip.io in source; only local + VPS DEV. HOLD_DEPLOY. U65. No APK promote / Phase1/PROD.

## read_first
1. docs/qa/evidence/qa-mob-remove-nipio-01-20260728.md
2. docs/qa/evidence/d-mob-remove-nipio-01-20260728.md

## entry_criteria
QA PASS evidence above (grep zero + host SoT + vitest 59/59).

## exit_criteria
1. Audit QA evidence vs sponsor lock (no nip.io; local + http://14.225.217.232:3001 only).
2. GO WITH CONDITIONS or GO for mobile remove-nipio lane; residual HOLD_DEPLOY / APK rebuild noted.
3. Evidence: docs/qa/evidence/qc-mob-remove-nipio-01-20260728.md
4. ack_status PASS_TO_PM

## cấm
seed; perimeter nip.io PASS; force device UAT; Phase1/PROD claim
```
