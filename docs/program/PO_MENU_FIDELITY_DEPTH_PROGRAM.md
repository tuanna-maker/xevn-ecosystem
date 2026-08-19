# PO+PM — Menu Fidelity Depth (U87)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-MENU-FIDELITY-01` |
| **Date** | 2026-08-04 |
| **Owner** | PM + PO |
| **Sponsor trigger** | UC×TC / W4 LIKELY_IMPL vẫn sót — cần inventory **từng menu → màn → nút → function → nghiệp vụ → liên kết → SRS/TechSpec/API → cấu hình tham chiếu** |
| **Pilot** | `command-center/hrm/attendance` (HRM embed Chấm công) |
| **Status** | **OPEN** — Wave M0 program + Wave M1 Attendance inventory **DISPATCHED** |
| **Locks** | U65 · U76 · U83 · U85 · U86 · **U87** · design ≠ DONE · không invent SPEC_GAP PASS |

---

## 1. Vì sao vẫn “chưa đủ” dù đã có report + BRD/SRS mới

| Artifact đã có | Đủ để… | **Không** đủ để… |
|----------------|--------|------------------|
| `by-uc/` 245 UC · 3334 cases · `MASTER_COVERAGE_REPORT` | Thiết kế kiểm thử theo mã UC | Chứng minh **mọi nút trên UI** đã map UC + chạy được |
| W4 exec theo `LIKELY_IMPL` | Đóng blocker P0 đã biết | Quét **toàn bộ submenu / stub / mock** trên 1 màn lớn |
| `SRS_VN` / `TECH_SPEC_VN` / `API_CONTRACT_VN` / mindmap | Năng lực GĐ1 + mong muốn | Field-level: cái nào **tham chiếu catalog**, cái nào **cấu hình quy tắc**, cái nào **giao dịch** |
| Training pack U86 | Pipeline GAP→fix | Tư duy **mở rộng theo menu thật** (button inventory trước UC smoke) |
| Pack menu TC U83 (`docs/qa/testcases/**`) | Depth theo menu khi viết TC | **Fidelity runtime** (LIVE / PARTIAL / STUB / BROKEN) trên FE hiện tại |

**Kết luận PO:** Design catalog ≠ product fidelity. Một menu enterprise (Attendance) có **7 tab chính + ~25 submenu + settings sâu** — 1–2 seat QA theo UC pack **bắt buộc sót**. Phải **tăng số seat** theo **cluster nút**, không chỉ theo file UC.

---

## 2. Định nghĩa Menu Fidelity (mỗi hàng bắt buộc)

Mỗi hàng inventory = **1 surface** (tab / submenu / dialog / CTA):

| Cột | Ý nghĩa |
|-----|---------|
| `menu_path` | VD. `CC → HRM → Chấm công → Ca → Danh sách` |
| `ui_surface` | Tab id / menu id / route / dialog |
| `functions[]` | Nút/CTA/API action (Tạo, Sửa, Xóa, Duyệt, Xuất, Lọc…) |
| `business_meaning` | Vì sao enterprise cần (1–3 câu tiếng Việt) |
| `links` | Module liên kết (Payroll, Leave, WF inbox, XBOS catalog, Mobile ESS…) |
| `srs_ref` | SRS cũ / `SRS_VN` / FR / UC — hoặc `SPEC_GAP` |
| `techspec_ref` | TechSpec § / `TECH_SPEC_VN` |
| `api_contract` | METHOD path + mã lỗi — hoặc `NO_API` / `MOCK_ONLY` |
| `data_class` | `REF` (danh mục tham chiếu) · `CFG` (quy tắc cấu hình) · `TXN` (giao dịch) · `RPT` (báo cáo) |
| `config_how` | Nơi cấu hình (XBOS catalog → pull · HRM settings · company override) |
| `runtime` | `LIVE` · `PARTIAL` · `STUB_UI` · `BROKEN` · `NOT_BUILT` |
| `uc_tc_map` | File `by-uc/HRM-AT-*` hoặc `UNMAPPED` |
| `owner_next` | ba / sa / dev-fe / dev-be / qa |
| `priority` | P0 / P1 / P2 / GĐ2-HOLD |

**DoD 1 menu = CLOSED** chỉ khi: mọi surface P0/P1 không còn `BROKEN`/`STUB_UI` không có waiver; mọi `UNMAPPED` P0 có UC hoặc BA HOLD có owner; QA U65 browser evidence theo HDSD; `uat_done` vẫn false cho đến gate program.

---

## 3. Mô hình nhân sự (tăng seat)

| Nguyên tắc | Áp dụng |
|------------|---------|
| **1 cluster nút = 1 seat** | Không giao 1 agent cả Attendance |
| Roster tối thiểu / menu dày | BA-P inventory · BA-D field/config · SA enterprise+API · QA button smoke · Dev FE/BE theo residual |
| Synth sau seats | 1 seat gộp dedupe + backlog fix ordered |
| Song song | Tối đa 4 Task/wave; queue cluster kế khi seat xong |

### Pilot Attendance — cluster (Wave M1)

