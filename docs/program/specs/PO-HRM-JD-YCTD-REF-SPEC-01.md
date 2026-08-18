# PO-HRM-JD-YCTD-REF-SPEC-01 — Tham chiếu JD khi tạo nhu cầu tuyển (spec-first)

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-JD-YCTD-REF-SPEC-01` |
| lane | governance · ba-process |
| change_mode | ADD (delta shallow) · **NO CODE** |
| date | 2026-08-06 |
| SoT khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **v0.9** |
| SoT song song | `docs/hrm/SRS.md` FR-HRM-SC-JT-01 → consumer YCTD UC-HRM-22/30 |
| Arch lock | `PO-HRM-JD-DYNAMIC-ARCH-02.md` **F-YCTD-JD** · FORBIDDEN `job_postings` dual-write |
| Group consumer | `PO-HRM-JD-GROUP-SPEC-01.md` AC-JD-GRP-23 · sequence YCTD chọn JD Hiệu lực |
| honesty | Không claim `jd_dynamic_done` / remaster / face_live · U65 zero-seed |
| ack_status | **PASS_TO_PM** |

---

## 0. Sponsor intent (tóm tắt nghiệp vụ)

Câu hỏi: khi tạo **tin tuyển dụng**, mô tả công việc có **tham chiếu Thư viện JD** không? Chỗ nào có mô tả thì phải chọn được từ danh sách JD.

**Chuẩn quy trình áp dụng:** đọc SRS trước → nếu gap thì SRS ADD → TechSpec / DB / API → mới code. Wave này **không** sửa `apps/**`.

---

## A. Verdict table

| Câu hỏi sponsor | SRS says (cite FR + §) | Product surface đúng | Gap? |
|-----------------|------------------------|----------------------|------|
| Lúc tạo «tin tuyển» có tham chiếu JD không? | MVP **không** có menu tin đăng rời. Nhu cầu tuyển = **YCTD**. YCTD **chọn JD Hiệu lực** từ thư viện — `SRS_HRM_ENTERPRISE.md` MVP § tuyển dụng (4 phần) · **FR-UC-BP-REC-00** Luồng chính #4 + Diễn biến #3 · **FR-UC-BP-REC-00c** Luồng #6 + Diễn biến #6 · **FR-UC-BP-REC-02** Dữ liệu «Tham chiếu JD master» + Luồng chính #1 · **FR-UC-BP-REC-02b** cùng trường | **YCTD** (tab Yêu cầu tuyển / requisitions) — **không** phải `JobPostingsTab` / chiến dịch | **Thuật ngữ:** sponsor nói «tin tuyển dụng»; SRS MVP = **YCTD**. Tin đăng / chiến dịch = **OUT MVP / GĐ2** (**FR-UC-BP-REC-03**) |
| Thư viện JD ở đâu? | **FR-UC-BP-REC-00** (+ 00a catalog · 00b bố cục · 00c form/xem động) — «một nguồn mô tả» cho YCTD; trạng thái Nháp / Hiệu lực / Ngừng | Tab **Thư viện JD** (`job_description_templates`) | Không thiếu FR master |
| Chỗ có mô tả công việc trên nhu cầu tuyển phải picker JD? | REC-00: «chọn JD còn hiệu lực — gắn mã, không bắt copy toàn bộ mô tả». REC-02/02b: trường **Tham chiếu JD master** bắt buộc khi vị trí có mô tả chuẩn | Form **Tạo YCTD** — picker «JD từ thư viện» + `job_template_id` | **SRS lõi: ĐÃ CÓ.** Diễn biến REC-02 **nông** (thiếu bước empty / JD Ngừng / preview / FE sau 2xx) → **shallow ADD** §C dưới đây — **không** invent FR mới |
| «Tin tuyển / job_postings / chiến dịch / Đề xuất ngoài định biên» trong MVP? | §1 MVP: «không menu chiến dịch / tin đăng rời»; **FR-UC-BP-REC-03 OUT/GĐ2**; trạng thái «đã đăng tin» gắn trên **YCTD** | Lane B `job_postings` / `JobPostingsTab` = leftover menu — **FORBIDDEN** dual-write JD SoT (`DYNAMIC-ARCH-02`). Đề xuất ngoài định biên (`HeadcountProposalTab`) cũng bị cấm dual-write JD, bắt buộc chọn `jd_template_id`. | Không mở tin đăng GĐ2 trừ sponsor unlock tường minh |

### Thuật ngữ (khóa)

| Thuật ngữ | Nghĩa SoT |
|-----------|-----------|
| **Thư viện JD** | Master mô tả công việc (`job_description_templates` / FR-UC-BP-REC-00*) |
| **YCTD** | Yêu cầu / đề xuất tuyển — **consumer MVP** gắn soft FK JD |
| **Tin tuyển dụng / job_postings / chiến dịch** | **Không** SoT mô tả MVP; chiến dịch hub đa kênh = **GĐ2**; trạng thái đăng tin (nếu có) nằm trên YCTD đến khi có đối tác API |

---

## B. SRS đã cover — trích dẫn + impl gap (không invent FR)

### B.1 Quotes (spec says)

**FR-UC-BP-REC-00 — Luồng chính #4 / Diễn biến #3**

> Khi tạo YCTD: chọn JD còn hiệu lực — hệ thống gắn mã, không bắt copy toàn bộ mô tả.  
> Diễn biến #3: YCTD chọn JD | JD còn hiệu lực | YCTD gắn mã JD.

**FR-UC-BP-REC-00c — Diễn biến #6 + BR**

> YCTD chỉ chọn JD Hiệu lực; JD Ngừng không chọn cho YCTD mới; lịch sử YCTD cũ vẫn xem được.  
> Diễn biến #6: YCTD chọn JD | JD Hiệu lực | Gắn mã JD (FR-UC-BP-REC-00).

**FR-UC-BP-REC-02 — Dữ liệu + Luồng chính #1**

| Trường | Bắt buộc | Quy tắc |
|--------|----------|---------|
| Tham chiếu JD master | Có khi vị trí có mô tả chuẩn | Lấy từ thư viện mô tả công việc |

> Người tạo … lập YCTD …; **chọn JD master**; khai báo trong định biên + lý do tuyển mới/thay thế.  
> MVP: không bắt buộc entity chiến dịch / tin đăng đa kênh; trạng thái đăng tin nằm trên YCTD.

**FR-UC-BP-REC-02 Diễn biến hiện tại (nông về JD):** hàng 1–5 tập trung ô Cần tuyển / duyệt / BGĐ — **không** liệt kê empty thư viện, chặn JD Ngừng, preview mô tả, AC FE sau 2xx. → §C.

**docs/hrm/SRS.md (song song):** **FR-HRM-SC-JT-01** — Mẫu JD / job templates → consumer **Tạo YCTD** UC-HRM-22/30. Không mâu thuẫn Enterprise REC-00/02.

**ARCH F-YCTD-JD:** soft FK `job_requisitions.job_template_id` → template id; chỉ JD Hiệu lực; **không** copy full `values_json`; logical `job_description_id` = alias của `job_template_id`. FORBIDDEN dual-write JD → `job_postings`.

### B.2 Code does (read-only spot — không sửa)

| Surface | Spec says | Code does | Class |
|---------|-----------|-----------|--------|
| YCTD create | Picker JD Hiệu lực; gắn mã | `JobRequisitionsTab`: bắt buộc `job_template_id`; label «JD từ thư viện *»; empty → hint + CTA «Mở Thư viện JD»; snapshot `job_description`/`requirements` vào YCTD khi chọn template | **Aligned lõi** (picker tồn tại) |
| Chỉ Hiệu lực | REC-00c / BR-BP-JD-01 | Options map từ `effectiveTemplates` — **chưa thấy filter `is_active`/Hiệu lực tường minh** trên picker; BE create requisition **chưa thấy** gate `HRM-JD-YCTD-STATUS` khi bind retired | **Impl gap** (sau confirm SRS shallow + sponsor) — **không** mở FR mới |
| Snapshot vs soft FK | REC-00 «không bắt copy toàn bộ»; ARCH «không copy full `values_json`» | FE chép mô tả/yêu cầu cổ điển vào YCTD (bản snapshot chỉnh được) + lưu `job_template_id` | **Hợp lệ ADD** nếu giữ soft FK SoT; cấm biến YCTD thành SoT động thay templates |
| JobPostingsTab | Không phải consumer mô tả MVP | Tab/API Lane B còn; ARCH FORBIDDEN dùng làm JD SoT | **Không** coi là chỗ «tham chiếu JD» cho nghiệm thu MVP |
| DB | `job_template_id` trên YCTD | `job_requisitions.job_template_id` (TEXT soft FK); ensureSchema ADD COLUMN | Aligned ARCH §3.5 |

### B.3 FE/UX gaps = impl (sau ba-docs merge + sponsor confirm thuật ngữ)

1. **P0 terminology UX** — UI/HDSD còn chữ «tin tuyển / Job posting» lẫn với YCTD → dễ hiểu sai SoT (governance copy / ba-docs + FE label sau confirm).  
2. **P1 status gate** — picker + BE chỉ cho JD Hiệu lực (`is_active` / status active); JD Ngừng → chặn YCTD mới; lịch sử vẫn xem.  
3. **P2 preview** — sau chọn JD: hiện preview tiêu đề + mô tả ngắn từ template/snapshot trước Lưu.  
4. **P3** — không dual-write / không hướng user tạo mô tả trên `job_postings` thay thư viện.

`next_owner` sau confirm: **ba-docs** (merge §C) → **pm** hold Dev; Dev-FE/BE chỉ khi sponsor confirm và shallow merge xong — **không** claim lane dynamic DONE.

---

## C. SRS ADD delta (shallow) — FR-UC-BP-REC-02 · không wipe stub

> **Flag:** cần **sponsor CONFIRM** (thuật ngữ YCTD ≠ tin đăng GĐ2 + chấp nhận enrich Diễn biến) trước khi ba-docs merge vào `SRS_HRM_ENTERPRISE.md`.  
> **no_prompt_echo** trên bản khách.  
> **Không** xóa/đè các mục FR-UC-BP-REC-02 hiện có — chỉ **APPEND** khối dưới sau bảng Diễn biến hiện tại (hoặc thay thế bảng Diễn biến bằng bản mở rộng giữ đủ hàng cũ).

### C.1 Mục đích bổ sung (không đổi Mục đích FR)

Làm rõ trên form YCTD trong định biên: người dùng **chọn** JD từ Thư viện (Hiệu lực), xem trước mô tả, gắn mã; không nhập mô tả tự do thay master khi pháp nhân đã có JD chuẩn.

### C.2 sequenceDiagram (ADD — nhánh JD trên YCTD)

```mermaid
sequenceDiagram
  autonumber
  actor TP as Trưởng bộ phận
  actor HR as HCNS
  participant YCTD as Form YCTD
  participant Lib as Thư viện JD

  TP->>YCTD: Mở tạo YCTD từ ô Cần tuyển
  YCTD->>Lib: Tải danh sách JD Hiệu lực đúng pháp nhân
  alt Thư viện trống
    Lib-->>YCTD: Danh sách rỗng
    YCTD-->>TP: Empty rõ + hướng mở Thư viện JD — không cho Lưu thiếu tham chiếu
  else Có JD Hiệu lực
    TP->>YCTD: Chọn một JD Hiệu lực
    YCTD-->>TP: Xem trước tiêu đề và mô tả từ bản JD đã chọn
    alt Chọn JD Ngừng hoặc ngoài phạm vi
      YCTD-->>TP: Chặn chọn — yêu cầu JD Hiệu lực
    else Hợp lệ
      TP->>YCTD: Điền số lượng · lý do tuyển · Gửi duyệt
      alt Thiếu JD khi vị trí bắt buộc mô tả chuẩn
        YCTD-->>TP: Từ chối gửi — giữ form
      else Đủ điều kiện
        YCTD->>HR: Chờ duyệt tối thiểu
        HR->>YCTD: Duyệt
        YCTD-->>TP: Thành công — danh sách cập nhật; tải lại vẫn còn mã JD gắn YCTD
      end
    end
  end
```

### C.3 Diễn biến 4 cột — ADD hàng JD (giữ hàng duyệt cũ)

| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |
|---|-----------|---------------------|------------------|
| 1 | Chọn ô Cần tuyển | Định biên đã duyệt | Form YCTD trong kế hoạch |
| 1a | Mở picker JD | Đúng pháp nhân | Chỉ liệt kê JD **Hiệu lực** |
| 1b | Thư viện trống | Chưa có JD Hiệu lực | Empty + CTA mở Thư viện; **không** Lưu/Gửi khi thiếu tham chiếu bắt buộc |
| 1c | Chọn JD | JD Hiệu lực | Gắn mã JD; hiện preview mô tả từ bản đã chọn (không bắt nhập lại toàn bộ trường động) |
| 1d | Thử chọn JD Ngừng | BR-BP-JD-01 | Chặn; thông báo rõ |
| 2 | Gửi duyệt | BR-BP-HC-05; đủ cờ trong ĐB + lý do tuyển + JD khi bắt buộc | Ma trận rút gọn theo cấu hình |
| 3 | Duyệt tối thiểu | Đúng cấp cấu hình | YCTD đã duyệt; mang `mã JD` |
| 4 | Từ chối | Có lý do | Trả về chỉnh sửa; mã JD giữ trên bản nháp nếu đã chọn |
| 5 | Policy bắt BGĐ | Q-REC-HEADCOUNT đã chốt | Áp cấu hình pháp nhân / XBOS |
| Thành công | — | — | Người dùng thấy YCTD trên danh sách kèm tham chiếu JD; tải lại còn; sẵn sàng nhận hồ sơ; UC kế = kho CV / inventory ứng viên |

**Cân bằng (ước lượng bảng trên):** happy #1,#1a,#1c,#2,#3,Thành công ≥40%; fail sâu #1b,#1d,#4 + giữ nhánh vượt ô/ĐB chưa duyệt từ bảng đặc biệt hiện hữu ≥30%.

### C.4 BR ADD (pointer — không invent mã lệch spine)

| BR | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-BP-JD-01 (spine) | Tạo/sửa YCTD mới cần mô tả chuẩn | Chỉ cho chọn JD Hiệu lực | Gắn mã; chặn Ngừng |
| BR-BP-HC-05 | Trong định biên | Không dùng luồng ngoài ĐB | Giữ nguyên |
| BR-YCTD-JD-REF-01 (ADD đề xuất) | Vị trí có mô tả chuẩn trên pháp nhân | Bắt buộc `Tham chiếu JD master` trước Gửi duyệt | Thiếu → từ chối giữ form |
| BR-YCTD-JD-REF-02 (ADD đề xuất) | Sau chọn JD | Cho chỉnh bản chép mô tả ngắn trên YCTD **không** đổi SoT thư viện | Soft FK vẫn trỏ mã JD |

### C.5 AC FE sau 2xx (browser · U65)

| ID | Tiêu chí | Pass | Fail |
|----|----------|------|------|
| AC-YCTD-JD-01 | Tạo YCTD: chọn JD Hiệu lực → Lưu/Gửi | Network **2xx**; hàng list hiện mã/tiêu đề JD; F5 còn | 2xx mà UI không gắn JD |
| AC-YCTD-JD-02 | Thư viện trống | Empty + CTA; không success giả | Cho Lưu không JD khi bắt buộc |
| AC-YCTD-JD-03 | JD Ngừng không chọn được cho YCTD mới | Chặn FE và/hoặc **4xx** BE | Gắn được JD Ngừng |
| AC-YCTD-JD-04 | Preview sau chọn | Thấy tiêu đề + đoạn mô tả trước submit | Form trống mô tả sau chọn |
| AC-YCTD-JD-05 | Không dùng job_postings làm nguồn JD | Picker chỉ từ thư viện templates | Dual-write / chọn từ tin đăng |
| AC-YCTD-JD-06 | Cross-nav J-* | Từ YCTD → mở Thư viện / xem JD gắn | 404 scope / sai pháp nhân |

**Đề xuất journey:** `J-HRM-JD-YCTD-01` — Login → Tuyển dụng → Thư viện (có ≥1 Hiệu lực từ FE) → Yêu cầu → Thêm → chọn JD → Lưu → F5 → còn tham chiếu (U65, zero-seed).

### C.6 FR-UC-BP-REC-02b

Áp dụng **cùng** hàng 1a–1d + AC-YCTD-JD-* (tham chiếu JD master đã có trên Dữ liệu đầu vào). Không mở FR mới.

### C.7 Không làm trong delta này

- Wipe stub REC-02/02b/00*  
- Mở FR chiến dịch / tin đăng đa kênh (REC-03)  
- Claim product remaster / face / jd_dynamic_done  
- Sửa `apps/**`

---

## D. Cascade plan (no code this wave)

```
SRS confirm (sponsor) → ba-docs merge §C → TechSpec ref_srs → DB_DESIGN → API_DESIGN → test plan → Dev-FE/BE → QA browser U65
```

| Bước | work_item_id (đề xuất) | Owner | Exit |
|------|------------------------|-------|------|
| Sponsor confirm thuật ngữ + shallow ADD | `PO-HRM-JD-YCTD-REF-CONFIRM-01` | pm → sponsor | CONFIRM / chỉnh wording |
| Merge SRS khách (no_prompt_echo) | `PO-HRM-JD-YCTD-REF-BA-DOCS-01` | ba-docs | REC-02/02b Diễn biến+AC trong `SRS_HRM_ENTERPRISE.md`; version bump DOC-DELTA |
| TechSpec ref_srs (F-YCTD-JD depth) | `PO-HRM-JD-YCTD-REF-TECHSPEC-01` | sa | API map bước Diễn biến 1a–1d; must_keep soft FK; FORBIDDEN job_postings |
| DB_DESIGN | `PO-HRM-JD-YCTD-REF-DB-01` | ba-data / sa | Confirm `job_requisitions.job_template_id`; không invent cột SoT song song |
| API_DESIGN | `PO-HRM-JD-YCTD-REF-API-01` | sa | Create/Update requisition: validate JD Hiệu lực; mã lỗi ổn định; scope_parity |
| Unit / browser plan | `PO-HRM-JD-YCTD-REF-QA-PLAN-01` | qa | Map AC-YCTD-JD-01..06 + J-HRM-JD-YCTD-01 |
| Dev FE picker gate + preview | `PO-HRM-JD-YCTD-REF-FE-01` | dev-fe | Chỉ sau confirm+spec cascade |
| Dev BE status gate | `PO-HRM-JD-YCTD-REF-BE-01` | dev-be | `HRM-JD-YCTD-STATUS` (hoặc mã đã có) khi bind retired |

---

## E. Honesty / locks

- Không claim `jd_dynamic_done` / remaster / face_live / product GO.  
- **U65** zero-seed — nghiệm thu từ FE.  
- **FORBIDDEN** dual-write `job_postings` làm JD SoT trừ khi sponsor **explicit** mở tin đăng GĐ2.  
- Soft FK YCTD → templates **must_keep**; snapshot mô tả cổ điển trên YCTD ≠ SoT động `values_json`.  
- Wave này: **governance only** — evidence + draft delta; **chưa** merge file khách cho đến ba-docs sau CONFIRM.

---

## F. Open questions (cho sponsor — không block đọc SRS)

| # | Câu hỏi | Default đề xuất nếu im lặng |
|---|---------|------------------------------|
| Q1 | «Tin tuyển dụng» trên UI hiện tại = đổi nhãn về **Yêu cầu tuyển (YCTD)** hay giữ alias? | Đổi nhãn / HDSD về YCTD; ẩn hoặc đánh dấu GĐ2 `JobPostingsTab` |
| Q2 | Snapshot mô tả trên YCTD được chỉnh sau chọn JD — có cần đồng bộ ngược thư viện? | **Không** — one-way snapshot; SoT vẫn thư viện |
| Q3 | Khi vị trí chưa có JD chuẩn — cho free-text tạm hay bắt buộc tạo JD trước? | REC-02: bắt buộc khi «vị trí có mô tả chuẩn»; empty library → CTA tạo JD trước |

---

## Completion

| Field | Value |
|-------|--------|
| evidence_path | `docs/program/specs/PO-HRM-JD-YCTD-REF-SPEC-01.md` |
| completion_report | SRS MVP **đã** mô tả YCTD tham chiếu Thư viện JD (REC-00/00c/02/02b). «Tin tuyển / chiến dịch» = OUT MVP. Shallow Diễn biến REC-02 drafted §C — chờ sponsor CONFIRM rồi ba-docs merge. Impl gap: filter Hiệu lực + BE gate + preview. No `apps/**`. |
| next_owner | **pm** (sponsor confirm) → **ba-docs** merge |
| ack_status | **PASS_TO_PM** |
