# QC-HRM-SPEC-REMASTER-SKELETON-GATE-03 — Gate evidence

**work_item_id:** `QC-HRM-SPEC-REMASTER-SKELETON-GATE-03`  
**from_role:** qc · **to_role:** pm  
**lane:** governance (docs-only)  
**date:** 2026-07-22  
**ack_status:** `PASS_TO_PM`  
**verdict:** **GO WITH CONDITIONS**

## 1. Mandate

Re-gate skeleton SRS khách HRM theo `_vibe-team-os/13` **§3.4.8** sau **W2d** leftover (+8 FR) và SA TechSpec `ref_srs` §16.5.  
**Cấm:** Phase1/PROD claim · claim 120 UC done · wipe 44 Cao / AC-ATT-SHEET · seed · `apps/**`.

## 2. Entry criteria (đã đối chiếu)

| Nguồn | Path | Kết quả |
|-------|------|---------|
| Prior GWC | `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md` | GWC — 44 FR; **C-SKEL-04** optional Trung bình×5 |
| W2d BA | `docs/qa/evidence/ba-hrm-srs-bateco-w2d-leftover-01-20260722.md` | PASS — +8 FR; planned_W2 → 0; body_ready → 30 |
| SA W2d | `docs/qa/evidence/sa-hrm-techspec-ref-srs-w2d-01-20260722.md` | PASS — TechSpec **§16.5** 8 rows |
| SoT SRS | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2d** | Có |
| SoT TechSpec | `docs/hrm/TECHSPEC.md` §16.5 / §16.0 / §16.9 | Có |
| Inventory freeze | `docs/hrm/UC_INVENTORY_BRD_SRS.md` | 30 Yêu cầu / 120 UC; FR khách **52**; planned_W2 = **0** |

## 3. Gate §3.4.8 — machine checks

| Check | Observed | Verdict |
|-------|----------|---------|
| Body `## 1.` … `## 6.` | Ch.1–6 có nội dung (NFR §4, Giao diện §5, Ràng buộc §6) | **PASS** |
| E2E spine trước catalog FR | §2.4.1–2.4.8 (W1 + W2a–c + **W2d**) | **PASS** |
| FR heading §3.x | **52** (`### 3.1` … `### 3.52`) | **PASS** |
| Metadata `| Mã UC |` trong FR body | **52** | **PASS** |
| `**Kết quả trả về khi thành công**` | **52** | **PASS** |
| Heading FR = Kết quả trả về | **52 = 52** | **PASS** |
| Stub `Người dùng mở:` | **0** | **PASS** |
| Prompt-echo Sponsor / work_item trong body khách | 0 hit (`work_item`, `Sponsor 2026`, `PASS_TO_PM`, `ba-docs`, `wipe`, `tenant_id`, `HTTP 2xx`) | **PASS** |
| Yêu cầu-N / 120 UC không giảm | Inventory **30 / 120**; SRS §6 xác nhận catalog 120 còn hiệu lực; **52** FR khách | **PASS** |
| 44 Cao W1–W2c không wipe | §3.1–3.44 còn (EM-01…MOB-08); W2d chỉ ADD §3.45–3.52 | **PASS** |
| AC-ATT-SHEET-01..06 trên FR-HRM-AT-14 | Giữ đủ 01..06 + BR-ATT-SHEET | **PASS** |
| TechSpec §16.5 W2d rows | **8** hàng `#45`–`#52` (OP-01..04 · FL-01 · 27 · 01 · BOOT-01) | **PASS** |

**Machine proof (local):** `node docs/qa/evidence/_tmp-qc-skel-count.mjs` → frHeadings=52, ketqua=52, tech165Rows=8, stub=0, attUnique=01..06. File tạm đã xóa sau gate.

## 4. Spot-check FR quality (≥3 — AT-14 + OP + FR-27)

| FR | Meta+Mã UC | Đầu vào | Luồng ≥4 | Quy tắc | sequence | Diễn biến cân bằng | Kết quả trả về (§3.4.6) |
|----|------------|---------|----------|---------|----------|--------------------|-------------------------|
| **FR-HRM-AT-14** | P | P | P (5) | P + AC-01..06 | P | P — auth≤2; empty/storm/F5 depth | P — 5 ý |
| **FR-HRM-OP-01** | P | P | P (4) | P | P | P — auth≤2; validation/scope; list sau Lưu | P — 5 ý |
| **FR-HRM-27** | P | P | P (4) | P | P (+ opt tạo) | P — empty ≠ «chưa triển khai»; F5; scope | P — 5 ý |

**Kết luận spot-check:** W1 khóa AT-14 + mẫu W2d (OP-01 / 27) đạt chuẩn 7 mục + §3.4.6. Không stub menu.

## 5. Inventory / residual

| Metric | Giá trị |
|--------|---------|
| body_ready (Yêu cầu) | **30** |
| planned_W2 (Yêu cầu) | **0** |
| planned_W2 **Cao** còn | **0** |
| FR khách đủ 7 mục | **52** (≠ 120 UC) |

### 5.1 Condition closure vs gate-02

| Condition (gate-02) | Status gate-03 |
|---------------------|----------------|
| **C-SKEL-02** Không claim Phase1 / PROD / 120 UC done | **OPEN** (standing) |
| **C-SKEL-04** planned_W2 Trung bình/Thấp YC-19/21/25/26/30 | **CLOSED** (body_ready 30; planned_W2=0) |
| Soft N1/N2 jargon polish (gate-02) | **OPEN** optional — không hạ skeleton |

### 5.2 Soft / product notes (không hạ skeleton PASS)

