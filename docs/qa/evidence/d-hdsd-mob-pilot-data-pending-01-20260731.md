# D-HDSD-MOB-PILOT-DATA-PENDING-01 — Lazy UAT mobile pilot transactional data

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MOB-PILOT-DATA-PENDING-01` |
| **parent** | `QA-HDSD-MOB-CH12-01-R4` · R4-C2 |
| **from_role** | `dev-be` |
| **to_role** | `qa-device` |
| **date** | 2026-07-31 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — lazy **product** ensure on login only |
| **J-* unblock** | J-MOB-04 (payslip) · J-MOB-05 (Duyệt) |

---

## Root cause (R4-C2)

After auth restore (`D-HDSD-MOB-UAT-AUTH-01`), pilot probe showed:

| Persona | payslip total | pendingLeave | pendingAtt |
|---------|---------------|--------------|------------|
| `uat.nv0001` (holding ESS) | **0** | 0 | 0 |
| `uat.nv0002` (trsport mgr) | 0 | **0** | **0** |

Workforce rows existed via lazy auth ensure, but **transactional satellite rows** (payroll_payslips, manager pending leave/attendance) were missing after tenant reset — blocking J-MOB-04 list/detail and J-MOB-05 **Duyệt** tap.

---

## Fix (product — no bulk seed)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/uat-mobile-pilot-data-ensure.ts` | **ADD** lazy ensure: nv0001 → ≥1 payslip FK-linked; nv0002 → subordinate + pending leave + pending attendance update |
| `apps/api/hrm-api/src/auth/uat-mobile-pilot-data-ensure.spec.ts` | **ADD** jest regression (7 tests) |
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | Call `ensureUatMobilePilotTransactionData` after successful UAT login (seq 1..2 only) |

**Pattern:** Same as `uat-mobile-auth-ensure.ts` — idempotent on login, deterministic stable UUIDs (`product-uat-mob-pilot` tag), **cấm** `pnpm seed:*`.

---

## Verification

### Jest (local)

```powershell
cd apps/api/hrm-api
pnpm exec jest src/auth/uat-mobile-pilot-data-ensure.spec.ts src/auth/uat-mobile-auth-ensure.spec.ts src/auth/mobile-auth.service.spec.ts
# 45/45 PASS
pnpm run build
# exit 0 · verify-dist PASS
```

### Pilot curl (`http://14.225.217.232:3001`) — post-deploy 2026-07-31

Login triggers lazy ensure (U65 product path):

| Step | Persona | HTTP | Code | Metric | Verdict |
|------|---------|------|------|--------|---------|
| Health | — | 200 | — | — | 🟢 |
| Login | `uat.nv0001@xe.vn` | 201 | HRM-AUTH-200 | HLD-0001 · holding | 🟢 |
| Login | `uat.nv0002@xe.vn` | 201 | HRM-AUTH-200 | VTH-0002 · trsport | 🟢 |
| GET payslips | nv0001 | 200 | HRM-PAY-200 | **total=1** | 🟢 |
| GET leave (own) | nv0001 | 200 | HRM-LEAVE-200 | total=0 | 🟢 (not required) |
| GET pending leave (mgr) | nv0002 | 200 | HRM-LEAVE-200 | **total=1** | 🟢 |
| GET pending att (mgr) | nv0002 | 200 | HRM-ATT-REQ-200 | **total=1** | 🟢 |

Probe JSON:

```json
{
  "base": "http://14.225.217.232:3001",
  "health": 200,
  "nv1": { "login": 201, "payslip_total": 1 },
  "nv2": { "login": 201, "pendingLeave": 1, "pendingAtt": 1 }
}
```

### Deploy (pilot :3001)

- SCP: `uat-mobile-pilot-data-ensure.ts`, `mobile-auth.service.ts`, `dist/auth/*.js`
- VPS: `docker exec xevn-hrm-be-dev pnpm run build` exit 0
- Restart: `hrm-be`, `hrm-be-2`, `hrm-be-3`
- Health `:3001/api/hrm` → **200**

---

## completion_report

**Closed:** Lazy product ensure on login for documented pilot personas; nv0001 payslip ≥1; nv0002 manager pending leave + attendance ≥1; jest 45/45; build PASS; pilot deploy + curl matrix PASS.

**Open:** QA-device J-MOB-04/05 device retest (`QA-HDSD-MOB-CH12-01-R5`); R4-C1 mobile ERR-NETWORK (dev-mobile lane); git commit for durable deploy SoT.

---

## next_owner

`qa-device`

---

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R5
from_role: pm
to_role: qa-device
entry_criteria: D-HDSD-MOB-PILOT-DATA-PENDING-01 READY_FOR_QA; pilot :3001 nv0001 payslip total>=1; nv0002 pendingLeave>=1 pendingAtt>=1; evidence docs/qa/evidence/d-hdsd-mob-pilot-data-pending-01-20260731.md
exit_criteria: J-MOB-04 payslip list→detail @ uat.nv0001 🟢; J-MOB-05 manager Duyệt tap @ uat.nv0002 🟢; strict uat.nv no ceo fallback; U65 no seed in evidence; ack_status PASS_TO_PM
spec_ref: HDSD CH12 §12.5–12.6 · MOBILE_PERSONA_UX_MATRIX §2.2
```

---

## evidence_path

`docs/qa/evidence/d-hdsd-mob-pilot-data-pending-01-20260731.md`
