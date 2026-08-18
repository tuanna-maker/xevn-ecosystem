# Evidence — PO-HRM-BP-WBS-FROM-GAP-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-WBS-FROM-GAP-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-05 |
| **no_prompt_echo** | true |
| **uat_done** | `false` |
| **Attendance CLOSED** | **false** |
| **READY_FOR_TECHSPEC** | **KHÔNG** (matrix v1.1 vẫn **NOT_READY**) |
| **customer_signed** | **false** (D7 pause code until paper chốt) |
| **supersedes** | Overnight abort (evidence MISS) — completes gap-aligned WBS delta trên baseline SYNTH-DOCS-01 |

---

## Entry (đã có)

| Artifact | Ver / status |
|----------|----------------|
| `UC_MEETING_PRODUCT_GAP_MATRIX.md` | **v1.1** NOT_READY |
| `po-hrm-bp-uc-gap-matrix-01.md` | PASS_TO_PM |
| `ATT_SURFACE_INVENTORY_DEEP.md` | §6.1 **18 MISSING** |
| `po-hrm-bp-att-deep-qa-01.md` | PASS_TO_PM · LIVE/PARTIAL/STUB/GĐ2 |
| `po-hrm-bp-synth-docs-01.md` | UC_CHOT baseline — **không wipe FR** |
| `SRS_HRM_ENTERPRISE.md` | **v0.7** (không đổi nội dung seat này) |
| `UC_INVENTORY.md` | **0.3.3** |

---

## Deliverables

| Artifact | Path | Note |
|----------|------|------|
| Excel chốt UC **v1.1** | `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE_UC_CHOT.xlsx` | ~27 KB · rebuild |
| Generator | `…/_build_wbs_uc_chot.py` | ADD sheet `02b` + browser columns |
| MOI pointer | `…/WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` | guide trỏ UC_CHOT **v1.1** + 18 sâu |
| README | `…/WBS_UC_CHOT_README.md` | v1.1 họp flow |
| PDF | `SRS_HRM_ENTERPRISE_KHACH.pdf` | **không rebuild** — SRS v0.7 không đổi; tránh `main()`/`patch_srs` |

### Sheets UC_CHOT v1.1

| Sheet | Nội dung |
|-------|----------|
| `00_Huong_dan` | v1.1 · khóa leave types · PAY meeting complete · D7 · cấm «họp lương chưa xong» · không READY_FOR_TECHSPEC |
| `01_Danh_muc_UC` | **45** UC · **WBS-REC-00** · campaign **GĐ2** · Face qua ATT-03/GĐ2 · 5 loại phép trên ATT-04 · Q-PAY-FORMULA = cách lắp |
| `02_Man_cham_cong` | **ATT-FID#1…46** + meeting_ref + inv S## + **runtime browser** (ATT-DEEP-QA) + gap khách |
| `02b_Man_thieu_sau` | **18 MISSING** (S03,S04,S07,S15,S16,S25,S28,S29,S32,S33,S39,S43,S65,S66,S70,S71,S74,S75) + 3 ALIAS #25–27 |
| `03_Tom_tat_khoang_trong` | **G-01…G-19** (G-18 = 18 sâu · G-13 = cách lắp · không unfinished-PAY) |
| `99_Thong_ke` | LIVE 28 · PARTIAL 3 · STUB_UI 12 · GĐ2-HOLD 1 · NOT_READY TechSpec |

### Khóa nghiệp vụ đã stamp (khách)

- Campaign / Face = **GĐ2** (MEETING_ONLY_GĐ2).
- Leave types: năm · thâm niên · bù OT · chuyển kỳ · ứng · sick+BH (G-06 · ATT-04).
- PAY meeting **COMPLETE** — Q-PAY-FORMULA = authoring/engine flag only; **ban** wording «họp lương chưa xong» (scan Excel: **0 hit**).
- 18 MISSING gọi tên: GPS sites (S74–75) · QR card (S15–16) · leave balance (S43) · sheet delete (S25) · …

