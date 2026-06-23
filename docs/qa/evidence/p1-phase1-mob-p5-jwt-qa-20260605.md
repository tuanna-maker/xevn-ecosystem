# P1-PHASE1-QA-MOB-P5-JWT-01 — Mobile P5 JWT attendance write (C-W12QC-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-MOB-P5-JWT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **parent_dev** | `P1-PHASE1-MOB-P5-JWT-01` |
| **date** | 2026-06-05 |
| **environment** | Local L0 — HRM `:28001`, XBOS `:28002`; DB `xevn_hrm` @ `113.20.107.184` via `deploy/xevn-ecosystem/.env` |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **qc** (C-W12QC-01 closure on W12 condition register) |

## Scope (exit criteria)

| Criterion | Target | Verdict |
|-----------|--------|---------|
| L1 UAT | `pnpm run test:system:uat` **37/0** exit 0 | **PASS** |
| P5 phase | `mobile-jwt-attendance-record-uuid-scope` **PASS** | **PASS** |
| Mobile unit | `pnpm run test:hrm-mobile` **37/37** | **PASS** |
| MOB smoke | `node scripts/mobile-hrm-smoke.mjs` exit 0 | **PASS** |
| Close QC condition | **C-W12QC-01** | **CLOSED** (QA-satisfied) |
| J-MOB-03/05 device | Optional if stack + adb | **GWC** — no emulator; prior R4 PASS retained |

**Out of scope:** Phase 1 program DONE; corporate PROD-READY; nip.io APK rebuild (logic-only wave per dev handoff).

---

## 1) L1 System Integration UAT

### First run (unseeded — informational FAIL)

Without workforce seed, mobile logins returned `HRM-AUTH-401` — **7/30 FAIL** including P5 `mobile-jwt`. Root cause: missing `uat.nv####` passwords on DB (not a regression in mobile JWT fix).

### Authoritative runs

| Run | Command | Summary | Exit |
|-----|---------|---------|------|
| Seed + UAT | `pnpm run test:system:uat:seed` | **38/0** (incl. seed phase) | **0** |
| UAT (no reseed) | `pnpm run test:system:uat` | **37/0** `verdict: PASS` | **0** |

**Report:** `docs/qa/evidence/system-integration-uat-report.json`  
**executed_at:** `2026-06-05T05:02:57.964Z` → `2026-06-05T05:03:20.xxxZ`

### P5 `mobile-jwt-attendance-record-uuid-scope` (target phase)

| Field | Value |
|-------|-------|
| status | **PASS** |
| role | `DRIVER` |
| account | `uat.nv0016@xe.vn` / `xevn-uat-2026` |
| employee_code | `HLD-0016` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| write_path | `mobile-jwt-only` (Bearer JWT, no internal key) |
| attendance_date | `2026-06-06` |
| scope_assert | No `SCOPE_CONTEXT_MISMATCH`; DB row ≥ 1 after POST |

**Delta vs prior 36/37:** Historical FAIL was mobile JWT write with UUID body + slug `x-company-id` mismatch. Independent L1 reproduces **PASS** on seeded env — **C-W12QC-01** criterion met.

---

## 2) Mobile unit + smoke (independent)

```text
pnpm run test:hrm-mobile
# exit 0 — 37/37 vitest (incl. p1-phase1-mob-p5-jwt.test.ts, mobileAuthSession.test.ts, companyWireScope.test.ts)

node scripts/mobile-hrm-smoke.mjs
# exit 0 — MOB smoke OK @ http://127.0.0.1:28001
```

---

## 3) L0 stack

| Service | Port | Status |
|---------|------|--------|
| hrm-api | 28001 | **200** (pre-existing) |
| xbos-api | 28002 | **200** (started `pnpm run dev:xbos-api` for UAT P2/P6) |

`pnpm run qc:dev-stack` before xbos start: **FAIL** (xbos down only). UAT P0 health checks **PASS** after xbos boot.

---

## 4) J-MOB-03 / J-MOB-05 (optional device)

| Check | Result |
|-------|--------|
| `adb devices` | **No device attached** — device lane skipped |
| Regression baseline | **J-MOB-03/05 PASS** strict R4 (2026-06-04) — [`p1-phase1-qa-mob-jmob-20260604-r4.md`](p1-phase1-qa-mob-jmob-20260604-r4.md) |

**GWC note:** This wave validates **client JWT TTL + scope header/body split** via L1 P5 and vitest. Device retest deferred to `qa-device` when emulator available; dev handoff states APK rebuild optional (logic-only).

---

## 5) Residual / not promoted

| Item | Status | Owner |
|------|--------|-------|
| BE `ACCESS_TTL_SEC` **43200** in `mobile-auth.service.ts` | **OPEN** optional — client honors server `expires_in_sec`; portal default 86400 when absent | dev-be |
| J-MOB-03/05 device tap on **new APK** after P5 | **GWC** — prior R4 PASS; re-run if PM requires post-P5 APK | qa-device |
| Phase 1 / PROD | **NOT claimed** | — |

---

## 6) Condition closure

| Condition | Prior | QA verdict |
|-----------|-------|------------|
| **C-W12QC-01** | L1 **36/37** — `mobile-jwt-attendance-record-uuid-scope` FAIL | **CLOSED** — L1 **37/0**, P5 phase **PASS**, vitest **37/37** |

---

## Handoff packet

- **completion_report:** Independent L1 **37/0** with P5 `mobile-jwt-attendance-record-uuid-scope` **PASS** (`DRIVER` `HLD-0016`, UUID body + JWT-only write, DB verified). Vitest **37/37** + MOB smoke **PASS**. **C-W12QC-01** QA-satisfied. Residual: no adb for J-MOB-03/05 (GWC, R4 baseline); BE TTL 43200 optional.
- **next_owner:** `pm` → `qc`
- **next_dispatch_prompt:** `work_item_id: P1-PHASE1-QC-MOB-P5-JWT-01. Role: qc. Entry: QA PASS_TO_PM docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md — test:system:uat 37/0, P5 mobile-jwt-attendance-record-uuid-scope PASS, C-W12QC-01 QA-satisfied. Exit: Confirm C-W12QC-01 CLOSED on docs/qa/evidence/p1-p100-w12-qc-final-20260531.md + docs/program/SERVICE_READINESS_UAT_PRODUCTION.md; update PROJECT_STATUS_REPORT C-W12QC-01 row; no regression to 36/37. ack_status PASS_TO_PM with condition delta. evidence_path: docs/qa/evidence/p1-phase1-qc-mob-p5-jwt-20260605.md`
- **evidence_path:** `docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md`
- **ack_status:** **PASS_TO_PM**
- **pm_dispatch_hint:** **P1-PHASE1-QC-MOB-P5-JWT-01** — close **C-W12QC-01**; optional **qa-device** J-MOB-03/05 when emulator up
