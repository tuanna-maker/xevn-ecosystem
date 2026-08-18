# BA-HRM-SRS-BATECO-W2B-CATALOG-01 — Evidence

**work_item_id:** `BA-HRM-SRS-BATECO-W2B-CATALOG-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

ADD-only ≥8–12 FR **planned_W2 Cao** còn lại (SCOPE / UC-02..08 / MD / IM / leftovers §6.2). Cập nhật inventory `body_ready`. **Giữ** W1/W2a FR + AC-ATT-SHEET. Cấm wipe / apps/** / claim 120 UC done.

## 2. Deliverables

| # | Deliverable | Kết quả |
|---|-------------|---------|
| 1 | SRS khách +12 FR (§3.21–3.32) | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2b** |
| 2 | E2E §2.4.6 W2b order | Có trong body |
| 3 | Inventory freeze cập nhật | `docs/hrm/UC_INVENTORY_BRD_SRS.md` — §5 + §6.3 |
| 4 | Team pointer / Yêu cầu status | `docs/hrm/SRS.md` · `docs/hrm/BRD.md` §7.1 |
| 5 | AC-ATT-SHEET | **Giữ** trên FR-HRM-AT-14 (01..06) |

### 2.1 FR W2b (12)

| FR | Mã UC | Nhóm / Yêu cầu-N |
|----|-------|------------------|
| FR-HRM-SCOPE-01 | UC-HRM-SCOPE-01 | Phạm vi tập đoàn · 01 |
| FR-HRM-SCOPE-02 | UC-HRM-SCOPE-02 | Phạm vi thành viên · 01 |
| FR-HRM-SCOPE-03 | UC-HRM-SCOPE-03 | Lọc đơn vị nhúng · 01 |
| FR-HRM-02 | UC-HRM-02 | Quản trị nền tảng · 02 |
| FR-HRM-03 | UC-HRM-03 | Quản trị doanh nghiệp · 02 |
| FR-HRM-04 | UC-HRM-04 | Mời NV hàng loạt · 03 |
| FR-HRM-05 | UC-HRM-05 | Thông tin nhạy cảm · 04 |
| FR-HRM-06 | UC-HRM-06 | Đồng bộ danh mục · 05 |
| FR-HRM-08 | UC-HRM-08 | Liệt kê danh mục · 05 |
| FR-HRM-12 | UC-HRM-12 | Hộp thư thông báo · 12 |
| FR-HRM-MD-01 | HRM-MD-01 | Gửi đổi metadata · 16 |
| FR-HRM-IM-01 | HRM-IM-01 | Xem trước import · 18 |

W1 (§3.1–3.8) + W2a (§3.9–3.20) **không** bị rút.

## 3. Gate §3.4.8

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| FR heading §3 = Kết quả trả về | **32 = 32 PASS** |
| Stub «Người dùng mở:» | **0 PASS** |
| AC-ATT-SHEET-01..06 còn trên FR-HRM-AT-14 | **PASS** |
| Yêu cầu-N / 120 UC không giảm | **PASS** (30 / 120) |
| Prompt-echo Sponsor trong narrative FR | **PASS** |

## 4. Spot-check (mẫu W2b)

| FR | Meta | Đầu vào | Luồng ≥4 | BR | sequence | Diễn biến cân bằng | Kết quả trả về |
|----|------|---------|----------|-----|----------|--------------------|----------------|
| FR-HRM-SCOPE-01 | P | P | P | P | P | P (auth≤2; success≥40%; fail sâu≥30%) | P |
| FR-HRM-04 | P | P | P | P | P | P | P |
| FR-HRM-MD-01 | P | P | P | P | P | P | P |

## 5. Inventory status delta

| Metric | Trước W2b | Sau W2b |
|--------|-----------|---------|
| body_ready (Yêu cầu) | 13 | **21** |
| planned_W2 (Yêu cầu) | 17 | **9** |
| FR khách đủ 7 mục | 20 | **32** |

Yêu cầu mới `body_ready` nhờ W2b: **01, 02, 03, 04, 05, 12, 16, 18**.

### 5.1 Residual planned_W2 (= 9)

| Yêu cầu | Priority | Ghi chú |
|---------|----------|---------|
| 11 | Trung bình | UC-HRM-11 dịch vụ nội bộ |
| 19 | Trung bình | HRM-OP-* |
| 21 | Thấp hơn | HRM-FL-01 |
| 22 | **Cao** | Embed UC-HRM-20..27 |
| 23 | **Cao** | MOB-01..15 |
| 24 | **Cao** | INT-01..04 |
| 25 | Trung bình | UC-HRM-27 |
| 26 | Trung bình | UC-HRM-01 |
| 28 | **Cao** | residual UC-HRM-11 (09/10/12 đã slice) |
| 30 | Trung bình | BR-HRM-08 |

**planned_W2 Cao còn:** **4** (22, 23, 24, 28) — **chưa** near 0 → QC skeleton **có thể** chạy song song trên 32 FR; W2c catalog vẫn cần nếu muốn đóng Cao.

Leftover trong Yêu cầu đã body_ready (không chặn status): UC-07; MD-02..05; IM-02..04; EM/CI/SC/RC/PR/PF slices.

## 6. completion_report

| Đóng | Residual / mở |
|------|----------------|
| +12 FR W2b SCOPE/admin/catalog/inbox/MD/IM | **planned_W2 = 9** (Cao = 4) |
| Gate 32=32 Kết quả trả về | W2c: MOB / INT / embed / UC-11 + leftover slices |
| AC-ATT-SHEET + W1/W2a giữ nguyên | HTML build khách (nếu PM yêu cầu); SA TechSpec `ref_srs` |

**Không** claim full 120 UC / Phase 1 / PROD.

## 7. Handoff

- **next_owner:** `qc` (skeleton gate trên 32 FR) **và/hoặc** `ba-docs` (W2c Cao residual) — PM chọn  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-srs-bateco-w2b-catalog-01-20260721.md`

