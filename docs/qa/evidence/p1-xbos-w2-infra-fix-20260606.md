# P1-XBOS-W2-INFRA-FE-FIX — J-XBOS-05 Infrastructure entity-key + scope gate

**Date:** 2026-06-06  
**work_item_id:** `P1-XBOS-W2-INFRA-FE-FIX`  
**Owner:** dev-fe  
**Source audit:** `docs/qa/evidence/p1-xbos-w2-infra-audit-20260606.md`  
**Journey:** J-XBOS-05 — Hạ tầng: nền → gán DN → điểm → custom field detail

## Defects closed

| ID | Severity | Fix summary |
|----|----------|-------------|
| **D-INFRA-CUSTOM-ENTITY-KEY-01** | P1 | `resolveInfraScopedRecord` + holding aliases (`main`, `holding`, `xbos-group-holding-root`) + foundation-scope inheritance on **Chi tiết hạ tầng** |
| **D-INFRA-SCOPE-SOFT-01** | P2 | `saveInfrastructureSite()` early-return + disabled **Lưu hạ tầng** when `!operatingEntityInFoundationScope` |

## Implementation

| File | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | **New** — alias-aware entity config key resolution + scoped record merge + foundation scope check |
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.test.ts` | **New** — 5 regressions (holding↔main, VISUN inherits main defs) |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Wire resolver for custom field defs/blocks/title overrides; hard-block OUT-of-scope site save |

## Verification (automated)

```bash
cd apps/web/web-portal
pnpm exec vitest run src/integrations/infrastructureEntityKeyResolver.test.ts
# 5/5 PASS

pnpm exec vitest run
# 165/165 PASS

pnpm run build
# exit 0
```

## QA retest checklist (L2.5 J-XBOS-05)

**Env:** `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002`

1. **Step 4 (P1):** Settings → Hạ tầng cơ sở → foundation **Cấu hình khối & trường** → add **QA W2 Infra Custom** → **Lưu danh mục nền** → Tab 2 → edit VISUN site → **Chi tiết hạ tầng** shows label/input.
2. **Step 4 (holding):** Site with operating entity **TẬP ĐOÀN** (`xbos-group-holding-root`) shows same custom fields (defs stored under `main`).
3. **Step 2 (P2):** Select OUT-of-scope pháp nhân (e.g. XE_DU_LICH) → amber banner + **Lưu hạ tầng** disabled; PUT must not fire.

**ack_status:** `READY_FOR_QA`

---

## QA retest — J-XBOS-05 steps 2 + 4 (2026-06-06)

**work_item_id:** `P1-XBOS-W2-INFRA-FE-FIX`  
**QA:** qa-lead  
**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Environment:** `http://localhost:5173` → xbos-api `:28002`  
**L0:** `pnpm run qc:dev-stack` exit **0** (hrm + xbos + portal 200)

### Automated regression

```bash
cd apps/web/web-portal
pnpm exec vitest run src/integrations/infrastructureEntityKeyResolver.test.ts
# 5/5 PASS

PORTAL_DEV_URL=http://localhost:5173 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
# exit 0 — PUT array XBOS-INFRA-201; customFieldDefsByEntity.main persisted
```

### Step 4 — Custom field config → detail form (P1)

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Modal lists **QA W2 Infra Custom** | **PASS** | Foundation **Cấu hình khối & trường** — field `company_infrastructure__general__qa_w2_infra_custom` visible |
| VISUN site **Chi tiết hạ tầng** renders field | **PASS** | `textbox` label **QA W2 Infra Custom** (`ref` snapshot); operating entity `VISUN — Công ty TNHH Du lịch Visun` |
| Holding **TẬP ĐOÀN** (`xbos-group-holding-root`) inherits `main` defs | **PASS** | CDP change entity → `hasCustomField: true`; no amber banner; save enabled |

**Step 4 verdict:** **PASS** — **D-INFRA-CUSTOM-ENTITY-KEY-01 CLOSED**

### Step 2 — OUT-of-scope pháp nhân hard gate (P2)

| Sub-check | Verdict | Evidence |
|-----------|---------|----------|
| Select **XE_DU_LICH** (OUT of foundation scope) | **PASS** | Entity `XE_DU_LICH — QA W1 XBOS legal audit 20260606-1525` |
| Amber scope warning | **PASS** | Body contains *Pháp nhân đang chọn chưa nằm trong phạm vi…* |
| **Lưu hạ tầng** disabled | **PASS** | `saveDisabled: true` (DOM) |
| PUT blocked on disabled save | **PASS** | Fetch hook: `putBefore=0`, `putAfter=0` after click attempt |

**Step 2 verdict:** **PASS** — **D-INFRA-SCOPE-SOFT-01 CLOSED**

### Defect closure

| ID | Prior | Retest |
|----|-------|--------|
| **D-INFRA-CUSTOM-ENTITY-KEY-01** | P1 FAIL | **CLOSED** |
| **D-INFRA-SCOPE-SOFT-01** | P2 GWC | **CLOSED** |

### Gate summary (retest scope)

| Journey step | Verdict |
|--------------|---------|
| 2 Sites OUT scope hard block | **PASS** |
| 4 Custom field → detail form (VISUN + holding) | **PASS** |

**J-XBOS-05 steps 2+4 (local :5173):** **PASS**

**evidence_path:** `docs/qa/evidence/p1-xbos-w2-infra-fix-20260606.md`  
**ack_status:** `READY_FOR_QC`
