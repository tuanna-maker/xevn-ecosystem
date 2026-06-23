# BE evidence — P1-GHR-SYNC-PERF-BE (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-GHR-SYNC-PERF-BE` |
| **defect_id** | `D-U34-GHR-SYNC-SLOW-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **root_cause** | `appendExtensionItems` in `settings-catalogs.service.ts` executed one `INSERT … ON CONFLICT` per catalog item in a loop. Command Center GHR sync (`syncGroupHrFieldDefsToHrm`) POSTs up to 8 catalog buckets sequentially; each bucket with N items incurred N round-trips (~1.3s per bucket observed). |
| **fix** | Batch upsert: single `INSERT … SELECT … FROM unnest($4::text[], …)` for all items in one DB call. Empty `items` short-circuits without INSERT. Behavior unchanged (same conflict key, same label/unit/status update). |

## Code touchpoints

- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` — `appendExtensionItems` batch unnest upsert
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.spec.ts` — D-U34-GHR-SYNC-SLOW-01 regression (single INSERT, empty skip)

## Verification (local)

```bash
pnpm --filter hrm-api test -- settings-catalogs.service.spec.ts settings-catalogs.controller.spec.ts
pnpm --filter hrm-api build
```

| Check | Result |
|-------|--------|
| Jest `settings-catalogs.service.spec.ts` + `settings-catalogs.controller.spec.ts` | **29/29 PASS** |
| `pnpm --filter hrm-api build` | **PASS** |

## QA re-run (Command Center GHR sync)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · localhost `:5173` + hrm-api `:28001`

1. Command Center → popup **Cấu hình mục thông tin hồ sơ nhân sự**
2. Configure field defs across multiple catalog buckets (personal, basic, job, …)
3. Click **Xác nhận đồng bộ** — sync should complete noticeably faster than pre-fix (~1.3s × buckets)
4. `GET /api/hrm/settings-catalogs` — all synced fields present in `hrmExtensionItems` / `effectiveItems` per bucket
5. No regression on D-W5-HRM-CAT-SYNC-01 (main JWT → holding write partition)

**API probe (direct hrm-api):**

```text
POST /api/hrm/settings-catalogs/hrm_employee_personal_fields/extension-items
  x-tenant-id: xevn · x-company-id: main · x-catalog-write-mode: immediate
  body: { items: [ {code, label}, … ] }  (multiple items)
  → 201 HRM-SET-202 · upserted = items.length
```

## completion_report

- Closed **D-U34-GHR-SYNC-SLOW-01** BE scope: N per-item INSERTs replaced with one batch unnest upsert per `appendExtensionItems` call.
- Regression tests assert single INSERT call and preserved param normalization (tenant/company lowercase).
- Residual: FE `groupHrCatalogApi.ts` still awaits sequential POST per catalog key (8 buckets) — separate dev-fe wave if further latency reduction needed; BE fix removes per-item multiplier inside each bucket.

## next_owner

**qa**

## next_dispatch_prompt

QA retest **D-U34-GHR-SYNC-SLOW-01** / Command Center GHR sync popup: `ceo@xe.vn` on localhost `:5173` + hrm-api `:28001`. Steps 1–5 above; compare sync duration vs pre-fix baseline (~1.3s per bucket). Confirm fields visible on `GET settings-catalogs` and no D-W5 scope regression. Evidence: `docs/qa/evidence/p1-ghr-sync-perf-qa-20260606.md` · ack `PASS_TO_PM` or FAIL with defect id.
