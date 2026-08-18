# Evidence — PO-UC-TC-W3-QA-LOG09-R2

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-QA-LOG09-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true (no `pnpm seed:*`, no DB mutate outside FE) |
| **hdsd_align** | true — menu «Sao chép bộ danh mục LOG» · `data-hdsd=sao-chep-bo-danh-muc-log` · deep link `?settings=log_catalog_clone_bundle` |
| **uat_done** | **false** — browser HP mutate + FD + AU EVIDENCED; dest reload F5 spot **FAIL** (scope); design≠full UAT; **Phase1 DONE forbidden** |
| **Leave L2** | **not touched** |

---

## 1. Scope & honesty

| Layer | Verdict | Note |
|-------|---------|------|
| L0 stack | **PASS** | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Browser HP (CFG-205 overwrite → logistics) | **PASS** | FE status + Network POST 201 · `XBOS-CFG-205` · copiedCount=92 · dest=logistics |
| Browser FD (CFG-009 fail) | **PASS** | FE status contains **XBOS-CFG-009** · Network POST **409** |
| Browser AU (member) | **PASS** | `du-lich.ceo` → AU aside + submit disabled |
| Tải lại khóa đích (spot GET) | **FAIL** | GET `…/catalog/log_dm_*?companyId=logistics` → **409 SCOPE_CONTEXT_MISMATCH** |
| F5 menu wire | **PASS** | After reload, panel still mounts on deep link |
| ≠ apply / ≠ DM-09 | **PASS** | Distinct menu + panel copy; not apply / not single-key panel |
| UAT / Phase1 DONE | **not claimed** | |

**Precond honesty:** Dest `logistics` already had `log_dm_*` → empty-dest + `fail` not available without seed → FD proven via `onConflict=fail` → CFG-009; HP via `overwrite` → CFG-205 (contract-allowed; U65).

---

## 2. Environment

| Item | Value |
|------|--------|
| Portal | `http://127.0.0.1:5173` |
| Persona HP/FD | `ceo@xe.vn` / `Xevn@2026` · Group CEO · tenant=xevn · company=main |
| Persona AU | `du-lich.ceo@xe.vn` / `Xevn@2026` |
| Deep link | `/command-center?settings=log_catalog_clone_bundle` |
| Endpoint | `POST /api/xbos/config-sync/catalogs/clone-bundle` · `domains=['logistics']` |
| Spec | by-uc `XBOS-DM-LOG-09` · FE `po-uc-tc-w3-fe-log09.md` · API baseline `po-uc-tc-w3-qa-log09.md` |
| Runtime | `docs/qa/evidence/_tmp-po-uc-tc-w3-qa-log09-r2-runtime.json` |
| Screens | `docs/qa/evidence/screens/po-uc-tc-w3-qa-log09-r2/` |
| Script | `scripts/qa/_tmp-po-uc-tc-w3-qa-log09-r2-browser.mjs` |

---

## 3. HDSD inventory (U76)

| Surface | Evidence |
|---------|----------|
| Menu | CC → Cài đặt hệ thống → **Sao chép bộ danh mục LOG** (sidebar active) |
| Deep link | `?settings=log_catalog_clone_bundle` |
| Panel | `data-testid=clone-catalog-bundle-panel` · `data-hdsd=sao-chep-bo-danh-muc-log` |
| Submit | `data-hdsd=sao-chep-bo-danh-muc` · confirm «Sao chép bộ» |
| Reload | `data-hdsd=tai-lai-khoa-dich` · «Tải lại khóa đích (F5)» |
| Dest | `clone-bundle-dest-logistics` · wire **xevn/logistics** |
| Distinct | Sidebar also shows «Sao chép bộ danh mục» (DM-09) + «Áp dụng danh mục HRM» — **not** claimed as LOG-09 |

---

## 4. Test log (browser U65)

### L0 + login

| Step | Result |
|------|--------|
| `qc:dev-stack` equivalent probe | HRM/XBOS/portal **200** |
| Login CEO → CC | **PASS** · token present · `/command-center` |

### TC-DM-LOG-09-COPY-BUNDLE-FD-002 (browser)

| Step | Result |
|------|--------|
| Dest | **LGTS — Logistics** · wire `xevn/logistics` |
| Policy | `onConflict=fail` |
| Action | Sao chép bộ danh mục → confirm «Sao chép bộ» |
| Network | POST clone-bundle → **409** · **`XBOS-CFG-009`** |
| FE status | `… XBOS-CFG-009 (HTTP 409)` · conflicting catalog keys |
| Half-copy | **None** (blocked before publish) |
| Screen | `03-fd-cfg-009.png` |
| Verdict | **PASS** |

### TC-DM-LOG-09-COPY-BUNDLE-HP-001 (browser)

| Step | Result |
|------|--------|
| Dest | Logistics · wire `xevn/logistics` |
| Policy | `onConflict=overwrite` |
| Network | POST clone-bundle → **201** · **`XBOS-CFG-205`** · `copiedCount=92` · `matchedCount=92` · `destCompanyId=logistics` · `onConflict=overwrite` |
| FE status | `XBOS-CFG-205: đã sao chép 92/92 danh mục → logistics · mẫu: log_dm_1, log_dm_10, log_dm_11` |
| Result panel | `copiedCount=92` · keys `log_dm_1…` domain logistics |
| Screen | `04-hp-cfg-205.png` |
| Mutate path | **PASS** |

