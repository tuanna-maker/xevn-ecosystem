# UC Inventory — HRM BRD ↔ SRS (freeze W1 + cập nhật W2a/W2b/W2c/W2d)

**work_item:** `BA-HRM-SRS-BATECO-W2D-LEFTOVER-01` (sau W2c / W2b / W2a / W1)  
**Ngày khóa W1:** 2026-07-21 · **Cập nhật W2a/W2b/W2c:** 2026-07-21 · **W2d:** 2026-07-22  
**SoT catalog UC:** `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` (**120** UC)  
**SoT Yêu cầu:** `docs/hrm/BRD.md` §7.1 · bảng §5 dưới đây  
**SoT SRS khách:** `docs/client-delivery/hrm/SRS_HRM_KHACH.md` (v3.0-W2d)  
**SoT BRD khách:** `docs/client-delivery/hrm/BRD_HRM_KHACH.md`  
**Team annex:** `docs/hrm/SRS.md` · `docs/hrm/BRD.md` (giữ AC-ATT-SHEET / path kỹ thuật)  
**Chuẩn OS:** `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` §3.4.8  
**Program:** `docs/program/HRM_SPEC_REMASTER_BATECO_PROGRAM.md`

## 1. Quyết định SoT path (W1a — giữ)

| Bản | Path | Vai trò |
|-----|------|---------|
| **Khách** | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` · `SRS_HRM_KHACH.md` | Gửi đối tác — Bateco Ch.1–6, không HTTP/jargon Dev |
| **Đội ngũ** | `docs/hrm/BRD.md` · `docs/hrm/SRS.md` | Annex kỹ thuật; **cấm wipe** AC-ATT-SHEET-01..06 |

## 2. Nguồn đếm

| Nguồn | Số / ghi chú |
|-------|----------------|
| Yêu cầu-N | **30** (Yêu cầu-01..30) — **không giảm** |
| Catalog UC | **120** — **không giảm** |
| FR khách đủ 7 mục + Kết quả trả về | **52** (W1: 8 + W2a: 12 + W2b: 12 + W2c: 12 + W2d: 8) |
| AC bảng công | AC-ATT-SHEET-01..06 — **giữ** trên FR-HRM-AT-14 + team SRS |

## 3. Skeleton SRS khách vs Bateco (§3.4.8.A)

| Chương | `SRS_HRM_KHACH.md` | Verdict |
|--------|--------------------|---------|
| 1 Giới thiệu | Có trong body | **PASS** |
| 2 Tổng quan + E2E spine bảng | §2.4 + §2.4.5–2.4.8 | **PASS** |
| 3 Catalog FR đồng nhất | **52** FR (W1+W2a+W2b+W2c+W2d) | **PASS** (batch); catalog đầy đủ 120 = đợt sau |
| 4 NFR | §4 | **PASS** |
| 5 Giao diện ngoài | §5 | **PASS** |
| 6 Ràng buộc tổng quát | §6 | **PASS** |

## 4. Định nghĩa status

| status | Nghĩa |
|--------|--------|
| **body_ready** | Có FR 7 mục + Kết quả trả về trên SoT khách **hoặc** NFR/ràng buộc đã khóa |
| **planned_W2** | Map primary đủ; thiếu FR đồng nhất trên bản khách (sau W2d = **0** Yêu cầu-N) |

## 5. Inventory freeze — Yêu cầu-N → primary (không giảm 30 dòng)

| Yêu cầu-ID | Priority | Primary UC / NFR | status |
|------------|----------|------------------|--------|
| Yêu cầu-01 | Cao | UC-HRM-SCOPE-01..03 | **body_ready** (W2b: FR-HRM-SCOPE-01 · 02 · 03) |
| Yêu cầu-02 | Cao | UC-HRM-02 · UC-HRM-03 | **body_ready** (W2b: FR-HRM-02 · FR-HRM-03) |
| Yêu cầu-03 | Cao | UC-HRM-04 | **body_ready** (W2b: FR-HRM-04) |
| Yêu cầu-04 | Cao | UC-HRM-05 | **body_ready** (W2b: FR-HRM-05) |
| Yêu cầu-05 | Cao | UC-HRM-06..08 | **body_ready** (W2b: FR-HRM-06 · FR-HRM-08; leftover UC-07) |
| Yêu cầu-06 | Cao | HRM-EM-01..05 | **body_ready** (W1: FR-HRM-EM-01) |
| Yêu cầu-07 | Cao | HRM-AT-01..03 | **body_ready** (W2a: FR-HRM-AT-01 · AT-02 · AT-03) |
| Yêu cầu-08 | Cao | UC-HRM-09 | **body_ready** (W2a: FR-HRM-09) |
| Yêu cầu-09 | Cao | UC-HRM-10 · HRM-AT-10..13 | **body_ready** (W1 AT-10 + W2a AT-12 · AT-13) |
| Yêu cầu-10 | Cao | HRM-AT-14 · UC-HRM-23/32 | **body_ready** (AC-ATT-SHEET giữ; W2c thêm FR-HRM-23 embed) |
| Yêu cầu-11 | Trung bình | UC-HRM-11 | **body_ready** (W2c: FR-HRM-11) |
| Yêu cầu-12 | Cao | UC-HRM-12 | **body_ready** (W2b: FR-HRM-12) |
| Yêu cầu-13 | Cao | HRM-PR-01..06 | **body_ready** (W1 PR-05 + W2a PR-01 · PR-03 · PR-04) |
| Yêu cầu-14 | Cao | HRM-RC-01..06 | **body_ready** (W1 RC-01 + W2a RC-03 · RC-05) |
| Yêu cầu-15 | Cao | HRM-CI-01..07 | **body_ready** (W1: FR-HRM-CI-01 · CI-02) |
| Yêu cầu-16 | Cao | HRM-MD-01..05 | **body_ready** (W2b: FR-HRM-MD-01; leftover MD-02..05) |
| Yêu cầu-17 | Cao | HRM-SC-01..09 | **body_ready** (W1: FR-HRM-SC-01) |
| Yêu cầu-18 | Cao | HRM-IM-01..04 | **body_ready** (W2b: FR-HRM-IM-01; leftover IM-02..04) |
| Yêu cầu-19 | Trung bình | HRM-OP-01..04 | **body_ready** (W2d: FR-HRM-OP-01 · 02 · 03 · 04) |
| Yêu cầu-20 | Trung bình | HRM-PF-01..04 | **body_ready** (W2a: FR-HRM-PF-01) |
| Yêu cầu-21 | Thấp hơn | HRM-FL-01 | **body_ready** (W2d: FR-HRM-FL-01) |
| Yêu cầu-22 | Cao | UC-HRM-20..27 | **body_ready** (W2c: FR-20 · 21 · 23; W2d: FR-27; leftover 22/24/25/26) |
| Yêu cầu-23 | Cao | UC-HRM-MOB-01..15 | **body_ready** (W2c: FR-HRM-MOB-01 · 04 · 06 · 08; leftover MOB khác) |
| Yêu cầu-24 | Cao | UC-HRM-INT-01..04 | **body_ready** (W2c: FR-HRM-INT-01 · 02 · 03 · 04) |
| Yêu cầu-25 | Trung bình | UC-HRM-27 | **body_ready** (W2d: FR-HRM-27) |
| Yêu cầu-26 | Trung bình | UC-HRM-01 | **body_ready** (W2d: FR-HRM-01) |
| Yêu cầu-27 | Cao | NFR-HRM-01..06 (khách Ch.4) | **body_ready** |
| Yêu cầu-28 | Cao | UC-HRM-09..12 | **body_ready** (09/10/12 đã slice; W2c đóng residual UC-HRM-11) |
| Yêu cầu-29 | Cao | NFR-HRM-BOUND (khách Ch.6) | **body_ready** |
| Yêu cầu-30 | Trung bình | BR-HRM-08 | **body_ready** (W2d: FR-HRM-BOOT-01) |

### 5.1 Tổng hợp status (sau W2d)

| status | Số Yêu cầu |
|--------|------------|
| body_ready | **30** (01–30) |
| planned_W2 | **0** |

> **planned_W2 Cao còn:** **0** (giữ từ W2c).  
> **UC leftover trong Yêu cầu đã body_ready:** embed 22/24/25/26; MOB-02/03/05/07/09–15; UC-07; MD-02..05; IM-02..04; EM/CI/SC/RC/PR/PF slices — **không** chặn đóng Yêu cầu-N.

## 6. Spine W1 + batch W2a/W2b/W2c/W2d — thứ tự nghiệp vụ

### 6.1 W1 (khóa)

| # | FR khách | Mã UC | Yêu cầu-N |
|---|----------|-------|-----------|
| 1 | FR-HRM-EM-01 | HRM-EM-01 | 06 |
| 2 | FR-HRM-CI-01 | HRM-CI-01 | 15 |
| 3 | FR-HRM-CI-02 | HRM-CI-02 | 15 |
| 4 | FR-HRM-AT-14 | HRM-AT-14 | 10 |
| 5 | FR-HRM-AT-10 | HRM-AT-10 | 09 |
| 6 | FR-HRM-PR-05 | HRM-PR-05 | 13 |
| 7 | FR-HRM-RC-01 | HRM-RC-01 | 14 |
| 8 | FR-HRM-SC-01 | HRM-SC-01 | 17 |

### 6.2 W2a — ưu tiên attendance / payroll / recruitment / performance

| # | FR khách | Mã UC | Yêu cầu-N |
|---|----------|-------|-----------|
| 9 | FR-HRM-AT-01 | HRM-AT-01 | 07 |
| 10 | FR-HRM-AT-02 | HRM-AT-02 | 07 |
| 11 | FR-HRM-AT-03 | HRM-AT-03 | 07 |
| 12 | FR-HRM-09 | UC-HRM-09 | 08 |
| 13 | FR-HRM-AT-12 | HRM-AT-12 | 09 |
| 14 | FR-HRM-AT-13 | HRM-AT-13 | 09 |
| 15 | FR-HRM-PR-01 | HRM-PR-01 | 13 |
| 16 | FR-HRM-PR-03 | HRM-PR-03 | 13 |
| 17 | FR-HRM-PR-04 | HRM-PR-04 | 13 |
| 18 | FR-HRM-RC-03 | HRM-RC-03 | 14 |
| 19 | FR-HRM-RC-05 | HRM-RC-05 | 14 |
| 20 | FR-HRM-PF-01 | HRM-PF-01 | 20 |

**Gate đếm (W1+W2a):** số metadata **Mã UC** trong FR body = số mục **Kết quả trả về** = **20**.

### 6.3 W2b — SCOPE / UC-02..08 / MD / IM / hộp thư

| # | FR khách | Mã UC | Yêu cầu-N |
|---|----------|-------|-----------|
| 21 | FR-HRM-SCOPE-01 | UC-HRM-SCOPE-01 | 01 |
| 22 | FR-HRM-SCOPE-02 | UC-HRM-SCOPE-02 | 01 |
| 23 | FR-HRM-SCOPE-03 | UC-HRM-SCOPE-03 | 01 |
| 24 | FR-HRM-02 | UC-HRM-02 | 02 |
| 25 | FR-HRM-03 | UC-HRM-03 | 02 |
| 26 | FR-HRM-04 | UC-HRM-04 | 03 |
| 27 | FR-HRM-05 | UC-HRM-05 | 04 |
| 28 | FR-HRM-06 | UC-HRM-06 | 05 |
| 29 | FR-HRM-08 | UC-HRM-08 | 05 |
| 30 | FR-HRM-12 | UC-HRM-12 | 12 |
| 31 | FR-HRM-MD-01 | HRM-MD-01 | 16 |
| 32 | FR-HRM-IM-01 | HRM-IM-01 | 18 |

**Gate đếm (W1+W2a+W2b):** = **32**.

### 6.4 W2c — INT / UC-11 / embed slice / MOB slice

| # | FR khách | Mã UC | Yêu cầu-N |
|---|----------|-------|-----------|
| 33 | FR-HRM-INT-01 | UC-HRM-INT-01 | 24 |
| 34 | FR-HRM-INT-02 | UC-HRM-INT-02 | 24 |
| 35 | FR-HRM-INT-03 | UC-HRM-INT-03 | 24 |
| 36 | FR-HRM-INT-04 | UC-HRM-INT-04 | 24 |
| 37 | FR-HRM-11 | UC-HRM-11 | 11 · 28 |
| 38 | FR-HRM-20 | UC-HRM-20 | 22 |
| 39 | FR-HRM-21 | UC-HRM-21 | 22 |
| 40 | FR-HRM-23 | UC-HRM-23 | 22 · 10 |
| 41 | FR-HRM-MOB-01 | UC-HRM-MOB-01 | 23 |
| 42 | FR-HRM-MOB-04 | UC-HRM-MOB-04 | 23 |
| 43 | FR-HRM-MOB-06 | UC-HRM-MOB-06 | 23 |
| 44 | FR-HRM-MOB-08 | UC-HRM-MOB-08 | 23 |

**Gate đếm (W1+W2a+W2b+W2c):** = **44**.

### 6.5 W2d — leftover Trung bình/Thấp (OP / FL / QSĐ / health / bootstrap)

| # | FR khách | Mã UC | Yêu cầu-N |
|---|----------|-------|-----------|
| 45 | FR-HRM-OP-01 | HRM-OP-01 | 19 |
| 46 | FR-HRM-OP-02 | HRM-OP-02 | 19 |
| 47 | FR-HRM-OP-03 | HRM-OP-03 | 19 |
| 48 | FR-HRM-OP-04 | HRM-OP-04 | 19 |
| 49 | FR-HRM-FL-01 | HRM-FL-01 | 21 |
| 50 | FR-HRM-27 | UC-HRM-27 | 25 · 22 |
| 51 | FR-HRM-01 | UC-HRM-01 | 26 |
| 52 | FR-HRM-BOOT-01 | BR-HRM-08 | 30 |

**Gate đếm (W1+W2a+W2b+W2c+W2d):** số heading FR §3 + **Kết quả trả về** = **52**.

## 7. Quy tắc cập nhật

1. **Freeze:** không giảm Yêu cầu-01..30 / 120 UC / AC-ATT-SHEET-*.  
2. Đợt sau (optional): ADD leftover embed/MOB/EM/CI/SC/RC/PR/PF/MD/IM/UC-07 — **không** bắt buộc để đóng Yêu cầu-N.  
3. TechSpec SA: `ref_srs` trỏ FR trong `SRS_HRM_KHACH.md` + annex team khi cần mã lỗi.  
4. Cấm prompt-echo Sponsor trong body khách.
