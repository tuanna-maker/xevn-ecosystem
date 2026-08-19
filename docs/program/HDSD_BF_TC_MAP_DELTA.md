# HDSD — Delta map TC ⬜ → BF cluster

**Program:** `HDSD-P2-FULL-01` · **Work item:** `BA-HDSD-BF-MAP-01`  
**Ngày:** 01/08/2026 · **Lane:** governance (ba-process)  
**Nguồn:** `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` (257 TC ⬜) · QA sweep `qa-hdsd-bf-sweep-01-20260801.md` (+25🟢)  
**SoT orchestration:** `docs/program/HDSD_BUSINESS_FLOW_ORCHESTRATION.md`

---

## 1. Mục tiêu

Gán **mỗi TC còn ⬜** vào đúng **BF cluster** để PM dispatch QA theo đợt Đ1–Đ5, không chia theo TC lẻ.

## 2. Tổng hợp phân bổ

| BF cluster | TC ⬜ | Đợt QA | Owner QA | Ghi chú |
|------------|-------|--------|----------|---------|
| **BF-01** Tuyển dụng & WF | **55** | Đ3 | qa | Canvas → YCTD → inbox → funnel |
| **BF-02** Chấm công & nghỉ | **19** | Đ1 | qa-device + qa | Mobile J-MOB + Ch08 + INT-03 |
| **BF-03** HĐ & lương | **59** | Đ2 | qa | Ch05/06/09 + mobile payslip |
| **sweep** | **122** | Đ4 | qa | Org/RBAC/settings/dialog depth |
| **W5** scope negative | **2** | Đ5 | qa | Member CEO 403/409 |
| **Tổng** | **257** | | | Matrix promoted: 96🟢 · 9🟡 |

## 3. Quy tắc gán

| Điều kiện HDSD / UF | BF | Lý do nghiệp vụ |
|---------------------|-----|-----------------|
| Ch07 Tuyển dụng · Ch10 §10.1 headcount · Ch10 §10.5 WF · CH04 XBOS WF/Inbox/Canvas | **BF-01** | Spine tuyển dụng + workflow |
| Ch08 Chấm công · J-MOB-03/04/05 · mobile leave/approval · INT-03 | **BF-02** | Đơn nghỉ → inbox → chấm công |
| Ch05 Nhân sự · Ch06 HĐ/BH · Ch09 Lương · mobile payslip/contracts | **BF-03** | NV → HĐ → lương |
| Ch03 XBOS tổ chức · Ch02 legacy CC · Dashboard dialog · Ch10 admin · Ch11 post-spot | **sweep** | Dialog depth ngoài 3 BF |
| TC-*-M01 member persona | **W5** | Scope negative |

## 4. BF-01 (55 TC)

