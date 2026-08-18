# QC-HRM-SPEC-REMASTER-SKELETON-GATE-02 — Gate evidence

**work_item_id:** `QC-HRM-SPEC-REMASTER-SKELETON-GATE-02`  
**from_role:** qc · **to_role:** pm  
**lane:** governance (docs-only)  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`  
**verdict:** **GO WITH CONDITIONS**

## 1. Mandate

Re-gate skeleton SRS khách HRM theo `_vibe-team-os/13` **§3.4.8** sau **W2c** (đóng residual Cao từ gate-01).  
**Cấm:** Phase1/PROD claim · claim 120 UC done · wipe AC-ATT-SHEET / FR đã khóa.

## 2. Entry criteria (đã đối chiếu)

| Nguồn | Path | Kết quả |
|-------|------|---------|
| Prior GWC | `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-20260721.md` | GWC — 32 FR; **C-SKEL-01** Cao×4 mở |
| W2c BA | `docs/qa/evidence/ba-hrm-srs-bateco-w2c-catalog-01-20260721.md` | PASS — +12 FR; claim Cao residual → 0 |
| SoT SRS | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2c** | Có |
| SoT BRD | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` | Sync YC-22/23/24/28 (không còn «batch sau» lệch W2b) |
| Inventory freeze | `docs/hrm/UC_INVENTORY_BRD_SRS.md` | 30 Yêu cầu / 120 UC; §5.1 Cao = 0 |

## 3. Gate §3.4.8 — machine checks

| Check | Observed | Verdict |
|-------|----------|---------|
| Body `## 1.` … `## 6.` | Ch.1–6 có nội dung (NFR §4, Giao diện §5, Ràng buộc §6) | **PASS** |
| E2E spine trước catalog FR | §2.4.1–2.4.7 (W1 + W2a + W2b + **W2c**) | **PASS** |
| FR heading §3.x | **44** (`### 3.1` … `### 3.44`) | **PASS** |
| Metadata `| Mã UC |` trong FR body | **44** (loại 4 header cột E2E §2.4.4–2.4.7 → tổng dòng Mã UC = 48) | **PASS** |
| `**Kết quả trả về khi thành công**` | **44** | **PASS** |
| Heading FR = Kết quả trả về | **44 = 44** | **PASS** |
| Stub `Người dùng mở:` | **0** | **PASS** |
| Prompt-echo Sponsor / work_item trong body khách | 0 hit (`work_item`, `Sponsor 2026`, `PASS_TO_PM`, `ba-docs`, `wipe`, `tenant_id`, `HTTP 2xx`) | **PASS** |
| Yêu cầu-N / 120 UC không giảm | Inventory **30 / 120**; SRS §6 xác nhận catalog 120 còn hiệu lực; **44** FR khách | **PASS** |
| AC-ATT-SHEET-01..06 trên FR-HRM-AT-14 | Giữ đủ 01..06 + BR-ATT-SHEET | **PASS** |
| W2c batch 12 FR (7 mục + sequence + ≥4 bước luồng) | INT-01..04, UC-11, 20/21/23, MOB-01/04/06/08 — machine **12/12 PASS** | **PASS** |

## 4. Spot-check FR quality (≥3 — AT-14 + INT + MOB)

| FR | Meta+Mã UC | Đầu vào | Luồng ≥4 | Quy tắc | sequence | Diễn biến cân bằng | Kết quả trả về (§3.4.6) |
|----|------------|---------|----------|---------|----------|--------------------|-------------------------|
| **FR-HRM-AT-14** | P | P | P (5) | P + AC-01..06 | P | P — auth≤2; success/empty/storm ≥ depth | P — 5 ý |
| **FR-HRM-INT-04** | P | P | P (4) | P | P | P — auth≤2; success≥40%; fail sâu (phạm vi/thiếu mắt xích) ≥30% | P — 5 ý |
| **FR-HRM-MOB-06** | P | P | P (4) | P | P | P — auth≤2; validation/quỹ/list; soft note jargon «2xx» | P — 5 ý |

**Kết luận spot-check:** W1 khóa + mẫu W2c đạt chuẩn 7 mục + §3.4.6. Không stub menu.

## 5. Inventory / residual

| Metric | Giá trị |
|--------|---------|
| body_ready (Yêu cầu) | **25** |
| planned_W2 (Yêu cầu) | **5** — **19, 21, 25, 26, 30** (Trung bình / Thấp hơn) |
| planned_W2 **Cao** còn | **0** — **C-SKEL-01 CLOSED** (YC-22/23/24/28 → body_ready) |
| FR khách đủ 7 mục | **44** (không = 120 UC) |

### 5.1 Condition closure vs gate-01

| Condition (gate-01) | Status gate-02 |
|---------------------|----------------|
| **C-SKEL-01** Cao residual YC-22/23/24/28 | **CLOSED** |
| **C-SKEL-02** Không claim Phase1 / PROD / 120 UC done | **OPEN** (standing) |
| **C-SKEL-03** Sync BRD §6 + inventory §3 wording | **CLOSED** (BRD YC-22/23/24/28; inventory §2/§5/§6.4 = 44 FR) |

