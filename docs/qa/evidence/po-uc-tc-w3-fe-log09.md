# Evidence — PO-UC-TC-W3-FE-LOG09

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-FE-LOG09` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true |
| **uat_done** | **false** — design≠UAT; no browser claim this wave |
| **change_mode** | ADD |
| **Leave L2** | **not touched** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **qa residual** | `docs/qa/evidence/po-uc-tc-w3-qa-log09.md` — API PASS · FE wizard GAP |
| **be** | `docs/qa/evidence/po-uc-tc-w3-be-log09.md` — `POST …/catalogs/clone-bundle` · CFG-205/009 |
| **by-uc** | `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` · FN-COPY-BUNDLE · HP/FD/AU |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 |
| **uc_ids** | `XBOS-DM-LOG-09` |

### spec says / code does

| Spec | Code |
|------|------|
| Sao chép bộ DM Logistic CT→CT | `CloneCatalogBundlePanel` → `POST /config-sync/catalogs/clone-bundle` with `domains=['logistics']` |
| Success CFG-205 · conflict CFG-009 | Success toast/result shows `XBOS-CFG-205`; errors surface code via `formatHttpError` (CFG-009) |
| Group only | `isGroupCeoOnMasterTenant` gate + AU aside (AUTH-003) |
| F5 dest keys | Spot GET sample copied keys on dest partition |
| ≠ apply-to-members · ≠ DM-09 single-key | Separate menu `log_catalog_clone_bundle`; must_keep Apply + `hrm_catalog_clone` |

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/integrations/configSyncCloneBundle.ts` | ADD client + builders + dest resolve + F5 spot GET |
| `apps/web/web-portal/src/integrations/configSyncCloneBundle.test.ts` | ADD unit |
| `apps/web/web-portal/src/pages/command-center/CloneCatalogBundlePanel.tsx` | ADD wizard + HDSD testids |
| `apps/web/web-portal/src/pages/command-center/CloneCatalogBundlePanel.test.ts` | ADD contract |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | ADD menu + mount `log_catalog_clone_bundle` (keep DM-09 / apply) |
| `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts` | ADD HDSD aliases `sao_chep_bo_danh_muc_log` / `log_clone_bundle` |

**must_keep verified:** `ApplyCatalogToMembersPanel` · `CloneCatalogPanel` (DM-09 single-key) · Leave L2 untouched.

---

## 3. UI contract (QA click path)

| Step | Detail |
|------|--------|
| Persona | `ceo@xe.vn` / `Xevn@2026` · group_ceo · tenant=xevn · company=main |
| Menu | Command Center → Cài đặt hệ thống → **Sao chép bộ danh mục LOG** |
| Deep link | `?settings=log_catalog_clone_bundle` (alias `sao_chep_bo_danh_muc_log`) |
| HDSD | `data-hdsd="sao-chep-bo-danh-muc-log"` · submit `sao-chep-bo-danh-muc` · reload `tai-lai-khoa-dich` |
| Body | source holding · dest logistics (LGTS alias) · `domains=['logistics']` · default `onConflict=fail` · optional prefix `log_dm_` |
| Success | Status **XBOS-CFG-205** + copiedCount · dest key spot list |
| Conflict | `onConflict=fail` → status contains **XBOS-CFG-009** |
| Overwrite path | Select «Ghi đè» when dest pre-populated (QA API path) |
| AU | Non–group CEO sees blocked aside; API would AUTH-003 |

**Cấm trong evidence QA:** seed · invent Leave L2 · map apply-to-members / single-key clone as LOG-09 · claim uat_done.

---

## 4. Verification

```text
pnpm --filter web-portal exec vitest run \
  src/integrations/configSyncCloneBundle.test.ts \
  src/pages/command-center/CloneCatalogBundlePanel.test.ts \
  src/pages/command-center/CloneCatalogPanel.test.ts \
  src/pages/command-center/ApplyCatalogToMembersPanel.test.ts \
  --reporter=dot
→ Test Files: 4 passed · Tests: 31 passed · EXIT 0
```

---

## 5. Residual

| Item | Owner |
|------|-------|
| Browser U65 R2 (HP overwrite / FD fail / AU member) | qa `PO-UC-TC-W3-QA-LOG09-R2` |
| Async progress UX-005 | product / FE follow-up — not invent job queue |
| Holding CFG-004 checksum on unrelated GET list | P2 data integrity (avoided via spot GET) |

---

## 6. completion_report

**Closed:** FE wizard LOG-09 wire to `POST …/catalogs/clone-bundle` with `domains=['logistics']`; Group CEO gate; CFG-205/009 surfacing; F5 dest key spot-check; HDSD testids + settings aliases; CODE-MEMORY APPEND; vitest 31/31 incl. must_keep DM-09 + apply-to-members.

**Open:** Browser U65 R2; async UX-005; uat_done remains false until QA browser.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| next_owner | **qa** |
| ack_status | **READY_FOR_QA** |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-fe-log09.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-QA-LOG09-R2
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status_target: PASS_TO_PM

## CONTEXT
dev-fe PO-UC-TC-W3-FE-LOG09 READY_FOR_QA — CC menu «Sao chép bộ danh mục LOG» → POST /api/xbos/config-sync/catalogs/clone-bundle domains=['logistics']. Distinct from DM-09 single-key clone + apply-to-members.

## READ_FIRST
1. docs/qa/evidence/po-uc-tc-w3-fe-log09.md
2. docs/qa/evidence/po-uc-tc-w3-qa-log09.md (API baseline)
3. docs/qa/professional/by-uc/XBOS-DM-LOG-09.md

## MISSION — browser U65 R2
1) L0 stack; login ceo@xe.vn → Command Center → Cài đặt → Sao chép bộ danh mục LOG (or ?settings=log_catalog_clone_bundle).
2) HP: dest Logistics · onConflict=overwrite (if dest pre-filled) → confirm Sao chép bộ → assert FE status XBOS-CFG-205 + copiedCount; Tải lại khóa đích shows log_dm_* ; F5 menu still wired.
3) FD: onConflict=fail → XBOS-CFG-009 in FE status; no half-copy claim.
4) AU: member persona — panel blocked / no mutate; do not use seed.
5) Confirm ≠ Áp dụng danh mục HRM · ≠ Sao chép bộ danh mục (DM-09 single-key).
6) Update by-uc execution note; uat_done only if browser HP+FD pass; evidence docs/qa/evidence/po-uc-tc-w3-qa-log09-r2.md
```
