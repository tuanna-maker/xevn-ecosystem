# PO-HRM-PAY-CNTT — Phương pháp đọc quy định lương (Sponsor lock)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-POLICY-READ-METHOD` |
| **Sponsor** | 2026-08-11 — *«Đọc thật kỹ; từng nội dung = mảnh ghép nghiệp vụ; chính sách chung và riêng phân định rõ»* |
| **Applies to** | Mọi seat BA/SA đọc `docs/từ khách hàng/Gửi P.CNTT/` |

## 1. Hai lớp chính sách (bắt buộc tách)

| Lớp | Ví dụ trong pack | Mảnh ghép hệ thống |
|-----|------------------|---------------------|
| **CHUNG (tập đoàn)** | `Chính sách chung/` · QĐ 2A thang lương · QĐ 127A | Master policy · thang bậc · quy tắc áp dụng mọi OU (override được?) |
| **RIÊNG (theo BP/OU/mô hình)** | ĐPHH · TĐHK · LX tuyến/tải · VP tỉnh | Policy pack bind OU + mẫu bảng + input pack riêng |

**Cấm** gộp chung+riêng thành một UC duy nhất.

## 2. Mỗi tài liệu PDF — bảng phân rã bắt buộc

Mỗi file PDF (QĐ / quy chế / thông báo) phải có:

| Cột | Nội dung |
|-----|----------|
| `doc_id` | Mã nội bộ (vd. `POL-DPHH-20250404-001`) |
| `scope` | CHUNG \| RIÊNG-{mô_hình} |
| `effective_from` | Ngày hiệu lực (dd/MM/yyyy) |
| `supersedes` | QĐ thay thế (nếu có) |
| `fragment_id` | Mảnh ghép (1 PDF → nhiều fragment) |
| `fragment_type` | THANG_LUONG \| HE_SO \| KPI \| PHU_CAP \| THUONG \| THU_VIEC \| DOANH_THU \| CHUYEN_CAN \| BHXH_TNCN \| KHOAN \| KHAC |
| `rule_text_vi` | Trích dẫn ngắn điều khoản (không prompt-echo) |
| `parameters` | Tham số số (% · VND · ngày · điều kiện if/else) |
| `inputs_required` | Dữ liệu cần (BCC · KPI · DT · điểm CLDV …) |
| `outputs` | Thành phần lương / cột bảng sinh ra |
| `system_home` | Settings catalog \| salary_component \| policy_rule \| template_override \| MANUAL |
| `amis_neo` | Bước spine AMIS 1–7 tương ứng |
| `xevn_today` | OK \| PARTIAL \| MISSING \| BETTER |

## 3. Mỗi bảng lương XLSX — liên kết fragment

- Header/cột → map `fragment_id` (cột nào do policy nào quy định).
- Cột công thức → `expression_hint` (không hardcode Nest).
- Sheet phụ (input) → `input_pack` type.

## 4. Thứ tự đọc (BA)

1. **Chính sách chung** (2 PDF) — baseline toàn tập đoàn.
2. **Từng mô hình** — policy PDF trước, bảng lương DONE sau, input pack cuối.
3. **Đối chiếu AMIS** — chỉ nguyên tắc help; không copy UI.
4. **Đối chiếu XeVN** — `po-hrm-payroll-formula-run-gap-ba-01.md`.

## 5. Deliverable tổng hợp

- `PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` — catalog mảnh ghép (master).
- `PO-HRM-PAY-CNTT-BA-PROCESS-01.md` — ma trận capability × gap.
- Không claim UAT · không viết SRS khách trước sponsor confirm delta.
