# Evidence — PO-MFD-M2-OT-FE-LOADING-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-OT-FE-LOADING-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **u65_zero_seed** | true |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **spec_ref** | FR-HRM-AT-10 / ATT-C4 OT · residual `R-MFD-M2-OT-FE-LOADING` |
| **qa_blocked_ref** | `docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md` |

## Symptom (before)

- Quản lý đơn → Đăng ký làm thêm stuck **Đang tải...**
- CTA **Thêm đơn tăng ca** never mounts
- Network: GET `overtime-requests?company_id=trsport` **200 × ~124 / 20s** (fetch storm)

## Root cause

Same class as closed `useWorkShifts` loop:

```ts
const h = (key: string): string => t(`hk.overtime.${key}`) as string;
const fetchRequests = useCallback(async () => { … }, [currentCompanyId, toast, t, h]);
useEffect(() => { fetchRequests(); }, [fetchRequests]);
```

`h` new every render → `fetchRequests` identity churn → effect re-fires → `isLoading` stays true → `OvertimeRequestTab` early-returns loading UI.

## Fix (after)

- Removed unstable `h` helper.
- Toast/error strings use stable `t('hk.overtime.*')` directly (mirror `useWorkShifts` / `useLeaveRequests`).
- `fetchRequests` deps: `[currentCompanyId, toast, t]` only.
- When `!currentCompanyId`: clear list + `setIsLoading(false)` (no stuck spinner).
- create / approve / reject / delete contracts unchanged.
- `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` on hook.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useOvertimeRequests.ts` | FIX deps + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useOvertimeRequests.test.ts` | Source-guard vitest (3 cases) |

## Automated verify

```bash
cd apps/web/hrm && pnpm exec vitest run src/hooks/useOvertimeRequests.test.ts
```

Result: **3 passed / 0 failed** (vitest v2.1.9, exit 0).

## must_keep (unchanged)

- `createOvertimeRequest` / `approveOvertimeRequest` contracts
- OvertimeRequestTab Eye → detail modal → Duyệt flow
- U65 zero-seed (no OT invent)

## QA smoke required (U65 browser — next WI)

`work_item_id`: **PO-MFD-M2-OT-FE-APPROVE-QA-R2** (alias R2 of APPROVE-QA-01)

| Step | Action | Expected |
|------|--------|----------|
| 1 | L0 `pnpm run qc:fe-be-health` | PASS |
| 2 | Login NV `uat.nv0007@xe.vn` → `/hr/attendance?…companyId=trsport` | Overview OK |
| 3 | Quản lý đơn → Đăng ký làm thêm | List settles; **no** GET storm; CTA **Thêm đơn tăng ca** visible |
| 4 | Create OT from FE → Network 2xx | Row appears; F5 keeps |
| 5 | Login QL `uat.nv0002@xe.vn` → Eye → Duyệt → F5 | Status approved; 2xx |

**cấm:** seed · API invent OT · invent ATT CLOSED · invent PASS without create→approve chain

## Residual

| ID | Owner | Note |
|----|-------|------|
| **R-MFD-M2-OT-FE-APPROVE** | qa | Retest U65 create→approve after loading CLOSED |
| OBS `x-company-id=main` on list | optional | Query already `trsport`; watch mutate header on R2 |

## completion_report

**Closed:** FE fetch storm on `useOvertimeRequests` — unstable `h` removed; deps stable; vitest guard; CODE-MEMORY APPEND.

**Open:** Browser U65 create→approve not claimed here (handoff QA R2).

## next_owner

**qa** — `PO-MFD-M2-OT-FE-APPROVE-QA-R2`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-OT-FE-APPROVE-QA-R2
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
hdsd_align: Attendance → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca → Eye → Duyệt → F5
entry_criteria: PO-MFD-M2-OT-FE-LOADING-01 READY_FOR_QA (docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md); L0 qc:fe-be-health PASS; no seed
exit_criteria: NV uat.nv0007 FE create OT 2xx + list settles (≤2 GET idle 5s, CTA visible); QL uat.nv0002 Eye→Duyệt 2xx + FE status + F5; evidence update po-mfd-m2-ot-fe-approve-qa-01.md or -r2; ack PASS_TO_PM/FAIL/BLOCKED; uat_done false
cấm: seed · API invent OT · claim ATT CLOSED · invent PASS
persona: uat.nv0007@xe.vn (create) / uat.nv0002@xe.vn (approve) / xevn-uat-2026 · companyId=trsport
```
