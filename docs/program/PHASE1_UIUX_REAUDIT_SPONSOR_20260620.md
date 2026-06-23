# UI/UX Re-audit — Sponsor feedback 2026-06-20

**Trigger:** Sponsor chạy vài chức năng trên `:8088` — chuyển màn **giật/chậm**, thao tác **xóa/cập nhật dữ liệu không confirm**, **thiếu loading** → cảm giác «sượng», không đạt chuẩn luxury/Apple-style (`.cursorrules` §2).

**PM policy (U67):** PM **không** tự sửa `apps/**` — đánh giá + dispatch QA/Dev-FE.

---

## 1. Executive assessment (PM)

| Hạng mục | XBOS (web-portal / CC) | HRM (embed + standalone) | Verdict |
|----------|------------------------|---------------------------|---------|
| **Chuyển màn / perceived performance** | `CommandCenterPage` monolith ~10k dòng; tab đổi re-render nặng; skeleton chỉ một phần (`animate-pulse`); iframe HRM mount chậm | Một số màn có `animate-fade-in` + `Loader2`; không đồng nhất giữa tab | **FAIL** — không mượt, cảm giác chậm |
| **Confirm trước mutate** | Chỉ **1** `window.confirm` (xóa phòng/ban). Cổ đông, tài liệu, bulk xóa, workflow, catalog settings: **xóa thẳng** | Nhiều màn dùng `AlertDialog` (Employees, Contracts, Company…) — **không đủ coverage** toàn app | **FAIL** — lệch chuẩn nghiệp vụ |
| **Loading / busy state** | Nút ✓/🗑 không disable khi API chạy; upload mới có `Đang tải lên…` (hotfix gần đây) | React Query `isPending` ở vài chỗ; nhiều nút save/delete vẫn «nhấn được» khi đang ghi | **PARTIAL** |
| **Feedback lỗi / success** | `publishMessage` banner — dễ miss; không toast nhất quán | Sonner/toast ở vài module | **PARTIAL** |
| **Số lớn / readability** | Vốn điều lệ + góp vốn đã format `.`; bảng member units / settings khác chưa | `toLocaleString('vi-VN')` rải rác | **PARTIAL** |

**Kết luận sponsor-grade:** **NOT UAT-ready về UX interaction** dù nhiều UF browser 🟢 — matrix hiện tại đo **load + mutate 2xx**, chưa đo **interaction quality** (confirm, loading, transition).

---

## 2. Gap taxonomy (điều phối wave)

### G-UX-01 — Destructive / data mutation without confirm (P0)

**Rule:** Mọi DELETE, bulk delete, approve/reject, status flip, submit row → **modal confirm** (tiếng Việt, tên đối tượng, nút Hủy primary-safe).

| Khu vực | Ví dụ hiện trạng | Owner |
|---------|------------------|-------|
| CC Cổ đông | `deleteShareholderRow`, bulk `Xóa đã chọn` — không confirm | dev-fe |
| CC Tài liệu | `deleteLegalDocRow` — không confirm | dev-fe |
| CC Catalog / WF / dept | Hỗn hợp; 1 `window.confirm` native | dev-fe |
| Settings pages (Vendors, KPI…) | `handleDelete` trực tiếp | dev-fe |
| HRM | Audit từng tab — liệt kê exception | qa → dev-fe |

### G-UX-02 — Missing inline / button loading (P0)

**Rule:** Khi `await` API >0ms → disable trigger + spinner (`Loader2` / `animate-spin`) hoặc skeleton; tránh double-submit.

| Khu vực | Hiện trạng |
|---------|------------|
| CC submit cổ đông/tài liệu | Không busy flag |
| CC `Lưu thay đổi` pháp nhân | Cần audit |
| HRM forms | Per-screen QA matrix |

### G-UX-03 — Transition / jank (P1)