| HDSD section | TC range | Priority | QA WI |
|--------------|----------|----------|-------|
| §4.1 Hộp thư Workflow (Action Cards) | TC-XBOS-HDSD-109..TC-XBOS-HDSD-114 (6 TC) | P0 | QA-HDSD-BF-01-01 |
| §4.2 Thiết kế quy trình (Canvas Workflow) | TC-XBOS-HDSD-115..TC-XBOS-HDSD-122 (7 TC) | P0 | QA-HDSD-BF-01-01 |
| §4.3 Ma trận RACI | TC-XBOS-HDSD-124..TC-XBOS-HDSD-131 (8 TC) | P0 | QA-HDSD-BF-01-01 |
| §4.4 Danh mục tập đoàn & đồng bộ | TC-XBOS-HDSD-133 | P0 | QA-HDSD-BF-01-01 |
| §4.5 Chỉ số KPI trên Bảng điều khiển | TC-XBOS-HDSD-134..TC-XBOS-HDSD-138 (5 TC) | P0 | QA-HDSD-BF-01-01 |
| §1. Giới thiệu | TC-HRM-HDSD-054 | P0 | QA-HDSD-BF-01-01 |
| §10. Tab Đánh giá | TC-HRM-HDSD-063 | P0 | QA-HDSD-BF-01-01 |
| §11. Tab Kế hoạch tuyển dụng | TC-HRM-HDSD-064, TC-HRM-HDSD-065, TC-HRM-HDSD-066 | P0 | QA-HDSD-BF-01-01 |
| §12. Tab Báo cáo | TC-HRM-HDSD-067 | P0 | QA-HDSD-BF-01-01 |
| §13. Hộp thoại dùng chung | TC-HRM-HDSD-068 | P0 | QA-HDSD-BF-01-01 |
| §14. Trạng thái nghiệp vụ | TC-HRM-HDSD-069 | P0 | QA-HDSD-BF-01-01 |
| §15. Lỗi thường gặp | TC-HRM-HDSD-070 | P0 | QA-HDSD-BF-01-01 |
| §16. Liên kết kiểm thử | TC-HRM-HDSD-071 | P0 | QA-HDSD-BF-01-01 |
| §3. Tab Yêu cầu tuyển dụng | TC-HRM-HDSD-056 | P0 | QA-HDSD-BF-01-01 |
| §4. Tab Thư viện JD | TC-HRM-HDSD-057 | P0 | QA-HDSD-BF-01-01 |
| §5. Tab Tin tuyển dụng | TC-HRM-HDSD-058 | P0 | QA-HDSD-BF-01-01 |
| §7. Tab Đề xuất định biên | TC-HRM-HDSD-060 | P0 | QA-HDSD-BF-01-01 |
| §8. Tab Chiến dịch | TC-HRM-HDSD-061 | P0 | QA-HDSD-BF-01-01 |
| §9. Tab Phỏng vấn | TC-HRM-HDSD-062 | P0 | QA-HDSD-BF-01-01 |
| §10.1 Thông tin công ty (Headcount & tổ chức) | TC-HRM-HDSD-107..TC-HRM-HDSD-113 (7 TC) | P1 | QA-HDSD-BF-01-01 |
| §10.5 Quy trình & Quy định (chỉ xem) | TC-HRM-HDSD-137..TC-HRM-HDSD-141 (5 TC) | P1 | QA-HDSD-BF-01-01 |

**Spine AC:** Canvas QT → Lưu → F5 · YCTD Gửi duyệt POST 2xx · CC Inbox Hoàn thành · funnel + headcount INT-02.

## 5. BF-02 (19 TC)

| HDSD section | TC range | Priority | QA WI |
|--------------|----------|----------|-------|
| §1. Giới thiệu | TC-HRM-HDSD-072 | P0 | QA-HDSD-BF-02-01 |
| §10. Tab Thiết lập | TC-HRM-HDSD-085 | P0 | QA-HDSD-BF-02-01 |
| §11. Trạng thái nghiệp vụ | TC-HRM-HDSD-086 | P0 | QA-HDSD-BF-02-01 |
| §12. Lỗi thường gặp | TC-HRM-HDSD-087 | P0 | QA-HDSD-BF-02-01 |
| §13. Liên kết kiểm thử | TC-HRM-HDSD-088 | P0 | QA-HDSD-BF-02-01 |
| §2. Tab Tổng quan | TC-HRM-HDSD-073 | P0 | QA-HDSD-BF-02-01 |
| §5. Tab Chấm công — Dữ liệu / Tuần / Tổng hợp | TC-HRM-HDSD-076, TC-HRM-HDSD-077, TC-HRM-HDSD-078 | P0 | QA-HDSD-BF-02-01 |
| §6. Tab Ca làm việc | TC-HRM-HDSD-080, TC-HRM-HDSD-081 | P0 | QA-HDSD-BF-02-01 |
| §7. Tab Quản lý đơn | TC-HRM-HDSD-082 | P0 | QA-HDSD-BF-02-01 |
| §9. Tab Báo cáo | TC-HRM-HDSD-084 | P0 | QA-HDSD-BF-02-01 |
| CH12_MOBILE_HRM §12.3 Chấm công & Đội nhóm | TC-MOB-014 | P0 | QA-HDSD-BF-02-01 (qa-device) |
| CH12_MOBILE_HRM §12.4 Nghỉ phép & Yêu cầu cập nhật công | TC-MOB-016, TC-MOB-017, TC-MOB-018 | P0 | QA-HDSD-BF-02-01 (qa-device) |
| CH12_MOBILE_HRM §12.6 Phê duyệt (Manager) | TC-MOB-024, TC-MOB-025 | P0 | QA-HDSD-BF-02-01 (qa-device) |

