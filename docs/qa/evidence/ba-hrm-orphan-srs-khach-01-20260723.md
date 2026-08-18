# BA-HRM-ORPHAN-SRS-KHACH-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ORPHAN-SRS-KHACH-01` |
| **date** | 2026-07-23 |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **change_mode** | **ADD-only** |
| **ack_status** | **PASS_TO_PM** |
| **CẤM** | `apps/**` · seed · deploy · Dev |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Delta khách (thân FR 7 mục + inventory) | `docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` | **DONE** |
| Spine khách bump + ADD patch | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` → **3.1-W2e** | **DONE** |
| Dual-doc pointer | SRS khách § «Đối chiếu dual-doc» · team `docs/hrm/SRS.md` §16 · README client-delivery | **DONE** |
| ORPHAN + team delta pointer | `ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` · `BA_HRM_ORPHAN_TO_SRS_01` Khách promote = DONE | **DONE** |
| HTML rebuild | — | **DEFER** (file spine lớn; nghiệm thu đợt = MD khách + delta; không claim Phase1) |

---

## 2. FR promoted (khách thấy)

### Thân đủ 7 mục (delta W2e)

| FR-ID | Nội dung |
|-------|----------|
| FR-HRM-EMP-COL-01 | Nhãn cột «Thông tin công ty» = pháp nhân / ĐVTV |
| FR-HRM-SC-POS-01 | CRUD chức danh / phòng ban + picker |
| FR-HRM-SC-JT-01 | CRUD mẫu tin tuyển dụng + picker |
| FR-HRM-SC-LEAVE-01 | CRUD loại nghỉ + số dư + picker |
| FR-HRM-SC-DEC-01 | CRUD loại quyết định + picker |
| FR-HRM-SC-PAY-01 | CRUD thành phần lương + picker |
| FR-HRM-AT-WF-01 | Cầu nối đơn nghỉ ↔ quy trình duyệt tập trung |
| FR-HRM-CI-PKG-01 | Gói lương căn cứ + picker |

**Quy tắc chung:** BR-HRM-MD-01 · AC-HRM-PICKER-01.

### ADD vào spine đã khóa (không đè AC cũ)

| FR spine | ADD |
|----------|-----|
| FR-HRM-SC-01 | Con trỏ CRUD W2e + picker rule |
| FR-HRM-AT-10 | Picker loại nghỉ + bước WF (AT-WF-01) |
| FR-HRM-21 | Diễn biến EMP-COL Plane A |
| FR-HRM-27 | Loại QSĐ ∈ SC-DEC-01 |

### Inventory leftover (đủ nghiệm thu đợt — thân 7 mục đợt sau)

FR-HRM-MOB-OU-01 · ADV-01 · OT-01 · EA-01 · FL-02 · IM-02 · IM-03 · 20-CHART-01 · 20-BAND-01 · OP-STATUS-01 · RC-IV-01 · MOB-HUB-01 · SCOPE-UUID-01 · SC-WF-GATE-01 · SC-EXT-01 — xem delta §9.

---

## 3. Dual-doc team ↔ khách

| Bản | Path | Vai trò |
|-----|------|---------|
| Khách spine | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | SoT gửi đối tác + con trỏ W2e |
| Khách delta | `docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` | Thân FR W2e |
| Team lock | `docs/hrm/SRS.md` §16 | Cùng mã FR + pointer khách |
| Team delta | `docs/program/deltas/BA_HRM_ORPHAN_TO_SRS_01_20260723.md` | Chi tiết AC / ownership nội bộ |

---

## 4. Exit criteria check

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Promote FR Settings CRUD + picker (SC-POS/JT/LEAVE/DEC/PAY), EMP-COL, orphan cần khách thấy | **PASS** (delta 7 mục + spine ADD) |
| 2 | Pointer dual-doc team↔khách | **PASS** |
| 3 | Evidence → PASS_TO_PM | **PASS** (file này) |
| 4 | Handoff đầy đủ | **PASS** (§5) |
| 5 | Không claim Phase1 / HTML DONE | **PASS** (explicit DEFER HTML; leftover inventory) |

**Meta check:** Delta khách không chứa path `docs/` / work_item / prompt-echo trong narrative nghiệp vụ (bảng dual-doc dùng tên tài liệu).

---

## 5. Residual

| ID | Residual | Next |
|----|----------|------|
| R1 | Leftover §9 chưa đủ thân 7 mục trên khách | ba-docs wave sau (optional) hoặc giữ inventory |
| R2 | HTML phân hệ HRM chưa rebuild | PM khi cần gửi HTML — generator / manual pack |
| R3 | Field `catalog_key` matrix | ba-data `BA-HRM-SETTINGS-MASTER-DATA-01` (đã song song) |
| R4 | ADR Settings SoT / REC-WF | sa `SA-HRM-SETTINGS-REC-WF-01` |
| R5 | Code hardcode | PM → Dev sau spec lock — **cấm** Option hardcode |

---

## 6. completion_report

**Closed:** Promote ADD-only FR Settings CRUD + picker + EMP-COL + AT-WF + CI-PKG vào SRS khách (delta đầy đủ 7 mục); patch spine SC-01 / AT-10 / 21 / 27; dual-doc pointer; cập nhật team §16 + ORPHAN + README; **không** claim Phase1 / HTML.

**Open:** leftover thân 7 mục; HTML optional; ba-data / sa / Dev ngoài scope.

**ack_status:** **PASS_TO_PM**

**next_owner:** **pm**

**evidence_path:** `docs/qa/evidence/ba-hrm-orphan-srs-khach-01-20260723.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-ORPHAN-SRS-KHACH-SPOT-01 (optional) hoặc tiếp pipeline Settings
role: qc (spot-check banned phrases + 2 FR Settings trên delta) HOẶC pm intake residual R3/R4
entry_criteria: BA-HRM-ORPHAN-SRS-KHACH-01 PASS — docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md + SRS_HRM_KHACH 3.1-W2e
exit_criteria: Spot-check 2 FR (SC-POS + EMP-COL) đủ 7 mục; không meta agent; dual-doc OK; ack PASS_TO_PM
cấm: apps/** · seed · claim Phase1
song song: nếu BA-D / SA Settings chưa xong — giữ parallel; Dev chỉ sau SA+BA-D
```
