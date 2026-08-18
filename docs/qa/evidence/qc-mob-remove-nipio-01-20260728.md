# QC-MOB-REMOVE-NIPIO-01 — Gate mobile remove nip.io (slice only)

**Date:** 2026-07-28  
**Role:** qc  
**work_item_id:** QC-MOB-REMOVE-NIPIO-01  
**Upstream:** QA-MOB-REMOVE-NIPIO-01 · D-MOB-REMOVE-NIPIO-01  
**Sibling GWC:** QC-FE-REMOVE-NIPIO-01 · QC-OPS-REMOVE-NIPIO-01  
**Locks:** U65 zero-seed · HOLD_DEPLOY · no perimeter PASS · no APK promote · no Phase1/PROD  
**decision:** **GO WITH CONDITIONS** (mobile remove-nipio lane only)  
**ack_status:** **PASS_TO_PM**

## Scope adjudicated

| In scope | Out of scope (not this GO) |
|----------|----------------------------|
| `apps/mobile` source + config purge of `nip.io` / hyphen DNS `14-225-217-232` | Phase 1 DONE / PROD-READY |
| Host SoT = local `127.0.0.1:28001` + VPS `http://14.225.217.232:3001` | Device APK promote / J-MOB device UAT |
| Unit gate (vitest 59/59 cited by QA) | Program QC GO / perimeter nip.io PASS |
| HOLD_DEPLOY residual explicit | Force `android:apk:qa-device` this wave |

**NOT Phase 1 DONE. NOT PROD-READY.**

## Evidence pack / process

| Check | Result |
|-------|--------|
| QA evidence readable | **PASS** `docs/qa/evidence/qa-mob-remove-nipio-01-20260728.md` |
| Dev evidence readable | **PASS** `docs/qa/evidence/d-mob-remove-nipio-01-20260728.md` |
| CRUD/J-* minigate pack | **N/A** — host-scrub / config slice (same ruling as OPS/FE remove-nipio) |
| Seed in evidence | **None** (U65) |
| Perimeter / nip.io PASS claimed | **None** (cấm adhered) |

## Exit criteria audit

| # | Criterion | QC result | Independent evidence |
|---|-----------|-----------|----------------------|
| 1 | Audit QA vs sponsor lock (no nip.io; local + `http://14.225.217.232:3001` only) | **PASS** | QC re-ran `rg -n "nip\.io\|14-225-217-232" apps/mobile` → no matches, EXIT:1. Host SoT spot-check § below. |
| 2 | GO WITH CONDITIONS or GO; residual HOLD_DEPLOY / APK rebuild | **GWC** | Conditions table |
| 3 | This evidence path | **PASS** | this file |
| 4 | ack PASS_TO_PM | **PASS** | below |

## Independent QC audit

### 1) Grep `apps/mobile`

```text
rg -n "nip\.io|14-225-217-232" apps/mobile
→ (no matches) EXIT:1
```

**PASS** — aligns QA. Work-item path strings (`*-nipio-*` in CODE-MEMORY) are not hostname leftovers.

### 2) Host SoT (sponsor lock)

| Surface | Observed | Status |
|---------|----------|--------|
| `.env.example` active | `http://127.0.0.1:28001` | local SoT |
| `.env.example` comment | `http://14.225.217.232:3001` | VPS/dev documented |
| `src/config/pilotApiBase.ts` | `RELEASE_PILOT_HRM_API_BASE_URL = 'http://14.225.217.232:3001'` | release fallback |
| `eas.json` preview + production | `http://14.225.217.232:3001` | EAS embed |
| `scripts/build-apk.cjs` default | `http://14.225.217.232:3001` | APK embed default |
| Unit fixtures | `http://127.0.0.1:28001` | no nip.io; no `:8088` as API origin |

**PASS** — mobile **keeps** dotted IP `:3001` (HRM_BE_PORT). Unlike FE web wipe of VPS IP from source, this is **correct** for mobile API base. Portal `:8088` only as “do not use” comment — not API origin.

### 3) Unit tests (QA cited — accepted)

QA re-ran 7 files / **59/59**. QC does **not** require re-run under HOLD_DEPLOY for host-scrub WI when grep + SoT independent PASS (shared lesson `qa-mob-remove-nipio-static-gate`).

