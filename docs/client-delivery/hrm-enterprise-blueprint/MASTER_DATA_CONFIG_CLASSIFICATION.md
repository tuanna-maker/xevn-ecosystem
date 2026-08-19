# Phân định cấu hình dữ liệu — REF / CFG / TXN (HRM Enterprise)

| Mục | Nội dung |
|-----|----------|
| **Mã** | `PO-HRM-BP-MASTER-DATA-CLASS-01` |
| **Ngày** | 2026-08-05 |
| **Mục đích** | Khi **Thêm mới** trên UI: biết lấy dropdown từ đâu, ai là SoT, ai được CRUD |
| **Audience** | Team (Dev/BA/QA) + sponsor chỉ điền mục §4 «Cần sponsor» |
| **Khóa liên quan** | ADR-HRM-ATTENDANCE-CFG-PERSIST · ADR metadata catalogs · D7 HOLD code |

---

## 0. Ba lớp (bắt buộc nhớ)

| Lớp | Tên | Ý nghĩa | Ví dụ |
|-----|-----|---------|--------|
| **REF** | Danh mục tham chiếu | Chọn khi tạo giao dịch; **không** sinh nghiệp vụ kỳ | Loại phép, mã phụ cấp, mã OT, chức danh catalog |
| **CFG** | Cấu hình theo công ty / kỳ áp dụng | Rule, hệ số, site, ca instance, công thức hiệu lực | `work_shifts`, GPS sites, leave accrual rule, payroll formula published |
| **TXN** | Giao dịch | Bản ghi sự kiện / kỳ; FK về REF/CFG | Đơn nghỉ, bản ghi chấm, bảng công, YCTD, kỳ lương |

**Luật vàng**

1. Form **Thêm TXN** chỉ **đọc** REF/CFG đã publish — không tạo danh mục “chìm” trong modal TXN (trừ shortcut có ADR).  
2. **Một SoT CRUD** cho mỗi khái niệm — cấm 2 màn cùng sửa một master.  
3. Tập đoàn khung danh mục: **XBOS publish → HRM pull** (trừ chỗ ADR nói HRM thắng).

---

## 1. PM đã phân định (team làm theo — không hỏi lại sponsor trừ §4)

### 1.1 Chấm công (ATT)

| Khái niệm | Lớp | SoT CRUD (GĐ1) | Form Thêm mới lấy từ | Cấm |
|-----------|-----|----------------|----------------------|-----|
| Loại phép (5 loại họp) | REF (+ CFG rule) | Settings catalog `leave_types` + quy tắc nghỉ công ty | Leave request → dropdown loại | Hardcode 5 loại trong FE; CRUD loại trong modal đơn nghỉ |
| Quỹ / số dư phép | CFG/TXN derived | Balance API theo NV + loại | Panel quỹ (UC đề xuất ATT-05b) | Tự tính lệch catalog |
| Ca làm việc (instance) | **CFG** | HRM `work_shifts` | Phân ca / gán NV / OT base | Dual CRUD ca trong Attendance modal **và** catalog XBOS |
| Mã ca khung tập đoàn | **REF** | XBOS catalog key `shifts` → sync | Import / picker cross-module | Coi catalog là ca vận hành |
| Điểm GPS / geofence | **CFG** | `attendance_work_sites` API | Settings quy tắc / màn địa điểm → list→Thêm | Ghi GPS vào JSON `attendance_rules.gps_locations` (legacy) |
| Quy tắc đi muộn / OT / tự checkout | **CFG** | `attendance_rules` (+ flags) | Settings rules tabs | Giả LIVE khi UI stub/`featureInDev` |
| Lịch lễ (dương) | REF/CFG | Holiday calendar (thiếu màn — PRODUCT_MISSING) | Khi có màn cấu hình năm | Invent ngày lễ trong code |
| Bản ghi chấm / sheet / đơn OT·nghỉ | **TXN** | Attendance APIs | Form TXN + chọn REF/CFG | Seed để “có task” duyệt |
| Ký chốt bảng công | **TXN** state | Sheets workflow | Nút ký trên sheet đã khóa kỳ | PAY đọc sheet chưa chốt |