---

## Verify

```text
python _build_wbs_uc_chot.py
  → version 1.1 · UC 45 · ATT 46 · DEEP 21 (18+3 alias) · GAP 19 · size_kb ~27
python _build_wbs_excel.py
  → MOI ~93 KB · pointer UC_CHOT v1.1
Ban scan UC_CHOT sheets: **0** hit exact unfinished-PAY meeting phrase
PDF: skipped (SRS v0.7 unchanged; prefer build_pdf_from_srs only if needed later)
```

Browser overlay nguồn: `po-hrm-bp-att-deep-qa-01.md` + `ATT_DEEP_QA_RUNTIME_LOG.md`  
(#8 PARTIAL · #9 GĐ2-HOLD · #17–18/#37–46 STUB_UI · còn lại LIVE theo rollup).

---

## completion_report

### Đã đóng

1. Evidence seat (trước đó MISS sau abort) — file này.
2. UC_CHOT **ADD/UPGRADE v1.1** từ gap matrix §6.1 + §9–11 — **không wipe** FR / không claim READY_FOR_TECHSPEC.
3. ATT-FID#1..46 + cột runtime browser ATT-DEEP-QA.
4. Sheet **02b** stamp đủ **18 MISSING** + alias honesty #25–27.
5. WBS-REC-00 · GĐ2 campaign/face · leave types · PAY complete wording · G-18/G-19.
6. MOI pointer rows refreshed; README v1.1.
7. PDF không rebuild (SRS không đổi).

### Residual / mở

| # | Mục | Owner |
|---|-----|-------|
| R1 | `PO-HRM-BP-ATT-DEEP-GAP-BA-01` — **còn DISPATCHED / chưa có evidence** | ba-process (in-flight) |
| R2 | Nested MISSING dialogs chưa mở RO (S15–16, S25, S28, S74–75…) | ba-process / qa P2 |
| R3 | Matrix vẫn **NOT_READY** — Q-* · SRS_THIN · D7 unsigned | PM → khách / W3 synth sau BA gap |
| R4 | Proposed UC-BP-ATT-03d/03e/05b/11b/13…18 — **chưa ADD SRS** | PM mở ba-docs nếu khách IN |
| R5 | `_build_srs_pdf_khach.py` `main()` vẫn assert 44 UC + patch_srs — cấm full main | ba-docs follow-up |

### Không claim

- Khách đã ký / TechSpec unlock / Attendance CLOSED / uat_done.
- READY_FOR_TECHSPEC.
- Invent Q-* confirm.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-SYNTH-01
from_role: pm
to_role: ba-process (hoặc pm synth sau khi ATT-DEEP-GAP-BA-01 PASS)
lane: governance
priority: P0

entry_criteria:
  - docs/qa/evidence/po-hrm-bp-wbs-from-gap-01.md PASS_TO_PM
  - docs/qa/evidence/po-hrm-bp-att-deep-gap-ba-01.md PASS_TO_PM (BẮT BUỘC — seat còn mở 2026-08-05)
  - UC_MEETING_PRODUCT_GAP_MATRIX.md v1.1 (+ delta browser từ GAP-BA)
  - WBS_HRM_ENTERPRISE_UC_CHOT.xlsx v1.1
exit_criteria:
  - Tổng hợp W3: matrix verdict cập nhật (vẫn NOT_READY nếu Q-*/D7 mở — ghi rõ)
  - Không claim READY_FOR_TECHSPEC trừ khi blockers §1 matrix đóng
  - Không reopen PAY TechSpec depth; ban unfinished-PAY wording
  - Evidence docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md
cấm: apps/** · seed · invent Q-* · wipe SRS FR · Attendance CLOSED
residual_if_blocked: nếu ATT-DEEP-GAP-BA-01 chưa PASS → giữ W3 SYNTH ở backlog; không fake closed
```

## evidence_path

`docs/qa/evidence/po-hrm-bp-wbs-from-gap-01.md`

## ack_status

**PASS_TO_PM**