### next_dispatch_prompt (copy-ready) — QC skeleton gate

```text
work_item_id: QC-HRM-SPEC-REMASTER-SKELETON-GATE-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: SRS_HRM_KHACH.md v3.0-W2b Ch.1–6; 32 FR; inventory freeze W2b; evidence ba-hrm-srs-bateco-w2b-catalog-01-20260721.md
exit_criteria: Audit §3.4.8 skeleton PASS; spot-check ≥3 FR (gồm FR-HRM-AT-14 AC-ATT-SHEET + 1 W2b SCOPE/admin); đếm FR heading = Kết quả trả về = 32; GO/GWC hoặc NO-GO có residual list; không yêu cầu full 120 UC
evidence_path: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-YYYYMMDD.md
ack_status: PASS_TO_PM
```

### next_dispatch_prompt (copy-ready) — W2c catalog (Cao residual)

```text
work_item_id: BA-HRM-SRS-BATECO-W2C-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P1
entry_criteria: W2b PASS — docs/qa/evidence/ba-hrm-srs-bateco-w2b-catalog-01-20260721.md; planned_W2 Cao=4 (YC-22/23/24/28)
exit_criteria: ADD ≥8 FR Cao còn lại (ưu tiên UC-HRM-INT-01..04, UC-HRM-11, embed slice, MOB slice tối thiểu); inventory body_ready cập nhật; không wipe W1/W2a/W2b / AC-ATT-SHEET
evidence_path: docs/qa/evidence/ba-hrm-srs-bateco-w2c-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · apps/** · claim 120 UC done
```

### pm_dispatch_hint

Ưu tiên **QC skeleton** ngay trên 32 FR (planned_W2 Cao chưa 0 nhưng skeleton đủ). Song song hoặc sau QC: **W2c** đóng YC-22/23/24/28 nếu cần gửi khách đủ Cao.
