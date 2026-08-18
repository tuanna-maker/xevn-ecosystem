# Evidence — `PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01`

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **change_mode** | FIX |
| **prior QA FAIL** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md` |
| **spec_ref** | `docs/qa/professional/by-uc/HRM-NT-01.md` §10 · AC-NT01-MARK-01 |

---

## Choice (FE-first)

**Option A:** FE resolves slug → UUID for mark PATCH query `company_id` via `resolveHrmMetadataCompanyUuid` (same map as metadata mutate). Prefer `row.company_id` from list (already UUID) in the hook; API layer also resolves slug defensively.

**Not chosen:** BE DTO slug parity — list already accepts slug; mark stays `@IsUUID()`; no BE touch this wave.

`x-company-id` header continues via `hrmOuMutateOpts` (JWT/OU slug `trsport`) — scope header unchanged.

---

## What changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `markHrmInboxNotificationRead` → query UUID; throw if unresolvable; CODE-MEMORY APPEND |
| `apps/web/hrm/src/hooks/useHrmInboxNotifications.ts` | Prefer `row.company_id` UUID; reject broadcast NULL; CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/hrmInboxNotificationDisplay.ts` | ADD `canMarkHrmInboxPersonalRead` |
| `apps/web/hrm/src/pages/InboxNotifications.tsx` | Mark CTA only when personal unread |
| `apps/web/hrm/src/components/layout/AppHeader.tsx` | Bell click mark only personal |
| `hrmApi.markInboxRead.test.ts` | Assert slug→UUID query; UUID passthrough |
| `hrmInboxNotificationDisplay.test.ts` | Personal vs broadcast CTA |

**must_keep:** GET inbox proxy path; ceo@ EXPECTED_NO_INBOX; U65 no seed.

---

## Verify

```bash
cd apps/web/hrm
pnpm exec vitest run src/integrations/hrmApi.markInboxRead.test.ts src/lib/hrmInboxNotificationDisplay.test.ts
```

**Result (2026-08-04):** Test Files 2 passed · Tests **5/5** (slug → `10000000-0000-4000-8000-000000000002`; broadcast CTA false).

---

## QA R4 AC (copy)

Persona `uat.nv0007@xe.vn` · `/hr/notifications?portal=1&companyId=trsport`

1. GET inbox **200** `HRM-NOTIF-200` + list visible  
2. «Đánh dấu đã đọc» on **personal** row → PATCH **HRM-NOTIF-202** / 2xx with UUID `company_id` (not `trsport`)  
3. FE after 2xx + F5 — row read  
4. Broadcast NULL — **no** mark CTA  
5. `ceo@xe.vn` — EXPECTED_NO_INBOX **PASS**

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md
completion_report: FIX Option A — mark PATCH query company_id UUID (resolveHrmMetadataCompanyUuid / row.company_id); hide mark CTA on broadcast NULL; vitest mark + display; GET proxy + ceo EXPECTED_NO_INBOX untouched; no BE; no seed.
next_owner: qa
```
