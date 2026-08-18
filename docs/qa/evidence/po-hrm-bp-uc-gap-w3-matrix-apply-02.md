# Evidence — PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02

| Mục | Nội dung |
|-----|----------|
| **work_item_id** | `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02` |
| **from_role** | pm |
| **to_role** | ba-process |
| **lane** | governance |
| **Ngày** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack / read_first

| # | Artifact | Kết quả |
|---|----------|---------|
| 1 | `docs/qa/evidence/_tmp-remaining-summary.txt` | Sheet 01=14 · 02=18 · 03=28 — filled |
| 2 | `docs/qa/evidence/_tmp-sponsor-chot-remaining-read.json` | Verbatim source stamp |
| 3 | `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.1.3 → **1.1.4** | DOC-DELTA apply |
| 4 | `po-hrm-bp-uc-gap-w3-matrix-apply-01.md` | Prior FILL stamp · residual R-* CLOSED here |
| 5 | Parallel | ba-docs **SRS-CHOT-01** in flight (PM DISPATCHED 09:58) |

---

## completion_report

### Đã đóng

1. **DOC-DELTA matrix 1.1.4** — stamp R-* · 18 MISSING · sheet 03 EXPAND/GĐ2/OUT **verbatim** (§1.3–1.5).
2. **R-FY-01 CLOSED** — «CRUD per tenant — cấm fix month» (không phải missing tháng; **cấm invent** month).
3. **R-SIGN-01 CLOSED** — **Cấu hình workflow XBOS** (không invent thứ tự cố định).
4. **PROP:** 03d **IN** · 03e **OUT** · 05b **IN** · Face **Mobile only MVP** · PAY **Form GĐ1 + kéo-thả GĐ2**.
5. Sheet 02: IN×15 · GĐ2×2 (S15/S16) · OUT×1 (S71).
6. Sheet 03: EXPAND×25 · ATT-03 **GĐ2** · CORE-04 **OUT** · 0 WAIVER.
7. Sync `DECISION_PACKET_Q_PAY_FORMULA.md` — R-PAY-DD-01 supersede Q-PAY-F-2.
8. **program_verdict:** `NOT_READY_PENDING_SRS_EXPAND` (honest — SRS-CHOT-01 chưa land).

### Stamp map (EXIT ↔ JSON)

| code | decision (verbatim) | matrix |
|------|---------------------|--------|
| R-FY-01 | Khác + CRUD/tenant cấm fix | **CLOSED** |
| R-LV-ADV-01 | Khác + CRUD note | ANSWERED |
| R-LV-ADV-02 | Cấu hình được | ANSWERED |
| R-SICK-01 | Cấu hình thứ tự | ANSWERED |
| R-SIGN-01 | Cấu hình workflow XBOS | **CLOSED** |
| R-PROP-03d | IN MVP giấy + code | **IN** |
| R-PROP-03e | OUT | **OUT** |
| R-PROP-05b | IN MVP giấy + code | **IN** |
| R-FACE-01 | Mobile only MVP | ANSWERED |
| R-DEMO-01 | Khác · toàn bộ UC cũ + mới | ANSWERED · ≠ product GO |
| R-PAY-DD-01 | Form GĐ1 + kéo-thả GĐ2 | SUPERSEDE Q-PAY-F-2 |
| R-OCR-01 | GĐ2 | + CORE-04 OUT |
| R-CAMPAIGN-01 | OUT | REC-03 OUT |
| R-PDF-01 | Đủ (+ có thể bổ sung sau) | Paper OK |
| S03..S75 (18) | per §1.4 | ANSWERED |
| UC sheet 03 (28) | per §1.5 | ANSWERED (SRS body = ba-docs) |

### Residual (OPEN — không chặn paper stamp)

| id | Nội dung | Owner kế |
|----|----------|----------|
| **SRS-CHOT-01** | EXPAND 25 UC + ADD 03d/05b + Face mobile FR | ba-docs (parallel) |
| `ready_for_techspec_docs` | pending đến SRS-CHOT-01 land | PM sau ba-docs |
| TechSpec S3 | **HOLD** | PM |
| ATT / Employees CLOSED | **false** | must_keep |
| Nested dialog RO | P2 optional | qa |
| REC/PAY U65 fidelity | OPEN honesty | later |
| READY_FOR_TECHSPEC | **false** | must_keep |
| Product demo GO | **cấm** (R-DEMO-01 = script scope) | must_keep |

### Cấm đã tuân

- Không invent FY month / sign order cố định
- Không `apps/**`
- Không Attendance CLOSED
- Không unfinished-PAY wording
- Không claim product demo GO
- Không flip `READY_FOR_TECHSPEC` (chỉ `NOT_READY_PENDING_SRS_EXPAND`)

---

## program_verdict

```text
NOT_READY_PENDING_SRS_EXPAND
```

| Flag | Value |
|------|-------|
| `ready_for_techspec` | **false** |
| `ready_for_techspec_docs` | **pending_srs_chot_01** |
| After SRS-CHOT-01 PASS | PM may set **`READY_FOR_TECHSPEC_DOCS`** (paper-only) · TechSpec S3 vẫn HOLD |

Paper Q-* + REMAINING = **đủ**. SRS EXPAND wave vẫn in flight → **không** READY_FOR_TECHSPEC / READY_FOR_TECHSPEC_DOCS tại seat này.

---

## next_owner

**pm** (intake) · parallel **ba-docs SRS-CHOT-01** · sau cả hai seats → **qc** spot SRS chốt

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02-INTAKE
from_role: ba-process
to_role: pm
lane: governance
priority: P0

CONTEXT: Matrix 1.1.4 stamped REMAINING 14+18+28. program_verdict NOT_READY_PENDING_SRS_EXPAND.
R-FY-01 CLOSED (CRUD/tenant cấm fix) · R-SIGN-01 CLOSED (XBOS WF).
PROP-03d/05b IN · 03e OUT · Face Mobile MVP · PAY Form GĐ1+DD GĐ2.
TechSpec S3 HOLD. Attendance not CLOSED. Cấm product demo GO.

ACTION:
1) Nếu ba-docs SRS-CHOT-01 chưa PASS → chờ / monitor seat đó (đã DISPATCHED).
2) Khi SRS-CHOT-01 PASS_TO_PM → DISPATCH qc:
   work_item_id: PO-HRM-BP-SRS-CHOT-QC-SPOT-01
   entry: matrix 1.1.4 + SRS EXPAND evidence + PDF rebuild
   exit: spot AC sheet03 EXPAND · PROP-03d/05b IN · 03e OUT · Face mobile · CORE-04 OUT · ATT-03 GĐ2 · no wipe FR · no_prompt_echo
   ack: GO/GWC → PM may set ready_for_techspec_docs=true (paper-only); S3 HOLD
3) Không DISPATCH Dev / TechSpec depth / apps/**.

cấm: invent · READY_FOR_TECHSPEC full · Attendance CLOSED · unfinished-PAY · product demo GO
```

---

## Files touched

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md` | v1.1.3 → **1.1.4** DOC-DELTA |
| `docs/client-delivery/hrm-enterprise-blueprint/DECISION_PACKET_Q_PAY_FORMULA.md` | R-PAY-DD-01 supersede |
| `docs/qa/evidence/po-hrm-bp-uc-gap-w3-matrix-apply-02.md` | evidence (this file) |

---

## ack_status

**PASS_TO_PM**
