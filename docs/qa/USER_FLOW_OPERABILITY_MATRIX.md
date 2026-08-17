# User-flow operability matrix — cắm cờ chức năng thao tác thật

**Owner:** PM + QA (cập nhật sau mỗi vòng UAT sponsor / demo khách)  
**Mục đích:** Bám **SRS + TechSpec**, test theo **luồng người dùng** (click → lưu → F5 → kiểm tra), **không** coi seed/unit/API-only là đủ.  
**Tài khoản:** [`PILOT_TEST_ACCOUNTS.md`](./PILOT_TEST_ACCOUNTS.md)  
**Journey map:** [`../program/PROGRAM_JOURNEY_MAP.md`](../program/PROGRAM_JOURNEY_MAP.md)  
**CRUD matrix (API):** [`../program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md`](../program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md)  
**SRS trace (UF→UC→API):** [`USER_FLOW_SRS_TRACE_DELTA.md`](./USER_FLOW_SRS_TRACE_DELTA.md)

---

## 1. Cờ trạng thái (bắt buộc)

| Cờ | Ý nghĩa | Khi nào gán |
|----|---------|-------------|
| 🟢 **USER-OK** | Sponsor/QA thao tác UI end-to-end: nhập → Lưu → F5 → dữ liệu còn | PASS có screenshot + Network POST/PUT 2xx |
| 🟡 **PARTIAL** | Một phần chạy (vd. đọc được, ghi không; hoặc chỉ member unit, không holding) | GWC — ghi rõ bước fail |
| 🔴 **BROKEN** | UI có form nhưng **không persist** / lỗi im lặng / 4xx che bởi toast mơ hồ | Defect P0/P1 + owner |
| ⚪ **N/A** | Không trong scope persona hoặc SRS ghi «chưa triển khai» | Không test |
| ⬜ **UNTESTED** | Chưa có evidence user-flow | QA phải chạy trước demo |

**Quy tắc vàng:** Tab load HTTP 200 **≠** 🟢. Chỉ 🟢 khi **mutate + verify** (Create/Update/Delete theo SRS).

**Tiêu chí nghiệm thu (sponsor lock):** Buổi show khách = **nghiệm thu**, không phải demo một phần. Mọi UF-* **web in-scope** (§3–§4, trừ ⚪ mobile) phải **🟢 trên Dev :8088** + evidence trước khi PM báo sẵn sàng. **Cấm** workaround «chỉ show dòng xanh».

---

## 2. Cách test (user-flow, không seed cheat)

1. Đăng nhập đúng persona (`ceo@xe.vn` / `du-lich.ceo@xe.vn` …).
2. Đi đúng menu SRS (vd. Cài đặt → Thiết lập công ty → Đơn vị thành viên).
3. Thao tác như user: nhập form → **Lưu thay đổi** (hoặc nút xác nhận hàng).
4. **F5** hoặc thoát màn → vào lại → dữ liệu phải còn.
5. DevTools Network: có `POST`/`PUT` 2xx tới API đúng contract TechSpec.
6. Ghi evidence: `docs/qa/evidence/user-flow-{module}-{date}.md` + screenshot.

**FAIL ưu tiên:** mọi 🔴 và 🟡 trước khi claim UAT-ready.

### 2b. UX format lock (project-wide — vi-VN)

**SoT:** [`docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md`](../program/UX_VI_DATE_NUMBER_FORMAT_AC.md) · evidence BA [`ba-ux-vi-format-ac-01-20260720.md`](./evidence/ba-ux-vi-format-ac-01-20260720.md)

| Rule | PASS when |
|------|-----------|
| **Date** | Display/entry user-facing = `dd/MM/yyyy`; datetime = `dd/MM/yyyy HH:mm` |
| **Money / qty MUST** | Thousand grouping **vi-VN while typing**; Network submit = **numeric** (no `"20.000.000"` string) |
| **EXEMPT** | page size, year, 0–100 score/%, chart axis, OTP — **no** thousand group |

QA sau FE waves: checklist trong evidence BA §3 (`QA-UX-VI-FORMAT-01`). Không đánh 🟢 UF chỉ vì HTTP 200 nếu MUST field vẫn raw `type=number` không group (khi wave đã wire field đó).

---

## 3. XBOS Command Center — Cài đặt / Org

