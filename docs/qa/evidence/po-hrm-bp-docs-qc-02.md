# QC Gate — PO-HRM-BP-DOCS-QC-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-DOCS-QC-02` |
| **from_role** | qc |
| **to_role** | pm |
| **lane** | governance · **docs only** |
| **date** | 2026-08-04 |
| **scope** | CLEAN (R-QC-01/02) + Wave-2A 6 FR — packet `docs/client-delivery/hrm-enterprise-blueprint/` |
| **prior_ba** | `po-hrm-bp-docs-ba-clean-01.md` · `po-hrm-bp-ba-docs-fr-wave2-01.md` |
| **prior_qc** | `po-hrm-bp-docs-qc-01.md` GWC → Conditions R-QC-01 / R-QC-02 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (docs) |
| **no_prompt_echo** | true (audit rule) |

**Không claim:** SRS đã confirm khách · Q-PAY-FORMULA / Q-* đã chốt · TechSpec/DB/API mở · Dev coding · Phase 1 / UAT / implement DONE · Wave-2B đóng.

---

## Classification

| Class | Finding |
|-------|---------|
| **Process / docs hygiene** | R-QC-01 README stamp + R-QC-02 meta strip = **CLOSED** (verify độc lập). Packet gửi khách sạch `work_item` / `PO-HRM-BP-*`. |
| **FR depth Wave-2A** | 6 FR stub → đủ 7 mục + `sequenceDiagram` + Diễn biến — **PASS**. |
| **Product / implement** | N/A — không invent FAIL sản phẩm; không mở Dev. |
| **ENV / stack** | N/A |

---

## Prior GWC conditions — verify CLOSED

| ID | Claim ba-docs | QC verify | Status |
|----|---------------|-----------|--------|
| **R-QC-01** | README v0.4 · 44 UC · 16 FR | README header **v0.4**; bảng **44** UC · **16** FR; SRS **0.4**; ADR/DATA_OWNERSHIP/API_BOUNDARY **không** trong danh sách gửi | **CLOSED** |
| **R-QC-02** | Strip `work_item*` khỏi body khách | Grep `work_item` / `PO-HRM-BP-` trên WBS · UC_INVENTORY · SRS · UC_BR_MATRIX · PARTNER_REQ_CATALOG · DECISION_PACKET = **0**; Excel KHACH `meta_hits=0` | **CLOSED** |

Meta còn trên file **nội bộ** (ADR · TECHSPEC_OUTLINE · DATA_OWNERSHIP · API_BOUNDARY · UC_ID_CROSSWALK · FR_BACKLOG_REMAINING) — **đúng** vì đã bỏ khỏi README send list / HOLD.

---

## Audit checklist (QC-02)

| # | Tiêu chí | Kết quả | Ghi chú |
|---|----------|---------|---------|
| 1 | README = v0.4 · 44 UC · 16 FR; không ADR/DATA/API trong send list | **PASS** | Send: Excel · WBS md · inventory · SRS · Decision Q-PAY · UC_BR_MATRIX · PARTNER catalog. HOLD TechSpec/DB/API stated. |
| 2 | Grep body khách: zero `work_item` / `PO-HRM-BP-*` | **PASS** | 5 MD + Decision + Excel sheet scan |
| 3 | SRS v0.4 Wave-2A 6 FR đủ 7 mục + sequenceDiagram | **PASS** | § Spot-check Wave-2A; `sequenceDiagram` count = **16**; nhãn `stub P0` = **0** |
| 4 | Decision Q-* vẫn «chờ chốt» | **PASS** | Decision packet «chờ đối tác xác nhận»; FR REC-02/02b Q-REC-HEADCOUNT; ATT-09 Q-LEAVE-UNIT; README Q-PAY «chưa xác nhận» |
| 5 | HOLD TechSpec/DB/API | **PASS** | README HOLD · SRS §1.2 / §6 |
| 6 | Excel WBS_KHACH.xlsx | **PASS (optional)** | Tồn tại; 7 sheets; meta_hits=0 — không blocker |

---

## Spot-check Wave-2A (6 FR)

Mỗi FR kiểm: Thông tin chung · Đầu vào · Luồng chính · Quy tắc · Trường hợp đặc biệt · sequenceDiagram · Diễn biến 4 cột (+ Thành công).

| FR | partner_req / BR | Decision | 7 mục + seq | Verdict |
|----|------------------|----------|-------------|---------|
| FR-UC-BP-REC-01b | REQ_REC_003 · BR-BP-HC-04 | — | **PASS** | PASS |
| FR-UC-BP-REC-02 | REQ_REC_001 · BR-BP-HC-05 | Q-REC-HEADCOUNT **chờ chốt** | **PASS** | PASS |
| FR-UC-BP-REC-02b | REQ_REC_001 · BR-BP-HC-06 | Q-REC-HEADCOUNT **chờ chốt** (đề xuất chặn) | **PASS** | PASS |
| FR-UC-BP-ATT-02 | TIME-002 · BR-BP-SHF-02 | — | **PASS** | PASS |
| FR-UC-BP-ATT-09 | REQ_NP_003/006 · LV-06/05 | Q-LEAVE-UNIT **chờ chốt** | **PASS** | PASS |
| FR-UC-BP-CORE-08 | HR-005 · BR-BP-RD-01 | — | **PASS** | PASS |

