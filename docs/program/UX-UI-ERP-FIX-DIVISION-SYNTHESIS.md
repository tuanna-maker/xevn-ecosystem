# U74 SYNTHESIS — UX ANALYSIS Fix-1..6 division

| Field | Value |
|-------|-------|
| **Date** | 2026-07-28 |
| **work_item** | UX-UI-ERP-AUDIT-01 (ANALYSIS polish — **không** phải Lane C1 ENV) |
| **Status** | **CHỜ SPONSOR CHỐT** — chưa giao members |
| **Claude ping** | 12:15 PEER feedback (hook inject muộn) |

## 1. Đề xuất ban đầu (Cursor — lịch sử)

| Fix | Nội dung (tóm tắt) | Owner đề xuất cũ |
|-----|--------------------|------------------|
| Fix-1 | Nielsen Evidence column | Claude |
| Fix-2 | P0 business impact scenarios | Cursor |
| Fix-3 | WCAG 2.2 | Claude |
| Fix-4 | Component inventory brief | Claude |
| Fix-5 | Inventory DoD | Cursor |
| Fix-6 | Lane DoD | Cursor |

## 2. Góp ý Claude (bắt buộc — đã thu)

| ID | Claude | Ý |
|----|--------|---|
| **A** | REJECT chia theo role thuần | §2.1 Nielsen Evidence + §2.2 WCAG phải **cùng owner** (voice consistency) |
| **B** | Fix-1 → Claude | Cần map `ux-ui-brand-audit-01.md` |
| **C** | Fix-4 → Claude | Cross-ref stub `ux-ui-component-inventory-01.md` |
| **D** | Fix-2 → Cursor OK | Nhưng phải thêm định lượng rủi ro (vd. unemployment / ops risk), hiện mới qualitative |
| **E** | Fix-5/6 → Cursor OK | Team convention / DoD |

**Claude yêu cầu:** synthesis table + delivery sequence — **Do NOT reassign yet**.

## 3. Cursor tổng hợp (đề xuất khóa — chờ bạn)

| Fix | Owner đề xuất khóa | Ghi chú |
|-----|--------------------|---------|
| Fix-1 Nielsen Evidence | **Claude** | Đồng ý B + A |
| Fix-2 P0 impact (+ định lượng) | **Cursor** | Đồng ý D — bổ sung số/ước lượng risk |
| Fix-3 WCAG 2.2 | **Claude** | Cùng owner với Fix-1 (A) — RULES đã 2.2 |
| Fix-4 Component brief | **Claude** | Đồng ý C |
| Fix-5 Inventory DoD | **Cursor** | Đồng ý |
| Fix-6 Lane DoD | **Cursor** | Đồng ý — đã có trong PEER_DIVISION_PLAN §4 |

**Delivery sequence (sau khi bạn chốt):**
1. Claude: Fix-1+3+4 (một pass voice §2 + component brief)  
2. Cursor: Fix-2+5+6 (P0 định lượng + DoD)  
3. Peer review ngắn → xong ANALYSIS polish  
4. **Không** đụng `apps/**` trừ WI execution wave đã chốt riêng

## 4. Quan hệ với wave đang chạy

| Track | Trạng thái |
|-------|------------|
| Wave 1 C1 HRM + ENV React dedupe | **Đã chốt trước** — tiếp tục (không bị ping này chặn) |
| Lane A token | CLOSED PASS |
| ANALYSIS Fix-1..6 polish | **HOLD** đến khi sponsor chốt bảng §3 |

## 5. Xin sponsor một dòng

- **«Chốt synthesis Fix-1..6»** → hai PM mới giao members docs  
- **«Bỏ / SUPERSEDE Fix-1..6»** — coi ANALYSIS hiện tại đủ, chỉ chạy wave execution  
- **«Sửa owner …»** — ghi rõ Fix nào đổi
