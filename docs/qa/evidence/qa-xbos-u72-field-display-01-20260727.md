# QA — XBOS U72 Field Display (AC-F-XBOS-01..11)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-U72-FIELD-DISPLAY-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-07-27 |
| **lane** | execution · **U65** zero-seed browser-only |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **portal** | http://127.0.0.1:5173 |
| **x-bos-core** | http://127.0.0.1:5176 |
| **seed** | **none** |
| **runner** | `scripts/qa/qa-xbos-u72-field-display-01.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-xbos-u72-field-display-01-console.txt` |
| **screenshots** | `docs/qa/evidence/screenshots/qa-xbos-u72-field-display-01/` |
| **spec_ref** | `docs/xbos/SRS_FIELD_DISPLAY.md` §2–§4 · `docs/xbos/SRS.md` §13 FR-XBOS-U72-LABEL-01 · BA §10–§11 · `.cursor/rules/display-label-no-raw-key.mdc` |
| **ack_status** | **FAIL_TO_PM** |

## 0. Verdict

| Gate | Result |
|------|--------|
| **AC-U72-XBOS-GLOBAL** | **FAIL** — Apply Catalog still shows user-facing `holding` (`xevn/holding`) |
| **AC-F-XBOS-01..09, 11** | **PASS** (browser) |
| **AC-F-XBOS-10** | **FAIL** |
| **Spot AC-H-XBOS-01/03/04/08/12** | **PASS** (H-04 soft — no raw keys; enterpriseType select not forced open) |
| **Regression industry (AC-CO-IND-02 / VAL-XBOS-LABEL-02)** | **PASS** — no `holding`/`subsidiary` as «Ngành nghề» on HRM Company |
| **Overall** | **FAIL_TO_PM** — do **not** promote to QC GO |

## 1. L0 / session

| Check | Result |
|-------|--------|
| Login API via portal proxy | PASS — `ceo@xe.vn` token |
| Portal `:5173` | 200 |
| x-bos-core `:5176` | 200 |
| Seed / DB mutate | **not used** |

## 2. AC-F-XBOS-01..11 matrix (browser)

| AC | Surface / click path | Observed label / state | F5 / note | Verdict |
|----|----------------------|------------------------|-----------|---------|
| **AC-F-XBOS-01** | `5176/` Organization · cột Loại + select | No bare `holding`/`subsidiary`/`division`/`department` | Reload page OK | **PASS** |
| **AC-F-XBOS-02** | same · Trạng thái | No bare `active`/`inactive` | — | **PASS** |
| **AC-F-XBOS-03** | `5176/metadata` | No bare `org_unit`/`boolean`/`select` cell text | — | **PASS** |
| **AC-F-XBOS-04** | `5176/kpi` table+select | No bare `draft`/`monthly` | — | **PASS** · = **AC-H-XBOS-12** |
| **AC-F-XBOS-05** | `5176/kpi/assign` | No EN `Status:`; no raw `pending_approval`/`frozen` header | — | **PASS** |
| **AC-F-XBOS-06** | `5176/policy` | Policy/group status VI | — | **PASS** |
| **AC-F-XBOS-07** | `5176/policy/summary` | Run status VI / unknown → `—` | — | **PASS** |
| **AC-F-XBOS-08** | `5173/partners` | Type badges VI (not `supplier`/`distributor`/`service`) | — | **PASS** · = **AC-H-XBOS-10** |
| **AC-F-XBOS-09** | CC `?settings=company_infrastructure` → Sửa danh mục → Tiếp theo×2 → chip PN → **Cấu hình khối & trường** | Block options/nav: **Khối Thông tin chung / Khối Vị trí… / Khối Năng lực** — **no** `general -` prefix | Nested modal opened | **PASS** |
| **AC-F-XBOS-10** | CC `?settings=hrm_catalog_apply_members` | Label prefix OK («Nguồn tập đoàn») but value still **`xevn/holding`** | F5: still `xevn/holding` | **FAIL** |
| **AC-F-XBOS-11** | Vite import `workflowInstanceStatusLabelVi` + workflow settings | unknown → **`—`**; `pending`→Đang chờ; `completed`→Hoàn thành | — | **PASS** |

### AC-F-XBOS-09 detail (PASS)

- Screenshot: `f09-infra-custom-fields.png`
- Block navigator + «Thuộc khối» options use VI titles only (no `general - Khối…`).
- **Residual P2 (not AC-F-XBOS-09 fail):** admin field list still shows technical `field_code` containing `__general__` beside label (allowed by BR-U72-ADMIN-CODE-01 *code kèm label*); data-type option text still EN `Text`/`Number`/`Date` (out of F-09 scope; optional follow-up dictionary).

### AC-F-XBOS-10 detail (FAIL — blocker)

