# Test Matrix — PO-HRM-PAY-CNTT-FE-STP-01
## Gói chính sách (STP-01..STP-06) · L1–L6 · Browser U65

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-FE-STP-01` |
| **owner** | QA CNTT |
| **lane** | `qa` |
| **scope** | STP-POLICY-PACK screen · STP-HUB nav global AC · L1–L6 |
| **honesty** | `payroll_e2e_ready=false` · zero-seed · live-only · không flip AC |
| **ref_index** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-SPEC-INDEX.md` |
| **ref_api** | `docs/program/specs/PO-HRM-PAY-CNTT-API-01.md` §2 |
| **ref_srs** | `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md` |
| **ref_screen** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` |
| **ref_hub** | `docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md` |
| **test_method** | Browser U65 · `:8080/hr/payroll/setup/policy-packs` · live API |
| **environment** | http://host:8080/hr (hrm-fe) + http://host:3001/api/hrm (hrm-be) |
| **test_account_group** | C&B tập đoàn (`ceo@xe.vn` / `Xevn@2026`) · C&B unit test accounts |
| **output** | TEST CASE ID · spec_ref · ac_ref · scenario · steps · expected · srs_uc_ref |

---

## Legend

| Meta | Meaning |
|------|---------|
| **L1** | Page load + component mount |
| **L2** | User action (click, fill, select) |
| **L3** | API round-trip (BE response + DB) |
| **L4** | Persistence (F5 / reload) |
| **L5** | Scope / RBAC enforcement |
| **L6** | Cross-screen / cross-component consistency |

---

## Section A — STP-HUB Navigation + Global AC (prerequisite)

### STP01-TC-001 · Hub load + honesty banner (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-001 |
| **spec_ref** | `UI-HRM-PAY-STP-HUB.md` §3, §6, §7 AC-PAY-STP-GLOBAL-01 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |
| **scenario** | C&B mở «Thiết lập lương» — hub hiển thị nav + honesty |

**steps:**
1. Login ceo@xe.vn → Menu Lương → Thiết lập lương (/hr/payroll/setup)
2. Kiểm tra data-testid="pay-stp-hub-root" hiển thị
3. Quan sát honesty banner: «Thiết lập đã lưu ≠ chạy bảng lương kỳ — payroll_e2e_ready=false»
4. Click nav item «Gói chính sách» → chuyển sang /payroll/setup/policy-packs
5. Quay lại hub → F5

**expected:**
- L1: Hub load 200, shell mount, pay-stp-hub-root hiển thị, 6 nav items render
- L3: API call thành công, không lỗi console
- L4: Sau F5, nav + child state còn nguyên, không 404
- L5: Honesty banner hiển thị đúng copy VI, không bị ẩn

---

### STP01-TC-002 · Hub nav toàn bộ L1–L6 + URL routing (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-002 |
| **spec_ref** | UI-HRM-PAY-STP-HUB.md §3, §5, §7 J-HRM-PAY-STP-NAV-01 · INDEX §7 testid registry |
| **ac_ref** | J-HRM-PAY-STP-NAV-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01..12 (spine) |

**scenario:** C&B click tuần tự 6 nav items — mỗi lần URL đổi đúng route, không 404.

**steps:**
1. Từ hub, lần lượt click: «Gói chính sách» → «Danh mục TP» → «Mẫu bảng» → «Profile nhập» → «Nhóm lương»
2. Mỗi click: observe URL đổi, screen mount, không error overlay
3. Quay lại hub → F5 → confirm nav state persistent

**expected:**
- L2: Mỗi click → URL đúng (/policy-packs, /components, /templates, /input-profiles, /groups)
- L1: Screen mount đúng component tương ứng
- L3: Mỗi screen fetch data thành công
- L4: Sau F5, active nav item highlight đúng screen cuối cùng visited

---

### STP01-TC-003 · OU scope enforcement — CHUNG không mutate bởi OU (L5)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-003 |
| **spec_ref** | UI-HRM-PAY-STP-HUB.md §3 two-pane · POLICY §4.2 BR-PAY-STP-01 · DELTA §0 BR-PAY-STP-01 |
| **ac_ref** | AC-PAY-STP-GLOBAL-02 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** Login C&B OU (ĐPHH scope) → mở Policy Pack → thử mutate pack CHUNG → hệ thống từ chối.

**steps:**
1. Login tài khoản C&B OU (không phải tập đoàn scope)
2. Vào Thiết lập lương → «Gói chính sách»
3. Chọn 1 pack CHUNG đang active → mở detail form
4. Thử sửa tên pack CHUNG → click Lưu
5. Quan sát response

**expected:**
- L5: API trả 403 (scope mismatch)
- L2: UI hiển thị banner scope lỗi — không toast success
- L4: Pack CHUNG trong DB không đổi (DB row unchanged)
- L5: Không có if (bp==='DPHH') hardcode trong DOM (grep audit pass)

---

## Section B — STP-01 CHUNG (Create + Persist + F5)

### STP01-TC-004 · Tạo pack CHUNG mới — happy path (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-004 |
| **spec_ref** | UI-HRM-PAY-STP-POLICY-PACK.md §4.2 · API §2.2 F-PAY-POLICY-PACK-UPSERT-01 · DELTA §FR-UC-BP-PAY-STP-01 |
| **ac_ref** | AC-PAY-STP-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** C&B tập đoàn tạo pack CHUNG mới (QĐ 2A thang bậc) — Lưu 2xx → F5 còn.

**steps:**
1. Click [+ Thêm gói] → chọn scope CHUNG
2. Nhập: code=CNTT-QD2A-2026, 
ameVi=Quy chế thang bậc QĐ 2A/2026
3. effectiveFrom=01/07/2026 · status=active
4. (Optional) Nhập ateParams: {"kpi_threshold_1500": 500000, "bcc_std": 1200000}
5. Click Lưu
6. Kiểm tra list: row mới xuất hiện với đúng code/name
7. Click row → detail hiển thị đầy đủ data đã nhập
8. F5 → danh sách vẫn giữ row mới

**expected:**
- L3: POST /pay-policy-packs trả 201/200, row có id, scope=CHUNG
- L1: List cập nhật ngay sau Lưu (no manual refresh)
- L2: Click row → detail PATCH fetch đúng id
- L4: Sau F5 → list GET trả về row mới — AC-PAY-STP-01 PASS
- L3: ateParams lưu đúng JSON shape, BE parse OK

---

### STP01-TC-005 · Duplicate code CHUNG → 409 conflict (L1–L3)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-005 |
| **spec_ref** | UI-HRM-PAY-STP-POLICY-PACK.md §6 · API §2.2 error HRM-PAY-POL-409-CODE |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** Tạo pack CHUNG trùng mã đang active → hệ thống báo lỗi 409.

**steps:**
1. Nhớ pack CHUNG đang có code CNTT-QD2A-2026
2. Click [+] → nhập lại đúng code CNTT-QD2A-2026 (khác name)
3. Click Lưu
4. Quan sát toast/banner lỗi

**expected:**
- L3: API trả 409, message chứa HRM-PAY-POL-409-CODE
- L1: Không có row mới trong list (DB unchanged)
- L2: Toast/banner hiển thị mã lỗi, form không đóng
- L4: F5 → list vẫn chỉ có 1 row CNTT-QD2A-2026

---

### STP01-TC-006 · Patch pack CHUNG — cập nhật rateParams (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-006 |
| **spec_ref** | UI-HRM-PAY-STP-POLICY-PACK.md §4.3 · API §2.2 PATCH |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-03 |

**scenario:** Mở pack CHUNG đang active → sửa ateParams → Lưu PATCH → F5 thấy data mới.

**steps:**
1. Từ list, click pack CHUNG đang status=active
2. Detail form: thay đổi ateParams JSON — thêm key kpi_threshold_2000: 800000
3. Click Lưu
4. Quan sát list/detail cập nhật
5. F5 → reload
6. Click lại row → confirm ateParams.kpi_threshold_2000 = 800000

**expected:**
- L3: PATCH /pay-policy-packs/:id trả 200, DTO chứa ateParams mới
- L1: Detail grid hiển thị giá trị mới ngay sau Lưu
- L4: Sau F5, GET /pay-policy-packs/:id trả đúng ateParams đã sửa
- L3: policyDocRefs (nếu có) không bị ghi đè khi chỉ sửa ateParams

---

## Section C — STP-02 RIÊNG (BP scope + businessLineTag)

### STP01-TC-007 · Tạo pack RIÊNG ĐPHH — happy path (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-007 |
| **spec_ref** | UI-HRM-PAY-STP-POLICY-PACK.md §4.2 · API §2.2 · DELTA §FR-UC-BP-PAY-STP-02 |
| **ac_ref** | AC-PAY-STP-02 |
| **srs_uc_ref** | UC-BP-PAY-STP-02 |

**scenario:** C&B ĐPHH tạo pack RIÊNG — usinessLineTag=DPHH → Lưu 2xx → list filter ĐPHH hiển thị.

**steps:**
1. Filter list → scope RIÊNG + tab BP tag = ĐPHH
2. Click [+ Thêm gói] → nhập: code=DPHH-KPI-2026, 
ameVi=KPI ĐPHH 2026, scope=RIENG, usinessLineTag=DPHH
3. effectiveFrom=01/07/2026, status=active
4. Click Lưu
5. Xác nhận row mới xuất hiện trong list RIÊNG/ĐPHH
6. F5 → list vẫn giữ

**expected:**
- L3: POST trả 201/200, DTO có scope=RIENG, usinessLineTag=DPHH
- L1: Filter RIÊNG tab hiển thị row mới
- L4: Sau F5, GET list với scope=RIENG&business_line_tag=DPHH trả về pack
- L5: C&B tập đoàn khi filter RIÊNG thấy pack ĐPHH (scope RBAC correct)

---

### STP01-TC-008 · BP tag filter — RIÊNG list lọc đúng (L1–L2)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-008 |
| **spec_ref** | UI-HRM-PAY-STP-POLICY-PACK.md §4.1 filter usiness_line_tag |
| **ac_ref** | AC-PAY-STP-GLOBAL-02 |
| **srs_uc_ref** | UC-BP-PAY-STP-02 |

**scenario:** List RIÊNG — chọn filter BP tag khác nhau → list hiển thị đúng pack tương ứng.

**steps:**
1. Mở list Policy Pack (scope RIÊNG, no BP filter)
2. Khi có ≥2 pack khác tag (DPHH, TĐHK) — chọn filter tag = ĐPHH
3. Quan sát list chỉ giữ pack ĐPHH
4. Đổi filter → TĐHK → list đổi
5. Clear filter → xem lại toàn bộ RIÊNG

**expected:**
- L1: Mỗi filter change → list re-fetch → hiển đúng pack match tag
- L3: API query param usiness_line_tag=DPHH trả đúng subset
- L5: KHÔNG thấy pack của BP khác khi đang filter 1 BP

---

### STP01-TC-009 · CHUNG scope — C&B OU thử tạo → 403 (L5)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-009 |
| **spec_ref** | POLICY §4.2 BR-PAY-STP-01 · DELTA §0 BR-PAY-STP-01 · HUB §3 |
| **ac_ref** | AC-PAY-STP-GLOBAL-02 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** Login C&B OU → thêm pack CHUNG → API 403 → UI show banner.

**steps:**
1. Login tài khoản C&B ĐPHH (scope RIÊNG only)
2. Click [+ Thêm gói]
3. Chọn scope CHUNG (nếu UI allow chọn)
4. Nhập code, 
ameVi → Lưu
5. HOẶC: thử PATCH pack CHUNG đang tồn tại → Lưu

**expected:**
- L5: API trả 403 — OU không có quyền mutate CHUNG
- L2: UI hiển thị banner «Bạn không có quyền sửa gói CHUNG» — no success toast
- L3: DB không có row mới hoặc patch không apply cho pack CHUNG
- L5: scope enforcement hoạt động đúng theo BR-PAY-STP-01

---

## Section D — STP-03..STP-06 · RateParams tabs/kpi/bcc/geo/VP

### STP01-TC-010 · RateParams grid — KPI threshold STP-03 (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-010 |
| **spec_ref** | POLICY §4.3 key kpi_threshold_* · API §2.2 ate_params_json · DELTA §FR-UC-BP-PAY-STP-03 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-03 |

**scenario:** Trong detail form CHUNG/RIÊNG → tab KPI threshold → nhập giá trị số → Lưu → F5 còn.

**steps:**
1. Mở 1 pack CHUNG hiện có → scroll đến section Rate params
2. Tab / section KPI: nhập kpi_threshold_1500 = 500000 (số, vi-VN format)
3. Click Lưu
4. Detail re-load → xem ateParams.kpi_threshold_1500 = 500000
5. F5 → reload → xem lại

**expected:**
- L2: Number input nhận số, parse đúng (không nhận text)
- L3: PATCH ate_params_json thành công
- L4: Sau F5, GET DTO trả đúng giá trị
- L5: UI không hardcode enum tỉnh — keys metadata-driven

---

### STP01-TC-011 · RateParams grid — BCC_STD STP-04 (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-011 |
| **spec_ref** | POLICY §4.3 key cc_std · API §2.2 · DELTA §FR-UC-BP-PAY-STP-04 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-04 |

**scenario:** Nhập/BCC_STD trong rateParams → Lưu → F5.

**steps:**
1. Detail form → BCC section → nhập cc_std = 1200000
2. Lưu → confirm 2xx
3. Detail hiển thị cc_std = 1200000
4. F5 → reload → confirm data persistent

**expected:**
- L3: ate_params_json.bcc_std = 1200000 trong DB
- L1: Form input validation cho số hợp lệ
- L4: F5 persistent — AC-PAY-STP-GLOBAL-01 PASS

---

### STP01-TC-012 · RateParams grid — Geo/tuyến STP-05 (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-012 |
| **spec_ref** | POLICY §4.3 key geo · API §2.2 open keys · DELTA §FR-UC-BP-PAY-STP-05 |
| **ac_ref** | AC-PAY-STP-GLOBAL-02 |
| **srs_uc_ref** | UC-BP-PAY-STP-05 |

**scenario:** Nhập geo/tuyến keys trong rateParams → Lưu → F5.

**steps:**
1. Detail → Geo/Tuyến section
2. Nhập ví dụ: oute_unit_price_HN=150000, oute_unit_price_HCM=170000
3. Lưu → confirm
4. F5 → reload → verify keys/values persistent

**expected:**
- L5: Keys metadata-driven — không hardcode 6 tỉnh enum
- L3: ate_params_json chứa đúng geo keys
- L4: Persistent sau F5
- L5: Open catalog — BE không CHECK enum tỉnh

---

### STP01-TC-013 · RateParams grid — VP allowance/cost STP-06 (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-013 |
| **spec_ref** | POLICY §4.3 key vp_allowance/vp_cost · API §2.2 · DELTA §FR-UC-BP-PAY-STP-06 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-06 |

**scenario:** Nhập VP allowance + VP cost → Lưu → F5.

**steps:**
1. Detail → VP section
2. Nhập: p_allowance = 300000, p_cost = 500000
3. Lưu → confirm 2xx
4. F5 → reload → verify

**expected:**
- L3: ate_params_json.vp_allowance = 300000, ate_params_json.vp_cost = 500000
- L1: Money format vi-VN thousand group
- L4: Persistent sau F5

---

### STP01-TC-014 · Archive pack RIÊNG — soft-delete (L1–L4)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-014 |
| **spec_ref** | POLICY §4.2 + §6 · API §2.3 F-PAY-POLICY-PACK-ARCHIVE-01 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** List RIÊNG → click Archive → row biến mất (soft-delete) → include_archived=true thấy lại.

**steps:**
1. Từ list RIÊNG, chọn pack ĐPHH đang ctive
2. Click nút Archive / Ngưng
3. Confirm dialog
4. Quan sát list: row biến mất
5. Toggle «Hiện đã lưu trữ» (include_archived) → row xuất hiện, rchivedAt có giá trị
6. F5 → list vẫn ẩn row (archived filtered out)

**expected:**
- L3: POST /:id/archive trả 200, rchived_at set
- L1: List mặc định exclude archived — row biến mất ngay
- L4: Sau F5, list GET (default include_archived=false) vẫn ẩn
- L2: Toggle include_archived → row hiện rchivedAt field
- L3: KHÔNG hard delete — DB row vẫn tồn tại, chưa bị xóa vĩnh viễn

---

## Section E — L6 Cross-cutting / Edge

### STP01-TC-015 · Empty list — «Chưa có gói» + CTA (L1–L2)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-015 |
| **spec_ref** | POLICY §6 empty state · DELTA §FR-UC-BP-PAY-STP-01 |
| **ac_ref** | AC-PAY-STP-GLOBAL-01 |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** Scope mới/tenant mới không có pack nào — list trống hiển thị empty state + CTA.

**steps:**
1. (Hoặc: filter tạo điều kiện không có kết quả)
2. Quan sát UI empty state

**expected:**
- L1: Hiển thị copy «Chưa có gói — tạo từ nút Thêm (U65).»
- L1: Nút [+ Thêm gói] visible / actionable
- L3: API GET /pay-policy-packs trả [] với 200 (không 404)

---

### STP01-TC-016 · Date validation — effective_from > effective_to → 400 (L1–L3)

| Field | Value |
|-------|-------|
| **test_case_id** | STP01-TC-016 |
| **spec_ref** | API §2.2 VAL-CNTT-01 · POLICY §6 error HRM-PAY-POL-400-DATE |
| **ac_ref** | — |
| **srs_uc_ref** | UC-BP-PAY-STP-01 |

**scenario:** Nhập effectiveFrom sau effectiveTo → Lưu → 400 validation.

**steps:**
1. Detail form create/edit
2. effectiveFrom = 31/12/2026, effectiveTo = 01/01/2026 (ngược)
3. Click Lưu
4. Quan sát lỗi

**expected:**
- L3: API trả 400, message chứa HRM-PAY-POL-400-DATE
- L1: UI hiển thị validation error dưới field hoặc banner
- L2: Form không submit, row không được tạo

---

## Trace matrix — Test Case → AC → STP → Screen

| test_case_id | STP | AC | Screen |
|-------------|-----|-----|--------|
| STP01-TC-001 | STP-01..12 (spine) | GLOBAL-01 | STP-HUB |
| STP01-TC-002 | STP-01..12 | GLOBAL-01 / NAV-01 | STP-HUB |
| STP01-TC-003 | STP-01 | GLOBAL-02 / BR-PAY-STP-01 | STP-POLICY-PACK |
| STP01-TC-004 | STP-01 | STP-01 | STP-POLICY-PACK |
| STP01-TC-005 | STP-01 | GLOBAL-01 / 409 | STP-POLICY-PACK |
| STP01-TC-006 | STP-03 | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-007 | STP-02 | STP-02 | STP-POLICY-PACK |
| STP01-TC-008 | STP-02 | GLOBAL-02 | STP-POLICY-PACK |
| STP01-TC-009 | STP-01 | GLOBAL-02 / BR-PAY-STP-01 | STP-POLICY-PACK |
| STP01-TC-010 | STP-03 | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-011 | STP-04 | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-012 | STP-05 | GLOBAL-02 | STP-POLICY-PACK |
| STP01-TC-013 | STP-06 | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-014 | STP-01 (archive) | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-015 | STP-01 (empty) | GLOBAL-01 | STP-POLICY-PACK |
| STP01-TC-016 | STP-01 (date) | — | STP-POLICY-PACK |

---

**QA verdict:** READY_FOR_QA — Matrix L1–L6 copertura STP-01..06 CHUNG + RIÊNG, cần browser verify U65 thực tế trên server.
