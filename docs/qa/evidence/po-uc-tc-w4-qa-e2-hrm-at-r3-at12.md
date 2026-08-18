# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R3-AT12-L1`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R3-AT12-L1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **FAIL** (L1 CTA path proven; Duyệt POST **409** scope) |
| **U65** | honored — zero-seed · no invent Leave L2 PASS · no ceo@ as L1 |
| **U76** | `hdsd_align: true` |
| **BA prior** | [`po-uc-tc-w4-ba-at12-l1-cta-01.md`](po-uc-tc-w4-ba-at12-l1-cta-01.md) — EXPECTED_NO_CTA for Group CEO as L1 HP |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r3-at12-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r3-at12-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r3-at12/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r3-at12.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · L1 `uat.nv0002@xe.vn` / `trsport` · NV `uat.nv0007@xe.vn` |
| **commit** | `dc930c5` |
| **uat_done** | **false** |

---

## Executive verdict

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` + `qc:fe-be-health` | **PASS** (hrm/xbos/portal 200; fe-be ALL PASS) |
| BA persona lock (not `ceo@` as L1) | **Honored** — L1 = QL `uat.nv0002` (manager) |
| Tab «Chờ duyệt» with optional `(n)` | **PASS** — label `Chờ duyệt (1)` (regex not exact `/^Chờ duyệt$/`) |
| Duyệt / `hdsd-leave-list-approve*` count | **PASS** — `approveBtnCount=1` · testid `hdsd-leave-list-approve` |
| Click Duyệt → POST approve 2xx | **FAIL** — **409** `HRM-LEAVE-409` · `x-company-id=main` · message *Resource company_id is outside token scope* |
| FE status Đã duyệt + F5 | **Not reached** (approve not 2xx) |
| Leave L2 ladder | **SPEC_GAP** — **not PASS** |
| AT-07 | **Not reopened** |
| FE wire Duyệt for `ceo@` | **Not claimed / not tasked** (BA EXPECTED_NO_CTA stands) |

**promoted:** none (AT-12 L1 mutate)  
**not promoted:** AT-12 L1 approve 2xx · F5  
**Leave L2:** SPEC_GAP HOLD

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | L1 mount |
| 2 | Tab **Nghỉ phép** | Yes | AT-12 |
| 3 | Tab **Chờ duyệt (1)** | Yes | badge OK · harness regex allows `(n)` |
| 4 | Row Duyệt `hdsd-leave-list-approve` | Yes | count=1 |
| 5 | `+ Tạo yêu cầu nghỉ` | Yes | precond attempt — catalog empty |
| 6 | Leave L2 ladder | N/A | **SPEC_GAP** |

---

## Persona / precond

| Step | Result |
|------|--------|
| Mobile login `uat.nv0002@xe.vn` | **201** · company=`trsport` · roles `employee,manager` · emp `VTH-0002` |
| Mobile login `uat.nv0007@xe.vn` | **201** · company=`trsport` · emp `VTH-0007` · report of VTH-0002 |
| Report link | **PASS** — `manager_id` matches |
| FE create (NV / mgr-for-report) | **BLOCKED** — dialog opens; **leave_types catalog empty** on trsport (*Chưa có mục trong danh mục*); no POST create |
| Pending on mgr Chờ duyệt | **1** row visible (Phan Văn An / VTH-0007 · lý do product-uat-mob-pilot J-MOB-05) — list GET `company_id=trsport` **200** |

### Holding path probe (not sole L1)

`uat.nv0001@xe.vn` / JWT `companyId=holding` → FE `coerceHrmListCompanyId(holding→main)` → leave GET **409** SCOPE. Documented as residual; L1 HP executed on **trsport** manager instead (still QL trực tiếp).

---

## AT-12 L1 click path (manager)

1. Inject HRM mobile JWT `uat.nv0002` · GOTO `/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
2. **Nghỉ phép**
3. Tab **Chờ duyệt (1)** (not calendar-only)
4. Assert green **Duyệt** / `data-testid=hdsd-leave-list-approve` visible
5. Click **Duyệt**
6. Network: `POST /api/hrm/attendance/leave-requests/df9be630-0d21-4c1e-8eb2-ec0343dedf0b/approve` → **409** `HRM-LEAVE-409`
7. Request header `x-company-id` = **`main`** (token scope `trsport`)

Screens: `07-mgr-cho-duyet.png` (CTA visible) · `08-mgr-after-duyet.png`

---

## Root cause (product — not BA persona miss)

| Finding | Evidence |
|---------|----------|
| Duyệt CTA exists for QL on Chờ duyệt | R3 UI + `approveBtnCount=1` — confirms BA «not FE_BUG missing wire for ceo@» / wrong-surface R2 |
| Leave approve API client omits mutate scope | `apps/web/hrm/src/integrations/hrmApi.ts` `approveLeaveRequest` / `rejectLeaveRequest` call `requestHrm` **without** `resolveHrmMutateCompanyScope` (contrast: attendance update-request approve already wired U78-U84) |
| Default runtime scope → `main` on master tenant | POST approve header `x-company-id=main` → BE **409** outside token scope |
| FE create blocked on empty leave_types | NV create dialog warning catalog empty — U65 no seed sync |

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| AT-12 L1 PASS | **No** |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-07 reopened | **No** |
| FE must wire Duyệt for Group CEO | **No** |
| UAT DONE | **false** |

---

## Residuals → PM (`residual_auto_fix`)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-AT12-L1-APPROVE-SCOPE** | **P0** | **dev-fe** | Wire `approveLeaveRequest` / `rejectLeaveRequest` through `resolveHrmMutateCompanyScope` (mirror ATT update-request). Expect mgr `trsport` Duyệt → POST 2xx + F5 Đã duyệt. |
| **R-W4-AT12-L1-CREATE-CATALOG** | P1 | devops / settings | trsport `leave_types` catalog empty blocks U65 FE create; do **not** seed for UF — fix catalog sync path or FE empty-state. |
| **R-W4-AT12-L1-HOLDING-COERCE** | P2 | dev-fe / sa | `uat.nv0001` holding JWT + FE coerce→main → list 409; holding manager L1 path broken on embed. |
| Leave L2 | — | — | **SPEC_GAP HOLD** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R3-AT12-L1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md
next_owner: pm
seat_verdict: FAIL
l2: SPEC_GAP
uat_done: false
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: READY_FOR_QA

entry_criteria:
- QA R3 FAIL evidence: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md
- BA triage CLOSED: EXPECTED_NO_CTA for ceo@ as L1 — do NOT wire Duyệt for Group CEO
- Leave L2 remains SPEC_GAP — cấm invent PASS / cấm reopen AT-07

fix:
- apps/web/hrm/src/integrations/hrmApi.ts — approveLeaveRequest + rejectLeaveRequest must pass resolveHrmMutateCompanyScope (same pattern as approveAttendanceUpdateRequest / U78-U84)
- unit test: mgr JWT companyId=trsport → x-company-id=trsport on leave approve (not main)
- must_keep: list leave company_id query; Chờ duyệt CTA; ATT-07 path; U65 no seed

exit_criteria:
- READY_FOR_QA with evidence path
- QA retest: uat.nv0002@xe.vn · Nghỉ phép → Chờ duyệt (n) → Duyệt → POST leave-requests/:id/approve 2xx · FE Đã duyệt · F5
```
