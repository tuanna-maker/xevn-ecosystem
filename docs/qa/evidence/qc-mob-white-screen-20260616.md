# QC Gate — MOB-P0-WHITE-SCREEN-01 (2026-06-16)

| Field | Value |
|---|---|
| work_item_id | `MOB-P0-WHITE-SCREEN-01-QC-GATE` |
| from_role | `pm` |
| to_role | `qc` |
| gate_scope | Startup blank/white-screen fix on latest APK lineage for mobile login boot path |
| evidence_inputs | `docs/qa/evidence/mob-white-screen-20260616-qa-retest.md`; `docs/qa/evidence/mob-white-screen-20260616.md`; `docs/qa/evidence/mob-white-screen-device-20260616-arm64-followup.md` |
| mobile_api_base | `https://api.dev.xe.vn.nip.io` (context reference for evidence-pack format; startup gate itself is render-focused) |

ack_status: PASS_TO_PM

## Command table (reproducibility)

| Command | Exit | Result |
|---|---:|---|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-white-screen-20260616-qa-retest.md` | 1 | FAIL (missing portal/api base, L2.5 journey row, residual section, ack label format) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-white-screen-20260616.md` | 1 | FAIL (missing work_item marker format, command table, portal/api base, journey L2.5, matrix, residual) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-white-screen-device-20260616-arm64-followup.md` | 1 | FAIL (missing command table exit codes, portal/api base, journey L2.5, matrix, residual) |
| `Get-FileHash apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk -Algorithm SHA256` | 0 | Current APK SHA256 = `49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D` |

## L2.5 journey audit (U19)

| Journey | Expected | Evidence status |
|---|---|---|
| `J-MOB-01` Login -> scope select -> home | App must render login/home (no persistent blank screen) on target APK/device slice | Partial PASS only on emulator for SHA `49B9...` (QA retest). Not validated on physical arm64 for latest lineage claim. |

Reference SoT: `docs/program/PROGRAM_JOURNEY_MAP.md` (`J-MOB-01`).

## L2.5 journey matrix (PASS rows)

| Journey | Source evidence | Status |
|---|---|---|
| `J-MOB-01` | `docs/program/PROGRAM_JOURNEY_MAP.md` + `docs/qa/evidence/qc-p1-hrm-h11-closeout-20260606.md` | **PASS** (baseline journey health already closed) |
| `J-MOB-01` (this gate, latest lineage) | `docs/qa/evidence/mob-white-screen-20260616-qa-retest.md` + `docs/qa/evidence/mob-white-screen-device-20260616-arm64-followup.md` | **FAIL** (lineage split; final arm64 QA-device retest missing) |

## Technical assessment

1. Dev evidence introduces top-level error boundary and retry UX, which is directionally correct against blank-screen risk.
2. QA retest confirms non-blank startup only for APK SHA `49B95D...` on emulator `emulator-5554`.
3. Arm64 follow-up claims new lineage SHA `1AAF2349...` and ABI fix, but no QA-device retest evidence is attached for that lineage.
4. Artifact-level compliance is not met: all three input files fail `verify:qc:evidence-pack`.

## Classification

- **Product risk:** medium (functional mitigation exists but latest arm64 lineage is not independently retested by QA on device).
- **Process risk:** high (evidence pack integrity check fails for all upstream artifacts).

## QC decision

**Verdict: NO-GO**

Reason:
- Gate cannot be promoted on latest APK lineage because evidence is split across two SHA lines (`49B9...` emulator retest vs `1AAF...` arm64 packaging fix) without a single QA PASS artifact on the final distributable.
- Mandatory evidence-pack compliance failed (`verify:qc:evidence-pack` exit 1 on all referenced inputs).

## Residual

1. `R-MOB-WS-01` (owner: `qa-device`): Install and retest the final arm64-capable APK lineage; capture cold-start screenshots + logcat + package SHA in one QA evidence file.
2. `R-MOB-WS-02` (owner: `qa`): Rewrite QA evidence to pass `verify:qc:evidence-pack` (journey row, residual section, command exits, api base/portal context).
3. `R-MOB-WS-03` (owner: `pm`): Re-dispatch QC gate only after QA evidence pack verification returns exit 0 for promoted evidence path.

## completion_report

- Closed: QC audit completed for startup blank-screen fix artifacts and lineage consistency check.
- Not closed: release quality gate for this work item; promotion blocked due to missing final-lineage QA-device PASS and failed evidence-pack validation.

## next_owner

`pm`

## next_dispatch_prompt

```text
Role: qa-device
work_item_id: MOB-P0-WHITE-SCREEN-01-QA-DEVICE-ARM64-R5
from_role: pm
to_role: qa-device
entry_criteria:
- Build/distributable APK selected as final candidate for promotion (single SHA only).
- Prior QC NO-GO noted in docs/qa/evidence/qc-mob-white-screen-20260616.md.
tasks:
1) Install final APK on physical arm64 device and record package version + SHA256.
2) Execute cold-start matrix (fresh install, pm clear, relaunch) and confirm no persistent blank/white screen.
3) Capture screenshot set + logcat around launch and map to J-MOB-01 startup path.
4) Produce QA evidence that passes: pnpm run verify:qc:evidence-pack -- --evidence <new-file>.
exit_criteria:
- PASS/FAIL verdict on final single-SHA APK with reproducible commands and artifacts.
- ack_status READY_FOR_QC with evidence_path.
```

## evidence_path

`docs/qa/evidence/qc-mob-white-screen-20260616.md`

## ack_status

`PASS_TO_PM`