| UF-ID | Màn hình / thao tác | Persona | SRS / UC | Cờ | Ghi chú / root-cause |
|-------|---------------------|---------|----------|-----|----------------------|
| **UF-XBOS-01** | Login → vào Command Center | Group CEO | UC-XBOS-AUTH-01 | 🟢 | **Dev8088 browser R1 + R7 label** — UI login→CC; widgets **Việc cần xử lý** / **Chỉ số KPI tập đoàn** (no raw keys) — [Wave1](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) · [QC close](./evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) |
| **UF-XBOS-02** | Chọn đơn vị thành viên (list) | Group CEO | UC-CC-03 | 🟢 | **Dev8088 browser U63** — 5-row list + Chỉnh sửa detail — [Wave1](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-03** | Sửa hồ sơ pháp nhân **đơn vị thành viên** + Lưu | Group CEO | UC-XBOS-ORG-03 | 🟢 | **Dev8088 browser U63** — PUT **200** + toast + F5 list — [Wave1](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-04** | **Thêm cổ đông** + Lưu (nút xanh / Lưu thay đổi) — **đơn vị thành viên** | Group CEO | UC-XBOS-ORG-03 | 🟢 | **Dev8088 browser R3** — POST **201** + **F5** `QA-BRW-R2-SHR-64838` — [§R3](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-05** | **Thêm cổ đông** — màn **TẬP ĐOÀN (holding root)** | Group CEO | UC-CC-P0-01 | 🟢 | **:5173** RET-03-SHR POST **201** + **F5** — [evidence](./evidence/qa-hdsd-mutate-ret-03-shr-20260731.md) · Dev8088 L25 |
| **UF-XBOS-06** | Thêm tài liệu pháp lý + upload + **Xem file 200** | Group CEO | UC-XBOS-ORG-03 | 🟢 | **Dev8088** — upload + GET **200** + **F5** + **Xem :8088** (GWC C1 closed) — [evidence](./evidence/p1-uf-xbos-06-devops-8088-20260620.md) |
| **UF-XBOS-07** | Ma trận RACI member unit — sửa ô + lưu | Group CEO | UC-CC-RACI | 🟢 | **Dev8088 R5 browser** — BDH-001×HĐQT **I→R**; **PUT 200** matrix/cell; **F5 sticky R** — [§R5 UF-07](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-08** | Workflow inbox — Duyệt task | Group CEO | UC-XBOS-WF | 🟢 | **Dev8088 R5 browser** — POST WF **201** `QA-R5-WF-537120` → inbox spawn → complete **201** → F5 — [§R5](./evidence/p1-browser-e2e-xbos-r5-8088-20260620.md) |
| **UF-XBOS-09** | Catalog governance — approve DM | Group CEO | UC-XBOS-CAT | 🟢 | **Dev8088 R7-FINAL** — inbox **(99)** → Chức danh detail → POST approve **201** `XBOS-CAT-201` → **(98)** F5 — [R7-FINAL](./evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md) |
| **UF-XBOS-10** | KPI dashboard rollup | Group CEO | UC-XBOS-KPI | 🟢 | **Dev8088 browser R2 + R7 label** — CC KPI/Task load; no 409 banner; widgets Vietnamese — [§R2](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) · [QC close](./evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) |
| **UF-XBOS-11** | Member CEO — không xem rollup tập đoàn | Member CEO | U28-R2 negative | 🟢 | **Dev8088 browser R2** — **403** gmu + **409** KPI holding — [§R2](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-12** | **Phòng ban** — thêm/sửa/xóa org-units + Lưu | Group CEO | UC-CC-P0-03 · UC-XBOS-ORG-02 | 🟢 | **Dev8088 R4 browser** — POST **201** + F5 `QA-R4-DEPT-20896` — [§R4](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-13** | **Ma trận phân quyền** (Settings) — checkbox + Lưu | Group CEO | UC-CC-P0-04 | 🟢 | **Dev8088 browser R3** — **PUT 200** position-rbac + F5 — [§R3](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-14** | **Catalog CC** — văn bản/đo lường/giá autosave | Group CEO | UC-CC-P0-05 | 🟢 | **Dev8088 R5 browser** — GET holding **200**; PUT autosave **200**; F5 `v1.0-r5-10064` — [retest](./evidence/p1-qa-uf14-8088-retest-20260620.md) · [§R5](./evidence/p1-browser-e2e-xbos-hrm-20260620.md) |
| **UF-XBOS-15** | **Catalog governance** — tạo extension item (HRM DM) | Group CEO | UC-XBOS-CAT-01 | 🟢 | **Dev8088 R7-FINAL** — `QA-R7-UF15-806520` → HRM-SET-209 **201** → approve **201** → F5 label persists — [R7-FINAL](./evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md) |

---

## 4. HRM embed (portal — web wave; mobile ngoài scope :8088)

| UF-ID | Thao tác user | Persona | SRS / J-* | Cờ | Ghi chú |
|-------|---------------|---------|-----------|-----|---------|
| **UF-HRM-01** | Danh sách NV → mở hồ sơ | Group CEO | J-HRM-01/02 | 🟢 | **Dev8088 R4** — list **1107** · `page_size=100` · J-HRM-01 list→detail — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-02** | Tạo / sửa hợp đồng + F5 | Group CEO | J-HRM-03 | 🟢 | **Dev8088 R4** — contracts **1104** rows · D-HRM-CONTRACTS-UI-EMPTY **closed** — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-03** | Tạo / sửa NV (group CEO) | Group CEO | J-HRM-02 | 🟢 | **Dev8088 R4** — profile Đặng Xuân Hà · cross-nav tabs — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-04** | Bảo hiểm — link NV | Group CEO | J-HRM-04 | 🟢 | **Dev8088 R4** — insurance **5** records — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-05** | Chấm công — bản ghi | Group CEO | J-HRM-06 | 🟢 | **Dev8088 R4** — attendance widgets load — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-06** | Lương — phiếu lương | Group CEO | J-HRM-07 | 🟢 | **Dev8088 R4** — payroll onboarding shell — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-07** | Mobile — login → Home | Mobile NV | J-MOB-01 | ⚪ | **Ngoài scope nghiệm thu web :8088** |
| **UF-HRM-08** | Mobile — đăng ký nghỉ + duyệt | NV / QL | J-MOB-03..05 | ⚪ | **Ngoài scope nghiệm thu web :8088** |
| **UF-HRM-09** | Member CEO / HRBP — HRM mutate scope | Member CEO / HRBP | U28-R2 | 🟢 | **Dev8088 R6** — `du-lich.hr@xe.vn` login **201** · HRM embed **18** NV · session persists on GMU **403** — [R6](./evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md) |
| **UF-HRM-10** | **Settings catalogs** — sync XBOS + sửa item | Group CEO | HRM-SC-01..03 | 🟢 | **Dev8088 retest 2026-07-17 PASS** — create `QAFE*` POST **201** → FE row → **F5** + overview `hrmExtensionItems`/`effectiveItems`; edit label F5 PASS (`D-HRM-SET-ITEM-PERSIST-01` CLOSED @63915ed) — [QA](./evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md) · prior FAIL [retest](./evidence/p1-hrm-menu-settings-retest-20260717.md) |
| **UF-HRM-11** | **Metadata queue** — duyệt/từ chối change-request | Group CEO | UC-HRM-26 | 🟢 | **Dev8088 R4** — approve **12→11** + F5 — [R4](./evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-12** | **Tuyển dụng** — tạo/sửa requisition UI + F5 | Group CEO | UC-HRM-22 · J-HRM-05 | 🟢 | **Dev8088 GWC retest 2026-07-17 PASS** (@397ac81) — Thêm/Sửa/Chi tiết present; PATCH status **200** → FE «Đang tuyển» → F5; Đề xuất POST **201** → FE row → F5; J-HRM-05 GET by id **200**; no eval storm / RATE-429 — [QA](./evidence/gwc-hrm-rec-uf12-01-qa-20260717.md) · prior FAIL [menu](./evidence/p1-hrm-menu-recruitment-20260717.md) |
| **UF-HRM-13** | Member CEO — contract/employee mutate UI | Member CEO | UC-HRM-SCOPE-02 | 🟢 | **Dev8088 R6** — `du-lich.ceo@xe.vn` login **201** · HRM **18** NV · scope negatives **403/409** OK — [R6](./evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md) |
| **UF-HRM-16** | **Bảng chấm công** — tạo kỳ + Công chuẩn → list → mở lưới / empty; **cấm** reload storm | Group CEO | UC-HRM-23 · HRM-AT-14 · **J-HRM-06b** | 🟢 | **Dev8088 2026-07-21 PASS** — POST sheet **201** → list row → open weekly settled empty (no forever spinner); records GET idle **0**/10s (storm CLOSED); F5 list persists; 0 Invalid time · U65 — [QA](./evidence/qa-hrm-att-sheet-ac-01-20260721.md) · [QC GWC](./evidence/qc-hrm-att-sheet-ac-01-20260721.md) · [BA AC](./evidence/ba-hrm-att-sheet-ac-01-20260721.md) · promote [UF16](./evidence/qa-uf-hrm-16-promote-01-20260721.md) |
| **UF-HRM-ATT-SIGN** | **Ký chốt bảng công kỳ** — list → mở `submitted` → panel ký → NV/QL/HCNS **Xác nhận** → **Chốt** → F5; **cấm** seed · một nút «Chốt» bypass WF | NV · QL trực tiếp · HCNS | **UC-BP-ATT-11** · **J-HRM-06c** · BR-BP-TS-02 · **AC-ATT-SIGN-04** | ⬜ | **UNTESTED** — BA click path + **AC-ATT-SIGN-UF-01..07** + post-mutation FE sealed; prerequisite **UF-HRM-16** 🟢 + sheet `submitted` (U65); QA when Dev **`READY_FOR_QA`** — [BA UF](./evidence/po-hrm-bp-att-sign-uf-ba-01.md) |

---

## 4b. Full HRM sidebar sweep (UF-HRM-MENU-*) — load / chrome / crash gate

**Sponsor lock:** QA/QC phải phủ **mọi** leaf `AppSidebar` (`apps/web/hrm/src/components/layout/AppSidebar.tsx`), không chỉ UF-HRM-01..13 (mutate samples).  
**Journey:** [`J-HRM-MENU-SWEEP`](../program/PROGRAM_JOURNEY_MAP.md#j-hrm-menu-sweep) · SoT sweep [`qa-hrm-menu-full-sweep-01-20260720.md`](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) · R2 [`…-r2-20260720.md`](./evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md) · QC GWC [`qc-hrm-menu-full-sweep-01-20260720.md`](./evidence/qc-hrm-menu-full-sweep-01-20260720.md) · BA [`ba-hrm-menu-uf-matrix-01-20260720.md`](./evidence/ba-hrm-menu-uf-matrix-01-20260720.md)

**AC chung (mỗi UF-HRM-MENU-*):** (1) route load OK trong embed `?portal=1`; (2) **không** tech chrome user-facing (`GET /…`, `UC-HRM-*`, `Nest API`, `hrm-api`, `XBOS-DM-*`, badge `API`, raw ISO-Z); (3) **không** white-crash / Uncaught RangeError / Sync ERROR / console P0; (4) empty list / Phase-2 stub **được phép** nếu copy nghiệp vụ rõ.  
**Cờ §4b:** 🟢 = **load AC PASS** (khác 🟢 mutate của §4). Persona mặc định: Group CEO `ceo@xe.vn` · `companyId=main`. U65 zero-seed.

| UF-ID | Menu / path | Persona | J-* / note | Local | Dev8088 | AC (browser) + evidence |
|-------|-------------|---------|------------|-------|---------|-------------------------|
| **UF-HRM-MENU-01** | Dashboard `/` | Group CEO | J-HRM-MENU-SWEEP | 🟢 | ⬜ | Load; no GET/ops/UC/Nest chrome; no Sync ERROR — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) · R2 spot PASS |
| **UF-HRM-MENU-02** | Employees `/employees` | Group CEO | J-HRM-02 | 🟢 | ⬜ | Load; list rows; open ≥1 profile — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-02b** | Employee → tab Lương | Group CEO | deep · J-HRM-07 | 🟢 | ⬜ | No Invalid time; no tech badge `API` — R2 PASS · prior FAIL CLOSED |
| **UF-HRM-MENU-03** | Contracts `/contracts` | Group CEO | J-HRM-03 | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-04** | Insurance `/insurance` | Group CEO | J-HRM-04 | 🟢 | ⬜ | Load OK (BHYT alert = business OK) — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-05** | Decisions `/decisions` | Group CEO | — | 🟢 | 🟢 density 2026-07-22 | Load OK; empty «Không có quyết định nào»; create→list→F5 U65 — QC GWC `qc-hrm-g-dec-01-density-01-20260722.md` (**không** = UC-27 product DONE) |
| **UF-HRM-MENU-06** | Recruitment `/recruitment` (+ tabs) | Group CEO | J-HRM-05 | 🟢 | ⬜ | Load; no UC-id chrome; Tin/Ứng viên submenu deep-nav optional — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-07** | Attendance `/attendance` | Group CEO | J-HRM-06 | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-08** | Payroll `/payroll` | Group CEO | J-HRM-07 | 🟢 | ⬜ | Load; **no `hrm-api` label** — R2 PASS · prior FAIL CLOSED |
| **UF-HRM-MENU-09** | Performance `/performance` | Group CEO | — | 🟢 | ⬜ | Load; human-readable cycle dates — R2 PASS |
| **UF-HRM-MENU-10** | AI `/ai` | Group CEO | — | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-11** | Tasks `/tasks` | Group CEO | — | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-12** | Processes `/processes` | Group CEO | — | 🟢 | ⬜ | Load; no internal DM codes — R2 PASS · prior FAIL CLOSED |
| **UF-HRM-MENU-13** | Internal services `/internal-services` | Group CEO | — | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-14** | Tools & equipment `/tools-equipment` | Group CEO | — | 🟢 | ⬜ | Load OK; Phase-2 stub allowed — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-15** | Company `/company` | Group CEO | — | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-16** | Reports `/reports` | Group CEO | — | 🟢 | ⬜ | Load OK — [sweep](./evidence/qa-hrm-menu-full-sweep-01-20260720.md) |
| **UF-HRM-MENU-17** | Settings `/settings` + `/settings-catalogs` + `/employee-metadata` | Group CEO | UF-HRM-10/11 | 🟡 | ⬜ | Load + sync stamp human-readable **PASS** (R2); **P3** metadata workflow ids still visible — QC GWC **C-01** [`qc-hrm-menu-full-sweep-01`](./evidence/qc-hrm-menu-full-sweep-01-20260720.md) |

**Dev8088:** cột ⬜ = chưa promote từ Local sweep; QA optional `QA-HRM-MENU-UF-PROMOTE-8088-01` khi stack `:8088` sẵn sàng. **Không** claim Phase1 DONE từ §4b.

---

## 5. Incident sponsor (2026-06-16)

| Triệu chứng | Màn hình | Cờ | Hành động |
|-------------|----------|-----|-----------|
| Không thêm được cổ đông holding | CC → Cài đặt → TẬP ĐOÀN → Danh sách Cổ đông | 🟢 UF-XBOS-05 | R3 API UUID PASS — L2 browser GWC rail-catalog pscp |
| Không update được gì XBOS/HRM | Toàn portal | 🟢 | Wave closed — residual đóng trước nghiệm thu |

**Nghiệm thu:** Không workaround — mọi UF web §3–§4 phải 🟢 trên `:8088` trước show.

---

## 6. Lịch rà E2E (wave đang chạy)

| Wave | Owner | Phạm vi | Exit |
|------|-------|--------|------|
| **P1-USER-FLOW-WEB-QA-L0** | QA | UF-* web local `:5173` | `user-flow-web-qa-l0-*.md` |
| **P1-USER-FLOW-WEB-QC-L0** | QC | Gate local | GO/GWC/NO-GO |
| **P1-DEPLOY-8088-WEB-UAT-01** | DevOps | Deploy [dev :8088](http://14.225.217.232:8088/) | ✅ L0 + W3 hot-sync (pscp) — UF-XBOS-05/02/09 API PASS |
| **P1-USER-FLOW-WEB-QA-8088** | QA | Retest UF-* trên :8088 | Cột Dev8088 trong evidence |
| **P1-USER-FLOW-WEB-QC-8088** | QC | Gate demo khách | Final cờ matrix |
| **P1-XBOS-HOLDING-SHR-01** | dev-fe | UF-XBOS-05 holding cổ đông | 🟢 TẬP ĐOÀN + regression |
| **P1-HRM-USER-MUTATE-01** | dev-fe + dev-be | UF-HRM-02/03 mutate UI | Không 409/500 save path |

## 7. Cột môi trường (web-only wave)

| Cột | URL | Ghi chú |
|-----|-----|---------|
| **Local** | `http://127.0.0.1:5173` | QA W1 — trước deploy |
| **Dev :8088** | [http://14.225.217.232:8088/](http://14.225.217.232:8088/) | QA W4 — sau DevOps W3 |

Mỗi UF-ID khi PASS phải ghi: `Local=🟢` và/hoặc `Dev8088=🟢` trong evidence (có thể khác nhau nếu deploy stale).

## 8. Checklist action theo màn (web — bắt buộc QA ghi nghiệp vụ)

### Command Center — Cài đặt → Thiết lập công ty

| Action UI | Nghiệp vụ (SRS) | UF-ID |
|-----------|-----------------|-------|
| Đăng nhập | Xác thực JWT tập đoàn | UF-XBOS-01 |
| Chọn đơn vị thành viên | Xem danh sách pháp nhân thành viên | UF-XBOS-02 |
| Sửa tên/MST/địa chỉ + **Lưu thay đổi** | Cập nhật hồ sơ pháp nhân | UF-XBOS-03 |
| **+ Thêm cổ đông** + điền + ✓ / Lưu | Ghi danh sách cổ đông | UF-XBOS-04 / UF-XBOS-05 |
| **+ Thêm tài liệu** + upload | Lưu hồ sơ pháp lý | UF-XBOS-06 |
| Ma trận RACI — sửa ô | Phân quyền RACI đơn vị | UF-XBOS-07 |
| Phòng ban — thêm/sửa/xóa | Cấu trúc org-units | UF-XBOS-12 |
| Ma trận phân quyền Settings | position-rbac matrix | UF-XBOS-13 |
| Catalog CC autosave | Master data CC | UF-XBOS-14 |
| Catalog governance tạo DM | Extension item HRM | UF-XBOS-15 |

### HRM embed (từ Command Center)

| Action UI | Nghiệp vụ | UF-ID |
|-----------|-----------|-------|
| Tab Nhân sự — mở hồ sơ NV | Xem chi tiết NV đúng scope | UF-HRM-01 |
| Tab Hợp đồng — tạo/sửa + lưu | CRUD hợp đồng lao động | UF-HRM-02 |
| Tab Nhân sự — tạo/sửa NV | CRUD nhân viên | UF-HRM-03 |
| Tab Bảo hiểm — drill NV | Liên kết BH ↔ NV | UF-HRM-04 |
| Tab Chấm công — xem bản ghi | Đọc chấm công | UF-HRM-05 |
| Tab Chấm công — tạo/mở bảng kỳ | CRUD bảng chấm công + lưới tuần | UF-HRM-16 · J-HRM-06b |
| Tab Chấm công — ký chốt bảng kỳ | Workflow ký NV/QL/HCNS → chốt (BR-BP-TS-02) | UF-HRM-ATT-SIGN · J-HRM-06c |
| Tab Lương — phiếu lương | Xem payroll | UF-HRM-06 |
| Settings catalogs — sync/sửa | Danh mục HRM từ XBOS | UF-HRM-10 |
| Metadata queue — duyệt | Phê duyệt thay đổi metadata NV | UF-HRM-11 |
| Tab Tuyển dụng — tạo/sửa | CRUD requisition | UF-HRM-12 |
| Sidebar — mọi leaf load (Dashboard…Settings) | Load + no tech chrome + no crash P0 | UF-HRM-MENU-01..17 · J-HRM-MENU-SWEEP |
| Hồ sơ NV → tab Lương (deep) | No Invalid time / no badge `API` | UF-HRM-MENU-02b |

**Dev8088 summary (QC R3 GO + UF-HRM-16 promote):** §3 XBOS **15/15 🟢** · §4 HRM web **12/12 🟢** (2 mobile ⚪) · **Combined sponsor nghiệm thu :8088 GO WITH CONDITIONS 27/27 web** — QC R3 [`p1-browser-e2e-qc-final-r3-8088-20260620.md`](./evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md) · HRM R6 [`p1-browser-e2e-hrm-wave-8088-r6-20260620.md`](./evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md) · Wave 1 XBOS [`p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`](./evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) · **UF-HRM-16** [QA AC](./evidence/qa-hrm-att-sheet-ac-01-20260721.md) · [QC GWC](./evidence/qc-hrm-att-sheet-ac-01-20260721.md) · [promote](./evidence/qa-uf-hrm-16-promote-01-20260721.md). P2 carry non-blocking (batch row, screenshots, upstream pack format). **NOT** Phase1 DONE · **NOT** PROD-READY.

**§4b Local (2026-07-20):** UF-HRM-MENU-01..16 **🟢** load · MENU-17 **🟡** (P3 metadata ids) · Dev8088 **⬜** — BA `BA-HRM-MENU-UF-MATRIX-01` · QC GWC Local only.

**Cập nhật lần cuối:** 2026-08-05 — BA `PO-HRM-BP-ATT-SIGN-UF-BA-01` (§4 **UF-HRM-ATT-SIGN** ⬜ · J-HRM-06c) · prior QA `P1-UF-HRM-16-PROMOTE-01` (UF-HRM-16 🟢).
