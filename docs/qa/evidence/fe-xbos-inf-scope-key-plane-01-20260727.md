# D-XBOS-INF-SCOPE-KEY-PLANE-FE-01 — Infra `appliesToCompanyIds` key plane (FE)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-27 (ICT) |
| **change_mode** | ADD |
| **preserve_default** | true |
| **ack_status** | **READY_FOR_QA** |
| **U65** | No seed · no `apps/api/**` · no OP/MD/CO-HC reopen |

---

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| **srs** | `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` · UC-XBOS-INF-01 / UC-XBOS-CC-07 · BR-FCAT-SCOPE-03/04 · AC-FCAT-S2-05 |
| **api_design** | `docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md` §0 Key plane · §2 PUT · §4 AC-INF-KEY-01..05 |
| **adr** | `docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md` Option A Accepted · §4.4 write prefs |
| **sa evidence** | `docs/qa/evidence/sa-xbos-inf-scope-key-plane-01-20260727.md` PASS_TO_PM |
| **data linkage** | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6.2 #5 |

---

## What changed

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | ADD normalize/persist + toggle + forbidden B′/workforce slugs; CODE-MEMORY + CHANGE |
| `…/infrastructureEntityKeyResolver.test.ts` | AC-INF-KEY-01..05 + forbid matrix (13 tests) |
| `FoundationCategoryWizard.tsx` | Checkbox/preview alias-aware (`isInfraScopeKeySelected` / `infraEntityIdsMatch`) |
| `foundationCategoryList.ts` | Preview entity id alias-aware |
| `CommandCenterPage.tsx` | `toggleInfraAppliesToCompanyId` · normalize on PUT choke point · CODE-MEMORY-CHANGE |

**must_keep verified:** `infraEntityIdsMatch` holding aliases retained; no BE/API rewrite; no seed; OP/MD/CO-HC untouched.

---

## AC-INF-KEY matrix (unit)

| ID | Result | Evidence |
|----|--------|----------|
| AC-INF-KEY-01 | **PASS** | `toggleInfraAppliesToCompanyId([], VISUN_ID)` → `[LE UUID]` |
| AC-INF-KEY-02 | **PASS** | tick `main`/`holding`/root → persist `[xbos-group-holding-root]` |
| AC-INF-KEY-03 | **PASS** | LE in scope → `resolveInfraScopedRecord` + `isOperatingEntityInFoundationScope` |
| AC-INF-KEY-04 | **PASS** | holding-only scope → member LE **not** in-scope |
| AC-INF-KEY-05 | **PASS** | `isInfraScopeKeySelected(root, ['main'\|'holding'])` true |
| Forbid B′ / `trsport\|logistics\|finance\|services` | **PASS** | dropped on normalize; toggle ignore |

**Vitest:** `infrastructureEntityKeyResolver.test.ts` + `foundationCategoryList.test.ts` → **19/19 PASS** (2026-07-27).

---

## L0 / F5

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal **HTTP 200** (script exit noise UV on Windows — health lines green) |
| Browser F5 checkbox round-trip | **Deferred to QA** (U65 browser-only) — unit covers alias bind; QA must walk wizard → Lưu → F5 → tick match |

---

## completion_report

**Closed:** FE persist/normalize Plane A LE + holding prefer `xbos-group-holding-root`; never write B′ or workforce member slugs; wizard checkbox/preview alias-aware; PUT settings normalizes all foundation category scopes; CODE-MEMORY APPEND; unit AC-INF-KEY-01..05 PASS.

**Residual:** Browser L2.5 F5 round-trip + Network PUT body assert for QA; optional BE validate P2 `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` (not this wave).

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-INF-SCOPE-KEY-01
role: qa
lane: execution
entry_criteria: D-XBOS-INF-SCOPE-KEY-PLANE-FE-01 READY_FOR_QA — evidence docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md
read_first:
  - docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md
  - docs/architecture/ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727.md §4.4
  - docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md §4 AC-INF-KEY-01..05
account: ceo@xe.vn / Xevn@2026
URL: http://127.0.0.1:5173 (or :5175) → Command Center → Hạ tầng → Danh mục nền
U65: browser-only; cấm seed; cấm API fake inbox
exit_criteria:
  1) AC-INF-KEY-01..05 browser: tick member → PUT LE UUID; tick holding → body has xbos-group-holding-root (not only main)
  2) F5 / re-open wizard → checkboxes match GET (alias OK for legacy main/holding)
  3) Network: appliesToCompanyIds must NOT contain B′ 10000000-… or trsport|logistics|finance|services
  4) must_keep: CO-HC/OP/MD GWC; J-XBOS-05 custom-field still visible when LE in scope
  5) evidence docs/qa/evidence/qa-xbos-inf-scope-key-01-20260727.md → PASS_TO_PM or FAIL with residual
```

### evidence_path

`docs/qa/evidence/fe-xbos-inf-scope-key-plane-01-20260727.md`

### ack_status

**READY_FOR_QA**

### pm_dispatch_hint

`QA-XBOS-INF-SCOPE-KEY-01` — browser AC-INF-KEY + F5; not BE this wave.