**Spine AC:** `uat.nv0001` đơn nghỉ → Gửi · `ceo@xe.vn` CC Inbox INT-03 duyệt · mobile tab Nghỉ/Chấm công · `uat.nv0002` tab Duyệt J-MOB-05.

## 6. BF-03 (59 TC)

| HDSD section | TC range | Priority | QA WI |
|--------------|----------|----------|-------|
| §5.1 Danh sách nhân viên | TC-HRM-HDSD-008..TC-HRM-HDSD-014 (7 TC) | P0 | QA-HDSD-BF-03-01 |
| §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên | TC-HRM-HDSD-015..TC-HRM-HDSD-024 (9 TC) | P0 | QA-HDSD-BF-03-01 |
| §5.3 Xóa mềm nhân viên | TC-HRM-HDSD-025 | P0 | QA-HDSD-BF-03-01 |
| §5.4 Hồ sơ nhân viên (chi tiết) | TC-HRM-HDSD-026..TC-HRM-HDSD-034 (8 TC) | P0 | QA-HDSD-BF-03-01 |
| §5.5 Liên kết dữ liệu & danh mục | TC-HRM-HDSD-035 | P0 | QA-HDSD-BF-03-01 |
| §1. Giới thiệu chương | TC-HRM-HDSD-036 | P0 | QA-HDSD-BF-03-01 |
| §2. Hợp đồng lao động | TC-HRM-HDSD-038..TC-HRM-HDSD-043 (6 TC) | P0 | QA-HDSD-BF-03-01 |
| §3. Bảo hiểm | TC-HRM-HDSD-045..TC-HRM-HDSD-052 (6 TC) | P0 | QA-HDSD-BF-03-01 |
| §4. Liên kết kiểm thử | TC-HRM-HDSD-053 | P0 | QA-HDSD-BF-03-01 |
| §1. Giới thiệu | TC-HRM-HDSD-089 | P0 | QA-HDSD-BF-03-01 |
| §10. Lỗi thường gặp | TC-HRM-HDSD-104 | P0 | QA-HDSD-BF-03-01 |
| §11. Liên kết kiểm thử | TC-HRM-HDSD-105 | P0 | QA-HDSD-BF-03-01 |
| §2. Tab Tổng quan | TC-HRM-HDSD-090 | P0 | QA-HDSD-BF-03-01 |
| §3. Tab Thành phần lương | TC-HRM-HDSD-091 | P0 | QA-HDSD-BF-03-01 |
| §4. Tab Chính sách | TC-HRM-HDSD-092, TC-HRM-HDSD-093, TC-HRM-HDSD-094 | P0 | QA-HDSD-BF-03-01 |
| §5. Tab Dữ liệu | TC-HRM-HDSD-095 | P0 | QA-HDSD-BF-03-01 |
| §6. Tab Tính lương | TC-HRM-HDSD-098, TC-HRM-HDSD-099, TC-HRM-HDSD-100 | P0 | QA-HDSD-BF-03-01 |
| §7. Tab Chi trả | TC-HRM-HDSD-101 | P0 | QA-HDSD-BF-03-01 |
| §8. Tab Báo cáo | TC-HRM-HDSD-102 | P0 | QA-HDSD-BF-03-01 |
| §9. Trạng thái nghiệp vụ | TC-HRM-HDSD-103 | P0 | QA-HDSD-BF-03-01 |
| CH12_MOBILE_HRM §12.5 Phiếu lương | TC-MOB-020, TC-MOB-021, TC-MOB-022 | P0 | QA-HDSD-BF-03-01 (qa-device) |
| CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân | TC-MOB-030 | P1 | QA-HDSD-BF-03-01 (qa-device) |

**Spine AC:** Thêm NV dialog · HĐ mutate prefill · chấm công overview marker · lương kỳ + mobile phiếu lương.

## 7. sweep (122 TC)

