# P1-PHASE1-QC-MOB-JMOB-01 — Mobile J-MOB L2.5 strict gate (R4)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QC-MOB-JMOB-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-04 |
| **verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md` |

**Explicitly out of scope:** Phase 1 Program DONE · Production PROD-READY · full portal J-HRM browser L2.5 · org FCM / push token registration on pilot APK · physical-device matrix beyond `emulator-5554`.

---

## 1. Scope

| In scope | Out of scope |
|----------|--------------|
| Strict device L2.5 **J-MOB-03..05** (+ regression **J-MOB-01**) on push-guard APK | Web `PROGRAM_JOURNEY_MAP` J-HRM-* |
| Account `uat.nv0001@xe.vn` · base `https://14-225-217-232.nip.io` | Member CEO `du-lich.ceo@xe.vn` device matrix |
| Closes R3 strict RN rejection blocker (ExpoPushToken toast) | Expo push POST to HRM API (intentionally off) |
| Pilot API probe parity (leave/payslip/pending) | `phase1:gate` / G4 / G5 program closure |

---

## 2. Evidence pack gate

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md` | **5/8** — **process GWC** |
| Failed checks | `portal_url` (mobile-only, no portal 5175), `crud_or_matrix` (device L2.5 slice, no web CRUD matrix), `residual_section` (implicit in §3 Layer summary only) |
| QC action | Audited substantive R4 artifact + probe JSON + FE push handoff; **does not** process-NO-GO product slice |

---

## 3. Chain audited

| Artifact | QC adjudication |
|----------|-----------------|
| `p1-phase1-qa-mob-jmob-20260604-r4.md` | **ACCEPT** — primary SoT; strict J-MOB-04/05 + regression 01/03 |
| `p1-phase1-qa-mob-jmob-20260604-r4-probe-nipio.json` | **ACCEPT** — R4a `pending=0` exit 1 → qual seed → R4b exit 0 |
| `p1-phase1-fe-mob-push-token-20260604.md` | **ACCEPT** — root cause + `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` |
| `PROGRAM_JOURNEY_MAP.md` | **Concurred** — J-MOB-03..05 marked PASS R4 (PM may refresh footer date) |
| `p1-phase1-qa-mob-jmob-screens/` | **Referenced** — list/detail/approve XML + PNG |

Prior waves: R1–R3 documented on bus; R3 **FAIL** strict toast → FE push guard → R4 **PASS**.

---

## 4. Classification (ENV vs PRODUCT)

| Signal | Class | QC |
|--------|-------|-----|
| nip.io `pending=0` before qual seed | **ENV / data** — not product NO-GO; deploy hook + QA parity | **CLOSED** — **C-MOBJOB-01** (see §9) |
| `FirebaseApp failed to initialize` cold start (no `google-services.json`) | **ENV / config** — not surfaced as RN rejection toast | **GWC** — push registration intentionally disabled |
| Expo push / `getDevicePushTokenAsync` on pilot APK | **PRODUCT policy (deferred)** — off by design until FCM wired | **GWC** condition **C-MOBJOB-02** |
| Home panel UUID; `hasMain: false` on wire | **PRODUCT residual (non-blocking)** — MOB-HEADER scope follow-up | **GWC** note only; journeys PASS on device |
| J-MOB-04 payslip detail + J-MOB-05 **Thành công** | **PRODUCT** | **PASS** strict |

---

## 5. L2.5 journey adjudication (U19)

| J-ID | QA R4 strict | QC |
|------|--------------|-----|
| **J-MOB-01** | Login **PASS** | **Concurred** |
| **J-MOB-03** | Leave list→detail **PASS** | **Concurred** — in-scope **03..05** bundle |
| **J-MOB-04** | Payslip list→detail **Thực lĩnh** 82,340,000; no RN rejection | **Concurred** — closes prior empty-detail / toast FAIL |
| **J-MOB-05** | **Duyệt** → **Thành công**; no raw `HRM-ATT-REQ-203`; no RN rejection | **Concurred** — requires qual seed when `pending=0` (documented) |

**Deferred (not blocking this gate):** J-MOB-02 GPS submit E2E · Expo push API registration · multi-device / physical matrix.

---

## 6. QC spot-check (2026-06-04)

| Check | Command | Result |
|-------|---------|--------|
| APK on disk | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` | **66,192,045** bytes — **concurs** QA |
| Mobile unit | `pnpm --filter hrm-mobile test` | **28/28 PASS** exit **0** |
| Full device rerun | — | **Not required** — QA automation exit **0** + logcat/XML audit sufficient for bounded slice |

---

## 7. Conditions (carry-forward)

