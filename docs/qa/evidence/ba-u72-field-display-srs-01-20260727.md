# BA-U72-FIELD-DISPLAY-SRS-01 — Field Display Spec HRM (U72) · reclaim LANE B

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-U72-FIELD-DISPLAY-SRS-01` |
| **Date** | 2026-07-27 |
| **lane** | governance · ba-process · **reclaim from Claude LANE B** |
| **change_mode** | ADD |
| **Sponsor** | U72 — định nghĩa hiển thị mọi field; không chỉ ngành nghề |
| **ack_status** | `PASS_TO_PM` |

---

## 1. Entry / read_first

| Artifact | Result |
|----------|--------|
| `docs/qa/evidence/ba-display-hrm-review-01-20260727.md` | **Neo inventory** — F-01..F-13 FAIL + U-* UNKNOWN — **không** re-inventory |
| `docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md` | **GWC** — F-01..F-13 Keep PASS · **AC-FD-U02 CLOSED** · **no Dev reopen** |
| `docs/qa/evidence/qc-u72-soft-p2-01-r2-20260727.md` | **GWC** — **C-U72-LEAVE-P3 CLOSED** · soft XBOS P2 CLOSED · must_keep F-09/F-10/U02/industry |
| `docs/hrm/SRS.md` §1.1 / §17 · BR-CO-LABEL-01 | Team pointer FR-HRM-U72-LABEL-01 — ADD residual note |
| `.cursor/rules/display-label-no-raw-key.mdc` | Present — 5 cột BA bắt buộc |
| `_vibe-team-os/22-DISPLAY-LABEL-RULE.md` | OS neo (rule Cursor trỏ SoT) |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | Minimal ADD NFR-HRM-07 + thuật ngữ + §6.8 — **no_prompt_echo** |

**preserve_default:** true · **cấm** invent FR wipe · Phase1 · `apps/**` · seed · reopen GWC không FAIL.

---

## 2. Deliverables (ADD / reclaim)

| Path | Nội dung |
|------|----------|
| **`docs/hrm/SRS_FIELD_DISPLAY.md`** | Giữ bảng F-01..F-13 + U-01..U-12 (5 cột: nguồn · label VI · dạng nguồn · dạng UI · null→—) · AC-FD-* · **§7 residual GWC CLOSED / DESIGN READY** · §6 handoff cập nhật |
| **`docs/hrm/SRS.md`** | §17 pointer + dòng residual CLOSED / DESIGN READY |
| **`docs/client-delivery/hrm/SRS_HRM_KHACH.md`** | ADD **NFR-HRM-07** · thuật ngữ «Nhãn hiển thị» · ràng buộc §6.8 — không wipe FR / không meta work_item trong câu khách |

**Không** wipe AC-CO-IND / AC-CO-EMP / orphan §16 · **không** reopen QC GWC maps.

---

## 3. Coverage vs inventory (không re-scan FE)

| Inventory | Spec § | Residual sau QC |
|-----------|--------|-----------------|
| F-01..F-13 FAIL | `SRS_FIELD_DISPLAY` §2 + AC-FD-01..13 | **CLOSED** (GWC R3 Keep PASS) |
| U-01..U-06 (P0 UNKNOWN) | §3 + AC-FD-U01..U06 | **CLOSED** (QA Keep PASS + U02 R3 + leave soft R2) |
| U-07..U-12 | §3 + AC-FD-U07..U12 | **DESIGN READY** — spot tùy chọn; **không** Dev trừ FAIL mới |
| Industry PASS | FR-HRM-CO-IND-01 / AC-CO-IND-02 | **CLOSED** must_keep |
| B-01..B-03 BE optional | Inventory BE residual | **DESIGN READY** P2 |

---

## 4. Khách ADD (minimal)

| Mục | Nội dung (VI nghiệp vụ — không meta) |
|-----|--------------------------------------|
| Thuật ngữ | Nhãn hiển thị = chữ tiếng Việt trên UI; thiếu → «—» |
| NFR-HRM-07 | Trạng thái / loại hình / danh mục → nhãn VI; không mã kỹ thuật thay nhãn |
| §6.8 | Cùng quy tắc nhãn hiển thị |

Chi tiết dictionary F-* / U-* **ở bản đội ngũ** (`SRS_FIELD_DISPLAY.md`) — không nhét bảng kỹ thuật vào spine khách.

---

## 5. completion_report

**Closed**

- Reclaim LANE B: xác nhận slice 5 cột F-01..F-13 + U-01..U-12 đã đủ; không wipe / không re-inventory.
- Đối chiếu QC GWC R3 + soft P2 R2 → đánh dấu residual **CLOSED** hoặc **DESIGN READY** (§7).
- Team SRS §17 + khách **NFR-HRM-07** (ADD-only, no_prompt_echo).
- Kết luận: **không còn FAIL inventory mở** cần Dev-FE từ wave U72 này.

**Residual (idle — không Dev)**

| ID | Status | Owner |
|----|--------|-------|
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Stands | pm |
| U-07..U-12 spot runtime | DESIGN READY | qa optional later |
| B-01..B-03 `*_label` BE | DESIGN READY P2 | defer |
| XBOS U72 GWC slice | Separate (đã soft close) | — |

---

## 6. next_owner

**pm** — intake PASS; **không** dispatch Dev-FE trừ khi có FAIL sản phẩm mới.

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-BA-U72-FIELD-DISPLAY-SRS-01
from_role: ba-process
to_role: pm
lane: governance · idle residual U72 HRM field-display
entry_criteria:
  - Evidence: docs/qa/evidence/ba-u72-field-display-srs-01-20260727.md · PASS_TO_PM
  - Spec: docs/hrm/SRS_FIELD_DISPLAY.md §2–§3 · §7 residual CLOSED/DESIGN READY
  - QC neo: qc-hrm-u72-field-display-01-r3 · qc-u72-soft-p2-01-r2 — GWC Keep PASS
  - Khách ADD: NFR-HRM-07 (SRS_HRM_KHACH) — no_prompt_echo
exit_criteria:
  1) Bus INTAKE CLOSE BA-U72-FIELD-DISPLAY-SRS-01
  2) Do NOT dispatch Dev-FE for F-01..F-13 / U02 / leave soft / industry — CLOSED
  3) Idle list only: HOLD_DEPLOY · U-07..U-12 DESIGN READY · B-01..B-03 P2
  4) Continue pm:idle:check / next open program wave (not U72 reopen)
cấm: seed · Phase1/PROD/:8088 claim · reopen GWC without product FAIL · invent FR wipe
```

---

## 7. ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/ba-u72-field-display-srs-01-20260727.md`

### pm_dispatch_hint

U72 HRM field-display **spec CLOSED** vs inventory FAIL; residual = HOLD + DESIGN READY U-07..U-12 — **no Dev-FE**.
