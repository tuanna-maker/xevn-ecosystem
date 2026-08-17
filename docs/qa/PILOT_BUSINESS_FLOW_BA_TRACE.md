# Pilot business flow — BA process trace (L2)

**work_item_id:** `P1-S0-BA-P-01`  
**program:** `PHASE1-SCRUM-S0`  
**from_role:** ba-process  
**to_role:** pm  
**ack_status:** `PASS_TO_PM`  
**matrix:** [`PILOT_BUSINESS_FLOW_MATRIX.md`](PILOT_BUSINESS_FLOW_MATRIX.md)  
**account:** `ceo@xe.vn` / `Xevn@2026` · base `http://localhost:5175`

## 1. Process objective and actors

| Actor | Vai trò trong pilot |
|-------|---------------------|
| CEO tập đoàn | `ceo@xe.vn` — membership master `tenantId=xevn`, `companyId=main` |
| QA | Thực thi L2 browser matrix P-CC-05..08; ghi `docs/qa/evidence/pilot-business-flow-YYYYMMDD.md` |
| Dev-FE | Portal `HrmWorkspacePanel` + iframe HRM (`?portal=1`); Supabase→Nest trên embed |
| Dev-BE | Scope resolver, envelope `HRM-*` / `SCOPE_*` |

**Mục tiêu (S0):** Gói acceptance **implementation-ready** cho P-CC-05..08: nhánh happy / alternate / exception xác định, map **UC-HRM-22..25**, ma trận quy tắc nghiệp vụ đo được — PM dispatch QA (`P1-S0-QA-01`) không cần BA bổ sung nhánh.

**Hai surface kiểm tra mỗi route 05..08:**

| Surface | Component | QA ưu tiên |
|---------|-----------|------------|
| **A — Portal cockpit** | `HrmWorkspacePanel` (`view=insurance|recruitment|attendance|payroll`) | Network tới `VITE_HRM_API_ORIGIN` qua `hrmApiClient.ts` |
| **B — HRM iframe** | `HrmWorkspaceRoute` → `/hr/{view}?portal=1&tenantId=xevn&companyId=main` | Console :54321; `shouldSkipSupabaseDataFetches()` trên page |

## 2. Cross-cutting business rules (mọi P-CC HRM embed)

| Mã | Điều kiện | Hành động | Kết quả | Mã lỗi / HTTP |
|----|-----------|-----------|---------|----------------|
| BR-SCOPE-01 | Gọi HRM qua portal | `x-tenant-id` + `x-company-id` khớp JWT (`main` cho CEO tập đoàn) | API resolve scope | — |
| BR-SCOPE-02 | `company_id` query/header ≠ JWT `companyId` | BE từ chối | **409** | `SCOPE_CONTEXT_MISMATCH` |
| BR-SCOPE-03 | iframe query `companyId=xevn` khi JWT `main` | FE override → `main` (`resolveHrmSpreadsheetScope`) | Tránh 409 trên load | — |
| BR-MOCK-01 | API **200** + `data` rỗng | Empty state có copy; **không** mock array khi `allowMockFallback()` false | PASS alternate | — |
| BR-MOCK-02 | HTTP 4xx/5xx / network / timeout 10s | Banner ERROR (`API_LOAD_FAILED_MESSAGE`); **không** empty im lặng | FAIL exception | envelope `code` |
| BR-DATA-01 | Pilot stack | **Không** bắt buộc `127.0.0.1:54321` trên **load** route | FAIL nếu `ERR_CONNECTION_REFUSED` | — |
| BR-PAGE-01 | `page_size` list (employees) | ≤ **100** | 400 nếu >100 | `HRM-VAL-001` |
| BR-AUTH-01 | Thiếu JWT / internal key | BE từ chối module | **401** | `HRM-AUTH-001` |
| BR-PORTAL-01 | `resolveIdentityScope` fail trước iframe | Không mount iframe; banner đỏ scope | FAIL trước L2 API | `SCOPE_*` UI |

**SRS:** `docs/hrm/SRS.md` §13; `docs/ecosystem/SRS.md` §8.1 (`SCOPE_CONTEXT_MISMATCH`).

## 3. Matrix row → UC / SRS / API (P-CC-05..08 focus)

| Matrix ID | Route | UC-ID | SRS | API chính (Surface A) | Surface B (iframe) |
|-----------|-------|-------|-----|----------------------|-------------------|
| P-CC-05 | `/command-center/hrm/insurance` | **UC-HRM-25** (BHXH) | §13 UC-HRM-25 | `GET /api/hrm/contracts-insurance/contracts?company_id=main` (portal proxy HĐ→BHXH) · optional `GET .../insurance/expiring` | `/hr/insurance` — **Supabase** (`Insurance.tsx`) |
| P-CC-06 | `/command-center/hrm/recruitment` | **UC-HRM-22** | §13 UC-HRM-22 | `GET /api/hrm/recruitment/requisitions?company_id=main` → `HRM-REC-200` | `/hr/recruitment` — chưa `shouldSkipSupabase` |
| P-CC-07 | `/command-center/hrm/attendance` | **UC-HRM-23** | §13 UC-HRM-23 | `GET /api/hrm/attendance/records?company_id=` (UUID/slug resolved) → `HRM-ATT-200` | `/hr/attendance` — hooks Supabase phụ (departments) |
| P-CC-08 | `/command-center/hrm/payroll` | **UC-HRM-24** | §13 UC-HRM-24 | `GET /api/hrm/payroll/payslips?company_id=main` → `HRM-PAY-200` | `/hr/payroll` — chưa `shouldSkipSupabase` |

