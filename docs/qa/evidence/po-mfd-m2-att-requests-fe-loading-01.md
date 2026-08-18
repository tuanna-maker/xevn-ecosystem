# Evidence — PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **u65_zero_seed** | true |
| **change_mode** | FIX |
| **preserve_default** | true |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **spec_ref** | ATT-C4 · matrix #20/#22/#24 · residual QA `po-mfd-m2-att-requests-01-qa.md` |
| **qa_blocked_ref** | `docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md` |
| **pattern_ref** | `PO-MFD-M2-OT-FE-LOADING-01` / `useOvertimeRequests.ts` |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/SRS.md` · chấm công / Quản lý đơn (late-early, trip, shift-change) · ATT-C4 |
| **qa_fail** | `docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md` — #20/#22/#24 GET storm; CTA never mounts |
| **pattern** | `docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md` + `useOvertimeRequests.ts` (FIXED) |
| **tech_spec** | Nest list/create/approve/reject contracts unchanged (FE-only FIX) |
| **must_keep** | create/approve/reject late-early · trip · shift-change; OT #21 + update #23 LIVE |
| **forbidden** | `apps/api/**` · seed · OT hook regression · leave/OT/SHEETS/CLOCK closed slices |
| **sponsor_confirm** | PM dispatch FIX same class as OT loading — 2026-08-04 |

## Symptom (before)

| Surface | Matrix # | Idle GET/5s | CTA |
|---------|---------:|------------:|-----|
| late-early | 20 | **85** | ❌ spinner |
| business-trip | 22 | **94** | ❌ |
| shift-change | 24 | **55** | ❌ |
| OT (control) | 21 | **0** | 🟢 LIVE |
| update (control) | 23 | **0** | 🟢 LIVE |

API returned **200** on every GET — FE never settled → `isLoading` stuck → CTA never mounts → mutate U65 not reached.

## Root cause

Same class as closed `PO-MFD-M2-OT-FE-LOADING-01`:

```ts
const h = (key: string): string => t(`hk.*.${key}`) as string;
const fetchRequests = useCallback(async () => { … }, [currentCompanyId, toast, t, h]);
useEffect(() => { fetchRequests(); }, [fetchRequests]);
```

`h` new every render → `fetchRequests` identity churn → effect re-fires → GET storm.

## Fix (after)

| Hook | Change |
|------|--------|
| `useLateEarlyRequests.ts` | Remove `h`; inline `t('hk.lateEarly.*')`; deps `[currentCompanyId, toast, t]`; clear+`setIsLoading(false)` when `!currentCompanyId` |
| `useBusinessTripRequests.ts` | Same for `hk.businessTrip.*` |
| `useShiftChangeRequests.ts` | Same for `hk.shiftChange.*`; keep `updateRequest` local helper |
| Colocated vitest ×3 | Source-guard (no `h` in deps; contracts present) |

`@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` APPEND on all three hooks.

**Untouched (must_keep):** `useOvertimeRequests.ts` (already FIXED); update-attendance path.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useLateEarlyRequests.ts` | FIX deps + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useBusinessTripRequests.ts` | FIX deps + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useShiftChangeRequests.ts` | FIX deps + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useLateEarlyRequests.test.ts` | ADD source-guard (3) |
| `apps/web/hrm/src/hooks/useBusinessTripRequests.test.ts` | ADD source-guard (3) |
| `apps/web/hrm/src/hooks/useShiftChangeRequests.test.ts` | ADD source-guard (3) |
| `docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md` | This evidence |

## Automated verify

```bash
cd apps/web/hrm && pnpm exec vitest run \
  src/hooks/useLateEarlyRequests.test.ts \
  src/hooks/useBusinessTripRequests.test.ts \
  src/hooks/useShiftChangeRequests.test.ts \
  src/hooks/useOvertimeRequests.test.ts
```

Result: **12 passed / 0 failed** (vitest v2.1.9, exit 0) — includes OT regression guard.

## must_keep (unchanged)

- late-early / trip / shift-change create · approve · reject · delete Nest contracts
- shift-change `updateRequest` local state helper
- OT hook FIXED (`PO-MFD-M2-OT-FE-LOADING-01`) — not reopened
- Update-attendance #23 LIVE — not touched
- U65 zero-seed (no invent rows)

## QA smoke required (U65 browser)

`work_item_id`: **PO-MFD-M2-ATT-REQUESTS-01-R2**

| Step | Action | Expected |
|------|--------|----------|
| 1 | L0 `pnpm run qc:fe-be-health` | PASS |
| 2 | Login NV `uat.nv0007@xe.vn` → `/hr/attendance?…companyId=trsport` | Overview OK |
| 3 | Quản lý đơn → **Đăng ký đi muộn, về sớm** | Idle GET **≤2 / 5s**; CTA mounts; list settles |
| 4 | Create late-early from FE → Network **2xx** | Row appears; **F5** keeps |
| 5 | Spot trip + shift-change tabs | Idle GET ≤2/5s; CTA visible (no storm) |
| 6 | Spot OT (#21) + update (#23) | Still LIVE — no regression |

**cấm:** seed · API invent · invent ATT CLOSED · PASS without idle+CTA settle

## Residual

- Browser retest only — code FIX complete
- Approve chain for late-early/trip/shift-change: after list settles, optional QL path (not invent FAIL if out of R2 scope)

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Removed unstable `h()` from late-early / trip / shift-change fetch deps (mirror OT). Vitest 12/12 incl. OT guard. |
| **next_owner** | qa |
| **ack_status** | READY_FOR_QA |
| **evidence_path** | `docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-REQUESTS-01-R2
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
u76_hdsd_align: true
entry_criteria: FE FIX READY_FOR_QA @ docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md; L0 qc:fe-be-health PASS; hard reload FE
exit_criteria: #20 late-early idle GET ≤2/5s + CTA mounts + create 2xx + F5; #22 trip + #24 shift-change idle+CTA (no storm); #21 OT + #23 update still LIVE; evidence docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qa.md; ack_status PASS_TO_PM or FAIL with residual
cấm: seed · API invent · invent ATT CLOSED
persona: uat.nv0007@xe.vn / xevn-uat-2026 · companyId=trsport
URL: http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport
hdsd: Attendance → Quản lý đơn → late-early (primary mutate) + trip/shift-change spot
```
