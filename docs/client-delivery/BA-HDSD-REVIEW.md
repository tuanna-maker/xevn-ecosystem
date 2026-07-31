# BA-Process Review — HDSD Pilot XeVN

| Field | Value |
|-------|--------|
| **work_item_id** | DOC-HDSD-PILOT-01 |
| **artifact** | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` |
| **reviewer** | BA-Process |
| **date** | 22/05/2026 |
| **standards** | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` (§7 anti-pattern, §9 checklist) |
| **verdict** | **APPROVE WITH EDITS** |
| **ack_status** | **PASS_TO_BA_DOCS** |
| **follow-up work_item** | DOC-HDSD-PILOT-01-REV |

---

## 1. Verdict summary

Tài liệu **đủ khung** cho pilot: chuẩn bị Windows, lệnh seed/UAT, đăng nhập, luồng theo vai, phạm vi tenant/công ty, xử lý lỗi — giọng văn và bảng biểu **nhất quán** với SRS HRM Mobile (`02_Tai_lieu_nghiep_vu_*`). Chưa đạt cổng “world-class client deliverable” vì còn **đường dẫn repo nội bộ**, **meta pipeline**, **thiếu bước migrate có lệnh**, và **dấu hiệu “nội bộ”** ở phần mở/đóng. Không phát hiện secret production; mật khẩu UAT có cảnh báo — chấp nhận cho pilot.

---

## 2. Findings (max 10)

| # | Sev | Finding |
|---|-----|---------|
| 1 | **P1** | Khối **Tài liệu liên quan** (đầu tài liệu) ghi `docs/hrm/...`, `docs/qa/...` — vi phạm checklist §9 (“ghi **tên tài liệu**, không `docs/...`”) cho narrative gửi khách. |
| 2 | **P1** | **Phụ lục C** nêu “pipeline HTML khách”, lệnh build, “PM yêu cầu” — ngôn ngữ quy trình nội bộ; cần đổi thành ghi chú phát hành khách hoặc chuyển sang phụ lục vận hành nội bộ. |
| 3 | **P1** | **§4.1** yêu cầu “database đã migrate” nhưng **không có lệnh** (`migrate:hrm:apply:with-deploy-env`, `migrate:xbos:apply:with-deploy-env`, kiểm tra status) — IT đọc sẽ phải đoán → không testable end-to-end. |
| 4 | **P1** | **Chân trang cuối** ghi “Tài liệu **nội bộ** pilot” trong khi header là bản pilot gửi Ban TGĐ/Nhân sự/IT — mâu thuẫn positioning khách hàng. |
| 5 | **P1** | **Phụ lục B** là bảng đường dẫn repo dày (`docs/qa/`, `scripts/`, `deploy/`) — phù hợp IT trong repo, không phù hợp bản in/PDF khách; nên tách “Phụ lục IT (chỉ bản kèm mã nguồn)” hoặc thay bằng tên tài liệu + mục đích. |
| 6 | **P2** | **Hai họ mật khẩu mobile** (`xevn-uat-2026` cho bộ 1.000 UAT vs `xevn-pilot` cho Du lịch §4.7) — đúng thực tế seed nhưng dễ nhầm cho phòng Nhân sự; cần bảng “Loại tài khoản → mật khẩu → khi nào dùng” ngay trước §4.6. |
| 7 | **P2** | **§5** luồng nghiệp vụ không gắn mã UC/FR (vd. MOD-ATT, FR-LEV-01) — khớp hành vi pilot nhưng yếu traceability với BRD/SRS; nên thêm cột “Tham chiếu SRS” tối thiểu cho 5.1–5.4. |
| 8 | **P2** | **§4.5 Cổng Web** đánh dấu “tùy chọn” nhưng **§5.5** là luồng điều hành bắt buộc — cần làm rõ: pilot nghiệp vụ mobile-first hay bắt buộc cả Portal trong checklist nghiệm thu. |
| 9 | **P2** | Trộn **Anh–Việt** trong thân bảng (Connection refused, POST/GET, JWT, emulator, Docker, VPS) — SRS chấp nhận thuật ngữ kỹ thuật; với Ban TGĐ nên Việt hóa nhãn triệu chứng ở §7. |
| 10 | **P2** | **§4.2** tham chiếu `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md` trong luồng chính — nên đổi tên tài liệu “Ghi chú triển khai máy chủ pilot” và đưa chi tiết sang phụ lục IT. |

