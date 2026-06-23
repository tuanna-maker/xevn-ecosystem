# Mobile — Chrome deduplication rules (MOB-UX-18)

**work_item_id:** `MOB-UX-18-PROGRAM`  
**trigger:** Sponsor 2026-06-09 — lặp tiêu đề + lặp nút (Nghỉ phép, Phiếu lương)  
**ILA:** **ILA-05** (trùng chrome) — FAIL khi ≥2 cùng nghĩa trên 1 viewport

## Triết lý (1 dòng)

**Một màn = một tiêu đề màn + một CTA chính cho một hành động.** Tab bar + stack header đã cho context — body không lặp H1; FAB đã là «tạo mới» — không thêm nút giống hệt ở empty + sticky.

## Rules (bắt buộc Dev)

| ID | Rule | PASS khi |
|----|------|----------|
| **CHROME-01** | Tab-root dùng **native stack title** (`headerLargeTitle` hoặc `setOptions`) | Không có `Text` title trùng nghĩa trong `ListHeader` / đầu scroll |
| **CHROME-02** | **Một CTA primary** cho «Tạo đơn / Đăng ký» | Empty: CTA trong empty illustration **hoặc** sticky — **không cả hai**; có FAB global → **không** sticky trùng |
| **CHROME-03** | Section title ≠ screen title | «Kỳ nghỉ 2026» OK dưới «Nghỉ phép của tôi»; «Phiếu lương» 3 lần **FAIL** |
| **CHROME-04** | Tab label không lặp trong body | Tab «Phiếu lương» active → body chỉ subtitle mô tả |

## Sponsor screenshot → fix

| Màn | FAIL | Fix |
|-----|------|-----|
| Nghỉ phép | 2× «Đăng ký nghỉ» + FAB | Bỏ sticky khi empty; hoặc bỏ CTA empty — giữ FAB + 1 CTA |
| Phiếu lương | Nav + H1 + tab | Xóa H1 in-content; giữ subtitle «Phiếu lương mới nhất và lịch sử» |

## Gate

`pnpm run verify:mobile:chrome` — grep/static: no duplicate screen titles in list headers; leave list no StickyFooter+EmptyLeave CTA together.

## WBS

| ID | Screen |
|----|--------|
| MOB-UX-18a | LeaveRequestsListScreen |
| MOB-UX-18b | PayslipListScreen + PayrollSummaryScreen |
| MOB-UX-18c | Audit ManagerApprovals, Profile, Contracts, Notifications |
| MOB-UX-18-QA | qa-device ILA-05 spot |
