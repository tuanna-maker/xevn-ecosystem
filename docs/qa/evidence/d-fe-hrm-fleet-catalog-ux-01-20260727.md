# D-FE-HRM-FLEET-CATALOG-UX-01 — G-FL-07 catalog-missing / empty fleet UX

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-HRM-FLEET-CATALOG-UX-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution · close G-FL-07 (sponsor zero-residual) |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes |

---

## 1. spec_read_ack

| Plane | Path · ack |
|-------|------------|
| **srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.49 **FR-HRM-FL-01** Diễn biến **#3** empty · **#4** tìm biển/tên · **#7** thiếu danh mục · **#8** thành công |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.5 row 49 · envelope `HRM-FLEET-200` |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_FLEET.md` · residual G-FL-07 marked FE CLOSED pending QA |
| **api_design** | `docs/hrm/API_DESIGN_HRM_FLEET.md` §A · G-FL-02 CLOSED · G-FL-07 FE CLOSED pending QA |
| **uc_ids** | FR-HRM-FL-01 / HRM-FL-01 |
| **sponsor_confirm** | PM DISPATCHED D-FE-HRM-FLEET-CATALOG-UX-01 2026-07-27 · U65 · HOLD_DEPLOY |
| **must_keep** | FL-01 list-only · U65 empty OK · soft U72 maps untouched · no invent create-vehicle · HOLD_DEPLOY |

---

## 2. Deliverables

| Artifact | Change |
|----------|--------|
| `apps/web/hrm/src/lib/fleetCatalogUx.ts` | **ADD** empty/catalog-missing copy · status/field display · catalog gate (no raw keys) |
| `apps/web/hrm/src/lib/fleetCatalogUx.test.ts` | **ADD** 6 vitest |
| `apps/web/hrm/src/hooks/useFleetVehicles.ts` | **ADD** GET list + shared settings-catalogs · `q` debounce · no focus refetch storm |
| `apps/web/hrm/src/pages/Fleet.tsx` | **ADD** list-only UI · empty · catalog banner · search · no create CTA |
| `apps/web/hrm/src/integrations/hrmApi.ts` | **ADD** `listFleetVehicles` (`q` prefer) |
| `apps/web/hrm/src/App.tsx` | Route `/fleet` + CODE-MEMORY APPEND |
| `AppSidebar` · `MobileBottomNav` · i18n `nav.fleet` | Menu «Hồ sơ xe» |
| Portal `types` · `registry` · `paths` · `HrmSidebar` · `hrmApiClient` | View `fleet` → `/hr/fleet` · `listHrmFleetVehicles` opts `q` |
| `hrmEmbedPortalNav` | `fleet` path |
| `API_DESIGN` / `DB_DESIGN` G-FL-07 | FE CLOSED pending QA |

**forbidden honored:** no seed · no invent create-vehicle · no wipe U72 `labelMaps` · no Phase1/PROD · HOLD_DEPLOY.

---

## 3. UX contract (G-FL-07)

| State | FE behavior |
|-------|-------------|
| Loading | Single spinner; catalogs+vehicles gate; `refetchOnWindowFocus: false` · staleTime 60s |
| Empty (catalog OK) | VI «Chưa có hồ sơ xe» · U65 honest |
| Empty + keyword | VI «Không tìm thấy xe khớp từ khóa» |
| Catalog missing | Amber banner + empty copy VI · link Command Center sync (portal) · **no fake rows** · **no raw `hrm_fleet_*` in copy** |
| Has rows | Table BKS / Tên·Model / Lái xe / Tuyến / Trạng thái VI (`Đang hoạt động` / `Ngừng` / `—`) |
| Search | Debounced → BE `q` (G-FL-02) |
| Mutate | **None** — FL-01 list-only |

---

## 4. Verification

| Command | Result |
|---------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/fleetCatalogUx.test.ts src/lib/hrmEmbedPortalNav.test.ts` | **PASS** · 2 files · **7** tests |
| `pnpm --filter web-portal exec vitest run src/modules/hrm/registry.test.ts` | **PASS** · **5** tests (incl. fleet view map) |

---

## 5. Residual (honest)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-FL-07** | P2 | `qa` | FE CLOSED this WI — browser L2/L2.5 verify |
| **G-FL-01** | Info | ba / fe optional | Detail get-by-id non-goal |
| **G-FL-UPSERT** | Info/P2 | future write FR | **must_keep** — no public create |
| **G-SCOPE-01** | P0 standing | on-touch | Scope parity standing |

**Non-claims:** Phase1/PROD · UF 🟢 via seed · public fleet write · U72 map wipe.

---

## 6. Handoff

### completion_report

**Closed:** G-FL-07 FE — added `/fleet` list-only Hồ sơ xe with honest empty, catalog-missing VI banner (no raw keys, no fake rows), status/field display fail-closed to `—`, keyword bound to BE `q`, no spinner storm, portal registry/sidebar wired; vitest 7+5 PASS; U72 maps untouched; HOLD_DEPLOY.

**Residual:** QA browser verify G-FL-07 · G-FL-01 detail · G-FL-UPSERT future.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-FLEET-CATALOG-UX-01
from_role: pm
to_role: qa
lane: execution · browser L2/L2.5 G-FL-07 (U65 zero-seed)
entry_criteria: D-FE-HRM-FLEET-CATALOG-UX-01 READY_FOR_QA · evidence docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md
read_first:
  - docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 FR-HRM-FL-01 #3/#4/#7/#8
  - docs/hrm/API_DESIGN_HRM_FLEET.md §A
  - docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md
exit_criteria:
  1) Login → HRM → Hồ sơ xe (/hr/fleet or /command-center/hrm/fleet)
  2) Empty: VI clear · no raw keys · no spinner storm · no create CTA
  3) If catalog missing: amber banner VI + empty · no fake rows
  4) Search box present → Network GET …/fleet/vehicles?q=… (or empty list OK)
  5) Confirm no POST/PUT fleet vehicles
  6) Evidence docs/qa/evidence/qa-hrm-fleet-catalog-ux-01-20260727.md · matrix G-FL-07 CLOSED or FAIL
cấm: seed fleet · invent upsert · Phase1/PROD
ack_status target: PASS_TO_PM or FAIL_TO_PM
```

### evidence_path

`docs/qa/evidence/d-fe-hrm-fleet-catalog-ux-01-20260727.md`

### ack_status

**READY_FOR_QA**
