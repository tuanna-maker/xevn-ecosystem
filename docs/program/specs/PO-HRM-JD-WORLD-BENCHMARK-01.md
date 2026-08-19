# PO-HRM-JD-WORLD-BENCHMARK-01 — Tham khảo JD toàn cầu + map XeVN Group/Pack

| Field | Value |
|-------|--------|
| **Date** | 2026-08-06 |
| **Purpose** | Chuẩn hóa nhóm JD theo thực tiễn LinkedIn · Google Careers · Workday/Greenhouse · TopCV · so với mẫu XeVN IT + lái xe |
| **Consumers** | GROUP-SPEC / GROUP-DATA / GROUP-ARCH · view TopCV-style |
| **Locks** | Option A · Q1 · Q6 · Group→Pack model |

---

## 1. Khung chung các nền tảng / tập đoàn lớn

Hầu hết JD “enterprise-grade” tách **2 lớp**:

| Lớp | Vai trò | Ví dụ |
|-----|---------|--------|
| **Metadata / controlled fields** | Lọc, tìm kiếm, ATS, báo cáo — chọn từ danh mục | Chức danh, địa điểm, hình thức (FT/PT), workplace (onsite/hybrid/remote), cấp bậc, job family, band lương |
| **Narrative sections (nhóm nội dung)** | Đọc bởi ứng viên — heading + bullets | Tóm tắt · Trách nhiệm · Yêu cầu · Ưu tiên · Phúc lợi · Điều kiện làm việc |

Greenhouse/Workday nhấn mạnh: **template + controlled vocab** (job family, level, location) + narrative sections chuẩn — tránh mỗi hiring manager tự bịa cấu trúc.

---

## 2. Ma trận section theo nguồn

| Section (nhóm) | LinkedIn / Textio | Google Careers | Workday / UW template | TopCV (VN) | XeVN IT mẫu | Lái xe logistics |
|----------------|-------------------|----------------|----------------------|------------|-------------|------------------|
| **Job title + meta** (địa điểm, loại HĐ, workplace) | Bắt buộc | Header | Controlled | Có | Header band | Có + ca kíp |
| **About / Role summary** (vì sao role quan trọng) | Có — ngắn | *About the job* | About this Opportunity | Ít / gộp mô tả | Yếu / nhảy thẳng mô tả | Mục tiêu công việc |
| **Responsibilities** (4–8 bullets, outcome) | Core | Responsibilities | Key Responsibilities (± % time) | Mô tả CV | §1 Mô tả | Nhiệm vụ vận hành |
| **Minimum / Required quals** | Core | *Minimum qualifications* | Required / Minimum | Yêu cầu | §2 chung + chuyên môn | Bằng lái, KN |
| **Preferred / Nice-to-have** | Khuyến nghị tách | *Preferred qualifications* | Preferred / Additional | «Ưu tiên» | Fullstack tách rõ | Ưu tiên loại xe/cảng |
| **Compensation & benefits** | Candidate heatmap cao | Thường tách trang / policy | Benefits / pay transparency | **Quyền lợi** nổi | §4 Đãi ngộ | Đãi ngộ + ca |
| **Working conditions** (giờ, địa điểm, physical) | Workplace type | Implicit | Working conditions / Physical | Thời gian & ĐĐ | §3 | Ca, điều động, sức khỏe |
| **About company / team** | Ngắn — link company page | Ngắn trong About | About the Team (optional) | Thường dài ở VN | Ít | Ít |
| **EEO / DEI / Inclusive stmt** | Best practice | Có trên career site | Policy | Ít | Không | Không |
| **Application / docs / visa** | Screening Qs | Apply flow | Application requirements | Nộp CV | Không trong JD Word | Không |
| **Safety / license / ops** | Role-specific | Role-specific | Physical / unusual hours | Ít | Không | **Bắt buộc** |

---

## 3. Bài học thiết kế (áp dụng XeVN)

### 3.1 Tách bắt buộc vs ưu tiên (Google pattern)

Đừng gộp một khối «Yêu cầu». Hai nhóm:

- `SEC_REQ_MIN` — Minimum / bắt buộc  
- `SEC_REQ_PREF` — Preferred / lợi thế  

Fullstack XeVN đã làm đúng hướng; BA/Tester nên cùng pattern.

### 3.2 Role summary ngắn (LinkedIn)

Thêm nhóm `SEC_ABOUT_ROLE` (1 đoạn): impact + team + vì sao hire — **không** viết dài về lịch sử công ty trong JD.

### 3.3 Benefits & meta nổi (heatmap)

- Meta: lương band, địa điểm, workplace, loại HĐ — field controlled (header).  
- `SEC_BENEFITS` — bullets cụ thể (BHXH, phép, thưởng) thay vì chung chung.  
- Pack IT: giờ office; Pack Driver: ca / tăng ca / lệnh điều xe.

### 3.4 Company blurb ngắn

