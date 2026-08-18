# QC Gate — PO-HRM-BP-DOCS-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-DOCS-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **lane** | governance · **docs only** |
| **date** | 2026-08-04 |
| **audit_pass** | **R2 — re-audit pack v0.3** (partner WBS align; supersedes R1 count assumptions from synth v0.2) |
| **scope** | HRM Enterprise Blueprint markdown khách — không Dev · không UAT/implement |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (docs) |
| **no_prompt_echo** | true (audit rule) |

**Không claim:** Phase 1 DONE · UAT DONE · code/implement DONE · TechSpec/DB/API mở · Q-PAY-FORMULA đã confirm khách.

---

## Classification

| Class | Finding |
|-------|---------|
| **Process / docs hygiene** | README stamp còn **v0.2 / 34 UC** trong khi WBS/SRS/inventory đã **0.3 / 44**; meta `work_item*` còn trên WBS · inventory · SRS |
| **Product / implement** | Không áp dụng — không invent FAIL sản phẩm |
| **ENV / stack** | N/A |

---

## R2 baseline (SoT counts — prefer v0.3 files)

| Artifact | Ver đọc | Count / trạng thái |
|----------|---------|---------------------|
| Align evidence | `po-hrm-bp-partner-wbs-align-01.md` | WBS Task+`partner_req_id` = **27**; UC **44**; 30/30 REQ; SRS stub P0 APPEND |
| `WBS_HRM_ENTERPRISE.md` | **0.3** | 4 module · Task→UC→BR→partner_req · Phụ lục D 30/30 · HOLD Phụ lục E |
| `UC_INVENTORY.md` | **0.3.1** (APPEND trên 0.3) | **44** UC · **16** FR ưu tiên (10 đủ 7 + 6 stub) · 27 Task có partner_req |
| `SRS_HRM_ENTERPRISE.md` | **0.3** | Ch.1–6 · TOC 16 · **10** FR đủ 7 mục + **6** stub P0 · HOLD |
| `README_SPONSOR_REVIEW.md` | stamp **v0.2** | «34 UC» — **STALE vs pack** |
| Prior synth `po-hrm-bp-wbs-srs-synth-01.md` | v0.2 / 34 | **Stale counts** — không dùng làm SoT R2 |

---

## Audit checklist (R2)

| # | Tiêu chí | Kết quả | Ghi chú |
|---|----------|---------|---------|
| 1 | no_prompt_echo / banned phrases | **CONDITION** | Không thấy `Draft for Sponsor` / HTTP thô / `PASS_TO_PM` trên 5 file core khách. **Còn:** `work_item` / `work_item align` trên WBS · UC_INVENTORY · SRS; README chưa sạch stamp. File phụ trong README (ADR/DATA_OWNERSHIP/API_BOUNDARY) vẫn có meta team / `tenant_id` — strip hoặc bỏ khỏi packet gửi. |
| 2 | WBS Task→UC→BR→partner_req (4 module) | **PASS** | Align: **27** Task có `partner_req_id`; inventory xác nhận 27; Phụ lục D 30/30 |
| 3 | SRS 6 chương; spot ≥2 FR/module trong 10 FR đủ 7 mục | **PASS** | § Spot-check R2 |
| 4 | HOLD TechSpec/DB/API · không claim DONE code | **PASS** | README HOLD · WBS Phụ lục E · SRS §1.2/§6 · align residual «chưa HTML / chưa đủ 7 stub» |
| 5 | REC↛PAY · PAY chỉ đọc timesheet chốt · Q-PAY SA-REC | **PASS** | WBS ranh giới · FR-PAY-01 BR-BP-TS-03 · matrix §8 **SA-REC** · Decision packet chờ ký · ADR §10 SA Recommended |
| 6 | ID consistency UC-BP-* | **CONDITION (README only)** | WBS/inventory/SRS khóa `UC-BP-*`; `UC-HRM-BP-*` chỉ Phụ lục C / crosswalk. **Lệch còn lại:** README «34 UC» vs **44** |
| 7 | Decision packet workshop | **PASS** | Vấn đề / Option khuyến nghị / bảng xác nhận — usable |

---

## Spot-check FR R2 (≥2 / module — chỉ FR đủ 7 mục)

| Module | FR | 7 mục + sequence + Diễn biến |
|--------|-----|-------------------------------|
| REC | FR-UC-BP-REC-01, FR-UC-BP-REC-08 | **PASS** |
| CORE | FR-UC-BP-CORE-01, FR-UC-BP-CORE-02 | **PASS** |
| ATT | FR-UC-BP-ATT-08, FR-UC-BP-ATT-10 (+ ATT-11) | **PASS** |
| PAY | FR-UC-BP-PAY-01, FR-UC-BP-PAY-02, FR-UC-BP-PAY-04 | **PASS** |

