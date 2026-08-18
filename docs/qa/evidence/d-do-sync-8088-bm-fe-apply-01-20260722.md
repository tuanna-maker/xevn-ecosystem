# D-DO-SYNC-8088-BM-FE-APPLY-01 — Sync apply-to-members portal FE to :8088

| Field | Value |
|-------|--------|
| **work_item_id** | `D-DO-SYNC-8088-BM-FE-APPLY-01` |
| **from_role** | devops |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **date** | 2026-07-22 (ICT) |
| **portal** | http://14.225.217.232:8088 |
| **entry** | `docs/qa/evidence/bm-fe-cfg-apply-members-01-20260722.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (NARROW)

Sync BM-FE-CFG-APPLY-MEMBERS-01 **portal** files to VPS bind-mount; restart `portal-fe` only; L0 smoke HTTP **200**.

**cấm:** seed · Phase1/PROD claim · full rebuild · non-xevn containers

**Out of scope:** `hrm-fe` (portal-only UX) · browser U65 QA (`BM-QA-CFG-APPLY-MEMBERS-FE-01`)

---

## Files synced (pscp)

| Local path | VPS path | MD5 (local = VPS) |
|------------|----------|-------------------|
| `apps/web/web-portal/src/integrations/configSyncApplyMembers.ts` | `/opt/xevn-ecosystem/.../configSyncApplyMembers.ts` | `7af2bfea5dabdd6729c066abdd465ebe` |
| `apps/web/web-portal/src/integrations/configSyncApplyMembers.test.ts` | (same) | synced |
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx` | (same) | `3e6fcf1db42e2ecf33b829d6c5ad7466` |
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.test.ts` | (same) | synced |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | (same) | `d88023a9d72292f50ea431e837d53112` |
| `apps/web/web-portal/src/utils/catalogDisplayLabels.ts` | (same) | `678596dfcff9add0db85cdc698d70691` |
| `apps/web/web-portal/src/utils/catalogDisplayLabels.test.ts` | (same) | synced |

### Host markers (post-pscp)

- `CommandCenterPage.tsx`: `hrm_catalog_apply_members`, label **Áp dụng danh mục HRM**, render `<ApplyCatalogToMembersPanel />`
- `catalogDisplayLabels.ts`: `job_titles` / `recruitment_channels` / `job_grades`
- Container `xevn-portal-fe-dev`: `configSyncApplyMembers.ts` present; `grep -c hrm_catalog_apply_members` → **4**; `APPLY_PANEL_OK`

---

## Ops steps

1. **Audit:** `xevn-portal-fe-dev` Up (4d), `xevn-hrm-fe-dev` Up; host `:8088`/`:8080` LISTEN. Target files **MISSING** before sync.
2. **pscp** allow-list files → `/opt/xevn-ecosystem/apps/web/web-portal/...` (volume `../..:/app`).
3. **Restart:** `cd /opt/xevn-ecosystem/deploy/xevn-ecosystem && docker compose --env-file .env restart portal-fe` → Started; Up ~15s.
4. **hrm-fe:** not restarted (portal-only change).

---

## Smoke gates

| Check | Result |
|-------|--------|
| VPS `http://127.0.0.1:8088/` | **200** |
| VPS `http://127.0.0.1:8088/command-center` | **200** |
| VPS `http://127.0.0.1:8088/api/xbos/metrics` | **200** |
| VPS `http://127.0.0.1:8088/api/hrm/metrics` | **200** |
| Ext `http://14.225.217.232:8088/` | **200** |
| Ext `…/command-center` + metrics | **200** |
| MD5 local ↔ VPS (4 runtime files) | **MATCH** |
| Non-xevn (ytexa/hsbx/asms sample) | **Up** untouched |

---

## Residual

| Item | Owner |
|------|-------|
| Browser U65 apply-to-members on :8088 | `qa` `BM-QA-CFG-APPLY-MEMBERS-FE-01` |
| Member persona catalog after apply+pull | `qa` `QA-BM-MEMBER-CATALOG-FE-01` |
| git HEAD parity (pscp drift) | defer — not blocking QA |

---

## completion_report

**Closed:** BM-FE apply-to-members portal sources live on VPS bind-mount; `portal-fe` restarted; L0 :8088 + proxies **200**; MD5 match; no seed; non-xevn healthy.  
**Residual:** Browser QA click path only (U65).

## next_owner

`pm` → `qa`

## next_dispatch_prompt

```text
work_item_id: BM-QA-CFG-APPLY-MEMBERS-FE-01
from_role: pm
to_role: qa
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: docs/qa/evidence/d-do-sync-8088-bm-fe-apply-01-20260722.md PASS · FE synced on http://14.225.217.232:8088 · U65 zero-seed
job:
  - ceo@xe.vn → Command Center → Cài đặt → «Áp dụng danh mục HRM»
  - Catalog job_titles (+ spot recruitment_channels) → ≥1 ĐVTV → Áp dụng
  - Network POST …/apply-to-members → XBOS-CFG-204; FE appliedCount; F5 source still listed
  - 409 note visible; do NOT FAIL solely on Group CEO member GET 409
  - must_keep: BM-AC-05 JD-only · hire picker title · no seed
exit_criteria: PASS_TO_PM · evidence docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-YYYYMMDD.md
spec_ref: XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI configSyncApplyCatalogToMembers
```

## ack_status

**PASS_TO_PM**
