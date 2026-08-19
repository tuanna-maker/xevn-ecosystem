# Phương pháp thiết kế Test Case chuyên nghiệp (XeVN)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PRO-TC-METHOD-01` |
| **Chuẩn tham chiếu** | IEEE 829 (Test Case Spec) · ISO/IEC/IEEE **29119-2** Test Design · **29119-3** Test Documentation · OS `33` / `31` |
| **Ngày** | 2026-08-04 |
| **Phạm vi** | **Thiết kế** — chưa phải chạy E2E / Test Report thực thi |
| **Locks** | U65 · U76 · U78 · U85 · không prompt-echo |

---

## 1. Vì sao tài liệu cũ khó đọc

| Artifact cũ | Vấn đề với Sponsor |
|-------------|-------------------|
| `PO_SPEC_TEST_CASE_CATALOG` (53 spine) | Phẳng theo TC-ID — **không** mở UC → nghiệp vụ → chức năng |
| Menu packs U83 (1473 TC) | Chi tiết màn/field nhưng **theo menu**, không theo UC nghiệp vụ |
| `PO_UC_TESTCASE_STATUS_ROLLUP` | Dashboard trạng thái — **không** thay Test Case Spec |
| `PO_SPEC_TEST_REPORT` | Rollup chạy thử — lẫn với thiết kế |

**SoT mới (đọc trước):** thư mục `docs/qa/professional/` — mỗi **Use Case** một file, đúng thứ tự dưới đây.

---

## 2. Mô hình 5 tầng (bắt buộc)

```text
Use Case (UC / FR)
  └─ Nghiệp vụ / Khả năng (Capability)     ← “làm việc gì trong đời thực”
       └─ Chức năng (Function)             ← nút / API / hành động hệ thống
            └─ Điều kiện kiểm thử (Condition)  ← ISO 29119 test condition
                 └─ Test Case (TC-ID)       ← bước + kỳ vọng quan sát được
```

| Tầng | Câu hỏi | Ví dụ (Nghỉ phép) |
|------|---------|-------------------|
| **UC** | Người dùng đạt mục tiêu gì? | FR-UC-H03 — Xin nghỉ & được duyệt đúng quy tắc |
| **Nghiệp vụ** | Khối việc nào trong UC? | Nộp đơn · Kiểm soát giấy tờ · Phê duyệt L1 · … |
| **Chức năng** | Hệ thống có hành động nào? | `FN-LEAVE-CREATE` · `FN-LEAVE-APPROVE-L1` |
| **Điều kiện** | Tình huống nào phải chứng minh? | Ốm ≥3 ngày thiếu file · Đủ số dư · Sai công ty |
| **Test Case** | Làm sao chứng minh điều kiện đó? | `TC-LEAVE-CREATE-FD-ATT-001` + steps |

**Test Report chuyên nghiệp** (sau này, khi chạy) cũng rollup theo cùng cây:

`UC → Nghiệp vụ → Chức năng → số TC thiết kế / đã chạy / PASS / FAIL / BLOCKED`

— không chỉ một bảng TC-ID phẳng.

---

## 3. Quy tắc sinh case từ mỗi Chức năng

Với **mỗi Function** có side-effect (tạo/sửa/duyệt/xóa/gửi):

| Type | Bắt buộc? | Ý nghĩa |
|------|-----------|---------|
| **HP** Happy | ≥ 1 | Đường chính HDSD thành công + FE sau 2xx + F5 |
| **FD** Fail-deep | ≥ 1 (mutate) | Validate / BR / trạng thái sai — **không** chỉ “chưa login” |
| **BD** Boundary | khi có ngưỡng | 0, max, đúng/sai biên (ngày, số dư, độ dài lý do) |
| **AU** Auth/scope | khi đa CT / đa role | 403/409 · không thấy ngoài scope |
| **UX** State | khi có SM | loading / empty / locked WF / sau reject |

Function **chỉ xem (read)**: ≥1 HP + ≥1 empty/error UX nếu có list.

---

## 4. Cột bắt buộc mỗi Test Case (IEEE lean)

| Cột | Bắt buộc |
|-----|----------|
| TC-ID | `TC-<UC>-<FN>-<TYPE>-<nnn>` |
| UC / Capability / Function | neo 3 tầng |
| Type | HP · FD · BD · AU · UX |
| Priority | P0 · P1 · P2 |
| Persona | account/role thật |
| Precondition | trạng thái trước bước 1 (U65: không giả seed) |
| Steps | đánh số · đúng menu/nút HDSD |
| Expected | HTTP/mã + **UI sau** + F5 |
| Layer | UI · MOBILE · API · UNIT |
| Trace | SRS § · BR · API · HDSD |
| Design status | `DESIGNED` (chưa chạy) · sau này mới EVIDENCED |

---

## 5. Phân biệt với “luồng tổng thể” (E2E)

| Giai đoạn | Việc | File |
|-----------|------|------|
| **A — Thiết kế theo UC** (đang làm) | UC → nghiệp vụ → chức năng → case | `docs/qa/professional/UC-*.md` |
| **B — Luồng E2E / spine** (sau, khi Sponsor bảo chạy) | Ghép nhiều UC thành Hire-to-Pay / Leave ladder… + mở rộng tư duy | BA spine + Test Log U78 + Report |

Sponsor đã chốt thứ tự: **xong thiết kế chuyên nghiệp trước** → rồi mới test luồng tổng thể.

---

## 6. DoD thiết kế (giai đoạn A)

Một file UC được coi là **DESIGN COMPLETE** khi:

1. Có bảng **Nghiệp vụ** (đủ mục tiêu UC)  
2. Mỗi nghiệp vụ có **Function inventory** + đếm  
3. Mỗi function có **số case dự kiến** (HP/FD/…) và bảng TC chi tiết khớp đếm  
4. Có **Coverage check** (GAP rõ ràng, không giấu)  
5. Có **SPEC_GAP** ghi riêng (vd. ladder L2) — không bịa PASS  
6. `execution: not started` / không claim UAT  

---

## 7. Index bộ professional

| File | UC / chủ đề |
|------|-------------|
| `00_TEST_DESIGN_METHOD.md` | Phương pháp (file này) |
| `UC-FR-H03_LEAVE.md` | Nghỉ phép & duyệt |
| `UC-FR-B03_RECRUITMENT_WF.md` | Tuyển dụng + WF + Hire |
| `UC-ATT_ESS_ADJUST.md` | Điều chỉnh chấm công ESS |
| `99_TEST_REPORT_BY_UC_TEMPLATE.md` | Mẫu Test Report theo cây UC |

---

*PO-PRO-TC-METHOD-01*
