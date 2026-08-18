# D-HDSD-MOB-UAT-AUTH-01 — Mobile UAT persona auth restore

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MOB-UAT-AUTH-01` |
| **program** | `HDSD-P2-FULL-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | `dev-be` |
| **to_role** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — lazy product ensure only |

---

## Root cause

1. **Pilot `:3001` ran stale `dist/auth`** without `ensureUatMobileEmployeeRow` / UAT password matrix (post tenant-master reset → no workforce row → `HRM-AUTH-401`).
2. **`resolveUatMobilePassword`** blocked documented password when `NODE_ENV=production` without explicit env (pilot prod slice needs `HRM_PILOT_UAT_AUTH_ENABLED` or `HRM_MOBILE_UAT_PASSWORD`).
3. **Legacy alias** `nguyen.van.an.####@xe.vn` needed pre-upsert before fetch when stale legacy row existed.

`ceo@xe.vn` worked via existing PORTAL-GCEO row + portal password ensure (D-BE-MOB-AUTH-CEO-HASH-01).

---

## Fix (product — no bulk seed)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/uat-mobile-auth-ensure.ts` | Lazy ensure spec; legacy email alias; pilot password resolver |
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | Login canonicalization; pre-ensure UAT seq; `verifyPassword` uses canonical hash email |
| `deploy/xevn-ecosystem/.env.example` | Document `HRM_PILOT_UAT_AUTH_ENABLED` / `HRM_MOBILE_UAT_PASSWORD` |

---

## Verification

### Jest (local)

```powershell
cd apps/api/hrm-api
pnpm exec jest src/auth/uat-mobile-auth-ensure.spec.ts src/auth/mobile-auth.service.spec.ts
# 38/38 PASS
pnpm run build
# exit 0
```

### Pilot curl (`http://14.225.217.232:3001`) — 2026-07-30 after pscp + restart hrm-be×4

| Email | Password | HTTP | Code | employee.email |
|-------|----------|------|------|----------------|
| `uat.nv0001@xe.vn` | `xevn-uat-2026` | **201** | HRM-AUTH-200 | uat.nv0001@xe.vn |
| `uat.nv0002@xe.vn` | `xevn-uat-2026` | **201** | HRM-AUTH-200 | uat.nv0002@xe.vn |
| `nguyen.van.an.0001@xe.vn` | `xevn-uat-2026` | **201** | HRM-AUTH-200 | uat.nv0001@xe.vn (canonical) |
| `ceo@xe.vn` | `Xevn@2026` | **201** | HRM-AUTH-200 | ceo@xe.vn |

PowerShell probe (copy-ready):

```powershell
$base = 'http://14.225.217.232:3001/api/hrm/auth/mobile/login'
foreach ($pair in @(
  @{ e='uat.nv0001@xe.vn'; p='xevn-uat-2026' },
  @{ e='uat.nv0002@xe.vn'; p='xevn-uat-2026' },
  @{ e='nguyen.van.an.0001@xe.vn'; p='xevn-uat-2026' }
)) {
  $body = @{ email=$pair.e; password=$pair.p } | ConvertTo-Json
  $r = Invoke-WebRequest -Uri $base -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
  "$($pair.e) -> $($r.StatusCode)"
}
```

### Local `:28001`

Not running during this wave (connection refused). Parity: same code path in `mobile-auth.service.ts`; re-verify when `pnpm run dev:hrm-api` is up.

---

## Deploy note (pilot)

Synced `apps/api/hrm-api/dist/auth` + `src/auth` to VPS `/opt/xevn-ecosystem` and restarted `hrm-be` replicas (×4). Recommend `devops` add to `deploy/xevn-ecosystem/.env` on VPS:

```env
HRM_PILOT_UAT_AUTH_ENABLED=true
# or HRM_MOBILE_UAT_PASSWORD=xevn-uat-2026
```

for `NODE_ENV=production` slices.

---

## completion_report

**Closed:** UAT mobile login 201 for `uat.nv0001`, `uat.nv0002`, legacy `nguyen.van.an.0001` on pilot `:3001`; jest regression 38/38; build PASS; evidence + curl matrix.

**Open:** QA-device J-MOB-03/04/05 retest (`QA-HDSD-MOB-CH12-01-R3`); local `:28001` smoke when stack up; formal git deploy to pin VPS HEAD (pscp hotfix applied this wave).

---

## next_owner

`qa-device`

---

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R3
from_role: dev-be
to_role: qa-device
entry_criteria: D-HDSD-MOB-UAT-AUTH-01 READY_FOR_QA; pilot POST uat.nv0001/uat.nv0002 → 201 HRM-AUTH-200; evidence docs/qa/evidence/d-hdsd-mob-uat-auth-01-20260730.md; APK SHA 5119B959…8895; emulator-5554; U65 zero-seed
exit_criteria: J-MOB-03/04/05 🟢 strict uat.nv persona list→detail→Duyệt; update qa-hdsd-mob evidence; PASS_TO_PM
cấm: seed workflow · DB fake approve queue
```
