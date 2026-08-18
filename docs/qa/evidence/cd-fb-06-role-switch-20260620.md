# CD-FB-06 — Role / company switch (F3)

**work_item_id:** CD-FB-06-ROLE-SWITCH  
**date:** 2026-06-20  
**owner:** dev-fe  
**spec_ref:** `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 · `ADR-HRM-RBAC-SCOPE-LADDER.md` §5.3  
**ack_status:** READY_FOR_QA

---

## Summary

Implemented portal membership switch with JWT re-issue, HRM embed scope context chips, and operating-unit viewing banner — without cache-bust remount on tab navigation (coordinates with P1-HRM-PERF-FE-01).

| AC | Implementation | Status |
|----|----------------|--------|
| AC-CD-F3-01 | `HrmEmbedScopeBar` + `PortalEmbedScopeBar` chips (ĐVTV + role) | **FE DONE** — QA screenshot |
| AC-CD-F3-02 | `HrmOperatingUnitFilter` invalidates RQ + «Đang xem» banner | **FE DONE** — QA network |
| AC-CD-F3-03 | Group CEO embed filter; JWT stays `main` (hint in scope bar) | **FE DONE** |
| AC-CD-F3-04 | `POST /api/xbos/auth/select-membership` + portal header switcher | **FE+BE DONE** — QA persona matrix |
| AC-CD-F3-05 | Member CEO: static scope chip when `tenants.length <= 1` | **FE DONE** |
| AC-CD-F3-06 | Member persona isolation | **QA** — `du-lich.ceo@xe.vn` |

---

## Changed files

### Backend (xbos-api)

| File | Change |
|------|--------|
| `auth/dto/select-membership.dto.ts` | New DTO |
| `auth/auth.service.ts` | `selectMembership()` JWT re-issue |
| `auth/auth.controller.ts` | `POST auth/select-membership` |
| `auth/auth.service.spec.ts` | UC-HRM-SCOPE-04 cases |
| `auth/auth.controller.spec.ts` | 401 guard |

### Portal (web-portal)

| File | Change |
|------|--------|
| `integrations/authSession.ts` | `selectPortalMembership()` |
| `integrations/scopeRoleLabels.ts` | Role chip labels |
| `contexts/AuthContext.tsx` | `selectMembership` + `membershipSwitching` |
| `components/layout/TopHeader.tsx` | Membership switcher → API; hide when single tenant |
| `modules/hrm/HrmEmbedScopeBar.tsx` | Context chips + drift banner |
| `modules/hrm/HrmWorkspaceRoute.tsx` | Scope bar wired; `scopeRevision` only on tenant/JWT change |

### HRM embed (apps/web/hrm)

| File | Change |
|------|--------|
| `components/hrm/PortalEmbedScopeBar.tsx` | Role/tenant chips |
| `components/hrm/HrmOperatingUnitFilter.tsx` | «Đang xem: {ĐVTV}» banner |

---

## P1-HRM-PERF-FE-01 coordination

- **Before:** `cacheBustRef` bumped on every `portalSuffix` (tab) change → full iframe remount storm.
- **After:** `_v` cache bust only when `selectedTenant.tenantId` or `accessToken` changes (membership switch).
- Tab navigation still updates iframe `src` path but does not force extra `_v` remount.

---

## Tests run

```bash
pnpm exec jest --testPathPatterns="auth.service|auth.controller" --passWithNoTests
pnpm -C apps/web/web-portal exec vitest run src/integrations/scopeRoleLabels.test.ts src/integrations/authSession.test.ts
```

---

## QA handoff (U65 browser)

| Persona | Steps | Expect |
|---------|-------|--------|
| `ceo@xe.vn` | CC HRM → chip visible → filter `trsport` | Banner «Đang xem»; list refetch; JWT `main` unchanged |
| Multi-membership dev | Header switch tenant | `select-membership` 201; iframe reload; no stale rows |
| `du-lich.ceo@xe.vn` | HRM embed employees | No group rollup; static header (1 tenant) |

**J-***: J-HRM-INT-05 after switcher flows.

---

## Residual

- QA L2.5 browser evidence for AC-CD-F3-01..06 not captured in this wave (dev-fe unit tests only).
- Super-dev multi-membership UAT persona may need seed/bootstrap — sponsor lock: FE flow only.

---

## completion_report

Closed CD-FB-06 FE scope: portal `select-membership` UX, embed scope bars, operating-unit viewing banner, iframe scope revision decoupled from tab nav. Added minimal xbos-api endpoint required for JWT re-issue.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-SWITCH-QA
from_role: dev-fe
to_role: qa
entry_criteria: docs/qa/evidence/cd-fb-06-role-switch-20260620.md; delta §3 AC-CD-F3-01..06; U65 zero-seed
exit_criteria: Browser evidence ceo@xe.vn + du-lich.ceo@xe.vn; J-HRM-INT-05; network trace on membership + ĐVTV filter; PASS_TO_PM
evidence_path: docs/qa/evidence/cd-fb-06-role-switch-qa-20260620.md
ack_status: PASS_TO_PM
```
