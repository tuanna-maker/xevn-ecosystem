# Evidence — PO-UC-TC-W3-QA-DM09 · XBOS-DM-09 clone catalog (U65)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-QA-DM09` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **uc_id** | `XBOS-DM-09` |
| **spec_ref** | by-uc `XBOS-DM-09.md` · OpenAPI `configSyncCloneCatalog` · BE `po-uc-tc-w3-be-dm09.md` |
| **hdsd_align** | N/A for mutate UI — no dedicated «Sao chép bộ danh mục» wire to `POST …/clone` (see FE) |

> **Không claim:** UAT Phase1 DONE · FE 🟢 · apply-to-members (DM-HRM-07) = DM-09 · Leave L2 · clone-bundle (LOG-09).

---

## L0 stack

| Probe | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **hrm-api** 200 `:28001` · **xbos-api** 200 `:28002` · web-portal `:5173` optional down |
| Seed | **không** chạy `pnpm seed:*` |

---

## Persona / auth

| Persona | Login | JWT (claims) |
|---------|-------|----------------|
| HP Group CEO | `POST /api/xbos/auth/login` **201** `XBOS-AUTH-200` · `ceo@xe.vn` | `roleCode=group_ceo` · `tenantId=xevn` · `companyId=main` |
| AU Member CEO | **201** · `du-lich.ceo@xe.vn` | `roleCode=subsidiary_ceo` · `tenantId=xe-du-lich` · `companyId=main` |

Headers for clone: `Authorization: Bearer <jwt>` + `X-Internal-Api-Key: xevn-dev-internal-key` (dev).

---

## API results (P0)

| TC-ID | Call | HTTP | Code | Verdict |
|-------|------|-----:|------|---------|
| **TC-DM09-CPY-HP-001** | `POST …/catalog/leave_types/clone` holding→`xe-du-lich/main` `onConflict=reject` | **201** | **`XBOS-CFG-206`** | 🟢 API |
| HP reconfirm | `POST …/catalog/contract_types/clone` same dest | **201** | **`XBOS-CFG-206`** | 🟢 API |
| **TC-DM09-CPY-FD-001** | `POST …/catalog/job_titles/clone` reject (dest overlap) | **409** | **`XBOS-CFG-409`** | 🟢 API |
| FD reconfirm | `leave_types` reject after HP | **409** | **`XBOS-CFG-409`** | 🟢 API |
| **TC-DM09-CPY-AU-001** | member JWT clone | **403** | **`XBOS-AUTH-003`** | 🟢 API |
| Self-copy | dest == source (`xevn/holding`) | **400** | **`XBOS-VAL-013`** | 🟢 API |

### HP excerpt (no secrets)

```json
{
  "success": true,
  "code": "XBOS-CFG-206",
  "message": "Catalog cloned",
  "data": {
    "catalogKey": "contract_types",
    "onConflict": "reject",
    "source": { "tenantId": "xevn", "companyId": "holding", "itemCount": 5 },
    "dest": { "tenantId": "xe-du-lich", "companyId": "main", "version": 1, "itemCount": 5 }
  }
}
```

Post-HP verify: `GET …/catalog/leave_types?tenantId=xe-du-lich&companyId=main` → **200** `XBOS-CFG-201` · items=4.

### FD excerpt

```json
{
  "success": false,
  "code": "XBOS-CFG-409",
  "message": "Clone blocked: destination already has overlapping item codes (CEO, CHRO, DRIVER_LEAD, OPS_MANAGER)"
}
```

### AU excerpt

```json
{
  "success": false,
  "code": "XBOS-AUTH-003",
  "message": "Catalog bundle clone requires group catalog admin on master tenant",
  "details": { "tenantId": "xe-du-lich", "roleCode": "subsidiary_ceo" }
}
```

### Self-copy excerpt

```json
{
  "success": false,
  "code": "XBOS-VAL-013",
  "message": "Clone destination must differ from source scope"
}
```

