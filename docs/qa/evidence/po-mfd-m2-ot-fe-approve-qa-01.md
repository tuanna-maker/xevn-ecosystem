# Evidence — PO-MFD-M2-OT-FE-APPROVE-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-OT-FE-APPROVE-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **hdsd_align** | Attendance → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca → Duyệt |
| **spec_ref** | FR-HRM-AT-10 / ATT-C4 OT · residual `R-MFD-M2-OT-FE-APPROVE` from leave-scope GWC |
| **ack_status** | **BLOCKED** |
| **uat_done** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` | **PASS** (hrm `:28001`, xbos `:28002`, portal `:5173`, proxy employees + catalog-sync) |
| Seed | **None** (U65) |
| API invent OT / DB insert | **None** |

## Persona / URL

| Role | Account | JWT OU | URL under test |
|------|---------|--------|----------------|
| NV (create) | `uat.nv0007@xe.vn` / `xevn-uat-2026` | `trsport` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| QL (approve) | `uat.nv0002@xe.vn` / `xevn-uat-2026` | `trsport` | same URL (not reached — create blocked) |

Leave-seat parity: member scope **`companyId=trsport`**.

## HDSD inventory (U76)

| # | Surface | Observed |
|---|---------|----------|
| 1 | Attendance embed mount | 🟢 Overview loads |
| 2 | Menu **Quản lý đơn** → **Đăng ký làm thêm** | 🟢 Dropdown opens; OT list API fires |
| 3 | CTA **Thêm đơn tăng ca** | 🔴 never mounts — content stuck **Đang tải...** |
| 4 | Submit create → Network 2xx | ⬜ not reached |
| 5 | QL detail → **Duyệt** → F5 | ⬜ not reached |

## UF — OT create → approve (U65 browser)

### UF-OT-FE-CREATE-APPROVE-01

- **Click path:** Login NV → `/hr/attendance?…companyId=trsport` → Quản lý đơn → Đăng ký làm thêm
- **Trước mutate:** N/A — tab never left loading
- **Network create:** **none** (no POST `overtime-requests`)
- **Network list:** GET `/api/hrm/attendance/overtime-requests?company_id=trsport` → **200** × **124** in ~20s (fetch storm)
- **Header note:** request `x-company-id=main` while query `company_id=trsport` (storage/rollup interaction) — OBS; not the create blocker
- **FE:** centered **Đang tải...**; button inventory = nav only (no Thêm đơn tăng ca)
- **Screenshot:** `docs/qa/evidence/screens/po-mfd-m2-ot-fe-approve-qa-01/01-ot-no-create-cta.png`
- **Verdict:** 🟡 **BLOCKED** (AC #3 — no create CTA; do not invent PASS; no seed)

### Root cause class (product — for PM → dev-fe)

Same pattern as closed workshift loop (`useWorkShifts` unstable `h` helper in `useCallback` deps):

```ts
// apps/web/hrm/src/hooks/useOvertimeRequests.ts
const h = (key: string): string => t(`hk.overtime.${key}`) as string;
const fetchRequests = useCallback(async () => { … setIsLoading(true) … }, [currentCompanyId, toast, t, h]);
useEffect(() => { fetchRequests(); }, [fetchRequests]);
```

`h` is a new function every render → `fetchRequests` identity churn → effect re-fires → `isLoading` stays true → `OvertimeRequestTab` never renders CTA / table → cannot FE-create OT → cannot Duyệt.

**Note:** OT approve UI is detail-modal (Eye → Duyệt), not list-level Duyệt — prior scope seat `pendingApproveBtns=0` was also blocked by empty pending; this seat cannot create the FE-origin row until loading storm fixed.

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-ot-fe-approve-qa-01-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-ot-fe-approve-qa-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-ot-fe-approve-qa-01/` |
| Prior leave GWC | `docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md` |

## Residuals

| ID | Owner | Note |
|----|-------|------|
| **R-MFD-M2-OT-FE-LOADING** | **dev-fe** | Stabilize `useOvertimeRequests` deps (mirror `useWorkShifts` fix); CTA + list must settle; no GET storm |
| **R-MFD-M2-OT-FE-APPROVE** | qa (after FE) | Retest U65 create→approve→F5 after loading CLOSED |
| OBS header `x-company-id=main` on OT list | optional | Query already `trsport`; document if mutate path inherits |

## Forbidden claims (honesty)

- **Not** invent OT create/approve PASS
- **Not** seed / API invent OT rows
- **Not** retest leave C4 (already CLOSED)
- **Not** full Attendance CLOSED
- **uat_done** remains **false**

## completion_report

**Closed:** U65 attempt to close `R-MFD-M2-OT-FE-APPROVE` — L0 PASS; OT menu reachable; Network proves OT list endpoint alive but FE stuck loading so create CTA absent → honest **BLOCKED** with screenshot + storm evidence (124 GETs).

**Open:** FE loading storm on `useOvertimeRequests` blocks all OT FE mutate AC. Approve path not exercised.

## next_owner

**pm** → **dev-fe** (fix loading storm) → then **qa** retest this WI

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-OT-FE-LOADING-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true
entry_criteria: QA BLOCKED docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md — OT tab stuck Đang tải; GET overtime-requests storm (124/20s); CTA Thêm đơn tăng ca never mounts
exit_criteria: Fix useOvertimeRequests unstable h/t deps (mirror useWorkShifts); list settles; CTA visible; jest/smoke; READY_FOR_QA; no seed
allowed_paths: apps/web/hrm/src/hooks/useOvertimeRequests.ts (+ test if present)
must_keep: createOvertimeRequest/approveOvertimeRequest contracts; OvertimeRequestTab Eye→Duyệt modal flow
forbidden: seed OT rows; invent QA PASS
evidence_path: docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md
ack_status: READY_FOR_QA
read_first: docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md · apps/web/hrm/src/hooks/useOvertimeRequests.ts · docs/qa/evidence/po-uc-tc-w4-fe-att-workshift-update-loop-01.md
```

After FE READY_FOR_QA, re-dispatch:

```text
work_item_id: PO-MFD-M2-OT-FE-APPROVE-QA-01-R2
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
hdsd_align: Attendance → Làm thêm → Thêm đơn tăng ca → Eye → Duyệt → F5
entry_criteria: PO-MFD-M2-OT-FE-LOADING-01 READY_FOR_QA; L0 qc:fe-be-health PASS
exit_criteria: NV uat.nv0007 FE create OT 2xx; QL uat.nv0002 detail Duyệt 2xx + FE status + F5; evidence docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md updated or -r2; ack PASS_TO_PM/FAIL/BLOCKED; uat_done false
cấm: seed · API invent OT · claim ATT CLOSED
```
