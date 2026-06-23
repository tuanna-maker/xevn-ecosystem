# Program journey map — PM orchestration SoT

**Owner:** PM (cập nhật sau mỗi incident / sprint)  
**Mục đích:** PM và QA **không** chỉ kiểm «tab load» — phải biết luồng user thật end-to-end.  
**Liên kết:** `PILOT_BUSINESS_FLOW_MATRIX.md` (L2), rule `uat-production-readiness-orchestration.mdc` (L2.5)

**Cập nhật:** 2026-06-06 — **J-XBOS-11** catalogs U34 + F5 persist QC GWC local (`qc-p1-xbos-w8-20260606.md`); **J-XBOS-01** + **J-XBOS-10** (`qc-p1-xbos-w7-20260606.md`); prior 2026-06-05 **C-RBACQC-05** sync

**Program gate (nip.io):** **C-RBACQC-03 CLOSED** — `phase1:gate --strict` exit **0** (244/245 e2e_pass); A1 capabilities **2/2**; evidence [`p1-phase1-qc-program-gate-03-20260605.md`](../qa/evidence/p1-phase1-qc-program-gate-03-20260605.md). **NOT** Phase 1 DONE / **NOT** PROD-READY.

---

## Persona mặc định UAT

| Persona | Account | Scope JWT | Dùng cho |
|---------|---------|-----------|----------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `company_id=main`, tenant `xevn` | Command Center + HRM embed |
| Member CEO | `du-lich.ceo@xe.vn` / `Xevn@2026` (portal) | member slug (`xe-du-lich`) | Member slice + negatives; **không** `xevn-uat-2026` trên cổng web |
| Mobile NV | `uat.nv0001@xe.vn` / `xevn-uat-2026` | UUID company | HRM mobile **only** (`uat.nv####`) |

---

## Command Center — shell

| J-ID | Journey | From → To | API phụ thuộc | Status |
|------|---------|-----------|---------------|--------|
| J-CC-01 | Login tập đoàn | `/login` → `/command-center` | XBOS auth, JWT 86400 | ✅ L2 |
| J-CC-02 | Chọn đơn vị / holding shareholder | Settings → group-member-units → TẬP ĐOÀN → Chỉnh sửa → Danh sách Cổ đông → green ✓ POST | `tenant-scope/group-member-units` 200; POST `/legal-entities/{uuid}/shareholders` **201** `XBOS-SHR-201` | ✅ L2 · L2.5 browser :8088 **✅** 2026-06-20 §final2 (full src pscp + rail-ctx fix — [`p1-qa-8088-l25-cc-rail-20260620.md`](../qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md)) |
| J-CC-03 | KPI rollup | CC dashboard load | kpi-engine rollup, không 409 | ✅ L2 |

---

## HRM embed — tab load (L2 = P-CC-03..08)

| P-CC | Route | Module |
|------|-------|--------|
| 03 | `/command-center/hrm/employees` | Nhân sự list |
| 04 | `/command-center/hrm/contracts` | Hợp đồng list |
| 05 | `/command-center/hrm/insurance` | Bảo hiểm |
| 06 | `/command-center/hrm/recruitment` | Tuyển dụng |
| 07 | `/command-center/hrm/attendance` | Chấm công |
| 08 | `/command-center/hrm/payroll` | Lương |

---

## HRM embed — cross-navigation (L2.5 = bắt buộc QA)

