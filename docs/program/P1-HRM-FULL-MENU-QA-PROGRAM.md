# P1 — HRM Full Menu QA/QC Program (sponsor 2026-07-17)

> **STATUS 2026-07-17 — CLOSED WAVE · GO** (Dev8088 group CEO full-menu slice).
> Roster **16 PASS + 1 ⚪ deferred (tools, evidenced) = 17/17 evidenced**; **0 product P0/P1/P2 open**; L2.5 J-HRM-02/03/04/05/06/07 PASS.
> QC close: `docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md` · P2 close: `docs/qa/evidence/qc-p1-hrm-p2-residual-close-20260717.md` (@7563c4d).
> Open (non-blocking): **P3 optional** Quỹ lương side card `0 VNĐ` · **P3 PROCESS** QA pack schema · **Phase 2** Tools live CRUD (**⚪ deferred**).
> **NOT** Phase 1 DONE · **NOT** PROD-READY · Tools **not** CRUD-promoted.

**Trigger:** Sponsor yêu cầu QA/QC **toàn bộ** chức năng HRM trên `:8088` — mỗi menu một QA; kiểm console + performance + đúng nghiệp vụ; chuẩn bị scale **≥1000 concurrent users**.

**URL:** `http://14.225.217.232:8088`  
**Persona chính:** `ceo@xe.vn` / `Xevn@2026` (`company_id=main`)  
**Persona phụ (scope):** `du-lich.ceo@xe.vn`, `du-lich.hr@xe.vn` khi menu có AC scope member.

**SoT menu:** `apps/web/web-portal/src/components/layout/Sidebar.tsx` · `apps/web/web-portal/src/modules/hrm/types.ts` · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md`

**U65:** Zero-seed — login → menu → click → Lưu (nếu SRS mutate) → F5 → quan sát FE. Cấm `pnpm seed:*` trong evidence nghiệm thu.

---

## Lớp kiểm tra (mỗi QA menu)

| Lớp | PASS khi |
|-----|----------|
| **L0** | Tab load; không banner ERROR; không 409 scope; không `54321` |
| **L2** | UI có dữ liệu hoặc empty+200 đúng SRS; không toast lỗi im lặng |
| **Console** | Không `error` đỏ; ghi `warn` (duplicate key, 404 asset, …) — P0 nếu lặp hoặc ảnh hưởng UX |
| **Network** | API chính 2xx; ghi endpoint >3s (P1 perf); ghi gọi trùng ×N (P1) |
| **L2.5** | List→detail / cross-nav theo J-* liên quan (nếu có) |
| **Mutate** | Theo SRS: nhập → Lưu → Network POST/PUT 2xx → F5 còn data (nếu menu có CRUD) |

**Evidence mẫu:** `docs/qa/evidence/p1-hrm-menu-{menu_key}-20260717.md`

---

## Roster — 1 QA / 1 menu (17 + performance app-only)

| work_item_id | Menu | Route `:8088` | UC / P-CC | QA owner |
|--------------|------|---------------|-----------|----------|
| P1-HRM-MENU-QA-DASHBOARD | Tổng quan | `/command-center/hrm/dashboard` | UC-HRM-20 | wave-1 |
| P1-HRM-MENU-QA-EMPLOYEES | Nhân sự | `/command-center/hrm/employees` | P-CC-03 · J-HRM-02 | wave-1 |
| P1-HRM-MENU-QA-CONTRACTS | Hợp đồng | `/command-center/hrm/contracts` | P-CC-04 · J-HRM-03 | wave-1 |
| P1-HRM-MENU-QA-INSURANCE | Bảo hiểm | `/command-center/hrm/insurance` | P-CC-05 · J-HRM-04 | **PASS** empty-mask CLOSED · `gwc-hrm-ins-empty-mask-retest-20260717.md` |
| P1-HRM-MENU-QA-RECRUITMENT | Tuyển dụng | `/command-center/hrm/recruitment` | P-CC-06 · J-HRM-05 | wave-2 |
| P1-HRM-MENU-QA-ATTENDANCE | Chấm công | `/command-center/hrm/attendance` | P-CC-07 · J-HRM-06 | wave-2 |
| P1-HRM-MENU-QA-PAYROLL | Tiền lương | `/command-center/hrm/payroll` | P-CC-08 · J-HRM-07 | wave-2 |
| P1-HRM-MENU-QA-DECISIONS | Quyết định | `/command-center/hrm/decisions` | UC-HRM-27 | **PASS** wave-2 · `p1-hrm-full-menu-fix-bundle-qa-02-20260717.md` |
| P1-HRM-MENU-QA-TASKS | Công việc | `/command-center/hrm/tasks` | HRM-OP-02 | wave-3 |
| P1-HRM-MENU-QA-PROCESSES | Quy trình | `/command-center/hrm/processes` | XBOS-DM-HRM-14 | **PASS** AC-PROC · `p1-hrm-processes-fe-01-qa-20260717.md` |
| P1-HRM-MENU-QA-INTERNAL-SERVICES | DVC nội bộ | `/command-center/hrm/internal_services` | HRM-SV-02 | wave-3 |
| P1-HRM-MENU-QA-TOOLS | Công cụ & TB | `/command-center/hrm/tools_equipment` | deferred | **⚪ deferred** · L0+honest empty · `p1-hrm-menu-tools_equipment-20260717.md` |
| P1-HRM-MENU-QA-COMPANY | Phòng/Ban & Công ty | `/command-center/hrm/company` | UC-HRM-03 | **PASS** wave-2 + dept stub · qa-02 |
| P1-HRM-MENU-QA-REPORTS | Báo cáo | `/command-center/hrm/reports` | HRM-PR-06 | wave-4 |
| P1-HRM-MENU-QA-SETTINGS | Cài đặt | `/command-center/hrm/settings` | HRM-SC-01..09 | **PASS** UF-HRM-10 · `d-hrm-set-item-persist-01-qa-retest-20260717.md` |
| P1-HRM-MENU-QA-HRM-AI | UniAI | `/command-center/hrm/hrm_ai` | N/A transactional | **PASS** · `p1-hrm-menu-hrm_ai-retest-20260717.md` |
| P1-HRM-MENU-QA-GUIDE | Hướng dẫn | `/command-center/hrm/guide` | static | wave-5 |
| P1-HRM-MENU-QA-PERFORMANCE | Đánh giá (app) | `/command-center/hrm/performance` | HRM-PF-01 | **PASS** portal deep-link · qa-02 |

\* `performance` có trong HRM app sidebar; portal registry chưa liệt kê — QA deep-link URL; ghi spec_gap nếu 404.

---

## Performance & scale (song song governance)

| work_item_id | Owner | Mục tiêu |
|--------------|-------|----------|
| P1-HRM-NFR-1000-SA | technical-manager | ADR/delta: pagination, cache, RQ/coalescer, DB index, embed iframe — target p95 list <2s @1100 NV |
| P1-HRM-FULL-MENU-QC | qc | **GO** 2026-07-17 — program CLOSED wave · `qc-p1-hrm-p2-residual-close-20260717.md` (P2 residuals closed @7563c4d) |

---

## Exit criteria program

- 17/17 menu evidence `PASS` hoặc `GWC` có owner + expiry
- Console P0 = 0 trên slice đã QA
- QC GO hoặc GO WITH CONDITIONS (perf residual có roadmap)
- Cập nhật `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` cột Dev8088 nếu cờ đổi
