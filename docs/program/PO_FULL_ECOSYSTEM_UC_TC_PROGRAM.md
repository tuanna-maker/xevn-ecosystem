# PO+PM — Quy hoạch Test Case toàn hệ theo Use Case

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-FULL-ECO-UC-TC-01` |
| **Date** | 2026-08-04 |
| **Owner** | PM + PO (Composer đạo diễn) |
| **Sponsor ask** | Folder theo từng UC · SRS cũ + SRS mới + API + TechSpec · tổng số case · đánh giá FE/BE/role · nhiều agent OK |
| **Folder SoT** | `docs/qa/professional/by-uc/` |
| **Inventory** | `docs/qa/professional/by-uc/_INVENTORY_PHASE1.md` (**245** UC Phase 1) |
| **Template** | `docs/qa/professional/by-uc/_TEMPLATE_UC_TC.md` |
| **Exemplar** | `docs/qa/professional/UC-FR-H03_LEAVE.md` (cây đầy đủ — tham chiếu độ sâu) |
| **Master report** | `docs/qa/professional/by-uc/MASTER_COVERAGE_REPORT.md` |
| **Locks** | U65 · U76 · U78 · U85 · design ≠ UAT DONE · không invent SPEC_GAP PASS |
| **Status** | **W1 DISPATCHED** (6 squads) · **W3+ fix pipeline OPEN** (Sponsor 2026-08-04) |
| **Journal** | `docs/journal/2026-08-04_PO_PM_CONVERSATION_JOURNAL.md` |
| **Training** | `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` |
| **Domain notes** | `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` |

---

## 1. Mục tiêu

1. **Một file / một UC** trong `by-uc/` — cây: Nghiệp vụ → Chức năng → Case.  
2. Trace **SRS cũ** (client-delivery / BANG_TONG_HOP / matrix) **và** **SRS_VN / TECH_SPEC_VN / API_CONTRACT_VN** (pack mới) khi có overlap.  
3. Sau Synth: **báo cáo tổng** số case thiết kế + `code_readiness` FE/BE/role (honest).  
4. **Đúng nghiệp vụ + SOLID + convention:** khi design/QA phát hiện GAP/FAIL → **tự điều phối Dev fix / rewrite hẹp** (Sponsor 2026-08-04) → QA retest → cập nhật `code_readiness`.  
5. E2E luồng tổng thể: chạy theo sóng sau khi có đủ design P0 + fix blocker — vẫn **U65** · không claim Phase1 DONE sớm.

---

## 2. Nguồn đọc (mọi squad)

| # | Nguồn |
|---|--------|
| 1 | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` — hàng UC của squad |
| 2 | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` (+ HRM/XBOS/LOG nếu cần) |
| 3 | `docs/client-delivery/02_SRS_XeVN_OS.html` (FR) — nếu thiếu file, cite matrix «SRS Có» |
| 4 | `docs/brand-new-documents-20270801/SRS_VN.md` · `TECH_SPEC_VN.md` · `API_CONTRACT_VN.md` · `DB_DESIGN_VN.md` |
| 5 | TechSpec phân hệ: `docs/hrm/TECHSPEC.md` · xbos TECHSPEC · TECHSPEC_HE |
| 6 | Method: `docs/qa/professional/00_TEST_DESIGN_METHOD.md` |
| 7 | Depth packs (neo, không copy đè): `docs/qa/testcases/**` |

---

## 3. Wave W1 — 6 squad song song

| Squad | work_item_id | STT | ~UC | Owner role |
|-------|--------------|-----|----:|------------|
| **S1** | `PO-UC-TC-W1-S1-XBOS-CORE` | 1–40 | 40 | ba-process |
| **S2** | `PO-UC-TC-W1-S2-XBOS-ORG-WF` | 41–80 | 40 | ba-process |
| **S3** | `PO-UC-TC-W1-S3-XBOS-CAT` | 81–97 + 367–373 | 24 | qa |
| **S4** | `PO-UC-TC-W1-S4-DM-LOG` | 98–119 | 22 | qa |
| **S5** | `PO-UC-TC-W1-S5-HRM-A` | 248–300 | 53 | qa |
| **S6** | `PO-UC-TC-W1-S6-HRM-B-MOB` | 301–366 | 66 | qa |

**Exit mỗi seat:**

- File `docs/qa/professional/by-uc/<UC-ID>.md` cho **mọi** UC trong phạm vi (tên file = mã UC, vd. `UC-XBOS-01.md`)  
- `docs/qa/professional/by-uc/_squad/<squad_id>_MANIFEST.md` — bảng uc_id · cases_designed · code_readiness  
- Cộng dồn cases trong manifest  
- `ack_status: READY_FOR_SYNTH`  
- **Cấm:** claim UAT · seed · bỏ UC · để trống §4 Σ = 0 không giải thích  

**Độ sâu tối thiểu mỗi UC:**

| Loại UC | Case tối thiểu gợi ý |
|---------|----------------------|
| Health / GET metrics | 3–6 (HP+AU+UX) |
| CRUD master / catalog | 8–20 |
| WF / approve / multi-hat | 12–30 |
| HRM mutate (emp/leave/pay) | 15–40 |
| Mobile ESS | 10–25 |

Tham chiếu độ sâu exemplar Leave (~39) khi UC nghiệp vụ dày.

---

## 4. Wave W2 — Synth + Master report (PM chủ trì)

| WI | Owner | Exit |
|----|-------|------|
| `PO-UC-TC-W2-SYNTH-01` | ba-process hoặc qa synth | Dedupe TC-ID · tổng case · gap SRS_new |
| `PO-UC-TC-W2-REPORT-01` | PM+PO (+ qa) | `MASTER_COVERAGE_REPORT.md` đủ số · FE/BE rollup |
| `PO-UC-TC-W2-CODE-SPOT-01` | sa / technical-manager | Spot-check P0 UC code_readiness (không full 245 trong 1 seat) |

---

## 5. Wave W3 — Gap → Fix → Retest (**OPEN** — Sponsor 2026-08-04)

```text
by-uc code_readiness GAP|LIKELY_PARTIAL + spec_ref
  → PM Task dev-be|dev-fe|dev-mobile
       entry: spec_read_ack · SOLID · must_keep · allowed_paths
       exit: READY_FOR_QA + unit/regression
  → QA U65/U76/U78 (không seed)
  → cập nhật by-uc §7 code_readiness + MASTER report
  → QC nếu P0 gate
```

| Rule | Chi tiết |
|------|----------|
| Được code lại | Có · khi BR/SOLID đổ — `change_mode` ADD/FIX/UPGRADE; REPLACE chỉ khi cần + ghi bus |
| Cấm | Seed-as-UAT · invent SPEC_GAP PASS · PM tự sửa `apps/**` |
| Bootstrap leave DL | Vẫn cần Sponsor «bootstrap môi trường dev» |

## 5b. Wave W4 — Thực thi by-uc (OPEN 2026-08-04)

Sponsor: *by-uc đủ UC → cho members test.*  
Plan chi tiết: `docs/program/PO_UC_TC_W4_EXEC_PLAN.md`  
**W4-A** đang chạy: 4 QA + 1 qa-device trên P0 `LIKELY_IMPL` (HP+FD+AU), U65.  
Không claim Phase1 DONE; Leave L2 SPEC_GAP giữ.

## 5c. Wave MFD (U87) — Menu Fidelity Depth (OPEN 2026-08-04)

Sponsor: W4/UC pack vẫn sót vì không inventory từng nút trên menu thật.  
SoT: `docs/program/PO_MENU_FIDELITY_DEPTH_PROGRAM.md` · Training §15.  
Pilot: **Attendance** — tăng seat theo cluster (C1–C7) → Synth → fix P0 hết surface.  
**Không thay** W4 — **bổ chiều** fidelity; cấm claim “test hết” từ MASTER report.

---

## 6. Báo cáo Sponsor sẽ nhận (W2)

1. Tổng UC covered / missing file  
2. Tổng **cases_designed**  
3. Phân bổ theo khối A/B/C · theo MOD  
4. `code_readiness` counts (LIKELY_IMPL / PARTIAL / GAP / UNKNOWN)  
5. Danh sách SPEC_GAP & lệch SRS mới vs cũ  
6. **Explicit:** chưa = sản phẩm đã đúng hết / UAT DONE  

---

## 7. PM accountability

- Composer = đạo diễn: roster, bus, intake, synth, report.  
- Không tự viết hết 245 file — giao squad; **nắm** inventory + DoD + tổng hợp.  
- Exemplar 3 UC professional gốc giữ nguyên; `by-uc/` là SoT đầy đủ Phase1.

---

*PO-FULL-ECO-UC-TC-01*
