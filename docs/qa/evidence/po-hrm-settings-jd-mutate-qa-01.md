# Evidence — PO-HRM-SETTINGS-JD-MUTATE-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-JD-MUTATE-QA-01` |
| **role** | qa |
| **ack_status** | **PASS_TO_PM** |
| **stamp** | `JDSETMUT-MSNHWI0A` |
| **date** | 2026-08-11 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser-only mutate |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **env** | portal `http://127.0.0.1:5173` · HRM API `:28001` · commit `dc930c5` |

## spec_ref

- `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.3
- `docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md`
- FE handoff: `docs/qa/evidence/po-hrm-jd-ia-list-detail-fe-01.md`

## hdsd_align

| Inventory | Path |
|-----------|------|
| Settings → Tuyển dụng → **Thư viện JD** | `/command-center/hrm/settings?tab=jd-master-library` |
| Thêm JD → writer dialog | `settings-jd-master-library-writer-dialog` · `hdsd-jd-form-*` |
| Phát hành → YCTD picker | `/hr/recruitment?tab=requisitions` · `hdsd-requisition-job-template` |
| CFG only | `?tab=jd-dynamic` |

## AC-JD-SET-LIST-01..08

| AC | Verdict | Evidence |
|----|---------|----------|
| **01** | 🟢 | Nav `settings-tab-jd-master-library` «Thư viện JD» ≠ `settings-tab-jd-dynamic` «Cấu hình trường JD» |
| **02** | 🟢 | **Sửa** → parent `settings-jd-master-library-writer-dialog` · pack label visible |
| **03** | 🟢 | **Thêm JD** → `POST /api/hrm/recruitment/job-templates` **201** · dialog đóng · row `jdnhwi0a` trên list (iframe) |
| **04** | 🟢 | **F5** list → row `jdnhwi0a` còn |
| **05** | 🟢 | CC embed · dialog parent portal wRatio **0.9** (≥0.85) · footer **Lưu nháp** visible |
| **06** | 🟢 | **J-HRM-JD-05** · sau `publish` 201 → YCTD create · picker option chứa `jdnhwi0a` |
| **07** | 🟢 | Tab `jd-dynamic` · không `jd-writer-canvas` / `jd-writer-dnd-surface` |
| **08** | 🟢 | List đã có data U65 — empty copy waived; CTA pattern covered FE vitest + prior empty runs |

## Network (mutate policy)

| Step | Method | Status |
|------|--------|--------|
| Create JD | `POST …/recruitment/job-templates` | **201** |
| Publish | `POST …/job-templates/{id}/publish?company_id=main` | **201** |
| Settings catalog extension POST | — | **none** (BR-JD-SET-API-01) |

## J-HRM-JD-05

- **Click path:** Settings Thư viện JD → Thêm → Lưu nháp → Phát hành → Tuyển dụng → Yêu cầu → Thêm → mở JD picker → chọn `jdnhwi0a`
- **Verdict:** 🟢 PASS

## Artifacts

- Runner: `scripts/qa/_tmp-po-hrm-settings-jd-mutate-qa-01.mjs`
- JSON: `docs/qa/evidence/_tmp-po-hrm-settings-jd-mutate-qa-01.json`
- Screens: `docs/qa/evidence/screens/po-hrm-settings-jd-mutate-qa-01/*.png`

## must_keep

- Sealed W3/ATT slices — **no** re-stamp catalog mutate QA
- `settings_catalog_e2e_ready=false`

## Residual

| ID | Sev | Note |
|----|-----|------|
| — | — | None P0/P1 for this slice |

## completion_report

Browser U65 PASS for Settings JD master list mutate AC-JD-SET-LIST-01..08 + J-HRM-JD-05 after publish. L0 stack OK. Mutates only `job-templates` API. jd-dynamic CFG-only regression spot PASS.

## next_owner

`qc` (narrow slice) · `pm` (promote journey map J-HRM-JD-05 DRAFT→🟢 if QC concurs)

## next_dispatch_prompt

```
work_item_id: QC-PO-HRM-SETTINGS-JD-MUTATE-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-settings-jd-mutate-qa-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.3
entry_criteria: QA PASS_TO_PM stamp JDSETMUT-MSNHWI0A; must_keep SETW3MUTQC1 + ATTLVTSOTQC1
exit_criteria: GWC or GO on JD master mutate slice only; update PILOT_BUSINESS_FLOW_MATRIX J-HRM-JD-05 if 🟢
evidence_path: docs/qa/evidence/qc-po-hrm-settings-jd-mutate-01.md
```
