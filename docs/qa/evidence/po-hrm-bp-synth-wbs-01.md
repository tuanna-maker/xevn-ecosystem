# Evidence — PO-HRM-BP-SYNTH-WBS-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | **PO-HRM-BP-SYNTH-WBS-01** |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |

## completion_report

### Đã đóng

1. **SoT generator** `docs/client-delivery/hrm-enterprise-blueprint/_build_wbs_excel.py` đồng bộ **SYNTHESIS_MASTER v1.0** + **SRS 0.6** / Inventory **0.3.2**:
   - Output ưu tiên: `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` (fallback `WBS_HRM_ENTERPRISE_KHACH.xlsx` nếu MOI đang mở).
   - **+ WBS-REC-00** — thư viện mô tả công việc (JD) MVP.
   - **WBS-REC-02 / 02b** — trong/ngoài định biên + **tuyển mới / thay thế**.
   - **WBS-REC-02c** — chiến dịch / hub đa kênh = **Giai đoạn 2 — ngoài phạm vi hiện tại**.
   - **WBS-REC-03** — ứng viên **gắn bắt buộc** yêu cầu tuyển.
   - **WBS-REC-06** — báo cáo **kế hoạch so với thực tế**.
   - **CORE** — tách vòng hợp đồng & bảo hiểm mật; **quản lý công việc OUT**.
   - **ATT** — loại phép (năm · thâm niên · bù tăng ca · chuyển kỳ · ứng); bảng công = **đầu vào lương**.
   - **PAY** — ghi rõ đã thống nhất họp; nguồn giờ = bảng công chốt.
2. Rebuild Excel: **28** hạng mục · **45** tình huống · `prompt_echo_hits=[]` trên sheet khách (không scan sheet `99_*`).
3. Nội bộ: `WBS_HRM_ENTERPRISE.md` → **v0.4**; `README_SPONSOR_REVIEW.md` — note nguồn mindmap+HTML+Excel; **không** claim khách / anh Nam đã ký.

### Residual / mở

| # | Mục | Owner gợi ý |
|---|-----|-------------|
| R1 | PDF khách vẫn có thể ghi «44 tình huống» nếu chưa rebuild sau wave SRS — đồng bộ số 45 khi chạy lại `_build_srs_pdf_khach.py` | ba-docs / PM |
| R2 | SRS §1.2 còn câu «họp chi tiết công thức / bảng lương chưa kết thúc» lệch SYNTHESIS CORRECTION (PAY đã họp) — ngoài scope WBS này | ba-docs / ba-process |

### Không claim

- Không khẳng định anh Nam / khách đã ký nghiệm thu WBS hoặc SRS.

## Verify

```text
python _build_wbs_excel.py
→ OK: …/WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx · size_kb ≈ 92
assert stt == 45
WBS-REC-02c uu_tien = «Giai đoạn 2 — ngoài phạm vi hiện tại»
```

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SYNTH-WBS-01-INTAKE
from_role: pm
to_role: qc (hoặc ba-docs PDF sync)
entry_criteria: evidence docs/qa/evidence/po-hrm-bp-synth-wbs-01.md PASS; Excel MOI đã sync synthesis
exit_criteria: spot-check sheet 02 Hang_muc_WBS (REC-00/02c/CORE OUT/ATT leave/PAY timesheet); optional rebuild PDF số UC 45; không claim ký khách
evidence_path: docs/qa/evidence/po-hrm-bp-synth-wbs-01.md
```

## Files touched

| Path | Việc |
|------|------|
| `docs/client-delivery/hrm-enterprise-blueprint/_build_wbs_excel.py` | SoT sinh Excel |
| `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` | Bản gửi khách (ưu tiên) |
| `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE.md` | v0.4 nội bộ |
| `docs/client-delivery/hrm-enterprise-blueprint/README_SPONSOR_REVIEW.md` | Nguồn synthesis + số liệu |
| `docs/qa/evidence/po-hrm-bp-synth-wbs-01.md` | Evidence này |