| ID | Condition | Owner | Reopen trigger |
|----|-----------|-------|----------------|
| **C-MOBJOB-01** | ~~nip.io pilot keeps `pending>=1` after approve without manual `seed:hrm:uat-mob-pilot-qual`~~ | — | **CLOSED** 2026-06-04 — DO hook + QA phases A–D PASS (`p1-phase1-qa-mob-pending-parity-20260604.md`) |
| **C-MOBJOB-02** | Pilot APK: push registration **off** (`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0`); no claim «push to HRM API» | `dev-mobile` | User expects notifications on pilot before FCM wiring |
| **C-MOBJOB-03** | Optional: align outbound `x-company-id` with membership UUID (QA `hasMain: false`) | `dev-mobile` | Scope/auth regression on mobile lists |

---

## 8. Verdict summary

**GO WITH CONDITIONS** for **P1-PHASE1-QA-MOB-JMOB-01** mobile L2.5 slice:

- **J-MOB-03, J-MOB-04, J-MOB-05** — **PASS** strict (concurs QA R4).
- **J-MOB-01** regression — **PASS** (same build).
- **C-MOBJOB-01** pending deploy parity — **CLOSED** (§9 addendum).
- **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** portal/program sign-off.

---

## completion_report

- Audited QA R4 strict device evidence; pack verify **5/8** adjudicated **process GWC** only.
- Concurred **J-MOB-03..05** L2.5 PASS on push-guard APK; R3 RN-rejection blocker **closed**.
- Issued **GWC** for push-off pilot policy (**C-MOBJOB-02**); **C-MOBJOB-01 CLOSED** via §9 parity gate.
- Spot-check: APK size + **28/28** vitest exit **0**; nip.io C03 probe pending **1** exit **0** (2026-06-04).

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-MOB-JMOB-STATUS-01
from_role: pm
to_role: qa
entry_criteria: QC P1-PHASE1-QC-MOB-PENDING-PARITY-01 closed C-MOBJOB-01 on p1-phase1-qc-mob-jmob-20260604.md §9; J-MOB-03..05 strict PASS; C-MOBJOB-02 push-off still open
exit_criteria: PM refreshes PROGRAM_JOURNEY_MAP.md mobile footer + EVIDENCE_INDEX.md; optional qa-device J-MOB-05 spot same APK if sponsor wants device+API same-day evidence — not blocking C-MOBJOB-01 closure
evidence_path: docs/qa/evidence/p1-phase1-qc-mob-jmob-20260604.md
ack_status: PASS_TO_PM
```

No further **devops** on pending parity unless C03 probe regresses to `pending=0` after `hrm-be` recreate without `vps-post-hrm-be-mob-pilot-qual.sh`.

---

## 9. Addendum — P1-PHASE1-QC-MOB-PENDING-PARITY-01 (C-MOBJOB-01 CLOSED)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QC-MOB-PENDING-PARITY-01` |
| **parent_gate** | `P1-PHASE1-QC-MOB-JMOB-01` |
| **date** | 2026-06-04 |
| **verdict** | **CONDITION CLOSED** — **C-MOBJOB-01** |
| **ack_status** | **PASS_TO_PM** |
| **qa_evidence** | `docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md` |
| **do_evidence** | `docs/ops/evidence/p1-phase1-do-mob-pending-parity-20260604.md` |

### Evidence pack gate

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-mob-pending-parity-20260604.md` | **5/8** — **process GWC** (`ack_status` table format, `portal_url` API-only slice, `residual_section` implicit in completion_report) |
| QC action | Audited QA JSON + DO hook chain; **does not** process-NO-GO |

### Chain adjudication

| Artifact | QC |
|----------|-----|
| `p1-phase1-do-mob-pending-parity-20260604.md` | **ACCEPT** — `deploy.sh` hook + VPS seed/probe **PASS** |
| `p1-phase1-qa-mob-pending-parity-20260604.md` + `.json` | **ACCEPT** — baseline pending **1** (no manual seed in QA process), Duyệt → **0**, hook-equivalent seed restore → **1** |
| `p1-phase1-qc-mob-jmob-20260604.md` §7 | **C-MOBJOB-01** row → **CLOSED** |

### QC spot-check (2026-06-04)

| Check | Result |
|-------|--------|
| `tmp-p1-resid-c03-probe.mjs` @ `https://14-225-217-232.nip.io` · `uat.nv0001@xe.vn` | exit **0** — pending **1**, payslips **1**, leave **6** |

**Reopen trigger:** J-MOB-05 or C03 probe **FAIL** with `pending=0` after `hrm-be` recreate when operator skips `bash /opt/xevn-ecosystem/scripts/vps-post-hrm-be-mob-pilot-qual.sh`.

**Unchanged:** **C-MOBJOB-02** (push/FCM off pilot) · **C-MOBJOB-03** (optional `x-company-id` UUID) · parent slice still **NOT** Phase 1 DONE / **NOT** PROD.

## evidence_path

`docs/qa/evidence/p1-phase1-qc-mob-jmob-20260604.md`

## ack_status

**PASS_TO_PM**