| Cluster | Surfaces (từ `Attendance.tsx`) | Seat WI |
|---------|--------------------------------|---------|
| **ATT-C1** | Tab Overview + KPI cards | `PO-MFD-M1-ATT-C1-OVERVIEW` |
| **ATT-C2** | Tab Chấm công: sheets / records / weekly / summary | `PO-MFD-M1-ATT-C2-SHEETS` |
| **ATT-C3** | Tab Ca: list / schedule / overtime (+ workShift loop fix) | `PO-MFD-M1-ATT-C3-SHIFTS` |
| **ATT-C4** | Tab Đơn từ: leave, late-early, OT, trip, update, change-shift, summaries, plan | `PO-MFD-M1-ATT-C4-REQUESTS` |
| **ATT-C5** | Tab Nghỉ phép (trong Attendance shell) | `PO-MFD-M1-ATT-C5-LEAVE` |
| **ATT-C6** | Tab Báo cáo | `PO-MFD-M1-ATT-C6-REPORTS` |
| **ATT-C7** | Tab Cài đặt: employees/rules/OT/leave/late/request/users/roles/system + rules subtabs | `PO-MFD-M1-ATT-C7-SETTINGS` |
| **ATT-SYNTH** | Gộp matrix + backlog P0 ordered | `PO-MFD-M1-ATT-SYNTH` |

Sau M1 Synth → Wave M2 **fix pipeline** (Dev → QA) theo hàng `BROKEN`/`PARTIAL` P0 — không chờ Sponsor chọn.

---

## 4. Phân loại dữ liệu (BA-Data + SA bắt buộc điền)

| Class | Ví dụ Attendance | Cấu hình như nào |
|-------|------------------|------------------|
| **REF** | Mã ca, loại ngày công, cột công chuẩn, leave_types (XBOS) | XBOS catalog publish → HRM pull; không hardcode FE |
| **CFG** | Geofence 200m, auto-checkout 10h, quy tắc đi muộn, hệ số OT | Settings company + optional holding policy; versioned |
| **TXN** | Bản ghi chấm công ngày, đơn giải trình, duyệt | API mutate + WF; scope company; audit |
| **RPT** | Tổng hợp tuần / xuất Excel | Read model từ TXN+CFG; không SoT |

**Enterprise meaning (rút):** Attendance = nguồn **công chuẩn** cho Payroll + Leave balance + OT cost + KPI vận hành. Stub settings = rủi ro tính lương sai toàn tập đoàn.

---

## 5. Liên kết artifact hiện có (không đè)

| Nguồn | Vai trò trong U87 |
|-------|-------------------|
| `PO_FULL_ECOSYSTEM_UC_TC_PROGRAM.md` | Design UC — **input** map `uc_tc_map` |
| `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` (U83) | Template menu TC — bổ sung cột `runtime` |
| `HRM_CUSTOMER_CAPABILITY_MINDMAP.md` | Mong muốn lá Chấm công — map IN/PARTIAL/GĐ2 |
| `SRS_VN` / `TECH_SPEC_VN` / `API_CONTRACT_VN` | Trace; thiếu → SPEC_GAP + BA delta **sau** inventory |
| `HRM-AT-01..13` by-uc | Coverage đã có; gap = UNMAPPED surfaces |
| Fix in-flight W4 | Tiếp tục; MFD **không** hủy W4 — **mở rộng** chiều |

---

## 6. Training delta (bắt buộc mọi seat MFD)

Mọi Task MFD phải kèm `read_first`:

1. Program này §2–§4  
2. Training pack **§15 Menu Fidelity** (append)  
3. `Attendance.tsx` tab/menu constants (hoặc menu đích)  
4. by-uc liên quan + HDSD nếu có  

**Quiz seat (trả trong evidence):**

1. Surface nào `STUB_UI` / `BROKEN`?  
2. Field nào REF vs CFG vs TXN?  
3. Liên kết Payroll/Leave/WF?  
4. UC by-uc nào UNMAPPED?  
5. P0 fix đầu tiên là gì?

---

## 7. Lộ trình

```text
M0  Program + U87 lock + training §15          ← THIS SESSION
M1  Attendance 7 cluster inventory + Synth
M2  Fix P0 BROKEN/PARTIAL (Dev→QA U65) — hết P0 Attendance
M3  Rollout menu kế (Employees / Payroll / Leave standalone / XBOS CC…)
M4  Master Menu Fidelity Report (sponsor)
```

**Cấm claim:** Phase1 DONE / UAT DONE khi mới xong inventory.

---

## 8. Exit criteria program (sponsor)

- [ ] Mỗi menu in-scope Phase1 có matrix fidelity (hoặc HOLD GĐ2 có lý do)  
- [ ] Attendance pilot: 0 P0 `BROKEN` không waiver; STUB có plan  
- [ ] Config REF/CFG documented + đúng nguồn XBOS/HRM  
- [ ] Training quiz PASS trên seat M1  
- [ ] `uat_done` chỉ khi browser U65 đủ surface P0  

---

*PO-MENU-FIDELITY-01 · U87*