| J-ID | Journey | Steps | Scope note | Status |
|------|---------|-------|------------|--------|
| **J-HRM-01** | **Hợp đồng → Hồ sơ NV** | P-CC-04 list → click tên NV → `/employees/:id` | `GET /employees/:id?company_id=main` phải rollup như list (ADR C2) | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| **J-HRM-02** | Nhân sự list → Hồ sơ | P-CC-03 → row → detail | Same scope parity | ✅ API PASS · group CEO C/U/D nip.io 2026-06-05 · browser L2.5 **GWC** (**C-EMPGRPQC-01**) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) |
| J-HRM-03 | Hợp đồng → tab chi tiết HĐ | P-CC-04 → open contract drawer/modal | contracts-insurance API | ✅ PASS · H12 browser 2026-06-06 · [`p1-hrm-h12-journey-qa-20260606.md`](../qa/evidence/p1-hrm-h12-journey-qa-20260606.md) · QC H11 [`qc-p1-hrm-h11-closeout-20260606.md`](../qa/evidence/qc-p1-hrm-h11-closeout-20260606.md) |
| J-HRM-04 | Bảo hiểm → NV linked | P-CC-05 → employee link | insurance + employee scope | ✅ PASS · J04 retest 2026-06-06 · H13 ins-summary regression · [`p1-hrm-h13-ins-summary-qa-20260606.md`](../qa/evidence/p1-hrm-h13-ins-summary-qa-20260606.md) · QC H13 regate [`qc-p1-hrm-h13-regate-20260606.md`](../qa/evidence/qc-p1-hrm-h13-regate-20260606.md) |
| J-HRM-05 | Tuyển dụng → ứng viên/requisition | P-CC-06 → detail | recruitment API | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) |
| J-HRM-06 | Chấm công → bản ghi / yêu cầu | P-CC-07 → detail | attendance scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · **HTTPS pilot** [R6](docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md) [QC GWC](docs/qa/evidence/qc-https-j-hrm-06-01-r6-20260529.md) |
| J-HRM-07 | Lương → phiếu lương | P-CC-08 → payslip detail | payroll scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · H1–H7 browser retest 2026-06-06 · QC GWC [`qc-p1-hrm-h1-7-20260606.md`](../qa/evidence/qc-p1-hrm-h1-7-20260606.md) |
| J-HRM-08 | Catalog governance approve | P-CC-09 → inbox → approve | XBOS write scope strict | ✅ S2 |

**FAIL pattern (P0):** UI «Không tìm thấy nhân viên», console **404** trên `GET /employees/:id` với `company_id=main`.

---

## HRM embed — avatar display (W4)

