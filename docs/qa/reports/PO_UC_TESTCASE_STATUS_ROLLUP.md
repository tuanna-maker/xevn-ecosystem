# Tổng hợp Use Case × Testcase × Trạng thái (đọc cho Sponsor)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-UC-TC-STATUS-ROLLUP-01` |
| **Cập nhật** | 2026-08-04 |
| **Owner** | pm (synth từ BA + Catalog + Report + U84) |
| **Mục đích** | Một trang: **UC nào xong / chưa** (trạng thái) — **không** thay Test Case Spec đầy đủ |
| **Test Case chuyên nghiệp (SoT thiết kế)** | **`docs/qa/professional/`** — UC → Nghiệp vụ → Chức năng → số case |
| **Không claim** | UAT DONE · Phase 1 DONE |

> **Sponsor 2026-08-04:** Bộ TC/report “phẳng” trước đây khó đọc. Thiết kế chuẩn nằm ở `docs/qa/professional/README.md`. File này chỉ còn dashboard trạng thái.

---

## 0. Cách đọc (30 giây)

Có **3 lớp** — đừng trộn:

| Lớp | Là gì | File SoT | “Xong” nghĩa là |
|-----|--------|----------|-----------------|
| **A. Use case nghiệp vụ** | Việc user làm (BA case / FR-UC) | `po-e2e-ba-case-matrix-01.md` | Happy path **FE** đã EVIDENCED (+ F5) |
| **B. Spine testcase** | TC thực thi ưu tiên (53) | `PO_SPEC_TEST_CASE_CATALOG.md` · report §2 | Từng TC-ID có verdict riêng |
| **C. Depth catalog** | TC chi tiết menu (1473 unique) | `docs/qa/testcases/**` · report §6–§12 | **Chỉ thiết kế** — chưa = UAT |

**Chú giải trạng thái UC**

| Icon | UC status | Ý nghĩa |
|------|-----------|---------|
| ✅ | **DONE (slice)** | Happy path chính đã EVIDENCED trên FE/mobile |
| 🟡 | **PARTIAL** | Có TC pass nhưng còn nhánh quan trọng mở / soft residual |
| 🔴 | **FAIL / BLOCKED** | Có blocker sản phẩm hoặc môi trường chặn nghiệm thu |
| ⚪ | **PLANNED** | Chưa chạy wave / chưa có evidence |
| ⛔ | **SPEC_GAP** | Spec chưa chốt — **cấm** giả PASS |

**Chú giải trạng thái TC:** `EVIDENCED` · `AUTOMATED` · `FAIL` · `BLOCKED` · `SPEC_GAP` · `PLANNED` · `BLOCKED-EXTERNAL`

> Báo cáo kỹ thuật chi tiết: [`PO_SPEC_TEST_REPORT.md`](./PO_SPEC_TEST_REPORT.md)  
> Catalog TC spine: [`PO_SPEC_TEST_CASE_CATALOG.md`](../PO_SPEC_TEST_CASE_CATALOG.md)  
> Doctrine TC ≠ Report ≠ Unit: `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md`

---

## 1. Dashboard — Use case nghiệp vụ (spine PO)

