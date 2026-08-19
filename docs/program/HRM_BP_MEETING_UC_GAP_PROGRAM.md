# Chương trình — Tổng hợp UC họp ↔ sản phẩm ↔ SRS/WBS (chốt khách)

| Field | Value |
|-------|--------|
| **Program ID** | `PO-HRM-BP-UC-GAP-01` |
| **Date** | 2026-08-04 |
| **Sponsor intent** | Hợp nhất toàn bộ buổi họp sáng (HTML + mindmap + Excel) → WBS + SRS theo **từng UC** để chốt với khách; đối chiếu chức năng **đã có / đang phát triển / stub** trên hệ thống; **Attendance phải rà hết** màn·popup·menu·function |
| **Gate** | **HOLD** mở rộng TechSpec/API/DB depth cho blueprint đến khi gap matrix + SRS UC đủ chi tiết cho luồng họp |
| **SoT họp** | `docs/client-delivery/hrm-enterprise-blueprint/SYNTHESIS_MASTER_HRM_ENTERPRISE.md` |

---

## 1. Deliverables (khách + nội bộ)

| # | Artifact | Audience | Owner |
|---|----------|----------|-------|
| D1 | `UC_MEETING_PRODUCT_GAP_MATRIX.md` — mỗi UC: họp / SRS Enterprise / product surface / runtime / gap | Team + chốt nội bộ | ba-process |
| D2 | WBS Excel refresh — 1 hàng = 1 UC/task nghiệp vụ (MVP vs GĐ2; ATT đầy đủ) | Khách | ba-docs |
| D3 | SRS Enterprise delta — UC thiếu từ họp + map surface ATT | Khách | ba-process + ba-docs |
| D4 | `ATT_SURFACE_INVENTORY_DEEP.md` — **mọi** tab/sidebar/modal/`featureInDev` từ code + browser | Team | qa + explore |
| D5 | Rollup REC/CORE/PAY surfaces (meeting scope) — không bỏ sót nhãn đang phát triển | Team | qa / explore |

---

## 2. Waves

```text
W1 ATT deep inventory (code crawl + browser U65 RO) — song song ba-process gap skeleton
W2 REC + CORE + PAY menu/function inventory (meeting scope)
W3 Synth: gap matrix + WBS + SRS UC completeness verdict
W4 (sau chốt khách) TechSpec / API_DESIGN / DB_DESIGN depth — KHÔNG trước W3 PASS
```

---

## 3. Attendance — tiêu chí «rà hết»

Bắt buộc liệt kê và stamp:

- Mọi top-tab / dropdown / sidebar item trong `Attendance.tsx` + children
- Mọi modal/dialog/drawer/popover CTA
- Mọi nhãn `featureInDev` / «Đang phát triển» / STUB_UI / GĐ2-HOLD
- Mọi function: Lọc / Thêm / Sửa / Xóa / Duyệt / Xuất / Import / Lưu cấu hình
- Map → `HRM-AT-*` hoặc `UC-BP-ATT-*` / UNMAPPED / SPEC_GAP
- Đối chiếu SYNTHESIS A1–A6 + D8

Baseline hiện có: `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` (~46+ rows) — **không đủ nếu** còn surface trong code chưa có hàng.

---

## 4. Exit program (trước TechSpec)

| Checkbox | Status (2026-08-05 W3) | Evidence |
|----------|------------------------|----------|
| ATT deep inventory ≥ code surface count (diff = 0 miss) | **PASS** | `ATT_SURFACE_INVENTORY_DEEP.md` S01–S90 · code `po-hrm-bp-att-deep-code-01.md` · browser `po-hrm-bp-att-deep-qa-01.md` · gap BA `po-hrm-bp-att-deep-gap-ba-01.md` |
| Gap matrix covers SYNTHESIS D1–D8 + R/C/A/P ids | **PASS** | `UC_MEETING_PRODUCT_GAP_MATRIX.md` **v1.1.2** §2–§7 + §5.1 A1–A6 |
| WBS Excel rows traceable to UC ids | **PASS** | `WBS_HRM_ENTERPRISE_UC_CHOT.xlsx` **v1.1** · 45 UC · ATT-FID#1–46 · sheet `02b` 18 MISSING · `po-hrm-bp-wbs-from-gap-01.md` |
| SRS: mỗi luồng họp có UC hoặc ghi GĐ2/OUT rõ | **FAIL** | Inventory **0.3.3** còn nhiều **Lịch**/SRS_THIN; propose-only **UC-BP-ATT-03d/03e/05b** chưa ADD SRS; ATT-03b PRODUCT_MISSING |
| Explicit verdict: READY_FOR_TECHSPEC \| NOT_READY + list gaps | **PASS (verdict = NOT_READY)** | `docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md` · machine gap list § dưới |

### W3 status — 2026-08-05

| Field | Value |
|-------|--------|
| **work_item** | `PO-HRM-BP-UC-GAP-W3-SYNTH-01` |
| **program_verdict** | **NOT_READY** — **không** `READY_FOR_TECHSPEC` |
| **prerequisites** | ATT-DEEP-GAP-BA-01 **CLOSED** · WBS-FROM-GAP-01 **CLOSED** (residual «wait ATT-DEEP» trên WBS evidence = **STALE**) |
| **uat_done** | `false` |
| **Attendance CLOSED** | **false** |
| **Employees CLOSED** | **false** |
| **D7** | **OPEN** — pause code until paper chốt (unsigned) |
| **W4 TechSpec depth** | **HOLD** — chỉ sau D7 paper + đóng blockers Q-*/SRS_THIN/propose-UC policy; **cấm** Dev `apps/**` |
| Evidence | `docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md` · matrix v1.1.2 · WBS UC_CHOT v1.1 · ATT deep QA/BA |

---

## 5. Cấm

- Claim Attendance / Employees CLOSED
- Mở Dev code nghiệp vụ trước D7 (xác nhận giấy) trừ P0 product crash
- Invent PAY «chưa họp»
- Prompt-echo vào bản gửi khách
