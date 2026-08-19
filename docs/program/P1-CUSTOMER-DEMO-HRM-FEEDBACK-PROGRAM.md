# P1 — Phản hồi khách hàng sau demo HRM (biên bản 2026-06-20)

**Nguồn:** Biên bản cuộc họp rà soát HRM (B-Minutes AI) — demo với Người nói 2 (Quản lý), Hùng (BA).  
**File SoT:** `C:\Users\ADMIN\OneDrive\Desktop\B-Minutes AI - Trợ lý phòng họp thông minh.pdf`  
**Sponsor lock (2026-07-19):** *«nhớ chứ, phải sửa theo yêu cầu của họ»* — F1–F6 + F-DELIVERY **không waive**; delta `CUSTOMER_DEMO_HRM_DELTA_20260620.md` là AC kiểm thử.  
**Mục tiêu khách:** Chạy thử **tháng 8/2026** · Vận hành thật **tháng 9/2026**  
**Cadence:** Họp **Thứ 2 + Thứ 5** hàng tuần

---

## 1. Tóm tắt phản hồi (theo biên bản)

| # | Chủ đề | Phản hồi khách | Mức |
|---|--------|----------------|-----|
| F1 | Chuẩn bị pilot Connect | Cần pháp nhân + danh mục điều hành tối thiểu (NS, dịch vụ, TC…) | P0 |
| F2 | Template danh mục hạ tầng | Google Sheet / file điền kho, bãi, văn phòng… | P0 |
| F3 | Chuyển đổi vai trò / công ty | UI rõ ràng, tránh lẫn dữ liệu đa vai trò | P0 |
| F4 | Workflow phê duyệt | Fix cứng người duyệt → **động** (chức danh, cấp trên, song song, automation) | P0 |
| F5 | Hợp đồng lao động | Thiếu lương thử việc, phụ cấp, lịch sử; tách lương khỏi HĐ | P1 |
| F6 | Tuyển dụng | Thiếu job detail library, dashboard trạng thái ứng viên | P1 |
| F7 | **Performance HRM** | Sponsor: chậm, gọi quá nhiều API — không rõ mục đích | **P0** |

---

## 2. Wave kế hoạch (8 tuần → T8 pilot)

| Wave | Tuần | Focus | Owner lane |
|------|------|-------|------------|
| **W0** | Tuần này | Template danh mục + audit perf HRM + BA delta | ba-docs, dev-fe, dev-be, ba-process |
| **W1** | +1 | Role switch UX + HRM perf P0 fixes | dev-fe, qa |
| **W2** | +2 | Connect seed / pilot data package | dev-be, devops |
| **W3–W4** | +3–4 | Workflow động (BA spec → BE engine → FE canvas) | ba-process, sa, dev-be, dev-fe |
| **W5** | +5 | Hợp đồng tách lương/phụ cấp | ba-data, dev-be, dev-fe |
| **W6** | +6 | Recruitment dashboard + job library | ba-process, dev-fe, dev-be |
| **W7** | +7 | QA UAT Connect + perf regression | qa, qc |
| **W8** | T8 | Pilot Connect go-live | pm, sponsor |

---

## 3. Work items (dispatch)

| work_item_id | Mô tả | Role | Entry | Exit |
|--------------|-------|------|-------|------|
| **CD-FB-01-TEMPLATE** | Gửi template danh mục (Excel v2 + hướng dẫn) cho khách | ba-docs | `XBOS_Catalog_Import_Template_v2.xlsx` | Email-ready pack + sheet hạ tầng highlight |
| **CD-FB-02-BA-DELTA** | BA delta SRS: workflow động, HĐ, tuyển dụng, role switch | ba-process | Biên bản §II | AC + BR rows trong delta doc |
| **CD-FB-03-PERF-AUDIT** | Audit API HRM embed + standalone — bảng call count | dev-fe | Sponsor feedback | Evidence + top 5 fix |
| **CD-FB-04-PERF-FIX** | P0 perf: lazy load, dedupe, React Query staleTime, dashboard batch | dev-fe | CD-FB-03 | QA network trace ↓50% calls mount |
| **CD-FB-05-PERF-BE** | BE: overview/batch endpoint nếu FE audit chỉ ra N+1 | dev-be | CD-FB-03 | API spec + jest |
| **CD-FB-06-ROLE-SWITCH** | UI chuyển vai trò / công ty con (embed + standalone) | dev-fe | F3 + ADR RBAC | QA J-HRM persona |
| **CD-FB-07-WF-DYNAMIC** | Workflow resolver động (chức danh, cấp trên, parallel) | dev-be + dev-fe | CD-FB-02 | WF demo path PASS |
| **CD-FB-08-CONTRACT** | Tách lương/phụ cấp + lịch sử HĐ | dev-be + dev-fe | CD-FB-02 §4 | QA contract tab |
| **CD-FB-09-RECRUIT** | Job detail library + recruitment dashboard | dev-fe + dev-be | CD-FB-02 §5 | QA recruitment |
| **CD-FB-10-CONNECT-SEED** | Seed Connect: 1 DN tối thiểu + danh mục | dev-be + devops | F1 | `qc:fe-be-health` PASS |

---

## 4. Performance HRM — giả thuyết ban đầu (PM scan code)

| Triệu chứng | Phát hiện sơ bộ | File |
|-------------|-----------------|------|
| Dashboard embed gọi nhiều API | `view=dashboard` → employees + operations summary + payslips | `HrmWorkspacePanel.tsx` L325–335 |
| Mọi embed load pháp nhân | `fetchGroupMemberUnitsForCommandCenter` on mount | `HrmWorkspacePanel.tsx` L115+ |
| Group CEO mọi trang | `fetchHrmOperatingUnits` query | `HrmOperatingUnitFilterContext.tsx` |
| Dashboard standalone | `useEmployees` + `useDepartments` + `useLeaveRequestsData` + contracts count + attendance | `Dashboard.tsx` |

**Chờ evidence:** `CD-FB-03-PERF-AUDIT` (dev-fe) — network waterfall `:8088` / local.

---

## 5. Deliverable đã có (F2)

- `docs/client-delivery/templates/XBOS_Catalog_Import_Template_v2.xlsx`
- `docs/client-delivery/XBOS_CATALOG_EXCEL_IMPORT_GUIDE.md`

**CD-FB-01:** ba-docs đóng gói gửi khách + highlight sheet hạ tầng.

---

## 6. Exit program

- [ ] F2 template gửi khách — **pack sẵn sàng** `CUSTOMER_DEMO_TEMPLATE_PACK_20260620.md` + v2.xlsx (**chỉ cần sponsor gửi email**)
- [x] F7 perf: QA mount **7** API (−59%) — **QC GWC** `p1-hrm-perf-qc-01-20260719.md` (P2 Strict Mode / P3 cursor FE defer)
- [x] F3 role switch UAT — **QC GWC** 2026-07-19 (`cd-fb-06-role-switch-qc-20260719.md`); multi-hat N/A; P2 VI label residual
- [x] F4 workflow demo — **QC GWC**; canvas C-02 CLOSED (`cd-fb-07-wf-canvas-qc-20260719.md`); C-03 live leave position/parallel còn mở
- [~] F5/F6 — F5+F6 **QC GWC**; soft-nav + cold /active CLOSED; REC spawn submitter resolve in flight
- [ ] Connect pilot T8 READY — **cần sponsor** (lịch + data khách sau F2)

**NOT Phase 1 DONE** — scope mới từ khách post-demo. **NOT PROD / NOT F-DELIVERY** từ F3/F6 GWC.