### 5.2 Soft process notes (không hạ skeleton PASS)

| ID | Note | Severity |
|----|------|----------|
| N1 | FR-HRM-MOB-06 Diễn biến dòng «Mất đơn sau 2xx» — jargon kỹ thuật nhẹ trong body khách | P2 polish (ba-docs optional) |
| N2 | FR-HRM-SCOPE-02 «tenant thành viên» trong Liên hệ phần mềm — ưu tiên «đơn vị thành viên» | P2 polish |
| N3 | Leftover trong Yêu cầu đã body_ready (embed 22/24/25/26/27, MOB còn lại, MD/IM/…) — slice đủ Cao status, chưa đủ 120 UC | Expected; không Cao residual |

## 6. Classification

| Layer | Scope | Product impact |
|-------|-------|----------------|
| Docs / governance | Skeleton Ch.1–6 + **44** FR remaster | **Không** mở code / deploy |
| Residual Trung bình | planned_W2 ×5 | Optional W2d nếu Sponsor cần đủ Trung bình/Thấp |
| Evidence pack product | N/A — docs-only; không `verify:qc:evidence-pack` UI | PROCESS N/A |

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** 120 UC body_ready.

## 7. Verdict

### GO WITH CONDITIONS

**GO** cho: skeleton Bateco Ch.1–6; đếm heading FR = Kết quả trả về = **44**; stub = 0; sample FR (AT-14 / INT-04 / MOB-06) đạt; inventory freeze 30/120; AC-ATT-SHEET không bị rút; **C-SKEL-01 đóng** (Cao residual = 0); entry W2c + prior GWC hợp lệ.

**CONDITIONS (mở — owner rõ):**

| Condition | Owner | Trigger đóng |
|-----------|-------|--------------|
| **C-SKEL-02** Không claim Phase1 / PROD / 120 UC done | pm | Standing đến program exit W5 đầy đủ |
| **C-SKEL-04** (optional) planned_W2 Trung bình/Thấp = 5 (YC-19/21/25/26/30) + leftover embed/MOB | ba-docs W2d **hoặc** defer Sponsor | ADD catalog khi Sponsor yêu cầu đủ Trung bình; **không** chặn skeleton GO này |
| Soft N1/N2 jargon polish | ba-docs | Optional cùng W2d / HTML xuất |

**Supersede:** gate-01 GWC trên 32 FR — điều kiện Cao **đã đóng**; phạm vi skeleton hiện tại = **44 FR**.

## 8. completion_report

| Đóng | Residual |
|------|----------|
| QC skeleton §3.4.8 trên `SRS_HRM_KHACH.md` v3.0-W2c (44=44; Cao=0) | C-SKEL-02 standing; C-SKEL-04 optional Trung bình×5; N1/N2 soft |
| C-SKEL-01 + C-SKEL-03 từ gate-01 | SA TechSpec W3 `ref_srs` trên 44 FR; HTML khách nếu Sponsor yêu cầu |

## 9. Handoff

- **next_owner:** `pm` (dispatch **sa** TechSpec W3; optional ba-docs W2d)  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md`

### next_dispatch_prompt (copy-ready) — SA TechSpec W3

```text
work_item_id: SA-HRM-TECHSPEC-ALIGN-W3-01
from_role: pm
to_role: sa
lane: governance
entry_criteria: QC GWC gate-02 — docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md; SRS_HRM_KHACH.md v3.0-W2c 44 FR; inventory Cao residual=0; TECHSPEC.md hiện có
exit_criteria: Mỗi UC spine + W2a/W2b/W2c có ref_srs → FR khách; OpenAPI/DTO khớp Kết quả trả về; không mâu thuẫn AC-ATT-SHEET; ghi leftover Trung bình (YC-19/21/25/26/30) + leftover embed/MOB; code_allowed false đến Sponsor confirm TechSpec
evidence_path: docs/qa/evidence/sa-hrm-techspec-align-w3-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: apps/** code trước confirm TechSpec · wipe SRS khách · Phase1/PROD · claim 120 UC
```

### next_dispatch_prompt (copy-ready) — optional W2d Trung bình

```text
work_item_id: BA-HRM-SRS-BATECO-W2D-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P2 (chỉ khi Sponsor cần đủ planned_W2 Trung bình/Thấp)
entry_criteria: QC GWC gate-02 — docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md; planned_W2=5 (YC-19/21/25/26/30); 44 FR giữ nguyên
exit_criteria: ADD FR cho YC-19/21/25/26/30 (± leftover embed/MOB nếu Sponsor yêu cầu); inventory planned_W2 cập nhật; không wipe W1–W2c / AC-ATT-SHEET; không claim 120 UC
evidence_path: docs/qa/evidence/ba-hrm-srs-bateco-w2d-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · apps/** · Phase1/PROD claim
```

### pm_dispatch_hint

Ưu tiên **SA-HRM-TECHSPEC-ALIGN-W3-01** trên 44 FR đã GWC skeleton. **W2d** chỉ khi Sponsor cần đủ Trung bình/Thấp — không chặn TechSpec.
