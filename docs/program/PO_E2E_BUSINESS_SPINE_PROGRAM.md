# PO — Chương trình kiểm thử E2E nghiệp vụ hệ sinh thái (Web + Mobile)

| Meta | Value |
|------|--------|
| **Program ID** | `PO-E2E-BIZ-SPINE-01` |
| **Owner** | PM / PO (Composer) |
| **Date** | 2026-08-03 |
| **Sponsor intent** | Không nghiệm thu theo slice kỹ thuật hẹp; nghiệm thu **luồng nghiệp vụ đầu→cuối** trên web **và** mobile, đúng persona từng cấp |
| **Locks** | U65 zero-seed · U76 HDSD-aligned · U78 world-standard test log · anti-idle viewport |
| **Status** | **ACTIVE** — Wave A DISPATCHED |

---

## 0. Thừa nhận gap (PO)

Wave `W1-B-*` (AUTH / EMP / Leave mount / CAT display-ready) là **cửa kỹ thuật OS 28** — **không** thay thế nghiệm thu nghiệp vụ hệ sinh thái.

| Đã làm (hẹp) | Sponsor yêu cầu (đúng) |
|--------------|------------------------|
| Label/chip/mount/API bind | Luồng tuyển dụng XBOS→HRM→onboard→lương |
| Case A/B/C đơn lẻ trên 1 màn | Phê duyệt theo cấp (NV → QL → GĐ) + web↔mobile |
| Evidence per WI | **Báo cáo tổng** coverage menu + J-* + residual |

**Quyết định PO:** Mở program này; tạm **hạ ưu tiên** slice W1-B còn lại nếu xung đột quota; **không** claim UAT/Phase1 DONE từ W1-B GWC.

---

## 1. North-star outcomes

| # | Outcome | Pass khi |
|---|---------|----------|
| O1 | Hire-to-Pay | Từ QT tuyển dụng XBOS → duyệt → hire → NV + HĐ → kỳ lương thấy người / phiếu |
| O2 | Leave ladder | NV xin nghỉ (web **hoặc** mobile) → đúng cấp duyệt theo BR/WF → số dư/công cập nhật |
| O3 | Late / attendance ESS | NV đăng ký đi muộn (mobile) → QL duyệt đúng chỗ → bản ghi công phản ánh |
| O4 | Catalog control | Publish/apply XBOS → HRM pull → picker dùng đúng danh mục công ty |
| O5 | Menu honesty | Mọi leaf HRM sidebar: load + empty hợp lệ **hoặc** mutate AC đã map — không “có menu mà không test” |

---

## 2. Spine E2E (bắt buộc)

### E2E-SPINE-01 — Tuyển dụng → Onboard → Lương (Web XBOS + HRM)

| Bước | Actor | Surface | Hành động | AC / SoT |
|------|-------|---------|-----------|----------|
| 1 | Admin / Group CEO | XBOS Workflow | Tạo/kích hoạt QT `hrm_recruitment_*` (hoặc xác nhận definition active) | J-REC-WF-01 · FR-UC-B03 |
| 2 | HCNS / CEO CT | HRM Recruitment | Tạo kế hoạch / requisition **đúng công ty** → Gửi duyệt | UF-HRM-12 · J-HRM-05 · J-REC-WF-02 |
| 3 | Người duyệt L1/L2 | XBOS Inbox | Duyệt task (FE only, **cấm** seed inbox) | J-REC-WF-03 · UF-XBOS-08 |
| 4 | HCNS | HRM Candidate | Chạy bước roadmap / hire → gắn `employee_id` | J-REC-WF-04 · UF-HRM-12 |
| 5 | HCNS | HRM Employees / Contracts | Mở hồ sơ NV mới + HĐ active cùng `company_id` | J-HRM-01/02/03 · UF-HRM-01..03 |
| 6 | HCNS | HRM Payroll | Kỳ lương / payslip **thấy** NV (hoặc bước chạy đợt nếu UI cho phép U65) | J-HRM-07 · UF-HRM-06 · FR-UC-H04 |
| 7 | — | — | F5 mỗi bước mutate; Network 2xx; persona đúng CT | U65 · U78 log |

**Persona ladder bắt buộc ghi trong evidence:** Group CEO `ceo@xe.vn` · Member CEO `du-lich.ceo@xe.vn` · HRBP `du-lich.hr@xe.vn` · NV mobile `uat.nv####@xe.vn` (khi vào ESS).

**Negative:** Member CEO **không** hire/list ngoài CT; Inbox trống = 🟡 BLOCKED (không seed).

---

### E2E-SPINE-02 — Nghỉ phép: đăng ký → duyệt theo cấp (Web + Mobile)

| Case ID | Actor submit | Channel | Điều kiện nghiệp vụ | Approver kỳ vọng | Pass |
|---------|--------------|---------|---------------------|------------------|------|
| LV-01 | NV | Mobile | Phép năm ≤ ngưỡng L1 (BA điền từ WF/HDSD) | Quản lý trực tiếp (mobile Inbox / web) | Duyệt → status + số dư |
| LV-02 | NV | Mobile hoặc Web | Phép năm > ngưỡng L1 **hoặc** bước L2 | Giám đốc / cấp 2 | Chỉ GĐ duyệt mới `APPROVED` |
| LV-03 | NV | Web Attendance | Ốm ≥ 3 ngày **không** đính kèm | — | Fail sâu `HRM-LEAVE-VAL-ATT` / toast VI |
| LV-04 | NV | Web | Ốm ≥ 3 ngày **có** đính kèm | Theo WF | Approve path |
| LV-05 | NV=QL | Any | Tự duyệt | — | Chặn BR-WF-04 |
| LV-06 | Sai CT | Any | Duyệt đơn CT khác | — | 403/409 |

