# P0 — Danh mục khung trống dù API 200 (ceo@xe.vn)

**Date:** 2026-06-06  
**Symptom:** Tab「Danh mục khung」— Làm mới từ DB → console 200 nhưng bảng trống, `Nguồn: trống`.

## Root cause

| | Read (group CEO) | Write (save khung) |
|--|------------------|-------------------|
| Scope | `holding` via `resolveXbosGroupLegalReadScopeContext` | `main` via `resolveScopeContext` |
| Data | 0 rows | user template `q` in `main` |
| Seed P4 | — | `xevn` partition (`PB-ORG-XEVN-01`) |

**Read partition ≠ write partition** → API 200 + `items: []` → FE `source: empty`.

## Fix (dev-be — verified before handoff)

1. `BusinessMasterService.list` — merge `dept_system_templates` from legacy partitions `main`, `xevn` when primary (`holding`) empty or partial.
2. `BusinessMasterController` — upsert/delete `dept_system_templates` via `resolveXbosGroupLegalMutationScopeContext` → `holding` for group CEO.
3. Seed script — `COMPANY=holding`, pass `x-company-id: holding` on PUT.

## Evidence (agent ran locally)

```text
ceo@xe.vn login → GET dept_system_templates/items
partition holding items 2
  q @ main
  PB-ORG-XEVN-01 @ xevn
```

Tests: `npx jest business-master` → 11/11 PASS.

## User action

Hard refresh → **Danh mục khung** → **Làm mới từ DB** → expect ≥1 row.

## Process lesson

QA must use **ceo@xe.vn JWT**, not internal key-only probe. PM must not claim PASS without this probe.

**ack_status:** READY_FOR_QA (L2 CC-08 dept templates list visible)
