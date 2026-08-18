# BA-HRM-SRS-BATECO-W2D-LEFTOVER-01 — Evidence

**work_item_id:** `BA-HRM-SRS-BATECO-W2D-LEFTOVER-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-22  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

ADD-only ≤8 FR leftover **Trung bình/Thấp** (`planned_W2` sau W2c). Giữ **44 FR Cao** (W1+W2a+W2b+W2c) + AC-ATT-SHEET / UF 🟢. Cập nhật inventory `body_ready`. Cấm wipe / apps/** / claim 120 UC done / Phase1 / PROD / seed.

**Entry:** `SRS_HRM_KHACH.md` (44 FR) · `UC_INVENTORY_BRD_SRS.md` planned_W2 · QC skeleton gate-02 optional (C-SKEL-04).

## 2. Checklist targets (batch ≤8)

| # | Yêu cầu-N | Priority | Primary | FR ADD |
|---|-----------|----------|---------|--------|
| 1–4 | 19 | Trung bình | HRM-OP-01..04 | FR-HRM-OP-01 · 02 · 03 · 04 |
| 5 | 21 | Thấp hơn | HRM-FL-01 | FR-HRM-FL-01 |
| 6 | 25 | Trung bình | UC-HRM-27 | FR-HRM-27 |
| 7 | 26 | Trung bình | UC-HRM-01 | FR-HRM-01 |
| 8 | 30 | Trung bình | BR-HRM-08 | FR-HRM-BOOT-01 |

**Đóng hết 5 Yêu cầu `planned_W2`** trong một batch 8 FR.

## 3. Deliverables

| # | Deliverable | Kết quả |
|---|-------------|---------|
| 1 | SRS khách +8 FR (§3.45–3.52) | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2d** |
| 2 | E2E §2.4.8 W2d order | Có trong body |
| 3 | Inventory freeze | `docs/hrm/UC_INVENTORY_BRD_SRS.md` — §5 + §5.1 + §6.5 |
| 4 | Team BRD status | `docs/hrm/BRD.md` §7.1 — YC-19/21/25/26/30 → body_ready |
| 5 | BRD khách §6 sync | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` — đủ 30 Yêu cầu primary |
| 6 | AC-ATT-SHEET | **Giữ** trên FR-HRM-AT-14 (01..06) — không đụng |

### 3.1 FR W2d (8)

| FR | Mã UC | Yêu cầu-N |
|----|-------|-----------|
| FR-HRM-OP-01 | HRM-OP-01 | 19 |
| FR-HRM-OP-02 | HRM-OP-02 | 19 |
| FR-HRM-OP-03 | HRM-OP-03 | 19 |
| FR-HRM-OP-04 | HRM-OP-04 | 19 |
| FR-HRM-FL-01 | HRM-FL-01 | 21 |
| FR-HRM-27 | UC-HRM-27 | 25 · 22 |
| FR-HRM-01 | UC-HRM-01 | 26 |
| FR-HRM-BOOT-01 | BR-HRM-08 | 30 |

W1 (§3.1–3.8) + W2a (§3.9–3.20) + W2b (§3.21–3.32) + W2c (§3.33–3.44) **không** bị rút.

## 4. Gate §3.4.8

| Check | Result |
|-------|--------|
| Body `## 4.` `## 5.` `## 6.` | **PASS** |
| FR heading §3 = Kết quả trả về | **52 = 52 PASS** |
| Stub «Người dùng mở:» | **0** (không thêm stub) |
| AC-ATT-SHEET-01..06 còn trên FR-HRM-AT-14 | **PASS** |
| Yêu cầu-N / 120 UC không giảm | **PASS** (30 / 120) |
| Prompt-echo Sponsor / work_item / HTTP jargon trong narrative FR | **PASS** (bannedish=0 trên quét) |
| planned_W2 Yêu cầu residual | **0** |
| Cao FR W1–W2c giữ | **44 giữ + 8 ADD = 52** |

## 5. Spot-check (mẫu W2d)

