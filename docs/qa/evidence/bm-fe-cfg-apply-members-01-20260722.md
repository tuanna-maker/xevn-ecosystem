# BM-FE-CFG-APPLY-MEMBERS-01 — XBOS Settings apply-to-members UX

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-FE-CFG-APPLY-MEMBERS-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P1 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **entry** | `docs/qa/evidence/bm-qa-jd-hire-apply-r2-20260722.md` · `bm-be-cfg-apply-members-01` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA residual | `docs/qa/evidence/bm-qa-jd-hire-apply-r2-20260722.md` §3 FE UX ABSENT · next_dispatch `BM-FE-CFG-APPLY-MEMBERS-01` |
| BE contract | `docs/qa/evidence/bm-be-cfg-apply-members-01-20260722.md` · `POST …/apply-to-members` → **XBOS-CFG-204** |
| Ownership | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §14 **XBOS-DM-HRM-07** |
| SA | `docs/qa/evidence/bm-sa-xbos-hrm-rec-trace-01-20260722.md` Option **B** · **G-BM-REC-01** |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` `configSyncApplyCatalogToMembers` · `ApplyCatalogToMembersBody` |

**must_keep verified:** JD-only YCTD (`JobRequisitionsTab`) · hire picker title format · U65 no seed · Phase1/PROD not claimed.

---

## What was implemented

### UX (Command Center Settings)

New menu **«Áp dụng danh mục HRM»** (`hrm_catalog_apply_members`) next to Duyệt danh mục HRM:

1. Select allow-list catalog: `job_titles` · `recruitment_channels` · `job_grades`
2. Load holding source snapshot (version / itemCount / checksum)
3. Multi-select ĐVTV from `group-member-units` (excludes holding root)
4. Confirm → `POST /api/xbos/config-sync/catalog/{key}/apply-to-members`
5. After 2xx: show **appliedCount** + per-target checksum; reload holding source (F5 contract — source list still present)
6. Amber note: Group CEO **409 SCOPE_CONTEXT_MISMATCH** on member `companyId` GET — confirm via member persona

### Files

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/configSyncApplyMembers.ts` | **ADD** API + target builders + 409 note |
| `apps/web/web-portal/src/integrations/configSyncApplyMembers.test.ts` | **ADD** vitest 4 |
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx` | **ADD** panel |
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.test.ts` | **ADD** source contract 5 |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | **ADD** menu + render |
| `apps/web/web-portal/src/utils/catalogDisplayLabels.ts` | **ADD** labels for 3 keys |

### Target mapping (matches QA + BE jest)

| Member row | Target sent |
|------------|-------------|
| `tenantId === xevn` (legal UUID partition) | `{ tenantId: xevn, companyId: <uuid> }` |
| Distinct member tenant (e.g. `xe-du-lich`) | `{ tenantId: xe-du-lich, companyId: main }` |
| Source | `{ tenantId: xevn, companyId: holding }` |

---

## Vitest evidence

```text
pnpm --filter web-portal exec vitest run \
  src/integrations/configSyncApplyMembers.test.ts \
  src/pages/command-center/ApplyCatalogToMembersPanel.test.ts \
  src/utils/catalogDisplayLabels.test.ts

Test Files  3 passed (3)
Tests:      13 passed (13)
```

---

## QA click path (U65 · :8088 or local)

1. Login `ceo@xe.vn` → Command Center → **Cài đặt** → **Áp dụng danh mục HRM**
2. Catalog = Chức danh (`job_titles`) → confirm source itemCount ≥1
3. Select ≥1 ĐVTV (e.g. Visun / Xe Du Lịch) → **Áp dụng** → confirm dialog
4. Network: `POST …/catalog/job_titles/apply-to-members` → **201/200** `XBOS-CFG-204`
5. FE: status shows `appliedCount=N` + checksum; source summary still visible after reload
6. Optional: F5 page → menu still works; holding source unchanged
7. Optional note: member GET under Group CEO may **409** — documented in panel (not FAIL)

**cấm:** seed · claim BM-06 full E2E until WF bind · Phase1/PROD

---

## Residual

| Item | Owner |
|------|-------|
| Browser U65 on :8088 after FE sync | `qa` `BM-QA-CFG-APPLY-MEMBERS-FE-01` |
| Member persona confirm catalog after apply+pull | `qa` `QA-BM-MEMBER-CATALOG-FE-01` (`du-lich.ceo@xe.vn`) |
| G-BM-REC-02 WF bind | `BM-BE-REC-WF-BIND-01` (out of this FE) |

---

## completion_report

**Closed:** XBOS Settings UX for POST apply-to-members on allow-list keys; appliedCount + checksum feedback; F5/source reload; Group CEO 409 note; vitest 13 PASS.  
**Residual:** Browser QA on deploy/sync host; member-persona observe; WF apply still open.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: BM-QA-CFG-APPLY-MEMBERS-FE-01
from_role: pm
to_role: qa
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: docs/qa/evidence/bm-fe-cfg-apply-members-01-20260722.md READY_FOR_QA · FE synced to env under test · U65 zero-seed
job:
  - ceo@xe.vn → Command Center → Cài đặt → «Áp dụng danh mục HRM»
  - Select job_titles (also spot-check recruitment_channels) → select ≥1 ĐVTV → Áp dụng
  - Network POST …/apply-to-members → XBOS-CFG-204; FE shows appliedCount; F5 holding source still listed
  - Confirm 409 note visible; do NOT FAIL solely on Group CEO member GET 409
  - must_keep: BM-AC-05 JD-only · hire picker title · no seed
exit_criteria: PASS_TO_PM · evidence docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-YYYYMMDD.md
spec_ref: XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI configSyncApplyCatalogToMembers
parallel_optional: QA-BM-MEMBER-CATALOG-FE-01 with du-lich.ceo@xe.vn after apply+HRM pull
```

## ack_status

**READY_FOR_QA**
