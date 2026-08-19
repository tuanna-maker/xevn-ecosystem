# PO — Test Case depth toàn hệ sinh thái (world-standard)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-ECO-TC-DEPTH-01` |
| **Date** | 2026-08-03 |
| **Owner** | PM + PO |
| **Sponsor lock** | Viết **đủ** — mọi chức năng, mọi trường, mọi màn (kể cả popup), mọi function; **toàn ecosystem** (XBOS/CC + HRM web + Mobile), không chỉ spine HRM |
| **Status** | OPEN — squad 1 menu = 1 agent |
| **Liên kết** | U82 · U83 · `PO_SPEC_TEST_SUITE_PROGRAM.md` · IEEE 829 / ISO 29119 lean (`31-WORLD-STANDARD-TEST-LOG`) |

> Catalog 53 TC spine **không đủ**. Đây là chương trình **chiều sâu theo menu**.

---

## 1. Phạm vi hệ sinh thái

| Surface | Scope menu (SoT code / matrix) |
|---------|--------------------------------|
| **XBOS / Command Center** | Login · CC home/KPI · Đơn vị / pháp nhân · Cổ đông · Tài liệu · Phòng ban · RACI · Inbox/WF · Catalog gov · Settings catalog · Ma trận RBAC · (mọi leaf portal CC) |
| **HRM Web** | Mọi leaf `AppSidebar`: Dashboard · Employees · Contracts · Insurance · Decisions · Recruitment · Attendance · Payroll · Performance · AI · Tasks · Processes · Internal services · Tools · Fleet · Company · Reports · Settings (+ catalogs + metadata) |
| **HRM Mobile** | Home · FAB/đơn · Leave · Attendance/đi muộn · Approvals · Team · Profile · Settings · Payslip (mọi màn stack) |

**Cấm:** chỉ viết happy-path 1 nút; bỏ popup/drawer/tab; gộp nhiều menu vào 1 agent.

---

## 2. Định nghĩa “đủ” (DoD mỗi menu pack)

Mỗi file menu **PASS** khi có đủ:

| # | Mục | Chi tiết bắt buộc |
|---|-----|-------------------|
| 1 | **Screen inventory** | List/detail/form + **mọi tab** + **mọi popup/dialog/drawer/sheet** + empty/error/loading states |
| 2 | **Field dictionary** | **Mọi** control nhập/hiển thị: tên UI · `name`/testid · kiểu · bắt buộc · validate · map API/DB · format vi-VN |
| 3 | **Function inventory** | Mọi nút/action/menu context: id · precond · API · hậu quả FE+F5 |
| 4 | **TC matrix** | ≥1 TC happy + ≥1 fail-deep + boundary cho **mỗi function mutate**; ≥1 TC validate cho **mỗi field bắt buộc / rule BR**; auth/scope negative khi menu có RBAC |
| 5 | **Trace** | SRS/FR/UC · TechSpec · API_CONTRACT · HDSD path (U76) |
| 6 | **Automate hint** | UNIT / API / UI / MOBILE / MANUAL |
| 7 | **World-standard meta** | TC-ID ổn định · Priority · Type (IEEE-style) · Expected kết quả quan sát được |

**Không PASS** nếu: thiếu popup tạo/sửa; thiếu cột bảng list; thiếu confirm dialog; thiếu soft-delete/archive nếu UI có.

---

## 3. Artifact layout

```
docs/qa/testcases/
  README.md                          ← index + % coverage
  _TEMPLATE_MENU_TC_PACK.md          ← copy cho mỗi menu
  roster/ECOSYSTEM_MENU_ROSTER.md    ← danh sách menu + owner agent
  xbos/
    CC-HOME.md
    CC-LEGAL-ENTITIES.md
    …
  hrm-web/
    HRM-EMPLOYEES.md
    HRM-RECRUITMENT.md
    …
  hrm-mobile/
    MOB-HOME.md
    MOB-LEAVE.md
    …
```

Master rollup vẫn cập nhật: `docs/qa/reports/PO_SPEC_TEST_REPORT.md` (thêm section Ecosystem depth).

---

## 4. Squad vận hành

| Rule | Áp dụng |
|------|---------|
| **1 menu = 1 Task agent** | `qa` (primary) hoặc `ba-process` inventory rồi `qa` TC |
| Parallel | Wave ≤ **6** menu / phiên; wave kế sau PASS |
| Synth | Sau mỗi wave: 1 `qa` **SYNTH** dedupe TC-ID + FK cross-menu |
| Depth first | Wave A: menus mutate P0 (Employees, Recruitment, Attendance, Payroll, Inbox, Catalog, Legal/Shareholders, Mobile Leave/Approvals) |
| Stub menus | AI / Tools Phase-2: vẫn inventory đủ UI; TC đánh dấu STUB/OOS rõ |

---

## 5. Wave A (dispatch ngay)

| WI | Menu pack | Agent |
|----|-----------|-------|
| `PO-ECO-TC-HRM-EMPLOYEES-01` | HRM Nhân sự + profile tabs + dialogs | qa |
| `PO-ECO-TC-HRM-RECRUITMENT-01` | Tuyển dụng tabs + popups | qa |
| `PO-ECO-TC-HRM-ATTENDANCE-01` | Chấm công / nghỉ / sheets | qa |
| `PO-ECO-TC-XBOS-ORG-SHARE-01` | CC pháp nhân + cổ đông + phòng ban | qa |
| `PO-ECO-TC-XBOS-INBOX-CAT-01` | Inbox WF + Catalog governance | qa |
| `PO-ECO-TC-MOB-LEAVE-APPR-01` | Mobile nghỉ + ManagerApprovals | qa |
| `PO-ECO-TC-ROSTER-01` | Full roster mọi leaf | qa (inventory) |

Wave B (sau A): Contracts · Insurance · Decisions · Payroll · Settings/Metadata · CC RACI/RBAC/KPI · Mobile Home/Attendance/Settings · Performance/Tasks/…

---

## 6. Policy

- U65 zero-seed trong **execution** evidence; catalog TC được mô tả precond “data từ FE” không seed.
- U76 HDSD path trong mọi TC UI.
- U78 khi chạy thật.
- Không claim UAT/Phase1 DONE vì catalog depth xong.
- LV-02 ladder: TC ghi SPEC_GAP/HOLD `T_L1`.

---

*PO-ECO-TC-DEPTH-01*
