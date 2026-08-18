# BA-HRM-ORPHAN-TO-SRS-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ORPHAN-TO-SRS-01` |
| **date** | 2026-07-23 |
| **from_role** | ba-process |
| **to_role** | pm → **ba-data** (`BA-HRM-SETTINGS-MASTER-DATA-01`) + **sa** (`SA-HRM-SETTINGS-REC-WF-01`) song song; ba-docs promote khách wave 2 |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **CẤM** | `apps/**` / seed / deploy / Option hardcode |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| Delta SRS (FR/UC/BR/AC #1–21) | `docs/program/deltas/BA_HRM_ORPHAN_TO_SRS_01_20260723.md` | **DONE** |
| Team SRS §16 lock | `docs/hrm/SRS.md` §16 | **DONE** |
| Mobile delta OU + hub | `docs/hrm/SRS_MOBILE.md` (UC-HRM-MOB-02/03) | **DONE** |
| Orphan list + cột FR | `docs/program/ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` | **DONE** |
| Khách HTML 7-mục body | `SRS_HRM_KHACH` | **DEFER** ba-docs wave 2 (pointer §4 delta) |

---

## 2. Trace orphan → FR → SRS §

| # | FR-ID | SRS § path |
|---|-------|------------|
| 1 | FR-HRM-EMP-COL-01 | `SRS.md` §16.1 · delta §16.1 |
| 2 | FR-HRM-MOB-OU-01 | `SRS_MOBILE` MOB-02 delta · delta §16.2 |
| 3 | FR-HRM-AT-WF-01 | delta §16.3 · UC-HRM-10 |
| 4 | FR-HRM-SC-JT-01 | `SRS.md` §16.2 · delta §16.4 · F6 |
| 5 | FR-HRM-CI-PKG-01 | delta §16.5 |
| 6 | FR-HRM-ADV-01 · OT-01 · EA-01 | delta §16.6 |
| 7 | FR-HRM-FL-02 | delta §16.7 |
| 8 | FR-HRM-IM-02 | delta §16.8 |
| 9 | FR-HRM-SC-POS-01 | `SRS.md` §16.2 · delta §16.9 |
| 10 | FR-HRM-20-CHART-01 | delta §16.10 |
| 11 | FR-HRM-20-BAND-01 | delta §16.11 |
| 12 | FR-HRM-SC-PAY-01 | `SRS.md` §16.2 · delta §16.12 |
| 13 | FR-HRM-SC-DEC-01 | `SRS.md` §16.2 · delta §16.13 |
| 14 | FR-HRM-IM-03 | delta §16.14 |
| 15 | FR-HRM-OP-01 | delta §16.15 |
| 16 | FR-HRM-RC-IV-01 | delta §16.16 |
| 17 | FR-HRM-MOB-HUB-01 | `SRS_MOBILE` MOB-03 · delta §16.17 |
| 18 | FR-HRM-SCOPE-UUID-01 | delta §16.18 |
| 19 | FR-HRM-SC-LEAVE-01 | `SRS.md` §16.2 · delta §16.19 |
| 20 | FR-HRM-SC-WF-GATE-01 | delta §16.20 |
| 21 | FR-HRM-SC-EXT-01 | delta §16.21 |

**Settings CRUD + picker:** BR-HRM-MD-01 · AC-HRM-PICKER-01 · FR-HRM-SC-POS/JT/LEAVE/DEC/PAY (+ FL-02, CI-PKG).

**Plane A (#1):** FR khóa nhãn ĐVTV/LE — **không** dispatch Dev trong wave này.

---

## 3. Exit criteria check

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Delta mỗi orphan #1–21 → FR + Diễn biến min + AC | **PASS** |
| 2 | FR-HRM-SC-* Settings CRUD + filter/search picker | **PASS** (§16.0 + §16.2 + delta §3) |
| 3 | Plane A cột công ty FR lock, no Dev | **PASS** |
| 4 | Bảng trace orphan → FR → § | **PASS** (§2 trên + delta §1) |
| 5 | Evidence + ORPHAN cập nhật cột FR | **PASS** |
| 6 | Handoff PASS_TO_PM | **PASS** (ba-data trước Dev; không PASS_TO_BA-D block — parallel OK) |

---

## 4. Residual

| ID | Residual | Next |
|----|----------|------|
| R1 | Field-level `catalog_key` matrix | **ba-data** `BA-HRM-SETTINGS-MASTER-DATA-01` |
| R2 | XBOS pull vs HRM overlay + REC-WF per company / F4–F6 | **sa** `SA-HRM-SETTINGS-REC-WF-01` |
| R3 | Promote 7-mục vào `SRS_HRM_KHACH` / HTML | **ba-docs** wave 2 |
| R4 | Code vẫn hardcode | **PM** sau SA+BA-D — Dev replace theo FR (**cấm** Option hardcode) |
| R5 | A.1 implement + HOLD_DEPLOY | Wave Dev riêng đã có AC-EMP-COL — không trong BA-ORPHAN |

---

## 5. completion_report

**Closed:** ADD-only FR/UC/BR/AC cho orphan #1–21; Settings master SC-POS/JT/LEAVE/DEC/PAY + BR-HRM-MD-01 / AC-HRM-PICKER-01; Plane A EMP-COL lock; merge pointer `SRS.md` §16 + `SRS_MOBILE`; cập nhật ORPHAN cột FR; evidence này.

**Open:** ba-data matrix; SA ADR/TechSpec Settings+REC-WF; ba-docs khách; Dev implementation ngoài scope.

**ack_status:** **PASS_TO_PM**

**next_owner:** **pm**

**evidence_path:** `docs/qa/evidence/ba-hrm-orphan-to-srs-01-20260723.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BA-HRM-SETTINGS-MASTER-DATA-01
role: ba-data
lane: governance
entry_criteria: BA-HRM-ORPHAN-TO-SRS-01 PASS — docs/program/deltas/BA_HRM_ORPHAN_TO_SRS_01_20260723.md §3 Settings matrix + FR-HRM-SC-POS/JT/LEAVE/DEC/PAY + BR-HRM-MD-01
exit_criteria: Ma trận field → catalog_key → Settings CRUD FR → form consumer + AC filter/search; map DANH_MUC_XBOS_CHO_HRM STT; evidence docs/qa/evidence/ba-hrm-settings-master-data-01-YYYYMMDD.md; ack PASS_TO_PM
cấm: apps/** · seed · hardcode Option
song song PM cũng dispatch: SA-HRM-SETTINGS-REC-WF-01 (ADR Settings SoT vs XBOS pull; REC-WF per company; F4/F6/Bay.vn flex)
```

---

> **Note (2026-07-23 RE-DISPATCH):** `ack_status: CANCELLED_SUPERSEDED` — không ghi đè delta/`SRS.md` §16; giữ PASS_TO_PM agent trước.
