# BA-HRM-SRS-BATECO-W2-CATALOG-01 — Evidence

**work_item_id:** `BA-HRM-SRS-BATECO-W2-CATALOG-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

ADD-only expand SRS khách FR cho batch **planned_W2 Cao** ưu tiên attendance / payroll / recruitment / performance leftovers (inventory §6.2). Mỗi FR: 7 mục + Kết quả trả về + Diễn biến cân bằng. Cập nhật inventory `body_ready`. **Cấm wipe** W1 FR / AC-ATT-SHEET.

## 2. Deliverables

| # | Deliverable | Kết quả |
|---|-------------|---------|
| 1 | SRS khách +12 FR (§3.9–3.20) | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` v3.0-W2 |
| 2 | E2E §2.4.5 W2a order | Có trong body |
| 3 | Inventory freeze cập nhật | `docs/hrm/UC_INVENTORY_BRD_SRS.md` — §5 + §6.2 |
| 4 | Team pointer / Yêu cầu status | `docs/hrm/SRS.md` · `docs/hrm/BRD.md` §7.1 |
| 5 | AC-ATT-SHEET | **Giữ** trên FR-HRM-AT-14 (01..06) |

### 2.1 FR W2a (12)

| FR | Mã UC | Nhóm |
|----|-------|------|
| FR-HRM-AT-01 | HRM-AT-01 | Bản ghi chấm — ghi nhận |
| FR-HRM-AT-02 | HRM-AT-02 | Bản ghi chấm — danh sách |
| FR-HRM-AT-03 | HRM-AT-03 | Bản ghi chấm — cập nhật trạng thái |
| FR-HRM-09 | UC-HRM-09 | Đơn chỉnh sửa chấm (vòng đời) |
| FR-HRM-AT-12 | HRM-AT-12 | Phê duyệt đơn nghỉ |
| FR-HRM-AT-13 | HRM-AT-13 | Từ chối đơn nghỉ |
| FR-HRM-PR-01 | HRM-PR-01 | Tạo kỳ lương |
| FR-HRM-PR-03 | HRM-PR-03 | Xử lý tính lương |
| FR-HRM-PR-04 | HRM-PR-04 | Chốt kỳ lương |
| FR-HRM-RC-03 | HRM-RC-03 | Tạo hồ sơ ứng viên |
| FR-HRM-RC-05 | HRM-RC-05 | Lên lịch phỏng vấn |
| FR-HRM-PF-01 | HRM-PF-01 | Tạo chu kỳ đánh giá |

W1 FR (§3.1–3.8) **không** bị rút.

## 3. Gate §3.4.8

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| FR body metadata Mã UC = Kết quả trả về | **20 = 20 PASS** |
| Stub «Người dùng mở:» | **0 PASS** |
| AC-ATT-SHEET-01..06 còn trên FR-HRM-AT-14 | **PASS** |
| Yêu cầu-N / 120 UC không giảm | **PASS** (30 / 120) |
| Prompt-echo Sponsor trong narrative FR | **PASS** (không stamp chat/work_item trong FR body) |

## 4. Spot-check (mẫu W2a)

| FR | Meta | Đầu vào | Luồng ≥4 | BR | sequence | Diễn biến cân bằng | Kết quả trả về |
|----|------|---------|----------|-----|----------|--------------------|----------------|
| FR-HRM-AT-01 | P | P | P | P | P | P (auth≤2; success≥40%; fail sâu≥30%) | P |
| FR-HRM-PR-03 | P | P | P | P | P | P | P |
| FR-HRM-09 | P | P | P | P | P | P | P |

## 5. Inventory status delta

| Metric | Trước W2a | Sau W2a |
|--------|-----------|---------|
| body_ready (Yêu cầu) | 10 | **13** |
| planned_W2 (Yêu cầu) | 20 | **17** |
| FR khách đủ 7 mục | 8 | **20** |

Yêu cầu mới `body_ready` nhờ W2a: **07, 08, 20** (09/13/14 đã body_ready — bổ sung FR leftover).

## 6. completion_report

| Đóng | Residual / mở |
|------|----------------|
| 12 FR W2a ATT/PR/RC/PF + inventory §6.2 | **planned_W2 = 17** Yêu cầu |
| Gate 20=20 Kết quả trả về | Leftover Cao: SCOPE-01..03, UC-HRM-02..08, MD, IM, MOB, INT, UC-HRM-12, EM-02..05, CI-03..07, PR-02/06, RC-02/04/06, PF-02..04, SC-02..09… |
| AC-ATT-SHEET không bị rút | HTML build khách (nếu PM yêu cầu); SA TechSpec `ref_srs` |

**Không** claim full 120 UC / Phase 1 / PROD.

## 7. Handoff

- **next_owner:** `ba-docs` (W2b catalog) **hoặc** `qc` (skeleton gate sample) — PM chọn  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-srs-bateco-w2-catalog-01-20260721.md`

### next_dispatch_prompt (copy-ready) — W2b catalog

```text
work_item_id: BA-HRM-SRS-BATECO-W2B-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
entry_criteria: W2a PASS — docs/qa/evidence/ba-hrm-srs-bateco-w2-catalog-01-20260721.md; SRS_HRM_KHACH.md 20 FR; planned_W2=17; cấm wipe AC-ATT-SHEET / W1+W2a FR
exit_criteria: ADD ≥8–12 FR planned_W2 Cao còn lại (ưu tiên SCOPE, UC-HRM-02..08, MD-01..05, IM, UC-HRM-12, leftover EM/CI/SC/RC/PR/PF); số Mã UC body = số Kết quả trả về; inventory status cập nhật; không giảm 120 UC / 30 Yêu cầu
evidence_path: docs/qa/evidence/ba-hrm-srs-bateco-w2b-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · seed · apps/** · prompt-echo · claim full 120 UC
```

### next_dispatch_prompt (copy-ready) — QC skeleton gate

```text
work_item_id: QC-HRM-SPEC-REMASTER-SKELETON-GATE-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: SRS_HRM_KHACH.md Ch.1–6; inventory freeze; W1+W2a evidence
exit_criteria: Audit §3.4.8 skeleton PASS; spot-check ≥3 FR (gồm FR-HRM-AT-14 AC-ATT-SHEET); đếm Mã UC = Kết quả trả về; GO/GWC hoặc NO-GO có residual list
evidence_path: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-YYYYMMDD.md
ack_status: PASS_TO_PM
```

### pm_dispatch_hint

Ưu tiên **W2b ba-docs** nếu cần đủ Cao trước gửi khách; **QC skeleton** có thể chạy song song trên 20 FR hiện có (không đợi full 120).