### 1.2 Nhân sự (CORE / EMP)

| Khái niệm | Lớp | SoT CRUD | Form Thêm mới lấy từ | Cấm |
|-----------|-----|----------|----------------------|-----|
| Phòng ban / pháp nhân | REF | Org / legal entity (XBOS/CC scope) | Hồ sơ NV · filter | `companyId` lệch JWT |
| Chức danh / vị trí | REF | Position catalog (tenant/group per seed rules) | Hợp đồng · YCTD | Text tự do không mã |
| Field động hồ sơ | REF def + TXN value | XBOS Group HR defs → HRM `settings-catalogs` | Profile tabs sau pull | SoT thứ 3 trong localStorage |
| Hợp đồng / phụ lục | TXN | HRM contracts | Form hợp đồng | — |
| BHXH / tạm dừng | TXN + CFG | Insurance module | Tab BH — **Q-SI-SUSPEND** còn mở policy | Tự suy ra tạm dừng |
| Tài sản gắn NV | TXN | Assets — **Q-ASSET** scope | Tab tài sản | Claim CRUD đủ khi chỉ stub |

### 1.3 Tuyển dụng (REC)

| Khái niệm | Lớp | SoT CRUD | Form Thêm mới lấy từ | Cấm |
|-----------|-----|----------|----------------------|-----|
| Định biên / kế hoạch HC | CFG/TXN plan | Kế hoạch HC (UC-BP-REC-01) | YCTD check headcount | **Q-REC-HEADCOUNT** ngoài ĐB chưa chốt thì không hard-block sai |
| JD / YCTD / UV | TXN (+ JD template REF) | Recruitment APIs | Form YCTD · ứng viên | Campaign đa kênh = **GĐ2** |
| Vị trí tuyển | REF | Position + org | YCTD | — |

### 1.4 Lương (PAY)

| Khái niệm | Lớp | SoT CRUD | Form Thêm mới lấy từ | Cấm |
|-----------|-----|----------|----------------------|-----|
| Bảng công đưa vào lương | TXN **đã chốt** | ATT sheets signed | PAY data-attendance | Lấy OT/phép raw; nói «chưa họp lương» |
| Công thức / biến / phụ cấp | CFG versioned | Formula engine — **Q-PAY-FORMULA** | UI soạn thảo sau chốt | Hardcode hệ số theo công ty trong source |
| Kỳ lương / phiếu lương | TXN | Payroll run | Sau công thức hiệu lực + sheet chốt | Tính khi sheet mở |

---

## 2. Map màn «Thêm» → nguồn dữ liệu (training Dev-FE / QA)

| Màn / popup | Hành động user | Bắt buộc load trước Lưu | Owner verify |
|-------------|----------------|-------------------------|--------------|
| Đơn nghỉ | Thêm | `leave_types` REF + balance (nếu có) + ca/NV scope | QA UF leave |
| Đơn OT | Thêm | OT type REF + shift CFG + quy tắc OT CFG | QA |
| Phân ca | Gán ca | `work_shifts` list scoped | Dev-FE |
| GPS site | Thêm địa điểm | Form name/lat/lon/radius → POST work-sites | Dev-BE scope slug |
| YCTD | Thêm | Position REF + dept + headcount plan | QA REC |
| NV mới | Thêm | Org + position + metadata defs đã pull | QA EMP |
| Công thức lương | Soạn / phát hành | Biến từ catalog CFG + preview | HOLD đến Q-PAY chốt |
| Kỳ lương | Tính | Sheet ATT **chốt** + formula **published** | QA PAY |

---

## 3. Stub / redirect hiện tại (honesty — không wire giả)

