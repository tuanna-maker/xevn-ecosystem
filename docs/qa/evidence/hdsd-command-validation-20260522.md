# HDSD command reproducibility validation — DOC-HDSD-PILOT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-HDSD-PILOT-01` |
| **Validator** | QA |
| **Date** | 2026-05-22 (local) |
| **Source doc** | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` |
| **Environment** | Windows; `deploy/xevn-ecosystem/.env` loaded per §3.5 |
| **Ports** | `HRM_BE_PORT=28001`, `XBOS_BE_PORT=28002` |
| **API state** | Pre-running (`node` PIDs 22616/2856) per `docs/qa/evidence/api-restart-post-scope-20260522.md` — no restart required this cycle |

## Verdict

| Gate | Result |
|------|--------|
| Section 4 representative commands (executed subset) | **PASS** |
| Blockers for pilot reproducibility | **None** |
| **ack_status** | **`READY_FOR_QC`** |

## Method

1. Extracted command list from §4 (and §3.5 env bootstrap).
2. Loaded deploy `.env` into process scope (PowerShell snippet from doc).
3. Executed representative subset; skipped long-running/redundant steps where prior evidence + UAT P1 prove state.
4. Did **not** start APIs (already listening); aligned with `docs/qa/evidence/api-restart-post-scope-20260522.md`.

## Command results (§4 + bootstrap)

| Ref | Doc section | Command / action | Executed | Result | Evidence / notes |
|-----|-------------|------------------|----------|--------|------------------|
| B1 | §3.5 | Load `deploy\xevn-ecosystem\.env` + `$env:NODE_ENV='development'` | Yes | **PASS** | `HRM_BE_PORT=28001`, `XBOS_BE_PORT=28002` printed |
| C1 | §4.1 | `pnpm run seed:hrm:1000-uat` | **Skip** | **SKIP (accepted)** | UAT P1 `db-workforce-count-roles-tenant`: **1000** rows, **25** `job_title_key`, **1000** with tenant+password (`system-integration-uat-report.json`). Re-seed not run to avoid duplicate risk. |
| C2a | §4.2 | `pnpm run dev:hrm-api` / `dev:xbos-api` | No | **NOT_RUN** | APIs already up on deploy ports (dist restart chain) |
| C2b | §4.2 | `build:platform-core` + filter builds + `node dist/...` | No | **NOT_RUN** | Covered by `api-restart-post-scope-20260522.md` (build PASS, health PASS) |
| C3a | §4.3 | `Invoke-WebRequest` HRM `http://127.0.0.1:$HRM/api/hrm/` | Yes | **PASS** | HTTP **200** |
| C3b | §4.3 | `Invoke-WebRequest` XBOS `http://127.0.0.1:$XBOS/api/xbos/` | Yes | **PASS** | HTTP **200** |
| C3c | §4.3 | Prometheus metrics HRM/XBOS | Yes | **PASS** | HRM metrics **200**; XBOS body contains `http_requests_total` |
| C4 | §4.4 | `pnpm run test:system:uat` | Yes | **PASS** | `verdict: PASS`, **37/0/0**, exit **0**; report `docs/qa/evidence/system-integration-uat-report.json` (`started_at` 2026-05-22T04:34:30Z) |
| C4b | §4.4 | `pnpm run test:system:uat:seed` | No | **NOT_RUN** | Seed skip rationale above; C4 sufficient with live APIs |
| C5 | §4.5 | `pnpm run dev:web-only` | No | **NOT_RUN** | Optional in pilot; out of PM reproducibility subset |
| C6 | §4.6 | Mobile login `uat.nv0001@xe.vn` / `xevn-uat-2026` | Yes | **PASS** | `POST /api/hrm/auth/mobile/login` → **201**, `access_token` in body (doc email format) |
| C6b | §4.6 | `npx expo start` | No | **NOT_RUN** | API login proves credentials; full Expo UI not in subset |
| C7 | §4.7 | Web portal `ceo@xe.vn` | No | **NOT_RUN** | Covered by UAT `xbos-portal-login-rbac` (P2 PASS) in C4 |

## Console excerpts (this run)

**§4.3 health**

```
HRM StatusCode=200
XBOS StatusCode=200
PASS http_requests_total found (XBOS metrics)
```

**§4.6 mobile login**

```
StatusCode=201
PASS access_token in body
```

**§4.4 UAT**

```
Verdict: PASS
PASS: 37  FAIL: 0  SKIP: 0
EXIT=0
```

## Cross-checks (doc vs repo)

| Check | Status | Note |
|-------|--------|------|
| `seed:hrm:1000-uat` in root `package.json` | PASS | Matches Phụ lục A |
| `test:system:uat` / `test:system:uat:seed` | PASS | Matches §4.4 |
| Health URLs `/api/hrm/` and `/api/xbos/` | PASS | Not `/health` suffix |
| UAT report path in doc | PASS | File exists post-run |
| `pnpm run deploy:pick-ports` (Phụ lục A §3.4) | **DOC_GAP** | QC noted: script `scripts/pick-xevn-host-ports.mjs` exists but npm script not wired — **non-blocking** for §4 subset; owner **dev-be** for parity |

## Related evidence

| Artifact | Role |
|----------|------|
| `docs/qa/evidence/system-integration-uat-report.json` | Automated UAT 37/37 |
| `docs/qa/evidence/api-restart-post-scope-20260522.md` | API build + listen + prior mobile smoke |
| `docs/qa/SYSTEM_INTEGRATION_UAT_SCENARIO.md` | UAT account matrix |
| `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | Subject document |

## Handoff

| Field | Value |
|-------|--------|
| `from_role` | `qa` |
| `to_role` | `qc` |
| `ack_status` | `READY_FOR_QC` |
| `entry_criteria` | PM dispatch DOC-HDSD-PILOT-01 reproducibility validation |
| `exit_criteria` | Per-command PASS/FAIL table + no P0 blocker on §4 path |
| `evidence_path` | `docs/qa/evidence/hdsd-command-validation-20260522.md` (this file) |

**QC note:** Prior QC doc-quality gate (`GO WITH CONDITIONS`, `deploy:pick-ports`) remains valid; this packet adds **runtime reproducibility** proof for §4.