**Distinct from:** `POST …/apply-to-members` (`XBOS-CFG-204`, DM-HRM-07) · `POST …/catalogs/clone-bundle` (`XBOS-CFG-205`, LOG-09).

---

## FE / browser (U65 honesty)

| Check | Finding | Verdict |
|-------|---------|---------|
| Grep portal `…/clone` / `cloneCatalog` / `configSyncClone` | **0** matches under `apps/web/web-portal/src` | — |
| CC panel | `ApplyCatalogToMembersPanel` labels **XBOS-DM-HRM-07** · POST `…/apply-to-members` | **not** DM-09 |
| Dedicated «Sao chép» → `POST …/catalog/{key}/clone` | **missing** | 🟡 **BLOCKED UI** |

| UI TC | Verdict |
|-------|---------|
| TC-DM09-OPEN-HP-001 | 🟡 BLOCKED UI — no DM-09 clone control (Apply panel ≠ clone) |
| TC-DM09-OPEN-AU-001 | ⬜ deferred UI (API AU 🟢) |
| TC-DM09-CPY-HP/FD/AU (UI) | 🟡 BLOCKED UI |
| TC-DM09-VER-* | ⬜ API dest verify only for HP; FE F5 N/A |

**Cấm:** dùng Apply-to-members làm 🟢 DM-09.

---

## by-uc honesty stamp

Updated `docs/qa/professional/by-uc/XBOS-DM-09.md`:

- `execution`: **API_PASS · UI_BLOCKED**
- `code_readiness`: **LIKELY_PARTIAL** (BE live 🟢; FE wire GAP)
- `uat_done`: **false**

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-DM09-FE-WIRE** | P1 | **dev-fe** | Wire CC/settings action «Sao chép bộ danh mục» → `POST /api/xbos/config-sync/catalog/{catalogKey}/clone` (`XBOS-CFG-206`); conflict toast `XBOS-CFG-409`; hide/forbid for member CEO. **Không** reuse ApplyCatalogToMembers as DM-09. |
| R-DM09-OPEN-UX | P2 | qa after FE | Progress / double-click when UI exists |
| Leave L2 | — | — | **not touched** |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W3-QA-DM09
uc_id: XBOS-DM-09
evidence_path: docs/qa/evidence/po-uc-tc-w3-qa-dm09.md
next_owner: pm
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W3-FE-DM09
from_role: pm
to_role: dev-fe
lane: execution
ack_status_target: READY_FOR_QA
priority: P1
u65_zero_seed: true
change_mode: ADD
preserve_default: true

entry_criteria:
  - QA PASS_TO_PM API: docs/qa/evidence/po-uc-tc-w3-qa-dm09.md (XBOS-CFG-206/409/AUTH-003/VAL-013)
  - OpenAPI configSyncCloneCatalog · by-uc XBOS-DM-09.md
  - must_keep: ApplyCatalogToMembersPanel = DM-HRM-07 only; leave L2 untouched

exit_criteria:
  - FE action «Sao chép bộ danh mục» (or equivalent HDSD label) calls POST /api/xbos/config-sync/catalog/{catalogKey}/clone
  - Group CEO HP: Network 201 XBOS-CFG-206 + FE feedback + F5 dest visible
  - Conflict path surfaces XBOS-CFG-409; member persona cannot run clone (hidden or 403)
  - Do NOT map Apply-to-members / clone-bundle as DM-09
  - evidence: docs/qa/evidence/po-uc-tc-w3-fe-dm09.md + CODE-MEMORY APPEND
  - READY_FOR_QA → PO-UC-TC-W3-QA-DM09-R2 browser U65

persona: ceo@xe.vn / Xevn@2026; du-lich.ceo@xe.vn (AU hide)
spec_ref: XBOS-DM-09 · TECHSPEC_HE §8.1 · OpenAPI configSyncCloneCatalog
allowed_paths:
  - apps/web/web-portal/src/pages/command-center/**
  - apps/web/web-portal/src/integrations/**
forbidden_paths:
  - apps/api/**
  - ApplyCatalogToMembers semantics rewrite to claim DM-09
```
