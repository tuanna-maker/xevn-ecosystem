# D-HRM-SETTINGS-MD-LEAVE-FE-01 — LeaveTab empty-catalog (no hardcode SoT)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-fe |
| **work_item_id** | `D-HRM-SETTINGS-MD-LEAVE-FE-01` |
| **change_mode** | UPGRADE |
| **BA SoT** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` — AC-SET-FS-05 · BR-SET-MD-03 |
| **QA FAIL** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §1.4 |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Key | Value |
|-----|--------|
| **srs / BA** | `ba-hrm-settings-master-data-01-20260723.md` — BR-SET-MD-03 · AC-SET-FS-05 (empty → honest empty + CTA; cấm silent mock options) |
| **orphan** | G-ORPH-BE-04/13 FE LeaveTab bootstrap 8 keys |
| **spec says** | Catalog trống = empty + CTA «Đồng bộ XBOS / Thêm Cài đặt»; không hardcode list làm SoT |
| **code did (before)** | `LeaveTab` empty → bootstrap `leaveTypeLabels` 8 keys vào `CatalogSearchPicker` |
| **code does (after)** | `leaveTypeOptionsFromCatalog` → `[]` when empty; picker CTA + link Cài đặt; filter from catalog only |

---

## 2. Changes

| File | Delta |
|------|--------|
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | `leaveTypeOptionsFromCatalog` + `resolveLeaveTypeLabel` |
| `apps/web/hrm/src/lib/catalogSearchPicker.test.ts` | 3 tests AC-SET-FS-05 (empty / missing / populated) |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Remove bootstrap + hardcode filter; catalog SoT; empty form `leaveType: ''`; submit guard; neutral badge; CODE-MEMORY UPGRADE |

**must_keep:** Create/approve when catalog has items; UF leave paths with real catalog; U65 no seed.

**cấm:** seed; mock leave types as SoT.

---

## 3. Exit criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Empty catalog → no 8 fake types; empty/CTA UX | **PASS** (code) — `leaveTypeOptionsFromCatalog([]) === []`; `CatalogSearchPicker` amber empty + CTA link |
| 2 | With catalog items → picker/filter works | **PASS** (code) — options from `effectiveItems`; list filter `SelectItem` from same options |
| 3 | Unit/smoke | **PASS** — `vitest run src/lib/catalogSearchPicker.test.ts` → **13/13** (incl. 3 leave-type) |
| 4 | Evidence | this file |
| 5 | CODE-MEMORY | LeaveTab + catalogSearchPicker CHANGE 2026-07-25 |
| 6 | Bus READY_FOR_QA | yes |

---

## 4. Verify commands

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/catalogSearchPicker.test.ts
```

Exit **0** — 13 passed (2026-07-25).

Live browser UF (U65 FE→2xx→F5) **deferred to QA** — may still be BLOCKED if hrm-api compile / `qc:dev-stack` down (see QA evidence §0).

---

## 5. Residual (not this work_item)

| Residual | Owner |
|----------|--------|
| BE `LEAVE_TYPE_COLORS` / leave-balance default `annual` (G-ORPH-BE-04/13 BE) | dev-be (separate) |
| Live L2.5 UF leave create after sync | qa |
| Other P0 fields (chức danh seed, JD DTO, …) | parallel waves |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/fe-hrm-settings-md-leave-01-20260725.md`

### completion_report

**Closed:** LeaveTab no longer bootstraps 8 hardcoded leave types when `leave_types` empty; picker shows honest empty + CTA; filter/display labels from catalog SoT; unit lock on `leaveTypeOptionsFromCatalog`.

**Open:** Browser retest UF leave create (empty vs populated catalog) when stack up; BE palette/default residual out of scope.

### next_dispatch_prompt

```text
work_item_id: QA-HRM-SETTINGS-MD-LEAVE-01
role: qa
priority: P0
entry_criteria: D-HRM-SETTINGS-MD-LEAVE-FE-01 READY_FOR_QA; L0 qc:dev-stack when possible; U65 zero-seed; HOLD_DEPLOY
read_first:
  - docs/qa/evidence/fe-hrm-settings-md-leave-01-20260725.md
  - docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md (AC-SET-FS-05 · BR-SET-MD-03)
  - apps/web/hrm/src/components/attendance/LeaveTab.tsx
exit_criteria:
  1) Empty leave_types catalog → create dialog shows amber empty + CTA (no 8 fake types)
  2) After sync/settings has leave_types → picker + list filter work; create with catalog code succeeds FE after 2xx + F5
  3) Approve path still works when requests exist
  4) Evidence: docs/qa/evidence/qa-hrm-settings-md-leave-01-20260725.md
cấm: seed; API-only PASS; claim Phase1/PROD
```