| J-ID | Journey | Status |
|------|---------|--------|
| **J-AVT-01** | Web — employees list + profile **holding `<img>`** (TCN-0954) | ✅ **PASS** nip.io L2.5 · QA R4 [`pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`](../qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md) · QC **GO (scoped)** [`pcomp-w4-qc-avatar-display-r4-20260607.md`](../qa/evidence/pcomp-w4-qc-avatar-display-r4-20260607.md) |
| J-AVT-02 | Mobile — avatar upload + display (native picker) | ✅ **device PASS** QC CLOSED · QA R4 [`pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md) · QC [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md) · **C-W4QC-AVT-MOB-01/02 CLOSED** · **C-W7QC-DEVICE-01 CLOSED** |

---

## Mobile (L2.5)

| J-ID | Journey | Status |
|------|---------|--------|
| J-MOB-01 | Login → scope select → home | ✅ smoke · health **200** · UUID on panel [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) · localhost API H9/H11 2026-06-06 · QC H11 [`qc-p1-hrm-h11-closeout-20260606.md`](../qa/evidence/qc-p1-hrm-h11-closeout-20260606.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-02 | Check-in GPS | ✅ smoke · localhost API H9/H11 2026-06-06 · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-03 | Leave list → **row tap** → detail | ✅ **PASS** device R4 · `uat.nv0001@xe.vn` · [`p1-phase1-qa-mob-jmob-20260604-r4.md`](../qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md) · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-04 | Payslip list → **detail tap** | ✅ **PASS** strict R4 · Thực lĩnh · push-guard APK 2026-06-04 · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-05 | Manager approvals → **Duyệt** | ✅ **PASS** strict R4 · Thành công (no raw **HRM-ATT-REQ-203**) · qual seed if `pending=0` · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-06 | Login → Home **«Việc cần làm»** visible | ✅ **device PASS** scroll regression · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-07 | Manager Home **«Cần duyệt (n)»** card | ✅ **device PASS** mgr=2 · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) |
| J-MOB-08 | Home → **Sinh nhật hôm nay** (horizontal avatars, no birth year) | ✅ **device PASS** · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 rich cards regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-09 | Home → **Ai nghỉ hôm nay** → tap → LeaveRequestDetail | ✅ **device PASS** QC CLOSED · [`pcomp-w7-qc-hub-r3-05-detail-20260609.md`](../qa/evidence/pcomp-w7-qc-hub-r3-05-detail-20260609.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-17 | Profile **Hồ sơ** → segmented tabs **Thông tin / Công việc / Tài liệu** + task card | ✅ **device CLOSED** MOB-UX-09 [`qc-mob-ux-09-profile-tabs-20260609.md`](../qa/evidence/qc-mob-ux-09-profile-tabs-20260609.md) · QA [`mob-ux-09-profile-tabs-qa-20260609.md`](../qa/evidence/mob-ux-09-profile-tabs-qa-20260609.md) · Z-P06 SET E · GWC **D-MOB-UX09-IA-01** root tab relabel backlog · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-11..15 | Home **portal shell** (header, carousel, grid, payslip feed) | ✅ **device PASS** J-MOB-11..15 · MOB-UX-08 U53 scroll+headers [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · prior [`pcomp-w8-mob-home-portal-qc-02-20260608.md`](../qa/evidence/pcomp-w8-mob-home-portal-qc-02-20260608.md) · GWC **C-W8-DEVICE-01** + **D-W8-ESS-PROMISE-01** · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-19..22 | Home **ESS layer** (role header, date, stats, 4 cards, announcements) | ✅ **device PASS** QC GWC · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · condition D-W8-ESS-PROMISE-01 · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-23..29 | Leave UX polish (inline approve, My Leaves tabs+balance, form) | ✅ **device PASS** QC CLOSED · QA R4 [`pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md) · QC [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md) · prior R3 [`pcomp-w8-mob-ess-leave-01-r3-20260609.md`](../qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.md) · **D-W8-MOB-BAL-UI-01 CLOSED** J-MOB-25/28 numeric 8/3 · **umbrella MOB-UX-11 gate GWC** J-MOB-24/29 [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-30 | Team directory tab + row→detail | ✅ **device CLOSED** MOB-W7-5 [`qc-mob-w7-5-directory-final-20260609.md`](../qa/evidence/qc-mob-w7-5-directory-final-20260609.md) — list + badges @ nip.io trsport · **ext ✅ row→detail CLOSED** R-DIR-DETAIL-01 [`qc-r-dir-detail-01-20260609.md`](../qa/evidence/qc-r-dir-detail-01-20260609.md) · prior UI [`qc-mob-ux-08-team-20260609.md`](../qa/evidence/qc-mob-ux-08-team-20260609.md) · **GWC-DIR-NIP-01** + **GWC-DIR-ROWS-01** lifted · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-31..35 | ZenHR polish (pending strip, action grid, **FAB**, salary hero, timeline) | ✅ **umbrella MOB-UX-11 gate CLOSED** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) · **J-MOB-31/33** MOB-UX-10-P0 [`qc-mob-ux-10-p0-20260609.md`](../qa/evidence/qc-mob-ux-10-p0-20260609.md) · **J-MOB-32 ✅ device CLOSED** MOB-UX-10a [`qc-mob-ux-10a-20260609.md`](../qa/evidence/qc-mob-ux-10a-20260609.md) · **J-MOB-34** MOB-UX-11a-10c [`qc-mob-ux-11a-10c-20260609.md`](../qa/evidence/qc-mob-ux-11a-10c-20260609.md) · **J-MOB-35 ✅ device CLOSED** MOB-UX-10d [`qc-mob-ux-10d-20260609.md`](../qa/evidence/qc-mob-ux-10d-20260609.md) · **J-MOB-35 ext ✅ device CLOSED** MOB-UX-11d SET F-4 [`qc-mob-ux-11d-20260609.md`](../qa/evidence/qc-mob-ux-11d-20260609.md) · **MOB-UX-11f** motion [`qc-mob-ux-11f-20260609.md`](../qa/evidence/qc-mob-ux-11f-20260609.md) |

---

## XBOS / workflow (Phase 1 partial)

