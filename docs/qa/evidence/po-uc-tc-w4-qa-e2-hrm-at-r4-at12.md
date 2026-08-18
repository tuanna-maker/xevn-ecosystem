# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **PASS** (L1 approve 2xx + scope; L2 = SPEC_GAP only) |
| **U65** | honored — zero-seed · no invent Leave L2 PASS · no ceo@ as L1 |
| **U76** | `hdsd_align: true` |
| **prior FAIL** | [`po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md`](po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md) · residual `R-W4-AT12-L1-APPROVE-SCOPE` |
| **FE fix** | [`po-uc-tc-w4-fe-at12-l1-approve-scope-01.md`](po-uc-tc-w4-fe-at12-l1-approve-scope-01.md) |
| **BA lock** | EXPECTED_NO_CTA for `ceo@` as L1 — **stands** (not used) |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r4-at12/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r4-at12.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · L1 `uat.nv0002@xe.vn` / `trsport` |
| **commit** | `dc930c5` |
| **uat_done** | **false** |

---

## Executive verdict

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` + `qc:fe-be-health` | **PASS** (hrm/xbos/portal 200; fe-be ALL PASS) |
| BA persona lock (not `ceo@` as L1) | **Honored** — L1 = QL `uat.nv0002` (manager) |
| Tab «Chờ duyệt (1)» | **PASS** |
| Duyệt / `hdsd-leave-list-approve` | **PASS** — `approveBtnCount=1` |
| Click Duyệt → POST approve 2xx | **PASS** — **201** `HRM-LEAVE-203` · `requestStatus=approved` |
| Request header `x-company-id` | **PASS** — **`trsport`** (not `main`) — closes R3 FAIL |
| FE status Đã duyệt (immediate) | **PASS** |
| F5 still Đã duyệt | **PASS** |
| Leave L2 ladder | **SPEC_GAP** — **not PASS** |
| AT-07 | **Not reopened** |
| FE wire Duyệt for `ceo@` | **Not claimed** |

**promoted:** AT-12 L1 approve mutate (QL trsport)  
**not promoted:** Leave L2 · full UAT DONE · FE create leave (catalog empty residual)  
**Leave L2:** SPEC_GAP HOLD  
**Residual closed:** `R-W4-AT12-L1-APPROVE-SCOPE`

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | L1 mount |
| 2 | Tab **Nghỉ phép** | Yes | AT-12 |
| 3 | Tab **Chờ duyệt (1)** | Yes | L1 approve |
| 4 | Row Duyệt `hdsd-leave-list-approve` | Yes | click |
| 5 | `+ Tạo yêu cầu nghỉ` | Yes | precond attempt — catalog empty (BLOCKED) |
| 6 | Leave L2 ladder | N/A | **SPEC_GAP** |

---

## AT-12 L1 click path (manager)

1. Inject HRM mobile JWT `uat.nv0002` · GOTO `/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
2. **Nghỉ phép**
3. Tab **Chờ duyệt (1)**
4. Assert green **Duyệt** / `data-testid=hdsd-leave-list-approve` visible
5. Click **Duyệt**
6. Network: `POST /api/hrm/attendance/leave-requests/df9be630-0d21-4c1e-8eb2-ec0343dedf0b/approve` → **201** `HRM-LEAVE-203`
7. Request header `x-company-id` = **`trsport`** (R3 was `main` → 409)
8. FE shows **Đã duyệt** · F5 → still **Đã duyệt** / `approved`

Screens: `07-mgr-cho-duyet.png` · `08-mgr-after-duyet.png` · `09-mgr-f5.png`

---

## Precond note (U65)

| Step | Result |
|------|--------|
| Mobile login mgr / nv | **201** · `trsport` · report link PASS |
| FE create NV / mgr-for-report | **BLOCKED** — trsport `leave_types` catalog empty (same as R3) |
| Pending row for L1 | **1** existing FE-origin pending (`df9be630-…` · product-uat-mob-pilot J-MOB-05) — **not seeded this wave**; approve consumed it |

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| AT-12 L1 PASS (QL Duyệt + scope + F5) | **Yes** (UC verdict PARTIAL = L1 ok + L2 gap) |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-07 reopened | **No** |
| FE must wire Duyệt for Group CEO | **No** |
| UAT DONE | **false** |

---

## Residuals → PM

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-AT12-L1-APPROVE-SCOPE** | — | — | **CLOSED** this wave |
| **R-W4-AT12-L1-CREATE-CATALOG** | P1 | devops / settings | trsport `leave_types` empty — blocks U65 FE create; do **not** seed |
| **R-W4-AT12-L1-HOLDING-COERCE** | P2 | dev-fe / sa | holding→main coerce (R3) — untouched |
| Leave L2 | — | — | **SPEC_GAP HOLD** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md
next_owner: pm
seat_verdict: PASS
l1: PASS (201 HRM-LEAVE-203 · x-company-id=trsport · FE/F5 Đã duyệt)
l2: SPEC_GAP
uat_done: false
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QC-E2-HRM-AT-R4-AT12-L1
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true
ack_status_target: PASS_TO_PM

entry_criteria:
- QA R4 PASS evidence: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md
- FE fix: docs/qa/evidence/po-uc-tc-w4-fe-at12-l1-approve-scope-01.md
- prior FAIL R3 closed: x-company-id=main → now trsport + POST 201
- BA: EXPECTED_NO_CTA ceo@ stands · Leave L2 SPEC_GAP · AT-07 not reopened

MISSION:
- Audit browser evidence: mgr Duyệt → 201 HRM-LEAVE-203 · x-company-id=trsport · FE/F5 Đã duyệt
- Confirm residual R-W4-AT12-L1-APPROVE-SCOPE CLOSED
- Confirm Leave L2 NOT invented PASS
- GO / GWC / NO-GO with residual list (CREATE-CATALOG P1 optional)
- evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r4-at12-qc.md
```
