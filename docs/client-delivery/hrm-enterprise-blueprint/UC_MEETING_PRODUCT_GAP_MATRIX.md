# Ma trận khoảng trống — Họp × SRS Enterprise × bề mặt sản phẩm

| Mục | Nội dung |
|-----|----------|
| **work_item_id** | `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02` (DOC-DELTA trên nền **1.1.3** / FILL stamp) |
| Phiên bản | **1.1.4b** — SRS-CHOT-01 **landed** (SRS v0.8); verdict **NOT_READY** (product fidelity) — **không** READY_FOR_TECHSPEC |
| Ngày | 2026-08-05 |
| Mục đích | Chốt nội bộ trước khi mở rộng TechSpec/WBS khách: mỗi UC/luồng họp có ánh xạ SRS + bề mặt sản phẩm + mức đủ |
| SoT họp | `SYNTHESIS_MASTER_HRM_ENTERPRISE.md` (D1–D8 · R · C · A · P) |
| SoT SRS | `SRS_HRM_ENTERPRISE.md` **v0.8** · `UC_INVENTORY.md` **0.3.4** · `SPONSOR_SRS_CHOT_LOCK.md` · evidence `po-hrm-bp-srs-chot-01.md` |
| SoT product ATT | `ATT_SURFACE_INVENTORY_DEEP.md` (**S01–S90** code SoT) + `HRM-ATTENDANCE_FIDELITY_MATRIX.md` (#1–46) |
| SoT product CORE | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` (28 bề mặt) |
| Product REC/PAY | Đọc mã `Recruitment.tsx` · `Payroll.tsx` (chưa có matrix fidelity riêng) |
| Deep ATT D4 | **CLOSED (code)** — `PO-HRM-BP-ATT-DEEP-CODE-01` PASS · evidence `po-hrm-bp-att-deep-code-01.md` |
| Deep ATT browser | **CLOSED** — `PO-HRM-BP-ATT-DEEP-QA-01` U65 RO · evidence `docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md` · runtime `ATT_DEEP_QA_RUNTIME_LOG.md` · **uat_done false** · **Attendance not CLOSED** |
| WBS UC_CHOT | **v1.1** — 45 UC · ATT-FID#1–46 · sheet **02b** 18 MISSING stamped · evidence `po-hrm-bp-wbs-from-gap-01.md` |
| Concurrent SYNTH | PAY Tech/DB/API DRAFT — **không** đổi verdict gap này · **cấm** unfinished-PAY wording · Q-PAY-FORMULA **ANSWERED** (2 bước) · R-PAY-DD-01 **Form GĐ1 + kéo-thả GĐ2** — không claim PAY LIVE |
| Sponsor fill | `SPONSOR_CHOT_FILL.xlsx` **34/34** · `SPONSOR_CHOT_REMAINING.xlsx` **filled** (01=14 · 02=18 · 03=28) · JSON `_tmp-sponsor-chot-remaining-read.json` |
| Audience | Team + chốt nội bộ — **không** gửi khách nguyên văn |
| **DOC-DELTA 1.1.4b** | SRS v0.8 EXPAND landed · R-* stamps giữ · TechSpec **S3 HOLD** · Attendance/Employees **not CLOSED** · `uat_done false` · demo ≠ product GO · **không** READY_FOR_TECHSPEC (blocker = product fidelity stub, không còn SRS EXPAND) |

---

## 0. Chú giải cột & `gap_class`

| Cột | Ý nghĩa |
|-----|---------|
| `uc_id` | `UC-BP-*` inventory · hoặc `ATT-FID#n` / `EMP-FID#n` / `REC-UI-*` / `PAY-UI-*` khi chỉ có bề mặt product |
| `meeting_ref` | D# · R# · C# · A# · P# · H# từ synthesis |
| `srs_fr_or_uc` | FR đủ 7 mục · FR khung §3.A · SPEC_GAP · OUT |
| `product_surface` | Menu/tab/modal path trong HRM embed |
| `runtime` | LIVE · PARTIAL · STUB_UI · GĐ2-HOLD · UNKNOWN · N/A |
| `in_dev_or_stub` | `yes` nếu STUB_UI / `featureInDev` / PARTIAL honesty |
| `customer_decision_needed` | Câu cần khách chốt (hoặc —) |
| `wbs_row` | Task WBS (`WBS-*`) |

| `gap_class` | Định nghĩa vận hành |
|-------------|---------------------|
| **COVERED** | Họp + SRS (ưu tiên đủ 7 mục hoặc khung rõ) + product LIVE/PARTIAL chấp nhận được cho chốt giấy |
| **SRS_THIN** | Có mã UC/FR khung nhưng Diễn biến/AC chưa đủ độ sâu chốt (inventory **Lịch** / template) |
| **PRODUCT_STUB** | Có menu/UI nhưng STUB_UI / «Đang phát triển» / NO_API |
| **PRODUCT_MISSING** | Họp/SRS yêu cầu MVP mà không có bề mặt product tương ứng |
| **MEETING_ONLY_GĐ2** | Họp khóa **ngoài MVP / GĐ2** — không bắt product GĐ1 |
| **UNMAPPED_PRODUCT** | Product LIVE/STUB có nhãn nhưng chưa khóa UC họp/SRS Enterprise |
| **SPEC_GAP** | Hành vi product hoặc họp không có FR/AC đo được |

---

## 1. Verdict

### **NOT_READY** — paper Q-* + REMAINING + SRS v0.8 đã chốt; còn product fidelity stub · **không** READY_FOR_TECHSPEC / product demo GO

| # | Lý do chặn (top) | Trạng thái W3 / **1.1.4** |
|---|------------------|------------------------|
| ~~D4 deep ATT inventory missing~~ | ~~Chưa có crawl 90 bề mặt~~ | **CLOSED** — `ATT_SURFACE_INVENTORY_DEEP.md` + §6 đầy đủ S01–S90 |
| ~~1 ATT browser U65~~ | ~~Chưa verify stub honesty #1–46~~ | **CLOSED** — `po-hrm-bp-att-deep-qa-01.md` (44 probes · stub honesty #17–18/#37–46) · residual nested MISSING dialog RO → §6.3 |
| ~~2 18 MISSING IN/OUT~~ | ~~sheet 02 chưa chốt~~ | **ANSWERED** — §1.3 sheet 02 (IN MVP giấy / GĐ2 / OUT) · nested dialog RO vẫn residual P2 |
| ~~3 UC Lịch sheet 03~~ | ~~EXPAND/GĐ2/OUT chưa chốt~~ | **CLOSED (SRS)** — sheet 03 + SRS v0.8 EXPAND/ADD/OUT/GĐ2 · `po-hrm-bp-srs-chot-01.md` |
| 4 | **ATT settings S76–S85 / #37–46 + Phân ca S40–S41** = PRODUCT_STUB (S79–S82 = redirect catalog) — **browser xác nhận** | **OPEN** (honesty product — không chặn paper stamp) |
| ~~5 Q-* tối thiểu~~ | ~~FILL + R-*~~ | **ANSWERED** — §1.2 FILL + §1.3 R-* · **R-FY-01 CLOSED** · **R-SIGN-01 CLOSED** |
| 6 | **D7** — sponsor authority · demo «toàn bộ UC cũ+mới» · TechSpec **S3 HOLD** · R-PDF-01 Đủ (có thể bổ sung sau) | **PARTIAL** — demo intent ≠ product LIVE GO · **không** claim demo product |
| 7 | **REC/PAY** chưa fidelity U65 — nhiều PAY submenu `featureInDev` | **OPEN** (product honesty) |
| ~~8 SRS EXPAND wave~~ | ~~FR depth chưa land~~ | **CLOSED** — SRS v0.8 · ATT-03d/05b ADD · Face mobile stamp · PDF 85p |
| ~~9 SPONSOR_CHOT_REMAINING~~ | ~~R-* / 02 / 03~~ | **CLOSED (filled)** — JSON `_tmp-sponsor-chot-remaining-read.json` |

**Paper path:** Q-* + REMAINING + SRS v0.8 **đủ trên giấy**. **`ready_for_techspec_docs`** có thể xem xét (paper-only) — **TechSpec S3 HOLD** đến khi PM mở. **Verdict = NOT_READY** vì product fidelity / stub LIVE còn mở — **không** invent · **không** Attendance CLOSED · **không** product demo GO.

### 1.1 W3 machine-readable gap list (`PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02`)

```yaml
program_verdict: NOT_READY
ready_for_techspec: false
ready_for_techspec_docs: true   # QC GWC ACCEPT paper SRS v0.8 · 2026-08-05; product fidelity still blocks ready_for_techspec full
uat_done: false
attendance_closed: false
employees_closed: false
customer_signed_d7: partial   # sponsor = decision maker; R-PDF-01 Đủ; demo ≠ product GO
techspec_s3: HOLD
wbs_uc_chot: "1.1"
matrix_version: "1.1.4b"
srs_version: "0.8"
srs_chot_evidence: docs/qa/evidence/po-hrm-bp-srs-chot-01.md
sponsor_fill_xlsx: SPONSOR_CHOT_FILL.xlsx
sponsor_fill_rows: 34/34
sponsor_remaining_xlsx: SPONSOR_CHOT_REMAINING.xlsx
sponsor_remaining_rows: { sheet01: 14, sheet02: 18, sheet03: 28 }
blockers:
  - id: D7
    status: PARTIAL
    class: SPONSOR_AUTHORITY
    decision: "không cần đợi khách, tôi mới là người đưa ra quyết định"
    demo: "ngày mai demo rồi"
    scope: "toàn bộ UC cũ + mới không được bỏ sót bất cứ UC nào"
    demo_scope_remaining: "toàn bộ cả UC cũ + mới"   # R-DEMO-01
    techspec: HOLD   # S3 Giữ HOLD
    note: R-PDF-01 Đủ (có thể bổ sung sau) · demo intent ≠ READY_FOR_TECHSPEC / product LIVE
  - id: Q-PAY-FORMULA
    status: ANSWERED
    class: Q_STAMPED
    decision: "Đồng ý 2 bước"
  - id: Q-PAY-F-2
    status: SUPERSEDED
    class: Q_STAMPED
    decision: "GĐ1 kéo-thả"   # FILL — superseded by R-PAY-DD-01
    supersede: R-PAY-DD-01
  - id: R-PAY-DD-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Form GĐ1 + kéo-thả GĐ2"
  - id: Q-PAY-F-3
    status: ANSWERED
    class: Q_STAMPED
    decision: "Xác nhận đúng (chỉ bảng công chốt)"
  - id: Q-REC-HEADCOUNT
    status: ANSWERED
    class: Q_STAMPED
    decision: "Cho ngoài ĐB + duyệt BOD"
    note: "quy trình được cấu hình từ xbos đồng bộ sang, áp dụng cho từng tenant khác nhau"
  - id: Q-LEAVE-ACCRUAL
    status: ANSWERED
    class: Q_STAMPED
    decision: "Năm tài chính"
    note: "phải có menu cấu hình"
    residual_closed: R-FY-01
  - id: Q-LEAVE-UNIT
    status: ANSWERED
    class: Q_STAMPED
    decision: "Cả hai theo loại phép"
  - id: Q-SI-SUSPEND
    status: ANSWERED
    class: Q_STAMPED
    decision: "Trong HRM"
  - id: Q-ASSET-MODULE
    status: ANSWERED
    class: Q_STAMPED
    decision: "CRUD MVP"
  - id: Q-XBOT-PROFILE
    status: ANSWERED
    class: Q_STAMPED
    decision: "Hybrid"
    note: "xbos master danh mục+quy trình → HRM tenant; HRM bổ sung → sync về XBOS"
  - id: Q-ATT-SIGN
    status: ANSWERED
    class: Q_STAMPED
    decision: "NV + quản lý trực tiếp + HR"
    residual_closed: R-SIGN-01
  - id: Q-ATT-SUMMARY
    status: ANSWERED
    class: Q_STAMPED
    decision: "Bắt buộc API riêng"
  - id: Q-ATT-FACE
    status: ANSWERED
    class: Q_STAMPED
    decision: "Đưa vào MVP"
    scope: R-FACE-01   # Mobile only MVP
    product_runtime: GĐ2-HOLD_shell   # honesty — chưa LIVE
  - id: R-FY-01
    status: CLOSED
    class: R_STAMPED
    decision: "Khác (ghi Ghi chú)"
    note: "tất cả những nghiệp vụ cấu hình thì đều phải có CRUD để cấu hình vì mỗi tenant có 1 năm tài chính khác nhau, cấm fix"
    interpretation: CRUD_per_tenant_no_fixed_month   # not a missing month answer — cấm invent month
  - id: R-LV-ADV-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Khác"
    note: "tất cả những nghiệp vụ cấu hình thì đều phải có CRUD để cấu hình vì mỗi tenant có 1 năm tài chính khác nhau, cấm fix"
  - id: R-LV-ADV-02
    status: ANSWERED
    class: R_STAMPED
    decision: "Cấu hình được"
  - id: R-SICK-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Cấu hình thứ tự"
  - id: R-SIGN-01
    status: CLOSED
    class: R_STAMPED
    decision: "Cấu hình workflow XBOS"
  - id: R-PROP-03d
    status: ANSWERED
    class: R_STAMPED
    decision: "IN MVP giấy + code"
  - id: R-PROP-03e
    status: ANSWERED
    class: R_STAMPED
    decision: "OUT"
  - id: R-PROP-05b
    status: ANSWERED
    class: R_STAMPED
    decision: "IN MVP giấy + code"
  - id: R-FACE-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Mobile only MVP"
  - id: R-DEMO-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Khác (ghi list)"
    note: "toàn bộ cả UC cũ + mới"
    claim: NOT_product_demo_GO
  - id: R-OCR-01
    status: ANSWERED
    class: R_STAMPED
    decision: "GĐ2"
  - id: R-CAMPAIGN-01
    status: ANSWERED
    class: R_STAMPED
    decision: "OUT"
  - id: R-PDF-01
    status: ANSWERED
    class: R_STAMPED
    decision: "Đủ"
    note: "nhưng có thể sẽ bổ sung, lúc đó thì làm sau"
  - id: SPONSOR_CHOT_REMAINING
    status: CLOSED
    class: FILLED
    sheets: ["01 R-* 14/14", "02 18 MISSING 18/18", "03 UC Lịch 28/28"]
  - id: ATT-18-MISSING
    status: ANSWERED
    class: SPONSOR_IN_OUT
    inv: [S03,S04,S07,S15,S16,S25,S28,S29,S32,S33,S39,S43,S65,S66,S70,S71,S74,S75]
    wbs_02b: stamped
    fidelity_matrix_rows: still_MISSING_label
    nested_dialog_ro: residual_P2
  - id: SRS_THIN
    status: PARTIAL
    class: SRS_EXPAND_IN_FLIGHT
    sheet03_answered: true
    expand_count: 25
    gd2: [UC-BP-ATT-03]
    out: [UC-BP-CORE-04]
    owner: ba-docs SRS-CHOT-01
  - id: PRODUCT_STUB_ATT_SETTINGS
    status: OPEN
    class: PRODUCT_STUB
    surfaces: ["#17-18","#37-46","S40-S41","S79-S82"]
  - id: PRODUCT_MISSING
    status: OPEN
    class: PRODUCT_MISSING
    items: [ATT-03b_holiday, PAY-04_split_UI]   # CORE-04 OCR → OUT/GĐ2
  - id: PROPOSE_ONLY_UC
    status: PARTIAL
    class: SPONSOR_SCOPED
    in_mvp: [UC-BP-ATT-03d, UC-BP-ATT-05b]
    out: [UC-BP-ATT-03e]
  - id: FACE_MVP
    status: ANSWERED
    class: PRODUCT_STUB
    note: Mobile only MVP · product shell still GĐ2-HOLD · chưa ADD FR depth
  - id: REC_PAY_FIDELITY_U65
    status: OPEN
    class: PRODUCT_STUB
unlock_ready_for_techspec_docs:
  - SRS_CHOT_01_EXPAND_landed   # ba-docs
  - sheet03_EXPAND_applied_to_SRS_body
unlock_ready_for_techspec:
  - ready_for_techspec_docs
  - techspec_S3_HOLD_until_PM_opens   # S3 = Giữ HOLD
forbidden_claims:
  - unfinished_PAY_meeting_wording
  - invent_FY_month
  - invent_sign_order
  - READY_FOR_TECHSPEC
  - product_demo_GO
  - attendance_or_employees_closed
```

### 1.2 DOC-DELTA 1.1.3 — Stamp Q-* / D7 từ `SPONSOR_CHOT_FILL.xlsx` (giữ — nền)

> Nguồn FILL: `_tmp-sponsor-chot-fill-read.json`. Cập nhật residual bởi §1.3 REMAINING.

| code | Quyết định (sponsor) | Ghi chú / residual | Matrix stamp |
|------|----------------------|--------------------|--------------|
| **D7-1** | không cần đợi khách, tôi mới là người đưa ra quyết định | — | D7 PARTIAL — sponsor = decision maker |
| **D7-2** | ngày mai demo rồi | — | Demo intent — **không** = TechSpec GO / product LIVE |
| **D7-3** | toàn bộ UC cũ + mới không được bỏ sót bất cứ UC nào | — | Scope all UC · R-DEMO-01 cùng ý |
| **S3** | Giữ HOLD | — | TechSpec/API/DB depth **HOLD** |
| **Q-PAY-FORMULA** | Đồng ý 2 bước | — | ANSWERED · nháp → hiệu lực |
| **Q-PAY-F-2** | GĐ1 kéo-thả | **SUPERSEDE** R-PAY-DD-01 | ~~kéo-thả GĐ1~~ → **Form GĐ1 + kéo-thả GĐ2** |
| **Q-PAY-F-3** | Xác nhận đúng (chỉ bảng công chốt) | — | ANSWERED · SoT bảng công chốt → kỳ lương |
| **Q-REC-HEADCOUNT** | Cho ngoài ĐB + duyệt BOD | quy trình cấu hình từ XBOS đồng bộ sang, áp dụng từng tenant | ANSWERED |
| **Q-LEAVE-ACCRUAL** | Năm tài chính | menu cấu hình · **R-FY-01 CLOSED** (CRUD/tenant · cấm fix) | **ANSWERED** |
| **Q-LEAVE-UNIT** | Cả hai theo loại phép | — | ANSWERED |
| **Q-SI-SUSPEND** | Trong HRM | — | ANSWERED |
| **Q-ASSET-MODULE** | CRUD MVP | — | ANSWERED |
| **Q-XBOT-PROFILE** | Hybrid | XBOS master danh mục+quy trình; HRM bổ sung → sync XBOS | ANSWERED |
| **Q-ATT-SIGN** | NV + QL trực tiếp + HR | **R-SIGN-01 CLOSED** = Cấu hình workflow XBOS | **ANSWERED** |
| **Q-ATT-SUMMARY** | Bắt buộc API riêng | — | ANSWERED |
| **Q-ATT-FACE** | Đưa vào MVP | **R-FACE-01** Mobile only MVP | ANSWERED · shell GĐ2-HOLD |
| **SIGN-4** | Chưa đủ (FILL) | R-PDF-01 **Đủ** (+ có thể bổ sung sau) | Paper REMAINING **CLOSED** · SRS EXPAND vẫn chặn TechSpec |

### 1.3 DOC-DELTA 1.1.4 — Stamp R-* từ `SPONSOR_CHOT_REMAINING.xlsx` sheet 01 (verbatim)

> Nguồn: `docs/qa/evidence/_tmp-sponsor-chot-remaining-read.json` · `_tmp-remaining-summary.txt` · **cấm invent**.

| code | Quyết định | Ghi chú | Matrix stamp |
|------|------------|---------|--------------|
| **R-FY-01** | Khác (ghi Ghi chú) | tất cả những nghiệp vụ cấu hình thì đều phải có CRUD để cấu hình vì mỗi tenant có 1 năm tài chính khác nhau, cấm fix | **CLOSED** — không phải «thiếu tháng»; SoT = **CRUD per tenant · cấm fix month** |
| **R-LV-ADV-01** | Khác | (cùng note CRUD/tenant · cấm fix) | ANSWERED · cấu hình CRUD |
| **R-LV-ADV-02** | Cấu hình được | — | ANSWERED |
| **R-SICK-01** | Cấu hình thứ tự | — | ANSWERED |
| **R-SIGN-01** | Cấu hình workflow XBOS | — | **CLOSED** — thứ tự ký = XBOS-configurable WF (không invent order cố định) |
| **R-PROP-03d** | IN MVP giấy + code | — | **IN** · UC-BP-ATT-03d + S74/S75 |
| **R-PROP-03e** | OUT | — | **OUT** · UC-BP-ATT-03e · S15/S16 → GĐ2 (sheet 02) |
| **R-PROP-05b** | IN MVP giấy + code | — | **IN** · UC-BP-ATT-05b + S43 |
| **R-FACE-01** | Mobile only MVP | — | Face MVP **mobile only** · shell web GĐ2-HOLD honesty |
| **R-DEMO-01** | Khác (ghi list) | toàn bộ cả UC cũ + mới | Demo script scope — **cấm** claim product LIVE GO |
| **R-PAY-DD-01** | Form GĐ1 + kéo-thả GĐ2 | — | SUPERSEDE Q-PAY-F-2 |
| **R-OCR-01** | GĐ2 | — | CORE-04 OCR **GĐ2** · sheet 03 **OUT** cùng hướng |
| **R-CAMPAIGN-01** | OUT | — | REC-03 chiến dịch **OUT** MVP |
| **R-PDF-01** | Đủ | nhưng có thể sẽ bổ sung, lúc đó thì làm sau | Paper PDF OK · bổ sung sau không chặn stamp |

### 1.4 DOC-DELTA 1.1.4 — Sheet 02 · 18 MISSING (verbatim)

| inv | Quyết định sponsor | Matrix stamp |
|-----|-------------------|--------------|
| **S03** | IN MVP giấy | IN · bridge ATT-03 |
| **S04** | IN MVP giấy | IN · layout customize (paper) |
| **S07** | IN MVP giấy | IN · pie loại nghỉ |
| **S15** | GĐ2 | GĐ2 · align R-PROP-03e OUT |
| **S16** | GĐ2 | GĐ2 · nested S15 |
| **S25** | IN MVP giấy | IN · xóa bảng chấm |
| **S28** | IN MVP giấy | IN · xóa bản ghi |
| **S29** | IN MVP giấy | IN · xuất từ sổ |
| **S32** | IN MVP giấy | IN · chi tiết ô tuần |
| **S33** | IN MVP giấy | IN · icon tuần |
| **S39** | IN MVP giấy | IN · sao chép ca |
| **S43** | IN MVP giấy | IN · align R-PROP-05b |
| **S65** | IN MVP giấy | IN · import NV |
| **S66** | IN MVP giấy | IN · icon lọc/tải |
| **S70** | IN MVP giấy | IN · reset/preview rules |
| **S71** | OUT | **OUT** · gợi ý phương thức |
| **S74** | IN MVP giấy | IN · align R-PROP-03d |
| **S75** | IN MVP giấy | IN · nested 03d |

### 1.5 DOC-DELTA 1.1.4 — Sheet 03 · UC Lịch EXPAND/GĐ2/OUT (verbatim)

| uc_id | Quyết định | Matrix stamp |
|-------|------------|--------------|
| UC-BP-ATT-01 | EXPAND | ba-docs SRS EXPAND |
| UC-BP-ATT-03 | GĐ2 | spine đa nguồn → **GĐ2** (kênh MVP riêng: Face mobile · GPS 03d) |
| UC-BP-ATT-03b | EXPAND | |
| UC-BP-ATT-04 | EXPAND | |
| UC-BP-ATT-04b | EXPAND | |
| UC-BP-ATT-05 | EXPAND | |
| UC-BP-ATT-06 | EXPAND | |
| UC-BP-ATT-07 | EXPAND | |
| UC-BP-ATT-12 | EXPAND | |
| UC-BP-REC-00 | EXPAND | |
| UC-BP-REC-04 | EXPAND | |
| UC-BP-REC-05 | EXPAND | |
| UC-BP-REC-06 | EXPAND | |
| UC-BP-REC-07 | EXPAND | |
| UC-BP-CORE-02b | EXPAND | |
| UC-BP-CORE-03 | EXPAND | |
| UC-BP-CORE-04 | OUT | align R-OCR-01 GĐ2/OUT |
| UC-BP-CORE-05 | EXPAND | |
| UC-BP-CORE-06 | EXPAND | |
| UC-BP-CORE-07 | EXPAND | |
| UC-BP-CORE-09 | EXPAND | |
| UC-BP-CORE-10 | EXPAND | |
| UC-BP-PAY-03 | EXPAND | |
| UC-BP-PAY-05 | EXPAND | |
| UC-BP-PAY-06 | EXPAND | |
| UC-BP-PAY-07 | EXPAND | |
| UC-BP-PAY-08 | EXPAND | |
| UC-BP-PAY-09 | EXPAND | |

**Tổng sheet 03:** 25× EXPAND · 1× GĐ2 (ATT-03) · 1× OUT (CORE-04) · 0× WAIVER. Owner viết FR: **ba-docs SRS-CHOT-01**.

---

## 2. Quyết định họp D1–D8

| uc_id | meeting_ref | srs_fr_or_uc | product_surface | runtime | in_dev_or_stub | gap_class | customer_decision_needed | wbs_row |
|-------|-------------|--------------|-----------------|---------|----------------|-----------|--------------------------|---------|
| DEC-D1 | D1 | FR-UC-BP-REC-03 · **R-CAMPAIGN-01 OUT** | Tuyển → Chiến dịch (`campaigns`) | LIVE shell (menu còn) | yes (OUT MVP) | MEETING_ONLY_GĐ2 | **ANSWERED** R-CAMPAIGN-01: **OUT** | WBS-REC-02c |
| DEC-D2 | D2 | REC-00/01/02/05/08 + spine | Tuyển: JD · YCTD · UV · Báo cáo | mixed | no | COVERED | — | WBS-REC-00..06 |
| DEC-D3 | D3 | FR-UC-BP-REC-02 / 02b | Yêu cầu tuyển (`requisitions`) | LIVE (API path) | no | COVERED | **ANSWERED** Q-REC-HEADCOUNT: ngoài ĐB + BOD · XBOS sync tenant | WBS-REC-02 / 02b |
| DEC-D4 | D4 | FR-UC-BP-REC-01 | Tuyển → Kế hoạch (`plans`) | LIVE/PARTIAL | no | SRS_THIN | UI chỉ «Cần tuyển» — bỏ cột trùng | WBS-REC-01 |
| DEC-D5 | D5 | FR-UC-BP-CORE-01 / 02 | Nhân sự hồ sơ + tab Lương/BH gated | LIVE | no | COVERED | — | WBS-CORE-01 |
| DEC-D6 | D6 | SRS §1.2 OUT | Nhân sự → Việc làm (EMP #18) · Tasks riêng | PARTIAL (job mock) | yes | MEETING_ONLY_GĐ2 | Module việc = ngoài HRM admin | OUT |
| DEC-D7 | D7 | SRS §1.2 · TechSpec **S3 HOLD** | — | N/A | — | COVERED (policy) | **PARTIAL** sponsor=decision maker · R-DEMO-01 all UC · R-PDF-01 Đủ · S3 HOLD · **≠ product GO** | — |
| DEC-D8 | D8 | FR-UC-BP-ATT-10/11 · PAY-01 | Chấm công → Bảng/Tổng hợp · Payroll data-attendance | LIVE ATT · PAY stub data | yes (PAY bind) | PRODUCT_STUB | **ANSWERED** Q-PAY-F-3: chỉ bảng công chốt · Q-ATT-SUMMARY: API riêng | WBS-ATT-06 · WBS-PAY-* |

---

## 3. Module REC — Họp R* × UC × product

| uc_id | meeting_ref | srs_fr_or_uc | product_surface | runtime | in_dev_or_stub | gap_class | customer_decision_needed | wbs_row |
|-------|-------------|--------------|-----------------|---------|----------------|-----------|--------------------------|---------|
| UC-BP-REC-00 | D2 · R6 | FR-UC-BP-REC-00 (§3.A khung) | Tuyển → Thư viện JD | LIVE (templates API) | no | SRS_THIN | **EXPAND** sheet 03 · ba-docs SRS-CHOT-01 | **WBS-REC-00** |
| UC-BP-REC-01 | D4 · R5 | FR-UC-BP-REC-01 **đủ 7** | Tuyển → Kế hoạch / Đề xuất HC | LIVE | no | COVERED | **ANSWERED** Q-REC-HEADCOUNT | WBS-REC-01 |
| UC-BP-REC-01b | R5 · D2 | FR-UC-BP-REC-01b **đủ 7** | Auto từ ĐB (BE/FE path) | PARTIAL | yes | PRODUCT_STUB | Chốt lịch auto sinh | WBS-REC-01b |
| UC-BP-REC-02 | D3 · R2 | FR-UC-BP-REC-02 **đủ 7** | Tuyển → Yêu cầu tuyển | LIVE | no | COVERED | **ANSWERED** Q-REC-HEADCOUNT: ngoài ĐB+BOD · XBOS sync | WBS-REC-02 |
| UC-BP-REC-02b | D3 · R2 | FR-UC-BP-REC-02b **đủ 7** | YCTD ngoài ĐB (cùng màn) | LIVE/PARTIAL | no | COVERED | **ANSWERED** Q-REC-HEADCOUNT | WBS-REC-02b |
| UC-BP-REC-03 | D1 · R1 | FR-UC-BP-REC-03 · **OUT** | Tuyển → Chiến dịch · Jobs đăng tin | LIVE menu | yes (OUT) | MEETING_ONLY_GĐ2 | **ANSWERED** R-CAMPAIGN-01: **OUT** | WBS-REC-02c |
| UC-BP-REC-04 | R3 · R6 | FR-UC-BP-REC-04 §3.A | Tuyển → Ứng viên (kho) | LIVE | no | SRS_THIN | **EXPAND** sheet 03 | WBS-REC-03 |
| UC-BP-REC-05 | D2 · R3 | FR-UC-BP-REC-05 §3.A | Ứng viên pipeline gắn YCTD | LIVE/PARTIAL | no | SRS_THIN | **EXPAND** sheet 03 · N–N UV↔YCTD | WBS-REC-03 |
| UC-BP-REC-06 | R6 | FR-UC-BP-REC-06 §3.A | Phỏng vấn · Đánh giá · mail | LIVE/PARTIAL (+ mock slices) | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-REC-04 |
| UC-BP-REC-07 | R3 | FR-UC-BP-REC-07 §3.A | Offer → hồ sơ NV | PARTIAL | yes | PRODUCT_STUB | **EXPAND** sheet 03 | WBS-REC-05 |
| UC-BP-REC-08 | R4 | FR-UC-BP-REC-08 **đủ 7** | Tuyển → Dashboard · Báo cáo | LIVE | no | COVERED | KH vs thực tế đủ chiều? | WBS-REC-06 |
| REC-UI-jobs | R1 · D1 | OUT MVP / GĐ2 | Tuyển → Tin tuyển (`jobs`) | LIVE shell | yes | MEETING_ONLY_GĐ2 | Ẩn tin đa kênh MVP | — |
| REC-UI-proposals | R5 | FR-UC-BP-REC-01 (slice) | Tuyển → Đề xuất HC (`proposals`) | LIVE | no | UNMAPPED_PRODUCT | Gộp vào plans hay tách | WBS-REC-01 |

---

## 4. Module CORE — Họp C* × UC × Employees

| uc_id | meeting_ref | srs_fr_or_uc | product_surface | runtime | in_dev_or_stub | gap_class | customer_decision_needed | wbs_row |
|-------|-------------|--------------|-----------------|---------|----------------|-----------|--------------------------|---------|
| UC-BP-CORE-01 | C1 | FR-UC-BP-CORE-01 **đủ 7** | Nhân sự list+hồ sơ Thông tin chung · Gia đình | LIVE | no | COVERED | — | WBS-CORE-01 |
| UC-BP-CORE-02 | C2 · D5 · P2 | FR-UC-BP-CORE-02 **đủ 7** | Hồ sơ → Lương (gate) · BH/tài chính | LIVE | no | COVERED | — | WBS-CORE-01 |
| UC-BP-CORE-02b | C1 | FR-UC-BP-CORE-02b §3.A | Metadata hồ sơ / Settings catalogs | LIVE/PARTIAL | no | SRS_THIN | **EXPAND** · Q-XBOT Hybrid | WBS-CORE-01 |
| UC-BP-CORE-03 | C9 | FR-UC-BP-CORE-03 §3.A | Onboarding / checklist (Onboarding.tsx) | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-CORE-03 |
| UC-BP-CORE-04 | C9 | FR-UC-BP-CORE-04 · **OUT** | OCR giấy tờ | UNKNOWN | yes | MEETING_ONLY_GĐ2 | **ANSWERED** R-OCR-01 GĐ2 · sheet 03 **OUT** | WBS-CORE-03 |
| UC-BP-CORE-05 | C6 | FR-UC-BP-CORE-05 §3.A | Hồ sơ → Tài sản | LIVE | no | SRS_THIN | **EXPAND** · Q-ASSET CRUD MVP | WBS-CORE-04 |
| UC-BP-CORE-06 | C6 · C8 | FR-UC-BP-CORE-06 §3.A | Thu hồi tài sản khi nghỉ | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-CORE-04 |
| UC-BP-CORE-07 | C9 | FR-UC-BP-CORE-07 §3.A | Hồ sơ → Hoạt động | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-CORE-05 |
| UC-BP-CORE-08 | C5 · P3 | FR-UC-BP-CORE-08 **đủ 7** | Hồ sơ → Khen thưởng/Kỷ luật | LIVE | no | COVERED | Map kỳ lương đích | WBS-CORE-06 |
| UC-BP-CORE-09 | C2 | FR-UC-BP-CORE-09 §3.A | Hợp đồng (`Contracts` · tab HĐ) | LIVE | no | SRS_THIN | **EXPAND** sheet 03 | WBS-CORE-02 |
| UC-BP-CORE-10 | C4 · A4 | FR-UC-BP-CORE-10 §3.A | Insurance page · tab BH | LIVE | no | SRS_THIN | **EXPAND** · Q-SI Trong HRM | WBS-CORE-07 |
| MEET-C7 | C7 | SPEC_GAP Enterprise · EMP work-hist | Hồ sơ → Lịch sử công việc · Decisions | LIVE | no | SPEC_GAP | UC riêng quyết định bổ nhiệm? | — |
| MEET-C8 | C8 | FR-UC-BP-PAY-07 §3.A | Nghỉ việc / tất toán | PARTIAL | yes | SRS_THIN | Fork tự nguyện vs buộc thôi việc | WBS-PAY-04 |
| MEET-C3 | C3 · D6 | OUT | EMP #18 Việc làm | PARTIAL | yes | MEETING_ONLY_GĐ2 | — | OUT |
| EMP-FID#1..8 | C1 | UC-HRM-21 / CORE-01 | List/search/filter/create/import | LIVE | no | COVERED | — | WBS-CORE-01 |
| EMP-FID#9 | — | SPEC_GAP export | Nhân sự → Xuất | PARTIAL | yes | SPEC_GAP | Client vs Nest export | — |
| EMP-FID#18 | D6 | OUT / SPEC_GAP | Hồ sơ → Việc làm | PARTIAL | yes | UNMAPPED_PRODUCT | Honesty GĐ2 | OUT |

---

## 5. Module ATT — Họp A* × UC-BP-ATT (spine)

| uc_id | meeting_ref | srs_fr_or_uc | product_surface | runtime | in_dev_or_stub | gap_class | customer_decision_needed | wbs_row |
|-------|-------------|--------------|-----------------|---------|----------------|-----------|--------------------------|---------|
| UC-BP-ATT-01 | A1 · A5 | FR-UC-BP-ATT-01 §3.A | Ca → Danh sách · Settings rules | LIVE list · schedule STUB | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-ATT-01 |
| UC-BP-ATT-02 | A1 · A5 | FR-UC-BP-ATT-02 **đủ 7** | Rules Chung/Công chuẩn · Đơn muộn | LIVE rules · late CFG STUB | yes | PRODUCT_STUB | Mode phạt phút/block/bậc | WBS-ATT-01 |
| UC-BP-ATT-03 | A6 | FR-UC-BP-ATT-03 · **GĐ2** | Clock-In manual/GPS/QR · records | LIVE · QR PARTIAL · Face **Mobile MVP** (shell) | yes | MEETING_ONLY_GĐ2 | sheet 03 **GĐ2** · kênh MVP: Face mobile · GPS **03d IN** · QR thẻ **03e OUT** | WBS-ATT-02 |
| UC-BP-ATT-03b | A5 | FR-UC-BP-ATT-03b §3.A | *(chưa thấy màn lịch lễ riêng)* | N/A / ẩn | yes | PRODUCT_MISSING | **EXPAND** sheet 03 · Q-ATT-HOLIDAY FILL | WBS-ATT-03 |
| UC-BP-ATT-04 | A3 | FR-UC-BP-ATT-04 §3.A + BR-LV-TYPE-01 | Settings → Quy tắc nghỉ (STUB) · leave types catalog | STUB_UI | yes | PRODUCT_STUB | **EXPAND** · Q-LEAVE FY · **R-FY-01 CLOSED** CRUD/tenant | WBS-ATT-04 |
| UC-BP-ATT-04b | A3 | FR-UC-BP-ATT-04b §3.A | Leave rules / leave request | STUB CFG · LIVE TXN | yes | SRS_THIN | **EXPAND** · R-LV-ADV CRUD/config | WBS-ATT-04 |
| UC-BP-ATT-05 | A3 | FR-UC-BP-ATT-05 §3.A | Leave balance / chuyển kỳ | PARTIAL | yes | SRS_THIN | **EXPAND** · + **05b IN** (S43) | WBS-ATT-04 |
| UC-BP-ATT-06 | A3 | FR-UC-BP-ATT-06 §3.A | Tổng hợp nghỉ bù (#26) | LIVE wire=LeaveTab | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-ATT-04 |
| UC-BP-ATT-07 | A4 | FR-UC-BP-ATT-07 §3.A | Đơn nghỉ loại ốm | LIVE leave | no | SRS_THIN | **EXPAND** · R-SICK-01 cấu hình thứ tự | WBS-ATT-04 |
| UC-BP-ATT-08 | A3 · A5 | FR-UC-BP-ATT-08 **đủ 7** | Leave request calc | LIVE (WF) | no | COVERED | **ANSWERED** Q-LEAVE-UNIT: cả hai theo loại | WBS-ATT-05 |
| UC-BP-ATT-09 | A5 | FR-UC-BP-ATT-09 **đủ 7** | Đơn từ → Nghỉ phép | LIVE | no | COVERED | Hold khi submit | WBS-ATT-05 |
| UC-BP-ATT-10 | A2 · D8 · P1 | FR-UC-BP-ATT-10 **đủ 7** | Bảng chấm · Tổng hợp · Báo cáo | LIVE (summary=records OBS) | yes | SPEC_GAP | **ANSWERED** Q-ATT-SUMMARY: bắt buộc API riêng (MVP target) | WBS-ATT-06 |
| UC-BP-ATT-11 | A2 · D8 · P1 | FR-UC-BP-ATT-11 **đủ 7** | Sheets + ký chốt | LIVE sheets | no | COVERED | **ANSWERED** Q-ATT-SIGN: NV+QL+HR · **R-SIGN-01** XBOS WF | WBS-ATT-06 |
| UC-BP-ATT-12 | A5 | FR-UC-BP-ATT-12 §3.A | Mở quỹ khi Hoạt động | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-CORE-05 |

### 5.1 DOC-DELTA 1.1.1 — Họp A1–A6 × browser deep (stamp gap)

> Nguồn: `po-hrm-bp-att-deep-qa-01.md` · `ATT_DEEP_QA_RUNTIME_LOG.md`. Chỉ delta họp A* — **không** đè §5 spine · **không** claim Attendance CLOSED.

| meeting_ref | Want (SYNTHESIS) | matrix # (browser) | inv_id (critical) | runtime (QA) | gap_class | proposed_uc / note |
|-------------|------------------|--------------------|-------------------|--------------|-----------|---------------------|
| **A1** | Ca + quy định muộn/sớm | #16 LIVE · **#17–18 STUB_UI** · **#42 STUB_UI** (cfgRedirect) · #20 LIVE TXN | S35–S41 · **S81** · S48 | list LIVE; roster/OT/late-CFG stub | **PRODUCT_STUB** | Giữ ATT-01/02 · UC-BP-ATT-13 (#20) nếu MVP đơn muộn |
| **A2** | Bảng công tổng hợp → lương | #11–14 LIVE · **#15 LIVE wire=records** · **#30 PARTIAL** export · PAY bind ngoài seat | S23–S34 · S62–S63 · S68 | summary OBS · export client | **SPEC_GAP** (runtime) · MVP target **API riêng** (Q-ATT-SUMMARY) | ATT-10 · không claim API riêng đã LIVE |
| **A3** | 5 loại phép (năm/thâm niên/bù/chuyển/ứng) | #19/#28 LIVE TXN · **#41 STUB_UI** leave-rules · #25–26 ALIAS | **S80** · **S43 IN** · S58–S59 | CFG stub · **05b IN** giấy | **PRODUCT_STUB** (CFG) + **SRS_THIN** | Accrual FY · **R-FY-01 CLOSED** CRUD/tenant · **UC-BP-ATT-05b IN** |
| **A4** | Nghỉ ốm + BH | #19/#28 LIVE leave · không panel BH sâu trong ATT | S42 · (CORE Insurance) | TXN LIVE; BH cross-module | **SRS_THIN** | ATT-07 EXPAND · R-SICK cấu hình thứ tự · Q-SI Trong HRM |
| **A5** | Rule ca/lịch BP · accrual · holiday | **#17 STUB_UI** · accrual **không UI** · holiday **không màn** | S40 · ATT-03b | roster stub · calendar absent | **PRODUCT_STUB** + **PRODUCT_MISSING** | ATT-03b **EXPAND** · FY CRUD menu |
| **A6** | Mobile punch channels | #7/#10 LIVE · **#8 PARTIAL** QR · **#9 Face Mobile MVP** shell | S11–S20 · **S15–S16 GĐ2** · **S74–S75 IN** | Face **Mobile only MVP** · shell chưa LIVE | **SPEC_GAP** (QR clock) · **03d IN** · **03e OUT** | **UC-BP-ATT-03d IN** · **03e OUT** · Face FR mobile |

---

## 6. Attendance — deep S01–S90 + fidelity #1–46 (bắt buộc sponsor)

> **Residual «ATT deep D4 missing» = CLOSED (code).** SoT: `ATT_SURFACE_INVENTORY_DEEP.md` (90) · baseline `HRM-ATTENDANCE_FIDELITY_MATRIX.md` (#1–46).  
> **Browser U65 deep = CLOSED** — `PO-HRM-BP-ATT-DEEP-QA-01` · evidence `docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md` (44 probes · 0 BROKEN · stub honesty confirmed). **Không** đóng READY_FOR_TECHSPEC / Attendance CLOSED / `uat_done`.  
> Cột `matrix`: `#N` = đã có fidelity · `MISSING` · `NESTED` · `EXTRA`/`DEAD`. Nested = cùng UC parent, không nhân WBS trừ khi khách yêu cầu tách popup.

### 6.0 Crosswalk đầy đủ S01–S90 → gap_class

| inv | matrix | product_surface (rút) | runtime | gap_class | meeting | uc / note | wbs |
|-----|--------|----------------------|---------|-----------|---------|-----------|-----|
| S01 | #1 | Tổng quan | LIVE | UNMAPPED_PRODUCT | A2 | ATT-FID#1 | — |
| S02 | MISSING | Overview KPI cards | LIVE | UNMAPPED_PRODUCT | A2 | Expand #1 | — |
| S03 | MISSING | Overview CTA Chấm công ngay | LIVE | UNMAPPED_PRODUCT | A6 | **IN MVP giấy** · ATT-03 bridge | WBS-ATT-02 |
| S04 | MISSING | Overview Tùy chỉnh layout | STUB HOLD | PRODUCT_STUB | — | **IN MVP giấy** | — |
| S05 | #2 | Biểu đồ nghỉ tháng | LIVE | SPEC_GAP | — | ACCEPTED_AS_IS | — |
| S06 | #3 | Nghỉ theo PB | LIVE | SPEC_GAP | — | ACCEPTED_AS_IS | — |
| S07 | MISSING | Pie phân tích loại nghỉ | LIVE | SPEC_GAP | A3 | **IN MVP giấy** | WBS-ATT-04 |
| S08 | #4 | List muộn/sớm | LIVE | UNMAPPED_PRODUCT | A1 | — | WBS-ATT-01 |
| S09 | #5 | Đơn nghỉ gần đây | LIVE | COVERED | A3 | ATT-09 slice | WBS-ATT-05 |
| S10 | #6 | Clock-In hub | LIVE | COVERED | A6 | ATT-03 | WBS-ATT-02 |
| S11 | #7 | Clock-In Thủ công | LIVE | COVERED | A6 | ATT-03 | WBS-ATT-02 |
| S12 | NESTED #7 | Confirm thủ công | LIVE | COVERED | A6 | nested | WBS-ATT-02 |
| S13 | #8 | Clock-In QR | PARTIAL | SPEC_GAP | A6 | ACCEPTED QR | WBS-ATT-02 |
| S14 | NESTED #8 | QR confirm | PARTIAL | SPEC_GAP | A6 | nested | WBS-ATT-02 |
| S15 | MISSING | Thẻ QR NV | LIVE shell | MEETING_ONLY_GĐ2 | A6 | **GĐ2** · R-PROP-03e **OUT** | WBS-ATT-02 |
| S16 | MISSING | Dialog thẻ QR | LIVE shell | MEETING_ONLY_GĐ2 | A6 | **GĐ2** nested S15 | WBS-ATT-02 |
| S17 | #9 | Clock-In Face | GĐ2-HOLD shell · **Mobile MVP** | PRODUCT_STUB | A6 | R-FACE-01 Mobile only · chưa LIVE | WBS-ATT-02 |
| S18 | NESTED #9 | Face confirm | GĐ2-HOLD shell · **Mobile MVP** | PRODUCT_STUB | A6 | nested | WBS-ATT-02 |
| S19 | NESTED #9 | Face xóa đăng ký | GĐ2-HOLD shell · **Mobile MVP** | PRODUCT_STUB | A6 | nested | WBS-ATT-02 |
| S20 | #10 | Clock-In GPS | LIVE | COVERED | A6 | ATT-03 | WBS-ATT-02 |
| S21 | NESTED #10 | GPS confirm | LIVE | COVERED | A6 | nested | WBS-ATT-02 |
| S22 | NESTED #6/#13 | Bản ghi hôm nay (wizard) | LIVE | COVERED | A6 | nested | WBS-ATT-02 |
| S23 | #11 | Bảng chấm công list | LIVE | COVERED | A2·D8 | ATT-11 | WBS-ATT-06 |
| S24 | #12 | Thêm bảng chấm | LIVE | COVERED | A2 | ATT-11 | WBS-ATT-06 |
| S25 | MISSING | Xóa bảng chấm | LIVE | UNMAPPED_PRODUCT | A2·D8 | **IN MVP giấy** · ATT-11b | WBS-ATT-06 |
| S26 | #13 | Bản ghi chấm công | LIVE | COVERED | A2·A6 | ATT-03 | WBS-ATT-02 |
| S27 | NESTED #13 | Sửa trạng thái | LIVE | COVERED | A6 | nested | WBS-ATT-02 |
| S28 | MISSING | Xóa bản ghi | LIVE | UNMAPPED_PRODUCT | A6 | **IN MVP giấy** | WBS-ATT-02 |
| S29 | MISSING | Bản ghi → Xuất | PARTIAL | SPEC_GAP | — | **IN MVP giấy** · ≠ #30 path | — |
| S30 | NESTED #13 | Lọc ngày | LIVE | COVERED | A6 | nested | WBS-ATT-02 |
| S31 | #14 | Chấm công tuần | LIVE | UNMAPPED_PRODUCT | A1·A5 | **UC-BP-ATT-18** | WBS-ATT-01 |
| S32 | MISSING | Tuần → chi tiết ô | LIVE | UNMAPPED_PRODUCT | A1·A5 | **IN MVP giấy** | WBS-ATT-01 |
| S33 | MISSING | Tuần icons no-op | STUB | PRODUCT_STUB | — | **IN MVP giấy** | — |
| S34 | #15 | Tổng hợp (=records) | LIVE wire | SPEC_GAP | A2·D8 | honesty | WBS-ATT-06 |
| S35 | #16 | Danh sách ca | LIVE | SRS_THIN | A1 | ATT-01 | WBS-ATT-01 |
| S36 | NESTED #16 | Thêm/Sửa ca | LIVE | SRS_THIN | A1 | nested | WBS-ATT-01 |
| S37 | NESTED #16 | Xóa hàng loạt ca | LIVE | SRS_THIN | A1 | nested | WBS-ATT-01 |
| S38 | NESTED #16 | Xóa một ca | LIVE | SRS_THIN | A1 | nested | WBS-ATT-01 |
| S39 | MISSING | Ca → Sao chép | STUB no-op | PRODUCT_STUB | A1 | **IN MVP giấy** | WBS-ATT-01 |
| S40 | #17 | Phân ca (lịch) | STUB_UI | PRODUCT_STUB | A1·A5 | roster GĐ1? | WBS-ATT-01 |
| S41 | #18 | Ca tăng ca OT | STUB_UI | PRODUCT_STUB | A1 | — | WBS-ATT-01 |
| S42 | #19 | Đơn nghỉ phép | LIVE | COVERED | A3·A5 | ATT-08/09 | WBS-ATT-05 |
| S43 | MISSING | Quỹ phép panel | LIVE GET | SRS_THIN | A3·A5 | **IN MVP giấy** · **ATT-05b IN** | WBS-ATT-04 |
| S44 | NESTED #19 | Tạo đơn nghỉ | LIVE | COVERED | A5 | nested | WBS-ATT-05 |
| S45 | NESTED #19 | Chi tiết đơn nghỉ | LIVE | COVERED | A5 | nested | WBS-ATT-05 |
| S46 | NESTED #19 | Từ chối đơn | LIVE | COVERED | A5 | nested | WBS-ATT-05 |
| S47 | NESTED #19 | Xóa đơn nghỉ | LIVE | COVERED | A5 | nested | WBS-ATT-05 |
| S48 | #20 | Đơn muộn/sớm | LIVE | UNMAPPED_PRODUCT | A1 | **UC-BP-ATT-13** | WBS-ATT-01 |
| S49 | NESTED #20 | Muộn/sớm CRUD | LIVE | UNMAPPED_PRODUCT | A1 | nested | WBS-ATT-01 |
| S50 | #21 | Đơn tăng ca | LIVE | UNMAPPED_PRODUCT | A2·D8 | **UC-BP-ATT-14** | WBS-ATT-06 |
| S51 | NESTED #21 | OT CRUD | LIVE | UNMAPPED_PRODUCT | D8 | nested | WBS-ATT-06 |
| S52 | #22 | Đơn công tác | LIVE | UNMAPPED_PRODUCT | — | **UC-BP-ATT-15** | — |
| S53 | NESTED #22 | Công tác CRUD | LIVE | UNMAPPED_PRODUCT | — | nested | — |
| S54 | #23 | Đơn cập nhật chấm | LIVE | UNMAPPED_PRODUCT | A6 | **UC-BP-ATT-17** | WBS-ATT-02 |
| S55 | NESTED #23 | Update CRUD | LIVE | UNMAPPED_PRODUCT | A6 | nested | WBS-ATT-02 |
| S56 | #24 | Đơn đổi ca | LIVE | UNMAPPED_PRODUCT | A1 | **UC-BP-ATT-16** | WBS-ATT-01 |
| S57 | NESTED #24 | Đổi ca CRUD | LIVE | UNMAPPED_PRODUCT | A1 | nested | WBS-ATT-01 |
| S58 | #25 | Tổng hợp nghỉ | ALIAS LeaveTab | SPEC_GAP | A3 | ACCEPTED | WBS-ATT-04 |
| S59 | #26 | Tổng hợp nghỉ bù | ALIAS LeaveTab | SPEC_GAP | A3 | ATT-06 | WBS-ATT-04 |
| S60 | #27 | Kế hoạch nghỉ | ALIAS · GĐ2 | MEETING_ONLY_GĐ2 | — | — | — |
| S61 | #28 | Tab Nghỉ phép (top) | LIVE | COVERED | A3 | =S42 | WBS-ATT-05 |
| S62 | #29 | Báo cáo chấm công | LIVE | UNMAPPED_PRODUCT | A2·D8 | ATT-10 thin | WBS-ATT-06 |
| S63 | #30 | Báo cáo → Xuất | PARTIAL | SPEC_GAP | — | ACCEPTED export | — |
| S64 | #31 | Settings NV chấm công | LIVE | SPEC_GAP | A6 | ACCEPTED map | — |
| S65 | MISSING | NV → Import dialog | LIVE | UNMAPPED_PRODUCT | A6 | **IN MVP giấy** | — |
| S66 | MISSING | NV Filter/Download no-op | STUB | PRODUCT_STUB | — | **IN MVP giấy** | — |
| S67 | #32 | Rules Chung | LIVE | COVERED | A1·A5 | ATT-02 | WBS-ATT-01 |
| S68 | #33 | Rules Công chuẩn | PARTIAL | SPEC_GAP | A2·D8 | cols GĐ2 | WBS-ATT-06 |
| S69 | #34 | Rules Tùy chỉnh | LIVE static | SPEC_GAP | — | ACCEPTED cols | — |
| S70 | MISSING | Customize Reset/Preview/Add | STUB no-op | PRODUCT_STUB | — | **IN MVP giấy** | — |
| S71 | MISSING | Gợi ý phương thức | STUB no-op | MEETING_ONLY_GĐ2 | — | **OUT** sheet 02 | — |
| S72 | #35 | Rules Thiết bị | LIVE | SRS_THIN | A6 | — | WBS-ATT-02 |
| S73 | #36 | Rules Ứng dụng | LIVE | SRS_THIN | A6 | — | WBS-ATT-02 |
| S74 | MISSING | App → Địa điểm GPS | LIVE API | UNMAPPED_PRODUCT | A6 | **IN MVP giấy** · **03d IN** | WBS-ATT-02 |
| S75 | MISSING | App → Thêm địa điểm GPS | LIVE | UNMAPPED_PRODUCT | A6 | **IN MVP giấy** · nested 03d | WBS-ATT-02 |
| S76 | #37 | Rules Máy tính bảng | STUB_UI | PRODUCT_STUB | — | GĐ2? | — |
| S77 | #38 | Ủy quyền chấm | STUB_UI | MEETING_ONLY_GĐ2 | — | — | — |
| S78 | #39 | Rules Tự động | STUB_UI | PRODUCT_STUB | — | ACCEPTED auto | — |
| S79 | #40 | CFG Quy tắc tăng ca | STUB redirect | PRODUCT_STUB | A2·D8 | catalog | WBS-ATT-06 |
| S80 | #41 | CFG Quy tắc nghỉ | STUB redirect | PRODUCT_STUB | A3·A5 | ATT-04 | WBS-ATT-04 |
| S81 | #42 | CFG Muộn/sớm | STUB redirect | PRODUCT_STUB | A1 | ATT-02 | WBS-ATT-01 |
| S82 | #43 | CFG Quy tắc đơn từ | STUB redirect | PRODUCT_STUB | A5 | — | WBS-ATT-05 |
| S83 | #44 | Settings Người dùng | STUB_UI | PRODUCT_STUB | — | — | — |
| S84 | #45 | Settings Vai trò | STUB_UI | PRODUCT_STUB | — | — | — |
| S85 | #46 | Settings Hệ thống | STUB_UI | PRODUCT_STUB | — | — | — |
| S86 | EXTRA DEAD | Orphan leave create | DEAD | UNMAPPED_PRODUCT | — | cleanup opt | — |
| S87 | EXTRA DEAD | Orphan leave detail | DEAD | UNMAPPED_PRODUCT | — | cleanup opt | — |
| S88 | EXTRA DEAD | Orphan leave approval | DEAD | UNMAPPED_PRODUCT | — | cleanup opt | — |
| S89 | EXTRA DEAD | Orphan edit attendance | DEAD | UNMAPPED_PRODUCT | — | live=S27 | — |
| S90 | EXTRA | Route shell AttendanceEntry | N/A | — | — | infra | — |

### 6.1 Fidelity #1–46 rollup (parent NAV — chi tiết gap giữ §6.0)

| Metric | Count |
|--------|------:|
| Fidelity parents stamped | **46/46** (S01…S85 map) |
| Deep inv stamped | **90/90** |
| COVERED (parent+nested spine) | ~22 |
| PRODUCT_STUB / no-op / redirect | **22** (deep stub cluster) |
| UNMAPPED_PRODUCT (LIVE chưa UC Enterprise) | ~28 (gồm MISSING + đơn #20–24) |
| SPEC_GAP / ACCEPTED honesty | ~14 |
| MEETING_ONLY_GĐ2 | leave-plan S60 · proxy S77 · S15–S16 **GĐ2** · S71 **OUT** · Face S17–19 = **PRODUCT_STUB Mobile MVP** |
| PRODUCT_MISSING (spine ngoài deep) | 1 (ATT-03b lịch lễ — không màn · EXPAND sheet 03) |
| **MISSING vs fidelity** (sponsor IN/OUT 1.1.4) | **18 stamped** — IN×15 · GĐ2×2 (S15/S16) · OUT×1 (S71) |
| Nested modals | 22 |
| EXTRA DEAD | 4 (S86–S89) |
| Browser U65 deep | **CLOSED** `PO-HRM-BP-ATT-DEEP-QA-01` · `po-hrm-bp-att-deep-qa-01.md` |

### 6.2 MISSING meeting-critical — sponsor stamp 1.1.4 (§1.4)

| inv | sponsor | gap_class | proposed_uc / action | Lý do họp |
|-----|---------|-----------|----------------------|-----------|
| S74–S75 | **IN MVP giấy** | UNMAPPED_PRODUCT | **UC-BP-ATT-03d IN** | A6 geofence — LIVE dưới App |
| S43 | **IN MVP giấy** | SRS_THIN | **UC-BP-ATT-05b IN** | A3–A4 quỹ phép |
| S15–S16 | **GĐ2** | MEETING_ONLY_GĐ2 | **UC-BP-ATT-03e OUT** | R-PROP-03e OUT |
| S25 | **IN MVP giấy** | UNMAPPED_PRODUCT | Expand ATT-11 / **ATT-11b** | A2·D8 xóa bảng |
| S28 | **IN MVP giấy** | UNMAPPED_PRODUCT | Expand ATT-03 records | A6 xóa bản ghi |
| S32 | **IN MVP giấy** | UNMAPPED_PRODUCT | Expand **UC-BP-ATT-18** | Tuần cell |
| S03 | **IN MVP giấy** | UNMAPPED_PRODUCT | Note #1/#6 | CTA bridge |
| S07 | **IN MVP giấy** | SPEC_GAP | FR paper | Pie loại nghỉ |
| S29 | **IN MVP giấy** | SPEC_GAP | Gộp #30 / riêng | Path xuất records |
| S04,S33,S39,S66,S70 | **IN MVP giấy** | PRODUCT_STUB | Paper FR / honesty | Stub → giấy IN |
| S71 | **OUT** | MEETING_ONLY_GĐ2 | Không UC | OUT |
| S65 | **IN MVP giấy** | UNMAPPED_PRODUCT | Expand #31 | Import NV |

### 6.3 DOC-DELTA 1.1.1 — Browser vs 18 MISSING (RO residual) · cập nhật 1.1.4 scope

> NAV #1–46 đã RO-walk. Nested dialog RO vẫn P2. Scope giấy theo §1.4 / R-PROP-*.

| inv | gap_class (1.1.4) | Browser | proposed_uc / scope |
|-----|------------------|---------|---------------------|
| **S15–S16** | MEETING_ONLY_GĐ2 | QR #8 PARTIAL — EmployeeQR not opened | **UC-BP-ATT-03e OUT** · S15/S16 **GĐ2** |
| **S74–S75** | UNMAPPED_PRODUCT | App #36 LIVE — add-site not opened | **UC-BP-ATT-03d IN** MVP giấy + code |
| **S43** | SRS_THIN | Leave LIVE — quỹ panel not isolated | **UC-BP-ATT-05b IN** MVP giấy + code |
| S25 · S28 | UNMAPPED_PRODUCT | Delete Alert not opened | **IN MVP giấy** |
| S02–S04 · S07 · S29 · S32–S33 · S39 · S65 · S66 · S70 | per §6.2 IN | Nested / no-op — residual P2 RO | Paper IN |
| **S71** | MEETING_ONLY_GĐ2 | no-op | **OUT** |

---

## 7. Module PAY — Họp P* × UC × product

| uc_id | meeting_ref | srs_fr_or_uc | product_surface | runtime | in_dev_or_stub | gap_class | customer_decision_needed | wbs_row |
|-------|-------------|--------------|-----------------|---------|----------------|-----------|--------------------------|---------|
| UC-BP-PAY-01 | P1 · D8 | FR-UC-BP-PAY-01 **đủ 7** | Payroll → Dữ liệu → Chấm công | STUB `featureInDev` nhiều data-* | yes | PRODUCT_STUB | **ANSWERED** Q-PAY-F-3: chỉ bảng công chốt | WBS-ATT-06 |
| UC-BP-PAY-02 | P4 · P5 | FR-UC-BP-PAY-02 **đủ 7** | Payroll → Tính lương / policy | STUB calc/policy menu | yes | PRODUCT_STUB | **ANSWERED** 2 bước · **R-PAY-DD-01** Form GĐ1 + kéo-thả GĐ2 | WBS-PAY-01 |
| UC-BP-PAY-03 | P2 | FR-UC-BP-PAY-03 §3.A | GTCG từ hồ sơ C&B | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-PAY-02 |
| UC-BP-PAY-04 | P6 | FR-UC-BP-PAY-04 **đủ 7** | Split-month (engine) | UNKNOWN UI | yes | PRODUCT_MISSING | — | WBS-PAY-03 |
| UC-BP-PAY-05 | P2 · P6 | FR-UC-BP-PAY-05 §3.A | Trần BH | UNKNOWN | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-PAY-02 |
| UC-BP-PAY-06 | P1 · P5 | FR-UC-BP-PAY-06 §3.A | Tạo bảng lương (`calc-create`) | STUB_UI | yes | PRODUCT_STUB | **EXPAND** sheet 03 | WBS-PAY-04 |
| UC-BP-PAY-07 | P3 · P6 · C8 | FR-UC-BP-PAY-07 §3.A | Tất toán nghỉ việc | PARTIAL/UNKNOWN | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-PAY-04 |
| UC-BP-PAY-08 | P5 | FR-UC-BP-PAY-08 §3.A | Phiếu / Payment tab | PARTIAL | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-PAY-05 |
| UC-BP-PAY-09 | P5 | FR-UC-BP-PAY-09 §3.A | Phân nhóm bảng lương | UNKNOWN | yes | SRS_THIN | **EXPAND** sheet 03 | WBS-PAY-05 |
| PAY-UI-overview | P5 | — | Payroll → Tổng quan | LIVE/PARTIAL | no | UNMAPPED_PRODUCT | — | — |
| PAY-UI-components | P4 | PAY-02 | Payroll → Thành phần lương | PARTIAL | yes | UNMAPPED_PRODUCT | — | WBS-PAY-01 |
| PAY-UI-policy-* | P2 · P4 | thin | Policy tax/BH/allowance/bonus/sales | STUB featureInDev | yes | PRODUCT_STUB | — | WBS-PAY-02 |
| PAY-UI-data-* | P1 | PAY-01 | data-attendance/sales/kpi/… | STUB featureInDev | yes | PRODUCT_STUB | Bind ATT sheet chốt | WBS-ATT-06 |
| PAY-UI-calc-* | P4 · P6 | PAY-02/06 | calc-create/list/advance/template/tax | STUB featureInDev | yes | PRODUCT_STUB | — | WBS-PAY-04 |
| PAY-UI-reports | P5 | — | Payroll → Báo cáo | PARTIAL | yes | UNMAPPED_PRODUCT | — | WBS-PAY-05 |

---

## 8. Tổng hợp theo `gap_class` (UC spine + ATT S01–S90)

| gap_class | Ước lượng hàng | Ý nghĩa cho chốt khách |
|-----------|---------------:|-------------------------|
| COVERED | ~30 | Giữ — đưa WBS nghiệm thu |
| SRS_THIN | ~32 | ba-docs làm đầy FR (gồm S43 quỹ phép) |
| PRODUCT_STUB | ~42 | «đang phát triển» / redirect CFG / no-op; không claim LIVE |
| PRODUCT_MISSING | ~2 | lịch lễ ATT-03b · split-month UI · *(OCR CORE-04 → OUT)* |
| MEETING_ONLY_GĐ2 | ~9 | Campaign OUT · leave-plan · proxy · Work · S15–16 GĐ2 · S71 OUT · ATT-03 GĐ2 |
| UNMAPPED_PRODUCT | ~30 | MISSING IN + đơn #20–24 + GPS 03d IN |
| SPEC_GAP | ~18 | Charts/export/summary/ALIAS — không mở Dev trừ khách mở FR |

---

## 9. Top gaps (ưu tiên đóng trước TechSpec)

| Prio | Gap | Owner kế | Hành động |
|------|-----|----------|-----------|
| ~~P0 ATT browser U65~~ | ~~AWAIT~~ | — | **CLOSED** 1.1.1 — `po-hrm-bp-att-deep-qa-01.md` |
| ~~P0 WBS 18 MISSING Excel~~ | ~~chưa stamp~~ | — | **CLOSED (Excel)** 1.1.2 — UC_CHOT v1.1 sheet **02b** |
| ~~P0 Q-* FILL~~ | ~~chưa stamp~~ | — | **ANSWERED** 1.1.3 — §1.2 |
| ~~P0 SPONSOR_CHOT_REMAINING~~ | ~~R-* · 02 · 03~~ | — | **CLOSED** 1.1.4 — §1.3–1.5 · `po-hrm-bp-uc-gap-w3-matrix-apply-02.md` |
| ~~P0 R-FY-01 / R-SIGN-01~~ | ~~OPEN~~ | — | **CLOSED** — CRUD/tenant cấm fix · XBOS WF |
| P0 | **SRS EXPAND** 25 UC sheet 03 + ADD **03d/05b** + Face Mobile FR | **ba-docs SRS-CHOT-01** | ADD-only · **cấm wipe** · sau land → PM set `READY_FOR_TECHSPEC_DOCS` |
| P0 | D7 PARTIAL — R-DEMO-01 all UC · TechSpec **S3 HOLD** · ≠ product demo GO | PM / qc spot | **không** READY_FOR_TECHSPEC · không mở Dev depth S3 |
| P0 | A3 leave-rules #41 STUB + A5 roster #17 STUB + ATT-03b PRODUCT_MISSING | ba-docs (trong EXPAND) | Catalog honesty · holiday EXPAND |
| P0 | A2/D8 summary vs **Q-ATT-SUMMARY API riêng** | ba-docs + sa | Paper AC — không claim LIVE |
| P0 | PAY Form GĐ1 + DD GĐ2 (**R-PAY-DD-01**) · data-* STUB | ba-docs | Không claim PAY LIVE · **cấm unfinished-PAY** |
| P1 | Fidelity matrix vẫn MISSING label cho 18 inv | ba-docs / qa | Expand # / NESTED policy |
| P1 | UNMAPPED đơn S48–S57 + S25/S28/S32 IN | ba-docs | UC-BP-ATT-13..18 / expand |
| P2 | Nested MISSING dialog RO | qa optional | Không chặn giấy |
| P2 | EMP export #9 · Job #18 · DEAD · REC/PAY U65 | M3 / Dev optional | OUT/waiver |

---

## 10. UC đề xuất bổ sung (matrix-first — **chưa** ADD SRS trừ khi PM mở ba-docs)

Chỉ đề xuất khi họp/product LIVE chưa có mã `UC-BP-*`:

| proposed_uc_id | Nguồn | Lý do | Gợi ý phạm vi |
|----------------|-------|-------|----------------|
| UC-BP-ATT-13 | S48–S49 · #20 · A1 | Đơn đi muộn/về sớm LIVE | MVP nếu giữ menu |
| UC-BP-ATT-14 | S50–S51 · #21 · D8 | Đơn tăng ca LIVE → bảng công | MVP |
| UC-BP-ATT-15 | S52–S53 · #22 | Đơn công tác LIVE | Khách IN/OUT |
| UC-BP-ATT-16 | S56–S57 · #24 · A1 | Đơn đổi ca LIVE | Phụ thuộc roster GĐ1/GĐ2 |
| UC-BP-ATT-17 | S54–S55 · #23 | Đơn cập nhật chấm (HRM-AT-04..09) | Alt ATT-03 hoặc UC riêng |
| UC-BP-ATT-18 | S31–S32 · #14 | Lưới chấm tuần + cell modal | Khách IN/OUT |
| UC-BP-ATT-03c | ATT-03b PRODUCT_MISSING | Màn lịch lễ/Tết (dương+âm) | MVP (REQ_CC_001) |
| UC-BP-ATT-03d | S74–S75 · #36 App · A6 | Địa điểm GPS / geofence work-sites | **IN MVP giấy + code** (R-PROP-03d) — ba-docs ADD SRS-CHOT-01 |
| UC-BP-ATT-03e | S15–S16 · #8 QR · A6 | Thẻ QR nhân viên (+ dialog) | **OUT** (R-PROP-03e) · S15/S16 GĐ2 — **không ADD** MVP |
| UC-BP-ATT-05b | S43 · #19/#28 · A3·A5 | Quỹ phép panel (balance/hold/chuyển kỳ) | **IN MVP giấy + code** (R-PROP-05b) — ba-docs ADD SRS-CHOT-01 |
| UC-BP-ATT-11b | S25 · A2·D8 | Xóa bảng chấm công | Expand ATT-11 |
| UC-BP-CORE-11 | C7 · C8 | Lịch sử quyết định + fork nghỉ việc | Nếu PAY-07/CORE mỏng |
| UC-BP-REC-01c | REC-UI-proposals | Tách đề xuất HC vs plans | Optional |

#### 10.1 Expand sketch (propose-only — ba-docs khi PM mở; **cấm wipe** FR hiện có)

| proposed_uc_id | Diễn biến tối thiểu (gợi ý) | AC đo được |
|----------------|----------------------------|------------|
| **UC-BP-ATT-03e** (S15–S16) | ~~OUT MVP~~ — không viết FR GĐ1 | Sponsor **OUT** · giữ sketch nội bộ nếu GĐ2 mở lại |
| **UC-BP-ATT-03d** (S74–S75) | QL mở Cài đặt→Quy tắc→Ứng dụng→Địa điểm GPS → list → Thêm (name/lat/lon/radius) → Lưu → list cập nhật; Xóa site | POST/PUT/DELETE work-site 2xx; FE sau 2xx + F5; GPS punch dùng radius đã cấu hình |
| **UC-BP-ATT-05b** (S43) | NV/QL mở Nghỉ phép → panel Quỹ phép theo loại → thấy số dư/hold/chuyển kỳ | GET balance 2xx; cột loại khớp catalog; empty hợp lệ ≠ spinner storm |

**Không** đề xuất UC cho: Campaign **OUT** · leave-plan/proxy/Work · DEAD S86–89 · S71 **OUT** · S90 shell.  
**Face (#9 / S17–19):** R-FACE-01 **Mobile only MVP** · ba-docs ADD FR mobile trong SRS-CHOT-01 — web shell GĐ2-HOLD (không claim LIVE).

---

## 11. Handoff ba-docs — WBS từ matrix

Mỗi hàng Excel khách tối thiểu:

`uc_id | meeting_ref | srs_status (đủ7/Lịch/GĐ2/OUT) | product_runtime | gap_class | customer_decision | wbs_row | mvp_flag | att_inv (S##)`

**Bắt buộc phủ:** §2–§7 + **§6.0 S01–S90** (NESTED có thể gộp parent; **18 MISSING bắt buộc hàng riêng hoặc expand rõ**) · GPS S74–75 · quỹ S43 · không bỏ settings STUB.

---

## 12. Giả định & phụ thuộc

| # | Giả định / phụ thuộc |
|---|----------------------|
| 1 | Deep ATT code SoT (`ATT-DEEP-CODE-01`) + browser U65 **CLOSED** (`ATT-DEEP-QA-01`) — nested MISSING dialog vẫn residual §6.3 |
| 2 | Residual «ATT deep D4 missing» **CLOSED** tại R2; không còn blocker inventory |
| 3 | REC/PAY runtime = code-read — **UNKNOWN** đến fidelity U65; PAY-API-01 **CLOSED** — không redo depth · meeting PAY **complete** (cấm unfinished-PAY) |
| 4 | SRS v0.7 khóa D1–D8 / A3–A4 narrative; FR Lịch vẫn SRS_THIN |
| 5 | PAY Tech/DB/API DRAFT — verdict **NOT_READY_PENDING_SRS_EXPAND** · R-PAY-DD-01 Form GĐ1 + DD GĐ2 · **không** READY_FOR_TECHSPEC · ≠ PAY LIVE |
| 6 | Không claim Attendance / Employees / Payroll CLOSED · `uat_done` ATT = **false** · **cấm** product demo GO |
| 7 | `#40–43` = redirect Settings catalog (S79–S82) — **browser confirmed** STUB_UI |
| 8 | Face #9 = **Mobile only MVP** (R-FACE-01) · web shell **GĐ2-HOLD** · D7 **PARTIAL** · TechSpec **S3 HOLD** |
| 9 | WBS UC_CHOT **v1.1** + REMAINING filled — paper Q-* đóng; chặn còn lại = **SRS-CHOT-01 EXPAND** |
| 10 | R-FY-01 = CRUD/tenant **cấm fix month** (không invent tháng) · R-SIGN-01 = XBOS-configurable WF |

---

## 13. Nhật ký

| Ver | Ngày | Thay đổi |
|-----|------|----------|
| **1.0** | 2026-08-04 | Matrix họp×SRS×product; ATT fidelity 46/46; verdict **NOT_READY** (D4 deep missing) |
| **1.1** | 2026-08-04 | **R2:** §6.0 S01–S90 đầy đủ; đóng residual D4 code; §6.2 MISSING P0; UC-03d/03e/05b/11b; verdict vẫn **NOT_READY** (browser AWAIT + SRS_THIN + Q-* + D7) · PAY-API không đụng |
| **1.1.1** | 2026-08-05 | **DOC-DELTA** `PO-HRM-BP-ATT-DEEP-GAP-BA-01`: Deep ATT browser **CLOSED** (`po-hrm-bp-att-deep-qa-01.md`); §5.1 A1–A6 gap_class+matrix#+inv; §6.3 residual MISSING; §10.1 expand sketch S15/S74/S43; verdict **NOT_READY** (WBS 18 MISSING · SRS_THIN · Q-* · D7 · REC/PAY fidelity) — **không** flip READY_FOR_TECHSPEC |
| **1.1.2** | 2026-08-05 | **DOC-DELTA** `PO-HRM-BP-UC-GAP-W3-SYNTH-01`: W3 synth — WBS UC_CHOT v1.1 / 02b stamp → blocker #2 **PARTIAL**; §1.1 machine gap YAML; §9 reorder P0 paper/Q-*/SRS_THIN/propose-UC; program exit §4 FAIL SRS completeness; verdict **NOT_READY** — **không** flip READY_FOR_TECHSPEC |
| **1.1.3** | 2026-08-05 | **DOC-DELTA** `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-01`: stamp Q-* / D7 / Face MVP từ `SPONSOR_CHOT_FILL.xlsx` 34/34 (§1.2 verbatim); residual **R-FY-01** · **R-SIGN-01** · REMAINING OPEN; TechSpec **S3 HOLD**; verdict **NOT_READY** |
| **1.1.4** | 2026-08-05 | **DOC-DELTA** `PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-02`: stamp REMAINING 14+18+28 (§1.3–1.5 verbatim); **R-FY-01 CLOSED** (CRUD/tenant · cấm fix) · **R-SIGN-01 CLOSED** (XBOS WF) · PROP-03d/05b **IN** · 03e **OUT** · Face **Mobile only MVP** · PAY Form GĐ1+DD GĐ2 · OCR/Campaign OUT · sheet 02 IN/GĐ2/OUT · sheet 03 25 EXPAND / ATT-03 GĐ2 / CORE-04 OUT; verdict **NOT_READY_PENDING_SRS_EXPAND** (chờ SRS-CHOT-01 → `READY_FOR_TECHSPEC_DOCS`) — **không** invent · **không** READY_FOR_TECHSPEC · Attendance not CLOSED · **cấm** product demo GO |

*Ma trận nội bộ — không thay thế SRS gửi khách và không khẳng định đã triển khai / khách đã ký.*
