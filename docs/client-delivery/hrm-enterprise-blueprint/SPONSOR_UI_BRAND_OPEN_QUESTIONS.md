# UI / Thương hiệu — Chỗ team chưa làm / chưa hiểu (nhờ tư vấn ngoài)

| Mục | Nội dung |
|-----|----------|
| **Mã** | `PO-HRM-BP-UI-BRAND-OPEN-01` |
| **Ngày** | 2026-08-05 |
| **Dành cho** | Sponsor đọc → nhờ Claude / designer ngoài tư vấn → trả lời §3–§5 |
| **Không phải** | Bản mockup hay theme đã ship |

---

## 1. Thẳng thắn: vì sao anh chưa thấy UI “bắt mắt / nhận diện thương hiệu”

| Sự thật | Giải thích ngắn |
|---------|-----------------|
| Wave đang chạy = **chốt nghiệp vụ giấy** (họp → SRS → gap → WBS) | Không phải wave remaster visual |
| **D7** (quyết định họp) | Tạm **dừng code/demo** đến khi chốt giấy — team **không** được sơn lại popup ATT/EMP trong lúc này |
| Có skill nội bộ **Precision Motion** | Pipeline: ADR token → inventory màn → Dev-FE foundation → squad remaster → QA contrast — **chưa được bật** cho HRM embed |
| Nghiên cứu gần đây tập trung | Mindmap + HTML họp + Excel + inventory 90 surface chấm công + gap NOT_READY — **không** phải audit visual brand trên từng modal |
| Product hiện tại | Vẫn shell/token cũ (primary `#1E40AF` trong `.cursorrules`) + shadcn/HRM density ops — **chưa** dual-surface brand shell toàn bộ popup |

**Kết luận (cũ):** Anh không thấy giao diện mới vì **chưa có chương trình remaster được authorize** — không phải vì team đã nghiên cứu xong brand rồi giấu kết quả.

**Cập nhật 2026-08-05 ~10:04:** Sponsor **đã authorize** wave thiết kế lại («cho team làm luôn»). Program: `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md` · `PO-HRM-UI-BRAND-REMASTER-01`. Trạng thái: **W0 SA ADR + W1 inventory đang mở** — chưa ship UI mới cho đến khi Dev-FE foundation + squad xong.

**Cập nhật 2026-08-05 W0 CLOSED:** Token SoT = [`docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md`](../../architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md) (Option A Precision Motion). Open Questions §3 vẫn trống → Dev/QA dùng **assumptions A1–A5** trong ADR đến khi anh điền. Wave kế: Dev-FE foundation + BA inventory — chưa = UI mới trên mọi modal.

---

## 2. Team đã có sẵn (tham chiếu nội bộ — chưa = đã áp dụng màn)

| Nguồn | Nội dung | Đã áp HRM popup? |
|-------|----------|------------------|
| `.cursorrules` UI luxury | Primary `#1E40AF`, card 12px, safe-inline | Một phần layout, **không** = brand remaster |
| Skill `xevn-precision-motion-theme` | Text sharp, cấm chữ nhạt, ops density | **Chưa chạy** wave |
| `_vibe-team-os` brand remaster doctrine | Program-level | Chưa mở work_item HRM |
| Case study brand (nếu có trên máy) | Pattern XeVN | Chưa bind ATT modals |

---

## 3. Câu hỏi cần tư vấn ngoài (sponsor / Claude ngoài trả lời)

> Điền cột **Trả lời / hướng dẫn cho team**. Càng cụ thể càng dễ mở wave sau D7.

### 3.1 Bản sắc thương hiệu

| # | Câu hỏi team chưa chốt | Trả lời tư vấn |
|---|------------------------|----------------|
| B1 | Brand chính cho **portal nội bộ HRM** là gì? (XeVN / X-BOS / dual-surface tối–sáng?) | **XeVN** (portal nội bộ HRM). |
| B2 | Logo / wordmark bắt buộc trên **mọi modal** hay chỉ shell + login? | **Bắt buộc wordmark trên mọi modal** (logo nhỏ trái + viền brand đầu modal). |
| B3 | Mood: logistics sắc nét vận hành vs corporate luxury vs khác? | **Sắc nét** — enterprise chuyên nghiệp; bỏ cực “Apple luxury” vs “ops 1000 NV” cứng; chọn rule enterprise hợp lý. |
| B4 | Có **cấm** palette AI (tím–indigo, cream–terracotta, glow) ngoài rule hiện tại không? | **CÓ — cấm** (chốt 2026-08-05 ~13:44). |
| B5 | Font display + body cụ thể (tên file / license)? | Display: **Montserrat**. Body: **Source Sans 3** (chốt). License: Google Fonts OFL. |

### 3.2 Mức độ “bắt mắt” vs mật độ vận hành