| Surface | Stamp | Việc team | Việc sponsor |
|---------|-------|-----------|--------------|
| Settings `#40–43` redirect catalog | STUB_UI | Giữ banner; map WBS | Chốt ưu tiên GĐ1/GĐ2 trên phiếu chốt |
| PAY data-* `featureInDev` | STUB | Không claim LIVE | — |
| Leave-rules redirect S80 | STUB | Catalog SoT | Q-LEAVE-* |
| Face #9 | GĐ2-HOLD | Không code MVP | Xác nhận GĐ2 trên phiếu |

---

## 4. Cần sponsor (không tự bịa)

Copy sang `SPONSOR_CHOT_FILL_SHEET.md` §3 nếu chưa điền:

| ID | Vì sao PM chưa khóa một mình |
|----|------------------------------|
| MD-S1 | Có cho thêm loại phép ngoài 5 loại họp không |
| MD-S2 | Xác nhận rule `work_shifts` thắng vs XBOS `shifts` |
| MD-S3 | Role CRUD GPS sites |
| MD-S4 | Chi tiết authoring công thức (trùng Q-PAY-FORMULA) |
| MD-S5 | SoT số định biên khi tạo YCTD |

---

## 5. Checklist training members (DoD khi đụng form Thêm)

Dev-FE / Dev-BE / QA **trước** `READY_FOR_QA`:

- [ ] Ghi `spec_read_ack` + lớp REF|CFG|TXN trong evidence  
- [ ] Dropdown không hardcode string nghiệp vụ  
- [ ] Empty catalog = empty state hợp lệ (không spinner storm)  
- [ ] Scope `companyId` = list API cùng module  
- [ ] Không tạo master thứ hai trong modal TXN  
- [ ] Stub giữ honesty — không fake LIVE  

**Evidence template** (mỗi form mới):

```markdown
### Master-data ack
- concept: …
- class: REF | CFG | TXN
- SoT path: API/table/catalog key …
- create_form_loads: …
- must_not: …
```

---

## 6. Handoff

| Role | Việc |
|------|------|
| **ba-data** | Giữ file này SoT; delta khi ADR đổi; map cột DB khi W4 mở |
| **ba-process** | AC «sau Lưu dropdown khớp catalog» trên UC Thêm |
| **dev-be / dev-fe** | Implement theo §1–2 — **chỉ khi D7 mở code** |
| **qa** | Matrix UF: Thêm → F5 → giá trị vẫn từ đúng SoT |
| **pm** | Không dispatch wire catalog khi D7 HOLD trừ P0 crash |

---

## DOC-DELTA — ba-data train vs ADR (APPEND only · 2026-08-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-MASTER-DATA-TRAIN-01` |
| **Evidence** | `docs/qa/evidence/po-hrm-bp-master-data-train-01.md` |
| **ADR** | `ADR-HRM-ATTENDANCE-CFG-PERSIST` Accepted 2026-08-04 |
| **Hard conflict** | **None** — §1 classifications **PASS** vs D1–D4 |
| **Soft clarify** | Hàng §1.1 «Quy tắc đi muộn / OT / tự checkout» |

**Clarify (không đè §1):**

| Khái niệm | GĐ1 (ADR) | GĐ2 / stub (ADR D4) |
|-----------|-----------|---------------------|
| Flags `notify_late`, `auto_checkout`, device toggles trên `attendance_rules` | **CFG** persist GET/PATCH `/attendance/rules` | — |
| Panel «Đi muộn về sớm» / policy phạt chi tiết | — | **CFG future** — stub honesty |
| Mã / loại OT catalog | **REF** Settings danh mục | Attendance OT rules modal ≠ SoT CRUD |
| FaceID | Column persist `false` | UI **GĐ2-HOLD** |

**must_keep unchanged:** `work_shifts` wins · work-sites geofence SoT · PAY đọc sheet đã chốt · Face GĐ2.

**Sponsor residual:** chỉ MD-S1..S5 trên `SPONSOR_CHOT_FILL_SHEET.md` §3 — không invent tại file này.