| UC / Case | Tên ngắn | UC status | Đã xong (tóm) | Còn mở |
|-----------|----------|-----------|---------------|--------|
| **HP-01** | WF tuyển dụng (definition) | ✅ DONE | QT `hrm_recruitment_*` lưu/active | — |
| **HP-02** | Kế hoạch / YCTD + Gửi duyệt QT | 🔴 FAIL | Mount/plan path còn fail lịch sử | `TC-HP-02` FAIL — cần retest sau FE |
| **HP-03** | Inbox duyệt task tuyển dụng | 🟡 PARTIAL | Duyệt happy EVIDENCED | Self-approve / empty-inbox policy PLANNED |
| **HP-04** | Ứng viên → Hire gắn NV | ✅ DONE | Create **201** + Hire PATCH **200** | — |
| **HP-05** | Hồ sơ NV (+ HĐ) sau hire | 🟡 PARTIAL | Emp detail soft EVIDENCED | Contracts UI `TC-HP-10` PLANNED |
| **HP-06** | Lương / payslip thấy NV | ⚪ PLANNED | — | `TC-HP-11` |
| **LV-01** | Gửi đơn nghỉ + duyệt L1 | 🟡 PARTIAL | Mobile submit EVIDENCED | Approve mobile `TC-LV-02` BLOCKED (J-MOB-05) |
| **LV-02** | Nghỉ 2 cấp (L2 theo ngày) | ⛔ SPEC_GAP | AS-IS 1 bước đã ghi | Chờ Sponsor chốt `T_L1` / `N` |
| **LV-03** | Ốm ≥3 ngày không file → chặn | ✅ DONE | Web GWC + unit | — |
| **LV-04** | Ốm ≥3 + file → tạo + duyệt | ✅ DONE | Create/attach + approve UX GWC | — |
| **LV-05** | Chống tự duyệt nghỉ | ⚪ PLANNED | — | `TC-LV-10` |
| **LV-06** | Duyệt sai công ty | ⚪ PLANNED | — | `TC-LV-11` |
| **AT-01** | Điều chỉnh CC / đi muộn + duyệt | 🟡 PARTIAL | Nav mobile GWC · **Web Primary ATT@TMDV EVIDENCED** | Mobile full submit/approve vẫn BLOCKED |
| **AT-02** | Validation thiếu field | ⚪ PLANNED | — | `TC-AT-03` |
| **AT-03** | Xem bản ghi sau duyệt | ⚪ PLANNED | — | `TC-AT-04` |
| **MGR / H01** | Gán `manager_id` | ✅ DONE | Browser PATCH EVIDENCED + unit | Filter pending `TC-MGR-03` PLANNED |
| **CAT control** | Publish/pull catalog | ✅ DONE (control) | W1-B-03 EVIDENCED | Depth packs riêng |

**UAT / Phase 1 toàn hệ:** **CHƯA DONE** (dù nhiều UC slice ✅).

---

## 2. Chi tiết từng Use Case → Testcase

### 2.1 HP-01 — Định nghĩa WF tuyển dụng · ✅ DONE

| Field | Value |
|-------|--------|
| **FR / UC** | FR-UC-B03 · UC-XBOS-13/WF |
| **Persona** | `ceo@xe.vn` |
| **Luồng** | CC → Quy trình → lưu QT recruitment → F5 còn |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-01** | UI Happy | **EVIDENCED** | `po-e2e-spine-01-qa-w1.md` |

---

### 2.2 HP-02 — Kế hoạch / YCTD + Gửi duyệt QT · 🔴 FAIL

| Field | Value |
|-------|--------|
| **FR / UC** | FR-UC-B03 |
| **Persona** | HRBP / Group CEO |
| **Luồng** | Tuyển dụng → Kế hoạch/YCTD → Tạo → **Gửi duyệt QT** |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-02** | UI Happy | **FAIL** | `po-e2e-spine-01-qa-w1.md` · `po-e2e-spine-01-fe-rec-mount.md` |
| **TC-HP-14** | UNIT bridge | **AUTOMATED** | `recruitment-workflow.bridge.spec.ts` |

**U84 bổ sung (cùng nghiệp vụ, ô Primary):** xem §3 — P-REC-PLAN / P-REC-REQ đã EVIDENCED @ TMDV/VISUN (khác TC-HP-02 spine).

---

### 2.3 HP-03 — Inbox duyệt tuyển dụng · 🟡 PARTIAL

