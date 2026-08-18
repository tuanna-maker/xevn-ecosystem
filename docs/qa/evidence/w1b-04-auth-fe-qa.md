# Evidence — W1-B-04-AUTH-FE-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QA` |
| **parent** | `W1-B-04-AUTH-FE` · `docs/qa/evidence/w1b-04-auth-fe.md` |
| **role** | qa |
| **date** | 2026-08-03 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · OS 28 · slice `DOC-ENT-P0-AUTH-M01` |
| **UF / J-*** | Portal UF login → membership picker → select-membership → F5 — browser **not executed** (stack down) |
| **U65** | zero-seed · no `pnpm seed:*` · no invent UF 🟢 from probe-only |
| **ack_status** | `PASS_TO_PM` |

## Environment

| Probe | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **FAIL** — hrm-api `:28001` fetch failed · xbos-api `:28002` fetch failed · web-portal optional `:5173` HTTP 200 |
| `http://127.0.0.1:5175` | ECONNREFUSED |
| `http://127.0.0.1:8088` | ECONNREFUSED |
| `http://127.0.0.1:5173` | HTTP 200 (orphan Vite — no XBOS proxy target) |
| `POST http://127.0.0.1:28002/api/xbos/auth/login` | ECONNREFUSED |
| Persona | `ceo@xe.vn` / `Xevn@2026` — **not used** (API/browser UF blocked) |

**Verdict layering:** unit/vitest executed · browser UF + Network click path = **BLOCKED-STACK** (not PASS on probe-only / orphan :5173).

## AC matrix

| # | AC | Method | Verdict |
|---|-----|--------|---------|
| 1 | Login 2xx; picker shows BE `tenant_label` / `company_label` / `role_label` (not invent/raw `roleCode`) | vitest `normalizePortalMembership` + code audit TopHeader bind | ✅ **PASS** (unit + bind audit) · ⬜ browser picker |
| 2 | `select-membership` 2xx; session/JWT path has `membershipId` | vitest `persistAuthSession stores membershipId from JWT` + `selectPortalMembership` success | ✅ **PASS** (unit) · ⬜ Network select 2xx |
| 3 | F5 — labels still shown | requires live session + storage mirror | ⬜ **BLOCKED-STACK** |
| 4 | U65 zero-seed; click path + Network in evidence | this wave: no seed; browser click path not available | ✅ U65 held · ⬜ click/Network |
| 5 | Stack down → vitest 11/11 + mark browser UF BLOCKED-STACK | this evidence | ✅ applied |

## Vitest (re-run QA)

```text
pnpm --filter web-portal exec vitest run src/integrations/authSession.test.ts --reporter=verbose

→ Test Files: 1 passed (1)
→ Tests:      11 passed (11)
→ Duration:   4.47s
→ exit 0
```

W1-B-04-specific cases:

- `normalizePortalMembership binds BE labels and falls back to — (no invent)` — `role_label`/`company_label`/`tenant_label` from BE; bare row → `—`
- `persistAuthSession stores membershipId from JWT after select-membership path` — `xevn.portal.membershipId` in localStorage
- `selectPortalMembership` returns new JWT payload on success (mock)

## Code path audit (read-only)

| Check | Result |
|-------|--------|
| `normalizePortalMembership` binds `*_label` + `membershipId`; missing → `—` only | ✅ `authSession.ts` |
| Display helpers never invent from `roleCode` | ✅ `membershipRoleDisplay` / `membershipCompanyDisplay` / `membershipTenantDisplay` |
| `TopHeader` picker uses `membership*Display` (no `formatRoleCodeVi`) | ✅ lines bind `tenant_label`/`company_label`/`role_label` |
| `AuthContext` exposes/persists `membershipId` after login/select/`/me` | ✅ |
| `GlobalFilterContext` pass-through `membershipId` + `*_label` | ✅ |
| FE invent slug→VI map | ❌ not found (removed per Dev evidence) |

## Browser / UF (U65)

| Step | Status |
|------|--------|
| Login `ceo@xe.vn` → POST `/api/xbos/auth/login` 2xx | **BLOCKED-STACK** |
| Membership picker shows BE labels (not raw `roleCode`) | **BLOCKED-STACK** |
| Select membership → POST `/api/xbos/auth/select-membership` 2xx + JWT `membershipId` | **BLOCKED-STACK** |
| F5 → labels still shown / `membershipId` retained | **BLOCKED-STACK** |
| UF portal FR-UC-M01 🟢 claim | **FORBIDDEN** this wave (stack was down) |

**Intended click path (for retest when L0 up):**

1. Open `http://127.0.0.1:5175` (or `:8088`)
2. Login `ceo@xe.vn` / `Xevn@2026`
3. Open membership picker (TopHeader) — assert visible text = BE `*_label`, not raw `roleCode`
4. Select alternate membership — Network `select-membership` 2xx; DevTools/session has `membershipId`
5. F5 — picker/header still shows labels; `xevn.portal.membershipId` present

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-AUTH-FE-BROWSER | P0 UF | U65 browser FR-UC-M01 not run — needs `dev:xbos-api` + portal `:5175`/`:8088` | **qa** (retest) / **devops** stack |
| R-AUTH-FE-F5 | P0 UF | F5 label persistence not observed live | **qa** after L0 |
| R-M01-LOCKOUT-COL | P2 | Lockout DB column still OPEN (BE residual) | BA/SA |
| W1-B-04-AUTH-MOB | P1 | Mobile ScopeScreen wire — out of this FE-QA packet | **dev-mobile** / qa-device |

## U65 compliance

- No `pnpm seed:*`
- No DB fake / API-only UF 🟢
- Orphan `:5173` without XBOS **not** used as PASS evidence

## completion_report

Closed W1-B-04-AUTH-FE-QA unit gate: vitest `authSession` **11/11** PASS; code audit confirms TopHeader/AuthContext bind BE `*_label` + JWT `membershipId` with `—` fallback only (no invent). Browser UF FR-UC-M01 (login → picker → select → F5) **BLOCKED-STACK** — `qc:dev-stack` FAIL (`:28001`/`:28002` down; `:5175`/`:8088` ECONNREFUSED). Residual R-AUTH-FE-BROWSER for QA retest after L0.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: W1-B-STACK-L0-01 (or devops bring-up) → W1-B-04-AUTH-FE-QA-RET
role: devops then qa
mission: Bring L0 (xbos-api :28002 + portal :5175/:8088). Then QA browser U65 retest FR-UC-M01: login ceo@xe.vn → picker BE *_label → select-membership 2xx + membershipId → F5 labels persist. No seed.
read_first: docs/qa/evidence/w1b-04-auth-fe-qa.md · docs/program/slices/DOC-ENT-P0-AUTH-M01.md
entry: qc:dev-stack exit 0
exit: evidence docs/qa/evidence/w1b-04-auth-fe-qa-ret.md with click path + Network; UF 🟢 or FAIL
cấm: invent PASS from vitest-only when browser available
```

## ack_status

**PASS_TO_PM**
