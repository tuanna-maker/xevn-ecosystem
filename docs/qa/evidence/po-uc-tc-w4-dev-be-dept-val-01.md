# Evidence — PO-UC-TC-W4-DEV-BE-DEPT-VAL-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEV-BE-DEPT-VAL-01` |
| **date** | 2026-08-04 |
| **role** | dev-be |
| **ack_status** | `READY_FOR_QA` |
| **u65_zero_seed** | true |
| **change_mode** | FIX |
| **residual_closed** | `R-W4E1-DEPT-EMPTY-201` (pending QA browser retest) |

## spec_read_ack

| Field | Cite |
|-------|------|
| **by-uc / SRS** | `docs/qa/professional/by-uc/UC-CC-P0-03.md` · FN-DEPT-ADD · **TC-CC-P0-03-DEPT-ADD-FD-001** (empty mã/tên → 4xx) |
| **QA residual** | `docs/qa/evidence/po-uc-tc-w4-qa-e1-xbos-rollup.md` · `R-W4E1-DEPT-EMPTY-201` |
| **tech / API** | `POST/PUT /api/xbos/org-foundation/org-units` · `OrgFoundationService.upsertOrgUnit` |
| **TRAINING** | `PO_PM_SENIOR_TRAINING_PACK_20260804.md` §5 Dev-BE |
| **must_keep** | AU member 409 holding; happy CRUD dept; RACI/AUTH paths |
| **forbidden** | seed · Leave L2 · broad org rewrite |

## Root cause (spec says / code did)

| Spec says | Code did (before) |
|-----------|-------------------|
| Empty mã/tên → **4xx** (FD) | BE already rejected empty via `XBOS-ORG-400`, but **FE** `submitDepartmentRow` invented `PB-${Date.now()}` + name `Phòng ban` → Network **POST 201** `XBOS-ORG-201` (`acceptedEmpty=true`) |

## Fix

1. **BE** (`org-foundation.service.ts`): empty/whitespace `code` or `name` → **`XBOS-VAL-014`** HTTP **400** (`Mã và tên phòng ban là bắt buộc`); missing `orgType` also `XBOS-VAL-014`. Trimmed values used on INSERT/UPDATE.
2. **FE gate (required for BE truth)** (`CommandCenterPage.tsx`): removed invent defaults so blank Lưu posts empty strings → BE VAL.
3. **Jest**: empty code → VAL-014; empty name → VAL-014; valid → INSERT with trimmed code/name.
4. **CODE-MEMORY-CHANGE** APPEND on service + CommandCenterPage.
5. by-uc stamp → READY_FOR_QA.

## Verify

```bash
pnpm --filter xbos-api exec jest src/org-foundation/org-foundation.service.spec.ts src/org-foundation/p1-web-acceptance-org-units-scope.spec.ts --no-coverage
# EXIT 0 — 2 suites, 11 tests
```

| Suite | Result |
|-------|--------|
| `org-foundation.service.spec.ts` (incl. VAL-014 + industry + legal) | PASS |
| `p1-web-acceptance-org-units-scope.spec.ts` (must_keep UF-XBOS-12 partition) | PASS |

Note: `org-foundation.controller.spec.ts` has pre-existing AUTH fixture failures (`XBOS-AUTH-001`) — **not** introduced by this wave; must_keep AUTH/RACI not modified.

## must_keep check

| Item | Status |
|------|--------|
| Happy create valid mã → INSERT / `XBOS-ORG-201` path | Jest valid case PASS |
| Member AU 409 holding | Untouched |
| RACI / AUTH paths | Untouched |
| Scope legalEntityId partition | p1-web-acceptance PASS |

## Residual

- None for this WI after QA browser PASS on FD.
- QA must confirm Network: blank Lưu → **4xx** `XBOS-VAL-014` (or no 2xx invent); HP ADD still 201 + F5.

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-DEV-BE-DEPT-VAL-01
next_owner: qa
evidence_path: docs/qa/evidence/po-uc-tc-w4-dev-be-dept-val-01.md
```