| J-ID | Journey | Status |
|------|---------|--------|
| J-XBOS-01 | Workflow inbox → approve (`POST …/complete` **XBOS-WF-200**) | ✅ L2.5 PASS local browser · [`p1-xbos-w7-wf-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w7-20260606.md`](../qa/evidence/qc-p1-xbos-w7-20260606.md) |
| J-XBOS-02 | Catalog publish → HRM sync | ✅ API L2.5 PASS · [`p1-s5-qa-jxbos-02-retest-20260605.md`](../qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md) |
| J-XBOS-03 | CC Settings → Đơn vị thành viên → legal save → F5 round-trip | ✅ L2 PASS local `:5173` · [`p1-xbos-w1-legal-audit-20260606.md`](../qa/evidence/p1-xbos-w1-legal-audit-20260606.md) · QC GWC [`qc-p1-xbos-w1-20260606.md`](../qa/evidence/qc-p1-xbos-w1-20260606.md) |
| J-XBOS-04 | Legal entity → Cổ đông + Tài liệu CRUD persist | ✅ L2 PASS local (SHR fix) · [`p1-xbos-w1-shr-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w1-shr-qa-retest-20260606.md) · D-W1-SHR-01 closed |
| J-XBOS-05 | Infrastructure foundation → scope → sites + custom fields | ✅ L2 PASS `:8088` wizard wave · QC GWC [`p1-infra-fcat-qc-20260620.md`](../qa/evidence/p1-infra-fcat-qc-20260620.md) · QA [`p1-infra-fcat-wizard-qa-20260620.md`](../qa/evidence/p1-infra-fcat-wizard-qa-20260620.md) · prior local [`p1-xbos-w2-infra-fix-20260606.md`](../qa/evidence/p1-xbos-w2-infra-fix-20260606.md) |
| J-XBOS-06 | Dept template save → Chi tiết → Tham chiếu Khung đã lưu | ✅ L2 PASS local · QC GWC [`qc-p1-xbos-w3-20260606.md`](../qa/evidence/qc-p1-xbos-w3-20260606.md) · evidence [`p1-xbos-w3-dept-regression-20260606.md`](../qa/evidence/p1-xbos-w3-dept-regression-20260606.md) · D-U31-DEPT-REF-SYNC-01 closed |
| J-XBOS-07 | Phòng/Ban pháp nhân — add node → F5 persist | ✅ L2 PASS local R2 · [`p1-xbos-w4-dept-tree-retest-20260606.md`](../qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md) · QC GWC [`qc-p1-xbos-w4-20260606.md`](../qa/evidence/qc-p1-xbos-w4-20260606.md) |
| J-XBOS-08 | Danh mục NS sync → HRM read-back | ✅ L2 PASS local · QC GWC [`qc-p1-xbos-w5-hrm-cat-20260606.md`](../qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md) · evidence [`p1-xbos-w5-hrm-cat-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md) · D-W5-HRM-CAT-SYNC-01 closed |
| J-XBOS-09 | Phân quyền — toggle → debounce → F5 matrix sticky | ✅ L2 PASS local · [`p1-xbos-w6-rbac-audit-20260606.md`](../qa/evidence/p1-xbos-w6-rbac-audit-20260606.md) · QC GWC [`qc-p1-xbos-w6-20260606.md`](../qa/evidence/qc-p1-xbos-w6-20260606.md) |
| J-XBOS-10 | Workflow: tạo → lưu → list consumer sync (U34, no F5) | ✅ L2 PASS local · [`p1-xbos-w7-wf-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w7-20260606.md`](../qa/evidence/qc-p1-xbos-w7-20260606.md) |
| J-XBOS-11 | Văn bản / Đo lường / Giá — edit → debounce → U34 + F5 DB persist | ✅ L2.5 PASS local · [`p1-xbos-w8-catalogs-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w8-catalogs-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w8-20260606.md`](../qa/evidence/qc-p1-xbos-w8-20260606.md) · D-W8-CAT-SCOPE-01 closed |
| J-XBOS-12 | Yêu cầu tài sản — create → U34 list sync → transition (KT 5 bước) | ✅ L2 PASS local · U34 consumer sync · [`p1-xbos-w9-asset-audit-20260606.md`](../qa/evidence/p1-xbos-w9-asset-audit-20260606.md) · QC GWC [`qc-p1-xbos-w9-20260606.md`](../qa/evidence/qc-p1-xbos-w9-20260606.md) |

---

## PM dispatch checklist (mỗi wave QA)

- [ ] Liệt kê J-* in-scope trong Task prompt
- [ ] Account = `ceo@xe.vn` cho CC/HRM embed
- [ ] Evidence path + screenshot/console cho mỗi J-* FAIL
- [x] Cập nhật cột Status bảng này sau verdict (J-HRM-01..07 — `P1-EX-PM-01` 2026-05-26)