**Spec gap PO ghi rõ:** `SRS_NEW` FR-UC-H03 mô tả **hai cấp** nhưng **chưa** ghi số ngày cắt L1/L2.  
→ **BA-P bắt buộc** trích từ: WF definition active + HDSD + `LeaveWorkflowBridge` / BR hiện hữu → bảng `days → level` trước khi QA 🟢 ladder.

SoT tạm: FR-UC-H03 · J-MOB-03/05/23..29 · J-HRM-06 · leave LIVE-R1 (mount only).

---

### E2E-SPINE-03 — Đi muộn / chấm công ESS (Mobile → duyệt)

| Case ID | Submit | Approve surface | AC |
|---------|--------|-----------------|-----|
| AT-01 | NV mobile đăng ký đi muộn / điều chỉnh | QL mobile «Cần duyệt» hoặc web Attendance | J-MOB-02/05/07 · tạo → pending → duyệt → F5 |
| AT-02 | Sai ngày / thiếu lý do | — | Fail sâu VI, không mutate |
| AT-03 | Sau duyệt | Bảng công / record | Thấy bản ghi hoặc trạng thái đúng kỳ |

---

### E2E-SPINE-04 — Catalog XBOS → HRM (control plane)

| Case | Flow | J-* |
|------|------|-----|
| CAT-01 | Publish → apply-to-members → HRM pull → picker | J-XBOS-CTRL-01..02 · W1-B-03 CAT |
| CAT-02 | Key ngoài allow-list → 400 | J-XBOS-CTRL-03 |

---

## 3. Coverage menu HRM (không bỏ sót)

QA Wave B chạy lại / cập nhật trạng thái **mọi** `UF-HRM-MENU-01..17` + deep:

| Nhóm | UF / J | Ghi chú PO |
|------|--------|-----------|
| Tổ chức / NV | MENU-02, J-HRM-02, UF-01/03 | Mutate + F5 |
| HĐ / BH | MENU-03/04, J-03/04 | |
| Tuyển dụng | MENU-06, UF-12, J-REC-WF-* | Nằm trong SPINE-01 |
| Chấm công / nghỉ | MENU-07, UF-05/16, J-06/06b | SPINE-02/03 |
| Lương | MENU deep lương, UF-06, J-07 | SPINE-01 bước 6 |
| Quyết định | MENU-05 | Density ≠ product DONE |
| Settings catalogs | UF-10 | SPINE-04 |
| Metadata | UF-11 | |
| Company | J-HRM-CO-01 | |
| Import preview | J-HRM-IM-01 | non-persist only |

Mobile: J-MOB-01..05 tối thiểu trong Wave A; 06..35 Wave B nếu quota.

---

## 4. Lộ trình wave

| Wave | Owner | Deliverable | Exit |
|------|-------|-------------|------|
| **A0** | ba-process | Bảng BR ladder nghỉ + late + hire personas; điền số ngày L1/L2; HDSD inventory | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` |
| **A1** | qa | SPINE-01 web (tối đa đến bước có data U65; BLOCKED nếu inbox trống — **không seed**) + U78 | `docs/qa/evidence/po-e2e-spine-01-qa-w1.md` + `*-test-log.{md,json}` |
| **A2** | qa-device | SPINE-02 LV-01 + SPINE-03 LT-01 trên emulator; U78 | `docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md` + test-log |
| **A3** | qa | SPINE-02 web LV-03/04 + menu sweep delta vs matrix | `po-e2e-spine-02-web-qa-w1.md` |
| **A4** | qc | Gate pack: GO/GWC + **báo cáo tổng** cho sponsor | `docs/qa/evidence/po-e2e-biz-spine-qc-01.md` + `docs/qa/reports/PO_E2E_BIZ_SPINE_STATUS.md` |

---

## 5. Chuẩn báo cáo sponsor (bắt buộc)

Mỗi wave QA/QC **phải** có:

1. `*-test-log.md` + `*-test-log.json` (U78 / IEEE 829 lean)
2. Bảng case: ID · persona · channel · bước · Network · FE sau 2xx · F5 · 🟢/🟡/🔴
3. Cột **spec_ref** (SRS FR / J-* / HDSD)
4. Residual owner + không claim Phase 1 DONE

**Master rollup (QC A4):** `docs/qa/reports/PO_E2E_BIZ_SPINE_STATUS.md`

---

## 6. Cấm

- Seed inbox / DB để «có task duyệt»
- PASS chỉ HTTP 200 / probe
- Coi W1-B AUTH/EMP GWC = UAT hệ sinh thái
- Bỏ mobile khỏi leave/late spine
- Idle viewport sau khi mở app

---

## 7. Liên kết

- Journey SoT: `docs/program/PROGRAM_JOURNEY_MAP.md`
- UF matrix: `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md`
- SRS pack: `docs/brand-new-documents-20270801/SRS_NEW.md` (FR-UC-B03/H01/H03/H04/M03 · §3.7 GĐ1 vs Sau)
- **Competitive expand:** `docs/program/PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` (MISA · Workday/SF · Bamboo/Personio → gap P0/P1/P2)
- Test log: `docs/qa/WORLD_STANDARD_TEST_LOG.md`
- OS QA: `_vibe-team-os/30-HDSD-ALIGNED-QA-AND-SRS-BRANCH-TRACE.md` · `31-WORLD-STANDARD-TEST-LOG.md`
