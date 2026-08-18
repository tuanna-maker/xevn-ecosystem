# Evidence — PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01` |
| **from_role** | ba-process |
| **to_role** | pm → ba-data |
| **ack_status** | **PASS_TO_PM** |
| **pdf_read** | 30/30 via EasyOCR (`docs/qa/evidence/_tmp-po-hrm-pay-cntt-pdf-ocr/`) |
| **primary_sot** | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` |
| **fragments** | 63 rows |

## Method
1. OCR toàn bộ 30 PDF scan (pypdf text-empty → EasyOCR vi+en).
2. Phân lớp CHUNG vs RIÊNG theo folder + nội dung.
3. Trích parameters, inputs, outputs, supersedes, override/extend.
4. Đối chiếu header xlsx mẫu (`_tmp-po-hrm-pay-cntt-xlsx-scan/`).

## Closed
- Master fragment catalog SoT
- Supersedes graph + override matrix
- Per-model xlsx column hints for ba-data

## Residual
- OCR số liệu PL đầy đủ → ba-data double-check PDF gốc
- TG: không PDF — map từ xlsx VP HN + CHUNG
- `xevn_today`: all fragments MISSING/PARTIAL (engine absent)

## next_owner
`ba-data` — `PO-HRM-PAY-CNTT-BA-DATA-01`

## next_dispatch_prompt (copy-ready)

```
work_item_id: PO-HRM-PAY-CNTT-BA-DATA-01
role: ba-data
parent: PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01
read_first:
  - docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md (§4 fragment_id + §6 xlsx hints)
  - docs/từ khách hàng/Gửi P.CNTT/**/*.xlsx (done templates per model)
  - docs/qa/evidence/_tmp-po-hrm-pay-cntt-xlsx-scan/
task:
  1. Map every payroll xlsx column (all sheets) → fragment_id from catalog §4.
  2. Produce COLUMN_MAP matrix: model · sheet · column · fragment_id · data_type · source_system.
  3. Flag columns with no fragment (gap) vs CHUNG-only vs RIÊNG override.
  4. Cross-check numeric parameters in catalog vs OCR txt (R1 residual).
exit_criteria:
  - docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md
  - docs/qa/evidence/po-hrm-pay-cntt-ba-data-01.md
  - ack_status PASS_TO_PM → sa (PO-HRM-PAY-CNTT-SA-01 multi-template)
lane: governance · no apps/**
```