| Field | Value |
|-------|--------|
| **FR / UC** | FR-UC-B03 · UF-XBOS-08 · BR-WF-04 |
| **Persona** | Approver đúng hat |
| **Luồng** | Hộp thư → Duyệt task → F5 rời inbox |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-03** | UI Happy | **EVIDENCED** | `po-e2e-spine-01-qa-w3.md` |
| **TC-HP-04** | Fail-deep tự duyệt | **PLANNED** | — |
| **TC-HP-05** | Boundary inbox trống (U65) | **PLANNED** | policy — không seed |
| **TC-HP-13** | Reject lý do ≥10 | **PLANNED** | — |
| **TC-X-02** | Self-approve WF | **PLANNED** | — |

---

### 2.4 HP-04 — Ứng viên → Hire gắn NV · ✅ DONE

| Field | Value |
|-------|--------|
| **FR / UC** | UF-HRM-12 · J-REC-WF-04 |
| **Persona** | HRBP |
| **Luồng** | Thêm UV → Đã tuyển → HireEmployeeLink |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-06** | UI create candidate | **EVIDENCED** | `po-e2e-spine-01-qa-w4-r1.md` |
| **TC-HP-07** | UNIT DTO | **AUTOMATED** | `po-e2e-spine-01-be-cand-dto-01.md` |
| **TC-HP-08** | UI Hire link | **EVIDENCED** | W4-R1 |
| **TC-UNIT-REC-01** | UNIT whitelist | **AUTOMATED** | be-cand-dto |
| **TC-UNIT-REC-02** | UNIT controller | **AUTOMATED** | recruitment.controller.spec |

**U84:** P-REC-PIPE @ CO-TMDV EVIDENCED (pipeline + Inbox) — §3.

---

### 2.5 HP-05 — Hồ sơ NV / Hợp đồng sau hire · 🟡 PARTIAL

| Field | Value |
|-------|--------|
| **FR / UC** | FR-UC-H01 · J-HRM-03 |
| **Luồng** | Nhân sự → hồ sơ; Hợp đồng → HĐ active |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-09** | UI emp detail | **EVIDENCED** (soft) | W4-R1 — residual stamp/contracts |
| **TC-HP-10** | UI contracts | **PLANNED** | — |
| **TC-HP-12** | Scope member | **PLANNED** | — |

---

### 2.6 HP-06 — Lương / payslip · ⚪ PLANNED

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-HP-11** | UI payroll | **PLANNED** | — |

---

### 2.7 LV-01 — Gửi nghỉ + duyệt L1 · 🟡 PARTIAL

| Field | Value |
|-------|--------|
| **FR / UC** | FR-UC-H03 · FR-UC-M03 · J-MOB-05 |
| **Persona** | `uat.nv####` → QL `manager_id` |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-LV-01** | MOBILE submit | **EVIDENCED** | `po-e2e-spine-02-03-mob-qa-w1.md` |
| **TC-LV-02** | MOBILE approve L1 | **BLOCKED** | J-MOB-05 / qa-device |
| **TC-LV-15** | UI list→detail web | **EVIDENCED** | spine-02 R1 |
| **TC-LV-16** | UNIT bridge | **AUTOMATED** | leave-workflow.bridge.spec |
| **TC-MGR-03** | API filter pending QL | **PLANNED** | phụ thuộc hier |

**U84:** P-LEAVE @ CO-DL = **BLOCKED-EXTERNAL** (0 NV finance) — §3.

---

### 2.8 LV-02 — Ladder L2 theo ngày · ⛔ SPEC_GAP

| Field | Value |
|-------|--------|
| **Gap** | `GAP-LEAVE-LADDER-01` — WF AS-IS **1 bước**; SRS nói hai cấp |
| **Cấm** | Invent ngưỡng `T_L1` / `N` để 🟢 |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-LV-03** | Happy L2 | **SPEC_GAP** | ba-case-matrix §1.3 |
| **TC-LV-04** | Honesty AS-IS 1-step | **EVIDENCED** | ba-case-matrix |
| **TC-HIM-LEAVE-DL-SG-L2-001** | Depth SPEC_GAP | **SPEC_GAP** | HIM matrix |

