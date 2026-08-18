# CD-FB-06 — Role / company switch FE (F3) — 2026-07-19

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-SWITCH` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 · `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §5.3 |
| **sponsor_lock** | U67 + U65 zero-seed · no Phase1/PROD claim · no waive |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-07-19 |

---

## spec_read_ack

- **srs / delta:** `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 — UC-HRM-SCOPE-04/05, BR-CD-F3-01..05, AC-CD-F3-01..06
- **tech_spec / ADR:** `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §5.1–5.3 — portal `POST /api/xbos/auth/select-membership` JWT re-issue
- **change_mode:** ADD (harden UX gaps on prior 2026-06-20 baseline)
- **must_keep:** Embed ĐVTV filter ≠ JWT mutate (AC-CD-F3-03); iframe remount only on membership/token (P1-HRM-PERF-FE-01)
- **forbidden:** Seed for acceptance; claim Phase1/PROD DONE

---

## Summary

Closed FE gaps for customer demo F3 (role/company clarity):

1. **Mounted** `PortalEmbedScopeBar` in HRM `AppLayout` (embed + standalone) — prior wave had component but never rendered (AC-CD-F3-01).
2. **Portal** `HrmEmbedScopeBar`: legal-name chip + red drift banner with CTA **«Đồng bộ phiên»** → `selectMembership` JWT re-issue.
3. **TopHeader**: membership switcher shows ĐVTV name · role; multi-membership only (`tenants.length > 1`).
4. **GlobalFilter**: after memberships refresh, **keeps** current tenant selection (no silent auto-pick overwrite).
5. JWT role helper `getPortalJwtRoleCode` for iframe chips when membership stub is `portal`.

---

## AC mapping (FE)

| AC | Implementation | FE status |
|----|----------------|-----------|
| **AC-CD-F3-01** | Portal `HrmEmbedScopeBar` + iframe `PortalEmbedScopeBar` chips (ĐVTV + role VI) | **DONE** — QA screenshot |
| **AC-CD-F3-02** | `HrmOperatingUnitFilter` + `invalidateQueries` + «Đang xem: {legalName}» | **DONE** — QA network |
| **AC-CD-F3-03** | Scope bar hint: OU filter does not mutate JWT `main` | **DONE** |
| **AC-CD-F3-04** | Header → `POST select-membership` → persist JWT → iframe `scopeRevision` remount | **DONE** — QA persona |
| **AC-CD-F3-05** | Member CEO: static chip when ≤1 membership | **DONE** |
| **AC-CD-F3-06** | Member isolation `du-lich.ceo@xe.vn` | **QA** browser |

---

## Changed files (this wave)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/layout/AppLayout.tsx` | Mount `PortalEmbedScopeBar` |
| `apps/web/hrm/src/components/hrm/PortalEmbedScopeBar.tsx` | Always-on chip; JWT role; OU viewing chip |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` | `getPortalJwtRoleCode()` |
| `apps/web/web-portal/src/modules/hrm/HrmEmbedScopeBar.tsx` | Drift CTA «Đồng bộ phiên» |
| `apps/web/web-portal/src/components/layout/TopHeader.tsx` | ĐVTV · role labels |
| `apps/web/web-portal/src/contexts/GlobalFilterContext.tsx` | Preserve selected membership |
| `apps/web/hrm/src/components/hrm/__tests__/portalEmbedScopeBar.test.ts` | Label unit tests |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.test.ts` | roleCode claim test |
| `apps/web/web-portal/src/integrations/scopeRoleLabels.test.ts` | AC-CD-F3-01 cases |

---

## Tests run

```bash
pnpm -C apps/web/web-portal exec vitest run src/integrations/scopeRoleLabels.test.ts src/integrations/authSession.test.ts
# → 12 passed

pnpm -C apps/web/hrm exec vitest run src/components/hrm/__tests__/portalEmbedScopeBar.test.ts src/lib/hrmSpreadsheetScope.test.ts
# → exit 0 (portalEmbedScopeBar + hrmSpreadsheetScope incl. roleCode)
```

---

## QA handoff (U65 browser-only)

| Persona | Click path | Expect |
|---------|------------|--------|
| `ceo@xe.vn` / `Xevn@2026` | Login → Command Center → HRM employees | Parent + iframe chips visible (not UUID-only); filter `trsport` → «Đang xem»; Network GET refetch; JWT `companyId` stays `main` |
| Multi-membership (if available) | Header membership switch | `POST /api/xbos/auth/select-membership` 2xx; iframe remount; no stale tenant rows |
| `du-lich.ceo@xe.vn` | HRM embed | Static header (1 membership); no group rollup NV |

**J-*:** `J-HRM-INT-05` after switcher / OU filter.

**Cấm:** `pnpm seed:*` · API-only PASS without FE post-2xx.

---

## Residual

- Browser screenshots / network traces for AC-CD-F3-01..06 — **QA**.
- Super-dev multi-membership persona may be sparse without sponsor bootstrap — still U65 FE-only.

---

## completion_report

Closed CD-FB-06 FE: context chips mounted end-to-end, membership JWT switcher UX, OU viewing banner + RQ invalidate, drift CTA sync session. Unit evidence PASS. Residual = QA U65 browser L2/L2.5.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-SWITCH
from_role: pm
to_role: qa
entry_criteria: docs/qa/evidence/cd-fb-06-role-switch-fe-20260719.md READY_FOR_QA; delta §3 AC-CD-F3-01..06; U65 zero-seed
exit_criteria: Browser evidence ceo@xe.vn + du-lich.ceo@xe.vn; chips visible; OU filter refetch; membership switch JWT if multi-hat; J-HRM-INT-05; PASS_TO_PM
evidence_path: docs/qa/evidence/cd-fb-06-role-switch-qa-20260719.md
ack_status: PASS_TO_PM
cấm: seed · probe-only PASS
```

**ack_status:** **READY_FOR_QA**
