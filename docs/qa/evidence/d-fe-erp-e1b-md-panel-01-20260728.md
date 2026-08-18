# D-FE-ERP-E1B-MD-PANEL-01 — Master Data Settings ≥10 buckets

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-ERP-E1B-MD-PANEL-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **lane** | execution E1-B |
| **date** | 2026-07-28 |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |

## spec_read_ack

| Artifact | Result |
|----------|--------|
| `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` | FR-HRM-SC-SET-UI-01 · AC-SET-UI-01..10 · BR-ALIAS |
| `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` | ≥10 keys · DEC alias · no DDL |
| `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` | writeKey resolve · sync reuse |
| `docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md` | DEC storageKey prefer `hr_decision_types`; shifts P1 HOLD |

## What shipped

1. **`mdBucketRegistry.ts`** — 11 MD CRUD buckets (VI titles U72), DEC `writeKey = hr_decision_types`.
2. **`HRM_MASTER_DATA_CATALOG_KEYS`** — expanded families; `decisionTypes = [hr_decision_types, decision_types]`.
3. **`findCatalogRowByKeys`** — prefer alias with `effectiveItems.length > 0`.
4. **`mergeEffectiveItemsByKeys` / `resolveCatalogWriteKey`** — family merge + storage write resolve.
5. **`MasterDataSettingsPanel`** — ≥10 tabs; CRUD upsert; search filter; Ngưng → `status: draft`; forceMount forms; sync XBOS CTA; JT/PAY deep-links kept.
6. **`Decisions.tsx`** — alias merge for type picker (no FREE_TEXT rewrite).
7. **`catalogDisplayLabels`** — U72 labels for new keys.
8. **`upsert` payload** — optional `status` for soft-stop.

## Cấm (honored)

| Forbidden | Status |
|-----------|--------|
| Seed U65 | No seed |
| E1-A FREE_TEXT rewrite | Not touched (alias-only on Decisions) |
| `work_shifts` dual-write | Settings bucket = catalog `shifts` only |

## Verify (agent)

```bash
cd apps/web/hrm
pnpm exec vitest run \
  src/lib/catalogSearchPicker.test.ts \
  src/lib/hrmSettingsCatalogItem.test.ts \
  src/lib/mdBucketRegistry.test.ts \
  src/components/settings/MasterDataSettingsPanel.test.ts
```

**Result:** 4 files · **31 passed** · exit 0 (2026-07-28).

> Note: Full RTL mount of `MasterDataSettingsPanel` hits dual-react Invalid hook call in vitest (workspace hoist). Coverage = pure registry + alias helpers + panel source gate. Browser U65 CRUD remains QA gate.

## AC map (FE)

| AC | FE evidence |
|----|-------------|
| AC-SET-UI-01 ≥10 tabs | `MD_BUCKET_ORDER` length 11 · vitest |
| AC-SET-UI-02 CRUD | upsert form per bucket + Lưu |
| AC-SET-UI-03 Ngưng | button → `status: 'draft'` |
| AC-SET-UI-04 search | `#md-search-*` filter |
| AC-SET-UI-05 DEC alias | keys dual + merge + write prefer live |
| AC-SET-UI-07 U72 | VI tab titles · no raw key tab names |
| AC-SET-UI-09 empty | honest empty + Đồng bộ XBOS CTA |

## Residual (QA / BE)

| Item | Owner |
|------|-------|
| Browser U65: CRUD ≥3 new buckets + F5 + DEC alias live | **qa** |
| BE `resolveCatalogFamily` + allow-list if overview rejects new keys | **dev-be** `D-BE-ERP-E1B-ALIAS-KEYS-01` |
| RTL dual-react vitest for heavy panel | tech debt (not blocker browser) |

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: QA-ERP-E1B-MD-PANEL-01
from_role: pm
to_role: qa
entry_criteria: L0 stack; U65 zero-seed; D-FE-ERP-E1B-MD-PANEL-01 READY_FOR_QA
read_first: docs/qa/evidence/d-fe-erp-e1b-md-panel-01-20260728.md · BA_ERP_E1B_SRS_01 · USER_FLOW Settings Master Data
scope: Browser ceo@xe.vn → Cài đặt → Master Data
  - AC-SET-UI-01: count ≥10 VI tabs (incl. Loại HĐ, Loại hình LĐ, Ca, Ngạch, Kênh TD, Bản chất TP lương)
  - AC-SET-UI-05: Loại quyết định shows items when live key is hr_decision_types
  - AC-SET-UI-02/04: create on ≥3 ADD buckets → list → search → F5 still there
  - AC-SET-UI-03: Ngưng → status Nháp / Đang dùng map; no hard delete
  - AC-SET-UI-06: Đồng bộ XBOS refresh (no seed)
cấm: seed; PASS chỉ vitest/probe
exit_criteria: evidence docs/qa/evidence/qa-erp-e1b-md-panel-01-20260728.md · matrix update · PASS_TO_PM
```

## Files touched

- `apps/web/hrm/src/lib/catalogSearchPicker.ts` (+ tests)
- `apps/web/hrm/src/lib/mdBucketRegistry.ts` (+ tests)
- `apps/web/hrm/src/lib/catalogDisplayLabels.ts`
- `apps/web/hrm/src/lib/hrmSettingsCatalogItem.ts` (+ tests)
- `apps/web/hrm/src/integrations/hrmApi.ts` (status on upsert)
- `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx` (+ test source gate)
- `apps/web/hrm/src/pages/Decisions.tsx` (DEC alias merge)