### 4) HOLD_DEPLOY / no device promote

| Source | HOLD_DEPLOY |
|--------|-------------|
| D-MOB evidence | yes — no APK rebuild this wave |
| QA-MOB evidence | yes — residual HOLD_DEPLOY + ASSET-PAD |
| Sibling FE/OPS QC | yes |
| This gate | **CONFIRMED** — does not authorize APK promote or device UAT |

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| Grep zero `nip.io` / hyphen DNS in `apps/mobile` | PRODUCT closed | Accept |
| SoT local + VPS `:3001` | PRODUCT closed | Accept |
| Vitest 59/59 | PRODUCT closed | Accept (QA) |
| HOLD_DEPLOY / no APK rebuild | Process lock | **Condition** — keep |
| Hermes asset length-pad `///` until next embed | Process/Info | **Condition** R-MOB-NIPIO-ASSET-01 |
| Release cleartext vs HTTP VPS | P3 residual | **Condition** R-MOB-NIPIO-CLEARTEXT-01 |
| CRUD/J-* pack incomplete | PROCESS expected | Not NO-GO |

## Conditions (GWC)

| ID | Sev | Status | Note |
|----|-----|--------|------|
| HOLD_DEPLOY | Info | OPEN (lock) | No deploy/APK promote from this gate. |
| R-MOB-NIPIO-APK-01 | Info | OPEN | Field binary needs rebuild (`build-apk` / EAS) before device UAT against new defaults. |
| R-MOB-NIPIO-ASSET-01 | Info | OPEN | Prior Hermes scrub pad; next embed regenerates clean string (source already clean). |
| R-MOB-NIPIO-CLEARTEXT-01 | P3 | OPEN | Release manifest cleartext vs HTTP VPS — follow-up only if non-debug device binary. |

## Explicit non-claims

- **NOT** Phase 1 DONE  
- **NOT** PROD-READY / program UAT-PASS  
- **NOT** perimeter nip.io PASS  
- **NOT** APK promote / J-MOB device UAT authorization  
- L2.5 J-MOB device matrix **out of scope** this WI (HOLD_DEPLOY)

## Decision: GO WITH CONDITIONS

**GO WITH CONDITIONS** for **mobile remove-nipio lane only** (`QC-MOB-REMOVE-NIPIO-01` / `QA-MOB-REMOVE-NIPIO-01` / `D-MOB-REMOVE-NIPIO-01`).

Parity: FE + OPS already GWC on remove-nipio; mobile lane now closed under same sponsor lock (no nip.io; local + VPS DEV only; HOLD_DEPLOY).

## completion_report

- **Closed:** QC independent grep zero + Host SoT audit; QA PASS_TO_PM accepted; mobile lane GWC issued; residuals HOLD_DEPLOY / APK rebuild / asset pad / cleartext P3 documented.
- **Residual:** R-MOB-NIPIO-APK-01, R-MOB-NIPIO-ASSET-01, R-MOB-NIPIO-CLEARTEXT-01 — non-blocking for this WI; no Phase1/PROD claim.
- **next_owner:** pm
- **ack_status:** PASS_TO_PM

## next_dispatch_prompt

```text
work_item_id: PM-NIPIO-LANE-CLOSE-01
from_role: qc
to_role: pm
lane: governance

## Context
QC-MOB-REMOVE-NIPIO-01 = GO WITH CONDITIONS (parity FE+OPS). apps/mobile zero nip.io; SoT local 127.0.0.1:28001 + http://14.225.217.232:3001. HOLD_DEPLOY. Residuals: APK rebuild before device UAT; Hermes pad until next embed; cleartext P3.

## Actions
1. Bus INTAKE QC-MOB PASS_TO_PM + mark remove-nipio FE/OPS/MOB GWC closed for source scrub.
2. Do NOT dispatch qa-device / APK promote until sponsor lifts HOLD_DEPLOY.
3. Optional later: D-MOB APK rebuild → QA-DEVICE only if sponsor requests field UAT.
4. Do NOT claim Phase1/PROD from this wave.

## cấm
seed; perimeter PASS; force device UAT; nginx reload; Phase1/PROD claim
```
