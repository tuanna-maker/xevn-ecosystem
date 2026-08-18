# Evidence — D-HRM-EMP-COMPANY-COL-BE-02 (2026-07-25)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-COMPANY-COL-BE-02` |
| **from_role** | `dev-be` |
| **to_role** | `qa` (light smoke) / `pm` |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | UPGRADE (type/DX only) |
| **U65** | zero-seed · no deploy · NOT Phase1/PROD · no `:8088` |
| **QC residual closed** | `C-EMP-COL-NEST-WATCH-01` / `R-EMP-COL-NEST-WATCH-01` (P2 DX) |

---

## 1. Problem

QC GWC `QC-HRM-EMP-COMPANY-COL-01` condition: `pnpm run dev:hrm-api` / `nest start --watch` failed **TS2322** at `operating-units.service.ts` (~L58):

```text
Type 'Promise<QueryResult<QueryResultRow>>' is not assignable to type 'Promise<{ rows: T[]; }>'.
```

Cause: non-generic arrow `(sql, params) => this.db.query(sql, params)` dropped the type parameter required by local `QueryFn`, so Nest incremental compile blocked watch. QA used `node dist/main.js` workaround.

---

## 2. Fix (spec must_keep preserved)

| File | Change |
|------|--------|
| `hrm-company-display-name.ts` | Export `CompanyDisplayQueryFn` with `T extends QueryResultRow` (aligned with `HrmDbService.query`) |
| `operating-units.service.ts` | Forward generic: `async <T extends QueryResultRow>(sql, params?) => this.db.query<T>(sql, params ?? [])` |

**Runtime / LE semantics:** unchanged — `resolveCompanyDisplayNameVi`, Khối reject, slug-map upsert CASE, registry LE defaults untouched.

**forbidden:** no LE rename; no unrelated modules; no seed/deploy.

---

## 3. Verification

```text
# Nest build path (excludes **/*spec.ts) — operating-units clean
npx tsc --noEmit -p tsconfig.build.json
→ BUILD_TSC_EXIT=0
→ no matches for "operating-units" / prior TS2322

# Related jest
npx jest --testPathPatterns="operating-units|be-hrm-emp-company-col-01" --runInBand
→ Test Suites: 3 passed
→ Tests: 15 passed
```

| Check | Result |
|-------|--------|
| TS2322 operating-units QueryFn | **CLOSED** |
| LE SoT / reject Khối* (jest) | **PASS** (no regression) |
| Phase1 / PROD / `:8088` | **NONE** |

---

## 4. Handoff

- **completion_report:** Nest watch typecheck for operating-units QueryFn adapter fixed; company-col LE jest 15/15 green; C-EMP-COL-NEST-WATCH-01 DX residual closable. Residual: optional QA light smoke that `pnpm run dev:hrm-api` boots (no browser UF required for type-only).
- **next_owner:** `qa` (optional light smoke) or `pm` if accepting type-only close
- **next_dispatch_prompt:** see bus entry
- **evidence_path:** `docs/qa/evidence/be-hrm-emp-company-col-be-02-20260725.md`
- **ack_status:** `READY_FOR_QA`