| HDSD section | TC range | Priority | QA WI |
|--------------|----------|----------|-------|
| CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng | TC-XBOS-HDSD-027..TC-XBOS-HDSD-032 (4 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ ro | TC-XBOS-HDSD-034..TC-XBOS-HDSD-040 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan | TC-XBOS-HDSD-041..TC-XBOS-HDSD-047 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| CH02_COMMAND_CENTER_LEGACY §2.4 Chuyển phân hệ trên rail ( | TC-XBOS-HDSD-048 | P2 | QA-HDSD-BF-SWEEP-02 |
| CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & m | TC-XBOS-HDSD-049..TC-XBOS-HDSD-055 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| CH02_COMMAND_CENTER_LEGACY §2.6 Liên kết kịch bản nghiệm t | TC-XBOS-HDSD-056 | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.0 Khung Cài đặt hệ thống (shell chung) | TC-XBOS-HDSD-057..TC-XBOS-HDSD-063 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.1 Danh sách đơn vị thành viên | TC-XBOS-HDSD-065..TC-XBOS-HDSD-070 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.2 Hồ sơ pháp nhân — form chi tiết | TC-XBOS-HDSD-071..TC-XBOS-HDSD-077 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) | TC-XBOS-HDSD-078..TC-XBOS-HDSD-084 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.4 Hệ thống Phòng/Ban (khung tập đoàn) | TC-XBOS-HDSD-085..TC-XBOS-HDSD-091 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.5 Phòng/Ban pháp nhân (cây theo công ty) | TC-XBOS-HDSD-092..TC-XBOS-HDSD-098 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.6 Hệ thống phân quyền (RBAC) | TC-XBOS-HDSD-100..TC-XBOS-HDSD-105 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.7 Tóm tắt luồng nghiệp vụ khuyến nghị | TC-XBOS-HDSD-106 | P2 | QA-HDSD-BF-SWEEP-02 |
| §3.8 Liên kết kịch bản nghiệm thu | TC-XBOS-HDSD-107 | P2 | QA-HDSD-BF-SWEEP-02 |
| §10.2 Quyết định nhân sự | TC-HRM-HDSD-115..TC-HRM-HDSD-121 (7 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §10.3 Quản lý công việc | TC-HRM-HDSD-123..TC-HRM-HDSD-128 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §10.4 Dịch vụ nội bộ | TC-HRM-HDSD-131..TC-HRM-HDSD-135 (5 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §10.6 Hồ sơ xe (Fleet) | TC-HRM-HDSD-143, TC-HRM-HDSD-144, TC-HRM-HDSD-146 | P2 | QA-HDSD-BF-SWEEP-02 |
| §11.6 Danh mục cài đặt (Đồng bộ XBOS) | TC-HRM-HDSD-157, TC-HRM-HDSD-158, TC-HRM-HDSD-159 | P2 | QA-HDSD-BF-SWEEP-02 |
| §11.7 Danh mục nghiệp vụ (Master Data) | TC-HRM-HDSD-162..TC-HRM-HDSD-167 (6 TC) | P2 | QA-HDSD-BF-SWEEP-02 |
| §11.8 Báo cáo HRM | TC-HRM-HDSD-172 | P2 | QA-HDSD-BF-SWEEP-02 |
| §11.9 Hướng dẫn trong ứng dụng (In-app Guide) | TC-HRM-HDSD-174, TC-HRM-HDSD-175, TC-HRM-HDSD-176 | P3-spec_gap | QA-HDSD-BF-SWEEP-02 |
| CH12_MOBILE_HRM §12.1 Đăng nhập & chọn phạm vi | TC-MOB-006, TC-MOB-007 | P2 | QA-HDSD-BF-SWEEP-02 (qa-device) |
| CH12_MOBILE_HRM §12.10 Bảng tổng hợp UC ↔ Màn hình | TC-MOB-033 | P2 | QA-HDSD-BF-SWEEP-02 (qa-device) |
| CH12_MOBILE_HRM §12.2 Trang chủ (Home) | TC-MOB-011 | P2 | QA-HDSD-BF-SWEEP-02 (qa-device) |
| CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân | TC-MOB-027, TC-MOB-028 | P2 | QA-HDSD-BF-SWEEP-02 (qa-device) |
| CH12_MOBILE_HRM §12.9 Cài đặt Mobile | TC-MOB-032 | P2 | QA-HDSD-BF-SWEEP-02 (qa-device) |
| XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan ( | TC-XBOS-HDSD-007, TC-XBOS-HDSD-008 | P2 | QA-HDSD-BF-SWEEP-02 |
| XBOS_CH01_COMMAND_CENTER §1.2 Rail phân hệ (XBOS vs HRM) | TC-XBOS-HDSD-009 | P2 | QA-HDSD-BF-SWEEP-02 |
| XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành | TC-XBOS-HDSD-014 | P2 | QA-HDSD-BF-SWEEP-02 |
| XBOS_CH04_DASHBOARD_VAN_HANH §4.2 Dashboard Tổ chức | TC-XBOS-HDSD-017 | P2 | QA-HDSD-BF-SWEEP-02 |
| XBOS_CH04_DASHBOARD_VAN_HANH §4.4 KPI — Chính sách & Dashb | TC-XBOS-HDSD-022 | P2 | QA-HDSD-BF-SWEEP-02 |
| XBOS_CH04_DASHBOARD_VAN_HANH §4.6 Settings vận hành (`/das | TC-XBOS-HDSD-025 | P2 | QA-HDSD-BF-SWEEP-02 |

**Sweep batch 1 (DONE):** QA-HDSD-BF-SWEEP-01 — Ch11 tabs + XBOS dashboard load spots, 25🟢.  
**Sweep batch 2:** dialog depth trong bảng trên; không lặp mutate BF-01/02/03.

## 8. Residual R-SWEEP-02 / R-SWEEP-03

| Residual | TC | BF map | Trạng thái | Quyết định BA |
|----------|-----|--------|------------|---------------|
| **R-SWEEP-02** | TC-HRM-HDSD-152 | sweep · Ch11 Bảo mật | 🟡 stub | Tab Bảo mật có đổi mật khẩu; **không có UI 2FA**. Defer W5 trừ khi SRS bắt buộc 2FA web — nếu bắt buộc → `dev-fe` + AC toggle/QR enroll. |
| **R-SWEEP-03** | TC-HRM-HDSD-173..176 | sweep · Ch11 In-app Guide | 🟡 / ⬜ | `173` load-only 🟡; `174`–`176` ⬜ blocked 🟢 đến khi feature ship. Defer W5 hoặc OUT Phase 2. |
| R-SWEEP-01 | TC-XBOS-HDSD-016,019 | sweep | 🟢 | QA-XBOS-DASHBOARD-FE-01 — toolbar visible + click U65 |
| R-SWEEP-04 | TC-HRM-HDSD-161 | sweep | harness | qa manual spot bucket labels |

## 9. W5 scope negative

| TC ID | Persona | AC |
|-------|---------|-----|
| TC-XBOS-HDSD-M01 | du-lich.ceo@xe.vn | CC rollup 403/409 |
| TC-HRM-HDSD-M01 | du-lich.ceo@xe.vn | HRM scope blocked |

## 10. Handoff PM → QA

- **D1 BF-02:** 19 TC · J-MOB-03/04/05 · INT-03
- **D2 BF-03:** 59 TC · J-HRM-01/03 · J-MOB-04
- **D3 BF-01:** 55 TC · J-REC-WF-01..06
- **D4 sweep-02:** 122 TC · exclude R-SWEEP-02/03 from PASS claim
- **D5 W5:** 2 TC member negative

## Traceability

- Matrix: `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md`
- Orchestration: `docs/program/HDSD_BUSINESS_FLOW_ORCHESTRATION.md`
- Sweep evidence: `docs/qa/evidence/qa-hdsd-bf-sweep-01-20260801.md`

---

## completion_report

Closed: Map **257/257** TC ⬜ → BF-01 (55) · BF-02 (19) · BF-03 (59) · sweep (122) · W5 (2). Residual **R-SWEEP-02** (2FA) và **R-SWEEP-03** (in-app guide) ghi §8.

Residual: Promote từng TC vẫn do QA Đ1–Đ4; R-SWEEP-02/03 cần sponsor xác nhận defer vs build.

## next_owner

pm

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MATRIX-PROMOTE-SWEEP-01
from_role: pm | to_role: qa
entry_criteria: BA-HDSD-BF-MAP-01 PASS — docs/program/HDSD_BF_TC_MAP_DELTA.md
exit_criteria: Promote 25 PASS rows per qa-hdsd-bf-sweep-01; add BF column ref from delta §2; ack PASS_TO_PM
read_first: HDSD_BF_TC_MAP_DELTA.md §8 residual
cam: regression PASS→unmapped
```

## evidence_path

docs/program/HDSD_BF_TC_MAP_DELTA.md

## ack_status

PASS_TO_PM