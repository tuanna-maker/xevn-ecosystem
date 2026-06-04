# C-W2QC-02 Pilot Port Harden

- work_item_id: `C-W2QC-02-PILOT-PORT-HARDEN`
- generated_at: `2026-06-02`
- scope: Harden pilot-flow/gate portal port contract to avoid false `ECONNREFUSED` when active portal is `5173`.

## Audit result

- `pnpm run test:pilot:flows` maps to `node ./scripts/pilot-business-flow-smoke.mjs` from root `package.json`.
- Prior behavior in pilot/gate scripts used fixed fallback `http://127.0.0.1:5175` when `PORTAL_DEV_URL` unset.
- Existing health gate script (`scripts/qc-fe-be-api-health.mjs`) already probes `5173` then `5175`; this mismatch caused strict false-fail class.

## Implemented hardening

- Added shared resolver `scripts/lib/portal-base-resolver.mjs`:
  - respects explicit `PORTAL_DEV_URL` unchanged,
  - otherwise probes login on `5173` first, then `5175`,
  - defaults to `5173` if both probes fail.
- Updated scripts to use shared resolver:
  - `scripts/pilot-business-flow-smoke.mjs`
  - `scripts/hrm-embed-fe-audit.mjs`
  - `scripts/verify-phase1-view-completeness.mjs`
- Added regression test `scripts/lib/portal-base-resolver.test.mjs` for env override and fallback order.

## Command evidence

1) `node --test scripts/lib/portal-base-resolver.test.mjs`  
   - exit: `0`  
   - result: `3/3 PASS`

2) `pnpm run test:pilot:flows` (default invocation, no `PORTAL_DEV_URL` set)  
   - exit: `0`  
   - resolved base: `http://127.0.0.1:5173`  
   - result: `13/13 PASS`  
   - no false `ECONNREFUSED 127.0.0.1:5175`

## Outcome

- Default pilot-flow invocation now follows active portal contract deterministically.
- CI/local compatibility preserved: explicit `PORTAL_DEV_URL` still takes highest precedence.