---

### 2.9 LV-03 — Ốm ≥3 không file · ✅ DONE

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-LV-05** | UI fail-deep | **EVIDENCED** (GWC) | spine-02 w1-r1 + QC |
| **TC-LV-06** | UNIT VAL-ATT | **AUTOMATED** | leave-requests.service |

---

### 2.10 LV-04 — Ốm ≥3 + đính kèm + duyệt · ✅ DONE

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-LV-07** | UI attach+create | **EVIDENCED** (GWC) | same R1 |
| **TC-LV-08** | UNIT path guard | **AUTOMATED** | leave-requests.service |
| **TC-LV-09** | UI approve UX | **EVIDENCED** (GWC) | `r-spine-web-approve-ux-01-qc.md` |
| **TC-UNIT-LEAVE-01/02** | UNIT | **AUTOMATED** | leave-requests.service |

---

### 2.11 LV-05 / LV-06 — Self-approve & scope · ⚪ PLANNED

| TC-ID | UC | Status |
|-------|-----|--------|
| **TC-LV-10** | LV-05 tự duyệt | **PLANNED** |
| **TC-LV-11** | LV-06 sai CT | **PLANNED** |
| **TC-LV-12** | Notice ≥3 ngày lịch | **PLANNED** |
| **TC-LV-13** | Balance | **AUTOMATED** |
| **TC-LV-14** | Overlap | **AUTOMATED** |

---

### 2.12 AT-01 — Điều chỉnh chấm công · 🟡 PARTIAL

| Field | Value |
|-------|--------|
| **FR / UC** | UC-HRM-MOB-06 · UF-HRM-05 |
| **Ghi chú** | Mobile nav GWC ≠ full submit; **Web Primary** @ TMDV đã EVIDENCED (U84) |

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-AT-01** | MOBILE nav | **EVIDENCED** (nav-only GWC) | `r-spine-at-nav-01-qc.md` |
| **TC-AT-02** | MOBILE approve | **BLOCKED** | upstream submit |
| **TC-AT-07** | UNIT | **AUTOMATED** (partial) | attendance-requests.service |
| **TC-HIM-ATT-TMDV-HP-001** | Web Primary submit | **EVIDENCED** | `u78-u84-primary-att-adj-tmdv-01-r2.md` |
| **TC-HIM-ATT-TMDV-AP-001** | Web/mgr Duyệt | **EVIDENCED** | same · `HRM-ATT-REQ-203` |

---

### 2.13 AT-02 / AT-03 · ⚪ PLANNED

| TC-ID | UC | Status |
|-------|-----|--------|
| **TC-AT-03** | AT-02 validation | **PLANNED** |
| **TC-AT-04** | AT-03 records | **PLANNED** |
| **TC-AT-05** | Geofence check-in | **PLANNED** |
| **TC-AT-06** | Check-in regress | **PLANNED** |
| **TC-AT-08** | Web sheet load | **PLANNED** |

---

### 2.14 MGR / FR-UC-H01 — `manager_id` · ✅ DONE (slice)

| TC-ID | Loại | Status | Evidence |
|-------|------|--------|----------|
| **TC-MGR-01** | UI PATCH | **EVIDENCED** | `r-spine-mgr-hier-01-qa-browser.md` |
| **TC-MGR-02** | Label F5 | **EVIDENCED** (P2 residual) | same |
| **TC-MGR-03** | Pending filter QL | **PLANNED** | J-MOB-05 |
| **TC-MGR-04..06** | UNIT self/cross/cycle | **AUTOMATED** | employee-manager.validation |

---

### 2.15 Catalog control (SPINE-04) · ✅ DONE (control)

| TC-ID | Status | Evidence |
|-------|--------|----------|
| **TC-X-03** | **EVIDENCED** | `w1b-03-tc-cat-qa-r1.md` |
| **TC-X-04** | **EVIDENCED** | leave mount LIVE-R1 |
| **TC-X-01** | **PLANNED** | scope parity list↔get |

