# BM-QA-CFG-APPLY-MEMBERS-FE-01 — Áp dụng danh mục HRM (ĐVTV) U65 browser

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-CFG-APPLY-MEMBERS-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **persona** | `ceo@xe.vn` (planned) — **not reached** (CC SPA dead) |
| **URL** | `http://14.225.217.232:8088` |
| **target path** | `/command-center` → Cài đặt → **Áp dụng danh mục HRM** → `job_titles` → ≥1 ĐVTV → Áp dụng |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **entry** | `docs/qa/evidence/d-do-sync-8088-bm-fe-apply-01-20260722.md` (PASS — apply panel synced) |
| **spec_ref** | XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI `configSyncApplyCatalogToMembers` |
| **executed_at** | `2026-07-22` ICT |
| **ack_status** | **FAIL_TO_PM** · **BLOCKED** |

---

## Verdict

| Layer | Result |
|-------|--------|
| L0 portal `:8088/` | **200** · shell home renders (Unified Shell CTA) |
| L2 `/command-center` | **FAIL** — blank SPA (`#root` childCount **0**) |
| L2.5 apply click path | **BLOCKED** — cannot open Cài đặt / Áp dụng danh mục HRM |
| POST `…/apply-to-members` XBOS-CFG-204 | **NOT EXECUTED** |
| FE `appliedCount` + F5 | **NOT EXECUTED** |
| Seed | **None** |

**Overall:** **FAIL_TO_PM** — Command Center broken by Vite missing portal deps (same class as prior `D-DO-8088-PORTAL-PRESETS-SYNC-01`). Apply-to-members panel sources are live but **unreachable** until CC boots.

---

## Blocker cite (P0)

**Work item required before retest:** `D-DO-8088-PORTAL-PRESETS-SYNC-01` (expand allow-list — not only presets stub).

### Vite evidence (browser fetch, no seed)

| Module URL | HTTP | Observation |
|------------|------|-------------|
| `/src/pages/command-center/ApplyCatalogToMembersPanel.tsx` | **200** `text/javascript` | Synced (matches D-DO-SYNC entry) |
| `/src/integrations/configSyncApplyMembers.ts` | **200** `text/javascript` | Synced |
| `/src/pages/command-center/CommandCenterPage.tsx` | **500** | `[plugin:vite:import-analysis] Failed to resolve import "./MetadataTypedFieldControls" from "src/pages/command-center/CommandCenterPage.tsx". Does the file exist?` |
| `/src/pages/command-center/MetadataTypedFieldControls.tsx` | **200** `text/html` | **SPA fallback** — file **missing** on VPS bind-mount |
| `/src/data/hrm-recruitment-workflow-presets.ts` | **500** | `Failed to resolve import "./workflow-resolver" from "src/data/hrm-recruitment-workflow-presets.ts". Does the file exist?` |
| `/src/data/workflow-resolver.ts` | **200** `text/html` | **SPA fallback** — file **missing** on VPS |

Prior wave (`bm-qa-contract-comp-retest-01-20260722.md`): CC blocked on missing `hrm-recruitment-workflow-presets`. Presets file now present, but **transitive deps** (`workflow-resolver`, `MetadataTypedFieldControls`, …) still absent → CC still dead.

### UI observation

- Navigate `http://14.225.217.232:8088/command-center` → white/blank page.
- Screenshot: blank `#root` (no login form, no CC chrome, no settings rail).
- Login → Cài đặt → Áp dụng … **cannot start** while SPA fails module graph.

---

## Planned AC (not run — blocked)

| AC | Expected | Actual |
|----|----------|--------|
| Open panel **Áp dụng danh mục HRM** | Visible under CC Cài đặt | **BLOCKED** |
| Catalog `job_titles` | Selectable | **BLOCKED** |
| ≥1 ĐVTV selected → Áp dụng | Confirm + mutate | **BLOCKED** |
| Network POST `/api/xbos/config-sync/catalog/job_titles/apply-to-members` | **2xx** + code **XBOS-CFG-204** + `appliedCount` ≥ 1 | **NOT EXECUTED** |
| FE after 2xx | Toast/status shows appliedCount | **NOT EXECUTED** |
| F5 | Holding source still listed | **NOT EXECUTED** |
| Member GET 409 under Group CEO | Note only — do not sole-FAIL | N/A |
| must_keep BM-AC-05 JD-only · hire title | No regression touch | N/A (no mutate) |

---

## Residual / PM dispatch

| Item | Owner | Priority |
|------|-------|----------|
| Sync missing portal files so Vite resolves CC graph (`workflow-resolver`, `MetadataTypedFieldControls`, any further import-analysis misses, full presets tree) + restart `portal-fe` + prove `/command-center` renders | `devops` **`D-DO-8088-PORTAL-PRESETS-SYNC-01`** | **P0** |
| Re-run this UF after CC green | `qa` **`BM-QA-CFG-APPLY-MEMBERS-FE-01`** (retest) | P0 |
| Member persona catalog after apply+pull | `qa` `QA-BM-MEMBER-CATALOG-FE-01` | defer until apply PASS |

---

## completion_report

**Closed:** U65 probe of apply-to-members FE path on `:8088`; confirmed apply panel modules synced; confirmed CC SPA **BLOCKED** by Vite import-analysis (missing `MetadataTypedFieldControls` + `workflow-resolver` deps). No seed. No false PASS on POST.

**Residual:** Browser AC (XBOS-CFG-204 + appliedCount + F5) **open** until `D-DO-8088-PORTAL-PRESETS-SYNC-01` restores Command Center.

## next_owner

`pm` → `devops` (`D-DO-8088-PORTAL-PRESETS-SYNC-01`) then re-dispatch `qa` retest same work item.

## next_dispatch_prompt

```text
work_item_id: D-DO-8088-PORTAL-PRESETS-SYNC-01
from_role: pm
to_role: devops
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry: docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-20260722.md FAIL_TO_PM BLOCKED
job:
  - On VPS portal bind-mount, sync ALL missing CC Vite deps so CommandCenterPage transforms 200:
    - apps/web/web-portal/src/data/workflow-resolver.ts (+test if needed)
    - apps/web/web-portal/src/pages/command-center/MetadataTypedFieldControls.tsx
    - complete hrm-recruitment-workflow-presets dependency tree
    - iterate: curl/fetch CommandCenterPage.tsx until NOT vite:import-analysis 500
  - restart portal-fe; prove http://14.225.217.232:8088/command-center renders UI (not blank #root)
  - cấm: seed · Phase1/PROD · touch non-xevn
exit_criteria: PASS_TO_PM · evidence docs/qa/evidence/d-do-8088-portal-presets-sync-01-YYYYMMDD.md
then: re-dispatch BM-QA-CFG-APPLY-MEMBERS-FE-01 (ceo → Cài đặt → Áp dụng danh mục HRM → job_titles → ≥1 ĐVTV → POST XBOS-CFG-204 + appliedCount + F5)
```

## ack_status

**FAIL_TO_PM**
