# PO — Rà soát liên kết nghiệp vụ toàn menu HRM

| Meta | Value |
|------|--------|
| **Program ID** | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| **Owner** | PM |
| **Opened** | 2026-08-06 |
| **Sponsor trigger** | REC free-text vị trí / so sánh trống / plan console → **mở rộng** Nhân sự · Chấm công · Lương · Cài đặt · Quy trình · … |
| **Locks** | U65 · U76 · spec-before-code · **NO CODE** until SRS delta confirmed per module |
| **Status** | **ACTIVE** — Wave A (paper audit) DISPATCHED |

---

## 0. Vấn đề lớp (class)

Không nghiệm thu «màn load 200». Fail khi:

| Class | Ví dụ (REC) | Áp dụng mọi menu |
|-------|-------------|------------------|
| **C-ORPHAN-FIELD** | Vị trí UV điền tay thay SELECT YCTD/catalog | Free-text / mock dropdown không neo SoT |
| **C-ORPHAN-SCREEN** | So sánh UV neo «tin tuyển» lệch MVP | Nút/modal không có dữ liệu nguồn từ bước trước |
| **C-SPINE-BREAK** | Plan ↔ YCTD ↔ UV không nối | Tab A không sinh khóa mang sang Tab B |
| **C-CONSOLE-CRASH** | Plan đầy lỗi console | Runtime block UX (triage FE riêng) |
| **C-SPEC-SHALLOW** | SRS có FR nhưng Diễn biến không khóa SELECT | BA phải vá trước Dev |

---

## 1. Phạm vi menu (Wave A — inventory + scorecard)

| # | Menu / khu | Route gợi ý | Squad seat Wave A |
|---|------------|-------------|-------------------|
| 1 | Tuyển dụng | `…/recruitment` | `PO-HRM-REC-E2E-LINKAGE-SPEC-01` (đã mở) |
| 2 | Nhân sự (NV / HĐ / BH / QSĐ) | `…/employees` · contracts · insurance · decisions | `PO-HRM-E2E-LINK-EMP-SPEC-01` |
| 3 | Chấm công + nghỉ | `…/attendance` | `PO-HRM-E2E-LINK-ATT-SPEC-01` |
| 4 | Tiền lương | `…/payroll` | `PO-HRM-E2E-LINK-PAY-SPEC-01` |
| 5 | Cài đặt + danh mục | `…/settings*` / settings-catalogs | `PO-HRM-E2E-LINK-CFG-SPEC-01` |
| 6 | Quy trình (HRM read-only + XBOS WF) | `…/processes` + XBOS workflow/inbox | cùng CFG seat |
| 7 | Dashboard / tasks / internal services | `…/dashboard` · tasks · internal_services | scorecard trong AUDIT-01 (P1 nếu không P0) |

**Out Wave A code:** không Dev mutate business cho đến khi seat SPEC PASS + ba-docs merge + TechSpec/DB/API khi cần.

---

## 2. SoT bắt buộc (read_first)

1. `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` — spine Hire-to-Pay / Leave / Attendance
2. `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` — menu ↔ API ↔ FK (fidelity; **không** thay BA UX linkage)
3. `docs/hrm/SRS_HRM_ENTERPRISE.md` (hoặc SRS module tương ứng) — FR / Diễn biến
4. `docs/program/PROGRAM_JOURNEY_MAP.md` — J-* liên quan
5. `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` — UF-HRM-*
6. UI thực: `apps/**` HR embed recruitment/employees/attendance/payroll/settings — **đọc so sánh**, không sửa

---

## 3. Exit Wave A (mỗi seat)

Evidence `docs/program/specs/PO-HRM-E2E-LINK-*-SPEC-01.md` gồm:

1. Bảng **nút / tab / modal → FR/UC → khóa mang → màn kế** (spine)
2. Mỗi class C-* với verdict: `impl_gap` | `spec_gap` | `console` | `ok` | `out_mvp`
3. Draft SRS ADD (chỉ draft — ba-docs merge sau)
4. `P0_fix_queue` copy-ready cho PM (Dev chỉ sau confirm)
5. Handoff: `completion_report` · `next_owner` · `next_dispatch_prompt` · `ack_status: PASS_TO_PM`

---

## 4. Honesty

- `recruitment_uat_ready` / module UAT-ready = **NO** cho đến khi P0 C-* đóng + QA browser U65.
- Matrix fidelity G-FID ≠ UX E2E linkage PASS.
