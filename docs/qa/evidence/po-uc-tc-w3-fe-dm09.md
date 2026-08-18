# Evidence — PO-UC-TC-W3-FE-DM09 · XBOS-DM-09 FE clone wire

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-FE-DM09` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **change_mode** | ADD |
| **uc_id** | `XBOS-DM-09` |
| **spec_ref** | by-uc `XBOS-DM-09.md` · OpenAPI `configSyncCloneCatalog` · QA residual R-DM09-FE-WIRE |

> **Không claim:** UAT Phase1 DONE · browser HP 🟢 (deferred QA R2) · apply-to-members = DM-09 · Leave L2 · clone-bundle LOG-09.

---

## spec_read_ack

| Artifact | Sections / notes |
|----------|------------------|
| **srs** | `docs/qa/professional/by-uc/XBOS-DM-09.md` · CAP-02 FN-COPY · TC-DM09-CPY-HP/FD/AU |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §8.1 · OpenAPI `configSyncCloneCatalog` |
| **db_design** | Reuse `config_catalogs` / items — no FE schema change |
| **api_design** | `POST /api/xbos/config-sync/catalog/{catalogKey}/clone` · body `CloneCatalogBody` · codes CFG-206 / CFG-409 / AUTH-003 / VAL-013 |
| **qa residual** | `docs/qa/evidence/po-uc-tc-w3-qa-dm09.md` · R-DM09-FE-WIRE |
| **uc_ids** | `XBOS-DM-09` |
| **change_mode** | ADD |
| **must_keep** | ApplyCatalogToMembersPanel = DM-HRM-07 only · leave L2 untouched · U65 no seed |

---

## Spec says / code does

| Spec says | Code before | Code after |
|-----------|-------------|------------|
| Action «Sao chép bộ danh mục» → POST …/clone | GAP — grep portal 0; Apply panel = DM-HRM-07 | CC settings `hrm_catalog_clone` → `CloneCatalogPanel` → `cloneCatalog()` |
| Group CEO HP → CFG-206 + FE feedback + F5 dest | N/A | Toast `XBOS-CFG-206` + result card + best-effort dest GET verify |
| Conflict → surface CFG-409 | N/A | `formatHttpError` includes `code` · `formatCloneCatalogUserError` ensures CFG-409 |
| Member CEO hide/forbid | N/A | Menu filtered by `isGroupCeoOnMasterTenant()` · panel AU blocked UI |
| must_keep apply ≠ clone | Apply labeled DM-HRM-07 | Untouched; clone is separate panel/client |

---

## Implementation

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/configSyncCloneCatalog.ts` | ADD client + body builders · CODE-MEMORY |
| `apps/web/web-portal/src/integrations/configSyncCloneCatalog.test.ts` | ADD unit tests |
| `apps/web/web-portal/src/pages/command-center/CloneCatalogPanel.tsx` | ADD panel «Sao chép bộ danh mục» |
| `apps/web/web-portal/src/pages/command-center/CloneCatalogPanel.test.ts` | ADD contract tests |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | ADD menu + mount · CODE-MEMORY APPEND |
| `apps/web/web-portal/src/utils/apiLogger.ts` | ADD code suffix in `formatHttpError` |

### Contract (FE → BE)

```http
POST /api/xbos/config-sync/catalog/{catalogKey}/clone
Authorization: Bearer <group_ceo_jwt>
Content-Type: application/json

{
  "tenantId": "xevn",
  "companyId": "holding",
  "destTenantId": "xe-du-lich",
  "destCompanyId": "main",
  "onConflict": "reject",
  "actor": "…"
}
```

Expect: **2xx** `XBOS-CFG-206` · conflict **409** `XBOS-CFG-409` · member **403** `XBOS-AUTH-003`.

### HDSD click path (QA R2)

1. Login `ceo@xe.vn` / `Xevn@2026`
2. Command Center → Cài đặt → **Sao chép bộ danh mục**
3. Chọn bộ danh mục (vd. Chức danh / Loại nghỉ) → chọn một ĐVTV đích → **Sao chép bộ danh mục**
4. Network: `POST …/catalog/{key}/clone` → **201/200** `XBOS-CFG-206` · FE toast + result
5. F5 / dest verify panel (hoặc persona ĐVTV nếu GET dest 409 scope)
6. AU: login `du-lich.ceo@xe.vn` → menu **ẩn**; nếu deep-link → banner XBOS-AUTH-003
7. FD: clone lại key đã có overlap → toast chứa `XBOS-CFG-409`

**Cấm:** dùng «Áp dụng danh mục HRM» (apply-to-members) làm 🟢 DM-09 · seed · Leave L2.

---

## Verification (dev-fe)

```text
pnpm --filter web-portal exec vitest run \
  src/integrations/configSyncCloneCatalog.test.ts \
  src/pages/command-center/CloneCatalogPanel.test.ts \
  src/pages/command-center/ApplyCatalogToMembersPanel.test.ts
→ Test Suites: 3 passed · Tests: 22 passed · EXIT 0
```

| Case | Layer | Result |
|------|-------|--------|
| Body builders + CFG-409 extract | vitest integration | PASS |
| Panel contract + CC menu wire | vitest source contract | PASS |
| Apply panel still DM-HRM-07 | vitest regression | PASS |
| Browser U65 HP/FD/AU | — | **deferred QA R2** |

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| R-DM09-U65-R2 | Browser U65 HP/FD/AU + F5 dest per by-uc | **qa** `PO-UC-TC-W3-QA-DM09-R2` |
| R-DM09-OPEN-UX | Progress / double-click polish | qa after R2 if needed |

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W3-FE-DM09
uc_id: XBOS-DM-09
evidence_path: docs/qa/evidence/po-uc-tc-w3-fe-dm09.md
next_owner: qa
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W3-QA-DM09-R2
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM
priority: P0
u65_zero_seed: true
hdsd_align: true

entry_criteria:
  - FE READY_FOR_QA evidence docs/qa/evidence/po-uc-tc-w3-fe-dm09.md
  - L0 stack up (xbos-api + portal) — no seed
  - by-uc docs/qa/professional/by-uc/XBOS-DM-09.md TC pack (OPEN/CPY/VER P0)
  - must_keep: ApplyCatalogToMembersPanel = DM-HRM-07 only — cấm claim apply as DM-09 PASS

exit_criteria:
  - Browser Group CEO: Cài đặt → Sao chép bộ danh mục → POST …/catalog/{key}/clone → Network 2xx XBOS-CFG-206 + FE toast/result + F5/dest visible
  - FD: conflict → UI surfaces XBOS-CFG-409
  - AU: du-lich.ceo — menu hidden or AU blocked (not runnable clone)
  - Update by-uc execution / Dev8088; evidence docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md
  - cấm: pnpm seed:* · API fake · PASS chỉ probe without FE click path

persona: ceo@xe.vn / Xevn@2026 (HP/FD); du-lich.ceo@xe.vn (AU)
spec_ref: XBOS-DM-09 · OpenAPI configSyncCloneCatalog · po-uc-tc-w3-fe-dm09.md
```
