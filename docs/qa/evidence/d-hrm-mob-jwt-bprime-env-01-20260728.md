# D-HRM-MOB-JWT-BPRIME-ENV-01 — live JWT Plane B′ via dist-uat-w6 refresh (2026-07-28)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-MOB-JWT-BPRIME-ENV-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **lane** | execution · U65 zero-seed · HOLD_DEPLOY · LOCAL ONLY |
| **date** | `2026-07-28` (ICT) |
| **entry** | QA residual from `QA-MOB-UUID-BPRIME-FE-01` — live login hash `6efaa5d6-…` |
| **ack_status** | **READY_FOR_QA** |
| **verdict** | **PASS** (ops) — stale `dist-uat-w6` rebuilt + restarted; login issues Plane B′ |
| **deploy** | **HOLD_DEPLOY** · NOT `:8088` · NOT Phase1/PROD |

---

## 1. Root cause

| Layer | Finding |
|-------|---------|
| Process | `:28001` PID served `node --enable-source-maps dist-uat-w6\main.js` (W6 stable path) |
| Binary age | `dist-uat-w6/auth/mobile-auth.service.js` mtime **2026-07-27 11:54** |
| Stale logic | `resolveCompanyUuid` still SHA256 `hrm-scope:{tenant}:{company_id}` → `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Source SoT | `apps/api/hrm-api/src/auth/mobile-auth.service.ts` already maps via `HRM_COMPANY_UUID_BY_SLUG` (D-HRM-MOB-UUID-BPRIME-01) |
| Env / DB | **Not** the cause — map exists in same freeze (`common/hrm-list-scope.js` already had `…0001`); issuance path was old |

**Class:** ENV / stale freeze binary — **not** FE · **not** missing source fix · **no** seed.

---

## 2. Before / after probe

### Before (stale freeze)

| Check | Result |
|-------|--------|
| `POST http://127.0.0.1:28001/api/hrm/auth/mobile/login` `uat.nv0001@xe.vn` / `xevn-uat-2026` | **201/200** `HRM-AUTH-200` · `default_company_id=holding` · **`company_uuid=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`** · JWT claim same hash |

### Actions (ops)

```text
cd C:\xevn-ecosystem\apps\api\hrm-api   # junction → workspace
pnpm run build                          # EXIT 0; dist has Plane B′ resolveCompanyUuid
taskkill listener :28001
rename dist-uat-w6 → dist-uat-w6.bak-20260728102820
Copy-Item dist → dist-uat-w6
# load .env; HRM_BE_PORT=28001
Start-Process node --enable-source-maps <abs>\dist-uat-w6\main.js
```

### After (refreshed freeze)

| Check | Result |
|-------|--------|
| `uat.nv0001` login | **`HRM-AUTH-200`** · `company_uuid=**10000000-0000-4000-8000-000000000001**` · memberships[0] same · JWT `company_uuid=…0001` |
| `uat.nv1000` (spot) | `company_uuid=**10000000-0000-4000-8000-000000000005**` · `default_company_id=services` |
| Running file | `hrm-scope:` **absent**; `HRM_COMPANY_UUID_BY_SLUG` **present** |
| Listener | PID **25144** · `dist-uat-w6\main.js` |

JWT payload (nv0001, claim excerpt):

```json
{
  "sub": "uat.nv0001@xe.vn",
  "companyId": "holding",
  "company_uuid": "10000000-0000-4000-8000-000000000001",
  "employee_id": "3796d949-4513-45c0-88fa-33030a062b17"
}
```

Legacy hash `6efaa5d6-…` **cleared** from live issuance.

---

## 3. L0 W6

| Endpoint | Result |
|----------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| `GET :5173/` | **200** |

xbos + portal processes **not** restarted (kept).

---

## 4. Locks / must_keep

| Lock | Status |
|------|--------|
| U65 no seed | **Honored** |
| HOLD_DEPLOY | **Honored** |
| No Phase1/PROD claim | **Honored** |
| Dual-plane FE / OP/MD GWC | **Not reopened** — ops binary refresh only |
| Source code change this WI | **None** (rebuild existing B′ source into freeze) |

---

## 5. Rebuild recipe (if binary missing again)

```powershell
Set-Location C:\xevn-ecosystem\apps\api\hrm-api
pnpm run build
# free :28001, then:
Remove-Item dist-uat-w6 -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item dist dist-uat-w6 -Recurse -Force
# load .env; $env:HRM_BE_PORT='28001'
Start-Process node -ArgumentList @('--enable-source-maps', (Join-Path (Get-Location) 'dist-uat-w6\main.js')) -WorkingDirectory (Get-Location) -WindowStyle Hidden
# Note: PS 5.x Start-Process has no -Environment; inherit env from parent shell after Set-Item Env:
```

Verify freeze: `Select-String -Path dist-uat-w6\auth\mobile-auth.service.js -Pattern 'hrm-scope:'` must be **empty**.

---

## Handoff

### completion_report

**Closed:** P1 ENV residual — live `:28001` was on stale `dist-uat-w6` (SHA256 company_uuid). Rebuilt from current source (Plane B′ map), swapped freeze, restarted W6 hrm-api. Probe `uat.nv0001` → `company_uuid=10000000-…0001` (not `6efaa5d6`); `uat.nv1000` → `…0005`; L0 `:28001`/`:28002`/`:5173` **200**. No seed, no FE/BE product edit, HOLD_DEPLOY.

**Open / residual:** QA short re-probe JWT claim to promote; optional cleanup of `dist-uat-w6.bak-*` when disk tight.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-MOB-JWT-BPRIME-ENV-01
from_role: devops
to_role: qa
lane: execution · U65 · HOLD_DEPLOY · LOCAL ONLY
entry_criteria: D-HRM-MOB-JWT-BPRIME-ENV-01 READY_FOR_QA — docs/qa/evidence/d-hrm-mob-jwt-bprime-env-01-20260728.md
exit_criteria:
  1) POST http://127.0.0.1:28001/api/hrm/auth/mobile/login uat.nv0001@xe.vn / xevn-uat-2026 → company_uuid = 10000000-0000-4000-8000-000000000001 (NOT 6efaa5d6-…)
  2) JWT access_token claim company_uuid same …0001
  3) Optional spot: uat.nv1000 → …0005
  4) L0 :28001/:28002/:5173 still 200
  5) Evidence: docs/qa/evidence/qa-hrm-mob-jwt-bprime-env-01-20260728.md → PASS_TO_PM
cấm: seed · reopen OP/MD/INF dual-plane · claim Phase1/PROD/:8088 · device UF
ack_status target: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/d-hrm-mob-jwt-bprime-env-01-20260728.md`

### ack_status

**READY_FOR_QA**
