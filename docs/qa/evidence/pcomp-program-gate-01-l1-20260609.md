# PCOMP-PROGRAM-GATE-01-L1 — L1 API integration gate

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-PROGRAM-GATE-01-L1` |
| **date** | 2026-06-09 |
| **from_role** | pm |
| **to_role** | qa |
| **environment** | Windows local · HRM `:28001` · XBOS `:28002` · DB `113.20.107.184` |
| **entry** | PCOMP-L0-STACK-01 PASS — hrm-api + xbos-api up |
| **ack_status** | **PASS_TO_PM** |

---

## Executive verdict

| Layer | Command | Exit | Verdict |
|-------|---------|------|---------|
| **L0** | `pnpm run qc:dev-stack` | **0** | **PASS** — HRM + XBOS HTTP 200 |
| **L1** | `pnpm run test:system:uat` | **0** | **PASS** — verdict PASS, 37/0/0 |
| **Capability** | `pnpm run verify:capabilities` | **0** | **PASS** — pass=23 skip=35 fail=0 |

**Overall:** **PASS_TO_PM** — L1 API integration gate closed on local stack.

---

## 1. `pnpm run qc:dev-stack` (L0 confirm)

**Exit code:** `0`  
**Timestamp:** 2026-06-09 (local)

```
qc:dev-stack — xevn-ecosystem (HRM + XBOS + portal)

✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✗ web-portal (optional): fetch failed ← http://127.0.0.1:5173

HRM + XBOS healthy — có thể chấp nhận bước QC dev (chạy thêm `pnpm run qc:fe-be-health` trước UAT).
```

| Gate | Verdict |
|------|---------|
| G-L0-hrm | **PASS** |
| G-L0-xbos | **PASS** |
| G-L0-portal | **SKIP** (optional — not required for L1) |

---

## 2. `pnpm run test:system:uat` (L1)

**Exit code:** `0`  
**Started:** `2026-06-08T13:30:20.837Z`  
**Report:** `docs/qa/evidence/system-integration-uat-report.json`

| Metric | Value |
|--------|------:|
| **verdict** | **PASS** |
| PASS | 37 |
| FAIL | 0 |
| SKIP | 0 |

### Phase coverage

| Phase | Scenarios | Status |
|-------|-----------|--------|
| P0 | hrm-api-health, xbos-api-health | PASS |
| P1 | db-workforce-count-roles-tenant (1000 NV, 25 roles) | PASS |
| P2 | xbos-portal-login-rbac | PASS |
| P3 | mobile-login roles (CEO…CUSTOMER_SUCCESS) + batch sample | PASS |
| P4 | tenant-scope-header-mismatch | PASS |
| P5 | attendance create/list, mobile JWT UUID scope, leave, payroll | PASS |
| P6 | manager-approve-leave, db-spot-check-ceo | PASS |

**Not in L1 scope:** L2 P-CC-* portal matrix, L2.5 J-* cross-navigation (separate QA wave).

---

## 3. `pnpm run verify:capabilities` (capability smoke)

**Exit code:** `0`  
**Script:** `scripts/verify-capability-e2e.mjs`

| Metric | Value |
|--------|------:|
| pass | **23** |
| skip (document/manual) | 35 |
| fail | **0** |

**Contrast vs PCOMP-PROGRAM-GATE-01 (stack down):** prior run had fail=23 HTTP 0; with L0 up all mapped HTTP smokes return expected 401/404 (unauthenticated probe — route reachable).

**Representative PASS (route reachable):**

- `CC-GROUP-MEMBER-UNITS` — HTTP 401
- `G22-PORTAL-AUTH` — HTTP 401
- `G26-HRM-ATTENDANCE` — HTTP 401
- `AUTH-TENANT-ACCESSIBLE` — HTTP 401
- `G19-CATALOG-GOVERNANCE-API` — HTTP 404 (route exists)

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| web-portal `:5173` down | dev-fe / qa | Required for L2 P-CC-* — start `pnpm run dev:web-only` |
| `qc:fe-be-health` | qa | Not in L1 entry; run before L2 portal embed |
| L2 P-CC-* matrix | qa | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| L2.5 J-* journeys | qa | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| Phase 1 DONE | pm | Still blocked — sponsor UAT, open TODO rows |

---

## Handoff

**completion_report:** PCOMP-PROGRAM-GATE-01-L1 closed. L0 confirm exit 0; L1 `test:system:uat` PASS 37/0; capability smoke pass=23 fail=0 (unblocks prior PROGRAM-GATE-01 residual). L2/L2.5 not executed in this work item.

**next_owner:** pm

**next_dispatch_prompt:**

```
work_item_id: PCOMP-PROGRAM-GATE-01-L2
from_role: pm
to_role: qa
lane: execution

entry_criteria:
- PCOMP-PROGRAM-GATE-01-L1 PASS (this evidence)
- Start web-portal `pnpm run dev:web-only` if :5173 down

action:
1. pnpm run qc:fe-be-health (or :pilot if nip.io target)
2. L2 P-CC-* rows in docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md (ceo@xe.vn)
3. L2.5 J-* in docs/program/PROGRAM_JOURNEY_MAP.md — list→detail, no 409/404 scope

exit_criteria:
- evidence docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md
- ack_status PASS_TO_PM or FAIL_TO_PM with defect IDs

evidence_path: docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md
```

**evidence_path:** `docs/qa/evidence/pcomp-program-gate-01-l1-20260609.md`

**ack_status:** **PASS_TO_PM**
