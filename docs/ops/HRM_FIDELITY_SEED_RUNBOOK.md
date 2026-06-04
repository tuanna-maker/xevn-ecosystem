# HRM Fidelity Seed Runbook

**work_item_id:** `HRM-FULL-FIDELITY-01` / `HRM-FIDELITY-DO`  
**Gate:** `pnpm run verify:hrm:menu-density` (script: `scripts/verify-hrm-menu-data-density.mjs`)  
**Program:** `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`

---

## 1. Purpose

Populate **satellite** HRM tables (contracts, insurance, attendance scale, payroll periods, recruitment, leave) in proportion to the **1000+ UAT workforce**, so Command Center / HRM embed menus show linked data instead of false-empty lists.

Shell/API health (`pnpm qc:dev-stack`, embed audit) is **not** sufficient for fidelity closure.

---

## 2. Prerequisites

| Requirement | Check |
|-------------|--------|
| Postgres reachable | `deploy/xevn-ecosystem/.env` or API `.env` — `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `HRM_DB_NAME` (default `xevn_hrm`) |
| Migrations applied | `pnpm run migrate:hrm:apply` (and `migrate:xbos:apply` for org) |
| HRM API (catalog seed only) | `pnpm dev:hrm-api` on `HRM_BE_PORT` (default `28001`) for `seed:hrm:group-employee-catalog` |
| XBOS API (optional health) | `pnpm dev:xbos-api` on `XBOS_BE_PORT` (default `28002`) |

---

## 3. Seed order (mandatory)

Run from **repo root**. Do **not** skip steps when bootstrapping a fresh dev DB.

| Step | Command | Owner | Notes |
|------|---------|-------|--------|
| **0** | `pnpm run seed:stack:p0` | DevOps | Migrate + org foundation + RACI + tenant CEOs + 100 employees (`scripts/seed-dev-stack-p0.mjs`) |
| **1** | Org / XBOS catalogs | DevOps / BE | Included in P0: `bootstrap-xevn-xbos`, `seed:raci:*`. HRM catalog: `pnpm run seed:hrm:group-employee-catalog` (needs HRM API) |
| **2** | UAT workforce | DevOps / QA | `pnpm run seed:hrm:1000-uat` — 1000 accounts + workforce rows |
| **3** | Satellite fidelity | Dev-BE → DevOps | `pnpm run seed:hrm:fidelity` — **when** `scripts/seed-hrm-satellite-from-workforce.mjs` exists and is wired in `package.json` |
| **4** | Density gate | QA / DevOps | `pnpm run verify:hrm:menu-density` — exit **0** = PASS |

### Optional flags on P0 stack

```bash
# After P0, also seed 1000 UAT workforce:
pnpm run seed:stack:p0 -- --with-1000-uat

# After step 3 (when script exists), run density verify (fails until satellites seeded):
pnpm run seed:stack:p0 -- --verify-density

# QC dev stack + density hint (non-blocking unless --verify-density on qc):
HRM_DENSITY_HINT=1 pnpm run qc:dev-stack
```

---

## 4. `seed:hrm:fidelity` (Dev-BE deliverable)

**Target script:** `scripts/seed-hrm-satellite-from-workforce.mjs`  
**Package script (when merged):**

```json
"seed:hrm:fidelity": "node ./scripts/seed-hrm-satellite-from-workforce.mjs"
```

**Cardinality rules:** `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` (when published by BA-Data).  
**Defaults enforced by verify** (override via env):

| Env | Default | Check id |
|-----|---------|----------|
| `HRM_FIDELITY_MIN_CONTRACT_RATIO` | 0.85 | contracts-ratio |
| `HRM_FIDELITY_MIN_INSURANCE_RATIO` | 0.85 | insurance-ratio |
| `HRM_FIDELITY_MIN_ATTENDANCE_PER_ACTIVE` | 0.02 | attendance-scale |
| `HRM_FIDELITY_MIN_PAYROLL_PERIODS` | 10 | payroll-periods |
| `HRM_FIDELITY_MIN_REQUISITIONS` | 5 | recruitment-pipeline, leave-requests |

---

## 5. Verify gate

```bash
pnpm run verify:hrm:menu-density
```

- **PASS:** exit code `0`, summary `7/7 PASS`
- **FAIL:** exit code `1` — record output under `docs/qa/evidence/hrm-menu-density-verify-*.md`; dispatch `HRM-FIDELITY-BE` until satellites meet ratios

---

## 6. VPS / pilot

Same order on VPS after deploy pull (SSH `14.225.217.232`, repo `/opt/xevn-ecosystem`):

1. Ensure DB env in `deploy/xevn-ecosystem/.env`
2. Run migrate if schema changed
3. Steps 2–4 above **inside** container or via `docker compose exec` with Node tooling — prefer host `pnpm` with env loaded from deploy `.env`
4. Attach evidence to QC gate (`business-flow-zero-defect-gate.mdc` L1/L2)

---

## 7. Evidence paths

| Artifact | Path |
|----------|------|
| Baseline FAIL (pre-fidelity) | `docs/qa/evidence/hrm-menu-density-verify-20260523.md` |
| Post-seed PASS | `docs/qa/evidence/hrm-menu-density-verify-<date>-pass.md` |
| Program bus | `docs/program/AGENT_MESSAGE_BUS.md` (`HRM-FIDELITY-DO`) |

---

## 8. Handoff

| From | To | ack_status |
|------|-----|------------|
| DevOps | PM | `PASS_TO_PM` after runbook + bootstrap wiring + baseline verify evidence |
| PM | Dev-BE | `DISPATCHED` until `seed:hrm:fidelity` exists and verify PASS |
| QA | QC | `READY_FOR_QA` when verify PASS + persona matrix |
