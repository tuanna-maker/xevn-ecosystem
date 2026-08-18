# Evidence — PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true (no `pnpm seed:*`, no DB mutate outside FE) |
| **hdsd_align** | true — deep link `?settings=log_catalog_clone_bundle` · `data-hdsd=tai-lai-khoa-dich` |
| **uat_done** | **false** — dest reload EVIDENCED; design≠full UAT; **Phase1 DONE forbidden** |
| **Leave L2** | **not touched** |
| **scope** | dest reload only (not full HP/FD/AU matrix) |

---

## 1. Scope & honesty

| Layer | Verdict | Note |
|-------|---------|------|
| L0 stack | **PASS** | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Setup CFG-205 (dest already populated) | **PASS** | overwrite → **201** `XBOS-CFG-205` · 92 keys → logistics (precond for result panel / reload button — **not** full HP re-prove) |
| Tải lại khóa đích (spot GET) | **PASS** | 14× GET `…/catalog/log_dm_*?companyId=logistics` → **200** `XBOS-CFG-201` · **0** × 409 SCOPE |
| FE dest keys list | **PASS** | `Khóa trên đích sau sao chép: 12` · keys `log_dm_*` · domain logistics |
| Full HP/FD/AU | **not retested** | prior R2 evidence stands; smoke setup only |
| UAT / Phase1 DONE | **not claimed** | |

**Precond honesty:** Dest `logistics` already had `log_dm_*` from prior wave → overwrite used only to surface CFG-205 result panel + reload control (mission-allowed).

**Runtime note:** First browser attempt FAIL — live `:28002` was **stale dist** (pre `PO-UC-TC-W3-BE-LOG09-SCOPE`). After `tsc -p tsconfig.build.json` + restart `dist/main.js` with `XBOS_GROUP_MEMBER_COMPANY_SLUGS`, API probe + browser PASS. Residual for ops: rebuild/restart after BE scope FIX before QA.

---

## 2. Environment

| Item | Value |
|------|--------|
| Portal | `http://127.0.0.1:5173` |
| Persona | `ceo@xe.vn` / `Xevn@2026` · JWT `tenantId=xevn` · `companyId=main` · `roleCode=group_ceo` |
| Deep link | `/command-center?settings=log_catalog_clone_bundle` |
| Spot GET | `GET /api/xbos/config-sync/catalog/log_dm_*?target=xbos&tenantId=xevn&companyId=logistics` |
| Spec | by-uc `XBOS-DM-LOG-09` · BE `po-uc-tc-w3-be-log09-scope.md` · R2 residual `R-LOG09-R2-DEST-GET-SCOPE` |
| Runtime | `docs/qa/evidence/_tmp-po-uc-tc-w3-qa-log09-dest-reload-01-runtime.json` |
| Screens | `docs/qa/evidence/screens/po-uc-tc-w3-qa-log09-dest-reload-01/` |
| Script | `scripts/qa/_tmp-po-uc-tc-w3-qa-log09-dest-reload-01-browser.mjs` |

---

## 3. HDSD inventory (U76)

| Surface | Evidence |
|---------|----------|
| Deep link | `?settings=log_catalog_clone_bundle` |
| Panel | `data-testid=clone-catalog-bundle-panel` · `data-hdsd=sao-chep-bo-danh-muc-log` |
| Reload | `data-testid=clone-bundle-reload-dest` · `data-hdsd=tai-lai-khoa-dich` · «Tải lại khóa đích (F5)» |
| Dest keys | `data-testid=clone-bundle-dest-keys` |

---

## 4. Test log (browser U65 — dest reload)

### L0 + login + panel

| Step | Result |
|------|--------|
| L0 | HRM/XBOS/portal **200** |
| Login CEO | **PASS** · `/command-center` · token present |
| Deep link LOG-09 | **PASS** · panel visible · hdsd=`sao-chep-bo-danh-muc-log` |

### Setup (CFG-205 state — not full matrix)

