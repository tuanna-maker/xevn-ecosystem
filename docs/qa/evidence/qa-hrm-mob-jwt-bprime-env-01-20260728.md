# QA-HRM-MOB-JWT-BPRIME-ENV-01 — short live JWT re-probe (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MOB-JWT-BPRIME-ENV-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 zero-seed · HOLD_DEPLOY · LOCAL ONLY |
| **date** | `2026-07-28` (ICT) · probed `2026-07-28T10:32:58+07:00` |
| **entry** | DevOps `READY_FOR_QA` — `docs/qa/evidence/d-hrm-mob-jwt-bprime-env-01-20260728.md` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** — live mobile login issues Plane B′ UUID (not SHA256 hash) |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` · NOT Phase1/PROD · NOT device UF |

---

## 1. Scope / locks

| Lock | Honored |
|------|---------|
| U65 zero-seed | **Yes** — POST login only; no `pnpm seed:*` |
| HOLD_DEPLOY / LOCAL ONLY | **Yes** |
| NOT Phase1/PROD / NOT device UF | **Yes** |
| Do not reopen OP/MD/INF dual-plane | **Yes** — JWT probe only |

---

## 2. Probe matrix

### 2.1 `uat.nv0001@xe.vn` / `xevn-uat-2026`

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| HTTP | 2xx | **201** | PASS |
| code | `HRM-AUTH-200` | `HRM-AUTH-200` | PASS |
| `default_company_id` | `holding` | `holding` | PASS |
| body `company_uuid` | `10000000-0000-4000-8000-000000000001` | `…0001` | PASS |
| memberships[0].`company_uuid` | `…0001` | `…0001` (`company_id=holding`) | PASS |
| JWT claim `company_uuid` | `…0001` | `…0001` | PASS |
| JWT claim `companyId` | `holding` | `holding` | PASS |
| Legacy hash `6efaa5d6-…` | **absent** | absent | PASS |

JWT claim excerpt (no full token):

```json
{
  "sub": "uat.nv0001@xe.vn",
  "companyId": "holding",
  "company_uuid": "10000000-0000-4000-8000-000000000001"
}
```

### 2.2 Optional spot `uat.nv1000@xe.vn`

| Check | Expected | Actual | Result |
|-------|----------|--------|--------|
| HTTP | 2xx | **201** | PASS |
| code | `HRM-AUTH-200` | `HRM-AUTH-200` | PASS |
| `default_company_id` | `services` | `services` | PASS |
| body `company_uuid` | `10000000-0000-4000-8000-000000000005` | `…0005` | PASS |
| JWT claim `company_uuid` | `…0005` | `…0005` | PASS |
| Legacy hash | **absent** | absent | PASS |

### 2.3 L0 W6

| Endpoint | HTTP | Result |
|----------|------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** | PASS |
| `GET http://127.0.0.1:28002/api/xbos` | **200** | PASS |
| `GET http://127.0.0.1:5173/` | **200** | PASS |

---

## 3. Residual / not promoted

| Item | Status |
|------|--------|
| P1 ENV hash JWT (prior FE residual) | **CLOSED** on live `:28001` after dist-uat-w6 refresh |
| Device UF / emulator | **Not claimed** (out of scope) |
| Phase1 / PROD / `:8088` | **Not claimed** |
| OP/MD/INF dual-plane | **Not reopened** |
| QC re-gate | Optional — ENV binary refresh only; no product code delta this WI |

---

## Handoff

### completion_report

**Closed:** Independent live re-probe after `D-HRM-MOB-JWT-BPRIME-ENV-01`. `POST /api/hrm/auth/mobile/login` for `uat.nv0001` → `company_uuid=10000000-0000-4000-8000-000000000001` in body + JWT (not `6efaa5d6-…`); spot `uat.nv1000` → `…0005`; L0 `:28001`/`:28002`/`:5173` **200**. U65 · HOLD_DEPLOY · LOCAL ONLY.

**Open / residual:** None for this WI. Device UF not in scope. QC optional only if PM wants formal ENV close stamp.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-MOB-JWT-BPRIME-ENV-01
from_role: qa
to_role: pm
lane: execution · U65 · HOLD_DEPLOY · LOCAL ONLY
entry: docs/qa/evidence/qa-hrm-mob-jwt-bprime-env-01-20260728.md PASS
verdict: PASS — live JWT Plane B′ …0001 / …0005; legacy hash cleared; L0 200
action: INTAKE PASS_TO_PM; close P1 ENV residual from QA-MOB-UUID-BPRIME-FE-01; optional QC skip (ops refresh only); do not claim Phase1/PROD/device
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/qa-hrm-mob-jwt-bprime-env-01-20260728.md`

### ack_status

**PASS_TO_PM**
