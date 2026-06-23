# UIUX Interaction Audit Matrix — :8088 (XBOS + HRM)

**work_item_id:** `P1-UIUX-AUDIT-8088-R1`  
**Owner:** QA  
**Rule:** Browser-only U65 · zero-seed  
**Evidence:** `docs/qa/evidence/p1-uiux-audit-8088-r1-20260620.md`  
**Audited:** 2026-06-20

## Cách ghi

Mỗi hàng: **PASS** / **FAIL** / **PARTIAL** + ghi chú. FAIL bắt buộc ghi `gap_id` (G-UX-01..05).

| Cột | Ý nghĩa |
|-----|---------|
| **CFM** | Có confirm modal trước delete / status change / bulk mutate? |
| **LOD** | Có loading/disable khi API chạy? |
| **NAV** | Chuyển tab/màn mượt (<300ms flash, có shell)? |
| **FBK** | Success/error user thấy rõ? |

---

## Track A — XBOS / Command Center

| ID | Route / click path | CFM | LOD | NAV | FBK | gap_id |
|----|-------------------|-----|-----|-----|-----|--------|
| UX-XBOS-01 | `/command-center` inbox → task drawer | N/A | **PASS** (HRM-02 QA) | **PASS** (HRM-02 QA) | PASS | — |
| UX-XBOS-02 | Settings → Đơn vị thành viên → mở form | N/A | n/a | **PASS** (HRM-02 QA) | N/A | — |
| UX-XBOS-03 | Form → Lưu thay đổi pháp nhân | N/A | **PASS** (foundation-02 QA) | N/A | PARTIAL | — |
| UX-XBOS-04 | Cổ đông → xóa 1 dòng | **PASS** (foundation QA) | N/A | N/A | PARTIAL | — |
| UX-XBOS-05 | Cổ đông → chọn nhiều → Xóa đã chọn | **PASS** (foundation QA) | N/A | N/A | PARTIAL | — |
| UX-XBOS-06 | Cổ đông → ✓ submit row | N/A | **PASS** (foundation QA R2) | N/A | PARTIAL | — |
| UX-XBOS-07 | Tài liệu → upload file | N/A | PARTIAL | N/A | N/A | — |
| UX-XBOS-08 | Tài liệu → xóa dòng | **PASS** (foundation QA) | N/A | N/A | PARTIAL | — |
| UX-XBOS-09 | Catalog governance → Duyệt/Từ chối | **PASS** (foundation-02 QA) | **PASS** (foundation-02 QA) | N/A | PARTIAL | G-UX-04 |
| UX-XBOS-10 | RACI matrix cell autosave | N/A | PARTIAL | **PASS** (defer-batch QA) | N/A | — |
| UX-XBOS-11 | Workflow canvas save | N/A | **PASS** (foundation-02 QA) | N/A | PARTIAL | G-UX-04 |
| UX-XBOS-12 | Phòng/ban → xóa (window.confirm?) | **PASS** (foundation-02 QA) | N/A | N/A | N/A | — |
| UX-XBOS-13 | `/dashboard/settings/vendors` or `kpi-metrics` delete | **PASS** (HRM-02 QA) | **PASS** (HRM-02 QA) | N/A | N/A | **PASS** F5 (BE scope parity + QA spot 20260620) |

---

## Track B — HRM embed (`/command-center/hrm/*` + `/hr/*`)

| ID | Route / click path | CFM | LOD | NAV | FBK | gap_id |
|----|-------------------|-----|-----|-----|-----|--------|
| UX-HRM-01 | Employees list → mở detail | N/A | PARTIAL | **PASS** (HRM-02 QA) | PASS | — |
| UX-HRM-02 | Employee → xóa / deactivate | PASS | PASS | N/A | PASS | — |
| UX-HRM-03 | Contracts → terminate/delete | PASS | PASS | N/A | PASS | — |
| UX-HRM-04 | Recruitment → tạo đề xuất | PASS | PASS | N/A | PASS | — |
| UX-HRM-05 | Attendance → duyệt đơn | PASS | PASS | N/A | PASS | — |
| UX-HRM-06 | Settings catalogs → sync | N/A | PASS | N/A | PASS | — |
| UX-HRM-07 | Insurance → save row | PASS | PARTIAL | N/A | PASS | — |
| UX-HRM-08 | Decisions → publish | PASS | PASS | N/A | PASS | — |
| UX-HRM-09 | Member persona `du-lich.hr` — employees mutate | PASS | PARTIAL | **PASS** (defer-batch QA) | PASS | — |
| UX-HRM-10 | Sidebar chuyển tab (embed shell) | N/A | **PASS** (HRM-02 QA) | **PASS** (HRM-02 QA) | N/A | — |

---

## Gap summary

| gap_id | Severity | Count FAIL/PARTIAL rows |
|--------|----------|-------------------------|
| G-UX-01 | **P0** (CC) + P1 (native confirm) | **CLOSED** XBOS-04,05,08,09,12,13 (foundation + HRM-02 QA 2026-06-20) |
| G-UX-02 | **P0** | **CLOSED** XBOS-01,03,06,09,11,13 LOD (foundation + HRM-02 QA); **OPEN PARTIAL** HRM-01 profile cold LOD |
| G-UX-03 | P1 | **CLOSED (scoped)** XBOS-01,02,10; HRM-01,09,10 (HRM-02 + defer-batch QA 2026-06-20) |
| G-UX-04 | P1 | XBOS-03,09,11 (~~06~~ closed) |
| G-UX-05 | P2 | (roll-out — see sponsor doc) |

**QC R2 (foundation-01):** `docs/qa/evidence/p1-uiux-fe-foundation-01-qc-r2-20260620.md` — **GWC scoped** G-UX-01 CFM UX-XBOS-04/05/08 @ `:8088`.

**QC combined (foundation-01+02):** `docs/qa/evidence/qc-p1-uiux-foundation-combined-8088-20260620.md` — **GWC scoped** G-UX-01/02 **P0 CC closed** UX-XBOS-03/04/05/06/08/09/11/12 @ `:8088`; P1 carry G-UX-03 NAV, vendors, HRM embed.

**QC HRM-02 (NAV wave):** `docs/qa/evidence/qc-p1-uiux-fe-hrm-02-8088-20260620.md` — **GWC scoped** G-UX-03 NAV slice + UX-XBOS-13 CFM/LOD **closed** UX-XBOS-01/02/13, UX-HRM-01/10 @ `:8088`; carry UX-XBOS-10, UX-HRM-09 member. **Vendor F5 closed:** `p1-vendor-delete-f5-8088-be-20260620.md` (BE + QA PASS).

**QC defer-batch (G-UX-03 close):** `docs/qa/evidence/qc-p1-ux-defer-uf-batch-8088-20260620.md` — **GWC scoped** G-UX-03 **UX-XBOS-10 + UX-HRM-09 NAV closed**; UF-XBOS-06 upload/GET/F5 @ `:8088`; carry **R-UF06-FILE-URL** P2 devops (`XBOS_PUBLIC_BASE_URL`).

---

## Exit QA R1

- Evidence: `docs/qa/evidence/p1-uiux-audit-8088-r1-20260620.md`
- Tổng FAIL P0 → `pm_dispatch_hint` cho dev-fe wave **`P1-UIUX-FE-FOUNDATION-01`**
- **ack_status:** PASS_TO_PM
