# P1-HANDOFF-BA-01 — Bàn giao tài liệu khách Giai đoạn 1 UAT

| Thuộc tính | Giá trị |
|------------|---------|
| **work_item_id** | P1-HANDOFF-BA-01 |
| **Ngày** | 05/06/2026 |
| **Owner** | ba-docs |
| **ack_status** | PASS_TO_PM |

---

## 1. Tóm tắt

Đã cập nhật bộ tài liệu khách **BRD/SRS HTML** (mẫu Bateco) và **HDSD pilot** cho phạm vi Giai đoạn 1: **Command Center + nhúng HRM + HRM Mobile**, sẵn sàng chạy thử trên `https://14-225-217-232.nip.io`. Không thêm UC ngoài ma trận (373 catalog / 245 Phase 1).

---

## 2. Deliverable paths

| Tài liệu | Đường dẫn | Phiên bản |
|----------|-----------|-----------|
| BRD HTML | `docs/client-delivery/01_BRD_XeVN_OS.html` | 1.1 (06/2026) |
| SRS HTML | `docs/client-delivery/02_SRS_XeVN_OS.html` | 2.2 (06/2026) |
| BRD nguồn | `docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md` | §14 UAT + giới hạn |
| SRS generator | `scripts/lib/srs-bateco-body.mjs` | §1.5 UAT |
| HDSD pilot | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | 1.3 |
| HRM Mobile BRD/SRS | `docs/client-delivery/01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | (không đổi wave này) |
| Evidence (file này) | `docs/client/PHASE1_UAT_DELIVERABLE_HANDOFF_20260605.md` | — |

---

## 3. Phạm vi UAT (trung thực)

| Thành phần | Trạng thái |
|------------|------------|
| Command Center (cổng Web) | UAT-ready trên pilot HTTPS |
| Nhúng HRM trên cổng | UAT-ready (GWC trên nip.io) |
| HRM Mobile | UAT-ready (J-MOB slice pilot) |
| Ma trận 245 UC Giai đoạn 1 | Catalog đóng — đối chiếu `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| SRS 373 FR | Toàn hệ (bao gồm GĐ2 chưa go-live) |

**Môi trường:** `https://14-225-217-232.nip.io`  
**Tài khoản:** cổng `ceo@xe.vn` / `Xevn@2026`; mobile `uat.nv####@xe.vn` / `xevn-uat-2026`

---

## 4. Giới hạn (bắt buộc ghi trong tài liệu khách)

| Mã | Giới hạn |
|----|----------|
| L-01 | **Production** `portal.xe.vn` — **BLOCKED** (DNS/TLS/cutover chưa xong) |
| L-02 | **Git parity** — pilot có thể lệch nhánh `main` |
| L-03 | **Excellence T5** (mật độ menu HRM benchmark) — **hoãn**, không chặn UAT slice |
| L-04 | 373 FR SRS ≠ 245 UC go-live — phân biệt đặc tả vs triển khai |

Nội dung đã nhúng: BRD §14, SRS §1.5, HDSD §2.2 + §9.

---

## 5. Build & audit

```text
pnpm docs:srs:audit    → 373/373 FR (7 mục/FR)
pnpm docs:client-delivery:html → BRD + SRS ok=true
```

| Lệnh | Kết quả |
|------|---------|
| `pnpm docs:srs:audit` | **373/373** pass (100%) |
| `pnpm docs:client-delivery:html` | BRD **ok=true** (6921.7 KB) · SRS **ok=true** (8636.4 KB, fr_blocks=373) |

---

## 6. QC spot-check (đề xuất PM)

- [ ] BRD HTML §14 hiển thị — không path repo trong narrative
- [ ] SRS HTML §1.5 — không REQ-SRS / Kiểm chứng
- [ ] HDSD §2.2 URL nip.io + §9 giới hạn
- [ ] Ctrl+F5 hai FR ngẫu nhiên — đủ 7 mục

---

## 7. Handoff

| Trường | Giá trị |
|--------|---------|
| **completion_report** | BRD v1.1 + SRS v2.2 rebuilt; HDSD v1.3; § giới hạn L-01..L-04; không UC mới |
| **next_owner** | pm → qc (pre-send audit) |
| **next_dispatch_prompt** | `work_item_id: P1-HANDOFF-QC-01 — QC spot-check client deliverables: docs/client-delivery/01_BRD_XeVN_OS.html, 02_SRS_XeVN_OS.html; verify no banned meta; confirm §14/§1.5/HDSD §9 limitations; evidence docs/client/PHASE1_UAT_DELIVERABLE_HANDOFF_20260605.md. ack_status PASS_TO_PM or READY_FOR_PM_SEND.` |
| **evidence_path** | `docs/client/PHASE1_UAT_DELIVERABLE_HANDOFF_20260605.md` |
