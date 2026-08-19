# REF — Căn cứ pháp lý nội dung hợp đồng lao động (VN)

> **Mục đích:** cấp căn cứ luật cho `BA-CTR-TPL-8-CLAUSE-MAP-01` (map 8 mẫu hợp đồng X.E → khối điều khoản trong Settings CTR template composer).
> **Do Cursor-PM tra cứu** (Claude Code không dùng được `web_search`: gateway `ENABLE_WEB_SERVER_TOOLS=false`).
> **Ngày tra:** 2026-08-12. Đây là **tham chiếu**, không phải SoT sản phẩm — SoT vẫn là SRS/TechSpec + file mẫu khách.

---

## 1. Văn bản áp dụng

| Văn bản | Điều liên quan | Nguồn |
|---|---|---|
| **Bộ luật Lao động 2019** (45/2019/QH14) | **Đ.21** nội dung HĐLĐ · **Đ.22** phụ lục · **Đ.23** hiệu lực · **Đ.24** thử việc · **Đ.25** thời gian thử việc · **Đ.26** tiền lương thử việc · **Đ.27** kết thúc thử việc | [Công báo 993+994/2019](https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2019/11/30232/29070-1-2019993-99445-2019-qh14.pdf) · [VB hợp nhất 125/VBHN-VPQH 2025](https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Van-ban-hop-nhat-125-VBHN-VPQH-2025-Bo-luat-Lao-dong-so-45-2019-QH14-672381.aspx) |
| **TT 10/2020/TT-BLĐTBXH** | **Đ.3** chi tiết từng nội dung chủ yếu của HĐLĐ theo khoản 1 Đ.21 | [PDF 10/2020/TT-BLĐTBXH](https://quydautuphattrien.ninhbinh.gov.vn/public/userfiles/hoatdong/VP/10_2020.pdf) |

**Đính chính so với dispatch ban đầu:** văn bản chi tiết **nội dung HĐLĐ** là **TT 10/2020/TT-BLĐTBXH Đ.3**, **không phải** NĐ 145/2020/NĐ-CP (145 chi tiết các mảng khác: thời giờ làm việc/nghỉ ngơi, kỷ luật, tranh chấp…). Khi BA cần tra thời giờ làm việc / kỷ luật thì mới dùng NĐ 145.

---

## 2. Khoản 1 Điều 21 — 10 nội dung bắt buộc (dùng làm checklist clause)

| Điểm | Nội dung | Field động gợi ý |
|---|---|---|
| a | Tên, địa chỉ NSDLĐ + họ tên, chức danh người giao kết bên NSDLĐ | pháp nhân (legal entity), người đại diện |
| b | Họ tên, ngày sinh, giới tính, nơi cư trú, số CCCD/CMND/hộ chiếu của NLĐ | hồ sơ NV |
| c | **Công việc và địa điểm làm việc** | chức danh (JD catalog), địa điểm |
| d | **Thời hạn** của HĐLĐ | loại HĐ (thử việc / 12T / 24T / KXĐTH) |
| đ | **Mức lương** theo công việc/chức danh, hình thức trả, thời hạn trả, **phụ cấp** và các khoản bổ sung | `base`, phụ cấp, kỳ trả lương |
| e | Chế độ nâng bậc, nâng lương | policy pack |
| g | Thời giờ làm việc, thời giờ nghỉ ngơi | ca/lịch làm việc |
| h | Trang bị bảo hộ lao động | theo khối (Tài xế ≠ Văn phòng) |
| i | **BHXH, BHYT, BHTN** | `si_base` — «Lương đóng BH» |
| k | Đào tạo, bồi dưỡng, nâng cao trình độ, kỹ năng nghề | clause bồi thường chi phí đào tạo |

Khoản 2: bí mật kinh doanh / bí mật công nghệ — thỏa thuận **bằng văn bản**, có thời hạn bảo vệ + bồi thường khi vi phạm → clause tuỳ chọn theo chức danh.

---

## 3. Điều 24 khoản 2 — vì sao mẫu THỬ VIỆC ít điều khoản hơn (mấu chốt cho map)

> «Nội dung chủ yếu của hợp đồng thử việc gồm **thời gian thử việc** và nội dung quy định tại các điểm **a, b, c, đ, g và h** khoản 1 Điều 21.»

Suy ra trực tiếp:

| Điểm Đ.21 | HĐ thử việc | HĐ chính thức (12T / 24T / KXĐTH) |
|---|---|---|
| a, b, c, đ, g, h | **Bắt buộc** | Bắt buộc |
| d (thời hạn) | thay bằng **thời gian thử việc** | Bắt buộc |
| **e** nâng bậc/nâng lương | **Không bắt buộc** | Bắt buộc |
| **i** BHXH/BHYT/BHTN | **Không bắt buộc** | Bắt buộc |
| **k** đào tạo | **Không bắt buộc** | Bắt buộc |

→ Khớp quan sát của sponsor: mẫu 12 tháng có clause **bồi thường chi phí đào tạo**, mẫu thử việc không có. Đây là **khác biệt do luật**, không phải khác biệt tuỳ ý → map clause phải đặt `required_by_law` cho e/i/k ở mẫu chính thức và `optional` ở mẫu thử việc.

Ràng buộc liên quan cần đưa vào BR:
- Đ.25: thời gian thử việc tối đa theo trình độ — 180/60/30 ngày, **06 ngày làm việc** với công việc khác.
- Đ.24 khoản 3: **không áp dụng thử việc** với HĐLĐ thời hạn **dưới 01 tháng**.
- Đ.26: tiền lương thử việc do hai bên thỏa thuận (thường ≥85% — BA kiểm lại khi viết BR).
- Đ.22: phụ lục HĐ **không được sửa thời hạn** HĐLĐ.

---

## 4. Ranh giới với sản phẩm

- Luật cho biết clause nào **bắt buộc phải có**; **không** quyết định UI hay cấu trúc bảng.
- Mọi clause của X.E vượt ngoài Đ.21 (nội quy riêng, cam kết tài sản/xe, KPI…) = `company_specific`, lấy từ 8 file mẫu khách.
- `si_base` («Lương đóng BH») vẫn SoT tại `employee_compensation_packages/lines` — xem `BA-CTR-INSURANCE-SALARY-SOURCE-01.md`.
