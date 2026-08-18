# Evidence — `PO-UC-TC-W4-QA-E2-HRM-AT-R1`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E2-HRM-AT-R1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **seat_verdict** | **BLOCKED** (ops — Postgres/:5432 + hrm-api down; AT-07 not product-FAIL this seat) |
| **U65** | honored — zero-seed · no invent Leave L2 PASS · no inbox seed |
| **U76** | `hdsd_align: true` |
| **prior** | [`po-uc-tc-w4-qa-e2-hrm-at-rollup.md`](po-uc-tc-w4-qa-e2-hrm-at-rollup.md) |
| **raw** | [`_tmp-po-uc-tc-w4-qa-e2-hrm-at-r1-browser.json`](_tmp-po-uc-tc-w4-qa-e2-hrm-at-r1-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e2-hrm-at-r1/` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r1.mjs` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` · persona `ceo@xe.vn` · ATT `trsport` |
| **uat_done** | **false** |

---

## Executive verdict

| UC | Verdict | Note |
|----|---------|------|
| **HRM-AT-07** | **BLOCKED** | Cannot evidence Eye→Duyệt POST approve 2xx + NOTE-ATT-SCOPE while HRM auth/stack broken. Initial L0 health 200, but FE→HRM GET leave/employees **401** `HRM-AUTH-001`; late recheck **Postgres :5432 ECONNREFUSED** + **hrm ECONNREFUSED**. |
| **HRM-AT-12** | **BLOCKED** / L2 **SPEC_GAP** | No pending leave operable on FE (401 + empty); L1 not invented; **L2 not PASS**. |

**promoted:** none  
**not promoted:** AT-07 · AT-12 L1  
**Leave L2:** SPEC_GAP — **not PASS**

---

## L0

| When | hrm `:28001` | xbos `:28002` | portal `:5173` | Notes |
|------|--------------|---------------|----------------|-------|
| R1 start (`qc:dev-stack` + harness `l0`) | **200** | **200** | **200** | Health green |
| Mid-run FE Network | leave/employees **401** `HRM-AUTH-001` | up | up | shell Overview mounts |
| Post-run probe | intermittent ECONNREFUSED then **200** | **200** | **200** | Local `:5432` N/A — SoT remote `DB_PORT=6432` (stack-restore-01) |

**Root cause (auth — blocks AT-07):** CEO XBOS JWT (`iss=xevn-internal` `aud=xevn-api`) **HMAC does not verify** against HRM default `xevn-dev-jwt-secret` → `isAuthorizedInternalRequest` false → **401 HRM-AUTH-001** on attendance/employees. Health 200 ≠ business auth green.

**Honest ops gate:** **BLOCKED → devops** — align `JWT_SECRET` / `SERVICE_JWT_SECRET` / `XBOS_JWT_SECRET` between xbos-api process and hrm-api process; re-smoke `GET /api/hrm/employees?company_id=trsport` with portal login Bearer → not 401. Do **not** claim AT-07 product FAIL this seat.

`qc:fe-be-health` 4×401 same class (documented P2 in stack-restore-01) — **does block** browser mutate AT-07 until JWT parity fixed.

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes (Overview mount) | AT-07 entry |
| 2 | Menu **Quản lý đơn** visible on Overview | Yes (screenshot `01-mount`) | AT-07 |
| 3 | **Đề nghị cập nhật công** list + Thêm đề nghị | **No** this run (`navOk=false` `addVisible=false`) | AT-07 blocked |
| 4 | Eye → Duyệt | Not reached | AT-07 |
| 5 | Nghỉ phép · Chờ duyệt pending | No operable pending (401) | AT-12 L1 gate |
| 6 | Leave L2 ladder | N/A | **SPEC_GAP** locked |

---

## AT-07 (mission focus)

### Attempted click path
1. Login inject `ceo@xe.vn` · companyId=`trsport`
2. GOTO `/hr/attendance?portal=1&tenantId=xevn&companyId=trsport`
3. Select OU TMDV (soft)
4. HDSD: **Quản lý đơn → Đề nghị cập nhật công**
5. **Blocked** before Eye/Duyệt — submenu/list CTA not opened; Network already **401** on HRM attendance/employees

### Network (NOTE-ATT-SCOPE)
| Call | Result |
|------|--------|
| POST `…/update-requests/:id/approve` | **not fired** |
| `x-company-id` on approve | **not evidenced** |
| GET leave-requests / employees | **401** `HRM-AUTH-001` |

### FE after 2xx + F5
Not applicable — no approve 2xx.

### Classification
- **Not** promoted as product FAIL this seat (stack/auth/DB).
- Residual open for retest after devops restore: `R-W4-AT07-APPROVE` (carry from E2).
- If after L0+JWT healthy Eye→Duyệt still misses 2xx → then **FAIL product** → `dev-fe`/`dev-be`.

---

## AT-12 (L1 only if FE pending)

| Gate | Result |
|------|--------|
| Pending leave from FE on list | **No** (`pendingLeaveCount=null`, `approveBtnCount=0`) |
| L1 Duyệt | **Not attempted** (gate BLOCKED — cấm invent create/seed) |
| L2 ladder | **SPEC_GAP** — **not PASS** |

---

## Residuals → PM dispatch

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-W4-STACK-JWT-PARITY** | P0 | **devops** | XBOS-signed CEO JWT HMAC ≠ HRM verify secrets → **401 HRM-AUTH-001** on attendance/employees; blocks AT-07 Eye→Duyệt |
| **R-W4-AT07-APPROVE** | P0 | **qa** (retest) → **dev-fe/be** if still FAIL after JWT green | HDSD Eye→Duyệt; POST approve 2xx + `x-company-id` trsport/OU; FE+F5 |
| **R-W4-AT12-L1** | P1 | **qa** | L1 only if pending leave already from FE; L2 remains SPEC_GAP |

### pm_dispatch_hint

```text
P0 devops: fix JWT secret parity xbos-api ↔ hrm-api (CEO portal Bearer currently fails HRM HMAC → HRM-AUTH-001 on /employees + /attendance/*). Prove GET /api/hrm/employees?company_id=trsport 200 with same token as portal login. evidence: docs/qa/evidence/po-uc-tc-w4-stack-jwt-parity-01.md · cấm seed.
Same session → Task qa PO-UC-TC-W4-QA-E2-HRM-AT-R2: AT-07 Eye→Duyệt + NOTE-ATT-SCOPE + F5; AT-12 L1 only if FE pending; L2 SPEC_GAP.
```

---

## Claims / non-claims

| Claim | Status |
|-------|--------|
| U65 zero-seed | Yes |
| AT-07 PASS | **No** |
| Leave L2 PASS | **No** — SPEC_GAP |
| Product FAIL AT-07 this seat | **No** — BLOCKED ops |
| Phase1 DONE / uat_done | **No** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r1.md
next_owner: pm
seat_verdict: BLOCKED
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-STACK-JWT-PARITY-01
from_role: pm
to_role: devops
priority: P0
lane: execution

entry_criteria: L0 health may be 200; CEO XBOS JWT iss/aud ok but HMAC does not verify on hrm-api (default xevn-dev-jwt-secret mismatch) → HRM-AUTH-001 on /employees + /attendance/*.
exit_criteria:
  1) Same JWT_SECRET (or SERVICE_JWT_SECRET/XBOS_JWT_SECRET) loaded by both xbos-api and hrm-api processes
  2) POST portal login ceo@xe.vn → Bearer → GET /api/hrm/employees?company_id=trsport **200** (not 401)
  3) evidence_path: docs/qa/evidence/po-uc-tc-w4-stack-jwt-parity-01.md
cấm: seed · fake inbox · invent Leave L2 PASS

Same session after PASS → Task qa:
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R2
to_role: qa
entry: L0+JWT green; U65; hdsd_align
mission: AT-07 HDSD Quản lý đơn → Đề nghị cập nhật công → Eye → Duyệt; Network POST approve 2xx + x-company-id (NOTE-ATT-SCOPE); FE after 2xx + F5.
AT-12 L1 only if pending leave from FE exists; cấm invent L2 PASS.
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r2.md
exit: AT-07 PASS or FAIL product with pm_dispatch_hint dev-fe/be; update by-uc; PASS_TO_PM.
```