`SEC_ABOUT_COMPANY` = optional hoặc 2–3 câu + link — **không** chiếm nửa JD (LinkedIn heatmap: ứng viên skim qua).

### 3.5 Template theo job family (Greenhouse/Workday)

= **Default Pack** của XeVN:

| Pack | Nhóm luôn có (đề xuất) | Optional kéo |
|------|------------------------|--------------|
| `PACK_IT_OFFICE` | Meta · About role · Responsibilities · Req min · Req pref · Working (office) · Benefits | AI stack · Domain logistics · Growth path |
| `PACK_DRIVER_OPS` | Meta · About/Mục tiêu · Responsibilities ops · Req min (license) · Working (shift) · Safety · Benefits | Container/cảng · Physical · Nhật trình |
| `PACK_CORP_DEFAULT` | Meta · About · Responsibilities · Req min · Working · Benefits | Pref · Company · Growth |

### 3.6 View “TopCV / career-site”

Render thứ tự gợi ý (ứng viên scan):

```text
1 Meta chips (title, loc, salary, type, workplace)
2 About role
3 Responsibilities
4 Requirements (min) → Preferred
5 Working conditions
6 Benefits
7 About company (ngắn) / EEO (optional)
```

Ops/driver: chèn Safety & License sau Requirements hoặc Working.

### 3.7 Không copy nguyên “About Google”

Tập đoàn lớn giữ **cùng skeleton** mọi role; khác ở **nội dung bullets** + vài nhóm chuyên biệt — khớp mô hình Group/Pack.

---

## 4. Catalog nhóm chuẩn đề xuất (Settings)

| code | label (VI) | usage | Ghi chú nguồn |
|------|------------|-------|---------------|
| `SEC_META` | Thông tin đăng tuyển | default_eligible | LinkedIn/TopCV meta |
| `SEC_ABOUT_ROLE` | Giới thiệu vị trí | default_eligible | Google About / LinkedIn summary |
| `SEC_RESPONSIBILITIES` | Mô tả / trách nhiệm | default_eligible | Universal |
| `SEC_REQ_MIN` | Yêu cầu bắt buộc | default_eligible | Google Minimum |
| `SEC_REQ_PREF` | Yêu cầu ưu tiên | default_eligible | Google Preferred |
| `SEC_WORKING` | Thời gian & điều kiện làm việc | default_eligible | TopCV + Workday |
| `SEC_BENEFITS` | Chế độ đãi ngộ | default_eligible | TopCV Quyền lợi |
| `SEC_GROWTH` | Lộ trình phát triển | optional_only | XeVN §4 một phần |
| `SEC_ABOUT_COMPANY` | Về công ty / đội ngũ | optional_only | Ngắn |
| `SEC_LICENSE` | Giấy phép & chứng chỉ | default in DRIVER pack | Driver |
| `SEC_SAFETY` | An toàn & tuân thủ | default in DRIVER pack | Driver / ops |
| `SEC_PHYSICAL` | Yêu cầu thể chất / môi trường | optional / DRIVER | Workday Physical |
| `SEC_EEO` | Cam kết đa dạng & cơ hội bình đẳng | optional_only | Global enterprise |
| `SEC_AI_TOOLS` | Yêu cầu / ưu tiên AI | optional_only | XeVN IT |

---

## 5. Gap so với JD Word XeVN hiện tại

| Gap | Hành động |
|-----|-----------|
| Thiếu *About the role* tách riêng | Thêm group trong PACK_IT |
| Req min/pref chưa đồng nhất mọi JD | Chuẩn hóa 2 group |
| Company quá dài hoặc không có | Optional ngắn |
| Không có EEO | Optional GĐ2 |
| Driver khác hoàn toàn office hours | PACK_DRIVER_OPS riêng |
| View chưa hierarchy TopCV | FE view theo group order §3.6 |

---

## 6. Nguồn tham chiếu (không dán vào SRS khách)

- LinkedIn Talent: job description structure / heatmap / pay transparency  
- Google Careers: About · Responsibilities · Minimum · Preferred  
- Workday / university templates: Essential duties · Min/Pref · Physical · Working conditions  
- Greenhouse pattern: controlled fields + narrative template  
- TopCV: Chức danh · Mô tả · Yêu cầu · Quyền lợi · Địa điểm/thời gian  
- XeVN samples: `_tmp_jd_samples_extract.txt` · GROUP-MODEL-01  

---

## 7. Next for team

BA/SA GROUP wave: **import** catalog §4 + pack §3.5 + view order §3.6 vào SPEC/DATA/ARCH — không hardcode FE.

**SA done (2026-08-06):** imported into [`PO-HRM-JD-GROUP-ARCH-01.md`](./PO-HRM-JD-GROUP-ARCH-01.md) **§12** (meta vs narrative · catalog · packs IT/Driver · FE hierarchy §3.6). Dev **HOLD** until GROUP triad (ARCH+SPEC+DATA) PASS → ba-process / ba-data.  
