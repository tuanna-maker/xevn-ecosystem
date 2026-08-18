# Evidence — `PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX |
| **u65_zero_seed** | true |
| **residual closed** | `R-W4-AT12-L1-CREATE-CATALOG-BE-PULL` |
| **prior QA FAIL** | [`po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md`](po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.md) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA R5 | sync 201 + `x-company-id=trsport` but `pulledKeys=[]` · picker empty |
| FE CLOSED | [`po-uc-tc-w4-fe-at12-l1-create-catalog-01.md`](po-uc-tc-w4-fe-at12-l1-create-catalog-01.md) — member GET/sync header `trsport` |
| Domain SoT | XBOS publish under `holding` · HRM member OU store partition `trsport` · pull ≠ apply ≠ clone |
| UC | UC-HRM-06 · XBOS-DM-HRM-10 · HRM-AT-12 create precond `leave_types` |
| must_keep | AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · ceo@ EXPECTED_NO_CTA · U65 · main sync ≠ apply/clone |

---

## Root cause

| Layer | Finding |
|-------|---------|
| FE | Correctly sends `x-company-id=trsport` (CLOSED) |
| BE partition | Member JWT → `resolveHrmSettingsCatalogCompanyId` keeps **`trsport`** (not holding) |
| XBOS SoT | Catalogs (incl. `leave_types`) published under **`holding`** only (`list?companyId=holding` total=74) |
| Bug | `listRemote` / `pullExact` queried XBOS with **store** companyId=`trsport` → empty list → `pulledKeys=[]` |
| Secondary | Concurrent pull of 74 keys can hit XBOS deadlock `XBOS-SYS-001` 500 — aborted whole sync |

---

## Fix (preserve_default)

1. **`resolveXbosCatalogPublishSourceCompanyId`** — master member OU (`trsport`/`logistics`/…) → XBOS source **`holding`**; store still OU slug.
2. **`listRemoteCatalogsFromXbos` / `pullExactCatalogFromXbos`** — GET XBOS with source=`holding`, upsert `synced_catalogs` under OU.
3. **Hardening:** pullExact retries 5xx (×3); `syncAllFromXbos` concurrency 4; soft-skip transient `HRM-SYNC-001` matching `XBOS API error 5xx` so bulk sync still returns 201 with other keys (e.g. `leave_types`).
4. CODE-MEMORY APPEND on catalog-sync + settings-catalogs services.

### must_keep verified

| Invariant | Status |
|-----------|--------|
| AT-12 L1 approve | **untouched** |
| Leave L2 | **not invented** |
| ceo@ Duyệt CTA | **not wired** |
| pull ≠ apply-to-members ≠ clone | **kept** (still sync-from-xbos / pull) |
| U65 seed / DB insert leave_types | **not run** |
| Group CEO main→holding | **unchanged** |

---

## Verification

| Check | Result |
|-------|--------|
| Jest `catalog-sync-upstream` + `settings-catalogs.service.spec` | **20/20 PASS** |
| Live POST `…/settings-catalogs/sync-from-xbos` · mgr `uat.nv0002@xe.vn` · `x-company-id=trsport` | **201** `HRM-SET-201` · **pulledKeys=74** · **`leave_types` included** · skipped=0 |
| Live GET `…/settings-catalogs` · `x-company-id=trsport` | **200** · `leave_types.effectiveItems=4` (LVT_01.. sample) |
| Seed / DB insert | **not** run |

### Live sample (read-only API probe — not UF claim)

```text
POST /api/hrm/settings-catalogs/sync-from-xbos
  Authorization: Bearer <uat.nv0002 mobile>
  x-company-id: trsport
  → 201 HRM-SET-201 · pulledKeys.length=74 · includes leave_types

GET /api/hrm/settings-catalogs
  x-company-id: trsport
  → leave_types.effectiveItems ≥ 1 (observed 4: LVT_01 Phép năm, LVT_02 Ốm, …)
```

---

## Files

- `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
- `apps/api/hrm-api/src/catalog-sync/catalog-sync-upstream.spec.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts`
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.spec.ts`

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-BE-AT12-L1-CREATE-CATALOG-PULL
evidence_path: docs/qa/evidence/po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md
next_owner: qa
completion_report: |
  Closed R-W4-AT12-L1-CREATE-CATALOG-BE-PULL: member OU sync-from-xbos reads XBOS
  holding SoT and stores under trsport; live 201 pulledKeys=74 incl leave_types;
  GET leave_types.effectiveItems=4. Soft-skip transient XBOS 5xx. U65 no seed.
  must_keep AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · not apply/clone.
next_dispatch_prompt: |
  work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG
  from_role: pm
  to_role: qa
  ack_status_target: PASS_TO_PM
  u65_zero_seed: true
  entry: docs/qa/evidence/po-uc-tc-w4-be-at12-l1-create-catalog-pull-01.md
  Same browser steps as R5 (uat.nv0002@xe.vn · trsport · Nghỉ phép → Tạo yêu cầu):
    empty CTA Đồng bộ từ XBOS → POST sync 201 · x-company-id=trsport
    → leave type picker ≥1 · optional U65 create if picker filled (not Leave L2 PASS)
  must_keep: AT-12 L1 approve CLOSED · Leave L2 SPEC_GAP · ceo@ EXPECTED_NO_CTA · U65
  evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.md
  exit: PASS when picker ≥1 after FE sync; FAIL if pulledKeys=0 or picker empty
```
