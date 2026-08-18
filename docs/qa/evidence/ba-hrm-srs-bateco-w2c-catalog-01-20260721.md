# BA-HRM-SRS-BATECO-W2C-CATALOG-01 — Evidence

**work_item_id:** `BA-HRM-SRS-BATECO-W2C-CATALOG-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

ADD-only ≥8 FR **planned_W2 Cao** còn lại (YC-22 embed / YC-23 MOB / YC-24 INT / YC-28 residual UC-HRM-11). Cập nhật inventory — **Cao residual → 0**. Giữ W1/W2a/W2b + AC-ATT-SHEET. Cấm wipe / apps/** / claim 120 UC done / Phase1 / PROD.

**Entry:** QC GWC `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-20260721.md` (C-SKEL-01).

## 2. Deliverables

| # | Deliverable | Kết quả |
|---|-------------|---------|
| 1 | SRS khách +12 FR (§3.33–3.44) | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2c** |
| 2 | E2E §2.4.7 W2c order | Có trong body |
| 3 | Inventory freeze cập nhật | `docs/hrm/UC_INVENTORY_BRD_SRS.md` — §5 + §5.1 + §6.4 |
| 4 | Team pointer / Yêu cầu status | `docs/hrm/SRS.md` · `docs/hrm/BRD.md` §7.1 |
| 5 | BRD khách §6 sync (C-SKEL-03) | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` |
| 6 | AC-ATT-SHEET | **Giữ** trên FR-HRM-AT-14 (01..06) |

### 2.1 FR W2c (12)

| FR | Mã UC | Nhóm / Yêu cầu-N |
|----|-------|------------------|
| FR-HRM-INT-01 | UC-HRM-INT-01 | Tuyển → hồ sơ · 24 |
| FR-HRM-INT-02 | UC-HRM-INT-02 | Hồ sơ → HĐ · 24 |
| FR-HRM-INT-03 | UC-HRM-INT-03 | Hồ sơ → phiếu lương · 24 |
| FR-HRM-INT-04 | UC-HRM-INT-04 | E2E xuyên suốt · 24 |
| FR-HRM-11 | UC-HRM-11 | Yêu cầu dịch vụ + thông báo · 11 · 28 |
| FR-HRM-20 | UC-HRM-20 | Embed tổng quan · 22 |
| FR-HRM-21 | UC-HRM-21 | Embed danh sách NV · 22 |
| FR-HRM-23 | UC-HRM-23 | Embed chấm công · 22 |
| FR-HRM-MOB-01 | UC-HRM-MOB-01 | Đăng nhập mobile · 23 |
| FR-HRM-MOB-04 | UC-HRM-MOB-04 | Chấm công mobile · 23 |
| FR-HRM-MOB-06 | UC-HRM-MOB-06 | Tạo đơn mobile · 23 |
| FR-HRM-MOB-08 | UC-HRM-MOB-08 | Duyệt đơn mobile · 23 |

W1 (§3.1–3.8) + W2a (§3.9–3.20) + W2b (§3.21–3.32) **không** bị rút.

## 3. Gate §3.4.8

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| FR heading §3 = Kết quả trả về | **44 = 44 PASS** |
| Stub «Người dùng mở:» | **0 PASS** |
| AC-ATT-SHEET-01..06 còn trên FR-HRM-AT-14 | **PASS** |
| Yêu cầu-N / 120 UC không giảm | **PASS** (30 / 120) |
| Prompt-echo Sponsor / work_item / HTTP jargon trong narrative FR | **PASS** (0 hit banned) |
| planned_W2 **Cao** residual | **0** (đóng C-SKEL-01) |

## 4. Spot-check (mẫu W2c)

| FR | Meta | Đầu vào | Luồng ≥4 | BR | sequence | Diễn biến cân bằng | Kết quả trả về |
|----|------|---------|----------|-----|----------|--------------------|----------------|
| FR-HRM-INT-04 | P | P | P | P | P | P (auth≤2; success≥40%; fail sâu≥30%) | P |
| FR-HRM-11 | P | P | P | P | P | P | P |
| FR-HRM-MOB-06 | P | P | P | P | P | P | P |

## 5. Inventory status delta