| Step | Result |
|------|--------|
| Dest | Logistics · wire `xevn/logistics` |
| Policy | `onConflict=overwrite` |
| Network | POST clone-bundle → **201** · **`XBOS-CFG-205`** · `copiedCount=92` · `destCompanyId=logistics` |
| FE | Result panel visible · sample `log_dm_1, log_dm_10, log_dm_11` |
| Screen | `03-setup-cfg-205.png` |

### Tải lại khóa đích (mission)

| Step | Result |
|------|--------|
| Action | Click «Tải lại khóa đích (F5)» |
| Network after click | **14** GET `companyId=logistics` · all **200** · code **`XBOS-CFG-201`** |
| SCOPE 409 | **0** (closed `R-LOG09-R2-DEST-GET-SCOPE`) |
| FE dest keys | Count **12** · `log_dm_*` · `v2` · domain logistics · no error banner |
| Screen | `04-dest-reload.png` |
| Verdict | **PASS** |

### API probe (same persona, supporting)

| Call | Result |
|------|--------|
| GET `…/catalog/log_dm_1?tenantId=xevn&companyId=logistics` Bearer CEO | **200** `XBOS-CFG-201` · `data.companyId=logistics` |

---

## 5. Verdict matrix

| TC / check | Layer | Verdict |
|------------|-------|---------|
| Dest reload / spot GET logistics | Browser | **PASS** |
| Residual `R-LOG09-R2-DEST-GET-SCOPE` | — | **CLOSED** (browser + API) |
| Full HP/FD/AU | — | not in scope this WI (R2 prior) |
| Leave L2 | — | untouched |
| uat_done / Phase1 | — | **false** / not claimed |

**Overall:** **PASS_TO_PM** — dest reload EVIDENCED under Group CEO JWT `main`; **uat_done=false**.

---

## 6. Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| UX-005 async progress | P2 | product | Sync overwrite ~60–90s; no progress UX — not invent |
| Ops stale-dist | P2 | devops / PM | QA needed rebuild+restart `:28002` before FIX was live — document in READY_FOR_QA entry criteria |
| Holding CFG-004 checksum | P2 | data | Pre-existing; unrelated |

---

## 7. by-uc update

- `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` — dest reload row **PASS**; residual scope closed; `uat_done: false`

---

## 8. completion_report

**Closed:** Browser U65 dest reload after BE scope FIX; CEO deep-link LOG-09; setup CFG-205 for result panel; «Tải lại khóa đích» → 14× GET logistics **200 XBOS-CFG-201**, **0** SCOPE 409; FE dest keys non-empty `log_dm_*`; residual `R-LOG09-R2-DEST-GET-SCOPE` closed; zero seed; Leave L2 untouched; full HP/FD/AU not re-proved.

**Open:** UX-005 P2; ops stale-dist lesson; `uat_done` remains false (full UAT not claimed).

---

## 9. Handoff

| Field | Value |
|-------|--------|
| next_owner | **pm** |
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-PM-LOG09-DEST-RELOAD-INTAKE
from_role: qa
to_role: pm
lane: governance
priority: P1
ack_status_target: DISPATCHED (next wave)

## CONTEXT
QA PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01 PASS_TO_PM — browser dest reload PASS.
Group CEO JWT main GET /api/xbos/config-sync/catalog/log_dm_*?companyId=logistics → 200 XBOS-CFG-201;
FE «Tải lại khóa đích» shows non-empty log_dm_* keys; R-LOG09-R2-DEST-GET-SCOPE CLOSED.
uat_done=false · Leave L2 untouched · full HP/FD/AU not retested this WI.

## READ_FIRST
1. docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md
2. docs/qa/professional/by-uc/XBOS-DM-LOG-09.md

## MISSION
1) Intake PASS_TO_PM; stamp by-uc / matrix residual closed.
2) Dispatch next open P0 from PO-UC-TC / PM_OPEN_BACKLOG (not re-open LOG09 dest reload).
3) Optional: devops note — READY_FOR_QA entry_criteria must include rebuild+restart xbos-api when dist is stale.

## CẤM
seed · invent Leave L2 · claim Phase1 DONE / uat_done true from this WI alone
```