---

## Incident log

| Date | J-ID | Symptom | Root cause | Fix / governance |
|------|------|---------|------------|------------------|
| 2026-05-24 | J-HRM-01 | 404 employee from contracts | `getEmployeeById` exact `main`, list đã rollup | BE scope parity + rule U19 + matrix J-* |
| 2026-05-26 | J-HRM-01..07 | Map ⏳ vs QA **7/7 PASS** (EX-R07) | Governance drift post W5B | PM `P1-EX-PM-01` — SoT → ✅ PASS; evidence `p1-ex-pm-01-20260526.md` |
| 2026-05-31 | J-MOB-03..05 | Device empty + **HRM-AUTH-001** vs pilot data | Installed APK sends **`x-company-id: main`**; MOB-HEADER release APK not installed | `P1-P100-W10-DEVICE-01` FAIL → PM dispatch APK-01 + device retest |
| 2026-05-31 | J-MOB-03..05 | MOB-HEADER APK installed; lists still **HRM-AUTH-001** | Home panel shows UUID but outbound/list still **`main`** slug + 403 | `P1-P100-W10-DEVICE-02` FAIL → `P1-P100-W10-MOB-HEADER-02` dev-mobile |
| 2026-06-04 | J-MOB-03..05 | R1–R4 device waves | BE scope + FE payslip/approve + push guard + VPS qual hook | **PASS** strict R4 · [`p1-phase1-qa-mob-jmob-20260604-r4.md`](../qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md) |
| 2026-06-05 | J-HRM-02 / J-XBOS-01 | Journey map vs matrix drift post strict gate | **C-RBACQC-05** — BA sync `P1-PHASE1-BA-JOURNEY-SYNC-06`; statuses unchanged (API PASS · browser GWC optional) |
| 2026-06-06 | J-XBOS-05 | QC f5ebebe1 4b GWC vs QA 392d4aa0 VISUN PASS | Duplicate evidence paths | PM SoT: authoritative retest on `p1-xbos-w2-infra-fix-20260606.md`; C-W2QC-01 waived — no dev dispatch |
| 2026-06-20 | J-XBOS-05 | FCAT wizard + consumer bind on `:8088` | Inline list pollution + missing consumer field | FE wizard + consumer bind; QC GWC `p1-infra-fcat-qc-20260620.md` — R-QA-FCAT-02 waived P2; R-QA-FCAT-03 deferred |
| 2026-06-06 | J-XBOS-12 | Row missing pre-W9 QC (**SPEC-GAP-J-XBOS-12**) | Wave plan referenced journey before map sync | QC gate `qc-p1-xbos-w9-20260606.md` added row; BA may enrich narrative |
| 2026-06-06 | J-HRM-07 / H1–H7 | Web audit FAIL → FE fix → tasks `page_size=300` 400 | `useTasks` over API max | Tasks fix + QA retest PASS · QC GWC `qc-p1-hrm-h1-7-20260606.md` — localhost U32 only |
| 2026-06-06 | J-MOB-01..05 | H9 func audit — no adb device | API probe + vitest only | **PASS** localhost API · device deferred **C-MOB-H9-DEVICE-01** · QC GWC `qc-p1-hrm-h1-7-20260606.md` |
| 2026-06-06 | J-HRM-04 | H12 browser FAIL → FE fix → retest PASS | `employee_id` absent on API row | **D-HRM-J04-CLICK-01 CLOSED** · `p1-hrm-h12-j04-qa-20260606.md` · **C-HRMQC-H11-J04 CLOSED** · QC regate `qc-p1-hrm-h11-regate-20260606.md` |
| 2026-06-06 | J-HRM-04 / P-CC-05 | H13 ins-summary + AC-FID slugs batch | Summary cards «-» · slug contract_ratio | **D-HRM-INS-SUMMARY-01 CLOSED** · **R-H10-01 CLOSED** · **AC-FID-03 CLOSED** · QC H13 regate `qc-p1-hrm-h13-regate-20260606.md` — J-HRM **7/7** localhost U32 |
| 2026-06-06 | J-HRM-03 | H12 browser PASS — contract Eye → detail | Prior drawer gap | **D-HRM-J03-DRAWER-01 CLOSED** · QC H11 closeout |
