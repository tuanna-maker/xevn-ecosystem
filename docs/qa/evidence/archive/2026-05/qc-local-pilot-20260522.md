# QC gate — local pilot stack + portal auth (24h)

**Date:** 2026-05-22  
**work_item_id:** `LOCAL-PILOT-STACK-01`, `PORTAL-AUTH-TOKEN-24H-01`  
**from_role:** QC  
**to_role:** PM  
**ack_status:** `PASS_TO_PM`

## Gate scope (PM)

| Criterion | Evidence | QC audit |
|-----------|----------|----------|
| Portal auth 24h TTL + redirect design | `docs/qa/evidence/portal-auth-token-20260522.md`; `apps/web/web-portal/src/integrations/authSession.ts`, `RequireAuth.tsx`, `xbosHttp.ts` | **Conform** — `expiresInSec`/JWT 86400 (A1–A2); session expiry + `stashLoginRedirect` + 401/403 handler present; `VITE_REQUIRE_LOGIN=true` in DevOps `.env.local` |
| `ceo@xe.vn` → `group-member-units` HTTP **200** (≥1 member) | QA A3; DevOps gate table | **PASS** — 200, 4 members |
| `du-lich.ceo@xe.vn` → **403** (no master) | QA A4 | **PASS** |
| Local stack smoke (28001/28002/5175, health + login) | `docs/ops/evidence/local-pilot-stack-20260522.md`; QA env notes | **PASS** — HRM/XBOS/portal 200; login `86400` post-rebuild; `qc-dev-stack.mjs` PASS |

## Handoff chain

| Lane | Artifact | Status |
|------|----------|--------|
| DevOps | `docs/ops/evidence/local-pilot-stack-20260522.md` | `READY_FOR_QA` → stack gates satisfied; overlapped by QA API matrix |
| QA | `docs/qa/evidence/portal-auth-token-20260522.md` | `PASS_TO_QC` — A1–A4, BE spec, FE build |
| Dev-BE | `auth.service.spec.ts` (1/1) per QA B1 | **Closed** |

## Pre-merge / compliance notes

- **Deferred (non-blocking for local pilot):** browser UAT (expired `tokenExpiresAt`, Command Center redirect); `authSession.test.ts` vitest merge infra (QA defer).
- **Operator control:** long-running `xbos-api` without rebuild served `expiresInSec=43200` until QA restart — documented in QA/DevOps evidence; not a code defect when restart discipline applied.
- **Out of scope this gate:** VPS/public deploy, production NFR/metrics cutover, HRM mobile auth lane.

## Decision

**Status:** **GO WITH CONDITIONS** (local pilot / operator consumption only — not production release)

**Conditions (close before external stakeholder demo or VPS cutover):**

1. One browser smoke: login `ceo@xe.vn` → Command Center → `group-member-units` via portal proxy; unauthenticated `/command-center` → `/login`.
2. After any `xbos-api` auth TTL change: `pnpm run build` in `apps/api/xbos-api` + restart listener; assert login `expiresInSec === 86400`.

**Residual risks:** Stale local `xbos-api` process can regress JWT to 12h until rebuild/restart; Docker `xevn-xbos-api-dev` restart loop may drift from host-built API — align compose/dev with latest build before pilot handoff to IT.

## Evidence paths

- `docs/qa/evidence/portal-auth-token-20260522.md`
- `docs/ops/evidence/local-pilot-stack-20260522.md`
- `docs/program/AGENT_MESSAGE_BUS.md` (QC entry below)

## Next actions

| Owner | Action |
|-------|--------|
| PM | Accept local pilot GO WITH CONDITIONS; schedule optional browser UAT or dispatch QA if demo-bound |
| DevOps | Document xbos restart in pilot runbook if not already in HDSD v1.1 |
| TM | Production NFR/metrics remain separate program gate |

---

## Addendum — HRM embed regression (2026-05-22)

**work_item_id:** `QC-HRM-EMBED-REGRESSION-01`

This gate **did not** include Command Center HRM iframe routes. User-valid escalation on `/command-center/hrm/contracts` (empty UI, `54321 ERR_CONNECTION_REFUSED`, `settings-catalogs` 409) retroactively **downgrades** implicit “all HRM embed OK” assumptions from employees-only QA PASS.

- **Full QC packet:** `docs/qa/evidence/qc-hrm-embed-regression-20260522.md`
- **Initial verdict (16:00Z):** **NO-GO** for HRM embed pilot until contracts (+ matrix) fixed
- **Re-gate (17:30Z):** **GO WITH CONDITIONS** for local pilot on **employees + contracts** only; **insurance deferred** (D5)
- **Employees + contracts** evidenced — do not extend pilot claim to insurance or unverified iframe routes without new QA/QC cycle
