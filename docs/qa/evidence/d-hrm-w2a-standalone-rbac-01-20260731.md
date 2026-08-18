# D-HRM-W2A-STANDALONE-RBAC-01 — Standalone W2a RBAC gate fix

**work_item_id:** `D-HRM-W2A-STANDALONE-RBAC-01`  
**from_role:** dev-fe → qa  
**date:** 2026-07-31  
**spec_ref:** `docs/qa/evidence/qa-hdsd-w2a-scope-parity-01-r2-20260731.md` · residual R-W2A-RBAC-01 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE  
**ack_status:** `READY_FOR_QA`

---

## Root cause

| Layer | Finding |
|-------|---------|
| API | GET `/api/hrm/employees?company_id=main` **200** for `ceo@xe.vn` holding JWT (confirmed R2) |
| FE auth | `persistMobileSession` → `applyPortalSession` stores JWT in `xevn.portal.accessToken` |
| FE RBAC | `PermissionRoute` only bypassed `getHrmPortalMode(?portal=1)` — **not** `hasPortalSession()` |
| Stub | `usePermissions` returns empty `[]` — standalone mobile login never satisfies `hasAnyPermission` |

**Symptom:** `:8080/hr/employees` showed «Không có quyền truy cập» despite valid JWT + API 200.

**W2b embed:** unchanged — already bypassed via `?portal=1` / iframe / portal JWT (`PermissionGate.shouldBypassHrmPermissionGate`).

---

## Fix (narrow)

1. **`PermissionRoute.tsx`** — delegate bypass to `shouldBypassHrmPermissionGate(location.search)` (same as `PermissionGate`).
2. **`AppSidebar.tsx` / `MobileBottomNav.tsx`** — nav filter uses same bypass so W2a standalone sidebar shows modules after mobile login.

**must_keep:** W2b embed path (`portal=1`) unchanged; API RBAC remains authoritative on BE.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/auth/PermissionRoute.tsx` | Use `shouldBypassHrmPermissionGate` |
| `apps/web/hrm/src/components/auth/PermissionRoute.test.ts` | New — W2a JWT / W2b portal parity tests |
| `apps/web/hrm/src/components/layout/AppSidebar.tsx` | Nav filter via `useHrmNavModuleAccess` |
| `apps/web/hrm/src/components/layout/MobileBottomNav.tsx` | Nav filter via bypass helper |

---

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/components/auth/PermissionRoute.test.ts src/components/auth/PermissionGate.test.ts
pnpm exec tsc --noEmit
```

| Check | Result |
|-------|--------|
| PermissionRoute + PermissionGate vitest | **8/8 PASS** |
| tsc --noEmit | **exit 0** |

---

## QA retest matrix (browser — U65 zero-seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** `http://127.0.0.1:8080/hr/*` (W2a standalone)

| UF / J-* | Click path | PASS when |
|----------|------------|-----------|
| J-HRM-01 | `/hr/login` → Đăng nhập → `/hr/employees` → first row | No «Không có quyền truy cập»; GET employees **200** in Network; ≥1 row or honest empty; detail GET **2xx** on click |
| W2b regression | `:5173` embed `/hr/employees?portal=1&companyId=main` | Unchanged 🟢 — list still loads |

**Residual:** Fine-grained HRM module permissions (Supabase stub) deferred until RBAC API wired — JWT session bypass matches embed policy.

---

## completion_report

- **Closed:** R-W2A-RBAC-01 — standalone PermissionRoute + nav bypass for mobile JWT session; vitest 8/8; tsc 0.
- **Open:** QA browser retest J-HRM-01 on `:8080/hr/employees`; optional harness R-HARNESS-RBAC (qa).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-HRM-W2A-STANDALONE-RBAC-01
from_role: dev-fe | to_role: qa
entry_criteria: D-HRM-W2A-STANDALONE-RBAC-01 READY_FOR_QA — docs/qa/evidence/d-hrm-w2a-standalone-rbac-01-20260731.md; PermissionRoute uses shouldBypassHrmPermissionGate for mobile JWT standalone
exit_criteria: Browser U65 — ceo@xe.vn on :8080/hr/employees renders list (Network GET employees 200); J-HRM-01 list→detail GET 2xx; W2b embed :5173 unchanged 🟢; evidence qa-hrm-w2a-standalone-rbac-01-YYYYMMDD.md; ack_status PASS_TO_PM or FAIL with defect id
persona: ceo@xe.vn / Xevn@2026
J-*: J-HRM-01
cấm: seed
```
