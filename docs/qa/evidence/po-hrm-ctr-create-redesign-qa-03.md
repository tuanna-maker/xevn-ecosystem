# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-03

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-CREATE-REDESIGN-03` |
| **stamp** | **`CTRCREATEQA3-MSMS86EF`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-03.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-03.json` |
| **commit** | `dc930c5` |
| **prior** | FE-03 · BE-SUBJ-01 · audit CTRAUDITQA1 baseline |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (UV exit quirk) |

## AC matrix (BA-02 §4)

| AC | Verdict | Detail |
|----|---------|--------|
| **AC-CTR-UX-07** | PASS | {"verdict":"PASS","page_url":"http://127.0.0.1:5173/command-center/hrm/contracts?_=1786339182993"} |
| **AC-CTR-UX-06** | PASS | {"verdict":"PASS","pass":true,"wRatio":0.9,"hRatio":0.9,"note":"1296×810 vs 1440×900"} |
| **AC-CTR-UX-01** | PASS | {"verdict":"PASS","honesty_visible":false} |
| **AC-CTR-UX-08** | PASS | {"verdict":"PASS","note":"GĐ1 theme scan — dialog visible"} |
| **AC-CTR-FIELD-01** | PASS | {"verdict":"PASS","readonly":true,"derived":"TMP-QA3 — Hợp đồng học việc"} |
| **AC-CTR-SUBJECT-01** | FAIL | {"verdict":"FAIL","candVisible":false,"hasSearch":false} |
| **AC-CTR-FIELD-04** | PASS | {"verdict":"PASS","cbCard":true,"allowanceAdd":false} |
| **AC-CTR-FIELD-03** | PASS | {"verdict":"PASS"} |

## Journeys (§6)

| Journey | Verdict | Detail |
|---------|---------|--------|
| — | — | — |

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

## Defects

- **DEF-CTR-QA03-FATAL** (P0): TimeoutError: locator.click: Timeout 20000ms exceeded.
Call log:
  - waiting for getByRole('option', { name: /XEVN_FT/i }).first()


## Screens

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-03/01-dialog-cc-overlay.png`

## Console (max 5)

- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and

> **contracts_printable_ready=false** · **C-SLICE** · DnD PASS only on CC URL

**ack_status:** **FAIL_TO_PM**
