# 36 — Module E2E spine linkage (chống nút/form orphan)

| Meta | Value |
|------|--------|
| **Status** | ACTIVE |
| **Date** | 2026-08-06 |
| **Incident** | `incidents/INC-MODULE-SPINE-ORPHAN-UI.md` |
| **Related** | `13` §3.4.12 · `02` Spec-first · `21` dual-plane (số) · `30` HDSD QA · `32` PM+PO · `33` L0–L2.5 |
| **Trigger** | Sponsor: màn «có» nhưng field điền tay / so sánh trống / menu không nối nhau |

---

## 1. Bài học cốt lõi (PM/PO nhớ)

1. **Nghiên cứu nghiệp vụ module** = spine **+** depth từng **nút / modal / tab** (Diễn biến + khóa mang), không dừng ở FR inventory hay slide MVP.
2. **Rà soát logic** = UI phải neo **đúng entity SoT** của bước đó; leftover GĐ2 / stub API = **broken**, không phải «empty hợp lệ» nếu luôn `[]` cứng.
3. **Một orphan sponsor bắt** → giả định **cùng class** trên sibling menus → mở program scorecard, không vá điểm.
4. **Slice QC GWC / fidelity density / HTTP 200** ≠ **module UAT-ready**.

---

## 2. Scorecard bắt buộc (ba-process trước Dev lớn)

Với mỗi menu/khu đang giao (hoặc sau incident sponsor):

| Cột | Nội dung |
|-----|----------|
| Bước nghiệp vụ | Actor + việc |
| Màn / nút UI | Route + control |
| Entity SoT | Bảng/khái niệm SRS (không alias UI lệch) |
| FR / Diễn biến # | Cite cụ thể |
| Khóa mang | id bắt buộc sang bước sau |
| FE/BE does | Quan sát code hoặc Network |
| Gap class | xem §3 |
| Owner next | ba-docs / sa / fe / be — **NO invent UX** |

**Exit:** mọi mutate P0 có SELECT/FK hoặc read-only derived — **cấm** free-text SoT khi catalog/FK đã khóa ở team hoặc Enterprise SRS.

---

## 3. Gap classes (dùng chung mọi dự án)

| ID | Khi nào |
|----|---------|
| **C-ORPHAN-FIELD** | Input tay / số tự do thay SELECT catalog hoặc FK |
| **C-ORPHAN-SCREEN** | Modal/nút không có nguồn từ bước trước hoặc empty cứng |
| **C-SPINE-BREAK** | Bước A không tạo khóa mang bước B (cross-tab) |
| **C-WRONG-SOT** | UI neo entity OUT MVP / dual-write cấm |
| **C-SPEC-SHALLOW** | Spine nói chung, thiếu FR 7-mục / Diễn biến form |
| **C-CONSOLE-CRASH** | Runtime block (tách lane FE hotfix; không thay BA) |
| **C-SLICE-≠-MODULE** | Evidence hẹp bị promote thành «module xong» |

---

## 4. Phân tầng honesty (cấm gộp)

| Layer PASS | Được nói | Không được nói |
|------------|----------|----------------|
| Spec spine paper | «SRS đã khóa hướng» | UAT-ready |
| ba-docs Diễn biến form | «AC form đủ depth» | Code đúng |
| Tech/DB/API | «Contract sẵn» | Browser OK |
| Slice GWC (1 feature) | «Slice X GWC» | Module / Phase DONE |
| Browser E2E U65 + J-* | «UF/J PASS» | Production |

---

## 5. PM/PO — né lỗi (checklist 60 giây)

- [ ] Mỗi nút mutate trên screenshot sponsor đã có dòng scorecard?
- [ ] Field «vị trí / loại / nguồn / kỳ…» là SELECT theo SoT hay free-text?
- [ ] Empty state = 0 bản ghi hợp lệ **hay** stub `setX([])` / API không gọi?
- [ ] Team BR «cấm free-text» đã có → FE/DTO còn Lane B song song không?
- [ ] Wave trước GWC có ghi `module_uat_ready=false` không?
- [ ] Sponsor 1 menu → đã mở seat sibling chưa?

**Dispatch mặc định sau orphan:**

```text
1) ba-process scorecard (NO CODE)
2) ba-docs ADD Diễn biến nếu C-SPEC-SHALLOW
3) sa Tech/DB/API nếu đổi khóa
4) dev-fe/be hẹp allowed_paths
5) qa browser U65 — cấm seed để «có data so sánh»
```

---

## 6. QA / QC reject nhanh

- Form bắt buộc FK mà UI free-text → **FAIL** (không chờ «có data»).
- Compare/filter neo entity OUT MVP → **FAIL wrong SoT**.
- Evidence chỉ slice GWC khi sponsor hỏi «chạy được module chưa?» → **NO-GO process** (`C-SLICE-≠-MODULE`).

---

## 7. Liên kết dự án mẫu (XeVN)

- Program: `docs/program/PO_HRM_ALL_MENU_E2E_LINKAGE_PROGRAM.md`
- REC seat: `docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md`
- Fidelity menu matrix = **density/FK seed** — **không** thay scorecard UX linkage này.