| ID | Note | Severity |
|----|------|----------|
| N1 | UC leftover trong Yêu cầu đã body_ready (embed 22/24/25/26, MOB còn lại, MD/IM/…) | Expected; không planned_W2 |
| **G-DEC-01** | FR-27 density/fidelity product (SA §16.9) | P1 **product** — không skeleton NO-GO |
| **G-BOOT-01** | VERIFY no hardcode tenant/company | P1 VERIFY product |
| **G-OP-01/02/04** | DTO/FE bind PARTIAL | P2 product backlog |

## 6. Classification

| Layer | Scope | Product impact |
|-------|-------|----------------|
| Docs / governance | Skeleton Ch.1–6 + **52** FR remaster + TechSpec §16.5 | **Không** mở code / deploy |
| Product gaps W2d | G-DEC-01 / G-BOOT-01 / G-OP-* | Backlog Dev/QA riêng — **không** product NO-GO skeleton |
| Evidence pack product | N/A — docs-only; không `verify:qc:evidence-pack` UI | PROCESS N/A |

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** 120 UC body_ready.

## 7. Verdict

### GO WITH CONDITIONS

**GO** cho: skeleton Bateco Ch.1–6; đếm heading FR = Kết quả trả về = **52**; stub = 0; sample FR (AT-14 / OP-01 / FR-27) đạt; inventory freeze 30/120; AC-ATT-SHEET không bị rút; **44 Cao giữ**; TechSpec §16.5 = **8** hàng W2d; **C-SKEL-04 đóng**; entry BA W2d + SA W2d + prior GWC hợp lệ.

**CONDITIONS (mở — owner rõ):**

| Condition | Owner | Trigger đóng |
|-----------|-------|--------------|
| **C-SKEL-02** Không claim Phase1 / PROD / 120 UC done | pm | Standing đến program exit W5 đầy đủ |
| Soft UC leftover catalog (embed/MOB/…) | ba-docs optional | ADD khi Sponsor yêu cầu đủ 120 UC body |
| Product G-DEC-01 / G-BOOT-01 (+ G-OP-* P2) | pm → dev/qa/tm | **Không** chặn skeleton GO; wave execution riêng |

**Supersede:** gate-02 GWC trên 44 FR — C-SKEL-04 **đã đóng**; phạm vi skeleton hiện tại = **52 FR**.

## 8. Micro-checklist (dispatch)

1. [x] §3.4.8 skeleton audit PASS  
2. [x] FR count = Kết quả = 52; 44 Cao not wiped; AC-ATT-SHEET kept  
3. [x] Spot ≥3 FR (AT-14 + OP-01 + FR-27)  
4. [x] TechSpec §16.5 has 8 W2d rows  
5. [x] GO/GWC · evidence this file  

## 9. completion_report

| Đóng | Residual |
|------|----------|
| QC skeleton §3.4.8 trên `SRS_HRM_KHACH.md` v3.0-W2d (52=52; Cao 44 giữ; AC-ATT-SHEET giữ) | C-SKEL-02 standing; soft UC leftover; G-DEC-01 / G-BOOT-01 product |
| C-SKEL-04 từ gate-02 | TM convention W2d modules (optional) → Dev close P1 gaps |
| TechSpec §16.5 8-row audit | Không claim 120 / Phase1 / PROD |

## 10. Handoff

- **next_owner:** `pm` (dispatch **technical-manager** convention W2d **hoặc** execution G-DEC-01 / G-BOOT-01)  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md`

### next_dispatch_prompt (copy-ready) — TM convention W2d (ưu tiên governance)

```text
work_item_id: TM-HRM-CODE-SPEC-CONVENTION-W2D-01
from_role: pm
to_role: technical-manager
lane: governance
priority: P1
entry_criteria: QC GWC gate-03 — docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md; SRS v3.0-W2d 52 FR; TechSpec §16.5 8 rows + §16.9 gaps G-DEC-01/G-BOOT-01/G-OP-*; must_keep AC-ATT-SHEET + 44 Cao
exit_criteria: Boundary hygiene + sample spec_read_ack cho operations/fleet/decisions/health/bootstrap; confirm Dev entry criteria cho G-DEC-01 + G-BOOT-01; không claim Phase1/PROD/120 UC; code_allowed false đến Sponsor confirm
evidence_path: docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: apps/** implement · wipe SRS/TechSpec · seed · Phase1/PROD · claim 120 UC
```

### next_dispatch_prompt (copy-ready) — product G-DEC-01 (sau TM hoặc song song nếu PM chọn execution)

```text
work_item_id: FE-HRM-G-DEC-01-DENSITY-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
entry_criteria: QC gate-03 GWC docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-03-20260722.md; TechSpec §16.5 #50 FR-HRM-27 + §16.9 G-DEC-01; SRS FR-HRM-27 empty honesty + create→list→F5; U65 zero-seed
exit_criteria: AC-DEC-DENSITY; create→list→F5 U65; cấm copy «chưa triển khai»; regression không đụng AT-14/AC-ATT-SHEET; READY_FOR_QA
evidence_path: docs/qa/evidence/fe-hrm-g-dec-01-density-01-YYYYMMDD.md
ack_status: READY_FOR_QA
cấm: seed · wipe 🟢 UF khác · Phase1/PROD claim
```

### pm_dispatch_hint

Skeleton **52 FR GWC** — ưu tiên **TM-HRM-CODE-SPEC-CONVENTION-W2D-01** rồi execution **G-DEC-01** / **G-BOOT-01**. Không claim Phase1 / PROD / 120 UC.