| FR | Meta | Đầu vào | Luồng ≥4 | BR | sequence | Diễn biến cân bằng | Kết quả trả về |
|----|------|---------|----------|-----|----------|--------------------|----------------|
| FR-HRM-OP-01 | P | P | P | P | P | P | P |
| FR-HRM-27 | P | P | P | P | P (+ opt tạo) | P (empty ≠ «chưa triển khai»; F5 sau tạo) | P |
| FR-HRM-BOOT-01 | P | P | P | P | P | P (cấm gắn cứng ĐV) | P |

## 6. Inventory status delta

| Metric | Trước W2d | Sau W2d |
|--------|-----------|---------|
| body_ready (Yêu cầu) | 25 | **30** |
| planned_W2 (Yêu cầu) | 5 | **0** |
| planned_W2 **Cao** | 0 | **0** |
| FR khách đủ 7 mục | 44 | **52** |

### 6.1 Residual UC (không chặn Yêu cầu-N)

embed 22/24/25/26; MOB-02/03/05/07/09–15; UC-07; MD-02..05; IM-02..04; EM/CI/SC/RC/PR/PF slices — đợt catalog tùy chọn sau.

## 7. completion_report

| Đóng | Residual / mở |
|------|----------------|
| +8 FR W2d OP/FL/27/01/BOOT | UC leftover trong Yêu cầu đã body_ready (không planned_W2) |
| planned_W2 Yêu cầu = **0**; gate 52=52 | SA TechSpec `ref_srs` delta trên FR mới; QC skeleton re-gate (C-SKEL-04 optional) |
| AC-ATT-SHEET + 44 FR Cao giữ nguyên | HTML khách nếu PM yêu cầu build |
| BRD khách §6 đủ 30 primary | Không claim full 120 UC / Phase 1 / PROD |

**Không** claim full 120 UC / Phase 1 / PROD.

## 8. Handoff

- **next_owner:** `sa` (TechSpec HRM `ref_srs` delta W2d) **và/hoặc** `qc` (skeleton re-gate 52 FR / C-SKEL-04)  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-srs-bateco-w2d-leftover-01-20260722.md`

### next_dispatch_prompt (copy-ready) — SA TechSpec ref_srs delta

```text
work_item_id: SA-HRM-TECHSPEC-REF-SRS-W2D-01
from_role: pm
to_role: sa
lane: governance
priority: P2
entry_criteria: SRS_HRM_KHACH.md v3.0-W2d (52 FR); inventory planned_W2=0; evidence ba-hrm-srs-bateco-w2d-leftover-01-20260722.md; team TechSpec docs/hrm/TECHSPEC.md
exit_criteria: ADD-only ref_srs map cho FR-HRM-OP-01..04 · FL-01 · 27 · 01 · BOOT-01 (không wipe AC-ATT-SHEET / 44 FR cũ); ghi path evidence; ack PASS_TO_PM
evidence_path: docs/qa/evidence/sa-hrm-techspec-ref-srs-w2d-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe FR Cao · Phase1/PROD · claim 120 UC · apps/**
```

### next_dispatch_prompt (copy-ready) — QC skeleton re-gate (C-SKEL-04 optional)

```text
work_item_id: QC-HRM-SPEC-REMASTER-SKELETON-GATE-03
from_role: pm
to_role: qc
lane: governance
priority: P2
entry_criteria: SRS_HRM_KHACH.md v3.0-W2d Ch.1–6; 52 FR; inventory body_ready=30 planned_W2=0; evidence ba-hrm-srs-bateco-w2d-leftover-01-20260722.md; prior gate-02 nếu có
exit_criteria: Audit §3.4.8 PASS; spot-check ≥3 FR (AT-14 AC-ATT-SHEET + 1 OP + FR-27); đếm FR = Kết quả trả về = 52; xác nhận không wipe 44 Cao; GO hoặc GWC chỉ leftover UC slice (không Yêu cầu-N); C-SKEL-04 đóng nếu trong scope
evidence_path: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · Phase1/PROD · claim 120 UC
```