---

## 3. U84 — Use case theo process × công ty (Primary browser)

Đây là lớp **instance thực tế theo công ty** (không thay spine HP/LV ở trên).

| Process (UC vận hành) | Công ty | UC status | Testcase HP | Testcase AP | Evidence |
|----------------------|---------|-----------|-------------|-------------|----------|
| **P-REC-PLAN** Kế hoạch + duyệt QT | CO-TMDV | ✅ EVIDENCED | TC-HIM-REC-PLAN-TMDV-HP-001 | TC-HIM-REC-PLAN-TMDV-AP-001 | `u78-u84-primary-rec-plan-tmdv-01.md` |
| **P-REC-REQ** YCTD tài xế | CO-TMDV | ✅ EVIDENCED | TC-HIM-REC-REQ-TMDV-HP-001 | TC-HIM-REC-REQ-TMDV-AP-001 | `…-rec-req-tmdv-01-r1.md` |
| **P-REC-REQ** YCTD HDV | CO-VISUN | ✅ EVIDENCED | TC-HIM-REC-REQ-VISUN-HP-001 | TC-HIM-REC-REQ-VISUN-AP-001 | `…-rec-req-visun-01.md` |
| **P-REC-PIPE** Pipeline UV | CO-TMDV | ✅ EVIDENCED | TC-HIM-REC-PIPE-TMDV-HP-001 | TC-HIM-REC-PIPE-TMDV-AP-001 | `…-rec-pipe-tmdv-01.md` |
| **P-LEAVE** Nghỉ L1 | CO-DL | 🔴 BLOCKED-EXTERNAL | TC-HIM-LEAVE-DL-HP-001 | TC-HIM-LEAVE-DL-AP-001 | `r-u84-leave-dl-persona-scope-01.md` |
| **P-ATT-ADJ** Điều chỉnh CC | CO-TMDV | ✅ EVIDENCED | TC-HIM-ATT-TMDV-HP-001 | TC-HIM-ATT-TMDV-AP-001 | `…-att-adj-tmdv-01-r2.md` |
| **P-CAT-EXT** Extension catalog | CO-DL | ✅ EVIDENCED | TC-HIM-CAT-DL-HP-001 | TC-HIM-CAT-HOLD-AP-001 | `…-cat-ext-dl-01.md` |

**Tally Primary:** **6/7** EVIDENCED · **1/7** EXTERNAL · QC GWC `u84-primary-exec-rollup-r2.md`.

**Residual gắn UC**

| ID | Gắn process | Mức |
|----|-------------|-----|
| Leave bootstrap sponsor | P-LEAVE @ CO-DL | C1 — chờ «bootstrap môi trường dev» |
| ATT XBOS inbox | P-ATT-ADJ | C3 GOVERNANCE_LOCK (HRM path OK) |
| HDV catalog proxy | P-REC-REQ VISUN | P2 — dùng OPS_MANAGER |
| GPLX Offer gate | P-REC-PIPE | SPEC_GAP observe |
| Leave L2 | P-LEAVE | SPEC_GAP `TC-HIM-LEAVE-DL-SG-L2-001` |

---

## 4. Spine 53 TC — đếm nhanh (không phải 245 UC Phase1)

| Verdict | Số | Ý |
|---------|---:|---|
| EVIDENCED | **16** | Đã có browser/mobile/GWC |
| AUTOMATED | **16** | Jest — chưa = UF |
| FAIL | **1** | TC-HP-02 |
| BLOCKED | **2** | TC-LV-02 · TC-AT-02 |
| SPEC_GAP | **1** | TC-LV-03 |
| PLANNED | **17** | Chưa wave |

Nguồn: report §1.1.

---

## 5. Depth catalog (menu) — chỉ để biết “đã viết TC chưa”

