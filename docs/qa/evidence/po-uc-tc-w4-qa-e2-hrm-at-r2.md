# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R2`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R2` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **PASS** (AT-07 closed; AT-12 L1 BLOCKED honest · L2 SPEC_GAP) |
| **U65** | honored — zero-seed · FE create→approve chain · no invent Leave L2 PASS |
| **U76** | `hdsd_align: true` |
| **prior** | [`po-uc-tc-w4-qa-e2-hrm-at-r1.md`](po-uc-tc-w4-qa-e2-hrm-at-r1.md) (BLOCKED JWT) · [`po-uc-tc-w4-stack-jwt-parity-01.md`](po-uc-tc-w4-stack-jwt-parity-01.md) (READY_FOR_QA) |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r2-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r2-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r2/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r2.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · persona `ceo@xe.vn` · ATT `companyId=trsport` |
| **commit** | `dc930c5` |
| **uat_done** | **false** |

---

## Executive verdict

| UC | Verdict | Note |
|----|---------|------|
| **HRM-AT-07** | **PASS** | HDSD Quản lý đơn → Đề nghị cập nhật công → Eye → Duyệt; POST approve **201** `HRM-ATT-REQ-203`; `x-company-id=trsport` (NOTE-ATT-SCOPE); FE toast + F5 status **Đã duyệt** |
| **HRM-AT-12** | **BLOCKED** L1 / L2 **SPEC_GAP** | Leave GET 200 with rows; FE `Duyệt` CTA count **0** under CEO Nghỉ phép — L1 not forced; **Leave L2 not PASS** |

**promoted:** AT-07  
**not promoted:** AT-12 L1  
**Leave L2:** SPEC_GAP — **not PASS**

**Closed residuals:** `R-W4-STACK-JWT-PARITY` · `R-W4-AT07-APPROVE`  
**Open residual:** `R-W4-AT12-L1` (P1)

---

## L0 / JWT gate

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm/xbos/portal **200** (intermittent Windows UV crash after stack check earlier; re-probed green) |
| `qc:fe-be-health` | **ALL PASS** |
| CEO login → `GET /api/hrm/employees?company_id=trsport` | **200** `HRM-EMP-200` (not 401) |
| Harness L0 | hrm/xbos/portal **200** |

JWT parity from devops READY_FOR_QA **confirmed live** before browser mutate.

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | AT-07 entry |
| 2 | OU **Công ty Cổ phần Thương mại và Dịch vụ X.E** | Yes | NOTE-ATT-SCOPE |
| 3 | **Quản lý đơn → Đề nghị cập nhật công** | Yes | AT-07 |
| 4 | **+ Thêm đề nghị** (FE precond, not seed) | Yes | create 201 |
| 5 | Eye → Chi tiết → **Phê duyệt / Duyệt** | Yes | AT-07 |
| 6 | Nghỉ phép · Chờ duyệt · `Duyệt` CTA | Tab open; **approveBtnCount=0** | AT-12 L1 gate |
| 7 | Leave L2 ladder | N/A | **SPEC_GAP** locked |

---

## AT-07 — Phê duyệt đơn chỉnh sửa chấm công

### Click path (FE-only)
1. Login inject `ceo@xe.vn` · scope ATT `trsport`
2. GOTO `/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
3. Select OU TMDV · Escape close overlay
4. **Quản lý đơn → Đề nghị cập nhật công**
5. **+ Thêm đề nghị** → employee VTH-0007 · date · lý do stamp `YC chỉnh CC R2 W4R2-E2WJBI` → submit
6. F5 list → stamp visible
7. Eye → **Duyệt**
8. F5 → status **Đã duyệt**

### Network (NOTE-ATT-SCOPE)

| Call | Result |
|------|--------|
| POST `…/attendance/update-requests` | **201** `HRM-ATT-REQ-201` id=`042d25a5-a88d-477f-8563-0ad8cc8accb9` |
| POST `…/attendance/update-requests/:id/approve` | **201** `HRM-ATT-REQ-203` · `requestStatus=approved` |
| Request header `x-company-id` | **`trsport`** |
| Auth | No `HRM-AUTH-001` |

### FE after 2xx + F5
- Toast: **Thành công / Đã duyệt đơn** (`07-after-approve.png`)
- F5 list: stamp `W4R2-E2WJBI` · status **Đã duyệt** (`10-ceo-f5.png`)
- Stats cards show approved count updated (7 Đã duyệt)

### Classification
- **PASS** product — residual `R-W4-AT07-APPROVE` **CLOSED**
- Not ops-blocked (JWT green)

---

## AT-12 — L1 only if FE pending

| Gate | Result |
|------|--------|
| Leave GET `company_id=main` | **200** · harness `pendingLeaveCount=32` (API rows — not seed) |
| FE `Duyệt` / `hdsd-leave-list-approve` | **approveBtnCount=0** |
| L1 Duyệt POST | **Not attempted** (no operable CTA) |
| L2 ladder | **SPEC_GAP** — **not PASS** |

**Honest note:** API pending ≠ FE-operable L1 for Group CEO on this surface. Cấm invent create/seed leave to force Duyệt. Residual stays P1 for PM → QA/dev when L1 CTA exists from FE path.

---

## Residuals → PM

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| R-W4-STACK-JWT-PARITY | P0 | devops | **CLOSED** (parity evidence + live 200) |
| R-W4-AT07-APPROVE | P0 | qa | **CLOSED** this seat |
| **R-W4-AT12-L1** | P1 | qa → (dev-fe if CTA missing after L1 persona) | **OPEN** — L1 when FE Duyệt operable; L2 remains SPEC_GAP |

### pm_dispatch_hint

```text
P1 optional: PO-UC-TC-W4-QA-E2-HRM-AT-R3 AT-12 L1 only — persona/path where Nghỉ phép shows Duyệt from FE-created pending (U65 no seed); cấm invent Leave L2 PASS.
AT-07 closed — no re-dispatch unless regression.
```

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| U65 zero-seed | Yes (FE create update-request then approve) |
| AT-07 PASS | **Yes** |
| NOTE-ATT-SCOPE `x-company-id=trsport` | **Yes** |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-12 L1 PASS | **No** — BLOCKED |
| Phase1 DONE / uat_done | **No** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R2
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r2.md
next_owner: pm
seat_verdict: PASS
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R2
from_role: qa
to_role: pm
ack_status: PASS_TO_PM

INTAKE: AT-07 Eye→Duyệt PASS (POST approve 201 HRM-ATT-REQ-203 + x-company-id=trsport + FE toast + F5 Đã duyệt). JWT parity residual CLOSED. AT-12 L1 BLOCKED (no FE Duyệt CTA; API rows only); Leave L2 SPEC_GAP not PASS. U65/U76 honored.
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r2.md
by-uc updated: HRM-AT-07.md · HRM-AT-12.md

Next: update rollup/matrix flags; optional P1 Task qa AT-12 L1 when FE Duyệt operable — cấm invent L2. No AT-07 re-dispatch unless regression.
```
