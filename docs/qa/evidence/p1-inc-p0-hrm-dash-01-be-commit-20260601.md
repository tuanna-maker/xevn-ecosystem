# P1-INC-P0-HRM-DASH-01-BE-COMMIT — BE-META on origin/main

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-BE-COMMIT |
| **parent** | P1-INC-P0-HRM-DASH-01 |
| **qc_ref** | C-DASHQC-02 |
| **owner** | dev-be |
| **date** | 2026-06-01 |
| **ack_status** | **READY_FOR_PM** |

## Commit

| Item | Value |
|------|-------|
| **SHA** | `15a3cbe` |
| **branch** | `main` |
| **remote** | `origin/main` (`5106a0c..15a3cbe`) |
| **message** | `fix(xbos-api): workspace-meta asOf no epoch (P1-INC-P0-HRM-DASH-01)` |

## Files (6 — no secrets)

- `apps/api/xbos-api/src/command-center/command-center.service.ts`
- `apps/api/xbos-api/src/command-center/command-center.controller.ts`
- `apps/api/xbos-api/src/command-center/command-center.service.spec.ts` (new)
- `apps/api/xbos-api/src/command-center/command-center.controller.spec.ts` (new)
- `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` (new)
- `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` (new)

Pre-commit `security:scan:staged` — **PASS**.

## Verification (local, pre-push)

```text
pnpm --filter xbos-api test -- command-center     → 10/10 PASS
pnpm --filter xbos-api test -- xbos-group-legal-scope → 8/8 PASS
```

Design detail: `docs/qa/evidence/p1-inc-p0-hrm-dash-01-be-meta-20260601.md`.

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Pilot xbos-api image rebuild from `15a3cbe` | devops | VPS hot-patch superseded by git; deploy before QA R3 |
| QA live `workspace-meta` on nip.io | qa | `asOf` year ≥ 2020; no 01/01/1970 UI |
| FE stale meta banner (P2) | dev-fe | Optional if API 200 but banner persists |

## Handoff

- **next_owner:** pm
- **pm_action:** Dispatch devops deploy + QA R3; close C-DASHQC-02 governance item when pilot matches commit.