| Metric | Giá trị |
|--------|--------:|
| Packs SYNTHED | **31** |
| Claimed rows | **1593** |
| Unique TC-IDs | **1473** |
| Browser UAT trên depth | **Chưa** (trừ Primary U84 ở §3) |

Pack index: `docs/qa/testcases/README.md` · roster `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md`.

**Không** đọc 1473 dòng như “UC đã DONE”.

---

## 6. Phase 1 inventory 245 UC — ranh giới trung thực

Ma trận `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` ghi **245 UC** + `impl_status` kỹ thuật (e2e_pass) — **đó không phải** bảng nghiệm thu FE/UAT theo U65/U78 trong chương trình PO hiện tại.

Chương trình test đang điều hành theo:

1. BA cases **HP / LV / AT / MGR** (§1–§2)  
2. Spine **53 TC** (§4)  
3. Primary U84 **7 ô** (§3)  
4. Depth packs = backlog thiết kế (§5)

Muốn map **toàn bộ 245 UC → TC** = wave BA riêng (rất lớn) — chưa có trong SoT này.

---

## 7. Định nghĩa DONE (bắt buộc — đừng đoán)

### 7.1 Ba mức “xong” (không được trộn)

| Mức | Tên | Khi nào được ghi | **Không** được ghi khi |
|-----|-----|------------------|-------------------------|
| **D1** | **UC DONE (slice)** | Happy path **chính** của UC: login đúng persona → menu HDSD → thao tác → **Lưu/Gửi/Duyệt** → Network **2xx** → **FE đổi đúng** → **F5 còn** · có U78 test-log (UI) | Chỉ unit/jest · chỉ API probe · chỉ “route load 200” · còn FAIL/BLOCKED trên happy path |
| **D2** | **UC DONE (full AC)** | D1 **và** fail-deep / scope / self-approve trong BA matrix của UC đều EVIDENCED hoặc AUTOMATED có map | Còn PLANNED nhánh AC đã liệt kê trong BA case |
| **D3** | **Program UAT / Phase1 DONE** | Mọi UC spine P0 đạt D2 + Primary U84 7/7 + QC GO không condition P0 + residual đóng | Catalog depth viết xong · Primary 6/7 · GWC có C1 leave |

**Trong dashboard §1:** icon ✅ = **D1 only** (DONE slice).  
**Không** có UC nào trong file này đang claim **D3**.  
**PARTIAL 🟡** = có D1 một phần hoặc soft residual, **chưa** D2.

### 7.2 Checklist D1 (copy cho QA)

```text
□ Persona đúng UC
□ Click path bám HDSD (U76)
□ Không seed (U65)
□ Mutate trên UI → 2xx đúng mã nghiệp vụ
□ FE sau 2xx đúng AC (row/status/toast)
□ F5 / navigate lại → data còn
□ U78 *-test-log.md + .json (schema xevn-test-log/v1)
□ Evidence path ghi vào catalog + rollup này
```

### 7.3 Mapping nhanh “✅ hiện tại” = mức nào

| UC ✅ | Mức thực | Ghi chú |
|-------|----------|---------|
| HP-01 | D1 | Definition WF — chưa cover mọi BR-WF fail-deep |
| HP-04 | D1→gần D2 | Create+Hire EVIDENCED + DTO unit; reject/self-approve khác UC |
| LV-03 | D1+unit | Fail-deep VAL-ATT |
| LV-04 | D1 | Attach+create+approve UX GWC |
| MGR | D1 | PATCH manager; filter pending QL còn PLANNED |
| U84 Primary cells ✅ | D1 per cell | 6/7 — leave EXTERNAL ≠ D1 |

---

## 8. Chưa DONE — cần làm gì? (theo UC)

