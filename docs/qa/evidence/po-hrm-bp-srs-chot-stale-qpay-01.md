# Evidence — PO-HRM-BP-SRS-CHOT-STALE-QPAY-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | `PO-HRM-BP-SRS-CHOT-STALE-QPAY-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance (docs / SRS giấy) |
| ngày | 2026-08-05 |
| priority | P2 |
| condition đóng | **C-SRS-CHOT-STALE-QPAY** (từ `po-hrm-bp-srs-chot-qc-spot-01.md`) |
| ack_status | **PASS_TO_PM** |
| verdict | **PASS** |

## Scope

DOC-DELTA hẹp SRS v0.8 — đồng bộ wording Q-PAY đã chốt (form GĐ1 + kéo-thả GĐ2).  
**Không** invent Q-* · **không** `ready_for_techspec: true` · **không** wipe EXPAND / 16 FR ưu tiên · **không** `apps/**`.

## Changes (SRS_HRM_ENTERPRISE.md)

| Vị trí | Trước (stale) | Sau (đồng bộ §6.1) |
|--------|---------------|-------------------|
| §2.4 mục 4 | «cờ **Q-PAY-FORMULA** cần khách chốt cách lắp engine…» | **Đã chốt**: 2 bước soạn→phát hành (Q-PAY-FORMULA); GĐ1 biểu mẫu cấu hình; kéo-thả GĐ2 (**R-PAY-DD-01**); nguồn giờ = bảng công chốt; TechSpec vẫn HOLD |
| FR-UC-BP-PAY-01 · Quy tắc | «phần còn mở chỉ là tham số **Q-PAY-FORMULA**…» | **Đã chốt** Q-PAY-FORMULA + R-PAY-DD-01 (form GĐ1 + kéo-thả GĐ2); tham số tenant vẫn cấu hình; TechSpec HOLD |

## Verify

| Check | Result |
|-------|--------|
| MD: `cần khách chốt` / `phần còn mở` | **0** |
| MD: 16 FR ưu tiên headings còn đủ | **PASS** (REC-01/01b/02/02b/08 · CORE-01/02/08 · ATT-02/08/09/10/11 · PAY-01/02/04) |
| PDF rebuild | `build_pdf_from_srs()` only — **không** `main()` / `patch_srs` |
| PDF path | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf` |
| PDF pages | **85** |
| PDF stale `cần khách chốt` / `phần còn mở` | **0 / 0** |
| PDF markers | `R-PAY-DD-01`×4 · `biểu mẫu cấu hình`×5 · `kéo-thả`×14 · `Đã chốt`×17 |
| PDF pipeline ban | `ready_for_techspec`/`work_item_id`/`PASS_TO_PM`/`apps/api` = **0** |
| `ready_for_techspec` claim | **false** (không đổi — HOLD giữ) |
| Attendance / Employees CLOSED | **không claim** |

## Must-not (confirmed)

- Không invent Q-* mới
- Không `patch_srs` wipe
- Không đụng thân EXPAND / 16 FR ngoài bullet quy tắc PAY-01
- Không mở TechSpec / DB_DESIGN / API_DESIGN coding
- Demo giấy ≠ product GO

## completion_report

**Closed:** C-SRS-CHOT-STALE-QPAY — 2 cụm stale trên MD + PDF KHACH đã đồng bộ bảng quyết định Đã chốt (form GĐ1 + kéo-thả GĐ2 · R-PAY-DD-01).

**Residual:** C-SRS-CHOT-TOC-NOTE (P3 OBS optional) — không thuộc wave này. Product fidelity / TechSpec HOLD unchanged.

## next_owner

`pm` — đóng condition GWC; **không** dispatch TechSpec depth cho đến fidelity unlock.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SRS-CHOT-STALE-QPAY-01
from_role: pm
to_role: qc (optional re-spot) hoặc đóng GWC condition
lane: governance
entry: docs/qa/evidence/po-hrm-bp-srs-chot-stale-qpay-01.md PASS
exit: C-SRS-CHOT-STALE-QPAY = CLOSED trên QC note; ready_for_techspec vẫn false
```

## ack_status

**PASS_TO_PM**