| # | Câu hỏi | Trả lời tư vấn |
|---|---------|----------------|
| U1 | HRM là **ops-dense** (nhiều cột, ít trang trí) hay được phép hero/visual mạnh trên modal? | **Được phép hero/visual mạnh trên modal.** |
| U2 | Popup ưu tiên: glass / full-bleed header brand / chỉ token màu + typography? | **Ưu tiên glass + full-bleed header brand** (+ token màu + typography). |
| U3 | Có chấp nhận **giảm thông tin** trên dialog để đẹp hơn không? (rủi ro ops) | **Có** — giảm / gộp field; dialog **mở rộng** khi nhiều thông tin; input/select **co ngắn** theo độ dài ký tự thực tế. |
| U4 | Mobile driver app cùng brand system với web HRM hay tách? | **Cùng brand system.** |

### 3.3 Phạm vi remaster (khi D7 mở)

| # | Câu hỏi | Trả lời tư vấn |
|---|---------|----------------|
| S1 | P0 màn nào trước? (gợi ý team: Login → ATT Overview → 5 dialog request → EMP profile) | **Team tự kế hoạch; làm hết; squad song song nhiều màn.** |
| S2 | Có bắt buộc **toàn bộ** 46/90 surface ATT một wave không? | **Làm cả 90 surface** (batch song song A…G2 + SKIP nhận S3=A chrome+honesty). Không còn “chỉ 46”. |
| S3 | Stub/`featureInDev` — vẫn remaster chrome hay để xám honesty? | **S3 = A** (chốt) — remaster chrome brand + giữ honesty banner / disabled. |
| S4 | Có cần HTML/Figma khách trước khi Dev-FE không? | **Có** — HTML/Figma neo trước Dev-FE (pipeline §5). |

### 3.4 Đo “nhận diện thương hiệu” thế nào (để QA không đoán)

| # | Câu hỏi | Trả lời tư vấn |
|---|---------|----------------|
| Q1 | 5 giây nhìn screenshot modal — phải nhận ra brand bằng tín hiệu gì? | **Viền xanh đầu modal** + **logo/wordmark nhỏ bên trái.** |
| Q2 | Contrast / size chữ tối thiểu (web + mobile)? | **12–14px** tối thiểu; màu **sắc nét rõ, độ đậm** (không chữ nhạt). |
| Q3 | Có bộ screenshot “đạt / không đạt” mẫu không? (đính kèm path) | HTML/screenshot hiện tại = **chưa đạt** (quá đơn sơ). Cần bộ mẫu **đạt** mới (dialog form co giãn, field tối ưu chiều rộng). |

---

## 4. Những chỗ team **chưa hiểu** — sponsor đã trả lời (2026-08-05 ~13:37)

1. **Conflict D7 vs UI:** → **Làm song song** (UI remaster không chờ khóa giấy tuyệt đối).  
2. **Conflict density vs luxury:** → **Bỏ cả 2 cực cứng**; áp rule **enterprise** hợp lý; nghiên cứu lib/pattern trending (Claude research) rồi chốt SoT.  
3. **Brand SoT file:** ADR đã có. Tư vấn ngoài = **tham khảo thôi** (có thì có, không bắt buộc). Override sponsor → SA APPEND ADR.  
4. **HRM embed:** Brand thuộc **portal chrome** (wordmark/viền trên modal trong embed vẫn theo XeVN).  
5. **Component library:** **Thay được cái gì giúp UI/UX chuyên nghiệp hơn thì thay**; **bố cục nghiệp vụ đã chốt** — không đập luồng field/API.  

**Pipeline:** OK theo §5 (HTML neo trước Dev-FE).

---

## 5. Pipeline đã chốt (sau điền §3)

```text
Sponsor điền §3 (DONE một phần — còn S3 stub + B5 body font)
 → SA: ADR APPEND override (XeVN · wordmark mọi modal · glass/header · Montserrat …)
 → Claude/ba-docs: research enterprise UI + HTML neo dialog (đạt / không đạt)
 → Dev-FE: theme + dialog chrome (cấm đổi API/SRS)
 → Squad song song: ATT / EMP / REC / PAY / portal / mobile tokens
 → QA: brand 5s (viền xanh + logo trái) + contrast 12–14px sắc nét
 → QC: GWC slice — không claim remaster DONE sớm
```

**Cấm:** Chỉ đổi primary color; chip/stat “cho sang”; claim DONE khi dialog form vẫn đơn sơ.

---

## 8. Giải thích team → sponsor (câu anh hỏi thêm)

### 8.1 B4 là gì?

**B4 hỏi:** Team có được **cấm hẳn** các bộ màu kiểu AI hay không?

