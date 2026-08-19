# HRM Employees — Menu Fidelity Matrix (U87 · M3 inventory)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-INVENTORY-01` |
| **Program** | `PO-MENU-FIDELITY-01` · U87 · M3 (Employees first after Attendance) |
| **User path** | Command Center → HRM embed → **Nhân sự** (`Employees.tsx` · `EmployeeProfile`) |
| **Routes** | Embed `…/command-center/hrm/employees` · `/hr/employees` · `/employees/:id` · alias `/dashboard` list |
| **Code anchor (read-only cite)** | `apps/web/hrm/src/pages/Employees.tsx` · profile tabs under `components/employee/*` |
| **Generated** | 2026-08-04 |
| **uat_done** | `false` |
| **Employees CLOSED** | **false** |
| **Attendance** | **NOT CLOSED** (M2 wave honesty GWC only · Face #9 HOLD) — do not invent |
| **Runtime legend** | `LIVE` \| `PARTIAL` \| `STUB_UI` \| `BROKEN` \| `UNKNOWN` — **EXPORT-01** 2026-08-04: UNKNOWN=0 · LIVE=26 · PARTIAL=#9+#18 · BROKEN=0 · #9 SPEC_GAP owners set · Employees CLOSED=false |
| **Sources** | HDSD CH06 · `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` · by-uc HRM-EM-* / HRM-IM-* · SRS refs UC-HRM-21 / FR-HRM-IM-01 / FR-UC-H01 (**no overwrite** `docs/hrm/SRS.md`) · [`po-mfd-m3-emp-qa-runtime-01.md`](../../evidence/po-mfd-m3-emp-qa-runtime-01.md) |

## UC / TC pack map

| File / ID | Title |
|-----------|--------|
| HRM-EM-01 | Tạo hồ sơ nhân viên |
| HRM-EM-02 | Xem danh sách nhân viên |
| HRM-EM-03 | Cập nhật hồ sơ nhân viên |
| HRM-EM-04 | Lưu trữ (xóa mềm) nhân viên |
| HRM-EM-05 | Khôi phục nhân viên đã lưu trữ |
| HRM-IM-01..04 | Nhập Excel (template / preview / commit / scope) |
| Menu TC | `HRM-EMPLOYEES.md` — SCR-* / FN-* / TC-EMP-* |
| HDSD | `HDSD_XEVN_CH06_HRM_NHAN_SU.md` |
| UF / J-* | UF-HRM-01 · UF-HRM-03 · UF-HRM-MENU-02/02b · J-HRM-01 · J-HRM-02 · J-HRM-IM-01 |

---

## Matrix (surface inventory — runtime stamped RUNTIME-01)

| # | Cluster | menu_path | ui_surface | functions[] | business_meaning | links | srs_ref | techspec_ref | api_contract | data_class | config_how | runtime | uc_tc_map | owner_next | priority |
|---|---------|-----------|------------|-------------|------------------|-------|---------|--------------|--------------|------------|------------|---------|-----------|------------|----------|
| 1 | C1 | CC→HRM→Nhân sự→Danh sách | SCR-LIST · `/employees` | Load; F5; subtitle count | Master workforce list in JWT company scope | Summary headcount · Attendance settings-emp · Payroll | UC-HRM-21 · HDSD CH06 §2.1 | TECHSPEC employees list · CODE Employees.tsx | `GET /api/hrm/employees` | TXN/REF mix | company_id JWT · status REF | **LIVE** | HRM-EM-02 · TC-EMP-L-* · [`po-mfd-m3-emp-list-01.md`](../../evidence/po-mfd-m3-emp-list-01.md) 2026-08-04 | qa | P0 |
| 2 | C1 | …→Tìm kiếm | SCR-LIST search | Keyword debounce | Server-side find NV by name/code | — | UC-HRM-21 | — | GET `keyword=` | TXN | — | **LIVE** | HRM-EM-02 · LIST-01 | qa | P0 |
| 3 | C1 | …→Lọc trạng thái | SCR-LIST status | Select active/probation/… | Workforce status slice | SoftDel archive | UC-HRM-21 | — | GET `status=` | REF | status catalog | **LIVE** | HRM-EM-02 · LIST-01 | qa | P0 |
| 4 | C1 | …→Lọc phòng ban | SCR-LIST dept | Client filter page | Dept view on current page | Catalog dept REF | FR-HRM-SC-MD-02 | — | client filter | REF | XBOS/HRM catalog | **LIVE** | TC-EMP-L-HP-006 · LIST-01 (empty honesty) | qa | P1 |
| 5 | C1 | …→Phân trang | SCR-LIST page | Prev/next · range m–n/total | Scale list for 1000+ NV | — | UC-HRM-21 | — | GET `page`/`page_size` | TXN | — | **LIVE** | TC-EMP-L-HP-007 · LIST-01 | qa | P0 |
| 6 | C1 | …→Cột công ty / nhãn | SCR-LIST columns | View company_display_name | Plane A/B label honesty (no raw slug) | FR-HRM-EMP-COL-01 · Company headcount | FR-HRM-EMP-COL-01 · §15 | — | list DTO display fields | REF | membership labels | **LIVE** | TC-EMP-L-HP-016 · LIST-01 | qa | P0 |
| 7 | C2 | …→Thêm / Sửa NV | DLG-FORM | Open; 4 tabs; Lưu/Hủy | Create/update core employee master | Catalog · Manager · SoftDel | HRM-EM-01/03 · FR-UC-H01 · UF-HRM-03 | EmployeeFormDialog | `POST/PATCH /employees` | TXN | catalog dept/position | **LIVE** | HRM-EM-01/03 · TC-EMP-F-* · [`po-mfd-m3-emp-create-update-01.md`](../../evidence/po-mfd-m3-emp-create-update-01.md) 2026-08-04 (create+FD; edit SKIP) | qa | P0 |
| 8 | C3 | …→Nhập Excel | DLG-IMPORT | Template; upload; preview; Hủy; Import | Bulk onboard with preview-before-commit | Catalog field map | FR-HRM-IM-01/02 · J-HRM-IM-01 | import dialog | preview/commit APIs | TXN | company scope required | **LIVE** (preview+Hủy; commit IM-02 not exercised) | HRM-IM-* · TC-EMP-X-* · [`po-mfd-m3-emp-import-01.md`](../../evidence/po-mfd-m3-emp-import-01.md) 2026-08-04 | qa | P0 |
| 9 | C3 | …→Xuất | DLG-EXPORT | Columns; xlsx/csv | HRIS extract | Reports | SPEC_GAP FE↔Nest wire + Nest empty/depth | client XLSX | Nest `POST /spreadsheet/export` unused | RPT | column checkbox | **PARTIAL** + SPEC_GAP (client dialog LIVE; Nest 201 header-only / not wired) | TC-EMP-X-HP-008+ · [`po-mfd-m3-emp-export-01.md`](../../evidence/po-mfd-m3-emp-export-01.md) 2026-08-04 · owners dev-fe+dev-be | qa | P1 |
| 10 | C4 | …→Hồ sơ (shell) | SCR-DETAIL · `/employees/:id` | Back; Sửa; pin tabs; groups | Single-employee cockpit | Contracts · Payroll · Attendance | UC-HRM-21 detail · J-HRM-02 | EmployeeProfile | `GET /employees/:id` | TXN | RBAC view_salary | **LIVE** | HRM-EM-03 · TC-EMP-P-* · [`po-mfd-m3-emp-detail-01.md`](../../evidence/po-mfd-m3-emp-detail-01.md) 2026-08-04 | qa | P0 |
| 11 | C4 | …→Hồ sơ→Thông tin chung | SCR-TAB-GENERAL | View fields; avatar; timeline widget | Identity + org placement + manager | Manager FR-UC-H01 | UC-HRM-21 §15 | — | GET employee + manager | TXN | catalogs | **LIVE** | TC-EMP-P-HP-009/010 · DETAIL-01 VI labels | qa | P0 |
| 12 | C4 | …→Hồ sơ→Lương (gate) | SCR-TAB-SALARY | Chart; PermissionFallback | Compensation visibility by role | Payroll payslips | UF-HRM-MENU-02b | — | payroll reads / gate | TXN | view_salary | **LIVE** (CEO spot; deny→P1-6) | TC-EMP-P-AU-004 · DETAIL-01 empty honesty | qa | P1 |
| 13 | C5 | …→⋯→Xóa mềm | POP-ARCHIVE | Confirm + reason | Soft-delete hide from active list | Đã xóa dialog | HRM-EM-04 | — | `POST :id/archive` | TXN | delete perm | **LIVE** (RO dialog+Hủy) | HRM-EM-04 · RUNTIME-01 | qa | P1 |
| 14 | C5 | …→Đã xóa (n) | DLG-DELETED | List archived | Audit recycle bin | Restore | HRM-EM-05 | — | GET include_archived | TXN | — | **LIVE** | HRM-EM-05 · RUNTIME-01 | qa | P1 |
| 15 | C5 | …→Khôi phục | POP-RESTORE | Confirm restore | Return to active workforce | List | HRM-EM-05 | — | `POST :id/restore` | TXN | — | **LIVE** (CTA presence RO) | HRM-EM-05 · RUNTIME-01 | qa | P1 |
| 16 | C6 | …→Hồ sơ→Hợp đồng | SCR-TAB-CONTRACT | CRUD HĐ; renew | Employment contract SoT link | UC-HRM-INT-02 · Contracts menu | INT-02 | contracts API | `/contracts` | TXN | — | **LIVE** | TC-EMP-C-* · RUNTIME-01 GET 200 | qa | P1 |
| 17 | C6 | …→Hồ sơ→BH / tài chính nhạy | SCR-TAB-INSURANCE · form finance | View/CRUD gated | Insurance numbers · salary fields | Payroll · BH module | view_salary BR | — | insurance APIs | TXN | RBAC | **LIVE** | TC-EMP-P-AU · RUNTIME-01 | qa | P1 |
| 18 | C6 | …→Hồ sơ→Việc làm | SCR-TAB-WORK · EmployeeJobList | Job dialog CRUD | Assignment board — **TC marks local/mock** | — | SPEC_GAP / mock signal | — | local/API TBD | CFG/TXN? | **PARTIAL** | TC-EMP-C-HP-006 · RUNTIME-01 Job honesty | ba-process | P2 |
| 19 | C6 | …→Hồ sơ→Đào tạo | SCR-TAB-TRAINING | CRUD khóa | Capability development | Training menu | — | — | `/training` | TXN | — | **LIVE** | TC-EMP-M-TRAIN · [`po-mfd-m3-emp-training-qa-01.md`](../../evidence/po-mfd-m3-emp-training-qa-01.md) 2026-08-04 · fix [`po-mfd-m3-emp-training-fix-01.md`](../../evidence/po-mfd-m3-emp-training-fix-01.md) | qa | P1 |
| 20 | C6 | …→Hồ sơ→Tài sản | SCR-TAB-ASSETS | CRUD cấp phát | Asset assignment | XBOS assets | — | — | `/assets` | TXN | — | **LIVE** | TC-EMP-M-ASSET · RUNTIME-01 | qa | P2 |
| 21 | C6 | …→Hồ sơ→KPI | SCR-TAB-KPI | CRUD KPI | Performance slice on profile | Performance module | — | — | kpi hook | TXN/RPT | — | **LIVE** | TC-EMP-M-KPI · RUNTIME-01 | ba-process | P2 |
| 22 | C6 | …→Hồ sơ→CV / bằng / CC / kỹ năng | SCR-TAB-CV/DEGREES/CERT/SKILLS | Upload + CRUD | Career credentials | — | — | — | degrees/skills/resume-files | TXN | — | **LIVE** | TC-EMP-M-DEG/CERT/SKILL · RUNTIME-01 | qa | P2 |
| 23 | C6 | …→Hồ sơ→Khen thưởng / kỷ luật | SCR-TAB-REWARDS | 2 dialogs | HR discipline trail | — | — | — | rewards/discipline | TXN | — | **LIVE** | TC-EMP-M-REWARD · RUNTIME-01 | qa | P2 |
| 24 | C6 | …→Hồ sơ→Gia đình | SCR-TAB-FAMILY | Members + emergency | Personal dependents | — | — | — | family APIs | TXN | — | **LIVE** | TC-EMP-M-FAMILY · RUNTIME-01 shell | qa | P2 |
| 25 | C6 | …→Hồ sơ→Lịch sử công việc | SCR-TAB-WORKHIST · timeline | Lazy list; add/edit | Career timeline | UC-HRM-29 mobile | work-timeline | — | work-timeline APIs | TXN | — | **LIVE** | FN-WTL-* · RUNTIME-01 | qa | P1 |
| 26 | C7 | …→RBAC create/edit/delete | SCR-LIST actions | Hide/disable CTA | Least privilege | IAM | ADR-HRM-RBAC | — | 403 / hidden | CFG | roles | **LIVE** (ceo CTA spot) | TC-EMP-L-AU-* · RUNTIME-01 · deny-path later | qa | P1 |
| 27 | C7 | …→Quản lý trực tiếp picker | DLG-FORM manager | Pick; reject self | Org reporting line | Org chart | FR-UC-H01/H03 | EmployeeManagerPicker | `manager_id` | TXN | employees REF | **LIVE** | TC-EMP-F-HP-006/FD-007 · RUNTIME-01 | qa | P1 |
| 28 | C8 | List→Detail scope parity | SCR-LIST→DETAIL | Click row J-* | Same scope resolver list vs get-by-id (main rollup) | ADR scope ladder | UC-HRM-21 · J-HRM-01/02 · BR-INT-* | scope-context | GET list + GET :id | TXN | company_id main vs slug | **LIVE** | FN-SCOPE-PARITY · TC-EMP-L-FD-009 · [`po-mfd-m3-emp-scope-01.md`](../../evidence/po-mfd-m3-emp-scope-01.md) 2026-08-04 | qa / dev-be | **P0** |

---

## Summary counts (inventory)

| Metric | Value |
|--------|------:|
| **Total surfaces** | 28 |
| **Mapped to HRM-EM-* / HRM-IM-*** | 28 (trace via TC pack; depth varies) |
| **Runtime UNKNOWN** | **0** |
| **LIVE / PARTIAL / STUB / BROKEN** | **26** / **2** (#9 Xuất · #18 Job) / **0** / **0** |
| **Employees CLOSED** | **false** |
| **Attendance CLOSED** | **false** (orthogonal · M2 GWC honesty only) |
| **RUNTIME evidence** | [`po-mfd-m3-emp-qa-runtime-01.md`](../../evidence/po-mfd-m3-emp-qa-runtime-01.md) · #19 delta [`po-mfd-m3-emp-training-qa-01.md`](../../evidence/po-mfd-m3-emp-training-qa-01.md) 2026-08-04 |

---

## Cluster legend

| Cluster | Meaning |
|---------|---------|
| C1 | List shell — load, filter, page, labels |
| C2 | Create/update form |
| C3 | Import / export |
| C4 | Profile shell + general / salary gate |
| C5 | Soft-delete lifecycle |
| C6 | Profile nested tabs / modules |
| C7 | RBAC + manager |
| C8 | Cross-nav / org scope parity (J-*) |

---

## Next owners

| Priority | work_item_id | Owner |
|----------|--------------|-------|
| P0 Training crash | `PO-MFD-M3-EMP-TRAINING-FIX-01` + `PO-MFD-M3-EMP-TRAINING-QA-01` | **CLOSED** — #19 **LIVE** |
| P1 Export honesty | `PO-MFD-M3-EMP-EXPORT-01` | **CLOSED** PASS_TO_PM — #9 remains PARTIAL+SPEC_GAP |
| P1 Export wire | `PO-MFD-M3-EMP-EXPORT-WIRE-01` | dev-fe (FE→Nest or BA client SoT) |
| P1 Nest empty/depth | `PO-MFD-M3-EMP-EXPORT-NEST-01` | dev-be (main 0 rows · page_size 100 · csv-only) |
| P2 | Job honesty #18 | ba-process |
| Backlog SoT | `HRM-EMPLOYEES_M3_BACKLOG.md` | pm orchestration |
| RUNTIME seat | `PO-MFD-M3-EMP-QA-RUNTIME-01` | **CLOSED** PASS_TO_PM |

---

## Explicit non-claims

- Do **not** invent Attendance CLOSED / Face LIVE / Employees CLOSED / `uat_done=true` / PROD-READY.
- Do **not** start Dev `apps/**` from this inventory seat.
- Do **not** use seed to create list data for UF 🟢 (U65).