Stub P0 (6): nhãn rõ — **không** đếm đủ 7 mục. Inventory tầng «cấm rewrite» 10 FR khớp SRS.

**OBS:** Diễn biến CORE nghiêng quyền hơn ATT/PAY edge — không chặn GO docs.

---

## Boundaries & Decision (R2 confirm)

| Invariant | Status |
|-----------|--------|
| REC ↛ PAY | PASS |
| PAY ← bảng công **đã chốt** only (BR-BP-TS-03) | PASS |
| Q-PAY-FORMULA = SA-REC / chờ confirm — **không** giả chốt khách | PASS |
| HOLD TechSpec / DB_DESIGN / API_DESIGN | PASS |

---

## Residual / Conditions (owner)

| ID | Sev | Owner | Condition |
|----|-----|-------|-----------|
| **R-QC-01** | P1 | **ba-docs** | Cập nhật `README_SPONSOR_REVIEW.md`: stamp **v0.3** (inventory 0.3.1 OK); **44** UC; **16** FR ưu tiên (10 đủ 7 + 6 stub); bỏ «34 UC» / v0.2 |
| **R-QC-02** | P1 | **ba-docs** | Strip `work_item` / `work_item align` khỏi body khách (WBS, UC_INVENTORY, SRS) trước gửi sponsor; file team (ADR depth / DATA_OWNERSHIP ack / API `tenant_id`) tách khỏi README hoặc làm sạch |
| **R-QC-03** | P2 | **ba-docs** | Thuật ngữ Anh còn sót («spawn», «pipeline», «Membership») → Việt nghiệp vụ trên bản workshop |
| **R-QC-04** | P2 optional | **ba-process** | Làm dày Diễn biến CORE / đủ 7 mục cho 6 stub sau Decision Q-* — không block gửi khung |

**Đóng so với R1:** không còn residual «pack vẫn 34 UC» trên WBS/inventory/SRS — align v0.3 **đã** 44/27/16. Residual còn lại chủ yếu **README + meta**.

---

## Verdict

**GO WITH CONDITIONS** (docs) — logic giấy v0.3 (27 Task · 44 UC · 10 FR đủ 7 · HOLD · boundaries · Q-PAY SA-REC) đủ gửi sponsor **sau** R-QC-01 + R-QC-02.

- **Không** GO tuyệt đối: README stale + prompt-echo meta còn trên packet.
- **Không** NO-GO: không lỗi cấu trúc nghiệp vụ / không claim UAT / không giả confirm Q-PAY.
- **Không** Phase 1 / implement / UAT DONE.

---

## completion_report

- **Đóng:** Re-audit R2 trên SoT v0.3 (+ inventory 0.3.1); đối chiếu align evidence 27/44/30; spot FR ≥2/module; HOLD + boundaries + Q-PAY SA-REC.
- **Mở:** R-QC-01 README; R-QC-02 strip meta; R-QC-03/04 optional.
- **Verdict:** **GO WITH CONDITIONS** (docs).

## next_owner

`pm` → **ba-docs** (R-QC-01 + R-QC-02) rồi gửi sponsor review packet; **hoặc** gửi packet kèm Conditions ghi rõ trên biên bản.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-BA-CLEAN-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
no_prompt_echo: true
entry_criteria: QC GWC R2 v0.3 — docs/qa/evidence/po-hrm-bp-docs-qc-01.md · Conditions R-QC-01 R-QC-02
exit_criteria:
  1) README_SPONSOR_REVIEW: v0.3 · 44 UC · 16 FR ưu tiên (10 đủ 7 + 6 stub) · trỏ WBS/SRS/inventory đúng
  2) Strip work_item* khỏi WBS + UC_INVENTORY + SRS (bản khách); ADR/DATA_OWNERSHIP/API_BOUNDARY — sạch meta hoặc bỏ khỏi README gửi khách
  3) Không đụng apps/** · không mở TechSpec/DB/API · không giả confirm Q-PAY-FORMULA
evidence_path: docs/qa/evidence/po-hrm-bp-docs-ba-clean-01.md
ack_status target: PASS_TO_PM
after: PM gửi sponsor packet = README + WBS 0.3 + UC_INVENTORY + SRS 0.3 + DECISION_PACKET_Q_PAY_FORMULA (+ matrix nếu đã sạch)
```

**Alternate:** PM gửi sponsor review ngay với Conditions R-QC-01/02 ghi trên cover — Decision Q-PAY vẫn **chờ ký**.
