# Prompt Claude — nghiên cứu Enterprise UI + neo dialog XeVN (copy nguyên khối)

> Dán **toàn bộ** khối dưới vào Claude (hoặc Cursor Task ba-docs). Không cần path nội bộ.

---

## PROMPT 1 — Research Enterprise HR / Ops UI (bắt buộc chạy trước HTML)

```text
Bạn là Principal Product Designer + Design Systems lead cho phần mềm enterprise (HR + attendance + multi-company ops), không phải marketing landing.

Bối cảnh sản phẩm:
- Portal nội bộ tập đoàn logistics Việt Nam, brand **XeVN**
- Module: Chấm công (nhiều dialog đơn từ), Nhân sự, Hồ sơ, Lương
- User: HRBP / CEO thành viên / vận hành — dùng hàng ngày, nhiều form
- Sponsor chốt: wordmark trên MỌI modal; viền xanh đầu modal + logo trái; chữ sắc nét 12–14px tối thiểu; được hero/visual mạnh trên modal; glass + full-bleed header brand; được giảm field để đẹp; dialog mở rộng khi nhiều field; input/select co theo độ dài ký tự thực tế; cấm palette AI (tím-indigo, cream-terracotta, glow); song song code UI với wave giấy; bỏ cực “Apple luxury” vs “ops 1000 NV” cứng — chọn pattern enterprise hợp lý; được thay component library nếu giúp chuyên nghiệp hơn nhưng không đập bố cục nghiệp vụ đã chốt.

Nhiệm vụ research (viết tiếng Việt, có bảng):

1) Benchmark 5–8 sản phẩm enterprise UI gần nhất (ví dụ Workday-lite density, SAP Fiori dialog, Microsoft Fluent dialog, Linear/Height form density, Ant Design Pro form, shadcn enterprise patterns, Radix Themes). Với mỗi cái: điểm mạnh dialog form · điểm yếu nếu áp vào chấm công VN · lib/npm liên quan.

2) Kết luận: UI XeVN hiện tại (modal shadcn đơn sơ, ít brand chrome, field full-width dài) so với enterprise đạt = **gap class** nào (typography, modal chrome, field width, hierarchy, empty/stub honesty, glass header).

3) Phương án cụ thể (chọn 1 recommended + 1 alternate):
   - Modal anatomy: header full-bleed brand + logo trái + title ≥20 · body grid · footer actions
   - Field width rules theo loại dữ liệu (ngày, số, mã NV, textarea lý do…)
   - Khi nào dùng dialog rộng / side-sheet / wizard
   - Stack FE đề xuất trên React+Vite+Tailwind+shadcn hiện có: giữ shadcn hay thêm lib nào (vd. @radix-ui, cmdk, vaul drawer, react-aria, Base UI) — liệt kê npm + lý do + rủi ro bundle
   - Font: Display Montserrat; Body chọn giữa Source Sans 3 vs Be Vietnam Pro vs IBM Plex Sans — khuyến nghị 1

4) Anti-patterns: chip cluster, stat strip giả sang, purple gradient, chữ slate-400 body.

5) Deliverable: checklist QA “5 giây nhận brand” + checklist “dialog form đạt”.

Cấm: generic “make it modern”; không đề xuất đổi API/SRS; không seed data.
```

---

## PROMPT 2 — HTML neo 5 dialog đạt (sau Prompt 1)

```text
Bạn là UI engineer xuất HTML tĩnh (một file hoặc folder nhỏ), brand XeVN, primary #1E40AF, text #111827.

Đầu vào: kết luận Prompt 1 (enterprise dialog anatomy).

Làm HTML neo (không React app) cho 5 màn P0:
1) Login portal XeVN
2) ATT Overview (toolbar + KPI tối giản brand)
3) Dialog “Tạo đơn nghỉ” — nhiều field, dialog RỘNG, field co theo loại
4) Dialog “Tạo đơn OT” — tương tự
5) EMP Profile header + 1 modal sửa nhanh

Bắt buộc mỗi modal:
- Viền/thanh xanh full-bleed đầu
- Logo/wordmark nhỏ trái
- Glass hoặc blur nhẹ header (không purple glow)
- Title sắc nét ≥20px Montserrat
- Body font theo khuyến nghị Prompt 1
- Input/select chiều rộng hợp lý (không full 100% nếu field ngắn)
- Primary CTA #1E40AF; destructive rõ; không chữ nhạt
- Có section “CHƯA ĐẠT” screenshot-wire mô tả UI cũ đơn sơ vs “ĐẠT” HTML mới

Output:
- HTML + CSS (có thể Tailwind CDN)
- Bảng mapping field → max-width
- Ghi chú implement cho Dev-FE (class token, không đổi API)

Cấm: Lorem vô nghĩa; fake QR/Face LIVE; tím/cream AI.
```

---

## PROMPT 3 — ADR delta ngắn (cho SA / Claude architecture)

```text
Bạn là Solution Architect. APPEND delta ADR brand (không wipe ADR cũ).

Sponsor lock 2026-08-05:
- Brand = XeVN
- Wordmark mọi modal; Q1 = viền xanh đầu + logo trái
- Mood sắc nét enterprise; cấm AI purple/cream/glow
- Display Montserrat; body TBD (Source Sans 3 / Be Vietnam Pro / IBM Plex)
- Modal: glass + full-bleed header; hero visual được phép
- Được giảm field + mở rộng dialog; field compact theo độ dài
- Mobile cùng brand
- D7 vs UI = song song
- Bỏ cực Apple luxury vs ops-first cứng → enterprise-appropriate
- Brand thuộc portal chrome
- Component: thay nếu giúp UX; layout nghiệp vụ giữ
- Tư vấn ngoài chỉ tham khảo
- HTML neo trước Dev-FE
- S3 stub: đề xuất Option A (chrome brand + honesty) — chờ sponsor A/B

Viết mục ADR APPEND: tokens typography, modal chrome law, QA 5s signals, must_keep, forbidden.
Không claim remaster DONE / Attendance CLOSED / Face LIVE.
```
