# Dev-FE — D-XBOS-U72-F10-HOLDING-PATH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-XBOS-U72-F10-HOLDING-PATH-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-07-27 |
| **lane** | execution · U65 · change_mode **FIX** · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `docs/xbos/SRS_FIELD_DISPLAY.md` F-XBOS-10 / AC-F-XBOS-10 / BR-XBOS-COPY-01 · `.cursor/rules/display-label-no-raw-key.mdc` |
| **qa_intake** | `docs/qa/evidence/qa-xbos-u72-field-display-01-20260727.md` §2 AC-F-XBOS-10 FAIL |

## 1. spec_read_ack

| Plane | Path / § |
|-------|----------|
| **srs** | `docs/xbos/SRS_FIELD_DISPLAY.md` · **F-XBOS-10** · **AC-F-XBOS-10** · **BR-XBOS-COPY-01** — copy Apply catalog không nhúng EN `holding` |
| **tech_spec** | Display-only FIX; wire `companyId` giữ nguyên (OpenAPI apply-to-members unchanged) |
| **db_design** | n/a (no schema) |
| **api_design** | n/a — **forbidden** contract change; GET/POST snapshot vẫn `companyId=holding` |
| **rule** | `display-label-no-raw-key.mdc` — không render raw slug |
| **sponsor_confirm** | QA FAIL → PM dispatch FIX 2026-07-27 |
| **change_mode** | FIX |
| **uc_ids** | XBOS-DM-HRM-07 · FR-XBOS-U72-LABEL-01 (F-10) |

### Spec says / code did

| Spec | Before | After |
|------|--------|-------|
| AC-F-XBOS-10: không chuỗi user-facing `holding` | JSX `{source.tenantId}/{source.companyId}` → `xevn/holding` | `formatApplyCatalogSourceScopeDisplay` → **`tập đoàn`** khi `companyId` ∈ {`holding`,`main`} |

## 2. Changes

| File | Diff |
|------|------|
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx` | Export `formatApplyCatalogSourceScopeDisplay`; source summary + applied rows use helper; CODE-MEMORY APPEND |
| `apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.test.ts` | +4 unit tests F-10 + source-contract assert no raw JSX path |

**API / wire:** unchanged (`GROUP_HOLDING_COMPANY_ID = 'holding'` vẫn dùng trong `configSyncApplyMembers`).

**must_keep verified:** allow-list keys, apply CTA, 409 note, F-XBOS label maps elsewhere not touched.

## 3. Tests

```bash
pnpm --filter web-portal exec vitest run src/pages/command-center/ApplyCatalogToMembersPanel.test.ts
```

| Result | Detail |
|--------|--------|
| **PASS** | 10/10 · exit 0 |

Asserts: `formatApplyCatalogSourceScopeDisplay('xevn','holding') === 'tập đoàn'`; no `\bholding\b`; panel JSX không còn `{source.tenantId}/{source.companyId}`.

## 4. Expected browser (QA)

| Step | Expect |
|------|--------|
| Login `ceo@xe.vn` → CC → Cài đặt → **Áp dụng danh mục HRM** (`?settings=hrm_catalog_apply_members`) | Summary: `Nguồn tập đoàn: tập đoàn · version N · M mục` |
| F5 | Same — **no** `\bholding\b` / `xevn/holding` in panel copy |
| Network | Catalog GET may still return `companyId: "holding"` — **OK** (wire) |

## 5. Residual (not this FIX)

| ID | Severity | Note |
|----|----------|------|
| R-U72-APPLY-JOB-TITLES-PAREN | P2 | Dropdown still `Chức danh (job_titles)` — VAL soft; out of AC-F-XBOS-10 |
| R-U72-CC-TOAST-HOLDING | P2 | `CommandCenterPage` toast «hồ sơ tập đoàn (holding)» — **outside** allowed_paths this wave; spot if QA expands F-10 toast surface |

## 6. completion_report

**Closed:** AC-F-XBOS-10 display leak on Apply Catalog source summary (and applied-row formatter safety). Vitest 10 PASS. CODE-MEMORY APPEND. Zero seed. No BE contract change.

**Open:** Browser U65 retest by QA (R2). Soft residuals above.

## 7. Handoff

- **next_owner:** `qa`
- **ack_status:** **READY_FOR_QA**
- **evidence_path:** `docs/qa/evidence/dev-fe-xbos-u72-f10-holding-path-01-20260727.md`

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-U72-FIELD-DISPLAY-01-R2
role: qa
lane: execution · U65 zero-seed browser-only
entry_criteria: D-XBOS-U72-F10-HOLDING-PATH-01 READY_FOR_QA @ docs/qa/evidence/dev-fe-xbos-u72-f10-holding-path-01-20260727.md
persona: ceo@xe.vn / Xevn@2026
portal: http://127.0.0.1:5173 (or active local portal)
scope:
  - Spot retest AC-F-XBOS-10: CC → Cài đặt → Áp dụng danh mục HRM
  - Assert summary has no \bholding\b / no xevn/holding; shows «tập đoàn»
  - F5 still clean
  - Spot regression F-09 / F-11 if quick
  - Network may show companyId=holding — do NOT fail on wire JSON
cấm: seed · API mutate to fake catalog
exit_criteria: PASS_TO_PM only if AC-F-XBOS-01..11 all PASS (F-10 fixed); else FAIL_TO_PM
evidence_path: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
```
