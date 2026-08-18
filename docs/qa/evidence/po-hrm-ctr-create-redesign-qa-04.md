# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-04

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-CREATE-REDESIGN-04` |
| **stamp** | **`CTRCREATEQA4-MSMSE16S`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-04.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-04.json` |
| **commit** | `dc930c5` |
| **prior** | FE-04 DnD parent portal · qa-03 FAIL CTRCREATEQA3-MSMQT4I8 |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (UV exit quirk) |
| Vitest (FE handoff) | `apps/web/hrm` package: 15 passed (FE-04); root `vitest` alias fail on `hrmPangeaParentPortalQueryPatch` — **PASS_WITH_HOLD** |

## Scope exit (dispatch)

| AC / J | Verdict | Detail |
|--------|---------|--------|
| **AC-CTR-DND-01** | BLOCKED | Không vào bước 2 — chưa thực thi palette/canvas |
| **AC-CTR-DND-02** | BLOCKED | Không vào bước 2 — chưa thực thi «Gỡ» |
| **AC-CTR-SUBJECT-01** | PASS | {"verdict":"PASS","candVisible":true,"hasSearch":true,"triggerUuidBefore":false,"triggerSample":"Gõ tên hoặc mã YCTD để tìm ứng viên…","inlineSearchTestId":true} |
| **AC-CTR-FIELD-04** | PASS | {"verdict":"PASS","cbCard":true,"allowanceAdd":false} |
| **J-HRM-CTR-CREATE-02** | BLOCKED | Không vào bước 2 — DnD chưa kiểm |

## AC matrix (full regression · BA-02 §4)

| AC | Verdict | Detail |
|----|---------|--------|
| **AC-CTR-UX-07** | PASS | {"verdict":"PASS","page_url":"http://127.0.0.1:5173/command-center/hrm/contracts?_=1786339457082"} |
| **AC-CTR-UX-06** | PASS | {"verdict":"PASS","pass":true,"wRatio":0.9,"hRatio":0.9,"note":"1296×810 vs 1440×900"} |
| **AC-CTR-UX-01** | PASS | {"verdict":"PASS","honesty_visible":false} |
| **AC-CTR-UX-08** | PASS | {"verdict":"PASS","note":"GĐ1 theme scan — dialog visible"} |
| **AC-CTR-FIELD-01** | PASS | {"verdict":"PASS","readonly":true,"derived":"TMP-QA3 — Hợp đồng học việc"} |
| **AC-CTR-SUBJECT-01** | PASS | {"verdict":"PASS","candVisible":true,"hasSearch":true,"triggerUuidBefore":false,"triggerSample":"Gõ tên hoặc mã YCTD để tìm ứng viên…","inlineSearchTestId":true} |
| **AC-CTR-FIELD-04** | PASS | {"verdict":"PASS","cbCard":true,"allowanceAdd":false} |
| **AC-CTR-FIELD-03** | PASS | {"verdict":"PASS"} |
| **AC-CTR-CATALOG-01** | PASS | {"verdict":"PASS"} |
| **AC-CTR-FIELD-02** | PASS | {"verdict":"PASS"} |
| **AC-CTR-SUBJECT-02** | BLOCKED | {"verdict":"BLOCKED","candPick":{"picked":false,"label":"","hasUuid":false,"searchTerm":"QA","triggerAfterPick":"Gõ tên hoặc mã YCTD để tìm ứng viên…","triggerUuidAfter":false},"post":null,"step2Open" |

## Journeys (§6)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-01** | FAIL | {"verdict":"FAIL","step2Open":false,"ux06":true} |

## Network (mutate)

```json
{
  "candidate_post": null,
  "save_post": null
}
```

## DnD / embed

| Check | Value |
|-------|--------|
| dialog mount | `parent-portal` |
| DnD P0 storms | **none** |

## Defects (FAIL residual)

| ID | Sev | AC / J | Mô tả | Owner |
|----|-----|--------|--------|-------|
| **DEF-CTR-PICKER-INLINE-PORTAL-P1** | P1 | SUBJECT-02 · chặn DND | U65: sau tab **Ứng viên**, inline `ctr-create-candidate-picker-search` + combobox trên **parent-portal** — Playwright không chọn được option dù API `GET recruitment/candidates` có 13 UV (`CNS Allow msj8kfl7`); không `POST` bước 1 → **không kiểm được** DND-01/02 / J-CREATE-02 | dev-fe + qa |
| **DEF-CTR-DND-PARENT-P0** | P0 (unverified) | DND-01 · J-CREATE-02 | QA-03 (`CTRCREATEQA3-MSMQT4I8`) đã vào bước 2: **13×** `Unable to find drag handle`, canvas=0. Lần chạy này **0** DnD storm trên dialog bước 1 nhưng **chưa retest** palette→canvas sau FE-04 | dev-fe |

**Promoted (slice):** AC-CTR-SUBJECT-01 (inline search, placeholder không UUID) · AC-CTR-FIELD-04 (`ctr-create-cb-card` visible) · regression UX-06/07 trên CC.

**Not promoted:** DND-01/02 · J-HRM-CTR-CREATE-02 · printable UAT · `contracts_printable_ready=false`.

## UF browser (U65)

- **URL:** `http://127.0.0.1:5173/command-center/hrm/contracts` · `ceo@xe.vn` · `companyId=main`
- **Click:** Thêm HĐ → tab **Ứng viên** → inline search visible → điền mẫu/ngày/LV%/trích yếu → **chọn UV** → **Tiếp** (blocked tại chọn UV)
- **Network:** không có `POST /api/hrm/contracts-insurance/contracts` (candidate draft)
- **DnD:** dialog `parent-portal` · console **không** có `Unable to find drag handle` trên bước 1 (khác QA-03)
- **Verdict slice:** 🔴 **FAIL_TO_PM** — DND/J-CREATE-02 **BLOCKED**; SUBJECT-01 + FIELD-04 **PASS**

## Defects (auto)

## Screens

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-04/01-dialog-cc-overlay.png`

## Console (max 5)

- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and

> **contracts_printable_ready=false** · **C-SLICE** · DnD PASS only on CC URL

**ack_status:** **FAIL_TO_PM**
