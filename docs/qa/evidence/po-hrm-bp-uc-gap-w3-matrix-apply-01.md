# Evidence — PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-01

| Mục | Nội dung |
|-----|----------|
| **work_item_id** | `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-01` |
| **from_role** | pm |
| **to_role** | ba-process |
| **lane** | governance |
| **Ngày** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack / read_first

| # | Artifact | Kết quả |
|---|----------|---------|
| 1 | `docs/qa/evidence/_tmp-sponsor-chot-fill-read.json` | **34/34** filled · `empty: []` |
| 2 | `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.1.2 → **1.1.3** | DOC-DELTA apply |
| 3 | `DECISION_PACKET_Q_PAY_FORMULA.md` | Status → ANSWERED + sponsor stamp (GĐ1 kéo-thả supersede) |
| 4 | `SPONSOR_CHOT_REMAINING_README.md` | R-* / sheet 02–03 vẫn OPEN — chặn READY |

---

## completion_report

### Đã đóng

1. **DOC-DELTA matrix 1.1.3** — stamp Q-* / D7 / Face từ JSON **verbatim** (không invent tháng FY / thứ tự ký).
2. **§1.1 YAML** — `program_verdict: NOT_READY` · `ready_for_techspec: false` · `attendance_closed: false` · `techspec_s3: HOLD`.
3. **§1.2** bảng stamp đầy đủ mã FILL → residual R-*.
4. Cột `customer_decision_needed` REC/CORE/ATT/PAY + DEC-D3/D7/D8 cập nhật ANSWERED / PARTIAL.
5. Face S17–19: ~~MEETING_ONLY_GĐ2~~ → **PRODUCT_STUB MVP** (shell GĐ2-HOLD honesty).
6. Decision packet Q-PAY-FORMULA đồng bộ Excel (2 bước · GĐ1 kéo-thả · bảng công chốt).

### Stamp map (EXIT ↔ JSON)

| code | decision (verbatim) | matrix |
|------|---------------------|--------|
| Q-PAY-FORMULA | Đồng ý 2 bước | ANSWERED |
| Q-PAY-F-2 | GĐ1 kéo-thả | ANSWERED |
| Q-PAY-F-3 | Xác nhận đúng (chỉ bảng công chốt) | ANSWERED |
| Q-REC-HEADCOUNT | Cho ngoài ĐB + duyệt BOD + note XBOS sync | ANSWERED |
| Q-LEAVE-ACCRUAL | Năm tài chính + menu cấu hình | ANSWERED_PARTIAL · **R-FY-01** OPEN |
| Q-LEAVE-UNIT | Cả hai theo loại phép | ANSWERED |
| Q-SI-SUSPEND | Trong HRM | ANSWERED |
| Q-ASSET-MODULE | CRUD MVP | ANSWERED |
| Q-XBOT-PROFILE | Hybrid + note XBOS master | ANSWERED |
| Q-ATT-SIGN | NV + QL trực tiếp + HR | ANSWERED_PARTIAL · **R-SIGN-01** OPEN |
| Q-ATT-SUMMARY | Bắt buộc API riêng | ANSWERED |
| Q-ATT-FACE | Đưa vào MVP | DOC-DELTA was GĐ2 |
| D7-1/2/3 | sponsor decision maker · demo ngày mai · all UC | PARTIAL |
| S3 | Giữ HOLD | TechSpec HOLD |

### Residual (OPEN — chặn program)

| id | Nội dung | Owner kế |
|----|----------|----------|
| **SPONSOR_CHOT_REMAINING.xlsx** | Sheet 01 R-* · 02 MISSING IN/OUT · 03 UC Lịch | sponsor → PM |
| **R-FY-01** | Tháng bắt đầu năm tài chính — **cấm invent** | REMAINING |
| **R-SIGN-01** | Thứ tự ký NV↔QL↔HR — **cấm invent** | REMAINING |
| SRS_THIN ~29 UC Lịch | EXPAND/GĐ2/OUT/WAIVER | sheet 03 |
| Face MVP FR depth | chưa ADD SRS | ba-docs sau REMAINING |
| ATT / Employees CLOSED | **false** | must_keep |
| READY_FOR_TECHSPEC | **false** | must_keep |

### Cấm đã tuân

- Không `READY_FOR_TECHSPEC`
- Không invent month FY
- Không `apps/**`
- Không Attendance CLOSED
- Không unfinished-PAY wording

---

## program_verdict

```text
NOT_READY
```

Unlock chỉ khi: REMAINING filled **hoặc** sponsor waive tường minh + UC Lịch decisions land.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-REMAINING-HOLD-01
from_role: pm
to_role: pm (HOLD) | ba-process (khi Excel filled)
lane: governance
priority: P0

CONTEXT: Matrix 1.1.3 đã stamp SPONSOR_CHOT_FILL 34/34. program_verdict NOT_READY.
TechSpec S3 HOLD. Demo intent D7-2 = ngày mai — không = READY_FOR_TECHSPEC.

ACTION:
1) Sponsor điền SPONSOR_CHOT_REMAINING.xlsx (R-FY-01 month · R-SIGN-01 order · sheet 02/03).
2) Khi file filled → DISPATCH ba-process:
   work_item_id: PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02
   read: SPONSOR_CHOT_REMAINING + matrix 1.1.3
   exit: stamp R-* · UC Lịch · re-eval unlock; cấm invent; cấm READY_FOR_TECHSPEC trừ criteria đủ
3) Nếu sponsor chưa điền → HOLD — không dispatch Dev / TechSpec depth.

cấm: invent FY month · invent sign order · apps/** · Attendance CLOSED · unfinished-PAY
```

---

## Files touched

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md` | v1.1.2 → **1.1.3** DOC-DELTA |
| `docs/client-delivery/hrm-enterprise-blueprint/DECISION_PACKET_Q_PAY_FORMULA.md` | ANSWERED stamp |
| `docs/qa/evidence/po-hrm-bp-uc-gap-w3-matrix-apply-01.md` | evidence (this file) |

---

## ack_status

**PASS_TO_PM**