**P0:** Không có (không lộ production secret; không sai mật khẩu UAT so với `seed-hrm-1000-uat-workforce.mjs` / `SYSTEM_INTEGRATION_UAT_SCENARIO.md`).

---

## 3. Sections to fix (handoff DOC-HDSD-PILOT-01-REV → @ba-docs)

| Priority | Section heading | Hành động |
|----------|-----------------|-----------|
| P1 | *(dòng **Tài liệu liên quan** ngay sau Mục đích)* | Chỉ tên file deliverable khách (`01_BRD_XeVN_OS.html`, `02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.md`); bỏ `docs/...` hoặc chuyển sang Phụ lục IT. |
| P1 | **3. Chuẩn bị môi trường (Windows)** — thêm **3.6 Khởi tạo cơ sở dữ liệu** (hoặc **4.0** trước 4.1) | Liệt kê lệnh migrate HRM/XBOS + tiêu chí đạt (status OK) trước seed. |
| P1 | **4.1 Seed 1.000 nhân sự UAT** | Tham chiếu chéo mục migrate; giữ kết quả mong đợi. |
| P1 | **4. Chạy thử từng bước** — đoạn VPS/Docker trong **4.2** | Tên tài liệu thay path `docs/ops/...`. |
| P1 | **4.6–4.7**, **5.3** | Thay `docs/hrm/...`, `docs/qa/...` bằng tên tài liệu; giữ nội dung đăng nhập. |
| P1 | **8. Phụ lục — Phụ lục B** | Đổi tiêu đề / tách bản IT; narrative khách không liệt kê `scripts/`. |
| P1 | **8. Phụ lục — Phụ lục C** | Viết lại cho khách (PDF/HTML tùy chọn) hoặc xóa meta pipeline. |
| P1 | *(dòng ký **Kiểm soát thay đổi** / footer)* | Bỏ “nội bộ”; dùng “Bản pilot — XeVN Group”. |
| P2 | **4.6** (trước bảng đăng nhập) | Bảng phân loại tài khoản & mật khẩu pilot. |
| P2 | **5. Luồng nghiệp vụ thử theo vai** | Thêm cột tham chiếu MOD/FR hoặc UC pilot. |
| P2 | **4.5** và **5.5** | Thống nhất bắt buộc/tùy chọn Portal trong pilot. |
| P2 | **7. Mã lỗi thường gặp** | Việt hóa cột triệu chứng cho độc giả nghiệp vụ. |

---

## 4. What passed (no change required)

- Cấu trúc 8 mục + phụ lục; đối tượng Ban TGĐ / HR / IT rõ.
- Placeholder `.env` (§3.3) — không ghi secret thật.
- Lệnh PowerShell/curl health check (§4.3) có tiêu chí HTTP 200.
- UAT runner + verdict PASS (§4.4) có evidence path (có thể giữ trong phụ lục IT).
- §6 phạm vi tenant/company/membership — **phù hợp BRD đa công ty**.
- §5.1–5.4 khớp `SYSTEM_INTEGRATION_UAT_SCENARIO` (UAT0001 CEO, UAT0016 driver, P5/P6).
- Mermaid §2.1 — phù hợp deliverable kỹ thuật pilot.

---

## 5. Handoff packet

| Field | Value |
|-------|--------|
| from_role | ba-process |
| to_role | ba-docs |
| work_item_id | DOC-HDSD-PILOT-01-REV |
| entry_criteria | Verdict APPROVE WITH EDITS; sửa có mục tiêu theo bảng §3 |
| exit_criteria | Không `docs/` trong narrative mở/§4–§7; có bước migrate; footer/bìa nhất quán khách; ba-process re-review PASS hoặc PM chấp nhận waiver |
| evidence_path | `docs/client-delivery/BA-HDSD-REVIEW.md` |
| needed_by | PM gate DOC-HDSD-PILOT-01 |
| ack_status | PASS_TO_BA_DOCS |

---

*Review-only — BA-Process did not rewrite `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md`.*