**Catalog:** `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` (#346–349). **Client FR:** `FR-UC-HRM-22..25` trong `docs/client-delivery/02_SRS_XeVN_OS.html`.

**Embed:** `HrmWorkspaceRoute` → `hrmProxyPath(view, { portal: true, tenantId, companyId })` — `apps/web/web-portal/src/modules/hrm/HrmWorkspaceRoute.tsx`.

## 4. UC-HRM-22..25 — branch catalog (QA script backbone)

### UC-HRM-22 — Embed tuyển dụng (P-CC-06)

| Branch ID | Loại | Điều kiện kích hoạt | Luồng | Kết quả đo được |
|-----------|------|---------------------|-------|-----------------|
| UC22-H1 | Happy | Auth OK; scope `main`; DB có ≥1 requisition | A: panel load → `listHrmJobRequisitions` | HTTP **200**, `code=HRM-REC-200`, bảng ≥1 row (`title`, `status` VI) |
| UC22-A1 | Alternate | Auth OK; `data=[]`, `total=0` | A hoặc B | Empty state + **200**; không `HRM_MOCK_RECRUITMENT` khi prod policy |
| UC22-E1 | Exception | `company_id` ≠ JWT (probe `xevn`) | Negative API | **409** `SCOPE_CONTEXT_MISMATCH` |
| UC22-E2 | Exception | Không auth | API | **401** `HRM-AUTH-001` |
| UC22-E3 | Exception | HRM down / envelope invalid | A catch | Banner `API_LOAD_FAILED_MESSAGE`; `hrmDataSource=error` |
| UC22-E4 | Exception | iframe B + Supabase required | Console | `ERR_CONNECTION_REFUSED` :54321 → **FAIL** BR-DATA-01 |

### UC-HRM-23 — Embed chấm công (P-CC-07)

| Branch ID | Loại | Điều kiện | Luồng | Kết quả |
|-----------|------|-----------|-------|---------|
| UC23-H1 | Happy | Scope OK; có `attendance_records` | `GET .../attendance/records` | **200** `HRM-ATT-200`; cột `attendance_date`, `status` |
| UC23-A1 | Alternate | `data=[]` | Panel/iframe list | Empty + **200** |
| UC23-A2 | Alternate | Filter `status`, `from_date`/`to_date` (API) | Query optional | Subset hợp lệ hoặc empty+200 |
| UC23-E1 | Exception | Scope mismatch | Probe | **409** |
| UC23-E2 | Exception | `attendance_date` epoch 0 trên UI | Render | Ngày **01/01/1970** → **FAIL** data quality |
| UC23-E3 | Exception | `company_id` invalid UUID khi BE strict | Query | **400** `HRM-VAL-001` (class validation) |
| UC23-E4 | Exception | Network | A/B | BR-MOCK-02 |
| **UC23-S1** (ADD) | Happy sheet | Create sheet kỳ + Công chuẩn | `POST …/attendance-sheets` **201** `HRM-AS-201` → list row | AC-ATT-SHEET-01 |
| **UC23-S2** (ADD) | Happy/Alt open | Open sheet | Grid data **hoặc** empty + lý do | AC-ATT-SHEET-02 |
| **UC23-S3** (ADD) | Exception storm | List hoặc weekly load | ≤2 GET / URL / 10s; no Abort×N | AC-ATT-SHEET-04/06 |
| **UC23-S4** (ADD) | F5 | After create | Sheet còn; kỳ đúng | AC-ATT-SHEET-05 |

**Ghi chú:** Mobile check-in (UC-HRM-MOB-04) **ngoài** P-CC-07 nhưng cùng bảng `attendance_records` — L1 UAT P3. **Sheet CRUD** = **HRM-AT-14** / **J-HRM-06b** / **UF-HRM-16**.

### UC-HRM-24 — Embed lương (P-CC-08)

| Branch ID | Loại | Điều kiện | Luồng | Kết quả |
|-----------|------|-----------|-------|---------|
| UC24-H1 | Happy | Scope OK; có payslip seed | `GET .../payroll/payslips?company_id=main` | **200** `HRM-PAY-200`; hiển thị `period_label`, `net_amount` |
| UC24-A1 | Alternate | `data=[]` | Panel payroll view | Empty + **200** |
| UC24-E1 | Exception | Scope mismatch | Probe | **409** |
| UC24-E2 | Exception | API fail | A | BR-MOCK-02; không mock salary khi `allowMockFallback()` false |
| UC24-E3 | Exception | iframe Supabase payroll tables | B | 54321 on load → **FAIL** |

### UC-HRM-25 — Embed HĐ + BHXH (P-CC-04, P-CC-05)

| Branch ID | Loại | Route | Điều kiện | Kết quả |
|-----------|------|-------|-----------|---------|
| UC25-H1 | Happy | P-CC-04 contracts | Có HĐ | `GET .../contracts-insurance/contracts` **200** `HRM-CON-200` |
| UC25-H2 | Happy | P-CC-05 insurance (A) | Portal panel `view=insurance` | Cùng API contracts → map cột BHXH (`regime`, `period`) |
| UC25-A1 | Alternate | 04/05 | 0 HĐ, API 200 | Empty + **200** |
| UC25-A2 | Alternate | 05 expiring alert | `GET .../insurance/expiring?company_id=main` | **200** `HRM-CON-200` (widget; không thay list chính) |
| UC25-E1 | Exception | 04/05 | Scope mismatch | **409** |
| UC25-E2 | Exception | 04 | `settings-catalogs` fail | **409**/5xx rollup | FAIL nếu empty che lỗi (đã fix C1–C6) |
| UC25-E3 | Exception | 05 iframe B | `Insurance.tsx` Supabase | **FAIL** BR-DATA-01 (HRM-EMBED-D5) |
| UC25-E4 | Gap | 05 | Không có `GET .../insurance` list đầy đủ | Chỉ `insurance/expiring` + POST; QA ghi **GAP-BHXH-LIST** nếu product yêu cầu list BHXH native |

**Phụ thuộc nghiệp vụ (governance, không FK):** Chấm công đóng kỳ → ảnh hưởng payslip display; tuyển dụng → nhân sự mới — cùng `company_id` scope.

## 5. Flow branches per matrix row (P-CC-05..08 — L2 chi tiết)

### P-CC-05 — Bảo hiểm (UC-HRM-25 / UC25-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng đo được | TC-ID |
|-------|---------|-----------|-----------------|-------|
| Happy | A | Seed có HĐ/BHXH | `contracts-insurance/contracts` **200**; panel ≥1 row; không ERROR banner | TC-BAP-05-H-A |
| Happy | B | FE migrate D5 (post P1-S0-FE-01) | iframe load không 54321; hoặc Nest list khi có API | TC-BAP-05-H-B |
| Alternate | A | 0 row, 200 | Empty copy BHXH; không mock `HRM_MOCK_INSURANCE` | TC-BAP-05-A-A |
| Alternate | A | Expiring widget | `insurance/expiring` **200** (optional) | TC-BAP-05-A-EXP |
| Exception | A/B | Probe scope `xevn` | **409** không trên request **chính** load | TC-BAP-05-E-SCOPE |
| Exception | B | Supabase-only (hiện trạng) | Console `ERR_CONNECTION_REFUSED` :54321 | TC-BAP-05-E-54321 |
| Exception | A | API 5xx | Banner ERROR | TC-BAP-05-E-API |

**QA ghi actual:** Portal hiển thị HĐ mapped as BHXH (R-02) — PASS nếu PM chấp nhận proxy; FAIL product nếu yêu cầu `employee_insurance_records`.

### P-CC-06 — Tuyển dụng (UC-HRM-22 / UC22-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có TT | `recruitment/requisitions` **200** `HRM-REC-200`; cột Chiến dịch | TC-BAP-06-H-A |
| Happy | B | Post API mode embed | Không 54321; data từ Nest hoặc empty+200 | TC-BAP-06-H-B |
| Alternate | A/B | 0 TT, 200 | Empty + **200** | TC-BAP-06-A |
| Exception | A/B | Scope 409 load | FAIL blocker | TC-BAP-06-E-SCOPE |
| Exception | A | `hrmDataSource=error` | Banner; mock chỉ khi dev fallback enabled | TC-BAP-06-E-API |
| Exception | B | Recruitment page Supabase | 54321 on load → FAIL | TC-BAP-06-E-54321 |

### P-CC-07 — Chấm công (UC-HRM-23 / UC23-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có bản ghi | `attendance/records` **200** `HRM-ATT-200` | TC-BAP-07-H-A |
| Happy | B | API mode | `AttendanceRecordsTable` / Nest path; không 54321 load | TC-BAP-07-H-B |
| Alternate | A/B | 0 record, 200 | Empty + **200** | TC-BAP-07-A |
| Exception | A/B | Scope 409 | FAIL | TC-BAP-07-E-SCOPE |
| Exception | B | Date epoch 0 | Không **01/01/1970** trên cột ngày | TC-BAP-07-E-DATE |
| Exception | A/B | API fail | BR-MOCK-02 | TC-BAP-07-E-API |
| **Sheet create** (ADD) | App/embed | Kỳ 01/07–31/07 + Công chuẩn → Lưu | POST **201**; list row; no storm | TC-BAP-07-S-CREATE · **J-HRM-06b** |
| **Sheet open** (ADD) | App/embed | Click sheet | Grid hoặc empty lý do; records ≤2 GET/10s | TC-BAP-07-S-OPEN |

### P-CC-08 — Tiền lương (UC-HRM-24 / UC24-*)

| Nhánh | Surface | Điều kiện | Kỳ vọng | TC-ID |
|-------|---------|-----------|---------|-------|
| Happy | A | Có payslip | `payroll/payslips` **200** `HRM-PAY-200` | TC-BAP-08-H-A |
| Happy | B | API mode embed | Không 54321; payslip list hoặc empty+200 | TC-BAP-08-H-B |
| Alternate | A/B | 0 payslip, 200 | Empty + **200** | TC-BAP-08-A |
| Exception | A/B | Scope 409 | FAIL | TC-BAP-08-E-SCOPE |
| Exception | A/B | 5xx | ERROR banner | TC-BAP-08-E-API |
| Exception | B | Payroll Supabase legacy | 54321 → FAIL | TC-BAP-08-E-54321 |

### P-CC-03 / P-CC-04 — Regression (sau 05..08)

| Nhánh | Kỳ vọng | Evidence |
|-------|---------|----------|
| Regression | U1–U4 + C1–C6 vẫn PASS | `docs/qa/evidence/hrm-embed-employees-fix-20260522.md`; `hrm-embed-contracts-fix-20260522.md` |

## 6. Business rule matrix — UC-HRM-22..25 (condition → action → outcome)

| Mã | UC | Điều kiện (IF) | Hành động (THEN) | Kết quả (OUTCOME) | HTTP / code |
|----|-----|----------------|------------------|-------------------|-------------|
| BR-UC22-01 | 22 | JWT + `company_id=main` hợp lệ | `listJobRequisitions` | Envelope success, map `title`→Chiến dịch | 200 `HRM-REC-200` |
| BR-UC22-02 | 22 | `data.length=0` | Render empty state | PASS alternate; không inject mock | 200 |
| BR-UC22-03 | 22 | Scope mismatch | `resolveScopeContext` throw | Không render list giả | 409 `SCOPE_CONTEXT_MISMATCH` |
| BR-UC22-04 | 22 | Unauthorized | `assertAccess` | Không list | 401 `HRM-AUTH-001` |
| BR-UC23-01 | 23 | `company_id` + optional filters | `listRecords` | Rows với `attendance_date` ISO hợp lệ | 200 `HRM-ATT-200` |
| BR-UC23-02 | 23 | `page_size` > 100 | Validation | Từ chối | 400 `HRM-VAL-001` |
| BR-UC23-03 | 23 | Timestamp null/0 trên FE | Format date | Không hiển thị 1970 | UI FAIL |
| BR-UC23-04 | 23 | Empty list | Empty UI | PASS alternate | 200 |
| BR-UC24-01 | 24 | `company_id=main` (slug) | `listPayslips` | Hiển thị kỳ + net | 200 `HRM-PAY-200` |
| BR-UC24-02 | 24 | API error + `allowMockFallback()` false | Panel catch | Banner ERROR | UI error |
| BR-UC24-03 | 24 | Empty payslips | Empty UI | PASS alternate | 200 |
| BR-UC25-01 | 25 | Tab contracts | `listContracts` | Bảng HĐ | 200 `HRM-CON-200` |
| BR-UC25-02 | 25 | Tab insurance (portal) | `listHrmContracts` → map BHXH columns | Proxy HĐ→BHXH UI | 200 |
| BR-UC25-03 | 25 | Expiring BHXH | `listExpiringInsurance` | Alert/danh sách sắp hết hạn | 200 `HRM-CON-200` |
| BR-UC25-04 | 25 | iframe insurance Supabase | Query `supabase` tables | **FAIL** pilot until Nest | 54321 |
| BR-UC25-05 | 25 | `settings-catalogs` on rollup | Parallel fetch | **200** `HRM-SET-200` on load (P-CC-04/05) | 200 |

## 7. Acceptance criteria → test evidence (QA — P1-S0)

| AC-ID | Mô tả | Map | Pass khi |
|-------|-------|-----|----------|
| AC-P1-01 | Không 409 scope trên request chính | P-CC-05..08 | Mọi TC-*-E-SCOPE: 409 chỉ trên **probe**, không load |
| AC-P1-02 | Empty hợp lệ | P-CC-05..08 | TC-*-A: **200** + empty UI |
| AC-P1-03 | Không Supabase bắt buộc | P-CC-05..08 | TC-*-E-54321 absent trên load (Surface B sau FE-01) |
| AC-P1-04 | Portal panel API path | P-CC-05..08 A | `HrmWorkspacePanel` `hrmDataSource=api`; Network 200 |
| AC-P1-05 | UC branch coverage | UC22..25 | Mỗi UC có ≥1 H, 1 A, ≥2 E được execute hoặc N/A ghi lý do |
| AC-P1-06 | Regression | P-CC-03,04 | AC-PILOT-05 / U1–U4 / C1–C6 |

**Verdict QA:** `PASS` chỉ khi AC-P1-01..06 true cho **cả** 05..08 (hoặc GO WITH CONDITIONS ghi route DEFER + owner).

## 8. Handoff packet

| Field | Value |
|-------|-------|
| work_item_id | `P1-S0-BA-P-01` |
| from_role | ba-process |
| to_role | pm |
| entry_criteria | PM dispatch S0; matrix P-CC-05..08 `READY_FOR_QA`; SRS §13 UC-HRM-22..25 |
| exit_criteria (BA) | File này có §4–6 đầy đủ; TC-BAP-05..08; BR-UC22..25; `ack_status=PASS_TO_PM` |
| exit_criteria (QA — downstream) | P-CC-05..08 PASS/FAIL + evidence; không blocker 409/54321 |
| evidence_path | `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| needed_by | PM → dispatch `P1-S0-QA-01` |
| ack_status | **PASS_TO_PM** |

**PM action:** Dispatch QA với entry = §5 TC-ID + §7 AC-P1-*; thứ tự **P-CC-05 → 06 → 07 → 08 → regression 03/04**.

**Coaching:** `.cursor/team/PM_COACHING_FOR_ROLES.md` — L2 bắt buộc; L1 UAT không thay iframe.

## 9. Open risks / clarifications

| ID | Risk | Owner | Trigger |
|----|------|-------|---------|
| R-01 | `Insurance.tsx` Supabase-only (UC25-E3) | dev-fe (`P1-S0-FE-01`) | TC-BAP-05-E-54321 FAIL |
| R-02 | Portal insurance = contracts proxy (BR-UC25-02) | PM/product | QA document actual vs `employee_insurance_records` |
| R-03 | Recruitment/Attendance/Payroll iframe chưa `shouldSkipSupabase` | dev-fe | TC-BAP-06/07/08-E-54321 |
| R-04 | GAP-BHXH-FE — BE `GET /insurance` exists; Surface A still `listHrmContracts` for insurance view | dev-fe (`P1-EX-FE-01`) | BR-INS-01 / P1-EX-BA-01-R2 |
| R-05 | Residual 54321 `subscription_plans` on employees embed | dev-fe P2 | PARTIAL nếu không block 05..08 |

## 10. UX benchmark AC overlay (P1-EX-BA-01-R2 — T5)

**Source:** [`PHASE1_UX_BENCHMARK_ASSESSMENT.md`](../program/PHASE1_UX_BENCHMARK_ASSESSMENT.md) · evidence [`p1-ex-ba-01-20260526.md`](evidence/p1-ex-ba-01-20260526.md)

| Journey / P-CC | UX AC (measurable) | Priority |
|----------------|-------------------|----------|
| J-HRM-01 | List→profile: no «Không tìm thấy» when list row exists under `main` | P0 regression guard (BR-EMP-LIST-01) · **PASS** W5B |
| J-HRM-02 | P-CC-03 employees list → row → profile (`GET …/employees/:id?company_id=main`) | **PASS** API scope parity nip.io 2026-06-05 · browser embed click **GWC** (**C-EMPGRPQC-01**) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) |
| **J-HRM-IM-01** | P-CC-03 Employees → Import Excel → preview → Cancel/F5 (non-persist) | **PASS local** · **FR-HRM-IM-01** · Network `POST …/import/preview` **200** `SHEET-200` · zero persist · U65 · QC GWC [`qc-hrm-im-01-preview-ac-01-20260727.md`](evidence/qc-hrm-im-01-preview-ac-01-20260727.md) · BA [`ba-j-hrm-im-01-journey-01-20260727.md`](evidence/ba-j-hrm-im-01-journey-01-20260727.md) · **HOLD_DEPLOY** / NOT :8088 · **OUT** IM-02 · **must_keep** host J-HRM-02 |
| J-HRM-04 / P-CC-05 | Surface A «Bảo hiểm» shows BHXH columns from `GET .../insurance`, not contract-shaped proxy | **P0** BR-INS-01 |
| J-HRM-06 / P-CC-07 | No date cell `01/01/1970` when `attendance_date` invalid | **P0** BR-ATT-DATE-01 |
| J-HRM-01..02 | Profile satellite tab in embed: no `:54321`; `EmbedGuardedTab` or Nest data | **P1** BR-360-SOURCE-01 |
| J-CC-02 / CC-ORG | Member unit opens legal profile **200** or governed disable — no 404 loop | **P0** BR-ORG-LINK-01 · **PASS** nip.io read detail 2026-06-04 (`p1-phase1-qa-crud-matrix-20260604.md`) |
| J-XBOS-01 / CC-INBOX | `VITE_ALLOW_MOCK_FALLBACK=false` → zero mock tasks when API empty | **P0** BR-INBOX-01 |
| J-XBOS-01 / CC-WF | CEO: pending list → instance detail → `POST …/complete` (`XBOS-WF-200`) → list count decreases | **PASS** API L2.5 2026-06-04 · [`p1-phase1-qa-wf-inbox-20260604.md`](evidence/p1-phase1-qa-wf-inbox-20260604.md); **GWC** strict browser drawer click |

L2 **PASS** on a row does **not** satisfy UX AC above — QA must cite benchmark screen ID in evidence.

## 12. Cross-module integration journeys (U39 — `P1-PROD-INT-BA-P-01`)

**Source:** [`p1-prod-int-ba-p-01-20260607.md`](../program/governance/p1-prod-int-ba-p-01-20260607.md) · SRS §15 · BR-INT-01..05

| Journey | Path | Pass (fail if) | Persona | Status |
|---------|------|----------------|---------|--------|
| **J-HRM-INT-01** | P-CC-06 requisition → detail → candidate; `filled` ⇒ `employee_id` | Same `company_id` slug; hire link NOT NULL | Group CEO + member CEO | ⏳ QA W4 |
| **J-HRM-INT-02** | P-CC-03 employee → P-CC-04 contract same NV | ≥1 contract; slug match (extends J-HRM-01) | Both | ⏳ |
| **J-HRM-INT-03** | P-CC-03 employee → P-CC-08 payslip same NV | `employee_id` + period slug match (extends J-HRM-07) | Both | ⏳ |
| **J-HRM-07b** (proposed) | Hire Active → kỳ/đợt lương → payslip list có cùng `employee_id` · F5 | O1 bước 6 · AC-PAY-HIRE-01..03 · `PO-HRM-E2E-LINK-PAY-CFG-SPEC-01` | Group CEO + HRBP CT | ⏳ SPEC — chưa Dev |
| **J-HRM-INT-04** | P-CC-06 hire → P-CC-03 new employee row | Visible without tenant switch; slug = requisition | Both | ⏳ |
| **J-HRM-INT-05** | Switcher slug **holding** → tabs 03/04/06/08 | All APIs same selected slug; **0× 409** | Group CEO only | **PASS** · CD-FB-06 QC GWC 2026-07-19 (`cd-fb-06-role-switch-qc-20260719.md`) |

**Scope overlay:** UC-HRM-SCOPE-01 (rollup) · UC-HRM-SCOPE-02 (member) · UC-HRM-SCOPE-03 (switcher) — AC-INT-SCOPE-* / AC-INT-SW-* in governance doc §7.

## 11. Mobile Home Portal — J-MOB-11..15 (U53)

**Source:** `docs/program/MOBILE_HOME_PORTAL_AC_DELTA.md` · **Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · **Surface:** `TabDashboard` only (4-tab unchanged).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-11** | Login → Trang chủ → tap bell | `InAppNotifications`; header `#1E40AF`; search stub không crash |
| **J-MOB-12** | Swipe carousel | ≥1 slide + dots khi ≥2 slides; work anniversary / birthday BR-BDAY/BR-ANNIV |
| **J-MOB-13** | Tap icon «Chấm công» / «Bảng lương» | → `CheckIn` / `PayrollSummary`; 8 icon 2×4 |
| **J-MOB-14** | Tap feed «Xem chi tiết» | → `PayslipDetail` (extends J-MOB-04) |
| **J-MOB-15** | Full scroll | Portal layers **trên** Smart Hub; **J-MOB-06..09** không regress |

**W7 ID renumber:** draft J-MOB-11..13 (leave doc / ESS / push) → **J-MOB-16..18** — see portal delta §3.

**U54 note:** U53 covers **subset SET A only** (portal shell). Full sponsor ESS mockup SET A–E → `MOBILE_HRM_ESS_UX_BENCHMARK.md`.

## 12. Mobile ESS UX — J-MOB-19..30 (U54)

**Source:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` · **Account:** `uat.nv0001@xe.vn` (NV) · manager account for SET B · **Regression:** J-MOB-11..15 + J-MOB-06..09 mandatory on Dashboard changes.

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-19** | Dashboard → header role+chat stub+bell | Avatar+name+role; chat stub; bell → inbox |
| **J-MOB-20** | Dashboard → date picker → stats row | Work/Late/Absence updates for selected date |
| **J-MOB-21** | Dashboard → 4 stat cards tap | Active Team / Off / Leave Requests / My Leaves navigate |
| **J-MOB-22** | Dashboard → announcements → tap row | List loads; tap → detail/inbox |
| **J-MOB-23** | Manager → leave cards inline Accept/Decline | Card+online dot; not select-then-footer only |
| **J-MOB-24** | Manager → confirm modal → snackbar Undo | Icon modal; snackbar affordance |
| **J-MOB-25** | My Leaves → balance cards | Available + Used + period header |
| **J-MOB-26** | My Leaves → Review\|Approved\|Rejected tabs | Date-grouped sections |
| **J-MOB-27** | My Leaves empty → Apply CTA | Illustration + → CreateLeaveRequest |
| **J-MOB-28** | Leave form → type + balance chip | Balance per leave type or HR fallback |
| **J-MOB-29** | Leave form → date modal → submit confirm | Modal range; confirm before POST |
| **J-MOB-30** | Team tab → search+filter+check-in badge | Directory list; status matches API |

**Waves:** MOB-UX-06 (19–22) · MOB-UX-07 (23–29) · MOB-UX-08 (30) · MOB-UX-09 (tab IA + payslip/profile ext).

## 13. Mobile ZenHR ESS polish — J-MOB-31..35 (U55)

**Source:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` §13 · **Account:** `uat.nv0001@xe.vn` (NV) · manager for pending/approve · **Regression:** J-MOB-19..30 + J-MOB-11..15 + J-MOB-06..09 + **4-tab count = 4**.

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-31** | Dashboard → **My Pending Actions** strip → tap row | Opens leave/detail/inbox; strip hidden when count=0 |
| **J-MOB-32** | Dashboard → **My Actions** grid (Time Off / Expenses / Letters) | Time Off → leave flow; Expenses/Letters → Phase 2 stub |
| **J-MOB-33** | Any tab → **center FAB (+)** → CheckIn | FAB visible; tab bar still 4 tabs; optional map/clock |
| **J-MOB-34** | Payslip tab → **net salary hero** → history row → detail | Green hero + latest net; list below; tap → PayslipDetail |
| **J-MOB-35** | Chấm công → Lịch sử → timeline badge | On Time / Late / Absent badge per row matches API |

**Waves:** MOB-UX-10 (31–35) · after MOB-UX-06..09 baseline · FAB Option B per benchmark §13.4.

## 15. Mobile persona UX — J-MOB-36..38 (MOB-UX-13)

**Source:** `docs/program/MOBILE_PERSONA_UX_MATRIX.md` · **Accounts:** `uat.nv0001@xe.vn` (EMP) · `uat.nv0002@xe.vn` (MGR) · `ceo@xe.vn` (LDR slice) · **Regression:** J-MOB-01..35 + **AC-PERS-LOC-01** (no GPS/geofence/UUID on check-in).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-MOB-36** | EMP login → Trang chủ → «Việc cần làm» before grid → tile Nghỉ → detail | No «Cần duyệt» hero when `is_manager=false`; ≥ 9 VI tiles |
| **J-MOB-37** | MGR login → «Cần duyệt (n)» or pending strip → Duyệt → snackbar VI | Tile «Duyệt»; FAB duyệt row |
| **J-MOB-38** | LDR login → Pulse/báo cáo section → Đội nhóm rollup | FAB no check-in; leader copy VI |
| **J-MOB-02** (regress) | Check-in → «Vị trí thiết bị» auto capture | **Fail** if GPS/geofence/UUID field |

**Waves:** MOB-UX-13a..g per `MOBILE_APPLE_HIG_ESS_PROGRAM.md` §5.

## 14. Assumptions

- Pilot stack `:5175` / HRM `:28001` / XBOS `:28002`.
- CEO token `companyId=main`; query `company_id=main` (payroll slug; attendance UUID resolved by scope).
- `VITE_HRM_USE_API` default true; portal session via `portalAuthBridge`.
- Implementation truth: `docs/hrm/SRS.md` §13 + `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` + `apps/api/hrm-api` controllers cited above.

## 16. Recruitment workflow bridge — J-REC-WF-01..06 (`XHRM-REC-WF-BA-01`)

**Source:** `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · Program `P1-XBOS-HRM-REC-WF-BRIDGE`  
**Account:** `ceo@xe.vn` (Group CEO rollup `company_id=main`) · Approver via XBOS Inbox (resolver)  
**must_keep:** UF-HRM-12 · J-HRM-05 · P-CC-06 · LeaveWorkflowBridge · F6 AC-CD-F6-*  
**U65:** zero-seed — inbox task chỉ sau chuỗi FE (canvas → HRM submit → spawn).

| Journey | Click path | Pass (L2.5) |
|---------|------------|-------------|
| **J-REC-WF-01** | XBOS Workflow canvas → save active `hrm_recruitment_*` → reload | Definition + resolver persist (AC-REC-WF-01) |
| **J-REC-WF-02** | P-CC-06 / HRM → tạo plan → Gửi duyệt → F5 | Spawn 2xx **hoặc** banner `SPAWN-MISSING` + pending (AC-REC-WF-02) |
| **J-REC-WF-03** | XBOS Inbox → Duyệt task tuyển dụng → HRM status sync → F5 | Status approved/open; **cấm** seed inbox (AC-REC-WF-03) |
| **J-REC-WF-04** | Candidate roadmap → sau step → stage chip = F6 map → J-HRM-05 | Unmapped fail-closed (AC-REC-WF-04) |
| **J-REC-WF-05** | P-CC-06 dashboard funnel 6 cột | Counts = live aggregate post-sync; BR-DQ-01 (AC-REC-WF-05) |
| **J-REC-WF-06** | Inbox Từ chối + lý do | rejected + notify; no hired downgrade (AC-REC-WF-06) |

**Waves:** BA `XHRM-REC-WF-BA-01` → SA ADR `XHRM-REC-WF-SA-01` → ba-data → Dev → QA L2.5.

## 16b. B-Minutes customer retest — BM-02..BM-07 AC (`BM-BA-AC-MATRIX-01`)

**Source:** `docs/program/deltas/BMINUTES_AC_MATRIX.md` · Evidence `docs/qa/evidence/bm-ba-ac-matrix-01-20260722.md` · Program `P1-BMINUTES-CUST-RETEST-01`  
**U65:** zero-seed · PASS = FE post-mutation + Network 2xx + F5 · `code_does` UNKNOWN until explore/QA  
**must_keep:** UF-HRM-02/12 · J-HRM-03/05 · J-HRM-INT-05 · J-REC-WF-01..06 (DRAFT until QA) · AC-CD-F3..F6 / AC-REC-WF-*  
**BM-01:** Connect/template **DEFER** (not in matrix).

| BM | AC cluster | Primary journeys / UF |
|----|------------|------------------------|
| **BM-02** | BM-AC-02-01..04 | J-HRM-INT-05 · UF-HRM-09/13 |
| **BM-03** | BM-AC-03-01..05 | F4 leave + J-REC-WF-01 pattern |
| **BM-04** | BM-AC-04-01..05 | UF-HRM-02 · J-HRM-03 |
| **BM-05** | BM-AC-05-01..04 | UF-HRM-12 · J-HRM-05 · J-REC-WF-05 |
| **BM-06** | BM-AC-06-01..08 | **J-REC-WF-01..06** · UF-HRM-12 |
| **BM-07** | BM-AC-07-01..03 | UF-HRM-10 · UF-HRM-03 (≠ G-DB-04 dual catalog) |

## 17. HRM full sidebar sweep — J-HRM-MENU-SWEEP (`BA-HRM-MENU-UF-MATRIX-01`)

**Source:** QA proposal in `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` · Matrix [`USER_FLOW_OPERABILITY_MATRIX.md`](./USER_FLOW_OPERABILITY_MATRIX.md) §4b · Journey [`PROGRAM_JOURNEY_MAP.md`](../program/PROGRAM_JOURNEY_MAP.md)  
**Account:** `ceo@xe.vn` · `companyId=main` · U65 zero-seed  
**Scope:** Load + no tech chrome + no crash/console P0 — **không** thay AC mutate UF-HRM-01..13.

| Journey | Click path | Pass (L2 / L2.5 load) |
|---------|------------|------------------------|
| **J-HRM-MENU-SWEEP** | CC HRM embed → lần lượt mọi leaf AppSidebar (17) | Mỗi UF-HRM-MENU-01..17 load OK; no chrome patterns; no Sync ERROR / RangeError |
| **UF-HRM-MENU-02b** | Employees → mở 1 hồ sơ → tab Lương | No Invalid time; no badge `API` |
| **UF-HRM-MENU-17** | Settings + catalogs + metadata queue | Sync stamp human-readable; P3 workflow ids = GWC condition (không block load PASS) |

**Waves:** BA matrix `BA-HRM-MENU-UF-MATRIX-01` → optional QA promote Dev8088 · residual FE metadata ids (P3).

## 18. P0 date fidelity — ATT sheet + company founded (`FID-P0-BA-DATE-01`)

**Source:** `docs/qa/evidence/fid-p0-ba-date-01-20260722.md` · Program `P1-HRM-SPEC-CODE-DB-FIDELITY` · SoT `UX_VI_DATE_NUMBER_FORMAT_AC.md`  
**Incidents:** INC-DATE-ATT-SHEET · INC-DATE-CO-FOUND  
**U65:** zero-seed · picker MUST open · parse padded+unpadded → Network `yyyy-MM-dd`

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-06b** (reopen date slice) | AC-FID-ATT-D01..D05 · AC-FID-DATE-01..07 | Picker mở trên Thêm bảng; `1/7/2026` → body `2026-07-01`; POST 201; must_keep AC-ATT-SHEET storm/empty |
| **Company detail / edit** (embed Phòng/Ban & Công ty) | AC-FID-CO-D01..D04 | Founded picker mở; bind + persist `founded_date`; MST/email/phone không «—» giả |

**Waves:** BA `FID-P0-BA-DATE-01` → FE `FID-P0-FE-DATE-01` + SA `FID-P0-SA-DATE-01` (company SoT) → QA J-HRM-06b date + company founded.

## 19. Employees list — cột «Thông tin công ty» vs ĐVTV (`BA-HRM-EMP-COMPANY-COL-01`)

**Source:** `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md`  
**Symptom:** `:8088` `/command-center/hrm/employees` hiện «Khối … X.E» — lệch danh sách công ty/ĐVTV DB.  
**Spec says:** cột = pháp nhân / ĐVTV (Plane A); **code does:** operating-unit registry Khối (Plane B).  
**HOLD_DEPLOY:** cấm deploy brand/FE pilot đến khi sponsor cho phép.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-02** / **P-CC-03** employees list | **AC-EMP-COL-01..07** · BR-EMP-COL-01..04 | Cột «Thông tin công ty» ∈ tên LE/ĐVTV; **0** `Khối … X.E`; F5 giữ; J-HRM-02 detail OK |

**Waves:** BA `BA-HRM-EMP-COMPANY-COL-01` → BE `D-HRM-EMP-COMPANY-COL-BE-01` + FE `D-HRM-EMP-COMPANY-COL-FE-01` → QA `QA-HRM-EMP-COMPANY-COL-01`.

**Traceability program:** `BA-SPEC-CODE-GAP-HRM-01` merged G-ORPH-01/02 + G-SPEC-01/04/05/06 into `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4–§5 — evidence `docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md` (HOLD_DEPLOY).

---

## 19b. Mobile ESS — nhãn công ty vs Khối pilot (`BA-MOB-ORPH-KHOI-LABEL-01`)

**Source:** `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` · QC FAIL `qc-mob-spec-orphan-code-sample-01-20260730.md`  
**Symptom:** Scope / Settings / Home / Payslip / Login toast hiện «Khối … X.E» từ `PILOT_HRM_OPERATING_UNITS`.  
**Spec says:** **FR-HRM-EMP-COL-01** + **FR-HRM-MOB-OU-01** — nhãn công ty = Plane A (TECHSPEC §19.1); **code does:** Plane B Khối hardcode.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-MOB-01** Scope / Settings | **AC-MOB-LABEL-01..02, 07** · BR-MOB-LABEL-01 | 0 «Khối … X.E»; §4 legal names or «—» |
| **J-MOB-01** Home / Payslip | **AC-MOB-LABEL-03..04** | Subtitle/greeting ∈ Plane A |
| **J-MOB-01** Login toast | **AC-MOB-LABEL-05** · G-ORPH-MOB-03 | Resolver parity Settings |
| OU filter (Group CEO) | **AC-MOB-OU-01..02** · BR-MOB-LABEL-04 | Row label = synced LE name; title «Đơn vị vận hành» giữ |

**Waves:** BA `BA-MOB-ORPH-KHOI-LABEL-01` → Dev-Mobile `D-MOB-G-ORPH-KHOI-01` → QA U65 → QC re-gate orphan sample. **HOLD_DEPLOY** · **U65** no seed.

---

## 20. Company Management — headcount ĐVTV ↔ slug (`D-HRM-CO-EMP-COUNT-BA-01`)

**Source:** `docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md`  
**Symptom:** `/command-center/hrm/company` «Tổng nhân viên»=0 / mọi «Số nhân viên»=0 trong khi Dashboard ≈1109.  
**Spec says:** Card + cột = workforce via LE→`GROUP_MEMBER_SLUGS` bridge (BR-INT-05 · BR-CO-EMP-01); **code does:** XBOS-only + `employee_count: null` → UI `|| 0`.  
**Prior QA:** UF-HRM-MENU-15 load-only 🟢 = **insufficient** — không promote headcount PASS.

| Journey / surface | AC cluster | Pass when |
|-------------------|------------|-----------|
| **J-HRM-CO-01** / Company `/company` · UF-HRM-MENU-15 (extend) | **AC-CO-EMP-01..06** · **AC-CO-IND-01..04** · BR-INT-05 · BR-CO-EMP-01..02 · **BR-CO-IND-01** · **BR-CO-LABEL-01** | Card ≈ `GET /employees/summary?company_id=main` `total`; per-row = slug count (Visun→`logistics`…); fail→«—»; F5 giữ; **«Ngành nghề»** = VI từ `business_lines`/catalog — **cấm** raw `entity_type`/`subsidiary` |

**Waves:** BA `D-HRM-CO-EMP-COUNT-BA-01` → BE `D-HRM-CO-EMP-COUNT-BE-01` + FE `D-HRM-CO-EMP-COUNT-FE-01` → QA `QA-HRM-CO-EMP-COUNT-01`.

---

## 19. HRM Import Excel preview — J-HRM-IM-01 (`BA-J-HRM-IM-01-JOURNEY-01`)

**Source:** QC GWC condition **C-IM01-JMAP-01** · [`qc-hrm-im-01-preview-ac-01-20260727.md`](evidence/qc-hrm-im-01-preview-ac-01-20260727.md) · BA evidence [`ba-j-hrm-im-01-journey-01-20260727.md`](evidence/ba-j-hrm-im-01-journey-01-20260727.md)  
**Spec:** **FR-HRM-IM-01** · `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` · `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md`  
**Host:** **J-HRM-02** (employees list) — **must_keep** status; this row is preview-only L2.5.

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-IM-01** | Login Group CEO → P-CC-03 Employees → Import Excel → upload → preview → **Cancel** → **F5** | Network `POST /api/hrm/spreadsheet/import/preview` → **HTTP 200** + **`SHEET-200`**; FE preview rows; **zero persist** (headcount unchanged; no commit); U65; **OUT** IM-02 · HOLD_DEPLOY / NOT :8088 |

## 20. E2 E-PAY-CLEAN journey slices (ADD `BA-ERP-E2-SRS-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_E2_SRS_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-e2-srs-01-20260728.md` · SRS §16.5  
**Host must_keep:** **J-HRM-07** (payslip) · **J-HRM-03** + **UF-HRM-02** (contracts load)  
**Unlock:** E1-A + E1-B QC GWC · carry **R-E1A-A8-CTYPE**

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-PAY-E2-01** | Group CEO → Payroll → Salary components → chọn bản chất (`pay_types`) → Lưu → F5; invalid Zod reject; invent nature → BE 400; **không** mock tax/BH islands | AC-E2-NOMOCK/PAY-NATURE/ZOD/BE/F5 · U65 |
| **J-HRM-CI-TYPE-E2-01** | Profile HĐ **và** Contracts page → loại HĐ từ `contract_types` → Lưu → F5; hai surface cùng SoT; invent → 400 | AC-E2-CI-TYPE/PARITY/BE · đóng R-E1A-A8-CTYPE |

## 21. E3 CONSTRAINT + PERF-SM + INS-DEPTH journey slices (ADD `BA-ERP-E3-SRS-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-e3-srs-01-20260728.md` · SRS §16.6  
**Host must_keep:** **J-HRM-03** · **UF-HRM-04** (insurance/contracts load) · Performance list load  
**Unlock:** E2 QC GWC CLOSED · Cohort 4 E3

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-PERF-E3-01** | Group CEO → Đánh giá → tạo/sửa chu kỳ → tạo phiếu → nộp→duyệt→hoàn thành → F5; illegal jump reject; KPI/`job_grades`/`departments` picker khi expose | AC-PERF-01..05 · AC-E3-ZOD/SM/U72 · U65 |
| **J-HRM-INS-E3-01** | Group CEO → Bảo hiểm → tạo policy (`insurers`+`insurance_types`) → gắn NV → PATCH/end → F5; invent insurer/type → 400; trùng sổ reject khi cấm | AC-INS-01..05 · AC-E3-BE/F5 · U65 |
| **J-HRM-SM-E3-01** | Spot Leave approve path + một RC stage illegal transition | AC-E3-SM-01 · VAL-E3-07/08 |

### 21b. SI insurance-type Nest catalog (ADD `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md` · SA Option B Nest `si_insurance_type` · peer ATT/PAY/REC  
**Host must_keep:** **J-HRM-INS-E3-01** (deepen type SoT) · **UF-HRM-04** / **J-HRM-04** load · enrollment ONE SoT · CTR legal-print seals  
**Honesty:** `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT  
**Unlock:** after ba-data Nest physical + BE F-SI-CAT-EFF + FE rebind — **HOLD** browser until Nest LIVE

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-SI-INS-CAT-01** *(proposed)* | Settings Loại BH admin CREATE N+1 → F5 → policy + enrollment pickers thấy mã Nest EFF | AC-PLT-SI-INS-01d → **01** · U65 zero-seed |
| **J-HRM-SI-INS-CAT-02** *(proposed)* | Invent type trên policy **và** enrollment khi EFF>0 → **4xx** `HRM-INS-TYPE-KEY` · không persist F5 | AC-PLT-SI-INS-01b · AC-INS-03 · VAL-SI-CNS-01/02 |
| **J-HRM-SI-INS-CAT-03** *(proposed)* | EFF=0 → empty picker + CTA admin; admin vẫn CREATE; **không** seed density | AC-PLT-SI-INS-01c |
| **J-HRM-SI-INS-CAT-04** *(proposed · optional)* | Settings rate-cfg invent `insurance_type_key` khi EFF>0 → **4xx** KEY | AC-PLT-SI-INS-RATE · VAL-SI-CNS-03 |
| **J-HRM-INS-E3-01** *(reuse deepen)* | Same E3 path — **type** picker SoT = Nest EFF (**not** Settings MD alone); insurer still AC-INS-02 OUT residual *until* §21c | AC-PLT-SI-INS-POL · L-SI-INS-02 |

### 21c. SI insurers Nest catalog (ADD `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md` · SA Option B Nest `si_insurer` · peer SI type L1 **SEAL RETAIN**  
**Host must_keep:** **J-HRM-INS-E3-01** (deepen **insurer** SoT) · **UF-HRM-04** / **J-HRM-04** load · SI type L1 · enrollment ONE SoT · CTR legal-print seals  
**Honesty:** `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT · DENY fold into type · DENY reopen SI-INS L1  
**Unlock:** after ba-data Nest physical + BE F-SI-CAT-INS-EFF + FE rebind — **HOLD** browser until Nest LIVE · **BE HOLD** until BA+DATA

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-SI-INR-CAT-01** *(proposed)* | Settings Nhà BH admin CREATE N+1 → F5 → policy insurer picker thấy mã Nest EFF | AC-PLT-SI-INSURER-01d → **01** · U65 zero-seed |
| **J-HRM-SI-INR-CAT-02** *(proposed)* | Invent insurer trên policy khi EFF>0 → **4xx** `HRM-INS-INSURER-KEY` · không persist F5 | AC-PLT-SI-INSURER-01b · AC-INS-02 · VAL-SI-INR-CNS-01 |
| **J-HRM-SI-INR-CAT-03** *(proposed)* | EFF=0 → empty picker + CTA admin; admin vẫn CREATE; **không** seed density | AC-PLT-SI-INSURER-01c |
| **J-HRM-SI-INR-CAT-04** *(proposed · optional)* | Records soft `insurer_key` invent khi EFF>0 → **4xx** KEY | AC-PLT-SI-INSURER-REC · VAL-SI-INR-CNS-02 |
| **J-HRM-INS-E3-01** *(reuse deepen insurer)* | Same E3 path — **insurer** picker SoT = Nest EFF (**not** Settings MD alone); **type** picker remain peer Nest / separate KEY `HRM-INS-TYPE-KEY` | AC-PLT-SI-INSURER-POL · L-SI-INR-02 · VAL-SI-INR-CNS-06 |

### 21d. ATT work-sites Nest catalog deepen (ADD `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md` · SA Option B Nest `attendance_work_sites` LIVE deepen · peer ATT-LEAVE GWC **SEAL RETAIN**  
**Host must_keep:** **AC-PLT-ATT-04** · ADR D3 · **J-MOB-02** GPS check-in spot · leave WAIVE / **J-HRM-06c** seals  
**Honesty:** `attendance_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT · DENY fold into leave · DENY reopen ATT-LEAVE GWC · DENY seed/ensureDefault  
**Unlock:** after BE soft-retire + list active filter (+ FE lat/lon verify) — then QA browser U65

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-ATT-WS-CAT-01** *(proposed)* | Attendance GPS CFG admin CREATE site N+1 → F5 → GPS punch inside radius **2xx** · Nest work-sites SoT | AC-PLT-ATT-WORKSITE-01d → **01** · AC-PLT-ATT-04 · U65 zero-seed |
| **J-HRM-ATT-WS-CAT-02** *(proposed)* | Invent OOS coords when active>0 + gps_enabled → **4xx** `HRM-ATT-GEO-001` · không persist F5 | AC-PLT-ATT-WORKSITE-01b · VAL-ATT-WS-CNS-01 |
| **J-HRM-ATT-WS-CAT-03** *(proposed)* | active=0 → skip geofence + CTA admin; admin vẫn CREATE; **không** seed/ensureDefault | AC-PLT-ATT-WORKSITE-01c · ADR D3 |
| **J-HRM-ATT-WS-CAT-04** *(proposed)* | Soft-retire `active=false` → geofence ignores site; list default active-only | VAL-ATT-WS-CNS-04 · CNS-03b |
| **J-MOB-02** *(reuse deepen)* | Mobile GPS check-in lat/lon → same GEO assert; retain AC-PERS-LOC-01 (no raw UUID site field invent) | AC-PLT-ATT-WORKSITE-01 spot · CNS-05 |

### 21e. ATT work_shifts Nest catalog deepen (ADD `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` §6.4 · SA Option B Nest `work_shifts` · ADR D1 · peer ATT-CODE / leave / worksite **SEAL RETAIN**  
**Host must_keep:** Nest `work_shifts` SoT · Settings/`shifts` REF only · invent KEY · soft-retire · ATT-CODE L1 / leave / worksite seals  
**Honesty:** `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT · DENY fold into code/leave/worksite · DENY invent FE ATT-CODE HOLD · DENY seed  
**Status:** ⬜ **proposed** journeys — L1 Nest KEY/admin/soft-retire sealed; browser UF / J-* **not** claimed this DOCS seat · FE ShiftChange Nest rebind = Condition open (do not claim product invent closed on FE)

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-ATT-SHIFT-CAT-01** *(proposed)* | Tab Ca admin CREATE shift N+1 → F5 → Đổi ca pick Nest ca mới | AC-PLT-ATT-SHIFT-01d → **01** · U65 zero-seed |
| **J-HRM-ATT-SHIFT-CAT-02** *(proposed)* | Invent unknown shift code khi active>0 → **4xx** `HRM-ATT-SHIFT-KEY` · không persist F5 | AC-PLT-ATT-SHIFT-01b · VAL-ATT-SHIFT-CNS-01 |
| **J-HRM-ATT-SHIFT-CAT-03** *(proposed)* | active=0 → skip invent + CTA admin; admin vẫn CREATE; **không** seed | AC-PLT-ATT-SHIFT-01c |
| **J-HRM-ATT-SHIFT-CAT-04** *(proposed)* | Soft-retire `status=inactive` → picker ẩn; list default active-only | AC-PLT-ATT-SHIFT-01e · VAL-ATT-SHIFT-CNS-04 |

### 21f. ATT leave balance / accrual **rule schema** Nest DEFINE (ADD `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md` · SA Option B Nest `att_leave_accrual_policy` DEFINE · peer ATT-LEAVE type L1 / ATT-CODE / WS / SHIFT **SEAL RETAIN**  
**Host must_keep:** type invent `HRM-LEAVE-TYPE-UNKNOWN` · ledger leave-balance/panel · WAIVE / **J-HRM-06c** · FE HOLDs ATT-CODE FE · ATT-SHIFT CNS-02 **RETAIN**  
**Honesty:** `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 engine LIVE **HOLD** · **`C-SLICE-≠-MODULE`** · DENY reopen leave-type L1 · DENY Settings/`attendance_rules` sole rule · DENY Face · aggregate · mega-EAV · invent FE HOLDs · seed  
**Unlock:** after ba-data DATA-01 + BE F-ATT-LVRULE-* — **BE HOLD** until BA+DATA both CONFIRMED · browser U65 after Nest LIVE

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-ATT-LVRULE-01** *(proposed)* | Settings/ATT CFG **Quy tắc quỹ phép** admin CREATE policy N+1 bound EFF type → F5 → resolve sees row | AC-PLT-ATT-LEAVE-BAL-01d → **01** · U65 zero-seed |
| **J-HRM-ATT-LVRULE-02** *(proposed)* | Invent `policy_id` / ad-hoc mode\|days khi policy active>0 → **4xx** `HRM-ATT-LVRULE-KEY` · không persist F5 | AC-PLT-ATT-LEAVE-BAL-01b · VAL-ATT-LVRULE-CNS-01 |
| **J-HRM-ATT-LVRULE-03** *(proposed)* | Policy active=0 → empty CTA · soft skip · admin vẫn CREATE · **không** seed | AC-PLT-ATT-LEAVE-BAL-01c |
| **J-HRM-ATT-LVRULE-04** *(proposed)* | Soft-retire → resolve default ẩn · ledger history OK | AC-PLT-ATT-LEAVE-BAL-01e · VAL-ATT-LVRULE-CNS-04 |
| **J-HRM-ATT-LVRULE-05** *(proposed)* | Leave invent type → **4xx** `HRM-LEAVE-TYPE-UNKNOWN` (**RETAIN** · ≠ LVRULE-KEY · **cấm reopen** L1) | AC-PLT-ATT-LEAVE-BAL-01f · AC-PLT-ATT-LEAVE-01b |
| **J-HRM-ATT-LVRULE-06** *(proposed)* | Panel quỹ types ⊆ EFF/policy-bound · kill MVP-five sole · hold spot | AC-PLT-ATT-LEAVE-BAL-01g · FR-UC-BP-ATT-05b/09 |
| **UF-HRM-05** / **J-HRM-06*** *(reuse)* | Load / sheet / sign — **RETAIN**; **cấm** claim module ATT UAT from schema slice | AC-PLT-ATT-LEAVE-BAL-01H |

## 22. E-XBOS-CTRL-SPEC — apply-to-members expand (ADD `BA-ERP-XBOS-CTRL-SPEC-01` · 2026-07-28)

**Source:** `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` · evidence `docs/qa/evidence/ba-erp-xbos-ctrl-spec-01-20260728.md` · SRS §16.7  
**Unlock:** E3 QC GWC CLOSED · Cohort 5 SPEC docs only — **HOLD** Dev G1/G2 đến sponsor chốt  
**must_keep:** J-XBOS-02 / J-XBOS-08 publish→sync spine · UF-09/15 catalog gov · E1-B Settings buckets

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-XBOS-CTRL-01** | Admin XBOS: publish `departments` → apply-to-members (≥1 ĐVTV) → HRM Settings PB → sync/pull → list + F5; cross-nav consumer dept picker cùng code | AC-XBOS-CTRL-02 · HRM-01/02 · U65 |
| **J-XBOS-CTRL-02** | Cùng luồng `leave_types` (+ spot `job_titles` regression keep) | AC-XBOS-CTRL-03 · 01 · U65 |
| **J-XBOS-CTRL-03** | Apply key ngoài allow-list phase → **400** `XBOS-CFG-005`; member L0 không đổi | AC-XBOS-CTRL-04 |

**P0 allow-list (normative):** `job_titles` · `departments` · `leave_types` · `recruitment_channels` · `job_grades`

## 23. JD trường động + view công khai-style — J-HRM-JD-* (`PO-HRM-JD-DYNAMIC-SPEC-01` · 2026-08-06)

**Source:** `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` · slice `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md`  
**Spine must_keep:** FR-UC-BP-REC-00 · YCTD gắn mã JD · U65 zero-seed  
**Status:** DRAFT journeys — **chưa** QA; Dev **HOLD** đến ba-data + sa + sponsor confirm SRS delta  
**creative_extra:** none (TopCV = layout quality bar only)

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-JD-01** | Login → Cài đặt → catalog trường JD → Thêm/Sửa → Lưu → F5 | AC-JD-DYN-01..05 · BR-BP-JD-DYN-01/07 |
| **J-HRM-JD-02** | Tuyển dụng → Thư viện JD → Thêm → kéo trường → nhập (tiêu đề đầu) → Lưu → F5 list | AC-JD-DYN-06..12 · BR-BP-JD-DYN-02/03 |
| **J-HRM-JD-03** | List JD → Xem (title-first / section) → (tuỳ chọn) YCTD chọn JD Hiệu lực | AC-JD-DYN-13..16 · BR-BP-JD-DYN-04..06 · cross-nav list→view |

## 24. HĐLĐ catalog mẫu mở (ví dụ khởi tạo X.E) — J-HRM-CTR-04..07 (ADD paper · 2026-08-07)

**Source:** Enterprise SRS **FR-UC-BP-CORE-09d** **v0.21** · SPEC `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01` · CORR open catalog · Journey map DRAFT  
**Honesty:** `contracts_printable_ready=false` · **≠** printable UAT  
**must_keep:** UF-HRM-02 · J-HRM-03 · print-spine GWC · Q-CTR-01/02 CLOSED · CORE-09a/b/c · PLT-01

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-CTR-04** | Hợp đồng → chọn mã mẫu từ catalog mở (ví dụ khởi tạo tám mã và/hoặc mã HR) → xem trước khác nhau | AC-CTR-XEVN-01..04 |
| **J-HRM-CTR-05** | Cùng NV: mẫu văn phòng vs lái xe → GPLX / clause DRIVER | AC-CTR-XEVN-02/03/09 |
| **J-HRM-CTR-06** | HĐTV vs 12T vs 24T vs KXĐ — nhãn + khoảng ngày mặc định | AC-CTR-XEVN-04/05/06 |
| **J-HRM-CTR-07** | Cài đặt → Tạo mẫu thứ chín+ → Lưu → F5 → form HĐ chọn được mã đó → xem trước | AC-CTR-XEVN-11 · AC-PLT-CTR-01 |

**Status:** ⬜ DRAFT paper — QA browser sau BE/FE Settings CRUD catalog mở (cấm khóa cứng tám mã).

## 42. Tạo HĐLĐ redesign (2 bước · clause DnD · ContractWorkspace) — J-HRM-CTR-CREATE/VIEW/HIRE (`PO-HRM-CTR-CREATE-REDESIGN-BA-01` + **BA-02** + **BA-03 AMEND G1** · 2026-08-11)

**Source:** `docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` (CONFIRM-ready) · `PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` · `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md`  
**UI spec:** `docs/hrm/ui-screens/UI-CTR-WORKSPACE.md`  
**Sponsor:** Q1–Q12 (BA-02) + **G1 NV-first / view parity / REC CTA** (BA-03 · 2026-08-11)  
**Honesty:** `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · **≠** module CTR UAT · **AC-CTR-UX-01**  
**must_keep:** UF-HRM-02 · AC-CTR-XEVN-08 · J-HRM-CTR-04..07 · print-spine GWC · Q-CTR-01/02 CLOSED  
**URL bắt buộc (Q2):** `…/command-center/hrm/contracts` — DnD bước 2 · AC-CTR-UX-07  
**Status:** ⬜ CONFIRM journeys — QA `QA-PO-HRM-CTR-WORKSPACE-G1-01` sau FE-01

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-CTR-CREATE-01** | CC → Thêm → tab **NV (default)** search · mẫu · **ngày ký** · hình thức LV · tỉ lệ % · trích yếu → Tiếp | AC-CTR-UX-06 · FIELD-02/03/05 · SUBJECT-01/02 · O1–O3 · O5 |
| **J-HRM-CTR-CREATE-02** | **CC URL** Bước 2 DnD · **Gỡ** (+ confirm mandatory) → Đồng bộ → Xem trước | AC-CTR-UX-07 · DND-01/02 · O6–O7 |
| **J-HRM-CTR-CREATE-03** | `XEVN_PROBATION_*` vs FT 12T — preview title khác | AC-CTR-CATALOG-01 · O5 |
| **J-HRM-CTR-CREATE-04** | Mẫu DRIVER — GPLX đủ/thiếu → preview/chặn | O4 · O11 |
| **J-HRM-CTR-CREATE-05** | «Chỉ lưu sổ» — Lưu không mẫu → F5 | O8 |
| **J-HRM-CTR-CREATE-06** | List → sửa — **ContractWorkspace** edit · template + clause khớp | O12 · L2.5 · BR-CTR-WS-05 |
| **J-HRM-CTR-CREATE-07** | Mẫu catalog 9+ trên picker create → preview | O2 · J-HRM-CTR-07 |
| **J-HRM-CTR-CREATE-08** | UI scan — không honesty paragraph list/dialog | AC-CTR-UX-01 |
| **J-HRM-CTR-CREATE-09** | Tab **Ứng viên** optional — UV **pre-hire** only; UV đã hire → banner NV | AC-CTR-SUBJECT-03 |
| **J-HRM-CTR-CREATE-10** | Tab UV → UV chưa hire → Lưu offer path → F5 | AC-CTR-SUBJECT-03 · G1-2 |
| **J-HRM-CTR-VIEW-01** | List → **Eye** → workspace 2 bước read-only | AC-CTR-VIEW-01/02 |
| **J-HRM-CTR-VIEW-02** | View bước 2 canvas + **In/PDF** | AC-CTR-VIEW-03/04 |
| **J-HRM-CTR-VIEW-03** | View → đóng → Sửa cùng workspace | AC-CTR-VIEW-05 · BR-CTR-WS-05 |
| **J-HRM-CTR-HIRE-CTA-01** | REC chốt tuyển → CTA **Tạo HĐ** → prefill NV + probation → Lưu → F5 | AC-CTR-HIRE-CTA-* · HTP bước 5 |

## 25. EMP employment status / reason catalog — J-HRM-EMP-ST-CAT-* (`EMP-STATUS-CATALOG-BA-01` · 2026-08-08)

**Source:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md` · SA Option **B** Nest `emp_employment_status` + `emp_status_reason`  
**Honesty:** `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **`C-SLICE-≠-MODULE`** · **≠** module EMP UAT  
**must_keep:** EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR/enrollment · personnel load hosts  
**Status:** ⬜ DRAFT journeys — **chưa** QA; Dev **HOLD** đến ba-data CONFIRMED + BE/FE

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-EMP-ST-CAT-01** | Settings → Trạng thái NV → CREATE N+1 → F5 → form NV picker thấy mã | AC-PLT-EMP-STATUS-01d → **01** |
| **J-HRM-EMP-ST-CAT-02** | Form NV invent `status` ∉ EFF → 4xx `HRM-EMP-STATUS-KEY` | AC-PLT-EMP-STATUS-01b · VAL-EMP-ST-CNS-01 |
| **J-HRM-EMP-ST-CAT-03** | EFF=0 soft empty + CTA · admin vẫn CREATE · no seed | AC-PLT-EMP-STATUS-01c |
| **J-HRM-EMP-ST-CAT-04** | Reason invent when required / reason EFF>0 → `HRM-EMP-STATUS-REASON-KEY` | VAL-EMP-STR-CNS-01 |
| **J-HRM-EMP-ST-CAT-05** | Soft-retire status → picker ẩn · history employee OK | AC-PLT-EMP-STATUS-RETIRE · VAL-EMP-ST-CNS-05 |

## 26. Định biên 12 tháng + auto YCTD — J-HRM-REC-HC-01 / 01b (`PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-1  
**SRS:** FR-UC-BP-REC-01 · FR-UC-BP-REC-01b · BR-BP-HC-01/02/04 · Q-REC-HC-2 (TP+HR) · Q-REC-HEADCOUNT cite (ngoài ĐB+BOD → REC-02b)  
**Honesty:** `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY REC-03 campaign · DENY seed  
**must_keep:** UF-HRM-12🟢 · J-HRM-05 · J-REC-WF-01..06  
**Status:** ⬜ DRAFT journeys — **chưa** QA; Dev **HOLD** đến SA-01 Option/F.1 CONFIRMED (+ DATA nếu EXPAND)

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-REC-HC-01** | TP → Tuyển dụng → Định biên/Kế hoạch tuyển ≡ ĐB → lưới 12 tháng → Cần tuyển+SL → Lưu → Gửi duyệt → Approver duyệt → F5 khóa ô → HCNS tổng hợp | AC-REC-HC-01* · U65 · no seed |
| **J-HRM-REC-HC-01b** | After approved → mốc kích hoạt → list YCTD đúng 1/ô → spawn lại không +1 → click YCTD detail (J-HRM-05) | AC-REC-HC-01b* · BR-BP-HC-04 · U65 |

**Group CEO:** rollup `company_id=main` trên tổng hợp (AC-REC-HC-01e / EX-07).

## 27. YCTD trong/ngoài ĐB — J-HRM-REC-YCTD-02 / 02b (`PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-2  
**SRS:** FR-UC-BP-REC-02 · FR-UC-BP-REC-02b · BR-BP-HC-05/06 · BR-YCTD-JD-REF-01/02 · Q-REC-HEADCOUNT RETAIN · Q-REC-HC-2 (SHORT min TP+HR)  
**SA:** Option A LOCKED — UPGRADE `job_requisitions` · one XBOS requisition WF · mode as matrix condition · DEFAULT block đến BOD (out_of_plan)  
**BA O:** O2 vượt ô = **409 reject** · O3 receivable = **`open_for_hire`** · O4 legacy classify-on-edit + block CV · O5 proposals HOLD  
**Honesty:** `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY REC-03 · DENY seed · DENY warn-cho-qua invent  
**must_keep:** UF-HRM-12🟢 · J-HRM-05 · J-HRM-JD-YCTD-01 · J-REC-WF-* · REC-01 spawn/`headcount_cell_id`  
**Status:** ⬜ DRAFT journeys — **chưa** QA; Dev **HOLD** đến DATA-01 + API-01 CONFIRMED

| Journey | Click path | Pass when |
|---------|------------|-----------|
| **J-HRM-REC-YCTD-02** | TP/HR → Tuyển dụng → Yêu cầu tuyển → tạo từ ô Cần tuyển approved → JD Hiệu lực → hire_reason → Lưu → Gửi → Approver SHORT duyệt → F5 `open_for_hire` + JD → detail | AC-REC-YCTD-02* · U65 · no seed |
| **J-HRM-REC-YCTD-02b** | Tạo ngoài ĐB + out_of_plan_reason → Gửi LONG → assert block CV/posted → BOD duyệt → F5 receivable; reject = không mở tin | AC-REC-YCTD-02b* · BR-BP-HC-06 · Y-S9 · U65 |

**Group CEO:** list/detail `company_id=main` rollup (AC-REC-YCTD-02-EX-08); không bypass BOD gate out_of_plan.

---

## 28. Dashboard tuyển «bao giờ đủ người» — J-HRM-REC-DASH-01 / 02 (`PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-3  
**SRS:** FR-UC-BP-REC-08 · BR-BP-HC-01 · BR-REC-08-* · REQ_REC_005 · SA Option A (Nest on-the-fly · physical `/recruitment/dashboard*`)  
**O1–O10:** CONFIRMED · KH cells need_hire_approved · filled=onboard · funnel 5 keys · ETA earliest open YCTD target_month · out_of_plan TT-only · Reports align · cost OUT · ba-data **not required**

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-DASH-01** | Login group/member/HRBP → Tuyển dụng → Dashboard → kỳ/đơn vị → KH/TT/funnel/ETA hoặc empty_guide → GET `/recruitment/dashboard` 2xx → F5 → khoan YCTD → detail YCTD → Back; no Campaign · no C&B · no FE multi-list KH | AC-REC-08-01..09 · U65 · no seed |
| **J-HRM-REC-DASH-02** | Tab Reports tuyển → số khớp Nest semantics (subset OK) → F5 | AC-REC-08-10 · O8 · U65 |

**Group CEO:** rollup `company_id=main` trong scope; Member/HRBP không leak ngoài membership · `recruitment_uat_ready=false` · C-SLICE.

---

## 29. Lịch PV một ACTIVE — J-HRM-REC-IV-01..07 (`PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-4  
**SRS:** FR-UC-BP-REC-06a · BR-BP-REC-IV-01..06 · AC-REC-IV-01..07 · REQ_REC_004 · SA Option A (ACCEPT_AS_IS_UPGRADE `recruitment_interviews` · physical `/recruitment/interviews*`)  
**O1–O10:** CONFIRMED · Lane A path · UV×company cardinality · R-A · `no_show` TERMINAL · soft-gate ≠ 409 · cancel reason CFG optional default · past datetime CFG block default · GET list P2 · no REC-08 reopen · honesty false

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-IV-01** | Login HR → Tuyển dụng → Ứng viên → UV 0 ACTIVE → Xếp lịch → Lưu → badge + `dd/MM/yyyy HH:mm` → F5 → POST `/recruitment/interviews` 2xx | AC-REC-IV-01 · U65 · no seed · RETAIN prior create GWC |
| **J-HRM-REC-IV-02** | UV ACTIVE → thử tạo mới → 409 `HRM-REC-IV-409-ACTIVE` + toast ngày giờ → F5 vẫn 1 ACTIVE | AC-REC-IV-02 · RETAIN |
| **J-HRM-REC-IV-03** | ACTIVE → Hủy → badge «—» → xếp lịch mới → 1 ACTIVE → F5 | AC-REC-IV-03 · residual browser |
| **J-HRM-REC-IV-04** | ACTIVE → Hoàn tất hoặc Không đến (`no_show`) → xếp vòng 2 → 1 ACTIVE | AC-REC-IV-04 · O4 |
| **J-HRM-REC-IV-05** | ACTIVE → Đổi lịch R-A → badge giờ mới → F5; PATCH datetime (không POST create thứ hai) | AC-REC-IV-05 · O3 |
| **J-HRM-REC-IV-06** | Click badge / xem lịch → đúng ACTIVE id (projection); không mở create như SoT | AC-REC-IV-06 · O8 P2 list OK |
| **J-HRM-REC-IV-07** | Stage disallow → xếp lịch → 400 `HRM-REC-IV-400-STAGE-DISALLOW`; toast ≠ 409 ACTIVE | AC-REC-IV-07 · O5 |

**Group CEO / Member / HRBP:** cùng `resolveHrmListScope` list=get=mutate · Lane B ≠ SoT · REC-03 OUT · `recruitment_uat_ready=false` · C-SLICE · DENY reopen REC-01/02/08.

---

## 30. Thư viện JD master — J-HRM-REC-JD-00-01..04 (`PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-5  
**SRS:** FR-UC-BP-REC-00 · BR-BP-JD-01 · Diễn biến #1–#3 · REQ_REC_003 · SA Option A (ACCEPT_AS_IS_UPGRADE `job_description_templates` · physical `/recruitment/job-templates*` · paper F-REC-JD-01 alias)  
**O1–O7:** CONFIRMED · path physical · **ADD** `status` draft\|active\|retired + `is_active` bridge · publish required-on-layout · code UQ 409 · YCTD bind must_keep · 00a/00b/00c peer RETAIN · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-JD-00-01** | Login HR → Tuyển dụng → Thư viện JD → GET `/recruitment/job-templates` 2xx → list/empty → F5 | AC-REC-JD-00-01 · U65 · no seed · O1 |
| **J-HRM-REC-JD-00-02** | Thêm/Sửa → Lưu Nháp → Phát hành (đủ required) → Hiệu lực → F5; thiếu → 4xx; trùng mã → 409 | AC-REC-JD-00-02/03 · P01–P05 · O2/O3/O4 |
| **J-HRM-REC-JD-00-03** | YCTD → chọn JD Hiệu lực → preview → Lưu → F5; thử Nháp/Ngừng → 400 `HRM-JD-YCTD-STATUS` | AC-REC-JD-00-04 · O5 · cite **J-HRM-JD-YCTD-01** RETAIN |
| **J-HRM-REC-JD-00-04** | JD Hiệu lực → Ngừng → YCTD lịch sử vẫn xem; picker mới ẩn JD đó → F5 | AC-REC-JD-00-05 · soft-retire · no CASCADE |

**must_keep:** W1–W4 seals · soft FK `job_template_id` · F-YCTD-JD-* · JD-DYNAMIC L3 · `HRM-REC-JD-POS` · U19 · **J-HRM-JD-01..03** peer (không reopen)  
**DENY:** Nest `/rec` dual · second JD SoT · `job_postings` SoT · seed · flip `jd_dynamic_done` / `recruitment_uat_ready` · C-SLICE · REC-03 OUT.

---

## 31. Quét kho CV nội bộ trước kênh ngoài — J-HRM-REC-CV-04-01..04 (`PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-6  
**SRS:** FR-UC-BP-REC-04 · BR-BP-CV-01 · Diễn biến #1–#2 · special 0-hits/skip · REQ_REC_002 · SA Option A (ACCEPT_AS_IS_UPGRADE pool + UV-YCTD + `pipeline_flags` · physical `/recruitment/*` · paper `/rec` alias)  
**O1–O8:** CONFIRMED · path physical · **ADD** `internal_scan_*` on `pipeline_flags_json` (ba-data NOT REQUIRED) · kho = candidates-pool · title+skill/exp · posted gate · UV-YCTD/CMP must_keep · skip HR\|TP+reason · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-CV-04-01** | Login HR → Tuyển dụng → YCTD `open_for_hire` → Quét kho → tiêu chí chức danh+skill/exp → GET `/recruitment/candidates-pool` 2xx → list/empty → F5 | AC-REC-CV-04-01/02 · O3/O4 · U65 · no seed |
| **J-HRM-REC-CV-04-02** | N≥1 → Gắn UV → Hoàn tất quét → F5 `internal_scan_done`; **hoặc** 0 hits → Hoàn tất → F5 đã quét | AC-REC-CV-04-03/04 · O2/O6 · UV-YCTD RETAIN |
| **J-HRM-REC-CV-04-03** | Skip + lý do → F5 skipped; thiếu lý do → 400; actor sai → 403 | AC-REC-CV-04-05 · EX-02/03 · O7 |
| **J-HRM-REC-CV-04-04** | `posted` trước quét → 400 SCAN-REQUIRED; sau done\|skip → posted 2xx → F5; no Campaign | AC-REC-CV-04-06 · EX-01 · O5 · BR-BP-CV-01 |

**must_keep:** W1–W5 seals · UV-YCTD ONE soft FK · CMP · `open_for_hire` · `pipeline_flags` family (extend) · U19 · **J-HRM-REC-JD-00-*** peer sealed  
**DENY:** Nest `/rec` dual · second CV SoT · REC-03 · scan event sole SoT · seed · flip `jd_dynamic_done` / `recruitment_uat_ready` · C-SLICE · claim UV create = FR-04 DONE.

---

## 32. Lịch sử trạng thái UV gắn YCTD — J-HRM-REC-STG-05-01..04 (`PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-7  
**SRS:** FR-UC-BP-REC-05 · BR-BP-CV-02 · Diễn biến #0a–#2 · special reverse/invent/empty EFF · REQ_REC_002 · SA Option A (ACCEPT_AS_IS_UPGRADE catalog + Lane A YCTD-bound · ADD append-only history · physical `/recruitment/*` · paper `/rec` alias)  
**O1–O9:** CONFIRMED · path physical · **ADD** history table (**ba-data REQUIRED**) · stage home Lane A `candidate_id` (DENY posting-apps / pool SoT) · EFF picker · reject reason · reverse CFG · peers RETAIN · honesty false · Kanban P2 OUT  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-STG-05-01** | Login HR → Tuyển dụng → Ứng viên → mở UV theo YCTD → picker EFF → GET `/recruitment/pipeline-stages/effective` 2xx | AC-REC-05-01 · O1/O4 · U65 · no seed |
| **J-HRM-REC-STG-05-02** | Chọn stage ∈ EFF → Lưu → POST `/recruitment/candidates/:id/transitions` 2xx → F5 stage → Timeline GET `…/stage-history` 2xx → F5 vết còn | AC-REC-05-02/03 · O2/O3 · BR-BP-CV-02 |
| **J-HRM-REC-STG-05-03** | Reject + lý do → F5; thiếu lý do → 400 REJECT-REASON; invent ngoài EFF → 400 UNKNOWN | AC-REC-05-04 · EX-01/02 · O5 |
| **J-HRM-REC-STG-05-04** | Reverse allow → 2xx + history; CFG deny → 400; multi-YCTD chỉ link mở đổi; no Campaign / Nest `/rec` | AC-REC-05-05 · ALT-02 · EX-03/05/08 · O6/O7 |

**must_keep:** W1–W6 seals · UV-YCTD ONE soft FK · CAT STG/EFF · 06a soft-gate · REC-04 J-CV-04-* · CMP · U19  
**DENY:** Nest `/rec` dual · second catalog/history · REC-03 · posting-apps SoT · pool stage as FR-05 SoT · overwrite-only DONE · seed · flip honesty · reopen J-CV-04 · claim 05a create = FR-05 DONE · C-SLICE.

---

## 33. Thư tuyển theo mẫu + đánh giá PV neo UV↔YCTD — J-HRM-REC-06-01..04 (`PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-8  
**SRS:** FR-UC-BP-REC-06 · BR-BP-MAIL-01 / BR-BP-REC-MAIL-01 · Diễn biến #1–#2 · special gửi thất bại / nhiều vòng · REQ_REC_004 · SA Option A (ACCEPT_AS_IS_UPGRADE eval YCTD + ADD mail outbox/log · physical `/recruitment/*` · paper `/rec` alias)  
**O1–O12:** CONFIRMED · path physical · **ADD** mail outbox+log (**ba-data REQUIRED**) · **UPGRADE** eval YCTD-bound Pass/Fail (**ba-data REQUIRED**) · CC interview_invite · mail fail no fake stage · round after 06a TERMINAL · stage chỉ APP-02 · peers RETAIN · honesty false · CSVC P2/OUT  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-06-01** | Login HR → Tuyển dụng → UV theo YCTD → Gửi thư mẫu → POST `/recruitment/candidates/:id/mail` 2xx → F5 outbox+log | AC-REC-06-01 · O1/O3 · U65 · no seed |
| **J-HRM-REC-06-02** | `interview_invite` + CC → 2xx; thiếu CC → 400; send fail → failed + không đổi stage | AC-REC-06-02 · EX-01/02 · O7/O8 · BR-BP-MAIL-01 |
| **J-HRM-REC-06-03** | IV TERMINAL → Đánh giá Pass/Fail chốt → POST eval 2xx → F5 neo YCTD; thiếu Pass/Fail → 400 | AC-REC-06-03 · EX-03/06 · O2/O5/O6 |
| **J-HRM-REC-06-04** | Sau eval → POST transitions 2xx + Timeline F5; mail ≠ stage; no Campaign / Nest `/rec`; no reopen J-STG-05 / J-IV / J-CV-04 | AC-REC-06-04 · EX-05/07 · O7/O9 |

**must_keep:** W1–W7 seals · UV-YCTD ONE soft FK · REC-05 APP-02 · 06a TERMINAL · REC-04 J-CV-04-* · CAT STG/EFF · U19  
**DENY:** Nest `/rec` dual · second mail/eval SoT · pool eval as FR-06 DONE · REC-03 · REC-07 hire · 06b matrix · seed · flip honesty · reopen sealed J-* · C-SLICE · claim Kanban `offer` = FR-06 DONE.

---

## 34. Chấp nhận offer → hồ sơ NS không nhập lại — J-HRM-REC-07-01..04 (`PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-9  
**SRS:** FR-UC-BP-REC-07 · BR-BP-LC-01 / BR-BP-ONB-01 (same intent) · Diễn biến #1–#5 · AC-HTP-05 · REQ_REC_004 · SA Option A (ACCEPT_AS_IS_UPGRADE create+prefill+soft-link+APP-02 · physical `/recruitment/*` · paper `/rec` alias)  
**O1–O12:** CONFIRMED · path physical applications accept-offer · CREATE+prefill no re-key (**ba-data REQUIRED**) · soft stamp · APP-02 hired-outcome only · HTP-05 + CORE handoff · idempotent 2xx · mail≠hire · peers RETAIN · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-07-01** | Login HR → Tuyển dụng → UV–YCTD offer-ready → Chấp nhận offer → POST `/recruitment/applications/:id/accept-offer` 2xx → prefilled emp · soft stamp → POST transitions hired-outcome 2xx → F5 | AC-REC-07-01/02 · O1/O3/O4/O6/O7 · U65 · no seed · ≠ Nest `/rec` · ≠ mail=hire |
| **J-HRM-REC-07-02** | Re-accept cùng application → 2xx same `employee_id`; true conflict → 409 DUP | AC-REC-07-03 · EX-13 · O5 |
| **J-HRM-REC-07-03** | Sau create chưa HĐ → hire-readiness blocker; sau HĐ cùng CT → AC-HTP-05 F5 | AC-REC-07-04/05 · O8 · AC-HTP-05 |
| **J-HRM-REC-07-04** | Ngoài scope / cross-CT → 404/409; PAY payload → 403; no Campaign / no reopen J-06 | EX-04/05/06 · O9/O11 · U19 |

**must_keep:** W1–W8 seals · UV-YCTD ONE soft FK · REC-05 APP-02 · REC-06 mail≠hire (`REC06QC1-MSL4CU2G`) · HTP-05 · hire-employee-link HIRE-400/409 · CAT `is_hired_outcome` · U19  
**DENY:** Nest `/rec` dual · second hire SoT · PAY invent · claim REC-06 mail `offer` = hire · pool/Kanban hired alone = FR-07 DONE · REC-03 · seed · flip honesty · reopen sealed J-06 · C-SLICE.

---

## 35. Hồ sơ vòng công khai (hành chính / phúc lợi) — J-HRM-CORE-01-01..04 (`PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-10  
**SRS:** FR-UC-BP-CORE-01 · BR-BP-SEC-01 · Diễn biến #1–#4 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · REQ_HR_001 / HR-001 · SA Option A (ACCEPT_AS_IS_UPGRADE public ring on LIVE `/employees*` + ADD dependents · paper `/core` alias)  
**O1–O12:** CONFIRMED · physical `/employees*` · allow-list + `HRM-CORE-CB-403` + F5 no leak · FE hide/redirect · dependents quà 1/6 (**ba-data REQUIRED**) · hire handoff ≠ CORE DONE · peers OUT · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-01-01** | Login HCNS → Nhân sự → mở hồ sơ công khai → sửa hành chính → PATCH `/employees/:id` 2xx → F5 | AC-CORE-01-01/02 · O1/O2 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-01-02** | Sau lưu → F5 strip; forced PATCH C&B keys → 403 `HRM-CORE-CB-403` | AC-CORE-01-03/04 · AC-CORE-PUB-02 · O3 |
| **J-HRM-CORE-01-03** | Thêm phụ thuộc (name+relation+DOB) → POST dependents 2xx → F5; quà 1/6 dùng DOB | AC-CORE-01-06/07 · O5 |
| **J-HRM-CORE-01-04** | Non-C&B ẩn/redirect lương; emp REC-07 prefill không re-key; Nest `/rec` DENY; no reopen J-07 | AC-CORE-01-05/08 · O4/O7/O9 · AC-CORE-CB-MAP-01 · U19 |

**must_keep:** W9 REC-07 seal `REC07QC1-MSL5WXU5` · J-HRM-REC-07-* · HTP-05 · LIVE `/employees*` · U19 · soft `candidate_id` · W1–W8 REC seals  
**DENY:** Nest `/core` dual EMP · Nest `/rec` dual · second EMP/deps SoT · claim hire = CORE-01 DONE · CORE-02 write in-seat · CORE-01a required · seed · flip honesty · reopen sealed J-07 · C-SLICE.

---

## 36. Hồ sơ vòng C&B (lương / BH / thuế / ngân hàng) — J-HRM-CORE-02-01..04 (`PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-11  
**SRS:** FR-UC-BP-CORE-02 · BR-BP-SEC-02 · Diễn biến #1–#4 · AC-CORE-CB-01/02 · HR-001 / PAY-001 (read) · SA Option A (ACCEPT_AS_IS_UPGRADE C&B on LIVE packages + employee-insurances · paper `/core/…/compensation` alias)  
**O1–O12:** CONFIRMED · physical `/contracts-insurance/compensation-packages*` + `/employee-insurances*` · AuthZ+audit · versioned salary/PC · bank/MST (**ba-data REQUIRED**) · SI timeline · AC-CORE-CB-02 F5 · CB-403 RETAIN · GTCG ONE deps · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-02-01** | Login C&B → HĐ–BH / vòng C&B → mở mật → GET packages/active 200; non-C&B → AuthZ deny | AC-CORE-02-01 · O4 · BR-BP-SEC-02 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-02-02** | Tạo/revise package (lương+PC+effective_from) → POST/revise 2xx → history ≥2 → F5 | AC-CORE-02-02/03 · O1/O5 · U65 |
| **J-HRM-CORE-02-03** | Sau C&B save → public CORE-01 F5 no leak; forced public PATCH C&B → 403 `HRM-CORE-CB-403` | AC-CORE-02-04/05 · AC-CORE-CB-02 · O3 · must_keep J-CORE-01-02 |
| **J-HRM-CORE-02-04** | Bank/MST trên C&B SoT + SI employee-insurances 2xx; GTCG ONE deps; Nest `/core` 0; no claim CORE-01=C&B DONE | AC-CORE-02-06/07/08/10 · O6/O7/O9 · U19 |

**must_keep:** W10 CORE-01 seal `CORE01QC1-MSL6WMS7` · J-HRM-CORE-01-* · public strip · `HRM-CORE-CB-403` · deps ONE · packages SoT · Nest `/core` DENY · W1–W9 REC seals  
**DENY:** Nest `/core` dual · second compensation/deps SoT · claim CORE-01 public = C&B DONE · reopen sealed J-CORE-01 · CORE-02b/PAY invent · seed · flip honesty · C-SLICE.

---

## 37. Khen thưởng & kỷ luật — thi hành → bảng lương — J-HRM-CORE-08-01..04 (`PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-12  
**SRS:** FR-UC-BP-CORE-08 · BR-BP-RD-01 · Diễn biến #1–#5 · HR-005 · SA Option A (ACCEPT_AS_IS_UPGRADE execute+payroll_link on LIVE rewards/discipline · paper `/core/reward-discipline` alias)  
**O1–O12:** CONFIRMED · physical `/employees/:id/rewards*` + `/discipline*` · amount>0→period · `payroll_link_status` · enforce/cancel unlocked · dual-period 409 · locked deny · note-only not PAY · emp Hoạt động · **ba-data REQUIRED** link cols · honesty false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-08-01** | Login HCNS → Nhân sự → NV Hoạt động → tab KT/KL → title-first create (+ kỳ nếu tiền) → POST rewards\|discipline 2xx → F5; amount>0 thiếu kỳ → 400/409 | AC-CORE-08-01/02 · EX-01 · O1/O2 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-08-02** | Enforce → 2xx → F5 `payroll_link_status=linked` + period; no CORE payslip_line write | AC-CORE-08-03/04 · O3/O8 · BR-BP-RD-01 · U65 |
| **J-HRM-CORE-08-03** | Cancel unlocked → unlink F5; note-only → `none` · not PAY-visible | AC-CORE-08-05/06 · O3/O4 · U65 |
| **J-HRM-CORE-08-04** | Nest `/core` 0; CORE-02 AuthZ/CB/public smoke; locked → 409; no claim CORE-02=DONE / note=FR-08 DONE; no fold `/decisions` | AC-CORE-08-08 · EX-03/06/09/10 · O7/O9/O10 · U19 |

**must_keep:** W11 CORE-02 seal `CORE02QC1-MSL80DU6` · J-HRM-CORE-02-* · packages/eins · AuthZ-403 · CB-403 · W10 CORE-01 · Nest `/core` DENY · LIVE rewards/discipline · W1–W9 REC seals  
**DENY:** Nest `/core` dual RD · PAY process/payslip invent · fold RD into `/decisions` · claim CORE-02 = pillar DONE · claim note-CRUD = FR-08 DONE · reopen sealed J-CORE-02/01 · seed · flip honesty · C-SLICE.

---

## 38. Thư viện điều khoản HĐ (Cài đặt) — J-HRM-CORE-09A-01..04 (`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-13  
**SRS:** FR-UC-BP-CORE-09a · BR-CTR-CL-01..04 · AC-CTR-CL-01..03 · AC-PLT-CTR-CL-01..06 · Diễn biến #1–#5 · HDSD CH06h · SA Option A (ACCEPT_AS_IS_RETAIN Nest `/contracts-insurance/contract-clauses*` · draft in-place · issued bump · `{{field}}` · Settings ≠ body SoT · paper `/core` alias)  
**O1–O12:** CONFIRMED · physical contract-clauses* · draft F5 · issued CONFLICT→activate · snapshot freeze · soft retire · **ba-data HOLD** · honesty false · printable false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-09A-01** | Login → Cài đặt → Thư viện ĐK → Thêm (+ `{{field}}`) → POST contract-clauses 2xx → F5 → Activate 2xx → F5 | AC-CORE-09A-01..03 · AC-CTR-CL-01 · AC-PLT-CTR-CL-04 · O1/O2/O4 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09A-02** | Open draft/not-issued → sửa body → PATCH 2xx → F5 body mới | AC-CORE-09A-04 · AC-PLT-CTR-CL-01 · O3 · U65 |
| **J-HRM-CORE-09A-03** | Issued → PATCH CONFLICT → Activate bump → reopen issued snapshot unchanged | AC-CORE-09A-05/06 · AC-PLT-CTR-CL-02/03 · BR-CTR-CL-01 · O3/O7 · U65 · ≠ print UAT |
| **J-HRM-CORE-09A-04** | Retire 2xx · hide new select · Nest `/core` 0 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB · CORE-01 public; no claim CORE-08=DONE / note=FR-08 / printable | AC-CORE-09A-07/09 · AC-PLT-CTR-CL-06 · O6/O9/O10 · U19 |

**must_keep:** W12 CORE-08 seal `CORE08QC1-MSL9BFFE` · J-HRM-CORE-08-* · RD+payroll_link · W11 CORE-02 · AuthZ-403 · CB-403 · W10 CORE-01 · Nest `/core` DENY · LIVE contract-clauses* · snapshot freeze · W1–W9 REC seals  
**DENY:** Nest `/core` dual CL · Settings/XBOS body SoT · invent 09b/09c/09d print engine · claim CORE-08 = pillar DONE · claim note-CRUD = FR-08 DONE · flip `contracts_printable_ready` · reopen sealed J-CORE-08/02/01 · seed · flip honesty · C-SLICE.

---

## 39. Gói nghề + xem trước HĐLĐ — J-HRM-CORE-09B-01..04 (`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-14  
**SRS:** FR-UC-BP-CORE-09b · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 · Diễn biến #1–#5 · SPEC-01 E.2 · SA Option A (ACCEPT_AS_IS_RETAIN LIVE `pack-resolve` + `POST …/preview` · pack MVP · ephemeral · C&B mask · mandatory gate · paper `/core` alias)  
**O1–O12:** CONFIRMED · physical pack+prev · ephemeral no VER · IT↔DRIVER diff · registry F5 · **ba-data HOLD** · honesty false · printable false  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-09B-01** | Login → Hợp đồng → mở nháp/tạo → GET pack-resolve 200 → suggested + allowed packs VI | AC-CORE-09B-01 · FR-09b #1 · O1/O2 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09B-02** | Chọn gói → POST preview 200 → A/B · job · term · ≥1 ĐK · no VER INSERT | AC-CORE-09B-02/08 · AC-CTR-PRINT-02 · O3/O11 · U65 · ≠ printable UAT |
| **J-HRM-CORE-09B-03** | IT_OFFICE ↔ DRIVER clause diff; non-C&B `cb_masked` | AC-CORE-09B-03/04 · AC-CTR-PRINT-03/07 · O4/O6 · U65 |
| **J-HRM-CORE-09B-04** | missing → `can_issue=false` + list; TPL-NONE; registry F5; Nest `/core` 0; CORE-09a/08/02/01 smoke; no claim CORE-09a=printable / CORE-08=pillar / 09c·09d DONE | AC-CORE-09B-05/06/07/09 · AC-CTR-PRINT-01/06/08 · O5/O7/O9/O10 · U19 |

**must_keep:** W13 CORE-09a seal `CORE09AQC1-MSLA4LX9` · J-HRM-CORE-09A-* · CL body SoT · snapshot freeze · W12 CORE-08 RD+payroll_link · W11 CORE-02 AuthZ/CB-403 · W10 CORE-01 · Nest `/core` DENY · LIVE pack-resolve+preview · registry CRUD · W1–W9 REC seals  
**DENY:** Nest `/core` dual pack/preview · invent 09c VER/PDF · invent 09d TPL as CORE-09b DONE · claim CORE-09a = printable DONE · flip `contracts_printable_ready` · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · flip honesty · C-SLICE.

---

## 40. Lưu phiên bản + in / PDF HĐLĐ — J-HRM-CORE-09C-01..04 (`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-15  
**SRS:** FR-UC-BP-CORE-09c · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08 · Diễn biến #1–#5 · SPEC-01 E.3 · SA Option A (ACCEPT_AS_IS_RETAIN LIVE `POST/GET …/print-versions*` + `GET …/pdf` · server `can_issue` · snapshot freeze · amend supersede · PREV ephemeral · PDF-from-snapshot · paper `/core` alias)  
**O1–O12:** CONFIRMED · physical VER+PDF · server gate · snapshot · PREV must_keep · registry F5 · **ba-data HOLD** · honesty false · printable false · carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → 09d  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-09C-01** | Login → Hợp đồng → preview đủ → Lưu phiên bản → POST print-versions 201 → list/detail pack + version_no → F5 còn | AC-CORE-09C-01/02 · FR-09c #1/#3/#4 · AC-CTR-PRINT-04 · O1/O2/O6 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CORE-09C-02** | Issued VER → In/Tải PDF → GET pdf 200 `%PDF` · khớp snapshot (library edit không drift) | AC-CORE-09C-03/08 · AC-CTR-PRINT-05 · O3/O11 · U65 · ≠ printable module UAT |
| **J-HRM-CORE-09C-03** | missing → Lưu → 400 ISSUE-BLOCKED + list; TPL-NONE không issued giả | EX-CORE-09C-01/02 · AC-CTR-PRINT-01/06 · O2 · U65 |
| **J-HRM-CORE-09C-04** | Nest `/core` 0; PREV vẫn ephemeral; registry F5; amend supersede; CORE-09b/09a/08/02/01 smoke; no claim CORE-09b=printable / printable / 09d TPL DONE | AC-CORE-09C-04..07 · AC-CTR-PRINT-08 · O4/O5/O7/O9/O10 · U19 |

**must_keep:** W14 CORE-09b seal `CORE09BQC1-MSLB05DZ` · J-HRM-CORE-09B-* · PACK+PREV ephemeral · W13 CORE-09a · W12 CORE-08 RD+payroll_link · W11 CORE-02 AuthZ/CB-403 · W10 CORE-01 · Nest `/core` DENY · LIVE print-versions* + pdf · registry CRUD · W1–W9 REC seals  
**DENY:** Nest `/core` dual VER/PDF · rewrite PREV→INSERT VER · invent 09d TPL as CORE-09c DONE · claim CORE-09b = printable DONE · flip `contracts_printable_ready` · reopen sealed J-HRM-CORE-09B/09A/08/02/01 · seed · flip honesty · C-SLICE.

---

## 41. Catalog mẫu HĐ mở (loại × khối · clause bind) — J-HRM-CTR-04/07 + J-HRM-CORE-09D-01..04 (`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-16  
**SRS:** FR-UC-BP-CORE-09d · AC-CTR-XEVN-01..11 · AC-PLT-CTR-01/06 · AC-PLT-CTR-TPL-01..07+H · BR-CTR-TPL-* · CORR-01 · DYNAMIC-LOCK · Diễn biến #1–#11 · SA Option A (ACCEPT_AS_IS_RETAIN LIVE `GET/POST/PATCH …/contract-templates*` + `PUT …/clauses` · open catalog · Settings 9+ · CODE-INVALID format-only · OBS junction bind · paper `/core` alias)  
**O1–O12:** CONFIRMED · physical TPL · open catalog · Settings 9+ · matrix · OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` IN-SCOPE · registry F5 · **ba-data HOLD** · honesty false · printable false · **≠** closed-8 DONE · **≠** CORE-09c=printable  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CTR-04** / **J-HRM-CORE-09D-01** | Login → Hợp đồng → GET templates open catalog → chọn OFFICE/DRIVER + term → PREV distinct | AC-CORE-09D-01..03 · AC-CTR-XEVN-01..06 · O1/O2/O4 · U65 · ≠ Nest `/core` dual |
| **J-HRM-CTR-07** / **J-HRM-CORE-09D-02** | Settings → Tạo mẫu 9+ → POST 201 → F5 → picker chọn được → PREV | AC-CORE-09D-04/05 · AC-CTR-XEVN-11 · AC-PLT-CTR-01 · O3/O6 · U65 · CODE-INVALID format-only |
| **J-HRM-CORE-09D-03** | Settings → PUT …/clauses bind IT≠DRIVER → F5 → PREV clauses non-empty+distinct (library active) · Nest `/core` 0 | AC-CORE-09D-07 · VAL-09/10 · O5 · closes OBS when PASS · U65 zero-seed |
| **J-HRM-CORE-09D-04** | Registry without template F5; Nest `/core` 0; freeze TPL-03; CORE-09c/09b/09a/08/02/01 smoke; no claim CORE-09c=printable / closed-8 DONE / printable ready | AC-CORE-09D-06/08/09 · AC-CTR-XEVN-08 · O7/O8/O9/O10 · U19 |

**must_keep:** W15 CORE-09c seal `CORE09CQC1-MSLBXMUT` · J-HRM-CORE-09C-* · VER/PDF **≠** printable UAT · W14 CORE-09b PREV ephemeral `CORE09BQC1-MSLB05DZ` · W13 CORE-09a · W12 CORE-08 · W11 CORE-02 · W10 CORE-01 · Nest `/core` DENY · LIVE contract-templates* + put-clauses · CORR-01 · registry CRUD · W1–W9 REC seals  
**DENY:** Nest `/core` dual TPL · closed enum / reject 9th · claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE · flip `contracts_printable_ready` · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 · seed · flip honesty · C-SLICE · DnD/DOCX as FR DONE.

---

## 42. Nhóm field hồ sơ / metadata (EMP-CF RETAIN) — J-HRM-CORE-02B-01..04 (`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-17  
**SRS:** FR-UC-BP-CORE-02b · Diễn biến #1–#4 · AC-PLT-EMP-CUSTOM-01* · VAL-EMP-CF-* · F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 · SA Option A (groups = four allow-list catalogs · field-def = extension-items · `profile_groups_json` HOLD invent/OUT · Nest emp_custom_field / mega-EAV / Nest `/core` DENY · FE `R-PLT-EMP-CF-FE-01` P2 HOLD)  
**O1–O12:** CONFIRMED · **ba-data HOLD** (O5 gap NOT proven) · honesty false · personnel/printable false · **≠** EMPCF = CORE-02b / personnel DONE · **≠** CORE-09d printable / closed-8 DONE  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-02B-01** | Login → Cài đặt catalogs → nhóm allow-list → Thêm mục → POST extension-items 2xx → F5 · Nest `/core` 0 | AC-CORE-02B-01/02 · AC-PLT-EMP-CUSTOM-01 · VAL-ADM-01 · O1/O2/O3 · U65 · ≠ Nest emp_custom_field |
| **J-HRM-CORE-02B-02** | Same save → merge-tokens `custom.emp.*` smoke cite EXT · Employee form mount EFF>0 · F5 | AC-CORE-02B-03/04 · AC-01b · VAL-ADM-02 · O4/O11 · U65 · cite `EMPTOKEXTQA-MSJ57PE1` · ≠ reopen EXT |
| **J-HRM-CORE-02B-03** | EFF>0 → Lưu mã lạ → 4xx `HRM-EMP-CUSTOM-FIELD-KEY` → F5 không giữ | AC-CORE-02B-06 · AC-01c · VAL-CNS-01 · O6 · U65 · cite `EMPCFQA-MSK14LUH` |
| **J-HRM-CORE-02B-04** | Soft-retire hide · finance/public strip · Nest `/core` 0 · CORE-09d..01 smoke · CTA P2 HOLD · no EMPCF=personnel · no CORE-09d printable/closed-8 | AC-CORE-02B-07/08/FE-HOLD/H · AC-01e/01d/01H · O5/O7/O8/O9/O10 · U19 |

**must_keep:** W16 CORE-09d seal `CORE09DQC1-MSLDR8I3` · J-HRM-CORE-09D-* · TPL+clause · printable false · ≠ closed-8 DONE · W15..W10 CORE-09c/09b/09a/08/02/01 · Nest `/core` DENY · EMPCF `EMPCFQA-MSK14LUH` · EXT `EMPTOKEXTQA-MSJ57PE1` · `R-PLT-EMP-CF-FE-01` P2 HOLD · W1–W9 REC seals  
**DENY:** Nest `emp_custom_field` · mega-EAV · Nest `/core` dual · invent `profile_groups_json` primary · claim EMPCF = CORE-02b / personnel UAT · claim CORE-09d printable / closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-09D/09C/09B/09A/08/02/01 · seed · honesty flip · C-SLICE.

---

## 43. Cấp phát tài sản + biên bản (Q-ASSET stub) — J-HRM-CORE-05-01..05 (`PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` · Evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-ba-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-19  
**SRS:** FR-UC-BP-CORE-05 · Luồng #1–#4 · Diễn biến #1–#2 + Thành công · BR-BP-AST-01 · ADR Q-ASSET-MODULE GĐ1 stub · F-CORE-AST-01 physical `/employees/:id/assets*` · residual **R-CORE-05-HANDOVER-01** · **R-CORE-05-CAT-SERIAL-01** · SA Option A (RETAIN assignment · paper `/core` alias · BB gap PROVEN · catalog stub OK · serial 409 · CORE-06 OUT depends_on)  
**O1–O12:** CONFIRMED · **ba-data REQUIRED** (handover gap PROVEN) · catalog/serial schema HOLD · honesty false · personnel/printable false · **≠** CRUD alone = CORE-05 DONE · **≠** CORE-03 = personnel · **≠** invent CORE-06/07 DONE  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-05-01** | Login → Hồ sơ → Tài sản → Thêm → POST assets 2xx → F5 «Đang sử dụng» · Nest `/core` 0 | AC-CORE-05-01/02 · O1/O2/O3 · U65 · ≠ Nest `/core` dual · ≠ full Asset |
| **J-HRM-CORE-05-02** | After create → Xác nhận BB → PATCH confirm 2xx → F5 · Nest `/core` 0 | AC-CORE-05-04/05 · Diễn biến #2 · O4 · closes HANDOVER when PASS · **DRAFT until DATA+API** |
| **J-HRM-CORE-05-03** | Serial đã assigned → POST/PATCH → 409 → F5 không giữ trùng | AC-CORE-05-07 · O6 · CAT-SERIAL serial slice |
| **J-HRM-CORE-05-04** | Status `returned`/`lost` · no silent hard DELETE issued | AC-CORE-05-08 · O7 · CORE-06 history |
| **J-HRM-CORE-05-05** | Nest `/core` 0 · CORE-03/02b/09d..01 smoke · no CORE-03=personnel · no CORE-06/07/printable/closed-8 · OBS P2 idle-ok | AC-CORE-05-MK-*/H/06-OUT · O8–O10 · U19 |

**must_keep:** W18 CORE-03 seal `CORE03QC1-MSLFJH0K` · J-HRM-CORE-03-* · DOC/ET/CHK · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok · ≠ personnel UAT · W17 CORE-02b `CORE02BQC1-MSLEFQC1` · W16..W10 CORE-09d/09c/09b/09a/08/02/01 · Nest `/core` DENY · EMPPLAT `EMPPLATQA-MSIZXHIM` · EMPTOK `EMPTOKQA-MSJ290VB` · W1–W9 REC seals  
**DENY:** Nest `/core` dual AST · wipe CORE-03 DOC/ET/CHK · wipe CORE-02b EMP-CF · full Asset accounting · invent CORE-06/07 DONE · claim LIVE CRUD = FR-05/BB DONE · claim CORE-03 = personnel UAT · claim printable/closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · seed · honesty flip · C-SLICE.

---

## 44. Kích hoạt hồ sơ Hoạt động (checklist gate) — J-HRM-CORE-07-01..05 (`PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-21 seat #23  
**SRS:** FR-UC-BP-CORE-07 · Luồng #1–#4 · Diễn biến #1–#2 + Thành công · **BR-BP-LC-02** (BA cite LC-02 activate) · F-CORE-ACT-01 physical prefer `POST /employees/:id/activate` **or** gated `PATCH /employees/:id` · paper `/core` alias · residuals **R-CORE-07-GATE-01** · **R-CORE-07-ACT-01** · **R-CORE-07-EFF-01** · **R-CORE-07-ATT-12** · SA Option A (RETAIN status spine · unlock gate delta · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE)  
**O1–O12:** CONFIRMED · **ba-data HOLD** (gate aggregate wire-capable · `activated_at` HOLD invent soft ADD · O6 ABSENT PROVEN) · honesty false · personnel/printable false · **≠** checklist đủ = CORE-07 DONE · **≠** free PATCH = CORE-07 DONE · **≠** CORE-06 DONE · **≠** invent PAY/CORE-09/ATT DONE  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-07-01** | Login → NV `pending_docs` → checklist CORE-03 → required approved · Nest `/core` 0 · cite checklist≠DONE alone | AC-CORE-07-03 · ≠-CHK-DONE · O3/O4 · U65 · **DRAFT until gate display-ready** |
| **J-HRM-CORE-07-02** | Đủ + ngày hiệu lực → POST activate **or** gated PATCH 2xx → F5 `active` · Nest `/core` 0 | AC-CORE-07-01/02/05 · O1/O2/O6 · U65 · **DRAFT until ACT residual live** |
| **J-HRM-CORE-07-03** | Incomplete → activate → 409 · F5 vẫn `pending_docs` | AC-CORE-07-04 · O3 · U65 · **DRAFT until GATE live** |
| **J-HRM-CORE-07-04** | Free PATCH ≠ PASS FR-07 · ATT emit cite · ≠ invent ATT/PAY/CORE-09 DONE | AC-CORE-07-≠-PATCH-DONE/06/ATT-OUT · O5/O7 · U65 |
| **J-HRM-CORE-07-05** | Nest `/core` 0 · CORE-06/05/03/02b/09d..01 smoke · no CORE-06 DONE · no checklist=CORE-07 DONE · no printable/closed-8 · `R-CORE-06-HONESTY` idle-ok | AC-CORE-07-MK-*/H · O10 · U19 |

**must_keep:** W20 CORE-06 seal `CORE06QC1-MSLID363` · soft≠DONE · `R-CORE-06-HONESTY` INFO idle-ok · ≠ CORE-06 DONE · W19 CORE-05 `CORE05QC1-MSLGVT40` · W18 CORE-03 `CORE03QC1-MSLFJH0K` · W17 CORE-02b `CORE02BQC1-MSLEFQC1` · W16..W10 CORE-09d/09c/09b/09a/08/02/01 · Nest `/core` DENY · EMPPLAT `EMPPLATQA-MSIZXHIM` · EMPTOK `EMPTOKQA-MSJ290VB` · W1–W9 REC seals  
**DENY:** Nest `/core` dual ACT · wipe CORE-06/05/03/02b · invent PAY/CORE-09/ATT-12 DONE · claim checklist đủ = CORE-07 DONE · claim free PATCH = CORE-07 DONE · claim CORE-06 DONE / soft=DONE · claim printable/closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-06-01..05 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · honesty flip · C-SLICE.

## 45. Hợp đồng LĐ — mẫu điền sẵn / sổ đăng ký (parent CORE-09) — J-HRM-CORE-09-01..06 (`PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-22 seat #24  
**SRS:** FR-UC-BP-CORE-09 · Luồng #1–#5 · Diễn biến #1–#4 + Thành công · **AC-CTR-TPL-01..05** · **BR-BP-CTR-01** · **AC-CTR-XEVN-08** · F-CORE-CTR-01 registry · F-CORE-CTR-PREV-01 keyword fill · peers 09a–09d ADD must_keep · SA Option A (RETAIN LIVE fill+registry · Word/DOCX OUT · 09a–d ADD ≠ CORE-09 DONE · registry ≠ DONE alone · printable false)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · **≠** 09a–d ADD = CORE-09 DONE · **≠** registry CRUD = CORE-09 DONE · **≠** Word/DOCX = FR-09 DONE · **≠** claim CORE-07 DONE · soft≠CORE-06 DONE  

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-09-01** | Login → Hợp đồng → 0 active TPL → CTA cấu hình · cố Lưu VER từ mẫu → chặn · Nest `/core` 0 · no seed | AC-CORE-09-03 · AC-CTR-TPL-01 · O6 · U65 · **DRAFT** |
| **J-HRM-CORE-09-02** | Có mẫu → chọn → POST preview 200 → merged_fields từ hồ sơ (+ C&B) · `{{token}}` · Nest `/core` 0 | AC-CORE-09-04/02 · AC-CTR-TPL-02 · O2/O7 · U65 · **DRAFT** |
| **J-HRM-CORE-09-03** | Missing required → Lưu VER → can_issue=false / ISSUE-BLOCKED + list · F5 no fake VER | AC-CORE-09-05 · AC-CTR-TPL-03 · O8 · U65 · **DRAFT** |
| **J-HRM-CORE-09-04** | Non-C&B → PREV `cb_masked` · không lộ lương/MST · CORE-02 CB must_keep | AC-CORE-09-06 · AC-CTR-TPL-04 · O9 · U65 · **DRAFT** |
| **J-HRM-CORE-09-05** | PREV đủ → POST print-versions 2xx → F5 còn · Nest `/core` 0 · ≠ printable flip | AC-CORE-09-07 · AC-CTR-TPL-05 · O10/O11 · U65 · **DRAFT** |
| **J-HRM-CORE-09-06** | CRUD sổ không mẫu → F5 · Nest `/core` 0 · 09a–d≠DONE · registry≠DONE · Word OUT · printable false · CORE-07 GATE/ACT-400/Nest DENY/checklist≠DONE/free PATCH≠DONE · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/ATT | AC-CORE-09-08/≠-REG/≠-ADD/H/MK-* · O4/O5/O10 · U19 · **DRAFT** |

**must_keep:** W21 CORE-07 seal `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · `R-CORE-07-FE-EMPLOYEE-RECORD` P2 idle-ok · `R-CORE-07-HONESTY` INFO · W20 CORE-06 `CORE06QC1-MSLID363` soft≠DONE · W19 CORE-05 `CORE05QC1-MSLGVT40` · W18 CORE-03 `CORE03QC1-MSLFJH0K` · W17 CORE-02b `CORE02BQC1-MSLEFQC1` · W16..W10 CORE-09d/09c/09b/09a/08/02/01 · Nest `/core` DENY · LIVE registry + keyword fill · W1–W9 REC seals  
**DENY:** Nest `/core` dual CTR · Word/DOCX primary invent · wipe CORE-07/06/05/03/02b/09d..01 · invent PAY/ATT/printable DONE · claim 09a–d ADD = CORE-09 DONE · claim registry CRUD = CORE-09 DONE · claim CORE-07 DONE · claim checklist/free PATCH = CORE-07 DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-07-01..05 / 06 / 05 / 03 / 02B / 09D/09C/09B/09A/08/02/01 · seed · honesty flip · C-SLICE.

## 46. BHXH lifecycle (Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume) — J-HRM-CORE-10-01..06 (`PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-23 seat #25  
**SRS:** FR-UC-BP-CORE-10 · Luồng #1–#5 · Diễn biến #1–#4 + Thành công · **AC-SI-TL-01..06** · **BR-BP-SI-01** · F-CORE-SI-01/02/03 · peers AC-SI-CAT/INR RETAIN cite · SA Option A (RETAIN LIVE `/employee-insurances*` + actions · catalog ≠ CORE-10 DONE · CRUD ≠ DONE · LIVE ≠ module DONE · BH Hoạt động ≠ CORE-07 · PAY-06 OUT · printable false)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · **≠** catalog = CORE-10 DONE · **≠** enrollment CRUD = CORE-10 DONE · **≠** LIVE actions = module DONE without J-* · **≠** claim CORE-09/07 DONE · soft≠CORE-06 DONE · **PAY AC-SI-TL-06 OUT invent DONE**

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-CORE-10-01** | Login → Hồ sơ → tab BH → GET employee-insurances 200 · periods[] · Nest `/core` 0 · no seed | AC-CORE-10-01/LOAD · O1/O11 · U65 · **DRAFT** |
| **J-HRM-CORE-10-02** | Đóng + ngày → POST actions `close` 2xx → F5 còn dòng mới + lịch sử cũ · Nest `/core` 0 | AC-SI-TL-01 · AC-CORE-10-CLOSE · O2/O4 · U65 · **DRAFT** |
| **J-HRM-CORE-10-03** | Ngừng + ngày → POST `stop` 2xx → F5 · ≠ DELETE-as-ngừng · Nest `/core` 0 | AC-SI-TL-02 · AC-CORE-10-STOP · O2 · U65 · **DRAFT** |
| **J-HRM-CORE-10-04** | (Neg) tạm hoãn thiếu căn cứ → 400 ACTION-400 · (Pos) suspend + reason → 2xx → F5 · Nest `/core` 0 | AC-SI-TL-03 · AC-CORE-10-SUSPEND* · O5 · U65 · **DRAFT** |
| **J-HRM-CORE-10-05** | Đổi mức → POST `change_rate` 2xx · period mới · PATCH contrib 400 redirect · Nest `/core` 0 | AC-SI-TL-04 · AC-CORE-10-RATE · O4 · U65 · **DRAFT** |
| **J-HRM-CORE-10-06** | Resume → enrollment active · F5 history · Nest `/core` 0 · catalog≠DONE · CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · printable false · PAY-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/ATT | AC-SI-TL-05 · AC-CORE-10-RESUME/F5/≠-*/H/MK-* · O3/O6/O7/O8/O9/O10 · U19 · **DRAFT** |

**must_keep:** W22 CORE-09 seal `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE · W21 CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · W20 CORE-06 `CORE06QC1-MSLID363` soft≠DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE enrollment + actions · W1–W9 REC seals  
**DENY:** Nest `/core` dual SI · wipe CORE-09/07/06/05/03/02b/09d..01 · invent PAY/ATT/printable/Word DONE · claim catalog/CRUD/LIVE = CORE-10 DONE · conflate BH Hoạt động ↔ CORE-07 · claim CORE-09/07 DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-09-01..06 / 07 / 06 / 05 / 03 / 02B / 09D..01 · seed · honesty flip · C-SLICE.

## 47. Nền tảng cấu hình động (catalog · schema · merge) — J-HRM-PLT-01-01..06 (`PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-24 seat #26  
**SRS:** FR-UC-BP-PLT-01 · Luồng #1–#5 · Diễn biến #1–#5 + Thành công · **BR-PLT-01..06** · AC principle AC-PLT-* · F-PLT-TOK-01..03 · SA Option A (RETAIN LIVE Catalog + FormSchema + MergeToken `/merge-tokens*` · Nest `/core` DENY · ≠ PLT DONE · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · printable false · PAY/ATT OUT)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · **≠** PLT-01 DONE · **≠** peer catalog = PLT DONE · **≠** merge = platform UAT · **≠** catalog/CRUD/LIVE = CORE-10 DONE · **≠** claim CORE-10/09/07 DONE · soft≠CORE-06 DONE · **PAY/ATT OUT invent DONE** · mega-EAV DENY · narrow ≠ full ATT/PAY module

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-PLT-01-01** | Login → Cài đặt → catalog hẹp N+1 Lưu 2xx → F5 · consumer KEY when EFF · Nest `/core` 0 · no seed · ≠ PLT DONE | AC-PLT-01-LOAD/CAT/CNS/PATH · O1/O4/O10 · U65 · **DRAFT** |
| **J-HRM-PLT-01-02** | Soft-retire → picker ẩn · lịch sử OK · no hard-delete · Nest `/core` 0 | AC-PLT-01-RETIRE · O6 · U65 · **DRAFT** |
| **J-HRM-PLT-01-03** | Lưu schema hẹp (EMP-CF/JD/CTR) → F5 còn · no mega-EAV · jd_dynamic false · Nest `/core` 0 | AC-PLT-01-SCHEMA · O2 · U65 · **DRAFT** |
| **J-HRM-PLT-01-04** | GET `/api/hrm/merge-tokens` 200 · labelVi · Nest `/core` 0 · ≠ platform UAT alone | AC-PLT-01-TOK-LIST · O3 · U65 · **DRAFT** |
| **J-HRM-PLT-01-05** | Lưu DOC/ET hoặc EMP-CF → F5 token list có/refresh · Nest `/core` 0 | AC-PLT-01-TOK-REG · AC-PLT-EMP-TOK · O3 · U65 · **DRAFT** |
| **J-HRM-PLT-01-06** | Cite CORE-09 VER freeze · Nest `/core` 0 · ≠ PLT DONE · peer catalog≠PLT · merge≠UAT · catalog/CRUD/LIVE≠CORE-10 DONE · printable false · PAY/ATT OUT · CORE-10/09/07 RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/ATT | AC-PLT-01-FREEZE/≠-*/H/MK-* · O5/O7/O8/O9 · U19 · **DRAFT** |

**must_keep:** W23 CORE-10 seal `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE · W22 CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE · W21 CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE three-layer Catalog+FormSchema+MergeToken · W1–W9 REC seals  
**DENY:** Nest `/core` dual platform · mega-EAV · wipe CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/ATT/printable/Word DONE · claim peer catalog = PLT DONE · claim merge = platform UAT · claim catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-10/09/07 DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

## 48. Phạt muộn / về sớm đa chế độ — J-HRM-ATT-02-01..06 (`PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-25 seat #27  
**SRS:** FR-UC-BP-ATT-02 · Luồng #1–#5 · Diễn biến #1–#5 + Thành công · **BR-BP-SHF-02** · TIME-002 · F-ATT-RULE-01 · F-ATT-PUNCH-01 · SA Option A (RETAIN LIVE `/attendance/rules` + work-sites/punch + `work_shifts` + late_early ≠ mode + sheet `late_penalty_hours` · XOR minute\|block\|tier · Nest `/core` DENY · ≠ ATT UAT · ≠ CFG alone DONE · printable false · PAY OUT)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-02 DONE from round/`notify_late`/đơn · **≠** ATT module UAT · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-ATT-02-01** | Login → Cài đặt chấm → một mode + mức Lưu 2xx → F5 · Nest `/core` 0 · no seed · ≠ ATT-02 DONE from round alone | AC-ATT-02-LOAD/MODE/PATH · O1/O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-02-02** | Lẫn mode → từ chối · F5 không giữ mixed · Nest `/core` 0 | AC-ATT-02-XOR · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-02-03** | Chấm nguồn hợp lệ → phạt khớp mode · funnel `late_penalty_hours` · Nest `/core` 0 · ≠ ATT-10/PAY | AC-ATT-02-SRC/EVAL/SCOPE · O3/O4/O5 · U65 · **DRAFT** |
| **J-HRM-ATT-02-04** | Nguồn ngoài list → từ chối hoặc 0 công · Nest `/core` 0 | AC-ATT-02-SRC-NEG · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-02-05** | Tắt phạt → penalty 0 · notify_late ≠ off · Nest `/core` 0 | AC-ATT-02-OFF · O6 · U65 · **DRAFT** |
| **J-HRM-ATT-02-06** | F5 · Nest `/core` 0 · ≠ ATT-02 DONE · CFG/đơn ≠ FR-02 · ≠ ATT UAT · peer≠PLT · merge≠UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/Word | AC-ATT-02-F5/≠-*/H/MK-* · O7/O9/O10/O11 · U19 · **DRAFT** |

**must_keep:** W24 PLT-01 seal `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE · W22 CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE · W21 CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE ATT CFG + source + shift + funnel stubs · W1–W9 REC seals  
**DENY:** Nest `/core` dual ATT · wipe PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · claim round/`notify_late`/đơn = ATT-02 DONE · claim ATT module UAT · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

## 49. Trừ phép xuyên T7–CN–Lễ — J-HRM-ATT-08-01..06 (`PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01` · 2026-08-09)

**Source:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` · Program `PO-HRM-MVP-GD1-CONTINUOUS` Wave-26 seat #28  
**SRS:** FR-UC-BP-ATT-08 · Luồng #1–#5 · Diễn biến #1–#4 + FAIL calendar + Thành công · **BR-BP-LV-05** · REQ_NP_006 · Q-LEAVE-UNIT · F-ATT-LEAVE-01 · F-ATT-HOL-01 peer · SA Option A (RETAIN LIVE leave-requests* + balance/panel + att_leave_type/EFF + calendar helpers · unlock ENGINE/PREVIEW/HOL/UNIT/ALIGN · Nest `/core` DENY · ≠ ATT UAT · ≠ client-days DONE · ≠ ATT-09/ATT-03b DONE · CFG≠ATT-02 DONE · printable false · PAY OUT)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-08 DONE from client `total_days`/calendar expand · **≠** ATT-09/ATT-03b DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-ATT-08-01** | Login → Đơn nghỉ → T6→T2 + loại trừ quỹ → Preview Ngày trừ = **2** (không 4) · Nest `/core` 0 · no seed · ≠ ATT-08 DONE from client `total_days` alone | AC-ATT-08-LOAD/RANGE/ENGINE/GOLD/PREVIEW/PATH · O1/O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-08-02** | Assert/trừ calendar **4** cho T6–T2 → **FAIL AC** · không soft-OK · Nest `/core` 0 | AC-ATT-08-FAIL-CAL · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-08-03** | Range có lễ → trừ đúng · thiếu lịch năm → **chặn nộp** · Nest `/core` 0 · ≠ ATT-03b DONE | AC-ATT-08-HOL/WE/HOL-MISS · O3/O4 · U65 · **DRAFT** |
| **J-HRM-ATT-08-04** | Toàn T7/CN/Lễ → `working_days=0` + cảnh báo · Nest `/core` 0 | AC-ATT-08-ZERO · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-08-05** | leave_type day half → 0.5 · hour → 1h · Nest `/core` 0 · Q-LEAVE-UNIT | AC-ATT-08-UNIT · O5 · U65 · **DRAFT** |
| **J-HRM-ATT-08-06** | F5 · ALIGN thin · Nest `/core` 0 · ≠ ATT-08 DONE · client/expand ≠ FR-08 · ≠ ATT-09/ATT-03b DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · ATT-02/PLT/CORE RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/Word | AC-ATT-08-F5/ALIGN/≠-*/H/MK-* · O6/O7/O9/O10/O11 · U19 · **DRAFT** |

**must_keep:** W25 ATT-02 seal `ATT02QC1-MSLQZUK7` · CFG≠DONE · ≠ ATT UAT · Nest `/core` ATT 0 · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT DONE · merge≠platform UAT · ≠ PLT/platform UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · PAY-06 OUT · ≠ CORE-10 DONE · W22 CORE-09 `CORE09QC1-MSLNBA89` · printable false · ≠ CORE-09 DONE · W21 CORE-07 `CORE07QC1-KZJTSHNT` · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE leave + balance + leave_type + calendar helpers · W1–W9 REC seals  
**DENY:** Nest `/core` dual ATT · wipe ATT-02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · claim client `total_days`/calendar expand = ATT-08 DONE · claim ATT-09/ATT-03b DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 50. Giữ chỗ quỹ phép khi nộp & duyệt — J-HRM-ATT-09-01..06 (`PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-09 · Diễn biến #0a–#6 + Thành công · **BR-BP-LV-06** · BR-BP-LV-05 peer · BR-BP-LV-TYPE-01 · REQ_NP_003 · Q-LEAVE-UNIT · GĐ1 một QL trực tiếp · F-ATT-LEAVE-02/03 · F-ATT-LEAVE-01 must_keep · SA Option A (RETAIN LIVE leave create/approve/reject + `pending_days` hold · unlock HOLD/SETTLE/PANEL/SOFT/TYPE/GĐ1/DISP · paper held→pending_days · **DENY** invent `att_leave_hold` · Nest `/core` DENY · ≠ soft=ATT-09 DONE · ≠ ATT-08 preview=ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-09 DONE from soft create alone · **≠** ATT-08 preview = ATT-09 DONE · **≠** client-days=ATT-08 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Click path (draft) | AC / notes |
|------|--------------------|------------|
| **J-HRM-ATT-09-01** | Login → Đơn nghỉ → Gửi (tracked) → pending↑ available↓ · Nest `/core` 0 · no seed · held=`pending_days` · ≠ soft alone DONE · ≠ ATT-08=ATT-09 DONE | AC-ATT-09-LOAD/HOLD/HOLD-SOT/PANEL/PATH · O1/O2/O5/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-09-02** | After hold → QL Duyệt → pending→used · Nest `/core` 0 · GĐ1 one manager · ≠ multi-level | AC-ATT-09-SETTLE/GĐ1 · O4/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-09-03** | After hold → QL Từ chối → hoàn 100% · Nest `/core` 0 | AC-ATT-09-RELEASE · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-09-04** | Tracked 2xx without pending↑ → FAIL · soft no-row OK + ≠ soft=ATT-09 DONE · Nest `/core` 0 | AC-ATT-09-FAIL-NOHOLD/SOFT/≠-SOFT-DONE · O2/O3 · U65 · **DRAFT** |
| **J-HRM-ATT-09-05** | Overlap chặn · đổi loại pending chặn · một QL đủ · Nest `/core` 0 · ≠ multi-level DONE | AC-ATT-09-OVERLAP/TYPE-BLOCK/≠-MULTI · O7/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-09-06** | F5 · Nest `/core` 0 · ≠ ATT-09 DONE · soft≠FR-09 · ≠ ATT-08=ATT-09 · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/Word | AC-ATT-09-F5/≠-*/H/MK-* · O6/O10/O11/O12 · U19 · **DRAFT** |

**must_keep:** W26 ATT-08 seal `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT · Nest `/core` leave 0 · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE leave hold + panel  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · wipe ATT-08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · claim soft create = ATT-09 DONE · claim ATT-08 preview = ATT-09 DONE · claim client-days = ATT-08 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 51. Tổng hợp bảng công (phễu giờ công tính lương) — J-HRM-ATT-10-01..06 (`PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-10 · Diễn biến #1–#3 + Thành công · **BR-BP-TS-01** · phễu SoT · REQ_L_001 · F-ATT-SHEET-01/AGG · submit→AGG · F-ATT-SHEET-02..04 peer ATT-11 OUT · SA Option A (RETAIN LIVE AGG + `att_timesheet_line` · unlock FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP · paper `/att`+`/core` alias · HOL/MEAL OUT GĐ1 · payable gold = std+paid+otW · Nest `/core` DENY · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold`)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (ADD only HOL/MEAL/PAYABLE closable) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-10 DONE from AGG alone · **≠** ATT-11/PAY DONE · **≠** soft/ATT-08=ATT-09 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Click path (draft) | AC / notes |
|------|--------------------|------------|
| **J-HRM-ATT-10-01** | Login → Bảng công → chọn kỳ → AGG → lines SoT PRESENT · Nest `/core` 0 · no seed · ≠ AGG alone DONE · HOL/MEAL footer OUT | AC-ATT-10-LOAD/AGG/FUNNEL/FOOTER/PATH/≠-AGG-DONE · O1/O3/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-10-02** | Submit → must AGG → lines · F5 · Nest `/core` 0 · ≠ ATT-11 DONE | AC-ATT-10-SUBMIT/F5/≠-11 · O2/O8 · U65 · **DRAFT** |
| **J-HRM-ATT-10-03** | OT ×coef in payable · FAIL raw · Nest `/core` 0 · PAY không nhân lại | AC-ATT-10-OT/FAIL-RAW-OT · O7 · U65 · **DRAFT** |
| **J-HRM-ATT-10-04** | Payable gold · unpaid∉ · penalty display · cite ATT-09 · DENY att_leave_hold · Nest `/core` 0 | AC-ATT-10-PAYABLE/GOLD/LEAVE/MK-ATT09 · O5/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-10-05** | Warnings thiếu punch · closed 409 · Nest `/core` 0 · ≠ invent ATT-11 DONE | AC-ATT-10-WARN/LOCKED/≠-11 · O8 · U65 · **DRAFT** |
| **J-HRM-ATT-10-06** | F5 · Nest `/core` 0 · ≠ ATT-10 DONE · AGG≠FR-10 · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent `att_leave_hold` · ATT-09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · no reopen seals · ≠ invent PAY/Word | AC-ATT-10-F5/≠-*/H/MK-* · O10/O11/O12 · U19 · **DRAFT** |

**must_keep:** W27 ATT-09 seal `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · W26 ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE AGG + `att_timesheet_line`  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · wipe ATT-09/08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · claim AGG alone = ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 52. Ký chốt bảng công (WF XBOS · NV+QL+HR) — J-HRM-ATT-11-01..06 (`PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-11 · Diễn biến #1–#3 + Thành công · **BR-BP-TS-02** · **R-SIGN-01** · REQ_L_001 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 · F-ATT-SHEET-04 peer PAY OUT · SA Option A (RETAIN LIVE signatures+close/reopen + `att_timesheet_sign_step` · FIXED_GĐ1 3-persona · unlock WF/INBOX/REJECT/CLOSE/CSUM/EMIT/REOPEN/DISP · paper `/att`+`/core` alias · Nest `/core` DENY · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY invent HOL/MEAL/`lines[]` DONE · R-ATT-10-DISP P2 HOLD)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (ADD only CSUM/WF sync closable) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-11 DONE from LIVE alone · **≠** AGG=ATT-10 DONE · **≠** soft/ATT-08=ATT-09 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Intent (U65 FE) | AC / notes |
|------|-----------------|------------|
| **J-HRM-ATT-11-01** | Login → Bảng công → sheet `submitted` → GET signatures · Nest `/core` 0 · no seed · ≠ LIVE alone DONE · cite ATT-10 ≠ AGG=DONE | AC-ATT-11-LOAD/GET-SIGN/PREREQ/DISP/PATH/≠-LIVE-DONE · O1/O2/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-11-02** | Ký đủ NV+QL+HR → POST close → F5 `closed` · Nest `/core` 0 · ≠ invent PAY DONE | AC-ATT-11-SIGN/LADDER/CLOSE/F5/PAY-OUT · O3/O6/O8/O11 · U65 · **DRAFT** |
| **J-HRM-ATT-11-03** | Reject path → can_close false → close 409 INCOMPLETE · Nest `/core` 0 | AC-ATT-11-REJECT/FAIL-REJECT · O5/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-11-04** | Incomplete / no-bypass Chốt → 409 INCOMPLETE · Nest `/core` 0 | AC-ATT-11-NO-BYPASS/INCOMPLETE · O3/O6 · U65 · **DRAFT** |
| **J-HRM-ATT-11-05** | Reopen + lý do → submitted · archive · F5 · Nest `/core` 0 · ≠ invent PAY adj DONE | AC-ATT-11-REOPEN · U65 · **DRAFT** |
| **J-HRM-ATT-11-06** | F5 · Nest `/core` 0 · ≠ ATT-11 DONE · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · HOL/MEAL/`lines[]` OUT · DENY invent `att_leave_hold` · ATT-10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · R-ATT-10-DISP HOLD · CSUM/INBOX OUT · FIXED_GĐ1 · no reopen seals · ≠ invent PAY/Word | AC-ATT-11-F5/≠-*/H/MK-* · O7/O10/O11/O12 · U19 · **DRAFT** |

**must_keep:** W28 ATT-10 seal `ATT10QC1-MSLWGUYH` · AGG+submit · Nest `/core` AGG 0 · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT · W27 ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · W26 ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE WF-SIGN + close/reopen  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · wipe ATT-10/09/08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word/HOL/MEAL/`lines[]` DONE · claim LIVE alone = ATT-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 53. Quy tắc ca theo bộ phận / nhóm — J-HRM-ATT-01-01..06 (`PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-01 · Diễn biến #1–#2 + Thành công · **BR-BP-SHF-01** · BR-PLT-02/04/05/06 · TIME-001 · F-ATT-CAT-SHIFT-01/02/EFF · F-ATT-SHIFT-CNS-01 · F-ATT-SHIFT-02 residual · peer F-ATT-RULE-01 · SA Option A (RETAIN LIVE `work_shifts*` + CNS + ATT-02 peer · unlock ASSIGN/SCHED/RESOLVE/SCOPE/CNS-FE/DISP/≠DONE · paper `/att`+`/core` alias · Nest `/core` DENY · ≠ catalog alone = ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY invent CSUM/INBOX/`lines[]` DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP P2 HOLD · thin GĐ1 XOR OUT full grid GĐ2)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (ADD only assignment/schedule closable) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-01 DONE from catalog alone · **≠** LIVE=ATT-11 DONE · **≠** AGG=ATT-10 DONE · **≠** soft/ATT-08=ATT-09 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Intent (U65 FE) | AC / notes |
|------|-----------------|------------|
| **J-HRM-ATT-01-01** | Login → Danh sách ca → CRUD Nest · F5 · Nest `/core` 0 · no seed · ≠ CAT=DONE | AC-ATT-01-CAT/EFF/F5/PATH/≠-CAT-DONE · O1/O7/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-01-02** | Gán ca bộ phận/nhóm (residual ASSIGN) → F5 · Nest `/core` 0 · ≠ invent full grid DONE | AC-ATT-01-ASSIGN/SCHED-OUT/SCOPE · O2/O3/O10 · U65 · **DRAFT** |
| **J-HRM-ATT-01-03** | Resolve OU A vs B — giờ/phạt theo ca đang gán · Nest `/core` 0 | AC-ATT-01-RESOLVE/FAIL-RESOLVE · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-01-04** | Đổi ca invent → `HRM-ATT-SHIFT-KEY` · F5 · Nest `/core` 0 · no seed | AC-ATT-01-CNS/INVENT-BAN · O5 · U65 · **DRAFT** |
| **J-HRM-ATT-01-05** | Soft-retire · empty EFF CTA · Nest `/core` 0 · no seed | AC-ATT-01-SOFT/EMPTY · O5/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-01-06** | F5 · Nest `/core` 0 · ≠ ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · CSUM/INBOX/`lines[]` OUT · DENY invent `att_leave_hold` · ATT-11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP HOLD · no reopen seals · ≠ invent PAY/Word | AC-ATT-01-F5/≠-*/H/MK-* · O6/O8/O11/O12 · U19 · **DRAFT** |

**must_keep:** W29 ATT-11 seal `ATT11QC1-MSLXTH9P` · signatures\|close\|reopen · Nest `/core` sign 0 · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM/INBOX/EMIT HOLD · ≠ ATT UAT · W28 ATT-10 `ATT10QC1-MSLWGUYH` · AGG+submit · Nest `/core` AGG 0 · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT · W27 ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · W26 ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE `work_shifts*` + CNS  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · wipe ATT-11/10/09/08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word/CSUM/INBOX/`lines[]` DONE · invent full roster grid GĐ1 DONE · claim catalog alone = ATT-01 DONE · claim LIVE alone = ATT-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 54. Lịch lễ / Tết (dương + âm) — J-HRM-ATT-03B-01..06 (`PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-03b · Diễn biến #1–#2 + Thành công · **BR-BP-HOL-01** · REQ_CC_001 · F-ATT-HOL-01 · peer F-ATT-LEAVE-01 (ATT-08 HOL-MISS) · SA Option A (RETAIN LIVE thin `holiday-calendars/:year` + HOL-MISS · unlock LUNAR/TYPE/PUB/ADMIN/CNS/DISP/≠DONE · paper `/att`+`/core` alias · Nest `/core` DENY · ≠ thin PUT alone = ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY invent ASSIGN DONE · R-ATT-01-ASSIGN open · sheet HOL OUT GĐ1 cite ATT-10 HOL/MEAL OUT)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (ADD only lunar/type/publish closable) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-03b DONE from thin year alone · **≠** catalog=ATT-01 DONE · **≠** LIVE=ATT-11 DONE · **≠** AGG=ATT-10 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **DENY invent ASSIGN DONE** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Intent (U65 FE) | AC / notes |
|------|-----------------|------------|
| **J-HRM-ATT-03B-01** | Login → Lịch lễ/Tết → CRUD năm dương · Lưu/F5 · Nest `/core` 0 · no seed · ≠ thin=DONE | AC-ATT-03B-SOT/ADMIN/F5/PATH/≠-THIN · O1/O5/O7 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-02** | Âm cấu hình năm · FAIL solar-hardcode-only · Nest `/core` 0 | AC-ATT-03B-LUNAR/FAIL-SOLAR · O2 · BR-BP-HOL-01 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-03** | Loại ngày + is_paid · display · ≠ invent PAY · Nest `/core` 0 | AC-ATT-03B-TYPE/PAID · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-04** | Publish XOR replace + mid-year recalc pending leave · Nest `/core` 0 | AC-ATT-03B-PUB/MIDYEAR · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-05** | HOL-MISS chặn nộp · sheet HOL OUT GĐ1 · Nest `/core` 0 · ≠ ATT-03b DONE alone · ≠ AGG=DONE | AC-ATT-03B-CNS-*/≠-AGG10 · O6 · U65 · **DRAFT** |
| **J-HRM-ATT-03B-06** | F5 · Nest `/core` 0 · ≠ ATT-03b DONE · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` · ATT-01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · R-ATT-01-ASSIGN open · R-ATT-11-WF/CSUM HOLD · R-ATT-10-DISP HOLD · no reopen seals · ≠ invent PAY/Word | AC-ATT-03B-F5/≠-*/H/MK-* · O8/O9/O10/O11/O12 · U19 · **DRAFT** |

**must_keep:** W30 ATT-01 seal `ATT01QC1-MSLZ3KIM` · CAT/CNS · Nest `/core` 0 · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · ≠ ATT UAT · W29 ATT-11 `ATT11QC1-MSLXTH9P` · signatures\|close\|reopen · Nest `/core` sign 0 · ≠ LIVE=ATT-11 DONE · R-ATT-11-WF/CSUM HOLD · ≠ ATT UAT · W28 ATT-10 `ATT10QC1-MSLWGUYH` · AGG+submit · Nest `/core` AGG 0 · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · ≠ ATT UAT · W27 ATT-09 `ATT09QC1-MSLUTL9D` · hold/settle · pending_days · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · W26 ATT-08 `ATT08QC1-MSLSL36C` · preview · T6→T2=2 · HOL-MISS · ALIGN · thin HOL peer ≠ ATT-03b DONE · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · LIVE thin `holiday-calendars*`  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · invent ASSIGN DONE · wipe ATT-01/11/10/09/08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · invent sheet HOL = ATT-10 DONE · claim thin year PUT alone = ATT-03b DONE · claim catalog alone = ATT-01 DONE · claim LIVE alone = ATT-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 55. Danh mục điểm GPS (vùng hợp lệ) — J-HRM-ATT-03D-01..06 (`PO-HRM-MVP-GD1-ATT-03D-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-03d · Diễn biến #1–#6 + Thành công · **BR-BP-GPS-01** · F-ATT-CAT-WS-01/02 · F-ATT-PUNCH-01 · ADR D3 · SA Option A (RETAIN LIVE Nest `work-sites*` + punch GEO-001/GEO-REQ · empty skip · FE Settings GPS Nest bind · PLT WS seals cite · unlock ADMIN/CNS/SOFT/EMPTY/GATE/DISP/≠DONE · OVERLAP/SITE/MOB HOLD · paper `/att`+`/core` alias · Nest `/core` DENY · ≠ PLT WS alone = ATT-03d DONE · ≠ residual/thin=ATT-03b DONE · ≠ catalog=ATT-01 DONE · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY invent ASSIGN DONE · DENY `gps_locations` sole SoT · DENY `ensureDefaultWorkSite` · DENY second geofence table · R-ATT-01-ASSIGN open)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (prefer NO second table) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-03d DONE · **≠** PLT WS alone=ATT-03d DONE · **≠** residual/thin=ATT-03b DONE · **≠** catalog=ATT-01 DONE · **≠** LIVE=ATT-11 DONE · **≠** AGG=ATT-10 DONE · **≠** ATT module UAT · **≠** CFG=ATT-02 DONE · **≠** claim PLT/CORE DONE · soft≠CORE-06 DONE · **DENY invent `att_leave_hold`** · **DENY invent ASSIGN DONE** · **PAY OUT invent DONE** · narrow ≠ full ATT/PAY module

| J-ID | Intent (U65 FE) | AC / notes |
|------|-----------------|------------|
| **J-HRM-ATT-03D-01** | Login → Điểm GPS → CRUD N+1 · Lưu/F5 · Nest `/core` 0 · no seed · ≠ PLT=DONE | AC-ATT-03D-SOT/ADMIN/F5/PATH/≠-PLT · O1/O2/O9 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-02** | Soft-retire ẩn geofence · history intact · Nest `/core` 0 | AC-ATT-03D-SOFT · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-03** | Chấm GPS trong vùng · 2xx · F5 · Nest `/core` 0 | AC-ATT-03D-CNS-IN · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-04** | Ngoài vùng → **GEO-001** · Nest `/core` 0 | AC-ATT-03D-GEO-001 · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-05** | Thiếu lat/lon → **GEO-REQ** · FAIL silent 2xx · Nest `/core` 0 | AC-ATT-03D-GEO-REQ · O4 · U65 · **DRAFT** |
| **J-HRM-ATT-03D-06** | Empty skip+CTA · DENY ensureDefault · F5 · Nest `/core` 0 · ≠ ATT-03d DONE · ≠ residual/thin=ATT-03b · ≠ catalog=ATT-01 · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 DONE · peer≠PLT · merge≠UAT · printable false · PAY OUT · DENY invent ASSIGN · DENY invent `att_leave_hold` · DENY gps_locations sole SoT · ATT-03b/01/11/10/09/08/02/PLT/CORE RETAIN · soft≠CORE-06 DONE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P · R-ATT-01-ASSIGN open · no reopen seals · ≠ invent PAY/Word | AC-ATT-03D-EMPTY/F5/≠-*/H/MK-* · O5/O10/O11/O12 · U19 · **DRAFT** |

**must_keep:** W31 ATT-03b seal `ATT03BQC1-MSM0891H` · ≠ residual/thin=DONE · W30 ATT-01 `ATT01QC1-MSLZ3KIM` · CAT/CNS · Nest `/core` 0 · ≠ catalog=ATT-01 DONE · R-ATT-01-ASSIGN open · DENY invent ASSIGN · ≠ ATT UAT · W29 ATT-11 `ATT11QC1-MSLXTH9P` · ≠ LIVE=ATT-11 DONE · W28 ATT-10 `ATT10QC1-MSLWGUYH` · ≠ AGG=ATT-10 DONE · W27 ATT-09 `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` · W26 ATT-08 `ATT08QC1-MSLSL36C` · W25 ATT-02 `ATT02QC1-MSLQZUK7` · CFG≠DONE · W24 PLT-01 `PLT01QC1-MSLPUQIU` · peer≠PLT · merge≠UAT · W23 CORE-10 `CORE10QC1-MSLP0EJB` · W22 CORE-09 `CORE09QC1-MSLNBA89` printable false · W21 CORE-07 `CORE07QC1-KZJTSHNT` · W20 soft≠CORE-06 DONE · W19..W10 CORE-05/03/02b/09d..01 · Nest `/core` DENY · PLT WS `ATTWSQA-MSJC3IN9` · CNS-05 `ATTWSQA2-MSJCG47P` ≠ ATT-03d DONE · LIVE Nest `work-sites*` + punch GEO  
**DENY:** Nest `/core` dual ATT · invent `att_leave_hold` dual · invent ASSIGN DONE · wipe ATT-03b/01/11/10/09/08/02/PLT-01/CORE-10/09/07/06/05/03/02b/09d..01 · invent PAY/printable/Word DONE · Settings/`gps_locations` sole SoT · second geofence table · `ensureDefaultWorkSite` · claim PLT WS alone = ATT-03d DONE · claim residual/thin = ATT-03b DONE · claim catalog alone = ATT-01 DONE · claim LIVE alone = ATT-11 DONE · claim AGG alone = ATT-10 DONE · claim soft/ATT-08 = ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · claim soft = CORE-06 DONE · claim printable/closed-8 DONE · invent SITE-UNKNOWN FAIL / OVERLAP as GĐ1 DONE · flip `attendance_uat_ready` / `hrm_personnel_uat_ready` / `contracts_printable_ready` / recruitment / jd · reopen sealed J-HRM-ATT-03B / ATT-01 / ATT-11 / ATT-10 / ATT-09 / ATT-08 / ATT-02 / PLT-01 / CORE-10/09/07/06/05/03/02B/09D..01 · seed · honesty flip · C-SLICE.

---

## 56. Cấp phát phép năm + danh mục loại phép — J-HRM-ATT-04-01..06 (`PO-HRM-MVP-GD1-ATT-04-CLUSTER-BA-01` · 2026-08-09)

**SRS:** FR-UC-BP-ATT-04 · Diễn biến #0a · #1 · #2 + Thành công · **BR-BP-LV-01** · **BR-BP-LV-TYPE-01** · F-ATT-CAT-LVT/EFF · F-ATT-LVRULE-01..04 · PUT tracked-entitlement · F-ATT-LEAVE-04 HOLD · SA Option A (RETAIN LIVE Nest LVT + LVRULE + ledger grant · FE policy admin GAP · FY HOLD · engine HOLD · paper `/att`+`/core` alias · Nest `/core` DENY · ≠ L1/LVRULE/grant alone = ATT-04 DONE · ≠ soft/ATT-09 = ATT-04 DONE · ≠ ATT UAT · printable false · PAY OUT · DENY `att_leave_hold` · DENY Settings sole · must_keep ATT-03d GPS)  
**O1–O12:** CONFIRMED · **ba-data HOLD default** (FY ADD only if closable · **no** `att_leave_hold` table) · honesty false · printable false RETAIN · `attendance_uat_ready=false` · **≠** ATT-04 DONE · **≠** ATT module UAT · narrow ≠ full ATT/PAY module

| J-ID | Intent (U65 FE) | AC / notes |
|------|-----------------|------------|
| **J-HRM-ATT-04-01** | Settings Loại phép → N+1 → Lưu/F5 · F-ATT-CAT-LVT-02 · Nest `/core` 0 · no seed · ≠ L1=ATT-04 DONE | AC-ATT-04-ADMIN/SOT-LVT · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-04-02** | Quy tắc quủ N+1 (when FE wired) · else API HOLD · F-ATT-LVRULE-* · Nest `/core` 0 · ≠ LVRULE BE=ATT-04 DONE | AC-ATT-04-POLICY · O2 · U65 · **DRAFT** |
| **J-HRM-ATT-04-03** | PUT tracked-entitlement product · 200 · F5 panel · no seed · Nest `/core` 0 · ≠ grant alone=ATT-04 DONE | AC-ATT-04-GRANT · O3 · cite ATT-09 · **DRAFT** |
| **J-HRM-ATT-04-04** | Panel quỹ MVP codes + labels · F5 · Nest `/core` 0 | AC-ATT-04-PANEL · O6 · **DRAFT** |
| **J-HRM-ATT-04-05** | CNS policy bind · reject manual params · Nest `/core` 0 | AC-ATT-04-CNS · O2/O3 · **DRAFT** |
| **J-HRM-ATT-04-06** | FY HOLD · ENGINE HOLD · seals · ≠ ATT-04 DONE · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY `att_leave_hold` · DENY wipe ATT-03d `ATT03DQC1-MSM1CR19` · peer stamps RETAIN · no reopen seals | AC-ATT-04-FY-HOLD/ENGINE-HOLD/H/MK-* · O5/O7/O9/O10/O11/O12 · **DRAFT** |

**must_keep:** W32 ATT-03d `ATT03DQC1-MSM1CR19` · DENY wipe GPS · W31 ATT-03b `ATT03BQC1-MSM0891H` · W30 ATT-01 `ATT01QC1-MSLZ3KIM` · R-ATT-01-ASSIGN open · W29 ATT-11 · W28 ATT-10 · W27 ATT-09 `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` · W26 ATT-08 · W25 ATT-02 CFG≠DONE · PLT/CORE seals · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · Settings/`attendance_rules` sole rule SoT · F-ATT-LEAVE-04 LIVE claim · claim L1/LVRULE/grant/soft09 = ATT-04 DONE · claim ATT UAT · honesty flip · wipe ATT-03d GPS · seed · C-SLICE.

---

## 57. Ứng phép & không lương bù trừ — J-HRM-ATT-04B-01..06 (`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click path summary | AC / lock |
|---------|-------------------|-----------|
| **J-HRM-ATT-04B-01** | Settings Loại phép → bật `allows_advance` → Lưu/F5 · F-ATT-CAT-LVT · Nest `/core` 0 · ≠ flag=FR-04b DONE | AC-ATT-04B-CAT-ADV · O1 · U65 · **DRAFT** |
| **J-HRM-ATT-04B-02** | Form đơn → panel bucket **Ứng phép** + nhãn không lương · F5 · peer 05b · Nest `/core` 0 | AC-ATT-04B-PANEL · O2 · **DRAFT** |
| **J-HRM-ATT-04B-03** | Ứng OFF · vượt khả dụng → Gửi → **400** `HRM_LEAVE_VAL_BALANCE` · FE-after-error · no seed | AC-ATT-04B-GATE-REJECT · O3 · U65 · **DRAFT** |
| **J-HRM-ATT-04B-04** | When cap+FE wired: đề xuất ứng/không lương · else HOLD footer · ≠ reject-only=#1 DONE | AC-ATT-04B-OVER-BAL · O4 · **DRAFT** · conditional |
| **J-HRM-ATT-04B-05** | When DATA+UI: CRUD trần ứng · else HOLD · no hardcode % | AC-ATT-04B-CAP-HOLD · O5 · **DRAFT** · conditional |
| **J-HRM-ATT-04B-06** | OFFSET/DEDUCT/ADVANCED-WIRE HOLD · must_keep ATT04+ATT09+ATT03d · ≠ ATT-04b/ATT-04/ATT UAT · PAY OUT · DENY `att_leave_hold` · printable false | AC-ATT-04B-H/MK-* · O6–O12 · **DRAFT** |

**must_keep:** W33 ATT-04 `ATT04QC1-MSM22G4W` · DENY wipe LVT/LVRULE/grant · W32 ATT-03d `ATT03DQC1-MSM1CR19` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · pending_days · DENY `att_leave_hold` · full ATT peer chain · R-ATT-04-FY · R-ATT-04-ENGINE HOLD · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · F-PAY-ADV-BRIDGE LIVE · F-ATT-LEAVE-04 offset LIVE = slice DONE · claim allows_advance+panel = FR-04b DONE · claim ATT-04b/ATT-04/ATT UAT DONE · wipe ATT-04 paths · honesty flip · seed · C-SLICE.

---

## 58. Phép chuyển kỳ (bảo lưu FY tenant) — J-HRM-ATT-05-01..06 (`PO-HRM-MVP-GD1-ATT-05-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click path (U65 · narrow) | AC / lock |
|---------|---------------------------|-----------|
| **J-HRM-ATT-05-01** | Settings Loại phép → bật `allows_carry_over` / category `carry_over` → Lưu/F5 · F-ATT-CAT-LVT · Nest `/core` 0 · ≠ type=FR-05 DONE | AC-ATT-05-CAT-CARRY · O1 · **DRAFT** |
| **J-HRM-ATT-05-02** | Form đơn → panel bucket **Phép chuyển kỳ** (`carry_over`) · F5 · peer 05b · Nest `/core` 0 | AC-ATT-05-PANEL · O2 · **DRAFT** |
| **J-HRM-ATT-05-03** | Policy LVRULE → CRUD `carry_over_expire_rule` / `carry_cap_days` → Lưu/F5 · ≠ expire job DONE | AC-ATT-05-POLICY-CARRY · O3 · **DRAFT** |
| **J-HRM-ATT-05-04** | Panel/balance: `annual` vs `carry_over` tách · deduct order when wired · else HOLD | AC-ATT-05-LEDGER-SEP/DEDUCT-GAP · O4/O9 · **DRAFT** · conditional |
| **J-HRM-ATT-05-05** | When DATA+UI: CRUD FY tenant + mốc cắt · else HOLD · no hardcode 01/04 | AC-ATT-05-FY-HOLD · O5/O6 · **DRAFT** · conditional |
| **J-HRM-ATT-05-06** | ROLLOVER/EXPIRE ENGINE HOLD · re-home R-ATT-05-FY/ENGINE · must_keep ATT04+ATT04b+ATT09+ATT03d · ≠ ATT-05/04/04b/ATT UAT · PAY OUT · DENY `att_leave_hold` · DENY merge annual · printable false | AC-ATT-05-H/MK-* · O7–O15 · **DRAFT** |

**must_keep:** W33 ATT-04b `ATT04BQC1-MSM3S8QC1` · W33 ATT-04 `ATT04QC1-MSM22G4W` · W32 ATT-03d `ATT03DQC1-MSM1CR19` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · **R-ATT-05-FY** (ex R-ATT-04-FY) · **R-ATT-05-ENGINE** HOLD (ex R-ATT-04-ENGINE) · carry R-ATT-04B-* · R-MAIN-EFFECTIVE-EMPTY non-blocking · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · F-ATT-LEAVE-04 rollover LIVE = slice DONE · PAY termination LIVE · claim panel+policy cols = FR-05 DONE · claim ATT-05/ATT-04/ATT-04b/ATT UAT DONE · merge carry into annual · hardcode 01/04 FY · wipe ATT-04/04b paths · honesty flip · seed · C-SLICE.

---

## 59. Panel quỹ phép khi nộp đơn — J-HRM-ATT-05B-01..06 (`PO-HRM-MVP-GD1-ATT-05B-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click path (U65 · narrow · đơn nghỉ) | AC / lock |
|---------|--------------------------------------|-----------|
| **J-HRM-ATT-05B-01** | Nghỉ phép → **Tạo đơn** → panel trên form · `GET panel` **2xx** · F5 · ≠ settings-only · Nest `/core` 0 | AC-ATT-05B-FORM-PANEL · O1/O6 · **DRAFT** |
| **J-HRM-ATT-05B-02** | Form → bucket **Phép chuyển kỳ** (`carry_over`) tách `annual` · DENY merge · `ATT05QC1` | AC-ATT-05B-CARRY-SEP · O2 · **DRAFT** |
| **J-HRM-ATT-05B-03** | Picker catalog EFF · đổi loại → refetch · preview-deduction **2xx** | AC-ATT-05B-PICKER/TYPE-REFETCH/PREVIEW · O4/O7/O9 · **DRAFT** |
| **J-HRM-ATT-05B-04** | Gửi đơn **2xx** → `pending` trên panel · F5 · DENY `att_leave_hold` | AC-ATT-05B-POST-HOLD · O3/O8 · **DRAFT** |
| **J-HRM-ATT-05B-05** | Catalog trống honest → picker empty + hint admin · no fake row | AC-ATT-05B-EMPTY · O5 · **DRAFT** · conditional |
| **J-HRM-ATT-05B-06** | Overlap 4xx · FY/DEDUCT footer · advance hint · must_keep ATT05+ATT04+ATT04b+ATT09+ATT03d · ≠ ATT-05b/05/04/04b/ATT UAT · PAY OUT · printable false | AC-ATT-05B-H/MK-* · O10–O18 · **DRAFT** |

**must_keep:** W33 ATT-05 `ATT05QC1-MSM52GWC1` · DENY merge carry→annual · W33 ATT-04b `ATT04BQC1-MSM3S8QC1` · W33 ATT-04 `ATT04QC1-MSM22G4W` · W32 ATT-03d `ATT03DQC1-MSM1CR19` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · **R-ATT-05-FY/ENGINE/DEDUCT/FY-CAL** footers · R-MAIN-EFFECTIVE-EMPTY non-blocking · R-ATT-01-ASSIGN open · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · claim `GET panel` alone = FR-05b DONE · claim ATT-05b/ATT-05/ATT-04/ATT-04b/ATT UAT DONE · merge carry into annual · free-text type SoT · honesty flip · seed · C-SLICE.

---

## 60. Phép nghỉ bù từ tăng ca — J-HRM-ATT-06-01..07 (`PO-HRM-MVP-GD1-ATT-06-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click path (U65 · narrow · OT + nghỉ bù) | AC / lock |
|---------|------------------------------------------|-----------|
| **J-HRM-ATT-06-01** | Cài đặt / policy toggle bù OT + tỷ lệ giờ→ngày (GAP hoặc HOLD doc) · Nest `/core` 0 | AC-ATT-06-POLICY/HOURS-DAYS · O6/O7 · **DRAFT** · conditional |
| **J-HRM-ATT-06-02** | Tăng ca → tạo đơn · `compensatory_leave` từ `att_ot_comp_type` EFF · POST OT **2xx** · ≠ auto quỹ at create | AC-ATT-06-CAT-ORTH · O4 · **DRAFT** |
| **J-HRM-ATT-06-03** | Duyệt OT **2xx** · draft guard · pre-engine no quỹ unless interim/engine | AC-ATT-06-OT-APPROVE/DRAFT · O5/O9 · **DRAFT** |
| **J-HRM-ATT-06-04** | Sau duyệt → quỹ `compensatory` ↑ (engine **or** interim `tracked-entitlement`) · FE-after-2xx + F5 · label interim if engine absent | AC-ATT-06-ACCRUE/INTERIM · O2/O8 · **DRAFT** |
| **J-HRM-ATT-06-05** | Nghỉ phép → đơn **nghỉ bù** → panel bucket Phép bù OT on form · `GET panel` **2xx** | AC-ATT-06-PANEL-FE · O13 · **DRAFT** |
| **J-HRM-ATT-06-06** | Gửi đơn nghỉ bù **2xx** → `pending` on compensatory · F5 · DENY `att_leave_hold` | AC-ATT-06-DEDUCT-HOLD · O3 · **DRAFT** |
| **J-HRM-ATT-06-07** | Mode OFF → no new accrual · quỹ cũ usable · must_keep ATT05BQC1+ATT05QC1+ATT04+ATT04b+ATT09+ATT03d+ATT10+ATT11 · ≠ ATT-06/05b/05/04/ATT UAT · DENY merge compensatory/carry→annual · PAY OUT · printable false | AC-ATT-06-MODE-OFF/H/MK-* · O10/O20 · **DRAFT** |

**must_keep:** W33 ATT-05b `ATT05BQC1-MSM5SDQC1` · W33 ATT-05 `ATT05QC1-MSM52GWC1` · DENY merge compensatory/carry→annual · W33 ATT-04b `ATT04BQC1-MSM3S8QC1` · W33 ATT-04 `ATT04QC1-MSM22G4W` · W32 ATT-03d `ATT03DQC1-MSM1CR19` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · W28 ATT-10 `ATT10QC1-MSLWGUYH` · W29 ATT-11 `ATT11QC1-MSLXTH9P` · **R-ATT-06-AGG/PAY-DOUBLE** footers HOLD · **R-ATT-05-*** peer footers · R-ATT-01-ASSIGN open · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · claim compensatory panel row or ot_comp catalog alone = FR-06 DONE · accrual trigger = sheet close · claim ATT-06/ATT-05b/05/04/04b/ATT UAT DONE · merge buckets · honesty flip · seed · C-SLICE.

---

## 61. Nghỉ ốm BH/CTY — J-HRM-ATT-07-01..07 + J-06-04 regression (`PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click / AC summary | Status |
|---------|-------------------|--------|
| **J-HRM-ATT-07-01** | Nghỉ phép → loại ốm ∈ EFF · flags BH/CTY · Nest `/core` 0 | AC-ATT-07-CAT-FLAGS/SICK-CLASSIFY · O1/O2 · **DRAFT** |
| **J-HRM-ATT-07-02** | ốm ≥3 ngày · thiếu attach → `HRM-LEAVE-VAL-ATT` · có attach → toward **2xx** | AC-ATT-07-VAL-ATT · O3 · **DRAFT** |
| **J-HRM-ATT-07-03** | Nộp đơn ốm `POST leave-requests` **2xx** · FE-after-2xx | AC-ATT-07-SUBMIT-HOLD · O4 · **DRAFT** |
| **J-HRM-ATT-07-04** | Hold `pending_days` if tracked · F5 · DENY `att_leave_hold` | AC-ATT-07-SUBMIT-HOLD · O4 · **DRAFT** |
| **J-HRM-ATT-07-05** | Fund-order + day-branch engine **HOLD** footer until LIVE | AC-ATT-07-FUND-ORDER/DAY-BRANCH · O7/O8 · **DRAFT** · HOLD |
| **J-HRM-ATT-07-06** | Panel 5 buckets · sick ∉ MVP · ≠ merge sick→annual | AC-ATT-07-PANEL-NO-SICK · O6 · **DRAFT** |
| **J-HRM-ATT-07-07** | must_keep ATT06QC1+ATT05BQC1+ATT05QC1+ATT09+ATT04+ATT03d+ATT10+ATT11 · ≠ ATT-07/06/05/05b/04/ATT UAT · DENY merge buckets · DENY reopen J-06-* | AC-ATT-07-H/MK-* · O15–O20 · **DRAFT** |
| **J-HRM-ATT-06-04** | Regression: compensatory quỹ · `employee_leave_balances` · ≠ merge→annual · attach to 07 wave if balance paths touched | AC-ATT-07-MK-ATT06 · **ATT06QC1** · **DRAFT** |

**must_keep:** W34 ATT-06 `ATT06QC1-MSM84GWC1` · `ATT06QA1-MSM84RYS` · DENY merge compensatory→annual · DENY reopen J-HRM-ATT-06-01..07 · W33 ATT-05b `ATT05BQC1-MSM5SDQC1` · W33 ATT-05 `ATT05QC1-MSM52GWC1` · W33 ATT-04b `ATT04BQC1-MSM3S8QC1` · W33 ATT-04 `ATT04QC1-MSM22G4W` · W32 ATT-03d `ATT03DQC1-MSM1CR19` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · W28 ATT-10 `ATT10QC1-MSLWGUYH` · W29 ATT-11 `ATT11QC1-MSLXTH9P` · **R-ATT-07-AGG/CORE10** footers HOLD · **R-ATT-06-AGG** peer · R-ATT-01-ASSIGN open · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · claim picker/VAL-ATT alone = FR-07 DONE · claim ATT-07/ATT-06/05/05b/04/04b/ATT UAT DONE · merge compensatory/sick/carry→annual · reopen J-HRM-ATT-06-* without regression · honesty flip · seed · C-SLICE.

---

## 62. Mở quỹ & ca khi Hoạt động — J-HRM-ATT-12-01..07 + J-06-04 / J-07 subset regression (`PO-HRM-MVP-GD1-ATT-12-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click / AC summary | Status |
|---------|-------------------|--------|
| **J-HRM-ATT-12-01** | Hồ sơ NV → Kích hoạt Hoạt động · `effective_date` · Network activate **2xx** | AC-ATT-12-CORE-EMIT · O1/O14 · **DRAFT** |
| **J-HRM-ATT-12-02** | `events[]` **`employee.activated`** · **≠** emit alone = FR-12 DONE · Nest `/core` 0 | AC-ATT-12-≠-EMIT-DONE · O1 · **DRAFT** |
| **J-HRM-ATT-12-03** | F5 · `GET leave-balance`/`panel` · quỹ theo LVRULE · HOLD until consumer LIVE | AC-ATT-12-GRANT/LEDGER/HALF-MONTH · O4/O6 · **DRAFT** |
| **J-HRM-ATT-12-04** | Ca mặc định visible · F5 · **R-ATT-01-ASSIGN** narrow · HOLD until BE | AC-ATT-12-SHIFT-DEFAULT · O7 · **DRAFT** |
| **J-HRM-ATT-12-05** | HCNS strip xác nhận trên hồ sơ · display-ready · F5 | AC-ATT-12-FE-CONFIRM · O9 · **DRAFT** |
| **J-HRM-ATT-12-06** | Nộp đơn phép sau enroll · `POST leave-requests` **2xx** · ATT09 `pending_days` | AC-ATT-12-MK-ATT09 · O11 · **DRAFT** |
| **J-HRM-ATT-12-07** | must_keep CORE07QC1+ATT07QC1+ATT06QC1+ATT05BQC1+ATT05QC1+ATT09+ATT04 · ≠ ATT-12/07/06/05/04/ATT UAT · DENY merge buckets · DENY reopen J-07-* | AC-ATT-12-H/MK-* · O12/O16 · **DRAFT** |
| **J-HRM-ATT-06-04** | Regression compensatory quỹ khi grant paths đụng | **ATT06QC1** · **DRAFT** |
| **J-HRM-ATT-07-03..05** | Regression sick submit · hold · fund-order/dayBranches | **ATT07QC1** · **DRAFT** |

**must_keep:** W35 ATT-07 `ATT07QC1-MSM9GWC1` · `ATT07QA1-MSM9IFO1` · DENY reopen J-HRM-ATT-07-01..07 · W35 ATT-06 `ATT06QC1-MSM84GWC1` · DENY merge compensatory→annual · W33 ATT-05b `ATT05BQC1-MSM5SDQC1` · W33 ATT-05 `ATT05QC1-MSM52GWC1` · W33 ATT-04 `ATT04QC1-MSM22G4W` · W33 ATT-04b `ATT04BQC1-MSM3S8QC1` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · CORE-07 `CORE07QC1-KZJTSHNT` · **R-ATT-04-ENGINE HOLD** · R-ATT-01-ASSIGN open · Nest `/core` DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · claim emit alone = FR-12 DONE · claim manual tracked-entitlement = auto-enroll DONE · claim ATT-12/ATT-07/06/05/05b/04/ATT UAT DONE · merge sick/compensatory/carry→annual · reopen J-HRM-ATT-07-* / J-06-04 without regression · grant on CORE beyond emit · honesty flip · seed · C-SLICE.

---

## 63. Ranh giới lương chỉ đọc bảng công chốt — J-HRM-PAY-01-01..07 + J-ATT-12/07/06 regression (`PO-HRM-MVP-GD1-PAY-01-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click / AC summary | Status |
|---------|-------------------|--------|
| **J-HRM-PAY-01-01** | C&B chọn kỳ lương · menu PAY · scope **2xx** · Nest `/core` hour SoT 0 | **🟢 Dev8088** · `PAY01QA1-MSMBA9OA` · AC-PAY-01-PATH |
| **J-HRM-PAY-01-02** | Bind sheet **closed** · POST timesheet-binds **2xx** · F5 · cite **ATT11QC1** | **🟢 Dev8088** · bind 201/DUP+F5 · AC-PAY-01-BIND-CLOSED |
| **J-HRM-PAY-01-03** | Bind sheet draft/submitted → **412** `HRM-PAY-ATT-412` · elig `NO_CLOSED_SHEET` | **🟢 Dev8088** · AC-PAY-01-BIND-DRAFT-412 · AC-PAY-01-ELIG-NO-CLOSED |
| **J-HRM-PAY-01-04** | Chạy lương chưa closed → **412** `HRM-PAY-ATT-412` | **🟢 Dev8088** · AC-PAY-01-PROCESS-412 |
| **J-HRM-PAY-01-05** | Process after closed bind · **≠ PAY-01 DONE** (formula wave HOLD) | **🟡 Dev8088** · `HRM-PAY-FORMULA-412` expected C-SLICE · AC-PAY-01-PROCESS-HOLD |
| **J-HRM-PAY-01-06** | Network: no leave/OT HTTP for hour vars during process | **🟢 Dev8088** · AC-PAY-01-BOUNDARY |
| **J-HRM-PAY-01-07** | must_keep ATT12QC1+ATT11QC1+peer chain · `payroll_e2e_ready=false` · **≠ PAY UAT** | **🟢 Dev8088** · AC-PAY-01-H/MK-* |
| **J-HRM-ATT-12-07** | Regression ATT-12 seals when PAY touched | **🟢 Dev8088** · **ATT12QC1** regression delegate PASS |
| **J-HRM-ATT-07-03..05** | Regression sick submit · hold · fund-order | **🟢 Dev8088** · **ATT07QC1** |
| **J-HRM-ATT-06-04** | Regression compensatory quỹ | **🟢 Dev8088** · **ATT06QC1** |

**QA evidence:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qa-01.md` · stamp **`PAY01QA1-MSMBA9OA`** · `ack_status` **PASS_TO_PM** · **≠** PAY module UAT · **C-SLICE**

**must_keep:** W36 ATT-12 `ATT12QC1-MSMAIGWC1` · W29 ATT-11 `ATT11QC1-MSLXTH9P` · W28 ATT-10 `ATT10QC1-MSLWGUYH` · W27 ATT-09 `ATT09QC1-MSLUTL9D` · W35 ATT-07 `ATT07QC1-MSM9GWC1` · W34 ATT-06 `ATT06QC1-MSM84GWC1` · W33 ATT-05b `ATT05BQC1-MSM5SDQC1` · CORE-07 `CORE07QC1-KZJTSHNT` · **F-PAY-PROCESS-01 full = PAY-02/06 HOLD** · Nest `/core` hour SoT DENY  
**DENY:** Nest `/core` dual · invent `att_leave_hold` · claim bind/412/bag alone = PAY-01 DONE · claim PAY module UAT · merge sick/compensatory/carry→annual · reopen J-HRM-ATT-12-* / J-07-03..05 / J-06-04 without regression · flip `payroll_e2e_ready` · honesty flip · seed · C-SLICE.

---

## 64. Động cơ công thức lương — J-HRM-PAY-02-01..08 + J-PAY-01/ATT regression (`PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01` · 2026-08-10)

| Journey | Click / AC summary | Status |
|---------|-------------------|--------|
| **J-HRM-PAY-02-01** | Admin thêm mã thành phần · open catalog · F5 | AC-PAY-02-CATALOG-N+1 · O9 · **DRAFT** |
| **J-HRM-PAY-02-02** | Soạn draft công thức form GĐ1 · **≠** DnD | AC-PAY-02-AUTHOR-DRAFT · O1/O2 · **DRAFT** |
| **J-HRM-PAY-02-03** | Dual publish · 403-DUAL · 412-VARS · F5 active | AC-PAY-02-DUAL-403 · O3/O4 · **DRAFT** |
| **J-HRM-PAY-02-04** | Preview BE · `lines[]` display · **≠** FE net | AC-PAY-02-PREVIEW-BE · O10 · **DRAFT** |
| **J-HRM-PAY-02-05** | Process after PAY-01 closed bind + publish · ATT-412/FORMULA-412 order | AC-PAY-02-PROCESS-ORDER · O5/O6/O16 · **DRAFT** |
| **J-HRM-PAY-02-06** | Gắn mã kỳ/mẫu · AC-PAY-COMP-01 picker | AC-PAY-02-COMP-01 · O8 · **DRAFT** |
| **J-HRM-PAY-02-07** | List → detail formula · scope parity | AC-PAY-02-SCOPE-PARITY · O12 · **DRAFT** |
| **J-HRM-PAY-02-08** | must_keep PAY01QC1+ATT12+ATT11+peers · `payroll_e2e_ready=false` · **≠ PAY-02 DONE** | AC-PAY-02-H · O13–O15 · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 boundary when formula paths touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-ATT-12-07** | Regression ATT-12 seals | **`ATT12QC1`** · **DRAFT** |
| **J-HRM-ATT-07-03..05** | Regression sick · hold · fund-order | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-06-04** | Regression compensatory quỹ | **`ATT06QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · W36 ATT-12 `ATT12QC1-MSMAIGWC1` · W29 ATT-11 `ATT11QC1-MSLXTH9P` · ATT10/09/07/06/05b/CORE07 peer chain · **F-PAY-ATT-CLOSED-01** · **gd1_eval_v1 = C-SLICE** · GĐ2 DnD **OUT**  
**DENY:** GĐ1 DnD requirement · FE net SoT · hardcode formula Nest · open sheet vars · Leave/OT HTTP · claim metadata/jest = PAY-02 DONE · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen J-HRM-PAY-01-* / J-ATT-12-* / J-07-03..05 / J-06-04 · seed · C-SLICE.

---

## 65. Gộp lương giữa kỳ split-month — J-HRM-PAY-04-01..08 + J-PAY-01/02/ATT regression (`PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01` · 2026-08-10)

| Journey | Mô tả ngắn | Trạng thái / AC |
|---------|------------|-----------------|
| **J-HRM-PAY-04-01** | Detect đổi CB giữa kỳ · `split: true` khi có effective trong kỳ | AC-PAY-04-DETECT-CB · O7 · **DRAFT** |
| **J-HRM-PAY-04-02** | N đoạn audit · một `payslip_id` · DV-14 | AC-PAY-04-SEGMENT-DB · O2/O3/O5 · **DRAFT** |
| **J-HRM-PAY-04-03** | Gộp biến tĩnh một lần header | AC-PAY-04-MERGE-STATIC-ONCE · O9 · **DRAFT** |
| **J-HRM-PAY-04-04** | Một phiếu net / NV / kỳ · BR-BP-SPL-01 | AC-PAY-04-ONE-NET · O1 · **DRAFT** |
| **J-HRM-PAY-04-05** | FAIL GTCG kép · **409** `HRM-PAY-SPLIT-409` | AC-PAY-04-SPLIT-409 · O10 · **DRAFT** |
| **J-HRM-PAY-04-06** | Preview một Net + `segments[]` · list→detail | AC-PAY-04-PREVIEW-SEGMENTS · O11 · **DRAFT** |
| **J-HRM-PAY-04-07** | Giờ đoạn closed sheet · hire giữa tháng | AC-PAY-04-CLOSED-HOURS · MID-HIRE · O6/O18 · **DRAFT** |
| **J-HRM-PAY-04-08** | must_keep PAY01+ PAY02+ATT12+ATT11 · **≠ PAY-04 DONE** | AC-PAY-04-H · O13–O15 · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 boundary when split/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula order · COMP · scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-ATT-12-07** | Regression ATT-12 seals | **`ATT12QC1`** · **DRAFT** |
| **J-HRM-ATT-07-03..05** | Regression sick · hold · fund-order | **`ATT07QC1`** · **DRAFT** |
| **J-HRM-ATT-06-04** | Regression compensatory quỹ | **`ATT06QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · W36 ATT-12 `ATT12QC1-MSMAIGWC1` · W29 ATT-11 `ATT11QC1-MSLXTH9P` · ATT10/09/07/06/05b/CORE07 peer chain · **F-PAY-ATT-CLOSED-01** · **gd1_eval_v1 per-segment = C-SLICE** · BR-BP-SPL-02 detail **= PAY-05 HOLD** · GTCG **= PAY-03 HOLD**  
**DENY:** Hai phiếu net · FE merge Net · hardcode ngày 15 · Leave/OT HTTP segment hours · static on segment row · claim paper F-PAY-SPLIT = PAY-04 DONE · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen J-HRM-PAY-01-* / J-HRM-PAY-02-05..07 / J-ATT-12/07/06 · seed · C-SLICE.

---

## 66. Giảm trừ gia cảnh từ hồ sơ GTCG consumer — J-HRM-PAY-03-01..08 + PAY/CORE regression (`PO-HRM-MVP-GD1-PAY-03-CLUSTER-BA-01` · 2026-08-10)

| Journey | Mô tả ngắn | AC / lock |
|---------|------------|-----------|
| **J-HRM-PAY-03-01** | Cập nhật NPT thuế trên hồ sơ · F-CORE-DEP-01 | AC-PAY-03-CORE-DEP-ONE · AUTHZ · **DRAFT** |
| **J-HRM-PAY-03-02** | Process kỳ mở đọc count + GTCG · F5 | AC-PAY-03-COUNT · ASOF · BAG · HEADER · **DRAFT** |
| **J-HRM-PAY-03-03** | Cấm nhập GTCG trên lương · 403 | AC-PAY-03-DENY-MANUAL · **DRAFT** |
| **J-HRM-PAY-03-04** | Con đủ tuổi giữa năm · effective_to | AC-PAY-03-AGE-CUT · **DRAFT** |
| **J-HRM-PAY-03-05** | Split-month GTCG một lần · bind PAY-04 | AC-PAY-03-SPLIT-ONCE · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-03-06** | Preview read-only · list→detail L2.5 | AC-PAY-03-DISPLAY · **DRAFT** |
| **J-HRM-PAY-03-07** | `dependents_count` formula bag · PAY-02 order | AC-PAY-03-BAG · PROCESS-ORDER · **DRAFT** |
| **J-HRM-PAY-03-08** | Seals · honesty · **≠ PAY-03 DONE** | AC-PAY-03-H · O13–O15 · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when GTCG/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula order · COMP · scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/08** | Regression SPLIT-409 · PAY-04 seals | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-CORE-01-03** | Regression dependents ONE SoT path | **CORE-01** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **F-CORE-DEP-01 ONE SoT** · **DV-14** · BR-BP-SPL-02 **= PAY-05 HOLD** · full TNCN **= PAY-06 HOLD**  
**DENY:** Second deps table · manual GTCG payroll · FE GTCG SoT · hardcode 11tr/4.4tr without CFG · segment `gtgc_amount` · claim deps CRUD = PAY-03 DONE · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01/02/04/CORE · seed · C-SLICE.

---

## 67. Trần BH trên tổng hợp kỳ SI ceiling consumer — J-HRM-PAY-05-01..08 + PAY-01/02/03/04 regression (`PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01` · 2026-08-10)

| Journey | Mô tả ngắn | AC / lock |
|---------|------------|-----------|
| **J-HRM-PAY-05-01** | CFG BH active · F-SET-SI RETAIN cite | AC-PAY-05-CFG-SOT · O1 · **DRAFT** |
| **J-HRM-PAY-05-02** | Process · trần một lần trên tổng hợp | AC-PAY-05-BASE · CEILING · HEADER · **DRAFT** |
| **J-HRM-PAY-05-03** | Split-month · `si_*` header only · DV-14 | AC-PAY-05-SPLIT-ONCE · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-05-04** | Cấm nhập trần/SI trên lương | AC-PAY-05-DENY-MANUAL · **DRAFT** |
| **J-HRM-PAY-05-05** | Thiếu rate · **412** SI-412 | AC-PAY-05-412 · **DRAFT** |
| **J-HRM-PAY-05-06** | Preview read-only BH · list→detail | AC-PAY-05-DISPLAY · **DRAFT** |
| **J-HRM-PAY-05-07** | Vào giữa tháng · một trần kỳ | AC-PAY-05-MID-HIRE · **DRAFT** |
| **J-HRM-PAY-05-08** | GTCG chain · seals · **≠ PAY-05 DONE** | AC-PAY-05-GTCG-CHAIN · H · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when SI/process touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula · COMP · scope | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | Regression GTCG static once + order | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | Regression SPLIT-409 · preview · seals | **`PAY04QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **`pay_insurance_rate_cfg`** RETAIN · **BIND PAY-03 GTCG §4.2** · **DV-14** · **BR-BP-SPL-02**  
**DENY:** Per-segment ceiling then sum · second rate master in PAY · manual ceiling/SI on grid · FE SI SoT · `si_*` on segment · claim Settings CFG = PAY-05 DONE · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01/02/03/04 · seed · C-SLICE.

---

## 68. Chạy kỳ lương + TNCN lũy tiến run/TNCN consumer — J-HRM-PAY-06-01..08 + PAY-01..05 regression (`PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01` · 2026-08-10)

**SRS:** FR-UC-BP-PAY-06 · Diễn biến **#1–#7 + FAIL + Thành công** · **AC-PAY-HIRE-01..05** · **BR-BP-LC-04** · **BR-BP-TS-03** · REQ_L_001 · SA Option A (RETAIN enroll/eligibility/process · PAY-01..05 order §4.2 · GAP F-PAY-RUN-01 + F-PAY-TNCN-01 · O19 bracket BE constants C-SLICE · O20–O22 HOLD · LIVE ≠ module DONE · printable false)

| Journey | Mô tả ngắn | AC / lock |
|---------|------------|-----------|
| **J-HRM-PAY-06-01** | `pay_tax_*` settings prereq · F-SET-TAX RETAIN | AC-PAY-06-REGIME · DEDUCT · O9/O10 · **DRAFT** |
| **J-HRM-PAY-06-02** | Eligibility · empty có lý do | AC-PAY-HIRE-01 · AC-PAY-06-EMPTY-REASON · **DRAFT** |
| **J-HRM-PAY-06-03** | Enroll/chạy đợt · FE 2xx + F5 | AC-PAY-HIRE-02/04/05 · **DRAFT** |
| **J-HRM-PAY-06-04** | Process · TNCN một lần sau SI | AC-PAY-06-TAX-BAG · TNCN-ONCE · PROCESS-ORDER · **DRAFT** |
| **J-HRM-PAY-06-05** | 412 thuế · deny manual · no fake success | AC-PAY-06-REGIME · DENY-MANUAL · HIRE-02 · **DRAFT** |
| **J-HRM-PAY-06-06** | Preview tax read-only · list→detail | AC-PAY-06-DISPLAY · HIRE-05 · **DRAFT** |
| **J-HRM-PAY-06-07** | Split mid-hire · tax header once | AC-PAY-06-SPLIT-ONCE · MID-HIRE-TAX-HOLD · **DRAFT** |
| **J-HRM-PAY-06-08** | Seals · honesty · **≠ PAY-06 DONE** | AC-PAY-06-H · MK-PEERS · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when run/tax touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula order · THUE_TNCN_HT | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | Regression GTCG once + order | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | Regression SPLIT-409 · preview · seals | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | Regression SI before TNCN step | **`PAY05QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **PAY-01..05 process order §4.2** · **BIND** GTCG+SI+TNCN static once · **`pay_tax_*`** RETAIN · **`payroll_e2e_ready=false`**  
**DENY:** Enroll/process API alone = PAY-06 DONE · FE net/TNCN SoT · manual tax on grid · per-segment TNCN · reorder pipeline · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01..05 · seed · C-SLICE.

---

## 69. Tất toán nghỉ việc termination settle — J-HRM-PAY-07-01..08 + PAY-01..06 regression (`PO-HRM-MVP-GD1-PAY-07-CLUSTER-BA-01` · 2026-08-10)

**SRS:** FR-UC-BP-PAY-07 · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-TERM-01** · REQ_L_002 · SA Option A (RETAIN F-PAY-PROCESS-01 + PAY-01..06 order §4.2 · GAP F-PAY-TERM-SETTLE-01 · soft TERM case O3 · O19 formula vars C-SLICE · O20–O22 HOLD · READ CORE06/CORE10/ATT · DENY PAY mutate pillars · LIVE ≠ module DONE · printable false)

| Journey | Mô tả ngắn | AC / lock |
|---------|------------|-----------|
| **J-HRM-PAY-07-01** | Checklist nghỉ read-only · peer flags | AC-PAY-TERM-ASSET/SI/LEAVE/RD · SOFT-CASE · **DRAFT** |
| **J-HRM-PAY-07-02** | Closed sheet trước settle · ATT-412 | AC-PAY-TERM-CLOSED-SHEET · **PAY01QC1** · **DRAFT** |
| **J-HRM-PAY-07-03** | Tất toán mutate · FE 2xx + F5 | AC-PAY-TERM-SOT · LIFECYCLE · **DRAFT** |
| **J-HRM-PAY-07-04** | Final process · is_final_pay · formula lines | AC-PAY-TERM-FINAL-PAYSLIP · TNCN-ONCE · **DRAFT** |
| **J-HRM-PAY-07-05** | 409 checklist · deny manual · no CORE/ATT mutate | AC-PAY-TERM-409 · DENY-MANUAL · **DRAFT** |
| **J-HRM-PAY-07-06** | Preview read-only · list→detail | AC-PAY-TERM-DISPLAY · **DRAFT** |
| **J-HRM-PAY-07-07** | Nghỉ giữa kỳ · split · static once | AC-PAY-TERM-MID-MONTH · **PAY04QC1** · **DRAFT** |
| **J-HRM-PAY-07-08** | Seals · honesty · **≠ PAY-07 DONE** | AC-PAY-TERM-H · MK-PEERS · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when term touches process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula · term vars | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | Regression GTCG once | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | Regression SPLIT · preview | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | Regression SI final period | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | Regression TNCN once on final | **`PAY06QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`CORE06QC1-MSLID363`** · **`CORE10QC1-MSLP0EJB`** · ATT peer chain · **PAY-01..06 process order §4.2** · **READ** CORE/ATT · **`payroll_e2e_ready=false`**  
**DENY:** Process API alone = PAY-07 DONE · PAY cut BH / mutate leave / asset return · FE manual severance/leave payout · per-segment static GTCG/SI/TNCN · reorder pipeline · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01..06 · seed · C-SLICE.

---

## 70. Phiếu lương preview / ESS / trạng thái TT — J-HRM-PAY-08-01..08 + PAY-01..07 regression (`PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01` · 2026-08-10)

**SRS:** FR-UC-BP-PAY-08 · Luồng **#1–#4** · Diễn biến **#1–#2 + Thành công** · **BR-BP-PAY-03** · **BR-BP-SLIP-01** · REQ_L_005 · SA Option A (RETAIN F-PAY-PROCESS-01 + PAY-01..07 order §4.2 · GAP F-PAY-PAYSLIP-01 · void O22 PAY-07 peer · O11–O12–O15–O19–O20 HOLD · LIVE GET/ESS ≠ module DONE · printable false)

| Journey | Mô tả ngắn | AC / lock |
|---------|------------|-----------|
| **J-HRM-PAY-08-01** | C&B preview calculated · read-only enrich | AC-PAY-SLIP-CALC-SOT · DISPLAY · **DRAFT** |
| **J-HRM-PAY-08-02** | Phát hành · FE 2xx + F5 | AC-PAY-SLIP-PREVIEW-PUBLISH · **DRAFT** |
| **J-HRM-PAY-08-03** | Cập nhật payment_status | AC-PAY-SLIP-PAY-STATUS · **DRAFT** |
| **J-HRM-PAY-08-04** | ESS self + confirm published | AC-PAY-SLIP-ESS-CONFIRM · ESS-SECURITY · **DRAFT** |
| **J-HRM-PAY-08-05** | 403/404/409 · deny amount PATCH · lock | AC-PAY-SLIP-DENY-MANUAL · PERIOD-LOCK · **DRAFT** |
| **J-HRM-PAY-08-06** | List→detail · is_final_pay badge | AC-PAY-SLIP-DISPLAY · SCOPE-PARITY · **DRAFT** |
| **J-HRM-PAY-08-07** | Void O22 sau đã TT | AC-PAY-SLIP-VOID · **DRAFT** |
| **J-HRM-PAY-08-08** | Seals · honesty · **≠ PAY-08 DONE** | AC-PAY-SLIP-H · MK-PEERS · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when payslip touched | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula order | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | Regression GTCG on payslip | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | Regression segments + net | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | Regression SI display | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | Regression process writer + TNCN | **`PAY06QC1`** · **DRAFT** |
| **J-HRM-PAY-07-01..08** | Regression final pay + void peer | **`PAY07QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** · **`PAY02QC1-MSMC4GWC1`** · **`PAY03QC1-MSMDDGWC1`** · **`PAY04QC1-MSMCR4GWC1`** · **`PAY05QC1-MSMDU2GWC1`** · **`PAY06QC1-MSMECGWC1`** · **`PAY07QC1-MSMEY7GWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **PAY-01..07 process order §4.2** · **`payroll_e2e_ready=false`**  
**DENY:** GET payslip alone = PAY-08 DONE · FE net/gross SoT · ESS colleague leak · amount PATCH on payslip · reorder pipeline · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01..07 · seed · C-SLICE.

---

## 71. Phân nhóm bảng lương — J-HRM-PAY-09-01..08 + PAY-01..08 regression (`PO-HRM-MVP-GD1-PAY-09-CLUSTER-BA-01` · 2026-08-10)

**SRS:** FR-UC-BP-PAY-09 · Luồng **#1–#3** · Diễn biến **#1–#2 + Thành công** · **BR-BP-PAY-04** (alias SRS **BR-BP-PAY-GRP-01**) · REQ_L_006 · SA Option A (RETAIN PAY-01..08 order §4.2 · GAP F-PAY-GROUP-01 · BIND PAY-04 mid-month · PAY-02 formula · PAY-08 read labels · O19–O20 HOLD wire/AMIS · **≠** hardcode four groups · **≠** payslip lifecycle PATCH · printable false)

| Journey | Slice | AC / lock |
|---------|-------|-----------|
| **J-HRM-PAY-09-01** | CRUD catalog tenant | AC-PAY-GROUP-CATALOG-SOT · RETIRE · **DRAFT** |
| **J-HRM-PAY-09-02** | Rule resolve + priority | AC-PAY-GROUP-RESOLVE · EXPLICIT-LIST · **DRAFT** |
| **J-HRM-PAY-09-03** | Period scope + enroll filter | AC-PAY-GROUP-PERIOD-SCOPE · ENROLL-FILTER · **DRAFT** |
| **J-HRM-PAY-09-04** | Report/list filter by group | AC-PAY-GROUP-REPORT-FILTER · **DRAFT** |
| **J-HRM-PAY-09-05** | Snapshot + display on payslip | AC-PAY-GROUP-SNAPSHOT · DISPLAY · **DRAFT** |
| **J-HRM-PAY-09-06** | Mid-month → PAY-04 split | AC-PAY-GROUP-MID-MONTH · **DRAFT** |
| **J-HRM-PAY-09-07** | 409 dual · retired · deny hardcode | AC-PAY-GROUP-DUAL-409 · **DRAFT** |
| **J-HRM-PAY-09-08** | Seals · honesty · **≠ PAY-09 DONE** | AC-PAY-GROUP-H · MK-PEERS · **DRAFT** |
| **J-HRM-PAY-01-01/02/04/06** | Regression PAY-01 when group touches process | **`PAY01QC1`** · **DRAFT** |
| **J-HRM-PAY-02-05..07** | Regression formula order | **`PAY02QC1`** · **DRAFT** |
| **J-HRM-PAY-03-01..08** | Regression GTCG on payslip | **`PAY03QC1`** · **DRAFT** |
| **J-HRM-PAY-04-05/06/08** | Regression segments + mid-month | **`PAY04QC1`** · **DRAFT** |
| **J-HRM-PAY-05-01..08** | Regression SI display | **`PAY05QC1`** · **DRAFT** |
| **J-HRM-PAY-06-01..08** | Regression process writer + TNCN | **`PAY06QC1`** · **DRAFT** |
| **J-HRM-PAY-07-01..08** | Regression final pay read | **`PAY07QC1`** · **DRAFT** |
| **J-HRM-PAY-08-01..08** | Regression payslip lifecycle + group label | **`PAY08QC1`** · **DRAFT** |

**must_keep:** **`PAY01QC1-MSMBGWC1`** … **`PAY08QC1-MSMFFXGWC1`** · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · ATT peer chain · **PAY-01..08 process order §4.2** · **`payroll_e2e_ready=false`**  
**DENY:** CRUD stub alone = PAY-09 DONE · hardcode VP/KD/TX/VH · PAY-09 PATCH payslip amounts/publish/TT · FE group/net SoT · reorder pipeline · flip `payroll_e2e_ready` · PAY module UAT · merge buckets · `att_leave_hold` · reopen sealed J-PAY-01..08 · seed · C-SLICE.

---

## 72. Cài đặt HRM — open fidelity AC (`BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` · 2026-08-11)

**SoT:** `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6–§8 · seals `SETW3MUTQC1` · `SETFIDQC1` · `ATTLVTSOTQC1` · `settings_catalog_e2e_ready=false`

| Journey / UF | Slice | AC / lock |
|--------------|-------|-----------|
| **UF-CTR-DEPT-CATALOG-PICKER** | Contracts create dept | **AC-SET-CONSUMER-DEPT-CTR-01 CLOSED** · **BR-SET-CONSUMER-DEPT-REG-01** regression |
| **UF-HRM-10** (full matrix) | Catalog consumers | **BR-SET-CONSUMER-MATRIX-01 OPEN** · sealed legs dept/REC-CH/CTR/ET/WH/LV-ATT/JG-REC/**PT-PAY** (`PTPAYQC1`) · PATCH/cross-tab residual |
| **J-HRM-PAY-E2-01** | Payroll TP bản chất | **AC-SET-CONSUMER-PT-PAY-01 CLOSED** `PTPAYQC1-MSNPHTECQC1` · carry PATCH browser |
| **J-HRM-JD-05** | YCTD picker | **AC-JD-SET-LIST-06** · **DRAFT** until JD mutate QA |
| **AC-JD-SET-LIST-01..08** | Thư viện JD Settings | **OPEN** · `PO-HRM-JD-IA-LIST-DETAIL-FE-01` |
| **QA-PO-HRM-SETTINGS-W3-BROWSER-01** | W3 sweep boundary | **AC-SWEEP-BOUNDARY-01..02** · IN SWEEP ≠ SEALED 8-tab |

**must_keep:** **SETW3MUTQC1** (8 mutate tabs) · **ATTLVTSOTQC1** · **SETFIDQC1** P1+dept · **DENY** reopen 8-tab / ATT LVT mutate QA · **DENY** `settings_catalog_e2e_ready` flip · C-SLICE.

---

*Prior cycle:* `PILOT-ZERO-DEFECT-01` (2026-05-22) — cùng file, mở rộng S0 `P1-S0-BA-P-01`.*