**Wave-2B:** không yêu cầu gate này (ATT-03b, ATT-04/04b, REC-06…) — còn backlog; **không** FAIL.

**10 FR đợt trước:** còn trong TOC «Đủ 7 mục»; không phát hiện wipe stub — giữ nguyên thân (không re-audit sâu mọi dòng).

---

## Boundaries (reconfirm)

| Invariant | Status |
|-----------|--------|
| Q-PAY-FORMULA / Q-* = chờ chữ ký — **không** giả chốt khách | PASS |
| HOLD TechSpec / DB_DESIGN / API_DESIGN | PASS |
| Không mở Dev coding | PASS |
| Không claim SRS customer-confirmed | PASS |

---

## Residual / Conditions

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-QC-01** | P1 | ba-docs | **CLOSED** | README v0.4 / 44 / 16 |
| **R-QC-02** | P1 | ba-docs | **CLOSED** | Meta strip packet gửi |
| **R-QC-03** | P2 OBS | ba-docs | **OPEN (non-blocking)** | WBS còn từ «pipeline» (EN) — polish workshop; không chặn gửi khung v0.4 |
| **R-BP-WAVE2B** | P2 program | ba-docs | **OPEN** | FR lịch Wave-2B — ngoài scope QC-02 |
| **Q-*** decisions | P0 business | partner / Ban dự án | **OPEN (by design)** | Không invent closed |

**Condition còn lại cho GWC (docs):** chỉ ghi rõ **phạm vi GO** — packet CLEAN+Wave-2A sẵn sàng gửi workshop; **không** = SRS đã confirm · **không** = mở TechSpec/Dev.

---

## Verdict

**GO WITH CONDITIONS** (docs) — scope: CLEAN + Wave-2A (16 FR đủ 7 mục) + packet gửi khách sạch meta.

| Được | Không được |
|------|------------|
| Gửi sponsor/partner **review packet** v0.4 (README + Excel ưu tiên + WBS/inventory/SRS/Decision/matrix/catalog) | Claim khách đã ký SRS / Q-PAY |
| Đóng R-QC-01 · R-QC-02 từ QC-01 | Mở TechSpec / DB_DESIGN / API_DESIGN / code |
| Tiếp Wave-2B docs khi PM ưu tiên | Claim Phase 1 / UAT / implement DONE |

**L2.5 / UAT journey:** N/A — docs governance only.

---

## Evidence pack note

Gate = docs hygiene + FR structure. Không chạy `verify:qc:evidence-pack` browser assets (không UF). Evidence path này là SoT QC-02.

---

## completion_report

- **Đóng:** R-QC-01 · R-QC-02; verify Wave-2A 6/6 FR đủ 7 mục + 16 sequenceDiagram; README send list sạch ADR/DATA/API; Excel meta 0; Decision Q-* vẫn chờ.
- **Mở (OBS/program):** R-QC-03 EN polish; Wave-2B; Q-* chờ partner; HOLD kỹ thuật.
- **Verdict:** **GO WITH CONDITIONS** (docs) — sẵn sàng gửi review; **không** SRS confirmed / **không** Dev.

## next_owner

`pm` — gửi packet sponsor **hoặc** dispatch ba-docs Wave-2B / polish R-QC-03; **không** dispatch Dev cho blueprint này.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-SPONSOR-SEND-01
from_role: pm
to_role: pm (sponsor cover) | ba-docs (optional Wave-2B)
lane: governance
priority: P1
no_prompt_echo: true
entry_criteria: QC GO WITH CONDITIONS docs — docs/qa/evidence/po-hrm-bp-docs-qc-02.md · R-QC-01/02 CLOSED
action:
  1) Gửi partner packet = README_SPONSOR_REVIEW v0.4 + WBS_HRM_ENTERPRISE_KHACH.xlsx (#0) + WBS/UC_INVENTORY/SRS/DECISION_PACKET/UC_BR_MATRIX/PARTNER_REQ_CATALOG
  2) Cover ghi rõ: 44 UC · 16 FR đủ 7 mục · Decision Q-* chờ chữ ký · HOLD TechSpec/DB/API · chưa triển khai code
  3) Optional parallel: ba-docs Wave-2B (FR lịch) — work_item PO-HRM-BP-BA-DOCS-FR-WAVE2B-01 — không mở Dev
cấm: invent Q-PAY closed · invent SRS customer confirm · apps/** coding · seed
evidence_path: docs/qa/evidence/po-hrm-bp-docs-sponsor-send-01.md (sau khi gửi) hoặc ba-docs wave2b evidence
ack_status target: PASS_TO_PM
```
