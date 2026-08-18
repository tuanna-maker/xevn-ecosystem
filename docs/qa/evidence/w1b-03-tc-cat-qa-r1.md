# Evidence — W1-B-03-TC-CAT-QA-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-03-TC-CAT-QA-R1` |
| **slice** | `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md` |
| **entry** | `docs/qa/evidence/w1b-03-be-cat-status-label.md` READY_FOR_QA |
| **prior** | `docs/qa/evidence/w1b-03-tc-cat-qa.md` FAIL AC1 (`R-CAT-XBOS-STATUS-LABEL`) |
| **executor** | Cursor `qa` |
| **date** | 2026-08-03 |
| **persona** | `ceo@xe.vn` / `company_id=main` |
| **env** | Portal `:5173` · HRM `:28001` · XBOS `:28002` |
| **u65** | zero-seed · browser FE clicks · no `pnpm seed:*` |
| **hdsd_align** | true |
| **journeys** | J-XBOS-CTRL-01 · J-XBOS-02 · UF-HRM-10 |
| **harness** | `scripts/qa/w1b-03-tc-cat-qa-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-w1b-03-tc-cat-qa-r1-runtime.json` |
| **test_log** | `docs/qa/evidence/w1b-03-tc-cat-qa-r1-test-log.md` + `.json` |
| **screens** | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/` |
| **ack_status** | **`PASS_TO_PM`** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-B04 · Diễn biến #3–6
- tech_spec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-CAT
- db_design: docs/brand-new-documents-20270801/DB_DESIGN_NEW.md §3.7–3.8
- api_design: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §2.1–2.4
- slice: docs/program/slices/DOC-ENT-P0-XBOS-CAT.md
- be_entry: docs/qa/evidence/w1b-03-be-cat-status-label.md
```

## L0

| Check | Result |
|-------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| web-portal `:5173` | **200** |
| idle_guard clicks | **19** PASS |

## Click path (HDSD)

1. Login `ceo@xe.vn` → `/command-center` (token persist gate)
2. Cài đặt → **Áp dụng danh mục HRM** (`settings=hrm_catalog_apply_members`)
3. Select `job_titles` → **Tải lại nguồn tập đoàn** → select ĐVTV → **Áp dụng** (confirm)
4. `/hr/settings-catalogs` → **Đồng bộ từ XBOS**
5. Assert picker labels (`Tổng Giám đốc` / `Đang dùng`) → miss honest → **F5**

## AC matrix

| AC | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 Publish/GET** | XBOS items have `status_label` · publish-family success | GET **200** `XBOS-CFG-201` v7 items=4 · sample `status_label=Đang dùng` `status_tone=success` · Apply POST **201** `XBOS-CFG-204` appliedCount=1 | **PASS** |
| **2 Pull** | `HRM-SYNC-200` · top-level `items[]` · pubVer=version | FE click Đồng bộ · session POST pull → **201** `HRM-SYNC-200` · items top-level · `published_version=7`=`version` · `status_label=Đang dùng` | **PASS** |
| **3 GET** | `HRM-SYNC-201` · FE bind without deep dig | GET `/catalog-sync/job_titles` → **200** `HRM-SYNC-201` · top-level items + labels | **PASS** |
| **4 Picker** | Synced labels · miss honest | FE shows `Tổng Giám đốc` · miss → **404** `HRM-SYNC-002` | **PASS** |
| **5 F5** | Persist | Reload `/hr/settings-catalogs` — catalogs remain | **PASS** |

## Case matrix (U76)

| Case | Status | Notes |
|------|--------|-------|
| A fail-deep | **pass** | Wrong pwd → **401** `XBOS-AUTH-401` · stay `/login` |
| B success HDSD | **pass** | AC1–4 closed including XBOS `status_label` |
| C logic/BR F5 | **pass** | F5 catalogs persist |

## Closed residuals

| ID | Prior | R1 |
|----|-------|-----|
| **R-CAT-XBOS-STATUS-LABEL** | P0 FAIL — live GET bare items | **CLOSED** — GET items include `status_label=Đang dùng` / `status_tone=success` |

## Deferred (out of slice / unchanged)

| ID | Sev | Note |
|----|-----|------|
| R-CAT-PICKER-LABEL | P2 | settings-catalogs may still FE-map status locally — catalog-sync items already display-ready |
| R-CAT-ALLOWLIST | P1 defer | SA prior — unchanged |
| OBS-SYNC-RESP-CAPTURE | P3 | Playwright sometimes records sync-from-xbos request without response envelope; session pull proved `HRM-SYNC-200` |

## Closed / not reopened

- AUTH / EMP CLOSED waves — **not touched**
- R-CAT-PULL-ENVELOPE — reconfirmed `HRM-SYNC-200` / `HRM-SYNC-201`
- No seed · no invent UF from jest alone

## cấm checklist

- [x] No seed
- [x] No invent UF from jest alone
- [x] No claim Phase1/UAT DONE
- [x] No reopen AUTH/EMP

## completion_report

**Closed:** U65 browser retest FR-UC-B04 after BE `W1-B-03-TC-CAT-XBOS-LABEL-01` — L0 PASS · AC1 XBOS `status_label` live · AC2–5 regression PASS · 19 clicks · world-standard test-log md+json · `R-CAT-XBOS-STATUS-LABEL` CLOSED.

**Open residual:** P2 picker FE map / P1 allowlist defer only (not blockers for this WI).

**ack_status:** `PASS_TO_PM`

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: W1-B-03-TC-CAT-QC-R1
role: qc
priority: P0
entry: docs/qa/evidence/w1b-03-tc-cat-qa-r1.md PASS_TO_PM
focus: Gate FR-UC-B04 after R-CAT-XBOS-STATUS-LABEL CLOSED — AC1 status_label=Đang dùng on XBOS GET + AC2–5 HRM-SYNC-200/201 · picker · F5
evidence: docs/qa/evidence/w1b-03-tc-cat-qa-r1.md · *-test-log.md/json · screens/w1b-03-tc-cat-qa-r1/
cấm: seed · reopen AUTH/EMP · invent GO without reading browser evidence
exit: GO / GWC / NO-GO + residual list
```