| Palette AI (cấm) | Vì sao xấu với XeVN |
|------------------|---------------------|
| Tím → indigo gradient | Nhìn generic ChatGPT/SaaS AI |
| Nền cream + chữ serif + terracotta | Template “warm luxury AI” |
| Glow / neon / blur quá đà | Không giống phần mềm tập đoàn vận hành |

Anh trả **sắc nét** → team hiểu = **B4 = CÓ, vẫn cấm** các palette trên. Primary vẫn hướng `#1E40AF` / xanh brand + chữ đậm `#111827`.

### 8.2 Font — tư vấn để anh chốt body

| Vai trò | Đề xuất | Lý do | License |
|---------|---------|-------|---------|
| **Display / tiêu đề** | **Montserrat** SemiBold–Bold | Anh đã chọn; wordmark/title modal | Google Fonts OFL |
| **Body (đề xuất A)** | **Source Sans 3** Regular/Medium | Enterprise HR/ops, đọc bảng tốt, hỗ trợ Việt | OFL |
| **Body (đề xuất B)** | **Be Vietnam Pro** | Tối ưu tiếng Việt; vẫn modern | OFL |
| **Body (đề xuất C)** | **IBM Plex Sans** | Cảm giác “hệ thống doanh nghiệp” | OFL |

**Khuyến nghị PM:** Display = Montserrat · Body = **Source Sans 3** (hoặc Be Vietnam Pro nếu ưu tiên glyph Việt).  
Anh chỉ cần trả lời một dòng: `Body = A / B / C`.

### 8.3 Vì sao có “46/90” surface ATT?

Không phải “chỉ làm 46, bỏ 44”.

| Số | Ý nghĩa |
|----|---------|
| **~46** | Hàng **fidelity matrix** cũ (nhóm màn lớn #1–46) |
| **90** | Inventory **sâu**: mỗi tab / modal / nút / stub = 1 `surface_id` S01–S90 |
| **83 in-scope** | 90 − 7 SKIP (Face card OUT, v.v.) |
| Wave A…G2 | Cắt 83 surface thành batch song song — **không** bắt buộc 1 wave gộp hết |

### 8.4 Stub / `featureInDev` — giải thích kỹ (cần anh chọn A hoặc B)

Một số màn **chưa có chức năng thật** (ví dụ Face web HOLD, import stub, quy tắc tablet chưa LIVE). Team hỏi:

| Option | Ý nghĩa | User thấy |
|--------|---------|-----------|
| **A — Remaster chrome + giữ honesty** | Sơn đẹp brand (viền xanh, logo, typography) nhưng vẫn banner «Chưa mở / GĐ2» · nút disabled | Đẹp + **không hiểu nhầm là dùng được** |
| **B — Để xám honesty** | Màn/stub vẫn xám xịt, ít brand | Trông “hỏng / bỏ quên” nhưng rõ chưa làm |

**Khuyến nghị PM:** **A** (khớp U1/U2 + Q1). Anh trả lời: `S3 = A` hoặc `S3 = B`.

---

## 6. Tài liệu kèm cho Claude ngoài (copy path)

1. File này  
2. `SPONSOR_CHOT_FILL_SHEET.md` §4 UI  
3. Skill nội bộ (máy sponsor): `~/.cursor/skills/xevn-precision-motion-theme/SKILL.md`  
4. Doctrine (nếu có): `_vibe-team-os/17-BRAND-UIUX-THEME-REMASTER.md`  
5. Screenshot thực tế: `docs/qa/evidence/screens/po-hrm-bp-att-deep-qa-01/` (44 PNG — trạng thái **hiện tại**, chưa remaster)  
6. `.cursorrules` mục UI/UX Luxury Style Guide  

---

## 7. Phản hồi sponsor → PM (sau tư vấn)

```text
Ngày nhận tư vấn: 2026-08-05 ~13:37 (chat sponsor điền §3–§4)
File/ghi chú đính kèm: chat + docs/program/prompts/CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md
Quyết định:
☑ Mở wave remaster UI song song giấy — phạm vi: tất cả màn; HTML neo trước Dev-FE; squad song song
☐ Chờ chốt giấy nghiệp vụ xong mới remaster
☐ Chỉ làm brand SoT/ADR trước, chưa đụng apps/**
☑ Khác: B4 cấm AI · B5 Source Sans 3 · S3=A · làm cả 90 ATT · HTML neo → FE squad + lib nếu research chốt
```

### 7.1 Chốt khóa cuối (2026-08-05 ~13:44)

| Lock | Giá trị |
|------|---------|
| B4 | **CÓ — cấm** tím–indigo / cream–terracotta / glow |
| B5 body | **Source Sans 3** |
| S3 | **A** — chrome brand + honesty |
| ATT scope | **Cả 90 surface** (song song batch) |
| Pipeline | HTML neo → modal anatomy → squad FE song song · lib Radix/cmdk/vaul nếu research chốt |
