# PO — Nghiên cứu đối chiếu AMIS HRM → XeVN (động hóa toàn HR)

| Meta | Value |
|------|--------|
| **Program** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **Opened** | 2026-08-07 |
| **Sponsor** | Công thức lương + **mọi nghiệp vụ HRM** phải làm **động**; nghiên cứu kỹ **AMIS HRM (MISA)** toàn bộ; thiếu so với AMIS thì làm theo; đã bằng/hơn thì giữ |
| **Honesty** | Research ≠ UAT · không copy UI/code AMIS · chỉ nguyên tắc help công khai · `*_uat_ready=false` |
| **Parents** | `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01` · `PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01` |

## 1. Nguyên tắc đối chiếu

| Quy tắc | Ý nghĩa |
|---------|---------|
| **Tham chiếu helpamis** | Chỉ bài help công khai — không scrape/paywall product, không clone brand |
| **Gap → backlog** | AMIS có · XeVN thiếu hoặc hardcode → work_item GĐ1/GĐ2 |
| **Parity OK** | XeVN đã bằng/hơn (vd. print-spine HĐ, scope multi-tenant) → **không** đè |
| **AI AVA** | AMIS có AI tạo/kiểm công thức — XeVN **GĐ2+** trừ khi sponsor P0 riêng |
| **Customer-ready** | Khách mới chỉ cấu hình catalog/công thức/mẫu — không fork Nest |

## 2. Bản đồ phân hệ AMIS (neo research)

| AMIS app | Help hub (public) | XeVN neo |
|----------|-------------------|----------|
| Thông tin nhân sự | helpamis…/amis-thong-tin-nhan-su | EMP · contracts · catalogs · Settings |
| Tuyển dụng | (bộ AMIS HRM) | REC · JD dynamic |
| Chấm công | helpamis…/amis-cham-cong | ATT · sheet close → PAY |
| Tiền lương | helpamis…/amis-tien-luong | PAY · formula · batches |
| HĐ / hồ sơ | help + legacy | UF-HRM-02 · print-spine · XEVN-TPL |
| BHXH / TNCN | tích hợp AMIS | INS · tax — GĐ1 scope per SRS |

Luồng nối AMIS (tham chiếu): **REC → EMP → ATT/PAY/INS** · **ATT chốt → chuyển tính lương**.

## 3. AMIS Tiền lương — spine bắt buộc đối chiếu (P0)

Nguồn: [Luồng nghiệp vụ tính lương tổng quan](https://helpamis.misa.vn/amis-tien-luong/kb/huong-dan-chung-luong-nghiep-vu-tinh-luong-tong-quan-tren-amis-tien-luong/) · [Thành phần lương](https://helpamis.misa.vn/amis-tien-luong/kb/quan-ly-khoan-muc-luong/) · [Mẫu bảng lương](https://helpamis.misa.vn/amis-tien-luong/kb/mau-bang-luong/)

| Bước AMIS | Hành vi động | XeVN hôm nay (PM audit) | Target |
|-----------|--------------|-------------------------|--------|
| 1 Thiết lập | Thuế/BH/thông số · lịch sử lương NV | Partial Settings | Catalog + per-emp C&B |
| 2 Thành phần lương | CRUD khoản + **công thức** ở Giá trị/Định mức · starter system rows | Components stub · formula HOLD | Open catalog + formula engine |
| 3 Mẫu bảng lương | Chọn thành phần · **override công thức theo mẫu/OU** · cột hiển thị · DnD cột | Period/batch UI · thiếu mẫu động | `pay_sheet_template` + bind |
| 4 Dữ liệu tính lương | Bảng công + thu nhập khác + tạm ứng | ATT close · enroll partial | Input packs gắn kỳ |
| 5 Lập bảng lương | Tạo bảng theo mẫu · auto tính theo công thức | Create period · process → **0₫** | Eval engine + lines |
| 6 Gửi phiếu | ESS xác nhận | Partial payslip | AC later |
| 7 Chi trả | Payment batch | Payment APIs exist | Wire AC |

**Ưu tiên công thức AMIS (phải có trên XeVN):**

1. Thành phần lương = catalog mở (starter ≠ closed enum).  
2. Công thức trên thành phần **và** có thể override trên mẫu bảng lương.  
3. Thứ tự ưu tiên nguồn (AMIS): lịch sử lương > dữ liệu kỳ > mẫu > danh mục thành phần.  
4. Biến từ **bảng công đã chuyển/chốt** + C&B — khớp Q-PAY-F-3.  
5. Lập bảng lương lấy cấu trúc từ **mẫu** — không hardcode cột Nest.

## 4. Phạm vi research toàn HR (không chỉ lương)

| Domain | Câu hỏi parity |
|--------|----------------|
| EMP | Trường mở rộng · lịch sử lương · phụ cấp theo vị trí |
| REC | Pipeline động · hire→EMP |
| ATT | Quy tắc · tổng hợp · chuyển tính lương |
| PAY | Spine §3 đầy đủ |
| CTR/HĐ | Mẫu động · merge — CTR lane đang chạy |
| Catalog/Settings | Master mở · soft-delete |
| Cross | Không hardcode tenant policy trong code |

## 5. Waves

| ID | Owner | Deliverable |
|----|-------|-------------|
| `PO-HRM-AMIS-PARITY-BA-01` | ba-process | Ma trận AMIS capability × XeVN × GAP/OK/BETTER · AC đề xuất |
| `PO-HRM-AMIS-PARITY-SA-01` | sa | Map Platform Option B + PAY template/formula layers · wave unlock · non-goals (AI AVA) |
| `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` | ba-process+sa | Depth riêng spine Tiền lương §3 → feed `PAYROLL-FORMULA-RUN-GAP` |
| Sau research | ba-data / API / Dev | Chỉ gap **GAP** đã ưu tiên P0 |

## 6. Cấm

- Copy màn hình/brand/AI AVA AMIS vào product.  
- Claim parity DONE / payroll UAT từ research.  
- Đè vùng XeVN đã GWC (print-spine, soft OBS sealed) không regression.  
- Seed để «giống demo AMIS».

## 7. Liên kết evidence

- `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` — **PASS_TO_PM** (2026-08-07)  
- `docs/qa/evidence/po-hrm-amis-parity-sa-01.md` — **PASS_TO_PM** (2026-08-07)  
- `docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md` — **PASS_TO_PM** (2026-08-07)  
- `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-api-01.md` — **PASS_TO_PM** (2026-08-07) · SoT `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md`  
- `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-data-01.md` — **PASS_TO_PM** (2026-08-07)  
- `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-api-01.md` — **PASS_TO_PM** (2026-08-07) · SoT `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-API-01.md`  
