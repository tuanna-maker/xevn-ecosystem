# Evidence — QA-HRM-EMP-COMPANY-COL-BE-02 (2026-07-25)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-EMP-COMPANY-COL-BE-02` |
| **from_role** | `qa` |
| **to_role** | `pm` (optional `qc` to close `C-EMP-COL-NEST-WATCH-01`) |
| **ack_status** | `PASS_TO_PM` |
| **scope** | Light smoke only — nest `--watch` / `dev:hrm-api` **no TS2322** on operating-units after BE-02 |
| **U65** | zero-seed · no deploy · no `:8088` · NOT Phase1/PROD · **no** full UF retest |
| **BE prior** | `docs/qa/evidence/be-hrm-emp-company-col-be-02-20260725.md` (READY_FOR_QA; tsc 0; jest 15/15) |
| **QC condition** | `C-EMP-COL-NEST-WATCH-01` / `R-EMP-COL-NEST-WATCH-01` P2 DX in `qc-hrm-emp-company-col-01-20260725.md` |

---

## 1. Mission

Confirm Nest incremental compile no longer fails **TS2322** assigning `db.query` wrapper to `CompanyDisplayQueryFn` in `operating-units.service.ts`.

**Out of scope:** browser UF, company-col `:8088`, Settings master-data compile (`D-HRM-SETTINGS-MD-COMPILE-BE-01`), Phase1/PROD.

---

## 2. Checks executed

### 2.1 Nest watch / `pnpm run dev:hrm-api` (primary)

| Run | Result |
|-----|--------|
| Prior session `590764` | `[6:22:14 PM] Found 0 errors. Watching for file changes.` then `EADDRINUSE :::28001` (runtime bind only) |
| Clean smoke `683888` | `[6:27:14 PM] Found 0 errors` + incremental `[6:28:11 PM] Found 0 errors` |

**Log excerpt (clean smoke):**

```text
hrm-api:dev: > nest start --watch
[6:26:19 PM] Starting compilation in watch mode...
[6:27:14 PM] Found 0 errors. Watching for file changes.
```

| Grep on watch log | Count |
|-------------------|-------|
| `TS2322` | **0** |
| `operating-units.service` type error | **0** |
| `Found 0 errors` | **2** (initial + incremental) |

**Verdict primary:** **PASS** — nest `--watch` compiles without TS2322 on operating-units.

### 2.2 Build typecheck (corroboration)

```text
npx tsc --noEmit -p tsconfig.build.json
→ BUILD_TSC_EXIT=0
→ NO_OPERATING_UNITS_OR_TS2322_MATCHES
```

### 2.3 Optional LE probe (stack)

| Step | Result |
|------|--------|
| GET health `:28001` | Not asserted — process did not stay listening |
| After compile success | Runtime **`MODULE_NOT_FOUND`**: `Cannot find module '../platform/platform-runtime'` (from `dist/db/hrm-db.service.js`) — **unrelated** to QueryFn/TS2322 |
| Login xbos `:28002` | 201 (token available) but HRM listen failed → OU/employee LE probe **skipped** |

Optional LE labels / `0 Khối*` — **N/A this smoke** (listen blocked by unrelated module path). **Does not FAIL** this work item (mission = typecheck watch only). Company-col browser UF remains on prior QA evidence `qa-hrm-emp-company-col-01-20260723.md` — not re-claimed here.

---

## 3. Residual / do not conflate

| Item | Status |
|------|--------|
| **C-EMP-COL-NEST-WATCH-01** (TS2322 QueryFn) | **CLOSABLE** — QA confirms watch typecheck clean |
| Runtime `platform-runtime` MODULE_NOT_FOUND / L0 `:28001` down | **Open elsewhere** — DevOps / Settings L0 restore (`D-HRM-SETTINGS-MD-L0-RESTORE-01` / `PCOMP-W6-DO-LOCAL-STACK-01`) — **not** this TS2322 residual |
| `D-HRM-SETTINGS-MD-COMPILE-BE-01` | May still be open — **do not conflate** unless same TS2322 (it is not) |
| `:8088` / Phase1 / PROD | **NONE** claimed |

---

## 4. Verdict

| Gate | Result |
|------|--------|
| Nest watch no TS2322 operating-units | **PASS** |
| Optional OU/employee LE live | **N/A** (listen fail unrelated) |
| Overall `QA-HRM-EMP-COMPANY-COL-BE-02` | **PASS_TO_PM** |

---

## 5. Handoff

- **completion_report:** Light smoke PASS — `pnpm run dev:hrm-api` / `nest start --watch` reports **Found 0 errors** (no TS2322 on operating-units). `tsc -p tsconfig.build.json` exit 0, no OU/TS2322 matches. Optional LE GET skipped: post-compile `MODULE_NOT_FOUND` platform-runtime (separate L0). Closed QC P2 DX condition for nest watch typecheck. No seed, no `:8088`, no Phase1/PROD claim.
- **next_owner:** `pm` (or `qc` if closing condition `C-EMP-COL-NEST-WATCH-01` on GWC record)
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/qa/evidence/qa-hrm-emp-company-col-be-02-20260725.md`
- **ack_status:** `PASS_TO_PM`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-EMP-COMPANY-COL-NEST-WATCH-CLOSE-01 (optional) OR PM intake close C-EMP-COL-NEST-WATCH-01
from_role: pm
to_role: qc (narrow) or note-only close on bus
entry: QA-HRM-EMP-COMPANY-COL-BE-02 PASS_TO_PM · evidence qa-hrm-emp-company-col-be-02-20260725.md · nest watch Found 0 errors · no TS2322
exit: mark C-EMP-COL-NEST-WATCH-01 / R-EMP-COL-NEST-WATCH-01 CLOSED on QC GWC residual; do NOT reopen company-col UF; do NOT conflate platform-runtime MODULE_NOT_FOUND (use D-HRM-SETTINGS-MD-L0-RESTORE-01 / PCOMP-W6-DO-LOCAL-STACK-01)
cấm: seed · :8088 · Phase1/PROD · claim company-col redeploy
```