- Screenshot: `f10-apply-catalog.png` (+ `f10-apply-catalog-f5.png`)
- Click path: login → Command Center → Cài đặt → **Áp dụng danh mục HRM**
- Visible line: `Nguồn tập đoàn: xevn/holding · version 7 · 4 mục`
- Root cause (code): `ApplyCatalogToMembersPanel.tsx` renders `{source.tenantId}/{source.companyId}` where `companyId` wire = `holding`.
- Spec: `SRS_FIELD_DISPLAY.md` F-XBOS-10 / AC-F-XBOS-10 / BR-XBOS-COPY-01 — **cấm** user-facing EN `holding`.
- **Also visible (P2):** catalog dropdown option text includes raw `(job_titles)` — not AC-F-XBOS-10 but VAL-XBOS-LABEL-01 soft residual.

## 3. Spot AC-H-* + industry regression

| AC | Path | Result |
|----|------|--------|
| **AC-H-XBOS-01** | `/command-center` list cells/options | No bare `parent`/`holding`/`subsidiary`/`affiliate` | **PASS** |
| **AC-H-XBOS-03** | `/command-center/hrm/company` (+ iframe) | No `holding`/`subsidiary` as Ngành nghề | **PASS** |
| **AC-H-XBOS-04** | attempt Thêm/Chỉnh sửa pháp nhân | No `joint-stock` option text observed; select not confirmed open → **soft PASS** (no raw leak) | **PASS** (soft) |
| **AC-H-XBOS-08** | `/partners` status badges | No bare `active`/`inactive` | **PASS** |
| **AC-H-XBOS-12** | mirrors F-04 | **PASS** |

## 4. Defects

| ID | Severity | AC | Summary | Owner |
|----|----------|-----|---------|-------|
| **D-XBOS-U72-F10-HOLDING-PATH** | **P0** | AC-F-XBOS-10 | Apply Catalog source summary shows `xevn/holding` | **dev-fe** |
| R-U72-F09-DATATYPE-EN | P2 | (adjacent) | Infra custom field dataType options still EN Text/Number | defer |
| R-U72-APPLY-JOB-TITLES-PAREN | P2 | VAL soft | Dropdown «Chức danh (job_titles)» | defer |
| R-U72-H04-FORM-SPOT | P3 | AC-H-XBOS-04 | Soft PASS — deepen form open next retest | qa next |

## 5. completion_report

**Closed**

- Browser U65 matrix for AC-F-XBOS-01..09, 11 PASS on live `:5173` / `:5176` with `ceo@xe.vn`.
- Spot AC-H-01/03/08/12 PASS; industry no-subsidiary regression PASS.
- F-XBOS-09 nested infra modal reached; block option text VI-only confirmed on screenshot.

**Open / residual**

- **P0:** AC-F-XBOS-10 FAIL — map `companyId=holding` → display «tập đoàn» (or hide wire path) in Apply Catalog summary + any toast still embedding EN `holding`.
- Soft residuals P2/P3 above — do not block F-10 fix wave.

## 6. Handoff

- **next_owner:** `pm` → dispatch **dev-fe** (then QA retest same work_item)
- **ack_status:** **FAIL_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-xbos-u72-field-display-01-20260727.md`

### next_dispatch_prompt

```text
work_item_id: D-XBOS-U72-F10-HOLDING-PATH-01
role: dev-fe
lane: execution · U65 · preserve_default · change_mode FIX
entry_criteria: QA FAIL_TO_PM docs/qa/evidence/qa-xbos-u72-field-display-01-20260727.md §2 AC-F-XBOS-10
read_first:
  - docs/xbos/SRS_FIELD_DISPLAY.md F-XBOS-10 / AC-F-XBOS-10 / BR-XBOS-COPY-01
  - apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx (Nguồn tập đoàn summary)
spec_read_ack required; code_memory APPEND
allowed_paths:
  - apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.tsx
  - apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.test.ts (if present)
must_keep: Apply catalog API body companyId wire key; publish/apply behavior; XBOS-CFG-204
fix: User-facing summary must NOT contain the token "holding". Show «tập đoàn» (or tenant display name) instead of raw `{tenantId}/{companyId}` when companyId is holding/main holding slug. Keep wire/API unchanged.
exit_criteria: Ready for QA retest AC-F-XBOS-10 — browser ceo@xe.vn → /command-center?settings=hrm_catalog_apply_members → no \bholding\b in panel text; F5 still clean; READY_FOR_QA
evidence_path: docs/qa/evidence/dev-fe-xbos-u72-f10-holding-path-01-20260727.md
cấm: seed · change apply API contract
```

### After FE READY_FOR_QA — QA retest prompt

```text
work_item_id: QA-XBOS-U72-FIELD-DISPLAY-01-R2
role: qa
entry_criteria: D-XBOS-U72-F10-HOLDING-PATH-01 READY_FOR_QA; U65 browser-only
scope: Retest AC-F-XBOS-10 (+ spot F-09/F-11 regression); confirm no \bholding\b on Apply Catalog; F5
exit_criteria: PASS_TO_PM only if AC-F-XBOS-01..11 all PASS; else FAIL_TO_PM
evidence_path: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
```