| Metric | Trước W2c | Sau W2c |
|--------|-----------|---------|
| body_ready (Yêu cầu) | 21 | **25** |
| planned_W2 (Yêu cầu) | 9 | **5** |
| planned_W2 **Cao** | **4** | **0** |
| FR khách đủ 7 mục | 32 | **44** |

Yêu cầu mới / đóng Cao nhờ W2c: **11, 22, 23, 24, 28**.

### 5.1 Residual planned_W2 (= 5 — không Cao)

| Yêu cầu | Priority | Ghi chú |
|---------|----------|---------|
| 19 | Trung bình | HRM-OP-* |
| 21 | Thấp hơn | HRM-FL-01 |
| 25 | Trung bình | UC-HRM-27 leftover embed quyết định |
| 26 | Trung bình | UC-HRM-01 |
| 30 | Trung bình | BR-HRM-08 |

Leftover trong Yêu cầu đã body_ready (không chặn status Cao): embed 22/24/25/26/27; MOB-02/03/05/07/09–15; UC-07; MD-02..05; IM-02..04; EM/CI/SC/RC/PR/PF slices.

## 6. completion_report

| Đóng | Residual / mở |
|------|----------------|
| +12 FR W2c INT/UC-11/embed/MOB | planned_W2 = 5 (Trung bình/Thấp; **Cao = 0**) |
| Gate 44=44 Kết quả trả về; C-SKEL-01 đóng | W2d leftover nếu Sponsor cần đủ Trung bình; leftover embed/MOB |
| AC-ATT-SHEET + W1/W2a/W2b giữ nguyên | SA TechSpec `ref_srs` trên 44 FR; QC re-gate optional; HTML khách nếu PM yêu cầu |
| C-SKEL-03 BRD §6 + inventory §3 wording | Đã sync trong wave này |

**Không** claim full 120 UC / Phase 1 / PROD.

## 7. Handoff

- **next_owner:** `qc` (re-gate skeleton 44 FR / đóng C-SKEL-01) **và/hoặc** `sa` (TechSpec W3 `ref_srs`)  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-srs-bateco-w2c-catalog-01-20260721.md`

### next_dispatch_prompt (copy-ready) — QC re-gate sau W2c

```text
work_item_id: QC-HRM-SPEC-REMASTER-SKELETON-GATE-02
from_role: pm
to_role: qc
lane: governance
entry_criteria: SRS_HRM_KHACH.md v3.0-W2c Ch.1–6; 44 FR; inventory Cao residual=0; evidence ba-hrm-srs-bateco-w2c-catalog-01-20260721.md; prior GWC qc-hrm-spec-remaster-skeleton-gate-01-20260721.md
exit_criteria: Audit §3.4.8 PASS; spot-check ≥3 FR (AT-14 AC-ATT-SHEET + 1 INT + 1 MOB/embed); đếm FR = Kết quả trả về = 44; xác nhận C-SKEL-01 đóng; không yêu cầu full 120 UC; GO hoặc GWC chỉ leftover Trung bình
evidence_path: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · Phase1/PROD · claim 120 UC
```

### next_dispatch_prompt (copy-ready) — SA TechSpec W3

```text
work_item_id: SA-HRM-TECHSPEC-ALIGN-W3-01
from_role: pm
to_role: sa
lane: governance
entry_criteria: SRS_HRM_KHACH.md v3.0-W2c 44 FR; inventory freeze W2c; TECHSPEC.md hiện có
exit_criteria: Mỗi UC spine + W2a/W2b/W2c có ref_srs → FR khách; OpenAPI/DTO khớp Kết quả trả về; không mâu thuẫn AC-ATT-SHEET; ghi leftover Trung bình
evidence_path: docs/qa/evidence/sa-hrm-techspec-align-w3-01-YYYYMMDD.md
ack_status: PASS_TO_PM | READY_FOR_DEV
cấm: apps/** code trước confirm TechSpec · wipe SRS khách
```

### pm_dispatch_hint

Ưu tiên **QC skeleton gate-02** xác nhận C-SKEL-01 đóng trên 44 FR; song song **SA W3** `ref_srs`. W2d catalog chỉ khi Sponsor cần đủ planned_W2 Trung bình/Thấp.