- CC: đổi settings menu / member unit form — full panel swap không transition; có thể split lazy + `Suspense` + fade 150–200ms.
- HRM embed: portal → iframe flash trắng; cần bridge loading shell.
- Tránh `active:scale-95` làm cảm giác «giật» trên nút nhỏ — giữ subtle hoặc chỉ primary CTA.

### G-UX-04 — Empty / error / success consistency (P1)

- Chuẩn hóa: toast (success/error) + banner chỉ cho blockers.
- Empty state có CTA (đã có rule `uiux-quality-accessibility.mdc`).

### G-UX-05 — Number / date display (P2)

- `formatViGroupedInteger` mới ở CC cổ đông — roll-out có kiểm soát theo QA list.

---

## 3. Chuẩn áp dụng (acceptance)

Tham chiếu: `.cursorrules` §2 UI luxury · `uiux-quality-accessibility.mdc` · `PHASE1_EXCELLENCE_PROGRAM.md` T5.

| AC | PASS |
|----|------|
| AC-UX-CFM-01 | 100% DELETE/bulk delete trên pilot matrix có confirm modal (không `window.confirm` trừ waiver) |
| AC-UX-LOD-01 | 100% POST/PUT/DELETE từ nút UI có busy state ≥200ms hoặc optimistic + rollback |
| AC-UX-NAV-01 | Chuyển tab CC settings + HRM menu: không flash trắng >300ms; có loading shell |
| AC-UX-A11Y-01 | Focus trap trong modal; Esc đóng; nút destructive `variant=destructive` |

---

## 4. Dispatch wave (execution)

| # | work_item_id | Role | Phạm vi |
|---|--------------|------|---------|
| 1 | `P1-UIUX-AUDIT-8088-R1` | **qa** | Browser `:8088` — toàn bộ UF-XBOS + UF-HRM web; matrix G-UX-01..05; evidence per screen |
| 2 | `P1-UIUX-FE-FOUNDATION-01` | **dev-fe** | Portal: shared `ConfirmDialog` + `MutationButton` pattern; áp CC cổ đông/tài liệu/bulk; **không** đổi nghiệp vụ |
| 3 | `P1-UIUX-FE-HRM-02` | **dev-fe** | Sau QA R1 — fix exception list HRM |
| 4 | `P1-UIUX-QC-GATE-01` | **qc** | GO/GWC khi AC-UX-* đạt trên pilot slice |

**Không dispatch:** PM tự sửa `apps/**` (sponsor lock U67).

---

## 5. Personas & URL

- `ceo@xe.vn` — CC + HRM embed tập đoàn  
- `du-lich.hr@xe.vn` — member scope  
- Base: `http://14.225.217.232:8088/`

---

**ack_status:** DISPATCHED → QA R1 + Dev-FE foundation (cùng phiên)

---

## 6. Action catalog wave (P1-SCREEN-ACTION-CATALOG-01)

BA-Process đã mở rộng [`ACTION_BUTTON_INVENTORY.md`](../ecosystem/ACTION_BUTTON_INVENTORY.md) thành **Screen Action Catalog** (**72** dòng / **16** màn): mỗi control gắn `capability_code` → UC-ID (SRS P0 + HRM §13) → endpoint TechSpec/OpenAPI → **AC-ID** (`AC-UF-*` / `AC-FE-POST-*` / `AC-ACT-*`) → `test_layer` (**unit|api|uf**). Phạm vi tối thiểu sponsor đã phủ: CC legal entity (upload/view/save shareholders/docs), inbox, catalog gov, settings vendors/kpi/dept, RACI, HRM embed (employees, contracts, attendance, payroll, insurance, recruitment, decisions read, settings catalogs + metadata). **24** mã `ACT-*` chưa có trong `capabilityActionRegistry.ts` — trace §8 [`USER_FLOW_SRS_TRACE_DELTA.md`](../qa/USER_FLOW_SRS_TRACE_DELTA.md) (**GAP-ACT-01..06**, UF-XBOS-16..18). Wave kế: **qa** map browser evidence theo catalog + **dev-fe** promote registry + confirm modal (**AC-UX-CFM-01**) trên delete/bulk.
