# E2E 13 bước — Tuyển dụng IT (XBOS cấu hình → thành viên → HRM thực thi)

**Program:** `P-REC-E2E-13STEP-01`  
**Work items:** `QA-REC-E2E-13STEP-01` → `QC-REC-E2E-13STEP-01`  
**Ngày:** 2026-08-01  
**U65:** **cấm seed** · **cấm API mutate riêng** · chỉ login → menu → nhập → Lưu/Gửi/Duyệt trên FE · quan sát FE sau 2xx + F5  
**U76:** **Bám HDSD** — đúng menu/màn/nút/function như hướng dẫn sử dụng; inventory HDSD trong menu Tuyển dụng phải được cover (hoặc 🟡 product_gap). Rule: `.cursor/rules/qa-hdsd-aligned-browser-test.mdc`  
**Mục tiêu PM lesson:** Định nghĩa luồng nghiệp vụ chính → map màn/UC → kịch bản FE-only **khớp HDSD** → QA/QC bắt team chạy → đối chiếu SRS/TechSpec/FE/BE/HDSD (gap = honest 🟡/🔴, không fake 🟢)

---

## 0. Bối cảnh & persona

| Mục | Giá trị |
|-----|---------|
| URL nghiệm thu ưu tiên | http://14.225.217.232:8088 (server-dev) — fallback local http://127.0.0.1:5173 |
| HRM embed | `:8080` hoặc tab Command Center **Tuyển dụng** `/command-center/hrm/recruitment` |
| Group CEO | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` (rollup) |
| Member CEO (áp dụng ĐVTV) | `du-lich.ceo@xe.vn` / `Xevn@2026` (expect scope hẹp) |
| Vị trí mẫu | **Backend NestJS / HRM-API** (IT) |
| SoT journey đã có | `J-REC-WF-01..06` · `J-HRM-05` · `UF-HRM-12` · `PROGRAM_JOURNEY_MAP.md` |
| Spec neo | `docs/hrm/SRS.md` UC-HRM-22 / UC-HRM-30 / UC-HRM-INT-01 · FR-HRM-SC-JT-01 / FR-HRM-SC-CH-01 · bridge REC-WF |

**Verdict vocabulary**

| Ký hiệu | Nghĩa |
|---------|--------|
| 🟢 | Đủ chuỗi FE + Network 2xx + F5 + AC nghiệp vụ |
| 🟡 | BLOCKED / partial — màn thiếu, SPAWN-MISSING, scope, hoặc AC ngoài product |
| 🔴 | Có màn nhưng lỗi (4xx/5xx, Vite, FE không đổi sau 2xx) |
| ⬜ | Ngoài scope wave / không chạy được vì phụ thuộc bước trước FAIL |

Mỗi bước **bắt buộc** block evidence mẫu U63 (persona, URL, click path, trước/sau mutate, Network, F5, spec_ref, spec_gap).

---

## 1. Map 13 bước nghiệp vụ → hệ sinh thái XeVN

> Cột **Product today** = quan sát/code path hiện có. QA **không** bịa PASS nếu chỉ có mock/static.

| # | Bước nghiệp vụ (PM) | XBOS (tập đoàn) | HRM (thực thi) | UC / J-* | Product today (ước lượng) |
|---|---------------------|-----------------|----------------|----------|---------------------------|
| **S0** | Cấu hình QT tuyển dụng holding | Admin → **Workflow canvas** → definition `hrm_recruitment_*` → Lưu active | — | **J-REC-WF-01** · UC-HRM-REC-WF-01 | ✅ Canvas + save (đã PASS lịch sử) |
| **S0b** | Apply QT / catalog sang ĐVTV | Publish/pull catalog + (nếu có) apply-to-members | Settings catalog sync / job templates pull | FR-HRM-SC-* · XBOS publish | ⚠ **apply-to-members** từng ghi ABSENT (G-BM-03) — QA xác nhận lại honest |
| **S1** | Kế hoạch HC / đề xuất định biên | (ngân sách có thể XBOS/finance — nếu không có = gap) | Tab **Đề xuất** / **Kế hoạch** (`proposals` / `plans`) | UC-HRM-30 | ⚠ Kiểm tra API vs mock trong page |
| **S2** | Nhu cầu & YCTD | Inbox duyệt nếu spawn WF | Tab **Yêu cầu tuyển dụng** → Tạo → Gửi duyệt | **UF-HRM-12** · **J-REC-WF-02/03** | ✅ Requisition + spawn/inbox bridge |
| **S3** | JD / cấp bậc / band | Catalog chức danh / grade (XBOS→HRM) | **Thư viện JD** + gắn YCTD; band trên form | FR-HRM-SC-JT-01 · FR-HRM-SC-POS-01 | ✅ Job templates + requisition |
| **S4** | Nguồn & đăng tin | `recruitment_channels` catalog | Tab **Tin tuyển dụng** + **Chiến dịch** | FR-HRM-SC-CH-01 | ✅ jobs + campaigns |
| **S5** | Sàng CV & shortlist | — | Tab **Ứng viên** / kanban screening | J-HRM-05 · J-REC-WF-04 | ✅ Candidates + stages |
| **S6** | Phỏng vấn đa vòng | Bước WF map interview (nếu có) | Tab **Phỏng vấn** + Schedule dialog | UC-HRM-30 | ✅ InterviewsTab |
| **S7** | Đánh giá / reference | — | Tab **Đánh giá** / evaluation dialog | UC-HRM-30 | ✅ evaluations |
| **S8** | Offer & đàm phán | — | Stage **offer** trên kanban / candidate | funnel offer | ⚠ Xác nhận có form offer hay chỉ stage chip |
| **S9** | Pre-boarding | — | Link NV / tạo hồ sơ trước Day 1 | UC-HRM-INT-01 | ⚠ hired + `employeeId` picker |
| **S10** | Onboarding 30/60/90 | — | ? checklist / probation plan | — | 🔴 **Gap lớn** nếu không có màn |
| **S11** | Probation & đóng vòng | — | Hợp đồng TV→CT · YCTD `filled` | UC-HRM-INT-01 | ⚠ contracts + requisition filled |

**Chuỗi bắt buộc không đứt (happy path tối thiểu để “có nghiệp vụ”):**  
`S0 → S2 (duyệt) → S3 → S4 → S5 → S6 → S7 → S8 → S9 (hired+employee)`  
S0b / S1 / S10 / S11: chạy tối đa trên FE; thiếu màn = 🟡 + `spec_gap` / `product_gap` (không seed để giả).

---

## 2. Kịch bản test chi tiết (13 bước)

### Preconditions (L0 — không thay cho UF)
1. Portal + HRM API + XBOS API sống (`qc:dev-stack` / fe-be health) — QA ghi phụ, **không** 🟢 bước nghiệp vụ chỉ vì L0.
2. Không chạy `pnpm seed:*`, không POST API ngoài UI, không ghi DB.
3. Nếu Inbox trống ở S2: **không seed inbox** — phải tạo nguồn từ FE (plan/YCTD Gửi duyệt) theo U65.

---

### S0 — XBOS: cấu hình quy trình tuyển dụng (holding)

| | |
|--|--|
| **Persona** | `ceo@xe.vn` |
| **URL / menu** | Command Center → **Admin / Workflow** (canvas) — đúng route product đang dùng cho J-REC-WF-01 |
| **Thao tác** | Mở definition liên quan tuyển dụng (`hrm_recruitment_*` hoặc tên VI tương đương) → chỉnh/ xác nhận các bước: đề xuất/YCTD → duyệt → screening → interview → offer → hired → **Lưu** / Active |
| **AC PASS** | Reload canvas → definition còn; Network save **2xx**; không mất graph |
| **spec_ref** | J-REC-WF-01 · UC-HRM-REC-WF-01 · AC-REC-WF-01 |
| **Evidence** | Screenshot canvas + Network |

---

### S0b — Apply / publish xuống công ty thành viên

| | |
|--|--|
| **Persona** | Group CEO rồi (nếu có UI) Member CEO |
| **Thao tác A** | XBOS: publish catalog liên quan (chức danh / kênh TD / JD template) nếu có nút Publish |
| **Thao tác B** | HRM Settings / catalog-sync: **Pull** hoặc mở picker thấy item mới trên scope ĐVTV |
| **Thao tác C** | Nếu UI **Apply workflow to members** tồn tại → chọn 1 slug thành viên (vd. du lịch) → Lưu |
| **AC PASS** | Member scope thấy catalog/WF áp dụng; F5 còn |
| **AC 🟡** | Không có apply-to-members → ghi **product_gap G-BM-03**; vẫn tiếp S1/S2 trên `main` nếu rollup cho phép |
| **cấm** | Seed catalog / SQL sync giả |

---

### S1 — Kế hoạch tuyển dụng / đề xuất định biên

| | |
|--|--|
| **Menu HRM** | Tuyển dụng → tab **Đề xuất** (`proposals`) và/hoặc **Kế hoạch** (`plans`) |
| **Thao tác** | Tạo đề xuất HC phòng **Kỹ thuật / IT** · vị trí Backend · số lượng 1 · kỳ quý hiện tại → **Lưu** / **Gửi** |
| **AC PASS** | Row xuất hiện · POST/PUT **2xx** · F5 còn · không banner Sync ERROR |
| **AC 🟡** | Tab chỉ mock static / không API → `product_gap` + không claim HC planning DONE |
| **Data gợi ý** | Tiêu đề: `Đề xuất HC Backend NestJS Q3/2026 — {timestamp}` |

---

### S2 — Nhu cầu & YCTD (+ duyệt WF)

| | |
|--|--|
| **Menu** | Tuyển dụng → **Yêu cầu tuyển dụng** |
| **Thao tác** | **Thêm** YCTD: công ty (main hoặc ĐVTV đã apply) · phòng ban · chức danh catalog · số lượng 1 · band lương · JD template (nếu bắt buộc) → Lưu → **Gửi duyệt** (nếu có) |
| **Bridge** | Quan sát spawn WF / banner `SPAWN-MISSING` (J-REC-WF-02) |
| **Duyệt** | XBOS **Inbox** → task tuyển dụng → **Duyệt** (J-REC-WF-03) — **cấm** seed inbox |
| **AC PASS** | YCTD status tiến (vd. Đang tuyển) · F5 · Inbox task biến mất sau duyệt · HRM sync |
| **UF/J** | UF-HRM-12 · J-REC-WF-02 · J-REC-WF-03 |

---

### S3 — JD / cấp bậc / band

| | |
|--|--|
| **Menu** | **Thư viện JD** → tạo/chọn mẫu Backend Nest · gắn YCTD |
| **Thao tác** | Điền Purpose / trách nhiệm / yêu cầu TS-Nest-Postgres · band min–max (vi-VN grouping) → Lưu |
| **AC PASS** | Template persist · YCTD chọn được JD · F5 |
| **spec_ref** | FR-HRM-SC-JT-01 · AC-HRM-PICKER-01 (không free-text SoT chức danh) |

---

### S4 — Nguồn & đăng tin

| | |
|--|--|
| **Menu** | **Tin tuyển dụng** + **Chiến dịch** |
| **Thao tác** | Tạo tin từ YCTD/JD · chọn **kênh** catalog (LinkedIn/TopCV/Referral…) · hạn nộp · **Đăng** / Active |
| **Optional** | Tạo chiến dịch gắn tin |
| **AC PASS** | POST tin **2xx** · list Active · F5 · kênh = catalog không free-text SoT |
| **spec_ref** | FR-HRM-SC-CH-01 |

---

### S5 — Sàng CV & shortlist

| | |
|--|--|
| **Menu** | **Ứng viên** → Thêm ứng viên (FE form) gắn tin/YCTD |
| **Data** | Họ tên thật kiểu XEVN · email unique `it.be.{ts}@example.vn` · nguồn = kênh S4 · stage **new** → chuyển **screening** (kanban hoặc action) |
| **AC PASS** | Candidate row · stage đổi · Network 2xx · F5 · roadmap/chip nếu có (J-REC-WF-04) |
| **cấm** | Import file seed giả hàng loạt để “có data” nếu AC yêu cầu nhập tay 1 UV |

---

### S6 — Phỏng vấn đa vòng

| | |
|--|--|
| **Menu** | **Phỏng vấn** → Schedule · hoặc từ candidate detail |
| **Thao tác** | Tạo lịch vòng 1 (Technical) · interviewer · ngày giờ `dd/MM/yyyy HH:mm` → Lưu → (nếu có) đánh dấu hoàn thành → tạo vòng 2 (HM) |
| **AC PASS** | Lịch hiện tab Scheduled/Completed · candidate stage **interview** · F5 |
| **AC 🟡** | Chỉ 1 vòng được hỗ trợ → ghi residual “multi-round partial” |

---

### S7 — Đánh giá / reference

| | |
|--|--|
| **Menu** | **Đánh giá** hoặc dialog đánh giá trên candidate |
| **Thao tác** | Chấm scorecard (1–5 theo tiêu chí) · nhận xét · Lưu · (nếu có field reference — điền) |
| **AC PASS** | Evaluation persist · so sánh ứng viên nếu mở được · F5 |
| **AC 🟡** | Không có reference check UI → ghi gap (không fail cả E2E nếu đánh giá nội bộ PASS) |

---

### S8 — Offer & đàm phán

| | |
|--|--|
| **Thao tác** | Chuyển stage **offer** · nếu có form offer: lương thử việc/chính thức · ngày join · gửi/xác nhận |
| **AC PASS** | Stage offer + payload 2xx · F5 |
| **AC 🟡** | Chỉ kéo kanban không có form lương → partial · residual BA |

---

### S9 — Pre-boarding / hire → employee

| | |
|--|--|
| **Thao tác** | Stage **hired** · picker **liên kết nhân viên** (FR-HRM-INT-01) — tạo NV mới từ FE Employees nếu picker yêu cầu ID có sẵn: **Employees → Thêm NV** (FE) rồi quay lại gắn |
| **AC PASS** | `employee_id` NOT NULL · YCTD tiến tới filled/closed nếu product hỗ trợ · F5 cả 2 phía |
| **spec_ref** | UC-HRM-INT-01 |
| **cấm** | Tạo NV bằng API/SQL |

---

### S10 — Onboarding 30/60/90

| | |
|--|--|
| **Thao tác** | Tìm màn checklist onboard / mục tiêu 30-60-90 / buddy trên HRM hoặc portal |
| **AC PASS** | Có thể tạo & cập nhật mốc 30/60/90 trên FE |
| **AC 🟡 mặc định kỳ vọng** | **Product gap** nếu không có — QA ghi rõ path đã tìm (menu nào) · **không** bịa PASS |

---

### S11 — Probation & đóng vòng

| | |
|--|--|
| **Thao tác** | Hợp đồng/TV: chuyển thử việc → chính thức (nếu có UI) · xác nhận YCTD **filled** · dashboard funnel cập nhật (J-REC-WF-05) |
| **AC PASS** | Trạng thái HĐ + requisition + funnel nhất quán sau F5 |
| **Reject path (optional cùng session nếu thời gian)** | Một YCTD/UV khác → Inbox **Từ chối** (J-REC-WF-06) — không đụng UV hired |

---

## 3. Bảng tổng hợp bắt buộc trong evidence QA

| Step | Verdict | URL | Click path | Network | F5 | spec_ref | gap |
|------|---------|-----|------------|---------|-----|----------|-----|
| S0 | | | | | | J-REC-WF-01 | |
| S0b | | | | | | FR-HRM-SC / G-BM-03 | |
| S1 | | | | | | UC-HRM-30 plans | |
| S2 | | | | | | UF-HRM-12 · J-REC-WF-02/03 | |
| S3 | | | | | | FR-HRM-SC-JT-01 | |
| S4 | | | | | | FR-HRM-SC-CH-01 | |
| S5 | | | | | | J-HRM-05 · J-REC-WF-04 | |
| S6 | | | | | | UC-HRM-30 interview | |
| S7 | | | | | | evaluations | |
| S8 | | | | | | offer stage | |
| S9 | | | | | | UC-HRM-INT-01 | |
| S10 | | | | | | onboard | |
| S11 | | | | | | filled · J-REC-WF-05 | |

**Gate đóng wave**

- Happy path **S0 + S2→S9** không 🔴 mới được đề xuất QC GO/GWC.  
- S1/S0b/S10/S11 🟡 gap **không** chặn GWC nếu đã ghi residual + owner.  
- Mọi 🔴 trên S2–S9 → FAIL_TO_PM + dispatch Dev đúng lane.

**Evidence path:** `docs/qa/evidence/qa-rec-e2e-13step-01-20260801.md`

---

## 3b. Baseline product (explore 2026-08-01 — [Explore XBOS WF + HRM recruit](01cd2840-de0d-488a-8fd1-387739df25a4))

QA dùng bảng này để **kỳ vọng honest** — không fail 🔴 chỉ vì gap đã biết; ghi 🟡 `product_gap` / `G-INT-01`.

| Vùng | Implementable today | Gap / residual |
|------|---------------------|----------------|
| XBOS canvas `hrm_recruitment_*` · Inbox duyệt | ✅ J-REC-WF-01..06 | — |
| Catalog publish → HRM pull | ✅ J-XBOS-02 · UF-HRM-10 · keys `hrm_catalog_apply_members` | Xác nhận apply-members trên FE |
| YCTD · JD · Tin · Ứng viên · PV · đánh giá | ✅ UF-HRM-12 · J-HRM-05 · UC-HRM-22/30 | G-RC-02/03 polish |
| Stage `offer` | ✅ chip/kanban | **Không** có màn offer letter / compensation offer |
| Hire → employee | ⚠ soft `employee_id` picker | **G-INT-01** — không auto create NV + req `filled` |
| Pre-boarding · 30/60/90 · probation close (REC) | ❌ | S9 partial · **S10/S11 🟡 mặc định** |
| CC click path | `/command-center` → settings catalog / `workflow` / Inbox · embed `/command-center/hrm/recruitment` | Portal :8088 hoặc :5175 |
| Persona phụ | `du-lich.hr@xe.vn` (HRBP) ngoài Group/Member CEO | Optional S0b/S2 |

---

## 3c. HDSD coverage (U76 — bắt buộc)

Trước/trong mỗi lần QA chạy module **Tuyển dụng** (và mọi module khác):

1. Đọc HDSD client (HTML/PDF hoặc inventory BA) — **không** đoán menu.
2. Điền bảng dưới (mọi hàng HDSD liệt kê):

| HDSD ref (§/FIG) | Menu | Màn / tab (label VI) | Nút / function | Click path FE | Verdict | Gap |
|------------------|------|----------------------|----------------|---------------|---------|-----|
| | Tuyển dụng | Dashboard | … | | | |
| | | Yêu cầu tuyển dụng | Thêm / Sửa / Gửi duyệt… | | | |
| | | Thư viện JD | … | | | |
| | | Tin tuyển dụng | … | | | |
| | | Ứng viên (+ submenu) | … | | | |
| | | Đề xuất | … | | | |
| | | Chiến dịch | … | | | |
| | | Phỏng vấn (+ submenu) | … | | | |
| | | Đánh giá | … | | | |
| | | Kế hoạch | … | | | |
| | | Báo cáo | … | | | |

3. Work item inventory: `BA-HDSD-REC-INVENTORY-01` → rồi `QA-REC-HDSD-COVERAGE-01`.
4. QC từ chối clean GO nếu thiếu bảng này hoặc click lệch HDSD.

---

## 4. QC audit (sau QA)

- Đọc từng dòng bảng 13 bước — từ chối GO nếu QA PASS mà thiếu Network/F5 hoặc có dấu seed.  
- Đối chiếu SRS/TechSpec: mỗi 🟡 gap phải có `spec_gap` hoặc `product_gap`.  
- must_keep: không demote UF-HRM-12 / J-HRM-05 / J-REC-WF-* 🟢 lịch sử nếu không regression bằng chứng.  
- Evidence: `docs/qa/evidence/qc-rec-e2e-13step-01-20260801.md`

---

## 5. Lesson cho PM sau này (rút gọn)

1. Viết **luồng nghiệp vụ ngoài đời** trước (13 bước).  
2. Map **XBOS (cấu hình/publish)** vs **HRM (thực thi)** — không chỉ 1 app.  
3. Gắn **J-*** / **UF-*** / **UC** trước khi dispatch.  
4. Kịch bản FE-only U65 — gap = 🟡, không seed cho đẹp.  
5. QA chạy full chuỗi → QC audit → residual → Dev — rồi mới nói “làm được vậy chưa”.