### Tải lại khóa đích + F5

| Step | Result |
|------|--------|
| Auto + button «Tải lại khóa đích (F5)» | Spot GET `…/catalog/log_dm_*?tenantId=xevn&companyId=logistics` → **409** `SCOPE_CONTEXT_MISMATCH` (`companyId mismatches token scope`) |
| FE | Red: «Không xác nhận được khóa đích trên partition (GET catalog theo key trống).» |
| Dest keys list | **empty** (test id not populated) |
| Screen | `05-dest-keys.png` |
| Page F5 / re-open deep link | Panel still wired **PASS** (`06-f5-panel.png`) |
| Verdict spot-reload | **FAIL** → residual `R-LOG09-R2-DEST-GET-SCOPE` |

> Note: clone response already lists `log_dm_*` in result panel — mutate success is evidenced; spot GET for dest partition is the residual.

### TC-DM-LOG-09-COPY-BUNDLE-AU-004 (browser)

| Step | Result |
|------|--------|
| Login | `du-lich.ceo@xe.vn` → CC |
| Deep link LOG-09 | Panel mounts |
| AU aside | `data-testid=clone-bundle-au-block` visible · AUTH-003 wording |
| Submit | **disabled** · no mutate |
| Screen | `07-au-member.png` |
| Verdict | **PASS** |

### Distinct menus

| Check | Result |
|-------|--------|
| LOG-09 panel ≠ apply panel | **PASS** |
| LOG-09 panel ≠ DM-09 single-key panel | **PASS** |
| Copy text cites DM-HRM-07 / DM-09 exclusion | **PASS** |

---

## 5. Verdict matrix

| TC-ID | Layer | Verdict |
|-------|-------|---------|
| HP-001 mutate CFG-205 | Browser | **PASS** |
| HP dest reload / spot GET | Browser | **FAIL** (409 scope) |
| F5 menu wire | Browser | **PASS** |
| FD-002 CFG-009 | Browser | **PASS** |
| AU-004 member block | Browser | **PASS** |
| UX-005 async progress | UI | **N/A** (sync 92 keys OK; not invent job queue) |
| Leave L2 | — | untouched |

**Overall:** **PASS_TO_PM** — browser HP+FD+AU EVIDENCED; residual dest-GET scope; **uat_done=false**; **not** Phase1 DONE.

---

## 6. Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| `R-LOG09-R2-DEST-GET-SCOPE` | P1 | **dev-be** (primary) / **dev-fe** | Group CEO JWT `company=main` cannot GET `companyId=logistics` catalog spot after CFG-205; clone-bundle itself OK. Align scope resolver with catalog-admin / holding→member read OR FE use internal/admin GET path used in API QA. |
| UX-005 async | P2 | product | Sync overwrite ~60s; no progress UX — not invent. |
| Holding CFG-004 checksum | P2 | data | Pre-existing; unrelated to this FE wire. |

---

## 7. by-uc update

- `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` — execution note R2 browser HP/FD/AU PASS · dest reload FAIL · `uat_done: false`

---

## 8. completion_report

**Closed:** L0; browser U65 CEO deep-link LOG-09; FD fail→**XBOS-CFG-009** in FE; HP overwrite→**XBOS-CFG-205** 92 keys dest logistics + result `log_dm_*`; F5 menu still wired; AU member blocked; distinct from apply + DM-09; zero seed; Leave L2 untouched; honesty flags.

**Open:** `R-LOG09-R2-DEST-GET-SCOPE` (Tải lại khóa đích 409); UX-005; `uat_done` remains false until dest reload PASS.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| next_owner | **pm** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-qa-log09-r2.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-BE-LOG09-DEST-GET-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
u65_zero_seed: true
ack_status_target: READY_FOR_QA

## CONTEXT
QA PO-UC-TC-W3-QA-LOG09-R2 PASS_TO_PM — browser HP CFG-205 + FD CFG-009 + AU PASS.
Residual R-LOG09-R2-DEST-GET-SCOPE: after CFG-205, FE «Tải lại khóa đích» GET
/api/xbos/config-sync/catalog/log_dm_*?tenantId=xevn&companyId=logistics → 409 SCOPE_CONTEXT_MISMATCH
(companyId mismatches token scope) for Group CEO JWT company=main.

## READ_FIRST
1. docs/qa/evidence/po-uc-tc-w3-qa-log09-r2.md § Tải lại khóa đích
2. apps/web/web-portal/src/integrations/configSyncCloneBundle.ts fetchCloneBundleDestKeySnapshots
3. ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · prior API QA GET logistics worked via internal path

## MISSION
1) Allow Group CEO / catalog-admin spot-GET dest partition logistics after clone-bundle (same authority as clone).
2) Keep must_keep: clone-bundle CFG-205/009 · ≠ apply · ≠ DM-09 single-key · Leave L2.
3) Unit/spec for scope parity list/get with companyId=logistics under main token (or documented admin header).
4) READY_FOR_QA → qa retest dest reload only (U65 browser).

## CẤM
seed · invent Leave L2 · weaken AUTH-003 for member
```
