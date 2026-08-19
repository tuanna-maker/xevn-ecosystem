# Câu hỏi sponsor — Audit tạo HĐLĐ (CTR create)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-BA-01` |
| **date** | 2026-08-10 |
| **rule** | Chỉ hỏi chỗ **SPEC-SILENT** hoặc mâu thuẫn intake vs BA-01 / sponsor vs QA URL |
| **cấm** | Implement FE trước khi có câu trả lời (bus lock 2026-08-10 11:05) |

Trả lời bằng cách ghi **Q# + chữ cái** (vd. `Q1-B`) hoặc **Có/Không** trong chat.

---

**Q1.** Dialog «Thêm hợp đồng» trên Command Center (`/command-center/hrm/contracts`) phải phủ diện tích nào?

- **A.** Full viewport trình duyệt (overlay parent portal, ~90% w × ~90vh) — như incident AC-CTR-UX-06 đề xuất  
- **B.** Full trong khung embed HRM (iframe) nhưng tối đa hóa trong iframe  
- **C.** Giữ `max-w-5xl` như BA-01 §3.1 (chỉ rộng hơn hiện tại một chút)

**Q2.** Khi chọn **A** (full CC): DnD điều khoản bước 2 có bắt buộc PASS trên **cùng URL CC** không?

- **Có** — QA nghiệm thu bắt buộc `command-center/hrm/contracts`  
- **Không** — chấp nhận PASS trên `/hr/contracts?portal=1` như QA-02

**Q3.** Trường **Tên hợp đồng** (AMIS intake) trên bước 1 GĐ1:

- **A.** Bắt buộc nhập (text)  
- **B.** Tự sinh/read-only từ mã HĐ + loại HĐ  
- **C.** Không có trên form GĐ1 (chỉ mã HĐ như BA-01 wireframe A)

**Q4.** **Ngày ký** trên form tạo GĐ1:

- **Có** — date picker bắt buộc trước Lưu  
- **Không** — chỉ ngày hiệu lực / hết hạn (BA-01 §3.2 C)

**Q5.** **Hình thức làm việc** + **Tỉ lệ hưởng lương %** (AMIS intake):

- **A.** Cả hai trên bước 1 GĐ1 (catalog + số %)  
- **B.** Chỉ tỉ lệ % (read-only từ C&B)  
- **C.** GĐ2 — GĐ1 chỉ C&B read-only như **O10**

**Q6.** Chọn nhân viên bước 1:

- **A.** Ô tìm kiếm (tên/mã NV) — không hiển thị UUID thô  
- **B.** Giữ dropdown hiện tại nếu đã có nhãn NV (chấp nhận UUID trong DevTools)

**Q7.** Thao tác **Gỡ** điều khoản khỏi canvas bước 2 (trước Lưu / Xem trước):

- **Có** — nút «Gỡ» từng dòng canvas (AMIS parity)  
- **Không** — chỉ kéo ra / xóa bằng DnD ngược; không nút riêng

**Q8.** Nếu **Có** Q7: «Gỡ» có cần xác nhận khi điều khoản bắt buộc theo mẫu?

- **Có**  
- **Không**

**Q9.** Khối **Phụ cấp** kiểu AMIS («+ Thêm» nhiều dòng) trên bước 1:

- **A.** GĐ1 — sub-grid snapshot từ C&B (read-only, không «+ Thêm»)  
- **B.** GĐ1 — cho phép thêm dòng phụ cấp trên form tạo  
- **C.** GĐ2 — GĐ1 chỉ một card C&B như **O10**

**Q10.** **Trích yếu** hợp đồng (AMIS «Mô tả»):

- **Có** — textarea bước 1 GĐ1  
- **Không** — chỉ «Ghi chú» sổ đăng ký hiện có

**Q11.** Tiêu chí **chữ to / ít scroll** (sponsor UX):

- **A.** Bắt buộc AC đo được: body ≥16px, dialog ≥90vh, tối đa 1 scroll chính bước 1  
- **B.** Nguyên tắc chung theme XeVN — không AC số cụ thể GĐ1  
- **C.** Chỉ sửa khi full viewport (Q1-A) xong rồi đánh giá lại

**Q12.** Mẫu **HĐ thử việc** (`XEVN_PROBATION_*`) trên catalog active GĐ1:

- **Có** — bắt buộc chọn được như AMIS (QA retest J-03)  
- **Không** — tạm HOLD; chỉ FT 12/24/KXĐ như slice QC-02

---

**Sau khi chốt:** PM dispatch `PO-HRM-CTR-CREATE-REDESIGN-BA-02` (CONFIRM, không outline) rồi mới `FE-03` / `QA-03`.

---

## Sponsor answers (2026-08-10 — chat chốt)

| Q# | Trả lời | Ghi chú PM |
|----|---------|------------|
| **Q1** | **A** | Full viewport parent CC (~90% w × ~90vh) — align SA Option A + FE portal fix |
| **Q2** | **Có** | QA bắt buộc `command-center/hrm/contracts` (DnD bước 2) |
| **Q3** | **B** | Tên HĐ tự sinh/read-only từ mã + loại |
| **Q4** | **Có** | Ngày ký — date picker bắt buộc GĐ1 |
| **Q5** | **A** | Hình thức làm việc + tỉ lệ % lương trên bước 1 GĐ1 |
| **Q6** | **Custom** (xem §Q6) | Không chỉ A/B — dropdown + **tìm kiếm**; phân tách **NV vs ứng viên**; trace REC→EMP + workflow động |
| **Q7** | **Có** | Nút «Gỡ» từng dòng canvas |
| **Q8** | **Có** | Xác nhận khi gỡ điều khoản bắt buộc theo mẫu |
| **Q9** | **C** | Phụ cấp GĐ2; GĐ1 một card C&B như O10 |
| **Q10** | **Có** | Trích yếu textarea bước 1 GĐ1 |
| **Q11** | **B** | Typography theo theme XeVN — không AC số cụ thể GĐ1 |
| **Q12** | **Có** | Mẫu HĐ thử việc `XEVN_PROBATION_*` bắt buộc chọn được GĐ1 |

**Bus:** `docs/program/AGENT_MESSAGE_BUS.md` — `sponsor -> pm | CHOT CTR-CREATE Q1-Q12` 2026-08-10.

### §Q6 — Sponsor verbatim (BA-02 bắt buộc trace)

Giữ dropdown như hiện tại **nhưng** cho phép **tìm kiếm** trên danh sách **nhân viên** hoặc **ứng viên**; nghiệp vụ **phải phân tách**:

- **Tạo HĐ mới (luồng này):** đối tượng là **ứng viên** (chưa phải NV trên sổ).
- **Nếu chọn nhân viên:** kiểm tra lại luồng **tuyển dụng** (ứng viên → nhân viên): quy trình hiện tại, có **đồng bộ** vào danh sách NV lúc tạo HĐ không, **cấu hình quy trình động** đã có chưa để chạy theo; tham chiếu mô hình cấu hình quy trình **AMIS/MISA** (học theo — không copy prompt).

**BA-02 deliverable bổ sung:** AC + sequence cho `FR-UC-BP-CORE-09` / REC spine; gap table «candidate vs employee SoT»; flag nếu workflow engine chưa đủ cho bước chuyển trạng thái.
