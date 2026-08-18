# Evidence — PO-HRM-BP-SYNTH-DOCS-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | **PO-HRM-BP-SYNTH-DOCS-01** |
| merges / closes intent | **PO-HRM-BP-WBS-UC-CHOT-01** |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |
| no_prompt_echo | true |

## Entry (đã đóng trước seat)

- `po-hrm-bp-synth-srs-01.md` — SRS **v0.7** · UC_INVENTORY **0.3.3**
- `SYNTHESIS_MASTER_HRM_ENTERPRISE.md` v1.0
- `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.0
- `ATT_SURFACE_INVENTORY_DEEP.md` (có — nội bộ; sheet khách bám 46 màn fidelity)

## completion_report

### Đã đóng

1. **WBS UC chốt v1.0** — `WBS_HRM_ENTERPRISE_UC_CHOT.xlsx` (+ generator `_build_wbs_uc_chot.py`):
   - `01_Danh_muc_UC` — **45** UC · MVP/GĐ2 · meeting_ref · trạng thái FR · WBS · runtime · khoảng trống khách · cột ký
   - `02_Man_cham_cong` — **46** bề mặt (gồm đang phát triển / GĐ2) + gap khách từ matrix
   - `03_Tom_tat_khoang_trong` — **G-01…G-17** tiếng Việt (campaign GĐ2 · 5 loại phép · BH/CTY · SoT bảng công → lương · Q-PAY-FORMULA = cách lắp · **cấm** hiểu «chưa họp lương» · D7 pause code)
2. **WBS MOI rebuild** — `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` (~93 KB): guide SRS **0.7** / inventory **0.3.3**; khóa leave types + PAY meeting complete + pointer UC_CHOT.
3. **PDF khách** — `SRS_HRM_ENTERPRISE_KHACH.pdf` rebuild từ SRS v0.7 **không** chạy `patch_srs` (tránh wipe / hạ version 0.5) → **75** trang · `build_pdf_from_srs()` only.
4. **Sponsor pack** — `README_SPONSOR_REVIEW.md` (v0.7 READY chốt) · `COVER_GUI_KHACH.md` (45 UC · bốn trụ đã họp) · `WBS_UC_CHOT_README.md` v1.0.
5. **Không** claim khách đã ký · **không** mở TechSpec unlock · **không** `apps/**` · **không** wipe FR.

### Residual / mở

| # | Mục | Owner |
|---|-----|-------|
| R1 | Gap matrix verdict **NOT_READY** TechSpec — Q-* + PRODUCT_STUB ATT/PAY — đúng D7 | PM → khách / QC spot |
| R2 | `_build_srs_pdf_khach.py` `main()` vẫn assert 44 UC + `patch_srs` — **cấm** chạy full main đến khi sửa generator; dùng `build_pdf_from_srs()` | ba-docs follow-up |
| R3 | ATT deep 90 surfaces vs 46 fidelity — sheet chốt giữ 46; deep = nội bộ | QA browser deep (đã dispatch riêng) |
| R4 | Proposed UC-BP-ATT-13…18 chưa ADD SRS (matrix §10) | PM mở ba-docs nếu khách IN |

### Không claim

- Khách / anh Nam đã ký nghiệm thu.
- TechSpec / DB / API đã confirm.
- Attendance / Payroll product CLOSED / LIVE toàn phần.

## Verify

```text
python _build_wbs_uc_chot.py  → UC 45 · ATT 46 · GAP 17 · v1.0
python _build_wbs_excel.py    → MOI ~93 KB · SRS 0.7 in guide
python -c "from _build_srs_pdf_khach import build_pdf_from_srs; build_pdf_from_srs()"
  → PDF 75 pages · SRS file vẫn **0.7**
Ban scan: không «họp lương chưa xong» trên COVER / README / UC_CHOT sheets
```

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SYNTH-DOCS-01-INTAKE
from_role: pm
to_role: qc
entry_criteria: evidence docs/qa/evidence/po-hrm-bp-synth-docs-01.md PASS; packet READY chốt
exit_criteria: spot-check PDF v0.7 + UC_CHOT 45/46 + ban unfinished-PAY wording; GWC gửi khách; không claim signed; không TechSpec unlock
evidence_path: docs/qa/evidence/qc-po-hrm-bp-synth-docs-01.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
