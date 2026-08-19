# Outline cấu trúc — mẫu HĐLĐ UNICOM 2026 (tham chiếu nghiệp vụ)

| Meta | Value |
|------|--------|
| **Source** | Sponsor file `1. MẪU HĐLĐ UNICOM 2026.docx` (local Downloads) |
| **Use** | Cấu trúc section / clause groups — **cấm** paste full DOC vào SRS khách / seed body bản quyền |
| **Work** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` · sponsor CONFIRM 2026-08-06 |
| **Honesty** | `contracts_printable_ready=false` |

## Sponsor UX lock (2026-08-06)
1. **Cấu hình động** ở Settings: điều khoản + dẫn chứng pháp lý (BLLĐ, BHXH, văn bản liên quan) — dễ sửa theo thời điểm.
2. **Mẫu theo loại đối tượng** (IT / Lái xe / …): kéo-thả clause từ thư viện vào template/pack.
3. **Lúc thêm HĐ:** chỉ điền thông tin chính (NV/ứng viên, lương/C&B, HR) + kéo-thả / chọn clause đã cấu hình — không soạn lại toàn văn mỗi lần.

## Section map (from sample — structure only)

| # | Section (logic) | Config class | Fill-at-create |
|---|-----------------|--------------|----------------|
| 0 | Quốc hiệu / tiêu đề / số HĐ | template layout | `contract_code` |
| 0b | **Căn cứ pháp lý** (BLLĐ 2019, Luật BHXH…, VB liên quan) | **clause group `LEGAL_BASIS`** — versioned Settings | optional override |
| 1 | Ngày ký · địa điểm ký | contract fields | yes |
| 2 | **Bên A** (DN, ĐC, MST, ĐT, đại diện, chức vụ, QT) | company master + signer Settings | merge |
| 3 | **Bên B** (họ tên, NS, QT, CCCD, thường trú, ĐT, email) | employee master | pick NV |
| 4 | **Điều 1** Công việc · loại HĐ · thời hạn · địa điểm · BP · chức danh · JD | core Đ.21 + JD ref | yes |
| 5 | **Điều 2** Chế độ LV · giờ · nghỉ · OT · thiết bị/ATVSLĐ | clause pack (IT vs Driver khác) | DnD order |
| 6 | **Điều 3** NV nghĩa vụ / quyền lợi · **lương** · PC · thưởng KPI · BH · hình thức trả | clause + **C&B F5** (salary off-body; snapshot on print) | salary via C&B |
| 7+ | Các điều tiếp (chấm dứt, bảo mật, …) | clause library | DnD per template |

## Clause library implication
- Mỗi «Điều …» / khối căn cứ pháp lý = 1+ `hrm_contract_clause` (code, title, body_vi, group, packs[], mandatory, sort).
- Template/pack = **ordered list of clause_ids** (DnD persist `layout_json` / join table).
- Create HĐ = select template/pack → merge master+C&B → snapshot clause bodies → preview/PDF.