| UC | Status | Việc cụ thể | Owner | Blocker |
|----|--------|-------------|-------|---------|
| **HP-02** | 🔴 | Retest `TC-HP-02` trên FE hiện tại (U84 Primary plan/req đã pass — spine có thể stale) → nếu còn FAIL: Dev-FE mount/JobTemplates | qa → dev-fe | Product / evidence stale |
| **HP-03** | 🟡 | Chạy `TC-HP-04` self-approve · ghi `TC-HP-05` policy · optional reject `TC-HP-13` | qa | Không seed inbox |
| **HP-05** | 🟡 | `TC-HP-10` Hợp đồng UI sau hire · soft stamp residual | qa (+dev-fe nếu UI) | — |
| **HP-06** | ⚪ | `TC-HP-11` Lương/payslip thấy NV (hoặc empty hợp lệ có lý do) | qa | Data kỳ lương U65 |
| **LV-01** | 🟡 | (a) Mobile approve `TC-LV-02` / J-MOB-05 · (b) Primary leave CO-DL sau bootstrap | qa-device · qa | (b) **sponsor bootstrap** |
| **LV-02** | ⛔ | SA/BA chốt `T_L1`/`N` + WF 2 bước → rồi mới TC L2 | sa · ba-process | **Sponsor quyết định N** |
| **LV-05/06** | ⚪ | Self-approve + cross-company approve | qa | — |
| **AT-01 mobile** | 🟡 | Full submit+approve mobile (nav GWC ≠ Done) | qa-device · dev-mobile | — |
| **AT-02/03** | ⚪ | Validation + records sau duyệt | qa | — |
| **P-LEAVE U84** | 🔴 EXTERNAL | Bootstrap ≥1 NV + QL trên `finance` → U78 R1 leave DL | devops **chỉ** khi sponsor nói bootstrap · rồi qa | **Sponsor explicit** |
| Depth 1473 TC | design | Wave U78 theo pack ưu tiên (sau spine P0) | qa | Không ưu tiên trước HP-02/LV |

---

## 9. Kế hoạch đóng UC (SoT) — **CÓ**

Program chi tiết: **`docs/program/PO_UC_CLOSURE_PLAN.md`**

| Wave | Mục tiêu | Exit | Phụ thuộc |
|------|----------|------|-----------|
| **W0** | Khóa DoD D1/D2/D3 + rollup này | Docs DONE | — |
| **W1** | Đóng / chốt lại **HP-02** (`TC-HP-02`) | EVIDENCED hoặc FAIL có Dev fix + retest | Không cần sponsor |
| **W2** | PARTIAL → D2 nhẹ: HP-03 fail-deep · HP-05 contracts | TC-HP-04/10 EVIDENCED hoặc BLOCKED honest | W1 song song được |
| **W3** | LV-01 approve mobile (J-MOB-05) + AT-01 mobile submit | TC-LV-02 / AT submit path | Device |
| **W4** | P-LEAVE @ CO-DL Primary | 7/7 Primary · leave EVIDENCED | **Sponsor bootstrap** |
| **W5** | HP-06 · LV-05/06 · AT-02/03 · ladder LV-02 | D2 spine P0 hoặc SPEC_GAP còn lại có owner | W4 + SA cho LV-02 |
| **W6** | QC program honesty → chỉ khi W1–W5 P0 đóng | GWC/GO · **vẫn** có thể chưa D3 full Phase1 | — |

**Hiện tại:** W0 docs **CLOSED** · W1–W6 **HOLD** — chờ sponsor lệnh chạy (không auto-dispatch khi chỉ hỏi).

---

## 10. Pointer / đổi SoT

| Khi | Cập nhật |
|-----|----------|
| QA đóng UC | §1 + §2 + `PO_UC_CLOSURE_PLAN.md` wave status |
| U84 Primary | §3 |
| Đổi định nghĩa DONE | §7 + charter plan §2 |
| Depth synth only | §5 — **không** nâng ✅ UC |

---

*PO-UC-TC-STATUS-ROLLUP-01 · 2026-08-04 · DoD D1/D2/D3 · plan `PO_UC_CLOSURE_PLAN.md` · uat_done=false*
