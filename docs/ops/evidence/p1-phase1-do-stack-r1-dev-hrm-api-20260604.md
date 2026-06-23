# P1-PHASE1-DO-STACK-R1-DEV-HRM-API — `dev:hrm-api` turbo fix (C-STACKQC-01)

| Field | Value |
|-------|-------|
| work_item_id | `P1-PHASE1-DO-STACK-R1-DEV-HRM-API` |
| qc_condition | **C-STACKQC-01** |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-06-04` |
| ack_status | **READY_FOR_QA** |

---

## Problem

`pnpm run dev:hrm-api` (`turbo run dev --filter=hrm-api`) exited with **no tasks executed** because `apps/api/hrm-api/package.json` had `start:dev` but **no `dev` script**, unlike `xbos-api`. QA fell back to `pnpm --filter hrm-api start:dev` (see `docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` R1).

---

## Fix

| Change | Path |
|--------|------|
| Add `"dev": "nest start --watch"` | `apps/api/hrm-api/package.json` |
| Document port + turbo parity | `docs/ops/LOCAL_DEV_STACK_L0.md` |

Root `package.json` already had `"dev:hrm-api": "turbo run dev --filter=hrm-api"` — no change required.

---

## Verification

### Turbo recognizes `hrm-api#dev`

```text
pnpm exec turbo run dev --filter=hrm-api --dry-run
# Packages in scope: hrm-api
# Tasks to Run: hrm-api#dev → nest start --watch
```

### L0 gate (workstation, APIs listening)

```text
pnpm run qc:dev-stack
# ✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
# ✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
# ✗ web-portal (optional): 5173 — not required for L0 exit 0
# exit 0
```

**Note:** Portal optional failure does not fail L0; only HRM + XBOS must be 200.

---

## QA entry / exit

| Item | Criterion |
|------|-----------|
| Entry | Fresh terminal; Postgres + deploy `.env` DB vars set |
| Start | `pnpm run dev:hrm-api` — must boot Nest (not turbo no-op) |
| L0 | `pnpm run qc:dev-stack` → exit **0** |
| Doc | `docs/ops/LOCAL_DEV_STACK_L0.md` matches commands above |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| — | None for C-STACKQC-01 | — |

---

## Handoff

- **next_owner:** `qa`
- **pm_dispatch_hint:** Re-run L0 slice on a clean session: stop stale `:28001`, `pnpm run dev:hrm-api`, confirm Nest boot via turbo, `qc:dev-stack` exit 0; close R1 in `p1-phase1-qc-stack-l0-20260604.md` if PASS.
