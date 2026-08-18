# Evidence — W1-B-03-TC-CAT-QA

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-03-TC-CAT-QA` |
| **slice** | `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md` |
| **entry** | `docs/qa/evidence/w1b-03-tc-cat.md` READY_FOR_QA |
| **executor** | Cursor `qa` |
| **date** | 2026-08-03 |
| **persona** | `ceo@xe.vn` / `company_id=main` |
| **env** | Portal `:5173` · HRM `:28001` · XBOS `:28002` |
| **u65** | zero-seed · browser FE clicks · no `pnpm seed:*` |
| **hdsd_align** | true |
| **journeys** | J-XBOS-CTRL-01 · J-XBOS-02 · UF-HRM-10 |
| **harness** | `scripts/qa/w1b-03-tc-cat-qa-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-w1b-03-tc-cat-qa-runtime.json` |
| **test_log** | `docs/qa/evidence/w1b-03-tc-cat-qa-test-log.md` + `.json` |
| **ack_status** | **`FAIL_TO_PM`** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-B04 · Diễn biến #3–6
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-CAT
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §3.7–3.8
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §2.1–2.4
- slice: docs/program/slices/DOC-ENT-P0-XBOS-CAT.md
- be_entry: docs/qa/evidence/w1b-03-tc-cat.md
```

## L0

| Check | Result |
|-------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| web-portal `:5173` | **200** |
| idle_guard clicks | **18** PASS |

## Click path (HDSD)

1. Login `ceo@xe.vn` → `/command-center`
2. Cài đặt shell → **Áp dụng danh mục HRM** (`settings=hrm_catalog_apply_members`)
3. Select `job_titles` → **Tải lại nguồn tập đoàn** → select ĐVTV → **Áp dụng** (confirm)
4. `/hr/settings-catalogs` → **Đồng bộ từ XBOS**
5. Assert picker labels (`Tổng Giám đốc` / `Đang dùng`) → **F5**

Screens: `docs/qa/evidence/screens/w1b-03-tc-cat-qa/`

## AC matrix

| AC | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 Publish** | `XBOS-CFG-203` or documented success · `items[].status_label` if present | Apply POST **201** `XBOS-CFG-204` appliedCount=1 · GET source **200** `XBOS-CFG-201` v7 items=4 · **`status_label` absent** on live XBOS items | **FAIL** (label) / publish-family **PASS** |
| **2 Pull** | `HRM-SYNC-200` · top-level `items[]` · `published_version` matches version | FE click **Đồng bộ từ XBOS** (request observed) · session/Network POST `/catalog-sync/pull/job_titles` → **201** `HRM-SYNC-200` · items top-level · `published_version=7`=`version` · sample `status_label=Đang dùng` | **PASS** |
| **3 GET** | `HRM-SYNC-201` · FE bind without deep dig | GET `/catalog-sync/job_titles` → **200** `HRM-SYNC-201` · top-level `items[]` + `name`/`domain`/`item_count` | **PASS** |
| **4 Picker** | Synced labels · miss honest | FE shows `Tổng Giám đốc` / `Đang dùng` · miss key → **404** `HRM-SYNC-002` | **PASS** (R-CAT-PICKER-LABEL still open for settings-catalogs picker wire) |
| **5 F5** | Persist | Reload `/hr/settings-catalogs` — catalogs + labels remain | **PASS** |

## Case matrix (U76)

| Case | Status | Notes |
|------|--------|-------|
| A fail-deep | **pass** | Wrong pwd → **401** `XBOS-AUTH-401` · stay `/login` |
| B success HDSD | **fail** | Publish/apply + pull/picker OK; XBOS GET missing `status_label` blocks AC1 |
| C logic/BR F5 | **pass** | F5 catalogs persist |

## Residuals

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| **R-CAT-XBOS-STATUS-LABEL** | **P0** | Live `GET /api/xbos/config-sync/catalog/job_titles` returns items with `code/label/status` only — **no** `status_label`/`status_tone`. Source `config-sync.service.ts` has `withCatalogItemDisplay` — **runtime XBOS process likely stale** vs W1-B-03-TC-CAT source. Restart/redeploy xbos-api then retest. | **dev-be** / devops |
| R-CAT-PICKER-LABEL | P2 | settings-catalogs picker status may still map via FE `resolveSettingsCatalogItemStatusDisplay` — out of slice B; catalog-sync items already display-ready | defer |
| R-CAT-ALLOWLIST | P1 defer | unchanged SA prior | sa |
| OBS-SYNC-RESP-CAPTURE | P3 | Playwright sometimes records sync-from-xbos request without response envelope; isolation probe confirmed POST fires; pull `HRM-SYNC-200` captured | qa note |

## Closed / not reopened

- AUTH / EMP CLOSED waves — **not touched**
- R-CAT-PULL-ENVELOPE — **confirmed** live `HRM-SYNC-200` / `HRM-SYNC-201` (not SET)
- R-CAT-BROWSER — **executed** (this wave)

## cấm checklist

- [x] No seed
- [x] No invent UF from jest alone
- [x] No claim Phase1/UAT DONE
- [x] No reopen AUTH/EMP

## completion_report

**Closed:** U65 browser wave for FR-UC-B04 — L0 PASS · apply CFG-204 · FE sync click · HRM pull display-ready `HRM-SYNC-200/201` · picker labels · F5 · miss 404 honest · world-standard test-log md+json.

**Open:** **FAIL** on AC1 XBOS item `status_label` live response (`R-CAT-XBOS-STATUS-LABEL`).

**ack_status:** `FAIL_TO_PM`

## next_owner

`dev-be` (restart/verify xbos-api serves `withCatalogItemDisplay` on GET/publish) → `qa` retest AC1 only

## next_dispatch_prompt

```text
work_item_id: W1-B-03-TC-CAT-XBOS-LABEL-01
role: dev-be
priority: P0
entry: QA FAIL R-CAT-XBOS-STATUS-LABEL — docs/qa/evidence/w1b-03-tc-cat-qa.md
symptom: GET /api/xbos/config-sync/catalog/job_titles (ceo JWT, holding) returns items without status_label/status_tone though apps/api/xbos-api/src/config-sync/config-sync.service.ts withCatalogItemDisplay exists.
action: ensure running xbos-api loads W1-B-03-TC-CAT build; GET+publish response items include status_label=Đang dùng for active; jest already green — fix runtime drift.
exit: evidence snip live GET itemSample with status_label · READY_FOR_QA
cấm: seed · touch AUTH/EMP
```
