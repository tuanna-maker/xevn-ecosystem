# BE evidence — P1-XBOS-W8-CAT-SCOPE-BE (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W8-CAT-SCOPE-BE` |
| **defect_id** | `D-W8-CAT-SCOPE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **root_cause** | `PUT …/command_center_catalogs/items/:kind` used plain `resolveScopeContext` → persisted `company_id=main`; `GET …/command_center_catalogs/items` uses `resolveXbosGroupLegalReadScopeContext` → reads `holding`. Write/read partition mismatch — PUT **201** but GET list empty → J-XBOS-11 F5 reverts to FE seed. |
| **fix** | Extend `resolveWriteScope` in `business-master.controller.ts` to route `command_center_catalogs` through `resolveXbosGroupLegalMutationScopeContext` (same as `dept_system_templates` / W5 HRM catalog pattern). |

## Code touchpoints

- `apps/api/xbos-api/src/business-master/business-master.controller.ts` — `resolveWriteScope` includes `command_center_catalogs`
- `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` — D-W8-CAT-SCOPE-01 list/upsert/remove holding partition regression

## Verification (local)

```bash
pnpm --filter xbos-api exec jest src/business-master/business-master.controller.spec.ts
pnpm --filter xbos-api test
pnpm --filter xbos-api exec nest build --webpack
node scripts/tmp-p1-w8-catalog-audit-probe.mjs
```

| Check | Result |
|-------|--------|
| Jest `business-master.controller.spec.ts` | **14/14 PASS** |
| Jest xbos-api full suite | **260/260 PASS** |
| `nest build --webpack` | **PASS** |
| `tmp-p1-w8-catalog-audit-probe.mjs` | **exit 0** — 3/3 kinds PASS (`save@holding`, read-back OK) |

### Probe output (post-fix)

```text
[document/regulations] PUT 200 save@holding readScope=holding readVal=QA-W8-CAT-DOC-20260606 => PASS
[measurement/measurements] PUT 200 save@holding readScope=holding readVal=QA-W8-KM => PASS
[pricing/pricing] PUT 200 save@holding readScope=holding readVal=QA-W8-CAT-PRICE-20260606 => PASS
SUMMARY fails=0/3
```

## QA re-run (J-XBOS-11)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · localhost `:5173` + xbos-api `:28002`

1. Settings → **Văn bản** (`?settings=document`) — edit row title → wait ≥800ms → F5 → value **must** persist from DB
2. Settings → **Đo lường** (`?settings=measurement`) — edit unit → F5 persist
3. Settings → **Giá** (`?settings=pricing`) — edit label → F5 persist
4. `node scripts/tmp-p1-w8-catalog-audit-probe.mjs` → **exit 0**

**Residual (not this wave):** D-W8-CAT-SEED-01 / D-W8-CAT-ADD-ROW-01 remain **dev-fe** — empty API should not present hardcoded seed as SoT.

## completion_report

- Closed **D-W8-CAT-SCOPE-01** scope_parity: `command_center_catalogs` write partition aligned with read (`main` JWT → `holding` persist) for group CEO.
- Regression specs for list, upsert, delete on `command_center_catalogs`.
- Residual: **D-W8-CAT-SEED-01** (FE seed fallback when API empty), **D-W8-CAT-ADD-ROW-01** (no add-row UI) — dev-fe; pilot redeploy if xbos-be not on latest build.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-XBOS-W8-CAT-QA-RETEST
from_role: pm
to_role: qa
lane: execution

Dev-BE READY_FOR_QA docs/qa/evidence/p1-xbos-w8-cat-scope-be-20260606.md — D-W8-CAT-SCOPE-01 fixed. Retest J-XBOS-11: document/measurement/pricing tabs — inline edit + F5 DB persist for ceo@xe.vn. Run node scripts/tmp-p1-w8-catalog-audit-probe.mjs exit 0. L0 qc:dev-stack + L2.5 journey evidence. ack_status PASS_TO_PM or FAIL_TO_PM with defects.
```
